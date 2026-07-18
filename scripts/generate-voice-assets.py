#!/usr/bin/env python3
# ============================================================================
# Valeria+ · Generador de assets de voz neuronal — V2 (multi-idioma, incremental)
#   python3 scripts/generate-voice-assets.py --lang es
#   python3 scripts/generate-voice-assets.py --lang gl
#
# Consume voice-corpus.json (scripts/export-voice-corpus.js), filtra por
# idioma y sintetiza SOLO las locuciones sin asset (incremental: regenerar no
# reescribe lo ya sintetizado → sin churn en git). Deja assets/voice/<id>.m4a
# y voice-assets-manifest.<lang>.json; después scripts/build-voice-asset-map.js
# regenera src/valeriaVoiceAssets.ts. Corre en CI (voice-assets.yml): los
# modelos JAMÁS corren en la app.
#
# Voces (decisión de producto, jul 2026):
#   · gl → «Celtia» do Proxecto Nós (VITS grafemas, motor coqui-tts). Los
#     ficheros del checkpoint se descubren vía API de Hugging Face para no
#     acoplarse a nombres internos del repo.
#   · es → «Sharvard» femenina (rhasspy/piper-voices): VITS femenina abierta,
#     homóloga de Celtia en castellano.
#
# Masterización: pico a -3 dBFS (la Pista B de babble va a -6 dBFS: la voz
# conserva +3 dB y la suma no satura). Estilos del corpus:
#   · piper: length_scale nativo (tutor 1.0 · child 1.05 · clinical 1.15 · slow 1.6)
#   · coqui: atempo de ffmpeg equivalente (sin re-pitch), tras normalizar.
# ============================================================================
import argparse
import audioop
import json
import os
import subprocess
import sys
import urllib.request
import wave
from pathlib import Path

# Token de Hugging Face (secret HF_TOKEN en Actions): imprescindible para
# modelos "gated" como los de proxectonos — sin él, la descarga devuelve 401.
HF_TOKEN = os.environ.get("HF_TOKEN", "").strip()

ROOT = Path(__file__).resolve().parent.parent
CORPUS = ROOT / "voice-corpus.json"
OUT_DIR = ROOT / "assets" / "voice"
VOICES_DIR = ROOT / "scripts" / ".voices"  # modelos descargados (gitignored)

PEAK_DBFS = -3.0
AAC_BITRATE = "40k"

LENGTH_SCALE = {"tutor": 1.0, "child": 1.05, "clinical": 1.15, "slow": 1.6}

VOICES = {
    "es": {
        "engine": "piper",
        "name": "es_ES-sharvard-medium",
        "label": "Sharvard (femenina) · rhasspy/piper-voices",
        "urls": [
            "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx",
            "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx.json",
        ],
    },
    "gl": {
        "engine": "coqui",
        "name": "celtia",
        "label": "Celtia · Proxecto Nós (proxectonos)",
        # Candidatos por orden de preferencia; el primero que responda en la
        # API de HF gana. VITS de grafemas: sin fonemizador externo.
        "hf_repos": [
            "proxectonos/Nos_TTS-celtia-vits-graphemes",
            "proxectonos/nos_tts-celtia-vits-graphemes",
        ],
    },
}


def die(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def manifest_path(lang: str) -> Path:
    return ROOT / f"voice-assets-manifest.{lang}.json"


def curl(url: str, dest: Path) -> None:
    if dest.exists() and dest.stat().st_size > 0:
        return
    print(f"↓ {url}")
    auth = ["-H", f"Authorization: Bearer {HF_TOKEN}"] if HF_TOKEN and "huggingface.co" in url else []
    try:
        subprocess.run(["curl", "-fsSL", *auth, "-o", str(dest), url], check=True)
    except subprocess.CalledProcessError:
        die(
            f"Descarga fallida: {url}\n"
            "Si es un modelo 'gated' de Hugging Face (p. ej. Celtia de proxectonos):\n"
            "  1) inicia sesión en HF y ACEPTA las condiciones en la página del modelo,\n"
            "  2) crea un token de lectura (Settings → Access Tokens),\n"
            "  3) añádelo como secret HF_TOKEN del repositorio (Settings → Secrets → Actions).",
        )


# ---------------------------------------------------------------- audio común
def to_s16_wav(src: Path, dst: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
         "-ac", "1", "-sample_fmt", "s16", str(dst)],
        check=True,
    )


def normalize_peak(wav_in: Path, wav_out: Path) -> float:
    with wave.open(str(wav_in), "rb") as r:
        params = r.getparams()
        if params.sampwidth != 2:
            die(f"{wav_in}: se esperaba PCM de 16 bits")
        frames = r.readframes(params.nframes)
    peak = audioop.max(frames, 2) or 1
    target = int(32767 * (10 ** (PEAK_DBFS / 20)))
    frames = audioop.mul(frames, 2, target / peak)
    with wave.open(str(wav_out), "wb") as w:
        w.setparams(params)
        w.writeframes(frames)
    return params.nframes / params.framerate


def encode_m4a(wav: Path, m4a: Path, atempo: float | None = None) -> None:
    af = ["-af", f"atempo={atempo:.4f}"] if atempo and abs(atempo - 1.0) > 1e-3 else []
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), *af,
         "-c:a", "aac", "-b:a", AAC_BITRATE, "-movflags", "+faststart", str(m4a)],
        check=True,
    )


# ------------------------------------------------------------------ motores
def make_piper_synth(voice: dict):
    from piper import PiperVoice, SynthesisConfig  # pip install piper-tts

    VOICES_DIR.mkdir(parents=True, exist_ok=True)
    for url in voice["urls"]:
        curl(url, VOICES_DIR / url.rsplit("/", 1)[1])
    onnx = VOICES_DIR / f"{voice['name']}.onnx"

    # Voces multi-hablante: se elige la hablante femenina (paridad con Celtia).
    cfg = json.loads(onnx.with_suffix(".onnx.json").read_text())
    speaker = None
    if int(cfg.get("num_speakers", 1)) > 1:
        id_map = cfg.get("speaker_id_map") or {}
        speaker = next((int(v) for k, v in id_map.items()
                        if k.lower().startswith(("f", "female", "muller", "mujer"))), 0)
    print(f"Voz: {voice['label']} · hablante={speaker if speaker is not None else 'única'}")
    pv = PiperVoice.load(str(onnx))

    def synth(text: str, style: str, raw_wav: Path) -> float | None:
        sc = SynthesisConfig(length_scale=LENGTH_SCALE.get(style, 1.0), speaker_id=speaker)
        with wave.open(str(raw_wav), "wb") as w:
            pv.synthesize_wav(text, w, syn_config=sc)
        return None  # estilo ya horneado: sin atempo posterior

    return synth


def make_coqui_synth(voice: dict):
    from TTS.api import TTS  # pip install coqui-tts (torch CPU)

    # Descubrimiento de ficheros del checkpoint vía API de HF: el repo de Nós
    # puede nombrar el .pth/.json como quiera sin romper esta tubería.
    repo, siblings = None, []
    for cand in voice["hf_repos"]:
        try:
            req = urllib.request.Request(f"https://huggingface.co/api/models/{cand}")
            if HF_TOKEN:
                req.add_header("Authorization", f"Bearer {HF_TOKEN}")
            with urllib.request.urlopen(req, timeout=30) as r:
                siblings = [s["rfilename"] for s in json.load(r).get("siblings", [])]
            repo = cand
            break
        except Exception as e:
            print(f"aviso: {cand} no accesible ({e})")
    if not repo:
        die(f"Ningún repo de Celtia accesible en HF: {voice['hf_repos']}")

    model_file = next((f for f in siblings if f.endswith((".pth", ".pth.tar", ".ckpt"))), None)
    config_file = next((f for f in siblings if f.endswith("config.json")), None)
    if not model_file or not config_file:
        die(f"{repo}: no encuentro checkpoint/config entre {siblings}")

    vdir = VOICES_DIR / voice["name"]
    vdir.mkdir(parents=True, exist_ok=True)
    model = vdir / Path(model_file).name
    config = vdir / Path(config_file).name
    curl(f"https://huggingface.co/{repo}/resolve/main/{model_file}", model)
    curl(f"https://huggingface.co/{repo}/resolve/main/{config_file}", config)
    print(f"Voz: {voice['label']} · {repo} ({Path(model_file).name})")
    tts = TTS(model_path=str(model), config_path=str(config), progress_bar=False)

    def synth(text: str, style: str, raw_wav: Path) -> float | None:
        tts.tts_to_file(text=text, file_path=str(raw_wav))
        # Estilo por post-proceso: atempo < 1 ralentiza sin cambiar el pitch.
        scale = LENGTH_SCALE.get(style, 1.0)
        return (1.0 / scale) if scale != 1.0 else None

    return synth


# -------------------------------------------------------------------- main
def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="es", choices=sorted(VOICES))
    args = ap.parse_args()
    voice = VOICES[args.lang]

    if not CORPUS.exists():
        die("Falta voice-corpus.json — ejecuta antes: node scripts/export-voice-corpus.js")
    all_entries = json.loads(CORPUS.read_text())["corpus"]
    entries = [e for e in all_entries if e.get("lang", "es") == args.lang]
    if not entries:
        die(f"El corpus no tiene entradas '{args.lang}'.")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    missing = [e for e in entries if not (OUT_DIR / f"{e['id']}.m4a").exists()]
    print(f"Corpus {args.lang}: {len(entries)} locuciones · {len(missing)} sin asset")
    if not missing:
        print("Al día: nada que sintetizar (manifiesto intacto).")
        return

    synth = make_piper_synth(voice) if voice["engine"] == "piper" else make_coqui_synth(voice)

    # Manifiesto incremental: conserva las entradas previas del idioma.
    mpath = manifest_path(args.lang)
    old = {f["id"]: f for f in (json.loads(mpath.read_text()).get("files", []) if mpath.exists() else [])}

    raw = OUT_DIR / "_raw.wav"
    s16 = OUT_DIR / "_s16.wav"
    for i, e in enumerate(missing):
        m4a = OUT_DIR / f"{e['id']}.m4a"
        atempo = synth(e["text"], e["style"], raw)
        to_s16_wav(raw, s16)
        seconds = normalize_peak(s16, s16)
        encode_m4a(s16, m4a, atempo)
        if atempo:
            seconds /= atempo  # duración final tras el atempo
        old[e["id"]] = {"id": e["id"], "file": m4a.name, "seconds": round(seconds, 2), "bytes": m4a.stat().st_size}
        if (i + 1) % 25 == 0:
            print(f"  {i + 1}/{len(missing)}")
    raw.unlink(missing_ok=True)
    s16.unlink(missing_ok=True)

    files = [old[e["id"]] for e in entries if e["id"] in old]
    total = sum(f["bytes"] for f in files)
    secs = sum(f["seconds"] for f in files)
    mpath.write_text(json.dumps({
        "lang": args.lang, "voice": voice["label"], "peakDbfs": PEAK_DBFS,
        "entries": len(files), "totalBytes": total, "totalSeconds": round(secs, 1),
        "files": files,
    }, indent=1))
    print(f"OK → {len(missing)} nuevas · total {args.lang}: {len(files)} assets · {secs / 60:.1f} min · {total / 1e6:.1f} MB")


if __name__ == "__main__":
    main()

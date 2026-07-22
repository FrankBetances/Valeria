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
#   · coqui (gl): length_scale nativo del VITS + prosodia controlada (troceo
#     propio por frases y pausas cortas constantes; ver make_coqui_synth V2).
#     Fallback atempo solo si el modelo no expone length_scale.
#   · ahotts (eu): atempo de ffmpeg equivalente (sin re-pitch), tras normalizar.
# ============================================================================
import argparse
import audioop
import json
import os
import shlex
import shutil
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
    "eu": {
        "engine": "ahotts",
        "name": "maider",
        "label": "AhoTTS euskera «Maider» · HiTZ/Aholab (ILENIA/NEL-GAITU, CC BY 4.0)",
        # Voz vasca del centro HiTZ (UPV/EHU · Aholab). El vits.onnx NO se infiere
        # suelto: AhoTTS (github.com/hitz-zentroa/aHoTTS) lo ejecuta a través de su
        # binario `tts` con el frontend lingüístico vasco + diccionario (eu_dicc),
        # que genera los FONEMAS que el VITS espera. El modelo se descarga de HF
        # con huggingface_hub (resuelve LFS). Voz femenina; respaldo Antton.
        "hf_repos": [
            "HiTZ/TTS-eu_maider",
            "HiTZ/TTS-eu_antton",
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
    """Celtia (gl) con PROSODIA CONTROLADA — V2.

    La V1 usaba tts_to_file(texto completo): el Synthesizer de coqui trocea por
    frases (pysbd) y concatena insertando ~0,45 s de silencio MUERTO tras cada
    una; además el estilo se aplicaba con atempo posterior, que estiraba esos
    silencios (slow: ×1,6 → pausas de ~0,7 s). Resultado: pausas que rompen el
    ritmo (reporte de campo gl, jul 2026). Ahora:
      1) el estilo se hornea en el length_scale NATIVO del VITS (sin atempo:
         las pausas no se estiran y no hay artefactos de resampleo);
      2) el troceo por frases es nuestro, cada frase se sintetiza aislada y se
         recortan sus silencios de borde;
      3) las frases se unen con una pausa corta y constante (PAUSE_SEC), la
         respiración natural de la locutora en vez del hueco del motor."""
    import re

    import numpy as np
    from TTS.api import TTS  # pip install coqui-tts (torch CPU)

    # Descubrimiento de ficheros del checkpoint vía API de HF: el repo de Nós
    # puede nombrar el .pth/.json como quiera sin romper esta tubería.
    repo, siblings = _hf_discover(voice["hf_repos"])

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

    sr = int(tts.synthesizer.output_sample_rate)
    vits = getattr(tts.synthesizer, "tts_model", None)
    native_scale = vits is not None and hasattr(vits, "length_scale")
    print(f"[prosodia] sr={sr} · length_scale nativo={'sí' if native_scale else 'no (fallback atempo)'}")

    SENT_SPLIT = re.compile(r"(?<=[.!?…:])\s+")
    PAUSE_SEC = 0.16   # respiración entre frases en el audio FINAL
    EDGE_KEEP = 0.04   # margen conservado al recortar silencios de borde
    PAD_SEC = 0.05     # colchón de arranque/cierre de la locución

    def trim_edges(wav: "np.ndarray") -> "np.ndarray":
        # Recorte por umbral relativo (-40 dB del pico) con margen EDGE_KEEP:
        # quita el silencio del motor sin comerse ataques ni fricativas finales.
        if wav.size == 0:
            return wav
        thr = float(np.max(np.abs(wav))) * (10 ** (-40 / 20))
        idx = np.where(np.abs(wav) > thr)[0]
        if idx.size == 0:
            return wav
        keep = int(sr * EDGE_KEEP)
        return wav[max(0, int(idx[0]) - keep):min(wav.size, int(idx[-1]) + keep)]

    def synth(text: str, style: str, raw_wav: Path) -> float | None:
        scale = LENGTH_SCALE.get(style, 1.0)
        atempo = None
        if native_scale:
            vits.length_scale = scale  # estilo horneado en el propio VITS
        elif scale != 1.0:
            atempo = 1.0 / scale  # fallback: post-proceso como antes
        # La pausa insertada se compensa si luego hay atempo, para que la
        # respiración FINAL sea siempre ~PAUSE_SEC, también en estilo slow.
        pause = np.zeros(int(sr * PAUSE_SEC * (atempo or 1.0)), dtype=np.float32)
        pad = np.zeros(int(sr * PAD_SEC * (atempo or 1.0)), dtype=np.float32)

        sentences = [s.strip() for s in SENT_SPLIT.split(text.strip()) if s.strip()]
        chunks: list = [pad]
        for i, sent in enumerate(sentences):
            wav = np.asarray(tts.tts(text=sent, split_sentences=False), dtype=np.float32)
            chunks.append(trim_edges(wav))
            chunks.append(pause if i < len(sentences) - 1 else pad)
        out = np.concatenate(chunks)
        pcm = (np.clip(out, -1.0, 1.0) * 32767.0).astype("<i2")
        with wave.open(str(raw_wav), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sr)
            w.writeframes(pcm.tobytes())
        return atempo

    return synth


def _hf_discover(repos: list[str]) -> tuple[str, list[str]]:
    """Devuelve (repo, ficheros) del primer repo de HF accesible."""
    for cand in repos:
        try:
            req = urllib.request.Request(f"https://huggingface.co/api/models/{cand}")
            if HF_TOKEN:
                req.add_header("Authorization", f"Bearer {HF_TOKEN}")
            with urllib.request.urlopen(req, timeout=30) as r:
                sib = [s["rfilename"] for s in json.load(r).get("siblings", [])]
            return cand, sib
        except Exception as e:
            print(f"aviso: {cand} no accesible ({e})")
    die(f"Ningún repo accesible en HF: {repos}")


def make_ahotts_synth(voice: dict):
    """Voz vasca de HiTZ vía AhoTTS (github.com/hitz-zentroa/aHoTTS). El binario
    `tts` hace el frontend lingüístico + G2P (diccionario eu_dicc) y alimenta el
    VITS (vits.onnx, descargado de HF). Replica el comando de synthesize.py:

        echo TEXT | iconv -f UTF-8 -t ISO-8859-1 | \
          ./ahotts/tts -Lang=eu -Method=Vits -HDic=./ahotts/dicts/eu/eu_dicc \
          -voice_path=./ahotts/voices/eu/<model> OUT.wav

    El repo (con el binario y los diccionarios) lo clona el workflow y expone su
    ruta en AHOTTS_DIR. El estilo (tutor/child/clinical/slow) se aplica por
    atempo posterior, como en coqui (AhoTTS no expone length_scale por CLI)."""
    aho = Path(os.environ.get("AHOTTS_DIR", str(ROOT / "scripts" / ".ahotts")))
    tts_bin = aho / "ahotts" / "tts"
    hdic = aho / "ahotts" / "dicts" / "eu" / "eu_dicc"
    model = voice["name"]
    voice_dir = aho / "ahotts" / "voices" / "eu" / model
    onnx = voice_dir / "vits.onnx"
    if not tts_bin.exists():
        die(f"No encuentro el binario AhoTTS en {tts_bin}. El workflow debe clonar "
            "github.com/hitz-zentroa/aHoTTS y exportar AHOTTS_DIR.")
    os.chmod(tts_bin, 0o755)
    print(f"[diag] AhoTTS bin: {tts_bin}")
    subprocess.run(f'ldd "{tts_bin}" || true', shell=True)  # revela libs faltantes

    if not onnx.exists():
        from huggingface_hub import hf_hub_download  # pip install huggingface_hub
        voice_dir.mkdir(parents=True, exist_ok=True)
        got = None
        for repo in voice["hf_repos"]:
            try:
                p = hf_hub_download(repo_id=repo, filename="vits.onnx",
                                    token=HF_TOKEN or None)
                shutil.copy2(p, onnx)
                got = repo
                break
            except Exception as e:
                print(f"aviso: {repo} no accesible ({e})")
        if not got:
            die(f"No pude descargar vits.onnx de {voice['hf_repos']}")
        print(f"Voz: {voice['label']} · modelo de {got}")

    def synth(text: str, style: str, raw_wav: Path) -> float | None:
        # AhoTTS lee el texto de stdin en ISO-8859-1 y escribe el WAV de salida.
        cmd = (f'echo {shlex.quote(text)} | iconv -f UTF-8 -t ISO-8859-1//TRANSLIT | '
               f'./ahotts/tts -Lang=eu -Method=Vits '
               f'-HDic=./ahotts/dicts/eu/eu_dicc '
               f'-voice_path=./ahotts/voices/eu/{model} {shlex.quote(str(raw_wav))}')
        subprocess.run(cmd, shell=True, check=True, cwd=str(aho))
        if not raw_wav.exists() or raw_wav.stat().st_size < 128:
            raise RuntimeError(f"AhoTTS no generó audio para: {text!r}")
        scale = LENGTH_SCALE.get(style, 1.0)
        return (1.0 / scale) if scale != 1.0 else None

    return synth


def make_onnx_synth(voice: dict):
    """VITS de grafemas exportado a ONNX (formato HiTZ/Aholab: vits.onnx +
    config.json de coqui). Inferencia con onnxruntime, sin torch ni coqui.

    Como HF está bloqueado en el entorno de desarrollo, este motor IMPRIME el
    esquema real del config y la firma del ONNX en el log de CI (diagnóstico) y
    protege contra audio-basura: si la tokenización no encaja con el modelo
    (tamaño de vocabulario) o la duración es implausible, aborta ESE ítem sin
    escribirlo, en vez de hornear ruido y darlo por bueno."""
    import numpy as np
    import onnxruntime as ort

    repo, siblings = _hf_discover(voice["hf_repos"])
    onnx_file = next((f for f in siblings if f.endswith(".onnx")), None)
    config_file = next((f for f in siblings if f.endswith("config.json")), None)
    if not onnx_file or not config_file:
        die(f"{repo}: no encuentro .onnx/config.json entre {siblings}")

    vdir = VOICES_DIR / voice["name"]
    vdir.mkdir(parents=True, exist_ok=True)
    onnx_path = vdir / Path(onnx_file).name
    cfg_path = vdir / Path(config_file).name
    curl(f"https://huggingface.co/{repo}/resolve/main/{onnx_file}", onnx_path)
    curl(f"https://huggingface.co/{repo}/resolve/main/{config_file}", cfg_path)

    # ---- Diagnóstico (imprescindible: HF no es accesible en desarrollo) ----
    print(f"Voz: {voice['label']} · {repo} ({Path(onnx_file).name})")
    raw = cfg_path.read_text(errors="replace")
    print(f"[diag] config.json {len(raw)} bytes · head: {raw[:200]!r}")
    if not raw.lstrip().startswith("{"):
        # No es JSON: normalmente un puntero Git LFS ("version https://git-lfs…")
        # o una página HTML de acceso restringido (modelo gated sin aceptar).
        die(f"{repo}/{config_file} no es JSON (¿LFS o gated?). "
            f"Descarga la versión 'media' con ?download=true o acepta el modelo en HF.")
    cfg = json.loads(raw)
    print(f"[diag] config keys: {list(cfg.keys())}")
    chars = cfg.get("characters", {})
    print(f"[diag] characters block: {json.dumps(chars, ensure_ascii=False)[:600]}")
    print(f"[diag] use_phonemes={cfg.get('use_phonemes')} add_blank={cfg.get('add_blank')} "
          f"sample_rate={(cfg.get('audio') or {}).get('sample_rate') or cfg.get('sample_rate')}")

    sess = ort.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    in_names = [i.name for i in sess.get_inputs()]
    print(f"[diag] onnx inputs: {[(i.name, i.shape) for i in sess.get_inputs()]}")
    print(f"[diag] onnx outputs: {[o.name for o in sess.get_outputs()]}")

    sr = int((cfg.get("audio") or {}).get("sample_rate") or cfg.get("sample_rate") or 22050)

    if cfg.get("use_phonemes") or "phoneme_id_map" in cfg:
        die("modelo eu con fonemas (espeak): pendiente de fonemizador; pega el "
            "config para finalizar. Diagnóstico impreso arriba.")

    # Vocabulario de grafemas (orden por defecto de coqui BaseCharacters):
    # [pad, eos, bos, blank] + characters + punctuations.
    pad = chars.get("pad", "<PAD>"); eos = chars.get("eos", "<EOS>")
    bos = chars.get("bos", "<BOS>"); blank = chars.get("blank", "<BLNK>")
    vocab = [pad, eos, bos, blank] + list(chars.get("characters", "")) + list(chars.get("punctuations", ""))
    cid = {c: i for i, c in enumerate(vocab)}
    blank_id = cid.get(blank, 0)
    add_blank = bool(cfg.get("add_blank", True))
    # Contraste con el tamaño real de la tabla de embedding del ONNX: si no
    # cuadra, la tokenización está desalineada → abortar (no hornear basura).
    emb = next((i for i in sess.get_inputs() if i.name in ("input", "x")), sess.get_inputs()[0])
    print(f"[diag] vocab construido: {len(vocab)} símbolos · add_blank={add_blank} · blank_id={blank_id}")

    def to_ids(text: str) -> list[int]:
        seq = [cid[c] for c in text.lower() if c in cid]
        if add_blank:  # intersperse: [blank, s0, blank, s1, ..., blank]
            out = [blank_id]
            for s in seq:
                out += [s, blank_id]
            return out
        return seq

    def synth(text: str, style: str, raw_wav: Path) -> float | None:
        ids = to_ids(text)
        if len(ids) < 3:
            raise RuntimeError(f"tokenización vacía para: {text!r}")
        x = np.array([ids], dtype=np.int64)
        xl = np.array([x.shape[1]], dtype=np.int64)
        # scales = [noise_scale, length_scale, noise_scale_dp]. El estilo se
        # hornea en el length_scale nativo del VITS (sin re-pitch), como piper.
        scales = np.array([0.667, LENGTH_SCALE.get(style, 1.0), 0.8], dtype=np.float32)
        feeds = {}
        for nm in in_names:
            if nm in ("input", "x"): feeds[nm] = x
            elif nm in ("input_lengths", "x_lengths"): feeds[nm] = xl
            elif nm == "scales": feeds[nm] = scales
            elif nm in ("sid", "speaker_id"): feeds[nm] = np.array([0], dtype=np.int64)
            elif nm in ("langid", "language_id"): feeds[nm] = np.array([0], dtype=np.int64)
        wav = np.squeeze(sess.run(None, feeds)[0]).astype(np.float32)
        # Guarda anti-basura: NaN/silencio o duración implausible (fuera de
        # 0,15–2,5 s por palabra) → item descartado, no se escribe.
        words = max(1, len(text.split()))
        dur = len(wav) / sr
        if not np.isfinite(wav).all() or float(np.max(np.abs(wav))) < 1e-3:
            raise RuntimeError(f"salida no válida (silencio/NaN) para: {text!r}")
        if not (0.12 * words <= dur <= 3.0 * words + 1.0):
            raise RuntimeError(f"duración implausible {dur:.2f}s ({words} palabras): {text!r}")
        pcm = np.clip(wav, -1.0, 1.0)
        pcm = (pcm * 32767.0).astype("<i2")
        with wave.open(str(raw_wav), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
            w.writeframes(pcm.tobytes())
        return None  # length_scale nativo: sin atempo posterior

    return synth


ENGINES = {
    "piper": make_piper_synth,
    "coqui": make_coqui_synth,
    "onnx": make_onnx_synth,
    "ahotts": make_ahotts_synth,
}


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

    synth = ENGINES[voice["engine"]](voice)

    # Manifiesto incremental: conserva las entradas previas del idioma.
    mpath = manifest_path(args.lang)
    old = {f["id"]: f for f in (json.loads(mpath.read_text()).get("files", []) if mpath.exists() else [])}

    raw = OUT_DIR / "_raw.wav"
    s16 = OUT_DIR / "_s16.wav"
    skipped = 0
    for i, e in enumerate(missing):
        m4a = OUT_DIR / f"{e['id']}.m4a"
        try:
            atempo = synth(e["text"], e["style"], raw)
            to_s16_wav(raw, s16)
            seconds = normalize_peak(s16, s16)
            encode_m4a(s16, m4a, atempo)
        except Exception as err:
            # Ítem descartado (guarda anti-basura / tokenización): NO se escribe
            # su asset ni su entrada, así el siguiente run reintenta.
            skipped += 1
            if skipped <= 5:
                print(f"  ⚠ descartado {e['id']}: {err}")
            m4a.unlink(missing_ok=True)
            continue
        if atempo:
            seconds /= atempo  # duración final tras el atempo
        old[e["id"]] = {"id": e["id"], "file": m4a.name, "seconds": round(seconds, 2), "bytes": m4a.stat().st_size}
        if (i + 1) % 25 == 0:
            print(f"  {i + 1}/{len(missing)}")
    raw.unlink(missing_ok=True)
    s16.unlink(missing_ok=True)
    if skipped:
        print(f"⚠ {skipped}/{len(missing)} locuciones descartadas (ver avisos arriba).")

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

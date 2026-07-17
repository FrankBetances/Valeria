#!/usr/bin/env python3
# ============================================================================
# Valeria+ · Generador de assets de voz neuronal (Fase 2 del plan ILENIA/Nós)
#   python3 scripts/generate-voice-assets.py --lang es
#
# Consume voice-corpus.json (scripts/export-voice-corpus.js) y sintetiza cada
# locución con la voz neuronal configurada, la masteriza y la deja en
# assets/voice/<id>.m4a. Después, scripts/build-voice-asset-map.js regenera
# src/valeriaVoiceAssets.ts. Pensado para correr en CI (ver
# .github/workflows/voice-assets.yml): los modelos JAMÁS corren en la app.
#
# Voces (decisión de producto, jul 2026):
#   · gl → «Celtia» del Proxecto Nós (VITS, proxectonos en Hugging Face).
#     Queda configurada y se activa cuando exista el corpus en gallego.
#   · es → «Sharvard» femenina (rhasspy/piper-voices, es_ES-sharvard-medium):
#     VITS femenina abierta, la homóloga de Celtia en castellano. Sustituible
#     por una voz ILENIA/BSC cambiando solo esta configuración.
#
# Masterización: pico a -3 dBFS. La Pista B de ruido babble va a -6 dBFS, así
# la voz conserva +3 dB sobre el ruido y la suma nunca satura el buffer.
# Estilos: el corpus trae (estilo, texto); aquí el estilo se "hornea" con
# length_scale (piper no expone pitch): tutor 1.0 · child 1.05 · clinical 1.15
# · slow 1.6 (modelado fonético muy lento).
# ============================================================================
import argparse
import audioop
import json
import subprocess
import sys
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CORPUS = ROOT / "voice-corpus.json"
OUT_DIR = ROOT / "assets" / "voice"
VOICES_DIR = ROOT / "scripts" / ".voices"  # modelos descargados (gitignored)
MANIFEST = ROOT / "voice-assets-manifest.json"

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
        # Celtia (Proxecto Nós): checkpoint Coqui-VITS. Se activará cuando el
        # corpus gallego exista; requiere `pip install coqui-tts` en el workflow.
        "engine": "coqui",
        "name": "celtia",
        "label": "Celtia · Proxecto Nós (proxectonos)",
        "hf_repo": "proxectonos/Nos_TTS-celtia-vits-graphemes",
    },
}


def die(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def download_voice(voice: dict) -> Path:
    VOICES_DIR.mkdir(parents=True, exist_ok=True)
    onnx = VOICES_DIR / f"{voice['name']}.onnx"
    for url in voice["urls"]:
        dest = VOICES_DIR / url.rsplit("/", 1)[1]
        if dest.exists() and dest.stat().st_size > 0:
            continue
        print(f"↓ {url}")
        subprocess.run(["curl", "-fsSL", "-o", str(dest), url], check=True)
    return onnx


def pick_female_speaker(config_path: Path) -> int | None:
    # Voces multi-hablante: se elige la hablante femenina (paridad con Celtia).
    cfg = json.loads(config_path.read_text())
    if int(cfg.get("num_speakers", 1)) <= 1:
        return None
    id_map = cfg.get("speaker_id_map") or {}
    for key, sid in id_map.items():
        if key.lower().startswith(("f", "female", "muller", "mujer")):
            return int(sid)
    return 0  # sin etiquetas claras: primera hablante


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


def encode_m4a(wav: Path, m4a: Path) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
         "-c:a", "aac", "-b:a", AAC_BITRATE, "-movflags", "+faststart", str(m4a)],
        check=True,
    )


def synth_piper(entries: list[dict], voice: dict) -> list[dict]:
    from piper import PiperVoice, SynthesisConfig  # pip install piper-tts

    onnx = download_voice(voice)
    speaker = pick_female_speaker(onnx.with_suffix(".onnx.json"))
    print(f"Voz: {voice['label']} · hablante={speaker if speaker is not None else 'única'}")
    pv = PiperVoice.load(str(onnx))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    tmp = OUT_DIR / "_tmp.wav"
    manifest = []
    for i, e in enumerate(entries):
        m4a = OUT_DIR / f"{e['id']}.m4a"
        cfg = SynthesisConfig(length_scale=LENGTH_SCALE.get(e["style"], 1.0), speaker_id=speaker)
        with wave.open(str(tmp), "wb") as w:
            pv.synthesize_wav(e["text"], w, syn_config=cfg)
        seconds = normalize_peak(tmp, tmp)
        encode_m4a(tmp, m4a)
        manifest.append({"id": e["id"], "file": m4a.name, "seconds": round(seconds, 2), "bytes": m4a.stat().st_size})
        if (i + 1) % 50 == 0:
            print(f"  {i + 1}/{len(entries)}")
    tmp.unlink(missing_ok=True)
    return manifest


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="es", choices=sorted(VOICES))
    args = ap.parse_args()
    voice = VOICES[args.lang]
    if voice["engine"] != "piper":
        die(f"El motor '{voice['engine']}' ({voice['label']}) se activa cuando exista el corpus '{args.lang}'.")

    if not CORPUS.exists():
        die("Falta voice-corpus.json — ejecuta antes: node scripts/export-voice-corpus.js")
    entries = json.loads(CORPUS.read_text())["corpus"]
    print(f"Corpus: {len(entries)} locuciones")

    manifest = synth_piper(entries, voice)

    total = sum(m["bytes"] for m in manifest)
    secs = sum(m["seconds"] for m in manifest)
    MANIFEST.write_text(json.dumps({
        "lang": args.lang, "voice": voice["label"], "peakDbfs": PEAK_DBFS,
        "entries": len(manifest), "totalBytes": total, "totalSeconds": round(secs, 1),
        "files": manifest,
    }, indent=1))
    print(f"OK → {len(manifest)} assets · {secs / 60:.1f} min · {total / 1e6:.1f} MB → {OUT_DIR}")


if __name__ == "__main__":
    main()

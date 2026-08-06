#!/usr/bin/env python3
# ============================================================================
# Valeria+ · Subconjunto de CMUdict para el banco inglés — plan en-US, EN-3.1
#   pip install cmudict && python3 scripts/build-cmudict-en.py
#
# Extrae de CMUdict (Carnegie Mellon Pronouncing Dictionary, licencia libre
# tipo BSD) la transcripción de las palabras que usa src/valeriaMinimalPairsEn.ts
# y la deja en scripts/data/cmudict-en.json.
#
# ¿Por qué un subconjunto commiteado y no la dependencia entera?
#   · El gate que de verdad bloquea (check-minimal-pairs-en.js) corre en el
#     build de Android, que es Node y no tiene Python ni red. Un JSON de unos
#     pocos kB lo hace ejecutable en cualquier sitio, siempre, sin instalar nada.
#   · CMUdict completo son ~134k entradas / ~3,5 MB: meterlo en el repo para
#     usar veinte palabras sería absurdo.
#
# El JSON es DATO DERIVADO, no fuente: si un par cambia de palabra, se vuelve a
# ejecutar este script. El gate avisa con el comando exacto cuando falta alguna.
# ============================================================================
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BANK = ROOT / "src" / "valeriaMinimalPairsEn.ts"
OUT = ROOT / "scripts" / "data" / "cmudict-en.json"

# `target: 'seat'` / `foil: 'sea'` — el banco es un fichero de datos con forma
# fija; el gate de Node compila el TS de verdad y contrasta, así que si esta
# extracción se quedara corta, quien avisa es él y no pasa nada en silencio.
WORD_RE = re.compile(r"\b(?:target|foil):\s*'([^']+)'")


def main() -> None:
    try:
        import cmudict  # pip install cmudict
    except ImportError:
        sys.exit("Falta el paquete cmudict: pip install cmudict")

    if not BANK.exists():
        sys.exit(f"No encuentro el banco inglés en {BANK}")

    words = sorted({w.lower() for w in WORD_RE.findall(BANK.read_text(encoding="utf-8"))})
    if not words:
        sys.exit(f"No extraje ninguna palabra de {BANK.name}: ¿cambió el formato del banco?")

    d = cmudict.dict()
    out, missing = {}, []
    for w in words:
        prons = d.get(w)
        if not prons:
            missing.append(w)
            continue
        # Se guardan TODAS las pronunciaciones: el gate necesita ver si una
        # palabra es ambigua (bow = /boʊ/ o /baʊ/) para rechazarla — un par cuyo
        # miembro suena de dos formas no es un par mínimo, es una trampa para el
        # reconocedor y para el TTS.
        out[w] = [list(p) for p in prons]

    if missing:
        sys.exit("No están en CMUdict (¿errata, o palabra demasiado rara?): " + ", ".join(missing))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "source": "CMU Pronouncing Dictionary (cmudict, PyPI)",
        "license": "BSD-like, libre",
        "note": "Dato DERIVADO — regenerar con scripts/build-cmudict-en.py",
        "words": out,
    }, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    print(f"OK → {OUT.relative_to(ROOT)} · {len(out)} palabras")


if __name__ == "__main__":
    main()

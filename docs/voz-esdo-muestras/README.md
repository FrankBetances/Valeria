# D1 · Muestras de voces candidatas para `es-DO` (Español dominicano)

> **Estado**: **parado en D1** — a la espera de que Frank escuche las muestras y elija voz antes de sintetizar el banco completo de `es-DO` (`757` entradas ya exportadas en `voice-corpus.json`).

## Candidatas evaluadas y auditoría de licencias

| Candidata | Origen / `MODEL_CARD` | Licencia comercial | Género / Calidad | Muestras generadas |
| :--- | :--- | :--- | :--- | :--- |
| **`es_MX-claude-high`** | `rhasspy/piper-voices` (`es/es_MX/claude/high/MODEL_CARD`, dataset `HirCoir/Piper-TTS-Spanish`) | **Apache-2.0** (apta para uso comercial) | Femenina · `high` (`22050 Hz`) | [muestra-1-child.m4a](./es_MX-claude-high/muestra-1-child.m4a) (`43.4 s`, `-16.5 LUFS`, `378 087 B`)<br>[muestra-2-clinical.m4a](./es_MX-claude-high/muestra-2-clinical.m4a) (`46.1 s`, `-16.5 LUFS`, `398 475 B`)<br>[muestra-3-slow.m4a](./es_MX-claude-high/muestra-3-slow.m4a) (`50.7 s`, `-16.5 LUFS`, `439 293 B`) |
| **`es_MX-ald-medium`** | `rhasspy/piper-voices` (`es/es_MX/ald/medium/MODEL_CARD`, dataset `rmcpantoja/Ald_Mexican_Spanish_speech_dataset`, base `rdh` CC0) | **Unlicense** + base **CC0** (apta para uso comercial) | Masculina · `medium` (`22050 Hz`) | [muestra-1-child.m4a](./es_MX-ald-medium/muestra-1-child.m4a) (`47.7 s`, `-16.5 LUFS`, `395 796 B`)<br>[muestra-2-clinical.m4a](./es_MX-ald-medium/muestra-2-clinical.m4a) (`50.5 s`, `-16.4 LUFS`, `413 543 B`)<br>[muestra-3-slow.m4a](./es_MX-ald-medium/muestra-3-slow.m4a) (`56.51 s`, `-16.4 LUFS`, `472 538 B`) |

### Candidata descartada en auditoría previa

- **`es_AR-daniela-high`** (`openslr.org/61`, `CC BY-SA 4.0`): según su `MODEL_CARD` en `rhasspy/piper-voices`, está ajustada (*finetuned*) a partir de `en_US-lessac` (licencia de investigación del Blizzard Challenge, ya descartada en la auditoría EN-0.1) y además tiene prosodia rioplatense.

> Nota de cobertura en `rhasspy/piper-voices`: no existe ninguna voz nativa `es_DO` ni caribeña en `piper-voices`; las únicas candidatas latinoamericanas disponibles con licencia comercial limpia son estas dos de `es_MX`.

## Las 10 frases del banco `es-DO` usadas en las 3 muestras

Todas las pistas concatenan las mismas 10 frases representativas (seseo, léxico dominicano real, rotacismo y palabras sueltas), procesadas con el pipeline de P2 (`trim_edges_pcm`, `compress_internal_silence`, fundido 10 ms y `loudnorm` en dos pasadas a `-16.5 LUFS`, AAC 64 kbps mono):

1. `Toca para oír el nombre de las cuatro fichas. Tres van juntas y una no.` *(consigna `se1`)*
2. `Es amarillo, largo y blandito, y a los monos les encanta. ¿Qué es?` *(adivinanza `se2`)*
3. `Esto es un guineo. Di: guineo.` *(`do-cat-frutas-guineo`)*
4. `Esto es una guagua. Di: guagua.` *(`do-cat-transportes-guagua`)*
5. `Después caminamos al colmado. Di: colmado.` *(`do-colmado-colmado`)*
6. `Al final lo llevamos en la funda. Di: funda.` *(`do-colmado-funda`)*
7. `¡Rana! ¡Tu lengua sonó como un motor! Brinca como una rana hasta chocar los cinco con papi.` *(`do-rana-lana`)*
8. `El agua cae del cielo. Di: cae.` *(seseo caribeño)*
9. `¡Saco! ¡Ese soplido salió largo! Ponte el saco imaginario y camina para la escuela.` *(`do-sopa-topa`)*
10. `Fuente. Cubo. Perro. Boca. Rana.` *(articulación lenta)*

Roles de velocidad (`LENGTH_SCALE` en `scripts/generate-voice-assets.py`):
- `muestra-1-child.m4a` -> `child` (`1.05`)
- `muestra-2-clinical.m4a` -> `clinical` (`1.15`)
- `muestra-3-slow.m4a` -> `slow` (`1.35`)

## Qué falta tras la decisión D1

Cuando Frank elija una candidata (por ejemplo `es_MX-claude-high` o `es_MX-ald-medium`):
1. Rellenar `VOICES["es-DO"]` en `scripts/generate-voice-assets.py`.
2. Quitar `'es-DO'` de `LANGS_PENDING_FIRST_BATCH` en `scripts/check-voice-corpus-coverage.js`.
3. Ejecutar `python scripts/generate-voice-assets.py --lang es-DO` y `node scripts/build-voice-asset-map.js` (y revisar impacto en tamaño del APK/AAB antes de empaquetar).

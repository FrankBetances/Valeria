# STATUS · T5-B flash-sentinel

Fecha: **31 de octubre de 2026** (Europe/Madrid, 00:36:23 CET).
Rama local: `game-t5-sentinel`. Base medida: `9e21c80` (`game`).
`.github/workflows/android.yml` no se ha editado.

Esto no es un build de Play ni una prueba en aparato. Es la batería local de Node corrida en este árbol: los 34 pasos `node scripts/…` de `.github/workflows/android.yml`, más `npx tsc --noEmit`, más los cuatro scripts nuevos, más `node scripts/stress-test-steam-ar.js`. El recuento es el de los comandos ejecutados: **40 comandos, 40 con código de salida 0**. No se redondea a 34 ni a 30. No hubo parada: ninguno falló.

| # | Comando | Código de salida | Fecha |
| :- | :--- | ---: | :--- |
| 1 | `node scripts/check-voice-corpus-coverage.js` | 0 | 31 de octubre de 2026 |
| 2 | `node scripts/check-content-rules.js` | 0 | 31 de octubre de 2026 |
| 3 | `node scripts/check-reminder-slots.js` | 0 | 31 de octubre de 2026 |
| 4 | `node scripts/check-pictogram-coverage.js` | 0 | 31 de octubre de 2026 |
| 5 | `node scripts/check-lexical-difficulty.js` | 0 | 31 de octubre de 2026 |
| 6 | `node scripts/check-pair-discriminability.js` | 0 | 31 de octubre de 2026 |
| 7 | `node scripts/check-lua-gl-coverage.js` | 0 | 31 de octubre de 2026 |
| 8 | `node scripts/check-sign-figures.js` | 0 | 31 de octubre de 2026 |
| 9 | `node scripts/check-speech-prosody.js` | 0 | 31 de octubre de 2026 |
| 10 | `node scripts/check-asr-capture-guard.js` | 0 | 31 de octubre de 2026 |
| 11 | `node scripts/check-asr-listen-options.js` | 0 | 31 de octubre de 2026 |
| 12 | `node scripts/build-lua-protocol.js --check` | 0 | 31 de octubre de 2026 |
| 13 | `node scripts/check-lua-mute.js` | 0 | 31 de octubre de 2026 |
| 14 | `node scripts/check-brand-consistency.js` | 0 | 31 de octubre de 2026 |
| 15 | `node scripts/check-ui-strings.js` | 0 | 31 de octubre de 2026 |
| 16 | `node scripts/check-ui-lang-fallback.js` | 0 | 31 de octubre de 2026 |
| 17 | `node scripts/test-challenger-final-ca-integration.js` | 0 | 31 de octubre de 2026 |
| 18 | `node scripts/check-word-coverage.js` | 0 | 31 de octubre de 2026 |
| 19 | `node scripts/check-lua-mascot-mirror.js` | 0 | 31 de octubre de 2026 |
| 20 | `node scripts/verify-aventuras-lua.js` | 0 | 31 de octubre de 2026 |
| 21 | `node scripts/check-lua-voice-language.js` | 0 | 31 de octubre de 2026 |
| 22 | `node scripts/check-writing-bank.js` | 0 | 31 de octubre de 2026 |
| 23 | `node scripts/check-adult-fields.js` | 0 | 31 de octubre de 2026 |
| 24 | `node scripts/check-variety-branches.js` | 0 | 31 de octubre de 2026 |
| 25 | `node scripts/check-sensory-assets.js` | 0 | 31 de octubre de 2026 |
| 26 | `node scripts/check-legal-urls.js --offline` | 0 | 31 de octubre de 2026 |
| 27 | `node scripts/check-data-safety-declaration.js` | 0 | 31 de octubre de 2026 |
| 28 | `node scripts/check-no-background-audio.js` | 0 | 31 de octubre de 2026 |
| 29 | `node scripts/verify-ar-clinical-math.js` | 0 | 31 de octubre de 2026 |
| 30 | `node scripts/stress-test-ar-adversarial.js` | 0 | 31 de octubre de 2026 |
| 31 | `node scripts/check-ar-concurrency.js` | 0 | 31 de octubre de 2026 |
| 32 | `node scripts/check-ar-bridge-contract.js` | 0 | 31 de octubre de 2026 |
| 33 | `node scripts/check-ar-models.js` | 0 | 31 de octubre de 2026 |
| 34 | `node scripts/check-startup-native-calls.js` | 0 | 31 de octubre de 2026 |
| 35 | `npx tsc --noEmit` | 0 | 31 de octubre de 2026 |
| 36 | `node scripts/check-regulatory-vocabulary.js` | 0 | 31 de octubre de 2026 |
| 37 | `node scripts/check-steam-manifests.js` | 0 | 31 de octubre de 2026 |
| 38 | `node scripts/check-lua-tri-modal-coverage.js` | 0 | 31 de octubre de 2026 |
| 39 | `node scripts/check-ar-reveal-layers.js` | 0 | 31 de octubre de 2026 |
| 40 | `node scripts/stress-test-steam-ar.js` | 0 | 31 de octubre de 2026 |

Scripts añadidos en `package.json` (sin tocar `dependencies` ni `devDependencies`):

- `check:regulatory-vocab` → `node scripts/check-regulatory-vocabulary.js`
- `check:steam-manifests` → `node scripts/check-steam-manifests.js`
- `check:lua-tri-modal` → `node scripts/check-lua-tri-modal-coverage.js`
- `check:ar-reveal-layers` → `node scripts/check-ar-reveal-layers.js`

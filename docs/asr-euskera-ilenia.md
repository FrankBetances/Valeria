# ASR en euskera · Valeria+ (plan ILENIA/NEL-GAITU · Fase 4)

> Estado de los juegos de micrófono en euskera. El **adulto es el juez final** en
> todas las variedades: si el ASR no está o falla, la pantalla oculta el micro y
> se valora con botones. El ASR nunca decide el veredicto por sí solo.

## Arquitectura por capas

| Capa | Qué hace | Estado |
| --- | --- | --- |
| **1 · ASR del sistema `eu-ES`** | `@react-native-voice` arranca con el locale que devuelve `speechLocale('eu') = 'eu-ES'`. Donde el dispositivo trae reconocedor vasco (Android/Google reciente), reconoce en euskera nativo. | ✅ cableado (`valeriaVoice.startListening → Voice.start(speechLocale())`) |
| **2 · Aproximación `es-ES` + pliegue vasco** | En equipos sin `eu-ES`, el reconocedor castellano oye euskera. Se mitiga con: (a) `stt_expected` con aproximaciones fonéticas vascas en cada ítem; (b) `foldBasque` (valeriaVoice) que pliega la ⟨h⟩ muda de forma simétrica antes de comparar. | ✅ cableado · ⏳ ajuste fino con datos de dispositivo real |
| **3 · Whisper-eu / Wav2Vec2 de HiTZ on-device** | Reconocimiento vasco nativo sin conexión como módulo opcional avanzado. | 🔬 spike (ver abajo) |

### Pliegue vasco (`foldBasque`)

La ⟨h⟩ es muda en euskera batua y en los euskalkis del sur; ni `eu-ES` ni la
recaída `es-ES` la devuelven de forma fiable. `foldBasque` la elimina en ambos
lados de la comparación (`hotz`↔`otz`, `hartza`↔`artza`, `ohea`↔`oea`).

**No se pliegan las sibilantes ni las africadas** (s/z/x · ts/tz/tx): son el
contraste clínico de los pares mínimos vascos (su/zu, hotz/hots…). Plegarlas
haría que el detector confundiera exactamente lo que debe distinguir; por eso
esa distinción la valora el adulto, no el ASR.

## Soporte por plataforma (EU-0.4, orientativo)

| Plataforma | TTS `eu-ES` sistema | ASR `eu-ES` sistema | Capa efectiva |
| --- | --- | --- | --- |
| Android (Google reciente) | Parcial (voz vasca instalable) | Sí en muchos dispositivos | 1 · sistema |
| Android sin voz vasca | No | No | 2 · `es-ES` + pliegue |
| iOS | Limitado | Limitado | 2 · `es-ES` + pliegue |
| Expo Go / web | — | — | Sin micro: veredicto por botones del adulto |

En todas las plataformas la **voz de la app** en euskera suena con los assets
neuronales HiTZ empaquetados (Fase 3), independiente del TTS del sistema.

## Spike Whisper-eu / Wav2Vec2 on-device (EU-4.3)

**Pregunta:** ¿es viable portar el ASR vasco de HiTZ (`HiTZ/whisper-large-v3-eu`
o un Wav2Vec2 + LM) a on-device en Expo para reconocimiento vasco sin conexión?

**Hallazgos:**

- `whisper-large-v3-eu` (~1,5 GB en fp16) es inviable on-device en gama media.
  Los candidatos realistas serían destilados/cuantizados tipo `whisper-small`/
  `base` fine-tune vasco portados con **whisper.cpp** (ggml int8, ~75–150 MB) o
  un **Wav2Vec2-CTC** vasco exportado a ONNX + `sherpa-onnx` (~40–120 MB).
- Latencia: en gama media, whisper.cpp `base` ronda 1–3 s por enunciado corto;
  aceptable para el ciclo "el niño dice una palabra → veredicto", no para
  streaming continuo.
- Integración Expo: exige un **módulo nativo** (config plugin + build EAS); no
  hay solución JS pura. Rompe el flujo Expo Go, así que iría detrás de
  `asrSupported()` como capacidad opcional que degrada a la Capa 2.
- Peso: +40–150 MB por el modelo empaquetado, o descarga diferida vía EAS.

**Recomendación: NO-GO por ahora (revisar en 6–12 meses).** La Capa 1 (sistema)
cubre el Android moderno y la Capa 2 (es-ES + `foldBasque` + `stt_expected`) da
una degradación aceptable con el adulto como juez. El coste de un módulo nativo
+150 MB no compensa hasta tener señal del piloto de que el micro vasco es un
cuello de botella real. Si se retoma, la vía preferente es **Wav2Vec2-CTC vasco
→ ONNX → sherpa-onnx** (más ligero y determinista que Whisper para este uso).

## Pendientes (device testing)

- EU-4.2: validar `stt_expected` vascos contra lo que devuelve un `es-ES` real al
  oír a hablantes euskaldunes (registro de pruebas) y afinar los arrays.
- EU-4.1: confirmar por modelo de dispositivo qué Android trae `eu-ES` nativo.

<div align="center">

# 🐻 Valeria+

**App móvil de terapia auditivo‑verbal y del lenguaje** para niñas y niños con
hipoacusia, implante coclear, dislalias o dificultades del lenguaje.

Castellano · Galego · Dominicano (es‑DO) · voz neuronal offline

Expo SDK 54 · React Native 0.81 · TypeScript · Backend opcional Firebase

</div>

---

## Índice

- [¿Qué es Valeria+?](#qué-es-valeria)
- [Bloques de terapia](#bloques-de-terapia)
- [Panel del Adulto · Carga Comunicativa](#panel-del-adulto--carga-comunicativa)
- [Idiomas y variedades](#idiomas-y-variedades)
- [Flujo de pantallas](#flujo-de-pantallas)
- [Telemetría del piloto clínico](#telemetría-del-piloto-clínico)
- [Documentación](#documentación)
- [Puesta en marcha](#puesta-en-marcha)
- [Builds (EAS)](#builds-eas)
- [Build automático (GitHub Actions)](#build-automático-github-actions)
- [Backend opcional (Firebase)](#backend-opcional-firebase)
- [Historial de versiones](#historial-de-versiones)

---

## ¿Qué es Valeria+?

Valeria+ reúne en un solo lugar el **registro del paciente**, una comprobación
auditiva previa (**Test de Ling**), **seis bloques de terapia** y un **panel de
resultados** para seguir la evolución.

Parte de un principio clave: **los padres y cuidadores son el motor de voz y
evaluación**. El reconocimiento de voz ayuda, pero **el adulto siempre es el juez
final** (puede corregir el veredicto con un toque) y, donde no hay micrófono
(Expo Go, web), valora la respuesta con botones. Así la terapia funciona en
cualquier dispositivo y **sin conexión**.

## Bloques de terapia

| Bloque | Para qué sirve |
| --- | --- |
| 🗣️ **Pares Mínimos** | Dislalias fonológicas (rotacismo, sigmatismo, frontalización velar, f→p). 10 pares casi iguales (rana/lana) con juego de voz, misión física y sello doble padre‑hijo. |
| 🧩 **Expansión Semántica** | Progresión léxica para intervención temprana: 5 escenarios diarios, 7 progresiones (onomatopeya → adjetivo) y 6 cápsulas de contraste, uniendo imagen, voz y acción física. |
| 👂 **Audición** (13 terapias) | Protocolo ACOPROS: fonética‑fonología, semántica, morfosintaxis y pragmática para audífono, implante coclear o hipoacusia. |
| 💬 **Lenguaje** (7 terapias) | Protocolo familiar: atención conjunta, imitación, comprensión, expresión, comunicación funcional, regulación e interacción social. |
| 🧠 **TEA** (5 terapias) | PRT + TCC: atención conjunta triangulada (Time Delay + Sello Doble), quiebre pragmático con consentimiento, espejo asimétrico, transición interrumpida y categorización bajo ruido. Todos los estresores son **manuales** (Panel del Adulto). |
| 📖 **Dislexia** (5 terapias) | Fonología y acceso léxico: intruso fonológico auditivo puro, rastreo léxico con interferencia, síntesis fonémica rítmica (latencia 500 ms + Juez), criba de pseudopalabras (máx. 5 ensayos) y rastreo visual de rotaciones b/d · p/q con mapa de misclicks. |

El **Test de Ling** (6 sonidos) precede a los ejercicios de audición cuando el
paciente usa audífono o implante, y la **gamificación** (XP, racha 🔥, niveles e
insignias) mantiene la motivación en todos los bloques.

Además, cada mini‑juego de Audición y Lenguaje **rota hasta 3 contenidos**
distintos ("🔄 Otra ronda"), encadenables en una **"🎯 Sesión completa"** por
bloque, con pausas activas unificadas entre ejercicios (`ValeriaSessionBreakOverlay`):
alternan la **cápsula TPR clásica** ("escucha y muévete") y la **Ruta de Rutina
TPR 2.0** (morfosintaxis transaccional). En Pares Mínimos y Expansión Semántica,
la palabra objetivo ya no se dicta aislada: un **motor combinatorio de frases
portadoras** (`valeriaCarrierPhrases`, es/gl) la incrusta en una frase con
prosodia continua seguida de una pregunta de elicitación, sin repetir frase en
diez ensayos seguidos.

## Panel del Adulto · Carga Comunicativa

Para el piloto clínico, Valeria+ añade un **Panel del Adulto** (`ValeriaAdultChaosPanel`)
—tarjeta colapsable presente en el player— con tres módulos de **carga
comunicativa manual**. La regla innegociable es un **muro regulatorio (MDR)**:
la app **jamás activa, mide ni adapta** nada por su cuenta; todo lo acciona el
adulto de forma explícita. Automatizar el ajuste convertiría la app en un
audiómetro algorítmico (SaMD), y cualquier lógica de ese tipo debe rechazarse.

| Módulo | Qué hace |
| --- | --- |
| 🔊 **Escucha en ruido** (`ValeriaManualNoiseSlider` + `valeriaNoise`) | Reproducción dual: la instrucción TTS sobre una pista de **ruido babble** de cafetería en bucle. El volumen del ruido muta **solo** con el slider manual (0‑10) del adulto; la telemetría se registra al soltar, no por píxel. |
| 🐻 **Doble tarea** (`ValeriaDistractorBear`) | Un oso distractor se asoma por la periferia y se mueve **sin ser interactivo** (`pointerEvents="none"`): interferencia visual pura para el paradigma de carga cognitiva dual. Animación por el hilo nativo, arrancada tras `InteractionManager`. |
| 💬 **Quiebre pragmático** (`ValeriaPragmaticBreak`) | "Fallo deliberado": la app calla y es el adulto quien rompe la comunicación a propósito para observar cómo el niño la **repara**. La botonera de acierto se reemplaza por un selector de **estrategias de reparación**. Un modal advierte de la "frustración útil" antes de empezar. |

Los overlays (oso y quiebre) viven en la raíz de la pantalla anfitriona —no
dentro del `ScrollView`— y registran su rectángulo en `ValeriaMisclickBoundary`
para no ensuciar la telemetría de misclicks.

## Idiomas y variedades

Valeria+ locuta y evalúa el **contenido terapéutico** en tres variedades,
seleccionables desde la tarjeta **«Voz de la app»** (`ValeriaVoiceUI`). La
interfaz sigue en castellano; lo que cambia es lo que se dice, se muestra y se
evalúa. La variedad activa vive en un único módulo (`src/valeriaLocale.ts`), que
desacopla tres decisiones: qué banco de audio usar, qué locale BCP‑47 pasar al
reconocedor/voz del sistema y si conviene preferir voces latinas.

| Variedad | Voz | Reconocimiento (ASR) |
| --- | --- | --- |
| 🇪🇸 **Castellano** (`es`) | Voz neuronal **Sharvard** pregenerada y empaquetada (offline). | Voz del sistema `es-ES`. |
| **Galego** (`gl`) — *Proxecto Nós* | Voz neuronal **Celtia** pregenerada (Proxecto Nós), empaquetada. El contenido compartido con el castellano (Expansión Semántica, Audición y Lenguaje) suena con el asset **Sharvard** hasta que Celtia lo cubra. | Sistema `gl-ES` con recaída a `expo-speech`. |
| 🇩🇴 **Dominicano** (`es-DO`) — *Quisqueya Habla* | Voz **latina del dispositivo** (`es-US`/`es-MX`); sin audio propio pregenerado. | Sistema `es-DO`, priorizando el catálogo latino. |

- **Voz neuronal offline.** El audio de castellano y gallego se sintetiza en CI
  (nunca en el dispositivo) y viaja empaquetado en el APK: **1174 locuciones**
  (`assets/voice/`, versión `es-sharvard+gl-celtia-2026-07-19`). Cada id del
  corpus se resuelve contra `src/valeriaVoiceAssets.ts` (mapa generado); en
  gallego, si una locución no tiene asset propio se reproduce el asset
  castellano equivalente, y lo no cubierto por ninguno cae con elegancia a
  `expo-speech` en runtime.
- **Quisqueya Habla (es‑DO)** es un proyecto **editorial**, no de traducción:
  usa léxico y registro dominicanos y, sobre todo, **no penaliza como trastorno
  los rasgos dialectales normales** del español caribeño (seseo, aspiración de
  /s/, neutralización de líquidas en coda). Esa frontera clínica —qué es rasgo y
  qué es error— está fijada en [`docs/guia-dialectal-es-DO.md`](docs/guia-dialectal-es-DO.md),
  regla bloqueante del piloto.
- **Bancos de pares mínimos por variedad**: castellano
  (`src/valeriaMinimalPairs.ts`), gallego (`src/valeriaMinimalPairsGl.ts`, 7
  pares) y dominicano (`src/valeriaMinimalPairsEsDO.ts`, 8 pares construidos solo
  donde el contraste es estable en RD).

## Flujo de pantallas

```
Welcome → Credits → (PatientSelect ó FichaRegistro) → ExerciseSelection
        → LingTest → ExercisePlayer → Results
                   ↘ MinimalPairs (Pares Mínimos)
                   ↘ SemanticExpansion (Expansión Semántica)
```

## Telemetría del piloto clínico

Para recabar **evidencia de usabilidad** durante el piloto (validación
regulatoria y académica) sin fricción para las familias, Valeria+ incluye una
capa de telemetría **offline, anónima y no bloqueante**. La restricción
innegociable es que **ni la captura de eventos ni la escritura en disco bloqueen
el hilo principal**: la captura solo muta memoria (O(1)) y programa un volcado
con *debounce* vía `InteractionManager`, de modo que el cifrado y el guardado en
`AsyncStorage` nunca coinciden con las animaciones ni con el audio.

| Qué mide / hace | Cómo |
| --- | --- |
| ⏱️ **Tiempo activo por pantalla** | El navegador anota cada cambio de ruta (`noteScreen`); solo aritmética de timestamps. |
| 👆 **Misclicks** (toques fuera de zonas interactivas) | `ValeriaMisclickBoundary` usa el sistema de *responder* de RN: solo los toques en zonas muertas llegan a la raíz. Cede el gesto al scroll. |
| 🧩 **Abandono intra‑cápsula TPR** | Se cuentan cápsulas mostradas vs. saltadas vs. completadas en el player. |
| 💬 **Evaluación subjetiva (SUS adaptado)** | Modal Likert 1‑5 (`ValeriaSUSModal`) orientado a la **carga de uso real** ("integrar el ejercicio en la rutina de mi hijo/a"). *Rate limiting* para evitar sesgo de fatiga: solo en el **hito de 4 bloques distintos** (umbral desacoplado del total de 6: los módulos TEA/Dislexia ni lo bloquean ni lo fuerzan) y **máx. 1 vez/semana** por dispositivo. |
| 🔒 **Persistencia y correlación** | Telemetría + Likert se guardan en un **JSON cifrado en reposo** (`valeriaCrypto`, keystream SHA‑256 en JS puro) bajo el **mismo id de sesión**. Se **purga solo tras una exportación exitosa**, evitando el desborde de memoria semana a semana. |

**Exportación dual** (Modo Profesional, PIN `1985` desde el hub de bloques →
`ValeriaProExport`):

- **Offline puro** → **código QR** con el resumen estadístico comprimido
  (abandonos, misclicks, media Likert), legible por cámaras móviles. El
  codificador QR es **JS puro sin dependencias** (`valeriaQR`, modo byte, nivel
  M), verificado bit a bit contra la librería de referencia `qrcode`.
- **ShareSheet** → `ACTION_SEND` nativo con el **log transaccional completo en
  crudo** (email/WhatsApp) para cuando haya conectividad.

> **Notas para la fase regulatoria.** La telemetría es **anónima** (sin datos
> personales, sin audio, sin el contenido de las respuestas). El cifrado en
> reposo guarda la clave en `AsyncStorage`; el módulo `valeriaCrypto` está
> aislado para migrarla a `expo-secure-store` (Keystore/Keychain) en producción.
> Al tratarse de un piloto con menores, el **consentimiento informado** de las
> familias debe gestionarse en el protocolo del estudio, fuera de la app.

## Documentación

| Documento | Descripción |
| --- | --- |
| **Manual de usuario con casos de uso** (v8.1) · [HTML](docs/manual-casos-de-uso.html) · [PDF](docs/Valeria-Manual-Casos-de-Uso.pdf) · [Word](docs/Valeria-Manual-Casos-de-Uso.docx) | 15 casos de uso paso a paso ilustrados con 23 capturas reales (`docs/screenshots/`): los cuatro bloques, el hub, la gráfica de sustitución por fonema, la telemetría del piloto (CU‑13), la variedad lingüística (CU‑14), el Panel del Adulto / carga comunicativa (CU‑15) y las novedades v6/v7/v8/v8.1. |
| [`docs/protocolo-pares-minimos.md`](docs/protocolo-pares-minimos.md) | Protocolo de pares mínimos para dislalias fonológicas: 10 pares accionables con flujo TTS→STT, feedback por rama y misiones físicas. Implementado en `src/ValeriaMinimalPairsScreen.tsx` + `src/valeriaMinimalPairs.ts`. |
| [`docs/protocolo-pares-minimos-es-DO.md`](docs/protocolo-pares-minimos-es-DO.md) | Protocolo de pares mínimos en español dominicano (Quisqueya Habla). Implementado en `src/valeriaMinimalPairsEsDO.ts`. |
| [`docs/protocolo-expansion-semantica.md`](docs/protocolo-expansion-semantica.md) | Protocolo de expansión semántica / progresión léxica offline. Implementado en `src/ValeriaSemanticExpansionScreen.tsx` + `src/valeriaSemanticExpansion.ts`. |
| [`docs/guia-dialectal-es-DO.md`](docs/guia-dialectal-es-DO.md) | Guía clínica dominicana (QH‑0.2): qué es rasgo dialectal normal y qué es error terapéutico. Regla **bloqueante** para todo dataset es‑DO. |
| [`docs/plan-integracion-proxecto-nos.md`](docs/plan-integracion-proxecto-nos.md) | Plan por fases de la versión en gallego apoyada en los recursos abiertos del Proxecto Nós (contenido, voz Celtia, ASR). |
| [`docs/plan-integracion-quisqueya-habla.md`](docs/plan-integracion-quisqueya-habla.md) | Plan de la variante dominicana (es‑DO), que reutiliza la infraestructura de variedad del plan gallego. |
| [`docs/plan-calidad.md`](docs/plan-calidad.md) | Task list priorizada para reducir regresiones (checklist de humo, pruebas por bloque). |
| [`docs/firebase-setup.md`](docs/firebase-setup.md) | Guía del backend opcional: Firebase Authentication + Cloud Firestore. |

**Regenerar el manual** tras editar [`docs/manual-casos-de-uso.html`](docs/manual-casos-de-uso.html):

```bash
python3 docs/build-docx.py        # → Word (requiere python-docx)
node docs/capture-screenshots.js  # regenera las capturas (Playwright sobre expo start --web)
# → PDF: imprimir el HTML con Chromium headless
chromium --headless --no-pdf-header-footer \
  --print-to-pdf=docs/Valeria-Manual-Casos-de-Uso.pdf docs/manual-casos-de-uso.html
```

> El DOCX se construye con un script propio (`build-docx.py`) que **replica** el
> contenido del HTML: al cambiar el manual hay que editar ambos.

## Puesta en marcha

```bash
npm install
npm start        # expo start
npm run android  # expo start --android
npm run ios      # expo start --ios
npm run web      # expo start --web
npm run typecheck
```

## Builds (EAS)

```bash
npx eas build -p android --profile apk         # APK directo: solo ARM, ProGuard + shrinkResources
npx eas build -p android --profile production  # App Bundle (.aab) para Google Play
```

El perfil `apk` limita las arquitecturas a `armeabi-v7a` y `arm64-v8a` (los
móviles reales), eliminando las librerías x86 de emulador del binario. Para
publicar en Google Play usa siempre el App Bundle: Play genera un APK optimizado
por dispositivo y la descarga es bastante menor.

## Build automático (GitHub Actions)

El workflow [`.github/workflows/android.yml`](.github/workflows/android.yml)
compila la app en cada push/fusión a `main` (y en ramas `claude/**`). Con los
secrets de firma configurados genera el APK y el **AAB firmados**; sin secrets
solo compila el APK. El `versionCode` se deriva del número de run.

El workflow [`.github/workflows/voice-assets.yml`](.github/workflows/voice-assets.yml)
**sintetiza la voz neuronal** (Sharvard para `es`, Celtia para `gl`) a partir de
[`voice-corpus.json`](voice-corpus.json), masteriza el audio, regenera el mapa
`src/valeriaVoiceAssets.ts` y **commitea los assets** a la rama. Los modelos de
voz corren **solo en CI**, nunca en el dispositivo; el push resultante dispara el
build Android que empaqueta el audio en el binario. La voz gallega usa el
checkpoint *gated* de Celtia, que requiere el secret `HF_TOKEN`.

<details>
<summary>Secrets de firma necesarios</summary>

- `ANDROID_RELEASE_KEYSTORE_BASE64`
- `ANDROID_RELEASE_STORE_PASSWORD`
- `ANDROID_RELEASE_KEY_ALIAS`
- `ANDROID_RELEASE_KEY_PASSWORD`

</details>

## Backend opcional (Firebase)

Para probar la app con profesionales, Valeria+ incluye un backend **aditivo y
opcional**: **Firebase Authentication** (email/contraseña) + **Cloud Firestore**.
La app sigue funcionando en local sin conexión si no se activa.

- **SDK JS `firebase`** (no `@react-native-firebase`): mismo código en Android,
  iOS y web, sin módulos nativos ni rebuilds.
- La config del SDK se lee de **variables de entorno `EXPO_PUBLIC_*`**; no hay
  claves escritas en el repositorio (copia `.env.example` a `.env`).
- Cada profesional autenticado solo accede a **sus propios datos**, protegidos
  por las Security Rules de [`firestore.rules`](firestore.rules).

Guía completa de configuración y despliegue: [`docs/firebase-setup.md`](docs/firebase-setup.md).

## Historial de versiones

<details open>
<summary><strong>V8.1</strong> — arreglos de registro, resultados y voz gallega</summary>

- **Bienvenida**: el botón «Ya tengo un paciente registrado» pasa de enlace de
  texto a **botón perfilado de tamaño completo**, más visible y fácil de pulsar.
- **Resultados y Test de Ling con el paciente real**: la cabecera y el informe
  compartido mostraban un dato de muestra («Lucía M. · NHC HC‑204815»); ahora
  leen la **ficha del paciente activo** (nombre y NHC reales), con un rótulo
  neutro si aún no hay ficha guardada.
- **La voz gallega siempre arranca**: la Expansión Semántica y los ejercicios de
  Audición y Lenguaje comparten el texto castellano y aún no tienen asset de
  Celtia; en gallego la app reproduce ahora el **asset neuronal castellano**
  (Sharvard) en vez de quedar en silencio esperando una voz `gl-ES` que el
  dispositivo no suele tener. Cuando la CI sintetice esos bancos con Celtia,
  sus assets tendrán prioridad automáticamente.
- **Corpus ampliado**: el banco empaquetado crece a **1174 locuciones**
  (versión `es-sharvard+gl-celtia-2026-07-19`), incorporando la Expansión
  Semántica y Audición/Lenguaje en castellano y el contenido gallego GL‑2.x.

</details>

<details>
<summary><strong>V8</strong> — variedades lingüísticas (Galego · Dominicano) y voz neuronal offline</summary>

- **Infraestructura de variedad** (`src/valeriaLocale.ts`): una fuente única de
  la variedad activa (`es` · `gl` · `es-DO`) que decide, por separado, el banco
  de audio, el locale BCP‑47 del sistema y la preferencia de voz latina. Migra la
  antigua clave «idioma de voz» (`es`|`gl`) sin perder la selección previa.
- **Galego · Proxecto Nós**: contenido terapéutico en gallego cableado a las
  pantallas y **voz neuronal Celtia** pregenerada (banco de pares gallego en
  `src/valeriaMinimalPairsGl.ts`). Promovido de beta a **producción**.
- **Dominicano · Quisqueya Habla (es‑DO)**: variante editorial con léxico
  caribeño y evaluación que **no penaliza rasgos dialectales normales** (guía
  clínica `docs/guia-dialectal-es-DO.md`, regla bloqueante). Usa la voz y el
  micrófono **del sistema** en español latino. También en producción.
- **Voz neuronal offline empaquetada**: 703 locuciones (`assets/voice/`, versión
  `es-sharvard+gl-celtia-2026-07-18`) mapeadas en `src/valeriaVoiceAssets.ts`
  (generado). Nueva tubería CI `voice-assets.yml`: sintetiza, masteriza y
  commitea el audio; los modelos corren solo en CI, con recaída a `expo-speech`
  para lo no cubierto.
- **Selector de variedad** en la tarjeta «Voz de la app» (`ValeriaVoiceUI`) con
  las tres variedades aprobadas y ayuda contextual según la voz disponible.

</details>

<details>
<summary><strong>V7</strong> — piloto clínico: carga comunicativa manual, telemetría y exportación dual</summary>

- **Reingeniería del piloto · Carga Comunicativa manual**: Panel del Adulto
  (`ValeriaAdultChaosPanel`) con escucha en ruido babble (`valeriaNoise` +
  `ValeriaManualNoiseSlider`), oso distractor de doble tarea (`ValeriaDistractorBear`)
  y quiebre pragmático con estrategias de reparación (`ValeriaPragmaticBreak`),
  todo bajo el muro MDR (manual, nunca automático). Frases portadoras
  combinatorias (`valeriaCarrierPhrases`) y pausa de sesión unificada
  (`ValeriaSessionBreakOverlay`). Telemetría V2.
- **Telemetría no bloqueante**: captura de tiempo activo por pantalla, misclicks
  y abandono intra‑cápsula TPR sin bloquear el hilo principal (captura en memoria
  + volcado con *debounce* vía `InteractionManager`). Módulo `valeriaTelemetry`.
- **Evaluación subjetiva SUS adaptada**: modal Likert 1‑5 (`ValeriaSUSModal`)
  centrado en la carga de uso real, con *rate limiting* (hito de 4 bloques y máx.
  1 vez/semana por dispositivo) para evitar el sesgo de fatiga.
- **Persistencia cifrada y correlación**: telemetría + Likert en un JSON cifrado
  en reposo (`valeriaCrypto`) bajo el mismo id de sesión; purga automática solo
  tras exportación exitosa.
- **Exportación dual** (Modo Profesional, PIN `1985`): QR offline con el resumen
  estadístico comprimido (`valeriaQR` + `ValeriaQRCode`, codificador JS puro sin
  dependencias, verificado contra `qrcode`) + ShareSheet `ACTION_SEND` con el log
  completo en crudo (`ValeriaProExport`).

</details>

<details>
<summary><strong>V6</strong> — voz humana, rondas variadas, sesión completa y backend opcional</summary>

- **Motor de voz más humano**: prioriza voces neuronales/enhanced (Google
  neural/WaveNet, iOS Enhanced/Siri) y penaliza los motores metálicos heredados
  (eloquence, compact, eSpeak, Pico). Reintentos con espera creciente, prosodia
  natural (troceo por frases, entonación en preguntas/exclamaciones) y bancos de
  frases rotativas.
- **Ejercicios con rondas variadas**: cada mini‑juego de Audición y Lenguaje rota
  hasta 3 contenidos distintos con **"🔄 Otra ronda"**. Flujo numerado
  **PASO 1→4** (consigna → juego → movimiento → evaluación), feedback hablado y
  cabecera con el nombre real del paciente.
- **Sesión completa**: botón **"🎯 Sesión completa"** por bloque que encadena
  todos los ejercicios prescritos en una sola sesión (pasando por el Test de Ling
  si procede).
- **Fase de turno visible**: `TurnPhaseStrip` (Escucha → Repite → Veredicto →
  Misión) en Pares Mínimos y Expansión Semántica, con doble vuelta evaluada. Más
  contenido: 5 escenarios, 7 progresiones y 6 cápsulas en Expansión Semántica.
- **Fichas sin imágenes rotas**: pictogramas SVG de alto contraste
  (`src/ValeriaPictograms.tsx`) con fallback a emoji.
- **Marca con oso pardo animado**: la mascota `BearMark` estrena variante `brown`;
  bienvenida y créditos animados; iconos y splash regenerados.
- **Backend opcional Firebase**: Auth email/contraseña + Firestore (ver arriba).
- **Build firmado en CI**: APK y AAB firmados en cada push/fusión a `main`.

</details>

<details>
<summary><strong>V5</strong> — Expo SDK 54, voz natural y PIN profesional compartido</summary>

- **Expo SDK 54 / React Native 0.81**: todas las librerías actualizadas
  (incluido `expo-speech` 14).
- **Voz más natural**: al arrancar busca entre las voces españolas instaladas y
  elige la de mayor calidad ("enhanced"/neuronal), priorizando las offline.
- **PIN profesional en todos los bloques**: componente compartido
  `src/ValeriaProPin.tsx`; el Modo Familia solo practica lo prescrito.
- **Instalación más ligera**: ProGuard + shrinkResources y perfil EAS `apk` con
  solo las arquitecturas ARM reales.

</details>

<details>
<summary><strong>V4</strong> — fichas ilustradas, escala EPT‑3, movimiento y gamificación</summary>

- **PIN profesional corregido**: validación SHA‑256 también en Hermes (Android).
  PIN de demostración: `1985`.
- **Fichas ilustradas**: imágenes emoji grandes; toca cualquiera para ampliarla.
- **Escala EPT‑3**: valoración unificada de tres niveles (1★ / 2★ / 3★).
- **Juego con movimiento**: "versión en movimiento" y pausas activas entre
  ejercicios.
- **Recordatorios diarios**: notificaciones locales (máx. 4/día) con
  `expo-notifications`.
- **Gamificación estilo Duolingo**: XP, racha 🔥, niveles (Osezno → Oso
  Legendario) e insignias.

</details>

---
name: valeria-project-expert
description: Arquitecto y desarrollador experto en la plataforma Valeria+ v13 (Terapia auditivo-verbal y del lenguaje offline para niñas y niños con hipoacusia, implante coclear, dislalias o dificultades del lenguaje). Conoce la arquitectura de Expo SDK 54 / React Native 0.81, TypeScript 5.9, los 8 bloques de terapia (incluyendo Integración Sensorial y Realidad Aumentada con Filament Engine), la mascota oficial Lúa (pixel art, armario, espejo de 24x24 px), las 5 variedades lingüísticas (Castellano, Galego, Dominicano, Euskera, US English), Academy (La Brújula ASHA y LSE con 27 configuraciones dactilológicas), la interfaz v11 con pestañas inferiores y los gates de CI en GitHub Actions.
---

# Valeria+ v13 Project Expert

Este skill contiene todo el conocimiento técnico, clínico y arquitectónico de la plataforma **Valeria+ v13** (Expo SDK 54 / React Native 0.81 / TypeScript 5.9).

---

## 🐈‍⬛ 1. Especificación del Stack Tecnológico (v13)

- **Framework Core**: Expo SDK 54, React Native 0.81, TypeScript 5.9.
- **Interfaz v11 Activa (`MainTabNavigator`)**:
  - Pestañas inferiores: **Terapias** (cuadrícula de 2 columnas sin subtítulos largos), **Academy** (formación multidominio) y **Ajustes** (voz, recordatorios, acceso profesional).
  - Ruta real `BlockList` para navegación nativa fluida.
  - El player terapéutico no vive bajo las pestañas para no interferir con la interacción infantil.
- **Mascota Oficial de Marca: Lúa (v12/v13)**:
  - Gata negra tipo *smoking* en pixel art (`ValeriaCatPixel.tsx`), con dos poses canónicas (cabeza sola para <90px y cuerpo entero para >90px).
  - Generación automatizada de brand assets (`npm run build:brand` -> `icon.png`, `adaptive-icon.png`, `splash.png`, `docs/lua-mascota.png`). Cero oso en marca.
  - Premios de Lúa (`ValeriaAwardsSheet`): 12 niveles (Gatita -> Gata Legendaria), 18 insignias y armario con 5 coleccionables (pescadito, pajarita, flor, cascabel, gorro de maga) con anclaje dual `device: { row, col }`.
  - Distractor de doble tarea: `ValeriaDistractorCat` («Gata distractora»).
- **Evaluador de Pares Mínimos D7 (Vecino Más Cercano O2)**:
  - Compara la transcripción del habla contra **ambas palabras del par**. En caso de empate devuelve "casi" y delega el veredicto en el juez adulto.
  - 35/35 contrastes detectados con 0 falsos positivos de error.
- **ASR Local y Privacidad (Fase A)**:
  - Migración a `expo-speech-recognition` (`requiresOnDeviceRecognition`).
  - Diagnóstico visible para el adulto y descarga de modelos offline (`androidTriggerOfflineModelDownload`, Android 13+).
- **Motor 3D de Realidad Aumentada**: Filament Engine nativo en Kotlin (Android host en `android-native/valeria-ar/`).

---

## 🧩 2. Los 8 Bloques de Terapia Clínica

| Bloque | Función Clínica y Especificación Técnica |
| --- | --- |
| 🎧 **Integración Sensorial Auditiva** | Desensibilización sistemática para sobre-responsividad acústica (SOR). Muro de control adulto (estímulo, intensidad relativa 1-5, duración 3/7/15 s). 11 estímulos sintetizados con DSP determinista en Node a −20 dBFS RMS (aspiradora, licuadora, secadores, sirena, petardos, timbre, tormenta, aula, centro comercial, calle con obras). Pausa segura que **suma** XP. Lúa acompaña quieta y muda (`GRANT` solo visual, cero opcodes durante exposición, `RELAX` en pausa). |
| 🗣️ **Pares Mínimos** | 15 pares en 6 grupos (rotacismo, sigmatismo, frontalización velar, f→p, nasales y laterales). Algoritmo D7 O2 y consigna estándar (presentación + repetición). |
| 🧩 **Expansión Semántica** | 5 escenarios diarios, 5 categorías léxicas (dificultad por familiaridad ES-08), 9 progresiones y 8 cápsulas de contraste con doble vuelta (comprensión + producción). Antesala de preparación de material. |
| 👂 **Audición** (18 terapias) | Protocolo ACOPROS: fonética, semántica, morfosintaxis, pragmática y **Escucha en Ruido** (RA-1…RA-5) sobre ruido babble en bucle. |
| 💬 **Lenguaje** (7 terapias) | Protocolo familiar: atención conjunta (5 alternativas en M-1), imitación (progresión gesto → sílaba → palabra en M-2), expresión, comunicación funcional y regulación (M-6 con agenda visual). |
| 🧠 **TEA** (6 terapias) | PRT + TCC: atención conjunta triangulada (Time Delay + Sello Doble), quiebre pragmático con consentimiento, espejo asimétrico y transición interrumpida. Estresores 100% manuales. |
| 📖 **Dislexia** (6 terapias) | Intruso fonológico auditivo puro (DX-1), rastreo léxico con interferencia, síntesis fonémica rítmica (500 ms + Juez), criba de pseudopalabras, rotaciones b/d · p/q y denominación rápida (RAN). |
| 🎯 **Realidad Aumentada** (3 terapias · solo Android) | **Gamificación Condicionada**: cámara frontal como sensor de conducta motora sin grabar ni transmitir. AR-1 cinemática orofacial (micrófono apagado), AR-2 localización del sonido instrumentada (cronometrada) y AR-3 selección semántica por fijación de la mirada. |

---

## 🌐 3. Las 5 Variedades Lingüísticas y la Capa de Voz

La variedad de terapia (`valeriaLocale.ts`) está **desacoplada** del idioma de la interfaz (`valeriaUiLang.ts`, `UiLang = 'es' | 'en'`) para permitir *caseloads* bilingües:

1. 🇪🇸 **Castellano (`es`)**: 878 locuciones empaquetadas con voz neuronal **Sharvard**.
2. 🔵 **Galego (`gl`)**: 816 locuciones con voz neuronal **Celtia** (Proxecto Nós). Banco gallego propio en todos los bloques. Aprobado por ACOPROS.
3. 🇩🇴 **Dominicano (`es-DO`)**: Integración editorial de *Quisqueya Habla*. Evaluación que **no penaliza rasgos dialectales caribeños** (seseo, aspiración, neutralización líquida en `docs/guia-dialectal-es-DO.md`).
4. 🟢 **Euskara (`eu`)**: 744 locuciones con voz neuronal **HiTZ-TTS** (UPV/EHU · Aholab) + ASR `eu-ES` con recaída y `foldBasque`.
5. 🇺🇸 **US English (`en-US`)**: 614 locuciones con **LJSpeech · piper**. Primera traducción completa de UI (`src/i18n/strings.en.ts`, ~1200 líneas tipadas contra `strings.es.ts`), registro clínico estadounidense (*caregiver*, *child*, HIPAA), bancos clínicos propios (`valeriaExerciseEn.ts`, etc.), guía dialectal AAVE/Southern (`docs/guia-dialectal-en-US.md`) y revisión SLP (*Howard University*).

---

## 🎓 4. Academy: Formación del Cuidador (v13)

- **7 Dominios de Capacitación**: Lenguaje, Hipoacusia/Sordera, Dislalias, Dislexia, TEA, Lengua de Signos Española (LSE) e Integración Sensorial.
- **La Brújula de las Palabras**: Cápsula de Lenguaje con los hitos normativos ASHA de 0 a 5 años (receptivo vs. expresivo separados por tramo de edad, con *disclaimer* clínico visible).
- **LSE (Lengua de Signos Española)**: 27 configuraciones del abecedario dactilológico dibujadas, **validadas por personas sordas y ACOPROS**. Las letras con movimiento (J, Ñ, X, Z) se marcan con ↻ y remiten a vídeo.
- **Arquitectura de Rendimiento**: Silos independientes de XP, lectura O(1) con `useSyncExternalStore` (`academyStore.ts`) y persistencia cifrada en reposo (`valeriaCrypto`).

---

## 🛡️ 5. Muro Regulatorio MDR, Telemetría y Gates de CI

- **Principio Innegociable MDR (SaMD Clase I)**: La app **nunca decide, mide ni adapta por su cuenta**. El adulto/padre es el juez clínico final de cada respuesta.
- **Panel del Adulto (`ValeriaAdultChaosPanel`)**: Escucha en ruido babble manual (slider 0-10), Gata distractora (`ValeriaDistractorCat`, `pointerEvents="none"`) y quiebre pragmático.
- **Telemetría no bloqueante**: Captura en memoria + volcado *debounced* (`InteractionManager`). Modal SUS adaptado (máx. 1 vez/semana, hito 4 bloques). Exportación dual: **Código QR offline comprimido** (`valeriaQR`) + ShareSheet (`ValeriaProExport`).
- **Los Gates de Calidad en CI (`android.yml` y scripts)**:
  1. `check-voice-corpus-coverage.js` (cobertura total de locuciones en `es`, `gl`, `eu`, `en-US`).
  2. `check-content-rules.js` (reglas de contenido y progresión).
  3. `check-pictogram-coverage.js` (fichas y contrastes).
  4. `check-lexical-difficulty.js` (orden léxico por familiaridad).
  5. `check-reminder-slots.js` (cancelación de notificaciones en cola).
  6. `check-sign-figures.js` (figuras y dactilología LSE).
  7. `check-speech-prosody.js` (prosodia en es-DO).
  8. `check-asr-capture-guard.js` (protección estricta Zero-PHI de grabaciones de prueba).
  9. `check-asr-listen-options.js` (parámetros del reconocedor y modelos offline).
  10. `check-sensory-assets.js` (sonoridad, bucle sin costura, espectro y sucesos vivos de los 11 estímulos sensoriales).

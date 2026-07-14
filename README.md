<div align="center">

# 🐻 Valeria+

**App móvil de terapia auditivo‑verbal y del lenguaje** para niñas y niños con
hipoacusia, implante coclear, dislalias o dificultades del lenguaje.

Expo SDK 54 · React Native 0.81 · TypeScript · Backend opcional Firebase

</div>

---

## Índice

- [¿Qué es Valeria+?](#qué-es-valeria)
- [Bloques de terapia](#bloques-de-terapia)
- [Flujo de pantallas](#flujo-de-pantallas)
- [Documentación](#documentación)
- [Puesta en marcha](#puesta-en-marcha)
- [Builds (EAS)](#builds-eas)
- [Build automático (GitHub Actions)](#build-automático-github-actions)
- [Backend opcional (Firebase)](#backend-opcional-firebase)
- [Historial de versiones](#historial-de-versiones)

---

## ¿Qué es Valeria+?

Valeria+ reúne en un solo lugar el **registro del paciente**, una comprobación
auditiva previa (**Test de Ling**), **cuatro bloques de terapia** y un **panel de
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

El **Test de Ling** (6 sonidos) precede a los ejercicios de audición cuando el
paciente usa audífono o implante, y la **gamificación** (XP, racha 🔥, niveles e
insignias) mantiene la motivación en todos los bloques.

## Flujo de pantallas

```
Welcome → Credits → (PatientSelect ó FichaRegistro) → ExerciseSelection
        → LingTest → ExercisePlayer → Results
                   ↘ MinimalPairs (Pares Mínimos)
                   ↘ SemanticExpansion (Expansión Semántica)
```

## Documentación

| Documento | Descripción |
| --- | --- |
| **Manual de usuario con casos de uso** (v6) · [HTML](docs/manual-casos-de-uso.html) · [PDF](docs/Valeria-Manual-Casos-de-Uso.pdf) · [Word](docs/Valeria-Manual-Casos-de-Uso.docx) | 12 casos de uso paso a paso ilustrados con 21 capturas reales (`docs/screenshots/`): los cuatro bloques, el hub, la gráfica de sustitución por fonema y las novedades v6. |
| [`docs/protocolo-pares-minimos.md`](docs/protocolo-pares-minimos.md) | Protocolo de pares mínimos para dislalias fonológicas: 10 pares accionables con flujo TTS→STT, feedback por rama y misiones físicas. Implementado en `src/ValeriaMinimalPairsScreen.tsx` + `src/valeriaMinimalPairs.ts`. |
| [`docs/protocolo-expansion-semantica.md`](docs/protocolo-expansion-semantica.md) | Protocolo de expansión semántica / progresión léxica offline. Implementado en `src/ValeriaSemanticExpansionScreen.tsx` + `src/valeriaSemanticExpansion.ts`. |
| [`docs/firebase-setup.md`](docs/firebase-setup.md) | Guía del backend opcional: Firebase Authentication + Cloud Firestore. |

**Regenerar el manual** tras editar [`docs/manual-casos-de-uso.html`](docs/manual-casos-de-uso.html):

```bash
python3 docs/build-docx.py        # → Word (requiere python-docx)
node docs/capture-screenshots.js  # regenera las capturas (Playwright sobre expo start --web)
```

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

# Plan de calidad · Task list para reducir nuevos bugs

Lista priorizada de tareas para bajar la probabilidad de regresiones como las
del 17-jul (sesiones que no avanzaban, scroll roto, PIN bloqueado). Cada tarea
indica el porqué con referencia a un bug real ya sufrido. Marcar con `[x]` al
completar.

---

## P0 · Antes del próximo build (coste bajo, impacto inmediato)

- [ ] **Checklist de humo en dispositivo real** (10 min, ejecutar antes de
  publicar CADA build; guardar el resultado en el PR):
  - [ ] Completar una "Sesión completa" de Audición (13 ejercicios) puntuando
        todos y viendo el resumen final.
  - [ ] Completar un ejercicio de Lenguaje con sus 3 niveles
        (Inicial → Intermedio → Avanzado) y comprobar que la pantalla vuelve
        arriba en cada nivel.
  - [ ] Pares Mínimos: 10 ensayos seguidos, incluyendo el sello doble con dos
        dedos a la vez, la rotación de roles (ensayos 4 y 8) y la cápsula TPR.
  - [ ] Expansión Semántica: un escenario completo.
  - [ ] Desplazar TODAS las listas hasta el final (hub, Audición, Lenguaje,
        pares, expansión, resultados) con el dedo partiendo de texto y de
        zonas vacías.
  - [ ] PIN 1985 en las 3 pantallas + PIN incorrecto + cerrar con ✕.
  - [ ] Acceso Profesional del hub: QR visible y ShareSheet.
  - [ ] Ficha de registro con el teclado abierto (guardar sin perder toques).
  - [ ] Probar con y sin permiso de micrófono concedido.
- [ ] **Gate de CI en cada PR** (nuevo job en `.github/workflows`, separado del
  build de Android): `npm ci && npx tsc --noEmit`. Hoy `npm run typecheck` no
  se ejecuta en ningún sitio.
- [ ] **Arreglar el typecheck para que pase en limpio** (hoy fallaría por
  implicit-any en varios props). Sin una base verde el gate no sirve.
- [ ] **ESLint + `eslint-plugin-react-hooks`** con `exhaustive-deps` activado:
  varios bugs latentes vienen de closures con estado obsoleto en
  `setTimeout`/callbacks (patrón repetido en los tres players).

## P1 · Tests unitarios de la lógica pura (sin UI, alto retorno)

Estos módulos son JS puro y se testean con Jest/Vitest sin montar React Native:

- [ ] `valeriaVoice`: `matchTarget` / `matchPair` / `matchExpected` con casos
  reales (acentos, "lana" vs "rana", aproximaciones de niño, alternativas del
  ASR). Es el corazón clínico de la evaluación por voz.
- [ ] `valeriaQR.encodeQR`: comparación bit a bit contra la librería `qrcode`
  (dev-dependency) para v1-6 y las 8 máscaras — el comentario del módulo ya
  promete esa verificación; convertirla en test.
- [ ] `ValeriaProPin.sha256` (ruta JS pura) contra vectores conocidos, incluido
  el hash del PIN maestro. Un fallo aquí bloquea todo el modo profesional.
- [ ] `valeriaCrypto`: round-trip `encryptJSON` → `decryptJSON`, blobs
  corruptos y claves regeneradas.
- [ ] `valeriaGamification`: XP, niveles, racha (incluye cambio de día y
  zona horaria).
- [ ] `valeriaTelemetry`: `buildExport` (tasas y medias), `purgeAfterExport`,
  rate-limit semanal del SUS.
- [ ] Añadir `npm test` al gate de CI de P0.

## P2 · Tests de componente y regresión de flujos

- [ ] **Regla fija: cada bug corregido deja un test que lo reproduce.**
  Empezar por los tres del 17-jul:
  - [ ] `DoubleSeal` dispara `onUnlock` con dos toques simultáneos (bug del
        responder único de RN) y con pulsación larga.
  - [ ] El player avanza `idx`/`subIdx` al puntuar y guarda el historial con
        el promedio correcto.
  - [ ] `ProPinModal` no queda bloqueado si el hash lanza excepción.
- [ ] React Native Testing Library para los flujos de sesión (player, pares,
  expansión) simulando toques: avance, puntuación, persistencia en
  AsyncStorage (mock).
- [ ] Flujo E2E ligero con **Maestro** sobre el APK de EAS: arranque → registro
  → sesión corta → resultados. Correr al menos antes de cada entrega a
  testers.

## P3 · Arquitectura y prevención estructural

- [ ] **Extraer la máquina de estados de sesión a módulos puros** (reducer por
  pantalla: player ~1.500 líneas, pares ~1.000). La lógica de
  avance/puntuación pasa a ser testeable sin UI y los tres players dejan de
  duplicar el mismo patrón `say → listen → judge → next` (hoy un bug se
  arregla tres veces).
- [ ] **Unificar overlays caseros en `Modal` de RN** (ProPin, ProExport, SUS,
  TPR, RoleSwap): hoy son Views absolutas que no gestionan el botón atrás de
  Android ni el orden Z de forma consistente.
- [ ] **Hook compartido `useSpeechTrial`** para pares/expansión (TTS →
  escucha → veredicto con timeout de rescate) en lugar de dos copias.
- [ ] **Telemetría tras un feature flag** (constante o remote config): poder
  apagarla en un build si vuelve a interferir, sin revertir código.
- [ ] **Crash/error reporting real** (`sentry-expo`): los errores del piloto
  hoy mueren en `catch (e) { /* noop */ }`. Añadir al menos un logger central
  para esos catches silenciosos.
- [ ] **Matriz mínima de dispositivos** para el checklist P0: 1 Android de
  gama baja (el público del piloto), 1 tablet, 1 iPhone si aplica; siempre
  build nativo (con ASR) además de Expo Go (sin ASR), porque los flujos
  divergen (`asrSupported()`).
- [ ] **Plantilla de PR** (`.github/pull_request_template.md`) con casillas:
  "¿typecheck/lint/tests verdes?", "¿checklist de humo en dispositivo?",
  "¿deja test de regresión?".
- [ ] **Mantener el port iOS nativo (`ios-native/`) fuera de las entregas** o
  portarle los mismos arreglos: hoy va por detrás del RN y mezclarlos en
  pruebas genera reportes de bugs ya corregidos.

---

*Origen: análisis post-mortem de los bugs corregidos en la rama
`claude/ejercicios-bloqueados-bugs-d6vc8m` (sello doble imposible por el
responder único, barrera de misclicks interfiriendo el scroll, scroll heredado
entre pasos, modal del PIN sin recuperación de errores).*

# Original User Request

## 2026-08-28T11:36:35Z

Ampliación y duplicación del módulo de Realidad Aumentada (AR) en Valeria+ de 3 a 6 ejercicios clínicos con dinámicas inmersivas inspiradas en Pokémon GO, centradas en la mascota Lúa (28 expresiones y opcodes), con renderizado 3D determinista en Google Filament (<100 KB por GLB), visión por computador en tiempo real (Google MediaPipe Tasks Vision) y estricto cumplimiento del Muro Regulatorio MDR Clase I (Zero-PHI, magnitudes físicas puras, 60 FPS).

Working directory: /Users/frankalbertobetancesreinoso/Documentos locales/Valeria UX/Valeria
Integrity mode: development

## Requirements

### R1. Duplicación del Catálogo de Ejercicios Clínicos AR (3 → 6)
- **AR-1 (Existente)**: Cinemática Orofacial (propulsión de cohete/vehículo por redondeo labial con histéresis).
- **AR-2 (Existente)**: Localización Acústica Instrumentada (VRA digitalizado con giro cefálico).
- **AR-3 (Existente)**: Selección Semántica por Fijación (dwell time de mirada / rayo nasal sobre dianas 3D).
- **AR-4 (Nuevo · Búsqueda Espacial "Lúa Salvaje")**: Rastreo cefálico 3D con radar / guía sensorial y retícula concéntrica para encontrar a Lúa en el espacio periférico (amplitud cervical y fijación foveal).
- **AR-5 (Nuevo · Lanzamiento y Captura "Alimentar a Lúa")**: Lanzamiento cinemático de pez dorado 3D hacia Lúa con respuesta de captura, ingesta (`MOOD(3)` / comiendo) y ronroneo (`MOOD(2)`).
- **AR-6 (Nuevo · Espejo Mímico "Buddy Lúa")**: Imitación interactiva de praxias y expresiones orofaciales guiadas por Lúa (sonrisa, asombro, inflar mejillas, pico) con validación geométrica de simetría bilateral.

### R2. Integración Centrada en Lúa (`lua-mascot-design`)
- Embodiment 3D procedural de Lúa (`lua.glb`, `pez.glb`, `estrella.glb`) con shaders PBR Filament deterministas (<100 KB).
- Espejo de estados afectivos y opcodes (`MOOD`, `ACCESSORY`, `AWARD`, `LEVEL`, `CELEBRATE`).
- Cero expresiones tristes / cero castigo: ante pérdida de postura o fallo, retorno suave a Atenta (`1`), preservando la motivación en terapia auditivo-verbal.

### R3. Pipeline Técnico y Motor Gráfico (`ar-mediapipe-sceneview-expert`)
- Motor gráfico desacoplado: Google Filament en Android (Kotlin 2.1.20, `TextureView` transparente sin bloqueo de Compose) y preparación de contrato neutral para Swift/RealityKit.
- Visión y tracking: MediaPipe Vision Tasks (`FaceLandmarker` 478 puntos + 52 blendshapes ARKit-compatibles, compensación IMU y `ScreenGeometry`).
- Generador de modelos 3D deterministas (`scripts/build-ar-models.js`) y suite de verificación de contrato (`npm run check:ar-models`).

### R4. Integración Limpia en TypeScript / React Native
- Actualización de tipos y puentes (`src/valeriaArBridge.ts`, `src/valeriaArSettings.ts`, `src/valeriaExerciseMeta.ts`, `src/i18n/`).
- Actualización de launcher y tarjetas UI (`src/ValeriaArLauncherScreen.tsx`, `src/ValeriaBlockIcons.tsx`).
- Telemetría Zero-PHI (`src/valeriaTelemetry.ts`): registro exclusivo de magnitudes físicas (ms, grados, ratios 0-1) y sellado de perfil de hardware.

## Acceptance Criteria

### Integridad Arquitectónica y Tipado
- [x] `npm run typecheck` pasa con 0 errores TypeScript.
- [x] `npm run check:ar-models` verifica todos los modelos GLB (8/8) con tamaño < 2 MB y animaciones exactas (`celebrate`, `spin360`).
- [x] `npm run check:ui-strings` valida todas las claves i18n en español e inglés sin textos planos huérfanos.

### Cumplimiento Clínico y Regulatorio
- [x] Cero veredictos automáticos o clasificaciones diagnósticas en dispositivo (MDR Clase I).
- [x] Las 6 actividades ofrecen telemetría física pura (latencias, ángulos, ratios) y sellan el perfil térmico/acústico.
- [x] Degradación elegante garantizada si no hay soporte nativo de cámara (Expo Go / dispositivos sin AR).

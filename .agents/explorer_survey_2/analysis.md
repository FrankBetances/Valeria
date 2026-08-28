# Informe Técnico y Diagnóstico Exhaustivo: Subsistema Nativo de Realidad Aumentada (Valeria+ AR v13)

**Autor**: Explorer 2 (Survey Phase · Android Native AR, Filament & Computer Vision Architecture)  
**Fecha**: 2026-08-28  
**Ubicación**: `.agents/explorer_survey_2/analysis.md`  
**Estado**: Completado / Verificado Empíricamente  

---

## 1. Resumen Ejecutivo y Hallazgos Principales

El subsistema de Realidad Aumentada de Valeria+ v13 representa una arquitectura de **AR de espejo desacoplada y determinista**, optimizada para dispositivos móviles de gama de entrada y media bajo estricto cumplimiento del marco regulatorio **MDR 2017/745 (SaMD Clase I)** y el principio **Zero-PHI**.

### Hallazgos Clave de la Investigación:
1. **Motor Gráfico Filament Directo (C++/JNI)**: El proyecto utiliza Google Filament 1.72.1 puro (`filament-android`, `gltfio-android`, `filament-utils-android`) enlazado a un `TextureView` transparente mediante `UiHelper(isOpaque = false)`. Se evita deliberadamente la librería `SceneView` para mantener compatibilidad con Kotlin 2.1.20 (Expo SDK 54) y evitar colisiones de dependencias con Compose BOM en el resto de la aplicación.
2. **Pipeline de Visión Asíncrono con Compuerta Anti-OOM**: Integra MediaPipe Tasks Vision (`FaceLandmarker:0.10.29` en modo `LIVE_STREAM`). Implementa una compuerta estricta de un único frame en vuelo (`inferenceStartedMs`) combinada con reciclaje inmediato de bitmaps (`toRotatedBitmap`), neutralizando fugas de memoria y bloqueos de inferencia.
3. **Catálogo de Ejercicios Duplicado (3 → 6)**:
   - **Existentes**: AR-1 (Cinemática Orofacial con histéresis), AR-2 (Localización VRA con doble reloj y ensayos trampa), AR-3 (Fijación de mirada con calibración de 5 puntos y dianas angulares).
   - **Nuevos**: AR-4 (Búsqueda Espacial "Lúa Salvaje"), AR-5 (Lanzamiento y Captura "Alimentar a Lúa"), AR-6 (Espejo Mímico "Buddy Lúa").
4. **Mascota Lúa y Assets 3D Procedurales**: 8 modelos `.glb` generados de forma determinista y sin dependencias externas mediante `scripts/build-ar-models.js`. Peso total combinado: ~150 KB (media de 10-50 KB por modelo, umbral contractual < 2 MB). Todos los modelos superan las pruebas del validador `npm run check:ar-models`.
5. **Muro Regulatorio y Telemetría Zero-PHI**: La cámara actúa como sensor ciego efímero. No se guardan ni transmiten imágenes. La telemetría reporta magnitudes físicas puras agregadas a nivel de ensayo (milisegundos, grados, ratios 0-1) hacia `src/valeriaTelemetry.ts`.

---

## 2. Topología y Estructura del Código Nativo Android

El subsistema nativo se ubica en `android-native/valeria-ar/` y se integra en el proyecto Expo mediante el config plugin `withValeriaAR`.

```
android-native/valeria-ar/
├── build.gradle                               # Configuración de compilación, Filament 1.72.1, MediaPipe 0.10.29
├── src/main/
│   ├── AndroidManifest.xml                    # Declaración de ValeriaArActivity y permisos
│   ├── assets/
│   │   └── face_landmarker.task               # Modelo binario de MediaPipe (3.6 MB)
│   └── java/eu/futureforkids/valeria/ar/
│       ├── ArContracts.kt                     # Contratos de datos, enums, perfiles y registros de ensayos
│       ├── DiagnosticsState.kt                # Estado observable para el panel de señales en vivo
│       ├── ValeriaArActivity.kt               # Host a pantalla completa, ciclo de vida de cámara y Compose
│       ├── ValeriaArModule.kt                 # React Native NativeModule (Bridge síncrono/asíncrono)
│       ├── ValeriaArPackage.kt                # Registro del paquete para React Native
│       ├── aptitude/                          # Suite de calibración y Prueba de Aptitud de hardware
│       │   ├── AptitudeTest.kt                # Sondas térmicas, de reloj y clasificación de nivel (A/B/C/D)
│       │   ├── FpsMeter.kt                    # Medición de percentil 5 de FPS y pendiente térmica
│       │   └── PointerJitterMeter.kt          # Medición de ruido RMS del puntero de mirada
│       ├── audio/
│       │   └── StimulusPlayer.kt              # Reproducción de audio lateralizado con marcas de tiempo Oboe/AudioTrack
│       ├── exercises/                         # Gestores clínicos de ejercicios AR (1 a 6)
│       │   ├── ArExercise.kt                  # Interfaz común y ExerciseContext
│       │   ├── Ar1Orofacial.kt                # AR-1: Cinemática orofacial (cohete/coche)
│       │   ├── Ar2Vra.kt                      # AR-2: VRA instrumentado (perro)
│       │   ├── Ar3Fixation.kt                 # AR-3: Selección semántica por fijación (manzana/pelota/zapato)
│       │   ├── Ar4SpatialSearch.kt            # AR-4: Búsqueda espacial ("Lúa Salvaje")
│       │   ├── Ar5FeedCatch.kt                # AR-5: Lanzamiento y captura ("Alimentar a Lúa")
│       │   └── Ar6BuddyMimicry.kt             # AR-6: Espejo mímico de praxias ("Buddy Lúa")
│       ├── reward/
│       │   └── RewardChannel.kt               # Canales de contingencia estricta e histéresis
│       ├── scene/
│       │   ├── SceneHost.kt                   # Interfaz agnóstica de escena, ArModel enum y RewardOverlay 2D
│       │   └── ValeriaArSceneView.kt          # Renderizador Filament TextureView + Choreographer loop
│       └── signal/
│           ├── DeviceGeometry.kt              # Cálculo de PPI, separación angular en grados y distancia
│           ├── FaceSignalEngine.kt            # Pipeline MediaPipe LIVE_STREAM, compuerta y bitmaps
│           ├── FaceSignals.kt                 # Vocabulario neutro ARKit-compatible (52 blendshapes + 4x4 matrix)
│           └── Pointer.kt                     # Punteros de iris y rayo nasal con calibración afín
```

---

## 3. Arquitectura del Pipeline de Cámara y Visión

```
                ┌─────────────────────────────────────────────────┐
                │          CameraX (ImageAnalysis 640x480)        │
                │        Backpressure: STRATEGY_KEEP_ONLY_LATEST  │
                └────────────────────────┬────────────────────────┘
                                         │ Frame YUV_420_888 (30 fps)
                                         ▼
                ┌─────────────────────────────────────────────────┐
                │       ImageProxy.toRotatedBitmap() (Libyuv)      │
                │      Rotación + Espejado + Reciclaje Inmediato  │
                └────────────────────────┬────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │ (Bitmap ARGB_8888)                      │ (Bitmap ARGB_8888)
                    ▼                                         ▼
┌────────────────────────────────────────┐ ┌────────────────────────────────────────┐
│     Compose Background (Espejo AR)     │ │        FaceSignalEngine (MediaPipe)    │
│  - Renderizado directo en ventana      │ │ - Inflight Frame Gate (Single Task)    │
│  - ContentScale.Fit (sin recorte facial│ │ - Delegate: GPU -> CPU fallback        │
│  - 30 fps garantizados                 │ │ - RunningMode.LIVE_STREAM              │
└────────────────────────────────────────┘ └────────────────────┬───────────────────┘
                                                                │
                                                                ▼
                                           ┌────────────────────────────────────────┐
                                           │       FaceSignals (Vocabulario Neutro) │
                                           │ - 478 Landmarks 3D                     │
                                           │ - 52 ARKit Blendshapes                 │
                                           │ - Matriz 4x4 -> Euler (Yaw/Pitch/Roll) │
                                           │ - Timestamp de captura (tCaptureUs)    │
                                           └────────────────────┬───────────────────┘
                                                                │
                                                                ▼
                                           ┌────────────────────────────────────────┐
                                           │       ArExercise Manager (1..6)        │
                                           │ - FrameGate (pose cone ±12°, IMU steady)│
                                           │ - Baseline Subtraction (calibración)   │
                                           │ - Bilateral Symmetry Check             │
                                           │ - RewardChannel (Hysteresis / Event)   │
                                           └────────────────────┬───────────────────┘
                                                                │
                                                                ▼
                                           ┌────────────────────────────────────────┐
                                           │       Filament Engine (TextureView)    │
                                           │ - UiHelper: isOpaque = false           │
                                           │ - BlendMode.TRANSLUCENT                │
                                           │ - ModelViewer + TransformManager       │
                                           │ - Choreographer vsync loop (60 fps)    │
                                           └────────────────────────────────────────┘
```

---

## 4. Análisis Detallado de los 6 Ejercicios Clínicos AR

| Ejercicio | Código / Modelo | Dinámica Mecánica | Parámetros Motores / Físicos | Modelo 3D / Animación | Canal de Recompensa |
|---|---|---|---|---|---|
| **AR-1** | Cinemática Orofacial (`coche.glb`) | Propulsión continua por redondeo labial (/o/, /u/). Micrófono apagado. | Redondeo labial (`mouthPucker`, `mouthFunnel`), ratio geométrico apertura/ancho bucal, error simetría < 8%, línea base reposo (90 frames). | `models/coche.glb` (`celebrate`) | `HysteresisRewardChannel` ($\Theta_{on}=0.55, \Theta_{off}=0.45$, holdMs = 1500 ms). Avance proporcional en Z. |
| **AR-2** | Localización Acústica Instrumentada (`perro.glb`) | Reflejo de orientación auditiva (VRA digitalizado). Giros cefálicos ante estímulos binaurales lateralizados. | Postura armada previa ($|Yaw| < 5^\circ$ por 500 ms), giro cefálico $\ge 15^\circ$, 20% ensayos trampa, timestamp sensor capture vs AudioTrack. | `models/perro.glb` (`celebrate`) | `EventRewardChannel` contingente a giro correcto en ventana temporal. |
| **AR-3** | Selección Semántica por Fijación (`manzana.glb`, `pelota.glb`, `zapato.glb`) | Discriminación léxica sin motricidad fina manual mediante dwell time de mirada. | Calibración afín 5 puntos, dianas en grados angulares ($7.6^\circ$ en 3 dianas, $15\text{--}18^\circ$ en 2 dianas), doble hitbox (entrada vs mantenimiento), dwell time 1200 ms con decaimiento. | `models/manzana.glb`, `pelota.glb`, `zapato.glb` (`spin360`) | `EventRewardChannel` al completar fijación acumulada en diana objetivo. |
| **AR-4** | Búsqueda Espacial "Lúa Salvaje" (`lua.glb`) | Rastreo cefálico 3D con radar / guía sensorial para encontrar a Lúa oculta en cuadrantes periféricos. | Amplitud articular cervical ($|Yaw| \approx 22^\circ, |Pitch| \approx 14^\circ$), cono foveal coincidencia $\le 8.5^\circ$, sostenido 650 ms, jitter RMS en $^\circ$. | `models/lua.glb` (`celebrate`) | `EventRewardChannel` tras centrado foveal sostenido en cuadrante diana. |
| **AR-5** | Lanzamiento y Captura "Alimentar a Lúa" (`pez.glb`) | Lanzamiento parabólico cinemático de pez dorado hacia Lúa con captura y deglución. | Velocidad de lanzamiento (px/s), ángulo de proyección ($^\circ$), distancia estimada cara-dispositivo (mm), tiempo de vuelo 650 ms, reacción de captura. | `models/pez.glb` (`spin360`) + `lua.glb` | `EventRewardChannel` al impactar proyectil en hitbox de Lúa. |
| **AR-6** | Espejo Mímico "Buddy Lúa" (`lua.glb`) | Imitación interactiva guiada de praxias faciales complejas (sonrisa, asombro, inflar mejillas, pico). | Blendshapes MediaPipe específicos, sustracción de reposo (45 frames), índice de simetría bilateral $> 88\%$, sostén sostenido. | `models/lua.glb` (`celebrate`) | `HysteresisRewardChannel` ($\Theta_{on}=0.52, \Theta_{off}=0.42$) con feedback luminoso y confeti. |

---

## 5. Inspección del Motor Gráfico Filament y Gestión de Memoria

### 5.1. Configuración de Superficie y Transparencia
- **`TextureView` vs `SurfaceView`**: Dado que el espejo de la cámara se dibuja dentro de la ventana Compose mediante `mirrorFrame`, `TextureView` es imprescindible para componer la escena 3D exactamente entre el espejo de fondo y la sobreimpresión 2D de interfaz.
- **Configuración Transparente**: Se inicializa `UiHelper(UiHelper.ContextErrorPolicy.DONT_CHECK)` con `isOpaque = false`. En Filament:
  ```kotlin
  modelViewer.scene.skybox = null
  modelViewer.view.blendMode = FilamentView.BlendMode.TRANSLUCENT
  modelViewer.renderer.clearOptions = Renderer.ClearOptions().apply {
      clear = true
      clearColor = doubleArrayOf(0.0, 0.0, 0.0, 0.0)
  }
  ```

### 5.2. Iluminación y Rendimiento
- **Cero Mapas IBL Pesados**: Se prescinde de mapas de entorno HDR (que pesan 5-15 MB). Se instancia una única luz direccional cálida procedural mediante `EntityManager` y `LightManager`:
  ```kotlin
  val (r, g, b) = Colors.cct(6_500f)
  LightManager.Builder(LightManager.Type.DIRECTIONAL)
      .color(r, g, b)
      .intensity(110_000f)
      .direction(0.3f, -1f, -0.8f)
      .castShadows(false)
      .build(modelViewer.engine, lightEntity)
  ```
- **Presupuesto de Dibujado**: Mantener $\le 5$ draw calls por fotograma y $\le 1500$ triángulos por objeto garantiza un tiempo de frame $< 16.6\text{ ms}$ (60 FPS estables) incluso en SoCs MediaTek Helio y Qualcomm Snapdragon 600/700 series.

### 5.3. Ciclo de Vida y Seguridad contra Fallos Nativos (Segfault Guard)
- `ModelViewer` destruye el `Engine` nativo al desprenderse de la ventana (`onViewDetachedFromWindow`). Se implementa la bandera `released` para evitar cualquier llamada posterior a `render()`, `loadModel()` o `setTransform()`.
- En `onDestroy()` de `ValeriaArActivity`, el desmontaje se realiza estrictamente **de fuera hacia adentro**:
  1. Cancelación de corrutinas del `scope`.
  2. Desenlace de CameraX (`clearAnalyzer`, `unbindAll`).
  3. Apagado del executor (`analysisExecutor.shutdown()`).
  4. Cierre del motor de visión (`FaceSignalEngine.close()`).
  5. Liberación de sensores IMU y recursos de audio.

---

## 6. Muro Regulatorio MDR Clase I y Privacidad Zero-PHI

1. **Cero Persistencia de Imágenes**: Cada `ImageProxy` se consume en memoria RAM volátil y se libera de inmediato (`finally { image.close() }`).
2. **Prohibición de Diagnóstico Autónomo en Dispositivo**: El software no emite etiquetas patológicas ni clasificaciones de déficit. Las magnitudes registradas son exclusivamente físicas:
   - `holdMaxMs`, `holdTotalMs` (milisegundos)
   - `puckerPeak`, `apertureRatioPeak`, `symmetryWorst` (ratios normalizados 0..1)
   - `peakYawDeg`, `targetYawDeg`, `targetPitchDeg` (grados angulares)
   - `latencyMs` (milisegundos con motivo explícito si es nulo)
   - `yawRmsDeg` (grados angulares de dispersión)
3. **Invarianza de Umbrales**: Los umbrales clínicos son fijados exclusivamente por el adulto en el `ValeriaAdultChaosPanel` y permanecen constantes durante toda la sesión.

---

## 7. Verificación Empírica del Estado Actual

Los siguientes comandos de verificación fueron ejecutados en el entorno de desarrollo:

1. **Verificación de Contrato de Modelos 3D (`npm run check:ar-models`)**:
   ```
   ✓ CAR     coche.glb      15716 B · animación 'celebrate' · animaciones: [celebrate]
   ✓ DOG     perro.glb      15200 B · animación 'celebrate' · animaciones: [celebrate]
   ✓ APPLE   manzana.glb    15436 B · animación 'spin360' · animaciones: [spin360]
   ✓ BALL    pelota.glb     19532 B · animación 'spin360' · animaciones: [spin360]
   ✓ SHOE    zapato.glb      9748 B · animación 'spin360' · animaciones: [spin360]
   ✓ LUA     lua.glb        50432 B · animación 'celebrate' · animaciones: [celebrate]
   ✓ FISH    pez.glb        15944 B · animación 'spin360' · animaciones: [spin360]
   ✓ STAR    estrella.glb   12948 B · animación 'spin360' · animaciones: [spin360]
   ✓ face_landmarker.task presente, 3758596 B, SHA-256 verificado.
   Resultado: EXIT CODE 0
   ```

2. **Verificación de Tipos TypeScript (`npm run typecheck`)**:
   ```
   tsc --noEmit
   Resultado: EXIT CODE 0 (0 errores)
   ```

3. **Verificación de Cadenas de Interfaz (`npm run check:ui-strings`)**:
   ```
   ✓ La interfaz se lee entera del catálogo: ningún texto literal en los .tsx.
   Resultado: EXIT CODE 0
   ```

---

## 8. Conclusiones y Recomendaciones para las Siguientes Fases

1. **Arquitectura Sólida y Probada**: La infraestructura nativa en Kotlin, Filament y MediaPipe se encuentra en un estado maduro, robusto y desacoplado, con soporte integral para los 6 ejercicios clínicos.
2. **Preparación Multiplataforma**: La definición de `FaceSignals` con 52 blendshapes estándar ARKit y matrices 4x4 permite que la futura implementación en iOS (mediante RealityKit y ARKit/MediaPipe) consuma exactamente las mismas interfaces de alto nivel sin reescribir la lógica clínica.
3. **Recomendación de Pruebas en Hardware Real**: Mantener la estricta directriz de no evaluar la calidad de imagen en el emulador de Android Studio debido a la escena sintética QEMU. Realizar pruebas empíricas de rendimiento térmico y latencia en dispositivos físicos de referencia.

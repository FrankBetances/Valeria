# `android-native/` · Fuentes nativas de Android

Aquí viven los módulos Android escritos a mano. El directorio `android/` lo
genera `expo prebuild` y **no se versiona**, así que cualquier código Kotlin
propio tiene que vivir fuera de él y entrar en la compilación a través de un
*config plugin*.

Es el espejo de `ios-native/`, que hace lo mismo para Xcode.

| Módulo | Qué es | Cómo entra en el build |
| --- | --- | --- |
| `valeria-ar/` | Host nativo del bloque de **Realidad Aumentada**: CameraX → MediaPipe Face Landmarker → capa de recompensa → escena 3D (Filament) | [`plugins/withValeriaAR.js`](../plugins/withValeriaAR.js) |

## Cómo lo monta el plugin

`withValeriaAR` hace cinco cosas en cada `expo prebuild`:

1. **Copia** `android-native/valeria-ar` a `android/valeria-ar`.
2. **Incluye** el módulo en `android/settings.gradle` (`include ':valeria-ar'`).
3. **Añade** la dependencia `implementation project(':valeria-ar')` al
   `build.gradle` de la app.
4. **Registra** `ValeriaArPackage()` en `MainApplication.kt`.
5. **Declara** el permiso `android.permission.CAMERA` y el `uses-feature`
   opcional de cámara frontal en el manifiesto, y sube `minSdkVersion` a 24 si
   estuviera por debajo.

Nada de esto toca los seis bloques en producción ni la Arquitectura Antigua:
`newArchEnabled` sigue en `false`.

## Cómo trabajar con él

```bash
npx expo prebuild -p android     # regenera android/ y vuelve a copiar el módulo
npm run android                  # compila e instala en el teléfono conectado
```

Al editar Kotlin hay que **volver a lanzar el prebuild** (o editar
`android/valeria-ar` y copiar los cambios de vuelta a mano antes de commitear:
lo que se versiona es `android-native/`, no `android/`).

## Cómo se componen las tres capas (no tocar a la ligera)

La pantalla de RA son tres superficies distintas, y el orden entre ellas es
frágil porque un `SurfaceView` **no dibuja en la ventana**: dibuja en una
superficie propia y recorta un agujero transparente en la ventana para dejarla
ver. Todo lo que se hubiera pintado ahí debajo desaparece.

| Capa | Cómo se implementa | Sublayer |
| --- | --- | --- |
| Preview de la cámara | `PreviewView` en modo **PERFORMANCE** (`SurfaceView`) | −2 |
| Escena 3D de Filament | `SurfaceView` con `UiHelper.isOpaque = false` y `isMediaOverlay = true` | −1 |
| Interfaz 2D de Compose | La ventana (texto, dianas, anillo de progreso, panel de señales) | 0 |

Dos reglas que se rompieron una vez y costaron una sesión de campo entera:

1. **El preview no puede ir en modo `COMPATIBLE`.** Ese modo lo dibuja en un
   `TextureView`, es decir dentro de la ventana, y el `SurfaceView` de Filament
   —que se compone después— lo borra al recortar su agujero.
2. **El `UiHelper` de Filament tiene que ser translúcido**, y hay que
   configurarlo *antes* de `attachTo()`. `attachTo()` sobrescribe el
   `setZOrderOnTop()` y el `setFormat()` del holder, y solo pide un swapchain
   `CONFIG_TRANSPARENT` si `isOpaque` es `false`. Con el helper por defecto la
   superficie sale OPACA: el niño ve el contenido indefinido del buffer —bloques
   y polígonos de colores planos— en lugar de su propia cara, con el modelo 3D
   dibujándose correctamente encima y el texto 2D intacto, que es exactamente el
   cuadro que hay que reconocer si vuelve a aparecer.

## Assets

Ambos están ya en el repositorio; estos comandos existen para regenerarlos o
verificarlos, no para completar un hueco.

| Asset | Dónde | Cómo se obtiene |
| --- | --- | --- |
| **Modelos 3D** (`coche`, `perro`, `manzana`, `pelota`, `zapato`) | `assets/models/*.glb` — el plugin los copia a `src/main/assets/models/` en cada prebuild | `npm run build:ar-models` · obra propia, CC0, 74 KB los cinco |
| **Modelo de señal facial** (`face_landmarker.task`, 3,6 MB) | `valeria-ar/src/main/assets/` | `npm run fetch:ar-model` · Google, Apache-2.0, revisión fijada con SHA-256 verificado |

`npm run check:ar-models` comprueba las dos cosas y, sobre todo, que los nombres
de animación de los `.glb` siguen coincidiendo con los que invoca el enum
`ArModel` de Kotlin. Ese desajuste no rompe el build: rompe el refuerzo, en
silencio y en el teléfono de una familia.

Si faltaran los `.glb`, la escena cae a la sobreimpresión 2D y los tres
ejercicios siguen siendo jugables y medibles. Si faltara el `.task`, el
`build.gradle` del módulo falla con la instrucción delante.

## Estado

**El módulo compila** contra el SDK de Android real (`compileReleaseKotlin` y
`assembleRelease` en verde en CI, 2026-08-02) y produce su AAR. Las APIs de
`tasks-vision` 0.10.29 y Filament 1.72.1 están verificadas por el compilador,
no solo por inspección.

**Ya ha corrido en un teléfono**, y esa primera ejecución encontró justo lo que
un compilador no puede ver. Los cuatro fallos y su corrección:

| Síntoma en el teléfono | Causa | Dónde se corrigió |
| --- | --- | --- |
| Fondo de cámara como bloques de colores planos | Superficie de Filament opaca recortando el preview (ver arriba) | `ValeriaArSceneView`, `ValeriaArActivity` |
| La sesión no avanzaba nunca a la tarea siguiente | Los tres ejercicios solo progresan con la cara dentro; sin ella el bucle giraba indefinidamente | `ValeriaArActivity` (vigilancia y cierre con `timeout`) |
| Cierre inesperado tras unos minutos | Frames encolados dentro de MediaPipe con su bitmap, sin contrapresión, más un mapa de marcas de tiempo compartido por dos hilos | `FaceSignalEngine`, `FpsMeter` |
| «Mira a la osita» sin osita en pantalla | La Prueba de Aptitud no dibujaba ninguna diana | `ValeriaArActivity` |

Lo que sigue **sin verificarse en campo** son los fps sostenidos, la carga del
Face Landmarker en gama baja y la calidad real de la señal facial: eso es la
Fase 1 del
[plan](../docs/plan-integracion-rehabilitacion-ar.md#fase-1--andamiaje-sin-ejercicios).

Los índices de landmark canónicos (33/263 cantos externos, 61/291 comisuras,
13/14 borde labial) siguen marcados en el código como *a verificar contra el
modelo real*, no como constantes de fe: el compilador no puede opinar sobre eso.

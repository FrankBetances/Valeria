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

## Todo se dibuja en la ventana. No metas SurfaceViews aquí

La pantalla de RA son cuatro capas y **las cuatro se pintan dentro de la
ventana**, en el orden en que se leen en el Composable:

```
espejo de cámara → escena 3D (Filament) → sobreimpresión 2D → texto
```

| Capa | Cómo se implementa |
| --- | --- |
| Espejo de la cámara | Los frames de `ImageAnalysis`, ya orientados, pintados con `Image` de Compose |
| Escena 3D de Filament | `TextureView` con `UiHelper.isOpaque = false` |
| Interfaz 2D | Compose: texto, dianas, anillo de progreso, panel de señales |

Dos de estas tres piezas se decidieron sobre un diagnóstico equivocado, y hay
que saberlo antes de tocarlas:

1. **El caso de uso `Preview` de CameraX se retiró — sobre una premisa falsa.**
   Se creyó que su superficie no recibía frames porque el fondo salía como
   polígonos planos de colores. La causa real era que las pruebas se hacían en el
   **emulador de Android Studio**, cuya cámara sirve una escena sintética con ese
   aspecto exacto. El `Preview` funcionaba; mostraba lo que el emulador le daba.
   En un móvil real, un `PreviewView` es mejor —resolución completa del sensor y
   composición por hardware, sin bitmap ni textura por frame—. Volver a él es una
   **decisión abierta**, a tomar con un teléfono delante.
2. **La escena 3D va en `TextureView` por consecuencia, no por elección.** Un
   `SurfaceView` dibuja fuera de la ventana y siempre en un sublayer por debajo
   de ella, así que con el espejo dentro de la ventana quedaría tapado. Si el
   espejo vuelve al `Preview`, esto debería volver a `SurfaceView` con
   `isMediaOverlay = true` y ahorrarse la copia por GPU de cada frame.
3. **El `UiHelper` de Filament tiene que ser translúcido. Esto sí era un fallo
   real.** Hay que configurarlo *antes* de `attachTo()` —que es lo que hace el
   constructor de `ModelViewer`—: es lo que pone `isOpaque = false` en la vista y
   crea el swapchain con `CONFIG_TRANSPARENT`. El código original ponía
   `setZOrderOnTop(true)` y `PixelFormat.TRANSLUCENT` sobre el holder por su
   cuenta, y no servía de nada, porque `attachTo()` sobrescribe ambas. Con el
   helper por defecto la escena se dibuja sobre fondo opaco y tapa la cámara
   entera: eso habría roto la composición en cualquier teléfono.

Precio actual: el espejo son 640×480 escalados —más blandos que un preview por
hardware— y la escena paga la copia por GPU de un `TextureView`.

## El bloque de RA NO se puede evaluar en un emulador

Costó cuatro rondas de depuración, así que queda escrito. El emulador de Android
Studio **no simula una cámara con una cara delante**: sirve una escena sintética
de polígonos planos verdes, marrones y grises. Eso produce dos síntomas que
imitan a la perfección sendos fallos que no existen:

- el fondo parece **memoria gráfica corrupta**, y no lo está: es esa escena,
  renderizada correctamente;
- el rastreo facial reporta **cero caras**, con toda la razón, porque en esa
  escena no hay ninguna cara — y como los tres ejercicios solo progresan con la
  cara dentro, la sesión no avanza.

La app lo detecta (`isEmulator()` en `ValeriaArActivity`) y lo dice en pantalla
desde el primer segundo. **Solo avisa, nunca bloquea**: en el emulador se
desarrollan la interfaz, los flujos y la telemetría con toda normalidad. Lo
único que no se puede hacer ahí es juzgar la imagen ni la señal facial.

## La ficha de cámara

Mientras no se haya reconocido **ni una cara**, la pantalla muestra arriba a la
derecha lo único que sirve para diagnosticar sin tener el teléfono delante:

```
Xiaomi 22120RN86G · Android 14 (API 34)
sensor  640×480 fmt=35 planos=3 rowStride=640 pxStride=1 rot=270°
espejo  480×640 ARGB_8888
frames 312 · inferencias 104 · caras 0
```

Cada cifra descarta una hipótesis concreta:

- **La primera línea** → fabricante y modelo. Si dice `sdk_gphone` o `Emulator`,
  ya está: no hay nada que depurar, es el emulador.
- **`frames 0`** → la cámara no entrega nada; el resto del recorrido es
  irrelevante.
- **`width × height` minúsculo** → resolución absurda negociada con el sensor y
  estirada a pantalla completa, que se ve igual que una conversión rota.
- **`rowStride` distinto de lo esperado para el formato** → los bytes se leen
  con el ancho equivocado, que es lo que produce bloques de color abstractos.
- **`error …`** → `toBitmap()` rechazó el formato, con su mensaje exacto.
- **`caras 0` con todo lo demás sano** → el problema está en el modelo o en el
  encuadre, no en la cámara.

Desaparece sola en cuanto llega la primera cara: es un diagnóstico, no adorno,
y al niño no le sobra ni un elemento en pantalla.

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

**Ha corrido en emulador, no todavía en un teléfono.** Esa distinción es la
lección cara de este módulo: dos de los «fallos» que se persiguieron —el fondo
corrupto y la ausencia de rastreo facial— eran el emulador comportándose con
normalidad (ver la sección de arriba). El resto sí eran defectos reales, y la
ejecución los sacó a la luz aunque fuera por el motivo equivocado:

| Defecto real | Dónde se corrigió |
| --- | --- |
| La escena 3D se creaba con un swapchain opaco que habría tapado la cámara entera | `ValeriaArSceneView` |
| La sesión no terminaba nunca sin cara: el bucle de ejercicio giraba indefinidamente con la cámara abierta | `ValeriaArActivity` (vigilancia y cierre con `timeout`) |
| Frames encolándose dentro de MediaPipe con su bitmap, sin contrapresión | `FaceSignalEngine` |
| Mapa de marcas de tiempo y `FpsMeter` tocados por dos hilos; `FpsMeter` además crecía sin techo | `FaceSignalEngine`, `AptitudeTest` |
| El motor de Filament no se destruía: `destroyModel()` deja vivos motor, renderer, swapchain y contexto EGL | `ValeriaArSceneView` |
| Cierre del motor de señal antes de parar el executor que le entrega frames | `ValeriaArActivity` |
| «Mira a la osita» sin ninguna osita en pantalla | `ValeriaArActivity` |
| `targetRotation` sin actualizar: girar el móvil 180° dejaba la imagen boca abajo | `ValeriaArActivity` |

Sigue **sin verificarse en un teléfono real** absolutamente todo lo que depende
de la cámara y de la señal: que el espejo muestre la cara, que el Face
Landmarker cargue y detecte, los fps sostenidos, y si los cierres inesperados
persisten. Eso es la Fase 1 del
[plan](../docs/plan-integracion-rehabilitacion-ar.md#fase-1--andamiaje-sin-ejercicios).

Los índices de landmark canónicos (33/263 cantos externos, 61/291 comisuras,
13/14 borde labial) siguen marcados en el código como *a verificar contra el
modelo real*, no como constantes de fe: el compilador no puede opinar sobre eso.

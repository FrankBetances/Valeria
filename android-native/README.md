# `android-native/` · Fuentes nativas de Android

Aquí viven los módulos Android escritos a mano. El directorio `android/` lo
genera `expo prebuild` y **no se versiona**, así que cualquier código Kotlin
propio tiene que vivir fuera de él y entrar en la compilación a través de un
*config plugin*.

Es el espejo de `ios-native/`, que hace lo mismo para Xcode.

| Módulo | Qué es | Cómo entra en el build |
| --- | --- | --- |
| `valeria-ar/` | Host nativo del bloque de **Realidad Aumentada**: ARCore → MediaPipe Face Landmarker → capa de recompensa → escena 3D (Filament) | [`plugins/withValeriaAR.js`](../plugins/withValeriaAR.js) |

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

## La cámara la manda ARCore (31/8/2026)

**Este apartado sustituye al anterior, que decía justo lo contrario.** Hasta
esta fecha el módulo montaba su propia tubería de cámara con CameraX y pintaba
el espejo dentro de la ventana con Compose; se prohibían los `SurfaceView` por
esa razón. Esa arquitectura **se cayó en un Pixel real**, y con ella se fue el
motivo de la prohibición.

Lo que hay ahora son tres capas, y la de abajo ya no es nuestra:

```
GLSurfaceView (ARCore pinta la cámara) → ComposeView transparente (2D) → texto
```

| Capa | Cómo se implementa |
| --- | --- |
| Espejo de la cámara | `GLSurfaceView` + `CameraBackgroundRenderer`: ARCore escribe en una textura `GL_TEXTURE_EXTERNAL_OES` y se dibuja sobre un cuadrilátero |
| Interfaz 2D | `ComposeView` **sin fondo**, añadido encima del `GLSurfaceView` |

### Qué se ganó exactamente

- **Cero copias por CPU.** El espejo anterior convertía cada frame a un bitmap
  ARGB_8888 de 1,2 MB, lo rotaba a otro de 1,2 MB y lo publicaba en el hilo de
  UI: unos 72 MB/s de asignación para enseñar lo que la GPU ya tenía. Ahora no
  hay ni un bitmap en el camino del espejo.
- **Un solo hilo y un solo reloj.** Antes: executor de análisis, `Choreographer`
  de Filament, `UiHelper` con su swapchain y el ciclo de vida de la Activity.
  Ahora: `onDrawFrame`. La mitad de la lista de defectos de más abajo era
  coordinación entre esos cuatro.
- **El encuadre lo calcula ARCore.** `transformCoordinates2d` sustituye a la
  aritmética de `targetRotation` y `rowStride` que costó dos rondas de
  depuración persiguiendo imágenes torcidas.
- **MediaPipe solo se despierta si ARCore ve una cara**, y la conversión YUV a
  bitmap va DESPUÉS de la compuerta de contrapresión, no antes. Dos de cada tres
  conversiones desaparecen.

### Lo que ARCore NO da, y por eso MediaPipe sigue aquí

Verificado en el sample `augmented_faces_java` del propio SDK, no de memoria: la
API `AugmentedFace` expone `getCenterPose()`, `getRegionPose()` y la malla
`MESH3D`. **No hay blendshapes.** AR-1 (redondeo labial de /o/ y /u/) y AR-6
(mimetismo) viven de los 52 coeficientes ARKit, así que MediaPipe se queda —
pero degradado a consumidor de píxeles: ARCore le pasa el frame por
`acquireCameraImage()` y no se abre ninguna segunda sesión de cámara.

**La imagen la cierra quien la pide.** El pool de ARCore es finito y agotarlo no
da error: deja de entregar frames y la sesión se queda muda a los pocos
segundos. Lo sujeta `check-ar-concurrency.js`, que exige el `use {}`.

### Y una constatación que zanja el debate de las dos cámaras

ARCore obliga a elegir la dirección de cámara **en la sesión**
(`CameraConfigFilter.setFacingDirection`), exactamente igual que CameraX. La
restricción de «una sola cámara a la vez» nunca fue de CameraX: es del teléfono.
Un ejercicio de AR de mundo real con la cámara trasera seguiría siendo un
ejercicio **distinto**, no una variante de estos seis — y mediría la pose del
móvil (brazo y tronco), no la del cuello.

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
sensor  640×480 fmt=35 planos=3 rowStride=640 pxStride=1
arcore  1280×960 · cara no · rot=180°
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
- **`cara no` en la línea `arcore`** → el que no ve la cara es ARCore, y
  MediaPipe ni se despierta: no se busque el fallo en el modelo.
- **`rot=`** → los grados con que se gira la imagen antes de dársela a
  MediaPipe. Un `rot=0°` con `caras 0` en un teléfono real es sospechoso: la
  orientación del sensor frontal casi nunca es 0.
- **`error …`** → la conversión YUV rechazó el formato, con su mensaje exacto.
- **`caras 0` con todo lo demás sano** → el problema está en el modelo o en el
  encuadre, no en la cámara.

La línea `sensor` se toma del PRIMER frame que ARCore entregue, **haya cara o
no**. Hasta el 1/9/2026 se tomaba dentro de la compuerta de la cara, así que
salía vacía justo en el escenario para el que se escribió la ficha.

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

**Reescrito sobre ARCore el 31/8/2026.** Decisión de Frank tras ejecutar la
versión anterior en un Pixel: se colgaba. **Compila y produce APK; no se ha
probado en el teléfono.** Lo que se sabe y lo que no, separado a propósito:

| | Evidencia |
| --- | --- |
| **El Kotlin compila** | Builds **627** y **628**, paso `Build signed release APK` (`assembleRelease`) en verde tras 12 min |
| **Pasa R8 y se firma** | `:app:minifyReleaseWithR8` en verde en el 627. El 626 murió justo ahí y por eso existen las reglas nuevas de `consumer-rules.pro` |
| Los 25 gates y el typecheck | Verdes en CI (pasos 6‑31) y en local |
| ARCore 1.54.0 existe | Tag `v1.54.0` del SDK responde 200 |
| Hay APK instalable | Artefacto `android-apk` del run **628** (`workflow_dispatch` sobre la rama) |
| **NO comprobado** | Absolutamente todo lo que pasa en el teléfono: que ARCore abra la cámara, que el espejo se vea, que MediaPipe reciba los frames, los fps sostenidos, y **si los cuelgues se acabaron**. Y desde el 1/9/2026, tampoco está comprobado en hardware lo de la tabla siguiente: la rotación de análisis y el espejo son aritmética, no medida |

Los gates y el typecheck **no ven** un shader que no compila, una textura negra
ni una sesión que se cierra sola. Que compile no dice que funcione: eso es
exactamente lo que ya pasó con la versión de CameraX, que compilaba y se caía.

### Para bajarse el APK de una rama

`android.yml` compila en cada push a cualquier rama, pero **solo sube el
artefacto en `main` o con `workflow_dispatch`**. Para probar en el Pixel sin
mergear: pestaña *Actions* → *Android Build* → botón **Run workflow**, eligiendo
la rama. Ese run sí deja `android-apk` descargable.

### Lo que la reescritura se lleva por delante

Estos defectos, listados antes como corregidos uno a uno, ahora son
estructuralmente imposibles porque el código que los contenía ya no existe:

| Defecto de la versión CameraX | Por qué ya no puede pasar |
| --- | --- |
| Motor de Filament sin destruir: swapchain y contexto EGL vivos | El contexto GL lo gestiona `GLSurfaceView` |
| Cierre del motor de señal antes de parar el executor que le da frames | No hay executor: el único hilo que llama a `analyze()` es el de GL, y `glView.onPause()` lo para |
| Frames encolándose dentro de MediaPipe con su bitmap | La conversión va después de la compuerta, y solo si ARCore ve una cara |
| `targetRotation` sin actualizar: girar el móvil dejaba la imagen boca abajo | Lo calcula `transformCoordinates2d` |
| Mapa de marcas de tiempo y `FpsMeter` tocados por dos hilos | Un solo hilo |

Lo que **sigue igual y sin verificar**: los índices de landmark canónicos
(33/263 cantos externos, 61/291 comisuras, 13/14 borde labial) siguen marcados
en el código como *a verificar contra el modelo real*. El compilador no puede
opinar sobre eso y ARCore tampoco.

### Y lo que la reescritura se dejó por el camino (1/9/2026)

Cuatro cosas que la tubería de CameraX hacía y que el puerto a ARCore no
reimplementó. Ninguna rompe la compilación, ninguna la veían los 25 gates, y las
dos últimas no dan error en el teléfono: dan un dato equivocado. Están
arregladas, y ahora las sujeta `check-ar-concurrency.js`, que hasta hoy no
miraba ni el paquete `session/` ni esta llamada.

| Qué se perdió | Qué provoca | Dónde vuelve |
| --- | --- | --- |
| La rotación de pantalla entraba por el hilo de UI: `setDisplayGeometry` mientras el de GL estaba en `update()`, y tres enteros normales leídos desde el otro hilo | Girar el móvil 180° a mitad de sesión podía dejar la imagen boca abajo. Es el defecto de `targetRotation` con otra ropa, en el rediseño que se justificó en «un solo hilo» | `ArRenderer`: el hilo de UI deja un aviso `@Volatile` y el de GL lo recoge antes de `update()`, como el `DisplayRotationHelper` de los samples |
| La geometría del sensor se tomaba DENTRO de la compuerta de la cara | La línea `sensor …` de la ficha salía vacía en el escenario «caras 0», que es el único en que se mira | `onGlFrame`: una sola adquisición por vuelta, la geometría antes de la compuerta |
| `rotationDegrees = 0` fijo donde CameraX daba `imageInfo.rotationDegrees` | La imagen del sensor llega tumbada al Face Landmarker, que no es invariante a rotación: **cero caras con el niño delante**, sin un solo error en el log | `refreshAnalysisRotation()`: `(SENSOR_ORIENTATION + rotación del display) % 360` |
| `mirror = false` donde CameraX pasaba `isFrontCamera = true` **siempre** | Lo peor de los cuatro: «gira a la derecha» se registra como giro a la izquierda en TODOS los ensayos de AR-2. No es ruido que se diluya en la media, es sesgo con signo — y el aviso estaba escrito en `toUprightBitmap`, dentro del propio fichero | `mirror = true` |

Los dos primeros son razonamiento sobre el código y se sostienen solos. Los dos
últimos son **aritmética y arqueología del commit anterior, no medida en un
teléfono**: la fórmula reproduce la cifra que CameraX regalaba, y el espejo
restaura lo que la tubería anterior hacía sin excepción. Si en el Pixel siguen
saliendo `caras 0`, esta es la primera piedra que levantar.

### La escena 3D de Filament: sigue viva, pero sin integrar con ARCore

`ValeriaArSceneView` **no se ha tocado** y sigue montándose dentro del
ComposeView, así que Filament sigue corriendo en su propio `TextureView`. La
composición que eso produce es, en teoría, la correcta:

```
GLSurfaceView (cámara, fuera de la ventana, debajo)
  → TextureView de Filament (3D, dentro de la ventana, encima)
    → Compose 2D
```

Y es mejor que la anterior: el `TextureView` estaba ahí precisamente porque un
`SurfaceView` habría quedado por debajo del espejo cuando el espejo se pintaba
dentro de la ventana. Ahora el espejo es el que está fuera de la ventana, que es
su sitio.

**Lo que no se ha hecho es compartir el contexto GL de ARCore con Filament**, y
lo que no se sabe es si las dos superficies componen bien en un teléfono real.
Es la primera sospechosa si en el Pixel la cámara aparece tapada. Se dejó así a
propósito: Filament era el componente más propenso a cuelgues de la lista de
arriba, y rehacerlo en el mismo cambio habría hecho imposible saber qué arregló
qué en la primera prueba. Si estorba, la degradación a sobreimpresión 2D ya está
contemplada y los seis ejercicios siguen siendo jugables y medibles sin 3D.

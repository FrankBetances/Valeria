# Plan de integración · Módulo de Rehabilitación con Realidad Aumentada

> **Documento de planificación y plan de trabajo.** Define cómo integrar
> **MediaPipe** (cinemática facial desde la cámara) y **SceneView** (escena 3D
> Filament) en Valeria+ para crear un bloque de rehabilitación nuevo basado en
> **Gamificación Condicionada (Feedback Visual Desacoplado)**: el refuerzo
> visual 3D se dispara **solo** cuando el niño ejecuta la conducta motora
> objetivo, nunca por acierto acústico ni por paso del tiempo.
>
> Tres ejercicios en el alcance inicial: **AR-1 Cinemática Orofacial**,
> **AR-2 VRA Digitalizado** (reflejo de orientación auditiva) y
> **AR-3 Selección Semántica por Fijación**.
>
> Encuadre regulatorio: **SaMD Clase IIa (MDR)** · **permiso de cámara nuevo**
> (RGPD art. 9 + Google Play *Datos de usuario*, *Permisos sensibles* y
> *Familias*).
>
> **Hardware del piloto: teléfonos móviles Android de gama media / media-alta**
> (no tablets). iOS no es requisito de v1, pero el diseño reserva el camino
> (§13).
>
> Estado: 🟡 planificación · Rama de trabajo: `claude/rehab-ar-planning-s1f8qo`

---

## Índice

- [1. Objetivo y principio rector](#1-objetivo-y-principio-rector)
- [2. Estado real de las dos dependencias externas](#2-estado-real-de-las-dos-dependencias-externas)
- [3. La decisión de arquitectura (la que condiciona todo el resto)](#3-la-decisión-de-arquitectura-la-que-condiciona-todo-el-resto)
  - [3.4 Perfil de hardware: BYOD de gama media en LATAM](#34-perfil-de-hardware-byod-de-gama-media-en-latam)
  - [3.5 Prueba de Aptitud del Dispositivo](#35-prueba-de-aptitud-del-dispositivo-el-sustituto-de-conocer-el-modelo)
- [4. Arquitectura objetivo](#4-arquitectura-objetivo)
- [5. Capa de señal: qué extrae MediaPipe y cómo se normaliza](#5-capa-de-señal-qué-extrae-mediapipe-y-cómo-se-normaliza)
- [6. Capa de recompensa: el contrato de Feedback Visual Desacoplado](#6-capa-de-recompensa-el-contrato-de-feedback-visual-desacoplado)
- [7. Los tres ejercicios en detalle](#7-los-tres-ejercicios-en-detalle)
  - [7.1 AR-1 · Cinemática Orofacial como gatillo](#71-ar-1--cinemática-orofacial-como-gatillo)
  - [7.2 AR-2 · VRA digitalizado (reflejo de orientación)](#72-ar-2--vra-digitalizado-reflejo-de-orientación)
  - [7.3 AR-3 · Selección semántica por fijación](#73-ar-3--selección-semántica-por-fijación)
- [8. Telemetría, dataset y exportación](#8-telemetría-dataset-y-exportación)
- [9. Privacidad, MDR y Play Console (bloqueante)](#9-privacidad-mdr-y-play-console-bloqueante)
- [10. Superficie de integración (cambios por archivo)](#10-superficie-de-integración-cambios-por-archivo)
- [11. Garantías de no regresión](#11-garantías-de-no-regresión)
- [12. Plan de trabajo por fases](#12-plan-de-trabajo-por-fases)
- [13. Plan de iOS (v2, no bloqueante)](#13-plan-de-ios-v2-no-bloqueante)
- [14. Riesgos y mitigaciones](#14-riesgos-y-mitigaciones)
- [15. Decisiones abiertas que necesitan a Frank](#15-decisiones-abiertas-que-necesitan-a-frank)
- [16. Seguimiento](#16-seguimiento)

---

## 1. Objetivo y principio rector

Añadir a Valeria+ un **séptimo bloque** —Realidad Aumentada— hermano de los seis
actuales (Pares Mínimos, Expansión Semántica, Audición, Lenguaje, TEA,
Dislexia), en el que la cámara frontal deja de ser un grabador y pasa a ser un
**sensor de conducta motora**.

**El principio rector es el desacoplamiento.** En los seis bloques actuales el
refuerzo va atado a la producción acústica: el niño dice la palabra, el ASR la
valida, aparece la estrella. Eso tiene un coste clínico conocido —el niño con
dislalia funcional escucha su propio error y se frustra antes de haber
consolidado el gesto motor—. Aquí se rompe ese lazo:

> **El refuerzo visual 3D se condiciona exclusivamente a la conducta motora
> objetivo** (postura labial, giro cefálico, fijación sostenida). El micrófono
> está **apagado** en AR-1 y AR-3. Se premia el esfuerzo motor **antes** de
> exigir la fonación.

**Muro MDR (innegociable, heredado del módulo TEA/Dislexia).** El Panel del
Adulto sigue siendo la única puerta de entrada a los parámetros de carga. Los
umbrales clínicos (1,5 s de sostén, 15° de giro, 1,2 s de *dwell*) son
**configurables por el adulto y constantes dentro de la sesión**: la app jamás
los adapta sola. El módulo **mide y registra**; el veredicto clínico es de una
persona.

**Dentro del alcance:** un host nativo de cámara + escena 3D, la capa de señal
facial, la capa de recompensa, tres ejercicios, calibración por paciente,
telemetría por ensayo y la actualización de política de privacidad + *Data
Safety*.

**Fuera del alcance:** diagnóstico automático, ajuste adaptativo de dificultad,
modelos en servidor, grabación o subida de vídeo, reconocimiento de identidad
facial, y AR de mundo real con la cámara trasera (ver §3.3).

---

## 2. Estado real de las dos dependencias externas

Antes de planificar hay que decir en qué estado están de verdad los dos repos.
Esto es lo que condiciona el plan entero.

### 2.1 SceneView — `sceneview/sceneview`

| Aspecto | Estado (comprobado 2026-08-01) |
| --- | --- |
| Artefactos Android | `io.github.sceneview:sceneview:4.25.0` (solo 3D) · `io.github.sceneview:arsceneview:4.25.0` (3D + ARCore) |
| Requisitos Android | `minSdk 24`, `targetSdk 36`, Kotlin 2.4.x, Jetpack Compose |
| Madurez Android | **Estable.** Carga glTF/GLB, `ModelNode` con `autoAnimate`, `animationName`, `animationSpeed`; hit-test declarativo |
| Binding React Native | `@sceneview-sdk/react-native` v4.25.0 (npm, publicado 2026-07-21) — **alpha, Fabric** |
| Estado del binding RN | 3D funciona en ambas plataformas; AR solo Android; **`onTap` declarado pero el lado nativo no despacha eventos**; `depthOcclusion` e `instantPlacement` aceptados pero no cableados; **API de raycast no documentada** |
| iOS | RealityKit, iOS 17+, Xcode 15+; el podspec **omite a propósito** `SceneViewSwift` (hay que añadirlo a mano por SPM) |

> **Lectura:** el binding de React Native no despacha eventos táctiles ni expone
> raycasting. AR-3 es *literalmente* un ejercicio de raycasting con *dwell
> time*. Construir sobre el binding RN alpha significa construir sobre el hueco
> exacto que necesitamos.

### 2.2 MediaPipe — cámara-diagnóstico

| Aspecto | Estado |
| --- | --- |
| Vía nativa Android | `com.google.mediapipe:tasks-vision` · **Face Landmarker** en modo `LIVE_STREAM` con `detectAsync(image, timestampMs)` y `resultListener`. Madura, mantenida por Google |
| Salidas relevantes | 478 landmarks 3D (incluye iris) · **52 blendshapes** compatibles ARKit (`mouthPucker`, `mouthFunnel`, `jawOpen`…) si `outputFaceBlendshapes = true` · **matrices de transformación facial 4×4** si `outputFacialTransformationMatrixes = true` (→ *head pose*) |
| Vía React Native | `react-native-mediapipe` v0.6.0, **última publicación diciembre de 2024**. Depende de `react-native-vision-camera` + `react-native-worklets-core`, es decir del mundo VisionCamera 3/4 |
| Problema | VisionCamera va por **5.2.1** sobre **Nitro Modules** (Nueva Arquitectura). El wrapper de MediaPipe lleva ~20 meses sin tocar y no cubre esa migración |

> **Lectura:** las tres señales que necesitamos —blendshapes labiales, *head
> pose* y iris— salen todas del **mismo** `FaceLandmarkerResult`. En Kotlin eso
> es una llamada; en JS es un wrapper abandonado más un puente por frame.

---

## 3. La decisión de arquitectura (la que condiciona todo el resto)

### 3.1 El contexto de Valeria+

`app.json` declara `"newArchEnabled": false`. Expo SDK 54 es **la última versión
donde la Nueva Arquitectura se puede desactivar**; SDK 55 la impone. El árbol es
Expo prebuild (hay `plugins/`, `ios-native/`, `eas.json`), RN 0.81.5, React
19.1.

### 3.2 Las tres opciones

| Opción | Qué implica | Veredicto |
| --- | --- | --- |
| **A · Todo en JS** | Activar Nueva Arquitectura en toda la app + VisionCamera 5 + un *frame processor* propio + `@sceneview-sdk/react-native` alpha | ❌ Migra los 6 bloques en producción a Nueva Arquitectura *y* apuesta por un binding sin raycast. Dos riesgos grandes acoplados |
| **B · Módulo nativo Android («caja negra»)** | Una pantalla nativa Kotlin: CameraX → MediaPipe Tasks → estado → SceneView Compose. RN solo la abre con una config y recibe un resultado | ✅ **Recomendada** |
| **C · App compañera separada** | Repo aparte, sin tocar Valeria+ | ⚠️ Reserva. Pierde ficha de paciente, telemetría, gamificación y Academy |

**Recomendación: opción B.** Razones concretas, no de gusto:

1. **El bucle es por frame.** A 30 fps hay que leer landmarks, normalizar,
   evaluar histéresis y mover un nodo 3D. Eso vive en el mismo proceso y el
   mismo hilo de render en Kotlin. Cruzar el puente JS 30 veces por segundo para
   luego cruzarlo de vuelta es la arquitectura equivocada aunque funcione.
2. **La precisión temporal de AR-2 es el valor académico del ejercicio.** La
   latencia en milisegundos solo es defendible si se mide con marcas de tiempo
   nativas (§7.2). Un salto por el puente introduce jitter no acotado.
3. **Radio de explosión cero.** Valeria+ sigue en arquitectura antigua, con sus
   seis bloques intactos. La Nueva Arquitectura se aborda cuando toque SDK 55,
   como decisión propia y no como peaje de este módulo.
4. **Las APIs maduras están en Kotlin.** `tasks-vision` y `sceneview` 4.25.0 son
   estables ahí. Los dos wrappers de JS son, respectivamente, alpha y
   abandonado.

**Coste asumido y explícito:** **v1 es solo Android.** iOS queda fuera hasta que
exista un equivalente (`ARKit Face Tracking` + RealityKit). Se documenta como
decisión, no como olvido.

### 3.3 Constraint dura que conviene decir en voz alta

**No se puede hacer AR de mundo real (cámara trasera + ARCore) y seguimiento
facial (cámara frontal) a la vez** en un móvil Android típico: es una sola
sesión de cámara. Y los tres ejercicios necesitan la cara del niño.

Consecuencia de diseño: la «realidad aumentada» aquí es **AR de espejo** —el
*preview* de la cámara frontal como fondo, la escena 3D compuesta encima—. El
coche no circula por la mesa real; circula sobre la imagen del niño.

**Corolario técnico importante:** al no haber *world tracking*, **no hace falta
ARCore**. Se usa `io.github.sceneview:sceneview` (solo 3D), **no**
`arsceneview`. Eso elimina de golpe la lista de dispositivos certificados
ARCore, el permiso de ubicación y decenas de MB de APK. Si más adelante se
quisiera AR real, sería un ejercicio distinto, no una variante de estos tres.

### 3.4 Perfil de hardware: BYOD de gama media en LATAM

El piloto corre en **teléfonos Android de gama media que pone la familia**
(BYOD). El modelo concreto **no se puede conocer hasta el trabajo de campo**:
depende de qué teléfono tenga cada padre o madre. El perfil de partida es el
parque popular latinoamericano —**Xiaomi (Redmi Note, Redmi, Poco)** y **Samsung
(Galaxy A)**, con Motorola (Moto G) como tercer actor—, en gama media y con
antigüedad de dos a cuatro años.

> **Esto no es un dato que falte: es una propiedad del despliegue.** Y obliga a
> un cambio de enfoque, no a esperar. Si el hardware es desconocido y
> heterogéneo, la app no puede asumir capacidades: **tiene que medirlas en cada
> teléfono, en tiempo de ejecución, y adaptarse o negarse** (§3.5).

Cinco consecuencias de diseño que no son matices: cambian ejercicios.

#### a) La geometría del móvil estrangula AR-3

Una pantalla de 6,1″ (≈ 141 × 65 mm) en horizontal, a 35 cm de la cara, abarca
**~23° de campo visual total**. Repartir tres dianas ahí deja los centros a
**~7,6° entre sí**:

| Distancia | FOV horizontal (landscape) | Separación con **3** dianas | Separación con **2** dianas |
| --- | --- | --- | --- |
| 30 cm | 26,4° | **8,9°** | 17,8° |
| 35 cm | 22,7° | **7,6°** | 15,3° |
| 40 cm | 20,0° | **6,7°** | 13,4° |
| 50 cm | 16,0° | **5,4°** | 10,7° |

> **Corrección a la versión anterior de este plan.** Ahí se pedían **≥ 20° de
> separación** entre dianas. Ese número **no es alcanzable en un móvil** —ni
> siquiera en una tablet de 10,5″, que da 10,7° a 40 cm—. Estaba tomado de la
> literatura de *eye tracking* con monitores de escritorio y no traslada. La
> cifra correcta de trabajo es **7-9°**, y eso reordena AR-3 (§7.3).

Regla derivada: una diana es discriminable si la separación supera **≈ 3× el
jitter RMS del puntero**. Con 7,6° de separación hace falta un puntero por
debajo de **~2,5° RMS**. Ese, y no los fps, es el criterio que decide si AR-3
lleva tres dianas o dos.

**Y en BYOD la tabla de arriba no se puede precalcular.** Las pantallas del
parque van de 6,1″ a 6,8″ y la distancia de trabajo la elige la familia. Por
tanto **las dianas se colocan en grados, no en píxeles**, con la geometría
resuelta en tiempo de ejecución:

```kotlin
// El layout se deriva del dispositivo real, no de una constante.
val anchoMm   = displayMetrics.widthPixels / displayMetrics.xdpi * 25.4f
val distMm    = distanceEstimator.currentMm()   // de la distancia interocular
val sepGrados = degrees(atan((anchoMm / 3f) / distMm))
```

**La cara del niño es el telémetro.** La distancia interocular en píxeles, junto
con las intrínsecas de la cámara, da una estimación de la distancia de trabajo.
Es aproximada —la interocular infantil varía entre ~48 y ~58 mm, así que el
error ronda el ±15 %— y por eso **no se usa para medir, sino para dos cosas
honestas**: avisar al adulto («acerca un poco el teléfono») y **registrar la
separación angular realmente conseguida en cada ensayo**, que pasa a ser una
covariable del análisis en vez de un supuesto.

#### b) El móvil no lateraliza sonido, y el Bluetooth mata la medida

La mayoría de móviles de gama media llevan **un solo altavoz** inferior, o un
par asimétrico auricular + altavoz que no produce una imagen estéreo utilizable.
Para AR-2 eso significa que **el altavoz del teléfono no sirve para lateralizar**
ni siquiera de forma orientativa.

Y la salida obvia está vetada: **el audio Bluetooth queda descartado en AR-2**.
Añade entre 100 y 300 ms de latencia variable ensayo a ensayo, que es
exactamente la magnitud que el ejercicio pretende medir. Sería medir la radio,
no al niño.

**Vía obligatoria: transductor por cable** (auriculares con adaptador USB-C, o
altavoces externos cableados). Detalle en §7.2.

#### c) El móvil se sostiene en la mano, y eso confunde el giro cefálico

MediaPipe mide la pose de la cabeza **relativa a la cámara**. Si el adulto
sostiene el teléfono, cualquier movimiento de su muñeca se lee como giro de la
cabeza del niño. En una tablet apoyada esto se ignora; en un móvil, no.

Dos mitigaciones, ambas necesarias:

1. **Soporte de sobremesa obligatorio** (trípode o *stand* plegable) para AR-2 y
   AR-3. Pasa a ser material del protocolo, como la campanita de RA-5.
2. **Compensación por IMU.** Un `DeviceAttitudeCompensator` que lee
   `TYPE_GAME_ROTATION_VECTOR` y resta la actitud del dispositivo, de modo que
   el yaw registrado sea **cabeza respecto al mundo**, no cabeza respecto a la
   cámara. Además, **descartar el ensayo** si la velocidad angular del
   dispositivo supera un umbral durante la ventana de respuesta. Un ensayo
   perdido es barato; un ensayo contaminado envenena el dataset.

#### d) El móvil se calienta antes que una tablet

Cámara a 30 fps + inferencia + Filament en un chasis pequeño y sin disipación:
la gama media entra en *throttling* térmico en minutos. Consecuencias:

- La Fase 0 mide fps en un **run sostenido de 10 minutos**, no en 30 segundos.
  Un pico de 30 fps que cae a 12 fps al cuarto minuto es un fracaso disfrazado.
- Sesión con **límite de duración** y cápsula TPR intercalada — lo que además
  coincide con lo clínicamente deseable a estas edades.
- Vigilar `PowerManager.getCurrentThermalStatus()`: al llegar a
  `THERMAL_STATUS_MODERATE`, avisar al adulto y **sellar el dato** con el estado
  térmico, para poder descartar después los ensayos degradados.

#### e) La fragmentación BYOD tiene un filo concreto: las marcas de tiempo

De todos los caprichos del parque Android barato, **uno invalida directamente el
dato de AR-2** y conviene conocerlo antes de escribir una línea:

**`CameraCharacteristics.SENSOR_INFO_TIMESTAMP_SOURCE`.** Si vale
`TIMESTAMP_SOURCE_REALTIME`, las marcas de tiempo de los frames están en la misma
base de reloj que el resto del sistema y **se pueden alinear con el audio**. Si
vale `TIMESTAMP_SOURCE_UNKNOWN` —frecuente en cámaras `LEGACY` de gama baja—,
**no existe una conversión fiable** y la latencia estímulo→giro deja de ser
medible en ese teléfono. Sigue siendo un juego perfectamente válido; deja de ser
un instrumento.

Aun con `REALTIME` hay un paso obligatorio: las marcas de cámara van en base
*boottime* (`elapsedRealtimeNanos`, incluye suspensión) y las de `AudioTrack`
suelen ir en *monotonic* (`uptimeNanos`, la excluye). **Hay que medir el desfase
entre ambas bases al inicio de cada sesión** y aplicarlo; el spike debe
verificar el comportamiento real por dispositivo antes de darlo por bueno.

Otros filos del mismo perfil, menos graves pero reales:

- **Gestión agresiva de batería** en MIUI/HyperOS y One UI: puede matar procesos
  o limitar sensores en segundo plano. El módulo AR es de primer plano y corto,
  lo que ayuda, pero el aviso al adulto de no salir de la app es necesario.
- **Delegado GPU no disponible** en algunos SoC de entrada → caída a CPU, que la
  prueba de aptitud detecta como fps insuficientes sin necesidad de saber el
  modelo.
- **Almacenamiento libre escaso**, muy común en teléfonos de 64 GB compartidos en
  familia. Refuerza la entrega del módulo como descarga a demanda (§14).

> **Nota positiva:** una gama media reciente (Snapdragon 6/7, Dimensity
> 6100+/7025, Helio G99, Exynos 1280/1330) tiene delegado GPU y debería sostener
> el Face Landmarker a 640×480. El riesgo no es la potencia bruta: es la
> **sostenida**, la geometría, el audio y las marcas de tiempo.

### 3.5 Prueba de Aptitud del Dispositivo (el sustituto de conocer el modelo)

Si no se puede saber qué teléfono habrá, **se mide el que haya**. La respuesta de
ingeniería a BYOD es convertir la puerta de la Fase 0 en una **función de la app**:
una rutina automática de 60-90 s que corre la primera vez que una familia abre el
módulo, y que se repite si cambia el dispositivo o la versión de Android.

Se presenta al niño como un juego de calentamiento —mirar a la osita, seguirla a
las esquinas, escuchar dos sonidos—, no como un diagnóstico técnico.

| Sonda | Qué mide | Duración |
| --- | --- | --- |
| Rendimiento | fps p5 con delegado GPU, con la escena 3D ya montada | 25 s |
| Térmica | pendiente de fps + `getCurrentThermalStatus()` | (durante la anterior) |
| Marcas de tiempo | `SENSOR_INFO_TIMESTAMP_SOURCE` + desfase boottime↔monotonic | < 1 s |
| Audio | dispersión de `AudioTrack.getTimestamp()` sobre 20 disparos · tipo de ruta de salida | 10 s |
| Puntero | RMS de `noseRay` e iris durante la calibración de 5 puntos | 15 s (reutiliza la calibración) |
| IMU | presencia y deriva de `GAME_ROTATION_VECTOR` | 5 s |
| Geometría | mm de pantalla + distancia estimada → separación angular alcanzable | inmediato |

**Salida: un `DeviceProfile` con un nivel de aptitud**, que decide qué se ofrece:

| Nivel | Condiciones | Qué se habilita |
| --- | --- | --- |
| **A · Instrumento** | fps p5 ≥ 20 · caída térmica ≥ 0,7 · timestamps `REALTIME` · dispersión de audio < 20 ms · puntero < 2,5° | Los tres ejercicios · **dato publicable** |
| **B · Clínico** | fps p5 ≥ 20 · puntero < 2,5° · timestamps no fiables **o** sin transductor por cable | AR-1 y AR-3 completos · AR-2 **solo como juego**, sin registrar latencia |
| **C · Reducido** | fps p5 ≥ 15 · puntero ≥ 2,5° | AR-1 completo · AR-3 en **modo de 2 dianas** · AR-2 solo juego |
| **D · No apto** | fps p5 < 15 o sin cámara frontal utilizable | El bloque AR **no aparece**. Los otros seis siguen intactos |

Tres propiedades que hacen que esto valga la pena:

1. **Nunca hay una experiencia rota.** Un teléfono flojo no da un ejercicio que
   va a tirones: da un ejercicio distinto, o ninguno. Es la misma política de
   degradación elegante que ya usa `valeriaNoise` con `expo-audio` (§11).
2. **El `DeviceProfile` viaja en cada registro de telemetría** (§8). En un
   estudio BYOD el hardware es un confundido inevitable; medido y sellado, pasa
   a ser una **covariable** y se puede modelar o estratificar. Sin medir, mete
   ruido en los resultados y no hay forma de saber cuánto.
3. **El nivel A define qué sesiones entran en el dataset publicable**, con un
   criterio explícito y auditable en vez de «se usaron teléfonos diversos».

**El coste honesto:** una parte del parque va a caer en C o D. Es preferible
saberlo por adelantado y por dispositivo que descubrirlo al analizar los datos.
La proporción real de cada nivel **es en sí misma un resultado publicable** sobre
la viabilidad de la rehabilitación digital con hardware doméstico en LATAM —el
tipo de dato que casi nadie reporta y que cualquiera que quiera replicar
necesita.

---

## 4. Arquitectura objetivo

```
┌──────────────────── JS / React Native (sin cambios de arquitectura) ─────────┐
│  ValeriaExerciseSelectionScreen  ──tarjeta 🎯 Realidad Aumentada──┐          │
│  valeriaExerciseMeta.ts  · AR_META (AR-1, AR-2, AR-3)             │          │
│  valeriaArBridge.ts  ── require() perezoso + degradación elegante ─┤          │
│  valeriaTelemetry.ts ── BlockId 'ar' + arTrials[]                 │          │
│  valeriaGamification.ts ── registerSession() sin cambios          │          │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │ launch(config) → Promise<ArSessionResult>
┌───────────────────────────────────▼──────────── Android nativo (Kotlin) ─────┐
│  ValeriaArActivity  (Compose, pantalla completa, orientación fija)           │
│    ├─ CameraX  ─ ImageAnalysis (front, 640×480, BACKPRESSURE_KEEP_LATEST)    │
│    ├─ FaceSignalEngine ── MediaPipe FaceLandmarker LIVE_STREAM               │
│    │     └─ FaceSignals { blendshapes, headPose, pointer, tCapture }         │
│    ├─ RewardChannel ── contrato de Feedback Visual Desacoplado (§6)          │
│    ├─ SceneHost ── SceneView 4.25.0 (Filament) · ModelNode + animaciones     │
│    ├─ StimulusPlayer ── AudioTrack lateralizado + timestamp de presentación  │
│    └─ TrialRecorder ── un registro por ensayo, nunca por frame               │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Contrato del puente (dos llamadas, no más):**

```ts
// valeriaArBridge.ts — API que ve el resto de la app
export interface ArExerciseConfig {
  exerciseId: 'ar1' | 'ar2' | 'ar3';
  patientKey: string;          // para recuperar la calibración; nunca un nombre
  thresholds: ArThresholds;    // lo que el adulto fijó en el Panel
  trials: number;
  pointerSource?: 'iris' | 'noseRay';   // solo AR-3
}
export function isArAvailable(): boolean;                       // sonda nativa
export function launchAr(cfg: ArExerciseConfig): Promise<ArSessionResult>;
```

El módulo nativo **no escribe** en AsyncStorage ni en Firestore. Devuelve un
`ArSessionResult` y es el JS quien lo enruta por `valeriaTelemetry`, exactamente
como hoy hace el player. Una sola fuente de verdad para los datos del piloto.

---

## 5. Capa de señal: qué extrae MediaPipe y cómo se normaliza

Un `FaceLandmarkerResult` por frame, tres derivadas. La configuración del
landmarker es común a los tres ejercicios:

```kotlin
FaceLandmarkerOptions.builder()
    .setRunningMode(RunningMode.LIVE_STREAM)
    .setNumFaces(1)
    .setOutputFaceBlendshapes(true)              // AR-1
    .setOutputFacialTransformationMatrixes(true) // AR-2, AR-3
    .setMinTrackingConfidence(0.5f)
    .setResultListener(::onResult)
    .build()
```

### 5.1 El problema de la normalización (y por qué la distancia euclídea cruda no sirve)

La distancia euclídea entre comisuras **escala con la distancia del niño al
teléfono**. A las distancias de trabajo de un móvil (30-40 cm) el efecto es
todavía más agresivo que en una tablet: un niño que se acerca 10 cm «redondea
los labios» sin mover un músculo. Y si gira la cabeza, la anchura bucal se escorza. Toda métrica
geométrica debe ser:

1. **Adimensional** — dividida por una referencia rígida. La distancia
   inter-ocular externa (landmarks canónicos 33 ↔ 263) es la referencia estándar:
   no cambia con el gesto.
2. **Cerrada bajo pose** — evaluada solo cuando `|yaw| < 12°` y `|pitch| < 12°`.
   Fuera de ese cono el frame se descarta como no válido, no se corrige.
3. **Calibrada por paciente** — se toma una línea base en reposo de 3 s al
   entrar al ejercicio y los umbrales son *deltas* sobre esa base. La morfología
   labial de un niño de 3 años y otro de 6 no admite un umbral global.

> Los índices de landmarks concretos (61/291 comisuras, 13/14 borde interno
> labial, 33/263 cantos externos) se dan como **canónicos a verificar contra el
> modelo real en el spike de la Fase 0**, no como constantes de fe.

### 5.2 Preferir blendshapes sobre geometría

MediaPipe ya entrega `mouthPucker`, `mouthFunnel` y `jawOpen` como coeficientes
0-1 entrenados y **ya invariantes a escala y pose**. Recomendación: usarlos como
**señal primaria** de AR-1 y mantener la ratio geométrica como **señal
secundaria de explicabilidad** —lo que se le enseña a la logopeda en el informe:
«apertura vertical / anchura bucal = 0,71»—. Un coeficiente de red no se puede
defender ante un comité; una ratio medible sí. Se registran las dos.

### 5.3 Head pose

De `facialTransformationMatrixes[0]` (4×4) se extrae la submatriz de rotación y
se descompone en **yaw / pitch / roll**. Precisión más que suficiente para
detectar giros gruesos de ±15°, que es todo lo que pide AR-2. Se filtra con una
media móvil corta (3 frames) para el *render*, pero **la detección del umbral
usa la señal cruda**: filtrar antes de medir latencia es introducir un retardo
sistemático en el dato académico.

---

## 6. Capa de recompensa: el contrato de Feedback Visual Desacoplado

En vez de escribir tres veces la misma lógica, se formaliza una vez:

```kotlin
interface RewardChannel {
    /** Señal clínica normalizada 0..1. La calcula el ejercicio. */
    fun onSignal(value: Float, tCaptureMs: Long)
    /** Estado del refuerzo, consumido por la escena 3D. */
    val reward: StateFlow<RewardState>
}

sealed interface RewardState {
    data object Idle : RewardState
    /** Progreso continuo 0..1 → el coche acelera GRADUALMENTE mientras se sostiene. */
    data class Charging(val progress: Float) : RewardState
    /** Criterio cumplido → animación de celebración. */
    data class Fired(val latencyMs: Long) : RewardState
}
```

**Tres reglas que definen «condicionada»:**

1. **Contingencia estricta.** `Fired` solo puede emitirse desde `Charging` con
   `progress == 1f`. No hay ruta desde el paso del tiempo, desde un toque del
   adulto ni desde el ASR.
2. **Progreso continuo, no binario.** El niño ve el coche acelerar *mientras*
   sostiene la postura. Un refuerzo todo-o-nada a los 1,5 s no enseña qué está
   haciendo bien; un refuerzo proporcional sí. Es el punto pedagógico central.
3. **Histéresis obligatoria.** Umbral de entrada Θ_on y de mantenimiento Θ_off <
   Θ_on. Un temblor de 2 frames alrededor del umbral no puede reiniciar el
   contador: el `progress` **decae** (≈ 2×) en vez de caer a cero. Reiniciar a
   cero en un niño de 4 años es garantizar que nunca lo consigue.

Con este contrato, los ejercicios 4..n del módulo son *datos + una función de
señal*, no código nuevo de refuerzo.

**Assets 3D** (GLB, low-poly, < 2 MB cada uno, compresión Draco/meshopt):
`coche.glb` (con animación de traslación en Z), `perro.glb` (animación
`celebrate`), `manzana.glb` + 2 distractores (animación `spin360`). Licencia y
autoría deben quedar registradas en `ValeriaCreditsScreen`, que ya existe para
eso.

---

## 7. Los tres ejercicios en detalle

### 7.1 AR-1 · Cinemática Orofacial como gatillo

**Objetivo clínico:** aislar la cinemática de la acústica en dislalias
funcionales. Premiar el gesto motor preparatorio del fonema antes de exigir
fonación.

| Elemento | Especificación |
| --- | --- |
| Señal | `mouthPucker` (primaria) + ratio `aperturaVertical / anchuraBucal` normalizada por distancia inter-ocular (secundaria) |
| Objetivo | Redondeo labial simétrico para /o/ y /u/ |
| Simetría | `\|dist(comisuraIzq, línea media) − dist(comisuraDer, línea media)\| < 8 %` de la anchura bucal. Sin esto se premia una mueca asimétrica |
| Criterio | Sostener Θ_on durante **1500 ms** (configurable 800-3000 ms desde el Panel) |
| Recompensa | Coche 3D: velocidad de traslación en Z **proporcional** a `progress`. Al llegar a 1.0, animación de meta |
| Micrófono | **Apagado.** Es el punto del ejercicio |
| Datos por ensayo | `holdMaxMs`, `holdTotalMs`, `puckerPeak`, `apertureRatioPeak`, `symmetryWorst`, `framesValid/framesTotal`, `attemptsToFire` |

**Por qué se implementa primero:** no exige precisión temporal ni calibración
espacial. Es el ejercicio que valida el andamiaje completo (cámara → señal →
recompensa → registro) con el mínimo riesgo.

### 7.2 AR-2 · VRA digitalizado (reflejo de orientación)

**Objetivo clínico:** convertir una observación audiológica cualitativa
(«¿giró?») en un dato duro: **latencia en milisegundos desde el estímulo hasta
el giro cefálico**.

Este es el ejercicio con más valor académico y **el de mayor riesgo de
ingeniería**. La latencia solo vale si se mide bien.

**El problema de la medición.** `Date.now()` cuando llamas a `play()` **no es**
el instante en que sale el sonido. El camino de audio de un móvil añade entre
40 y 200 ms por cable, y entre 100 y 300 ms adicionales por Bluetooth (§3.4b),
variable por dispositivo. Y la marca de tiempo del callback de
MediaPipe no es la de captura del sensor. Medir mal aquí no da un dato ruidoso:
da un dato **sesgado**, que es peor.

| Extremo | Fuente correcta |
| --- | --- |
| Inicio del estímulo | `AudioTrack.getTimestamp()` → *presentation time* real del primer frame audible. No el instante de la llamada |
| Detección del giro | `frameTimestampMs` de la `ImageProxy` de CameraX (tiempo de captura del sensor), propagado por `detectAsync` y devuelto en el resultado. No el instante del callback |
| Latencia | `t(primer frame con \|yaw\| > 15° hacia el lado correcto) − t(presentación de audio)` |

Se registra además la **incertidumbre residual** por dispositivo (medida una vez
en la calibración) para que el dataset sea publicable con barras de error
honestas.

**Diseño de ensayo (lo que hace válido el dataset):**

- **Postura armada.** El ensayo solo se dispara si `|yaw| < 5°` sostenido 500 ms.
  Si el niño no está mirando al frente, no hay estímulo.
- **Lado aleatorizado** con un máximo de 2 repeticiones consecutivas del mismo
  lado (evita aprendizaje de secuencia).
- **Ensayos trampa** (~20 %, sin sonido). Sin ellos no se puede distinguir
  detección auditiva de movimiento cefálico espontáneo. **Es el control que hace
  la diferencia entre una demo y un instrumento.**
- **Ventana de respuesta** de 2000 ms (configurable). Fuera de ventana → «sin
  respuesta», no «error».
- **Intervalo inter-ensayo** aleatorio 3-6 s, para que el niño no anticipe.

**Transductor (crítico en móvil).** Como se argumenta en §3.4b, **el altavoz del
teléfono no es una opción**: la mayoría de los móviles de gama media son mono o
asimétricos, y el Bluetooth introduce 100-300 ms de latencia variable justo en
la magnitud que se quiere medir. Dos configuraciones admisibles, y solo dos:

| Configuración | Cableado | Qué mide de verdad | Uso |
| --- | --- | --- | --- |
| **Auriculares por cable** (adaptador USB-C) | Sí | **Lateralización** por diferencias interaurales (ILD/ITD) | Rutina clínica y dataset |
| **Dos altavoces externos cableados** a ±45-90° | Sí | **Localización en campo libre** (el VRA clásico) | Investigación, montaje fijo |
| ~~Altavoz del teléfono~~ | — | Nada utilizable | ❌ |
| ~~Cualquier transductor Bluetooth~~ | — | La latencia del enlace | ❌ |

**Lateralización ≠ localización, y hay que decirlo en el artículo.** Con
auriculares el niño discrimina *de qué oído viene*; en campo libre *de qué punto
del espacio*. Son constructos distintos y no deben mezclarse en la misma columna
del dataset. El registro sella `transducer` con esa granularidad.

**En BYOD, AR-2 tiene dos modos y el dispositivo decide cuál.** Si el
`DeviceProfile` no llega a nivel A —marcas de tiempo no alineables (§3.4e), o
sin transductor por cable conectado—, el ejercicio **se juega igual pero no
registra latencia**: el niño gira, el perro celebra, y el registro guarda
acierto/fallo y `latencyMs: null` con el motivo. Un dato ausente y etiquetado es
honesto; un dato presente y sesgado, no. La detección del transductor se hace en
caliente (`AudioDeviceInfo`), y si el adulto desconecta los auriculares a mitad
de sesión, los ensayos siguientes bajan de modo y quedan marcados.

En usuarios de implante unilateral la vía ipsi/contralateral es información
clínica: se registra el **canal físico excitado**, no una etiqueta «derecha».

> Nota de continuidad: ya existe **RA-5 «Localización del sonido»** en
> `AUDICION_META` como ejercicio manual con campanita. AR-2 no lo sustituye: es
> su versión instrumentada. Conviene enlazarlos en el hub y en la Academy.

| Datos por ensayo | `side`, `isCatch`, `transducer`, `gain`, `tStimulusUs`, `tTurnUs`, `latencyMs`, `peakYawDeg`, `correctSide`, `timedOut`, `deviceLatencyUncertaintyMs` |
| --- | --- |

**Recompensa:** el perro 3D «cobra vida» con animación de celebración **solo**
ante giro correcto dentro de ventana. En ensayo trampa nunca hay recompensa —y
eso también es un dato.

### 7.3 AR-3 · Selección semántica por fijación

**Objetivo clínico:** evaluar comprensión léxica y sintáctica **sin que la
motricidad fina contamine el resultado** (parálisis cerebral, dispraxia).

**Dos fuentes de puntero, una sola lógica.** Se define una interfaz y dos
implementaciones intercambiables en caliente desde el Panel del Adulto:

```kotlin
interface PointerSource { fun screenPoint(r: FaceLandmarkerResult): PointF? }
class IrisPointer   : PointerSource   // preciso, ruidoso en gama baja
class NoseRayPointer: PointerSource   // robusto, coarse; rayo desde punta de nariz
```

El ejercicio no sabe cuál está activa. Si el spike muestra jitter de iris > 2,5°
en el móvil objetivo, se conmuta a nariz sin tocar la lógica de tarea. Y si
tampoco `noseRay` baja de 2,5°, la conmutación siguiente no es de puntero sino
de **número de dianas** (§7.3).

**Calibración (obligatoria, no opcional).** Un rayo facial sin calibrar no
apunta a nada. Rutina de **5 puntos** (4 esquinas + centro, ~15 s, con la osita
de Valeria como diana) que ajusta una homografía cara→pantalla. Se guarda **por
paciente y por dispositivo**; caduca si cambia la orientación o la distancia de
trabajo declarada.

**Dwell time con las tres correcciones que lo hacen usable:**

1. **Hitbox doble.** El área de «entrada» es menor que la de «mantenimiento».
   Evita el parpadeo en el borde del objeto.
2. **Decaimiento, no reinicio.** Igual que en §6: salir 100 ms no puede borrar
   1,1 s de fijación.
3. **Anillo de progreso** visible alrededor del objeto: el niño ve que lo está
   consiguiendo. Sin *feedback* de acumulación, el *dwell* es invisible y
   frustrante.

**Problema de Midas.** Con *dwell* puro, todo lo que se mira se selecciona. Se
mitiga con una **zona neutra** central: el *dwell* solo acumula dentro de un
objeto, nunca en el fondo.

**Geometría en móvil: dos o tres dianas, lo decide la Fase 0.** Por §3.4a, tres
dianas en un móvil quedan a **~7,6°** entre centros a 35 cm, no a los 20° que
pedía la versión anterior de este plan. Eso obliga a un protocolo de encuadre
rígido y a un modo degradado:

| Parámetro | Valor |
| --- | --- |
| Orientación | **Landscape obligatorio** en AR-3 (en vertical la pantalla abarca ~10°: inviable) |
| Distancia de trabajo | **30-35 cm**, con soporte. Más cerca degrada el encuadre facial; más lejos comprime las dianas |
| Modo nominal | **3 dianas** a 1/6, 1/2 y 5/6 del ancho · separación ~8° |
| Modo degradado | **2 dianas** a 1/6 y 5/6 · separación ~15-18° · elección forzada entre dos alternativas |
| Regla de conmutación | El `DeviceProfile` (§3.5) manda: nivel **C** → 2 dianas. Dentro de la sesión, si el RMS de calibración implica jitter > **2,5°**, baja a 2 dianas **y lo registra** |
| Colocación | En **grados calculados en caliente** desde los mm reales de pantalla y la distancia estimada (§3.4a), nunca en píxeles fijos |

El modo de 2 dianas no es una derrota: la elección forzada entre dos
alternativas es un paradigma estándar en evaluación de comprensión, con la
contrapartida conocida de un 50 % de acierto por azar —que se corrige con más
ensayos, no con más dianas—. Lo que sí sería un error es dejar tres dianas
indiscriminables y llamar «error de comprensión» a un fallo de puntería.

**Distinguir primera mirada de selección final.** Clínicamente son dos variables
distintas: adónde mira primero (sesgo de comprensión inmediata) y qué acaba
eligiendo (con posible corrección). Se registran por separado; solo la segunda
dispara el giro de 360° del modelo.

| Datos por ensayo | `targetId`, `firstFixationId`, `tFirstFixationMs`, `selectedId`, `dwellMs`, `revisits`, `pointerSource`, `calibrationRmsPx`, `outOfBoundsMs` |
| --- | --- |

---

## 8. Telemetría, dataset y exportación

Se reutiliza `valeriaTelemetry` tal como está pensado: registrar, no decidir.

**Cambios mínimos y compatibles hacia atrás:**

- `BlockId` gana `'ar'`. El disparo del SUS **no se toca**: ya está desacoplado
  por `SUS_BLOCK_THRESHOLD = 4`, precisamente por la lección aprendida al pasar
  de 4 a 6 bloques.
- `SessionRecord` gana `arTrials?: ArTrialEvent[]`, campo **opcional**, y
  `normalizeSession()` lo rellena a `[]` — el patrón de migración tolerante ya
  está escrito en el fichero.
- Se respeta `MAX_EVENTS = 300`.

**El `DeviceProfile` viaja con la sesión.** En un estudio BYOD el hardware es
heterogéneo por definición; sellarlo lo convierte de ruido en covariable. Se
guarda **una vez por sesión**, no por ensayo (es constante), con el nivel de
aptitud, las siete sondas, `Build.MANUFACTURER`/`MODEL`, versión de Android y
mm de pantalla. Y cada ensayo lleva lo que sí varía dentro de la sesión: estado
térmico, separación angular conseguida, transductor vivo y modo efectivo.

Eso permite tres cosas que sin ello son imposibles: filtrar el dataset por nivel
A, estratificar por gama de teléfono, y **reportar qué porcentaje del parque
familiar real alcanzó cada nivel** —resultado publicable por sí mismo sobre la
viabilidad del despliegue doméstico en LATAM—.

**Regla dura: un registro por ensayo, jamás por frame.** A 30 fps, tres minutos
de ejercicio son 5.400 eventos. La agregación ocurre en el módulo nativo; al JS
solo llega el resumen del ensayo. Esto además protege la restricción de no
bloqueo (`runAfterInteractions` + debounce) que hoy garantiza que el cifrado no
coincida con animaciones.

**Exportación.** `buildExport()` gana los agregados de AR en el `summary`
(latencia mediana de VRA, tasa de falsos positivos en trampas, tiempo medio de
sostén orofacial) y los ensayos crudos en `fullLog`. El `qrPayload` **no
crece**: sigue siendo el resumen compacto, porque tiene que caber en un QR
legible por cámaras de móvil.

**Valor académico.** El `fullLog` de AR-2 es directamente una tabla de latencias
con condición, lado, ensayo trampa e incertidumbre de dispositivo: formato de
publicación, no de depuración.

---

## 9. Privacidad, MDR y Play Console (bloqueante)

`CLAUDE.md` es explícito: **al cambiar lo que la app recoge hay que actualizar en
el mismo cambio la política de `site/` y el formulario de *Seguridad de los
datos* de Play Console.** Este módulo añade el permiso más sensible que existe en
una app infantil. Esto no es una tarea de cierre: es un requisito de la fase que
introduce la cámara.

### 9.1 Las tres afirmaciones que sostienen todo

1. **El frame de vídeo nunca sale del dispositivo.** MediaPipe corre 100 %
   *on-device*. Sin red, sin subida, sin SDK de terceros con telemetría propia.
2. **El frame de vídeo nunca se almacena.** Ni buffer en disco, ni caché, ni
   captura. `ImageProxy` se cierra en el mismo callback. Solo persisten escalares
   derivados (grados, milisegundos, ratios).
3. **No hay identificación biométrica.** Los landmarks se usan para medir
   conducta motora, **no** para reconocer a una persona. Es la frontera del
   art. 9 del RGPD: sin tratamiento dirigido a identificación única, no hay
   categoría especial por el mero hecho de mirar una cara. **La política debe
   decirlo de forma expresa**, porque un revisor de Play o un DPO lo va a
   preguntar.

Estas tres afirmaciones son **restricciones de arquitectura**, no promesas de
marketing: si alguien añade una grabación «para revisar después», la declaración
entera deja de ser cierta y el módulo pasa a otra categoría regulatoria.

### 9.2 Entregables concretos

| Artefacto | Cambio |
| --- | --- |
| `site/privacidad.html` §3.3 | Fila nueva `CAMERA` en la tabla de permisos, con el mismo tono que la de `RECORD_AUDIO`: para qué, cuándo se activa (solo dentro del ejercicio, con indicador visible), qué pasa si se deniega (el bloque AR no aparece, el resto funciona igual) |
| `site/privacy.html` | Misma fila, en inglés |
| Base jurídica | Añadir la fila correspondiente a la tabla del art. 6 y la declaración expresa de no-tratamiento del art. 9 |
| `app.json` | Permiso `android.permission.CAMERA` + `NSCameraUsageDescription` cuando llegue iOS |
| Play Console · Data Safety | Declarar «Fotos y vídeos → No recopilado» con la justificación de procesamiento efímero on-device. Es la casilla exacta que Google contrasta contra la política |
| Play Console · Familias | Revisión reforzada. Preparar el texto de justificación y, si es viable, un vídeo de demostración del flujo |
| Consentimiento in-app | Pantalla previa de consentimiento informado **persistida por paciente**, siguiendo el patrón ya implementado para el Quiebre Pragmático del módulo TEA |

### 9.3 Muro MDR

Los tres ejercicios producen medidas que *suenan* a diagnóstico (latencia VRA,
índice de redondeo). El módulo:

- Registra **magnitudes físicas**, nunca veredictos («sostuvo 1.240 ms», no
  «dislalia leve»).
- No calcula percentiles, ni compara contra normativa, ni sugiere.
- No adapta umbrales entre ensayos ni entre sesiones.
- Todo umbral es un valor que **el adulto fijó** y que viaja en el registro para
  que el dato sea interpretable a posteriori.

---

## 10. Superficie de integración (cambios por archivo)

| Archivo | Cambio | Riesgo |
| --- | --- | --- |
| `src/valeriaExerciseMeta.ts` | `AR_META` (3 entradas) + añadir al `META_BY_ID` | Bajo · solo datos |
| `src/valeriaTelemetry.ts` | `BlockId += 'ar'` · `arTrials?` opcional · `normalizeSession` · agregados en `buildExport` | Bajo · patrón ya existente |
| `src/valeriaArBridge.ts` | **Nuevo.** `require()` perezoso en `try` + `isArAvailable()`, calcado del idioma de `valeriaNoise` / `valeriaVoicePlayback` | Bajo |
| `src/ValeriaExerciseSelectionScreen.tsx` | Tarjeta 🎯 **solo si** `isArAvailable()` | Bajo |
| `src/ValeriaArLauncherScreen.tsx` | **Nuevo.** Consentimiento → calibración → lanzar nativo → recibir resultado → telemetría + gamificación | Medio |
| `src/AppNavigator.tsx` | Ruta `ArLauncher` | Bajo |
| `src/ValeriaAdultChaosPanel.tsx` | Sección de umbrales AR (sostén, grados, ventana, *dwell*, fuente de puntero) | Medio · tocar el Panel afecta a 6 bloques |
| `plugins/withValeriaAR.js` | **Nuevo.** Config plugin: permiso de cámara, dependencias Gradle, `minSdk 24` | Medio |
| `android/` (vía prebuild) | Módulo Kotlin `valeria-ar` | Alto · superficie nueva |
| `assets/models/` | 3 GLB + licencias | Bajo |
| `site/privacidad.html`, `site/privacy.html` | §9 | **Bloqueante** |
| `src/ValeriaCreditsScreen.tsx` | Atribución de modelos 3D y de MediaPipe/SceneView | Bajo |
| `README.md` | Tabla de bloques: de 6 a 7 | Bajo |

---

## 11. Garantías de no regresión

1. **Degradación elegante como idioma de la casa.** `valeriaArBridge` carga el
   módulo nativo con `require()` dentro de `try`, igual que `valeriaNoise` con
   `expo-audio`. Sin módulo (Expo Go, build de iOS, dispositivo sin cámara
   frontal), `isArAvailable()` devuelve `false` y **la tarjeta no se renderiza**.
   Ningún usuario ve una pantalla rota.
2. **`valeriaExerciseMeta` sigue puro.** No importa react-native: lo compila Node
   para el corpus de voz. `AR_META` añade **solo datos**.
3. **Nueva Arquitectura intacta.** `newArchEnabled: false` no se toca. Los seis
   bloques en producción no se migran.
4. **El Panel del Adulto se amplía, no se altera.** Sección nueva, props
   existentes sin cambios de contrato.
5. **Telemetría compatible.** Campo opcional + `normalizeSession` tolerante: una
   sesión persistida antes del módulo se lee igual.
6. **SUS sin regresión.** El umbral ya está desacoplado de `ALL_BLOCKS`; el
   séptimo bloque ni bloquea ni fuerza el hito.
7. **Red de seguridad por fase:** `npm run typecheck` en verde + humo manual de
   los 6 bloques actuales + `scripts/export-voice-corpus.js` compilando, antes de
   fusionar nada.

---

## 12. Plan de trabajo por fases

Cada fase es entregable y no rompe. **El orden no sigue la numeración de los
ejercicios: sigue el riesgo.**

### Fase 0 · Spike de viabilidad (2 semanas · **puerta de decisión**)

Como el modelo de teléfono es desconocido por diseño (§3.4), esta fase **no
valida un dispositivo: valida la envolvente y construye el instrumento que
medirá cada dispositivo en campo**.

App Kotlin desechable, fuera del árbol de Valeria+, sobre un **banco de
referencia** de 3-4 teléfonos comprados de segunda mano para representar el
parque real, no un buque insignia:

| Perfil del banco | Papel |
| --- | --- |
| Xiaomi Redmi Note, gama media reciente (~2 años) | Caso nominal alto |
| Samsung Galaxy A, gama media (~2-3 años) | Caso nominal, otro proveedor de cámara y otra capa |
| Motorola Moto G o Redmi de entrada (~3-4 años) | **Caso peor deliberado**: es el que dirá dónde está el suelo |
| Un cuarto con cámara `LEGACY` si se consigue | Valida el camino `TIMESTAMP_SOURCE_UNKNOWN` (§3.4e) |

Todas las medidas, **con el teléfono en su soporte, a 30-35 cm, en landscape**.

**Criterios de salida:**

1. **La envolvente existe.** Las siete sondas de §3.5 discriminan de verdad
   entre los teléfonos del banco: el caso peor cae en C o D y el nominal en A o
   B. Una sonda que da el mismo veredicto para todos no sirve y se rediseña.
2. **Los umbrales de nivel están calibrados** contra observación real: en el
   teléfono que la sonda clasifica como A, el ejercicio se ve y se juega bien;
   en el que clasifica como D, efectivamente no.
3. **La `Prueba de Aptitud` corre en menos de 90 s** y produce un `DeviceProfile`
   serializable.
4. **El caso peor está caracterizado**: al menos un teléfono del banco debe
   fallar alguna sonda, y su modo degradado tiene que ser una experiencia
   aceptable, no un error.

**Entregable:** la prueba de aptitud como componente reutilizable + la tabla de
los 3-4 teléfonos del banco, que es el apéndice de método del futuro artículo.

**No se escribe nada más hasta cerrar esta fase.** Es el punto donde el plan
puede cambiar barato.

> **Corolario de calendario:** al no depender de conocer los teléfonos de las
> familias, esta fase **puede empezar ya**. Lo único que hay que decidir es el
> presupuesto del banco de referencia (§15).

### Fase 1 · Andamiaje (sin ejercicios)

`ValeriaArActivity` + config plugin + permiso + puente RN + pantalla de
consentimiento + **actualización de política de privacidad y Data Safety** +
**la Prueba de Aptitud del Dispositivo integrada** (§3.5), con su `DeviceProfile`
persistido y el enrutado por nivel: en nivel D la tarjeta del hub no se
renderiza.
**Salida:** se abre y se cierra desde Valeria+ sin tocar los 6 bloques, y un
teléfono no apto lo dice antes de frustrar a nadie.

### Fase 2 · Capa de señal + calibración

`FaceSignalEngine`, normalización por distancia inter-ocular, línea base en
reposo, descomposición de *head pose*, `PointerSource` × 2, rutina de 5 puntos.
**Salida:** pantalla de diagnóstico interna que muestra las señales en vivo con
sus valores numéricos (herramienta de la logopeda, no del niño).

### Fase 3 · Capa de recompensa

`RewardChannel` con histéresis y decaimiento + `SceneHost` con los 3 GLB y sus
animaciones.
**Salida:** el coche acelera con un *slider* manual. El refuerzo funciona antes
de que exista ningún ejercicio.

### Fase 4 · AR-1 Cinemática Orofacial

El más simple: sin precisión temporal, sin calibración espacial.
**Salida:** primer ejercicio jugable de punta a punta, con registro por ensayo.

### Fase 5 · AR-3 Selección por fijación

Necesita calibración (Fase 2) pero no *timing* de audio.
**Salida:** tres objetos, *dwell* con anillo de progreso, primera fijación y
selección registradas por separado.

### Fase 6 · AR-2 VRA digitalizado

El último **a propósito**: es el que depende de la calibración de latencia de
audio por dispositivo, del diseño de ensayos trampa y del protocolo de
transductor. Llega cuando todo lo demás está estable.
**Salida:** dataset de latencias exportable con barras de error.

### Fase 7 · Cierre clínico y regulatorio

Dashboard del paciente con las métricas AR · protocolo clínico en `docs/`
(formato Pares Mínimos) · cápsula de Academy explicando el VRA digitalizado ·
README a 7 bloques · revisión de tamaño de APK (§13).

---

## 13. Plan de iOS (v2, no bloqueante)

iOS no entra en v1, pero **la decisión que lo abarata se toma ahora**: si la capa
de señal se define en el vocabulario correcto, iOS es una implementación más y no
un rediseño. Si no, es reescribir los tres ejercicios.

### 13.1 La palanca: los 52 blendshapes son los mismos

Los blendshapes que emite MediaPipe son **compatibles con ARKit**: la misma
nomenclatura y el mismo rango 0-1 que `ARFaceAnchor.blendShapes`. Y ambas
plataformas entregan una matriz de transformación facial 4×4.

Por tanto, **`FaceSignals` se define en ese vocabulario neutro** —52 coeficientes
+ matriz 4×4 + landmarks normalizados + `tCaptureUs`— y **no** en tipos de
MediaPipe. Consecuencia: los ejercicios, los umbrales, la calibración, la
histéresis y la telemetría son **código compartido y agnóstico de plataforma**.
Lo que se porta a iOS es únicamente:

| Capa | Android (v1) | iOS (v2) | Tamaño del port |
| --- | --- | --- | --- |
| Captura | CameraX | AVCaptureSession | Pequeño |
| Señal facial | MediaPipe `tasks-vision` | **MediaPipe `MediaPipeTasksVision`** (recomendado) o ARKit | Pequeño si MediaPipe |
| Compensación de dispositivo | `TYPE_GAME_ROTATION_VECTOR` | CoreMotion `deviceMotion.attitude` | Pequeño |
| Estímulo + timestamp | `AudioTrack.getTimestamp()` | AVAudioEngine + `AVAudioSession.outputLatency` | Pequeño (iOS lo pone más fácil) |
| Escena 3D | SceneView / Filament | **RealityKit directo** | Medio |
| Lógica de ejercicio | **Compartida** | **Compartida** | **Cero** |

### 13.2 MediaPipe en iOS, no ARKit — y la razón es de investigación

ARKit tienta: es gratis, más preciso y de menor latencia. Pero mezclar en un
mismo dataset medidas derivadas de ARKit y de MediaPipe introduce un **confundido
de método**: una diferencia entre dos niños podría ser la plataforma, no el niño.
Para un dataset destinado a publicación eso es un defecto de diseño, no un
detalle.

**Recomendación: `MediaPipeTasksVision` también en iOS**, para paridad de
algoritmo. ARKit queda como vía opcional para el modo «juego» (donde la precisión
del dato no se publica) o como plan B si el rendimiento en iOS decepciona. Si
alguna vez se usan las dos, **la plataforma y el motor de señal viajan en cada
registro** y se controlan como covariable.

### 13.3 SceneView en iOS: no

La capa iOS de SceneView es alpha, exige iOS 17+ y su podspec **omite a propósito**
`SceneViewSwift`, que hay que añadir a mano por SPM. Y la capa de recompensa que
necesitamos es diminuta: cargar un modelo, reproducir una animación, trasladar en
Z, girar 360°. Eso son ~200 líneas de RealityKit sin dependencias externas.

Contrapartida a presupuestar: **doble pipeline de assets**, GLB para Android y
USDZ para iOS, con verificación de que ambas exportaciones tienen las mismas
animaciones con los mismos nombres. Se resuelve con un script en `scripts/`,
igual que ya se hace con el corpus de voz.

### 13.4 Lo que hay que hacer *hoy* para no pagarlo después

Tres reglas que no cuestan nada en v1 y ahorran el rediseño en v2:

1. **`FaceSignals` en vocabulario ARKit-compatible**, nunca en tipos de MediaPipe.
2. **`SceneHost`, `PointerSource` y `StimulusPlayer` como interfaces** desde el
   primer día, aunque solo exista una implementación de cada una.
3. **El puente `valeriaArBridge.ts` no menciona Android** en su API pública.
   `isArAvailable()` sondea; no pregunta por plataforma.

### 13.5 Cuándo

Después de la Fase 7, como fases F8-F10: (F8) arnés de paridad de señal —grabar
al mismo niño en ambas plataformas y comparar distribuciones de blendshapes y
pose antes de dar por buena la equivalencia—, (F9) host iOS, (F10) capa de
recompensa RealityKit + pipeline USDZ.

Encaja con el árbol actual: ya existen `ios-native/`, el flujo de `expo prebuild
-p ios` y el blueprint de exportación a iOS documentado. Y añade sus propios
deberes regulatorios: `NSCameraUsageDescription`, *privacy nutrition labels* y,
si se entra en **Kids Category**, la barrera parental y la prohibición de
analítica de terceros que Apple exige.

---

## 14. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| **Geometría del móvil en AR-3** (7,6° entre dianas, no 20°) | **Alto (validez)** | Landscape + soporte a 30-35 cm · modo de 2 dianas conmutado por RMS de calibración (§7.3) · nunca llamar «error de comprensión» a un fallo de puntería |
| **Latencia de audio mal medida en AR-2** → dato sesgado, no ruidoso | **Alto (académico)** | `AudioTrack.getTimestamp()` + `frameTimestampMs` de sensor · **Bluetooth vetado** · solo transductor cableado · calibración por dispositivo · publicar la incertidumbre residual |
| **Throttling térmico en móvil** | **Alto** | Fase 0 mide fps sostenidos a 10 min y la caída térmica · límite de duración de sesión · sellar `thermalStatus` en cada ensayo para poder descartar los degradados |
| **Movimiento del dispositivo leído como giro cefálico** | **Alto (validez)** | Soporte obligatorio en AR-2/AR-3 · compensación por IMU (`GAME_ROTATION_VECTOR`) · descartar ensayos con velocidad angular del móvil por encima del umbral |
| **Hardware desconocido y heterogéneo (BYOD)** | **Alto** | Prueba de Aptitud en el propio teléfono (§3.5) · cuatro niveles con degradación explícita · `DeviceProfile` sellado en cada sesión como covariable |
| **Cámara `LEGACY` sin `TIMESTAMP_SOURCE_REALTIME`** → latencia de AR-2 no alineable | **Alto (académico)** | Detección en la prueba de aptitud · el teléfono baja a nivel B y AR-2 registra `latencyMs: null` con motivo, en vez de un número inventado |
| **Buena parte del parque cae en nivel C/D** | Medio (alcance) | Se descubre en la Fase 0 con el banco de referencia, no al analizar datos · la proporción por nivel es en sí un resultado publicable |
| **Rendimiento de inferencia en gama media** | Medio | GPU delegate · análisis a 640×480 · `BACKPRESSURE_KEEP_LATEST` · degradar a `noseRay` |
| **Gestión agresiva de batería (MIUI/HyperOS, One UI)** | Bajo-medio | Módulo en primer plano y sesiones cortas · aviso al adulto de no salir de la app durante el ejercicio |
| **Rechazo de Play por cámara en app de Familias** | **Alto (negocio)** | Las tres afirmaciones de §9.1 como restricciones de arquitectura · política y Data Safety en el mismo cambio · justificación preparada + vídeo de demo |
| **Binding RN de SceneView alpha sin raycast** | Alto si se elige la opción A | Opción B: el raycast vive en Kotlin, donde sí existe |
| **`react-native-mediapipe` abandonado** (dic. 2024) | Alto si se elige la opción A | Opción B: `tasks-vision` nativo, mantenido por Google |
| **Tamaño del APK** (Filament + MediaPipe `.task` ≈ 40-60 MB) | Medio | Sin ARCore (§3.3) · Play Asset Delivery o *feature module* on-demand · *ABI splits* · modelo `face_landmarker` en *asset pack* |
| **Falsos positivos en AR-2** (giro espontáneo leído como detección) | Medio (validez) | Ensayos trampa ~20 % · postura armada previa · intervalo inter-ensayo aleatorio |
| **Midas touch en AR-3** | Medio | Zona neutra · doble hitbox · máximo 3 objetos |
| **Frustración por reinicio de contador** | Medio (clínico) | Decaimiento en vez de reinicio · progreso continuo visible |
| **Solo Android en v1** | Medio | §13 · `FaceSignals` en vocabulario ARKit-compatible e interfaces desde el día 1: iOS es una implementación más, no un rediseño |
| **Confundido de método si iOS usa ARKit y Android MediaPipe** | Medio (académico) | MediaPipe en ambas plataformas (§13.2) · si conviven, plataforma y motor de señal viajan en cada registro como covariable |
| **Divergencia de assets GLB ↔ USDZ** en v2 | Bajo-medio | Script de verificación en `scripts/` que compruebe nombres de animación en ambos formatos, como ya se hace con el corpus de voz |
| **Sobre-ingeniería del módulo nativo** | Medio | El nativo **solo** mide y renderiza: no persiste, no cifra, no sincroniza. Todo eso sigue en JS |
| **Luz ambiental pobre en consulta** | Bajo-medio | Detector de calidad de tracking · aviso al adulto antes de armar el ensayo, nunca durante |

---

## 15. Decisiones abiertas que necesitan a Frank

**Cerradas** (2026-08-01): arquitectura **opción B, módulo nativo Android** ·
**v1 solo Android**, con el camino de iOS reservado en §13 · hardware =
**BYOD, gama media LATAM (Xiaomi / Samsung / Motorola), modelo desconocido hasta
el campo** → se resuelve con la Prueba de Aptitud del Dispositivo (§3.5), no
esperando el dato.

Quedan abiertas:

1. **Presupuesto del banco de referencia.** 3-4 teléfonos de segunda mano que
   representen el parque, incluido **uno deliberadamente malo**. Es lo único que
   bloquea el arranque de la Fase 0, y es una compra pequeña.
2. **Material del protocolo.** El móvil obliga a **soporte de sobremesa** y
   **transductor por cable** (§3.4b, §3.4c). ¿Se incluyen en el kit del piloto o
   se pide a cada centro que los aporte? Si no están garantizados, AR-2 y AR-3
   no producen dato publicable.
3. **AR-2: auriculares o altavoces externos.** Auriculares miden
   **lateralización**; dos altavoces a ±45-90° miden **localización en campo
   libre**, que es el VRA clásico. Son constructos distintos y condicionan cómo
   se redacta el artículo. Se puede hacer las dos cosas, pero como dos
   condiciones etiquetadas, no como una sola columna.
4. **AR-3: ¿se acepta el modo de 2 dianas?** En BYOD no es un caso raro: es el
   modo que le va a tocar a una parte del parque. La alternativa a tres dianas
   indiscriminables es elección forzada entre dos, con más ensayos para
   compensar el 50 % de azar. ¿Aceptable clínicamente?
5. **¿Qué nivel de aptitud mínimo se admite en el estudio?** Solo el nivel A da
   dato publicable en AR-2. ¿Las sesiones de nivel B y C entran en el análisis
   clínico aunque queden fuera del dataset de latencias, o se excluyen del
   piloto? Condiciona el tamaño muestral alcanzable.
6. **AR-2 y RA-5.** ¿AR-2 se presenta como versión instrumentada de RA-5
   («Localización del sonido») o como ejercicio independiente en el hub?
7. **Distribución del módulo.** ¿APK único más grande o *feature module*
   descargable a demanda? Afecta a la conversión en mercados con datos caros —
   relevante para el despliegue en LATAM.

---

## 16. Seguimiento

- [ ] **Fase 0** — Banco de referencia (3-4 teléfonos, uno deliberadamente malo) · las 7 sondas discriminan · umbrales de nivel calibrados
- [ ] **Fase 1** — Andamiaje nativo + puente + consentimiento + **Prueba de Aptitud del Dispositivo** + **privacidad y Data Safety actualizados**
- [ ] **Fase 2** — Capa de señal + calibración de 5 puntos + pantalla de diagnóstico
- [ ] **Fase 3** — `RewardChannel` con histéresis + `SceneHost` con los 3 GLB
- [ ] **Fase 4** — AR-1 Cinemática Orofacial jugable
- [ ] **Fase 5** — AR-3 Selección por fijación jugable
- [ ] **Fase 6** — AR-2 VRA digitalizado con latencias calibradas
- [ ] **Fase 7** — Dashboard, protocolo clínico, Academy, README a 7 bloques
- [ ] **Fase 8** (v2) — Arnés de paridad de señal Android ↔ iOS
- [ ] **Fase 9** (v2) — Host iOS (AVCaptureSession + MediaPipeTasksVision + CoreMotion)
- [ ] **Fase 10** (v2) — Capa de recompensa RealityKit + pipeline USDZ

**Verificación transversal en cada PR:** `npm run typecheck` en verde · humo
manual de los 6 bloques actuales sin cambio · muro MDR intacto (cero ajuste
automático de umbrales, cero veredicto algorítmico) · las tres afirmaciones de
privacidad de §9.1 siguen siendo literalmente ciertas en el código.

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
> Encuadre regulatorio: **SaMD Clase I (MDR)** · **permiso de cámara nuevo**
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
  - [3.6 Restricción de material: qué sobrevive con presupuesto cero](#36-restricción-de-material-qué-sobrevive-con-presupuesto-cero)
  - [3.7 Modelo de despliegue en dos niveles](#37-modelo-de-despliegue-en-dos-niveles-consecuencia-de-las-decisiones)
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
- [15. Decisiones (todas cerradas)](#15-decisiones-todas-cerradas)
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

**Decidido (2026-08-01): dos altavoces externos cableados.** Es la vía que mide
**localización en campo libre** —el VRA clásico— en lugar de lateralización por
auriculares. Gana constructo clínico y comparabilidad con la literatura
audiológica, y a cambio impone un montaje fijo que reordena dónde se juega AR-2
(§3.7). Especificación completa en §7.2.

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
| Audio | dispersión de `AudioTrack.getTimestamp()` sobre 20 disparos · ruta de salida (`AudioDeviceInfo`: se exige USB, no altavoz ni Bluetooth) · **lazo acústico** por micrófono si hay altavoces (§7.2) | 10 s |
| Balance de canales | tono por canal medido con el micrófono en la posición de la cabeza · corta si Δ > 1,5 dB | 8 s (solo en montaje de centro) |
| Puntero | RMS de `noseRay` e iris durante la calibración de 5 puntos | 15 s (reutiliza la calibración) |
| IMU | presencia y deriva de `GAME_ROTATION_VECTOR` | 5 s |
| Geometría | mm de pantalla + distancia estimada → separación angular alcanzable | inmediato |

**Salida: un `DeviceProfile` con un nivel de aptitud**, que decide qué se ofrece:

| Nivel | Condiciones | Qué se habilita |
| --- | --- | --- |
| **A · Instrumento** | fps p5 ≥ 20 · caída térmica ≥ 0,7 · timestamps `REALTIME` · dispersión de audio < 20 ms · puntero < 2,5° | Los tres ejercicios · **dato publicable** · es el **criterio de inclusión de sesión** del estudio (§3.7) |
| **B · Clínico** | fps p5 ≥ 20 · puntero < 2,5° · timestamps no fiables **o** sin ruta USB a los altavoces | AR-1 y AR-3 completos · AR-2 **solo como juego**, sin registrar latencia |
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

### 3.6 Restricción de material: qué sobrevive con presupuesto cero

**Decidido (2026-08-01): no hay material de protocolo.** Ni el proyecto ni los
centros aportan soporte de sobremesa ni transductor. Es una restricción dura y
el plan se ajusta a ella en lugar de asumir un material que no va a llegar.

**Consecuencia que hay que decir de una vez y sin rodeos:** el montaje de campo
libre de §7.2 **no se puede construir sin comprar altavoces**. Combinado con la
decisión 5 (solo nivel A entra en el estudio), tal cual queda **AR-2 no produce
dataset de latencias**. No es un problema de ingeniería: es aritmética de
inventario.

Lo que sí sobrevive, y no es poco:

| Ejercicio | ¿Necesita material? | Estado con presupuesto cero |
| --- | --- | --- |
| **AR-1** Cinemática Orofacial | **No** | ✅ Íntegro, incluido dato publicable. No mide dirección ni tiempo absoluto: un teléfono en la mano le afecta poco, y el filtro de pose ya descarta los frames malos |
| **AR-3** Selección por fijación | Solo estabilidad, no compra | ⚠️ Viable con el **protocolo de apoyo improvisado** (abajo) |
| **AR-2** VRA instrumentado | **Sí: dos altavoces** | ❌ Solo como juego (`latencyMs: null`). Sin dataset de latencias |

#### El apoyo improvisado: que lo garantice el software, no el hardware

Un soporte de móvil cuesta unos pocos euros, pero si no hay ninguno, la respuesta
correcta **no es renunciar a AR-3: es que la app imponga la geometría que el
soporte habría garantizado**. Ya hay dos piezas en el plan que sirven para esto:

1. **El IMU** (§3.4c) sabe si el teléfono está quieto. Se convierte en un
   **requisito armado**: el ensayo no arranca si el dispositivo no lleva 800 ms
   estable, y se anula si se mueve durante la ventana.
2. **El telémetro por distancia interocular** (§3.4a) sabe a qué distancia está
   la cara. Se usa para guiar la colocación antes de empezar.

El protocolo pasa a ser: **apoyar el teléfono en un libro, una caja o la pared**,
en horizontal, y dejar que la pantalla confirme en verde que la posición es
válida. Cuesta cero y es reproducible; lo que se pierde es comodidad, no validez,
porque la validez la vigila el software ensayo a ensayo.

> **La honestidad del caso:** esto sube la tasa de ensayos anulados, sobre todo
> con niños inquietos. Hay que medir esa tasa desde la Fase 5 y reportarla. Si
> resulta que se anula más de la mitad, la conclusión no será «AR-3 no funciona»
> sino «AR-3 necesita 6 € de soporte», y ese será un dato para reabrir la
> decisión con cifras en la mano en vez de con una intuición.

#### La vía sin coste para AR-2: el equipo que los centros ya tienen

Antes de dar AR-2 por perdido conviene mirar el inventario existente. Un servicio
de audiología o logopedia que ya hace VRA **suele tener salida de campo libre en
su audiómetro, o altavoces de sala calibrados**. Si un solo centro colaborador
los tiene, AR-2 se hace ahí:

- no requiere compra, solo un cable y un permiso;
- el equipo ya está **calibrado**, que es mejor que unos altavoces de consumo;
- encaja con el modelo de dos niveles (§3.7): AR-2 ya era ejercicio de centro.

**Acción concreta y barata:** un censo de equipamiento a los centros
colaboradores antes de la Fase 6. Es una pregunta por correo, no una partida
presupuestaria. Mientras no haya respuesta afirmativa, **AR-2 se planifica como
ejercicio de juego** y el peso académico del módulo recae en AR-1 y AR-3.

### 3.7 Modelo de despliegue en dos niveles (consecuencia de las decisiones)

Dos decisiones tomadas el 2026-08-01 —**altavoces externos** en AR-2 y **solo
nivel A** admitido en el estudio— se combinan en algo que conviene ver junto,
porque **parte el módulo en dos escenarios de uso** y resuelve una tensión que de
otro modo habría aparecido en mitad del reclutamiento.

| | **Casa · práctica** | **Centro · medición** |
| --- | --- | --- |
| Dispositivo | El teléfono de la familia (BYOD) | Teléfono **cualificado nivel A** del centro |
| Ejercicios | AR-1 y AR-3 | Los tres, incluido AR-2 |
| Audio | El del teléfono (AR-1 y AR-3 no lo necesitan lateralizado) | Montaje de altavoces a ±45-90° (§7.2) |
| Niveles admitidos | A, B y C, con su degradación | **Solo A** |
| Destino del dato | Adherencia, progreso, gamificación | **Dataset publicable** |

**Por qué esto encaja y no es un parche.** El montaje de campo libre exige una
sala con los altavoces colocados, medidos y equilibrados: eso ya no es portátil
ni desplegable en casa, sea cual sea el teléfono. Y si AR-2 solo se puede hacer
en un centro, es razonable que el teléfono de medición sea también del centro.

> **Ajuste por la restricción de material (§3.6).** Al no haber presupuesto de
> kit, el «teléfono cualificado del centro» **no se compra**: se identifica. El
> teléfono personal de la logopeda, o el de un familiar, que la Prueba de Aptitud
> clasifique como nivel A sirve exactamente igual —lo que cualifica un
> dispositivo son sus siete sondas, no su factura—. Basta con que sea **el mismo
> teléfono a lo largo del estudio** y quede sellado su `DeviceProfile`. La
> columna «Centro · medición» de la tabla sigue siendo válida; lo que cambia es
> de dónde sale el aparato.

**Consecuencias que hay que asumir:**

1. **El BYOD sigue siendo real donde importa para la adherencia** (la práctica en
   casa, que es lo que se hace a diario) y desaparece donde arruinaría el dato
   (la medición).
2. **El nivel A pasa a ser criterio de inclusión de sesión**, no solo un ajuste
   técnico. Cada cribado —incluidos los fallidos— se registra, para poder
   reportar la tasa de exclusión por dispositivo en el diagrama de flujo del
   estudio.
3. **AR-3 en el estudio va siempre con 3 dianas**, porque el nivel A exige
   puntero < 2,5° por definición. El modo de 2 dianas queda para el uso clínico y
   doméstico (niveles B y C), donde no se publica. Eso desactiva de golpe la
   preocupación estadística del 50 % de azar en el dataset (§7.3).
4. **El teléfono de medición no se compra, se cualifica** (recuadro anterior).
   Lo único que se compra es el banco de referencia de la Fase 0, con los 150 €
   asignados (§15).

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
| **Dos altavoces externos cableados** a ±45-90° | Sí | **Localización en campo libre** (el VRA clásico) | ✅ **Elegido** · montaje de centro |
| Auriculares por cable (adaptador USB-C) | Sí | Lateralización por diferencias interaurales (ILD/ITD) | Reserva documentada, no en uso |
| ~~Altavoz del teléfono~~ | — | Nada utilizable | ❌ |
| ~~Cualquier transductor Bluetooth~~ | — | La latencia del enlace | ❌ |

**Lateralización ≠ localización, y por eso importa la elección.** Con auriculares
el niño discrimina *de qué oído viene*; en campo libre, *de qué punto del
espacio*. Al elegir campo libre, AR-2 mide el mismo constructo que el VRA de
cabina y **es comparable con la literatura audiológica**, que es donde está el
valor de publicarlo. El registro sella `transducer` de todos modos: si algún día
se añade la condición de auriculares, será una condición etiquetada aparte y
nunca la misma columna.

> **Estado real (2026-08-01): el montaje no está financiado (§3.6).** La
> especificación siguiente queda **escrita y lista**, pero AR-2 se planifica por
> defecto como **ejercicio de juego sin registro de latencia**. Se activa el modo
> instrumento solo si un centro colaborador aporta salida de campo libre ya
> existente —audiómetro o altavoces de sala calibrados—, que es la vía sin coste
> descrita en §3.6. El código se escribe igual: la diferencia es un
> `DeviceProfile` y un montaje, no una rama distinta.

#### Montaje de campo libre (especificación del protocolo)

| Parámetro | Valor | Por qué |
| --- | --- | --- |
| Azimut | **±60°** respecto al eje de la mirada (dentro del rango ±45-90°) | Suficiente separación para exigir giro real, sin salir del campo alcanzable por un niño sentado |
| Distancia | 1 m a cada altavoz, **equidistantes** | Una asimetría de distancia es una asimetría de nivel encubierta |
| Altura | A la altura del oído del niño sentado | El VRA es horizontal; la elevación introduce confusión frente-atrás |
| Cadena | Salida USB-C → DAC/interfaz → altavoces **autoamplificados** | La mayoría de la gama media no lleva jack de 3,5 mm |
| Nivel | Fijado y **medido en la posición de la cabeza**; se registra en dB SPL | Sin nivel declarado, la latencia no es interpretable: a más nivel, menos latencia |
| Sala | Sin reverberación marcada, sin superficies duras cercanas | La reverberación degrada las claves de localización |

**Equilibrio de canales: una comprobación obligatoria antes de cada sesión.** Un
desbalance de 2-3 dB entre altavoces sesga sistemáticamente las respuestas hacia
el lado más fuerte, y se leería como asimetría auditiva del niño. Es decir:
produciría exactamente el hallazgo falso que el ejercicio busca detectar. La
rutina de montaje reproduce un tono por cada canal y **lo mide con el micrófono
del propio teléfono** colocado en la posición de la cabeza; si la diferencia
supera 1,5 dB, no deja arrancar.

**El regalo inesperado de los altavoces: la latencia se puede medir de verdad.**
Con auriculares había que confiar en `AudioTrack.getTimestamp()`. Con altavoces
externos, **el micrófono del teléfono oye el estímulo**, así que se puede cerrar
un lazo acústico y medir la latencia real de extremo a extremo —cadena USB, DAC,
amplificación y propagación incluidas— con un tren de clics al inicio de la
sesión. Eso convierte la incertidumbre de §3.4e de estimada a **medida**, y es
una mejora sustancial en la defensa metodológica del dato. Se corrige el tiempo
de vuelo (≈ 2,9 ms/m) y se registra el residuo.

**AR-2 tiene dos modos y el montaje decide cuál.** En el centro, con altavoces
montados y teléfono de nivel A, mide. En casa —sin montaje, o con un
`DeviceProfile` por debajo de A, o con marcas de tiempo no alineables (§3.4e)—
el ejercicio **se juega igual pero no registra latencia**: el niño gira, el perro
celebra, y el registro guarda acierto/fallo y `latencyMs: null` con el motivo. Un
dato ausente y etiquetado es honesto; un dato presente y sesgado, no.

La detección de la ruta de salida se hace en caliente (`AudioDeviceInfo`): si
alguien desconecta el DAC a mitad de sesión, los ensayos siguientes bajan de modo
y quedan marcados, sin interrumpir al niño.

En usuarios de implante unilateral la vía ipsi/contralateral es información
clínica: se registra el **canal físico excitado**, no una etiqueta «derecha».

> **Decidido (2026-08-01): tarjeta propia en el hub, parentesco documentado.**
> Ya existe **RA-5 «Localización del sonido»** en `AUDICION_META` como ejercicio
> manual con campanita. AR-2 **no lo sustituye ni se esconde dentro de él**:
> tiene su propia entrada en el bloque de Realidad Aumentada, y la documentación
> clínica y la cápsula de Academy lo presentan como **la versión instrumentada de
> RA-5**. Así RA-5 sigue disponible donde no hay montaje —que va a ser la mayoría
> de los sitios— y AR-2 no queda enterrado bajo un ejercicio de otro bloque.
> `META_BY_ID` gana un campo opcional `instrumentaA: 'ra5'` para que el
> parentesco viva en los datos y no solo en la prosa.

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

> **Aceptado (2026-08-01), y con menos coste del previsto.** Como el estudio
> admite solo sesiones de nivel A (§3.7) y el nivel A exige por definición
> puntero < 2,5°, **el dataset publicable va siempre a 3 dianas**. El modo de 2
> queda para el uso clínico y doméstico en niveles B y C, donde no se publica y
> por tanto el 50 % de azar no contamina ningún análisis. Aun así se registra
> `targetCount` en cada ensayo: mezclar 2 y 3 dianas en un mismo informe de
> progreso individual seguiría siendo engañoso.

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

### 9.3 Muro MDR · el muro es lo que sostiene la Clase I

Los tres ejercicios producen medidas que *suenan* a diagnóstico (latencia VRA,
índice de redondeo). El módulo:

- Registra **magnitudes físicas**, nunca veredictos («sostuvo 1.240 ms», no
  «dislalia leve»).
- No calcula percentiles, ni compara contra normativa, ni sugiere.
- No adapta umbrales entre ensayos ni entre sesiones.
- Todo umbral es un valor que **el adulto fijó** y que viaja en el registro para
  que el dato sea interpretable a posteriori.

> **Por qué esto pasa de buena práctica a restricción dura.** El encuadre de este
> módulo es **SaMD Clase I**, y esa clasificación **se gana precisamente con las
> cuatro reglas de arriba**: el módulo instrumenta y registra, y la decisión
> clínica la toma íntegramente una persona a partir de datos crudos. En el
> momento en que un ejercicio puntuara automáticamente, comparara contra valores
> normativos o ajustara su propia dificultad, dejaría de describir lo observado y
> pasaría a **informar una decisión diagnóstica o terapéutica**, que es el
> territorio de la Clase IIa —con su organismo notificado, su evaluación de
> conformidad y su calendario—.
>
> Dicho de otro modo: el muro MDR ya no es solo higiene de diseño, es **el
> argumento de clasificación**. Cualquier propuesta futura del tipo «que la app
> avise si la latencia es alta para la edad» no es una mejora de producto: es un
> cambio de clase regulatoria. Debe rechazarse en revisión de código, o
> escalarse como decisión de negocio consciente, nunca colarse como refinamiento.

**Consecuencia práctica para el dashboard y la exportación:** el panel del
paciente y el `fullLog` muestran **series y magnitudes**, no semáforos ni
etiquetas de severidad. Un gráfico de latencias por ensayo es descripción; un
badge rojo de «por debajo de lo esperado» es interpretación, y no cabe en Clase I.

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
referencia** que hay que ajustar al presupuesto real.

**Presupuesto asignado: 150 €.** En el mercado europeo de segunda mano eso no
llega a 3-4 teléfonos: un Redmi Note de ~2 años ronda los 80-110 €, un Galaxy A
de 2-3 años los 60-90 €, y solo el de gama baja antigua baja de 40 €. Con 150 €
se compran **dos**, no cuatro. Antes de comprar, conviene confirmar precios en el
mercado local, que puede ser bastante más barato que el europeo.

**Reparto propuesto (comprar dos, y bien elegidos):**

| Compra | Presupuesto | Papel | Por qué este y no otro |
| --- | --- | --- | --- |
| **Gama baja antigua** (Redmi de entrada o Moto G de 3-4 años, a ser posible con cámara `LEGACY`) | ~40 € | **Caso peor deliberado** | Es el que **define el suelo** y el único que valida el camino `TIMESTAMP_SOURCE_UNKNOWN` (§3.4e). Sin él, la Prueba de Aptitud no se puede calibrar: un banco donde todo pasa no discrimina nada |
| **Gama media reciente** (Redmi Note o Galaxy A de ~2 años) | ~100 € | Caso nominal | Es el teléfono de desarrollo diario y el que debe salir nivel A |

**Y la parte que no cuesta dinero: un censo de dispositivos prestados.** La
Prueba de Aptitud (§3.5) **es portátil y dura 90 segundos**. No hace falta poseer
un teléfono para caracterizarlo: basta con ejecutarla en los móviles de
compañeros, personal del centro y familias que ya acuden a consulta. Veinte
teléfonos prestados en dos semanas dan **muchísima más información sobre el
parque real** que cuatro comprados a ojo, y cuestan cero.

Los teléfonos comprados sirven para lo que sí exige propiedad: desarrollar a
diario y volver a probar cada cambio. La caracterización del parque sale del
censo.

> **Efecto secundario valioso:** ese censo, con `Build.MANUFACTURER`/`MODEL` y el
> nivel de aptitud de cada teléfono, es literalmente la tabla de viabilidad de
> hardware doméstico en LATAM que §8 señala como resultado publicable. Se obtiene
> antes de escribir el módulo, no después del piloto.

Todas las medidas, **con el teléfono apoyado y estable, a 30-35 cm, en
landscape** (§3.6).

**Criterios de salida:**

1. **La envolvente existe.** Las siete sondas de §3.5 discriminan de verdad
   entre los teléfonos del banco: el caso peor cae en C o D y el nominal en A o
   B. Una sonda que da el mismo veredicto para todos no sirve y se rediseña.
2. **Los umbrales de nivel están calibrados** contra observación real: en el
   teléfono que la sonda clasifica como A, el ejercicio se ve y se juega bien;
   en el que clasifica como D, efectivamente no.
3. **La `Prueba de Aptitud` corre en menos de 90 s** y produce un `DeviceProfile`
   serializable.
4. **El caso peor está caracterizado**: el teléfono de gama baja debe fallar
   alguna sonda, y su modo degradado tiene que ser una experiencia aceptable, no
   un error.
5. **El censo tiene al menos 15 teléfonos prestados** con su nivel de aptitud
   registrado.

**Entregable:** la prueba de aptitud como componente reutilizable + la tabla del
censo, que es el apéndice de método del futuro artículo y la base para decidir
qué proporción del parque podrá usar el módulo.

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
de que exista ningún ejercicio. **Criterio duro añadido:** el delta de descarga
del AAB frente a la versión sin módulo AR se mide aquí y no puede superar
**+25 MB** (decisión 7).

### Fase 4 · AR-1 Cinemática Orofacial

El más simple: sin precisión temporal, sin calibración espacial.
**Salida:** primer ejercicio jugable de punta a punta, con registro por ensayo.

### Fase 5 · AR-3 Selección por fijación

Necesita calibración (Fase 2) pero no *timing* de audio.
**Salida:** tres objetos, *dwell* con anillo de progreso, primera fijación y
selección registradas por separado. **Añadido por la restricción de material
(§3.6):** ensayo armado solo con 800 ms de IMU estable, anulación si el teléfono
se mueve, y **la tasa de anulación como métrica de primera clase** — es el dato
que decidirá si reabrir la compra de soportes.

### Fase 6 · AR-2 VRA digitalizado

El último **a propósito**, y ahora además **condicionado**: el montaje de campo
libre no está financiado (§3.6). Se implementa el ejercicio completo —ensayos
trampa, postura armada, aleatorización— y **se entrega como juego**, con
`latencyMs: null`. El camino instrumento (balance de canales, lazo acústico,
dB SPL sellado) se escribe igual pero solo se activa si el censo de equipamiento
encuentra un centro con campo libre ya calibrado.
**Requisito previo, sin coste:** hacer ese censo por correo **antes** de arrancar
la fase, para saber si se entrega juego o instrumento.
**Salida:** AR-2 jugable en cualquier caso · dataset de latencias solo si hubo
montaje.

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
| **Buena parte del parque cae en nivel C/D** | Medio (alcance) | Se descubre en la Fase 0 con el banco de referencia, no al analizar datos · la proporción por nivel es en sí un resultado publicable · **la medición no depende del parque**: va sobre teléfono de centro (§3.7) |
| **Desbalance entre altavoces leído como asimetría auditiva del niño** | **Alto (validez)** | Comprobación de balance con el micrófono en la posición de la cabeza antes de cada sesión · corte duro si Δ > 1,5 dB (§7.2) |
| **Nivel de presentación no declarado** → latencias no interpretables | Medio (académico) | dB SPL medido en la posición de la cabeza y sellado en la sesión · a más nivel, menos latencia: sin el dato, la comparación entre centros no se sostiene |
| **Reverberación de sala degrada la localización** | Medio (validez) | Requisito de sala en el protocolo · registrar la sala como identificador para poder modelar el efecto de centro |
| **AR-2 sin montaje financiado** → sin dataset de latencias | **Alto (académico)** | Asumido y explícito (§3.6) · AR-2 se planifica como juego · el peso académico recae en AR-1 y AR-3 · censo de equipamiento a los centros como vía sin coste antes de la Fase 6 |
| **Sin soporte de móvil** → AR-3 pierde calibración al moverse el teléfono | **Alto (validez)** | El software impone la geometría que el soporte habría dado: ensayo armado solo con 800 ms de IMU estable, anulado si se mueve · **medir y reportar la tasa de anulación desde la Fase 5** |
| **Tasa de anulación alta en AR-3 con niños inquietos** | Medio | Si supera el 50 %, se reabre la decisión de material **con cifras**, no con intuición (§3.6) |
| **Rendimiento de inferencia en gama media** | Medio | GPU delegate · análisis a 640×480 · `BACKPRESSURE_KEEP_LATEST` · degradar a `noseRay` |
| **Gestión agresiva de batería (MIUI/HyperOS, One UI)** | Bajo-medio | Módulo en primer plano y sesiones cortas · aviso al adulto de no salir de la app durante el ejercicio |
| **Rechazo de Play por cámara en app de Familias** | **Alto (negocio)** | Las tres afirmaciones de §9.1 como restricciones de arquitectura · política y Data Safety en el mismo cambio · justificación preparada + vídeo de demo |
| **Binding RN de SceneView alpha sin raycast** | Alto si se elige la opción A | Opción B: el raycast vive en Kotlin, donde sí existe |
| **`react-native-mediapipe` abandonado** (dic. 2024) | Alto si se elige la opción A | Opción B: `tasks-vision` nativo, mantenido por Google |
| **Tamaño del paquete** (Filament + MediaPipe `.task` ≈ 40-60 MB) | Medio | **Decidido: paquete único, sin *feature module*.** Se apoya en que el **AAB de Play ya entrega por ABI y densidad**, así que la descarga real es bastante menor que el universal · sin ARCore (§3.3) · GLB con Draco/meshopt · **presupuesto duro: +25 MB de descarga**, medido como criterio de salida de la Fase 3 |
| **Falsos positivos en AR-2** (giro espontáneo leído como detección) | Medio (validez) | Ensayos trampa ~20 % · postura armada previa · intervalo inter-ensayo aleatorio |
| **Midas touch en AR-3** | Medio | Zona neutra · doble hitbox · máximo 3 objetos |
| **Frustración por reinicio de contador** | Medio (clínico) | Decaimiento en vez de reinicio · progreso continuo visible |
| **Solo Android en v1** | Medio | §13 · `FaceSignals` en vocabulario ARKit-compatible e interfaces desde el día 1: iOS es una implementación más, no un rediseño |
| **Confundido de método si iOS usa ARKit y Android MediaPipe** | Medio (académico) | MediaPipe en ambas plataformas (§13.2) · si conviven, plataforma y motor de señal viajan en cada registro como covariable |
| **Deriva de Clase I a IIa** por añadir puntuación automática, comparación normativa o dificultad adaptativa | **Alto (regulatorio)** | El muro MDR es el argumento de clasificación (§9.3) · se verifica en cada PR · una propuesta así se escala como decisión de negocio, nunca se acepta como refinamiento |
| **Divergencia de assets GLB ↔ USDZ** en v2 | Bajo-medio | Script de verificación en `scripts/` que compruebe nombres de animación en ambos formatos, como ya se hace con el corpus de voz |
| **Sobre-ingeniería del módulo nativo** | Medio | El nativo **solo** mide y renderiza: no persiste, no cifra, no sincroniza. Todo eso sigue en JS |
| **Luz ambiental pobre en consulta** | Bajo-medio | Detector de calidad de tracking · aviso al adulto antes de armar el ensayo, nunca durante |

---

## 15. Decisiones (todas cerradas)

Las siete decisiones planteadas quedaron resueltas el **2026-08-01**:

| # | Decisión | Consecuencia principal |
| --- | --- | --- |
| — | Arquitectura **opción B**: módulo nativo Android | Valeria+ no migra a Nueva Arquitectura |
| — | **v1 solo Android** | Camino de iOS reservado en §13 |
| — | Hardware **BYOD gama media LATAM**, modelo desconocido | Prueba de Aptitud del Dispositivo (§3.5) |
| 1 | Banco de referencia: **150 €** | Alcanza para **dos** teléfonos, no cuatro: uno de gama baja antigua (~40 €, define el suelo) y uno de gama media reciente (~100 €, desarrollo diario). La cobertura del parque sale de un **censo de móviles prestados**, que cuesta cero (§12, Fase 0) |
| 2 | **Sin material de protocolo**: ni kit del proyecto ni aportación de los centros | AR-1 intacto · AR-3 con apoyo improvisado validado por software · **AR-2 sin dataset de latencias** salvo que un centro aporte campo libre ya existente (§3.6) |
| 3 | AR-2 con **dos altavoces externos cableados** | Mide localización en campo libre · montaje de centro · habilita el lazo acústico (§7.2) |
| 4 | **Sí** al modo de 2 dianas en AR-3 | Queda para niveles B y C; el estudio va siempre a 3 (§7.3) |
| 5 | El estudio admite **solo nivel A** | Criterio de inclusión de sesión · medición sobre teléfono de centro (§3.7) |
| 6 | AR-2 con **tarjeta propia** en el hub, documentado como versión instrumentada de RA-5 | RA-5 manual sigue vivo donde no hay montaje (§7.2) |
| 7 | **Paquete único**, sin *feature module* | Presupuesto duro de +25 MB de descarga, medido en la Fase 3 (§14) |

Las decisiones 3 y 5 se combinan en un **modelo de despliegue en dos niveles**
—casa para practicar, centro para medir— que está desarrollado en §3.7. Es el
cambio de mayor alcance de esta tanda. La decisión 2 (sin material) las acota:
§3.6 detalla qué sobrevive con presupuesto cero.

**No quedan decisiones abiertas.** El plan está completo y ejecutable tal como
está; lo que hay por delante es la Fase 0.

**Lo que conviene revisar más adelante, con datos en la mano y no antes:**

- **Tasa de anulación de ensayos en AR-3** sin soporte (se mide en la Fase 5). Un
  soporte de sobremesa cuesta unos pocos euros y es, con diferencia, el material
  con mejor relación entre coste y validez recuperada. Si la tasa resulta alta,
  merece reabrirse **con la cifra delante**.
- **Censo de equipamiento de campo libre** en los centros colaboradores, antes de
  la Fase 6. Es una pregunta por correo, no una partida presupuestaria, y es la
  única vía que devuelve a AR-2 su valor académico sin gastar.

---

## 16. Seguimiento

- [ ] **Fase 0** — Banco de 2 teléfonos (150 €: gama baja antigua + gama media) · **censo de ≥ 15 móviles prestados** · las 7 sondas discriminan · umbrales calibrados
- [ ] **Fase 1** — Andamiaje nativo + puente + consentimiento + **Prueba de Aptitud del Dispositivo** + **privacidad y Data Safety actualizados**
- [ ] **Fase 2** — Capa de señal + calibración de 5 puntos + pantalla de diagnóstico
- [ ] **Fase 3** — `RewardChannel` con histéresis + `SceneHost` con los 3 GLB · delta de descarga ≤ +25 MB
- [ ] **Fase 4** — AR-1 Cinemática Orofacial jugable
- [ ] **Fase 5** — AR-3 Selección por fijación jugable · apoyo improvisado validado por IMU · tasa de anulación medida
- [ ] **Fase 6** — Censo de equipamiento a los centros · AR-2 jugable · modo instrumento (±60°, balance, lazo acústico) **solo si hay campo libre disponible**
- [ ] **Fase 7** — Dashboard, protocolo clínico, Academy, README a 7 bloques
- [ ] **Fase 8** (v2) — Arnés de paridad de señal Android ↔ iOS
- [ ] **Fase 9** (v2) — Host iOS (AVCaptureSession + MediaPipeTasksVision + CoreMotion)
- [ ] **Fase 10** (v2) — Capa de recompensa RealityKit + pipeline USDZ

**Verificación transversal en cada PR:** `npm run typecheck` en verde · humo
manual de los 6 bloques actuales sin cambio · **muro MDR intacto** (cero ajuste
automático de umbrales, cero veredicto algorítmico, cero comparación normativa:
es el argumento que sostiene la Clase I, §9.3) · las tres afirmaciones de
privacidad de §9.1 siguen siendo literalmente ciertas en el código.

# Fallo de Realidad Aumentada en el Pixel 6a · qué se sabe y qué no

> **Bugreport:** 2/9/2026, 15:39 CEST · Google Pixel 6a (`bluejay`, `CP2A.260705.006`)
> **Paquete:** `eu.futureforkids.valeria` · **Fuente:** bugreport de 101 MB fuera del repo
> **Estado:** el cierre inesperado está **arreglado y cubierto por gates** (build 639,
> `main`, en verde). El disparador fue la ventana de actualización de ARCore —§0—,
> y la app ya no depende de que esa ventana esté cerrada para no romperse.

---

## 0. Dos correcciones, y por qué se dejan escritas

Este informe se ha equivocado dos veces en la causa raíz. Ambas quedan aquí
porque el patrón importa más que cualquiera de las dos.

**Primera versión (3/9/2026): «ARCore 1.48 frente al SDK 1.54.0».** Frank
respondió que el teléfono tiene la última versión de *Servicios de Google para
RA*. Se dio la hipótesis por muerta.

**Segunda corrección: matarla entera fue pasarse.** El bugreport registra la
instalación:

```text
546286:  09-02 15:06:38.985  pkginst=262080393:"com.google.ar.core"
551975:  Update com.google.ar.core vers=262080393
262341:  PACKAGE_ADDED  dat=package:com.google.ar.core
262657:  PACKAGE_REMOVED dat=package:com.google.ar.core
```

`PACKAGE_REMOVED` seguido de `PACKAGE_ADDED` es la firma de una
**actualización**, y ocurrió a las **15:06:38.985 — 2,4 segundos después del
primer cierre** (15:06:36.536). Las dos afirmaciones eran ciertas en momentos
distintos: en el instante del fallo el ARCore del aparato no estaba al día;
hoy sí lo está, **porque se actualizó en esa misma sesión, justo después de
reventar**. El informe describía el antes y la comprobación miraba el después.

Lo que sostiene el episodio entero no es ninguna de las dos hipótesis, sino
esto: **la app calculaba la causa exacta del fallo y no se la contaba a nadie.**
Por eso hubo que reconstruirla desde un volcado de 101 MB, y por eso salió mal
dos veces. Con la causa viajando —lo que ahora hace— esto habría sido una línea
en la pantalla.

Y de ahí el criterio que ordena el resto del trabajo, fijado por Frank: **la app
debe funcionar aunque el servicio esté desactualizado.** No es un caso raro de
teléfono viejo: es cualquier aparato en la ventana entre que Google publica una
versión y el usuario la instala. Con `com.google.ar.core = optional` en el
manifiesto —decisión correcta, porque `required` impediría instalar Valeria+ en
móviles sin RA— esa ventana **no se cierra sola**.

---

## 1. Lo que sí está establecido: por qué se cerraba la app

Verificado leyendo el código, no inferido del bugreport. Esta parte se sostiene
entera y es independiente de qué disparara el fallo en el aparato.

El host nativo devolvía dos formas distintas por el mismo canal:

| Situación | Payload |
| --- | --- |
| Prueba completada | `{"deviceProfile": {…}}` |
| Cualquier otra cosa | `{"outcome": "unsupported" \| "aborted" \| "denied"}` |

En modo aptitud `config` es `null`, así que `finishWith` caía siempre a la
segunda rama (`ValeriaArActivity.kt`). El puente aplicaba entonces esta
proyección (`ValeriaArModule.kt`):

```kotlin
{ map -> map.getMap("deviceProfile") ?: map }
```

Ese `?:` es el fallo. Sin perfil, **devolvía el mapa de error** y resolvía la
promesa con él. En `ValeriaArLauncherScreen.tsx`:

* `p` era `{ outcome: "unsupported" }` → `!p` es `false`, pasa el guardia;
* `p.level` era `undefined` → `undefined === 'D'` es `false`;
* de ahí, `setPhase('menu')`: la pantalla concluía que el teléfono era **apto**;
* al pintar el menú, `arPolicyFor(undefined)` devolvía `undefined`;
* y `policy.exercises.includes(id)` cerraba el proceso.

```text
com.facebook.react.common.JavascriptException:
  TypeError: Cannot read property 'exercises' of undefined
    at ValeriaArLauncherScreen (index.android.bundle:1:2999094)
```

*(Extracto del bugreport aportado por Frank; no reproducible desde el repo.)*

**Dos consecuencias que la primera versión no recogía:**

1. **No era un fallo del Pixel 6a.** Reventaba *toda* salida que no fuera éxito:
   atrás durante el calentamiento, permiso denegado, cámara ocupada, sin cámara
   frontal. El camino más frecuente en pediatría —un niño que se cansa a mitad
   de una prueba de 60-90 s— cerraba la app en cualquier teléfono.
2. **Caché envenenada.** `saveArDeviceProfile(p)` corría *antes* de validar el
   nivel, así que `{outcome:"unsupported"}` quedaba persistido. A partir de ahí
   el bloque 7 se cerraba **sin llegar a lanzar la Activity nativa**, en cada
   apertura. El crash se lo lleva un reinicio; esto no.

## 2. El defecto que hizo falso el diagnóstico

La app distingue seis causas de no-apertura y escribe el mensaje correcto para
cada una. Y luego:

1. pone `statusText` y llama a `finishWith` en la línea siguiente, que hace
   `finish()` — **el adulto no llega a leer ninguno de los seis mensajes**;
2. manda a JS `JSONObject().put("outcome", outcome)`: **el motivo no viajaba**;
3. JS mostraba «No se pudo completar la prueba. **Puedes intentarlo de nuevo**»,
   invitando a repetir en bucle una prueba que en ese aparato quizá no pueda
   pasar nunca.

A eso se sumaba que el `catch (e: Exception)` de `ArCoreSession.ensureCreated()`
etiquetaba **cualquier** excepción como `DEVICE_NOT_SUPPORTED`: convertía «no sé
qué ha pasado» en «este teléfono no sirve».

## 3. La cronología, reconstruida con la evidencia de la instalación

| Hora | Evento |
| --- | --- |
| 15:06:2x | `ensureCreated()` → `requestInstall` → Play Store |
| **15:06:36.536** | Vuelve a la app, ARCore aún no listo → `finishWith("unsupported")` → **cierre 1** |
| **15:06:38.985** | ARCore termina de actualizarse (`pkginst`, `vers=262080393`) |
| 15:07:09.072–09.332 | `ProfileDownloadJobService`: ARCore descarga el perfil del aparato |
| **15:07:11.446** | **cierre 2**, mismo stack |

El segundo cierre admite dos caminos —la caché envenenada del primero, o un
segundo intento sobre un ARCore recién instalado— y **no se decide con la
evidencia disponible**. Los dos producen el mismo stack y los dos están
cerrados por el arreglo, así que la distinción es académica.

En el volcado **no consta ninguna línea `ValeriaArCore`**, así que el `catch`
genérico no llegó a disparar. Con una salvedad: el buffer de logcat en el
momento de la captura (15:39) ya había rotado más allá de las 15:06, de modo
que la ausencia no es prueba concluyente. A partir del build 639 la pregunta
deja de necesitar un bugreport: el motivo aparece en la propia pantalla.

## 4. Lo que se ha arreglado

| Capa | Antes | Ahora |
| --- | --- | --- |
| `ValeriaArModule.kt` | `getMap("deviceProfile") ?: map` disfrazaba el error de perfil | Entrega el mapa crudo; la proyección se ha eliminado entera |
| `ValeriaArActivity.kt` | El payload de fallo era solo `outcome` | Lleva `reason`, `permanent` y `detail` |
| `ValeriaArActivity.kt` | `pipelineStarted` se ponía antes de existir la tubería | Se pone tras `gl.onResume()`; la rama de reintento vuelve a ser alcanzable |
| `ValeriaArActivity.kt` | `startPipeline` corría sobre una Activity cerrándose | Sale si `isFinishing \|\| isDestroyed` |
| `ArCoreSession.kt` | Toda excepción era `DEVICE_NOT_SUPPORTED` | `UNKNOWN` + `detail` con la clase de la excepción |
| `ValeriaArActivity.kt` | «Instalando Realidad Aumentada…» se quedaba parado si ARCore acababa sin que la Activity se pausara | Reintento acotado (4 × 2,5 s) y motivo propio `INSTALL_PENDING` al agotarse |
| `valeriaArBridge.ts` | `Promise<ArDeviceProfile>`: una promesa incumplible | `ArAptitudeOutcome`, unión discriminada por `ok` |
| `ValeriaArLauncherScreen.tsx` | Guardaba antes de validar; «inténtalo de nuevo» siempre | Valida antes de guardar; causa permanente cierra el bloque explicando cuál |
| `valeriaArSettings.ts` | `arPolicyFor` podía devolver `undefined` | Defecto a la política D |

Lo sujetan **ocho comprobaciones nuevas**: cuatro en `check-ar-concurrency.js`
(lado Kotlin) y el gate nuevo `check-ar-bridge-contract.js` (lado TypeScript),
que además **compara el enum `Unavailable` de Kotlin con la unión
`ArFailureReason` de TypeScript**: una causa nueva en el nativo que TS no
conozca rompe el build en vez de caer al mensaje genérico.

## 5. Lo que queda

**El bloque 7 sigue sin abrirse en ese Pixel.** Lo que cambia es que ya no cierra
la app y que dice cuál es la causa. Eso no cumple todavía el criterio de Frank.

El siguiente paso de mayor valor no es de robustez sino de arquitectura, y esta
constatación lo ordena: **ni uno de los seis ejercicios lee un solo dato de
ARCore.** Los seis consumen `FaceSignals`, que produce MediaPipe. `AugmentedFace`
solo se importa en `ArCoreSession.kt`; `MESH3D` se configura y su malla no se
lee nunca; `trackedFace()` se usa como compuerta de ahorro para no despertar a
MediaPipe entre ensayos. ARCore aquí hace tres cosas —abrir y orientar la cámara,
pintar el espejo en GL, y esa compuerta—, y las tres son fontanería.

Propuesta: **ARCore como vía rápida, no como suelo.** `ArCoreSession` ya expone
la interfaz adecuada (`ensureCreated/resume/pause/update/trackedFace/acquireImage/close`);
una segunda implementación sobre CameraX cumple el mismo contrato y hace que el
bloque abra en cualquier teléfono con cámara frontal, con el nivel de aptitud
expresando la capacidad degradada. Requiere compilar Kotlin y un aparato
delante: no se hace a ciegas.

# Fallo de Realidad Aumentada en el Pixel 6a · qué se sabe y qué no

> **Bugreport:** 2/9/2026, 15:39 CEST · Google Pixel 6a (`bluejay`, `CP2A.260705.006`)
> **Paquete:** `eu.futureforkids.valeria` · **Fuente:** bugreport de 101 MB fuera del repo
> **Estado:** el cierre inesperado está **arreglado y cubierto por gates**. La causa
> nativa que lo disparó sigue **abierta**.

---

## 0. Corrección de la primera versión de este informe

La primera versión (3/9/2026) afirmaba como causa raíz una incompatibilidad de
versión: ARCore 1.48 de fábrica en el teléfono frente al SDK 1.54.0 con el que
se compila. **Es falso.** Frank confirmó que el aparato tiene la última versión
de *Servicios de Google para RA* instalada.

Se deja escrito porque la cadena que llevó a esa conclusión equivocada es, ella
misma, el defecto más caro de este episodio: **la app calculaba la causa exacta
del fallo y no se la contaba a nadie**, así que hubo que reconstruirla a mano
desde un volcado de 101 MB. Con la causa viajando —lo que ahora hace— este
informe habría sido una línea.

Y la corrección trae consigo el criterio que ordena el resto del trabajo, fijado
por Frank: **la app debe funcionar aunque el servicio esté desactualizado.** Una
causa que depende de que un servicio de Google esté al día no es una causa
aceptable en un despliegue BYOD.

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

## 3. La causa nativa: abierta, con el comando que la zanja

Con *Servicios de Google para RA* al día, `checkAvailability` devuelve
`SUPPORTED_INSTALLED` y la rama de instalación no se toma. Quedan dos
candidatas, **ambas hipótesis**:

* **`NO_FRONT_CAMERA`** — `getSupportedCameraConfigs(filter FRONT)` devuelve
  lista vacía. La certificación de ARCore para cámara **frontal** (Augmented
  Faces) es una lista más corta que la de RA de mundo, y **no la arregla ninguna
  actualización**. Encaja con todo: servicio al día, fallo inmediato, repetible,
  un aparato concreto.
* **El `catch` genérico**, con la excepción real solo en el log.

Se distinguen con un grep, porque `NO_FRONT_CAMERA` no escribe log y el
`catch` sí:

```bash
grep -n "ValeriaArCore" bugreport-bluejay-*.txt
```

* **Aparece** `No se pudo crear la sesión de ARCore` → la excepción adjunta
  nombra la causa; ahora además viaja hasta la pantalla como `UNKNOWN · <clase>`.
* **No aparece** → `NO_FRONT_CAMERA` o `UNSUPPORTED_DEVICE_NOT_CAPABLE`: causa
  permanente en ese aparato, y ninguna actualización la toca.

## 4. Lo que se ha arreglado

| Capa | Antes | Ahora |
| --- | --- | --- |
| `ValeriaArModule.kt` | `getMap("deviceProfile") ?: map` disfrazaba el error de perfil | Entrega el mapa crudo; la proyección se ha eliminado entera |
| `ValeriaArActivity.kt` | El payload de fallo era solo `outcome` | Lleva `reason`, `permanent` y `detail` |
| `ValeriaArActivity.kt` | `pipelineStarted` se ponía antes de existir la tubería | Se pone tras `gl.onResume()`; la rama de reintento vuelve a ser alcanzable |
| `ValeriaArActivity.kt` | `startPipeline` corría sobre una Activity cerrándose | Sale si `isFinishing \|\| isDestroyed` |
| `ArCoreSession.kt` | Toda excepción era `DEVICE_NOT_SUPPORTED` | `UNKNOWN` + `detail` con la clase de la excepción |
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

# Informe Técnico Forense: Diagnóstico de Fallo del Módulo de Realidad Aumentada en Google Pixel 6a

> **Fecha de captura del bugreport:** 2 de septiembre de 2026, 15:39:33 CEST  
> **Dispositivo analizado:** Google Pixel 6a (nombre en clave `bluejay`, compilación `CP2A.260705.006`)  
> **Paquete analizado:** `eu.futureforkids.valeria` (Valeria+)  
> **Fuente empírica:** `~/Downloads/bugreport-bluejay-CP2A/bugreport-bluejay-CP2A.260705.006-2026-09-02-15-39-33.txt` (101 MB)  
> **Estado:** Causa raíz identificada y documentada en la rama `bug-ra`.

---

## 1. Resumen Ejecutivo

El módulo de Realidad Aumentada (bloque 7) experimentó caídas fatales consecutivas en el Google Pixel 6a del piloto al intentar ejecutar la **Prueba de Aptitud del Dispositivo**.

El análisis detallado del volcado de depuración del sistema (*bugreport dumpstate*) reveló que el incidente no se debe a un error de cálculo de MediaPipe ni a un cuelgue del renderizador Filament, sino a una **incompatibilidad de versión en el subsistema ARCore combinada con una propagación insegura de errores en el puente React Native**:

1. **Incompatibilidad de ARCore a nivel de sistema:** El Google Pixel 6a cuenta con la versión de fábrica **ARCore 1.48** (`/product/app/arcore-1.48`), mientras que el módulo nativo de la app fue compilado contra el SDK **ARCore 1.54.0** (`com.google.ar:core:1.54.0`). Al detectar que el APK del sistema es inferior al SDK compilado, ARCore aborta la inicialización de la sesión y redirige a Google Play Store para forzar una actualización del servicio.
2. **Defecto de tipado dinámico en React Native:** Cuando la actividad nativa finaliza de forma segura informando que la plataforma no está soportada (`outcome = "unsupported"`), el componente `ValeriaArLauncherScreen.tsx` recibe el payload como un objeto no nulo y asume incorrectamente que se trata de un `ArDeviceProfile` válido. Al verificar si el nivel de aptitud es `D` (`p.level === 'D'`), evalúa `undefined === 'D'` (falso), lo que promueve la interfaz a la fase `'menu'`. Al renderizar el menú, `arPolicyFor(undefined)` devuelve `undefined`, provocando la lectura de una propiedad inexistente (`policy.exercises`) y haciendo colapsar el proceso React Native por completo.

---

## 2. Evidencia Empírica de los Crashes (Logcat)

En el registro del sistema constan dos cierres forzados por excepción no capturada en el hilo de módulos nativos (`mqt_native_modules`), registrados a las 15:06:36 (PID 8413) y 15:07:11 (PID 9161):

### Crash 1 — PID 8413 (15:06:36.536)
```text
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime: FATAL EXCEPTION: mqt_native_modules
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime: Process: eu.futureforkids.valeria, PID: 8413
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime: com.facebook.react.common.JavascriptException: TypeError: Cannot read property 'exercises' of undefined
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime: 
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime: This error is located at:
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime:     at ValeriaArLauncherScreen (address at index.android.bundle:1:2999094)
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime:     at ValeriaNavigator (<anonymous>)
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime:     at ValeriaMisclickBoundary (address at index.android.bundle:1:2088306)
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime:     at ValeriaApp (address at index.android.bundle:1:927482)
09-02 15:06:36.536 10350  8413  8454 E AndroidRuntime: ValeriaArLauncherScreen@1:3000421
```

### Crash 2 — PID 9161 (15:07:11.446)
```text
09-02 15:07:11.446 10350  9161  9213 E AndroidRuntime: FATAL EXCEPTION: mqt_native_modules
09-02 15:07:11.446 10350  9161  9213 E AndroidRuntime: Process: eu.futureforkids.valeria, PID: 9161
09-02 15:07:11.446 10350  9161  9213 E AndroidRuntime: com.facebook.react.common.JavascriptException: TypeError: Cannot read property 'exercises' of undefined
09-02 15:07:11.446 10350  9161  9213 E AndroidRuntime:     at ValeriaArLauncherScreen (address at index.android.bundle:1:2999094)
```

---

## 3. Cronología Forense de la Ejecución en el Pixel 6a

A través de los eventos del `ActivityManager`, los historiales de rotación de pantalla (`RotationHistory`) y las marcas temporales del sistema, se reconstruye la secuencia exacta de los hechos:

| Marca Temporal | Evento del Sistema | Detalle Técnico |
|---|---|---|
| **15:06:20** | `ACTIVITY_RESUMED` (`ValeriaArActivity`) | Se lanza la actividad nativa a pantalla completa para la Prueba de Aptitud (`MODE_APTITUDE`). Orientación forzada a `SENSOR_LANDSCAPE`. |
| **15:06:21** | `ACTIVITY_RESUMED` (`GrantPermissionsActivity`) | El sistema Android presenta el diálogo modal solicitando el permiso de cámara en tiempo de ejecución. |
| **15:06:22** | `ACTIVITY_RESUMED` (`InstallActivity` de ARCore) | `ArCoreSession.ensureCreated()` consulta `ArCoreApk.getInstance().checkAvailability()`, detectando `SUPPORTED_APK_TOO_OLD` (APK en sistema: v1.48; SDK: v1.54.0). Se invoca `requestInstall(activity, true)`. |
| **15:06:22** | `ACTIVITY_RESUMED` (`com.android.vending`) | La Activity de instalación de ARCore transfiere el control a Google Play Store (`MarketDeepLinkHandlerActivity`) para forzar la actualización de *Google Play Services for AR*. |
| **15:06:23 – 15:06:36** | Salida de Play Store | El usuario regresa a la aplicación sin completar la actualización o cancelando el diálogo de la tienda. |
| **15:06:36** | `ACTIVITY_RESUMED` (`ValeriaArActivity`) | La actividad vuelve a primer plano y reintenta `ensureCreated()`. Al no haberse actualizado el APK y estar `installRequested = true`, `requestInstall(activity, false)` lanza `UnavailableApkTooOldException` (o `UnavailableUserDeclinedInstallationException`). |
| **15:06:36** | `finishWith(outcome = "unsupported")` | `ValeriaArActivity` captura la excepción de forma ordenada, asigna el estado `unavailable = APK_TOO_OLD`, genera el payload `{"outcome":"unsupported"}` y llama a `finish()`. |
| **15:06:36.536** | **CRASH EN JAVASCRIPT** | `ValeriaArModule` resuelve la promesa de `runAptitudeTest` con `{"outcome":"unsupported"}`. React Native procesa la respuesta sin validar la presencia de `level`, asume falsamente que el dispositivo es apto, intenta leer `policy.exercises` y se produce el cierre inesperado de la app. |
| **15:07:08** | Reinicio de la app | El usuario abre la app nuevamente y pulsa "Comenzar" para reintentar la prueba. |
| **15:07:09** | Aborto inmediato | `ValeriaArActivity` comprueba el estado, falla en 1 segundo y devuelve nuevamente `outcome = "unsupported"`. |
| **15:07:11.446** | **SEGUNDO CRASH** | Se repite el colapso en `ValeriaArLauncherScreen` con la misma excepción. |

---

## 4. Análisis Detallado del Código Involucrado

### 4.1 Desalineación de dependencias (`build.gradle` vs Sistema)
En `android-native/valeria-ar/build.gradle` (línea 140):
```groovy
implementation 'com.google.ar:core:1.54.0'
```
En el volcado del Pixel 6a:
```text
Package [com.google.ar.core] (ff0516c):
  codePath=/product/app/arcore-1.48
```
El SDK 1.54.0 requiere una versión de los servicios de AR igual o superior a 1.54. Al haber 1.48 instalada de fábrica en la partición `/product`, ARCore bloquea la creación de la sesión hasta que se actualice desde la tienda.

### 4.2 Desempaquetado ciego en el puente nativo (`ValeriaArModule.kt`)
En `android-native/valeria-ar/src/main/java/eu/futureforkids/valeria/ar/ValeriaArModule.kt` (líneas 100-105):
```kotlin
@ReactMethod
fun runAptitudeTest(promise: Promise) {
    launchActivity(
        ValeriaArActivity.intent(reactContext, ValeriaArActivity.MODE_APTITUDE),
        REQUEST_APTITUDE,
        promise,
    ) { map -> map.getMap("deviceProfile") ?: map }
}
```
Si la actividad finaliza por incompatibilidad, el payload no contiene `deviceProfile`, sino solo `{"outcome":"unsupported"}`. La lambda `map.getMap("deviceProfile") ?: map` devuelve el propio mapa de error, resolviendo la promesa con un objeto que no cumple con el contrato TypeScript de `ArDeviceProfile`.

### 4.3 Falsa asunción de éxito en React Native (`ValeriaArLauncherScreen.tsx`)
En `src/ValeriaArLauncherScreen.tsx` (líneas 105-117):
```typescript
const runAptitude = useCallback(async () => {
  setBusyMsg(t.ar.busyMeasuring);
  setPhase('busy');
  const p = await runAptitudeTest();
  if (!p) {
    setNotice(t.ar.noticeAptitudeFailed);
    setPhase('aptitude');
    return;
  }
  await saveArDeviceProfile(p);
  setProfile(p);
  setPhase(p.level === 'D' ? 'notApt' : 'menu');
}, []);
```
* `p` es `{ outcome: "unsupported" }`, por lo que `!p` es `false`.
* `p.level` es `undefined`.
* `p.level === 'D'` se evalúa como `false`.
* El código asume que, como no es `'D'`, el teléfono es apto y salta directamente a `setPhase('menu')`.

### 4.4 Ausencia de salvaguarda defensiva en la política de nivel (`valeriaArSettings.ts`)
En `src/valeriaArSettings.ts` (línea 158):
```typescript
export const arPolicyFor = (level: 'A' | 'B' | 'C' | 'D'): ArLevelPolicy => AR_LEVEL_POLICY[level];
```
Cuando `level` es `undefined`, `AR_LEVEL_POLICY[undefined]` devuelve `undefined`.
Posteriormente, en el renderizado de `ValeriaArLauncherScreen.tsx` (línea 470):
```typescript
const enabled = policy.exercises.includes(id);
```
Al ser `policy` indefinido, la llamada lanza `TypeError: Cannot read property 'exercises' of undefined`.

---

## 5. Matriz de Causa Raíz

| Nivel | Elemento Afectado | Causa Raíz | Solución Técnica |
|---|---|---|---|
| **Dispositivo / SO** | Google Pixel 6a (`bluejay`) | `com.google.ar.core` desactualizado en el sistema (v1.48 frente a SDK v1.54.0). | Actualizar "Servicios de Google Play para RA" desde Google Play Store o compilar con ARCore 1.48. |
| **Puente Nativo** | `ValeriaArModule.kt` | Resuelve la promesa de la prueba con `{ outcome: "unsupported" }` en vez de resolver a `null` o rechazar. | Rechazar la promesa o devolver `null` si no existe la clave `deviceProfile`. |
| **Controlador UI** | `ValeriaArLauncherScreen.tsx` | Valida veracidad superficial (`if (!p)`) sin verificar la existencia de `p.level`. | Validar explícitamente `if (!p \|\| !('level' in p) \|\| !p.level)`. |
| **Configuración** | `valeriaArSettings.ts` | `arPolicyFor(level)` carece de valor por defecto ante entradas no contempladas. | Fallback defensivo: `AR_LEVEL_POLICY[level] ?? AR_LEVEL_POLICY.D`. |

---

## 6. Plan de Acción y Remediación

1. **Procedimiento inmediato en el dispositivo de pruebas:**
   * Conectar el Google Pixel 6a a internet.
   * Abrir Google Play Store, buscar **"Servicios de Google Play para RA"** (*Google Play Services for AR*) y pulsar en **Actualizar**.
   * Verificar en los ajustes de aplicaciones que la versión instalada sea $\ge 1.54$.

2. **Parches de robustez en el código fuente:**
   * **En `ValeriaArLauncherScreen.tsx`:**
     ```typescript
     const p = await runAptitudeTest();
     if (!p || !('level' in p) || !p.level) {
       setNotice(t.ar.noticeAptitudeFailed);
       setPhase('aptitude');
       return;
     }
     ```
   * **En `valeriaArSettings.ts`:**
     ```typescript
     export const arPolicyFor = (level?: 'A' | 'B' | 'C' | 'D'): ArLevelPolicy =>
       (level && AR_LEVEL_POLICY[level]) ? AR_LEVEL_POLICY[level] : AR_LEVEL_POLICY.D;
     ```
   * **En `ValeriaArModule.kt`:**
     ```kotlin
     @ReactMethod
     fun runAptitudeTest(promise: Promise) {
         launchActivity(
             ValeriaArActivity.intent(reactContext, ValeriaArActivity.MODE_APTITUDE),
             REQUEST_APTITUDE,
             promise,
         ) { map ->
             map.getMap("deviceProfile")
         }
     }
     ```
     *(Si `deviceProfile` no existe en el mapa de resultado, la lambda devuelve `null`, resolviendo limpiamente la promesa a `null` y activando la pantalla de reintento en lugar de provocar un crash).*

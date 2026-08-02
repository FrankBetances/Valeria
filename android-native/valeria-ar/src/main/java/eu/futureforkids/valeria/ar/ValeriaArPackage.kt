package eu.futureforkids.valeria.ar

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * Valeria+ · Registro del módulo de Realidad Aumentada en React Native.
 *
 * Lo añade `plugins/withValeriaAR.js` a `MainApplication.kt` durante el
 * prebuild. Si el paquete no está registrado, `NativeModules.ValeriaAr` es
 * `undefined`, `isArAvailable()` devuelve false y la tarjeta del hub no se
 * renderiza: exactamente el mismo camino que en Expo Go o en iOS. La ausencia
 * del módulo no rompe nada en ningún punto.
 */
class ValeriaArPackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf(ValeriaArModule(reactContext))

    // No hay vistas nativas expuestas a JS: la escena vive entera dentro de la
    // Activity. Ese aislamiento es lo que mantiene el bucle de 30 fps sin
    // cruzar el puente.
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}

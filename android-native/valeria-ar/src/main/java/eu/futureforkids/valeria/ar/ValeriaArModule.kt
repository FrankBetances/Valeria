package eu.futureforkids.valeria.ar

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.content.Context
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import eu.futureforkids.valeria.ar.signal.Calibration
import org.json.JSONArray
import org.json.JSONObject

/**
 * Valeria+ · Puente React Native del bloque de Realidad Aumentada.
 *
 * Arquitectura antigua a propósito: `newArchEnabled` sigue en `false` en toda la
 * app. Migrar los seis bloques en producción a la Nueva Arquitectura no puede
 * ser el peaje de un módulo nuevo; se abordará cuando toque el SDK 55, como
 * decisión propia. **Radio de explosión cero** es un requisito, no una
 * preferencia.
 *
 * El puente tiene tres llamadas de trabajo y una sonda. Nada por frame: el bucle
 * de 30 fps —leer landmarks, normalizar, evaluar histéresis, mover un nodo 3D—
 * vive entero en Kotlin, en el mismo proceso y el mismo hilo de render. Cruzar
 * el puente 30 veces por segundo para volver a cruzarlo sería la arquitectura
 * equivocada aunque llegara a funcionar.
 */
class ValeriaArModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ValeriaAr"

    private var pending: Promise? = null
    private var pendingRequest = 0
    /** Proyección a aplicar al resultado antes de resolver (p. ej. desenvolver el perfil). */
    private var pendingTransform: ((WritableMap) -> Any?)? = null

    private val activityListener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode != pendingRequest) return
            val promise = pending ?: return
            val transform = pendingTransform
            pending = null
            pendingTransform = null

            val raw = data?.getStringExtra(ValeriaArActivity.EXTRA_RESULT)
            if (resultCode != Activity.RESULT_OK || raw == null) {
                // Cerrar la pantalla no es un error: es un niño que se cansó.
                promise.resolve(Arguments.createMap().apply { putString("outcome", "aborted") })
                return
            }
            val map = try { JSONObject(raw).toWritableMap() } catch (e: Throwable) { Arguments.createMap() }
            promise.resolve(if (transform != null) transform(map) else map)
        }
    }

    init { reactContext.addActivityEventListener(activityListener) }

    /**
     * Sonda de disponibilidad. Comprueba lo que puede fallar de verdad —cámara
     * frontal presente y modelo de señal empaquetado—, no la plataforma: el día
     * que exista el host de iOS, esta misma sonda lo acepta.
     *
     * Síncrona por diseño: la pantalla de selección la consulta al montar y no
     * puede permitirse dibujar la tarjeta y quitarla un frame después.
     */
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun isSupported(): Boolean = hasFrontCamera() && hasSignalModel()

    private fun hasFrontCamera(): Boolean = try {
        val pm = reactContext.packageManager
        val manager = reactContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
        pm.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY) &&
            manager.cameraIdList.any { id ->
                manager.getCameraCharacteristics(id)
                    .get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_FRONT
            }
    } catch (e: Throwable) {
        false
    }

    private fun hasSignalModel(): Boolean = try {
        reactContext.assets.open("face_landmarker.task").use { true }
    } catch (e: Throwable) {
        false
    }

    @ReactMethod
    fun runAptitudeTest(promise: Promise) {
        launchActivity(
            ValeriaArActivity.intent(reactContext, ValeriaArActivity.MODE_APTITUDE),
            REQUEST_APTITUDE,
            promise,
        ) { map -> map.getMap("deviceProfile") ?: map }
    }

    @ReactMethod
    fun launch(config: ReadableMap, promise: Promise) {
        val json = try {
            config.toJsonObject()
        } catch (e: Throwable) {
            promise.reject("E_AR_CONFIG", "Configuración de ejercicio inválida", e); return
        }
        val intent = ValeriaArActivity.intent(reactContext, ValeriaArActivity.MODE_EXERCISE)
            .putExtra(ValeriaArActivity.EXTRA_CONFIG, json.toString())
            .putExtra(ValeriaArActivity.EXTRA_PATIENT_KEY, json.optString("patientKey", "anon"))
        launchActivity(intent, REQUEST_EXERCISE, promise)
    }

    /**
     * Pantalla de señales en vivo (Fase 2). Herramienta de la logopeda: no
     * registra nada, no produce ensayos y no toca la telemetría. Sirve para
     * colocar el teléfono con criterio y para entender qué mide cada ejercicio.
     */
    @ReactMethod
    fun openDiagnostics(promise: Promise) {
        launchActivity(
            ValeriaArActivity.intent(reactContext, ValeriaArActivity.MODE_DIAGNOSTICS),
            REQUEST_DIAGNOSTICS,
            promise,
        )
    }

    @ReactMethod
    fun calibrate(patientKey: String, pointerSource: String, promise: Promise) {
        val intent = ValeriaArActivity.intent(reactContext, ValeriaArActivity.MODE_CALIBRATION)
            .putExtra(ValeriaArActivity.EXTRA_PATIENT_KEY, patientKey)
            .putExtra(ValeriaArActivity.EXTRA_POINTER, pointerSource)
        launchActivity(intent, REQUEST_CALIBRATION, promise)
    }

    @ReactMethod
    fun hasCalibration(patientKey: String, promise: Promise) {
        promise.resolve(Calibration.load(reactContext, patientKey) != null)
    }

    private fun launchActivity(
        intent: Intent,
        requestCode: Int,
        promise: Promise,
        transform: ((WritableMap) -> Any?)? = null,
    ) {
        // reactApplicationContext.currentActivity y no el heredado del módulo:
        // en RN 0.81 ese quedó deprecado y, al ser una función Kotlin, ni
        // siquiera expone la propiedad sintética.
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("E_AR_NO_ACTIVITY", "No hay actividad en primer plano")
            return
        }
        if (pending != null) {
            promise.reject("E_AR_BUSY", "Ya hay una sesión de RA abierta")
            return
        }
        pending = promise
        pendingTransform = transform
        pendingRequest = requestCode
        try {
            activity.startActivityForResult(intent, requestCode)
        } catch (e: Throwable) {
            pending = null
            pendingTransform = null
            promise.reject("E_AR_LAUNCH", "No se pudo abrir el host de realidad aumentada", e)
        }
    }

    companion object {
        private const val REQUEST_EXERCISE = 8801
        private const val REQUEST_APTITUDE = 8802
        private const val REQUEST_CALIBRATION = 8803
        private const val REQUEST_DIAGNOSTICS = 8804
    }
}

// ---------------------------------------------------------------------------
// Conversión JSON ↔ puente. El contrato viaja como JSON porque es la única
// representación que ambos lados leen igual; estas funciones son el peaje.
// ---------------------------------------------------------------------------

internal fun JSONObject.toWritableMap(): WritableMap {
    val map = Arguments.createMap()
    keys().forEach { key ->
        when (val value = get(key)) {
            JSONObject.NULL -> map.putNull(key)
            is JSONObject -> map.putMap(key, value.toWritableMap())
            is JSONArray -> map.putArray(key, value.toWritableArray())
            is Boolean -> map.putBoolean(key, value)
            is Int -> map.putInt(key, value)
            is Long -> map.putDouble(key, value.toDouble())
            is Double -> map.putDouble(key, value)
            is Float -> map.putDouble(key, value.toDouble())
            else -> map.putString(key, value.toString())
        }
    }
    return map
}

internal fun JSONArray.toWritableArray(): WritableArray {
    val array = Arguments.createArray()
    for (i in 0 until length()) {
        when (val value = get(i)) {
            JSONObject.NULL -> array.pushNull()
            is JSONObject -> array.pushMap(value.toWritableMap())
            is JSONArray -> array.pushArray(value.toWritableArray())
            is Boolean -> array.pushBoolean(value)
            is Int -> array.pushInt(value)
            is Long -> array.pushDouble(value.toDouble())
            is Double -> array.pushDouble(value)
            is Float -> array.pushDouble(value.toDouble())
            else -> array.pushString(value.toString())
        }
    }
    return array
}

internal fun ReadableMap.toJsonObject(): JSONObject {
    val json = JSONObject()
    val iterator = keySetIterator()
    while (iterator.hasNextKey()) {
        val key = iterator.nextKey()
        when (getType(key)) {
            com.facebook.react.bridge.ReadableType.Null -> json.put(key, JSONObject.NULL)
            com.facebook.react.bridge.ReadableType.Boolean -> json.put(key, getBoolean(key))
            com.facebook.react.bridge.ReadableType.Number -> json.put(key, getDouble(key))
            com.facebook.react.bridge.ReadableType.String -> json.put(key, getString(key))
            com.facebook.react.bridge.ReadableType.Map -> json.put(key, getMap(key)?.toJsonObject())
            com.facebook.react.bridge.ReadableType.Array -> {
                val arr = JSONArray()
                getArray(key)?.let { readable ->
                    for (i in 0 until readable.size()) arr.put(readable.getDynamic(i).asString())
                }
                json.put(key, arr)
            }
        }
    }
    return json
}

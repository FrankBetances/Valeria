package eu.futureforkids.valeria.ar.signal

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.util.DisplayMetrics
import kotlin.math.abs
import kotlin.math.atan
import kotlin.math.sqrt

/**
 * Valeria+ · La geometría del ejercicio se DERIVA del teléfono real.
 *
 * En un despliegue BYOD no se puede precalcular nada: las pantallas del parque
 * van de 6,1″ a 6,8″ y la distancia de trabajo la elige la familia. Por eso las
 * dianas de AR-3 se colocan **en grados** y la conversión a píxeles se resuelve
 * en caliente, con estas dos clases como fuente.
 */

/**
 * La cara del niño es el telémetro: la distancia interocular en píxeles, con la
 * focal de la cámara, da la distancia de trabajo.
 *
 * Es aproximada —la interocular infantil va de ~48 a ~58 mm, así que el error
 * ronda el ±15 %— y por eso NO se usa para medir. Se usa para dos cosas
 * honestas: avisar al adulto («acerca un poco el teléfono») y registrar la
 * separación angular realmente conseguida en cada ensayo, que pasa a ser una
 * covariable del análisis en vez de un supuesto.
 */
class DistanceEstimator(
    /** Focal equivalente en píxeles del frame de análisis. La aporta CameraX. */
    private var focalPx: Float = DEFAULT_FOCAL_PX,
    private val frameWidthPx: Int = 640,
) {
    private var smoothedMm = 0f

    fun setFocalPx(value: Float) { if (value > 0f) focalPx = value }

    /** Distancia estimada cara→cámara en mm, o null si el frame no sirve. */
    fun update(signals: FaceSignals): Float? {
        val lm = signals.landmarks
        if (lm.size <= FaceIdx.EYE_OUTER_RIGHT) return null
        val l = lm[FaceIdx.EYE_OUTER_LEFT]
        val r = lm[FaceIdx.EYE_OUTER_RIGHT]
        val dxPx = (r.x - l.x) * frameWidthPx
        val dyPx = (r.y - l.y) * frameWidthPx
        val interocularPx = sqrt(dxPx * dxPx + dyPx * dyPx)
        if (interocularPx < 1f) return null

        val mm = ASSUMED_INTEROCULAR_MM * focalPx / interocularPx
        // Suavizado exponencial: la distancia real no salta 8 cm entre frames,
        // así que un salto es ruido de landmark y no un niño moviéndose.
        smoothedMm = if (smoothedMm == 0f) mm else smoothedMm * 0.85f + mm * 0.15f
        return smoothedMm
    }

    val currentMm: Float get() = if (smoothedMm > 0f) smoothedMm else NOMINAL_WORKING_MM

    companion object {
        const val ASSUMED_INTEROCULAR_MM = 53f   // media infantil 3-6 años
        const val NOMINAL_WORKING_MM = 350f      // distancia de protocolo: 30-35 cm
        private const val DEFAULT_FOCAL_PX = 520f
    }
}

/** Milímetros reales de pantalla y grados por píxel a la distancia de trabajo. */
class ScreenGeometry(context: Context) {
    private val metrics: DisplayMetrics = context.resources.displayMetrics

    val widthMm: Float = metrics.widthPixels / metrics.xdpi * 25.4f
    val heightMm: Float = metrics.heightPixels / metrics.ydpi * 25.4f
    val widthPx: Int = metrics.widthPixels
    val heightPx: Int = metrics.heightPixels

    /**
     * Separación angular entre centros de diana con `targets` dianas repartidas
     * a lo ancho. Con 3 dianas en un móvil de 6,1″ a 35 cm salen ~7,6°: la cifra
     * de trabajo real, no los 20° que pide la literatura de *eye tracking* con
     * monitores de escritorio (que no traslada a un teléfono, ni a una tablet).
     */
    fun separationDeg(distanceMm: Float, targets: Int): Float {
        if (distanceMm <= 0f || targets < 2) return 0f
        val stepMm = widthMm / targets
        return Math.toDegrees(atan((stepMm / distanceMm).toDouble())).toFloat()
    }

    /** Píxeles por grado a lo ancho, a la distancia dada. */
    fun pxPerDeg(distanceMm: Float): Float {
        if (distanceMm <= 0f) return 0f
        val halfDeg = Math.toDegrees(atan((widthMm / 2f / distanceMm).toDouble())).toFloat()
        return if (halfDeg <= 0f) 0f else (widthPx / 2f) / halfDeg
    }
}

/**
 * Compensación por IMU: la pose de MediaPipe es de la cabeza RESPECTO A LA
 * CÁMARA. Si el adulto sostiene el teléfono, un giro de su muñeca se lee como
 * giro de la cabeza del niño. En una tablet apoyada eso se puede ignorar; en un
 * móvil, no.
 *
 * Hace dos trabajos:
 *   · resta la actitud del dispositivo, para que el yaw registrado sea cabeza
 *     respecto al MUNDO;
 *   · vigila si el teléfono está quieto, que es lo que convierte «apoyarlo en un
 *     libro» en un requisito armado y no en una recomendación. Un ensayo perdido
 *     es barato; un ensayo contaminado envenena el dataset.
 */
class DeviceAttitudeCompensator(context: Context) : SensorEventListener {

    private val manager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private val sensor = manager?.getDefaultSensor(Sensor.TYPE_GAME_ROTATION_VECTOR)

    val available: Boolean get() = sensor != null

    private val rotation = FloatArray(9)
    private val orientation = FloatArray(3)

    @Volatile private var yawDeg = 0f
    @Volatile private var lastYawDeg = 0f
    @Volatile private var lastEventNs = 0L
    @Volatile private var angularSpeedDps = 0f
    @Volatile private var steadySinceMs = 0L

    fun start() { sensor?.let { manager?.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME) } }
    fun stop() { manager?.unregisterListener(this) }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type != Sensor.TYPE_GAME_ROTATION_VECTOR) return
        SensorManager.getRotationMatrixFromVector(rotation, event.values)
        SensorManager.getOrientation(rotation, orientation)
        val yaw = Math.toDegrees(orientation[0].toDouble()).toFloat()

        val now = event.timestamp
        if (lastEventNs != 0L) {
            val dt = (now - lastEventNs) / 1e9f
            if (dt > 0f) angularSpeedDps = abs(yaw - lastYawDeg) / dt
        }
        lastEventNs = now
        lastYawDeg = yaw
        yawDeg = yaw

        val nowMs = System.currentTimeMillis()
        if (angularSpeedDps > STEADY_DPS) steadySinceMs = nowMs
        else if (steadySinceMs == 0L) steadySinceMs = nowMs
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) { /* no aporta nada aquí */ }

    /** Yaw de la cabeza respecto al mundo, no respecto a una cámara que se mueve. */
    fun compensatedYaw(headYawDeg: Float): Float =
        if (available) headYawDeg - (yawDeg - referenceYawDeg) else headYawDeg

    private var referenceYawDeg = 0f

    /** Fija el cero del dispositivo al armar el ensayo. */
    fun anchor() { referenceYawDeg = yawDeg }

    /** ¿Lleva el teléfono quieto el tiempo suficiente para armar un ensayo? */
    fun isSteady(minMs: Long = STEADY_ARM_MS): Boolean {
        if (!available) return true   // sin IMU no se puede exigir lo que no se mide
        val since = steadySinceMs
        return since != 0L && System.currentTimeMillis() - since >= minMs
    }

    /** ¿Se ha movido durante la ventana de respuesta? Entonces el ensayo se anula. */
    fun movedTooMuch(): Boolean = available && angularSpeedDps > VOID_DPS

    companion object {
        const val STEADY_DPS = 3f      // por debajo de esto, el móvil está apoyado
        const val VOID_DPS = 12f       // por encima, el ensayo no es interpretable
        const val STEADY_ARM_MS = 800L // el software impone lo que el soporte habría dado
    }
}

package eu.futureforkids.valeria.ar.aptitude

import android.content.Context
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.os.Build
import android.os.PowerManager
import android.os.SystemClock
import eu.futureforkids.valeria.ar.AptitudeLevel
import eu.futureforkids.valeria.ar.DeviceProbes
import eu.futureforkids.valeria.ar.DeviceProfile
import eu.futureforkids.valeria.ar.TimestampSource
import kotlin.math.abs

/**
 * Valeria+ · Prueba de Aptitud del Dispositivo.
 *
 * El modelo de teléfono es **desconocido por diseño**: en un despliegue BYOD en
 * LATAM depende de qué tenga cada familia. Eso no es un dato que falte, es una
 * propiedad del despliegue, y obliga a un cambio de enfoque en vez de a esperar:
 * si el hardware es desconocido y heterogéneo, la app no puede asumir
 * capacidades, **tiene que medirlas en cada teléfono y adaptarse o negarse**.
 *
 * Al niño se le presenta como un juego de calentamiento —mirar a la osita,
 * seguirla a las esquinas, escuchar dos sonidos—, nunca como un diagnóstico
 * técnico.
 *
 * Tres propiedades hacen que valga la pena:
 *   1. Nunca hay una experiencia rota: un teléfono flojo no da un ejercicio a
 *      tirones, da un ejercicio distinto o ninguno.
 *   2. El perfil viaja sellado en cada sesión, así que el hardware pasa de ruido
 *      a covariable y se puede modelar o estratificar.
 *   3. El nivel A define qué sesiones entran en el dataset publicable, con un
 *      criterio explícito y auditable en vez de «se usaron teléfonos diversos».
 */
object AptitudeTest {

    /**
     * La tabla de niveles del plan, escrita como código para que sea auditable
     * y para que un cambio de criterio deje rastro en el historial de git.
     */
    fun classify(p: DeviceProbes): AptitudeLevel {
        val timestampsOk = p.timestampSource == TimestampSource.REALTIME && p.clockOffsetUs != null
        val audioOk = (p.audioJitterMs ?: Float.MAX_VALUE) < 20f
        val pointerOk = p.pointerRmsDeg < 2.5f

        return when {
            p.fpsP5 < 15f -> AptitudeLevel.D
            p.fpsP5 >= 20f && p.thermalSlope >= 0.7f && timestampsOk && audioOk && pointerOk ->
                AptitudeLevel.A
            p.fpsP5 >= 20f && pointerOk -> AptitudeLevel.B
            else -> AptitudeLevel.C
        }
    }

    fun profile(context: Context, probes: DeviceProbes): DeviceProfile = DeviceProfile(
        level = classify(probes),
        probes = probes,
        manufacturer = Build.MANUFACTURER ?: "?",
        model = Build.MODEL ?: "?",
        osVersion = "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})",
        measuredAt = System.currentTimeMillis(),
    )

    /**
     * De todos los caprichos del parque Android barato, este es el que invalida
     * directamente el dato de AR-2, y conviene conocerlo antes de escribir una
     * línea de ejercicio.
     *
     * Si `SENSOR_INFO_TIMESTAMP_SOURCE` vale `REALTIME`, las marcas de los
     * frames comparten base de reloj con el resto del sistema y se pueden
     * alinear con el audio. Si vale `UNKNOWN` —frecuente en cámaras `LEGACY` de
     * gama baja— **no existe conversión fiable** y la latencia estímulo→giro
     * deja de ser medible en ese teléfono. Sigue siendo un juego perfectamente
     * válido; deja de ser un instrumento.
     */
    fun cameraTimestampSource(context: Context): TimestampSource {
        return try {
            val manager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val frontId = manager.cameraIdList.firstOrNull { id ->
                manager.getCameraCharacteristics(id)
                    .get(CameraCharacteristics.LENS_FACING) == CameraCharacteristics.LENS_FACING_FRONT
            } ?: return TimestampSource.UNKNOWN

            val source = manager.getCameraCharacteristics(frontId)
                .get(CameraCharacteristics.SENSOR_INFO_TIMESTAMP_SOURCE)

            if (source == CameraCharacteristics.SENSOR_INFO_TIMESTAMP_SOURCE_REALTIME) {
                TimestampSource.REALTIME
            } else {
                TimestampSource.UNKNOWN
            }
        } catch (e: Throwable) {
            TimestampSource.UNKNOWN
        }
    }

    /**
     * Aun con `REALTIME` queda un paso obligatorio: las marcas de cámara van en
     * base *boottime* (`elapsedRealtimeNanos`, que incluye la suspensión) y las
     * de `AudioTrack` suelen ir en *monotonic* (`uptimeNanos`, que la excluye).
     * Hay que medir el desfase al inicio de cada sesión y aplicarlo; darlo por
     * cero es introducir un sesgo del tamaño del tiempo que el teléfono lleve
     * suspendido desde el último arranque, que puede ser de horas.
     */
    fun clockOffsetUs(): Long {
        val boot = SystemClock.elapsedRealtimeNanos()
        val mono = System.nanoTime()
        return (boot - mono) / 1_000L
    }

    fun thermalStatus(context: Context): Int = try {
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        pm.currentThermalStatus
    } catch (e: Throwable) {
        PowerManager.THERMAL_STATUS_NONE
    }
}

/**
 * Medidor de fps con percentil 5. El p5 y no la media, a propósito: un pico de
 * 30 fps que cae a 12 al cuarto minuto es un fracaso disfrazado, y la media lo
 * esconde. La gama media entra en *throttling* térmico en minutos —cámara a
 * 30 fps + inferencia + Filament en un chasis pequeño y sin disipación—, así
 * que el riesgo no es la potencia bruta: es la sostenida.
 */
class FpsMeter {
    private val frameIntervalsMs = ArrayList<Long>(2048)
    private var lastFrameMs = 0L
    private var firstHalfSum = 0.0
    private var firstHalfN = 0
    private var secondHalfSum = 0.0
    private var secondHalfN = 0
    private var startedMs = 0L
    private var windowMs = 0L

    fun start(expectedDurationMs: Long) {
        frameIntervalsMs.clear()
        lastFrameMs = 0L
        firstHalfSum = 0.0; firstHalfN = 0
        secondHalfSum = 0.0; secondHalfN = 0
        startedMs = SystemClock.elapsedRealtime()
        windowMs = expectedDurationMs
    }

    fun onFrame() {
        val now = SystemClock.elapsedRealtime()
        if (lastFrameMs != 0L) {
            val dt = now - lastFrameMs
            if (dt in 1..2000) {
                frameIntervalsMs.add(dt)
                val fps = 1000.0 / dt
                if (now - startedMs < windowMs / 2) { firstHalfSum += fps; firstHalfN++ }
                else { secondHalfSum += fps; secondHalfN++ }
            }
        }
        lastFrameMs = now
    }

    /** Percentil 5 de fps = percentil 95 de intervalo entre frames. */
    fun fpsP5(): Float {
        if (frameIntervalsMs.isEmpty()) return 0f
        val sorted = frameIntervalsMs.sorted()
        val idx = ((sorted.size - 1) * 0.95).toInt()
        val worstIntervalMs = sorted[idx]
        return if (worstIntervalMs <= 0) 0f else (1000f / worstIntervalMs)
    }

    /**
     * Caída térmica: fps de la segunda mitad / fps de la primera. Por debajo de
     * 0,7 el teléfono no sostiene la sesión, aunque arranque bien.
     */
    fun thermalSlope(): Float {
        if (firstHalfN == 0 || secondHalfN == 0) return 1f
        val first = firstHalfSum / firstHalfN
        val second = secondHalfSum / secondHalfN
        return if (first <= 0.0) 1f else (second / first).toFloat()
    }
}

/**
 * Dispersión de `AudioTrack.getTimestamp()` sobre varios disparos. Es la sonda
 * que decide si la latencia de AR-2 se puede publicar con barras de error
 * honestas o no se puede publicar en absoluto.
 */
class AudioJitterMeter {
    private val offsets = ArrayList<Long>(32)

    fun addSample(requestedUs: Long, presentedUs: Long) {
        offsets.add(presentedUs - requestedUs)
    }

    /** Desviación típica en ms. null si no hay muestras suficientes. */
    fun jitterMs(): Float? {
        if (offsets.size < 5) return null
        val mean = offsets.average()
        val variance = offsets.sumOf { val d = it - mean; d * d } / offsets.size
        return (kotlin.math.sqrt(variance) / 1000.0).toFloat()
    }

    /** Incertidumbre residual que se sella con cada ensayo del dataset. */
    fun uncertaintyMs(): Float? = jitterMs()?.let { abs(it) }

    fun clear() = offsets.clear()
}

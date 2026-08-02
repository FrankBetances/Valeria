package eu.futureforkids.valeria.ar

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import eu.futureforkids.valeria.ar.signal.Blend
import eu.futureforkids.valeria.ar.signal.FaceSignals

/**
 * Valeria+ · Señales en vivo con sus valores numéricos.
 *
 * Es la salida de la Fase 2 y es **una herramienta de la logopeda, no del
 * niño**: aquí no hay coche, ni perro, ni refuerzo. Sirve para dos cosas
 * concretas que en un despliegue BYOD no son un lujo:
 *
 *  1. **Colocar el teléfono con criterio.** Enseña la distancia estimada, la
 *     separación angular alcanzable y si la cara está dentro del cono de pose.
 *     Sin esto, «acércalo un poco» es una intuición; con esto es una cifra.
 *  2. **Entender qué mide cada ejercicio.** Ver `mouthPucker` subir mientras el
 *     niño redondea los labios, o el yaw cruzar los 15°, convierte el módulo de
 *     caja negra en instrumento. Una logopeda que no puede ver la señal no
 *     puede defender el dato que sale de ella.
 *
 * Muro MDR: se muestran magnitudes crudas y el cono de validez. Ni una
 * valoración, ni un percentil, ni un semáforo de «bien/mal».
 */
class DiagnosticsState {
    var pucker by mutableStateOf(0f); private set
    var funnel by mutableStateOf(0f); private set
    var jawOpen by mutableStateOf(0f); private set
    var yaw by mutableStateOf(0f); private set
    var pitch by mutableStateOf(0f); private set
    var roll by mutableStateOf(0f); private set
    var yawWorld by mutableStateOf(0f); private set
    var distanceMm by mutableStateOf(0f); private set
    var separation3 by mutableStateOf(0f); private set
    var landmarks by mutableStateOf(0); private set
    var withinCone by mutableStateOf(false); private set
    var steady by mutableStateOf(false); private set
    var fps by mutableStateOf(0f); private set
    var framesValid by mutableStateOf(0); private set
    var framesTotal by mutableStateOf(0); private set

    private var lastFrameUs = 0L

    fun update(
        signals: FaceSignals,
        yawCompensated: Float,
        distanceMm: Float,
        separationDeg: Float,
        steady: Boolean,
    ) {
        val pose = signals.headPose
        pucker = signals.blendshape(Blend.MOUTH_PUCKER)
        funnel = signals.blendshape(Blend.MOUTH_FUNNEL)
        jawOpen = signals.blendshape(Blend.JAW_OPEN)
        yaw = pose.yawDeg
        pitch = pose.pitchDeg
        roll = pose.rollDeg
        yawWorld = yawCompensated
        this.distanceMm = distanceMm
        this.separation3 = separationDeg
        this.landmarks = signals.landmarks.size
        this.withinCone = pose.withinCone()
        this.steady = steady

        framesTotal += 1
        if (this.withinCone) framesValid += 1

        // fps medidos sobre la marca de CAPTURA del sensor, no sobre el reloj
        // de pared: es el mismo número que decide el nivel de aptitud, y verlo
        // aquí en vivo es lo que permite reproducir un veredicto de la prueba.
        if (lastFrameUs != 0L) {
            val dtUs = signals.tCaptureUs - lastFrameUs
            if (dtUs in 1_000..2_000_000) {
                val instant = 1_000_000f / dtUs
                fps = if (fps == 0f) instant else fps * 0.9f + instant * 0.1f
            }
        }
        lastFrameUs = signals.tCaptureUs
    }

    /** Texto compartible: la ficha del teléfono para el censo de la Fase 0. */
    fun asReport(profile: DeviceProfile?): String = buildString {
        appendLine("VALERIA+ · Señales de realidad aumentada")
        if (profile != null) {
            appendLine("Dispositivo: ${profile.manufacturer} ${profile.model} · ${profile.osVersion}")
            appendLine("Nivel de aptitud: ${profile.level}")
        }
        appendLine("fps en vivo: ${"%.1f".format(fps)}")
        appendLine("Frames dentro del cono de pose: $framesValid / $framesTotal")
        appendLine("Distancia estimada: ${distanceMm.toInt()} mm")
        appendLine("Separación con 3 dianas: ${"%.1f".format(separation3)}°")
        appendLine("Cabeza — yaw ${"%.1f".format(yaw)}° · pitch ${"%.1f".format(pitch)}° · roll ${"%.1f".format(roll)}°")
        appendLine("Yaw compensado por IMU: ${"%.1f".format(yawWorld)}°")
        appendLine("Labios — pucker ${"%.2f".format(pucker)} · funnel ${"%.2f".format(funnel)} · jawOpen ${"%.2f".format(jawOpen)}")
        appendLine("Landmarks detectados: $landmarks")
    }
}

package eu.futureforkids.valeria.ar.exercises

import eu.futureforkids.valeria.ar.ArThresholds
import eu.futureforkids.valeria.ar.DeviceProfile
import eu.futureforkids.valeria.ar.TrialMode
import eu.futureforkids.valeria.ar.TrialRecord
import eu.futureforkids.valeria.ar.aptitude.AptitudeTest
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.scene.SceneState
import eu.futureforkids.valeria.ar.signal.DeviceAttitudeCompensator
import eu.futureforkids.valeria.ar.signal.DistanceEstimator
import eu.futureforkids.valeria.ar.signal.FaceSignals
import eu.futureforkids.valeria.ar.signal.ScreenGeometry
import android.content.Context

/**
 * Valeria+ · Contrato común de los ejercicios de RA.
 *
 * Con el `RewardChannel` ya formalizado, un ejercicio nuevo del bloque es
 * **datos + una función de señal**, no código nuevo de refuerzo. Esta interfaz
 * es lo poco que hace falta además: consumir frames, saber cuándo ha terminado
 * y dejar un registro por ensayo.
 */
interface ArExercise {
    val model: ArModel
    /** Instrucción hablada/escrita para el adulto antes de empezar. */
    val setupHint: String
    /** Un frame de señal facial. Se llama en el hilo del listener, no en el de UI. */
    fun onSignals(signals: FaceSignals)
    /** Pulso de reloj para lo que no depende de la cara (ventanas, esperas). */
    fun onTick(nowMs: Long)
    val trials: List<TrialRecord>
    val finished: Boolean
    fun close() {}
}

/**
 * Todo lo que un ejercicio necesita del entorno, en un solo objeto. Existe para
 * que los ejercicios no vayan a buscar servicios por su cuenta: así son
 * testables sin cámara y, cuando llegue iOS, lo que se sustituye es este
 * contexto y no la lógica de tarea.
 */
class ExerciseContext(
    val context: Context,
    val thresholds: ArThresholds,
    val scene: SceneState,
    val geometry: ScreenGeometry,
    val distance: DistanceEstimator,
    val imu: DeviceAttitudeCompensator,
    val profile: DeviceProfile,
    val trialsPlanned: Int,
) {
    /** Estado térmico ahora mismo: se sella en cada ensayo para poder descartar los degradados. */
    fun thermal(): Int = AptitudeTest.thermalStatus(context)

    /** Separación angular REALMENTE conseguida, no la nominal del protocolo. */
    fun separationDeg(targets: Int): Float = geometry.separationDeg(distance.currentMm, targets)

    /**
     * Modo del ensayo. Solo el nivel A produce dato publicable; en todo lo demás
     * el ejercicio se juega igual y el registro lo dice.
     */
    fun modeFor(instrumentPossible: Boolean): TrialMode =
        if (instrumentPossible && profile.level == eu.futureforkids.valeria.ar.AptitudeLevel.A) {
            TrialMode.INSTRUMENT
        } else {
            TrialMode.GAME
        }
}

/**
 * Guardia de validez compartida por los tres ejercicios.
 *
 * Un frame solo cuenta si la cara está dentro del cono de pose (±12°) y si el
 * teléfono no se está moviendo. Fuera de ahí el frame se DESCARTA, no se
 * corrige: corregir una medida que no se puede medir es fabricar un dato.
 */
class FrameGate(private val imu: DeviceAttitudeCompensator) {
    var framesTotal = 0
        private set
    var framesValid = 0
        private set

    fun accept(signals: FaceSignals, coneDeg: Float = 12f): Boolean {
        framesTotal += 1
        if (signals.trackingQuality < 0.5f) return false
        if (!signals.headPose.withinCone(coneDeg)) return false
        if (imu.movedTooMuch()) return false
        framesValid += 1
        return true
    }

    fun reset() { framesTotal = 0; framesValid = 0 }
}

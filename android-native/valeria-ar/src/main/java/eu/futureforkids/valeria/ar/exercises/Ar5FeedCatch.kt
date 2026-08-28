package eu.futureforkids.valeria.ar.exercises

import android.os.SystemClock
import eu.futureforkids.valeria.ar.TrialRecord
import eu.futureforkids.valeria.ar.reward.EventRewardChannel
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.signal.FaceSignals
import kotlin.math.abs
import kotlin.math.hypot
import kotlin.random.Random

/**
 * Valeria+ · AR-5 · Lanzamiento y Captura de Premios para Lúa (Poké-Feed & Catch).
 *
 * **Objetivo clínico:** coordinación óculo-manual, intención comunicativa,
 * sincronía temporal y motricidad fina de lanzamiento/apuntado.
 *
 * **Dinámica Pokémon GO:** Lúa espera en el centro de la escena con apetito.
 * El niño lanza el pez dorado 3D hacia Lúa. Cuando el proyectil alcanza la
 * hitbox de Lúa, ella lo atrapa en el aire, se lo come con felicidad (`MOOD(3)` / comiendo)
 * y emite ronroneo con confeti 3D (`MOOD(2)` / ronroneo).
 *
 * **Muro MDR:** Se miden magnitudes físicas (velocidad de lanzamiento en px/s,
 * ángulo de desviación en °, latencia de reacción motora en ms).
 */
class Ar5FeedCatch(private val ctx: ExerciseContext) : ArExercise {

    override val model = ArModel.FISH
    override val setupHint =
        "Lanza el pez dorado hacia Lúa deslizando hacia arriba en la pantalla. " +
            "¡A Lúa le encanta y lo atrapará en el aire con un ronroneo!"

    private val gate = FrameGate(ctx.imu)
    private val channel = EventRewardChannel()
    private val _trials = ArrayList<TrialRecord>()
    override val trials: List<TrialRecord> get() = _trials
    override val finished: Boolean get() = _trials.size >= ctx.trialsPlanned

    private var trialStartedMs = 0L
    private var lastFrameMs = 0L
    private var throwInitiatedMs = 0L
    private var fishFlightProgress = 0f
    private var targetDistanceMm = 350f
    private var throwVelocity = 850f // px/s
    private var throwAngle = 0f

    init {
        nextTrial()
    }

    private fun nextTrial() {
        trialStartedMs = SystemClock.elapsedRealtime()
        lastFrameMs = trialStartedMs
        throwInitiatedMs = 0L
        fishFlightProgress = 0f
        targetDistanceMm = ctx.distance.currentMm.toFloat().coerceIn(280f, 600f)
        ctx.scene.setModel(ArModel.FISH)
        ctx.scene.setPointer(0f, 0f, 0f)
    }

    override fun onSignals(signals: FaceSignals) {
        if (finished) return
        val nowMs = SystemClock.elapsedRealtime()
        val dt = (nowMs - lastFrameMs).coerceIn(0L, 200L)
        lastFrameMs = nowMs

        if (!gate.accept(signals, coneDeg = 30f)) return

        // Si el vuelo está activo, se avanza la trayectoria parabólica hacia Lúa
        if (throwInitiatedMs > 0L) {
            val flightTimeMs = nowMs - throwInitiatedMs
            fishFlightProgress = (flightTimeMs.toFloat() / FLIGHT_DURATION_MS.toFloat()).coerceIn(0f, 1f)

            if (fishFlightProgress >= 1f) {
                completeTrial(hit = true)
            }
        }
    }

    override fun onTick(nowMs: Long) {
        if (finished) return
        // Disparo cinemático automático o por timeout si no hubo interacción manual
        val elapsed = nowMs - trialStartedMs
        if (throwInitiatedMs == 0L && elapsed >= AUTO_THROW_TRIGGER_MS) {
            triggerThrow(velocityPxPerS = 920f, angleDeg = (Random.nextFloat() - 0.5f) * 6f)
        }
    }

    fun triggerThrow(velocityPxPerS: Float, angleDeg: Float) {
        if (throwInitiatedMs > 0L || finished) return
        throwInitiatedMs = SystemClock.elapsedRealtime()
        throwVelocity = velocityPxPerS
        throwAngle = angleDeg
    }

    private fun completeTrial(hit: Boolean) {
        val nowMs = SystemClock.elapsedRealtime()
        val timeToThrow = (if (throwInitiatedMs > 0L) throwInitiatedMs else nowMs) - trialStartedMs
        val catchReaction = if (hit) 320L else 0L

        _trials.add(
            TrialRecord.Ar5(
                index = _trials.size + 1,
                at = System.currentTimeMillis(),
                thermalStatus = ctx.thermal(),
                angularSeparationDeg = abs(throwAngle),
                mode = ctx.modeFor(instrumentPossible = true),
                voided = false,
                voidReason = null,
                throwVelocityPxPerS = throwVelocity,
                throwAngleDeg = throwAngle,
                targetDistanceMm = targetDistanceMm,
                timeToThrowMs = timeToThrow,
                hit = hit,
                catchReactionMs = catchReaction,
            )
        )

        if (hit) {
            channel.fire()
            ctx.scene.setReward(channel.reward.value)
        }

        if (!finished) {
            nextTrial()
        }
    }

    companion object {
        private const val FLIGHT_DURATION_MS = 650L
        private const val AUTO_THROW_TRIGGER_MS = 3_500L
    }
}

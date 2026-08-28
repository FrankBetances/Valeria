package eu.futureforkids.valeria.ar.exercises

import android.os.SystemClock
import eu.futureforkids.valeria.ar.TrialRecord
import eu.futureforkids.valeria.ar.reward.HysteresisRewardChannel
import eu.futureforkids.valeria.ar.reward.RewardState
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.signal.Blend
import eu.futureforkids.valeria.ar.signal.FaceIdx
import eu.futureforkids.valeria.ar.signal.FaceSignals
import kotlin.math.abs
import kotlin.math.max
import kotlin.random.Random

/**
 * Valeria+ · AR-6 · Espejo Mímico con Buddy Lúa (Sincronía de Praxias).
 *
 * **Objetivo clínico:** entrenamiento de praxias fonoarticulatorias complejas,
 * conciencia miofuncional orofacial y capacidad de imitación motora visual.
 *
 * **Dinámica Pokémon GO:** Lúa interactúa como compañera (Buddy) en primer plano,
 * modelando una praxia facial específica (Sonrisa, Asombro/Boca abierta, Inflar mejillas, Piquito).
 * El niño la imita frente al espejo AR sosteniendo el gesto. Al sincronizarse con Lúa,
 * ella se ilumina, lanza confeti 3D y celebra con pirueta.
 *
 * **Muro MDR:** Se miden magnitudes físicas puras (blendshapePeak 0..1, holdMs,
 * índice de simetría bilateral 0..1, delta sobre línea base).
 */
class Ar6BuddyMimicry(private val ctx: ExerciseContext) : ArExercise {

    override val model = ArModel.LUA
    override val setupHint =
        "Lúa te mostrará un gesto (sonrisa, asombro o piquito). " +
            "¡Mírate en el espejo e imítala para brillar juntos!"

    private val gate = FrameGate(ctx.imu)
    private var channel = newChannel()
    private val _trials = ArrayList<TrialRecord>()
    override val trials: List<TrialRecord> get() = _trials
    override val finished: Boolean get() = _trials.size >= ctx.trialsPlanned

    private var targetExpression = "smile"
    private var blendshapePeak = 0f
    private var symmetryWorst = 0f
    private var baselineVal: Float? = null
    private val baselineSamples = ArrayList<Float>(60)
    private var trialStartedMs = 0L

    init {
        nextTrial()
    }

    private fun newChannel() = HysteresisRewardChannel(
        thetaOn = 0.52f,
        thetaOff = 0.42f,
        holdMs = ctx.thresholds.holdMs,
    )

    private fun nextTrial() {
        val expressions = listOf("smile", "jaw_open", "cheek_puff", "pucker")
        targetExpression = expressions[Random.nextInt(expressions.size)]
        blendshapePeak = 0f
        symmetryWorst = 0f
        baselineVal = null
        baselineSamples.clear()
        trialStartedMs = SystemClock.elapsedRealtime()
        gate.reset()
        channel = newChannel()
        ctx.scene.setModel(ArModel.LUA)
        ctx.scene.setReward(RewardState.Idle)
    }

    override fun onSignals(signals: FaceSignals) {
        if (finished) return
        if (!gate.accept(signals)) return

        // 1. Lectura del gesto objetivo
        val rawValue = when (targetExpression) {
            "smile" -> (signals.blendshape(Blend.MOUTH_SMILE_LEFT) + signals.blendshape(Blend.MOUTH_SMILE_RIGHT)) / 2f
            "jaw_open" -> signals.blendshape(Blend.JAW_OPEN)
            "cheek_puff" -> signals.blendshape(Blend.CHEEK_PUFF)
            "pucker" -> max(signals.blendshape(Blend.MOUTH_PUCKER), signals.blendshape(Blend.MOUTH_FUNNEL) * 0.8f)
            else -> signals.blendshape(Blend.MOUTH_PUCKER)
        }

        // 2. Calibración de línea base de reposo individual (primeros 45 frames)
        if (baselineVal == null) {
            baselineSamples.add(rawValue)
            if (baselineSamples.size >= 45) {
                baselineVal = baselineSamples.average().toFloat()
            }
            return
        }

        val base = baselineVal ?: 0f
        val normalized = ((rawValue - base) / (1f - base).coerceAtLeast(0.15f)).coerceIn(0f, 1f)

        // 3. Simetría bilateral
        val symmetry = symmetryRatio(signals)
        blendshapePeak = max(blendshapePeak, rawValue)
        symmetryWorst = max(symmetryWorst, symmetry)

        val effective = if (symmetry > 0.12f && targetExpression != "cheek_puff") normalized * 0.4f else normalized

        channel.onSignal(effective, signals.tCaptureUs / 1_000L)
        val state = channel.reward.value
        ctx.scene.setReward(state)

        if (state is RewardState.Fired) {
            completeTrial(success = true)
        }
    }

    override fun onTick(nowMs: Long) {
        val elapsed = nowMs - trialStartedMs
        if (elapsed > MAX_TRIAL_DURATION_MS && trialStartedMs > 0L) {
            completeTrial(success = false)
        }
    }

    private fun completeTrial(success: Boolean) {
        _trials.add(
            TrialRecord.Ar6(
                index = _trials.size + 1,
                at = System.currentTimeMillis(),
                thermalStatus = ctx.thermal(),
                angularSeparationDeg = null,
                mode = ctx.modeFor(instrumentPossible = true),
                voided = false,
                voidReason = null,
                targetExpression = targetExpression,
                blendshapePeak = blendshapePeak,
                holdMs = channel.holdMaxMs,
                symmetryRatio = 1f - symmetryWorst.coerceIn(0f, 1f),
                mimicSuccess = success,
            )
        )

        if (!finished) {
            nextTrial()
        }
    }

    private fun symmetryRatio(s: FaceSignals): Float {
        val lm = s.landmarks
        if (lm.size <= FaceIdx.MOUTH_CORNER_RIGHT) return 0f
        val l = lm[FaceIdx.MOUTH_CORNER_LEFT]
        val r = lm[FaceIdx.MOUTH_CORNER_RIGHT]
        val nose = lm[FaceIdx.NOSE_TIP]
        val width = abs(r.x - l.x)
        if (width < 1e-4f) return 0f
        return abs(abs(nose.x - l.x) - abs(r.x - nose.x)) / width
    }

    companion object {
        private const val MAX_TRIAL_DURATION_MS = 14_000L
    }
}

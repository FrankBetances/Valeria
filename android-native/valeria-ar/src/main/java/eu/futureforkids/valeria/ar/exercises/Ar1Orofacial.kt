package eu.futureforkids.valeria.ar.exercises

import eu.futureforkids.valeria.ar.TrialRecord
import eu.futureforkids.valeria.ar.reward.HysteresisRewardChannel
import eu.futureforkids.valeria.ar.reward.RewardState
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.signal.Blend
import eu.futureforkids.valeria.ar.signal.FaceIdx
import eu.futureforkids.valeria.ar.signal.FaceSignals
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.sqrt

/**
 * Valeria+ · AR-1 · Cinemática Orofacial como gatillo.
 *
 * **Objetivo clínico:** aislar la cinemática de la acústica en dislalias
 * funcionales. Se premia el gesto motor preparatorio del fonema —el redondeo
 * labial de /o/ y /u/— *antes* de exigir la fonación.
 *
 * **El micrófono está apagado. Ese es el punto del ejercicio**, no un descuido:
 * el niño que se escucha fallar se frustra antes de haber consolidado el gesto.
 *
 * Se implementa el primero a propósito: no exige precisión temporal ni
 * calibración espacial, así que valida el andamiaje completo (cámara → señal →
 * recompensa → registro) con el mínimo riesgo de ingeniería.
 */
class Ar1Orofacial(private val ctx: ExerciseContext) : ArExercise {

    override val model = ArModel.CAR
    override val setupHint =
        "Apoya el teléfono y siéntate al lado. Dile que ponga «boquita de beso» para que el coche avance. " +
            "No hace falta que diga nada: aquí solo cuentan los labios."

    private val lock = Any()
    private val gate = FrameGate(ctx.imu)
    private var channel = newChannel()
    private val _trials = ArrayList<TrialRecord>()
    override val trials: List<TrialRecord> get() = synchronized(lock) { ArrayList(_trials) }
    override val finished: Boolean get() = synchronized(lock) { _trials.size >= ctx.trialsPlanned }

    private var puckerPeak = 0f
    private var aperturePeak = 0f
    private var symmetryWorst = 0f
    private var baselinePucker: Float? = null
    private val baselineSamples = ArrayList<Float>(90)

    private fun newChannel() = HysteresisRewardChannel(
        thetaOn = 0.55f,
        thetaOff = 0.45f,
        holdMs = ctx.thresholds.holdMs,
    )

    override fun onSignals(signals: FaceSignals) {
        synchronized(lock) {
            if (_trials.size >= ctx.trialsPlanned) return
            if (!gate.accept(signals)) return

            // ── Línea base en reposo, 3 s al entrar ────────────────────────────
            // La morfología labial de un niño de 3 años y otro de 6 no admite un
            // umbral global: los umbrales son *deltas* sobre su propio reposo.
            if (baselinePucker == null) {
                baselineSamples.add(signals.blendshape(Blend.MOUTH_PUCKER))
                if (baselineSamples.size >= BASELINE_FRAMES) {
                    baselinePucker = baselineSamples.average().toFloat()
                }
                return
            }

            // ── Señal primaria: blendshape ─────────────────────────────────────
            // `mouthPucker` viene entrenado y ya es invariante a escala y pose, que
            // es exactamente lo que la distancia euclídea entre comisuras NO es: a
            // 30-40 cm, un niño que se acerca 10 cm «redondea los labios» sin mover
            // un músculo.
            val pucker = signals.blendshape(Blend.MOUTH_PUCKER)
            val funnel = signals.blendshape(Blend.MOUTH_FUNNEL)
            val raw = max(pucker, funnel * 0.8f)
            val base = baselinePucker ?: 0f
            val normalized = ((raw - base) / (1f - base).coerceAtLeast(0.15f)).coerceIn(0f, 1f)

            // ── Señal secundaria: la ratio geométrica, para explicabilidad ──────
            // Un coeficiente de red no se puede defender ante un comité; una ratio
            // medible sí («apertura vertical / anchura bucal = 0,71»). Se registran
            // las dos, y esta es la que ve la logopeda en el informe.
            val ratio = apertureRatio(signals)
            val symmetry = symmetryError(signals)

            puckerPeak = max(puckerPeak, pucker)
            aperturePeak = max(aperturePeak, ratio)
            symmetryWorst = max(symmetryWorst, symmetry)

            // Sin control de simetría se premiaría una mueca asimétrica, que es
            // justo el patrón compensatorio que la terapia intenta deshacer.
            val effective = if (symmetry > SYMMETRY_TOLERANCE) normalized * 0.35f else normalized

            channel.onSignal(effective, signals.tCaptureUs / 1_000L)
            val state = channel.reward.value
            ctx.scene.setReward(state)

            if (state is RewardState.Fired) recordTrial()
        }
    }

    override fun onTick(nowMs: Long) { /* AR-1 no tiene ventanas: lo marca la cara */ }

    private fun recordTrial() {
        if (_trials.size >= ctx.trialsPlanned) return
        _trials.add(
            TrialRecord.Ar1(
                index = _trials.size + 1,
                at = System.currentTimeMillis(),
                thermalStatus = ctx.thermal(),
                angularSeparationDeg = null,   // AR-1 no reparte dianas
                mode = ctx.modeFor(instrumentPossible = true),
                voided = false,
                voidReason = null,
                holdMaxMs = channel.holdMaxMs,
                holdTotalMs = channel.holdTotalMs,
                puckerPeak = puckerPeak,
                apertureRatioPeak = aperturePeak,
                symmetryWorst = symmetryWorst,
                framesValid = gate.framesValid,
                framesTotal = gate.framesTotal,
                attemptsToFire = channel.attempts,
            )
        )
        puckerPeak = 0f
        aperturePeak = 0f
        symmetryWorst = 0f
        gate.reset()
        channel = newChannel()
        ctx.scene.setReward(RewardState.Idle)
    }

    /**
     * Apertura vertical / anchura bucal, ambas divididas por la distancia
     * inter-ocular externa (landmarks 33 ↔ 263). Esa referencia es rígida: no
     * cambia con el gesto, y por eso hace la medida adimensional.
     */
    private fun apertureRatio(s: FaceSignals): Float {
        val lm = s.landmarks
        if (lm.size <= FaceIdx.EYE_OUTER_RIGHT) return 0f
        val interocular = dist(
            lm[FaceIdx.EYE_OUTER_LEFT].x, lm[FaceIdx.EYE_OUTER_LEFT].y,
            lm[FaceIdx.EYE_OUTER_RIGHT].x, lm[FaceIdx.EYE_OUTER_RIGHT].y,
        )
        if (interocular < 1e-4f) return 0f
        val aperture = dist(
            lm[FaceIdx.LIP_UPPER_INNER].x, lm[FaceIdx.LIP_UPPER_INNER].y,
            lm[FaceIdx.LIP_LOWER_INNER].x, lm[FaceIdx.LIP_LOWER_INNER].y,
        )
        val width = dist(
            lm[FaceIdx.MOUTH_CORNER_LEFT].x, lm[FaceIdx.MOUTH_CORNER_LEFT].y,
            lm[FaceIdx.MOUTH_CORNER_RIGHT].x, lm[FaceIdx.MOUTH_CORNER_RIGHT].y,
        )
        return if (width < 1e-4f) 0f else aperture / width
    }

    /** Asimetría de las comisuras respecto a la línea media, en fracción de anchura bucal. */
    private fun symmetryError(s: FaceSignals): Float {
        val lm = s.landmarks
        if (lm.size <= FaceIdx.MOUTH_CORNER_RIGHT) return 0f
        val l = lm[FaceIdx.MOUTH_CORNER_LEFT]
        val r = lm[FaceIdx.MOUTH_CORNER_RIGHT]
        val nose = lm[FaceIdx.NOSE_TIP]
        val width = dist(l.x, l.y, r.x, r.y)
        if (width < 1e-4f) return 0f
        return abs(abs(nose.x - l.x) - abs(r.x - nose.x)) / width
    }

    private fun dist(x1: Float, y1: Float, x2: Float, y2: Float): Float {
        val dx = x2 - x1
        val dy = y2 - y1
        return sqrt(dx * dx + dy * dy)
    }

    companion object {
        private const val BASELINE_FRAMES = 90        // ~3 s a 30 fps
        private const val SYMMETRY_TOLERANCE = 0.08f  // 8 % de la anchura bucal
    }
}

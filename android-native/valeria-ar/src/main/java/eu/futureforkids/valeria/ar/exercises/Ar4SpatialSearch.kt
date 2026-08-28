package eu.futureforkids.valeria.ar.exercises

import android.os.SystemClock
import eu.futureforkids.valeria.ar.TrialRecord
import eu.futureforkids.valeria.ar.reward.EventRewardChannel
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.signal.FaceSignals
import kotlin.math.abs
import kotlin.math.hypot
import kotlin.math.sqrt
import kotlin.random.Random

/**
 * Valeria+ · AR-4 · Búsqueda Espacial de Lúa («Lúa Salvaje» estilo Pokémon GO).
 *
 * **Objetivo clínico:** entrenamiento de la amplitud articular cervical,
 * rastreo visual continuo y control inhibitorio de sacadas oculares desordenadas.
 *
 * **Dinámica Pokémon GO:** Lúa se oculta en un cuadrante angular 3D del espacio.
 * El niño orienta su cabeza guiado por la brújula y el radar visual. Cuando
 * centra a Lúa en el visor foveal (cono < 8.5°) y la sostiene durante la ventana,
 * Lúa aparece en 3D saltando de alegría y ronroneando.
 *
 * **Muro MDR:** Se registran magnitudes físicas puras (grados angulares de error,
 * tiempo de adquisición en ms, jitter RMS en °).
 */
class Ar4SpatialSearch(private val ctx: ExerciseContext) : ArExercise {

    override val model = ArModel.LUA
    override val setupHint =
        "Busca a Lúa girando la cabeza suavemente. Cuando la veas en el centro de tu visor, " +
            "¡Lúa aparecerá saltando de alegría!"

    private val lock = Any()
    private val gate = FrameGate(ctx.imu)
    private val channel = EventRewardChannel()
    private val _trials = ArrayList<TrialRecord>()
    override val trials: List<TrialRecord> get() = synchronized(lock) { ArrayList(_trials) }
    override val finished: Boolean get() = synchronized(lock) { _trials.size >= ctx.trialsPlanned }

    private var trialStartedMs = 0L
    private var targetYawDeg = 0f
    private var targetPitchDeg = 0f
    private var targetQuadrant = "left"
    private var fovealDwellMs = 0L
    private var lastFrameMs = 0L
    private val yawSamples = ArrayList<Float>(60)
    private var trialActive = false

    init {
        synchronized(lock) {
            nextTrial()
        }
    }

    private fun nextTrial() {
        val quadrants = listOf(
            Triple("left", -22f, 0f),
            Triple("right", 22f, 0f),
            Triple("top_left", -18f, 14f),
            Triple("top_right", 18f, 14f),
        )
        val pick = quadrants[Random.nextInt(quadrants.size)]
        targetQuadrant = pick.first
        targetYawDeg = pick.second
        targetPitchDeg = pick.third
        trialStartedMs = SystemClock.elapsedRealtime()
        lastFrameMs = trialStartedMs
        fovealDwellMs = 0L
        yawSamples.clear()
        trialActive = true
        gate.reset()
        ctx.scene.setModel(ArModel.LUA)
        ctx.scene.setPointer(0f, 0f, 0f)
    }

    override fun onSignals(signals: FaceSignals) {
        synchronized(lock) {
            if (_trials.size >= ctx.trialsPlanned || !trialActive) return
            val nowMs = SystemClock.elapsedRealtime()
            val dt = (nowMs - lastFrameMs).coerceIn(0L, 200L)
            lastFrameMs = nowMs

            if (!gate.accept(signals, coneDeg = 60f)) return

            val currentYaw = ctx.imu.compensatedYaw(signals.headPose.yawDeg)
            val currentPitch = signals.headPose.pitchDeg
            yawSamples.add(currentYaw)

            val errYaw = abs(currentYaw - targetYawDeg)
            val errPitch = abs(currentPitch - targetPitchDeg)
            val totalErr = hypot(errYaw, errPitch)

            // Radar / Puntero espacial.
            //
            // La escala es la del teléfono real, no un factor inventado:
            // `pxPerDeg` sale de la anchura en píxeles, la anchura en mm y la
            // distancia estimada a la cara. Un `widthMm * 3.5f` dejaba el centro
            // del radar en x≈114 de una pantalla de 1080 —pegado al borde— y movía
            // la retícula ocho veces menos de lo que el niño giraba la cabeza.
            //
            // La diana vive a ±22°, y la pantalla a un palmo y medio abarca ~11°:
            // el objetivo está FUERA de la pantalla casi todo el ensayo. Por eso la
            // retícula se ancla al borde en vez de salirse. Eso es lo que la
            // convierte en un radar —«tuerce hacia allá»— y no en un punto que
            // desaparece.
            val dwellProgress = (fovealDwellMs.toFloat() / FOVEAL_HOLD_MS.toFloat()).coerceIn(0f, 1f)
            val pxPerDeg = ctx.geometry.pxPerDeg(ctx.distance.currentMm)
            val widthPx = ctx.geometry.widthPx.toFloat()
            val heightPx = ctx.geometry.heightPx.toFloat()
            val rawX = (widthPx / 2f) + (currentYaw - targetYawDeg) * pxPerDeg
            val rawY = (heightPx / 2f) + (currentPitch - targetPitchDeg) * pxPerDeg
            ctx.scene.setPointer(
                rawX.coerceIn(RADAR_EDGE_MARGIN_PX, widthPx - RADAR_EDGE_MARGIN_PX),
                rawY.coerceIn(RADAR_EDGE_MARGIN_PX, heightPx - RADAR_EDGE_MARGIN_PX),
                dwellProgress,
            )

            if (totalErr <= FOVEAL_CONE_DEG) {
                fovealDwellMs += dt
                if (fovealDwellMs >= FOVEAL_HOLD_MS) {
                    completeTrial(success = true)
                }
            } else {
                fovealDwellMs = (fovealDwellMs - dt).coerceAtLeast(0L)
            }
        }
    }

    override fun onTick(nowMs: Long) {
        synchronized(lock) {
            if (_trials.size >= ctx.trialsPlanned || !trialActive) return
            val elapsed = nowMs - trialStartedMs
            if (elapsed > MAX_SEARCH_TIME_MS && trialStartedMs > 0L) {
                completeTrial(success = false)
            }
        }
    }

    private fun completeTrial(success: Boolean) {
        if (!trialActive) return // Idempotency guard prevents double completion
        trialActive = false

        val nowMs = SystemClock.elapsedRealtime()
        val acquisition = nowMs - trialStartedMs

        // Cálculo de RMS de Jitter
        val meanYaw = if (yawSamples.isNotEmpty()) yawSamples.average().toFloat() else 0f
        val variance = if (yawSamples.isNotEmpty()) {
            yawSamples.map { (it - meanYaw) * (it - meanYaw) }.average().toFloat()
        } else 0f
        val rms = sqrt(variance)

        _trials.add(
            TrialRecord.Ar4(
                index = _trials.size + 1,
                at = System.currentTimeMillis(),
                thermalStatus = ctx.thermal(),
                angularSeparationDeg = abs(targetYawDeg),
                mode = ctx.modeFor(instrumentPossible = true),
                voided = false,
                voidReason = null,
                targetQuadrant = targetQuadrant,
                targetYawDeg = targetYawDeg,
                targetPitchDeg = targetPitchDeg,
                acquisitionTimeMs = acquisition,
                fovealDwellMs = fovealDwellMs,
                yawRmsDeg = rms,
                success = success,
            )
        )

        if (success) {
            // `fire` PIDE la latencia del logro, como en AR-2 y AR-3: el estado
            // `Fired` la lleva dentro. Aquí es el tiempo de adquisición.
            channel.fire(acquisition)
            ctx.scene.setReward(channel.reward.value)
        }

        if (_trials.size < ctx.trialsPlanned) {
            nextTrial()
        }
    }

    companion object {
        private const val FOVEAL_CONE_DEG = 8.5f     // Cono foveal de coincidencia
        private const val FOVEAL_HOLD_MS = 650L      // Sostén de fijación foveal
        private const val MAX_SEARCH_TIME_MS = 12_000L // Techo de búsqueda por ensayo
        private const val RADAR_EDGE_MARGIN_PX = 48f // Anclaje de la retícula al borde
    }
}

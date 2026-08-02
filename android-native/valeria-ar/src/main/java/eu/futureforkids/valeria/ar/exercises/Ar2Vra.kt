package eu.futureforkids.valeria.ar.exercises

import android.os.SystemClock
import eu.futureforkids.valeria.ar.AptitudeLevel
import eu.futureforkids.valeria.ar.TimestampSource
import eu.futureforkids.valeria.ar.Transducer
import eu.futureforkids.valeria.ar.TrialMode
import eu.futureforkids.valeria.ar.TrialRecord
import eu.futureforkids.valeria.ar.audio.StimulusPlayer
import eu.futureforkids.valeria.ar.reward.EventRewardChannel
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.signal.FaceSignals
import kotlin.math.abs
import kotlin.random.Random

/**
 * Valeria+ · AR-2 · VRA digitalizado (reflejo de orientación auditiva).
 *
 * **Objetivo clínico:** convertir una observación audiológica cualitativa
 * («¿giró?») en un dato duro: la latencia en milisegundos desde el estímulo
 * hasta el giro cefálico.
 *
 * Es el ejercicio con más valor académico y el de mayor riesgo de ingeniería,
 * porque **la latencia solo vale si se mide bien**:
 *   · el inicio del estímulo sale de `AudioTrack.getTimestamp()`, no del
 *     instante de la llamada a play();
 *   · la detección del giro sale de la marca de CAPTURA del sensor, no del
 *     instante del callback de MediaPipe;
 *   · el yaw es el COMPENSADO por IMU, no el relativo a una cámara que se mueve.
 *
 * **Dos modos, y el montaje decide cuál.** En el centro, con altavoces montados
 * a ±60° y teléfono de nivel A, mide. En casa —sin montaje, con perfil por
 * debajo de A, con Bluetooth, o con marcas de tiempo no alineables— el
 * ejercicio se juega igual: el niño gira, el perro celebra, y el registro
 * guarda acierto/fallo con `latencyMs = null` **y el motivo**. Un dato ausente
 * y etiquetado es honesto; un dato presente y sesgado, no.
 *
 * Parentesco: es la versión instrumentada de **RA-5 «Localización del sonido»**
 * del bloque de Audición, que sigue disponible donde no hay montaje —que será
 * la mayoría de los sitios—.
 */
class Ar2Vra(
    private val ctx: ExerciseContext,
    private val player: StimulusPlayer,
    private val timestampSource: TimestampSource,
    private val clockOffsetUs: Long,
    private val latencyUncertaintyMs: Float?,
) : ArExercise {

    override val model = ArModel.DOG
    override val setupHint =
        "Coloca al peque mirando al frente, con los altavoces a los lados. Cuando suene, no le señales " +
            "ni le mires: el ejercicio mide si gira solo."

    private enum class Phase { ARMING, WAITING, WINDOW, DONE_TRIAL }

    private val gate = FrameGate(ctx.imu)
    private val channel = EventRewardChannel()
    private val _trials = ArrayList<TrialRecord>()
    override val trials: List<TrialRecord> get() = _trials
    override val finished: Boolean get() = _trials.size >= ctx.trialsPlanned

    private var phase = Phase.ARMING
    private var armedSinceMs = 0L
    private var nextStimulusAtMs = 0L
    private var side = StimulusPlayer.Side.LEFT
    private var lastSides = ArrayList<StimulusPlayer.Side>(3)
    private var isCatch = false
    private var tStimulusUs: Long? = null
    private var windowOpenedMs = 0L
    private var peakYaw = 0f
    private var turnUs: Long? = null
    private var turnSide: StimulusPlayer.Side? = null
    private var transducer = Transducer.UNKNOWN

    override fun onSignals(signals: FaceSignals) {
        if (finished) return
        // El cono aquí es amplio a propósito: el ejercicio consiste justo en
        // salirse de él. Lo que se filtra es la cara perdida y el móvil movido.
        if (!gate.accept(signals, coneDeg = 60f)) return

        val yaw = ctx.imu.compensatedYaw(signals.headPose.yawDeg)

        when (phase) {
            // ── Postura armada ──────────────────────────────────────────────
            // Si el niño no está mirando al frente, no hay estímulo. Sin esto,
            // media latencia sería el tiempo que tardó en volver la cabeza.
            Phase.ARMING -> {
                val centered = abs(yaw) < ARM_CONE_DEG
                val steady = ctx.imu.isSteady()
                if (centered && steady) {
                    if (armedSinceMs == 0L) armedSinceMs = SystemClock.elapsedRealtime()
                    if (SystemClock.elapsedRealtime() - armedSinceMs >= ARM_HOLD_MS) startTrial()
                } else {
                    armedSinceMs = 0L
                }
            }

            Phase.WINDOW -> {
                if (abs(yaw) > abs(peakYaw)) peakYaw = yaw
                if (turnUs == null && abs(yaw) >= ctx.thresholds.turnDeg) {
                    // La detección del umbral usa la señal CRUDA, sin suavizar:
                    // filtrar antes de medir latencia introduce un retardo
                    // sistemático justo en el dato académico.
                    turnUs = signals.tCaptureUs
                    turnSide = if (yaw < 0) StimulusPlayer.Side.LEFT else StimulusPlayer.Side.RIGHT
                    closeTrial(timedOut = false)
                }
            }

            else -> Unit
        }
    }

    override fun onTick(nowMs: Long) {
        if (finished) return
        when (phase) {
            Phase.WAITING -> if (nowMs >= nextStimulusAtMs) fireStimulus()
            Phase.WINDOW -> if (nowMs - windowOpenedMs >= ctx.thresholds.responseWindowMs) {
                closeTrial(timedOut = true)
            }
            Phase.DONE_TRIAL -> if (nowMs >= nextStimulusAtMs) {
                phase = Phase.ARMING
                armedSinceMs = 0L
            }
            else -> Unit
        }
    }

    private fun startTrial() {
        // Lado aleatorizado con tope de 2 repeticiones seguidas: sin él, el niño
        // aprende la secuencia y deja de orientarse por el sonido.
        val forced = if (lastSides.size >= 2 && lastSides[0] == lastSides[1]) {
            if (lastSides[0] == StimulusPlayer.Side.LEFT) StimulusPlayer.Side.RIGHT else StimulusPlayer.Side.LEFT
        } else null
        side = forced ?: if (Random.nextBoolean()) StimulusPlayer.Side.LEFT else StimulusPlayer.Side.RIGHT
        lastSides.add(0, side)
        if (lastSides.size > 2) lastSides.removeAt(lastSides.size - 1)

        // Ensayos trampa (~20 %, sin sonido). Sin ellos no se puede distinguir
        // detección auditiva de movimiento cefálico espontáneo: es el control
        // que separa una demo de un instrumento.
        isCatch = Random.nextFloat() < CATCH_RATE

        // Intervalo inter-ensayo aleatorio 3-6 s para que no anticipe.
        nextStimulusAtMs = SystemClock.elapsedRealtime() + (3000L + Random.nextInt(3000))
        phase = Phase.WAITING
        peakYaw = 0f
        turnUs = null
        turnSide = null
        tStimulusUs = null
        ctx.imu.anchor()
    }

    private fun fireStimulus() {
        transducer = player.currentTransducer()
        tStimulusUs = if (isCatch) {
            // En trampa no suena nada, pero el reloj del ensayo arranca igual:
            // así un giro espontáneo se registra con su tiempo y cuenta como
            // falso positivo, que es exactamente el dato que se busca.
            SystemClock.elapsedRealtimeNanos() / 1_000L
        } else {
            player.playLateralized(side)?.let { it + clockOffsetUs }
        }
        windowOpenedMs = SystemClock.elapsedRealtime()
        phase = Phase.WINDOW
    }

    private fun closeTrial(timedOut: Boolean) {
        val correctSide = !isCatch && !timedOut && turnSide == side

        // Cuatro razones distintas por las que la latencia puede no existir. Se
        // registran por separado porque no significan lo mismo al analizar.
        val nullReason: String? = when {
            isCatch -> "catchTrial"
            timedOut -> "noResponse"
            timestampSource != TimestampSource.REALTIME -> "cameraTimestampNotAlignable"
            player.bluetoothActive() -> "bluetoothOutput"
            transducer != Transducer.EXTERNAL_SPEAKERS && transducer != Transducer.WIRED_HEADPHONES -> "noWiredTransducer"
            ctx.profile.level != AptitudeLevel.A -> "deviceBelowLevelA"
            tStimulusUs == null || turnUs == null -> "audioTimestampUnavailable"
            else -> null
        }

        val latency = if (nullReason == null && tStimulusUs != null && turnUs != null) {
            ((turnUs!! - tStimulusUs!!) / 1000L).takeIf { it >= 0 }
        } else null

        // El refuerzo, contingente y solo eso: giro correcto dentro de ventana.
        // En ensayo trampa NUNCA hay recompensa —y eso también es un dato—.
        if (correctSide) channel.fire(latency ?: 0L)

        _trials.add(
            TrialRecord.Ar2(
                index = _trials.size + 1,
                at = System.currentTimeMillis(),
                thermalStatus = ctx.thermal(),
                angularSeparationDeg = null,
                mode = if (latency != null) TrialMode.INSTRUMENT else TrialMode.GAME,
                voided = ctx.imu.movedTooMuch(),
                voidReason = if (ctx.imu.movedTooMuch()) "deviceMoved" else null,
                side = if (side == StimulusPlayer.Side.LEFT) "left" else "right",
                isCatch = isCatch,
                transducer = transducer,
                // El nivel de presentación en dB SPL lo mide el protocolo de
                // montaje, no la app: sin él la latencia no es interpretable
                // (a más nivel, menos latencia), así que viaja como null
                // explícito hasta que exista una medida real.
                gainDbSpl = null,
                tStimulusUs = tStimulusUs,
                tTurnUs = turnUs,
                latencyMs = latency,
                latencyNullReason = nullReason,
                peakYawDeg = peakYaw,
                correctSide = correctSide,
                timedOut = timedOut,
                deviceLatencyUncertaintyMs = latencyUncertaintyMs,
            )
        )

        ctx.scene.setReward(channel.reward.value)
        phase = Phase.DONE_TRIAL
        nextStimulusAtMs = SystemClock.elapsedRealtime() + FEEDBACK_MS
    }

    override fun close() = player.release()

    companion object {
        private const val ARM_CONE_DEG = 5f     // mirando al frente de verdad
        private const val ARM_HOLD_MS = 500L
        private const val CATCH_RATE = 0.2f     // ~20 % de ensayos sin sonido
        private const val FEEDBACK_MS = 1500L   // el perro celebra antes del siguiente
    }
}

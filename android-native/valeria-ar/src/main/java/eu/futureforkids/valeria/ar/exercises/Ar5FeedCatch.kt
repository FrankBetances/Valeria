package eu.futureforkids.valeria.ar.exercises

import android.os.SystemClock
import eu.futureforkids.valeria.ar.TrialRecord
import eu.futureforkids.valeria.ar.reward.EventRewardChannel
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.signal.FaceSignals
import kotlin.math.abs

/**
 * Valeria+ · AR-5 · Lanzamiento del pez a Lúa (Poké-Feed & Catch).
 *
 * **Objetivo clínico:** coordinación óculo-manual, puntería balística y
 * latencia de iniciación motora ante una demanda comunicativa.
 *
 * **Dinámica:** Lúa espera hambrienta en el centro de la escena. El niño lanza
 * el pez dorado deslizando el dedo hacia ella. El pez vuela y, si el gesto iba
 * apuntado y con fuerza suficiente, Lúa lo atrapa y ronronea.
 *
 * **Muro MDR — lo que se mide y lo que NO.** Se registran tres magnitudes que
 * salen del gesto real del niño: la velocidad del deslizamiento en px/s (del
 * `VelocityTracker` de Compose), la desviación angular en grados entre la
 * dirección del lanzamiento y la línea que va del dedo a Lúa, y el tiempo desde
 * que empieza el ensayo hasta que el dedo se levanta.
 *
 * Aquí NO hay ningún tiempo de reacción de captura: quien atrapa es Lúa, que es
 * software, así que cronometrarla mediría el reloj de la app y no al niño. La
 * versión anterior de este ejercicio guardaba un `catchReactionMs` de 320 ms
 * constantes, una velocidad de 920 px/s constante y un `hit` que era `true`
 * siempre, porque el lanzamiento lo disparaba un temporizador y el dedo del
 * niño no se leía en ninguna parte. Eso viajaba al panel de resultados y, en
 * nivel A, al conjunto publicable. Un dato constante no es una medida.
 *
 * Un ensayo sin lanzamiento se ANULA (`voided`), no se rellena: si el niño no
 * tiró, no hay puntería que registrar.
 */
class Ar5FeedCatch(private val ctx: ExerciseContext) : ArExercise {

    override val model = ArModel.FISH
    override val setupHint =
        "Lúa espera en el centro con hambre. Desliza el dedo hacia ella para lanzarle el pez dorado: " +
            "si apuntas bien y con brío, lo atrapa en el aire."

    private val lock = Any()
    private val gate = FrameGate(ctx.imu)
    private val channel = EventRewardChannel()
    private val _trials = ArrayList<TrialRecord>()
    override val trials: List<TrialRecord> get() = synchronized(lock) { ArrayList(_trials) }
    override val finished: Boolean get() = synchronized(lock) { _trials.size >= ctx.trialsPlanned }

    private var trialStartedMs = 0L
    private var throwInitiatedMs = 0L
    private var targetDistanceMm = NOMINAL_DISTANCE_MM
    private var throwVelocity = 0f
    private var throwAngle = 0f
    private var trialActive = false

    init {
        synchronized(lock) {
            nextTrial()
        }
    }

    private fun nextTrial() {
        trialStartedMs = SystemClock.elapsedRealtime()
        throwInitiatedMs = 0L
        throwVelocity = 0f
        throwAngle = 0f
        trialActive = true
        targetDistanceMm = ctx.distance.currentMm.coerceIn(MIN_DISTANCE_MM, MAX_DISTANCE_MM)
        ctx.scene.setModel(ArModel.FISH)
        ctx.scene.hidePointer()
        gate.reset()
    }

    /**
     * La cara aquí no dispara nada: el gatillo es el dedo. Se consume el frame
     * solo para que la distancia de trabajo del ensayo salga de una cara vista
     * de verdad y para llevar la cuenta de validez como los demás ejercicios.
     */
    override fun onSignals(signals: FaceSignals) {
        synchronized(lock) {
            if (_trials.size >= ctx.trialsPlanned || !trialActive) return
            if (!gate.accept(signals, coneDeg = 30f)) return
            if (throwInitiatedMs == 0L) {
                targetDistanceMm = ctx.distance.currentMm.coerceIn(MIN_DISTANCE_MM, MAX_DISTANCE_MM)
            }
        }
    }

    /**
     * El vuelo avanza aquí y no en `onSignals` a propósito: el niño mira al dedo
     * mientras lanza, así que atar la trayectoria a los frames de cara la dejaba
     * congelada justo en el momento del gesto.
     */
    override fun onTick(nowMs: Long) {
        synchronized(lock) {
            if (_trials.size >= ctx.trialsPlanned || !trialActive) return

            if (throwInitiatedMs > 0L) {
                val progress = ((nowMs - throwInitiatedMs).toFloat() / FLIGHT_DURATION_MS).coerceIn(0f, 1f)
                // El pez recorre la recta desde el borde inferior hasta Lúa, en el
                // centro. Es el indicador del proyectil, no una parábola: no hay
                // gravedad simulada en ninguna parte y pintar un arco sugeriría una
                // física que no existe.
                val widthPx = ctx.geometry.widthPx.toFloat()
                val heightPx = ctx.geometry.heightPx.toFloat()
                ctx.scene.setPointer(
                    widthPx / 2f,
                    heightPx - (heightPx / 2f) * progress,
                    progress,
                )
                if (progress >= 1f) {
                    completeTrial(landed = true)
                }
                return
            }

            if (nowMs - trialStartedMs >= MAX_WAIT_MS) {
                completeTrial(landed = false)
            }
        }
    }

    override fun onFling(velocityPxPerS: Float, angleDeg: Float) {
        synchronized(lock) {
            if (_trials.size >= ctx.trialsPlanned || !trialActive || throwInitiatedMs > 0L) return
            throwVelocity = velocityPxPerS
            throwAngle = angleDeg
            throwInitiatedMs = SystemClock.elapsedRealtime()
        }
    }

    /**
     * @param landed `true` si el pez completó el vuelo; `false` si el ensayo
     *   caducó sin que el niño llegara a lanzar.
     */
    private fun completeTrial(landed: Boolean) {
        if (!trialActive) return // Idempotency guard
        trialActive = false

        val threw = throwInitiatedMs > 0L
        // Acierta quien apunta Y tira con fuerza suficiente para llegar. Las dos
        // condiciones son magnitudes del gesto, no un resultado prefijado.
        val hit = landed && threw &&
            abs(throwAngle) <= HIT_TOLERANCE_DEG &&
            throwVelocity >= MIN_THROW_VELOCITY_PX_S

        val timeToThrow = if (threw) throwInitiatedMs - trialStartedMs else 0L

        _trials.add(
            TrialRecord.Ar5(
                index = _trials.size + 1,
                at = System.currentTimeMillis(),
                thermalStatus = ctx.thermal(),
                angularSeparationDeg = if (threw) abs(throwAngle) else null,
                mode = ctx.modeFor(instrumentPossible = true),
                voided = !threw,
                voidReason = if (threw) null else "no_throw",
                throwVelocityPxPerS = throwVelocity,
                throwAngleDeg = throwAngle,
                targetDistanceMm = targetDistanceMm,
                timeToThrowMs = timeToThrow,
                hit = hit,
            )
        )

        ctx.scene.hidePointer()
        if (hit) {
            // La latencia que viaja en `Fired` es la del gesto del niño.
            channel.fire(timeToThrow)
            ctx.scene.setReward(channel.reward.value)
        }

        if (_trials.size < ctx.trialsPlanned) {
            nextTrial()
        }
    }

    companion object {
        private const val FLIGHT_DURATION_MS = 650f
        private const val MAX_WAIT_MS = 12_000L
        /** Tolerancia de puntería: fuera de este cono el pez pasa de largo. */
        private const val HIT_TOLERANCE_DEG = 18f
        /** Por debajo de esto el gesto es un arrastre, no un lanzamiento. */
        private const val MIN_THROW_VELOCITY_PX_S = 350f
        private const val MIN_DISTANCE_MM = 280f
        private const val MAX_DISTANCE_MM = 600f
        private const val NOMINAL_DISTANCE_MM = 350f
    }
}

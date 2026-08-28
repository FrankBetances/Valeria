package eu.futureforkids.valeria.ar.exercises

import android.graphics.PointF
import android.os.SystemClock
import eu.futureforkids.valeria.ar.TrialRecord
import eu.futureforkids.valeria.ar.reward.EventRewardChannel
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.scene.SceneTarget
import eu.futureforkids.valeria.ar.signal.Calibration
import eu.futureforkids.valeria.ar.signal.FaceSignals
import eu.futureforkids.valeria.ar.signal.PointerSource
import kotlin.math.hypot
import kotlin.random.Random

/**
 * Valeria+ · AR-3 · Selección semántica por fijación.
 *
 * **Objetivo clínico:** evaluar comprensión léxica y sintáctica sin que la
 * motricidad fina contamine el resultado (parálisis cerebral, dispraxia).
 *
 * ── La geometría manda, y en un móvil es dura ──────────────────────────────
 * Una pantalla de 6,1″ en horizontal, a 35 cm, abarca ~23° de campo visual. Con
 * tres dianas los centros quedan a **~7,6°**, no a los 20° que pide la
 * literatura de *eye tracking* con monitores de escritorio (esa cifra no
 * traslada a un teléfono, ni siquiera a una tablet de 10,5″). La regla de
 * trabajo es que una diana es discriminable si la separación supera ≈3× el
 * jitter RMS del puntero: con 7,6° hace falta un puntero por debajo de 2,5° RMS.
 * Ese, y no los fps, es el criterio que decide 3 dianas o 2.
 *
 * Y en BYOD nada de esto se puede precalcular: las dianas se colocan **en
 * grados**, resueltos en caliente desde los milímetros reales de pantalla y la
 * distancia estimada por la cara del niño.
 *
 * El modo de 2 dianas no es una derrota: la elección forzada entre dos
 * alternativas es un paradigma estándar de evaluación de comprensión, con su
 * conocido 50 % de acierto por azar —que se corrige con más ensayos, no con más
 * dianas—. Lo que sí sería un error es dejar tres dianas indiscriminables y
 * llamar «error de comprensión» a un fallo de puntería.
 */
class Ar3Fixation(
    private val ctx: ExerciseContext,
    private val pointer: PointerSource,
    private val calibration: Calibration,
    private val targetCount: Int,
    /** Palabras del ensayo: la primera es la correcta, el resto distractores. */
    private val vocabulary: List<List<String>>,
) : ArExercise {

    override val model = ArModel.APPLE
    override val setupHint =
        "Teléfono apoyado y en horizontal, a un palmo y medio. Di la palabra una sola vez y espera: " +
            "el dibujo se elige mirándolo, no tocándolo."

    private val lock = Any()
    private val gate = FrameGate(ctx.imu)
    private val channel = EventRewardChannel()
    private val _trials = ArrayList<TrialRecord>()
    override val trials: List<TrialRecord> get() = synchronized(lock) { ArrayList(_trials) }
    override val finished: Boolean get() = synchronized(lock) { _trials.size >= ctx.trialsPlanned }

    private var targets: List<SceneTarget> = emptyList()
    private var targetId = ""
    private var dwellMs = 0L
    private var lastFrameMs = 0L
    private var insideId: String? = null
    private var firstFixationId: String? = null
    private var tFirstFixationMs: Long? = null
    private var trialStartedMs = 0L
    private var revisits = 0
    private var outOfBoundsMs = 0L
    private var armed = false
    private val visited = HashSet<String>()

    init {
        synchronized(lock) {
            nextTrial()
        }
    }

    override fun onSignals(signals: FaceSignals) {
        synchronized(lock) {
            if (_trials.size >= ctx.trialsPlanned) return
            val nowMs = SystemClock.elapsedRealtime()
            val dt = if (lastFrameMs == 0L) 0L else (nowMs - lastFrameMs).coerceIn(0L, 200L)
            lastFrameMs = nowMs

            // ── El apoyo improvisado, garantizado por software ──────────────────
            // No hay presupuesto de soportes, así que la respuesta correcta no es
            // renunciar a AR-3: es que la app imponga la geometría que el soporte
            // habría dado. El ensayo no arranca sin 800 ms de IMU estable, y se
            // anula si el teléfono se mueve durante la ventana.
            if (!armed) {
                if (ctx.imu.isSteady()) { armed = true; ctx.imu.anchor(); trialStartedMs = nowMs }
                return
            }
            if (ctx.imu.movedTooMuch()) { voidTrial("deviceMoved"); return }
            if (!gate.accept(signals, coneDeg = 20f)) { outOfBoundsMs += dt; return }

            val raw = pointer.rawPoint(signals) ?: run { outOfBoundsMs += dt; return }
            val screen = calibration.project(raw)
            if (screen.x.isNaN()) { outOfBoundsMs += dt; return }

            val hit = hitTest(screen)

            if (hit == null) {
                // Zona neutra: el *dwell* solo acumula DENTRO de un objeto, nunca en
                // el fondo. Es la mitigación del problema de Midas —con dwell puro,
                // todo lo que se mira se selecciona—.
                insideId = null
                // Decaimiento, no reinicio: salir 100 ms no puede borrar 1,1 s de
                // fijación. Reiniciar a cero en un niño de 4 años garantiza que no
                // lo consiga nunca.
                dwellMs = (dwellMs - 2 * dt).coerceAtLeast(0L)
                ctx.scene.setPointer(screen.x, screen.y, dwellProgress = 0f)
                return
            }

            if (hit != insideId) {
                if (insideId != null && visited.contains(hit)) revisits += 1
                insideId = hit
                visited.add(hit)
                dwellMs = 0L
                if (firstFixationId == null) {
                    // Adónde mira PRIMERO y qué acaba eligiendo son dos variables
                    // clínicas distintas: sesgo de comprensión inmediata frente a
                    // decisión con posible corrección. Solo la segunda dispara el
                    // giro de 360° del modelo.
                    firstFixationId = hit
                    tFirstFixationMs = nowMs - trialStartedMs
                }
            } else {
                dwellMs += dt
            }

            val progress = (dwellMs.toFloat() / ctx.thresholds.dwellMs).coerceIn(0f, 1f)
            ctx.scene.setPointer(screen.x, screen.y, progress)
            channel.onSignal(progress, signals.tCaptureUs / 1_000L)

            if (dwellMs >= ctx.thresholds.dwellMs) {
                channel.fire(nowMs - trialStartedMs)
                ctx.scene.setReward(channel.reward.value)
                recordTrial(selected = hit, voidReason = null)
            }
        }
    }

    override fun onTick(nowMs: Long) {
        synchronized(lock) {
            if (_trials.size >= ctx.trialsPlanned || !armed) return
            if (nowMs - trialStartedMs > TRIAL_TIMEOUT_MS) recordTrial(selected = null, voidReason = null)
        }
    }

    /**
     * Hitbox doble: el área de ENTRADA es menor que la de MANTENIMIENTO. Sin
     * eso, el puntero parpadea en el borde del objeto y el niño ve el anillo
     * llenarse y vaciarse sin entender por qué.
     */
    private fun hitTest(p: PointF): String? {
        val current = insideId
        targets.forEach { t ->
            val d = hypot(p.x - t.xPx, p.y - t.yPx)
            val radius = if (t.id == current) t.keepRadiusPx else t.enterRadiusPx
            if (d <= radius) return t.id
        }
        return null
    }

    private fun nextTrial() {
        val words = vocabulary[_trials.size % vocabulary.size]
        // La diana correcta va siempre en `words[0]`, así que se baraja la
        // posición para que no aprenda «la buena está en el centro»: sin esto,
        // AR-3 mediría memoria de posición y no comprensión léxica.
        val chosen = words.take(targetCount).shuffled(Random)
        targetId = words.first()

        // Colocación EN GRADOS, resuelta en caliente: 1/6, 1/2 y 5/6 del ancho
        // con 3 dianas; 1/6 y 5/6 con 2 (que da 15-18° de separación y hace la
        // elección forzada perfectamente discriminable).
        val distanceMm = ctx.distance.currentMm
        val separation = ctx.geometry.separationDeg(distanceMm, targetCount)
        val pxPerDeg = ctx.geometry.pxPerDeg(distanceMm)
        val enterRadius = (pxPerDeg * separation * 0.30f).coerceAtLeast(48f)
        val keepRadius = enterRadius * 1.45f

        val positions = if (targetCount == 2) listOf(1f / 6f, 5f / 6f) else listOf(1f / 6f, 0.5f, 5f / 6f)
        targets = chosen.mapIndexed { i, word ->
            SceneTarget(
                id = word,
                xPx = ctx.geometry.widthPx * positions[i],
                yPx = ctx.geometry.heightPx * 0.5f,
                enterRadiusPx = enterRadius,
                keepRadiusPx = keepRadius,
                label = word,
            )
        }
        ctx.scene.setTargets(targets)

        dwellMs = 0L
        lastFrameMs = 0L
        insideId = null
        firstFixationId = null
        tFirstFixationMs = null
        revisits = 0
        outOfBoundsMs = 0L
        visited.clear()
        armed = false
        gate.reset()
        channel.reset()
    }

    private fun voidTrial(reason: String) = recordTrial(selected = null, voidReason = reason)

    private fun recordTrial(selected: String?, voidReason: String?) {
        if (_trials.size >= ctx.trialsPlanned) return
        if (!armed && _trials.isNotEmpty()) return
        armed = false

        _trials.add(
            TrialRecord.Ar3(
                index = _trials.size + 1,
                at = System.currentTimeMillis(),
                thermalStatus = ctx.thermal(),
                // La separación CONSEGUIDA, no la nominal: pasa a ser covariable
                // del análisis en vez de un supuesto del protocolo.
                angularSeparationDeg = ctx.separationDeg(targetCount),
                mode = ctx.modeFor(instrumentPossible = true),
                voided = voidReason != null,
                voidReason = voidReason,
                targetId = targetId,
                targetCount = targetCount,
                firstFixationId = firstFixationId,
                tFirstFixationMs = tFirstFixationMs,
                selectedId = selected,
                dwellMs = dwellMs,
                revisits = revisits,
                pointerSource = pointer.kind,
                calibrationRmsPx = calibration.rmsPx,
                outOfBoundsMs = outOfBoundsMs,
            )
        )
        ctx.scene.hidePointer()
        if (_trials.size < ctx.trialsPlanned) nextTrial()
    }

    override fun onSessionResumed(pausedMs: Long) {
        synchronized(lock) {
            trialStartedMs += pausedMs
            // El hueco no es fijación: se corta la cadena de dt para que el
            // primer frame de vuelta no sume el tiempo que la app pasó detrás.
            lastFrameMs = 0L
        }
    }

    companion object {
        private const val TRIAL_TIMEOUT_MS = 15_000L
    }
}

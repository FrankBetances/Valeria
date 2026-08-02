package eu.futureforkids.valeria.ar.reward

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Valeria+ · Contrato de Feedback Visual Desacoplado.
 *
 * Es el principio rector del módulo entero, escrito una vez en vez de tres.
 *
 * En los seis bloques actuales el refuerzo va atado a la producción acústica: el
 * niño dice la palabra, el reconocedor la valida, aparece la estrella. Eso tiene
 * un coste clínico conocido —el niño con dislalia funcional escucha su propio
 * error y se frustra antes de haber consolidado el gesto motor—. Aquí ese lazo
 * se rompe: **el refuerzo visual 3D se condiciona exclusivamente a la conducta
 * motora objetivo**, y se premia el esfuerzo motor ANTES de exigir la fonación.
 */
sealed interface RewardState {
    data object Idle : RewardState
    /** Progreso continuo 0..1: el coche acelera GRADUALMENTE mientras se sostiene. */
    data class Charging(val progress: Float) : RewardState
    /** Criterio cumplido. `latencyMs` es el tiempo desde el primer cruce del umbral. */
    data class Fired(val latencyMs: Long) : RewardState
}

interface RewardChannel {
    /** Señal clínica normalizada 0..1. La calcula el ejercicio, no este canal. */
    fun onSignal(value: Float, tCaptureMs: Long)
    val reward: StateFlow<RewardState>
    fun reset()
}

/**
 * Implementación con las tres reglas que definen «condicionada»:
 *
 * 1. **Contingencia estricta.** `Fired` solo puede emitirse desde `Charging` con
 *    `progress == 1f`. No hay ruta desde el paso del tiempo, desde un toque del
 *    adulto ni desde el reconocedor de voz. Es una invariante del código, no una
 *    convención: no existe ningún método público que fuerce el disparo.
 *
 * 2. **Progreso continuo, no binario.** El niño ve el coche acelerar *mientras*
 *    sostiene la postura. Un refuerzo todo-o-nada a los 1,5 s no enseña qué está
 *    haciendo bien; uno proporcional, sí. Es el punto pedagógico central.
 *
 * 3. **Histéresis obligatoria.** Umbral de entrada Θ_on y de mantenimiento
 *    Θ_off < Θ_on, y al salir el progreso DECAE (≈2× la velocidad de carga) en
 *    vez de caer a cero. Reiniciar a cero en un niño de 4 años es garantizar que
 *    no lo consigue nunca.
 */
class HysteresisRewardChannel(
    /** Umbral de entrada, en la escala 0..1 de la señal del ejercicio. */
    private val thetaOn: Float = 0.55f,
    /** Umbral de mantenimiento. Debe ser menor que el de entrada. */
    private val thetaOff: Float = 0.45f,
    /** Tiempo de sostén exigido, en ms. Lo fija el adulto en el Panel. */
    private val holdMs: Long,
    /** Múltiplo de la velocidad de carga al que decae el progreso al salir. */
    private val decayFactor: Float = 2f,
) : RewardChannel {

    private val _reward = MutableStateFlow<RewardState>(RewardState.Idle)
    override val reward: StateFlow<RewardState> = _reward.asStateFlow()

    private var progress = 0f
    private var lastTMs = 0L
    private var inside = false
    private var firstCrossMs = 0L
    private var fired = false

    /** Cuántas veces ha entrado y salido del umbral antes de conseguirlo. */
    var attempts = 0
        private set

    /** Sostén más largo ininterrumpido, en ms. Es el dato clínico de AR-1. */
    var holdMaxMs = 0L
        private set

    /** Suma de todo el tiempo por encima del umbral de mantenimiento. */
    var holdTotalMs = 0L
        private set

    private var currentHoldMs = 0L

    override fun onSignal(value: Float, tCaptureMs: Long) {
        if (fired) return

        val dt = if (lastTMs == 0L) 0L else (tCaptureMs - lastTMs).coerceIn(0L, 200L)
        lastTMs = tCaptureMs

        val wasInside = inside
        inside = if (inside) value >= thetaOff else value >= thetaOn

        if (inside && !wasInside) {
            attempts += 1
            if (firstCrossMs == 0L) firstCrossMs = tCaptureMs
        }

        if (dt > 0L) {
            if (inside) {
                progress = (progress + dt.toFloat() / holdMs).coerceAtMost(1f)
                currentHoldMs += dt
                holdTotalMs += dt
                if (currentHoldMs > holdMaxMs) holdMaxMs = currentHoldMs
            } else {
                progress = (progress - decayFactor * dt.toFloat() / holdMs).coerceAtLeast(0f)
                currentHoldMs = 0L
            }
        }

        _reward.value = when {
            // La ÚNICA ruta a Fired: venir cargando y llegar a 1.0.
            progress >= 1f -> {
                fired = true
                RewardState.Fired(if (firstCrossMs == 0L) 0L else tCaptureMs - firstCrossMs)
            }
            progress > 0f -> RewardState.Charging(progress)
            else -> RewardState.Idle
        }
    }

    override fun reset() {
        progress = 0f
        lastTMs = 0L
        inside = false
        firstCrossMs = 0L
        fired = false
        attempts = 0
        holdMaxMs = 0L
        holdTotalMs = 0L
        currentHoldMs = 0L
        _reward.value = RewardState.Idle
    }
}

/**
 * Canal de recompensa de evento: para AR-2 y AR-3, donde el criterio no es
 * sostener una señal continua sino que ocurra una cosa concreta (un giro
 * correcto dentro de ventana, una fijación completada). Mantiene el mismo
 * contrato para que la escena 3D no distinga de dónde viene el refuerzo.
 */
class EventRewardChannel : RewardChannel {
    private val _reward = MutableStateFlow<RewardState>(RewardState.Idle)
    override val reward: StateFlow<RewardState> = _reward.asStateFlow()

    override fun onSignal(value: Float, tCaptureMs: Long) {
        _reward.value = if (value > 0f) RewardState.Charging(value.coerceAtMost(1f)) else RewardState.Idle
    }

    /** Lo llama el ejercicio cuando su criterio —y solo su criterio— se cumple. */
    fun fire(latencyMs: Long) { _reward.value = RewardState.Fired(latencyMs) }

    override fun reset() { _reward.value = RewardState.Idle }
}

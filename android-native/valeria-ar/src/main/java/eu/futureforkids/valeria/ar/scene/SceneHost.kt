package eu.futureforkids.valeria.ar.scene

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import eu.futureforkids.valeria.ar.reward.RewardState

/**
 * Valeria+ · Capa de escena 3D.
 *
 * Se declara como INTERFAZ desde el primer día aunque hoy solo exista una
 * implementación (§13.4 del plan). Cuando llegue iOS, la capa de recompensa son
 * ~200 líneas de RealityKit que cumplen este mismo contrato: cargar un modelo,
 * reproducir una animación, trasladar en Z y girar 360°. Nada más.
 *
 * Lo que NO hace: decidir. La escena consume `RewardState` y lo dibuja; no sabe
 * qué señal clínica lo produjo ni tiene forma de disparar un refuerzo por su
 * cuenta. Esa asimetría es lo que hace auditable la contingencia estricta.
 */
interface SceneHost {
    /** Modelo a mostrar en el ejercicio en curso. */
    fun setModel(model: ArModel)
    /** Estado de refuerzo. Es la ÚNICA entrada de la escena. */
    fun setReward(state: RewardState)
    /** Dianas de AR-3, en píxeles de pantalla ya resueltos desde grados. */
    fun setTargets(targets: List<SceneTarget>)
    /** Puntero visible (anillo de progreso). null lo oculta. */
    fun setPointer(x: Float, y: Float, dwellProgress: Float)
}

/**
 * Los modelos del bloque. Los GLB viven en `assets/models/` (obra propia, CC0,
 * generados por `npm run build:ar-models`) y el config plugin los copia a los
 * assets del módulo en cada prebuild.
 *
 * Estos nombres de animación son un CONTRATO, no una convención: los verifica
 * `npm run check:ar-models` contra los ficheros reales. Una reexportación que
 * renombre `celebrate` a `Celebrate` compila, carga el modelo y deja al niño sin
 * refuerzo — sin error visible en ninguna parte.
 * Contrato de assets y licencias: `assets/models/README.md`.
 */
enum class ArModel(val asset: String, val animation: String?) {
    /** AR-1 · la traslación en Z la hace el código; `celebrate` es la meta. */
    CAR("models/coche.glb", "celebrate"),
    /** AR-2 · celebración solo ante giro correcto dentro de ventana. */
    DOG("models/perro.glb", "celebrate"),
    /** AR-3 · giro de 360° al confirmar la selección. */
    APPLE("models/manzana.glb", "spin360"),
    /** AR-3 · distractores. Mismo giro: nada en el movimiento delata la diana. */
    BALL("models/pelota.glb", "spin360"),
    SHOE("models/zapato.glb", "spin360"),
    NONE("", null),
}

data class SceneTarget(
    val id: String,
    val xPx: Float,
    val yPx: Float,
    /** Radio de ENTRADA, menor que el de mantenimiento (doble hitbox). */
    val enterRadiusPx: Float,
    val keepRadiusPx: Float,
    val label: String,
)

/** Estado observable de la escena, compartido entre el ejercicio y el Composable. */
class SceneState : SceneHost {
    var model by mutableStateOf(ArModel.NONE)
        private set
    var reward by mutableStateOf<RewardState>(RewardState.Idle)
        private set
    var targets by mutableStateOf<List<SceneTarget>>(emptyList())
        private set
    var pointer by mutableStateOf<Triple<Float, Float, Float>?>(null)
        private set

    override fun setModel(model: ArModel) { this.model = model }
    override fun setReward(state: RewardState) { this.reward = state }
    override fun setTargets(targets: List<SceneTarget>) { this.targets = targets }
    override fun setPointer(x: Float, y: Float, dwellProgress: Float) {
        pointer = Triple(x, y, dwellProgress)
    }
    fun hidePointer() { pointer = null }
}

/**
 * Render de la escena sobre el preview de la cámara.
 *
 * Es **AR de espejo** y conviene decirlo en voz alta: no se puede hacer AR de
 * mundo real (cámara trasera + ARCore) y seguimiento facial (cámara frontal) a
 * la vez en un móvil típico —es una sola sesión de cámara— y los tres
 * ejercicios necesitan la cara del niño. El coche no circula por la mesa real:
 * circula sobre la imagen del niño. Corolario técnico: sin *world tracking* no
 * hace falta ARCore, y eso ahorra la lista de dispositivos certificados, el
 * permiso de ubicación y decenas de MB de APK.
 *
 * La capa de Filament (SceneView 4.25.0) se monta en `ValeriaArSceneView`. Aquí
 * va la sobreimpresión 2D —anillo de progreso, dianas, puntero—, que es lo que
 * el niño necesita para entender qué está consiguiendo.
 */
@Composable
fun RewardOverlay(state: SceneState, modifier: Modifier = Modifier) {
    val progress = when (val r = state.reward) {
        is RewardState.Charging -> r.progress
        is RewardState.Fired -> 1f
        else -> 0f
    }
    val fired = state.reward is RewardState.Fired

    Box(modifier.fillMaxSize()) {
        Canvas(Modifier.fillMaxSize()) {
            // Dianas de AR-3 con su anillo de acumulación. Sin feedback de
            // acumulación el *dwell* es invisible y frustrante: el niño no sabe
            // que lo está consiguiendo.
            state.targets.forEach { t ->
                drawCircle(
                    color = Color.White.copy(alpha = 0.22f),
                    radius = t.keepRadiusPx,
                    center = Offset(t.xPx, t.yPx),
                )
            }

            state.pointer?.let { (x, y, dwell) ->
                drawCircle(color = Color.White.copy(alpha = 0.9f), radius = 10f, center = Offset(x, y))
                if (dwell > 0f) {
                    drawArc(
                        color = Color(0xFF00C4BE),
                        startAngle = -90f,
                        sweepAngle = 360f * dwell.coerceIn(0f, 1f),
                        useCenter = false,
                        topLeft = Offset(x - 34f, y - 34f),
                        size = androidx.compose.ui.geometry.Size(68f, 68f),
                        style = androidx.compose.ui.graphics.drawscope.Stroke(width = 7f),
                    )
                }
            }

            // Barra de carga del refuerzo continuo (AR-1). Verde de marca al
            // cargar, dorada al disparar: el cambio de color ES la celebración
            // mientras no haya modelo 3D cargado.
            if (progress > 0f) {
                val w = size.width * 0.6f
                val x0 = (size.width - w) / 2f
                val y0 = size.height - 48f
                drawRoundRect(
                    color = Color.White.copy(alpha = 0.25f),
                    topLeft = Offset(x0, y0),
                    size = androidx.compose.ui.geometry.Size(w, 14f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(7f, 7f),
                )
                drawRoundRect(
                    color = if (fired) Color(0xFFFACC15) else Color(0xFF00C4BE),
                    topLeft = Offset(x0, y0),
                    size = androidx.compose.ui.geometry.Size(w * progress, 14f),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(7f, 7f),
                )
            }
        }
    }
}

// El montaje de Filament vive en ValeriaArSceneView.kt: es el único fichero del
// módulo que conoce la API de SceneView, y se aísla ahí para que el día que
// cambie —o que en iOS sea RealityKit— se reescriba una sola pieza y no el
// bloque entero.

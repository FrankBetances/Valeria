package eu.futureforkids.valeria.ar.scene

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import eu.futureforkids.valeria.ar.reward.RewardState
import io.github.sceneview.Scene
import io.github.sceneview.node.ModelNode
import io.github.sceneview.rememberEngine
import io.github.sceneview.rememberEnvironmentLoader
import io.github.sceneview.rememberModelLoader
import io.github.sceneview.math.Position

/**
 * Valeria+ · Montaje de Filament sobre el preview de la cámara.
 *
 * Este fichero es la ÚNICA parte del módulo que conoce la API de SceneView. Si
 * mañana cambia —o si en iOS pasa a ser RealityKit— se reescribe esto y nada
 * más: el resto del bloque habla con `SceneState`, que no sabe qué motor hay
 * debajo. Son unas cien líneas a propósito; la capa de recompensa que este
 * módulo necesita es diminuta (cargar un modelo, reproducir una animación,
 * trasladar en Z y girar 360°) y toda la inteligencia vive en el ejercicio.
 *
 * ── Resiliencia en caliente ────────────────────────────────────────────────
 * Cada llamada al motor va envuelta: un GLB que no está, un dispositivo que no
 * puede crear el contexto de Filament o una animación que no existe **no
 * interrumpen la sesión**. Lo que ocurre es que el niño ve la sobreimpresión 2D
 * —barra de carga, anillo de fijación, dianas— y el ejercicio se sigue jugando
 * y midiendo igual. Un fallo de render nunca puede costarle a una familia una
 * sesión de terapia.
 *
 * ── Nota de verificación (Fase 3) ──────────────────────────────────────────
 * Escrito contra la API Compose de `io.github.sceneview:sceneview:4.25.0`. Es
 * el punto del módulo con más superficie de terceros y el primero que hay que
 * comprobar al compilar contra el SDK real.
 */
@Composable
fun ValeriaArSceneView(state: SceneState, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize()) {
        if (state.model != ArModel.NONE) {
            FilamentLayer(state)
        }
        // La sobreimpresión 2D va SIEMPRE encima, tenga o no escena 3D debajo:
        // el anillo de progreso y las dianas son información del ejercicio, no
        // decoración, y no pueden depender de que el motor 3D haya arrancado.
        RewardOverlay(state, Modifier.fillMaxSize())
    }
}

@Composable
private fun FilamentLayer(state: SceneState) {
    val engine = rememberEngine()
    val modelLoader = rememberModelLoader(engine)
    val environmentLoader = rememberEnvironmentLoader(engine)

    // El nodo se reconstruye solo cuando cambia el modelo del ejercicio, no en
    // cada frame de recomposición: crear un ModelNode por frame a 30 fps es la
    // forma más rápida de fundir un teléfono de gama media.
    val modelNode = remember(state.model) {
        runCatching {
            ModelNode(
                modelInstance = modelLoader.createModelInstance(assetFileLocation = state.model.asset),
                // Escala a una altura conocida: los cinco GLB están modelados a
                // 1 unidad = 1 metro y el encuadre de la cámara frontal es el
                // mismo para los tres ejercicios.
                scaleToUnits = 0.5f,
            )
        }.getOrNull()
    }

    DisposableEffect(modelNode) {
        onDispose { runCatching { modelNode?.destroy() } }
    }

    // Refuerzo → transformación. Es la única entrada de la escena, y es de una
    // sola dirección: nada de lo que ocurra aquí puede disparar un refuerzo.
    LaunchedEffect(state.reward, modelNode) {
        val node = modelNode ?: return@LaunchedEffect
        when (val reward = state.reward) {
            is RewardState.Idle -> runCatching {
                node.position = Position(0f, 0f, 0f)
                node.stopAnimation()
            }
            is RewardState.Charging -> runCatching {
                // AR-1: el coche avanza en Z de forma PROPORCIONAL al sostén.
                // Es el punto pedagógico central del módulo —el niño ve que lo
                // está consiguiendo mientras lo consigue—, así que la posición
                // se escribe en cada actualización y no solo al final.
                node.position = Position(0f, 0f, -reward.progress * 1.6f)
            }
            is RewardState.Fired -> runCatching {
                state.model.animation?.let { node.playAnimation(it, loop = false) }
            }
        }
    }

    Scene(
        modifier = Modifier.fillMaxSize(),
        engine = engine,
        modelLoader = modelLoader,
        environmentLoader = environmentLoader,
        childNodes = listOfNotNull(modelNode),
        // Fondo transparente: debajo está el preview de la cámara frontal. Es
        // AR de espejo (§3.3 del plan), no AR de mundo real: el coche circula
        // sobre la imagen del niño, no sobre la mesa.
        isOpaque = false,
    )
}

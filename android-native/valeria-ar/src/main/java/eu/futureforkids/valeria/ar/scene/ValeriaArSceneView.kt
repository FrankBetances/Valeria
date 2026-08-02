package eu.futureforkids.valeria.ar.scene

import android.content.Context
import android.graphics.PixelFormat
import android.view.Choreographer
import android.view.SurfaceView
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import com.google.android.filament.Colors
import com.google.android.filament.EntityManager
import com.google.android.filament.LightManager
import com.google.android.filament.Renderer
import com.google.android.filament.View as FilamentView
import com.google.android.filament.utils.ModelViewer
import com.google.android.filament.utils.Utils
import eu.futureforkids.valeria.ar.reward.RewardState
import java.nio.ByteBuffer

/**
 * Valeria+ · Escena 3D sobre el preview de la cámara, con Filament directo.
 *
 * ── Por qué Filament y no SceneView ────────────────────────────────────────
 * El plan proponía `io.github.sceneview`, que es un envoltorio cómodo de
 * Filament. No se puede usar aquí: todas sus versiones se compilan con Kotlin
 * ≥ 2.3 y este proyecto va con **Kotlin 2.1.20** (Expo SDK 54), así que el
 * compilador no puede leer sus metadatos. Y arrastra `compose-bom:2026.06.01`,
 * que subiría Compose en toda la app como efecto colateral de un módulo nuevo.
 * Filament es la capa que hay debajo, está en Maven Central y `filament-utils`
 * se compila con Kotlin 2.0.21 —más antiguo que el nuestro, luego legible—.
 * Cuesta unas decenas de líneas y elimina los dos problemas de raíz.
 *
 * ── Este fichero es la frontera ────────────────────────────────────────────
 * Es la ÚNICA parte del módulo que conoce el motor 3D. El resto del bloque
 * habla con `SceneState`, que no sabe qué hay debajo. Cuando llegue iOS, lo que
 * se reescribe es esto —unas 200 líneas de RealityKit— y nada más.
 *
 * ── Resiliencia en caliente ────────────────────────────────────────────────
 * Todo va envuelto en `runCatching`: un GLB que falta, un teléfono que no puede
 * crear el contexto de Filament o una animación con otro nombre **no
 * interrumpen la sesión**. El niño ve la sobreimpresión 2D —barra de carga,
 * anillo de fijación, dianas— y el ejercicio se juega y se mide igual. Un fallo
 * de render nunca puede costarle a una familia una sesión de terapia.
 */
@Composable
fun ValeriaArSceneView(state: SceneState, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize()) {
        if (state.model != ArModel.NONE) {
            FilamentLayer(state)
        }
        // La sobreimpresión 2D va SIEMPRE encima, haya o no escena 3D debajo:
        // el anillo de progreso y las dianas son información del ejercicio, no
        // decoración, y no pueden depender de que el motor 3D haya arrancado.
        RewardOverlay(state, Modifier.fillMaxSize())
    }
}

@Composable
private fun FilamentLayer(state: SceneState) {
    val context = LocalContext.current
    val stage = remember { FilamentStage() }

    AndroidView(
        factory = { ctx ->
            SurfaceView(ctx).also { surface ->
                // Encima del preview de la cámara y con alfa real: es AR de
                // espejo, el niño se ve a sí mismo y el modelo se compone sobre
                // su imagen. Sin translucidez, la escena taparía la cara.
                surface.setZOrderOnTop(true)
                surface.holder.setFormat(PixelFormat.TRANSLUCENT)
                stage.attach(surface)
            }
        },
        modifier = Modifier.fillMaxSize(),
    )

    LaunchedEffect(state.model) { stage.loadModel(context, state.model) }

    // Refuerzo → transformación. Entrada de una sola dirección: nada de lo que
    // ocurra en la escena puede disparar un refuerzo.
    LaunchedEffect(state.reward, state.model) {
        stage.applyReward(state.reward, state.model)
    }

    DisposableEffect(Unit) { onDispose { stage.release() } }
}

/**
 * Ciclo de vida de Filament, fuera de Compose. Compose describe QUÉ se ve; el
 * motor 3D tiene su propio reloj (Choreographer) y su propia memoria nativa, y
 * mezclar las dos cosas en un Composable es la forma habitual de filtrar
 * entidades entre recomposiciones.
 */
private class FilamentStage {

    private var viewer: ModelViewer? = null
    private var choreographer: Choreographer? = null
    private var frameCallback: Choreographer.FrameCallback? = null
    private var lightEntity = 0

    /** Índice de la animación en curso y cuándo empezó, para avanzarla por frame. */
    private var animationIndex = -1
    private var animationStartedNanos = 0L
    private var animationLoop = false

    fun attach(surface: SurfaceView) {
        runCatching {
            ensureNativeLibrary()
            val modelViewer = ModelViewer(surface)
            viewer = modelViewer

            // Fondo transparente de verdad: sin skybox y limpiando con alfa 0.
            modelViewer.scene.skybox = null
            modelViewer.view.blendMode = FilamentView.BlendMode.TRANSLUCENT
            modelViewer.renderer.clearOptions = Renderer.ClearOptions().apply {
                clear = true
                // double[] y no float[]: es la firma real de Filament 1.72.1.
                clearColor = doubleArrayOf(0.0, 0.0, 0.0, 0.0)
            }

            // Una luz direccional cálida en vez de un mapa de entorno: se
            // consigue con código y sin un asset IBL de varios MB, que en un
            // bloque con presupuesto de +25 MB de descarga no es un detalle.
            lightEntity = EntityManager.get().create()
            val (r, g, b) = Colors.cct(6_500f)
            LightManager.Builder(LightManager.Type.DIRECTIONAL)
                .color(r, g, b)
                .intensity(110_000f)
                .direction(0.3f, -1f, -0.8f)
                .castShadows(false)
                .build(modelViewer.engine, lightEntity)
            modelViewer.scene.addEntity(lightEntity)

            startFrameLoop()
        }
    }

    fun loadModel(context: Context, model: ArModel) {
        val modelViewer = viewer ?: return
        if (model == ArModel.NONE || model.asset.isEmpty()) return
        runCatching {
            val bytes = context.assets.open(model.asset).use { it.readBytes() }
            val buffer = ByteBuffer.allocateDirect(bytes.size).apply {
                put(bytes)
                rewind()
            }
            modelViewer.loadModelGlb(buffer)
            // Los cinco GLB están modelados a 1 unidad = 1 metro, pero el
            // encuadre de la cámara frontal es el mismo para los tres
            // ejercicios: normalizar al cubo unidad los deja a un tamaño
            // comparable sin depender de cómo los exportó nadie.
            modelViewer.transformToUnitCube()
            animationIndex = -1
        }
    }

    fun applyReward(reward: RewardState, model: ArModel) {
        val modelViewer = viewer ?: return
        runCatching {
            when (reward) {
                is RewardState.Idle -> {
                    setTranslationZ(0f)
                    animationIndex = -1
                }
                is RewardState.Charging -> {
                    // AR-1: el coche avanza en Z de forma PROPORCIONAL al
                    // sostén. Es el punto pedagógico central del módulo —el
                    // niño ve que lo está consiguiendo mientras lo consigue—,
                    // así que la posición se escribe en cada actualización y no
                    // solo al final.
                    setTranslationZ(-reward.progress * 1.6f)
                    animationIndex = -1
                }
                is RewardState.Fired -> {
                    setTranslationZ(-1.6f)
                    model.animation?.let { play(it) }
                }
            }
        }
    }

    /** Busca la animación POR NOMBRE, que es el contrato de `assets/models`. */
    private fun play(name: String, loop: Boolean = false) {
        val animator = viewer?.animator ?: return
        for (i in 0 until animator.animationCount) {
            if (animator.getAnimationName(i) == name) {
                animationIndex = i
                animationStartedNanos = System.nanoTime()
                animationLoop = loop
                return
            }
        }
        // Nombre no encontrado: no se reproduce nada y el ejercicio sigue. El
        // desajuste lo detecta antes `npm run check:ar-models`, que compara
        // estos nombres con los .glb reales.
        animationIndex = -1
    }

    private fun setTranslationZ(z: Float) {
        val modelViewer = viewer ?: return
        val asset = modelViewer.asset ?: return
        val transformManager = modelViewer.engine.transformManager
        val instance = transformManager.getInstance(asset.root)
        if (instance == 0) return
        // Matriz columna-mayor 4×4 con solo traslación en Z.
        transformManager.setTransform(
            instance,
            floatArrayOf(
                1f, 0f, 0f, 0f,
                0f, 1f, 0f, 0f,
                0f, 0f, 1f, 0f,
                0f, 0f, z, 1f,
            ),
        )
    }

    private fun startFrameLoop() {
        val modelViewer = viewer ?: return
        val chore = Choreographer.getInstance()
        choreographer = chore
        val callback = object : Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                choreographer?.postFrameCallback(this)
                runCatching {
                    val animator = modelViewer.animator
                    if (animator != null && animationIndex >= 0) {
                        val elapsed = (frameTimeNanos - animationStartedNanos) / 1_000_000_000f
                        val duration = animator.getAnimationDuration(animationIndex)
                        val time = if (animationLoop && duration > 0f) elapsed % duration else elapsed
                        if (!animationLoop && duration > 0f && elapsed > duration) {
                            animationIndex = -1
                        } else {
                            animator.applyAnimation(animationIndex, time)
                            animator.updateBoneMatrices()
                        }
                    }
                    modelViewer.render(frameTimeNanos)
                }
            }
        }
        frameCallback = callback
        chore.postFrameCallback(callback)
    }

    fun release() {
        runCatching {
            frameCallback?.let { choreographer?.removeFrameCallback(it) }
            frameCallback = null
            choreographer = null
            viewer?.let { modelViewer ->
                if (lightEntity != 0) {
                    modelViewer.scene.removeEntity(lightEntity)
                    modelViewer.engine.destroyEntity(lightEntity)
                    EntityManager.get().destroy(lightEntity)
                    lightEntity = 0
                }
                modelViewer.destroyModel()
            }
            viewer = null
        }
    }

    private companion object {
        @Volatile
        private var nativeLibraryLoaded = false

        /** Filament carga su librería nativa una vez por proceso. */
        fun ensureNativeLibrary() {
            if (nativeLibraryLoaded) return
            synchronized(this) {
                if (!nativeLibraryLoaded) {
                    Utils.init()
                    nativeLibraryLoaded = true
                }
            }
        }
    }
}

package eu.futureforkids.valeria.ar.scene

import android.content.Context
import android.view.Choreographer
import android.view.TextureView
import android.view.View
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
import com.google.android.filament.Engine
import com.google.android.filament.EntityManager
import com.google.android.filament.LightManager
import com.google.android.filament.Renderer
import com.google.android.filament.View as FilamentView
import com.google.android.filament.android.UiHelper
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
 *
 * ── TextureView y no SurfaceView ───────────────────────────────────────────
 * Un `SurfaceView` no dibuja en la ventana: dibuja en una superficie propia,
 * fuera de ella, y recorta un agujero transparente para dejarse ver, siempre en
 * un sublayer por DEBAJO de la ventana. Como el espejo se pinta ahora dentro de
 * la ventana, desde los frames de `ImageAnalysis` (ver `mirrorFrame` en
 * `ValeriaArActivity`), un `SurfaceView` quedaría tapado por él y Lúa no se
 * vería. Con `TextureView` la escena es una vista normal de la jerarquía y el
 * orden de dibujo es el que se lee en el Composable:
 *
 *     espejo de cámara → escena 3D → sobreimpresión 2D → texto
 *
 * Es una consecuencia, no una elección: si algún día el espejo vuelve al
 * `Preview` por hardware —decisión abierta, ver el comentario de `mirrorFrame`—,
 * esta pieza debería volver a `SurfaceView` con `isMediaOverlay = true`, que
 * ahorra la copia por GPU que cuesta un TextureView en cada frame.
 *
 * ── `isOpaque = false`, y esto sí es un fallo real corregido ───────────────
 * Es lo que hace que `attachTo()` ponga `textureView.isOpaque = false` y que el
 * swapchain se cree con `CONFIG_TRANSPARENT`. El código original ponía
 * `setZOrderOnTop(true)` y `PixelFormat.TRANSLUCENT` sobre el holder por su
 * cuenta, y no servía de nada: `UiHelper.attachTo()` sobrescribe las dos cosas
 * al engancharse y solo pide un swapchain transparente si `isOpaque` es
 * `false`. Con el helper por defecto la escena se dibuja sobre fondo opaco y
 * tapa la cámara entera. Eso habría roto la composición en cualquier teléfono,
 * con emulador o sin él.
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
        // La transparencia NO se toca aquí: la fija `UiHelper` dentro de
        // `stage.attach()` a partir de `isOpaque`, y sobrescribiría cualquier
        // cosa que pusiéramos antes. Ponerlo en los dos sitios es la forma de
        // que un día dejen de coincidir sin que nadie se entere.
        factory = { ctx -> TextureView(ctx).also { stage.attach(it) } },
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

    /**
     * Cierre en un solo sentido. `ModelViewer` se AUTODESTRUYE cuando su
     * `TextureView` sale de la ventana —registra un `OnAttachStateChangeListener`
     * que llama a `destroy()`, y `destroy()` incluye `engine.destroy()`—, así que
     * a partir de ese instante cualquier `render()`, `loadModel()` o
     * `applyReward()` es una llamada nativa sobre un motor liberado: un cierre
     * inesperado sin excepción de Java que `runCatching` no puede atrapar. Esta
     * bandera es lo que garantiza que no ocurra.
     */
    @Volatile private var released = false
    private var attachedToWindow = false
    private var everAttached = false

    /** Índice de la animación en curso y cuándo empezó, para avanzarla por frame. */
    private var animationIndex = -1
    private var animationStartedNanos = 0L
    private var animationLoop = false

    fun attach(surface: TextureView) {
        runCatching {
            ensureNativeLibrary()

            // `isOpaque = false` es lo que hace que la escena se componga sobre
            // el espejo en vez de taparlo: pone `textureView.isOpaque = false` y
            // crea el swapchain con CONFIG_TRANSPARENT. Tiene que fijarse ANTES
            // de `attachTo()`, que es lo que hace el constructor de ModelViewer.
            val uiHelper = UiHelper(UiHelper.ContextErrorPolicy.DONT_CHECK).apply {
                isOpaque = false
            }
            val modelViewer = ModelViewer(surface, Engine.create(), uiHelper)
            viewer = modelViewer
            attachedToWindow = surface.isAttachedToWindow
            everAttached = attachedToWindow
            surface.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
                override fun onViewAttachedToWindow(v: View) {
                    attachedToWindow = true
                    everAttached = true
                }
                // Este listener se registra DESPUÉS del de ModelViewer, así que
                // cuando llega aquí el motor ya está destruido: lo único que se
                // puede hacer es parar el reloj y soltar la referencia.
                override fun onViewDetachedFromWindow(v: View) {
                    attachedToWindow = false
                    released = true
                    stopFrameLoop()
                    viewer = null
                    if (lightEntity != 0) {
                        runCatching { EntityManager.get().destroy(lightEntity) }
                        lightEntity = 0
                    }
                }
            })

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
        if (released) return
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
        if (released || viewer == null) return
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
        if (released) return
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
        if (viewer == null) return
        val chore = Choreographer.getInstance()
        choreographer = chore
        val callback = object : Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                // El motor puede haberse destruido entre dos vsyncs (la ventana
                // se cerró). Se comprueba ANTES de repostar y ANTES de tocarlo:
                // renderizar sobre un motor liberado cierra la app en nativo.
                if (released) return
                val modelViewer = viewer ?: return
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

    private fun stopFrameLoop() {
        frameCallback?.let { cb -> runCatching { choreographer?.removeFrameCallback(cb) } }
        frameCallback = null
        choreographer = null
    }

    /**
     * Cierre desde Compose (`onDispose`).
     *
     * La regla es **destruir exactamente una vez**. `ModelViewer.destroy()` no es
     * idempotente: la segunda llamada entra en un `ResourceLoader` ya liberado con
     * el puntero nativo a cero. Como el propio ModelViewer destruye el motor al
     * salir la vista de la ventana, aquí solo se suelta la luz —que es nuestra y
     * él no conoce— y se deja el motor en sus manos. El único caso en que hay que
     * destruirlo a mano es el de una vista que nunca llegó a entrar en la
     * ventana: ahí ese listener no se va a disparar jamás.
     *
     * Lo que ya no se hace es `destroyModel()` a secas, que era todo lo que
     * había: suelta el GLB y deja vivos el motor, el renderer, el swapchain y el
     * contexto EGL de la sesión entera.
     */
    fun release() {
        if (released) return
        released = true
        stopFrameLoop()
        val modelViewer = viewer
        viewer = null
        if (modelViewer != null) {
            if (attachedToWindow) {
                runCatching {
                    if (lightEntity != 0) {
                        modelViewer.scene.removeEntity(lightEntity)
                        modelViewer.engine.destroyEntity(lightEntity)
                    }
                }
            } else if (!everAttached) {
                runCatching { modelViewer.destroy() }
            }
        }
        if (lightEntity != 0) {
            runCatching { EntityManager.get().destroy(lightEntity) }
            lightEntity = 0
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

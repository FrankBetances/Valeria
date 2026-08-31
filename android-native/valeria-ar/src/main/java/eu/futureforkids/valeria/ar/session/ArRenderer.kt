package eu.futureforkids.valeria.ar.session

import android.opengl.GLES20
import android.opengl.GLSurfaceView
import com.google.ar.core.Frame
import javax.microedition.khronos.egl.EGLConfig
import javax.microedition.khronos.opengles.GL10

/**
 * Valeria+ · El bucle de render de ARCore.
 *
 * ── Por qué esto es UNA clase y no cuatro ──────────────────────────────────
 *
 * El módulo anterior repartía la misma responsabilidad entre un executor de
 * análisis, un `Choreographer` de Filament, un `UiHelper` con su swapchain y el
 * ciclo de vida de la Activity. Cuatro relojes y tres hilos para dibujar una
 * cámara. La lista de defectos del README es, casi entera, la consecuencia:
 * motor sin destruir, contexto EGL vivo, executor cerrado en mal orden, mapas
 * de marcas de tiempo tocados por dos hilos.
 *
 * Aquí hay **un solo hilo** —el de GL, que crea y gestiona `GLSurfaceView`— y
 * un solo reloj —`onDrawFrame`—. La sesión de ARCore, el dibujo del espejo y la
 * entrega del frame a MediaPipe ocurren los tres ahí, en ese orden, sin
 * coordinación entre hilos porque no hay dos hilos que coordinar.
 *
 * [onFrame] se llama en el hilo de GL. Quien lo implemente no debe bloquear:
 * lo que tarde aquí, lo pierde el espejo.
 */
class ArRenderer(
    private val session: ArCoreSession,
    private val onFrame: (Frame) -> Unit,
    private val onGlError: (String) -> Unit,
) : GLSurfaceView.Renderer {

    private val background = CameraBackgroundRenderer()

    /**
     * La textura hay que declarársela a ARCore DESPUÉS de crearla y ANTES del
     * primer `update()`, y el contexto GL puede recrearse por debajo (bloqueo de
     * pantalla, cambio de app). Este flag hace que se vuelva a declarar en cuanto
     * eso pasa, en vez de dejar a ARCore escribiendo en una textura muerta —que
     * se ve como un espejo negro y no da ningún error.
     */
    private var textureBound = false

    /** Ancho y alto de la superficie, para `setDisplayGeometry`. */
    private var surfaceWidth = 0
    private var surfaceHeight = 0
    private var displayRotation = 0

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        GLES20.glClearColor(0f, 0f, 0f, 1f)
        try {
            background.createOnGlThread()
            textureBound = false
        } catch (e: Throwable) {
            onGlError(e.message ?: e.javaClass.simpleName)
        }
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        GLES20.glViewport(0, 0, width, height)
        surfaceWidth = width
        surfaceHeight = height
        applyDisplayGeometry()
    }

    /**
     * Le dice a ARCore cómo está puesta la pantalla. Es lo que sustituye al
     * `targetRotation` de CameraX que había que acordarse de actualizar a mano
     * en `onConfigurationChanged` — y que, olvidado, dejaba la imagen boca abajo
     * al girar el teléfono 180°.
     */
    fun setDisplayRotation(rotation: Int) {
        displayRotation = rotation
        applyDisplayGeometry()
    }

    private fun applyDisplayGeometry() {
        if (surfaceWidth == 0 || surfaceHeight == 0) return
        session.session?.setDisplayGeometry(displayRotation, surfaceWidth, surfaceHeight)
    }

    override fun onDrawFrame(gl: GL10?) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)

        val s = session.session ?: return
        if (!textureBound) {
            if (background.textureId == -1) return
            s.setCameraTextureName(background.textureId)
            textureBound = true
        }

        val frame = session.update() ?: return
        background.draw(frame)
        onFrame(frame)
    }

    /** El contexto GL se ha ido (pausa). La próxima creación rehará la textura. */
    fun onContextLost() {
        textureBound = false
    }
}

package eu.futureforkids.valeria.ar.session

import android.opengl.GLES20
import android.opengl.GLSurfaceView
import com.google.ar.core.Frame
import com.google.ar.core.Session
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

    /**
     * Ancho y alto de la superficie. Los escribe `onSurfaceChanged` y los lee
     * `applyPendingGeometry`, los dos en el hilo de GL: no son estado
     * compartido y por eso no llevan `@Volatile`.
     */
    private var surfaceWidth = 0
    private var surfaceHeight = 0

    /**
     * La rotación de la pantalla es lo ÚNICO que entra desde fuera del hilo de
     * GL: la trae `onConfigurationChanged`, que corre en el de UI. Por eso no se
     * aplica ahí.
     *
     * Escribirla directamente sobre la sesión desde el hilo de UI era volver a
     * tener dos hilos hablándole a ARCore —`setDisplayGeometry` mientras el de
     * GL está dentro de `update()`— y tres enteros normales leídos desde el
     * otro lado sin garantía de visibilidad. Girar el teléfono 180° a mitad de
     * sesión podía dejar la imagen boca abajo sin que nada avisara, que es
     * exactamente el defecto de `targetRotation` que la reescritura vino a
     * quitar, con otra ropa.
     *
     * Así que el hilo de UI solo deja un aviso —dos campos `@Volatile`— y el de
     * GL lo recoge al principio de la vuelta, ANTES de `update()`. Es lo mismo
     * que hace el `DisplayRotationHelper` de los samples de ARCore.
     */
    @Volatile private var pendingRotation = 0
    @Volatile private var viewportChanged = false

    /** La última rotación ya aplicada. Solo hilo de GL. */
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
        viewportChanged = true
    }

    /**
     * Le dice a ARCore cómo está puesta la pantalla. Es lo que sustituye al
     * `targetRotation` de CameraX que había que acordarse de actualizar a mano
     * en `onConfigurationChanged` — y que, olvidado, dejaba la imagen boca abajo
     * al girar el teléfono 180°.
     *
     * **Se llama desde el hilo de UI y no toca la sesión**: deja el aviso y se
     * va. Lo aplica el hilo de GL en la siguiente vuelta, que con
     * `RENDERMODE_CONTINUOUSLY` es como mucho un frame después.
     */
    fun setDisplayRotation(rotation: Int) {
        pendingRotation = rotation
        viewportChanged = true
    }

    /**
     * Recoge el aviso. Hilo de GL, y antes de `update()`: ARCore quiere la
     * geometría del display fijada antes de entregar el frame al que se le va a
     * pedir el encuadre.
     *
     * El flag se baja ANTES de leer la rotación a propósito. Al revés, una
     * rotación que llegara entre la lectura y la bajada se perdería para
     * siempre; así lo peor que pasa es aplicar dos veces la misma.
     */
    private fun applyPendingGeometry(arCore: Session) {
        if (!viewportChanged) return
        // Sin superficie todavía no hay geometría que dar, y el aviso se queda
        // puesto para la vuelta en que la haya.
        if (surfaceWidth == 0 || surfaceHeight == 0) return
        viewportChanged = false
        displayRotation = pendingRotation
        arCore.setDisplayGeometry(displayRotation, surfaceWidth, surfaceHeight)
    }

    override fun onDrawFrame(gl: GL10?) {
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)

        val s = session.session ?: return
        applyPendingGeometry(s)
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
        // Y se vuelve a dar la geometría: volver de una pausa con el teléfono
        // girado es justo el caso en que la pantalla cambió sin que corriera
        // ninguna vuelta de GL que se enterara.
        viewportChanged = true
    }
}

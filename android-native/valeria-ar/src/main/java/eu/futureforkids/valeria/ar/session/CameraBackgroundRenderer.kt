package eu.futureforkids.valeria.ar.session

import android.opengl.GLES11Ext
import android.opengl.GLES20
import com.google.ar.core.Coordinates2d
import com.google.ar.core.Frame
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer

/**
 * Valeria+ · El espejo de la cámara, dibujado por GL desde la textura de ARCore.
 *
 * ── Qué sustituye, y por qué eso importa ───────────────────────────────────
 *
 * La versión anterior pintaba el espejo así: `ImageAnalysis` entregaba un
 * frame, se convertía a `Bitmap` ARGB_8888 de 1,2 MB, se rotaba a otro bitmap
 * de 1,2 MB y se publicaba en un `mutableStateOf` para que Compose lo dibujara
 * con `Image`. Treinta veces por segundo. Eso son ~72 MB/s de asignación
 * atravesando el hilo de UI para enseñar lo que la GPU ya tenía.
 *
 * Aquí no hay bitmap. ARCore escribe cada frame directamente en una textura
 * `GL_TEXTURE_EXTERNAL_OES` y esto la dibuja sobre un cuadrilátero. Cero copias
 * por CPU, cero presión de memoria, y el espejo va al ritmo de la pantalla
 * aunque MediaPipe infiera a 12 fps.
 *
 * ── El encuadre lo calcula ARCore, no nosotros ─────────────────────────────
 *
 * `transformCoordinates2d` convierte las cuatro esquinas de la pantalla en las
 * coordenadas de textura que les tocan, teniendo en cuenta la rotación del
 * display y la relación de aspecto del sensor. Es justo la aritmética que el
 * módulo anterior hacía a mano con `targetRotation` y `rowStride`, y que
 * produjo dos rondas de depuración persiguiendo imágenes torcidas.
 *
 * **Todo lo de aquí corre en el hilo de GL.** No hay estado compartido con UI.
 */
class CameraBackgroundRenderer {

    /** La textura donde ARCore escribe. Se le pasa a `session.setCameraTextureName`. */
    var textureId: Int = -1
        private set

    private var program = 0
    private var aPosition = 0
    private var aTexCoord = 0
    private var uTexture = 0

    private val quadCoords: FloatBuffer = floatBuffer(
        floatArrayOf(-1f, -1f, +1f, -1f, -1f, +1f, +1f, +1f)
    )
    private val quadTexCoords: FloatBuffer = floatBuffer(FloatArray(8))

    /** Se llama una vez, en `onSurfaceCreated`. */
    fun createOnGlThread() {
        val textures = IntArray(1)
        GLES20.glGenTextures(1, textures, 0)
        textureId = textures[0]
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)
        // CLAMP_TO_EDGE y LINEAR: sin esto la textura externa sale negra en
        // bastantes GPU, y es un fallo que no da ningún error.
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_S, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_WRAP_T, GLES20.GL_CLAMP_TO_EDGE)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MIN_FILTER, GLES20.GL_LINEAR)
        GLES20.glTexParameteri(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, GLES20.GL_TEXTURE_MAG_FILTER, GLES20.GL_LINEAR)

        val vertex = compile(GLES20.GL_VERTEX_SHADER, VERTEX_SRC)
        val fragment = compile(GLES20.GL_FRAGMENT_SHADER, FRAGMENT_SRC)
        program = GLES20.glCreateProgram()
        GLES20.glAttachShader(program, vertex)
        GLES20.glAttachShader(program, fragment)
        GLES20.glLinkProgram(program)
        // Los shaders ya están enlazados en el programa: conservarlos sueltos
        // es una fuga de objetos GL que nadie recoge.
        GLES20.glDeleteShader(vertex)
        GLES20.glDeleteShader(fragment)

        aPosition = GLES20.glGetAttribLocation(program, "a_Position")
        aTexCoord = GLES20.glGetAttribLocation(program, "a_TexCoord")
        uTexture = GLES20.glGetUniformLocation(program, "u_Texture")
    }

    /**
     * Dibuja el frame. Se llama en cada vuelta del bucle de GL.
     *
     * Recalcula las coordenadas de textura SOLO cuando ARCore avisa de que la
     * geometría cambió —una rotación de pantalla—, que es lo que hace que girar
     * el teléfono a mitad de sesión no deje la imagen boca abajo.
     */
    fun draw(frame: Frame) {
        if (program == 0) return

        if (frame.hasDisplayGeometryChanged()) {
            frame.transformCoordinates2d(
                Coordinates2d.OPENGL_NORMALIZED_DEVICE_COORDINATES,
                quadCoords,
                Coordinates2d.TEXTURE_NORMALIZED,
                quadTexCoords,
            )
        }
        // El primer frame llega sin que la geometría haya "cambiado": sin esto
        // el espejo se queda negro hasta la primera rotación.
        if (frame.timestamp == 0L) return

        // El fondo se dibuja SIN test de profundidad y sin escribir en él: es el
        // telón. Si escribiera, taparía todo lo que venga después.
        GLES20.glDisable(GLES20.GL_DEPTH_TEST)
        GLES20.glDepthMask(false)

        GLES20.glUseProgram(program)
        GLES20.glActiveTexture(GLES20.GL_TEXTURE0)
        GLES20.glBindTexture(GLES11Ext.GL_TEXTURE_EXTERNAL_OES, textureId)
        GLES20.glUniform1i(uTexture, 0)

        quadCoords.position(0)
        GLES20.glVertexAttribPointer(aPosition, 2, GLES20.GL_FLOAT, false, 0, quadCoords)
        quadTexCoords.position(0)
        GLES20.glVertexAttribPointer(aTexCoord, 2, GLES20.GL_FLOAT, false, 0, quadTexCoords)

        GLES20.glEnableVertexAttribArray(aPosition)
        GLES20.glEnableVertexAttribArray(aTexCoord)
        GLES20.glDrawArrays(GLES20.GL_TRIANGLE_STRIP, 0, 4)
        GLES20.glDisableVertexAttribArray(aPosition)
        GLES20.glDisableVertexAttribArray(aTexCoord)

        // Se devuelve el estado como estaba. Dejar el depth test apagado es la
        // clase de efecto colateral que rompe lo que se dibuje después.
        GLES20.glDepthMask(true)
        GLES20.glEnable(GLES20.GL_DEPTH_TEST)
    }

    private fun compile(type: Int, src: String): Int {
        val shader = GLES20.glCreateShader(type)
        GLES20.glShaderSource(shader, src)
        GLES20.glCompileShader(shader)
        val status = IntArray(1)
        GLES20.glGetShaderiv(shader, GLES20.GL_COMPILE_STATUS, status, 0)
        if (status[0] == 0) {
            val log = GLES20.glGetShaderInfoLog(shader)
            GLES20.glDeleteShader(shader)
            // Se lanza a propósito: un shader que no compila deja la pantalla en
            // negro, y un negro silencioso ya costó cuatro rondas de depuración.
            throw RuntimeException("Shader de cámara no compila: $log")
        }
        return shader
    }

    private fun floatBuffer(values: FloatArray): FloatBuffer =
        ByteBuffer.allocateDirect(values.size * 4)
            .order(ByteOrder.nativeOrder())
            .asFloatBuffer()
            .apply { put(values); position(0) }

    private companion object {
        const val VERTEX_SRC = """
            attribute vec4 a_Position;
            attribute vec2 a_TexCoord;
            varying vec2 v_TexCoord;
            void main() {
              gl_Position = a_Position;
              v_TexCoord = a_TexCoord;
            }
        """

        // samplerExternalOES y la extensión declarada arriba del todo: una
        // textura de cámara no se lee con sampler2D, y hacerlo da negro sin
        // error de compilación en algunas GPU.
        const val FRAGMENT_SRC = """
            #extension GL_OES_EGL_image_external : require
            precision mediump float;
            varying vec2 v_TexCoord;
            uniform samplerExternalOES u_Texture;
            void main() {
              gl_FragColor = texture2D(u_Texture, v_TexCoord);
            }
        """
    }
}

package eu.futureforkids.valeria.ar.signal

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import androidx.camera.core.ImageProxy
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.core.Delegate
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult

/**
 * Valeria+ · Capa de señal: MediaPipe Face Landmarker en LIVE_STREAM.
 *
 * Las tres señales que necesita el módulo —blendshapes labiales, *head pose* e
 * iris— salen del MISMO `FaceLandmarkerResult`. En Kotlin eso es una llamada;
 * por el puente de JS serían dos cruces por frame a 30 fps.
 *
 * ── Privacidad como restricción de arquitectura (§9.1 del plan) ────────────
 * Esta clase es donde esas tres afirmaciones se cumplen o dejan de ser ciertas:
 *   1. El frame nunca sale del dispositivo — no hay red aquí, ni la habrá.
 *   2. El frame nunca se almacena — el `ImageProxy` se cierra en el mismo
 *      callback y el bitmap intermedio es local y efímero. No hay caché, ni
 *      buffer en disco, ni captura.
 *   3. No hay identificación biométrica — los landmarks se usan para medir
 *      conducta motora, no para reconocer a una persona.
 * Si alguien añade aquí una grabación «para revisar después», la declaración de
 * privacidad entera deja de ser cierta y el módulo cambia de categoría
 * regulatoria. No es una preferencia: es la frontera del art. 9 del RGPD.
 */
class FaceSignalEngine(
    context: Context,
    /** Se llama en el hilo del listener de MediaPipe, no en el de UI. */
    private val onSignals: (FaceSignals) -> Unit,
) {

    private var landmarker: FaceLandmarker? = null
    private var usingGpu = true

    /** true si el delegado GPU no estaba disponible y hubo que caer a CPU. */
    val fellBackToCpu: Boolean get() = !usingGpu

    init {
        landmarker = build(context, Delegate.GPU) ?: run {
            // Algunos SoC de entrada del parque LATAM no traen delegado GPU
            // utilizable. No es un error: es un teléfono que la Prueba de
            // Aptitud va a clasificar más abajo por fps, sin necesidad de saber
            // el modelo.
            usingGpu = false
            build(context, Delegate.CPU)
        }
    }

    private fun build(context: Context, delegate: Delegate): FaceLandmarker? = try {
        val base = BaseOptions.builder()
            .setModelAssetPath(MODEL_ASSET)
            .setDelegate(delegate)
            .build()

        val options = FaceLandmarker.FaceLandmarkerOptions.builder()
            .setBaseOptions(base)
            .setRunningMode(RunningMode.LIVE_STREAM)
            .setNumFaces(1)
            .setOutputFaceBlendshapes(true)              // AR-1
            .setOutputFacialTransformationMatrixes(true) // AR-2 y AR-3
            .setMinTrackingConfidence(0.5f)
            .setResultListener { result, _ -> dispatch(result) }
            .setErrorListener { /* un frame perdido no interrumpe la sesión */ }
            .build()

        FaceLandmarker.createFromOptions(context, options)
    } catch (e: Throwable) {
        null
    }

    val isReady: Boolean get() = landmarker != null

    /**
     * Entrega un frame de CameraX. El `ImageProxy` se cierra SIEMPRE, pase lo
     * que pase: dejarlo abierto congela la cámara al segundo frame, y en
     * `BACKPRESSURE_KEEP_LATEST` el síntoma es una imagen congelada sin error.
     */
    fun analyze(image: ImageProxy, isFrontCamera: Boolean) {
        val lm = landmarker
        if (lm == null) { image.close(); return }
        try {
            // Marca de tiempo de CAPTURA del sensor, no del callback.
            val tCaptureUs = image.imageInfo.timestamp / 1_000L
            pendingCaptureUs[tCaptureUs / 1_000L] = tCaptureUs

            val bitmap = image.toRotatedBitmap(isFrontCamera) ?: run { image.close(); return }
            val mpImage = BitmapImageBuilder(bitmap).build()
            lm.detectAsync(mpImage, tCaptureUs / 1_000L)
        } catch (e: Throwable) {
            // Frame mal formado o landmarker cerrándose: se descarta y se sigue.
        } finally {
            image.close()
        }
    }

    // detectAsync solo admite milisegundos, pero la latencia de AR-2 se defiende
    // en microsegundos. Se guarda la marca exacta indexada por su milisegundo y
    // se recupera al volver del listener; si se perdiera, se reconstruye con la
    // resolución que haya, nunca se inventa.
    private val pendingCaptureUs = LinkedHashMap<Long, Long>(64, 0.75f, false)

    private fun dispatch(result: FaceLandmarkerResult) {
        val faces = result.faceLandmarks()
        if (faces.isEmpty()) return

        val tMs = result.timestampMs()
        val tCaptureUs = pendingCaptureUs.remove(tMs) ?: (tMs * 1_000L)
        if (pendingCaptureUs.size > 120) {
            val it = pendingCaptureUs.keys.iterator()
            while (pendingCaptureUs.size > 60 && it.hasNext()) { it.next(); it.remove() }
        }

        val landmarks = faces[0].map { Landmark(it.x(), it.y(), it.z()) }

        val blends = result.faceBlendshapes()
            .takeIf { it.isPresent }
            ?.get()
            ?.firstOrNull()
            ?.associate { it.categoryName() to it.score() }
            ?: emptyMap()

        val transform = result.facialTransformationMatrixes()
            .takeIf { it.isPresent }
            ?.get()
            ?.firstOrNull()
            ?: IDENTITY

        onSignals(
            FaceSignals(
                blendshapes = blends,
                transform = transform,
                landmarks = landmarks,
                tCaptureUs = tCaptureUs,
                trackingQuality = if (landmarks.isEmpty()) 0f else 1f,
            )
        )
    }

    fun close() {
        try { landmarker?.close() } catch (e: Throwable) { /* ya cerrado */ }
        landmarker = null
        pendingCaptureUs.clear()
    }

    companion object {
        const val MODEL_ASSET = "face_landmarker.task"
        private val IDENTITY = floatArrayOf(
            1f, 0f, 0f, 0f,
            0f, 1f, 0f, 0f,
            0f, 0f, 1f, 0f,
            0f, 0f, 0f, 1f,
        )
    }
}

/**
 * Convierte el frame a un bitmap orientado como lo ve el niño. La cámara
 * frontal entrega la imagen espejada: sin corregirlo, «gira a la derecha» se
 * registraría como giro a la izquierda y AR-2 mediría al revés en todos los
 * ensayos, de forma sistemática y por tanto invisible en la media.
 */
private fun ImageProxy.toRotatedBitmap(isFrontCamera: Boolean): Bitmap? {
    val source = try {
        toBitmap()
    } catch (e: Throwable) {
        return null
    }
    val rotation = imageInfo.rotationDegrees
    if (rotation == 0 && !isFrontCamera) return source
    val matrix = Matrix().apply {
        postRotate(rotation.toFloat())
        if (isFrontCamera) postScale(-1f, 1f, source.width / 2f, source.height / 2f)
    }
    return Bitmap.createBitmap(source, 0, 0, source.width, source.height, matrix, true)
}

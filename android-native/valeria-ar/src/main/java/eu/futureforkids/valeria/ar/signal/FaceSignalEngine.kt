package eu.futureforkids.valeria.ar.signal

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.SystemClock
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
    /**
     * Frame procesado SIN cara dentro. Existe porque el silencio no es
     * información utilizable: si el niño se sale del encuadre, el ejercicio se
     * queda esperando una señal que no va a llegar y la sesión se cuelga con la
     * cámara abierta. Quien recibe esto puede avisar al adulto y, si la ausencia
     * se prolonga, cerrar la sesión con un resultado en vez de con un bloqueo.
     * Se llama en el hilo del listener de MediaPipe, no en el de UI.
     */
    private val onFaceLost: () -> Unit = {},
    /**
     * Cada frame ya orientado como lo ve el niño, para pintarlo como espejo.
     *
     * Se entrega SIEMPRE, también cuando el frame se descarta por contrapresión:
     * dibujar es barato y la inferencia no, así que el espejo va fluido aunque el
     * teléfono infiera a la mitad de velocidad. El bitmap es el MISMO que recibe
     * MediaPipe —ambos lo leen y ninguno lo modifica—, así que el espejo no
     * cuesta ni una copia extra.
     *
     * Se llama en el hilo del executor de análisis.
     */
    private val onFrame: (Bitmap) -> Unit = {},
    /** Se llama en el hilo del listener de MediaPipe, no en el de UI. */
    private val onSignals: (FaceSignals) -> Unit,
) {

    private var landmarker: FaceLandmarker? = null
    private var usingGpu = true

    /**
     * Cierre y entrega de frames se sincronizan sobre este candado. `analyze()`
     * corre en el executor de CameraX y `close()` en el hilo principal: sin él,
     * un frame en vuelo puede llamar a `detectAsync` sobre un landmarker que
     * acaba de cerrarse, y eso no lanza una excepción de Java sino que cierra la
     * app desde el código nativo.
     */
    private val lock = Any()
    @Volatile private var closed = false

    /** Instante en que se envió la inferencia en vuelo. 0 = ninguna. */
    @Volatile private var inferenceStartedMs = 0L

    // detectAsync solo admite milisegundos, pero la latencia de AR-2 se defiende
    // en microsegundos. Se guarda la marca exacta indexada por su milisegundo y
    // se recupera al volver del listener; si se perdiera, se reconstruye con la
    // resolución que haya, nunca se inventa.
    //
    // Va SIEMPRE bajo `synchronized`: se escribe desde el executor de análisis y
    // se lee y purga desde el hilo del listener de MediaPipe. Un LinkedHashMap
    // tocado por dos hilos a la vez no falla de forma limpia —corrompe sus
    // cadenas y se cuelga o revienta mucho después, en un sitio sin relación—.
    //
    // Declarados ANTES del `init`: el bloque de inicialización construye el
    // landmarker con su listener ya enganchado, y las propiedades de una clase
    // se inicializan en orden de declaración.
    private val pendingCaptureUs = LinkedHashMap<Long, Long>(64, 0.75f, false)

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
            .setErrorListener {
                // Un frame perdido no interrumpe la sesión, pero sí hay que
                // devolver el hueco de la compuerta: si no, se esperaría a que
                // salte la válvula temporal para volver a analizar.
                inferenceStartedMs = 0L
            }
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
     *
     * ── Por qué hay contrapresión aquí y no basta la de CameraX (§) ─────────
     * `STRATEGY_KEEP_ONLY_LATEST` descarta frames mientras el analizador está
     * ocupado, pero `detectAsync` vuelve de inmediato: para CameraX el
     * analizador nunca está ocupado, así que le entrega frames al ritmo del
     * sensor —30 por segundo— sin importar a qué ritmo infiere MediaPipe. En un
     * teléfono de gama media que infiere a 12 fps, esos 18 frames por segundo de
     * diferencia se acumulan DENTRO del grafo de MediaPipe con su bitmap de
     * 1,2 MB cada uno: unos 20 MB por segundo que nadie libera. A los pocos
     * minutos el proceso muere por memoria, que es el cierre inesperado que se
     * describe. La compuerta de aquí abajo convierte esa acumulación en frames
     * descartados, que es lo que se quería desde el principio.
     */
    fun analyze(image: ImageProxy, isFrontCamera: Boolean) {
        if (closed) { image.close(); return }

        try {
            // Marca de tiempo de CAPTURA del sensor, no del callback.
            val tCaptureUs = image.imageInfo.timestamp / 1_000L
            val tMs = tCaptureUs / 1_000L

            // Sin `image.close()` en los returns: lo hace el `finally`. Cerrarlo
            // dos veces descuenta dos veces en la cola de CameraX.
            val bitmap = image.toRotatedBitmap(isFrontCamera) ?: return

            // El espejo primero y siempre: es lo que el adulto necesita para
            // colocar al niño, y no puede depender de que la inferencia vaya
            // sobrada. Un espejo a 30 fps sobre una señal a 12 es exactamente lo
            // que se quiere, no una concesión.
            onFrame(bitmap)

            // Compuerta de un frame en vuelo, con válvula de seguridad temporal:
            // si una inferencia se perdiera sin devolver resultado, el hueco se
            // libera solo y la sesión sigue, en vez de quedarse sin señal para
            // siempre.
            val now = SystemClock.elapsedRealtime()
            val busySince = inferenceStartedMs
            if (busySince != 0L && now - busySince < STALE_INFERENCE_MS) return

            synchronized(pendingCaptureUs) { pendingCaptureUs[tMs] = tCaptureUs }
            val mpImage = BitmapImageBuilder(bitmap).build()
            inferenceStartedMs = now
            synchronized(lock) {
                val lm = landmarker
                if (closed || lm == null) { inferenceStartedMs = 0L; return }
                lm.detectAsync(mpImage, tMs)
            }
        } catch (e: Throwable) {
            // Frame mal formado o landmarker cerrándose: se descarta y se sigue.
            inferenceStartedMs = 0L
        } finally {
            image.close()
        }
    }

    private fun dispatch(result: FaceLandmarkerResult) {
        inferenceStartedMs = 0L

        val tMs = result.timestampMs()
        val tCaptureUs = synchronized(pendingCaptureUs) {
            val exact = pendingCaptureUs.remove(tMs)
            if (pendingCaptureUs.size > 120) {
                val it = pendingCaptureUs.keys.iterator()
                while (pendingCaptureUs.size > 60 && it.hasNext()) { it.next(); it.remove() }
            }
            exact ?: (tMs * 1_000L)
        }

        val faces = result.faceLandmarks()
        if (faces.isEmpty()) {
            // El frame se procesó y no había cara. Es un dato, no un silencio.
            if (!closed) onFaceLost()
            return
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

        if (closed) return
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

    /**
     * Idempotente y a prueba de frames en vuelo: primero se marca cerrado —lo
     * que hace que `analyze()` deje de entregar y que el listener deje de
     * repartir— y solo después se suelta el landmarker, bajo el mismo candado
     * que usa la entrega.
     */
    fun close() {
        closed = true
        synchronized(lock) {
            try { landmarker?.close() } catch (e: Throwable) { /* ya cerrado */ }
            landmarker = null
        }
        synchronized(pendingCaptureUs) { pendingCaptureUs.clear() }
        inferenceStartedMs = 0L
    }

    companion object {
        const val MODEL_ASSET = "face_landmarker.task"

        /**
         * Tras esto se da por perdida la inferencia en vuelo y se vuelve a
         * admitir frames. Un segundo es más de lo que tarda el peor teléfono del
         * parque en un frame de 640×480, así que en operación normal la válvula
         * no se abre nunca; está para que un fallo del grafo no deje al niño
         * mirando una cámara que ya no analiza nada.
         */
        private const val STALE_INFERENCE_MS = 1_000L

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
 *
 * El intermedio se RECICLA en el mismo frame. Son dos bitmaps de 640×480 en
 * ARGB_8888 —1,2 MB cada uno— treinta veces por segundo: unos 72 MB/s de
 * asignación, de los cuales la mitad es un original que ya no hace falta en
 * cuanto existe la copia rotada. Dejar que se los lleve el recolector obliga al
 * proceso a sostener decenas de megas de basura viva y es la mitad del problema
 * de memoria; `recycle()` devuelve el buffer al instante.
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
    val rotated = try {
        Bitmap.createBitmap(source, 0, 0, source.width, source.height, matrix, true)
    } catch (e: Throwable) {
        source.recycle()
        return null
    }
    // `createBitmap` devuelve el mismo objeto si la matriz resulta ser la
    // identidad. Reciclarlo entonces le entregaría a MediaPipe un bitmap muerto.
    if (rotated !== source) source.recycle()
    return rotated
}

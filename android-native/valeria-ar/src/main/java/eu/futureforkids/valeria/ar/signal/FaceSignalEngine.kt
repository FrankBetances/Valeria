package eu.futureforkids.valeria.ar.signal

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.SystemClock
import android.graphics.BitmapFactory
import android.graphics.ImageFormat
import android.graphics.Rect
import android.graphics.YuvImage
import android.media.Image
import java.io.ByteArrayOutputStream
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
 *   2. El frame nunca se almacena — la imagen de ARCore se cierra en el mismo
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
    /** Se llama en el hilo del listener de MediaPipe, no en el de UI. */
    private val onSignals: (FaceSignals) -> Unit,
) {

    private var landmarker: FaceLandmarker? = null
    private var usingGpu = true

    /**
     * Cierre y entrega de frames se sincronizan sobre este candado. `analyze()`
     * corre en el hilo de GL de ARCore y `close()` en el principal: sin él,
     * un frame en vuelo puede llamar a `detectAsync` sobre un landmarker que
     * acaba de cerrarse, y eso no lanza una excepción de Java sino que cierra la
     * app desde el código nativo.
     */
    private val lock = Any()
    @Volatile private var closed = false

    /** Instante en que se envió la inferencia en vuelo. 0 = ninguna. */
    @Volatile private var inferenceStartedMs = 0L

    /**
     * Primer fallo al convertir un frame a bitmap, si lo hubo.
     *
     * ARCore entrega YUV_420_888 y el conversor de abajo rechaza cualquier otro
     * formato. Si un teléfono entregara algo inesperado, sin esto el síntoma
     * sería una sesión sin señal y sin explicación —y ya hemos gastado
     * demasiadas rondas interpretando síntomas—. Con esto, el mensaje exacto
     * sale en la ficha de diagnóstico.
     */
    @Volatile var frameError: String? = null
        private set

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
     * Entrega un frame de ARCore. [tCaptureUs] es el `frame.timestamp` de
     * ARCore en microsegundos: marca de CAPTURA del sensor, no del callback.
     * Confundirlas no daría un dato ruidoso sino SESGADO en AR-2, que es peor.
     *
     * La imagen la cierra quien la pidió, no este método (ver el final).
     *
     * ── Por qué sigue habiendo contrapresión aquí ───────────────────────────
     * `Config.UpdateMode.LATEST_CAMERA_IMAGE` evita que ARCore encole frames,
     * pero no sabe nada del ritmo de MediaPipe: `detectAsync` vuelve de
     * inmediato, así que sin esta compuerta el bucle de GL le entregaría frames
     * a 60 por segundo aunque el teléfono infiera a 12. Esos frames de más se
     * acumulan DENTRO del grafo de MediaPipe con su bitmap, y a los pocos
     * minutos el proceso muere por memoria: es el cierre inesperado que ya se
     * diagnosticó una vez. La compuerta lo convierte en frames descartados.
     */
    fun analyze(image: Image, rotationDegrees: Int, mirror: Boolean, tCaptureUs: Long) {
        if (closed) return

        try {
            val tMs = tCaptureUs / 1_000L

            // ── La compuerta va ANTES de convertir, y ese orden importa ──────
            // En la versión de CameraX el bitmap se construía en todos los
            // frames porque el espejo lo necesitaba: 30 conversiones por segundo
            // aunque el teléfono solo infiriera 12 veces. Con ARCore el espejo
            // lo pinta GL desde su propia textura, así que aquí solo se convierte
            // lo que de verdad se va a inferir. Dos de cada tres conversiones
            // desaparecen, y con ellas su basura.
            val now = SystemClock.elapsedRealtime()
            val busySince = inferenceStartedMs
            if (busySince != 0L && now - busySince < STALE_INFERENCE_MS) return

            val bitmap = try {
                image.toUprightBitmap(rotationDegrees, mirror)
            } catch (e: Throwable) {
                if (frameError == null) frameError = "${e.javaClass.simpleName}: ${e.message}"
                null
            }
            if (bitmap == null) {
                if (frameError == null) frameError = "la conversión YUV a bitmap no devolvió imagen"
                return
            }

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
        }
        // Sin `finally { image.close() }`: la imagen es de ARCore y la cierra
        // QUIEN LA PIDIÓ, con `use {}`. Cerrarla aquí además la cerraría dos
        // veces, y un doble cierre sobre el pool de ARCore no da excepción: deja
        // la sesión sin entregar frames.
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
private fun Image.toUprightBitmap(rotationDegrees: Int, mirror: Boolean): Bitmap? {
    if (format != ImageFormat.YUV_420_888) return null

    // ── YUV_420_888 → NV21, respetando los strides ──────────────────────────
    // Los `rowStride` y `pixelStride` no son decorativos: es exactamente lo que
    // la ficha de cámara del módulo anterior existía para diagnosticar. Leer el
    // plano con el ancho en vez de con su stride real produce esos bloques de
    // color abstractos que ya se persiguieron una vez creyéndolos memoria
    // corrupta. Aquí se leen fila a fila, que es la única forma correcta.
    val yPlane = planes[0]
    val uPlane = planes[1]
    val vPlane = planes[2]

    val nv21 = ByteArray(width * height * 3 / 2)
    var pos = 0

    val yBuf = yPlane.buffer
    val yRowStride = yPlane.rowStride
    if (yRowStride == width) {
        yBuf.get(nv21, 0, width * height)
        pos = width * height
    } else {
        val row = ByteArray(yRowStride)
        for (r in 0 until height) {
            yBuf.position(r * yRowStride)
            val len = minOf(yRowStride, yBuf.remaining())
            yBuf.get(row, 0, len)
            System.arraycopy(row, 0, nv21, pos, width)
            pos += width
        }
    }

    // NV21 quiere VU entrelazado. El pixelStride es 2 en el caso semiplanar
    // (que es el habitual) y 1 en el planar; ambos se cubren leyendo por índice.
    val uvRowStride = uPlane.rowStride
    val uvPixelStride = uPlane.pixelStride
    val uBuf = uPlane.buffer
    val vBuf = vPlane.buffer
    val uvHeight = height / 2
    val uvWidth = width / 2
    for (r in 0 until uvHeight) {
        for (c in 0 until uvWidth) {
            val idx = r * uvRowStride + c * uvPixelStride
            if (idx >= vBuf.limit() || idx >= uBuf.limit()) continue
            nv21[pos++] = vBuf.get(idx)
            nv21[pos++] = uBuf.get(idx)
        }
    }

    val out = ByteArrayOutputStream(width * height / 2)
    if (!YuvImage(nv21, ImageFormat.NV21, width, height, null)
            .compressToJpeg(Rect(0, 0, width, height), JPEG_QUALITY, out)) return null
    val bytes = out.toByteArray()
    val source = BitmapFactory.decodeByteArray(bytes, 0, bytes.size) ?: return null

    // La cámara frontal entrega la imagen espejada: sin corregirlo, «gira a la
    // derecha» se registraría como giro a la izquierda y AR-2 mediría al revés
    // en TODOS los ensayos, de forma sistemática y por tanto invisible en la
    // media. Eso no es ruido: es sesgo.
    if (rotationDegrees == 0 && !mirror) return source
    val matrix = Matrix().apply {
        postRotate(rotationDegrees.toFloat())
        if (mirror) postScale(-1f, 1f, source.width / 2f, source.height / 2f)
    }
    val rotated = try {
        Bitmap.createBitmap(source, 0, 0, source.width, source.height, matrix, true)
    } catch (e: Throwable) {
        source.recycle()
        return null
    }
    // `createBitmap` devuelve el MISMO objeto si la matriz resulta ser la
    // identidad. Reciclarlo entonces le entregaría a MediaPipe un bitmap muerto.
    if (rotated !== source) source.recycle()
    return rotated
}

/**
 * 85 y no 100: a calidad 100 el JPEG intermedio casi dobla de tamaño y el
 * Face Landmarker no distingue la diferencia — mide geometría, no textura.
 */
private const val JPEG_QUALITY = 85

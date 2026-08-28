package eu.futureforkids.valeria.ar

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.PointF
import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import android.view.Surface
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import eu.futureforkids.valeria.ar.aptitude.AptitudeTest
import eu.futureforkids.valeria.ar.aptitude.FpsMeter
import eu.futureforkids.valeria.ar.aptitude.PointerJitterMeter
import eu.futureforkids.valeria.ar.audio.StimulusPlayer
import eu.futureforkids.valeria.ar.exercises.Ar1Orofacial
import eu.futureforkids.valeria.ar.exercises.Ar2Vra
import eu.futureforkids.valeria.ar.exercises.Ar3Fixation
import eu.futureforkids.valeria.ar.exercises.Ar4SpatialSearch
import eu.futureforkids.valeria.ar.exercises.Ar5FeedCatch
import eu.futureforkids.valeria.ar.exercises.Ar6BuddyMimicry
import eu.futureforkids.valeria.ar.exercises.ArExercise
import eu.futureforkids.valeria.ar.exercises.ExerciseContext
import eu.futureforkids.valeria.ar.scene.ArModel
import eu.futureforkids.valeria.ar.scene.SceneState
import eu.futureforkids.valeria.ar.scene.ValeriaArSceneView
import eu.futureforkids.valeria.ar.signal.Calibration
import eu.futureforkids.valeria.ar.signal.DeviceAttitudeCompensator
import eu.futureforkids.valeria.ar.signal.DistanceEstimator
import eu.futureforkids.valeria.ar.signal.FaceSignalEngine
import eu.futureforkids.valeria.ar.signal.FaceSignals
import eu.futureforkids.valeria.ar.signal.ScreenGeometry
import eu.futureforkids.valeria.ar.signal.pointerFor
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

/**
 * Valeria+ · Host nativo del bloque de Realidad Aumentada.
 *
 * Una sola Activity a pantalla completa con tres modos —ejercicio, Prueba de
 * Aptitud y calibración de 5 puntos— porque los tres necesitan exactamente el
 * mismo andamiaje: cámara frontal, señal facial, IMU y escena.
 *
 * Lo que esta clase NO hace, y no es un olvido: **no persiste datos clínicos,
 * no cifra, no sincroniza y no decide nada**. Devuelve un resultado y el JS lo
 * enruta por `valeriaTelemetry`. Mantener esa frontera es lo que evita tener
 * dos fuentes de verdad para los datos del piloto.
 */
class ValeriaArActivity : ComponentActivity() {

    private lateinit var scene: SceneState
    private lateinit var geometry: ScreenGeometry
    private lateinit var imu: DeviceAttitudeCompensator
    private val distance = DistanceEstimator()
    private var engine: FaceSignalEngine? = null
    private var exercise: ArExercise? = null
    private val analysisExecutor = Executors.newSingleThreadExecutor()
    /**
     * Red de seguridad del scope. Una excepción no capturada en una corrutina de
     * UI mata el PROCESO: la familia ve la app desaparecer entera, sin sesión y
     * sin explicación. Con esto, lo peor que puede pasar es que se cierre esta
     * pantalla y se devuelva lo medido hasta ahí, que es justo la diferencia
     * entre perder un ensayo y perder la sesión.
     *
     * No sustituye a arreglar los fallos —las carreras entre hilos que había
     * están corregidas en su sitio—, cubre los que todavía no conocemos.
     */
    private val crashGuard = CoroutineExceptionHandler { _, _ ->
        runCatching { finishWith(outcome = "aborted") }
    }

    // Scope propio en vez de lifecycleScope: evita depender de
    // androidx.lifecycle:lifecycle-runtime-ktx y deja explícito dónde se
    // cancelan las corrutinas (onDestroy), que con una cámara abierta importa.
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob() + crashGuard)
    private val fpsMeter = FpsMeter()

    private var mode = MODE_EXERCISE
    private var config: ArExerciseConfig? = null
    private var patientKey = "anon"
    private var startedAt = 0L

    private val diagnostics = DiagnosticsState()
    private var statusText by mutableStateOf("")
    /** Diana de la osita: la sigue la mirada en calibración y en la Prueba de Aptitud. */
    private var bearTarget by mutableStateOf<PointF?>(null)

    /**
     * Último frame con cara dentro, en `elapsedRealtime`. Es lo que convierte
     * «no llegan señales» en un hecho con reloj: sin esto el bucle de ejercicio
     * gira para siempre esperando ensayos que nadie va a producir, con la cámara
     * abierta y el teléfono calentándose.
     */
    @Volatile private var lastFaceMs = 0L

    // Para desenlazar la cámara de forma explícita al cerrar, sin depender solo
    // del ciclo de vida: mientras siga enlazada sigue habiendo frames en vuelo.
    private var cameraProvider: ProcessCameraProvider? = null
    private var analysisUseCase: ImageAnalysis? = null

    /**
     * El espejo: el último frame de la cámara, ya orientado, listo para pintar.
     *
     * ── Por qué el espejo NO usa el caso de uso `Preview` de CameraX ────────
     * **AVISO SOBRE ESTA DECISIÓN: se tomó sobre un diagnóstico equivocado.**
     * Se retiró el `Preview` creyendo que su superficie no recibía frames,
     * porque el fondo se veía como polígonos planos de colores. La causa real
     * era que las pruebas se hicieron en el EMULADOR de Android Studio, cuya
     * cámara sirve una escena sintética con ese aspecto. El `Preview` funcionaba
     * correctamente; lo que mostraba era lo que el emulador le daba.
     *
     * Lo que hay ahora, por tanto, no está justificado por el fallo que decía
     * resolver, y en un móvil real un `PreviewView` es mejor por dos razones
     * concretas: entrega la resolución completa del sensor —esto son 640×480
     * escalados, más blandos— y se compone por hardware, sin convertir un bitmap
     * ni subir una textura por frame.
     *
     * Se mantiene de momento porque tiene una propiedad que sí vale por sí sola:
     * el adulto ve EXACTAMENTE los frames que ve el rastreador facial, así que
     * «no le coge la cara» deja de ser una conjetura. Volver al `Preview` por
     * hardware es una decisión abierta, y hay que tomarla con un móvil real
     * delante, no con este comentario.
     */
    private var mirrorFrame by mutableStateOf<ImageBitmap?>(null)

    // ---- Ficha de la cámara ---------------------------------------------------
    // Deja de ser un adjetivo («se ve raro») y pasa a ser una cifra. Con el
    // espejo dibujándose desde los mismos bitmaps que analiza MediaPipe, estas
    // cuatro líneas dicen si el frame llega, con qué tamaño, en qué formato y
    // con qué stride — que es exactamente lo que hay que saber para distinguir
    // una conversión mal hecha de una resolución absurda o de una cámara que
    // devuelve basura de verdad.
    @Volatile private var framesFromCamera = 0L
    @Volatile private var framesInferred = 0L
    @Volatile private var facesSeen = 0L
    @Volatile private var frameGeometry = ""
    @Volatile private var mirrorGeometry = ""
    private var cameraReport by mutableStateOf("")

    // Calibración: pares (punto de cara observado → punto de pantalla mostrado).
    private val calObserved = ArrayList<PointF>(5)
    private val calScreen = ArrayList<PointF>(5)

    // `calSamples` la ESCRIBE el hilo del listener de MediaPipe y la LEE la
    // corrutina de UI entre diana y diana. Sin candado, el `map{}.average()` de
    // la corrutina se cruzaba con un `add()` del listener: mismo defecto que
    // tenía `FpsMeter`, y con la misma consecuencia —la app cerrándose sola—,
    // solo que aquí a mitad de la rutina de calibración.
    private val calLock = Any()
    private val calSamples = ArrayList<PointF>(60)
    @Volatile private var calCollecting = false

    private val pointerJitter = PointerJitterMeter()

    private val cameraPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startPipeline() else finishWith(outcome = "denied")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        mode = intent.getStringExtra(EXTRA_MODE) ?: MODE_EXERCISE
        patientKey = intent.getStringExtra(EXTRA_PATIENT_KEY) ?: "anon"
        intent.getStringExtra(EXTRA_CONFIG)?.let {
            config = try { ArExerciseConfig.from(JSONObject(it)) } catch (e: Throwable) { null }
        }

        scene = SceneState()
        geometry = ScreenGeometry(this)
        imu = DeviceAttitudeCompensator(this)
        startedAt = System.currentTimeMillis()

        // ComposeView en vez de setContent: `setContent` vive en
        // androidx.activity:activity-compose, una dependencia más que declarar
        // y versionar. ComponentActivity ya instala los ViewTree owners que
        // ComposeView necesita, así que esto es equivalente y trae menos grafo.
        setContentView(
            ComposeView(this).apply {
                setContent {
                    ArHostScreen(
                        mirror = mirrorFrame,
                        scene = scene,
                        status = statusText,
                        cameraReport = cameraReport,
                        bearTarget = bearTarget,
                        diagnostics = if (mode == MODE_DIAGNOSTICS) diagnostics else null,
                    )
                }
            }
        )

        // Salir a mitad de sesión no es un error: es un niño que se ha cansado.
        // Se cierra con lo medido hasta ahí, nunca dejando el registro a medias.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                finishWith(outcome = if (exercise?.finished == true) "completed" else "aborted")
            }
        })

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startPipeline()
        } else {
            cameraPermission.launch(Manifest.permission.CAMERA)
        }
    }

    // ---- Cámara y señal -----------------------------------------------------

    private fun startPipeline() {
        imu.start()
        engine = FaceSignalEngine(
            context = this,
            onFaceLost = { onFrameProcessed() },
            onFrame = { bitmap -> publishMirror(bitmap) },
            onSignals = { signals -> onFrameProcessed(); onSignals(signals) },
        )
        if (engine?.isReady != true) { finishWith(outcome = "aborted"); return }

        val providerFuture = ProcessCameraProvider.getInstance(this)
        providerFuture.addListener({
            val provider = providerFuture.get()
            cameraProvider = provider

            // 640×480 y BACKPRESSURE_KEEP_LATEST: a mayor resolución la gama
            // media no sostiene la inferencia, y encolar frames viejos empeora
            // la latencia sin mejorar la medida.
            val analysis = ImageAnalysis.Builder()
                .setResolutionSelector(
                    ResolutionSelector.Builder()
                        .setResolutionStrategy(
                            ResolutionStrategy(
                                android.util.Size(640, 480),
                                ResolutionStrategy.FALLBACK_RULE_CLOSEST_HIGHER_THEN_LOWER,
                            )
                        )
                        .build()
                )
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                // ── Sin OUTPUT_IMAGE_FORMAT_RGBA_8888 ───────────────────────
                // **AVISO: también esto se quitó persiguiendo el fallo del
                // emulador.** Se sospechaba de la etapa de conversión YUV→RGBA
                // que CameraX monta dentro del pipeline; no había tal fallo, la
                // imagen «corrupta» era la escena sintética del emulador.
                //
                // Sin esta línea, `ImageAnalysis` entrega el YUV_420_888 nativo
                // y la conversión la hace `ImageProxy.toBitmap()` con libyuv, en
                // la CPU: unos milisegundos más por frame. El ejemplo oficial de
                // MediaPipe usa RGBA precisamente para ahorrárselos, así que
                // restaurarlo es candidato en cuanto haya medidas de fps en un
                // móvil real. Se deja como está para no encadenar otro cambio
                // sin verificar sobre uno ya hecho sin verificar.
                //
                // Explícita, no heredada: la Activity es `sensorLandscape` y
                // absorbe los cambios de configuración sin recrearse, así que
                // nadie la actualizaría sola. Sin esto, girar el teléfono 180°
                // —cosa que el soporte de mesa invita a hacer— deja el espejo
                // boca abajo y el rastreador midiendo una cara invertida.
                .setTargetRotation(displayRotation())
                .build()

            // El contador de fps NO va aquí. Aquí se cuentan los frames que la
            // cámara entrega, y el analizador descarta los que llegan mientras
            // MediaPipe todavía infiere: contarlos daría 30 fps en un teléfono
            // que en realidad procesa 12, y la Prueba de Aptitud clasificaría de
            // nivel A un aparato que no sostiene el ejercicio. Se cuentan en
            // `onFrameProcessed`, es decir, inferencias acabadas.
            analysis.setAnalyzer(analysisExecutor) { image ->
                framesFromCamera += 1
                if (frameGeometry.isEmpty()) describeFrame(image)
                engine?.analyze(image, isFrontCamera = true)
            }
            analysisUseCase = analysis

            try {
                provider.unbindAll()
                // Un solo caso de uso. El `Preview` de CameraX ya no se enlaza:
                // el espejo se dibuja desde estos mismos frames (ver `mirrorFrame`).
                provider.bindToLifecycle(this, CameraSelector.DEFAULT_FRONT_CAMERA, analysis)
                lastFaceMs = SystemClock.elapsedRealtime()
                watchCameraHealth()
                startModeFlow()
            } catch (e: Throwable) {
                finishWith(outcome = "aborted")
            }
        }, ContextCompat.getMainExecutor(this))
    }

    @Suppress("DEPRECATION")
    private fun displayRotation(): Int =
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            display?.rotation ?: Surface.ROTATION_0
        } else {
            windowManager.defaultDisplay.rotation
        }

    override fun onConfigurationChanged(newConfig: android.content.res.Configuration) {
        super.onConfigurationChanged(newConfig)
        // La Activity declara `configChanges="orientation|screenSize|…"`, así que
        // aquí es donde hay que enterarse de que el teléfono se dio la vuelta.
        analysisUseCase?.targetRotation = displayRotation()
    }

    /**
     * Publica el frame como espejo.
     *
     * Se salta al hilo principal a propósito. Escribir estado de Compose desde
     * un hilo cualquiera funciona, pero la visibilidad depende de cuándo avance
     * la instantánea global; con 30 escrituras por segundo de una imagen que el
     * adulto usa para encuadrar a un niño, la certeza vale más que el salto.
     */
    private fun publishMirror(bitmap: Bitmap) {
        if (mirrorGeometry.isEmpty()) {
            mirrorGeometry = "${bitmap.width}×${bitmap.height} ${bitmap.config}"
        }
        val image = bitmap.asImageBitmap()
        runOnUiThread { mirrorFrame = image }
    }

    /**
     * Ficha del primer frame: lo que hay que mirar cuando la imagen sale mal.
     *
     * `rowStride` y `pixelStride` son el par que delata una conversión mal
     * hecha —una fila que se lee con el ancho equivocado produce exactamente
     * bloques de color abstractos—, y `width × height` delata el otro caso
     * clásico: una resolución minúscula negociada con el sensor y estirada a
     * pantalla completa. Se toma del PRIMER frame y no de cada uno porque no
     * cambia durante la sesión.
     */
    private fun describeFrame(image: ImageProxy) {
        val plane = image.planes.firstOrNull()
        frameGeometry = buildString {
            append("${image.width}×${image.height}")
            append(" fmt=${image.format}")
            append(" planos=${image.planes.size}")
            if (plane != null) {
                append(" rowStride=${plane.rowStride}")
                append(" pxStride=${plane.pixelStride}")
            }
            append(" rot=${image.imageInfo.rotationDegrees}°")
        }
        Log.i(LOG_TAG, "frame: $frameGeometry")
    }

    /**
     * ¿Estamos en un emulador?
     *
     * Esta comprobación existe porque su ausencia costó cuatro rondas de
     * depuración. El emulador de Android Studio no simula una cámara con una
     * cara delante: sirve una **escena sintética** —polígonos planos verdes,
     * marrones y grises—. Eso se ve exactamente igual que memoria gráfica
     * corrupta, y encima el rastreo facial reporta cero caras con toda la razón,
     * porque en esa escena no hay ninguna cara. El síntoma imita a la perfección
     * un fallo de render y un fallo de señal a la vez, y no lo es ninguno de los
     * dos: el bloque de RA **no se puede evaluar en un emulador**.
     *
     * La heurística es la de siempre —`goldfish`/`ranchu` son los dispositivos
     * virtuales de QEMU— y se usa solo para AVISAR, nunca para bloquear: en el
     * emulador se desarrolla la interfaz, los flujos y la telemetría con toda
     * normalidad. Lo único que no se puede hacer ahí es juzgar la imagen.
     */
    private fun isEmulator(): Boolean =
        android.os.Build.HARDWARE.contains("goldfish") ||
            android.os.Build.HARDWARE.contains("ranchu") ||
            android.os.Build.FINGERPRINT.startsWith("generic") ||
            android.os.Build.FINGERPRINT.contains("emulator") ||
            android.os.Build.MODEL.contains("Emulator") ||
            android.os.Build.MODEL.contains("Android SDK built for") ||
            android.os.Build.PRODUCT.contains("sdk_gphone")

    /**
     * Vigilancia de la cámara, con una ficha que se pueda REPORTAR.
     *
     * Mientras no se haya reconocido NI UNA cara, algo va mal y la pantalla lo
     * dice con cifras en vez de con un fondo raro que hay que interpretar. En
     * cuanto aparece la primera cara, la ficha desaparece sola: al niño no le
     * sobra ni un elemento en pantalla, y a la logopeda no le falta ninguno
     * cuando lo necesita.
     */
    private fun watchCameraHealth() {
        val emulator = isEmulator()
        if (emulator) Log.w(LOG_TAG, "emulador detectado: la cámara sirve una escena sintética, no una cara")

        scope.launch {
            // En un emulador el aviso sale de inmediato: no hay nada que esperar,
            // ahí nunca va a aparecer una cara. En un teléfono se le da margen
            // para que la ficha no parpadee mientras arranca la cámara.
            if (!emulator) delay(CAMERA_HEALTH_MS)
            while (facesSeen == 0L) {
                cameraReport = buildString {
                    appendLine("${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL} · Android ${android.os.Build.VERSION.RELEASE} (API ${android.os.Build.VERSION.SDK_INT})")
                    if (emulator) {
                        appendLine("")
                        appendLine("EMULADOR. Su cámara sirve una escena sintética —polígonos")
                        appendLine("planos de colores—, no una cara: el fondo que ves NO está")
                        appendLine("roto y el rastreo facial no puede encontrar nada.")
                        appendLine("Este bloque solo se puede evaluar en un móvil real.")
                        appendLine("")
                    }
                    if (framesFromCamera == 0L) {
                        appendLine("La cámara no está entregando ninguna imagen.")
                    } else {
                        appendLine("sensor  $frameGeometry")
                        appendLine("espejo  $mirrorGeometry")
                    }
                    engine?.frameError?.let { appendLine("error   $it") }
                    append("frames $framesFromCamera · inferencias $framesInferred · caras $facesSeen")
                }
                delay(CAMERA_REPORT_TICK_MS)
            }
            cameraReport = ""
        }
    }

    /** Un frame que ha COMPLETADO inferencia, con cara o sin ella. */
    private fun onFrameProcessed() {
        framesInferred += 1
        fpsMeter.onFrame()
    }

    private fun onSignals(signals: FaceSignals) {
        lastFaceMs = SystemClock.elapsedRealtime()
        facesSeen += 1
        distance.update(signals)
        when (mode) {
            MODE_CALIBRATION -> collectCalibrationSample(signals)
            MODE_APTITUDE -> collectPointerJitter(signals)
            MODE_DIAGNOSTICS -> diagnostics.update(
                signals = signals,
                yawCompensated = imu.compensatedYaw(signals.headPose.yawDeg),
                distanceMm = distance.currentMm,
                separationDeg = geometry.separationDeg(distance.currentMm, 3),
                steady = imu.isSteady(),
            )
            else -> exercise?.onSignals(signals)
        }
    }

    // ---- Flujo por modo -----------------------------------------------------

    private fun startModeFlow() {
        when (mode) {
            MODE_APTITUDE -> runAptitudeFlow()
            MODE_CALIBRATION -> runCalibrationFlow()
            // Diagnóstico: no hay flujo que orquestar. La pantalla se limita a
            // mostrar lo que llega, y se cierra cuando la logopeda quiere.
            MODE_DIAGNOSTICS -> { statusText = "Señales en vivo · pulsa atrás para salir" }
            else -> runExerciseFlow()
        }
    }

    private fun runExerciseFlow() {
        val cfg = config ?: run { finishWith(outcome = "aborted"); return }
        val profile = ArProfileStore.load(this) ?: run { finishWith(outcome = "aborted"); return }

        val ctx = ExerciseContext(
            context = this,
            thresholds = cfg.thresholds,
            scene = scene,
            geometry = geometry,
            distance = distance,
            imu = imu,
            profile = profile,
            trialsPlanned = cfg.trials,
        )

        exercise = when (cfg.exerciseId) {
            ArExerciseId.AR1 -> Ar1Orofacial(ctx)
            ArExerciseId.AR2 -> Ar2Vra(
                ctx = ctx,
                player = StimulusPlayer(this),
                timestampSource = AptitudeTest.cameraTimestampSource(this),
                clockOffsetUs = AptitudeTest.clockOffsetUs(),
                latencyUncertaintyMs = profile.probes.audioJitterMs,
            )
            ArExerciseId.AR3 -> {
                val calibration = Calibration.load(this, cfg.patientKey)
                if (calibration == null) { finishWith(outcome = "aborted"); return }
                // El DeviceProfile manda: nivel C → 2 dianas. Y dentro de la
                // sesión, si el RMS de calibración implica jitter > 2,5°, baja a
                // 2 dianas Y LO REGISTRA (targetCount viaja en cada ensayo).
                val targets = if (profile.level == AptitudeLevel.C || calibration.rmsDeg > 2.5f) 2 else 3
                Ar3Fixation(
                    ctx = ctx,
                    pointer = pointerFor(cfg.thresholds.pointerSource),
                    calibration = calibration,
                    targetCount = targets,
                    vocabulary = DEFAULT_VOCABULARY,
                )
            }
            ArExerciseId.AR4 -> Ar4SpatialSearch(ctx)
            ArExerciseId.AR5 -> Ar5FeedCatch(ctx)
            ArExerciseId.AR6 -> Ar6BuddyMimicry(ctx)
        }

        scene.setModel(exercise!!.model)
        val setupHint = exercise!!.setupHint
        statusText = setupHint

        // Bucle de ejercicio con vigilancia, y no es una precaución teórica: los
        // tres ejercicios AVANZAN SOLO CON LA CARA DENTRO. AR-1 necesita 90
        // frames válidos para su línea base antes de premiar nada; AR-2 no
        // dispara el primer estímulo hasta que el niño lleva medio segundo
        // mirando al frente. Si la cara no se ve —el peque se fue, el teléfono se
        // cayó de lado, el encuadre nunca fue bueno— `finished` no llega a ser
        // cierto NUNCA y el bucle original giraba indefinidamente: la app no
        // avanzaba a la siguiente tarea, con la cámara abierta y el teléfono
        // calentándose hasta que el sistema lo mataba.
        //
        // Las tres salidas de aquí abajo lo convierten en algo acotado: un aviso
        // al adulto a los pocos segundos, un cierre honesto si la ausencia se
        // prolonga y un techo absoluto de duración. Un cierre con `timeout` y
        // cero ensayos es un resultado; un bucle infinito no lo es.
        scope.launch {
            val startedMs = SystemClock.elapsedRealtime()
            var hinting = false
            while (exercise?.finished == false) {
                val now = SystemClock.elapsedRealtime()
                exercise?.onTick(now)

                val sinceFace = now - lastFaceMs
                when {
                    sinceFace >= NO_FACE_STOP_MS -> { finishWith(outcome = "timeout"); return@launch }
                    sinceFace >= NO_FACE_HINT_MS -> {
                        if (!hinting) { statusText = NO_FACE_HINT; hinting = true }
                    }
                    hinting -> { statusText = setupHint; hinting = false }
                }
                if (now - startedMs >= SESSION_MAX_MS) { finishWith(outcome = "timeout"); return@launch }

                delay(33)
            }
            finishWith(outcome = "completed")
        }
    }

    /**
     * Prueba de Aptitud: 25 s de run sostenido con la escena montada, más las
     * sondas que no necesitan tiempo. Se mide fps SOSTENIDOS y su pendiente,
     * porque un pico de 30 fps que cae a 12 al cuarto minuto es un fracaso
     * disfrazado y la media lo esconde.
     */
    private fun runAptitudeFlow() {
        statusText = "Mira a la osita y sigue sus saltos…"

        // La escena 3D se monta DURANTE la medida, y no es decoración: lo que
        // ahoga a la gama de entrada no es la cámara sola ni la inferencia sola,
        // es la combinación cámara + MediaPipe + Filament sosteniéndose a la vez.
        // Midiendo sin la escena, un teléfono salía nivel B y luego se arrastraba
        // en el ejercicio real — que es exactamente el «fracaso disfrazado» que
        // esta prueba existe para detectar.
        scene.setModel(ArModel.CAR)

        fpsMeter.start(APTITUDE_MS)

        // La osita tiene que EXISTIR. La instrucción pedía seguir sus saltos y en
        // pantalla no había nada que seguir: el niño miraba una cámara en negro
        // sin tarea, y la sonda de RMS del puntero —que decide si AR-3 se juega
        // con tres dianas o con dos— se alimentaba de una mirada errante en vez
        // de una mirada dirigida. Saltando por el mismo recorrido que la
        // calibración, la prueba mide lo que dice medir.
        scope.launch {
            val w = geometry.widthPx.toFloat()
            val h = geometry.heightPx.toFloat()
            val deadline = SystemClock.elapsedRealtime() + APTITUDE_MS
            var hop = 0
            while (SystemClock.elapsedRealtime() < deadline) {
                val (fx, fy) = APTITUDE_HOPS[hop % APTITUDE_HOPS.size]
                bearTarget = PointF(w * fx, h * fy)
                hop += 1
                delay(APTITUDE_HOP_MS)
            }
            bearTarget = null
        }

        scope.launch {
            delay(APTITUDE_MS)
            scene.setModel(ArModel.NONE)

            val distanceMm = distance.currentMm
            val probes = DeviceProbes(
                fpsP5 = fpsMeter.fpsP5(),
                thermalSlope = fpsMeter.thermalSlope(),
                thermalStatus = AptitudeTest.thermalStatus(this@ValeriaArActivity),
                timestampSource = AptitudeTest.cameraTimestampSource(this@ValeriaArActivity),
                clockOffsetUs = AptitudeTest.clockOffsetUs(),
                // El jitter de audio y el balance de canales solo se pueden medir
                // con el montaje de campo libre delante (§7.2). Sin él van como
                // null explícito: el nivel A no se alcanza, y eso es correcto.
                audioJitterMs = null,
                channelBalanceDb = null,
                // MAX_VALUE si no hubo ventanas suficientes: sin medida no se
                // afirma que el puntero sea estable, se afirma lo contrario.
                pointerRmsDeg = pointerJitter.jitterDeg() ?: Float.MAX_VALUE,
                imuAvailable = imu.available,
                screenWidthMm = geometry.widthMm,
                screenHeightMm = geometry.heightMm,
                achievableSeparationDeg = geometry.separationDeg(distanceMm, 3),
            )
            val profile = AptitudeTest.profile(this@ValeriaArActivity, probes)
            ArProfileStore.save(this@ValeriaArActivity, profile)

            val payload = JSONObject().put("deviceProfile", profile.toJson())
            finishWithPayload(payload)
        }
    }

    /** Ruido del puntero durante el calentamiento, en grados. Decide 3 dianas o 2. */
    private fun collectPointerJitter(signals: FaceSignals) {
        val p = pointerFor(config?.thresholds?.pointerSource ?: PointerKind.NOSE_RAY).rawPoint(signals) ?: return
        val pxPerDeg = geometry.pxPerDeg(distance.currentMm)
        if (pxPerDeg <= 0f) return
        pointerJitter.addSampleDeg(p.x * geometry.widthPx / pxPerDeg)
    }

    /** Rutina de 5 puntos: 4 esquinas + centro, con la osita como diana. */
    private fun runCalibrationFlow() {
        val kind = PointerKind.from(intent.getStringExtra(EXTRA_POINTER))
        // Se fija ANTES de lanzar la corrutina: el muestreo real ocurre en
        // onSignals → collectCalibrationSample, que corre en el hilo del
        // listener y puede llegar antes que la primera diana.
        calibrationPointer = pointerFor(kind)
        val w = geometry.widthPx.toFloat()
        val h = geometry.heightPx.toFloat()
        val points = listOf(
            PointF(w * 0.1f, h * 0.15f), PointF(w * 0.9f, h * 0.15f),
            PointF(w * 0.9f, h * 0.85f), PointF(w * 0.1f, h * 0.85f),
            PointF(w * 0.5f, h * 0.5f),
        )

        scope.launch {
            statusText = "Sigue a la osita con la mirada"
            for (p in points) {
                bearTarget = p
                synchronized(calLock) { calSamples.clear() }
                delay(700)               // que llegue la mirada antes de muestrear
                calCollecting = true
                delay(1200)
                calCollecting = false
                // Se copia bajo candado y se promedia fuera: el listener de
                // MediaPipe sigue entregando frames mientras esto ocurre.
                val samples = synchronized(calLock) { ArrayList(calSamples) }
                if (samples.isNotEmpty()) {
                    calObserved.add(
                        PointF(
                            samples.map { it.x }.average().toFloat(),
                            samples.map { it.y }.average().toFloat(),
                        )
                    )
                    calScreen.add(p)
                }
            }
            bearTarget = null

            val pxPerDeg = geometry.pxPerDeg(distance.currentMm)
            val calibration = Calibration.fit(calObserved, calScreen, pxPerDeg)
            if (calibration == null) { finishWith(outcome = "aborted"); return@launch }
            Calibration.save(this@ValeriaArActivity, patientKey, calibration)

            finishWithPayload(
                JSONObject()
                    .put("rmsPx", calibration.rmsPx.toDouble())
                    .put("rmsDeg", calibration.rmsDeg.toDouble())
            )
        }
    }

    private var calibrationPointer: eu.futureforkids.valeria.ar.signal.PointerSource? = null

    private fun collectCalibrationSample(signals: FaceSignals) {
        if (!calCollecting) return
        // Solo se muestrea con el teléfono quieto: una calibración tomada con el
        // móvil en la mano describe la mano, no la mirada.
        if (!imu.isSteady(300L)) return
        calibrationPointer?.rawPoint(signals)?.let {
            synchronized(calLock) { calSamples.add(it) }
        }
    }

    // ---- Cierre -------------------------------------------------------------

    private fun finishWith(outcome: String) {
        val cfg = config
        val profile = ArProfileStore.load(this)
        val payload = if (cfg != null && profile != null) {
            ArSessionResult(
                exerciseId = cfg.exerciseId,
                outcome = outcome,
                startedAt = startedAt,
                endedAt = System.currentTimeMillis(),
                thresholds = cfg.thresholds,
                deviceProfile = profile,
                trials = exercise?.trials ?: emptyList(),
            ).toJson()
        } else {
            JSONObject().put("outcome", outcome)
        }
        finishWithPayload(payload)
    }

    private fun finishWithPayload(payload: JSONObject) {
        setResult(Activity.RESULT_OK, Intent().putExtra(EXTRA_RESULT, payload.toString()))
        finish()
    }

    /**
     * El orden de aquí importa y antes estaba invertido: se cerraba el motor de
     * señal ANTES de parar el executor que le entrega frames, así que un frame en
     * vuelo podía entrar en un landmarker recién cerrado. El cierre correcto va
     * de fuera hacia dentro —primero se corta el grifo, después se cierra lo que
     * bebía de él— y se espera un momento a que el hilo de análisis termine.
     */
    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()

        runCatching { analysisUseCase?.clearAnalyzer() }
        runCatching { cameraProvider?.unbindAll() }
        analysisUseCase = null
        cameraProvider = null

        analysisExecutor.shutdown()
        // Tope, no coste esperado: un frame tarda milisegundos en soltarse. Está
        // para que el cierre no dependa de la suerte, no para esperar de verdad.
        runCatching { analysisExecutor.awaitTermination(300, TimeUnit.MILLISECONDS) }

        engine?.close()
        engine = null
        exercise?.close()
        imu.stop()
    }

    companion object {
        const val EXTRA_MODE = "valeria.ar.mode"
        const val EXTRA_CONFIG = "valeria.ar.config"
        const val EXTRA_PATIENT_KEY = "valeria.ar.patientKey"
        const val EXTRA_POINTER = "valeria.ar.pointer"
        const val EXTRA_RESULT = "valeria.ar.result"

        const val MODE_EXERCISE = "exercise"
        const val MODE_APTITUDE = "aptitude"
        const val MODE_CALIBRATION = "calibration"
        const val MODE_DIAGNOSTICS = "diagnostics"

        private const val APTITUDE_MS = 25_000L
        private const val APTITUDE_HOP_MS = 2_000L

        /**
         * Recorrido de la osita durante la Prueba de Aptitud, en fracción de
         * pantalla. Barre las cuatro esquinas y el centro —el mismo espacio que
         * cubre la calibración— para que el RMS del puntero se mida sobre miradas
         * dirigidas a todo el campo y no solo al centro.
         */
        private val APTITUDE_HOPS = listOf(
            0.5f to 0.5f, 0.12f to 0.18f, 0.88f to 0.18f, 0.5f to 0.5f,
            0.88f to 0.82f, 0.12f to 0.82f, 0.5f to 0.5f, 0.12f to 0.5f,
            0.88f to 0.5f, 0.5f to 0.18f, 0.5f to 0.82f, 0.5f to 0.5f,
        )

        /** Aviso al adulto: la cara lleva un rato fuera, pero la sesión sigue. */
        private const val NO_FACE_HINT_MS = 5_000L
        private const val NO_FACE_HINT =
            "No veo la carita. Coloca el teléfono apoyado, a un palmo y medio, con la cara centrada."

        /**
         * Ausencia sostenida: se cierra con `timeout`. Un minuto es tiempo de
         * sobra para recolocar a un niño que se ha movido, y poco para que un
         * teléfono se caliente con la cámara abierta sin medir nada.
         */
        private const val NO_FACE_STOP_MS = 60_000L

        /**
         * Techo absoluto de la sesión. El ejercicio más largo (AR-2, 20 ensayos
         * con intervalos de 3-6 s) ronda los 3-4 minutos; ocho es holgura, no
         * presupuesto. Existe para que ningún camino raro deje la cámara abierta
         * indefinidamente.
         */
        private const val SESSION_MAX_MS = 8 * 60_000L

        /** Margen antes de empezar a mostrar la ficha de la cámara. */
        private const val CAMERA_HEALTH_MS = 3_000L
        private const val CAMERA_REPORT_TICK_MS = 500L

        private const val LOG_TAG = "ValeriaAR"

        /**
         * Vocabulario de arranque de AR-3. La primera palabra de cada fila es la
         * correcta. Es intencionadamente pequeño y provisional: la fuente buena
         * son los bancos léxicos que ya tiene Valeria+ por variedad dialectal, y
         * conectarlos es trabajo de la Fase 5, no de este andamiaje.
         */
        private val DEFAULT_VOCABULARY = listOf(
            listOf("manzana", "pelota", "zapato"),
            listOf("perro", "silla", "plátano"),
            listOf("coche", "flor", "vaso"),
            listOf("gato", "mesa", "pan"),
        )

        fun intent(context: Context, mode: String): Intent =
            Intent(context, ValeriaArActivity::class.java).putExtra(EXTRA_MODE, mode)
    }
}

@Composable
private fun ArHostScreen(
    mirror: ImageBitmap?,
    scene: SceneState,
    status: String,
    cameraReport: String,
    bearTarget: PointF?,
    diagnostics: DiagnosticsState?,
) {
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        // El espejo, como fondo: el niño se ve a sí mismo y la escena 3D se
        // compone encima.
        //
        // `Fit` y no `Crop`, aunque deje franjas negras a los lados. El frame es
        // 4:3 y la pantalla ronda 19,5:9, así que recortar para llenarla se come
        // casi el 40 % del alto —frente y barbilla— y devuelve el problema que
        // este bloque tiene delante: un adulto que no consigue encuadrar al niño
        // y un rastreador que pierde la cara sin que nadie entienda por qué. Con
        // `Fit`, lo que se ve en pantalla es EXACTAMENTE lo que ve el modelo, y
        // «se le sale la cara» pasa de ser una conjetura a ser algo visible.
        mirror?.let { frame ->
            Image(
                bitmap = frame,
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Fit,
            )
        }

        ValeriaArSceneView(scene, Modifier.fillMaxSize())

        diagnostics?.let { DiagnosticsPanel(it, Modifier.align(Alignment.TopStart)) }

        // Ficha de la cámara mientras no se reconozca ninguna cara. Desaparece
        // sola en cuanto aparece la primera: es un diagnóstico, no adorno.
        if (cameraReport.isNotEmpty()) {
            BasicText(
                cameraReport,
                style = TextStyle(
                    color = Color(0xFFFFC46B),
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                ),
                // TopEnd: el panel de señales en vivo ya ocupa TopStart, y en
                // diagnóstico se muestran los dos a la vez.
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(12.dp)
                    .background(Color.Black.copy(alpha = 0.55f), RoundedCornerShape(10.dp))
                    .padding(horizontal = 10.dp, vertical = 8.dp),
            )
        }

        // `offset` y no `padding`: un padding negativo lanza IllegalArgumentException
        // y las dianas de las esquinas caen a un 10-12 % del borde, que en una
        // pantalla densa son menos de los 22 dp que hay que restar para centrar
        // el emoji. Con `offset` el recorrido puede llegar al borde sin romper.
        bearTarget?.let { t ->
            val density = androidx.compose.ui.platform.LocalDensity.current
            val xDp = with(density) { t.x.toDp() }
            val yDp = with(density) { t.y.toDp() }
            BasicText(
                "🐻",
                style = TextStyle(fontSize = 44.sp),
                modifier = Modifier.offset(x = xDp - 22.dp, y = yDp - 22.dp),
            )
        }

        if (status.isNotEmpty()) {
            Column(
                Modifier.align(Alignment.BottomCenter).padding(18.dp),
            ) {
                BasicText(
                    status,
                    style = TextStyle(color = Color.White.copy(alpha = 0.85f), fontSize = 13.sp),
                )
            }
        }
    }
}

/**
 * Panel de señales en vivo (Fase 2). Cifras crudas, monoespaciadas y en una
 * columna estrecha para que quepan sobre el preview sin taparle la cara al
 * niño: la logopeda tiene que poder ver a la vez el número y a quién lo produce.
 */
@Composable
private fun DiagnosticsPanel(d: DiagnosticsState, modifier: Modifier = Modifier) {
    val line = @Composable { label: String, value: String, ok: Boolean? ->
        Row(Modifier.padding(vertical = 1.dp)) {
            BasicText(
                label.padEnd(11),
                style = TextStyle(
                    color = Color.White.copy(alpha = 0.62f),
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                ),
            )
            BasicText(
                value,
                style = TextStyle(
                    color = when (ok) {
                        true -> Color(0xFF7BE3A0)
                        false -> Color(0xFFFFC46B)   // ámbar: «fuera de rango», no «mal»
                        null -> Color.White
                    },
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                ),
            )
        }
    }

    Column(
        modifier
            .padding(12.dp)
            .background(Color.Black.copy(alpha = 0.55f), RoundedCornerShape(12.dp))
            .padding(horizontal = 12.dp, vertical = 10.dp),
    ) {
        BasicText(
            "SEÑALES EN VIVO",
            style = TextStyle(
                color = Color(0xFF00C4BE),
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
            ),
            modifier = Modifier.padding(bottom = 6.dp),
        )
        line("fps", "%.1f".format(d.fps), d.fps >= 20f)
        line("distancia", "${d.distanceMm.toInt()} mm", d.distanceMm in 250f..450f)
        line("separac.3", "%.1f°".format(d.separation3), null)
        line("yaw", "%.1f°".format(d.yaw), null)
        line("yaw mundo", "%.1f°".format(d.yawWorld), null)
        line("pitch", "%.1f°".format(d.pitch), null)
        line("roll", "%.1f°".format(d.roll), null)
        line("pucker", "%.2f".format(d.pucker), null)
        line("funnel", "%.2f".format(d.funnel), null)
        line("jawOpen", "%.2f".format(d.jawOpen), null)
        line("landmarks", "${d.landmarks}", d.landmarks > 400)
        line("cono ±12°", if (d.withinCone) "dentro" else "fuera", d.withinCone)
        line("móvil", if (d.steady) "quieto" else "en movimiento", d.steady)
        line("válidos", "${d.framesValid}/${d.framesTotal}", null)
    }
}

/**
 * Cache nativa del `DeviceProfile`. Es la única cosa que este módulo guarda, y
 * no es un dato clínico: es la ficha técnica del aparato, que el ejercicio
 * necesita leer antes de que el JS pueda pasársela.
 */
object ArProfileStore {
    private const val PREFS = "valeria_ar_profile"
    private const val KEY = "profile"

    fun save(context: Context, profile: DeviceProfile) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putString(KEY, profile.toJson().toString()).apply()
    }

    fun load(context: Context): DeviceProfile? {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null) ?: return null
        return try {
            val o = JSONObject(raw)
            val p = o.getJSONObject("probes")
            DeviceProfile(
                level = AptitudeLevel.valueOf(o.getString("level")),
                probes = DeviceProbes(
                    fpsP5 = p.optDouble("fpsP5").toFloat(),
                    thermalSlope = p.optDouble("thermalSlope", 1.0).toFloat(),
                    thermalStatus = p.optInt("thermalStatus"),
                    timestampSource = if (p.optString("timestampSource") == "realtime") {
                        TimestampSource.REALTIME
                    } else {
                        TimestampSource.UNKNOWN
                    },
                    clockOffsetUs = if (p.isNull("clockOffsetUs")) null else p.optLong("clockOffsetUs"),
                    audioJitterMs = if (p.isNull("audioJitterMs")) null else p.optDouble("audioJitterMs").toFloat(),
                    channelBalanceDb = if (p.isNull("channelBalanceDb")) null else p.optDouble("channelBalanceDb").toFloat(),
                    pointerRmsDeg = p.optDouble("pointerRmsDeg").toFloat(),
                    imuAvailable = p.optBoolean("imuAvailable"),
                    screenWidthMm = p.optDouble("screenWidthMm").toFloat(),
                    screenHeightMm = p.optDouble("screenHeightMm").toFloat(),
                    achievableSeparationDeg = p.optDouble("achievableSeparationDeg").toFloat(),
                ),
                manufacturer = o.optString("manufacturer"),
                model = o.optString("model"),
                osVersion = o.optString("osVersion"),
                measuredAt = o.optLong("measuredAt"),
            )
        } catch (e: Throwable) {
            null
        }
    }
}

package eu.futureforkids.valeria.ar

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.PointF
import android.os.Bundle
import android.os.SystemClock
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
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
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import eu.futureforkids.valeria.ar.aptitude.AptitudeTest
import eu.futureforkids.valeria.ar.aptitude.FpsMeter
import eu.futureforkids.valeria.ar.audio.StimulusPlayer
import eu.futureforkids.valeria.ar.exercises.Ar1Orofacial
import eu.futureforkids.valeria.ar.exercises.Ar2Vra
import eu.futureforkids.valeria.ar.exercises.Ar3Fixation
import eu.futureforkids.valeria.ar.exercises.ArExercise
import eu.futureforkids.valeria.ar.exercises.ExerciseContext
import eu.futureforkids.valeria.ar.scene.SceneState
import eu.futureforkids.valeria.ar.scene.ValeriaArSceneView
import eu.futureforkids.valeria.ar.signal.Calibration
import eu.futureforkids.valeria.ar.signal.DeviceAttitudeCompensator
import eu.futureforkids.valeria.ar.signal.DistanceEstimator
import eu.futureforkids.valeria.ar.signal.FaceSignalEngine
import eu.futureforkids.valeria.ar.signal.FaceSignals
import eu.futureforkids.valeria.ar.signal.ScreenGeometry
import eu.futureforkids.valeria.ar.signal.pointerFor
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
    // Scope propio en vez de lifecycleScope: evita depender de
    // androidx.lifecycle:lifecycle-runtime-ktx y deja explícito dónde se
    // cancelan las corrutinas (onDestroy), que con una cámara abierta importa.
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
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

    // La PreviewView se crea aquí y no dentro del Composable porque el caso de
    // uso de CameraX necesita su SurfaceProvider: sin ese cable, la cámara se
    // enlaza y analiza correctamente pero el niño ve una pantalla negra.
    //
    // PERFORMANCE y no COMPATIBLE, y es media cura del fondo roto. COMPATIBLE
    // dibuja el preview en un `TextureView`, es decir DENTRO de la ventana; la
    // escena 3D vive en un `SurfaceView`, que recorta un agujero transparente en
    // esa misma ventana y por tanto BORRA el preview que se había pintado
    // debajo. Con PERFORMANCE el preview pasa a ser otra superficie, en el
    // sublayer de más abajo, y las tres capas se apilan como deben (ver el
    // encabezado de `ValeriaArSceneView`). De paso se ahorra la copia por GPU de
    // cada frame que hace TextureView, que en la gama baja del parque LATAM es
    // justo donde aparecían los bloques de color.
    //
    // No es un riesgo de compatibilidad: CameraX cae a TextureView por su cuenta
    // en los dispositivos donde sabe que la superficie no se comporta.
    private val previewView: PreviewView by lazy {
        PreviewView(this).apply {
            scaleType = PreviewView.ScaleType.FILL_CENTER
            implementationMode = PreviewView.ImplementationMode.PERFORMANCE
        }
    }

    // Calibración: pares (punto de cara observado → punto de pantalla mostrado).
    private val calObserved = ArrayList<PointF>(5)
    private val calScreen = ArrayList<PointF>(5)
    private val calSamples = ArrayList<PointF>(60)
    private var calCollecting = false
    private val pointerRmsSamples = ArrayList<Float>(300)

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
                        previewView = previewView,
                        scene = scene,
                        status = statusText,
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
            onSignals = { signals -> onFrameProcessed(); onSignals(signals) },
        )
        if (engine?.isReady != true) { finishWith(outcome = "aborted"); return }

        val providerFuture = ProcessCameraProvider.getInstance(this)
        providerFuture.addListener({
            val provider = providerFuture.get()
            cameraProvider = provider
            val preview = Preview.Builder().build().apply {
                surfaceProvider = previewView.surfaceProvider
            }

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
                .setOutputImageFormat(ImageAnalysis.OUTPUT_IMAGE_FORMAT_RGBA_8888)
                .build()

            // El contador de fps NO va aquí. Aquí se cuentan los frames que la
            // cámara entrega, y el analizador ahora descarta los que llegan
            // mientras MediaPipe todavía infiere: contarlos daría 30 fps en un
            // teléfono que en realidad procesa 12, y la Prueba de Aptitud
            // clasificaría de nivel A un aparato que no sostiene el ejercicio.
            // Se cuentan en `onFrameProcessed`, es decir, inferencias acabadas.
            analysis.setAnalyzer(analysisExecutor) { image ->
                engine?.analyze(image, isFrontCamera = true)
            }
            analysisUseCase = analysis

            try {
                provider.unbindAll()
                provider.bindToLifecycle(this, CameraSelector.DEFAULT_FRONT_CAMERA, preview, analysis)
                lastFaceMs = SystemClock.elapsedRealtime()
                startModeFlow()
            } catch (e: Throwable) {
                finishWith(outcome = "aborted")
            }
        }, ContextCompat.getMainExecutor(this))
    }

    /** Un frame que ha COMPLETADO inferencia, con cara o sin ella. */
    private fun onFrameProcessed() {
        fpsMeter.onFrame()
    }

    private fun onSignals(signals: FaceSignals) {
        lastFaceMs = SystemClock.elapsedRealtime()
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
                pointerRmsDeg = pointerRms(),
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

    /** RMS del puntero durante el calentamiento, en grados. Decide 3 dianas o 2. */
    private fun collectPointerJitter(signals: FaceSignals) {
        val p = pointerFor(config?.thresholds?.pointerSource ?: PointerKind.NOSE_RAY).rawPoint(signals) ?: return
        val pxPerDeg = geometry.pxPerDeg(distance.currentMm)
        if (pxPerDeg <= 0f) return
        pointerRmsSamples.add(p.x * geometry.widthPx / pxPerDeg)
        if (pointerRmsSamples.size > 600) pointerRmsSamples.removeAt(0)
    }

    private fun pointerRms(): Float {
        if (pointerRmsSamples.size < 30) return Float.MAX_VALUE
        val mean = pointerRmsSamples.average()
        val variance = pointerRmsSamples.sumOf { val d = it - mean; d * d } / pointerRmsSamples.size
        return kotlin.math.sqrt(variance).toFloat()
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
                calSamples.clear()
                delay(700)               // que llegue la mirada antes de muestrear
                calCollecting = true
                delay(1200)
                calCollecting = false
                if (calSamples.isNotEmpty()) {
                    calObserved.add(
                        PointF(
                            calSamples.map { it.x }.average().toFloat(),
                            calSamples.map { it.y }.average().toFloat(),
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
        calibrationPointer?.rawPoint(signals)?.let { calSamples.add(it) }
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
    previewView: PreviewView,
    scene: SceneState,
    status: String,
    bearTarget: PointF?,
    diagnostics: DiagnosticsState?,
) {
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        // Preview de la cámara frontal como fondo: es AR de espejo, el niño se
        // ve a sí mismo y la escena 3D se compone encima.
        AndroidView(factory = { previewView }, modifier = Modifier.fillMaxSize())

        ValeriaArSceneView(scene, Modifier.fillMaxSize())

        diagnostics?.let { DiagnosticsPanel(it, Modifier.align(Alignment.TopStart)) }

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

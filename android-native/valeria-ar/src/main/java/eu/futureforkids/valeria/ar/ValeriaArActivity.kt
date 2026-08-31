package eu.futureforkids.valeria.ar

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.PointF
import android.os.Bundle
import android.os.SystemClock
import android.util.Log
import android.view.Surface
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import android.opengl.GLSurfaceView
import android.widget.FrameLayout
import android.view.ViewGroup
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.input.pointer.util.VelocityTracker
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
import eu.futureforkids.valeria.ar.session.ArCoreSession
import eu.futureforkids.valeria.ar.session.ArRenderer
import eu.futureforkids.valeria.ar.signal.Calibration
import eu.futureforkids.valeria.ar.signal.DeviceAttitudeCompensator
import eu.futureforkids.valeria.ar.signal.DistanceEstimator
import eu.futureforkids.valeria.ar.signal.FaceSignalEngine
import eu.futureforkids.valeria.ar.signal.FaceSignals
import eu.futureforkids.valeria.ar.signal.ScreenGeometry
import eu.futureforkids.valeria.ar.signal.pointerFor
import kotlin.math.atan2
import kotlin.math.hypot
import kotlinx.coroutines.CoroutineExceptionHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject

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
    /** Diana de Lúa: la sigue la mirada en calibración y en la Prueba de Aptitud. */
    private var luaTarget by mutableStateOf<PointF?>(null)

    /**
     * Último frame con cara dentro, en `elapsedRealtime`. Es lo que convierte
     * «no llegan señales» en un hecho con reloj: sin esto el bucle de ejercicio
     * gira para siempre esperando ensayos que nadie va a producir, con la cámara
     * abierta y el teléfono calentándose.
     */
    @Volatile private var lastFaceMs = 0L

    // ARCore es el dueño de la cámara, del contexto GL y del ciclo de vida.
    // Las tres cosas que este fichero gestionaba a mano, y las tres donde
    // estaban los cuelgues.
    private val arSession = ArCoreSession(this)
    private var arRenderer: ArRenderer? = null
    private var glView: GLSurfaceView? = null

    /**
     * ── El espejo ya no pasa por la CPU ─────────────────────────────────────
     *
     * Aquí había un `mirrorFrame: ImageBitmap` que se rellenaba treinta veces
     * por segundo: cada frame de `ImageAnalysis` se convertía a un bitmap
     * ARGB_8888 de 1,2 MB, se rotaba a otro de 1,2 MB y se publicaba en el hilo
     * de UI para que Compose lo dibujara. Unos 72 MB/s de asignación para
     * enseñar lo que la GPU ya tenía en memoria.
     *
     * Ahora ARCore escribe el frame en una textura y `CameraBackgroundRenderer`
     * la dibuja en el `GLSurfaceView` que va DEBAJO del ComposeView. Cero copias
     * por CPU. Lo que Compose pinta encima —dianas, anillo, texto— es una capa
     * transparente sobre esa textura.
     */

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
    /**
     * Estado de ARCore para la ficha de diagnóstico. Sustituye a la geometría
     * del espejo, que ya no existe porque el espejo no pasa por la CPU. Aquí lo
     * que hace falta saber es si ARCore ve una cara, porque desde el 31/8/2026
     * MediaPipe solo se despierta cuando él dice que sí: si ARCore no rastrea,
     * no hay inferencias, y sin esta línea eso parecería un fallo de MediaPipe.
     */
    private val arCoreReport: String
        get() {
            val s = arSession.session ?: return "sesión no creada"
            val cfg = runCatching { s.cameraConfig }.getOrNull()
            val res = cfg?.imageSize?.let { "${it.width}×${it.height}" } ?: "?"
            val face = if (arSession.trackedFace() != null) "cara SÍ" else "cara no"
            return "$res · $face"
        }
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

    @Volatile private var isActivityPaused = false
    private var pipelineStarted = false
    private var pauseTimestampMs = 0L
    private var accumulatedPausedDurationMs = 0L

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
                        scene = scene,
                        status = statusText,
                        cameraReport = cameraReport,
                        luaTarget = luaTarget,
                        diagnostics = if (mode == MODE_DIAGNOSTICS) diagnostics else null,
                        onFling = { v, deg -> exercise?.onFling(v, deg) },
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

    override fun onResume() {
        super.onResume()
        if (isActivityPaused) {
            val pausedDuration = SystemClock.elapsedRealtime() - pauseTimestampMs
            accumulatedPausedDurationMs += pausedDuration
            lastFaceMs = SystemClock.elapsedRealtime()
            isActivityPaused = false
            // El ejercicio tiene sus propios plazos —ventana de respuesta,
            // intervalo entre ensayos, permanencia— y también corren en
            // `elapsedRealtime`. Descontar el hueco solo del reloj de sesión
            // dejaría el ensayo en vuelo caducado al volver.
            exercise?.onSessionResumed(pausedDuration)
        }
        // Sin cámara concedida no hay sesión que reanudar: no se enciende un
        // sensor para una Activity que se está cerrando.
        if (pipelineStarted) {
            imu.start()
            // ARCore primero y el GLSurfaceView después. Al revés, el bucle de
            // GL empieza a llamar a `update()` sobre una sesión pausada y ARCore
            // lanza en cada vuelta.
            if (arSession.resume()) {
                glView?.onResume()
            } else {
                statusText = "Otra aplicación está usando la cámara."
                finishWith(outcome = "aborted")
            }
        } else if (arSession.unavailable == null && arSession.session == null) {
            // Volvemos de instalar Servicios de Google para RA: se reintenta.
            // Este es el camino que hace que aceptar la instalación NO acabe en
            // una pantalla muerta.
            startPipeline()
        }
    }

    override fun onPause() {
        super.onPause()
        isActivityPaused = true
        pauseTimestampMs = SystemClock.elapsedRealtime()
        imu.stop()
        // Orden inverso al de onResume, y por el mismo motivo: primero se para
        // el bucle que llama a `update()`, después se pausa la sesión a la que
        // llama. ARCore libera la cámara en su `pause()`, y eso es lo que hace
        // que una llamada entrante no deje el sensor colgado.
        glView?.onPause()
        arSession.pause()
        arRenderer?.onContextLost()
    }

    override fun onStop() {
        super.onStop()
        imu.stop()
    }

    // ---- Cámara y señal -----------------------------------------------------

    private fun startPipeline() {
        pipelineStarted = true
        imu.start()
        engine = FaceSignalEngine(
            context = this,
            onFaceLost = { onFrameProcessed() },
            onSignals = { signals -> onFrameProcessed(); onSignals(signals) },
        )
        if (engine?.isReady != true) { finishWith(outcome = "aborted"); return }

        // ARCore puede no estar disponible por cinco motivos distintos y cada
        // uno se le dice al adulto con sus palabras. Ninguno es un cierre
        // inesperado: un bloque de siete que no abre es una pantalla que se
        // cierra sola con su explicación.
        if (!arSession.ensureCreated()) {
            val reason = arSession.unavailable
            if (reason == null) {
                // Se ha lanzado la instalación de Play Services for AR. La
                // Activity se pausa y al volver reintenta: no se cierra.
                statusText = "Instalando Realidad Aumentada…"
                return
            }
            statusText = when (reason) {
                ArCoreSession.Unavailable.DEVICE_NOT_SUPPORTED ->
                    "Este teléfono no admite Realidad Aumentada."
                ArCoreSession.Unavailable.INSTALL_DECLINED ->
                    "La Realidad Aumentada necesita Servicios de Google para RA."
                ArCoreSession.Unavailable.APK_TOO_OLD ->
                    "Actualiza Servicios de Google para RA para usar este bloque."
                ArCoreSession.Unavailable.NO_FRONT_CAMERA ->
                    "Este teléfono no ofrece cámara frontal para Realidad Aumentada."
                ArCoreSession.Unavailable.CAMERA_BUSY ->
                    "Otra aplicación está usando la cámara."
            }
            finishWith(outcome = "unsupported")
            return
        }

        val renderer = ArRenderer(
            session = arSession,
            onFrame = { frame -> onGlFrame(frame) },
            onGlError = { msg ->
                // Un shader que no compila deja la pantalla en negro, y un
                // negro silencioso ya costó cuatro rondas de depuración.
                Log.e(LOG_TAG, "GL: $msg")
                runOnUiThread {
                    statusText = "No se pudo iniciar la Realidad Aumentada."
                    finishWith(outcome = "aborted")
                }
            },
        )
        arRenderer = renderer

        // ── El orden de esta vista importa ──────────────────────────────────
        // GLSurfaceView DEBAJO y ComposeView ENCIMA, y el GL con
        // `setZOrderMediaOverlay(false)`: el espejo es el telón del fondo y todo
        // lo demás se pinta sobre él. Es exactamente la composición que el
        // módulo anterior no podía tener —por eso Filament acabó en un
        // TextureView pagando una copia por GPU— y que aquí sale gratis porque
        // la cámara ya vive en una superficie propia.
        val gl = GLSurfaceView(this).apply {
            preserveEGLContextOnPause = true
            setEGLContextClientVersion(2)
            setEGLConfigChooser(8, 8, 8, 8, 16, 0)
            setRenderer(renderer)
            renderMode = GLSurfaceView.RENDERMODE_CONTINUOUSLY
        }
        glView = gl

        val root = findViewById<ViewGroup>(android.R.id.content)
        root.addView(
            gl,
            0,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )

        renderer.setDisplayRotation(displayRotation())

        if (!arSession.resume()) {
            statusText = "Otra aplicación está usando la cámara."
            finishWith(outcome = "aborted")
            return
        }
        gl.onResume()

        lastFaceMs = SystemClock.elapsedRealtime()
        watchCameraHealth()
        startModeFlow()
    }

    /**
     * Un frame de ARCore, en el hilo de GL.
     *
     * El espejo ya está dibujado cuando esto se llama (lo hace el renderer). Lo
     * único que queda es entregarle la imagen a MediaPipe, y **cerrarla**: el
     * pool de imágenes de ARCore es finito y no cerrarlas lo agota en segundos,
     * dejando la sesión sin frames sin dar ningún error. De ahí el `use {}`.
     */
    private fun onGlFrame(frame: com.google.ar.core.Frame) {
        framesFromCamera += 1

        // ARCore ya sabe si hay una cara. Preguntárselo a él antes de despertar
        // a MediaPipe ahorra una conversión YUV→bitmap entera en todos los
        // frames en que el niño no está delante — que en una sesión real son
        // muchos, entre ensayo y ensayo.
        if (arSession.trackedFace() == null) return

        arSession.acquireImage(frame)?.use { image ->
            if (frameGeometry.isEmpty()) describeFrame(image)
            engine?.analyze(
                image = image,
                rotationDegrees = 0,
                mirror = false,
                tCaptureUs = frame.timestamp / 1_000L,
            )
        }
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
        // ARCore recalcula el encuadre solo a partir de esto; ya no hay ningún
        // `targetRotation` que se pueda olvidar de actualizar.
        arRenderer?.setDisplayRotation(displayRotation())
    }

    /**
     * Ficha del primer frame: lo que hay que mirar cuando la imagen sale mal.
     *
     * `rowStride` y `pixelStride` son el par que delata una conversión mal
     * hecha —una fila leída con el ancho equivocado produce exactamente bloques
     * de color abstractos—, y `width × height` delata el otro caso clásico: una
     * resolución minúscula estirada a pantalla completa. Se toma del PRIMER
     * frame porque no cambia durante la sesión.
     */
    private fun describeFrame(image: android.media.Image) {
        val plane = image.planes.firstOrNull()
        frameGeometry = buildString {
            append("${image.width}×${image.height}")
            append(" fmt=${image.format}")
            append(" planos=${image.planes.size}")
            if (plane != null) {
                append(" rowStride=${plane.rowStride}")
                append(" pxStride=${plane.pixelStride}")
            }
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
                        appendLine("arcore  $arCoreReport")
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
        // Entre `onPause` y `onStop` CameraX sigue entregando frames. Contarlos
        // para la salud de la cámara es correcto —la cámara funciona—, pero
        // dejarlos mover la máquina de estados del ejercicio no: el niño no
        // está delante, y ese giro entraría como respuesta a un estímulo que
        // nadie ha oído.
        if (isActivityPaused) return
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
                if (isActivityPaused) {
                    delay(100)
                    continue
                }
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
                val effectiveSessionDuration = now - startedMs - accumulatedPausedDurationMs
                if (effectiveSessionDuration >= SESSION_MAX_MS) { finishWith(outcome = "timeout"); return@launch }

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
        statusText = "Mira a Lúa y sigue sus saltos…"

        // La escena 3D se monta DURANTE la medida, y no es decoración: lo que
        // ahoga a la gama de entrada no es la cámara sola ni la inferencia sola,
        // es la combinación cámara + MediaPipe + Filament sosteniéndose a la vez.
        // Midiendo sin la escena, un teléfono salía nivel B y luego se arrastraba
        // en el ejercicio real — que es exactamente el «fracaso disfrazado» que
        // esta prueba existe para detectar.
        scene.setModel(ArModel.CAR)

        fpsMeter.start(APTITUDE_MS)

        // Lúa tiene que EXISTIR. La instrucción pedía seguir sus saltos y en
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
                luaTarget = PointF(w * fx, h * fy)
                hop += 1
                delay(APTITUDE_HOP_MS)
            }
            luaTarget = null
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

    /** Rutina de 5 puntos: 4 esquinas + centro, con Lúa como diana. */
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
            statusText = "Sigue a Lúa con la mirada"
            for (p in points) {
                luaTarget = p
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
            luaTarget = null

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
        if (isFinishing || isDestroyed) return
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
        if (isFinishing || isDestroyed) return
        setResult(Activity.RESULT_OK, Intent().putExtra(EXTRA_RESULT, payload.toString()))
        finish()
    }

    /**
     * El orden de aquí importa y antes estaba invertido: se cerraba el motor de
     * señal ANTES de parar lo que le entrega frames, así que un frame en vuelo
     * podía entrar en un landmarker recién cerrado — y eso no lanza una
     * excepción de Java, cierra la app desde el código nativo.
     *
     * El cierre va de fuera hacia dentro: primero se corta el grifo (el bucle de
     * GL), después la sesión que lo alimenta, y solo entonces lo que bebía de
     * ella. Con ARCore esto es más corto que antes porque ya no hay executor
     * propio que parar ni frames de CameraX que desenlazar: `glView.onPause()`
     * detiene el único hilo que llamaba a `analyze()`.
     */
    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()

        // 1. Se para el bucle de GL: nadie más va a llamar a `analyze()`.
        runCatching { glView?.onPause() }
        // 2. Se cierra la sesión de ARCore, que libera cámara y contexto.
        runCatching { arSession.close() }
        arRenderer = null
        glView = null

        // 3. Y solo ahora el motor de señal, que ya no puede recibir nada.
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
         * Recorrido de Lúa durante la Prueba de Aptitud, en fracción de
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
    scene: SceneState,
    status: String,
    cameraReport: String,
    luaTarget: PointF?,
    diagnostics: DiagnosticsState?,
    onFling: (Float, Float) -> Unit,
) {
    Box(
        Modifier
            // SIN `background(Color.Black)`: debajo de este ComposeView está el
            // GLSurfaceView con el espejo de ARCore. Pintar un fondo opaco aquí
            // lo taparía entero — que es exactamente la clase de fallo que
            // costó cuatro rondas cuando el swapchain de Filament salía opaco.
            .fillMaxSize()
            // Lectura del lanzamiento de AR-5. Se mide lo que hace el dedo: la
            // velocidad la da el `VelocityTracker` de Compose con las posiciones
            // reales del puntero, y el ángulo es la desviación entre la
            // dirección del gesto y la recta que va del punto de salida a Lúa,
            // que está en el centro. Los demás ejercicios reciben el gesto y no
            // hacen nada con él: `onFling` tiene cuerpo vacío en la interfaz.
            //
            // El estado del arrastre vive dentro de `pointerInput` y no en un
            // `remember { mutableStateOf() }`: nadie lo lee durante la
            // composición, y como estado recompondría la pantalla entera en cada
            // frame del dedo, justo mientras se mide.
            .pointerInput(Unit) {
                val center = Offset(size.width / 2f, size.height / 2f)
                val tracker = VelocityTracker()
                var start = Offset.Zero
                var end = Offset.Zero
                detectDragGestures(
                    onDragStart = { position ->
                        tracker.resetTracking()
                        start = position
                        end = position
                    },
                    onDrag = { change, _ ->
                        tracker.addPosition(change.uptimeMillis, change.position)
                        end = change.position
                    },
                    onDragEnd = {
                        val throwVec = end - start
                        // Un toque sin recorrido no tiene dirección: sin ella no
                        // hay puntería que medir y el gesto se descarta.
                        if (hypot(throwVec.x, throwVec.y) >= MIN_DRAG_PX) {
                            val targetVec = center - start
                            val velocity = tracker.calculateVelocity()
                            val deg = Math.toDegrees(
                                (atan2(throwVec.y, throwVec.x) - atan2(targetVec.y, targetVec.x)).toDouble()
                            ).toFloat()
                            // A grados con signo en (-180, 180]: 359° de
                            // desviación son 1°, y sin normalizar entrarían como
                            // un fallo enorme.
                            onFling(
                                hypot(velocity.x, velocity.y),
                                ((deg + 540f) % 360f) - 180f,
                            )
                        }
                    },
                )
            }
    ) {
        // El espejo ya NO se pinta aquí: lo dibuja el GLSurfaceView que hay
        // debajo, desde la textura de ARCore, sin pasar por la CPU. Esta capa
        // es solo la sobreimpresión 2D.
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
        luaTarget?.let { t ->
            val density = androidx.compose.ui.platform.LocalDensity.current
            val xDp = with(density) { t.x.toDp() }
            val yDp = with(density) { t.y.toDp() }
            LuaTargetHead(
                Modifier
                    .offset(x = xDp - LUA_TARGET_RADIUS_DP, y = yDp - LUA_TARGET_RADIUS_DP)
                    .size(LUA_TARGET_RADIUS_DP * 2),
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

/** Radio de la diana de Lúa. Los 22 dp de siempre, ahora dibujados. */
private val LUA_TARGET_RADIUS_DP = 22.dp

/** Recorrido mínimo del dedo para que un gesto cuente como lanzamiento. */
private const val MIN_DRAG_PX = 48f

/**
 * La cabeza de Lúa como diana de calibración y de la Prueba de Aptitud.
 *
 * Dibujada, no escrita: aquí había un emoji 🐻 del sistema, que además de ser
 * el oso retirado lo pinta el fabricante del teléfono y cambia de forma entre
 * marcas. La diana la sigue la mirada del niño y su silueta es la referencia de
 * la medida, así que no puede depender de la fuente que traiga el aparato.
 *
 * Mismo trazo que el resto de la marca: verde Valeria, orejas triangulares,
 * hocico y bigotes en un solo color.
 */
@Composable
private fun LuaTargetHead(modifier: Modifier = Modifier) {
    Canvas(modifier) {
        val r = size.minDimension / 2f
        val c = Offset(size.width / 2f, size.height / 2f)
        val fur = Color(0xFF00C4BE)
        val ink = Color(0xFF07312F)

        // Orejas: dos triángulos anclados a la circunferencia del cráneo.
        listOf(-1f, 1f).forEach { side ->
            val baseX = c.x + side * r * 0.62f
            drawPath(
                androidx.compose.ui.graphics.Path().apply {
                    moveTo(baseX - r * 0.26f, c.y - r * 0.52f)
                    lineTo(baseX + r * 0.26f, c.y - r * 0.46f)
                    lineTo(baseX + side * r * 0.10f, c.y - r * 1.02f)
                    close()
                },
                color = fur,
            )
        }

        drawCircle(color = fur, radius = r * 0.78f, center = c)

        // Ojos y hocico.
        listOf(-1f, 1f).forEach { side ->
            drawCircle(color = ink, radius = r * 0.10f, center = Offset(c.x + side * r * 0.28f, c.y - r * 0.08f))
        }
        drawCircle(color = ink, radius = r * 0.08f, center = Offset(c.x, c.y + r * 0.20f))

        // Bigotes: tres a cada lado, del grosor del set de iconos.
        listOf(-1f, 1f).forEach { side ->
            listOf(-0.16f, 0f, 0.16f).forEach { dy ->
                drawLine(
                    color = ink,
                    start = Offset(c.x + side * r * 0.30f, c.y + r * (0.20f + dy * 0.5f)),
                    end = Offset(c.x + side * r * 0.86f, c.y + r * (0.20f + dy)),
                    strokeWidth = r * 0.055f,
                    cap = StrokeCap.Round,
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

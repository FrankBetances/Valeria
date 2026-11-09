package eu.futureforkids.valeria.ar

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Paint
import android.graphics.Typeface
import android.opengl.GLSurfaceView
import android.opengl.Matrix
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Surface
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.google.ar.core.Frame
import com.google.ar.core.Plane
import com.google.ar.core.Pose
import com.google.ar.core.TrackingState
import eu.futureforkids.valeria.ar.session.ArCoreSession
import eu.futureforkids.valeria.ar.session.ArRenderer
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin

/**
 * Valeria+ · Escena de un set sobre la mesa (9/11/2026).
 *
 * Cámara trasera con ARCore. El adulto toca la mesa y el escenario del set
 * —siluetas de piezas, corriente de luz, ondas, flechas— queda anclado ahí, en
 * perspectiva real. Etapa A: los pasos los confirma el adulto con un botón por
 * evento; cada pulsación cambia lo que se ve y avisa en vivo a JS
 * (ValeriaArModule.emitSceneEvent) para que la Lúa física ponga su cara.
 * Etapa B (detección de piezas por marcador) depende del banco D2.
 *
 * No analiza imagen ni guarda nada: la cámara solo se usa para ver la mesa.
 * La escena llega de JS en JSON (src/steam/arScenes.ts): una sola fuente.
 */
class ValeriaArSceneActivity : ComponentActivity() {

    private lateinit var arSession: ArCoreSession
    private var glView: GLSurfaceView? = null
    private var renderer: ArRenderer? = null
    private val main = Handler(Looper.getMainLooper())
    private var installRetries = 0
    private var finished = false

    private lateinit var spec: SceneSpec

    // Estado compartido entre el hilo de GL (escribe) y Compose (lee).
    @Volatile private var snapshot: ProjectionSnapshot? = null
    @Volatile private var pendingTap: Offset? = null
    @Volatile private var anchor: com.google.ar.core.Anchor? = null
    @Volatile private var planesFound = false

    private var confirmed by mutableStateOf(setOf<String>())
    private var lastEvent by mutableStateOf<String?>(null)
    private var anchored by mutableStateOf(false)
    private var tableSeen by mutableStateOf(false)

    private val cameraPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startPipeline() else finishWith("denied")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        spec = SceneSpec.parse(intent.getStringExtra(EXTRA_SPEC))
        arSession = ArCoreSession(this, rear = true)

        setContentView(
            ComposeView(this).apply {
                setContent {
                    SceneOverlay(
                        spec = spec,
                        snapshot = { snapshot },
                        confirmed = confirmed,
                        lastEvent = lastEvent,
                        anchored = anchored,
                        tableSeen = tableSeen,
                        onTap = { if (anchor == null) pendingTap = it },
                        onEvent = { id -> confirm(id) },
                        onReplace = { anchor?.detach(); anchor = null; anchored = false },
                        onClose = { finishWith("completed") },
                    )
                }
            }
        )

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() { finishWith("completed") }
        })

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startPipeline()
        } else {
            cameraPermission.launch(Manifest.permission.CAMERA)
        }
    }

    private fun confirm(id: String) {
        confirmed = confirmed + id
        lastEvent = id
        ValeriaArModule.emitSceneEvent(id)
    }

    private fun startPipeline() {
        if (isFinishing || isDestroyed || glView != null) return
        if (!arSession.ensureCreated()) {
            val reason = arSession.unavailable
            if (reason == null && installRetries < 4) {
                installRetries++
                main.postDelayed({ startPipeline() }, 2_500L)
                return
            }
            finishWith("unsupported", reason?.name)
            return
        }
        val r = ArRenderer(
            session = arSession,
            onFrame = { frame -> onGlFrame(frame) },
            onGlError = { runOnUiThread { finishWith("aborted") } },
        )
        renderer = r
        val gl = GLSurfaceView(this).apply {
            preserveEGLContextOnPause = true
            setEGLContextClientVersion(2)
            setEGLConfigChooser(8, 8, 8, 8, 16, 0)
            setRenderer(r)
            renderMode = GLSurfaceView.RENDERMODE_CONTINUOUSLY
        }
        glView = gl
        val root = findViewById<ViewGroup>(android.R.id.content)
        root.addView(gl, 0, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        r.setDisplayRotation(displayRotation())
        if (!arSession.resume()) { finishWith("aborted", "CAMERA_BUSY"); return }
        gl.onResume()
    }

    /** Hilo de GL: planos, toque del adulto, ancla y matrices para Compose. */
    private fun onGlFrame(frame: Frame) {
        val camera = frame.camera
        if (camera.trackingState != TrackingState.TRACKING) return
        val session = arSession.session ?: return

        if (!planesFound) {
            planesFound = session.getAllTrackables(Plane::class.java)
                .any { it.trackingState == TrackingState.TRACKING && it.type == Plane.Type.HORIZONTAL_UPWARD_FACING }
            if (planesFound) runOnUiThread { tableSeen = true }
        }

        val tap = pendingTap
        if (tap != null && anchor == null) {
            pendingTap = null
            val hit = frame.hitTest(tap.x, tap.y).firstOrNull { h ->
                val t = h.trackable
                t is Plane && t.type == Plane.Type.HORIZONTAL_UPWARD_FACING && t.isPoseInPolygon(h.hitPose)
            }
            if (hit != null) {
                // El escenario mira a la tableta: +z local apunta a la cámara.
                val hp = hit.hitPose
                val cp = camera.pose
                val yaw = atan2(cp.tx() - hp.tx(), cp.tz() - hp.tz())
                val q = floatArrayOf(0f, sin(yaw / 2f), 0f, cos(yaw / 2f))
                anchor = session.createAnchor(Pose(floatArrayOf(hp.tx(), hp.ty(), hp.tz()), q))
                runOnUiThread { anchored = true }
            }
        }

        val a = anchor ?: run { snapshot = null; return }
        if (a.trackingState != TrackingState.TRACKING) return
        val view = FloatArray(16)
        val proj = FloatArray(16)
        val model = FloatArray(16)
        camera.getViewMatrix(view, 0)
        camera.getProjectionMatrix(proj, 0, 0.05f, 20f)
        a.pose.toMatrix(model, 0)
        val vp = FloatArray(16)
        val mvp = FloatArray(16)
        Matrix.multiplyMM(vp, 0, proj, 0, view, 0)
        Matrix.multiplyMM(mvp, 0, vp, 0, model, 0)
        snapshot = ProjectionSnapshot(mvp)
    }

    override fun onResume() {
        super.onResume()
        if (glView != null) {
            if (arSession.resume()) glView?.onResume() else finishWith("aborted", "CAMERA_BUSY")
        }
    }

    override fun onPause() {
        super.onPause()
        glView?.onPause()
        arSession.pause()
    }

    override fun onDestroy() {
        main.removeCallbacksAndMessages(null)
        anchor?.detach()
        anchor = null
        arSession.close()
        super.onDestroy()
    }

    private fun finishWith(outcome: String, reason: String? = null) {
        if (finished) return
        finished = true
        val payload = JSONObject()
            .put("outcome", outcome)
            .put("confirmed", JSONArray(confirmed.toList()))
        if (reason != null) payload.put("reason", reason)
        setResult(Activity.RESULT_OK, Intent().putExtra(ValeriaArActivity.EXTRA_RESULT, payload.toString()))
        finish()
    }

    @Suppress("DEPRECATION")
    private fun displayRotation(): Int =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) display?.rotation ?: Surface.ROTATION_0
        else windowManager.defaultDisplay.rotation

    companion object {
        const val EXTRA_SPEC = "valeria.ar.sceneSpec"

        fun intent(context: Context, specJson: String): Intent =
            Intent(context, ValeriaArSceneActivity::class.java).putExtra(EXTRA_SPEC, specJson)
    }
}

/** Matriz modelo-vista-proyección del ancla en el último frame. */
private class ProjectionSnapshot(val mvp: FloatArray) {
    /** Punto del plano de la mesa (metros, ejes del ancla) a píxeles; `null` si queda detrás. */
    fun project(x: Float, z: Float, w: Float, h: Float, y: Float = 0f): Offset? {
        val out = FloatArray(4)
        Matrix.multiplyMV(out, 0, mvp, 0, floatArrayOf(x, y, z, 1f), 0)
        if (out[3] <= 0.0001f) return null
        val nx = out[0] / out[3]
        val ny = out[1] / out[3]
        return Offset((nx * 0.5f + 0.5f) * w, (1f - (ny * 0.5f + 0.5f)) * h)
    }
}

/** Escena en JSON, tal como la arma src/steam/arScenes.ts. */
private class SceneSpec(
    val title: String,
    val placeHint: String,
    val searchHint: String,
    val closeLabel: String,
    val replaceLabel: String,
    val luaPrefix: String,
    val events: List<SceneEvent>,
    val shapes: List<SceneShape>,
) {
    companion object {
        fun parse(raw: String?): SceneSpec {
            val o = try { JSONObject(raw ?: "{}") } catch (e: Throwable) { JSONObject() }
            val ev = o.optJSONArray("events") ?: JSONArray()
            val sh = o.optJSONArray("shapes") ?: JSONArray()
            return SceneSpec(
                title = o.optString("title"),
                placeHint = o.optString("placeHint"),
                searchHint = o.optString("searchHint"),
                closeLabel = o.optString("closeLabel", "OK"),
                replaceLabel = o.optString("replaceLabel"),
                luaPrefix = o.optString("luaPrefix"),
                events = (0 until ev.length()).map { i ->
                    val e = ev.getJSONObject(i)
                    SceneEvent(e.optString("id"), e.optString("label"), e.optString("prompt"), e.optString("face"))
                },
                shapes = (0 until sh.length()).map { i -> SceneShape.parse(sh.getJSONObject(i)) },
            )
        }
    }
}

private class SceneEvent(val id: String, val label: String, val prompt: String, val face: String)

private class SceneShape(
    val kind: String,
    val style: String,
    val pts: List<Pair<Float, Float>>,
    val w: Float,
    val d: Float,
    val r: Float,
    val text: String,
    val after: String?,
    val last: Set<String>,
) {
    /** Visible siempre, al confirmar su evento (`after`) o mientras es el último (`last`). */
    fun visible(confirmed: Set<String>, lastEvent: String?): Boolean = when {
        last.isNotEmpty() -> lastEvent != null && lastEvent in last
        after != null -> after in confirmed
        else -> true
    }

    companion object {
        fun parse(o: JSONObject): SceneShape {
            val p = o.optJSONArray("pts") ?: JSONArray()
            val pts = (0 until p.length()).map { i ->
                val q = p.getJSONArray(i); q.getDouble(0).toFloat() to q.getDouble(1).toFloat()
            }
            val l = o.optJSONArray("last") ?: JSONArray()
            return SceneShape(
                kind = o.optString("kind"),
                style = o.optString("style", "piece"),
                pts = pts,
                w = o.optDouble("w", 0.0).toFloat(),
                d = o.optDouble("d", 0.0).toFloat(),
                r = o.optDouble("r", 0.0).toFloat(),
                text = o.optString("text"),
                after = if (o.has("after")) o.optString("after") else null,
                last = (0 until l.length()).map { l.getString(it) }.toSet(),
            )
        }
    }
}

private val TURQ = Color(0xFF00C4BE)
private val AMBER = Color(0xFFFFB547)
private val PIECE_FILL = Color(0xCCEFEAE0)
private val INK = Color(0xFF0B1220)

@Composable
private fun SceneOverlay(
    spec: SceneSpec,
    snapshot: () -> ProjectionSnapshot?,
    confirmed: Set<String>,
    lastEvent: String?,
    anchored: Boolean,
    tableSeen: Boolean,
    onTap: (Offset) -> Unit,
    onEvent: (String) -> Unit,
    onReplace: () -> Unit,
    onClose: () -> Unit,
) {
    var tick by remember { mutableLongStateOf(0L) }
    LaunchedEffect(Unit) { while (true) withFrameNanos { tick = it } }
    val labelPaint = remember {
        Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = android.graphics.Color.WHITE
            textSize = 34f
            typeface = Typeface.DEFAULT_BOLD
            setShadowLayer(6f, 0f, 2f, android.graphics.Color.BLACK)
            textAlign = Paint.Align.CENTER
        }
    }

    Box(Modifier.fillMaxSize().pointerInput(Unit) { detectTapGestures { onTap(it) } }) {
        Canvas(Modifier.fillMaxSize()) {
            val t = tick / 1_000_000_000.0
            val snap = snapshot() ?: return@Canvas
            spec.shapes.filter { it.visible(confirmed, lastEvent) }.forEach { drawShape(it, snap, t, labelPaint) }
        }

        // Arriba: terminar y recolocar.
        Row(Modifier.align(Alignment.TopStart).padding(16.dp)) {
            Chip(spec.closeLabel, onClose)
            if (anchored && spec.replaceLabel.isNotEmpty()) { Spacer(Modifier.width(10.dp)); Chip(spec.replaceLabel, onReplace) }
        }
        if (spec.title.isNotEmpty()) {
            BasicText(
                spec.title,
                style = TextStyle(color = Color.White, fontSize = 18.sp),
                modifier = Modifier.align(Alignment.TopEnd).padding(18.dp)
                    .background(Color.Black.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
            )
        }

        // Abajo: indicación y un botón por evento (etapa A, confirma el adulto).
        Column(
            Modifier.align(Alignment.BottomCenter).fillMaxWidth()
                .background(INK.copy(alpha = 0.82f)).padding(horizontal = 14.dp, vertical = 10.dp),
        ) {
            val current = spec.events.firstOrNull { it.id == lastEvent }
            val hint = when {
                !anchored && !tableSeen -> spec.searchHint
                !anchored -> spec.placeHint
                current != null -> current.prompt + (if (current.face.isNotEmpty()) "   ·   ${spec.luaPrefix}${current.face}" else "")
                else -> spec.events.firstOrNull()?.prompt ?: ""
            }
            BasicText(hint, style = TextStyle(color = Color.White, fontSize = 16.sp))
            if (anchored) {
                Spacer(Modifier.width(1.dp).padding(top = 8.dp))
                Row(Modifier.horizontalScroll(rememberScrollState()).padding(top = 8.dp)) {
                    spec.events.forEach { e ->
                        val done = e.id in confirmed
                        Chip(if (done) "${e.label} ✓" else e.label, { onEvent(e.id) })
                        Spacer(Modifier.width(10.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun Chip(label: String, onClick: () -> Unit) {
    BasicText(
        label,
        style = TextStyle(color = INK, fontSize = 16.sp),
        modifier = Modifier
            .background(Color.White, RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
    )
}

private fun DrawScope.drawShape(s: SceneShape, snap: ProjectionSnapshot, t: Double, labelPaint: Paint) {
    val w = size.width
    val h = size.height
    val color = when (s.style) { "warn" -> AMBER; "piece" -> Color(0xFFB9B2A6); else -> TURQ }
    val dashed = if (s.style == "ghost" || s.style == "warn") PathEffect.dashPathEffect(floatArrayOf(18f, 14f)) else null
    when (s.kind) {
        "tile" -> {
            val (x, z) = s.pts.firstOrNull() ?: return
            val corners = listOf(x to z, x + s.w to z, x + s.w to z + s.d, x to z + s.d).map { snap.project(it.first, it.second, w, h) ?: return }
            val path = Path().apply { moveTo(corners[0].x, corners[0].y); corners.drop(1).forEach { lineTo(it.x, it.y) }; close() }
            if (s.style == "piece") drawPath(path, PIECE_FILL)
            if (s.style == "light") drawPath(path, TURQ.copy(alpha = 0.28f))
            drawPath(path, color, style = Stroke(width = 5f, pathEffect = dashed))
            if (s.text.isNotEmpty()) {
                val c = snap.project(x + s.w / 2, z + s.d + 0.02f, w, h) ?: return
                drawContext.canvas.nativeCanvas.drawText(s.text, c.x, c.y, labelPaint)
            }
        }
        "circle", "rings" -> {
            val (x, z) = s.pts.firstOrNull() ?: return
            val rings = if (s.kind == "rings") 3 else 1
            for (k in 0 until rings) {
                val grow = if (s.kind == "rings") (((t * 0.6) + k / 3.0) % 1.0).toFloat() else 0f
                val rr = s.r * (1f + grow * 1.6f)
                val pts = (0..32).map { i ->
                    val a = i / 32.0 * 2 * Math.PI
                    snap.project(x + rr * cos(a).toFloat(), z + rr * sin(a).toFloat(), w, h) ?: return
                }
                val path = Path().apply { moveTo(pts[0].x, pts[0].y); pts.drop(1).forEach { lineTo(it.x, it.y) }; close() }
                val alpha = if (s.kind == "rings") (1f - grow) else 1f
                if (s.style == "piece" && s.kind == "circle") drawPath(path, PIECE_FILL)
                drawPath(path, color.copy(alpha = alpha), style = Stroke(width = 5f, pathEffect = dashed))
            }
            if (s.text.isNotEmpty()) {
                val c = snap.project(x, z + s.r + 0.025f, w, h) ?: return
                drawContext.canvas.nativeCanvas.drawText(s.text, c.x, c.y, labelPaint)
            }
        }
        "line", "flow" -> {
            val pts = s.pts.map { snap.project(it.first, it.second, w, h) ?: return }
            if (pts.size < 2) return
            val path = Path().apply { moveTo(pts[0].x, pts[0].y); pts.drop(1).forEach { lineTo(it.x, it.y) } }
            val effect = if (s.kind == "flow") PathEffect.dashPathEffect(floatArrayOf(36f, 22f), (-(t * 120.0) % 58.0).toFloat()) else dashed
            drawPath(path, color, style = Stroke(width = if (s.kind == "flow") 14f else 6f, pathEffect = effect))
        }
        "arrow" -> {
            if (s.pts.size < 2) return
            val a = snap.project(s.pts[0].first, s.pts[0].second, w, h) ?: return
            val b = snap.project(s.pts[1].first, s.pts[1].second, w, h) ?: return
            drawLine(color, a, b, strokeWidth = 10f)
            val ang = atan2((b.y - a.y).toDouble(), (b.x - a.x).toDouble())
            val head = 34f
            for (side in listOf(-0.5, 0.5)) {
                val p = Offset((b.x - head * cos(ang + side)).toFloat(), (b.y - head * sin(ang + side)).toFloat())
                drawLine(color, b, p, strokeWidth = 10f)
            }
        }
        "label" -> {
            val (x, z) = s.pts.firstOrNull() ?: return
            val c = snap.project(x, z, w, h) ?: return
            drawContext.canvas.nativeCanvas.drawText(s.text, c.x, c.y, labelPaint)
        }
    }
}

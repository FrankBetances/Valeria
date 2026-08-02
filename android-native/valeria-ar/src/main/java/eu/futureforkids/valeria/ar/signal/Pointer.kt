package eu.futureforkids.valeria.ar.signal

import android.content.Context
import android.graphics.PointF
import eu.futureforkids.valeria.ar.PointerKind
import org.json.JSONArray
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Valeria+ · Puntero facial de AR-3.
 *
 * Dos fuentes, una sola lógica de tarea. El ejercicio no sabe cuál está activa:
 * si el iris tiembla más de 2,5° en el teléfono que haya, se conmuta a nariz sin
 * tocar una línea de la lógica de selección. Y si tampoco la nariz baja de 2,5°,
 * la conmutación siguiente no es de puntero sino de NÚMERO DE DIANAS (§7.3).
 */
interface PointerSource {
    val kind: PointerKind
    /** Punto en coordenadas normalizadas de cara (0..1). null si no es fiable. */
    fun rawPoint(signals: FaceSignals): PointF?
}

/** Preciso, ruidoso en gama baja. Necesita los landmarks de iris (468/473). */
class IrisPointer : PointerSource {
    override val kind = PointerKind.IRIS

    override fun rawPoint(signals: FaceSignals): PointF? {
        val lm = signals.landmarks
        if (lm.size <= FaceIdx.IRIS_RIGHT_CENTER) return null
        val l = lm[FaceIdx.IRIS_LEFT_CENTER]
        val r = lm[FaceIdx.IRIS_RIGHT_CENTER]
        return PointF((l.x + r.x) / 2f, (l.y + r.y) / 2f)
    }
}

/**
 * Robusto y grueso: rayo desde la punta de la nariz, con el yaw/pitch de la
 * cabeza como dirección. Lo que mide es «hacia dónde apunta la cara», que en un
 * niño de 4 años suele ser una intención más legible que su mirada.
 */
class NoseRayPointer : PointerSource {
    override val kind = PointerKind.NOSE_RAY

    override fun rawPoint(signals: FaceSignals): PointF? {
        val lm = signals.landmarks
        if (lm.size <= FaceIdx.NOSE_TIP) return null
        val nose = lm[FaceIdx.NOSE_TIP]
        val pose = signals.headPose
        // Proyección lineal del giro sobre el plano de pantalla. La constante la
        // absorbe la homografía de calibración; aquí solo importa que sea
        // monótona y estable.
        val gain = 1f / 45f
        return PointF(
            nose.x + pose.yawDeg * gain,
            nose.y - pose.pitchDeg * gain,
        )
    }
}

fun pointerFor(kind: PointerKind): PointerSource =
    if (kind == PointerKind.IRIS) IrisPointer() else NoseRayPointer()

/**
 * Homografía cara→pantalla ajustada con la rutina de 5 puntos (4 esquinas + el
 * centro, ~15 s, con la osita de Valeria como diana). Un rayo facial sin
 * calibrar no apunta a nada, así que esto no es opcional.
 *
 * Se guarda POR PACIENTE Y POR DISPOSITIVO. Es geometría del aparato y de la
 * postura, no un dato clínico: por eso vive en las preferencias del módulo y no
 * en el historial cifrado del paciente. Caduca si cambia la orientación o la
 * distancia de trabajo declarada.
 */
class Calibration(private val h: FloatArray, val rmsPx: Float, val rmsDeg: Float) {

    /** Aplica la homografía: punto de cara (0..1) → píxel de pantalla. */
    fun project(p: PointF): PointF {
        val d = h[6] * p.x + h[7] * p.y + 1f
        if (abs(d) < 1e-6f) return PointF(Float.NaN, Float.NaN)
        return PointF(
            (h[0] * p.x + h[1] * p.y + h[2]) / d,
            (h[3] * p.x + h[4] * p.y + h[5]) / d,
        )
    }

    fun toJson(): JSONObject = JSONObject()
        .put("h", JSONArray().apply { h.forEach { put(it.toDouble()) } })
        .put("rmsPx", rmsPx.toDouble())
        .put("rmsDeg", rmsDeg.toDouble())

    companion object {
        private const val PREFS = "valeria_ar_calibration"

        fun fromJson(o: JSONObject): Calibration? = try {
            val arr = o.getJSONArray("h")
            val h = FloatArray(8) { arr.getDouble(it).toFloat() }
            Calibration(h, o.optDouble("rmsPx", 0.0).toFloat(), o.optDouble("rmsDeg", 0.0).toFloat())
        } catch (e: Throwable) {
            null
        }

        fun load(context: Context, patientKey: String): Calibration? {
            val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .getString(patientKey, null) ?: return null
            return try { fromJson(JSONObject(raw)) } catch (e: Throwable) { null }
        }

        fun save(context: Context, patientKey: String, calibration: Calibration) {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(patientKey, calibration.toJson().toString())
                .apply()
        }

        /**
         * Ajusta la homografía por mínimos cuadrados a partir de los pares
         * (punto de cara observado → punto de pantalla mostrado). Con 5 puntos
         * el sistema está sobredeterminado (10 ecuaciones, 8 incógnitas), que es
         * justo lo que permite estimar el residuo: sin residuo no se puede
         * decidir si este teléfono aguanta tres dianas o dos.
         *
         * @param pxPerDeg píxeles por grado a la distancia de trabajo estimada,
         *                 para convertir el RMS a la unidad que decide el modo.
         */
        fun fit(
            observed: List<PointF>,
            screen: List<PointF>,
            pxPerDeg: Float,
        ): Calibration? {
            if (observed.size < 4 || observed.size != screen.size) return null

            val n = observed.size
            val a = Array(2 * n) { FloatArray(8) }
            val b = FloatArray(2 * n)
            for (i in 0 until n) {
                val (u, v) = observed[i].x to observed[i].y
                val (x, y) = screen[i].x to screen[i].y
                a[2 * i] = floatArrayOf(u, v, 1f, 0f, 0f, 0f, -u * x, -v * x)
                b[2 * i] = x
                a[2 * i + 1] = floatArrayOf(0f, 0f, 0f, u, v, 1f, -u * y, -v * y)
                b[2 * i + 1] = y
            }

            val h = solveLeastSquares(a, b, 8) ?: return null
            val cal = Calibration(h, 0f, 0f)

            var sumSq = 0f
            for (i in 0 until n) {
                val p = cal.project(observed[i])
                if (p.x.isNaN()) return null
                val dx = p.x - screen[i].x
                val dy = p.y - screen[i].y
                sumSq += dx * dx + dy * dy
            }
            val rmsPx = sqrt(sumSq / n)
            val rmsDeg = if (pxPerDeg > 0f) rmsPx / pxPerDeg else Float.MAX_VALUE
            return Calibration(h, rmsPx, rmsDeg)
        }

        /** Ecuaciones normales AᵀA·h = Aᵀb resueltas con eliminación gaussiana. */
        private fun solveLeastSquares(a: Array<FloatArray>, b: FloatArray, cols: Int): FloatArray? {
            val ata = Array(cols) { FloatArray(cols + 1) }
            for (i in a.indices) {
                for (r in 0 until cols) {
                    for (c in 0 until cols) ata[r][c] += a[i][r] * a[i][c]
                    ata[r][cols] += a[i][r] * b[i]
                }
            }
            for (col in 0 until cols) {
                var pivot = col
                for (r in col + 1 until cols) if (abs(ata[r][col]) > abs(ata[pivot][col])) pivot = r
                if (abs(ata[pivot][col]) < 1e-8f) return null   // puntos degenerados
                val tmp = ata[col]; ata[col] = ata[pivot]; ata[pivot] = tmp
                val d = ata[col][col]
                for (c in col..cols) ata[col][c] /= d
                for (r in 0 until cols) {
                    if (r == col) continue
                    val f = ata[r][col]
                    if (f == 0f) continue
                    for (c in col..cols) ata[r][c] -= f * ata[col][c]
                }
            }
            return FloatArray(cols) { ata[it][cols] }
        }
    }
}

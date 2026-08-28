package eu.futureforkids.valeria.ar

import org.json.JSONArray
import org.json.JSONObject

/**
 * Valeria+ · Vocabulario del bloque de Realidad Aumentada.
 *
 * Estos tipos son el espejo exacto de `src/valeriaArBridge.ts`. Viajan como
 * JSON por el puente porque es la única representación que ambos lados leen sin
 * ambigüedad, y porque así el contrato se puede versionar de una sola pieza.
 *
 * Muro MDR: aquí no hay ni un solo campo de veredicto. Todo lo que cruza son
 * magnitudes físicas —milisegundos, grados, ratios, recuentos— y los umbrales
 * que el adulto fijó. La interpretación es de una persona.
 */

enum class ArExerciseId(val id: String) {
    AR1("ar1"), AR2("ar2"), AR3("ar3"), AR4("ar4"), AR5("ar5"), AR6("ar6");

    companion object {
        fun from(raw: String): ArExerciseId =
            entries.firstOrNull { it.id == raw } ?: throw IllegalArgumentException("Ejercicio desconocido: $raw")
    }
}

enum class PointerKind(val id: String) {
    IRIS("iris"), NOSE_RAY("noseRay");

    companion object {
        fun from(raw: String?): PointerKind = if (raw == "iris") IRIS else NOSE_RAY
    }
}

enum class AptitudeLevel { A, B, C, D }

/** Base de reloj de las marcas de tiempo de la cámara. Decide si AR-2 mide o solo juega. */
enum class TimestampSource(val id: String) { REALTIME("realtime"), UNKNOWN("unknown") }

/** Bluetooth no aparece: está vetado en AR-2 y nunca puede ser un transductor válido. */
enum class Transducer(val id: String) {
    EXTERNAL_SPEAKERS("externalSpeakers"),
    WIRED_HEADPHONES("wiredHeadphones"),
    DEVICE_SPEAKER("deviceSpeaker"),
    UNKNOWN("unknown"),
}

/** 'instrument' registra latencia; 'game' la deja explícitamente en null. */
enum class TrialMode(val id: String) { INSTRUMENT("instrument"), GAME("game") }

/**
 * Umbrales clínicos. Llegan del Panel del Adulto y son CONSTANTES durante toda
 * la sesión: ninguna clase de este módulo tiene permiso para reescribirlos.
 */
data class ArThresholds(
    val holdMs: Long,
    val turnDeg: Float,
    val responseWindowMs: Long,
    val dwellMs: Long,
    val pointerSource: PointerKind,
) {
    fun toJson(): JSONObject = JSONObject()
        .put("holdMs", holdMs)
        .put("turnDeg", turnDeg.toDouble())
        .put("responseWindowMs", responseWindowMs)
        .put("dwellMs", dwellMs)
        .put("pointerSource", pointerSource.id)

    companion object {
        fun from(o: JSONObject): ArThresholds = ArThresholds(
            holdMs = o.optLong("holdMs", 1500L),
            turnDeg = o.optDouble("turnDeg", 15.0).toFloat(),
            responseWindowMs = o.optLong("responseWindowMs", 2000L),
            dwellMs = o.optLong("dwellMs", 1200L),
            pointerSource = PointerKind.from(o.optString("pointerSource", "noseRay")),
        )
    }
}

data class ArExerciseConfig(
    val exerciseId: ArExerciseId,
    /** Clave opaca del paciente. Nunca un nombre: solo sirve para la calibración. */
    val patientKey: String,
    val thresholds: ArThresholds,
    val trials: Int,
) {
    companion object {
        fun from(o: JSONObject): ArExerciseConfig = ArExerciseConfig(
            exerciseId = ArExerciseId.from(o.getString("exerciseId")),
            patientKey = o.optString("patientKey", "anon"),
            thresholds = ArThresholds.from(o.optJSONObject("thresholds") ?: JSONObject()),
            trials = o.optInt("trials", 10).coerceIn(1, 60),
        )
    }
}

/** Las siete sondas de la Prueba de Aptitud (§3.5 del plan). */
data class DeviceProbes(
    val fpsP5: Float,
    val thermalSlope: Float,
    val thermalStatus: Int,
    val timestampSource: TimestampSource,
    val clockOffsetUs: Long?,
    val audioJitterMs: Float?,
    val channelBalanceDb: Float?,
    val pointerRmsDeg: Float,
    val imuAvailable: Boolean,
    val screenWidthMm: Float,
    val screenHeightMm: Float,
    val achievableSeparationDeg: Float,
) {
    fun toJson(): JSONObject = JSONObject()
        .put("fpsP5", fpsP5.toDouble())
        .put("thermalSlope", thermalSlope.toDouble())
        .put("thermalStatus", thermalStatus)
        .put("timestampSource", timestampSource.id)
        .putOrNull("clockOffsetUs", clockOffsetUs)
        .putOrNull("audioJitterMs", audioJitterMs)
        .putOrNull("channelBalanceDb", channelBalanceDb)
        .put("pointerRmsDeg", pointerRmsDeg.toDouble())
        .put("imuAvailable", imuAvailable)
        .put("screenWidthMm", screenWidthMm.toDouble())
        .put("screenHeightMm", screenHeightMm.toDouble())
        .put("achievableSeparationDeg", achievableSeparationDeg.toDouble())
}

data class DeviceProfile(
    val level: AptitudeLevel,
    val probes: DeviceProbes,
    val manufacturer: String,
    val model: String,
    val osVersion: String,
    val measuredAt: Long,
) {
    fun toJson(): JSONObject = JSONObject()
        .put("level", level.name)
        .put("probes", probes.toJson())
        .put("manufacturer", manufacturer)
        .put("model", model)
        .put("osVersion", osVersion)
        // El motor de señal viaja SIEMPRE. Si algún día conviven MediaPipe en
        // Android y ARKit en iOS, la diferencia entre dos niños podría ser la
        // plataforma y no el niño: con esto se controla como covariable.
        .put("signalEngine", "mediapipe")
        .put("platform", "android")
        .put("measuredAt", measuredAt)
}

/**
 * Un ensayo. La regla dura del módulo: **un registro por ensayo, jamás por
 * frame**. A 30 fps, tres minutos serían 5.400 eventos; la agregación ocurre
 * aquí dentro y al JS solo sube el resumen.
 */
sealed class TrialRecord {
    abstract val index: Int
    abstract val at: Long
    abstract val thermalStatus: Int
    abstract val angularSeparationDeg: Float?
    abstract val mode: TrialMode
    abstract val voided: Boolean
    abstract val voidReason: String?

    protected fun base(exerciseId: String): JSONObject = JSONObject()
        .put("exerciseId", exerciseId)
        .put("index", index)
        .put("at", at)
        .put("thermalStatus", thermalStatus)
        .putOrNull("angularSeparationDeg", angularSeparationDeg)
        .put("mode", mode.id)
        .put("voided", voided)
        .putOrNull("voidReason", voidReason)

    abstract fun toJson(): JSONObject

    data class Ar1(
        override val index: Int,
        override val at: Long,
        override val thermalStatus: Int,
        override val angularSeparationDeg: Float?,
        override val mode: TrialMode,
        override val voided: Boolean,
        override val voidReason: String?,
        val holdMaxMs: Long,
        val holdTotalMs: Long,
        val puckerPeak: Float,
        val apertureRatioPeak: Float,
        val symmetryWorst: Float,
        val framesValid: Int,
        val framesTotal: Int,
        val attemptsToFire: Int,
    ) : TrialRecord() {
        override fun toJson(): JSONObject = base("ar1")
            .put("holdMaxMs", holdMaxMs)
            .put("holdTotalMs", holdTotalMs)
            .put("puckerPeak", puckerPeak.toDouble())
            .put("apertureRatioPeak", apertureRatioPeak.toDouble())
            .put("symmetryWorst", symmetryWorst.toDouble())
            .put("framesValid", framesValid)
            .put("framesTotal", framesTotal)
            .put("attemptsToFire", attemptsToFire)
    }

    data class Ar2(
        override val index: Int,
        override val at: Long,
        override val thermalStatus: Int,
        override val angularSeparationDeg: Float?,
        override val mode: TrialMode,
        override val voided: Boolean,
        override val voidReason: String?,
        val side: String,
        val isCatch: Boolean,
        val transducer: Transducer,
        val gainDbSpl: Float?,
        val tStimulusUs: Long?,
        val tTurnUs: Long?,
        val latencyMs: Long?,
        /** Por qué no hay latencia. Un dato ausente y etiquetado es honesto. */
        val latencyNullReason: String?,
        val peakYawDeg: Float,
        val correctSide: Boolean,
        val timedOut: Boolean,
        val deviceLatencyUncertaintyMs: Float?,
    ) : TrialRecord() {
        override fun toJson(): JSONObject = base("ar2")
            .put("side", side)
            .put("isCatch", isCatch)
            .put("transducer", transducer.id)
            .putOrNull("gainDbSpl", gainDbSpl)
            .putOrNull("tStimulusUs", tStimulusUs)
            .putOrNull("tTurnUs", tTurnUs)
            .putOrNull("latencyMs", latencyMs)
            .putOrNull("latencyNullReason", latencyNullReason)
            .put("peakYawDeg", peakYawDeg.toDouble())
            .put("correctSide", correctSide)
            .put("timedOut", timedOut)
            .putOrNull("deviceLatencyUncertaintyMs", deviceLatencyUncertaintyMs)
    }

    data class Ar3(
        override val index: Int,
        override val at: Long,
        override val thermalStatus: Int,
        override val angularSeparationDeg: Float?,
        override val mode: TrialMode,
        override val voided: Boolean,
        override val voidReason: String?,
        val targetId: String,
        val targetCount: Int,
        /** Adónde mira PRIMERO: sesgo de comprensión inmediata. */
        val firstFixationId: String?,
        val tFirstFixationMs: Long?,
        /** Qué acaba eligiendo, con posible corrección. Solo esto dispara el giro 360°. */
        val selectedId: String?,
        val dwellMs: Long,
        val revisits: Int,
        val pointerSource: PointerKind,
        val calibrationRmsPx: Float,
        val outOfBoundsMs: Long,
    ) : TrialRecord() {
        override fun toJson(): JSONObject = base("ar3")
            .put("targetId", targetId)
            .put("targetCount", targetCount)
            .putOrNull("firstFixationId", firstFixationId)
            .putOrNull("tFirstFixationMs", tFirstFixationMs)
            .putOrNull("selectedId", selectedId)
            .put("dwellMs", dwellMs)
            .put("revisits", revisits)
            .put("pointerSource", pointerSource.id)
            .put("calibrationRmsPx", calibrationRmsPx.toDouble())
            .put("outOfBoundsMs", outOfBoundsMs)
    }

    data class Ar4(
        override val index: Int,
        override val at: Long,
        override val thermalStatus: Int,
        override val angularSeparationDeg: Float?,
        override val mode: TrialMode,
        override val voided: Boolean,
        override val voidReason: String?,
        val targetQuadrant: String,
        val targetYawDeg: Float,
        val targetPitchDeg: Float,
        val acquisitionTimeMs: Long,
        val fovealDwellMs: Long,
        val yawRmsDeg: Float,
        val success: Boolean,
    ) : TrialRecord() {
        override fun toJson(): JSONObject = base("ar4")
            .put("targetQuadrant", targetQuadrant)
            .put("targetYawDeg", targetYawDeg.toDouble())
            .put("targetPitchDeg", targetPitchDeg.toDouble())
            .put("acquisitionTimeMs", acquisitionTimeMs)
            .put("fovealDwellMs", fovealDwellMs)
            .put("yawRmsDeg", yawRmsDeg.toDouble())
            .put("success", success)
    }

    data class Ar5(
        override val index: Int,
        override val at: Long,
        override val thermalStatus: Int,
        override val angularSeparationDeg: Float?,
        override val mode: TrialMode,
        override val voided: Boolean,
        override val voidReason: String?,
        val throwVelocityPxPerS: Float,
        val throwAngleDeg: Float,
        val targetDistanceMm: Float,
        val timeToThrowMs: Long,
        val hit: Boolean,
        val catchReactionMs: Long,
    ) : TrialRecord() {
        override fun toJson(): JSONObject = base("ar5")
            .put("throwVelocityPxPerS", throwVelocityPxPerS.toDouble())
            .put("throwAngleDeg", throwAngleDeg.toDouble())
            .put("targetDistanceMm", targetDistanceMm.toDouble())
            .put("timeToThrowMs", timeToThrowMs)
            .put("hit", hit)
            .put("catchReactionMs", catchReactionMs)
    }

    data class Ar6(
        override val index: Int,
        override val at: Long,
        override val thermalStatus: Int,
        override val angularSeparationDeg: Float?,
        override val mode: TrialMode,
        override val voided: Boolean,
        override val voidReason: String?,
        val targetExpression: String,
        val blendshapePeak: Float,
        val holdMs: Long,
        val symmetryRatio: Float,
        val mimicSuccess: Boolean,
    ) : TrialRecord() {
        override fun toJson(): JSONObject = base("ar6")
            .put("targetExpression", targetExpression)
            .put("blendshapePeak", blendshapePeak.toDouble())
            .put("holdMs", holdMs)
            .put("symmetryRatio", symmetryRatio.toDouble())
            .put("mimicSuccess", mimicSuccess)
    }
}

data class ArSessionResult(
    val exerciseId: ArExerciseId,
    val outcome: String,          // completed | aborted | denied
    val startedAt: Long,
    val endedAt: Long,
    val thresholds: ArThresholds,
    val deviceProfile: DeviceProfile,
    val trials: List<TrialRecord>,
) {
    fun toJson(): JSONObject = JSONObject()
        .put("exerciseId", exerciseId.id)
        .put("outcome", outcome)
        .put("startedAt", startedAt)
        .put("endedAt", endedAt)
        .put("thresholds", thresholds.toJson())
        .put("deviceProfile", deviceProfile.toJson())
        .put("trials", JSONArray().apply { trials.forEach { put(it.toJson()) } })
}

/** `put` con null explícito: JSONObject.put(String, null) borra la clave, y aquí
 *  la diferencia entre «no hay dato» y «la clave no existe» importa. */
internal fun JSONObject.putOrNull(key: String, value: Any?): JSONObject =
    if (value == null) put(key, JSONObject.NULL) else put(key, value)

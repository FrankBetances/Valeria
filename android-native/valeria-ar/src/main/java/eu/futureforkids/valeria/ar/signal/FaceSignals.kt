package eu.futureforkids.valeria.ar.signal

/**
 * Valeria+ · Vocabulario NEUTRO de señal facial.
 *
 * Esta es la decisión que abarata iOS y que no cuesta nada tomar hoy (§13.4 del
 * plan): `FaceSignals` se define en el vocabulario que comparten MediaPipe y
 * ARKit —52 blendshapes con los mismos nombres y el mismo rango 0..1, más una
 * matriz de transformación facial 4×4—, **nunca** en tipos de MediaPipe.
 *
 * Consecuencia directa: los ejercicios, los umbrales, la calibración, la
 * histéresis y la telemetría son código compartido y agnóstico de plataforma.
 * Lo único que habrá que portar a iOS es quien PRODUCE estos datos.
 */
data class FaceSignals(
    /** Coeficientes 0..1 con nomenclatura ARKit. Vacío si el modelo no los emite. */
    val blendshapes: Map<String, Float>,
    /** Matriz de transformación facial 4×4, en orden por filas. */
    val transform: FloatArray,
    /** Landmarks normalizados 0..1 respecto al frame de entrada. */
    val landmarks: List<Landmark>,
    /**
     * Marca de tiempo de CAPTURA DEL SENSOR, en microsegundos. No es el instante
     * del callback: la diferencia entre ambas es justo la magnitud que AR-2
     * pretende medir, así que confundirlas no daría un dato ruidoso sino
     * sesgado, que es peor.
     */
    val tCaptureUs: Long,
    /** Calidad del seguimiento 0..1. Por debajo de 0,5 el frame no se usa. */
    val trackingQuality: Float,
) {
    val headPose: HeadPose by lazy { HeadPose.fromMatrix(transform) }

    fun blendshape(key: String): Float = blendshapes[key] ?: 0f

    // data class + FloatArray: equals/hashCode generados comparan referencia.
    // Se sobreescriben para que dos señales idénticas lo sean de verdad (lo usa
    // el arnés de paridad de señal Android↔iOS de la Fase 8).
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is FaceSignals) return false
        return tCaptureUs == other.tCaptureUs &&
            blendshapes == other.blendshapes &&
            transform.contentEquals(other.transform) &&
            landmarks == other.landmarks
    }

    override fun hashCode(): Int =
        31 * (31 * blendshapes.hashCode() + transform.contentHashCode()) + tCaptureUs.hashCode()
}

data class Landmark(val x: Float, val y: Float, val z: Float)

/**
 * Nombres ARKit de los blendshapes que usa este módulo. Se declaran como
 * constantes y no como literales sueltos para que un cambio de nomenclatura
 * upstream rompa en un sitio y no en cinco.
 */
object Blend {
    const val MOUTH_PUCKER = "mouthPucker"
    const val MOUTH_FUNNEL = "mouthFunnel"
    const val JAW_OPEN = "jawOpen"
    const val MOUTH_SMILE_LEFT = "mouthSmileLeft"
    const val MOUTH_SMILE_RIGHT = "mouthSmileRight"
    const val CHEEK_PUFF = "cheekPuff"
    const val EYE_BLINK_LEFT = "eyeBlinkLeft"
    const val EYE_BLINK_RIGHT = "eyeBlinkRight"
}

/**
 * Índices canónicos del malla facial de 478 puntos.
 *
 * CUIDADO: son canónicos, no dogma. La Fase 0 los verifica contra el modelo
 * `.task` real antes de darlos por buenos; si el modelo cambia de topología,
 * este objeto es el único sitio que hay que tocar.
 */
object FaceIdx {
    const val EYE_OUTER_LEFT = 33      // canto externo del ojo izquierdo
    const val EYE_OUTER_RIGHT = 263    // canto externo del ojo derecho
    const val MOUTH_CORNER_LEFT = 61
    const val MOUTH_CORNER_RIGHT = 291
    const val LIP_UPPER_INNER = 13
    const val LIP_LOWER_INNER = 14
    const val NOSE_TIP = 1
    const val IRIS_LEFT_CENTER = 468
    const val IRIS_RIGHT_CENTER = 473
}

/** Ángulos de Euler de la cabeza, en grados, respecto a la cámara. */
data class HeadPose(val yawDeg: Float, val pitchDeg: Float, val rollDeg: Float) {

    /** ¿Está la cara dentro del cono en el que las medidas geométricas valen? */
    fun withinCone(maxDeg: Float = 12f): Boolean =
        kotlin.math.abs(yawDeg) < maxDeg && kotlin.math.abs(pitchDeg) < maxDeg

    companion object {
        val ZERO = HeadPose(0f, 0f, 0f)

        /**
         * Descompone la submatriz de rotación de una transformación 4×4 en
         * yaw/pitch/roll. Precisión de sobra para detectar giros gruesos de
         * ±15°, que es todo lo que pide AR-2.
         */
        fun fromMatrix(m: FloatArray): HeadPose {
            if (m.size < 16) return ZERO
            // Fila-mayor: r[i][j] = m[i * 4 + j]
            val r00 = m[0]; val r01 = m[1]; val r02 = m[2]
            val r10 = m[4]; val r12 = m[6]
            val r20 = m[8]; val r21 = m[9]; val r22 = m[10]

            val sy = kotlin.math.sqrt((r00 * r00 + r10 * r10).toDouble())
            val singular = sy < 1e-6

            val x: Double
            val y: Double
            val z: Double
            if (!singular) {
                x = kotlin.math.atan2(r21.toDouble(), r22.toDouble())
                y = kotlin.math.atan2(-r20.toDouble(), sy)
                z = kotlin.math.atan2(r10.toDouble(), r00.toDouble())
            } else {
                // Gimbal lock: la cara está mirando casi perpendicular. El frame
                // se va a descartar de todas formas por el cono de pose.
                x = kotlin.math.atan2(-r12.toDouble(), r01.toDouble())
                y = kotlin.math.atan2(-r20.toDouble(), sy)
                z = 0.0
            }
            val toDeg = 180.0 / Math.PI
            return HeadPose(
                yawDeg = (y * toDeg).toFloat(),
                pitchDeg = (x * toDeg).toFloat(),
                rollDeg = (z * toDeg).toFloat(),
            )
        }
    }
}

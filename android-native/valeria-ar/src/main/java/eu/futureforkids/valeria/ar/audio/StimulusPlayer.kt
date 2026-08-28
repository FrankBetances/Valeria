package eu.futureforkids.valeria.ar.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTimestamp
import android.media.AudioTrack
import eu.futureforkids.valeria.ar.Transducer
import java.util.concurrent.Executors
import kotlin.math.PI
import kotlin.math.sin

/**
 * Valeria+ · Estímulo lateralizado de AR-2, con su instante REAL de salida.
 *
 * El problema que resuelve esta clase, dicho sin rodeos: `System.nanoTime()`
 * cuando llamas a `play()` **no es** el instante en que suena el estímulo. El
 * camino de audio de un móvil añade entre 40 y 200 ms por cable, variable por
 * dispositivo. Medir mal aquí no produce un dato ruidoso: produce un dato
 * **sesgado**, que es mucho peor porque no se nota en la media.
 *
 * Por eso el inicio del estímulo se toma de `AudioTrack.getTimestamp()` —el
 * *presentation time* del primer frame audible— y nunca del instante de la
 * llamada.
 *
 * ── Transductores admisibles (§7.2) ────────────────────────────────────────
 * · Dos altavoces externos CABLEADOS a ±60°: mide localización en campo libre,
 *   el VRA clásico, comparable con la literatura audiológica. Es el elegido.
 * · Auriculares por cable: miden lateralización (ILD/ITD), que es otro
 *   constructo. Reserva documentada, etiquetada aparte, nunca la misma columna.
 * · Altavoz del teléfono: la gama media es mono o asimétrica. No sirve.
 * · **Cualquier transductor Bluetooth: VETADO.** Añade 100-300 ms de latencia
 *   variable ensayo a ensayo, que es exactamente la magnitud que se quiere
 *   medir. Sería medir la radio, no al niño.
 */
class StimulusPlayer(context: Context) {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val audioExecutor = Executors.newSingleThreadExecutor { runnable ->
        Thread(runnable, "StimulusPlayer-Worker").apply { priority = Thread.MAX_PRIORITY }
    }
    private var track: AudioTrack? = null
    private val sampleRate = 48_000
    private val defaultDurationMs = 500
    private val defaultFrequencyHz = 1000.0

    // Pre-synthesized buffers for instant zero-allocation dispatch
    private val leftSamples: ShortArray
    private val rightSamples: ShortArray

    init {
        leftSamples = synthesize(Side.LEFT, defaultDurationMs, defaultFrequencyHz)
        rightSamples = synthesize(Side.RIGHT, defaultDurationMs, defaultFrequencyHz)
    }

    private fun synthesize(side: Side, durationMs: Int, frequencyHz: Double): ShortArray {
        val frames = sampleRate * durationMs / 1000
        val samples = ShortArray(frames * 2)
        val ramp = sampleRate * 10 / 1000
        for (i in 0 until frames) {
            val env = when {
                i < ramp -> i.toFloat() / ramp
                i > frames - ramp -> (frames - i).toFloat() / ramp
                else -> 1f
            }
            val v = (sin(2.0 * PI * frequencyHz * i / sampleRate) * env * 0.7 * Short.MAX_VALUE).toInt().toShort()
            samples[i * 2] = if (side == Side.LEFT) v else 0
            samples[i * 2 + 1] = if (side == Side.RIGHT) v else 0
        }
        return samples
    }

    /**
     * Ruta de salida VIVA, consultada en caliente. Si alguien desconecta el DAC
     * a mitad de sesión, los ensayos siguientes bajan de modo y quedan marcados,
     * sin interrumpir al niño.
     */
    fun currentTransducer(): Transducer {
        val devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
        var sawUsb = false
        var sawWiredHeadphones = false
        for (d in devices) {
            when (d.type) {
                AudioDeviceInfo.TYPE_USB_DEVICE,
                AudioDeviceInfo.TYPE_USB_HEADSET,
                AudioDeviceInfo.TYPE_USB_ACCESSORY -> sawUsb = true
                AudioDeviceInfo.TYPE_WIRED_HEADPHONES,
                AudioDeviceInfo.TYPE_WIRED_HEADSET -> sawWiredHeadphones = true
                // Bluetooth no se contempla: si es la ruta activa, el ejercicio
                // baja a modo juego. No hay rama que lo acepte como válido.
                else -> Unit
            }
        }
        return when {
            sawUsb -> Transducer.EXTERNAL_SPEAKERS
            sawWiredHeadphones -> Transducer.WIRED_HEADPHONES
            devices.isNotEmpty() -> Transducer.DEVICE_SPEAKER
            else -> Transducer.UNKNOWN
        }
    }

    /** ¿Hay salida Bluetooth activa? Corta el modo instrumento sin discusión. */
    fun bluetoothActive(): Boolean = audioManager
        .getDevices(AudioManager.GET_DEVICES_OUTPUTS)
        .any {
            it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO
        }

    /**
     * Reproducción no bloqueante: procesa audio en un worker thread dedicado
     * e invoca [onTimestamp] con la marca microsegundo corregida de frame 0.
     */
    fun playLateralizedAsync(
        side: Side,
        durationMs: Int = defaultDurationMs,
        frequencyHz: Double = defaultFrequencyHz,
        onTimestamp: (Long?) -> Unit,
    ) {
        audioExecutor.execute {
            val tsUs = playLateralizedSync(side, durationMs, frequencyHz)
            onTimestamp(tsUs)
        }
    }

    /**
     * Reproduce el estímulo por UN canal físico. Se registra el canal excitado y
     * no una etiqueta «derecha»: en usuarios de implante unilateral la vía
     * ipsi/contralateral es información clínica.
     *
     * @return instante de presentación en microsegundos en base *boottime*, o
     *         null si el dispositivo no entrega un timestamp fiable. Un dato
     *         ausente y etiquetado es honesto; uno presente e inventado, no.
     */
    fun playLateralized(
        side: Side,
        durationMs: Int = defaultDurationMs,
        frequencyHz: Double = defaultFrequencyHz,
    ): Long? = playLateralizedSync(side, durationMs, frequencyHz)

    private fun playLateralizedSync(
        side: Side,
        durationMs: Int,
        frequencyHz: Double,
    ): Long? {
        val samples = if (durationMs == defaultDurationMs && frequencyHz == defaultFrequencyHz) {
            if (side == Side.LEFT) leftSamples else rightSamples
        } else {
            synthesize(side, durationMs, frequencyHz)
        }

        val t = try {
            AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setSampleRate(sampleRate)
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                        .build()
                )
                .setBufferSizeInBytes(samples.size * 2)
                .setTransferMode(AudioTrack.MODE_STATIC)
                .build()
        } catch (e: Throwable) {
            return null
        }

        runCatching { track?.release() }
        track = t
        try {
            t.write(samples, 0, samples.size)
            t.play()
        } catch (e: Throwable) {
            return null
        }

        // El timestamp tarda unos frames en estar disponible: se sondea con
        // corrección exacta de desfase de frames para medir el instante t0 de inicio.
        val ts = AudioTimestamp()
        repeat(15) {
            if (t.getTimestamp(ts) && ts.framePosition >= 0) {
                val frameOffsetUs = (ts.framePosition * 1_000_000L) / sampleRate
                return (ts.nanoTime / 1_000L) - frameOffsetUs
            }
            try { Thread.sleep(3) } catch (e: InterruptedException) { return null }
        }
        return null
    }

    fun release() {
        runCatching { audioExecutor.shutdownNow() }
        runCatching { track?.release() }
        track = null
    }

    enum class Side { LEFT, RIGHT }
}

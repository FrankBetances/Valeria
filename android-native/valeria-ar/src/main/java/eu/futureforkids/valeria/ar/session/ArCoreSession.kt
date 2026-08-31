package eu.futureforkids.valeria.ar.session

import android.app.Activity
import android.media.Image
import android.util.Log
import com.google.ar.core.ArCoreApk
import com.google.ar.core.AugmentedFace
import com.google.ar.core.CameraConfig
import com.google.ar.core.CameraConfigFilter
import com.google.ar.core.Config
import com.google.ar.core.Frame
import com.google.ar.core.Session
import com.google.ar.core.TrackingState
import com.google.ar.core.exceptions.CameraNotAvailableException
import com.google.ar.core.exceptions.UnavailableApkTooOldException
import com.google.ar.core.exceptions.UnavailableArcoreNotInstalledException
import com.google.ar.core.exceptions.UnavailableDeviceNotCompatibleException
import com.google.ar.core.exceptions.UnavailableSdkTooOldException
import com.google.ar.core.exceptions.UnavailableUserDeclinedInstallationException

/**
 * Valeria+ · Sesión de ARCore. Dueña de la cámara, del ciclo de vida y del
 * contexto GL.
 *
 * ── Por qué existe este fichero ────────────────────────────────────────────
 *
 * Sustituye a la tubería de CameraX que el módulo montaba a mano: proveedor,
 * `ImageAnalysis`, executor propio, contrapresión, `targetRotation`, espejo por
 * bitmap y cierre ordenado de todo eso. Esa tubería compilaba y se caía en un
 * teléfono real (Pixel, 31/8/2026). ARCore se la lleva entera: abre la cámara,
 * la orienta, la entrega a GL y la cierra, y lo hace con el soporte de Google
 * detrás en vez de con nuestro criterio.
 *
 * ── Lo que ARCore da y lo que NO ───────────────────────────────────────────
 *
 * Verificado en su propio sample `augmented_faces_java`, no de memoria: la API
 * `AugmentedFace` expone `getCenterPose()`, `getRegionPose()` y la malla
 * `MESH3D`. **No hay blendshapes.** AR-1 (redondeo labial de /o/ y /u/) y AR-6
 * (mimetismo) están construidos sobre los 52 coeficientes ARKit, así que
 * MediaPipe sigue en el módulo — pero degradado a consumidor de píxeles:
 * ARCore le pasa el frame por `acquireCameraImage()` y no abre ninguna segunda
 * sesión de cámara. Una sola sesión, un solo dueño.
 *
 * ── La regla del hilo ──────────────────────────────────────────────────────
 *
 * `update()` SOLO se llama desde el hilo de GL, y devuelve el frame de ese
 * momento. Nada aquí toca el hilo de UI. El bug de relojes y contadores
 * compartidos entre hilos que ya costó una ronda de depuración no puede
 * repetirse si la única puerta de entrada es esta.
 */
class ArCoreSession(private val activity: Activity) {

    /** Por qué el bloque no puede abrirse. Cada caso tiene su mensaje al adulto. */
    enum class Unavailable {
        /** El teléfono no está en la lista de dispositivos certificados. */
        DEVICE_NOT_SUPPORTED,
        /** Falta Google Play Services for AR y el usuario declinó instalarlo. */
        INSTALL_DECLINED,
        /** ARCore instalado pero más viejo que el SDK con el que compilamos. */
        APK_TOO_OLD,
        /** Este teléfono no ofrece cámara frontal a ARCore. */
        NO_FRONT_CAMERA,
        /** La cámara la tiene otra app. */
        CAMERA_BUSY,
    }

    var session: Session? = null
        private set

    /** Motivo del último fallo. Lo lee la Activity para decidir qué decir. */
    var unavailable: Unavailable? = null
        private set

    /** Cierto una sola vez: `requestInstall` puede devolver control tras una pausa. */
    private var installRequested = false

    /**
     * Intenta dejar la sesión creada y configurada.
     *
     * Devuelve `false` cuando el bloque no puede abrirse en este aparato, con
     * el motivo en [unavailable]. **No lanza**: un bloque de siete que no puede
     * abrirse es una tarjeta que no se ofrece, nunca un cierre inesperado.
     *
     * Puede devolver `false` con [unavailable] a `null` en un caso legítimo: se
     * ha lanzado la instalación de ARCore y la Activity va a pausarse. La
     * siguiente vuelta a `onResume` reintenta y ya encuentra ARCore.
     */
    fun ensureCreated(): Boolean {
        if (session != null) return true

        when (ArCoreApk.getInstance().checkAvailability(activity)) {
            ArCoreApk.Availability.SUPPORTED_INSTALLED -> Unit
            ArCoreApk.Availability.SUPPORTED_APK_TOO_OLD,
            ArCoreApk.Availability.SUPPORTED_NOT_INSTALLED -> Unit
            ArCoreApk.Availability.UNSUPPORTED_DEVICE_NOT_CAPABLE -> {
                unavailable = Unavailable.DEVICE_NOT_SUPPORTED
                return false
            }
            // Las transitorias: ARCore aún está consultando. Se reintenta en el
            // siguiente onResume en vez de decidir con información a medias.
            else -> return false
        }

        return try {
            // requestInstall lleva la instalación de Play Services for AR. La
            // primera llamada puede sacar al usuario de la app; por eso el flag,
            // para no pedirla en bucle.
            when (ArCoreApk.getInstance().requestInstall(activity, !installRequested)) {
                ArCoreApk.InstallStatus.INSTALL_REQUESTED -> {
                    installRequested = true
                    false
                }
                ArCoreApk.InstallStatus.INSTALLED -> {
                    val created = Session(activity)
                    if (!configure(created)) {
                        // Sin cámara frontal para ARCore. La sesión recién
                        // creada se cierra aquí: dejarla viva retendría la
                        // cámara de un bloque que no va a abrirse.
                        created.close()
                        false
                    } else {
                        session = created
                        unavailable = null
                        true
                    }
                }
            }
        } catch (e: UnavailableUserDeclinedInstallationException) {
            unavailable = Unavailable.INSTALL_DECLINED
            false
        } catch (e: UnavailableArcoreNotInstalledException) {
            unavailable = Unavailable.INSTALL_DECLINED
            false
        } catch (e: UnavailableApkTooOldException) {
            unavailable = Unavailable.APK_TOO_OLD
            false
        } catch (e: UnavailableSdkTooOldException) {
            unavailable = Unavailable.APK_TOO_OLD
            false
        } catch (e: UnavailableDeviceNotCompatibleException) {
            unavailable = Unavailable.DEVICE_NOT_SUPPORTED
            false
        } catch (e: Exception) {
            // Cualquier otra cosa: el bloque no se abre, pero la app sigue en
            // pie y el motivo queda en el log. Nunca un cierre inesperado.
            Log.e(TAG, "No se pudo crear la sesión de ARCore", e)
            unavailable = Unavailable.DEVICE_NOT_SUPPORTED
            false
        }
    }

    /**
     * Cámara frontal y malla facial.
     *
     * `FacingDirection.FRONT` se fija por filtro de configuración de cámara,
     * que es como ARCore lo expone: no hay un interruptor de «cámara frontal»
     * suelto. Y aquí está la constatación que zanjó el debate de las dos
     * cámaras: ARCore obliga a elegir dirección **en la sesión**, igual que
     * CameraX. La restricción de una sola cámara a la vez no era de CameraX,
     * es del teléfono.
     */
    private fun configure(session: Session): Boolean {
        val filter = CameraConfigFilter(session)
            .setFacingDirection(CameraConfig.FacingDirection.FRONT)
        val configs = session.getSupportedCameraConfigs(filter)
        if (configs.isEmpty()) {
            unavailable = Unavailable.NO_FRONT_CAMERA
            return false
        }
        session.cameraConfig = configs[0]

        session.configure(
            Config(session).apply {
                augmentedFaceMode = Config.AugmentedFaceMode.MESH3D
                // LATEST_CAMERA_IMAGE y no BLOCKING: el bucle de render nunca
                // debe esperar a la cámara. Es la contrapresión que antes se
                // implementaba a mano y encolaba frames dentro de MediaPipe.
                updateMode = Config.UpdateMode.LATEST_CAMERA_IMAGE
                // La luz no se usa: es coste de cómputo por nada en gama media.
                lightEstimationMode = Config.LightEstimationMode.DISABLED
                focusMode = Config.FocusMode.AUTO
            }
        )
        return true
    }

    /**
     * Arranca la entrega de frames.
     *
     * La textura NO se declara aquí: la crea el renderer en su propio hilo de
     * GL y se la declara él a ARCore en cuanto existe. Hacerlo desde el hilo
     * principal, como estaba, era declarar una textura que todavía no se había
     * creado en un contexto que aún no existía.
     */
    fun resume(): Boolean {
        val s = session ?: return false
        return try {
            s.resume()
            true
        } catch (e: CameraNotAvailableException) {
            unavailable = Unavailable.CAMERA_BUSY
            false
        }
    }

    /**
     * Pausa. ARCore libera la cámara aquí, y es lo que hace que volver de una
     * llamada entrante no deje la cámara colgada.
     */
    fun pause() {
        session?.pause()
    }

    /**
     * Un frame. Solo desde el hilo de GL.
     *
     * Devuelve `null` si la sesión no está lista o si ARCore no tiene frame
     * nuevo; el que llama simplemente no dibuja esa vuelta.
     */
    fun update(): Frame? = try {
        session?.update()
    } catch (e: CameraNotAvailableException) {
        unavailable = Unavailable.CAMERA_BUSY
        null
    }

    /**
     * La cara que ARCore está rastreando, o `null`.
     *
     * Solo una: los ejercicios son de un niño delante del teléfono, y aceptar
     * la segunda cara de la habitación —un hermano que pasa— metería ruido en
     * la medida sin que nadie lo viera.
     */
    fun trackedFace(): AugmentedFace? =
        session?.getAllTrackables(AugmentedFace::class.java)
            ?.firstOrNull { it.trackingState == TrackingState.TRACKING }

    /**
     * Imagen de cámara del frame, para MediaPipe. **Quien la pide, la cierra.**
     *
     * ARCore tiene un número fijo de imágenes en vuelo: no cerrarla agota el
     * pool y la sesión deja de entregar frames, en silencio y a los pocos
     * segundos. Es exactamente la clase de fallo que este rediseño viene a
     * quitar, así que se dice aquí y el único que la llama usa `use {}`.
     */
    fun acquireImage(frame: Frame): Image? = try {
        frame.acquireCameraImage()
    } catch (e: Exception) {
        // NotYetAvailableException en los primeros frames es normal y no es
        // noticia: la cámara aún no ha entregado el primero.
        null
    }

    /**
     * Cierre definitivo. Después de esto la instancia no sirve.
     *
     * Un solo `close()`, y la referencia a `null` para que un segundo intento
     * no toque memoria nativa liberada — que es la forma en que un cierre doble
     * se manifiesta: no como excepción, sino como cierre inesperado.
     */
    fun close() {
        session?.close()
        session = null
    }

    private companion object {
        const val TAG = "ValeriaArCore"
    }
}

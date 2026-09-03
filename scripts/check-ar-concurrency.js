// ============================================================================
// Gate · Concurrencia, ciclo de vida y audio del bloque de Realidad Aumentada
//
// Recorre las fuentes Kotlin de `android-native/valeria-ar/` y falla si se
// pierde alguna de las invariantes que sostienen el arreglo de df275d9.
//
// Por qué existe: los ejercicios de RA los tocan TRES hilos —el analizador de
// CameraX, el bucle de UI y el worker de audio— y ninguno de los otros gates
// mira una línea de Kotlin. Lo único que compilaba este módulo era el build de
// Gradle, que tarda veinte minutos y no distingue «compila» de «no tiene
// carreras». Esto es barato y falla en segundos.
//
// Lo que NO es: no reimplementa la lógica en JavaScript para después probarse a
// sí misma. Cada comprobación lee el fichero real y afirma algo sobre él. Una
// prueba que emula el código que dice vigilar pasa en verde el día que el
// código deja de existir.
// ============================================================================
const fs = require('fs');
const path = require('path');

const AR = path.join(
  __dirname, '..', 'android-native', 'valeria-ar',
  'src', 'main', 'java', 'eu', 'futureforkids', 'valeria', 'ar',
);

const EJERCICIOS = [
  'Ar1Orofacial.kt', 'Ar2Vra.kt', 'Ar3Fixation.kt',
  'Ar4SpatialSearch.kt', 'Ar5FeedCatch.kt', 'Ar6BuddyMimicry.kt',
];

const fallos = [];
const leer = (...p) => {
  const f = path.join(AR, ...p);
  if (!fs.existsSync(f)) { fallos.push(`falta el fichero ${path.relative(AR, f)}`); return null; }
  return fs.readFileSync(f, 'utf8');
};

const exigir = (cond, mensaje) => { if (!cond) fallos.push(mensaje); };

/**
 * Cuerpo de una función/getter override, desde su firma hasta la línea que
 * cierra al mismo nivel de indentación. Sirve para preguntar «¿esto de dentro
 * está bajo el lock?» en vez de «¿aparece la palabra en el fichero?».
 */
function cuerpo(src, firma) {
  const i = src.indexOf(firma);
  if (i === -1) return null;
  // La sangría sale de la firma que se pide, no del texto anterior: `indexOf`
  // devuelve el índice del PRIMER espacio del sangrado, así que lo que hay
  // delante es el salto de línea y medir ahí daba siempre 0 —y el cuerpo se
  // extendía hasta el cierre de la clase, con lo que cualquier `synchronized`
  // de más abajo daba por buena una función que no lo tenía—.
  const sangria = firma.match(/^\s*/)[0].length;
  const lineas = src.slice(i).split('\n');
  // Cuerpo en una sola línea (`fun onTick(...) { /* … */ }`): ahí acaba.
  const abre = (lineas[0].match(/\{/g) || []).length;
  const cierra = (lineas[0].match(/\}/g) || []).length;
  if (abre > 0 && abre === cierra) return lineas[0];
  const out = [lineas[0]];
  for (let n = 1; n < lineas.length; n++) {
    out.push(lineas[n]);
    if (lineas[n] === ' '.repeat(sangria) + '}') break;
  }
  return out.join('\n');
}

// ── 1. Todo punto de entrada de un ejercicio corre bajo su lock ─────────────
// Los tres hilos entran por aquí. Comprobar que la palabra `synchronized`
// aparece «alguna vez» en el fichero no vale: con un solo `onSignals` cubierto
// y `onTick` suelto, el fichero pasaría y la carrera seguiría ahí.
for (const f of EJERCICIOS) {
  const src = leer('exercises', f);
  if (!src) continue;

  exigir(/private val lock = Any\(\)/.test(src), `${f}: no declara \`private val lock = Any()\``);

  for (const g of ['override val trials', 'override val finished']) {
    const linea = src.split('\n').find((l) => l.includes(g));
    exigir(linea && linea.includes('synchronized(lock)'), `${f}: \`${g}\` se lee sin el lock`);
  }
  const trials = src.split('\n').find((l) => l.includes('override val trials')) || '';
  exigir(
    /ArrayList\(_trials\)|toList\(\)/.test(trials),
    `${f}: \`trials\` devuelve la lista viva; hay que copiarla dentro del lock ` +
    '(quien la recorra fuera verá una ConcurrentModificationException)',
  );

  for (const fn of ['override fun onSignals', 'override fun onTick', 'override fun onFling']) {
    const c = cuerpo(src, `    ${fn}`);
    if (!c) continue;                                  // no todos los ejercicios lo implementan
    const util = c.split('\n').slice(1, -1).filter((l) => l.trim() && !l.trim().startsWith('//'));
    if (util.length === 0) continue;                   // cuerpo vacío a propósito (AR-1 no tiene ventanas)
    exigir(c.includes('synchronized(lock)'), `${f}: \`${fn}\` toca el estado sin el lock`);
  }
}

// ── 2. La pausa no puede caducar el ensayo en vuelo ─────────────────────────
// Los plazos del ensayo son `elapsedRealtime`, que corre con la app detrás. Sin
// desplazarlos, una notificación a media sesión se registra como que el niño
// tardó veinte segundos en girar, o como veinte segundos de fijación sostenida.
for (const f of EJERCICIOS) {
  const src = leer('exercises', f);
  if (!src) continue;
  const usaReloj = /trialStartedMs|windowOpenedMs|nextStimulusAtMs|lastFrameMs/.test(src);
  if (!usaReloj) continue;
  exigir(
    src.includes('override fun onSessionResumed'),
    `${f}: lleva plazos en elapsedRealtime pero no implementa \`onSessionResumed\`; ` +
    'al volver de segundo plano el ensayo en vuelo sale caducado',
  );
}

// El acumulador de permanencia no puede tragarse el hueco de la pausa.
for (const f of ['Ar3Fixation.kt', 'Ar4SpatialSearch.kt']) {
  const src = leer('exercises', f);
  if (!src) continue;
  exigir(
    /val dt = if \(lastFrameMs == 0L\) 0L else/.test(src),
    `${f}: el intervalo entre frames no protege el caso «sin frame anterior»; ` +
    'el primer frame tras una pausa sumaría permanencia que nadie ha mirado',
  );
}

// ── 3. Ciclo de vida de la Activity ─────────────────────────────────────────
const act = leer('ValeriaArActivity.kt');
if (act) {
  exigir(/@Volatile private var isActivityPaused/.test(act),
    'ValeriaArActivity: `isActivityPaused` lo escribe el hilo de UI y lo lee el bucle; tiene que ser @Volatile');

  const onSignals = cuerpo(act, '    private fun onSignals(signals: FaceSignals)');
  exigir(onSignals && onSignals.includes('if (isActivityPaused) return'),
    'ValeriaArActivity: `onSignals` no corta con la app en segundo plano. Entre onPause y ' +
    'onStop CameraX sigue entregando frames y el ejercicio los tomaría por respuestas');

  exigir(/exercise\?\.onSessionResumed\(/.test(act),
    'ValeriaArActivity: `onResume` no avisa al ejercicio del hueco; descontarlo solo del ' +
    'reloj de sesión deja el ensayo en vuelo caducado');

  exigir(/accumulatedPausedDurationMs/.test(act),
    'ValeriaArActivity: el reloj de sesión no descuenta el tiempo en segundo plano');

  for (const guard of ['isFinishing || isDestroyed']) {
    exigir(act.includes(guard),
      `ValeriaArActivity: falta la guarda \`${guard}\` antes de enlazar la cámara y al cerrar`);
  }
  // ── Cierre, en el orden que impone ARCore ─────────────────────────────────
  // Hasta el 31/8/2026 estas dos primeras líneas eran `clearAnalyzer()` y
  // `analysisExecutor.shutdown()`: las invariantes de la tubería de CameraX que
  // el módulo montaba a mano. Esa tubería se retiró porque se colgaba en un
  // Pixel real, y ARCore se llevó con ella el executor y el caso de uso. Las
  // reglas no desaparecen, cambian de nombre: sigue habiendo un grifo que
  // cerrar antes que el motor que bebe de él, solo que ahora el grifo es el
  // bucle de GL y la sesión de ARCore.
  for (const cierre of ['glView?.onPause()', 'arSession.close()', 'engine?.close()', 'exercise?.close()']) {
    exigir(act.includes(cierre), `ValeriaArActivity: \`onDestroy\` no hace \`${cierre}\``);
  }

  // El pool de imágenes de ARCore es finito y no da error al agotarse: deja de
  // entregar frames y la sesión se queda muda a los pocos segundos. La imagen
  // de `acquireCameraImage()` tiene que cerrarse SIEMPRE, y `use {}` es la
  // única forma que no depende de que alguien se acuerde en cada rama.
  exigir(/acquireImage\(frame\)\?\.use \{/.test(act),
    'ValeriaArActivity: la imagen de ARCore no se cierra con `use {}`. Sin cerrarla se ' +
    'agota el pool y la sesión deja de entregar frames, en silencio');

  // Reanudar el bucle de GL sobre una sesión pausada hace que ARCore lance en
  // cada vuelta. El orden es: sesión primero, GLSurfaceView después; y al
  // pausar, exactamente al revés.
  const onPause = cuerpo(act, '    override fun onPause()');
  exigir(onPause && onPause.indexOf('glView?.onPause()') < onPause.indexOf('arSession.pause()'),
    'ValeriaArActivity: `onPause` pausa la sesión antes que el bucle de GL. Al revés: ' +
    'primero se para quien llama a `update()`, después la sesión a la que llama');
}

// ── 4. El AudioTrack tiene un solo dueño ────────────────────────────────────
// Es el fallo que más caro sale: liberar en el hilo principal un AudioTrack
// que el worker está escribiendo no lanza excepción, mata el proceso. La regla
// es que lo abre, lo reemplaza y lo cierra siempre el mismo hilo.
const player = leer('audio', 'StimulusPlayer.kt');
if (player) {
  exigir(/@Volatile private var released/.test(player),
    'StimulusPlayer: `released` lo cruzan dos hilos; tiene que ser @Volatile');

  exigir(/private fun playLateralizedSync/.test(player),
    'StimulusPlayer: la reproducción síncrona tiene que ser privada. Pública es una vía ' +
    'para tocar el AudioTrack desde cualquier hilo, que es justo lo que se cerró');

  exigir(/audioExecutor\.awaitTermination\(/.test(player),
    'StimulusPlayer: `release()` no espera al worker. `shutdownNow()` interrumpe y vuelve: ' +
    'por sí solo no impide liberar el AudioTrack mientras el worker escribe en él');

  const release = cuerpo(player, '    fun release()');
  exigir(release && /audioExecutor\.execute\s*\{[\s\S]*track\?\.release\(\)/.test(release),
    'StimulusPlayer: `release()` suelta el AudioTrack desde el hilo que llama en vez de ' +
    'encargárselo al worker que lo abrió');

  exigir(/catch \(e: RejectedExecutionException\)/.test(player),
    'StimulusPlayer: tras el cierre el executor rechaza tareas; el callback tiene que ' +
    'invocarse igual con null para que el ensayo pueda cerrarse');
}

// ── 5. AR-2: la ventana abre cuando el tono sale, no cuando se pide ─────────
// El camino de audio tarda decenas de ms en arrancar. Abrir la ventana antes se
// la come por delante y le recorta al niño ese tiempo del plazo para girar, que
// es exactamente la variable que el ejercicio mide.
const vra = leer('exercises', 'Ar2Vra.kt');
if (vra) {
  exigir(/enum class Phase \{[^}]*FIRING/.test(vra),
    'Ar2Vra: falta la fase FIRING entre pedir el tono y saber que ha salido');

  const fire = cuerpo(vra, '    private fun fireStimulus()');
  if (fire) {
    const iAsync = fire.indexOf('playLateralizedAsync');
    exigir(iAsync !== -1, 'Ar2Vra: `fireStimulus` ya no lanza el tono de forma no bloqueante');
    exigir(fire.indexOf('windowOpenedMs', iAsync) !== -1,
      'Ar2Vra: el callback de `playLateralizedAsync` no abre la ventana');

    // La rama de trampa SÍ abre la ventana en el acto —ahí no suena nada, el
    // reloj arranca al pedirlo—. Se recorta antes de mirar, para que lo que
    // quede sea solo el camino con sonido.
    const antes = fire.slice(0, iAsync === -1 ? fire.length : iAsync);
    const iCatch = antes.indexOf('if (isCatch) {');
    const sinTrampa = iCatch === -1
      ? antes
      : antes.slice(0, iCatch) + antes.slice(antes.indexOf('\n        }', iCatch) + 1);
    exigir(!/windowOpenedMs\s*=/.test(sinTrampa),
      'Ar2Vra: `fireStimulus` abre la ventana antes de que el tono salga. El camino de ' +
      'audio tarda decenas de ms en arrancar: abrirla antes le recorta al niño ese tiempo ' +
      'del plazo para girar, que es la variable que el ejercicio mide. La abre el callback');

    exigir(/phase = Phase\.FIRING/.test(fire),
      'Ar2Vra: `fireStimulus` no entra en FIRING; un giro previo al tono contaría como respuesta');
  }

  exigir(/AUDIO_DISPATCH_TIMEOUT_MS/.test(vra),
    'Ar2Vra: sin tope, un worker de audio que no conteste deja el ensayo colgado para siempre');

  const close = cuerpo(vra, '    private fun closeTrial');
  exigir(close && /if \(phase != Phase\.WINDOW\) return/.test(close),
    'Ar2Vra: `closeTrial` no es idempotente; el tiempo agotado y el giro pueden cerrarlo dos veces');

  exigir(/"audioTimestampUnavailable"/.test(vra),
    'Ar2Vra: sin marca de presentación el ensayo tiene que bajar a juego CON su motivo, ' +
    'nunca inventarse una latencia');
}

// ── 6. El host de cámara: un solo hilo le habla a ARCore ────────────────────
// La reescritura del 31/8/2026 se justificó en «un solo hilo y un solo reloj»,
// y aun así la rotación de pantalla entraba por el hilo de UI: llegaba de
// `onConfigurationChanged`, escribía tres enteros normales que lee el hilo de
// GL y llamaba a `setDisplayGeometry` mientras el otro estaba dentro de
// `update()`. El síntoma es el mismo que costó dos rondas de depuración con
// CameraX —girar el móvil 180° y quedarse con la imagen boca abajo—, y no lo ve
// ningún otro gate: este paquete es de 2026-08-31 y no existía cuando se
// escribió el resto de este fichero.
const renderer = leer('session', 'ArRenderer.kt');
if (renderer) {
  for (const campo of ['pendingRotation', 'viewportChanged']) {
    exigir(new RegExp(`@Volatile private var ${campo}`).test(renderer),
      `ArRenderer: \`${campo}\` lo escribe el hilo de UI y lo lee el de GL; tiene que ser @Volatile`);
  }

  const set = cuerpo(renderer, '    fun setDisplayRotation(rotation: Int)');
  exigir(set && !/setDisplayGeometry/.test(set),
    'ArRenderer: `setDisplayRotation` le habla a la sesión desde el hilo de UI. Solo debe ' +
    'dejar el aviso; lo aplica el hilo de GL en la siguiente vuelta');

  const draw = cuerpo(renderer, '    override fun onDrawFrame(gl: GL10?)');
  if (draw) {
    const iGeom = draw.indexOf('applyPendingGeometry');
    const iUpdate = draw.indexOf('session.update()');
    exigir(iGeom !== -1,
      'ArRenderer: `onDrawFrame` no recoge la rotación pendiente; una pantalla girada no ' +
      'llegaría nunca a ARCore');
    exigir(iGeom !== -1 && iUpdate !== -1 && iGeom < iUpdate,
      'ArRenderer: la geometría se aplica después de `update()`. ARCore la quiere fijada ' +
      'antes de entregar el frame al que se le pide el encuadre');
  }
}

// ── 7. La imagen que ve MediaPipe llega derecha, y la ficha se puede leer ───
if (act) {
  const gl = cuerpo(act, '    private fun onGlFrame(frame: com.google.ar.core.Frame)');
  if (gl) {
    // `acquireCameraImage()` entrega la imagen en coordenadas del SENSOR, cuya
    // orientación en una cámara frontal suele ser 270°. El espejo lo endereza
    // la GPU con `transformCoordinates2d` y no toca estos píxeles. El Face
    // Landmarker no es invariante a rotación: una imagen tumbada son cero caras
    // con el niño delante, y ningún error en el log.
    exigir(!/rotationDegrees\s*=\s*\d/.test(gl),
      'ValeriaArActivity: `onGlFrame` le pasa a MediaPipe una rotación literal. La imagen ' +
      'viene en coordenadas del sensor: tiene que salir de `refreshAnalysisRotation`');
    exigir(/rotationDegrees\s*=\s*analysisRotation/.test(gl),
      'ValeriaArActivity: `onGlFrame` no usa `analysisRotation`');

    // El espejo es una convención de PANTALLA: ni CameraX ni ARCore espejan los
    // píxeles. Todo lo de aguas abajo se calibró contra la imagen ya espejada
    // —la tubería de CameraX pasaba `isFrontCamera = true` sin excepción—, así
    // que quitarlo no mete ruido: invierte el lado en TODOS los ensayos de AR-2,
    // de forma sistemática y por tanto invisible en la media.
    exigir(/mirror\s*=\s*true/.test(gl),
      'ValeriaArActivity: `onGlFrame` no espeja la imagen del sensor. «Gira a la derecha» ' +
      'se registraría como giro a la izquierda en todos los ensayos: no es ruido, es sesgo');

    // La ficha de la cámara existe para el escenario «caras 0». Tomar la
    // geometría del sensor dentro de la compuerta de la cara dejaba la línea
    // `sensor …` vacía justo en ese escenario, que es el único en que se mira.
    exigir(/needGeometry/.test(gl) && /if \(!hasFace && !needGeometry\) return/.test(gl),
      'ValeriaArActivity: `onGlFrame` corta por la cara antes de tomar la geometría del ' +
      'sensor. La ficha de diagnóstico se pinta cuando `caras 0`, y ahí saldría vacía');
  }

  const rot = cuerpo(act, '    private fun refreshAnalysisRotation()');
  exigir(rot && /SENSOR_ORIENTATION/.test(rot),
    'ValeriaArActivity: `refreshAnalysisRotation` no lee SENSOR_ORIENTATION de la cámara ' +
    'que ARCore ha elegido; sin eso la rotación es una suposición');
  exigir(/refreshAnalysisRotation\(\)/.test(cuerpo(act, '    override fun onConfigurationChanged') || ''),
    'ValeriaArActivity: `onConfigurationChanged` no recalcula la rotación de análisis. ' +
    'Girar el móvil cambia el encuadre del espejo Y el de la imagen que analiza MediaPipe');
}

// ── 8. El contrato de fallo del puente ──────────────────────────────────────
//
// Los dos cierres inesperados del Pixel 6a (2/9/2026) no salieron de una carrera
// entre hilos: salieron de que el host nativo sabía POR QUÉ no podía abrir el
// bloque y no se lo contaba a nadie. Calculaba la causa, la escribía en una
// pantalla que cerraba en la línea siguiente y mandaba a JS un `{outcome:...}`
// pelado que el puente disfrazaba de perfil de dispositivo. Estas cuatro
// comprobaciones son las que impiden que cada pieza de esa cadena vuelva.
{
  const act = leer('ValeriaArActivity.kt');
  const mod = leer('ValeriaArModule.kt');
  const ses = leer('session', 'ArCoreSession.kt');

  // Sin comentarios: estas reglas prohíben CÓDIGO, y el comentario que explica
  // por qué está prohibido tiene que poder citarlo sin disparar la regla.
  const soloCodigo = (s) => s.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

  if (mod) {
    // 8.1 · La proyección que rompió devolvía el mapa de ERROR cuando no había
    // perfil, y JS lo tomaba por uno bueno. El puente entrega el mapa crudo y
    // quien lo interpreta es TypeScript.
    exigir(!/getMap\("deviceProfile"\)\s*\?:/.test(soloCodigo(mod)),
      'ValeriaArModule: `getMap("deviceProfile") ?: map` ha vuelto. Ese `?:` resuelve la ' +
      'promesa con el mapa de error disfrazado de perfil, y es la causa exacta de los dos ' +
      'cierres del 2/9/2026');
    exigir(!/pendingTransform/.test(soloCodigo(mod)),
      'ValeriaArModule: vuelve a haber una proyección del resultado en Kotlin. La forma del ' +
      'resultado la conoce TypeScript; proyectarla aquí es lo que permitió el disfraz');
  }

  if (act) {
    // 8.2 · La razón tiene que VIAJAR. Sin esto la pantalla de reintento solo
    // puede decir «inténtalo de nuevo», que en una causa permanente es mandar a
    // un padre a repetir para siempre un calentamiento que no puede terminar.
    const fw = cuerpo(act, '    private fun finishWith(outcome: String)');
    exigir(fw && /\.put\("reason"/.test(fw) && /\.put\("permanent"/.test(fw),
      'ValeriaArActivity: `finishWith` ya no mete `reason`/`permanent` en el payload. Sin ' +
      'eso la causa se calcula, se pinta en una pantalla que se cierra y se tira — que es ' +
      'por lo que el fallo del Pixel 6a hubo que adivinarlo desde un bugreport de 101 MB');
    exigir(/private fun isPermanentFailure/.test(act),
      'ValeriaArActivity: falta `isPermanentFailure`. Distinguir la causa que el adulto ' +
      'puede resolver de la que no es lo que decide entre reintentar y cerrar el bloque');

    // 8.3 · `pipelineStarted` DESPUÉS de que la tubería exista de verdad.
    // Puesto en la primera línea, un retorno temprano dejaba la bandera sin
    // tubería: al volver, `onResume` reanudaba una sesión nula, el adulto leía
    // «otra aplicación está usando la cámara» —falso— y la rama de reintento
    // quedaba inalcanzable. Es la pantalla muerta al volver de Play Store.
    const sp = cuerpo(act, '    private fun startPipeline()');
    if (sp) {
      const iFlag = sp.indexOf('pipelineStarted = true');
      const iGl = sp.indexOf('gl.onResume()');
      exigir(iFlag !== -1 && iGl !== -1 && iGl < iFlag,
        'ValeriaArActivity: `pipelineStarted = true` no está DESPUÉS de `gl.onResume()`. ' +
        'Antes, un retorno temprano deja la bandera puesta sin tubería y `onResume` reanuda ' +
        'una sesión que no existe');
      exigir(/if \(isFinishing \|\| isDestroyed\) return/.test(sp),
        'ValeriaArActivity: `startPipeline` no sale si la Activity se está cerrando. El ' +
        'permiso denegado resuelve antes de `onResume`, así que sin esto se abre cámara y ' +
        'motor de señal para una pantalla que ya se va');
    }

    // 8.4 · La rama de reintento se queda ESTRECHA. Con `unavailable` puesto la
    // Activity ya está cerrándose y reintentar solo añade vueltas.
    const or = cuerpo(act, '    override fun onResume()');
    exigir(or && /arSession\.unavailable == null && arSession\.session == null/.test(or),
      'ValeriaArActivity: la rama de reintento de `onResume` ya no exige `unavailable == null`. ' +
      'Ensancharla hace que se reintente sobre una Activity que `finishWith` ya está cerrando');
  }

  if (ses) {
    // 8.5 · No llamar «teléfono no compatible» a «no sé qué ha pasado». Esa
    // etiqueta es la que mandó el diagnóstico del Pixel 6a por el camino falso.
    exigir(/UNKNOWN/.test(ses),
      'ArCoreSession: falta el motivo `UNKNOWN`. Sin él, el `catch` genérico vuelve a ' +
      'etiquetar cualquier excepción como DEVICE_NOT_SUPPORTED y afirma sobre el aparato ' +
      'algo que no consta');
    exigir(/var detail: String\? = null/.test(ses),
      'ArCoreSession: falta `detail`. Es la clase de la excepción, y es lo único que ' +
      'distingue un fallo real de una suposición cuando no hay bugreport delante');
  }
}

// ── Resultado ───────────────────────────────────────────────────────────────
if (fallos.length) {
  console.error('\nRealidad Aumentada · invariantes de concurrencia y ciclo de vida rotas:\n');
  fallos.forEach((f) => console.error(`  ✖ ${f}`));
  console.error(
    '\nEstas reglas vienen de fallos reales, no de estilo: un AudioTrack liberado desde dos\n' +
    'hilos mata el proceso, y un plazo que corre con la app en segundo plano no produce un\n' +
    'dato ruidoso sino un dato falso. Si alguna tiene que cambiar, cámbiala aquí a la vez\n' +
    'que en el código y di por qué.',
  );
  process.exit(1);
}

console.log(
  `✓ RA: ${EJERCICIOS.length} ejercicios bajo lock, pausa compensada, ` +
  'AudioTrack con un solo dueño, la ventana de AR-2 anclada al tono y ARCore con un solo hilo.',
);

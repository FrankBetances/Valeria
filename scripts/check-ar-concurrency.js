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
  for (const cierre of ['analysisUseCase?.clearAnalyzer()', 'analysisExecutor.shutdown()', 'engine?.close()', 'exercise?.close()']) {
    exigir(act.includes(cierre), `ValeriaArActivity: \`onDestroy\` no hace \`${cierre}\``);
  }
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
  'AudioTrack con un solo dueño y la ventana de AR-2 anclada al tono.',
);

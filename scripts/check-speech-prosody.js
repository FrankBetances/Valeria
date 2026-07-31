#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de prosodia de la voz del sistema (es-DO · Quisqueya Habla)
 *   node scripts/check-speech-prosody.js
 *
 * `tightenPauses` reescribe la puntuación de TODO lo que se locuta por
 * expo-speech. Un fallo ahí no se ve en el diff, ni en el typecheck, ni al leer
 * la app: solo se oye —y se oye tarde, en la tablet de una familia—. Este gate
 * ejecuta la función real sobre los textos que la app pronuncia de verdad
 * (corpus de voz completo + bancos es-DO) y comprueba las invariantes:
 *
 *   P1 · NO SE PIERDEN LETRAS. La normalización solo puede tocar signos y
 *        espacios. Si una palabra desaparece o aparece, es un fallo: el niño
 *        oiría una consigna distinta de la que se escribió y validó.
 *   P2 · NO QUEDA PUNTUACIÓN DE PAUSA LARGA. Ni «…», ni «:», ni «;», ni rayas,
 *        ni saltos de línea, ni signos repetidos: son justo los que abrían el
 *        hueco que rompía el ritmo.
 *   P3 · IDEMPOTENCIA. tighten(tighten(x)) === tighten(x). Una regla que se
 *        muerde la cola cambiaría el texto según cuántas veces pase por aquí.
 *   P4 · EL TROCEO CONSERVA EL ENUNCIADO. Los segmentos de `splitForSpeech`,
 *        unidos, dicen exactamente lo mismo que el texto normalizado, sin
 *        segmentos vacíos.
 *   P5 · EL PERFIL LATINO NO ENCADENA LAS CONSIGNAS CORTAS. Es la razón de ser
 *        del cambio: si una consigna breve vuelve a partirse en dos locuciones,
 *        vuelve la pausa ancha.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-prosody-'));

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };

// Solo letras y números: la comparación que hace válida la invariante P1.
const soloLetras = (s) => s.toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-zñ0-9]/g, '');

// Claves de los bancos de datos que contienen texto LOCUTADO. El recorrido es
// genérico a propósito: un campo nuevo de voz entra solo con añadirlo aquí.
const CLAVES_HABLADAS = new Set([
  'tts_string', 'tts_trigger', 'prompt', 'say', 'text', 'model', 'phrase', 'command',
]);

// Recolecta recursivamente los strings hablados de un módulo de datos.
function recolectar(nodo, out, clave) {
  if (typeof nodo === 'string') {
    if (clave && CLAVES_HABLADAS.has(clave) && nodo.trim()) out.push(nodo);
    return;
  }
  if (Array.isArray(nodo)) { nodo.forEach((n) => recolectar(n, out, clave)); return; }
  if (nodo && typeof nodo === 'object') {
    for (const k of Object.keys(nodo)) recolectar(nodo[k], out, k);
  }
}

try {
  const entradas = [
    path.join(ROOT, 'src', 'valeriaSpeechProsody.ts'),
    path.join(ROOT, 'src', 'valeriaVoiceCorpus.ts'),
    path.join(ROOT, 'src', 'valeriaSemanticExpansionEsDO.ts'),
    path.join(ROOT, 'src', 'valeriaMinimalPairsEsDO.ts'),
    path.join(ROOT, 'src', 'valeriaExerciseEsDO.ts'),
  ];
  execSync(
    ['npx tsc', ...entradas.map((e) => JSON.stringify(e)),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );

  const {
    tightenPauses, splitForSpeech, PROSODY_LATIN, PROSODY_DEFAULT, prosodyFor,
  } = require(path.join(tmp, 'valeriaSpeechProsody.js'));
  const { buildVoiceCorpus } = require(path.join(tmp, 'valeriaVoiceCorpus.js'));

  // --- Universo de textos locutados -----------------------------------------
  const textos = buildVoiceCorpus().map((e) => e.text);
  for (const mod of ['valeriaSemanticExpansionEsDO', 'valeriaMinimalPairsEsDO', 'valeriaExerciseEsDO']) {
    const out = [];
    recolectar(require(path.join(tmp, `${mod}.js`)), out, null);
    textos.push(...out);
  }
  // Casos límite escritos a mano: los patrones exactos que motivaron el cambio.
  const CASOS = [
    'Esto es la cama. Di: cama.',
    'Está oscuro… ¿Qué hacemos con la luz? ¡A PRENDER! Di: prender.',
    'Escuché lana, la del ovillo. Yo pedí rrrana. Oye bien…',
    'Robot… ¡para!',
    'Simón dice… ¡cuerpo!',
    'Mira —el perro— corre.',
    'Di:   cama',
    'Línea uno\nlínea dos',
    '¡¡Muy bien!!',
    '«Hola» (otra vez)',
  ];
  textos.push(...CASOS);
  console.log(`\n${textos.length} enunciados locutados bajo prueba.`);

  // --- P1..P4 sobre cada enunciado ------------------------------------------
  const PROHIBIDO = [
    [/…|\.\.\./, 'puntos suspensivos'],
    [/[;:]/, 'dos puntos o punto y coma'],
    [/[—–]|--/, 'raya o guion largo'],
    [/[«»“”"()[\]]/, 'comillas, paréntesis o corchetes'],
    [/[\n\r\t]|\s{2,}/, 'salto de línea o espacio doble'],
    [/([,¡¿])\1/, 'signo de puntuación repetido'],
  [/[.!?][.!?]/, 'dos cierres seguidos'],
    [/,[.!?]/, 'coma pegada a un cierre'],
    [/\s[,.!?]/, 'espacio antes de un signo'],
    [/^[\s,]|[\s,]$/, 'coma o espacio en el borde'],
  ];

  let p1 = 0; let p2 = 0; let p3 = 0; let p4 = 0;
  const perfiles = [['latino', PROSODY_LATIN], ['defecto', PROSODY_DEFAULT]];

  for (const t of textos) {
    const tight = tightenPauses(t);

    if (soloLetras(tight) !== soloLetras(t)) {
      fallo(`P1: la normalización cambió el contenido → «${t}» ⇒ «${tight}»`); p1 += 1;
    }
    if (tight) {
      for (const [re, nombre] of PROHIBIDO) {
        if (re.test(tight)) { fallo(`P2: queda ${nombre} → «${tight}»`); p2 += 1; break; }
      }
    }
    if (tightenPauses(tight) !== tight) {
      fallo(`P3: no es idempotente → «${tight}» ⇒ «${tightenPauses(tight)}»`); p3 += 1;
    }
    for (const [nombre, perfil] of perfiles) {
      const trozos = splitForSpeech(t, perfil);
      if (trozos.some((s) => !s.trim())) { fallo(`P4/${nombre}: segmento vacío en «${t}»`); p4 += 1; continue; }
      if (soloLetras(trozos.join(' ')) !== soloLetras(tight)) {
        fallo(`P4/${nombre}: el troceo alteró el enunciado → «${t}» ⇒ ${JSON.stringify(trozos)}`); p4 += 1;
      }
    }
  }
  console.log(`  P1 · letras intactas: ${p1} incumplimientos`);
  console.log(`  P2 · sin puntuación de pausa larga: ${p2} incumplimientos`);
  console.log(`  P3 · idempotencia: ${p3} incumplimientos`);
  console.log(`  P4 · troceo conservador: ${p4} incumplimientos`);

  // --- P5: el perfil latino no parte las consignas cortas --------------------
  if (prosodyFor('es-DO') !== PROSODY_LATIN) {
    fallo('P5: es-DO ya no usa el perfil latino de prosodia');
  }
  if (PROSODY_LATIN.gapMs > PROSODY_DEFAULT.gapMs) {
    fallo(`P5: el perfil latino añade MÁS silencio (${PROSODY_LATIN.gapMs} ms) que el de defecto`);
  }
  const CORTAS = [
    'Esto es la cama. Di: cama.',
    'Vamos a comer. Di: comer.',
    '¡Muy bien! Otra vez.',
    'Está oscuro… ¡luz!',
  ];
  let p5 = 0;
  for (const c of CORTAS) {
    const trozos = splitForSpeech(c, PROSODY_LATIN);
    if (trozos.length !== 1) {
      fallo(`P5: la consigna corta «${c}» se parte en ${trozos.length} locuciones → ${JSON.stringify(trozos)}`);
      p5 += 1;
    }
  }
  console.log(`  P5 · consignas cortas de una tirada: ${CORTAS.length} probadas, ${p5} incumplimientos`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (fallos) {
  console.error(`\n✖ ${fallos} problemas de prosodia en la voz del sistema.`);
  console.error('  Ver la cabecera de src/valeriaSpeechProsody.ts: qué regla existe y por qué.');
  process.exit(1);
}
console.log('\n✓ La normalización de pausas conserva el enunciado y no deja pausas largas.');

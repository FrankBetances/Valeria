#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Banco de medida del ASR — Etapa 1 (escritorio)
 *   node scripts/asr-bench.js --corpus <manifiesto.json> --hyp <motor.json> […]
 *   node scripts/asr-bench.js --selftest
 *
 * Fase B de docs/plan-asr-privacidad-y-motor-local.md, §4.5 etapa 1. Compara
 * motores de reconocimiento sobre el MISMO corpus y produce la tabla que decide
 * la puerta GO/NO-GO del §4.7. No integra nada en la app: termina en números.
 *
 * ---------------------------------------------------------------------------
 * LA MÉTRICA QUE IMPORTA NO ES EL WER
 * ---------------------------------------------------------------------------
 * A Valeria+ le da igual la transcripción literal. Lo que necesita es que el
 * veredicto clínico salga bien: si el niño dijo «perro» o dijo «pelo». Un motor
 * con WER peor que preserve el contraste fonológico es PREFERIBLE a uno con WER
 * mejor que lo pierda. Por eso la cifra principal es el acierto de veredicto, y
 * la segunda son los FALSOS POSITIVOS DE CONTRASTE: los casos en que el niño
 * falló y el motor «arregló» la palabra. Ese es el riesgo R1 del plan y es lo
 * que hace inservible un ejercicio de pares mínimos.
 *
 * ---------------------------------------------------------------------------
 * POR QUÉ SE CARGA EL CÓDIGO REAL DE LA APP
 * ---------------------------------------------------------------------------
 * El veredicto no lo decide este script: lo deciden `normalizeSpeech`, el
 * pliegue dialectal y `matchPair`/`matchExpected`/`matchTarget` de
 * `src/valeriaVoice.ts`. Se compilan con `tsc` y se cargan aquí, con los
 * módulos nativos sustituidos por maniquíes. Reimplementar esa lógica en el
 * banco sería medir OTRA app: bastaría que alguien tocase el umbral fonético
 * para que la medida dejase de corresponderse con lo que hace el teléfono, y no
 * habría forma de notarlo. Además, el pliegue es POR VARIEDAD, así que el banco
 * fija el locale de cada enunciado antes de puntuarlo.
 *
 * ---------------------------------------------------------------------------
 * FORMATO DE ENTRADA
 * ---------------------------------------------------------------------------
 * Manifiesto del corpus (§4.2 · nunca versionado, vive en `corpus-asr/`):
 *
 *   {
 *     "corpus": "quisqueya-2026-08",
 *     "items": [{
 *       "id": "QH-014",            // seudónimo, NUNCA el nombre del menor
 *       "audio": "QH-014.wav",     // relativo al manifiesto
 *       "durationSec": 1.42,
 *       "locale": "es-DO",         // decide el pliegue dialectal
 *       "target": "perro",         // la palabra que se le pidió
 *       "foil": "pelo",            // la otra del par mínimo (si lo es)
 *       "expected": ["…"],         // alternativa a target/foil (expansión semántica)
 *       "adultVerdict": "pelo",    // LO QUE EL ADULTO JUZGA QUE DIJO — la verdad
 *       "speaker": "H3"            // seudónimo del hablante
 *     }]
 *   }
 *
 * `adultVerdict` es la verdad de referencia (§4.3). Cadena vacía = el adulto no
 * entendió nada inteligible. Los enunciados donde `adultVerdict` NO acierta el
 * objetivo son los valiosos: son las producciones erróneas reales, las únicas
 * que pueden detectar el riesgo R1. Un corpus sin ellas no mide lo que importa.
 *
 * Hipótesis de un motor (una por motor):
 *
 *   {
 *     "engine": "sistema-android-local",
 *     "label": "Reconocedor del sistema · modo local",
 *     "items": { "QH-014": { "alternatives": ["pelo","pero"], "inferSec": 0.31 } }
 *   }
 *
 * Un id ausente, o con `alternatives` vacío, cuenta como `noMatch` del motor.
 * ========================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// Carga de la lógica real de la app
// ---------------------------------------------------------------------------
// `src/valeriaVoice.ts` arrastra react-native, expo-speech, el mapa de 2438
// assets de voz… nada de eso existe en Node. Se sustituye por maniquíes en el
// cargador de módulos: cualquier dependencia que no sea relativa ni un módulo
// de Node devuelve un Proxy que acepta lo que le pidan, y los assets binarios
// devuelven 0 (que es lo que Metro pone ahí: un id numérico de módulo).
const PAIR_BANKS = [
  { locale: 'es-DO', mod: 'valeriaMinimalPairsEsDO', exp: 'MINIMAL_PAIRS_ESDO', label: 'Dominicano' },
  { locale: 'es', mod: 'valeriaMinimalPairs', exp: 'MINIMAL_PAIRS', label: 'Castellano' },
  { locale: 'gl', mod: 'valeriaMinimalPairsGl', exp: 'MINIMAL_PAIRS_GL', label: 'Galego' },
  { locale: 'eu', mod: 'valeriaMinimalPairsEu', exp: 'MINIMAL_PAIRS_EU', label: 'Euskara' },
  { locale: 'en-US', mod: 'valeriaMinimalPairsEn', exp: 'MINIMAL_PAIRS_EN', label: 'English (US)' },
];

function loadAppLogic() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-asr-bench-'));
  execSync(
    ['npx tsc',
      JSON.stringify(path.join(ROOT, 'src', 'valeriaVoice.ts')),
      ...PAIR_BANKS.map((b) => JSON.stringify(path.join(ROOT, 'src', `${b.mod}.ts`))),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      // `--jsx`: el grafo de imports roza un .tsx (valeriaCrypto → ValeriaProPin).
      // No se ejecuta ninguna vista aquí, pero tsc necesita saber compilarlo.
      '--esModuleInterop', '--skipLibCheck', '--jsx', 'react-jsx',
      '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );

  const makeStub = () => new Proxy(function stub() {}, {
    get(_t, k) {
      if (k === '__esModule') return true;
      // `then` indefinido a propósito: si no, un `await` sobre el maniquí se
      // quedaría esperando a un thenable que nunca resuelve.
      if (k === 'then' || typeof k === 'symbol') return undefined;
      return makeStub();
    },
    apply: () => makeStub(),
    construct: () => makeStub(),
  });

  // Android 13 (API 33) como plataforma de referencia del banco: es el suelo
  // donde la Fase A puede pedir reconocimiento local y descargar paquetes.
  const reactNative = new Proxy(
    { Platform: { OS: 'android', Version: 33, select: (o) => (o.android !== undefined ? o.android : o.default) } },
    { get: (t, k) => (k in t ? t[k] : k === '__esModule' ? true : makeStub()) },
  );

  const Module = require('module');
  const origLoad = Module._load;
  Module._load = function patched(request, ...rest) {
    if (/\.(m4a|mp3|wav|caf|png|jpe?g|svg|ttf|otf)$/i.test(request)) return 0;
    if (request.startsWith('.') || path.isAbsolute(request) || Module.builtinModules.includes(request)) {
      return origLoad.call(this, request, ...rest);
    }
    // El módulo nativo del ASR no existe fuera del teléfono; que el require
    // falle es justo lo que hace que `asrSupported()` sea false, como en Expo Go.
    if (request === 'expo-speech-recognition') throw new Error('módulo nativo ausente (banco de medida)');
    if (request === 'react-native') return reactNative;
    return makeStub();
  };

  // `__DEV__` es un global de React Native; sin él, valeriaVoice revienta al
  // evaluar la bandera de captura de corpus. false = como una build de release.
  global.__DEV__ = false;

  try {
    const voice = require(path.join(tmp, 'valeriaVoice.js'));
    const locale = require(path.join(tmp, 'valeriaLocale.js'));
    const banks = PAIR_BANKS.map((b) => ({ ...b, pairs: require(path.join(tmp, `${b.mod}.js`))[b.exp] || [] }));
    return { voice, locale, banks };
  } finally {
    Module._load = origLoad;
  }
}

// ---------------------------------------------------------------------------
// Auditoría del árbitro: ¿puede el matcher VER el contraste que se le pide?
// ---------------------------------------------------------------------------
// Antes de medir motores hay que saber si la regla que puntúa distingue las dos
// palabras del par. `matchPair` pregunta primero por el objetivo, y `matchTarget`
// da por bueno el nivel 2 con hasta UNA letra de diferencia por palabra —una
// tolerancia puesta a propósito, porque un niño en rehabilitación no articula
// perfecto—. La consecuencia es que en los pares que se diferencian en una sola
// letra, producir el distractor puntúa como acierto y la rama del distractor no
// se alcanza nunca.
//
// Esto no es un fallo del banco de medida ni de ningún motor: pasa antes de que
// intervenga el reconocedor, con la transcripción perfecta. Importa aquí porque
// en esos pares NINGUNA cifra de la Fase B puede discriminar nada: la verdad de
// referencia ya sale mal etiquetada. Es materia clínica (§1.3 del plan), así que
// esto lo REPORTA; no lo cambia.
function auditPairs(app) {
  console.log('\n## Auditoría de contraste de los pares mínimos\n');
  console.log('Se simula la transcripción PERFECTA del distractor y se mira qué veredicto sale.');
  console.log('Lo esperable sería `foil`. Donde sale `target`, el par es ciego a su propio contraste.\n');

  let ciegos = 0; let total = 0;
  for (const b of app.banks) {
    if (!b.pairs.length) continue;
    app.locale.setLocale(b.locale);
    const rotos = b.pairs.filter((p) => app.voice.matchPair([p.foil], p.target, p.foil) !== 'foil');
    ciegos += rotos.length; total += b.pairs.length;

    console.log(`### ${b.label} (${b.locale}) — ${rotos.length}/${b.pairs.length} pares ciegos`);
    for (const p of rotos) {
      console.log(`  ✖ ${p.id || p.code}: decir «${p.foil}» cuando se pidió «${p.target}» puntúa como acierto`);
    }
    if (!rotos.length) console.log('  ✓ todos los pares distinguen su distractor');
    console.log('');
  }

  console.log(`**${ciegos} de ${total} pares mínimos no distinguen su propio distractor.**\n`);
  if (ciegos) {
    console.log('> Consecuencia para la Fase B: en esos ensayos la línea base ya puntúa mal con');
    console.log('> transcripción perfecta, así que la comparación entre motores no mide el contraste');
    console.log('> clínico — mide otra cosa. Conviene resolverlo ANTES de grabar el corpus, o el');
    console.log('> corpus servirá para menos de lo que costó.');
    console.log('>');
    console.log('> Es una decisión clínica, no técnica: la tolerancia de una letra existe porque un');
    console.log('> niño en rehabilitación no articula perfecto, y apretarla producirá más falsos');
    console.log('> «no te escuché». Va con el umbral que tiene que fijar ACOPROS (D6 del plan).');
  }
  return ciegos;
}

// ---------------------------------------------------------------------------
// Veredicto: el mismo camino que sigue la app con lo que oye
// ---------------------------------------------------------------------------
// Devuelve una etiqueta comparable. Para pares mínimos son las cuatro ramas de
// `matchPair`; para lo demás, los tres niveles de `matchTarget`/`matchExpected`
// traducidos a las mismas palabras, para poder cruzarlo todo en una tabla.
function verdictOf(app, item, alternatives) {
  app.locale.setLocale(item.locale || 'es');       // el pliegue dialectal es por variedad
  const alts = (alternatives || []).filter((a) => typeof a === 'string' && a.trim());
  if (!alts.length) return 'none';

  if (item.foil) return app.voice.matchPair(alts, item.target, item.foil);

  const lvl = Array.isArray(item.expected) && item.expected.length
    ? app.voice.matchExpected(alts, item.expected)
    : app.voice.matchTarget(alts, item.target);
  return lvl === 2 ? 'target' : lvl === 1 ? 'close' : 'none';
}

const isHit = (v) => v === 'target';

// Normalización llana para el WER: sin pliegue dialectal, a propósito. El WER
// está aquí solo para poder comparar con cifras publicadas fuera del proyecto,
// y plegar la /s/ dominicana lo volvería incomparable. Las métricas que deciden
// no lo usan.
const plainWords = (s) => String(s || '')
  .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zñ0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);

function editOps(a, b) {
  const m = a.length; const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

// ---------------------------------------------------------------------------
// Puntuación de un motor sobre el corpus
// ---------------------------------------------------------------------------
function scoreEngine(app, corpus, hyp) {
  const r = {
    engine: hyp.engine,
    label: hyp.label || hyp.engine,
    n: corpus.items.length,
    verdictHits: 0,
    noMatch: 0,
    // Subconjunto clínicamente decisivo: enunciados donde el niño NO produjo el
    // objetivo. Es donde se ve si el motor «arregla» lo que oye.
    erroredN: 0,
    contrastFP: 0,
    correctN: 0,
    falseNeg: 0,
    werErrors: 0,
    werWords: 0,
    inferSec: 0,
    audioSec: 0,
    missingHyp: 0,
    perItem: [],
  };

  for (const item of corpus.items) {
    const h = hyp.items[item.id];
    if (!h) r.missingHyp += 1;
    const alts = h && Array.isArray(h.alternatives) ? h.alternatives : [];

    const reference = verdictOf(app, item, [item.adultVerdict]);
    const engine = verdictOf(app, item, alts);

    if (!alts.length) r.noMatch += 1;
    if (engine === reference) r.verdictHits += 1;

    if (isHit(reference)) {
      r.correctN += 1;
      if (!isHit(engine)) r.falseNeg += 1;
    } else {
      r.erroredN += 1;
      if (isHit(engine)) r.contrastFP += 1;   // R1: el motor arregló la palabra
    }

    const ref = plainWords(item.adultVerdict);
    const got = plainWords(alts[0] || '');
    r.werErrors += editOps(got, ref);
    r.werWords += ref.length;

    if (typeof item.durationSec === 'number') r.audioSec += item.durationSec;
    if (h && typeof h.inferSec === 'number') r.inferSec += h.inferSec;

    r.perItem.push({ id: item.id, reference, engine, agree: engine === reference });
  }

  const pct = (a, b) => (b ? (100 * a) / b : null);
  r.verdictAccuracy = pct(r.verdictHits, r.n);
  r.contrastFPRate = pct(r.contrastFP, r.erroredN);
  r.falseNegRate = pct(r.falseNeg, r.correctN);
  r.noMatchRate = pct(r.noMatch, r.n);
  r.wer = pct(r.werErrors, r.werWords);
  r.rtf = r.audioSec ? r.inferSec / r.audioSec : null;
  return r;
}

// ---------------------------------------------------------------------------
// Informe
// ---------------------------------------------------------------------------
const f1 = (v, suf = '') => (v == null ? '—' : `${v.toFixed(1)}${suf}`);
const f2 = (v) => (v == null ? '—' : v.toFixed(2));

function report(results, baselineId) {
  const base = results.find((r) => r.engine === baselineId) || null;

  console.log('\n## Banco de medida del ASR · etapa 1 (escritorio)\n');
  console.log(`Corpus: ${results[0].n} enunciados · ${results[0].correctN} bien producidos · ${results[0].erroredN} con error real del niño\n`);

  if (!results[0].erroredN) {
    console.log('> ⚠️  El corpus NO tiene producciones erróneas. Sin ellas los falsos positivos');
    console.log('>    de contraste no se pueden medir, que es el riesgo R1 y la razón de ser');
    console.log('>    de esta fase. La tabla de abajo no sirve para decidir la puerta §4.7.\n');
  }

  console.log('| Motor | Acierto de veredicto | Falsos pos. de contraste (R1) | Falsos neg. | noMatch | WER | RTF |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');
  for (const r of results) {
    const marca = base && r.engine === base.engine ? ' *(línea base)*' : '';
    console.log(
      `| ${r.label}${marca} | ${f1(r.verdictAccuracy, ' %')} | ${r.contrastFP}/${r.erroredN} (${f1(r.contrastFPRate, ' %')}) `
      + `| ${r.falseNeg}/${r.correctN} (${f1(r.falseNegRate, ' %')}) | ${f1(r.noMatchRate, ' %')} | ${f1(r.wer, ' %')} | ${f2(r.rtf)} |`,
    );
  }

  for (const r of results) {
    if (r.missingHyp) {
      console.log(`\n> ⚠️  ${r.label}: faltan hipótesis de ${r.missingHyp} enunciado(s); cuentan como noMatch.`);
    }
  }

  if (!base) {
    console.log('\n> Sin `--baseline`, no se aplica la puerta §4.7: falta contra qué comparar.');
    return results;
  }

  // --- Puerta §4.7 ---------------------------------------------------------
  console.log('\n### Puerta GO / NO-GO (§4.7)\n');
  for (const r of results) {
    if (r.engine === base.engine) continue;
    const dAcierto = r.verdictAccuracy - base.verdictAccuracy;
    const cumpleAcierto = dAcierto >= -2;                 // tolerancia de 2 puntos
    const cumpleContraste = r.contrastFP <= base.contrastFP;
    const veredicto = cumpleAcierto && cumpleContraste ? 'GO (etapa 1)' : 'NO-GO';

    console.log(`**${r.label} → ${veredicto}**`);
    console.log(`- Acierto de veredicto: ${f1(r.verdictAccuracy, ' %')} vs ${f1(base.verdictAccuracy, ' %')} de la base `
      + `(${dAcierto >= 0 ? '+' : ''}${dAcierto.toFixed(1)} pts) · ${cumpleAcierto ? 'cumple' : 'FALLA: más de 2 puntos por debajo'}`);
    console.log(`- Falsos positivos de contraste: ${r.contrastFP} vs ${base.contrastFP} de la base · `
      + `${cumpleContraste ? 'cumple' : 'FALLA: el motor arregla más palabras que la línea base'}`);
    console.log('- Latencia, RAM y tamaño: **etapa 2, en dispositivo**. La etapa 1 no puede darlos por buenos.\n');
  }

  console.log('> Un GO aquí solo autoriza a llevar el motor al teléfono (§4.5 etapa 2).');
  console.log('> La puerta completa del §4.7 exige además latencia < 3 s, RAM < 400 MB y < 150 MB de tamaño.');
  return results;
}

// ---------------------------------------------------------------------------
// Validación de entradas — barata y ruidosa, porque un corpus mal escrito
// produce una tabla con aspecto perfectamente creíble.
// ---------------------------------------------------------------------------
function loadCorpus(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(data.items) || !data.items.length) throw new Error(`${file}: no tiene items`);
  const vistos = new Set();
  data.items.forEach((it, i) => {
    if (!it.id) throw new Error(`${file}: el item ${i} no tiene id`);
    if (vistos.has(it.id)) throw new Error(`${file}: id duplicado «${it.id}»`);
    vistos.add(it.id);
    if (!it.target) throw new Error(`${file}: el item «${it.id}» no tiene target`);
    if (typeof it.adultVerdict !== 'string') {
      throw new Error(`${file}: el item «${it.id}» no tiene adultVerdict (usa "" si no se entendió nada)`);
    }
    // El nombre de un menor en un corpus de datos de salud es exactamente lo
    // que la seudonimización del §4.2 existe para evitar.
    if (/\s/.test(it.id)) throw new Error(`${file}: el id «${it.id}» tiene espacios; usa un código, no un nombre`);
  });
  return data;
}

function loadHyp(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data.engine) throw new Error(`${file}: falta el campo "engine"`);
  if (!data.items || typeof data.items !== 'object') throw new Error(`${file}: falta el mapa "items"`);
  return data;
}

// ---------------------------------------------------------------------------
// Autoprueba: el banco medido contra sí mismo
// ---------------------------------------------------------------------------
// Existe porque este script produce las cifras que deciden un GO/NO-GO, y un
// error en la definición de una métrica daría una tabla creíble y falsa — que
// es el defecto que originó todo el plan. Los motores sintéticos son los dos
// extremos: el que acierta siempre y el «arreglador» del riesgo R1.
function selftest(app) {
  const corpus = {
    corpus: 'selftest',
    items: [
      // El niño acierta el objetivo.
      { id: 'T1', locale: 'es', target: 'perro', foil: 'pelo', adultVerdict: 'perro', durationSec: 1 },
      { id: 'T2', locale: 'es', target: 'carro', foil: 'callo', adultVerdict: 'carro', durationSec: 1 },
      // El niño falla y produce la otra palabra del par: el caso que decide.
      // Los dos pares se diferencian en DOS letras, que es lo que hace falta
      // para que el matcher los distinga (ver T6 y `--audit-pairs`).
      { id: 'T3', locale: 'es', target: 'perro', foil: 'pelo', adultVerdict: 'pelo', durationSec: 1 },
      { id: 'T4', locale: 'es', target: 'carro', foil: 'callo', adultVerdict: 'callo', durationSec: 1 },
      // Variedad dominicana: la elisión de /s/ en coda es rasgo dialectal, no
      // error, y el pliegue tiene que hacer equivalentes "las casas"/"la casa".
      { id: 'T5', locale: 'es-DO', target: 'las casas', adultVerdict: 'la casa', durationSec: 1 },
      // Par de UNA letra de diferencia. Hasta D7 (2026-08-04) el matcher NO lo
      // distinguía y esta aserción documentaba el fallo; desde que `matchPair`
      // desambigua por vecino más cercano, decir el distractor se detecta.
      { id: 'T6', locale: 'es', target: 'rana', foil: 'lana', adultVerdict: 'lana', durationSec: 1 },
    ],
  };

  const perfecto = {
    engine: 'perfecto',
    label: 'Motor que devuelve lo que el adulto juzgó',
    items: Object.fromEntries(corpus.items.map((i) => [i.id, { alternatives: [i.adultVerdict], inferSec: 0.2 }])),
  };
  const arreglador = {
    engine: 'arreglador',
    label: 'Motor que siempre devuelve la palabra bien formada (R1)',
    items: Object.fromEntries(corpus.items.map((i) => [i.id, { alternatives: [i.target], inferSec: 0.2 }])),
  };
  const sordo = {
    engine: 'sordo',
    label: 'Motor que no capta nada',
    items: {},
  };

  let fallos = 0;
  const comprobar = (cond, msg) => {
    if (cond) console.log('  ✓ ' + msg);
    else { fallos += 1; console.error('  ✖ ' + msg); }
  };

  const P = scoreEngine(app, corpus, perfecto);
  const A = scoreEngine(app, corpus, arreglador);
  const S = scoreEngine(app, corpus, sordo);

  comprobar(P.verdictAccuracy === 100, 'El motor perfecto acierta el 100 % de los veredictos');
  comprobar(P.contrastFP === 0, 'El motor perfecto no fabrica ningún falso positivo de contraste');
  comprobar(P.wer === 0, 'El motor perfecto tiene WER 0');
  comprobar(Math.abs(P.rtf - 0.2) < 1e-9, 'El RTF se calcula como inferencia / duración (0.2)');

  comprobar(corpus.items.length === P.n, 'Se puntúan todos los enunciados del corpus');
  comprobar(P.erroredN === 3 && P.correctN === 3,
    'El corpus se parte en 3 producciones erróneas (T3, T4, T6) y 3 correctas (T1, T2, T5)');

  comprobar(A.contrastFP === 3 && A.contrastFPRate === 100,
    'El «arreglador» fabrica falsos positivos en el 100 % de las producciones erróneas — es el riesgo R1');
  comprobar(A.verdictAccuracy < P.verdictAccuracy, 'El «arreglador» acierta menos veredictos que el perfecto');
  comprobar(A.falseNeg === 0, 'El «arreglador» no produce falsos negativos: su defecto es el contrario');

  comprobar(S.noMatch === corpus.items.length, 'Un motor sin hipótesis cuenta todos los enunciados como noMatch');
  comprobar(S.missingHyp === corpus.items.length, 'Se avisa de las hipótesis que faltan');
  comprobar(S.falseNeg === P.correctN, 'El motor sordo produce un falso negativo por cada producción tenida por correcta');

  // El pliegue dialectal tiene que estar vivo: sin él, T5 fallaría.
  const t5 = P.perItem.find((i) => i.id === 'T5');
  comprobar(t5.reference === 'target',
    'El pliegue dominicano se aplica: «la casa» del niño acierta el objetivo «las casas»');

  // Y no debe aplicarse fuera de es-DO: la misma pareja en castellano no cuadra.
  const soloEs = { corpus: 'x', items: [{ id: 'E1', locale: 'es', target: 'las casas', adultVerdict: 'la casa', durationSec: 1 }] };
  const E = scoreEngine(app, soloEs, { engine: 'p', items: { E1: { alternatives: ['la casa'], inferSec: 0.1 } } });
  comprobar(E.perItem[0].reference !== 'target',
    'El pliegue NO se aplica en castellano: «la casa» no acierta «las casas» fuera de es-DO');

  // D7 · el contraste de un solo fonema se detecta. Esta línea era la que
  // documentaba el fallo antes del 2026-08-04; ahora vigila que no vuelva.
  const t6 = P.perItem.find((i) => i.id === 'T6');
  comprobar(t6.reference === 'foil',
    'D7: en pares de UNA letra (rana/lana) decir el distractor se detecta como error, no como acierto');

  // Y el reverso: la desambiguación no puede haberse llevado por delante la
  // tolerancia con habla aproximada que no es el distractor.
  const aprox = { corpus: 'x', items: [{ id: 'A1', locale: 'es', target: 'rana', foil: 'lana', adultVerdict: 'rana', durationSec: 1 }] };
  const Ap = scoreEngine(app, aprox, { engine: 'p', items: { A1: { alternatives: ['ana'], inferSec: 0.1 } } });
  comprobar(Ap.perItem[0].engine !== 'foil',
    'D7: una aproximación del objetivo («ana» por «rana») nunca se atribuye al distractor');

  console.log(`\n${fallos ? '✗' : '✓'} Autoprueba del banco: ${fallos} fallo(s).`);
  return fallos;
}

// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { hyp: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--selftest') args.selftest = true;
    else if (a === '--audit-pairs') args.auditPairs = true;
    else if (a === '--corpus') args.corpus = argv[++i];
    else if (a === '--hyp') args.hyp.push(argv[++i]);
    else if (a === '--baseline') args.baseline = argv[++i];
    else if (a === '--json') args.json = argv[++i];
    else throw new Error(`argumento desconocido: ${a}`);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const app = loadAppLogic();

  if (args.selftest) process.exit(selftest(app) ? 1 : 0);
  if (args.auditPairs) { auditPairs(app); return; }

  if (!args.corpus || !args.hyp.length) {
    console.error('Uso: node scripts/asr-bench.js --corpus <manifiesto.json> --hyp <motor.json> [--hyp …] [--baseline <engine>] [--json <salida>]');
    console.error('     node scripts/asr-bench.js --audit-pairs   (¿distingue el matcher cada par?)');
    console.error('     node scripts/asr-bench.js --selftest      (¿mide bien el propio banco?)');
    process.exit(2);
  }

  const corpus = loadCorpus(args.corpus);
  const results = args.hyp.map((f) => scoreEngine(app, corpus, loadHyp(f)));
  report(results, args.baseline);

  if (args.json) {
    fs.writeFileSync(args.json, `${JSON.stringify({ corpus: corpus.corpus, results }, null, 2)}\n`);
    console.log(`\n✓ Resultados en ${args.json}`);
  }
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}

module.exports = { scoreEngine, verdictOf, loadAppLogic };

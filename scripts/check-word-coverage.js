// ============================================================================
// Valeria+ · Gate · la lámina encendida y la palabra puntuada son la misma
//
//   node scripts/check-word-coverage.js
//
// Existe porque la regla de "¿dijo esta palabra?" llegó a estar escrita DOS
// veces: dentro de `matchTarget` (que puntúa) y dentro de
// `ValeriaSentenceWordCards` (que enciende las láminas). No eran iguales —las
// láminas aceptaban además la palabra como subcadena de todo lo oído—, así que
// una frase podía encenderle al niño las cinco láminas y recibir después un
// «casi». La pantalla diciéndole que lo hizo entero y la app diciéndole que no.
//
// Ahora las dos leen `wordCoverage`. Este gate comprueba que siguen de acuerdo,
// y de paso fija la tolerancia por si alguien la mueve sin querer.
//
// Carga el módulo REAL transpilado, con las dependencias nativas apagadas: lo
// que se comprueba es el código que se entrega, no una copia de su lógica.
// ============================================================================
const fs = require('fs');
const path = require('path');
const Module = require('module');

const ROOT = path.join(__dirname, '..');
const ts = require(path.join(ROOT, 'node_modules', 'typescript'));

global.__DEV__ = false;

// Todo lo que toca el aparato se sustituye por un hueco: aquí no se habla ni se
// escucha, solo se compara texto.
const disco = {};
const STUBS = {
  'react-native': {
    Platform: { OS: 'android' },
    Touchable: { Mixin: {} },
    // La telemetría difiere su escritura a InteractionManager. Aquí no hay
    // gestos que esperar, así que se ejecuta y punto.
    InteractionManager: { runAfterInteractions: (fn) => { fn(); return { cancel() {} }; } },
  },
  'expo-speech': { speak() {}, stop() {}, getAvailableVoicesAsync: async () => [] },
  'react-native-svg': new Proxy({}, { get: () => () => null }),
  './valeriaVoicePlayback': { playVoiceAsset() {}, stopVoiceAsset() {} },
  './valeriaVoiceAssets': { VOICE_ASSETS: {} },
  // Un disco de mentira, pero con la MISMA semántica: lo que se guarda se lee.
  // Es lo que permite comprobar el viaje de ida y vuelta del registro.
  '@react-native-async-storage/async-storage': {
    default: {
      getItem: async (k) => (k in disco ? disco[k] : null),
      setItem: async (k, v) => { disco[k] = String(v); },
      removeItem: async (k) => { delete disco[k]; },
    },
  },
  // ValeriaProPin arrastra media app y de él solo hace falta sha256. Se extrae
  // su código REAL del fichero para que el cifrado sea el de verdad.
  './ValeriaProPin': null, // se rellena abajo, cuando loadTs ya existe
};

const cache = new Map();
const origLoad = Module._load;
Module._load = function (req, parent) {
  if (STUBS[req]) return STUBS[req];
  if (parent && (req.startsWith('./') || req.startsWith('../'))) {
    const abs = path.resolve(path.dirname(parent.filename), req);
    for (const ext of ['.ts', '.tsx']) {
      if (fs.existsSync(abs + ext)) return loadTs(abs + ext);
    }
  }
  return origLoad.apply(this, arguments);
};

function loadTs(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
    },
  }).outputText;
  const m = new Module(file, null);
  m.filename = file;
  m.paths = Module._nodeModulePaths(path.dirname(file));
  cache.set(file, m);
  m._compile(js, file);
  return m.exports;
}

STUBS['./ValeriaProPin'] = (() => {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'ValeriaProPin.tsx'), 'utf8');
  const i = src.indexOf('export const sha256 = async');
  const j = src.indexOf('\nexport ', i + 10);
  const frag = src.slice(i, j).replace('export const', 'const');
  const js = ts.transpileModule(frag + '\nmodule.exports = { sha256 };', {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const m = new Module('sha256', null);
  m._compile(js, 'sha256.js');
  return m.exports;
})();

const { wordCoverage, matchTarget } = loadTs(path.join(ROOT, 'src', 'valeriaVoice.ts'));

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };
const eq = (nombre, real, esperado) => {
  if (JSON.stringify(real) !== JSON.stringify(esperado)) {
    fallo(`${nombre}: ${JSON.stringify(real)} en vez de ${JSON.stringify(esperado)}`);
  }
};

const cov = (oido, objetivo) => {
  const c = wordCoverage(oido ? [oido] : [], objetivo);
  return [c.hits, c.total];
};

const FRASE = 'el oso come pan';

// 1 · La cuenta de palabras.
eq('frase entera', cov('el oso come pan', FRASE), [4, 4]);
eq('falta la última', cov('el oso come', FRASE), [3, 4]);
eq('no se oyó nada', cov('', FRASE), [0, 4]);
eq('se oyó otra cosa', cov('xxxxx', FRASE), [0, 4]);
eq('orden distinto', cov('pan come oso el', FRASE), [4, 4]);
eq('un fonema en palabra larga', cov('el oso comer pan', FRASE), [4, 4]);
// En «pan» una letra de diferencia YA es otra palabra: la tolerancia se aplica
// solo por encima de tres letras, y esto lo fija.
eq('una letra en palabra de 3', cov('el oso come pon', FRASE), [3, 4]);
eq('objetivo de una palabra', cov('rana', 'rana'), [1, 1]);
eq('máscara de la que falta',
  wordCoverage(['el oso come'], FRASE).matched, [true, true, true, false]);
eq('sin alternativas', cov(null, FRASE), [0, 4]);
eq('objetivo vacío', cov('lo que sea', ''), [0, 0]);

// 2 · La mejor alternativa manda: el reconocedor devuelve varias y quedarse con
// la primera desperdicia las demás.
eq('gana la alternativa más completa',
  (() => { const c = wordCoverage(['el oso', 'el oso come pan'], FRASE); return [c.hits, c.total]; })(),
  [4, 4]);

// 3 · Lo que de verdad vigila este gate: lámina y veredicto no se contradicen.
for (const oido of ['el oso come pan', 'el oso come', 'oso', 'xxxxx', '']) {
  const c = wordCoverage(oido ? [oido] : [], FRASE);
  const lvl = matchTarget(oido ? [oido] : [], FRASE);
  if ((c.hits === c.total) !== (lvl === 2)) {
    fallo(`"${oido}": ${c.hits}/${c.total} láminas pero veredicto ${lvl} (todas encendidas debería ser acierto)`);
  }
  if ((c.hits > 0) !== (lvl >= 1)) {
    fallo(`"${oido}": ${c.hits}/${c.total} láminas pero veredicto ${lvl} (alguna encendida debería ser al menos «casi»)`);
  }
}

// 4 · Las láminas no pueden traer su propia regla otra vez.
const cards = fs.readFileSync(path.join(ROOT, 'src', 'ValeriaSentenceWordCards.tsx'), 'utf8');
if (/const\s+editDistance/.test(cards)) {
  fallo('ValeriaSentenceWordCards vuelve a tener su propia distancia de edición: usa wordCoverage.');
}
if (!/wordCoverage/.test(cards)) {
  fallo('ValeriaSentenceWordCards ya no usa wordCoverage: las dos reglas se han vuelto a separar.');
}

// 5 · El viaje del dato: se registra, se cifra, se guarda, se relee y sale en
//     la exportación. Este tramo existe porque `normalizeSession` construye el
//     registro campo a campo y durante un tiempo se dejó `listen` y `asr` fuera:
//     se recogían toda la sesión y desaparecían justo antes del fichero. Sin una
//     comprobación de ida y vuelta eso no se ve, porque la app no falla: exporta
//     un cero.
(async () => {
  const tlm = loadTs(path.join(ROOT, 'src', 'valeriaTelemetry.ts'));

  tlm.trackPhraseCoverage(3, 4);
  tlm.trackPhraseCoverage(4, 4);
  tlm.trackPhraseCoverage(1, 5);
  tlm.trackPhraseCoverage(1, 1);   // una palabra no es enunciado: se ignora
  tlm.trackPhraseCoverage(9, 3);   // imposible: se acota a 3
  tlm.trackPhraseCoverage(NaN, 4); // basura: se ignora

  const { summary } = await tlm.buildExport();
  // 3 enunciados válidos + el acotado = 4 · pedidas 4+4+5+3 = 16 · dichas 3+4+1+3 = 11
  eq('enunciados contados', summary.utterances, 4);
  eq('palabras por enunciado', summary.wordsPerUtterance, +(11 / 4).toFixed(2));
  eq('cobertura de la frase', summary.phraseCoverage, +(11 / 16).toFixed(3));

  if (summary.utterances === 0) {
    fallo('el dato de producción no sobrevive al viaje por disco: revisa normalizeSession.');
  }

  const qr = JSON.parse((await tlm.buildExport()).qrPayload);
  if (qr.un !== 4) fallo(`el QR no lleva los enunciados: un=${JSON.stringify(qr.un)}`);

  if (fallos) {
    console.error(`\n✖ ${fallos} problema(s) de cobertura de palabras.`);
    process.exit(1);
  }
  console.log('✓ Cobertura de palabras: láminas y veredicto leen la misma regla,');
  console.log('  y la producción por enunciado sobrevive hasta la exportación.');
  // La telemetría deja un temporizador de escritura en vuelo; sin esto el gate
  // se queda esperándolo.
  process.exit(0);
})().catch((e) => { console.error('✖ ' + e.message); process.exit(1); });

#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Ningún par mínimo puede ser indistinguible para el emparejador
 *   node scripts/check-pair-discriminability.js
 *
 * UN PAR QUE NO SE PUEDE DISTINGUIR NO MIDE NADA, Y ADEMÁS MIENTE.
 *
 * `matchPair` compara la distancia de lo oído al objetivo y al distractor. Si
 * las dos palabras del par colapsan a la MISMA cadena tras normalizar, ambas
 * distancias valen 0 y la primera condición del selector devuelve 'target':
 * el niño produce el error y la app le dice que ha acertado. No hay excepción,
 * no hay log y el typecheck no ve nada — es una comparación de cadenas que sale
 * bien.
 *
 * Pasó de verdad (6/9/2026) con los dos pares galegos de ABERTURA VOCÁLICA:
 * en galego «óso» (do esqueleto) y «oso» (o animal) son palabras distintas y la
 * escritura solo las separa con la tilde, que es justo lo que quitaba
 * `normalizeSpeech`. Se arregló haciendo que `matchPair` conserve el diacrítico
 * cuando el par lo necesita; este gate impide que se vuelva a romper y extiende
 * la comprobación a los SEIS bancos, no solo al galego.
 *
 * Tres comprobaciones sobre los bancos compilados de verdad:
 *
 *   D1 · Con el objetivo dictado literalmente, matchPair devuelve 'target'.
 *   D2 · Con el distractor dictado literalmente, devuelve 'foil'. Es la que
 *        caza el colapso: un par indistinguible falla aquí.
 *   D3 · El pliegue galego respeta la ⟨x⟩ (/ʃ/), que es contraste clínico en
 *        PM-GL-8 y PM-GL-9, y pliega la gheada en los dos lados.
 * ========================================================================== */
global.__DEV__ = false;
const assert = require('assert');
const Module = require('module');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');

const STUBS = {
  'react-native': { Platform: { OS: 'web' }, InteractionManager: { runAfterInteractions: (f) => f() } },
  'expo-speech': { speak() {}, stop() {}, getAvailableVoicesAsync: async () => [] },
  'react-native-svg': new Proxy({}, { get: () => () => null }),
  './valeriaVoicePlayback': { playVoiceAsset() {}, stopVoiceAsset() {} },
  './valeriaVoiceAssets': { VOICE_ASSETS: {} },
  './ValeriaProPin': { sha256: (x) => x },
  './i18n': { useT: () => ({}), tNow: () => ({}) },
  '@react-native-async-storage/async-storage': {
    default: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} },
  },
};

const cache = new Map();
const origLoad = Module._load;
Module._load = function (req, parent) {
  if (req in STUBS) return STUBS[req];
  if (parent && (req.startsWith('./') || req.startsWith('../'))) {
    const abs = path.resolve(path.dirname(parent.filename), req);
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      if (fs.existsSync(abs + ext)) return loadTs(abs + ext);
    }
  }
  return origLoad.apply(this, arguments);
};

function loadTs(file) {
  if (cache.has(file)) return cache.get(file).exports;
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
  }).outputText;
  const m = new Module(file, null);
  m.filename = file;
  m.paths = Module._nodeModulePaths(path.dirname(file));
  cache.set(file, m);
  m._compile(js, file);
  m.loaded = true;
  return m.exports;
}

const voice = loadTs(path.join(ROOT, 'src/valeriaVoice.ts'));
const locale = loadTs(path.join(ROOT, 'src/valeriaLocale.ts'));
const banks = loadTs(path.join(ROOT, 'src/valeriaPairBanks.ts'));

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };

// Variedad → dialectos gallegos que hay que probar (en el resto, uno solo).
const VARIEDADES = [
  ['es', 'distincion'], ['gl', 'distincion'], ['gl', 'seseo'],
  ['eu', 'distincion'], ['en-US', 'distincion'], ['ca', 'distincion'], ['es-DO', 'distincion'],
];

(async () => {
  console.log('\n── D1/D2 · cada par se distingue de sí mismo en su variedad ──');
  let probados = 0;
  for (const [loc, dial] of VARIEDADES) {
    await locale.setLocale(loc);
    await locale.setGalicianDialect(dial);
    const pares = banks.pairsForLocale(loc, dial);
    for (const p of pares) {
      probados += 1;
      const t = voice.matchPair([p.target], p.target, p.foil);
      if (t !== 'target') {
        fallo(`${loc}/${dial} · ${p.code} (${p.target}/${p.foil}): dictando el OBJETIVO devuelve '${t}'`);
      }
      const f = voice.matchPair([p.foil], p.target, p.foil);
      if (f !== 'foil') {
        fallo(`${loc}/${dial} · ${p.code} (${p.target}/${p.foil}): dictando el DISTRACTOR devuelve '${f}'`
          + " — el par no mide nada: el niño produce el error y la app le da por bueno");
      }
    }
  }
  console.log(`  ${probados} pares probados en ${VARIEDADES.length} combinaciones de variedad y dialecto`);

  console.log('\n── D3 · el pliegue galego: gheada sí, /ʃ/ no ──');
  const fold = voice.foldGalician;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zñ0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  // La gheada se pliega en los dos lados.
  for (const [a, b] of [['gato', 'jato'], ['guerra', 'jerra'], ['amigo', 'amijo'], ['auga', 'auja']]) {
    if (fold(norm(a), false) !== fold(norm(b), false)) {
      fallo(`la gheada no se pliega: "${a}" y "${b}" siguen siendo distintas`);
    }
  }
  // La ⟨x⟩ NO se toca: es /ʃ/, contraste clínico del banco galego.
  for (const [a, b] of [['xeo', 'cheo'], ['xoia', 'soia']]) {
    if (fold(norm(a), false) === fold(norm(b), false)) {
      fallo(`el pliegue galego borra el contraste /ʃ/: "${a}" y "${b}" colapsan`);
    }
  }
  // El seseo solo pliega cuando se pide, y entonces sí.
  if (fold(norm('casa'), false) === fold(norm('caza'), false)) {
    fallo('sin seseo, casa y caza deberían seguir distintas');
  }
  if (fold(norm('casa'), true) !== fold(norm('caza'), true)) {
    fallo('con seseo, casa y caza deberían plegarse');
  }
  // Y con seseo el par que lo mide sale del banco.
  const conSeseo = banks.pairsForLocale('gl', 'seseo');
  if (conSeseo.some((p) => p.region === 'distincion')) {
    fallo('con seseo sigue habiendo pares que dependen de la distinción s/θ en el banco');
  }
  if (fallos === 0) console.log('  ✓ gheada plegada, /ʃ/ intacto y el seseo solo donde se declara');

  console.log('');
  if (fallos) {
    console.error(`✗ ${fallos} fallo(s): hay pares que no distinguen su propio contraste.\n`);
    process.exit(1);
  }
  console.log('✓ Todos los pares mínimos distinguen su contraste en su variedad.\n');
})();

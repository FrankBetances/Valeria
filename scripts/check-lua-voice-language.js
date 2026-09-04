#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de la voz de Aventuras con Lúa
 *   node scripts/check-lua-voice-language.js
 *
 * El módulo se locuta en castellano en las cinco variedades porque sus
 * catálogos solo existen en castellano. Eso está decidido y escrito. Lo que NO
 * puede pasar —y pasaba— es que el castellano se lea con la voz de la sesión:
 * en galego la voz de Celtia pronunciando palabras castellanas, en euskera la
 * de HiTZ. El acento se mantenía y el idioma no, que sobre un estímulo clínico
 * de discriminación es exactamente lo que no puede ocurrir.
 *
 * El fallo no se veía porque no rompe nada: no hay excepción, no hay rojo, la
 * frase suena. Y no lo detecta ningún gate de texto, porque el texto era
 * correcto; lo equivocado era la VOZ. Por eso esto no lee el código con
 * expresiones regulares: EJECUTA la ruta de locución con expo-speech y el
 * reproductor de assets sustituidos por espías, y mira qué se reprodujo.
 *
 * Comprueba, en las variedades sin banco propio (gl · eu · ca · en-US):
 *   1. que la locución sale por el asset neuronal CASTELLANO (Sharvard), que es
 *      el que está horneado, y no por el motor del sistema;
 *   2. que si ese asset faltara, el motor recibe `es-ES` y una voz castellana,
 *      nunca la voz puntuada para la variedad de la sesión;
 *   3. que en castellano y dominicano la ruta normal sigue intacta.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const Module = require('module');

const ROOT = path.join(__dirname, '..');
const fails = [];
const fail = (m) => fails.push(m);
const ok = (m) => console.log(`  ✓ ${m}`);

// --- Espías -----------------------------------------------------------------
const spy = { spoken: [], assets: [] };

// Catálogo de voces del sistema a propósito ADVERSO: el dispositivo tiene la
// voz de la lengua de la sesión instalada, que es cuando el fallo se producía.
// Si no la tuviera, la voz castellana ganaba sola y el error no se vería.
const VOICES = [
  { identifier: 'gl-es-x-gla-local', name: 'Galego', language: 'gl-ES', quality: 'Enhanced' },
  { identifier: 'eu-es-x-eua-local', name: 'Euskara', language: 'eu-ES', quality: 'Enhanced' },
  { identifier: 'ca-es-x-caa-local', name: 'Català', language: 'ca-ES', quality: 'Enhanced' },
  { identifier: 'en-us-x-tpf-local', name: 'English US', language: 'en-US', quality: 'Enhanced' },
  { identifier: 'es-es-x-eed-local', name: 'Español', language: 'es-ES', quality: 'Enhanced' },
];

const speechStub = {
  VoiceQuality: { Enhanced: 'Enhanced', Default: 'Default' },
  speak: (text, opts = {}) => {
    spy.spoken.push({ text, language: opts.language, voice: opts.voice });
    // El motor real encadena por onDone; aquí no hace falta más que no colgarse.
  },
  stop: () => {},
  getAvailableVoicesAsync: async () => VOICES,
};

const stubs = {
  'expo-speech': speechStub,
  'react-native': {
    Platform: { OS: 'android', select: (o) => o.android ?? o.default },
    InteractionManager: { runAfterInteractions: (cb) => { cb?.(); return { cancel: () => {} } ; } },
    NativeModules: {},
    AppState: { addEventListener: () => ({ remove: () => {} }), currentState: 'active' },
  },
  '@react-native-async-storage/async-storage': {
    default: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} },
  },
};

// Los .m4a los resuelve Metro en la app: `require('...m4a')` devuelve un número
// opaco. Aquí se devuelve ese número y se recuerda de qué fichero venía, que es
// lo único que hace falta para saber QUÉ locución se reprodujo.
let assetSeq = 0;
const assetIds = new Map();

// `__DEV__` lo inyecta Metro en la app; en Node hay que declararlo.
global.__DEV__ = false;

const realLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(stubs, request)) return stubs[request];
  // La telemetría arrastra el cifrado y, por él, componentes de interfaz que no
  // pintan nada aquí. valeriaVoice solo le pide `trackAsrMode`, que no toca la
  // locución: se sustituye entero y la cadena se queda en lo que se prueba.
  if (/valeriaTelemetry$/.test(request)) return { trackAsrMode: () => {} };
  if (request.endsWith('.m4a')) {
    const n = ++assetSeq;
    assetIds.set(n, path.basename(request, '.m4a'));
    return n;
  }
  // Módulos nativos opcionales: el código ya está escrito para vivir sin ellos.
  if (/^expo-(audio|crypto|speech-recognition|av)$/.test(request)) throw new Error('stub: sin módulo nativo');
  if (/^@react-native-firebase\//.test(request)) throw new Error('stub: sin firebase');
  try {
    return realLoad(request, parent, isMain);
  } catch (e) {
    // El código compilado vive en un temporal, así que los paquetes de verdad
    // (react, expo-*) hay que resolverlos desde el repo.
    if (e.code !== 'MODULE_NOT_FOUND' || request.startsWith('.')) throw e;
    return realLoad(require.resolve(request, { paths: [ROOT] }), parent, isMain);
  }
};

// --- Compilación ------------------------------------------------------------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-lua-voice-'));
let luaSpeech; let locale; let voice; let playback; let VOICE_ASSETS; let corpus;
try {
  execSync([
    'npx tsc',
    JSON.stringify(path.join(ROOT, 'src', 'AventurasLua', 'luaSpeech.ts')),
    JSON.stringify(path.join(ROOT, 'src', 'AventurasLua', 'Catalog', 'luaVoiceLines.ts')),
    '--module commonjs', '--target es2020', '--moduleResolution node',
    '--esModuleInterop', '--skipLibCheck', '--resolveJsonModule', '--jsx', 'react',
    '--outDir', JSON.stringify(tmp),
  ].join(' '), { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('✖ no compila la ruta de locución de Aventuras con Lúa (mira el error de tsc)');
  process.exit(1);
}
try {
  luaSpeech = require(path.join(tmp, 'AventurasLua', 'luaSpeech.js'));
  locale = require(path.join(tmp, 'valeriaLocale.js'));
  voice = require(path.join(tmp, 'valeriaVoice.js'));
  playback = require(path.join(tmp, 'valeriaVoicePlayback.js'));
  VOICE_ASSETS = require(path.join(tmp, 'valeriaVoiceAssets.js')).VOICE_ASSETS;
  corpus = require(path.join(tmp, 'valeriaVoiceCorpus.js'));
  const lines = require(path.join(tmp, 'AventurasLua', 'Catalog', 'luaVoiceLines.js'));
  var LUA_LINES = lines.enumerateLuaAdventureSpeech();
} catch (e) {
  console.error('✖ no se puede cargar la ruta de locución con los módulos nativos sustituidos:');
  console.error('   ' + e.message);
  process.exit(1);
}

// El reproductor de assets: se espía en vez de sonar. Devuelve true, que es lo
// que hace el real cuando expo-audio existe y el asset se reproduce.
playback.playVoiceAsset = (source, opts) => {
  spy.assets.push(assetIds.get(source) ?? String(source));
  opts?.onDone?.();
  return true;
};
playback.stopVoiceAsset = () => {};

console.log('Aventuras con Lúa · en qué lengua suena de verdad\n');

// Espera al catálogo de voces: valeriaVoice lo pide al importarse.
const settle = () => new Promise((r) => setTimeout(r, 60));
const reset = () => { spy.spoken = []; spy.assets = []; };

// Ponerse en una sesión de esa variedad, como la app al arrancar: la voz del
// sistema se puntúa CONTRA la variedad activa (valeriaVoice.scoreVoice), así que
// sin re-escanear el catálogo la prueba se haría con la voz castellana ya
// elegida y no vería el fallo que persigue.
const enterSession = async (loc) => {
  await locale.setLocale(loc);
  await voice.refreshVoiceCatalog();
};

// Una locución REAL del módulo, no un texto inventado: si el catálogo cambia,
// esto sigue apuntando a algo que la app dice de verdad.
const SAMPLE = LUA_LINES.find((l) => l.source.startsWith('lua/eval/'))?.text;
if (!SAMPLE) { console.error('✖ el enumerador de locuciones del módulo no devuelve nada'); process.exit(1); }
const SAMPLE_ES_ID = corpus.voiceCorpusId('child', SAMPLE, 'es');

const FOREIGN = [
  ['gl', 'gl-es-x-gla-local'],
  ['eu', 'eu-es-x-eua-local'],
  ['ca', 'ca-es-x-caa-local'],
  ['en-US', 'en-us-x-tpf-local'],
];

(async () => {
  await settle();
  await voice.refreshVoiceCatalog();

  // --- 1. La locución sale por el asset castellano ---------------------------
  for (const [loc] of FOREIGN) {
    await enterSession(loc);
    reset();
    luaSpeech.speakLuaToChild(SAMPLE);
    if (spy.assets.length !== 1) {
      fail(`${loc}: la locución no salió por el asset neuronal castellano `
        + `(assets: ${spy.assets.length}, expo-speech: ${spy.spoken.length}). `
        + 'El texto es castellano y su audio de Sharvard está horneado: tiene que sonar con él.');
    } else if (spy.assets[0] !== SAMPLE_ES_ID) {
      fail(`${loc}: sonó el asset «${spy.assets[0]}» y el del corpus castellano es «${SAMPLE_ES_ID}»`);
    }
  }
  if (!fails.length) ok(`gl · eu · ca · en-US locutan el módulo con el asset castellano (${SAMPLE_ES_ID})`);

  // --- 2. Y si el asset faltara, la voz de respaldo es CASTELLANA ------------
  // Se vacía el mapa a propósito: es el camino que se recorre cuando un texto
  // se retoca y su id deja de resolver, que es como el fallo llegó a producción.
  const saved = { ...VOICE_ASSETS };
  for (const k of Object.keys(VOICE_ASSETS)) delete VOICE_ASSETS[k];

  for (const [loc, sessionVoice] of FOREIGN) {
    await enterSession(loc);
    reset();
    luaSpeech.speakLuaToChild(SAMPLE);
    const said = spy.spoken[0];
    if (!said) { fail(`${loc}: sin asset no se locutó nada`); continue; }
    if (said.language !== 'es-ES') {
      fail(`${loc}: el respaldo pidió «${said.language}» y el texto es castellano`);
    }
    if (said.voice === sessionVoice) {
      fail(`${loc}: el respaldo usó la voz de la sesión («${sessionVoice}») sobre texto castellano. `
        + 'En Android `voice` manda sobre `language`: es el fallo que se oía, el acento de la '
        + 'sesión con las palabras de otra lengua.');
    }
    if (said.voice && said.voice !== 'es-es-x-eed-local') {
      fail(`${loc}: el respaldo fijó la voz «${said.voice}», que no es castellana`);
    }
  }
  if (!fails.some((m) => /respaldo/.test(m))) {
    ok('sin asset, el respaldo del sistema es voz castellana y `es-ES` en las cuatro variedades');
  }

  Object.assign(VOICE_ASSETS, saved);

  // --- 3. Castellano y dominicano, intactos ---------------------------------
  await enterSession('es');
  reset();
  luaSpeech.speakLuaToChild(SAMPLE);
  if (spy.assets[0] !== SAMPLE_ES_ID) fail('es: dejó de sonar con su propio asset de Sharvard');

  await enterSession('es-DO');
  reset();
  luaSpeech.speakLuaToChild(SAMPLE);
  // es-DO no pregenera: tiene que ir al motor con voz latina, como siempre.
  if (spy.assets.length) fail('es-DO: reprodujo un asset peninsular; su variedad usa la voz del sistema');
  if (!spy.spoken.length) fail('es-DO: no locutó nada');
  if (!fails.some((m) => /^es/.test(m))) ok('es sigue con Sharvard y es-DO sigue con la voz latina del sistema');

  fs.rmSync(tmp, { recursive: true, force: true });
  if (fails.length) {
    console.error(`\n✖ Voz de Aventuras con Lúa: ${fails.length} ${fails.length === 1 ? 'problema' : 'problemas'}`);
    for (const m of fails) console.error('   · ' + m);
    process.exit(1);
  }
  console.log('\n✓ Aventuras con Lúa suena en castellano de verdad, no solo con letra castellana.');
})();

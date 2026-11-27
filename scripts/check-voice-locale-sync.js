#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate P1.2 / P1.3 / P1.5: sincronización de voz con la variedad,
 * límites de tono/velocidad y contador local de voz
 *   node scripts/check-voice-locale-sync.js
 * ========================================================================== */
const Module = require('module');
const path = require('path');
const fs = require('fs');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
globalThis.__DEV__ = false;
const disk = {};
const spokenCalls = [];

const CATALOG = [
  { identifier: 'es-es-x-eed-local', name: 'Google es-ES', language: 'es-ES', quality: 'Enhanced' },
  { identifier: 'es-us-x-sfb-local', name: 'Google es-US', language: 'es-US', quality: 'Enhanced' },
  { identifier: 'en-us-x-tpf-local', name: 'Google en-US', language: 'en-US', quality: 'Enhanced' },
  { identifier: 'gl-es-x-celtia-local', name: 'Celtia gl-ES', language: 'gl-ES', quality: 'Enhanced' },
];

const STUBS = {
  'react-native': { Platform: { OS: 'android' }, InteractionManager: { runAfterInteractions: (f) => f() } },
  'expo-speech': {
    VoiceQuality: { Enhanced: 'Enhanced', Default: 'Default' },
    getAvailableVoicesAsync: async () => CATALOG,
    speak: (text, opts) => { spokenCalls.push({ text, opts }); opts?.onDone?.(); },
    stop: () => {},
  },
  './valeriaVoicePlayback': {
    playVoiceAsset: () => false,
    stopVoiceAsset: () => {},
  },
  './valeriaVoiceAssets': {
    voiceAsset: () => undefined,
    voiceAssetDuration: () => undefined,
    voiceAssetIds: () => [],
    voiceAssetLoaders: () => ({}),
  },
  './valeriaTelemetry': {
    trackAsrMode: () => {},
  },
  './ValeriaProPin': {
    sha256: async (s) => require('crypto').createHash('sha256').update(s).digest('hex'),
  },
  '@react-native-async-storage/async-storage': {
    default: {
      getItem: async (k) => (k in disk ? disk[k] : null),
      setItem: async (k, v) => { disk[k] = String(v); },
      removeItem: async (k) => { delete disk[k]; },
    },
  },
};

const cache = new Map();
const origLoad = Module._load;
Module._load = function (req, parent) {
  if (req in STUBS) return STUBS[req];
  if (req.startsWith('.') && parent && parent.filename && parent.filename.startsWith(path.join(ROOT, 'src'))) {
    const resolved = path.resolve(path.dirname(parent.filename), req) + '.ts';
    if (fs.existsSync(resolved)) return loadTs(resolved);
  }
  return origLoad.apply(this, arguments);
};

function loadTs(filePath) {
  if (cache.has(filePath)) return cache.get(filePath).exports;
  const src = fs.readFileSync(filePath, 'utf8');
  const js = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  const mod = { exports: {} };
  cache.set(filePath, mod);
  const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', js);
  fn(mod.exports, (r) => Module._load(r, { filename: filePath }), mod, filePath, path.dirname(filePath));
  return mod.exports;
}

const assert = (cond, msg) => {
  if (!cond) {
    console.error('✖ ' + msg);
    process.exit(1);
  }
};

(async () => {
  const locale = loadTs(path.join(ROOT, 'src', 'valeriaLocale.ts'));
  const voice = loadTs(path.join(ROOT, 'src', 'valeriaVoice.ts'));
  const stats = loadTs(path.join(ROOT, 'src', 'valeriaVoiceStats.ts'));

  await locale.localeReady;
  await new Promise((r) => setTimeout(r, 30));

  const stEs = voice.getVoiceStatus();
  assert(stEs.language === 'es-ES', `Esperado es-ES inicialmente, obtenido ${stEs.language}`);

  // P1.3: cambiar a en-US mediante setLocale debe actualizar la voz elegida sin llamar a refreshVoiceCatalog.
  await locale.setLocale('en-US');
  await new Promise((r) => setTimeout(r, 50));
  const stEn = voice.getVoiceStatus();
  assert(stEn.language === 'en-US', `Tras setLocale('en-US'), la voz elegida debe ser inglesa; fue ${stEn.language}`);

  spokenCalls.length = 0;
  voice.speakToChild('Hello friend');
  await new Promise((r) => setTimeout(r, 20));
  assert(spokenCalls.length === 1, 'speakToChild debe haber invocado Speech.speak');
  assert(spokenCalls[0].opts.voice === 'en-us-x-tpf-local', `Voz en-US esperada en Speech.speak, fue ${spokenCalls[0].opts.voice}`);
  assert(spokenCalls[0].opts.pitch <= 1.05, `Pitch de speakToChild supera 1.05: ${spokenCalls[0].opts.pitch}`);
  assert(spokenCalls[0].opts.rate >= 0.85 && spokenCalls[0].opts.rate <= 0.95, `Rate de speakToChild fuera de [0.85, 0.95]: ${spokenCalls[0].opts.rate}`);

  // P1.2: speakWordSlow también cumple el tope de tono y rango de velocidad.
  spokenCalls.length = 0;
  voice.speakWordSlow('seat');
  await new Promise((r) => setTimeout(r, 20));
  assert(spokenCalls.length === 1, 'speakWordSlow debe haber invocado Speech.speak');
  assert(spokenCalls[0].opts.pitch <= 1.05, `Pitch de speakWordSlow supera 1.05: ${spokenCalls[0].opts.pitch}`);
  assert(spokenCalls[0].opts.rate >= 0.85 && spokenCalls[0].opts.rate <= 0.95, `Rate de speakWordSlow fuera de [0.85, 0.95]: ${spokenCalls[0].opts.rate}`);

  // P1.3: cambiar a gl actualiza inmediatamente a voz gallega.
  await locale.setLocale('gl');
  await new Promise((r) => setTimeout(r, 50));
  const stGl = voice.getVoiceStatus();
  assert(stGl.language === 'gl-ES', `Tras setLocale('gl'), la voz elegida debe ser gallega; fue ${stGl.language}`);

  // P1.5: contador local registró las caídas sin asset en en-US y gl.
  const enStats = stats.getVoiceWeekStats('en-US');
  assert(enStats.reasons.noAsset === 2 && enStats.total === 2, `Contador en-US incorrecto: ${JSON.stringify(enStats)}`);
  stats.recordVoicePackaged('es');
  const esStats = stats.getVoiceWeekStats('es');
  assert(esStats.packaged === 1 && esStats.packagedPct === 100, `Contador es incorrecto: ${JSON.stringify(esStats)}`);

  console.log('✓ Sincronización de voz con variedad (P1.3), límites de tono/velocidad (P1.2) y contador (P1.5) en verde.');
})();

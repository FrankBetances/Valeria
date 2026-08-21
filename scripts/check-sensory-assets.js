#!/usr/bin/env node
/* ============================================================================
 * Gate · el módulo sensorial suena, y suena a lo que dice la ficha
 *   node scripts/check-sensory-assets.js            comprueba
 *   node scripts/check-sensory-assets.js --report   imprime las medidas
 *
 * Por qué existe. La primera versión del módulo (rama `brujula`) tenía catálogo,
 * vúmetro, "Sonido en reproducción" y CERO audio: `audioAssetKey` estaba
 * declarado en los once estímulos y no lo consumía nadie. Un typecheck no ve
 * eso, y una captura tampoco: el silencio no sale en las capturas. Esto sí.
 *
 * Comprueba, sobre los WAV que van dentro del APK:
 *   1 · Cada audioAssetKey del catálogo tiene fichero, y no sobra ninguno.
 *   2 · Formato: PCM 16 bit, mono, 16 kHz (lo que espera expo-audio en gama baja).
 *   3 · Sonoridad: RMS en la banda acordada. Un fichero mudo o saturado cae aquí.
 *   4 · Bucle sin costura. Medido como el salto de la costura COMPARADO con el
 *       salto típico dentro del propio fichero (percentil 99), no en valor
 *       absoluto: en un chorro de aire dos muestras seguidas ya se diferencian
 *       en 0,2 sin que haya ningún clic, y un umbral fijo suspendía al secador
 *       por sonar a secador. Un clic en exposición es un transitorio nuevo,
 *       justo lo que dispara al niño que estamos tratando.
 *   5 · Identidad espectral: el centroide y el reparto grave/medio/agudo caen
 *       donde tiene que caer cada sonido. Es lo que separa "hay un fichero" de
 *       "hay una aspiradora": un ruido blanco cualquiera pasaría 1-4 y no 5.
 *   6 · La frecuencia dominante declarada en la ficha (`baseFrequencyHz`) tiene
 *       energía de verdad en el fichero. Es lo que impide que el campo se
 *       quede de adorno, que es como estaba antes: declarado y sin consumir.
 *
 * Lo que este gate NO puede comprobar, y conviene decirlo: si a un oído humano
 * le suena a aspiradora. Eso lo dice Frank escuchando el WAV, y no hay script
 * que lo sustituya.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const AUDIO = path.join(ROOT, 'assets', 'audio');
const REPORT = process.argv.includes('--report');

// --------------------------------------------------------------- lectura WAV
function readWav(file) {
  const buf = fs.readFileSync(file);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('no es un WAV RIFF');
  }
  let pos = 12, fmt = null, data = null;
  while (pos + 8 <= buf.length) {
    const id = buf.toString('ascii', pos, pos + 4);
    const size = buf.readUInt32LE(pos + 4);
    if (id === 'fmt ') {
      fmt = {
        format: buf.readUInt16LE(pos + 8),
        channels: buf.readUInt16LE(pos + 10),
        sampleRate: buf.readUInt32LE(pos + 12),
        bits: buf.readUInt16LE(pos + 22),
      };
    } else if (id === 'data') {
      data = buf.subarray(pos + 8, pos + 8 + size);
    }
    pos += 8 + size + (size % 2);
  }
  if (!fmt || !data) throw new Error('WAV sin fmt o sin data');
  const n = Math.floor(data.length / 2);
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) s[i] = data.readInt16LE(i * 2) / 32768;
  return { fmt, samples: s };
}

/** Energía en una frecuencia por Goertzel. Sin dependencias y suficiente. */
function goertzel(samples, freq, sr) {
  const w = (2 * Math.PI * freq) / sr;
  const coeff = 2 * Math.cos(w);
  let s0 = 0, s1 = 0, s2 = 0;
  for (let i = 0; i < samples.length; i++) {
    s0 = samples[i] + coeff * s1 - s2;
    s2 = s1; s1 = s0;
  }
  return Math.sqrt(s1 * s1 + s2 * s2 - coeff * s1 * s2) / samples.length;
}

/** 24 bandas log entre 50 Hz y 7 kHz, medidas sobre 4 ventanas de 0,25 s. */
function spectrum(samples, sr) {
  const bands = [];
  for (let k = 0; k < 24; k++) bands.push(50 * Math.pow(7000 / 50, k / 23));
  const win = Math.floor(sr * 0.25);
  const offsets = [0, 1, 2, 3].map((i) => Math.floor((samples.length - win) * (i / 3)));
  const mag = bands.map((f) => {
    let acc = 0;
    for (const off of offsets) acc += goertzel(samples.subarray(off, off + win), f, sr);
    return acc / offsets.length;
  });
  const total = mag.reduce((a, b) => a + b, 0) || 1e-12;
  const centroid = bands.reduce((a, f, i) => a + f * mag[i], 0) / total;
  const bandEnergy = (lo, hi) =>
    mag.reduce((a, m, i) => (bands[i] >= lo && bands[i] < hi ? a + m : a), 0) / total;
  return {
    centroid,
    low: bandEnergy(0, 250),
    mid: bandEnergy(250, 2000),
    high: bandEnergy(2000, 8000),
  };
}

/** Energía en la frecuencia declarada, en veces la mediana de las 24 bandas. */
function baseEnergyRatio(samples, sr, base) {
  const win = Math.floor(sr * 0.5);
  const seg = samples.subarray(0, Math.min(win, samples.length));
  const at = goertzel(seg, base, sr);
  const mags = [];
  for (let k = 0; k < 24; k++) mags.push(goertzel(seg, 50 * Math.pow(7000 / 50, k / 23), sr));
  mags.sort((a, b) => a - b);
  const median = mags[Math.floor(mags.length / 2)] || 1e-12;
  return at / median;
}

/**
 * Continuidad de la costura, en dos medidas relativas al propio fichero:
 *   · `ratio`    salto de la costura / salto típico (p99) entre muestras.
 *   · `envRatio` RMS de los 10 ms finales / RMS de los 10 ms iniciales,
 *                siempre ≥ 1. Un fundido mal hecho se delata aquí aunque las
 *                dos muestras de la unión casen por casualidad.
 */
function seamJump(s) {
  const deltas = new Float64Array(s.length - 1);
  for (let i = 0; i < s.length - 1; i++) deltas[i] = Math.abs(s[i + 1] - s[i]);
  const sorted = Float64Array.from(deltas).sort();
  const p99 = sorted[Math.floor(sorted.length * 0.99)] || 1e-9;
  const seam = Math.abs(s[0] - s[s.length - 1]);
  const win = Math.floor(0.01 * 16000);
  const rmsOf = (from, to) => {
    let acc = 0;
    for (let i = from; i < to; i++) acc += s[i] * s[i];
    return Math.sqrt(acc / Math.max(1, to - from)) || 1e-9;
  };
  const head = rmsOf(0, win);
  const tail = rmsOf(s.length - win, s.length);
  return { ratio: seam / p99, envRatio: Math.max(head / tail, tail / head) };
}

// ------------------------------------------------------- catálogo compilado
// El catálogo es TypeScript: se compila de verdad, igual que hacen los demás
// gates de contenido. Leerlo con una expresión regular sería adivinar.
function loadCatalog() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-sensory-'));
  execSync(
    ['npx tsc', JSON.stringify(path.join(ROOT, 'src', 'ValeriaSensory', 'sensoryCatalog.ts')),
      '--module commonjs --target es2020 --moduleResolution node --esModuleInterop --skipLibCheck',
      '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );
  const out = path.join(tmp, 'ValeriaSensory', 'sensoryCatalog.js');
  return require(fs.existsSync(out) ? out : path.join(tmp, 'sensoryCatalog.js'));
}

// Identidad esperada de cada estímulo. Los márgenes son anchos a propósito: el
// gate persigue "esto ya no es el sonido que era", no décimas.
const EXPECTED = {
  sensory_vacuum_loop:      { centroid: [500, 1600],  low: [0.30, 0.70], high: [0.03, 0.25] },
  sensory_blender_loop:     { centroid: [300, 900],   low: [0.45, 0.80], high: [0.00, 0.15] },
  sensory_hairdryer_loop:   { centroid: [1000, 2400], low: [0.15, 0.50], high: [0.15, 0.45] },
  sensory_hand_dryer_loop:  { centroid: [1000, 2400], low: [0.18, 0.52], high: [0.14, 0.45] },
  sensory_thunder_loop:     { centroid: [120, 450],   low: [0.70, 1.00], high: [0.00, 0.08] },
  sensory_siren_loop:       { centroid: [600, 1400],  low: [0.03, 0.30], high: [0.01, 0.25] },
  sensory_fireworks_loop:   { centroid: [120, 400],   low: [0.70, 1.00], high: [0.00, 0.08] },
  sensory_school_bell_loop: { centroid: [550, 1400],  low: [0.15, 0.50], high: [0.02, 0.25] },
  sensory_classroom_loop:   { centroid: [330, 800],   low: [0.22, 0.58], high: [0.00, 0.12] },
  sensory_mall_loop:        { centroid: [250, 650],   low: [0.35, 0.70], high: [0.00, 0.12] },
  sensory_street_loop:      { centroid: [170, 450],   low: [0.60, 0.92], high: [0.00, 0.10] },
};

const BASE_ENERGY_MIN = 0.8;    // energía en la base / mediana de las bandas
const RMS_RANGE = [-27, -17];   // dBFS
const PEAK_MAX = -5.5;          // dBFS (el generador deja el techo en -6)
const LOOP_JUMP_RATIO = 3.5;    // veces el salto típico del propio fichero
const LOOP_ENV_RATIO = 2.5;     // desajuste de envolvente admisible en la costura

let fallos = 0;
const fallo = (m) => { fallos += 1; console.error('  ✖ ' + m); };

const catalog = loadCatalog();
const claves = catalog.SENSORY_TRIGGER_LIST.map((s) => s.audioAssetKey);
const enDisco = fs.readdirSync(AUDIO).filter((f) => f.startsWith('sensory_') && f.endsWith('.wav'));

for (const f of enDisco) {
  if (!claves.includes(f.replace(/\.wav$/, ''))) {
    fallo(`assets/audio/${f}: sobra, ningún estímulo del catálogo lo pide.`);
  }
}

for (const st of catalog.SENSORY_TRIGGER_LIST) {
  const file = path.join(AUDIO, `${st.audioAssetKey}.wav`);
  if (!fs.existsSync(file)) {
    fallo(`${st.id}: no existe assets/audio/${st.audioAssetKey}.wav · corre node scripts/generate-sensory-assets.js`);
    continue;
  }
  let wav;
  try {
    wav = readWav(file);
  } catch (e) {
    fallo(`${st.id}: ${e.message}`);
    continue;
  }
  const { fmt, samples } = wav;
  if (fmt.format !== 1 || fmt.bits !== 16 || fmt.channels !== 1 || fmt.sampleRate !== 16000) {
    fallo(`${st.id}: formato ${fmt.channels}ch/${fmt.sampleRate}Hz/${fmt.bits}bit · se espera mono 16 kHz 16 bit PCM`);
  }

  let peak = 0, sq = 0;
  for (let i = 0; i < samples.length; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
    sq += samples[i] * samples[i];
  }
  const rmsDb = 20 * Math.log10(Math.sqrt(sq / samples.length) || 1e-9);
  const peakDb = 20 * Math.log10(peak || 1e-9);
  const jump = seamJump(samples);
  const sp = spectrum(samples, fmt.sampleRate);
  const baseRatio = st.baseFrequencyHz
    ? baseEnergyRatio(samples, fmt.sampleRate, st.baseFrequencyHz)
    : null;

  if (REPORT) {
    console.log(
      `${st.audioAssetKey.padEnd(26)} ${(samples.length / fmt.sampleRate).toFixed(1)}s ` +
      `RMS ${rmsDb.toFixed(1)} pico ${peakDb.toFixed(1)} costura ×${jump.ratio.toFixed(1)}/×${jump.envRatio.toFixed(1)} ` +
      `centroide ${sp.centroid.toFixed(0)} Hz  grave ${sp.low.toFixed(2)} medio ${sp.mid.toFixed(2)} agudo ${sp.high.toFixed(2)}  ` +
      `base ${st.baseFrequencyHz ?? '—'} Hz ×${baseRatio === null ? '—' : baseRatio.toFixed(1)}`,
    );
    continue;
  }

  if (rmsDb < RMS_RANGE[0] || rmsDb > RMS_RANGE[1]) {
    fallo(`${st.id}: RMS ${rmsDb.toFixed(1)} dBFS fuera de [${RMS_RANGE}] · el nivel del adulto dejaría de significar lo mismo entre estímulos`);
  }
  if (peakDb > PEAK_MAX) {
    fallo(`${st.id}: pico ${peakDb.toFixed(1)} dBFS sin headroom · riesgo de saturación en el mezclador de Android`);
  }
  if (jump.ratio > LOOP_JUMP_RATIO || jump.envRatio > LOOP_ENV_RATIO) {
    fallo(`${st.id}: costura del bucle ×${jump.ratio.toFixed(1)} (envolvente ×${jump.envRatio.toFixed(1)}) · se oiría un clic en cada vuelta`);
  }
  if (baseRatio !== null && baseRatio < BASE_ENERGY_MIN) {
    fallo(`${st.id}: la ficha declara ${st.baseFrequencyHz} Hz y ahí no hay energía (×${baseRatio.toFixed(1)}) · el campo dejaría de describir el fichero`);
  }
  const exp = EXPECTED[st.audioAssetKey];
  if (!exp) {
    fallo(`${st.audioAssetKey}: sin identidad espectral esperada en este gate · añádela al añadir el estímulo`);
    continue;
  }
  if (sp.centroid < exp.centroid[0] || sp.centroid > exp.centroid[1]) {
    fallo(`${st.id}: centroide ${sp.centroid.toFixed(0)} Hz fuera de [${exp.centroid}] · ya no suena a lo que dice la ficha`);
  }
  if (sp.low < exp.low[0] || sp.low > exp.low[1]) {
    fallo(`${st.id}: energía grave ${sp.low.toFixed(2)} fuera de [${exp.low}]`);
  }
  if (sp.high < exp.high[0] || sp.high > exp.high[1]) {
    fallo(`${st.id}: energía aguda ${sp.high.toFixed(2)} fuera de [${exp.high}]`);
  }
}

if (REPORT) process.exit(0);

if (fallos) {
  console.error(`\ncheck-sensory-assets: ${fallos} fallo(s).`);
  process.exit(1);
}
console.log(`check-sensory-assets OK · ${catalog.SENSORY_TRIGGER_LIST.length} estímulos con audio real y verificado.`);

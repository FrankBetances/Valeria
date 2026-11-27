#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate P2.8: calidad y uniformidad de assets de voz pregenerados
 *   node scripts/check-voice-assets-quality.js
 *
 * Comprueba sobre cada manifiesto voice-assets-manifest.<lang>.json:
 *   1. Ningún fichero carece de su valor `lufs` numérico finito.
 *   2. La dispersión de LUFS (max - min) por idioma es <= 1.5 LU.
 *   3. El `paramsHash` es igual en todo el idioma (manifiesto y cada entrada).
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VOICE_DIR = path.join(ROOT, 'assets', 'voice');
const MAX_SPREAD_LU = 1.5;
const MAX_DEV_LU = 1.0;
const MAX_GR_DB = 3.0;

// Guard against temp files left inside assets/voice
if (fs.existsSync(VOICE_DIR)) {
  const strayTemps = fs.readdirSync(VOICE_DIR).filter((f) => f.startsWith('_') || f.includes('.tmp.'));
  if (strayTemps.length > 0) {
    console.error(`✖ Temporales residuales en assets/voice: ${strayTemps.slice(0, 10).join(', ')}`);
    process.exit(1);
  }
}

const corpusPath = path.join(ROOT, 'voice-corpus.json');
const corpusById = new Map();
if (fs.existsSync(corpusPath)) {
  for (const e of JSON.parse(fs.readFileSync(corpusPath, 'utf8')).corpus || []) {
    corpusById.set(e.id, e);
  }
}

const manifests = fs.readdirSync(ROOT)
  .filter((f) => /^voice-assets-manifest\.[a-zA-Z-]+\.json$/.test(f))
  .sort();

if (!manifests.length) {
  console.error('✖ No se encontró ningún voice-assets-manifest.*.json.');
  process.exit(1);
}

let failures = 0;
const fail = (msg) => { failures += 1; console.error('  ✖ ' + msg); };

for (const name of manifests) {
  const full = path.join(ROOT, name);
  const m = JSON.parse(fs.readFileSync(full, 'utf8'));
  const lang = m.lang || name;
  const files = Array.isArray(m.files) ? m.files : [];
  if (!files.length) {
    fail(`${name}: el manifiesto no tiene entradas.`);
    continue;
  }

  const rootHash = typeof m.paramsHash === 'string' && m.paramsHash.length > 0 ? m.paramsHash : null;
  if (!rootHash) {
    fail(`${name}: falta paramsHash en la raíz del manifiesto.`);
  }
  const targetLufs = typeof m.targetLufs === 'number' && Number.isFinite(m.targetLufs) ? m.targetLufs : null;
  if (targetLufs === null) {
    fail(`${name}: falta targetLufs numérico en la raíz del manifiesto.`);
  }

  let minLufs = Infinity;
  let maxLufs = -Infinity;
  let missingLufs = 0;
  const outOfWindow = [];
  const hashes = new Set();
  let mismatchHash = 0;
  let missingNormType = 0;
  const dynamicFiles = [];
  const exceptedDynamic = [];
  let missingGr = 0;
  const highGrFiles = [];
  const reducedLinear = [];
  const ratios = [];

  // Excepciones explícitas auditadas: sin relajar la regla general `normType === 'linear'`.
  const DYNAMIC_EXCEPTIONS = {
    child_729e1a96_6: 'Palabra aislada "Pimpón" (0.50 s, LRA=0.00): FFmpeg loudnorm etiqueta dynamic pese a aplicar ganancia lineal pura (-4.41 dB, -17.01 LUFS, TP -4.45 dBTP).',
  };

  // Audios conservados porque su síntesis nueva falló en CI (R38): se listan, no
  // cuentan para las reglas de masterizado y no pueden pasar del 3 % del idioma.
  const kept = files.filter((f) => f.keptPrevious);
  for (const f of kept) console.log(`  ℹ conservado (${lang}): ${f.id}: ${f.keptPrevious}`);
  if (kept.length > Math.ceil(files.length * 0.03)) fail(`${lang}: ${kept.length} audios conservados de la versión anterior (máximo 3 %).`);
  // La mediana de TODOS los audios (también los de ganancia reducida) va a ±1 LU
  // del objetivo, y ninguno baja de objetivo - 4 LU: así un idioma no puede quedar
  // más bajo que los demás escondido en la lista de «ganancia reducida» (R33, R38).
  {
    const all = files.filter((x) => !x.keptPrevious && typeof x.lufs === 'number').map((x) => x.lufs).sort((a, b) => a - b);
    if (all.length) {
      const med = all[Math.floor(all.length / 2)];
      if (Math.abs(med - targetLufs) > 1) fail(`${lang} (${name}): mediana de LUFS ${med} a más de 1 LU del objetivo ${targetLufs}.`);
      const low = files.filter((x) => !x.keptPrevious && typeof x.lufs === 'number' && x.lufs < targetLufs - 4).map((x) => `${x.id}(${x.lufs})`);
      if (low.length) fail(`${lang} (${name}): ${low.length} audios por debajo de ${targetLufs - 4} LUFS: ${low.slice(0, 5).join(', ')}`);
    }
  }
  for (const f of files.filter((x) => !x.keptPrevious)) {
    if (f.paramsHash) hashes.add(f.paramsHash);
    if (!f.paramsHash || (rootHash && f.paramsHash !== rootHash)) {
      mismatchHash += 1;
    }
    if (typeof f.lufs !== 'number' || !Number.isFinite(f.lufs)) {
      missingLufs += 1;
    } else {
      const localTarget = typeof f.reducedLinearTarget === 'number' ? f.reducedLinearTarget : targetLufs;
      if (typeof f.reducedLinearTarget === 'number') {
        reducedLinear.push(`${f.id}(${f.lufs})`);
      } else {
        if (f.lufs < minLufs) minLufs = f.lufs;
        if (f.lufs > maxLufs) maxLufs = f.lufs;
      }
      if (localTarget !== null && Math.abs(f.lufs - localTarget) > MAX_DEV_LU) {
        outOfWindow.push(`${f.id}(${f.lufs} vs ${localTarget})`);
      }
    }
    if (typeof f.normType !== 'string' || !f.normType) {
      missingNormType += 1;
    } else if (f.normType !== 'linear') {
      if (Object.prototype.hasOwnProperty.call(DYNAMIC_EXCEPTIONS, f.id)) {
        exceptedDynamic.push(`${f.id}: ${DYNAMIC_EXCEPTIONS[f.id]}`);
      } else {
        dynamicFiles.push(`${f.id}(${f.normType})`);
      }
    }
    const compGr = f.compressorGainReductionDb;
    const limGr = typeof f.limiterGainReductionDb === 'number' ? f.limiterGainReductionDb : f.gainReductionDb;
    if (typeof limGr !== 'number' || !Number.isFinite(limGr) || (typeof f.limiterGainReductionDb === 'number' && (typeof compGr !== 'number' || !Number.isFinite(compGr)))) {
      missingGr += 1;
    } else if (limGr > MAX_GR_DB) {
      highGrFiles.push(`${f.id}(${limGr}dB)`);
    }
    const c = corpusById.get(f.id);
    if (c && typeof c.text === 'string' && c.text.length > 0 && typeof f.seconds === 'number') {
      ratios.push({ id: f.id, ratio: f.seconds / c.text.length, sec: f.seconds, len: c.text.length, text: c.text });
    }
  }

  for (const ex of exceptedDynamic) {
    console.log(`  ℹ excepción documentada (${lang}): ${ex}`);
  }
  if (hashes.size > 1) {
    fail(`${lang} (${name}): hay ${hashes.size} paramsHash distintos en el mismo idioma (${Array.from(hashes).join(', ')}).`);
  }
  if (mismatchHash > 0) {
    fail(`${lang} (${name}): ${mismatchHash} de ${files.length} ficheros con \`paramsHash\` distinto de ${rootHash} o ausente.`);
  }
  if (missingLufs > 0) {
    fail(`${lang} (${name}): ${missingLufs} de ${files.length} ficheros sin campo numérico \`lufs\`.`);
  }
  if (missingNormType > 0) {
    fail(`${lang} (${name}): ${missingNormType} de ${files.length} ficheros sin campo \`normType\` de loudnorm.`);
  }
  if (dynamicFiles.length > 0) {
    fail(`${lang} (${name}): ${dynamicFiles.length} ficheros salieron con normalization_type!="linear": ${dynamicFiles.slice(0, 15).join(', ')}${dynamicFiles.length > 15 ? ' ...' : ''}`);
  }
  if (missingGr > 0) {
    fail(`${lang} (${name}): ${missingGr} de ${files.length} ficheros sin \`limiterGainReductionDb\`/\`compressorGainReductionDb\`.`);
  }
  if (highGrFiles.length > 0) {
    fail(`${lang} (${name}): ${highGrFiles.length} ficheros superan ${MAX_GR_DB} dB en el limitador: ${highGrFiles.slice(0, 15).join(', ')}`);
  }
  if (outOfWindow.length > 0) {
    fail(`${lang} (${name}): ${outOfWindow.length} ficheros fuera de ± ${MAX_DEV_LU} LU: ${outOfWindow.slice(0, 10).join(', ')}`);
  }
  if (missingLufs === 0) {
    const spread = Number.isFinite(minLufs) ? +(maxLufs - minLufs).toFixed(2) : 0;
    if (Number.isFinite(minLufs) && spread > MAX_SPREAD_LU) {
      fail(`${lang} (${name}): dispersión de LUFS = ${spread} LU (${minLufs}..${maxLufs}), supera el máximo de ${MAX_SPREAD_LU} LU.`);
    } else if (!outOfWindow.length && !mismatchHash && hashes.size <= 1 && !missingNormType && !dynamicFiles.length && !missingGr && !highGrFiles.length) {
      let ratioNote = '';
      if (ratios.length >= 20) {
        const sorted = [...ratios].sort((a, b) => a.ratio - b.ratio);
        const p1 = sorted[Math.floor(sorted.length * 0.01)].ratio;
        const p99 = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.99) - 1)].ratio;
        const extreme = sorted.filter((r) => r.ratio < p1 || r.ratio > p99);
        ratioNote = ` · seg/car [p1=${p1.toFixed(3)}, p99=${p99.toFixed(3)}, ext=${extreme.length}]`;
      }
      const lufsStr = Number.isFinite(minLufs) ? `${minLufs}..${maxLufs}` : 'solo-redLineal';
      console.log(`  ✓ ${lang}: ${files.length} ficheros · LUFS ${lufsStr} (obj ${targetLufs} ± ${MAX_DEV_LU} · disp ${spread} LU <= ${MAX_SPREAD_LU}) · norm=linear · GR<=${MAX_GR_DB}dB · redLineal=${reducedLinear.length} · paramsHash=${rootHash}${ratioNote}`);
    }
  }
}

if (failures > 0) {
  console.error(`\n✖ ${failures} problema(s) de calidad en los manifiestos de voz.`);
  process.exit(1);
}

console.log('\n✓ Todos los manifiestos de voz cumplen ventana simétrica, dispersión, normType=linear, GR<=3dB y paramsHash único.');

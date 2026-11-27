#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate P1.1: encadenamiento de locuciones sin setTimeout fijo
 *   node scripts/check-voice-chaining.js
 *
 * Falla si en algún `.tsx` de `src/` aparece un `setTimeout(` cuyo cuerpo
 * llama a `speak*` en las 6 líneas siguientes a otra llamada `speak*`.
 * Incluye una auto-prueba negativa obligatoria sobre un ejemplo malo sintético.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const SPEAK_RE = /\bspeak(?:ToChild|ToChildSeq|ToChildIn|ToChildSeqIn|WordSlow|WordSlowSeq|PhraseSlow|Clinical)?\s*\(/;
const TIMEOUT_RE = /\bsetTimeout\s*\(/g;

function walkTsx(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkTsx(full, out);
    else if (ent.isFile() && ent.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

// Extrae el argumento completo de `setTimeout(...)` respetando paréntesis.
function extractCallSpan(src, openParenIdx) {
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (let idx = openParenIdx; idx < src.length; idx++) {
    const ch = src[idx];
    if (esc) { esc = false; continue; }
    if (inStr) {
      if (ch === '\\') esc = true;
      else if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '\'' || ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === '(') depth += 1;
    else if (ch === ')') {
      depth -= 1;
      if (depth === 0) return src.slice(openParenIdx, idx + 1);
    }
  }
  return src.slice(openParenIdx);
}

function scanSource(content, fileLabel) {
  const lines = content.split(/\r?\n/);
  const lineOffsets = [0];
  for (let i = 0; i < lines.length; i++) {
    lineOffsets.push(lineOffsets[i] + lines[i].length + 1);
  }
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    if (!SPEAK_RE.test(lines[i])) continue;
    // No contar el `speak*` que ya está dentro de un callback `onDone` / `afterSpeak`.
    const linePrefix = lines.slice(Math.max(0, i - 3), i + 1).join('\n');
    if (/\b(?:onDone|onError|afterSpeak|runModel)\b/.test(linePrefix) && !/speakToChild\([^;]*$/.test(lines[i])) {
      continue;
    }
    const windowEnd = Math.min(lines.length, i + 7);
    for (let j = i + 1; j < windowEnd; j++) {
      TIMEOUT_RE.lastIndex = 0;
      let m;
      while ((m = TIMEOUT_RE.exec(lines[j])) !== null) {
        const openIdx = lineOffsets[j] + m.index + m[0].length - 1;
        const callSpan = extractCallSpan(content, openIdx);
        if (SPEAK_RE.test(callSpan)) {
          hits.push(`${fileLabel}:${j + 1} (tras ${fileLabel}:${i + 1})`);
        }
      }
    }
  }
  return hits;
}

// 1) Auto-prueba negativa: debe fallar con un fichero de ejemplo malo.
const BAD_EXAMPLE = [
  'export function BadSample() {',
  '  speakToChild(msg);',
  '  setTimeout(() => {',
  '    speakWordSlow(target);',
  '  }, 1600);',
  '}',
].join('\n');
const selfHits = scanSource(BAD_EXAMPLE, 'BAD_EXAMPLE.tsx');
if (selfHits.length === 0) {
  console.error('✖ Auto-prueba fallida: check-voice-chaining no detectó el ejemplo malo sintético.');
  process.exit(1);
}

// 2) Escaneo real de src/**/*.tsx
const files = walkTsx(SRC).sort();
const failures = [];
for (const file of files) {
  const rel = path.relative(ROOT, file);
  const hits = scanSource(fs.readFileSync(file, 'utf8'), rel);
  failures.push(...hits);
}

if (failures.length > 0) {
  console.error('✖ Se detectaron locuciones encadenadas con setTimeout fijo (usar onDone):');
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}

console.log(`✓ ${files.length} ficheros .tsx comprobados: sin setTimeout fijo tras speak* (auto-prueba negativa OK).`);

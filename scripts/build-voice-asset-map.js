#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Regenerador del mapa id → asset de voz (Fase 2 del plan ILENIA/Nós)
 *   node scripts/build-voice-asset-map.js
 *
 * Cruza voice-corpus.json con los ficheros reales de assets/voice/ y REESCRIBE
 * src/valeriaVoiceAssets.ts con un require() estático por locución (Metro no
 * admite requires dinámicos). Solo entran ids con fichero presente: una
 * locución sin audio simplemente seguirá cayendo a expo-speech.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CORPUS = path.join(ROOT, 'voice-corpus.json');
const ASSETS = path.join(ROOT, 'assets', 'voice');
const OUT = path.join(ROOT, 'src', 'valeriaVoiceAssets.ts');

if (!fs.existsSync(CORPUS)) {
  console.error('Falta voice-corpus.json — ejecuta antes: node scripts/export-voice-corpus.js');
  process.exit(1);
}
const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8')).corpus;
const files = new Set(fs.existsSync(ASSETS) ? fs.readdirSync(ASSETS).filter((f) => f.endsWith('.m4a')) : []);

const covered = corpus.filter((e) => files.has(`${e.id}.m4a`));
if (covered.length === 0) {
  console.error('assets/voice/ no tiene ningún .m4a del corpus: nada que mapear.');
  process.exit(1);
}

// Versión del lote: idiomas+voz de cada manifiesto presente + fecha.
const date = new Date().toISOString().slice(0, 10);
const tags = [];
for (const f of fs.readdirSync(ROOT).filter((n) => /^voice-assets-manifest\.[a-z]{2}\.json$/.test(n)).sort()) {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
    tags.push(`${m.lang}-${m.voice.split(' ')[0].toLowerCase()}`);
  } catch (e) { /* manifiesto ilegible: se omite */ }
}
const version = `${tags.join('+') || 'audio'}-${date}`;

const lines = covered
  .sort((a, b) => a.id.localeCompare(b.id))
  .map((e) => `  ${JSON.stringify(e.id)}: require('../assets/voice/${e.id}.m4a'),`);

fs.writeFileSync(OUT, `// ============================================================================
// Valeria+ · Mapa id → asset de voz neuronal — ARCHIVO GENERADO, NO EDITAR
// Regenerado por scripts/build-voice-asset-map.js (tubería de Fase 2,
// .github/workflows/voice-assets.yml). Cobertura: ${covered.length}/${corpus.length} locuciones
// del corpus; lo no cubierto cae a expo-speech en runtime.
// ============================================================================

// Versión del lote de audio empaquetado ('none' = sin audio pre-generado).
export const VOICE_ASSETS_VERSION = ${JSON.stringify(version)};

// id de corpus (valeriaVoiceCorpus.voiceCorpusId) → módulo de asset de Metro.
export const VOICE_ASSETS: Record<string, number> = {
${lines.join('\n')}
};
`);

console.log(`OK → ${OUT} · ${covered.length}/${corpus.length} locuciones mapeadas · versión ${version}`);
const missing = corpus.length - covered.length;
if (missing > 0) console.warn(`AVISO: ${missing} locuciones sin audio (caerán a expo-speech).`);

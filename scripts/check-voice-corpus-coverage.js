#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de cobertura del corpus de voz (Fase 1 del plan de mejoras
 * ACOPROS, bloqueoDePublicacion.brechaDeProceso)
 *   node scripts/check-voice-corpus-coverage.js
 *
 * Recompila src/valeriaVoiceCorpus.ts (igual que export-voice-corpus.js) y
 * comprueba que TODA locución en es/gl/eu tiene su asset en assets/voice/.
 * Antes de este gate, un PR podía cambiar un texto locutado, no regenerar el
 * corpus ni sintetizar los assets, y nada lo detectaba: la app seguía
 * funcionando (cae a expo-speech), los tests pasaban y el diff se veía verde.
 * Este script convierte esa disciplina humana en un chequeo de CI.
 *
 * es-DO queda fuera a propósito: se locuta con la voz del sistema y no tiene
 * (ni necesita) assets pregenerados — ver bloqueoDePublicacion.excepcionesConocidas.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(ROOT, 'src', 'valeriaVoiceCorpus.ts');
const ASSETS_DIR = path.join(ROOT, 'assets', 'voice');
const LANGS_WITH_ASSETS = ['es', 'gl', 'eu'];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-voice-corpus-check-'));
try {
  execSync(
    [
      'npx tsc', JSON.stringify(ENTRY),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp),
    ].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );

  const { buildVoiceCorpus } = require(path.join(tmp, 'valeriaVoiceCorpus.js'));
  const corpus = buildVoiceCorpus();

  const files = new Set(
    fs.existsSync(ASSETS_DIR) ? fs.readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.m4a')) : [],
  );

  const missingByLang = {};
  let missingTotal = 0;
  for (const e of corpus) {
    if (!LANGS_WITH_ASSETS.includes(e.lang)) continue; // es-DO: voz del sistema, sin asset
    if (!files.has(`${e.id}.m4a`)) {
      missingByLang[e.lang] = (missingByLang[e.lang] ?? 0) + 1;
      missingTotal += 1;
    }
  }

  const relevant = corpus.filter((e) => LANGS_WITH_ASSETS.includes(e.lang)).length;
  console.log(`Corpus: ${corpus.length} locuciones (${relevant} en es/gl/eu, con asset esperado).`);

  if (missingTotal > 0) {
    console.error(`\n✖ Faltan ${missingTotal} assets de voz en es/gl/eu:`);
    for (const [lang, n] of Object.entries(missingByLang)) console.error(`  · ${lang}: ${n} locuciones sin asset`);
    console.error(
      '\nUn cambio de texto locutado sin regenerar el corpus de voz degrada la sesión a la voz\n' +
      'del sistema (silenciosamente: la app no se rompe). Antes de mezclar:\n' +
      '  1) node scripts/export-voice-corpus.js\n' +
      '  2) Lanzar el workflow "Generate Voice Assets" (o esperar a que corra en push a claude/**)\n' +
      '     para cada idioma con locuciones pendientes.\n' +
      '  3) Reejecutar este chequeo.\n' +
      'Ver docs/plan-mejoras-acopros-logopedas.json → bloqueoDePublicacion.',
    );
    process.exit(1);
  }

  console.log('✓ Cobertura completa: toda locución en es/gl/eu tiene su asset de voz.');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

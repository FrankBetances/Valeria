#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Exportador del corpus de voz (Fase 1 del plan ILENIA/Nós)
 *   node scripts/export-voice-corpus.js  →  voice-corpus.json (raíz del repo)
 *
 * Compila el módulo PURO src/valeriaVoiceCorpus.ts (y sus dependencias de
 * datos) a CommonJS en un directorio temporal, lo ejecuta en Node y vuelca el
 * corpus completo a JSON. Ese JSON es la entrada de la tubería de Fase 2:
 * síntesis con las voces de ILENIA/Nós → assets/voice/<id>.m4a → regeneración
 * de src/valeriaVoiceAssets.ts.
 *
 * Si algún módulo del corpus deja de ser puro (importa react-native/expo),
 * la compilación o el require fallan AQUÍ, en build-time — nunca en la app.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(ROOT, 'src', 'valeriaVoiceCorpus.ts');
const OUT_JSON = path.join(ROOT, 'voice-corpus.json');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-voice-corpus-'));
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

  const byStyle = {};
  const bySource = {};
  let chars = 0;
  for (const e of corpus) {
    byStyle[e.style] = (byStyle[e.style] ?? 0) + 1;
    bySource[e.source] = (bySource[e.source] ?? 0) + 1;
    chars += e.text.length;
  }

  const ids = new Set(corpus.map((e) => e.id));
  if (ids.size !== corpus.length) {
    console.error(`COLISIÓN de ids: ${corpus.length - ids.size} duplicados. Revisar hash.`);
    process.exit(1);
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify({
    generatedAt: new Date().toISOString(),
    entries: corpus.length,
    byStyle, bySource,
    corpus,
  }, null, 1));

  console.log(`OK → ${OUT_JSON}`);
  console.log(`Entradas: ${corpus.length} · caracteres: ${chars}`);
  console.log('Por estilo:', JSON.stringify(byStyle));
  console.log('Por fuente:', JSON.stringify(bySource));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

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
  .map((e) => `      ${JSON.stringify(e.id)}: () => require('../assets/voice/${e.id}.m4a'),`);

fs.writeFileSync(OUT, `// ============================================================================
// Valeria+ · Mapa id → asset de voz neuronal — ARCHIVO GENERADO, NO EDITAR
// Regenerado por scripts/build-voice-asset-map.js (tubería de Fase 2,
// .github/workflows/voice-assets.yml). Cobertura: ${covered.length}/${corpus.length} locuciones
// del corpus; lo no cubierto cae a expo-speech en runtime.
// ============================================================================

// Versión del lote de audio empaquetado ('none' = sin audio pre-generado).
export const VOICE_ASSETS_VERSION = ${JSON.stringify(version)};

// ---------------------------------------------------------------------------
// Por qué esto es un CARGADOR y no un mapa
// ---------------------------------------------------------------------------
// Un objeto literal con ${covered.length} require() no es un objeto: son
// ${covered.length} MÓDULOS de Metro ejecutados, cada uno registrando su
// descriptor de asset —nombre, hash y la lista de hashes por escala— en el
// registro de assets de React Native. Y ocurría en el ARRANQUE, porque
// valeriaVoice entra por el grafo de App.tsx: ${covered.length} ejecuciones de
// módulo y ${covered.length} objetos antes del primer frame, en una pantalla
// donde la app todavía no ha locutado nada.
//
// Aquí el literal vive DENTRO de una función. Hermes compila los cuerpos de
// función de forma perezosa, así que arrancar no cuesta nada: el mapa se
// construye la primera vez que la app va a hablar, y cada require() se ejecuta
// solo cuando esa locución concreta suena. Metro exige que la ruta del require
// sea literal —por eso siguen enumeradas una a una—, no exige ejecutarlas.
let LOADERS: Record<string, () => number> | null = null;

function loaders(): Record<string, () => number> {
  if (LOADERS === null) {
    LOADERS = {
${lines.join('\n')}
    };
  }
  return LOADERS;
}

/**
 * Módulo de Metro de la locución, o undefined si no está horneada (entonces cae
 * a expo-speech). No memoiza: require ya lo cachea Metro, y una caché propia
 * aquí impediría vaciar el mapa para probar el camino sin asset
 * (scripts/check-lua-voice-language.js).
 */
export function voiceAsset(id: string): number | undefined {
  const load = loaders()[id];
  return load ? load() : undefined;
}

/** Ids con audio empaquetado. Lo pregunta la tarjeta «Voz de la app». */
export function voiceAssetIds(): string[] {
  return Object.keys(loaders());
}

/** Mapa VIVO id → cargador. Para inspección y pruebas, no para la app. */
export function voiceAssetLoaders(): Record<string, () => number> {
  return loaders();
}
`);

console.log(`OK → ${OUT} · ${covered.length}/${corpus.length} locuciones mapeadas · versión ${version}`);
const missing = corpus.length - covered.length;
if (missing > 0) console.warn(`AVISO: ${missing} locuciones sin audio (caerán a expo-speech).`);

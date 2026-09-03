#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de Aventuras con Lúa
 *   node scripts/verify-aventuras-lua.js
 *
 * El módulo entró con cuatro defectos que ningún gate del repo veía, porque
 * ninguno mira dentro de él:
 *
 *   · ni un dibujo en las cinco pantallas: un niño de 0-2 tenía que LEER
 *     «Señala o mira al perro» para responder;
 *   · al fallar se le locutaba la pauta del terapeuta, escrita en impersonal
 *     para el adulto;
 *   · 448 locuciones fuera de `valeriaVoiceCorpus`, que no rompen nada y no se
 *     notan: caen a la voz del sistema y se pierden Celtia e ILENIA;
 *   · «Imprime y Juega» sin nada que imprimir.
 *
 * Este gate convierte los cuatro en un fallo de build. La versión anterior
 * contaba ids y comprobaba que existieran títulos literales, y además IMPRIMÍA
 * «WCAG AAA validado» sin calcular un solo contraste: afirmaba una comprobación
 * que no hacía. Eso es lo que la regla 0 de CLAUDE.md prohíbe.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'AventurasLua');

const fails = [];
const fail = (msg) => fails.push(msg);
const ok = (msg) => console.log(`  ✓ ${msg}`);

// Se compila de verdad, en vez de leer el fichero con expresiones regulares:
// una regex da por bueno un dato que TypeScript rechazaría, y al revés.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-lua-'));
let A, S, C, P, G, VOICE;
try {
  execSync([
    'npx tsc',
    JSON.stringify(path.join(SRC, 'Catalog', 'luaVoiceLines.ts')),
    JSON.stringify(path.join(SRC, 'Catalog', 'LuaPrintablesCatalog.ts')),
    JSON.stringify(path.join(ROOT, 'src', 'ValeriaPixelArt.ts')),
    '--module commonjs', '--target es2020', '--moduleResolution node',
    '--esModuleInterop', '--skipLibCheck', '--jsx', 'react',
    '--outDir', JSON.stringify(tmp),
  ].join(' '), { cwd: ROOT, stdio: 'inherit' });

  const base = path.join(tmp, 'AventurasLua', 'Catalog');
  A = require(path.join(base, 'LuaAssessmentCatalog.js')).LUA_ASSESSMENT_CATALOG;
  S = require(path.join(base, 'LuaStoriesCatalog.js')).LUA_STORIES_CATALOG;
  C = require(path.join(base, 'LuaSongsCatalog.js')).LUA_SONGS_CATALOG;
  P = require(path.join(base, 'LuaPrintablesCatalog.js')).LUA_PRINTABLES_CATALOG;
  G = require(path.join(base, 'LuaGamesCatalog.js')).LUA_GAMES_CATALOG;
  VOICE = require(path.join(base, 'luaVoiceLines.js')).enumerateLuaAdventureSpeech;
} catch (e) {
  console.error('✖ los catálogos de Aventuras con Lúa no compilan (mira el error de tsc de arriba)');
  process.exit(1);
}
const { PICTO_KEYS } = require(path.join(tmp, 'ValeriaPixelArt.js'));
const PICS = new Set(PICTO_KEYS);
const BANDS = ['0-2', '2-3', '3-4', '4-5', '5-7', '7-10'];

console.log('Aventuras con Lúa · verificación de catálogos, fichas y locución\n');

// --- 1. Volumen y reparto por edad ------------------------------------------
if (A.length !== 60) fail(`el banco debe tener 60 preguntas, tiene ${A.length}`);
for (const b of BANDS) {
  const n = A.filter((q) => q.ageBand === b).length;
  if (n !== 10) fail(`la franja ${b} debe tener 10 preguntas, tiene ${n}`);
}
if (S.length !== 10) fail(`deben ser 10 cuentos, hay ${S.length}`);
if (C.length !== 10) fail(`deben ser 10 canciones, hay ${C.length}`);
if (P.length !== 10) fail(`deben ser 10 imprimibles, hay ${P.length}`);
if (G.length !== 10) fail(`deben ser 10 juegos, hay ${G.length}`);
if (!fails.length) ok('60 preguntas (6 franjas x 10), 10 juegos, 10 cuentos, 10 canciones, 10 imprimibles');

// --- 2. Un ítem que el niño responde se responde MIRANDO --------------------
// Es la comprobación por la que existe este gate. Sin ficha, un ítem
// `child_choice` obliga a leer, y por debajo de 4 años no se lee.
let picless = 0;
for (const q of A) {
  if (q.mode !== 'child_choice' && q.mode !== 'adult_record') {
    fail(`${q.id}: modo desconocido «${q.mode}»`);
    continue;
  }
  if (q.mode !== 'child_choice') continue;
  for (const o of q.options) {
    if (!o.pic) { fail(`${q.id}/${o.id}: opción tocable sin ficha`); picless++; }
    else if (!PICS.has(o.pic)) fail(`${q.id}/${o.id}: la ficha «${o.pic}» no existe en PICTO_KEYS`);
  }
}
for (const q of A) {
  if (q.questionPic && !PICS.has(q.questionPic)) {
    fail(`${q.id}: la ficha de consigna «${q.questionPic}» no existe en PICTO_KEYS`);
  }
}
if (!picless) {
  const n = A.filter((q) => q.mode === 'child_choice').length;
  ok(`las ${n} preguntas que el niño responde tocando llevan ficha en todas sus opciones`);
}

// Los juegos se juegan mirando, igual que el banco: toda casilla con estímulo
// lleva su ficha. La única excepción es el hueco a rellenar de la familia de
// palabras, que es un espacio en blanco a propósito.
for (const j of G) {
  for (const it of j.items) {
    if (it.pic && !PICS.has(it.pic)) fail(`${j.id}: la ficha «${it.pic}» no existe en PICTO_KEYS`);
    if (!it.pic && it.label && j.kind !== 'word_web') fail(`${j.id}: «${it.label}» sin ficha`);
  }
  if (!Array.isArray(j.ageBands) || !j.ageBands.length) fail(`${j.id}: juego sin ageBands`);
}
if (!fails.some((m) => /lua_game/.test(m))) ok('los 10 juegos llevan ficha en cada estímulo');

// --- 3. Al niño no se le locuta la pauta del adulto -------------------------
for (const q of A) {
  if (!q.childRecast || !q.childRecast.trim()) fail(`${q.id}: sin childRecast`);
}
const players = fs.readdirSync(path.join(SRC, 'Screens')).filter((f) => f.endsWith('.tsx'));
for (const f of players) {
  const body = fs.readFileSync(path.join(SRC, 'Screens', f), 'utf8');
  // El fallo original, exacto: speakToChild(...modelingFeedback).
  if (/speak\w*\([^)]*modelingFeedback/.test(body)) {
    fail(`${f}: locuta modelingFeedback, que es la pauta del ADULTO. Usa childRecast.`);
  }
  if (/speak\w*\([^)]*adultGuidance/.test(body)) {
    fail(`${f}: locuta adultGuidance, que es la guía del ADULTO.`);
  }
  // El contenido del módulo es castellano. Locutarlo con `speakToChild` a secas
  // lo lee con la voz del locale de terapia: en euskera, voz vasca sobre texto
  // castellano. Todo pasa por `luaSpeech`, que fija la voz.
  if (/\bspeakToChild(Seq)?\(/.test(body)) {
    fail(`${f}: usa speakToChild directamente. Usa speakLuaToChild (src/AventurasLua/luaSpeech.ts).`);
  }
}
if (!fails.some((m) => /childRecast|modelingFeedback|adultGuidance|speakToChild/.test(m))) {
  ok('las 60 llevan devolución para el niño; no se locuta la pauta del adulto ni con la voz equivocada');
}

// --- 4. Todo lo que suena está en el corpus ---------------------------------
// Sin esto la locución no falla: cae a la voz del sistema, en silencio.
const spoken = new Set(VOICE().map((l) => l.text.trim()));
const mustSpeak = [];
for (const q of A) mustSpeak.push([q.id, q.prompt], [q.id, q.clinicalSupport.targetFeedback], [q.id, q.childRecast]);
for (const s of S) { for (const p of s.paragraphs) mustSpeak.push([s.id, p]); for (const q of s.comprehensionQuestions) mustSpeak.push([s.id, q.hint]); }
for (const j of G) { mustSpeak.push([j.id, j.instructions]); for (const it of j.items) if (it.label) mustSpeak.push([j.id, it.label]); }
for (const c of C) { for (const v of c.lyrics) mustSpeak.push([c.id, v]); for (const e of c.interactiveTask.elements ?? []) mustSpeak.push([c.id, e]); }
let uncovered = 0;
for (const [id, text] of mustSpeak) {
  const t = (text ?? '').trim();
  if (t && !spoken.has(t)) { uncovered++; if (uncovered <= 5) fail(`${id}: locución fuera del corpus → «${t.slice(0, 60)}…»`); }
}
if (uncovered > 5) fail(`…y ${uncovered - 5} locuciones más fuera del corpus`);
if (!uncovered) ok(`las ${mustSpeak.length} locuciones del módulo están en valeriaVoiceCorpus`);

// --- 5. El filtro por edad alcanza a las cuatro secciones -------------------
const checkBands = (list, what) => {
  for (const it of list) {
    if (!Array.isArray(it.ageBands) || !it.ageBands.length) fail(`${it.id}: ${what} sin ageBands`);
    else for (const b of it.ageBands) if (!BANDS.includes(b)) fail(`${it.id}: franja desconocida «${b}»`);
  }
};
checkBands(C, 'canción');
checkBands(P, 'imprimible');
for (const s of S) if (!BANDS.includes(s.ageBand)) fail(`${s.id}: franja desconocida «${s.ageBand}»`);
// Una franja puede quedarse sin canciones —las 50 hojas no traen ninguna para
// 7-10 y no se va a inventar una— pero NO puede quedarse sin nada, y sobre todo
// la pantalla tiene que decirlo en vez de enseñar un hueco mudo.
for (const b of BANDS) {
  const total = A.filter((q) => q.ageBand === b).length
    + S.filter((x) => x.ageBand === b).length
    + C.filter((x) => x.ageBands.includes(b)).length
    + P.filter((x) => x.ageBands.includes(b)).length
    + G.filter((x) => x.ageBands.includes(b)).length;
  if (!total) fail(`la franja ${b} se queda sin ninguna actividad`);
}
const hub = fs.readFileSync(path.join(SRC, 'Screens', 'ValeriaAventurasLuaHubScreen.tsx'), 'utf8');
if (!/sectionEmpty/.test(hub)) {
  fail('el hub no tiene estado vacío por sección: una franja sin canciones enseñaría un hueco mudo');
}
if (!fails.some((m) => /ageBands|se queda sin|hueco mudo/.test(m))) {
  ok('las cuatro secciones responden al filtro por edad, y las vacías se explican');
}

// --- 6. «Imprime y Juega» tiene algo que imprimir ---------------------------
const KINDS = ['pic_cards','sequence','tracing','columns','word_gaps','rhyme_pairs','wheel','weekly','diploma'];
for (const p of P) {
  if (!p.sheet) { fail(`${p.id}: imprimible sin hoja`); continue; }
  if (!KINDS.includes(p.sheet.kind)) fail(`${p.id}: tipo de hoja desconocido «${p.sheet.kind}»`);
  const cells = [
    ...(p.sheet.cells ?? []), ...(p.sheet.steps ?? []), ...(p.sheet.chips ?? []),
    ...(p.sheet.pairs ?? []).flat(),
  ];
  for (const c of cells) {
    if (c.pic && !PICS.has(c.pic)) fail(`${p.id}: la ficha «${c.pic}» no existe en PICTO_KEYS`);
  }
}
if (!fails.some((m) => /hoja|imprimible sin/.test(m))) ok('los 10 imprimibles traen hoja dibujable con fichas del banco propio');

// --- 7. Nada de iconografía de librería ------------------------------------
// Regla 5: los iconos del sistema o de una librería externa no forman un set.
const icons = fs.readFileSync(path.join(ROOT, 'src', 'ValeriaBlockIcons.tsx'), 'utf8');
const NAMES = new Set([...icons.slice(icons.indexOf('export type BlockIconName'), icons.indexOf('interface Props')).matchAll(/'([a-z_0-9]+)'/g)].map((m) => m[1]));
for (const p of P) {
  if (!NAMES.has(p.previewIcon)) fail(`${p.id}: «${p.previewIcon}» no está en el set propio ValeriaBlockIcons`);
}
if (!fails.some((m) => /set propio/.test(m))) ok('los iconos del catálogo salen del set propio, no de una librería');

// --- Veredicto --------------------------------------------------------------
if (fails.length) {
  console.error('\n✖ Aventuras con Lúa: ' + fails.length + (fails.length === 1 ? ' problema' : ' problemas'));
  for (const m of fails) console.error('   · ' + m);
  process.exit(1);
}
console.log('\n✓ Aventuras con Lúa: catálogos, fichas, locución e imprimibles en orden.');

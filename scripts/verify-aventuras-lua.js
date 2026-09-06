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
let A, S, C, G, VOICE;
try {
  execSync([
    'npx tsc',
    JSON.stringify(path.join(SRC, 'Catalog', 'luaVoiceLines.ts')),
    JSON.stringify(path.join(ROOT, 'src', 'ValeriaPixelArt.ts')),
    '--module commonjs', '--target es2020', '--moduleResolution node',
    '--esModuleInterop', '--skipLibCheck', '--jsx', 'react',
    '--outDir', JSON.stringify(tmp),
  ].join(' '), { cwd: ROOT, stdio: 'inherit' });

  const base = path.join(tmp, 'AventurasLua', 'Catalog');
  A = require(path.join(base, 'LuaAssessmentCatalog.js')).LUA_ASSESSMENT_CATALOG;
  S = require(path.join(base, 'LuaStoriesCatalog.js')).LUA_STORIES_CATALOG;
  C = require(path.join(base, 'LuaSongsCatalog.js')).LUA_SONGS_CATALOG;
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
// Los 10 de las 50 hojas + los 9 de la Matriz de Contenidos por Edad.
if (G.length !== 25) fail(`deben ser 25 juegos, hay ${G.length}`);
// La matriz pone juegos en TODAS las franjas, 0-2 incluida, que es la que menos
// puede leer y la que entró sin ninguno.
for (const b of BANDS) {
  if (!G.some((j) => j.ageBands.includes(b))) fail(`la franja ${b} se queda sin juegos`);
}
if (!fails.length) ok('60 preguntas (6 franjas x 10), 25 juegos en las seis franjas, 10 cuentos, 10 canciones');

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
  if (j.kind === 'clue_reveal' && !(j.clues ?? []).length) {
    fail(`${j.id}: 'clue_reveal' sin pistas`);
  }
  if (!Array.isArray(j.ageBands) || !j.ageBands.length) fail(`${j.id}: juego sin ageBands`);
}
if (!fails.some((m) => /lua_game/.test(m))) ok('los 25 juegos llevan ficha en cada estímulo');

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
for (const j of G) { mustSpeak.push([j.id, j.instructions]); for (const c of j.clues ?? []) mustSpeak.push([j.id, c]); for (const it of j.items) if (it.label) mustSpeak.push([j.id, it.label]); }
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
for (const s of S) if (!BANDS.includes(s.ageBand)) fail(`${s.id}: franja desconocida «${s.ageBand}»`);
// Una franja puede quedarse sin canciones —las 50 hojas no traen ninguna para
// 7-10 y no se va a inventar una— pero NO puede quedarse sin nada, y sobre todo
// la pantalla tiene que decirlo en vez de enseñar un hueco mudo.
for (const b of BANDS) {
  const total = A.filter((q) => q.ageBand === b).length
    + S.filter((x) => x.ageBand === b).length
    + C.filter((x) => x.ageBands.includes(b)).length
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

// --- 6. El vocabulario de los cuentos también se ve -----------------------
// Las 30 tarjetas llevaban nombres de una librería externa que nadie pintaba.
// Por debajo de 5 años la palabra sola no basta.
for (const st of S) {
  const joven = st.ageBand === '0-2' || st.ageBand === '2-3' || st.ageBand === '3-4' || st.ageBand === '4-5';
  for (const c of st.newWords) {
    if (c.pic && !PICS.has(c.pic)) fail(`${st.id}: la ficha «${c.pic}» no existe en PICTO_KEYS`);
    if (joven && !c.pic) fail(`${st.id}: «${c.word}» sin ficha en un cuento de ${st.ageBand}`);
  }
  // Y las respuestas: en 0-2 y 2-3 el niño elige mirando, no leyendo.
  if (st.ageBand === '0-2' || st.ageBand === '2-3') {
    for (const q of st.comprehensionQuestions) {
      for (const o of q.options) {
        if (!o.pic) fail(`${st.id}: la respuesta «${o.text}» no tiene ficha y el cuento es de ${st.ageBand}`);
        else if (!PICS.has(o.pic)) fail(`${st.id}: la ficha «${o.pic}» no existe en PICTO_KEYS`);
      }
    }
  }
}
if (!fails.some((m) => /sin ficha en un cuento|no tiene ficha y el cuento|lua_story/.test(m))) {
  ok('el vocabulario y las respuestas de los cuentos que aún no se leen llevan ficha');
}

// --- 7. Nada de iconografía de librería ------------------------------------
// Regla 5: los iconos de una librería externa no forman un set, y además aquí
// no los pintaba nadie: eran 72 nombres muertos entre catálogos.
for (const f of ['LuaStoriesCatalog.ts', 'LuaGamesCatalog.ts', 'LuaSongsCatalog.ts']) {
  const body = fs.readFileSync(path.join(SRC, 'Catalog', f), 'utf8');
  // Solo el dato, no los comentarios: la nota que explica por qué se retiraron
  // menciona los nombres a propósito.
  const data = body.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  if (/iconName:|previewIcon:/.test(data)) {
    fail(`${f}: quedan campos de icono de librería (iconName/previewIcon). Usa la clave pic del banco propio.`);
  }
}
if (!fails.some((m) => /icono de librería/.test(m))) {
  ok('no quedan nombres de icono de librería en los catálogos');
}

// --- Recitado rítmico: el compás tiene que dar tiempo al verso ---------------
// El metrónomo hace entrar un verso por compás. Si el compás dura menos que el
// audio del verso, la app se corta a sí misma: el niño oye media línea y el
// pulso ya va por la siguiente. No es una molestia estética, es el ejercicio
// roto — el punto de recitar a pulso es que la sílaba caiga donde toca.
//
// No se estima la duración: se LEE la de los assets ya sintetizados
// (voice-assets-manifest.*.json trae los segundos de cada locución). Un idioma
// sin sintetizar todavía se salta, no se inventa.
console.log('\n── Recitado rítmico: tempo, acento y holgura del compás ──');
const SONGS = C;
// Del corpus ya exportado, no recompilando el módulo: el id sale de ahí y así
// esto comprueba lo mismo que se empaqueta.
const corpusJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'voice-corpus.json'), 'utf8')).corpus;
const idDe = new Map(corpusJson.map((e) => [`${e.lang}\u0000${e.style}\u0000${e.text}`, e.id]));

// texto → segundos, por idioma, desde los manifiestos de audio.
const segundos = new Map();
for (const lang of ['es', 'gl', 'eu', 'en', 'ca']) {
  const mf = path.join(ROOT, `voice-assets-manifest.${lang}.json`);
  if (!fs.existsSync(mf)) continue;
  for (const f of JSON.parse(fs.readFileSync(mf, 'utf8')).files ?? []) {
    segundos.set(f.id, f.seconds);
  }
}

let sinAssets = 0;
for (const c of SONGS) {
  const r = c.rhythm;
  if (!r || !r.bpm || !r.beatsPerLine || !r.accentEvery) {
    fail(`${c.id}: sin pauta de recitado (rhythm). El metrónomo no sabría a qué ir.`);
    continue;
  }
  if (r.bpm < 40 || r.bpm > 140) fail(`${c.id}: ${r.bpm} bpm está fuera del rango recitable (40-140)`);
  if (r.beatsPerLine % r.accentEvery !== 0) {
    fail(`${c.id}: ${r.beatsPerLine} pulsos por verso no son múltiplo del acento cada ${r.accentEvery}: `
      + 'el compás empezaría en tiempo débil unas veces sí y otras no');
  }
  const compasMs = (r.beatsPerLine * 60000) / r.bpm;

  // Holgura contra el audio REAL de cada verso, en cada idioma sintetizado.
  for (const lang of ['es', 'gl']) {
    const duraciones = c.lyrics
      .map((v) => segundos.get(idDe.get(`${lang}\u0000child\u0000${v.trim()}`)))
      .filter((x) => typeof x === 'number');
    if (!duraciones.length) { sinAssets += 1; continue; }
    const peor = Math.max(...duraciones) * 1000;
    // Margen, no empate: se exige que sobren 250 ms. Un compás que cabe justo
    // en castellano se pasa en cuanto el mismo verso se sintetiza en otra
    // lengua —el galego alarga— y entonces el fallo llega al niño, no al gate.
    if (peor + 250 > compasMs) {
      fail(`${c.id} (${lang}): el compás dura ${Math.round(compasMs)} ms y el verso más largo `
        + `${Math.round(peor)} ms. Hacen falta 250 ms de margen: por debajo, la app `
        + 'se corta a sí misma a mitad de verso en cuanto otra lengua alarga.');
    }
  }
}

// El lavado de manos NO es un tempo estético: son los 20 segundos de la OMS.
const lavado = SONGS.find((c) => c.id === 'lua_song_06');
if (lavado) {
  const dur = (lavado.lyrics.length * lavado.rhythm.beatsPerLine * 60000) / lavado.rhythm.bpm;
  if (Math.round(dur) !== 20000) {
    fail(`lua_song_06: el recitado dura ${Math.round(dur)} ms y tiene que durar 20 000 — `
      + 'el tempo de esta canción ES el cronómetro del lavado de manos.');
  }
}

if (!fails.some((m) => /rhythm|compás|bpm|recitado/.test(m))) {
  ok(`las ${SONGS.length} canciones tienen pauta de recitado y el compás da tiempo al verso`
    + (sinAssets ? ` (${sinAssets} bancos aún sin sintetizar, no comprobados)` : ''));
}

// --- Veredicto --------------------------------------------------------------
if (fails.length) {
  console.error('\n✖ Aventuras con Lúa: ' + fails.length + (fails.length === 1 ? ' problema' : ' problemas'));
  for (const m of fails) console.error('   · ' + m);
  process.exit(1);
}
console.log('\n✓ Aventuras con Lúa: catálogos, fichas y locución en orden.');

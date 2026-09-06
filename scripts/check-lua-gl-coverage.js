#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Aventuras con Lúa en galego: entero o nada
 *   node scripts/check-lua-gl-coverage.js
 *
 * El módulo tiene 105 actividades y, desde sept/2026, banco galego propio. El
 * riesgo de una capa de traducción por ids es SIEMPRE el mismo: que falte una
 * pieza y nadie se entere. Un cuento sin traducir dentro de una sesión galega
 * no rompe nada —sale el castellano— y es exactamente lo que la regla de
 * `uiLangFallback` prohíbe en el resto de la app: o está, o se declara.
 *
 * Aquí no cabe declararlo, porque esto es contenido para el NIÑO y el eje de
 * variedad no admite fallback silencioso. Así que: entero o el build en rojo.
 *
 * Cinco comprobaciones sobre los catálogos compilados:
 *
 *   L1 · Cobertura: los 60 ejercicios, 10 cuentos, 10 canciones y 25 juegos
 *        tienen entrada galega.
 *   L2 · Campos LOCUTADOS presentes y no vacíos. Son los que enumera
 *        luaVoiceLines: si falta uno, esa frase sale en castellano con voz
 *        Celtia, que es el defecto que costó el gate check-lua-voice-language.
 *   L3 · La traducción no toca la clínica: mismo número de opciones, mismos
 *        ids, mismo `isTarget` y mismo pictograma que el catálogo base.
 *   L4 · Ningún texto locutado del banco galego es idéntico al castellano en
 *        una frase larga (>25 caracteres). Un rótulo corto puede coincidir
 *        —«Maracas», «Sol»—, una frase entera no: eso es un olvido.
 *   L5 · El corpus de voz enumera el galego del módulo.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const cache = new Map();

function loadTs(file) {
  if (cache.has(file)) return cache.get(file);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  const req = (spec) => {
    if (spec.startsWith('.')) {
      const abs = path.resolve(path.dirname(file), spec);
      for (const ext of ['.ts', '.tsx', '/index.ts']) {
        if (fs.existsSync(abs + ext)) return loadTs(abs + ext);
      }
    }
    return {};
  };
  new Function('exports', 'require', 'module', js)(mod.exports, req, mod);
  cache.set(file, mod.exports);
  return mod.exports;
}

const C = (p) => loadTs(path.join(ROOT, 'src/AventurasLua/Catalog', p));
const base = {
  eval: C('LuaAssessmentCatalog.ts').LUA_ASSESSMENT_CATALOG,
  story: C('LuaStoriesCatalog.ts').LUA_STORIES_CATALOG,
  song: C('LuaSongsCatalog.ts').LUA_SONGS_CATALOG,
  game: C('LuaGamesCatalog.ts').LUA_GAMES_CATALOG,
};
const gl = {
  eval: C('gl/luaAssessmentGl.ts').LUA_ASSESSMENT_GL,
  story: C('gl/luaStoriesGl.ts').LUA_STORIES_GL,
  song: C('gl/luaSongsGl.ts').LUA_SONGS_GL,
  game: C('gl/luaGamesGl.ts').LUA_GAMES_GL,
};
const resolver = C('luaCatalogsFor.ts');

let fallos = 0;
const fallo = (m) => { fallos += 1; console.error('  ✖ ' + m); };

// ---- L1 · cobertura --------------------------------------------------------
console.log('\n── L1 · las 105 actividades tienen banco galego ──');
let total = 0;
for (const [k, lista] of Object.entries(base)) {
  total += lista.length;
  const faltan = lista.filter((x) => !gl[k][x.id]).map((x) => x.id);
  if (faltan.length) fallo(`${k}: sin galego → ${faltan.join(', ')}`);
}
console.log(`  ${total} actividades revisadas`);

// ---- L2 · campos locutados -------------------------------------------------
console.log('\n── L2 · ningún campo locutado se queda vacío ──');
const vacio = (v) => v === undefined || String(v).trim() === '';
for (const q of base.eval) {
  const o = gl.eval[q.id] || {};
  for (const campo of ['prompt', 'targetFeedback', 'childRecast']) {
    if (vacio(o[campo])) fallo(`eval ${q.id}: falta «${campo}» (se locuta)`);
  }
}
for (const s of base.story) {
  const o = gl.story[s.id] || {};
  if (vacio(o.title)) fallo(`cuento ${s.id}: falta el título (se locuta)`);
  if (!o.paragraphs || o.paragraphs.length !== s.paragraphs.length) {
    fallo(`cuento ${s.id}: ${o.paragraphs?.length ?? 0} párrafos en galego frente a ${s.paragraphs.length}`);
  }
  if (vacio(o.drawingPrompt)) fallo(`cuento ${s.id}: falta la consigna de dibujo (se locuta)`);
  for (const q of s.comprehensionQuestions) {
    const qo = o.questions?.[q.id];
    if (!qo || vacio(qo.question) || vacio(qo.hint)) fallo(`cuento ${s.id}: pregunta ${q.id} incompleta`);
  }
}
for (const c of base.song) {
  const o = gl.song[c.id] || {};
  if (vacio(o.title) || vacio(o.consigna)) fallo(`canción ${c.id}: falta título o consigna`);
  if (!o.lyrics || o.lyrics.length !== c.lyrics.length) {
    fallo(`canción ${c.id}: ${o.lyrics?.length ?? 0} versos en galego frente a ${c.lyrics.length}`);
  }
  const nBase = c.interactiveTask.elements?.length ?? 0;
  const nGl = o.interactiveTask?.elements?.length ?? nBase;
  if (nGl !== nBase) fallo(`canción ${c.id}: ${nGl} elementos en galego frente a ${nBase}`);
}
for (const j of base.game) {
  const o = gl.game[j.id] || {};
  if (vacio(o.title) || vacio(o.instructions)) fallo(`juego ${j.id}: falta título o consigna`);
  if ((o.clues?.length ?? (j.clues?.length ?? 0)) !== (j.clues?.length ?? 0)) {
    fallo(`juego ${j.id}: el número de pistas no coincide`);
  }
}

// ---- L3 · la traducción no toca la clínica ---------------------------------
console.log('\n── L3 · la capa galega no cambia lo que decide la clínica ──');
const glEval = resolver.luaAssessmentFor('gl');
for (let i = 0; i < base.eval.length; i++) {
  const b = base.eval[i]; const g = glEval[i];
  if (b.id !== g.id || b.mode !== g.mode || b.ageBand !== g.ageBand) fallo(`eval ${b.id}: cambió id, modo o edad`);
  if (b.options.length !== g.options.length) fallo(`eval ${b.id}: distinto número de opciones`);
  b.options.forEach((opt, k) => {
    const go = g.options[k];
    if (opt.id !== go.id || opt.isTarget !== go.isTarget || opt.pic !== go.pic) {
      fallo(`eval ${b.id}: la opción ${opt.id} cambió id, isTarget o pictograma`);
    }
  });
}
const glStories = resolver.luaStoriesFor('gl');
for (let i = 0; i < base.story.length; i++) {
  base.story[i].comprehensionQuestions.forEach((q, k) => {
    q.options.forEach((opt, m) => {
      const go = glStories[i].comprehensionQuestions[k].options[m];
      if (opt.id !== go.id || opt.isCorrect !== go.isCorrect || opt.pic !== go.pic) {
        fallo(`cuento ${base.story[i].id}: la opción ${opt.id} cambió id, isCorrect o pictograma`);
      }
    });
  });
}
const glGames = resolver.luaGamesFor('gl');
for (let i = 0; i < base.game.length; i++) {
  const b = base.game[i]; const g = glGames[i];
  if (b.items.length !== g.items.length) fallo(`juego ${b.id}: distinto número de estímulos`);
  const dianasB = b.items.filter((x) => x.isTarget).length;
  const dianasG = g.items.filter((x) => x.isTarget).length;
  if (dianasB !== dianasG) fallo(`juego ${b.id}: ${dianasG} dianas en galego frente a ${dianasB}`);
}

// ---- L4 · nada largo sin traducir ------------------------------------------
console.log('\n── L4 · ninguna frase larga se quedó en castellano ──');
const lineasEs = C('luaVoiceLines.ts').enumerateLuaAdventureSpeech('es').map((l) => l.text);
const lineasGl = C('luaVoiceLines.ts').enumerateLuaAdventureSpeech('gl').map((l) => l.text);
if (lineasEs.length !== lineasGl.length) {
  fallo(`el módulo enumera ${lineasEs.length} locuciones en castellano y ${lineasGl.length} en galego`);
}
const iguales = lineasEs.filter((t, i) => t.length > 25 && t === lineasGl[i]);
if (iguales.length) {
  fallo(`${iguales.length} frase(s) larga(s) idénticas al castellano; la primera: «${iguales[0].slice(0, 70)}…»`);
}
console.log(`  ${lineasGl.length} locuciones galegas enumeradas`);

// ---- L5 · el corpus las conoce ---------------------------------------------
console.log('\n── L5 · el corpus de voz enumera el galego del módulo ──');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'voice-corpus.json'), 'utf8')).corpus;
const enCorpus = new Set(corpus.filter((e) => e.lang === 'gl').map((e) => e.text));
const fuera = lineasGl.filter((t) => !enCorpus.has(t));
if (fuera.length) {
  fallo(`${fuera.length} locución(es) galegas del módulo no están en el corpus`
    + ` (corre node scripts/export-voice-corpus.js). La primera: «${fuera[0].slice(0, 60)}…»`);
}

console.log('');
if (fallos) {
  console.error(`✗ ${fallos} fallo(s): Aventuras con Lúa no está entero en galego.\n`);
  process.exit(1);
}
console.log('✓ Aventuras con Lúa, entero en galego y sin tocar la clínica.\n');

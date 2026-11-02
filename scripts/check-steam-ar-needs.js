#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Lo que cada reto STEAM necesita de la cámara
 *   node scripts/check-steam-ar-needs.js
 *
 * PLAN-INTEGRACION-AR-LUA-CONSTRUYE v3.0 §2.2. La v2.0 dio por hechos cuatro
 * detectores que no existían. Este gate impide repetirlo:
 *   1. NATIVE_AR_DETECTORS (src/steam/arNeeds.ts) coincide con lo que importa
 *      el Kotlin de android-native/valeria-ar, en los dos sentidos.
 *   2. Todo método de un evento es un detector conocido.
 *   3. Cada uno de los 35 retos tiene sus necesidades calculadas: modalidades
 *      de set, ningún detector descartado ni pendiente marcado como nativo.
 * ========================================================================== */
const path = require('path');
const fs = require('fs');
const Module = require('module');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const NATIVE_DIR = path.join(ROOT, 'android-native/valeria-ar/src/main/java');

// Lo que tiene que aparecer en el Kotlin para que un detector exista.
const NATIVE_EVIDENCE = {
  face: /\bFaceLandmarker\b/,
  hand: /\bHandLandmarker\b/,
  marker: /\b(ArucoDetector|Aruco|apriltag|AprilTag|AugmentedImage)\b/,
  occlusion: /\b(ArucoDetector|Aruco|apriltag|AprilTag|AugmentedImage)\b/,
  tracked_object: /\bObjectDetector\b/,
};

function installTsRequire() {
  const origResolve = Module._resolveFilename;
  Module._resolveFilename = function (request, parent, isMain, options) {
    if (parent?.filename?.endsWith('.ts') && request.startsWith('.') && !/\.(ts|js)$/.test(request)) {
      const base = path.resolve(path.dirname(parent.filename), request);
      if (fs.existsSync(`${base}.ts`)) return origResolve.call(this, `${request}.ts`, parent, isMain, options);
      if (fs.existsSync(path.join(base, 'index.ts'))) return origResolve.call(this, `${request}/index.ts`, parent, isMain, options);
    }
    return origResolve.call(this, request, parent, isMain, options);
  };
  Module._extensions['.ts'] = function (module, filename) {
    const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.React },
      fileName: filename,
    });
    module._compile(out.outputText, filename);
  };
}
installTsRequire();
const load = (rel) => require(path.join(ROOT, rel));

const { STEAM_WORLDS } = load('src/steam/worlds/index.ts');
const { NATIVE_AR_DETECTORS, DISCARDED_AR_DETECTORS, SET_MODES, challengeArNeeds } = load('src/steam/arNeeds.ts');

const fails = [];
const fail = (m) => fails.push(m);

// 1 · El TS dice lo mismo que el Kotlin.
function kotlinFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? kotlinFiles(p) : p.endsWith('.kt') ? [p] : [];
  });
}
const kotlin = kotlinFiles(NATIVE_DIR).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
if (!NATIVE_AR_DETECTORS.includes('adult_tap')) fail('NATIVE_AR_DETECTORS tiene que incluir adult_tap: todo reto se juega sin cámara.');
for (const [method, re] of Object.entries(NATIVE_EVIDENCE)) {
  const declared = NATIVE_AR_DETECTORS.includes(method);
  const present = re.test(kotlin);
  if (declared && !present) fail(`arNeeds.ts declara '${method}' como nativo y el Kotlin no lo tiene (${re}).`);
  if (!declared && present) fail(`El Kotlin ya tiene '${method}' (${re}) y arNeeds.ts no lo declara.`);
}
for (const m of NATIVE_AR_DETECTORS) {
  if (m !== 'adult_tap' && !(m in NATIVE_EVIDENCE)) fail(`'${m}' no es un detector conocido.`);
  if (DISCARDED_AR_DETECTORS.includes(m)) fail(`'${m}' no puede ser nativo y estar descartado a la vez.`);
}

// 2 y 3 · Cada reto.
const known = new Set([...Object.keys(NATIVE_EVIDENCE), 'adult_tap']);
const tally = { retos: 0, conCamaraHoy: 0, pendientes: new Map(), descartados: 0 };
for (const world of STEAM_WORLDS) {
  for (const event of world.events) {
    for (const m of event.methods) if (!known.has(m)) fail(`${event.id}: método desconocido '${m}'.`);
  }
  for (const challenge of world.challenges) {
    tally.retos += 1;
    const needs = challengeArNeeds(world, challenge);
    if (needs.challengeId !== challenge.id) fail(`${challenge.id}: necesidades de otro reto.`);
    if (needs.modes.join(',') !== SET_MODES.join(',') || needs.modes.includes('LUA_SOLO')) {
      fail(`${challenge.id}: un reto de set va en SET_SOLO y SET_WITH_LUA, nunca en LUA_SOLO.`);
    }
    if (needs.events.length !== challenge.targetEvents.length) fail(`${challenge.id}: algún evento objetivo no existe.`);
    const split = [...needs.nativeNow, ...needs.pending, ...needs.discarded].sort().join(',');
    if (split !== [...needs.detectors].sort().join(',')) fail(`${challenge.id}: los detectores no se reparten bien.`);
    for (const m of needs.nativeNow) if (!NATIVE_AR_DETECTORS.includes(m)) fail(`${challenge.id}: '${m}' marcado como nativo sin serlo.`);
    for (const e of needs.events) {
      const ev = world.events.find((x) => x.id === e.id);
      const camera = ev.methods.some((m) => m !== 'adult_tap' && NATIVE_AR_DETECTORS.includes(m));
      if ((e.capture === 'camera') !== camera) fail(`${e.id}: captura '${e.capture}' sin detector nativo que la sostenga.`);
    }
    if (needs.events.some((e) => e.capture === 'camera')) tally.conCamaraHoy += 1;
    for (const m of needs.pending) tally.pendientes.set(m, (tally.pendientes.get(m) ?? 0) + 1);
    if (needs.discarded.length) tally.descartados += 1;
  }
}
if (tally.retos !== 35) fail(`Hay ${tally.retos} retos; el plan cuenta 35 (S0–S6 × 5).`);

// 4 · Solo Lúa (plan v3.0 §4). Cada actividad abre un ejercicio nativo que
// existe, sin los dos vetados: AR-2 es VRA digitalizado (L06 retirada por
// riesgo regulatorio) y en AR-5 la criatura desliza el dedo por la pantalla.
const { LUA_SOLO_ACTIVITIES } = load('src/steam/luaSolo.ts');
const { translateExpression } = load('src/steam/engine/LuaLink.ts');
const { ADULT_UI_LANGS } = load('src/steam/types.ts');
const VETADOS = { ar2: 'VRA digitalizado (L06 retirada)', ar5: 'la criatura toca la pantalla' };
const NATIVE_CLASS = { ar1: 'Ar1Orofacial', ar2: 'Ar2Vra', ar3: 'Ar3Fixation', ar4: 'Ar4SpatialSearch', ar5: 'Ar5FeedCatch', ar6: 'Ar6BuddyMimicry' };
const soloIds = new Set();
const texts = (obj, where) => {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object' && ADULT_UI_LANGS.every((l) => l in v)) {
      for (const l of ADULT_UI_LANGS) if (typeof v[l] !== 'string' || !v[l].trim()) fail(`${where}.${k}: falta el texto en ${l}.`);
    } else if (v && typeof v === 'object') texts(v, `${where}.${k}`);
  }
};
if (!LUA_SOLO_ACTIVITIES.length) fail('Solo Lúa no tiene actividades.');
for (const act of LUA_SOLO_ACTIVITIES) {
  if (soloIds.has(act.id)) fail(`${act.id}: id repetido.`);
  soloIds.add(act.id);
  if (VETADOS[act.exerciseId]) fail(`${act.id}: abre ${act.exerciseId}, vetado en Solo Lúa (${VETADOS[act.exerciseId]}).`);
  const cls = NATIVE_CLASS[act.exerciseId];
  if (!cls || !new RegExp(`class ${cls}\\b`).test(kotlin)) fail(`${act.id}: el ejercicio ${act.exerciseId} no existe en el Kotlin.`);
  for (const k of ['luaStart', 'luaEnd']) {
    try { translateExpression(act[k]); } catch (e) { fail(`${act.id}.${k}: '${act[k]}' no cae en las 28 caras.`); }
  }
  if (act.cycle.observa.mandatorySilenceSec !== 5) fail(`${act.id}: el silencio de Observa son 5 s.`);
  texts({ title: act.title, summary: act.summary, cycle: act.cycle }, act.id);
}

if (fails.length) {
  console.error('✗ check-steam-ar-needs');
  for (const f of fails) console.error(`  · ${f}`);
  process.exit(1);
}
const pend = [...tally.pendientes].map(([m, n]) => `${m} ${n}`).join(', ');
console.log(
  `✓ Necesidades de cámara: ${tally.retos} retos. Nativo hoy: ${NATIVE_AR_DETECTORS.join(', ')}. ` +
    `Retos con algún evento captable por el módulo nativo: ${tally.conCamaraHoy}. ` +
    `Pendientes por detector: ${pend}. Con detector descartado (se quedan en adult_tap): ${tally.descartados}. ` +
    `Solo Lúa: ${LUA_SOLO_ACTIVITIES.map((x) => `${x.id}→${x.exerciseId}`).join(', ')}.`,
);

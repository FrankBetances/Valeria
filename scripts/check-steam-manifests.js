#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Mundos STEAM S0–S6 (docs/PLAN-REFACTOR-STEAM.md §4 R1–R2)
 *   node scripts/check-steam-manifests.js
 *
 * Falla si un manifiesto rompe validator.ts (adult_tap en todo evento, luz y
 * háptico apagados en turno verbal o error, un marcador por instancia, cinco
 * retos en la escalera I1–I5, eventos que existen, AdultText es/en/ca/gl), si
 * el replay sintético (positiva, negativa y oclusión parcial por mundo) no da
 * lo esperado o tarda 300 ms o más, si una expresión de Lúa no cae en las 28
 * caras de protocol.json v1, o si un texto usa el vocabulario de §7.2.
 * ========================================================================== */
const path = require('path');
const fs = require('fs');
const Module = require('module');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const WORLDS = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
const FILES = { S0: 's0_kit', S1: 's1_camino', S2: 's2_sonido', S3: 's3_rampas', S4: 's4_soplo', S5: 's5_puente', S6: 's6_jardin' };
const REPLAY_BUDGET_MS = 300;

const UB = '(?:(?<![\\p{L}\\p{N}_])(?=[\\p{L}\\p{N}_])|(?<=[\\p{L}\\p{N}_])(?![\\p{L}\\p{N}_]))';
function uRe(re) {
  return new RegExp(re.source.replace(/\\b/g, UB), re.flags.includes('u') ? re.flags : `${re.flags}u`);
}

/** Misma lista que scripts/check-regulatory-vocabulary.js. */
const RULES = [
  {
    id: 'tratamiento',
    re: uRe(/\b(tratamientos?|tratamentos?|tractaments?|treatments?)\b/gi),
    gdpr: true,
  },
  { id: 'terapia', re: uRe(/\b(terapias?|teràpies?|therap(?:y|ies))\b/gi) },
  { id: 'rehabilitacion', re: uRe(/\brehabilitaci[oó]n?s?\b|\brehabilitations?\b/gi) },
  {
    id: 'prescripcion',
    re: uRe(/\b(prescripci[oó]n?s?|prescrici[oó]n?s?|prescriptions?|prescribir|prescriure|prescribe[ds]?|prescribing|prescrit(?:o|a|os|as|s|es)?|prescriptor(?:es)?|prescritor(?:es)?|pautar|pautad[oa]s?|pautats?)\b/gi),
  },
  { id: 'paciente', re: uRe(/\b(pacientes?|pacients?|patients?)\b/gi) },
  { id: 'desensibilizacion', re: uRe(/\b(desensibilizaci[oó]n(?:es)?|desensibilitzaci[oó]|desensitiz\w*)\b/gi) },
  { id: 'SOR', re: uRe(/\bSOR\b/g) },
  { id: 'diagnostico', re: uRe(/\b(diagn[oóò]sti\w*|diagnos\w*)\b/gi) },
  { id: 'evaluacion-clinica', re: uRe(/evaluaci[oó]n cl[ií]nica|avaluaci[oó] cl[ií]nica|clinical evaluation/gi) },
  { id: 'PRT', re: uRe(/\bPRT\b/g) },
  { id: 'TCC', re: uRe(/\bTCC\b/g) },
  { id: 'CBT', re: uRe(/\bCBT\b/g) },
  { id: 'cierre-velar', re: uRe(/cierre velar|tancament velar|velar closure/gi) },
  { id: 'estresor', re: uRe(/\b(estresor(?:es)?|estresorea|estressors?|stressors?)\b/gi) },
  { id: 'abrazo-oso', re: uRe(/abrazo de oso|abraçada d['’]ós/gi) },
];

const GDPR = /responsable del tratamiento|encargado del tratamiento|tratamiento de datos|este tratamiento|ese tratamiento|tratamiento se limita|constituye tratamiento|tratamiento lo realiza/i;

function gdprAllowed(text, index) {
  return GDPR.test(text.slice(Math.max(0, index - 56), index + 56));
}

function hitsIn(text) {
  const found = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let match;
    while ((match = rule.re.exec(text))) {
      if (rule.gdpr && gdprAllowed(text, match.index)) continue;
      found.push({ id: rule.id, term: match[0] });
    }
  }
  return found;
}

let tsReady = false;

function installTsRequire() {
  if (tsReady) return;
  tsReady = true;
  const origResolve = Module._resolveFilename;
  Module._resolveFilename = function (request, parent, isMain, options) {
    if (
      parent &&
      parent.filename &&
      parent.filename.endsWith('.ts') &&
      request.startsWith('.') &&
      !request.endsWith('.ts') &&
      !request.endsWith('.js')
    ) {
      const base = path.resolve(path.dirname(parent.filename), request);
      if (fs.existsSync(`${base}.ts`) && !fs.existsSync(`${base}.js`)) {
        return origResolve.call(this, `${request}.ts`, parent, isMain, options);
      }
      if (fs.existsSync(path.join(base, 'index.ts'))) {
        return origResolve.call(this, `${request}/index.ts`, parent, isMain, options);
      }
    }
    return origResolve.call(this, request, parent, isMain, options);
  };
  Module._extensions['.ts'] = function (module, filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const out = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
      },
      fileName: filename,
    });
    module._compile(out.outputText, filename);
  };
}

function loadTs(rel) {
  installTsRequire();
  const abs = path.join(ROOT, rel);
  return require(abs);
}

const fails = [];
const fail = (m) => fails.push(m);

const { STEAM_WORLDS } = loadTs('src/steam/worlds/index.ts');
const { validateWorldManifest } = loadTs('src/steam/validator.ts');
const { STEAM_WORLD_ORDER } = loadTs('src/steam/types.ts');
const { translateExpression, LUA_OFFICIAL_FACES } = loadTs('src/steam/engine/LuaLink.ts');
const { runSyntheticReplay } = loadTs('src/steam/engine/ObservationReplay.ts');
const { applyTurnGate } = loadTs('src/steam/engine/TurnGate.ts');
const { steamCapsules } = loadTs('src/ValeriaAcademy/steamCapsules.ts');

// 1 · Los siete mundos, en el orden canónico del plan.
const ids = STEAM_WORLDS.map((w) => w.id).join(',');
if (ids !== STEAM_WORLD_ORDER.join(',')) fail(`Orden de mundos ${ids}; el plan pide ${STEAM_WORLD_ORDER.join(',')}.`);
if (WORLDS.some((w) => !STEAM_WORLDS.find((m) => m.id === w))) fail('Falta algún mundo de S0 a S6.');

// 2 · Validador del plan sobre cada manifiesto.
let challenges = 0;
for (const manifest of STEAM_WORLDS) {
  for (const issue of validateWorldManifest(manifest)) fail(`${issue.path}: ${issue.message}`);
  challenges += manifest.challenges.length;
  for (const event of manifest.events) {
    try { translateExpression(event.reaction.expression); } catch (e) { fail(`${event.id}: ${e.message}`); }
  }
}

// 3 · Replay de cada mundo (lo que el propio manifiesto declara) y replay sintético del motor.
for (const w of WORLDS) {
  const mod = loadTs(`src/steam/worlds/${FILES[w]}.ts`);
  try { mod.assertReplay(); } catch (e) { fail(`${w} replay: ${e.message}`); }
  const polarities = new Set((mod.REPLAY_CASES || []).map((c) => c.polarity));
  for (const p of ['positive', 'negative', 'partial_occlusion']) {
    if (!polarities.has(p)) fail(`${w}: falta el caso de replay ${p}.`);
  }
}
const t0 = process.hrtime.bigint();
const results = runSyntheticReplay();
const ms = Number(process.hrtime.bigint() - t0) / 1e6;
results.filter((r) => !r.passed).forEach((r) => fail(`Replay ${r.id}: ${r.reason}.`));
if (ms >= REPLAY_BUDGET_MS) fail(`El replay sintético tarda ${ms.toFixed(1)} ms (presupuesto < ${REPLAY_BUDGET_MS} ms).`);
const replayed = new Set(results.map((r) => r.worldId));
WORLDS.forEach((w) => { if (!replayed.has(w)) fail(`El replay sintético no cubre ${w}.`); });

// 4 · Paridad con protocol.json v1: 28 caras, cada una con un opcode real.
const protocol = JSON.parse(fs.readFileSync(path.join(ROOT, 'firmware/lua/protocol.json'), 'utf8'));
const opcodes = new Set(Object.values(protocol.opcodes || {}).map((o) => (typeof o === 'object' ? o.code ?? o.value ?? o.op : o)));
if (LUA_OFFICIAL_FACES.length !== 28) fail(`LuaLink tiene ${LUA_OFFICIAL_FACES.length} caras; protocol.json v1 define 28.`);
if (opcodes.size > 0) {
  LUA_OFFICIAL_FACES.forEach((f) => { if (!opcodes.has(f.opcode)) fail(`Cara ${f.id}: opcode 0x${f.opcode.toString(16)} no está en protocol.json.`); });
}

// 5 · TurnGate: turno verbal, error y menores de tres años sin luz ni vibración.
const loud = { light: 'DIR_DELANTE', haptic: 'CELEBRA_CORTO' };
[
  { turn: 'verbal', ...loud },
  { turn: 'motor', isErrorOrBlockedState: true, ...loud },
  { turn: 'motor', neuroStage: 'I1', ...loud },
  { turn: 'motor', ageBand: '2-3', ...loud },
].forEach((input, i) => {
  const out = applyTurnGate(input);
  if (out.light !== 'APAGADO' || out.haptic !== 'APAGADO') fail(`TurnGate caso ${i + 1}: deja pasar luz o vibración.`);
});

// 6 · Cada mundo tiene su cápsula de Academy (R6), con id STEAM-Sn.
const capsuleIds = new Set(steamCapsules('es').map((c) => c.id));
STEAM_WORLDS.forEach((w) => { if (!capsuleIds.has(w.academyCapsuleId)) fail(`${w.id}: no hay cápsula ${w.academyCapsuleId} en Academy.`); });

// 7 · Vocabulario educativo (§7.2) en todo lo que lee el adulto.
function walk(value, where) {
  if (typeof value === 'string') {
    hitsIn(value).forEach((h) => fail(`${where}: «${h.term}» (${h.id}).`));
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${where}[${i}]`));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([k, v]) => walk(v, `${where}.${k}`));
  }
}
STEAM_WORLDS.forEach((w) => walk(w, w.id));
['es', 'en', 'ca', 'gl'].forEach((l) => walk(steamCapsules(l), `academy.${l}`));

if (fails.length) {
  console.error(`✗ Mundos STEAM: ${fails.length} fallo(s)`);
  fails.forEach((f) => console.error(`  · ${f}`));
  process.exit(1);
}
console.log(`✓ Mundos STEAM: ${STEAM_WORLDS.length} mundos en orden canónico, ${challenges} retos en la escalera I1–I5, replay de ${results.length} trazas en ${ms.toFixed(1)} ms, 28 caras de protocol.json v1, TurnGate y vocabulario educativo en verde.`);

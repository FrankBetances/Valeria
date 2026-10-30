#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Manifiestos STEAM y replay sintético
 *   node scripts/check-steam-manifests.js
 *
 * Exige las 28 actividades, validator.ts, TurnGate, el ciclo con 5 s,
 * ObservationReplay (positiva, negativa y oclusión) en menos de 300 ms,
 * AdultText es/en/ca/gl y cero términos de check-regulatory-vocabulary.js.
 *
 * El barril importa luaSolo y S0–S6. Si esos ficheros no están, el gate
 * no está en verde.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const ADULT_LANGS = ['es', 'en', 'ca', 'gl'];
const CHILD_LOCALES = ['es', 'gl', 'eu', 'es-DO', 'en-US', 'ca'];
const REPLAY_POLARITIES = ['positive', 'negative', 'partial_occlusion'];
const REPLAY_BUDGET_MS = 300;
const SET_WORLDS = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S8', 'S9', 'S10', 'S11'];

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

function loadCatalog() {
  return loadTs('src/steam/worlds/index.ts');
}

function fail(lines) {
  console.error(`\n✖ ${lines.length} fallo(s) en los manifiestos STEAM:`);
  for (const line of lines) console.error(`  ${line}`);
  process.exit(1);
}

function walkAdult(value, trail, out) {
  if (!value || typeof value !== 'object') return;
  if (!Array.isArray(value) && ADULT_LANGS.some((lang) => typeof value[lang] === 'string') && !value['en-US']) {
    out.push({ trail, value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkAdult(item, `${trail}[${index}]`, out));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    walkAdult(child, `${trail}.${key}`, out);
  }
}

function walkStrings(value, trail, out) {
  if (typeof value === 'string') {
    out.push({ trail, text: value });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, `${trail}[${index}]`, out));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'file') continue;
      walkStrings(child, `${trail}.${key}`, out);
    }
  }
}

function assertFullCatalog() {
  const problems = [];
  let catalog;
  try {
    catalog = loadCatalog();
  } catch (error) {
    const missing = error && error.code === 'MODULE_NOT_FOUND';
    console.error(missing
      ? `✖ Falta un módulo del barril. El gate no está en verde hasta que existan luaSolo.ts y s0–s6 junto con s8–s11.\n  ${error.message}`
      : `✖ No se pudo cargar src/steam/worlds/index.ts.\n  ${error && error.stack ? error.stack : error}`);
    process.exit(1);
  }

  const { STEAM_ACTIVITY_IDS, STEAM_WORLD_IDS } = loadTs('src/steam/types.ts');
  const { validateSteamActivities, validateWorldManifest } = loadTs('src/steam/validator.ts');
  const { applyTurnGate } = loadTs('src/steam/engine/TurnGate.ts');
  const { translateExpression } = loadTs('src/steam/engine/LuaLink.ts');
  const { SYNTHETIC_TRACES, runSyntheticReplay } = loadTs('src/steam/engine/ObservationReplay.ts');

  const activities = catalog.STEAM_ACTIVITIES ?? [];
  const manifests = catalog.STEAM_MANIFESTS ?? [];
  const ids = activities.map((activity) => activity.id);

  if (activities.length !== 28) {
    problems.push(`Hay ${activities.length} actividades; hacen falta 28.`);
  }
  const expected = new Set(STEAM_ACTIVITY_IDS);
  const seen = new Set(ids);
  if (seen.size !== ids.length) problems.push('Hay ids de actividad repetidos.');
  for (const id of STEAM_ACTIVITY_IDS) {
    if (!seen.has(id)) problems.push(`Falta la actividad ${id}.`);
  }
  for (const id of seen) {
    if (!expected.has(id)) problems.push(`Id fuera del catálogo: ${id}.`);
  }

  const byMode = { LUA_SOLO: 0, SET_SOLO: 0, SET_WITH_LUA: 0 };
  for (const activity of activities) {
    if (Object.prototype.hasOwnProperty.call(byMode, activity.mode)) byMode[activity.mode] += 1;
    if (!Array.isArray(activity.methods) || !activity.methods.includes('adult_tap')) {
      problems.push(`${activity.id} no incluye adult_tap.`);
    }
    if (activity.mode === 'SET_SOLO' && activity.bleRequired !== false) {
      problems.push(`${activity.id} es SET_SOLO y bleRequired no es false.`);
    }
    if (activity.cycle?.observa?.mandatorySilenceSec !== 5) {
      problems.push(`${activity.id} no tiene 5 s de silencio en Observa.`);
    }
    for (const locale of CHILD_LOCALES) {
      const line = activity.childSpeech?.[locale];
      if (typeof line !== 'string' || line.trim() === '') {
        problems.push(`${activity.id} no tiene habla del niño en ${locale}.`);
      }
    }
    for (const event of activity.events ?? []) {
      if (!event.methods?.includes('adult_tap')) {
        problems.push(`${activity.id} ${event.id} no incluye adult_tap.`);
      }
      const decision = applyTurnGate({
        turn: event.turn,
        isErrorOrBlockedState: event.isErrorOrBlockedState,
        light: event.reaction?.light,
        haptic: event.reaction?.haptic,
      });
      const mustSilence = event.turn === 'verbal' || event.isErrorOrBlockedState === true;
      if (mustSilence && !decision.blocked) {
        problems.push(`${activity.id} ${event.id}: TurnGate no cortó el turno verbal o el bloqueo.`);
      }
      if (decision.blocked && (event.reaction?.light !== 'APAGADO' || event.reaction?.haptic !== 'APAGADO')) {
        problems.push(`${activity.id} ${event.id}: luz o háptico no están APAGADO donde TurnGate corta.`);
      }
      try {
        const face = translateExpression(event.reaction?.expression);
        if (!face || face.index < 0 || face.index > 27) {
          problems.push(`${activity.id} ${event.id}: la cara no está entre #0 y #27.`);
        }
      } catch (error) {
        problems.push(`${activity.id} ${event.id}: ${error.message}`);
      }
    }
  }
  if (byMode.LUA_SOLO !== 6) problems.push(`LUA_SOLO tiene ${byMode.LUA_SOLO}; hacen falta 6.`);
  if (byMode.SET_SOLO !== 11) problems.push(`SET_SOLO tiene ${byMode.SET_SOLO}; hacen falta 11.`);
  if (byMode.SET_WITH_LUA !== 11) problems.push(`SET_WITH_LUA tiene ${byMode.SET_WITH_LUA}; hacen falta 11.`);

  const worldIds = manifests.map((manifest) => manifest.id);
  if (worldIds.length !== STEAM_WORLD_IDS.length) {
    problems.push(`Hay ${worldIds.length} manifiestos; hacen falta ${STEAM_WORLD_IDS.length}.`);
  }
  for (const id of STEAM_WORLD_IDS) {
    if (!worldIds.includes(id)) problems.push(`Falta el manifiesto ${id}.`);
  }

  const issues = [
    ...validateSteamActivities(activities),
    ...manifests.flatMap((manifest) => validateWorldManifest(manifest)),
  ];
  for (const issue of issues) problems.push(`${issue.path} [${issue.rule}] ${issue.message}`);

  for (const manifest of manifests) {
    for (const challenge of manifest.challenges ?? []) {
      if (challenge.cycle?.observa?.mandatorySilenceSec !== 5) {
        problems.push(`${manifest.id} ${challenge.id} no tiene 5 s de silencio.`);
      }
    }
    if (manifest.revealLayer?.maxGlbKb !== 100) {
      problems.push(`${manifest.id} revealLayer.maxGlbKb no es 100.`);
    }
  }

  const adultNodes = [];
  walkAdult({ manifests, activities }, 'catalogo', adultNodes);
  for (const node of adultNodes) {
    for (const lang of ADULT_LANGS) {
      const text = node.value[lang];
      if (typeof text !== 'string' || text.trim() === '') {
        problems.push(`${node.trail} no tiene texto de adulto en ${lang}.`);
      }
    }
  }

  const strings = [];
  walkStrings({ manifests, activities }, 'catalogo', strings);
  for (const item of strings) {
    for (const hit of hitsIn(item.text)) {
      problems.push(`${item.trail}: «${hit.term}» (${hit.id})`);
    }
  }

  const started = process.hrtime.bigint();
  const results = runSyntheticReplay();
  const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
  if (elapsedMs >= REPLAY_BUDGET_MS) {
    problems.push(`ObservationReplay tardó ${elapsedMs.toFixed(1)} ms; el tope es ${REPLAY_BUDGET_MS} ms.`);
  }
  const failed = results.filter((result) => !result.passed);
  for (const result of failed) {
    problems.push(`Replay ${result.id} (${result.polarity}) no pasó: ${result.reason}.`);
  }
  const byWorld = new Map();
  for (const trace of SYNTHETIC_TRACES) {
    if (!byWorld.has(trace.worldId)) byWorld.set(trace.worldId, new Set());
    byWorld.get(trace.worldId).add(trace.polarity);
  }
  for (const polarity of REPLAY_POLARITIES) {
    const count = results.filter((result) => result.polarity === polarity && result.passed).length;
    if (count === 0) problems.push(`ObservationReplay no tiene un caso ${polarity} en verde.`);
  }
  for (const worldId of SET_WORLDS) {
    const polarities = byWorld.get(worldId);
    for (const polarity of REPLAY_POLARITIES) {
      if (!polarities || !polarities.has(polarity)) {
        problems.push(`ObservationReplay no cubre ${worldId} en ${polarity}.`);
      }
    }
  }

  if (problems.length) fail(problems);

  console.log(
    `✓ 28 actividades STEAM: validator, TurnGate, ciclo de 5 s, ObservationReplay (positiva, negativa, oclusión) en ${elapsedMs.toFixed(1)} ms, AdultText es/en/ca/gl sin términos prohibidos.`,
  );
}

module.exports = {
  assertFullCatalog,
  hitsIn,
  installTsRequire,
  loadTs,
};

if (require.main === module) assertFullCatalog();

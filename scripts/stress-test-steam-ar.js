#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Estrés adversarial de las 28 actividades STEAM (T4-B)
 *   node scripts/stress-test-steam-ar.js
 *
 * 1000 ciclos sobre AR-L01..06, AR-S00..11 y AR-SL00..11 (no hay S7):
 *   1. 9 fotogramas válidos y 1 perdido no confirman EventStabilizer.
 *   2. El turno verbal corta luz y háptico en el acto (0 fugas).
 *   3. Una caída de BLE a mitad de AR-SL01 o AR-SL10 no lanza.
 *   4. AR-S02 y AR-SL02 esperan 1000 ms antes de reaccionar o hablar.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const CYCLES = 1000;
const VALID_FRAMES = 9;
const LOST_FRAMES = 1;
const SILENCE_MS = 1000;
const BLE_DROP_IDS = ['AR-SL01', 'AR-SL10'];
const SILENCE_IDS = ['AR-S02', 'AR-SL02'];

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
  return require(path.join(ROOT, rel));
}

function fail(lines) {
  console.error(`\n✖ ${lines.length} fallo(s) en el estrés STEAM AR:`);
  for (const line of lines) console.error(`  ${line}`);
  process.exit(1);
}

function observation(activity, stamp) {
  const method = (activity.methods || []).find((item) => item && item !== 'adult_tap') || 'marker';
  return {
    method,
    markerId: 1,
    pieceCode: activity.id,
    positionSlot: 0,
    tMs: stamp,
  };
}

function silenceClock() {
  let elapsed = 0;
  let slept = 0;
  return {
    now() {
      if (slept < SILENCE_MS) {
        const error = new Error(`reacción a los ${slept} ms`);
        error.code = 'EARLY_REACTION';
        throw error;
      }
      return elapsed;
    },
    async sleep(ms) {
      const step = Number(ms);
      if (!Number.isFinite(step) || step < 0) {
        throw new Error(`pausa no finita: ${ms}`);
      }
      slept += step;
      elapsed += step;
    },
    elapsed() {
      return elapsed;
    },
    slept() {
      return slept;
    },
  };
}

function instantClock() {
  let elapsed = 0;
  return {
    now: () => elapsed,
    sleep: async (ms) => {
      elapsed += ms;
    },
    elapsed: () => elapsed,
  };
}

function loadActivities(problems) {
  const { STEAM_ACTIVITY_IDS } = loadTs('src/steam/types.ts');
  const { STEAM_ACTIVITIES } = loadTs('src/steam/worlds/index.ts');
  const ids = STEAM_ACTIVITIES.map((activity) => activity.id);
  if (STEAM_ACTIVITY_IDS.length !== 28) {
    problems.push(`El contrato de ids tiene ${STEAM_ACTIVITY_IDS.length}; hacen falta 28.`);
  }
  if (ids.length !== 28) {
    problems.push(`El catálogo tiene ${ids.length} actividades; hacen falta 28.`);
  }
  const seen = new Set(ids);
  if (seen.size !== ids.length) problems.push('Hay ids de actividad repetidos.');
  for (const id of STEAM_ACTIVITY_IDS) {
    if (!seen.has(id)) problems.push(`Falta la actividad ${id}.`);
  }
  for (const id of seen) {
    if (!STEAM_ACTIVITY_IDS.includes(id)) problems.push(`Id fuera del catálogo: ${id}.`);
  }
  if (ids.some((id) => id === 'AR-S07' || id === 'AR-SL07')) {
    problems.push('S7 no existe y no puede entrar en los 1000 ciclos.');
  }
  const byId = new Map(STEAM_ACTIVITIES.map((activity) => [activity.id, activity]));
  return { ids: STEAM_ACTIVITY_IDS, byId };
}

function proveTenFramesConfirm(EventStabilizer, activity, problems) {
  const fresh = new EventStabilizer();
  const base = observation(activity, 0);
  for (let frame = 0; frame < VALID_FRAMES; frame += 1) {
    const decision = fresh.push({ ...base, tMs: frame });
    if (decision.confirmed || decision.risingEdge) {
      problems.push(`${activity.id}: ${frame + 1} fotogramas válidos confirmaron el estabilizador.`);
      return false;
    }
  }
  const tenth = fresh.push({ ...base, tMs: VALID_FRAMES });
  if (!tenth.confirmed || !tenth.risingEdge) {
    problems.push(`${activity.id}: 10 fotogramas válidos no confirman; el caso de 9+1 no distingue un estabilizador mudo.`);
    return false;
  }
  return true;
}

function pushNinePlusOne(stabilizer, activity, cycle, problems) {
  const base = observation(activity, cycle);
  for (let frame = 0; frame < VALID_FRAMES; frame += 1) {
    const decision = stabilizer.push({ ...base, tMs: cycle * (VALID_FRAMES + LOST_FRAMES) + frame });
    if (decision.confirmed || decision.risingEdge || decision.framesHeld >= 10) {
      problems.push(
        `${activity.id} ciclo ${cycle}: ${frame + 1} fotogramas válidos confirmaron `
        + `(confirmed=${decision.confirmed}, risingEdge=${decision.risingEdge}, framesHeld=${decision.framesHeld}).`,
      );
      return false;
    }
  }
  const lost = stabilizer.push(null);
  if (lost.confirmed || lost.risingEdge) {
    problems.push(
      `${activity.id} ciclo ${cycle}: el fotograma perdido confirmó el estabilizador `
      + `(framesHeld=${lost.framesHeld}).`,
    );
    return false;
  }
  return true;
}

function cutVerbalTurn(applyTurnGate, activity, cycle, problems) {
  const events = activity.events || [];
  const event = events.length ? events[cycle % events.length] : null;
  const light = event && event.reaction && event.reaction.light && event.reaction.light !== 'APAGADO'
    ? event.reaction.light
    : 'DIR_DELANTE';
  const haptic = event && event.reaction && event.reaction.haptic && event.reaction.haptic !== 'APAGADO'
    ? event.reaction.haptic
    : 'CELEBRA_CORTO';
  const motor = applyTurnGate({
    turn: 'motor',
    light,
    haptic,
    ageYears: 5,
    isErrorOrBlockedState: false,
  });
  if (motor.blocked || motor.light !== light || motor.haptic !== haptic) {
    problems.push(`${activity.id} ciclo ${cycle}: el turno motor no conservó luz y háptico; el corte verbal no se puede medir.`);
    return false;
  }
  const verbal = applyTurnGate({
    turn: 'verbal',
    light: motor.light,
    haptic: motor.haptic,
    ageYears: 5,
    isErrorOrBlockedState: false,
  });
  const leak = verbal.light !== 'APAGADO' || verbal.haptic !== 'APAGADO' || verbal.blocked !== true
    || !verbal.reasons.includes('verbal');
  if (leak) {
    problems.push(
      `${activity.id} ciclo ${cycle}: fuga en turno verbal `
      + `(luz=${verbal.light}, háptico=${verbal.haptic}, blocked=${verbal.blocked}).`,
    );
    return false;
  }
  return true;
}

function linkInput(activity, event, bleConnected, sink) {
  return {
    mode: activity.mode,
    bleConnected,
    expression: event.reaction.expression,
    pictoKey: event.reaction.pictoKey,
    awardFamily: event.reaction.awardFamily,
    light: event.reaction.light,
    haptic: event.reaction.haptic,
    screenOverlay: event.reaction.screenOverlay,
    sink,
  };
}

async function dropBle(linkLua, runReactionSequence, activity, cycle, problems) {
  const events = activity.events || [];
  if (events.length < 2) {
    problems.push(`${activity.id} ciclo ${cycle}: no hay un punto medio entre eventos para cortar BLE.`);
    return false;
  }
  if (activity.mode !== 'SET_WITH_LUA') {
    problems.push(`${activity.id} no es SET_WITH_LUA; la caída de BLE no tiene espejo de Lúa.`);
    return false;
  }
  const cut = Math.floor(events.length / 2);
  let connected = true;
  let leakedFrames = 0;
  for (let index = 0; index < events.length; index += 1) {
    if (index === cut) connected = false;
    const sink = () => {
      if (!connected) leakedFrames += 1;
    };
    let projection;
    try {
      projection = linkLua(linkInput(activity, events[index], connected, sink));
    } catch (error) {
      problems.push(`${activity.id} ciclo ${cycle} ${events[index].id}: la caída de BLE lanzó ${error.message}`);
      return false;
    }
    if (!connected) {
      if (projection.degradedToMirror !== true || projection.emitted !== false) {
        problems.push(
          `${activity.id} ciclo ${cycle} ${events[index].id}: BLE caído no degradó al espejo `
          + `(degraded=${projection.degradedToMirror}, emitted=${projection.emitted}).`,
        );
        return false;
      }
      const mirror = projection.mirror;
      if (!mirror || mirror.surface !== 'catPixel' || mirror.widget !== 'CatPixel' || mirror.glb !== 'lua.glb') {
        problems.push(`${activity.id} ciclo ${cycle} ${events[index].id}: el espejo en pantalla no es CatPixel.`);
        return false;
      }
    }
  }
  if (leakedFrames !== 0) {
    problems.push(`${activity.id} ciclo ${cycle}: BLE caído emitió ${leakedFrames} trama(s).`);
    return false;
  }
  const dropped = events[cut];
  try {
    const trace = await runReactionSequence({
      mode: activity.mode,
      bleConnected: false,
      worldId: activity.worldId,
      activityId: activity.id,
      event: dropped,
      lang: 'es',
      ageYears: 5,
      clock: instantClock(),
      sink: () => {
        leakedFrames += 1;
      },
    });
    if (!trace.link || trace.link.degradedToMirror !== true || trace.link.emitted !== false) {
      problems.push(`${activity.id} ciclo ${cycle} ${dropped.id}: la secuencia no degradó al espejo tras la caída.`);
      return false;
    }
  } catch (error) {
    problems.push(`${activity.id} ciclo ${cycle} ${dropped.id}: excepción no capturada en la secuencia (${error.message}).`);
    return false;
  }
  if (leakedFrames !== 0) {
    problems.push(`${activity.id} ciclo ${cycle}: la secuencia emitió BLE con el enlace caído.`);
    return false;
  }
  return true;
}

async function assertSilence(runReactionSequence, activity, cycle, problems) {
  const events = activity.events || [];
  if (!events.length) {
    problems.push(`${activity.id} ciclo ${cycle}: no hay eventos para medir los 1000 ms.`);
    return false;
  }
  for (const event of events) {
    const clock = silenceClock();
    let reactionAt = null;
    try {
      const trace = await runReactionSequence({
        mode: activity.mode,
        bleConnected: true,
        worldId: activity.worldId,
        activityId: activity.id,
        event,
        lang: 'es',
        ageYears: 5,
        clock,
        sink: () => {
          reactionAt = clock.elapsed();
        },
      });
      if (trace.pauseMs < SILENCE_MS || trace.set2 !== true || clock.elapsed() < SILENCE_MS || clock.slept() < SILENCE_MS) {
        problems.push(
          `${activity.id} ciclo ${cycle} ${event.id}: pausa ${trace.pauseMs} ms, `
          + `reloj ${clock.elapsed()} ms, dormido ${clock.slept()} ms.`,
        );
        return false;
      }
      if (activity.mode === 'SET_WITH_LUA' && (reactionAt === null || reactionAt < SILENCE_MS)) {
        problems.push(`${activity.id} ciclo ${cycle} ${event.id}: la reacción salió a los ${reactionAt} ms.`);
        return false;
      }
      const tpr = (event.word && event.word.englishTpr ? event.word.englishTpr : '').trim();
      if (event.turn === 'motor' && tpr && trace.prompt.tabletMaySpeak !== true) {
        problems.push(`${activity.id} ciclo ${cycle} ${event.id}: la voz no quedó autorizada después de los 1000 ms.`);
        return false;
      }
      if (trace.prompt.tabletMaySpeak === true && clock.elapsed() < SILENCE_MS) {
        problems.push(`${activity.id} ciclo ${cycle} ${event.id}: la voz salió antes de los 1000 ms.`);
        return false;
      }
    } catch (error) {
      const early = error && error.code === 'EARLY_REACTION';
      problems.push(
        early
          ? `${activity.id} ciclo ${cycle} ${event.id}: ${error.message}, antes de los 1000 ms.`
          : `${activity.id} ciclo ${cycle} ${event.id}: ${error.message}`,
      );
      return false;
    }
  }
  return true;
}

async function main() {
  const started = Date.now();
  const problems = [];
  const { EventStabilizer, VISUAL_STABLE_FRAMES } = loadTs('src/steam/engine/EventStabilizer.ts');
  const { applyTurnGate } = loadTs('src/steam/engine/TurnGate.ts');
  const { linkLua } = loadTs('src/steam/engine/LuaLink.ts');
  const { runReactionSequence, SET2_PAUSE_BEFORE_REACTION_MS } = loadTs('src/steam/engine/ReactionSequencer.ts');
  const { runSyntheticReplay } = loadTs('src/steam/engine/ObservationReplay.ts');

  if (VISUAL_STABLE_FRAMES !== 10) {
    problems.push(`EventStabilizer confirma a los ${VISUAL_STABLE_FRAMES} fotogramas; la ventana del contrato es 10.`);
  }
  if (SET2_PAUSE_BEFORE_REACTION_MS !== SILENCE_MS) {
    problems.push(`La pausa de Set 2 es ${SET2_PAUSE_BEFORE_REACTION_MS} ms; el silencio exigido es ${SILENCE_MS} ms.`);
  }

  const { ids, byId } = loadActivities(problems);
  if (problems.length) fail(problems);

  const activities = ids.map((id) => byId.get(id));
  for (const id of BLE_DROP_IDS.concat(SILENCE_IDS)) {
    if (!byId.has(id)) problems.push(`Falta ${id} para el estrés.`);
  }
  if (problems.length) fail(problems);

  const stabilizers = new Map();
  let occlusionChecks = 0;
  let verbalChecks = 0;
  let bleChecks = 0;
  let silenceChecks = 0;
  let replayChecks = 0;
  const stopped = new Set();

  for (const activity of activities) {
    if (!proveTenFramesConfirm(EventStabilizer, activity, problems)) {
      stopped.add(`occ:${activity.id}`);
    }
  }
  if (problems.length) fail(problems);

  for (let cycle = 0; cycle < CYCLES; cycle += 1) {
    for (const activity of activities) {
      const occKey = `occ:${activity.id}`;
      if (!stopped.has(occKey)) {
        let stabilizer = stabilizers.get(activity.id);
        if (!stabilizer) {
          stabilizer = new EventStabilizer();
          stabilizers.set(activity.id, stabilizer);
        }
        if (pushNinePlusOne(stabilizer, activity, cycle, problems)) occlusionChecks += 1;
        else stopped.add(occKey);
      }
      const turnKey = `turn:${activity.id}`;
      if (!stopped.has(turnKey)) {
        if (cutVerbalTurn(applyTurnGate, activity, cycle, problems)) verbalChecks += 1;
        else stopped.add(turnKey);
      }
    }

    for (const id of BLE_DROP_IDS) {
      const key = `ble:${id}`;
      if (stopped.has(key)) continue;
      if (await dropBle(linkLua, runReactionSequence, byId.get(id), cycle, problems)) bleChecks += 1;
      else stopped.add(key);
    }

    for (const id of SILENCE_IDS) {
      const key = `silence:${id}`;
      if (stopped.has(key)) continue;
      if (await assertSilence(runReactionSequence, byId.get(id), cycle, problems)) silenceChecks += 1;
      else stopped.add(key);
    }

    if (!stopped.has('replay')) {
      const results = runSyntheticReplay();
      const broken = results.filter((result) => !result.passed);
      if (broken.length) {
        stopped.add('replay');
        problems.push(
          `ObservationReplay ciclo ${cycle}: ${broken.map((result) => `${result.id} (${result.reason})`).join(', ')}.`,
        );
      } else {
        replayChecks += 1;
      }
    }

    if (stopped.size && problems.length > 12) break;
  }

  const expectedActivities = activities.length * CYCLES;
  if (occlusionChecks !== expectedActivities) {
    problems.push(`Oclusión 9+1: ${occlusionChecks} comprobaciones; hacen falta ${expectedActivities}.`);
  }
  if (verbalChecks !== expectedActivities) {
    problems.push(`Turno verbal: ${verbalChecks} comprobaciones; hacen falta ${expectedActivities}.`);
  }
  if (bleChecks !== BLE_DROP_IDS.length * CYCLES) {
    problems.push(`Caída BLE: ${bleChecks} comprobaciones; hacen falta ${BLE_DROP_IDS.length * CYCLES}.`);
  }
  if (silenceChecks !== SILENCE_IDS.length * CYCLES) {
    problems.push(`Silencio de 1000 ms: ${silenceChecks} comprobaciones; hacen falta ${SILENCE_IDS.length * CYCLES}.`);
  }
  if (replayChecks !== CYCLES) {
    problems.push(`ObservationReplay: ${replayChecks} ciclos; hacen falta ${CYCLES}.`);
  }
  if (problems.length) fail(problems);

  const elapsed = Date.now() - started;
  console.log(
    `✓ ${activities.length} actividades × ${CYCLES} ciclos en ${elapsed} ms: `
    + '9 fotogramas válidos y 1 perdido no confirman el estabilizador; '
    + 'el turno verbal corta luz y háptico (0 fugas); '
    + 'BLE caído en AR-SL01 y AR-SL10 degrada al espejo sin excepción; '
    + 'AR-S02 y AR-SL02 esperan 1000 ms antes de reaccionar o hablar.',
  );
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});

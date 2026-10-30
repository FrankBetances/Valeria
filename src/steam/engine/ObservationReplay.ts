// Reproductor de trazas sintéticas (T2-A).
// Positiva, negativa y oclusión parcial. Solo magnitudes inventadas:
// no hay sesiones, imágenes ni identificadores de personas.
import type { Observation, SteamWorldId, WorldEventId } from '../types';
import {
  CAUSAL_SEQUENCES,
  type CausalWorldId,
  type ChallengeInput,
  type ChallengeReason,
  type ChallengeRule,
  type MomentArm,
  type PathGraph,
  evaluateChallenge,
} from './ChallengeEvaluator';
import { ADULT_TAP_FRAMES, VISUAL_STABLE_FRAMES, EventStabilizer } from './EventStabilizer';

export type TracePolarity = 'positive' | 'negative' | 'partial_occlusion';

export interface ObservationTrace {
  readonly id: string;
  readonly polarity: TracePolarity;
  readonly worldId: SteamWorldId;
  readonly frames: readonly (Observation | null)[];
  readonly challenge: ChallengeInput;
  readonly expect: {
    readonly eventConfirmed: boolean;
    readonly challengeOk: boolean;
  };
}

export interface ObservationReplayResult {
  readonly id: string;
  readonly polarity: TracePolarity;
  readonly worldId: SteamWorldId;
  readonly eventConfirmed: boolean;
  readonly challengeOk: boolean;
  readonly passed: boolean;
  readonly framesHeld: number;
  readonly rule: ChallengeRule;
  readonly reason: ChallengeReason | 'mundo_distinto';
}

const FRAME_MS = 1000 / 30;

function sight(base: Omit<Observation, 'tMs'>, index: number): Observation {
  return { ...base, tMs: Math.round(index * FRAME_MS) };
}

function stableRun(base: Omit<Observation, 'tMs'>, count: number): Observation[] {
  return Array.from({ length: count }, (_, index) => sight(base, index));
}

/** 9 fotogramas válidos y 1 perdido, dos veces. La racha no llega a 10. */
function partialOcclusion(base: Omit<Observation, 'tMs'>): (Observation | null)[] {
  const frames: (Observation | null)[] = [];
  let index = 0;
  for (let cycle = 0; cycle < 2; cycle += 1) {
    for (let step = 0; step < VISUAL_STABLE_FRAMES - 1; step += 1) {
      frames.push(sight(base, index));
      index += 1;
    }
    frames.push(null);
    index += 1;
  }
  return frames;
}

function linearPath(
  ids: readonly [string, string, string, string],
  headings: readonly [number, number, number, number],
  breakLink: boolean,
): PathGraph {
  const [a, b, c, d] = ids;
  const [ha, hb, hc, hd] = headings;
  return {
    startId: a,
    goalId: d,
    nodes: [
      { id: a, headingDeg: ha, links: [b] },
      { id: b, headingDeg: hb, links: breakLink ? [a] : [a, c] },
      { id: c, headingDeg: hc, links: [b, d] },
      { id: d, headingDeg: hd, links: [c] },
    ],
  };
}

const BALANCED_ARMS: readonly MomentArm[] = [
  { massG: 40, distanceSlots: 2, side: 'left' },
  { massG: 20, distanceSlots: 4, side: 'right' },
];

function causalStates(worldId: CausalWorldId): readonly WorldEventId[] {
  return CAUSAL_SEQUENCES[worldId][0];
}

function marker(pieceCode: string, markerId: number): Omit<Observation, 'tMs'> {
  return { method: 'marker', pieceCode, markerId };
}

interface TraceDraft {
  readonly id: string;
  readonly polarity: TracePolarity;
  readonly worldId: SteamWorldId;
  readonly base: Omit<Observation, 'tMs'>;
  readonly challenge: ChallengeInput;
  readonly expectConfirmed: boolean;
  readonly expectChallengeOk: boolean;
}

function materialize(draft: TraceDraft): ObservationTrace {
  const frames = draft.polarity === 'partial_occlusion'
    ? partialOcclusion(draft.base)
    : draft.base.method === 'adult_tap'
      ? [sight(draft.base, 0)]
      : stableRun(draft.base, VISUAL_STABLE_FRAMES);
  return {
    id: draft.id,
    polarity: draft.polarity,
    worldId: draft.worldId,
    frames,
    challenge: draft.challenge,
    expect: {
      eventConfirmed: draft.expectConfirmed,
      challengeOk: draft.expectChallengeOk,
    },
  };
}

function family(
  worldId: SteamWorldId,
  base: Omit<Observation, 'tMs'>,
  positive: ChallengeInput,
  negative: ChallengeInput,
): ObservationTrace[] {
  return [
    materialize({
      id: `${worldId}-positiva`,
      polarity: 'positive',
      worldId,
      base,
      challenge: positive,
      expectConfirmed: true,
      expectChallengeOk: true,
    }),
    materialize({
      id: `${worldId}-negativa`,
      polarity: 'negative',
      worldId,
      base,
      challenge: negative,
      expectConfirmed: true,
      expectChallengeOk: false,
    }),
    materialize({
      id: `${worldId}-oclusion-parcial`,
      polarity: 'partial_occlusion',
      worldId,
      base,
      challenge: positive,
      expectConfirmed: false,
      expectChallengeOk: true,
    }),
  ];
}

function buildSyntheticTraces(): readonly ObservationTrace[] {
  const s1Positive = linearPath(['inicio', 'recta', 'curva', 'meta'], [0, 0, 90, 90], false);
  const s1Negative = linearPath(['inicio', 'recta', 'curva', 'meta'], [0, 0, 45, 45], false);
  const s11Positive = linearPath(['estacion', 'tramo', 'curva', 'anden'], [0, 0, 90, 90], false);
  const s11Negative = linearPath(['estacion', 'tramo', 'curva', 'anden'], [0, 0, 90, 90], true);

  const percussorOk: ChallengeInput = {
    kind: 'percussor',
    worldId: 'S2',
    strikes: [
      { angleDeg: 60, tMs: 0 },
      { angleDeg: 20, tMs: 500 },
      { angleDeg: 60, tMs: 1000 },
      { angleDeg: 20, tMs: 1500 },
    ],
    pattern: ['fuerte', 'debil', 'fuerte', 'debil'],
  };
  const percussorBad: ChallengeInput = {
    kind: 'percussor',
    worldId: 'S2',
    strikes: [
      { angleDeg: 60, tMs: 0 },
      { angleDeg: 20, tMs: 100 },
      { angleDeg: 60, tMs: 1000 },
    ],
  };

  const traces: ObservationTrace[] = [
    ...family('S1', marker('S1-REC-LIS-G', 11), { kind: 'path', worldId: 'S1', graph: s1Positive }, { kind: 'path', worldId: 'S1', graph: s1Negative }),
    ...family('S11', marker('S11-TRE-VIAS', 111), { kind: 'path', worldId: 'S11', graph: s11Positive }, { kind: 'path', worldId: 'S11', graph: s11Negative }),
    ...family('S2', marker('S2-BAL-BRAZO-E', 22), percussorOk, percussorBad),
    ...family('S3', marker('S3-ESF-LIS-G', 33), { kind: 'descent', worldId: 'S3', timesMs: [900, 600, 400] }, { kind: 'descent', worldId: 'S3', timesMs: [500, 500] }),
    ...family('S9', marker('S9-BOM-RAMPA', 93), { kind: 'descent', worldId: 'S9', timesMs: [800, 500] }, { kind: 'descent', worldId: 'S9', timesMs: [300, 450] }),
    ...family(
      'S5',
      marker('S5-VIG-G', 55),
      { kind: 'balance', worldId: 'S5', arms: BALANCED_ARMS, thetaDeg: 1.5 },
      { kind: 'balance', worldId: 'S5', arms: BALANCED_ARMS, thetaDeg: 1.51 },
    ),
    ...family('S0', marker('K-ZOCALO-G', 1), { kind: 'causal', worldId: 'S0', states: causalStates('S0') }, {
      kind: 'causal',
      worldId: 'S0',
      states: ['S0.PLACA_LEIDA', 'S0.LUA_EN_ZOCALO', 'S0.CABEZA_ENCAJADA'],
    }),
    ...family('S4', marker('S4-ROT-E', 44), { kind: 'causal', worldId: 'S4', states: causalStates('S4') }, {
      kind: 'causal',
      worldId: 'S4',
      states: ['S4.PRAXIA_REDONDEO', 'S4.ROTOR_GIRA', 'S4.COMPUERTA_PESADA'],
    }),
    ...family('S6', marker('S6-TAL-G', 66), { kind: 'causal', worldId: 'S6', states: causalStates('S6') }, {
      kind: 'causal',
      worldId: 'S6',
      states: ['S6.FLORECE', 'S6.SIEMBRA', 'S6.RIEGO', 'S6.BROTE', 'S6.SOMBRA_ALINEADA', 'S6.NOCHE'],
    }),
    ...family('S8', marker('S8-BARRERA', 88), { kind: 'causal', worldId: 'S8', states: causalStates('S8') }, {
      kind: 'causal',
      worldId: 'S8',
      states: ['S8.PEATON_CRUZA', 'S8.BARRERA_BAJA', 'S8.BARRERA_SUBE', 'S8.ROTONDA_COMPLETA'],
    }),
    ...family('S10', marker('S10-HOS-CAMI', 100), { kind: 'causal', worldId: 'S10', states: causalStates('S10') }, {
      kind: 'causal',
      worldId: 'S10',
      states: ['S10.ALTA_FELIZ', 'S10.LLEGADA_RAMPA', 'S10.LUA_EN_CAMILLA', 'S10.LATIDO_CALMO'],
    }),
  ];

  traces.push(materialize({
    id: 'adult-tap-un-fotograma',
    polarity: 'positive',
    worldId: 'S0',
    base: { method: 'adult_tap' },
    challenge: { kind: 'causal', worldId: 'S0', states: causalStates('S0') },
    expectConfirmed: true,
    expectChallengeOk: true,
  }));

  const adult = traces[traces.length - 1];
  if (adult.frames.length !== ADULT_TAP_FRAMES) {
    throw new Error('adult_tap tiene que ocupar un solo fotograma en la traza sintética.');
  }
  return traces;
}

export const SYNTHETIC_TRACES: readonly ObservationTrace[] = buildSyntheticTraces();

export function replayTrace(trace: ObservationTrace): ObservationReplayResult {
  const stabilizer = new EventStabilizer();
  let eventConfirmed = false;
  let framesHeld = 0;
  for (const frame of trace.frames) {
    const decision = stabilizer.push(frame);
    framesHeld = decision.framesHeld;
    if (decision.risingEdge) eventConfirmed = true;
  }

  const aligned = trace.challenge.worldId === trace.worldId;
  const verdict = evaluateChallenge(trace.challenge);
  const challengeOk = aligned && verdict.ok;
  const passed = aligned
    && eventConfirmed === trace.expect.eventConfirmed
    && challengeOk === trace.expect.challengeOk;

  return {
    id: trace.id,
    polarity: trace.polarity,
    worldId: trace.worldId,
    eventConfirmed,
    challengeOk,
    passed,
    framesHeld,
    rule: verdict.rule,
    reason: aligned ? verdict.reason : 'mundo_distinto',
  };
}

export function runSyntheticReplay(
  traces: readonly ObservationTrace[] = SYNTHETIC_TRACES,
): readonly ObservationReplayResult[] {
  return traces.map(replayTrace);
}

export function syntheticReplayFailures(
  results: readonly ObservationReplayResult[] = runSyntheticReplay(),
): readonly ObservationReplayResult[] {
  return results.filter((result) => !result.passed);
}

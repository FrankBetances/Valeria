// Evaluadores deterministas de los retos STEAM (T2-A).
// S1/S11: grafo continuo y giros de 90°. S2: ángulo del percutor y ritmo.
// S3/S9: cada bajada cumple t_n < t_{n-1}. S5: Σ m·d iguales y |theta| <= 1.5°.
// S0, S4, S6, S8 y S10: la secuencia de estados es exactamente la causal.
import type { WorldEventId } from '../types';

export const RIGHT_ANGLE_TOLERANCE_DEG = 0.5;
export const BALANCE_THETA_MAX_DEG = 1.5;
/** Por debajo, el brazo no ha golpeado. */
export const WEAK_STRIKE_MIN_DEG = 15;
/** Desde aquí el golpe es fuerte. Entre los dos umbrales, débil. */
export const STRONG_STRIKE_MIN_DEG = 45;
/** Los intervalos de una secuencia rítmica no se separan más que esto. */
export const RHYTHM_INTERVAL_TOLERANCE_RATIO = 0.05;

export const CAUSAL_SEQUENCES = {
  S0: [
    ['S0.CABEZA_ENCAJADA', 'S0.LUA_EN_ZOCALO', 'S0.PLACA_LEIDA'],
  ],
  S4: [
    ['S4.PRAXIA_REDONDEO', 'S4.ROTOR_GIRA', 'S4.COMPUERTA_LIGERA'],
    ['S4.PRAXIA_REDONDEO', 'S4.MOLINETE_GIRA', 'S4.COMPUERTA_LIGERA'],
  ],
  S6: [
    ['S6.SIEMBRA', 'S6.RIEGO', 'S6.BROTE', 'S6.SOMBRA_ALINEADA', 'S6.FLORECE', 'S6.NOCHE'],
  ],
  S8: [
    ['S8.BARRERA_BAJA', 'S8.PEATON_CRUZA', 'S8.BARRERA_SUBE', 'S8.ROTONDA_COMPLETA'],
  ],
  S10: [
    ['S10.LLEGADA_RAMPA', 'S10.LUA_EN_CAMILLA', 'S10.LATIDO_CALMO', 'S10.ALTA_FELIZ'],
  ],
} as const;

export type CausalWorldId = keyof typeof CAUSAL_SEQUENCES;

type CausalEventExact = (typeof CAUSAL_SEQUENCES)[CausalWorldId][number][number] extends WorldEventId
  ? true
  : never;
export const causalEventsAreWorldEventIds: CausalEventExact = true;

export type PathWorldId = 'S1' | 'S11';
export type DescentWorldId = 'S3' | 'S9';
export type EvaluatedWorldId = PathWorldId | 'S2' | DescentWorldId | 'S5' | CausalWorldId;
export type ChallengeRule = 'path' | 'percussor' | 'descent' | 'balance' | 'causal';
export type PercussorHit = 'fuerte' | 'debil';
export type LeverSide = 'left' | 'right';

export type ChallengeReason =
  | 'ok'
  | 'nodo_duplicado'
  | 'nodo_ausente'
  | 'origen_es_meta'
  | 'angulo_no_finito'
  | 'giro_distinto_de_90'
  | 'grafo_discontinuo'
  | 'falta_golpes'
  | 'golpe_no_finito'
  | 'brazo_en_reposo'
  | 'sin_contraste_de_angulo'
  | 'secuencia_ritmica_distinta'
  | 'ritmo_inestable'
  | 'tiempo_no_finito'
  | 'falta_comparacion'
  | 'bajada_no_estrictamente_menor'
  | 'sin_masas'
  | 'masa_no_valida'
  | 'distancia_no_valida'
  | 'momentos_distintos'
  | 'inclinacion_no_finita'
  | 'inclinacion_fuera_de_tolerancia'
  | 'secuencia_incompleta'
  | 'secuencia_distinta';

export interface ChallengeVerdict {
  readonly ok: boolean;
  readonly worldId: EvaluatedWorldId;
  readonly rule: ChallengeRule;
  readonly reason: ChallengeReason;
  readonly leftMoment?: number;
  readonly rightMoment?: number;
  readonly thetaDeg?: number;
}

export interface PathNode {
  readonly id: string;
  readonly headingDeg: number;
  readonly links: readonly string[];
}

export interface PathGraph {
  readonly startId: string;
  readonly goalId: string;
  readonly nodes: readonly PathNode[];
}

export interface HammerStrike {
  readonly angleDeg: number;
  readonly tMs: number;
}

export interface MomentArm {
  readonly massG: number;
  /** Alvéolo 1..5. La distancia es ese paso (31,8 mm por unidad). */
  readonly distanceSlots: number;
  readonly side: LeverSide;
}

export interface PathChallenge {
  readonly kind: 'path';
  readonly worldId: PathWorldId;
  readonly graph: PathGraph;
}

export interface PercussorChallenge {
  readonly kind: 'percussor';
  readonly worldId: 'S2';
  readonly strikes: readonly HammerStrike[];
  readonly pattern?: readonly PercussorHit[];
}

export interface DescentChallenge {
  readonly kind: 'descent';
  readonly worldId: DescentWorldId;
  readonly timesMs: readonly number[];
}

export interface BalanceChallenge {
  readonly kind: 'balance';
  readonly worldId: 'S5';
  readonly arms: readonly MomentArm[];
  readonly thetaDeg: number;
}

export interface CausalChallenge {
  readonly kind: 'causal';
  readonly worldId: CausalWorldId;
  readonly states: readonly WorldEventId[];
}

export type ChallengeInput =
  | PathChallenge
  | PercussorChallenge
  | DescentChallenge
  | BalanceChallenge
  | CausalChallenge;

function verdict(
  ok: boolean,
  worldId: EvaluatedWorldId,
  rule: ChallengeRule,
  reason: ChallengeReason,
  extra?: Pick<ChallengeVerdict, 'leftMoment' | 'rightMoment' | 'thetaDeg'>,
): ChallengeVerdict {
  return { ok, worldId, rule, reason, ...extra };
}

/** Diferencia plegada a (-180, 180]. 270° y -90° son el mismo giro. */
export function wrapSignedDeg(deltaDeg: number): number {
  const wrapped = (((deltaDeg + 180) % 360) + 360) % 360 - 180;
  return wrapped === 0 ? 0 : wrapped;
}

export function isRightAngleTurn(fromDeg: number, toDeg: number): boolean {
  if (!Number.isFinite(fromDeg) || !Number.isFinite(toDeg)) return false;
  const abs = Math.abs(wrapSignedDeg(toDeg - fromDeg));
  if (abs <= RIGHT_ANGLE_TOLERANCE_DEG) return true;
  return Math.abs(abs - 90) <= RIGHT_ANGLE_TOLERANCE_DEG;
}

export function classifyPercussorAngle(angleDeg: number): PercussorHit | 'reposo' {
  const magnitude = Math.abs(angleDeg);
  if (magnitude >= STRONG_STRIKE_MIN_DEG) return 'fuerte';
  if (magnitude >= WEAK_STRIKE_MIN_DEG) return 'debil';
  return 'reposo';
}

export function staticMoment(massG: number, distanceSlots: number): number {
  return massG * distanceSlots;
}

export function sumMoments(arms: readonly MomentArm[], side: LeverSide): number {
  let sum = 0;
  for (const arm of arms) {
    if (arm.side === side) sum += staticMoment(arm.massG, arm.distanceSlots);
  }
  return sum;
}

export function evaluatePathContinuity(input: PathChallenge): ChallengeVerdict {
  const { worldId, graph } = input;
  const byId = new Map<string, PathNode>();
  for (const node of graph.nodes) {
    if (byId.has(node.id)) return verdict(false, worldId, 'path', 'nodo_duplicado');
    if (!Number.isFinite(node.headingDeg)) return verdict(false, worldId, 'path', 'angulo_no_finito');
    byId.set(node.id, node);
  }

  const start = byId.get(graph.startId);
  const goal = byId.get(graph.goalId);
  if (!start || !goal) return verdict(false, worldId, 'path', 'nodo_ausente');
  if (start.id === goal.id) return verdict(false, worldId, 'path', 'origen_es_meta');

  const queue: PathNode[] = [start];
  const seen = new Set<string>([start.id]);
  let blockedByAngle = false;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    for (const nextId of current.links) {
      const next = byId.get(nextId);
      if (!next || !next.links.includes(current.id)) continue;
      if (!isRightAngleTurn(current.headingDeg, next.headingDeg)) {
        blockedByAngle = true;
        continue;
      }
      if (next.id === goal.id) return verdict(true, worldId, 'path', 'ok');
      if (!seen.has(next.id)) {
        seen.add(next.id);
        queue.push(next);
      }
    }
  }

  return verdict(false, worldId, 'path', blockedByAngle ? 'giro_distinto_de_90' : 'grafo_discontinuo');
}

export function evaluatePercussor(input: PercussorChallenge): ChallengeVerdict {
  const worldId = input.worldId;
  if (input.strikes.length < 2) return verdict(false, worldId, 'percussor', 'falta_golpes');

  const ordered = [...input.strikes].sort((a, b) => a.tMs - b.tMs);
  const hits: PercussorHit[] = [];
  for (const strike of ordered) {
    if (!Number.isFinite(strike.angleDeg) || !Number.isFinite(strike.tMs)) {
      return verdict(false, worldId, 'percussor', 'golpe_no_finito');
    }
    const hit = classifyPercussorAngle(strike.angleDeg);
    if (hit === 'reposo') return verdict(false, worldId, 'percussor', 'brazo_en_reposo');
    hits.push(hit);
  }

  let strong = false;
  let weak = false;
  for (const hit of hits) {
    if (hit === 'fuerte') strong = true;
    if (hit === 'debil') weak = true;
  }
  if (!strong || !weak) return verdict(false, worldId, 'percussor', 'sin_contraste_de_angulo');

  if (input.pattern) {
    if (input.pattern.length !== hits.length) {
      return verdict(false, worldId, 'percussor', 'secuencia_ritmica_distinta');
    }
    for (let index = 0; index < hits.length; index += 1) {
      if (hits[index] !== input.pattern[index]) {
        return verdict(false, worldId, 'percussor', 'secuencia_ritmica_distinta');
      }
    }
  }

  const intervals: number[] = [];
  for (let index = 1; index < ordered.length; index += 1) {
    const dt = ordered[index].tMs - ordered[index - 1].tMs;
    if (!(dt > 0)) return verdict(false, worldId, 'percussor', 'ritmo_inestable');
    intervals.push(dt);
  }
  const min = Math.min(...intervals);
  const max = Math.max(...intervals);
  if ((max - min) / min > RHYTHM_INTERVAL_TOLERANCE_RATIO) {
    return verdict(false, worldId, 'percussor', 'ritmo_inestable');
  }

  return verdict(true, worldId, 'percussor', 'ok');
}

export function evaluateDescentTimes(input: DescentChallenge): ChallengeVerdict {
  const { worldId, timesMs } = input;
  if (timesMs.length < 2) return verdict(false, worldId, 'descent', 'falta_comparacion');
  for (const time of timesMs) {
    if (!Number.isFinite(time) || time <= 0) return verdict(false, worldId, 'descent', 'tiempo_no_finito');
  }
  for (let index = 1; index < timesMs.length; index += 1) {
    if (!(timesMs[index] < timesMs[index - 1])) {
      return verdict(false, worldId, 'descent', 'bajada_no_estrictamente_menor');
    }
  }
  return verdict(true, worldId, 'descent', 'ok');
}

function armIsValid(arm: MomentArm): ChallengeReason | null {
  if (!Number.isFinite(arm.massG) || arm.massG <= 0) return 'masa_no_valida';
  if (!Number.isInteger(arm.distanceSlots) || arm.distanceSlots < 1 || arm.distanceSlots > 5) {
    return 'distancia_no_valida';
  }
  if (arm.side !== 'left' && arm.side !== 'right') return 'masa_no_valida';
  return null;
}

export function evaluateStaticBalance(input: BalanceChallenge): ChallengeVerdict {
  const worldId = input.worldId;
  if (input.arms.length === 0) return verdict(false, worldId, 'balance', 'sin_masas');
  for (const arm of input.arms) {
    const reason = armIsValid(arm);
    if (reason) return verdict(false, worldId, 'balance', reason);
  }
  if (!Number.isFinite(input.thetaDeg)) {
    return verdict(false, worldId, 'balance', 'inclinacion_no_finita', { thetaDeg: input.thetaDeg });
  }

  const leftMoment = sumMoments(input.arms, 'left');
  const rightMoment = sumMoments(input.arms, 'right');
  const extra = { leftMoment, rightMoment, thetaDeg: input.thetaDeg };
  if (leftMoment !== rightMoment) return verdict(false, worldId, 'balance', 'momentos_distintos', extra);
  if (Math.abs(input.thetaDeg) > BALANCE_THETA_MAX_DEG) {
    return verdict(false, worldId, 'balance', 'inclinacion_fuera_de_tolerancia', extra);
  }
  return verdict(true, worldId, 'balance', 'ok', extra);
}

function sameSequence(observed: readonly string[], accepted: readonly string[]): boolean {
  if (observed.length !== accepted.length) return false;
  for (let index = 0; index < observed.length; index += 1) {
    if (observed[index] !== accepted[index]) return false;
  }
  return true;
}

function isProperPrefix(observed: readonly string[], accepted: readonly string[]): boolean {
  if (observed.length === 0 || observed.length >= accepted.length) return false;
  for (let index = 0; index < observed.length; index += 1) {
    if (observed[index] !== accepted[index]) return false;
  }
  return true;
}

export function evaluateCausalSequence(input: CausalChallenge): ChallengeVerdict {
  const sequences = CAUSAL_SEQUENCES[input.worldId];
  for (const sequence of sequences) {
    if (sameSequence(input.states, sequence)) return verdict(true, input.worldId, 'causal', 'ok');
  }
  if (input.states.length === 0 || sequences.some((sequence) => isProperPrefix(input.states, sequence))) {
    return verdict(false, input.worldId, 'causal', 'secuencia_incompleta');
  }
  return verdict(false, input.worldId, 'causal', 'secuencia_distinta');
}

export function evaluateChallenge(input: ChallengeInput): ChallengeVerdict {
  switch (input.kind) {
    case 'path':
      return evaluatePathContinuity(input);
    case 'percussor':
      return evaluatePercussor(input);
    case 'descent':
      return evaluateDescentTimes(input);
    case 'balance':
      return evaluateStaticBalance(input);
    case 'causal':
      return evaluateCausalSequence(input);
  }
}

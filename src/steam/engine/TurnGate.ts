// TurnGate (T2-B). En turno verbal, en error o por debajo de 3 años
// (I1–I3) la luz y el háptico quedan APAGADO. No hay opcode BLE para
// ninguno de los dos: esto solo corta el espejo de la tableta.
import type { HapticPattern, LightPattern, NeuroStage, WorldChallengeSpec } from '../types';

export const UNDER_THREE_STAGES = ['I1', 'I2', 'I3'] as const satisfies readonly NeuroStage[];

export type TurnGateReason = 'verbal' | 'error' | 'under_three';

export interface TurnGateInput {
  turn: 'motor' | 'verbal';
  isErrorOrBlockedState?: boolean;
  ageYears?: number;
  neuroStage?: NeuroStage;
  ageBand?: WorldChallengeSpec['ageBand'];
  light: LightPattern;
  haptic: HapticPattern;
}

export interface TurnGateDecision {
  readonly light: LightPattern;
  readonly haptic: HapticPattern;
  readonly blocked: boolean;
  readonly reasons: readonly TurnGateReason[];
}

export function isUnderThree(input: {
  ageYears?: number;
  neuroStage?: NeuroStage;
  ageBand?: WorldChallengeSpec['ageBand'];
}): boolean {
  if (typeof input.ageYears === 'number' && Number.isFinite(input.ageYears) && input.ageYears < 3) {
    return true;
  }
  if (input.neuroStage && (UNDER_THREE_STAGES as readonly string[]).includes(input.neuroStage)) {
    return true;
  }
  return input.ageBand === '0-2';
}

/** Síncrono: el corte es el valor devuelto, sin temporizador ni trama. */
export function applyTurnGate(input: TurnGateInput): TurnGateDecision {
  const reasons: TurnGateReason[] = [];
  if (input.turn === 'verbal') reasons.push('verbal');
  if (input.isErrorOrBlockedState === true) reasons.push('error');
  if (isUnderThree(input)) reasons.push('under_three');
  if (reasons.length > 0) {
    return { light: 'APAGADO', haptic: 'APAGADO', blocked: true, reasons };
  }
  return { light: input.light, haptic: input.haptic, blocked: false, reasons };
}

// Estabilizador de eventos visuales (T2-A).
// La cámara confirma un evento a los 10 fotogramas seguidos con la misma
// identidad (~330 ms a 30 fps). adult_tap se confirma en el fotograma en que llega.
// null es un fotograma perdido y rompe la racha. No es el método 'occlusion'.
import type { DetectionMethod, Observation } from '../types';

export const VISUAL_STABLE_FRAMES = 10;
export const ADULT_TAP_FRAMES = 1;
export const NOMINAL_FPS = 30;

/** 10 fotogramas a 30 fps son 333 ms. El plan lo redondea a unos 330 ms. */
export function visualWindowMs(fps: number = NOMINAL_FPS): number {
  return (VISUAL_STABLE_FRAMES * 1000) / fps;
}

export function framesRequired(method: DetectionMethod): number {
  return method === 'adult_tap' ? ADULT_TAP_FRAMES : VISUAL_STABLE_FRAMES;
}

export interface StabilizerDecision {
  readonly confirmed: boolean;
  readonly risingEdge: boolean;
  readonly framesHeld: number;
  readonly framesRequired: number;
  readonly method: DetectionMethod | null;
}

/**
 * Identidad visual: método, marcador, pieza y alvéolo.
 * Ángulo, velocidad y tiempo pueden variar sin romper la racha.
 */
function visualSignature(observation: Observation): string {
  const marker = observation.markerId === undefined ? '' : String(observation.markerId);
  const slot = observation.positionSlot === undefined ? '' : String(observation.positionSlot);
  return [observation.method, marker, observation.pieceCode ?? '', slot].join(':');
}

function trailingStableFrames(window: readonly (string | null)[]): number {
  const last = window[window.length - 1];
  if (last == null) return 0;
  let count = 0;
  for (let index = window.length - 1; index >= 0; index -= 1) {
    if (window[index] !== last) break;
    count += 1;
  }
  return count;
}

export class EventStabilizer {
  private readonly window: (string | null)[] = [];
  private wasStable = false;

  reset(): void {
    this.window.length = 0;
    this.wasStable = false;
  }

  /** Un fotograma. `null` es oclusión: el detector no vio la pieza. */
  push(observation: Observation | null): StabilizerDecision {
    if (observation?.method === 'adult_tap') {
      this.window.length = 0;
      this.wasStable = false;
      return {
        confirmed: true,
        risingEdge: true,
        framesHeld: ADULT_TAP_FRAMES,
        framesRequired: ADULT_TAP_FRAMES,
        method: 'adult_tap',
      };
    }

    this.window.push(observation == null ? null : visualSignature(observation));
    if (this.window.length > VISUAL_STABLE_FRAMES) this.window.shift();

    const head = this.window[0];
    const stable = this.window.length === VISUAL_STABLE_FRAMES
      && head != null
      && this.window.every((item) => item === head);
    const risingEdge = stable && !this.wasStable;
    this.wasStable = stable;

    return {
      confirmed: stable,
      risingEdge,
      framesHeld: trailingStableFrames(this.window),
      framesRequired: VISUAL_STABLE_FRAMES,
      method: observation?.method ?? null,
    };
  }
}

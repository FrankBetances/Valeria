// ArLegacyWorldAdapter (T4-A).
// Con cámara, la actividad abre el ejercicio nativo que nombra el puente.
// Sin cámara —o con el permiso denegado, o sin host— el mismo id sigue en
// mesa: un adult_tap y la RevealLayer de ese mundo. ar1–ar6 no se reescriben.
import type { ArExerciseConfig, ArSessionResult } from '../../valeriaArBridge';
import { isArAvailable, launchAr, resolveNativeExerciseForSteamActivity } from '../../valeriaArBridge';
import type { DetectionMethod, Observation, SteamActivityId } from '../types';
import { EventStabilizer, type StabilizerDecision } from '../engine/EventStabilizer';
import {
  adultTapObservation,
  observationFromLegacyTrial,
  steamLegacyBinding,
  type RevealLayerRef,
  type SteamLegacyBinding,
} from '../engine/Detectors';

export type SteamArRoute = 'native' | 'tabletop';

export function decideSteamRoute(cameraAvailable: boolean): SteamArRoute {
  return cameraAvailable ? 'native' : 'tabletop';
}

export interface DetectorSample {
  readonly activityId: SteamActivityId;
  readonly exerciseId: SteamLegacyBinding['exerciseId'];
  readonly observation: Observation;
  /** Un ensayo anulado, o de otro ejercicio, no confirma el evento de la mesa. */
  readonly usable: boolean;
}

export interface SteamActivityOpen {
  readonly activityId: SteamActivityId;
  readonly exerciseId: SteamLegacyBinding['exerciseId'];
  readonly revealLayer: RevealLayerRef;
  readonly route: SteamArRoute;
  readonly session: ArSessionResult | null;
  readonly samples: readonly DetectorSample[];
}

export function adultTapSample(activityId: SteamActivityId, tMs: number): DetectorSample {
  const binding = steamLegacyBinding(activityId);
  return {
    activityId,
    exerciseId: binding.exerciseId,
    observation: adultTapObservation(tMs),
    usable: true,
  };
}

/** Mesa: el adulto confirma y la capa de revelación es la del mundo. */
export function tabletopSession(activityId: SteamActivityId, tMs: number): SteamActivityOpen {
  const binding = steamLegacyBinding(activityId);
  return {
    activityId,
    exerciseId: binding.exerciseId,
    revealLayer: binding.revealLayer,
    route: 'tabletop',
    session: null,
    samples: [adultTapSample(activityId, tMs)],
  };
}

export function samplesFromSession(
  activityId: SteamActivityId,
  session: ArSessionResult,
): DetectorSample[] {
  const exerciseId = resolveNativeExerciseForSteamActivity(activityId);
  return session.trials.map((trial) => ({
    activityId,
    exerciseId: trial.exerciseId,
    observation: observationFromLegacyTrial(trial),
    usable: trial.voided !== true && trial.exerciseId === exerciseId,
  }));
}

/**
 * Entra al estabilizador solo si el método es de esta actividad.
 * Un fotograma anulado o de otra señal es un hueco: rompe la racha visual.
 * adult_tap confirma en el fotograma en que llega.
 */
export function noteSteamSample(
  stabilizer: EventStabilizer,
  sample: DetectorSample,
  acceptedMethods: readonly DetectionMethod[],
): StabilizerDecision {
  if (!sample.usable || !acceptedMethods.includes(sample.observation.method)) {
    return stabilizer.push(null);
  }
  return stabilizer.push(sample.observation);
}

/**
 * Abre la actividad. `config` es el del Panel del adulto (umbrales constantes);
 * el ejercicio lo pone el puente, no quien llama.
 * Sin cámara útil se devuelve la mesa, aunque el host haya contestado `denied`.
 */
export async function openSteamActivity(
  activityId: SteamActivityId,
  config: Omit<ArExerciseConfig, 'exerciseId'>,
  tMs: number,
): Promise<SteamActivityOpen> {
  const binding = steamLegacyBinding(activityId);
  if (decideSteamRoute(isArAvailable()) === 'tabletop') {
    return tabletopSession(activityId, tMs);
  }
  const exerciseId = resolveNativeExerciseForSteamActivity(activityId);
  const session = await launchAr({ ...config, exerciseId });
  if (!session || session.outcome === 'denied') {
    const tabletop = tabletopSession(activityId, tMs);
    return session ? { ...tabletop, session } : tabletop;
  }
  return {
    activityId,
    exerciseId,
    revealLayer: binding.revealLayer,
    route: 'native',
    session,
    samples: samplesFromSession(activityId, session),
  };
}

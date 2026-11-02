// Lo que cada reto necesita de la cámara (PLAN-INTEGRACION-AR-LUA-CONSTRUYE
// v3.0 §2.1–§2.2). Se deriva de `methods` en los eventos del manifiesto: no hay
// una segunda lista a mano que se pueda desincronizar.
//
// NATIVE_AR_DETECTORS es lo que android-native/valeria-ar sabe detectar HOY.
// scripts/check-steam-ar-needs.js lo contrasta con el Kotlin en los dos
// sentidos: no se puede declarar un detector que no está, ni olvidar uno que
// ya está. Que el módulo lo tenga NO significa que la pantalla de retos lo use:
// hoy los retos se juegan con adult_tap.
import type {
  DetectionMethod,
  SteamArMode,
  WorldChallengeSpec,
  WorldEventSpec,
  WorldManifest,
} from './types';

export const NATIVE_AR_DETECTORS: readonly DetectionMethod[] = ['face', 'adult_tap'];

/** Detector E: frágil con la luz de casa y del aula. Se resuelve con adult_tap. */
export const DISCARDED_AR_DETECTORS: readonly DetectionMethod[] = ['tracked_object'];

export const SET_MODES: readonly SteamArMode[] = ['SET_SOLO', 'SET_WITH_LUA'];

export type EventCapture = 'camera' | 'adult';

export interface ChallengeArNeeds {
  readonly challengeId: WorldChallengeSpec['id'];
  readonly modes: readonly SteamArMode[];
  /** Detectores que piden sus eventos, sin adult_tap. */
  readonly detectors: readonly DetectionMethod[];
  /** De esos, los que el módulo nativo ya tiene. */
  readonly nativeNow: readonly DetectionMethod[];
  /** Los que faltan y siguen en el plan (D2, mano…). */
  readonly pending: readonly DetectionMethod[];
  /** Los que el plan descarta: esos eventos se quedan en adult_tap. */
  readonly discarded: readonly DetectionMethod[];
  /** Cómo se captaría cada evento con lo que hay hoy en el módulo nativo. */
  readonly events: readonly { readonly id: WorldEventSpec['id']; readonly capture: EventCapture }[];
}

const ORDER: readonly DetectionMethod[] = ['marker', 'occlusion', 'hand', 'face', 'tracked_object'];

export function eventCapture(event: WorldEventSpec): EventCapture {
  return event.methods.some((m) => m !== 'adult_tap' && NATIVE_AR_DETECTORS.includes(m)) ? 'camera' : 'adult';
}

export function challengeArNeeds(world: WorldManifest, challenge: WorldChallengeSpec): ChallengeArNeeds {
  const byId = new Map(world.events.map((e) => [e.id, e]));
  const events = challenge.targetEvents.map((id) => byId.get(id)).filter((e): e is WorldEventSpec => !!e);
  const used = new Set(events.flatMap((e) => e.methods));
  const detectors = ORDER.filter((m) => used.has(m));
  return {
    challengeId: challenge.id,
    modes: SET_MODES,
    detectors,
    nativeNow: detectors.filter((m) => NATIVE_AR_DETECTORS.includes(m)),
    pending: detectors.filter((m) => !NATIVE_AR_DETECTORS.includes(m) && !DISCARDED_AR_DETECTORS.includes(m)),
    discarded: detectors.filter((m) => DISCARDED_AR_DETECTORS.includes(m)),
    events: events.map((e) => ({ id: e.id, capture: eventCapture(e) })),
  };
}

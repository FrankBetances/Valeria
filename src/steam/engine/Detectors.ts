// Detectores del motor STEAM (T4-A).
// A marcador, B oclusión, C mano, D cara, E objeto, F toque del adulto.
// ar1–ar6 siguen siendo los ejercicios nativos: aquí solo se leen las
// magnitudes que el puente ya devolvió. No hay umbrales ni veredicto.
import {
  STEAM_ACTIVITY_IDS,
  type DetectionMethod,
  type Observation,
  type SteamActivityId,
  type SteamWorldId,
} from '../types';
import type { ArExerciseId, ArTrial } from '../../valeriaArBridge';

export const DETECTOR_KIND = {
  marker: 'A',
  occlusion: 'B',
  hand: 'C',
  face: 'D',
  tracked_object: 'E',
  adult_tap: 'F',
} as const satisfies Record<DetectionMethod, 'A' | 'B' | 'C' | 'D' | 'E' | 'F'>;

export type DetectorKind = (typeof DETECTOR_KIND)[DetectionMethod];

/** Misma cadena de animación que `ArModel` en SceneHost.kt. set_kit_s0 no está en ese enum. */
export type RevealAnimation =
  | 'celebrate'
  | 'flow'
  | 'resonate'
  | 'roll'
  | 'spin_rotor'
  | 'balance'
  | 'bloom';

export interface RevealLayerRef {
  readonly id: string;
  readonly animation: RevealAnimation | null;
  readonly node: 'policia' | 'bomberos' | 'hospital' | 'trenes' | null;
}

export const REVEAL_BY_WORLD: Record<SteamWorldId, RevealLayerRef> = {
  LUA: { id: 'lua_v5_body', animation: 'celebrate', node: null },
  S0: { id: 'set_kit_s0', animation: null, node: null },
  S1: { id: 'set_camino', animation: 'flow', node: null },
  S2: { id: 'set_sonido', animation: 'resonate', node: null },
  S3: { id: 'set_rampas', animation: 'roll', node: null },
  S4: { id: 'set_soplo', animation: 'spin_rotor', node: null },
  S5: { id: 'set_puente', animation: 'balance', node: null },
  S6: { id: 'set_jardin', animation: 'bloom', node: null },
  S8: { id: 'set_oficios', animation: 'celebrate', node: 'policia' },
  S9: { id: 'set_oficios', animation: 'celebrate', node: 'bomberos' },
  S10: { id: 'set_oficios', animation: 'celebrate', node: 'hospital' },
  S11: { id: 'set_oficios', animation: 'celebrate', node: 'trenes' },
};

const FACE_TAP = ['face', 'adult_tap'] as const satisfies readonly DetectionMethod[];
const MARKER_TAP = ['marker', 'adult_tap'] as const satisfies readonly DetectionMethod[];
const FISH = ['occlusion', 'marker', 'adult_tap'] as const satisfies readonly DetectionMethod[];
const HAND_TAP = ['hand', 'adult_tap'] as const satisfies readonly DetectionMethod[];
const KIT = ['marker', 'occlusion', 'adult_tap'] as const satisfies readonly DetectionMethod[];
const SOUND = ['marker', 'hand', 'adult_tap'] as const satisfies readonly DetectionMethod[];
const RAMP = ['marker', 'tracked_object', 'adult_tap'] as const satisfies readonly DetectionMethod[];
const BLOW = ['marker', 'face', 'adult_tap'] as const satisfies readonly DetectionMethod[];
const GARDEN = ['occlusion', 'hand', 'marker', 'adult_tap'] as const satisfies readonly DetectionMethod[];

interface LegacyRow {
  readonly exerciseId: ArExerciseId;
  readonly worldId: SteamWorldId;
  readonly methods: readonly DetectionMethod[];
}

function row(
  exerciseId: ArExerciseId,
  worldId: SteamWorldId,
  methods: readonly DetectionMethod[],
): LegacyRow {
  return { exerciseId, worldId, methods };
}

// ar1 Ar1Orofacial: espejo de gestos y soplo.
// ar2 Ar2Vra: giro hacia el canto y la estación de sonido.
// ar3 Ar3Fixation: quietud del despertar y calma del hospital.
// ar4 Ar4SpatialSearch: rumbo, encaje, camino, cruce y vía.
// ar5 Ar5FeedCatch: pez, caricia, rampa y descenso del parque. La mano solo la mide ar5.
// ar6 Ar6BuddyMimicry: puente y jardín.
const BINDING = {
  'AR-L01': row('ar1', 'LUA', FACE_TAP),
  'AR-L02': row('ar4', 'LUA', MARKER_TAP),
  'AR-L03': row('ar5', 'LUA', FISH),
  'AR-L04': row('ar3', 'LUA', FACE_TAP),
  'AR-L05': row('ar5', 'LUA', HAND_TAP),
  'AR-L06': row('ar2', 'LUA', FACE_TAP),
  'AR-S00': row('ar4', 'S0', KIT),
  'AR-S01': row('ar4', 'S1', MARKER_TAP),
  'AR-S02': row('ar2', 'S2', SOUND),
  'AR-S03': row('ar5', 'S3', RAMP),
  'AR-S04': row('ar1', 'S4', BLOW),
  'AR-S05': row('ar6', 'S5', MARKER_TAP),
  'AR-S06': row('ar6', 'S6', GARDEN),
  'AR-S08': row('ar4', 'S8', MARKER_TAP),
  'AR-S09': row('ar5', 'S9', RAMP),
  'AR-S10': row('ar3', 'S10', KIT),
  'AR-S11': row('ar4', 'S11', MARKER_TAP),
  'AR-SL00': row('ar4', 'S0', KIT),
  'AR-SL01': row('ar4', 'S1', MARKER_TAP),
  'AR-SL02': row('ar2', 'S2', SOUND),
  'AR-SL03': row('ar5', 'S3', RAMP),
  'AR-SL04': row('ar1', 'S4', BLOW),
  'AR-SL05': row('ar6', 'S5', MARKER_TAP),
  'AR-SL06': row('ar6', 'S6', GARDEN),
  'AR-SL08': row('ar4', 'S8', MARKER_TAP),
  'AR-SL09': row('ar5', 'S9', RAMP),
  'AR-SL10': row('ar3', 'S10', KIT),
  'AR-SL11': row('ar4', 'S11', MARKER_TAP),
} as const satisfies Record<SteamActivityId, LegacyRow>;

function expectedWorld(activityId: SteamActivityId): SteamWorldId {
  // AR-SL va antes que AR-L: «AR-SL00» también empieza por «AR-L».
  if (activityId.startsWith('AR-SL') || activityId.startsWith('AR-S')) {
    const body = activityId.startsWith('AR-SL') ? activityId.slice(5) : activityId.slice(4);
    return `S${Number(body)}` as SteamWorldId;
  }
  return 'LUA';
}

function assertLegacyCatalog(): void {
  const seen = new Set<ArExerciseId>();
  if (STEAM_ACTIVITY_IDS.length !== 28) {
    throw new Error(`El catálogo STEAM tiene ${STEAM_ACTIVITY_IDS.length} actividades; el contrato es 28.`);
  }
  for (const activityId of STEAM_ACTIVITY_IDS) {
    const entry = BINDING[activityId];
    if (!entry.methods.includes('adult_tap')) {
      throw new Error(`${activityId}: el detector F (adult_tap) es obligatorio.`);
    }
    if (entry.worldId !== expectedWorld(activityId)) {
      throw new Error(`${activityId}: el mundo del detector no es ${expectedWorld(activityId)}.`);
    }
    seen.add(entry.exerciseId);
  }
  const exercises: readonly ArExerciseId[] = ['ar1', 'ar2', 'ar3', 'ar4', 'ar5', 'ar6'];
  for (const exerciseId of exercises) {
    if (!seen.has(exerciseId)) {
      throw new Error(`${exerciseId} no está unido a ninguna de las 28 actividades.`);
    }
  }
}

assertLegacyCatalog();

export interface SteamLegacyBinding {
  readonly activityId: SteamActivityId;
  readonly exerciseId: ArExerciseId;
  readonly worldId: SteamWorldId;
  readonly methods: readonly DetectionMethod[];
  readonly revealLayer: RevealLayerRef;
}

export function steamLegacyBinding(activityId: SteamActivityId): SteamLegacyBinding {
  const entry = BINDING[activityId];
  if (!entry) {
    throw new Error(`Actividad STEAM sin detector: ${activityId}`);
  }
  return {
    activityId,
    exerciseId: entry.exerciseId,
    worldId: entry.worldId,
    methods: entry.methods,
    revealLayer: REVEAL_BY_WORLD[entry.worldId],
  };
}

/** Id nativo con el que se abre la cámara. Una actividad, un ejercicio. */
export function nativeExerciseForSteamActivity(activityId: SteamActivityId): ArExerciseId {
  return steamLegacyBinding(activityId).exerciseId;
}

export interface DetectorMagnitudes {
  readonly markerId?: number;
  readonly pieceCode?: string;
  readonly positionSlot?: number;
  readonly angleDeg?: number;
  readonly velocity?: number;
  readonly durationMs?: number;
  readonly ratio?: number;
}

function putFinite(
  observation: Observation,
  key: 'angleDeg' | 'velocity' | 'durationMs' | 'ratio',
  value: number | null | undefined,
): void {
  if (typeof value === 'number' && Number.isFinite(value)) observation[key] = value;
}

/** F es un toque: sin marcador ni magnitud. El estabilizador lo confirma en un fotograma. */
export function adultTapObservation(tMs: number): Observation {
  return { method: 'adult_tap', tMs };
}

/**
 * Observación de mesa (A–E) a partir de magnitudes, nunca de una imagen.
 * F ignora las magnitudes y queda como toque.
 */
export function observationFromMagnitudes(
  method: DetectionMethod,
  tMs: number,
  magnitudes: DetectorMagnitudes = {},
): Observation {
  if (method === 'adult_tap') return adultTapObservation(tMs);
  const observation: Observation = { method, tMs };
  if (magnitudes.markerId !== undefined) observation.markerId = magnitudes.markerId;
  if (magnitudes.pieceCode !== undefined) observation.pieceCode = magnitudes.pieceCode;
  if (magnitudes.positionSlot !== undefined) observation.positionSlot = magnitudes.positionSlot;
  putFinite(observation, 'angleDeg', magnitudes.angleDeg);
  putFinite(observation, 'velocity', magnitudes.velocity);
  putFinite(observation, 'durationMs', magnitudes.durationMs);
  putFinite(observation, 'ratio', magnitudes.ratio);
  return observation;
}

/**
 * Señal de un ensayo ar1–ar6. La cara sale de ar1, ar2, ar3, ar4 y ar6.
 * La mano sale de ar5. Un ensayo anulado no se decide aquí: lo marca quien llama.
 */
export function observationFromLegacyTrial(trial: ArTrial): Observation {
  switch (trial.exerciseId) {
    case 'ar1':
      return observationFromMagnitudes('face', trial.at, {
        ratio: trial.puckerPeak,
        durationMs: trial.holdMaxMs,
      });
    case 'ar2':
      return observationFromMagnitudes('face', trial.at, {
        angleDeg: trial.peakYawDeg,
        durationMs: trial.latencyMs === null ? undefined : trial.latencyMs,
      });
    case 'ar3':
      return observationFromMagnitudes('face', trial.at, {
        durationMs: trial.dwellMs,
      });
    case 'ar4':
      return observationFromMagnitudes('face', trial.at, {
        angleDeg: trial.yawRmsDeg,
        durationMs: trial.fovealDwellMs,
      });
    case 'ar5':
      return observationFromMagnitudes('hand', trial.at, {
        velocity: trial.throwVelocityPxPerS,
        angleDeg: trial.throwAngleDeg,
        durationMs: trial.timeToThrowMs,
      });
    case 'ar6':
      return observationFromMagnitudes('face', trial.at, {
        ratio: trial.blendshapePeak,
        durationMs: trial.holdMs,
      });
    default: {
      const unknown: never = trial;
      throw new Error(`Ensayo sin detector: ${JSON.stringify(unknown)}`);
    }
  }
}

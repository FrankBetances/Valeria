// Contratos del motor STEAM (T0-B).
// AdultText: lo que lee el adulto (UiLang: es, en, ca, gl).
// ChildSpeechMap: lo que oye el niño (Locale: es, gl, eu, es-DO, en-US, ca).
// S7 no existe: los sets oficiales son S0–S6 y S8–S11.
import type { Locale } from '../valeriaLocale';
import type { UiLang } from '../valeriaUiLang';

export type AdultText = Record<UiLang, string>;
export type ChildSpeechMap = Record<Locale, string>;

/** Orden del contrato: es, gl, eu, es-DO, en-US, ca. El conjunto es `Locale`. */
export const CHILD_SPEECH_LOCALES = ['es', 'gl', 'eu', 'es-DO', 'en-US', 'ca'] as const satisfies readonly Locale[];
type ChildSpeechLocalesExact = Exclude<Locale, (typeof CHILD_SPEECH_LOCALES)[number]> extends never ? true : never;
export const childSpeechLocalesExact: ChildSpeechLocalesExact = true;

export const ADULT_UI_LANGS = ['es', 'en', 'ca', 'gl'] as const satisfies readonly UiLang[];
type AdultUiLangsExact = Exclude<UiLang, (typeof ADULT_UI_LANGS)[number]> extends never ? true : never;
export const adultUiLangsExact: AdultUiLangsExact = true;

export type NeuroStage = 'I1' | 'I2' | 'I3' | 'I4' | 'I5';

export type DetectionMethod =
  | 'marker'
  | 'occlusion'
  | 'hand'
  | 'face'
  | 'tracked_object'
  | 'adult_tap';

export type SpatialCategory =
  | 'dimensions'
  | 'shapes'
  | 'position'
  | 'orientation'
  | 'quantity'
  | 'deictics'
  | 'properties'
  | 'pattern';

export type SkillAxis =
  | 'auditory_perception'
  | 'phonology_speech'
  | 'lexicon_semantics'
  | 'morphosyntax_narrative'
  | 'interaction_pragmatics'
  | 'sensory_regulation'
  | 'graphomotor';

export type AdaptationProfileId =
  | 'hearing_ic'
  | 'autism_tea'
  | 'dyslexia'
  | 'speech_motricity';

export type LuaSemanticExpression =
  | 'neutra'
  | 'atenta'
  | 'escucha'
  | 'animo'
  | 'espera_serena'
  | 'impulso'
  | 'calma'
  | 'alegre'
  | 'ternura'
  | 'gratitud'
  | 'alivio'
  | 'esperanza'
  | 'orgullo'
  | 'expectante'
  | 'curiosa'
  | 'diversion'
  | 'sorpresa_inclinada'
  | 'celebra_corta'
  | 'celebra_nivel'
  | 'celebra_exito'
  | 'descanso_lejos';

export type LightPattern =
  | 'APAGADO'
  | 'DIR_DELANTE'
  | 'DIR_IZQ'
  | 'DIR_DCHA'
  | 'TENUE_CUATRO'
  | 'LADO_RAMPA'
  | 'LADO_SOL';

export type HapticPattern =
  | 'APAGADO'
  | 'CELEBRA_CORTO'
  | 'METRONOMO_LENTO'
  | 'RONRONEO';

export type SteamWorldId =
  | 'LUA'
  | 'S0'
  | 'S1'
  | 'S2'
  | 'S3'
  | 'S4'
  | 'S5'
  | 'S6'
  | 'S8'
  | 'S9'
  | 'S10'
  | 'S11';

export const STEAM_WORLD_IDS = [
  'LUA',
  'S0',
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
  'S6',
  'S8',
  'S9',
  'S10',
  'S11',
] as const satisfies readonly SteamWorldId[];
type SteamWorldIdsExact =
  Exclude<SteamWorldId, (typeof STEAM_WORLD_IDS)[number]> extends never
    ? (typeof STEAM_WORLD_IDS)['length'] extends 12
      ? true
      : never
    : never;
export const steamWorldIdsExact: SteamWorldIdsExact = true;

export type SteamArMode = 'LUA_SOLO' | 'SET_SOLO' | 'SET_WITH_LUA';

export const STEAM_AR_MODES = ['LUA_SOLO', 'SET_SOLO', 'SET_WITH_LUA'] as const satisfies readonly SteamArMode[];
type SteamArModesExact =
  Exclude<SteamArMode, (typeof STEAM_AR_MODES)[number]> extends never
    ? (typeof STEAM_AR_MODES)['length'] extends 3
      ? true
      : never
    : never;
export const steamArModesExact: SteamArModesExact = true;

/** 28 actividades: AR-L01..06, AR-S00..06 + AR-S08..11, AR-SL00..06 + AR-SL08..11. */
export type SteamActivityId =
  | `AR-L0${1 | 2 | 3 | 4 | 5 | 6}`
  | `AR-S0${0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9}`
  | 'AR-S10'
  | 'AR-S11'
  | `AR-SL0${0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9}`
  | 'AR-SL10'
  | 'AR-SL11';

export const STEAM_ACTIVITY_IDS = [
  'AR-L01',
  'AR-L02',
  'AR-L03',
  'AR-L04',
  'AR-L05',
  'AR-L06',
  'AR-S00',
  'AR-S01',
  'AR-S02',
  'AR-S03',
  'AR-S04',
  'AR-S05',
  'AR-S06',
  'AR-S08',
  'AR-S09',
  'AR-S10',
  'AR-S11',
  'AR-SL00',
  'AR-SL01',
  'AR-SL02',
  'AR-SL03',
  'AR-SL04',
  'AR-SL05',
  'AR-SL06',
  'AR-SL08',
  'AR-SL09',
  'AR-SL10',
  'AR-SL11',
] as const satisfies readonly SteamActivityId[];
type SteamActivityIdsExact =
  Exclude<SteamActivityId, (typeof STEAM_ACTIVITY_IDS)[number]> extends never
    ? Exclude<(typeof STEAM_ACTIVITY_IDS)[number], SteamActivityId> extends never
      ? (typeof STEAM_ACTIVITY_IDS)['length'] extends 28
        ? true
        : never
      : never
    : never;
export const steamActivityIdsExact: SteamActivityIdsExact = true;

/**
 * Id de evento. S0–S6 conservan la forma del §2.3.
 * S8–S11 y LUA cubren el catálogo tri-modal (no hay S7).
 */
export type WorldEventId =
  | `S${0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9}.${string}`
  | `S${10 | 11}.${string}`
  | `LUA.${string}`;

export type WorldChallengeId =
  | `S${0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 9}-C${1 | 2 | 3 | 4 | 5}`
  | `S${10 | 11}-C${1 | 2 | 3 | 4 | 5}`
  | `LUA-C${1 | 2 | 3 | 4 | 5}`;

export interface Observation {
  method: DetectionMethod;
  markerId?: number;
  pieceCode?: string;
  positionSlot?: number;
  angleDeg?: number;
  velocity?: number;
  durationMs?: number;
  ratio?: number;
  tMs: number;
}

export interface WorldEventSpec {
  id: WorldEventId;
  title: AdultText;
  childAction: AdultText;
  /** El validador exige que `adult_tap` esté en esta lista. */
  methods: DetectionMethod[];
  /** En `verbal`, light y haptic tienen que ser `APAGADO`. */
  turn: 'motor' | 'verbal';
  /** Si es true, light y haptic tienen que ser `APAGADO`. */
  isErrorOrBlockedState?: boolean;
  pauseBeforeReactionMs?: number;
  reaction: {
    expression: LuaSemanticExpression;
    pictoKey?: string;
    awardFamily?: number;
    light: LightPattern;
    haptic: HapticPattern;
    screenOverlay?: 'NONE' | 'PROGRESS_RING' | 'VISUAL_METRONOME';
  };
  word: {
    englishTpr?: string;
    adultHint: AdultText;
    spatialCategory: SpatialCategory;
  };
}

export interface TripartiteCycle {
  observa: {
    phenomenonTrigger: AdultText;
    socraticQuestion: AdultText;
    mandatorySilenceSec: 5;
  };
  experimenta: {
    adultStepByStep: AdultText;
    hints: {
      level1Socratic: AdultText;
      level2PhysicalModel: AdultText;
    };
  };
  construye: {
    tangibleMakeChallenge: AdultText;
    transferQuestion: AdultText;
  };
}

export interface WorldChallengeSpec {
  id: WorldChallengeId;
  number: 1 | 2 | 3 | 4 | 5;
  title: AdultText;
  ageBand: '0-2' | '2-3' | '3-4' | '4-5' | '5-6';
  neuroStage: NeuroStage;
  estimatedMinutes: number;
  scale: 'G' | 'E' | 'G+E';
  skillAxes: SkillAxis[];
  targetEvents: WorldEventId[];
  cycle: TripartiteCycle;
  achievementCriterion: AdultText;
  qualitativeObservation: AdultText;
}

export interface WorldPieceSpec {
  code: string;
  name: AdultText;
  quantity: number;
  scale: 'G' | 'E' | 'FABRICANTE';
  instanceMarkerIds: number[];
  detectionMethod: DetectionMethod;
  safetyNotes: AdultText;
}

export interface WorldManifest {
  id: SteamWorldId;
  orderIndex: number;
  title: AdultText;
  subtitleEn: string;
  phenomenon: AdultText;
  ageRange: string;
  scaleSummary: 'G' | 'E' | 'G/E';
  prioritySpatialCategories: SpatialCategory[];
  skillAxes: SkillAxis[];
  supportedProfiles: AdaptationProfileId[];
  targetAudienceContext: AdultText;
  udlPathways: {
    representation: AdultText;
    engagement: AdultText;
    expression: AdultText;
  };
  tabletStandSpec: {
    heightCm: number;
    tiltDeg: number;
    cameraMode: 'rear_tabletop' | 'front_praxias_only' | 'none_adult_tap';
    luaOrientation: 'child_sees_back' | 'child_sees_front';
  };
  pieces: WorldPieceSpec[];
  events: WorldEventSpec[];
  challenges: WorldChallengeSpec[];
  modelCards: { id: string; title: AdultText; targetPieces: string[] }[];
  revealLayer: { id: string; description: AdultText; maxGlbKb: 100 };
  warmupLinks: {
    songIds: string[];
    gameIds: string[];
  };
  story: {
    storyId?: string;
    anticipationMicroStory: AdultText;
    closingMicroStory: AdultText;
  };
  tabletopPracticeLinks: {
    route: 'SensoryBlockList' | 'MinimalPairs' | 'SemanticExpansion' | 'Writing' | 'BlockList';
    blockParam?: 'audicion' | 'lenguaje' | 'tea' | 'dislexia';
    connectionReason: AdultText;
  }[];
  academyCapsuleId: string;
}

/**
 * Una de las 28 actividades. `validator.ts` la comprueba al cargar y en CI.
 * SET_SOLO lleva `bleRequired: false`: el set se juega sin Lúa encendida.
 */
export interface SteamActivity {
  id: SteamActivityId;
  worldId: SteamWorldId;
  mode: SteamArMode;
  bleRequired: boolean;
  methods: DetectionMethod[];
  childSpeech: ChildSpeechMap;
  englishTpr: string;
  cycle: TripartiteCycle;
  events: WorldEventSpec[];
}

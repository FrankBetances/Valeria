// Contratos del motor STEAM (T0-B).
// AdultText: lo que lee el adulto (UiLang: es, en, ca, gl).
// ChildSpeechMap: lo que oye el niño (Locale: es, gl, eu, es-DO, en-US, ca).
// Mundos S0–S6, esquema de docs/PLAN-REFACTOR-STEAM.md §2.3.
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

/**
 * Modalidad de RA (PLAN-INTEGRACION-AR-LUA-CONSTRUYE v3.0 §2.1). En los retos
 * S0–S6 no se elige: SET_WITH_LUA es SET_SOLO con Lúa enlazada. LUA_SOLO son
 * las actividades sin set.
 */
export type SteamArMode = 'LUA_SOLO' | 'SET_SOLO' | 'SET_WITH_LUA';

/** Los siete mundos del plan (Sets 0 a 6 de Construye con Lúa). */
export type SteamWorldId = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

/** Orden canónico de despliegue (plan §4): S0 + S1 → S5 → S3 → S6 → S2 → S4. */
export const STEAM_WORLD_ORDER = ['S0', 'S1', 'S5', 'S3', 'S6', 'S2', 'S4'] as const satisfies readonly SteamWorldId[];

export type WorldEventId = `S${0 | 1 | 2 | 3 | 4 | 5 | 6}.${string}`;
export type WorldChallengeId = `S${0 | 1 | 2 | 3 | 4 | 5 | 6}-C${1 | 2 | 3 | 4 | 5}`;
export type ChallengeNumber = 1 | 2 | 3 | 4 | 5;
export type AgeBand = '0-2' | '2-3' | '3-4' | '4-5' | '5-6';

/**
 * Calibración madurativa (plan §0.2 G6, concretada en v2.1): el reto n va a la
 * franja n y al estadio In. Una sola escala, sin solapes.
 */
export const CHALLENGE_LADDER: Record<ChallengeNumber, { ageBand: AgeBand; neuroStage: NeuroStage }> = {
  1: { ageBand: '0-2', neuroStage: 'I1' },
  2: { ageBand: '2-3', neuroStage: 'I2' },
  3: { ageBand: '3-4', neuroStage: 'I3' },
  4: { ageBand: '4-5', neuroStage: 'I4' },
  5: { ageBand: '5-6', neuroStage: 'I5' },
};

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
  number: ChallengeNumber;
  title: AdultText;
  ageBand: AgeBand;
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

// LuaLink (T2-B). Traduce LuaSemanticExpression a opcodes de
// firmware/lua/protocol.json v1. Luz, háptico y V5 no están en esa tabla:
// no se inventan y no salen por BLE. SET_SOLO no exige enlace.
import { AWARD_GLYPH_KEYS, AWARD_TIER_KEYS, PICTO_KEYS } from '../../ValeriaPixelArt';
import { luaAwardParam } from '../../valeriaLuaMascot';
import {
  LUA_ACCESSORY_NONE,
  LUA_LIMITS,
  LUA_MOOD,
  LUA_OP,
  LUA_SLOT,
  luaAccessoryParam,
  luaFrame,
  type LuaOp,
} from '../../valeriaLuaProtocol';
import { getCollectibleById } from '../../types/valeriaLua';
import type {
  HapticPattern,
  LightPattern,
  LuaSemanticExpression,
  SteamArMode,
} from '../types';

/** Nombres del plan que protocol.json v1 no define. No se emiten. */
export const CHANNELS_WITHOUT_OPCODE = ['LIGHT', 'HAPTIC', 'V5'] as const;

export const LUA_OFFICIAL_FACE_COUNT = 28;

/**
 * Índices que el plan no numeró. El hueco se llena con un parámetro que
 * protocol.json v1 ya admite (PHASE 2/3, VERDICT 0, MOOD 0/4, y los anclajes
 * PICTO / AWARD / ACCESSORY). Ninguna expresión semántica apunta aquí,
 * salvo el camino explícito de MOOD 0 y MOOD 4.
 */
export const FACES_WITHOUT_PLAN_NAME = [3, 8, 19, 23, 24, 25, 26, 27] as const;

export interface LuaOfficialFace {
  readonly index: number;
  readonly id: string;
  readonly opcode: LuaOp;
  readonly param: number;
  readonly planNamed: boolean;
}

interface FaceSeed {
  index: number;
  id: string;
  opcode: LuaOp;
  param: number;
  planNamed: boolean;
}

const ACCESSORY_CLEAR_HEAD = luaAccessoryParam(LUA_SLOT.HEAD, LUA_ACCESSORY_NONE);

function paramInRange(opcode: LuaOp, param: number): boolean {
  switch (opcode) {
    case LUA_OP.IDLE:
      return param === 0;
    case LUA_OP.PHASE:
      return param >= 0 && param <= 3;
    case LUA_OP.VERDICT:
      return param >= 0 && param <= 2;
    case LUA_OP.CELEBRATE:
      return param >= 0 && param <= 2;
    case LUA_OP.AFFECT:
      return param >= 0 && param <= 7;
    case LUA_OP.MOOD:
      return param >= 0 && param <= 4;
    case LUA_OP.RELAX:
      return param >= 1 && param <= 60;
    case LUA_OP.PICTO:
      return param >= 0 && param < PICTO_KEYS.length;
    case LUA_OP.AWARD:
      return param === luaAwardParam(0, 0);
    case LUA_OP.ACCESSORY:
      return param === ACCESSORY_CLEAR_HEAD;
    default:
      return false;
  }
}

function buildOfficialFaces(seeds: readonly FaceSeed[]): readonly LuaOfficialFace[] {
  if (seeds.length !== LUA_OFFICIAL_FACE_COUNT) {
    throw new Error(`LuaLink: el catálogo tiene ${seeds.length} caras; hacen falta 28.`);
  }
  return seeds.map((seed, position) => {
    if (seed.index !== position || seed.index < 0 || seed.index > 27) {
      throw new Error(`LuaLink: la cara ${seed.id} no ocupa el índice #${position}.`);
    }
    if (!paramInRange(seed.opcode, seed.param)) {
      throw new Error(`LuaLink: ${seed.id} usa un parámetro fuera de protocol.json v1.`);
    }
    return seed;
  });
}

/**
 * #12 y #15 siguen el nombre de protocol.json (AFFECT 2 Gratitud, AFFECT 5
 * Orgullo). El plan de integración los cruzaba.
 */
export const LUA_OFFICIAL_FACES: readonly LuaOfficialFace[] = buildOfficialFaces([
  { index: 0, id: 'neutra', opcode: LUA_OP.IDLE, param: 0, planNamed: true },
  { index: 1, id: 'atenta', opcode: LUA_OP.PHASE, param: 0, planNamed: true },
  { index: 2, id: 'animo', opcode: LUA_OP.PHASE, param: 1, planNamed: true },
  { index: 3, id: 'fase_veredicto', opcode: LUA_OP.PHASE, param: 2, planNamed: false },
  { index: 4, id: 'lo_dijo', opcode: LUA_OP.CELEBRATE, param: 0, planNamed: true },
  { index: 5, id: 'nivel', opcode: LUA_OP.CELEBRATE, param: 1, planNamed: true },
  { index: 6, id: 'impulso', opcode: LUA_OP.VERDICT, param: 1, planNamed: true },
  { index: 7, id: 'calma', opcode: LUA_OP.VERDICT, param: 2, planNamed: true },
  { index: 8, id: 'no_coincide', opcode: LUA_OP.VERDICT, param: 0, planNamed: false },
  { index: 9, id: 'exito', opcode: LUA_OP.CELEBRATE, param: 2, planNamed: true },
  { index: 10, id: 'alegria', opcode: LUA_OP.AFFECT, param: 0, planNamed: true },
  { index: 11, id: 'amor', opcode: LUA_OP.AFFECT, param: 1, planNamed: true },
  { index: 12, id: 'gratitud', opcode: LUA_OP.AFFECT, param: 2, planNamed: true },
  { index: 13, id: 'tranquilidad', opcode: LUA_OP.AFFECT, param: 3, planNamed: true },
  { index: 14, id: 'esperanza', opcode: LUA_OP.AFFECT, param: 4, planNamed: true },
  { index: 15, id: 'orgullo', opcode: LUA_OP.AFFECT, param: 5, planNamed: true },
  { index: 16, id: 'inspiracion', opcode: LUA_OP.AFFECT, param: 6, planNamed: true },
  { index: 17, id: 'diversion', opcode: LUA_OP.AFFECT, param: 7, planNamed: true },
  { index: 18, id: 'dormida', opcode: LUA_OP.RELAX, param: 20, planNamed: true },
  { index: 19, id: 'mision', opcode: LUA_OP.PHASE, param: 3, planNamed: false },
  { index: 20, id: 'antojo', opcode: LUA_OP.MOOD, param: LUA_MOOD.CRAVING, planNamed: true },
  { index: 21, id: 'ronroneo', opcode: LUA_OP.MOOD, param: LUA_MOOD.PURRING, planNamed: true },
  { index: 22, id: 'comiendo', opcode: LUA_OP.MOOD, param: LUA_MOOD.EATING, planNamed: true },
  { index: 23, id: 'celebrando', opcode: LUA_OP.MOOD, param: LUA_MOOD.CELEBRATING, planNamed: false },
  { index: 24, id: 'serena', opcode: LUA_OP.MOOD, param: LUA_MOOD.SERENE, planNamed: false },
  { index: 25, id: 'ficha', opcode: LUA_OP.PICTO, param: 0, planNamed: false },
  { index: 26, id: 'insignia', opcode: LUA_OP.AWARD, param: luaAwardParam(0, 0), planNamed: false },
  { index: 27, id: 'accesorio', opcode: LUA_OP.ACCESSORY, param: ACCESSORY_CLEAR_HEAD, planNamed: false },
]);

const FACE_BY_INDEX = new Map(LUA_OFFICIAL_FACES.map((face) => [face.index, face]));
const FACE_BY_ID = new Map(LUA_OFFICIAL_FACES.map((face) => [face.id, face]));

const EXPRESSION_FACE_ID = {
  neutra: 'neutra',
  espera_serena: 'neutra',
  atenta: 'atenta',
  escucha: 'atenta',
  animo: 'animo',
  impulso: 'impulso',
  calma: 'calma',
  alegre: 'alegria',
  ternura: 'amor',
  gratitud: 'gratitud',
  alivio: 'tranquilidad',
  esperanza: 'esperanza',
  orgullo: 'orgullo',
  expectante: 'inspiracion',
  curiosa: 'inspiracion',
  diversion: 'diversion',
  sorpresa_inclinada: 'diversion',
  celebra_corta: 'lo_dijo',
  celebra_nivel: 'nivel',
  celebra_exito: 'exito',
  descanso_lejos: 'dormida',
} as const satisfies Record<LuaSemanticExpression, string>;

const MOOD_FACE_INDEX = {
  0: 24,
  1: 20,
  2: 21,
  3: 22,
  4: 23,
} as const satisfies Record<0 | 1 | 2 | 3 | 4, number>;

export type LuaMoodCode = keyof typeof MOOD_FACE_INDEX;

function faceAt(index: number): LuaOfficialFace {
  const face = FACE_BY_INDEX.get(index);
  if (!face) throw new Error(`LuaLink: #${index} no está en el catálogo 0–27.`);
  return face;
}

export function translateExpression(expression: LuaSemanticExpression): LuaOfficialFace {
  const id = EXPRESSION_FACE_ID[expression];
  const face = FACE_BY_ID.get(id);
  if (!face) throw new Error(`LuaLink: la expresión ${expression} no tiene cara.`);
  return face;
}

export function translateMood(mood: LuaMoodCode): LuaOfficialFace {
  return faceAt(MOOD_FACE_INDEX[mood]);
}

export function luaLinkDemandsBle(mode: SteamArMode): boolean {
  return mode !== 'SET_SOLO';
}

export type LuaFrameSink = (frames: readonly Uint8Array[]) => void;

let moduleSink: LuaFrameSink | null = null;

export function setLuaLinkSink(next: LuaFrameSink | null): void {
  moduleSink = next;
}

export type ScreenOverlay = 'NONE' | 'PROGRESS_RING' | 'VISUAL_METRONOME';

export interface LuaAccessoryRequest {
  slot?: 'HEAD' | 'NECK';
  itemId?: string;
  itemIndex?: number;
  clear?: boolean;
}

export interface LuaLinkInput {
  mode: SteamArMode;
  bleConnected: boolean;
  expression: LuaSemanticExpression;
  /** Cara de compañía (MOOD 0..4). Sustituye a la expresión en el panel. */
  mood?: LuaMoodCode;
  useMoodAsFace?: boolean;
  pictoKey?: string;
  awardFamily?: number;
  awardTier?: number;
  accessory?: LuaAccessoryRequest;
  light: LightPattern;
  haptic: HapticPattern;
  screenOverlay?: ScreenOverlay;
  sink?: LuaFrameSink | null;
  now?: () => number;
}

export interface LuaLinkProjection {
  readonly mode: SteamArMode;
  readonly bleDemanded: boolean;
  readonly bleConnected: boolean;
  readonly emitted: boolean;
  readonly degradedToMirror: boolean;
  readonly face: LuaOfficialFace;
  readonly frames: readonly Uint8Array[];
  readonly mirror: {
    readonly surface: 'reveal' | 'catPixel';
    readonly widget: 'RevealLayer' | 'CatPixel';
    readonly glb: 'lua.glb' | null;
    readonly faceIndex: number;
    readonly faceId: string;
    readonly light: LightPattern;
    readonly haptic: HapticPattern;
    readonly screenOverlay: ScreenOverlay;
  };
  readonly latencyMs: number;
  readonly withinBudget: boolean;
  readonly withoutOpcode: readonly typeof CHANNELS_WITHOUT_OPCODE[number][];
  readonly unmapped: readonly string[];
}

function isMoodCode(value: number): value is LuaMoodCode {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4;
}

function resolveAccessory(request: LuaAccessoryRequest): number | null {
  if (request.clear) {
    const slot = request.slot === 'NECK' ? LUA_SLOT.NECK : LUA_SLOT.HEAD;
    return luaAccessoryParam(slot, LUA_ACCESSORY_NONE);
  }
  if (request.itemId) {
    const item = getCollectibleById(request.itemId);
    if (!item || item.slot === 'snack') return null;
    const slot = item.slot === 'neck' ? LUA_SLOT.NECK : LUA_SLOT.HEAD;
    if (request.slot === 'HEAD' && slot !== LUA_SLOT.HEAD) return null;
    if (request.slot === 'NECK' && slot !== LUA_SLOT.NECK) return null;
    return luaAccessoryParam(slot, item.mirrorIndex);
  }
  if (request.slot && typeof request.itemIndex === 'number' && Number.isFinite(request.itemIndex)) {
    const index = Math.trunc(request.itemIndex);
    if (index < 0 || index >= LUA_ACCESSORY_NONE) return null;
    const slot = request.slot === 'NECK' ? LUA_SLOT.NECK : LUA_SLOT.HEAD;
    return luaAccessoryParam(slot, index);
  }
  return null;
}

function selectFace(input: LuaLinkInput, unmapped: string[]): LuaOfficialFace {
  if (input.useMoodAsFace) {
    if (input.mood !== undefined && isMoodCode(input.mood)) return translateMood(input.mood);
    unmapped.push('MOOD');
  }
  return translateExpression(input.expression);
}

export function linkLua(input: LuaLinkInput): LuaLinkProjection {
  const now = input.now ?? Date.now;
  const started = now();
  const unmapped: string[] = [];
  const face = selectFace(input, unmapped);
  const prelude: Uint8Array[] = [];

  if (input.accessory) {
    const param = resolveAccessory(input.accessory);
    if (param === null) unmapped.push(input.accessory.itemId ? `ACCESSORY:${input.accessory.itemId}` : 'ACCESSORY');
    else prelude.push(luaFrame(LUA_OP.ACCESSORY, param));
  }

  if (input.pictoKey) {
    const index = (PICTO_KEYS as readonly string[]).indexOf(input.pictoKey);
    if (index < 0) unmapped.push(`PICTO:${input.pictoKey}`);
    else prelude.push(luaFrame(LUA_OP.PICTO, index));
  }

  if (input.awardFamily !== undefined) {
    const glyph = Math.trunc(input.awardFamily);
    const tier = input.awardTier === undefined ? 0 : Math.trunc(input.awardTier);
    const glyphOk = glyph >= 0 && glyph < AWARD_GLYPH_KEYS.length;
    const tierOk = tier >= 0 && tier < AWARD_TIER_KEYS.length;
    if (!glyphOk || !tierOk) unmapped.push(`AWARD:${input.awardFamily}`);
    else prelude.push(luaFrame(LUA_OP.AWARD, luaAwardParam(glyph, tier)));
  }

  // El opcode de la cara va el último: en el firmware cada trama sustituye
  // a la anterior, y aquí no hay desfile (el presupuesto es < 300 ms).
  const frames = luaLinkDemandsBle(input.mode)
    ? [...prelude, luaFrame(face.opcode, face.param)]
    : [];

  const sink = input.sink !== undefined ? input.sink : moduleSink;
  const emit = frames.length > 0 && input.bleConnected && sink !== null;
  if (emit && sink) sink(frames);
  const latencyMs = now() - started;
  const solo = input.mode === 'SET_SOLO';

  return {
    mode: input.mode,
    bleDemanded: !solo,
    bleConnected: input.bleConnected,
    emitted: emit,
    degradedToMirror: !solo && !input.bleConnected,
    face,
    frames,
    mirror: {
      surface: solo ? 'reveal' : 'catPixel',
      widget: solo ? 'RevealLayer' : 'CatPixel',
      glb: solo ? null : 'lua.glb',
      faceIndex: face.index,
      faceId: face.id,
      light: input.light,
      haptic: input.haptic,
      screenOverlay: input.screenOverlay ?? 'NONE',
    },
    latencyMs,
    withinBudget: latencyMs < LUA_LIMITS.latencyBudgetMs,
    withoutOpcode: CHANNELS_WITHOUT_OPCODE,
    unmapped,
  };
}

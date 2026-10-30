// ReactionSequencer (T2-B). Orden fijo: fenómeno físico, pausa,
// reacción de Lúa (< 300 ms), pauta de palabra. En Set 2 la pausa
// mínima es 1000 ms para no pisar el resonador.
import type { UiLang } from '../../valeriaUiLang';
import { LUA_LIMITS } from '../../valeriaLuaProtocol';
import type { SteamActivityId, SteamArMode, SteamWorldId, WorldChallengeSpec, WorldEventSpec } from '../types';
import { linkLua, type LuaFrameSink, type LuaLinkProjection, type LuaMoodCode } from './LuaLink';
import { applyTurnGate, type TurnGateDecision } from './TurnGate';
import { promptWord, type WordPrompt } from './WordPrompter';

export const SET2_PAUSE_BEFORE_REACTION_MS = 1000;

export const REACTION_STEP_ORDER = ['phenomenon', 'pause', 'lua', 'word'] as const;

export type ReactionStep = (typeof REACTION_STEP_ORDER)[number];

export interface SequenceClock {
  now(): number;
  sleep(ms: number): Promise<void>;
}

const defaultClock: SequenceClock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  }),
};

export function isSet2(input: {
  worldId?: SteamWorldId;
  activityId?: SteamActivityId;
  eventId?: string;
}): boolean {
  if (input.worldId === 'S2') return true;
  if (input.activityId === 'AR-S02' || input.activityId === 'AR-SL02') return true;
  return input.eventId?.startsWith('S2.') === true;
}

export function resolvePauseBeforeReactionMs(input: {
  worldId?: SteamWorldId;
  activityId?: SteamActivityId;
  eventId?: string;
  pauseBeforeReactionMs?: number;
}): number {
  const raw = input.pauseBeforeReactionMs;
  const requested = typeof raw === 'number' && Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
  if (isSet2(input)) return Math.max(SET2_PAUSE_BEFORE_REACTION_MS, requested);
  return requested;
}

export interface ReactionSequenceInput {
  mode: SteamArMode;
  bleConnected: boolean;
  worldId?: SteamWorldId;
  activityId?: SteamActivityId;
  event: WorldEventSpec;
  ageYears?: number;
  neuroStage?: WorldChallengeSpec['neuroStage'];
  ageBand?: WorldChallengeSpec['ageBand'];
  lang: UiLang;
  englishTpr?: string;
  mood?: LuaMoodCode;
  useMoodAsFace?: boolean;
  accessory?: {
    slot?: 'HEAD' | 'NECK';
    itemId?: string;
    itemIndex?: number;
    clear?: boolean;
  };
  sink?: LuaFrameSink | null;
  clock?: SequenceClock;
}

export interface ReactionTrace {
  readonly order: readonly ReactionStep[];
  readonly set2: boolean;
  readonly pauseMs: number;
  readonly gate: TurnGateDecision;
  readonly link: LuaLinkProjection;
  readonly prompt: WordPrompt;
  readonly luaLatencyMs: number;
  readonly luaWithinBudget: boolean;
}

export async function runReactionSequence(input: ReactionSequenceInput): Promise<ReactionTrace> {
  const clock = input.clock ?? defaultClock;
  const order: ReactionStep[] = [];
  const set2 = isSet2({
    worldId: input.worldId,
    activityId: input.activityId,
    eventId: input.event.id,
  });
  const pauseMs = resolvePauseBeforeReactionMs({
    worldId: input.worldId,
    activityId: input.activityId,
    eventId: input.event.id,
    pauseBeforeReactionMs: input.event.pauseBeforeReactionMs,
  });

  order.push('phenomenon');
  order.push('pause');
  if (pauseMs > 0) await clock.sleep(pauseMs);

  const gate = applyTurnGate({
    turn: input.event.turn,
    isErrorOrBlockedState: input.event.isErrorOrBlockedState,
    ageYears: input.ageYears,
    neuroStage: input.neuroStage,
    ageBand: input.ageBand,
    light: input.event.reaction.light,
    haptic: input.event.reaction.haptic,
  });

  order.push('lua');
  const luaStarted = clock.now();
  const link = linkLua({
    mode: input.mode,
    bleConnected: input.bleConnected,
    expression: input.event.reaction.expression,
    mood: input.mood,
    useMoodAsFace: input.useMoodAsFace,
    pictoKey: input.event.reaction.pictoKey,
    awardFamily: input.event.reaction.awardFamily,
    accessory: input.accessory,
    light: gate.light,
    haptic: gate.haptic,
    screenOverlay: input.event.reaction.screenOverlay,
    sink: input.sink,
    now: () => clock.now(),
  });
  const luaLatencyMs = clock.now() - luaStarted;

  order.push('word');
  const prompt = promptWord({
    word: input.event.word,
    lang: input.lang,
    turn: input.event.turn,
    englishTpr: input.englishTpr ?? input.event.word.englishTpr,
    afterPhysicalPause: true,
  });

  if (order.join(',') !== REACTION_STEP_ORDER.join(',')) {
    throw new Error(`ReactionSequencer: orden ${order.join('→')}.`);
  }
  if (set2 && pauseMs < SET2_PAUSE_BEFORE_REACTION_MS) {
    throw new Error('ReactionSequencer: Set 2 exige 1000 ms antes de la reacción.');
  }

  return {
    order,
    set2,
    pauseMs,
    gate,
    link,
    prompt,
    luaLatencyMs,
    luaWithinBudget: luaLatencyMs < LUA_LIMITS.latencyBudgetMs && link.withinBudget,
  };
}

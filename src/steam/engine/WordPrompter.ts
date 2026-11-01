// WordPrompter (T2-B). Entrega la pauta al adulto y el comando TPR en
// inglés. No abre el corpus neuronal ni reproduce audio: la tableta solo
// queda autorizada a hablar en turno motor y después de la pausa física.
import type { UiLang } from '../../valeriaUiLang';
import type { SpatialCategory, WorldEventSpec } from '../types';

export interface WordPromptInput {
  word: WorldEventSpec['word'];
  lang: UiLang;
  turn: 'motor' | 'verbal';
  englishTpr?: string;
  /** Cierto solo cuando la pausa del fenómeno físico ya se ha cumplido. */
  afterPhysicalPause: boolean;
}

export interface WordPrompt {
  readonly lang: UiLang;
  readonly adultHint: string;
  readonly englishTpr: string;
  readonly spatialCategory: SpatialCategory;
  readonly tabletMaySpeak: boolean;
}

export function promptWord(input: WordPromptInput): WordPrompt {
  const englishTpr = (input.englishTpr ?? input.word.englishTpr ?? '').trim();
  const adultHint = input.word.adultHint[input.lang];
  const tabletMaySpeak = input.afterPhysicalPause === true
    && input.turn === 'motor'
    && englishTpr.length > 0;
  return {
    lang: input.lang,
    adultHint,
    englishTpr,
    spatialCategory: input.word.spatialCategory,
    tabletMaySpeak,
  };
}

// ============================================================================
// Valeria+ · Tipos para el Microjuego de Pesca / Arrastre (Aventuras con Lúa)
// Inspirado en mecánicas de Antura: arrastre sin temporizador estresante ni castigo
// ============================================================================
import type { PictoKey } from '../../../ValeriaPixelArt';

export interface DragTargetItem {
  id: string;
  label: string;
  emoji: string;
  pictogramKey?: PictoKey;
  isCorrect: boolean;
  x?: number;
  y?: number;
}

export interface DragFishingRound {
  id: string;
  prompt: string;
  targetStimulus: {
    label: string;
    emoji: string;
    pictogramKey?: PictoKey;
  };
  options: DragTargetItem[];
}

export interface DragFishingDDAState {
  consecutiveCorrect: number;
  consecutiveErrors: number;
  distractorCount: 2 | 3 | 4;
  showHesitationHint: boolean;
}

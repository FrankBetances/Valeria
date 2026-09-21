// ============================================================================
// Valeria+ · Adaptación Dinámica de Dificultad (DDA) para Arrastre sin Castigo
// ============================================================================
import type { DragFishingDDAState } from './dragFishingTypes';

export const INITIAL_DDA_STATE: DragFishingDDAState = {
  consecutiveCorrect: 0,
  consecutiveErrors: 0,
  distractorCount: 3,
  showHesitationHint: false,
};

export function updateDDAOnResult(
  current: DragFishingDDAState,
  isCorrect: boolean,
): DragFishingDDAState {
  if (isCorrect) {
    const nextCorrect = current.consecutiveCorrect + 1;
    let nextDistractors = current.distractorCount;
    if (nextCorrect >= 3 && current.distractorCount < 4) {
      nextDistractors = (current.distractorCount + 1) as 2 | 3 | 4;
    }
    return {
      consecutiveCorrect: nextCorrect,
      consecutiveErrors: 0,
      distractorCount: nextDistractors,
      showHesitationHint: false,
    };
  } else {
    // Error: cero castigo, solo se suaviza el número de distractores si se acumulan 2 fallos
    const nextErrors = current.consecutiveErrors + 1;
    let nextDistractors = current.distractorCount;
    if (nextErrors >= 2 && current.distractorCount > 2) {
      nextDistractors = (current.distractorCount - 1) as 2 | 3 | 4;
    }
    return {
      consecutiveCorrect: 0,
      consecutiveErrors: nextErrors,
      distractorCount: nextDistractors,
      showHesitationHint: false,
    };
  }
}

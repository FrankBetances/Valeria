// ============================================================================
// Valeria+ · Generador de Distractores Fonéticos Graduados para Dislexia (DX)
// Basado en distancias de rasgos acústicos (Punto, Modo, Sonoridad) y no en Levenshtein
// ============================================================================
import { PHONEME_REGISTRY } from './phoneme-features';
import { distanceBySymbol } from './phoneme-distance';

export interface GraduatedDistractorSet {
  targetWord: string;
  targetPhoneme: string;
  distractors: {
    d1_close: string[];   // Oposición acústica mínima (D=1) - Alta interferencia
    d2_medium: string[];  // Oposición intermedia (D=2) - Dificultad media
    d3_distant: string[]; // Oposición máxima (D=3) - Fácil detección
  };
}

/**
 * Genera distractores graduados para una palabra objetivo.
 */
export function generateDistractorsForTarget(
  targetWord: string,
  targetInitialConsonant: string,
  candidatePool: Array<{ word: string; initialConsonant: string }>,
): GraduatedDistractorSet {
  const d1List: string[] = [];
  const d2List: string[] = [];
  const d3List: string[] = [];

  for (const candidate of candidatePool) {
    if (candidate.word.toLowerCase() === targetWord.toLowerCase()) continue;

    const dist = distanceBySymbol(targetInitialConsonant, candidate.initialConsonant);
    if (dist === 1) {
      d1List.push(candidate.word);
    } else if (dist === 2) {
      d2List.push(candidate.word);
    } else {
      d3List.push(candidate.word);
    }
  }

  return {
    targetWord,
    targetPhoneme: targetInitialConsonant,
    distractors: {
      d1_close: d1List.slice(0, 3),
      d2_medium: d2List.slice(0, 3),
      d3_distant: d3List.slice(0, 3),
    },
  };
}

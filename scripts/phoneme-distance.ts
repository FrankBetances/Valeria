// ============================================================================
// Valeria+ · Motor de Distancia Fonémica y Oposición Fonológica (Port de minpair)
// ============================================================================
import {
  PhonemeFeatureVector,
  PHONEME_REGISTRY,
  PLACE_SCORES,
  MANNER_SCORES,
} from './phoneme-features';

/**
 * Calcula la distancia fonémica de rasgos distintivos entre dos fonemas (Punto, Modo, Sonoridad).
 * Devuelve un entero entre 0 y 3:
 *   0: Idéntico
 *   1: Oposición mínima (1 rasgo difiere, ej. p / b difieren solo en sonoridad)
 *   2: Oposición intermedia (2 rasgos difieren)
 *   3: Oposición máxima (los 3 rasgos difieren, ej. m / k)
 */
export function phonemicDistance(
  f1: PhonemeFeatureVector,
  f2: PhonemeFeatureVector,
): number {
  if (f1.symbol === f2.symbol) return 0;

  const diffVoicing = f1.voicing !== f2.voicing ? 1 : 0;
  const diffPlace = f1.place !== f2.place ? 1 : 0;
  const diffManner = f1.manner !== f2.manner ? 1 : 0;

  return diffVoicing + diffPlace + diffManner;
}

/**
 * Distancia fonémica por clave de registro (ej. 'p', 'b', 'k', 'ch').
 */
export function distanceBySymbol(sym1: string, sym2: string): number {
  const norm1 = sym1.toLowerCase().trim();
  const norm2 = sym2.toLowerCase().trim();
  const f1 = PHONEME_REGISTRY[norm1];
  const f2 = PHONEME_REGISTRY[norm2];

  if (!f1 || !f2) {
    // Si no está registrado en la matriz, estimar por igualdad de símbolo
    return norm1 === norm2 ? 0 : 2;
  }

  return phonemicDistance(f1, f2);
}

/**
 * Algoritmo O(N) de agrupamiento por plantilla wildcard (port de minpair).
 * Agrupa palabras que comparten el mismo marco fonológico excepto en una posición.
 */
export function generateWildcardTemplates(words: string[]): Map<string, string[]> {
  const buckets = new Map<string, string[]>();

  for (const word of words) {
    const chars = Array.from(word.toLowerCase());
    for (let i = 0; i < chars.length; i++) {
      // Reemplaza la posición i con '.' para crear la plantilla
      const template = chars.map((ch, idx) => (idx === i ? '.' : ch)).join('');
      const list = buckets.get(template) || [];
      list.push(word);
      buckets.set(template, list);
    }
  }

  return buckets;
}

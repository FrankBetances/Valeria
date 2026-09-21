// ============================================================================
// Valeria+ · Detección de Inversión Angular en Grafomotricidad
// Permite detectar rotaciones anómalas e inversiones en letras críticas (b vs d, p vs q)
// ============================================================================
import type { Point } from '../valeriaWritingTypes';

/**
 * Calcula el signo de curvatura mediante el producto cruzado en 2D entre 3 puntos:
 * (B - A) × (C - B)
 *   > 0 : Giro antihorario (ej. trazo ascendente o bucle natural de 'b')
 *   < 0 : Giro horario (ej. trazo invertido o bucle de 'd')
 *   = 0 : Colineal o recta
 */
export function curvatureSign(a: Point, b: Point, c: Point): -1 | 0 | 1 {
  const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
  if (Math.abs(cross) < 1.0) return 0; // Umbral de estabilidad ante microtemblores infantiles
  return cross > 0 ? 1 : -1;
}

/**
 * Analiza la ventana deslizante reciente del trazo para determinar si existe
 * una inversión persistente de rotación angular respecto a la dirección esperada.
 *
 * @param points Array de puntos acumulados en el trazo activo
 * @param expectedSign Signo esperado del modelo (-1 horario, 1 antihorario)
 * @param windowSize Tamaño de la ventana deslizante reciente (default: 8)
 * @returns true si más del 60% de los giros válidos contradicen el signo esperado
 */
export function detectInversion(
  points: Point[],
  expectedSign: -1 | 1,
  windowSize = 8,
): boolean {
  if (!points || points.length < windowSize + 2) {
    return false;
  }

  const recent = points.slice(-windowSize - 2);
  let countExpected = 0;
  let countOpposite = 0;

  for (let i = 0; i < recent.length - 2; i++) {
    const sign = curvatureSign(recent[i], recent[i + 1], recent[i + 2]);
    if (sign === expectedSign) {
      countExpected++;
    } else if (sign === -expectedSign) {
      countOpposite++;
    }
  }

  const totalValid = countExpected + countOpposite;
  if (totalValid < 4) return false;

  return countOpposite / totalValid >= 0.6;
}

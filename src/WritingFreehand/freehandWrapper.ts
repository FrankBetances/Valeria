// ============================================================================
// Valeria+ · Adaptador para perfect-freehand (Grafomotricidad Infantil)
// Genera polígonos cerrados suaves con simulación de presión y adelgazamiento.
// ============================================================================
import { getStroke, StrokeOptions } from 'perfect-freehand';
import type { Point } from '../valeriaWritingTypes';

/**
 * Configuración adaptativa para trazo infantil con dedo o stylus.
 */
export const PEDIATRIC_STROKE_OPTIONS: StrokeOptions = {
  size: 10,
  thinning: 0.45,
  smoothing: 0.55,
  streamline: 0.45,
  simulatePressure: true,
  start: {
    cap: true,
    taper: 0,
  },
  end: {
    cap: true,
    taper: 0,
  },
};

/**
 * Convierte un array de puntos [x, y] en comandos de Path SVG Bézier cuadráticos
 * que rellenan un polígono cerrado (fill={color}).
 */
export function getSvgPathFromStroke(outlinePoints: number[][], closed = true): string {
  const len = outlinePoints.length;
  if (len < 4) return '';

  let a = outlinePoints[0];
  let b = outlinePoints[1];
  const c = outlinePoints[2];

  let result = `M ${a[0].toFixed(2)} ${a[1].toFixed(2)} Q ${b[0].toFixed(2)} ${b[1].toFixed(2)} ${((b[0] + c[0]) / 2).toFixed(2)} ${((b[1] + c[1]) / 2).toFixed(2)} T`;

  for (let i = 2; i < len - 1; i++) {
    a = outlinePoints[i];
    b = outlinePoints[i + 1];
    result += ` ${((a[0] + b[0]) / 2).toFixed(2)} ${((a[1] + b[1]) / 2).toFixed(2)}`;
  }

  if (closed) {
    result += ' Z';
  }

  return result;
}

/**
 * Convierte puntos de PanResponder en un path SVG cerrado y orgánico.
 * Si hay menos de 3 puntos, retorna un path circular o directo para visualización inmediata.
 */
export function toFreehandPath(
  points: Point[],
  isComplete = false,
  baseSize = 10,
): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    const r = baseSize / 2;
    return `M ${p.x - r} ${p.y} A ${r} ${r} 0 1 0 ${p.x + r} ${p.y} A ${r} ${r} 0 1 0 ${p.x - r} ${p.y} Z`;
  }

  const rawInput = points.map((pt) => [pt.x, pt.y]);
  const stroke = getStroke(rawInput, {
    ...PEDIATRIC_STROKE_OPTIONS,
    size: baseSize,
    last: isComplete,
  });

  const svgPath = getSvgPathFromStroke(stroke, true);
  if (!svgPath && points.length >= 2) {
    // Fallback lineal si el polígono no se pudo cerrar
    return `M ${points[0].x} ${points[0].y} L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  }

  return svgPath;
}

// ============================================================================
// Valeria+ · Contorno de trazo con presión simulada (grafomotricidad)
//
// Qué cambia respecto al trazo anterior: la línea deja de ser un tubo de ancho
// constante y pasa a ser un POLÍGONO que se estrecha cuando la mano corre y se
// ensancha cuando frena. Es lo que hace un lápiz de verdad, y es lo que el niño
// espera ver cuando aprieta: sin eso, el lienzo se siente como un rotulador de
// pizarra y no como escribir.
//
// Clínicamente importa porque la velocidad del trazo ES un dato grafomotor: un
// trazo uniforme esconde los tirones y las paradas, y con grosor variable el
// adulto los ve en el papel sin necesidad de mirar la mano del niño.
//
// Módulo PURO: solo geometría. No importa react-native ni expo, así que el
// banco de trazos puede seguir entrando en el corpus de voz.
// ============================================================================
import { getStroke, StrokeOptions } from 'perfect-freehand';
import type { Point } from './valeriaWritingTypes';

// Ajustes para mano infantil con dedo o stylus capacitivo.
//
// `simulatePressure` está activo porque la presión REAL solo llega con Apple
// Pencil o S-Pen; con el dedo, Android no la reporta y la librería la deduce de
// la velocidad. Usar la deducida en todos los casos evita que el mismo trazo se
// dibuje distinto según el aparato, que en una tarea de copia sería un cambio de
// la consigna, no del adorno.
//
// `streamline` alto (0.45) porque el temblor fisiológico de un niño de 5 años
// mete dientes de sierra que no son intención del trazo; `thinning` moderado
// (0.45) para que el estrechamiento se vea sin llegar a cortar la línea.
export const PEDIATRIC_STROKE: StrokeOptions = {
  size: 8,
  thinning: 0.45,
  smoothing: 0.55,
  streamline: 0.45,
  simulatePressure: true,
  start: { cap: true, taper: 0 },
  end: { cap: true, taper: 0 },
};

/**
 * Convierte el contorno que devuelve perfect-freehand en un path SVG cerrado.
 *
 * Emite cuadráticas explícitas (`Q`) con el punto medio como destino, que es la
 * misma técnica que `pointsToSmoothSvgPath` ya usa en el lienzo. NO se usa el
 * atajo `T`: su punto de control es el reflejo del anterior, así que depende de
 * que el comando previo sea Q o T y de cómo lo interprete cada motor. Con `Q`
 * explícita el path dice exactamente lo que dibuja en cualquier parser.
 */
export function outlineToSvgPath(outline: number[][]): string {
  const n = outline.length;
  if (n < 4) return '';

  const round = (v: number): string => v.toFixed(2);
  let d = `M ${round(outline[0][0])} ${round(outline[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % n];
    d += ` Q ${round(a[0])} ${round(a[1])} ${round((a[0] + b[0]) / 2)} ${round((a[1] + b[1]) / 2)}`;
  }
  return `${d} Z`;
}

/**
 * Contorno de un trazo a partir de los puntos capturados por el PanResponder.
 *
 * @param points  puntos en orden de captura
 * @param done    true cuando el dedo ya ha levantado (cierra el extremo final)
 * @param size    ancho máximo del trazo, el mismo `strokeWidth` del lienzo
 * @returns       path SVG CERRADO para pintar con `fill`, o '' si no hay bastante
 *                trazo para formar un polígono (el lienzo cae entonces al trazo
 *                de ancho constante, que siempre sabe dibujar dos puntos).
 */
export function freehandPath(points: Point[], done: boolean, size: number): string {
  if (!points || points.length < 2) return '';
  const input = points.map((p) => [p.x, p.y]);
  const outline = getStroke(input, { ...PEDIATRIC_STROKE, size, last: done });
  return outlineToSvgPath(outline);
}

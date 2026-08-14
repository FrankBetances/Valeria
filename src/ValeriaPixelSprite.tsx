// ============================================================================
// Valeria+ · Dibuja una matriz de píxel art de 24×24
//
// Contesta la pregunta que dejó abierta la D-7: cómo se enseña en una tableta
// de diez pulgadas un dibujo pensado para un panel de 240 px.
//
// La respuesta es la misma que ya usaba PixelAward con sus mapas de 12×12: la
// matriz no se rasteriza, se convierte en rectángulos de SVG. Un SVG escala sin
// pérdida, así que el mismo dato se ve nítido en el cristal de 32 mm del
// aparato y a pantalla completa en la tableta. Lo que NO se puede hacer es
// meterlo en un <Image> y estirarlo: ahí sí aparece el suavizado que convierte
// el píxel art en una mancha.
//
// Dos detalles que no son adorno:
//   · el lado de la celda se redondea a entero — con un lado fraccionario el
//     antialias mete costuras entre filas (mismo motivo que en ValeriaCatPixel);
//   · las celdas contiguas del mismo color se funden en un solo rectángulo, así
//     que un pictograma sale en decenas de nodos y no en 576.
// ============================================================================
import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';

import { PIXEL_PALETTE, PIXEL_SIDE } from './ValeriaPixelArt';

interface Run { x: number; y: number; w: number; fill: string; }

/**
 * Funde las celdas contiguas del mismo color en un solo rectángulo.
 *
 * `overrides` sustituye el color de un carácter concreto: es lo que deja que
 * las celdas 'a' y 'b' de una insignia tomen el tono de su rango sin duplicar
 * la matriz cinco veces.
 */
export const mergePixelRuns = (
  map: readonly string[],
  overrides?: Record<string, string>,
): Run[] => {
  const runs: Run[] = [];
  const colorOf = (c: string): string | undefined =>
    (overrides && overrides[c]) || PIXEL_PALETTE[c];

  map.forEach((row, y) => {
    let start = -1;
    let fill: string | undefined;
    for (let x = 0; x <= row.length; x++) {
      const c = x < row.length ? row[x] : '.';
      const here = colorOf(c);
      if (here !== fill) {
        if (fill && start >= 0) runs.push({ x: start, y, w: x - start, fill });
        fill = here;
        start = x;
      }
    }
  });
  return runs;
};

interface Props {
  map: readonly string[];
  /** Lado en píxeles de pantalla. Se redondea al múltiplo entero más cercano. */
  size?: number;
  overrides?: Record<string, string>;
}

export const ValeriaPixelSprite: React.FC<Props> = ({ map, size = 96, overrides }) => {
  const runs = useMemo(() => mergePixelRuns(map, overrides), [map, overrides]);
  const cell = Math.max(1, Math.round(size / PIXEL_SIDE));
  const side = cell * PIXEL_SIDE;
  return (
    <Svg width={side} height={side} viewBox={`0 0 ${PIXEL_SIDE} ${PIXEL_SIDE}`}>
      {runs.map((r) => (
        // El +0,1 solapa la costura entre rectángulos vecinos. Sin él se ve una
        // rejilla de líneas de fondo entre las filas.
        <Rect
          key={`${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width={r.w + 0.1}
          height={1.1}
          fill={r.fill}
        />
      ))}
    </Svg>
  );
};

export default ValeriaPixelSprite;

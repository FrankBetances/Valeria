// ============================================================================
// Valeria+ · Lúa, la gata · mascota en píxel art
//
// Sustituye al oso vectorial como cara del producto. Píxel art de verdad: el
// dibujo es una rejilla de caracteres que se pinta como rectángulos de 1×1 en
// el viewBox, así que escala a cualquier tamaño sin perder el borde duro y sin
// un solo PNG en el repositorio.
//
// Por qué en código y no como imagen (regla 5 · «premium» = activos propios):
//   · Un mapa de texto se revisa en el diff. Un PNG no.
//   · Sin @1x/@2x/@3x, sin peso en el APK, sin dependencia de resolución.
//   · La misma rejilla vale para la pantalla circular de 240×240 del
//     periférico Lúa (docs/plan-integracion-lua.md): allí el píxel art no es
//     un estilo, es el formato nativo del aparato.
//
// ── Qué hace que la gata resulte encantadora y no solo correcta ────────────
// La primera versión era una gata «bien dibujada» que no caía simpática. Lo
// que la arregló, en este orden:
//
//   1. OJOS GRANDES Y BRILLANTES. Cuatro píxeles de lado con dos de brillo
//      blanco. Es el rasgo que más pesa: con ojos de 2 px la cara queda
//      inexpresiva por muy correcta que sea la silueta.
//   2. NADA DE PUPILA OSCURA. En una gata NEGRA, una pupila oscura toca el
//      borde del ojo y se funde con la cabeza: el ojo se parte y lee a gafas.
//      El ojo es turquesa pleno; la pupila queda implícita.
//   3. SILUETA REDONDA. Cabeza y cuerpo son elipses con el contorno calculado
//      desde la forma, no cajas con las esquinas limadas.
//   4. RUBOR. Dos píxeles rosas en los pómulos. Cuesta dos píxeles y es la
//      diferencia entre una gata y una gata simpática.
//   5. PROPORCIÓN CHIBI. Cabeza grande sobre cuerpo pequeño, patas y pechera
//      blancas, cola enroscada pegada al cuerpo.
//
// Rendimiento: los píxeles contiguos de una fila se funden en UN rectángulo
// (mergeRuns). La gata pasa de ~300 <Rect> a ~80. Importa porque la mascota se
// pinta también dentro de listas.
// ============================================================================
import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';

// Leyenda de la rejilla:
//   .  transparente   o  contorno        b  cuerpo (negro)   l  blanco
//   p  rosa (oreja)   c  rubor           e  ojo              u  boca
//   w  brillo del ojo
type PixelMap = string[];

// Gata sentada, de frente, con la cola enroscada. 22×24.
const SIT: PixelMap = [
  '.....o..........o.....',
  '.....oo........oo.....',
  '....opo........opo....',
  '....oppooooooooppo....',
  '...oppppbbbbbbbpppo...',
  '...obbbbbbbbbbbbbbo...',
  '...obbbbbbbbbbbbbbo...',
  '..obbwweebbbbwweebbo..',
  '..obbweeebbbbweeebbo..',
  '..obbeeeebbbbeeeebbo..',
  '..obbeeeebbbbeeeebbo..',
  '..ocbbbbbbbbbbbbbbco..',
  '...obbbbllppllbbbbo...',
  '....obbllllllllbbo....',
  '.....obblluullbbo.....',
  '......obbbbbbbbo......',
  '.....obbllllllbbo.oo..',
  '.....obbllllllbbo.oo..',
  '....obbllllllllbbobo..',
  '.....obllllllllbbbbo..',
  '.....obllllllllbbbbo..',
  '.....ollllllllllboo...',
  '.....ooollllllooo.....',
  '........oooooo........',
];

export interface CatPalette {
  o: string; b: string; l: string; p: string; c: string; e: string; u: string; w: string;
}

/** Smoking: negra con pechera y guantes blancos. La de marca. */
export const CAT_TUXEDO: CatPalette = {
  o: '#171520', b: '#3a3646', l: '#faf8f4', p: '#f4a9b6',
  c: '#f08a9c', e: '#00d6cf', u: '#0d1420', w: '#ffffff',
};

/** Silueta plana de un solo color: para marcas de agua y estados apagados. */
export const catSilhouette = (color: string): CatPalette => ({
  o: color, b: color, l: color, p: color, c: color, e: color, u: color, w: color,
});

// Píxeles contiguos del mismo color → un solo rectángulo.
interface Run { x: number; y: number; w: number; fill: string; }

const mergeRuns = (map: PixelMap, pal: CatPalette): Run[] => {
  const runs: Run[] = [];
  map.forEach((row, y) => {
    let start = -1;
    let key = '';
    for (let x = 0; x <= row.length; x++) {
      const c = x < row.length ? row[x] : '.';
      if (c !== key) {
        if (key !== '.' && key !== '' && start >= 0) {
          runs.push({ x: start, y, w: x - start, fill: pal[key as keyof CatPalette] });
        }
        key = c;
        start = x;
      }
    }
  });
  return runs;
};

interface Props {
  size?: number;
  palette?: CatPalette;
}

/**
 * La gata. `size` es el ancho final en px; el alto sale de la proporción de la
 * rejilla, así que la mascota nunca se deforma.
 */
export const CatPixel: React.FC<Props> = ({ size = 96, palette = CAT_TUXEDO }) => {
  const cols = SIT[0].length;
  const rows = SIT.length;
  const runs = useMemo(() => mergeRuns(SIT, palette), [palette]);
  // El lado del píxel se REDONDEA a entero y el lienzo se recalcula a partir de
  // él: con un lado fraccionario cada fila cae en una posición distinta y el
  // antialias dibuja una costura clara entre filas.
  const cell = Math.max(1, Math.round(size / cols));
  return (
    <Svg width={cell * cols} height={cell * rows} viewBox={`0 0 ${cols} ${rows}`}>
      {runs.map((r) => (
        // Sangrado de 0,1 hacia abajo y hacia la derecha. El lado entero basta
        // mientras el dibujo esté quieto, pero la mascota de Bienvenida va
        // animada (flota, salta y se inclina) y bajo una escala fraccionaria
        // vuelven las costuras. La fila siguiente repinta ese sangrado, así que
        // solo sobresale en el borde exterior de la silueta.
        <Rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
      ))}
    </Svg>
  );
};

export default CatPixel;

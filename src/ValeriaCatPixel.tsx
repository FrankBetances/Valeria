// ============================================================================
// Valeria+ · Lúa, la gata · mascota en píxel art
//
// Sustituye al oso vectorial (ValeriaBearLogo) como cara del producto. Píxel
// art de verdad: el dibujo es una rejilla de caracteres y se pinta como
// rectángulos de 1×1 en el viewBox, así que escala a cualquier tamaño sin
// perder el borde duro y sin un solo PNG en el repositorio.
//
// Por qué en código y no como imagen (regla 5 · «premium» = activos propios):
//   · Un mapa de texto se revisa en el diff. Un PNG no.
//   · Sin @1x/@2x/@3x, sin peso en el APK, sin dependencia de resolución.
//   · La misma rejilla vale para la pantalla circular de 240×240 del
//     periférico Lúa (docs/plan-integracion-lua.md): allí el píxel art no es
//     un estilo, es el formato nativo del aparato.
//
// Rendimiento: los píxeles contiguos de una fila se funden en UN rectángulo
// (mergeRuns). La gata sentada pasa de ~300 <Rect> a ~70. Importa porque la
// mascota se pinta también dentro de listas.
// ============================================================================
import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';

// Leyenda de la rejilla:
//   .  transparente      o  contorno          b  cuerpo (negro)
//   l  blanco (pechera)  p  rosa (nariz/oreja) e  iris    u  pupila   w  brillo
type PixelMap = string[];

export type CatPose = 'sit' | 'head';

// Gata sentada, de frente, con la cola enroscada. 24×23.
const SIT: PixelMap = [
  '....oo..........oo......',
  '...obbo........obbo.....',
  '...obpbo......obpbo.....',
  '..obbppbo....obppbbo....',
  '..obbbbbboooobbbbbbo....',
  '.obbbbbbbbbbbbbbbbbbo...',
  '.obbbbbbbbbbbbbbbbbbo...',
  '.obbweebbbbbbbbeewbbo...',
  '.obbeuebbbbbbbbeuebbo...',
  '.obbbbbbbblllbbbbbbbo...',
  '.obbbbbbbllpplbbbbbbo...',
  '..obbbbbbllllbbbbbbo....',
  '..obbbbbbbllbbbbbbbo....',
  '...obbbbbbbbbbbbbbo.....',
  '....oobbbbbbbbbboo......',
  '.....obbbllllbbbo.......',
  '....obbblllllbbbbo......',
  '....obblllllllbbbo..oo..',
  '....obblllllllbbbo.obbo.',
  '....obbbbbbbbbbbbo.obbo.',
  '....obbbbbbbbbbbboobbbo.',
  '....ollbbbbbbllbbbbbbo..',
  '.....oooooooooooooooo...',
];

// Solo la cabeza. Para sitios donde la gata tiene que caber en un chip. 16×15.
const HEAD: PixelMap = [
  '..oo........oo..',
  '.obbo......obbo.',
  '.obpbo....obpbo.',
  'obbppbo..obppbbo',
  'obbbbboooobbbbbo',
  'obbbbbbbbbbbbbbo',
  'obbweebbbbeewbbo',
  'obbeuebbbbeuebbo',
  'obbbbbblllbbbbbo',
  'obbbbbllpplbbbbo',
  '.obbbbllllbbbbo.',
  '.obbbbbllbbbbbo.',
  '..obbbbbbbbbbo..',
  '...oobbbbbboo...',
  '.....oooooo.....',
];

const MAPS: Record<CatPose, PixelMap> = { sit: SIT, head: HEAD };

export interface CatPalette {
  o: string; b: string; l: string; p: string; e: string; u: string; w: string;
}

/** Smoking: negra con pechera y guantes blancos. La de marca. */
export const CAT_TUXEDO: CatPalette = {
  o: '#1c1a23', b: '#36333f', l: '#f7f5f1', p: '#ef92a4',
  e: '#00c4be', u: '#101722', w: '#ffffff',
};

/** Silueta plana de un solo color: para marcas de agua y estados apagados. */
export const catSilhouette = (color: string): CatPalette => ({
  o: color, b: color, l: color, p: color, e: color, u: color, w: color,
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
  pose?: CatPose;
  palette?: CatPalette;
}

/**
 * La gata. `size` es el ancho final en px; el alto sale de la proporción de la
 * rejilla, así que la mascota nunca se deforma.
 */
export const CatPixel: React.FC<Props> = ({ size = 96, pose = 'sit', palette = CAT_TUXEDO }) => {
  const map = MAPS[pose];
  const cols = map[0].length;
  const rows = map.length;
  const runs = useMemo(() => mergeRuns(map, palette), [map, palette]);
  // El lado del píxel se REDONDEA a entero y el lienzo se recalcula a partir de
  // él. Si no, un ancho de 104 px sobre 24 columnas da 4,33 px por píxel, cada
  // fila cae en una fracción distinta y el antialias dibuja una costura clara
  // entre filas: la gata sale rayada. Con el lado entero, cada píxel del dibujo
  // es un bloque exacto de píxeles de pantalla.
  const cell = Math.max(1, Math.round(size / cols));
  return (
    <Svg width={cell * cols} height={cell * rows} viewBox={`0 0 ${cols} ${rows}`}>
      {runs.map((r) => (
        // Sangrado de 0,1 hacia abajo y hacia la derecha. El lado entero basta
        // mientras el dibujo esté quieto, pero la mascota de Bienvenida va
        // animada (flota, salta y se inclina) y bajo una escala fraccionaria el
        // antialias abre una costura clara entre filas: la gata sale rayada. La
        // fila siguiente repinta ese sangrado, así que solo sobresale en el
        // borde exterior de la silueta, donde no se ve.
        <Rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
      ))}
    </Svg>
  );
};

export default CatPixel;

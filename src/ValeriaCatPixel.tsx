// ============================================================================
// Valeria+ · Lúa, la gata · mascota en píxel art
//
// El dibujo es una rejilla de caracteres que se pinta como rectángulos de 1×1
// en el viewBox: escala a cualquier tamaño sin perder el borde duro y sin un
// solo PNG en el repositorio. Un mapa de texto se revisa en el diff; un PNG no.
// Y es el formato nativo del panel de 240×240 del periférico Lúa
// (docs/plan-integracion-lua.md): la cara del aparato y la de la app salen de
// la misma rejilla.
//
// ── Por qué la cara no se definía, y qué lo arregló ────────────────────────
// La versión anterior era UNA sola rejilla de 22×24 para el cuerpo entero. A la
// cara le tocaban 13 filas, así que a 52 px —el tamaño al que se pinta en la
// tira de juego— la cara medía 26 px de alto y los rasgos se emborronaban. No
// era un problema de dibujo: era de resolución.
//
//   1. MÁS REJILLA. 30×34 el cuerpo entero, 26×24 la cabeza sola.
//   2. DOS POSES. Debajo de 90 px se pinta la CABEZA, que aprovecha todo el
//      cuadro para la cara; por encima, el cuerpo entero. Lo elige el propio
//      componente, así que ninguna pantalla puede pedir por error la pose que
//      se emborrona.
//   3. RASGOS DIBUJADOS A MANO. Los ojos y el hocico son sprites fijos. La
//      versión generada por fórmula sacaba ojos rectangulares con la pupila
//      ocupando medio ojo: se leían como gafas de sol a cualquier tamaño.
//   4. PELO CLARO EN LA FRENTE. Una gata negra sin un segundo tono es una
//      mancha plana en cuanto baja de 60 px.
//   5. CUELLO. Cabeza y cuerpo eran dos elipses que se tocaban en un píxel: el
//      blanco del hocico se fundía con el de la pechera y de la barbilla al
//      vientre había una sola mancha clara.
//
// Rendimiento: los píxeles contiguos de una fila se funden en UN rectángulo
// (mergeRuns). Importa porque la mascota se pinta también dentro de listas.
// ============================================================================
import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';

// Leyenda de la rejilla:
//   .  transparente   o  contorno     b  pelo        s  pelo claro (volumen)
//   l  blanco         p  rosa         c  rubor       e  iris
//   u  pupila / boca  w  brillo
type PixelMap = string[];

export type CatPose = 'sit' | 'head';

// Gata sentada, de frente, con la cola enroscada. 30×34.
const SIT: PixelMap = [
  '.......o...............o......',
  '.......oo..............o......',
  '......opo.............opo.....',
  '......oppo............opo.....',
  '......obbo...........obbbo....',
  '.....obbbsooooooooooobbbbo....',
  '.....obbssssbbbbbbssssbbbo....',
  '....obbssbbbbbbbbbbbbssbbbo...',
  '....oobsbbbbbbbbbbbbbbsbooo...',
  '......obbbbbbbbbbbbbbbbo......',
  '......obbeeeebbbbeeeebbo......',
  '.....obbeeeeeebbeeeeeebbo.....',
  '.....obbewuueebbewuueebbo.....',
  '.....obbeeuueebbeeuueebbo.....',
  '.....obbeeeeelllleeeeebbo.....',
  '......obbeeelllllleeebbo......',
  '......occbbllllllllbbbcco.....',
  '......ooobblllpplllbboooo.....',
  '.........obllluulllbo.........',
  '..........obllllllbo..........',
  '..........obbllllbbo..........',
  '..........obbbbbbbbo..........',
  '.........obbbllllbbbo....ooo..',
  '........obbllllllllbbo...obo..',
  '.......obbllllllllllbbo..obo..',
  '......obbbllllllllllbbbo.obo..',
  '......obbbllllllllllbbbo.obo..',
  '......obbbllllllllllbbbbobbo..',
  '......obbbllllllllllbbbbbbbo..',
  '......obbbbllllllllbbbbbbbo...',
  '.......olllbbllllbbllllbbbo...',
  '.......olllbbbbbbbblllloooo...',
  '.......oooobbbbbbbboooo.......',
  '...........oooooooo...........',
];

// Solo la cabeza. Para todo lo que se pinte pequeño. 26×24.
const HEAD: PixelMap = [
  '......o.............o.....',
  '......o.............o.....',
  '.....opo...........opo....',
  '.....opo...........opo....',
  '.....oppo.........oppo....',
  '....obbbo..oooo...obbbo...',
  '....obbssoossssooosbbbo...',
  '....ossssssbbbbssssssbo...',
  '...osssbbbbbbbbbbbbsssbo..',
  '...ossbbbbbbbbbbbbbbssoo..',
  '....obbbbbbbbbbbbbbbbo....',
  '...obbbbbbbbbbbbbbbbbbo...',
  '...obbeeeebbbbbbeeeebbo...',
  '..obbeeeeeebbbbeeeeeebbo..',
  '..obbewuueebbbbewuueebbo..',
  '..obbeeuueebbbbeeuueebbo..',
  '..obbeeeeeebbbbeeeeeebbo..',
  '...obbeeeebllllbeeeebbo...',
  '...occbbbbllllllbbbbbcco..',
  '...oocbbbllllllllbbbbooo..',
  '.....obbblllpplllbbbo.....',
  '......oobllluulllboo......',
  '........ooollllooo........',
  '...........oooo...........',
];

const MAPS: Record<CatPose, PixelMap> = { sit: SIT, head: HEAD };

// Por debajo de este ancho, el cuerpo entero deja la cara en menos de 30 px y
// se emborrona. Es el umbral que decide la pose cuando nadie la fija a mano.
const HEAD_BELOW = 90;

export interface CatPalette {
  o: string; b: string; s: string; l: string; p: string;
  c: string; e: string; u: string; w: string;
}

/** Smoking: negra con pechera y guantes blancos. La de marca. */
export const CAT_TUXEDO: CatPalette = {
  o: '#141220', b: '#3d3949', s: '#524d61', l: '#fbf9f5', p: '#f4a9b6',
  c: '#ef8296', e: '#00e0d8', u: '#0d1420', w: '#ffffff',
};

/** Silueta plana de un solo color: para marcas de agua y estados apagados. */
export const catSilhouette = (color: string): CatPalette => ({
  o: color, b: color, s: color, l: color, p: color,
  c: color, e: color, u: color, w: color,
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
  /** Por omisión la elige el tamaño: cabeza si es pequeño, cuerpo si es grande. */
  pose?: CatPose;
  palette?: CatPalette;
}

/**
 * La gata. `size` es el ancho final en px; el alto sale de la proporción de la
 * rejilla, así que la mascota nunca se deforma.
 */
export const CatPixel: React.FC<Props> = ({ size = 96, pose, palette = CAT_TUXEDO }) => {
  const chosen: CatPose = pose ?? (size < HEAD_BELOW ? 'head' : 'sit');
  const map = MAPS[chosen];
  const cols = map[0].length;
  const rows = map.length;
  const runs = useMemo(() => mergeRuns(map, palette), [map, palette]);
  // El lado del píxel se REDONDEA a entero y el lienzo se recalcula a partir de
  // él: con un lado fraccionario cada fila cae en una posición distinta y el
  // antialias dibuja una costura clara entre filas.
  const cell = Math.max(1, Math.round(size / cols));
  return (
    <Svg width={cell * cols} height={cell * rows} viewBox={`0 0 ${cols} ${rows}`}>
      {runs.map((r) => (
        // Sangrado de 0,1 hacia abajo y hacia la derecha. El lado entero basta
        // con el dibujo quieto, pero la mascota de Bienvenida va animada y bajo
        // una escala fraccionaria vuelven las costuras. La fila siguiente
        // repinta ese sangrado, así que solo sobresale en el borde exterior.
        <Rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
      ))}
    </Svg>
  );
};

export default CatPixel;

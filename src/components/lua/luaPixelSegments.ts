// ============================================================================
// Valeria+ · Lúa · Capas anatómicas, gestos y coleccionables
//
// Todo deriva de la matriz canónica SIT (32×38) de ValeriaCatPixel.tsx, que es
// la fuente única: la misma rejilla que alimenta icono, splash y el panel del
// periférico. Dos reglas que costaron una revisión entera:
//
//   1. TODA fila mide 32. Una fila de 33 desplaza los rasgos un píxel y saca
//      el contorno fuera de la silueta; se ve como un bulto en un solo renglón.
//   2. Los ojos cerrados se dibujan con color, NUNCA con '.'. El transparente
//      abre un agujero por el que se ve la placa a través de la cabeza.
//
// Los accesorios se dibujan compactos y se anclan por coordenada SIT: el mismo
// dibujo sirve de icono en el armario (recortado a su caja) y de capa sobre la
// gata (expandido a 32×38), así que no hay dos versiones que se desincronicen.
// ============================================================================
import { SIT, CAT_TUXEDO, mergeRuns, Run, PixelMap } from '../../ValeriaCatPixel';

const COLS = 32;
const ROWS = 38;

// ----------------------------------------------------------------------------
// 1. CAPAS ANATÓMICAS
//    Cabeza  filas 0..21 · Tronco y patas filas 22..37 · Punta de cola 24..29
// ----------------------------------------------------------------------------

/** Cabeza neutra / atenta. */
export const LUA_HEAD_NEUTRAL: PixelMap = SIT.slice(0, 22);

// Fila de pelo sin rasgos, con el contorno en las columnas 5 y 26 como el resto
// de la cabeza. Se reutiliza para tapar el ojo abierto en los gestos.
const FUR = '.....obbbbbbbbbbbbbbbbbbbbo.....';

/** Ojos cerrados: una línea de párpado a la altura media del ojo. */
export const LUA_HEAD_BLINK: PixelMap = [
  ...SIT.slice(0, 13),
  FUR,
  FUR,
  '.....obbbuuuubbbbbbuuuubbbo.....',
  FUR,
  ...SIT.slice(17, 22),
];

/** Ojos de medialuna y boca sonriente. */
export const LUA_HEAD_LOVE: PixelMap = [
  ...SIT.slice(0, 13),
  FUR,
  '.....obbbbuubbbbbbbbuubbbbo.....',
  '.....obbbubbubbbbbbubbubbbo.....',
  FUR,
  SIT[17],
  SIT[18],
  '.......obbbblluuuullbbbbo.......',
  ...SIT.slice(20, 22),
];

/** Boca abierta esperando el premio. */
export const LUA_HEAD_EAT_OPEN: PixelMap = [
  ...SIT.slice(0, 18),
  '......occcbblluuuullbbbccoo.....',
  '.......obbbllluuuulllbbbo.......',
  ...SIT.slice(20, 22),
];

/**
 * Tronco y patas (filas 22..37). Solo se vacía la PUNTA libre de la cola
 * (columnas 27..29, filas 24..29); la base, que en la rejilla canónica está
 * fundida con el flanco, se queda donde estaba. Vaciar de más era lo que
 * dejaba la cola separada del cuerpo por una columna transparente.
 */
export const LUA_BODY_BASE: PixelMap = SIT.slice(22, 38).map((row, idx) => (
  idx >= 2 && idx <= 7 ? row.slice(0, 27) + '...' + row.slice(30) : row
));

/** Punta de cola libre (5×6, columnas 26..30 y filas 24..29 de SIT). */
export const LUA_TAIL_TIP: PixelMap = SIT.slice(24, 30).map((row) => row.slice(26, 31));

// ----------------------------------------------------------------------------
// 2. COLECCIONABLES
//    `at` es la esquina superior izquierda en coordenadas SIT.
// ----------------------------------------------------------------------------

export const ITEM_PALETTE: Record<string, string> = {
  ...CAT_TUXEDO,
  r: '#ef4444', R: '#b91c1c',   // escarlata y su sombra
  g: '#facc15', G: '#ca8a04',   // dorado y su sombra
  t: '#00c4be', T: '#00a39e',   // turquesa de marca y su sombra
  v: '#8b5cf6', V: '#6d28d9',   // violeta y su sombra
  s: '#fde047',                 // brillo de estrella
};

interface ItemSprite { row: number; col: number; art: PixelMap; }

export const ITEM_SPRITES: Record<string, ItemSprite> = {
  // Pescadito. No se pinta sobre la gata: solo en el armario, la burbuja y el
  // botón de premiar, así que su ancla es indiferente.
  snack_fish: {
    row: 14, col: 8,
    art: [
      '......ooo.......',
      '....oogggoo..o..',
      '..oogggggggoooo.',
      '.oggggggggggoggo',
      'oggwggggggggoggo',
      '.oggggggggGoggo.',
      '..ooggggGGGoooo.',
      '....ooGGGoo..o..',
      '......ooo.......',
    ],
  },

  // Pajarita al cuello, justo bajo la barbilla (filas 22..26).
  neck_red_bow: {
    row: 22, col: 10,
    art: [
      '.ooo.oo.ooo.',
      'orrrorrorrro',
      'orrroRRorrro',
      '.oRRooooRRo.',
      '..oo....oo..',
    ],
  },

  // Flor de cuatro pétalos entre las orejas, centrada en el eje de las orejas.
  head_flower: {
    row: 1, col: 13,
    art: [
      '...oo...',
      '..otto..',
      '.oottoo.',
      'ottggtto',
      'ottggtto',
      '.oottoo.',
      '..otto..',
      '...oo...',
    ],
  },

  // Cascabel colgado de un collar escarlata.
  neck_bell: {
    row: 22, col: 10,
    art: [
      '.orrrrrrrro.',
      '..oooooooo..',
      '...oggggo...',
      '...ogwgGo...',
      '...oggGGo...',
      '....oGGo....',
      '.....oo.....',
    ],
  },

  // Gorro de maga: cubre la coronilla y la base de las orejas.
  head_wizard: {
    row: 0, col: 11,
    art: [
      '.....oo.....',
      '....ovvo....',
      '...ovvvvo...',
      '..ovssssvo..',
      '..ovvvvvvo..',
      '.ovvvvvvvvo.',
      'ovvvvvvvvvvo',
      'oooooooooooo',
    ],
  },
};

/** Expande un sprite compacto a la rejilla completa 32×38 de la gata. */
const onCat = ({ row, col, art }: ItemSprite): PixelMap => {
  const blank = '.'.repeat(COLS);
  return Array.from({ length: ROWS }, (_, y) => {
    const line = art[y - row];
    if (!line) return blank;
    return blank.slice(0, col) + line + blank.slice(col + line.length);
  });
};

// ----------------------------------------------------------------------------
// 3. RUNS PRECOMPILADOS
// ----------------------------------------------------------------------------

export interface ItemIcon { runs: Run[]; w: number; h: number; }

export const PRECOMPILED_RUNS = {
  headNeutral: mergeRuns(LUA_HEAD_NEUTRAL, CAT_TUXEDO),
  headBlink: mergeRuns(LUA_HEAD_BLINK, CAT_TUXEDO),
  headLove: mergeRuns(LUA_HEAD_LOVE, CAT_TUXEDO),
  headEatOpen: mergeRuns(LUA_HEAD_EAT_OPEN, CAT_TUXEDO),
  bodyBase: mergeRuns(LUA_BODY_BASE, CAT_TUXEDO),
  tailTip: mergeRuns(LUA_TAIL_TIP, CAT_TUXEDO),

  // Sobre la gata: rejilla completa, así que la capa se pinta en 0,0 y cae
  // exactamente donde se dibujó. Sin desplazamientos por ítem que ajustar a ojo.
  itemsOnCat: Object.entries(ITEM_SPRITES).reduce<Record<string, Run[]>>((acc, [id, sprite]) => {
    acc[id] = mergeRuns(onCat(sprite), ITEM_PALETTE);
    return acc;
  }, {}),

  // En el armario: la caja propia del dibujo, para que llene su placa en vez de
  // quedarse pequeño y flotando arriba dentro de un lienzo mayormente vacío.
  itemIcons: Object.entries(ITEM_SPRITES).reduce<Record<string, ItemIcon>>((acc, [id, sprite]) => {
    acc[id] = {
      runs: mergeRuns(sprite.art, ITEM_PALETTE),
      w: sprite.art[0].length,
      h: sprite.art.length,
    };
    return acc;
  }, {}),
};

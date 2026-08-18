// ============================================================================
// Valeria+ · Lúa · Segmentación anatómica canónica, paleta expandida y coleccionables
//
// Los mapas anatómicos derivan DIRECTAMENTE de la matriz canónica SIT (32×38)
// de ValeriaCatPixel.tsx (fuente única de verdad).
//
// Se compilan UNA sola vez en memoria estática (mergeRuns) para 60 fps continuos.
// ============================================================================
import { SIT, CAT_TUXEDO, mergeRuns, Run, PixelMap } from '../../ValeriaCatPixel';

// ----------------------------------------------------------------------------
// 1. CAPAS ANATÓMICAS DERIVADAS DE SIT CANÓNICA (32×38 total)
//    - Cabeza: filas 0..21 (22 filas exactas)
//    - Tronco/Patas: filas 22..37 (16 filas exactas)
//    - Cola: filas 24..35 (cols 25..31)
// ----------------------------------------------------------------------------

/** Cabeza neutra / atenta canónica (32 col × 22 filas) */
export const LUA_HEAD_NEUTRAL: PixelMap = SIT.slice(0, 22);

/** Cabeza: Ojos cerrados / Parpadeo (32 col × 22 filas) */
export const LUA_HEAD_BLINK: PixelMap = [
  ...SIT.slice(0, 13),
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '.....obbbbuuuubbbbbbuuuubbbo.....',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  ...SIT.slice(17, 22),
];

/** Cabeza: Sonrisa afectiva y ojos de medialuna (32 col × 22 filas) */
export const LUA_HEAD_LOVE: PixelMap = [
  ...SIT.slice(0, 13),
  '.....obbbbuuuubbbbbbuuuubbbo.....',
  '.....obbbu....ubbbbu....ubbbo....',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '......occcuubllllllbuubccco.....',
  '......occcbbllllppllllbbccoo....',
  '.......obbbbllluuulllbbbbo......',
  ...SIT.slice(20, 22),
];

/** Cabeza: Boca abierta esperando snack / masticando (32 col × 22 filas) */
export const LUA_HEAD_EAT_OPEN: PixelMap = [
  ...SIT.slice(0, 17),
  '......occcuubbuuuubbuubccco.....',
  '......occcbblluuuuullbbccoo.....',
  '.......obbbbllllppllllbbbbo.....',
  ...SIT.slice(20, 22),
];

/**
 * Tronco y patas sentadas (32 col × 16 filas = filas 22..37 de SIT).
 * Se limpian las columnas 24..31 donde vive la cola para que la capa animada
 * de la cola se mueva libremente sin dejar sombra estática.
 */
export const LUA_BODY_BASE: PixelMap = SIT.slice(22, 38).map((row, idx) => {
  if (idx >= 2 && idx <= 13) {
    return row.slice(0, 24) + '........';
  }
  return row;
});

/** Cola curvada independiente (7 col × 12 filas: extraída de SIT cols 25..31, filas 24..35) */
export const LUA_TAIL_BASE: PixelMap = [
  '..ooo..',
  '..obo..',
  '..obo..',
  '..obo..',
  '.obo...',
  '.obo...',
  'oobbo..',
  'bbbbbo.',
  'bbbbbo.',
  'bbbbbbo',
  'lllbbbo',
  'lllbooo',
];

// ----------------------------------------------------------------------------
// 2. PALETA EXPANDIDA Y CATÁLOGO DE COLECCIONABLES (24×24)
// ----------------------------------------------------------------------------

export const ITEM_PALETTE: Record<string, string> = {
  ...CAT_TUXEDO,
  r: '#ef4444', // Rojo / Escarlata
  R: '#b91c1c', // Sombra escarlata
  g: '#facc15', // Dorado / Amarillo brillante
  G: '#ca8a04', // Sombra dorada
  t: '#00c4be', // Turquesa marca Valeria
  T: '#00a39e', // Sombra turquesa
  v: '#8b5cf6', // Violeta cósmico
  V: '#6d28d9', // Sombra violeta
  s: '#fde047', // Amarillo estrella / brillo
};

// Snack: Pescado dorado
const PIXEL_FISH: PixelMap = [
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '..........oo............',
  '.........oggo...........',
  '..o.....oggggo....o.....',
  '..oo...oggggggoo.oo.....',
  '..oggoogggggggggggo.....',
  '..oggggggggwgggggGo.....',
  '..oggoogggggggggggo.....',
  '..oo...oggggggoo.oo.....',
  '..o.....ogggGo....o.....',
  '.........ogGo...........',
  '..........oo............',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

// Accesorio Cuello: Pajarita Escarlata
const PIXEL_RED_BOW: PixelMap = [
  '........................',
  '.....orrrrroo.orrrrro...',
  '....orrrrrrrrrorrrrrrro.',
  '....orrrrrrrrrorrrrrrro.',
  '.....orrrRRo...orrrRRo..',
  '......oRRoo.....oRRoo...',
  '.......oo.........oo....',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

// Accesorio Cuello: Cascabel Dorado Reluciente
const PIXEL_BELL: PixelMap = [
  '........................',
  '.........oooo...........',
  '........oggggo..........',
  '.......oggggggGo........',
  '.......ogwwgggGo........',
  '........oguGggo.........',
  '.........oGGo...........',
  '..........oo............',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

// Accesorio Cabeza: Flor Turquesa Valeria
const PIXEL_FLOWER: PixelMap = [
  '........................',
  '........oooo............',
  '.......otttto...........',
  '......ottwwtto..........',
  '......ottwwtto..........',
  '.......ottTTo...........',
  '........oTTo............',
  '.........oo.............',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

// Accesorio Cabeza: Gorro de Maga Estelar Cósmica
const PIXEL_WIZARD_HAT: PixelMap = [
  '...........o............',
  '..........owo...........',
  '..........ooo...........',
  '.........ovvo...........',
  '.........ovvo...........',
  '........ovvvvo..........',
  '........ovvvvo..........',
  '.......ovvvvvvo.........',
  '.......ovvvvvvo.........',
  '......osssssssso........',
  '.....ovvvvvvvvvvo.......',
  '....oooooooooooooo......',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

export const ITEM_MAPS: Record<string, PixelMap> = {
  snack_fish: PIXEL_FISH,
  neck_red_bow: PIXEL_RED_BOW,
  head_flower: PIXEL_FLOWER,
  neck_bell: PIXEL_BELL,
  head_wizard: PIXEL_WIZARD_HAT,
};

// ----------------------------------------------------------------------------
// 3. RUNS PRECOMPILADOS ESTÁTICOS A 0 MS
// ----------------------------------------------------------------------------

export const PRECOMPILED_RUNS = {
  headNeutral: mergeRuns(LUA_HEAD_NEUTRAL, CAT_TUXEDO),
  headBlink: mergeRuns(LUA_HEAD_BLINK, CAT_TUXEDO),
  headLove: mergeRuns(LUA_HEAD_LOVE, CAT_TUXEDO),
  headEatOpen: mergeRuns(LUA_HEAD_EAT_OPEN, CAT_TUXEDO),
  bodyBase: mergeRuns(LUA_BODY_BASE, CAT_TUXEDO),
  tailBase: mergeRuns(LUA_TAIL_BASE, CAT_TUXEDO),
  items: Object.entries(ITEM_MAPS).reduce<Record<string, Run[]>>((acc, [id, map]) => {
    acc[id] = mergeRuns(map, ITEM_PALETTE);
    return acc;
  }, {}),
};

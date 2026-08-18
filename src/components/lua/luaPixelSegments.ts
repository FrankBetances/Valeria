// ============================================================================
// Valeria+ · Lúa · Segmentación anatómica, matrices de expresión y coleccionables
//
// Los mapas se compilan UNA sola vez en memoria estática (mergeRuns) para
// garantizar 0 ms de recálculo y 60 fps en las animaciones de UI.
// ============================================================================
import { CatPalette, CAT_TUXEDO } from '../../ValeriaCatPixel';
import { CollectibleItem } from '../../types/valeriaLua';

export interface PixelRun {
  x: number;
  y: number;
  w: number;
  fill: string;
}

export const compileRuns = (map: string[], pal: CatPalette): PixelRun[] => {
  const runs: PixelRun[] = [];
  map.forEach((row, y) => {
    let start = -1;
    let key = '';
    for (let x = 0; x <= row.length; x++) {
      const c = x < row.length ? row[x] : '.';
      if (c !== key) {
        if (key !== '.' && key !== '' && start >= 0) {
          const fill = (pal as Record<string, string>)[key] || '#000000';
          runs.push({ x: start, y, w: x - start, fill });
        }
        key = c;
        start = x;
      }
    }
  });
  return runs;
};

// ----------------------------------------------------------------------------
// 1. CAPAS ANATÓMICAS BASE (Posición sentada 32×38 dividida en sub-capas)
// ----------------------------------------------------------------------------

/** Cabeza neutra / atenta (32 col × 18 filas) */
export const LUA_HEAD_NEUTRAL: string[] = [
  '........o...............o.......',
  '........oo.............oo.......',
  '.......opo.............opo......',
  '.......oppo...........oppo......',
  '......oppppo.........oppppo.....',
  '......oppppo.........oppppo.....',
  '.....oppppppoooooooooppppppo....',
  '.....obbbbbbbbbbbbbbbbbbbbbo....',
  '....obbbbbbbbbbbbbbbbbbbbbbbo...',
  '....obbbbbbbbbbbbbbbbbbbbbboo...',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '...obbbbbbbbbbbbbbbbbbbbbbbbo...',
  '...obbbbbuubbbbbbbbbbuubbbbbo...',
  '...obbbbuwuubbbbbbbbuwuubbbbo...',
  '...obbbbuuuubbbbbbbbuuuubbbbo...',
  '....occcbuubbbbbbbbbbuubbccco...',
  '....occcbbbbllllllllbbbbbccoo...',
  '.....obbbbbllllppllllbbbbbo.....',
];

/** Cabeza: Ojos cerrados / Parpadeo (32 col × 18 filas) */
export const LUA_HEAD_BLINK: string[] = [
  '........o...............o.......',
  '........oo.............oo.......',
  '.......opo.............opo......',
  '.......oppo...........oppo......',
  '......oppppo.........oppppo.....',
  '......oppppo.........oppppo.....',
  '.....oppppppoooooooooppppppo....',
  '.....obbbbbbbbbbbbbbbbbbbbbo....',
  '....obbbbbbbbbbbbbbbbbbbbbbbo...',
  '....obbbbbbbbbbbbbbbbbbbbbboo...',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '...obbbbbbbbbbbbbbbbbbbbbbbbo...',
  '...obbbbbbbbbbbbbbbbbbbbbbbbo...',
  '...obbbbuuuubbbbbbbbuuuubbbbo...',
  '...obbbbbbbbbbbbbbbbbbbbbbbbo...',
  '....occcbuubbbbbbbbbbuubbccco...',
  '....occcbbbbllllllllbbbbbccoo...',
  '.....obbbbbllllppllllbbbbbo.....',
];

/** Cabeza: Ojos de medialuna y sonrisa de amor/caricia (32 col × 18 filas) */
export const LUA_HEAD_LOVE: string[] = [
  '........o...............o.......',
  '........oo.............oo.......',
  '.......opo.............opo......',
  '.......oppo...........oppo......',
  '......oppppo.........oppppo.....',
  '......oppppo.........oppppo.....',
  '.....oppppppoooooooooppppppo....',
  '.....obbbbbbbbbbbbbbbbbbbbbo....',
  '....obbbbbbbbbbbbbbbbbbbbbbbo...',
  '....obbbbbbbbbbbbbbbbbbbbbboo...',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '...obbbbuuuubbbbbbbbuuuubbbbo...',
  '...obbbu....ubbbbbbu....ubbbo...',
  '...obbbbbbbbbbbbbbbbbbbbbbbbo...',
  '...occcbbbbbbbbbbbbbbbbbbccco...',
  '....occccbbbllllllllbbbbccccoo..',
  '....occccbbbllllppllllbbccccoo..',
  '.....obbbbblllluuullllbbbbbo....',
];

/** Cabeza: Boca abierta esperando snack / comiendo (32 col × 18 filas) */
export const LUA_HEAD_EAT_OPEN: string[] = [
  '........o...............o.......',
  '........oo.............oo.......',
  '.......opo.............opo......',
  '.......oppo...........oppo......',
  '......oppppo.........oppppo.....',
  '......oppppo.........oppppo.....',
  '.....oppppppoooooooooppppppo....',
  '.....obbbbbbbbbbbbbbbbbbbbbo....',
  '....obbbbbbbbbbbbbbbbbbbbbbbo...',
  '....obbbbbbbbbbbbbbbbbbbbbboo...',
  '.....obbbbbbbbbbbbbbbbbbbbo.....',
  '...obbbbbbbbbbbbbbbbbbbbbbbbo...',
  '...obbbbuwuubbbbbbbbuwuubbbbo...',
  '...obbbbuuuubbbbbbbbuuuubbbbo...',
  '...obbbbbbbbbbuuuubbbbbbbbbbo...',
  '....occcbbbbbuuuuuubbbbbbccco...',
  '....occcbbbblluuuuullbbbbccoo...',
  '.....obbbbbllllppllllbbbbbo.....',
];

/** Cuerpo y patas sentadas (32 col × 20 filas) */
export const LUA_BODY_BASE: string[] = [
  '...........obbbbbbbbo...........',
  '...........obbbbbbbbo...........',
  '...........obbbbbbbbo...........',
  '..........obbbllllbbbo..........',
  '........oobbllllllllbboo........',
  '........obbllllllllllbbo........',
  '.......obbbllllllllllbbbo.......',
  '.......obbllllllllllllbbo.......',
  '.......obbllllllllllllbbbo......',
  '.......obbbllllllllllbbbbbo.....',
  '.......obbbllllllllllbbbbbo.....',
  '.......obbbbllllllllbbbbbbo.....',
  '.......ollllbbllllbbbllllbo.....',
  '.......ollllbbbbbbbbbllllbooo...',
  '.......oooolbbbbbbbbbooooo......',
  '...........oooooooooo...........',
];

/** Cola curvada independiente (10 col × 14 filas) */
export const LUA_TAIL_BASE: string[] = [
  '....ooo...',
  '...obbo...',
  '...obo....',
  '...obo....',
  '..obbo....',
  '..obbo....',
  '.obbbo....',
  '.obbbo....',
  'obbbbo....',
  'obbbbo....',
  'ollllbo...',
  'ollllbo...',
  '.oooolo...',
  '...oooo...',
];

// ----------------------------------------------------------------------------
// 2. CATÁLOGO DE COLECCIONABLES (Matrices de 24×24 con paleta expandida)
// ----------------------------------------------------------------------------

export const ITEM_PALETTE: CatPalette = {
  ...CAT_TUXEDO,
};

// Snack: Pescado dorado
const PIXEL_FISH: string[] = [
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '..........oo............',
  '.........oppo...........',
  '..o.....oppppo....o.....',
  '..oo...oppppppoo.oo.....',
  '..oppoopppppppppppo.....',
  '..oppppppppwppppppo.....',
  '..oppoopppppppppppo.....',
  '..oo...oppppppoo.oo.....',
  '..o.....oppppo....o.....',
  '.........oppo...........',
  '..........oo............',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

// Accesorio Cuello: Lazo / Pajarita Roja
const PIXEL_RED_BOW: string[] = [
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
  '......occcco.occcco.....',
  '.....occcccooccccco.....',
  '.....occcccooccccco.....',
  '......occcoo.occcoo.....',
  '.......oooo...oooo......',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

// Accesorio Cabeza: Sombrero de Mago Cósmico
const PIXEL_WIZARD_HAT: string[] = [
  '...........o............',
  '..........owo...........',
  '..........ooo...........',
  '.........obbo...........',
  '.........obbo...........',
  '........obbbbo..........',
  '........obbbbo..........',
  '.......obbbbbbo.........',
  '.......obbbbbbo.........',
  '......oppppppppo........',
  '.....obbbbbbbbbbo.......',
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

// Accesorio Cabeza: Flor Turquesa de Valeria
const PIXEL_FLOWER: string[] = [
  '........................',
  '........................',
  '........oooo............',
  '.......oppppo...........',
  '......oppwwppo..........',
  '......oppwwppo..........',
  '.......oppppo...........',
  '........oooo............',
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

// Accesorio Cuello: Cascabel Dorado
const PIXEL_BELL: string[] = [
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
  '.........oooo...........',
  '........oppppo..........',
  '.......oppppppo.........',
  '.......oppwwppo.........',
  '........opuuupo.........',
  '.........oooo...........',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
  '........................',
];

export const COLLECTIBLES_CATALOG: CollectibleItem[] = [
  {
    id: 'snack_fish',
    name: 'Pescadito Sabroso',
    slot: 'snack',
    glyph: '🐟',
    description: 'El premio favorito de Lúa para celebrar el esfuerzo de la sesión.',
    pixelMap: PIXEL_FISH,
    unlockCondition: 'Disponible desde la primera sesión',
    requiredSessions: 1,
  },
  {
    id: 'neck_red_bow',
    name: 'Pajarita Escarlata',
    slot: 'neck',
    glyph: '🎀',
    description: 'Elegante y suave para lucir en el cuello.',
    pixelMap: PIXEL_RED_BOW,
    unlockCondition: 'Completa 3 sesiones de terapia',
    requiredSessions: 3,
  },
  {
    id: 'head_flower',
    name: 'Flor Turquesa Valeria',
    slot: 'head',
    glyph: '🌸',
    description: 'El broche con los colores de la calma y la constancia.',
    pixelMap: PIXEL_FLOWER,
    unlockCondition: 'Alcanza una racha de 3 días',
    requiredStreak: 3,
  },
  {
    id: 'neck_bell',
    name: 'Cascabel Reluciente',
    slot: 'neck',
    glyph: '🔔',
    description: 'Suena con suavidad al moverse.',
    pixelMap: PIXEL_BELL,
    unlockCondition: 'Completa 10 sesiones de terapia',
    requiredSessions: 10,
  },
  {
    id: 'head_wizard',
    name: 'Gorro de Maga Estelar',
    slot: 'head',
    glyph: '🧙‍♀️',
    description: 'Para la gata más sabia y valiente del cosmos.',
    pixelMap: PIXEL_WIZARD_HAT,
    unlockCondition: 'Alcanza el Nivel 5 de Lúa',
    requiredLevel: 5,
  },
];

export const getCollectibleById = (id: string): CollectibleItem | undefined =>
  COLLECTIBLES_CATALOG.find((c) => c.id === id);

// ----------------------------------------------------------------------------
// 3. RUNS PRE-COMPILADOS ESTÁTICOS
// ----------------------------------------------------------------------------

export const PRECOMPILED_RUNS = {
  headNeutral: compileRuns(LUA_HEAD_NEUTRAL, CAT_TUXEDO),
  headBlink: compileRuns(LUA_HEAD_BLINK, CAT_TUXEDO),
  headLove: compileRuns(LUA_HEAD_LOVE, CAT_TUXEDO),
  headEatOpen: compileRuns(LUA_HEAD_EAT_OPEN, CAT_TUXEDO),
  bodyBase: compileRuns(LUA_BODY_BASE, CAT_TUXEDO),
  tailBase: compileRuns(LUA_TAIL_BASE, CAT_TUXEDO),
  items: COLLECTIBLES_CATALOG.reduce<Record<string, PixelRun[]>>((acc, item) => {
    acc[item.id] = compileRuns(item.pixelMap, ITEM_PALETTE);
    return acc;
  }, {}),
};

// ============================================================================
// Aventuras con Lúa · Juegos
//
// La cuarta sección del material de origen. Las 50 hojas son 10 JUEGOS, 10
// CUENTOS, 10 CANCIONES y 10 IMPRIME Y JUEGA, y la matriz de contenidos por
// edad nombra las cuatro; el módulo entró con tres. Estos son los 10 juegos de
// las hojas 1 a 10, con la ficha de cada estímulo, para que se jueguen en la
// tableta en vez de solo imprimirse.
//
// Lo que NO se ha tocado: los estímulos son los de las hojas, uno a uno. La
// tambora, la pandereta y las maracas del memorama 2 son lo único dominicano
// que sobrevive en el material y se conservan tal cual.
// ============================================================================
import type { AgeBand } from './LuaAssessmentCatalog';
import type { PictoKey } from '../../ValeriaPixelArt';

export type LuaGameKind =
  /** Memorama: parejas iguales boca abajo. */
  | 'memory'
  /** Imagen-palabra: nombrar y emparejar dibujo con su nombre escrito. */
  | 'image_word'
  /** Completar la palabra: falta una letra. */
  | 'word_completion'
  /** Cazadores de sonidos: cuáles empiezan por el fonema dado. */
  | 'sound_hunt'
  /** Rompecabezas de secuencia: ordenar del 1 al n. */
  | 'sequence'
  /** Clasificación en categorías semánticas. */
  | 'sorting'
  /** Encontrar el diferente en cada fila. */
  | 'odd_one_out'
  /** Familia de palabras: red semántica alrededor de un núcleo. */
  | 'word_web';

export interface LuaGameItem {
  pic?: PictoKey;
  label: string;
  /** En 'word_completion', la palabra con hueco: GA_O. */
  template?: string;
  /** En 'sorting' y 'sound_hunt', a qué grupo pertenece / si es objetivo. */
  group?: string;
  isTarget?: boolean;
}

export interface LuaGame {
  id: string;
  number: number; // 1 a 10, el mismo de la hoja de origen
  title: string;
  subtitle: string;
  kind: LuaGameKind;
  ageBands: AgeBand[];
  /** La consigna, tal como la dice la hoja. Se locuta al niño. */
  instructions: string;
  /** Los grupos de 'sorting', o las filas de 'odd_one_out'. */
  groups?: string[];
  items: LuaGameItem[];
}

export const LUA_GAMES_CATALOG: LuaGame[] = [
  {
    id: 'lua_game_01',
    number: 1,
    title: 'Memorama: sonidos del campo',
    subtitle: '8 tarjetas, 4 parejas',
    kind: 'memory',
    ageBands: ['2-3', '3-4', '4-5'],
    instructions: 'Busca las parejas iguales y di el nombre en voz alta.',
    items: [
      { pic: 'perro', label: 'Perro' }, { pic: 'gato', label: 'Gato' },
      { pic: 'pato', label: 'Pato' }, { pic: 'casa', label: 'Casa' },
    ],
  },
  {
    id: 'lua_game_02',
    number: 2,
    title: 'Memorama: instrumentos musicales',
    subtitle: '8 tarjetas, 4 parejas',
    kind: 'memory',
    ageBands: ['3-4', '4-5', '5-7'],
    instructions: 'Encuentra las parejas e imita el sonido de cada instrumento.',
    items: [
      { pic: 'tambora', label: 'Tambora' }, { pic: 'pandereta', label: 'Pandereta' },
      { pic: 'maracas', label: 'Maracas' }, { pic: 'casa', label: 'Casa' },
    ],
  },
  {
    id: 'lua_game_03',
    number: 3,
    title: 'Imagen-palabra: frutas',
    subtitle: 'Une cada fruta con su nombre',
    kind: 'image_word',
    ageBands: ['2-3', '3-4', '4-5'],
    instructions: 'Nombra cada fruta en voz alta y únela con su nombre escrito.',
    items: [
      { pic: 'manzana', label: 'Manzana' }, { pic: 'platano', label: 'Banana' },
      { pic: 'uvas', label: 'Uvas' }, { pic: 'fresa', label: 'Fresas' },
    ],
  },
  {
    id: 'lua_game_04',
    number: 4,
    title: 'Imagen-palabra: en la playa',
    subtitle: '¿Qué encontrarías en la playa?',
    kind: 'image_word',
    ageBands: ['3-4', '4-5', '5-7'],
    instructions: 'Toca cada imagen y di su nombre. ¿Cuál de estas cosas encontrarías en la playa?',
    items: [
      { pic: 'ola', label: 'Ola' }, { pic: 'concha', label: 'Concha' },
      { pic: 'sol', label: 'Sol' }, { pic: 'barco', label: 'Barquito' },
    ],
  },
  {
    id: 'lua_game_05',
    number: 5,
    title: 'Completa la palabra: animales',
    subtitle: 'Escribe la letra que falta',
    kind: 'word_completion',
    ageBands: ['5-7', '7-10'],
    instructions: 'Escribe en la línea la letra que falta para completar el nombre del animal.',
    items: [
      { pic: 'gato', label: 'Gato', template: 'GA_O' },
      { pic: 'perro', label: 'Perro', template: 'PE_O' },
      { pic: 'vaca', label: 'Vaca', template: 'VA_A' },
      { pic: 'gallina', label: 'Gallina', template: 'GA_LINA' },
    ],
  },
  {
    id: 'lua_game_06',
    number: 6,
    title: 'Cazadores de sonidos: el sonido /s/',
    subtitle: 'Encierra las que empiezan por /s/',
    kind: 'sound_hunt',
    ageBands: ['4-5', '5-7'],
    instructions: 'Encierra las imágenes cuyo nombre empieza con el sonido /s/.',
    items: [
      { pic: 'sol', label: 'Sol', isTarget: true }, { pic: 'sapo', label: 'Sapo', isTarget: true },
      { pic: 'silla', label: 'Silla', isTarget: true }, { pic: 'sandia', label: 'Sandía', isTarget: true },
    ],
  },
  {
    id: 'lua_game_07',
    number: 7,
    title: 'Rompecabezas de secuencia: la semilla crece',
    subtitle: 'Ordena del 1 al 4',
    kind: 'sequence',
    ageBands: ['3-4', '4-5', '5-7'],
    instructions: 'Ordena las 4 tarjetas del 1 al 4 para mostrar cómo crece la planta.',
    items: [
      { pic: 'semilla', label: 'Semilla' }, { pic: 'brote', label: 'Brote' },
      { pic: 'planta', label: 'Planta' }, { pic: 'arbol', label: 'Árbol' },
    ],
  },
  {
    id: 'lua_game_08',
    number: 8,
    title: 'Clasificación: frutas y animales',
    subtitle: 'Cada dibujo a su grupo',
    kind: 'sorting',
    ageBands: ['3-4', '4-5', '5-7'],
    instructions: 'Coloca cada dibujo en su grupo: frutas o animales.',
    groups: ['Frutas', 'Animales'],
    items: [
      { pic: 'manzana', label: 'Manzana', group: 'Frutas' },
      { pic: 'gato', label: 'Gato', group: 'Animales' },
      { pic: 'uvas', label: 'Uvas', group: 'Frutas' },
      { pic: 'perro', label: 'Perro', group: 'Animales' },
      { pic: 'platano', label: 'Banana', group: 'Frutas' },
      { pic: 'vaca', label: 'Vaca', group: 'Animales' },
    ],
  },
  {
    id: 'lua_game_09',
    number: 9,
    title: 'Atención: encuentra el diferente',
    subtitle: '3 filas, uno distinto en cada una',
    kind: 'odd_one_out',
    ageBands: ['4-5', '5-7', '7-10'],
    instructions: 'En cada fila, busca el dibujo que es diferente a los demás.',
    groups: ['Fila 1', 'Fila 2', 'Fila 3'],
    items: [
      { pic: 'estrella', label: 'Estrella', group: 'Fila 1' },
      { pic: 'estrella', label: 'Estrella', group: 'Fila 1' },
      { pic: 'sol', label: 'Sol', group: 'Fila 1', isTarget: true },
      { pic: 'estrella', label: 'Estrella', group: 'Fila 1' },
      { pic: 'pelota', label: 'Pelota', group: 'Fila 2' },
      { pic: 'casa', label: 'Casa', group: 'Fila 2', isTarget: true },
      { pic: 'pelota', label: 'Pelota', group: 'Fila 2' },
      { pic: 'pelota', label: 'Pelota', group: 'Fila 2' },
      { pic: 'gato', label: 'Gato', group: 'Fila 3' },
      { pic: 'gato', label: 'Gato', group: 'Fila 3' },
      { pic: 'perro', label: 'Perro', group: 'Fila 3', isTarget: true },
      { pic: 'gato', label: 'Gato', group: 'Fila 3' },
    ],
  },
  {
    id: 'lua_game_10',
    number: 10,
    title: 'Vocabulario: familia de palabras — la playa',
    subtitle: 'Di una palabra relacionada',
    kind: 'word_web',
    ageBands: ['5-7', '7-10'],
    instructions: 'Di una palabra relacionada con la playa en cada espacio vacío.',
    items: [
      { pic: 'ola', label: 'Playa' },
      { label: '' }, { label: '' }, { label: '' },
      { label: '' }, { label: '' },
    ],
  },
];

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
  | 'word_web'
  /** Pistas progresivas hasta adivinar la palabra. */
  | 'clue_reveal';

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
  /** Las pistas de 'clue_reveal', en orden de menor a mayor concreción. */
  clues?: string[];
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
    title: 'Frutas de mi isla',
    subtitle: 'Une cada fruta con su nombre',
    kind: 'image_word',
    ageBands: ['2-3', '3-4', '4-5'],
    instructions: 'Nombra cada fruta en voz alta y únela con su nombre escrito.',
    items: [
      { pic: 'mango', label: 'Mango' }, { pic: 'lechosa', label: 'Lechosa' },
      { pic: 'chinola', label: 'Chinola' }, { pic: 'platano', label: 'Guineo' },
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
    title: 'Las casitas de las categorías',
    subtitle: 'Cada dibujo a su grupo',
    kind: 'sorting',
    ageBands: ['2-3', '3-4', '4-5', '5-7'],
    instructions: 'Coloca cada dibujo en su casita: frutas o animales.',
    groups: ['Frutas', 'Animales'],
    items: [
      { pic: 'mango', label: 'Mango', group: 'Frutas' },
      { pic: 'gato', label: 'Gato', group: 'Animales' },
      { pic: 'chinola', label: 'Chinola', group: 'Frutas' },
      { pic: 'perro', label: 'Perro', group: 'Animales' },
      { pic: 'lechosa', label: 'Lechosa', group: 'Frutas' },
      { pic: 'coqui', label: 'Coquí', group: 'Animales' },
    ],
  },
  {
    id: 'lua_game_09',
    number: 9,
    title: 'Encuentra la diferencia en el patio dominicano',
    subtitle: '3 filas, uno distinto en cada una',
    kind: 'odd_one_out',
    ageBands: ['4-5', '5-7', '7-10'],
    instructions: 'En cada fila, busca el dibujo que es diferente a los demás.',
    groups: ['Fila 1', 'Fila 2', 'Fila 3'],
    items: [
      { pic: 'palma', label: 'Palma', group: 'Fila 1' },
      { pic: 'palma', label: 'Palma', group: 'Fila 1' },
      { pic: 'casa', label: 'Casa', group: 'Fila 1', isTarget: true },
      { pic: 'palma', label: 'Palma', group: 'Fila 1' },
      { pic: 'coco', label: 'Coco', group: 'Fila 2' },
      { pic: 'cometa', label: 'Cometa', group: 'Fila 2', isTarget: true },
      { pic: 'coco', label: 'Coco', group: 'Fila 2' },
      { pic: 'coco', label: 'Coco', group: 'Fila 2' },
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

  // --------------------------------------------------------------------------
  // Los ocho de la Matriz de Contenidos por Edad que no venían en las 50 hojas.
  // Se recuperan con su léxico dominicano —la palma, el coco, el coquí, la
  // chinola, la bandera— porque es el que da la matriz. Los tres primeros son
  // de 0-2: esa franja no tenía NINGÚN juego, y es la que menos puede leer.
  // --------------------------------------------------------------------------
  {
    id: 'lua_game_11',
    number: 11,
    title: 'Caja de sonidos mágica',
    subtitle: 'Dos sonidos muy distintos',
    kind: 'image_word',
    ageBands: ['0-2'],
    instructions: 'Toca el dibujo y escucha su sonido. ¿Cuál suena distinto?',
    items: [
      { pic: 'perro', label: 'Perro' }, { pic: 'gallina', label: 'Gallina' },
    ],
  },
  {
    id: 'lua_game_12',
    number: 12,
    title: '¿Quién soy?',
    subtitle: 'Imagen y palabra, vocabulario básico',
    kind: 'image_word',
    ageBands: ['0-2', '2-3'],
    instructions: 'Toca el dibujo y di su nombre conmigo.',
    items: [
      { pic: 'gato', label: 'Gato' }, { pic: 'pato', label: 'Pato' },
      { pic: 'vaca', label: 'Vaca' }, { pic: 'coqui', label: 'Coquí' },
    ],
  },
  {
    id: 'lua_game_13',
    number: 13,
    title: 'Encuentra mi nombre',
    subtitle: 'Dos opciones grandes y claras',
    kind: 'image_word',
    ageBands: ['0-2'],
    instructions: 'Te digo una palabra y tú tocas su dibujo.',
    items: [
      { pic: 'pelota', label: 'Pelota' }, { pic: 'coco', label: 'Coco' },
    ],
  },
  {
    id: 'lua_game_14',
    number: 14,
    title: 'Arma la palma',
    subtitle: 'Rompecabezas: ordena y nombra al completar',
    kind: 'sequence',
    ageBands: ['3-4', '4-5'],
    instructions: 'Ordena las piezas de la palma del 1 al 4 y di su nombre al terminar.',
    items: [
      { pic: 'semilla', label: 'Semilla' }, { pic: 'brote', label: 'Brote' },
      { pic: 'planta', label: 'Mata' }, { pic: 'palma', label: 'Palma' },
    ],
  },
  {
    id: 'lua_game_15',
    number: 15,
    title: 'El coquí saltarín',
    subtitle: 'Ordena la historia del 1 al 4',
    kind: 'sequence',
    ageBands: ['4-5', '5-7'],
    instructions: 'Ordena las tarjetas para contar adónde saltó el coquí.',
    items: [
      { pic: 'coqui', label: 'El coquí' }, { pic: 'ola', label: 'Salta al río' },
      { pic: 'palma', label: 'Sube a la palma' }, { pic: 'luna', label: 'Canta de noche' },
    ],
  },
  {
    id: 'lua_game_16',
    number: 16,
    title: 'Simón dice a la dominicana',
    subtitle: 'Atención e instrucciones',
    kind: 'image_word',
    ageBands: ['4-5', '5-7'],
    instructions: 'Solo si digo «Simón dice», haz lo que ves en el dibujo.',
    items: [
      { pic: 'saltar', label: 'Salta' }, { pic: 'correr', label: 'Corre' },
      { pic: 'soplar', label: 'Sopla' }, { pic: 'abrazo', label: 'Abraza' },
      { pic: 'parar', label: 'Párate' }, { pic: 'dormir', label: 'Haz que duermes' },
    ],
  },
  {
    id: 'lua_game_17',
    number: 17,
    title: 'El tren de las letras',
    subtitle: 'Sonidos iniciales, nivel avanzado',
    kind: 'sound_hunt',
    ageBands: ['5-7', '7-10'],
    instructions: 'Sube al tren solo las palabras que empiezan con el sonido /m/.',
    items: [
      { pic: 'mango', label: 'Mango', isTarget: true }, { pic: 'mesa', label: 'Mesa', isTarget: true },
      { pic: 'mano', label: 'Mano', isTarget: true }, { pic: 'coco', label: 'Coco' },
      { pic: 'palma', label: 'Palma' }, { pic: 'sol', label: 'Sol' },
    ],
  },
  {
    id: 'lua_game_18',
    number: 18,
    title: '¿Cómo me siento?',
    subtitle: 'Clasificación emocional',
    kind: 'sorting',
    ageBands: ['5-7', '7-10'],
    instructions: 'Coloca cada cara donde va: me gusta o no me gusta sentirme así.',
    groups: ['Me gusta sentirme así', 'Me cuesta sentirme así'],
    items: [
      { pic: 'cara-feliz', label: 'Feliz', group: 'Me gusta sentirme así' },
      { pic: 'cara-tranquila', label: 'Tranquilo', group: 'Me gusta sentirme así' },
      { pic: 'cara-sorprendida', label: 'Sorprendido', group: 'Me gusta sentirme así' },
      { pic: 'cara-triste', label: 'Triste', group: 'Me cuesta sentirme así' },
      { pic: 'cara-enojada', label: 'Enojado', group: 'Me cuesta sentirme así' },
      { pic: 'cara-asustada', label: 'Asustado', group: 'Me cuesta sentirme así' },
    ],
  },
  {
    id: 'lua_game_19',
    number: 19,
    title: 'Adivina la palabra secreta',
    subtitle: 'Pistas progresivas',
    kind: 'clue_reveal',
    ageBands: ['7-10'],
    instructions: 'Escucha las pistas, de la más difícil a la más fácil, y adivina.',
    clues: [
      'Crece muy alto y se mece con el viento.',
      'Da sombra en el patio y en la playa.',
      'De ella cae el coco.',
    ],
    items: [
      { pic: 'palma', label: 'Palma', isTarget: true },
      { pic: 'casa', label: 'Casa' },
      { pic: 'barco', label: 'Barco' },
    ],
  },

  // --------------------------------------------------------------------------
  // Lo que era «Imprime y Juega». Decisión de Frank del 4/9/2026: nada
  // imprimible, porque al final lo que hace una ficha dentro de la app es un
  // juego de selección. Seis de las diez fichas se convierten aquí; las otras
  // cuatro no se pierden, se van donde ya estaban cubiertas:
  //   · la hoja de trazo, a Grafomotricidad (la Pizarra Mágica de Lúa);
  //   · el dominó de rimas, al ítem de rimas del banco por edad (5-7);
  //   · la ficha semanal de práctica, a la racha de la gamificación;
  //   · el diploma, a las insignias, que ya premian lo mismo y llegan al cristal.
  // --------------------------------------------------------------------------
  {
    id: 'lua_game_20',
    number: 20,
    title: 'Las palabras de mi casa',
    subtitle: 'Ocho objetos de todos los días',
    kind: 'image_word',
    ageBands: ['2-3', '3-4', '4-5'],
    instructions: 'Toca cada dibujo y di su nombre en voz alta.',
    items: [
      { pic: 'perro', label: 'Perro' }, { pic: 'gato', label: 'Gato' },
      { pic: 'pelota', label: 'Pelota' }, { pic: 'casa', label: 'Casa' },
      { pic: 'sol', label: 'Sol' }, { pic: 'pan', label: 'Pan' },
      { pic: 'vaso', label: 'Vaso' }, { pic: 'zapato', label: 'Zapato' },
    ],
  },
  {
    id: 'lua_game_21',
    number: 21,
    title: 'La rutina de la mañana',
    subtitle: 'Ordena los cuatro pasos',
    kind: 'sequence',
    ageBands: ['2-3', '3-4', '4-5'],
    instructions: 'Ordena los pasos de la mañana: despertar, lavarse, vestirse y desayunar.',
    items: [
      { pic: 'dormir', label: 'Despertar' }, { pic: 'mano-limpia', label: 'Lavarse' },
      { pic: 'vestir', label: 'Vestirse' }, { pic: 'comer', label: 'Desayunar' },
    ],
  },
  {
    id: 'lua_game_22',
    number: 22,
    title: 'Bingo de sonidos: el sonido /p/',
    subtitle: 'Marca las que empiezan por /p/',
    kind: 'sound_hunt',
    ageBands: ['3-4', '4-5', '5-7'],
    instructions: 'Marca las imágenes cuyo nombre empieza con el sonido /p/.',
    items: [
      { pic: 'pato', label: 'Pato', isTarget: true }, { pic: 'pelota', label: 'Pelota', isTarget: true },
      { pic: 'pan', label: 'Pan', isTarget: true }, { pic: 'palma', label: 'Palma', isTarget: true },
      { pic: 'sol', label: 'Sol' }, { pic: 'mesa', label: 'Mesa' },
      { pic: 'gato', label: 'Gato' }, { pic: 'casa', label: 'Casa' },
      { pic: 'luna', label: 'Luna' },
    ],
  },
  {
    id: 'lua_game_23',
    number: 23,
    title: '¿Cómo me siento hoy?',
    subtitle: 'Elige tu cara del día',
    kind: 'image_word',
    ageBands: ['3-4', '4-5', '5-7', '7-10'],
    instructions: 'Mira las caras y toca la que dice cómo te sientes hoy.',
    items: [
      { pic: 'cara-feliz', label: 'Feliz' }, { pic: 'cara-triste', label: 'Triste' },
      { pic: 'cara-enojada', label: 'Enojado' }, { pic: 'cara-sorprendida', label: 'Sorprendido' },
      { pic: 'cara-asustada', label: 'Asustado' }, { pic: 'cara-tranquila', label: 'Tranquilo' },
    ],
  },
  {
    id: 'lua_game_24',
    number: 24,
    title: 'Completa la palabra: en casa',
    subtitle: 'Falta una letra en cada una',
    kind: 'word_completion',
    ageBands: ['5-7', '7-10'],
    instructions: 'Di qué letra falta para completar cada palabra.',
    items: [
      { pic: 'sol', label: 'Sol', template: '_ O L' },
      { pic: 'casa', label: 'Casa', template: 'C A _ A' },
      { pic: 'pelota', label: 'Pelota', template: 'P E L O _ A' },
      { pic: 'mesa', label: 'Mesa', template: 'M E _ A' },
    ],
  },
  {
    id: 'lua_game_25',
    number: 25,
    title: 'Animales, frutas y ropa',
    subtitle: 'Tres grupos, nueve dibujos',
    kind: 'sorting',
    ageBands: ['3-4', '4-5', '5-7'],
    instructions: 'Coloca cada dibujo en su grupo: animales, frutas o ropa.',
    groups: ['Animales', 'Frutas', 'Ropa'],
    items: [
      { pic: 'perro', label: 'Perro', group: 'Animales' },
      { pic: 'gato', label: 'Gato', group: 'Animales' },
      { pic: 'vaca', label: 'Vaca', group: 'Animales' },
      { pic: 'mango', label: 'Mango', group: 'Frutas' },
      { pic: 'chinola', label: 'Chinola', group: 'Frutas' },
      { pic: 'lechosa', label: 'Lechosa', group: 'Frutas' },
      { pic: 'zapato', label: 'Zapato', group: 'Ropa' },
      { pic: 'gorra', label: 'Gorra', group: 'Ropa' },
      { pic: 'bufanda', label: 'Bufanda', group: 'Ropa' },
    ],
  },
];

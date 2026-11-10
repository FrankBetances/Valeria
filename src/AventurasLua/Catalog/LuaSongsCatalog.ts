// ============================================================================
// Aventuras con Lúa · Lúa y las Palabras — Catálogo de Canciones Motoras y de Lenguaje
// 10 canciones TRADICIONALES (ACOPROS, 11/2026): la letra se enseña y la canta el
// adulto con el niño. La app no las recita ni las canta.
// ============================================================================
import type { AgeBand } from './LuaAssessmentCatalog';

export type SongTheme =
  | 'rutina_manana'
  | 'conteo'
  | 'colores'
  | 'vocales_motor'
  | 'onomatopeyas'
  | 'higiene_secuencia'
  | 'esquema_corporal'
  | 'frutas_alimentacion'
  | 'cortesia_social'
  | 'orden_transicion';

/**
 * Recitado rítmico con metrónomo visual (spoken-word).
 *
 * La app NO canta: ninguna de las cinco voces neuronales sabe hacerlo, y
 * pedirle a un TTS que cante produce el mismo ruido que pedirle a la voz
 * inglesa que lea castellano. Lo que sí se puede hacer —y es técnica clínica de
 * verdad, no un sucedáneo— es RECITAR A PULSO: la letra dicha sobre un tempo
 * estable con el pulso a la vista.
 *
 * Qué entrena, y por eso está aquí y no en una pantalla de adorno:
 *   · Entrenamiento auditivo-motor: sincronizar la sílaba con un pulso externo
 *     es el fundamento de la conciencia silábica que miden DX-3 y los ítems de
 *     sílabas del banco por edad.
 *   · Habla pautada: recitar sobre un pulso lento reduce la tasa de habla, y es
 *     la técnica de los ítems de fluidez (3_4_07, 4_5_09, 5_7_07).
 *   · Prosodia: el acento cada N pulsos da la estructura fuerte-débil que la
 *     voz sintética no marca por sí sola.
 *
 * El ritmo vive en el catálogo BASE y NO en los bancos por variedad: es
 * estructura, no texto. Un verso galego con dos sílabas más cabe en el mismo
 * compás —eso es precisamente lo que hace el spoken-word—, así que el mismo
 * tempo sirve para las cinco lenguas y no hay que reautorizar nada.
 */
export interface LuaSongRhythm {
  /** Pulsos por minuto del metrónomo. Lento en praxias, vivo al contar. */
  bpm: number;
  /** Pulsos que dura CADA verso. El compás en el que la línea tiene que caber. */
  beatsPerLine: number;
  /** Cada cuántos pulsos cae el acento fuerte: 2 binario, 3 ternario. */
  accentEvery: number;
}

export interface LuaSong {
  id: string;
  number: number; // 1 a 10
  /**
   * Franjas en las que la pieza tiene sentido. NO viene de las 50 hojas: la
   * fuente solo fecha por edad los cuentos, así que esto es un SUPUESTO
   * CLÍNICO explícito y reversible, tomado del contenido de cada pieza
   * (contar del 1 al 10, praxias vocálicas, secuencia de 4 pasos…). Está aquí
   * y no en la pantalla para que corregirlo sea una línea, no un rediseño.
   *
   * Sin esto el filtro por edad del hub mentía: siete chips que solo movían
   * preguntas y cuentos mientras canciones e imprimibles enseñaban los diez
   * siempre, dijera lo que dijera el chip.
   */
  ageBands: AgeBand[];
  title: string;
  subtitle: string;
  theme: SongTheme;
  consigna: string;
  lyrics: string[];
  /** Pauta del recitado rítmico de antes del 11/2026. Ya no se usa: ACOPROS
   *  pidió canciones conocidas que canta el adulto; la app no las recita. */
  rhythm?: LuaSongRhythm;
  interactiveTask: {
    title: string;
    description: string;
    actionType: 'drawing' | 'counter' | 'color_picker' | 'vowel_motion' | 'animal_tap' | 'sequence_ordering' | 'body_touch' | 'social_practice' | 'item_matching';
    elements?: string[];
  };
}

export const LUA_SONGS_CATALOG: LuaSong[] = [
  {
    id: 'lua_song_01',
    number: 1,
    ageBands: ['0-2', '2-3', '3-4'],
    title: 'Sol, solecito',
    subtitle: 'Canción tradicional · rutina de la mañana',
    theme: 'rutina_manana',
    consigna: 'Cántala tú al empezar el día, despacio. Al decir «sol», señalad juntos la ventana.',
    lyrics: [
      'Sol, solecito,',
      'caliéntame un poquito,',
      'por hoy, por mañana,',
      'por toda la semana.',
    ],
    interactiveTask: {
      title: 'Dibuja el sol sonriente',
      description: 'Dibuja en la pantalla al sol brillando y tu cara sonriendo al despertar.',
      actionType: 'drawing',
    },
  },
  {
    id: 'lua_song_02',
    number: 2,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Un elefante se balanceaba',
    subtitle: 'Canción tradicional · contar del 1 al 10',
    theme: 'conteo',
    consigna: 'Cántala tú y sumad un elefante en cada vuelta, hasta diez. Toca el número cada vez que llega otro.',
    lyrics: [
      'Un elefante se balanceaba',
      'sobre la tela de una araña.',
      'Como veía que resistía,',
      'fue a llamar a otro elefante.',
      'Dos elefantes se balanceaban',
      'sobre la tela de una araña.',
      'Como veían que resistía,',
      'fueron a llamar a otro elefante.',
    ],
    interactiveTask: {
      title: 'Cuenta los elefantes',
      description: 'Toca un número cada vez que llega otro elefante, del 1 al 10.',
      actionType: 'counter',
      elements: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    },
  },
  {
    id: 'lua_song_03',
    number: 3,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'De colores',
    subtitle: 'Canción tradicional · los colores',
    theme: 'colores',
    consigna: 'Cántala tú y señalad cada color en la pantalla y en lo que tengáis alrededor.',
    lyrics: [
      'De colores,',
      'de colores se visten los campos en la primavera.',
      'De colores,',
      'de colores son los pajaritos que vienen de fuera.',
      'De colores,',
      'de colores es el arco iris que vemos lucir.',
      'Y por eso los grandes amores',
      'de muchos colores me gustan a mí.',
    ],
    interactiveTask: {
      title: 'Toca los colores',
      description: 'Toca cada color: rojo, naranja, amarillo, verde, azul y morado.',
      actionType: 'color_picker',
      elements: ['Rojo', 'Naranja', 'Amarillo', 'Verde', 'Azul', 'Morado'],
    },
  },
  {
    id: 'lua_song_04',
    number: 4,
    ageBands: ['3-4', '4-5', '5-7'],
    title: 'La mar estaba serena',
    subtitle: 'Canción tradicional · juego de vocales',
    theme: 'vocales_motor',
    consigna: 'Cántala tú primero normal. Después elegid una vocal y cantadla cambiando todas las vocales por esa.',
    lyrics: [
      'La mar estaba serena,',
      'serena estaba la mar.',
      'Con la a:',
      'La mar astaba sarana,',
      'sarana astaba la mar.',
      'Con la i:',
      'Li mir istibi sirini,',
      'sirini istibi li mir.',
    ],
    interactiveTask: {
      title: 'Elige la vocal',
      description: 'Toca una vocal y cantad la canción entera solo con ella.',
      actionType: 'vowel_motion',
      elements: ['A', 'E', 'I', 'O', 'U'],
    },
  },
  {
    id: 'lua_song_05',
    number: 5,
    ageBands: ['0-2', '2-3', '3-4'],
    title: 'Los pollitos dicen',
    subtitle: 'Canción tradicional · sonidos de animales',
    theme: 'onomatopeyas',
    consigna: 'Cántala tú y haced juntos el «pío, pío, pío» y el gesto de acurrucarse.',
    lyrics: [
      'Los pollitos dicen',
      'pío, pío, pío,',
      'cuando tienen hambre,',
      'cuando tienen frío.',
      'La gallina busca',
      'el maíz y el trigo,',
      'les da la comida',
      'y les presta abrigo.',
      'Bajo sus dos alas,',
      'acurrucaditos,',
      'hasta el otro día',
      'duermen los pollitos.',
    ],
    interactiveTask: {
      title: 'Toca al animal y haz su sonido',
      description: 'Toca al pollito y a la gallina e imitad cómo hace cada uno.',
      actionType: 'animal_tap',
      elements: ['Pollito', 'Gallina'],
    },
  },
  {
    id: 'lua_song_06',
    number: 6,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Pimpón',
    subtitle: 'Canción tradicional · lavarse',
    theme: 'higiene_secuencia',
    consigna: 'Cántala tú mientras hacéis como Pimpón: lavarse la cara y las manos con agua y jabón.',
    lyrics: [
      'Pimpón es un muñeco',
      'muy guapo y de cartón,',
      'se lava la carita',
      'con agua y con jabón.',
      'Pimpón, dame la mano',
      'con un fuerte apretón,',
      'que quiero ser tu amigo,',
      'Pimpón, Pimpón, Pimpón.',
    ],
    interactiveTask: {
      title: 'Numera los 4 pasos',
      description: 'Ordena del 1 al 4: 1. Moja tus manos, 2. Frota con jabón, 3. Enjuaga, 4. Sécalas.',
      actionType: 'sequence_ordering',
      elements: ['Moja tus manos', 'Frota con jabón', 'Enjuaga', 'Sécalas'],
    },
  },
  {
    id: 'lua_song_07',
    number: 7,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Cabeza, hombros, rodillas y pies',
    subtitle: 'Canción tradicional · las partes del cuerpo',
    theme: 'esquema_corporal',
    consigna: 'Cántala tú y tocad cada parte del cuerpo al nombrarla. Cada vuelta, un poco más rápido.',
    lyrics: [
      'Cabeza, hombros, rodillas, pies,',
      'rodillas, pies.',
      'Cabeza, hombros, rodillas, pies,',
      'rodillas, pies.',
      'Ojos, orejas, boca y nariz.',
      'Cabeza, hombros, rodillas, pies,',
      'rodillas, pies.',
    ],
    interactiveTask: {
      title: 'Señala las partes del cuerpo',
      description: 'Toca cabeza, hombros, rodillas y pies.',
      actionType: 'body_touch',
      elements: ['Cabeza', 'Hombros', 'Rodillas', 'Pies'],
    },
  },
  {
    id: 'lua_song_08',
    number: 8,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Naranja dulce',
    subtitle: 'Canción tradicional · frutas y turnos',
    theme: 'frutas_alimentacion',
    consigna: 'Cántala tú en corro, de la mano. Al terminar, un abrazo.',
    lyrics: [
      'Naranja dulce,',
      'limón partido,',
      'dame un abrazo',
      'que yo te pido.',
    ],
    interactiveTask: {
      title: 'Las frutas de la canción',
      description: 'Toca la naranja y el limón.',
      actionType: 'drawing',
      elements: ['Naranja', 'Limón'],
    },
  },
  {
    id: 'lua_song_09',
    number: 9,
    ageBands: ['3-4', '4-5', '5-7'],
    title: 'Al corro de la patata',
    subtitle: 'Canción tradicional · jugar juntos',
    theme: 'cortesia_social',
    consigna: 'Cantadla en corro, de la mano. Se pide jugar con un «por favor» y al terminar se dan las gracias.',
    lyrics: [
      'Al corro de la patata,',
      'comeremos ensalada,',
      'lo que comen los señores,',
      'naranjitas y limones.',
      '¡Achupé, achupé,',
      'sentadita me quedé!',
    ],
    interactiveTask: {
      title: 'Practica con Lúa',
      description: 'Pide jugar con un «Por favor…» y responde con un alegre «¡Muchas gracias!».',
      actionType: 'social_practice',
      elements: ['"Por favor…"', '"¡Muchas gracias!"'],
    },
  },
  {
    id: 'lua_song_10',
    number: 10,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Estrellita, ¿dónde estás?',
    subtitle: 'Canción tradicional · calma y cierre',
    theme: 'orden_transicion',
    consigna: 'Cántala tú bajito para cerrar la sesión, mientras recogéis los juguetes.',
    lyrics: [
      'Estrellita, ¿dónde estás?',
      'Me pregunto qué serás.',
      'En el cielo o en el mar,',
      'un diamante de verdad.',
      'Estrellita, ¿dónde estás?',
      'Me pregunto qué serás.',
    ],
    interactiveTask: {
      title: 'Cada objeto a su lugar',
      description: 'Arrastra la pelota a la caja de juguetes y el cuento al estante de libros.',
      actionType: 'item_matching',
      elements: ['Pelota → Caja de juguetes', 'Cuento → Estante de libros'],
    },
  },
];

export const getSongById = (id: string): LuaSong | undefined =>
  LUA_SONGS_CATALOG.find((s) => s.id === id);

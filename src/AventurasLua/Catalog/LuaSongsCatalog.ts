// ============================================================================
// Aventuras con Lúa · Lúa y las Palabras — Catálogo de Canciones Motoras y de Lenguaje
// 10 canciones que combinan ritmo, fonología, praxias orales y esquemas motores.
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
    title: 'Buenos días, sol',
    subtitle: 'Rutina de la mañana y bienvenida al día',
    theme: 'rutina_manana',
    consigna: 'Canta esta canción cada mañana. Cuando digas "sol", señala la ventana.',
    lyrics: [
      'Buenos días, sol bonito,',
      'buenos días, buen amigo,',
      'abro mis ojitos ya,',
      'y te vengo a saludar.',
      'Me levanto de la cama,',
      'me estiro con energía,',
      'buenos días a mi casa,',
      '¡empieza un lindo día!',
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
    title: 'Contando cocos',
    subtitle: 'Canción rítmica para contar del 1 al 10',
    theme: 'conteo',
    consigna: 'Canta con Lúa. Cada vez que digas un número, toca el coco en la pantalla.',
    lyrics: [
      'Uno, dos, tres cocos,',
      'cuatro, cinco, seis,',
      'los cocos de la palma',
      'las cuento otra vez.',
      'Siete, ocho, nueve,',
      'diez y ya se fue,',
      '¡a beber agua de coco',
      'que me la merecí!',
    ],
    interactiveTask: {
      title: 'Cuenta y toca 10 cocos',
      description: 'Toca los 10 cocos numerados del 1 al 10 en orden para llenar el canasto.',
      actionType: 'counter',
      elements: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    },
  },
  {
    id: 'lua_song_03',
    number: 3,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Los colores del arcoíris',
    subtitle: 'Discriminación cromática y rima',
    theme: 'colores',
    consigna: 'Canta y señala cada franja del arcoíris en pantalla mientras nombras su color.',
    lyrics: [
      'Rojo como una fresa,',
      'naranja como el sol,',
      'amarillo muy brillante,',
      'verde como una hoja,',
      'azul como el cielo,',
      'morado como una flor,',
      'todos juntos en el cielo,',
      '¡forman un arcoíris de color!',
    ],
    interactiveTask: {
      title: 'Toca los colores',
      description: 'Toca cada color en el arcoíris: rojo, naranja, amarillo, verde, azul y morado.',
      actionType: 'color_picker',
      elements: ['Rojo', 'Naranja', 'Amarillo', 'Verde', 'Azul', 'Morado'],
    },
  },
  {
    id: 'lua_song_04',
    number: 4,
    ageBands: ['3-4', '4-5', '5-7'],
    title: 'El baile de las vocales',
    subtitle: 'Praxias articulatorias y motricidad corporal',
    theme: 'vocales_motor',
    consigna: 'Canta cada vocal con Lúa y realiza el movimiento corporal correspondiente.',
    lyrics: [
      'Con la A yo abro los brazos,',
      'con la E estiro los pies,',
      'con la I me hago chiquito,',
      'con la O doy vueltas también,',
      'con la U me agacho un poco,',
      '¡y bailamos otra vez!',
    ],
    interactiveTask: {
      title: 'Repite la vocal y haz el movimiento',
      description: 'Toca cada vocal en pantalla para escuchar su sonido y ver a Lúa bailar.',
      actionType: 'vowel_motion',
      elements: ['A', 'E', 'I', 'O', 'U'],
    },
  },
  {
    id: 'lua_song_05',
    number: 5,
    ageBands: ['0-2', '2-3', '3-4'],
    title: 'Animales del patio',
    subtitle: 'Repertorio onomatopéyico y discriminación',
    theme: 'onomatopeyas',
    consigna: 'Canta e imita el sonido de cada animal cuando aparezca junto a Lúa.',
    lyrics: [
      'En mi patio hay un perrito,',
      'que hace ¡guau, guau, guau!,',
      'también vive una gallina,',
      'que hace ¡cocorocó!,',
      'y no falta la vaquita,',
      'que hace ¡muuu, muuu, muuu!,',
      '¡todos cantan en mi patio,',
      'y yo canto junto a ti!',
    ],
    interactiveTask: {
      title: 'Toca al animal y haz su sonido',
      description: 'Toca a perro, gallina, vaca y gato para escuchar y repetir sus onomatopeyas.',
      actionType: 'animal_tap',
      elements: ['Perro', 'Gallina', 'Vaca', 'Gato'],
    },
  },
  {
    id: 'lua_song_06',
    number: 6,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Lávate las manitos',
    subtitle: 'Hábito de higiene y secuenciación en 4 pasos (20 segundos)',
    theme: 'higiene_secuencia',
    consigna: 'Canta esta canción mientras te lavas las manos de verdad. ¡Veinte segundos completos!',
    lyrics: [
      'Lávate las manitos,',
      'con agua y con jabón,',
      'por delante, por detrás,',
      'quítales el germen y algo más,',
      'un, dos, tres, cuatro,',
      'cinco, seis, listo ya,',
      'manitos bien limpiecitas,',
      '¡para poder jugar!',
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
    title: 'Mi cuerpo se mueve',
    subtitle: 'Esquema corporal y propiocepción',
    theme: 'esquema_corporal',
    consigna: 'Canta y toca cada parte de tu cuerpo que Lúa va nombrando.',
    lyrics: [
      'Toco mi cabeza, toco mis hombros,',
      'toco mi barriga y toco mis codos,',
      'muevo mis manitos, muevo mis piecitos,',
      'así se mueve todo mi cuerpecito.',
    ],
    interactiveTask: {
      title: 'Señala las partes del cuerpo',
      description: 'Toca en el avatar de Lúa: cabeza, hombros, barriga y codos.',
      actionType: 'body_touch',
      elements: ['Cabeza', 'Hombros', 'Barriga', 'Codos'],
    },
  },
  {
    id: 'lua_song_08',
    number: 8,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'La ronda de las frutas',
    subtitle: 'Vocabulario nutricional, rima y turnos',
    theme: 'frutas_alimentacion',
    consigna: 'Canta en ronda tomados de la mano y señala la fruta que se mencione.',
    lyrics: [
      'Vamos a la ronda de las frutas,',
      'mango, lechosa y chinola también,',
      'damos vueltas y vueltas,',
      'cantando mi canción otra vez,',
      'guineo dulce y maduro,',
      'todos lo queremos comer,',
      '¡ay qué rica la fruta,',
      'la comemos en familia también!',
    ],
    interactiveTask: {
      title: 'Selecciona las frutas de la ronda',
      description: 'Toca el mango, la lechosa, la chinola y el guineo en el frutero.',
      actionType: 'drawing',
      elements: ['Mango', 'Lechosa', 'Chinola', 'Guineo'],
    },
  },
  {
    id: 'lua_song_09',
    number: 9,
    ageBands: ['3-4', '4-5', '5-7'],
    title: 'Gracias y por favor',
    subtitle: 'Pragmática social y fórmulas de cortesía',
    theme: 'cortesia_social',
    consigna: 'Canta y practica decir "gracias" y "por favor" con Lúa o un amigo.',
    lyrics: [
      'Si tú quieres algo,',
      'di por favor,',
      'y cuando te lo dan,',
      'di gracias con amor,',
      'las palabras mágicas',
      'abren el corazón,',
      'por favor y gracias,',
      '¡así se dice mejor!',
    ],
    interactiveTask: {
      title: 'Practica con Lúa',
      description: 'Pide algo usando "Por favor…" y responde con un alegre "¡Muchas gracias!".',
      actionType: 'social_practice',
      elements: ['"Por favor…"', '"¡Muchas gracias!"'],
    },
  },
  {
    id: 'lua_song_10',
    number: 10,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'A guardar los juguetes',
    subtitle: 'Funciones ejecutivas y transición ordenada de cierre',
    theme: 'orden_transicion',
    consigna: 'Canta esta canción mientras ayudas a ordenar los juguetes al terminar la sesión.',
    lyrics: [
      'A guardar, a guardar,',
      'cada cosa en su lugar,',
      'los juguetes a su caja,',
      'los libros a su estante,',
      'cuando todo está ordenado,',
      'nos sentimos importantes,',
      'a guardar, a guardar,',
      '¡y después a descansar!',
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

// ============================================================================
// Aventuras con Lúa · Lúa y las Palabras — Catálogo de Material Imprimible
// 10 fichas manipulativas y diplomas listos para renderizar y exportar a PDF.
// ============================================================================
import type { AgeBand } from './LuaAssessmentCatalog';
import type { PictoKey } from '../../ValeriaPixelArt';
import type { BlockIconName } from '../../ValeriaBlockIcons';

export type PrintableCategory =
  | 'vocabulario'
  | 'rutinas'
  | 'grafomotricidad'
  | 'fonologia'
  | 'emociones'
  | 'rimas'
  | 'escritura'
  | 'clasificacion'
  | 'seguimiento_semanal'
  | 'diploma';


/**
 * La hoja de verdad. `pdfTemplateKey` nombraba una plantilla que no existía en
 * ninguna parte —el campo estaba en los diez ítems y no lo leía nadie—, así que
 * «Imprime y Juega» prometía diez fichas y entregaba diez descripciones de
 * fichas. Esto es el contenido real, con las fichas del banco propio, para que
 * la hoja se pueda usar desde la tableta o llevarse a papel.
 */
export type LuaSheetCell = { pic?: PictoKey; label: string };

export type LuaPrintableSheet =
  /** Rejilla de tarjetas recortables (vocabulario, bingo). */
  | { kind: 'pic_cards'; cols: number; cells: LuaSheetCell[]; cutGuides?: boolean }
  /** Tira de pasos numerados para laminar. */
  | { kind: 'sequence'; steps: LuaSheetCell[] }
  /** Pauta de trazo: letra grande y renglón de repetición. */
  | { kind: 'tracing'; letters: string[]; repeats: number }
  /** Columnas semánticas con fichas recortables al pie. */
  | { kind: 'columns'; headings: string[]; chips: LuaSheetCell[] }
  /** Palabra con hueco y recuadro de dibujo. */
  | { kind: 'word_gaps'; items: Array<{ template: string; answer: string; pic?: PictoKey }> }
  /** Parejas que riman, en fichas de dominó. */
  | { kind: 'rhyme_pairs'; pairs: Array<[LuaSheetCell, LuaSheetCell]> }
  /** Rueda giratoria de emociones. */
  | { kind: 'wheel'; segments: Array<{ label: string; color: string }> }
  /** Tabla de lunes a viernes. */
  | { kind: 'weekly'; days: string[]; rows: string[] }
  /** Diploma con nombre y fecha. */
  | { kind: 'diploma'; headline: string; body: string };

export interface LuaPrintableItem {
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
  category: PrintableCategory;
  instructions: string;
  materialsNeeded: string[];
  /** Clave heredada del material de origen. Se conserva como trazabilidad
   *  con las 50 hojas; lo que se pinta es `sheet`. */
  pdfTemplateKey: string;
  /** Icono del set propio (ValeriaBlockIcons), no un nombre de librería. */
  previewIcon: BlockIconName;
  sheet: LuaPrintableSheet;
}

export const LUA_PRINTABLES_CATALOG: LuaPrintableItem[] = [
  {
    id: 'lua_print_01',
    number: 1,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Tarjetas de vocabulario para recortar y emparejar',
    subtitle: '8 tarjetas ilustradas de alta frecuencia',
    category: 'vocabulario',
    instructions: 'Recorta las 8 tarjetas y guárdalas en un sobre. Úsalas para nombrar, emparejar o jugar al memorama en familia.',
    materialsNeeded: ['Tijeras de punta redonda', 'Sobre o bolsita para guardar'],
    pdfTemplateKey: 'tarjetas_vocabulario_8',
    previewIcon: 'printable',
    sheet: {
      kind: 'pic_cards',
      cols: 4,
      cutGuides: true,
      cells: [
        { pic: 'perro', label: 'Perro' }, { pic: 'gato', label: 'Gato' },
        { pic: 'pelota', label: 'Pelota' }, { pic: 'casa', label: 'Casa' },
        { pic: 'sol', label: 'Sol' }, { pic: 'pan', label: 'Pan' },
        { pic: 'vaso', label: 'Vaso' }, { pic: 'zapato', label: 'Zapato' },
      ],
    },
  },
  {
    id: 'lua_print_02',
    number: 2,
    ageBands: ['2-3', '3-4', '4-5'],
    title: 'Rutina de la mañana — secuencia para laminar',
    subtitle: 'Apoyo visual estructurado en 4 pasos con pictogramas',
    category: 'rutinas',
    instructions: 'Lamina esta tira y colócala en el baño o la habitación. Marca cada paso con un marcador borrable al completarlo: 1. Despertar, 2. Lavarse, 3. Vestirse, 4. Desayunar.',
    materialsNeeded: ['Plástico de laminar (o forro adhesivo)', 'Marcador de pizarra blanca'],
    pdfTemplateKey: 'tira_rutina_manana_4',
    previewIcon: 'check',
    sheet: {
      kind: 'sequence',
      steps: [
        { pic: 'dormir', label: 'Despertar' },
        { pic: 'mano-limpia', label: 'Lavarse' },
        { pic: 'vestir', label: 'Vestirse' },
        { pic: 'comer', label: 'Desayunar' },
      ],
    },
  },
  {
    id: 'lua_print_03',
    number: 3,
    ageBands: ['4-5', '5-7'],
    title: 'Hoja de trazo: letras D, E, F',
    subtitle: 'Grafomotricidad pautada con imagen y modelo',
    category: 'grafomotricidad',
    instructions: 'Pasa primero el dedito sobre cada letra en relieve y luego sigue las líneas punteadas con lápiz de color o cera gruesa.',
    materialsNeeded: ['Lápiz de mina blanda o crayón grueso'],
    pdfTemplateKey: 'hoja_trazo_def',
    previewIcon: 'pencil',
    sheet: { kind: 'tracing', letters: ['D', 'E', 'F'], repeats: 6 },
  },
  {
    id: 'lua_print_04',
    number: 4,
    ageBands: ['4-5', '5-7'],
    title: 'Bingo de sonidos iniciales',
    subtitle: 'Tablero 3x3 de discriminación fonética',
    category: 'fonologia',
    instructions: 'El adulto dice una palabra; el niño busca y coloca una ficha o poroto en la casilla si empieza con el mismo sonido inicial.',
    materialsNeeded: ['Tijeras', '9 fichas, botones o tapitas plásticas'],
    pdfTemplateKey: 'bingo_sonidos_iniciales',
    previewIcon: 'printable',
    sheet: {
      kind: 'pic_cards',
      cols: 3,
      cells: [
        { pic: 'sol', label: 'Sol' }, { pic: 'sapo', label: 'Sapo' }, { pic: 'silla', label: 'Silla' },
        { pic: 'mesa', label: 'Mesa' }, { pic: 'manzana', label: 'Manzana' }, { pic: 'mano', label: 'Mano' },
        { pic: 'pan', label: 'Pan' }, { pic: 'pato', label: 'Pato' }, { pic: 'pelota', label: 'Pelota' },
      ],
    },
  },
  {
    id: 'lua_print_05',
    number: 5,
    ageBands: ['3-4', '4-5', '5-7'],
    title: 'Rueda de las emociones de Lúa',
    subtitle: 'Rueda giratoria con broche mariposa para autorregulación',
    category: 'emociones',
    instructions: 'Recorta los dos círculos y la flecha de Lúa. Únelos con un broche mariposa (encuadernador) en el centro. Gira la flecha cada mañana para expresar cómo te sientes (Feliz, Triste, Enojado, Sorprendido, Asustado, Tranquilo).',
    materialsNeeded: ['Tijeras', 'Broche mariposa (encuadernador de dos patas)', 'Cartulina'],
    pdfTemplateKey: 'rueda_emociones_lua',
    previewIcon: 'lua',
    sheet: {
      kind: 'wheel',
      segments: [
        { label: 'Feliz', color: '#FDE68A' }, { label: 'Triste', color: '#BFDBFE' },
        { label: 'Enojado', color: '#FECACA' }, { label: 'Sorprendido', color: '#DDD6FE' },
        { label: 'Asustado', color: '#E2E8F0' }, { label: 'Tranquilo', color: '#BBF7D0' },
      ],
    },
  },
  {
    id: 'lua_print_06',
    number: 6,
    ageBands: ['4-5', '5-7'],
    title: 'Dominó de rimas',
    subtitle: 'Fichas de rima fonológica (gato/pato, sol/caracol, casa/masa, flor/calor)',
    category: 'rimas',
    instructions: 'Recorta las fichas rectangulares. Cada jugador coloca una ficha haciendo coincidir palabras que terminen con el mismo sonido rimado.',
    materialsNeeded: ['Tijeras', 'Cartulina o papel grueso'],
    pdfTemplateKey: 'domino_rimas_infantil',
    previewIcon: 'printable',
    sheet: {
      kind: 'rhyme_pairs',
      pairs: [
        [{ pic: 'gato', label: 'Gato' }, { pic: 'pato', label: 'Pato' }],
        [{ pic: 'sol', label: 'Sol' }, { label: 'Caracol' }],
        [{ pic: 'casa', label: 'Casa' }, { label: 'Masa' }],
        [{ label: 'Flor' }, { label: 'Calor' }],
      ],
    },
  },
  {
    id: 'lua_print_07',
    number: 7,
    ageBands: ['5-7', '7-10'],
    title: 'Cuaderno de completar la palabra',
    subtitle: 'Lectura fonética inicial (_OL, CA_A, PELO_A) y dibujo',
    category: 'escritura',
    instructions: 'Escribe la letra que falta para completar la palabra y dibuja en el recuadro grande el objeto terminado.',
    materialsNeeded: ['Lápiz de grafito', 'Colores para dibujar'],
    pdfTemplateKey: 'completar_dibujar_palabra',
    previewIcon: 'story',
    sheet: {
      kind: 'word_gaps',
      items: [
        { template: '_ O L', answer: 'S', pic: 'sol' },
        { template: 'C A _ A', answer: 'S', pic: 'casa' },
        { template: 'P E L O _ A', answer: 'T', pic: 'pelota' },
      ],
    },
  },
  {
    id: 'lua_print_08',
    number: 8,
    ageBands: ['3-4', '4-5', '5-7'],
    title: 'Tablero de clasificación: animales, frutas y ropa',
    subtitle: '3 columnas semánticas con fichas recortables',
    category: 'clasificacion',
    instructions: 'Recorta las fichas de la parte inferior y pégalas en la columna correspondiente: Animales, Frutas o Ropa.',
    materialsNeeded: ['Tijeras', 'Pegamento en barra'],
    pdfTemplateKey: 'tablero_clasificacion_3col',
    previewIcon: 'printable',
    sheet: {
      kind: 'columns',
      headings: ['Animales', 'Frutas', 'Ropa'],
      chips: [
        { pic: 'perro', label: 'Perro' }, { pic: 'gato', label: 'Gato' }, { pic: 'vaca', label: 'Vaca' },
        { pic: 'manzana', label: 'Manzana' }, { pic: 'platano', label: 'Plátano' }, { label: 'Uvas' },
        { pic: 'zapato', label: 'Zapato' }, { pic: 'gorra', label: 'Gorra' }, { pic: 'bufanda', label: 'Bufanda' },
      ],
    },
  },
  {
    id: 'lua_print_09',
    number: 9,
    ageBands: ['3-4', '4-5', '5-7', '7-10'],
    title: 'Ficha semanal de práctica en casa',
    subtitle: 'Seguimiento de hábitos comunicativos de lunes a viernes',
    category: 'seguimiento_semanal',
    instructions: 'Pega esta ficha en la nevera o mural. Dibuja una carita feliz cada día al completar la actividad sugerida (nombrar objetos, cantar, leer un cuento, jugar a las rimas).',
    materialsNeeded: ['Lápices de colores o pegatinas de estrellas'],
    pdfTemplateKey: 'ficha_semanal_habitos',
    previewIcon: 'printable',
    sheet: {
      kind: 'weekly',
      days: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
      rows: ['Nombrar objetos', 'Cantar con Lúa', 'Leer un cuento', 'Jugar a las rimas'],
    },
  },
  {
    id: 'lua_print_10',
    number: 10,
    ageBands: ['0-2', '2-3', '3-4', '4-5', '5-7', '7-10'],
    title: 'Diploma de logros de Lúa: "¡Lo logré!"',
    subtitle: 'Certificado de esfuerzo, constancia y alegría',
    category: 'diploma',
    instructions: 'Escribe el nombre del peque y la fecha. Entrega este diploma con una gran felicitación familiar para celebrar todo lo aprendido.',
    materialsNeeded: ['Rotulador dorado o de color vivo para firmar'],
    pdfTemplateKey: 'diploma_logros_lua',
    previewIcon: 'award',
    sheet: {
      kind: 'diploma',
      headline: '¡Lo logré!',
      body: 'Por el esfuerzo, la constancia y la alegría de cada día con Lúa.',
    },
  },
];

export const getPrintableById = (id: string): LuaPrintableItem | undefined =>
  LUA_PRINTABLES_CATALOG.find((p) => p.id === id);

// ============================================================================
// Aventuras con Lúa · Lúa y las Palabras — Catálogo de Material Imprimible
// 10 fichas manipulativas y diplomas listos para renderizar y exportar a PDF.
// ============================================================================

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

export interface LuaPrintableItem {
  id: string;
  number: number; // 1 a 10
  title: string;
  subtitle: string;
  category: PrintableCategory;
  instructions: string;
  materialsNeeded: string[];
  pdfTemplateKey: string;
  previewIcon: string;
}

export const LUA_PRINTABLES_CATALOG: LuaPrintableItem[] = [
  {
    id: 'lua_print_01',
    number: 1,
    title: 'Tarjetas de vocabulario para recortar y emparejar',
    subtitle: '8 tarjetas ilustradas de alta frecuencia',
    category: 'vocabulario',
    instructions: 'Recorta las 8 tarjetas y guárdalas en un sobre. Úsalas para nombrar, emparejar o jugar al memorama en familia.',
    materialsNeeded: ['Tijeras de punta redonda', 'Sobre o bolsita para guardar'],
    pdfTemplateKey: 'tarjetas_vocabulario_8',
    previewIcon: 'layers',
  },
  {
    id: 'lua_print_02',
    number: 2,
    title: 'Rutina de la mañana — secuencia para laminar',
    subtitle: 'Apoyo visual estructurado en 4 pasos con pictogramas',
    category: 'rutinas',
    instructions: 'Lamina esta tira y colócala en el baño o la habitación. Marca cada paso con un marcador borrable al completarlo: 1. Despertar, 2. Lavarse, 3. Vestirse, 4. Desayunar.',
    materialsNeeded: ['Plástico de laminar (o forro adhesivo)', 'Marcador de pizarra blanca'],
    pdfTemplateKey: 'tira_rutina_manana_4',
    previewIcon: 'check-square',
  },
  {
    id: 'lua_print_03',
    number: 3,
    title: 'Hoja de trazo: letras D, E, F',
    subtitle: 'Grafomotricidad pautada con imagen y modelo',
    category: 'grafomotricidad',
    instructions: 'Pasa primero el dedito sobre cada letra en relieve y luego sigue las líneas punteadas con lápiz de color o cera gruesa.',
    materialsNeeded: ['Lápiz de mina blanda o crayón grueso'],
    pdfTemplateKey: 'hoja_trazo_def',
    previewIcon: 'edit-3',
  },
  {
    id: 'lua_print_04',
    number: 4,
    title: 'Bingo de sonidos iniciales',
    subtitle: 'Tablero 3x3 de discriminación fonética',
    category: 'fonologia',
    instructions: 'El adulto dice una palabra; el niño busca y coloca una ficha o poroto en la casilla si empieza con el mismo sonido inicial.',
    materialsNeeded: ['Tijeras', '9 fichas, botones o tapitas plásticas'],
    pdfTemplateKey: 'bingo_sonidos_iniciales',
    previewIcon: 'grid',
  },
  {
    id: 'lua_print_05',
    number: 5,
    title: 'Rueda de las emociones de Lúa',
    subtitle: 'Rueda giratoria con broche mariposa para autorregulación',
    category: 'emociones',
    instructions: 'Recorta los dos círculos y la flecha de Lúa. Únelos con un broche mariposa (encuadernador) en el centro. Gira la flecha cada mañana para expresar cómo te sientes (Feliz, Triste, Enojado, Sorprendido, Asustado, Tranquilo).',
    materialsNeeded: ['Tijeras', 'Broche mariposa (encuadernador de dos patas)', 'Cartulina'],
    pdfTemplateKey: 'rueda_emociones_lua',
    previewIcon: 'compass',
  },
  {
    id: 'lua_print_06',
    number: 6,
    title: 'Dominó de rimas',
    subtitle: 'Fichas de rima fonológica (gato/pato, sol/caracol, casa/masa, flor/calor)',
    category: 'rimas',
    instructions: 'Recorta las fichas rectangulares. Cada jugador coloca una ficha haciendo coincidir palabras que terminen con el mismo sonido rimado.',
    materialsNeeded: ['Tijeras', 'Cartulina o papel grueso'],
    pdfTemplateKey: 'domino_rimas_infantil',
    previewIcon: 'columns',
  },
  {
    id: 'lua_print_07',
    number: 7,
    title: 'Cuaderno de completar la palabra',
    subtitle: 'Lectura fonética inicial (_OL, CA_A, PELO_A) y dibujo',
    category: 'escritura',
    instructions: 'Escribe la letra que falta para completar la palabra y dibuja en el recuadro grande el objeto terminado.',
    materialsNeeded: ['Lápiz de grafito', 'Colores para dibujar'],
    pdfTemplateKey: 'completar_dibujar_palabra',
    previewIcon: 'book-open',
  },
  {
    id: 'lua_print_08',
    number: 8,
    title: 'Tablero de clasificación: animales, frutas y ropa',
    subtitle: '3 columnas semánticas con fichas recortables',
    category: 'clasificacion',
    instructions: 'Recorta las fichas de la parte inferior y pégalas en la columna correspondiente: Animales, Frutas o Ropa.',
    materialsNeeded: ['Tijeras', 'Pegamento en barra'],
    pdfTemplateKey: 'tablero_clasificacion_3col',
    previewIcon: 'layout',
  },
  {
    id: 'lua_print_09',
    number: 9,
    title: 'Ficha semanal de práctica en casa',
    subtitle: 'Seguimiento de hábitos comunicativos de lunes a viernes',
    category: 'seguimiento_semanal',
    instructions: 'Pega esta ficha en la nevera o mural. Dibuja una carita feliz cada día al completar la actividad sugerida (nombrar objetos, cantar, leer un cuento, jugar a las rimas).',
    materialsNeeded: ['Lápices de colores o pegatinas de estrellas'],
    pdfTemplateKey: 'ficha_semanal_habitos',
    previewIcon: 'calendar',
  },
  {
    id: 'lua_print_10',
    number: 10,
    title: 'Diploma de logros de Lúa: "¡Lo logré!"',
    subtitle: 'Certificado de esfuerzo, constancia y alegría',
    category: 'diploma',
    instructions: 'Escribe el nombre del peque y la fecha. Entrega este diploma con una gran felicitación familiar para celebrar todo lo aprendido.',
    materialsNeeded: ['Rotulador dorado o de color vivo para firmar'],
    pdfTemplateKey: 'diploma_logros_lua',
    previewIcon: 'award',
  },
];

export const getPrintableById = (id: string): LuaPrintableItem | undefined =>
  LUA_PRINTABLES_CATALOG.find((p) => p.id === id);

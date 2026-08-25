// ============================================================================
// Valeria+ · Banco de Trazos y Grafomotricidad para Dislexia
// Catálogo de modelos de letras críticas, lazos pre-escritura y palabras guiadas.
// ============================================================================
import { ModelPathGuide } from './valeriaWritingTypes';

export interface WritingItem {
  id: string;
  category: 'critical' | 'warmup';
  title: string;
  phoneme: string;
  prompt: string;
  contrastWith?: string;
  guide: ModelPathGuide;
}

// ----------------------------------------------------------------------------
// Elogios LOCUTADOS de la pizarra, por variedad. Viven aquí y no en el catálogo
// de interfaz por el mismo motivo que MIC_VERDICT_SAY: lo que la app pronuncia
// se hornea en el corpus de voz, y el corpus solo puede importar módulos puros
// de datos. Índices: 0 = pizarra libre · 1 = trazo correcto · 2 = casi.
//
// CUALQUIER retoque de estas cadenas exige `node scripts/export-voice-corpus.js`
// en el MISMO commit; si no, el id deja de resolver y la frase cae a la voz del
// sistema (y en gallego y euskera se pierden Celtia e ILENIA).
// ----------------------------------------------------------------------------
export type WritingPraise = readonly [string, string, string];

export const WRITING_PRAISE: WritingPraise = [
  '¡Qué dibujo tan bonito has hecho en la pizarra!',
  '¡Excelente! Has seguido la dirección perfecta.',
  '¡Casi casi! Sigue las flechas y los números despacito.',
];

export const WRITING_PRAISE_GL: WritingPraise = [
  'Que debuxo tan bonito fixeches no encerado!',
  'Excelente! Seguiches a dirección á perfección.',
  'Case case! Segue as frechas e os números amodiño.',
];

export const WRITING_PRAISE_EU: WritingPraise = [
  'Zein marrazki polita egin duzun arbelean!',
  'Bikain! Norabidea ezin hobeto jarraitu duzu.',
  'Ia-ia! Jarraitu geziak eta zenbakiak poliki-poliki.',
];

export const WRITING_PRAISE_EN: WritingPraise = [
  'What a lovely drawing you made on the chalkboard!',
  'Excellent! You followed the direction perfectly.',
  'Almost there! Follow the arrows and the numbers slowly.',
];

/** Elogio de la variedad activa. `loc` es el contentLocale de valeriaLocale. */
export const writingPraiseFor = (loc: string, kind: 0 | 1 | 2): string =>
  loc === 'eu' ? WRITING_PRAISE_EU[kind]
    : loc === 'gl' ? WRITING_PRAISE_GL[kind]
      : loc === 'en-US' ? WRITING_PRAISE_EN[kind]
        : WRITING_PRAISE[kind];

// Modelos calibrados para canvas estándar de ~320x300 px
export const WRITING_EXERCISES: WritingItem[] = [
  // --- Nivel 1: Letras Críticas Anti-Inversión (Dislexia) ---
  {
    id: 'crit-b',
    category: 'critical',
    title: 'Letra b (de barco)',
    phoneme: 'b',
    prompt: 'El palo baja primero, y luego la barriga a la derecha.',
    contrastWith: 'd',
    guide: {
      id: 'guide-b',
      label: 'b',
      soundCue: 'b',
      // Línea vertical que baja y círculo a la derecha
      svgPath: 'M 110 70 L 110 230 C 110 230 140 160 185 160 C 230 160 230 230 185 230 C 140 230 110 230 110 230',
      waypoints: [
        { id: 1, x: 110, y: 70, label: '1', order: 1 },
        { id: 2, x: 110, y: 150, label: '2', order: 2 },
        { id: 3, x: 110, y: 230, label: '3', order: 3 },
        { id: 4, x: 185, y: 160, label: '4', order: 4 },
        { id: 5, x: 220, y: 195, label: '5', order: 5 },
        { id: 6, x: 185, y: 230, label: '6', order: 6 },
      ],
    },
  },
  {
    id: 'crit-d',
    category: 'critical',
    title: 'Letra d (de dado)',
    phoneme: 'd',
    prompt: 'La barriga redonda va primero, y el palo alto a la derecha.',
    contrastWith: 'b',
    guide: {
      id: 'guide-d',
      label: 'd',
      soundCue: 'd',
      // Círculo a la izquierda y línea vertical que baja a la derecha
      svgPath: 'M 190 160 C 145 160 145 230 190 230 C 235 230 235 160 190 160 M 230 70 L 230 230',
      waypoints: [
        { id: 1, x: 190, y: 160, label: '1', order: 1 },
        { id: 2, x: 145, y: 195, label: '2', order: 2 },
        { id: 3, x: 190, y: 230, label: '3', order: 3 },
        { id: 4, x: 230, y: 70, label: '4', order: 4 },
        { id: 5, x: 230, y: 150, label: '5', order: 5 },
        { id: 6, x: 230, y: 230, label: '6', order: 6 },
      ],
    },
  },
  {
    id: 'crit-p',
    category: 'critical',
    title: 'Letra p (de pelota)',
    phoneme: 'p',
    prompt: 'El palo baja largo hacia abajo, y la cabeza redonda arriba.',
    contrastWith: 'q',
    guide: {
      id: 'guide-p',
      label: 'p',
      soundCue: 'p',
      svgPath: 'M 110 150 L 110 270 M 110 150 C 110 150 145 150 185 150 C 225 150 225 210 185 210 C 145 210 110 210 110 210',
      waypoints: [
        { id: 1, x: 110, y: 150, label: '1', order: 1 },
        { id: 2, x: 110, y: 210, label: '2', order: 2 },
        { id: 3, x: 110, y: 270, label: '3', order: 3 },
        { id: 4, x: 185, y: 150, label: '4', order: 4 },
        { id: 5, x: 220, y: 180, label: '5', order: 5 },
        { id: 6, x: 185, y: 210, label: '6', order: 6 },
      ],
    },
  },
  {
    id: 'crit-m',
    category: 'critical',
    title: 'Letra m (de moto)',
    phoneme: 'm',
    prompt: 'Un palito y dos montañitas seguidas.',
    contrastWith: 'n',
    guide: {
      id: 'guide-m',
      label: 'm',
      soundCue: 'm',
      svgPath: 'M 70 160 L 70 230 M 70 180 C 70 160 110 160 130 180 L 130 230 M 130 180 C 130 160 170 160 190 180 L 190 230',
      waypoints: [
        { id: 1, x: 70, y: 160, label: '1', order: 1 },
        { id: 2, x: 70, y: 230, label: '2', order: 2 },
        { id: 3, x: 110, y: 160, label: '3', order: 3 },
        { id: 4, x: 130, y: 230, label: '4', order: 4 },
        { id: 5, x: 170, y: 160, label: '5', order: 5 },
        { id: 6, x: 190, y: 230, label: '6', order: 6 },
      ],
    },
  },

  // --- Nivel 2: Lazos y Calentamiento Grafomotor ---
  {
    id: 'warm-waves',
    category: 'warmup',
    title: 'Olas del mar',
    phoneme: 'olas',
    prompt: 'Sube y baja suave como las olas del mar.',
    guide: {
      id: 'guide-waves',
      label: 'Olas',
      svgPath: 'M 50 200 Q 90 140 130 200 Q 170 140 210 200 Q 250 140 290 200',
      waypoints: [
        { id: 1, x: 50, y: 200, label: '1', order: 1 },
        { id: 2, x: 90, y: 140, label: '2', order: 2 },
        { id: 3, x: 130, y: 200, label: '3', order: 3 },
        { id: 4, x: 170, y: 140, label: '4', order: 4 },
        { id: 5, x: 210, y: 200, label: '5', order: 5 },
        { id: 6, x: 250, y: 140, label: '6', order: 6 },
        { id: 7, x: 290, y: 200, label: '7', order: 7 },
      ],
    },
  },
  {
    id: 'warm-loops',
    category: 'warmup',
    title: 'Bucles de Lúa',
    phoneme: 'bucles',
    prompt: 'Haz giros hacia arriba sin levantar el lápiz.',
    guide: {
      id: 'guide-loops',
      label: 'Lazos',
      svgPath: 'M 60 210 C 60 130 110 130 110 210 C 110 130 160 130 160 210 C 160 130 210 130 210 210 C 210 130 260 130 260 210',
      waypoints: [
        { id: 1, x: 60, y: 210, label: '1', order: 1 },
        { id: 2, x: 85, y: 130, label: '2', order: 2 },
        { id: 3, x: 110, y: 210, label: '3', order: 3 },
        { id: 4, x: 135, y: 130, label: '4', order: 4 },
        { id: 5, x: 160, y: 210, label: '5', order: 5 },
        { id: 6, x: 185, y: 130, label: '6', order: 6 },
        { id: 7, x: 210, y: 210, label: '7', order: 7 },
        { id: 8, x: 235, y: 130, label: '8', order: 8 },
        { id: 9, x: 260, y: 210, label: '9', order: 9 },
      ],
    },
  },
];

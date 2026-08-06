// ============================================================================
// Valeria+ · Frases habladas en INGLÉS AMERICANO (en) — plan en-US, EN-1.4
// Módulo PURO (sin imports de RN/Expo): el corpus de voz lo enumera en
// build-time para pre-generar su audio con la voz neuronal Piper `en_US`.
//
// Contiene lo mismo que sus hermanos valeriaContentGl/Eu.ts: cápsulas TPR,
// rutas de rutina, bancos de refuerzo, veredictos y frases fijas. El banco de
// PARES MÍNIMOS vive aparte, en valeriaMinimalPairsEn.ts, porque es el único
// dataset sujeto a la regla bloqueante EN-0.5 (veredicto dialectal por ítem).
//
// Las misiones y las rutas se adaptan al hogar estadounidense en vez de
// traducirse: no hay merienda ni siesta, y el registro es el de una app
// infantil de allí («grown-up», no «parent» ni «tutor»).
//
import { TprCapsule } from './valeriaTprBank';
import { RoutineRoute } from './valeriaRoutineRoutes';

// ESTADO: 🟡 provisional, pendiente de la pasada de hablante nativo (EN-7.4) y
// de la revisión SLP de los bancos de refuerzo (EN-3.4). El registro buscado es
// el de una app infantil estadounidense: «grown-up», no «parent» ni «tutor».
// ============================================================================

// ---------------------------------------------------------------------------
// Cápsulas TPR (EN-3.4). Órdenes cortas, imperativas y muy visuales (Asher).
// Las misiones se adaptan al hogar estadounidense: no hay siesta ni merienda,
// y las órdenes se apoyan en objetos que están en cualquier casa.
// ---------------------------------------------------------------------------
export const TPR_CAPSULES_EN: TprCapsule[] = [
  {
    icon: '🙆', title: 'Simon says… body!',
    commands: [
      { emoji: '🧠', text: 'Touch your head.' },
      { emoji: '👃', text: 'Touch your nose.' },
      { emoji: '🙌', text: 'Put your arms way up high.' },
    ],
  },
  {
    icon: '🐾', title: 'Animals on the move',
    commands: [
      { emoji: '🐸', text: 'Hop like a frog.' },
      { emoji: '🐻', text: 'Walk like a bear, on all fours.' },
      { emoji: '🐦', text: 'Fly like a bird, flapping your arms.' },
    ],
  },
  {
    icon: '⚡', title: 'Time to move!',
    commands: [
      { emoji: '🦘', text: 'Jump three times.' },
      { emoji: '🌀', text: 'Spin all the way around.' },
      { emoji: '🪑', text: 'Sit down on the floor.' },
    ],
  },
  {
    icon: '🐢', title: 'Fast and slow',
    commands: [
      { emoji: '🐢', text: 'Walk very, very slowly, like a turtle.' },
      { emoji: '🏃', text: 'Run in place, fast, fast, fast!' },
      { emoji: '🗿', text: 'Statue! Freeze and do not move at all.' },
    ],
  },
  {
    icon: '👏', title: 'Hands that talk',
    commands: [
      { emoji: '👏', text: 'Clap as loud as you can.' },
      { emoji: '👋', text: 'Wave goodbye with your hand.' },
      { emoji: '🤝', text: 'Give the grown-up a high five.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Rutas de rutina (EN-3.4): órdenes transaccionales en el entorno real. Se
// dictan con speakClinical (prosodia continua, sin jitter).
// ---------------------------------------------------------------------------
export const ROUTINE_ROUTES_EN: RoutineRoute[] = [
  {
    id: 'comedor', icon: '🍽️', title: 'Kitchen table route',
    scene: 'Go to the kitchen table together with cups, spoons and napkins within reach.',
    commands: [
      { emoji: '🥤', text: 'Put the red cup on the chair.', focus: 'object + color + place' },
      { emoji: '🥄', text: 'Give the small spoon to the grown-up.', focus: 'object + size + who gets it' },
      { emoji: '🧻', text: 'Put the napkin under the plate.', focus: 'object + place preposition' },
      { emoji: '🍎', text: 'Take the biggest fruit and put it on the table.', focus: 'superlative + two-step sequence' },
    ],
  },
  {
    id: 'bano', icon: '🛁', title: 'Bathroom route',
    scene: 'Go to the bathroom together with a toothbrush, a towel and a cup in plain sight.',
    commands: [
      { emoji: '🪥', text: 'Put the blue toothbrush inside the cup.', focus: 'object + color + container' },
      { emoji: '🧺', text: 'Bring the small towel and leave it on the chair.', focus: 'object + size + two-step sequence' },
      { emoji: '🦆', text: 'Put the rubber duck in the empty tub.', focus: 'object + property of the place' },
      { emoji: '🧼', text: 'Give the soap to the grown-up with your other hand.', focus: 'who gets it + which side' },
    ],
  },
];

export const PRAISE_BANK_EN = [
  'Awesome! You said it perfectly!',
  'Yes! That sounded great!',
  'You got it! Nice work!',
  'Wonderful! You’re getting better every time!',
  'Super! That was nice and clear!',
  'Way to go! Great speaking!',
];
export const ALMOST_BANK_EN = [
  'So close! Listen carefully and try again…',
  'Almost! Let’s give it another go.',
  'You’ve almost got it! Listen and repeat.',
  'A little bit more and you’ve got it. One more time!',
];
export const NO_HEAR_BANK_EN = [
  'I didn’t quite hear you. Let’s try again!',
  'Oops, your voice didn’t reach me! Come closer and we’ll try again.',
  'I missed your word. Say it to me one more time!',
];
export const TOGETHER_BANK_EN = [
  'Let’s say it together, nice and slow.',
  'We’ll say it at the same time, slowly, no rush.',
  'Now as a team: we both say it together.',
];

// Frases fijas de los overlays de pausa y utilidades de voz.
export const SESSION_CONTINUE_PHRASE_EN = 'Great job! Let’s keep going with the session!';
export const ROUTE_DONE_PHRASE_EN = 'Route complete. Let’s keep going with the session.';
export const VOICE_SAMPLE_PHRASE_EN = 'Hi! This is how my voice will sound in the exercises. Doesn’t it sound nice?';
export const PAIRS_DONE_PHRASE_EN = 'Word pairs complete! High five with your grown-up!';

// Veredicto HABLADO del juego de micrófono (índices 0/1/2 = no oído/casi/bien),
// espejo de MIC_VERDICT_SAY. Lo consume micVerdictSayFor cuando la variedad
// inglesa tenga contenido propio; hasta entonces se sintetiza y espera.
export const MIC_VERDICT_SAY_EN: [string, string, string] = [
  'Let’s listen to it one more time.',
  'Almost! Let’s try it again.',
  'Great job! You said it perfectly!',
];

// Frases fijas del overlay de rotación de roles (Pares Mínimos, ensayos 3 y 7).
export const ROLESWAP_INTRO_EN = 'Switch! Now the child is in charge and the grown-up speaks.';
export const ROLESWAP_NOT_HEARD_EN = 'I didn’t hear the grown-up clearly. One more time!';
export const ROLESWAP_HIT_EN = 'That’s it! What great listening!';
export const ROLESWAP_MISS_OTHER_EN = 'Oops! It was the other one. Listen again on the next turn!';
export const roleswapParentSaidEn = (word: string): string =>
  `Oops! The grown-up said ${word}. Listen again on the next turn!`;

// Builders de Pares Mínimos: viven aquí (y no en la pantalla) para que el texto
// que se locuta y el que enumera el corpus sean literalmente el mismo. El BANCO
// de pares sigue sin existir —EN-3.2, bloqueado por EN-0.5—; estos constructores
// son solo la plantilla que lo envolverá cuando llegue.
export const pairIntroEn = (target: string, foil: string, prompt: string): string =>
  `This one is ${target}. And this one is ${foil}. ${prompt}`;
export const pairRetryEn = (target: string): string => `One more time! Say: ${target}.`;

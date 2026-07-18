// ============================================================================
// Valeria+ · Contido terapéutico en GALEGO — plan Proxecto Nós (GL-2.x)
// Versión galega dos bancos locutables: cápsulas TPR, Rutas de Rutina, bancos
// de reforzo e frases fixas. Módulo PURO (enumerable polo corpus de voz).
//
// ESTADO: ✅ APROBADO PARA PRODUCIÓN (revisión de galego normativo e criterio
// logopédico cumpridos). Cableado ás pantallas por variedade e locutado coa
// voz neuronal Celtia.
// ============================================================================
import { TprCapsule } from './valeriaTprBank';
import { RoutineRoute } from './valeriaRoutineRoutes';

export const TPR_CAPSULES_GL: TprCapsule[] = [
  {
    icon: '🙆', title: 'Simón di… corpo!',
    commands: [
      { emoji: '🧠', text: 'Toca a cabeza.' },
      { emoji: '👃', text: 'Toca o nariz.' },
      { emoji: '🙌', text: 'Levanta os brazos moi alto.' },
    ],
  },
  {
    icon: '🐾', title: 'Animais en acción',
    commands: [
      { emoji: '🐸', text: 'Salta coma unha ra.' },
      { emoji: '🐻', text: 'Camiña coma un oso, a catro patas.' },
      { emoji: '🐦', text: 'Voa coma un paxaro movendo os brazos.' },
    ],
  },
  {
    icon: '⚡', title: 'A moverse!',
    commands: [
      { emoji: '🦘', text: 'Salta tres veces.' },
      { emoji: '🌀', text: 'Dá unha volta enteira.' },
      { emoji: '🪑', text: 'Séntate no chan.' },
    ],
  },
  {
    icon: '🐢', title: 'Rápido e amodo',
    commands: [
      { emoji: '🐢', text: 'Camiña moi, moi amodo, coma unha tartaruga.' },
      { emoji: '🏃', text: 'Corre no teu sitio, rápido, rápido!' },
      { emoji: '🗿', text: 'Estatua! Queda quieto sen moverte.' },
    ],
  },
  {
    icon: '👏', title: 'Mans que falan',
    commands: [
      { emoji: '👏', text: 'Aplaude moi forte.' },
      { emoji: '👋', text: 'Di adeus coa man.' },
      { emoji: '😘', text: 'Manda un bico voador.' },
    ],
  },
  {
    icon: '🎈', title: 'Grande e pequeno',
    commands: [
      { emoji: '🦒', text: 'Faite moi grande, estírate ata o ceo.' },
      { emoji: '⚽', text: 'Faite pequeno coma unha pelota.' },
      { emoji: '🌳', text: 'Abre os brazos coma unha árbore xigante.' },
    ],
  },
  {
    icon: '🎭', title: 'Emocións co corpo',
    commands: [
      { emoji: '😀', text: 'Pon cara de moita alegría.' },
      { emoji: '😠', text: 'Móstrame o enfado cos brazos cruzados.' },
      { emoji: '🤗', text: 'Dáte unha aperta moi forte.' },
    ],
  },
  {
    icon: '🤖', title: 'O robot obediente',
    commands: [
      { emoji: '🤖', text: 'Camiña coma un robot dicindo bip, bop.' },
      { emoji: '🛑', text: 'Robot… para!' },
      { emoji: '🔋', text: 'O robot apágase: déitate amodiño.' },
    ],
  },
];

export const ROUTINE_ROUTES_GL: RoutineRoute[] = [
  {
    id: 'comedor', icon: '🍽️', title: 'Ruta do Comedor',
    scene: 'Ide xuntos á mesa do comedor con vasos, culleres e panos á man.',
    commands: [
      { emoji: '🥤', text: 'Pon o vaso vermello na cadeira.', focus: 'obxecto + cor + lugar' },
      { emoji: '🥄', text: 'Dálle a culler pequena a papá ou a mamá.', focus: 'obxecto + tamaño + destinatario' },
      { emoji: '🧻', text: 'Mete o pano debaixo do prato.', focus: 'obxecto + preposición locativa' },
      { emoji: '🍎', text: 'Colle a froita máis grande e pona enriba da mesa.', focus: 'comparativo + secuencia de dous pasos' },
    ],
  },
  {
    id: 'bano', icon: '🛁', title: 'Ruta do Baño',
    scene: 'Ide xuntos ao baño co cepillo, a toalla e un vaso á vista.',
    commands: [
      { emoji: '🪥', text: 'Pon o cepillo azul dentro do vaso.', focus: 'obxecto + cor + contedor' },
      { emoji: '🧺', text: 'Trae a toalla pequena e déixaa na cadeira.', focus: 'obxecto + tamaño + secuencia de dous pasos' },
      { emoji: '🦆', text: 'Mete o patiño na bañeira baleira.', focus: 'obxecto + atributo do lugar' },
      { emoji: '🧼', text: 'Dálle o xabón a papá ou a mamá coa outra man.', focus: 'destinatario + lateralidade' },
    ],
  },
];

export const PRAISE_BANK_GL = [
  'Moi ben! Dixéchelo xenial!',
  'Bravo! Que ben soou!',
  'Toma xa! Palabra conseguida!',
  'Xenial! Cada vez sáeche mellor!',
  'Súper! Dixéchelo clarísimo!',
  'Ole esa voz! Moi ben dito!',
];
export const ALMOST_BANK_GL = [
  'Case case! Escoita ben e outra vez…',
  'Ui, por pouquiño! Imos probar de novo.',
  'Xa case o tes! Escoita e repite.',
  'Un pouquiño máis e bórdalo. Outra vez!',
];
export const NO_HEAR_BANK_GL = [
  'Non te escoitei ben. Probamos outra vez!',
  'Ui, non chegou a túa voz! Achégate e repetimos.',
  'Escapóuseme a túa palabra. Dimo outra vez!',
];
export const TOGETHER_BANK_GL = [
  'Imos dicila xuntos, moi amodiño.',
  'Dicímola á vez, amodo e sen présa.',
  'Agora en equipo: dicímola os dous xuntos.',
];

export const SESSION_CONTINUE_PHRASE_GL = 'Moi ben! Seguimos coa sesión!';
export const ROUTE_DONE_PHRASE_GL = 'Ruta completada. Seguimos coa sesión.';
export const VOICE_SAMPLE_PHRASE_GL = 'Ola! Así soará a miña voz nos exercicios. A que soa ben?';
export const PAIRS_DONE_PHRASE_GL = 'Sesión de pares completada! Choca eses cinco con papá!';

// Frases fixas do overlay de rotación de roles (Pares Mínimos) en galego.
export const ROLESWAP_INTRO_GL = 'Cambio de papeis! Agora manda o neno e papá fala.';
export const ROLESWAP_NOT_HEARD_GL = 'Non escoitei ben a papá. Outra vez!';
export const ROLESWAP_HIT_GL = 'Exacto! Que orella tan fina!';
export const ROLESWAP_MISS_OTHER_GL = 'Ui! Era a outra. Escoita outra vez na próxima quenda!';
export const roleswapParentSaidGl = (word: string): string =>
  `Ui! Papá dixo ${word}. Escoita outra vez na próxima quenda!`;

// Formatos fixos do ensaio de pares en galego (deben coincidir co corpus).
export const pairIntroGl = (target: string, foil: string, prompt: string): string =>
  `Aquí temos: ${target}. E aquí: ${foil}. ${prompt}`;
export const pairRetryGl = (target: string): string => `Outra vez! Di: ${target}.`;

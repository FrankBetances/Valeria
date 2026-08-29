// ============================================================================
// Valeria+ · Contingut terapèutic en CATALÀ — pla ca-ES (CA-2.x)
// Versió catalana dels bancs locutables: càpsules TPR, Rutes de Rutina, bancs
// de reforç i frases fixes. Mòdul PUR (enumerable pel corpus de veu).
//
// Registre: català central, normativa de l'IEC. Sentence case, apostrofació
// normativa i ela geminada amb punt volat. Les ordres van en imperatiu de
// segona persona del singular, que és com un adult parla a un infant.
//
// Per què no es tradueix el banc castellà paraula per paraula: les ordres TPR
// han de ser CURTES i acabar en la paraula que porta la càrrega semàntica, i
// l'ordre de mots del català no coincideix amb el del castellà. «Camina como
// un oso» → «Camina com un ós» funciona; «Date un abrazo muy fuerte» →
// «Fes-te una abraçada ben forta» exigeix el pronom enclític. Cada ordre s'ha
// reescrit perquè soni natural en boca d'un adult catalanoparlant.//
// ESTAT: ✅ CATALÀ VALIDAT (29/8/2026) per Maria, parlant nativa de Barcelona:
// lèxic, registre i normativa del CENTRAL. La validació confirma també la
// decisió que més es podia discutir del banc —deixar /b/–/v/ fora, perquè el
// central és betacista— i que els parells triats són paraules que una criatura
// de Barcelona de 3 a 6 anys reconeix. El que això NO cobreix, i convé no
// confondre: el criteri LOGOPÈDIC (el que el gallec va tenir de la mà d'ACOPROS
// i l'anglès amb la firma d'una logopeda titulada) segueix pendent.
// ============================================================================
import { TprCapsule } from './valeriaTprBank';
import { RoutineRoute } from './valeriaRoutineRoutes';

export const TPR_CAPSULES_CA: TprCapsule[] = [
  {
    icon: '🙆', title: 'En Simó diu… el cos!',
    commands: [
      { emoji: '🧠', text: 'Toca\'t el cap.' },
      { emoji: '👃', text: 'Toca\'t el nas.' },
      { emoji: '🙌', text: 'Aixeca els braços ben amunt.' },
    ],
  },
  {
    icon: '🐾', title: 'Animals en acció',
    commands: [
      { emoji: '🐸', text: 'Salta com una granota.' },
      { emoji: '🐻', text: 'Camina com un ós, de quatre grapes.' },
      { emoji: '🐦', text: 'Vola com un ocell movent els braços.' },
    ],
  },
  {
    icon: '⚡', title: 'A moure\'s!',
    commands: [
      { emoji: '🦘', text: 'Salta tres vegades.' },
      { emoji: '🌀', text: 'Fes una volta sencera.' },
      { emoji: '🪑', text: 'Seu a terra.' },
    ],
  },
  {
    icon: '🐢', title: 'De pressa i a poc a poc',
    commands: [
      { emoji: '🐢', text: 'Camina molt i molt a poc a poc, com una tortuga.' },
      { emoji: '🏃', text: 'Corre sense moure\'t del lloc, de pressa, de pressa!' },
      { emoji: '🗿', text: 'Estàtua! Queda\'t quiet sense moure\'t.' },
    ],
  },
  {
    icon: '👏', title: 'Mans que parlen',
    commands: [
      { emoji: '👏', text: 'Pica de mans ben fort.' },
      { emoji: '👋', text: 'Digues adéu amb la mà.' },
      { emoji: '😘', text: 'Envia un petó volador.' },
    ],
  },
  {
    icon: '🎈', title: 'Gran i petit',
    commands: [
      { emoji: '🦒', text: 'Fes-te molt gran, estira\'t fins al cel.' },
      { emoji: '⚽', text: 'Fes-te petit com una pilota.' },
      { emoji: '🌳', text: 'Obre els braços com un arbre gegant.' },
    ],
  },
  {
    icon: '🎭', title: 'Emocions amb el cos',
    commands: [
      { emoji: '😀', text: 'Posa cara de molta alegria.' },
      { emoji: '😠', text: 'Ensenya\'m l\'enuig amb els braços creuats.' },
      { emoji: '🤗', text: 'Fes-te una abraçada ben forta.' },
    ],
  },
  {
    icon: '🤖', title: 'El robot obedient',
    commands: [
      { emoji: '🤖', text: 'Camina com un robot dient bip, bop.' },
      { emoji: '🛑', text: 'Robot… atura\'t!' },
      { emoji: '🔋', text: 'El robot s\'apaga: ajeu-te a poc a poc.' },
    ],
  },
];

export const ROUTINE_ROUTES_CA: RoutineRoute[] = [
  {
    id: 'comedor', icon: '🍽️', title: 'Ruta del Menjador',
    scene: 'Aneu junts a la taula del menjador amb gots, culleres i tovallons a l\'abast.',
    commands: [
      { emoji: '🥤', text: 'Posa el got vermell a la cadira.', focus: 'objecte + color + lloc' },
      { emoji: '🥄', text: 'Dona la cullera petita al pare o a la mare.', focus: 'objecte + mida + destinatari' },
      { emoji: '🧻', text: 'Fica el tovalló sota el plat.', focus: 'objecte + preposició locativa' },
      { emoji: '🍎', text: 'Agafa la fruita més grossa i posa-la damunt la taula.', focus: 'comparatiu + seqüència de dos passos' },
    ],
  },
  {
    id: 'bano', icon: '🛁', title: 'Ruta del Bany',
    scene: 'Aneu junts al bany amb el raspall, la tovallola i un got a la vista.',
    commands: [
      { emoji: '🪥', text: 'Posa el raspall blau dins del got.', focus: 'objecte + color + contenidor' },
      { emoji: '🧺', text: 'Porta la tovallola petita i deixa-la a la cadira.', focus: 'objecte + mida + seqüència de dos passos' },
      { emoji: '🦆', text: 'Fica l\'ànec a la banyera buida.', focus: 'objecte + atribut del lloc' },
      { emoji: '🧼', text: 'Dona el sabó al pare o a la mare amb l\'altra mà.', focus: 'destinatari + lateralitat' },
    ],
  },
];

export const PRAISE_BANK_CA = [
  'Molt bé! L\'has dit genial!',
  'Bravo! Que bé que ha sonat!',
  'Molt bé! Paraula aconseguida!',
  'Genial! Cada vegada et surt millor!',
  'Súper! L\'has dit claríssim!',
  'Quina veu! Molt ben dit!',
];
export const ALMOST_BANK_CA = [
  'Gairebé, gairebé! Escolta bé i una altra vegada…',
  'Ui, per ben poc! Ho tornem a provar.',
  'Ja gairebé el tens! Escolta i repeteix.',
  'Una miqueta més i et surt rodó. Una altra vegada!',
];
export const NO_HEAR_BANK_CA = [
  'No t\'he sentit bé. Ho provem una altra vegada!',
  'Ui, no m\'ha arribat la teva veu! Acosta\'t i ho repetim.',
  'Se m\'ha escapat la teva paraula. Digues-me-la una altra vegada!',
];
export const TOGETHER_BANK_CA = [
  'La direm junts, ben a poc a poc.',
  'La diem alhora, a poc a poc i sense pressa.',
  'Ara en equip: la diem tots dos junts.',
];

export const SESSION_CONTINUE_PHRASE_CA = 'Molt bé! Continuem amb la sessió!';
export const ROUTE_DONE_PHRASE_CA = 'Ruta completada. Continuem amb la sessió.';
export const VOICE_SAMPLE_PHRASE_CA = 'Hola! Així sonarà la meva veu als exercicis. Oi que sona bé?';
export const PAIRS_DONE_PHRASE_CA = 'Sessió de parells completada! Xoca aquesta mà amb el pare!';

// Veredictos del medidor de micrófono, en el mismo orden que el banco base
// (flojo · medio · bien): los locuta el juez del turno de habla.
export const MIC_VERDICT_SAY_CA: [string, string, string] = [
  'Gairebé no t\'he sentit. Parla més fort!',
  'T\'he sentit! Ara una mica més fort.',
  'Que bé! T\'he sentit ben clar!',
];

// Frases fixes de la superposició de rotació de rols (Parells Mínims).
export const ROLESWAP_INTRO_CA = 'Canvi de papers! Ara mana l\'infant i parla l\'adult.';
export const ROLESWAP_NOT_HEARD_CA = 'No he sentit bé l\'adult. Una altra vegada!';
export const ROLESWAP_HIT_CA = 'Exacte! Quina orella més fina!';
export const ROLESWAP_MISS_OTHER_CA = 'Ui! Era l\'altra. Escolta una altra vegada al torn següent!';
export const roleswapParentSaidCa = (word: string): string =>
  `Ui! L\'adult ha dit ${word}. Escolta una altra vegada al torn següent!`;

// Formats fixos de l'assaig de parells (han de coincidir amb el corpus).
export const pairIntroCa = (target: string, foil: string, prompt: string): string =>
  `Aquí tenim: ${target}. I aquí: ${foil}. ${prompt}`;
export const pairRetryCa = (target: string): string => `Una altra vegada! Digues: ${target}.`;

// ============================================================================
// Valeria+ · Contenido terapéutico en EUSKERA batua — plan ILENIA/NEL-GAITU
// Versión vasca de los bancos locutables: cápsulas TPR, Rutas de Rutina, bancos
// de refuerzo y frases fijas. Módulo PURO (enumerable por el corpus de voz).
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN (revisión logopédica de Ulertuz y de
// euskera normativo/batua cumplida). Cableado a las pantallas por variedad y
// locutado con la voz neuronal HiTZ-TTS. Espejo estructural de valeriaContentGl.ts.
// ============================================================================
import { TprCapsule } from './valeriaTprBank';
import { RoutineRoute } from './valeriaRoutineRoutes';

export const TPR_CAPSULES_EU: TprCapsule[] = [
  {
    icon: '🙆', title: 'Simonek dio… gorputza!',
    commands: [
      { emoji: '🧠', text: 'Ukitu burua.' },
      { emoji: '👃', text: 'Ukitu sudurra.' },
      { emoji: '🙌', text: 'Altxatu besoak oso gora.' },
    ],
  },
  {
    icon: '🐾', title: 'Animaliak martxan',
    commands: [
      { emoji: '🐸', text: 'Egin jauzi igela bezala.' },
      { emoji: '🐻', text: 'Ibili hartza bezala, lau hanketan.' },
      { emoji: '🐦', text: 'Egin hegan txoria bezala, besoak mugituz.' },
    ],
  },
  {
    icon: '⚡', title: 'Mugitzera!',
    commands: [
      { emoji: '🦘', text: 'Egin jauzi hiru aldiz.' },
      { emoji: '🌀', text: 'Eman buelta oso bat.' },
      { emoji: '🪑', text: 'Eseri lurrean.' },
    ],
  },
  {
    icon: '🐢', title: 'Azkar eta poliki',
    commands: [
      { emoji: '🐢', text: 'Ibili oso-oso poliki, dortoka bat bezala.' },
      { emoji: '🏃', text: 'Korri egin zure lekuan, azkar, azkar!' },
      { emoji: '🗿', text: 'Estatua! Geldi-geldi egon, mugitu gabe.' },
    ],
  },
  {
    icon: '👏', title: 'Hitz egiten duten eskuak',
    commands: [
      { emoji: '👏', text: 'Jo txalo oso indartsu.' },
      { emoji: '👋', text: 'Esan agur eskuarekin.' },
      { emoji: '😘', text: 'Bidali musu bat hegan.' },
    ],
  },
  {
    icon: '🎈', title: 'Handi eta txiki',
    commands: [
      { emoji: '🦒', text: 'Egin zaitez oso handi, luzatu zerurantz.' },
      { emoji: '⚽', text: 'Egin zaitez txiki-txiki, pilota bat bezala.' },
      { emoji: '🌳', text: 'Zabaldu besoak zuhaitz erraldoi bat bezala.' },
    ],
  },
  {
    icon: '🎭', title: 'Emozioak gorputzarekin',
    commands: [
      { emoji: '😀', text: 'Jarri poz-pozdun aurpegia.' },
      { emoji: '😠', text: 'Erakutsi haserrea besoak gurutzatuta.' },
      { emoji: '🤗', text: 'Eman zeure buruari besarkada indartsu bat.' },
    ],
  },
  {
    icon: '🤖', title: 'Robot obeditzailea',
    commands: [
      { emoji: '🤖', text: 'Ibili robot bat bezala, bip-bop esanez.' },
      { emoji: '🛑', text: 'Robota… geldi!' },
      { emoji: '🔋', text: 'Robota itzaltzen ari da: etzan poliki-poliki.' },
    ],
  },
];

export const ROUTINE_ROUTES_EU: RoutineRoute[] = [
  {
    id: 'comedor', icon: '🍽️', title: 'Jangelaren ibilbidea',
    scene: 'Joan elkarrekin jangelako mahaira, edalontziak, koilarak eta zapiak eskura dituzuela.',
    commands: [
      { emoji: '🥤', text: 'Jarri edalontzi gorria aulkiaren gainean.', focus: 'objektua + kolorea + lekua' },
      { emoji: '🥄', text: 'Eman koilara txikia aitari edo amari.', focus: 'objektua + tamaina + hartzailea' },
      { emoji: '🧻', text: 'Sartu zapia plateraren azpian.', focus: 'objektua + leku-atzizkia' },
      { emoji: '🍎', text: 'Hartu fruitu handiena eta jarri mahai gainean.', focus: 'konparatiboa + bi urratseko sekuentzia' },
    ],
  },
  {
    id: 'bano', icon: '🛁', title: 'Komuneko ibilbidea',
    scene: 'Joan elkarrekin komunera, eskuila, eskuoihala eta edalontzi bat ikusgai dituzuela.',
    commands: [
      { emoji: '🪥', text: 'Jarri eskuila urdina edalontziaren barruan.', focus: 'objektua + kolorea + edukiontzia' },
      { emoji: '🧺', text: 'Ekarri eskuoihal txikia eta utzi aulkian.', focus: 'objektua + tamaina + bi urratseko sekuentzia' },
      { emoji: '🦆', text: 'Sartu ahatetxoa bainuontzi hutsean.', focus: 'objektua + lekuaren ezaugarria' },
      { emoji: '🧼', text: 'Eman xaboia aitari edo amari beste eskuarekin.', focus: 'hartzailea + alderdia' },
    ],
  },
];

export const PRAISE_BANK_EU = [
  'Oso ondo! Bikain esan duzu!',
  'Bravo! Ze ondo entzun den!',
  'Hori da! Hitza lortu duzu!',
  'Primeran! Gero eta hobeto ateratzen zaizu!',
  'Ikaragarri! Argi-argi esan duzu!',
  'Zer ahots ederra! Oso ondo esanda!',
];
export const ALMOST_BANK_EU = [
  'Ia-ia! Entzun ondo eta berriro…',
  'Ui, gutxigatik! Goazen berriro saiatzera.',
  'Ia lortu duzu! Entzun eta errepikatu.',
  'Pixka bat gehiago eta bikain. Berriro!',
];
export const NO_HEAR_BANK_EU = [
  'Ez zaitut ondo entzun. Berriro saiatuko gara!',
  'Ui, ez da zure ahotsa iritsi! Hurbildu eta berriro.',
  'Zure hitza ihes egin dit. Esan berriro!',
];
export const TOGETHER_BANK_EU = [
  'Goazen elkarrekin esatera, oso poliki.',
  'Batera esango dugu, lasai eta presarik gabe.',
  'Orain taldean: biok batera esango dugu.',
];

export const SESSION_CONTINUE_PHRASE_EU = 'Oso ondo! Saioarekin jarraituko dugu!';
export const ROUTE_DONE_PHRASE_EU = 'Ibilbidea amaituta. Saioarekin jarraituko dugu.';
export const VOICE_SAMPLE_PHRASE_EU = 'Kaixo! Honela entzungo da nire ahotsa ariketetan. Ondo entzuten da, ezta?';
export const PAIRS_DONE_PHRASE_EU = 'Pareen saioa amaituta! Jo bostekoa aitarekin!';

// Frases fijas del overlay de rotación de roles (Pares Mínimos) en euskera.
export const ROLESWAP_INTRO_EU = 'Rolak aldatzen! Orain umeak agintzen du eta aitak hitz egiten.';
export const ROLESWAP_NOT_HEARD_EU = 'Ez dut aita ondo entzun. Berriro!';
export const ROLESWAP_HIT_EU = 'Hori da! Zer belarri fina!';
export const ROLESWAP_MISS_OTHER_EU = 'Ui! Bestea zen. Entzun berriro hurrengo txandan!';
export const roleswapParentSaidEu = (word: string): string =>
  `Ui! Aitak ${word} esan du. Entzun berriro hurrengo txandan!`;

// Formatos fijos del ensayo de pares en euskera (deben coincidir con el corpus).
export const pairIntroEu = (target: string, foil: string, prompt: string): string =>
  `Hemen dugu: ${target}. Eta hemen: ${foil}. ${prompt}`;
export const pairRetryEu = (target: string): string => `Berriro! Esan: ${target}.`;

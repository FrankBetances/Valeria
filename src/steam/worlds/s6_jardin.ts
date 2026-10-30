// Set 6 · Jardín. SET_SOLO (AR-S06) y SET_WITH_LUA (AR-SL06).
// El orden causal es el del motor: siembra, riego, brote, sombra, flor y noche.
import { PICTO_KEYS } from '../../ValeriaPixelArt';
import {
  CAUSAL_SEQUENCES,
  evaluateChallenge,
  type ChallengeInput,
} from '../engine/ChallengeEvaluator';
import { framesRequired, VISUAL_STABLE_FRAMES } from '../engine/EventStabilizer';
import { translateExpression } from '../engine/LuaLink';
import type { TracePolarity } from '../engine/ObservationReplay';
import { WorldRegistry } from '../engine/WorldRegistry';
import type {
  AdultText,
  ChildSpeechMap,
  DetectionMethod,
  SteamActivity,
  TripartiteCycle,
  WorldEventSpec,
  WorldManifest,
  WorldPieceSpec,
} from '../types';
import { assertSteamActivity, assertWorldManifest } from '../validator';

function adult(es: string, en: string, ca: string, gl: string): AdultText {
  return { es, en, ca, gl };
}

function speech(
  es: string,
  gl: string,
  eu: string,
  esDo: string,
  enUs: string,
  ca: string,
): ChildSpeechMap {
  return { es, gl, eu, 'es-DO': esDo, 'en-US': enUs, ca };
}

function picto(key: (typeof PICTO_KEYS)[number]): (typeof PICTO_KEYS)[number] {
  return key;
}

const SAFE: AdultText = adult(
  'Pieza de mesa. La planta se enrosca con la mano y la guarda la persona adulta.',
  'Table piece. The plant is twisted on by hand and the adult puts it away.',
  'Peça de taula. La planta s’enrosca amb la mà i la desa la persona adulta.',
  'Peza de mesa. A planta enróscase coa man e gárdaa a persoa adulta.',
);

function piece(
  code: string,
  name: AdultText,
  quantity: number,
  instanceMarkerIds: number[],
  detectionMethod: DetectionMethod,
): WorldPieceSpec {
  return { code, name, quantity, scale: 'G', instanceMarkerIds, detectionMethod, safetyNotes: SAFE };
}

function ev(input: WorldEventSpec): WorldEventSpec {
  if (!input.methods.includes('adult_tap')) throw new Error(`${input.id}: falta adult_tap.`);
  return input;
}

const ORDEN = CAUSAL_SEQUENCES.S6[0];

const EVENTS: WorldEventSpec[] = [
  ev({
    id: 'S6.SIEMBRA',
    title: adult('Siembra', 'Sowing', 'Sembra', 'Sementeira'),
    childAction: adult(
      'La criatura tapa un alvéolo con la semilla.',
      'The child covers a socket with the seed.',
      'La criatura tapa un alvèol amb la llavor.',
      'A criatura tapa un alvéolo coa semente.',
    ),
    methods: ['occlusion', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'ternura',
      pictoKey: picto('semilla'),
      light: 'LADO_SOL',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Plant the seed!',
      adultHint: adult('La semilla va dentro del alvéolo.', 'The seed goes inside the socket.', 'La llavor va dins de l’alvèol.', 'A semente vai dentro do alvéolo.'),
      spatialCategory: 'position',
    },
  }),
  ev({
    id: 'S6.RIEGO',
    title: adult('Riego', 'Watering', 'Reg', 'Rega'),
    childAction: adult(
      'La criatura hace el gesto de echar agua sobre la semilla.',
      'The child makes the gesture of pouring water on the seed.',
      'La criatura fa el gest de tirar aigua sobre la llavor.',
      'A criatura fai o xesto de botar auga sobre a semente.',
    ),
    methods: ['hand', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'calma',
      pictoKey: picto('gota'),
      light: 'LADO_SOL',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Pour water!',
      adultHint: adult('El agua va después de la semilla.', 'Water comes after the seed.', 'L’aigua va després de la llavor.', 'A auga vai despois da semente.'),
      spatialCategory: 'pattern',
    },
  }),
  ev({
    id: 'S6.BROTE',
    title: adult('Brote', 'Sprout', 'Brot', 'Abrocho'),
    childAction: adult(
      'La criatura enrosca el tallo en la base.',
      'The child twists the stem onto the base.',
      'La criatura enrosca la tija a la base.',
      'A criatura enrosca o talo na base.',
    ),
    methods: ['hand', 'marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'esperanza',
      pictoKey: picto('brote'),
      light: 'LADO_SOL',
      haptic: 'APAGADO',
      screenOverlay: 'PROGRESS_RING',
    },
    word: {
      englishTpr: 'Plant the seed!',
      adultHint: adult('El tallo sale después del agua.', 'The stem comes after the water.', 'La tija surt després de l’aigua.', 'O talo sae despois da auga.'),
      spatialCategory: 'pattern',
    },
  }),
  ev({
    id: 'S6.SOMBRA_ALINEADA',
    title: adult('Sombra alineada', 'Shadow lined up', 'Ombra alineada', 'Sombra aliñada'),
    childAction: adult(
      'La criatura gira el sol y la sombra del tallo se mueve al revés.',
      'The child turns the sun and the stem’s shadow moves the other way.',
      'La criatura gira el sol i l’ombra de la tija es mou a l’inrevés.',
      'A criatura xira o sol e a sombra do talo móvese ao revés.',
    ),
    methods: ['marker', 'hand', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'atenta',
      pictoKey: picto('sol'),
      light: 'LADO_SOL',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Turn the sun!',
      adultHint: adult(
        'Si el sol gira a un lado, la sombra va al otro.',
        'If the sun turns one way, the shadow goes the other way.',
        'Si el sol gira cap a un costat, l’ombra va cap a l’altre.',
        'Se o sol xira a un lado, a sombra vai ao outro.',
      ),
      spatialCategory: 'orientation',
    },
  }),
  ev({
    id: 'S6.FLORECE',
    title: adult('Florece', 'It blooms', 'Floreix', 'Florece'),
    childAction: adult(
      'La criatura enrosca la copa, la flor o el fruto en el tallo.',
      'The child twists the crown, the flower, or the fruit onto the stem.',
      'La criatura enrosca la copa, la flor o el fruit a la tija.',
      'A criatura enrosca a copa, a flor ou o froito no talo.',
    ),
    methods: ['hand', 'marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'celebra_corta',
      pictoKey: picto('flor'),
      light: 'LADO_SOL',
      haptic: 'APAGADO',
      screenOverlay: 'PROGRESS_RING',
    },
    word: {
      englishTpr: 'Turn the sun!',
      adultHint: adult(
        'La flor va al sol. La semilla que quede, a la sombra de la copa.',
        'The flower goes in the sun. A seed that is left over goes in the shade of the crown.',
        'La flor va al sol. La llavor que quedi, a l’ombra de la copa.',
        'A flor vai ao sol. A semente que quede, á sombra da copa.',
      ),
      spatialCategory: 'pattern',
    },
  }),
  ev({
    id: 'S6.NOCHE',
    title: adult('Noche', 'Night', 'Nit', 'Noite'),
    childAction: adult(
      'La criatura gira el sol hasta la noche y ayuda a guardar las piezas.',
      'The child turns the sun to night and helps put the pieces away.',
      'La criatura gira el sol fins a la nit i ajuda a desar les peces.',
      'A criatura xira o sol ata a noite e axuda a gardar as pezas.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'descanso_lejos',
      pictoKey: picto('luna'),
      light: 'LADO_SOL',
      haptic: 'RONRONEO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Turn the sun!',
      adultHint: adult(
        'De noche se recogen las piezas, despacio.',
        'At night the pieces are gathered, slowly.',
        'De nit es recullen les peces, a poc a poc.',
        'De noite recóllense as pezas, amodo.',
      ),
      spatialCategory: 'orientation',
    },
  }),
];

const CYCLE_SOLO: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Encaja el tallo en espiral y gira el bloque del sol alrededor de la base. La sombra de la mesa y la sombra dibujada giran al revés. Espera cinco segundos en silencio.',
      'Fit the spiral stem and turn the sun block around the base. The shadow on the table and the drawn shadow turn the other way. Wait five seconds in silence.',
      'Encaixa la tija en espiral i gira el bloc del sol al voltant de la base. L’ombra de la taula i l’ombra dibuixada giren a l’inrevés. Espera cinc segons en silenci.',
      'Encaixa o talo en espiral e xira o bloque do sol arredor da base. A sombra da mesa e a sombra debuxada xiran ao revés. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      'Si el sol va hacia un lado, ¿la sombra lo sigue o se va al contrario?',
      'If the sun goes one way, does the shadow follow it or go the other way?',
      'Si el sol va cap a un costat, l’ombra el segueix o se’n va al contrari?',
      'Se o sol vai cara a un lado, a sombra ségueno ou vai ao contrario?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Siembra en un alvéolo, haz el gesto de regar y enrosca la copa, las flores y los frutos. El orden es semilla, agua, tallo, flor. Tú confirmas cada paso con el botón.',
      'Sow in a socket, make the watering gesture, and twist on the crown, the flowers, and the fruit. The order is seed, water, stem, flower. You confirm each step with the button.',
      'Sembra en un alvèol, fes el gest de regar i enrosca la copa, les flors i els fruits. L’ordre és llavor, aigua, tija, flor. Tu confirmes cada pas amb el botó.',
      'Sementa nun alvéolo, fai o xesto de regar e enrosca a copa, as flores e os froitos. A orde é semente, auga, talo, flor. Ti confirmas cada paso co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Qué va antes, el agua o la flor?',
        'What comes first, the water or the flower?',
        'Què va abans, l’aigua o la flor?',
        'Que vai antes, a auga ou a flor?',
      ),
      level2PhysicalModel: adult(
        'Tapa el alvéolo con la semilla, pasa la mano como si echaras agua y enrosca el tallo con la muñeca.',
        'Cover the socket with the seed, pass your hand as if pouring water, and twist the stem with the wrist.',
        'Tapa l’alvèol amb la llavor, passa la mà com si tiressis aigua i enrosca la tija amb el canell.',
        'Tapa o alvéolo coa semente, pasa a man como se boteses auga e enrosca o talo co pulso.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Pon las flores al sol y las semillas que sobren a la sombra de la copa.',
      'Put the flowers in the sun and the spare seeds in the shade of the crown.',
      'Posa les flors al sol i les llavors que sobrin a l’ombra de la copa.',
      'Pon as flores ao sol e as sementes que sobren á sombra da copa.',
    ),
    transferQuestion: adult(
      '¿Una semilla a la sombra crece igual que una flor al sol?',
      'Does a seed in the shade grow the same as a flower in the sun?',
      'Una llavor a l’ombra creix igual que una flor al sol?',
      'Unha semente á sombra crece igual que unha flor ao sol?',
    ),
  },
};

const CYCLE_WITH_LUA: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Lúa está en la placa JARDIN, junto al árbol. Gira el sol: la sombra del tallo va al sentido contrario. Espera cinco segundos en silencio.',
      'Lúa is on the JARDIN plate, next to the tree. Turn the sun: the stem’s shadow goes the other way. Wait five seconds in silence.',
      'La Lúa és a la placa JARDIN, al costat de l’arbre. Gira el sol: l’ombra de la tija va en sentit contrari. Espera cinc segons en silenci.',
      'Lúa está na placa JARDIN, xunto á árbore. Xira o sol: a sombra do talo vai no sentido contrario. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      '¿La sombra de Lúa y la del tallo van juntas o cada una por su lado?',
      'Do Lúa’s shadow and the stem’s shadow go together, or each on its own side?',
      'L’ombra de la Lúa i la de la tija van juntes o cadascuna pel seu costat?',
      'A sombra de Lúa e a do talo van xuntas ou cada unha polo seu lado?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Siembra, riega, enrosca el brote, alinea la sombra y coloca la flor. Lúa acompaña cada paso. De noche, se recogen las piezas y Lúa descansa. Tú confirmas con el botón.',
      'Sow, water, twist on the sprout, line up the shadow, and place the flower. Lúa stays with each step. At night the pieces are gathered and Lúa rests. You confirm with the button.',
      'Sembra, rega, enrosca el brot, alinea l’ombra i col·loca la flor. La Lúa acompanya cada pas. De nit es recullen les peces i la Lúa descansa. Tu confirmes amb el botó.',
      'Sementa, rega, enrosca o abrocho, aliña a sombra e coloca a flor. Lúa acompaña cada paso. De noite recóllense as pezas e Lúa descansa. Ti confirmas co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Ya regamos, o la semilla todavía está seca?',
        'Have we watered yet, or is the seed still dry?',
        'Ja hem regat, o la llavor encara està seca?',
        'Xa regamos, ou a semente aínda está seca?',
      ),
      level2PhysicalModel: adult(
        'Sigue el orden con las manos: tapa el alvéolo, echa el gesto del agua, enrosca el tallo y gira el sol.',
        'Follow the order with the hands: cover the socket, make the water gesture, twist the stem, and turn the sun.',
        'Segueix l’ordre amb les mans: tapa l’alvèol, fes el gest de l’aigua, enrosca la tija i gira el sol.',
        'Segue a orde coas mans: tapa o alvéolo, fai o xesto da auga, enrosca o talo e xira o sol.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Con Lúa junto al árbol, deja las flores al sol y guarda una semilla a la sombra. Cierra girando el sol hasta la noche.',
      'With Lúa next to the tree, leave the flowers in the sun and keep one seed in the shade. Close by turning the sun to night.',
      'Amb la Lúa al costat de l’arbre, deixa les flors al sol i guarda una llavor a l’ombra. Tanca girant el sol fins a la nit.',
      'Con Lúa xunto á árbore, deixa as flores ao sol e garda unha semente á sombra. Pecha xirando o sol ata a noite.',
    ),
    transferQuestion: adult(
      'Mañana, ¿qué pieza sale primero de la caja, la semilla o la flor?',
      'Tomorrow, which piece comes out of the box first, the seed or the flower?',
      'Demà, quina peça surt primer de la capsa, la llavor o la flor?',
      'Mañá, que peza sae primeiro da caixa, a semente ou a flor?',
    ),
  },
};

const METHODS: DetectionMethod[] = ['occlusion', 'hand', 'marker', 'adult_tap'];

export const SET_SOLO: SteamActivity = {
  id: 'AR-S06',
  worldId: 'S6',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: METHODS,
  childSpeech: speech(
    '¡Siembra la semilla! ¡Echa agua! ¡Gira el sol!',
    'Sementa! Bota auga! Xira o sol!',
    'Erein hazia! Bota ura! Biratu eguzkia!',
    '¡Siembra la semilla! ¡Echa agua! ¡Gira el sol!',
    'Plant the seed! Pour water! Turn the sun!',
    'Sembra la llavor! Tira aigua! Gira el sol!',
  ),
  englishTpr: 'Plant the seed! Pour water! Turn the sun!',
  cycle: CYCLE_SOLO,
  events: EVENTS,
};

export const SET_WITH_LUA: SteamActivity = {
  id: 'AR-SL06',
  worldId: 'S6',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: METHODS,
  childSpeech: speech(
    '¡Cuida el jardín con Lúa! ¡Siembra, riega, florece!',
    'Coida o xardín con Lúa! Sementa, rega, florece!',
    'Zaindu lorategia Lúarekin! Erein, ureztatu, loratu.',
    '¡Cuida el jardín con Lúa! ¡Siembra, riega, florece!',
    'Tend the garden with Lúa! Sow, water, bloom!',
    'Cuida el jardí amb la Lúa! Sembra, rega, floreix!',
  ),
  englishTpr: 'Tend the garden with Lúa! Sow, water, bloom!',
  cycle: CYCLE_WITH_LUA,
  events: EVENTS,
};

export const MANIFEST: WorldManifest = {
  id: 'S6',
  orderIndex: 6,
  title: adult(
    'El reloj de sol y el árbol en espiral',
    'The sundial and the spiral tree',
    'El rellotge de sol i l’arbre en espiral',
    'O reloxo de sol e a árbore en espiral',
  ),
  subtitleEn: 'Seed, water, stem, flower, fruit, and a shadow that turns the other way',
  phenomenon: adult(
    'La planta sigue un orden: semilla, agua, tallo, flor y fruto. Al girar el sol, la sombra del tallo va en sentido contrario.',
    'The plant follows an order: seed, water, stem, flower, and fruit. When the sun turns, the stem’s shadow goes the other way.',
    'La planta segueix un ordre: llavor, aigua, tija, flor i fruit. En girar el sol, l’ombra de la tija va en sentit contrari.',
    'A planta segue unha orde: semente, auga, talo, flor e froito. Ao xirar o sol, a sombra do talo vai en sentido contrario.',
  ),
  ageRange: '0-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['orientation', 'position', 'pattern'],
  skillAxes: ['lexicon_semantics', 'morphosyntax_narrative'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Familia y aula, de 0 a 6 años. La persona adulta maneja la tableta. La noche sirve para guardar.',
    'Home and classroom, ages 0 to 6. The adult handles the tablet. Night is for putting things away.',
    'Família i aula, de 0 a 6 anys. La persona adulta fa servir la tauleta. La nit serveix per desar.',
    'Familia e aula, de 0 a 6 anos. A persoa adulta manexa a tableta. A noite serve para gardar.',
  ),
  udlPathways: {
    representation: adult(
      'El ciclo se ve en las piezas, se hace con las manos y se dice en orden: semilla, agua, tallo, flor.',
      'The cycle is seen in the pieces, done with the hands, and said in order: seed, water, stem, flower.',
      'El cicle es veu a les peces, es fa amb les mans i es diu en ordre: llavor, aigua, tija, flor.',
      'O ciclo vese nas pezas, faise coas mans e dise en orde: semente, auga, talo, flor.',
    ),
    engagement: adult(
      'La sombra se puede mirar sin nombrar el sol. Guardar de noche cierra el juego.',
      'The shadow can be watched without naming the sun. Putting things away at night closes the play.',
      'L’ombra es pot mirar sense anomenar el sol. Desar de nit tanca el joc.',
      'A sombra pódese mirar sen nomear o sol. Gardar de noite pecha o xogo.',
    ),
    expression: adult(
      'La criatura tapa, enrosca o gira. Puede señalar en vez de hablar. El adulto confirma con el botón.',
      'The child covers, twists, or turns. Pointing can stand in for speaking. The adult confirms with the button.',
      'La criatura tapa, enrosca o gira. Pot assenyalar en lloc de parlar. L’adult confirma amb el botó.',
      'A criatura tapa, enrosca ou xira. Pode sinalar en vez de falar. A persoa adulta confirma co botón.',
    ),
  },
  tabletStandSpec: {
    heightCm: 22,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    piece('S6-BAS-G', adult('Base con alvéolos', 'Base with sockets', 'Base amb alvèols', 'Base con alvéolos'), 1, [660], 'occlusion'),
    piece('S6-SOL-G', adult('Cuadrante solar', 'Sundial', 'Quadrant solar', 'Cuadrante solar'), 1, [661], 'marker'),
    piece('S6-TAL-G', adult('Tallo en espiral', 'Spiral stem', 'Tija en espiral', 'Talo en espiral'), 1, [66], 'hand'),
    piece('S6-COP-G', adult('Copa', 'Crown', 'Copa', 'Copa'), 1, [662], 'hand'),
    piece('S6-FLO-G', adult('Flor', 'Flower', 'Flor', 'Flor'), 3, [663, 664, 665], 'hand'),
    piece('S6-FRU-MANZ', adult('Fruto manzana', 'Apple fruit', 'Fruit poma', 'Froito mazá'), 2, [666, 667], 'marker'),
    piece('S6-FRU-NAR', adult('Fruto naranja', 'Orange fruit', 'Fruit taronja', 'Froito laranxa'), 2, [668, 669], 'marker'),
    piece('S6-SEM-G', adult('Semilla', 'Seed', 'Llavor', 'Semente'), 3, [670, 671, 672], 'occlusion'),
  ],
  events: EVENTS,
  challenges: [
    {
      id: 'S6-C1',
      number: 1,
      title: adult('De la semilla a la noche', 'From the seed to night', 'De la llavor a la nit', 'Da semente á noite'),
      ageBand: '3-4',
      neuroStage: 'I4',
      estimatedMinutes: 12,
      scale: 'G',
      skillAxes: ['lexicon_semantics', 'morphosyntax_narrative'],
      targetEvents: [...ORDEN],
      cycle: CYCLE_WITH_LUA,
      achievementCriterion: adult(
        'La secuencia es siembra, riego, brote, sombra, flor y noche, en ese orden. El adulto confirma con el botón.',
        'The sequence is sowing, watering, sprout, shadow, flower, and night, in that order. The adult confirms with the button.',
        'La seqüència és sembra, reg, brot, ombra, flor i nit, en aquest ordre. L’adult confirma amb el botó.',
        'A secuencia é sementeira, rega, abrocho, sombra, flor e noite, nesa orde. A persoa adulta confirma co botón.',
      ),
      qualitativeObservation: adult(
        'Anota si el orden se sostiene y si la sombra gira al contrario que el sol.',
        'Note whether the order holds and whether the shadow turns the opposite way from the sun.',
        'Anota si l’ordre es manté i si l’ombra gira al contrari que el sol.',
        'Anota se a orde se sostén e se a sombra xira ao contrario que o sol.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S6-CARD-CICLO',
      title: adult('Semilla, agua, flor', 'Seed, water, flower', 'Llavor, aigua, flor', 'Semente, auga, flor'),
      targetPieces: ['S6-SEM-G', 'S6-TAL-G', 'S6-FLO-G', 'S6-SOL-G'],
    },
  ],
  revealLayer: {
    id: 'set_jardin',
    description: adult(
      'Arco del sol, cono de sombra en sentido contrario y pétalos que se abren al florecer.',
      'The sun’s arc, a shadow cone the other way, and petals that open when it blooms.',
      'Arc del sol, con de l’ombra en sentit contrari i pètals que s’obren en florir.',
      'Arco do sol, cono da sombra en sentido contrario e pétalos que se abren ao florecer.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: {
    songIds: ['lua_song_01', 'lua_song_08'],
    gameIds: ['lua_game_07'],
  },
  story: {
    storyId: 'lua_story_04',
    anticipationMicroStory: adult(
      'Una semilla espera en el alvéolo. El sol todavía no ha girado, y la sombra tampoco.',
      'A seed waits in the socket. The sun has not turned yet, and neither has the shadow.',
      'Una llavor espera a l’alvèol. El sol encara no ha girat, i l’ombra tampoc.',
      'Unha semente agarda no alvéolo. O sol aínda non xirou, e a sombra tampouco.',
    ),
    closingMicroStory: adult(
      'Llega la noche. Las flores vuelven a la caja y Lúa se queda quieta mientras se guarda el jardín.',
      'Night comes. The flowers go back in the box and Lúa stays still while the garden is put away.',
      'Arriba la nit. Les flors tornen a la capsa i la Lúa es queda quieta mentre es desa el jardí.',
      'Chega a noite. As flores volven á caixa e Lúa queda quieta mentres se garda o xardín.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'SemanticExpansion',
      connectionReason: adult(
        'En la mesa se ordenan semilla, tallo, flor y fruto, y se contrastan sol y sombra.',
        'At the table, seed, stem, flower, and fruit are ordered, and sun and shade are contrasted.',
        'A la taula s’ordenen llavor, tija, flor i fruit, i es contrasten sol i ombra.',
        'Na mesa ordénanse semente, talo, flor e froito, e contrástanse sol e sombra.',
      ),
    },
    {
      route: 'Writing',
      connectionReason: adult(
        'La espiral del tallo se puede recorrer después con el dedo, de la base a la copa.',
        'The stem’s spiral can later be traced with a finger, from the base to the crown.',
        'L’espiral de la tija es pot recórrer després amb el dit, de la base a la copa.',
        'A espiral do talo pódese percorrer despois co dedo, da base á copa.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S6',
};

const POSITIVE: ChallengeInput = { kind: 'causal', worldId: 'S6', states: ORDEN };
const NEGATIVE: ChallengeInput = {
  kind: 'causal',
  worldId: 'S6',
  states: ['S6.FLORECE', 'S6.SIEMBRA', 'S6.RIEGO', 'S6.BROTE', 'S6.SOMBRA_ALINEADA', 'S6.NOCHE'],
};

export interface FoundationalReplayCase {
  readonly id: string;
  readonly polarity: TracePolarity;
  readonly frames: number;
  readonly observation: { method: DetectionMethod; pieceCode?: string; markerId?: number };
  readonly challenge: ChallengeInput;
}

export const REPLAY_CASES: readonly FoundationalReplayCase[] = [
  {
    id: 'S6-positiva',
    polarity: 'positive',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S6-TAL-G', markerId: 66 },
    challenge: POSITIVE,
  },
  {
    id: 'S6-negativa',
    polarity: 'negative',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S6-TAL-G', markerId: 66 },
    challenge: NEGATIVE,
  },
  {
    id: 'S6-oclusion-parcial',
    polarity: 'partial_occlusion',
    frames: VISUAL_STABLE_FRAMES - 1,
    observation: { method: 'marker', pieceCode: 'S6-TAL-G', markerId: 66 },
    challenge: POSITIVE,
  },
  {
    id: 'S6-adult-tap',
    polarity: 'positive',
    frames: framesRequired('adult_tap'),
    observation: { method: 'adult_tap' },
    challenge: POSITIVE,
  },
];

function assertReplay(): void {
  if (ORDEN.join(',') !== 'S6.SIEMBRA,S6.RIEGO,S6.BROTE,S6.SOMBRA_ALINEADA,S6.FLORECE,S6.NOCHE') {
    throw new Error('S6: el orden causal del motor cambió.');
  }
  const eventIds = EVENTS.map((item) => item.id);
  for (const id of ORDEN) {
    if (!eventIds.includes(id)) throw new Error(`S6: falta el evento ${id}.`);
  }
  if (translateExpression('ternura').index !== 11 || translateExpression('esperanza').index !== 14) {
    throw new Error('S6: la siembra y el brote no coinciden con las caras del motor.');
  }
  if (translateExpression('descanso_lejos').index !== 18 || translateExpression('celebra_corta').index !== 4) {
    throw new Error('S6: la noche y la flor no coinciden con las caras del motor.');
  }
  for (const item of REPLAY_CASES) {
    const verdict = evaluateChallenge(item.challenge);
    if (verdict.ok !== (item.polarity !== 'negative')) {
      throw new Error(`${item.id}: el motor responde ${verdict.reason}.`);
    }
  }
}

assertWorldManifest(MANIFEST);
assertSteamActivity(SET_SOLO);
assertSteamActivity(SET_WITH_LUA);
assertReplay();

export function registerWorld(registry: WorldRegistry): void {
  registry.registerManifest(MANIFEST);
  registry.registerActivity(SET_SOLO);
  registry.registerActivity(SET_WITH_LUA);
}

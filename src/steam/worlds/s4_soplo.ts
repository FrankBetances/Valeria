// Set 4 · Máquina de soplo. SET_SOLO (AR-S04) y SET_WITH_LUA (AR-SL04).
// Durante el soplo las luces quedan APAGADO. El motor solo acepta las dos
// secuencias que acaban en la compuerta ligera.
import { PICTO_KEYS } from '../../ValeriaPixelArt';
import {
  CAUSAL_SEQUENCES,
  evaluateChallenge,
  type ChallengeInput,
} from '../engine/ChallengeEvaluator';
import { framesRequired, VISUAL_STABLE_FRAMES } from '../engine/EventStabilizer';
import { translateExpression } from '../engine/LuaLink';
import type { TracePolarity } from '../engine/ObservationReplay';
import { applyTurnGate } from '../engine/TurnGate';
import { WorldRegistry } from '../engine/WorldRegistry';
import type {
  AdultText,
  ChildSpeechMap,
  DetectionMethod,
  LightPattern,
  SteamActivity,
  TripartiteCycle,
  WorldEventSpec,
  WorldManifest,
  WorldPieceSpec,
} from '../types';
import { assertSteamActivity, assertWorldManifest } from '../validator';

const LUZ_S4: LightPattern = 'APAGADO';

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
  'Pieza de mesa. Cada criatura sopla por su boquilla. La persona adulta la guarda después.',
  'Table piece. Each child blows through their own mouthpiece. The adult puts it away afterwards.',
  'Peça de taula. Cada criatura bufa per la seva broqueta. La persona adulta la desa després.',
  'Peza de mesa. Cada criatura sopra pola súa boquilla. A persoa adulta gárdaa despois.',
);

function piece(
  code: string,
  name: AdultText,
  quantity: number,
  instanceMarkerIds: number[],
  detectionMethod: DetectionMethod,
): WorldPieceSpec {
  return { code, name, quantity, scale: 'E', instanceMarkerIds, detectionMethod, safetyNotes: SAFE };
}

function ev(
  input: Omit<WorldEventSpec, 'reaction'> & {
    reaction: Omit<WorldEventSpec['reaction'], 'light' | 'haptic'>;
  },
): WorldEventSpec {
  const event: WorldEventSpec = {
    ...input,
    reaction: { ...input.reaction, light: LUZ_S4, haptic: 'APAGADO' },
  };
  if (!event.methods.includes('adult_tap')) throw new Error(`${event.id}: falta adult_tap.`);
  const gate = applyTurnGate({
    turn: event.turn,
    isErrorOrBlockedState: event.isErrorOrBlockedState,
    light: event.reaction.light,
    haptic: event.reaction.haptic,
  });
  if (event.reaction.light !== 'APAGADO' || gate.light !== 'APAGADO') {
    throw new Error(`${event.id}: S4 lleva las luces APAGADO.`);
  }
  return event;
}

const EVENTS: WorldEventSpec[] = [
  ev({
    id: 'S4.PRAXIA_REDONDEO',
    title: adult('Soplo redondo', 'Round blow', 'Buf redó', 'Sopro redondo'),
    childAction: adult(
      'La criatura redondea los labios y sopla hacia el canal, sin tocar la pantalla.',
      'The child rounds the lips and blows toward the channel, without touching the screen.',
      'La criatura arrodoneix els llavis i bufa cap al canal, sense tocar la pantalla.',
      'A criatura arredonda os labios e sopra cara á canle, sen tocar a pantalla.',
    ),
    methods: ['face', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'animo',
      pictoKey: picto('soplar'),
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Blow gently!',
      adultHint: adult(
        'Soplar largo y suave. Las luces de la escena quedan apagadas mientras dura el soplo.',
        'Blow long and gently. The scene lights stay off for the whole blow.',
        'Bufar llarg i suau. Els llums de l’escena queden apagats mentre dura el buf.',
        'Soprar longo e suave. As luces da escena quedan apagadas mentres dura o sopro.',
      ),
      spatialCategory: 'properties',
    },
  }),
  ev({
    id: 'S4.ROTOR_GIRA',
    title: adult('El rotor gira', 'The rotor spins', 'El rotor gira', 'O rotor xira'),
    childAction: adult(
      'El aire del canal hace girar el rotor.',
      'Air from the channel makes the rotor spin.',
      'L’aire del canal fa girar el rotor.',
      'O aire da canle fai xirar o rotor.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'diversion',
      pictoKey: picto('rueda'),
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Spin the wheel!',
      adultHint: adult('Gira: el aire empuja las aspas.', 'Spin: the air pushes the blades.', 'Gira: l’aire empeny les aspes.', 'Xira: o aire empurra as pas.'),
      spatialCategory: 'orientation',
    },
  }),
  ev({
    id: 'S4.MOLINETE_GIRA',
    title: adult('El molinete gira', 'The pinwheel spins', 'El molinet gira', 'O muiñiño xira'),
    childAction: adult(
      'El codo desvía el aire y el molinete gira.',
      'The elbow bends the air and the pinwheel spins.',
      'El colze desvia l’aire i el molinet gira.',
      'O cóbado desvía o aire e o muiñiño xira.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'diversion',
      pictoKey: picto('rueda'),
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Spin the wheel!',
      adultHint: adult('El codo cambia de dirección el soplo.', 'The elbow changes the blow’s direction.', 'El colze canvia de direcció el buf.', 'O cóbado cambia de dirección o sopro.'),
      spatialCategory: 'orientation',
    },
  }),
  ev({
    id: 'S4.COMPUERTA_LIGERA',
    title: adult('Compuerta ligera', 'Light gate', 'Comporta lleugera', 'Comporta lixeira'),
    childAction: adult(
      'Un soplo suave levanta la compuerta ligera.',
      'A gentle blow lifts the light gate.',
      'Un buf suau aixeca la comporta lleugera.',
      'Un sopro suave levanta a comporta lixeira.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'alegre',
      pictoKey: picto('soplar'),
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Blow gently!',
      adultHint: adult('Ligera: se levanta con poco aire.', 'Light: it lifts with a little air.', 'Lleugera: s’aixeca amb poc aire.', 'Lixeira: levántase con pouco aire.'),
      spatialCategory: 'quantity',
    },
  }),
  ev({
    id: 'S4.COMPUERTA_PESADA',
    title: adult('Compuerta pesada', 'Heavy gate', 'Comporta pesada', 'Comporta pesada'),
    childAction: adult(
      'La compuerta pesada apenas se mueve con el mismo soplo.',
      'The heavy gate barely moves with the same blow.',
      'La comporta pesada gairebé no es mou amb el mateix buf.',
      'A comporta pesada apenas se move co mesmo sopro.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'orgullo',
      pictoKey: picto('soplar'),
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Blow strong!',
      adultHint: adult(
        'Pesada: hace falta más aire. No cierra la secuencia que el motor da por buena.',
        'Heavy: it needs more air. It does not finish the sequence the engine accepts.',
        'Pesada: cal més aire. No tanca la seqüència que el motor dona per bona.',
        'Pesada: fai falta máis aire. Non pecha a secuencia que o motor dá por boa.',
      ),
      spatialCategory: 'quantity',
    },
  }),
];

const CYCLE_SOLO: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Sopla suave por el canal. La compuerta ligera se levanta y la pesada apenas oscila. Las luces de la escena siguen apagadas. Espera cinco segundos en silencio antes de preguntar.',
      'Blow gently through the channel. The light gate lifts and the heavy one barely swings. The scene lights stay off. Wait five seconds in silence before asking.',
      'Bufa suau pel canal. La comporta lleugera s’aixeca i la pesada gairebé no oscil·la. Els llums de l’escena segueixen apagats. Espera cinc segons en silenci abans de preguntar.',
      'Sopra suave pola canle. A comporta lixeira levántase e a pesada apenas oscila. As luces da escena seguen apagadas. Agarda cinco segundos en silencio antes de preguntar.',
    ),
    socraticQuestion: adult(
      '¿Cuál se movió más, la compuerta ligera o la pesada?',
      'Which moved more, the light gate or the heavy one?',
      'Quina s’ha mogut més, la comporta lleugera o la pesada?',
      'Cal se moveu máis, a comporta lixeira ou a pesada?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Acopla el codo y dirige el aire primero al rotor y después al molinete. Soplo suave y soplo fuerte. Tú confirmas con el botón. Las luces no se encienden.',
      'Fit the elbow and send the air first to the rotor and then to the pinwheel. A gentle blow and a strong blow. You confirm with the button. The lights do not turn on.',
      'Acobla el colze i dirigeix l’aire primer al rotor i després al molinet. Buf suau i buf fort. Tu confirmes amb el botó. Els llums no s’encenen.',
      'Acopla o cóbado e dirige o aire primeiro ao rotor e despois ao muiñiño. Sopro suave e sopro forte. Ti confirmas co botón. As luces non se acenden.',
    ),
    hints: {
      level1Socratic: adult(
        '¿El aire va recto o dobla en el codo?',
        'Does the air go straight, or does it bend at the elbow?',
        'L’aire va recte o doblega al colze?',
        'O aire vai recto ou dobra no cóbado?',
      ),
      level2PhysicalModel: adult(
        'Acerca la boquilla al canal, redondea los labios y sopla un rato largo, sin tapar las aspas con la mano.',
        'Bring the mouthpiece to the channel, round the lips, and blow for a long moment, without covering the blades with a hand.',
        'Acosta la broqueta al canal, arrodoneix els llavis i bufa una estona llarga, sense tapar les aspes amb la mà.',
        'Achega a boquilla á canle, arredonda os labios e sopra un anaco longo, sen tapar as pas coa man.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Arma un circuito en L que mueva el molinete y, al final, levante la compuerta ligera.',
      'Build an L-shaped circuit that moves the pinwheel and, at the end, lifts the light gate.',
      'Munta un circuit en L que mogui el molinet i, al final, aixequi la comporta lleugera.',
      'Arma un circuíto en L que mova o muiñiño e, ao final, levante a comporta lixeira.',
    ),
    transferQuestion: adult(
      'Si soplas más fuerte, ¿la compuerta pesada se parece más a la ligera?',
      'If you blow harder, does the heavy gate behave more like the light one?',
      'Si bufes més fort, la comporta pesada s’assembla més a la lleugera?',
      'Se sopras máis forte, a comporta pesada parécese máis á lixeira?',
    ),
  },
};

const CYCLE_WITH_LUA: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Lúa está en la placa FRONTAL, al final del canal, de cara a la criatura. Sopla suave. Las luces siguen apagadas durante todo el soplo. Espera cinco segundos en silencio.',
      'Lúa is on the FRONTAL plate, at the end of the channel, facing the child. Blow gently. The lights stay off for the whole blow. Wait five seconds in silence.',
      'La Lúa és a la placa FRONTAL, al final del canal, de cara a la criatura. Bufa suau. Els llums segueixen apagats durant tot el buf. Espera cinc segons en silenci.',
      'Lúa está na placa FRONTAL, ao final da canle, de cara á criatura. Sopra suave. As luces seguen apagadas durante todo o sopro. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      '¿Lúa está delante del aire o detrás del canal?',
      'Is Lúa in front of the air, or behind the channel?',
      'La Lúa és davant de l’aire o darrere del canal?',
      'Lúa está diante do aire ou detrás da canle?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Redondea el soplo, gira el rotor o el molinete y levanta la compuerta ligera. Lúa cambia de cara. Ni la luz ni el háptico se encienden mientras se sopla. Tú confirmas con el botón.',
      'Round the blow, spin the rotor or the pinwheel, and lift the light gate. Lúa changes face. Neither the light nor the haptic turns on while anyone is blowing. You confirm with the button.',
      'Arrodoneix el buf, fes girar el rotor o el molinet i aixeca la comporta lleugera. La Lúa canvia de cara. Ni el llum ni l’hàptic s’encenen mentre es bufa. Tu confirmes amb el botó.',
      'Arredonda o sopro, fai xirar o rotor ou o muiñiño e levanta a comporta lixeira. Lúa cambia de cara. Nin a luz nin o háptico se acenden mentres se sopra. Ti confirmas co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Este soplo es suave o fuerte?',
        'Is this blow gentle or strong?',
        'Aquest buf és suau o fort?',
        'Este sopro é suave ou forte?',
      ),
      level2PhysicalModel: adult(
        'Mira a Lúa de frente, junta los labios en círculo y sopla hacia el canal hasta que las aspas se muevan.',
        'Look at Lúa face to face, make a circle with the lips, and blow toward the channel until the blades move.',
        'Mira la Lúa de cara, fes un cercle amb els llavis i bufa cap al canal fins que les aspes es moguin.',
        'Mira a Lúa de fronte, fai un círculo cos labios e sopra cara á canle ata que as pas se movan.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Con Lúa al final del canal, arma el circuito en L: primero el molinete y al final la compuerta ligera.',
      'With Lúa at the end of the channel, build the L circuit: first the pinwheel and at the end the light gate.',
      'Amb la Lúa al final del canal, munta el circuit en L: primer el molinet i al final la comporta lleugera.',
      'Con Lúa ao final da canle, arma o circuíto en L: primeiro o muiñiño e ao final a comporta lixeira.',
    ),
    transferQuestion: adult(
      'La compuerta pesada, ¿cierra el circuito que Lúa celebra o todavía pide más aire?',
      'Does the heavy gate finish the circuit Lúa celebrates, or does it still ask for more air?',
      'La comporta pesada, tanca el circuit que la Lúa celebra o encara demana més aire?',
      'A comporta pesada, pecha o circuíto que Lúa celebra ou aínda pide máis aire?',
    ),
  },
};

const METHODS: DetectionMethod[] = ['marker', 'face', 'adult_tap'];

export const SET_SOLO: SteamActivity = {
  id: 'AR-S04',
  worldId: 'S4',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: METHODS,
  childSpeech: speech(
    '¡Sopla suave! ¡Sopla fuerte! ¡Gira la rueda!',
    'Sopra suave! Sopra forte! Xira a roda!',
    'Putz egin leun! Putz egin gogor! Biratu gurpila!',
    '¡Sopla suave! ¡Sopla fuerte! ¡Dale vuelta a la rueda!',
    'Blow gently! Blow strong! Spin the wheel!',
    'Bufa suau! Bufa fort! Fes girar la roda!',
  ),
  englishTpr: 'Blow gently! Blow strong! Spin the wheel!',
  cycle: CYCLE_SOLO,
  events: EVENTS,
};

export const SET_WITH_LUA: SteamActivity = {
  id: 'AR-SL04',
  worldId: 'S4',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: METHODS,
  childSpeech: speech(
    '¡Sopla con Lúa! ¡Gira la rueda!',
    'Sopra con Lúa! Xira a roda!',
    'Putz egin Lúarekin! Biratu errota!',
    '¡Sopla con Lúa! ¡Gira la rueda!',
    'Blow with Lúa! Spin the wheel!',
    'Bufa amb la Lúa! Fes girar la roda!',
  ),
  englishTpr: 'Blow with Lúa! Spin the wheel!',
  cycle: CYCLE_WITH_LUA,
  events: EVENTS,
};

export const MANIFEST: WorldManifest = {
  id: 'S4',
  orderIndex: 4,
  title: adult(
    'El molino de aire y compuertas',
    'The air mill and gates',
    'El molí d’aire i comportes',
    'O muíño de aire e comportas',
  ),
  subtitleEn: 'A breath becomes spin, and a light gate lifts before a heavy one',
  phenomenon: adult(
    'El aire del canal recto y del codo hace girar el rotor y el molinete, y levanta antes la compuerta ligera que la pesada.',
    'Air from the straight channel and the elbow spins the rotor and the pinwheel, and lifts the light gate before the heavy one.',
    'L’aire del canal recte i del colze fa girar el rotor i el molinet, i aixeca abans la comporta lleugera que la pesada.',
    'O aire da canle recta e do cóbado fai xirar o rotor e o muiñiño, e levanta antes a comporta lixeira que a pesada.',
  ),
  ageRange: '0-6',
  scaleSummary: 'E',
  prioritySpatialCategories: ['properties', 'orientation', 'quantity'],
  skillAxes: ['phonology_speech', 'sensory_regulation'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Familia y aula, de 0 a 6 años. La persona adulta maneja la tableta. Durante el soplo las luces quedan apagadas.',
    'Home and classroom, ages 0 to 6. The adult handles the tablet. During the blow the lights stay off.',
    'Família i aula, de 0 a 6 anys. La persona adulta fa servir la tauleta. Durant el buf els llums queden apagats.',
    'Familia e aula, de 0 a 6 anos. A persoa adulta manexa a tableta. Durante o sopro as luces quedan apagadas.',
  ),
  udlPathways: {
    representation: adult(
      'El soplo se ve en las aspas, se siente en los labios y se nombra: suave, fuerte, girar.',
      'The blow is seen in the blades, felt on the lips, and named: gentle, strong, spin.',
      'El buf es veu a les aspes, es nota als llavis i s’anomena: suau, fort, girar.',
      'O sopro vese nas pas, séntese nos labios e nómease: suave, forte, xirar.',
    ),
    engagement: adult(
      'Cada quien usa su boquilla. Parar de soplar y guardar es parte del juego. Las luces no parpadean.',
      'Each person uses their own mouthpiece. Stopping the blow and putting things away is part of the play. The lights do not blink.',
      'Cadascú fa servir la seva broqueta. Deixar de bufar i desar forma part del joc. Els llums no parpellegen.',
      'Cada quen usa a súa boquilla. Parar de soprar e gardar forma parte do xogo. As luces non pestanexan.',
    ),
    expression: adult(
      'La criatura sopla, señala las aspas o espera. No hace falta decir la palabra. El adulto confirma con el botón.',
      'The child blows, points to the blades, or waits. The word does not have to be said. The adult confirms with the button.',
      'La criatura bufa, assenyala les aspes o espera. No cal dir la paraula. L’adult confirma amb el botó.',
      'A criatura sopra, sinala as pas ou agarda. Non fai falta dicir a palabra. A persoa adulta confirma co botón.',
    ),
  },
  tabletStandSpec: {
    heightCm: 18,
    tiltDeg: 75,
    cameraMode: 'front_praxias_only',
    luaOrientation: 'child_sees_front',
  },
  pieces: [
    piece('S4-CAN-E', adult('Canal recto', 'Straight channel', 'Canal recte', 'Canle recta'), 2, [440, 441], 'marker'),
    piece('S4-COD-E', adult('Codo', 'Elbow', 'Colze', 'Cóbado'), 1, [442], 'marker'),
    piece('S4-ROT-E', adult('Rotor', 'Rotor', 'Rotor', 'Rotor'), 2, [44, 443], 'marker'),
    piece('S4-MOL-E', adult('Molinete', 'Pinwheel', 'Molinet', 'Muiñiño'), 2, [444, 445], 'marker'),
    piece('S4-COM-LIG-E', adult('Compuerta ligera', 'Light gate', 'Comporta lleugera', 'Comporta lixeira'), 1, [446], 'marker'),
    piece('S4-COM-PES-E', adult('Compuerta pesada', 'Heavy gate', 'Comporta pesada', 'Comporta pesada'), 1, [447], 'marker'),
    piece('S4-JAU-E', adult('Jaula abierta', 'Open cage', 'Gàbia oberta', 'Gaiola aberta'), 1, [448], 'marker'),
  ],
  events: EVENTS,
  challenges: [
    {
      id: 'S4-C1',
      number: 1,
      title: adult(
        'Del soplo a la compuerta ligera',
        'From the blow to the light gate',
        'Del buf a la comporta lleugera',
        'Do sopro á comporta lixeira',
      ),
      ageBand: '3-4',
      neuroStage: 'I4',
      estimatedMinutes: 10,
      scale: 'E',
      skillAxes: ['phonology_speech', 'sensory_regulation'],
      targetEvents: [
        'S4.PRAXIA_REDONDEO',
        'S4.ROTOR_GIRA',
        'S4.MOLINETE_GIRA',
        'S4.COMPUERTA_LIGERA',
        'S4.COMPUERTA_PESADA',
      ],
      cycle: CYCLE_WITH_LUA,
      achievementCriterion: adult(
        'El soplo redondo va seguido del rotor o del molinete y termina en la compuerta ligera. Las luces siguen apagadas. El adulto confirma con el botón.',
        'The round blow is followed by the rotor or the pinwheel and ends at the light gate. The lights stay off. The adult confirms with the button.',
        'El buf redó va seguit del rotor o del molinet i acaba a la comporta lleugera. Els llums segueixen apagats. L’adult confirma amb el botó.',
        'O sopro redondo vai seguido do rotor ou do muiñiño e remata na comporta lixeira. As luces seguen apagadas. A persoa adulta confirma co botón.',
      ),
      qualitativeObservation: adult(
        'Anota si el soplo fue largo y si la compuerta pesada se quedó quieta.',
        'Note whether the blow was long and whether the heavy gate stayed still.',
        'Anota si el buf ha estat llarg i si la comporta pesada s’ha quedat quieta.',
        'Anota se o sopro foi longo e se a comporta pesada quedou quieta.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S4-CARD-L',
      title: adult('Circuito en L', 'L-shaped circuit', 'Circuit en L', 'Circuíto en L'),
      targetPieces: ['S4-CAN-E', 'S4-COD-E', 'S4-MOL-E', 'S4-COM-LIG-E'],
    },
  ],
  revealLayer: {
    id: 'set_soplo',
    description: adult(
      'Cintas de aire a lo largo del canal y alrededor de las aspas. Sin luces de escena durante el soplo.',
      'Ribbons of air along the channel and around the blades. No scene lights during the blow.',
      'Cintes d’aire al llarg del canal i al voltant de les aspes. Sense llums d’escena durant el buf.',
      'Cintas de aire ao longo da canle e arredor das pas. Sen luces de escena durante o sopro.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: {
    songIds: ['lua_song_04'],
    gameIds: ['lua_game_06'],
  },
  story: {
    storyId: 'lua_story_07',
    anticipationMicroStory: adult(
      'Lúa espera al final del canal. Un soplo suave basta para despertar la rueda ligera.',
      'Lúa waits at the end of the channel. A gentle blow is enough to wake the light wheel.',
      'La Lúa espera al final del canal. Un buf suau basta per despertar la roda lleugera.',
      'Lúa agarda ao final da canle. Un sopro suave abonda para espertar a roda lixeira.',
    ),
    closingMicroStory: adult(
      'El aire se calma. Las compuertas bajan y las boquillas vuelven a su bolsa.',
      'The air grows calm. The gates come down and the mouthpieces go back in their pouch.',
      'L’aire s’acalma. Les comportes baixen i les broquetes tornen a la seva bossa.',
      'O aire acalma. As comportas baixan e as boquillas volven á súa bolsa.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'BlockList',
      blockParam: 'lenguaje',
      connectionReason: adult(
        'En la mesa se practica el soplo largo y el corto, con la persona adulta y sin la máquina.',
        'At the table the long blow and the short blow are practiced, with the adult and without the machine.',
        'A la taula es practica el buf llarg i el curt, amb la persona adulta i sense la màquina.',
        'Na mesa practícase o sopro longo e o curto, coa persoa adulta e sen a máquina.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S4',
};

const POSITIVE: ChallengeInput = { kind: 'causal', worldId: 'S4', states: CAUSAL_SEQUENCES.S4[0] };
const NEGATIVE: ChallengeInput = {
  kind: 'causal',
  worldId: 'S4',
  states: ['S4.PRAXIA_REDONDEO', 'S4.ROTOR_GIRA', 'S4.COMPUERTA_PESADA'],
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
    id: 'S4-positiva',
    polarity: 'positive',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S4-ROT-E', markerId: 44 },
    challenge: POSITIVE,
  },
  {
    id: 'S4-negativa',
    polarity: 'negative',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S4-ROT-E', markerId: 44 },
    challenge: NEGATIVE,
  },
  {
    id: 'S4-oclusion-parcial',
    polarity: 'partial_occlusion',
    frames: VISUAL_STABLE_FRAMES - 1,
    observation: { method: 'marker', pieceCode: 'S4-ROT-E', markerId: 44 },
    challenge: POSITIVE,
  },
  {
    id: 'S4-adult-tap',
    polarity: 'positive',
    frames: framesRequired('adult_tap'),
    observation: { method: 'adult_tap' },
    challenge: POSITIVE,
  },
];

function assertReplay(): void {
  for (const item of EVENTS) {
    if (item.reaction.light !== 'APAGADO' || item.reaction.haptic !== 'APAGADO') {
      throw new Error(`${item.id}: S4 lleva las luces APAGADO.`);
    }
  }
  const rotor = evaluateChallenge({ kind: 'causal', worldId: 'S4', states: CAUSAL_SEQUENCES.S4[0] });
  const pinwheel = evaluateChallenge({ kind: 'causal', worldId: 'S4', states: CAUSAL_SEQUENCES.S4[1] });
  if (!rotor.ok || !pinwheel.ok) {
    throw new Error('S4: el motor no acepta las dos secuencias de la compuerta ligera.');
  }
  if (translateExpression('orgullo').index !== 15 || translateExpression('diversion').index !== 17) {
    throw new Error('S4: la compuerta pesada y el giro no coinciden con las caras del motor.');
  }
  if (translateExpression('animo').index !== 2 || translateExpression('alegre').index !== 10) {
    throw new Error('S4: el soplo y la compuerta ligera no coinciden con las caras del motor.');
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

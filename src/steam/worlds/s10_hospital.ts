// Set 10 · Hospital infantil y calma. AR-S10 (SET_SOLO) y AR-SL10 (SET_WITH_LUA).
// Secuencia causal: llegada, camilla, latido calmo, alta contenta.
import type {
  AdultText,
  ChildSpeechMap,
  HapticPattern,
  LightPattern,
  LuaSemanticExpression,
  SpatialCategory,
  SteamActivity,
  WorldEventId,
  WorldEventSpec,
  WorldManifest,
} from '../types';

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

const TPR = 'Up the gentle ramp! Breathe slow and calm!';

const CYCLE = {
  observa: {
    phenomenonTrigger: adult(
      'La camilla sube por la rampa suave hasta el pabellón. La onda de luz late despacio.',
      'The cot goes up the gentle ramp to the pavilion. The light wave beats slowly.',
      'La llitera puja per la rampa suau fins al pavelló. L\'ona de llum batega a poc a poc.',
      'A padiola sobe pola rampa suave ata o pavillón. A onda de luz late amodo.',
    ),
    socraticQuestion: adult(
      '¿Por dónde sube la camilla, por la rampa o por un escalón?',
      'Which way does the cot go up, the ramp or a step?',
      'Per on puja la llitera, per la rampa o per un esglaó?',
      'Por onde sobe a padiola, pola rampa ou por un chanzo?',
    ),
    mandatorySilenceSec: 5 as const,
  },
  experimenta: {
    adultStepByStep: adult(
      'Saluda en la entrada, escucha el latido tranquilo, deja a Lúa en la camilla y termina en el helipuerto. La persona adulta confirma cada paso con un toque.',
      'Greet at the entrance, listen to the quiet beat, rest Lúa on the cot and finish at the landing pad. The adult confirms each step with a tap.',
      'Saluda a l\'entrada, escolta el batec tranquil, deixa la Lúa a la llitera i acaba a l\'heliport. La persona adulta confirma cada pas amb un toc.',
      'Saúda na entrada, escoita o latexo tranquilo, deixa a Lúa na padiola e remata no heliporto. A persoa adulta confirma cada paso cun toque.',
    ),
    hints: {
      level1Socratic: adult(
        '¿La onda va deprisa o despacio?',
        'Does the wave go fast or slow?',
        'L\'ona va de pressa o a poc a poc?',
        'A onda vai axiña ou amodo?',
      ),
      level2PhysicalModel: adult(
        'Sube la camilla con la mano por la rampa, sin escalón, y cuenta tres tiempos para entrar y tres para salir el aire.',
        'Roll the cot up the ramp by hand, with no step, and count three beats in and three beats out.',
        'Puja la llitera amb la mà per la rampa, sense esglaó, i compta tres temps per entrar l\'aire i tres per sortir.',
        'Sobe a padiola coa man pola rampa, sen chanzo, e conta tres tempos para entrar o aire e tres para saír.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Monta una entrada sin escalones uniendo el camino con la puerta del pabellón.',
      'Build a step-free entrance by joining the path to the pavilion door.',
      'Munta una entrada sense esglaons unint el camí amb la porta del pavelló.',
      'Monta unha entrada sen chanzos unindo o camiño coa porta do pavillón.',
    ),
    transferQuestion: adult(
      '¿Qué es más fácil de subir con ruedas, una rampa suave o un escalón?',
      'Which is easier to roll up, a gentle ramp or a step?',
      'Què és més fàcil de pujar amb rodes, una rampa suau o un esglaó?',
      'Que é máis doado de subir con rodas, unha rampa suave ou un chanzo?',
    ),
  },
};

function ev(
  id: WorldEventId,
  title: AdultText,
  childAction: AdultText,
  methods: WorldEventSpec['methods'],
  turn: 'motor' | 'verbal',
  expression: LuaSemanticExpression,
  light: LightPattern,
  haptic: HapticPattern,
  hint: AdultText,
  spatial: SpatialCategory,
): WorldEventSpec {
  return {
    id,
    title,
    childAction,
    methods,
    turn,
    reaction: { expression, light, haptic, screenOverlay: 'NONE' },
    word: { englishTpr: TPR, adultHint: hint, spatialCategory: spatial },
  };
}

const SOLO_EVENTS: WorldEventSpec[] = [
  ev(
    'S10.LLEGADA_RAMPA',
    adult('Llegada por la rampa', 'Arrival up the ramp', 'Arribada per la rampa', 'Chegada pola rampa'),
    adult(
      'La camilla entra por la rampa suave, sin escalón.',
      'The cot comes in on the gentle ramp, with no step.',
      'La llitera entra per la rampa suau, sense esglaó.',
      'A padiola entra pola rampa suave, sen chanzo.',
    ),
    ['marker', 'adult_tap'],
    'motor',
    'atenta',
    'TENUE_CUATRO',
    'APAGADO',
    adult(
      'Di: por la rampa suave.',
      'Say: up the gentle ramp.',
      'Digues: per la rampa suau.',
      'Di: pola rampa suave.',
    ),
    'position',
  ),
  ev(
    'S10.LUA_EN_CAMILLA',
    adult('Lúa en la camilla', 'Lúa on the cot', 'La Lúa a la llitera', 'Lúa na padiola'),
    adult(
      'La criatura acuesta a Lúa en la camilla. La persona adulta confirma con un toque.',
      'The child lays Lúa on the cot. The adult confirms with a tap.',
      'L\'infant ajeia la Lúa a la llitera. La persona adulta confirma amb un toc.',
      'A criatura deita a Lúa na padiola. A persoa adulta confirma cun toque.',
    ),
    ['marker', 'occlusion', 'adult_tap'],
    'motor',
    'alivio',
    'TENUE_CUATRO',
    'APAGADO',
    adult(
      'Di: descansa en la camilla.',
      'Say: rest on the cot.',
      'Digues: reposa a la llitera.',
      'Di: descansa na padiola.',
    ),
    'position',
  ),
  ev(
    'S10.LATIDO_CALMO',
    adult('Latido calmo', 'Quiet beat', 'Batec calmat', 'Latexo calmo'),
    adult(
      'La onda luminosa late despacio sobre la camilla, al ritmo de tres y tres.',
      'The light wave beats slowly over the cot, in a rhythm of three and three.',
      'L\'ona lluminosa batega a poc a poc sobre la llitera, al ritme de tres i tres.',
      'A onda luminosa late amodo sobre a padiola, ao ritmo de tres e tres.',
    ),
    ['marker', 'adult_tap'],
    'motor',
    'calma',
    'TENUE_CUATRO',
    'APAGADO',
    adult(
      'Di: respira despacio.',
      'Say: breathe slowly.',
      'Digues: respira a poc a poc.',
      'Di: respira amodo.',
    ),
    'properties',
  ),
  ev(
    'S10.ALTA_FELIZ',
    adult('Salida contenta', 'Happy send-off', 'Sortida contenta', 'Saída contenta'),
    adult(
      'Lúa se levanta, agradece el cuidado y el juego sigue en el helipuerto.',
      'Lúa gets up, thanks for the care, and play continues at the landing pad.',
      'La Lúa s\'aixeca, agraeix la cura i el joc segueix a l\'heliport.',
      'Lúa érgese, agradece o coidado e o xogo segue no heliporto.',
    ),
    ['marker', 'adult_tap'],
    'motor',
    'gratitud',
    'TENUE_CUATRO',
    'APAGADO',
    adult(
      'Di: gracias por cuidar.',
      'Say: thank you for the care.',
      'Digues: gràcies per cuidar.',
      'Di: grazas por coidar.',
    ),
    'deictics',
  ),
  ev(
    'S10.CONSIGNA_VERBAL',
    adult('Consigna de calma', 'Calm prompt', 'Consigna de calma', 'Consigna de calma'),
    adult(
      'La persona adulta dice la consigna en voz baja. La criatura no toca la tableta.',
      'The adult says the prompt quietly. The child does not touch the tablet.',
      'La persona adulta diu la consigna en veu baixa. L\'infant no toca la tauleta.',
      'A persoa adulta di a consigna en voz baixa. A criatura non toca a tableta.',
    ),
    ['adult_tap'],
    'verbal',
    'escucha',
    'APAGADO',
    'APAGADO',
    adult(
      'Sube por la rampa suave. Respira despacio.',
      'Up the gentle ramp. Breathe slow and calm.',
      'Puja per la rampa suau. Respira a poc a poc.',
      'Sobe pola rampa suave. Respira amodo.',
    ),
    'properties',
  ),
];

function withLuaHaptic(events: readonly WorldEventSpec[]): WorldEventSpec[] {
  return events.map((event) => {
    if (event.id !== 'S10.LATIDO_CALMO') return event;
    return { ...event, reaction: { ...event.reaction, haptic: 'RONRONEO' } };
  });
}

const CHILD = speech(
  'Sube por la rampa suave. Respira despacio.',
  'Sobe pola rampa suave. Respira amodo.',
  'Igo malda leunean. Arnastu poliki.',
  'Sube por la rampa suave. Respira despacito.',
  'Up the gentle ramp. Breathe slow and calm.',
  'Puja per la rampa suau. Respira a poc a poc.',
);

export const setSolo: SteamActivity = {
  id: 'AR-S10',
  worldId: 'S10',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: ['marker', 'occlusion', 'adult_tap'],
  childSpeech: CHILD,
  englishTpr: TPR,
  cycle: CYCLE,
  events: SOLO_EVENTS,
};

export const setWithLua: SteamActivity = {
  id: 'AR-SL10',
  worldId: 'S10',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: ['marker', 'occlusion', 'adult_tap'],
  childSpeech: CHILD,
  englishTpr: TPR,
  cycle: CYCLE,
  events: withLuaHaptic(SOLO_EVENTS),
};

export const activities: readonly SteamActivity[] = [setSolo, setWithLua];

const SAFE = adult(
  'Pieza grande de mesa. La persona adulta la acerca. No va a la boca.',
  'Large table piece. The adult brings it over. It does not go in the mouth.',
  'Peça grossa de taula. La persona adulta l\'acosta. No va a la boca.',
  'Peza grande de mesa. A persoa adulta achégaa. Non vai á boca.',
);

export const manifest: WorldManifest = {
  id: 'S10',
  orderIndex: 10,
  title: adult(
    'Hospital infantil y calma',
    'Children\'s play hospital and calm',
    'Hospital infantil i calma',
    'Hospital infantil e calma',
  ),
  subtitleEn: 'Gentle ramp and a slow breath',
  phenomenon: adult(
    'La rampa suave deja pasar la camilla donde un escalón la pararía. La luz de la camilla late despacio, tres tiempos y tres tiempos.',
    'The gentle ramp lets the cot through where a step would stop it. The cot light beats slowly, three beats and three beats.',
    'La rampa suau deixa passar la llitera on un esglaó l\'aturaria. La llum de la llitera batega a poc a poc, tres temps i tres temps.',
    'A rampa suave deixa pasar a padiola onde un chanzo a pararía. A luz da padiola late amodo, tres tempos e tres tempos.',
  ),
  ageRange: '3-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['position', 'properties', 'deictics'],
  skillAxes: ['sensory_regulation', 'interaction_pragmatics'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Juego de mesa para familias y aulas. La criatura cuida a Lúa en el pabellón. La persona adulta confirma con un toque y la criatura no maneja la tableta.',
    'A table game for families and classrooms. The child looks after Lúa in the pavilion. The adult confirms with a tap and the child does not operate the tablet.',
    'Joc de taula per a famílies i aules. L\'infant té cura de la Lúa al pavelló. La persona adulta confirma amb un toc i l\'infant no fa anar la tauleta.',
    'Xogo de mesa para familias e aulas. A criatura coida a Lúa no pavillón. A persoa adulta confirma cun toque e a criatura non manexa a tableta.',
  ),
  udlPathways: {
    representation: adult(
      'La onda lenta y la pista del helipuerto se ven en la capa de revelación. El ritmo también se puede contar con la mano.',
      'The slow wave and the landing-pad path show on the reveal layer. The rhythm can also be counted by hand.',
      'L\'ona lenta i la pista de l\'heliport es veuen a la capa de revelació. El ritme també es pot comptar amb la mà.',
      'A onda lenta e a pista do heliporto vense na capa de revelación. O ritmo tamén se pode contar coa man.',
    ),
    engagement: adult(
      'El juego tiene cuatro gestos seguidos: llegar, acostar, respirar y despedir.',
      'The game has four gestures in a row: arrive, lay down, breathe and say goodbye.',
      'El joc té quatre gestos seguits: arribar, ajeure, respirar i acomiadar.',
      'O xogo ten catro xestos seguidos: chegar, deitar, respirar e despedir.',
    ),
    expression: adult(
      'La criatura muestra el cuidado con las piezas. No hace falta hablar para completar la secuencia.',
      'The child shows care with the pieces. Speech is not required to complete the sequence.',
      'L\'infant mostra la cura amb les peces. No cal parlar per completar la seqüència.',
      'A criatura amosa o coidado coas pezas. Non fai falta falar para completar a secuencia.',
    ),
  },
  tabletStandSpec: {
    heightCm: 26,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_front',
  },
  pieces: [
    {
      code: 'S10-HOS-PAV',
      name: adult('Pabellón', 'Pavilion', 'Pavelló', 'Pavillón'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [101],
      detectionMethod: 'marker',
      safetyNotes: SAFE,
    },
    {
      code: 'S10-HOS-RAMPA',
      name: adult('Rampa suave', 'Gentle ramp', 'Rampa suau', 'Rampa suave'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [102],
      detectionMethod: 'marker',
      safetyNotes: SAFE,
    },
    {
      code: 'S10-HOS-CAMI',
      name: adult('Camilla', 'Cot', 'Llitera', 'Padiola'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [100],
      detectionMethod: 'marker',
      safetyNotes: SAFE,
    },
    {
      code: 'S10-HOS-HELI',
      name: adult('Helipuerto', 'Landing pad', 'Heliport', 'Heliporto'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [103],
      detectionMethod: 'marker',
      safetyNotes: SAFE,
    },
  ],
  events: setWithLua.events,
  challenges: [
    {
      id: 'S10-C1',
      number: 1,
      title: adult(
        'La visita tranquila',
        'The quiet visit',
        'La visita tranquil·la',
        'A visita tranquila',
      ),
      ageBand: '4-5',
      neuroStage: 'I4',
      estimatedMinutes: 8,
      scale: 'G',
      skillAxes: ['sensory_regulation', 'interaction_pragmatics'],
      targetEvents: ['S10.LLEGADA_RAMPA', 'S10.LUA_EN_CAMILLA', 'S10.LATIDO_CALMO', 'S10.ALTA_FELIZ'],
      cycle: CYCLE,
      achievementCriterion: adult(
        'La secuencia de la mesa es llegada, camilla, latido calmo y salida contenta, en ese orden.',
        'The table sequence is arrival, cot, quiet beat and a happy send-off, in that order.',
        'La seqüència de la taula és arribada, llitera, batec calmat i sortida contenta, en aquest ordre.',
        'A secuencia da mesa é chegada, padiola, latexo calmo e saída contenta, nesa orde.',
      ),
      qualitativeObservation: adult(
        'La persona adulta anota si el ritmo se mantuvo lento. No hay puntuación.',
        'The adult notes whether the rhythm stayed slow. There is no score.',
        'La persona adulta anota si el ritme s\'ha mantingut lent. No hi ha puntuació.',
        'A persoa adulta anota se o ritmo se mantivo lento. Non hai puntuación.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S10-CARD-CALMA',
      title: adult('Entrada sin escalón', 'Step-free entrance', 'Entrada sense esglaó', 'Entrada sen chanzo'),
      targetPieces: ['S10-HOS-PAV', 'S10-HOS-RAMPA', 'S10-HOS-CAMI', 'S10-HOS-HELI'],
    },
  ],
  revealLayer: {
    id: 'set_oficios',
    description: adult(
      'Nodo hospital de set_oficios: onda lenta sobre la camilla y pista del helipuerto. Animación celebrate.',
      'Hospital node of set_oficios: a slow wave over the cot and the landing-pad path. Animation celebrate.',
      'Node hospital de set_oficios: ona lenta sobre la llitera i pista de l\'heliport. Animació celebrate.',
      'Nodo hospital de set_oficios: onda lenta sobre a padiola e pista do heliporto. Animación celebrate.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: { songIds: ['lua_song_01'], gameIds: ['lua_game_12'] },
  story: {
    storyId: 'lua_story_08',
    anticipationMicroStory: adult(
      'Lúa llega al pabellón por una rampa suave. Dentro, la luz respira despacio.',
      'Lúa arrives at the pavilion on a gentle ramp. Inside, the light breathes slowly.',
      'La Lúa arriba al pavelló per una rampa suau. A dins, la llum respira a poc a poc.',
      'Lúa chega ao pavillón por unha rampa suave. Dentro, a luz respira amodo.',
    ),
    closingMicroStory: adult(
      'La visita termina con un gracias. La camilla queda vacía y las piezas vuelven a la caja.',
      'The visit ends with a thank-you. The cot is empty and the pieces go back in the box.',
      'La visita acaba amb un gràcies. La llitera queda buida i les peces tornen a la caixa.',
      'A visita remata cun grazas. A padiola queda baleira e as pezas volven á caixa.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'SensoryBlockList',
      blockParam: 'tea',
      connectionReason: adult(
        'En mesa se repite el mismo ritmo lento de la onda, con la camilla delante y sin prisa.',
        'At the table the same slow wave rhythm is repeated, with the cot in front and without rushing.',
        'A taula es repeteix el mateix ritme lent de l\'ona, amb la llitera al davant i sense pressa.',
        'Na mesa repítese o mesmo ritmo lento da onda, coa padiola diante e sen présa.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S10',
};

// Set 3 · Rampas. SET_SOLO (AR-S03) y SET_WITH_LUA (AR-SL03).
// Cada bajada vale si tarda menos que la anterior, como ya mide el motor.
import { PICTO_KEYS } from '../../ValeriaPixelArt';
import {
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

const S3_PAUSE_MS = 500;

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
  'Esfera grande de mesa. La suelta la criatura desde la rampa y la recoge la persona adulta.',
  'Large table sphere. The child lets it go from the ramp and the adult picks it up.',
  'Esfera gran de taula. La deixa anar la criatura des de la rampa i la recull la persona adulta.',
  'Esfera grande de mesa. Solta a criatura desde a rampla e recóllea a persoa adulta.',
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
  return { ...input, pauseBeforeReactionMs: S3_PAUSE_MS };
}

const EVENTS: WorldEventSpec[] = [
  ev({
    id: 'S3.ESFERA_ARRIBA',
    title: adult('Esfera arriba', 'Sphere up high', 'Esfera a dalt', 'Esfera arriba'),
    childAction: adult(
      'La criatura sostiene la esfera en lo alto del pilar, sin soltarla todavía.',
      'The child holds the sphere at the top of the pillar, without letting go yet.',
      'La criatura aguanta l’esfera dalt del pilar, sense deixar-la anar encara.',
      'A criatura sostén a esfera no alto do piar, sen soltala aínda.',
    ),
    methods: ['marker', 'tracked_object', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'expectante',
      pictoKey: picto('pelota'),
      light: 'LADO_RAMPA',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'High tower!',
      adultHint: adult('Alto: todavía no rueda.', 'High: it is not rolling yet.', 'Alt: encara no roda.', 'Alto: aínda non roda.'),
      spatialCategory: 'dimensions',
    },
  }),
  ev({
    id: 'S3.SALIDA_ANTICIPADA',
    title: adult('Antes de soltar', 'Before the release', 'Abans de deixar anar', 'Antes de soltar'),
    childAction: adult(
      'La criatura mira la rampa y dice, o señala, por dónde cree que llegará antes.',
      'The child looks at the ramp and says, or points to, which way they think will arrive first.',
      'La criatura mira la rampa i diu, o assenyala, per on creu que arribarà abans.',
      'A criatura mira a rampla e di, ou sinala, por onde cre que chegará antes.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'atenta',
      light: 'LADO_RAMPA',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Roll down!',
      adultHint: adult(
        '¿Llegará antes por la rampa alta o por la rugosa?',
        'Will it arrive sooner on the high ramp or on the rough one?',
        'Arribarà abans per la rampa alta o per la rugosa?',
        'Chegará antes pola rampla alta ou pola rugosa?',
      ),
      spatialCategory: 'deictics',
    },
  }),
  ev({
    id: 'S3.LLEGADA_RAPIDA',
    title: adult('Llegada rápida', 'Fast arrival', 'Arribada ràpida', 'Chegada rápida'),
    childAction: adult(
      'La esfera llega al receptor en menos tiempo que la bajada anterior.',
      'The sphere reaches the catcher in less time than the previous run.',
      'L’esfera arriba al receptor en menys temps que la baixada anterior.',
      'A esfera chega ao receptor en menos tempo que a baixada anterior.',
    ),
    methods: ['marker', 'tracked_object', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'celebra_corta',
      pictoKey: picto('cae'),
      light: 'LADO_RAMPA',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Fast, slow, stop!',
      adultHint: adult('Rápido: esta bajada tardó menos.', 'Fast: this run took less time.', 'Ràpid: aquesta baixada ha trigat menys.', 'Rápido: esta baixada tardou menos.'),
      spatialCategory: 'properties',
    },
  }),
  ev({
    id: 'S3.LLEGADA_LENTA',
    title: adult('Llegada lenta', 'Slow arrival', 'Arribada lenta', 'Chegada lenta'),
    childAction: adult(
      'La esfera llega más tarde que la bajada anterior, sobre el tramo rugoso.',
      'The sphere arrives later than the previous run, on the rough stretch.',
      'L’esfera arriba més tard que la baixada anterior, sobre el tram rugós.',
      'A esfera chega máis tarde que a baixada anterior, sobre o tramo rugoso.',
    ),
    methods: ['marker', 'tracked_object', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'calma',
      light: 'LADO_RAMPA',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Fast, slow, stop!',
      adultHint: adult('Lento: el roce se come la prisa.', 'Slow: the rub eats the hurry.', 'Lent: el fregament es menja la pressa.', 'Lento: o rozamento come a présa.'),
      spatialCategory: 'properties',
    },
  }),
  ev({
    id: 'S3.SE_PARA',
    title: adult('Se para en el receptor', 'Stops in the catcher', 'S’atura al receptor', 'Párase no receptor'),
    childAction: adult(
      'La esfera se detiene dentro del receptor, sin salirse.',
      'The sphere stops inside the catcher, without rolling out.',
      'L’esfera s’atura dins del receptor, sense sortir-se’n.',
      'A esfera detense dentro do receptor, sen saír.',
    ),
    methods: ['marker', 'tracked_object', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'celebra_corta',
      pictoKey: picto('pelota'),
      light: 'LADO_RAMPA',
      haptic: 'CELEBRA_CORTO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Fast, slow, stop!',
      adultHint: adult('Para: se quedó en el tope.', 'Stop: it stayed at the end stop.', 'Para: s’ha quedat al topall.', 'Para: quedou no tope.'),
      spatialCategory: 'deictics',
    },
  }),
];

const CYCLE_SOLO: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Suelta la esfera lisa desde el pilar 2 y, después, desde el pilar 6. La tableta muestra los dos arcos, uno al lado del otro. Espera cinco segundos en silencio antes de preguntar.',
      'Let the smooth sphere go from pillar 2 and then from pillar 6. The tablet shows the two arcs side by side. Wait five seconds in silence before asking.',
      'Deixa anar l’esfera llisa des del pilar 2 i, després, des del pilar 6. La tauleta mostra els dos arcs, un al costat de l’altre. Espera cinc segons en silenci abans de preguntar.',
      'Solta a esfera lisa desde o piar 2 e, despois, desde o piar 6. A tableta mostra os dous arcos, un ao lado do outro. Agarda cinco segundos en silencio antes de preguntar.',
    ),
    socraticQuestion: adult(
      '¿Desde dónde llegó antes, desde el pilar bajo o desde el alto?',
      'From where did it arrive sooner, the low pillar or the high one?',
      'Des d’on ha arribat abans, des del pilar baix o des de l’alt?',
      'Desde onde chegou antes, desde o piar baixo ou desde o alto?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Intercala el tramo rugoso y suelta la esfera rugosa. Mira cómo pierde prisa antes de la curva peraltada. Tú confirmas cada bajada con el botón, cuando la esfera ya paró.',
      'Insert the rough stretch and let the rough sphere go. Watch it lose hurry before the banked curve. You confirm each run with the button, once the sphere has stopped.',
      'Intercala el tram rugós i deixa anar l’esfera rugosa. Mira com perd pressa abans de la corba peraltada. Tu confirmes cada baixada amb el botó, quan l’esfera ja s’ha aturat.',
      'Intercala o tramo rugoso e solta a esfera rugosa. Mira como perde présa antes da curva peraltada. Ti confirmas cada baixada co botón, cando a esfera xa parou.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Esta bajada fue más rápida o más lenta que la de antes?',
        'Was this run faster or slower than the one before?',
        'Aquesta baixada ha estat més ràpida o més lenta que l’anterior?',
        'Esta baixada foi máis rápida ou máis lenta que a de antes?',
      ),
      level2PhysicalModel: adult(
        'Sube la esfera al pilar 6, suéltala y cuenta hasta que toque el receptor. Repite desde el pilar 2.',
        'Take the sphere up to pillar 6, let it go, and count until it touches the catcher. Repeat from pillar 2.',
        'Puja l’esfera al pilar 6, deixa-la anar i compta fins que toqui el receptor. Repeteix des del pilar 2.',
        'Sube a esfera ao piar 6, sóltaa e conta ata que toque o receptor. Repite desde o piar 2.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Ajusta los pilares para que la esfera llegue suave y se detenga dentro del receptor, sin salirse.',
      'Adjust the pillars so the sphere arrives gently and stops inside the catcher, without rolling out.',
      'Ajusta els pilars perquè l’esfera arribi suau i s’aturi dins del receptor, sense sortir-se’n.',
      'Axusta os piares para que a esfera chegue suave e se deteña dentro do receptor, sen saír.',
    ),
    transferQuestion: adult(
      'Si pones el tramo rugoso al final, ¿la esfera para antes o después?',
      'If you put the rough stretch at the end, does the sphere stop sooner or later?',
      'Si poses el tram rugós al final, l’esfera para abans o després?',
      'Se pos o tramo rugoso ao final, a esfera para antes ou despois?',
    ),
  },
};

const CYCLE_WITH_LUA: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Lúa espera en la placa RECEPTOR, al pie de la rampa. La esfera todavía está arriba. Espera cinco segundos en silencio antes de soltarla.',
      'Lúa waits on the RECEPTOR plate, at the foot of the ramp. The sphere is still up high. Wait five seconds in silence before letting it go.',
      'La Lúa espera a la placa RECEPTOR, al peu de la rampa. L’esfera encara és a dalt. Espera cinc segons en silenci abans de deixar-la anar.',
      'Lúa agarda na placa RECEPTOR, ao pé da rampla. A esfera aínda está arriba. Agarda cinco segundos en silencio antes de soltala.',
    ),
    socraticQuestion: adult(
      '¿Llegará antes por la rampa alta o por la rugosa?',
      'Will it arrive sooner on the high ramp or on the rough one?',
      'Arribarà abans per la rampa alta o per la rugosa?',
      'Chegará antes pola rampla alta ou pola rugosa?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Primero una bajada, después otra más corta en el tiempo. Lúa cambia de cara al compararlas. El háptico corto suena solo cuando la esfera toca el tope. Tú confirmas con el botón.',
      'First one run, then another that takes less time. Lúa changes face when they are compared. The short haptic sounds only when the sphere touches the stop. You confirm with the button.',
      'Primer una baixada, després una altra més curta en el temps. La Lúa canvia de cara en comparar-les. L’hàptic curt sona només quan l’esfera toca el topall. Tu confirmes amb el botó.',
      'Primeiro unha baixada, despois outra máis curta no tempo. Lúa cambia de cara ao comparalas. O háptico curto soa só cando a esfera toca o tope. Ti confirmas co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Esta vez tardó menos que la anterior?',
        'Did this one take less time than the one before?',
        'Aquesta vegada ha trigat menys que l’anterior?',
        'Esta vez tardou menos que a anterior?',
      ),
      level2PhysicalModel: adult(
        'Deja la esfera quieta arriba, mira a Lúa en el receptor y suéltala sin empujarla.',
        'Leave the sphere still at the top, look at Lúa in the catcher, and let it go without a push.',
        'Deixa l’esfera quieta a dalt, mira la Lúa al receptor i deixa-la anar sense empènyer-la.',
        'Deixa a esfera quieta arriba, mira a Lúa no receptor e sóltaa sen empurrala.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Monta una rampa en la que la esfera pare justo en el receptor, delante de Lúa.',
      'Build a ramp on which the sphere stops right in the catcher, in front of Lúa.',
      'Munta una rampa en què l’esfera pari just al receptor, davant de la Lúa.',
      'Monta unha rampla na que a esfera pare xusto no receptor, diante de Lúa.',
    ),
    transferQuestion: adult(
      'Si la segunda bajada tarda más, ¿Lúa celebra o se queda en calma?',
      'If the second run takes longer, does Lúa celebrate or stay calm?',
      'Si la segona baixada triga més, la Lúa celebra o es queda en calma?',
      'Se a segunda baixada tarda máis, Lúa celebra ou queda en calma?',
    ),
  },
};

const METHODS: DetectionMethod[] = ['marker', 'tracked_object', 'adult_tap'];

export const SET_SOLO: SteamActivity = {
  id: 'AR-S03',
  worldId: 'S3',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: METHODS,
  childSpeech: speech(
    '¡Torre alta! ¡Rueda abajo! ¡Rápido, lento, para!',
    'Torre alta! Roda abaixo! Rápido, amodo, para!',
    'Dorre altua! Jaitsi! Azkar, motel, gelditu!',
    '¡Torre alta! ¡Rueda hacia abajo! ¡Rápido, lento, para!',
    'High tower! Roll down! Fast, slow, stop!',
    'Torre alta! Baixa rodant! Ràpid, lent, atura’t!',
  ),
  englishTpr: 'High tower! Roll down! Fast, slow, stop!',
  cycle: CYCLE_SOLO,
  events: EVENTS,
};

export const SET_WITH_LUA: SteamActivity = {
  id: 'AR-SL03',
  worldId: 'S3',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: METHODS,
  childSpeech: speech(
    '¡Arriba está! ¡Baja por la rampa! ¿Rápido o lento?',
    'Arriba está! Baixa pola rampla! Rápido ou amodo?',
    'Goian dago! Jaitsi arrapalatik! Azkar edo motel?',
    '¡Arriba está! ¡Baja por la rampa! ¿Rápido o lento?',
    'It is up high! Roll down the ramp! Fast or slow?',
    'És a dalt! Baixa per la rampa! Ràpid o lent?',
  ),
  englishTpr: 'It is up high! Roll down the ramp! Fast or slow?',
  cycle: CYCLE_WITH_LUA,
  events: EVENTS,
};

export const MANIFEST: WorldManifest = {
  id: 'S3',
  orderIndex: 3,
  title: adult(
    'La pista de gravedad y texturas',
    'The gravity and texture track',
    'La pista de gravetat i textures',
    'A pista de gravidade e texturas',
  ),
  subtitleEn: 'Higher start, shorter time; a rough stretch slows the sphere',
  phenomenon: adult(
    'Desde un pilar más alto la esfera llega antes. El tramo rugoso le quita prisa y la curva peraltada la guía.',
    'From a higher pillar the sphere arrives sooner. The rough stretch takes away hurry and the banked curve guides it.',
    'Des d’un pilar més alt l’esfera arriba abans. El tram rugós li treu pressa i la corba peraltada la guia.',
    'Desde un piar máis alto a esfera chega antes. O tramo rugoso quítalle présa e a curva peraltada guíaa.',
  ),
  ageRange: '0-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['dimensions', 'properties', 'deictics'],
  skillAxes: ['lexicon_semantics', 'sensory_regulation'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Familia y aula, de 0 a 6 años. La persona adulta maneja la tableta.',
    'Home and classroom, ages 0 to 6. The adult handles the tablet.',
    'Família i aula, de 0 a 6 anys. La persona adulta fa servir la tauleta.',
    'Familia e aula, de 0 a 6 anos. A persoa adulta manexa a tableta.',
  ),
  udlPathways: {
    representation: adult(
      'La prisa se ve en el arco, se cuenta en el tiempo y se nombra: alto, bajo, rápido, lento, para.',
      'Hurry is seen in the arc, counted in the time, and named: high, low, fast, slow, stop.',
      'La pressa es veu a l’arc, es compta en el temps i s’anomena: alt, baix, ràpid, lent, para.',
      'A présa vese no arco, cóntase no tempo e nómease: alto, baixo, rápido, lento, para.',
    ),
    engagement: adult(
      'La predicción se hace antes de soltar. Recoger la esfera y parar es parte del juego.',
      'The prediction is made before the release. Picking up the sphere and stopping is part of the play.',
      'La predicció es fa abans de deixar anar. Recollir l’esfera i aturar-se forma part del joc.',
      'A predición faise antes de soltar. Recoller a esfera e parar forma parte do xogo.',
    ),
    expression: adult(
      'La criatura señala el pilar, suelta la esfera o espera. El adulto confirma con el botón.',
      'The child points to the pillar, lets the sphere go, or waits. The adult confirms with the button.',
      'La criatura assenyala el pilar, deixa anar l’esfera o espera. L’adult confirma amb el botó.',
      'A criatura sinala o piar, solta a esfera ou agarda. A persoa adulta confirma co botón.',
    ),
  },
  tabletStandSpec: {
    heightCm: 22,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    piece('S3-PIL-1', adult('Pilar 1', 'Pillar 1', 'Pilar 1', 'Piar 1'), 1, [330], 'marker'),
    piece('S3-PIL-2', adult('Pilar 2', 'Pillar 2', 'Pilar 2', 'Piar 2'), 1, [331], 'marker'),
    piece('S3-PIL-3', adult('Pilar 3', 'Pillar 3', 'Pilar 3', 'Piar 3'), 1, [332], 'marker'),
    piece('S3-PIL-4', adult('Pilar 4', 'Pillar 4', 'Pilar 4', 'Piar 4'), 1, [333], 'marker'),
    piece('S3-PIL-5', adult('Pilar 5', 'Pillar 5', 'Pilar 5', 'Piar 5'), 1, [334], 'marker'),
    piece('S3-PIL-6', adult('Pilar 6', 'Pillar 6', 'Pilar 6', 'Piar 6'), 1, [335], 'marker'),
    piece('S3-BIS-G', adult('Bisagra', 'Hinge', 'Frontissa', 'Bisagra'), 1, [336], 'marker'),
    piece('S3-FRI-G', adult('Tramo rugoso', 'Rough stretch', 'Tram rugós', 'Tramo rugoso'), 1, [337], 'marker'),
    piece('S3-CUR-PER-G', adult('Curva peraltada', 'Banked curve', 'Corba peraltada', 'Curva peraltada'), 1, [338], 'marker'),
    piece('S3-REC-G', adult('Receptor', 'Catcher', 'Receptor', 'Receptor'), 1, [339], 'marker'),
    piece('S3-ESF-LIS-G', adult('Esfera lisa', 'Smooth sphere', 'Esfera llisa', 'Esfera lisa'), 2, [33, 340], 'tracked_object'),
    piece('S3-ESF-RUG-G', adult('Esfera rugosa', 'Rough sphere', 'Esfera rugosa', 'Esfera rugosa'), 2, [341, 342], 'tracked_object'),
  ],
  events: EVENTS,
  challenges: [
    {
      id: 'S3-C1',
      number: 1,
      title: adult('Cada bajada, menos tiempo', 'Each run, less time', 'Cada baixada, menys temps', 'Cada baixada, menos tempo'),
      ageBand: '4-5',
      neuroStage: 'I4',
      estimatedMinutes: 12,
      scale: 'G',
      skillAxes: ['lexicon_semantics', 'sensory_regulation'],
      targetEvents: ['S3.ESFERA_ARRIBA', 'S3.SALIDA_ANTICIPADA', 'S3.LLEGADA_RAPIDA', 'S3.LLEGADA_LENTA', 'S3.SE_PARA'],
      cycle: CYCLE_WITH_LUA,
      achievementCriterion: adult(
        'La bajada siguiente tarda menos que la anterior, y la esfera para dentro del receptor. El adulto confirma con el botón.',
        'The next run takes less time than the one before, and the sphere stops inside the catcher. The adult confirms with the button.',
        'La baixada següent triga menys que l’anterior, i l’esfera para dins del receptor. L’adult confirma amb el botó.',
        'A baixada seguinte tarda menos que a anterior, e a esfera para dentro do receptor. A persoa adulta confirma co botón.',
      ),
      qualitativeObservation: adult(
        'Anota si la predicción se hizo antes de soltar y si la esfera se quedó en el tope.',
        'Note whether the prediction was made before the release and whether the sphere stayed at the stop.',
        'Anota si la predicció s’ha fet abans de deixar anar i si l’esfera s’ha quedat al topall.',
        'Anota se a predición se fixo antes de soltar e se a esfera quedou no tope.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S3-CARD-ALTO',
      title: adult('Del pilar alto al receptor', 'From the high pillar to the catcher', 'Del pilar alt al receptor', 'Do piar alto ao receptor'),
      targetPieces: ['S3-PIL-6', 'S3-FRI-G', 'S3-REC-G', 'S3-ESF-LIS-G'],
    },
  ],
  revealLayer: {
    id: 'set_rampas',
    description: adult(
      'Arco de la bajada y estela que compara esta vez con la anterior, sobre la rampa.',
      'The arc of the run and a trail that compares this time with the one before, over the ramp.',
      'Arc de la baixada i estela que compara aquesta vegada amb l’anterior, sobre la rampa.',
      'Arco da baixada e estela que compara esta vez coa anterior, sobre a rampla.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: {
    songIds: ['lua_song_07'],
    gameIds: ['lua_game_15'],
  },
  story: {
    storyId: 'lua_story_06',
    anticipationMicroStory: adult(
      'La esfera espera arriba. Lúa, abajo, quiere ver si llega sola hasta su casa.',
      'The sphere waits up high. Lúa, down below, wants to see if it arrives alone at her house.',
      'L’esfera espera a dalt. La Lúa, a baix, vol veure si arriba sola fins a casa seva.',
      'A esfera agarda arriba. Lúa, abaixo, quere ver se chega soa ata a súa casa.',
    ),
    closingMicroStory: adult(
      'La esfera duerme en el receptor. Los pilares vuelven a la caja, del más alto al más bajo.',
      'The sphere sleeps in the catcher. The pillars go back in the box, tallest to shortest.',
      'L’esfera dorm al receptor. Els pilars tornen a la capsa, del més alt al més baix.',
      'A esfera dorme no receptor. Os piares volven á caixa, do máis alto ao máis baixo.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'BlockList',
      blockParam: 'lenguaje',
      connectionReason: adult(
        'En la mesa se nombran alto, bajo, rápido y lento con objetos que se pueden mover.',
        'At the table, high, low, fast, and slow are named with objects that can be moved.',
        'A la taula s’anomenen alt, baix, ràpid i lent amb objectes que es poden moure.',
        'Na mesa nómeanse alto, baixo, rápido e lento con obxectos que se poden mover.',
      ),
    },
    {
      route: 'Writing',
      connectionReason: adult(
        'El arco de la rampa se puede recorrer después con el dedo en la pizarra, de arriba abajo.',
        'The ramp’s arc can later be traced with a finger on the board, from top to bottom.',
        'L’arc de la rampa es pot recórrer després amb el dit a la pissarra, de dalt a baix.',
        'O arco da rampla pódese percorrer despois co dedo no encerado, de arriba abaixo.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S3',
};

const POSITIVE: ChallengeInput = { kind: 'descent', worldId: 'S3', timesMs: [900, 600, 400] };
const NEGATIVE: ChallengeInput = { kind: 'descent', worldId: 'S3', timesMs: [500, 500] };

export interface FoundationalReplayCase {
  readonly id: string;
  readonly polarity: TracePolarity;
  readonly frames: number;
  readonly observation: { method: DetectionMethod; pieceCode?: string; markerId?: number };
  readonly challenge: ChallengeInput;
}

export const REPLAY_CASES: readonly FoundationalReplayCase[] = [
  {
    id: 'S3-positiva',
    polarity: 'positive',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S3-ESF-LIS-G', markerId: 33 },
    challenge: POSITIVE,
  },
  {
    id: 'S3-negativa',
    polarity: 'negative',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S3-ESF-LIS-G', markerId: 33 },
    challenge: NEGATIVE,
  },
  {
    id: 'S3-oclusion-parcial',
    polarity: 'partial_occlusion',
    frames: VISUAL_STABLE_FRAMES - 1,
    observation: { method: 'marker', pieceCode: 'S3-ESF-LIS-G', markerId: 33 },
    challenge: POSITIVE,
  },
  {
    id: 'S3-adult-tap',
    polarity: 'positive',
    frames: framesRequired('adult_tap'),
    observation: { method: 'adult_tap' },
    challenge: POSITIVE,
  },
];

function assertReplay(): void {
  for (const item of REPLAY_CASES) {
    const verdict = evaluateChallenge(item.challenge);
    if (verdict.ok !== (item.polarity !== 'negative')) {
      throw new Error(`${item.id}: el motor responde ${verdict.reason}.`);
    }
  }
  if (translateExpression('expectante').index !== 16 || translateExpression('calma').index !== 7) {
    throw new Error('S3: arriba y la llegada lenta no coinciden con las caras del motor.');
  }
  const stop = EVENTS.find((item) => item.id === 'S3.SE_PARA');
  if (stop?.reaction.haptic !== 'CELEBRA_CORTO') {
    throw new Error('S3: el tope del receptor lleva el háptico corto.');
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

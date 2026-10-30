// Set 2 · Estación de sonido. SET_SOLO (AR-S02) y SET_WITH_LUA (AR-SL02).
// La pausa antes de la reacción es la del motor, y nunca baja de 1000 ms.
import { PICTO_KEYS } from '../../ValeriaPixelArt';
import {
  evaluateChallenge,
  type ChallengeInput,
} from '../engine/ChallengeEvaluator';
import { framesRequired, VISUAL_STABLE_FRAMES } from '../engine/EventStabilizer';
import { translateExpression } from '../engine/LuaLink';
import type { TracePolarity } from '../engine/ObservationReplay';
import { SET2_PAUSE_BEFORE_REACTION_MS } from '../engine/ReactionSequencer';
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

const S2_PAUSE_MS = Math.max(1000, SET2_PAUSE_BEFORE_REACTION_MS);

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
  'Pieza de mesa. La coloca y la guarda la persona adulta. El golpe lo suelta la mano, no la boca sobre la pieza.',
  'Table piece. The adult places it and puts it away. The hand lets the hammer fall; the mouth does not touch the piece.',
  'Peça de taula. La posa i la desa la persona adulta. El cop el deixa anar la mà, no la boca sobre la peça.',
  'Peza de mesa. Colócaa e gárdaa a persoa adulta. O golpe sóltao a man, non a boca sobre a peza.',
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

function ev(input: WorldEventSpec): WorldEventSpec {
  if (!input.methods.includes('adult_tap')) throw new Error(`${input.id}: falta adult_tap.`);
  const pause = Math.max(S2_PAUSE_MS, input.pauseBeforeReactionMs ?? 0);
  if (pause < 1000) throw new Error(`${input.id}: la pausa de S2 es menor que 1000 ms.`);
  return { ...input, pauseBeforeReactionMs: pause };
}

const PAUSE_HINT: AdultText = adult(
  `Después del golpe, la tableta espera ${S2_PAUSE_MS} ms en silencio antes de reaccionar.`,
  `After the strike, the tablet waits ${S2_PAUSE_MS} ms in silence before it reacts.`,
  `Després del cop, la tauleta espera ${S2_PAUSE_MS} ms en silenci abans de reaccionar.`,
  `Despois do golpe, a tableta agarda ${S2_PAUSE_MS} ms en silencio antes de reaccionar.`,
);

const EVENTS: WorldEventSpec[] = [
  ev({
    id: 'S2.RESONADOR_COLOCADO',
    title: adult('Resonador colocado', 'Resonator placed', 'Ressonador col·locat', 'Resoador colocado'),
    childAction: adult(
      'La criatura coloca un cilindro en la cuna, del grave al agudo.',
      'The child places a cylinder in the cradle, from low to high.',
      'La criatura col·loca un cilindre al bressol, del greu a l’agut.',
      'A criatura coloca un cilindro no berce, do grave ao agudo.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    pauseBeforeReactionMs: S2_PAUSE_MS,
    reaction: {
      expression: 'atenta',
      light: 'TENUE_CUATRO',
      haptic: 'METRONOMO_LENTO',
      screenOverlay: 'VISUAL_METRONOME',
    },
    word: {
      englishTpr: 'Big and low!',
      adultHint: PAUSE_HINT,
      spatialCategory: 'dimensions',
    },
  }),
  ev({
    id: 'S2.GOLPE_FUERTE',
    title: adult('Golpe fuerte', 'Strong strike', 'Cop fort', 'Golpe forte'),
    childAction: adult(
      'La criatura suelta el brazo desde arriba sobre el resonador.',
      'The child lets the arm fall from up high onto the resonator.',
      'La criatura deixa anar el braç des de dalt sobre el ressonador.',
      'A criatura solta o brazo desde arriba sobre o resoador.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    pauseBeforeReactionMs: S2_PAUSE_MS,
    reaction: {
      expression: 'alegre',
      pictoKey: picto('tambora'),
      light: 'APAGADO',
      haptic: 'APAGADO',
      screenOverlay: 'VISUAL_METRONOME',
    },
    word: {
      englishTpr: 'Big and low!',
      adultHint: adult('Fuerte: el brazo cae desde más alto.', 'Strong: the arm falls from higher up.', 'Fort: el braç cau des de més amunt.', 'Forte: o brazo cae desde máis alto.'),
      spatialCategory: 'properties',
    },
  }),
  ev({
    id: 'S2.GOLPE_DEBIL',
    title: adult('Golpe suave', 'Soft strike', 'Cop suau', 'Golpe suave'),
    childAction: adult(
      'La criatura suelta el brazo desde poco altura.',
      'The child lets the arm fall from a short height.',
      'La criatura deixa anar el braç des de poca alçada.',
      'A criatura solta o brazo desde pouca altura.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    pauseBeforeReactionMs: S2_PAUSE_MS,
    reaction: {
      expression: 'calma',
      pictoKey: picto('tambora'),
      light: 'APAGADO',
      haptic: 'APAGADO',
      screenOverlay: 'VISUAL_METRONOME',
    },
    word: {
      englishTpr: 'Small and high!',
      adultHint: adult('Suave: el brazo cae desde más bajo.', 'Soft: the arm falls from lower down.', 'Suau: el braç cau des de més avall.', 'Suave: o brazo cae desde máis baixo.'),
      spatialCategory: 'properties',
    },
  }),
  ev({
    id: 'S2.RASPADO_COMPLETO',
    title: adult('Raspado completo', 'Full scrape', 'Raspat complet', 'Raspado completo'),
    childAction: adult(
      'La criatura raspa el guiro de un extremo al otro, despacio.',
      'The child scrapes the guiro from one end to the other, slowly.',
      'La criatura raspa el guiro d’un extrem a l’altre, a poc a poc.',
      'A criatura raspa o guiro dun extremo ao outro, amodo.',
    ),
    methods: ['hand', 'marker', 'adult_tap'],
    turn: 'motor',
    pauseBeforeReactionMs: S2_PAUSE_MS,
    reaction: {
      expression: 'animo',
      pictoKey: picto('maracas'),
      light: 'APAGADO',
      haptic: 'APAGADO',
      screenOverlay: 'VISUAL_METRONOME',
    },
    word: {
      englishTpr: 'Scrape slow!',
      adultHint: PAUSE_HINT,
      spatialCategory: 'pattern',
    },
  }),
  ev({
    id: 'S2.PULSO_SEGUIDO',
    title: adult('Pulso seguido', 'Pulse followed', 'Pols seguit', 'Pulso seguido'),
    childAction: adult(
      'La criatura repite grave y agudo siguiendo las luces mudas de la tableta.',
      'The child repeats low and high, following the tablet’s silent lights.',
      'La criatura repeteix greu i agut seguint els llums muts de la tauleta.',
      'A criatura repite grave e agudo seguindo as luces mudas da tableta.',
    ),
    methods: ['marker', 'hand', 'adult_tap'],
    turn: 'motor',
    pauseBeforeReactionMs: S2_PAUSE_MS,
    reaction: {
      expression: 'celebra_nivel',
      light: 'APAGADO',
      haptic: 'APAGADO',
      screenOverlay: 'VISUAL_METRONOME',
    },
    word: {
      englishTpr: 'Scrape slow!',
      adultHint: adult(
        'El pulso se ve. No suena un clic de la tableta encima del resonador.',
        'The pulse is seen. The tablet does not click over the resonator.',
        'El pols es veu. La tauleta no fa un clic sobre el ressonador.',
        'O pulso vese. A tableta non fai un clic enriba do resoador.',
      ),
      spatialCategory: 'pattern',
    },
  }),
];

const CYCLE_SOLO: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      `Suelta el brazo sobre el resonador rojo grande y, después, sobre el azul pequeño. La tableta espera ${S2_PAUSE_MS} ms en silencio y solo entonces dibuja la onda. Antes, cinco segundos sin hablar.`,
      `Let the arm fall on the large red resonator and then on the small blue one. The tablet waits ${S2_PAUSE_MS} ms in silence and only then draws the wave. Before that, five seconds without talking.`,
      `Deixa anar el braç sobre el ressonador vermell gran i, després, sobre el blau petit. La tauleta espera ${S2_PAUSE_MS} ms en silenci i només aleshores dibuixa l’ona. Abans, cinc segons sense parlar.`,
      `Solta o brazo sobre o resoador vermello grande e, despois, sobre o azul pequeno. A tableta agarda ${S2_PAUSE_MS} ms en silencio e só entón debuxa a onda. Antes, cinco segundos sen falar.`,
    ),
    socraticQuestion: adult(
      '¿Cuál suena más grave, el cilindro grande o el pequeño?',
      'Which sounds lower, the large cylinder or the small one?',
      'Quin sona més greu, el cilindre gran o el petit?',
      'Cal soa máis grave, o cilindro grande ou o pequeno?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Ordena los cilindros de grave a agudo: rojo grande, amarillo medio, azul pequeño. Raspa el guiro siguiendo el metrónomo mudo. Tú confirmas con el botón después del silencio.',
      'Order the cylinders from low to high: large red, medium yellow, small blue. Scrape the guiro with the silent metronome. You confirm with the button after the silence.',
      'Ordena els cilindres de greu a agut: vermell gran, groc mitjà, blau petit. Raspa el guiro seguint el metrònom mut. Tu confirmes amb el botó després del silenci.',
      'Ordena os cilindros de grave a agudo: vermello grande, amarelo medio, azul pequeno. Raspa o guiro seguindo o metrónomo mudo. Ti confirmas co botón despois do silencio.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Este cilindro es grande o pequeño?',
        'Is this cylinder large or small?',
        'Aquest cilindre és gran o petit?',
        'Este cilindro é grande ou pequeno?',
      ),
      level2PhysicalModel: adult(
        'Pon el rojo a la izquierda y el azul a la derecha. Suelta el brazo y cuenta el silencio antes de hablar.',
        'Put the red one on the left and the blue one on the right. Let the arm fall and count the silence before speaking.',
        'Posa el vermell a l’esquerra i el blau a la dreta. Deixa anar el braç i compta el silenci abans de parlar.',
        'Pon o vermello á esquerda e o azul á dereita. Solta o brazo e conta o silencio antes de falar.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Monta una partitura en la mesa: golpe grave, raspado, golpe grave, raspado.',
      'Lay a score on the table: low strike, scrape, low strike, scrape.',
      'Munta una partitura a la taula: cop greu, raspat, cop greu, raspat.',
      'Monta unha partitura na mesa: golpe grave, raspado, golpe grave, raspado.',
    ),
    transferQuestion: adult(
      'Si el cilindro es más pequeño, ¿el sonido sube o baja?',
      'If the cylinder is smaller, does the sound go up or down?',
      'Si el cilindre és més petit, el so puja o baixa?',
      'Se o cilindro é máis pequeno, o son sobe ou baixa?',
    ),
  },
};

const CYCLE_WITH_LUA: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      `Lúa está en la placa ESCUCHA. Suelta el brazo y deja ${S2_PAUSE_MS} ms de silencio: ni la tableta ni Lúa tapan el resonador. Los cinco segundos de antes también son en silencio.`,
      `Lúa is on the ESCUCHA plate. Let the arm fall and leave ${S2_PAUSE_MS} ms of silence: neither the tablet nor Lúa covers the resonator. The five seconds before that are silent too.`,
      `La Lúa és a la placa ESCUCHA. Deixa anar el braç i deixa ${S2_PAUSE_MS} ms de silenci: ni la tauleta ni la Lúa tapen el ressonador. Els cinc segons d’abans també són en silenci.`,
      `Lúa está na placa ESCUCHA. Solta o brazo e deixa ${S2_PAUSE_MS} ms de silencio: nin a tableta nin Lúa tapan o resoador. Os cinco segundos de antes tamén son en silencio.`,
    ),
    socraticQuestion: adult(
      '¿Oyes el golpe entero antes de que Lúa cambie de cara?',
      'Do you hear the whole strike before Lúa changes face?',
      'Sents el cop sencer abans que la Lúa canviï de cara?',
      'Oes o golpe enteiro antes de que Lúa cambie de cara?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Un golpe fuerte y otro suave, con el silencio entre los dos. El pulso se sigue con las luces mudas, no con un clic. Tú confirmas con el botón cuando el silencio ya pasó.',
      'One strong strike and one soft strike, with the silence between them. The pulse is followed with silent lights, not with a click. You confirm with the button once the silence has passed.',
      'Un cop fort i un de suau, amb el silenci entre els dos. El pols se segueix amb els llums muts, no amb un clic. Tu confirmes amb el botó quan el silenci ja ha passat.',
      'Un golpe forte e outro suave, co silencio entre os dous. O pulso séguiese coas luces mudas, non cun clic. Ti confirmas co botón cando o silencio xa pasou.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Este golpe fue fuerte o suave?',
        'Was this strike strong or soft?',
        'Aquest cop ha estat fort o suau?',
        'Este golpe foi forte ou suave?',
      ),
      level2PhysicalModel: adult(
        'Levanta el brazo más alto para el fuerte y déjalo cerca para el suave. Cuenta el silencio con los dedos, sin hablar.',
        'Lift the arm higher for the strong strike and leave it close for the soft one. Count the silence on your fingers, without talking.',
        'Aixeca el braç més amunt per al fort i deixa’l a prop per al suau. Compta el silenci amb els dits, sense parlar.',
        'Levanta o brazo máis alto para o forte e déixao preto para o suave. Conta o silencio cos dedos, sen falar.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Con Lúa en ESCUCHA, repetid grave, raspado, grave, raspado, y dejad el silencio después de cada golpe.',
      'With Lúa on ESCUCHA, repeat low, scrape, low, scrape, and leave the silence after each strike.',
      'Amb la Lúa a ESCUCHA, repetiu greu, raspat, greu, raspat, i deixeu el silenci després de cada cop.',
      'Con Lúa en ESCUCHA, repetide grave, raspado, grave, raspado, e deixade o silencio despois de cada golpe.',
    ),
    transferQuestion: adult(
      '¿Lúa cambia de cara mientras el resonador todavía suena, o después del silencio?',
      'Does Lúa change face while the resonator is still sounding, or after the silence?',
      'La Lúa canvia de cara mentre el ressonador encara sona, o després del silenci?',
      'Lúa cambia de cara mentres o resoador aínda soa, ou despois do silencio?',
    ),
  },
};

const METHODS: DetectionMethod[] = ['marker', 'hand', 'adult_tap'];

export const SET_SOLO: SteamActivity = {
  id: 'AR-S02',
  worldId: 'S2',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: METHODS,
  childSpeech: speech(
    '¡Grande y grave! ¡Pequeño y agudo! ¡Raspa despacio!',
    'Grande e grave! Pequeno e agudo! Raspa amodo!',
    'Handia eta baxua! Txikia eta altua! Marraskatu poliki!',
    '¡Grande y grave! ¡Chiquito y agudo! ¡Raspa despacito!',
    'Big and low! Small and high! Scrape slow!',
    'Gran i greu! Petit i agut! Raspa a poc a poc!',
  ),
  englishTpr: 'Big and low! Small and high! Scrape slow!',
  cycle: CYCLE_SOLO,
  events: EVENTS,
};

export const SET_WITH_LUA: SteamActivity = {
  id: 'AR-SL02',
  worldId: 'S2',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: METHODS,
  childSpeech: speech(
    '¡Escucha el eco! ¡Después del golpe!',
    'Escoita o eco! Despois do golpe!',
    'Entzun oihartzuna! Itxaron kolpearen ondoren!',
    '¡Escucha el eco! ¡Después del golpe!',
    'Listen for the echo! After the strike!',
    'Escolta l’eco! Després del cop!',
  ),
  englishTpr: 'Listen for the echo! After the strike!',
  cycle: CYCLE_WITH_LUA,
  events: EVENTS,
};

export const MANIFEST: WorldManifest = {
  id: 'S2',
  orderIndex: 2,
  title: adult(
    'El laboratorio de ondas y cavidades',
    'The wave and cavity lab',
    'El laboratori d’ones i cavitats',
    'O laboratorio de ondas e cavidades',
  ),
  subtitleEn: 'Cavity size sets the pitch; hammer height sets the strength',
  phenomenon: adult(
    'El rojo grande suena grave, el amarillo medio y el azul pequeño agudo. El brazo, al caer de más alto, golpea más fuerte.',
    'The large red one sounds low, the yellow one in the middle, and the small blue one high. The arm, falling from higher up, strikes harder.',
    'El vermell gran sona greu, el groc al mig i el blau petit agut. El braç, en caure de més amunt, colpeja més fort.',
    'O vermello grande soa grave, o amarelo no medio e o azul pequeno agudo. O brazo, ao caer de máis alto, golpea máis forte.',
  ),
  ageRange: '0-6',
  scaleSummary: 'E',
  prioritySpatialCategories: ['dimensions', 'properties', 'pattern'],
  skillAxes: ['auditory_perception', 'phonology_speech'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Familia y aula, de 0 a 6 años. La persona adulta maneja la tableta. El pulso se ve y no se oye.',
    'Home and classroom, ages 0 to 6. The adult handles the tablet. The pulse is seen and not heard.',
    'Família i aula, de 0 a 6 anys. La persona adulta fa servir la tauleta. El pols es veu i no se sent.',
    'Familia e aula, de 0 a 6 anos. A persoa adulta manexa a tableta. O pulso vese e non se oe.',
  ),
  udlPathways: {
    representation: adult(
      'El tono se oye en el cilindro, se ve en el tamaño y se dibuja en anillos después del silencio.',
      'Pitch is heard in the cylinder, seen in the size, and drawn as rings after the silence.',
      'El to se sent al cilindre, es veu en la mida i es dibuixa en anells després del silenci.',
      'O ton óese no cilindro, vese no tamaño e debúxase en aneis despois do silencio.',
    ),
    engagement: adult(
      'Quien lleva audífono o implante sigue el pulso con la vista. Parar el brazo es parte del juego.',
      'Someone with a hearing aid or an implant follows the pulse by sight. Stopping the arm is part of the play.',
      'Qui porta audiòfon o implant segueix el pols amb la vista. Aturar el braç forma part del joc.',
      'Quen leva audífono ou implante segue o pulso coa vista. Parar o brazo forma parte do xogo.',
    ),
    expression: adult(
      'La criatura golpea, raspa o señala el cilindro. Puede no decir la palabra. El adulto confirma con el botón.',
      'The child strikes, scrapes, or points to the cylinder. The word can stay unspoken. The adult confirms with the button.',
      'La criatura colpeja, raspa o assenyala el cilindre. Pot no dir la paraula. L’adult confirma amb el botó.',
      'A criatura golpea, raspa ou sinala o cilindro. Pode non dicir a palabra. A persoa adulta confirma co botón.',
    ),
  },
  tabletStandSpec: {
    heightCm: 22,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    piece('S2-BAL-BRAZO-E', adult('Brazo percutor', 'Hammer arm', 'Braç percussor', 'Brazo percutor'), 1, [22], 'marker'),
    piece('S2-RES-ROJ', adult('Resonador rojo, tres tamaños', 'Red resonator, three sizes', 'Ressonador vermell, tres mides', 'Resoador vermello, tres tamaños'), 3, [220, 221, 222], 'marker'),
    piece('S2-RES-AMA', adult('Resonador amarillo, tres tamaños', 'Yellow resonator, three sizes', 'Ressonador groc, tres mides', 'Resoador amarelo, tres tamaños'), 3, [223, 224, 225], 'marker'),
    piece('S2-RES-AZU', adult('Resonador azul, tres tamaños', 'Blue resonator, three sizes', 'Ressonador blau, tres mides', 'Resoador azul, tres tamaños'), 3, [226, 227, 228], 'marker'),
    piece('S2-RAS-E', adult('Raspador guiro', 'Guiro scraper', 'Rascador guiro', 'Raspador guiro'), 2, [229, 230], 'hand'),
  ],
  events: EVENTS,
  challenges: [
    {
      id: 'S2-C1',
      number: 1,
      title: adult('Grave, agudo, fuerte y suave', 'Low, high, strong, and soft', 'Greu, agut, fort i suau', 'Grave, agudo, forte e suave'),
      ageBand: '3-4',
      neuroStage: 'I4',
      estimatedMinutes: 12,
      scale: 'E',
      skillAxes: ['auditory_perception', 'phonology_speech'],
      targetEvents: ['S2.RESONADOR_COLOCADO', 'S2.GOLPE_FUERTE', 'S2.GOLPE_DEBIL', 'S2.RASPADO_COMPLETO', 'S2.PULSO_SEGUIDO'],
      cycle: CYCLE_WITH_LUA,
      achievementCriterion: adult(
        `Hay un golpe fuerte y otro suave, con ritmo estable, y ${S2_PAUSE_MS} ms de silencio antes de cada reacción. El adulto confirma con el botón.`,
        `There is one strong strike and one soft strike, with a steady rhythm, and ${S2_PAUSE_MS} ms of silence before each reaction. The adult confirms with the button.`,
        `Hi ha un cop fort i un de suau, amb ritme estable, i ${S2_PAUSE_MS} ms de silenci abans de cada reacció. L’adult confirma amb el botó.`,
        `Hai un golpe forte e outro suave, con ritmo estable, e ${S2_PAUSE_MS} ms de silencio antes de cada reacción. A persoa adulta confirma co botón.`,
      ),
      qualitativeObservation: adult(
        'Anota si el silencio se respeta o si alguien habla encima del resonador.',
        'Note whether the silence is kept or someone talks over the resonator.',
        'Anota si el silenci es respecta o si algú parla sobre el ressonador.',
        'Anota se o silencio se respecta ou se alguén fala enriba do resoador.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S2-CARD-ABAB',
      title: adult('Partitura grave y raspado', 'Low-and-scrape score', 'Partitura greu i raspat', 'Partitura grave e raspado'),
      targetPieces: ['S2-RES-ROJ', 'S2-RAS-E', 'S2-BAL-BRAZO-E'],
    },
  ],
  revealLayer: {
    id: 'set_sonido',
    description: adult(
      'Anillos anchos en los graves y anillos cerrados en los agudos, más un metrónomo mudo en pantalla.',
      'Wide rings for low sounds and tight rings for high sounds, plus a silent on-screen metronome.',
      'Anells amples en els greus i anells tancats en els aguts, més un metrònom mut a la pantalla.',
      'Aneis anchos nos graves e aneis pechos nos agudos, máis un metrónomo mudo na pantalla.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: {
    songIds: ['lua_song_04', 'lua_song_05'],
    gameIds: ['lua_game_11', 'lua_game_02'],
  },
  story: {
    storyId: 'lua_story_01',
    anticipationMicroStory: adult(
      'Lúa quiere oír el eco de la mesa. Primero el golpe, después el silencio, y solo entonces la cara.',
      'Lúa wants to hear the echo on the table. First the strike, then the silence, and only then the face.',
      'La Lúa vol sentir l’eco de la taula. Primer el cop, després el silenci, i només aleshores la cara.',
      'Lúa quere oír o eco da mesa. Primeiro o golpe, despois o silencio, e só entón a cara.',
    ),
    closingMicroStory: adult(
      'Los cilindros vuelven a su fila, del grande al pequeño, y el brazo se acuesta en la cuna.',
      'The cylinders go back in a row, large to small, and the arm lies down in the cradle.',
      'Els cilindres tornen a la seva fila, del gran al petit, i el braç s’ajeu al bressol.',
      'Os cilindros volven á súa fila, do grande ao pequeno, e o brazo déitase no berce.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'SensoryBlockList',
      blockParam: 'audicion',
      connectionReason: adult(
        'En la mesa se vuelven a escuchar sonidos suaves y fuertes, con la persona adulta al mando del botón de parar.',
        'At the table, soft and strong sounds are heard again, with the adult in charge of the stop button.',
        'A la taula es tornen a escoltar sons suaus i forts, amb la persona adulta al comandament del botó d’aturar.',
        'Na mesa vólvense escoitar sons suaves e fortes, coa persoa adulta ao mando do botón de parar.',
      ),
    },
    {
      route: 'MinimalPairs',
      connectionReason: adult(
        'El contraste grave y agudo de los cilindros se nombra también con pares de palabras en la mesa.',
        'The low and high contrast of the cylinders is also named with word pairs at the table.',
        'El contrast greu i agut dels cilindres també s’anomena amb parelles de paraules a la taula.',
        'O contraste grave e agudo dos cilindros nómease tamén con pares de palabras na mesa.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S2',
};

const POSITIVE: ChallengeInput = {
  kind: 'percussor',
  worldId: 'S2',
  strikes: [
    { angleDeg: 60, tMs: 0 },
    { angleDeg: 20, tMs: 500 },
    { angleDeg: 60, tMs: 1000 },
    { angleDeg: 20, tMs: 1500 },
  ],
  pattern: ['fuerte', 'debil', 'fuerte', 'debil'],
};

const NEGATIVE: ChallengeInput = {
  kind: 'percussor',
  worldId: 'S2',
  strikes: [
    { angleDeg: 60, tMs: 0 },
    { angleDeg: 20, tMs: 100 },
    { angleDeg: 60, tMs: 1000 },
  ],
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
    id: 'S2-positiva',
    polarity: 'positive',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S2-BAL-BRAZO-E', markerId: 22 },
    challenge: POSITIVE,
  },
  {
    id: 'S2-negativa',
    polarity: 'negative',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S2-BAL-BRAZO-E', markerId: 22 },
    challenge: NEGATIVE,
  },
  {
    id: 'S2-oclusion-parcial',
    polarity: 'partial_occlusion',
    frames: VISUAL_STABLE_FRAMES - 1,
    observation: { method: 'marker', pieceCode: 'S2-BAL-BRAZO-E', markerId: 22 },
    challenge: POSITIVE,
  },
  {
    id: 'S2-adult-tap',
    polarity: 'positive',
    frames: framesRequired('adult_tap'),
    observation: { method: 'adult_tap' },
    challenge: POSITIVE,
  },
];

function assertReplay(): void {
  if (S2_PAUSE_MS < 1000 || SET2_PAUSE_BEFORE_REACTION_MS < 1000) {
    throw new Error('S2: la pausa del motor es menor que 1000 ms.');
  }
  for (const item of EVENTS) {
    if ((item.pauseBeforeReactionMs ?? 0) < 1000) {
      throw new Error(`${item.id}: falta la pausa de 1000 ms.`);
    }
  }
  const pre = EVENTS.filter((item) => item.reaction.haptic === 'METRONOMO_LENTO');
  if (pre.length !== 1 || pre[0]?.id !== 'S2.RESONADOR_COLOCADO') {
    throw new Error('S2: el metrónomo háptico solo va en la fase previa al golpe.');
  }
  for (const item of REPLAY_CASES) {
    const verdict = evaluateChallenge(item.challenge);
    if (verdict.ok !== (item.polarity !== 'negative')) {
      throw new Error(`${item.id}: el motor responde ${verdict.reason}.`);
    }
  }
  if (translateExpression('alegre').index !== 10 || translateExpression('calma').index !== 7) {
    throw new Error('S2: el golpe fuerte y el suave no coinciden con las caras del motor.');
  }
  if (translateExpression('celebra_nivel').index !== 5) {
    throw new Error('S2: el pulso tiene que ir a la cara #5.');
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

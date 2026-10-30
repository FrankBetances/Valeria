// Set 1 · Camino. SET_SOLO (AR-S01) y SET_WITH_LUA (AR-SL01).
// El grafo vale si es continuo y cada giro es recto o de 90°, como el motor.
import { PICTO_KEYS } from '../../ValeriaPixelArt';
import {
  evaluateChallenge,
  type ChallengeInput,
  type PathGraph,
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
  'Pieza de mesa. La coloca y la guarda la persona adulta.',
  'Table piece. The adult places it and puts it away.',
  'Peça de taula. La posa i la desa la persona adulta.',
  'Peza de mesa. Colócaa e gárdaa a persoa adulta.',
);

function piece(
  code: string,
  name: AdultText,
  quantity: number,
  instanceMarkerIds: number[],
): WorldPieceSpec {
  return {
    code,
    name,
    quantity,
    scale: 'G',
    instanceMarkerIds,
    detectionMethod: 'marker',
    safetyNotes: SAFE,
  };
}

function ev(input: WorldEventSpec): WorldEventSpec {
  if (!input.methods.includes('adult_tap')) throw new Error(`${input.id}: falta adult_tap.`);
  if (input.isErrorOrBlockedState === true) {
    if (input.reaction.light !== 'APAGADO' || input.reaction.haptic !== 'APAGADO') {
      throw new Error(`${input.id}: el camino cortado va con luz y háptico apagados.`);
    }
  }
  return input;
}

const EVENTS: WorldEventSpec[] = [
  ev({
    id: 'S1.LUA_EN_INICIO',
    title: adult('En el inicio', 'At the start', 'A l’inici', 'No inicio'),
    childAction: adult(
      'La criatura pone a Lúa, o la ficha de salida, sobre la baldosa INICIO.',
      'The child puts Lúa, or the start token, on the INICIO tile.',
      'La criatura posa la Lúa, o la fitxa de sortida, sobre la rajola INICIO.',
      'A criatura pon a Lúa, ou a ficha de saída, sobre a lousa INICIO.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'atenta',
      pictoKey: picto('senalar'),
      light: 'DIR_DELANTE',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Connect the path!',
      adultHint: adult('Primero va el inicio.', 'First comes the start.', 'Primer va l’inici.', 'Primeiro vai o inicio.'),
      spatialCategory: 'position',
    },
  }),
  ev({
    id: 'S1.LUA_AVANZA',
    title: adult('Avanza', 'Moves ahead', 'Avança', 'Avanza'),
    childAction: adult(
      'La criatura desliza el patín por la ranura hasta la baldosa siguiente.',
      'The child slides the skate along the groove to the next tile.',
      'La criatura fa lliscar el patí per la ranura fins a la rajola següent.',
      'A criatura desliza o patín pola rañura ata a lousa seguinte.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'animo',
      pictoKey: picto('correr'),
      light: 'DIR_DELANTE',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Connect the path!',
      adultHint: adult('Después de una baldosa, la siguiente.', 'After one tile, the next.', 'Després d’una rajola, la següent.', 'Despois dunha lousa, a seguinte.'),
      spatialCategory: 'position',
    },
  }),
  ev({
    id: 'S1.LUA_GIRA',
    title: adult('Gira', 'Turns', 'Gira', 'Xira'),
    childAction: adult(
      'La criatura coloca la curva y gira el patín un cuarto de vuelta.',
      'The child places the curve and turns the skate a quarter turn.',
      'La criatura col·loca la corba i gira el patí un quart de volta.',
      'A criatura coloca a curva e xira o patín un cuarto de volta.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'animo',
      pictoKey: picto('senalar'),
      light: 'DIR_IZQ',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Turn!',
      adultHint: adult(
        'Gira a la izquierda. La ficha de la derecha usa la luz hacia el otro lado.',
        'Turn left. The right-hand token uses the light toward the other side.',
        'Gira a l’esquerra. La fitxa de la dreta fa servir la llum cap a l’altre costat.',
        'Xira á esquerda. A ficha da dereita usa a luz cara ao outro lado.',
      ),
      spatialCategory: 'orientation',
    },
  }),
  ev({
    id: 'S1.CAMINO_ROTO',
    title: adult('Camino cortado', 'Path broken', 'Camí tallat', 'Camiño cortado'),
    childAction: adult(
      'Falta una baldosa. La criatura espera sin empujar al vacío.',
      'A tile is missing. The child waits and does not push into the gap.',
      'Falta una rajola. La criatura espera sense empènyer al buit.',
      'Falta unha lousa. A criatura agarda sen empurrar ao baleiro.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    isErrorOrBlockedState: true,
    reaction: {
      expression: 'espera_serena',
      light: 'APAGADO',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Connect the path!',
      adultHint: adult(
        'Si falta un tramo, se espera. No es un fallo: el río de luz se detiene en el borde.',
        'If a stretch is missing, wait. It is not a miss: the river of light stops at the edge.',
        'Si falta un tram, s’espera. No és una errada: el riu de llum s’atura a la vora.',
        'Se falta un tramo, agárdase. Non é un fallo: o río de luz detense no bordo.',
      ),
      spatialCategory: 'pattern',
    },
  }),
  ev({
    id: 'S1.LLEGA_META',
    title: adult('Llega a la meta', 'Reaches the goal', 'Arriba a la meta', 'Chega á meta'),
    childAction: adult(
      'La criatura lleva el patín hasta la baldosa META.',
      'The child brings the skate to the META tile.',
      'La criatura porta el patí fins a la rajola META.',
      'A criatura leva o patín ata a lousa META.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'celebra_exito',
      pictoKey: picto('estrella'),
      awardFamily: 0,
      light: 'DIR_DELANTE',
      haptic: 'CELEBRA_CORTO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Connect the path!',
      adultHint: adult('Al final está la meta.', 'The goal is at the end.', 'Al final hi ha la meta.', 'Ao final está a meta.'),
      spatialCategory: 'pattern',
    },
  }),
];

const CYCLE_SOLO: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Une dos baldosas rectas. El río de luz las recorre. Separa la segunda unos dos centímetros: el flujo se detiene en el borde. Espera cinco segundos en silencio.',
      'Join two straight tiles. The river of light runs across them. Separate the second by about two centimetres: the flow stops at the edge. Wait five seconds in silence.',
      'Uneix dues rajoles rectes. El riu de llum les recorre. Separa la segona uns dos centímetres: el flux s’atura a la vora. Espera cinc segons en silenci.',
      'Une dúas lousas rectas. O río de luz recórreas. Separa a segunda uns dous centímetros: o fluxo detense no bordo. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      '¿Por qué se para la luz cuando separas la baldosa?',
      'Why does the light stop when you pull the tile apart?',
      'Per què s’atura la llum quan separes la rajola?',
      'Por que se detén a luz cando separas a lousa?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Alterna baldosas lisas y rugosas. Antes de encajar cada una, la criatura la toca con la palma. Prueba después una curva de un cuarto de vuelta. Tú confirmas con el botón.',
      'Alternate smooth and rough tiles. Before each one clicks in, the child feels it with the palm. Then try a quarter-turn curve. You confirm with the button.',
      'Alterna rajoles llises i rugoses. Abans d’encaixar-ne cadascuna, la criatura la toca amb el palmell. Després prova una corba d’un quart de volta. Tu confirmes amb el botó.',
      'Alterna lousas lisas e rugosas. Antes de encaixar cada unha, a criatura tócaa coa palma. Proba despois unha curva dun cuarto de volta. Ti confirmas co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Esta baldosa es lisa o rugosa?',
        'Is this tile smooth or rough?',
        'Aquesta rajola és llisa o rugosa?',
        'Esta lousa é lisa ou rugosa?',
      ),
      level2PhysicalModel: adult(
        'Junta las ranuras hasta que no quede hueco y el patín pase sin saltar.',
        'Join the grooves until there is no gap and the skate passes without a jump.',
        'Ajunta les ranures fins que no quedi buit i el patí passi sense saltar.',
        'Xunta as rañuras ata que non quede oco e o patín pase sen saltar.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Copia una tarjeta de modelo: un tramo continuo con un desvío en T, de INICIO a META.',
      'Copy a model card: one continuous stretch with a T branch, from INICIO to META.',
      'Copia una targeta de model: un tram continu amb una desviació en T, d’INICIO a META.',
      'Copia unha tarxeta de modelo: un tramo continuo cun desvío en T, de INICIO a META.',
    ),
    transferQuestion: adult(
      'Si quitas una baldosa del medio, ¿la luz llega a la meta?',
      'If you take out a tile from the middle, does the light reach the goal?',
      'Si treus una rajola del mig, la llum arriba a la meta?',
      'Se quitas unha lousa do medio, a luz chega á meta?',
    ),
  },
};

const CYCLE_WITH_LUA: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Pon a Lúa en INICIO, con el patín de dos pivotes en la ranura. La criatura la ve de espaldas: su izquierda es la izquierda de Lúa. Espera cinco segundos en silencio.',
      'Put Lúa on INICIO, with the two-pivot skate in the groove. The child sees her from behind: the child’s left is Lúa’s left. Wait five seconds in silence.',
      'Posa la Lúa a INICIO, amb el patí de dos pivots a la ranura. La criatura la veu d’esquena: la seva esquerra és l’esquerra de la Lúa. Espera cinc segons en silenci.',
      'Pon a Lúa en INICIO, co patín de dous pivotes na rañura. A criatura véa de costas: a súa esquerda é a esquerda de Lúa. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      'Si falta una baldosa, ¿Lúa sigue o espera?',
      'If a tile is missing, does Lúa go on or wait?',
      'Si falta una rajola, la Lúa continua o espera?',
      'Se falta unha lousa, Lúa segue ou agarda?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'La criatura desliza a Lúa: primero recto, después un giro a la izquierda, al final la meta. Si el camino se corta, Lúa espera serena. Tú confirmas cada tramo con el botón.',
      'The child slides Lúa: first straight, then a left turn, and at the end the goal. If the path breaks, Lúa waits calmly. You confirm each stretch with the button.',
      'La criatura fa lliscar la Lúa: primer recte, després un gir a l’esquerra, al final la meta. Si el camí es talla, la Lúa espera serena. Tu confirmes cada tram amb el botó.',
      'A criatura desliza a Lúa: primeiro recto, despois un xiro á esquerda, ao final a meta. Se o camiño se corta, Lúa agarda serena. Ti confirmas cada tramo co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Qué va primero, el giro o la meta?',
        'What comes first, the turn or the goal?',
        'Què va primer, el gir o la meta?',
        'Que vai primeiro, o xiro ou a meta?',
      ),
      level2PhysicalModel: adult(
        'Acompaña el patín con dos dedos por la ranura, sin levantarlo, hasta que las baldosas se toquen.',
        'Guide the skate with two fingers along the groove, without lifting it, until the tiles touch.',
        'Acompanya el patí amb dos dits per la ranura, sense aixecar-lo, fins que les rajoles es toquin.',
        'Acompaña o patín con dous dedos pola rañura, sen levantalo, ata que as lousas se toquen.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Tiende un camino con desvío en T para que Lúa salga de INICIO y llegue a META sin saltos.',
      'Lay a path with a T branch so Lúa leaves INICIO and reaches META without jumps.',
      'Estén un camí amb desviació en T perquè la Lúa surti d’INICIO i arribi a META sense salts.',
      'Tende un camiño con desvío en T para que Lúa saia de INICIO e chegue a META sen saltos.',
    ),
    transferQuestion: adult(
      'Tu izquierda y la de Lúa, cuando la miras de espaldas, ¿son la misma?',
      'When you look at Lúa from behind, is your left the same as hers?',
      'La teva esquerra i la de la Lúa, quan la mires d’esquena, són la mateixa?',
      'A túa esquerda e a de Lúa, cando a miras de costas, son a mesma?',
    ),
  },
};

const METHODS: DetectionMethod[] = ['marker', 'adult_tap'];

export const SET_SOLO: SteamActivity = {
  id: 'AR-S01',
  worldId: 'S1',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: METHODS,
  childSpeech: speech(
    '¡Une el camino! ¡Liso, rugoso, gira!',
    'Une o camiño! Liso, rugoso, xira!',
    'Lotu bidea! Leuna, latza, biratu!',
    '¡Une el camino! ¡Liso, áspero, dobla!',
    'Connect the path! Smooth, rough, turn!',
    'Uneix el camí! Llis, rugós, gira!',
  ),
  englishTpr: 'Connect the path! Smooth, rough, turn!',
  cycle: CYCLE_SOLO,
  events: EVENTS,
};

export const SET_WITH_LUA: SteamActivity = {
  id: 'AR-SL01',
  worldId: 'S1',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: METHODS,
  childSpeech: speech(
    '¡Desliza a Lúa! ¡Gira a la izquierda! ¡Hasta el final!',
    'Desliza a Lúa! Xira á esquerda! Ata o final!',
    'Eraman Lúa! Ezkerrera! Heldu helmugara!',
    '¡Desliza a Lúa! ¡Dobla a la izquierda! ¡Hasta el final!',
    'Slide Lúa! Turn left! Reach the end!',
    'Fes lliscar la Lúa! Gira a l’esquerra! Fins al final!',
  ),
  englishTpr: 'Slide Lúa! Turn left! Reach the end!',
  cycle: CYCLE_WITH_LUA,
  events: EVENTS,
};

export const MANIFEST: WorldManifest = {
  id: 'S1',
  orderIndex: 1,
  title: adult(
    'El río de baldosas conectadas',
    'The river of connected tiles',
    'El riu de rajoles connectades',
    'O río de lousas conectadas',
  ),
  subtitleEn: 'A path reaches the goal only when every groove is joined',
  phenomenon: adult(
    'El caudal va de INICIO a META si las ranuras quedan empalmadas, sin saltos, y los giros son de un cuarto de vuelta.',
    'The flow goes from INICIO to META when the grooves are joined, with no gaps, and the turns are a quarter turn.',
    'El cabal va d’INICIO a META si les ranures queden empalmades, sense salts, i els girs són d’un quart de volta.',
    'O caudal vai de INICIO a META se as rañuras quedan empalmadas, sen saltos, e os xiros son dun cuarto de volta.',
  ),
  ageRange: '0-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['position', 'orientation', 'pattern'],
  skillAxes: ['morphosyntax_narrative', 'lexicon_semantics'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Familia y aula, de 0 a 6 años. La persona adulta maneja la tableta.',
    'Home and classroom, ages 0 to 6. The adult handles the tablet.',
    'Família i aula, de 0 a 6 anys. La persona adulta fa servir la tauleta.',
    'Familia e aula, de 0 a 6 anos. A persoa adulta manexa a tableta.',
  ),
  udlPathways: {
    representation: adult(
      'El camino se ve en las baldosas, se siente liso o rugoso y se dice en orden: primero, después, al final.',
      'The path is seen in the tiles, felt as smooth or rough, and said in order: first, next, at the end.',
      'El camí es veu a les rajoles, es nota llis o rugós i es diu en ordre: primer, després, al final.',
      'O camiño vese nas lousas, séntese liso ou rugoso e dise en orde: primeiro, despois, ao final.',
    ),
    engagement: adult(
      'La persona adulta elige la tarjeta de modelo. Parar a mitad de camino también cuenta.',
      'The adult chooses the model card. Stopping halfway also counts.',
      'La persona adulta tria la targeta de model. Aturar-se a mig camí també compta.',
      'A persoa adulta escolle a tarxeta de modelo. Parar a metade do camiño tamén conta.',
    ),
    expression: adult(
      'La criatura encaja, desliza o señala. El adulto confirma con el botón. No hace falta una frase larga.',
      'The child fits, slides, or points. The adult confirms with the button. A long sentence is not required.',
      'La criatura encaixa, llisca o assenyala. L’adult confirma amb el botó. No cal una frase llarga.',
      'A criatura encaixa, desliza ou sinala. A persoa adulta confirma co botón. Non fai falta unha frase longa.',
    ),
  },
  tabletStandSpec: {
    heightCm: 22,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    piece('S1-REC-LIS-G', adult('Baldosa lisa', 'Smooth tile', 'Rajola llisa', 'Lousa lisa'), 6, [11, 111, 112, 113, 114, 115]),
    piece('S1-REC-RUG-G', adult('Baldosa rugosa', 'Rough tile', 'Rajola rugosa', 'Lousa rugosa'), 4, [12, 121, 122, 123]),
    piece('S1-CUR-G', adult('Curva de un cuarto', 'Quarter curve', 'Corba d’un quart', 'Curva dun cuarto'), 2, [13, 131]),
    piece('S1-TEE-G', adult('Cruce en T', 'T junction', 'Cruïlla en T', 'Cruzamento en T'), 1, [14]),
    piece('S1-FIC-AVANZA', adult('Ficha avanza', 'Move-ahead token', 'Fitxa avança', 'Ficha avanza'), 1, [15]),
    piece('S1-FIC-GIRA-IZQ', adult('Ficha gira a la izquierda', 'Turn-left token', 'Fitxa gira a l’esquerra', 'Ficha xira á esquerda'), 1, [16]),
    piece('S1-FIC-GIRA-DCHA', adult('Ficha gira a la derecha', 'Turn-right token', 'Fitxa gira a la dreta', 'Ficha xira á dereita'), 1, [17]),
    piece('S1-FIC-SALTA', adult('Ficha salta', 'Jump token', 'Fitxa salta', 'Ficha salta'), 1, [18]),
    piece('S1-FIC-PARA', adult('Ficha para', 'Stop token', 'Fitxa para', 'Ficha para'), 1, [19]),
  ],
  events: EVENTS,
  challenges: [
    {
      id: 'S1-C1',
      number: 1,
      title: adult('Del inicio a la meta', 'From start to goal', 'De l’inici a la meta', 'Do inicio á meta'),
      ageBand: '3-4',
      neuroStage: 'I4',
      estimatedMinutes: 12,
      scale: 'G',
      skillAxes: ['morphosyntax_narrative', 'lexicon_semantics'],
      targetEvents: ['S1.LUA_EN_INICIO', 'S1.LUA_AVANZA', 'S1.LUA_GIRA', 'S1.CAMINO_ROTO', 'S1.LLEGA_META'],
      cycle: CYCLE_WITH_LUA,
      achievementCriterion: adult(
        'Hay un camino continuo de INICIO a META, con giros rectos o de un cuarto de vuelta. El adulto confirma con el botón.',
        'There is a continuous path from INICIO to META, with straight joins or quarter turns. The adult confirms with the button.',
        'Hi ha un camí continu d’INICIO a META, amb unions rectes o quarts de volta. L’adult confirma amb el botó.',
        'Hai un camiño continuo de INICIO a META, con xiros rectos ou dun cuarto de volta. A persoa adulta confirma co botón.',
      ),
      qualitativeObservation: adult(
        'Anota si la criatura repara el corte antes de seguir o si empuja hacia el hueco.',
        'Note whether the child repairs the gap before going on, or pushes toward the hole.',
        'Anota si la criatura repara el tall abans de continuar o si empeny cap al buit.',
        'Anota se a criatura repara o corte antes de seguir ou se empurra cara ao oco.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S1-CARD-1',
      title: adult('Tarjeta de camino 1', 'Path card 1', 'Targeta de camí 1', 'Tarxeta de camiño 1'),
      targetPieces: ['S1-REC-LIS-G', 'S1-CUR-G', 'S1-TEE-G'],
    },
  ],
  revealLayer: {
    id: 'set_camino',
    description: adult(
      'Corriente de luz turquesa sobre las baldosas unidas. Se detiene con un remolino suave donde falta un tramo.',
      'A turquoise stream of light over the joined tiles. It stops in a soft swirl where a stretch is missing.',
      'Corrent de llum turquesa sobre les rajoles unides. S’atura amb un remolí suau on falta un tram.',
      'Corrente de luz turquesa sobre as lousas unidas. Detense cun remuíño suave onde falta un tramo.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: {
    songIds: ['lua_song_02'],
    gameIds: ['lua_game_16', 'lua_game_15'],
  },
  story: {
    storyId: 'lua_story_03',
    anticipationMicroStory: adult(
      'Lúa quiere ir de visita. El camino solo existe si las baldosas se dan la mano.',
      'Lúa wants to go visiting. The path exists only if the tiles hold hands.',
      'La Lúa vol anar de visita. El camí només existeix si les rajoles s’agafen.',
      'Lúa quere ir de visita. O camiño só existe se as lousas se dan a man.',
    ),
    closingMicroStory: adult(
      'Lúa ya llegó. Las baldosas vuelven al cajón, primero las curvas y después las rectas.',
      'Lúa has arrived. The tiles go back in the box, curves first and then the straight ones.',
      'La Lúa ja ha arribat. Les rajoles tornen a la capsa, primer les corbes i després les rectes.',
      'Lúa xa chegou. As lousas volven á caixa, primeiro as curvas e despois as rectas.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'BlockList',
      blockParam: 'lenguaje',
      connectionReason: adult(
        'En la mesa se practica el orden: primero, después y al final, con objetos grandes.',
        'At the table the order is practiced: first, next, and at the end, with large objects.',
        'A la taula es practica l’ordre: primer, després i al final, amb objectes grans.',
        'Na mesa practícase a orde: primeiro, despois e ao final, con obxectos grandes.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S1',
};

function path(headings: readonly [number, number, number, number], breakLink: boolean): PathGraph {
  const [a, b, c, d] = ['inicio', 'recta', 'curva', 'meta'];
  const [ha, hb, hc, hd] = headings;
  return {
    startId: a,
    goalId: d,
    nodes: [
      { id: a, headingDeg: ha, links: [b] },
      { id: b, headingDeg: hb, links: breakLink ? [a] : [a, c] },
      { id: c, headingDeg: hc, links: [b, d] },
      { id: d, headingDeg: hd, links: [c] },
    ],
  };
}

const POSITIVE: ChallengeInput = { kind: 'path', worldId: 'S1', graph: path([0, 0, 90, 90], false) };
const NEGATIVE: ChallengeInput = { kind: 'path', worldId: 'S1', graph: path([0, 0, 45, 45], false) };

export interface FoundationalReplayCase {
  readonly id: string;
  readonly polarity: TracePolarity;
  readonly frames: number;
  readonly observation: { method: DetectionMethod; pieceCode?: string; markerId?: number };
  readonly challenge: ChallengeInput;
}

export const REPLAY_CASES: readonly FoundationalReplayCase[] = [
  {
    id: 'S1-positiva',
    polarity: 'positive',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S1-REC-LIS-G', markerId: 11 },
    challenge: POSITIVE,
  },
  {
    id: 'S1-negativa',
    polarity: 'negative',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S1-REC-LIS-G', markerId: 11 },
    challenge: NEGATIVE,
  },
  {
    id: 'S1-oclusion-parcial',
    polarity: 'partial_occlusion',
    frames: VISUAL_STABLE_FRAMES - 1,
    observation: { method: 'marker', pieceCode: 'S1-REC-LIS-G', markerId: 11 },
    challenge: POSITIVE,
  },
  {
    id: 'S1-adult-tap',
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
  if (translateExpression('espera_serena').index !== 0 || translateExpression('celebra_exito').index !== 9) {
    throw new Error('S1: la espera y la meta no coinciden con las caras del motor.');
  }
  if (translateExpression('animo').index !== 2) {
    throw new Error('S1: avanzar y girar tienen que ir a la cara #2.');
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

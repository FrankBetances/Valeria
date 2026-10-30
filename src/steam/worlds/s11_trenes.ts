// Set 11 · Red de trenes. AR-S11 (SET_SOLO) y AR-SL11 (SET_WITH_LUA).
// El evaluador pide un grafo continuo y giros de 90°.
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

const TPR = 'Link the wagon! Lower the barrier! Chug along the track!';

const CYCLE = {
  observa: {
    phenomenonTrigger: adult(
      'La locomotora sola se empuja con facilidad. Enganchada al vagón, la mano nota más peso.',
      'The engine alone pushes easily. Coupled to the wagon, the hand feels more weight.',
      'La locomotora sola s\'empeny amb facilitat. Enganxada al vagó, la mà nota més pes.',
      'A locomotora soa empúxase con facilidade. Enganchada ao vagón, a man nota máis peso.',
    ),
    socraticQuestion: adult(
      '¿Qué va delante y qué va detrás?',
      'What goes in front, and what goes behind?',
      'Què va davant i què va darrere?',
      'Que vai diante e que vai detrás?',
    ),
    mandatorySilenceSec: 5 as const,
  },
  experimenta: {
    adultStepByStep: adult(
      'Baja la barrera antes de que el tren cruce y detén el convoy frente al andén. La persona adulta confirma cada paso con un toque.',
      'Lower the barrier before the train crosses and stop the train at the platform. The adult confirms each step with a tap.',
      'Baixa la barrera abans que el tren creui i atura el comboi davant de l\'andana. La persona adulta confirma cada pas amb un toc.',
      'Baixa a barreira antes de que o tren cruce e detén o convoi fronte ao andén. A persoa adulta confirma cada paso cun toque.',
    ),
    hints: {
      level1Socratic: adult(
        'Si falta un tramo, ¿el tren puede seguir?',
        'If a section is missing, can the train go on?',
        'Si falta un tram, el tren pot seguir?',
        'Se falta un tramo, o tren pode seguir?',
      ),
      level2PhysicalModel: adult(
        'Engancha el vagón, baja la barrera con la mano y empuja hasta dejar la locomotora junto al andén.',
        'Couple the wagon, lower the barrier by hand and push until the engine is beside the platform.',
        'Enganxa el vagó, baixa la barrera amb la mà i empeny fins a deixar la locomotora al costat de l\'andana.',
        'Engancha o vagón, baixa a barreira coa man e empurra ata deixar a locomotora xunto ao andén.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Integra el puente en mitad de las vías para que el tren cruce por encima de un río imaginario.',
      'Set the bridge into the middle of the track so the train crosses an imaginary river.',
      'Integra el pont a mig camí de les vies perquè el tren creui per damunt d\'un riu imaginari.',
      'Integra a ponte no medio das vías para que o tren cruce por riba dun río imaxinario.',
    ),
    transferQuestion: adult(
      'En una estación, ¿qué se baja antes de que pase el tren?',
      'At a station, what comes down before the train goes through?',
      'En una estació, què es baixa abans que passi el tren?',
      'Nunha estación, que se baixa antes de que pase o tren?',
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
  awardFamily?: number,
): WorldEventSpec {
  return {
    id,
    title,
    childAction,
    methods,
    turn,
    reaction: {
      expression,
      light,
      haptic,
      ...(awardFamily !== undefined ? { awardFamily } : {}),
      screenOverlay: 'NONE',
    },
    word: { englishTpr: TPR, adultHint: hint, spatialCategory: spatial },
  };
}

const MARKER: WorldEventSpec['methods'] = ['marker', 'adult_tap'];

const SOLO_EVENTS: WorldEventSpec[] = [
  ev(
    'S11.VAGON_ACOPLADO',
    adult('Vagón enganchado', 'Wagon coupled', 'Vagó enganxat', 'Vagón enganchado'),
    adult(
      'La criatura engancha el vagón detrás de la locomotora.',
      'The child couples the wagon behind the engine.',
      'L\'infant enganxa el vagó darrere la locomotora.',
      'A criatura engancha o vagón detrás da locomotora.',
    ),
    MARKER,
    'motor',
    'impulso',
    'DIR_DELANTE',
    'APAGADO',
    adult(
      'Di: delante la locomotora, detrás el vagón.',
      'Say: engine in front, wagon behind.',
      'Digues: davant la locomotora, darrere el vagó.',
      'Di: diante a locomotora, detrás o vagón.',
    ),
    'position',
  ),
  ev(
    'S11.PASO_NIVEL_SEGURO',
    adult('Paso a nivel cerrado', 'Level crossing closed', 'Pas a nivell tancat', 'Paso a nivel pechado'),
    adult(
      'La barrera baja antes de que el convoy entre en el cruce.',
      'The barrier comes down before the train enters the crossing.',
      'La barrera baixa abans que el comboi entri al pas.',
      'A barreira baixa antes de que o convoi entre no cruce.',
    ),
    MARKER,
    'motor',
    'atenta',
    'TENUE_CUATRO',
    'APAGADO',
    adult(
      'Di: baja la barrera.',
      'Say: lower the barrier.',
      'Digues: baixa la barrera.',
      'Di: baixa a barreira.',
    ),
    'pattern',
  ),
  ev(
    'S11.TREN_EN_MARCHA',
    adult('Tren en marcha', 'Train moving', 'Tren en marxa', 'Tren en marcha'),
    adult(
      'El convoy avanza por las vías unidas, con la estela sobre los carriles.',
      'The train moves along the joined track, with the trail on the rails.',
      'El comboi avança per les vies unides, amb el deixant sobre els rails.',
      'O convoi avanza polas vías unidas, coa estela sobre os carrís.',
    ),
    MARKER,
    'motor',
    'diversion',
    'DIR_DELANTE',
    'APAGADO',
    adult(
      'Di: sigue por la vía.',
      'Say: chug along the track.',
      'Digues: segueix per la via.',
      'Di: segue pola vía.',
    ),
    'quantity',
  ),
  ev(
    'S11.PARADA_EN_ANDEN',
    adult('Parada en el andén', 'Stop at the platform', 'Parada a l\'andana', 'Parada no andén'),
    adult(
      'La locomotora se detiene justo frente al andén.',
      'The engine stops right at the platform.',
      'La locomotora s\'atura just davant de l\'andana.',
      'A locomotora detense xusto fronte ao andén.',
    ),
    MARKER,
    'motor',
    'celebra_nivel',
    'DIR_DELANTE',
    'APAGADO',
    adult(
      'Di: para en la estación.',
      'Say: stop at the station.',
      'Digues: atura\'t a l\'estació.',
      'Di: para na estación.',
    ),
    'position',
    2,
  ),
  ev(
    'S11.CONSIGNA_VERBAL',
    adult('Consigna de la estación', 'Station prompt', 'Consigna de l\'estació', 'Consigna da estación'),
    adult(
      'La persona adulta dice la consigna. La criatura no toca la tableta.',
      'The adult says the prompt. The child does not touch the tablet.',
      'La persona adulta diu la consigna. L\'infant no toca la tauleta.',
      'A persoa adulta di a consigna. A criatura non toca a tableta.',
    ),
    ['adult_tap'],
    'verbal',
    'escucha',
    'APAGADO',
    'APAGADO',
    adult(
      'Engancha el vagón. Baja la barrera. Avanza por la vía. Para en el andén.',
      'Link the wagon. Lower the barrier. Chug along the track. Stop at the platform.',
      'Enganxa el vagó. Baixa la barrera. Avança per la via. Atura\'t a l\'andana.',
      'Engancha o vagón. Baixa a barreira. Avanza pola vía. Para no andén.',
    ),
    'pattern',
  ),
];

function withLuaHaptic(events: readonly WorldEventSpec[]): WorldEventSpec[] {
  return events.map((event) => {
    if (event.id !== 'S11.PARADA_EN_ANDEN') return event;
    return { ...event, reaction: { ...event.reaction, haptic: 'METRONOMO_LENTO' } };
  });
}

const CHILD = speech(
  'Engancha el vagón. Baja la barrera. Avanza por la vía. Para en el andén.',
  'Engancha o vagón. Baixa a barreira. Avanza pola vía. Para no andén.',
  'Lotu bagoia. Jaitsi hesia. Aurrera bidean. Geratu geltokian.',
  'Engancha el vagón. Baja la barrera. Sigue por la vía. Para en el andén.',
  'Link the wagon. Lower the barrier. Chug along the track. Stop at the platform.',
  'Enganxa el vagó. Baixa la barrera. Avança per la via. Atura\'t a l\'andana.',
);

export const setSolo: SteamActivity = {
  id: 'AR-S11',
  worldId: 'S11',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: ['marker', 'adult_tap'],
  childSpeech: CHILD,
  englishTpr: TPR,
  cycle: CYCLE,
  events: SOLO_EVENTS,
};

export const setWithLua: SteamActivity = {
  id: 'AR-SL11',
  worldId: 'S11',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: ['marker', 'adult_tap'],
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

function piece(
  code: string,
  name: AdultText,
  markerId: number,
): WorldManifest['pieces'][number] {
  return {
    code,
    name,
    quantity: 1,
    scale: 'G',
    instanceMarkerIds: [markerId],
    detectionMethod: 'marker',
    safetyNotes: SAFE,
  };
}

export const manifest: WorldManifest = {
  id: 'S11',
  orderIndex: 11,
  title: adult(
    'Red de trenes',
    'Train network',
    'Xarxa de trens',
    'Rede de trens',
  ),
  subtitleEn: 'Coupled train and level crossing',
  phenomenon: adult(
    'El convoy solo avanza si las vías se tocan. La barrera baja antes del cruce y el tren para junto al andén.',
    'The train moves only if the track sections touch. The barrier comes down before the crossing and the train stops at the platform.',
    'El comboi només avança si les vies es toquen. La barrera baixa abans del pas i el tren s\'atura a l\'andana.',
    'O convoi só avanza se as vías se tocan. A barreira baixa antes do cruce e o tren para xunto ao andén.',
  ),
  ageRange: '3-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['pattern', 'position', 'quantity'],
  skillAxes: ['lexicon_semantics', 'morphosyntax_narrative'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Juego de mesa para familias y aulas. La persona adulta confirma con un toque. La criatura empuja el tren y no maneja la tableta.',
    'A table game for families and classrooms. The adult confirms with a tap. The child pushes the train and does not operate the tablet.',
    'Joc de taula per a famílies i aules. La persona adulta confirma amb un toc. L\'infant empeny el tren i no fa anar la tauleta.',
    'Xogo de mesa para familias e aulas. A persoa adulta confirma cun toque. A criatura empurra o tren e non manexa a tableta.',
  ),
  udlPathways: {
    representation: adult(
      'La estela sobre los carriles y la baliza del andén se ven en la capa de revelación.',
      'The trail on the rails and the platform beacon show on the reveal layer.',
      'El deixant sobre els rails i la balisa de l\'andana es veuen a la capa de revelació.',
      'A estela sobre os carrís e a baliza do andén vense na capa de revelación.',
    ),
    engagement: adult(
      'El viaje tiene un orden fijo: enganchar, cerrar el paso, avanzar y parar.',
      'The trip has a fixed order: couple, close the crossing, move and stop.',
      'El viatge té un ordre fix: enganxar, tancar el pas, avançar i aturar.',
      'A viaxe ten unha orde fixa: enganchar, pechar o paso, avanzar e parar.',
    ),
    expression: adult(
      'La criatura cuenta el viaje con las piezas: delante, detrás, cruzar y parar.',
      'The child tells the trip with the pieces: in front, behind, cross and stop.',
      'L\'infant explica el viatge amb les peces: davant, darrere, creuar i aturar.',
      'A criatura conta a viaxe coas pezas: diante, detrás, cruzar e parar.',
    ),
  },
  tabletStandSpec: {
    heightCm: 26,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    piece('S11-TRE-ESTA', adult('Estación y andén', 'Station and platform', 'Estació i andana', 'Estación e andén'), 110),
    piece('S11-TRE-VIAS', adult('Tramo de vía', 'Track section', 'Tram de via', 'Tramo de vía'), 111),
    piece('S11-TRE-VIA-2', adult('Segundo tramo', 'Second section', 'Segon tram', 'Segundo tramo'), 114),
    piece('S11-TRE-VIA-3', adult('Tercer tramo', 'Third section', 'Tercer tram', 'Terceiro tramo'), 115),
    piece('S11-TRE-VIA-4', adult('Cuarto tramo', 'Fourth section', 'Quart tram', 'Cuarto tramo'), 116),
    piece('S11-TRE-BARR', adult('Barrera del paso', 'Crossing barrier', 'Barrera del pas', 'Barreira do paso'), 112),
    piece('S11-TRE-CONV', adult('Locomotora y vagón', 'Engine and wagon', 'Locomotora i vagó', 'Locomotora e vagón'), 113),
  ],
  events: setWithLua.events,
  challenges: [
    {
      id: 'S11-C1',
      number: 1,
      title: adult(
        'El viaje hasta el andén',
        'The trip to the platform',
        'El viatge fins a l\'andana',
        'A viaxe ata o andén',
      ),
      ageBand: '4-5',
      neuroStage: 'I4',
      estimatedMinutes: 8,
      scale: 'G',
      skillAxes: ['lexicon_semantics', 'morphosyntax_narrative'],
      targetEvents: ['S11.VAGON_ACOPLADO', 'S11.PASO_NIVEL_SEGURO', 'S11.TREN_EN_MARCHA', 'S11.PARADA_EN_ANDEN'],
      cycle: CYCLE,
      achievementCriterion: adult(
        'Las vías forman un camino continuo con giros de noventa grados, la barrera baja antes del cruce y el tren para en el andén.',
        'The track forms a continuous path with ninety-degree turns, the barrier is down before the crossing and the train stops at the platform.',
        'Les vies formen un camí continu amb girs de noranta graus, la barrera és baixada abans del pas i el tren s\'atura a l\'andana.',
        'As vías forman un camiño continuo con xiros de noventa grados, a barreira baixa antes do cruce e o tren para no andén.',
      ),
      qualitativeObservation: adult(
        'La persona adulta anota el orden del viaje. No hay puntuación.',
        'The adult notes the order of the trip. There is no score.',
        'La persona adulta anota l\'ordre del viatge. No hi ha puntuació.',
        'A persoa adulta anota a orde da viaxe. Non hai puntuación.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S11-CARD-VIAJE',
      title: adult('Circuito con paso a nivel', 'Loop with a level crossing', 'Circuit amb pas a nivell', 'Circuíto con paso a nivel'),
      targetPieces: ['S11-TRE-ESTA', 'S11-TRE-VIAS', 'S11-TRE-BARR', 'S11-TRE-CONV'],
    },
  ],
  revealLayer: {
    id: 'set_oficios',
    description: adult(
      'Nodo trenes de set_oficios: estela sobre los carriles y aviso de cruce ocupado. Animación celebrate.',
      'Train node of set_oficios: a trail on the rails and a warning that the crossing is occupied. Animation celebrate.',
      'Node trenes de set_oficios: deixant sobre els rails i avís de pas ocupat. Animació celebrate.',
      'Nodo trenes de set_oficios: estela sobre os carrís e aviso de cruce ocupado. Animación celebrate.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: { songIds: ['lua_song_02'], gameIds: ['lua_game_07'] },
  story: {
    storyId: 'lua_story_03',
    anticipationMicroStory: adult(
      'Hoy hay una estación pequeña. El vagón espera detrás de la locomotora y la barrera vigila el cruce.',
      'Today there is a small station. The wagon waits behind the engine and the barrier watches the crossing.',
      'Avui hi ha una estació petita. El vagó espera darrere la locomotora i la barrera vigila el pas.',
      'Hoxe hai unha estación pequena. O vagón agarda detrás da locomotora e a barreira vixía o cruce.',
    ),
    closingMicroStory: adult(
      'El tren descansa en el andén. Las vías siguen unidas y las piezas vuelven a la caja.',
      'The train rests at the platform. The track stays joined and the pieces go back in the box.',
      'El tren reposa a l\'andana. Les vies segueixen unides i les peces tornen a la caixa.',
      'O tren descansa no andén. As vías seguen unidas e as pezas volven á caixa.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'SemanticExpansion',
      connectionReason: adult(
        'En mesa se amplían delante, detrás, cruzar y parar, con la locomotora y el vagón a la vista.',
        'At the table, in front, behind, cross and stop are expanded, with the engine and the wagon in view.',
        'A taula s\'amplien davant, darrere, creuar i aturar, amb la locomotora i el vagó a la vista.',
        'Na mesa amplíanse diante, detrás, cruzar e parar, coa locomotora e o vagón á vista.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S11',
};

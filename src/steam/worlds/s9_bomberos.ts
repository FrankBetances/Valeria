// Set 9 · Parque de bomberos. AR-S09 (SET_SOLO) y AR-SL09 (SET_WITH_LUA).
// La bajada se compara por tiempos: cada salida cumple t_n < t_{n-1}.
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

const TPR = 'Open the gate! Slide down the ramp! Aim high!';

const CYCLE = {
  observa: {
    phenomenonTrigger: adult(
      'Al abrir el portón del hangar, el camión baja por su peso por la rampa.',
      'When the hangar gate opens, the truck rolls down the ramp by its own weight.',
      'En obrir el portó de l\'hangar, el camió baixa pel seu pes per la rampa.',
      'Ao abrir o portón do hangar, o camión baixa polo seu peso pola rampa.',
    ),
    socraticQuestion: adult(
      '¿De dónde sale el camión y hacia dónde apunta la torre?',
      'Where does the truck come from, and where does the tower aim?',
      'D\'on surt el camió i cap on apunta la torre?',
      'De onde sae o camión e cara a onde apunta a torre?',
    ),
    mandatorySilenceSec: 5 as const,
  },
  experimenta: {
    adultStepByStep: adult(
      'Orienta la torre hacia tres dianas de espuma en la mesa y mira cómo cambia el arco de agua. La persona adulta confirma con un toque.',
      'Aim the tower at three foam targets on the table and watch the water arc change. The adult confirms with a tap.',
      'Orienta la torre cap a tres dianes d\'escuma a la taula i mira com canvia l\'arc d\'aigua. La persona adulta confirma amb un toc.',
      'Orienta a torre cara a tres dianas de escuma na mesa e mira como cambia o arco de auga. A persoa adulta confirma cun toque.',
    ),
    hints: {
      level1Socratic: adult(
        'Si la rampa está más alta, ¿el camión llega antes o después?',
        'If the ramp is higher, does the truck arrive sooner or later?',
        'Si la rampa és més alta, el camió arriba abans o després?',
        'Se a rampa está máis alta, o camión chega antes ou despois?',
      ),
      level2PhysicalModel: adult(
        'Abre el portón, suelta el camión y gira la torre con la mano hacia la diana.',
        'Open the gate, let the truck go and turn the tower by hand toward the target.',
        'Obre el portó, deixa anar el camió i gira la torre amb la mà cap a la diana.',
        'Abre o portón, solta o camión e xira a torre coa man cara á diana.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Coloca pilares graduados bajo la rampa del parque y compara una salida suave con una salida rápida.',
      'Place stepped pillars under the station ramp and compare a gentle exit with a fast one.',
      'Col·loca pilars graduats sota la rampa del parc i compara una sortida suau amb una de ràpida.',
      'Coloca piares graduados baixo a rampa do parque e compara unha saída suave cunha saída rápida.',
    ),
    transferQuestion: adult(
      '¿Qué baja más deprisa, una rampa alta o una rampa baja?',
      'Which rolls down faster, a high ramp or a low ramp?',
      'Què baixa més de pressa, una rampa alta o una rampa baixa?',
      'Que baixa máis axiña, unha rampa alta ou unha rampa baixa?',
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
    'S9.AVISO_MISION',
    adult('Aviso de salida', 'Call to roll out', 'Avís de sortida', 'Aviso de saída'),
    adult(
      'La criatura abre el portón y mira el camión dentro del hangar.',
      'The child opens the gate and looks at the truck inside the hangar.',
      'L\'infant obre el portó i mira el camió dins l\'hangar.',
      'A criatura abre o portón e mira o camión dentro do hangar.',
    ),
    ['marker', 'adult_tap'],
    'motor',
    'atenta',
    'TENUE_CUATRO',
    'APAGADO',
    adult(
      'Di: dentro del hangar.',
      'Say: inside the hangar.',
      'Digues: dins l\'hangar.',
      'Di: dentro do hangar.',
    ),
    'position',
  ),
  ev(
    'S9.SALIDA_RAMPA',
    adult('Salida por la rampa', 'Down the ramp', 'Sortida per la rampa', 'Saída pola rampa'),
    adult(
      'El camión desciende por la rampa. La estela marca el lado de la bajada.',
      'The truck rolls down the ramp. The trail marks the downhill side.',
      'El camió baixa per la rampa. El deixant marca el costat de la baixada.',
      'O camión desce pola rampa. A estela marca o lado da baixada.',
    ),
    ['marker', 'tracked_object', 'adult_tap'],
    'motor',
    'animo',
    'LADO_RAMPA',
    'APAGADO',
    adult(
      'Di: baja por la rampa.',
      'Say: slide down the ramp.',
      'Digues: baixa per la rampa.',
      'Di: baixa pola rampa.',
    ),
    'dimensions',
  ),
  ev(
    'S9.CHORRO_APUNTADO',
    adult('Chorro en la diana', 'Stream on the target', 'Raig a la diana', 'Chorros na diana'),
    adult(
      'La torre gira y el arco de agua llega a la diana de espuma.',
      'The tower turns and the water arc reaches the foam target.',
      'La torre gira i l\'arc d\'aigua arriba a la diana d\'escuma.',
      'A torre xira e o arco de auga chega á diana de escuma.',
    ),
    ['marker', 'adult_tap'],
    'motor',
    'alegre',
    'LADO_RAMPA',
    'APAGADO',
    adult(
      'Di: apunta arriba o abajo.',
      'Say: aim up or down.',
      'Digues: apunta amunt o avall.',
      'Di: apunta arriba ou abaixo.',
    ),
    'orientation',
  ),
  ev(
    'S9.MISION_COMPLETA',
    adult('Salida completa', 'Roll-out complete', 'Sortida completa', 'Saída completa'),
    adult(
      'El camión está abajo y la torre ya apuntó. La salida termina.',
      'The truck is at the bottom and the tower has aimed. The roll-out ends.',
      'El camió és a baix i la torre ja ha apuntat. La sortida s\'acaba.',
      'O camión está abaixo e a torre xa apuntou. A saída remata.',
    ),
    ['marker', 'tracked_object', 'adult_tap'],
    'motor',
    'celebra_exito',
    'LADO_RAMPA',
    'APAGADO',
    adult(
      'Di: ayudar, misión hecha.',
      'Say: help, the job is done.',
      'Digues: ajudar, feina feta.',
      'Di: axudar, misión feita.',
    ),
    'position',
  ),
  ev(
    'S9.CONSIGNA_VERBAL',
    adult('Consigna del parque', 'Station prompt', 'Consigna del parc', 'Consigna do parque'),
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
      'Abre el portón. Baja por la rampa. Apunta arriba.',
      'Open the gate. Slide down the ramp. Aim high.',
      'Obre el portó. Baixa per la rampa. Apunta amunt.',
      'Abre o portón. Baixa pola rampa. Apunta arriba.',
    ),
    'orientation',
  ),
];

function withLuaHaptic(events: readonly WorldEventSpec[]): WorldEventSpec[] {
  const celebrate = new Set<WorldEventId>(['S9.SALIDA_RAMPA', 'S9.MISION_COMPLETA']);
  return events.map((event) => {
    if (!celebrate.has(event.id)) return event;
    return { ...event, reaction: { ...event.reaction, haptic: 'CELEBRA_CORTO' } };
  });
}

const CHILD = speech(
  'Abre el portón. Baja por la rampa. Apunta arriba.',
  'Abre o portón. Baixa pola rampa. Apunta arriba.',
  'Ireki atea. Jaitsi arrapalan. Apuntatu gora.',
  'Abre el portón. Baja por la rampa. Apunta arriba.',
  'Open the gate. Slide down the ramp. Aim high.',
  'Obre el portó. Baixa per la rampa. Apunta amunt.',
);

export const setSolo: SteamActivity = {
  id: 'AR-S09',
  worldId: 'S9',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: ['marker', 'tracked_object', 'adult_tap'],
  childSpeech: CHILD,
  englishTpr: TPR,
  cycle: CYCLE,
  events: SOLO_EVENTS,
};

export const setWithLua: SteamActivity = {
  id: 'AR-SL09',
  worldId: 'S9',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: ['marker', 'tracked_object', 'adult_tap'],
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
  id: 'S9',
  orderIndex: 9,
  title: adult(
    'Parque de bomberos',
    'Fire station yard',
    'Parc de bombers',
    'Parque de bombeiros',
  ),
  subtitleEn: 'Gravity exit and water arc',
  phenomenon: adult(
    'La altura de la rampa se convierte en alcance. El ángulo de la torre cambia la parábola del chorro.',
    'Ramp height becomes reach. The tower angle changes the arc of the stream.',
    'L\'alçada de la rampa es converteix en abast. L\'angle de la torre canvia la paràbola del raig.',
    'A altura da rampa convértese en alcance. O ángulo da torre cambia a parábola do chorro.',
  ),
  ageRange: '3-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['dimensions', 'position', 'orientation'],
  skillAxes: ['lexicon_semantics', 'interaction_pragmatics'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Juego de mesa para familias y aulas. La persona adulta abre el portón y confirma con un toque. La criatura no maneja la tableta.',
    'A table game for families and classrooms. The adult opens the gate and confirms with a tap. The child does not operate the tablet.',
    'Joc de taula per a famílies i aules. La persona adulta obre el portó i confirma amb un toc. L\'infant no fa anar la tauleta.',
    'Xogo de mesa para familias e aulas. A persoa adulta abre o portón e confirma cun toque. A criatura non manexa a tableta.',
  ),
  udlPathways: {
    representation: adult(
      'El arco azul del agua y el lado de la rampa se ven en la capa de revelación, sin destellos bruscos.',
      'The blue water arc and the ramp side show on the reveal layer, without harsh flashes.',
      'L\'arc blau de l\'aigua i el costat de la rampa es veuen a la capa de revelació, sense centelleigs bruscos.',
      'O arco azul da auga e o lado da rampa vense na capa de revelación, sen escintileos bruscos.',
    ),
    engagement: adult(
      'Hay un hangar que se abre, una bajada y una diana a la que apuntar.',
      'There is a hangar to open, a roll downhill and a target to aim at.',
      'Hi ha un hangar que s\'obre, una baixada i una diana on apuntar.',
      'Hai un hangar que se abre, unha baixada e unha diana á que apuntar.',
    ),
    expression: adult(
      'La criatura muestra arriba, abajo, dentro y fuera moviendo la torre y el camión.',
      'The child shows up, down, inside and outside by moving the tower and the truck.',
      'L\'infant mostra amunt, avall, dins i fora movent la torre i el camió.',
      'A criatura amosa arriba, abaixo, dentro e fóra movendo a torre e o camión.',
    ),
  },
  tabletStandSpec: {
    heightCm: 26,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    {
      code: 'S9-BOM-BASE',
      name: adult('Hangar', 'Hangar', 'Hangar', 'Hangar'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [90],
      detectionMethod: 'marker',
      safetyNotes: SAFE,
    },
    {
      code: 'S9-BOM-RAMPA',
      name: adult('Rampa de salida', 'Exit ramp', 'Rampa de sortida', 'Rampa de saída'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [93],
      detectionMethod: 'marker',
      safetyNotes: SAFE,
    },
    {
      code: 'S9-BOM-TORRE',
      name: adult('Torre', 'Tower', 'Torre', 'Torre'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [91],
      detectionMethod: 'marker',
      safetyNotes: SAFE,
    },
    {
      code: 'S9-BOM-CAMION',
      name: adult('Camión', 'Truck', 'Camió', 'Camión'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [92],
      detectionMethod: 'tracked_object',
      safetyNotes: SAFE,
    },
  ],
  events: setWithLua.events,
  challenges: [
    {
      id: 'S9-C1',
      number: 1,
      title: adult(
        'La salida del hangar',
        'The hangar roll-out',
        'La sortida de l\'hangar',
        'A saída do hangar',
      ),
      ageBand: '4-5',
      neuroStage: 'I4',
      estimatedMinutes: 8,
      scale: 'G',
      skillAxes: ['lexicon_semantics', 'interaction_pragmatics'],
      targetEvents: ['S9.AVISO_MISION', 'S9.SALIDA_RAMPA', 'S9.CHORRO_APUNTADO', 'S9.MISION_COMPLETA'],
      cycle: CYCLE,
      achievementCriterion: adult(
        'Cada bajada siguiente tarda menos que la anterior, y el arco llega a una diana.',
        'Each next descent takes less time than the one before, and the arc reaches a target.',
        'Cada baixada següent triga menys que l\'anterior, i l\'arc arriba a una diana.',
        'Cada baixada seguinte tarda menos que a anterior, e o arco chega a unha diana.',
      ),
      qualitativeObservation: adult(
        'La persona adulta anota si la criatura compara alto y bajo. No hay puntuación.',
        'The adult notes whether the child compares high and low. There is no score.',
        'La persona adulta anota si l\'infant compara alt i baix. No hi ha puntuació.',
        'A persoa adulta anota se a criatura compara alto e baixo. Non hai puntuación.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S9-CARD-SALIDA',
      title: adult('Salida del parque', 'Yard roll-out', 'Sortida del parc', 'Saída do parque'),
      targetPieces: ['S9-BOM-BASE', 'S9-BOM-RAMPA', 'S9-BOM-TORRE', 'S9-BOM-CAMION'],
    },
  ],
  revealLayer: {
    id: 'set_oficios',
    description: adult(
      'Nodo bomberos de set_oficios: arco de agua azul desde la torre hasta las dianas. Animación celebrate.',
      'Fire-station node of set_oficios: a blue water arc from the tower to the targets. Animation celebrate.',
      'Node bomberos de set_oficios: arc d\'aigua blava des de la torre fins a les dianes. Animació celebrate.',
      'Nodo bomberos de set_oficios: arco de auga azul desde a torre ata as dianas. Animación celebrate.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: { songIds: ['lua_song_02'], gameIds: ['lua_game_07'] },
  story: {
    storyId: 'lua_story_10',
    anticipationMicroStory: adult(
      'El camión espera dentro. Cuando el portón se abre, la rampa hace el resto.',
      'The truck waits inside. When the gate opens, the ramp does the rest.',
      'El camió espera a dins. Quan el portó s\'obre, la rampa fa la resta.',
      'O camión agarda dentro. Cando o portón se abre, a rampa fai o resto.',
    ),
    closingMicroStory: adult(
      'El camión ya está abajo y la torre descansa. Las piezas vuelven a la caja.',
      'The truck is down and the tower rests. The pieces go back in the box.',
      'El camió ja és a baix i la torre reposa. Les peces tornen a la caixa.',
      'O camión xa está abaixo e a torre descansa. As pezas volven á caixa.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'BlockList',
      blockParam: 'lenguaje',
      connectionReason: adult(
        'En mesa se nombran dentro, abajo, arriba y ayudar, con el hangar y la torre delante.',
        'At the table, inside, down, up and help are named, with the hangar and the tower in front.',
        'A taula s\'anomenen dins, avall, amunt i ajudar, amb l\'hangar i la torre al davant.',
        'Na mesa nómanse dentro, abaixo, arriba e axudar, co hangar e a torre diante.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S9',
};

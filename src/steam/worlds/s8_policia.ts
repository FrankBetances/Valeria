// Set 8 · Policía y tráfico. AR-S08 (SET_SOLO) y AR-SL08 (SET_WITH_LUA).
// La persona adulta confirma con un toque. La criatura mueve piezas en la mesa.
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

const TPR = 'Wait your turn! Green light, go! Stop at the crossing!';

const CYCLE = {
  observa: {
    phenomenonTrigger: adult(
      'La patrulla se detiene ante la barrera bajada. El paso de cebra se ilumina y se puede cruzar.',
      'The patrol stops at the lowered barrier. The zebra crossing lights up and the way across is open.',
      'La patrulla s\'atura davant la barrera baixada. El pas de vianants s\'il·lumina i es pot creuar.',
      'A patrulla detense ante a barreira baixada. O paso de peóns acéndese e pódese cruzar.',
    ),
    socraticQuestion: adult(
      '¿Quién espera y quién cruza?',
      'Who waits, and who crosses?',
      'Qui espera i qui creua?',
      'Quen agarda e quen cruza?',
    ),
    mandatorySilenceSec: 5 as const,
  },
  experimenta: {
    adultStepByStep: adult(
      'Una persona levanta la barrera y otra mueve el vehículo respetando el giro de la rotonda. La persona adulta confirma cada paso con un toque.',
      'One person raises the barrier and another moves the vehicle through the roundabout turn. The adult confirms each step with a tap.',
      'Una persona aixeca la barrera i una altra mou el vehicle respectant el gir de la rotonda. La persona adulta confirma cada pas amb un toc.',
      'Unha persoa levanta a barreira e outra move o vehículo respectando o xiro da rotonda. A persoa adulta confirma cada paso cun toque.',
    ),
    hints: {
      level1Socratic: adult(
        'Si los dos vehículos entran a la vez, el cruce se queda cerrado. ¿Cuál espera?',
        'If both vehicles enter at once, the crossing stays closed. Which one waits?',
        'Si els dos vehicles entren alhora, el pas queda tancat. Quin espera?',
        'Se os dous vehículos entran á vez, o cruce queda pechado. Cal agarda?',
      ),
      level2PhysicalModel: adult(
        'Baja la barrera con la mano, deja cruzar la ficha y solo después levántala.',
        'Lower the barrier by hand, let the piece cross, and only then raise it.',
        'Baixa la barrera amb la mà, deixa creuar la fitxa i només després aixeca-la.',
        'Baixa a barreira coa man, deixa cruzar a ficha e só despois levántaa.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Une las piezas rectas y el cruce en T del camino con la base de la estación para formar una avenida con paso regulado.',
      'Join the straight pieces and the T junction from the path set with the station base to form an avenue with a regulated crossing.',
      'Uneix les peces rectes i l\'encreuament en T del camí amb la base de l\'estació per formar una avinguda amb pas regulat.',
      'Une as pezas rectas e o cruzamento en T do camiño coa base da estación para formar unha avenida cun paso regulado.',
    ),
    transferQuestion: adult(
      'En la calle, ¿dónde hay que parar antes de cruzar?',
      'On the street, where do you stop before crossing?',
      'Al carrer, on cal aturar-se abans de creuar?',
      'Na rúa, onde hai que parar antes de cruzar?',
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
  extra?: { blocked?: boolean; pictoKey?: string },
): WorldEventSpec {
  return {
    id,
    title,
    childAction,
    methods,
    turn,
    ...(extra?.blocked ? { isErrorOrBlockedState: true as const } : {}),
    reaction: {
      expression,
      light,
      haptic,
      ...(extra?.pictoKey ? { pictoKey: extra.pictoKey } : {}),
      screenOverlay: 'NONE',
    },
    word: { englishTpr: TPR, adultHint: hint, spatialCategory: spatial },
  };
}

const MARKER: WorldEventSpec['methods'] = ['marker', 'adult_tap'];

const SOLO_EVENTS: WorldEventSpec[] = [
  ev(
    'S8.BARRERA_BAJA',
    adult('Barrera baja', 'Barrier down', 'Barrera baixada', 'Barreira baixada'),
    adult(
      'La criatura baja la barrera y la patrulla espera.',
      'The child lowers the barrier and the patrol waits.',
      'L\'infant baixa la barrera i la patrulla espera.',
      'A criatura baixa a barreira e a patrulla agarda.',
    ),
    MARKER,
    'motor',
    'atenta',
    'TENUE_CUATRO',
    'APAGADO',
    adult(
      'Di: para, espera tu turno.',
      'Say: stop, wait your turn.',
      'Digues: atura\'t, espera el torn.',
      'Di: para, agarda a túa quenda.',
    ),
    'position',
    { pictoKey: 'parar' },
  ),
  ev(
    'S8.PEATON_CRUZA',
    adult('El peatón cruza', 'The pedestrian crosses', 'El vianant creua', 'O peón cruza'),
    adult(
      'Con la barrera baja, la ficha cruza el paso iluminado.',
      'With the barrier down, the piece crosses the lit crossing.',
      'Amb la barrera baixada, la fitxa creua el pas il·luminat.',
      'Coa barreira baixada, a ficha cruza o paso aceso.',
    ),
    MARKER,
    'motor',
    'calma',
    'TENUE_CUATRO',
    'APAGADO',
    adult(
      'Di: ahora cruzas.',
      'Say: now you cross.',
      'Digues: ara creues.',
      'Di: agora cruzas.',
    ),
    'deictics',
  ),
  ev(
    'S8.BARRERA_SUBE',
    adult('Barrera sube', 'Barrier up', 'Barrera amunt', 'Barreira sobe'),
    adult(
      'La criatura levanta la barrera y el vehículo puede salir.',
      'The child raises the barrier and the vehicle may leave.',
      'L\'infant aixeca la barrera i el vehicle pot sortir.',
      'A criatura levanta a barreira e o vehículo pode saír.',
    ),
    MARKER,
    'motor',
    'animo',
    'DIR_DELANTE',
    'APAGADO',
    adult(
      'Di: luz verde, adelante.',
      'Say: green light, go.',
      'Digues: llum verda, endavant.',
      'Di: luz verde, adiante.',
    ),
    'orientation',
  ),
  ev(
    'S8.ROTONDA_COMPLETA',
    adult('Rotonda completa', 'Roundabout complete', 'Rotonda completa', 'Rotonda completa'),
    adult(
      'El vehículo da la vuelta a la rotonda y sale por la salida elegida.',
      'The vehicle goes around the roundabout and leaves by the chosen exit.',
      'El vehicle fa la volta a la rotonda i surt per la sortida triada.',
      'O vehículo dá a volta á rotonda e sae pola saída elixida.',
    ),
    MARKER,
    'motor',
    'celebra_corta',
    'DIR_DELANTE',
    'APAGADO',
    adult(
      'Di: alrededor de la rotonda.',
      'Say: around the roundabout.',
      'Digues: al voltant de la rotonda.',
      'Di: arredor da rotonda.',
    ),
    'orientation',
  ),
  ev(
    'S8.CRUCE_BLOQUEADO',
    adult('Cruce cerrado', 'Crossing closed', 'Pas tancat', 'Cruce pechado'),
    adult(
      'Dos vehículos entran a la vez y el paso se queda cerrado, sin prisa.',
      'Two vehicles enter at once and the way stays closed, without rushing.',
      'Dos vehicles entren alhora i el pas queda tancat, sense pressa.',
      'Dous vehículos entran á vez e o paso queda pechado, sen présa.',
    ),
    MARKER,
    'motor',
    'espera_serena',
    'APAGADO',
    'APAGADO',
    adult(
      'Di: los dos esperan. Uno primero.',
      'Say: both wait. One goes first.',
      'Digues: els dos esperen. Un primer.',
      'Di: os dous agardan. Un primeiro.',
    ),
    'position',
    { blocked: true },
  ),
  ev(
    'S8.CONSIGNA_VERBAL',
    adult('Consigna del cruce', 'Crossing prompt', 'Consigna del pas', 'Consigna do cruce'),
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
      'Espera tu turno. Para en el cruce.',
      'Wait your turn. Stop at the crossing.',
      'Espera el teu torn. Atura\'t al pas.',
      'Agarda a túa quenda. Para no cruce.',
    ),
    'deictics',
  ),
];

function withLuaHaptic(events: readonly WorldEventSpec[]): WorldEventSpec[] {
  return events.map((event) => {
    if (event.id !== 'S8.ROTONDA_COMPLETA') return event;
    return { ...event, reaction: { ...event.reaction, haptic: 'CELEBRA_CORTO' } };
  });
}

const CHILD = speech(
  'Espera el turno. Verde, adelante. Para en el cruce.',
  'Agarda a quenda. Verde, adiante. Para no paso.',
  'Itxaron txanda. Berdea, aurrera. Geratu pasabidean.',
  'Espera el turno. Verde, sigue. Para en el cruce.',
  'Wait your turn. Green light, go. Stop at the crossing.',
  'Espera el torn. Verd, endavant. Atura\'t al pas.',
);

export const setSolo: SteamActivity = {
  id: 'AR-S08',
  worldId: 'S8',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: ['marker', 'adult_tap'],
  childSpeech: CHILD,
  englishTpr: TPR,
  cycle: CYCLE,
  events: SOLO_EVENTS,
};

export const setWithLua: SteamActivity = {
  id: 'AR-SL08',
  worldId: 'S8',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: ['marker', 'adult_tap'],
  childSpeech: CHILD,
  englishTpr: TPR,
  cycle: CYCLE,
  events: withLuaHaptic(SOLO_EVENTS),
};

export const activities: readonly SteamActivity[] = [setSolo, setWithLua];

const PIECE = (
  code: string,
  name: AdultText,
  markerId: number,
): WorldManifest['pieces'][number] => ({
  code,
  name,
  quantity: 1,
  scale: 'G',
  instanceMarkerIds: [markerId],
  detectionMethod: 'marker',
  safetyNotes: adult(
    'Pieza grande de mesa. La persona adulta la acerca. No va a la boca.',
    'Large table piece. The adult brings it over. It does not go in the mouth.',
    'Peça grossa de taula. La persona adulta l\'acosta. No va a la boca.',
    'Peza grande de mesa. A persoa adulta achégaa. Non vai á boca.',
  ),
});

export const manifest: WorldManifest = {
  id: 'S8',
  orderIndex: 8,
  title: adult(
    'Policía y tráfico',
    'Police and traffic',
    'Policia i trànsit',
    'Policía e tráfico',
  ),
  subtitleEn: 'Community crossing and roundabout',
  phenomenon: adult(
    'En un cruce, el paso se abre por turnos. Si dos vehículos entran a la vez, el camino se queda cerrado hasta que uno espera.',
    'At a crossing, the way opens in turns. If two vehicles enter at once, the path stays closed until one waits.',
    'En un pas, el camí s\'obre per torns. Si dos vehicles entren alhora, queda tancat fins que un espera.',
    'Nun cruce, o paso ábrese por quendas. Se dous vehículos entran á vez, o camiño queda pechado ata que un agarda.',
  ),
  ageRange: '3-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['position', 'orientation', 'deictics'],
  skillAxes: ['interaction_pragmatics', 'lexicon_semantics'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Juego de mesa para familias y aulas. La persona adulta media el turno. La criatura construye con las piezas y no maneja la tableta.',
    'A table game for families and classrooms. The adult mediates the turn. The child builds with the pieces and does not operate the tablet.',
    'Joc de taula per a famílies i aules. La persona adulta media el torn. L\'infant construeix amb les peces i no fa anar la tauleta.',
    'Xogo de mesa para familias e aulas. A persoa adulta media a quenda. A criatura constrúe coas pezas e non manexa a tableta.',
  ),
  udlPathways: {
    representation: adult(
      'El paso de cebra, las flechas de la rotonda y la barrera se ven en la capa de revelación y se pueden señalar con el dedo sobre la mesa.',
      'The zebra crossing, the roundabout arrows and the barrier show on the reveal layer and can be pointed at on the table.',
      'El pas de vianants, les fletxes de la rotonda i la barrera es veuen a la capa de revelació i es poden assenyalar sobre la taula.',
      'O paso de peóns, as frechas da rotonda e a barreira vense na capa de revelación e pódense sinalar sobre a mesa.',
    ),
    engagement: adult(
      'Hay tres papeles claros: quien guía, quien conduce y quien cruza a pie.',
      'There are three clear roles: guide, driver and person on foot.',
      'Hi ha tres papers clars: qui guia, qui condueix i qui creua a peu.',
      'Hai tres papeis claros: quen guía, quen conduce e quen cruza a pé.',
    ),
    expression: adult(
      'La criatura muestra el turno moviendo la barrera y el vehículo. La persona adulta confirma con un toque.',
      'The child shows the turn by moving the barrier and the vehicle. The adult confirms with a tap.',
      'L\'infant mostra el torn movent la barrera i el vehicle. La persona adulta confirma amb un toc.',
      'A criatura amosa a quenda movendo a barreira e o vehículo. A persoa adulta confirma cun toque.',
    ),
  },
  tabletStandSpec: {
    heightCm: 26,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    PIECE('S8-POL-BASE', adult('Base de la estación', 'Station base', 'Base de l\'estació', 'Base da estación'), 80),
    PIECE('S8-BARRERA', adult('Barrera del cruce', 'Crossing barrier', 'Barrera del pas', 'Barreira do cruce'), 88),
    PIECE('S8-POL-PATRULLA', adult('Patrulla', 'Patrol vehicle', 'Patrulla', 'Patrulla'), 81),
    PIECE('S8-POL-ROTONDA', adult('Rotonda', 'Roundabout', 'Rotonda', 'Rotonda'), 82),
  ],
  events: setWithLua.events,
  challenges: [
    {
      id: 'S8-C1',
      number: 1,
      title: adult(
        'El cruce de turnos',
        'The turn-taking crossing',
        'El pas de torns',
        'O cruce de quendas',
      ),
      ageBand: '4-5',
      neuroStage: 'I4',
      estimatedMinutes: 8,
      scale: 'G',
      skillAxes: ['interaction_pragmatics', 'lexicon_semantics'],
      targetEvents: ['S8.BARRERA_BAJA', 'S8.PEATON_CRUZA', 'S8.BARRERA_SUBE', 'S8.ROTONDA_COMPLETA'],
      cycle: CYCLE,
      achievementCriterion: adult(
        'La mesa muestra barrera baja, cruce, barrera alta y una vuelta completa a la rotonda, en ese orden.',
        'The table shows barrier down, a crossing, barrier up and a full trip around the roundabout, in that order.',
        'La taula mostra barrera baixada, creuament, barrera alta i una volta completa a la rotonda, en aquest ordre.',
        'A mesa amosa barreira baixa, cruce, barreira alta e unha volta completa á rotonda, nesa orde.',
      ),
      qualitativeObservation: adult(
        'La persona adulta anota si hubo espera o entrada a la vez. No hay puntuación.',
        'The adult notes whether there was a wait or a double entry. There is no score.',
        'La persona adulta anota si hi ha hagut espera o entrada alhora. No hi ha puntuació.',
        'A persoa adulta anota se houbo espera ou entrada á vez. Non hai puntuación.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S8-CARD-CRUCE',
      title: adult('Avenida con cruce', 'Avenue with a crossing', 'Avinguda amb pas', 'Avenida con cruce'),
      targetPieces: ['S8-POL-BASE', 'S8-BARRERA', 'S8-POL-PATRULLA', 'S8-POL-ROTONDA'],
    },
  ],
  revealLayer: {
    id: 'set_oficios',
    description: adult(
      'Nodo policia de set_oficios: paso de cebra, flechas de rotonda y barrera de luz. Animación celebrate.',
      'Police node of set_oficios: zebra crossing, roundabout arrows and a light barrier. Animation celebrate.',
      'Node policia de set_oficios: pas de vianants, fletxes de rotonda i barrera de llum. Animació celebrate.',
      'Nodo policia de set_oficios: paso de peóns, frechas de rotonda e barreira de luz. Animación celebrate.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: { songIds: ['lua_song_09'], gameIds: ['lua_game_07'] },
  story: {
    storyId: 'lua_story_10',
    anticipationMicroStory: adult(
      'Hoy la mesa es una calle pequeña. Hay una barrera, una patrulla y una rotonda. Cada cual tiene su turno.',
      'Today the table is a small street. There is a barrier, a patrol and a roundabout. Everyone has a turn.',
      'Avui la taula és un carrer petit. Hi ha una barrera, una patrulla i una rotonda. Cadascú té el seu torn.',
      'Hoxe a mesa é unha rúa pequena. Hai unha barreira, unha patrulla e unha rotonda. Cada quen ten a súa quenda.',
    ),
    closingMicroStory: adult(
      'La calle queda en calma. La barrera descansa arriba y las piezas vuelven a su caja.',
      'The street is calm again. The barrier rests up and the pieces go back in the box.',
      'El carrer torna a la calma. La barrera reposa amunt i les peces tornen a la caixa.',
      'A rúa queda en calma. A barreira descansa arriba e as pezas volven á caixa.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'BlockList',
      blockParam: 'lenguaje',
      connectionReason: adult(
        'En mesa se repiten para, espera, cruza, adelante y alrededor, con las mismas piezas del cruce.',
        'At the table, stop, wait, cross, go and around are repeated with the same crossing pieces.',
        'A taula es repeteixen atura\'t, espera, creua, endavant i al voltant, amb les mateixes peces del pas.',
        'Na mesa repítense para, agarda, cruza, adiante e arredor, coas mesmas pezas do cruce.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S8',
};

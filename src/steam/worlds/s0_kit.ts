// Set 0 · Kit común. SET_SOLO (AR-S00) y SET_WITH_LUA (AR-SL00).
// La secuencia causal es la que ya acepta el motor: cabeza, zócalo, placa.
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
  'Pieza de mesa. La coloca y la guarda la persona adulta.',
  'Table piece. The adult places it and puts it away.',
  'Peça de taula. La posa i la desa la persona adulta.',
  'Peza de mesa. Colócaa e gárdaa a persoa adulta.',
);

function piece(
  code: string,
  name: AdultText,
  quantity: number,
  scale: WorldPieceSpec['scale'],
  instanceMarkerIds: number[],
  detectionMethod: DetectionMethod,
): WorldPieceSpec {
  return { code, name, quantity, scale, instanceMarkerIds, detectionMethod, safetyNotes: SAFE };
}

function ev(input: WorldEventSpec): WorldEventSpec {
  if (!input.methods.includes('adult_tap')) {
    throw new Error(`${input.id}: falta adult_tap.`);
  }
  return input;
}

const S0_ORDER = CAUSAL_SEQUENCES.S0[0];

const EVENTS: WorldEventSpec[] = [
  ev({
    id: 'S0.CABEZA_ENCAJADA',
    title: adult('Cabeza encajada', 'Head seated', 'Cap encaixat', 'Cabeza encaixada'),
    childAction: adult(
      'La criatura gira la llave hasta que baja en el hueco.',
      'The child turns the key until it drops into the slot.',
      'La criatura gira la clau fins que baixa al buit.',
      'A criatura xira a chave ata que baixa no oco.',
    ),
    methods: ['marker', 'occlusion', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'expectante',
      light: 'TENUE_CUATRO',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Fit it in!',
      adultHint: adult(
        'Delante: la llave mira al frente y entra. Detrás: no entra.',
        'Front: the key faces forward and fits. Back: it does not fit.',
        'Davant: la clau mira endavant i entra. Darrere: no entra.',
        'Diante: a chave mira á fronte e entra. Detrás: non entra.',
      ),
      spatialCategory: 'orientation',
    },
  }),
  ev({
    id: 'S0.LUA_EN_ZOCALO',
    title: adult('Lúa en el zócalo', 'Lúa in the socket', 'Lúa al sòcol', 'Lúa no zócolo'),
    childAction: adult(
      'La criatura asienta el cuerpo en la cuna del zócalo.',
      'The child seats the body in the socket cradle.',
      'La criatura asseu el cos al bressol del sòcol.',
      'A criatura asenta o corpo no berce do zócolo.',
    ),
    methods: ['marker', 'occlusion', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'atenta',
      light: 'TENUE_CUATRO',
      haptic: 'CELEBRA_CORTO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Fit it in!',
      adultHint: adult(
        'Dentro de la cuna. Fuera, todavía no está sentada.',
        'Inside the cradle. Outside, she is not seated yet.',
        'Dins del bressol. Fora, encara no està asseguda.',
        'Dentro do berce. Fóra, aínda non está sentada.',
      ),
      spatialCategory: 'position',
    },
  }),
  ev({
    id: 'S0.PLACA_LEIDA',
    title: adult('Placa leída', 'Plate read', 'Placa llegida', 'Placa lida'),
    childAction: adult(
      'La criatura desliza una placa de identidad en el zócalo.',
      'The child slides an identity plate into the socket.',
      'La criatura fa lliscar una placa d’identitat al sòcol.',
      'A criatura desliza unha placa de identidade no zócolo.',
    ),
    methods: ['marker', 'occlusion', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'celebra_corta',
      pictoKey: picto('estrella'),
      light: 'TENUE_CUATRO',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Match the shape!',
      adultHint: adult(
        'Cada placa tiene un relieve distinto: inicio, meta, escucha, receptor, frontal, nivel, jardín.',
        'Each plate has its own relief: start, goal, listen, catcher, front, level, garden.',
        'Cada placa té un relleu propi: inici, meta, escolta, receptor, frontal, nivell, jardí.',
        'Cada placa ten un relevo propio: inicio, meta, escoita, receptor, frontal, nivel, xardín.',
      ),
      spatialCategory: 'shapes',
    },
  }),
];

const CYCLE_SOLO: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Desliza la placa JARDIN en el zócalo K-ZOCALO-G, con el relieve hacia la mesa. El contorno del encaje se ilumina. Espera cinco segundos en silencio.',
      'Slide the JARDIN plate into socket K-ZOCALO-G, relief toward the table. The fit outline lights up. Wait five seconds in silence.',
      'Fes lliscar la placa JARDIN al sòcol K-ZOCALO-G, amb el relleu cap a la taula. El contorn de l’encaix s’il·lumina. Espera cinc segons en silenci.',
      'Desliza a placa JARDIN no zócolo K-ZOCALO-G, co relevo cara á mesa. O contorno do encaixe acéndese. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      '¿Entra en cualquier sentido o solo en uno?',
      'Does it fit either way, or only one way?',
      'Entra de qualsevol manera o només d’una?',
      'Entra en calquera sentido ou só nun?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Ofrece las siete placas, una a una. La criatura las toca y las encaja. Tú confirmas cada encaje con el botón.',
      'Offer the seven plates, one by one. The child feels them and fits them. You confirm each fit with the button.',
      'Ofereix les set plaques, una a una. La criatura les toca i les encaixa. Tu confirmes cada encaix amb el botó.',
      'Ofrece as sete placas, unha a unha. A criatura tócaas e encaíxaas. Ti confirmas cada encaixe co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Por dónde entra esta placa?',
        'Which way does this plate go in?',
        'Per on entra aquesta placa?',
        'Por onde entra esta placa?',
      ),
      level2PhysicalModel: adult(
        'Gira la placa hasta que el relieve coincida con el hueco y empújala.',
        'Turn the plate until the relief matches the slot, then push it in.',
        'Gira la placa fins que el relleu coincideixi amb el buit i empeny-la.',
        'Xira a placa ata que o relevo coincida co oco e empúxaa.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Coloca los dos zócalos a tres módulos de distancia y empareja las placas INICIO y META.',
      'Place the two sockets three modules apart and match the INICIO and META plates.',
      'Col·loca els dos sòcols a tres mòduls de distància i aparella les plaques INICIO i META.',
      'Coloca os dous zócolos a tres módulos de distancia e emparella as placas INICIO e META.',
    ),
    transferQuestion: adult(
      '¿Qué otra placa pondrías al lado de INICIO si mañana hay un camino?',
      'Which other plate would you put next to INICIO if there is a path tomorrow?',
      'Quina altra placa posaries al costat d’INICIO si demà hi ha un camí?',
      'Que outra placa porías ao lado de INICIO se mañá hai un camiño?',
    ),
  },
};

const CYCLE_WITH_LUA: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Asienta a Lúa en el zócalo K-ZOCALO-G. La llave asimétrica solo baja mirando al frente. Espera cinco segundos en silencio.',
      'Seat Lúa in socket K-ZOCALO-G. The asymmetric key drops in only when it faces forward. Wait five seconds in silence.',
      'Assenta la Lúa al sòcol K-ZOCALO-G. La clau asimètrica només baixa mirant endavant. Espera cinc segons en silenci.',
      'Asenta a Lúa no zócolo K-ZOCALO-G. A chave asimétrica só baixa mirando á fronte. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      '¿Hacia dónde mira Lúa cuando la llave encaja?',
      'Which way is Lúa facing when the key fits?',
      'Cap on mira la Lúa quan la clau encaixa?',
      'Cara a onde mira Lúa cando a chave encaixa?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Encaja la cabeza, asienta el cuerpo y lee una placa. La cara de Lúa cambia en el cristal o en la tableta. Tú confirmas con el botón.',
      'Fit the head, seat the body, and read a plate. Lúa’s face changes on the device or on the tablet. You confirm with the button.',
      'Encaixa el cap, asseu el cos i llegeix una placa. La cara de la Lúa canvia al cristall o a la tauleta. Tu confirmes amb el botó.',
      'Encaixa a cabeza, asenta o corpo e le unha placa. A cara de Lúa cambia no cristal ou na tableta. Ti confirmas co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿La llave mira hacia delante o hacia atrás?',
        'Does the key face forward or back?',
        'La clau mira endavant o endarrere?',
        'A chave mira cara a diante ou cara a atrás?',
      ),
      level2PhysicalModel: adult(
        'Gira a Lúa hasta que la llave baje en el hueco y el cuerpo quede sentado.',
        'Turn Lúa until the key drops into the slot and the body sits down.',
        'Gira la Lúa fins que la clau baixi al buit i el cos quedi assegut.',
        'Xira a Lúa ata que a chave baixe no oco e o corpo quede sentado.',
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Con Lúa en el zócalo, pon la placa INICIO delante y la placa META al final de tres módulos.',
      'With Lúa in the socket, put the INICIO plate in front and the META plate at the end of three modules.',
      'Amb la Lúa al sòcol, posa la placa INICIO davant i la placa META al final de tres mòduls.',
      'Con Lúa no zócolo, pon a placa INICIO diante e a placa META ao final de tres módulos.',
    ),
    transferQuestion: adult(
      'Si Lúa mira atrás, ¿la llave entra en el zócalo?',
      'If Lúa faces back, does the key fit in the socket?',
      'Si la Lúa mira endarrere, la clau entra al sòcol?',
      'Se Lúa mira atrás, a chave entra no zócolo?',
    ),
  },
};

const METHODS_SOLO: DetectionMethod[] = ['marker', 'occlusion', 'adult_tap'];

export const SET_SOLO: SteamActivity = {
  id: 'AR-S00',
  worldId: 'S0',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: METHODS_SOLO,
  childSpeech: speech(
    '¡Encaja! ¡Une la forma!',
    'Encaixa! Une a forma!',
    'Sartu! Parekatu forma!',
    '¡Mételo! ¡Une la forma!',
    'Fit it in! Match the shape!',
    'Encaixa-ho! Aparella la forma!',
  ),
  englishTpr: 'Fit it in! Match the shape!',
  cycle: CYCLE_SOLO,
  events: EVENTS,
};

export const SET_WITH_LUA: SteamActivity = {
  id: 'AR-SL00',
  worldId: 'S0',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: METHODS_SOLO,
  childSpeech: speech(
    '¡Encaja a Lúa! ¡Une la placa!',
    'Encaixa a Lúa! Une a placa!',
    'Sartu Lúa! Parekatu plaka!',
    '¡Mete a Lúa! ¡Une la placa!',
    'Fit Lúa in! Match the plate!',
    'Encaixa la Lúa! Aparella la placa!',
  ),
  englishTpr: 'Fit Lúa in! Match the plate!',
  cycle: CYCLE_WITH_LUA,
  events: EVENTS,
};

export const MANIFEST: WorldManifest = {
  id: 'S0',
  orderIndex: 0,
  title: adult(
    'El taller de encajes y placas',
    'The fit and plate workshop',
    'El taller d’encaixos i plaques',
    'O taller de encaixes e placas',
  ),
  subtitleEn: 'Common kit: asymmetric key and seven identity plates',
  phenomenon: adult(
    'La llave asimétrica entra solo mirando al frente. Cada placa de identidad tiene un relieve distinto.',
    'The asymmetric key fits only when it faces forward. Each identity plate has its own relief.',
    'La clau asimètrica entra només mirant endavant. Cada placa d’identitat té un relleu propi.',
    'A chave asimétrica entra só mirando á fronte. Cada placa de identidade ten un relevo propio.',
  ),
  ageRange: '0-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['orientation', 'shapes'],
  skillAxes: ['lexicon_semantics', 'interaction_pragmatics'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: adult(
    'Familia y aula, de 0 a 6 años. La persona adulta maneja la tableta.',
    'Home and classroom, ages 0 to 6. The adult handles the tablet.',
    'Família i aula, de 0 a 6 anys. La persona adulta fa servir la tauleta.',
    'Familia e aula, de 0 a 6 anos. A persoa adulta manexa a tableta.',
  ),
  udlPathways: {
    representation: adult(
      'El encaje se ve en el relieve, se oye al asentarse y se nombra con una palabra corta.',
      'The fit is seen in the relief, heard when it seats, and named with one short word.',
      'L’encaix es veu al relleu, se sent en assentar-se i s’anomena amb una paraula curta.',
      'O encaixe vese no relevo, óese ao asentar e nómease cunha palabra curta.',
    ),
    engagement: adult(
      'La persona adulta marca el ritmo. Parar y guardar las placas es parte del juego.',
      'The adult sets the pace. Stopping and putting the plates away is part of the play.',
      'La persona adulta marca el ritme. Aturar-se i desar les plaques forma part del joc.',
      'A persoa adulta marca o ritmo. Parar e gardar as placas forma parte do xogo.',
    ),
    expression: adult(
      'La criatura encaja, señala o mira. Nadie tiene que hablar para seguir. El adulto confirma con el botón.',
      'The child fits, points, or looks. Nobody has to speak to continue. The adult confirms with the button.',
      'La criatura encaixa, assenyala o mira. Ningú no ha de parlar per continuar. L’adult confirma amb el botó.',
      'A criatura encaixa, sinala ou mira. Ninguén ten que falar para seguir. A persoa adulta confirma co botón.',
    ),
  },
  tabletStandSpec: {
    heightCm: 22,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    piece('K-ZOCALO-G', adult('Zócalo universal', 'Universal socket', 'Sòcol universal', 'Zócolo universal'), 2, 'G', [1, 101], 'marker'),
    piece('K-PLACA-INICIO', adult('Placa inicio', 'Start plate', 'Placa inici', 'Placa inicio'), 1, 'G', [2], 'marker'),
    piece('K-PLACA-META', adult('Placa meta', 'Goal plate', 'Placa meta', 'Placa meta'), 1, 'G', [3], 'marker'),
    piece('K-PLACA-ESCUCHA', adult('Placa escucha', 'Listen plate', 'Placa escolta', 'Placa escoita'), 1, 'G', [4], 'marker'),
    piece('K-PLACA-RECEPTOR', adult('Placa receptor', 'Catcher plate', 'Placa receptor', 'Placa receptor'), 1, 'G', [5], 'marker'),
    piece('K-PLACA-FRONTAL', adult('Placa frontal', 'Front plate', 'Placa frontal', 'Placa frontal'), 1, 'G', [6], 'marker'),
    piece('K-PLACA-NIVEL', adult('Placa nivel', 'Level plate', 'Placa nivell', 'Placa nivel'), 1, 'G', [7], 'marker'),
    piece('K-PLACA-JARDIN', adult('Placa jardín', 'Garden plate', 'Placa jardí', 'Placa xardín'), 1, 'G', [8], 'marker'),
    piece('K-LOMO-G', adult('Lomo con marcador', 'Marked back', 'Llom amb marcador', 'Lombo con marcador'), 1, 'G', [9], 'marker'),
    piece('K-PATIN-G', adult('Patín de dos pivotes', 'Two-pivot skate', 'Patí de dos pivots', 'Patín de dous pivotes'), 1, 'G', [10], 'marker'),
  ],
  events: EVENTS,
  challenges: [
    {
      id: 'S0-C1',
      number: 1,
      title: adult('Encajar y leer la placa', 'Fit and read the plate', 'Encaixar i llegir la placa', 'Encaixar e ler a placa'),
      ageBand: '3-4',
      neuroStage: 'I4',
      estimatedMinutes: 10,
      scale: 'G',
      skillAxes: ['lexicon_semantics', 'interaction_pragmatics'],
      targetEvents: [...S0_ORDER],
      cycle: CYCLE_WITH_LUA,
      achievementCriterion: adult(
        'La cabeza encaja, Lúa queda en el zócalo y una placa queda leída, en ese orden. El adulto confirma con el botón.',
        'The head fits, Lúa sits in the socket, and one plate is read, in that order. The adult confirms with the button.',
        'El cap encaixa, la Lúa queda al sòcol i una placa queda llegida, en aquest ordre. L’adult confirma amb el botó.',
        'A cabeza encaixa, Lúa queda no zócolo e unha placa queda lida, nesa orde. A persoa adulta confirma co botón.',
      ),
      qualitativeObservation: adult(
        'Anota si la llave entra al primer giro o después de probar el otro sentido.',
        'Note whether the key fits on the first turn or after trying the other way.',
        'Anota si la clau entra al primer gir o després de provar l’altre sentit.',
        'Anota se a chave entra ao primeiro xiro ou despois de probar o outro sentido.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S0-CARD-PLACAS',
      title: adult('Las siete placas', 'The seven plates', 'Les set plaques', 'As sete placas'),
      targetPieces: [
        'K-PLACA-INICIO',
        'K-PLACA-META',
        'K-PLACA-ESCUCHA',
        'K-PLACA-RECEPTOR',
        'K-PLACA-FRONTAL',
        'K-PLACA-NIVEL',
        'K-PLACA-JARDIN',
      ],
    },
  ],
  revealLayer: {
    id: 'set_kit_s0',
    description: adult(
      'Contorno luminoso del encaje y símbolo de la placa al entrar en el zócalo.',
      'Lit outline of the fit and the plate symbol as it enters the socket.',
      'Contorn lluminós de l’encaix i símbol de la placa en entrar al sòcol.',
      'Contorno luminoso do encaixe e símbolo da placa ao entrar no zócolo.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: {
    songIds: ['lua_song_10'],
    gameIds: ['lua_game_08'],
  },
  story: {
    storyId: 'lua_story_02',
    anticipationMicroStory: adult(
      'Lúa busca el hueco que tiene su misma forma. Solo uno la deja sentarse.',
      'Lúa looks for the slot that matches her shape. Only one lets her sit.',
      'La Lúa busca el buit que té la seva forma. Només un la deixa seure.',
      'Lúa busca o oco que ten a súa forma. Só un a deixa sentar.',
    ),
    closingMicroStory: adult(
      'Cada placa vuelve a su sitio. El zócalo queda vacío y la mesa, despejada.',
      'Each plate goes back to its place. The socket is empty and the table is clear.',
      'Cada placa torna al seu lloc. El sòcol queda buit i la taula, neta.',
      'Cada placa volta ao seu sitio. O zócolo queda baleiro e a mesa, despexada.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'BlockList',
      blockParam: 'lenguaje',
      connectionReason: adult(
        'En la mesa se vuelven a nombrar delante, detrás, dentro y fuera, con piezas grandes.',
        'At the table, front, back, inside, and outside are named again, with large pieces.',
        'A la taula es tornen a anomenar davant, darrere, dins i fora, amb peces grans.',
        'Na mesa vólvense nomear diante, detrás, dentro e fóra, con pezas grandes.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S0',
};

const POSITIVE: ChallengeInput = { kind: 'causal', worldId: 'S0', states: S0_ORDER };
const NEGATIVE: ChallengeInput = {
  kind: 'causal',
  worldId: 'S0',
  states: ['S0.PLACA_LEIDA', 'S0.LUA_EN_ZOCALO', 'S0.CABEZA_ENCAJADA'],
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
    id: 'S0-positiva',
    polarity: 'positive',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'K-ZOCALO-G', markerId: 1 },
    challenge: POSITIVE,
  },
  {
    id: 'S0-negativa',
    polarity: 'negative',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'K-ZOCALO-G', markerId: 1 },
    challenge: NEGATIVE,
  },
  {
    id: 'S0-oclusion-parcial',
    polarity: 'partial_occlusion',
    frames: VISUAL_STABLE_FRAMES - 1,
    observation: { method: 'marker', pieceCode: 'K-ZOCALO-G', markerId: 1 },
    challenge: POSITIVE,
  },
  {
    id: 'S0-adult-tap',
    polarity: 'positive',
    frames: framesRequired('adult_tap'),
    observation: { method: 'adult_tap' },
    challenge: POSITIVE,
  },
];

function assertReplay(): void {
  for (const item of REPLAY_CASES) {
    const verdict = evaluateChallenge(item.challenge);
    const wantOk = item.polarity !== 'negative';
    if (verdict.ok !== wantOk) {
      throw new Error(`${item.id}: el motor responde ${verdict.reason}.`);
    }
  }
  if (translateExpression('expectante').index !== 16) {
    throw new Error('S0: la cabeza encajada tiene que ir a la cara #16.');
  }
  if (translateExpression('atenta').index !== 1 || translateExpression('celebra_corta').index !== 4) {
    throw new Error('S0: zócalo y placa no coinciden con las caras del motor.');
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

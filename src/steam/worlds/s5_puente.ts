// Set 5 · Puente. SET_SOLO (AR-S05) y SET_WITH_LUA (AR-SL05).
// El equilibrio es el del motor: 40 g en el alvéolo 2 y 20 g en el 4,
// momentos iguales, y |theta| dentro de BALANCE_THETA_MAX_DEG.
import { PICTO_KEYS } from '../../ValeriaPixelArt';
import {
  BALANCE_THETA_MAX_DEG,
  evaluateChallenge,
  evaluateStaticBalance,
  staticMoment,
  type ChallengeInput,
  type MomentArm,
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

export const S5_ARMS: readonly MomentArm[] = [
  { massG: 40, distanceSlots: 2, side: 'left' },
  { massG: 20, distanceSlots: 4, side: 'right' },
];

const MOMENTO_IZQ = staticMoment(S5_ARMS[0].massG, S5_ARMS[0].distanceSlots);
const MOMENTO_DER = staticMoment(S5_ARMS[1].massG, S5_ARMS[1].distanceSlots);

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
  'Pieza de mesa. Las masas las coloca y las guarda la persona adulta.',
  'Table piece. The adult places the masses and puts them away.',
  'Peça de taula. Les masses les posa i les desa la persona adulta.',
  'Peza de mesa. As masas colócaas e gárdaas a persoa adulta.',
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
  return input;
}

const EQUILIBRIO_HINT: AdultText = adult(
  `40 g en el alvéolo 2 equilibran 20 g en el alvéolo 4: ${MOMENTO_IZQ} y ${MOMENTO_DER} son el mismo par. La viga queda a ${BALANCE_THETA_MAX_DEG}° o menos.`,
  `40 g in slot 2 balance 20 g in slot 4: ${MOMENTO_IZQ} and ${MOMENTO_DER} are the same moment. The beam stays at ${BALANCE_THETA_MAX_DEG}° or less.`,
  `40 g a l’alvèol 2 equilibren 20 g a l’alvèol 4: ${MOMENTO_IZQ} i ${MOMENTO_DER} són el mateix parell. La biga queda a ${BALANCE_THETA_MAX_DEG}° o menys.`,
  `40 g no alvéolo 2 equilibran 20 g no alvéolo 4: ${MOMENTO_IZQ} e ${MOMENTO_DER} son o mesmo par. A viga queda a ${BALANCE_THETA_MAX_DEG}° ou menos.`,
);

const EVENTS: WorldEventSpec[] = [
  ev({
    id: 'S5.MASA_COLOCADA',
    title: adult('Masa colocada', 'Mass placed', 'Massa col·locada', 'Masa colocada'),
    childAction: adult(
      'La criatura deja una masa en un alvéolo de la viga.',
      'The child sets a mass in a slot of the beam.',
      'La criatura deixa una massa en un alvèol de la biga.',
      'A criatura deixa unha masa nun alvéolo da viga.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'atenta',
      pictoKey: picto('puente'),
      light: 'TENUE_CUATRO',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Heavy, light, level the bridge!',
      adultHint: adult('Cerca del centro pesa menos en la viga. Lejos, pesa más.', 'Near the center it pulls less on the beam. Far away, it pulls more.', 'A prop del centre estira menys la biga. Lluny, estira més.', 'Preto do centro pesa menos na viga. Lonxe, pesa máis.'),
      spatialCategory: 'position',
    },
  }),
  ev({
    id: 'S5.INCLINA_IZQ',
    title: adult('Inclina a la izquierda', 'Tips left', 'Inclina a l’esquerra', 'Inclina á esquerda'),
    childAction: adult(
      'El brazo izquierdo baja. La criatura lo mira sin sujetar la viga.',
      'The left arm goes down. The child watches it without holding the beam.',
      'El braç esquerre baixa. La criatura el mira sense aguantar la biga.',
      'O brazo esquerdo baixa. A criatura mírao sen suxeitar a viga.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'diversion',
      light: 'DIR_IZQ',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Heavy, light, level the bridge!',
      adultHint: adult(
        'Si la viga pasa de 4°, el lado que baja es el que pesa más.',
        'If the beam passes 4°, the side that goes down is the heavier one.',
        'Si la biga passa de 4°, el costat que baixa és el que pesa més.',
        'Se a viga pasa de 4°, o lado que baixa é o que pesa máis.',
      ),
      spatialCategory: 'quantity',
    },
  }),
  ev({
    id: 'S5.INCLINA_DCHA',
    title: adult('Inclina a la derecha', 'Tips right', 'Inclina a la dreta', 'Inclina á dereita'),
    childAction: adult(
      'El brazo derecho baja. La criatura lo mira sin sujetar la viga.',
      'The right arm goes down. The child watches it without holding the beam.',
      'El braç dret baixa. La criatura el mira sense aguantar la biga.',
      'O brazo dereito baixa. A criatura mírao sen suxeitar a viga.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'diversion',
      light: 'DIR_DCHA',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Heavy, light, level the bridge!',
      adultHint: adult(
        'La luz señala el brazo que baja.',
        'The light points to the arm that goes down.',
        'El llum assenyala el braç que baixa.',
        'A luz sinala o brazo que baixa.',
      ),
      spatialCategory: 'quantity',
    },
  }),
  ev({
    id: 'S5.EQUILIBRIO',
    title: adult('Equilibrio', 'Balance', 'Equilibri', 'Equilibrio'),
    childAction: adult(
      'La criatura deja la viga quieta, con el mismo par a los dos lados.',
      'The child leaves the beam still, with the same moment on both sides.',
      'La criatura deixa la biga quieta, amb el mateix parell als dos costats.',
      'A criatura deixa a viga quieta, co mesmo par aos dous lados.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'alivio',
      pictoKey: picto('puente'),
      light: 'TENUE_CUATRO',
      haptic: 'RONRONEO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Heavy, light, level the bridge!',
      adultHint: EQUILIBRIO_HINT,
      spatialCategory: 'quantity',
    },
  }),
  ev({
    id: 'S5.PUENTE_ESTABLE',
    title: adult('Puente firme', 'Steady bridge', 'Pont ferm', 'Ponte firme'),
    childAction: adult(
      'Con la viga equilibrada, la criatura coloca los clips y el puente queda firme.',
      'With the beam balanced, the child places the clips and the bridge stays steady.',
      'Amb la biga equilibrada, la criatura col·loca els clips i el pont queda ferm.',
      'Coa viga equilibrada, a criatura coloca os clips e a ponte queda firme.',
    ),
    methods: ['marker', 'adult_tap'],
    turn: 'motor',
    reaction: {
      expression: 'celebra_exito',
      pictoKey: picto('puente'),
      light: 'TENUE_CUATRO',
      haptic: 'CELEBRA_CORTO',
      screenOverlay: 'NONE',
    },
    word: {
      englishTpr: 'Level the bridge!',
      adultHint: adult(
        'Los cuatro clips sujetan la viga que ya estaba en equilibrio.',
        'The four clips hold the beam that was already in balance.',
        'Els quatre clips subjecten la biga que ja estava en equilibri.',
        'Os catro clips suxeitan a viga que xa estaba en equilibrio.',
      ),
      spatialCategory: 'dimensions',
    },
  }),
];

const CYCLE_SOLO: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Coloca la masa de 60 g en un extremo de la viga, sobre el fulcro. La flecha de ese lado se alarga y la viga baja. Espera cinco segundos en silencio.',
      'Place the 60 g mass at one end of the beam, on the fulcrum. That side’s arrow grows and the beam tips. Wait five seconds in silence.',
      'Col·loca la massa de 60 g en un extrem de la biga, sobre el fulcre. La fletxa d’aquell costat s’allarga i la biga baixa. Espera cinc segons en silenci.',
      'Coloca a masa de 60 g nun extremo da viga, sobre o fulcro. A frecha dese lado alonga e a viga baixa. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      '¿Qué lado baja, el de la masa o el vacío?',
      'Which side goes down, the one with the mass or the empty one?',
      'Quin costat baixa, el de la massa o el buit?',
      'Que lado baixa, o da masa ou o baleiro?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      'Prueba a equilibrar 40 g con dos piezas de 20 g, o acerca la pieza más pesada al centro. No hace falta leer el número: se mira si la viga se queda quieta. Tú confirmas con el botón.',
      'Try balancing 40 g with two 20 g pieces, or move the heavier piece toward the center. The number does not have to be read: watch whether the beam stays still. You confirm with the button.',
      'Prova d’equilibrar 40 g amb dues peces de 20 g, o acosta la peça més pesada al centre. No cal llegir el número: es mira si la biga es queda quieta. Tu confirmes amb el botó.',
      'Proba a equilibrar 40 g con dúas pezas de 20 g, ou achega a peza máis pesada ao centro. Non fai falta ler o número: mírase se a viga queda quieta. Ti confirmas co botón.',
    ),
    hints: {
      level1Socratic: adult(
        '¿Esta masa está cerca del centro o lejos?',
        'Is this mass near the center or far from it?',
        'Aquesta massa és a prop del centre o lluny?',
        'Esta masa está preto do centro ou lonxe?',
      ),
      level2PhysicalModel: adult(
        `Pon 40 g en el alvéolo 2 de un lado y 20 g en el alvéolo 4 del otro. ${MOMENTO_IZQ} y ${MOMENTO_DER} tienen que coincidir, y la viga no pasa de ${BALANCE_THETA_MAX_DEG}°.`,
        `Put 40 g in slot 2 on one side and 20 g in slot 4 on the other. ${MOMENTO_IZQ} and ${MOMENTO_DER} have to match, and the beam does not pass ${BALANCE_THETA_MAX_DEG}°.`,
        `Posa 40 g a l’alvèol 2 d’un costat i 20 g a l’alvèol 4 de l’altre. ${MOMENTO_IZQ} i ${MOMENTO_DER} han de coincidir, i la biga no passa de ${BALANCE_THETA_MAX_DEG}°.`,
        `Pon 40 g no alvéolo 2 dun lado e 20 g no alvéolo 4 do outro. ${MOMENTO_IZQ} e ${MOMENTO_DER} teñen que coincidir, e a viga non pasa de ${BALANCE_THETA_MAX_DEG}°.`,
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Cuando la viga esté quieta, sujétala con los cuatro clips y cruza un vehículo de un lado al otro.',
      'When the beam is still, fasten it with the four clips and take a vehicle from one side to the other.',
      'Quan la biga estigui quieta, subjecta-la amb els quatre clips i passa un vehicle d’un costat a l’altre.',
      'Cando a viga estea quieta, suxeítaa cos catro clips e cruza un vehículo dun lado ao outro.',
    ),
    transferQuestion: adult(
      'Si acercas la masa pesada al fulcro, ¿el otro lado sube o baja?',
      'If you move the heavy mass toward the fulcrum, does the other side go up or down?',
      'Si acostes la massa pesada al fulcre, l’altre costat puja o baixa?',
      'Se achegas a masa pesada ao fulcro, o outro lado sobe ou baixa?',
    ),
  },
};

const CYCLE_WITH_LUA: TripartiteCycle = {
  observa: {
    phenomenonTrigger: adult(
      'Lúa está en la placa NIVEL, de espaldas a la criatura: su izquierda es el brazo izquierdo de la viga. Coloca 60 g en un extremo. Espera cinco segundos en silencio.',
      'Lúa is on the NIVEL plate, with her back to the child: her left is the left arm of the beam. Place 60 g at one end. Wait five seconds in silence.',
      'La Lúa és a la placa NIVEL, d’esquena a la criatura: la seva esquerra és el braç esquerre de la biga. Col·loca 60 g en un extrem. Espera cinc segons en silenci.',
      'Lúa está na placa NIVEL, de costas á criatura: a súa esquerda é o brazo esquerdo da viga. Coloca 60 g nun extremo. Agarda cinco segundos en silencio.',
    ),
    socraticQuestion: adult(
      '¿Lúa mira el lado que baja o el que se queda arriba?',
      'Is Lúa looking at the side that goes down, or the one that stays up?',
      'La Lúa mira el costat que baixa o el que es queda a dalt?',
      'Lúa mira o lado que baixa ou o que queda arriba?',
    ),
    mandatorySilenceSec: 5,
  },
  experimenta: {
    adultStepByStep: adult(
      `Busca el equilibrio que ya mide el motor: 40 g en el alvéolo 2 y 20 g en el 4, con la viga a ${BALANCE_THETA_MAX_DEG}° o menos. Si un lado baja de más, Lúa se divierte. Si queda quieta, se queda tranquila. Tú confirmas con el botón.`,
      `Find the balance the engine already measures: 40 g in slot 2 and 20 g in slot 4, with the beam at ${BALANCE_THETA_MAX_DEG}° or less. If one side tips too far, Lúa is amused. If it stays still, she stays calm. You confirm with the button.`,
      `Busca l’equilibri que ja mesura el motor: 40 g a l’alvèol 2 i 20 g al 4, amb la biga a ${BALANCE_THETA_MAX_DEG}° o menys. Si un costat baixa de més, la Lúa es diverteix. Si queda quieta, es queda tranquil·la. Tu confirmes amb el botó.`,
      `Busca o equilibrio que xa mide o motor: 40 g no alvéolo 2 e 20 g no 4, coa viga a ${BALANCE_THETA_MAX_DEG}° ou menos. Se un lado baixa de máis, Lúa divírtese. Se queda quieta, queda tranquila. Ti confirmas co botón.`,
    ),
    hints: {
      level1Socratic: adult(
        '¿Pesa más el lado que baja?',
        'Does the side that goes down weigh more?',
        'Pesa més el costat que baixa?',
        'Pesa máis o lado que baixa?',
      ),
      level2PhysicalModel: adult(
        EQUILIBRIO_HINT.es,
        EQUILIBRIO_HINT.en,
        EQUILIBRIO_HINT.ca,
        EQUILIBRIO_HINT.gl,
      ),
    },
  },
  construye: {
    tangibleMakeChallenge: adult(
      'Con Lúa delante del fulcro y la viga en equilibrio, pon los cuatro clips y cruza el puente.',
      'With Lúa in front of the fulcrum and the beam in balance, put on the four clips and cross the bridge.',
      'Amb la Lúa davant del fulcre i la biga en equilibri, posa els quatre clips i creua el pont.',
      'Con Lúa diante do fulcro e a viga en equilibrio, pon os catro clips e cruza a ponte.',
    ),
    transferQuestion: adult(
      'Si cambias el 40 g de alvéolo y dejas el 20 g donde está, ¿el par sigue igual?',
      'If you move the 40 g to another slot and leave the 20 g where it is, does the moment stay the same?',
      'Si canvies els 40 g d’alvèol i deixes els 20 g on són, el parell continua igual?',
      'Se cambias os 40 g de alvéolo e deixas os 20 g onde están, o par segue igual?',
    ),
  },
};

const METHODS: DetectionMethod[] = ['marker', 'adult_tap'];

export const SET_SOLO: SteamActivity = {
  id: 'AR-S05',
  worldId: 'S5',
  mode: 'SET_SOLO',
  bleRequired: false,
  methods: METHODS,
  childSpeech: speech(
    '¡Pesado, ligero, nivela el puente!',
    'Pesado, lixeiro, nivela a ponte!',
    'Astuna, arina, berdindu zubia!',
    '¡Pesado, liviano, nivela el puente!',
    'Heavy, light, level the bridge!',
    'Pesat, lleuger, anivella el pont!',
  ),
  englishTpr: 'Heavy, light, level the bridge!',
  cycle: CYCLE_SOLO,
  events: EVENTS,
};

export const SET_WITH_LUA: SteamActivity = {
  id: 'AR-SL05',
  worldId: 'S5',
  mode: 'SET_WITH_LUA',
  bleRequired: true,
  methods: METHODS,
  childSpeech: speech(
    '¡Nivela el puente! ¡Lúa mira!',
    'Nivela a ponte! Lúa mira!',
    'Berdindu zubia! Lúa begira dago.',
    '¡Nivela el puente! ¡Lúa mira!',
    'Level the bridge! Lúa is watching!',
    'Anivella el pont! La Lúa mira!',
  ),
  englishTpr: 'Level the bridge! Lúa is watching!',
  cycle: CYCLE_WITH_LUA,
  events: EVENTS,
};

export const MANIFEST: WorldManifest = {
  id: 'S5',
  orderIndex: 5,
  title: adult(
    'La balanza de momentos y palancas',
    'The moment and lever balance',
    'La balança de moments i palanques',
    'A balanza de momentos e pancas',
  ),
  subtitleEn: 'Equal moments and a beam within the engine tolerance',
  phenomenon: adult(
    `Una masa de 40 g en el alvéolo 2 equilibra una de 20 g en el alvéolo 4. El motor lo acepta si los dos pares valen ${MOMENTO_IZQ} y la viga no pasa de ${BALANCE_THETA_MAX_DEG}°.`,
    `A 40 g mass in slot 2 balances a 20 g mass in slot 4. The engine accepts it when both moments equal ${MOMENTO_IZQ} and the beam does not pass ${BALANCE_THETA_MAX_DEG}°.`,
    `Una massa de 40 g a l’alvèol 2 equilibra una de 20 g a l’alvèol 4. El motor ho accepta si els dos parells valen ${MOMENTO_IZQ} i la biga no passa de ${BALANCE_THETA_MAX_DEG}°.`,
    `Unha masa de 40 g no alvéolo 2 equilibra unha de 20 g no alvéolo 4. O motor acéptao se os dous pares valen ${MOMENTO_IZQ} e a viga non pasa de ${BALANCE_THETA_MAX_DEG}°.`,
  ),
  ageRange: '0-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['quantity', 'position', 'dimensions'],
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
      'El peso se ve en la inclinación, se siente al colocar la masa y se nombra: pesado, ligero, igual, cerca, lejos.',
      'Weight is seen in the tilt, felt when the mass is placed, and named: heavy, light, equal, near, far.',
      'El pes es veu en la inclinació, es nota en col·locar la massa i s’anomena: pesat, lleuger, igual, a prop, lluny.',
      'O peso vese na inclinación, séntese ao colocar a masa e nómease: pesado, lixeiro, igual, preto, lonxe.',
    ),
    engagement: adult(
      'Se puede probar sin leer números. Parar y quitar las masas es parte del juego.',
      'It can be tried without reading numbers. Stopping and taking the masses off is part of the play.',
      'Es pot provar sense llegir números. Aturar-se i treure les masses forma part del joc.',
      'Pódese probar sen ler números. Parar e quitar as masas forma parte do xogo.',
    ),
    expression: adult(
      'La criatura coloca, señala el lado que baja o espera. El adulto confirma con el botón.',
      'The child places, points to the side that goes down, or waits. The adult confirms with the button.',
      'La criatura col·loca, assenyala el costat que baixa o espera. L’adult confirma amb el botó.',
      'A criatura coloca, sinala o lado que baixa ou agarda. A persoa adulta confirma co botón.',
    ),
  },
  tabletStandSpec: {
    heightCm: 22,
    tiltDeg: 55,
    cameraMode: 'rear_tabletop',
    luaOrientation: 'child_sees_back',
  },
  pieces: [
    piece('S5-FUL-G', adult('Fulcro', 'Fulcrum', 'Fulcre', 'Fulcro'), 1, [550]),
    piece('S5-VIG-G', adult('Viga', 'Beam', 'Biga', 'Viga'), 1, [55]),
    piece('S5-MAS-20', adult('Masa de 20 g', '20 g mass', 'Massa de 20 g', 'Masa de 20 g'), 3, [551, 552, 553]),
    piece('S5-MAS-40', adult('Masa de 40 g', '40 g mass', 'Massa de 40 g', 'Masa de 40 g'), 3, [554, 555, 556]),
    piece('S5-MAS-60', adult('Masa de 60 g', '60 g mass', 'Massa de 60 g', 'Masa de 60 g'), 2, [557, 558]),
    piece('S5-PAS-G', adult('Clip pasador', 'Pin clip', 'Clip passador', 'Clip pasador'), 4, [559, 560, 561, 562]),
  ],
  events: EVENTS,
  challenges: [
    {
      id: 'S5-C1',
      number: 1,
      title: adult('El mismo par a los dos lados', 'The same moment on both sides', 'El mateix parell als dos costats', 'O mesmo par aos dous lados'),
      ageBand: '4-5',
      neuroStage: 'I4',
      estimatedMinutes: 12,
      scale: 'G',
      skillAxes: ['lexicon_semantics', 'interaction_pragmatics'],
      targetEvents: ['S5.MASA_COLOCADA', 'S5.INCLINA_IZQ', 'S5.INCLINA_DCHA', 'S5.EQUILIBRIO', 'S5.PUENTE_ESTABLE'],
      cycle: CYCLE_WITH_LUA,
      achievementCriterion: adult(
        `Los pares coinciden (${MOMENTO_IZQ} = ${MOMENTO_DER}) y la viga no pasa de ${BALANCE_THETA_MAX_DEG}°. Después, los clips dejan el puente firme. El adulto confirma con el botón.`,
        `The moments match (${MOMENTO_IZQ} = ${MOMENTO_DER}) and the beam does not pass ${BALANCE_THETA_MAX_DEG}°. Then the clips leave the bridge steady. The adult confirms with the button.`,
        `Els parells coincideixen (${MOMENTO_IZQ} = ${MOMENTO_DER}) i la biga no passa de ${BALANCE_THETA_MAX_DEG}°. Després, els clips deixen el pont ferm. L’adult confirma amb el botó.`,
        `Os pares coinciden (${MOMENTO_IZQ} = ${MOMENTO_DER}) e a viga non pasa de ${BALANCE_THETA_MAX_DEG}°. Despois, os clips deixan a ponte firme. A persoa adulta confirma co botón.`,
      ),
      qualitativeObservation: adult(
        'Anota si la criatura acerca la masa al centro o añade otra pieza al lado vacío.',
        'Note whether the child moves a mass toward the center or adds another piece on the empty side.',
        'Anota si la criatura acosta la massa al centre o afegeix una altra peça al costat buit.',
        'Anota se a criatura achega a masa ao centro ou engade outra peza no lado baleiro.',
      ),
    },
  ],
  modelCards: [
    {
      id: 'S5-CARD-40-20',
      title: adult('40 g frente a 20 g', '40 g against 20 g', '40 g contra 20 g', '40 g fronte a 20 g'),
      targetPieces: ['S5-VIG-G', 'S5-FUL-G', 'S5-MAS-40', 'S5-MAS-20'],
    },
  ],
  revealLayer: {
    id: 'set_puente',
    description: adult(
      'Flechas bajo cada alvéolo, tan largas como el par, y una plomada en el fulcro.',
      'Arrows under each slot, as long as the moment, and a plumb line on the fulcrum.',
      'Fletxes sota cada alvèol, tan llargues com el parell, i una plomada al fulcre.',
      'Frechas baixo cada alvéolo, tan longas como o par, e unha plomada no fulcro.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: {
    songIds: ['lua_song_02'],
    gameIds: ['lua_game_08'],
  },
  story: {
    storyId: 'lua_story_10',
    anticipationMicroStory: adult(
      'Lúa quiere cruzar. La viga solo se queda quieta cuando los dos lados tiran igual.',
      'Lúa wants to cross. The beam stays still only when both sides pull the same.',
      'La Lúa vol creuar. La biga només es queda quieta quan els dos costats estiren igual.',
      'Lúa quere cruzar. A viga só queda quieta cando os dous lados tiran igual.',
    ),
    closingMicroStory: adult(
      'El puente ya se cruzó. Las masas vuelven a su fila y los clips, a su caja.',
      'The bridge has been crossed. The masses go back in their row and the clips, in their box.',
      'El pont ja s’ha creuat. Les masses tornen a la seva fila i els clips, a la seva capsa.',
      'A ponte xa se cruzou. As masas volven á súa fila e os clips, á súa caixa.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'SemanticExpansion',
      connectionReason: adult(
        'En la mesa se contrastan pesado y ligero, cerca y lejos, con objetos grandes.',
        'At the table, heavy and light, near and far, are contrasted with large objects.',
        'A la taula es contrasten pesat i lleuger, a prop i lluny, amb objectes grans.',
        'Na mesa contrástanse pesado e lixeiro, preto e lonxe, con obxectos grandes.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-S5',
};

export const S5_EQUILIBRIO: ChallengeInput = {
  kind: 'balance',
  worldId: 'S5',
  arms: S5_ARMS,
  thetaDeg: BALANCE_THETA_MAX_DEG,
};

const NEGATIVE: ChallengeInput = {
  kind: 'balance',
  worldId: 'S5',
  arms: S5_ARMS,
  thetaDeg: BALANCE_THETA_MAX_DEG + 0.01,
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
    id: 'S5-positiva',
    polarity: 'positive',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S5-VIG-G', markerId: 55 },
    challenge: S5_EQUILIBRIO,
  },
  {
    id: 'S5-negativa',
    polarity: 'negative',
    frames: VISUAL_STABLE_FRAMES,
    observation: { method: 'marker', pieceCode: 'S5-VIG-G', markerId: 55 },
    challenge: NEGATIVE,
  },
  {
    id: 'S5-oclusion-parcial',
    polarity: 'partial_occlusion',
    frames: VISUAL_STABLE_FRAMES - 1,
    observation: { method: 'marker', pieceCode: 'S5-VIG-G', markerId: 55 },
    challenge: S5_EQUILIBRIO,
  },
  {
    id: 'S5-adult-tap',
    polarity: 'positive',
    frames: framesRequired('adult_tap'),
    observation: { method: 'adult_tap' },
    challenge: S5_EQUILIBRIO,
  },
];

function assertReplay(): void {
  if (MOMENTO_IZQ !== MOMENTO_DER) {
    throw new Error('S5: 40 g en el alvéolo 2 tiene que igualar 20 g en el alvéolo 4.');
  }
  const vivo = evaluateStaticBalance({
    kind: 'balance',
    worldId: 'S5',
    arms: S5_ARMS,
    thetaDeg: BALANCE_THETA_MAX_DEG,
  });
  if (!vivo.ok || vivo.leftMoment !== vivo.rightMoment) {
    throw new Error(`S5: el motor rechaza el equilibrio (${vivo.reason}).`);
  }
  if (translateExpression('alivio').index !== 13 || translateExpression('diversion').index !== 17) {
    throw new Error('S5: el equilibrio y la inclinación no coinciden con las caras del motor.');
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

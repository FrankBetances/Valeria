// Catálogo 1 · Solo Lúa (T3-A).
// Seis actividades AR-L01..AR-L06. El adulto lee es, en, ca y gl.
// Cada una lleva adult_tap, 5 s de silencio y trazas para ObservationReplay.
// Las caras las resuelve LuaLink contra protocol.json v1.
import { ADULT_UI_LANGS, CHILD_SPEECH_LOCALES } from '../types';
import type {
  AdultText,
  ChildSpeechMap,
  DetectionMethod,
  SteamActivity,
  TripartiteCycle,
  WorldEventId,
  WorldEventSpec,
  WorldManifest,
} from '../types';
import { CAUSAL_SEQUENCES, type ChallengeInput } from '../engine/ChallengeEvaluator';
import { ADULT_TAP_FRAMES, VISUAL_STABLE_FRAMES } from '../engine/EventStabilizer';
import { linkLua, translateExpression, translateMood, type LuaMoodCode } from '../engine/LuaLink';
import { replayTrace, type ObservationTrace, type TracePolarity } from '../engine/ObservationReplay';
import { resolvePauseBeforeReactionMs } from '../engine/ReactionSequencer';
import { applyTurnGate } from '../engine/TurnGate';
import { promptWord } from '../engine/WordPrompter';
import { WorldRegistry } from '../engine/WorldRegistry';
import type { Observation } from '../types';
import { assertSteamActivities, assertWorldManifest } from '../validator';

/** AR-L01 no enciende el micrófono: el gesto se mira, no se graba. */
export const LUA_L01_MICROPHONE_ENABLED = false;

export const LUA_L01_HOLD_MS = { min: 800, max: 2500 } as const;
export const LUA_L03_PROXIMITY_MM = 60;
export const LUA_L04_CONE_DEG = 12;
export const LUA_L04_HOLD_MS = { min: 1500, max: 3000 } as const;
export const LUA_L05_MAX_VELOCITY_MM_S = 120;
/** Vibración del bloque Ronroneo en el contacto lento. Solo de 3 a 6 años. */
export const LUA_L05_HAPTIC_DBFS = -20;
/** Si hace falta, el adulto enciende una pista visual pasado este tiempo. */
export const LUA_L06_VISUAL_CUE_AFTER_MS = 1500;

/** Motores nativos que estas actividades encapsulan. No se muestran al adulto. */
export const LUA_SOLO_NATIVE_EXERCISE = {
  'AR-L01': 'Ar1Orofacial',
  'AR-L04': 'Ar3Fixation',
  'AR-L06': 'Ar2Vra',
} as const;

/** Identidad de las trazas. No es el fiducial impreso. */
export const LUA_LOMO_MARKER_ID = 2;
export const LUA_FISH_MARKER_ID = 7;

const LUA_SOLO_IDS = ['AR-L01', 'AR-L02', 'AR-L03', 'AR-L04', 'AR-L05', 'AR-L06'] as const;
export type LuaSoloActivityId = (typeof LUA_SOLO_IDS)[number];

export const LUA_SOLO_TITLES: Record<LuaSoloActivityId, AdultText> = {
  'AR-L01': text(
    'El Espejo de Gestos de Lúa',
    "Lúa's Gesture Mirror",
    'El Mirall de Gestos de Lúa',
    'O Espello de Xestos de Lúa',
  ),
  'AR-L02': text(
    '¿Hacia dónde mira Lúa?',
    'Which way is Lúa looking?',
    'Cap a on mira Lúa?',
    'Cara a onde mira Lúa?',
  ),
  'AR-L03': text(
    'La merienda del pez dorado',
    'The golden fish snack',
    'El berenar del peix daurat',
    'A merenda do peixe dourado',
  ),
  'AR-L04': text(
    'El despertar sereno de Lúa',
    "Lúa's quiet wake-up",
    'El despertar serè de Lúa',
    'O espertar sereno de Lúa',
  ),
  'AR-L05': text(
    'La caricia y el ronroneo',
    'The pet and the purr',
    'La carícia i el ronroneig',
    'A caricia e o rosmido',
  ),
  'AR-L06': text(
    '¿Dónde cantó el pajarito?',
    'Where did the little bird sing?',
    "On ha cantat l'ocellet?",
    'Onde cantou o paxariño?',
  ),
};

function text(es: string, en: string, ca: string, gl: string): AdultText {
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

function cycleOf(cycle: TripartiteCycle): TripartiteCycle {
  return cycle;
}

function eventOf(spec: WorldEventSpec): WorldEventSpec {
  return spec;
}

function activityOf(activity: SteamActivity): SteamActivity {
  return activity;
}

const off = { light: 'APAGADO' as const, haptic: 'APAGADO' as const };

export const LUA_SOLO_ACTIVITIES: readonly SteamActivity[] = [
  activityOf({
    id: 'AR-L01',
    worldId: 'LUA',
    mode: 'LUA_SOLO',
    bleRequired: true,
    methods: ['face', 'adult_tap'],
    englishTpr: 'Round lips! Smile with Lúa!',
    childSpeech: speech(
      '¡Labios redondos! ¡Sonríe con Lúa!',
      'Beizos redondos! Sorrí con Lúa!',
      'Ezpain biribilak! Irribarre Lúarekin!',
      '¡Labios redondos! ¡Sonríe con Lúa!',
      'Round lips! Smile with Lúa!',
      'Llavis rodons! Somriu amb Lúa!',
    ),
    cycle: cycleOf({
      observa: {
        mandatorySilenceSec: 5,
        phenomenonTrigger: text(
          'Lúa está junto al soporte con la cara atenta y el espejo muestra su modelo. El micrófono sigue apagado. La barra de luz acompaña la boca y no se borra de golpe.',
          'Lúa sits by the stand with an attentive face and the mirror shows her model. The microphone stays off. The light bar follows the mouth and does not snap off.',
          "Lúa és al costat del suport amb la cara atenta i el mirall mostra el seu model. El micròfon segueix apagat. La barra de llum acompanya la boca i no s'esborra de cop.",
          'Lúa está a carón do soporte coa cara atenta e o espello mostra o seu modelo. O micrófono segue apagado. A barra de luz acompaña a boca e non se borra de golpe.',
        ),
        socraticQuestion: text(
          'Mira los bigotes de Lúa… ¿qué pasa en la barra mágica cuando ponemos boca de pompón?',
          "Look at Lúa's whiskers… what happens to the magic bar when we make a pom-pom mouth?",
          'Mira els bigotis de Lúa… què passa a la barra màgica quan fem boca de pompón?',
          'Mira os bigotes de Lúa… que pasa na barra máxica cando poñemos boca de pompón?',
        ),
      },
      experimenta: {
        adultStepByStep: text(
          'El niño sostiene un beso redondo o una boca abierta un momento. No hace falta decir una palabra. El adulto confirma el gesto con un toque.',
          'The child holds a round kiss or an open mouth for a moment. No word is needed. The adult confirms the gesture with a tap.',
          "L'infant aguanta un petó rodó o una boca oberta un moment. No cal dir cap paraula. L'adult confirma el gest amb un toc.",
          'O neno sostén un bico redondo ou unha boca aberta un momento. Non fai falta dicir unha palabra. O adulto confirma o xesto cun toque.',
        ),
        hints: {
          level1Socratic: text(
            '¿Y si escondemos los labios o los estiramos despacito como si sopláramos una vela?',
            'What if we hide the lips or stretch them slowly, as if we were blowing out a candle?',
            'I si amaguem els llavis o els estirem a poc a poc com si buféssim una espelma?',
            'E se agochamos os beizos ou os estiramos amodiño como se soprásemos unha candea?',
          ),
          level2PhysicalModel: text(
            'Entra en el encuadre junto al niño y haz el gesto a cámara lenta para que vea subir la barra verde.',
            'Step into the frame beside the child and make the gesture in slow motion so the green bar can be seen rising.',
            "Entra a l'enquadrament al costat de l'infant i fes el gest a càmera lenta perquè vegi pujar la barra verda.",
            'Entra no encadre xunto ao neno e fai o xesto a cámara lenta para que vexa subir a barra verde.',
          ),
        },
      },
      construye: {
        tangibleMakeChallenge: text(
          'Cuando sostenga dos gestos, elige una cola o un accesorio y colócalo en el cuerpo de bloques de Lúa.',
          "After two held gestures, choose a tail or an accessory and place it on Lúa's block body.",
          'Quan aguanti dos gestos, tria una cua o un accessori i posa’l al cos de blocs de Lúa.',
          'Cando sosteña dous xestos, escolle un rabo ou un accesorio e colócao no corpo de bloques de Lúa.',
        ),
        transferQuestion: text(
          '¿Qué gesto de la boca hizo subir la barra más despacio?',
          'Which mouth gesture made the bar rise more slowly?',
          'Quin gest de la boca ha fet pujar la barra més a poc a poc?',
          'Que xesto da boca fixo subir a barra máis amodiño?',
        ),
      },
    }),
    events: [
      eventOf({
        id: 'LUA.ESPEJO_ATENTA',
        title: text('Cara atenta', 'Attentive face', 'Cara atenta', 'Cara atenta'),
        childAction: text(
          'Se coloca frente al espejo y mira a Lúa.',
          'Stands in front of the mirror and looks at Lúa.',
          'Es posa davant del mirall i mira Lúa.',
          'Póñese fronte ao espello e mira a Lúa.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'atenta', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Round lips! Smile with Lúa!',
          spatialCategory: 'properties',
          adultHint: text(
            'La cara de inicio es atenta. Aún no hay gesto que sostener.',
            'The opening face is attentive. There is no gesture to hold yet.',
            'La cara inicial és atenta. Encara no hi ha cap gest per aguantar.',
            'A cara de inicio é atenta. Aínda non hai xesto que soster.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.ESPEJO_SOSTEN',
        title: text('Gesto sostenido', 'Held gesture', 'Gest sostingut', 'Xesto sostido'),
        childAction: text(
          'Redondea los labios o abre la boca y lo mantiene.',
          'Rounds the lips or opens the mouth and holds it.',
          'Arrodoneix els llavis o obre la boca i ho manté.',
          'Arredonda os beizos ou abre a boca e manteno.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'animo', ...off, screenOverlay: 'PROGRESS_RING' },
        word: {
          englishTpr: 'Round lips! Smile with Lúa!',
          spatialCategory: 'shapes',
          adultHint: text(
            'La barra verde sube mientras el gesto se sostiene.',
            'The green bar rises while the gesture is held.',
            'La barra verda puja mentre el gest es manté.',
            'A barra verde sobe mentres o xesto se sostén.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.ESPEJO_LOGRO',
        title: text('Dos gestos listos', 'Two gestures done', 'Dos gestos fets', 'Dous xestos feitos'),
        childAction: text(
          'Completa dos gestos sostenidos.',
          'Completes two held gestures.',
          'Completa dos gestos sostinguts.',
          'Completa dous xestos sostidos.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'celebra_corta', ...off, screenOverlay: 'PROGRESS_RING' },
        word: {
          englishTpr: 'Round lips! Smile with Lúa!',
          spatialCategory: 'properties',
          adultHint: text(
            'Lúa celebra el gesto. Luego se puede poner la cola o un accesorio.',
            'Lúa celebrates the gesture. Then the tail or an accessory can go on.',
            'Lúa celebra el gest. Després s’hi pot posar la cua o un accessori.',
            'Lúa celebra o xesto. Despois pódese poñer o rabo ou un accesorio.',
          ),
        },
      }),
    ],
  }),
  activityOf({
    id: 'AR-L02',
    worldId: 'LUA',
    mode: 'LUA_SOLO',
    bleRequired: true,
    methods: ['marker', 'adult_tap'],
    englishTpr: 'Turn Lúa around! Look forward!',
    childSpeech: speech(
      '¡Gira a Lúa! ¡Mira hacia delante!',
      'Xira a Lúa! Mira para adiante!',
      'Biratu Lúa! Begiratu aurrera!',
      '¡Gira a Lúa! ¡Mira hacia delante!',
      'Turn Lúa around! Look forward!',
      'Gira Lúa! Mira endavant!',
    ),
    cycle: cycleOf({
      observa: {
        mandatorySilenceSec: 5,
        phenomenonTrigger: text(
          'El adulto gira a Lúa un cuarto de vuelta sobre la mesa. El haz del lomo K-LOMO-G barre la mesa y señala una ficha. La tableta no se mueve del soporte.',
          'The adult turns Lúa a quarter turn on the table. The beam on the K-LOMO-G back sweeps the table and points to a card. The tablet stays on the stand.',
          'L’adult gira Lúa un quart de volta sobre la taula. El feix del llom K-LOMO-G escombra la taula i assenyala una fitxa. La tauleta no es mou del suport.',
          'O adulto xira a Lúa un cuarto de volta sobre a mesa. O feixe do lombo K-LOMO-G varre a mesa e sinala unha ficha. A tableta non se move do soporte.',
        ),
        socraticQuestion: text(
          '¿Adónde apunta ahora la nariz de Lúa?',
          "Where does Lúa's nose point now?",
          'On apunta ara el nas de Lúa?',
          'A onde apunta agora o nariz de Lúa?',
        ),
      },
      experimenta: {
        adultStepByStep: text(
          'Coloca las placas INICIO, JARDIN y META alrededor de Lúa y pídele que la oriente hacia cada una. El niño mueve a Lúa, no la pantalla.',
          'Place the INICIO, JARDIN and META cards around Lúa and ask for her to face each one. The child moves Lúa, not the screen.',
          'Posa les plaques INICIO, JARDIN i META al voltant de Lúa i demana orientar-la cap a cadascuna. L’infant mou Lúa, no la pantalla.',
          'Coloca as placas INICIO, JARDIN e META arredor de Lúa e pídelle que a oriente cara a cada unha. O neno move a Lúa, non a pantalla.',
        ),
        hints: {
          level1Socratic: text(
            'Fíjate en su cola: si la cola mira hacia ti, ¿hacia dónde miran sus ojos?',
            'Look at her tail: if the tail faces you, which way do her eyes look?',
            'Fixa’t en la cua: si la cua et mira, cap a on miren els ulls?',
            'Fíxate no rabo: se o rabo mira cara a ti, cara a onde miran os ollos?',
          ),
          level2PhysicalModel: text(
            'Pon a Lúa de espaldas al niño, de modo que su izquierda coincida con la izquierda del niño, y giradla juntos un cuarto de vuelta.',
            "Place Lúa with her back to the child, so her left matches the child's left, and turn her together a quarter turn.",
            'Posa Lúa d’esquena a l’infant, de manera que la seva esquerra coincideixi amb l’esquerra de l’infant, i gireu-la junts un quart de volta.',
            'Pon a Lúa de costas ao neno, de xeito que a súa esquerda coincida coa esquerda do neno, e xirádea xuntos un cuarto de volta.',
          ),
        },
      },
      construye: {
        tangibleMakeChallenge: text(
          'Desmonta la cabeza y el cuello y vuélvelos a encajar en el tronco K-TRONCO-G. La llave asimétrica impide que la cabeza mire hacia la cola.',
          'Take the head and neck off and fit them again on the K-TRONCO-G trunk. The asymmetric key stops the head from facing the tail.',
          'Desmunta el cap i el coll i torna’ls a encaixar al tronc K-TRONCO-G. La clau asimètrica impedeix que el cap miri cap a la cua.',
          'Desmonta a cabeza e o pescozo e vólveos encaixar no tronco K-TRONCO-G. A chave asimétrica impide que a cabeza mire cara ao rabo.',
        ),
        transferQuestion: text(
          'Si la cola señala la placa META, ¿qué placa tienen delante los ojos?',
          'If the tail points to the META card, which card is in front of the eyes?',
          'Si la cua assenyala la placa META, quina placa tenen davant els ulls?',
          'Se o rabo sinala a placa META, que placa teñen diante os ollos?',
        ),
      },
    }),
    events: [
      eventOf({
        id: 'LUA.RUMBO_GIRO',
        title: text('Giro del lomo', 'Back turns', 'Gir del llom', 'Xiro do lombo'),
        childAction: text(
          'Gira el cuerpo de Lúa sobre la mesa.',
          "Turns Lúa's body on the table.",
          'Gira el cos de Lúa sobre la taula.',
          'Xira o corpo de Lúa sobre a mesa.',
        ),
        methods: ['marker', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'curiosa', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Turn Lúa around! Look forward!',
          spatialCategory: 'orientation',
          adultHint: text(
            'El marcador del lomo da el rumbo. Un giro despierta la cara de inspiración.',
            'The marker on the back gives the heading. A turn wakes the inspiration face.',
            'El marcador del llom dóna el rumb. Un gir desperta la cara d’inspiració.',
            'O marcador do lombo dá o rumbo. Un xiro esperta a cara de inspiración.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.RUMBO_ALINEADA',
        title: text('Nariz hacia la placa', 'Nose toward the card', 'Nas cap a la placa', 'Nariz cara á placa'),
        childAction: text(
          'Deja la nariz de Lúa frente a la placa pedida.',
          "Leaves Lúa's nose facing the requested card.",
          'Deixa el nas de Lúa davant de la placa demanada.',
          'Deixa o nariz de Lúa fronte á placa pedida.',
        ),
        methods: ['marker', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'alegre', light: 'DIR_DELANTE', haptic: 'APAGADO', screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Turn Lúa around! Look forward!',
          spatialCategory: 'deictics',
          adultHint: text(
            'Cuando el rumbo coincide con la placa, Lúa muestra alegría y el haz apunta hacia delante.',
            'When the heading matches the card, Lúa shows joy and the beam points forward.',
            'Quan el rumb coincideix amb la placa, Lúa mostra alegria i el feix apunta endavant.',
            'Cando o rumbo coincide coa placa, Lúa mostra alegría e o feixe apunta cara a adiante.',
          ),
        },
      }),
    ],
  }),
  activityOf({
    id: 'AR-L03',
    worldId: 'LUA',
    mode: 'LUA_SOLO',
    bleRequired: true,
    methods: ['occlusion', 'marker', 'adult_tap'],
    englishTpr: 'Feed the fish to Lúa! Yummy!',
    childSpeech: speech(
      '¡Dale el pez a Lúa! ¡Qué rico!',
      'Dálle o peixe a Lúa! Que rico!',
      'Eman arraina Lúari! Goxoa!',
      '¡Dale el pez a Lúa! ¡Qué rico!',
      'Feed the fish to Lúa! Yummy!',
      'Dona el peix a Lúa! Que bo!',
    ),
    cycle: cycleOf({
      observa: {
        mandatorySilenceSec: 5,
        phenomenonTrigger: text(
          'Lúa muestra antojo en la pantalla redonda. El adulto acerca despacio un bloque por delante, sin tocar el cristal de la tableta. Si el bloque entra muy cerca de la boca, el pez dorado salta hacia Lúa.',
          'Lúa shows a craving on the round screen. The adult slowly brings a block in from the front, without touching the tablet glass. If the block comes very close to the mouth, the golden fish jumps toward Lúa.',
          'Lúa mostra desig a la pantalla rodona. L’adult acosta a poc a poc un bloc per davant, sense tocar el vidre de la tauleta. Si el bloc entra molt a prop de la boca, el peix daurat salta cap a Lúa.',
          'Lúa mostra antollo na pantalla redonda. O adulto achega amodiño un bloque por diante, sen tocar o cristal da tableta. Se o bloque entra moi preto da boca, o peixe dourado brinca cara a Lúa.',
        ),
        socraticQuestion: text(
          '¿Qué ha hecho Lúa cuando el bloque llegó cerquita de su boca?',
          'What did Lúa do when the block came very close to her mouth?',
          'Què ha fet Lúa quan el bloc ha arribat ben a prop de la boca?',
          'Que fixo Lúa cando o bloque chegou ben preto da boca?',
        ),
      },
      experimenta: {
        adultStepByStep: text(
          'El niño entrega el pez con la mano, desde cerca, desde lejos, por arriba y por delante. La tableta sigue fija. El adulto confirma cada entrega con un toque.',
          'The child hands over the fish, from near, from far, from above and from the front. The tablet stays fixed. The adult confirms each handover with a tap.',
          'L’infant lliura el peix amb la mà, de prop, de lluny, per dalt i per davant. La tauleta segueix fixa. L’adult confirma cada lliurament amb un toc.',
          'O neno entrega o peixe coa man, de preto, de lonxe, por riba e por diante. A tableta segue fixa. O adulto confirma cada entrega cun toque.',
        ),
        hints: {
          level1Socratic: text(
            '¿La boca de Lúa está arriba en las orejas o delante en la cara?',
            "Is Lúa's mouth up by the ears, or at the front of the face?",
            'La boca de Lúa és a dalt, a les orelles, o al davant, a la cara?',
            'A boca de Lúa está arriba nas orellas ou diante na cara?',
          ),
          level2PhysicalModel: text(
            'Guía el codo del niño para acercar el bloque despacio, sin golpear la pantalla de Lúa.',
            "Guide the child's elbow so the block comes in slowly, without hitting Lúa's screen.",
            'Guia el colze de l’infant per acostar el bloc a poc a poc, sense colpejar la pantalla de Lúa.',
            'Guía o cóbado do neno para achegar o bloque amodiño, sen golpear a pantalla de Lúa.',
          ),
        },
      },
      construye: {
        tangibleMakeChallenge: text(
          'Con cuatro bloques, construid una bandeja de merienda frente al zócalo de Lúa y separad las piezas por color antes de dárselas.',
          "With four blocks, build a snack tray in front of Lúa's socket and sort the pieces by color before offering them.",
          'Amb quatre blocs, construïu una safata de berenar davant del sòcol de Lúa i separeu les peces per color abans de donar-les.',
          'Con catro bloques, construíde unha bandexa de merenda fronte ao zócolo de Lúa e separade as pezas por cor antes de llas dar.',
        ),
        transferQuestion: text(
          '¿Qué color quieres darle primero, y por dónde tiene que llegar hasta la boca?',
          'Which color do you want to offer first, and which way should it travel to the mouth?',
          'Quin color vols donar primer, i per on ha d’arribar fins a la boca?',
          'Que cor queres darlle primeiro, e por onde ten que chegar ata a boca?',
        ),
      },
    }),
    events: [
      eventOf({
        id: 'LUA.MERIENDA_ESPERA',
        title: text('Lúa espera el pez', 'Lúa waits for the fish', 'Lúa espera el peix', 'Lúa agarda o peixe'),
        childAction: text(
          'Mira a Lúa mientras muestra antojo.',
          'Looks at Lúa while she shows a craving.',
          'Mira Lúa mentre mostra desig.',
          'Mira a Lúa mentres mostra antollo.',
        ),
        methods: ['occlusion', 'marker', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'espera_serena', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Feed the fish to Lúa! Yummy!',
          spatialCategory: 'position',
          adultHint: text(
            'La cara de espera es el antojo. El pez todavía no ha llegado a la boca.',
            'The waiting face is the craving. The fish has not reached the mouth yet.',
            'La cara d’espera és el desig. El peix encara no ha arribat a la boca.',
            'A cara de espera é o antollo. O peixe aínda non chegou á boca.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.MERIENDA_ENTREGA',
        title: text('El pez llega a la boca', 'The fish reaches the mouth', 'El peix arriba a la boca', 'O peixe chega á boca'),
        childAction: text(
          'Acerca la pieza del pez a la boca de Lúa, en el aire, sin tocar la tableta.',
          "Brings the fish piece to Lúa's mouth, in the air, without touching the tablet.",
          'Acosta la peça del peix a la boca de Lúa, a l’aire, sense tocar la tauleta.',
          'Achega a peza do peixe á boca de Lúa, no aire, sen tocar a tableta.',
        ),
        methods: ['occlusion', 'marker', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'alegre', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Feed the fish to Lúa! Yummy!',
          spatialCategory: 'position',
          adultHint: text(
            'Muy cerca de la boca, Lúa pasa a comer y el pez de la pantalla salta hacia ella.',
            'Very close to the mouth, Lúa starts eating and the fish on the screen jumps toward her.',
            'Molt a prop de la boca, Lúa passa a menjar i el peix de la pantalla salta cap a ella.',
            'Moi preto da boca, Lúa pasa a comer e o peixe da pantalla brinca cara a ela.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.MERIENDA_GRATITUD',
        title: text('Gracias por la merienda', 'Thanks for the snack', 'Gràcies pel berenar', 'Grazas pola merenda'),
        childAction: text(
          'Suelta la pieza cuando Lúa ya come.',
          'Lets go of the piece once Lúa is eating.',
          'Deixa anar la peça quan Lúa ja menja.',
          'Solta a peza cando Lúa xa come.',
        ),
        methods: ['occlusion', 'marker', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'gratitud', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Feed the fish to Lúa! Yummy!',
          spatialCategory: 'position',
          adultHint: text(
            'Al terminar la entrega, Lúa muestra gratitud.',
            'When the handover ends, Lúa shows gratitude.',
            'En acabar el lliurament, Lúa mostra gratitud.',
            'Ao rematar a entrega, Lúa mostra agradecemento.',
          ),
        },
      }),
    ],
  }),
  activityOf({
    id: 'AR-L04',
    worldId: 'LUA',
    mode: 'LUA_SOLO',
    bleRequired: true,
    methods: ['face', 'adult_tap'],
    englishTpr: 'Stay still and calm… Wake up, Lúa!',
    childSpeech: speech(
      'Quieto y tranquilo… ¡Despierta, Lúa!',
      'Quietiño e calmo… Esperta, Lúa!',
      'Geldi eta lasai… Esna, Lúa!',
      'Quieto y tranquilo… ¡Despierta, Lúa!',
      'Stay still and calm… Wake up, Lúa!',
      'Quiets i tranquils… Desperta’t, Lúa!',
    ),
    cycle: cycleOf({
      observa: {
        mandatorySilenceSec: 5,
        phenomenonTrigger: text(
          'Lúa duerme. El adulto se queda muy quieto frente a la cámara y el anillo de luz empieza a brillar, sin un cambio brusco.',
          'Lúa is asleep. The adult stays very still in front of the camera and the light ring starts to glow, without a sudden jump.',
          'Lúa dorm. L’adult es queda molt quiet davant de la càmera i l’anell de llum comença a brillar, sense un canvi brusc.',
          'Lúa dorme. O adulto queda moi quieto fronte á cámara e o anel de luz empeza a brillar, sen un cambio brusco.',
        ),
        socraticQuestion: text(
          '¿Qué necesitamos hacer con el cuerpo para que el anillo de luz despierte a Lúa sin asustarla?',
          'What do we need to do with the body so the light ring wakes Lúa without startling her?',
          'Què necessitem fer amb el cos perquè l’anell de llum desperti Lúa sense espantar-la?',
          'Que necesitamos facer co corpo para que o anel de luz esperte a Lúa sen asustala?',
        ),
      },
      experimenta: {
        adultStepByStep: text(
          'El niño sostiene la mirada y una postura tranquila dentro del cono estrecho frente al espejo. Si se mueve un instante, el anillo baja despacio y no se borra del todo. El adulto confirma con un toque.',
          'The child holds a gaze and a quiet posture inside the narrow cone in front of the mirror. If there is a brief move, the ring falls slowly and does not erase itself. The adult confirms with a tap.',
          'L’infant sosté la mirada i una postura tranquil·la dins del con estret davant del mirall. Si es mou un instant, l’anell baixa a poc a poc i no s’esborra del tot. L’adult confirma amb un toc.',
          'O neno sostén a mirada e unha postura tranquila dentro do cono estreito fronte ao espello. Se se move un instante, o anel baixa amodiño e non se borra de todo. O adulto confirma cun toque.',
        ),
        hints: {
          level1Socratic: text(
            'Respira despacito como un gato dormido…',
            'Breathe slowly, like a sleeping cat…',
            'Respira a poc a poc com un gat adormit…',
            'Respira amodiño como un gato durmido…',
          ),
          level2PhysicalModel: text(
            'Apoya con suavidad las manos en los hombros del niño, con una presión firme y tranquila, mientras miráis juntos a Lúa.',
            "Rest your hands gently on the child's shoulders, with a firm and quiet pressure, while you look at Lúa together.",
            'Recolza amb suavitat les mans a les espatlles de l’infant, amb una pressió ferma i tranquil·la, mentre mireu junts Lúa.',
            'Apoia con suavidade as mans nos ombros do neno, cunha presión firme e tranquila, mentres mirades xuntos a Lúa.',
          ),
        },
      },
      construye: {
        tangibleMakeChallenge: text(
          'Al terminar, montad junto al zócalo de Lúa una cama de noche con dos baldosas lisas del camino para acostarla.',
          "When you finish, build a night bed beside Lúa's socket with two smooth path tiles so she can lie down.",
          'En acabar, munteu al costat del sòcol de Lúa un llit de nit amb dues lloses llises del camí per ajeure-la.',
          'Ao rematar, montade xunto ao zócolo de Lúa unha cama de noite con dúas laxes lisas do camiño para a deitar.',
        ),
        transferQuestion: text(
          '¿El anillo creció cuando el cuerpo estaba quieto o cuando se movía?',
          'Did the ring grow when the body was still, or when it was moving?',
          'L’anell ha crescut quan el cos estava quiet o quan es movia?',
          'O anel medrou cando o corpo estaba quieto ou cando se movía?',
        ),
      },
    }),
    events: [
      eventOf({
        id: 'LUA.DESPERTAR_REPOSO',
        title: text('Lúa duerme', 'Lúa sleeps', 'Lúa dorm', 'Lúa dorme'),
        childAction: text(
          'Mira a Lúa dormida en el espejo.',
          'Looks at sleeping Lúa in the mirror.',
          'Mira Lúa adormida al mirall.',
          'Mira a Lúa durmida no espello.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'descanso_lejos', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Stay still and calm… Wake up, Lúa!',
          spatialCategory: 'properties',
          adultHint: text(
            'El reposo es la cara dormida. El anillo todavía no se llena.',
            'Rest is the sleeping face. The ring is not full yet.',
            'El repòs és la cara adormida. L’anell encara no s’omple.',
            'O repouso é a cara durmida. O anel aínda non se enche.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.DESPERTAR_CALMA',
        title: text('Postura tranquila', 'Quiet posture', 'Postura tranquil·la', 'Postura tranquila'),
        childAction: text(
          'Mantiene la cara dentro del cono estrecho, quieto, un momento.',
          'Keeps the face inside the narrow cone, still, for a moment.',
          'Manté la cara dins del con estret, quiet, un moment.',
          'Mantén a cara dentro do cono estreito, quieto, un momento.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'alivio', ...off, screenOverlay: 'PROGRESS_RING' },
        word: {
          englishTpr: 'Stay still and calm… Wake up, Lúa!',
          spatialCategory: 'orientation',
          adultHint: text(
            'Dentro del cono, el anillo crece y Lúa pasa a la cara de tranquilidad.',
            'Inside the cone, the ring grows and Lúa moves to the calm face.',
            'Dins del con, l’anell creix i Lúa passa a la cara de tranquil·litat.',
            'Dentro do cono, o anel medra e Lúa pasa á cara de tranquilidade.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.DESPERTAR_ABRE',
        title: text('Lúa abre los ojos', 'Lúa opens her eyes', 'Lúa obre els ulls', 'Lúa abre os ollos'),
        childAction: text(
          'Sigue quieto hasta que el anillo se llena.',
          'Stays still until the ring is full.',
          'Segueix quiet fins que l’anell s’omple.',
          'Segue quieto ata que o anel se enche.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'esperanza', ...off, screenOverlay: 'PROGRESS_RING' },
        word: {
          englishTpr: 'Stay still and calm… Wake up, Lúa!',
          spatialCategory: 'properties',
          adultHint: text(
            'Con el anillo lleno, Lúa despierta con la cara de esperanza.',
            'With the ring full, Lúa wakes with the hope face.',
            'Amb l’anell ple, Lúa es desperta amb la cara d’esperança.',
            'Co anel cheo, Lúa esperta coa cara de esperanza.',
          ),
        },
      }),
    ],
  }),
  activityOf({
    id: 'AR-L05',
    worldId: 'LUA',
    mode: 'LUA_SOLO',
    bleRequired: true,
    methods: ['hand', 'adult_tap'],
    englishTpr: 'Gentle touch, soft paws, purr!',
    childSpeech: speech(
      '¡Despacio, patitas suaves, ronroneo!',
      'Amodiño, patiñas suaves, rosmido!',
      'Poliki, oin bigunak, urruma!',
      '¡Despacio, patitas suaves, ronroneo!',
      'Gentle touch, soft paws, purr!',
      'A poc a poc, potes suaus, ronroneig!',
    ),
    cycle: cycleOf({
      observa: {
        mandatorySilenceSec: 5,
        phenomenonTrigger: text(
          'El adulto acaricia despacio el lomo de Lúa y acerca el bloque Ronroneo para que se sienta un cosquilleo suave. En la tableta nace una estela turquesa.',
          "The adult slowly pets Lúa's back and brings the Purr block close so a soft tingle can be felt. A turquoise trail appears on the tablet.",
          'L’adult acaricia a poc a poc el llom de Lúa i acosta el bloc Ronroneig perquè es noti un pessigolleig suau. A la tauleta neix un deixant turquesa.',
          'O adulto agarima amodiño o lombo de Lúa e achega o bloque Rosmido para que se sinta un proído suave. Na tableta nace un rastro turquesa.',
        ),
        socraticQuestion: text(
          '¿Cómo se siente en los dedos cuando acariciamos a Lúa muy despacito?',
          'How does it feel on the fingers when we pet Lúa very slowly?',
          'Com se sent als dits quan acariciem Lúa molt a poc a poc?',
          'Como se sente nos dedos cando agarimamos a Lúa moi amodiño?',
        ),
      },
      experimenta: {
        adultStepByStep: text(
          'De 3 a 6 años, el niño distingue la mano rápida como lluvia y la mano lenta como una pluma sobre el lomo. Solo la mano lenta hace ronronear a Lúa. El adulto confirma con un toque.',
          'From 3 to 6 years, the child tells a fast hand, like rain, from a slow hand, like a feather, on the back. Only the slow hand makes Lúa purr. The adult confirms with a tap.',
          'De 3 a 6 anys, l’infant distingeix la mà ràpida com la pluja i la mà lenta com una ploma sobre el llom. Només la mà lenta fa ronronejar Lúa. L’adult confirma amb un toc.',
          'De 3 a 6 anos, o neno distingue a man rápida como a chuvia e a man lenta como unha pluma sobre o lombo. Só a man lenta fai rosmar a Lúa. O adulto confirma cun toque.',
        ),
        hints: {
          level1Socratic: text(
            '¿Con cuál de las dos manos empieza Lúa a ronronear?',
            'With which of the two hands does Lúa start to purr?',
            'Amb quina de les dues mans comença Lúa a ronronejar?',
            'Con cal das dúas mans empeza Lúa a rosmar?',
          ),
          level2PhysicalModel: text(
            'Acaricia primero el dorso de la mano del niño, al ritmo lento, para mostrar la velocidad y la presión suaves.',
            "First stroke the back of the child's hand, at the slow pace, to show the soft speed and pressure.",
            'Acaricia primer el dors de la mà de l’infant, al ritme lent, per mostrar la velocitat i la pressió suaus.',
            'Agarima primeiro o dorso da man do neno, ao ritmo lento, para mostrar a velocidade e a presión suaves.',
          ),
        },
      },
      construye: {
        tangibleMakeChallenge: text(
          'Encajad el bloque Ronroneo en una base de bloques junto a Lúa para hacer el rincón de calma.',
          "Fit the Purr block onto a block base beside Lúa to make the calm corner.",
          'Encaixeu el bloc Ronroneig en una base de blocs al costat de Lúa per fer el racó de calma.',
          'Encaixade o bloque Rosmido nunha base de bloques xunto a Lúa para facer o recuncho de calma.',
        ),
        transferQuestion: text(
          '¿Dónde quieres dejar el rincón de calma para volver a acariciar despacio?',
          'Where do you want to leave the calm corner so you can pet slowly again?',
          'On vols deixar el racó de calma per tornar a acariciar a poc a poc?',
          'Onde queres deixar o recuncho de calma para volver agarimar amodiño?',
        ),
      },
    }),
    events: [
      eventOf({
        id: 'LUA.CARICIA_SUAVE',
        title: text('Mano lenta', 'Slow hand', 'Mà lenta', 'Man lenta'),
        childAction: text(
          'Acaricia el lomo con la palma abierta y un movimiento lento.',
          'Pets the back with an open palm and a slow movement.',
          'Acaricia el llom amb el palmell obert i un moviment lent.',
          'Agarima o lombo coa palma aberta e un movemento lento.',
        ),
        methods: ['hand', 'adult_tap'],
        turn: 'motor',
        reaction: {
          expression: 'ternura',
          light: 'TENUE_CUATRO',
          haptic: 'RONRONEO',
          screenOverlay: 'NONE',
        },
        word: {
          englishTpr: 'Gentle touch, soft paws, purr!',
          spatialCategory: 'properties',
          adultHint: text(
            'La mano lenta enciende el ronroneo y la estela turquesa.',
            'The slow hand turns on the purr and the turquoise trail.',
            'La mà lenta encén el ronroneig i el deixant turquesa.',
            'A man lenta acende o rosmido e o rastro turquesa.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.CARICIA_RAPIDA',
        title: text('Mano rápida', 'Fast hand', 'Mà ràpida', 'Man rápida'),
        childAction: text(
          'Pasa la mano deprisa por encima del lomo.',
          'Moves the hand quickly over the back.',
          'Passa la mà de pressa per sobre del llom.',
          'Pasa a man axiña por riba do lombo.',
        ),
        methods: ['hand', 'adult_tap'],
        turn: 'motor',
        isErrorOrBlockedState: true,
        reaction: { expression: 'neutra', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Gentle touch, soft paws, purr!',
          spatialCategory: 'properties',
          adultHint: text(
            'Si la mano va deprisa, la estela se apaga y Lúa vuelve a la cara neutra.',
            'If the hand moves fast, the trail goes out and Lúa returns to the neutral face.',
            'Si la mà va de pressa, el deixant s’apaga i Lúa torna a la cara neutra.',
            'Se a man vai axiña, o rastro apágase e Lúa volve á cara neutra.',
          ),
        },
      }),
    ],
  }),
  activityOf({
    id: 'AR-L06',
    worldId: 'LUA',
    mode: 'LUA_SOLO',
    bleRequired: true,
    methods: ['face', 'adult_tap'],
    englishTpr: 'Listen! Turn your head! Look there!',
    childSpeech: speech(
      '¡Escucha! ¡Gira la cabeza! ¡Mira allí!',
      'Escoita! Xira a cabeza! Mira alí!',
      'Entzun! Burua biratu! Begira hor!',
      '¡Escucha! ¡Gira la cabeza! ¡Mira allí!',
      'Listen! Turn your head! Look there!',
      'Escolta! Gira el cap! Mira allà!',
    ),
    cycle: cycleOf({
      observa: {
        mandatorySilenceSec: 5,
        phenomenonTrigger: text(
          'Suena un canto breve a un lado. El adulto gira la cabeza y señala la oreja de ese lado, y Lúa aparece brillando allí.',
          'A short song sounds on one side. The adult turns their head and points to the ear on that side, and Lúa appears glowing there.',
          'Sona un cant breu a un costat. L’adult gira el cap i assenyala l’orella d’aquell costat, i Lúa apareix brillant allà.',
          'Soa un canto breve a un lado. O adulto xira a cabeza e sinala a orella dese lado, e Lúa aparece brillando alí.',
        ),
        socraticQuestion: text(
          '¿Por qué lado ha sonado el pajarito?',
          'Which side did the little bird sing from?',
          'Per quin costat ha sonat l’ocellet?',
          'Por que lado soou o paxariño?',
        ),
      },
      experimenta: {
        adultStepByStep: text(
          'El niño escucha y gira la cabeza hacia el lado del canto. Si hace falta una ayuda visual, el adulto la enciende en ese lado un momento después del sonido. Luego confirma con un toque.',
          'The child listens and turns their head toward the side of the song. If a visual help is needed, the adult turns it on on that side a moment after the sound. Then they confirm with a tap.',
          'L’infant escolta i gira el cap cap al costat del cant. Si cal una ajuda visual, l’adult l’encén en aquell costat un moment després del so. Després confirma amb un toc.',
          'O neno escoita e xira a cabeza cara ao lado do canto. Se fai falta unha axuda visual, o adulto acéndea nese lado un momento despois do son. Despois confirma cun toque.',
        ),
        hints: {
          level1Socratic: text(
            'Ponemos las antenas de gato… ¿sonó por esta ventana o por la puerta?',
            'We put on cat antennae… did it sound by this window, or by the door?',
            'Posem les antenes de gat… ha sonat per aquesta finestra o per la porta?',
            'Poñemos as antenas de gato… soou por esta fiestra ou pola porta?',
          ),
          level2PhysicalModel: text(
            'Coloca a Lúa física en el lado por donde va a sonar el canto, para dejar una referencia en la mesa.',
            'Place the physical Lúa on the side where the song will sound, to leave a reference on the table.',
            'Col·loca Lúa física al costat per on sonarà el cant, per deixar una referència a la taula.',
            'Coloca a Lúa física no lado por onde vai soar o canto, para deixar unha referencia na mesa.',
          ),
        },
      },
      construye: {
        tangibleMakeChallenge: text(
          'Colocad una ficha de estrella junto a Lúa por cada canto que hayáis encontrado juntos.',
          'Place a star token beside Lúa for each song you found together.',
          'Col·loqueu una fitxa d’estrella al costat de Lúa per cada cant que hàgiu trobat junts.',
          'Colocade unha ficha de estrela xunto a Lúa por cada canto que atopásedes xuntos.',
        ),
        transferQuestion: text(
          '¿El último canto llegó por la ventana o por la puerta?',
          'Did the last song come by the window or by the door?',
          'L’últim cant ha arribat per la finestra o per la porta?',
          'O último canto chegou pola fiestra ou pola porta?',
        ),
      },
    }),
    events: [
      eventOf({
        id: 'LUA.PAJARO_ESCUCHA',
        title: text('Antes del canto', 'Before the song', 'Abans del cant', 'Antes do canto'),
        childAction: text(
          'Espera en el espejo, mirando al frente, hasta que suene el canto.',
          'Waits in the mirror, looking forward, until the song sounds.',
          'Espera al mirall, mirant endavant, fins que soni el cant.',
          'Agarda no espello, mirando de fronte, ata que soe o canto.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'verbal',
        reaction: { expression: 'neutra', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Listen! Turn your head! Look there!',
          spatialCategory: 'deictics',
          adultHint: text(
            'Antes del canto, Lúa está neutra. Durante la escucha no hay luz ni vibración.',
            'Before the song, Lúa is neutral. During listening there is no light and no vibration.',
            'Abans del cant, Lúa està neutra. Durant l’escolta no hi ha llum ni vibració.',
            'Antes do canto, Lúa está neutra. Durante a escoita non hai luz nin vibración.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.PAJARO_GIRO',
        title: text('Giro hacia el canto', 'Turn toward the song', 'Gir cap al cant', 'Xiro cara ao canto'),
        childAction: text(
          'Gira la cabeza hacia el lado por donde sonó el canto.',
          'Turns the head toward the side where the song sounded.',
          'Gira el cap cap al costat per on ha sonat el cant.',
          'Xira a cabeza cara ao lado por onde soou o canto.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'orgullo', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Listen! Turn your head! Look there!',
          spatialCategory: 'deictics',
          adultHint: text(
            'El giro de la cabeza hacia el canto muestra la cara de orgullo.',
            'The head turn toward the song shows the pride face.',
            'El gir del cap cap al cant mostra la cara d’orgull.',
            'O xiro da cabeza cara ao canto mostra a cara de orgullo.',
          ),
        },
      }),
      eventOf({
        id: 'LUA.PAJARO_LOCALIZADO',
        title: text('Lúa en ese lado', 'Lúa on that side', 'Lúa en aquell costat', 'Lúa nese lado'),
        childAction: text(
          'Mantiene la mirada hacia el lado localizado.',
          'Keeps looking toward the side that was found.',
          'Manté la mirada cap al costat localitzat.',
          'Mantén a mirada cara ao lado localizado.',
        ),
        methods: ['face', 'adult_tap'],
        turn: 'motor',
        reaction: { expression: 'celebra_corta', ...off, screenOverlay: 'NONE' },
        word: {
          englishTpr: 'Listen! Turn your head! Look there!',
          spatialCategory: 'position',
          adultHint: text(
            'Lúa celebra en el lado donde sonó el canto.',
            'Lúa celebrates on the side where the song sounded.',
            'Lúa celebra al costat on ha sonat el cant.',
            'Lúa celebra no lado onde soou o canto.',
          ),
        },
      }),
    ],
  }),
];

/**
 * Caras de compañía que el evento no puede guardar en `expression`.
 * ReactionSequencer las pasa como `mood` + `useMoodAsFace`.
 * Gratitud y orgullo no van aquí: LuaLink ya las emite (AFFECT 2 #12 y AFFECT 5 #15).
 */
export const LUA_SOLO_MOOD_BY_EVENT: Partial<Record<WorldEventId, { mood: LuaMoodCode; useMoodAsFace: true }>> = {
  'LUA.MERIENDA_ESPERA': { mood: 1, useMoodAsFace: true },
  'LUA.MERIENDA_ENTREGA': { mood: 3, useMoodAsFace: true },
  'LUA.CARICIA_SUAVE': { mood: 2, useMoodAsFace: true },
};

const FRAME_MS = 1000 / 30;

function sight(base: Omit<Observation, 'tMs'>, index: number): Observation {
  return { ...base, tMs: Math.round(index * FRAME_MS) };
}

function stableRun(base: Omit<Observation, 'tMs'>, count: number): Observation[] {
  return Array.from({ length: count }, (_, index) => sight(base, index));
}

/** 9 fotogramas y 1 perdido, dos veces. No llega a 10 seguidos. */
function partialOcclusion(base: Omit<Observation, 'tMs'>): (Observation | null)[] {
  const frames: (Observation | null)[] = [];
  let index = 0;
  for (let cycle = 0; cycle < 2; cycle += 1) {
    for (let step = 0; step < VISUAL_STABLE_FRAMES - 1; step += 1) {
      frames.push(sight(base, index));
      index += 1;
    }
    frames.push(null);
    index += 1;
  }
  return frames;
}

const TRACE_CHALLENGE: ChallengeInput = {
  kind: 'causal',
  worldId: 'S0',
  states: CAUSAL_SEQUENCES.S0[0],
};

interface TraceSeed {
  id: LuaSoloActivityId;
  positive: Omit<Observation, 'tMs'>;
  negative: Omit<Observation, 'tMs'>;
}

function tracesFor(seed: TraceSeed): ObservationTrace[] {
  const rows: readonly {
    suffix: string;
    polarity: TracePolarity;
    base: Omit<Observation, 'tMs'>;
    eventConfirmed: boolean;
    challengeOk: boolean;
    occlusion: boolean;
  }[] = [
    { suffix: 'positiva', polarity: 'positive', base: seed.positive, eventConfirmed: true, challengeOk: true, occlusion: false },
    { suffix: 'negativa', polarity: 'negative', base: seed.negative, eventConfirmed: true, challengeOk: false, occlusion: false },
    { suffix: 'oclusion-parcial', polarity: 'partial_occlusion', base: seed.positive, eventConfirmed: false, challengeOk: true, occlusion: true },
    { suffix: 'toque-adulto', polarity: 'positive', base: { method: 'adult_tap' }, eventConfirmed: true, challengeOk: true, occlusion: false },
  ];
  return rows.map((row) => ({
    id: `${seed.id}-${row.suffix}`,
    polarity: row.polarity,
    worldId: 'LUA',
    frames: row.base.method === 'adult_tap'
      ? [sight(row.base, 0)]
      : row.occlusion
        ? partialOcclusion(row.base)
        : stableRun(row.base, VISUAL_STABLE_FRAMES),
    challenge: TRACE_CHALLENGE,
    expect: { eventConfirmed: row.eventConfirmed, challengeOk: row.challengeOk },
  }));
}

const face = (pieceCode?: string): Omit<Observation, 'tMs'> => (
  pieceCode ? { method: 'face', pieceCode } : { method: 'face' }
);

export const LUA_SOLO_TRACES: readonly ObservationTrace[] = [
  ...tracesFor({
    id: 'AR-L01',
    positive: { ...face(), ratio: 0.85, durationMs: 1200 },
    negative: { ...face(), ratio: 0.15, durationMs: 200 },
  }),
  ...tracesFor({
    id: 'AR-L02',
    positive: { method: 'marker', pieceCode: 'K-LOMO-G', markerId: LUA_LOMO_MARKER_ID, angleDeg: 0, durationMs: 400 },
    negative: { method: 'marker', pieceCode: 'K-LOMO-G', markerId: LUA_LOMO_MARKER_ID, angleDeg: 40, durationMs: 80 },
  }),
  ...tracesFor({
    id: 'AR-L03',
    positive: { method: 'occlusion', pieceCode: 'PEZ-G', markerId: LUA_FISH_MARKER_ID, ratio: 1 },
    negative: { method: 'occlusion', pieceCode: 'PEZ-G', markerId: LUA_FISH_MARKER_ID, ratio: 0.1 },
  }),
  ...tracesFor({
    id: 'AR-L04',
    positive: { ...face(), angleDeg: 8, durationMs: 2000 },
    negative: { ...face(), angleDeg: 20, durationMs: 400 },
  }),
  ...tracesFor({
    id: 'AR-L05',
    positive: { method: 'hand', pieceCode: 'K-LOMO-G', markerId: LUA_LOMO_MARKER_ID, velocity: 40 },
    negative: { method: 'hand', pieceCode: 'K-LOMO-G', markerId: LUA_LOMO_MARKER_ID, velocity: 200 },
  }),
  ...tracesFor({
    id: 'AR-L06',
    positive: { ...face(), angleDeg: 30 },
    negative: { ...face(), angleDeg: 2 },
  }),
];

export function registerLuaSolo(registry: WorldRegistry): readonly SteamActivity[] {
  for (const activity of LUA_SOLO_ACTIVITIES) registry.registerActivity(activity);
  return LUA_SOLO_ACTIVITIES;
}

function assertAdult(value: AdultText, path: string): void {
  for (const lang of ADULT_UI_LANGS) {
    if (value[lang].trim() === '') throw new Error(`${path} (${lang}) está vacío.`);
  }
}

function assertCycle(cycle: TripartiteCycle, path: string): void {
  if (cycle.observa.mandatorySilenceSec !== 5) {
    throw new Error(`${path}: el silencio de Observa tiene que ser 5 s.`);
  }
  assertAdult(cycle.observa.phenomenonTrigger, `${path}.observa.phenomenonTrigger`);
  assertAdult(cycle.observa.socraticQuestion, `${path}.observa.socraticQuestion`);
  assertAdult(cycle.experimenta.adultStepByStep, `${path}.experimenta.adultStepByStep`);
  assertAdult(cycle.experimenta.hints.level1Socratic, `${path}.experimenta.hints.level1Socratic`);
  assertAdult(cycle.experimenta.hints.level2PhysicalModel, `${path}.experimenta.hints.level2PhysicalModel`);
  assertAdult(cycle.construye.tangibleMakeChallenge, `${path}.construye.tangibleMakeChallenge`);
  assertAdult(cycle.construye.transferQuestion, `${path}.construye.transferQuestion`);
}

function faceIndex(expression: WorldEventSpec['reaction']['expression']): number {
  return translateExpression(expression).index;
}

function assertFaces(): void {
  const want: readonly [WorldEventSpec['reaction']['expression'], number][] = [
    ['atenta', 1],
    ['animo', 2],
    ['celebra_corta', 4],
    ['curiosa', 16],
    ['alegre', 10],
    ['gratitud', 12],
    ['descanso_lejos', 18],
    ['alivio', 13],
    ['esperanza', 14],
    ['orgullo', 15],
    ['neutra', 0],
  ];
  for (const [expression, index] of want) {
    if (faceIndex(expression) !== index) {
      throw new Error(`LuaLink: ${expression} no ocupa la cara #${index}.`);
    }
  }
  if (translateMood(1).index !== 20 || translateMood(1).id !== 'antojo') {
    throw new Error('LuaLink: MOOD 1 tiene que ser el antojo #20.');
  }
  if (translateMood(3).index !== 22 || translateMood(3).id !== 'comiendo') {
    throw new Error('LuaLink: MOOD 3 tiene que ser comiendo #22.');
  }
  if (translateMood(2).index !== 21 || translateMood(2).id !== 'ronroneo') {
    throw new Error('LuaLink: MOOD 2 tiene que ser el ronroneo #21.');
  }
}

function assertMoodLink(): void {
  const craving = linkLua({
    mode: 'LUA_SOLO',
    bleConnected: false,
    expression: 'espera_serena',
    mood: 1,
    useMoodAsFace: true,
    light: 'APAGADO',
    haptic: 'APAGADO',
  });
  if (craving.face.index !== 20 || !craving.degradedToMirror || !craving.withinBudget) {
    throw new Error('AR-L03: la espera tiene que espejar el antojo #20.');
  }
  const eating = linkLua({
    mode: 'LUA_SOLO',
    bleConnected: false,
    expression: 'alegre',
    mood: 3,
    useMoodAsFace: true,
    light: 'APAGADO',
    haptic: 'APAGADO',
  });
  if (eating.face.index !== 22) throw new Error('AR-L03: la entrega tiene que espejar comiendo #22.');
  const purr = linkLua({
    mode: 'LUA_SOLO',
    bleConnected: false,
    expression: 'ternura',
    mood: 2,
    useMoodAsFace: true,
    light: 'TENUE_CUATRO',
    haptic: 'RONRONEO',
  });
  if (purr.face.index !== 21 || purr.mirror.haptic !== 'RONRONEO') {
    throw new Error('AR-L05: la caricia lenta tiene que espejar el ronroneo #21.');
  }
  const wake = linkLua({
    mode: 'LUA_SOLO',
    bleConnected: false,
    expression: 'esperanza',
    light: 'APAGADO',
    haptic: 'APAGADO',
    screenOverlay: 'PROGRESS_RING',
  });
  if (wake.face.index !== 14) throw new Error('AR-L04: el despertar tiene que ser la esperanza #14.');
  const asleep = linkLua({
    mode: 'LUA_SOLO',
    bleConnected: false,
    expression: 'descanso_lejos',
    light: 'APAGADO',
    haptic: 'APAGADO',
  });
  if (asleep.face.index !== 18) throw new Error('AR-L04: el reposo tiene que ser la cara dormida #18.');
}

function assertGatesAndWords(activities: readonly SteamActivity[]): void {
  for (const activity of activities) {
    if (resolvePauseBeforeReactionMs({
      worldId: activity.worldId,
      activityId: activity.id,
      pauseBeforeReactionMs: 0,
    }) !== 0) {
      throw new Error(`${activity.id}: Solo Lúa no usa la pausa de 1000 ms del Set 2.`);
    }
    for (const ev of activity.events) {
      const gate = applyTurnGate({
        turn: ev.turn,
        isErrorOrBlockedState: ev.isErrorOrBlockedState,
        neuroStage: activity.id === 'AR-L05' ? 'I4' : activity.id === 'AR-L06' ? 'I1' : 'I3',
        light: ev.reaction.light,
        haptic: ev.reaction.haptic,
      });
      if (ev.id === 'LUA.CARICIA_SUAVE' && (gate.blocked || gate.haptic !== 'RONRONEO')) {
        throw new Error('AR-L05: a partir de I4 el ronroneo lento se mantiene.');
      }
      if (ev.id === 'LUA.CARICIA_RAPIDA' && (gate.light !== 'APAGADO' || gate.haptic !== 'APAGADO')) {
        throw new Error('AR-L05: la mano rápida deja luz y háptico apagados.');
      }
      if (ev.turn === 'verbal' && (gate.light !== 'APAGADO' || gate.haptic !== 'APAGADO')) {
        throw new Error(`${ev.id}: el turno de escucha apaga luz y háptico.`);
      }
      const spoken = promptWord({
        word: ev.word,
        lang: 'es',
        turn: ev.turn,
        englishTpr: activity.englishTpr,
        afterPhysicalPause: true,
      });
      if (spoken.englishTpr !== activity.englishTpr) {
        throw new Error(`${ev.id}: la pauta no conserva el TPR en inglés.`);
      }
      if (spoken.tabletMaySpeak !== (ev.turn === 'motor')) {
        throw new Error(`${ev.id}: la tableta solo habla en turno motor, tras la pausa.`);
      }
    }
  }
}

function assertTraces(traces: readonly ObservationTrace[]): void {
  const seen = new Set<string>();
  for (const trace of traces) {
    if (trace.worldId !== 'LUA') throw new Error(`${trace.id}: la traza es del mundo LUA.`);
    if (seen.has(trace.id)) throw new Error(`${trace.id} está repetida.`);
    seen.add(trace.id);
    const result = replayTrace(trace);
    if (result.eventConfirmed !== trace.expect.eventConfirmed) {
      throw new Error(`${trace.id}: el estabilizador dio ${String(result.eventConfirmed)}.`);
    }
    if (result.reason !== 'mundo_distinto') {
      throw new Error(`${trace.id}: sin reto LUA, ObservationReplay marca mundo_distinto.`);
    }
    const taps = trace.frames.filter((frame) => frame?.method === 'adult_tap');
    if (trace.id.endsWith('-toque-adulto')) {
      if (trace.frames.length !== ADULT_TAP_FRAMES || taps.length !== ADULT_TAP_FRAMES) {
        throw new Error(`${trace.id}: adult_tap ocupa un solo fotograma.`);
      }
    }
  }
  for (const id of LUA_SOLO_IDS) {
    const own = traces.filter((trace) => trace.id.startsWith(`${id}-`));
    const polarities = new Set(own.map((trace) => trace.polarity));
    for (const polarity of ['positive', 'negative', 'partial_occlusion'] as const) {
      if (!polarities.has(polarity)) throw new Error(`${id}: falta la traza ${polarity}.`);
    }
    if (!own.some((trace) => trace.id.endsWith('-toque-adulto'))) {
      throw new Error(`${id}: falta la traza de adult_tap.`);
    }
  }
}

function methodsInclude(methods: readonly DetectionMethod[], method: DetectionMethod): boolean {
  return methods.includes(method);
}

function assertCatalog(activities: readonly SteamActivity[]): void {
  if (activities.length !== LUA_SOLO_IDS.length) {
    throw new Error('Solo Lúa tiene que ser exactamente AR-L01..AR-L06.');
  }
  if (LUA_L01_MICROPHONE_ENABLED) {
    throw new Error('AR-L01 mantiene el micrófono apagado.');
  }
  for (const id of Object.keys(LUA_SOLO_NATIVE_EXERCISE) as LuaSoloActivityId[]) {
    if (!activities.some((activity) => activity.id === id)) {
      throw new Error(`${id}: el anclaje nativo no tiene actividad.`);
    }
  }
  activities.forEach((activity, index) => {
    if (activity.id !== LUA_SOLO_IDS[index]) throw new Error(`Orden: se esperaba ${LUA_SOLO_IDS[index]}.`);
    if (activity.mode !== 'LUA_SOLO' || activity.worldId !== 'LUA' || activity.bleRequired !== true) {
      throw new Error(`${activity.id}: modalidad LUA_SOLO, mundo LUA, con enlace cuando hay Lúa.`);
    }
    if (!methodsInclude(activity.methods, 'adult_tap')) {
      throw new Error(`${activity.id}: falta adult_tap.`);
    }
    if (activity.englishTpr.trim() === '') throw new Error(`${activity.id}: falta el TPR en inglés.`);
    for (const locale of CHILD_SPEECH_LOCALES) {
      if (activity.childSpeech[locale].trim() === '') {
        throw new Error(`${activity.id}: falta la locución ${locale}.`);
      }
    }
    assertAdult(LUA_SOLO_TITLES[activity.id as LuaSoloActivityId], `${activity.id}.title`);
    assertCycle(activity.cycle, activity.id);
    if (activity.events.length === 0) throw new Error(`${activity.id}: sin eventos.`);
    for (const ev of activity.events) {
      if (!ev.id.startsWith('LUA.')) throw new Error(`${ev.id}: el id de evento empieza por LUA.`);
      if (!methodsInclude(ev.methods, 'adult_tap')) throw new Error(`${ev.id}: falta adult_tap.`);
      assertAdult(ev.title, `${ev.id}.title`);
      assertAdult(ev.childAction, `${ev.id}.childAction`);
      assertAdult(ev.word.adultHint, `${ev.id}.word.adultHint`);
    }
  });
  const l01 = activities[0];
  const l05 = activities[4];
  const l06 = activities[5];
  if (!methodsInclude(l01.methods, 'face')) throw new Error('AR-L01 mira la cara.');
  if (!methodsInclude(activities[1].methods, 'marker')) throw new Error('AR-L02 mira el marcador del lomo.');
  if (!methodsInclude(activities[2].methods, 'occlusion') || !methodsInclude(activities[2].methods, 'marker')) {
    throw new Error('AR-L03 acerca el pez por oclusión o marcador.');
  }
  if (!methodsInclude(activities[3].methods, 'face')) throw new Error('AR-L04 mira la cara.');
  if (!methodsInclude(l05.methods, 'hand')) throw new Error('AR-L05 mira la mano.');
  if (!methodsInclude(l06.methods, 'face')) throw new Error('AR-L06 mira el giro de la cara.');
  if (LUA_L04_CONE_DEG !== 12) throw new Error('AR-L04 usa el cono de ±12°.');
  if (LUA_L05_MAX_VELOCITY_MM_S !== 120 || LUA_L05_HAPTIC_DBFS !== -20) {
    throw new Error('AR-L05: mano lenta por debajo de 120 mm/s y ronroneo a −20 dBFS.');
  }
  if (LUA_L03_PROXIMITY_MM !== 60) throw new Error('AR-L03: la boca está a menos de 60 mm.');
  if (LUA_L06_VISUAL_CUE_AFTER_MS !== 1500) throw new Error('AR-L06: la pista visual del adulto espera 1500 ms.');
}

const PIECE_SAFE = text(
  'Pieza de mesa. La coloca y la guarda la persona adulta. No va a la boca de la criatura.',
  'Table piece. The adult places it and puts it away. It does not go in the child\'s mouth.',
  'Peça de taula. La posa i la desa la persona adulta. No va a la boca de la criatura.',
  'Peza de mesa. Colócaa e gárdaa a persoa adulta. Non vai á boca da criatura.',
);

const ADULT_NOTE = text(
  'La persona adulta anota lo que vio. No hay puntuación.',
  'The adult notes what they saw. There is no score.',
  'La persona adulta anota el que ha vist. No hi ha puntuació.',
  'A persoa adulta anota o que viu. Non hai puntuación.',
);

export const activities: readonly SteamActivity[] = LUA_SOLO_ACTIVITIES;

function luaChallenge(
  index: 0 | 1 | 2 | 3 | 4,
  id: 'LUA-C1' | 'LUA-C2' | 'LUA-C3' | 'LUA-C4' | 'LUA-C5',
  number: 1 | 2 | 3 | 4 | 5,
  ageBand: '0-2' | '2-3' | '3-4' | '4-5' | '5-6',
  neuroStage: 'I1' | 'I2' | 'I3' | 'I4' | 'I5',
  skillAxes: WorldManifest['skillAxes'],
): WorldManifest['challenges'][number] {
  const activity = LUA_SOLO_ACTIVITIES[index];
  return {
    id,
    number,
    title: LUA_SOLO_TITLES[activity.id as LuaSoloActivityId],
    ageBand,
    neuroStage,
    estimatedMinutes: 6,
    scale: 'G',
    skillAxes,
    targetEvents: activity.events.map((event) => event.id),
    cycle: activity.cycle,
    achievementCriterion: activity.cycle.construye.tangibleMakeChallenge,
    qualitativeObservation: ADULT_NOTE,
  };
}

export const manifest: WorldManifest = {
  id: 'LUA',
  orderIndex: 0,
  title: text(
    'Solo con Lúa',
    'With Lúa alone',
    'Només amb Lúa',
    'Só con Lúa',
  ),
  subtitleEn: 'Six plays with Lúa V5 and no block set',
  phenomenon: text(
    'Seis juegos solo con Lúa, sin un set de mesa. La tableta se queda en el soporte. La criatura no toca el cristal: mira el espejo, gira a Lúa, acerca el pez, se queda quieta, acaricia el lomo o gira la cabeza hacia un canto. En el espejo de gestos el micrófono sigue apagado.',
    'Six plays with Lúa alone, and no block set. The tablet stays on the stand. The child does not touch the glass: they use the mirror, turn Lúa, bring the fish, stay still, pet the back or turn their head toward a song. On the gesture mirror the microphone stays off.',
    'Sis jocs només amb Lúa, sense un set de taula. La tauleta es queda al suport. La criatura no toca el vidre: mira el mirall, gira Lúa, acosta el peix, es queda quieta, acaricia el llom o gira el cap cap a un cant. Al mirall de gestos el micròfon segueix apagat.',
    'Seis xogos só con Lúa, sen un set de mesa. A tableta queda no soporte. A criatura non toca o cristal: mira o espello, xira a Lúa, achega o peixe, queda quieta, agarima o lombo ou xira a cabeza cara a un canto. No espello de xestos o micrófono segue apagado.',
  ),
  ageRange: '0-6',
  scaleSummary: 'G',
  prioritySpatialCategories: ['orientation', 'deictics', 'position', 'properties', 'shapes'],
  skillAxes: ['phonology_speech', 'lexicon_semantics', 'interaction_pragmatics', 'sensory_regulation', 'auditory_perception'],
  supportedProfiles: ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'],
  targetAudienceContext: text(
    'Familia y aula, de 0 a 6 años. La persona adulta maneja la tableta y confirma con un toque. La criatura juega con Lúa y con las piezas.',
    'Family and classroom, from 0 to 6 years. The adult handles the tablet and confirms with a tap. The child plays with Lúa and with the pieces.',
    'Família i aula, de 0 a 6 anys. La persona adulta fa anar la tauleta i confirma amb un toc. La criatura juga amb Lúa i amb les peces.',
    'Familia e aula, de 0 a 6 anos. A persoa adulta manexa a tableta e confirma cun toque. A criatura xoga con Lúa e coas pezas.',
  ),
  udlPathways: {
    representation: text(
      'La cara de Lúa, la barra, el anillo y el haz del lomo se ven en la tableta y se pueden señalar en el aire, sin tocar el cristal.',
      'Lúa\'s face, the bar, the ring and the beam on the back show on the tablet and can be pointed at in the air, without touching the glass.',
      'La cara de Lúa, la barra, l\'anell i el feix del llom es veuen a la tauleta i es poden assenyalar a l\'aire, sense tocar el vidre.',
      'A cara de Lúa, a barra, o anel e o feixe do lombo vense na tableta e pódense sinalar no aire, sen tocar o cristal.',
    ),
    engagement: text(
      'Hay un papel claro: la persona adulta propone el juego y la criatura responde con el cuerpo o con una pieza.',
      'There is a clear role: the adult offers the play and the child answers with the body or with a piece.',
      'Hi ha un paper clar: la persona adulta proposa el joc i la criatura respon amb el cos o amb una peça.',
      'Hai un papel claro: a persoa adulta propón o xogo e a criatura responde co corpo ou cunha peza.',
    ),
    expression: text(
      'La criatura muestra el gesto, el rumbo, la entrega, la quietud, la caricia o el giro de cabeza. La persona adulta confirma con un toque.',
      'The child shows the gesture, the heading, the handover, the stillness, the pet or the head turn. The adult confirms with a tap.',
      'La criatura mostra el gest, el rumb, el lliurament, la quietud, la carícia o el gir de cap. La persona adulta confirma amb un toc.',
      'A criatura amosa o xesto, o rumbo, a entrega, a quietude, a caricia ou o xiro de cabeza. A persoa adulta confirma cun toque.',
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
      code: 'K-LOMO-G',
      name: text('Lomo de Lúa', 'Lúa\'s back', 'Llom de Lúa', 'Lombo de Lúa'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [LUA_LOMO_MARKER_ID],
      detectionMethod: 'marker',
      safetyNotes: PIECE_SAFE,
    },
    {
      code: 'K-COLA-G',
      name: text('Cola de Lúa', 'Lúa\'s tail', 'Cua de Lúa', 'Rabo de Lúa'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [],
      detectionMethod: 'adult_tap',
      safetyNotes: PIECE_SAFE,
    },
    {
      code: 'K-TRONCO-G',
      name: text('Tronco de Lúa', 'Lúa\'s trunk', 'Tronc de Lúa', 'Tronco de Lúa'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [],
      detectionMethod: 'adult_tap',
      safetyNotes: PIECE_SAFE,
    },
    {
      code: 'PEZ-G',
      name: text('Pez de merienda', 'Snack fish', 'Peix de berenar', 'Peixe de merenda'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [LUA_FISH_MARKER_ID],
      detectionMethod: 'occlusion',
      safetyNotes: PIECE_SAFE,
    },
    {
      code: 'K-RONRONEO-C',
      name: text('Bloque Ronroneo', 'Purr block', 'Bloc Ronroneig', 'Bloque Rosmido'),
      quantity: 1,
      scale: 'G',
      instanceMarkerIds: [],
      detectionMethod: 'hand',
      safetyNotes: PIECE_SAFE,
    },
  ],
  events: LUA_SOLO_ACTIVITIES.flatMap((activity) => activity.events),
  challenges: [
    luaChallenge(0, 'LUA-C1', 1, '2-3', 'I3', ['phonology_speech']),
    luaChallenge(1, 'LUA-C2', 2, '2-3', 'I2', ['lexicon_semantics', 'interaction_pragmatics']),
    luaChallenge(2, 'LUA-C3', 3, '2-3', 'I2', ['interaction_pragmatics']),
    luaChallenge(3, 'LUA-C4', 4, '2-3', 'I3', ['sensory_regulation']),
    luaChallenge(4, 'LUA-C5', 5, '3-4', 'I4', ['sensory_regulation']),
  ],
  modelCards: [
    {
      id: 'LUA-CARD-SOLO',
      title: text('Lúa en la mesa', 'Lúa on the table', 'Lúa a la taula', 'Lúa na mesa'),
      targetPieces: ['K-LOMO-G', 'K-COLA-G', 'K-TRONCO-G', 'PEZ-G', 'K-RONRONEO-C'],
    },
  ],
  revealLayer: {
    id: 'lua_v5_body',
    description: text(
      'Cuerpo de Lúa en la capa de revelación, animación celebrate, por debajo de 100 KB.',
      'Lúa\'s body on the reveal layer, animation celebrate, under 100 KB.',
      'Cos de Lúa a la capa de revelació, animació celebrate, per sota de 100 KB.',
      'Corpo de Lúa na capa de revelación, animación celebrate, por debaixo de 100 KB.',
    ),
    maxGlbKb: 100,
  },
  warmupLinks: { songIds: ['lua_song_01'], gameIds: ['lua_game_01'] },
  story: {
    storyId: 'lua_story_solo',
    anticipationMicroStory: text(
      'Hoy la mesa es de Lúa. No hace falta un set: están su cuerpo, un pez, el bloque que ronronea y el canto de un pajarito.',
      'Today the table belongs to Lúa. No set is needed: her body, a fish, the block that purrs and a little bird\'s song are enough.',
      'Avui la taula és de Lúa. No cal un set: hi ha el seu cos, un peix, el bloc que ronroneja i el cant d\'un ocellet.',
      'Hoxe a mesa é de Lúa. Non fai falta un set: están o seu corpo, un peixe, o bloque que rosma e o canto dun paxariño.',
    ),
    closingMicroStory: text(
      'El gesto, el rumbo, la merienda, el despertar, la caricia y el canto quedan hechos. Las piezas vuelven a su caja.',
      'The gesture, the heading, the snack, the waking, the pet and the song are done. The pieces go back in the box.',
      'El gest, el rumb, el berenar, el despertar, la carícia i el cant queden fets. Les peces tornen a la caixa.',
      'O xesto, o rumbo, a merenda, o espertar, a caricia e o canto quedan feitos. As pezas volven á caixa.',
    ),
  },
  tabletopPracticeLinks: [
    {
      route: 'BlockList',
      blockParam: 'lenguaje',
      connectionReason: text(
        'En la mesa se vuelven a decir delante, detrás, cerca y despacio, con Lúa y las mismas piezas.',
        'At the table, front, back, near and slowly are said again, with Lúa and the same pieces.',
        'A la taula es tornen a dir davant, darrere, a prop i a poc a poc, amb Lúa i les mateixes peces.',
        'Na mesa vólvense dicir diante, detrás, preto e amodiño, con Lúa e as mesmas pezas.',
      ),
    },
    {
      route: 'SensoryBlockList',
      blockParam: 'audicion',
      connectionReason: text(
        'En la mesa se vuelve a escuchar de qué lado llega un canto, con la tableta quieta en el soporte.',
        'At the table, the side a song comes from is listened for again, with the tablet still on the stand.',
        'A la taula es torna a escoltar de quin costat arriba un cant, amb la tauleta quieta al suport.',
        'Na mesa vólvese escoitar de que lado chega un canto, coa tableta quieta no soporte.',
      ),
    },
  ],
  academyCapsuleId: 'STEAM-LUA',
};

assertSteamActivities(LUA_SOLO_ACTIVITIES);
assertWorldManifest(manifest);
assertCatalog(LUA_SOLO_ACTIVITIES);
assertFaces();
assertMoodLink();
assertGatesAndWords(LUA_SOLO_ACTIVITIES);
assertTraces(LUA_SOLO_TRACES);
if (activities !== LUA_SOLO_ACTIVITIES || manifest.id !== 'LUA') {
  throw new Error('El barril lee manifest (LUA) y activities, el mismo array que LUA_SOLO_ACTIVITIES.');
}

const luaSoloRegistry = new WorldRegistry();
luaSoloRegistry.registerManifest(manifest);
registerLuaSolo(luaSoloRegistry);
for (const activity of LUA_SOLO_ACTIVITIES) {
  if (!luaSoloRegistry.activityAt('LUA', 'LUA_SOLO', activity.id)) {
    throw new Error(`${activity.id} no quedó registrada.`);
  }
}

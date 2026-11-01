// Escalera de retos de los mundos S0–S6 (plan §2.3 y §0.2 G6).
// El reto n va a la franja de edad n y al estadio In (CHALLENGE_LADDER).
// Lo que lee el adulto va en AdultText; ninguna de estas cadenas se locuta.
import {
  CHALLENGE_LADDER,
  type AdultText,
  type ChallengeNumber,
  type SkillAxis,
  type SteamWorldId,
  type TripartiteCycle,
  type WorldChallengeSpec,
  type WorldEventId,
} from '../types';

export type Line = readonly [es: string, en: string, ca: string, gl: string];

export function a(line: Line): AdultText {
  return { es: line[0], en: line[1], ca: line[2], gl: line[3] };
}

interface ChallengeMeta {
  title: Line;
  minutes: number;
  scale: WorldChallengeSpec['scale'];
  axes: SkillAxis[];
  events: WorldEventId[];
  criterion: Line;
  observation: Line;
}

interface ChallengeDraft extends ChallengeMeta {
  observa: readonly [trigger: Line, question: Line];
  experimenta: readonly [steps: Line, hint1: Line, hint2: Line];
  construye: readonly [make: Line, transfer: Line];
}

function shell(world: SteamWorldId, n: ChallengeNumber, meta: ChallengeMeta, cycle: TripartiteCycle): WorldChallengeSpec {
  return {
    id: `${world}-C${n}`,
    number: n,
    title: a(meta.title),
    ageBand: CHALLENGE_LADDER[n].ageBand,
    neuroStage: CHALLENGE_LADDER[n].neuroStage,
    estimatedMinutes: meta.minutes,
    scale: meta.scale,
    skillAxes: meta.axes,
    targetEvents: meta.events,
    cycle,
    achievementCriterion: a(meta.criterion),
    qualitativeObservation: a(meta.observation),
  };
}

export function reto(world: SteamWorldId, n: ChallengeNumber, d: ChallengeDraft): WorldChallengeSpec {
  return shell(world, n, d, {
    observa: { phenomenonTrigger: a(d.observa[0]), socraticQuestion: a(d.observa[1]), mandatorySilenceSec: 5 },
    experimenta: {
      adultStepByStep: a(d.experimenta[0]),
      hints: { level1Socratic: a(d.experimenta[1]), level2PhysicalModel: a(d.experimenta[2]) },
    },
    construye: { tangibleMakeChallenge: a(d.construye[0]), transferQuestion: a(d.construye[1]) },
  });
}

/** Reto que reutiliza un ciclo ya escrito en el manifiesto del mundo. */
export function retoFromCycle(
  world: SteamWorldId,
  n: ChallengeNumber,
  cycle: TripartiteCycle,
  meta: ChallengeMeta,
): WorldChallengeSpec {
  return shell(world, n, meta, cycle);
}

/** Renumera un reto existente y le pone la franja y el estadio de su peldaño. */
export function onLadder(challenge: WorldChallengeSpec, n: ChallengeNumber): WorldChallengeSpec {
  const world = challenge.id.slice(0, 2) as SteamWorldId;
  return {
    ...challenge,
    id: `${world}-C${n}`,
    number: n,
    ageBand: CHALLENGE_LADDER[n].ageBand,
    neuroStage: CHALLENGE_LADDER[n].neuroStage,
  };
}

export function byNumber(list: readonly WorldChallengeSpec[]): WorldChallengeSpec[] {
  return [...list].sort((x, y) => x.number - y.number);
}

// Frase común de seguridad para los peldaños de 0 a 2 años.
const SMALL_HANDS: Line = [
  'Las piezas pequeñas se quedan en la mano de la persona adulta.',
  'Small pieces stay in the adult’s hand.',
  'Les peces petites es queden a la mà de la persona adulta.',
  'As pezas pequenas quedan na man da persoa adulta.',
];

function withSafety(line: Line): Line {
  return [
    `${line[0]} ${SMALL_HANDS[0]}`,
    `${line[1]} ${SMALL_HANDS[1]}`,
    `${line[2]} ${SMALL_HANDS[2]}`,
    `${line[3]} ${SMALL_HANDS[3]}`,
  ];
}

// ─── S0 · Kit común ──────────────────────────────────────────────────────────

export function retosS0(cycleSolo: TripartiteCycle): WorldChallengeSpec[] {
  return [
    reto('S0', 1, {
      title: ['Empuja y hace clic', 'Push and click', 'Empeny i fa clic', 'Empurra e fai clic'],
      minutes: 5,
      scale: 'G',
      axes: ['interaction_pragmatics', 'lexicon_semantics'],
      events: ['S0.PLACA_LEIDA'],
      observa: [
        [
          'Desliza despacio una placa grande en el zócalo hasta que haga clic. Mira a la criatura, no a la pieza.',
          'Slowly slide a large plate into the socket until it clicks. Look at the child, not at the piece.',
          'Fes lliscar a poc a poc una placa gran al sòcol fins que faci clic. Mira la criatura, no la peça.',
          'Desliza amodo unha placa grande no zócalo ata que faga clic. Mira a criatura, non a peza.',
        ],
        ['¿Dónde está la placa?', 'Where is the plate?', 'On és la placa?', 'Onde está a placa?'],
      ],
      experimenta: [
        withSafety([
          'Ofrece dos placas. La criatura las toca con las manos y empuja una hacia el zócalo. Tú confirmas con el botón cuando entra.',
          'Offer two plates. The child touches them with their hands and pushes one toward the socket. You confirm with the button when it goes in.',
          'Ofereix dues plaques. La criatura les toca amb les mans i n’empeny una cap al sòcol. Tu confirmes amb el botó quan entra.',
          'Ofrece dúas placas. A criatura tócaas coas mans e empurra unha cara ao zócalo. Ti confirmas co botón cando entra.',
        ]),
        ['¿Hace clic?', 'Does it click?', 'Fa clic?', 'Fai clic?'],
        [
          'Pon tu mano sobre la suya y empujad juntos, muy despacio, hasta oír el clic.',
          'Put your hand over theirs and push together, very slowly, until you hear the click.',
          'Posa la teva mà sobre la seva i empenyeu junts, molt a poc a poc, fins a sentir el clic.',
          'Pon a túa man sobre a súa e empurrade xuntos, moi amodo, ata oír o clic.',
        ],
      ],
      construye: [
        [
          'Juego de dar y tomar: la criatura saca la placa, te la da, tú la vuelves a meter.',
          'Give-and-take game: the child pulls the plate out, hands it to you, you put it back.',
          'Joc de donar i prendre: la criatura treu la placa, te la dona i tu la tornes a posar.',
          'Xogo de dar e coller: a criatura saca a placa, dácha e ti volves metela.',
        ],
        ['¿Y esta otra placa, también entra?', 'And this other plate, does it fit too?', 'I aquesta altra placa, també hi entra?', 'E esta outra placa, tamén entra?'],
      ],
      criterion: [
        'La criatura empuja una placa dentro del zócalo, sola o con tu mano encima.',
        'The child pushes a plate into the socket, alone or with your hand over theirs.',
        'La criatura empeny una placa dins del sòcol, sola o amb la teva mà a sobre.',
        'A criatura empurra unha placa dentro do zócalo, soa ou coa túa man enriba.',
      ],
      observation: [
        'Anota si busca tu mirada después del clic.',
        'Note whether they look for your eyes after the click.',
        'Anota si busca la teva mirada després del clic.',
        'Anota se busca a túa mirada despois do clic.',
      ],
    }),
    reto('S0', 2, {
      title: ['Lúa mira al frente', 'Lúa faces forward', 'La Lúa mira endavant', 'Lúa mira á fronte'],
      minutes: 8,
      scale: 'G',
      axes: ['lexicon_semantics', 'interaction_pragmatics'],
      events: ['S0.CABEZA_ENCAJADA', 'S0.LUA_EN_ZOCALO'],
      observa: [
        [
          'Intenta encajar la cabeza de Lúa mirando hacia la cola: no baja. Gírala hasta que mire al frente: baja sola.',
          'Try to fit Lúa’s head facing the tail: it does not go down. Turn it until it faces forward: it drops in by itself.',
          'Prova d’encaixar el cap de la Lúa mirant cap a la cua: no baixa. Gira’l fins que miri endavant: baixa sol.',
          'Tenta encaixar a cabeza de Lúa mirando cara ao rabo: non baixa. Xíraa ata que mire á fronte: baixa soa.',
        ],
        ['¿Por qué no baja la cabeza?', 'Why doesn’t the head go down?', 'Per què no baixa el cap?', 'Por que non baixa a cabeza?'],
      ],
      experimenta: [
        [
          'La criatura gira la cabeza hasta que encaja y después sienta a Lúa en la cuna del zócalo. Tú confirmas cada paso con el botón.',
          'The child turns the head until it fits and then sits Lúa in the socket cradle. You confirm each step with the button.',
          'La criatura gira el cap fins que encaixa i després asseu la Lúa al bressol del sòcol. Tu confirmes cada pas amb el botó.',
          'A criatura xira a cabeza ata que encaixa e despois senta a Lúa no berce do zócalo. Ti confirmas cada paso co botón.',
        ],
        ['¿Dónde tiene los ojos Lúa?', 'Where are Lúa’s eyes?', 'On té els ulls la Lúa?', 'Onde ten os ollos Lúa?'],
        [
          'Señala con el dedo la cara de Lúa y girad la cabeza juntos, despacio, hasta que caiga en el hueco.',
          'Point to Lúa’s face and turn the head together, slowly, until it drops into the slot.',
          'Assenyala amb el dit la cara de la Lúa i gireu el cap junts, a poc a poc, fins que caigui al forat.',
          'Sinala co dedo a cara de Lúa e xirade a cabeza xuntos, amodo, ata que caia no oco.',
        ],
      ],
      construye: [
        [
          'Sienta a Lúa en el zócalo mirando a la criatura. Luego, mirando a la ventana.',
          'Sit Lúa in the socket facing the child. Then facing the window.',
          'Asseu la Lúa al sòcol mirant la criatura. Després, mirant la finestra.',
          'Senta a Lúa no zócalo mirando á criatura. Despois, mirando á fiestra.',
        ],
        ['¿Hacia dónde mira Lúa ahora?', 'Which way is Lúa looking now?', 'Cap on mira la Lúa ara?', 'Cara a onde mira Lúa agora?'],
      ],
      criterion: [
        'La cabeza queda encajada mirando al frente y Lúa sentada en la cuna.',
        'The head is fitted facing forward and Lúa is seated in the cradle.',
        'El cap queda encaixat mirant endavant i la Lúa asseguda al bressol.',
        'A cabeza queda encaixada mirando á fronte e Lúa sentada no berce.',
      ],
      observation: [
        'Anota si gira la pieza para probar o si empuja con fuerza.',
        'Note whether they turn the piece to try or push hard.',
        'Anota si gira la peça per provar o si empeny amb força.',
        'Anota se xira a peza para probar ou se empurra con forza.',
      ],
    }),
    retoFromCycle('S0', 3, cycleSolo, {
      title: ['Siete placas, un solo sentido', 'Seven plates, one way in', 'Set plaques, un sol sentit', 'Sete placas, un só sentido'],
      minutes: 10,
      scale: 'G',
      axes: ['lexicon_semantics', 'interaction_pragmatics'],
      events: ['S0.PLACA_LEIDA'],
      criterion: [
        'Encaja al menos cuatro placas en el sentido correcto y nombra o señala una de ellas.',
        'Fits at least four plates the right way round and names or points to one of them.',
        'Encaixa almenys quatre plaques en el sentit correcte i n’anomena o n’assenyala una.',
        'Encaixa polo menos catro placas no sentido correcto e nomea ou sinala unha delas.',
      ],
      observation: [
        'Anota si busca el relieve con los dedos antes de encajar o si gira al azar.',
        'Note whether they feel for the relief with their fingers before fitting or turn at random.',
        'Anota si busca el relleu amb els dits abans d’encaixar o si gira a l’atzar.',
        'Anota se busca o relevo cos dedos antes de encaixar ou se xira ao chou.',
      ],
    }),
    reto('S0', 5, {
      title: ['Prepara la mesa de un mundo', 'Set the table for a world', 'Prepara la taula d’un món', 'Prepara a mesa dun mundo'],
      minutes: 15,
      scale: 'G',
      axes: ['morphosyntax_narrative', 'interaction_pragmatics'],
      events: ['S0.CABEZA_ENCAJADA', 'S0.LUA_EN_ZOCALO', 'S0.PLACA_LEIDA'],
      observa: [
        [
          'Pon la placa JARDIN en un zócalo y deja el resto de placas boca abajo.',
          'Put the JARDIN plate in a socket and leave the other plates face down.',
          'Posa la placa JARDIN en un sòcol i deixa la resta de plaques cap per avall.',
          'Pon a placa JARDIN nun zócalo e deixa o resto de placas boca abaixo.',
        ],
        ['¿Qué mundo vamos a montar?', 'Which world are we going to build?', 'Quin món muntarem?', 'Que mundo imos montar?'],
      ],
      experimenta: [
        [
          'La criatura elige las placas que necesita un mundo —por ejemplo, el camino pide INICIO y META— y coloca los dos zócalos. Tú confirmas cada placa con el botón.',
          'The child picks the plates a world needs —for example, the path needs INICIO and META— and places the two sockets. You confirm each plate with the button.',
          'La criatura tria les plaques que necessita un món —per exemple, el camí demana INICIO i META— i col·loca els dos sòcols. Tu confirmes cada placa amb el botó.',
          'A criatura escolle as placas que precisa un mundo —por exemplo, o camiño pide INICIO e META— e coloca os dous zócalos. Ti confirmas cada placa co botón.',
        ],
        ['¿Qué placa dice dónde empieza?', 'Which plate says where it starts?', 'Quina placa diu on comença?', 'Que placa di onde comeza?'],
        [
          'Pon al lado la tarjeta del mundo y la placa, símbolo con símbolo, para que las compare.',
          'Put the world card next to the plate, symbol by symbol, so they can compare.',
          'Posa al costat la targeta del món i la placa, símbol amb símbol, perquè les compari.',
          'Pon ao lado a tarxeta do mundo e a placa, símbolo con símbolo, para que as compare.',
        ],
      ],
      construye: [
        [
          'Deja la mesa lista para mañana y cuéntaselo a otra persona en orden: primero, después, al final.',
          'Leave the table ready for tomorrow and tell someone else in order: first, next, at the end.',
          'Deixa la taula a punt per a demà i explica-ho a una altra persona en ordre: primer, després, al final.',
          'Deixa a mesa lista para mañá e cóntallo a outra persoa en orde: primeiro, despois, ao final.',
        ],
        [
          'Si no hubiera placas, ¿cómo sabría Lúa dónde está?',
          'If there were no plates, how would Lúa know where she is?',
          'Si no hi hagués plaques, com sabria la Lúa on és?',
          'Se non houbese placas, como sabería Lúa onde está?',
        ],
      ],
      criterion: [
        'Elige placas que encajan con el mundo y lo explica con una frase de dos pasos.',
        'Chooses plates that match the world and explains it with a two-step sentence.',
        'Tria plaques que lliguen amb el món i ho explica amb una frase de dos passos.',
        'Escolle placas que van co mundo e explícao cunha frase de dous pasos.',
      ],
      observation: [
        'Anota si planifica antes de colocar o si prueba y corrige.',
        'Note whether they plan before placing or try and correct.',
        'Anota si planifica abans de col·locar o si prova i corregeix.',
        'Anota se planifica antes de colocar ou se proba e corrixe.',
      ],
    }),
  ];
}

// ─── S1 · El camino ──────────────────────────────────────────────────────────

export function retosS1(cycleSolo: TripartiteCycle): WorldChallengeSpec[] {
  return [
    reto('S1', 1, {
      title: ['Liso y rugoso', 'Smooth and rough', 'Llis i rugós', 'Liso e rugoso'],
      minutes: 5,
      scale: 'G',
      axes: ['sensory_regulation', 'lexicon_semantics'],
      events: ['S1.LUA_AVANZA'],
      observa: [
        [
          'Pasa la palma de la criatura por una baldosa lisa y después por una rugosa. Despacio, sin hablar.',
          'Run the child’s palm over a smooth tile and then over a rough one. Slowly, without talking.',
          'Passa el palmell de la criatura per una rajola llisa i després per una de rugosa. A poc a poc, sense parlar.',
          'Pasa a palma da criatura por unha lousa lisa e despois por unha rugosa. Amodo, sen falar.',
        ],
        ['¿Cómo es?', 'What does it feel like?', 'Com és?', 'Como é?'],
      ],
      experimenta: [
        withSafety([
          'La criatura toca las dos baldosas a su ritmo. Tú pones nombre: «liso», «rugoso». Confirmas con el botón cuando explora las dos.',
          'The child touches both tiles at their own pace. You name them: “smooth”, “rough”. You confirm with the button when they explore both.',
          'La criatura toca les dues rajoles al seu ritme. Tu hi poses nom: «llis», «rugós». Confirmes amb el botó quan explora les dues.',
          'A criatura toca as dúas lousas ao seu ritmo. Ti pos nome: «liso», «rugoso». Confirmas co botón cando explora as dúas.',
        ]),
        ['¿Y esta?', 'And this one?', 'I aquesta?', 'E esta?'],
        [
          'Guía su palma con la tuya, muy despacio, y para si retira la mano.',
          'Guide their palm with yours, very slowly, and stop if they pull the hand away.',
          'Guia el seu palmell amb el teu, molt a poc a poc, i atura’t si retira la mà.',
          'Guía a súa palma coa túa, moi amodo, e para se retira a man.',
        ],
      ],
      construye: [
        [
          'Pon las dos baldosas juntas y desliza la ficha de Lúa de una a otra.',
          'Put the two tiles together and slide Lúa’s token from one to the other.',
          'Posa les dues rajoles juntes i fes lliscar la fitxa de la Lúa d’una a l’altra.',
          'Pon as dúas lousas xuntas e desliza a ficha de Lúa dunha á outra.',
        ],
        ['¿Otra vez por la rugosa?', 'Again over the rough one?', 'Una altra vegada per la rugosa?', 'Outra vez pola rugosa?'],
      ],
      criterion: [
        'Explora las dos texturas un rato y empuja una baldosa hacia ti o hacia la otra.',
        'Explores both textures for a while and pushes a tile toward you or toward the other one.',
        'Explora les dues textures una estona i empeny una rajola cap a tu o cap a l’altra.',
        'Explora as dúas texturas un anaco e empurra unha lousa cara a ti ou cara á outra.',
      ],
      observation: [
        'Anota qué textura prefiere y si alguna le incomoda. Parar también vale.',
        'Note which texture they prefer and whether one bothers them. Stopping is fine too.',
        'Anota quina textura prefereix i si alguna l’incomoda. Aturar-se també val.',
        'Anota que textura prefire e se algunha lle molesta. Parar tamén vale.',
      ],
    }),
    reto('S1', 2, {
      title: ['Baldosas que se dan la mano', 'Tiles that hold hands', 'Rajoles que s’agafen de la mà', 'Lousas que se dan a man'],
      minutes: 8,
      scale: 'G',
      axes: ['lexicon_semantics', 'morphosyntax_narrative'],
      events: ['S1.LUA_EN_INICIO', 'S1.LUA_AVANZA', 'S1.LLEGA_META'],
      observa: [
        [
          'Une INICIO y META y desliza a Lúa de una a otra. Después sepáralas y vuelve a intentarlo: el patín se queda en el borde.',
          'Join INICIO and META and slide Lúa from one to the other. Then pull them apart and try again: the skate stays at the edge.',
          'Uneix INICIO i META i fes lliscar la Lúa d’una a l’altra. Després separa-les i torna-ho a provar: el patí es queda a la vora.',
          'Une INICIO e META e desliza a Lúa dunha á outra. Despois sepáraas e volve tentalo: o patín queda no bordo.',
        ],
        ['¿Dónde empieza Lúa?', 'Where does Lúa start?', 'On comença la Lúa?', 'Onde comeza Lúa?'],
      ],
      experimenta: [
        [
          'La criatura junta tres baldosas rectas, pone a Lúa en INICIO y la lleva hasta META. Tú confirmas cada tramo con el botón.',
          'The child joins three straight tiles, puts Lúa on INICIO and takes her to META. You confirm each stretch with the button.',
          'La criatura ajunta tres rajoles rectes, posa la Lúa a INICIO i la porta fins a META. Tu confirmes cada tram amb el botó.',
          'A criatura xunta tres lousas rectas, pon a Lúa en INICIO e lévaa ata META. Ti confirmas cada tramo co botón.',
        ],
        ['¿Están juntas?', 'Are they together?', 'Estan juntes?', 'Están xuntas?'],
        [
          'Apretad juntos las dos baldosas hasta que las ranuras queden en línea.',
          'Press the two tiles together until the grooves line up.',
          'Premeu junts les dues rajoles fins que les ranures quedin en línia.',
          'Apertade xuntos as dúas lousas ata que as rañuras queden en liña.',
        ],
      ],
      construye: [
        [
          'Un camino recto de tres baldosas, de INICIO a META.',
          'A straight path of three tiles, from INICIO to META.',
          'Un camí recte de tres rajoles, d’INICIO a META.',
          'Un camiño recto de tres lousas, de INICIO a META.',
        ],
        ['¿Y si separamos una?', 'And if we pull one apart?', 'I si en separem una?', 'E se separamos unha?'],
      ],
      criterion: [
        'Tres baldosas rectas unidas y Lúa recorre el camino de INICIO a META.',
        'Three straight tiles joined and Lúa travels the path from INICIO to META.',
        'Tres rajoles rectes unides i la Lúa recorre el camí d’INICIO a META.',
        'Tres lousas rectas unidas e Lúa percorre o camiño de INICIO a META.',
      ],
      observation: [
        'Anota si usa «empieza» o «final», con palabra o con gesto.',
        'Note whether they use “start” or “end”, in words or by gesture.',
        'Anota si fa servir «comença» o «final», amb paraula o amb gest.',
        'Anota se usa «comeza» ou «final», con palabra ou con xesto.',
      ],
    }),
    retoFromCycle('S1', 3, cycleSolo, {
      title: ['El río de luz se corta', 'The river of light breaks', 'El riu de llum es talla', 'O río de luz córtase'],
      minutes: 10,
      scale: 'G',
      axes: ['morphosyntax_narrative', 'sensory_regulation'],
      events: ['S1.LUA_AVANZA', 'S1.LUA_GIRA', 'S1.CAMINO_ROTO'],
      criterion: [
        'Monta un camino continuo con una curva y repara el hueco cuando falta una baldosa.',
        'Builds a continuous path with a curve and repairs the gap when a tile is missing.',
        'Munta un camí continu amb una corba i repara el buit quan falta una rajola.',
        'Monta un camiño continuo cunha curva e repara o oco cando falta unha lousa.',
      ],
      observation: [
        'Anota si toca la baldosa antes de encajarla o si la coloca sin mirar.',
        'Note whether they touch the tile before fitting it or place it without looking.',
        'Anota si toca la rajola abans d’encaixar-la o si la col·loca sense mirar.',
        'Anota se toca a lousa antes de encaixala ou se a coloca sen mirar.',
      ],
    }),
    reto('S1', 5, {
      title: ['Programa el camino con fichas', 'Program the path with tokens', 'Programa el camí amb fitxes', 'Programa o camiño con fichas'],
      minutes: 15,
      scale: 'G',
      axes: ['morphosyntax_narrative', 'interaction_pragmatics'],
      events: ['S1.LUA_EN_INICIO', 'S1.LUA_AVANZA', 'S1.LUA_GIRA', 'S1.LLEGA_META'],
      observa: [
        [
          'Coloca tres fichas en fila —avanza, gira, avanza— y mueve a Lúa obedeciendo cada una. Pon una ficha equivocada: Lúa acaba fuera del camino.',
          'Lay three tokens in a row —move ahead, turn, move ahead— and move Lúa obeying each one. Put in a wrong token: Lúa ends up off the path.',
          'Col·loca tres fitxes en fila —avança, gira, avança— i mou la Lúa obeint-ne cadascuna. Posa-hi una fitxa equivocada: la Lúa acaba fora del camí.',
          'Coloca tres fichas en fila —avanza, xira, avanza— e move a Lúa obedecendo cada unha. Pon unha ficha equivocada: Lúa remata fóra do camiño.',
        ],
        ['¿Qué ficha falla?', 'Which token is wrong?', 'Quina fitxa falla?', 'Que ficha falla?'],
      ],
      experimenta: [
        [
          'La criatura planifica de tres a cinco fichas antes de mover a Lúa y después las ejecuta una a una. Si falla, cambia una sola ficha. Tú confirmas cada paso con el botón.',
          'The child plans three to five tokens before moving Lúa and then runs them one by one. If it fails, they change just one token. You confirm each step with the button.',
          'La criatura planifica de tres a cinc fitxes abans de moure la Lúa i després les executa una a una. Si falla, en canvia només una. Tu confirmes cada pas amb el botó.',
          'A criatura planifica de tres a cinco fichas antes de mover a Lúa e despois execútaas unha a unha. Se falla, cambia unha soa ficha. Ti confirmas cada paso co botón.',
        ],
        ['¿Qué hace Lúa después de girar?', 'What does Lúa do after turning?', 'Què fa la Lúa després de girar?', 'Que fai Lúa despois de xirar?'],
        [
          'Lee las fichas señalándolas de una en una; la criatura mueve un paso por ficha.',
          'Read the tokens pointing at them one by one; the child moves one step per token.',
          'Llegeix les fitxes assenyalant-les d’una en una; la criatura mou un pas per fitxa.',
          'Le as fichas sinalándoas dunha en unha; a criatura move un paso por ficha.',
        ],
      ],
      construye: [
        [
          'Diseña un camino y su fila de fichas para que otra persona lo recorra sin ayuda.',
          'Design a path and its row of tokens so another person can travel it without help.',
          'Dissenya un camí i la seva fila de fitxes perquè una altra persona el recorri sense ajuda.',
          'Deseña un camiño e a súa fila de fichas para que outra persoa o percorra sen axuda.',
        ],
        ['Si cambias una ficha, ¿dónde llega Lúa?', 'If you change one token, where does Lúa end up?', 'Si canvies una fitxa, on arriba la Lúa?', 'Se cambias unha ficha, onde chega Lúa?'],
      ],
      criterion: [
        'Una fila de cuatro fichas o más lleva a Lúa de INICIO a META y la criatura corrige al menos un error.',
        'A row of four or more tokens takes Lúa from INICIO to META and the child fixes at least one mistake.',
        'Una fila de quatre fitxes o més porta la Lúa d’INICIO a META i la criatura corregeix almenys un error.',
        'Unha fila de catro fichas ou máis leva a Lúa de INICIO a META e a criatura corrixe polo menos un erro.',
      ],
      observation: [
        'Anota si anticipa la izquierda y la derecha desde el punto de vista de Lúa.',
        'Note whether they anticipate left and right from Lúa’s point of view.',
        'Anota si anticipa l’esquerra i la dreta des del punt de vista de la Lúa.',
        'Anota se anticipa a esquerda e a dereita desde o punto de vista de Lúa.',
      ],
    }),
  ];
}

// ─── S2 · Estación de sonido ─────────────────────────────────────────────────

export function retosS2(cycleSolo: TripartiteCycle): WorldChallengeSpec[] {
  return [
    reto('S2', 1, {
      title: ['Suena y se para', 'It sounds and stops', 'Sona i s’atura', 'Soa e párase'],
      minutes: 5,
      scale: 'G',
      axes: ['auditory_perception', 'sensory_regulation'],
      events: ['S2.GOLPE_DEBIL'],
      observa: [
        [
          'Suelta el brazo desde poca altura sobre el resonador rojo grande. Deja que el sonido se apague del todo antes de moverte.',
          'Drop the arm from a low height onto the large red resonator. Let the sound die away completely before you move.',
          'Deixa anar el braç des de poca altura sobre el ressonador vermell gran. Deixa que el so s’apagui del tot abans de moure’t.',
          'Solta o brazo desde pouca altura sobre o resonador vermello grande. Deixa que o son se apague de todo antes de moverte.',
        ],
        ['¿Dónde está el sonido?', 'Where is the sound?', 'On és el so?', 'Onde está o son?'],
      ],
      experimenta: [
        [
          'La criatura apoya la palma en el resonador mientras tú golpeas suave: nota la vibración y cómo se para. Empieza siempre por el golpe suave. Tú confirmas con el botón.',
          'The child rests a palm on the resonator while you strike softly: they feel the vibration and how it stops. Always start with the soft strike. You confirm with the button.',
          'La criatura recolza el palmell al ressonador mentre tu colpeges suau: nota la vibració i com s’atura. Comença sempre pel cop suau. Tu confirmes amb el botó.',
          'A criatura apoia a palma no resonador mentres ti golpeas suave: nota a vibración e como se para. Comeza sempre polo golpe suave. Ti confirmas co botón.',
        ],
        ['¿Otra vez?', 'Again?', 'Una altra vegada?', 'Outra vez?'],
        [
          'Levantad juntos el brazo un poco, solo un dedo de altura, y soltadlo.',
          'Lift the arm together just a little, one finger high, and let it go.',
          'Aixequeu junts el braç una mica, només un dit d’alçada, i deixeu-lo anar.',
          'Levantade xuntos o brazo un pouco, só un dedo de altura, e soltádeo.',
        ],
      ],
      construye: [
        [
          'Juego de turnos: tú golpeas, la criatura pone la mano y te mira cuando se para.',
          'Turn-taking game: you strike, the child puts a hand on it and looks at you when it stops.',
          'Joc de torns: tu colpeges, la criatura hi posa la mà i et mira quan s’atura.',
          'Xogo de quendas: ti golpeas, a criatura pon a man e mírate cando se para.',
        ],
        ['¿Y el pequeño, cómo suena?', 'And the small one, how does it sound?', 'I el petit, com sona?', 'E o pequeno, como soa?'],
      ],
      criterion: [
        'Se orienta hacia el resonador después del golpe —mira, alarga la mano— o lo hace sonar con ayuda.',
        'Turns toward the resonator after the strike —looks, reaches out— or makes it sound with help.',
        'S’orienta cap al ressonador després del cop —mira, allarga la mà— o el fa sonar amb ajuda.',
        'Oriéntase cara ao resonador despois do golpe —mira, estende a man— ou faino soar con axuda.',
      ],
      observation: [
        'Anota cómo reacciona al sonido: calma, sorpresa o retirada. Si se sobresalta, baja la altura.',
        'Note how they react to the sound: calm, surprise or withdrawal. If they startle, lower the height.',
        'Anota com reacciona al so: calma, sorpresa o retirada. Si s’espanta, abaixa l’alçada.',
        'Anota como reacciona ao son: calma, sorpresa ou retirada. Se se sobresalta, baixa a altura.',
      ],
    }),
    reto('S2', 2, {
      title: ['Fuerte y suave', 'Loud and soft', 'Fort i suau', 'Forte e suave'],
      minutes: 8,
      scale: 'G',
      axes: ['auditory_perception', 'lexicon_semantics'],
      events: ['S2.GOLPE_FUERTE', 'S2.GOLPE_DEBIL'],
      observa: [
        [
          'Suelta el brazo desde arriba y, tras el silencio, desde abajo. La tableta espera a que el sonido acabe.',
          'Drop the arm from high up and, after the silence, from low down. The tablet waits for the sound to end.',
          'Deixa anar el braç des de dalt i, després del silenci, des de baix. La tauleta espera que el so acabi.',
          'Solta o brazo desde arriba e, tras o silencio, desde abaixo. A tableta agarda a que o son remate.',
        ],
        ['¿Cuál ha sonado fuerte?', 'Which one sounded loud?', 'Quin ha sonat fort?', 'Cal soou forte?'],
      ],
      experimenta: [
        [
          'La criatura suelta el brazo desde arriba y desde abajo. Entre golpe y golpe, silencio. Tú confirmas cada golpe con el botón.',
          'The child drops the arm from high and from low. Between strikes, silence. You confirm each strike with the button.',
          'La criatura deixa anar el braç des de dalt i des de baix. Entre cop i cop, silenci. Tu confirmes cada cop amb el botó.',
          'A criatura solta o brazo desde arriba e desde abaixo. Entre golpe e golpe, silencio. Ti confirmas cada golpe co botón.',
        ],
        ['¿Desde arriba o desde abajo?', 'From high or from low?', 'Des de dalt o des de baix?', 'Desde arriba ou desde abaixo?'],
        [
          'Marca las dos alturas con tus dedos, una alta y una baja, para que la criatura suelte desde ahí.',
          'Mark the two heights with your fingers, one high and one low, so the child releases from there.',
          'Marca les dues alçades amb els dits, una d’alta i una de baixa, perquè la criatura hi deixi anar el braç.',
          'Marca as dúas alturas cos dedos, unha alta e unha baixa, para que a criatura solte desde aí.',
        ],
      ],
      construye: [
        [
          'Fuerte, suave, fuerte, suave: dos veces seguidas.',
          'Loud, soft, loud, soft: twice in a row.',
          'Fort, suau, fort, suau: dues vegades seguides.',
          'Forte, suave, forte, suave: dúas veces seguidas.',
        ],
        ['¿Cómo despertamos a Lúa sin asustarla?', 'How do we wake Lúa without scaring her?', 'Com despertem la Lúa sense espantar-la?', 'Como espertamos a Lúa sen asustala?'],
      ],
      criterion: [
        'Hace a propósito un golpe fuerte y uno suave y los nombra o los señala.',
        'Deliberately makes one loud and one soft strike and names or points to them.',
        'Fa expressament un cop fort i un de suau i els anomena o els assenyala.',
        'Fai a propósito un golpe forte e un suave e nomeaos ou sinálaos.',
      ],
      observation: [
        'Anota si espera al silencio antes del siguiente golpe.',
        'Note whether they wait for silence before the next strike.',
        'Anota si espera el silenci abans del cop següent.',
        'Anota se agarda ao silencio antes do seguinte golpe.',
      ],
    }),
    retoFromCycle('S2', 3, cycleSolo, {
      title: ['Grande suena grave', 'Big sounds low', 'Gran sona greu', 'Grande soa grave'],
      minutes: 10,
      scale: 'G',
      axes: ['auditory_perception', 'lexicon_semantics'],
      events: ['S2.RESONADOR_COLOCADO', 'S2.RASPADO_COMPLETO'],
      criterion: [
        'Ordena los tres resonadores por tamaño y asocia uno con «grave» o «agudo».',
        'Orders the three resonators by size and links one with “low” or “high”.',
        'Ordena els tres ressonadors per mida i n’associa un amb «greu» o «agut».',
        'Ordena os tres resonadores por tamaño e asocia un con «grave» ou «agudo».',
      ],
      observation: [
        'Anota si se guía por la vista, por el oído o por las dos cosas.',
        'Note whether they go by sight, by ear, or both.',
        'Anota si es guia per la vista, per l’oïda o per totes dues coses.',
        'Anota se se guía pola vista, polo oído ou polas dúas cousas.',
      ],
    }),
    reto('S2', 5, {
      title: ['Compón una partitura', 'Compose a score', 'Compon una partitura', 'Compón unha partitura'],
      minutes: 15,
      scale: 'G',
      axes: ['phonology_speech', 'auditory_perception'],
      events: ['S2.RESONADOR_COLOCADO', 'S2.GOLPE_FUERTE', 'S2.GOLPE_DEBIL', 'S2.PULSO_SEGUIDO'],
      observa: [
        [
          'Toca grave, agudo, grave, agudo, siguiendo el metrónomo de luz de la tableta. Para y espera cinco segundos.',
          'Play low, high, low, high, following the tablet’s light metronome. Stop and wait five seconds.',
          'Toca greu, agut, greu, agut, seguint el metrònom de llum de la tauleta. Atura’t i espera cinc segons.',
          'Toca grave, agudo, grave, agudo, seguindo o metrónomo de luz da tableta. Para e agarda cinco segundos.',
        ],
        ['¿Qué viene después?', 'What comes next?', 'Què ve després?', 'Que vén despois?'],
      ],
      experimenta: [
        [
          'La criatura coloca cuatro resonadores en fila y toca su serie siguiendo el metrónomo de luz, que no suena. Tú confirmas con el botón cuando la repite igual.',
          'The child places four resonators in a row and plays their series following the light metronome, which makes no sound. You confirm with the button when they repeat it the same way.',
          'La criatura col·loca quatre ressonadors en fila i toca la seva sèrie seguint el metrònom de llum, que no sona. Tu confirmes amb el botó quan la repeteix igual.',
          'A criatura coloca catro resonadores en fila e toca a súa serie seguindo o metrónomo de luz, que non soa. Ti confirmas co botón cando a repite igual.',
        ],
        ['¿Se repite?', 'Does it repeat?', 'Es repeteix?', 'Repítese?'],
        [
          'Señala cada resonador al ritmo de la luz; la criatura golpea donde está tu dedo.',
          'Point to each resonator in time with the light; the child strikes where your finger is.',
          'Assenyala cada ressonador al ritme de la llum; la criatura colpeja on és el teu dit.',
          'Sinala cada resonador ao ritmo da luz; a criatura golpea onde está o teu dedo.',
        ],
      ],
      construye: [
        [
          'La partitura del nombre: un golpe por sílaba. «Lú-a» son dos golpes.',
          'The name score: one strike per syllable. “Lú-a” is two strikes.',
          'La partitura del nom: un cop per síl·laba. «Lú-a» són dos cops.',
          'A partitura do nome: un golpe por sílaba. «Lú-a» son dous golpes.',
        ],
        ['¿Cuántos golpes tiene tu nombre?', 'How many strikes does your name have?', 'Quants cops té el teu nom?', 'Cantos golpes ten o teu nome?'],
      ],
      criterion: [
        'Toca una serie de cuatro sonidos, la repite igual dos veces y da un golpe por sílaba de su nombre.',
        'Plays a four-sound series, repeats it the same way twice and gives one strike per syllable of their name.',
        'Toca una sèrie de quatre sons, la repeteix igual dues vegades i fa un cop per síl·laba del seu nom.',
        'Toca unha serie de catro sons, repítea igual dúas veces e dá un golpe por sílaba do seu nome.',
      ],
      observation: [
        'Anota si mantiene el pulso de la luz o se adelanta.',
        'Note whether they keep the light’s pulse or rush ahead.',
        'Anota si manté el pols de la llum o s’avança.',
        'Anota se mantén o pulso da luz ou se adianta.',
      ],
    }),
  ];
}

// ─── S3 · Laboratorio de rampas ──────────────────────────────────────────────

export function retosS3(cycleSolo: TripartiteCycle): WorldChallengeSpec[] {
  return [
    reto('S3', 1, {
      title: ['Rueda y llega', 'It rolls and arrives', 'Roda i arriba', 'Roda e chega'],
      minutes: 5,
      scale: 'G',
      axes: ['interaction_pragmatics', 'lexicon_semantics'],
      events: ['S3.ESFERA_ARRIBA', 'S3.SE_PARA'],
      observa: [
        [
          'Suelta la esfera grande desde el pilar 1 y deja que llegue sola al receptor.',
          'Release the large sphere from pillar 1 and let it reach the receiver on its own.',
          'Deixa anar l’esfera gran des del pilar 1 i deixa que arribi sola al receptor.',
          'Solta a esfera grande desde o piar 1 e deixa que chegue soa ao receptor.',
        ],
        ['¿Dónde está la bola?', 'Where is the ball?', 'On és la bola?', 'Onde está a bóla?'],
      ],
      experimenta: [
        [
          'La criatura suelta la esfera arriba de la rampa baja y la sigue con la mirada hasta el receptor. Tú confirmas con el botón cuando se para.',
          'The child releases the sphere at the top of the low ramp and follows it with their eyes to the receiver. You confirm with the button when it stops.',
          'La criatura deixa anar l’esfera a dalt de la rampa baixa i la segueix amb la mirada fins al receptor. Tu confirmes amb el botó quan s’atura.',
          'A criatura solta a esfera arriba da rampla baixa e séguea coa mirada ata o receptor. Ti confirmas co botón cando se para.',
        ],
        ['¿Se va?', 'Is it going?', 'Se’n va?', 'Vaise?'],
        [
          'Abrid juntos la mano arriba de la rampa para que la esfera salga sola.',
          'Open the hand together at the top of the ramp so the sphere rolls off by itself.',
          'Obriu junts la mà a dalt de la rampa perquè l’esfera surti sola.',
          'Abride xuntos a man arriba da rampla para que a esfera saia soa.',
        ],
      ],
      construye: [
        [
          'Juego de aparecer: la esfera baja, la criatura la recoge del receptor y te la da.',
          'Appearing game: the sphere rolls down, the child picks it up from the receiver and hands it to you.',
          'Joc d’aparèixer: l’esfera baixa, la criatura la recull del receptor i te la dona.',
          'Xogo de aparecer: a esfera baixa, a criatura cóllea do receptor e dácha.',
        ],
        ['¿Otra vez?', 'Again?', 'Una altra vegada?', 'Outra vez?'],
      ],
      criterion: [
        'Suelta la esfera, con o sin ayuda, y la sigue con la mirada hasta el receptor.',
        'Releases the sphere, with or without help, and follows it with their eyes to the receiver.',
        'Deixa anar l’esfera, amb ajuda o sense, i la segueix amb la mirada fins al receptor.',
        'Solta a esfera, con ou sen axuda, e séguea coa mirada ata o receptor.',
      ],
      observation: [
        'Anota si te busca para repetir: mirada, gesto o sonido.',
        'Note whether they seek you to repeat: look, gesture or sound.',
        'Anota si et busca per repetir: mirada, gest o so.',
        'Anota se te busca para repetir: mirada, xesto ou son.',
      ],
    }),
    reto('S3', 2, {
      title: ['Arriba y abajo', 'High and low', 'Dalt i baix', 'Arriba e abaixo'],
      minutes: 8,
      scale: 'G',
      axes: ['lexicon_semantics', 'morphosyntax_narrative'],
      events: ['S3.ESFERA_ARRIBA', 'S3.LLEGADA_RAPIDA', 'S3.SE_PARA'],
      observa: [
        [
          'Suelta la esfera desde el pilar 1 y después desde el pilar 3. Espera a que pare cada vez.',
          'Release the sphere from pillar 1 and then from pillar 3. Wait for it to stop each time.',
          'Deixa anar l’esfera des del pilar 1 i després des del pilar 3. Espera que s’aturi cada vegada.',
          'Solta a esfera desde o piar 1 e despois desde o piar 3. Agarda a que pare cada vez.',
        ],
        ['¿Desde arriba va más rápido?', 'Does it go faster from up high?', 'Des de dalt va més ràpid?', 'Desde arriba vai máis rápido?'],
      ],
      experimenta: [
        [
          'La criatura prueba las dos alturas y tú pones palabras: «arriba», «abajo», «rápido», «despacio». Confirmas cada bajada con el botón.',
          'The child tries both heights and you put words to it: “high”, “low”, “fast”, “slow”. You confirm each run with the button.',
          'La criatura prova les dues alçades i tu hi poses paraules: «dalt», «baix», «ràpid», «a poc a poc». Confirmes cada baixada amb el botó.',
          'A criatura proba as dúas alturas e ti pos palabras: «arriba», «abaixo», «rápido», «amodo». Confirmas cada baixada co botón.',
        ],
        ['¿Cuál ha ido más rápido?', 'Which one went faster?', 'Quina ha anat més ràpid?', 'Cal foi máis rápido?'],
        [
          'Pon una mano a la altura del pilar 1 y otra a la del pilar 3 para que vea la diferencia.',
          'Hold one hand at the height of pillar 1 and the other at pillar 3 so they see the difference.',
          'Posa una mà a l’alçada del pilar 1 i l’altra a la del pilar 3 perquè vegi la diferència.',
          'Pon unha man á altura do piar 1 e outra á do piar 3 para que vexa a diferenza.',
        ],
      ],
      construye: [
        [
          'Una torre de tres pilares y una bajada desde lo más alto.',
          'A tower of three pillars and a run from the very top.',
          'Una torre de tres pilars i una baixada des de dalt de tot.',
          'Unha torre de tres piares e unha baixada desde o máis alto.',
        ],
        ['¿Y desde más arriba todavía?', 'And from even higher?', 'I des de més amunt encara?', 'E desde máis arriba aínda?'],
      ],
      criterion: [
        'Compara dos alturas y usa «arriba/abajo» o «rápido/despacio», con palabra o con gesto.',
        'Compares two heights and uses “high/low” or “fast/slow”, in words or by gesture.',
        'Compara dues alçades i fa servir «dalt/baix» o «ràpid/a poc a poc», amb paraula o amb gest.',
        'Compara dúas alturas e usa «arriba/abaixo» ou «rápido/amodo», con palabra ou con xesto.',
      ],
      observation: [
        'Anota si espera a que la esfera pare antes de lanzar otra.',
        'Note whether they wait for the sphere to stop before releasing another.',
        'Anota si espera que l’esfera s’aturi abans de llançar-ne una altra.',
        'Anota se agarda a que a esfera pare antes de lanzar outra.',
      ],
    }),
    retoFromCycle('S3', 3, cycleSolo, {
      title: ['Liso corre, rugoso frena', 'Smooth runs, rough brakes', 'Llis corre, rugós frena', 'Liso corre, rugoso frea'],
      minutes: 12,
      scale: 'G',
      axes: ['lexicon_semantics', 'sensory_regulation'],
      events: ['S3.LLEGADA_RAPIDA', 'S3.LLEGADA_LENTA', 'S3.SE_PARA'],
      criterion: [
        'Compara una bajada por el tramo liso y otra por el rugoso y dice o señala cuál llegó antes.',
        'Compares a run on the smooth section and one on the rough section and says or points to which arrived first.',
        'Compara una baixada pel tram llis i una altra pel rugós i diu o assenyala quina ha arribat abans.',
        'Compara unha baixada polo tramo liso e outra polo rugoso e di ou sinala cal chegou antes.',
      ],
      observation: [
        'Anota si relaciona la textura que toca con lo que ve en la bajada.',
        'Note whether they connect the texture they touch with what they see in the run.',
        'Anota si relaciona la textura que toca amb el que veu a la baixada.',
        'Anota se relaciona a textura que toca co que ve na baixada.',
      ],
    }),
    reto('S3', 5, {
      title: ['Diseña la rampa más lenta', 'Design the slowest ramp', 'Dissenya la rampa més lenta', 'Deseña a rampla máis lenta'],
      minutes: 15,
      scale: 'G',
      axes: ['morphosyntax_narrative', 'graphomotor'],
      events: ['S3.SALIDA_ANTICIPADA', 'S3.LLEGADA_LENTA', 'S3.SE_PARA'],
      observa: [
        [
          'Monta dos rampas distintas una al lado de la otra. Antes de soltar, espera cinco segundos en silencio.',
          'Build two different ramps side by side. Before releasing, wait five seconds in silence.',
          'Munta dues rampes diferents una al costat de l’altra. Abans de deixar anar, espera cinc segons en silenci.',
          'Monta dúas ramplas distintas unha ao lado da outra. Antes de soltar, agarda cinco segundos en silencio.',
        ],
        ['¿Cuál llegará la última?', 'Which one will arrive last?', 'Quina arribarà l’última?', 'Cal chegará a última?'],
      ],
      experimenta: [
        [
          'La criatura construye la rampa que llega más despacio al receptor sin pararse por el camino. Dice antes de soltar qué cree que pasará. Tú confirmas cada prueba con el botón.',
          'The child builds the ramp that reaches the receiver most slowly without stopping on the way. Before releasing, they say what they think will happen. You confirm each try with the button.',
          'La criatura construeix la rampa que arriba més a poc a poc al receptor sense aturar-se pel camí. Abans de deixar anar, diu què creu que passarà. Tu confirmes cada prova amb el botó.',
          'A criatura constrúe a rampla que chega máis amodo ao receptor sen pararse polo camiño. Antes de soltar, di que cre que pasará. Ti confirmas cada proba co botón.',
        ],
        ['¿Qué pieza frena la esfera?', 'Which piece slows the sphere down?', 'Quina peça frena l’esfera?', 'Que peza frea a esfera?'],
        [
          'Cambia una sola cosa entre prueba y prueba: la altura, el tramo rugoso o la curva.',
          'Change only one thing between tries: the height, the rough section or the curve.',
          'Canvia una sola cosa entre prova i prova: l’alçada, el tram rugós o la corba.',
          'Cambia unha soa cousa entre proba e proba: a altura, o tramo rugoso ou a curva.',
        ],
      ],
      construye: [
        [
          'Dibuja el recorrido en un papel y después constrúyelo tal cual.',
          'Draw the route on paper and then build it exactly like that.',
          'Dibuixa el recorregut en un paper i després construeix-lo tal qual.',
          'Debuxa o percorrido nun papel e despois constrúeo tal cal.',
        ],
        ['Si la rampa fuera de hielo, ¿qué pasaría?', 'If the ramp were made of ice, what would happen?', 'Si la rampa fos de gel, què passaria?', 'Se a rampla fose de xeo, que pasaría?'],
      ],
      criterion: [
        'Predice antes de soltar, cambia una cosa para frenar la esfera y lo explica con «porque».',
        'Predicts before releasing, changes one thing to slow the sphere and explains it with “because”.',
        'Prediu abans de deixar anar, canvia una cosa per frenar l’esfera i ho explica amb «perquè».',
        'Predí antes de soltar, cambia unha cousa para frear a esfera e explícao con «porque».',
      ],
      observation: [
        'Anota si cambia varias cosas a la vez o una cada vez.',
        'Note whether they change several things at once or one at a time.',
        'Anota si canvia diverses coses alhora o una cada vegada.',
        'Anota se cambia varias cousas á vez ou unha cada vez.',
      ],
    }),
  ];
}

// ─── S4 · Máquina de soplo ───────────────────────────────────────────────────

// Higiene del soplo: la boquilla es de uso individual.
const MOUTHPIECE: Line = [
  'Cada criatura usa su propia boquilla y se lava después.',
  'Each child uses their own mouthpiece, washed afterwards.',
  'Cada criatura fa servir el seu propi broquet i es renta després.',
  'Cada criatura usa a súa propia boquilla e lávase despois.',
];

function withMouthpiece(line: Line): Line {
  return [
    `${line[0]} ${MOUTHPIECE[0]}`,
    `${line[1]} ${MOUTHPIECE[1]}`,
    `${line[2]} ${MOUTHPIECE[2]}`,
    `${line[3]} ${MOUTHPIECE[3]}`,
  ];
}

export function retosS4(cycleSolo: TripartiteCycle): WorldChallengeSpec[] {
  return [
    reto('S4', 1, {
      title: ['El aire se nota', 'You can feel the air', 'L’aire es nota', 'O aire nótase'],
      minutes: 5,
      scale: 'E',
      axes: ['interaction_pragmatics', 'sensory_regulation'],
      events: ['S4.ROTOR_GIRA'],
      observa: [
        [
          'Sopla tú, despacio, sobre el rotor: gira. Después sopla suave sobre la mano de la criatura.',
          'You blow slowly on the rotor: it spins. Then blow softly on the child’s hand.',
          'Bufa tu, a poc a poc, sobre el rotor: gira. Després bufa suau sobre la mà de la criatura.',
          'Sopra ti, amodo, sobre o rotor: xira. Despois sopra suave sobre a man da criatura.',
        ],
        ['¿Dónde está el aire?', 'Where is the air?', 'On és l’aire?', 'Onde está o aire?'],
      ],
      experimenta: [
        withSafety([
          'Alterna: soplo en la mano, soplo en el rotor. La criatura no tiene que soplar; si lo intenta, celébralo igual. Tú confirmas con el botón cuando el rotor gira.',
          'Alternate: blow on the hand, blow on the rotor. The child does not have to blow; if they try, celebrate it anyway. You confirm with the button when the rotor spins.',
          'Alterna: bufada a la mà, bufada al rotor. La criatura no ha de bufar; si ho intenta, celebra-ho igualment. Tu confirmes amb el botó quan el rotor gira.',
          'Alterna: sopro na man, sopro no rotor. A criatura non ten que soprar; se o tenta, celébrao igual. Ti confirmas co botón cando o rotor xira.',
        ]),
        ['¿Gira?', 'Is it spinning?', 'Gira?', 'Xira?'],
        [
          'Sopla a la altura de su cara, con los labios muy redondos, para que vea el gesto.',
          'Blow at the height of their face, with very round lips, so they see the gesture.',
          'Bufa a l’alçada de la seva cara, amb els llavis molt rodons, perquè vegi el gest.',
          'Sopra á altura da súa cara, cos beizos moi redondos, para que vexa o xesto.',
        ],
      ],
      construye: [
        [
          'La criatura empuja el rotor con el dedo y lo compara con tu soplo.',
          'The child pushes the rotor with a finger and compares it with your blowing.',
          'La criatura empeny el rotor amb el dit i el compara amb la teva bufada.',
          'A criatura empurra o rotor co dedo e compárao co teu sopro.',
        ],
        ['¿Soplamos otra vez?', 'Shall we blow again?', 'Bufem una altra vegada?', 'Sopramos outra vez?'],
      ],
      criterion: [
        'Mira el rotor cuando gira y te pide repetir con mirada, gesto o sonido.',
        'Looks at the rotor when it spins and asks you to repeat with a look, gesture or sound.',
        'Mira el rotor quan gira i et demana repetir amb mirada, gest o so.',
        'Mira o rotor cando xira e pídeche repetir con mirada, xesto ou son.',
      ],
      observation: [
        'Anota si acepta el aire en la mano o la retira.',
        'Note whether they accept the air on their hand or pull it away.',
        'Anota si accepta l’aire a la mà o la retira.',
        'Anota se acepta o aire na man ou a retira.',
      ],
    }),
    reto('S4', 2, {
      title: ['Soplo largo, soplo corto', 'Long blow, short blow', 'Bufada llarga, bufada curta', 'Sopro longo, sopro curto'],
      minutes: 8,
      scale: 'E',
      axes: ['phonology_speech', 'sensory_regulation'],
      events: ['S4.PRAXIA_REDONDEO', 'S4.ROTOR_GIRA'],
      observa: [
        [
          'Sopla por el canal un soplo largo y luego uno corto. El rotor gira mucho y después poco.',
          'Blow through the channel with a long blow and then a short one. The rotor spins a lot and then a little.',
          'Bufa pel canal una bufada llarga i després una de curta. El rotor gira molt i després poc.',
          'Sopra polo canal un sopro longo e despois un curto. O rotor xira moito e despois pouco.',
        ],
        ['¿Cuándo ha girado más?', 'When did it spin more?', 'Quan ha girat més?', 'Cando xirou máis?'],
      ],
      experimenta: [
        withMouthpiece([
          'La criatura redondea los labios y sopla por el canal, largo y corto. Tú confirmas con el botón cuando el rotor se mueve.',
          'The child rounds their lips and blows through the channel, long and short. You confirm with the button when the rotor moves.',
          'La criatura arrodoneix els llavis i bufa pel canal, llarg i curt. Tu confirmes amb el botó quan el rotor es mou.',
          'A criatura arredonda os beizos e sopra polo canal, longo e curto. Ti confirmas co botón cando o rotor se move.',
        ]),
        ['¿Soplamos como para apagar una vela?', 'Shall we blow as if putting out a candle?', 'Bufem com per apagar una espelma?', 'Sopramos como para apagar unha vela?'],
        [
          'Ponte delante, a su altura, y sopla tú primero con los labios redondos.',
          'Sit in front of them, at their height, and blow first with round lips.',
          'Posa’t davant, a la seva alçada, i bufa tu primer amb els llavis rodons.',
          'Ponte diante, á súa altura, e sopra ti primeiro cos beizos redondos.',
        ],
      ],
      construye: [
        [
          'Un soplo que levante la compuerta ligera.',
          'A blow that lifts the light gate.',
          'Una bufada que aixequi la comporta lleugera.',
          'Un sopro que levante a comporta lixeira.',
        ],
        ['¿Y un soplo cortito, también la levanta?', 'And a tiny blow, does it lift it too?', 'I una bufada curteta, també l’aixeca?', 'E un sopro curtiño, tamén a levanta?'],
      ],
      criterion: [
        'Sopla a propósito por el canal y el rotor se mueve.',
        'Blows on purpose through the channel and the rotor moves.',
        'Bufa expressament pel canal i el rotor es mou.',
        'Sopra a propósito polo canal e o rotor móvese.',
      ],
      observation: [
        'Anota si redondea los labios o sopla con la boca abierta.',
        'Note whether they round their lips or blow with an open mouth.',
        'Anota si arrodoneix els llavis o bufa amb la boca oberta.',
        'Anota se arredonda os beizos ou sopra coa boca aberta.',
      ],
    }),
    retoFromCycle('S4', 3, cycleSolo, {
      title: ['Ligera y pesada', 'Light and heavy', 'Lleugera i pesant', 'Lixeira e pesada'],
      minutes: 10,
      scale: 'E',
      axes: ['lexicon_semantics', 'phonology_speech'],
      events: ['S4.MOLINETE_GIRA', 'S4.COMPUERTA_LIGERA', 'S4.COMPUERTA_PESADA'],
      criterion: [
        'Con el mismo soplo compara las dos compuertas y dice o señala cuál se movió más.',
        'With the same blow, compares the two gates and says or points to which one moved more.',
        'Amb la mateixa bufada compara les dues comportes i diu o assenyala quina s’ha mogut més.',
        'Co mesmo sopro compara as dúas comportas e di ou sinala cal se moveu máis.',
      ],
      observation: [
        'Anota si regula la fuerza del soplo o sopla siempre igual.',
        'Note whether they adjust the strength of the blow or always blow the same.',
        'Anota si regula la força de la bufada o bufa sempre igual.',
        'Anota se regula a forza do sopro ou sopra sempre igual.',
      ],
    }),
    reto('S4', 5, {
      title: ['El circuito de viento', 'The wind circuit', 'El circuit de vent', 'O circuíto de vento'],
      minutes: 15,
      scale: 'E',
      axes: ['morphosyntax_narrative', 'phonology_speech'],
      events: ['S4.PRAXIA_REDONDEO', 'S4.MOLINETE_GIRA', 'S4.COMPUERTA_LIGERA', 'S4.COMPUERTA_PESADA'],
      observa: [
        [
          'Monta un canal con codo: un solo soplo mueve el molinete y después la compuerta ligera.',
          'Build a channel with an elbow: a single blow moves the pinwheel and then the light gate.',
          'Munta un canal amb colze: una sola bufada mou el molinet i després la comporta lleugera.',
          'Monta unha canle con cóbado: un só sopro move o muíño e despois a comporta lixeira.',
        ],
        ['¿Por dónde viaja el aire?', 'Which way does the air travel?', 'Per on viatja l’aire?', 'Por onde viaxa o aire?'],
      ],
      experimenta: [
        withMouthpiece([
          'La criatura diseña su circuito, lo prueba y lo cambia hasta que un soplo mueva dos piezas. Tú confirmas cada pieza con el botón.',
          'The child designs their circuit, tests it and changes it until one blow moves two pieces. You confirm each piece with the button.',
          'La criatura dissenya el seu circuit, el prova i el canvia fins que una bufada mogui dues peces. Tu confirmes cada peça amb el botó.',
          'A criatura deseña o seu circuíto, próbao e cámbiao ata que un sopro mova dúas pezas. Ti confirmas cada peza co botón.',
        ]),
        ['¿Hacia dónde dobla el aire en el codo?', 'Which way does the air turn at the elbow?', 'Cap on gira l’aire al colze?', 'Cara a onde dobra o aire no cóbado?'],
        [
          'Recorre con el dedo el camino del aire, desde la boquilla hasta la compuerta.',
          'Trace the air’s path with your finger, from the mouthpiece to the gate.',
          'Resegueix amb el dit el camí de l’aire, des del broquet fins a la comporta.',
          'Percorre co dedo o camiño do aire, desde a boquilla ata a comporta.',
        ],
      ],
      construye: [
        [
          'Explica el circuito a otra persona en orden: primero, después, al final.',
          'Explain the circuit to someone else in order: first, next, at the end.',
          'Explica el circuit a una altra persona en ordre: primer, després, al final.',
          'Explica o circuíto a outra persoa en orde: primeiro, despois, ao final.',
        ],
        ['Si quitas el codo, ¿qué pieza se queda quieta?', 'If you take away the elbow, which piece stays still?', 'Si treus el colze, quina peça es queda quieta?', 'Se quitas o cóbado, que peza queda quieta?'],
      ],
      criterion: [
        'Construye un circuito con codo que mueve dos piezas con un soplo y explica por dónde va el aire.',
        'Builds a circuit with an elbow that moves two pieces with one blow and explains where the air goes.',
        'Construeix un circuit amb colze que mou dues peces amb una bufada i explica per on va l’aire.',
        'Constrúe un circuíto con cóbado que move dúas pezas cun sopro e explica por onde vai o aire.',
      ],
      observation: [
        'Anota si anticipa el efecto del codo antes de soplar.',
        'Note whether they anticipate the elbow’s effect before blowing.',
        'Anota si anticipa l’efecte del colze abans de bufar.',
        'Anota se anticipa o efecto do cóbado antes de soprar.',
      ],
    }),
  ];
}

// ─── S5 · Puente de equilibrio ───────────────────────────────────────────────

export function retosS5(cycleSolo: TripartiteCycle): WorldChallengeSpec[] {
  return [
    reto('S5', 1, {
      title: ['Sube y baja', 'Up and down', 'Puja i baixa', 'Sobe e baixa'],
      minutes: 5,
      scale: 'G',
      axes: ['lexicon_semantics', 'interaction_pragmatics'],
      events: ['S5.INCLINA_IZQ', 'S5.INCLINA_DCHA'],
      observa: [
        [
          'Con la viga sobre el fulcro, aprieta un extremo con el dedo: baja, y el otro sube. Suelta y mira.',
          'With the beam on the fulcrum, press one end with your finger: it goes down and the other goes up. Let go and watch.',
          'Amb la biga sobre el fulcre, prem un extrem amb el dit: baixa, i l’altre puja. Deixa-la i mira.',
          'Coa viga sobre o fulcro, aperta un extremo co dedo: baixa, e o outro sobe. Solta e mira.',
        ],
        ['¿Arriba o abajo?', 'Up or down?', 'Amunt o avall?', 'Arriba ou abaixo?'],
      ],
      experimenta: [
        withSafety([
          'Solo la viga y el fulcro: las masas las guardas tú. La criatura empuja un lado y mira cómo sube el otro. Tú confirmas con el botón.',
          'Only the beam and the fulcrum: you keep the masses. The child pushes one side and watches the other go up. You confirm with the button.',
          'Només la biga i el fulcre: les masses les guardes tu. La criatura empeny un costat i mira com puja l’altre. Tu confirmes amb el botó.',
          'Só a viga e o fulcro: as masas gárdalas ti. A criatura empurra un lado e mira como sobe o outro. Ti confirmas co botón.',
        ]),
        ['¿Y ahora este lado?', 'And now this side?', 'I ara aquest costat?', 'E agora este lado?'],
        [
          'Pon su mano en un extremo y la tuya en el otro, y movedlo como un balancín.',
          'Put their hand on one end and yours on the other, and move it like a seesaw.',
          'Posa la seva mà en un extrem i la teva a l’altre, i moveu-la com un balancí.',
          'Pon a súa man nun extremo e a túa no outro, e movédea coma un randeeiro.',
        ],
      ],
      construye: [
        [
          'Balancín de turnos: tú bajas un lado, la criatura baja el otro.',
          'Turn-taking seesaw: you push one side down, the child pushes the other.',
          'Balancí de torns: tu baixes un costat, la criatura baixa l’altre.',
          'Randeeiro de quendas: ti baixas un lado, a criatura baixa o outro.',
        ],
        ['¿Quién sube ahora?', 'Who goes up now?', 'Qui puja ara?', 'Quen sobe agora?'],
      ],
      criterion: [
        'Empuja un extremo y mira cómo sube el otro.',
        'Pushes one end and watches the other go up.',
        'Empeny un extrem i mira com puja l’altre.',
        'Empurra un extremo e mira como sobe o outro.',
      ],
      observation: [
        'Anota si espera tu turno en el balancín.',
        'Note whether they wait for your turn on the seesaw.',
        'Anota si espera el teu torn al balancí.',
        'Anota se agarda a túa quenda no randeeiro.',
      ],
    }),
    reto('S5', 2, {
      title: ['Este pesa más', 'This one is heavier', 'Aquest pesa més', 'Este pesa máis'],
      minutes: 8,
      scale: 'G',
      axes: ['lexicon_semantics', 'morphosyntax_narrative'],
      events: ['S5.MASA_COLOCADA', 'S5.INCLINA_IZQ', 'S5.INCLINA_DCHA', 'S5.EQUILIBRIO'],
      observa: [
        [
          'Pon la masa de 60 g en un extremo: ese lado baja. Pon otra igual en el otro extremo: la viga se queda quieta.',
          'Put the 60 g mass on one end: that side goes down. Put an identical one on the other end: the beam stays still.',
          'Posa la massa de 60 g en un extrem: aquell costat baixa. Posa’n una d’igual a l’altre extrem: la biga es queda quieta.',
          'Pon a masa de 60 g nun extremo: ese lado baixa. Pon outra igual no outro extremo: a viga queda quieta.',
        ],
        ['¿Qué lado baja?', 'Which side goes down?', 'Quin costat baixa?', 'Que lado baixa?'],
      ],
      experimenta: [
        withSafety([
          'La criatura coloca masas a un lado y al otro y mira qué pasa. Tú pones palabras: «pesa», «no pesa», «igual». Confirmas cada masa con el botón.',
          'The child places masses on one side and the other and watches what happens. You put words to it: “heavy”, “light”, “the same”. You confirm each mass with the button.',
          'La criatura col·loca masses a un costat i a l’altre i mira què passa. Tu hi poses paraules: «pesa», «no pesa», «igual». Confirmes cada massa amb el botó.',
          'A criatura coloca masas a un lado e ao outro e mira que pasa. Ti pos palabras: «pesa», «non pesa», «igual». Confirmas cada masa co botón.',
        ]),
        ['¿Cuál pesa más?', 'Which one is heavier?', 'Quina pesa més?', 'Cal pesa máis?'],
        [
          'Dale una masa en cada mano para que note cuál pesa más antes de ponerlas.',
          'Give them one mass in each hand so they feel which is heavier before placing them.',
          'Dona-li una massa a cada mà perquè noti quina pesa més abans de posar-les.',
          'Dálle unha masa en cada man para que note cal pesa máis antes de poñelas.',
        ],
      ],
      construye: [
        [
          'Deja la viga quieta con una masa igual a cada lado.',
          'Leave the beam still with an equal mass on each side.',
          'Deixa la biga quieta amb una massa igual a cada costat.',
          'Deixa a viga quieta cunha masa igual a cada lado.',
        ],
        ['¿Y si quitamos una?', 'And if we take one away?', 'I si en traiem una?', 'E se quitamos unha?'],
      ],
      criterion: [
        'Coloca masas y señala o nombra el lado que pesa más; deja la viga quieta con dos masas iguales.',
        'Places masses and points to or names the heavier side; leaves the beam still with two equal masses.',
        'Col·loca masses i assenyala o anomena el costat que pesa més; deixa la biga quieta amb dues masses iguals.',
        'Coloca masas e sinala ou nomea o lado que pesa máis; deixa a viga quieta con dúas masas iguais.',
      ],
      observation: [
        'Anota si sujeta la viga con la mano o la deja moverse sola.',
        'Note whether they hold the beam with their hand or let it move on its own.',
        'Anota si subjecta la biga amb la mà o la deixa moure’s sola.',
        'Anota se suxeita a viga coa man ou a deixa moverse soa.',
      ],
    }),
    retoFromCycle('S5', 3, cycleSolo, {
      title: ['Cerca y lejos del centro', 'Near and far from the centre', 'A prop i lluny del centre', 'Preto e lonxe do centro'],
      minutes: 10,
      scale: 'G',
      axes: ['lexicon_semantics', 'interaction_pragmatics'],
      events: ['S5.MASA_COLOCADA', 'S5.INCLINA_IZQ', 'S5.INCLINA_DCHA', 'S5.EQUILIBRIO', 'S5.PUENTE_ESTABLE'],
      criterion: [
        'Deja la viga quieta moviendo masas hacia el centro o hacia fuera y la fija con los clips.',
        'Gets the beam still by moving masses toward or away from the centre and fixes it with the clips.',
        'Deixa la biga quieta movent masses cap al centre o cap enfora i la fixa amb els clips.',
        'Deixa a viga quieta movendo masas cara ao centro ou cara a fóra e fíxaa cos clips.',
      ],
      observation: [
        'Anota si usa «cerca» y «lejos» para explicar lo que hace.',
        'Note whether they use “near” and “far” to explain what they do.',
        'Anota si fa servir «a prop» i «lluny» per explicar el que fa.',
        'Anota se usa «preto» e «lonxe» para explicar o que fai.',
      ],
    }),
    reto('S5', 5, {
      title: ['Predice antes de soltar', 'Predict before letting go', 'Prediu abans de deixar anar', 'Predí antes de soltar'],
      minutes: 15,
      scale: 'G',
      axes: ['morphosyntax_narrative', 'lexicon_semantics'],
      events: ['S5.MASA_COLOCADA', 'S5.INCLINA_IZQ', 'S5.INCLINA_DCHA', 'S5.EQUILIBRIO'],
      observa: [
        [
          'Sujeta la viga quieta con la mano y coloca 40 g en el alvéolo 2 y 20 g en el alvéolo 4. No sueltes todavía.',
          'Hold the beam still with your hand and place 40 g in slot 2 and 20 g in slot 4. Do not let go yet.',
          'Subjecta la biga quieta amb la mà i col·loca 40 g a l’alvèol 2 i 20 g a l’alvèol 4. No la deixis anar encara.',
          'Suxeita a viga quieta coa man e coloca 40 g no alvéolo 2 e 20 g no alvéolo 4. Non a soltes aínda.',
        ],
        ['¿Qué lado bajará cuando suelte?', 'Which side will go down when I let go?', 'Quin costat baixarà quan la deixi anar?', 'Que lado baixará cando a solte?'],
      ],
      experimenta: [
        [
          'Prepara tres montajes con la viga sujeta. Antes de soltar, la criatura elige una tarjeta: baja la izquierda, baja la derecha o se queda quieta. Después se suelta y se comprueba. Tú confirmas cada resultado con el botón.',
          'Set up three arrangements with the beam held. Before letting go, the child picks a card: left goes down, right goes down, or it stays still. Then you let go and check. You confirm each result with the button.',
          'Prepara tres muntatges amb la biga subjecta. Abans de deixar-la anar, la criatura tria una targeta: baixa l’esquerra, baixa la dreta o es queda quieta. Després es deixa anar i es comprova. Tu confirmes cada resultat amb el botó.',
          'Prepara tres montaxes coa viga suxeita. Antes de soltar, a criatura escolle unha tarxeta: baixa a esquerda, baixa a dereita ou queda quieta. Despois sóltase e compróbase. Ti confirmas cada resultado co botón.',
        ],
        ['¿Importa lo lejos que está la masa?', 'Does it matter how far away the mass is?', 'Importa com de lluny és la massa?', 'Importa o lonxe que está a masa?'],
        [
          'Mueve la misma masa un alvéolo cada vez, sin cambiar nada más, y mirad juntos qué pasa.',
          'Move the same mass one slot at a time, changing nothing else, and watch together what happens.',
          'Mou la mateixa massa un alvèol cada vegada, sense canviar res més, i mireu junts què passa.',
          'Move a mesma masa un alvéolo cada vez, sen cambiar nada máis, e mirade xuntos que pasa.',
        ],
      ],
      construye: [
        [
          'Inventa un montaje que se quede quieto con masas distintas a cada lado.',
          'Invent an arrangement that stays still with different masses on each side.',
          'Inventa un muntatge que es quedi quiet amb masses diferents a cada costat.',
          'Inventa unha montaxe que quede quieta con masas distintas a cada lado.',
        ],
        ['¿Por qué una masa pequeña puede ganar a una grande?', 'Why can a small mass beat a big one?', 'Per què una massa petita pot guanyar una de gran?', 'Por que unha masa pequena pode gañarlle a unha grande?'],
      ],
      criterion: [
        'Predice antes de soltar en los tres montajes y explica con «porque» el papel de la distancia.',
        'Predicts before letting go in all three arrangements and explains the role of distance with “because”.',
        'Prediu abans de deixar anar en els tres muntatges i explica amb «perquè» el paper de la distància.',
        'Predí antes de soltar nas tres montaxes e explica con «porque» o papel da distancia.',
      ],
      observation: [
        'Anota si corrige su idea después de ver un resultado inesperado.',
        'Note whether they revise their idea after seeing an unexpected result.',
        'Anota si corregeix la seva idea després de veure un resultat inesperat.',
        'Anota se corrixe a súa idea despois de ver un resultado inesperado.',
      ],
    }),
  ];
}

// ─── S6 · Jardín ─────────────────────────────────────────────────────────────

export function retosS6(cycleSolo: TripartiteCycle): WorldChallengeSpec[] {
  return [
    reto('S6', 1, {
      title: ['¿Dónde está la semilla?', 'Where is the seed?', 'On és la llavor?', 'Onde está a semente?'],
      minutes: 5,
      scale: 'G',
      axes: ['interaction_pragmatics', 'lexicon_semantics'],
      events: ['S6.SIEMBRA'],
      observa: [
        [
          'Esconde la semilla en un alvéolo de la base, delante de la criatura, y tápala con la mano.',
          'Hide the seed in a slot of the base, in front of the child, and cover it with your hand.',
          'Amaga la llavor en un alvèol de la base, davant de la criatura, i tapa-la amb la mà.',
          'Agocha a semente nun alvéolo da base, diante da criatura, e tápaa coa man.',
        ],
        ['¿Dónde está la semilla?', 'Where is the seed?', 'On és la llavor?', 'Onde está a semente?'],
      ],
      experimenta: [
        withSafety([
          'Juego de esconder: tú tapas, la criatura destapa. La semilla no sale de tus dedos. Tú confirmas con el botón cuando la encuentra.',
          'Hiding game: you cover it, the child uncovers it. The seed does not leave your fingers. You confirm with the button when they find it.',
          'Joc d’amagar: tu tapes, la criatura destapa. La llavor no surt dels teus dits. Tu confirmes amb el botó quan la troba.',
          'Xogo de agochar: ti tapas, a criatura destapa. A semente non sae dos teus dedos. Ti confirmas co botón cando a atopa.',
        ]),
        ['¿Aquí?', 'Here?', 'Aquí?', 'Aquí?'],
        [
          'Levanta la mano muy despacio para que la semilla aparezca poco a poco.',
          'Lift your hand very slowly so the seed appears little by little.',
          'Aixeca la mà molt a poc a poc perquè la llavor aparegui de mica en mica.',
          'Levanta a man moi amodo para que a semente apareza pouco a pouco.',
        ],
      ],
      construye: [
        [
          'La criatura tapa el alvéolo con su mano y tú preguntas dónde está.',
          'The child covers the slot with their hand and you ask where it is.',
          'La criatura tapa l’alvèol amb la seva mà i tu preguntes on és.',
          'A criatura tapa o alvéolo coa súa man e ti preguntas onde está.',
        ],
        ['¿Y ahora, dónde se ha ido?', 'And now, where has it gone?', 'I ara, on ha anat?', 'E agora, onde foi?'],
      ],
      criterion: [
        'Busca la semilla escondida o tapa el alvéolo en su turno.',
        'Looks for the hidden seed or covers the slot on their turn.',
        'Busca la llavor amagada o tapa l’alvèol en el seu torn.',
        'Busca a semente agochada ou tapa o alvéolo na súa quenda.',
      ],
      observation: [
        'Anota si sigue el objeto escondido con la mirada.',
        'Note whether they follow the hidden object with their eyes.',
        'Anota si segueix l’objecte amagat amb la mirada.',
        'Anota se segue o obxecto agochado coa mirada.',
      ],
    }),
    reto('S6', 2, {
      title: ['Agua y crece', 'Water and it grows', 'Aigua i creix', 'Auga e medra'],
      minutes: 8,
      scale: 'G',
      axes: ['lexicon_semantics', 'morphosyntax_narrative'],
      events: ['S6.SIEMBRA', 'S6.RIEGO', 'S6.BROTE'],
      observa: [
        [
          'Siembra, haz el gesto de regar y enrosca el tallo. Hazlo despacio, en ese orden.',
          'Sow, make the watering gesture and screw in the stem. Do it slowly, in that order.',
          'Sembra, fes el gest de regar i enrosca la tija. Fes-ho a poc a poc, en aquest ordre.',
          'Sementa, fai o xesto de regar e enrosca o talo. Faino amodo, nesa orde.',
        ],
        ['¿Qué ha pasado?', 'What happened?', 'Què ha passat?', 'Que pasou?'],
      ],
      experimenta: [
        [
          'La criatura repite los tres pasos con tu ayuda: semilla, agua, tallo. Tú confirmas cada paso con el botón.',
          'The child repeats the three steps with your help: seed, water, stem. You confirm each step with the button.',
          'La criatura repeteix els tres passos amb la teva ajuda: llavor, aigua, tija. Tu confirmes cada pas amb el botó.',
          'A criatura repite os tres pasos coa túa axuda: semente, auga, talo. Ti confirmas cada paso co botón.',
        ],
        ['¿Qué necesita la semilla?', 'What does the seed need?', 'Què necessita la llavor?', 'Que precisa a semente?'],
        [
          'Enroscad juntos el tallo, tu mano sobre su muñeca, girando hacia el mismo lado.',
          'Screw in the stem together, your hand on their wrist, turning the same way.',
          'Enrosqueu junts la tija, la teva mà sobre el seu canell, girant cap al mateix costat.',
          'Enroscade xuntos o talo, a túa man sobre o seu pulso, xirando cara ao mesmo lado.',
        ],
      ],
      construye: [
        [
          'Planta dos semillas más y riégalas.',
          'Plant two more seeds and water them.',
          'Planta dues llavors més i rega-les.',
          'Planta dúas sementes máis e régaas.',
        ],
        ['Sin agua, ¿crece?', 'Without water, does it grow?', 'Sense aigua, creix?', 'Sen auga, medra?'],
      ],
      criterion: [
        'Hace los tres pasos en orden, con ayuda, y nombra o señala «agua» o «crece».',
        'Does the three steps in order, with help, and names or points to “water” or “grows”.',
        'Fa els tres passos en ordre, amb ajuda, i anomena o assenyala «aigua» o «creix».',
        'Fai os tres pasos en orde, con axuda, e nomea ou sinala «auga» ou «medra».',
      ],
      observation: [
        'Anota si anticipa el paso siguiente antes de que se lo muestres.',
        'Note whether they anticipate the next step before you show it.',
        'Anota si anticipa el pas següent abans que l’hi mostris.',
        'Anota se anticipa o paso seguinte antes de que llo amoses.',
      ],
    }),
    retoFromCycle('S6', 3, cycleSolo, {
      title: ['El sol gira, la sombra también', 'The sun turns, so does the shadow', 'El sol gira, l’ombra també', 'O sol xira, a sombra tamén'],
      minutes: 12,
      scale: 'G',
      axes: ['lexicon_semantics', 'morphosyntax_narrative'],
      events: ['S6.SIEMBRA', 'S6.RIEGO', 'S6.BROTE', 'S6.SOMBRA_ALINEADA', 'S6.FLORECE'],
      criterion: [
        'Sigue el orden semilla, agua, tallo, flor y señala hacia dónde se va la sombra al girar el sol.',
        'Follows the order seed, water, stem, flower and points to where the shadow goes when the sun turns.',
        'Segueix l’ordre llavor, aigua, tija, flor i assenyala cap on va l’ombra quan gira el sol.',
        'Segue a orde semente, auga, talo, flor e sinala cara a onde vai a sombra ao xirar o sol.',
      ],
      observation: [
        'Anota si espera ver la sombra del mismo lado que el sol.',
        'Note whether they expect the shadow on the same side as the sun.',
        'Anota si espera veure l’ombra al mateix costat que el sol.',
        'Anota se espera ver a sombra do mesmo lado ca o sol.',
      ],
    }),
    reto('S6', 5, {
      title: ['El diario de la planta', 'The plant’s diary', 'El diari de la planta', 'O diario da planta'],
      minutes: 15,
      scale: 'G',
      axes: ['morphosyntax_narrative', 'graphomotor'],
      events: ['S6.SOMBRA_ALINEADA', 'S6.FLORECE', 'S6.NOCHE'],
      observa: [
        [
          'Con la planta ya montada, gira el sol de la mañana a la noche sin hablar. Espera cinco segundos.',
          'With the plant already built, turn the sun from morning to night without talking. Wait five seconds.',
          'Amb la planta ja muntada, gira el sol del matí a la nit sense parlar. Espera cinc segons.',
          'Coa planta xa montada, xira o sol da mañá á noite sen falar. Agarda cinco segundos.',
        ],
        ['¿Qué le ha pasado a la planta en un día?', 'What happened to the plant in one day?', 'Què li ha passat a la planta en un dia?', 'Que lle pasou á planta nun día?'],
      ],
      experimenta: [
        [
          'La criatura cuenta el día de la planta mientras gira el sol: por la mañana, al mediodía, por la noche. Antes de cada giro dice dónde caerá la sombra. Tú confirmas cada momento con el botón.',
          'The child tells the plant’s day while turning the sun: in the morning, at noon, at night. Before each turn they say where the shadow will fall. You confirm each moment with the button.',
          'La criatura explica el dia de la planta mentre gira el sol: al matí, al migdia, a la nit. Abans de cada gir diu on caurà l’ombra. Tu confirmes cada moment amb el botó.',
          'A criatura conta o día da planta mentres xira o sol: pola mañá, ao mediodía, pola noite. Antes de cada xiro di onde caerá a sombra. Ti confirmas cada momento co botón.',
        ],
        ['¿Y por la noche, dónde está la sombra?', 'And at night, where is the shadow?', 'I a la nit, on és l’ombra?', 'E pola noite, onde está a sombra?'],
        [
          'Pon una ficha en la mesa donde la criatura cree que caerá la sombra, y gira el sol para comprobarlo.',
          'Put a token on the table where the child thinks the shadow will fall, and turn the sun to check.',
          'Posa una fitxa a la taula on la criatura creu que caurà l’ombra, i gira el sol per comprovar-ho.',
          'Pon unha ficha na mesa onde a criatura cre que caerá a sombra, e xira o sol para comprobalo.',
        ],
      ],
      construye: [
        [
          'Dibuja tres viñetas del día de la planta y guarda las piezas en el orden inverso.',
          'Draw three panels of the plant’s day and put the pieces away in reverse order.',
          'Dibuixa tres vinyetes del dia de la planta i desa les peces en l’ordre invers.',
          'Debuxa tres viñetas do día da planta e garda as pezas na orde inversa.',
        ],
        ['¿Qué pasaría si la planta estuviera siempre a la sombra?', 'What would happen if the plant were always in the shade?', 'Què passaria si la planta fos sempre a l’ombra?', 'Que pasaría se a planta estivese sempre á sombra?'],
      ],
      criterion: [
        'Predice el lado de la sombra antes de girar y cuenta el día de la planta con tres pasos en orden.',
        'Predicts the side of the shadow before turning and tells the plant’s day in three steps in order.',
        'Prediu el costat de l’ombra abans de girar i explica el dia de la planta amb tres passos en ordre.',
        'Predí o lado da sombra antes de xirar e conta o día da planta con tres pasos en orde.',
      ],
      observation: [
        'Anota qué conectores usa: «primero», «después», «al final», «porque».',
        'Note which connectors they use: “first”, “next”, “at the end”, “because”.',
        'Anota quins connectors fa servir: «primer», «després», «al final», «perquè».',
        'Anota que conectores usa: «primeiro», «despois», «ao final», «porque».',
      ],
    }),
  ];
}

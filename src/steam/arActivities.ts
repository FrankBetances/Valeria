// Módulo de RA rehecho (docs/PENDIENTE-REFACTORIZACION-AR.md, 8/11/2026).
// Actividades que se juegan con el botón del adulto mientras no hay detector
// de piezas: L02–L05 (Solo Lúa) y S8–S11 (las cuatro maquetas de oficios).
// L01 y L07 abren la cámara y viven en luaSolo.ts; S0–S6 son los 35 retos de
// worlds/. L06 (VRA) queda fuera hasta que Frank decida. Nada se locuta.
import type { AdultText, LuaSemanticExpression, TripartiteCycle } from './types';
import type { LuaMoodCode } from './engine/LuaLink';
import { a } from './worlds/retos';

export type ArTapActivityId = 'L02' | 'L03' | 'L04' | 'L05' | 'S8' | 'S9' | 'S10' | 'S11';

export interface ArTapEvent {
  readonly id: string;
  readonly title: AdultText;
  readonly expression: LuaSemanticExpression;
  /** Cara de compañía (MOOD) en lugar de la expresión: antojo, ronroneo, comer. */
  readonly mood?: LuaMoodCode;
}

export interface ArTapActivity {
  readonly id: ArTapActivityId;
  readonly group: 'LUA' | 'SET';
  readonly title: AdultText;
  readonly summary: AdultText;
  readonly ages: string;
  readonly cycle: TripartiteCycle;
  readonly events: readonly ArTapEvent[];
}

const cycle = (
  trigger: AdultText, question: AdultText, step: AdultText,
  hint1: AdultText, hint2: AdultText, make: AdultText, transfer: AdultText,
): TripartiteCycle => ({
  observa: { phenomenonTrigger: trigger, socraticQuestion: question, mandatorySilenceSec: 5 },
  experimenta: { adultStepByStep: step, hints: { level1Socratic: hint1, level2PhysicalModel: hint2 } },
  construye: { tangibleMakeChallenge: make, transferQuestion: transfer },
});

export const AR_TAP_ACTIVITIES: readonly ArTapActivity[] = [
  {
    id: 'L02', group: 'LUA', ages: '1–6',
    title: a(['¿Hacia dónde mira Lúa?', 'Where is Lúa looking?', 'Cap a on mira la Lúa?', 'Cara a onde mira Lúa?']),
    summary: a(['Girar a Lúa sobre la mesa y descubrir qué tiene delante.', 'Turn Lúa on the table and find what is in front of her.', 'Girar la Lúa sobre la taula i descobrir què té davant.', 'Xirar a Lúa sobre a mesa e descubrir que ten diante.']),
    cycle: cycle(
      a(['Gira a Lúa un cuarto de vuelta, despacio, y espera en silencio.', 'Turn Lúa a quarter turn, slowly, and wait in silence.', 'Gira la Lúa un quart de volta, a poc a poc, i espera en silenci.', 'Xira a Lúa un cuarto de volta, amodo, e agarda en silencio.']),
      a(['¿Adónde apunta ahora la nariz de Lúa?', 'Where is Lúa’s nose pointing now?', 'Cap a on apunta ara el nas de la Lúa?', 'Cara a onde apunta agora o nariz de Lúa?']),
      a(['Pon tres cosas alrededor de Lúa y pide al niño que la gire hacia cada una.', 'Put three things around Lúa and ask the child to turn her towards each one.', 'Posa tres coses al voltant de la Lúa i demana al nen que la giri cap a cadascuna.', 'Pon tres cousas arredor de Lúa e pídelle ao neno que a xire cara a cada unha.']),
      a(['Si la cola mira hacia ti, ¿hacia dónde miran sus ojos?', 'If her tail points at you, where are her eyes looking?', 'Si la cua mira cap a tu, cap a on miren els seus ulls?', 'Se o rabo mira cara a ti, cara a onde miran os seus ollos?']),
      a(['Ponte detrás del niño y gira a Lúa con él: su izquierda es la de Lúa.', 'Sit behind the child and turn Lúa together: her left is Lúa’s left.', 'Posa’t darrere del nen i gireu la Lúa junts: la seva esquerra és la de la Lúa.', 'Ponte detrás do neno e xirade a Lúa xuntos: a súa esquerda é a de Lúa.']),
      a(['Construye con bloques un camino y deja a Lúa mirando hacia el final.', 'Build a path with blocks and leave Lúa facing its end.', 'Construeix un camí amb blocs i deixa la Lúa mirant cap al final.', 'Constrúe un camiño con bloques e deixa a Lúa mirando cara ao final.']),
      a(['¿Hacia dónde miras tú cuando quieres ir a la puerta?', 'Which way do you face when you want to go to the door?', 'Cap a on mires tu quan vols anar a la porta?', 'Cara a onde miras ti cando queres ir á porta?']),
    ),
    events: [
      { id: 'L02.GIRA', title: a(['Ha girado a Lúa', 'Turned Lúa', 'Ha girat la Lúa', 'Xirou a Lúa']), expression: 'curiosa' },
      { id: 'L02.ALINEA', title: a(['Lúa mira a la cosa pedida', 'Lúa faces the thing asked', 'La Lúa mira la cosa demanada', 'Lúa mira á cousa pedida']), expression: 'alegre' },
      { id: 'L02.FIN', title: a(['Las tres, conseguidas', 'All three done', 'Totes tres, aconseguides', 'As tres, conseguidas']), expression: 'celebra_corta' },
    ],
  },
  {
    id: 'L03', group: 'LUA', ages: '1–4',
    title: a(['La merienda del pez dorado', 'The goldfish snack', 'El berenar del peix daurat', 'A merenda do peixe dourado']),
    summary: a(['Acercar una pieza a la boca de Lúa, despacio, para darle de comer.', 'Bring a piece slowly to Lúa’s mouth to feed her.', 'Acostar una peça a la boca de la Lúa, a poc a poc, per donar-li menjar.', 'Achegar unha peza á boca de Lúa, amodo, para darlle de comer.']),
    cycle: cycle(
      a(['Lúa tiene antojo. Acerca un bloque por delante, muy despacio.', 'Lúa is craving a snack. Bring a block slowly up to her front.', 'La Lúa té ganes de menjar. Acosta un bloc per davant, molt a poc a poc.', 'Lúa ten antollo. Achega un bloque por diante, moi amodo.']),
      a(['¿Qué ha hecho Lúa cuando el bloque llegó a su boca?', 'What did Lúa do when the block reached her mouth?', 'Què ha fet la Lúa quan el bloc ha arribat a la seva boca?', 'Que fixo Lúa cando o bloque chegou á súa boca?']),
      a(['El niño entrega piezas desde cerca, desde lejos y por delante, sin golpear.', 'The child hands over pieces from close, from far and from the front, without bumping.', 'El nen lliura peces des de prop, des de lluny i per davant, sense cops.', 'O neno entrega pezas de preto, de lonxe e por diante, sen golpear.']),
      a(['¿La boca de Lúa está arriba en las orejas o delante en la cara?', 'Is Lúa’s mouth up by her ears or at the front of her face?', 'La boca de la Lúa és dalt a les orelles o davant a la cara?', 'A boca de Lúa está arriba nas orellas ou diante na cara?']),
      a(['Guía el codo del niño en una entrega lenta.', 'Guide the child’s elbow through a slow hand-over.', 'Guia el colze del nen en un lliurament lent.', 'Guía o cóbado do neno nunha entrega lenta.']),
      a(['Monta con cuatro bloques una bandeja y ordena la merienda por colores.', 'Build a tray with four blocks and sort the snack by colour.', 'Munta amb quatre blocs una safata i ordena el berenar per colors.', 'Monta con catro bloques unha bandexa e ordena a merenda por cores.']),
      a(['¿Cómo le das algo a alguien sin que se caiga?', 'How do you hand something to someone without dropping it?', 'Com dones una cosa a algú sense que caigui?', 'Como lle dás algo a alguén sen que caia?']),
    ),
    events: [
      { id: 'L03.ANTOJO', title: a(['Lúa espera la merienda', 'Lúa waits for her snack', 'La Lúa espera el berenar', 'Lúa agarda a merenda']), expression: 'espera_serena', mood: 1 },
      { id: 'L03.ENTREGA', title: a(['La pieza llega a su boca', 'The piece reaches her mouth', 'La peça arriba a la boca', 'A peza chega á súa boca']), expression: 'alegre', mood: 3 },
      { id: 'L03.GRACIAS', title: a(['Merienda terminada', 'Snack finished', 'Berenar acabat', 'Merenda rematada']), expression: 'gratitud' },
    ],
  },
  {
    id: 'L04', group: 'LUA', ages: '2–6',
    title: a(['El despertar sereno de Lúa', 'Lúa’s calm wake-up', 'El despertar serè de la Lúa', 'O espertar sereno de Lúa']),
    summary: a(['Quedarse tranquilo mirando a Lúa hasta que se despierta.', 'Stay calm, looking at Lúa, until she wakes up.', 'Quedar-se tranquil mirant la Lúa fins que es desperta.', 'Quedar tranquilo mirando a Lúa ata que esperta.']),
    cycle: cycle(
      a(['Lúa duerme. Quédate muy quieto mirándola y espera.', 'Lúa is asleep. Stay very still looking at her and wait.', 'La Lúa dorm. Queda’t molt quiet mirant-la i espera.', 'Lúa dorme. Quédate moi quieto mirándoa e agarda.']),
      a(['¿Qué hacemos con el cuerpo para despertarla sin asustarla?', 'What do we do with our body to wake her without scaring her?', 'Què fem amb el cos per despertar-la sense espantar-la?', 'Que facemos co corpo para espertala sen asustala?']),
      a(['El niño mira a Lúa, quieto, entre uno y tres segundos. Tú confirmas cuando lo logra.', 'The child looks at Lúa, still, for one to three seconds. You confirm when they manage it.', 'El nen mira la Lúa, quiet, entre un i tres segons. Tu ho confirmes quan ho aconsegueix.', 'O neno mira a Lúa, quieto, entre un e tres segundos. Ti confírmalo cando o logra.']),
      a(['Respira despacito, como un gato dormido…', 'Breathe slowly, like a sleeping cat…', 'Respira a poc a poc, com un gat adormit…', 'Respira amodiño, coma un gato durmido…']),
      a(['Apoya con suavidad las manos en sus hombros mientras miráis juntos a Lúa.', 'Rest your hands gently on their shoulders while you both look at Lúa.', 'Recolza suaument les mans a les seves espatlles mentre mireu junts la Lúa.', 'Apoia suavemente as mans nos seus ombros mentres mirades xuntos a Lúa.']),
      a(['Con dos baldosas lisas, haced una cama para acostar a Lúa al acabar.', 'With two smooth tiles, make a bed to put Lúa to sleep at the end.', 'Amb dues rajoles llises, feu un llit per posar a dormir la Lúa en acabar.', 'Con dúas baldosas lisas, facede unha cama para deitar a Lúa ao rematar.']),
      a(['¿Cómo te gusta que te despierten por la mañana?', 'How do you like to be woken up in the morning?', 'Com t’agrada que et despertin al matí?', 'Como che gusta que te esperten pola mañá?']),
    ),
    events: [
      { id: 'L04.DORMIDA', title: a(['Lúa duerme', 'Lúa is asleep', 'La Lúa dorm', 'Lúa dorme']), expression: 'descanso_lejos' },
      { id: 'L04.CALMA', title: a(['Mirada tranquila sostenida', 'Calm look held', 'Mirada tranquil·la sostinguda', 'Mirada tranquila mantida']), expression: 'alivio' },
      { id: 'L04.DESPIERTA', title: a(['Lúa se despierta', 'Lúa wakes up', 'La Lúa es desperta', 'Lúa esperta']), expression: 'esperanza' },
    ],
  },
  {
    id: 'L05', group: 'LUA', ages: '3–6',
    title: a(['La caricia y el ronroneo', 'The stroke and the purr', 'La carícia i el ronc', 'A aloumiño e o ronroneo']),
    summary: a(['Acariciar a Lúa con mano lenta, como una pluma, para que ronronee.', 'Stroke Lúa with a slow hand, like a feather, so she purrs.', 'Acariciar la Lúa amb mà lenta, com una ploma, perquè faci el ronc.', 'Aloumiñar a Lúa con man lenta, coma unha pluma, para que ronronee.']),
    cycle: cycle(
      a(['Acaricia despacio el lomo de Lúa y espera en silencio.', 'Stroke Lúa’s back slowly and wait in silence.', 'Acaricia a poc a poc l’esquena de la Lúa i espera en silenci.', 'Aloumiña amodo o lombo de Lúa e agarda en silencio.']),
      a(['¿Cómo se siente en los dedos cuando la acariciamos muy despacito?', 'How does it feel in our fingers when we stroke her very slowly?', 'Com se sent als dits quan l’acariciem molt a poc a poc?', 'Como se sente nos dedos cando a aloumiñamos moi amodiño?']),
      a(['El niño prueba «mano rápida como lluvia» y «mano lenta como pluma». Confirma la lenta.', 'The child tries a “fast rain hand” and a “slow feather hand”. Confirm the slow one.', 'El nen prova «mà ràpida com la pluja» i «mà lenta com una ploma». Confirma la lenta.', 'O neno proba «man rápida coma a chuvia» e «man lenta coma unha pluma». Confirma a lenta.']),
      a(['¿Con cuál de las dos manos empieza Lúa a ronronear?', 'Which of the two hands makes Lúa start purring?', 'Amb quina de les dues mans comença la Lúa a fer el ronc?', 'Con cal das dúas mans empeza Lúa a ronronear?']),
      a(['Acaricia primero el dorso de su mano a ese ritmo lento.', 'First stroke the back of their hand at that slow pace.', 'Acaricia primer el dors de la seva mà a aquest ritme lent.', 'Aloumiña primeiro o dorso da súa man a ese ritmo lento.']),
      a(['Monta con bloques un rincón de calma junto a Lúa.', 'Build a calm corner next to Lúa with blocks.', 'Munta amb blocs un racó de calma al costat de la Lúa.', 'Monta con bloques un recuncho de calma xunto a Lúa.']),
      a(['¿Qué te ayuda a ti a estar tranquilo?', 'What helps you feel calm?', 'Què t’ajuda a tu a estar tranquil?', 'Que che axuda a ti a estar tranquilo?']),
    ),
    events: [
      { id: 'L05.MANO_LENTA', title: a(['Caricia lenta', 'Slow stroke', 'Carícia lenta', 'Aloumiño lento']), expression: 'ternura', mood: 2 },
      { id: 'L05.MANO_RAPIDA', title: a(['Caricia rápida (sin reproche)', 'Fast stroke (no telling off)', 'Carícia ràpida (sense retret)', 'Aloumiño rápido (sen reproche)']), expression: 'neutra' },
      { id: 'L05.RINCON', title: a(['Rincón de calma montado', 'Calm corner built', 'Racó de calma muntat', 'Recuncho de calma montado']), expression: 'celebra_corta' },
    ],
  },
  {
    id: 'S8', group: 'SET', ages: '3–6',
    title: a(['Policía: el cruce de los turnos', 'Police: the turn-taking crossing', 'Policia: el creuament dels torns', 'Policía: o cruce das quendas']),
    summary: a(['Con la maqueta de la estación y las baldosas del Set 1, esperar turno y cruzar.', 'With the station model and Set 1 tiles, wait your turn and cross.', 'Amb la maqueta de l’estació i les rajoles del Set 1, esperar torn i creuar.', 'Coa maqueta da estación e as baldosas do Set 1, agardar quenda e cruzar.']),
    cycle: cycle(
      a(['La patrulla se para ante la barrera. Un muñeco cruza por delante.', 'The patrol car stops at the barrier. A figure crosses in front.', 'La patrulla s’atura davant la barrera. Un ninot creua per davant.', 'A patrulla párase diante da barreira. Un boneco cruza por diante.']),
      a(['¿Por qué ha esperado la patrulla?', 'Why did the patrol car wait?', 'Per què ha esperat la patrulla?', 'Por que agardou a patrulla?']),
      a(['Un niño baja y sube la barrera; otra mueve el coche y respeta el turno.', 'One child lowers and raises the barrier; another moves the car and waits their turn.', 'Un nen baixa i puja la barrera; una altra mou el cotxe i respecta el torn.', 'Un neno baixa e sube a barreira; outra move o coche e respecta a quenda.']),
      a(['¿Qué pasaría si pasan los dos a la vez?', 'What would happen if both went at the same time?', 'Què passaria si passen tots dos alhora?', 'Que pasaría se pasan os dous á vez?']),
      a(['Haz tú de guía con la mano: palma arriba, para; mano que señala, pasa.', 'Be the guide with your hand: palm up means stop; pointing means go.', 'Fes tu de guia amb la mà: palmell amunt, atura’t; mà que assenyala, passa.', 'Fai ti de guía coa man: palma arriba, para; man que sinala, pasa.']),
      a(['Une las baldosas rectas y la T del Set 1 a la estación: una avenida con cruce.', 'Join the straight tiles and the T from Set 1 to the station: an avenue with a crossing.', 'Uneix les rajoles rectes i la T del Set 1 a l’estació: una avinguda amb creuament.', 'Une as baldosas rectas e a T do Set 1 á estación: unha avenida con cruce.']),
      a(['¿Dónde esperas tú tu turno?', 'Where do you wait for your turn?', 'On esperes tu el teu torn?', 'Onde agardas ti a túa quenda?']),
    ),
    events: [
      { id: 'S8.BARRERA_BAJA', title: a(['Barrera bajada', 'Barrier down', 'Barrera baixada', 'Barreira baixada']), expression: 'atenta' },
      { id: 'S8.PEATON_CRUZA', title: a(['El peatón cruza', 'The pedestrian crosses', 'El vianant creua', 'O peón cruza']), expression: 'calma' },
      { id: 'S8.BARRERA_SUBE', title: a(['Barrera arriba, el coche pasa', 'Barrier up, the car goes', 'Barrera amunt, el cotxe passa', 'Barreira arriba, o coche pasa']), expression: 'animo' },
      { id: 'S8.TURNO_COMPLETO', title: a(['Turnos respetados', 'Turns respected', 'Torns respectats', 'Quendas respectadas']), expression: 'celebra_corta' },
    ],
  },
  {
    id: 'S9', group: 'SET', ages: '3–6',
    title: a(['Bomberos: salida por la rampa', 'Fire station: down the ramp', 'Bombers: sortida per la rampa', 'Bombeiros: saída pola rampla']),
    summary: a(['Con la maqueta del parque y una rampa del Set 3, salir rápido o despacio.', 'With the fire station model and a Set 3 ramp, leave fast or slowly.', 'Amb la maqueta del parc i una rampa del Set 3, sortir de pressa o a poc a poc.', 'Coa maqueta do parque e unha rampla do Set 3, saír rápido ou amodo.']),
    cycle: cycle(
      a(['Pon la rampa del Set 3 en la puerta del parque y deja bajar un camión de juguete.', 'Put the Set 3 ramp at the station door and let a toy truck roll down.', 'Posa la rampa del Set 3 a la porta del parc i deixa baixar un camió de joguina.', 'Pon a rampla do Set 3 na porta do parque e deixa baixar un camión de xoguete.']),
      a(['¿Qué ha hecho bajar al camión sin empujarlo?', 'What made the truck go down without pushing it?', 'Què ha fet baixar el camió sense empènyer-lo?', 'Que fixo baixar o camión sen empuxalo?']),
      a(['El niño sube la rampa con pilares altos y bajos y compara las salidas.', 'The child raises the ramp with tall and short pillars and compares the runs.', 'El nen puja la rampa amb pilars alts i baixos i compara les sortides.', 'O neno sube a rampla con piares altos e baixos e compara as saídas.']),
      a(['¿Llegará antes con el pilar alto o con el bajo?', 'Will it arrive sooner with the tall or the short pillar?', 'Arribarà abans amb el pilar alt o amb el baix?', 'Chegará antes co piar alto ou co baixo?']),
      a(['Suelta tú el camión desde las dos alturas, una al lado de la otra.', 'Release the truck yourself from both heights, side by side.', 'Deixa anar tu el camió des de les dues altures, una al costat de l’altra.', 'Solta ti o camión desde as dúas alturas, unha ao lado da outra.']),
      a(['Coloca tres dianas de papel y apunta hacia ellas desde la torre.', 'Place three paper targets and aim at them from the tower.', 'Col·loca tres dianes de paper i apunta-hi des de la torre.', 'Coloca tres dianas de papel e apunta cara a elas desde a torre.']),
      a(['¿Dónde has visto una cuesta que hace ir más rápido?', 'Where have you seen a slope that makes things go faster?', 'On has vist una pujada que fa anar més de pressa?', 'Onde viches unha costa que fai ir máis rápido?']),
    ),
    events: [
      { id: 'S9.AVISO', title: a(['¡Aviso de salida!', 'Call-out!', 'Avís de sortida!', 'Aviso de saída!']), expression: 'atenta' },
      { id: 'S9.RAMPA', title: a(['El camión baja por la rampa', 'The truck rolls down the ramp', 'El camió baixa per la rampa', 'O camión baixa pola rampla']), expression: 'animo' },
      { id: 'S9.DIANA', title: a(['Apunta a la diana', 'Aims at the target', 'Apunta a la diana', 'Apunta á diana']), expression: 'alegre' },
      { id: 'S9.MISION', title: a(['Misión cumplida', 'Mission complete', 'Missió complerta', 'Misión cumprida']), expression: 'celebra_exito' },
    ],
  },
  {
    id: 'S10', group: 'SET', ages: '3–6',
    title: a(['Hospital: la revisión tranquila', 'Hospital: the calm check-up', 'Hospital: la revisió tranquil·la', 'Hospital: a revisión tranquila']),
    summary: a(['Con la maqueta del hospital, cuidar a Lúa en una revisión sin miedo.', 'With the hospital model, look after Lúa in a check-up without fear.', 'Amb la maqueta de l’hospital, cuidar la Lúa en una revisió sense por.', 'Coa maqueta do hospital, coidar a Lúa nunha revisión sen medo.']),
    cycle: cycle(
      a(['Acerca a Lúa a la entrada del hospital y respira tú despacio.', 'Bring Lúa to the hospital door and breathe slowly yourself.', 'Acosta la Lúa a l’entrada de l’hospital i respira tu a poc a poc.', 'Achega a Lúa á entrada do hospital e respira ti amodo.']),
      a(['¿Cómo está Lúa? ¿Qué la ayudaría a estar tranquila?', 'How is Lúa feeling? What would help her stay calm?', 'Com està la Lúa? Què l’ajudaria a estar tranquil·la?', 'Como está Lúa? Que a axudaría a estar tranquila?']),
      a(['El niño saluda, escucha el latido de Lúa, la deja descansar y le da el alta.', 'The child says hello, listens to Lúa’s heartbeat, lets her rest and sends her home.', 'El nen saluda, escolta el batec de la Lúa, la deixa descansar i li dona l’alta.', 'O neno saúda, escoita o latexo de Lúa, déixaa descansar e dálle a alta.']),
      a(['¿Qué podemos decirle a Lúa para que no tenga miedo?', 'What can we say to Lúa so she isn’t scared?', 'Què li podem dir a la Lúa perquè no tingui por?', 'Que lle podemos dicir a Lúa para que non teña medo?']),
      a(['Respirad juntos: tres segundos para coger aire, tres para soltarlo.', 'Breathe together: three seconds in, three seconds out.', 'Respireu junts: tres segons per agafar aire, tres per deixar-lo anar.', 'Respirade xuntos: tres segundos para coller aire, tres para soltalo.']),
      a(['Une el camino del Set 1 a la entrada con una rampa suave, sin escalones.', 'Join the Set 1 path to the entrance with a gentle ramp, no steps.', 'Uneix el camí del Set 1 a l’entrada amb una rampa suau, sense graons.', 'Une o camiño do Set 1 á entrada cunha rampla suave, sen chanzos.']),
      a(['¿Qué te ayuda a ti cuando vas al médico?', 'What helps you when you go to the doctor?', 'Què t’ajuda a tu quan vas al metge?', 'Que che axuda a ti cando vas ao médico?']),
    ),
    events: [
      { id: 'S10.LLEGADA', title: a(['Llega al hospital', 'Arrives at the hospital', 'Arriba a l’hospital', 'Chega ao hospital']), expression: 'atenta' },
      { id: 'S10.CAMILLA', title: a(['Lúa descansa en la camilla', 'Lúa rests on the bed', 'La Lúa descansa a la llitera', 'Lúa descansa na padiola']), expression: 'alivio' },
      { id: 'S10.LATIDO', title: a(['Latido tranquilo', 'Calm heartbeat', 'Batec tranquil', 'Latexo tranquilo']), expression: 'ternura', mood: 2 },
      { id: 'S10.ALTA', title: a(['Alta feliz', 'Happy to go home', 'Alta feliç', 'Alta feliz']), expression: 'gratitud' },
    ],
  },
  {
    id: 'S11', group: 'SET', ages: '3–6',
    title: a(['Trenes: el paso a nivel', 'Trains: the level crossing', 'Trens: el pas a nivell', 'Trens: o paso a nivel']),
    summary: a(['Con la maqueta de la estación de tren, acoplar, bajar la barrera y parar en el andén.', 'With the train station model, couple up, lower the barrier and stop at the platform.', 'Amb la maqueta de l’estació de tren, enganxar, baixar la barrera i aturar-se a l’andana.', 'Coa maqueta da estación de tren, enganchar, baixar a barreira e parar no andén.']),
    cycle: cycle(
      a(['Empuja una locomotora sola y luego con un vagón cargado con una masa del Set 5.', 'Push an engine on its own and then with a wagon loaded with a Set 5 weight.', 'Empeny una locomotora sola i després amb un vagó carregat amb una massa del Set 5.', 'Empurra unha locomotora soa e logo cun vagón cargado cunha masa do Set 5.']),
      a(['¿Cuándo cuesta más empujar? ¿Por qué?', 'When is it harder to push? Why?', 'Quan costa més empènyer? Per què?', 'Cando custa máis empurrar? Por que?']),
      a(['El niño acopla el vagón, baja la barrera, avanza y frena justo en el andén.', 'The child couples the wagon, lowers the barrier, moves on and stops right at the platform.', 'El nen enganxa el vagó, baixa la barrera, avança i frena just a l’andana.', 'O neno engancha o vagón, baixa a barreira, avanza e frea xusto no andén.']),
      a(['¿Qué va primero: bajar la barrera o pasar el tren?', 'What comes first: lowering the barrier or the train going by?', 'Què va primer: baixar la barrera o passar el tren?', 'Que vai primeiro: baixar a barreira ou pasar o tren?']),
      a(['Di tú los pasos en voz alta mientras él mueve el tren.', 'Say the steps out loud while they move the train.', 'Digues tu els passos en veu alta mentre ell mou el tren.', 'Di ti os pasos en voz alta mentres el move o tren.']),
      a(['Pon el puente del Set 5 en mitad de la vía para cruzar un río imaginario.', 'Put the Set 5 bridge in the middle of the track to cross an imaginary river.', 'Posa el pont del Set 5 al mig de la via per creuar un riu imaginari.', 'Pon a ponte do Set 5 no medio da vía para cruzar un río imaxinario.']),
      a(['¿Qué haces tú antes de cruzar una calle?', 'What do you do before crossing a street?', 'Què fas tu abans de creuar un carrer?', 'Que fas ti antes de cruzar unha rúa?']),
    ),
    events: [
      { id: 'S11.ACOPLADO', title: a(['Vagón acoplado', 'Wagon coupled', 'Vagó enganxat', 'Vagón enganchado']), expression: 'impulso' },
      { id: 'S11.PASO_SEGURO', title: a(['Barrera bajada antes del tren', 'Barrier down before the train', 'Barrera baixada abans del tren', 'Barreira baixada antes do tren']), expression: 'atenta' },
      { id: 'S11.EN_MARCHA', title: a(['El tren avanza', 'The train moves on', 'El tren avança', 'O tren avanza']), expression: 'diversion' },
      { id: 'S11.ANDEN', title: a(['Parada justa en el andén', 'Stops right at the platform', 'Parada justa a l’andana', 'Parada xusta no andén']), expression: 'celebra_nivel' },
    ],
  },
];

export function arTapActivity(id: string): ArTapActivity | undefined {
  return AR_TAP_ACTIVITIES.find((x) => x.id === id);
}

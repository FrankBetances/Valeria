// Cápsulas de mediación STEAM (plan §3 Academy y §4 R6): STEAM-S0 a STEAM-S6.
// Las lee la persona adulta, en es, en, ca y gl. La criatura no completa el quiz.
import type { AcademyCapsule } from './academyTypes';
import type { SteamWorldId } from '../steam/types';
import type { UiLang } from '../valeriaUiLang';

interface Copy {
  title: string;
  summary: string;
  h1: string;
  b1: string;
  h2: string;
  b2: string;
  q: string;
  wrong: string;
  right: string;
  other: string;
  why: string;
}

function pack(es: Copy, en: Copy, ca: Copy, gl: Copy): Record<UiLang, Copy> {
  return { es, en, ca, gl };
}

function build(id: string, icon: string, copy: Record<UiLang, Copy>): Record<UiLang, AcademyCapsule> {
  const out = {} as Record<UiLang, AcademyCapsule>;
  for (const lang of ['es', 'en', 'ca', 'gl'] as const) {
    const row = copy[lang];
    out[lang] = {
      id,
      domain: 'lenguaje',
      track: 'mediada',
      icon,
      title: row.title,
      summary: row.summary,
      minutes: 2,
      xp: 20,
      slides: [
        { heading: row.h1, body: row.b1 },
        { heading: row.h2, body: row.b2 },
      ],
      quiz: [{
        prompt: row.q,
        options: [row.wrong, row.right, row.other],
        answer: 1,
        rationale: row.why,
      }],
    };
  }
  return out;
}

const S0 = pack(
  {
    title: 'Cómo mediar el taller de encajes',
    summary: 'El zócalo y las placas los mueve la persona adulta. La criatura encaja, señala o mira.',
    h1: 'Una sola forma entra',
    b1: 'La llave entra si mira al frente. Si mira atrás, no entra. El primer intento puede ir en silencio.',
    h2: 'La persona adulta acerca la pieza',
    b2: 'Acerca el zócalo y guarda las placas al terminar. La criatura gira la llave o mira el hueco.',
    q: '¿Quién coloca el zócalo en la mesa?',
    wrong: 'Se empieza por la última placa',
    right: 'La persona adulta',
    other: 'Se deja el orden al azar',
    why: 'Las piezas de mesa las coloca y las guarda la persona adulta.',
  },
  {
    title: 'How to mediate the fit workshop',
    summary: 'The adult moves the socket and the plates. The child fits, points or looks.',
    h1: 'Only one shape fits',
    b1: 'The key fits when it faces forward. Facing back, it does not fit. The first try can stay silent.',
    h2: 'The adult brings the piece',
    b2: 'Bring the socket over and put the plates away at the end. The child turns the key or looks at the slot.',
    q: 'Who places the socket on the table?',
    wrong: 'Start with the last plate',
    right: 'The adult',
    other: 'Leave the order to chance',
    why: 'The adult places the table pieces and puts them away.',
  },
  {
    title: 'Com mediar el taller d\'encaixos',
    summary: 'El sòcol i les plaques els mou la persona adulta. La criatura encaixa, assenyala o mira.',
    h1: 'Només una forma entra',
    b1: 'La clau entra si mira endavant. Si mira endarrere, no entra. El primer intent pot anar en silenci.',
    h2: 'La persona adulta acosta la peça',
    b2: 'Acosta el sòcol i desa les plaques en acabar. La criatura gira la clau o mira el buit.',
    q: 'Qui posa el sòcol a la taula?',
    wrong: 'Es comença per l\'última placa',
    right: 'La persona adulta',
    other: 'Es deixa l\'ordre a l\'atzar',
    why: 'Les peces de taula les posa i les desa la persona adulta.',
  },
  {
    title: 'Como mediar o taller de encaixes',
    summary: 'O zócolo e as placas móveos a persoa adulta. A criatura encaixa, sinala ou mira.',
    h1: 'Só unha forma entra',
    b1: 'A chave entra se mira á fronte. Se mira atrás, non entra. O primeiro intento pode ir en silencio.',
    h2: 'A persoa adulta achega a peza',
    b2: 'Achega o zócolo e garda as placas ao acabar. A criatura xira a chave ou mira o oco.',
    q: 'Quen coloca o zócolo na mesa?',
    wrong: 'Empezase pola última placa',
    right: 'A persoa adulta',
    other: 'Déixase a orde ao chou',
    why: 'As pezas de mesa colócaas e gárdaas a persoa adulta.',
  },
);

const S1 = pack(
  {
    title: 'Cómo mediar el camino de baldosas',
    summary: 'El camino vale si las baldosas se tocan y cada giro es recto o de un cuarto de vuelta.',
    h1: 'El camino no se corta',
    b1: 'Si dos baldosas no se tocan, el camino está cortado. Espera en silencio a que se vea el hueco.',
    h2: 'El giro es de un cuarto',
    b2: 'Un giro vale si es recto o de un cuarto de vuelta. Señala el hueco y espera. No adelantes la pieza.',
    q: '¿Qué camino está bien?',
    wrong: 'Uno con un hueco en medio',
    right: 'Uno continuo, con giros rectos o de un cuarto de vuelta',
    other: 'Cualquiera, si se habla antes de mirar',
    why: 'El fenómeno es la continuidad. La persona adulta no adelanta la pieza.',
  },
  {
    title: 'How to mediate the tile path',
    summary: 'The path works when the tiles touch and each turn is straight or a quarter turn.',
    h1: 'The path does not break',
    b1: 'If two tiles do not touch, the path is broken. Wait in silence until the gap can be seen.',
    h2: 'The turn is a quarter turn',
    b2: 'A turn counts if it is straight or a quarter turn. Point at the gap and wait. Do not move the piece ahead.',
    q: 'Which path is right?',
    wrong: 'One with a gap in the middle',
    right: 'A continuous one, with straight turns or quarter turns',
    other: 'Any path, if someone speaks before looking',
    why: 'The phenomenon is continuity. The adult does not move the piece ahead.',
  },
  {
    title: 'Com mediar el camí de rajoles',
    summary: 'El camí val si les rajoles es toquen i cada gir és recte o d\'un quart de volta.',
    h1: 'El camí no es talla',
    b1: 'Si dues rajoles no es toquen, el camí està tallat. Espera en silenci fins que es vegi el buit.',
    h2: 'El gir és d\'un quart',
    b2: 'Un gir val si és recte o d\'un quart de volta. Assenyala el buit i espera. No avancéis la peça.',
    q: 'Quin camí està bé?',
    wrong: 'Un amb un buit al mig',
    right: 'Un de continu, amb girs rectes o d\'un quart de volta',
    other: 'Qualsevol, si es parla abans de mirar',
    why: 'El fenomen és la continuïtat. La persona adulta no avança la peça.',
  },
  {
    title: 'Como mediar o camiño de baldosas',
    summary: 'O camiño vale se as baldosas se tocan e cada xiro é recto ou dun cuarto de volta.',
    h1: 'O camiño non se corta',
    b1: 'Se dúas baldosas non se tocan, o camiño está cortado. Espera en silencio ata que se vexa o oco.',
    h2: 'O xiro é dun cuarto',
    b2: 'Un xiro vale se é recto ou dun cuarto de volta. Sinala o oco e espera. Non adiantes a peza.',
    q: 'Que camiño está ben?',
    wrong: 'Un cun oco no medio',
    right: 'Un continuo, con xiros rectos ou dun cuarto de volta',
    other: 'Calquera, se se fala antes de mirar',
    why: 'O fenómeno é a continuidade. A persoa adulta non adianta a peza.',
  },
);

const S2 = pack(
  {
    title: 'Cómo mediar el laboratorio de sonido',
    summary: 'Primero se oye el golpe de verdad. Lúa espera un segundo antes de reaccionar.',
    h1: 'El sonido manda',
    b1: 'El resonador suena en la mesa. No lo tapes con la voz ni con una reacción inmediata.',
    h2: 'Un segundo de espera',
    b2: 'Tras el golpe, deja pasar un segundo. Después puede reaccionar Lúa. Así el sonido real no se pisa.',
    q: '¿Cuándo reacciona Lúa después del golpe?',
    wrong: 'En el mismo instante',
    right: 'Después de un segundo, cuando el sonido ya se ha oído',
    other: 'Antes del golpe, para ir más rápido',
    why: 'El segundo de espera deja oír el resonador. Quien confirma es la persona adulta.',
  },
  {
    title: 'How to mediate the sound lab',
    summary: 'The real strike is heard first. Lúa waits one second before reacting.',
    h1: 'The sound leads',
    b1: 'The resonator sounds on the table. Do not cover it with speech or with an immediate reaction.',
    h2: 'One second of waiting',
    b2: 'After the strike, let one second pass. Then Lúa may react. The real sound stays uncovered.',
    q: 'When does Lúa react after the strike?',
    wrong: 'At the same instant',
    right: 'After one second, once the sound has been heard',
    other: 'Before the strike, to go faster',
    why: 'The one-second wait lets the resonator be heard. The adult confirms.',
  },
  {
    title: 'Com mediar el laboratori de so',
    summary: 'Primer se sent el cop de veritat. Lúa espera un segon abans de reaccionar.',
    h1: 'El so mana',
    b1: 'El ressonador sona a la taula. No el tapis amb la veu ni amb una reacció immediata.',
    h2: 'Un segon d\'espera',
    b2: 'Després del cop, deixa passar un segon. Després pot reaccionar Lúa. Així el so real no es trepitja.',
    q: 'Quan reacciona Lúa després del cop?',
    wrong: 'Al mateix instant',
    right: 'Després d\'un segon, quan el so ja s\'ha sentit',
    other: 'Abans del cop, per anar més ràpid',
    why: 'El segon d\'espera deixa sentir el ressonador. Qui confirma és la persona adulta.',
  },
  {
    title: 'Como mediar o laboratorio de son',
    summary: 'Primeiro óese o golpe de verdade. Lúa espera un segundo antes de reaccionar.',
    h1: 'O son manda',
    b1: 'O resoador soa na mesa. Non o tapes coa voz nin cunha reacción no momento.',
    h2: 'Un segundo de espera',
    b2: 'Tras o golpe, deixa pasar un segundo. Despois pode reaccionar Lúa. Así o son real non se pisa.',
    q: 'Cando reacciona Lúa despois do golpe?',
    wrong: 'No mesmo instante',
    right: 'Despois dun segundo, cando o son xa se oíu',
    other: 'Antes do golpe, para ir máis rápido',
    why: 'O segundo de espera deixa oír o resoador. Quen confirma é a persoa adulta.',
  },
);

const S3 = pack(
  {
    title: 'Cómo mediar la pista de rampas',
    summary: 'La esfera baja sola. Una salida más alta puede tardar menos en llegar.',
    h1: 'La altura se ve en el tiempo',
    b1: 'Mira cuánto tarda la esfera en llegar. No la empujes: la rampa hace el trabajo.',
    h2: 'La persona adulta prepara la pista',
    b2: 'Coloca el pilar y el receptor. Cuando la esfera se para, confirma tú en la tableta.',
    q: '¿Quién confirma en la tableta que la esfera ha llegado?',
    wrong: 'Se empuja la esfera con la mano',
    right: 'La persona adulta',
    other: 'Se cambia la pista antes de mirar la llegada',
    why: 'La rampa hace bajar la esfera. La persona adulta prepara la pista y confirma la llegada.',
  },
  {
    title: 'How to mediate the ramp track',
    summary: 'The sphere rolls down on its own. A higher start can arrive in less time.',
    h1: 'Height shows up in the time',
    b1: 'Watch how long the sphere takes to arrive. Do not push it: the ramp does the work.',
    h2: 'The adult sets the track',
    b2: 'Place the pillar and the catcher. When the sphere stops, you confirm it on the tablet.',
    q: 'Who confirms on the tablet that the sphere has arrived?',
    wrong: 'Push the sphere by hand',
    right: 'The adult',
    other: 'Change the track before watching the arrival',
    why: 'The ramp brings the sphere down. The adult sets the track and confirms the arrival.',
  },
  {
    title: 'Com mediar la pista de rampes',
    summary: 'L\'esfera baixa sola. Una sortida més alta pot trigar menys a arribar.',
    h1: 'L\'alçada es veu en el temps',
    b1: 'Mira quant triga l\'esfera a arribar. No l\'empentis: la rampa fa la feina.',
    h2: 'La persona adulta prepara la pista',
    b2: 'Col·loca el pilar i el receptor. Quan l\'esfera s\'atura, ho confirmes tu a la tauleta.',
    q: 'Qui confirma a la tauleta que l\'esfera ha arribat?',
    wrong: 'S\'empeny l\'esfera amb la mà',
    right: 'La persona adulta',
    other: 'Es canvia la pista abans de mirar l\'arribada',
    why: 'La rampa fa baixar l esfera. La persona adulta prepara la pista i confirma l\'arribada.',
  },
  {
    title: 'Como mediar a pista de ramplas',
    summary: 'A esfera baixa soa. Unha saída máis alta pode tardar menos en chegar.',
    h1: 'A altura vese no tempo',
    b1: 'Mira canto tarda a esfera en chegar. Non a empuxes: a rampla fai o traballo.',
    h2: 'A persoa adulta prepara a pista',
    b2: 'Coloca o piar e o receptor. Cando a esfera se para, confírmalo ti na tableta.',
    q: 'Quen confirma na tableta que a esfera chegou?',
    wrong: 'Empúxase a esfera coa man',
    right: 'A persoa adulta',
    other: 'Cámbiase a pista antes de mirar a chegada',
    why: 'A rampla fai baixar a esfera. A persoa adulta prepara a pista e confirma a chegada.',
  },
);

const S4 = pack(
  {
    title: 'Cómo mediar el molino de aire',
    summary: 'El soplo mueve el rotor. La persona adulta no sopla el ensayo por la criatura.',
    h1: 'El aire hace girar',
    b1: 'Un soplo redondo mueve el rotor o el molinete. Espera a ver el giro antes de hablar.',
    h2: 'El modelo va aparte',
    b2: 'Si hace falta un modelo, sopla una vez aparte y deja el turno. Tú confirmas el giro en la tableta.',
    q: '¿Quién confirma el giro en la tableta?',
    wrong: 'Se habla mientras el rotor aún no gira',
    right: 'La persona adulta',
    other: 'Se sopla el ensayo entero en lugar de la criatura',
    why: 'El soplo del ensayo no lo sustituye la persona adulta. El botón de la tableta sí es suyo.',
  },
  {
    title: 'How to mediate the air mill',
    summary: 'The blow turns the rotor. The adult does not blow the trial instead of the child.',
    h1: 'Air makes it turn',
    b1: 'A round blow turns the rotor or the pinwheel. Wait to see the turn before speaking.',
    h2: 'The model is separate',
    b2: 'If a model is needed, blow once aside and then leave the turn. You confirm the spin on the tablet.',
    q: 'Who confirms the spin on the tablet?',
    wrong: 'Speaking while the rotor has not turned yet',
    right: 'The adult',
    other: 'Blowing the whole trial instead of the child',
    why: 'The adult does not replace the trial blow. The tablet button does belong to the adult.',
  },
  {
    title: 'Com mediar el molí d\'aire',
    summary: 'El buf fa moure el rotor. La persona adulta no bufa l\'assaig en lloc de la criatura.',
    h1: 'L aire fa girar',
    b1: 'Un buf rodó mou el rotor o el molinet. Espera a veure el gir abans de parlar.',
    h2: 'El model va a part',
    b2: 'Si cal un model, bufa una vegada a part i deixa el torn. Tu confirmes el gir a la tauleta.',
    q: 'Qui confirma el gir a la tauleta?',
    wrong: 'Es parla mentre el rotor encara no gira',
    right: 'La persona adulta',
    other: 'Es bufa l\'assaig sencer en lloc de la criatura',
    why: 'La persona adulta no substitueix el buf de l\'assaig. El botó de la tauleta sí que és seu.',
  },
  {
    title: 'Como mediar o muíño de aire',
    summary: 'O sopro move o rotor. A persoa adulta non sopra o ensaio no canto da criatura.',
    h1: 'O aire fai xirar',
    b1: 'Un sopro redondo move o rotor ou o muiñiño. Espera a ver o xiro antes de falar.',
    h2: 'O modelo vai á parte',
    b2: 'Se fai falta un modelo, sopra unha vez á parte e deixa a quenda. Ti confirmas o xiro na tableta.',
    q: 'Quen confirma o xiro na tableta?',
    wrong: 'Fálase mentres o rotor aínda non xira',
    right: 'A persoa adulta',
    other: 'Sóprase o ensaio enteiro no canto da criatura',
    why: 'A persoa adulta non substitúe o sopro do ensaio. O botón da tableta si é seu.',
  },
);

const S5 = pack(
  {
    title: 'Cómo mediar la balanza',
    summary: 'El puente se queda quieto cuando los dos lados pesan igual a la misma distancia.',
    h1: 'El mismo peso a los dos lados',
    b1: 'Si un lado baja, ese lado pesa más o está más lejos del centro. Mira la inclinación en silencio.',
    h2: 'Las masas las pone la persona adulta',
    b2: 'Coloca las masas y aparta las que no se usen. La criatura mira qué lado baja. Tú confirmas el equilibrio.',
    q: '¿Cuándo está equilibrado el puente?',
    wrong: 'Cuando un lado toca la mesa',
    right: 'Cuando se queda quieto, con el mismo peso a la misma distancia',
    other: 'Cuando se añade masa sin mirar',
    why: 'El fenómeno es el equilibrio. Las masas las coloca la persona adulta.',
  },
  {
    title: 'How to mediate the balance',
    summary: 'The bridge stays still when both sides weigh the same at the same distance.',
    h1: 'The same weight on both sides',
    b1: 'If one side drops, that side is heavier or farther from the center. Watch the tilt in silence.',
    h2: 'The adult places the masses',
    b2: 'Place the masses and set aside the ones not in use. The child watches which side drops. You confirm the balance.',
    q: 'When is the bridge balanced?',
    wrong: 'When one side touches the table',
    right: 'When it stays still, with the same weight at the same distance',
    other: 'When mass is added without looking',
    why: 'The phenomenon is balance. The adult places the masses.',
  },
  {
    title: 'Com mediar la balança',
    summary: 'El pont es queda quiet quan els dos costats pesen igual a la mateixa distància.',
    h1: 'El mateix pes als dos costats',
    b1: 'Si un costat baixa, aquell costat pesa més o és més lluny del centre. Mira la inclinació en silenci.',
    h2: 'Les masses les posa la persona adulta',
    b2: 'Col·loca les masses i aparta les que no es facin servir. La criatura mira quin costat baixa. Tu confirmes l\'equilibri.',
    q: 'Quan està equilibrat el pont?',
    wrong: 'Quan un costat toca la taula',
    right: 'Quan es queda quiet, amb el mateix pes a la mateixa distància',
    other: 'Quan s\'afegeix massa sense mirar',
    why: 'El fenomen és l\'equilibri. Les masses les col·loca la persona adulta.',
  },
  {
    title: 'Como mediar a balanza',
    summary: 'A ponte queda quieta cando os dous lados pesan igual á mesma distancia.',
    h1: 'O mesmo peso aos dous lados',
    b1: 'Se un lado baixa, ese lado pesa máis ou está máis lonxe do centro. Mira a inclinación en silencio.',
    h2: 'As masas póñas a persoa adulta',
    b2: 'Coloca as masas e aparta as que non se usen. A criatura mira que lado baixa. Ti confirmas o equilibrio.',
    q: 'Cando está equilibrada a ponte?',
    wrong: 'Cando un lado toca a mesa',
    right: 'Cando queda quieta, co mesmo peso á mesma distancia',
    other: 'Cando se engade masa sen mirar',
    why: 'O fenómeno é o equilibrio. As masas colócaas a persoa adulta.',
  },
);

const S6 = pack(
  {
    title: 'Cómo mediar el jardín',
    summary: 'La secuencia es sembrar, regar, brotar y llegar a la noche. No se salta un paso.',
    h1: 'El orden es el fenómeno',
    b1: 'La semilla va antes del agua, y el agua antes del brote. Si se salta un paso, la planta no sigue.',
    h2: 'Una pieza cada vez',
    b2: 'Acerca una pieza y espera. La criatura señala el siguiente paso. Tú confirmas.',
    q: '¿Qué va justo después de sembrar?',
    wrong: 'La noche',
    right: 'El riego',
    other: 'La flor, sin agua',
    why: 'La secuencia no se salta. Quien confirma cada paso es la persona adulta.',
  },
  {
    title: 'How to mediate the garden',
    summary: 'The sequence is sow, water, sprout and reach the night. A step is not skipped.',
    h1: 'Order is the phenomenon',
    b1: 'The seed comes before the water, and the water before the sprout. If a step is skipped, the plant does not continue.',
    h2: 'One piece at a time',
    b2: 'Bring one piece and wait. The child points to the next step. You confirm.',
    q: 'What comes right after sowing?',
    wrong: 'Night',
    right: 'Watering',
    other: 'The flower, with no water',
    why: 'The sequence is not skipped. The adult confirms each step.',
  },
  {
    title: 'Com mediar el jardí',
    summary: 'La seqüència és sembrar, regar, brotar i arribar a la nit. No es salta un pas.',
    h1: 'L\'ordre és el fenomen',
    b1: 'La llavor va abans de l\'aigua, i l\'aigua abans del brot. Si es salta un pas, la planta no segueix.',
    h2: 'Una peça cada vegada',
    b2: 'Acosta una peça i espera. La criatura assenyala el pas següent. Tu confirmes.',
    q: 'Què va just després de sembrar?',
    wrong: 'La nit',
    right: 'El reg',
    other: 'La flor, sense aigua',
    why: 'La seqüència no es salta. Qui confirma cada pas és la persona adulta.',
  },
  {
    title: 'Como mediar o xardín',
    summary: 'A secuencia é sementar, regar, abrochar e chegar á noite. Non se salta un paso.',
    h1: 'A orde é o fenómeno',
    b1: 'A semente vai antes da auga, e a auga antes do abrocho. Se se salta un paso, a planta non segue.',
    h2: 'Unha peza cada vez',
    b2: 'Achega unha peza e espera. A criatura sinala o paso seguinte. Ti confirmas.',
    q: 'Que vai xusto despois de sementar?',
    wrong: 'A noite',
    right: 'A rega',
    other: 'A flor, sen auga',
    why: 'A secuencia non se salta. Quen confirma cada paso é a persoa adulta.',
  },
);

const BUILT = {
  S0: build('STEAM-S0', '0', S0),
  S1: build('STEAM-S1', '1', S1),
  S2: build('STEAM-S2', '2', S2),
  S3: build('STEAM-S3', '3', S3),
  S4: build('STEAM-S4', '4', S4),
  S5: build('STEAM-S5', '5', S5),
  S6: build('STEAM-S6', '6', S6),
} as const satisfies Record<SteamWorldId, Record<UiLang, AcademyCapsule>>;

export const STEAM_CAPSULE_ID = {
  S0: 'STEAM-S0',
  S1: 'STEAM-S1',
  S2: 'STEAM-S2',
  S3: 'STEAM-S3',
  S4: 'STEAM-S4',
  S5: 'STEAM-S5',
  S6: 'STEAM-S6',
} as const satisfies Record<SteamWorldId, string>;

export function steamCapsuleFor(worldId: SteamWorldId, lang: UiLang): AcademyCapsule {
  return BUILT[worldId][lang];
}

/** Las siete cápsulas, una por mundo, para el catálogo de Academy. */
export function steamCapsules(lang: UiLang): AcademyCapsule[] {
  return (Object.keys(BUILT) as SteamWorldId[]).map((id) => BUILT[id][lang]);
}

// ============================================================================
// Valeria+ · Audició i Llenguatge en CATALÀ — pla ca-ES (CA-2.x)
//
// Sense aquest fitxer, una sessió en català arribava a Audició, Llenguatge, TEA
// o Dislèxia i queia al banc castellà: l'infant sentia castellà enmig de la
// teràpia o, quan el text sí que era català, el sentia amb la veu del sistema
// llegint català amb accent castellà. Aquí cada exercici es REAUTORITZA en
// català: consigna, fitxes, prompts, EPT-3 i variant de moviment.
//
// Adaptacions pròpies del català (no són traduccions literals):
//   · Vocals (FF-1/FF-3): les cinc grafies vocàliques, però amb paraules
//     catalanes que comencen amb el so clar, no amb la lletra sola. En català
//     l'àtona inicial es neutralitza, així que «elefant» comença sonant [ə]:
//     per a la E s'ha triat una paraula amb E tònica inicial.
//   · Gènere (MS-2): nen/nena, avi/àvia, gall/gallina.
//   · Plural (MS-1): -s i -os («un peix» → «molts peixos»), amb el determinant
//     català que construeix pluralOneLabelFor.
//   · Dislèxia: rimes, síntesi fonèmica i pseudoparaules amb la fonotàctica
//     catalana (dx3 usa MÀ, que en català es tanca sense nasal final).
//
// Mòdul PUR: només importa el tipus Exercise del banc base.
// ============================================================================
import type { Exercise } from './valeriaExerciseBank';

// ---- Constants de pantalla localitzades (les consumeix el player per varietat) ----
export const EMO_CA: { face: string; label: string }[] = [
  { face: '😀', label: 'Alegria' }, { face: '😢', label: 'Tristesa' },
  { face: '😠', label: 'Enuig' }, { face: '🤕', label: 'Dolor' },
];
export const SESSION_DONE_LEAD_CA = 'Sessió completada!';
export const PLURAL_HINT_CA = 'Aquí només n\'hi ha un. Busca on n\'hi ha molts.';
export const EMOTION_PROMPT_CA = 'Com se sent?';
export const TOUCH_IMAGE_HINT_CA = 'Primer toca una imatge.';

// Veredictes parlats del joc de micròfon (MicPracticeCard), indexats per
// MatchLevel (0 = una altra vegada, 1 = gairebé, 2 = genial). Els consumeix la
// UI via micVerdictSayFor(loc) perquè en català soni l'asset neuronal i no el
// veredicte castellà, que trencava la continuïtat de la veu catalana.
export const MIC_VERDICT_SAY_CA: [string, string, string] = [
  'L\'escoltarem una altra vegada.',
  'Gairebé! Ho tornem a intentar.',
  'Molt bé! L\'has dit genial!',
];

// Peces fixes de veu (mirall d'EXERCISE_FIXED_LINES en català).
export const EXERCISE_FIXED_LINES_CA: { style: 'tutor' | 'child' | 'slow'; text: string }[] = [
  ...MIC_VERDICT_SAY_CA.map((t) => ({ style: 'child' as const, text: t })),
  { style: 'child', text: TOUCH_IMAGE_HINT_CA },
  ...EMO_CA.map((e) => ({ style: 'child' as const, text: e.label })),
  { style: 'child', text: SESSION_DONE_LEAD_CA },
  { style: 'child', text: PLURAL_HINT_CA },
  // Prompt d'emocions amb les opcions (SpeakButton «Escoltar les opcions» de
  // PR-3): MATEIX literal que construeix emotionPromptFor(loc) al player,
  // perquè resolgui l'asset neuronal en lloc de caure a la veu del sistema.
  { style: 'tutor', text: `${EMOTION_PROMPT_CA} ${EMO_CA.map((e) => e.label).join(', ')}?` },
];

// ---------------------------------------------------------------------------
// Overrides per exercici en català.
// ---------------------------------------------------------------------------
export const EXERCISE_CA: Record<string, Partial<Exercise>> = {
  // ===================== AUDICIÓ (fonètica-fonologia) =====================
  ff1: {
    read: 'L\'infant toca una imatge per sentir-ne el nom i després toca la vocal amb què comença. L\'app li diu si ho ha encertat.',
    stageLabel: 'Uneix cada imatge amb la seva vocal',
    tiles: [{ cap: 'aranya', emoji: '🕷️' }, { cap: 'estrella', emoji: '⭐' }, { cap: 'illa', emoji: '🏝️' }],
    move: 'Dibuixeu la vocal a l\'aire amb el braç ben gran cada vegada que l\'encerti.',
    ept: ['Encara no uneix la imatge amb la seva vocal, ni amb ajuda.', 'Encerta la vocal quan l\'adult li dona una pista.', 'Uneix cada imatge amb la seva vocal tot sol.'],
  },
  ff2: {
    read: 'Digues tu primer la paraula, a prop de l\'infant i a poc a poc, i anima\'l a repetir-la. La veu de l\'app només és un suport extra.',
    stageLabel: 'Repeteix la paraula', phrase: 'SABATA', phraseEmoji: '👟',
    move: 'Camineu per la sala trepitjant fort una síl·laba a cada pas: SA-BA-TA.',
    ept: ['Encara no imita el so o queda molt lluny de la paraula.', 'Repeteix la paraula després de sentir-te-la a tu diverses vegades.', 'Diu la paraula tot sol, amb totes les vocals clares.'],
  },
  ff3: {
    read: 'Primer prem 🔊 perquè l\'infant senti la paraula sencera. Després, que toqui la vocal que falta a la paraula escrita.',
    stageLabel: 'Escolta la paraula i completa la vocal', fillBefore: 'S', fillAfter: 'L', fillAnswer: 'O', fillEmoji: '☀️', fillCap: 'sol',
    move: 'Quan trobi la vocal, braços amunt formant un sol gegant.',
    ept: ['Encara no troba la vocal que falta, ni amb ajuda.', 'Completa la paraula si li repeteixes el so o li dones una pista.', 'Escolta la paraula i toca la vocal que falta tot sol.'],
  },
  se1: {
    read: 'Prem 🔊 per sentir el nom de les quatre paraules. Tres van juntes i una no. L\'infant toca la que NO va amb les altres.',
    stageLabel: 'Toca la paraula que no va amb les altres',
    intruder: [{ cap: 'poma', emoji: '🍎' }, { cap: 'plàtan', emoji: '🍌' }, { cap: 'raïm', emoji: '🍇' }, { cap: 'cotxe', emoji: '🚗' }], intruderAnswer: 3,
    move: 'Si es menja, toqueu-vos la panxa; si és la intrusa, salt d\'estrella!',
    ept: ['Encara no troba la paraula que no va amb les altres.', 'La troba quan li fas una pregunta d\'ajuda («quines es mengen?»).', 'La troba tot sol i explica per què no va amb les altres.'],
  },
  se2: {
    read: 'Prem 🔊 per sentir l\'endevinalla (o llegeix-la tu). L\'infant respon tocant una de les tres imatges.',
    stageLabel: 'Escolta l\'endevinalla i toca la resposta',
    choicePrompt: 'Comença per pe, i és una fruita groga i llarga. Què és?', choiceLabel: 'Escoltar l\'endevinalla', choiceVoice: 'tutor',
    options: [{ cap: 'plàtan', emoji: '🍌' }, { cap: 'pera', emoji: '🍐' }, { cap: 'pilota', emoji: '⚽' }], optionAnswer: 0,
    move: 'Busqueu per l\'habitació un objecte real que comenci per la mateixa lletra.',
    ept: ['Encara no endevina la resposta, ni amb més pistes.', 'Encerta després de repetir-li l\'endevinalla o donar-li una altra pista.', 'Encerta a la primera, només de sentir l\'endevinalla.'],
  },
  se3: {
    materials: 'Un ninot o peluix i roba de debò: gorra, sabates, samarreta…',
    read: 'Agafa el ninot i la roba. Dona a l\'infant una ordre cada vegada: «Posa-li la gorra al ninot». Canvia de peça a cada torn.',
    stageLabel: 'Escolta l\'ordre i vesteix el ninot', instrHint: 'L\'infant escolta la teva ordre i vesteix el ninot amb la peça correcta.',
    move: 'Jugueu a vestir-vos de debò: que porti la gorra corrent i que se la posi.',
    ept: ['Encara no reconeix les peces ni compleix l\'ordre.', 'Posa la peça correcta si abans l\'hi ensenyes tu una vegada.', 'Escolta l\'ordre i vesteix el ninot tot sol.'],
  },
  ms1: {
    read: 'L\'infant toca la targeta on n\'hi ha MOLTS. Després pregunta-li «què són?» perquè ho digui amb la essa final: «gats».',
    stageLabel: 'Toca on n\'hi ha molts i digues-ho',
    plural: { cap: 'gat', capPlural: 'gats', emoji: '🐱', gender: 'm' },
    move: 'Un salt gran si n\'hi ha UN, molts saltets seguits si n\'hi ha MOLTS.',
    ept: ['Encara no distingeix entre «un» i «molts».', 'Diu el plural («gats») si l\'hi dius tu abans.', 'Toca on n\'hi ha molts i diu el plural tot sol.'],
  },
  ms2: {
    read: 'Prem 🔊 per sentir la paraula. L\'infant toca la imatge correcta. Després jugueu al revés: tu assenyales una imatge i ell diu la paraula.',
    stageLabel: 'Escolta la paraula i toca la imatge',
    choicePrompt: 'nena', choiceLabel: 'Escoltar la paraula', choiceVoice: 'slow',
    options: [{ cap: 'nen', emoji: '👦' }, { cap: 'nena', emoji: '👧' }], optionAnswer: 1,
    move: 'Un costat de la sala és "nen" i l\'altre "nena": corre al costat correcte!',
    ept: ['Encara confon les paraules de nen i de nena.', 'Encerta si li recordes el final de la paraula: «nen», «nen-a».', 'Toca la imatge i diu la paraula correcta tot sol.'],
  },
  ms3: {
    read: 'Prem 🔊 perquè l\'infant senti la frase. Després, que toqui les paraules en ordre per construir-la: qui, què fa i quina cosa.',
    stageLabel: 'Escolta la frase i ordena les paraules',
    parts: [{ role: 'Subjecte', cap: 'nen', emoji: '👦' }, { role: 'Verb', cap: 'menja', emoji: '😋' }, { role: 'Objecte', cap: 'poma', emoji: '🍎' }], sentence: 'El nen menja la poma.',
    move: 'Teatralitzeu la frase: l\'infant fa d\'actor i "menja" una poma imaginària.',
    ept: ['Només diu paraules soltes («nen», «poma»).', 'Construeix la frase si tu l\'ajudes a començar-la.', 'Ordena les paraules i diu la frase sencera tot sol.'],
  },
  pr1: {
    read: 'Assenyala coses de l\'habitació i pregunta-li: «Què és això?». Grava o escriu a sota el que respongui l\'infant.',
    instrHint: 'Primer respon ell a les teves preguntes; després anima\'l a preguntar-te a tu «què és això?».',
    capture: 'Pregunta-li «què és això?» assenyalant un objecte. Grava-ho amb el micro o escriu la seva resposta.',
    move: 'Passegeu per casa com a exploradors assenyalant objectes: "què és això?" a cada parada.',
    ept: ['Encara no respon la pregunta.', 'Respon si primer li dones tu un exemple de resposta.', 'Respon tot sol i fins i tot et fa preguntes a tu.'],
  },
  pr2: {
    materials: 'Un peluix o ninot',
    read: 'El peluix està adormit: parleu ben fluixet per no despertar-lo. Quan es «desperti», torneu a la veu normal. Registra a sota com ho fa.',
    instrHint: 'Peluix adormit = veu fluixeta. Peluix despert = veu normal. L\'infant ha de canviar la seva veu amb el joc.',
    scenes: [
      { emoji: '😴', label: 'Adormit → veu fluixeta', say: 'Xxxt… el peluix està adormit. Parlem molt i molt fluixet.' },
      { emoji: '😀', label: 'Despert → veu normal', say: 'Ja s\'ha despertat, el peluix! Ara parlem amb veu normal.' },
    ],
    capture: 'Grava o escriu com ha parlat l\'infant: ha abaixat la veu amb el peluix adormit?',
    move: 'Camineu de puntetes parlant fluixet; al senyal, veu normal i pas fort!',
    ept: ['Parla igual de fort encara que el peluix dormi.', 'Abaixa la veu quan tu l\'hi recordes.', 'Canvia tot sol entre veu fluixeta i veu normal segons el joc.'],
  },
  pr3: {
    read: 'Mira la cara gran amb l\'infant. Prem 🔊 si vol sentir les opcions. Ell toca com se sent la cara.',
    stageLabel: 'Reconeix l\'emoció', emotionFace: '😀', emotionAnswer: 'Alegria',
    move: 'Imiteu l\'emoció amb tot el cos: cara, braços i postura d\'estàtua.',
    ept: ['Encara no reconeix com se sent la cara.', 'Encerta l\'emoció si li dones pistes («mira-li la boca»).', 'Diu l\'emoció tot sol i explica per què se sent així.'],
  },
  pr4: {
    read: 'Tapa\'t la boca i digues una paraula gairebé sense veu. Si l\'infant no l\'entén, t\'ha de demanar: «què?» o «com?». Això és el que practiquem: demanar que t\'ho repeteixin.',
    instrHint: 'L\'objectiu NO és repetir paraules: és que l\'infant aprengui a demanar que li repeteixis el que no ha entès.',
    micTarget: 'com', micAlt: ['què'], micPrompt: 'Quan no t\'entengui, prem el micro i que demani: «com?» o «què?»',
    move: 'Xiuxiueja una ordre des de lluny; si no s\'entén, que vingui corrent i demani "què?".',
    ept: ['Es queda callat o abandona quan no entén alguna cosa.', 'Demana «què?» si tu li recordes que ho pot demanar.', 'Demana «què?» o «com?» tot sol quan no entén.'],
  },

  // ================== REHABILITACIÓ AUDITIVA (ACOPROS) ==================
  ra1: {
    read: 'Primer en silenci: digues-li amb la teva veu normal «busca la vaca» i que la toqui. Quan ho encerti tranquil, apuja A POC A POC el soroll de fons des del Panell de l\'Adult (a sota) i repeteix amb un altre animal. La teva veu és el senyal: no cridis ni exageris; si el veus fatigat, abaixa el soroll.',
    stageLabel: 'Escolta la veu de l\'adult i toca l\'animal',
    choicePrompt: 'Busca la vaca.', choiceLabel: 'Suport: escoltar l\'ordre', choiceVoice: 'tutor',
    options: [{ cap: 'vaca', emoji: '🐄' }, { cap: 'ovella', emoji: '🐑' }, { cap: 'cavall', emoji: '🐴' }, { cap: 'gallina', emoji: '🐔' }],
    optionAnswer: 0,
    move: 'Granja a casa: amagueu els animals de peluix i busqueu-los amb la música posada fluixeta.',
    ept: ['Encara no troba l\'animal demanat, ni en silenci.', 'Encerta en silenci, però perd l\'ordre quan puja el soroll.', 'Troba l\'animal demanat fins i tot amb soroll de fons alt.'],
  },
  ra2: {
    read: 'PRIMER sense veu: digues la paraula només movent els llavis, a poc a poc i amb la cara ben il·luminada, i que l\'infant toqui la imatge llegint-te els llavis. DESPRÉS prem 🔊 per tornar-li el so i confirmar. No el corregeixis amb un «no»: repeteix el model amb veu i llavis alhora.',
    stageLabel: 'Llegeix els llavis de l\'adult i toca la imatge',
    choicePrompt: 'ànec', choiceLabel: 'Després: escoltar la paraula amb veu', choiceVoice: 'slow',
    options: [{ cap: 'ànec', emoji: '🦆' }, { cap: 'lluna', emoji: '🌙' }, { cap: 'sol', emoji: '☀️' }],
    optionAnswer: 0,
    move: 'Jugueu al mirall mut: un diu una paraula sense veu i l\'altre l\'endevina. Canvieu els papers!',
    ept: ['Encara no reconeix cap paraula només pels llavis.', 'La reconeix si després li dones el model amb veu i llavis junts.', 'Reconeix la paraula tot sol, únicament llegint els llavis.'],
  },
  ra3: {
    read: 'Quatre paraules que sonen gairebé igual. Digues tu la paraula objectiu amb veu normal i que la toqui. A cada ronda fes-ho una mica més difícil AMB EL TEU COS: abaixa el volum de la teva veu o allunya\'t un pas més. L\'app no toca el volum: l\'estressor ets tu, i tu decideixes quan parar.',
    stageLabel: 'Escolta la paraula i toca la imatge correcta',
    choicePrompt: 'plat', choiceLabel: 'Suport: escoltar la paraula', choiceVoice: 'slow',
    options: [{ cap: 'plat', emoji: '🍽️' }, { cap: 'pat', emoji: '🦆' }, { cap: 'gat', emoji: '🐱' }, { cap: 'sabata', emoji: '👟' }],
    optionAnswer: 0,
    move: 'Telèfon viatger: xiuxiueja-li la paraula a l\'orella des de cada racó de l\'habitació.',
    ept: ['Encara confon les paraules semblants, fins i tot amb veu propera i clara.', 'Encerta amb veu normal i a prop, però falla quan abaixes la veu o t\'allunyes.', 'Distingeix la paraula correcta fins i tot amb veu fluixeta o des de lluny.'],
  },
  ra4: {
    read: 'Prem 🔊 perquè senti l\'ordre SENCERA de tres passos. Després, cadenat humà: subjecta-li les mans amb suavitat i compta fins a 5 en silenci abans de deixar-lo tocar. Aquesta espera l\'obliga a guardar l\'ordre a la memòria, no a buidar-la corrents.',
    stageLabel: 'Escolta els tres passos, espera i toca\'ls en ordre',
    parts: [{ role: 'Primer', cap: 'sol', emoji: '☀️' }, { role: 'Després', cap: 'gos', emoji: '🐶' }, { role: 'Al final', cap: 'casa', emoji: '🏠' }],
    sentence: 'Toca el sol, després el gos i al final la casa.',
    move: 'Circuit d\'ordres: «toca la porta, després el sofà i al final la finestra», amb la mateixa espera de 5 segons.',
    ept: ['Encara no reté la seqüència: toca el primer que veu.', 'Completa la seqüència si li repeteixes l\'ordre o li recordes un pas.', 'Guarda els tres passos durant l\'espera i els toca en ordre tot sol.'],
  },
  ra5: {
    materials: 'Una campaneta, unes claus o un cascavell (alguna cosa que soni clara)',
    read: 'Posa\'t DARRERE de l\'infant, on no et vegi. Fes sonar l\'objecte a un costat (esquerra o dreta) i que assenyali amb el braç d\'on ha vingut el so ABANS de girar-se a mirar. Alterna els costats sense seguir cap patró fix.',
    instrHint: 'Escolta binaural: de quin costat ve el so? Assenyalar abans de mirar. Clau en usuaris d\'implant unilateral.',
    capture: 'Anota quin costat encerta més i quin li costa (p. ex. «encerta gairebé sempre a la dreta, dubta a l\'esquerra»).',
    move: 'Marco Polo sonor: amb els ulls tancats, que camini cap a la campaneta que sona.',
    ept: ['Encara no localitza el costat del so: assenyala a l\'atzar o no respon.', 'Encerta el costat si repeteixes el so diverses vegades o és molt fort.', 'Assenyala el costat correcte a la primera, fins i tot amb sons suaus.'],
  },

  // ============================ LLENGUATGE ============================
  atencion_conjunta: {
    read: 'Crida l\'infant pel seu nom i fes bombolles. Busca-li la mirada i el contacte visual.',
    instrHint: 'Desenvolupa contacte visual, seguiment de la mirada i resposta al nom.',
    move: 'Perseguiu i rebenteu bombolles junts: una bombolla, una mirada.',
    ept: ['Necessita ajuda física per sostenir la mirada un moment.', 'Respon al seu nom després de cridar-lo diverses vegades.', 'Et mira tot sol i segueix la teva mirada.'],
    levels: [
      { label: 'Inicial', instrIcon: '🫧', read: 'Acosta les bombolles ben a prop de la teva cara i crida\'l pel seu nom. Busca un contacte visual breu, encara que sigui d\'un instant.', instrHint: 'Estímul d\'alt interès i molt proper. Qualsevol mirada breu compta.' },
      { label: 'Intermedio', instrIcon: '👀', read: 'Fes bombolles a un braç de distància. Crida\'l pel seu nom i assenyala amb el dit cap a les bombolles.', instrHint: 'Afavoreix el seguiment de la mirada cap a on assenyala el tutor.' },
      { label: 'Avanzado', instrIcon: '🙋', read: 'Des de l\'altra punta de l\'habitació, crida\'l pel seu nom una sola vegada sense cap estímul motivador a la vista.', instrHint: 'Busca resposta espontània al nom sense suport visual ni proximitat.' },
    ],
  },
  imitacion: {
    read: 'Fes un gest (picar de mans, tocar el tambor) i anima\'l a imitar-te. Ara una síl·laba: "pa-pa".',
    instrHint: 'Imita gestos motors grossos i vocalitzacions simples en mirall.',
    move: 'Mirall humà: imiteu gestos grans (braços, salts, girs) per torns.',
    ept: ['Encara no copia gestos ni sons.', 'Imita gestos o sons solts amb l\'ajuda de l\'adult.', 'Repeteix gestos i sons just després de veure\'ls, com un mirall.'],
    levels: [
      { label: 'Inicial', instrIcon: '👏', read: 'Pica de mans a poc a poc davant seu i guia-li les mans la primera vegada. Repeteix el gest tot sol.', instrHint: 'Gest motor gros aïllat, amb ajuda física si cal.' },
      { label: 'Intermedio', instrIcon: '🥁', read: 'Toca el tambor dues vegades i digues "pa-pa". Espera que imiti el gest o el so sense ajuda física.', instrHint: 'Seqüència curta de gest + síl·laba, sense suport físic, només model visual.' },
      { label: 'Avanzado', instrIcon: '🪞', read: 'Combina un gest i una síl·laba nova ("ta-ta" + saltar) i observa si ho imita en mirall, immediatament i sense repetir el model.', instrHint: 'Imitació immediata d\'una combinació nova, sense repetició del model.' },
    ],
  },
  comprension: {
    read: 'Dona-li una ordre d\'un pas: "Dona\'m la pilota". Demana-li que assenyali parts del cos.',
    instrHint: 'Comprèn instruccions d\'un pas i identifica parts del cos i objectes.',
    move: 'Jugueu a "en Simó diu" amb ordres d\'un pas i parts del cos.',
    ept: ['No obeeix instruccions ni assenyala els elements demanats.', 'Executa l\'ordre amb l\'ajuda de gestos d\'assenyalament.', 'Comprèn la instrucció purament verbal i l\'executa.'],
    levels: [
      { label: 'Inicial', instrIcon: '🤲', read: 'Digues-li "Dona\'m la pilota" mentre assenyales la pilota amb el dit.', instrHint: 'Ordre d\'un pas amb suport gestual directe del tutor.' },
      { label: 'Intermedio', instrIcon: '🧍', read: 'Demana-li "Toca\'t el nas" i "Toca\'t el cap" sense gestos de suport.', instrHint: 'Identificació de parts del cos només amb instrucció verbal.' },
      { label: 'Avanzado', instrIcon: '🧩', read: 'Digues-li sense cap gest: "Dona\'m la pilota i seu". Observa si executa els dos passos en ordre.', instrHint: 'Ordre verbal de dos passos, sense cap suport gestual.' },
    ],
  },
  expresion: {
    read: 'Com fa el gos? "Bup bup". Anima\'l a anomenar i a demanar: "vull aigua".',
    stageLabel: 'Evoca i anomena', phrase: 'VULL AIGUA', phraseEmoji: '💧',
    ept: ['Només fa servir gestos o balbuceigs per demanar el que necessita.', 'Diu paraules senzilles després de sentir-te-les a tu.', 'Diu paraules i frases de dues paraules tot sol.'],
    move: 'Cursa fins a l\'aixeta: només s\'obre si diu la paraula màgica "aigua".',
    levels: [
      { label: 'Inicial', instrIcon: '🐶', read: 'Ensenya-li el ninot del gos i modela: "Bup bup". Espera que repeteixi l\'onomatopeia.', instrHint: 'Imitació directa d\'una onomatopeia després del model de l\'adult.' },
      { label: 'Intermedio', instrIcon: '🏷️', read: 'Ensenya-li un got d\'aigua sense dir res i pregunta-li: "Què és això?".', instrHint: 'Anomenar un objecte familiar de manera espontània, sense model previ.' },
      { label: 'Avanzado', instrIcon: '🗣️', read: 'Ofereix-li el got buit i espera que demani espontàniament "vull aigua" combinant les dues paraules.', instrHint: 'Combinació espontània de dues paraules en una petició funcional.' },
    ],
  },
  comunicacion_funcional: {
    read: 'Atura una cosa divertida i espera. Anima\'l a demanar "més" o "ajuda".',
    instrHint: 'Demana joc o ajuda amb paraules, gestos o signes.',
    move: 'Gronxador, avió o pessigolles: atura el joc i espera que demani "més".',
    ept: ['Es frustra o no intenta comunicar-se quan alguna cosa no surt.', 'Demana ajuda o "més" si tu li dius abans la paraula.', 'Demana amb paraules o signes, tot sol i amb intenció clara.'],
    levels: [
      { label: 'Inicial', instrIcon: '🤚', read: 'Atura un joc divertit (pessigolles, gronxador) i modela el gest + paraula "més". Ajuda\'l a imitar-ho.', instrHint: 'Petició de "més" amb gest i paraula modelats pel tutor.' },
      { label: 'Intermedio', instrIcon: '🔒', read: 'Dona-li un pot tancat amb alguna cosa que li agradi a dins i espera. Si es frustra, suggereix-li a mitja veu "ajuda".', instrHint: 'Petició d\'"ajuda" davant d\'un obstacle, amb pista verbal parcial.' },
      { label: 'Avanzado', instrIcon: '💬', read: 'Crea una altra situació de necessitat (joguina fora de l\'abast) sense donar cap pista i espera la petició espontània.', instrHint: 'Inici espontani de la petició, sense pistes verbals ni gestuals.' },
    ],
  },
  regulacion_conductual: {
    read: 'Avisa del canvi d\'activitat amb l\'agenda visual i espera amb tranquil·litat.',
    instrHint: 'Anticipa i accepta el canvi d\'activitat amb suport visual i fitxes.',
    move: 'Aneu junts cap a l\'activitat següent cantant la cançó de les transicions.',
    ept: ['S\'enfada o es descontrola en els canvis d\'activitat.', 'Accepta el canvi si guanya una fitxa com a premi.', 'Canvia d\'activitat tranquil i per si mateix.'],
    levels: [
      { label: 'Inicial', instrIcon: '🖼️', read: 'Ensenya-li la imatge de l\'activitat següent i fes un compte enrere visual de 5 a 1 abans de canviar.', instrHint: 'Anticipació amb suport visual fort i compte enrere.' },
      { label: 'Intermedio', instrIcon: '🎫', read: 'Avisa del canvi una sola vegada i ofereix-li una fitxa quan acabi l\'activitat amb calma.', instrHint: 'Accepta el canvi amb l\'ajuda de fitxes-premi.' },
      { label: 'Avanzado', instrIcon: '📅', read: 'Deixa que consulti tot sol la seva agenda visual i faci la transició sense que l\'hagis d\'avisar.', instrHint: 'Transició autònoma seguint l\'agenda, sense avís directe del tutor.' },
    ],
  },
  interaccion_social: {
    read: 'Jugueu per torns: "Ara tu, ara jo". Comença un joc simbòlic senzill.',
    instrHint: 'Respecta torns, comença joc simbòlic i respon afectivament.',
    move: 'Passeu-vos una pilota rodant: només parla qui la té. Torn i moviment!',
    ept: ['Juga sol i rebutja compartir torns.', 'Accepta torns i participa si tu guies el joc.', 'Comença jocs amb altres i manté el dona i pren.'],
    levels: [
      { label: 'Inicial', instrIcon: '🔁', read: 'Apila un bloc i digues-li "ara tu". Ajuda\'l físicament si no respon al torn.', instrHint: 'Torn simple guiat, amb ajuda física si cal.' },
      { label: 'Intermedio', instrIcon: '🍽️', read: 'Ofereix-li un ninot i una cullera; modela "li donarem de menjar" i espera que continuï el joc simbòlic.', instrHint: 'Inici de joc simbòlic breu amb el suport del model.' },
      { label: 'Avanzado', instrIcon: '🎭', read: 'Deixa que proposi ell un joc de torns o simbòlic i mantén l\'intercanvi sense dirigir-lo.', instrHint: 'Reciprocitat espontània: l\'infant comença i manté l\'intercanvi.' },
    ],
  },

  // ============================ TEA (PRT + TCC) ============================
  tea1: {
    read: 'Col·loca un objecte molt motivador entre la teva cara i l\'infant. Espera 3 segons ABANS de donar cap pista (instigació retardada): el botó del segell es desbloqueja només després d\'aquesta espera. Prem el Segell Doble ÚNICAMENT quan hi hagi contacte visual real amb tu, no amb l\'objecte.',
    instrHint: 'Triangula l\'atenció: objecte → la teva mirada → l\'infant. El segell es reté fins al contacte visual real; l\'espera de 3 s és la instigació retardada (Time Delay).',
    move: 'Amaga l\'objecte darrere l\'esquena i camina a poc a poc: que et busqui la mirada abans d\'ensenyar-l\'hi.',
    ept: ['Encara no alterna la mirada entre l\'objecte i la teva cara, ni amb espera.', 'Et mira si retens l\'objecte al costat de la teva cara i li dones una pista.', 'Alterna la mirada objecte→tu tot sol, dins de l\'espera de 3 segons.'],
  },
  tea2: {
    read: 'Aquest exercici fa servir el Trencament Pragmàtic del Panell de l\'Adult: congeles l\'app expressament (ordre absurda o silenci) i observes com repara l\'infant la comunicació. És un estressor MANUAL i reversible a l\'instant: tu decideixes quan comença i quan s\'acaba. Obre\'l a sota al Panell de l\'Adult i registra l\'estratègia que facis servir.',
    instrHint: 'La "frustració útil" és 100 % humana: l\'app mai no interromp sola. Registra l\'estratègia de reparació (demanar repetició, gest, reformular…) al mateix trencament.',
    move: 'Després de cada reparació aconseguida, celebreu-ho amb una encaixada ben exagerada.',
    ept: ['No registra el trencament: s\'aïlla o es desborda sense buscar reparar.', 'Repara amb gest o mirada si tu li sostens l\'espera amb calma.', 'Repara tot sol amb petició verbal («què?», «una altra vegada») o reformulant.'],
  },
  tea3: {
    read: 'Prem 🔊 perquè la veu de l\'app dicti l\'ordre motora i, MENTRE sona, fes tu una acció contradictòria (la veu diu «toca\'t el nas» i tu et toques el cap). L\'objectiu és que l\'infant segueixi l\'ÀUDIO i inhibeixi la còpia del teu gest.',
    instrHint: 'Inhibició d\'ecopràxia: seguir la veu, no el teu cos. Alterna ordres congruents i incongruents perquè no ho anticipi.',
    move: 'Jugueu a «la veu mana»: l\'ordre sonora val, el gest de l\'adult enganya. Canvieu els papers!',
    ept: ['Copia sempre el teu gest (ecopràxia sistemàtica), encara que senti l\'ordre.', 'Segueix l\'àudio si li recordes «fes-ho com DIU, no com FAIG».', 'Segueix l\'ordre parlada tot sol encara que el teu gest la contradigui.'],
  },
  tea4: {
    read: 'A la meitat del joc que més li estigui agradant, prem «Interrompre ara»: apareixerà una càpsula de moviment abrupta. Observa la transició: la tolera, protesta i continua, o abandona? Tu decideixes el moment exacte; l\'app mai no interromp sola.',
    instrHint: 'Flexibilitat cognitiva davant de transicions no anticipades. El tall és manual i reversible: pots saltar la càpsula a l\'instant si es desborda.',
    move: 'Convertiu la interrupció en joc: «estàtua!», tres respiracions bufades i tornem a l\'activitat.',
    ept: ['Abandona la sessió o es desborda amb la interrupció, fins i tot amb ajuda.', 'Accepta la transició si tu anticipes i acompanyes la càpsula.', 'Tolera el tall, fa la càpsula i reprèn l\'activitat tot sol.'],
  },
  tea5: {
    read: 'Prem 🔊 per sentir les quatre paraules. Tres van juntes i una no: l\'infant toca la que NO va amb les altres. Després apuja A POC A POC el soroll de fons des del Panell de l\'Adult i repeteix amb una altra ronda: anota com canvia l\'encert a cada nivell de soroll.',
    stageLabel: 'Toca la paraula que no va amb les altres',
    intruder: [{ cap: 'gos', emoji: '🐶' }, { cap: 'gat', emoji: '🐱' }, { cap: 'cavall', emoji: '🐴' }, { cap: 'cullera', emoji: '🥄' }], intruderAnswer: 3,
    move: 'Classifiqueu joguines reals en dues capses (animals / coses de menjar) amb música de fons fluixeta.',
    ept: ['Encara no classifica la categoria, ni en silenci.', 'Classifica en silenci, però perd la categoria quan puja el soroll.', 'Manté la classificació correcta fins i tot amb soroll de fons alt.'],
  },
  tea6: {
    read: 'Prem 🔊 per sentir l\'ordre amb DUES pistes alhora (forma I color). Si atén una sola pista i falla (toca el cercle vermell), NO el penalitzis: verbalitza tu la contingència amb naturalitat —«aquest és vermell, però és un cercle; jo vull el quadrat»— i deixa que ho torni a intentar. Premia l\'intent comunicatiu, no la perfecció.',
    stageLabel: 'Toca la fitxa amb les DUES pistes correctes',
    choicePrompt: 'El quadrat vermell.', choiceLabel: 'Escoltar l\'ordre', choiceVoice: 'tutor',
    options: [{ cap: 'quadrat vermell', emoji: '🟥' }, { cap: 'cercle vermell', emoji: '🔴' }, { cap: 'quadrat blau', emoji: '🟦' }],
    optionAnswer: 0,
    move: 'Busca amb dues pistes per casa: «porta\'m una cosa TOVA i BLAVA». Celebreu cada troballa.',
    ept: ['Atén una sola pista (només el color o només la forma), fins i tot amb ajuda.', 'Encerta les dues pistes quan tu li desagregues la contingència («vermell sí, però cercle no»).', 'Respon a les dues pistes simultànies tot sol, a la primera ordre.'],
  },

  // ========================== DISLÈXIA (fonologia) ==========================
  dx1: {
    read: 'Prem 🔊 perquè la veu dicti la sèrie sencera. Tres paraules rimen i una no: l\'infant toca l\'altaveu de la que NO sona com les altres. Sense suport de text: només l\'oïda.',
    stageLabel: 'Escolta la sèrie i toca la que no sona igual',
    intruder: [{ cap: 'gat', emoji: '🔊' }, { cap: 'pat', emoji: '🔊' }, { cap: 'plat', emoji: '🔊' }, { cap: 'taula', emoji: '🔊' }], intruderAnswer: 3,
    move: 'Picada al genoll amb cada paraula que rima; braços en creu quan soni la intrusa.',
    ept: ['Encara no aïlla la paraula que no rima, ni repetint la sèrie.', 'La troba si li repeteixes la sèrie més a poc a poc o en parelles.', 'Aïlla la intrusa tot sol amb una sola escolta de la sèrie.'],
  },
  dx2: {
    read: 'L\'infant llegeix la frase de la pantalla en veu alta, d\'una tirada i sense sil·labejar. Quan ho aconsegueixi amb calma, activa la Gata Distractora i una mica de soroll des del Panell de l\'Adult i repeteix amb una altra ronda: la fluïdesa la valores tu, no l\'app.',
    stageLabel: 'Llegeix la frase d\'una tirada', phrase: 'L\'ÓS MENJA PA', phraseEmoji: '🐻',
    move: 'Llegiu la frase caminant: un pas per paraula, sense aturar-vos entre síl·labes.',
    ept: ['Sil·labeja o s\'atura a cada paraula, fins i tot sense distractors.', 'Llegeix fluid en silenci, però torna a sil·labejar amb la gata o amb el soroll.', 'Manté la lectura fluida fins i tot amb interferència visual i soroll.'],
  },
  dx3: {
    read: 'Prem «Escoltar els sons»: l\'app emet cada so per separat, amb una pausa entre ells. L\'infant els ha d\'unir i dir la paraula sencera. Recull la fusió amb el micro; si el reconeixement falla o va lent, valora-ho tu a sota amb l\'escala.',
    stageLabel: 'Uneix els sons i digues la paraula',
    phonemes: ['mmm', 'a'], phonemeGapMs: 500,
    phrase: 'MÀ', phraseEmoji: '✋',
    move: 'Un salt per cada so i, en dir la paraula sencera, salt d\'estrella!',
    ept: ['Encara no uneix els sons: repeteix fonemes solts o abandona.', 'Fusiona la paraula si li repeteixes els sons amb menys pausa.', 'Uneix els sons i diu la paraula sencera tot sol a la primera.'],
  },
  dx4: {
    read: 'La paraula de la pantalla és inventada: no es pot endevinar, només descodificar. L\'infant la llegeix en veu alta tal com sona. Màxim 5 assajos: en arribar al límit, l\'app proposa una pausa de moviment obligatòria per descarregar.',
    stageLabel: 'Llegeix la paraula inventada tal com sona', phrase: 'MEPOTI', phraseEmoji: '🪄',
    maxTrials: 5,
    move: 'Digueu la pseudoparaula picant de mans una vegada per síl·laba: ME-PO-TI.',
    ept: ['Encara no descodifica la pseudoparaula: la substitueix per paraules reals.', 'La llegeix amb suport sil·labejat de l\'adult o després de diversos models.', 'La descodifica tot sol, sencera i sense convertir-la en una paraula real.'],
  },
  dx5: {
    read: 'Digues a l\'infant quina lletra ha de buscar (la gran del requadre) i que toqui TOTES les que trobi al plafó. Les lletres bessones girades (b/d, p/q) l\'intenten enganyar. Si vols càrrega extra, activa la Gata Distractora des del Panell de l\'Adult.',
    stageLabel: 'Troba totes les lletres objectiu',
    move: 'Dibuixeu la lletra objectiu gegant a l\'aire: la panxa de la «b» mira endavant, com quan llegim.',
    ept: ['Encara confon sistemàticament les lletres girades (b/d, p/q).', 'Troba les lletres objectiu amb pistes («mira cap a on mira la panxa»).', 'Troba totes les lletres objectiu tot sol, sense caure en les girades.'],
  },
  dx6: {
    read: 'L\'infant anomena cada dibuix EN VEU ALTA i en ordre de lectura (d\'esquerra a dreta), tocant-lo en anomenar-lo. L\'estressor ets tu: persegueix-li el dit per la pantalla amb el teu, com un joc d\'acuit. Sense cronòmetres: si el veus accelerat o frustrat, frena el teu dit o atura la persecució.',
    stageLabel: 'Anomena cada dibuix en ordre, sense parar!',
    tiles: [
      { cap: 'sol', emoji: '☀️' }, { cap: 'gat', emoji: '🐱' }, { cap: 'pa', emoji: '🍞' }, { cap: 'flor', emoji: '🌸' },
      { cap: 'pa', emoji: '🍞' }, { cap: 'flor', emoji: '🌸' }, { cap: 'sol', emoji: '☀️' }, { cap: 'gat', emoji: '🐱' },
      { cap: 'gat', emoji: '🐱' }, { cap: 'sol', emoji: '☀️' }, { cap: 'flor', emoji: '🌸' }, { cap: 'pa', emoji: '🍞' },
    ],
    move: 'RAN de casa: recorreu una prestatgeria anomenant cada objecte seguit, com si llegíssiu una línia.',
    ept: ['Encara anomena amb pauses llargues o perd l\'ordre de lectura.', 'Anomena la matriu sencera però s\'encalla en alguns dibuixos o necessita model.', 'Anomena tota la matriu seguida, fluida i en ordre, fins i tot amb la persecució del dit.'],
  },
};

// ---------------------------------------------------------------------------
// Overrides per RONDA (VARIANTS). Substitueixen les rondes base en català.
// ---------------------------------------------------------------------------
export const VARIANTS_CA: Record<string, Partial<Exercise>[]> = {
  ff1: [
    {},
    { tiles: [{ cap: 'ós', emoji: '🐻' }, { cap: 'unglot', emoji: '🐴' }, { cap: 'avió', emoji: '✈️' }] },
    { tiles: [{ cap: 'àguila', emoji: '🦅' }, { cap: 'eriçó', emoji: '🦔' }, { cap: 'ovella', emoji: '🐑' }] },
  ],
  ff2: [
    {},
    { phrase: 'PILOTA', phraseEmoji: '⚽' },
    { phrase: 'PAPALLONA', phraseEmoji: '🦋' },
    { phrase: 'TOMÀQUET', phraseEmoji: '🍅' },
  ],
  ff3: [
    {},
    { fillBefore: 'P', fillAfter: '', fillAnswer: 'A', fillEmoji: '🍞', fillCap: 'pa' },
    { fillBefore: 'LL', fillAfter: 'M', fillAnswer: 'U', fillEmoji: '💡', fillCap: 'llum' },
    { fillBefore: 'M', fillAfter: 'R', fillAnswer: 'A', fillEmoji: '🌊', fillCap: 'mar' },
  ],
  se1: [
    {},
    {
      read: 'Prem 🔊 per sentir el nom de les quatre paraules. Tres són animals i una no. L\'infant toca la que NO va amb les altres.',
      intruder: [{ cap: 'gos', emoji: '🐶' }, { cap: 'gat', emoji: '🐱' }, { cap: 'vaca', emoji: '🐄' }, { cap: 'sabata', emoji: '👟' }],
      intruderAnswer: 3,
    },
    {
      read: 'Prem 🔊 per sentir el nom de les quatre paraules. Tres són per vestir-se i una no. L\'infant toca la que NO va amb les altres.',
      intruder: [{ cap: 'gorra', emoji: '🧢' }, { cap: 'samarreta', emoji: '👕' }, { cap: 'sabata', emoji: '👟' }, { cap: 'plàtan', emoji: '🍌' }],
      intruderAnswer: 3,
    },
  ],
  se2: [
    {},
    {
      choicePrompt: 'Comença per pe, i és una fruita vermella i rodona. Què és?',
      options: [{ cap: 'poma', emoji: '🍎' }, { cap: 'papallona', emoji: '🦋' }, { cap: 'moto', emoji: '🏍️' }], optionAnswer: 0,
    },
    {
      choicePrompt: 'Comença per essa, brilla al cel i ens dona calor. Què és?',
      options: [{ cap: 'sol', emoji: '☀️' }, { cap: 'serp', emoji: '🐍' }, { cap: 'sopa', emoji: '🍲' }], optionAnswer: 0,
    },
    {
      choicePrompt: 'Comença per erra, és petit, morat i ve en penjolls. Què és?',
      options: [{ cap: 'raïm', emoji: '🍇' }, { cap: 'pera', emoji: '🍐' }, { cap: 'síndria', emoji: '🍉' }], optionAnswer: 0,
    },
  ],
  ms1: [
    {},
    {
      read: 'L\'infant toca la targeta on n\'hi ha MOLTES. Després pregunta-li «què són?» perquè ho digui amb la essa final: «flors».',
      plural: { cap: 'flor', capPlural: 'flors', emoji: '🌸', gender: 'f' },
    },
    {
      read: 'L\'infant toca la targeta on n\'hi ha MOLTS. Després pregunta-li «què són?» perquè ho digui acabat en «-os»: «peixos».',
      plural: { cap: 'peix', capPlural: 'peixos', emoji: '🐟', gender: 'm' },
    },
  ],
  ms2: [
    {},
    { choicePrompt: 'àvia', options: [{ cap: 'avi', emoji: '👴' }, { cap: 'àvia', emoji: '👵' }], optionAnswer: 1 },
    { choicePrompt: 'rei', options: [{ cap: 'rei', emoji: '🤴' }, { cap: 'reina', emoji: '👸' }], optionAnswer: 0 },
    { choicePrompt: 'gallina', options: [{ cap: 'gall', emoji: '🐓' }, { cap: 'gallina', emoji: '🐔' }], optionAnswer: 1 },
  ],
  ms3: [
    {},
    {
      parts: [{ role: 'Subjecte', cap: 'nena', emoji: '👧' }, { role: 'Verb', cap: 'llança', emoji: '🤾' }, { role: 'Objecte', cap: 'pilota', emoji: '⚽' }],
      sentence: 'La nena llança la pilota.',
    },
    {
      parts: [{ role: 'Subjecte', cap: 'gos', emoji: '🐶' }, { role: 'Verb', cap: 'menja', emoji: '😋' }, { role: 'Objecte', cap: 'os', emoji: '🦴' }],
      sentence: 'El gos menja l\'os.',
    },
  ],
  pr3: [
    {},
    { emotionFace: '😢', emotionAnswer: 'Tristesa' },
    { emotionFace: '😠', emotionAnswer: 'Enuig' },
    { emotionFace: '🤕', emotionAnswer: 'Dolor' },
  ],
  // ---- Rehabilitació auditiva ACOPROS ----
  ra1: [
    {},
    { choicePrompt: 'Busca l\'ovella.', optionAnswer: 1 },
    { choicePrompt: 'Busca la gallina.', optionAnswer: 3 },
  ],
  ra2: [
    {},
    { choicePrompt: 'boca', options: [{ cap: 'boca', emoji: '👄' }, { cap: 'flor', emoji: '🌸' }, { cap: 'tren', emoji: '🚆' }], optionAnswer: 0 },
    { choicePrompt: 'ós', options: [{ cap: 'ós', emoji: '🐻' }, { cap: 'peu', emoji: '🦶' }, { cap: 'raïm', emoji: '🍇' }], optionAnswer: 0 },
  ],
  ra3: [
    {},
    { choicePrompt: 'gat', optionAnswer: 2 },
    { choicePrompt: 'sabata', optionAnswer: 3 },
  ],
  ra4: [
    {},
    {
      parts: [{ role: 'Primer', cap: 'lluna', emoji: '🌙' }, { role: 'Després', cap: 'gat', emoji: '🐱' }, { role: 'Al final', cap: 'flor', emoji: '🌸' }],
      sentence: 'Toca la lluna, després el gat i al final la flor.',
    },
    {
      parts: [{ role: 'Primer', cap: 'pa', emoji: '🍞' }, { role: 'Després', cap: 'peix', emoji: '🐟' }, { role: 'Al final', cap: 'arbre', emoji: '🌳' }],
      sentence: 'Toca el pa, després el peix i al final l\'arbre.',
    },
  ],
  // ---- TEA ----
  tea5: [
    {},
    {
      read: 'Prem 🔊 per sentir les quatre paraules. Tres es mengen i una no: l\'infant toca la que NO va amb les altres. Apuja el soroll des del Panell de l\'Adult ronda a ronda i anota com canvia l\'encert.',
      intruder: [{ cap: 'poma', emoji: '🍎' }, { cap: 'pa', emoji: '🍞' }, { cap: 'formatge', emoji: '🧀' }, { cap: 'pilota', emoji: '⚽' }],
      intruderAnswer: 3,
    },
    {
      read: 'Prem 🔊 per sentir les quatre paraules. Tres són per vestir-se i una no: l\'infant toca la que NO va amb les altres. Mantén el nivell de soroll que estiguis provant i compara\'l amb les rondes anteriors.',
      intruder: [{ cap: 'gorra', emoji: '🧢' }, { cap: 'samarreta', emoji: '👕' }, { cap: 'sabata', emoji: '👟' }, { cap: 'maduixa', emoji: '🍓' }],
      intruderAnswer: 3,
    },
  ],
  tea6: [
    {},
    {
      choicePrompt: 'El cercle blau.',
      options: [{ cap: 'cercle blau', emoji: '🔵' }, { cap: 'quadrat blau', emoji: '🟦' }, { cap: 'cercle vermell', emoji: '🔴' }],
      optionAnswer: 0,
    },
    {
      choicePrompt: 'L\'estrella groga.',
      options: [{ cap: 'cercle groc', emoji: '🟡' }, { cap: 'estrella groga', emoji: '⭐' }, { cap: 'cor groc', emoji: '💛' }],
      optionAnswer: 1,
    },
  ],
  // ---- Dislèxia ----
  dx1: [
    {},
    { intruder: [{ cap: 'pa', emoji: '🔊' }, { cap: 'ma', emoji: '🔊' }, { cap: 'la', emoji: '🔊' }, { cap: 'sol', emoji: '🔊' }], intruderAnswer: 3 },
    { intruder: [{ cap: 'casa', emoji: '🔊' }, { cap: 'nasa', emoji: '🔊' }, { cap: 'brasa', emoji: '🔊' }, { cap: 'porta', emoji: '🔊' }], intruderAnswer: 3 },
    { intruder: [{ cap: 'sol', emoji: '🔊' }, { cap: 'col', emoji: '🔊' }, { cap: 'gol', emoji: '🔊' }, { cap: 'taula', emoji: '🔊' }], intruderAnswer: 3 },
  ],
  dx2: [
    {},
    { phrase: 'LA NENA BEU SUC', phraseEmoji: '🧃' },
    { phrase: 'EL MEU GAT SALTA ALT', phraseEmoji: '🐱' },
  ],
  dx3: [
    {},
    { phonemes: ['sss', 'ooo', 'lll'], phrase: 'SOL', phraseEmoji: '☀️' },
    { phonemes: ['lll', 'u', 'mmm'], phrase: 'LLUM', phraseEmoji: '💡' },
  ],
  dx4: [
    {},
    { phrase: 'FASLUMO', phraseEmoji: '🌀' },
    { phrase: 'TINELO', phraseEmoji: '🎈' },
    { phrase: 'BURDINA', phraseEmoji: '🎪' },
  ],
  dx5: [
    {},
    { rotationTargets: { target: 'd', grid: ['d', 'b', 'q', 'd', 'p', 'b', 'd', 'q', 'b', 'p', 'd', 'b'] } },
    { rotationTargets: { target: 'p', grid: ['p', 'q', 'b', 'p', 'd', 'q', 'p', 'b', 'q', 'd', 'p', 'q'] } },
    { rotationTargets: { target: 'q', grid: ['q', 'p', 'd', 'q', 'b', 'p', 'q', 'd', 'p', 'b', 'q', 'd'] } },
  ],
  dx6: [
    {},
    {
      tiles: [
        { cap: 'lluna', emoji: '🌙' }, { cap: 'gos', emoji: '🐶' }, { cap: 'casa', emoji: '🏠' }, { cap: 'peix', emoji: '🐟' },
        { cap: 'casa', emoji: '🏠' }, { cap: 'peix', emoji: '🐟' }, { cap: 'lluna', emoji: '🌙' }, { cap: 'gos', emoji: '🐶' },
        { cap: 'gos', emoji: '🐶' }, { cap: 'lluna', emoji: '🌙' }, { cap: 'peix', emoji: '🐟' }, { cap: 'casa', emoji: '🏠' },
      ],
    },
    {
      // RAN de colors: la mateixa sèrie cromàtica bàsica en català.
      tiles: [
        { cap: 'vermell', emoji: '🟥' }, { cap: 'blau', emoji: '🟦' }, { cap: 'verd', emoji: '🟩' }, { cap: 'groc', emoji: '🟨' },
        { cap: 'verd', emoji: '🟩' }, { cap: 'groc', emoji: '🟨' }, { cap: 'vermell', emoji: '🟥' }, { cap: 'blau', emoji: '🟦' },
        { cap: 'blau', emoji: '🟦' }, { cap: 'verd', emoji: '🟩' }, { cap: 'groc', emoji: '🟨' }, { cap: 'vermell', emoji: '🟥' },
      ],
    },
  ],
};

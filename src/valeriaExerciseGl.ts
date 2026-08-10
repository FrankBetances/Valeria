// ============================================================================
// Valeria+ · Audición e Linguaxe en GALEGO — plan Proxecto Nós (GL-2.x)
//
// Ata agora o galego só tiña banco propio en Pares Mínimos, Cápsulas TPR e
// Rutas de Rutina: Audición e Linguaxe (e os módulos TEA e Dislexia, que
// comparten o mesmo banco) caían ao castelán. Nunha sesión en galego iso
// significaba escoitar castelán no medio da terapia ou, cando o texto si era
// galego, escoitalo coa voz do sistema en acento castelán. Aquí cada exercicio
// REAUTORÍZASE en galego: consigna, fichas, prompts, EPT-3 e variante de
// movemento. Locútase coa voz neuronal Celtia (enumerado no corpus de voz).
//
// Adaptacións propias do galego (non son traducións literais):
//   · Vocais (FF-1/FF-3): mesmas cinco vocais, palabras galegas.
//   · Xénero (MS-2): neno/nena, avó/avoa, galo/galiña.
//   · Plural (MS-1): -s / -es como en castelán, pero co determinante galego
//     («un gato» / «moitos gatos»), que constrúe pluralOneLabelFor.
//   · Dislexia: rimas, síntese fonémica e pseudopalabras propias do galego.
//
// ESTADO: ✅ APROBADO PARA PRODUCIÓN (27 de xullo de 2026). Revisión logopédica
// cumprida sobre as consignas, o léxico e os criterios EPT-3 en galego;
// locútase coa voz neuronal Celtia.
//
// Módulo PURO: só importa o tipo Exercise do banco base.
// ============================================================================
import type { Exercise } from './valeriaExerciseBank';

// ---- Constantes de pantalla localizadas (consúmeas o player por variedade) ----
export const EMO_GL: { face: string; label: string }[] = [
  { face: '😀', label: 'Alegría' }, { face: '😢', label: 'Tristeza' },
  { face: '😠', label: 'Enfado' }, { face: '🤕', label: 'Dor' },
];
export const SESSION_DONE_LEAD_GL = 'Sesión completada!';
export const PLURAL_HINT_GL = 'Aí só hai un. Busca onde hai moitos.';
export const EMOTION_PROMPT_GL = 'Como se sente?';
export const TOUCH_IMAGE_HINT_GL = 'Primeiro toca unha imaxe.';

// Veredictos falados do xogo de micrófono (MicPracticeCard), indexados por
// MatchLevel (0 = outra vez, 1 = case, 2 = xenial). Consúmeos a UI vía
// micVerdictSayFor(loc) para que en galego soe o asset de Celtia e non o
// veredicto castelán, que rompía a continuidade da voz galega.
export const MIC_VERDICT_SAY_GL: [string, string, string] = [
  'Imos escoitala outra vez.',
  'Case! Imos intentalo outra vez.',
  'Moi ben! Dixéchelo xenial!',
];

// Pezas fixas de voz (espello de EXERCISE_FIXED_LINES en galego).
export const EXERCISE_FIXED_LINES_GL: { style: 'tutor' | 'child' | 'slow'; text: string }[] = [
  ...MIC_VERDICT_SAY_GL.map((t) => ({ style: 'child' as const, text: t })),
  { style: 'child', text: TOUCH_IMAGE_HINT_GL },
  ...EMO_GL.map((e) => ({ style: 'child' as const, text: e.label })),
  { style: 'child', text: SESSION_DONE_LEAD_GL },
  { style: 'child', text: PLURAL_HINT_GL },
  // Prompt de emocións coas opcións (SpeakButton «Oír as opcións» de PR-3):
  // MESMO literal que constrúe emotionPromptFor(loc) no player, para que
  // resolva o asset neuronal en vez de caer á voz do sistema.
  { style: 'tutor', text: `${EMOTION_PROMPT_GL} ${EMO_GL.map((e) => e.label).join(', ')}?` },
];

// ---------------------------------------------------------------------------
// Overrides por exercicio (rolda 1). Reautorización completa en galego.
// ---------------------------------------------------------------------------
export const EXERCISE_GL: Record<string, Partial<Exercise>> = {
  // ===================== AUDICIÓN (fonética-fonoloxía) =====================
  ff1: {
    read: 'A nena toca unha imaxe para oír o seu nome e despois toca a vocal coa que empeza. A app dille se acertou.',
    stageLabel: 'Une cada imaxe coa súa vocal',
    tiles: [{ cap: 'araña', emoji: '🕷️' }, { cap: 'elefante', emoji: '🐘' }, { cap: 'illa', emoji: '🏝️' }],
    move: 'Debuxade a vocal no aire co brazo ben grande cada vez que acerte.',
    ept: ['Aínda non une a imaxe coa súa vocal, nin con axuda.', 'Acerta a vocal cando o adulto lle dá unha pista.', 'Une cada imaxe coa súa vocal ela soa.'],
  },
  ff2: {
    read: 'Di ti primeiro a palabra, preto da nena e amodo, e anímaa a repetila. A voz da app é só un apoio extra.',
    stageLabel: 'Repite a palabra', phrase: 'ZAPATO', phraseEmoji: '👟',
    move: 'Marchade pola sala pisando forte unha sílaba en cada paso: ZA-PA-TO.',
    ept: ['Aínda non imita o son ou queda moi lonxe da palabra.', 'Repite a palabra despois de oírcha a ti varias veces.', 'Di a palabra ela soa, con todas as vocais claras.'],
  },
  ff3: {
    read: 'Primeiro preme 🔊 para que a nena oia a palabra completa. Despois, que toque a vocal que lle falta á palabra escrita.',
    stageLabel: 'Escoita a palabra e completa a vocal', fillBefore: 'S', fillAfter: 'L', fillAnswer: 'O', fillEmoji: '☀️', fillCap: 'sol',
    move: 'Cando atope a vocal, brazos arriba formando un sol xigante.',
    ept: ['Aínda non atopa a vocal que falta, nin con axuda.', 'Completa a palabra se lle repites o son ou lle dás unha pista.', 'Escoita a palabra e toca a vocal que falta ela soa.'],
  },
  se1: {
    read: 'Preme 🔊 para oír o nome das catro palabras. Tres van xuntas e unha non. A nena toca a que NON vai coas demais.',
    stageLabel: 'Toca a palabra que non vai coas demais',
    intruder: [{ cap: 'mazá', emoji: '🍎' }, { cap: 'plátano', emoji: '🍌' }, { cap: 'uva', emoji: '🍇' }, { cap: 'coche', emoji: '🚗' }], intruderAnswer: 3,
    move: 'Se se come, tocade a barriga; se é a intrusa, salto de estrela!',
    ept: ['Aínda non atopa a palabra que non vai coas demais.', 'Atópaa cando lle fas unha pregunta de axuda («cales se comen?»).', 'Atópaa ela soa e explica por que non vai coas outras.'],
  },
  se2: {
    read: 'Preme 🔊 para oír a adiviña (ou léea ti). A nena responde tocando unha das tres imaxes.',
    stageLabel: 'Escoita a adiviña e toca a resposta',
    choicePrompt: 'Empeza por pe, e é unha froita amarela e longa. Que é?', choiceLabel: 'Oír a adiviña', choiceVoice: 'tutor',
    options: [{ cap: 'plátano', emoji: '🍌' }, { cap: 'pera', emoji: '🍐' }, { cap: 'pelota', emoji: '⚽' }], optionAnswer: 0,
    move: 'Buscade polo cuarto un obxecto real que empece pola mesma letra.',
    ept: ['Aínda non adiviña a resposta, nin con máis pistas.', 'Acerta despois de repetirlle a adiviña ou darlle outra pista.', 'Acerta á primeira, só con oír a adiviña.'],
  },
  se3: {
    materials: 'Un boneco ou peluche e roupa de verdade: gorro, zapatos, camiseta…',
    read: 'Colle o boneco e a roupa. Dálle á nena unha orde cada vez: «Ponlle o gorro ao boneco». Cambia de peza en cada quenda.',
    stageLabel: 'Escoita a orde e viste o boneco', instrHint: 'A nena escoita a túa orde e viste o boneco coa peza correcta.',
    move: 'Xogade a vestirse de verdade: que traia o gorro correndo e que llo poña.',
    ept: ['Aínda non recoñece as pezas nin cumpre a orde.', 'Pon a peza correcta se antes lla ensinas ti unha vez.', 'Escoita a orde e viste o boneco ela soa.'],
  },
  ms1: {
    read: 'A nena toca a tarxeta onde hai MOITOS. Despois pregúntalle «que son?» para que o diga co ese final: «gatos».',
    stageLabel: 'Toca onde hai moitos e dío',
    plural: { cap: 'gato', capPlural: 'gatos', emoji: '🐱', gender: 'm' },
    move: 'Un salto grande se hai UN, moitos saltiños seguidos se hai MOITOS.',
    ept: ['Aínda non distingue entre «un» e «moitos».', 'Di o plural («gatos») se llo dis ti antes.', 'Toca onde hai moitos e di o plural ela soa.'],
  },
  ms2: {
    read: 'Preme 🔊 para oír a palabra. A nena toca a imaxe correcta. Despois xogade ao revés: ti sinalas unha imaxe e ela di a palabra.',
    stageLabel: 'Escoita a palabra e toca a imaxe',
    choicePrompt: 'nena', choiceLabel: 'Oír a palabra', choiceVoice: 'slow',
    options: [{ cap: 'neno', emoji: '👦' }, { cap: 'nena', emoji: '👧' }], optionAnswer: 1,
    move: 'Un lado da sala é "neno" e o outro "nena": corre ao lado correcto!',
    ept: ['Aínda confunde as palabras de rapaz e de rapaza.', 'Acerta se lle lembras a fin da palabra: «nen-o», «nen-a».', 'Toca a imaxe e di a palabra correcta ela soa.'],
  },
  ms3: {
    read: 'Preme 🔊 para que a nena oia a frase. Despois, que toque as palabras en orde para construíla: quen, que fai e que cousa.',
    stageLabel: 'Escoita a frase e ordena as palabras',
    parts: [{ role: 'Suxeito', cap: 'neno', emoji: '👦' }, { role: 'Verbo', cap: 'come', emoji: '😋' }, { role: 'Obxecto', cap: 'mazá', emoji: '🍎' }], sentence: 'O neno come a mazá.',
    move: 'Teatralizade a frase: a nena fai de actriz e "come" unha mazá imaxinaria.',
    ept: ['Só di palabras soltas («neno», «mazá»).', 'Constrúe a frase se ti a axudas a empezala.', 'Ordena as palabras e di a frase completa ela soa.'],
  },
  pr1: {
    read: 'Sinala cousas do cuarto e pregúntalle: «Que é isto?». Grava ou escribe abaixo o que responda a nena.',
    instrHint: 'Primeiro responde ela ás túas preguntas; logo anímaa a preguntarche a ti «que é isto?».',
    capture: 'Pregúntalle «que é isto?» sinalando un obxecto. Grava co micro ou escribe a súa resposta.',
    move: 'Paseade pola casa coma exploradores sinalando obxectos: "que é isto?" en cada parada.',
    ept: ['Aínda non responde á pregunta.', 'Responde se primeiro lle dás ti un exemplo de resposta.', 'Responde ela soa e mesmo che fai preguntas a ti.'],
  },
  pr2: {
    materials: 'Un peluche ou boneco',
    read: 'O peluche está durmido: falade moi baixiño para non espertalo. Cando «esperte», volvede á voz normal. Rexistra abaixo como o fai.',
    instrHint: 'Peluche durmido = voz baixiña. Peluche esperto = voz normal. A nena debe cambiar a súa voz co xogo.',
    scenes: [
      { emoji: '😴', label: 'Durmido → voz baixiña', say: 'Shhh… o peluche está durmido. Falamos moi moi baixiño.' },
      { emoji: '😀', label: 'Esperto → voz normal', say: 'Xa espertou o peluche! Agora falamos con voz normal.' },
    ],
    capture: 'Grava ou escribe como falou a nena: baixou a voz co peluche durmido?',
    move: 'Camiñade de puntas falando baixiño; ao sinal, voz normal e paso forte!',
    ept: ['Fala igual de forte aínda que o peluche durma.', 'Baixa a voz cando ti llo lembras.', 'Cambia ela soa entre voz baixiña e voz normal segundo o xogo.'],
  },
  pr3: {
    read: 'Mira a cara grande coa nena. Preme 🔊 se quere oír as opcións. Ela toca como se sente a cara.',
    stageLabel: 'Recoñece a emoción', emotionFace: '😀', emotionAnswer: 'Alegría',
    move: 'Imitade a emoción con todo o corpo: cara, brazos e postura de estatua.',
    ept: ['Aínda non recoñece como se sente a cara.', 'Acerta a emoción se lle dás pistas («mira a súa boca»).', 'Di a emoción ela soa e explica por que se sente así.'],
  },
  pr4: {
    read: 'Tapa a boca e di unha palabra case sen voz. Se a nena non a entende, debe pedirche: «que?» ou «como?». Iso é o que practicamos: pedir que llo repitan.',
    instrHint: 'O obxectivo NON é repetir palabras: é que a nena aprenda a pedir que lle repitas o que non entendeu.',
    micTarget: 'como', micAlt: ['que'], micPrompt: 'Cando non te entenda, preme o micro e que pida: «como?» ou «que?»',
    move: 'Murmura unha orde desde lonxe; se non se entende, que veña correndo e pida "que?".',
    ept: ['Queda calada ou abandona cando non entende algo.', 'Pide «que?» se ti lle lembras que o pode pedir.', 'Pide «que?» ou «como?» ela soa cando non entende.'],
  },

  // ================== REHABILITACIÓN AUDITIVA (ACOPROS) ==================
  ra1: {
    read: 'Primeiro en silencio: dille coa túa voz normal «busca a vaca» e que a toque. Cando acerte tranquila, sobe POUCO A POUCO o ruído de fondo desde o Panel do Adulto (abaixo) e repite con outro animal. A túa voz é o sinal: non berres nin esaxeres; se a ves fatigada, baixa o ruído.',
    stageLabel: 'Escoita a voz do adulto e toca o animal',
    choicePrompt: 'Busca a vaca.', choiceLabel: 'Apoio: oír a orde', choiceVoice: 'tutor',
    options: [{ cap: 'vaca', emoji: '🐄' }, { cap: 'ovella', emoji: '🐑' }, { cap: 'cabalo', emoji: '🐴' }, { cap: 'galiña', emoji: '🐔' }],
    optionAnswer: 0,
    move: 'Granxa na casa: escondede os animais de peluche e buscádeos coa música posta baixiña.',
    ept: ['Aínda non atopa o animal pedido, nin en silencio.', 'Acerta en silencio, pero perde a orde ao subir o ruído.', 'Atopa o animal pedido mesmo con ruído de fondo alto.'],
  },
  ra2: {
    read: 'PRIMEIRO sen voz: di a palabra só movendo os beizos, amodo e coa túa cara ben iluminada, e que a nena toque a imaxe lendo os teus beizos. DESPOIS preme 🔊 para devolverlle o son e confirmar. Non a corrixas cun «non»: repite o modelo con voz e beizos á vez.',
    stageLabel: 'Le os beizos do adulto e toca a imaxe',
    choicePrompt: 'pato', choiceLabel: 'Despois: oír a palabra con voz', choiceVoice: 'slow',
    options: [{ cap: 'pato', emoji: '🦆' }, { cap: 'lúa', emoji: '🌙' }, { cap: 'sol', emoji: '☀️' }],
    optionAnswer: 0,
    move: 'Xogade ao espello mudo: un di unha palabra sen voz e o outro adivíñaa. Cambiade os papeis!',
    ept: ['Aínda non recoñece ningunha palabra só polos beizos.', 'Recoñécea se despois lle dás o modelo con voz e beizos xuntos.', 'Recoñece a palabra ela soa, unicamente lendo os beizos.'],
  },
  ra3: {
    read: 'Catro palabras que soan case igual. Di ti a palabra obxectivo con voz normal e que a toque. En cada rolda faino un pouco máis difícil CO TEU CORPO: baixa o volume da túa voz ou afástate un paso máis. A app non toca o volume: o estresor es ti, e ti decides cando parar.',
    stageLabel: 'Escoita a palabra e toca a imaxe correcta',
    choicePrompt: 'prato', choiceLabel: 'Apoio: oír a palabra', choiceVoice: 'slow',
    options: [{ cap: 'prato', emoji: '🍽️' }, { cap: 'pato', emoji: '🦆' }, { cap: 'gato', emoji: '🐱' }, { cap: 'zapato', emoji: '👟' }],
    optionAnswer: 0,
    move: 'Teléfono viaxeiro: murmúralle a palabra ao oído desde cada esquina do cuarto.',
    ept: ['Aínda confunde as palabras parecidas, mesmo con voz próxima e clara.', 'Acerta con voz normal e preto, pero falla ao baixar a voz ou afastarte.', 'Distingue a palabra correcta mesmo con voz baixiña ou desde lonxe.'],
  },
  ra4: {
    read: 'Preme 🔊 para que oia a orde COMPLETA de tres pasos. Despois, cadeado humano: suxeita as súas mans con suavidade e conta ata 5 en silencio antes de deixala tocar. Esa espera obriga a gardar a orde na memoria, non a baleirala correndo.',
    stageLabel: 'Escoita os tres pasos, agarda e tócaos en orde',
    parts: [{ role: 'Primeiro', cap: 'sol', emoji: '☀️' }, { role: 'Logo', cap: 'can', emoji: '🐶' }, { role: 'Despois', cap: 'casa', emoji: '🏠' }],
    sentence: 'Toca o sol, logo o can e despois a casa.',
    move: 'Circuíto de ordes: «toca a porta, logo o sofá e despois a ventá», coa mesma espera de 5 segundos.',
    ept: ['Aínda non retén a secuencia: toca o primeiro que ve.', 'Completa a secuencia se lle repites a orde ou lle lembras un paso.', 'Garda os tres pasos durante a espera e tócaos en orde ela soa.'],
  },
  ra5: {
    materials: 'Unha campaíña, unhas chaves ou un axóuxere (algo que soe claro)',
    read: 'Ponte DETRÁS da nena, onde non te vexa. Fai soar o obxecto a un lado (esquerda ou dereita) e que sinale co brazo de onde veu o son ANTES de virarse a mirar. Alterna os lados sen seguir un patrón fixo.',
    instrHint: 'Escoita binaural: de que lado vén o son? Sinalar antes de mirar. Clave en usuarios de implante unilateral.',
    capture: 'Anota que lado acerta máis e cal lle custa (p. ex. «acerta case sempre á dereita, dubida á esquerda»).',
    move: 'Marco Polo sonoro: cos ollos pechados, que camiñe cara á campaíña que soa.',
    ept: ['Aínda non localiza o lado do son: sinala ao chou ou non responde.', 'Acerta o lado se repites o son varias veces ou é moi forte.', 'Sinala o lado correcto á primeira, mesmo con sons suaves.'],
  },

  // ============================ LINGUAXE ============================
  atencion_conjunta: {
    read: 'Chama pola nena polo seu nome e fai burbullas. Busca a súa mirada e o contacto visual.',
    instrHint: 'Desenvolve contacto visual, seguimento da mirada e resposta ao nome.',
    move: 'Perseguide e rebentade burbullas xuntos: unha burbulla, unha mirada.',
    ept: ['Precisa axuda física para soster a mirada un intre.', 'Responde ao seu nome despois de chamala varias veces.', 'Mírate ela soa e segue a túa mirada.'],
    levels: [
      { label: 'Inicial', instrIcon: '🫧', read: 'Achega as burbullas moi preto da túa cara e chama polo seu nome. Busca un contacto visual breve, aínda que sexa dun intre.', instrHint: 'Estímulo de alto interese e moi próximo. Calquera mirada breve conta.' },
      { label: 'Intermedio', instrIcon: '👀', read: 'Fai burbullas a un brazo de distancia. Chama polo seu nome e sinala co dedo cara ás burbullas.', instrHint: 'Favorece o seguimento da mirada cara a onde sinala o titor.' },
      { label: 'Avanzado', instrIcon: '🙋', read: 'Desde o outro lado do cuarto, chama polo seu nome unha soa vez sen estímulo motivador á vista.', instrHint: 'Busca resposta espontánea ao nome sen apoio visual nin proximidade.' },
    ],
  },
  imitacion: {
    read: 'Fai un xesto (aplaudir, tocar o tambor) e anímaa a imitarte. Agora unha sílaba: "pa-pa".',
    instrHint: 'Imita xestos motores grosos e vocalizacións simples en espello.',
    move: 'Espello humano: imitade xestos grandes (brazos, saltos, xiros) por quendas.',
    ept: ['Aínda non copia xestos nin sons.', 'Imita xestos ou sons soltos coa axuda do adulto.', 'Repite xestos e sons xusto despois de velos, coma un espello.'],
    levels: [
      { label: 'Inicial', instrIcon: '👏', read: 'Aplaude amodo fronte a ela e guía as súas mans a primeira vez. Repite o xesto só.', instrHint: 'Xesto motor groso illado, con axuda física se é necesario.' },
      { label: 'Intermedio', instrIcon: '🥁', read: 'Toca o tambor dúas veces e di "pa-pa". Agarda a que imite o xesto ou o son sen axuda física.', instrHint: 'Secuencia curta de xesto + sílaba, sen apoio físico, só modelo visual.' },
      { label: 'Avanzado', instrIcon: '🪞', read: 'Combina un xesto e unha sílaba nova ("ta-ta" + saltar) e observa se o imita en espello, inmediatamente e sen repetir o modelo.', instrHint: 'Imitación inmediata dunha combinación nova, sen repetición do modelo.' },
    ],
  },
  comprension: {
    read: 'Dálle unha orde dun paso: "Dáme a pelota". Pídelle que sinale partes do corpo.',
    instrHint: 'Comprende instrucións dun paso e identifica partes do corpo e obxectos.',
    move: 'Xogade a "Simón di" con ordes dun paso e partes do corpo.',
    ept: ['Non obedece instrucións nin sinala elementos solicitados.', 'Executa a orde coa axuda de xestos de sinalamento.', 'Comprende a instrución puramente verbal e execútaa.'],
    levels: [
      { label: 'Inicial', instrIcon: '🤲', read: 'Dille "Dáme a pelota" mentres sinalas a pelota co dedo.', instrHint: 'Orde dun paso con apoio xestual directo do titor.' },
      { label: 'Intermedio', instrIcon: '🧍', read: 'Pídelle "Toca o nariz" e "Toca a cabeza" sen xestos de apoio.', instrHint: 'Identificación de partes do corpo só con instrución verbal.' },
      { label: 'Avanzado', instrIcon: '🧩', read: 'Dille sen ningún xesto: "Dáme a pelota e séntate". Observa se executa os dous pasos en orde.', instrHint: 'Orde verbal de dous pasos, sen ningún apoio xestual.' },
    ],
  },
  expresion: {
    read: 'Como fai o can? "Guau". Anímaa a nomear e a pedir: "quero auga".',
    stageLabel: 'Evoca e nomea', phrase: 'QUERO AUGA', phraseEmoji: '💧',
    ept: ['Só usa xestos ou balbucidos para pedir o que precisa.', 'Di palabras sinxelas despois de oírchas a ti.', 'Di palabras e frases de dúas palabras ela soa.'],
    move: 'Carreira ata a billa: só se abre se di a palabra máxica "auga".',
    levels: [
      { label: 'Inicial', instrIcon: '🐶', read: 'Amósalle o boneco do can e modela: "Guau". Agarda a que repita a onomatopea.', instrHint: 'Imitación directa dunha onomatopea tras o modelo do adulto.' },
      { label: 'Intermedio', instrIcon: '🏷️', read: 'Amósalle un vaso de auga sen dicir nada e pregúntalle: "Que é isto?".', instrHint: 'Nomear un obxecto familiar de forma espontánea, sen modelo previo.' },
      { label: 'Avanzado', instrIcon: '🗣️', read: 'Ofrécelle o vaso baleiro e agarda a que pida espontaneamente "quero auga" combinando as dúas palabras.', instrHint: 'Combinación espontánea de dúas palabras nunha petición funcional.' },
    ],
  },
  comunicacion_funcional: {
    read: 'Para de facer algo divertido e agarda. Anímaa a pedir "máis" ou "axuda".',
    instrHint: 'Pide xogo ou axuda con palabras, xestos ou signos.',
    move: 'Bambán, avión ou cóxegas: para o xogo e agarda a que pida "máis".',
    ept: ['Frústrase ou non intenta comunicarse cando algo non sae.', 'Pide axuda ou "máis" se ti lle dis antes a palabra.', 'Pide con palabras ou signos, ela soa e con intención clara.'],
    levels: [
      { label: 'Inicial', instrIcon: '🤚', read: 'Detén un xogo divertido (cóxegas, bambán) e modela o xesto + palabra "máis". Axúdaa a imitalo.', instrHint: 'Petición de "máis" con xesto e palabra modelados polo titor.' },
      { label: 'Intermedio', instrIcon: '🔒', read: 'Dálle un bote pechado con algo que lle guste dentro e agarda. Se se frustra, suxire a media voz "axuda".', instrHint: 'Petición de "axuda" ante un obstáculo, con pista verbal parcial.' },
      { label: 'Avanzado', instrIcon: '💬', read: 'Crea outra situación de necesidade (xoguete fóra do alcance) sen dar ningunha pista e agarda a petición espontánea.', instrHint: 'Inicio espontáneo da petición, sen pistas verbais nin xestuais.' },
    ],
  },
  regulacion_conductual: {
    read: 'Avisa do cambio de actividade coa axenda visual e agarda con tranquilidade.',
    instrHint: 'Anticipa e acepta o cambio de actividade con apoio visual e fichas.',
    move: 'Marchade xuntos cara á seguinte actividade cantando a canción das transicións.',
    ept: ['Enfádase ou descontrólase nos cambios de actividade.', 'Acepta o cambio se gaña unha ficha como premio.', 'Cambia de actividade tranquila e por si mesma.'],
    levels: [
      { label: 'Inicial', instrIcon: '🖼️', read: 'Amósalle a imaxe da seguinte actividade e fai unha conta atrás visual de 5 a 1 antes de cambiar.', instrHint: 'Anticipación con apoio visual forte e conta atrás.' },
      { label: 'Intermedio', instrIcon: '🎫', read: 'Avisa do cambio unha soa vez e ofrece unha ficha ao rematar a actividade con calma.', instrHint: 'Acepta o cambio coa axuda de fichas-premio.' },
      { label: 'Avanzado', instrIcon: '📅', read: 'Deixa que consulte soa a súa axenda visual e faga a transición sen que teñas que avisala.', instrHint: 'Transición autónoma seguindo a axenda, sen aviso directo do titor.' },
    ],
  },
  interaccion_social: {
    read: 'Xogade por quendas: "Agora ti, agora eu". Inicia un xogo simbólico sinxelo.',
    instrHint: 'Respecta quendas, inicia xogo simbólico e responde afectivamente.',
    move: 'Pasádevos unha pelota rodando: só fala quen a ten. Quenda e movemento!',
    ept: ['Xoga soa e rexeita compartir quendas.', 'Acepta quendas e participa se ti guías o xogo.', 'Empeza xogos con outros e mantén o dá e toma.'],
    levels: [
      { label: 'Inicial', instrIcon: '🔁', read: 'Amontoa un bloque e dille "agora ti". Axúdaa fisicamente se non responde á quenda.', instrHint: 'Quenda simple guiada, con axuda física se é necesario.' },
      { label: 'Intermedio', instrIcon: '🍽️', read: 'Ofrécelle un boneco e unha culler; modela "imos darlle de comer" e agarda a que continúe o xogo simbólico.', instrHint: 'Inicio de xogo simbólico breve co apoio do modelo.' },
      { label: 'Avanzado', instrIcon: '🎭', read: 'Deixa que propoña ela un xogo de quendas ou simbólico e mantén o intercambio sen dirixilo.', instrHint: 'Reciprocidade espontánea: a nena inicia e mantén o intercambio.' },
    ],
  },

  // ============================ TEA (PRT + TCC) ============================
  tea1: {
    read: 'Coloca un obxecto moi motivador entre a túa cara e a nena. Agarda 3 segundos ANTES de dar ningunha pista (instigación retardada): o botón do selo desbloquéase só tras esa espera. Preme o Selo Dobre UNICAMENTE cando haxa contacto visual real contigo, non co obxecto.',
    instrHint: 'Triangula a atención: obxecto → a túa mirada → a nena. O selo retense ata o contacto visual real; a espera de 3 s é a instigación retardada (Time Delay).',
    move: 'Esconde o obxecto tras as costas e camiña amodo: que che busque a mirada antes de amosarllo.',
    ept: ['Aínda non alterna a mirada entre o obxecto e a túa cara, nin con espera.', 'Mírate se retés o obxecto xunto á túa cara e lle dás unha pista.', 'Alterna a mirada obxecto→ti ela soa, dentro da espera de 3 segundos.'],
  },
  tea2: {
    read: 'Este exercicio usa o Quebre Pragmático do Panel do Adulto: conxelas a app a propósito (orde absurda ou silencio) e observas como repara a nena a comunicación. É un estresor MANUAL e reversible ao instante: ti decides cando empeza e cando acaba. Ábreo abaixo no Panel do Adulto e rexistra a estratexia que uses.',
    instrHint: 'A "frustración útil" é 100 % humana: a app nunca interrompe soa. Rexistra a estratexia de reparación (pedir repetición, xesto, reformular…) no propio quebre.',
    move: 'Tras cada reparación lograda, celebrádeo cun choque de mans ben esaxerado.',
    ept: ['Non rexistra o quebre: illa­se ou desbórdase sen buscar reparar.', 'Repara con xesto ou mirada se ti lle sostés a espera con calma.', 'Repara ela soa con petición verbal («que?», «outra vez») ou reformulando.'],
  },
  tea3: {
    read: 'Preme 🔊 para que a voz da app dite a orde motora e, MENTRES soa, fai ti unha acción contraditoria (a voz di «toca o nariz» e ti tocas a cabeza). O obxectivo é que a nena siga o AUDIO e iniba a copia do teu xesto.',
    instrHint: 'Inhibición de ecopraxia: seguir a voz, non o teu corpo. Alterna ordes congruentes e incongruentes para que non anticipe.',
    move: 'Xogade a «a voz manda»: a orde sonora vale, o xesto do adulto engana. Cambiade os papeis!',
    ept: ['Copia sempre o teu xesto (ecopraxia sistemática), aínda que oia a orde.', 'Segue o audio se lle lembras «faino como DI, non como FAGO».', 'Segue a orde falada ela soa aínda que o teu xesto a contradiga.'],
  },
  tea4: {
    read: 'A metade do xogo que máis lle estea gustando, preme «Interromper agora»: aparecerá unha cápsula de movemento abrupta. Observa a transición: tólera­a, protesta e segue, ou abandona? Ti decides o momento exacto; a app xamais interrompe soa.',
    instrHint: 'Flexibilidade cognitiva ante transicións non anticipadas. O corte é manual e reversible: podes saltar a cápsula ao instante se se desborda.',
    move: 'Convertede a interrupción en xogo: «estatua!», tres respiracións sopradas e de volta á actividade.',
    ept: ['Abandona a sesión ou desbórdase coa interrupción, aínda con axuda.', 'Acepta a transición se ti anticipas e acompañas a cápsula.', 'Tolera o corte, fai a cápsula e retoma a actividade ela soa.'],
  },
  tea5: {
    read: 'Preme 🔊 para oír as catro palabras. Tres van xuntas e unha non: a nena toca a que NON vai coas demais. Despois sobe POUCO A POUCO o ruído de fondo desde o Panel do Adulto e repite con outra rolda: anota como cambia o acerto con cada nivel de ruído.',
    stageLabel: 'Toca a palabra que non vai coas demais',
    intruder: [{ cap: 'can', emoji: '🐶' }, { cap: 'gato', emoji: '🐱' }, { cap: 'cabalo', emoji: '🐴' }, { cap: 'culler', emoji: '🥄' }], intruderAnswer: 3,
    move: 'Clasificade xoguetes reais en dúas caixas (animais / cousas de comer) con música de fondo baixiña.',
    ept: ['Aínda non clasifica a categoría, nin en silencio.', 'Clasifica en silencio, pero perde a categoría ao subir o ruído.', 'Mantén a clasificación correcta mesmo con ruído de fondo alto.'],
  },
  tea6: {
    read: 'Preme 🔊 para oír a orde con DÚAS pistas á vez (forma E cor). Se atende a unha soa pista e falla (toca o círculo vermello), NON a penalices: verbaliza ti a continxencia con naturalidade —«ese é vermello, pero é un círculo; eu quero o cadrado»— e deixa que o intente outra vez. Premia o intento comunicativo, non a perfección.',
    stageLabel: 'Toca a ficha coas DÚAS pistas correctas',
    choicePrompt: 'O cadrado vermello.', choiceLabel: 'Oír a orde', choiceVoice: 'tutor',
    options: [{ cap: 'cadrado vermello', emoji: '🟥' }, { cap: 'círculo vermello', emoji: '🔴' }, { cap: 'cadrado azul', emoji: '🟦' }],
    optionAnswer: 0,
    move: 'Busca con dúas pistas pola casa: «tráeme algo BRANDO e AZUL». Celebrade cada achado.',
    ept: ['Atende a unha soa pista (só a cor ou só a forma), mesmo con axuda.', 'Acerta as dúas pistas cando ti lle desagregas a continxencia («vermello si, pero círculo non»).', 'Responde ás dúas pistas simultáneas ela soa, á primeira orde.'],
  },

  // ========================== DISLEXIA (fonoloxía) ==========================
  dx1: {
    read: 'Preme 🔊 para que a voz dite a serie completa. Tres palabras riman e unha non: a nena toca o altofalante da que NON soa como as demais. Sen apoio de texto: só o oído.',
    stageLabel: 'Escoita a serie e toca a que non soa igual',
    intruder: [{ cap: 'gato', emoji: '🔊' }, { cap: 'pato', emoji: '🔊' }, { cap: 'rato', emoji: '🔊' }, { cap: 'mesa', emoji: '🔊' }], intruderAnswer: 3,
    move: 'Palmada no xeonllo con cada palabra que rima; brazos en cruz cando soe a intrusa.',
    ept: ['Aínda non illa a palabra que non rima, nin repetindo a serie.', 'Atópaa se lle repites a serie máis amodo ou en parellas.', 'Illa a intrusa ela soa cunha soa escoita da serie.'],
  },
  dx2: {
    read: 'A nena le a frase da pantalla en voz alta, dun tirón e sen silabear. Cando o consiga en calma, activa a Gata Distractora e algo de ruído desde o Panel do Adulto e repite con outra rolda: valora ti a fluidez, non a app.',
    stageLabel: 'Le a frase dun tirón', phrase: 'O OSO COME PAN', phraseEmoji: '🐻',
    move: 'Lede a frase camiñando: un paso por palabra, sen pararse entre sílabas.',
    ept: ['Silabea ou detense en cada palabra, mesmo sen distractores.', 'Le fluído en silencio, pero volve silabear coa gata ou co ruído.', 'Mantén a lectura fluída mesmo con interferencia visual e ruído.'],
  },
  dx3: {
    read: 'Preme «Oír os sons»: a app emite cada son por separado, cunha pausa entre eles. A nena debe unilos e dicir a palabra completa. Recolle a fusión co micro; se o recoñecemento falla ou vai lento, valora ti abaixo coa escala.',
    stageLabel: 'Une os sons e di a palabra',
    phonemes: ['mmm', 'a', 'nnn'], phonemeGapMs: 500,
    phrase: 'MAN', phraseEmoji: '✋',
    move: 'Un salto por cada son e, ao dicir a palabra enteira, salto de estrela!',
    ept: ['Aínda non une os sons: repite fonemas soltos ou abandona.', 'Fusiona a palabra se lle repites os sons con menos pausa.', 'Une os sons e di a palabra completa ela soa á primeira.'],
  },
  dx4: {
    read: 'A palabra da pantalla é inventada: non se pode adiviñar, só descodificar. A nena léea en voz alta tal cal soa. Máximo 5 ensaios: ao chegar ao límite, a app propón unha pausa de movemento obrigatoria para descargar.',
    stageLabel: 'Le a palabra inventada tal cal soa', phrase: 'MEPOTI', phraseEmoji: '🪄',
    maxTrials: 5,
    move: 'Dicide a pseudopalabra dando unha palmada por sílaba: ME-PO-TI.',
    ept: ['Aínda non descodifica a pseudopalabra: substitúea por palabras reais.', 'Léea con apoio silabeado do adulto ou tras varios modelos.', 'Descodifícaa ela soa, completa e sen convertela nunha palabra real.'],
  },
  dx5: {
    read: 'Dille á nena que letra buscar (a grande do recadro) e que toque TODAS as que atope no panel. As letras xemelgas xiradas (b/d, p/q) intentan enganala. Se queres carga extra, activa a Gata Distractora desde o Panel do Adulto.',
    stageLabel: 'Atopa todas as letras obxectivo',
    move: 'Debuxade a letra obxectivo xigante no aire: a barriga do «b» mira cara adiante, coma ao ler.',
    ept: ['Aínda confunde sistematicamente as letras xiradas (b/d, p/q).', 'Atopa as letras obxectivo con pistas («mira cara a onde mira a barriga»).', 'Atopa todas as letras obxectivo ela soa, sen caer nas xiradas.'],
  },
  dx6: {
    read: 'A nena nomea cada debuxo EN VOZ ALTA e en orde de lectura (de esquerda a dereita), tocándoo ao nomealo. O estresor es ti: persegue o seu dedo pola pantalla co teu, coma un xogo de pilla-pilla. Sen cronómetros: se a ves acelerada ou frustrada, frea o teu dedo ou detén a persecución.',
    stageLabel: 'Nomea cada debuxo en orde, sen parar!',
    tiles: [
      { cap: 'sol', emoji: '☀️' }, { cap: 'gato', emoji: '🐱' }, { cap: 'pan', emoji: '🍞' }, { cap: 'flor', emoji: '🌸' },
      { cap: 'pan', emoji: '🍞' }, { cap: 'flor', emoji: '🌸' }, { cap: 'sol', emoji: '☀️' }, { cap: 'gato', emoji: '🐱' },
      { cap: 'gato', emoji: '🐱' }, { cap: 'sol', emoji: '☀️' }, { cap: 'flor', emoji: '🌸' }, { cap: 'pan', emoji: '🍞' },
    ],
    move: 'RAN da casa: percorrede unha estantería nomeando cada obxecto seguido, coma lendo unha liña.',
    ept: ['Aínda nomea con pausas longas ou perde a orde de lectura.', 'Nomea a matriz completa pero atáscase nalgúns debuxos ou precisa modelo.', 'Nomea toda a matriz seguida, fluída e en orde, aínda coa persecución do dedo.'],
  },
};

// ---------------------------------------------------------------------------
// Overrides por RONDA (VARIANTS). Substitúen ás roldas base en galego.
// ---------------------------------------------------------------------------
export const VARIANTS_GL: Record<string, Partial<Exercise>[]> = {
  ff1: [
    {},
    { tiles: [{ cap: 'oso', emoji: '🐻' }, { cap: 'uvas', emoji: '🍇' }, { cap: 'avión', emoji: '✈️' }] },
    { tiles: [{ cap: 'aguia', emoji: '🦅' }, { cap: 'ourizo', emoji: '🦔' }, { cap: 'ovella', emoji: '🐑' }] },
  ],
  ff2: [
    {},
    { phrase: 'PELOTA', phraseEmoji: '⚽' },
    { phrase: 'BOLBORETA', phraseEmoji: '🦋' },
    { phrase: 'TOMATE', phraseEmoji: '🍅' },
  ],
  ff3: [
    {},
    { fillBefore: 'P', fillAfter: 'N', fillAnswer: 'A', fillEmoji: '🍞', fillCap: 'pan' },
    { fillBefore: 'L', fillAfter: 'Z', fillAnswer: 'U', fillEmoji: '💡', fillCap: 'luz' },
    { fillBefore: 'M', fillAfter: 'R', fillAnswer: 'A', fillEmoji: '🌊', fillCap: 'mar' },
  ],
  se1: [
    {},
    {
      read: 'Preme 🔊 para oír o nome das catro palabras. Tres son animais e unha non. A nena toca a que NON vai coas demais.',
      intruder: [{ cap: 'can', emoji: '🐶' }, { cap: 'gato', emoji: '🐱' }, { cap: 'vaca', emoji: '🐄' }, { cap: 'zapato', emoji: '👟' }],
      intruderAnswer: 3,
    },
    {
      read: 'Preme 🔊 para oír o nome das catro palabras. Tres son para vestirse e unha non. A nena toca a que NON vai coas demais.',
      intruder: [{ cap: 'gorro', emoji: '🧢' }, { cap: 'camiseta', emoji: '👕' }, { cap: 'zapato', emoji: '👟' }, { cap: 'plátano', emoji: '🍌' }],
      intruderAnswer: 3,
    },
  ],
  se2: [
    {},
    {
      choicePrompt: 'Empeza por eme, e é unha froita vermella e redonda. Que é?',
      options: [{ cap: 'mazá', emoji: '🍎' }, { cap: 'bolboreta', emoji: '🦋' }, { cap: 'moto', emoji: '🏍️' }], optionAnswer: 0,
    },
    {
      choicePrompt: 'Empeza por ese, brilla no ceo e dános calor. Que é?',
      options: [{ cap: 'sol', emoji: '☀️' }, { cap: 'serpe', emoji: '🐍' }, { cap: 'sopa', emoji: '🍲' }], optionAnswer: 0,
    },
    {
      choicePrompt: 'Empeza por u, é pequena, morada e vén en acios. Que é?',
      options: [{ cap: 'uva', emoji: '🍇' }, { cap: 'pera', emoji: '🍐' }, { cap: 'sandía', emoji: '🍉' }], optionAnswer: 0,
    },
  ],
  ms1: [
    {},
    {
      read: 'A nena toca a tarxeta onde hai MOITAS. Despois pregúntalle «que son?» para que o diga co ese final: «flores».',
      plural: { cap: 'flor', capPlural: 'flores', emoji: '🌸', gender: 'f' },
    },
    {
      read: 'A nena toca a tarxeta onde hai MOITOS. Despois pregúntalle «que son?» para que o diga rematado en «-es»: «peixes».',
      plural: { cap: 'peixe', capPlural: 'peixes', emoji: '🐟', gender: 'm' },
    },
  ],
  ms2: [
    {},
    { choicePrompt: 'avoa', options: [{ cap: 'avó', emoji: '👴' }, { cap: 'avoa', emoji: '👵' }], optionAnswer: 1 },
    { choicePrompt: 'rei', options: [{ cap: 'rei', emoji: '🤴' }, { cap: 'raíña', emoji: '👸' }], optionAnswer: 0 },
    { choicePrompt: 'galiña', options: [{ cap: 'galo', emoji: '🐓' }, { cap: 'galiña', emoji: '🐔' }], optionAnswer: 1 },
  ],
  ms3: [
    {},
    {
      parts: [{ role: 'Suxeito', cap: 'nena', emoji: '👧' }, { role: 'Verbo', cap: 'lanza', emoji: '🤾' }, { role: 'Obxecto', cap: 'pelota', emoji: '⚽' }],
      sentence: 'A nena lanza a pelota.',
    },
    {
      parts: [{ role: 'Suxeito', cap: 'can', emoji: '🐶' }, { role: 'Verbo', cap: 'come', emoji: '😋' }, { role: 'Obxecto', cap: 'óso', emoji: '🦴' }],
      sentence: 'O can come o óso.',
    },
  ],
  pr3: [
    {},
    { emotionFace: '😢', emotionAnswer: 'Tristeza' },
    { emotionFace: '😠', emotionAnswer: 'Enfado' },
    { emotionFace: '🤕', emotionAnswer: 'Dor' },
  ],
  // ---- Rehabilitación auditiva ACOPROS ----
  ra1: [
    {},
    { choicePrompt: 'Busca a ovella.', optionAnswer: 1 },
    { choicePrompt: 'Busca a galiña.', optionAnswer: 3 },
  ],
  ra2: [
    {},
    { choicePrompt: 'boca', options: [{ cap: 'boca', emoji: '👄' }, { cap: 'flor', emoji: '🌸' }, { cap: 'tren', emoji: '🚆' }], optionAnswer: 0 },
    { choicePrompt: 'oso', options: [{ cap: 'oso', emoji: '🐻' }, { cap: 'pé', emoji: '🦶' }, { cap: 'uva', emoji: '🍇' }], optionAnswer: 0 },
  ],
  ra3: [
    {},
    { choicePrompt: 'gato', optionAnswer: 2 },
    { choicePrompt: 'zapato', optionAnswer: 3 },
  ],
  ra4: [
    {},
    {
      parts: [{ role: 'Primeiro', cap: 'lúa', emoji: '🌙' }, { role: 'Logo', cap: 'gato', emoji: '🐱' }, { role: 'Despois', cap: 'flor', emoji: '🌸' }],
      sentence: 'Toca a lúa, logo o gato e despois a flor.',
    },
    {
      parts: [{ role: 'Primeiro', cap: 'pan', emoji: '🍞' }, { role: 'Logo', cap: 'peixe', emoji: '🐟' }, { role: 'Despois', cap: 'árbore', emoji: '🌳' }],
      sentence: 'Toca o pan, logo o peixe e despois a árbore.',
    },
  ],
  // ---- TEA ----
  tea5: [
    {},
    {
      read: 'Preme 🔊 para oír as catro palabras. Tres cómense e unha non: a nena toca a que NON vai coas demais. Sobe o ruído desde o Panel do Adulto rolda a rolda e anota como cambia o acerto.',
      intruder: [{ cap: 'mazá', emoji: '🍎' }, { cap: 'pan', emoji: '🍞' }, { cap: 'queixo', emoji: '🧀' }, { cap: 'pelota', emoji: '⚽' }],
      intruderAnswer: 3,
    },
    {
      read: 'Preme 🔊 para oír as catro palabras. Tres son para vestirse e unha non: a nena toca a que NON vai coas demais. Mantén o nivel de ruído que esteas a probar e compara coas roldas anteriores.',
      intruder: [{ cap: 'gorro', emoji: '🧢' }, { cap: 'camiseta', emoji: '👕' }, { cap: 'zapato', emoji: '👟' }, { cap: 'amorodo', emoji: '🍓' }],
      intruderAnswer: 3,
    },
  ],
  tea6: [
    {},
    {
      choicePrompt: 'O círculo azul.',
      options: [{ cap: 'círculo azul', emoji: '🔵' }, { cap: 'cadrado azul', emoji: '🟦' }, { cap: 'círculo vermello', emoji: '🔴' }],
      optionAnswer: 0,
    },
    {
      choicePrompt: 'A estrela amarela.',
      options: [{ cap: 'círculo amarelo', emoji: '🟡' }, { cap: 'estrela amarela', emoji: '⭐' }, { cap: 'corazón amarelo', emoji: '💛' }],
      optionAnswer: 1,
    },
  ],
  // ---- Dislexia ----
  dx1: [
    {},
    { intruder: [{ cap: 'can', emoji: '🔊' }, { cap: 'pan', emoji: '🔊' }, { cap: 'man', emoji: '🔊' }, { cap: 'sol', emoji: '🔊' }], intruderAnswer: 3 },
    { intruder: [{ cap: 'casa', emoji: '🔊' }, { cap: 'pasa', emoji: '🔊' }, { cap: 'masa', emoji: '🔊' }, { cap: 'porta', emoji: '🔊' }], intruderAnswer: 3 },
    { intruder: [{ cap: 'sol', emoji: '🔊' }, { cap: 'col', emoji: '🔊' }, { cap: 'gol', emoji: '🔊' }, { cap: 'mesa', emoji: '🔊' }], intruderAnswer: 3 },
  ],
  dx2: [
    {},
    { phrase: 'A NENA BEBE ZUME', phraseEmoji: '🧃' },
    { phrase: 'O MEU GATO SALTA ALTO', phraseEmoji: '🐱' },
  ],
  dx3: [
    {},
    { phonemes: ['sss', 'ooo', 'lll'], phrase: 'SOL', phraseEmoji: '☀️' },
    { phonemes: ['lll', 'u', 'a'], phrase: 'LÚA', phraseEmoji: '🌙' },
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
        { cap: 'lúa', emoji: '🌙' }, { cap: 'can', emoji: '🐶' }, { cap: 'casa', emoji: '🏠' }, { cap: 'peixe', emoji: '🐟' },
        { cap: 'casa', emoji: '🏠' }, { cap: 'peixe', emoji: '🐟' }, { cap: 'lúa', emoji: '🌙' }, { cap: 'can', emoji: '🐶' },
        { cap: 'can', emoji: '🐶' }, { cap: 'lúa', emoji: '🌙' }, { cap: 'peixe', emoji: '🐟' }, { cap: 'casa', emoji: '🏠' },
      ],
    },
    {
      // RAN de cores: a mesma serie cromática básica en galego.
      tiles: [
        { cap: 'vermello', emoji: '🟥' }, { cap: 'azul', emoji: '🟦' }, { cap: 'verde', emoji: '🟩' }, { cap: 'amarelo', emoji: '🟨' },
        { cap: 'verde', emoji: '🟩' }, { cap: 'amarelo', emoji: '🟨' }, { cap: 'vermello', emoji: '🟥' }, { cap: 'azul', emoji: '🟦' },
        { cap: 'azul', emoji: '🟦' }, { cap: 'verde', emoji: '🟩' }, { cap: 'amarelo', emoji: '🟨' }, { cap: 'vermello', emoji: '🟥' },
      ],
    },
  ],
};

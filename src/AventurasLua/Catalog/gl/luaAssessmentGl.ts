// ============================================================================
// Aventuras con Lúa · Exercicios (cribado) en GALEGO — 60 ítems
//
// As OPCIÓNS van por POSICIÓN e só levan a etiqueta. O `id`, o pictograma e
// —sobre todo— `isTarget` quedan no catálogo base: desde a tradución non se
// pode cambiar cal é a resposta correcta nin por descoido. O gate comproba que
// o número de opcións coincide.
//
// Catro ítems non se traducen, REAUTORÍZANSE, porque o obxectivo é fonolóxico
// e o castelán non transfire:
//   · 5_7_01 contaba as sílabas de «ma-ri-po-sa»; en galego é «bol-bo-re-ta»,
//     que tamén son catro. A palabra cambia, a conta non.
//   · 5_7_10 pedía a vibrante múltiple en «perro»; en galego «can» non ten /r/.
//     Entra «carro», que si.
//   · 3_4_08 (o intruso) e 2_3_02 e 2_3_07 (sons iniciais) revísanse un a un
//     para que a palabra galega siga empezando polo son que se pide.
//
// O «osiño» de 0_2_09 queda: é vocabulario terapéutico do banco, non a mascota
// retirada (CLAUDE.md §5b).
//
// ✅ Avaliado e validado por ACOPROS (comunicado por Frank o 6/9/2026).
// ============================================================================

export interface LuaAssessmentOverride {
  prompt?: string;
  subPrompt?: string;
  /** Etiquetas por posición. Nunca id, pic nin isTarget. */
  options?: string[];
  targetFeedback?: string;
  modelingFeedback?: string;
  adultGuidance?: string;
  childRecast?: string;
}

export const LUA_ASSESSMENT_GL: Record<string, LuaAssessmentOverride> = {
  // ------------------------------------------------------------------ 0-2
  lua_eval_0_2_01: {
    prompt: 'Onde está o canciño?',
    options: ['Can', 'Pelota'],
    targetFeedback: 'Moi ben! Aí está o canciño!',
    modelingFeedback: 'Se non responde, o adulto ou Lúa sinala e nomea: «Aquí está! Canciño!».',
    adultGuidance: 'Reforzar o seguimento da mirada e o contacto visual.',
    childRecast: 'Mira! Este é o can.',
  },
  lua_eval_0_2_02: {
    prompt: 'Que di a vaca?',
    options: ['Imita «muuu» ou vocaliza', 'Non responde'],
    targetFeedback: 'Iso é! A vaca di muuu!',
    modelingFeedback: 'Calquera vocalización se reforza;modélase o son esaxerando a redondez labial.',
    adultGuidance: 'Aceptar calquera aproximación vocálica sonora.',
    childRecast: 'A vaca di muuu!',
  },
  lua_eval_0_2_03: {
    prompt: 'Dáme a pelota',
    subPrompt: 'Coa pelota á vista do pequeno.',
    options: ['Entrega a pelota', 'Entrega outro obxecto'],
    targetFeedback: 'Grazas! Déchesme a pelota.',
    modelingFeedback: 'Repítese a consigna sinalando coa man aberta o obxecto correcto.',
    adultGuidance: 'Favorece o seguimento instrucional directo con referencia visual.',
    childRecast: 'Esta é a pelota! Dáma.',
  },
  lua_eval_0_2_04: {
    prompt: 'Di «adeus»',
    subPrompt: 'O adulto di adeus coa man ao mesmo tempo.',
    options: ['Imita o xesto e/ou a palabra', 'Só observa'],
    targetFeedback: 'Adeus, amigo! Ata logo!',
    modelingFeedback: 'Refórzase calquera intento de imitación, sexa verbal, con balbucido ou motor coa man.',
    adultGuidance: 'Pragmática xestual temperá de saúdo e despedida.',
    childRecast: 'Adeus! Dille adeus coa man.',
  },
  lua_eval_0_2_05: {
    prompt: 'Onde está mamá?',
    subPrompt: 'Cunha foto de familia diante, ou con mamá presente.',
    options: ['Mira ou sinala a foto', 'Non localiza'],
    targetFeedback: 'Si! Aí está mamá!',
    modelingFeedback: 'Apoio con sinalamento conxunto e repetición agarimosa do nome.',
    adultGuidance: 'Recoñecemento de figuras de apego e atención conxunta.',
    childRecast: 'Aquí está mamá!',
  },
  lua_eval_0_2_06: {
    prompt: 'Sopra a burbulla',
    subPrompt: 'O adulto sopra primeiro, para que o imite.',
    options: ['Imita a acción de soprar', 'Non imita o sopro'],
    targetFeedback: 'Mira como voan as burbullas! Fuuu!',
    modelingFeedback: 'Practícase o patrón motor oral varias veces con xogo, sen presión.',
    adultGuidance: 'Praxia bucofonatoria de control do aire espiratorio.',
    childRecast: 'Sopra comigo! Fffff.',
  },
  lua_eval_0_2_07: {
    prompt: 'Que di o gato?',
    options: ['Imita «miau» ou vocaliza', 'Non responde'],
    targetFeedback: 'Miau! Que gatiño tan bonito!',
    modelingFeedback: 'Refórzase calquera aproximación sonora (/ia/, /au/, etc.).',
    adultGuidance: 'Estimulación do repertorio onomatopeico.',
    childRecast: 'O gato di miau!',
  },
  lua_eval_0_2_08: {
    prompt: 'Aplaude comigo',
    options: ['Imita o aplauso', 'Non imita'],
    targetFeedback: 'Bravo! Chocamos esas palmas!',
    modelingFeedback: 'Modélase de novo con ritmo suave, man sobre man se cómpre.',
    adultGuidance: 'Coordinación visomotora e sincronía comunicativa.',
    childRecast: 'Palmas, palmas! Aplaude comigo.',
  },
  lua_eval_0_2_09: {
    prompt: 'Dáme o osiño',
    options: ['Osiño', 'Pelota'],
    targetFeedback: 'Que suave é o osiño! Moitas grazas!',
    modelingFeedback: 'Nomease o obxecto correcto sinalándoo con claridade: «Mira, este é o osiño».',
    adultGuidance: 'Discriminación léxica receptiva temperá.',
    childRecast: 'Este é o osiño!',
  },
  lua_eval_0_2_10: {
    prompt: 'Quen fai «guau guau»?',
    options: ['Can', 'Pato'],
    targetFeedback: 'Exacto! O can fai guau, guau!',
    modelingFeedback: 'Repítese o son asociado a cada animal: «O can di guau, o pato di cuá».',
    adultGuidance: 'Asociación son-obxecto en discriminación forzada de 2 alternativas.',
    childRecast: 'O can fai guau guau!',
  },

  // ------------------------------------------------------------------ 2-3
  lua_eval_2_3_01: {
    prompt: 'Cal é a pelota?',
    options: ['Pelota', 'Pato', 'Taza'],
    targetFeedback: 'Moi ben! Esa é a pelota redonda!',
    modelingFeedback: 'Se escolle outra opción: «Case! Esta é a pelota. Podes dicir pelota?».',
    adultGuidance: 'Evitar corrixir cun «non»; modelar a palabra completa.',
    childRecast: 'Esta é a pelota! Podes dicir pelota?',
  },
  lua_eval_2_3_02: {
    prompt: 'Toca a imaxe que empeza co son /p/',
    options: ['Pato', 'Sol', 'Mesa'],
    targetFeedback: 'Si! /p/… Pato empeza con /p/!',
    modelingFeedback: 'Lúa repite o son inicial esaxerado antes de amosar o resultado: «/p/… pato».',
    adultGuidance: 'Conciencia fonolóxica de consoante oclusiva bilabial temperá.',
    childRecast: 'Pato! Empeza con /p/.',
  },
  lua_eval_2_3_03: {
    prompt: 'Dáme o xoguete vermello',
    options: ['Vermello', 'Azul', 'Verde'],
    targetFeedback: 'Xenial! Este é o xoguete vermello.',
    modelingFeedback: 'Nomease a cor en voz alta sinalando o obxecto axeitado con agarimo.',
    adultGuidance: 'Comprensión de adxectivos de cor primaria.',
    childRecast: 'Este é o vermello!',
  },
  lua_eval_2_3_04: {
    prompt: 'Que está a facer o neno?',
    options: ['Comendo', 'Durmindo', 'Correndo'],
    targetFeedback: 'Iso é! O neno come rico.',
    modelingFeedback: 'Modélase a frase completa expandida: «O neno está a comer».',
    adultGuidance: 'Comprensión e expresión de verbos de acción cotiá.',
    childRecast: 'O neno está a comer!',
  },
  lua_eval_2_3_05: {
    prompt: 'Pon o vaso enriba da mesa',
    options: ['Coloca enriba', 'Coloca debaixo'],
    targetFeedback: 'Perfecto! O vaso está enriba.',
    modelingFeedback: 'Repítese cun xesto manual de apoio sinalando cara arriba.',
    adultGuidance: 'Nocións topolóxicas espaciais básicas.',
    childRecast: 'Enriba! O vaso vai enriba da mesa.',
  },
  lua_eval_2_3_06: {
    prompt: 'Cal é máis grande?',
    options: ['Elefante', 'Formiga'],
    targetFeedback: 'O elefante é xigante e moi grande!',
    modelingFeedback: 'Refórzase o concepto comparando tamaños abrindo os brazos de par en par.',
    adultGuidance: 'Conceptos dimensionais de tamaño relativo.',
    childRecast: 'O elefante é máis grande!',
  },
  lua_eval_2_3_07: {
    prompt: 'Toca a imaxe que empeza co son /m/',
    options: ['Mesa', 'Sol', 'Pato'],
    targetFeedback: 'Mmm… mesa! Empeza con /m/!',
    modelingFeedback: 'Xúntase a boca e esaxérase o son nasal /m/ antes de repetir.',
    adultGuidance: 'Discriminación de punto articulatorio bilabial sonoro.',
    childRecast: 'Mesa! Empeza con /m/.',
  },
  lua_eval_2_3_08: {
    prompt: 'Xogo de quendas: «A miña quenda… a túa quenda» coa pelota',
    options: ['Agarda a súa quenda e responde', 'Interrompe ou non agarda'],
    targetFeedback: 'Que ben agardaches a túa quenda! Agora tócache a ti!',
    modelingFeedback: 'Refórzase visualmente cunha tarxeta ou sinal de «A túa quenda».',
    adultGuidance: 'Regulación condutual e toma de quendas comunicativas.',
    childRecast: 'Agora é a túa quenda!',
  },
  lua_eval_2_3_09: {
    prompt: 'Que comemos cando temos fame?',
    options: ['Pan', 'Xoguete', 'Zapato'],
    targetFeedback: 'Claro! Comemos unha comida rica.',
    modelingFeedback: 'Conéctase a sensación corporal «fame» coa acción adaptativa correcta.',
    adultGuidance: 'Relación de causa e efecto funcional.',
    childRecast: 'Cando temos fame, comemos!',
  },
  lua_eval_2_3_10: {
    prompt: 'Imita a frase: «Quero auga»',
    options: ['Imita a frase completa ou parcial', 'Non imita'],
    targetFeedback: 'Moi ben dito! «Quero auga fresca».',
    modelingFeedback: 'Acéptase calquera combinación aproximada de 2 palabras (p. ex. «quero auga», «dáme auga»).',
    adultGuidance: 'Construción de enunciados sintácticos pivote.',
    childRecast: 'Quero auga. Dilo comigo?',
  },

  // ------------------------------------------------------------------ 3-4
  lua_eval_3_4_01: {
    prompt: 'O neno ten fame, que debería facer?',
    options: ['Pedir comida', 'Durmir', 'Xogar'],
    targetFeedback: 'Si! Cando temos fame, pedimos comida.',
    modelingFeedback: 'Reforza a relación causa-efecto e a petición social verbal.',
    adultGuidance: 'Pragmática de resolución de necesidades básicas.',
    childRecast: 'Se ten fame, pide comida!',
  },
  lua_eval_3_4_02: {
    prompt: 'Primeiro lava as mans, despois toca a mazá',
    options: ['Segue ambos os pasos en orde', 'Completa só un paso'],
    targetFeedback: 'Excelente! Primeiro lavarse e despois comer.',
    modelingFeedback: 'Se a resposta é parcial, repítese con iconas numeradas de apoio visual: 1 e 2.',
    adultGuidance: 'Memoria de traballo secuencial.',
    childRecast: 'Primeiro as mans, e despois a mazá.',
  },
  lua_eval_3_4_03: {
    prompt: 'Cal empeza coma «sol»?',
    options: ['Sapo', 'Lúa', 'Pan'],
    targetFeedback: 'Sss-ol e Sss-apo! As dúas empezan con /s/!',
    modelingFeedback: 'Alóngase o son fricativo /s/ inicial antes de repetir a pregunta.',
    adultGuidance: 'Aliteración e recoñecemento fonolóxico.',
    childRecast: 'Sol… sapo. As dúas empezan igual!',
  },
  lua_eval_3_4_04: {
    prompt: 'Que usamos cando chove?',
    options: ['Paraugas', 'Gorra', 'Bufanda'],
    targetFeedback: 'Un paraugas para non mollarnos coa chuvia!',
    modelingFeedback: 'Conéctase a situación climática co obxecto funcional correcto.',
    adultGuidance: 'Semántica funcional de obxectos.',
    childRecast: 'Cando chove usamos o paraugas!',
  },
  lua_eval_3_4_05: {
    prompt: 'Xogo de roles «o médico»: «Que lle doe ao paciente?»',
    options: ['Responde sinalando ou nomeando a parte do corpo', 'Non responde no xogo'],
    targetFeedback: 'Pobre osiño, doíalle o brazo! Xa o curamos.',
    modelingFeedback: 'Modélase unha resposta simple en xogo simbólico e convídase a repetila.',
    adultGuidance: 'Desenvolvemento de xogo simbólico e esquema corporal.',
    childRecast: 'Onde lle doe? Aquí?',
  },
  lua_eval_3_4_06: {
    prompt: 'Cando alguén te saúda e di «ola», ti…',
    options: ['Saúdas de volta', 'Vaste sen responder'],
    targetFeedback: 'Que amable! Dicimos «Ola!» cun sorriso.',
    modelingFeedback: 'Mini historia social co apoio de Lúa reforzando a reciprocidade social.',
    adultGuidance: 'Pragmática conversacional de cortesía.',
    childRecast: 'Ola! Cando te saúdan, ti saúdas.',
  },
  lua_eval_3_4_07: {
    prompt: 'Practica dicir «quero xogar» con voz suave e relaxada',
    subPrompt: 'O adulto dia primeiro, amodo e suave, sen présa.',
    options: ['Produce a frase de forma relaxada', 'Amosa tensión ou bloqueo'],
    targetFeedback: 'Que suave saíu a túa voz! Coma unha pluma no aire.',
    modelingFeedback: 'Sen presión de tempo; Lúa modela a frase respirando amodo, sen sinalar erro.',
    adultGuidance: 'Manexo clínico preventivo de disfluencias.',
    childRecast: 'Suaviño: quero xogar.',
  },
  lua_eval_3_4_08: {
    prompt: 'Cal non pertence a este grupo?',
    options: ['Cadeira', 'Mazá', 'Plátano'],
    targetFeedback: 'Exacto! A mazá e o plátano son froitas; a cadeira é un moble.',
    modelingFeedback: 'Explícase a categoría: «A cadeira non se come, a cadeira é para sentarse».',
    adultGuidance: 'Clasificación e detección do elemento intruso.',
    childRecast: 'A mazá e o plátano cómense. A cadeira non!',
  },
  lua_eval_3_4_09: {
    prompt: 'Ordena a historia: neno tropeza → chora → mamá abrázao',
    options: ['Ordena as 3 imaxes correctamente', 'Ordena de forma incorrecta'],
    targetFeedback: 'Moi ben! Primeiro tropezou, púxose triste e mamá deulle unha aperta grande.',
    modelingFeedback: 'Guíase paso a paso con preguntas: «Que pasou primeiro? E despois?».',
    adultGuidance: 'Estruturación narrativa cronolóxica.',
    childRecast: 'Primeiro tropeza, despois chora, e mamá abrázao.',
  },
  lua_eval_3_4_10: {
    prompt: 'Que dirías se queres xogar cun amigo?',
    options: ['«Podo xogar contigo?»', 'Non di nada ou quita o xoguete'],
    targetFeedback: 'Palabras máxicas! Preguntar con agarimo abre todas as portas.',
    modelingFeedback: 'Modélase a frase en dramatización con Lúa e practícase con naturalidade.',
    adultGuidance: 'Iniciación social asertiva con iguais.',
    childRecast: 'Podo xogar contigo?',
  },

  // ------------------------------------------------------------------ 4-5
  lua_eval_4_5_01: {
    prompt: 'Imaxe dun neno co seu xeado caído no chan: «Que pasou aquí?»',
    options: ['«Caeulle o xeado e está triste»', '«Está a comer»', '«Está a saltar»'],
    targetFeedback: 'Comprendiches moi ben a situación! Pobre neno, caeulle o xeado.',
    modelingFeedback: 'Acéptase resposta libre explicativa; as opcións serven de apoio se o neno dubida.',
    adultGuidance: 'Lectura emocional e inferencia de causa contextual.',
    childRecast: 'Caeulle o xeado. Está triste!',
  },
  lua_eval_4_5_02: {
    prompt: 'O neno di «can corre». Lúa responde: «Si! O can corre rápido. Podes dicilo así?»',
    options: ['Repite a oración expandida', 'Repite só «can corre»'],
    targetFeedback: 'Que ben soa a túa oración longa e completa!',
    modelingFeedback: 'Técnica de recasting: enriquécese a sintaxe sen sinalar erro gramatical.',
    adultGuidance: 'Expansión sintáctica e modelado indirecto.',
    childRecast: 'O can corre rápido!',
  },
  lua_eval_4_5_03: {
    prompt: 'Cal é o contrario de «grande»?',
    options: ['Pequeno', 'Alto', 'Rápido'],
    targetFeedback: 'Excelente! O contrario de grande é pequeno.',
    modelingFeedback: 'Amósase visualmente o contraste entre un obxecto grande e un pequeno.',
    adultGuidance: 'Desenvolvemento de relacións semánticas de antonimia.',
    childRecast: 'O contrario de grande é pequeno.',
  },
  lua_eval_4_5_04: {
    prompt: 'Con que son empeza a palabra «sol»?',
    options: ['/s/', '/m/', '/p/'],
    targetFeedback: 'Sss-ol! Empeza co son /s/!',
    modelingFeedback: 'Lúa amosa a boca sorrinte producindo o son /s/ antes de repetir.',
    adultGuidance: 'Illamento fonémico inicial.',
    childRecast: 'Ssss… sol. Empeza con /s/!',
  },
  lua_eval_4_5_05: {
    prompt: 'Cantas sílabas ten «me-sa»?',
    options: ['2 sílabas', '1 sílaba', '3 sílabas'],
    targetFeedback: 'Dúas palmadas! Me-sa ten 2 sílabas.',
    modelingFeedback: 'Lúa dá dúas palmadas rítmicas ao dicir: «ME (1) - SA (2)!».',
    adultGuidance: 'Conciencia silábica con apoio cinestésico.',
    childRecast: 'Me-sa. Dúas palmadas!',
  },
  lua_eval_4_5_06: {
    prompt: 'Xogo de mesa: agarda a túa quenda e segue a instrución do compañeiro',
    options: ['Agarda e segue a regra', 'Non agarda a súa quenda'],
    targetFeedback: 'Gran xogador! Sabes agardar e divertirte en equipo.',
    modelingFeedback: 'Acompáñase dun reloxo de area animado ou tarxeta de quenda.',
    adultGuidance: 'Habilidades pragmáticas e funcións executivas de inhibición.',
    childRecast: 'Agarda un pouquiño! Agora tócache.',
  },
  lua_eval_4_5_07: {
    prompt: 'Que pasaría se che cae un xoguete á auga?',
    options: ['«Móllase / flota / afunde»', '«Non pasa nada»'],
    targetFeedback: 'Boa dedución! O xoguete móllase coa auga.',
    modelingFeedback: 'Acéptase calquera predición lóxica e razoada.',
    adultGuidance: 'Razoamento hipotético temperán.',
    childRecast: 'Se cae á auga, móllase.',
  },
  lua_eval_4_5_08: {
    prompt: 'Nomea 3 animais que coñezas',
    options: ['Nomea 3 ou máis animais', 'Nomea 1 ou ningún'],
    targetFeedback: 'Que gran zoolóxico coñeces! Tres animais xeniais!',
    modelingFeedback: 'Se o neno se detén, Lúa amosa siluetas de animais como pista amable.',
    adultGuidance: 'Fluidez léxica por categoría semántica.',
    childRecast: 'Can, gato, pato. Tres animais!',
  },
  lua_eval_4_5_09: {
    prompt: 'Conta con voz suave e relaxada un conto curtiño de 2 liñas',
    options: ['Mantén fluidez relaxada', 'Amosa tensión ou repeticións marcadas'],
    targetFeedback: 'Encantoume a túa historia! Contáchela con calma e alegría.',
    modelingFeedback: 'Continúase a historia de forma colaborativa sen remarcar ningunha vacilación.',
    adultGuidance: 'Monitoraxe de fluidez na fala conectada.',
    childRecast: 'Amodiño e suave, coma Lúa.',
  },
  lua_eval_4_5_10: {
    prompt: 'Repite a secuencia de sons con Lúa: «pa-pa-pa, ma-ma-ma»',
    options: ['Repite a secuencia motora', 'Non logra a secuencia rítmica'],
    targetFeedback: 'Boca lista e afinada! Pa-pa-pa, ma-ma-ma!',
    modelingFeedback: 'Lúa amosa en grande a boca abrindo e pechando ritmicamente.',
    adultGuidance: 'Diadococinesia e praxias bucofonatorias secuenciais.',
    childRecast: 'Pa-pa-pa, ma-ma-ma. Comigo!',
  },

  // ------------------------------------------------------------------ 5-7
  lua_eval_5_7_01: {
    // «mariposa» pasa a «bolboreta»: catro sílabas tamén, e é a palabra galega.
    prompt: 'Cantas sílabas ten «bol-bo-re-ta»?',
    options: ['4 sílabas', '3 sílabas', '2 sílabas'],
    targetFeedback: 'Exacto! Bol-bo-re-ta ten catro sílabas.',
    modelingFeedback: 'Lúa conta coas patiñas: bol (1) - bo (2) - re (3) - ta (4).',
    adultGuidance: 'Segmentación de palabras polisilábicas.',
    childRecast: 'Bol-bo-re-ta. Catro palmadas!',
  },
  lua_eval_5_7_02: {
    prompt: 'O teu amigo está triste porque perdeu o seu xoguete. Que lle dis?',
    options: ['«Queres que te axude a buscalo?»', '«Non importa, xoga só»', '«Ese xoguete era feo»'],
    targetFeedback: 'Que bo amigo es! Axudar e escoitar consola os demais.',
    modelingFeedback: 'Lúa explica como a empatía e a colaboración fan medrar as amizades.',
    adultGuidance: 'Habilidades de empatía e teoría da mente.',
    childRecast: 'Queres que te axude a buscalo?',
  },
  lua_eval_5_7_03: {
    prompt: 'Segue esta instrución sen mirar: «Toca a túa cabeza e despois chouta»',
    options: ['Completa ambos os pasos en orde', 'Completa só un dos pasos'],
    targetFeedback: 'Atención de campión! Oídos ben espertos.',
    modelingFeedback: 'Repítese a consigna verbalmente unha soa vez máis antes de dar apoio visual.',
    adultGuidance: 'Procesamento auditivo de ordes complexas.',
    childRecast: 'Primeiro a cabeza, e despois choutas.',
  },
  lua_eval_5_7_04: {
    prompt: 'Que palabra significa o mesmo que «contento»?',
    options: ['Feliz', 'Triste', 'Canso'],
    targetFeedback: 'Correcto! Estar contento é o mesmo que estar feliz.',
    modelingFeedback: 'Compáranse ambas as palabras nunha frase de exemplo con Lúa sorrinte.',
    adultGuidance: 'Relacións de sinonimia léxica.',
    childRecast: 'Contento e feliz queren dicir o mesmo.',
  },
  lua_eval_5_7_05: {
    prompt: 'Cal é o contrario de «alto»?',
    options: ['Baixo', 'Rápido', 'Forte'],
    targetFeedback: 'Iso é! O contrario dunha árbore alta é un arbusto baixo.',
    modelingFeedback: 'Apóiase coa comparación visual de dúas estaturas.',
    adultGuidance: 'Relacións de antonimia dimensional.',
    childRecast: 'O contrario de alto é baixo.',
  },
  lua_eval_5_7_06: {
    prompt: 'Escoita a historia e responde: «Por que o neno se puxo feliz?»',
    options: ['Responde coa causa correcta do relato', 'Non relaciona a causa coa emoción'],
    targetFeedback: 'Comprendiches a emoción do personaxe perfectamente!',
    modelingFeedback: 'Reléese a parte relevante do conto destacando a causa que produciu a alegría.',
    adultGuidance: 'Comprensión de causalidade emocional en textos narrativos.',
    childRecast: 'Púxose feliz polo que lle pasou no conto.',
  },
  lua_eval_5_7_07: {
    prompt: 'Practica un comezo suave da palabra «mamá» antes da túa quenda no xogo',
    options: ['Produce un comezo suave e relaxado', 'Amosa bloqueo ou golpe de glote'],
    targetFeedback: 'Que suave saíu esa «m»! Coma unha caricia de aire.',
    modelingFeedback: 'Lúa respira fondo, xunta suavemente os beizos e emite: «mmmamá».',
    adultGuidance: 'Técnica de arranque vocal relaxado para prevención de disfluencias.',
    childRecast: 'Mmmamá. Empeza suave, sen présa.',
  },
  lua_eval_5_7_08: {
    prompt: 'Que palabra rima con «gato»?',
    options: ['Pato', 'Can', 'Casa'],
    targetFeedback: 'Ga-to e Pa-to riman ao final!',
    modelingFeedback: 'Esaxéranse as terminacións rimadas: «ga-TO, pa-TO, as dúas soan igual».',
    adultGuidance: 'Conciencia fonolóxica de rima consoante.',
    childRecast: 'Gato e pato riman: soan igual ao final.',
  },
  lua_eval_5_7_09: {
    prompt: 'Cóntalle a Lúa algo divertido que fixeches a fin de semana',
    subPrompt: 'Se se atasca: que fixeches?, con quen?, cando?',
    options: ['Narra con polo menos 2 elementos estruturados', 'Responde cunha soa palabra'],
    targetFeedback: 'Que gran aventura me contaches! Imaxineino todiño.',
    modelingFeedback: 'Apóiase con preguntas facilitadoras: «E quen foi contigo? Que fixestes primeiro?».',
    adultGuidance: 'Estruturación de discurso narrativo persoal.',
    childRecast: 'Cóntame: que fixeches e con quen?',
  },
  lua_eval_5_7_10: {
    // «perro» non serve: en galego é «can» e non ten /r/. Entra «carro».
    prompt: 'Le en voz alta e pronuncia con calma o son /r/ en «carro»',
    options: ['Produce o son con ou sen apoio', 'Substitúe ou omite o son /r/'],
    targetFeedback: 'Bravo por ese son de motor! Ca-rro!',
    modelingFeedback: 'Lúa modela a vibración da punta da lingua no padal cun sorriso.',
    adultGuidance: 'Articulación da vibrante múltiple sen forzar nin frustrar.',
    childRecast: 'Carrrro. Con calma, sen apertar.',
  },

  // ----------------------------------------------------------------- 7-10
  lua_eval_7_10_01: {
    prompt: 'Que significa a expresión «estar nas nubes»?',
    options: ['Estar distraído ou soñando esperto', 'Estar voando nun avión', 'Ter moito frío'],
    targetFeedback: 'Exacto! É unha frase feita que usamos cando pensamos noutra cousa.',
    modelingFeedback: 'Explícase o sentido figurado cun exemplo cotián: «Cando quedas pensando no teu xogo».',
    adultGuidance: 'Comprensión de linguaxe figurada e modismos.',
    childRecast: 'Estar nas nubes é estar distraído.',
  },
  lua_eval_7_10_02: {
    prompt: 'Escoita a túa propia voz gravada: «Sentiches a túa fala suave e relaxada nesta frase?»',
    options: ['«Si, sentiuse doada e suave»', '«Un pouco tensa ou rápida»', '«Non estou seguro»'],
    targetFeedback: 'Gran autoavaliación! Escoitarse a un mesmo é o superpoder dos comunicadores.',
    modelingFeedback: 'Se percibiu tensión, Lúa convida a respirar coas burbullas antes de continuar.',
    adultGuidance: 'Metacognición e automonitoraxe da tensión larínxea.',
    childRecast: 'Escóitate outra vez. Soou suave?',
  },
  lua_eval_7_10_03: {
    prompt: 'Na historia, o personaxe marchou sen dicir unha palabra. Por que cres que fixo iso?',
    options: ['Achega unha inferencia razoada (p. ex. estaba desgustado ou apenado)', 'Di «non sei» sen tentar inferir'],
    targetFeedback: 'Gran intuición! Os personaxes ás veces din moito co que calan.',
    modelingFeedback: 'Lúa rescata pistas do texto: «Lembra que acababa de perder o seu xogo favorito…».',
    adultGuidance: 'Inferencia psicolóxica sobre intencións e emocións.',
    childRecast: 'Quizais marchou porque estaba desgustado.',
  },
  lua_eval_7_10_04: {
    prompt: 'Un compañeiro copia as túas respostas na clase sen que o profesor o vexa. Que farías?',
    options: ['Achega unha resposta reflexiva e equilibrada', 'Evita responder ou dá unha resposta impulsiva'],
    targetFeedback: 'Moi ben reflexionado! Falar con respecto e honestidade soluciona os problemas.',
    modelingFeedback: 'Explóranse con Lúa distintas alternativas asertivas (dialogar co amigo, coidar o exame).',
    adultGuidance: 'Razoamento moral e resolución de conflitos sociais.',
    childRecast: 'Pénsao con calma. Que farías ti?',
  },
  lua_eval_7_10_05: {
    prompt: 'Que é un «ecosistema»? Explícao coas túas propias palabras',
    options: ['Dá unha definición funcional aproximada (seres vivos e a súa contorna)', 'Non logra definir o concepto'],
    targetFeedback: 'Que explicación tan clara! A natureza en equilibrio.',
    modelingFeedback: 'Ofrécese un exemplo concreto: «Coma unha fraga onde viven animais, árbores e ríos axudándose».',
    adultGuidance: 'Definición de conceptos científicos e vocabulario abstracto.',
    childRecast: 'Un ecosistema son os seres vivos e a súa contorna.',
  },
  lua_eval_7_10_06: {
    prompt: 'Organiza a túa historia: comezo, problema e solución',
    options: ['Inclúe as 3 partes de forma coherente', 'Omite o nó ou o desenlace'],
    targetFeedback: 'Estrutura de escritor experto! A túa historia ten principio, emoción e final feliz.',
    modelingFeedback: 'Lúa amosa un mapa visual con 3 caixas: «Como empezou? Que se complicou? Como se arranxou?».',
    adultGuidance: 'Superestrutura textual do discurso narrativo.',
    childRecast: 'Comezo, problema e solución. As tres partes!',
  },
  lua_eval_7_10_07: {
    prompt: 'Cal é o chiste ou dobre sentido en: «Por que o libro de matemáticas estaba triste? Porque tiña moitos problemas!»?',
    options: ['Explica o xogo de palabras (problemas matemáticos fronte a dificultades persoais)', 'Non identifica o dobre sentido'],
    targetFeedback: 'Exacto! «Problemas» de sumar e «problemas» de preocupacións. Que enxeñoso!',
    modelingFeedback: 'Lúa explica a polisemia da palabra de forma amena e divertida.',
    adultGuidance: 'Metalingüística e comprensión do humor verbal.',
    childRecast: 'Problemas de matemáticas e problemas de verdade. Por iso fai graza!',
  },
  lua_eval_7_10_08: {
    prompt: 'Practica o son /s/ mentres conversas espontaneamente con Lúa sobre o teu día favorito',
    options: ['Articula o son correctamente na fala espontánea', 'Só o logra en palabras lidas ou illadas'],
    targetFeedback: 'Enténdesete estupendo! As túas frases flúen con claridade.',
    modelingFeedback: 'Lúa conversa mantendo o ritmo relaxado e destacando auditivamente os /s/ con naturalidade.',
    adultGuidance: 'Xeneralización da articulación á fala cotiá.',
    childRecast: 'Ssss… segue contándome o teu día.',
  },
  lua_eval_7_10_09: {
    prompt: 'Na historia, primeiro choveu moito e despois encheuse de auga a rúa. Cal foi a causa de que se asolagase?',
    options: ['A chuvia abundante', 'O asolagamento mesmo'],
    targetFeedback: 'Moi ben pensado! A chuvia foi a causa que provocou que subise a auga.',
    modelingFeedback: 'Lúa traza unha liña de tempo: «Causa (a chuvia) → Efecto (a rúa con auga)».',
    adultGuidance: 'Relacións de causalidade complexa en textos informativos e narrativos.',
    childRecast: 'Asolagouse porque choveu moito.',
  },
  lua_eval_7_10_10: {
    prompt: 'Debate guiado: «É mellor ter un can ou un gato de mascota?» Dá a túa opinión e escoita a de Lúa',
    options: ['Argumenta o seu punto de vista e respecta a quenda', 'Interrompe ou non xustifica a súa preferencia'],
    targetFeedback: 'Que gran argumento me deches! Dá gusto conversar e debater contigo.',
    modelingFeedback: 'Lúa agradece a quenda e ofrece un contraargumento amigable para practicar o diálogo.',
    adultGuidance: 'Pragmática da conversa dialéctica e argumentación oral.',
    childRecast: 'Di o que pensas e escoita tamén a Lúa.',
  },
};

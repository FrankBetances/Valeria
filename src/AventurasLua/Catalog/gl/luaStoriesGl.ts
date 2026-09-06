// ============================================================================
// Aventuras con Lúa · Contos en GALEGO
//
// Os dez contos son os mesmos: non se reescribe ningunha historia. O que si
// cambia é a lingua e algún referente que en galego ten nome propio e non
// admite calco —bolboreta, cuncha, avó—.
//
// As OPCIÓNS das preguntas van indexadas polo seu id, non por posición: o
// debuxo (`pic`) e cal é a correcta (`isCorrect`) quedan no catálogo base, e
// aquí só viaxa o texto. Así, cambiar unha resposta correcta é imposible desde
// a tradución, que é exactamente o que ten que ser.
//
// ✅ Avaliado e validado por ACOPROS (comunicado por Frank o 6/9/2026).
// ============================================================================

export interface LuaStoryQuestionOverride {
  question?: string;
  hint?: string;
  /** id da opción → texto. Nunca `isCorrect` nin `pic`. */
  options?: Record<string, string>;
}

export interface LuaStoryOverride {
  title?: string;
  suggestedAgeText?: string;
  paragraphs?: string[];
  drawingPrompt?: string;
  /** id da pregunta → textos. */
  questions?: Record<string, LuaStoryQuestionOverride>;
  /** Por posición: as tres tarxetas de vocabulario, sen tocar a ficha. */
  newWords?: Array<{ word: string; definition: string }>;
}

export const LUA_STORIES_GL: Record<string, LuaStoryOverride> = {
  lua_story_01: {
    title: 'Coco busca a mamá',
    suggestedAgeText: '0–2 anos',
    paragraphs: [
      'Coco é un pitiño amarelo e moi suave.',
      'Coco camiña contento e di: pío, pío!',
      'Coco busca pola aira a súa mamá.',
      'Mira, alí está mamá galiña coidando o niño!',
      'Mamá abrázao coas súas ás e di: coc, coc, coc!',
      'Coco e mamá están xuntos e moi felices.',
    ],
    questions: {
      story_01_q1: {
        question: 'Que animaliño é Coco?',
        hint: 'Coco ten pluminhas e é de cor amarela.',
        options: { opt_pollito: 'Un pitiño amarelo', opt_perrito: 'Un canciño', opt_gatico: 'Un gatiño' },
      },
      story_01_q2: {
        question: 'Que son fai Coco cando camiña?',
        hint: 'Os pitiños pequenos din pío, pío!',
        options: { opt_pio: 'Pío, pío!', opt_muu: 'Muu, muu!', opt_guau: 'Guau, guau!' },
      },
      story_01_q3: {
        question: 'A quen atopou Coco ao final?',
        hint: 'Atopou a súa mamá, que o abrazou coas ás.',
        options: { opt_mama: 'A súa mamá galiña', opt_vaca: 'A unha vaca', opt_pato: 'A un patiño' },
      },
    },
    newWords: [
      { word: 'Galiña', definition: 'Ave con plumas que pon ovos e coida os seus pitiños.' },
      { word: 'Sol', definition: 'A estrela brillante que nos dá calor e luz durante o día.' },
      { word: 'Casa', definition: 'Lugar seguro e acolledor onde descansamos en familia.' },
    ],
    drawingPrompt: 'Debuxa a Coco xunto á súa mamá galiña baixo o sol.',
  },
  lua_story_02: {
    title: 'O gatiño e a pelota',
    suggestedAgeText: '2–3 anos',
    paragraphs: [
      'Mimi é un gatiño pequeno e moi xoguetón.',
      'A Mimi gústalle rodar a súa pelota azul por todo o patio.',
      'Un día, a pelota rodou rápido ata Toby, un canciño novo no barrio.',
      'Toby colleu a pelota con moito tino coa boca e devolveulla a Mimi movendo o rabiño.',
      'Desde ese día, Mimi e Toby xogan xuntos coa pelota todas as tardes.',
    ],
    questions: {
      story_02_q1: {
        question: 'De que cor é a pelota de Mimi?',
        hint: 'A pelota roda polo patio e é coma a cor do ceo.',
        options: { opt_azul: 'Azul', opt_roja: 'Vermella', opt_amarilla: 'Amarela' },
      },
      story_02_q2: {
        question: 'Quen atopou a pelota?',
        hint: 'Un canciño amigable que movía o rabiño.',
        options: { opt_toby: 'Toby, o canciño novo', opt_pato: 'Un pato branco', opt_rana: 'Unha ra verde' },
      },
      story_02_q3: {
        question: 'Que fan Mimi e Toby todas as tardes?',
        hint: 'Fixéronse grandes amigos e xogan no patio.',
        options: { opt_juegan: 'Xogan xuntos á pelota', opt_duermen: 'Dormen no tellado', opt_comen: 'Comen galletas de mazá' },
      },
    },
    newWords: [
      { word: 'Gato', definition: 'Animaliño áxil con bigotes que fai miau.' },
      { word: 'Can', definition: 'Amigo fiel e xoguetón que move o rabo e fai guau.' },
      { word: 'Pelota', definition: 'Xoguete redondo que bota e roda para xogar en equipo.' },
    ],
    drawingPrompt: 'Debuxa a Mimi o gatiño e a Toby o canciño xogando coa pelota azul.',
  },
  lua_story_03: {
    title: 'Imos á granxa',
    suggestedAgeText: '2–3 anos',
    paragraphs: [
      'Hoxe Ana foi de visita á granxa verde do seu avó.',
      'No prado, a vaca grande mirouna e dixo: muuu, muuu!',
      'Preto do alpendre, a galiña paseaba cos seus pitiños e dixo: coc, coc, coc!',
      'Ao chegar ao camiño, o can gardián moveu as orellas e dixo: guau, guau!',
      'Ana sorriu feliz e saudou cada animaliño abaneando a mansiña.',
      'Ao serán, Ana deulle unha aperta ao seu avó por un día tan divertido.',
    ],
    questions: {
      story_03_q1: {
        question: 'A onde foi de visita Ana?',
        hint: 'Foi ao campo onde hai vacas, galiñas e cans.',
        options: { opt_granja: 'Á granxa do seu avó', opt_playa: 'Á praia a nadar', opt_escuela: 'Á escola a pintar' },
      },
      story_03_q2: {
        question: 'Que son fai a vaca grande?',
        hint: 'Xuntamos os beizos e dicimos muuu!',
        options: { opt_muuu: 'Muuu, muuu!', opt_miau: 'Miau, miau!', opt_kikiriki: 'Cacaracá!' },
      },
      story_03_q3: {
        question: 'Como saudou Ana os animaliños da granxa?',
        hint: 'Levantou a mansiña para dicirlles ola con agarimo.',
        options: { opt_mano: 'Abaneando a mansiña cun sorriso', opt_corriendo: 'Correndo rápido', opt_escondida: 'Agochándose detrás dunha porta' },
      },
    },
    newWords: [
      { word: 'Vaca', definition: 'Animal que vive no campo, come herba fresca e dá leite rico.' },
      { word: 'Galiña', definition: 'Ave que vive na granxa e pasea cos seus pitiños.' },
      { word: 'Can', definition: 'Compañeiro leal que saúda alegre cando chegamos.' },
    ],
    drawingPrompt: 'Debuxa a granxa coa vaca, a galiña e o can saudando a Ana.',
  },
  lua_story_04: {
    title: 'A árbore que quería flores',
    suggestedAgeText: '3–4 anos',
    paragraphs: [
      'No patio da escola medraba unha árbore delgada e moi pequena.',
      'A árbore miraba con admiración as árbores grandes e soñaba con ter flores recendentes.',
      'O sol da mañá quentábaa con tenrura e as pingas de chuvia refrescaban as súas raíces.',
      'Día tras día, a árbore foi estirando as pólas verdes cara ao alto do ceo.',
      'Unha mañá brillante de primavera sucedeu a maxia: agromaron fermosas flores rosadas!',
      'As bolboretas e as abellas chegaron a bailar entre as pólas, e a árbore sentiuse chea de orgullo.',
    ],
    questions: {
      story_04_q1: {
        question: 'Onde medraba a árbore pequena?',
        hint: 'Medraba ao aire libre onde os nenos xogaban no recreo.',
        options: { opt_patio: 'No patio da escola', opt_maceta: 'Nunha maceta dentro da casa', opt_orilla: 'Á beira do mar' },
      },
      story_04_q2: {
        question: 'Que axudou a árbore a medrar forte?',
        hint: 'As plantas precisan auga fresca e luz do sol.',
        options: { opt_sol_lluvia: 'A calor do sol e a auga da chuvia', opt_nieve: 'O vento frío e a neve', opt_sombra: 'A escuridade da noite' },
      },
      story_04_q3: {
        question: 'Quen visitou a árbore cando floreceu?',
        hint: 'Amiguiños con ás que buscan o pole das flores.',
        options: { opt_mariposas_abejas: 'As bolboretas e as abellas', opt_peces: 'Os peixiños do río', opt_osos: 'Dous osos grandes' },
      },
    },
    newWords: [
      { word: 'Árbore', definition: 'Planta alta con tronco forte de madeira e pólas cheas de follas.' },
      { word: 'Flor', definition: 'Parte colorida e recendente que agroma nas plantas.' },
      { word: 'Primavera', definition: 'Estación do ano chea de luz na que a natureza florece.' },
    ],
    drawingPrompt: 'Debuxa a árbore chea de flores rosadas rodeada de bolboretas.',
  },
  lua_story_05: {
    title: 'Un día de froitas',
    suggestedAgeText: '3–4 anos',
    paragraphs: [
      'Mía foi á praza do seu barrio coa súa avoa para mercar froita e preparar unha rica ensalada.',
      'Primeiro escolleron unha mazá vermella, redonda e moi brillante.',
      'Despois atoparon un acio de uvas moradas e unha cesta de amorodos doces e frescos.',
      'Ao chegar á casa, entre as dúas lavaron a froita con auga limpa e cortárona en cachiños pequenos.',
      'Toda a familia sentou á mesa a compartir a merenda e a contarse historias divertidas.',
    ],
    questions: {
      story_05_q1: {
        question: 'A onde foi Mía acompañada da súa avoa?',
        hint: 'Foron ao lugar onde venden mazás, uvas e amorodos.',
        options: { opt_mercado: 'Á praza a mercar froita', opt_parque: 'Ao parque a balancearse', opt_cine: 'Ao cine a ver unha película' },
      },
      story_05_q2: {
        question: 'Nomea dúas froitas que escolleu Mía na praza:',
        hint: 'Unha vermella e redonda, e outras moradas en acio.',
        options: { opt_frutas_correctas: 'Mazá e amorodos (ou uvas)', opt_comida_rapida: 'Patacas fritas e refresco', opt_verduras: 'Cenoria e cebola' },
      },
      story_05_q3: {
        question: 'Que fixo toda a familia ao final da tarde?',
        hint: 'Compartiron un momento feliz e conversaron na mesa.',
        options: { opt_familia_junta: 'Comeron xuntos a ensalada e contaron historias', opt_salieron_correr: 'Saíron correndo sen merendar', opt_durmieron: 'Foron durmir sen falar' },
      },
    },
    newWords: [
      { word: 'Mazá', definition: 'Froita crocante e deliciosa, de pel vermella ou verde.' },
      { word: 'Uvas', definition: 'Pequenas froitas zumarentas que medran xuntas en acios.' },
      { word: 'Amorodos', definition: 'Froitiñas doces de cor vermella viva con follas verdes.' },
    ],
    drawingPrompt: 'Debuxa unha cunca con anacos de mazá, amorodos e uvas para a ensalada.',
  },
  lua_story_06: {
    title: 'A casiña de area',
    suggestedAgeText: '4–5 anos',
    paragraphs: [
      'A familia de Sofía pasou unha tarde fermosa na praia construíndo unha casiña de area.',
      'Sofía recolleu cunchas mariñas de moitas cores na beira para decorar as paredes.',
      'As ondiñas suaves do mar chegaban amodo e mollaban con frescura a beira da casiña.',
      'Cando o sol comezou a poñerse no horizonte, o ceo pintouse de tons dourados e laranxa.',
      'Sofía sacou unha foto coa súa familia para lembrar ese día tan bonito fronte ao mar.',
    ],
    questions: {
      story_06_q1: {
        question: 'Que construíu a familia de Sofía na beira?',
        hint: 'Usaron area húmida e baldiños para modelala.',
        options: { opt_casita_arena: 'Unha casiña de area', opt_barco_madera: 'Un barco de madeira flotante', opt_puente_piedra: 'Unha ponte de pedras' },
      },
      story_06_q2: {
        question: 'Con que decorou Sofía as paredes da casiña?',
        hint: 'Tesouros que atopou paseando xunto ás ondas.',
        options: { opt_conchas: 'Con cunchas mariñas de cores', opt_hojas_secas: 'Con follas secas de piñeiro', opt_pintura: 'Con pintura de témpera' },
      },
      story_06_q3: {
        question: 'De que cor se pintou o ceo ao caer a tarde?',
        hint: 'As cores cálidas do serán cando o sol se agocha.',
        options: { opt_naranja: 'De cor dourada e laranxa', opt_verde: 'De verde brillante', opt_negro: 'De negro escuro con chuvia' },
      },
    },
    newWords: [
      { word: 'Onda', definition: 'Movemento ondulante da auga do mar que chega á beira.' },
      { word: 'Cuncha', definition: 'Casca dura e brillante que protexe os moluscos do mar.' },
      { word: 'Praia', definition: 'Beira de mar ou río cuberta de area limpa.' },
    ],
    drawingPrompt: 'Debuxa a casiña de area decorada con cunchas fronte ás ondas e ao serán.',
  },
  lua_story_07: {
    title: 'O peixiño e os seus amigos novos',
    suggestedAgeText: '4–5 anos',
    paragraphs: [
      'Nemi era un peixiño azul de aletas brillantes que vivía nun arrecife cheo de corais de cores.',
      'Un día coñeceu unha estrela de mar dourada e un simpático caranguexo que xogaban entre as rochas.',
      'Os tres inventaron un xogo divertido: agocharse entre as cunchas mariñas e atoparse por quendas.',
      'Nemi aprendeu que nadar polo arrecife era moito máis emocionante cando compartía as súas aventuras cos amigos.',
      'Desde ese día, os tres xúntanse todas as mañás para nadar e explorar o mar.',
    ],
    questions: {
      story_07_q1: {
        question: 'De que cor eran as aletas do peixiño Nemi?',
        hint: 'Unha cor brillante coma a auga limpa do mar.',
        options: { opt_pez_azul: 'Azul brillante', opt_pez_rojo: 'Vermello escuro', opt_pez_verde: 'Verde raiado' },
      },
      story_07_q2: {
        question: 'A quen coñeceu Nemi entre as rochas?',
        hint: 'Dous animaliños mariños que viven no fondo do arrecife.',
        options: { opt_estrella_cangrejo: 'A unha estrela de mar e a un caranguexo', opt_tiburon: 'A un tiburón grande', opt_gaviota: 'A unha gaivota que voaba' },
      },
      story_07_q3: {
        question: 'A que xogaban os tres amigos?',
        hint: 'O xogo do agocho xogando en equipo.',
        options: { opt_esconderse: 'A agocharse e atoparse por quendas', opt_carreras: 'A saltar fóra da auga', opt_pelear: 'A quitarse os xoguetes' },
      },
    },
    newWords: [
      { word: 'Peixe', definition: 'Animal acuático con aletas e escamas que nada na auga.' },
      { word: 'Arrecife', definition: 'Comunidade submarina de corais e pedras onde viven moitos peixes.' },
      { word: 'Estrela de mar', definition: 'Animal mariño con forma de estrela de cinco puntas.' },
    ],
    drawingPrompt: 'Debuxa a Nemi o peixiño azul xogando ao agocho coa estrela e o caranguexo.',
  },
  lua_story_08: {
    title: 'As estrelas do ceo',
    suggestedAgeText: '5–7 anos',
    paragraphs: [
      'Unha noite despexada de verán, o avó de Iván sacou dúas cadeiras ao xardín para contemplar o firmamento.',
      '—Mira alá arriba, esa estrela que escintila é a máis doada de atopar —díxolle o avó sinalando con calma.',
      'Iván comezou a contar as estrelas brillantes que alcanzaba a ver, mentres o seu avó lle explicaba historias sobre a lúa.',
      'Conversaron sobre o inmenso que é o universo e o afortunados que se sentían de gozar dese momento en compañía.',
      'Antes de entrar a descansar, Iván pechou os ollos e pediu un desexo mirando a estrela máis resplandecente.',
    ],
    questions: {
      story_08_q1: {
        question: 'Quen acompañou a Iván a mirar as estrelas?',
        hint: 'Unha persoa maior da súa familia que lle contou historias fermosas.',
        options: { opt_abuelo_ivan: 'O seu avó', opt_maestro: 'O seu mestre da escola', opt_vecino: 'Un veciño descoñecido' },
      },
      story_08_q2: {
        question: 'De que conversaron mentres miraban a noite?',
        hint: 'Falaron do ceo, as estrelas e o afortunados que se sentían.',
        options: { opt_universo: 'Sobre o grande que é o universo e as historias da lúa', opt_tareas: 'Sobre os deberes de matemáticas', opt_autobuses: 'Sobre os horarios dos trens' },
      },
      story_08_q3: {
        question: 'Que fixo Iván antes de entrar a durmir?',
        hint: 'Pechou os olliños e pensou en algo moi bonito para o futuro.',
        options: { opt_pidio_deseo: 'Pediu un desexo mirando a estrela máis brillante', opt_lloro: 'Enfadouse co seu avó', opt_rompio_silla: 'Deixou as cadeiras tiradas baixo a chuvia' },
      },
    },
    newWords: [
      { word: 'Estrela', definition: 'Astro con luz propia que brilla no ceo nocturno.' },
      { word: 'Lúa', definition: 'Satélite natural da Terra que ilumina as nosas noites.' },
      { word: 'Amigos', definition: 'Persoas queridas coas que compartimos confianza e momentos felices.' },
    ],
    drawingPrompt: 'Debuxa a Iván e ao seu avó mirando o ceo nocturno cheo de estrelas brillantes.',
  },
  lua_story_09: {
    title: 'O xardín de bolboretas',
    suggestedAgeText: '5–7 anos',
    paragraphs: [
      'Na escola de Valentina, a mestra propuxo un proxecto especial: crear un xardín de flores para convidar as bolboretas.',
      'Cada estudante sementou unha semente diferente na terra fértil e prometeu regala con constancia e esmero.',
      'Durante varias semanas, os nenos coidaron os gromos con paciencia, observando como medraban as pequenas follas.',
      'Unha mañá fermosa, o patio encheuse dun festival de pétalos amarelos, vermellos e violetas rodeados de bolboretas danzantes.',
      'Toda a comunidade celebrou o «Día das Bolboretas», orgullosos do que lograran traballando en equipo.',
    ],
    questions: {
      story_09_q1: {
        question: 'Que propuxo a mestra de Valentina á clase?',
        hint: 'Unha actividade de natureza para coidar plantas e atraer polinizadores.',
        options: { opt_jardin_mariposas: 'Sementar flores para crear un xardín de bolboretas', opt_construir_piscina: 'Construír unha piscina grande', opt_pintar_coches: 'Pintar coches de carreiras' },
      },
      story_09_q2: {
        question: 'Que fixeron os estudantes durante varias semanas?',
        hint: 'Coidaron as sementes con auga e dedicación diaria.',
        options: { opt_regar_cuidar: 'Regaron as plantas con paciencia e agardaron o seu crecemento', opt_olvidaron: 'Esquecéronse das sementes', opt_arrancaron: 'Arrincaron as follas verdes' },
      },
      story_09_q3: {
        question: 'Por que se sentiron todos tan orgullosos ao final?',
        hint: 'Descubriron que axudándose uns a outros lógranse cousas asombrosas.',
        options: { opt_trabajo_equipo: 'Polo froito do seu traballo colaborativo en equipo', opt_ganaron_dinero: 'Porque gañaron un premio en diñeiro', opt_comieron_dulces: 'Porque non tiveron que estudar' },
      },
    },
    newWords: [
      { word: 'Semente', definition: 'Gran do que nace e se desenvolve unha planta nova.' },
      { word: 'Paciencia', definition: 'Capacidade de agardar con calma mentres as cousas medran.' },
      { word: 'Equipo', definition: 'Grupo de persoas que colaboran unidas cun obxectivo común.' },
    ],
    drawingPrompt: 'Debuxa o xardín florecido con bolboretas de moitas cores e os nenos celebrando.',
  },
  lua_story_10: {
    title: 'O equipo que coidou a praia',
    suggestedAgeText: '7–10 anos',
    paragraphs: [
      'Un grupo de amigos do barrio decidiu organizar unha xornada ecolóxica voluntaria para limpar a súa praia favorita.',
      'Cada participante levou bolsas de tea e luvas protectoras, organizándose en cuadrillas para percorrer toda a franxa costeira.',
      'A medida que retiraban plásticos e residuos, tamén atoparon caramuxos fermosos e cunchas pulidas que decidiron conservar.',
      'Ao rematar a tarde, a praia lucía impecable e brillante baixo o sol, e todos compartiron unha profunda satisfacción cívica.',
      'Para celebralo, organizaron unha merenda comunitaria sobre a area limpa e acordaron xuntarse unha vez ao mes para manter viva a iniciativa.',
    ],
    questions: {
      story_10_q1: {
        question: 'Que iniciativa decidiron liderar os amigos do barrio?',
        hint: 'Unha acción cidadá para protexer a natureza mariña.',
        options: { opt_jornada_limpieza: 'Unha xornada ecolóxica para limpar a beira da praia', opt_torneo_futbol: 'Un torneo competitivo de fútbol praia', opt_vender_comida: 'Vender refrescos na area' },
      },
      story_10_q2: {
        question: 'Ademais de retirar lixo, que tesouros atoparon entre a area?',
        hint: 'Elementos naturais do mar que gardaron con alegría como lembranza.',
        options: { opt_caracolas_conchas: 'Caramuxos mariños e cunchas pulidas polo mar', opt_monedas_oro: 'Moedas de ouro enterradas', opt_juguetes_rotos: 'Xoguetes electrónicos' },
      },
      story_10_q3: {
        question: 'Que compromiso adoptou o grupo de cara ao futuro?',
        hint: 'Decidiron que o coidado do medio ambiente debe ser constante.',
        options: { opt_compromiso_mensual: 'Xuntarse unha vez ao mes para coidar e manter limpa a praia', opt_no_volver: 'Non volver nunca máis á praia', opt_cobrar_entrada: 'Cobrar entrada aos bañistas' },
      },
    },
    newWords: [
      { word: 'Comunidade', definition: 'Conxunto de persoas que conviven e colaboran polo benestar común.' },
      { word: 'Ecolóxico', definition: 'Que protexe e respecta o equilibrio da natureza e os ecosistemas.' },
      { word: 'Compromiso', definition: 'Promesa ou responsabilidade que asumimos con nós mesmos e cos demais.' },
    ],
    drawingPrompt: 'Debuxa a praia limpa e brillante co grupo de amigos celebrando a súa merenda.',
  },
};

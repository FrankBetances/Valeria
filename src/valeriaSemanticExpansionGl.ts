// ============================================================================
// Valeria+ · Expansión Semántica en GALEGO — plan Proxecto Nós (GL-2.x)
// Versión galega dos catro bloques de expansión léxica (escenarios de vida
// diaria, categorías léxicas, progresións de campo semántico e cápsulas de
// contraste). Mesmas interfaces que o banco base (valeriaSemanticExpansion);
// o contido NON se traduce palabra por palabra: reescríbese co léxico galego
// e coas aproximacións fonéticas propias do galego infantil
// (`stt_expected_array`).
//
// POR QUE EXISTE: ata agora o galego só tiña banco propio en Pares Mínimos,
// Cápsulas TPR e Rutas; Expansión Semántica caía ao banco castelán, así que
// nunha sesión en galego a nena escoitaba castelán con voz de Celtia (ou, se
// o texto era galego sen asset, a voz do sistema lendo galego con acento
// castelán). Con este banco, o galego está presente en TODOS os exercicios e
// cada locución ten o seu asset neuronal de Celtia (enumerado no corpus).
//
// ESTADO: ✅ APROBADO PARA PRODUCIÓN (27 de xullo de 2026). Revisión logopédica
// cumprida sobre o contido galego dos catro bloques; sintetízase con Celtia
// (Proxecto Nós) e emítese nas sesións en galego.
//
// Módulo PURO (enumerable en build-time): só importa tipos do banco base.
// ============================================================================
import {
  DailyScenario, LexicalCategory, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';

// ---------------------------------------------------------------------------
// 1. Escenarios da vida diaria (2 substantivos, 2 verbos, 1 adxectivo, 1 onom.)
// ---------------------------------------------------------------------------
export const DAILY_SCENARIOS_GL: DailyScenario[] = [
  {
    id: 'mana', title: 'Rutina da mañá', icon: '☀️', subtitle: 'Espertar, lavarse, vestirse e almorzar',
    items: [
      {
        id: 'mana-espertar', type: 'verbo', label: 'espertar', emoji: '⏰', pictogram: 'despertador',
        visual_prompt: 'Despertador clásico con dos campanas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primeiro espertamos. Di: espertar.',
        stt_expected_array: ['espertar', 'esperta', 'pertar', 'espertá', 'despertar'],
        parent_tpr_action: 'Tápate coma se durmises e estírate co neno ao soar o «rin, rin».',
      },
      {
        id: 'mana-lavar', type: 'verbo', label: 'lavar', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Despois lavámonos. Di: lavar.',
        stt_expected_array: ['lavar', 'lava', 'avar', 'laba', 'aba'],
        parent_tpr_action: 'Fregade as mans xuntos coma se vos enxaboasedes.',
      },
      {
        id: 'mana-vestir', type: 'verbo', label: 'vestir', emoji: '👕', pictogram: 'vestir',
        visual_prompt: 'Camiseta infantil de frente, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Logo vestímonos. Di: vestir.',
        stt_expected_array: ['vestir', 'viste', 'vesti', 'betir', 'etir'],
        parent_tpr_action: 'Pasa unha camiseta pola cabeza do neno e celebrádeo ao asomar.',
      },
      {
        id: 'mana-almorzar', type: 'verbo', label: 'almorzar', emoji: '🥛', pictogram: 'vaso-leche',
        visual_prompt: 'Vaso de leche lleno, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ao final almorzamos. Di: almorzar.',
        stt_expected_array: ['almorzar', 'almorza', 'morzar', 'almozar', 'almorzá'],
        parent_tpr_action: 'Simulade xuntos que bebedes un vaso de leite coas dúas mans.',
      },
    ],
  },
  {
    id: 'comida', title: 'Hora de comer', icon: '🍽️', subtitle: 'Lavarse, sentar, comer e recoller',
    items: [
      {
        id: 'comida-lavar', type: 'verbo', label: 'lavar', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primeiro lavamos as mans. Di: lavar.',
        stt_expected_array: ['lavar', 'lava', 'avar', 'laba', 'aba'],
        parent_tpr_action: 'Fregade as mans xuntos coma se vos enxaboasedes.',
      },
      {
        id: 'comida-sentar', type: 'verbo', label: 'sentar', emoji: '🪑', pictogram: 'silla',
        visual_prompt: 'Silla de madera de frente, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Despois sentamos á mesa. Di: sentar.',
        stt_expected_array: ['sentar', 'senta', 'entar', 'sentá', 'tentar'],
        parent_tpr_action: 'Sentádevos xuntos en dúas cadeiras, un fronte ao outro.',
      },
      {
        id: 'comida-comer', type: 'verbo', label: 'comer', emoji: '🥄', pictogram: 'comer',
        visual_prompt: 'Niño comiendo con cuchara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Logo comemos. Di: comer.',
        stt_expected_array: ['comer', 'come', 'omer', 'comé', 'tomer'],
        parent_tpr_action: 'Levade xuntos unha culler imaxinaria á boca.',
      },
      {
        id: 'comida-recoller', type: 'verbo', label: 'recoller', emoji: '🍽️', pictogram: 'plato',
        visual_prompt: 'Plato vacío con tenedor y cuchara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ao final recollemos o prato. Di: recoller.',
        stt_expected_array: ['recoller', 'recolle', 'coller', 'ecoller', 'recoler'],
        parent_tpr_action: 'Levade xuntos un prato (de verdade ou imaxinario) ata a cociña.',
      },
    ],
  },
  {
    id: 'parque', title: 'No parque', icon: '🌳', subtitle: 'Zapatos, parque, tobogán e á casa',
    items: [
      {
        id: 'parque-zapatos', type: 'sustantivo', label: 'zapatos', emoji: '👟', pictogram: 'zapato',
        visual_prompt: 'Zapato infantil de perfil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primeiro poñemos os zapatos. Di: zapatos.',
        stt_expected_array: ['zapatos', 'zapato', 'apatos', 'sapatos', 'patos'],
        parent_tpr_action: 'Sinalade os zapatos do neno e tocádeos xuntos.',
      },
      {
        id: 'parque-parque', type: 'sustantivo', label: 'parque', emoji: '🌳', pictogram: 'arbol',
        visual_prompt: 'Árbol frondoso, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Despois imos ao parque. Di: parque.',
        stt_expected_array: ['parque', 'arque', 'paque', 'parke', 'pake'],
        parent_tpr_action: 'Camiñade xuntos uns pasos pola habitación cara «ao parque».',
      },
      {
        id: 'parque-tobogan', type: 'sustantivo', label: 'tobogán', emoji: '🛝', pictogram: 'tobogan',
        visual_prompt: 'Tobogán infantil de perfil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Logo baixamos polo tobogán. Di: tobogán.',
        stt_expected_array: ['tobogán', 'tobogan', 'bogán', 'obogán', 'togán'],
        parent_tpr_action: 'Facede xuntos o xesto de esvarar cos brazos no alto.',
      },
      {
        id: 'parque-casa', type: 'sustantivo', label: 'casa', emoji: '🏠', pictogram: 'casa',
        visual_prompt: 'Casa sencilla con tejado y puerta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ao final volvemos á casa. Di: casa.',
        stt_expected_array: ['casa', 'asa', 'tasa', 'cada', 'caza'],
        parent_tpr_action: 'Xuntade as mans sobre a cabeza formando un tellado.',
      },
    ],
  },
  {
    id: 'bano', title: 'Hora do baño', icon: '🛁', subtitle: 'Bañeira, xabón, auga e toalla',
    items: [
      {
        id: 'bano-baneira', type: 'sustantivo', label: 'bañeira', emoji: '🛁', pictogram: 'banera',
        visual_prompt: 'Bañera con patas y agua, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primeiro metémonos na bañeira. Di: bañeira.',
        stt_expected_array: ['bañeira', 'baneira', 'añeira', 'bañera', 'bañeia'],
        parent_tpr_action: 'Levantade xuntos unha perna coma se entrasedes na bañeira.',
      },
      {
        id: 'bano-xabon', type: 'sustantivo', label: 'xabón', emoji: '🧽', pictogram: 'esponja',
        visual_prompt: 'Esponja amarilla con espuma, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Despois enxaboámonos. Di: xabón.',
        stt_expected_array: ['xabón', 'xabon', 'abón', 'jabón', 'xabó'],
        parent_tpr_action: 'Fregade os brazos do neno cunha esponxa imaxinaria.',
      },
      {
        id: 'bano-auga', type: 'sustantivo', label: 'auga', emoji: '💧', pictogram: 'gota',
        visual_prompt: 'Gota de agua azul, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Logo aclarámonos con auga. Di: auga.',
        stt_expected_array: ['auga', 'aua', 'awa', 'aga'],
        parent_tpr_action: 'Deixade caer os dedos sobre a cabeza do neno coma pingas.',
      },
      {
        id: 'bano-toalla', type: 'sustantivo', label: 'toalla', emoji: '🧺', pictogram: 'toalla',
        visual_prompt: 'Toalla doblada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ao final secámonos coa toalla. Di: toalla.',
        stt_expected_array: ['toalla', 'toaya', 'oalla', 'talla', 'tualla'],
        parent_tpr_action: 'Envolvede o neno nunha toalla (ou nos teus brazos) e secádeo.',
      },
    ],
  },
  {
    id: 'noite', title: 'A durmir', icon: '🌙', subtitle: 'Pixama, dentes, conto e a durmir',
    items: [
      {
        id: 'noite-pixama', type: 'sustantivo', label: 'pixama', emoji: '👕', pictogram: 'pijama',
        visual_prompt: 'Pijama infantil de dos piezas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primeiro poñemos o pixama. Di: pixama.',
        stt_expected_array: ['pixama', 'pijama', 'ixama', 'pisama', 'pixam'],
        parent_tpr_action: 'Sinalade o pixama do neno e tocade os botóns xuntos.',
      },
      {
        id: 'noite-dentes', type: 'sustantivo', label: 'dentes', emoji: '🪥', pictogram: 'cepillo',
        visual_prompt: 'Cepillo de dientes con pasta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Despois lavamos os dentes. Di: dentes.',
        stt_expected_array: ['dentes', 'dente', 'entes', 'dientes', 'tentes'],
        parent_tpr_action: 'Facede xuntos o xesto de cepillar os dentes.',
      },
      {
        id: 'noite-conto', type: 'sustantivo', label: 'conto', emoji: '📖', pictogram: 'libro',
        visual_prompt: 'Libro de cuentos abierto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Logo lemos un conto. Di: conto.',
        stt_expected_array: ['conto', 'onto', 'cono', 'tonto', 'conta'],
        parent_tpr_action: 'Abride as mans coma un libro e pasade unha páxina xuntos.',
      },
      {
        id: 'noite-durmir', type: 'verbo', label: 'durmir', emoji: '😴', pictogram: 'dormir',
        visual_prompt: 'Niño dormido en la almohada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ao final imos durmir. Di: durmir.',
        stt_expected_array: ['durmir', 'durmí', 'urmir', 'dormir', 'dumir'],
        parent_tpr_action: 'Apoiade a cabeza nas mans xuntas e pechade os ollos.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 1-bis. CATEGORÍAS LÉXICAS · Vocabulario por campo (DC-1, opción C · ES-08)
//    Seis ítems por categoría, declarados de menos a máis difícil. A progresión
//    de familiaridade é a mesma que fixou ACOPROS, calibrada co léxico galego:
//    a froita de cada día antes que a que se ve de cando en vez.
// ---------------------------------------------------------------------------
export const LEXICAL_CATEGORIES_GL: LexicalCategory[] = [
  {
    id: 'gl-cat-froitas', title: 'Froitas', icon: '🍎',
    subtitle: 'Da froita de cada día á que se ve de cando en vez',
    items: [
      {
        id: 'gl-cat-froitas-maza', type: 'sustantivo', label: 'mazá', emoji: '🍎', difficulty: 1,
        visual_prompt: 'Mazá vermella de fronte con folla verde, sen fondo, alto contraste, contorno groso, cores planas.',
        tts_string: 'Isto é unha mazá. Di: mazá.',
        stt_expected_array: ['mazá', 'maza', 'azá', 'masá', 'mafá'],
        parent_tpr_action: 'Dálle un trabo a unha mazá de verdade (ou de xoguete) e que a nena imite o crequenar: ñac!',
      },
      {
        id: 'gl-cat-froitas-platano', type: 'sustantivo', label: 'plátano', emoji: '🍌', difficulty: 1,
        visual_prompt: 'Plátano amarelo curvado de perfil, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un plátano. Di: plátano.',
        stt_expected_array: ['plátano', 'platano', 'pátano', 'tano', 'panano'],
        parent_tpr_action: 'Pelade xuntos un plátano baixando cada tira amodo mentres dicides a palabra.',
      },
      {
        id: 'gl-cat-froitas-laranxa', type: 'sustantivo', label: 'laranxa', emoji: '🍊', difficulty: 1,
        visual_prompt: 'Laranxa enteira de fronte con folla, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é unha laranxa. Di: laranxa.',
        stt_expected_array: ['laranxa', 'laanxa', 'aranxa', 'lanxa', 'laransa'],
        parent_tpr_action: 'Facede rodar unha laranxa pola mesa dun ao outro, nomeándoa en cada pase.',
      },
      {
        id: 'gl-cat-froitas-pera', type: 'sustantivo', label: 'pera', emoji: '🍐', difficulty: 2,
        visual_prompt: 'Pera verde de perfil con rabiño, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é unha pera. Di: pera.',
        stt_expected_array: ['pera', 'peda', 'pea', 'bera'],
        parent_tpr_action: 'Debuxade a silueta da pera no aire co dedo: ancha abaixo, estreita arriba.',
      },
      {
        id: 'gl-cat-froitas-ananas', type: 'sustantivo', label: 'ananás', emoji: '🍍', difficulty: 3,
        visual_prompt: 'Ananás enteiro con coroa de follas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un ananás. Di: ananás.',
        stt_expected_array: ['ananás', 'ananas', 'nanás', 'anás', 'piña'],
        parent_tpr_action: 'Poñede as mans abertas sobre a cabeza coma a coroa do ananás e dicide a palabra.',
      },
      {
        id: 'gl-cat-froitas-cereixa', type: 'sustantivo', label: 'cereixa', emoji: '🍒', difficulty: 3,
        visual_prompt: 'Dúas cereixas vermellas unidas polo rabiño, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é unha cereixa. Di: cereixa.',
        stt_expected_array: ['cereixa', 'cereisa', 'ereixa', 'tereixa', 'cerexa'],
        parent_tpr_action: 'Pendurade dúas cereixas (ou dúas boliñas de papel) da orella coma pendentes e ride xuntos.',
      },
    ],
  },
  {
    id: 'gl-cat-animais', title: 'Animais', icon: '🐶',
    subtitle: 'Dos da casa aos que só se ven no zoo',
    items: [
      {
        id: 'gl-cat-animais-can', type: 'sustantivo', label: 'can', emoji: '🐶', difficulty: 1,
        visual_prompt: 'Cabeza de can de fronte, orellas caídas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un can. Di: can.',
        stt_expected_array: ['can', 'an', 'ca', 'cam', 'tan'],
        parent_tpr_action: 'Poñédevos a catro patas e dade tres pasos ladrando xuntos.',
      },
      {
        id: 'gl-cat-animais-gato', type: 'sustantivo', label: 'gato', emoji: '🐱', difficulty: 1,
        visual_prompt: 'Cabeza de gato de fronte con bigotes marcados, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un gato. Di: gato.',
        stt_expected_array: ['gato', 'tato', 'ato', 'katto', 'gao'],
        parent_tpr_action: 'Estirádevos coma un gato ao espertar e fregade a cabeza contra o brazo do outro.',
      },
      {
        id: 'gl-cat-animais-pato', type: 'sustantivo', label: 'pato', emoji: '🦆', difficulty: 2,
        visual_prompt: 'Pato de perfil con bico laranxa, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un pato. Di: pato.',
        stt_expected_array: ['pato', 'tato', 'ato', 'bato', 'pao'],
        parent_tpr_action: 'Camiñade en fila movendo o cu coma patos ata a porta.',
      },
      {
        id: 'gl-cat-animais-vaca', type: 'sustantivo', label: 'vaca', emoji: '🐄', difficulty: 2,
        visual_prompt: 'Vaca de perfil con manchas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é unha vaca. Di: vaca.',
        stt_expected_array: ['vaca', 'baca', 'aca', 'taca', 'bata'],
        parent_tpr_action: 'Poñede dous dedos na cabeza coma cornos e dicide a palabra mirándovos.',
      },
      {
        id: 'gl-cat-animais-elefante', type: 'sustantivo', label: 'elefante', emoji: '🐘', difficulty: 3,
        visual_prompt: 'Elefante de perfil coa trompa levantada, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un elefante. Di: elefante.',
        stt_expected_array: ['elefante', 'efante', 'elefan', 'efate', 'lefante'],
        parent_tpr_action: 'Facede a trompa co brazo colgando diante da cara e abaneádea ao dicilo.',
      },
      {
        id: 'gl-cat-animais-xirafa', type: 'sustantivo', label: 'xirafa', emoji: '🦒', difficulty: 3,
        visual_prompt: 'Xirafa de corpo enteiro con pescozo longo e manchas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é unha xirafa. Di: xirafa.',
        stt_expected_array: ['xirafa', 'irafa', 'sirafa', 'xifafa', 'xiafa'],
        parent_tpr_action: 'Estirade o pescozo e os brazos cara arriba, o máis alto posible, para alcanzar unha folla.',
      },
    ],
  },
  {
    id: 'gl-cat-transportes', title: 'Transportes', icon: '🚗',
    subtitle: 'Do que pasa pola rúa ao que case nunca se ve',
    items: [
      {
        id: 'gl-cat-transportes-coche', type: 'sustantivo', label: 'coche', emoji: '🚗', difficulty: 1,
        visual_prompt: 'Coche de perfil, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un coche. Di: coche.',
        stt_expected_array: ['coche', 'toche', 'oche', 'cote', 'choche'],
        parent_tpr_action: 'Empurrade un coche de xoguete polo chan ata chocar suavemente co pé da nena.',
      },
      {
        id: 'gl-cat-transportes-moto', type: 'sustantivo', label: 'moto', emoji: '🏍️', difficulty: 1,
        visual_prompt: 'Motocicleta de perfil, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é unha moto. Di: moto.',
        stt_expected_array: ['moto', 'oto', 'mota', 'boto', 'moo'],
        parent_tpr_action: 'Agarrade un guiador imaxinario e acelerade os dous á vez facendo ruído de motor.',
      },
      {
        id: 'gl-cat-transportes-tren', type: 'sustantivo', label: 'tren', emoji: '🚆', difficulty: 2,
        visual_prompt: 'Tren de perfil con dous vagóns, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un tren. Di: tren.',
        stt_expected_array: ['tren', 'ten', 'tenn', 'tlen', 'te'],
        parent_tpr_action: 'Facede un tren: a nena agárrase á túa cintura e dades unha volta ao cuarto.',
      },
      {
        id: 'gl-cat-transportes-barco', type: 'sustantivo', label: 'barco', emoji: '🚢', difficulty: 2,
        visual_prompt: 'Barco de perfil sobre unha liña de auga, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un barco. Di: barco.',
        stt_expected_array: ['barco', 'baco', 'arco', 'balco', 'bato'],
        parent_tpr_action: 'Sentade no chan e abaneádevos coma se o barco subise e baixase coas ondas.',
      },
      {
        id: 'gl-cat-transportes-avion', type: 'sustantivo', label: 'avión', emoji: '✈️', difficulty: 3,
        visual_prompt: 'Avión visto desde abaixo coas ás estendidas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un avión. Di: avión.',
        stt_expected_array: ['avión', 'avion', 'abión', 'aión', 'ión'],
        parent_tpr_action: 'Abride os brazos coma ás e dade unha volta polo cuarto inclinándovos nas curvas.',
      },
      {
        id: 'gl-cat-transportes-camion', type: 'sustantivo', label: 'camión', emoji: '🚚', difficulty: 3,
        visual_prompt: 'Camión de perfil con caixa de carga, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é un camión. Di: camión.',
        stt_expected_array: ['camión', 'camion', 'camió', 'tamión', 'mión'],
        parent_tpr_action: 'Cargade tres xoguetes nunha caixa e arrastrádea xuntos coma se fose o remolque.',
      },
    ],
  },
  {
    id: 'gl-cat-cores', title: 'Cores', icon: '🎨',
    subtitle: 'Do vermello e o azul ás que custan máis de nomear',
    items: [
      {
        id: 'gl-cat-cores-vermello', type: 'adjetivo', label: 'vermello', emoji: '🔴', pictogram: 'color-rojo', difficulty: 1,
        visual_prompt: 'Círculo vermello pleno con contorno groso, sen fondo, sen degradados.',
        tts_string: 'Esta cor é vermella. Di: vermello.',
        stt_expected_array: ['vermello', 'bermello', 'ermello', 'vermeyo', 'mello'],
        parent_tpr_action: 'Buscade xuntos tres cousas vermellas polo cuarto e tocádeas nomeando a cor.',
      },
      {
        id: 'gl-cat-cores-azul', type: 'adjetivo', label: 'azul', emoji: '🔵', pictogram: 'color-azul', difficulty: 1,
        visual_prompt: 'Círculo azul pleno con contorno groso, sen fondo, sen degradados.',
        tts_string: 'Esta cor é azul. Di: azul.',
        stt_expected_array: ['azul', 'asul', 'aul', 'atul', 'azú'],
        parent_tpr_action: 'Sinalade o ceo ou algo azul da roupa da nena e dicide a cor á vez.',
      },
      {
        id: 'gl-cat-cores-amarelo', type: 'adjetivo', label: 'amarelo', emoji: '🟡', pictogram: 'color-amarillo', difficulty: 2,
        visual_prompt: 'Círculo amarelo pleno con contorno groso, sen fondo, sen degradados.',
        tts_string: 'Esta cor é amarela. Di: amarelo.',
        stt_expected_array: ['amarelo', 'amaelo', 'marelo', 'amaelo', 'amareo'],
        parent_tpr_action: 'Facede un sol grande cos brazos e dicide a cor mirando cara arriba.',
      },
      {
        id: 'gl-cat-cores-verde', type: 'adjetivo', label: 'verde', emoji: '🟢', pictogram: 'color-verde', difficulty: 2,
        visual_prompt: 'Círculo verde pleno con contorno groso, sen fondo, sen degradados.',
        tts_string: 'Esta cor é verde. Di: verde.',
        stt_expected_array: ['verde', 'bede', 'erde', 'belde', 'bere'],
        parent_tpr_action: 'Saíde buscar unha folla ou unha planta e tocádea mentres dicides a cor.',
      },
      {
        id: 'gl-cat-cores-morado', type: 'adjetivo', label: 'morado', emoji: '🟣', pictogram: 'color-morado', difficulty: 3,
        visual_prompt: 'Círculo morado pleno con contorno groso, sen fondo, sen degradados.',
        tts_string: 'Esta cor é morada. Di: morado.',
        stt_expected_array: ['morado', 'morao', 'moado', 'molado', 'orado'],
        parent_tpr_action: 'Mesturade diante da nena un pouco de vermello e azul (pintura ou plastilina) e nomeade o que sae.',
      },
      {
        id: 'gl-cat-cores-marron', type: 'adjetivo', label: 'marrón', emoji: '🟤', pictogram: 'color-marron', difficulty: 3,
        visual_prompt: 'Círculo marrón pleno con contorno groso, sen fondo, sen degradados.',
        tts_string: 'Esta cor é marrón. Di: marrón.',
        stt_expected_array: ['marrón', 'marron', 'maón', 'malón', 'marró'],
        parent_tpr_action: 'Tocade xuntos algo de madeira —unha mesa, unha cadeira— e dicide a cor ao tocalo.',
      },
    ],
  },
  {
    id: 'gl-cat-corpo', title: 'O corpo', icon: '🖐️',
    subtitle: 'Do que se sinala só ao que hai que buscar',
    items: [
      {
        id: 'gl-cat-corpo-man', type: 'sustantivo', label: 'man', emoji: '🖐️', pictogram: 'mano', difficulty: 1,
        visual_prompt: 'Man aberta de fronte cos cinco dedos separados, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é a man. Di: man.',
        stt_expected_array: ['man', 'an', 'ma', 'mam', 'mao'],
        parent_tpr_action: 'Chocade as palmas tres veces, unha por cada golpe, mirándovos aos ollos.',
      },
      {
        id: 'gl-cat-corpo-pe', type: 'sustantivo', label: 'pé', emoji: '🦶', pictogram: 'pie', difficulty: 1,
        visual_prompt: 'Pé descalzo de perfil, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o pé. Di: pé.',
        stt_expected_array: ['pé', 'pe', 'e', 'be', 'pei'],
        parent_tpr_action: 'Poñede os vosos pés xuntos e comparade o tamaño antes de dar tres pisadas no chan.',
      },
      {
        id: 'gl-cat-corpo-boca', type: 'sustantivo', label: 'boca', emoji: '👄', pictogram: 'boca', difficulty: 2,
        visual_prompt: 'Boca de fronte lixeiramente aberta, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é a boca. Di: boca.',
        stt_expected_array: ['boca', 'oca', 'bota', 'poca', 'boa'],
        parent_tpr_action: 'Poñédevos fronte ao espello e abride e pechade a boca á vez, moi amodo.',
      },
      {
        id: 'gl-cat-corpo-ollo', type: 'sustantivo', label: 'ollo', emoji: '👁️', pictogram: 'ojo', difficulty: 2,
        visual_prompt: 'Ollo aberto de fronte con pestanas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o ollo. Di: ollo.',
        stt_expected_array: ['ollo', 'oo', 'oyo', 'olo', 'oio'],
        parent_tpr_action: 'Xogade a taparvos os ollos e destapalos cun “cucú!” cada vez que dicides a palabra.',
      },
      {
        id: 'gl-cat-corpo-xeonllo', type: 'sustantivo', label: 'xeonllo', emoji: '🦵', pictogram: 'rodilla', difficulty: 3,
        visual_prompt: 'Perna de perfil co xeonllo marcado e flexionado, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o xeonllo. Di: xeonllo.',
        stt_expected_array: ['xeonllo', 'seonllo', 'xeonyo', 'eonllo', 'xonllo'],
        parent_tpr_action: 'Dobrade os xeonllos á vez ata quedar en crocas e subide dicindo a palabra.',
      },
      {
        id: 'gl-cat-corpo-cobado', type: 'sustantivo', label: 'cóbado', emoji: '💪', pictogram: 'codo', difficulty: 3,
        visual_prompt: 'Brazo dobrado de perfil co cóbado ben marcado, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o cóbado. Di: cóbado.',
        stt_expected_array: ['cóbado', 'cobado', 'obado', 'tobado', 'cobao'],
        parent_tpr_action: 'Saudádevos chocando os cóbados, coma se facía na pandemia, tres veces seguidas.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. PROGRESIÓN LÉXICA · Campo semántico dun concepto (DC-2, opción A)
//    Catro pasos por secuencia: que é, que ten, que fai e como é. Ningunha
//    fase pide unha onomatopeya (ES-10) e o tts_string di o obxectivo UNHA soa
//    vez antes de pedilo (ES-06).
// ---------------------------------------------------------------------------
export const PROGRESSION_SEQUENCES_GL: ProgressionSequence[] = [
  {
    id: 'gl-seq-coche', theme: 'Transporte · O coche', icon: '🚗',
    phases: [
      {
        kind: 'concepto', label: 'coche', emoji: '🚗',
        visual_prompt: 'Coche de xoguete de fronte, cores planas, rodas grandes, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o coche. Di: coche.',
        stt_expected_array: ['coche', 'oche', 'tote', 'cote', 'oto'],
        parent_tpr_action: 'Pon o coche na man da nena, sinálao e repetide xuntos “coche” mentres o movedes.',
      },
      {
        kind: 'parte', label: 'roda', emoji: '🛞',
        pictogram: 'rueda',
        visual_prompt: 'Unha roda de coche de fronte, negra con llanta clara, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O coche ten catro rodas. Di: roda.',
        stt_expected_array: ['roda', 'oda', 'loda', 'rada', 'rod'],
        parent_tpr_action: 'Collede o coche e xirade unha roda co dedo da nena, repetindo “roda” en cada volta.',
      },
      {
        kind: 'accion', label: 'corre', emoji: '💨',
        pictogram: 'correr',
        visual_prompt: 'Coche con liñas de velocidade detrás avanzando cara á dereita, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O coche corre. Di: corre.',
        stt_expected_array: ['corre', 'core', 'ore', 'cotte', 'coé'],
        parent_tpr_action: 'Fai correr o coche pola mesa e despois polo brazo da nena, acelerando ao dicir “corre”.',
      },
      {
        kind: 'cualidad', label: 'rápido', emoji: '🚗',
        visual_prompt: 'Coche cun raio e tres liñas de velocidade marcadas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O coche é moi rápido. Di: rápido.',
        stt_expected_array: ['rápido', 'rapido', 'apido', 'pido', 'papido'],
        parent_tpr_action: 'Corre coa nena da man uns pasos e frenade de golpe dicindo “rápido… e stop!”.',
      },
    ],
  },
  {
    id: 'gl-seq-can', theme: 'Animais · O can', icon: '🐶',
    phases: [
      {
        kind: 'concepto', label: 'can', emoji: '🐕',
        visual_prompt: 'Can sentado de fronte, orellas caídas, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o can. Di: can.',
        stt_expected_array: ['can', 'an', 'ca', 'cam', 'tan'],
        parent_tpr_action: 'Sinala un can de xoguete ou unha foto e acariñádeo xuntos repetindo “can”.',
      },
      {
        kind: 'parte', label: 'pata', emoji: '🐾',
        visual_prompt: 'Pegada de pata de can con catro dedos e almofadiña, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O can ten catro patas. Di: pata.',
        stt_expected_array: ['pata', 'ata', 'pat', 'para', 'patta'],
        parent_tpr_action: 'Poñede as mans no chan coma patas e camiñade a catro patas un par de pasos dicindo “pata”.',
      },
      {
        kind: 'accion', label: 'salta', emoji: '⬆️',
        pictogram: 'saltar',
        visual_prompt: 'Can no aire coas patas recollidas e unha curva de salto, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O can salta para coller a pelota. Di: salta.',
        stt_expected_array: ['salta', 'sata', 'ata', 'talta', 'atá'],
        parent_tpr_action: 'Fai saltar o can de xoguete e saltade os dous á vez dicindo “salta!”.',
      },
      {
        kind: 'cualidad', label: 'peludo', emoji: '🐕',
        visual_prompt: 'Can con pelaxe moi esponxosa e liñas de textura suave, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O can é brandiño e peludo. Di: peludo.',
        stt_expected_array: ['peludo', 'peu', 'eludo', 'pelu', 'peúdo'],
        parent_tpr_action: 'Acariñade un peluche ou unha manta suave e dicide “peludo” pasando a man amodo.',
      },
    ],
  },
  {
    id: 'gl-seq-vaca', theme: 'Animais · A vaca', icon: '🐄',
    phases: [
      {
        kind: 'concepto', label: 'vaca', emoji: '🐄',
        visual_prompt: 'Vaca de pé de perfil con manchas, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é a vaca. Di: vaca.',
        stt_expected_array: ['vaca', 'baca', 'aca', 'bata', 'baka'],
        parent_tpr_action: 'Sinala unha vaca de xoguete ou unha foto e percorrede as súas manchas co dedo dicindo “vaca”.',
      },
      {
        kind: 'parte', label: 'leite', emoji: '🥛',
        pictogram: 'vaso-leche',
        visual_prompt: 'Vaso de leite cheo ata arriba, branco plano, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Da vaca sae o leite. Di: leite.',
        stt_expected_array: ['leite', 'eite', 'leit', 'leche', 'eite eite'],
        parent_tpr_action: 'Servide un pouco de leite no seu vaso e dade un grolo cada un dicindo “leite” antes de beber.',
      },
      {
        kind: 'accion', label: 'come', emoji: '🌿',
        visual_prompt: 'Vaca coa cabeza agachada sobre herba verde, sen fondo, alto contraste, contorno groso.',
        tts_string: 'A vaca come herba. Di: come.',
        stt_expected_array: ['come', 'ome', 'tome', 'comé', 'meme'],
        parent_tpr_action: 'Agacha a cabeza coma a vaca e facede que mastigades herba movendo a mandíbula ao dicir “come”.',
      },
      {
        kind: 'cualidad', label: 'grande', emoji: '🐄',
        visual_prompt: 'Vaca xunto a unha silueta pequena de nena para marcar o contraste de tamaño, sen fondo, alto contraste, contorno groso.',
        tts_string: 'A vaca é moi grande. Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'granne'],
        parent_tpr_action: 'Abride os brazos todo o que poidades e poñédevos de puntas dicindo “graaande!”.',
      },
    ],
  },
  {
    id: 'gl-seq-gato', theme: 'Animais · O gato', icon: '🐱',
    phases: [
      {
        kind: 'concepto', label: 'gato', emoji: '🐈',
        visual_prompt: 'Gato sentado de fronte coa cola enroscada, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o gato. Di: gato.',
        stt_expected_array: ['gato', 'tato', 'ato', 'gat', 'gatto'],
        parent_tpr_action: 'Sinala un gato de xoguete ou unha foto e acariñádelle o lombo repetindo “gato”.',
      },
      {
        kind: 'parte', label: 'bigote', emoji: '🐱',
        visual_prompt: 'Cara de gato en primeiro plano cos bigotes longos moi marcados, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O gato ten uns bigotes longos. Di: bigote.',
        stt_expected_array: ['bigote', 'bigotes', 'igote', 'bitote', 'gote'],
        parent_tpr_action: 'Debuxade bigotes no aire desde o nariz cara ás meixelas da nena mentres dicides “bigote”.',
      },
      {
        kind: 'accion', label: 'dorme', emoji: '😴',
        pictogram: 'dormir',
        visual_prompt: 'Gato acubillado cos ollos pechados e tres “Z” enriba, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O gato dorme na súa cama. Di: dorme.',
        stt_expected_array: ['dorme', 'orme', 'dome', 'deme', 'dommé'],
        parent_tpr_action: 'Xunta as mans baixo a meixela, pecha os ollos e fai “shhh” convidando á nena a “durmir” contigo.',
      },
      {
        kind: 'cualidad', label: 'suave', emoji: '🐈',
        visual_prompt: 'Gato cunha man acariñando o seu lombo e liñas de textura suave, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O pelo do gato é moi suave. Di: suave.',
        stt_expected_array: ['suave', 'uave', 'ave', 'sua', 'suabe'],
        parent_tpr_action: 'Pasade unha pluma ou un pano polo brazo da nena moi amodo dicindo “suave”.',
      },
    ],
  },
  {
    id: 'gl-seq-choiva', theme: 'Natureza · A choiva', icon: '🌧️',
    phases: [
      {
        kind: 'concepto', label: 'auga', emoji: '💧',
        visual_prompt: 'Unha pinga de auga grande e brillante de fronte, azul plano, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é a auga. Di: auga.',
        stt_expected_array: ['auga', 'aba', 'awa', 'aua', 'augha'],
        parent_tpr_action: 'Mollade un dedo en auga real e tocádevos a man notando o frío mentres dicides “auga”.',
      },
      {
        kind: 'parte', label: 'nube', emoji: '☁️',
        visual_prompt: 'Nube gris arredondada con tres pingas caendo por debaixo, sen fondo, alto contraste, contorno groso.',
        tts_string: 'A auga sae da nube. Di: nube.',
        stt_expected_array: ['nube', 'ube', 'nue', 'nuve', 'mube'],
        parent_tpr_action: 'Sinalade unha nube pola ventá (ou debuxade unha no aire) e dicide “nube” soprando fluxiño.',
      },
      {
        kind: 'accion', label: 'cae', emoji: '⬇️',
        visual_prompt: 'Pinga de auga cunha frecha cara abaixo e unha silueta pantasma máis arriba, sen fondo, alto contraste, contorno groso.',
        tts_string: 'A auga cae do ceo. Di: cae.',
        stt_expected_array: ['cae', 'ae', 'tae', 'cai', 'kae'],
        parent_tpr_action: 'Ergue as mans arriba e báixaas movendo os dedos ata o chan dicindo “caeee”.',
      },
      {
        kind: 'cualidad', label: 'mollado', emoji: '🤲',
        pictogram: 'manos-mojadas',
        visual_prompt: 'Dúas mans abertas con pingas de auga esvarando e pequenas salpicaduras, sen fondo, alto contraste, contorno groso.',
        tts_string: 'A man está mollada. Di: mollado.',
        stt_expected_array: ['mollado', 'mollao', 'ollado', 'molla', 'moiado'],
        parent_tpr_action: 'Molla un pouco a man da nena cunha toalliña e dicide “mollado” sacudindo as mans.',
      },
    ],
  },
  {
    id: 'gl-seq-tren', theme: 'Transporte · O tren', icon: '🚂',
    phases: [
      {
        kind: 'concepto', label: 'tren', emoji: '🚆',
        visual_prompt: 'Tren de tres vagóns de perfil sobre unha vía recta, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o tren. Di: tren.',
        stt_expected_array: ['tren', 'ten', 'te', 'tan', 'tren tren'],
        parent_tpr_action: 'Facede un treniño: a nena agárrase á túa cintura e avanzade polo corredor repetindo “tren”.',
      },
      {
        kind: 'parte', label: 'vagón', emoji: '🚃',
        visual_prompt: 'Un só vagón de tren de perfil, con ventás cadradas e rodas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O tren leva moitos vagóns. Di: vagón.',
        stt_expected_array: ['vagón', 'vagon', 'agón', 'bagón', 'gon'],
        parent_tpr_action: 'Poñede en fila tres caixas ou coxíns coma vagóns e enganchádeos dicindo “vagón” en cada un.',
      },
      {
        kind: 'accion', label: 'para', emoji: '🛑',
        pictogram: 'parar',
        visual_prompt: 'Tren detido xunto a un andén cun sinal de stop, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O tren para na estación. Di: para.',
        stt_expected_array: ['para', 'ara', 'pa', 'pala', 'pará'],
        parent_tpr_action: 'Avanzade coma un tren e frenade en seco ao dicir “para!”, quedando completamente quietos.',
      },
      {
        kind: 'cualidad', label: 'longo', emoji: '🚆',
        visual_prompt: 'Tren de moitos vagóns que se estende de lado a lado da imaxe, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O tren é moi longo. Di: longo.',
        stt_expected_array: ['longo', 'ongo', 'lono', 'logo', 'lonho'],
        parent_tpr_action: 'Separade os brazos todo o posible marcando o “loooongo” que é o tren.',
      },
    ],
  },
  {
    id: 'gl-seq-paxaro', theme: 'Animais · O paxaro', icon: '🐦',
    phases: [
      {
        kind: 'concepto', label: 'paxaro', emoji: '🐦',
        pictogram: 'pajaro',
        visual_prompt: 'Paxaro pequeno de perfil pousado nunha póla, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o paxaro. Di: paxaro.',
        stt_expected_array: ['paxaro', 'pasaro', 'axaro', 'paro', 'papa'],
        parent_tpr_action: 'Sinalade un paxaro pola ventá ou nunha foto e seguídeo co dedo dicindo “paxaro”.',
      },
      {
        kind: 'parte', label: 'pluma', emoji: '🪶',
        pictogram: 'pluma',
        visual_prompt: 'Unha pluma solta vista de fronte, co raque marcado, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O paxaro ten moitas plumas. Di: pluma.',
        stt_expected_array: ['pluma', 'plumas', 'uma', 'puma', 'luma'],
        parent_tpr_action: 'Soprade unha pluma de verdade (ou un anaquiño de papel) para que flote e dicide “pluma” ao collela.',
      },
      {
        kind: 'accion', label: 'voa', emoji: '🐦',
        pictogram: 'pajaro',
        visual_prompt: 'Paxaro coas ás abertas en pleno voo e unha curva de traxectoria, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O paxaro voa polo ceo. Di: voa.',
        stt_expected_array: ['voa', 'boa', 'oa', 'vo', 'voá'],
        parent_tpr_action: 'Abride os brazos coma ás e dade unha volta polo cuarto “voando” ao dicir “voa”.',
      },
      {
        kind: 'cualidad', label: 'pequeno', emoji: '🐤',
        visual_prompt: 'Paxaro diminuto xunto a unha man aberta que o sostén, para marcar o tamaño, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O paxaro é moi pequeno. Di: pequeno.',
        stt_expected_array: ['pequeno', 'pequeño', 'equeno', 'peque', 'pekeno'],
        parent_tpr_action: 'Xuntade o índice e o polgar deixando un ocoíño e mirade por el dicindo “pequeniño”.',
      },
    ],
  },
  {
    id: 'gl-seq-pan', theme: 'Alimentación · O almorzo', icon: '🍞',
    phases: [
      {
        kind: 'concepto', label: 'pan', emoji: '🍞',
        visual_prompt: 'Rebanda de pan de molde de fronte, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o pan. Di: pan.',
        stt_expected_array: ['pan', 'an', 'pa', 'pam', 'papan'],
        parent_tpr_action: 'Pon un anaco de pan na man da nena e ulídeo xuntos antes de dicir “pan”.',
      },
      {
        kind: 'parte', label: 'cunca', emoji: '🍵',
        visual_prompt: 'Cunca de almorzo con asa vista de fronte e vapor saíndo, sen fondo, alto contraste, contorno groso.',
        tts_string: 'No almorzo bebemos da cunca. Di: cunca.',
        stt_expected_array: ['cunca', 'unca', 'tunca', 'cunta', 'cuca'],
        parent_tpr_action: 'Collede a cunca do almorzo pola asa entre os dous e dade un grolo dicindo “cunca”.',
      },
      {
        // Fase transaccional: a única do banco que sobe á COMBINACIÓN de dúas
        // palabras («quero pan»), porque aquí o obxectivo é pedir, non nomear.
        kind: 'accion', label: 'quero pan', emoji: '🙋',
        visual_prompt: 'Silueta infantil coa man erguida sinalando unha rebanda de pan, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Tes fame e pídelo. Di: quero pan.',
        stt_expected_array: ['quero pan', 'quero', 'kero pan', 'ero pan', 'quelo pan'],
        parent_tpr_action: 'Suxeita o pan á vista pero fóra do seu alcance e agarda a petición antes de darllo.',
      },
      {
        kind: 'cualidad', label: 'torrado', emoji: '🍞',
        visual_prompt: 'Rebanda de pan torrada, máis dourada e con marcas da torradora, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O pan está torrado. Di: torrado.',
        stt_expected_array: ['torrado', 'torrao', 'orrado', 'torra', 'tolado'],
        parent_tpr_action: 'Comparade unha rebanda branda e unha torrada tocándoas: a torrada crequena ao apertala.',
      },
    ],
  },
  {
    id: 'gl-seq-globo', theme: 'Xogo · O globo', icon: '🎈',
    phases: [
      {
        kind: 'concepto', label: 'globo', emoji: '🎈',
        visual_prompt: 'Globo inflado co seu nó e unha corda curta, cores planas, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Isto é o globo. Di: globo.',
        stt_expected_array: ['globo', 'gobo', 'obo', 'lobo', 'gloo'],
        parent_tpr_action: 'Dálle un globo á nena e suxeitádeo entre os dous mentres repetides “globo”.',
      },
      {
        kind: 'parte', label: 'corda', emoji: '🧵',
        pictogram: 'cuerda',
        visual_prompt: 'Corda fina e ondulada colgando, cun pequeno lazo no extremo, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O globo ten unha corda. Di: corda.',
        stt_expected_array: ['corda', 'orda', 'torda', 'coda', 'colda'],
        parent_tpr_action: 'Atade unha corda ao globo e deixade que a nena tire dela dicindo “corda”.',
      },
      {
        kind: 'accion', label: 'sopra', emoji: '💨',
        pictogram: 'soplar',
        visual_prompt: 'Boca de perfil soprando cara a un globo que se incha, con liñas de aire, sen fondo, alto contraste, contorno groso.',
        tts_string: 'Sopramos para inflar o globo. Di: sopra.',
        stt_expected_array: ['sopra', 'opra', 'popra', 'sopa', 'oprá'],
        parent_tpr_action: 'Soprade os dous á vez sobre a man do outro para notar o aire antes de dicir “sopra”.',
      },
      {
        kind: 'cualidad', label: 'redondo', emoji: '🎈',
        visual_prompt: 'Globo ben inflado e perfectamente redondo, cunha liña circular que remarca a súa forma, sen fondo, alto contraste, contorno groso.',
        tts_string: 'O globo é redondo. Di: redondo.',
        stt_expected_array: ['redondo', 'edondo', 'dondo', 'redon', 'reondo'],
        parent_tpr_action: 'Debuxade un círculo grande no aire cos dous brazos dicindo “redooondo”.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. CONTRASTE ACTIVO · Cápsulas TPR de adxectivos e verbos antónimos
//    Dúas voltas avaliadas por cápsula (palabra obxectivo e a súa oposta), coa
//    regra de congruencia ES-13: o obxecto que nomea o audio é o mesmo que
//    prepara o adulto no setup físico; só varía o atributo contrastado.
// ---------------------------------------------------------------------------
export const CONTRAST_CAPSULES_GL: ContrastCapsule[] = [
  {
    id: 'gl-cap-grande-pequeno', code: 'CT-1', kind: 'adjetivos',
    pair: ['grande', 'pequeno'], icon: '🧸',
    physical_setup: 'Prepara dous osiños de peluche iguais pero de distinto tamaño: un claramente GRANDE e outro claramente PEQUENO. Colócaos xuntos diante da nena.',
    rounds: [
      {
        label: 'grande', emoji: '🧸',
        pictogram: 'osito-grande',
        tts_trigger: 'Cal é o osiño GRANDE? Dámo e dío! Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'granne'],
        parent_action: 'A nena entrégache o osiño grande mentres o di; abrazádeo esaxerando o enorme que é.',
      },
      {
        label: 'pequeno', emoji: '🧸',
        pictogram: 'osito-pequeno',
        tts_trigger: 'Agora ao revés: cal é o osiño PEQUENO? Dámo e dío! Di: pequeno.',
        stt_expected_array: ['pequeno', 'pequeño', 'pekeno', 'equeno', 'peno'],
        parent_action: 'A nena dache o osiño pequeno; escondédeo nunha man e dicide “pequeno” con vociña mini.',
      },
    ],
  },
  {
    id: 'gl-cap-limpo-sucio', code: 'CT-2', kind: 'adjetivos',
    pair: ['limpo', 'sucio'], icon: '🥄',
    physical_setup: 'Colle dúas culleres iguais: lava unha ata deixala brillante e mancha a outra cun pouco de comida ou barro. Ponas unha ao lado da outra.',
    rounds: [
      {
        label: 'sucio', emoji: '🥄',
        pictogram: 'cuchara-sucia',
        tts_trigger: 'Sinala a culler SUCIA. Como está esta? Dío. Di: sucio.',
        stt_expected_array: ['sucio', 'utio', 'suio', 'cucho', 'ucio'],
        parent_action: 'A nena sinala a culler sucia e poñedes os dous cara de “puaj!” apartándoa.',
      },
      {
        label: 'limpo', emoji: '🥄',
        pictogram: 'cuchara-limpia',
        tts_trigger: 'E esta outra culler, como está? Mira como brilla! Di: limpo.',
        stt_expected_array: ['limpo', 'impo', 'linpo', 'limp', 'po'],
        parent_action: 'Sinalade a limpa, soprade sobre ela coma se brillase e chocade os cinco.',
      },
    ],
  },
  {
    id: 'gl-cap-abrir-pechar', code: 'CT-3', kind: 'verbos',
    pair: ['abrir', 'pechar'], icon: '📦',
    physical_setup: 'Pon diante da nena unha caixa con tapa e mete dentro, á vista, o seu xoguete favorito. Pecha a tapa.',
    rounds: [
      {
        label: 'abrir', emoji: '📦',
        pictogram: 'caja-abierta',
        tts_trigger: 'O xoguete está dentro da caixa. Que facemos para sacalo? Di: abrir.',
        stt_expected_array: ['abrir', 'abre', 'abi', 'air', 'abí'],
        parent_action: 'Abride a caixa xuntos, moi amodo, e celebrade atopar o xoguete cun “tachán!”.',
      },
      {
        label: 'pechar', emoji: '📦',
        pictogram: 'caja-cerrada',
        tts_trigger: 'Gardamos o xoguete na caixa. Que facemos coa tapa? Di: pechar.',
        stt_expected_array: ['pechar', 'pecha', 'echar', 'petar', 'pechá'],
        parent_action: 'A nena empurra a tapa ata pechala de todo mentres di a palabra.',
      },
    ],
  },
  {
    id: 'gl-cap-subir-baixar', code: 'CT-4', kind: 'verbos',
    pair: ['subir', 'baixar'], icon: '🚗',
    physical_setup: 'Fai unha rampla apoiando un libro grande inclinado e coloca un coche de xoguete ao pé da rampla.',
    rounds: [
      {
        label: 'subir', emoji: '⬆️',
        pictogram: 'coche-subiendo',
        tts_trigger: 'O coche vai á montaña. Que fai? Vai cara arriba! Di: subir.',
        stt_expected_array: ['subir', 'sube', 'ubi', 'tubi', 'subí'],
        parent_action: 'Subide o coche pola rampla moi amodo mentres soa a palabra.',
      },
      {
        label: 'baixar', emoji: '⬇️',
        pictogram: 'coche-bajando',
        tts_trigger: 'Agora o coche vai cara abaixo! Que fai? Di: baixar.',
        stt_expected_array: ['baixar', 'baixa', 'aixar', 'basar', 'baxar'],
        parent_action: 'Soltade o coche e que baixe só pola rampla; dicide “baixaaa!” mentres cae.',
      },
    ],
  },
  {
    id: 'gl-cap-frio-quente', code: 'CT-5', kind: 'adjetivos',
    pair: ['frío', 'quente'], icon: '🥤',
    physical_setup: 'Prepara dous vasos: un con auga ben fría (con xeo se hai) e outro con auga morna. Ponos diante da nena.',
    rounds: [
      {
        label: 'frío', emoji: '🥤',
        pictogram: 'vaso-frio',
        tts_trigger: 'Toca os vasos. Cal está FRÍO? Brrr! Di: frío.',
        stt_expected_array: ['frío', 'frio', 'fío', 'ío', 'fiío'],
        parent_action: 'A nena toca o vaso frío; tiritade xuntos “brrr!” encollendo os ombros.',
      },
      {
        label: 'quente', emoji: '🥤',
        pictogram: 'vaso-caliente',
        tts_trigger: 'E este outro vaso, como está? Di: quente.',
        stt_expected_array: ['quente', 'uente', 'tente', 'quen', 'kente'],
        parent_action: 'Tocade o vaso morno e abanade a man coma se queimase, esaxerando moito.',
      },
    ],
  },
  {
    id: 'gl-cap-acender-apagar', code: 'CT-6', kind: 'verbos',
    pair: ['acender', 'apagar'], icon: '💡',
    physical_setup: 'Colócate coa nena xunto ao interruptor da luz (ou colle unha lanterna). O cuarto empeza coa luz apagada.',
    rounds: [
      {
        label: 'acender', emoji: '💡',
        pictogram: 'bombilla-encendida',
        tts_trigger: 'Está escuro… Que facemos coa luz do interruptor? Di: acender.',
        stt_expected_array: ['acender', 'acende', 'cender', 'ende', 'acendé'],
        parent_action: 'A nena preme o interruptor xusto ao dicilo e celebrades a luz cun “oooh!”.',
      },
      {
        label: 'apagar', emoji: '💡',
        pictogram: 'bombilla-apagada',
        tts_trigger: 'Agora ao revés. Que facemos coa luz do interruptor? Di: apagar.',
        stt_expected_array: ['apagar', 'apaga', 'paga', 'agar', 'apagá'],
        parent_action: 'A nena apaga a luz e dicídesvos “boas noites” con voz de murmurio.',
      },
    ],
  },
  {
    id: 'gl-cap-cheo-baleiro', code: 'CT-7', kind: 'adjetivos',
    pair: ['cheo', 'baleiro'], icon: '🧺',
    physical_setup: 'Prepara dúas cestas ou caixas iguais: enche unha ata arriba de xoguetes ou calcetíns e deixa a outra completamente baleira. Ponas diante da nena.',
    rounds: [
      {
        label: 'cheo', emoji: '🧺',
        pictogram: 'cesta-llena',
        tts_trigger: 'Cal é a cesta CHEA de cousas? Sinálaa e dío! Di: cheo.',
        stt_expected_array: ['cheo', 'teo', 'chea', 'eo', 'cheu'],
        parent_action: 'A nena sinala a cesta chea; erguédea xuntos esaxerando o moito que pesa: “uf, cheaaa!”.',
      },
      {
        label: 'baleiro', emoji: '🧺',
        pictogram: 'cesta-vacia',
        tts_trigger: 'E esta outra cesta, como está? Mira dentro! Di: baleiro.',
        stt_expected_array: ['baleiro', 'baleio', 'aleiro', 'balero', 'valeiro'],
        parent_action: 'Poñede a cesta baleira boca abaixo sobre a cabeza da nena coma un sombreiro: non cae nada, está baleira!',
      },
    ],
  },
  {
    id: 'gl-cap-meter-sacar', code: 'CT-8', kind: 'verbos',
    pair: ['meter', 'sacar'], icon: '📥',
    physical_setup: 'Colle unha caixa aberta e tres xoguetes pequenos. Coloca os xoguetes FÓRA da caixa, diante da nena.',
    rounds: [
      {
        label: 'meter', emoji: '📥',
        pictogram: 'juguete-dentro',
        tts_trigger: 'Os xoguetes van á súa casa, dentro da caixa. Que facemos? Di: meter.',
        stt_expected_array: ['meter', 'mete', 'eter', 'metel', 'meté'],
        parent_action: 'A nena mete un xoguete na caixa con cada palabra; celebrade o último cun “todos dentro!”.',
      },
      {
        label: 'sacar', emoji: '📤',
        pictogram: 'juguete-fuera',
        tts_trigger: 'Agora ao revés. Que facemos cos xoguetes da caixa? Di: sacar.',
        stt_expected_array: ['sacar', 'saca', 'acar', 'tacar', 'sacá'],
        parent_action: 'A nena saca os xoguetes un a un; contádeos en fila ao saír: “un, dous e tres fóra!”.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Textos fixos da pantalla (reintento e cierre) en galego. Van aquí, xunto ao
// banco, para que a locución resolva o asset neuronal de Celtia e non caia ao
// castelán (o «salto» de voz que se detectou nas sesións en galego).
// ---------------------------------------------------------------------------
export const SEM_RETRY_GL = (label: string): string => `Outra vez! Di: ${label}.`;
export const SEM_SESSION_DONE_GL = 'Sesión completada! Choca eses cinco!';

// ES-07 · Rutinas ordenables (ACOPROS, 3.ª ronda): consigna del paso de
// ordenar (la locuta la app al niño) y repaso que hace el adulto al acabar.
export const SEM_ORDER_GL = {
  prompt: 'Imos ordenar a rutina. Que facemos primeiro?',
  action: 'Repasade xuntos a rutina en voz alta sinalando cada debuxo: primeiro, despois, logo e ao final.',
};

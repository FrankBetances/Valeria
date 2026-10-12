// ============================================================================
// Valeria+ · Expansión Semántica en ESPAÑOL DOMINICANO (es-DO) — Quisqueya Habla
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN (validación logopédica dominicana, QH-2.2).
// El veredicto final de cada ensayo sigue siendo del adulto.
//
// REGLAS DIALECTALES APLICADAS (docs/guia-dialectal-es-DO.md, QH-0.2):
//   · Léxico y registro dominicanos REALES, no "de diccionario": guagua
//     (autobús), colmado (tienda), funda (bolsa), chichigua (cometa/papalote),
//     concón, mangú, habichuela, mabí; trato afectivo papi/mami con el menor.
//   · `stt_expected_array` ACEPTAN la elisión de /s/ en coda y de /d/
//     intervocálica/final propias del habla caribeña ("do", "helao", "pescao").
//     Además, el emparejador pliega ambos lados en es-DO (valeriaVoice ·
//     foldDominican), así que la tolerancia no depende de enumerarlo todo aquí;
//     las formas elididas se listan igual para transparencia del revisor.
//   · Ningún ítem evalúa la distinción /s/–/θ/ (seseo) ni codas líquidas r/l.
//
// Validación léxica (QH-2.5): Diccionario del español dominicano (ACADOM) y
// frecuencia CORPES XXI/Common Voice es — ver docs/validacion-lexica-es-DO.md.
//
// Consume la MISMA pantalla que el castellano (ValeriaSemanticExpansionScreen),
// vía el selector valeriaSemanticBanks.semanticForLocale. Estructura idéntica al
// banco base (mismos tipos), solo cambian datos.
// ============================================================================
import {
  DailyScenario, LexicalCategory, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';

// ---------------------------------------------------------------------------
// 1. Escenarios de la vida diaria dominicana (5 · 6 ítems c/u)
// ---------------------------------------------------------------------------
export const DAILY_SCENARIOS_ESDO: DailyScenario[] = [
  {
    id: 'do-manana',
    title: 'En la mañana',
    icon: '☀️',
    subtitle: 'Despertarse, lavarse, vestirse y desayunar',
    items: [
      {
        id: 'do-manana-despertar', type: 'verbo', label: 'despertar', emoji: '⏰', pictogram: 'despertador',
        visual_prompt: 'Despertador clásico con dos campanas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primero nos despertamos. Di: despertar.',
        stt_expected_array: ['despertar', 'despierta', 'espertar', 'pertar', 'desperta'],
        parent_tpr_action: 'Tápate como si durmieras y estírate con el niño al sonar el «rin, rin».',
      },
      {
        id: 'do-manana-lavar', type: 'verbo', label: 'lavar', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Después nos lavamos. Di: lavar.',
        stt_expected_array: ['lavar', 'lava', 'avar', 'laba', 'aba'],
        parent_tpr_action: 'Frotad las manos juntos como si os enjabonarais.',
      },
      {
        id: 'do-manana-vestir', type: 'verbo', label: 'vestir', emoji: '👕', pictogram: 'vestir',
        visual_prompt: 'Camiseta infantil de frente, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Luego nos vestimos. Di: vestir.',
        stt_expected_array: ['vestir', 'viste', 'vesti', 'betir', 'etir'],
        parent_tpr_action: 'Pasa una camiseta por la cabeza del niño y celebrad al asomar.',
      },
      {
        id: 'do-manana-desayunar', type: 'verbo', label: 'desayunar', emoji: '🥛', pictogram: 'vaso-leche',
        visual_prompt: 'Vaso de leche lleno, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final desayunamos. Di: desayunar.',
        stt_expected_array: ['desayunar', 'desayuna', 'ayunar', 'desayuno', 'sayunar'],
        parent_tpr_action: 'Simulad juntos que bebéis un vaso de leche con las dos manos.',
      },
    ],
  },
  {
    id: 'do-comida',
    title: 'La comida',
    icon: '🍽️',
    subtitle: 'Lavarse, sentarse, comer y recoger',
    items: [
      {
        id: 'do-comida-lavar', type: 'verbo', label: 'lavar', emoji: '🧼', pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primero nos lavamos las manos. Di: lavar.',
        stt_expected_array: ['lavar', 'lava', 'avar', 'laba', 'aba'],
        parent_tpr_action: 'Frotad las manos juntos como si os enjabonarais.',
      },
      {
        id: 'do-comida-sentarse', type: 'verbo', label: 'sentarse', emoji: '🪑', pictogram: 'silla',
        visual_prompt: 'Silla de madera de frente, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Después nos sentamos a la mesa. Di: sentarse.',
        stt_expected_array: ['sentarse', 'sentar', 'sienta', 'sentase', 'entarse'],
        parent_tpr_action: 'Sentaos juntos en dos sillas, uno frente al otro.',
      },
      {
        id: 'do-comida-comer', type: 'verbo', label: 'comer', emoji: '🥄', pictogram: 'comer',
        visual_prompt: 'Niño comiendo con cuchara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Luego comemos. Di: comer.',
        stt_expected_array: ['comer', 'come', 'omer', 'comé', 'tomer'],
        parent_tpr_action: 'Llevad juntos una cuchara imaginaria a la boca.',
      },
      {
        id: 'do-comida-recoger', type: 'verbo', label: 'recoger', emoji: '🍽️', pictogram: 'plato',
        visual_prompt: 'Plato vacío con tenedor y cuchara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final recogemos el plato. Di: recoger.',
        stt_expected_array: ['recoger', 'recoge', 'coger', 'ecoger', 'recojer'],
        parent_tpr_action: 'Llevad juntos un plato (de verdad o imaginario) hasta la cocina.',
      },
    ],
  },
  {
    id: 'do-colmado',
    title: 'En el colmado',
    icon: '🏪',
    subtitle: 'Dinero, colmado, pedir y funda',
    items: [
      {
        id: 'do-colmado-dinero', type: 'sustantivo', label: 'dinero', emoji: '💵', pictogram: 'dinero',
        visual_prompt: 'Billete y monedas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primero agarramos el dinero. Di: dinero.',
        stt_expected_array: ['dinero', 'inero', 'dinelo', 'dinedo', 'dineo'],
        parent_tpr_action: 'Dale al niño una moneda o un papelito que haga de dinero.',
      },
      {
        id: 'do-colmado-colmado', type: 'sustantivo', label: 'colmado', emoji: '🏪', pictogram: 'tienda',
        visual_prompt: 'Fachada de una tienda pequeña con toldo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Después caminamos al colmado. Di: colmado.',
        stt_expected_array: ['colmado', 'olmado', 'comado', 'colmao', 'colado'],
        parent_tpr_action: 'Caminad juntos de la mano hasta «el colmado» (otra habitación).',
      },
      {
        id: 'do-colmado-pedir', type: 'verbo', label: 'pedir', emoji: '👉', pictogram: 'senalar',
        visual_prompt: 'Mano que señala con el índice, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Luego pedimos el mandado. Di: pedir.',
        stt_expected_array: ['pedir', 'pide', 'edir', 'pedí', 'peir'],
        parent_tpr_action: 'Que el niño señale lo que quiere y tú se lo des.',
      },
      {
        id: 'do-colmado-funda', type: 'sustantivo', label: 'funda', emoji: '🛍️', pictogram: 'funda',
        visual_prompt: 'Bolsa de la compra con asas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final lo llevamos en la funda. Di: funda.',
        stt_expected_array: ['funda', 'unda', 'fuda', 'junda'],
        parent_tpr_action: 'Meted juntos un objeto en una bolsa y llevadla a casa.',
      },
    ],
  },
  {
    id: 'do-bano',
    title: 'El baño',
    icon: '🛁',
    subtitle: 'Agua, jabón, enjuagar y toalla',
    items: [
      {
        id: 'do-bano-agua', type: 'sustantivo', label: 'agua', emoji: '💧', pictogram: 'gota',
        visual_prompt: 'Gota de agua azul, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primero nos mojamos con agua. Di: agua.',
        stt_expected_array: ['agua', 'aua', 'awa', 'gua', 'agüa'],
        parent_tpr_action: 'Dejad caer los dedos sobre la cabeza del niño como gotas.',
      },
      {
        id: 'do-bano-jabon', type: 'sustantivo', label: 'jabón', emoji: '🧽', pictogram: 'esponja',
        visual_prompt: 'Esponja amarilla con espuma, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Después nos enjabonamos. Di: jabón.',
        stt_expected_array: ['jabón', 'jabon', 'abón', 'habón', 'jabó'],
        parent_tpr_action: 'Frotad los brazos del niño con una esponja imaginaria.',
      },
      {
        id: 'do-bano-enjuagar', type: 'verbo', label: 'enjuagar', emoji: '💦', pictogram: 'salpicadura',
        visual_prompt: 'Agua que salpica, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Luego nos enjuagamos. Di: enjuagar.',
        stt_expected_array: ['enjuagar', 'enjuaga', 'juagar', 'ejuagar'],
        parent_tpr_action: 'Haced juntos el gesto de echaros agua por los brazos.',
      },
      {
        id: 'do-bano-toalla', type: 'sustantivo', label: 'toalla', emoji: '🧺', pictogram: 'toalla',
        visual_prompt: 'Toalla doblada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final nos secamos con la toalla. Di: toalla.',
        stt_expected_array: ['toalla', 'toaya', 'oalla', 'talla', 'tualla'],
        parent_tpr_action: 'Envolved al niño en una toalla (o en tus brazos) y secadlo.',
      },
    ],
  },
  {
    id: 'do-noche',
    title: 'A dormir',
    icon: '🌙',
    subtitle: 'Pijama, dientes, cuento y a dormir',
    items: [
      {
        id: 'do-noche-pijama', type: 'sustantivo', label: 'pijama', emoji: '👕', pictogram: 'pijama',
        visual_prompt: 'Pijama infantil de dos piezas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Primero nos ponemos el pijama. Di: pijama.',
        stt_expected_array: ['pijama', 'piyama', 'ijama', 'pihama', 'pajama'],
        parent_tpr_action: 'Señalad el pijama del niño y tocad los botones juntos.',
      },
      {
        id: 'do-noche-dientes', type: 'sustantivo', label: 'dientes', emoji: '🪥', pictogram: 'cepillo',
        visual_prompt: 'Cepillo de dientes con pasta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Después nos lavamos los dientes. Di: dientes.',
        stt_expected_array: ['dientes', 'diente', 'ientes', 'dentes', 'tientes'],
        parent_tpr_action: 'Haced juntos el gesto de cepillaros los dientes.',
      },
      {
        id: 'do-noche-cuento', type: 'sustantivo', label: 'cuento', emoji: '📖', pictogram: 'libro',
        visual_prompt: 'Libro de cuentos abierto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Luego leemos un cuento. Di: cuento.',
        stt_expected_array: ['cuento', 'uento', 'tuento', 'cuenta', 'cueto'],
        parent_tpr_action: 'Abrid las manos como un libro y pasad una página juntos.',
      },
      {
        id: 'do-noche-dormir', type: 'verbo', label: 'dormir', emoji: '😴', pictogram: 'dormir',
        visual_prompt: 'Niño dormido en la almohada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Al final nos vamos a dormir. Di: dormir.',
        stt_expected_array: ['dormir', 'dormí', 'ormir', 'domir', 'duerme'],
        parent_tpr_action: 'Apoyad la cabeza en las manos juntas y cerrad los ojos.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// CATEGORÍAS LÉXICAS · versión dominicana (DC-1 opción C · ES-08)
//
// La frecuencia léxica NO se hereda entre variedades, y la fruta es el caso de
// libro: en República Dominicana «plátano» es el de freír —el del mangú, el de
// los tostones— y el que se come crudo es el GUINEO. Copiar la lista peninsular
// de ACOPROS tal cual pondría al niño dominicano a nombrar una fruta que en su
// casa se llama de otra forma, que es exactamente el sesgo que la guía dialectal
// corrigió. Lo mismo con la lechosa (papaya) y la chinola (maracuyá), que aquí
// son cotidianas y en la península no existen.
//
// El nivel 1 se calibra por lo que hay en un colmado y en una mesa dominicana,
// no por lo que hay en un supermercado peninsular.
// ---------------------------------------------------------------------------
export const LEXICAL_CATEGORIES_ESDO: LexicalCategory[] = [
  {
    id: 'do-cat-frutas', title: 'Frutas', icon: '🍎',
    subtitle: 'De la fruta de todos los días a la que se ve de vez en cuando',
    items: [
      {
        id: 'do-cat-frutas-guineo', type: 'sustantivo', label: 'guineo', emoji: '🍌', difficulty: 1,
        visual_prompt: 'Guineo (banana) amarillo curvado de perfil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un guineo. Di: guineo.',
        stt_expected_array: ['guineo', 'gineo', 'uineo', 'guineito', 'ineo'],
        parent_tpr_action: 'Pelen un guineo juntos bajando cada tira despacio mientras dicen la palabra.',
      },
      {
        id: 'do-cat-frutas-manzana', type: 'sustantivo', label: 'manzana', emoji: '🍎', difficulty: 1,
        visual_prompt: 'Manzana roja de frente con hoja verde, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es una manzana. Di: manzana.',
        stt_expected_array: ['manzana', 'mansana', 'mazana', 'manana', 'ana'],
        parent_tpr_action: 'Dale un mordisco a una manzana y que el nene imite el crujido: ¡ñac!',
      },
      {
        id: 'do-cat-frutas-naranja', type: 'sustantivo', label: 'naranja', emoji: '🍊', difficulty: 1,
        visual_prompt: 'Naranja entera de frente con hoja, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es una naranja. Di: naranja.',
        stt_expected_array: ['naranja', 'naanja', 'aranja', 'nanja', 'china'],
        parent_tpr_action: 'Rueden una naranja por la mesa de uno a otro, nombrándola en cada pase.',
      },
      {
        id: 'do-cat-frutas-pina', type: 'sustantivo', label: 'piña', emoji: '🍍', difficulty: 2,
        visual_prompt: 'Piña entera con corona de hojas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es una piña. Di: piña.',
        stt_expected_array: ['piña', 'pina', 'iña', 'pinia', 'piñia'],
        parent_tpr_action: 'Pónganse las manos abiertas sobre la cabeza como la corona de la piña.',
      },
      {
        id: 'do-cat-frutas-lechosa', type: 'sustantivo', label: 'lechosa', emoji: '🥭', difficulty: 3,
        visual_prompt: 'Lechosa (papaya) partida por la mitad con las semillas a la vista, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es una lechosa. Di: lechosa.',
        stt_expected_array: ['lechosa', 'lechoa', 'echosa', 'lechosha', 'leshosa'],
        parent_tpr_action: 'Abran una lechosa (o dibújenla) y cuenten juntos las semillas de dentro.',
      },
      {
        id: 'do-cat-frutas-chinola', type: 'sustantivo', label: 'chinola', emoji: '🍈', difficulty: 3,
        visual_prompt: 'Chinola (maracuyá) partida por la mitad, pulpa visible, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es una chinola. Di: chinola.',
        stt_expected_array: ['chinola', 'chinoa', 'inola', 'shinola', 'chinolita'],
        parent_tpr_action: 'Preparen un jugo de chinola y que el nene revuelva mientras dice la palabra.',
      },
    ],
  },
  {
    id: 'do-cat-animales', title: 'Animales', icon: '🐶',
    subtitle: 'De los del patio a los que solo se ven en el zoológico',
    items: [
      {
        id: 'do-cat-animales-perro', type: 'sustantivo', label: 'perro', emoji: '🐶', difficulty: 1,
        visual_prompt: 'Cabeza de perro de frente, orejas caídas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un perro. Di: perro.',
        stt_expected_array: ['perro', 'pero', 'peo', 'pelo', 'peyo'],
        parent_tpr_action: 'Pónganse en cuatro patas y den tres pasos ladrando juntos.',
      },
      {
        id: 'do-cat-animales-gato', type: 'sustantivo', label: 'gato', emoji: '🐱', difficulty: 1,
        visual_prompt: 'Cabeza de gato de frente con bigotes marcados, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un gato. Di: gato.',
        stt_expected_array: ['gato', 'tato', 'ato', 'gao', 'katto'],
        parent_tpr_action: 'Estírense como un gato al despertar y froten la cabeza contra el brazo del otro.',
      },
      {
        id: 'do-cat-animales-pollo', type: 'sustantivo', label: 'pollo', emoji: '🐓', difficulty: 2,
        visual_prompt: 'Gallo o pollo de perfil con cresta roja, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un pollo. Di: pollo.',
        stt_expected_array: ['pollo', 'poyo', 'oyo', 'poo', 'poio'],
        parent_tpr_action: 'Caminen picoteando el suelo con el dedo, como los pollos del patio.',
      },
      {
        id: 'do-cat-animales-vaca', type: 'sustantivo', label: 'vaca', emoji: '🐄', difficulty: 2,
        visual_prompt: 'Vaca de perfil con manchas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es una vaca. Di: vaca.',
        stt_expected_array: ['vaca', 'baca', 'aca', 'taca', 'bata'],
        parent_tpr_action: 'Pónganse dos dedos en la cabeza como cuernos y digan la palabra mirándose.',
      },
      {
        id: 'do-cat-animales-elefante', type: 'sustantivo', label: 'elefante', emoji: '🐘', difficulty: 3,
        visual_prompt: 'Elefante de perfil con trompa levantada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un elefante. Di: elefante.',
        stt_expected_array: ['elefante', 'efante', 'elefan', 'efate', 'lefante'],
        parent_tpr_action: 'Hagan la trompa con el brazo colgando delante de la cara y baláncenla al decirlo.',
      },
      {
        id: 'do-cat-animales-jirafa', type: 'sustantivo', label: 'jirafa', emoji: '🦒', difficulty: 3,
        visual_prompt: 'Jirafa de cuerpo entero con cuello largo y manchas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es una jirafa. Di: jirafa.',
        stt_expected_array: ['jirafa', 'irafa', 'jifafa', 'girafa', 'jiafa'],
        parent_tpr_action: 'Estiren el cuello y los brazos hacia arriba, lo más alto posible, para alcanzar una hoja.',
      },
    ],
  },
  {
    id: 'do-cat-transportes', title: 'Transportes', icon: '🚌',
    subtitle: 'De la guagua de la esquina a lo que casi no se ve',
    items: [
      {
        id: 'do-cat-transportes-carro', type: 'sustantivo', label: 'carro', emoji: '🚗', difficulty: 1,
        visual_prompt: 'Carro de perfil, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un carro. Di: carro.',
        stt_expected_array: ['carro', 'caro', 'cao', 'calo', 'tarro'],
        parent_tpr_action: 'Empujen un carrito por el piso hasta chocar suavecito con el pie del nene.',
      },
      {
        id: 'do-cat-transportes-guagua', type: 'sustantivo', label: 'guagua', emoji: '🚌', difficulty: 1,
        visual_prompt: 'Guagua (autobús) de perfil con ventanas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es una guagua. Di: guagua.',
        stt_expected_array: ['guagua', 'guaua', 'uagua', 'awawa', 'gagua'],
        parent_tpr_action: 'Pónganse en fila como si subieran a la guagua y siéntense de dos en dos.',
      },
      {
        id: 'do-cat-transportes-motor', type: 'sustantivo', label: 'motor', emoji: '🏍️', difficulty: 2,
        visual_prompt: 'Motocicleta de perfil, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un motor. Di: motor.',
        stt_expected_array: ['motor', 'motó', 'moto', 'motol', 'otor'],
        parent_tpr_action: 'Agarren un manubrio imaginario y aceleren los dos a la vez haciendo ruido.',
      },
      {
        id: 'do-cat-transportes-barco', type: 'sustantivo', label: 'barco', emoji: '🚢', difficulty: 2,
        visual_prompt: 'Barco de perfil sobre una línea de agua, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un barco. Di: barco.',
        stt_expected_array: ['barco', 'baco', 'arco', 'balco', 'bato'],
        parent_tpr_action: 'Siéntense en el piso y baláncense como si el barco subiera y bajara con las olas.',
      },
      {
        id: 'do-cat-transportes-avion', type: 'sustantivo', label: 'avión', emoji: '✈️', difficulty: 3,
        visual_prompt: 'Avión visto desde abajo con las alas extendidas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un avión. Di: avión.',
        stt_expected_array: ['avión', 'avion', 'abión', 'aión', 'ión'],
        parent_tpr_action: 'Abran los brazos como alas y den una vuelta inclinándose en las curvas.',
      },
      {
        id: 'do-cat-transportes-camion', type: 'sustantivo', label: 'camión', emoji: '🚚', difficulty: 3,
        visual_prompt: 'Camión de perfil con caja de carga, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es un camión. Di: camión.',
        stt_expected_array: ['camión', 'camion', 'camió', 'tamión', 'mión'],
        parent_tpr_action: 'Carguen tres juguetes en una caja y arrástrenla juntos como si fuera el remolque.',
      },
    ],
  },
  {
    id: 'do-cat-colores', title: 'Colores', icon: '🎨',
    subtitle: 'Del rojo y el azul a los que cuesta más nombrar',
    items: [
      {
        id: 'do-cat-colores-rojo', type: 'adjetivo', label: 'rojo', emoji: '🔴', pictogram: 'color-rojo', difficulty: 1,
        visual_prompt: 'Círculo rojo pleno con contorno grueso, sin fondo, sin degradados.',
        tts_string: 'Este color es rojo. Di: rojo.',
        stt_expected_array: ['rojo', 'ojo', 'lojo', 'roho', 'oo'],
        parent_tpr_action: 'Busquen juntos tres cosas rojas por la casa y tóquenlas nombrando el color.',
      },
      {
        id: 'do-cat-colores-azul', type: 'adjetivo', label: 'azul', emoji: '🔵', pictogram: 'color-azul', difficulty: 1,
        visual_prompt: 'Círculo azul pleno con contorno grueso, sin fondo, sin degradados.',
        tts_string: 'Este color es azul. Di: azul.',
        stt_expected_array: ['azul', 'asul', 'aul', 'atul', 'azú'],
        parent_tpr_action: 'Señalen el cielo o algo azul de la ropa del nene y digan el color a la vez.',
      },
      {
        id: 'do-cat-colores-amarillo', type: 'adjetivo', label: 'amarillo', emoji: '🟡', pictogram: 'color-amarillo', difficulty: 2,
        visual_prompt: 'Círculo amarillo pleno con contorno grueso, sin fondo, sin degradados.',
        tts_string: 'Este color es amarillo. Di: amarillo.',
        stt_expected_array: ['amarillo', 'amariyo', 'amaillo', 'marillo', 'amayo'],
        parent_tpr_action: 'Hagan un sol grande con los brazos y digan el color mirando hacia arriba.',
      },
      {
        id: 'do-cat-colores-verde', type: 'adjetivo', label: 'verde', emoji: '🟢', pictogram: 'color-verde', difficulty: 2,
        visual_prompt: 'Círculo verde pleno con contorno grueso, sin fondo, sin degradados.',
        tts_string: 'Este color es verde. Di: verde.',
        stt_expected_array: ['verde', 'bede', 'erde', 'velde', 'bere'],
        parent_tpr_action: 'Salgan al patio a buscar una hoja y tóquenla mientras dicen el color.',
      },
      {
        id: 'do-cat-colores-morado', type: 'adjetivo', label: 'morado', emoji: '🟣', pictogram: 'color-morado', difficulty: 3,
        visual_prompt: 'Círculo morado pleno con contorno grueso, sin fondo, sin degradados.',
        tts_string: 'Este color es morado. Di: morado.',
        stt_expected_array: ['morado', 'morao', 'moado', 'molado', 'orado'],
        parent_tpr_action: 'Mezclen delante del nene un poco de rojo y azul y nombren lo que sale.',
      },
      {
        id: 'do-cat-colores-marron', type: 'adjetivo', label: 'marrón', emoji: '🟤', pictogram: 'color-marron', difficulty: 3,
        visual_prompt: 'Círculo marrón pleno con contorno grueso, sin fondo, sin degradados.',
        tts_string: 'Este color es marrón. Di: marrón.',
        stt_expected_array: ['marrón', 'marron', 'maón', 'malón', 'marró'],
        parent_tpr_action: 'Toquen juntos algo de madera —una mesa, una mecedora— y digan el color al tocarlo.',
      },
    ],
  },
  {
    id: 'do-cat-cuerpo', title: 'El cuerpo', icon: '🖐️',
    subtitle: 'De lo que se señala solo a lo que hay que buscar',
    items: [
      {
        id: 'do-cat-cuerpo-mano', type: 'sustantivo', label: 'mano', emoji: '🖐️', pictogram: 'mano', difficulty: 1,
        visual_prompt: 'Mano abierta de frente con los cinco dedos separados, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es la mano. Di: mano.',
        stt_expected_array: ['mano', 'ano', 'mao', 'manno', 'nano'],
        parent_tpr_action: 'Choquen las palmas tres veces, una por cada sílaba, mirándose a los ojos.',
      },
      {
        id: 'do-cat-cuerpo-pie', type: 'sustantivo', label: 'pie', emoji: '🦶', pictogram: 'pie', difficulty: 1,
        visual_prompt: 'Pie descalzo de perfil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el pie. Di: pie.',
        stt_expected_array: ['pie', 'pi', 'ie', 'bie', 'pié'],
        parent_tpr_action: 'Pongan sus pies juntos y comparen el tamaño antes de dar tres pisotones.',
      },
      {
        id: 'do-cat-cuerpo-boca', type: 'sustantivo', label: 'boca', emoji: '👄', pictogram: 'boca', difficulty: 2,
        visual_prompt: 'Boca de frente ligeramente abierta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es la boca. Di: boca.',
        stt_expected_array: ['boca', 'oca', 'bota', 'poca', 'boa'],
        parent_tpr_action: 'Pónganse frente al espejo y abran y cierren la boca a la vez, bien despacio.',
      },
      {
        id: 'do-cat-cuerpo-ojo', type: 'sustantivo', label: 'ojo', emoji: '👁️', pictogram: 'ojo', difficulty: 2,
        visual_prompt: 'Ojo abierto de frente con pestañas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el ojo. Di: ojo.',
        stt_expected_array: ['ojo', 'oo', 'oho', 'oyo', 'ojjo'],
        parent_tpr_action: 'Jueguen a taparse los ojos y destaparlos con un “¡cucú!” cada vez que dicen la palabra.',
      },
      {
        id: 'do-cat-cuerpo-rodilla', type: 'sustantivo', label: 'rodilla', emoji: '🦵', pictogram: 'rodilla', difficulty: 3,
        visual_prompt: 'Pierna de perfil con la rodilla marcada y flexionada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es la rodilla. Di: rodilla.',
        stt_expected_array: ['rodilla', 'rodiya', 'odilla', 'lodilla', 'diya'],
        parent_tpr_action: 'Doblen las rodillas a la vez hasta quedar en cuclillas y suban diciendo la palabra.',
      },
      {
        id: 'do-cat-cuerpo-codo', type: 'sustantivo', label: 'codo', emoji: '💪', pictogram: 'codo', difficulty: 3,
        visual_prompt: 'Brazo doblado de perfil con el codo bien marcado, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el codo. Di: codo.',
        stt_expected_array: ['codo', 'oto', 'todo', 'coo', 'colo'],
        parent_tpr_action: 'Salúdense chocando los codos tres veces seguidas.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Progresiones por CAMPO SEMÁNTICO (7) · DC-2 opción A
//    Concepto → parte → acción → cualidad, con léxico y registro dominicanos
//    (la goma de la guagua, la cresta del gallo, la arena de la playa).
// ---------------------------------------------------------------------------
export const PROGRESSION_SEQUENCES_ESDO: ProgressionSequence[] = [
  {
    id: 'do-seq-guagua', theme: 'Transporte · La guagua', icon: '🚌',
    phases: [
      {
        kind: 'concepto', label: 'guagua', emoji: '🚌',
        visual_prompt: 'Guagua de frente con ventanas grandes y colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esta es la guagua. Di: guagua.',
        stt_expected_array: ['guagua', 'guaba', 'awagua', 'gagua', 'wawa'],
        parent_tpr_action: 'Formen una guagua: el niño se agarra de tu cintura y avancen por el pasillo parando en “paradas”.',
      },
      {
        kind: 'parte', label: 'goma', emoji: '🛞',
        pictogram: 'rueda',
        visual_prompt: 'Una goma de guagua de frente, negra con aro claro, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La guagua tiene gomas. Di: goma.',
        stt_expected_array: ['goma', 'oma', 'goa', 'gomma', 'gona'],
        parent_tpr_action: 'Rueden un juguete con ruedas por el piso girando una goma con el dedo del niño y digan “goma”.',
      },
      {
        kind: 'accion', label: 'corre', emoji: '💨',
        pictogram: 'correr',
        visual_prompt: 'Guagua con líneas de velocidad detrás avanzando hacia la derecha, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La guagua corre por la calle. Di: corre.',
        stt_expected_array: ['corre', 'core', 'ore', 'totte', 'coé'],
        parent_tpr_action: 'Corran juntos unos pasos “como la guagua” y frenen de golpe en la parada.',
      },
      {
        kind: 'cualidad', label: 'llena', emoji: '🚌',
        visual_prompt: 'Guagua con muchas siluetas de pasajeros asomando por las ventanas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La guagua va bien llena. Di: llena.',
        stt_expected_array: ['llena', 'yena', 'ena', 'lleta', 'yeta'],
        parent_tpr_action: 'Júntense mucho en un espacio chiquito “como en la guagua llena” y ríanse apretaditos.',
      },
    ],
  },
  {
    id: 'do-seq-perro', theme: 'Animales · El perro', icon: '🐶',
    phases: [
      {
        kind: 'concepto', label: 'perro', emoji: '🐕',
        visual_prompt: 'Perro sentado de frente, orejas caídas, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Este es el perro. Di: perro.',
        stt_expected_array: ['perro', 'pero', 'peo', 'eo', 'peto'],
        parent_tpr_action: 'Señala un perro de juguete o una foto y acarícienlo juntos repitiendo “perro”.',
      },
      {
        kind: 'parte', label: 'pata', emoji: '🐾',
        visual_prompt: 'Huella de pata de perro con cuatro dedos y almohadilla, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El perro tiene cuatro patas. Di: pata.',
        stt_expected_array: ['pata', 'ata', 'pat', 'para', 'patta'],
        parent_tpr_action: 'Pongan las manos en el piso como patas y caminen en cuatro patas un par de pasos diciendo “pata”.',
      },
      {
        kind: 'accion', label: 'brinca', emoji: '⬆️',
        visual_prompt: 'Perro en el aire con las patas recogidas y una curva de salto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El perro brinca por la pelota. Di: brinca.',
        stt_expected_array: ['brinca', 'blinca', 'inca', 'binca', 'bincá'],
        parent_tpr_action: 'Brinquen los dos a la vez diciendo “¡brinca!” en cada bote.',
      },
      {
        kind: 'cualidad', label: 'peludo', emoji: '🐕',
        visual_prompt: 'Perro con pelaje muy esponjoso y líneas de textura suave, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El perro es blandito y peludo. Di: peludo.',
        stt_expected_array: ['peludo', 'peluo', 'eludo', 'peú', 'pelúo'],
        parent_tpr_action: 'Acaricien un peluche o una manta suave y digan “peludo” pasando la mano despacio.',
      },
    ],
  },
  {
    id: 'do-seq-gato', theme: 'Animales · El gato', icon: '🐱',
    phases: [
      {
        kind: 'concepto', label: 'gato', emoji: '🐈',
        visual_prompt: 'Gato sentado de frente con cola enroscada, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Este es el gato. Di: gato.',
        stt_expected_array: ['gato', 'tato', 'ato', 'gat', 'gatto'],
        parent_tpr_action: 'Señala un gato de juguete o una foto y acarícienle el lomo repitiendo “gato”.',
      },
      {
        kind: 'parte', label: 'bigote', emoji: '🐱',
        visual_prompt: 'Cara de gato en primer plano con los bigotes largos muy marcados, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gato tiene bigotes largos. Di: bigote.',
        stt_expected_array: ['bigote', 'bigotes', 'igote', 'bitote', 'gote'],
        parent_tpr_action: 'Dibujen bigotes en el aire desde la nariz hacia los cachetes del niño mientras dicen “bigote”.',
      },
      {
        kind: 'accion', label: 'duerme', emoji: '😴',
        pictogram: 'dormir',
        visual_prompt: 'Gato acurrucado con los ojos cerrados y tres “Z” encima, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gato duerme en su camita. Di: duerme.',
        stt_expected_array: ['duerme', 'uerme', 'dueme', 'deme', 'duemme'],
        parent_tpr_action: 'Junta las manos bajo la mejilla, cierra los ojos y haz “shhh” invitando al niño a “dormir” contigo.',
      },
      {
        kind: 'cualidad', label: 'suave', emoji: '🐈',
        visual_prompt: 'Gato con una mano acariciando su lomo y líneas de textura suave, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pelo del gato es bien suave. Di: suave.',
        stt_expected_array: ['suave', 'uave', 'ave', 'sua', 'suabe'],
        parent_tpr_action: 'Pasen una pluma o un pañuelo por el brazo del niño bien despacio diciendo “suave”.',
      },
    ],
  },
  {
    id: 'do-seq-lluvia', theme: 'Naturaleza · El aguacero', icon: '🌧️',
    phases: [
      {
        kind: 'concepto', label: 'agua', emoji: '💧',
        visual_prompt: 'Una gota de agua grande y brillante de frente, azul plano, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el agua. Di: agua.',
        stt_expected_array: ['agua', 'aba', 'awa', 'aua', 'agüa'],
        parent_tpr_action: 'Mojen un dedo en agua de verdad y tóquense la mano notando el fresquito al decir “agua”.',
      },
      {
        kind: 'parte', label: 'nube', emoji: '☁️',
        visual_prompt: 'Nube gris redondeada con tres gotas cayendo por debajo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua sale de la nube. Di: nube.',
        stt_expected_array: ['nube', 'ube', 'nue', 'nuve', 'mube'],
        parent_tpr_action: 'Señalen una nube por la ventana (o dibujen una en el aire) y digan “nube” soplando bajito.',
      },
      {
        kind: 'accion', label: 'cae', emoji: '⬇️',
        visual_prompt: 'Gota de agua con una flecha hacia abajo y una silueta fantasma más arriba, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua cae del cielo. Di: cae.',
        stt_expected_array: ['cae', 'ae', 'tae', 'cai', 'kae'],
        parent_tpr_action: 'Levanten las manos arriba y bájenlas moviendo los dedos hasta el piso diciendo “caeee”.',
      },
      {
        kind: 'cualidad', label: 'mojado', emoji: '🤲',
        pictogram: 'manos-mojadas',
        visual_prompt: 'Dos manos abiertas con gotas de agua resbalando y pequeñas salpicaduras, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La mano está mojada. Di: mojado.',
        stt_expected_array: ['mojado', 'mojao', 'ojao', 'moja', 'moxao'],
        parent_tpr_action: 'Mójale un poquito la mano al niño con una toallita y digan “mojao” sacudiendo las manos.',
      },
    ],
  },
  {
    id: 'do-seq-gallo', theme: 'Animales · El gallo', icon: '🐓',
    phases: [
      {
        kind: 'concepto', label: 'gallo', emoji: '🐓',
        visual_prompt: 'Gallo de perfil con la cola levantada y colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Este es el gallo. Di: gallo.',
        stt_expected_array: ['gallo', 'gayo', 'ayo', 'gao', 'gaio'],
        parent_tpr_action: 'Señala un gallo en una foto y marquen su cresta con el dedo diciendo “gallo”.',
      },
      {
        kind: 'parte', label: 'cresta', emoji: '🐓',
        visual_prompt: 'Cabeza de gallo en primer plano con la cresta roja muy marcada, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gallo tiene una cresta roja. Di: cresta.',
        stt_expected_array: ['cresta', 'esta', 'creta', 'cleta', 'questa'],
        parent_tpr_action: 'Pongan la mano abierta sobre la cabeza como una cresta y muévanla al decir “cresta”.',
      },
      {
        kind: 'accion', label: 'canta', emoji: '🎵',
        visual_prompt: 'Gallo con el pico abierto y notas musicales saliendo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gallo canta bien duro. Di: canta.',
        stt_expected_array: ['canta', 'tanta', 'anta', 'cata', 'antá'],
        parent_tpr_action: 'Canten los dos “la la la” bien duro y después bajito, turnándose.',
      },
      {
        kind: 'cualidad', label: 'grande', emoji: '🐓',
        visual_prompt: 'Gallo junto a un pollito diminuto para marcar el contraste de tamaño, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gallo es bien grande. Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
        parent_tpr_action: 'Abran los brazos todo lo que puedan y pónganse de puntillas diciendo “¡graaande!”.',
      },
    ],
  },
  {
    id: 'do-seq-mar', theme: 'La playa · El mar', icon: '🌊',
    phases: [
      {
        kind: 'concepto', label: 'playa', emoji: '🏖️',
        visual_prompt: 'Orilla de playa con el mar al fondo y una sombrilla, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es la playa. Di: playa.',
        stt_expected_array: ['playa', 'plaia', 'paya', 'aya', 'plaa'],
        parent_tpr_action: 'Caminen “en la arena” pisando fuerte y descalzos si se puede, diciendo “playa”.',
      },
      {
        kind: 'parte', label: 'arena', emoji: '🏝️',
        visual_prompt: 'Montoncito de arena dorada en primer plano con granos visibles, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'En la playa hay mucha arena. Di: arena.',
        stt_expected_array: ['arena', 'rena', 'aena', 'alena', 'areta'],
        parent_tpr_action: 'Pasen los dedos por arena de verdad, azúcar o harina y digan “arena” sintiendo los granitos.',
      },
      {
        kind: 'accion', label: 'nada', emoji: '🏊',
        pictogram: 'nadar',
        visual_prompt: 'Silueta infantil nadando de perfil con ondas de agua alrededor, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El niño nada en el mar. Di: nada.',
        stt_expected_array: ['nada', 'naa', 'ada', 'nala', 'ná'],
        parent_tpr_action: 'Muevan los brazos como nadando, de pie, y “naden” juntos hasta la orilla.',
      },
      {
        kind: 'cualidad', label: 'mojado', emoji: '🏊',
        pictogram: 'manos-mojadas',
        visual_prompt: 'Silueta infantil saliendo del agua chorreando gotas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El niño sale del mar mojado. Di: mojado.',
        stt_expected_array: ['mojado', 'mojao', 'ojao', 'moja', 'moxao'],
        parent_tpr_action: 'Sacúdanse como perritos mojados y envuélvanse en una toalla diciendo “mojao”.',
      },
    ],
  },
  {
    id: 'do-seq-pajaro', theme: 'Animales · El pájaro', icon: '🐦',
    phases: [
      {
        kind: 'concepto', label: 'pájaro', emoji: '🐦',
        pictogram: 'pajaro',
        visual_prompt: 'Pájaro pequeño de perfil posado en una rama, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Este es el pájaro. Di: pájaro.',
        stt_expected_array: ['pájaro', 'pajaro', 'ájaro', 'pajalo', 'payaro'],
        parent_tpr_action: 'Busquen un pájaro por la ventana o en un dibujo, señálenlo y salúdenlo con la mano.',
      },
      {
        kind: 'parte', label: 'pluma', emoji: '🪶',
        pictogram: 'pluma',
        visual_prompt: 'Una pluma suelta vista de frente, con el raquis marcado, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pájaro tiene plumas. Di: pluma.',
        stt_expected_array: ['pluma', 'plumas', 'uma', 'puma', 'luma'],
        parent_tpr_action: 'Soplen una pluma de verdad (o un pedacito de papel) para que flote y digan “pluma” al cogerla.',
      },
      {
        kind: 'accion', label: 'vuela', emoji: '🐦',
        pictogram: 'pajaro',
        visual_prompt: 'Pájaro con las alas abiertas en pleno vuelo y una curva de trayectoria, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pájaro vuela por el cielo. Di: vuela.',
        stt_expected_array: ['vuela', 'buela', 'uela', 'bela', 'guela'],
        parent_tpr_action: 'Corran por la sala con los brazos como alas, subiéndolas y bajándolas.',
      },
      {
        kind: 'cualidad', label: 'chiquito', emoji: '🐤',
        visual_prompt: 'Pájaro diminuto junto a una mano abierta que lo sostiene, para marcar el tamaño, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pajarito es bien chiquito. Di: chiquito.',
        stt_expected_array: ['chiquito', 'chiquto', 'tiquito', 'quito', 'chikito'],
        parent_tpr_action: 'Junten mucho las manos como si sujetaran un pajarito diminuto y háblenle bajito.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. Cápsulas de contraste (adjetivos y verbos antónimos) · 6, con 2 vueltas
// ---------------------------------------------------------------------------
export const CONTRAST_CAPSULES_ESDO: ContrastCapsule[] = [
  {
    id: 'do-cap-grande-chiquito', code: 'CT-DO-1', kind: 'adjetivos',
    pair: ['grande', 'chiquito'], icon: '🧸',
    physical_setup: 'Busca dos ositos de peluche iguales pero de distinto tamaño: uno bien GRANDE y uno bien CHIQUITO. Ponlos juntos frente al niño.',
    rounds: [
      {
        label: 'grande', emoji: '🧸',
        pictogram: 'osito-grande',
        tts_trigger: '¿Cuál es el osito GRANDE? ¡Dámelo y dilo! Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
        parent_action: 'El niño te entrega el peluche grande mientras lo dice; abrácenlo exagerando lo enorme que es.',
      },
      {
        label: 'chiquito', emoji: '🧸',
        pictogram: 'osito-pequeno',
        tts_trigger: 'Ahora al revés: ¿cuál es el osito CHIQUITO? ¡Dámelo y dilo! Di: chiquito.',
        stt_expected_array: ['chiquito', 'chiquto', 'tiquito', 'quito', 'chiquí'],
        parent_action: 'El niño te da el chiquito; escóndanlo en una mano y digan “chiquito” con vocecita mini.',
      },
    ],
  },
  {
    id: 'do-cap-limpio-sucio', code: 'CT-DO-2', kind: 'adjetivos',
    pair: ['limpio', 'sucio'], icon: '🥄',
    physical_setup: 'Coge dos cucharas iguales: lava una hasta dejarla brillante y ensucia la otra con un poco de comida. Ponlas una al lado de la otra.',
    rounds: [
      {
        label: 'sucio', emoji: '🥄',
        pictogram: 'cuchara-sucia',
        tts_trigger: 'Señala la cuchara SUCIA. ¿Cómo está esta? Dilo. Di: sucio.',
        stt_expected_array: ['sucio', 'utio', 'suio', 'cucho', 'ucio'],
        parent_action: 'El niño señala la cuchara sucia y pongan los dos cara de “¡fo!” apartándola.',
      },
      {
        label: 'limpio', emoji: '🥄',
        pictogram: 'cuchara-limpia',
        tts_trigger: 'Y esta otra cuchara, ¿cómo está? ¡Mira cómo brilla! Di: limpio.',
        stt_expected_array: ['limpio', 'impio', 'limpi', 'inpio', 'pio'],
        parent_action: 'Señalen la limpia, sóplenla como si brillara y choquen los cinco.',
      },
    ],
  },
  {
    id: 'do-cap-abrir-cerrar', code: 'CT-DO-3', kind: 'verbos',
    pair: ['abrir', 'cerrar'], icon: '📦',
    physical_setup: 'Pon frente al niño una caja con tapa y mete dentro, a la vista, su juguete favorito. Cierra la tapa.',
    rounds: [
      {
        label: 'abrir', emoji: '📦',
        pictogram: 'caja-abierta',
        tts_trigger: 'El juguete está adentro. ¿Qué hacemos para sacarlo? ¡Vamos a ABRIR! Di: abrir.',
        stt_expected_array: ['abrir', 'abre', 'abi', 'air', 'abí'],
        parent_action: 'Abran la caja juntos, bien despacio, y celebren encontrar el juguete con un “¡ta-tán!”.',
      },
      {
        label: 'cerrar', emoji: '📦',
        pictogram: 'caja-cerrada',
        tts_trigger: 'Guardamos el juguete. ¿Qué hacemos con la tapa? ¡A CERRAR! Di: cerrar.',
        stt_expected_array: ['cerrar', 'cerra', 'errar', 'tetar', 'cerá'],
        parent_action: 'El niño empuja la tapa hasta cerrarla del todo mientras dice la palabra.',
      },
    ],
  },
  {
    id: 'do-cap-subir-bajar', code: 'CT-DO-4', kind: 'verbos',
    pair: ['subir', 'bajar'], icon: '🚗',
    physical_setup: 'Haz una rampa apoyando un libro grande inclinado y pon un carrito de juguete al pie de la rampa.',
    rounds: [
      {
        label: 'subir', emoji: '⬆️',
        pictogram: 'coche-subiendo',
        tts_trigger: 'El carro va pa’ la loma. ¿Qué hace? ¡SUBE arriba! Di: subir.',
        stt_expected_array: ['subir', 'sube', 'ubi', 'tubi', 'subí'],
        parent_action: 'Suban el carro por la rampa bien despacio mientras suena la palabra.',
      },
      {
        label: 'bajar', emoji: '⬇️',
        pictogram: 'coche-bajando',
        tts_trigger: '¡Ahora el carro baja! ¿Qué hace? Di: bajar.',
        stt_expected_array: ['bajar', 'baja', 'aja', 'baxar', 'ajá'],
        parent_action: 'Suelten el carro y que baje solo por la rampa; digan “¡bajaaa!” mientras cae.',
      },
    ],
  },
  {
    id: 'do-cap-frio-caliente', code: 'CT-DO-5', kind: 'adjetivos',
    pair: ['frío', 'caliente'], icon: '🥤',
    physical_setup: 'Prepara dos vasos: uno con agua bien fría (con hielo si hay) y otro con agua tibia. Ponlos frente al niño.',
    rounds: [
      {
        label: 'frío', emoji: '🥤',
        pictogram: 'vaso-frio',
        tts_trigger: 'Toca los vasos. ¿Cuál está FRÍO? ¡Brrr! Di: frío.',
        stt_expected_array: ['frío', 'frio', 'fío', 'ío', 'fiío'],
        parent_action: 'El niño toca el vaso frío; tiriten juntos “¡brrr!” encogiendo los hombros.',
      },
      {
        label: 'caliente', emoji: '🥤',
        pictogram: 'vaso-caliente',
        tts_trigger: 'Y este otro vaso, ¿cómo está? Di: caliente.',
        stt_expected_array: ['caliente', 'aliente', 'caiente', 'tatiente', 'cayente'],
        parent_action: 'Toquen el vaso tibio y abaníquense la mano como si quemara, exagerando mucho.',
      },
    ],
  },
  {
    id: 'do-cap-prender-apagar', code: 'CT-DO-6', kind: 'verbos',
    pair: ['prender', 'apagar'], icon: '💡',
    physical_setup: 'Ponte con el niño junto al interruptor de la luz (o coge una linterna). El cuarto empieza con la luz apagada.',
    rounds: [
      {
        label: 'prender', emoji: '💡',
        pictogram: 'bombilla-encendida',
        tts_trigger: 'Está oscuro… ¿Qué hacemos con la luz? ¡A PRENDER! Di: prender.',
        stt_expected_array: ['prender', 'prende', 'render', 'ende', 'prendé'],
        parent_action: 'El niño toca el interruptor justo al decirlo y celebran la luz con un “¡ooooh!”.',
      },
      {
        label: 'apagar', emoji: '💡',
        pictogram: 'bombilla-apagada',
        tts_trigger: 'Ahora al revés. ¿Qué hacemos con la luz? ¡A APAGAR! Di: apagar.',
        stt_expected_array: ['apagar', 'apaga', 'paga', 'agar', 'apagá'],
        parent_action: 'El niño apaga la luz y se dicen “buenas noches” en voz de susurro.',
      },
    ],
  },
];

// ES-07 · Rutinas ordenables (ACOPROS, 3.ª ronda): consigna del paso de
// ordenar (la locuta la app al niño) y repaso que hace el adulto al acabar.
export const SEM_ORDER_ESDO = {
  prompt: 'Vamos a ordenar la rutina. ¿Qué hacemos primero?',
  action: 'Repasen juntos la rutina en voz alta señalando cada dibujo: primero, después, luego y al final.',
};

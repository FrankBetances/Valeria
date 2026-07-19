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
  DailyScenario, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';

// ---------------------------------------------------------------------------
// 1. Escenarios de la vida diaria dominicana (5 · 6 ítems c/u)
// ---------------------------------------------------------------------------
export const DAILY_SCENARIOS_ESDO: DailyScenario[] = [
  {
    id: 'do-manana',
    title: 'En la mañana',
    icon: '☀️',
    subtitle: 'Despertarse, lavarse y desayunar',
    items: [
      {
        id: 'do-manana-cama', type: 'sustantivo', label: 'cama', emoji: '🛏️',
        visual_prompt: 'Cama infantil de frente, sábanas lisas, sin fondo, contorno grueso, colores planos de alto contraste.',
        tts_string: 'Esto es la cama. En la mañana brincamos de la cama. Di: cama.',
        stt_expected_array: ['cama', 'tama', 'ama', 'kama'],
        parent_tpr_action: 'Dale palmaditas a la cama y siéntate en ella con el muchachito antes de pararse juntos.',
      },
      {
        id: 'do-manana-cepillo', type: 'sustantivo', label: 'cepillo', emoji: '🪥',
        visual_prompt: 'Cepillo de dientes en horizontal con una raya de pasta, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el cepillo. Con el cepillo lavamos los dientes. Di: cepillo.',
        stt_expected_array: ['cepillo', 'pillo', 'tepillo', 'epillo'],
        parent_tpr_action: 'Pon el cepillo (sin pasta) en la mano del niño y hagan juntos el gesto de cepillar los dientes.',
      },
      {
        id: 'do-manana-desayuno', type: 'sustantivo', label: 'mangú', emoji: '🍌',
        visual_prompt: 'Plato de mangú (puré de plátano verde) con cebollita encima, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'En la mañana comemos mangú. ¡Qué rico! Di: mangú.',
        stt_expected_array: ['mangú', 'mangu', 'angú', 'manú', 'mamú'],
        parent_tpr_action: 'Haz como que majas el plátano con un tenedor en el aire y después se lo “sirves” al niño.',
      },
      {
        id: 'do-manana-lavar', type: 'verbo', label: 'lavar', emoji: '🧼',
        visual_prompt: 'Dos manos frotándose con burbujas de jabón, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, nos lavamos las manos. ¿Qué hacemos? Di: lavar.',
        stt_expected_array: ['lavar', 'lava', 'aba', 'avar', 'laba'],
        parent_tpr_action: 'Frota tus manos como si te enjabonaras y anima al niño a frotar las suyas al ritmo de la palabra.',
      },
      {
        id: 'do-manana-limpio', type: 'adjetivo', label: 'limpio', emoji: '✨',
        visual_prompt: 'Mano abierta y reluciente con destellos alrededor, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Mira esas manos! Están limpias y brillan. ¿Cómo están? Di: limpio.',
        stt_expected_array: ['limpio', 'impio', 'limpi', 'inpio', 'pio'],
        parent_tpr_action: 'Enseña tus manos limpias, sópalas como si brillaran y choquen los cinco.',
      },
      {
        id: 'do-manana-rin', type: 'onomatopeya', label: 'rin rin', emoji: '⏰',
        visual_prompt: 'Despertador clásico con dos campanas y líneas de vibración a los lados, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El despertador suena: ¡Rin, rin! ¿Cómo hace el despertador? Di: rin, rin.',
        stt_expected_array: ['rin rin', 'rin', 'ri ri', 'nin nin', 'in in'],
        parent_tpr_action: 'Tápate como si durmieras y, al decir “¡rin, rin!”, despiértate de golpe estirando los brazos con el niño.',
      },
    ],
  },
  {
    id: 'do-comida',
    title: 'La comida',
    icon: '🍽️',
    subtitle: 'Sentarse a la mesa y comer',
    items: [
      {
        id: 'do-comida-cuchara', type: 'sustantivo', label: 'cuchara', emoji: '🥄',
        visual_prompt: 'Cuchara sola vista desde arriba, sin fondo, alto contraste, contorno grueso, sin brillos.',
        tts_string: 'Esto es la cuchara. Comemos las habichuelas con la cuchara. Di: cuchara.',
        stt_expected_array: ['cuchara', 'tuchara', 'chara', 'uchara', 'chacha'],
        parent_tpr_action: 'Pon la cuchara en la mano del niño y llévenla juntos a la boca haciendo el gesto de comer.',
      },
      {
        id: 'do-comida-arroz', type: 'sustantivo', label: 'arroz', emoji: '🍚',
        visual_prompt: 'Plato de arroz blanco con un poco de concón dorado a un lado, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'En el almuerzo comemos arroz. ¿Qué es? Di: arroz.',
        stt_expected_array: ['arroz', 'arro', 'aro', 'oz', 'aoz'],
        parent_tpr_action: 'Haz como que raspas el concón de la olla con una cuchara y prueben juntos con cara de gusto.',
      },
      {
        id: 'do-comida-comer', type: 'verbo', label: 'comer', emoji: '😋',
        visual_prompt: 'Boca abierta recibiendo una cuchara con comida, de perfil simple, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Tengo hambre. ¡Vamos a comer! ¿Qué hacemos? Di: comer.',
        stt_expected_array: ['comer', 'come', 'omer', 'tome', 'omé'],
        parent_tpr_action: 'Frótate la barriga, abre grande la boca y haz como que masticas exagerando el gesto.',
      },
      {
        id: 'do-comida-beber', type: 'verbo', label: 'beber', emoji: '🥤',
        visual_prompt: 'Silueta infantil bebiendo de un vaso inclinado, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Tengo sed. ¡Vamos a beber jugo! ¿Qué hacemos? Di: beber.',
        stt_expected_array: ['beber', 'bebe', 'ebe', 'bebé', 'meme'],
        parent_tpr_action: 'Inclina un vaso vacío sobre tu boca y haz “glu, glu” invitando al niño a imitarte.',
      },
      {
        id: 'do-comida-rico', type: 'adjetivo', label: 'rico', emoji: '👌',
        visual_prompt: 'Cara sonriente relamiéndose con la lengua fuera y un corazón pequeño, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Mmm, qué rico está! ¿Cómo está la comida? Di: rico.',
        stt_expected_array: ['rico', 'iko', 'rito', 'ico', 'itto'],
        parent_tpr_action: 'Relámete, frótate la barriga y pon cara de gusto diciendo “¡mmm, rico!” con el niño.',
      },
      {
        id: 'do-comida-nam', type: 'onomatopeya', label: 'ñam ñam', emoji: '😋',
        visual_prompt: 'Boca masticando con migas alrededor y líneas de movimiento, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Comemos el dulce: ¡Ñam, ñam! ¿Cómo hace la boca? Di: ñam, ñam.',
        stt_expected_array: ['ñam ñam', 'ñam', 'nam nam', 'nam', 'am am'],
        parent_tpr_action: 'Mastica exagerando la mandíbula y que el niño mastique contigo al decir “¡ñam, ñam!”.',
      },
    ],
  },
  {
    id: 'do-colmado',
    title: 'En el colmado',
    icon: '🏪',
    subtitle: 'Ir al colmado a hacer un mandado',
    items: [
      {
        id: 'do-colmado-colmado', type: 'sustantivo', label: 'colmado', emoji: '🏪',
        visual_prompt: 'Fachada de un colmado dominicano con toldo y estantes con productos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Vamos a la esquina. Esto es el colmado. Di: colmado.',
        stt_expected_array: ['colmado', 'colmao', 'comao', 'olmao', 'comado'],
        parent_tpr_action: 'Caminen agarrados de la mano “hasta el colmado” y saluden a un colmadero imaginario.',
      },
      {
        id: 'do-colmado-funda', type: 'sustantivo', label: 'funda', emoji: '🛍️',
        visual_prompt: 'Funda plástica de mandado con víveres asomando, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Guardamos el mandado en la funda. Di: funda.',
        stt_expected_array: ['funda', 'funa', 'unda', 'juna', 'unna'],
        parent_tpr_action: 'Abre una funda de verdad y metan juntos objetos livianos de la casa, uno por uno.',
      },
      {
        id: 'do-colmado-comprar', type: 'verbo', label: 'comprar', emoji: '💵',
        visual_prompt: 'Mano entregando un billete a otra mano sobre un mostrador, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'En el colmado vamos a comprar pan. ¿Qué hacemos? Di: comprar.',
        stt_expected_array: ['comprar', 'compra', 'ompra', 'toprá', 'comprá'],
        parent_tpr_action: 'Dale al niño un “peso” de papel y que “pague” poniéndolo en tu mano al decir la palabra.',
      },
      {
        id: 'do-colmado-cargar', type: 'verbo', label: 'cargar', emoji: '💪',
        visual_prompt: 'Silueta infantil cargando una funda con las dos manos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La funda pesa. ¡Vamos a cargar! ¿Qué hacemos? Di: cargar.',
        stt_expected_array: ['cargar', 'carga', 'cagar', 'tagá', 'cargá'],
        parent_tpr_action: 'Carguen juntos la funda (liviana) unos pasos y déjenla haciendo “¡uf!” de cansancio.',
      },
      {
        id: 'do-colmado-lleno', type: 'adjetivo', label: 'lleno', emoji: '🧺',
        visual_prompt: 'Funda o canasta rebosando de productos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Mira la funda! Está bien llena. ¿Cómo está? Di: lleno.',
        stt_expected_array: ['lleno', 'yeno', 'eno', 'lleto', 'yeto'],
        parent_tpr_action: 'Llenen la funda hasta arriba y muéstrenla diciendo “¡llena, llena!” con cara de asombro.',
      },
      {
        id: 'do-colmado-tilin', type: 'onomatopeya', label: 'tilín', emoji: '🔔',
        visual_prompt: 'Campanita de mostrador con líneas de sonido, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La campanita del colmado suena: ¡Tilín, tilín! ¿Cómo hace? Di: tilín.',
        stt_expected_array: ['tilín', 'tilin', 'ilín', 'ti ti', 'tin tin'],
        parent_tpr_action: 'Toca una campanita imaginaria con el dedo y digan “¡tilín!” cada vez que “entra un cliente”.',
      },
    ],
  },
  {
    id: 'do-bano',
    title: 'El baño',
    icon: '🛁',
    subtitle: 'Agua, jabón y burbujas',
    items: [
      {
        id: 'do-bano-agua', type: 'sustantivo', label: 'agua', emoji: '💧',
        visual_prompt: 'Gota de agua grande y brillante de frente, azul plano, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Abrimos la llave y sale el agua. Di: agua.',
        stt_expected_array: ['agua', 'aba', 'awa', 'aua', 'agüa'],
        parent_tpr_action: 'Mojen un dedo en agua de verdad y tóquense la mano notando el fresquito al decir “agua”.',
      },
      {
        id: 'do-bano-jabon', type: 'sustantivo', label: 'jabón', emoji: '🧼',
        visual_prompt: 'Pastilla de jabón con tres burbujas alrededor, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el jabón. El jabón hace muchas burbujas. Di: jabón.',
        stt_expected_array: ['jabón', 'jabon', 'jabo', 'abón', 'bon'],
        parent_tpr_action: 'Pon la pastilla de jabón en las manos del niño y hagan espuma imaginaria girándola.',
      },
      {
        id: 'do-bano-banar', type: 'verbo', label: 'bañar', emoji: '🛀',
        visual_prompt: 'Silueta infantil dentro de una bañera con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Al agua! Vamos a bañar al muñeco. ¿Qué hacemos? Di: bañar.',
        stt_expected_array: ['bañar', 'baña', 'añar', 'bana', 'añá'],
        parent_tpr_action: 'Frota suavecito los brazos del niño como si lo enjabonaras mientras repiten “bañar”.',
      },
      {
        id: 'do-bano-secar', type: 'verbo', label: 'secar', emoji: '🧻',
        visual_prompt: 'Toalla envolviendo a una silueta infantil, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Salimos del agua. Ahora vamos a secar. ¿Qué hacemos? Di: secar.',
        stt_expected_array: ['secar', 'seca', 'ecar', 'tetá', 'secá'],
        parent_tpr_action: 'Envuelvan al niño (o al muñeco) en una toalla y frótenle la espalda diciendo “secar”.',
      },
      {
        id: 'do-bano-mojado', type: 'adjetivo', label: 'mojado', emoji: '💦',
        visual_prompt: 'Mano con gotas de agua resbalando y pequeñas salpicaduras, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Ay! La mano está mojada. ¿Cómo está la mano? Di: mojado.',
        stt_expected_array: ['mojado', 'mojao', 'ojao', 'moja', 'moxao'],
        parent_tpr_action: 'Mójale un poquito la mano al niño con una toallita y digan “mojao” sacudiendo las manos.',
      },
      {
        id: 'do-bano-chof', type: 'onomatopeya', label: 'chof', emoji: '💦',
        visual_prompt: 'Salpicadura de agua en estrella con gotas saliendo hacia fuera, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua salpica: ¡Chof, chof! ¿Cómo hace el agua? Di: chof.',
        stt_expected_array: ['chof', 'chof chof', 'of', 'tof', 'pof'],
        parent_tpr_action: 'Den palmaditas sobre el agua (o sobre el muslo) diciendo “¡chof!” en cada palmada.',
      },
    ],
  },
  {
    id: 'do-noche',
    title: 'A dormir',
    icon: '🌙',
    subtitle: 'Cuento, abrazo y a la cama',
    items: [
      {
        id: 'do-noche-luna', type: 'sustantivo', label: 'luna', emoji: '🌙',
        visual_prompt: 'Luna creciente grande y sonriente con dos estrellas pequeñas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira el cielo. Esa es la luna. Di: luna.',
        stt_expected_array: ['luna', 'una', 'nuna', 'lula', 'uná'],
        parent_tpr_action: 'Dibujen juntos un círculo grande en el aire con el dedo mientras dicen “luuuna”.',
      },
      {
        id: 'do-noche-cuento', type: 'sustantivo', label: 'cuento', emoji: '📖',
        visual_prompt: 'Libro abierto con una estrella saliendo de las páginas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Antes de dormir leemos un cuento. Di: cuento.',
        stt_expected_array: ['cuento', 'uento', 'tuento', 'cueto', 'ento'],
        parent_tpr_action: 'Busca su cuento favorito, ponlo en sus manos y ábranlo juntos bien despacio.',
      },
      {
        id: 'do-noche-dormir', type: 'verbo', label: 'dormir', emoji: '😴',
        visual_prompt: 'Carita con ojos cerrados sobre una almohada y tres “Z”, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Shhh… ya es hora de dormir. ¿Qué hacemos? Di: dormir.',
        stt_expected_array: ['dormir', 'dormi', 'mimir', 'mimí', 'omir'],
        parent_tpr_action: 'Junta las manos bajo la mejilla, cierren los ojos y ronquen flojito los dos.',
      },
      {
        id: 'do-noche-abrazar', type: 'verbo', label: 'abrazar', emoji: '🤗',
        visual_prompt: 'Dos siluetas abrazándose con un corazón pequeño encima, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Un abrazo a mami y a papi. ¿Qué hacemos? Di: abrazar.',
        stt_expected_array: ['abrazar', 'abraza', 'brazar', 'asasar', 'abazá'],
        parent_tpr_action: 'Dense un abrazo largo de verdad y apriétense un poquito justo al decir la palabra.',
      },
      {
        id: 'do-noche-oscuro', type: 'adjetivo', label: 'oscuro', emoji: '🌑',
        visual_prompt: 'Ventana de noche con cielo oscuro y una estrella, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Se apagó la luz. Todo está oscuro. ¿Cómo está? Di: oscuro.',
        stt_expected_array: ['oscuro', 'ocuro', 'curo', 'ocú', 'oturo'],
        parent_tpr_action: 'Tápale los ojos al niño suavemente con sus propias manos y destapen de golpe: “¡oscuro… luz!”.',
      },
      {
        id: 'do-noche-buho', type: 'onomatopeya', label: 'cu cu', emoji: '🦉',
        visual_prompt: 'Búho de frente con ojos enormes sobre una rama, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La lechuza canta de noche: ¡Cu, cu! ¿Cómo hace? Di: cu, cu.',
        stt_expected_array: ['cu cu', 'cucu', 'cu', 'tu tu', 'uu'],
        parent_tpr_action: 'Pongan las manos como gafas alrededor de los ojos y giren la cabeza como una lechuza: “¡cu, cu!”.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. Progresiones Onomatopeya → Sustantivo → Verbo → Adjetivo (7)
// ---------------------------------------------------------------------------
export const PROGRESSION_SEQUENCES_ESDO: ProgressionSequence[] = [
  {
    id: 'do-seq-guagua', theme: 'Transporte · La guagua', icon: '🚌',
    phases: [
      {
        kind: 'onomatopeya', label: 'fon fon', emoji: '🚌',
        visual_prompt: 'Bocina de guagua con líneas de sonido y letras “FON FON”, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La guagua toca la bocina: ¡Fon, fon! ¿Cómo hace? Di: fon, fon.',
        stt_expected_array: ['fon fon', 'fon', 'pon pon', 'fo fo', 'on on'],
        parent_tpr_action: 'Toca una bocina imaginaria con la palma y digan “¡fon, fon!” dando un brinquito.',
      },
      {
        kind: 'sustantivo', label: 'guagua', emoji: '🚌',
        visual_prompt: 'Guagua dominicana (minibús) de frente, colores planos, ruedas grandes, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Fon, fon! Esta es la guagua. ¿Qué es? Di: guagua.',
        stt_expected_array: ['guagua', 'guaba', 'awagua', 'gagua', 'wawa'],
        parent_tpr_action: 'Formen una guagua: el niño se agarra de tu cintura y avancen por el pasillo parando en “paradas”.',
      },
      {
        kind: 'verbo', label: 'corre', emoji: '💨',
        visual_prompt: 'Guagua con líneas de velocidad detrás avanzando hacia la derecha, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, la guagua corre por la calle. ¿Qué hace? Di: corre.',
        stt_expected_array: ['corre', 'core', 'ore', 'totte', 'coé'],
        parent_tpr_action: 'Corran juntos unos pasos “como la guagua” y frenen de golpe en la parada.',
      },
      {
        kind: 'adjetivo', label: 'llena', emoji: '👥',
        visual_prompt: 'Guagua con muchas caritas asomando por las ventanas, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Cuánta gente! La guagua va bien llena. ¿Cómo va? Di: llena.',
        stt_expected_array: ['llena', 'yena', 'ena', 'lleta', 'yeta'],
        parent_tpr_action: 'Júntense mucho en un espacio chiquito “como en la guagua llena” y ríanse apretaditos.',
      },
    ],
  },
  {
    id: 'do-seq-perro', theme: 'Animales · El perro', icon: '🐶',
    phases: [
      {
        kind: 'onomatopeya', label: 'guau', emoji: '🐶',
        visual_prompt: 'Bocadillo de cómic con “GUAU” y una huella de perro, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El perro ladra: ¡Guau, guau! ¿Cómo hace el perro? Di: guau.',
        stt_expected_array: ['guau', 'gua', 'aua', 'uau', 'gua gua'],
        parent_tpr_action: 'Ponte en cuatro patas y ladra “¡guau, guau!” moviendo la cabeza, animando al niño a ladrar contigo.',
      },
      {
        kind: 'sustantivo', label: 'perro', emoji: '🐕',
        visual_prompt: 'Perro sentado de frente, orejas caídas, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Guau, guau! Este es el perro. ¿Qué es? Di: perro.',
        stt_expected_array: ['perro', 'pero', 'peo', 'eo', 'peto'],
        parent_tpr_action: 'Señala un perro de juguete o una foto y acarícienlo juntos repitiendo “perro”.',
      },
      {
        kind: 'verbo', label: 'brinca', emoji: '⬆️',
        visual_prompt: 'Perro en el aire con las patas recogidas y una curva de salto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el perro brinca por la pelota. ¿Qué hace? Di: brinca.',
        stt_expected_array: ['brinca', 'blinca', 'inca', 'binca', 'bincá'],
        parent_tpr_action: 'Brinquen los dos a la vez diciendo “¡brinca!” en cada bote.',
      },
      {
        kind: 'adjetivo', label: 'peludo', emoji: '🧸',
        visual_prompt: 'Perro con pelaje muy esponjoso y líneas de textura suave, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Toca! El perro es blandito y peludo. ¿Cómo es? Di: peludo.',
        stt_expected_array: ['peludo', 'peludo', 'peluo', 'eludo', 'peú'],
        parent_tpr_action: 'Acaricien un peluche o una manta suave y digan “peludo” pasando la mano despacio.',
      },
    ],
  },
  {
    id: 'do-seq-gato', theme: 'Animales · El gato', icon: '🐱',
    phases: [
      {
        kind: 'onomatopeya', label: 'miau', emoji: '🐱',
        visual_prompt: 'Bocadillo de cómic con “MIAU” y un ovillo de lana, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gato maúlla: ¡Miau, miau! ¿Cómo hace el gato? Di: miau.',
        stt_expected_array: ['miau', 'mia', 'niau', 'au', 'miau miau'],
        parent_tpr_action: 'Frótate la cara con la mano como un gato lavándose y maúlla “¡miau!” con el niño.',
      },
      {
        kind: 'sustantivo', label: 'gato', emoji: '🐈',
        visual_prompt: 'Gato sentado de frente con cola enroscada, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Miau! Este es el gato. ¿Qué es? Di: gato.',
        stt_expected_array: ['gato', 'tato', 'ato', 'gat', 'gatto'],
        parent_tpr_action: 'Señala un gato de juguete o una foto y acarícienle el lomo repitiendo “gato”.',
      },
      {
        kind: 'verbo', label: 'duerme', emoji: '😴',
        visual_prompt: 'Gato acurrucado con los ojos cerrados y tres “Z” encima, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Shhh… el gato duerme en su camita. ¿Qué hace? Di: duerme.',
        stt_expected_array: ['duerme', 'uerme', 'dueme', 'deme', 'dueḿe'],
        parent_tpr_action: 'Junta las manos bajo la mejilla, cierra los ojos y haz “shhh” invitando al niño a “dormir” contigo.',
      },
      {
        kind: 'adjetivo', label: 'suave', emoji: '🪶',
        visual_prompt: 'Gato con una pluma rozando su pelaje y líneas de textura suave, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Toca! El pelo del gato es bien suave. ¿Cómo es? Di: suave.',
        stt_expected_array: ['suave', 'uave', 'ave', 'sua', 'suabe'],
        parent_tpr_action: 'Pasen una pluma o un pañuelo por el brazo del niño bien despacio diciendo “suave”.',
      },
    ],
  },
  {
    id: 'do-seq-lluvia', theme: 'Naturaleza · El aguacero', icon: '🌧️',
    phases: [
      {
        kind: 'onomatopeya', label: 'plic plic', emoji: '💧',
        visual_prompt: 'Tres gotas de agua cayendo con pequeñas ondas al chocar, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El aguacero cae: ¡Plic, plic, plic! ¿Cómo hace? Di: plic, plic.',
        stt_expected_array: ['plic plic', 'plic', 'pic pic', 'pic', 'tic tic'],
        parent_tpr_action: 'Tamborilea con los dedos sobre la mesa como gotas de lluvia y que el niño “llueva” contigo.',
      },
      {
        kind: 'sustantivo', label: 'agua', emoji: '💧',
        visual_prompt: 'Una gota de agua grande y brillante de frente, azul plano, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Plic, plic! Esto es el agua. ¿Qué es? Di: agua.',
        stt_expected_array: ['agua', 'aba', 'awa', 'aua', 'agüa'],
        parent_tpr_action: 'Mojen un dedo en agua de verdad y tóquense la mano notando el fresquito al decir “agua”.',
      },
      {
        kind: 'verbo', label: 'cae', emoji: '⬇️',
        visual_prompt: 'Gota de agua con una flecha hacia abajo y una silueta fantasma más arriba, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el agua cae del cielo. ¿Qué hace? Di: cae.',
        stt_expected_array: ['cae', 'ae', 'tae', 'cai', 'kae'],
        parent_tpr_action: 'Levanten las manos arriba y bájenlas moviendo los dedos hasta el suelo diciendo “caeee”.',
      },
      {
        kind: 'adjetivo', label: 'mojado', emoji: '💦',
        visual_prompt: 'Mano con gotas de agua resbalando y pequeñas salpicaduras, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Ay! La mano está mojada. ¿Cómo está? Di: mojado.',
        stt_expected_array: ['mojado', 'mojao', 'ojao', 'moja', 'moxao'],
        parent_tpr_action: 'Mójale un poquito la mano al niño con una toallita y digan “mojao” sacudiendo las manos.',
      },
    ],
  },
  {
    id: 'do-seq-gallo', theme: 'Animales · El gallo', icon: '🐓',
    phases: [
      {
        kind: 'onomatopeya', label: 'kikirikí', emoji: '🐓',
        visual_prompt: 'Bocadillo de cómic con “KIKIRIKÍ” y un gallo cantando, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gallo canta en la mañana: ¡Kikirikí! ¿Cómo hace? Di: kikirikí.',
        stt_expected_array: ['kikirikí', 'kikiriki', 'kiriki', 'kikí', 'kiki'],
        parent_tpr_action: 'Pongan los codos como alas y canten “¡kikirikí!” estirando el cuello como un gallo.',
      },
      {
        kind: 'sustantivo', label: 'gallo', emoji: '🐓',
        visual_prompt: 'Gallo de perfil con cresta roja, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Kikirikí! Este es el gallo. ¿Qué es? Di: gallo.',
        stt_expected_array: ['gallo', 'gayo', 'ayo', 'gao', 'gallo'],
        parent_tpr_action: 'Señala un gallo en una foto y marquen su cresta con el dedo diciendo “gallo”.',
      },
      {
        kind: 'verbo', label: 'canta', emoji: '🎵',
        visual_prompt: 'Gallo con la boca abierta y notas musicales saliendo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el gallo canta bien duro. ¿Qué hace? Di: canta.',
        stt_expected_array: ['canta', 'tanta', 'anta', 'cata', 'antá'],
        parent_tpr_action: 'Canten los dos “la la la” bien duro y después bajito, turnándose.',
      },
      {
        kind: 'adjetivo', label: 'grande', emoji: '🔎',
        visual_prompt: 'Gallo junto a un pollito para marcar el contraste de tamaño, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Hala! El gallo es bien grande. ¿Cómo es? Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
        parent_tpr_action: 'Abran los brazos todo lo que puedan y pónganse de puntillas diciendo “¡graaande!”.',
      },
    ],
  },
  {
    id: 'do-seq-mar', theme: 'La playa · El mar', icon: '🌊',
    phases: [
      {
        kind: 'onomatopeya', label: 'chas chas', emoji: '🌊',
        visual_prompt: 'Ola rompiendo con espuma y letras “CHAS”, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La ola rompe: ¡Chas, chas! ¿Cómo hace? Di: chas, chas.',
        stt_expected_array: ['chas chas', 'chas', 'cha cha', 'tas tas', 'as as'],
        parent_tpr_action: 'Muevan los brazos como olas y hagan “¡chas!” al “romper” contra las piernas del otro.',
      },
      {
        kind: 'sustantivo', label: 'playa', emoji: '🏖️',
        visual_prompt: 'Playa con arena, palmera y una ola, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Chas, chas! Esto es la playa. ¿Qué es? Di: playa.',
        stt_expected_array: ['playa', 'plaia', 'paya', 'aya', 'plaa'],
        parent_tpr_action: 'Caminen “en la arena” pisando fuerte y descalzos si se puede, diciendo “playa”.',
      },
      {
        kind: 'verbo', label: 'nada', emoji: '🏊',
        visual_prompt: 'Silueta infantil nadando con líneas de agua, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el niño nada en el mar. ¿Qué hace? Di: nada.',
        stt_expected_array: ['nada', 'naa', 'ada', 'nala', 'ná'],
        parent_tpr_action: 'Muevan los brazos como nadando, de pie, y “naden” juntos hasta la orilla.',
      },
      {
        kind: 'adjetivo', label: 'mojado', emoji: '💦',
        visual_prompt: 'Silueta infantil chorreando agua tras salir del mar, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Salió del agua! Está todo mojado. ¿Cómo está? Di: mojado.',
        stt_expected_array: ['mojado', 'mojao', 'ojao', 'moja', 'moxao'],
        parent_tpr_action: 'Sacúdanse como perritos mojados y envuélvanse en una toalla diciendo “mojao”.',
      },
    ],
  },
  {
    id: 'do-seq-pajaro', theme: 'Animales · El pájaro', icon: '🐦',
    phases: [
      {
        kind: 'onomatopeya', label: 'pío pío', emoji: '🐣',
        visual_prompt: 'Bocadillo de cómic con “PÍO PÍO” y un pollito asomando, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pajarito canta: ¡Pío, pío! ¿Cómo hace? Di: pío, pío.',
        stt_expected_array: ['pío pío', 'pio pio', 'pío', 'pio', 'io io'],
        parent_tpr_action: 'Junten los dedos como un pico que se abre y se cierra mientras pían los dos juntos.',
      },
      {
        kind: 'sustantivo', label: 'pájaro', emoji: '🐦',
        visual_prompt: 'Pájaro de perfil posado en una rama, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Pío, pío! Este es el pájaro. ¿Qué es? Di: pájaro.',
        stt_expected_array: ['pájaro', 'pajaro', 'ájaro', 'pajalo', 'payaro'],
        parent_tpr_action: 'Busquen un pájaro por la ventana o en un dibujo, señálenlo y salúdenlo con la mano.',
      },
      {
        kind: 'verbo', label: 'vuela', emoji: '🕊️',
        visual_prompt: 'Pájaro con las alas extendidas y líneas de vuelo curvas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el pájaro vuela por el cielo. ¿Qué hace? Di: vuela.',
        stt_expected_array: ['vuela', 'buela', 'uela', 'bela', 'guela'],
        parent_tpr_action: 'Corran por la sala con los brazos como alas, subiéndolas y bajándolas.',
      },
      {
        kind: 'adjetivo', label: 'chiquito', emoji: '🐤',
        visual_prompt: 'Pajarito diminuto dentro de dos manos abiertas en cuenco, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pajarito es bien chiquito. ¿Cómo es? Di: chiquito.',
        stt_expected_array: ['chiquito', 'chiquito', 'chiquto', 'tiquito', 'quito'],
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
    physical_setup: 'Busca dos peluches del mismo animal pero de distinto tamaño: uno bien GRANDE y uno bien CHIQUITO. Ponlos juntos frente al niño.',
    rounds: [
      {
        label: 'grande', emoji: '🐘',
        tts_trigger: '¿Cuál es el muñeco GRANDE? ¡Dámelo y dilo! Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
        parent_action: 'El niño te entrega el peluche grande mientras lo dice; abrácenlo exagerando lo enorme que es.',
      },
      {
        label: 'chiquito', emoji: '🐭',
        tts_trigger: 'Ahora al revés: ¿cuál es el CHIQUITO? ¡Dámelo y dilo! Di: chiquito.',
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
        label: 'sucio', emoji: '🐷',
        tts_trigger: 'Señala la cuchara SUCIA. ¿Cómo está esta? Dilo. Di: sucio.',
        stt_expected_array: ['sucio', 'utio', 'suio', 'cucho', 'ucio'],
        parent_action: 'El niño señala la cuchara sucia y pongan los dos cara de “¡fo!” apartándola.',
      },
      {
        label: 'limpio', emoji: '✨',
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
        label: 'abrir', emoji: '🔓',
        tts_trigger: 'El juguete está adentro. ¿Qué hacemos para sacarlo? ¡Vamos a ABRIR! Di: abrir.',
        stt_expected_array: ['abrir', 'abre', 'abi', 'air', 'abí'],
        parent_action: 'Abran la caja juntos, bien despacio, y celebren encontrar el juguete con un “¡ta-tán!”.',
      },
      {
        label: 'cerrar', emoji: '🔒',
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
        tts_trigger: 'El carro va pa’ la loma. ¿Qué hace? ¡SUBE arriba! Di: subir.',
        stt_expected_array: ['subir', 'sube', 'ubi', 'tubi', 'subí'],
        parent_action: 'Suban el carro por la rampa bien despacio mientras suena la palabra.',
      },
      {
        label: 'bajar', emoji: '⬇️',
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
        label: 'frío', emoji: '❄️',
        tts_trigger: 'Toca los vasos. ¿Cuál está FRÍO? ¡Brrr! Di: frío.',
        stt_expected_array: ['frío', 'frio', 'fío', 'ío', 'fiío'],
        parent_action: 'El niño toca el vaso frío; tiriten juntos “¡brrr!” encogiendo los hombros.',
      },
      {
        label: 'caliente', emoji: '🔥',
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
        tts_trigger: 'Está oscuro… ¿Qué hacemos con la luz? ¡A PRENDER! Di: prender.',
        stt_expected_array: ['prender', 'prende', 'render', 'ende', 'prendé'],
        parent_action: 'El niño toca el interruptor justo al decirlo y celebran la luz con un “¡ooooh!”.',
      },
      {
        label: 'apagar', emoji: '🌑',
        tts_trigger: 'Ahora al revés. ¿Qué hacemos con la luz? ¡A APAGAR! Di: apagar.',
        stt_expected_array: ['apagar', 'apaga', 'paga', 'agar', 'apagá'],
        parent_action: 'El niño apaga la luz y se dicen “buenas noches” en voz de susurro.',
      },
    ],
  },
];

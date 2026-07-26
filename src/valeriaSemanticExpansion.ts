// ============================================================================
// Valeria+ · Expansión Semántica / Progresión Léxica (V1.0)
// El trabajo semántico NO es construir un diccionario digital: es establecer
// relaciones operativas entre el símbolo (imagen + palabra) y el mundo real del
// paciente. Por eso cada ítem une cuatro capas indivisibles:
//   · visual_prompt        → el asset (imagen sin fondo, alto contraste).
//   · tts_string           → lo que LOCUTA la app (entrada auditiva).
//   · stt_expected_array   → lo que el motor ASR da por VÁLIDO (incluye
//                            aproximaciones fonéticas propias de la edad).
//   · parent_tpr_action    → la acción física del adulto que ancla la palabra
//                            al cuerpo y al entorno real (Total Physical Response).
//
// Tres bloques de contenido, format-first (los consume ValeriaSemanticExpansionScreen):
//   1. DAILY_SCENARIOS      — 5 escenarios de vida diaria · 6 ítems c/u
//                             (2 sustantivos, 2 verbos, 1 adjetivo, 1 onomatopeya).
//                             Objetivo declarado: REPETICIÓN VERBAL (DC-1, opción B).
//   2. PROGRESSION_SEQUENCES — 9 progresiones que amplían el CAMPO SEMÁNTICO de un
//                             concepto en 4 pasos (concepto → parte → acción →
//                             cualidad). Las rutinas transaccionales suben a la
//                             COMBINACIÓN de dos palabras en la acción: «quiero pan».
//   3. CONTRAST_CAPSULES    — 8 cápsulas TPR de contraste activo (pares de
//                             adjetivos y verbos antónimos) con DOS vueltas
//                             evaluadas: palabra objetivo y su opuesta.
//
// Reglas de contenido acordadas con ACOPROS (julio 2026), verificadas por
// scripts/check-content-rules.js:
//   · ES-06 — el tts_string dice el objetivo UNA vez antes de pedirlo. Antes se
//     locutaba «Esto es la cama. Por la mañana saltamos de la cama. Di: cama.»,
//     con la palabra tres veces y poco contexto funcional.
//   · ES-10 — ninguna fase de progresión pide una onomatopeya: el criterio
//     declarado de la secuencia es el campo semántico del concepto.
//   · ES-13 — congruencia de cápsula: el objeto que nombra el audio, el que
//     muestra la imagen y el que pide el setup son el mismo; solo varía el
//     atributo contrastado.
// Protocolo completo: docs/protocolo-expansion-semantica.md
// ============================================================================

export type WordType = 'sustantivo' | 'verbo' | 'adjetivo' | 'onomatopeya';

// Campos obligatorios comunes a todo ítem locutable/evaluable del módulo.
export interface LexicalItem {
  id: string;
  type: WordType;
  label: string;               // palabra que se muestra en la ficha
  emoji: string;               // marcador visual mientras no hay asset definitivo
  pictogram?: string;          // clave del pictograma propio (ES-09); ausente → cae al emoji
  visual_prompt: string;       // Descripción técnica de la imagen (sin fondos, alto contraste)
  tts_string: string;          // Texto exacto a locutar
  stt_expected_array: string[]; // Lista de strings válidos (incluye aproximaciones)
  parent_tpr_action: string;   // Instrucción física corta para el adulto
}

// ---------------------------------------------------------------------------
// 1. ARQUITECTURA DE DATOS · Escenarios de la vida diaria (format-first)
// ---------------------------------------------------------------------------
export interface DailyScenario {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  items: LexicalItem[]; // 2 sustantivos, 2 verbos, 1 adjetivo, 1 onomatopeya
}

export const DAILY_SCENARIOS: DailyScenario[] = [
  {
    id: 'manana',
    title: 'Rutina de mañana',
    icon: '☀️',
    subtitle: 'Despertar, lavarse y vestirse',
    items: [
      {
        id: 'manana-cama', type: 'sustantivo', label: 'cama', emoji: '🛏️',
        visual_prompt: 'Cama infantil vista de frente, sábanas lisas, sin fondo (transparente), contorno grueso, colores planos de alto contraste, sin sombras ni texturas.',
        tts_string: 'Esto es la cama. Di: cama.',
        stt_expected_array: ['cama', 'tama', 'ama', 'kama'],
        parent_tpr_action: 'Da unas palmaditas en la cama y siéntate en ella con el niño antes de levantaros juntos.',
      },
      {
        id: 'manana-cepillo', type: 'sustantivo', label: 'cepillo', emoji: '🪥',
        pictogram: 'cepillo',
        visual_prompt: 'Cepillo de dientes en horizontal con una raya de pasta, sin fondo, alto contraste, contorno grueso, sin degradados.',
        tts_string: 'Esto es el cepillo. Di: cepillo.',
        stt_expected_array: ['cepillo', 'pillo', 'tepillo', 'epillo'],
        parent_tpr_action: 'Pon el cepillo (sin pasta) en la mano del niño y guiad juntos el gesto de cepillar sus dientes.',
      },
      {
        id: 'manana-lavar', type: 'verbo', label: 'lavar', emoji: '🧼',
        pictogram: 'jabon',
        visual_prompt: 'Dos manos frotándose con burbujas de jabón, sin fondo, alto contraste, contorno grueso, colores planos.',
        tts_string: 'Nos lavamos las manos. Di: lavar.',
        stt_expected_array: ['lavar', 'lava', 'aba', 'avar', 'laba'],
        parent_tpr_action: 'Frota tus manos como si te enjabonaras y anima al niño a frotar las suyas al ritmo de la palabra.',
      },
      {
        id: 'manana-vestir', type: 'verbo', label: 'vestir', emoji: '👕',
        pictogram: 'vestir',
        visual_prompt: 'Camiseta infantil de frente entrando por la cabeza de una silueta simple, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Nos ponemos la camiseta. Di: vestir.',
        stt_expected_array: ['vestir', 'viste', 'etir', 'betir', 'vesti'],
        parent_tpr_action: 'Pasa una camiseta por la cabeza del niño y, al asomar, celebradlo con un “¡cucú!”.',
      },
      {
        id: 'manana-limpio', type: 'adjetivo', label: 'limpio', emoji: '🥄',
        pictogram: 'mano-limpia',
        visual_prompt: 'Mano abierta y reluciente con destellos brillantes alrededor, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Las manos están limpias. Di: limpio.',
        stt_expected_array: ['limpio', 'impio', 'limpi', 'inpio', 'pio'],
        parent_tpr_action: 'Muestra tus manos limpias, sopla sobre ellas como si brillaran y chocad los cinco.',
      },
      {
        id: 'manana-rin', type: 'onomatopeya', label: 'rin rin', emoji: '⏰',
        visual_prompt: 'Despertador clásico con dos campanas y líneas de vibración a los lados, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El despertador hace rin, rin. Di: rin, rin.',
        stt_expected_array: ['rin rin', 'rin', 'ri ri', 'ning ning', 'in in'],
        parent_tpr_action: 'Tápate como si durmieras y, al decir “¡rin, rin!”, despiértate de golpe estirando los brazos con el niño.',
      },
    ],
  },
  {
    id: 'comida',
    title: 'Hora de comer',
    icon: '🍽️',
    subtitle: 'Sentarse a la mesa y comer',
    items: [
      {
        id: 'comida-cuchara', type: 'sustantivo', label: 'cuchara', emoji: '🥄',
        pictogram: 'cuchara',
        visual_prompt: 'Cuchara sola vista desde arriba, mango hacia abajo, sin fondo, alto contraste, contorno grueso, sin brillos metálicos.',
        tts_string: 'Esto es la cuchara. Di: cuchara.',
        stt_expected_array: ['cuchara', 'tuchara', 'chara', 'uchara', 'chacha'],
        parent_tpr_action: 'Pon la cuchara en la mano del niño y llevadla juntos a la boca haciendo el gesto de comer.',
      },
      {
        id: 'comida-vaso', type: 'sustantivo', label: 'vaso', emoji: '🥛',
        pictogram: 'vaso',
        visual_prompt: 'Vaso lleno de agua hasta la mitad, de frente, sin fondo, alto contraste, contorno grueso, azul plano para el agua.',
        tts_string: 'Esto es el vaso. Di: vaso.',
        stt_expected_array: ['vaso', 'baso', 'aso', 'bato', 'vato'],
        parent_tpr_action: 'Acerca el vaso a los labios del niño y bebed a la vez haciendo “glu, glu”.',
      },
      {
        id: 'comida-comer', type: 'verbo', label: 'comer', emoji: '😋',
        pictogram: 'comer',
        visual_prompt: 'Boca abierta recibiendo una cuchara con comida, de perfil simple, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Vamos a comer. Di: comer.',
        stt_expected_array: ['comer', 'come', 'omer', 'tome', 'omé'],
        parent_tpr_action: 'Frota tu barriga, abre mucho la boca y haz como que masticas exagerando el gesto.',
      },
      {
        id: 'comida-beber', type: 'verbo', label: 'beber', emoji: '🥤',
        pictogram: 'vaso',
        visual_prompt: 'Silueta infantil bebiendo de un vaso inclinado, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Vamos a beber agua. Di: beber.',
        stt_expected_array: ['beber', 'bebe', 'ebe', 'bebé', 'meme'],
        parent_tpr_action: 'Inclina un vaso vacío sobre tu boca y haz “glu, glu” invitando al niño a imitarte.',
      },
      {
        id: 'comida-rico', type: 'adjetivo', label: 'rico', emoji: '👌',
        visual_prompt: 'Cara sonriente relamiéndose con la lengua fuera y un corazón pequeño, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La comida está rica. Di: rico.',
        stt_expected_array: ['rico', 'iko', 'rito', 'ico', 'itto'],
        parent_tpr_action: 'Relámete, frótate la barriga y pon cara de gusto diciendo “¡mmm, rico!” con el niño.',
      },
      {
        id: 'comida-nam', type: 'onomatopeya', label: 'ñam ñam', emoji: '😋',
        pictogram: 'comer',
        visual_prompt: 'Boca masticando con migas alrededor y líneas de movimiento, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La boca hace ñam, ñam. Di: ñam, ñam.',
        stt_expected_array: ['ñam ñam', 'ñam', 'nam nam', 'nam', 'am am'],
        parent_tpr_action: 'Mastica de forma exagerada moviendo mucho la mandíbula y que el niño mastique contigo al decir “¡ñam, ñam!”.',
      },
    ],
  },
  {
    id: 'parque',
    title: 'En el parque',
    icon: '🌳',
    subtitle: 'Jugar y moverse al aire libre',
    items: [
      {
        id: 'parque-pelota', type: 'sustantivo', label: 'pelota', emoji: '⚽',
        visual_prompt: 'Pelota redonda de colores planos vista de frente, sin fondo, alto contraste, contorno grueso, sin sombra de suelo.',
        tts_string: 'Esto es la pelota. Di: pelota.',
        stt_expected_array: ['pelota', 'peota', 'pota', 'lota', 'peotta'],
        parent_tpr_action: 'Rueda una pelota real hacia el niño y esperad a que la devuelva antes de repetir la palabra.',
      },
      {
        id: 'parque-tobogan', type: 'sustantivo', label: 'tobogán', emoji: '🛝',
        pictogram: 'tobogan',
        visual_prompt: 'Tobogán infantil visto de lado con escalera y rampa curva, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el tobogán. Di: tobogán.',
        stt_expected_array: ['tobogán', 'tobogan', 'togán', 'bogán', 'toto'],
        parent_tpr_action: 'Desliza la mano del niño por tu brazo inclinado como si fuera la rampa del tobogán.',
      },
      {
        id: 'parque-correr', type: 'verbo', label: 'correr', emoji: '🏃',
        pictogram: 'correr',
        visual_prompt: 'Silueta infantil corriendo con líneas de velocidad detrás, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'En el parque vamos a correr. Di: correr.',
        stt_expected_array: ['correr', 'corre', 'ore', 'coé', 'totté'],
        parent_tpr_action: 'Corre en el sitio moviendo mucho los brazos y anima al niño a correr contigo unos pasos.',
      },
      {
        id: 'parque-saltar', type: 'verbo', label: 'saltar', emoji: '🤸',
        pictogram: 'saltar',
        visual_prompt: 'Silueta infantil saltando con los pies despegados del suelo y una curva de salto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Saltamos como una rana. Di: saltar.',
        stt_expected_array: ['saltar', 'salta', 'ata', 'talta', 'atá'],
        parent_tpr_action: 'Salta con los dos pies juntos diciendo “¡salta!” en cada bote y que el niño salte contigo.',
      },
      {
        id: 'parque-alto', type: 'adjetivo', label: 'alto', emoji: '🦒',
        visual_prompt: 'Flecha grande apuntando hacia arriba junto a una silueta estirada de puntillas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El columpio sube muy alto. Di: alto.',
        stt_expected_array: ['alto', 'ato', 'atto', 'álto', 'auto'],
        parent_tpr_action: 'Estírate de puntillas con los brazos hacia el cielo y levanta al niño en brazos diciendo “¡alto!”.',
      },
      {
        id: 'parque-boing', type: 'onomatopeya', label: 'boing', emoji: '⚽',
        visual_prompt: 'Pelota rebotando con dos siluetas fantasma y flechas curvas de rebote, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La pelota hace boing. Di: boing.',
        stt_expected_array: ['boing', 'boin', 'boi', 'bo bo', 'boing boing'],
        parent_tpr_action: 'Bota una pelota (o tú mismo con las rodillas) diciendo “¡boing!” en cada rebote junto al niño.',
      },
    ],
  },
  {
    id: 'bano',
    title: 'Hora del baño',
    icon: '🛁',
    subtitle: 'Agua, jabón y burbujas',
    items: [
      {
        id: 'bano-banera', type: 'sustantivo', label: 'bañera', emoji: '🛁',
        visual_prompt: 'Bañera con patas vista de lado con algo de espuma asomando, sin fondo, alto contraste, contorno grueso, colores planos.',
        tts_string: 'Esto es la bañera. Di: bañera.',
        stt_expected_array: ['bañera', 'añera', 'banera', 'ñera', 'babera'],
        parent_tpr_action: 'Señala la bañera (o un barreño) y haced juntos el gesto de meteros dentro levantando mucho las piernas.',
      },
      {
        id: 'bano-jabon', type: 'sustantivo', label: 'jabón', emoji: '🧼',
        pictogram: 'jabon',
        visual_prompt: 'Pastilla de jabón con tres burbujas alrededor, sin fondo, alto contraste, contorno grueso, colores planos.',
        tts_string: 'Esto es el jabón. Di: jabón.',
        stt_expected_array: ['jabón', 'jabon', 'abón', 'avon', 'bon'],
        parent_tpr_action: 'Pon la pastilla de jabón en las manos del niño y giradla juntos haciendo espuma imaginaria.',
      },
      {
        id: 'bano-banar', type: 'verbo', label: 'bañar', emoji: '🛀',
        pictogram: 'banar',
        visual_prompt: 'Silueta infantil dentro de una bañera con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Vamos a bañar al muñeco. Di: bañar.',
        stt_expected_array: ['bañar', 'baña', 'añar', 'bana', 'añá'],
        parent_tpr_action: 'Frota suavemente los brazos del niño como si lo enjabonaras mientras repetís “bañar”.',
      },
      {
        id: 'bano-frotar', type: 'verbo', label: 'frotar', emoji: '🧽',
        pictogram: 'esponja',
        visual_prompt: 'Esponja frotando con líneas circulares de movimiento y burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Pasamos la esponja por el brazo. Di: frotar.',
        stt_expected_array: ['frotar', 'frota', 'otar', 'fota', 'otá'],
        parent_tpr_action: 'Frota círculos suaves en la espalda del niño con la mano o una esponja al ritmo de la palabra.',
      },
      {
        id: 'bano-caliente', type: 'adjetivo', label: 'caliente', emoji: '♨️',
        visual_prompt: 'Vaso o bañera con tres líneas onduladas de vapor subiendo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua está calentita. Di: caliente.',
        stt_expected_array: ['caliente', 'aliente', 'caiente', 'tatiente', 'cayente'],
        parent_tpr_action: 'Tocad el agua templada con un dedo y abanicad la mano exagerando: “¡uf, caliente!”.',
      },
      {
        id: 'bano-chof', type: 'onomatopeya', label: 'chof', emoji: '💦',
        visual_prompt: 'Salpicadura de agua en estrella con gotas saliendo hacia fuera, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua hace chof. Di: chof.',
        stt_expected_array: ['chof', 'chof chof', 'of', 'tof', 'pof'],
        parent_tpr_action: 'Dad palmaditas sobre el agua (o sobre el muslo) diciendo “¡chof!” en cada palmada.',
      },
    ],
  },
  {
    id: 'noche',
    title: 'A dormir',
    icon: '🌙',
    subtitle: 'Cuento, abrazo y a la cama',
    items: [
      {
        id: 'noche-luna', type: 'sustantivo', label: 'luna', emoji: '🌙',
        visual_prompt: 'Luna creciente grande y sonriente con dos estrellas pequeñas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es la luna. Di: luna.',
        stt_expected_array: ['luna', 'una', 'nuna', 'lula', 'uná'],
        parent_tpr_action: 'Dibujad juntos un círculo grande en el aire con el dedo mientras decís “luuuna”.',
      },
      {
        id: 'noche-cuento', type: 'sustantivo', label: 'cuento', emoji: '📖',
        visual_prompt: 'Libro abierto con una estrella saliendo de las páginas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Antes de dormir leemos un cuento. Di: cuento.',
        stt_expected_array: ['cuento', 'uento', 'tuento', 'cueto', 'ento'],
        parent_tpr_action: 'Coge su cuento favorito, ponlo en sus manos y abridlo juntos muy despacio.',
      },
      {
        id: 'noche-dormir', type: 'verbo', label: 'dormir', emoji: '😴',
        pictogram: 'dormir',
        visual_prompt: 'Carita con ojos cerrados sobre una almohada y tres “Z”, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Es la hora de dormir. Di: dormir.',
        stt_expected_array: ['dormir', 'dormi', 'mimir', 'mimí', 'omir'],
        parent_tpr_action: 'Junta las manos bajo la mejilla, cerrad los ojos y roncad flojito los dos.',
      },
      {
        id: 'noche-abrazar', type: 'verbo', label: 'abrazar', emoji: '🤗',
        pictogram: 'abrazo',
        visual_prompt: 'Dos siluetas abrazándose con un corazón pequeño encima, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Nos damos un abrazo. Di: abrazar.',
        stt_expected_array: ['abrazar', 'abraza', 'brazar', 'asasar', 'abazar'],
        parent_tpr_action: 'Daos un abrazo largo de verdad y apretad un poquito justo al decir la palabra.',
      },
      {
        id: 'noche-oscuro', type: 'adjetivo', label: 'oscuro', emoji: '🌑',
        visual_prompt: 'Ventana de noche con cielo oscuro y una estrella, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Todo está oscuro. Di: oscuro.',
        stt_expected_array: ['oscuro', 'ocuro', 'curo', 'ocú', 'oturo'],
        parent_tpr_action: 'Tapad los ojos del niño suavemente con sus propias manos y destapad de golpe: “¡oscuro… luz!”.',
      },
      {
        id: 'noche-buho', type: 'onomatopeya', label: 'uh uh', emoji: '🦉',
        visual_prompt: 'Búho de frente con ojos enormes sobre una rama, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El búho hace uh, uh. Di: uh, uh.',
        stt_expected_array: ['uh uh', 'u u', 'uh', 'bu bu', 'uu'],
        parent_tpr_action: 'Poned las manos como gafas alrededor de los ojos y girad la cabeza como un búho diciendo “¡uh, uh!”.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. PROGRESIÓN LÉXICA · Campo semántico de un concepto (DC-2, opción A)
//    Cada secuencia amplía el vocabulario que ORBITA un mismo concepto en 4
//    pasos: el concepto, una parte o elemento suyo, qué hace y cómo es.
//
//    Antes las fases eran una escalera de TIPO DE PALABRA que arrancaba en una
//    onomatopeya (Onomatopeya → Sustantivo → Verbo → Adjetivo). Las logopedas
//    de ACOPROS señalaron que esa escalera no sirve ni para ampliar campo
//    semántico ni para producir frases: pedir «brum» no enseña nada sobre el
//    coche. ACOPROS resolvió DC-2 a favor del campo semántico, así que la fase
//    de onomatopeya se sustituye por una palabra REAL del entorno del concepto
//    (coche → rueda; perro → pata) y el concepto pasa a abrir la secuencia.
//
//    Regla de estilo de los tts_string (ES-06): presentación breve + petición,
//    con el objetivo apareciendo UNA sola vez antes de pedirlo.
//    Regla de congruencia (ES-13): el emoji muestra el objeto que nombra el
//    audio. Por eso las cualidades ya no se ilustran con un objeto ajeno (un
//    osito para «peludo», una lupa para «grande»): muestran el propio animal.
// ---------------------------------------------------------------------------
export type ProgressionPhaseKind = 'concepto' | 'parte' | 'accion' | 'cualidad';

export interface ProgressionPhase {
  kind: ProgressionPhaseKind;
  label: string;
  emoji: string;
  pictogram?: string;           // clave del pictograma propio (ES-09)
  visual_prompt: string;        // Asset visual
  tts_string: string;           // Prompt TTS
  stt_expected_array: string[]; // Target STT (incluye aproximaciones fonéticas de la edad)
  parent_tpr_action: string;    // Instrucción TPR exacta para el padre
}

export interface ProgressionSequence {
  id: string;
  theme: string;                // concepto que se amplía
  icon: string;
  // Orden fijo: [concepto, parte, acción, cualidad]
  phases: [ProgressionPhase, ProgressionPhase, ProgressionPhase, ProgressionPhase];
}

export const PROGRESSION_SEQUENCES: ProgressionSequence[] = [
  {
    id: 'seq-coche', theme: 'Transporte · El coche', icon: '🚗',
    phases: [
      {
        kind: 'concepto', label: 'coche', emoji: '🚗',
        visual_prompt: 'Coche de juguete de frente, colores planos, ruedas grandes, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el coche. Di: coche.',
        stt_expected_array: ['coche', 'oche', 'tote', 'cote', 'oto'],
        parent_tpr_action: 'Pon el coche en la mano del niño, señálalo y repetid juntos “coche” mientras lo movéis.',
      },
      {
        kind: 'parte', label: 'rueda', emoji: '🛞',
        pictogram: 'rueda',
        visual_prompt: 'Una rueda de coche de frente, negra con llanta clara, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El coche tiene ruedas. Di: rueda.',
        stt_expected_array: ['rueda', 'ueda', 'lueda', 'weda', 'rued'],
        parent_tpr_action: 'Coged el coche y girad una rueda con el dedo del niño, repitiendo “rueda” en cada vuelta.',
      },
      {
        kind: 'accion', label: 'corre', emoji: '💨',
        pictogram: 'correr',
        visual_prompt: 'Coche con líneas de velocidad detrás avanzando hacia la derecha, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El coche corre. Di: corre.',
        stt_expected_array: ['corre', 'core', 'ore', 'totte', 'coé'],
        parent_tpr_action: 'Haz correr el coche por la mesa y después por el brazo del niño, acelerando al decir “corre”.',
      },
      {
        kind: 'cualidad', label: 'rápido', emoji: '🚗',
        visual_prompt: 'Coche con un rayo y tres líneas de velocidad marcadas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El coche es muy rápido. Di: rápido.',
        stt_expected_array: ['rápido', 'rapido', 'apido', 'pido', 'papido'],
        parent_tpr_action: 'Corre con el niño de la mano unos pasos y frenad de golpe diciendo “¡rápido… y stop!”.',
      },
    ],
  },
  {
    id: 'seq-perro', theme: 'Animales · El perro', icon: '🐶',
    phases: [
      {
        kind: 'concepto', label: 'perro', emoji: '🐕',
        visual_prompt: 'Perro sentado de frente, orejas caídas, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el perro. Di: perro.',
        stt_expected_array: ['perro', 'pero', 'peo', 'eo', 'peto'],
        parent_tpr_action: 'Señala un perro de juguete o una foto y acariciadlo juntos repitiendo “perro”.',
      },
      {
        kind: 'parte', label: 'pata', emoji: '🐾',
        visual_prompt: 'Huella de pata de perro con cuatro dedos y almohadilla, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El perro tiene cuatro patas. Di: pata.',
        stt_expected_array: ['pata', 'ata', 'pat', 'para', 'patta'],
        parent_tpr_action: 'Poned las manos en el suelo como patas y caminad a cuatro patas un par de pasos diciendo “pata”.',
      },
      {
        kind: 'accion', label: 'salta', emoji: '⬆️',
        pictogram: 'saltar',
        visual_prompt: 'Perro en el aire con las patas recogidas y una curva de salto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El perro salta para coger la pelota. Di: salta.',
        stt_expected_array: ['salta', 'sata', 'ata', 'talta', 'atá'],
        parent_tpr_action: 'Haz saltar al perro de juguete y saltad los dos a la vez diciendo “¡salta!”.',
      },
      {
        kind: 'cualidad', label: 'peludo', emoji: '🐕',
        visual_prompt: 'Perro con pelaje muy esponjoso y líneas de textura suave, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El perro es blandito y peludo. Di: peludo.',
        stt_expected_array: ['peludo', 'peu', 'eludo', 'pelu', 'peúdo'],
        parent_tpr_action: 'Acariciad un peluche o una manta suave y decid “peludo” pasando la mano despacio.',
      },
    ],
  },
  {
    id: 'seq-vaca', theme: 'Animales · La vaca', icon: '🐄',
    phases: [
      {
        kind: 'concepto', label: 'vaca', emoji: '🐄',
        visual_prompt: 'Vaca de pie de perfil con manchas, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es la vaca. Di: vaca.',
        stt_expected_array: ['vaca', 'baca', 'aca', 'bata', 'baka'],
        parent_tpr_action: 'Señala una vaca de juguete o una foto y recorred sus manchas con el dedo diciendo “vaca”.',
      },
      {
        kind: 'parte', label: 'leche', emoji: '🥛',
        pictogram: 'vaso-leche',
        visual_prompt: 'Vaso de leche lleno hasta arriba, blanco plano, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'De la vaca sale la leche. Di: leche.',
        stt_expected_array: ['leche', 'eche', 'lete', 'lecha', 'eshe'],
        parent_tpr_action: 'Servid un poco de leche en su vaso y dad un sorbo cada uno diciendo “leche” antes de beber.',
      },
      {
        kind: 'accion', label: 'come', emoji: '🌿',
        visual_prompt: 'Vaca con la cabeza agachada sobre hierba verde, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La vaca come hierba. Di: come.',
        stt_expected_array: ['come', 'ome', 'tome', 'omé', 'meme'],
        parent_tpr_action: 'Agacha la cabeza como la vaca y haced que masticáis hierba moviendo la mandíbula al decir “come”.',
      },
      {
        kind: 'cualidad', label: 'grande', emoji: '🐄',
        visual_prompt: 'Vaca junto a una silueta pequeña de niño para marcar el contraste de tamaño, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La vaca es muy grande. Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
        parent_tpr_action: 'Abrid los brazos todo lo que podáis y poneos de puntillas diciendo “¡graaande!”.',
      },
    ],
  },
  {
    id: 'seq-gato', theme: 'Animales · El gato', icon: '🐱',
    phases: [
      {
        kind: 'concepto', label: 'gato', emoji: '🐈',
        visual_prompt: 'Gato sentado de frente con cola enroscada, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el gato. Di: gato.',
        stt_expected_array: ['gato', 'tato', 'ato', 'gat', 'gatto'],
        parent_tpr_action: 'Señala un gato de juguete o una foto y acariciadle el lomo repitiendo “gato”.',
      },
      {
        kind: 'parte', label: 'bigote', emoji: '🐱',
        visual_prompt: 'Cara de gato en primer plano con los bigotes largos muy marcados, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gato tiene bigotes largos. Di: bigote.',
        stt_expected_array: ['bigote', 'bigotes', 'igote', 'bitote', 'gote'],
        parent_tpr_action: 'Dibujad bigotes en el aire desde la nariz hacia las mejillas del niño mientras decís “bigote”.',
      },
      {
        kind: 'accion', label: 'duerme', emoji: '😴',
        pictogram: 'dormir',
        visual_prompt: 'Gato acurrucado con los ojos cerrados y tres “Z” encima, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gato duerme en su cama. Di: duerme.',
        stt_expected_array: ['duerme', 'uerme', 'dueme', 'deme', 'duemme'],
        parent_tpr_action: 'Junta las manos bajo la mejilla, cierra los ojos y haz “shhh” invitando al niño a “dormir” contigo.',
      },
      {
        kind: 'cualidad', label: 'suave', emoji: '🐈',
        visual_prompt: 'Gato con una mano acariciando su lomo y líneas de textura suave, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pelo del gato es muy suave. Di: suave.',
        stt_expected_array: ['suave', 'uave', 'ave', 'sua', 'suabe'],
        parent_tpr_action: 'Pasad una pluma o un pañuelo por el brazo del niño muy despacio diciendo “suave”.',
      },
    ],
  },
  {
    id: 'seq-lluvia', theme: 'Naturaleza · La lluvia', icon: '🌧️',
    phases: [
      {
        kind: 'concepto', label: 'agua', emoji: '💧',
        visual_prompt: 'Una gota de agua grande y brillante de frente, azul plano, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el agua. Di: agua.',
        stt_expected_array: ['agua', 'aba', 'awa', 'aua', 'agüa'],
        parent_tpr_action: 'Mojad un dedo en agua real y tocaos la mano notando el frío mientras decís “agua”.',
      },
      {
        kind: 'parte', label: 'nube', emoji: '☁️',
        visual_prompt: 'Nube gris redondeada con tres gotas cayendo por debajo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua sale de la nube. Di: nube.',
        stt_expected_array: ['nube', 'ube', 'nue', 'nuve', 'mube'],
        parent_tpr_action: 'Señalad una nube por la ventana (o dibujad una en el aire) y decid “nube” soplando flojito.',
      },
      {
        kind: 'accion', label: 'cae', emoji: '⬇️',
        visual_prompt: 'Gota de agua con una flecha hacia abajo y una silueta fantasma más arriba, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua cae del cielo. Di: cae.',
        stt_expected_array: ['cae', 'ae', 'tae', 'cai', 'kae'],
        parent_tpr_action: 'Levanta las manos arriba y bájalas moviendo los dedos hasta el suelo diciendo “caeee”.',
      },
      {
        kind: 'cualidad', label: 'mojado', emoji: '🤲',
        pictogram: 'manos-mojadas',
        visual_prompt: 'Dos manos abiertas con gotas de agua resbalando y pequeñas salpicaduras, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La mano está mojada. Di: mojado.',
        stt_expected_array: ['mojado', 'mojao', 'ojado', 'moja', 'moxado'],
        parent_tpr_action: 'Moja un poco la mano del niño con una toallita y decid “mojado” sacudiendo las manos.',
      },
    ],
  },
  {
    id: 'seq-tren', theme: 'Transporte · El tren', icon: '🚂',
    phases: [
      {
        kind: 'concepto', label: 'tren', emoji: '🚆',
        visual_prompt: 'Tren de tres vagones de perfil sobre una vía recta, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el tren. Di: tren.',
        stt_expected_array: ['tren', 'ten', 'te', 'tan', 'tren tren'],
        parent_tpr_action: 'Haced un trenecito: el niño se agarra a tu cintura y avanzad por el pasillo repitiendo “tren”.',
      },
      {
        kind: 'parte', label: 'vagón', emoji: '🚃',
        visual_prompt: 'Un solo vagón de tren de perfil, con ventanas cuadradas y ruedas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El tren lleva muchos vagones. Di: vagón.',
        stt_expected_array: ['vagón', 'vagon', 'agón', 'bagón', 'gon'],
        parent_tpr_action: 'Poned en fila tres cajas o cojines como vagones y enganchadlos diciendo “vagón” en cada uno.',
      },
      {
        kind: 'accion', label: 'para', emoji: '🛑',
        pictogram: 'parar',
        visual_prompt: 'Tren detenido junto a un andén con una señal de stop, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El tren para en la estación. Di: para.',
        stt_expected_array: ['para', 'ara', 'pa', 'pala', 'pará'],
        parent_tpr_action: 'Avanzad como un tren y frenad en seco al decir “¡para!”, quedándoos completamente quietos.',
      },
      {
        kind: 'cualidad', label: 'largo', emoji: '🚆',
        visual_prompt: 'Tren de muchos vagones que se extiende de lado a lado de la imagen, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El tren es muy largo. Di: largo.',
        stt_expected_array: ['largo', 'argo', 'lago', 'ago', 'lalgo'],
        parent_tpr_action: 'Separad los brazos todo lo posible marcando lo “laaargo” que es el tren.',
      },
    ],
  },
  {
    id: 'seq-pajaro', theme: 'Animales · El pájaro', icon: '🐦',
    phases: [
      {
        kind: 'concepto', label: 'pájaro', emoji: '🐦',
        pictogram: 'pajaro',
        visual_prompt: 'Pájaro pequeño de perfil posado en una rama, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el pájaro. Di: pájaro.',
        stt_expected_array: ['pájaro', 'pajaro', 'ajaro', 'paro', 'pápa'],
        parent_tpr_action: 'Señalad un pájaro por la ventana o en una foto y seguidlo con el dedo diciendo “pájaro”.',
      },
      {
        kind: 'parte', label: 'pluma', emoji: '🪶',
        pictogram: 'pluma',
        visual_prompt: 'Una pluma suelta vista de frente, con el raquis marcado, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pájaro tiene plumas. Di: pluma.',
        stt_expected_array: ['pluma', 'plumas', 'uma', 'puma', 'luma'],
        parent_tpr_action: 'Soplad una pluma de verdad (o un trocito de papel) para que flote y decid “pluma” al cogerla.',
      },
      {
        kind: 'accion', label: 'vuela', emoji: '🐦',
        pictogram: 'pajaro',
        visual_prompt: 'Pájaro con las alas abiertas en pleno vuelo y una curva de trayectoria, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pájaro vuela por el cielo. Di: vuela.',
        stt_expected_array: ['vuela', 'uela', 'buela', 'vela', 'wela'],
        parent_tpr_action: 'Abrid los brazos como alas y dad una vuelta por la habitación “volando” al decir “vuela”.',
      },
      {
        kind: 'cualidad', label: 'pequeño', emoji: '🐤',
        visual_prompt: 'Pájaro diminuto junto a una mano abierta que lo sostiene, para marcar el tamaño, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pájaro es muy pequeño. Di: pequeño.',
        stt_expected_array: ['pequeño', 'pequeno', 'equeño', 'peque', 'pekeño'],
        parent_tpr_action: 'Juntad el índice y el pulgar dejando un huequito y mirad por él diciendo “pequeñito”.',
      },
    ],
  },
  {
    id: 'seq-pan', theme: 'Alimentación · El desayuno', icon: '🍞',
    phases: [
      {
        kind: 'concepto', label: 'pan', emoji: '🍞',
        visual_prompt: 'Rebanada de pan de molde de frente, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el pan. Di: pan.',
        stt_expected_array: ['pan', 'an', 'pa', 'pam', 'papan'],
        parent_tpr_action: 'Pon un trozo de pan en la mano del niño y oledlo juntos antes de decir “pan”.',
      },
      {
        kind: 'parte', label: 'taza', emoji: '🍵',
        visual_prompt: 'Taza de desayuno con asa vista de frente y vapor saliendo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'En el desayuno bebemos de la taza. Di: taza.',
        stt_expected_array: ['taza', 'aza', 'tasa', 'taa', 'tata'],
        parent_tpr_action: 'Coged la taza del desayuno por el asa entre los dos y dad un sorbo diciendo “taza”.',
      },
      {
        // Fase transaccional: única del banco que sube a la COMBINACIÓN de dos
        // palabras («quiero pan»), porque aquí el objetivo es pedir, no nombrar.
        kind: 'accion', label: 'quiero pan', emoji: '🙋',
        visual_prompt: 'Silueta infantil con la mano levantada señalando una rebanada de pan, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Tienes hambre y lo pides. Di: quiero pan.',
        stt_expected_array: ['quiero pan', 'quiero', 'kiero pan', 'ero pan', 'quero pan'],
        parent_tpr_action: 'Sujeta el pan a la vista pero fuera de su alcance y espera la petición antes de dárselo.',
      },
      {
        kind: 'cualidad', label: 'tostado', emoji: '🍞',
        visual_prompt: 'Rebanada de pan tostada, más dorada y con marcas de tostadora, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pan está tostado. Di: tostado.',
        stt_expected_array: ['tostado', 'ostado', 'totado', 'tosta', 'tostao'],
        parent_tpr_action: 'Comparad una rebanada blanda y una tostada tocándolas: la tostada cruje al apretarla.',
      },
    ],
  },
  {
    id: 'seq-globo', theme: 'Juego · El globo', icon: '🎈',
    phases: [
      {
        kind: 'concepto', label: 'globo', emoji: '🎈',
        visual_prompt: 'Globo inflado con su nudo y una cuerda corta, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el globo. Di: globo.',
        stt_expected_array: ['globo', 'gobo', 'obo', 'lobo', 'gloo'],
        parent_tpr_action: 'Dad un globo al niño y sujetadlo entre los dos mientras repetís “globo”.',
      },
      {
        kind: 'parte', label: 'cuerda', emoji: '🧵',
        pictogram: 'cuerda',
        visual_prompt: 'Cuerda fina y ondulada colgando, con un pequeño lazo en el extremo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El globo tiene una cuerda. Di: cuerda.',
        stt_expected_array: ['cuerda', 'uerda', 'tuerda', 'cueda', 'kuerda'],
        parent_tpr_action: 'Atad una cuerda al globo y dejad que el niño tire de ella diciendo “cuerda”.',
      },
      {
        kind: 'accion', label: 'sopla', emoji: '💨',
        pictogram: 'soplar',
        visual_prompt: 'Boca de perfil soplando hacia un globo que se hincha, con líneas de aire, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Soplamos para inflar el globo. Di: sopla.',
        stt_expected_array: ['sopla', 'opla', 'popla', 'sopa', 'oplá'],
        parent_tpr_action: 'Soplad los dos a la vez sobre la mano del otro para notar el aire antes de decir “sopla”.',
      },
      {
        kind: 'cualidad', label: 'redondo', emoji: '🎈',
        visual_prompt: 'Globo bien inflado y perfectamente redondo, con una línea circular que remarca su forma, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El globo es redondo. Di: redondo.',
        stt_expected_array: ['redondo', 'edondo', 'dondo', 'redon', 'reondo'],
        parent_tpr_action: 'Dibujad un círculo grande en el aire con los dos brazos diciendo “redoooondo”.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 3. CONTRASTE ACTIVO · Cápsulas TPR de adjetivos y verbos antónimos
//    El sistema guía al padre: prepara el entorno real, la app dispara la
//    pregunta y el éxito se mide por la palabra objetivo (más el gesto físico).
//    Cada cápsula tiene DOS vueltas evaluadas: la palabra objetivo y su opuesta
//    (los testers encontraban demasiado corta la versión de una sola vuelta).
// ---------------------------------------------------------------------------
export type ContrastKind = 'adjetivos' | 'verbos';

export interface ContrastRound {
  label: string;                // palabra objetivo de esta vuelta
  emoji: string;
  // ES-12 · Clave del pictograma de ESTA vuelta. En una cápsula, las dos
  // vueltas comparten objeto (regla de congruencia ES-13) y solo difieren en
  // el atributo, así que con emoji las dos tarjetas de la vuelta de
  // comprensión salen idénticas y la tarea es irresoluble. La clave es lo que
  // permite dibujar «cuchara sucia» frente a «cuchara limpia».
  pictogram?: string;
  tts_trigger: string;          // Disparador TTS: la pregunta exacta que emite la app
  stt_expected_array: string[]; // objetivo + aproximaciones fonéticas válidas
  parent_action: string;        // gesto físico en pareja que ancla la palabra
}

export interface ContrastCapsule {
  id: string;
  code: string;
  kind: ContrastKind;
  pair: [string, string];       // par en contraste (grande/pequeño, abrir/cerrar…)
  icon: string;
  physical_setup: string;       // Setup Físico: qué prepara el padre en el entorno real
  rounds: [ContrastRound, ContrastRound]; // vuelta 1 (objetivo) + vuelta 2 (opuesta)
}

export const CONTRAST_CAPSULES: ContrastCapsule[] = [
  {
    id: 'cap-grande-pequeno', code: 'CT-1', kind: 'adjetivos',
    pair: ['grande', 'pequeño'], icon: '🧸',
    physical_setup: 'Prepara dos ositos de peluche iguales pero de distinto tamaño: uno claramente GRANDE y uno claramente PEQUEÑO. Colócalos juntos delante del niño.',
    rounds: [
      {
        label: 'grande', emoji: '🧸',
        pictogram: 'osito-grande',
        tts_trigger: '¿Cuál es el osito GRANDE? ¡Dámelo y dilo! Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
        parent_action: 'El niño te entrega el osito grande mientras lo dice; abrazadlo exagerando lo enorme que es.',
      },
      {
        label: 'pequeño', emoji: '🧸',
        pictogram: 'osito-pequeno',
        tts_trigger: 'Ahora al revés: ¿cuál es el osito PEQUEÑO? ¡Dámelo y dilo! Di: pequeño.',
        stt_expected_array: ['pequeño', 'pequeno', 'pekeño', 'equeño', 'peño'],
        parent_action: 'El niño te da el osito pequeño; escondedlo en una mano y decid “pequeño” con vocecita mini.',
      },
    ],
  },
  {
    id: 'cap-limpio-sucio', code: 'CT-2', kind: 'adjetivos',
    pair: ['limpio', 'sucio'], icon: '🥄',
    physical_setup: 'Coge dos cucharas iguales: lava una hasta dejarla brillante y mancha la otra con un poco de comida o barro. Ponlas una al lado de la otra.',
    rounds: [
      {
        label: 'sucio', emoji: '🥄',
        pictogram: 'cuchara-sucia',
        tts_trigger: 'Señala la cuchara SUCIA. ¿Cómo está esta? Dilo. Di: sucio.',
        stt_expected_array: ['sucio', 'utio', 'suio', 'cucho', 'ucio'],
        parent_action: 'El niño señala la cuchara sucia y ponéis los dos cara de “¡puaj!” apartándola.',
      },
      {
        label: 'limpio', emoji: '🥄',
        pictogram: 'cuchara-limpia',
        tts_trigger: 'Y esta otra cuchara, ¿cómo está? ¡Mira cómo brilla! Di: limpio.',
        stt_expected_array: ['limpio', 'impio', 'limpi', 'inpio', 'pio'],
        parent_action: 'Señalad la limpia, soplad sobre ella como si brillara y chocad los cinco.',
      },
    ],
  },
  {
    id: 'cap-abrir-cerrar', code: 'CT-3', kind: 'verbos',
    pair: ['abrir', 'cerrar'], icon: '📦',
    physical_setup: 'Pon delante del niño una caja con tapa y mete dentro, a la vista, su juguete favorito. Cierra la tapa.',
    rounds: [
      {
        label: 'abrir', emoji: '📦',
        pictogram: 'caja-abierta',
        tts_trigger: 'El juguete está dentro. ¿Qué hacemos para sacarlo? ¡Vamos a ABRIR! Di: abrir.',
        stt_expected_array: ['abrir', 'abre', 'abi', 'air', 'abí'],
        parent_action: 'Abrid la caja juntos, muy despacio, y celebrad encontrar el juguete con un “¡tachán!”.',
      },
      {
        label: 'cerrar', emoji: '📦',
        pictogram: 'caja-cerrada',
        tts_trigger: 'Guardamos el juguete. ¿Qué hacemos con la tapa? ¡A CERRAR! Di: cerrar.',
        stt_expected_array: ['cerrar', 'cerra', 'errar', 'tetar', 'cera'],
        parent_action: 'El niño empuja la tapa hasta cerrarla del todo mientras dice la palabra.',
      },
    ],
  },
  {
    id: 'cap-subir-bajar', code: 'CT-4', kind: 'verbos',
    pair: ['subir', 'bajar'], icon: '🚗',
    physical_setup: 'Haz una rampa apoyando un libro grande inclinado y coloca un coche de juguete al pie de la rampa.',
    rounds: [
      {
        label: 'subir', emoji: '⬆️',
        pictogram: 'coche-subiendo',
        tts_trigger: 'El coche va a la montaña. ¿Qué hace? ¡SUBE arriba! Di: subir.',
        stt_expected_array: ['subir', 'sube', 'ubi', 'tubi', 'subí'],
        parent_action: 'Subid el coche por la rampa muy despacio mientras suena la palabra.',
      },
      {
        label: 'bajar', emoji: '⬇️',
        pictogram: 'coche-bajando',
        tts_trigger: '¡Ahora el coche baja! ¿Qué hace? Di: bajar.',
        stt_expected_array: ['bajar', 'baja', 'aja', 'baxar', 'ajar'],
        parent_action: 'Soltad el coche y que baje solo por la rampa; decid “¡bajaaa!” mientras cae.',
      },
    ],
  },
  {
    id: 'cap-frio-caliente', code: 'CT-5', kind: 'adjetivos',
    pair: ['frío', 'caliente'], icon: '🥤',
    physical_setup: 'Prepara dos vasos: uno con agua bien fría (con hielo si hay) y otro con agua tibia. Ponlos delante del niño.',
    rounds: [
      {
        label: 'frío', emoji: '🥤',
        pictogram: 'vaso-frio',
        tts_trigger: 'Toca los vasos. ¿Cuál está FRÍO? ¡Brrr! Di: frío.',
        stt_expected_array: ['frío', 'frio', 'fío', 'ío', 'fiío'],
        parent_action: 'El niño toca el vaso frío; tiritad juntos “¡brrr!” encogiendo los hombros.',
      },
      {
        label: 'caliente', emoji: '🥤',
        pictogram: 'vaso-caliente',
        tts_trigger: 'Y este otro vaso, ¿cómo está? Di: caliente.',
        stt_expected_array: ['caliente', 'aliente', 'caiente', 'tatiente', 'cayente'],
        parent_action: 'Tocad el vaso tibio y abanicaos la mano como si quemara, exagerando mucho.',
      },
    ],
  },
  {
    id: 'cap-encender-apagar', code: 'CT-6', kind: 'verbos',
    pair: ['encender', 'apagar'], icon: '💡',
    physical_setup: 'Colócate con el niño junto al interruptor de la luz (o coge una linterna). La habitación empieza con la luz apagada.',
    rounds: [
      {
        label: 'encender', emoji: '💡',
        pictogram: 'bombilla-encendida',
        tts_trigger: 'Está oscuro… ¿Qué hacemos con la luz? ¡A ENCENDER! Di: encender.',
        stt_expected_array: ['encender', 'encende', 'cender', 'ende', 'encendé'],
        parent_action: 'El niño pulsa el interruptor justo al decirlo y celebráis la luz con un “¡ooooh!”.',
      },
      {
        label: 'apagar', emoji: '💡',
        pictogram: 'bombilla-apagada',
        tts_trigger: 'Ahora al revés. ¿Qué hacemos con la luz? ¡A APAGAR! Di: apagar.',
        stt_expected_array: ['apagar', 'apaga', 'paga', 'agar', 'apagá'],
        parent_action: 'El niño apaga la luz y os decís “buenas noches” con voz de susurro.',
      },
    ],
  },
  {
    id: 'cap-lleno-vacio', code: 'CT-7', kind: 'adjetivos',
    pair: ['lleno', 'vacío'], icon: '🧺',
    physical_setup: 'Prepara dos cestas o cajas iguales: llena una hasta arriba de juguetes o calcetines y deja la otra completamente vacía. Ponlas delante del niño.',
    rounds: [
      {
        label: 'lleno', emoji: '🧺',
        pictogram: 'cesta-llena',
        tts_trigger: '¿Cuál es la cesta LLENA de cosas? ¡Señálala y dilo! Di: lleno.',
        stt_expected_array: ['lleno', 'yeno', 'eno', 'lleno lleno', 'nono'],
        parent_action: 'El niño señala la cesta llena; levantadla juntos exagerando lo mucho que pesa: “¡uf, llenaaa!”.',
      },
      {
        label: 'vacío', emoji: '🧺',
        pictogram: 'cesta-vacia',
        tts_trigger: 'Y esta otra cesta, ¿cómo está? ¡Mira dentro! Di: vacío.',
        stt_expected_array: ['vacío', 'vacio', 'asio', 'bacío', 'ío'],
        parent_action: 'Poned la cesta vacía boca abajo sobre la cabeza del niño como un sombrero: no cae nada, ¡está vacía!',
      },
    ],
  },
  {
    id: 'cap-mete-saca', code: 'CT-8', kind: 'verbos',
    pair: ['meter', 'sacar'], icon: '📥',
    physical_setup: 'Coge una caja abierta y tres juguetes pequeños. Coloca los juguetes FUERA de la caja, delante del niño.',
    rounds: [
      {
        label: 'meter', emoji: '📥',
        pictogram: 'juguete-dentro',
        tts_trigger: 'Los juguetes van a su casa. ¿Qué hacemos? ¡A METER! Di: meter.',
        stt_expected_array: ['meter', 'mete', 'eter', 'metel', 'meté'],
        parent_action: 'El niño mete un juguete en la caja con cada palabra; celebrad el último con un “¡todos dentro!”.',
      },
      {
        label: 'sacar', emoji: '📤',
        pictogram: 'juguete-fuera',
        tts_trigger: 'Ahora al revés. ¿Qué hacemos con los juguetes? ¡A SACAR! Di: sacar.',
        stt_expected_array: ['sacar', 'saca', 'acar', 'tacar', 'sacá'],
        parent_action: 'El niño saca los juguetes uno a uno; contádlos en fila al salir: “¡uno, dos y tres fuera!”.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Índices auxiliares para la pantalla.
// ---------------------------------------------------------------------------
export const WORD_TYPE_LABEL: Record<WordType, string> = {
  sustantivo: 'Sustantivo',
  verbo: 'Verbo',
  adjetivo: 'Adjetivo',
  onomatopeya: 'Onomatopeya',
};

// ES-07 · Objetivo terapéutico ÚNICO de cada apartado, declarado en una línea y
// visible para el adulto antes de empezar. Las logopedas de ACOPROS señalaron
// que no se entendía qué se trabajaba en Escenarios (¿rutinas, repetición,
// vocabulario?); ACOPROS resolvió DC-1 a favor de la repetición verbal, y estos
// tres textos son la forma de que esa decisión llegue a quien usa la app.
export type SemanticSection = 'scenario' | 'sequence' | 'contrast';

export const SECTION_GOAL: Record<SemanticSection, string> = {
  scenario: 'Repetición verbal: el niño imita la palabra objetivo en situaciones del día a día.',
  sequence: 'Vocabulario alrededor de un concepto: qué es, qué tiene, qué hace y cómo es.',
  contrast: 'Opuestos: primero elegir la imagen correcta y después decir la palabra.',
};

// Etiquetas de fase del campo semántico (DC-2 · opción A). Ya no nombran el
// TIPO de palabra sino su papel respecto al concepto, que es el criterio único
// que declara la secuencia: qué es, qué tiene, qué hace y cómo es.
export const PHASE_LABEL: Record<ProgressionPhaseKind, string> = {
  concepto: 'Paso 1 · Qué es',
  parte: 'Paso 2 · Qué tiene',
  accion: 'Paso 3 · Qué hace',
  cualidad: 'Paso 4 · Cómo es',
};

// ---------------------------------------------------------------------------
// Enumeración de voz (contrato con el corpus neuronal)
// ---------------------------------------------------------------------------
// Espejo EXACTO de lo que locuta ValeriaSemanticExpansionScreen. Cada línea es
// un par (estilo, texto) que el corpus de voz hornea como asset neuronal es
// (Sharvard). Si un literal cambia en la pantalla, cambia aquí y su asset deja
// de resolver: cae a la voz del sistema (degrada, nunca rompe).
export interface VoiceLine { style: 'tutor' | 'child' | 'slow'; text: string; }

// Bancos de contenido de una variedad (base es o localizada). La enumeración de
// voz es idéntica en forma; solo cambian los datos y dos textos fijos (reintento
// y cierre), que se inyectan para que el corpus hornee la voz de cada variedad
// (es → Sharvard, eu → HiTZ). Ver valeriaSemanticExpansionEu.
export interface SemanticSpeechBanks {
  scenarios: DailyScenario[];
  sequences: ProgressionSequence[];
  capsules: ContrastCapsule[];
  retry: (label: string) => string; // "¡Otra vez! Di: X." / "Berriro! Esan: X."
  sessionDone: string;               // cierre fijo de la sesión
}

// Un "paso" locutable (consigna + palabra objetivo + acción física del adulto),
// forma común de escenarios, progresiones y contrastes en la pantalla.
// ES-05: el modelo lento repite la FRASE completa (speakPhraseSlow), no solo
// la palabra objetivo — antes de este cambio la pantalla decía una cosa
// (st.tts) y el botón "oír despacio" otra (st.label): ambos modelos deben
// decir el mismo contenido, variando solo la velocidad.
const stepLines = (tts: string, label: string, action: string, retry: (l: string) => string): VoiceLine[] => [
  { style: 'child', text: tts },                     // consigna (speakToChild)
  { style: 'child', text: retry(label) },            // reintento
  { style: 'slow', text: tts },                      // modelo lento DE FRASE (speakPhraseSlow)
  { style: 'tutor', text: action },                  // tarjeta de acción física (voice="tutor")
];

// Enumeración parametrizada: la comparte la base es y cada variedad localizada.
export function enumerateSemanticSpeechFor(b: SemanticSpeechBanks): VoiceLine[] {
  const out: VoiceLine[] = [];
  for (const sc of b.scenarios) {
    for (const it of sc.items) out.push(...stepLines(it.tts_string, it.label, it.parent_tpr_action, b.retry));
  }
  for (const sq of b.sequences) {
    for (const ph of sq.phases) out.push(...stepLines(ph.tts_string, ph.label, ph.parent_tpr_action, b.retry));
  }
  for (const cp of b.capsules) {
    // El setup físico se muestra en la 1ª vuelta (tarjeta de acción, voice="tutor").
    out.push({ style: 'tutor', text: cp.physical_setup });
    for (const r of cp.rounds) out.push(...stepLines(r.tts_trigger, r.label, r.parent_action, b.retry));
  }
  out.push({ style: 'child', text: b.sessionDone });
  return out;
}

export function enumerateSemanticSpeech(): VoiceLine[] {
  return enumerateSemanticSpeechFor({
    scenarios: DAILY_SCENARIOS,
    sequences: PROGRESSION_SEQUENCES,
    capsules: CONTRAST_CAPSULES,
    retry: (label) => `¡Otra vez! Di: ${label}.`,
    sessionDone: '¡Sesión completada! ¡Choca esos cinco!',
  });
}

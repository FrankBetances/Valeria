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
//   2. PROGRESSION_SEQUENCES — 7 progresiones sobre un eje temático que evolucionan
//                             Onomatopeya → Sustantivo → Verbo → Adjetivo.
//   3. CONTRAST_CAPSULES    — 6 cápsulas TPR de contraste activo (pares de
//                             adjetivos y verbos antónimos) con DOS vueltas
//                             evaluadas: palabra objetivo y su opuesta.
// Protocolo completo: docs/protocolo-expansion-semantica.md
// ============================================================================

export type WordType = 'sustantivo' | 'verbo' | 'adjetivo' | 'onomatopeya';

// Campos obligatorios comunes a todo ítem locutable/evaluable del módulo.
export interface LexicalItem {
  id: string;
  type: WordType;
  label: string;               // palabra que se muestra en la ficha
  emoji: string;               // marcador visual mientras no hay asset definitivo
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
        tts_string: 'Esto es la cama. Por la mañana saltamos de la cama. Di: cama.',
        stt_expected_array: ['cama', 'tama', 'ama', 'kama'],
        parent_tpr_action: 'Da unas palmaditas en la cama y siéntate en ella con el niño antes de levantaros juntos.',
      },
      {
        id: 'manana-cepillo', type: 'sustantivo', label: 'cepillo', emoji: '🪥',
        visual_prompt: 'Cepillo de dientes en horizontal con una raya de pasta, sin fondo, alto contraste, contorno grueso, sin degradados.',
        tts_string: 'Esto es el cepillo. Con el cepillo lavamos los dientes. Di: cepillo.',
        stt_expected_array: ['cepillo', 'pillo', 'tepillo', 'epillo'],
        parent_tpr_action: 'Pon el cepillo (sin pasta) en la mano del niño y guiad juntos el gesto de cepillar sus dientes.',
      },
      {
        id: 'manana-lavar', type: 'verbo', label: 'lavar', emoji: '🧼',
        visual_prompt: 'Dos manos frotándose con burbujas de jabón, sin fondo, alto contraste, contorno grueso, colores planos.',
        tts_string: 'Mira, nos lavamos las manos. ¿Qué hacemos? Di: lavar.',
        stt_expected_array: ['lavar', 'lava', 'aba', 'avar', 'laba'],
        parent_tpr_action: 'Frota tus manos como si te enjabonaras y anima al niño a frotar las suyas al ritmo de la palabra.',
      },
      {
        id: 'manana-vestir', type: 'verbo', label: 'vestir', emoji: '👕',
        visual_prompt: 'Camiseta infantil de frente entrando por la cabeza de una silueta simple, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Ahora nos vestimos. Metemos la cabeza en la camiseta. Di: vestir.',
        stt_expected_array: ['vestir', 'viste', 'etir', 'betir', 'vesti'],
        parent_tpr_action: 'Pasa una camiseta por la cabeza del niño y, al asomar, celebradlo con un “¡cucú!”.',
      },
      {
        id: 'manana-limpio', type: 'adjetivo', label: 'limpio', emoji: '✨',
        visual_prompt: 'Mano abierta y reluciente con destellos brillantes alrededor, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Mira qué manos! Están limpias y brillan. ¿Cómo están? Di: limpio.',
        stt_expected_array: ['limpio', 'impio', 'limpi', 'inpio', 'pio'],
        parent_tpr_action: 'Muestra tus manos limpias, sopla sobre ellas como si brillaran y chocad los cinco.',
      },
      {
        id: 'manana-rin', type: 'onomatopeya', label: 'rin rin', emoji: '⏰',
        visual_prompt: 'Despertador clásico con dos campanas y líneas de vibración a los lados, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El despertador suena: ¡Rin, rin! ¿Cómo hace el despertador? Di: rin, rin.',
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
        visual_prompt: 'Cuchara sola vista desde arriba, mango hacia abajo, sin fondo, alto contraste, contorno grueso, sin brillos metálicos.',
        tts_string: 'Esto es la cuchara. Comemos la sopa con la cuchara. Di: cuchara.',
        stt_expected_array: ['cuchara', 'tuchara', 'chara', 'uchara', 'chacha'],
        parent_tpr_action: 'Pon la cuchara en la mano del niño y llevadla juntos a la boca haciendo el gesto de comer.',
      },
      {
        id: 'comida-vaso', type: 'sustantivo', label: 'vaso', emoji: '🥛',
        visual_prompt: 'Vaso lleno de agua hasta la mitad, de frente, sin fondo, alto contraste, contorno grueso, azul plano para el agua.',
        tts_string: 'Esto es el vaso. En el vaso hay agua. Di: vaso.',
        stt_expected_array: ['vaso', 'baso', 'aso', 'bato', 'vato'],
        parent_tpr_action: 'Acerca el vaso a los labios del niño y bebed a la vez haciendo “glu, glu”.',
      },
      {
        id: 'comida-comer', type: 'verbo', label: 'comer', emoji: '😋',
        visual_prompt: 'Boca abierta recibiendo una cuchara con comida, de perfil simple, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Tengo mucha hambre. ¡Vamos a comer! ¿Qué hacemos? Di: comer.',
        stt_expected_array: ['comer', 'come', 'omer', 'tome', 'omé'],
        parent_tpr_action: 'Frota tu barriga, abre mucho la boca y haz como que masticas exagerando el gesto.',
      },
      {
        id: 'comida-beber', type: 'verbo', label: 'beber', emoji: '🥤',
        visual_prompt: 'Silueta infantil bebiendo de un vaso inclinado, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Tengo sed. ¡Vamos a beber agua! ¿Qué hacemos? Di: beber.',
        stt_expected_array: ['beber', 'bebe', 'ebe', 'bebé', 'meme'],
        parent_tpr_action: 'Inclina un vaso vacío sobre tu boca y haz “glu, glu” invitando al niño a imitarte.',
      },
      {
        id: 'comida-rico', type: 'adjetivo', label: 'rico', emoji: '👌',
        visual_prompt: 'Cara sonriente relamiéndose con la lengua fuera y un corazón pequeño, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Mmm, qué rico está! ¿Cómo está la comida? Di: rico.',
        stt_expected_array: ['rico', 'iko', 'rito', 'ico', 'itto'],
        parent_tpr_action: 'Relámete, frótate la barriga y pon cara de gusto diciendo “¡mmm, rico!” con el niño.',
      },
      {
        id: 'comida-nam', type: 'onomatopeya', label: 'ñam ñam', emoji: '😋',
        visual_prompt: 'Boca masticando con migas alrededor y líneas de movimiento, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Comemos la galleta: ¡Ñam, ñam! ¿Cómo hace la boca? Di: ñam, ñam.',
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
        tts_string: 'Esto es la pelota. En el parque jugamos con la pelota. Di: pelota.',
        stt_expected_array: ['pelota', 'peota', 'pota', 'lota', 'peotta'],
        parent_tpr_action: 'Rueda una pelota real hacia el niño y esperad a que la devuelva antes de repetir la palabra.',
      },
      {
        id: 'parque-tobogan', type: 'sustantivo', label: 'tobogán', emoji: '🛝',
        visual_prompt: 'Tobogán infantil visto de lado con escalera y rampa curva, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Esto es el tobogán. Subimos y nos deslizamos por el tobogán. Di: tobogán.',
        stt_expected_array: ['tobogán', 'tobogan', 'togán', 'bogán', 'toto'],
        parent_tpr_action: 'Desliza la mano del niño por tu brazo inclinado como si fuera la rampa del tobogán.',
      },
      {
        id: 'parque-correr', type: 'verbo', label: 'correr', emoji: '🏃',
        visual_prompt: 'Silueta infantil corriendo con líneas de velocidad detrás, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Vamos rápido! En el parque nos gusta correr. ¿Qué hacemos? Di: correr.',
        stt_expected_array: ['correr', 'corre', 'ore', 'coé', 'totté'],
        parent_tpr_action: 'Corre en el sitio moviendo mucho los brazos y anima al niño a correr contigo unos pasos.',
      },
      {
        id: 'parque-saltar', type: 'verbo', label: 'saltar', emoji: '🤸',
        visual_prompt: 'Silueta infantil saltando con los pies despegados del suelo y una curva de salto, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Arriba! Saltamos como una rana. ¿Qué hacemos? Di: saltar.',
        stt_expected_array: ['saltar', 'salta', 'ata', 'talta', 'atá'],
        parent_tpr_action: 'Salta con los dos pies juntos diciendo “¡salta!” en cada bote y que el niño salte contigo.',
      },
      {
        id: 'parque-alto', type: 'adjetivo', label: 'alto', emoji: '🦒',
        visual_prompt: 'Flecha grande apuntando hacia arriba junto a una silueta estirada de puntillas, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡El columpio sube muy alto! ¿Cómo va? Di: alto.',
        stt_expected_array: ['alto', 'ato', 'atto', 'álto', 'auto'],
        parent_tpr_action: 'Estírate de puntillas con los brazos hacia el cielo y levanta al niño en brazos diciendo “¡alto!”.',
      },
      {
        id: 'parque-boing', type: 'onomatopeya', label: 'boing', emoji: '⚽',
        visual_prompt: 'Pelota rebotando con dos siluetas fantasma y flechas curvas de rebote, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La pelota bota: ¡Boing, boing! ¿Cómo hace la pelota? Di: boing.',
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
        tts_string: 'Esto es la bañera. Nos bañamos dentro de la bañera. Di: bañera.',
        stt_expected_array: ['bañera', 'añera', 'banera', 'ñera', 'babera'],
        parent_tpr_action: 'Señala la bañera (o un barreño) y haced juntos el gesto de meteros dentro levantando mucho las piernas.',
      },
      {
        id: 'bano-jabon', type: 'sustantivo', label: 'jabón', emoji: '🧼',
        visual_prompt: 'Pastilla de jabón con tres burbujas alrededor, sin fondo, alto contraste, contorno grueso, colores planos.',
        tts_string: 'Esto es el jabón. El jabón hace muchas burbujas. Di: jabón.',
        stt_expected_array: ['jabón', 'jabon', 'abón', 'avon', 'bon'],
        parent_tpr_action: 'Pon la pastilla de jabón en las manos del niño y giradla juntos haciendo espuma imaginaria.',
      },
      {
        id: 'bano-banar', type: 'verbo', label: 'bañar', emoji: '🛀',
        visual_prompt: 'Silueta infantil dentro de una bañera con burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Al agua patos! Vamos a bañar al muñeco. ¿Qué hacemos? Di: bañar.',
        stt_expected_array: ['bañar', 'baña', 'añar', 'bana', 'añá'],
        parent_tpr_action: 'Frota suavemente los brazos del niño como si lo enjabonaras mientras repetís “bañar”.',
      },
      {
        id: 'bano-frotar', type: 'verbo', label: 'frotar', emoji: '🧽',
        visual_prompt: 'Esponja frotando con líneas circulares de movimiento y burbujas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Frota, frota la esponja. ¿Qué hacemos? Di: frotar.',
        stt_expected_array: ['frotar', 'frota', 'otar', 'fota', 'otá'],
        parent_tpr_action: 'Frota círculos suaves en la espalda del niño con la mano o una esponja al ritmo de la palabra.',
      },
      {
        id: 'bano-caliente', type: 'adjetivo', label: 'caliente', emoji: '♨️',
        visual_prompt: 'Vaso o bañera con tres líneas onduladas de vapor subiendo, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua está calentita. ¿Cómo está el agua? Di: caliente.',
        stt_expected_array: ['caliente', 'aliente', 'caiente', 'tatiente', 'cayente'],
        parent_tpr_action: 'Tocad el agua templada con un dedo y abanicad la mano exagerando: “¡uf, caliente!”.',
      },
      {
        id: 'bano-chof', type: 'onomatopeya', label: 'chof', emoji: '💦',
        visual_prompt: 'Salpicadura de agua en estrella con gotas saliendo hacia fuera, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El agua salpica: ¡Chof, chof! ¿Cómo hace el agua? Di: chof.',
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
        tts_string: 'Mira el cielo. Esto es la luna. Di: luna.',
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
        visual_prompt: 'Carita con ojos cerrados sobre una almohada y tres “Z”, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Shhh… es hora de dormir. ¿Qué hacemos? Di: dormir.',
        stt_expected_array: ['dormir', 'dormi', 'mimir', 'mimí', 'omir'],
        parent_tpr_action: 'Junta las manos bajo la mejilla, cerrad los ojos y roncad flojito los dos.',
      },
      {
        id: 'noche-abrazar', type: 'verbo', label: 'abrazar', emoji: '🤗',
        visual_prompt: 'Dos siluetas abrazándose con un corazón pequeño encima, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Un abrazo de buenas noches. ¿Qué hacemos? Di: abrazar.',
        stt_expected_array: ['abrazar', 'abraza', 'brazar', 'asasar', 'abazar'],
        parent_tpr_action: 'Daos un abrazo largo de verdad y apretad un poquito justo al decir la palabra.',
      },
      {
        id: 'noche-oscuro', type: 'adjetivo', label: 'oscuro', emoji: '🌑',
        visual_prompt: 'Ventana de noche con cielo oscuro y una estrella, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Se apagó la luz. Todo está oscuro. ¿Cómo está? Di: oscuro.',
        stt_expected_array: ['oscuro', 'ocuro', 'curo', 'ocú', 'oturo'],
        parent_tpr_action: 'Tapad los ojos del niño suavemente con sus propias manos y destapad de golpe: “¡oscuro… luz!”.',
      },
      {
        id: 'noche-buho', type: 'onomatopeya', label: 'uh uh', emoji: '🦉',
        visual_prompt: 'Búho de frente con ojos enormes sobre una rama, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El búho canta de noche: ¡Uh, uh! ¿Cómo hace el búho? Di: uh, uh.',
        stt_expected_array: ['uh uh', 'u u', 'uh', 'bu bu', 'uu'],
        parent_tpr_action: 'Poned las manos como gafas alrededor de los ojos y girad la cabeza como un búho diciendo “¡uh, uh!”.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. PROGRESIÓN TRANSICIONAL · De Onomatopeya a Adjetivo
//    Cada secuencia evoluciona sobre un mismo eje temático en 4 fases.
// ---------------------------------------------------------------------------
export type ProgressionPhaseKind = 'onomatopeya' | 'sustantivo' | 'verbo' | 'adjetivo';

export interface ProgressionPhase {
  kind: ProgressionPhaseKind;
  label: string;
  emoji: string;
  visual_prompt: string;        // Asset visual
  tts_string: string;           // Prompt TTS
  stt_expected_array: string[]; // Target STT (incluye aproximaciones fonéticas de la edad)
  parent_tpr_action: string;    // Instrucción TPR exacta para el padre
}

export interface ProgressionSequence {
  id: string;
  theme: string;                // eje temático
  icon: string;
  // Orden fijo: [onomatopeya, sustantivo, verbo, adjetivo]
  phases: [ProgressionPhase, ProgressionPhase, ProgressionPhase, ProgressionPhase];
}

export const PROGRESSION_SEQUENCES: ProgressionSequence[] = [
  {
    id: 'seq-coche', theme: 'Transporte · El coche', icon: '🚗',
    phases: [
      {
        kind: 'onomatopeya', label: 'brum', emoji: '🚗',
        visual_prompt: 'Nube de humo de tubo de escape con letras “BRUM” estilizadas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El motor arranca: ¡Brum, brum! ¿Cómo hace el coche? Di: brum.',
        stt_expected_array: ['brum', 'brrum', 'brum brum', 'bum', 'mmm', 'bu bu'],
        parent_tpr_action: 'Empuja un coche de juguete por el suelo haciendo vibrar los labios con “brrrum” y anima al niño a imitarte.',
      },
      {
        kind: 'sustantivo', label: 'coche', emoji: '🚗',
        visual_prompt: 'Coche de juguete de frente, colores planos, ruedas grandes, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Brum, brum! Esto es el coche. ¿Qué es? Di: coche.',
        stt_expected_array: ['coche', 'oche', 'tote', 'cote', 'oto'],
        parent_tpr_action: 'Pon el coche en la mano del niño, señálalo y repetid juntos “coche” mientras lo movéis.',
      },
      {
        kind: 'verbo', label: 'corre', emoji: '💨',
        visual_prompt: 'Coche con líneas de velocidad detrás avanzando hacia la derecha, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el coche corre muy deprisa. ¿Qué hace el coche? Di: corre.',
        stt_expected_array: ['corre', 'core', 'ore', 'totte', 'coé'],
        parent_tpr_action: 'Haz correr el coche por la mesa y después por el brazo del niño, acelerando al decir “corre”.',
      },
      {
        kind: 'adjetivo', label: 'rápido', emoji: '⚡',
        visual_prompt: 'Coche con un rayo y tres líneas de velocidad marcadas, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Uy, qué rápido va el coche! ¿Cómo es el coche? Di: rápido.',
        stt_expected_array: ['rápido', 'rapido', 'apido', 'pido', 'papido'],
        parent_tpr_action: 'Corre con el niño de la mano unos pasos y frenad de golpe diciendo “¡rápido… y stop!”.',
      },
    ],
  },
  {
    id: 'seq-perro', theme: 'Animales · El perro', icon: '🐶',
    phases: [
      {
        kind: 'onomatopeya', label: 'guau', emoji: '🐶',
        visual_prompt: 'Bocadillo de cómic con “GUAU” y una huella de perro, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El perro ladra: ¡Guau, guau! ¿Cómo hace el perro? Di: guau.',
        stt_expected_array: ['guau', 'gua', 'aua', 'uau', 'gua gua'],
        parent_tpr_action: 'Ponte a cuatro patas y ladra “¡guau, guau!” moviendo la cabeza, animando al niño a ladrar contigo.',
      },
      {
        kind: 'sustantivo', label: 'perro', emoji: '🐕',
        visual_prompt: 'Perro sentado de frente, orejas caídas, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Guau, guau! Esto es el perro. ¿Qué es? Di: perro.',
        stt_expected_array: ['perro', 'pero', 'peo', 'eo', 'peto'],
        parent_tpr_action: 'Señala un perro de juguete o una foto y acariciadlo juntos repitiendo “perro”.',
      },
      {
        kind: 'verbo', label: 'salta', emoji: '⬆️',
        visual_prompt: 'Perro en el aire con las patas recogidas y una curva de salto, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el perro salta para coger la pelota. ¿Qué hace el perro? Di: salta.',
        stt_expected_array: ['salta', 'sata', 'ata', 'talta', 'atá'],
        parent_tpr_action: 'Haz saltar al perro de juguete y saltad los dos a la vez diciendo “¡salta!”.',
      },
      {
        kind: 'adjetivo', label: 'peludo', emoji: '🧸',
        visual_prompt: 'Perro con pelaje muy esponjoso y líneas de textura suave, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Toca! El perro es blandito y peludo. ¿Cómo es el perro? Di: peludo.',
        stt_expected_array: ['peludo', 'peu', 'eludo', 'pelu', 'peúdo'],
        parent_tpr_action: 'Acariciad un peluche o una manta suave y decid “peludo” pasando la mano despacio.',
      },
    ],
  },
  {
    id: 'seq-vaca', theme: 'Animales · La vaca', icon: '🐄',
    phases: [
      {
        kind: 'onomatopeya', label: 'muu', emoji: '🐄',
        visual_prompt: 'Bocadillo de cómic con “MUU” y un cencerro, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La vaca hace: ¡Muuu! ¿Cómo hace la vaca? Di: muu.',
        stt_expected_array: ['muu', 'mu', 'muuu', 'bu', 'mú'],
        parent_tpr_action: 'Pon las manos como cuernos en la cabeza y muge “¡muuu!” alargando el sonido con el niño.',
      },
      {
        kind: 'sustantivo', label: 'vaca', emoji: '🐄',
        visual_prompt: 'Vaca de pie de perfil con manchas, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Muuu! Esto es la vaca. ¿Qué es? Di: vaca.',
        stt_expected_array: ['vaca', 'baca', 'aca', 'bata', 'baka'],
        parent_tpr_action: 'Señala una vaca de juguete o una foto y recorred sus manchas con el dedo diciendo “vaca”.',
      },
      {
        kind: 'verbo', label: 'come', emoji: '🌿',
        visual_prompt: 'Vaca con la cabeza agachada sobre hierba verde, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, la vaca come hierba en el campo. ¿Qué hace la vaca? Di: come.',
        stt_expected_array: ['come', 'ome', 'tome', 'omé', 'meme'],
        parent_tpr_action: 'Agacha la cabeza como la vaca y haz que masticáis hierba moviendo la mandíbula al decir “come”.',
      },
      {
        kind: 'adjetivo', label: 'grande', emoji: '🔎',
        visual_prompt: 'Vaca junto a una silueta pequeña de niño para marcar el contraste de tamaño, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Hala! La vaca es muy grande. ¿Cómo es la vaca? Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
        parent_tpr_action: 'Abrid los brazos todo lo que podáis y poneos de puntillas diciendo “¡graaande!”.',
      },
    ],
  },
  {
    id: 'seq-gato', theme: 'Animales · El gato', icon: '🐱',
    phases: [
      {
        kind: 'onomatopeya', label: 'miau', emoji: '🐱',
        visual_prompt: 'Bocadillo de cómic con “MIAU” y un ovillo de lana, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El gato maúlla: ¡Miau, miau! ¿Cómo hace el gato? Di: miau.',
        stt_expected_array: ['miau', 'mia', 'niau', 'au', 'miau miau'],
        parent_tpr_action: 'Frótate la carita con la mano como un gato lavándose y maúlla “¡miau!” con el niño.',
      },
      {
        kind: 'sustantivo', label: 'gato', emoji: '🐈',
        visual_prompt: 'Gato sentado de frente con cola enroscada, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Miau! Esto es el gato. ¿Qué es? Di: gato.',
        stt_expected_array: ['gato', 'tato', 'ato', 'gat', 'gatto'],
        parent_tpr_action: 'Señala un gato de juguete o una foto y acariciadle el lomo repitiendo “gato”.',
      },
      {
        kind: 'verbo', label: 'duerme', emoji: '😴',
        visual_prompt: 'Gato acurrucado con los ojos cerrados y tres “Z” encima, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Shhh… el gato duerme en su cama. ¿Qué hace el gato? Di: duerme.',
        stt_expected_array: ['duerme', 'uerme', 'dueme', 'deme', 'dueḿe'],
        parent_tpr_action: 'Junta las manos bajo la mejilla, cierra los ojos y haz “shhh” invitando al niño a “dormir” contigo.',
      },
      {
        kind: 'adjetivo', label: 'suave', emoji: '🪶',
        visual_prompt: 'Gato con una pluma rozando su pelaje y líneas de textura suave, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Toca! El pelo del gato es muy suave. ¿Cómo es el gato? Di: suave.',
        stt_expected_array: ['suave', 'uave', 'ave', 'sua', 'suabe'],
        parent_tpr_action: 'Pasad una pluma o un pañuelo por el brazo del niño muy despacio diciendo “suave”.',
      },
    ],
  },
  {
    id: 'seq-lluvia', theme: 'Naturaleza · La lluvia', icon: '🌧️',
    phases: [
      {
        kind: 'onomatopeya', label: 'plic plic', emoji: '💧',
        visual_prompt: 'Tres gotas de agua cayendo con pequeñas ondas al chocar, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'La lluvia cae: ¡Plic, plic, plic! ¿Cómo hace la lluvia? Di: plic, plic.',
        stt_expected_array: ['plic plic', 'plic', 'pic pic', 'pic', 'tic tic'],
        parent_tpr_action: 'Tamborilea con los dedos sobre la mesa como gotas de lluvia y que el niño “llueva” contigo.',
      },
      {
        kind: 'sustantivo', label: 'agua', emoji: '💧',
        visual_prompt: 'Una gota de agua grande y brillante de frente, azul plano, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Plic, plic! Esto es el agua. ¿Qué es? Di: agua.',
        stt_expected_array: ['agua', 'aba', 'awa', 'aua', 'agüa'],
        parent_tpr_action: 'Mojad un dedo en agua real y tocaos la mano notando el frío mientras decís “agua”.',
      },
      {
        kind: 'verbo', label: 'cae', emoji: '⬇️',
        visual_prompt: 'Gota de agua con una flecha hacia abajo y una silueta fantasma más arriba, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el agua cae del cielo. ¿Qué hace el agua? Di: cae.',
        stt_expected_array: ['cae', 'ae', 'tae', 'cai', 'kae'],
        parent_tpr_action: 'Levanta las manos arriba y bájalas moviendo los dedos hasta el suelo diciendo “caeee”.',
      },
      {
        kind: 'adjetivo', label: 'mojado', emoji: '💦',
        visual_prompt: 'Mano con gotas de agua resbalando y pequeñas salpicaduras, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Uy! La mano está mojada. ¿Cómo está la mano? Di: mojado.',
        stt_expected_array: ['mojado', 'mojao', 'ojado', 'moja', 'moxado'],
        parent_tpr_action: 'Moja un poco la mano del niño con una toallita y decid “mojado” sacudiendo las manos.',
      },
    ],
  },
  {
    id: 'seq-tren', theme: 'Transporte · El tren', icon: '🚂',
    phases: [
      {
        kind: 'onomatopeya', label: 'chucu chucu', emoji: '🚂',
        visual_prompt: 'Locomotora de juguete con nube de humo y letras “CHUCU” estilizadas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El tren hace: ¡Chucu, chucu! ¿Cómo hace el tren? Di: chucu, chucu.',
        stt_expected_array: ['chucu chucu', 'chucu', 'cucu', 'chu chu', 'tutu'],
        parent_tpr_action: 'Haced un trenecito: el niño se agarra a tu cintura y avanzad por el pasillo al ritmo de “chucu-chucu”.',
      },
      {
        kind: 'sustantivo', label: 'tren', emoji: '🚆',
        visual_prompt: 'Tren de tres vagones de perfil sobre una vía recta, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Chucu, chucu! Esto es el tren. ¿Qué es? Di: tren.',
        stt_expected_array: ['tren', 'ten', 'tem', 'ren', 'tlen'],
        parent_tpr_action: 'Alinead tres cojines o cajas como vagones y señaladlos uno a uno diciendo “tren”.',
      },
      {
        kind: 'verbo', label: 'para', emoji: '🛑',
        visual_prompt: 'Tren detenido ante una señal roja de stop, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El tren llega a la estación y… ¡para! ¿Qué hace el tren? Di: para.',
        stt_expected_array: ['para', 'pala', 'paa', 'apa', 'pará'],
        parent_tpr_action: 'Caminad como un tren por la habitación y, al oír “¡para!”, quedaos congelados como estatuas.',
      },
      {
        kind: 'adjetivo', label: 'largo', emoji: '📏',
        visual_prompt: 'Tren muy largo de muchos vagones con una flecha horizontal de extremo a extremo, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Cuántos vagones! El tren es muy largo. ¿Cómo es el tren? Di: largo.',
        stt_expected_array: ['largo', 'lago', 'argo', 'laggo', 'ago'],
        parent_tpr_action: 'Estirad los brazos hacia los lados todo lo que podáis diciendo “laaaargo”.',
      },
    ],
  },
  {
    id: 'seq-pajaro', theme: 'Animales · El pájaro', icon: '🐦',
    phases: [
      {
        kind: 'onomatopeya', label: 'pío pío', emoji: '🐣',
        visual_prompt: 'Bocadillo de cómic con “PÍO PÍO” y un pollito asomando, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pajarito canta: ¡Pío, pío! ¿Cómo hace el pájaro? Di: pío, pío.',
        stt_expected_array: ['pío pío', 'pio pio', 'pío', 'pio', 'io io'],
        parent_tpr_action: 'Juntad los dedos como un pico que se abre y se cierra mientras piáis los dos juntos.',
      },
      {
        kind: 'sustantivo', label: 'pájaro', emoji: '🐦',
        visual_prompt: 'Pájaro de perfil posado en una rama, colores planos, sin fondo, alto contraste, contorno grueso.',
        tts_string: '¡Pío, pío! Esto es el pájaro. ¿Qué es? Di: pájaro.',
        stt_expected_array: ['pájaro', 'pajaro', 'ájaro', 'pajalo', 'payaro'],
        parent_tpr_action: 'Buscad un pájaro por la ventana o en un dibujo, señaladlo y saludadlo con la mano.',
      },
      {
        kind: 'verbo', label: 'vuela', emoji: '🕊️',
        visual_prompt: 'Pájaro con las alas extendidas y líneas de vuelo curvas, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'Mira, el pájaro vuela por el cielo. ¿Qué hace el pájaro? Di: vuela.',
        stt_expected_array: ['vuela', 'buela', 'uela', 'bela', 'guela'],
        parent_tpr_action: 'Corred por la habitación con los brazos como alas, subiéndolas y bajándolas.',
      },
      {
        kind: 'adjetivo', label: 'pequeño', emoji: '🐤',
        visual_prompt: 'Pajarito diminuto dentro de dos manos abiertas en cuenco, sin fondo, alto contraste, contorno grueso.',
        tts_string: 'El pajarito es muy pequeño. ¿Cómo es el pájaro? Di: pequeño.',
        stt_expected_array: ['pequeño', 'pequeno', 'pekeño', 'equeño', 'peño'],
        parent_tpr_action: 'Juntad mucho las manos como si sujetarais un pajarito diminuto y habladle bajito.',
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
    physical_setup: 'Prepara dos peluches del mismo animal pero de distinto tamaño: uno claramente GRANDE y uno claramente PEQUEÑO. Colócalos juntos delante del niño.',
    rounds: [
      {
        label: 'grande', emoji: '🐘',
        tts_trigger: '¿Cuál es el osito GRANDE? ¡Dámelo y dilo! Di: grande.',
        stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
        parent_action: 'El niño te entrega el peluche grande mientras lo dice; abrazadlo exagerando lo enorme que es.',
      },
      {
        label: 'pequeño', emoji: '🐭',
        tts_trigger: 'Ahora al revés: ¿cuál es el PEQUEÑO? ¡Dámelo y dilo! Di: pequeño.',
        stt_expected_array: ['pequeño', 'pequeno', 'pekeño', 'equeño', 'peño'],
        parent_action: 'El niño te da el pequeño; escondedlo en una mano y decid “pequeño” con vocecita mini.',
      },
    ],
  },
  {
    id: 'cap-limpio-sucio', code: 'CT-2', kind: 'adjetivos',
    pair: ['limpio', 'sucio'], icon: '🥄',
    physical_setup: 'Coge dos cucharas iguales: lava una hasta dejarla brillante y mancha la otra con un poco de comida o barro. Ponlas una al lado de la otra.',
    rounds: [
      {
        label: 'sucio', emoji: '🐷',
        tts_trigger: 'Señala la cuchara SUCIA. ¿Cómo está esta? Dilo. Di: sucio.',
        stt_expected_array: ['sucio', 'utio', 'suio', 'cucho', 'ucio'],
        parent_action: 'El niño señala la cuchara sucia y ponéis los dos cara de “¡puaj!” apartándola.',
      },
      {
        label: 'limpio', emoji: '✨',
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
        label: 'abrir', emoji: '🔓',
        tts_trigger: 'El juguete está dentro. ¿Qué hacemos para sacarlo? ¡Vamos a ABRIR! Di: abrir.',
        stt_expected_array: ['abrir', 'abre', 'abi', 'air', 'abí'],
        parent_action: 'Abrid la caja juntos, muy despacio, y celebrad encontrar el juguete con un “¡tachán!”.',
      },
      {
        label: 'cerrar', emoji: '🔒',
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
        tts_trigger: 'El coche va a la montaña. ¿Qué hace? ¡SUBE arriba! Di: subir.',
        stt_expected_array: ['subir', 'sube', 'ubi', 'tubi', 'subí'],
        parent_action: 'Subid el coche por la rampa muy despacio mientras suena la palabra.',
      },
      {
        label: 'bajar', emoji: '⬇️',
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
        label: 'frío', emoji: '❄️',
        tts_trigger: 'Toca los vasos. ¿Cuál está FRÍO? ¡Brrr! Di: frío.',
        stt_expected_array: ['frío', 'frio', 'fío', 'ío', 'fiío'],
        parent_action: 'El niño toca el vaso frío; tiritad juntos “¡brrr!” encogiendo los hombros.',
      },
      {
        label: 'caliente', emoji: '🔥',
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
        tts_trigger: 'Está oscuro… ¿Qué hacemos con la luz? ¡A ENCENDER! Di: encender.',
        stt_expected_array: ['encender', 'encende', 'cender', 'ende', 'encendé'],
        parent_action: 'El niño pulsa el interruptor justo al decirlo y celebráis la luz con un “¡ooooh!”.',
      },
      {
        label: 'apagar', emoji: '🌑',
        tts_trigger: 'Ahora al revés. ¿Qué hacemos con la luz? ¡A APAGAR! Di: apagar.',
        stt_expected_array: ['apagar', 'apaga', 'paga', 'agar', 'apagá'],
        parent_action: 'El niño apaga la luz y os decís “buenas noches” con voz de susurro.',
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

export const PHASE_LABEL: Record<ProgressionPhaseKind, string> = {
  onomatopeya: 'Fase 1 · Onomatopeya',
  sustantivo: 'Fase 2 · Sustantivo',
  verbo: 'Fase 3 · Verbo',
  adjetivo: 'Fase 4 · Adjetivo',
};

// ---------------------------------------------------------------------------
// Enumeración de voz (contrato con el corpus neuronal)
// ---------------------------------------------------------------------------
// Espejo EXACTO de lo que locuta ValeriaSemanticExpansionScreen. Cada línea es
// un par (estilo, texto) que el corpus de voz hornea como asset neuronal es
// (Sharvard). Si un literal cambia en la pantalla, cambia aquí y su asset deja
// de resolver: cae a la voz del sistema (degrada, nunca rompe).
export interface VoiceLine { style: 'tutor' | 'child' | 'slow'; text: string; }

// Un "paso" locutable (consigna + palabra objetivo + acción física del adulto),
// forma común de escenarios, progresiones y contrastes en la pantalla.
const stepLines = (tts: string, label: string, action: string): VoiceLine[] => [
  { style: 'child', text: tts },                             // consigna (speakToChild)
  { style: 'child', text: `¡Otra vez! Di: ${label}.` },      // reintento
  { style: 'slow', text: label.toLowerCase() },              // modelo lento (speakWordSlow)
  { style: 'tutor', text: action },                          // tarjeta de acción física (voice="tutor")
];

export function enumerateSemanticSpeech(): VoiceLine[] {
  const out: VoiceLine[] = [];
  for (const sc of DAILY_SCENARIOS) {
    for (const it of sc.items) out.push(...stepLines(it.tts_string, it.label, it.parent_tpr_action));
  }
  for (const sq of PROGRESSION_SEQUENCES) {
    for (const ph of sq.phases) out.push(...stepLines(ph.tts_string, ph.label, ph.parent_tpr_action));
  }
  for (const cp of CONTRAST_CAPSULES) {
    // El setup físico se muestra en la 1ª vuelta (tarjeta de acción, voice="tutor").
    out.push({ style: 'tutor', text: cp.physical_setup });
    for (const r of cp.rounds) out.push(...stepLines(r.tts_trigger, r.label, r.parent_action));
  }
  // Cierre de sesión (fijo).
  out.push({ style: 'child', text: '¡Sesión completada! ¡Choca esos cinco!' });
  return out;
}

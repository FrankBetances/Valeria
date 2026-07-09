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
//   1. DAILY_SCENARIOS      — 3 escenarios de vida diaria · 6 ítems c/u
//                             (2 sustantivos, 2 verbos, 1 adjetivo, 1 onomatopeya).
//   2. PROGRESSION_SEQUENCES — 5 progresiones sobre un eje temático que evolucionan
//                             Onomatopeya → Sustantivo → Verbo → Adjetivo.
//   3. CONTRAST_CAPSULES    — 4 cápsulas TPR de contraste activo (pares de
//                             adjetivos y verbos antónimos).
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
];

// ---------------------------------------------------------------------------
// 3. CONTRASTE ACTIVO · Cápsulas TPR de adjetivos y verbos antónimos
//    El sistema guía al padre: prepara el entorno real, la app dispara la
//    pregunta y el éxito se mide por la palabra objetivo (más el gesto físico).
// ---------------------------------------------------------------------------
export type ContrastKind = 'adjetivos' | 'verbos';

export interface ContrastCapsule {
  id: string;
  code: string;
  kind: ContrastKind;
  pair: [string, string];       // par en contraste (grande/pequeño, abrir/cerrar…)
  icon: string;
  physical_setup: string;       // Setup Físico: qué prepara el padre en el entorno real
  tts_trigger: string;          // Disparador TTS: la pregunta exacta que emite la app
  stt_success: string;          // Criterio de Éxito STT: la palabra objetivo
  stt_expected_array: string[]; // objetivo + aproximaciones fonéticas válidas
  contrast_followup: string;    // segunda vuelta con la palabra opuesta (consolidación)
}

export const CONTRAST_CAPSULES: ContrastCapsule[] = [
  {
    id: 'cap-grande-pequeno', code: 'CT-1', kind: 'adjetivos',
    pair: ['grande', 'pequeño'], icon: '🧸',
    physical_setup: 'Prepara dos peluches del mismo animal pero de distinto tamaño: uno claramente GRANDE y uno claramente PEQUEÑO. Colócalos juntos delante del niño.',
    tts_trigger: '¿Cuál es el osito GRANDE? ¡Dámelo y dilo! Di: grande.',
    stt_success: 'grande',
    stt_expected_array: ['grande', 'gande', 'ande', 'gan', 'ganne'],
    contrast_followup: 'Ahora al revés: “¿Y cuál es el PEQUEÑO?”. El niño da el pequeño y dice “pequeño” (vale: pekeño, equeño, peño).',
  },
  {
    id: 'cap-limpio-sucio', code: 'CT-2', kind: 'adjetivos',
    pair: ['limpio', 'sucio'], icon: '🥄',
    physical_setup: 'Coge dos cucharas iguales: lava una hasta dejarla brillante y mancha la otra con un poco de comida o barro. Ponlas una al lado de la otra.',
    tts_trigger: 'Señala la cuchara SUCIA. ¿Cómo está esta? Dilo. Di: sucio.',
    stt_success: 'sucio',
    stt_expected_array: ['sucio', 'utio', 'suio', 'cucho', 'ucio'],
    contrast_followup: 'Después señalad la limpia: “¿Y esta cómo está?”. El niño dice “limpio” (vale: impio, limpi, pio).',
  },
  {
    id: 'cap-abrir-cerrar', code: 'CT-3', kind: 'verbos',
    pair: ['abrir', 'cerrar'], icon: '📦',
    physical_setup: 'Pon delante del niño una caja con tapa y mete dentro, a la vista, su juguete favorito. Cierra la tapa.',
    tts_trigger: 'El juguete está dentro. ¿Qué hacemos para sacarlo? ¡Vamos a ABRIR! Di: abrir.',
    stt_success: 'abrir',
    stt_expected_array: ['abrir', 'abre', 'abi', 'air', 'abí'],
    contrast_followup: 'Al guardar el juguete: “Ahora, ¿qué hacemos?… ¡CERRAR!”. El niño empuja la tapa y dice “cerrar” (vale: cerra, eral, tetar).',
  },
  {
    id: 'cap-subir-bajar', code: 'CT-4', kind: 'verbos',
    pair: ['subir', 'bajar'], icon: '🚗',
    physical_setup: 'Haz una rampa apoyando un libro grande inclinado y coloca un coche de juguete al pie de la rampa.',
    tts_trigger: 'El coche va a la montaña. ¿Qué hace? ¡SUBE arriba! Di: subir.',
    stt_success: 'subir',
    stt_expected_array: ['subir', 'sube', 'ubi', 'tubi', 'subí'],
    contrast_followup: 'Luego soltad el coche: “¡Ahora BAJA!”. El niño lo baja por la rampa y dice “bajar” (vale: baja, aja, baxar).',
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

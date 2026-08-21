// ============================================================================
// Valeria+ · Academy — La Brújula de las Palabras (ASHA_MILESTONES_01)
// Hitos normativos del desarrollo del lenguaje (0 a 5 años) según ASHA.
// Se integra en el silo de Lenguaje con progreso propio de XP.
// ============================================================================
import { AcademyCapsule } from '../academyTypes';

export const ASHA_DISCLAIMER_ES =
  'Guía normativa de referencia (ASHA). Valeria+ no diagnostica. Solo un profesional sanitario puede emitir un diagnóstico audiológico o del neurodesarrollo.';

export const ASHA_DISCLAIMER_EN =
  'Reference developmental milestones (ASHA). Valeria+ does not diagnose. Only a healthcare professional can issue an audiological or neurodevelopmental diagnosis.';

export const academyAshaMilestonesEs: AcademyCapsule = {
  id: 'ASHA_MILESTONES_01',
  domain: 'lenguaje',
  track: 'desarrollo',
  icon: '🧭',
  title: 'La Brújula de las Palabras: Qué esperar a cada edad',
  summary: 'Hitos del lenguaje de 0 a 5 años. Identificar a tiempo es ganar neuroplasticidad.',
  minutes: 2,
  xp: 30,
  disclaimerText: ASHA_DISCLAIMER_ES,
  slides: [
    {
      icon: '🧭',
      heading: 'El mito del "ya hablará"',
      body: 'A menudo escuchamos que cada niño tiene su ritmo y que "ya hablará". Sin embargo, el desarrollo del lenguaje sigue un mapa claro. Si un niño no alcanza los hitos esperados para su edad, no debe asumirse como un simple retraso madurativo: es una señal para solicitar una evaluación audiológica y del neurodesarrollo temprana.',
    },
    {
      icon: '👶',
      ageBracket: '0 - 12 meses',
      heading: '0 - 12 meses: Primeros cimientos',
      body: 'Durante el primer año se asientan la escucha activa, la atención conjunta y las primeras intenciones comunicativas.',
      receptive: [
        'Se sobresalta ante ruidos fuertes y se calma con voces familiares.',
        'Voltea la cabeza hacia la fuente del sonido (4-6 meses).',
        'Reconoce su propio nombre y reacciona a la palabra "no".',
        'Comprende palabras comunes (agua, zapato) al final del primer año.',
      ],
      expressive: [
        'Lloros diferenciados según su necesidad (hambre, dolor).',
        'Balbucea combinando consonantes y vocales (pa, ba).',
        'Usa gestos sociales como señalar o decir adiós con la mano.',
        'Dice sus primeras 1 o 2 palabras con significado alrededor del año.',
      ],
    },
    {
      icon: '🍼',
      ageBracket: '1 - 2 años',
      heading: '1 - 2 años: Explosión léxica inicial',
      body: 'Aparecen las primeras combinaciones de palabras y el seguimiento de órdenes sencillas de un solo paso.',
      receptive: [
        'Señala partes del cuerpo al ser nombradas.',
        'Sigue órdenes verbales simples de un solo paso ("dame la pelota").',
        'Comprende preguntas sencillas ("¿Dónde está mamá?").',
        'Presta atención a cuentos o canciones breves.',
      ],
      expressive: [
        'Aumenta su vocabulario progresivamente cada mes.',
        'Comienza a unir 2 palabras ("más agua", "coche azul").',
        'Formula preguntas cortas de 1 o 2 palabras ("¿Qué es?").',
        'Utiliza diversas consonantes al inicio de las palabras.',
      ],
    },
    {
      icon: '🎨',
      ageBracket: '2 - 3 años',
      heading: '2 - 3 años: Frases y conceptos',
      body: 'Se amplía la discriminación semántica y la inteligibilidad del habla para los cuidadores principales.',
      receptive: [
        'Discrimina significados opuestos (grande/pequeño, arriba/abajo).',
        'Sigue instrucciones de dos pasos ("coge el libro y ponlo en la mesa").',
        'Escucha cuentos durante períodos más prolongados.',
      ],
      expressive: [
        'Construye oraciones de 2 a 3 palabras sistemáticamente.',
        'Sus cuidadores habituales comprenden su habla la mayor parte del tiempo (50-75%).',
        'Solicita objetos o acciones nombrándolos directamente.',
      ],
    },
    {
      icon: '🧩',
      ageBracket: '3 - 4 años',
      heading: '3 - 4 años: Preguntas y narración',
      body: 'Responde a preguntas complejas y el habla se vuelve comprensible fuera del núcleo familiar.',
      receptive: [
        'Responde adecuadamente a preguntas con "quién", "qué", "dónde" y "por qué".',
        'Escucha y responde cuando se le llama desde otra habitación (indicador clave de audición funcional).',
      ],
      expressive: [
        'Narra eventos recientes o historias cortas.',
        'Utiliza oraciones de 4 o más palabras.',
        'Personas fuera del núcleo familiar comprenden su habla casi en su totalidad.',
      ],
    },
    {
      icon: '🚀',
      ageBracket: '4 - 5 años',
      heading: '4 - 5 años: Comunicación fluida',
      body: 'Dominio de secuencias temporales, oraciones ricas en detalles y articulación de la mayoría de fonemas.',
      receptive: [
        'Comprende secuencias y el orden lógico (primero, después, último).',
        'Entiende conceptos temporales básicos (ayer, hoy, mañana).',
        'Ejecuta instrucciones complejas incluso en entornos ruidosos (ej. el aula).',
      ],
      expressive: [
        'Pronuncia correctamente la gran mayoría de los sonidos (puede costar aún la /r/ vibrante).',
        'Se comunica usando oraciones ricas en detalles.',
        'Mantiene el hilo temático en una conversación de forma fluida.',
      ],
    },
  ],
  quiz: [
    {
      prompt:
        'Si notas que tu hijo o hija no alcanza de forma consistente los marcadores esperados para su edad cronológica, ¿cuál es el paso más seguro?',
      options: [
        'Esperar a que madure a su ritmo natural, ya que cada niño es distinto.',
        'Solicitar una evaluación clínica audiológica y del neurodesarrollo temprana.',
      ],
      answer: 1,
      rationale:
        '¡Exacto! Identificar una necesidad a tiempo permite iniciar la intervención cuando la neuroplasticidad cerebral es máxima.',
    },
  ],
};

export const academyAshaMilestonesEn: AcademyCapsule = {
  id: 'ASHA_MILESTONES_01',
  domain: 'lenguaje',
  track: 'desarrollo',
  icon: '🧭',
  title: 'The Word Compass: What to Expect at Each Age',
  summary: 'Speech and language milestones from 0 to 5. Early detection leverages neuroplasticity.',
  minutes: 2,
  xp: 30,
  disclaimerText: ASHA_DISCLAIMER_EN,
  slides: [
    {
      icon: '🧭',
      heading: 'The myth of "they will talk eventually"',
      body: 'We often hear that every child develops at their own pace. However, language follows a structured developmental map. When milestones are missed, waiting is not recommended: an early audiological and neurodevelopmental evaluation is the safest step.',
    },
    {
      icon: '👶',
      ageBracket: '0 - 12 months',
      heading: '0 - 12 months: First foundations',
      body: 'Active listening, joint attention, and early communicative intent develop during the first year.',
      receptive: [
        'Startles at loud sounds and calms to familiar voices.',
        'Turns head toward sound sources (4-6 months).',
        'Recognizes their own name and responds to "no".',
        'Understands common words (water, shoe) by the end of year one.',
      ],
      expressive: [
        'Different cries for distinct needs (hunger, discomfort).',
        'Babbles combining consonants and vowels (pa, ba).',
        'Uses social gestures such as pointing and waving goodbye.',
        'Says 1 or 2 meaningful words around 12 months.',
      ],
    },
    {
      icon: '🍼',
      ageBracket: '1 - 2 years',
      heading: '1 - 2 years: Early word combinations',
      body: 'First two-word phrases appear along with following single-step verbal directions.',
      receptive: [
        'Points to body parts when named.',
        'Follows simple one-step directions ("give me the ball").',
        'Understands simple questions ("Where is mommy?").',
        'Attends to brief stories or songs.',
      ],
      expressive: [
        'Expands vocabulary steadily each month.',
        'Starts combining 2 words ("more water", "blue car").',
        'Asks 1-2 word questions ("What that?").',
        'Uses various word-initial consonants.',
      ],
    },
    {
      icon: '🎨',
      ageBracket: '2 - 3 years',
      heading: '2 - 3 years: Phrases and concepts',
      body: 'Semantic discrimination expands and speech becomes 50-75% intelligible to familiar caregivers.',
      receptive: [
        'Understands opposites (big/small, up/down).',
        'Follows 2-step directions ("get the book and put it on the table").',
        'Listens to stories for longer intervals.',
      ],
      expressive: [
        'Consistently builds 2-3 word sentences.',
        'Familiar caregivers understand their speech most of the time (50-75%).',
        'Directly asks for objects or actions by name.',
      ],
    },
    {
      icon: '🧩',
      ageBracket: '3 - 4 years',
      heading: '3 - 4 years: Questions and storytelling',
      body: 'Answers "wh-" questions and speech becomes intelligible to unfamiliar listeners.',
      receptive: [
        'Answers who, what, where, and why questions appropriately.',
        'Hears and responds when called from another room (key functional hearing indicator).',
      ],
      expressive: [
        'Talks about recent activities or tells simple stories.',
        'Uses sentences with 4 or more words.',
        'Unfamiliar listeners understand speech most of the time.',
      ],
    },
    {
      icon: '🚀',
      ageBracket: '4 - 5 years',
      heading: '4 - 5 years: Fluent communication',
      body: 'Masters temporal sequencing, detailed conversational speech, and clear phoneme articulation.',
      receptive: [
        'Understands order words (first, next, last).',
        'Understands time concepts (yesterday, today, tomorrow).',
        'Follows multi-step directions even in noisy environments (e.g. classrooms).',
      ],
      expressive: [
        'Pronounces most sounds correctly (consonant blends may still emerge).',
        'Communicates using detailed sentences.',
        'Maintains conversational topics smoothly.',
      ],
    },
  ],
  quiz: [
    {
      prompt:
        'If you notice that your child consistently misses expected developmental speech markers, what is the safest next step?',
      options: [
        'Wait for them to catch up naturally without seeking clinical guidance.',
        'Request an early audiological and neurodevelopmental evaluation.',
      ],
      answer: 1,
      rationale:
        'Correct! Timely identification allows interventions to start when brain neuroplasticity is at its peak.',
    },
  ],
};

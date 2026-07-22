// ============================================================================
// Valeria+ · Academy — Banco de Cápsulas de Conocimiento (V2.0)
// Módulo PURO (sin estado ni efectos): contenido de formación para el adulto.
// Cada cápsula declara su `domain` (silo de XP). El grueso del dominio Lenguaje
// vive aquí; Hipoacusia se sirve como micro-guías en academyHardware.ts.
// El orden del array ES el orden de progresión sugerido dentro de cada dominio.
// ============================================================================
import { AcademyCapsule, AcademyTrack } from './academyTypes';

// Color de acento por eje temático del dominio Lenguaje (subfamilia visual).
export const TRACK_ACCENT: Record<AcademyTrack, { bg: string; fg: string; label: string }> = {
  desarrollo: { bg: '#e0edff', fg: '#3b6fd4', label: 'CÓMO APRENDEN A HABLAR' },
  tpr:        { bg: '#d6f5f2', fg: '#00a39e', label: 'POR QUÉ EL TPR' },
  vicios:     { bg: '#fdeef2', fg: '#c2477e', label: 'VICIOS A EVITAR' },
  mediada:    { bg: '#fff1dc', fg: '#d98a1f', label: 'TERAPIA MEDIADA' },
};

// Umbral de aprobado del micro-quiz (aciertos / preguntas). Ágil, no punitivo.
export const ACADEMY_PASS_THRESHOLD = 0.6;

export const ACADEMY_CAPSULES: AcademyCapsule[] = [
  // ================================================================ LENGUAJE
  // --------------------------------------------------------------- desarrollo
  {
    id: 'dev-input',
    domain: 'lenguaje',
    track: 'desarrollo',
    icon: '👂',
    title: 'El baño de lenguaje',
    summary: 'Los niños aprenden a hablar escuchando mucho antes de producir.',
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: '🌊',
        heading: 'Primero se escucha, después se habla',
        body: 'El cerebro infantil construye el lenguaje a partir de la cantidad y calidad de habla que recibe. A esto lo llamamos "input" o baño de lenguaje. Antes de decir su primera palabra, tu peque ya ha oído miles de repeticiones.',
      },
      {
        icon: '🔁',
        heading: 'La repetición no aburre: consolida',
        body: 'Repetir la misma palabra en contextos distintos ("mira el perro", "el perro corre", "¿dónde está el perro?") es exactamente lo que el cerebro necesita para fijar el significado y el sonido. No temas repetir.',
      },
      {
        icon: '🎧',
        heading: 'Audición primero (método auditivo-verbal)',
        body: 'En terapia auditivo-verbal damos prioridad al oído: nombramos antes de mostrar, para que el niño use la escucha y no solo la lectura labial o el gesto. Por eso muchos ejercicios dicen la palabra ANTES de enseñar la imagen.',
      },
    ],
    quiz: [
      {
        prompt: '¿Qué ocurre normalmente antes de que un niño diga su primera palabra?',
        options: ['Ya ha escuchado muchísimo lenguaje', 'Aprende a leer', 'Necesita ver la boca del adulto'],
        answer: 0,
        rationale: 'La comprensión y la escucha preceden a la producción: el input es la materia prima del lenguaje.',
      },
      {
        prompt: 'Repetir una palabra en varios contextos…',
        options: ['Confunde al niño', 'Consolida el significado y el sonido', 'Solo sirve para bebés'],
        answer: 1,
        rationale: 'La repetición contextualizada es el mecanismo natural de consolidación del lenguaje.',
      },
    ],
  },
  {
    id: 'dev-turnos',
    domain: 'lenguaje',
    track: 'desarrollo',
    icon: '🏓',
    title: 'Conversar es por turnos',
    summary: 'El ida y vuelta ("serve and return") es el motor del lenguaje.',
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: '🏓',
        heading: 'Servir y devolver',
        body: 'El lenguaje se aprende en intercambios: el niño mira algo o hace un sonido (sirve) y tú respondes nombrando y ampliando (devuelves). Cada turno que le devuelves construye red neuronal.',
      },
      {
        icon: '⏳',
        heading: 'El poder de esperar',
        body: 'Tras una pregunta o un modelo, cuenta mentalmente hasta 5 en silencio. Ese tiempo de espera le da al niño la oportunidad de iniciar. Adelantarnos le roba el turno y le enseña a esperar a que hablemos por él.',
      },
    ],
    quiz: [
      {
        prompt: 'Después de dar un modelo o hacer una pregunta, conviene…',
        options: ['Responder tú enseguida', 'Esperar en silencio unos segundos', 'Repetir la pregunta más alto'],
        answer: 1,
        rationale: 'La pausa de espera le cede el turno al niño y previene que aprenda a depender del adulto.',
      },
    ],
  },
  // --------------------------------------------------------------------- tpr
  {
    id: 'tpr-porque',
    domain: 'lenguaje',
    track: 'tpr',
    icon: '🤸',
    title: '¿Por qué mover el cuerpo?',
    summary: 'El TPR ancla el sonido a una acción física y baja la carga.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🧠',
        heading: 'Escuchar + mover = recordar',
        body: 'El Total Physical Response (TPR, de Asher) empareja cada orden hablada con un movimiento de todo el cuerpo. Vincular sonido y acción crea una huella de memoria mucho más fuerte que solo oír o solo ver.',
      },
      {
        icon: '🔋',
        heading: 'Sin presión de "producir"',
        body: 'En TPR el niño demuestra que ENTIENDE moviéndose, sin obligación de hablar todavía. Eso descarga la ansiedad de rendimiento y mantiene la motivación: puede triunfar aunque aún no articule bien.',
      },
      {
        icon: '🎯',
        heading: 'Por eso confirmas tú',
        body: 'En las cápsulas TPR de Valeria la app dicta la orden y TÚ confirmas si la cumplió. Tú eres el juez clínico: la app nunca decide sola si acertó. Así el criterio siempre es humano.',
      },
    ],
    quiz: [
      {
        prompt: 'La ventaja principal de emparejar el sonido con un movimiento es…',
        options: ['Cansar al niño', 'Crear una huella de memoria más fuerte', 'Que hable más rápido'],
        answer: 1,
        rationale: 'La doble vía auditivo-motora consolida mejor el aprendizaje que un solo canal.',
      },
      {
        prompt: 'En una cápsula TPR, ¿quién decide si el niño cumplió la orden?',
        options: ['La app, automáticamente', 'El adulto que acompaña', 'Nadie, da igual'],
        answer: 1,
        rationale: 'El adulto es el motor clínico y el único que valida: la app orquesta, no diagnostica.',
      },
    ],
  },
  // ------------------------------------------------------------------- vicios
  {
    id: 'vicio-corregir',
    domain: 'lenguaje',
    track: 'vicios',
    icon: '🚫',
    title: 'No corrijas: remodela',
    summary: 'Decir "está mal" apaga; repetir bien la palabra enseña.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🚫',
        heading: 'El vicio de "así no se dice"',
        body: 'Corregir explícitamente ("no, se dice perro, no peo") interrumpe la comunicación y frustra. El niño aprende que hablar es arriesgado y habla menos.',
      },
      {
        icon: '♻️',
        heading: 'Remodelado (recast)',
        body: 'En su lugar, devuelve la palabra bien dicha de forma natural, dentro de la frase: si dice "peo", tú respondes "¡Sí! Un PERRO grande". Le das el modelo correcto sin señalar el error. Esto es el recast, la técnica reina de la terapia mediada.',
      },
    ],
    quiz: [
      {
        prompt: 'Si el niño dice "peo" señalando un perro, lo mejor es…',
        options: ['"No, se dice perro"', '"¡Sí, un perro grande!"', 'Ignorarlo'],
        answer: 1,
        rationale: 'El remodelado (recast) ofrece el modelo correcto sin castigar el intento comunicativo.',
      },
    ],
  },
  {
    id: 'vicio-preguntas',
    domain: 'lenguaje',
    track: 'vicios',
    icon: '❓',
    title: 'El examen encubierto',
    summary: 'Bombardear con "¿qué es esto?" convierte el juego en test.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '❓',
        heading: 'Demasiadas preguntas de test',
        body: 'Preguntar sin parar "¿qué es? ¿de qué color? ¿cuántos hay?" pone al niño a examen. Cuando ya sabemos la respuesta y solo queremos que la diga, se nota, y baja las ganas de participar.',
      },
      {
        icon: '💬',
        heading: 'Comenta más, pregunta menos',
        body: 'Cambia una parte de las preguntas por comentarios y descripciones ("¡mira, se cayó la torre!"). Los comentarios modelan lenguaje sin exigir respuesta y dan más ejemplos para imitar. Una buena proporción es comentar más que preguntar.',
      },
    ],
    quiz: [
      {
        prompt: 'Para que el niño no viva la sesión como un examen conviene…',
        options: ['Hacer más preguntas', 'Comentar y describir más que preguntar', 'Quedarse en silencio'],
        answer: 1,
        rationale: 'Los comentarios modelan lenguaje sin la presión de responder correctamente.',
      },
    ],
  },
  // ------------------------------------------------------------------ mediada
  {
    id: 'med-adulto',
    domain: 'lenguaje',
    track: 'mediada',
    icon: '🧑‍🏫',
    title: 'Tú eres el terapeuta',
    summary: 'La app es la herramienta; el motor clínico eres tú.',
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: '🧑‍🏫',
        heading: 'Terapia MEDIADA por un adulto',
        body: 'Valeria+ no "trata" al niño sola. Es una herramienta que TÚ manejas: eliges el ejercicio, das el modelo, esperas, refuerzas y decides cuándo parar. El progreso depende de esa mediación humana.',
      },
      {
        icon: '📱',
        heading: 'Tú manejas la navegación',
        body: 'Recuerda el encuadre: el adulto controla los menús y solo cede la tableta cuando el ejercicio ya ha empezado. Por eso esta formación y los ajustes viven fuera del alcance del juego del niño.',
      },
      {
        icon: '🛑',
        heading: 'Parar también es terapia',
        body: 'No hay un mínimo que cumplir. Si tu peque se cansa o se desborda, parar a tiempo protege la motivación para mañana. Una sesión corta y feliz vale más que una larga y forzada.',
      },
    ],
    quiz: [
      {
        prompt: 'En Valeria+, ¿cuál es el papel del adulto?',
        options: ['Mero espectador', 'El motor clínico que media toda la sesión', 'Solo encender la tableta'],
        answer: 1,
        rationale: 'La terapia es mediada: el adulto elige, modela, refuerza y decide. La app es la herramienta.',
      },
      {
        prompt: 'Si el niño se desborda a mitad de la sesión, lo correcto es…',
        options: ['Terminar todos los ejercicios igualmente', 'Parar: no hay mínimo obligatorio', 'Subir la dificultad'],
        answer: 1,
        rationale: 'Parar a tiempo preserva la motivación; no existe una cuota que forzar.',
      },
    ],
  },

  // =============================================================== DISLALIAS
  {
    id: 'dis-punto',
    domain: 'dislalias',
    track: 'tpr',
    icon: '👅',
    title: 'Cada sonido, un lugar',
    summary: 'La lengua y los labios tienen un punto exacto para cada fonema.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '📍',
        heading: 'El punto de articulación',
        body: 'Una dislalia es la dificultad para producir un sonido concreto. Cada fonema se forma en un lugar de la boca: la /r/ vibra detrás de los dientes, la /k/ atrás, la /s/ con el aire entre los dientes. Saber DÓNDE va cada sonido es el primer paso para ayudar.',
      },
      {
        icon: '🪞',
        heading: 'El espejo es tu aliado',
        body: 'Colócate a la altura del niño frente a un espejo. Ver la boca (la tuya y la suya) hace visible algo invisible. Exagera un poco el gesto del sonido diana y deja que te imite sin prisa.',
      },
    ],
    quiz: [
      {
        prompt: 'Ante un sonido que al niño le cuesta, lo primero es…',
        options: ['Pedirle que lo repita más alto', 'Saber en qué punto de la boca se forma', 'Cambiar de palabra'],
        answer: 1,
        rationale: 'Conocer el punto de articulación permite dar pistas concretas en lugar de repetir sin más.',
      },
    ],
  },

  // ================================================================ DISLEXIA
  {
    id: 'dlx-fonologica',
    domain: 'dislexia',
    track: 'desarrollo',
    icon: '🔤',
    title: 'Jugar con los sonidos',
    summary: 'La lectura empieza mucho antes de las letras: en el oído.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🎵',
        heading: 'Conciencia fonológica',
        body: 'Antes de leer, el niño necesita "oír" las partes de las palabras: que "mesa" empieza como "mano", que "gato" rima con "pato", que "sol" tiene tres sonidos. Esta habilidad, la conciencia fonológica, es el mejor predictor de una lectura fácil.',
      },
      {
        icon: '👏',
        heading: 'Sin lápiz ni papel',
        body: 'Se entrena jugando: dar palmas por sílabas, buscar palabras que empiecen igual, inventar rimas. Son juegos orales, cotidianos, sin presión. Para el niño es un juego; para su cerebro lector es el andamiaje.',
      },
    ],
    quiz: [
      {
        prompt: 'La conciencia fonológica se entrena mejor…',
        options: ['Copiando letras muchas veces', 'Con juegos orales de sonidos y rimas', 'Leyendo en voz alta cuanto antes'],
        answer: 1,
        rationale: 'Es una habilidad auditiva: se construye jugando con los sonidos, no copiando grafías.',
      },
    ],
  },

  // ===================================================================== TEA
  {
    id: 'tea-anticipar',
    domain: 'tea',
    track: 'mediada',
    icon: '🧩',
    title: 'Anticipar da seguridad',
    summary: 'Saber qué viene después reduce la ansiedad y libera atención.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🗺️',
        heading: 'El mundo, más predecible',
        body: 'Para muchos niños del espectro, lo inesperado angustia. Anticipar lo que va a pasar —con una foto, un pictograma o una frase corta y constante— convierte el día en algo manejable. Un mundo predecible deja recursos libres para comunicarse.',
      },
      {
        icon: '⏱️',
        heading: 'Avisa los cambios',
        body: 'Antes de terminar una actividad, avisa: "dos más y guardamos". Los finales bruscos desbordan. Un aviso breve y siempre igual respeta su ritmo y previene el desborde, sin negociaciones largas.',
      },
    ],
    quiz: [
      {
        prompt: 'Anticipar lo que va a ocurrir sirve sobre todo para…',
        options: ['Que el niño obedezca más rápido', 'Reducir la ansiedad y liberar atención', 'Alargar las actividades'],
        answer: 1,
        rationale: 'La predictibilidad baja la carga emocional y deja recursos para la comunicación.',
      },
    ],
  },
];

// Total global de cápsulas (todas las domains). Uso informativo/agregado.
export const ACADEMY_TOTAL = ACADEMY_CAPSULES.length;

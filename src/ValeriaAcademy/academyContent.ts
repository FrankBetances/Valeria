// ============================================================================
// Valeria+ · Academy — Banco de Cápsulas de Conocimiento (V1.0)
// Módulo PURO (sin estado ni efectos): contenido de formación para el adulto.
// Tres ejes: (1) cómo aprenden a hablar los niños, (2) el porqué de cada
// dinámica TPR, (3) qué vicios evitar durante la terapia mediada.
// El orden del array ES el orden de progresión sugerido en la pantalla.
// ============================================================================
import { AcademyBadge, AcademyCapsule, AcademyTrack } from './academyTypes';

// Color de acento por eje temático (se resuelve en la UI contra valeriaTheme).
export const TRACK_ACCENT: Record<AcademyTrack, { bg: string; fg: string; label: string }> = {
  desarrollo: { bg: '#e0edff', fg: '#3b6fd4', label: 'CÓMO APRENDEN A HABLAR' },
  tpr:        { bg: '#d6f5f2', fg: '#00a39e', label: 'POR QUÉ EL TPR' },
  vicios:     { bg: '#fdeef2', fg: '#c2477e', label: 'VICIOS A EVITAR' },
  mediada:    { bg: '#fff1dc', fg: '#d98a1f', label: 'TERAPIA MEDIADA' },
};

// Umbral de aprobado del micro-quiz (aciertos / preguntas). Ágil, no punitivo.
export const ACADEMY_PASS_THRESHOLD = 0.6;

export const ACADEMY_CAPSULES: AcademyCapsule[] = [
  // --------------------------------------------------------------- desarrollo
  {
    id: 'dev-input',
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
];

// Total de cápsulas: constante derivada, usada por el resumen del hub.
export const ACADEMY_TOTAL = ACADEMY_CAPSULES.length;

// --- Insignias de la academia -----------------------------------------------
export const ACADEMY_BADGES: AcademyBadge[] = [
  { id: 'primeraCapsula', icon: '📘', name: 'Aprendiz',        desc: 'Completa tu primera cápsula.' },
  { id: 'mitad',          icon: '📗', name: 'A medio camino',  desc: 'Completa la mitad de las cápsulas.' },
  { id: 'graduado',       icon: '🎓', name: 'Cuidador experto', desc: 'Completa todas las cápsulas.' },
  { id: 'perfecto',       icon: '💯', name: 'Sin fallos',      desc: 'Aprueba una cápsula sin ningún error.' },
];

// Niveles de la academia (hilo narrativo de acompañante/tutor).
export const ACADEMY_LEVEL_NAMES = ['Novato', 'Acompañante', 'Guía', 'Mentor', 'Cuidador experto'];
export const ACADEMY_XP_PER_LEVEL = 60;

export const academyLevelFor = (xp: number): number =>
  Math.floor(xp / ACADEMY_XP_PER_LEVEL) + 1;
export const academyLevelName = (level: number): string =>
  ACADEMY_LEVEL_NAMES[Math.min(level - 1, ACADEMY_LEVEL_NAMES.length - 1)];

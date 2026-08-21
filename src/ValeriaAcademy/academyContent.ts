// ============================================================================
// Valeria+ · Academy — Banco de Cápsulas de Conocimiento (V2.0)
// Módulo PURO (sin estado ni efectos): contenido de formación para el adulto.
// Cada cápsula declara su `domain` (silo de XP). El grueso del dominio Lenguaje
// vive aquí; Hipoacusia se sirve como micro-guías en academyHardware.ts.
// El orden del array ES el orden de progresión sugerido dentro de cada dominio.
// ============================================================================
import { AcademyCapsule, AcademyTrack } from './academyTypes';
import type { UiLang } from '../valeriaUiLang';
import { ACADEMY_CAPSULES_EN, TRACK_ACCENT_EN } from './academyContent.en';
import { academyAshaMilestonesEs } from './capsulas/valeriaAcademyAsha';

export { ACADEMY_CAPSULES_EN, TRACK_ACCENT_EN };

// Color de acento por eje temático del dominio Lenguaje (subfamilia visual).
export const TRACK_ACCENT_ES: Record<AcademyTrack, { bg: string; fg: string; label: string }> = {
  desarrollo: { bg: '#e0edff', fg: '#3b6fd4', label: 'CÓMO APRENDEN A HABLAR' },
  tpr:        { bg: '#d6f5f2', fg: '#00a39e', label: 'POR QUÉ EL TPR' },
  vicios:     { bg: '#fdeef2', fg: '#c2477e', label: 'VICIOS A EVITAR' },
  mediada:    { bg: '#fff1dc', fg: '#d98a1f', label: 'TERAPIA MEDIADA' },
  mitos:      { bg: '#ffe9e4', fg: '#cf4b39', label: '¿MITO O REALIDAD?' },
};

export const trackAccentFor = (track: AcademyTrack, lang: UiLang = 'es'): { bg: string; fg: string; label: string } =>
  (lang === 'en' ? TRACK_ACCENT_EN : TRACK_ACCENT_ES)[track];

export const TRACK_ACCENT: Record<AcademyTrack, { bg: string; fg: string; label: string }> = TRACK_ACCENT_ES;

// Umbral de aprobado del micro-quiz (aciertos / preguntas). Ágil, no punitivo.
export const ACADEMY_PASS_THRESHOLD = 0.6;

export const ACADEMY_CAPSULES_ES: AcademyCapsule[] = [
  // ================================================================ LENGUAJE
  // --------------------------------------------------------------- Brújula ASHA
  academyAshaMilestonesEs,
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

  {
    id: 'dev-autoconversacion',
    domain: 'lenguaje',
    track: 'desarrollo',
    icon: '🎙️',
    title: 'Narra lo que pasa',
    summary: 'Poner voz a lo que hacéis multiplica el lenguaje que oye.',
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: '🗣️',
        heading: 'Autoconversación (self-talk)',
        body: 'Cuenta en voz alta lo que TÚ haces mientras lo haces: "abro el grifo… el agua está calentita… lavamos las manos". Sin preguntar nada. El niño oye lenguaje pegado a la acción, en el momento justo en que cobra sentido.',
      },
      {
        icon: '👀',
        heading: 'Habla paralela (parallel talk)',
        body: 'Ahora narra lo que hace ÉL: "estás metiendo el coche… ¡lo empujas fuerte!". Le prestas las palabras que aún no tiene para lo que ya está viviendo. Es el andamiaje perfecto: significado + sonido + interés, todo a la vez.',
      },
      {
        icon: '🔤',
        heading: 'Frases cortas y claras',
        body: 'Ajusta el tamaño de tus frases a las suyas más una pizca. Si él dice palabras sueltas, tú usa frases de dos o tres. Ni telegrama ni discurso: un modelo que le queda a un pasito por delante.',
      },
    ],
    quiz: [
      {
        prompt: 'La "habla paralela" consiste en…',
        options: ['Narrar lo que el niño está haciendo', 'Corregir su pronunciación', 'Hablar de otra cosa para distraerlo'],
        answer: 0,
        rationale: 'Poner palabras a la acción del niño le da el modelo justo para lo que ya le interesa.',
      },
      {
        prompt: 'El tamaño ideal de tus frases es…',
        options: ['Lo más largas posible', 'Un pasito por delante de las suyas', 'Siempre una sola palabra'],
        answer: 1,
        rationale: 'Modelar "una pizca por encima" mantiene el input comprensible y a la vez estimulante.',
      },
    ],
  },
  {
    id: 'med-expansion',
    domain: 'lenguaje',
    track: 'mediada',
    icon: '🌱',
    title: 'Expandir y enriquecer',
    summary: 'Recoge lo que dice y devuélvelo un poco más completo.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '➕',
        heading: 'Expandir: completa la frase',
        body: 'Si el niño dice "coche", tú devuelves la versión completa: "sí, el coche rojo". No le pides que repita: solo le muestras cómo suena su idea entera. Recoges su palabra y la enmarcas en una frase bien formada.',
      },
      {
        icon: '✨',
        heading: 'Extender: añade una idea',
        body: 'Un paso más: aporta información nueva. "El coche rojo… corre muy rápido". Expandir arregla la forma; extender suma contenido. Juntas convierten una palabra en una conversación sin que el niño sienta examen.',
      },
    ],
    quiz: [
      {
        prompt: 'Si el niño dice "agua" y respondes "sí, quieres más agua", estás…',
        options: ['Corrigiendo un error', 'Expandiendo su mensaje', 'Haciendo una pregunta de test'],
        answer: 1,
        rationale: 'Expandir devuelve la idea del niño en una frase completa, sin exigir repetición.',
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

  {
    id: 'dis-edades',
    domain: 'dislalias',
    track: 'desarrollo',
    icon: '📅',
    title: 'Cada sonido a su tiempo',
    summary: 'No todos los sonidos llegan a la vez: hay un calendario.',
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: '🗓️',
        heading: 'Los sonidos maduran por orden',
        body: 'Las vocales y sonidos como /m/, /p/, /t/ aparecen pronto. Otros, como /s/, /l/ o la /r/ vibrante, tardan más y pueden no estar del todo hasta los 5-6 años. Que un peque de 3 años aún no diga bien la /r/ suele ser parte del desarrollo, no un problema.',
      },
      {
        icon: '⚖️',
        heading: 'Cuándo consultar',
        body: 'Preocupa más si a los 3-4 años apenas se le entiende, si pierde sonidos que ya tenía, o si evita hablar. La decisión de intervenir la toma el logopeda; tu papel es observar, anotar ejemplos y consultar sin alarmarte antes de tiempo.',
      },
    ],
    quiz: [
      {
        prompt: 'Que un niño de 3 años no pronuncie bien la /r/ vibrante…',
        options: ['Es siempre un trastorno', 'Suele ser parte del desarrollo normal', 'Significa que no oye bien'],
        answer: 1,
        rationale: 'La /r/ es de adquisición tardía; a esa edad su ausencia rara vez es patológica.',
      },
    ],
  },
  {
    id: 'dis-erre',
    domain: 'dislalias',
    track: 'tpr',
    icon: '🐯',
    title: 'La erre, con calma',
    summary: 'El sonido más difícil no se fuerza: se prepara.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🌬️',
        heading: 'La /r/ necesita vibración y aire',
        body: 'La /r/ fuerte pide que la punta de la lengua vibre suelta detrás de los dientes con un buen chorro de aire. Es un equilibrio fino que muchos niños tardan en lograr. Presionar ("¡dilo bien!") solo genera tensión, y la tensión es justo lo contrario de lo que la /r/ necesita.',
      },
      {
        icon: '🎈',
        heading: 'Preparar el terreno jugando',
        body: 'Ayudan los juegos que sueltan la lengua y trabajan el aire: imitar una moto ("brrrm"), hacer vibrar los labios, decir "tara-tara-tara" rápido. Son juegos, no deberes. Si a pesar del juego no aparece, el logopeda tiene técnicas específicas para provocarla.',
      },
    ],
    quiz: [
      {
        prompt: 'Ante la /r/ que no sale, lo MENOS útil es…',
        options: ['Jugar a imitar una moto', 'Presionar para que la diga ya', 'Consultar con el logopeda'],
        answer: 1,
        rationale: 'La presión genera tensión, y la vibrante requiere una lengua relajada y suelta.',
      },
    ],
  },
  {
    id: 'dis-praxias',
    domain: 'dislalias',
    track: 'tpr',
    icon: '👄',
    title: 'Gimnasia de la boca',
    summary: 'Labios, lengua y soplo se entrenan como un juego.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🤸',
        heading: 'Praxias: mover para articular',
        body: 'Los sonidos necesitan una boca ágil. Las praxias son ejercicios de labios y lengua: sacar y meter la lengua, tocar las comisuras, inflar las mejillas, hacer "morritos" y sonrisa. Frente al espejo y por turnos, se convierten en un juego de imitación.',
      },
      {
        icon: '🫧',
        heading: 'El soplo, dosificado',
        body: 'Soplar velas, pompas, matasuegras o mover una bolita con una pajita trabaja el control del aire que muchos sonidos necesitan. Poco rato y con pausas: si el peque se marea, paramos. Como siempre, es apoyo lúdico, no una tabla de ejercicios obligatoria.',
      },
    ],
    quiz: [
      {
        prompt: 'Las praxias orofaciales sirven para…',
        options: ['Cansar al niño', 'Dar agilidad a labios y lengua', 'Sustituir a la terapia'],
        answer: 1,
        rationale: 'Una musculatura oral ágil facilita la articulación; son un apoyo lúdico, no un sustituto de la terapia.',
      },
    ],
  },

  // Cápsula del bloque de Realidad Aumentada. Vive en el silo de dislalias
  // porque AR-1 es un ejercicio de dislalia funcional, y porque es donde la
  // familia va a buscarla: llega preguntando por la /r/, no por "realidad
  // aumentada". Explica QUÉ hace la cámara y POR QUÉ el micro está apagado,
  // que son las dos preguntas que aparecen la primera vez.
  {
    id: 'dis-ar-gesto',
    domain: 'dislalias',
    track: 'tpr',
    icon: '🎯',
    title: 'Premiar el gesto antes que el sonido',
    summary: 'Por qué en los juegos de cámara el micrófono está apagado.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '😣',
        heading: 'El problema de premiar solo el sonido',
        body: 'Cuando el premio depende de que la palabra suene bien, un peque con dislalia se oye fallar una y otra vez. Se frustra antes de haber aprendido a COLOCAR la boca, que es el paso anterior. Y un niño frustrado deja de intentarlo, que es lo único que no nos podemos permitir.',
      },
      {
        icon: '📷',
        heading: 'La cámara mira, no graba',
        body: 'En estos juegos la cámara frontal funciona como un sensor de movimiento: mira si redondea los labios, si gira la cabeza hacia un sonido o si sostiene la mirada en un dibujo. Ninguna imagen se guarda ni sale del teléfono, y no reconoce la cara de nadie: solo mide gestos.',
      },
      {
        icon: '🚗',
        heading: 'El coche avanza mientras aguanta',
        body: 'El coche no salta de golpe al final: acelera POCO A POCO mientras tu peque mantiene la boquita de beso. Ese avance gradual es el que le enseña qué está haciendo bien. Y si pierde el gesto un momento, el progreso baja un poco pero no vuelve a cero: empezar de cero cada vez es la mejor forma de que no lo consiga nunca.',
      },
      {
        icon: '🤫',
        heading: 'Y el micrófono, apagado',
        body: 'En dos de los tres juegos el micrófono está apagado a propósito. Primero se consolida el gesto motor; pedirle el sonido viene después. No es que la app "se olvide" de escuchar: es el objetivo terapéutico.',
      },
    ],
    quiz: [
      {
        prompt: 'En los juegos de cámara, el premio aparece cuando…',
        options: [
          'Pasa un rato jugando',
          'El peque hace el gesto de la boca que se le pide',
          'Un adulto pulsa un botón',
        ],
        answer: 1,
        rationale: 'El refuerzo está atado SOLO a la conducta motora. Ni el tiempo ni el adulto pueden dispararlo: por eso el niño aprende exactamente qué le premió.',
      },
      {
        prompt: '¿Qué pasa con las imágenes de la cámara?',
        options: [
          'Se guardan para revisarlas luego',
          'Se envían al logopeda',
          'Se analizan al instante y se descartan, sin salir del teléfono',
        ],
        answer: 2,
        rationale: 'No hay grabación en ningún momento. Solo se conservan números: grados, milisegundos y proporciones.',
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

  {
    id: 'dlx-alerta',
    domain: 'dislexia',
    track: 'desarrollo',
    icon: '🚦',
    title: 'Señales para estar atentos',
    summary: 'Detectar pronto abre la puerta a apoyar a tiempo.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🔎',
        heading: 'Pistas antes de leer',
        body: 'Antes de aprender a leer, algunas señales invitan a observar: le cuesta aprender rimas o canciones, confunde palabras parecidas, tarda en aprender los nombres de las letras o los colores, o le cuesta encontrar la palabra que busca ("eso… la cosa esa").',
      },
      {
        icon: '📖',
        heading: 'Pistas al empezar a leer',
        body: 'Ya con la lectura: lee muy despacio y con mucho esfuerzo, cambia el orden de las letras, adivina palabras por el contexto, o evita leer en voz alta. Un solo indicio no diagnostica nada; el diagnóstico lo hace un profesional. Tú aportas observaciones útiles.',
      },
    ],
    quiz: [
      {
        prompt: 'Ante varias señales de alerta de dislexia, lo adecuado es…',
        options: ['Diagnosticarla en casa', 'Observar, anotar y consultar con un profesional', 'Esperar sin decir nada'],
        answer: 1,
        rationale: 'La familia detecta y aporta ejemplos; el diagnóstico corresponde al profesional.',
      },
    ],
  },
  {
    id: 'dlx-rimas',
    domain: 'dislexia',
    track: 'desarrollo',
    icon: '🎶',
    title: 'Rimas, sílabas y sonido inicial',
    summary: 'Tres juegos orales que preparan el cerebro lector.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🥁',
        heading: 'Contar sílabas con el cuerpo',
        body: 'Dar palmas, saltos o pasos por cada sílaba ("ca-ba-llo", tres) hace visible que las palabras se parten en trozos. Es el primer nivel de segmentar el habla, y se juega en cualquier momento: en el coche, en la cola del súper.',
      },
      {
        icon: '🎵',
        heading: 'Buscar rimas y sonido inicial',
        body: '"¿Qué rima con gato? Pa-to, za-pa-to…". Y también: "¿qué empieza como sol? So-pa, so-l-dado". Aislar el primer sonido y encontrar rimas afina el oído fonológico, el mejor cimiento para descifrar las letras después.',
      },
    ],
    quiz: [
      {
        prompt: 'Dar palmas por cada sílaba ayuda al niño a…',
        options: ['Escribir más rápido', 'Segmentar las palabras en sonidos', 'Memorizar el abecedario'],
        answer: 1,
        rationale: 'Segmentar en sílabas es un paso clave de la conciencia fonológica que sostiene la lectura.',
      },
    ],
  },
  {
    id: 'dlx-lectura-compartida',
    domain: 'dislexia',
    track: 'mediada',
    icon: '📚',
    title: 'Leer juntos sin presión',
    summary: 'Compartir el cuento protege las ganas de leer.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🤝',
        heading: 'La lectura es un plan agradable',
        body: 'Para un niño con dificultades, leer puede volverse una batalla. Cámbialo: lee tú la mayor parte y deja que él aporte lo que pueda (una palabra repetida, el final de la frase, señalar dibujos). El objetivo hoy es disfrutar la historia juntos, no rendir.',
      },
      {
        icon: '❤️',
        heading: 'Cuida la autoestima lectora',
        body: 'Nunca le hagas leer en voz alta delante de otros si le cuesta; eso deja huella. Celebra el esfuerzo, no solo el acierto. Un niño que asocia los libros con un rato cálido contigo conserva la motivación que necesitará para el trabajo específico con el especialista.',
      },
    ],
    quiz: [
      {
        prompt: 'Con un niño al que le cuesta leer, en la lectura compartida conviene…',
        options: ['Que lea él solo en voz alta ante todos', 'Leer tú la mayor parte y disfrutar juntos', 'Corregir cada error al momento'],
        answer: 1,
        rationale: 'Proteger el placer de leer preserva la motivación, base del trabajo posterior.',
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
  {
    id: 'tea-visual',
    domain: 'tea',
    track: 'mediada',
    icon: '🖼️',
    title: 'Apoyos visuales',
    summary: 'Lo que se ve permanece; lo que se dice, vuela.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '📌',
        heading: 'Ver ayuda a comprender',
        body: 'Muchos niños del espectro procesan mejor lo visual que lo auditivo. Una foto, un pictograma o un dibujo sencillo acompañando a la palabra hace la información más clara y estable: la imagen sigue ahí aunque el sonido ya haya pasado.',
      },
      {
        icon: '🗂️',
        heading: 'Agendas y secuencias',
        body: 'Una tira de pictogramas con "primero… luego… después" convierte una rutina en algo predecible y visible. El niño ve qué toca y qué viene, y muchas veces la señala él mismo. Reduce la ansiedad y, de paso, es un soporte de comunicación.',
      },
      {
        icon: '🔧',
        heading: 'Sencillos y consistentes',
        body: 'No hace falta material caro: valen fotos reales o dibujos claros, siempre los mismos para cada cosa. La consistencia es la clave; cambiar el símbolo cada día rompe la referencia. Empieza por dos o tres momentos del día y crece poco a poco.',
      },
    ],
    quiz: [
      {
        prompt: 'Los apoyos visuales ayudan sobre todo porque…',
        options: ['Son más bonitos', 'La información permanece y no depende de recordar lo dicho', 'Sustituyen al lenguaje para siempre'],
        answer: 1,
        rationale: 'La imagen es estable en el tiempo, a diferencia del sonido, y descarga la memoria auditiva.',
      },
    ],
  },
  {
    id: 'tea-pedir',
    domain: 'tea',
    track: 'tpr',
    icon: '🙌',
    title: 'Enseñar a pedir',
    summary: 'Comunicar para conseguir algo es la función más potente.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🎯',
        heading: 'Pedir abre la comunicación',
        body: 'La petición es la puerta de entrada: cuando el niño descubre que un gesto, un pictograma o una palabra logran que le des lo que quiere, la comunicación cobra sentido para él. Antes que nombrar colores o contar, prioriza que aprenda a PEDIR lo que le importa.',
      },
      {
        icon: '⏸️',
        heading: 'Crea la oportunidad',
        body: 'Deja su juguete preferido a la vista pero fuera de alcance, o dale la merienda a trocitos. Esas pequeñas "pausas provocadas" generan un motivo real para comunicarse. Espera su señal, y en cuanto pida —como sea— responde al instante para que aprenda que comunicar funciona.',
      },
    ],
    quiz: [
      {
        prompt: 'Al enseñar a comunicar en TEA, conviene priorizar…',
        options: ['Que nombre muchos objetos', 'Que aprenda a pedir lo que quiere', 'Que repita frases largas'],
        answer: 1,
        rationale: 'La petición da sentido inmediato a comunicar: obtiene algo deseado, lo que refuerza el intento.',
      },
    ],
  },
  {
    id: 'tea-intereses',
    domain: 'tea',
    track: 'desarrollo',
    icon: '🚂',
    title: 'Sus intereses son la puerta',
    summary: 'Lo que le apasiona es el mejor punto de encuentro.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '💡',
        heading: 'Únete a su mundo',
        body: 'Si le fascinan los trenes, los dinosaurios o girar ruedas, no lo veas como un obstáculo: es tu vía de entrada. Sentarte a su lado y compartir ESE interés, en sus términos, construye la conexión desde la que después surge la comunicación.',
      },
      {
        icon: '🌉',
        heading: 'Del interés al intercambio',
        body: 'Desde su tema favorito puedes tender puentes: nombrar, esperar turnos, introducir una palabra nueva, provocar una petición. Partir de lo que ya le motiva hace que el aprendizaje no sea una imposición, sino una prolongación de su juego.',
      },
    ],
    quiz: [
      {
        prompt: 'Los intereses intensos del niño conviene tratarlos como…',
        options: ['Algo que hay que eliminar', 'Una puerta de entrada para conectar y comunicar', 'Un premio solo al final'],
        answer: 1,
        rationale: 'Partir de su motivación crea conexión y contextos naturales de comunicación.',
      },
    ],
  },
  // ================================================================== SIGNOS
  // Lengua de Signos Española (LSE). Módulo propuesto por las logopedas de
  // ACOPROS tras la validación de julio de 2026.
  //
  // Dos advertencias que este banco asume por escrito:
  //
  // 1. UN DIBUJO NO ENSEÑA UN SIGNO. Un signo combina configuración de la mano,
  //    lugar, orientación y MOVIMIENTO, más expresión facial. Una silueta
  //    estática captura los tres primeros. Por eso el módulo enseña de verdad
  //    lo que es enseñable así —el alfabeto dactilológico y los parámetros— y
  //    para el léxico signado remite a fuente signada en vez de fingir.
  //
  // 2. ESTA APP PRIORIZA LA AUDICIÓN, y hay que decirlo sin contradicciones.
  //    La cápsula «El baño de lenguaje» afirma que nombramos antes de mostrar
  //    para que el niño use la escucha. Eso sigue siendo cierto DENTRO de los
  //    ejercicios auditivo-verbales. La LSE no compite con eso: es una lengua
  //    con estatuto propio y un derecho reconocido, y la decisión de usarla es
  //    de la familia. El módulo lo explica en su primera cápsula en vez de
  //    dejar dos mensajes sueltos que parecen reñidos.
  {
    id: 'lse-que-es',
    domain: 'signos',
    track: 'desarrollo',
    icon: '🤟',
    title: 'La LSE es una lengua, no mímica',
    summary: 'Tiene gramática propia y reconocimiento legal. No es «español con las manos».',
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: '🗣️',
        heading: 'Una lengua completa, con su propia gramática',
        body: 'La Lengua de Signos Española no es español traducido a gestos: tiene su propio léxico, su orden de la frase y su morfología. Un signo no equivale a una palabra, igual que una palabra inglesa no equivale a una española. Por eso no se puede signar y hablar palabra por palabra a la vez sin romper una de las dos lenguas.',
      },
      {
        icon: '⚖️',
        heading: 'Reconocida por ley',
        body: 'La Ley 27/2007 reconoce las lenguas de signos españolas y regula los medios de apoyo a la comunicación oral. La LSE se usa en el Estado salvo en Cataluña, que tiene la suya propia (LSC). No es un recurso «de último recurso»: es una lengua con estatuto legal.',
      },
      {
        icon: '🧭',
        heading: 'Y esta app prioriza la audición: ¿cómo encaja?',
        body: 'Los ejercicios auditivo-verbales de Valeria dan prioridad al oído a propósito: nombramos antes de mostrar para que el niño entrene la escucha. Eso sigue valiendo dentro de esos ejercicios. La LSE es otra cosa: una lengua a la que tu hijo puede tener derecho y acceso, y cuya adopción decidís la familia y el equipo clínico. Este módulo te da una base para entenderla, no una instrucción de sustituir nada.',
      },
    ],
    quiz: [
      {
        prompt: 'La Lengua de Signos Española es…',
        options: ['Español representado con gestos', 'Una lengua con gramática propia', 'Un sistema de apoyo sin estructura'],
        answer: 1,
        rationale: 'Tiene léxico, orden de frase y morfología propios: no es una traducción gestual del español.',
      },
      {
        prompt: '¿Qué norma reconoce las lenguas de signos españolas?',
        options: ['La Ley 27/2007', 'No hay norma que las reconozca', 'Solo normativa autonómica'],
        answer: 0,
        rationale: 'La Ley 27/2007 las reconoce y regula los medios de apoyo a la comunicación oral.',
      },
    ],
  },
  {
    id: 'lse-no-frena',
    domain: 'signos',
    track: 'desarrollo',
    icon: '🌱',
    title: '¿Signar retrasa el habla?',
    summary: 'Es el miedo más repetido de las familias. Conviene responderlo con precisión.',
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: '❓',
        heading: 'La pregunta que hace casi todo el mundo',
        body: 'Muchas familias temen que, si el niño dispone de signos, «se acomode» y deje de esforzarse en hablar. Es una preocupación razonable y merece una respuesta clara, no un «no te preocupes».',
      },
      {
        icon: '🧠',
        heading: 'Lo que se observa: el acceso temprano a una lengua es lo que importa',
        body: 'Lo que el desarrollo del lenguaje necesita es acceso TEMPRANO y COMPLETO a alguna lengua. Un niño sordo sin acceso pleno a lengua alguna en sus primeros años es el escenario de riesgo real. Disponer de una lengua signada le da vocabulario, turnos de conversación y capacidad de pedir mucho antes de que el habla esté disponible.',
      },
      {
        icon: '🤝',
        heading: 'No es «o una o la otra»',
        body: 'Signar y trabajar la audición no son excluyentes. Muchas familias hacen las dos cosas: terapia auditivo-verbal para el habla y signos para comunicarse mientras esta llega. Lo que sí conviene evitar es la ambigüedad: cada persona adulta debe tener claro qué lengua usa con el niño y cuándo.',
      },
      {
        icon: '👨‍⚕️',
        heading: 'Esta decisión no la toma una app',
        body: 'Qué combinación conviene a tu hijo depende de su audición, de su edad, de sus dispositivos y de vuestro entorno. Es una decisión del equipo clínico con la familia. Valeria te forma para participar en esa conversación con criterio, no para sustituirla.',
      },
    ],
    quiz: [
      {
        prompt: '¿Cuál es el escenario de riesgo real para el desarrollo del lenguaje?',
        options: ['Aprender signos y habla a la vez', 'No tener acceso pleno a NINGUNA lengua en los primeros años', 'Empezar a signar antes de los dos años'],
        answer: 1,
        rationale: 'La privación de lengua en la primera infancia es lo que compromete el desarrollo, no la exposición a dos lenguas.',
      },
      {
        prompt: 'Sobre combinar signos y trabajo auditivo:',
        options: ['Son incompatibles', 'Se pueden combinar, y la decisión es del equipo clínico con la familia', 'Los signos deben retirarse al empezar la terapia auditiva'],
        answer: 1,
        rationale: 'No son excluyentes; la combinación adecuada depende del caso y la decide el equipo con la familia.',
      },
    ],
  },
  {
    id: 'lse-parametros',
    domain: 'signos',
    track: 'desarrollo',
    icon: '🧩',
    title: 'De qué está hecho un signo',
    summary: 'Configuración, lugar, orientación y movimiento. Cambia uno y cambia el significado.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '✋',
        heading: 'Cuatro parámetros y una cara',
        body: 'Un signo combina cuatro cosas: la CONFIGURACIÓN de la mano (su forma), el LUGAR donde se hace, la ORIENTACIÓN de la palma y el MOVIMIENTO. A eso se suman los componentes no manuales: la expresión facial y la mirada, que pueden cambiar por completo lo que dices.',
        figure: 'mano-b',
      },
      {
        icon: '🔀',
        heading: 'Cambiar un parámetro cambia la palabra',
        body: 'Igual que en el habla «pata» y «bata» solo se diferencian en un sonido, dos signos pueden diferenciarse en un solo parámetro. Hacer el signo en el sitio equivocado o con la palma girada no es un acento: puede ser otra palabra, o ninguna.',
        figure: 'mano-o',
      },
      {
        icon: '🎬',
        heading: 'Y por eso un dibujo no basta',
        body: 'Un dibujo estático puede enseñarte la configuración, el lugar y la orientación. NO puede enseñarte el movimiento, que es el cuarto parámetro y a menudo el decisivo. Este módulo dibuja las configuraciones porque son fijas; para el léxico signado necesitas ver a alguien signando: vídeo, un curso o —lo mejor— una persona sorda signante.',
        figure: 'dos-manos',
      },
    ],
    quiz: [
      {
        prompt: '¿Cuál de estos NO puede transmitir un dibujo estático?',
        options: ['La configuración de la mano', 'El movimiento', 'La orientación de la palma'],
        answer: 1,
        rationale: 'El movimiento es el parámetro que exige ver el signo en marcha; por eso el módulo remite a fuente signada.',
      },
      {
        prompt: 'Si haces un signo con la configuración correcta pero en otro lugar del cuerpo…',
        options: ['Es un acento regional, se entiende igual', 'Puede ser otro signo distinto o ninguno', 'No importa mientras la cara acompañe'],
        answer: 1,
        rationale: 'El lugar de articulación es un parámetro: cambiarlo puede cambiar el significado.',
      },
    ],
  },
  {
    id: 'lse-dactilologico',
    domain: 'signos',
    track: 'tpr',
    icon: '🔤',
    title: 'El alfabeto dactilológico',
    summary: 'Deletrear con la mano. Lo primero que de verdad puedes practicar con un dibujo.',
    minutes: 3,
    xp: 25,
    slides: [
      {
        icon: '📇',
        heading: 'Para qué sirve deletrear',
        body: 'El alfabeto dactilológico representa cada letra con una configuración de mano. No sustituye a la LSE: se usa para nombres propios, marcas, siglas y palabras que aún no conoces signadas. Es la puerta de entrada natural, porque casi todas sus configuraciones son POSTURAS FIJAS y se pueden aprender de un dibujo.',
      },
      {
        icon: '🅰️',
        heading: 'A · puño con el pulgar al costado',
        body: 'Cierra los cuatro dedos sobre la palma y deja el pulgar estirado pegado al lateral del índice, apuntando hacia arriba. Es la base de varias letras: fíjate en dónde queda el pulgar.',
        figure: 'mano-a',
      },
      {
        icon: '🅱️',
        heading: 'B · mano plana con el pulgar cruzado',
        body: 'Dedos juntos y estirados hacia arriba, palma al frente, y el pulgar cruzado sobre la palma. La diferencia con una mano abierta cualquiera está justo en ese pulgar.',
        figure: 'mano-b',
      },
      {
        icon: '🇨',
        heading: 'C · la mano dibuja la letra',
        body: 'Curva los dedos y el pulgar como si sujetaras un vaso ancho: la mano vista de lado forma una C. Es una de las letras que se reconocen solas, porque la forma imita el trazo.',
        figure: 'mano-c',
      },
      {
        icon: '🇱',
        heading: 'L · índice arriba, pulgar en ángulo',
        body: 'Estira el índice hacia arriba y el pulgar hacia el lado, formando un ángulo recto; el resto de dedos, cerrados. Otra letra que imita su trazo.',
        figure: 'mano-l',
      },
      {
        icon: '🇻',
        heading: 'V · índice y corazón separados',
        body: 'Estira índice y corazón en uve, separados entre sí, con los demás dedos cerrados y el pulgar sujetándolos. Cuidado: juntar los dos dedos ya es otra letra.',
        figure: 'mano-v',
      },
      {
        icon: '🔠',
        heading: 'El abecedario completo',
        body: 'Aquí tienes las 27 configuraciones, de la A a la Z. Las cuatro marcadas con ↻ —J, Ñ, X y Z— no son solo una postura: llevan un trazo o un vaivén, y la flecha verde te indica hacia dónde va. Esas cuatro apréndelas de un vídeo o de una persona signante; el dibujo solo te dice de dónde parte la mano. Deja esta pantalla abierta mientras deletreas: es el panel de consulta del módulo.',
        chart: 'dactilologico',
      },
      {
        icon: '🪞',
        heading: 'Cómo practicarlo',
        body: 'Deletrea tu nombre delante del espejo, despacio, hasta que las manos vayan solas. Empieza por las letras de su nombre, no por la A: son las que vais a usar de verdad. Un buen ejercicio con tu hijo es deletrear su nombre cada día hasta que lo reconozca.',
      },
    ],
    quiz: [
      {
        prompt: '¿Para qué se usa principalmente el alfabeto dactilológico?',
        options: ['Para sustituir a la LSE', 'Para nombres propios, siglas y palabras sin signo conocido', 'Solo para enseñar a niños'],
        answer: 1,
        rationale: 'Es una herramienta dentro de la LSE, no un sustituto de ella.',
      },
      {
        prompt: '¿Por qué el alfabeto es lo primero que se puede aprender de un dibujo?',
        options: ['Porque casi todas sus configuraciones son posturas fijas', 'Porque es más importante que el léxico', 'Porque no necesita las manos'],
        answer: 0,
        rationale: 'Al ser posturas estáticas, un dibujo las transmite; los signos con movimiento no.',
      },
      {
        prompt: 'En el panel del abecedario, ¿qué significa la marca ↻ de la J, la Ñ, la X y la Z?',
        options: ['Que son letras poco frecuentes', 'Que llevan movimiento y el dibujo solo muestra de dónde parte la mano', 'Que se hacen con las dos manos'],
        answer: 1,
        rationale: 'Su identidad está en el trazo: esas cuatro pídelas en vídeo o a una persona signante.',
      },
    ],
  },
  {
    id: 'lse-primeros-signos',
    domain: 'signos',
    track: 'tpr',
    icon: '🙌',
    title: 'Primeros signos con utilidad real',
    summary: 'Pocos signos, elegidos porque le sirven para PEDIR desde el primer día.',
    minutes: 3,
    xp: 25,
    slides: [
      {
        icon: '🎯',
        heading: 'Elige por utilidad, no por cantidad',
        body: 'Los primeros signos que merecen la pena no son los colores ni los animales: son los que le permiten CONSEGUIR algo. «Más», «comer», «beber», «dormir», «ayuda», «acabado». Un niño que puede pedir deja de tener que llorar para que le entiendan, y eso baja la frustración de toda la casa.',
        figure: 'dos-manos',
      },
      {
        icon: '👀',
        heading: 'Que te vea la cara',
        body: 'Signa siempre donde tu hijo te vea a ti y al objeto sin tener que elegir. Agáchate a su altura, asegúrate de que te mira ANTES de signar, y deja el objeto cerca de tu cara. Si signas mientras él mira a otro lado, no has comunicado nada.',
        figure: 'mano-indice',
      },
      {
        icon: '🔁',
        heading: 'Signa y habla a la vez, en la misma frase corta',
        body: 'Al principio, di la palabra y haz el signo a la vez, con frases muy cortas: «¿MÁS?», «a COMER». Así el signo y el sonido quedan unidos al mismo significado. Recuerda que esto es comunicación bimodal de apoyo, no LSE gramaticalmente completa: son cosas distintas y conviene no confundirlas.',
      },
      {
        icon: '⏳',
        heading: 'Y espera',
        body: 'Después de signar, haz una pausa larga —cuenta hasta cinco— mirándole con expectación. La tentación es resolverle la petición enseguida. Ese silencio es exactamente el espacio donde aparece su primer intento, sea un signo, un gesto o un sonido. Celebra cualquiera de los tres.',
        figure: 'mano-plana-arriba',
      },
    ],
    quiz: [
      {
        prompt: '¿Qué signos conviene enseñar primero?',
        options: ['Los colores y los números', 'Los que le permiten pedir algo (más, comer, ayuda)', 'Los animales, porque le gustan'],
        answer: 1,
        rationale: 'Los signos que sirven para pedir dan control comunicativo inmediato y reducen la frustración.',
      },
      {
        prompt: 'Antes de signar algo a tu hijo, lo primero es…',
        options: ['Asegurarte de que te está mirando', 'Repetirlo tres veces', 'Hacerlo lo más rápido posible'],
        answer: 0,
        rationale: 'La LSE entra por la vista: sin mirada compartida, el signo no llega.',
      },
      {
        prompt: 'Signar y hablar a la vez con frases cortas es…',
        options: ['Lengua de Signos Española completa', 'Comunicación bimodal de apoyo, que no es lo mismo que la LSE', 'Un error que hay que evitar siempre'],
        answer: 1,
        rationale: 'Es un apoyo útil al principio, pero no equivale a la LSE, que tiene gramática propia.',
      },
    ],
  },
  {
    id: 'lse-donde-aprender',
    domain: 'signos',
    track: 'mediada',
    icon: '🧑‍🏫',
    title: 'Dónde se aprende de verdad',
    summary: 'Este módulo es una puerta de entrada. La lengua se aprende con personas sordas.',
    minutes: 2,
    xp: 20,
    slides: [
      {
        icon: '🚪',
        heading: 'Lo que este módulo es',
        body: 'Una puerta de entrada: qué es la LSE, de qué está hecho un signo, cómo deletrear y qué signos abren la comunicación con un niño pequeño. Es suficiente para empezar a comunicaros y para decidir con criterio si queréis seguir.',
      },
      {
        icon: '🙅',
        heading: 'Lo que no es',
        body: 'No es un curso de LSE, y ninguna app de dibujos puede serlo. Te faltan el movimiento, la expresión facial, la gramática del espacio y —sobre todo— la conversación real, que es donde se aprende cualquier lengua.',
      },
      {
        icon: '🧑‍🤝‍🧑',
        heading: 'Busca personas sordas signantes',
        body: 'La mejor fuente es la comunidad sorda: asociaciones de personas sordas, cursos oficiales de LSE y profesorado sordo. Aprender la lengua de alguien que la tiene como propia es distinto de aprenderla de un libro, y además abre a tu hijo una comunidad, no solo un vocabulario.',
      },
      {
        icon: '📋',
        heading: 'Habla con tu equipo clínico',
        body: 'Cuéntale a la logopeda que estáis empezando con signos. No para pedir permiso, sino para que el plan sea uno solo: qué se trabaja en la sesión, qué en casa y cómo se registran los avances de cada canal.',
      },
    ],
    quiz: [
      {
        prompt: '¿Cuál es la mejor forma de aprender LSE de verdad?',
        options: ['Con una app de dibujos', 'Con personas sordas signantes y cursos oficiales', 'Leyendo un diccionario de signos'],
        answer: 1,
        rationale: 'Una lengua se aprende en conversación real; la comunidad sorda es además la puerta a un entorno, no solo a un léxico.',
      },
      {
        prompt: 'Si empezáis con signos en casa, conviene…',
        options: ['No decírselo al equipo clínico para no interferir', 'Contárselo, para que el plan sea uno solo', 'Esperar a que la logopeda lo proponga'],
        answer: 1,
        rationale: 'Un plan compartido evita que el trabajo de casa y el de la sesión se contradigan.',
      },
    ],
  },

  // =================================================================== MITOS
  // Sección transversal «Mitos y verdades». Toca lenguaje, autismo y dislexia,
  // y por eso NO cuelga de esos silos: la familia no llega buscando un dominio
  // clínico, llega con una frase que le dijeron en la casa, en el colmado o en
  // la puerta del colegio, y necesita un sitio donde buscarla tal cual.
  //
  // Tres reglas de escritura de esta sección:
  //   1. Cada cápsula sigue el mismo esqueleto: 🚫 el mito · ✅ lo que se sabe ·
  //      🎯 qué hacer con eso mañana. Sin el tercer paso, desmontar una creencia
  //      solo deja a la familia sin plan.
  //   2. NO se ridiculiza a quien lo cree. Casi todos estos mitos los repiten
  //      abuelas, vecinas y a veces profesionales, con buena intención. El tono
  //      es «se pensaba esto, hoy sabemos esto otro», nunca «qué ignorancia».
  //   3. Ni un diagnóstico ni una promesa de resultado (regla MDR de la app):
  //      donde toca decidir, decide el profesional, y aquí solo se dice qué
  //      observar y con quién hablarlo.
  {
    id: 'mito-imitacion',
    domain: 'mitos',
    track: 'mitos',
    icon: '🦜',
    title: '«Se aprende a hablar imitando»',
    summary: 'El loro imita y no habla. El niño no copia: construye.',
    minutes: 3,
    xp: 25,
    slides: [
      {
        icon: '🚫',
        heading: 'El mito: "repite conmigo"',
        body: 'Es la creencia más extendida de todas: que hablar se aprende copiando, y que por tanto la tarea del adulto es hacer repetir. De ahí salen las sesiones de "di agua… di agua… di AGUA" que acaban con el niño callado y el adulto agotado.',
      },
      {
        icon: '✅',
        heading: 'La realidad: se aprende por estimulación',
        body: 'El lenguaje se construye con ESTIMULACIÓN: oír muchísimo lenguaje con sentido, en situaciones reales, y tener con quién ir y venir por turnos. La imitación es una herramienta más dentro de ese baño de lenguaje, no el motor. Un loro imita a la perfección y no tiene lenguaje; un niño entiende cientos de palabras antes de decir la primera.',
      },
      {
        icon: '🔬',
        heading: 'La prueba está en sus errores',
        body: '¿Has oído "yo no sabo", "se ha rompido" o "cabo dos pies"? Nadie en casa habla así: no lo ha copiado de nadie. Lo ha DEDUCIDO aplicando una regla que su cerebro extrajo del lenguaje que recibe. Esos errores tan graciosos son la mejor evidencia de que ahí dentro se está construyendo un sistema, no archivando copias.',
      },
      {
        icon: '🎯',
        heading: 'Qué cambia mañana en casa',
        body: 'Cambia el reparto: menos exigirle producir y más darle materia prima. Narra lo que hacéis, comenta lo que él mira, espera en silencio unos segundos y amplía lo que diga ("agua" → "sí, agua fría"). Pedirle que repita sigue valiendo como MODELO puntual —"mira: a-gua"—, pero como método no sostiene el aprendizaje.',
      },
    ],
    quiz: [
      {
        prompt: '🦜 "Un niño aprende a hablar copiando lo que oye, como un loro."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'Copiar es una herramienta más. El lenguaje se construye con estimulación e interacción: input abundante, con sentido y por turnos.',
      },
      {
        prompt: 'Que tu peque diga "se ha rompido" demuestra que…',
        options: ['🧠 Está deduciendo reglas del idioma', '🙈 Lo ha copiado mal de alguien', '⚠️ Necesita más ejercicios de repetición'],
        answer: 0,
        rationale: 'Nadie dice "rompido" en casa: lo ha generado aplicando la regla del participado regular. Es señal de un sistema en construcción.',
      },
      {
        prompt: 'Tu peque señala el perro y dice "peo". La respuesta más estimuladora es…',
        options: ['🔁 "Repite: pe-rro. Otra vez"', '🌟 "¡Sí! Un PERRO grande y peludo"', '🤫 Esperar a que lo diga bien para contestar'],
        answer: 1,
        rationale: 'Devolverle la palabra bien dicha y ampliada le da modelo y significado sin cortar la comunicación. Es el recast de la terapia mediada.',
      },
    ],
  },
  {
    id: 'mito-esperar',
    domain: 'mitos',
    track: 'mitos',
    icon: '⏳',
    title: '«Ya hablará, dale tiempo»',
    summary: 'Esperar también es una decisión, y no siempre es gratis.',
    minutes: 3,
    xp: 25,
    slides: [
      {
        icon: '🚫',
        heading: 'El mito: esperar no cuesta nada',
        body: '"Los varones hablan más tarde", "su papá habló a los cuatro y mira", "cuando entre al colegio se le suelta la lengua". Son frases dichas con cariño y para tranquilizar. El problema no es la frase: es que convierte la espera en la opción por defecto, la única que nadie tiene que justificar.',
      },
      {
        icon: '✅',
        heading: 'La realidad: unos alcanzan y otros no',
        body: 'Es verdad que una parte de los niños que hablan tarde se pone al día sola. Lo que NO se puede es saber de antemano cuál de los dos casos tienes delante. Y mientras se espera, sigue corriendo la etapa en la que el cerebro aprende lenguaje con menos esfuerzo. Esperar no es neutral: es apostar.',
      },
      {
        icon: '⚖️',
        heading: 'Qué se pierde y qué se arriesga',
        body: 'Consultar cuando no hacía falta te cuesta una cita y una tranquilidad. No consultar cuando sí hacía falta cuesta meses de la mejor ventana de aprendizaje. Cuando las dos equivocaciones son tan distintas de caras, la prudente está bastante clara.',
      },
      {
        icon: '🎯',
        heading: 'Qué hacer sin alarmarte',
        body: 'No hace falta elegir entre "esperar" y "asustarse". Observa y anota ejemplos concretos (qué dice, cuánto se le entiende, si te mira y busca comunicarse), estimula en casa desde ya —eso beneficia a cualquier niño, hable como hable— y comparte lo anotado con tu pediatra o logopeda. Quien decide si hay que intervenir es el profesional, no la app ni el vecino.',
      },
    ],
    quiz: [
      {
        prompt: '⏳ "Si a los dos años apenas dice palabras, lo mejor es esperar a los cuatro sin hacer nada."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'Algunos se ponen al día solos, pero no hay forma de saber cuáles por adelantado, y mientras tanto pasa la etapa en la que aprender lenguaje cuesta menos.',
      },
      {
        prompt: 'Ante la duda, la actitud más útil de la familia es…',
        options: ['😰 Buscar el diagnóstico en internet', '📝 Observar, anotar ejemplos y consultar', '🤐 Callar para no preocupar a nadie'],
        answer: 1,
        rationale: 'La familia aporta las observaciones del día a día; el diagnóstico y la decisión de intervenir son del profesional.',
      },
      {
        prompt: '"Los niños varones siempre hablan más tarde que las niñas."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'Hay diferencias medias muy pequeñas entre grupos, y no sirven para explicar el caso de tu hijo. Usarlas como excusa retrasa la consulta.',
      },
    ],
  },
  {
    id: 'mito-pantallas',
    domain: 'mitos',
    track: 'mitos',
    icon: '📺',
    title: '«Con los videos aprende a hablar»',
    summary: 'La pantalla habla mucho, pero no te responde a ti.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🚫',
        heading: 'El mito: mucho input es mucho aprendizaje',
        body: 'Parece lógico: si el lenguaje se aprende oyendo, un canal infantil que nombra colores y animales seis horas al día debería enseñar muchísimo. Y además el peque se queda quieto y contento, que no es poca cosa en una casa con prisa.',
      },
      {
        icon: '✅',
        heading: 'La realidad: falta la otra mitad',
        body: 'El lenguaje no se aprende solo por oír: se aprende oyendo A ALGUIEN QUE TE RESPONDE. Lo que la pantalla no hace es seguir tu mirada, esperar tu turno, repetir cuando no entendiste ni nombrar justo lo que a ti te interesaba en ese momento. Sin ese ida y vuelta, el vocabulario del video se queda en el video. Y de fondo, con la tele encendida, los adultos de la casa hablan menos.',
      },
      {
        icon: '🎯',
        heading: 'Qué hacer con la pantalla',
        body: 'No hay que demonizarla: hay que acompañarla. Míralo con él y conviértelo en conversación ("¡uy, se cayó!", "¿dónde está el gato?"). Cinco minutos de dibujos comentados contigo valen más que una hora en soledad. Es exactamente el criterio de Valeria+: la tablet propone, pero quien enseña eres tú.',
      },
    ],
    quiz: [
      {
        prompt: '📺 "Ver muchos dibujos que nombran cosas hace que el niño amplíe su vocabulario."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'Sin alguien que responda, siga la mirada y ajuste lo que dice, el lenguaje de la pantalla no se transfiere al niño pequeño.',
      },
      {
        prompt: 'Lo que la pantalla NO puede darle a tu peque es…',
        options: ['🎨 Colores y sonidos', '🏓 Turnos y respuestas ajustadas a él', '🎵 Canciones'],
        answer: 1,
        rationale: 'El ida y vuelta contingente —te miro, te espero, te contesto a ti— es lo que construye lenguaje, y es justo lo que un video no hace.',
      },
      {
        prompt: 'Si ponéis dibujos, lo que los vuelve útiles es…',
        options: ['👀 Verlos juntos y comentarlos', '⏱️ Que duren más rato', '🔊 Subir el volumen'],
        answer: 0,
        rationale: 'Con un adulto que comenta y pregunta, la pantalla pasa a ser un contexto de conversación más.',
      },
    ],
  },
  {
    id: 'mito-bilingue',
    domain: 'mitos',
    track: 'mitos',
    icon: '🌍',
    title: '«Dos idiomas lo confunden»',
    summary: 'El bilingüismo no causa trastornos del lenguaje.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🚫',
        heading: 'El mito: mejor un idioma, y luego ya veremos',
        body: 'Es un consejo que muchas familias migrantes reciben incluso de profesionales: "háblenle solo español, que lo van a confundir". Y duele, porque a menudo significa pedirle a una madre que le hable a su hijo en una lengua que no es la suya.',
      },
      {
        icon: '✅',
        heading: 'La realidad: dos lenguas caben de sobra',
        body: 'Crecer con dos lenguas no causa un trastorno del lenguaje ni lo empeora. Un niño bilingüe puede tener menos vocabulario en CADA lengua por separado, pero sumando las dos está donde le toca. Y mezclarlas en una misma frase no es un lío: es un recurso normal, que los adultos bilingües también usan.',
      },
      {
        icon: '🔎',
        heading: 'La pista que sí importa',
        body: 'Una dificultad real del lenguaje aparece en LAS DOS lenguas, no solo en la de la escuela. Si tu peque se maneja bien en casa y solo cojea en la otra, lo más probable es que le falte exposición, no que tenga un trastorno. Por eso la evaluación debe tener en cuenta las dos lenguas: valorar solo una da una foto falsa.',
      },
      {
        icon: '🎯',
        heading: 'Qué hacer en casa',
        body: 'Háblale en la lengua en la que le cantas, le regañas y le dices que lo quieres: la calidad de la interacción importa mucho más que qué idioma sea. Y díselo al equipo clínico —qué lengua se habla, con quién y cuánto—, porque eso cambia cómo se interpreta lo que el niño hace.',
      },
    ],
    quiz: [
      {
        prompt: '🌍 "Hablarle en dos idiomas retrasa el lenguaje y hay que elegir uno."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'El bilingüismo no causa ni agrava un trastorno del lenguaje. Renunciar a la lengua materna sí empobrece la interacción en casa.',
      },
      {
        prompt: 'Que mezcle palabras de los dos idiomas en una frase es…',
        options: ['🚨 Señal de confusión', '👌 Un recurso normal en bilingües', '🛑 Motivo para dejar un idioma'],
        answer: 1,
        rationale: 'La alternancia de lenguas es habitual también en adultos bilingües competentes y no indica ningún problema.',
      },
      {
        prompt: 'Una dificultad real del lenguaje en un niño bilingüe se nota…',
        options: ['🏫 Solo en la lengua de la escuela', '🌐 En las dos lenguas', '🏠 Solo en casa'],
        answer: 1,
        rationale: 'Si solo falla una lengua, lo esperable es que sea cuestión de exposición. El trastorno afecta al sistema del lenguaje, y por tanto a las dos.',
      },
    ],
  },
  {
    id: 'mito-frenillo',
    domain: 'mitos',
    track: 'mitos',
    icon: '👅',
    title: '«Es el frenillo» (y el chupete)',
    summary: 'Casi siempre el problema no está en la boca, sino en el sistema de sonidos.',
    minutes: 2,
    xp: 25,
    slides: [
      {
        icon: '🚫',
        heading: 'El mito: hay una causa mecánica',
        body: 'Cuando a un niño no se le entiende, la primera explicación que aparece suele ser anatómica: el frenillo, el chupete, los dientes. Es una explicación tentadora porque promete una solución rápida y visible: se corta, se quita, y listo.',
      },
      {
        icon: '✅',
        heading: 'La realidad: casi siempre es fonológico',
        body: 'La mayoría de las dificultades del habla infantil no vienen de la anatomía, sino de cómo el cerebro organiza los sonidos: qué fonemas ha adquirido, cuáles simplifica y en qué posiciones. Por eso muchas familias cuentan que "le cortaron el frenillo y siguió igual": se operó lo que se veía, no lo que fallaba.',
      },
      {
        icon: '🔎',
        heading: 'Qué hay de cierto en cada cosa',
        body: 'Un frenillo verdaderamente corto existe y puede afectar a algunos sonidos y a la lactancia, pero es minoría y quien lo valora es el equipo médico junto con el logopeda, con exploración, no a ojo. Y el chupete: usado mucho tiempo puede influir en la mordida y en algunos sonidos, así que conviene ir retirándolo; pero no es la causa de un retraso del lenguaje.',
      },
      {
        icon: '🎯',
        heading: 'Qué hacer',
        body: 'Antes de plantear cualquier corte, pide una valoración logopédica del habla: qué sonidos tiene, cuáles no y cómo los sustituye. Esa evaluación es la que dice si sobra lengua o falta sistema. Y si finalmente hay indicación quirúrgica, seguirá haciendo falta terapia: la cirugía no enseña a articular.',
      },
    ],
    quiz: [
      {
        prompt: '👅 "Si no se le entiende al hablar, lo más probable es que sea el frenillo."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'La mayoría de las dificultades del habla son fonológicas: están en cómo se organizan los sonidos, no en la anatomía de la boca.',
      },
      {
        prompt: 'Antes de decidir cortar un frenillo, lo indicado es…',
        options: ['✂️ Cortarlo cuanto antes, por si acaso', '🔬 Valoración médica y logopédica del habla', '⏰ Esperar a los seis años'],
        answer: 1,
        rationale: 'La indicación se establece con exploración y valoración del habla; operar sin ella arriesga intervenir lo que no fallaba.',
      },
      {
        prompt: 'Sobre el chupete, lo correcto es…',
        options: ['😱 Causa retraso del lenguaje', '🦷 Conviene retirarlo con el tiempo por la mordida y algunos sonidos', '🤷 Da igual hasta los seis años'],
        answer: 1,
        rationale: 'El uso prolongado puede influir en la mordida y en la articulación de algunos fonemas, pero no provoca por sí solo un retraso del lenguaje.',
      },
    ],
  },
  {
    id: 'mito-tea',
    domain: 'mitos',
    track: 'mitos',
    icon: '🧩',
    title: 'Mitos sobre el autismo',
    summary: 'Ni vacunas, ni padres fríos, ni un molde único.',
    minutes: 3,
    xp: 30,
    slides: [
      {
        icon: '💉',
        heading: 'Mito 1: "lo causaron las vacunas"',
        body: 'Es falso, y se sabe con una solidez poco frecuente en ciencia: el estudio que lo insinuó en 1998 resultó fraudulento, fue retirado y su autor perdió la licencia médica. Después se ha estudiado en millones de niños en varios países sin encontrar relación alguna. El mito, sin embargo, sí ha causado daño: brotes de sarampión en niños sin vacunar.',
      },
      {
        icon: '❄️',
        heading: 'Mito 2: "es por la crianza"',
        body: 'La teoría de la "madre nevera" —padres poco afectuosos que provocarían el autismo— quedó descartada hace décadas, pero su culpa sigue viva en muchas familias. El autismo es una condición del neurodesarrollo con una base biológica importante. Ni lo causaste tú, ni tenías nada que corregir en cómo querías a tu hijo.',
      },
      {
        icon: '🙈',
        heading: 'Mito 3: "si te mira y te abraza, no es autismo"',
        body: 'El espectro es ancho de verdad. Hay niños autistas cariñosos, que miran, que abrazan y que hablan mucho; y los hay sin lenguaje oral. Que no mire no significa que no le importes: a menudo significa que mirar y escuchar a la vez le cuesta demasiado. Y al revés: la simpatía no descarta nada. Quien diagnostica es el equipo especializado, no una lista de señales sueltas.',
      },
      {
        icon: '⚠️',
        heading: 'Mito 4: "existe una cura milagrosa"',
        body: 'Dietas milagro, quelación, cámaras hiperbáricas, suplementos "desintoxicantes", lejía disfrazada de suplemento: se venden caras, no funcionan y algunas son directamente peligrosas. El autismo no es una enfermedad que se cure: es una forma de funcionar. Lo que sí ayuda —y tiene evidencia— es el apoyo a la comunicación, los ajustes del entorno y una familia que entiende a su hijo.',
      },
      {
        icon: '🎯',
        heading: 'Qué hacer con todo esto',
        body: 'Cuando te ofrezcan un tratamiento, haz tres preguntas: ¿qué estudios lo respaldan?, ¿qué riesgos tiene?, ¿qué me pasaría si no lo hago? Y consúltalo con el equipo que atiende a tu hijo antes de pagar nada. El dinero, el tiempo y la esperanza de una familia son recursos limitados: merecen ir a lo que sí funciona.',
      },
    ],
    quiz: [
      {
        prompt: '💉 "Las vacunas pueden causar autismo."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'El estudio que lo sugirió fue fraudulento y retirado. Estudios posteriores con millones de niños no han hallado ninguna relación.',
      },
      {
        prompt: '🤗 "Un niño que mira a los ojos y es cariñoso no puede ser autista."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'El espectro es muy amplio: hay niños autistas afectuosos, que miran y que hablan. El diagnóstico lo hace un equipo especializado.',
      },
      {
        prompt: 'Ante una "terapia" que promete curar el autismo con dietas o suplementos…',
        options: ['🛒 Probarla, por si acaso', '🧐 Preguntar por su evidencia y consultarlo con el equipo', '📢 Recomendarla a otras familias'],
        answer: 1,
        rationale: 'No hay cura para el autismo, y varias de esas pseudoterapias son caras y peligrosas. Lo que ayuda es el apoyo a la comunicación y al entorno.',
      },
      {
        prompt: 'Que tu hijo sea autista se debe a…',
        options: ['🧬 Factores del neurodesarrollo con base biológica', '❄️ Haber sido unos padres poco cariñosos', '📱 Demasiadas pantallas de bebé'],
        answer: 0,
        rationale: 'La teoría de la "madre nevera" está descartada desde hace décadas. La culpa que deja no ayuda a nadie, y menos al niño.',
      },
    ],
  },
  {
    id: 'mito-dislexia',
    domain: 'mitos',
    track: 'mitos',
    icon: '🔤',
    title: 'Mitos sobre la dislexia',
    summary: 'Ni vagancia, ni problema de vista, ni cosa de letras al revés.',
    minutes: 3,
    xp: 30,
    slides: [
      {
        icon: '🪞',
        heading: 'Mito 1: "escribe las letras al revés"',
        body: 'Girar la b y la d o escribir algún número en espejo es normal mientras se aprende a escribir, y en la mayoría de los niños se va solo. No es el rasgo que define la dislexia. Lo que de verdad pesa es otra cosa: la dificultad para manejar los SONIDOS de las palabras —segmentarlos, unirlos, asociarlos a su letra— y una lectura lenta y costosa que no mejora al ritmo esperado.',
      },
      {
        icon: '😤',
        heading: 'Mito 2: "es vagancia, no se esfuerza"',
        body: 'Es el mito que más daño hace, porque convierte una dificultad en un defecto de carácter. La realidad suele ser la contraria: un niño con dislexia dedica a leer mucho más esfuerzo que sus compañeros para obtener menos resultado. Si además lo llaman vago, deja de intentarlo, y entonces sí parece que no se esfuerza.',
      },
      {
        icon: '👓',
        heading: 'Mito 3: "es la vista"',
        body: 'La dislexia no es un problema de agudeza visual, y por eso no se corrige con gafas. Los filtros y lentes de colores, que se anuncian mucho, no tienen respaldo científico como tratamiento de la dislexia. Revisar la vista y el oído del niño es siempre buena idea —descarta otras causas—, pero no es el tratamiento.',
      },
      {
        icon: '🧠',
        heading: 'Mito 4: "es falta de inteligencia" y "se le quita con la edad"',
        body: 'La dislexia no guarda relación con la inteligencia: aparece en todos los niveles. Y no desaparece al crecer: lo que mejora, y mucho, es la manera de compensarla. Con intervención estructurada y sistemática sobre los sonidos y su relación con las letras, y con los apoyos adecuados en el aula, se aprende a leer y se llega a la universidad.',
      },
      {
        icon: '🎯',
        heading: 'Qué hacer',
        body: 'Separa el esfuerzo del resultado: elogia lo que hizo, no lo que le salió. Sigue leyéndole en voz alta cuentos por encima de su nivel lector, porque su comprensión y su vocabulario no tienen por qué esperar a que descifre bien. Y si sospechas, pide evaluación: los apoyos escolares (más tiempo, examen oral, no leer en público) existen y se piden con un informe.',
      },
    ],
    quiz: [
      {
        prompt: '🪞 "Escribir alguna letra al revés a los cinco años ya es dislexia."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'Las inversiones son frecuentes mientras se aprende a escribir. El núcleo de la dislexia está en el procesamiento de los sonidos y en una lectura lenta y costosa.',
      },
      {
        prompt: '😤 "Si se esforzara más, leería bien."',
        options: ['🚫 Mito', '✅ Realidad'],
        answer: 0,
        rationale: 'Suele esforzarse más que nadie para lograr menos. Llamarle vago añade daño emocional a una dificultad real.',
      },
      {
        prompt: 'Sobre las lentes y filtros de colores para la dislexia…',
        options: ['👓 Son el tratamiento de elección', '🚫 No tienen respaldo científico', '🌈 Curan la mitad de los casos'],
        answer: 1,
        rationale: 'No hay evidencia que los respalde. Lo que funciona es la intervención estructurada sobre sonidos y letras, más los apoyos escolares.',
      },
      {
        prompt: 'Con apoyo adecuado, un niño con dislexia…',
        options: ['🎓 Aprende a leer y puede llegar tan lejos como quiera', '📉 Nunca leerá con soltura', '⏳ Se le pasará solo con la edad'],
        answer: 0,
        rationale: 'La dislexia persiste, pero la compensación mejora muchísimo. No guarda relación con la inteligencia.',
      },
    ],
  },
];

export const capsulesForUiLang = (lang: UiLang = 'es'): AcademyCapsule[] =>
  lang === 'en' ? ACADEMY_CAPSULES_EN : ACADEMY_CAPSULES_ES;

export const ACADEMY_CAPSULES: AcademyCapsule[] = ACADEMY_CAPSULES_ES;

// Total global de cápsulas (todas las domains). Uso informativo/agregado.
export const ACADEMY_TOTAL = ACADEMY_CAPSULES_ES.length;

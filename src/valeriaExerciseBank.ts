// ============================================================================
// Valeria+ · Banco de ejercicios (Audición + Lenguaje) — módulo PURO de datos
// La base de datos de mini-juegos (13 Audición + 7 Lenguaje) con sus reglas
// EPT-3, rondas de contenido (VARIANTS) y sesión por defecto. Antes vivía dentro
// de ValeriaExercisePlayerScreen; se extrajo a un módulo puro para que:
//   1) el player lo consuma como antes (misma DB, sin duplicar datos), y
//   2) el corpus de voz (valeriaVoiceCorpus, build-time) pueda ENUMERAR lo que
//      estas pantallas locutan y hornear su voz neuronal (Sharvard) — hasta
//      ahora Audición y Lenguaje caían siempre a la voz del sistema.
//
// Módulo PURO: solo importa otros módulos puros de datos (valeriaExerciseMeta).
// No debe importar react-native ni expo: un script Node lo compila y ejecuta.
// ============================================================================
import { META_BY_ID } from './valeriaExerciseMeta';

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------
export type Stage = 'phrase' | 'vowels' | 'fill' | 'intruder' | 'emotions' | 'order' | 'instruction' | 'choice' | 'plural';

export interface Tile { cap: string; emoji: string; }

export interface Exercise {
  code: string;
  name: string;
  category: string;
  read: string;            // consigna que lee el tutor en voz alta
  stage: Stage;
  stageLabel?: string;
  ept: [string, string, string]; // reglas EPT-3 (1★, 2★, 3★)
  move: string;            // variante del ejercicio con movimiento corporal
  age?: string;            // edad orientativa (los evaluadores pidieron dividir por edad)
  materials?: string;      // material real necesario, anunciado ANTES de empezar
  // datos de mini-juego
  phrase?: string; phraseEmoji?: string;
  tiles?: Tile[];
  fillBefore?: string; fillAfter?: string; fillAnswer?: string; fillEmoji?: string; fillCap?: string;
  intruder?: Tile[]; intruderAnswer?: number;
  emotionFace?: string; emotionAnswer?: string;
  parts?: { role: string; cap: string; emoji: string }[]; sentence?: string;
  instrIcon?: string; instrHint?: string;
  // 'choice': escucha un audio y toca la imagen correcta (adivinanzas, género)
  choicePrompt?: string; choiceLabel?: string; choiceVoice?: 'slow' | 'tutor'; options?: Tile[]; optionAnswer?: number;
  // 'plural': tarjeta con UNO frente a tarjeta con MUCHOS
  plural?: { cap: string; capPlural: string; emoji: string };
  // registro de respuesta libre (voz o escrito) y práctica de micro dirigida
  capture?: string;
  micTarget?: string; micPrompt?: string; micAlt?: string[];
  // escenas visuales tocables con ejemplo hablado (apoyo visual de PR-2)
  scenes?: { emoji: string; label: string; say: string }[];
  // Progresión Inicial → Intermedio → Avanzado dentro de la misma sesión
  // (ejercicios de Lenguaje, protocolo ACOPROS). Si está presente, sustituye
  // a `read`/`instrIcon`/`instrHint` para cada uno de los 3 sub-pasos.
  levels?: { label: 'Inicial' | 'Intermedio' | 'Avanzado'; read: string; instrIcon: string; instrHint: string }[];
}

// ----------------------------------------------------------------------------
// Base de datos de ejercicios (13 Audición + 7 Lenguaje) con reglas EPT-3
// ----------------------------------------------------------------------------
// Código, nombre, categoría y edad vienen de la fuente única compartida con
// la pantalla de selección (valeriaExerciseMeta).
const meta = (id: string) => {
  const m = META_BY_ID[id];
  return { code: m.code, name: m.name, category: m.category, age: m.age };
};

export const DB: Record<string, Exercise> = {
  ff1: { ...meta('ff1'),
    read: 'El niño toca una imagen para oír su nombre y después toca la vocal con la que empieza. La app le dice si acertó.',
    stage: 'vowels', stageLabel: 'Une cada imagen con su vocal',
    tiles: [{ cap: 'araña', emoji: '🕷️' }, { cap: 'elefante', emoji: '🐘' }, { cap: 'isla', emoji: '🏝️' }],
    move: 'Dibujad la vocal en el aire con el brazo bien grande cada vez que acierte.',
    ept: ['Todavía no une la imagen con su vocal, ni con ayuda.', 'Acierta la vocal cuando el adulto le da una pista.', 'Une cada imagen con su vocal él solo.'] },
  ff2: { ...meta('ff2'),
    read: 'Di tú primero la palabra, cerca del niño y despacio, y anímale a repetirla. La voz de la app es solo un apoyo extra.',
    stage: 'phrase', stageLabel: 'Repite la palabra', phrase: 'ZAPATO', phraseEmoji: '👟',
    move: 'Marchad por la sala pisando fuerte una sílaba en cada paso: ZA-PA-TO.',
    ept: ['Todavía no imita el sonido o queda muy lejos de la palabra.', 'Repite la palabra después de oírtela a ti varias veces.', 'Dice la palabra él solo, con todas sus vocales claras.'] },
  ff3: { ...meta('ff3'),
    read: 'Primero pulsa 🔊 para que el niño oiga la palabra completa. Después, que toque la vocal que le falta a la palabra escrita.',
    stage: 'fill', stageLabel: 'Escucha la palabra y completa la vocal', fillBefore: 'S', fillAfter: 'L', fillAnswer: 'O', fillEmoji: '☀️', fillCap: 'sol',
    move: 'Cuando encuentre la vocal, brazos arriba formando un sol gigante.',
    ept: ['Todavía no encuentra la vocal que falta, ni con ayuda.', 'Completa la palabra si le repites el sonido o le das una pista.', 'Escucha la palabra y toca la vocal que falta él solo.'] },
  se1: { ...meta('se1'),
    read: 'Pulsa 🔊 para oír el nombre de las cuatro fichas. Tres van juntas y una no. El niño toca la que NO va con las demás.',
    stage: 'intruder', stageLabel: 'Toca la ficha que no va con las demás',
    intruder: [{ cap: 'manzana', emoji: '🍎' }, { cap: 'plátano', emoji: '🍌' }, { cap: 'uva', emoji: '🍇' }, { cap: 'coche', emoji: '🚗' }], intruderAnswer: 3,
    move: 'Si se come, tocaos la barriga; si es el intruso, ¡salto de estrella!',
    ept: ['Todavía no encuentra la ficha que no va con las demás.', 'La encuentra cuando le haces una pregunta de ayuda («¿cuáles se comen?»).', 'La encuentra él solo y explica por qué no va con las otras.'] },
  se2: { ...meta('se2'),
    read: 'Pulsa 🔊 para oír la adivinanza (o léela tú). El niño responde tocando una de las tres imágenes.',
    stage: 'choice', stageLabel: 'Escucha la adivinanza y toca la respuesta',
    choicePrompt: 'Empieza por pe, y es una fruta amarilla y alargada. ¿Qué es?', choiceLabel: 'Oír la adivinanza', choiceVoice: 'tutor',
    options: [{ cap: 'plátano', emoji: '🍌' }, { cap: 'pera', emoji: '🍐' }, { cap: 'pelota', emoji: '⚽' }], optionAnswer: 0,
    move: 'Buscad por la habitación un objeto real que empiece por la misma letra.',
    ept: ['Todavía no adivina la respuesta, ni con más pistas.', 'Acierta después de repetirle la adivinanza o darle otra pista.', 'Acierta a la primera, solo con oír la adivinanza.'] },
  se3: { ...meta('se3'),
    materials: 'Un muñeco o peluche y prendas de verdad: gorro, zapatos, camiseta…',
    read: 'Coge el muñeco y la ropa. Dale al niño una orden cada vez: «Ponle el gorro al muñeco». Cambia de prenda en cada turno.',
    stage: 'instruction', instrIcon: '🧥', instrHint: 'El niño escucha tu orden y viste al muñeco con la prenda correcta.',
    move: 'Jugad a vestirse de verdad: que traiga el gorro corriendo y se lo ponga.',
    ept: ['Todavía no reconoce las prendas ni cumple la orden.', 'Pone la prenda correcta si antes se lo enseñas tú una vez.', 'Escucha la orden y viste al muñeco él solo.'] },
  ms1: { ...meta('ms1'),
    read: 'El niño toca la tarjeta donde hay MUCHOS. Después pregúntale «¿qué son?» para que lo diga con la ese final: «gatos».',
    stage: 'plural', stageLabel: 'Toca donde hay muchos y dilo',
    plural: { cap: 'gato', capPlural: 'gatos', emoji: '🐱' },
    move: 'Un salto grande si hay UNO, muchos saltitos seguidos si hay MUCHOS.',
    ept: ['Todavía no distingue entre «uno» y «muchos».', 'Dice el plural («gatos») si tú se lo dices antes.', 'Toca donde hay muchos y dice el plural él solo.'] },
  ms2: { ...meta('ms2'),
    read: 'Pulsa 🔊 para oír la palabra. El niño toca la imagen correcta. Después jugad al revés: tú señalas una imagen y él dice la palabra.',
    stage: 'choice', stageLabel: 'Escucha la palabra y toca la imagen',
    choicePrompt: 'niña', choiceLabel: 'Oír la palabra', choiceVoice: 'slow',
    options: [{ cap: 'niño', emoji: '👦' }, { cap: 'niña', emoji: '👧' }], optionAnswer: 1,
    move: 'Un lado de la sala es "niño" y el otro "niña": ¡corre al lado correcto!',
    ept: ['Todavía confunde las palabras de chico y de chica.', 'Acierta si le recuerdas el final de la palabra: «niñ-o», «niñ-a».', 'Toca la imagen y dice la palabra correcta él solo.'] },
  ms3: { ...meta('ms3'),
    read: 'Pulsa 🔊 para que el niño oiga la frase. Después, que toque las fichas en orden para construirla: quién, qué hace y qué cosa.',
    stage: 'order', stageLabel: 'Escucha la frase y ordena las fichas',
    parts: [{ role: 'Sujeto', cap: 'niño', emoji: '👦' }, { role: 'Verbo', cap: 'come', emoji: '😋' }, { role: 'Objeto', cap: 'manzana', emoji: '🍎' }], sentence: 'El niño come la manzana.',
    move: 'Teatralizad la frase: el niño hace de actor y "come" una manzana imaginaria.',
    ept: ['Solo dice palabras sueltas («niño», «manzana»).', 'Construye la frase si tú le ayudas a empezarla.', 'Ordena las fichas y dice la frase completa él solo.'] },
  pr1: { ...meta('pr1'),
    read: 'Señala cosas de la habitación y pregúntale: «¿Qué es esto?». Graba o escribe abajo lo que responda el niño.',
    stage: 'instruction', instrIcon: '💬', instrHint: 'Primero responde él a tus preguntas; luego anímale a preguntarte a ti «¿qué es esto?».',
    capture: 'Pregúntale «¿qué es esto?» señalando un objeto. Graba con el micro o escribe su respuesta.',
    move: 'Pasead por la casa como exploradores señalando objetos: "¿qué es esto?" en cada parada.',
    ept: ['Todavía no responde a la pregunta.', 'Responde si primero le das tú un ejemplo de respuesta.', 'Responde él solo e incluso te hace preguntas a ti.'] },
  pr2: { ...meta('pr2'),
    materials: 'Un peluche o muñeco',
    read: 'El peluche está dormido: hablad muy bajito para no despertarlo. Cuando «se despierte», volved a la voz normal. Registra abajo cómo lo hace.',
    stage: 'instruction', instrIcon: '😴', instrHint: 'Peluche dormido = voz bajita. Peluche despierto = voz normal. El niño debe cambiar su voz con el juego.',
    scenes: [
      { emoji: '😴', label: 'Dormido → voz bajita', say: 'Shhh… el peluche está dormido. Hablamos muy muy bajito.' },
      { emoji: '😀', label: 'Despierto → voz normal', say: '¡Ya se despertó el peluche! Ahora hablamos con voz normal.' },
    ],
    capture: 'Graba o escribe cómo habló el niño: ¿bajó la voz con el peluche dormido?',
    move: 'Caminad de puntillas hablando bajito; a la señal, ¡voz normal y paso fuerte!',
    ept: ['Habla igual de fuerte aunque el peluche duerma.', 'Baja la voz cuando tú se lo recuerdas.', 'Cambia él solo entre voz bajita y voz normal según el juego.'] },
  pr3: { ...meta('pr3'),
    read: 'Mira la cara grande con el niño. Pulsa 🔊 si quiere oír las opciones. Él toca cómo se siente la cara.',
    stage: 'emotions', stageLabel: 'Reconoce la emoción', emotionFace: '😀', emotionAnswer: 'Alegría',
    move: 'Imitad la emoción con todo el cuerpo: cara, brazos y postura de estatua.',
    ept: ['Todavía no reconoce cómo se siente la cara.', 'Acierta la emoción si le das pistas («mira su boca»).', 'Dice la emoción él solo y explica por qué se siente así.'] },
  pr4: { ...meta('pr4'),
    read: 'Tápate la boca y di una palabra casi sin voz. Si el niño no la entiende, debe pedirte: «¿qué?» o «¿cómo?». Eso es lo que practicamos: pedir que se lo repitan.',
    stage: 'instruction', instrIcon: '🙋', instrHint: 'El objetivo NO es repetir palabras: es que el niño aprenda a pedir que le repitas lo que no entendió.',
    micTarget: 'cómo', micAlt: ['qué'], micPrompt: 'Cuando no te entienda, pulsa el micro y que pida: «¿cómo?» o «¿qué?»',
    move: 'Susurra una orden desde lejos; si no se entiende, que venga corriendo y pida "¿qué?".',
    ept: ['Se queda callado o abandona cuando no entiende algo.', 'Pide «¿qué?» si tú le recuerdas que puede pedirlo.', 'Pide «¿qué?» o «¿cómo?» él solo cuando no entiende.'] },
  atencion_conjunta: { ...meta('atencion_conjunta'),
    read: 'Llama al niño por su nombre y haz burbujas. Busca su mirada y el contacto visual.',
    stage: 'instruction', instrIcon: '👀', instrHint: 'Desarrolla contacto visual, seguimiento de la mirada y respuesta al nombre.',
    ept: ['Necesita ayuda física para sostener la mirada un instante.', 'Responde a su nombre después de llamarlo varias veces.', 'Te mira él solo y sigue tu mirada.'],
    move: 'Perseguid y explotad burbujas juntos: una burbuja, una mirada.',
    levels: [
      { label: 'Inicial', instrIcon: '🫧', read: 'Acerca las burbujas muy cerca de tu cara y llama su nombre. Busca un contacto visual breve, aunque sea de un instante.', instrHint: 'Estímulo de alto interés y muy cercano. Cualquier mirada breve cuenta.' },
      { label: 'Intermedio', instrIcon: '👀', read: 'Haz burbujas a un brazo de distancia. Llama su nombre y señala con el dedo hacia las burbujas.', instrHint: 'Favorece el seguimiento de la mirada hacia donde el tutor señala.' },
      { label: 'Avanzado', instrIcon: '🙋', read: 'Desde el otro lado de la habitación, llama su nombre una sola vez sin estímulo motivador a la vista.', instrHint: 'Busca respuesta espontánea al nombre sin apoyo visual ni cercanía.' },
    ] },
  imitacion: { ...meta('imitacion'),
    read: 'Haz un gesto (aplaudir, tocar el tambor) y anímale a imitarte. Ahora una sílaba: "pa-pa".',
    stage: 'instruction', instrIcon: '👏', instrHint: 'Imita gestos motores gruesos y vocalizaciones simples en espejo.',
    ept: ['Todavía no copia gestos ni sonidos.', 'Imita gestos o sonidos sueltos con ayuda del adulto.', 'Repite gestos y sonidos justo después de verlos, como un espejo.'],
    move: 'Espejo humano: imitad gestos grandes (brazos, saltos, giros) por turnos.',
    levels: [
      { label: 'Inicial', instrIcon: '👏', read: 'Aplaude despacio frente a él y guía sus manos la primera vez. Repite el gesto solo.', instrHint: 'Gesto motor grueso aislado, con ayuda física si es necesario.' },
      { label: 'Intermedio', instrIcon: '🥁', read: 'Toca el tambor dos veces y di "pa-pa". Espera a que imite el gesto o el sonido sin ayuda física.', instrHint: 'Secuencia corta de gesto + sílaba, sin apoyo físico, solo modelo visual.' },
      { label: 'Avanzado', instrIcon: '🪞', read: 'Combina un gesto y una sílaba nueva ("ta-ta" + saltar) y observa si lo imita en espejo, inmediatamente y sin repetir el modelo.', instrHint: 'Imitación inmediata de una combinación nueva, sin repetición del modelo.' },
    ] },
  comprension: { ...meta('comprension'),
    read: 'Dale una orden de un paso: "Dame la pelota". Pídele que señale partes del cuerpo.',
    stage: 'instruction', instrIcon: '🧠', instrHint: 'Comprende instrucciones de un paso e identifica partes del cuerpo y objetos.',
    ept: ['No obedece instrucciones ni señala elementos solicitados.', 'Ejecuta la orden con ayuda de gestos de señalamiento.', 'Comprende la instrucción puramente verbal y la ejecuta.'],
    move: 'Jugad a "Simón dice" con órdenes de un paso y partes del cuerpo.',
    levels: [
      { label: 'Inicial', instrIcon: '🤲', read: 'Dile "Dame la pelota" mientras señalas la pelota con el dedo.', instrHint: 'Orden de un paso con apoyo gestual directo del tutor.' },
      { label: 'Intermedio', instrIcon: '🧍', read: 'Pídele "Tócate la nariz" y "Tócate la cabeza" sin gestos de apoyo.', instrHint: 'Identificación de partes del cuerpo solo con instrucción verbal.' },
      { label: 'Avanzado', instrIcon: '🧩', read: 'Dile sin ningún gesto: "Dame la pelota y siéntate". Observa si ejecuta los dos pasos en orden.', instrHint: 'Orden verbal de dos pasos, sin ningún apoyo gestual.' },
    ] },
  expresion: { ...meta('expresion'),
    read: '¿Cómo hace el perro? "Guau". Anímale a nombrar y pedir: "quiero agua".',
    stage: 'phrase', stageLabel: 'Evoca y nombra', phrase: 'QUIERO AGUA', phraseEmoji: '💧',
    ept: ['Solo usa gestos o balbuceos para pedir lo que necesita.', 'Dice palabras sencillas después de oírtelas a ti.', 'Dice palabras y frases de dos palabras él solo.'],
    move: 'Carrera hasta el grifo: solo se abre si dice la palabra mágica "agua".',
    levels: [
      { label: 'Inicial', instrIcon: '🐶', read: 'Muéstrale el muñeco del perro y modela: "Guau". Espera que repita la onomatopeya.', instrHint: 'Imitación directa de una onomatopeya tras el modelo del adulto.' },
      { label: 'Intermedio', instrIcon: '🏷️', read: 'Muéstrale un vaso de agua sin decir nada y pregúntale: "¿Qué es esto?".', instrHint: 'Nombrar un objeto familiar de forma espontánea, sin modelo previo.' },
      { label: 'Avanzado', instrIcon: '🗣️', read: 'Ofrécele el vaso vacío y espera a que pida espontáneamente "quiero agua" combinando las dos palabras.', instrHint: 'Combinación espontánea de dos palabras en una petición funcional.' },
    ] },
  comunicacion_funcional: { ...meta('comunicacion_funcional'),
    read: 'Para de hacer algo divertido y espera. Anímale a pedir "más" o "ayuda".',
    stage: 'instruction', instrIcon: '🙌', instrHint: 'Pide juego o ayuda con palabras, gestos o signos.',
    ept: ['Se frustra o no intenta comunicarse cuando algo no sale.', 'Pide ayuda o "más" si tú le dices antes la palabra.', 'Pide con palabras o signos, él solo y con intención clara.'],
    move: 'Columpio, avión o cosquillas: para el juego y espera a que pida "más".',
    levels: [
      { label: 'Inicial', instrIcon: '🤚', read: 'Detén un juego divertido (cosquillas, columpio) y modela el gesto + palabra "más". Ayúdale a imitarlo.', instrHint: 'Petición de "más" con gesto y palabra modelados por el tutor.' },
      { label: 'Intermedio', instrIcon: '🔒', read: 'Dale un bote cerrado con algo que le guste dentro y espera. Si se frustra, sugiere a media voz "ayuda".', instrHint: 'Petición de "ayuda" ante un obstáculo, con pista verbal parcial.' },
      { label: 'Avanzado', instrIcon: '💬', read: 'Crea otra situación de necesidad (juguete fuera de alcance) sin dar ninguna pista y espera la petición espontánea.', instrHint: 'Inicio espontáneo de la petición, sin pistas verbales ni gestuales.' },
    ] },
  regulacion_conductual: { ...meta('regulacion_conductual'),
    read: 'Avisa del cambio de actividad con la agenda visual y espera con tranquilidad.',
    stage: 'instruction', instrIcon: '🗂️', instrHint: 'Anticipa y acepta el cambio de actividad con apoyo visual y fichas.',
    ept: ['Se enfada o se descontrola en los cambios de actividad.', 'Acepta el cambio si gana una ficha como premio.', 'Cambia de actividad tranquilo y por sí mismo.'],
    move: 'Marchad juntos hacia la siguiente actividad cantando la canción de las transiciones.',
    levels: [
      { label: 'Inicial', instrIcon: '🖼️', read: 'Muéstrale la imagen de la siguiente actividad y haz una cuenta atrás visual de 5 a 1 antes de cambiar.', instrHint: 'Anticipación con apoyo visual fuerte y cuenta atrás.' },
      { label: 'Intermedio', instrIcon: '🎫', read: 'Avisa el cambio una sola vez y ofrece una ficha al terminar la actividad con calma.', instrHint: 'Acepta el cambio con ayuda de fichas-premio.' },
      { label: 'Avanzado', instrIcon: '📅', read: 'Deja que consulte solo su agenda visual y haga la transición sin que tengas que avisarle.', instrHint: 'Transición autónoma siguiendo la agenda, sin aviso directo del tutor.' },
    ] },
  interaccion_social: { ...meta('interaccion_social'),
    read: 'Juega por turnos: "Ahora tú, ahora yo". Inicia un juego simbólico sencillo.',
    stage: 'instruction', instrIcon: '🤝', instrHint: 'Respeta turnos, inicia juego simbólico y responde afectivamente.',
    ept: ['Juega solo y rechaza compartir turnos.', 'Acepta turnos y participa si tú guías el juego.', 'Empieza juegos con otros y mantiene el toma y daca.'],
    move: 'Pasaos una pelota rodando: solo habla quien la tiene. ¡Turno y movimiento!',
    levels: [
      { label: 'Inicial', instrIcon: '🔁', read: 'Apila un bloque y dile "ahora tú". Ayúdale físicamente si no responde al turno.', instrHint: 'Turno simple guiado, con ayuda física si es necesario.' },
      { label: 'Intermedio', instrIcon: '🍽️', read: 'Ofrécele un muñeco y una cuchara; modela "vamos a darle de comer" y espera que continúe el juego simbólico.', instrHint: 'Inicio de juego simbólico breve con apoyo del modelo.' },
      { label: 'Avanzado', instrIcon: '🎭', read: 'Deja que proponga él un juego de turnos o simbólico y mantén el intercambio sin dirigirlo.', instrHint: 'Reciprocidad espontánea: el niño inicia y mantiene el intercambio.' },
    ] },
};

// ----------------------------------------------------------------------------
// Rondas de contenido por ejercicio: los testers se aburrían porque cada
// mini-juego tenía UN único ítem fijo (siempre "zapato", siempre el coche de
// intruso…), que además se memoriza tras jugarlo una vez. Cada entrada
// sobreescribe los datos del mini-juego para esa ronda; la ronda 1 usa los
// datos base del ejercicio ({}). Solo emojis con soporte amplio (pre-2019).
// ----------------------------------------------------------------------------
export const VARIANTS: Record<string, Partial<Exercise>[]> = {
  ff1: [
    {},
    { tiles: [{ cap: 'oso', emoji: '🐻' }, { cap: 'uvas', emoji: '🍇' }, { cap: 'avión', emoji: '✈️' }] },
    { tiles: [{ cap: 'águila', emoji: '🦅' }, { cap: 'erizo', emoji: '🦔' }, { cap: 'oveja', emoji: '🐑' }] },
  ],
  ff2: [
    {},
    { phrase: 'PELOTA', phraseEmoji: '⚽' },
    { phrase: 'MARIPOSA', phraseEmoji: '🦋' },
  ],
  ff3: [
    {},
    { fillBefore: 'P', fillAfter: 'N', fillAnswer: 'A', fillEmoji: '🍞', fillCap: 'pan' },
    { fillBefore: 'L', fillAfter: 'NA', fillAnswer: 'U', fillEmoji: '🌙', fillCap: 'luna' },
  ],
  se1: [
    {},
    {
      read: 'Pulsa 🔊 para oír el nombre de las cuatro fichas. Tres son animales y una no. El niño toca la que NO va con las demás.',
      intruder: [{ cap: 'perro', emoji: '🐶' }, { cap: 'gato', emoji: '🐱' }, { cap: 'vaca', emoji: '🐄' }, { cap: 'zapato', emoji: '👟' }],
      intruderAnswer: 3,
    },
    {
      read: 'Pulsa 🔊 para oír el nombre de las cuatro fichas. Tres son para vestirse y una no. El niño toca la que NO va con las demás.',
      intruder: [{ cap: 'gorro', emoji: '🧢' }, { cap: 'camiseta', emoji: '👕' }, { cap: 'zapato', emoji: '👟' }, { cap: 'plátano', emoji: '🍌' }],
      intruderAnswer: 3,
    },
  ],
  se2: [
    {},
    {
      choicePrompt: 'Empieza por eme, y es una fruta roja y redonda. ¿Qué es?',
      options: [{ cap: 'manzana', emoji: '🍎' }, { cap: 'mariposa', emoji: '🦋' }, { cap: 'moto', emoji: '🏍️' }], optionAnswer: 0,
    },
    {
      choicePrompt: 'Empieza por ese, brilla en el cielo y nos da calor. ¿Qué es?',
      options: [{ cap: 'sol', emoji: '☀️' }, { cap: 'serpiente', emoji: '🐍' }, { cap: 'sopa', emoji: '🍲' }], optionAnswer: 0,
    },
  ],
  ms1: [
    {},
    {
      read: 'El niño toca la tarjeta donde hay MUCHAS. Después pregúntale «¿qué son?» para que lo diga con la ese final: «flores».',
      plural: { cap: 'flor', capPlural: 'flores', emoji: '🌸' },
    },
    {
      read: 'El niño toca la tarjeta donde hay MUCHOS. Después pregúntale «¿qué son?» para que lo diga terminado en «-ces»: «peces».',
      plural: { cap: 'pez', capPlural: 'peces', emoji: '🐟' },
    },
  ],
  ms2: [
    {},
    { choicePrompt: 'abuela', options: [{ cap: 'abuelo', emoji: '👴' }, { cap: 'abuela', emoji: '👵' }], optionAnswer: 1 },
    { choicePrompt: 'rey', options: [{ cap: 'rey', emoji: '🤴' }, { cap: 'reina', emoji: '👸' }], optionAnswer: 0 },
  ],
  ms3: [
    {},
    {
      parts: [{ role: 'Sujeto', cap: 'niña', emoji: '👧' }, { role: 'Verbo', cap: 'lanza', emoji: '🤾' }, { role: 'Objeto', cap: 'pelota', emoji: '⚽' }],
      sentence: 'La niña lanza la pelota.',
    },
    {
      parts: [{ role: 'Sujeto', cap: 'perro', emoji: '🐶' }, { role: 'Verbo', cap: 'come', emoji: '😋' }, { role: 'Objeto', cap: 'hueso', emoji: '🦴' }],
      sentence: 'El perro come el hueso.',
    },
  ],
  pr3: [
    {},
    { emotionFace: '😢', emotionAnswer: 'Tristeza' },
    { emotionFace: '😠', emotionAnswer: 'Enfado' },
  ],
};

export const DEFAULT_SESSION = ['ff1', 'ff2', 'se1', 'pr3', 'ms3'];

// Opciones del mini-juego de emociones (stage 'emotions'). Vive aquí, en el
// módulo puro, para que la pantalla y el corpus compartan la MISMA fuente: al
// tocar una emoción se locuta su etiqueta como pieza atómica (voz neuronal).
export const EMO: { face: string; label: string }[] = [
  { face: '😀', label: 'Alegría' }, { face: '😢', label: 'Tristeza' },
  { face: '😠', label: 'Enfado' }, { face: '🤕', label: 'Dolor' },
];

// Frases FIJAS que la pantalla concatena con un refuerzo aleatorio. Se sacan
// aquí para que el player y el corpus usen el mismo literal: la pantalla las
// locuta como pieza atómica de una secuencia (speakToChildSeq), nunca dentro
// de una cadena compuesta que la voz neuronal no podría resolver.
export const SESSION_DONE_LEAD = '¡Sesión completada!';           // + elogio al cerrar sesión
export const PLURAL_HINT = 'Ahí solo hay uno. Busca donde hay muchos.'; // fallo en el juego de plural

// ----------------------------------------------------------------------------
// Enumeración de voz (contrato con el corpus neuronal)
// ----------------------------------------------------------------------------
// Espejo EXACTO de lo que locuta ValeriaExercisePlayerScreen (+ los apoyos de
// voz de ValeriaVoiceUI que estas pantallas montan). Cada línea es un par
// (estilo, texto) que el corpus hornea como asset neuronal es (Sharvard). Si un
// literal cambia en el player, cambia aquí y su asset deja de resolver: cae a la
// voz del sistema (degrada, nunca rompe). Solo se enumera lo DETERMINISTA: las
// concatenaciones con frases de refuerzo aleatorias («niña. ¡Muy bien!») no se
// pueden pre-hornear y siguen usando la voz del sistema, igual que hasta ahora.
export interface VoiceLine { style: 'tutor' | 'child' | 'slow'; text: string; }

// Frases FIJAS de los apoyos de voz compartidos (ValeriaVoiceUI) que montan las
// pantallas de Audición y Lenguaje: veredictos de MicPracticeCard y el aviso de
// "toca una imagen" del player.
const EXERCISE_FIXED_LINES: VoiceLine[] = [
  { style: 'child', text: '¡Muy bien! ¡Lo has dicho genial!' }, // VERDICT[2].say
  { style: 'child', text: '¡Casi! Vamos a intentarlo otra vez.' }, // VERDICT[1].say
  { style: 'child', text: 'Vamos a escucharla otra vez.' }, // VERDICT[0].say
  { style: 'child', text: 'Primero toca una imagen.' }, // matchVowel sin selección (FF-1)
  // Piezas atómicas de las secuencias con refuerzo (speakToChildSeq): la
  // etiqueta de cada emoción, el arranque de "sesión completada" y la pista
  // del juego de plural. El refuerzo aleatorio ya está en los bancos.
  ...EMO.map((e): VoiceLine => ({ style: 'child', text: e.label })),
  { style: 'child', text: SESSION_DONE_LEAD },
  { style: 'child', text: PLURAL_HINT },
];

// Líneas de voz de un ejercicio ya "resuelto" (base + variante de ronda fusionada).
const linesForExercise = (ex: Exercise): VoiceLine[] => {
  const out: VoiceLine[] = [];
  // Consigna: los ejercicios con niveles (Lenguaje, ACOPROS) leen cada nivel;
  // el resto lee la consigna base. Voz por defecto de SpeakButton = 'tutor'.
  if (ex.levels?.length) for (const lv of ex.levels) out.push({ style: 'tutor', text: lv.read });
  else out.push({ style: 'tutor', text: ex.read });
  // Versión en movimiento (SpeakButton voice="child").
  out.push({ style: 'child', text: ex.move });
  // Modelo lento de la palabra/frase (SpeakButton voice="slow" → se minuscula).
  if (ex.phrase) out.push({ style: 'slow', text: ex.phrase.toLowerCase() });
  // Juego de vocales: nombre de cada ficha y el "oír todos" concatenado.
  if (ex.tiles?.length) {
    for (const t of ex.tiles) out.push({ style: 'slow', text: t.cap.toLowerCase() });
    out.push({ style: 'slow', text: ex.tiles.map((t) => t.cap).join(', ').toLowerCase() });
  }
  if (ex.fillCap) out.push({ style: 'slow', text: ex.fillCap.toLowerCase() });
  // Intruso: "oír las palabras" concatenado + cada ficha como eco atómico
  // 'child' (al tocarla se locuta «palabra» y luego el refuerzo, en secuencia).
  if (ex.intruder?.length) {
    out.push({ style: 'slow', text: ex.intruder.map((t) => t.cap).join(', ').toLowerCase() });
    for (const t of ex.intruder) out.push({ style: 'child', text: t.cap });
  }
  // Adivinanza/género: la pregunta se locuta con la voz declarada en el dato.
  if (ex.choicePrompt) {
    out.push(ex.choiceVoice === 'slow'
      ? { style: 'slow', text: ex.choicePrompt.toLowerCase() }
      : { style: 'tutor', text: ex.choicePrompt });
  }
  // Cada opción como eco atómico 'child' («opción» + refuerzo en secuencia).
  if (ex.options?.length) for (const o of ex.options) out.push({ style: 'child', text: o.cap });
  // Orden S-V-O: la frase (SpeakButton voice="child") y el modelo de cada ficha.
  if (ex.sentence) out.push({ style: 'child', text: ex.sentence });
  if (ex.parts?.length) for (const p of ex.parts) out.push({ style: 'slow', text: p.cap.toLowerCase() });
  // Plural: el modelo de MicPracticeCard es la forma en plural, y los ecos
  // atómicos 'child' de cada tarjeta («un X» / «muchos Y») + refuerzo/pista.
  if (ex.plural) {
    out.push({ style: 'slow', text: ex.plural.capPlural.toLowerCase() });
    out.push({ style: 'child', text: `un ${ex.plural.cap}` });
    out.push({ style: 'child', text: `muchos ${ex.plural.capPlural}` });
  }
  // Escenas con ejemplo hablado (PR-2, voz child).
  if (ex.scenes?.length) for (const sc of ex.scenes) out.push({ style: 'child', text: sc.say });
  // Práctica de micro dirigida (PR-4): el objetivo se oye como modelo lento.
  if (ex.micTarget) out.push({ style: 'slow', text: ex.micTarget.toLowerCase() });
  return out;
};

export function enumerateExerciseSpeech(): VoiceLine[] {
  const out: VoiceLine[] = [...EXERCISE_FIXED_LINES];
  for (const [id, ex] of Object.entries(DB)) {
    // Ronda 1 = datos base ({}); las variantes sobreescriben campos. Se enumeran
    // todas: los ids duplicados los colapsa el corpus (Map por id).
    const rounds = VARIANTS[id] ?? [{}];
    for (const v of rounds) out.push(...linesForExercise({ ...ex, ...v }));
  }
  return out;
}

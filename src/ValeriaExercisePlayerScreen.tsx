// ============================================================================
// Valeria+ · Player de Sesión de Terapia (V5.0)
// Flujo guiado tutor + niño: consigna real, mini-juego visual por tipo de
// ejercicio y evaluación con la escala clínica EPT-3 (1★ / 2★ / 3★).
//
// Novedades V4:
//   · Fichas ilustradas con emojis grandes (adiós placeholders) y zoom al tocar.
//   · "Versión en movimiento" por ejercicio + Pausas Activas entre ejercicios.
//   · Confeti y recompensas estilo Duolingo al terminar (XP, racha, logros).
//
// Novedades V5 (voz):
//   · Síntesis de voz: la app lee consignas, palabras objetivo y frases (🔊).
//   · Juego de micrófono: el niño repite la palabra y la app valora el intento.
//   · Cápsulas TPR (Total Physical Response) entre ejercicios: la app dicta
//     órdenes en voz alta y el niño responde con el cuerpo.
//
// Novedades V6 (UX):
//   · Rondas con contenido variado por mini-juego (VARIANTS): repetir un
//     ejercicio ya no muestra siempre la misma palabra/ficha/respuesta.
//   · Flujo numerado PASO 1→4 (consigna → juego → movimiento → evaluación)
//     para que el tutor sepa siempre qué toca.
//   · La app celebra o anima con voz variada los aciertos/fallos del niño
//     en los mini-juegos táctiles (intruso, emociones, vocal faltante).
//   · Cabecera con el nombre real del paciente activo.
//
// Novedades V7 (feedback de los evaluadores del bloque de Audición):
//   · Consignas reescritas en lenguaje llano y con los pasos concretos.
//   · Tarjeta "Necesitarás" al inicio cuando la actividad usa material real.
//   · Edad orientativa visible en cada ejercicio.
//   · FF-1 ahora es un juego real de unir imagen ↔ vocal en la pantalla.
//   · FF-3 y SE-1 con apoyo auditivo (oír la palabra completa / las fichas).
//   · SE-2 con opciones de respuesta visuales (ya no es solo oral).
//   · MS-1 y MS-2 con mini-juego visual + audio (uno/muchos y niño/niña).
//   · MS-3 ordena las fichas en pantalla mientras escucha la frase (sin dados).
//   · PR-1 y PR-2 registran la respuesta del niño por voz o por escrito.
//   · PR-3 con audio en las opciones y refuerzo inmediato; PR-4 clarificado
//     con práctica de micrófono de la fórmula "¿cómo?".
//   · Explicación en lenguaje sencillo de la escala EPT-3 en la evaluación.
//
// Navegación: navigation.navigate('ExercisePlayer', { id?: string; ids?: string[] })
//   · Con `ids` -> sesión con esa lista de ejercicios (p. ej. todos los prescritos).
//   · Con `id`  -> sesión de un solo ejercicio.
//   · Sin nada  -> sesión por defecto (plan prescrito de ejemplo).
// ============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Modal, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { registerSession, SessionReward, levelProgress, xpToNext } from './valeriaGamification';
import { speakToChild, speakWordSlow, stopSpeaking, praisePhrase, almostPhrase, normalizeSpeech } from './valeriaVoice';
import { SpeakButton, MicPracticeCard, ResponseCaptureCard } from './ValeriaVoiceUI';
import { ValeriaSessionBreakOverlay, pickSessionBreak, SessionBreak } from './ValeriaSessionBreakOverlay';
import { ValeriaAdultChaosPanel } from './ValeriaAdultChaosPanel';
import { ValeriaDistractorBear } from './ValeriaDistractorBear';
import { ValeriaPragmaticBreakOverlay } from './ValeriaPragmaticBreak';
import { releaseNoise } from './valeriaNoise';
import { META_BY_ID, AUDICION_META, LENGUAJE_META } from './valeriaExerciseMeta';
import { markBlockCompleted } from './valeriaTelemetry';

// Conjuntos de ids por bloque para marcar el hito de "bloque completado" (SUS).
const AUD_IDS = new Set(AUDICION_META.map((m) => m.id));
const LEN_IDS = new Set(LENGUAJE_META.map((m) => m.id));
// import logoWhite from '../../assets/valeria-logo-white.png';

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------
type Stage = 'phrase' | 'vowels' | 'fill' | 'intruder' | 'emotions' | 'order' | 'instruction' | 'choice' | 'plural';

interface Tile { cap: string; emoji: string; }

interface Exercise {
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

const DB: Record<string, Exercise> = {
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
const VARIANTS: Record<string, Partial<Exercise>[]> = {
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

const DEFAULT_SESSION = ['ff1', 'ff2', 'se1', 'pr3', 'ms3'];
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const EMO = [
  { face: '😀', label: 'Alegría' }, { face: '😢', label: 'Tristeza' },
  { face: '😠', label: 'Enfado' }, { face: '🤕', label: 'Dolor' },
];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Entre ejercicios se muestra una Cápsula TPR (escucha y muévete): sustituye a
// las antiguas pausas activas. El banco de cápsulas vive en ValeriaTPRCapsule.

// ----------------------------------------------------------------------------
// Ficha ilustrada con emoji. Con `onZoom` es tocable y amplía la imagen; SIN
// `onZoom` es una vista plana, para usarla DENTRO de fichas de mini-juego
// tocables: un Pressable anidado robaba el toque y el juego de asociación
// (FF-1) o las respuestas parecían no funcionar (bug reportado por testers).
// En esos juegos, el zoom pasa a mantener pulsada la ficha exterior.
// ----------------------------------------------------------------------------
const TILE_BGS = ['#fef3e2', '#e8f4fd', '#f3e8fd', '#e8fdf0', '#fdeef2', '#fdf8e2'];

const EmojiTile: React.FC<{
  emoji: string; cap?: string; size?: number; bgIndex?: number;
  onZoom?: (emoji: string, cap: string) => void;
}> = ({ emoji, cap, size = 78, bgIndex = 0, onZoom }) => {
  const box = { width: size, height: size * 0.84, backgroundColor: TILE_BGS[bgIndex % TILE_BGS.length] };
  if (!onZoom) {
    return (
      <View style={[s.emojiTile, box]}>
        <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={() => onZoom(emoji, cap ?? '')}
      accessibilityRole="imagebutton"
      accessibilityLabel={`Ampliar imagen de ${cap ?? 'la ficha'}`}
      style={({ pressed }) => [s.emojiTile, box, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>
      <View style={s.zoomHintDot}><Text style={{ fontSize: 9 }}>🔍</Text></View>
    </Pressable>
  );
};

// ----------------------------------------------------------------------------
// Cuadrícula de respuesta compartida (intruso y adivinanzas/género): fichas
// con imagen; al tocar una se marca ✅/❌ contra la respuesta correcta.
// `revealAnswer` muestra además la correcta cuando se toca otra (intruso).
// ----------------------------------------------------------------------------
const AnswerTileGrid: React.FC<{
  tiles: Tile[];
  answer: number;
  picked: number; // -1 = ninguna elegida aún
  onPick: (i: number, isAnswer: boolean) => void;
  onZoom: (emoji: string, cap: string) => void;
  size?: number;
  tileStyle?: object;
  center?: boolean;
  revealAnswer?: boolean;
}> = ({ tiles, answer, picked, onPick, onZoom, size = 96, tileStyle, center = false, revealAnswer = false }) => (
  <View style={[s.grid2, center && { justifyContent: 'center' }]}>
    {tiles.map((t, i) => {
      const tapped = picked === i;
      const isAns = i === answer;
      const ok = (tapped && isAns) || (revealAnswer && picked >= 0 && isAns);
      const bad = tapped && !isAns;
      return (
        <Pressable
          key={i}
          // Toque = responder; pulsación larga = ampliar. La ficha interior es
          // plana para que ningún Pressable anidado robe el toque.
          onPress={() => { if (picked !== i) onPick(i, isAns); }}
          onLongPress={() => onZoom(t.emoji, t.cap)}
          accessibilityRole="button"
          accessibilityLabel={`Responder ${t.cap}. Mantén pulsado para ampliar la imagen`}
          style={[s.gridTile, tileStyle, ok && s.gridTileOk, bad && s.gridTileBad]}
        >
          <View style={{ alignItems: 'center' }}>
            <EmojiTile emoji={t.emoji} cap={t.cap} size={size} bgIndex={i} />
          </View>
          <View style={s.gridCapRow}>
            <Text style={s.gridCap}>{t.cap}</Text>
            <Text style={{ fontSize: 13 }}>{ok ? '✅' : bad ? '❌' : ''}</Text>
          </View>
        </Pressable>
      );
    })}
  </View>
);

// ----------------------------------------------------------------------------
// Modal de zoom: la imagen crece con animación de resorte a pantalla completa.
// ----------------------------------------------------------------------------
const ZoomModal: React.FC<{ emoji: string; cap: string; visible: boolean; onClose: () => void }> = ({ emoji, cap, visible, onClose }) => {
  const scale = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    if (visible) {
      scale.setValue(0.3);
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    }
  }, [visible, scale]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.zoomOverlay} onPress={onClose} accessibilityRole="button" accessibilityLabel="Cerrar imagen ampliada">
        <Animated.View style={[s.zoomCard, { transform: [{ scale }] }]}>
          <Text style={s.zoomEmoji}>{emoji}</Text>
          {!!cap && <Text style={s.zoomCap}>{cap}</Text>}
          <Text style={s.zoomClose}>Toca para cerrar</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ----------------------------------------------------------------------------
// Confeti ligero: piezas emoji que caen al completar la sesión.
// ----------------------------------------------------------------------------
const CONFETTI = ['🎉', '⭐', '🎊', '✨', '💚', '🌟'];
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const ConfettiBurst: React.FC = () => {
  const pieces = useRef(
    Array.from({ length: 14 }).map((_, i) => ({
      anim: new Animated.Value(0),
      x: Math.random() * (SCREEN_W - 40),
      delay: i * 130,
      emoji: CONFETTI[i % CONFETTI.length],
      spin: Math.random() > 0.5 ? '360deg' : '-360deg',
    })),
  ).current;

  useEffect(() => {
    pieces.forEach((p) => {
      Animated.timing(p.anim, {
        toValue: 1, duration: 2400, delay: p.delay,
        easing: Easing.in(Easing.quad), useNativeDriver: true,
      }).start();
    });
  }, [pieces]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute', left: p.x, top: -40, fontSize: 22,
            opacity: p.anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_H * 0.85] }) },
              { rotate: p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', p.spin] }) },
            ],
          }}
        >
          {p.emoji}
        </Animated.Text>
      ))}
    </View>
  );
};

// ----------------------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------------------
export const ValeriaExercisePlayerScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const startId: string | undefined = route?.params?.id;
  const startIds: string[] | undefined = route?.params?.ids;
  const sessionIds = useMemo(() => {
    if (Array.isArray(startIds)) {
      const valid = startIds.filter((i) => typeof i === 'string' && DB[i]);
      if (valid.length) return valid;
    }
    return startId && DB[startId] ? [startId] : DEFAULT_SESSION;
  }, [startId, startIds]);

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [picked, setPicked] = useState(0);
  const [locking, setLocking] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [reward, setReward] = useState<SessionReward | null>(null);
  // Progresión Inicial → Intermedio → Avanzado dentro del ejercicio actual.
  const [subIdx, setSubIdx] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  // estado efímero de mini-juego
  const [fillPick, setFillPick] = useState('');
  const [intruderPick, setIntruderPick] = useState(-1);
  const [emotionPick, setEmotionPick] = useState('');
  // FF-1: unir imagen ↔ vocal (imagen seleccionada, imágenes ya unidas y vocal errónea que parpadea)
  const [matchSel, setMatchSel] = useState(-1);
  const [matchOk, setMatchOk] = useState<boolean[]>([]);
  const [wrongVowel, setWrongVowel] = useState('');
  // SE-2 / MS-2: elegir la imagen correcta tras el audio
  const [choicePick, setChoicePick] = useState(-1);
  // MS-1: tarjeta con uno / tarjeta con muchos
  const [pluralPick, setPluralPick] = useState<'' | 'one' | 'many'>('');
  // MS-3: fichas tocadas en orden para construir la frase
  const [orderPicks, setOrderPicks] = useState<number[]>([]);
  // Explicación en lenguaje llano de la escala EPT-3
  const [eptInfoOpen, setEptInfoOpen] = useState(false);
  // Respuestas libres registradas (voz o escrito) por código de ejercicio;
  // al terminar, se guardan con la sesión en el historial de Resultados.
  const capturesRef = useRef<Record<string, { name: string; text: string }>>({});
  // zoom de imagen
  const [zoom, setZoom] = useState<{ emoji: string; cap: string } | null>(null);
  // cápsula TPR entre ejercicios
  const [activeBreak, setActiveBreak] = useState<SessionBreak | null>(null);
  // Panel del adulto (Fase 2): controles SIEMPRE manuales del caos comunicativo.
  const [distractorOn, setDistractorOn] = useState(false);
  const [pragmaticOpen, setPragmaticOpen] = useState(false);
  // ronda de contenido dentro del ejercicio (banco VARIANTS)
  const [round, setRound] = useState(0);
  // nombre real del paciente activo para la cabecera
  const [patientName, setPatientName] = useState('');

  const baseEx = DB[sessionIds[idx]] ?? DB.ff1;
  const variants = VARIANTS[sessionIds[idx]] ?? [];
  const totalRounds = variants.length;
  // Ejercicio efectivo de la ronda actual: los campos de la variante pisan a los base.
  const ex: Exercise = totalRounds ? { ...baseEx, ...variants[round % totalRounds] } : baseEx;
  const total = sessionIds.length;
  const curLevel = ex.levels?.[subIdx];

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.registro);
        const nombre = raw ? JSON.parse(raw)?.nombre : '';
        if (typeof nombre === 'string' && nombre.trim()) setPatientName(nombre.trim());
      } catch (e) { /* sin ficha activa */ }
    })();
  }, []);

  // Silencia la voz de la app al cambiar de ejercicio y al salir de la pantalla.
  useEffect(() => { stopSpeaking(); }, [idx, subIdx]);
  useEffect(() => () => { stopSpeaking(); releaseNoise(); }, []);

  // Vuelve arriba al cambiar de ejercicio o nivel: la evaluación se toca al
  // final de la página, y sin este reset el siguiente ejercicio aparecía ya
  // desplazado al fondo — parecía que la sesión no avanzaba.
  const scrollRef = useRef<ScrollView | null>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [idx, subIdx, finished]);

  const resetEphemeral = () => {
    clearGameTimers();
    setFillPick(''); setIntruderPick(-1); setEmotionPick('');
    setMatchSel(-1); setMatchOk([]); setWrongVowel('');
    setChoicePick(-1); setPluralPick(''); setOrderPicks([]);
  };

  const nextRound = () => {
    stopSpeaking();
    setRound((r) => r + 1);
    resetEphemeral();
  };

  const openZoom = (emoji: string, cap: string) => setZoom({ emoji, cap });

  // Feedback hablado de los mini-juegos táctiles: celebrar el acierto y animar
  // en el fallo, con frases rotativas para que no suene enlatado.
  const speakVerdict = (ok: boolean) => speakToChild(ok ? praisePhrase() : almostPhrase());

  // Vocal inicial de una palabra sin tildes: águila → A (para FF-1).
  // Reutiliza la normalización de acentos del motor de voz.
  const initialVowel = (cap: string) => normalizeSpeech(cap).charAt(0).toUpperCase();

  // Timers efimeros de los mini-juegos: se guardan para poder cancelarlos al
  // cambiar de ejercicio/ronda o al salir de la pantalla.
  const flashTimer = useRef<any>(null);
  const orderTimer = useRef<any>(null);
  const clearGameTimers = () => {
    clearTimeout(flashTimer.current);
    clearTimeout(orderTimer.current);
  };
  useEffect(() => () => clearGameTimers(), []);

  // FF-1 · unir imagen ↔ vocal: tocar la imagen la nombra en voz alta y la
  // selecciona; tocar después una vocal comprueba la unión en la tablet.
  const tapMatchTile = (i: number) => {
    if (matchOk[i]) return;
    setMatchSel(i);
    speakWordSlow(ex.tiles![i].cap);
  };
  const tapMatchVowel = (v: string) => {
    if (matchSel < 0) { speakToChild('Primero toca una imagen.'); return; }
    if (initialVowel(ex.tiles![matchSel].cap) === v) {
      setMatchOk((prev) => { const n = [...prev]; n[matchSel] = true; return n; });
      setMatchSel(-1);
      speakVerdict(true);
    } else {
      setWrongVowel(v);
      speakVerdict(false);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setWrongVowel(''), 900);
    }
  };

  // MS-3 · construir la frase tocando las fichas en orden (quién → qué hace →
  // qué cosa). Si el orden final no es correcto, se anima y se reinicia.
  const tapOrderTile = (i: number) => {
    if (orderPicks.includes(i)) return;
    const next = [...orderPicks, i];
    setOrderPicks(next);
    if (next.length === ex.parts!.length) {
      const okOrder = next.every((p, k) => p === k);
      if (okOrder) speakToChild(`${praisePhrase()} ${ex.sentence}`);
      else {
        speakToChild(almostPhrase());
        clearTimeout(orderTimer.current);
        orderTimer.current = setTimeout(() => setOrderPicks([]), 1400);
      }
    } else {
      speakWordSlow(ex.parts![i].cap);
    }
  };

  const pick = (val: number) => {
    if (locking || finished) return;
    setPicked(val);
    setLocking(true);
    setTimeout(() => {
      // Si el ejercicio tiene niveles de dificultad, primero se recorren
      // Inicial → Intermedio → Avanzado antes de cerrar el ejercicio.
      if (ex.levels && subIdx + 1 < ex.levels.length) {
        setLevelScores((prev) => [...prev, val]);
        setSubIdx(subIdx + 1);
        setPicked(0); setLocking(false); resetEphemeral();
        return;
      }
      const exerciseScore = ex.levels
        ? Math.round([...levelScores, val].reduce((a, b) => a + b, 0) / (levelScores.length + 1))
        : val;
      const nextResults = [...results, exerciseScore];
      setResults(nextResults);
      if (idx + 1 >= total) {
        finish(nextResults);
      } else {
        setIdx(idx + 1); setSubIdx(0); setLevelScores([]); setRound(0);
        setPicked(0); setLocking(false); resetEphemeral();
        // Pausa activa sorpresa antes del siguiente ejercicio: cápsula TPR
        // clásica o Ruta de Rutina (TPR 2.0). La telemetría de inicio/fin/salto
        // vive dentro del propio overlay unificado.
        setActiveBreak(pickSessionBreak());
      }
    }, 620);
  };

  const finish = async (res: number[]) => {
    const avg = res.reduce((a, b) => a + b, 0) / res.length;
    const sessionName = total === 1 ? ex.name : 'Sesión de terapia';
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.historial);
      const hist = raw ? JSON.parse(raw) : [];
      const d = new Date();
      // Respuestas libres registradas durante la sesión (PR-1, PR-2…): viajan
      // con la entrada del historial para que Resultados las muestre.
      const responses = Object.entries(capturesRef.current)
        .map(([code, r]) => ({ code, name: r.name, text: r.text }));
      hist.push({
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        name: sessionName,
        avg: +avg.toFixed(1),
        note: avg >= 2.5 ? 'Sesión muy fluida, gran respuesta en las consignas.'
          : avg >= 1.8 ? 'Buena sesión, alguna consigna costó pero se mantuvo atento.'
            : 'Sesión difícil hoy, conviene reforzar con más apoyo del tutor.',
        completed: true,
        ...(responses.length ? { responses } : {}),
      });
      await AsyncStorage.setItem(STORAGE_KEYS.historial, JSON.stringify(hist));
    } catch (e) { /* almacenamiento no disponible */ }
    try {
      // Recompensas estilo Duolingo: XP, racha y logros.
      setReward(await registerSession(avg, res.length));
    } catch (e) { /* gamificación no disponible */ }
    setResults(res);
    releaseNoise(); // fin de sesión: la Pista B no sobrevive a la pantalla de logros
    setFinished(true);
    // Telemetría: hito de bloque completado (Audición/Lenguaje según los ids de
    // la sesión) → puede disparar el SUS (con rate limiting) al cerrar 4 bloques.
    if (sessionIds.some((id) => AUD_IDS.has(id))) markBlockCompleted('audicion');
    if (sessionIds.some((id) => LEN_IDS.has(id))) markBlockCompleted('lenguaje');
    // Celebración hablada para el niño al cerrar la sesión (frase rotativa).
    speakToChild(`¡Sesión completada! ${praisePhrase()}`);
  };

  // Cuenta atrás hacia Resultados. El updater solo decrementa; la navegación
  // vive en su propio efecto: hacer navigate() DENTRO del updater de estado
  // hacía que en algunos dispositivos la redirección automática se perdiera
  // (bug reportado: al terminar el ejercicio no avanzaba a resultados).
  const timerRef = useRef<any>(null);
  useEffect(() => {
    if (!finished) return;
    timerRef.current = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, [finished]);
  useEffect(() => {
    if (finished && countdown === 0) {
      clearInterval(timerRef.current);
      navigation.navigate('Results');
    }
  }, [finished, countdown]);

  const restart = () => {
    clearInterval(timerRef.current);
    capturesRef.current = {};
    setIdx(0); setSubIdx(0); setLevelScores([]); setResults([]); setPicked(0); setLocking(false);
    setFinished(false); setCountdown(10); setReward(null); setActiveBreak(null); setRound(0); resetEphemeral();
  };

  const sumAvg = results.length ? results.reduce((a, b) => a + b, 0) / results.length : 0;
  const fullStars = Math.round(sumAvg);
  const starStr = (n: number) => '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);

  // --------------------------------------------------------------------------
  return (
    <View style={s.flex}>
      {/* ===== Cabecera turquesa unificada ===== */}
      <View style={s.header}>
        {/* <Image source={logoWhite} style={s.logo} /> */}
        <Pressable onPress={() => { clearInterval(timerRef.current); navigation.goBack(); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
        <Text style={s.logoFallback}>valeria+</Text>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{finished ? 'Sesión Completada' : 'Sesión de Terapia'}</Text>
            <Text style={s.headerSub} numberOfLines={1}>
              {patientName ? `${patientName} · ` : ''}{total === 1 ? ex.name : `Plan prescrito · ${total} terapias`}
            </Text>
          </View>
          <View style={s.counter}>
            <Text style={s.counterTxt}>{finished ? `${total} / ${total}` : `${idx + 1} / ${total}`}</Text>
          </View>
        </View>
        <View style={s.dots}>
          {sessionIds.map((_, i) => {
            const done = i < idx || finished;
            const cur = i === idx && !finished;
            return <View key={i} style={[s.dot, { backgroundColor: done ? '#fff' : cur ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.32)' }]} />;
          })}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!finished ? (
          <>
            {/* Meta del ejercicio */}
            <View style={s.metaRow}>
              <View style={s.codeChip}><Text style={s.codeChipTxt}>{ex.code}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.metaName}>{ex.name}</Text>
                <Text style={s.metaCat}>{ex.category}</Text>
              </View>
              {!!ex.age && !curLevel && (
                <View style={s.levelBadge}>
                  <Text style={s.levelBadgeTxt}>👶 {ex.age}</Text>
                </View>
              )}
              {curLevel && (
                <View style={s.levelBadge}>
                  <Text style={s.levelBadgeTxt}>{curLevel.label} · {subIdx + 1}/{ex.levels!.length}</Text>
                </View>
              )}
            </View>

            {/* Material real necesario: se anuncia ANTES de empezar la actividad */}
            {!!ex.materials && (
              <View style={s.materialsCard}>
                <Text style={{ fontSize: 18 }}>🧺</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.materialsKicker}>ANTES DE EMPEZAR · NECESITARÁS</Text>
                  <Text style={s.materialsTxt}>{ex.materials}</Text>
                </View>
              </View>
            )}

            {/* Consigna del tutor */}
            <View style={s.instructionCard}>
              <View style={s.instructionHead}>
                <View style={s.instructionIcon}><Text style={{ fontSize: 18 }}>📢</Text></View>
                {/* flex:1: sin él, el subtítulo largo se salía de la tarjeta */}
                <View style={{ flex: 1 }}>
                  <Text style={s.instructionKicker}>PASO 1 · CONSIGNA DEL TUTOR</Text>
                  <Text style={s.instructionSmall}>Este texto es para el adulto: díselo al niño con tus palabras</Text>
                </View>
              </View>
              <Text style={s.instructionText}>{curLevel ? curLevel.read : ex.read}</Text>
              <View style={{ marginTop: 12 }}>
                <SpeakButton text={curLevel ? curLevel.read : ex.read} label="Escuchar consigna" />
              </View>
            </View>

            {/* ===== Stage / mini-juego ===== */}
            <View style={s.stageCard}>
              <Text style={s.stageLabel}>PASO 2 · {curLevel ? `NIVEL ${curLevel.label.toUpperCase()}` : (ex.stageLabel ?? 'Actividad guiada').toUpperCase()}</Text>

              {/* Selector de ronda: contenido nuevo sin salir del ejercicio */}
              {!curLevel && totalRounds > 1 && (
                <View style={s.roundRow}>
                  <Text style={s.roundLbl}>Ronda {(round % totalRounds) + 1} de {totalRounds}</Text>
                  <Pressable onPress={nextRound} style={s.roundBtn} accessibilityRole="button" accessibilityLabel="Cambiar a otra ronda con contenido nuevo">
                    <Text style={s.roundBtnTxt}>🔄 Otra ronda</Text>
                  </Pressable>
                </View>
              )}

              {curLevel && (
                <View style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Pressable onPress={() => openZoom(curLevel.instrIcon, ex.name)} accessibilityRole="imagebutton" accessibilityLabel="Ampliar el icono">
                    <View style={s.instrHero}><Text style={{ fontSize: 54 }}>{curLevel.instrIcon}</Text></View>
                  </Pressable>
                  <Text style={s.instrHint}>{curLevel.instrHint}</Text>
                </View>
              )}

              {!curLevel && ex.stage === 'phrase' && (
                <>
                  <View style={s.phraseBox}>
                    {!!ex.phraseEmoji && (
                      <EmojiTile emoji={ex.phraseEmoji} cap={ex.phrase?.toLowerCase()} size={92} bgIndex={1} onZoom={openZoom} />
                    )}
                    <Text style={s.phraseTxt}>“{ex.phrase}”</Text>
                    <SpeakButton text={ex.phrase!} label="Oír la palabra despacio" voice="slow" />
                  </View>
                  {/* Con pérdida auditiva la voz sintética cuesta de imitar: el
                      modelo principal debe ser la voz en vivo del adulto. */}
                  <Text style={s.modelNote}>💡 El mejor modelo es tu voz: dísela tú primero, cerca y despacio. La voz de la app es solo un refuerzo.</Text>
                  <MicPracticeCard target={ex.phrase!} />
                </>
              )}

              {/* FF-1 · unir de verdad en la tablet cada imagen con su vocal:
                  1) toca la imagen (la app la nombra) · 2) toca su vocal. */}
              {ex.stage === 'vowels' && (
                <>
                  <Text style={s.stageHint}>1º Toca una imagen para oír su nombre · 2º Toca la vocal con la que empieza</Text>
                  <View style={s.tilesRow}>
                    {ex.tiles!.map((t, i) => {
                      const done = !!matchOk[i];
                      const sel = matchSel === i;
                      return (
                        <Pressable
                          key={i}
                          // Ficha interior plana: el Pressable de zoom anidado
                          // robaba el toque y el juego "no funcionaba".
                          onPress={() => tapMatchTile(i)}
                          onLongPress={() => openZoom(t.emoji, t.cap)}
                          accessibilityRole="button"
                          accessibilityLabel={done ? `${t.cap}: ya unida con su vocal` : `Elegir la imagen de ${t.cap}`}
                          style={[s.matchTile, sel && s.matchTileSel, done && s.matchTileOk]}
                        >
                          <EmojiTile emoji={t.emoji} cap={t.cap} size={78} bgIndex={i} />
                          <Text style={s.tileCap}>{t.cap}</Text>
                          <Text style={s.matchTileMark}>{done ? `✅ ${initialVowel(t.cap)}` : sel ? '👆 elegida' : ' '}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={s.vowelRow}>
                    {VOWELS.map((v) => {
                      const used = ex.tiles!.some((t, i) => matchOk[i] && initialVowel(t.cap) === v);
                      const wrong = wrongVowel === v;
                      return (
                        <Pressable
                          key={v}
                          onPress={() => tapMatchVowel(v)}
                          accessibilityRole="button"
                          accessibilityLabel={`Vocal ${v}`}
                          style={[s.vowel, used && s.vowelRight, wrong && s.vowelWrong]}
                        >
                          <Text style={[s.vowelTxt, used && { color: '#fff' }, wrong && { color: V.color.error }]}>{v}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {matchOk.filter(Boolean).length === ex.tiles!.length && (
                    <Text style={s.matchDone}>🎉 ¡Todas unidas! Puedes pasar a otra ronda o evaluar abajo.</Text>
                  )}
                  <View style={{ alignItems: 'center', marginTop: 12 }}>
                    <SpeakButton text={ex.tiles!.map((t) => t.cap).join(', ')} label="Oír todos los nombres" voice="slow" />
                  </View>
                </>
              )}

              {ex.stage === 'fill' && (
                <>
                  {!!ex.fillEmoji && (
                    <View style={{ alignItems: 'center', marginBottom: 12 }}>
                      <EmojiTile emoji={ex.fillEmoji} cap={ex.fillCap} size={86} bgIndex={5} onZoom={openZoom} />
                    </View>
                  )}
                  {/* Primero se OYE la palabra completa; después se completa. */}
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <SpeakButton text={ex.fillCap!} label="1º Oír la palabra completa" voice="slow" />
                  </View>
                  <View style={s.fillRow}>
                    <Text style={s.fillBig}>{ex.fillBefore}</Text>
                    <View style={[s.fillSlot, fillPick ? (fillPick === ex.fillAnswer ? s.fillSlotOk : s.fillSlotBad) : s.fillSlotEmpty]}>
                      <Text style={[s.fillSlotTxt, { color: fillPick ? (fillPick === ex.fillAnswer ? '#fff' : V.color.error) : '#c2cbca' }]}>{fillPick || '?'}</Text>
                    </View>
                    <Text style={s.fillBig}>{ex.fillAfter}</Text>
                  </View>
                  <View style={s.vowelRow}>
                    {VOWELS.map((v) => (
                      <Pressable
                        key={v}
                        onPress={() => { if (fillPick !== v) { setFillPick(v); speakVerdict(v === ex.fillAnswer); } }}
                        style={[s.vowel, fillPick === v && (v === ex.fillAnswer ? s.vowelRight : s.vowelOn)]}
                      >
                        <Text style={[s.vowelTxt, fillPick === v && s.vowelTxtOn]}>{v}</Text>
                      </Pressable>
                    ))}
                  </View>
                  {!!ex.fillCap && (
                    <MicPracticeCard
                      target={ex.fillCap}
                      prompt={`Cuando complete la palabra, pulsa el micro y que diga: “${ex.fillCap}”`}
                    />
                  )}
                </>
              )}

              {ex.stage === 'intruder' && (
                <>
                  {/* Apoyo auditivo pedido por los evaluadores: oír las palabras
                      que aparecen antes de buscar el intruso. */}
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <SpeakButton text={ex.intruder!.map((t) => t.cap).join(', ')} label="Oír las palabras" voice="slow" />
                  </View>
                  <AnswerTileGrid
                    tiles={ex.intruder!}
                    answer={ex.intruderAnswer!}
                    picked={intruderPick}
                    revealAnswer
                    onZoom={openZoom}
                    // Nombra la ficha tocada antes del refuerzo: asociación
                    // palabra-imagen directa (mismo patrón que en emociones).
                    onPick={(i, isAns) => {
                      setIntruderPick(i);
                      speakToChild(`${ex.intruder![i].cap}. ${isAns ? praisePhrase() : almostPhrase()}`);
                    }}
                  />
                </>
              )}

              {ex.stage === 'emotions' && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <Pressable onPress={() => openZoom(ex.emotionFace!, '¿Cómo se siente?')} accessibilityRole="imagebutton" accessibilityLabel="Ampliar la cara">
                      <Text style={{ fontSize: 62 }}>{ex.emotionFace}</Text>
                    </Pressable>
                    <Text style={s.emoQ}>¿Cómo se siente?</Text>
                    {/* Apoyo auditivo: oír las opciones antes de elegir */}
                    <View style={{ marginTop: 10 }}>
                      <SpeakButton
                        text={`¿Cómo se siente? ¿${EMO.map((e) => e.label).join(', ')}?`}
                        label="Oír las opciones"
                      />
                    </View>
                  </View>
                  <View style={s.grid2}>
                    {EMO.map((e) => {
                      const pickedEmo = emotionPick === e.label;
                      const isAns = e.label === ex.emotionAnswer;
                      const ok = pickedEmo && isAns; const bad = pickedEmo && !isAns;
                      return (
                        <Pressable
                          key={e.label}
                          // Refuerzo inmediato: se nombra la emoción tocada y se
                          // celebra/anima en la misma locución, sin esperas.
                          onPress={() => { if (emotionPick !== e.label) { setEmotionPick(e.label); speakToChild(`${e.label}. ${isAns ? praisePhrase() : almostPhrase()}`); } }}
                          style={[s.emoOpt, ok && s.gridTileOk, bad && s.gridTileBad]}
                        >
                          <Text style={{ fontSize: 24 }}>{e.face}</Text>
                          <Text style={s.emoLabel}>{e.label}</Text>
                          <Text style={{ marginLeft: 'auto', fontSize: 14 }}>{ok ? '✅' : bad ? '❌' : ''}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {/* SE-2 / MS-2 · escucha el audio y toca la imagen correcta */}
              {ex.stage === 'choice' && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <SpeakButton
                      text={ex.choicePrompt!}
                      label={ex.choiceLabel ?? 'Oír la pregunta'}
                      voice={ex.choiceVoice === 'slow' ? 'slow' : 'tutor'}
                    />
                  </View>
                  <AnswerTileGrid
                    tiles={ex.options!}
                    answer={ex.optionAnswer!}
                    picked={choicePick}
                    size={78}
                    center
                    tileStyle={{ width: '30%', minWidth: 96 }}
                    onZoom={openZoom}
                    // Nombra la opción tocada («niña. ¡Muy bien!»): refuerza la
                    // palabra objetivo justo al tocarla.
                    onPick={(i, isAns) => {
                      setChoicePick(i);
                      speakToChild(`${ex.options![i].cap}. ${isAns ? praisePhrase() : almostPhrase()}`);
                    }}
                  />
                </>
              )}

              {/* MS-1 · apoyo visual real: tarjeta con UNO frente a tarjeta con MUCHOS */}
              {ex.stage === 'plural' && (
                <>
                  <View style={{ flexDirection: 'row', gap: 11 }}>
                    {([['one', 1], ['many', 3]] as const).map(([kind, n]) => {
                      const tapped = pluralPick === kind;
                      const isAns = kind === 'many';
                      const label = kind === 'one' ? `un ${ex.plural!.cap}` : `muchos ${ex.plural!.capPlural}`;
                      return (
                        <Pressable
                          key={kind}
                          onPress={() => {
                            if (pluralPick !== kind) {
                              setPluralPick(kind);
                              speakToChild(`${label}. ${isAns ? praisePhrase() : 'Ahí solo hay uno. Busca donde hay muchos.'}`);
                            }
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Tarjeta con ${label}`}
                          style={[s.pluralCard, tapped && isAns && s.gridTileOk, tapped && !isAns && s.gridTileBad]}
                        >
                          <Text style={{ fontSize: kind === 'one' ? 52 : 30, textAlign: 'center' }}>
                            {Array.from({ length: n }).map(() => ex.plural!.emoji).join(' ')}
                          </Text>
                          <Text style={s.pluralCap}>{label}</Text>
                          <Text style={{ fontSize: 14, marginTop: 4 }}>{tapped ? (isAns ? '✅' : '❌') : ' '}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <MicPracticeCard
                    target={ex.plural!.capPlural}
                    prompt={`Pregúntale «¿qué son?» y pulsa el micro para que diga: “${ex.plural!.capPlural}”`}
                  />
                </>
              )}

              {/* MS-3 · escucha la frase y ordénala tocando las fichas en pantalla */}
              {ex.stage === 'order' && (() => {
                const parts = ex.parts!;
                // Fichas desordenadas a propósito: rotación en una posición,
                // que nunca coincide con el orden correcto y vale para
                // cualquier número de fichas (no solo 3).
                const display = parts.map((_, k) => (k + 1) % parts.length);
                const complete = orderPicks.length === parts.length;
                const correct = complete && orderPicks.every((p, k) => p === k);
                const question = (role: string) =>
                  role === 'Sujeto' ? '¿Quién?' : role === 'Verbo' ? '¿Qué hace?' : '¿Qué cosa?';
                return (
                  <>
                    <View style={{ alignItems: 'center', marginBottom: 14 }}>
                      <SpeakButton text={ex.sentence!} label="1º Oír la frase" voice="child" />
                    </View>
                    {/* Huecos donde va cayendo la frase en orden */}
                    <View style={s.orderSlots}>
                      {parts.map((p, i) => {
                        const pickedHere = orderPicks[i] != null ? parts[orderPicks[i]] : null;
                        return (
                          <View key={i} style={[s.orderSlot, pickedHere && s.orderSlotFilled]}>
                            <Text style={s.diceRole}>{question(p.role)}</Text>
                            <Text style={{ fontSize: 26 }}>{pickedHere ? pickedHere.emoji : '·'}</Text>
                            <Text style={s.tileCap}>{pickedHere ? pickedHere.cap : ' '}</Text>
                          </View>
                        );
                      })}
                    </View>
                    {/* Fichas desordenadas: tocarlas en orden construye la frase */}
                    <View style={s.diceRow}>
                      {display.map((i) => {
                        const used = orderPicks.includes(i);
                        return (
                          <Pressable
                            key={i}
                            onPress={() => tapOrderTile(i)}
                            onLongPress={() => openZoom(parts[i].emoji, parts[i].cap)}
                            disabled={used}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: used }}
                            accessibilityLabel={used ? `Ficha ${parts[i].cap}, ya colocada` : `Ficha ${parts[i].cap}`}
                            style={[{ flex: 1, alignItems: 'center' }, used && { opacity: 0.25 }]}
                          >
                            <EmojiTile emoji={parts[i].emoji} cap={parts[i].cap} size={82} bgIndex={i + 2} />
                            <Text style={s.tileCap}>{parts[i].cap}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {correct && (
                      <View style={s.sentenceBox}><Text style={s.sentenceTxt}>🎉 “{ex.sentence}”</Text></View>
                    )}
                    {complete && !correct && (
                      <Text style={s.matchDone}>Casi… vuelve a escuchar la frase y probad otra vez.</Text>
                    )}
                    {orderPicks.length > 0 && !complete && (
                      <Pressable onPress={() => setOrderPicks([])} accessibilityRole="button">
                        <Text style={s.orderReset}>↺ Volver a empezar</Text>
                      </Pressable>
                    )}
                  </>
                );
              })()}

              {!curLevel && ex.stage === 'instruction' && (
                <View style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Pressable onPress={() => openZoom(ex.instrIcon!, ex.name)} accessibilityRole="imagebutton" accessibilityLabel="Ampliar el icono">
                    <View style={s.instrHero}><Text style={{ fontSize: 54 }}>{ex.instrIcon}</Text></View>
                  </Pressable>
                  <Text style={s.instrHint}>{ex.instrHint}</Text>
                  {/* Escenas tocables: apoyo visual + ejemplo hablado de cada
                      modo del juego (p. ej. PR-2: voz bajita / voz normal). */}
                  {!!ex.scenes && (
                    <View style={s.sceneRow}>
                      {ex.scenes.map((sc) => (
                        <Pressable
                          key={sc.label}
                          onPress={() => speakToChild(sc.say)}
                          accessibilityRole="button"
                          accessibilityLabel={`${sc.label}. Oír un ejemplo`}
                          style={s.sceneCard}
                        >
                          <Text style={{ fontSize: 34 }}>{sc.emoji}</Text>
                          <Text style={s.sceneLabel}>{sc.label}</Text>
                          <Text style={s.sceneHear}>🔊 Oír ejemplo</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Registro de respuesta libre (voz o escrito) y práctica de micro
                  dirigida: pedidos por los evaluadores en pragmática. */}
              {!curLevel && !!ex.capture && (
                <ResponseCaptureCard
                  // key por ejercicio: sin ella React reutiliza la misma tarjeta
                  // entre PR-1 y PR-2 y la respuesta anterior quedaba a la vista.
                  key={ex.code}
                  prompt={ex.capture}
                  onCapture={(t) => {
                    const clean = t.trim();
                    if (clean) capturesRef.current[ex.code] = { name: ex.name, text: clean };
                    else delete capturesRef.current[ex.code];
                  }}
                />
              )}
              {!curLevel && !!ex.micTarget && <MicPracticeCard target={ex.micTarget} prompt={ex.micPrompt} altTargets={ex.micAlt} />}

              <Text style={s.zoomTip}>🔍 Para ampliar una imagen: tócala, o en los juegos mantenla pulsada</Text>
            </View>

            {/* Versión en movimiento */}
            <View style={s.moveCard}>
              <View style={s.moveHead}>
                <View style={s.moveIcon}><Text style={{ fontSize: 17 }}>🏃</Text></View>
                <Text style={s.moveKicker}>PASO 3 · VERSIÓN EN MOVIMIENTO</Text>
                <View style={{ marginLeft: 'auto' }}>
                  <SpeakButton text={ex.move} voice="child" compact />
                </View>
              </View>
              <Text style={s.moveTxt}>{ex.move}</Text>
            </View>

            {/* Espera */}
            <View style={s.waitRow}>
              <Text style={{ fontSize: 14 }}>👂</Text>
              <Text style={s.waitTxt}>Espera y observa la respuesta del niño</Text>
            </View>

            {/* ===== Evaluación EPT-3 ===== */}
            <View style={s.scoreCard}>
              <Text style={s.scoreKicker}>PASO 4 · EVALUACIÓN</Text>
              <Text style={s.scoreTitle}>¿Cómo le ha salido?</Text>
              <Text style={s.scoreSub}>
                {totalRounds > 1 && !curLevel
                  ? 'Jugad las rondas que queráis y toca la frase que mejor describa su respuesta'
                  : 'Toca la frase que mejor describa su respuesta'}
              </Text>
              {/* Explicación en lenguaje llano de la escala (los evaluadores
                  señalaron que "EPT-3" no se explica fuera del manual). */}
              <Pressable
                onPress={() => setEptInfoOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel="Qué es la escala EPT-3"
                style={s.eptInfoBtn}
              >
                <Text style={s.eptInfoBtnTxt}>{eptInfoOpen ? '▾' : 'ℹ️'} ¿Qué es la escala EPT-3?</Text>
              </Pressable>
              {eptInfoOpen && (
                <View style={s.eptInfoBox}>
                  <Text style={s.eptInfoTxt}>
                    La EPT-3 es la escala de 3 niveles con la que se anota cómo respondió el niño en cada
                    actividad: 1★ todavía no lo consigue, 2★ lo consigue con ayuda del adulto y 3★ lo
                    consigue él solo. No es una nota: sirve para que el logopeda vea el progreso entre sesiones.
                  </Text>
                </View>
              )}
              {[1, 2, 3].map((val) => {
                const on = picked === val;
                return (
                  <Pressable key={val} onPress={() => pick(val)} style={[s.scoreRow, on && s.scoreRowOn]}>
                    <View style={s.scoreStarsCol}>
                      <Text style={[s.scoreStars, { color: on ? V.color.star : '#dfe5e4' }]}>{starStr(val)}</Text>
                      <Text style={[s.scoreNum, { color: on ? '#92711a' : '#c2cbca' }]}>{val}★</Text>
                    </View>
                    <Text style={[s.scoreText, { color: on ? V.color.textPrimary : V.color.textSecondary }]}>{ex.ept[val - 1]}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ===== Panel del adulto · caos comunicativo (Fase 2) ===== */}
            <ValeriaAdultChaosPanel
              distractorOn={distractorOn}
              onDistractorChange={setDistractorOn}
              onLaunchPragmatic={() => setPragmaticOpen(true)}
            />
          </>
        ) : (
          /* ===== Completado ===== */
          <View style={s.doneCard}>
            <View style={s.doneIcon}><Text style={{ fontSize: 36 }}>🎉</Text></View>
            <Text style={s.doneTitle}>¡Sesión completada!</Text>
            <Text style={s.doneSub}>
              {total === 1
                ? 'Has evaluado este ejercicio. El resultado se ha guardado en el dispositivo.'
                : `Has evaluado las ${total} actividades del plan. El resultado se guardó en el dispositivo.`}
            </Text>

            {/* Recompensas estilo Duolingo */}
            {reward && (
              <View style={s.rewardBox}>
                <View style={s.rewardRow}>
                  <View style={s.rewardChip}>
                    <Text style={s.rewardChipBig}>+{reward.xpGained}</Text>
                    <Text style={s.rewardChipLbl}>XP</Text>
                  </View>
                  <View style={[s.rewardChip, { backgroundColor: '#fff4e5' }]}>
                    <Text style={s.rewardChipBig}>🔥 {reward.streak}</Text>
                    <Text style={s.rewardChipLbl}>{reward.streak === 1 ? 'día de racha' : 'días de racha'}</Text>
                  </View>
                </View>
                {reward.streakExtended && reward.streak > 1 && (
                  <Text style={s.rewardNote}>¡Racha ampliada! Vuelve mañana para no perderla.</Text>
                )}
                <View style={s.levelRow}>
                  <Text style={s.levelLbl}>Nivel {reward.level} · {reward.levelName}{reward.levelUp ? '  🎊 ¡SUBISTE DE NIVEL!' : ''}</Text>
                  <View style={s.levelTrack}>
                    <View style={[s.levelFill, { width: `${Math.round(levelProgress(reward.xpTotal) * 100)}%` }]} />
                  </View>
                  <Text style={s.levelToGo}>{xpToNext(reward.xpTotal)} XP para el siguiente nivel</Text>
                </View>
                {reward.newBadges.length > 0 && (
                  <View style={s.badgeWrap}>
                    <Text style={s.badgeTitle}>🏅 ¡LOGROS DESBLOQUEADOS!</Text>
                    {reward.newBadges.map((b) => (
                      <View key={b.id} style={s.badgeRow}>
                        <Text style={{ fontSize: 22 }}>{b.icon}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={s.badgeName}>{b.name}</Text>
                          <Text style={s.badgeDesc}>{b.desc}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={s.doneStatBox}>
              <Text style={s.doneStatKicker}>PROMEDIO DE LA SESIÓN · ESCALA EPT-3 (DE 1★ A 3★)</Text>
              <Text style={s.doneStatBig}>{sumAvg.toFixed(1)}<Text style={s.doneStatSlash}> / 3</Text></Text>
              <Text style={s.doneStatStars}>{starStr(fullStars)}</Text>
              <View style={s.recapRow}>
                {results.map((v, i) => (
                  <View key={i} style={s.recapCell}>
                    <Text style={s.recapCode}>{DB[sessionIds[i]].code}</Text>
                    <Text style={s.recapStars}>{'★'.repeat(v)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Pressable onPress={() => { clearInterval(timerRef.current); navigation.navigate('Results'); }} style={s.primaryBtn}>
              <Text style={s.primaryBtnTxt}>Ver Resultados →</Text>
            </Pressable>
            <Pressable onPress={restart}><Text style={s.linkBtn}>Repetir sesión</Text></Pressable>
            <Text style={s.redirect}>Redirigiendo a resultados en {countdown}s…</Text>
          </View>
        )}
      </ScrollView>

      {/* Confeti al completar */}
      {finished && <ConfettiBurst />}

      {/* ===== Zoom de imagen ===== */}
      <ZoomModal emoji={zoom?.emoji ?? ''} cap={zoom?.cap ?? ''} visible={!!zoom} onClose={() => setZoom(null)} />

      {/* ===== Distractor periférico (doble tarea): solo si el adulto lo activó ===== */}
      {distractorOn && !finished && <ValeriaDistractorBear />}

      {/* ===== Pausa activa entre ejercicios: cápsula TPR o Ruta de Rutina ===== */}
      {activeBreak && !finished && (
        <ValeriaSessionBreakOverlay
          brk={activeBreak}
          onDone={() => setActiveBreak(null)}
          onSkip={() => setActiveBreak(null)}
        />
      )}

      {/* ===== Quiebre pragmático lanzado desde el panel del adulto ===== */}
      {pragmaticOpen && <ValeriaPragmaticBreakOverlay onClose={() => setPragmaticOpen(false)} />}
    </View>
  );
};

// ----------------------------------------------------------------------------
const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 16, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  logo: { height: 21, width: 84, resizeMode: 'contain', marginBottom: 8 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 6 },
  backPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10 },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  counter: { backgroundColor: 'rgba(255,255,255,.18)', borderColor: 'rgba(255,255,255,.35)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  counterTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flex: 1, height: 7, borderRadius: 4 },

  scroll: { padding: 16, paddingBottom: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12, marginHorizontal: 2 },
  codeChip: { backgroundColor: V.color.primaryLight, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 },
  codeChipTxt: { color: V.color.primaryDark, fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  metaName: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary },
  metaCat: { fontSize: 11.5, fontWeight: '700', color: V.color.textMuted },
  levelBadge: { backgroundColor: V.color.primaryLight, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 },
  levelBadgeTxt: { color: V.color.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },

  materialsCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fffbeb', borderColor: '#f4e6b8', borderWidth: 1.5, borderRadius: 16, padding: 13, marginBottom: 12 },
  materialsKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: '#92711a' },
  materialsTxt: { fontSize: 13, fontWeight: '700', color: '#7c4a0e', marginTop: 3, lineHeight: 18 },

  instructionCard: { backgroundColor: V.color.primaryTint, borderColor: '#b8eee9', borderWidth: 1.5, borderRadius: 18, padding: 16, ...V.shadow.card },
  instructionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  instructionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  instructionKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  instructionSmall: { fontSize: 12.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 1 },
  instructionText: { marginTop: 13, fontSize: 14.5, fontWeight: '700', color: V.color.textPrimary, lineHeight: 20 },

  stageCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
  stageLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: V.color.textMuted, textAlign: 'center', marginBottom: 14 },
  roundRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1', borderRadius: 12, paddingVertical: 7, paddingHorizontal: 11, marginBottom: 14 },
  roundLbl: { fontSize: 12, fontWeight: '800', color: V.color.textSecondary },
  roundBtn: { backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  roundBtnTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  phraseBox: { backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#9bdfd9', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 22, paddingHorizontal: 16, alignItems: 'center', gap: 14 },
  phraseTxt: { fontSize: 32, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center', letterSpacing: -0.5 },

  // fichas emoji
  emojiTile: { borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e1e8e7', overflow: 'hidden' },
  zoomHintDot: { position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,.85)', alignItems: 'center', justifyContent: 'center' },
  zoomTip: { textAlign: 'center', fontSize: 11, fontWeight: '700', color: V.color.textMuted, marginTop: 13 },

  tilesRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 16 },
  tileCap: { fontSize: 11, color: V.color.textMuted, marginTop: 5, fontWeight: '700' },
  vowelRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  vowel: { minWidth: 46, height: 48, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1' },
  vowelOn: { backgroundColor: V.color.primaryLight, borderColor: V.color.primaryLight },
  vowelRight: { backgroundColor: V.color.primary, borderColor: V.color.primary },
  vowelWrong: { backgroundColor: V.color.errorBg, borderColor: '#fecdd3' },
  vowelTxt: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary },
  vowelTxtOn: { color: V.color.primaryDark },

  // FF-1 · unir imagen ↔ vocal
  stageHint: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: V.color.textSecondary, marginBottom: 12, lineHeight: 17 },
  matchTile: { alignItems: 'center', borderRadius: 16, borderWidth: 2, borderColor: 'transparent', padding: 4 },
  matchTileSel: { borderColor: V.color.primary, backgroundColor: V.color.primaryTint },
  matchTileOk: { borderColor: V.color.success, backgroundColor: V.color.successBg },
  matchTileMark: { fontSize: 11, fontWeight: '800', color: V.color.primaryDark, marginTop: 3, minHeight: 14 },
  matchDone: { textAlign: 'center', fontSize: 13, fontWeight: '800', color: '#0f8a63', marginTop: 12 },

  modelNote: { fontSize: 12, fontWeight: '700', color: V.color.textSecondary, lineHeight: 17, marginTop: 10, paddingHorizontal: 4 },

  // MS-1 · uno / muchos
  pluralCard: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#eef3f3', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8 },
  pluralCap: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary, marginTop: 8 },

  // MS-3 · huecos de la frase ordenada
  orderSlots: { flexDirection: 'row', gap: 9, justifyContent: 'center', marginBottom: 14 },
  orderSlot: { flex: 1, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#b8eee9', borderRadius: 14, paddingVertical: 9 },
  orderSlotFilled: { borderStyle: 'solid', borderColor: V.color.success, backgroundColor: V.color.successBg },
  orderReset: { textAlign: 'center', fontSize: 12.5, fontWeight: '800', color: V.color.primaryDark, marginTop: 12 },

  // Explicación EPT-3
  eptInfoBtn: { alignSelf: 'center', marginBottom: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9, backgroundColor: V.color.primaryLight },
  eptInfoBtnTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  eptInfoBox: { backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1', borderRadius: 12, padding: 12, marginBottom: 12 },
  eptInfoTxt: { fontSize: 12.5, fontWeight: '600', color: V.color.textSecondary, lineHeight: 18 },

  fillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  fillBig: { fontSize: 42, fontWeight: '800', letterSpacing: 6, color: V.color.textPrimary },
  fillSlot: { width: 46, height: 52, marginHorizontal: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fillSlotEmpty: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#b8eee9', borderStyle: 'dashed' },
  fillSlotOk: { backgroundColor: V.color.primary },
  fillSlotBad: { backgroundColor: V.color.errorBg, borderWidth: 2, borderColor: '#fecdd3' },
  fillSlotTxt: { fontSize: 34, fontWeight: '800' },

  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  gridTile: { width: '47%', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#eef3f3', borderRadius: 14, padding: 9 },
  gridTileOk: { backgroundColor: V.color.successBg, borderColor: V.color.success },
  gridTileBad: { backgroundColor: V.color.errorBg, borderColor: '#fecdd3' },
  gridCapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 7 },
  gridCap: { fontSize: 12, color: V.color.textSecondary, fontWeight: '700' },

  emoQ: { fontSize: 13, fontWeight: '700', color: V.color.textMuted, marginTop: 6 },
  emoOpt: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12, paddingHorizontal: 13, borderRadius: 14, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1' },
  emoLabel: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },

  diceRow: { flexDirection: 'row', gap: 9, justifyContent: 'center', marginBottom: 14 },
  diceRole: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: V.color.primaryDark, marginBottom: 5 },
  sentenceBox: { backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 12, padding: 11, alignItems: 'center' },
  sentenceTxt: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary },

  instrBig: { width: 64, height: 64, borderRadius: 20, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  // Icono protagonista de las actividades guiadas: los testers veían el de
  // 64 px "poco llamativo" (p. ej. Atención Conjunta).
  instrHero: { width: 112, height: 112, borderRadius: 30, backgroundColor: V.color.primaryLight, borderWidth: 2, borderColor: V.color.borderActive, alignItems: 'center', justifyContent: 'center' },
  instrHint: { fontSize: 14, fontWeight: '700', color: V.color.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 12 },
  sceneRow: { flexDirection: 'row', gap: 11, marginTop: 14, alignSelf: 'stretch' },
  sceneCard: { flex: 1, alignItems: 'center', backgroundColor: V.color.pageBg, borderWidth: 1.5, borderColor: '#eef2f1', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8 },
  sceneLabel: { fontSize: 12.5, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center', marginTop: 7, lineHeight: 17 },
  sceneHear: { fontSize: 11, fontWeight: '800', color: V.color.primaryDark, marginTop: 7 },

  // versión en movimiento
  moveCard: { backgroundColor: '#fff7ed', borderColor: '#fcd9a8', borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 12 },
  moveHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  moveIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  moveKicker: { flex: 1, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#9a5b13' },
  moveTxt: { marginTop: 9, fontSize: 13.5, fontWeight: '700', color: '#7c4a0e', lineHeight: 19 },

  waitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 11 },
  waitTxt: { color: V.color.primaryDark, fontSize: 12.5, fontWeight: '700' },

  scoreCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
  scoreKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: V.color.textMuted, textAlign: 'center', marginBottom: 4 },
  scoreTitle: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center' },
  scoreSub: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, textAlign: 'center', marginTop: 2, marginBottom: 13 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, marginBottom: 9, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef3f3' },
  scoreRowOn: { backgroundColor: '#fffbeb', borderWidth: 1.5, borderColor: V.color.star },
  scoreStarsCol: { width: 48, alignItems: 'center', gap: 3 },
  scoreStars: { fontSize: 15, letterSpacing: 1 },
  scoreNum: { fontSize: 10, fontWeight: '800' },
  scoreText: { flex: 1, fontSize: 12.5, fontWeight: '700', lineHeight: 17 },

  doneCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 22, padding: 24, alignItems: 'center', ...V.shadow.card },
  doneIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary, marginTop: 16 },
  doneSub: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 18 },

  // recompensas
  rewardBox: { alignSelf: 'stretch', marginTop: 18, backgroundColor: '#f0fdf9', borderWidth: 1.5, borderColor: '#b8eee9', borderRadius: 18, padding: 16 },
  rewardRow: { flexDirection: 'row', gap: 10 },
  rewardChip: { flex: 1, backgroundColor: '#e6f9f8', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  rewardChipBig: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary },
  rewardChipLbl: { fontSize: 11, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  rewardNote: { textAlign: 'center', fontSize: 11.5, fontWeight: '700', color: '#9a5b13', marginTop: 10 },
  levelRow: { marginTop: 14 },
  levelLbl: { fontSize: 12.5, fontWeight: '800', color: V.color.textPrimary },
  levelTrack: { height: 10, backgroundColor: '#dcefed', borderRadius: 6, overflow: 'hidden', marginTop: 7 },
  levelFill: { height: '100%', backgroundColor: V.color.primary, borderRadius: 6 },
  levelToGo: { fontSize: 11, fontWeight: '700', color: V.color.textMuted, marginTop: 5 },
  badgeWrap: { marginTop: 14, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#f4e6b8', borderRadius: 14, padding: 12 },
  badgeTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#92711a', textAlign: 'center', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  badgeName: { fontSize: 13.5, fontWeight: '800', color: V.color.textPrimary },
  badgeDesc: { fontSize: 11.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 1 },

  doneStatBox: { alignSelf: 'stretch', marginTop: 16, backgroundColor: V.color.pageBg, borderRadius: 18, padding: 18, alignItems: 'center' },
  doneStatKicker: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: V.color.textMuted },
  doneStatBig: { fontSize: 42, fontWeight: '800', color: V.color.textPrimary, marginTop: 8 },
  doneStatSlash: { fontSize: 20, color: V.color.textMuted, fontWeight: '800' },
  doneStatStars: { fontSize: 22, letterSpacing: 3, color: V.color.star, marginTop: 8 },
  // flexWrap: la sesión completa puede traer 13 ejercicios y una sola fila los aplastaría
  recapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16, alignSelf: 'stretch', justifyContent: 'center' },
  recapCell: { flexGrow: 1, flexBasis: '17%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef3f3', borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
  recapCode: { fontSize: 10, fontWeight: '800', color: '#c2cbca' },
  recapStars: { fontSize: 13, color: V.color.star, marginTop: 3 },
  primaryBtn: { alignSelf: 'stretch', marginTop: 20, backgroundColor: V.color.primary, borderRadius: 15, paddingVertical: 16, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  linkBtn: { marginTop: 11, color: V.color.primaryDark, fontSize: 13.5, fontWeight: '800' },
  redirect: { color: V.color.textMuted, fontSize: 11.5, marginTop: 14, fontWeight: '600' },

  // zoom
  zoomOverlay: { flex: 1, backgroundColor: 'rgba(11,18,32,.78)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  zoomCard: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 28, paddingVertical: 38, paddingHorizontal: 24, alignItems: 'center' },
  zoomEmoji: { fontSize: 130, lineHeight: 150 },
  zoomCap: { fontSize: 26, fontWeight: '800', color: V.color.textPrimary, marginTop: 14, textTransform: 'capitalize' },
  zoomClose: { fontSize: 12, fontWeight: '700', color: V.color.textMuted, marginTop: 16 },
});

export default ValeriaExercisePlayerScreen;

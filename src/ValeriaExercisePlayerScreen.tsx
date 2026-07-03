// ============================================================================
// Valeria+ · Player de Sesión de Terapia (V4.0)
// Flujo guiado tutor + niño: consigna real, mini-juego visual por tipo de
// ejercicio y evaluación con la escala clínica EPT-3 (1★ / 2★ / 3★).
//
// Novedades V4:
//   · Fichas ilustradas con emojis grandes (adiós placeholders) y zoom al tocar.
//   · "Versión en movimiento" por ejercicio + Pausas Activas entre ejercicios.
//   · Confeti y recompensas estilo Duolingo al terminar (XP, racha, logros).
//
// Navegación: navigation.navigate('ExercisePlayer', { id?: string })
//   · Con `id`  -> sesión de un solo ejercicio.
//   · Sin `id`  -> sesión por defecto (plan prescrito de ejemplo).
// ============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Modal, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { registerSession, SessionReward, levelProgress, xpToNext } from './valeriaGamification';
// import logoWhite from '../../assets/valeria-logo-white.png';

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------
type Stage = 'phrase' | 'vowels' | 'fill' | 'intruder' | 'emotions' | 'dice' | 'instruction';

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
  // datos de mini-juego
  phrase?: string; phraseEmoji?: string;
  tiles?: Tile[];
  fillBefore?: string; fillAfter?: string; fillAnswer?: string; fillEmoji?: string; fillCap?: string;
  intruder?: Tile[]; intruderAnswer?: number;
  emotionFace?: string; emotionAnswer?: string;
  parts?: { role: string; cap: string; emoji: string }[]; sentence?: string;
  instrIcon?: string; instrHint?: string;
  // Progresión Inicial → Intermedio → Avanzado dentro de la misma sesión
  // (ejercicios de Lenguaje, protocolo ACOPROS). Si está presente, sustituye
  // a `read`/`instrIcon`/`instrHint` para cada uno de los 3 sub-pasos.
  levels?: { label: 'Inicial' | 'Intermedio' | 'Avanzado'; read: string; instrIcon: string; instrHint: string }[];
}

// ----------------------------------------------------------------------------
// Base de datos de ejercicios (13 Audición + 7 Lenguaje) con reglas EPT-3
// ----------------------------------------------------------------------------
const DB: Record<string, Exercise> = {
  ff1: { code: 'FF-1', name: 'Asociación vocal inicial', category: 'Fonética-Fonología',
    read: 'Mira las imágenes. Di cómo se llama cada una y con qué vocal empieza.',
    stage: 'vowels', stageLabel: 'Asocia imagen y vocal inicial',
    tiles: [{ cap: 'araña', emoji: '🕷️' }, { cap: 'elefante', emoji: '🐘' }, { cap: 'isla', emoji: '🏝️' }],
    move: 'Dibujad la vocal en el aire con el brazo bien grande cada vez que acierte.',
    ept: ['No repite ni asocia la vocal inicial.', 'Acierta la vocal tras una pista visual o énfasis del tutor.', 'Nombra la imagen y asocia la vocal inicial de forma espontánea.'] },
  ff2: { code: 'FF-2', name: 'Articulación de vocales', category: 'Fonética-Fonología',
    read: 'Vamos a repetir esta palabra juntos, articulando bien cada vocal.',
    stage: 'phrase', stageLabel: 'Repite la palabra', phrase: 'ZAPATO', phraseEmoji: '👟',
    move: 'Marchad por la sala pisando fuerte una sílaba en cada paso: ZA-PA-TO.',
    ept: ['No imita el sonido o realiza una aproximación muy lejana.', 'Imita la vocal aislada correctamente tras el modelo del adulto.', 'Produce la vocal y la palabra completa articulando con precisión.'] },
  ff3: { code: 'FF-3', name: 'Completar vocal faltante', category: 'Fonética-Fonología',
    read: 'A esta palabra le falta una vocal. ¿Cuál es? Tócala para completarla.',
    stage: 'fill', stageLabel: 'Completa la vocal que falta', fillBefore: 'S', fillAfter: 'L', fillAnswer: 'O', fillEmoji: '☀️', fillCap: 'sol',
    move: 'Cuando encuentre la vocal, brazos arriba formando un sol gigante.',
    ept: ['No identifica la vocal que falta ni responde al estímulo.', 'Completa la palabra con énfasis o ayuda visual directa.', 'Identifica y selecciona la vocal faltante de forma autónoma.'] },
  se1: { code: 'SE-1', name: 'Detección del intruso', category: 'Semántica',
    read: 'Tres de estas cosas se pueden comer. Toca la que NO pertenece al grupo.',
    stage: 'intruder', stageLabel: 'Toca el intruso',
    intruder: [{ cap: 'manzana', emoji: '🍎' }, { cap: 'plátano', emoji: '🍌' }, { cap: 'uva', emoji: '🍇' }, { cap: 'coche', emoji: '🚗' }], intruderAnswer: 3,
    move: 'Si se come, tocaos la barriga; si es el intruso, ¡salto de estrella!',
    ept: ['No identifica el intruso ni entiende la relación categorial.', 'Encuentra el intruso tras una pregunta guía.', 'Señala el intruso y explica el porqué de forma autónoma.'] },
  se2: { code: 'SE-2', name: 'Adivinanza por letra', category: 'Semántica',
    read: 'Adivina: empieza por "P", es una fruta amarilla y alargada. ¿Qué es?',
    stage: 'instruction', instrIcon: '🔎', instrHint: 'Da pistas del fonema, la categoría y la función del objeto.',
    move: 'Buscad por la habitación un objeto real que empiece por la misma letra.',
    ept: ['No logra adivinar el objeto aun con múltiples pistas.', 'Identifica el objeto tras pistas fonológicas y semánticas.', 'Adivina el objeto con la primera descripción y el fonema.'] },
  se3: { code: 'SE-3', name: 'Prendas y órdenes', category: 'Semántica',
    read: 'Dile al muñeco qué ponerse: "Ponle el gorro y los zapatos".',
    stage: 'instruction', instrIcon: '🧥', instrHint: 'Pide al niño vestir o colocar accesorios siguiendo tu orden verbal.',
    move: 'Jugad a vestirse de verdad: que traiga el gorro corriendo y se lo ponga.',
    ept: ['No asocia el vocabulario de las prendas ni ejecuta la orden.', 'Coloca la prenda tras una demostración del adulto.', 'Identifica la prenda y ejecuta la orden verbal compleja.'] },
  ms1: { code: 'MS-1', name: 'Singular / plural', category: 'Morfosintaxis',
    read: 'Aquí hay un gato y aquí hay muchos. ¿Cómo decimos cuando hay muchos?',
    stage: 'instruction', instrIcon: '🔢', instrHint: 'Trabaja la diferencia entre uno y muchos añadiendo el morfema de número.',
    move: 'Un salto grande si hay UNO, muchos saltitos seguidos si hay MUCHOS.',
    ept: ['No diferencia singular de plural.', 'Produce el plural tras el modelo o preguntas del tutor.', 'Evoca el plural espontáneamente añadiendo el morfema (-s/-es).'] },
  ms2: { code: 'MS-2', name: 'Flexión de género', category: 'Morfosintaxis',
    read: 'Si es "gato", la niña es "gat-a". Vamos a cambiar el género de las palabras.',
    stage: 'instruction', instrIcon: '⚥', instrHint: 'Asocia la terminación masculina/femenina en nombres y adjetivos.',
    move: 'Un lado de la sala es "gato" y el otro "gata": ¡corre al lado correcto!',
    ept: ['No distingue el género gramatical o confunde la terminación.', 'Evoca el femenino con ayuda del morfema final ("gat-a").', 'Clasifica y evoca el género de forma autónoma.'] },
  ms3: { code: 'MS-3', name: 'Estructura S-V-O', category: 'Morfosintaxis',
    read: 'Usa los dados para construir una frase: ¿quién?, ¿qué hace?, ¿a qué?',
    stage: 'dice', stageLabel: 'Construye la oración',
    parts: [{ role: 'Sujeto', cap: 'niño', emoji: '👦' }, { role: 'Verbo', cap: 'come', emoji: '😋' }, { role: 'Objeto', cap: 'manzana', emoji: '🍎' }], sentence: 'El niño come la manzana.',
    move: 'Teatralizad la frase: el niño hace de actor y "come" una manzana imaginaria.',
    ept: ['Solo nombra elementos aislados sin estructurar la oración.', 'Estructura la frase S-V-O con ayuda del inicio provisto.', 'Produce la oración completa respetando concordancia y orden.'] },
  pr1: { code: 'PR-1', name: 'Preguntas tipo ¿qué?', category: 'Pragmática',
    read: 'Pregúntale cosas del entorno: "¿Qué es esto?", "¿Qué está haciendo?".',
    stage: 'instruction', instrIcon: '💬', instrHint: 'Fomenta que responda y que formule preguntas sencillas por sí mismo.',
    move: 'Pasead por la casa como exploradores señalando objetos: "¿qué es esto?" en cada parada.',
    ept: ['No responde a la pregunta o ignora la interacción.', 'Responde adecuadamente tras un modelo de respuesta.', 'Responde con soltura y formula preguntas espontáneamente.'] },
  pr2: { code: 'PR-2', name: 'Adaptación del discurso', category: 'Pragmática',
    read: 'El peluche está dormido. Tenemos que hablar muy bajito para no despertarlo.',
    stage: 'instruction', instrIcon: '🤫', instrHint: 'Trabaja la modulación de la voz y el tono según el contexto del juego.',
    move: 'Caminad de puntillas hablando bajito; a la señal, ¡voz normal y paso fuerte!',
    ept: ['No ajusta su volumen o tono de voz al contexto.', 'Ajusta el tono tras la indicación o recordatorio del adulto.', 'Adapta registro y volumen espontáneamente en el juego de rol.'] },
  pr3: { code: 'PR-3', name: 'Reconocimiento de emociones', category: 'Pragmática',
    read: 'Mira esta cara. ¿Cómo se siente? Toca la emoción correcta.',
    stage: 'emotions', stageLabel: 'Reconoce la emoción', emotionFace: '😀', emotionAnswer: 'Alegría',
    move: 'Imitad la emoción con todo el cuerpo: cara, brazos y postura de estatua.',
    ept: ['No reconoce las expresiones ni asocia el vocabulario.', 'Identifica la emoción tras señalarle rasgos faciales clave.', 'Nombra la emoción y argumenta la causa de forma autónoma.'] },
  pr4: { code: 'PR-4', name: 'Petición de repetición', category: 'Pragmática',
    read: 'Si no entiendes algo, puedes pedir: "¿Qué?" o "¿Cómo?". Vamos a practicarlo.',
    stage: 'instruction', instrIcon: '🔁', instrHint: 'Enseña a solicitar aclaración ante un mensaje poco claro o inaudible.',
    move: 'Susurra una orden desde lejos; si no se entiende, que venga corriendo y pida "¿qué?".',
    ept: ['Se queda en silencio o abandona ante un mensaje confuso.', 'Pide repetición con la fórmula enseñada, tras indicación.', 'Pide clarificación de forma natural y espontánea.'] },
  atencion_conjunta: { code: 'M-1', name: 'Atención Conjunta', category: 'Mirar, burbujas y nombre',
    read: 'Llama al niño por su nombre y haz burbujas. Busca su mirada y el contacto visual.',
    stage: 'instruction', instrIcon: '👀', instrHint: 'Desarrolla contacto visual, seguimiento de la mirada y respuesta al nombre.',
    ept: ['Requiere instigación física para sostener la mirada brevemente.', 'Responde a su nombre tras múltiples llamados verbales.', 'Establece contacto visual espontáneo y sigue la mirada del tutor.'],
    move: 'Perseguid y explotad burbujas juntos: una burbuja, una mirada.',
    levels: [
      { label: 'Inicial', instrIcon: '🫧', read: 'Acerca las burbujas muy cerca de tu cara y llama su nombre. Busca un contacto visual breve, aunque sea de un instante.', instrHint: 'Estímulo de alto interés y muy cercano. Cualquier mirada breve cuenta.' },
      { label: 'Intermedio', instrIcon: '👀', read: 'Haz burbujas a un brazo de distancia. Llama su nombre y señala con el dedo hacia las burbujas.', instrHint: 'Favorece el seguimiento de la mirada hacia donde el tutor señala.' },
      { label: 'Avanzado', instrIcon: '🙋', read: 'Desde el otro lado de la habitación, llama su nombre una sola vez sin estímulo motivador a la vista.', instrHint: 'Busca respuesta espontánea al nombre sin apoyo visual ni cercanía.' },
    ] },
  imitacion: { code: 'M-2', name: 'Imitación Motora/Verbal', category: 'Aplausos, tambor y sílabas',
    read: 'Haz un gesto (aplaudir, tocar el tambor) y anímale a imitarte. Ahora una sílaba: "pa-pa".',
    stage: 'instruction', instrIcon: '👏', instrHint: 'Imita gestos motores gruesos y vocalizaciones simples en espejo.',
    ept: ['No copia los gestos ni produce sonidos imitativos.', 'Imita gestos o sonidos aislados con guía del adulto.', 'Realiza imitaciones motoras y verbales en espejo inmediato.'],
    move: 'Espejo humano: imitad gestos grandes (brazos, saltos, giros) por turnos.',
    levels: [
      { label: 'Inicial', instrIcon: '👏', read: 'Aplaude despacio frente a él y guía sus manos la primera vez. Repite el gesto solo.', instrHint: 'Gesto motor grueso aislado, con ayuda física si es necesario.' },
      { label: 'Intermedio', instrIcon: '🥁', read: 'Toca el tambor dos veces y di "pa-pa". Espera a que imite el gesto o el sonido sin ayuda física.', instrHint: 'Secuencia corta de gesto + sílaba, sin apoyo físico, solo modelo visual.' },
      { label: 'Avanzado', instrIcon: '🪞', read: 'Combina un gesto y una sílaba nueva ("ta-ta" + saltar) y observa si lo imita en espejo, inmediatamente y sin repetir el modelo.', instrHint: 'Imitación inmediata de una combinación nueva, sin repetición del modelo.' },
    ] },
  comprension: { code: 'M-3', name: 'Comprensión Verbal', category: 'Órdenes, cuerpo y categorías',
    read: 'Dale una orden de un paso: "Dame la pelota". Pídele que señale partes del cuerpo.',
    stage: 'instruction', instrIcon: '🧠', instrHint: 'Comprende instrucciones de un paso e identifica partes del cuerpo y objetos.',
    ept: ['No obedece instrucciones ni señala elementos solicitados.', 'Ejecuta la orden con ayuda de gestos de señalamiento.', 'Comprende la instrucción puramente verbal y la ejecuta.'],
    move: 'Jugad a "Simón dice" con órdenes de un paso y partes del cuerpo.',
    levels: [
      { label: 'Inicial', instrIcon: '🤲', read: 'Dile "Dame la pelota" mientras señalas la pelota con el dedo.', instrHint: 'Orden de un paso con apoyo gestual directo del tutor.' },
      { label: 'Intermedio', instrIcon: '🧍', read: 'Pídele "Tócate la nariz" y "Tócate la cabeza" sin gestos de apoyo.', instrHint: 'Identificación de partes del cuerpo solo con instrucción verbal.' },
      { label: 'Avanzado', instrIcon: '🧩', read: 'Dile sin ningún gesto: "Dame la pelota y siéntate". Observa si ejecuta los dos pasos en orden.', instrHint: 'Orden verbal de dos pasos, sin ningún apoyo gestual.' },
    ] },
  expresion: { code: 'M-4', name: 'Expresión Verbal', category: 'Onomatopeyas, nombrar y frases',
    read: '¿Cómo hace el perro? "Guau". Anímale a nombrar y pedir: "quiero agua".',
    stage: 'phrase', stageLabel: 'Evoca y nombra', phrase: 'QUIERO AGUA', phraseEmoji: '💧',
    ept: ['Solo usa gestos o balbuceos para expresar sus necesidades.', 'Expresa palabras simples tras el modelo directo del adulto.', 'Evoca palabras y oraciones de dos palabras espontáneamente.'],
    move: 'Carrera hasta el grifo: solo se abre si dice la palabra mágica "agua".',
    levels: [
      { label: 'Inicial', instrIcon: '🐶', read: 'Muéstrale el muñeco del perro y modela: "Guau". Espera que repita la onomatopeya.', instrHint: 'Imitación directa de una onomatopeya tras el modelo del adulto.' },
      { label: 'Intermedio', instrIcon: '🏷️', read: 'Muéstrale un vaso de agua sin decir nada y pregúntale: "¿Qué es esto?".', instrHint: 'Nombrar un objeto familiar de forma espontánea, sin modelo previo.' },
      { label: 'Avanzado', instrIcon: '🗣️', read: 'Ofrécele el vaso vacío y espera a que pida espontáneamente "quiero agua" combinando las dos palabras.', instrHint: 'Combinación espontánea de dos palabras en una petición funcional.' },
    ] },
  comunicacion_funcional: { code: 'M-5', name: 'Comunicación Funcional', category: 'Pedir "más", "ayuda", "quiero"',
    read: 'Para de hacer algo divertido y espera. Anímale a pedir "más" o "ayuda".',
    stage: 'instruction', instrIcon: '🙌', instrHint: 'Usa lenguaje verbal o aumentativo para solicitar juego o ayuda.',
    ept: ['Se frustra o no intenta comunicarse ante un problema.', 'Solicita ayuda o "más" usando modelo verbal guiado.', 'Usa palabras o signos funcionales con clara intención.'],
    move: 'Columpio, avión o cosquillas: para el juego y espera a que pida "más".',
    levels: [
      { label: 'Inicial', instrIcon: '🤚', read: 'Detén un juego divertido (cosquillas, columpio) y modela el gesto + palabra "más". Ayúdale a imitarlo.', instrHint: 'Petición de "más" con gesto y palabra modelados por el tutor.' },
      { label: 'Intermedio', instrIcon: '🔒', read: 'Dale un bote cerrado con algo que le guste dentro y espera. Si se frustra, sugiere a media voz "ayuda".', instrHint: 'Petición de "ayuda" ante un obstáculo, con pista verbal parcial.' },
      { label: 'Avanzado', instrIcon: '💬', read: 'Crea otra situación de necesidad (juguete fuera de alcance) sin dar ninguna pista y espera la petición espontánea.', instrHint: 'Inicio espontáneo de la petición, sin pistas verbales ni gestuales.' },
    ] },
  regulacion_conductual: { code: 'M-6', name: 'Regulación Conductual', category: 'Transiciones, rutinas y fichas',
    read: 'Avisa del cambio de actividad con la agenda visual y espera con tranquilidad.',
    stage: 'instruction', instrIcon: '🗂️', instrHint: 'Anticipa y acepta el cambio de actividad con apoyo visual y fichas.',
    ept: ['Conductas disruptivas ante las transiciones.', 'Tolera el cambio con apoyo de economía de fichas.', 'Realiza transiciones con tranquilidad y autorregulación.'],
    move: 'Marchad juntos hacia la siguiente actividad cantando la canción de las transiciones.',
    levels: [
      { label: 'Inicial', instrIcon: '🖼️', read: 'Muéstrale la imagen de la siguiente actividad y haz una cuenta atrás visual de 5 a 1 antes de cambiar.', instrHint: 'Anticipación con apoyo visual fuerte y cuenta atrás.' },
      { label: 'Intermedio', instrIcon: '🎫', read: 'Avisa el cambio una sola vez y ofrece una ficha al terminar la actividad con calma.', instrHint: 'Tolerancia al cambio con apoyo de economía de fichas.' },
      { label: 'Avanzado', instrIcon: '📅', read: 'Deja que consulte solo su agenda visual y haga la transición sin que tengas que avisarle.', instrHint: 'Transición autónoma siguiendo la agenda, sin aviso directo del tutor.' },
    ] },
  interaccion_social: { code: 'M-7', name: 'Interacción Social', category: 'Turnos, juego simbólico, emociones',
    read: 'Juega por turnos: "Ahora tú, ahora yo". Inicia un juego simbólico sencillo.',
    stage: 'instruction', instrIcon: '🤝', instrHint: 'Respeta turnos, inicia juego simbólico y responde afectivamente.',
    ept: ['Juega de forma solitaria, rechaza compartir turnos.', 'Acepta turnos y participa en juego guiado por el tutor.', 'Inicia y mantiene interacciones lúdicas recíprocas.'],
    move: 'Pasaos una pelota rodando: solo habla quien la tiene. ¡Turno y movimiento!',
    levels: [
      { label: 'Inicial', instrIcon: '🔁', read: 'Apila un bloque y dile "ahora tú". Ayúdale físicamente si no responde al turno.', instrHint: 'Turno simple guiado, con ayuda física si es necesario.' },
      { label: 'Intermedio', instrIcon: '🍽️', read: 'Ofrécele un muñeco y una cuchara; modela "vamos a darle de comer" y espera que continúe el juego simbólico.', instrHint: 'Inicio de juego simbólico breve con apoyo del modelo.' },
      { label: 'Avanzado', instrIcon: '🎭', read: 'Deja que proponga él un juego de turnos o simbólico y mantén el intercambio sin dirigirlo.', instrHint: 'Reciprocidad espontánea: el niño inicia y mantiene el intercambio.' },
    ] },
};

const DEFAULT_SESSION = ['ff1', 'ff2', 'se1', 'pr3', 'ms3'];
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const EMO = [
  { face: '😀', label: 'Alegría' }, { face: '😢', label: 'Tristeza' },
  { face: '😠', label: 'Enfado' }, { face: '🤕', label: 'Dolor' },
];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Pausas activas: mini-retos de movimiento entre ejercicios para oxigenar la
// sesión y trabajar motricidad gruesa jugando.
const ACTIVE_BREAKS = [
  { icon: '🐸', title: 'Salta como una rana', desc: 'Dad 5 saltos de rana contando en voz alta: ¡1, 2, 3, 4, 5!' },
  { icon: '👏', title: 'Ritmo de aplausos', desc: 'Aplaude un ritmo y que el niño lo repita. ¡Ahora al revés!' },
  { icon: '🦩', title: 'Equilibrio de flamenco', desc: 'Aguantad a la pata coja mientras contáis hasta 5.' },
  { icon: '🤖', title: 'Paso robot', desc: 'Caminad como robots hasta la puerta y volved diciendo "bip-bop".' },
  { icon: '🌬️', title: 'Sopla el viento', desc: 'Inspirad hondo y soplad fuerte como el viento: ¡fuuuu!' },
  { icon: '🐻', title: 'Marcha del oso', desc: 'Caminad a cuatro patas como la osita Valeria y rugid juntos.' },
  { icon: '🌀', title: 'Gira y congela', desc: 'Dad 3 vueltas sobre vosotros mismos y quedaos como estatuas.' },
  { icon: '🚀', title: 'Despegue de cohete', desc: 'Agachaos como un cohete y saltad al cielo: 3, 2, 1… ¡despegue!' },
];

// ----------------------------------------------------------------------------
// Ficha ilustrada con emoji: toca para ampliar, con rebote al pulsar.
// ----------------------------------------------------------------------------
const TILE_BGS = ['#fef3e2', '#e8f4fd', '#f3e8fd', '#e8fdf0', '#fdeef2', '#fdf8e2'];

const EmojiTile: React.FC<{
  emoji: string; cap?: string; size?: number; bgIndex?: number;
  onZoom: (emoji: string, cap: string) => void;
}> = ({ emoji, cap, size = 78, bgIndex = 0, onZoom }) => (
  <Pressable
    onPress={() => onZoom(emoji, cap ?? '')}
    accessibilityRole="imagebutton"
    accessibilityLabel={`Ampliar imagen de ${cap ?? 'la ficha'}`}
    style={({ pressed }) => [
      s.emojiTile,
      { width: size, height: size * 0.84, backgroundColor: TILE_BGS[bgIndex % TILE_BGS.length] },
      pressed && { transform: [{ scale: 0.92 }] },
    ]}
  >
    <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>
    <View style={s.zoomHintDot}><Text style={{ fontSize: 9 }}>🔍</Text></View>
  </Pressable>
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
  const sessionIds = useMemo(
    () => (startId && DB[startId] ? [startId] : DEFAULT_SESSION),
    [startId],
  );

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
  const [vowelPick, setVowelPick] = useState('');
  const [fillPick, setFillPick] = useState('');
  const [intruderPick, setIntruderPick] = useState(-1);
  const [emotionPick, setEmotionPick] = useState('');
  // zoom de imagen
  const [zoom, setZoom] = useState<{ emoji: string; cap: string } | null>(null);
  // pausa activa entre ejercicios
  const [activeBreak, setActiveBreak] = useState<(typeof ACTIVE_BREAKS)[number] | null>(null);
  const breakPulse = useRef(new Animated.Value(0)).current;

  const ex = DB[sessionIds[idx]] ?? DB.ff1;
  const total = sessionIds.length;
  const curLevel = ex.levels?.[subIdx];

  useEffect(() => {
    if (!activeBreak) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breakPulse, { toValue: 1, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breakPulse, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [activeBreak, breakPulse]);

  const resetEphemeral = () => { setVowelPick(''); setFillPick(''); setIntruderPick(-1); setEmotionPick(''); };

  const openZoom = (emoji: string, cap: string) => setZoom({ emoji, cap });

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
        setIdx(idx + 1); setSubIdx(0); setLevelScores([]);
        setPicked(0); setLocking(false); resetEphemeral();
        // Pausa activa: reto de movimiento sorpresa antes del siguiente ejercicio.
        setActiveBreak(ACTIVE_BREAKS[Math.floor(Math.random() * ACTIVE_BREAKS.length)]);
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
      hist.push({
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        name: sessionName,
        avg: +avg.toFixed(1),
        note: avg >= 2.5 ? 'Sesión muy fluida, gran respuesta en las consignas.'
          : avg >= 1.8 ? 'Buena sesión, alguna consigna costó pero se mantuvo atento.'
            : 'Sesión difícil hoy, conviene reforzar con más apoyo del tutor.',
        completed: true,
      });
      await AsyncStorage.setItem(STORAGE_KEYS.historial, JSON.stringify(hist));
    } catch (e) { /* almacenamiento no disponible */ }
    try {
      // Recompensas estilo Duolingo: XP, racha y logros.
      setReward(await registerSession(avg, res.length));
    } catch (e) { /* gamificación no disponible */ }
    setResults(res);
    setFinished(true);
  };

  // Cuenta atrás hacia Resultados
  const timerRef = useRef<any>(null);
  useEffect(() => {
    if (!finished) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); navigation.navigate('Results'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finished]);

  const restart = () => {
    clearInterval(timerRef.current);
    setIdx(0); setSubIdx(0); setLevelScores([]); setResults([]); setPicked(0); setLocking(false);
    setFinished(false); setCountdown(10); setReward(null); setActiveBreak(null); resetEphemeral();
  };

  const sumAvg = results.length ? results.reduce((a, b) => a + b, 0) / results.length : 0;
  const fullStars = Math.round(sumAvg);
  const starStr = (n: number) => '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);

  const breakScale = breakPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

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
              Lucía M. · {total === 1 ? ex.name : 'Plan prescrito'}
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

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!finished ? (
          <>
            {/* Meta del ejercicio */}
            <View style={s.metaRow}>
              <View style={s.codeChip}><Text style={s.codeChipTxt}>{ex.code}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.metaName}>{ex.name}</Text>
                <Text style={s.metaCat}>{ex.category}</Text>
              </View>
              {curLevel && (
                <View style={s.levelBadge}>
                  <Text style={s.levelBadgeTxt}>{curLevel.label} · {subIdx + 1}/{ex.levels!.length}</Text>
                </View>
              )}
            </View>

            {/* Consigna del tutor */}
            <View style={s.instructionCard}>
              <View style={s.instructionHead}>
                <View style={s.instructionIcon}><Text style={{ fontSize: 18 }}>📢</Text></View>
                <View>
                  <Text style={s.instructionKicker}>TU TURNO, TUTOR</Text>
                  <Text style={s.instructionSmall}>Lee la consigna en voz alta</Text>
                </View>
              </View>
              <Text style={s.instructionText}>{curLevel ? curLevel.read : ex.read}</Text>
            </View>

            {/* ===== Stage / mini-juego ===== */}
            <View style={s.stageCard}>
              <Text style={s.stageLabel}>{curLevel ? `Nivel ${curLevel.label}` : (ex.stageLabel ?? 'Actividad guiada')}</Text>

              {curLevel && (
                <View style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Pressable onPress={() => openZoom(curLevel.instrIcon, ex.name)} accessibilityRole="imagebutton" accessibilityLabel="Ampliar el icono">
                    <View style={s.instrBig}><Text style={{ fontSize: 32 }}>{curLevel.instrIcon}</Text></View>
                  </Pressable>
                  <Text style={s.instrHint}>{curLevel.instrHint}</Text>
                </View>
              )}

              {!curLevel && ex.stage === 'phrase' && (
                <View style={s.phraseBox}>
                  {!!ex.phraseEmoji && (
                    <EmojiTile emoji={ex.phraseEmoji} cap={ex.phrase?.toLowerCase()} size={92} bgIndex={1} onZoom={openZoom} />
                  )}
                  <Text style={s.phraseTxt}>“{ex.phrase}”</Text>
                </View>
              )}

              {ex.stage === 'vowels' && (
                <>
                  <View style={s.tilesRow}>
                    {ex.tiles!.map((t, i) => (
                      <View key={i} style={{ alignItems: 'center' }}>
                        <EmojiTile emoji={t.emoji} cap={t.cap} size={82} bgIndex={i} onZoom={openZoom} />
                        <Text style={s.tileCap}>{t.cap}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={s.vowelRow}>
                    {VOWELS.map((v) => (
                      <Pressable key={v} onPress={() => setVowelPick(v)} style={[s.vowel, vowelPick === v && s.vowelOn]}>
                        <Text style={[s.vowelTxt, vowelPick === v && s.vowelTxtOn]}>{v}</Text>
                      </Pressable>
                    ))}
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
                  <View style={s.fillRow}>
                    <Text style={s.fillBig}>{ex.fillBefore}</Text>
                    <View style={[s.fillSlot, fillPick ? (fillPick === ex.fillAnswer ? s.fillSlotOk : s.fillSlotBad) : s.fillSlotEmpty]}>
                      <Text style={[s.fillSlotTxt, { color: fillPick ? (fillPick === ex.fillAnswer ? '#fff' : V.color.error) : '#c2cbca' }]}>{fillPick || '?'}</Text>
                    </View>
                    <Text style={s.fillBig}>{ex.fillAfter}</Text>
                  </View>
                  <View style={s.vowelRow}>
                    {VOWELS.map((v) => (
                      <Pressable key={v} onPress={() => setFillPick(v)} style={[s.vowel, fillPick === v && (v === ex.fillAnswer ? s.vowelRight : s.vowelOn)]}>
                        <Text style={[s.vowelTxt, fillPick === v && s.vowelTxtOn]}>{v}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {ex.stage === 'intruder' && (
                <View style={s.grid2}>
                  {ex.intruder!.map((t, i) => {
                    const tapped = intruderPick === i;
                    const isAns = i === ex.intruderAnswer;
                    const reveal = intruderPick >= 0;
                    const ok = (tapped && isAns) || (reveal && isAns);
                    const bad = tapped && !isAns;
                    return (
                      <Pressable key={i} onPress={() => setIntruderPick(i)} style={[s.gridTile, ok && s.gridTileOk, bad && s.gridTileBad]}>
                        <View style={{ alignItems: 'center' }}>
                          <EmojiTile emoji={t.emoji} cap={t.cap} size={96} bgIndex={i} onZoom={openZoom} />
                        </View>
                        <View style={s.gridCapRow}>
                          <Text style={s.gridCap}>{t.cap}</Text>
                          <Text style={{ fontSize: 13 }}>{ok ? '✅' : bad ? '❌' : ''}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {ex.stage === 'emotions' && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <Pressable onPress={() => openZoom(ex.emotionFace!, '¿Cómo se siente?')} accessibilityRole="imagebutton" accessibilityLabel="Ampliar la cara">
                      <Text style={{ fontSize: 62 }}>{ex.emotionFace}</Text>
                    </Pressable>
                    <Text style={s.emoQ}>¿Cómo se siente?</Text>
                  </View>
                  <View style={s.grid2}>
                    {EMO.map((e) => {
                      const pickedEmo = emotionPick === e.label;
                      const isAns = e.label === ex.emotionAnswer;
                      const ok = pickedEmo && isAns; const bad = pickedEmo && !isAns;
                      return (
                        <Pressable key={e.label} onPress={() => setEmotionPick(e.label)} style={[s.emoOpt, ok && s.gridTileOk, bad && s.gridTileBad]}>
                          <Text style={{ fontSize: 24 }}>{e.face}</Text>
                          <Text style={s.emoLabel}>{e.label}</Text>
                          <Text style={{ marginLeft: 'auto', fontSize: 14 }}>{ok ? '✅' : bad ? '❌' : ''}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {ex.stage === 'dice' && (
                <>
                  <View style={s.diceRow}>
                    {ex.parts!.map((p, i) => (
                      <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={s.diceRole}>{p.role.toUpperCase()}</Text>
                        <EmojiTile emoji={p.emoji} cap={p.cap} size={88} bgIndex={i + 2} onZoom={openZoom} />
                        <Text style={s.tileCap}>{p.cap}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={s.sentenceBox}><Text style={s.sentenceTxt}>“{ex.sentence}”</Text></View>
                </>
              )}

              {!curLevel && ex.stage === 'instruction' && (
                <View style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Pressable onPress={() => openZoom(ex.instrIcon!, ex.name)} accessibilityRole="imagebutton" accessibilityLabel="Ampliar el icono">
                    <View style={s.instrBig}><Text style={{ fontSize: 32 }}>{ex.instrIcon}</Text></View>
                  </Pressable>
                  <Text style={s.instrHint}>{ex.instrHint}</Text>
                </View>
              )}

              <Text style={s.zoomTip}>🔍 Toca cualquier imagen para verla en grande</Text>
            </View>

            {/* Versión en movimiento */}
            <View style={s.moveCard}>
              <View style={s.moveHead}>
                <View style={s.moveIcon}><Text style={{ fontSize: 17 }}>🏃</Text></View>
                <Text style={s.moveKicker}>VERSIÓN EN MOVIMIENTO</Text>
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
              <Text style={s.scoreTitle}>Evalúa con la escala EPT-3</Text>
              <Text style={s.scoreSub}>Tres niveles: toca el que mejor describe su respuesta</Text>
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
              <Text style={s.doneStatKicker}>PROMEDIO EPT-3 DE LA SESIÓN</Text>
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

      {/* ===== Pausa activa entre ejercicios ===== */}
      {activeBreak && !finished && (
        <View style={s.breakOverlay}>
          <View style={s.breakCard}>
            <Text style={s.breakKicker}>⚡ PAUSA ACTIVA ⚡</Text>
            <Animated.Text style={[s.breakEmoji, { transform: [{ scale: breakScale }] }]}>{activeBreak.icon}</Animated.Text>
            <Text style={s.breakTitle}>{activeBreak.title}</Text>
            <Text style={s.breakDesc}>{activeBreak.desc}</Text>
            <Pressable onPress={() => setActiveBreak(null)} style={s.breakBtn} accessibilityRole="button">
              <Text style={s.breakBtnTxt}>¡Hecho! Seguimos →</Text>
            </Pressable>
            <Pressable onPress={() => setActiveBreak(null)} accessibilityRole="button">
              <Text style={s.breakSkip}>Saltar esta vez</Text>
            </Pressable>
          </View>
        </View>
      )}
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

  instructionCard: { backgroundColor: V.color.primaryTint, borderColor: '#b8eee9', borderWidth: 1.5, borderRadius: 18, padding: 16, ...V.shadow.card },
  instructionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  instructionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  instructionKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  instructionSmall: { fontSize: 12.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 1 },
  instructionText: { marginTop: 13, fontSize: 14.5, fontWeight: '700', color: V.color.textPrimary, lineHeight: 20 },

  stageCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
  stageLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: V.color.textMuted, textAlign: 'center', marginBottom: 14 },
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
  vowelTxt: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary },
  vowelTxtOn: { color: V.color.primaryDark },

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
  instrHint: { fontSize: 14, fontWeight: '700', color: V.color.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 12 },

  // versión en movimiento
  moveCard: { backgroundColor: '#fff7ed', borderColor: '#fcd9a8', borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 12 },
  moveHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  moveIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  moveKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#9a5b13' },
  moveTxt: { marginTop: 9, fontSize: 13.5, fontWeight: '700', color: '#7c4a0e', lineHeight: 19 },

  waitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 11 },
  waitTxt: { color: V.color.primaryDark, fontSize: 12.5, fontWeight: '700' },

  scoreCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
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
  recapRow: { flexDirection: 'row', gap: 6, marginTop: 16, alignSelf: 'stretch' },
  recapCell: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef3f3', borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
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

  // pausa activa
  breakOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,18,32,.6)', alignItems: 'center', justifyContent: 'center', padding: 26 },
  breakCard: { width: '100%', maxWidth: 330, backgroundColor: '#fff', borderRadius: 26, padding: 24, alignItems: 'center' },
  breakKicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, color: '#f59e0b' },
  breakEmoji: { fontSize: 74, marginTop: 14 },
  breakTitle: { fontSize: 21, fontWeight: '800', color: V.color.textPrimary, marginTop: 12, textAlign: 'center' },
  breakDesc: { fontSize: 14, fontWeight: '700', color: V.color.textSecondary, marginTop: 8, lineHeight: 20, textAlign: 'center' },
  breakBtn: { alignSelf: 'stretch', marginTop: 18, backgroundColor: '#f59e0b', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  breakBtnTxt: { color: '#fff', fontSize: 15.5, fontWeight: '800' },
  breakSkip: { marginTop: 12, fontSize: 12.5, fontWeight: '700', color: V.color.textMuted },
});

export default ValeriaExercisePlayerScreen;

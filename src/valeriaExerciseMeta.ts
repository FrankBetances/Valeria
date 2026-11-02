// ============================================================================
// Valeria+ · Metadatos de ejercicios (fuente única)
// Código, nombre, categoría y edad orientativa de cada terapia de Audición y
// Lenguaje. Los consumen la pantalla de selección/prescripción y el player,
// de modo que un cambio (p. ej. la edad de FF-1) se refleja en ambas a la vez
// y no pueden divergir.
// ============================================================================
import type { UiLang } from './valeriaUiLang';

export interface ExerciseMeta {
  id: string;
  code: string;
  name: string;
  category: string;
  age?: string; // edad orientativa (solo Audición; pedida por los evaluadores)
  // Parentesco entre ejercicios: id del ejercicio MANUAL que este instrumenta.
  // Nace con AR-2, que es la versión con cámara y cronómetro de RA-5
  // («Localización del sonido»). RA-5 sigue vivo donde no hay montaje de
  // altavoces —que será la mayoría de los sitios—, así que el parentesco vive
  // en los datos y no solo en la prosa del manual.
  instrumentaA?: string;
}


// Bandas de edad conocidas, en el orden en que se listan las secciones de
// Audición. Un ejercicio con una edad fuera de estas bandas no se pierde:
// la lista añade su banda al final (ver ValeriaBlockListScreen).
export const AGE_BANDS_ES = ['3-4 años', '4-5 años', '5-6 años'];
export const AGE_BANDS_EN = ['3–4 years', '4–5 years', '5–6 years'];
export const AGE_BANDS_CA = ['3-4 anys', '4-5 anys', '5-6 anys'];
export const AGE_BANDS_GL = ['3-4 anos', '4-5 anos', '5-6 anos'];
export const AGE_BANDS = AGE_BANDS_ES;

// Selector por TABLA, no por ternario. Mientras solo hubo `en`, un
// `lang === 'en' ? EN : ES` bastaba; con el catalán, esos siete ternarios eran
// siete sitios donde olvidarse de una lengua y devolver castellano SIN que el
// typecheck dijera nada (el ternario acepta cualquier UiLang). El gate
// check-ui-lang-fallback.js prohíbe volver a esa forma.
const byLang = <T,>(t: Record<UiLang, T>, lang: UiLang): T => t[lang];

export const getAgeBands = (lang: UiLang = 'es'): string[] =>
  byLang({ es: AGE_BANDS_ES, en: AGE_BANDS_EN, ca: AGE_BANDS_CA, gl: AGE_BANDS_GL }, lang);

// ============================================================================
// METADATOS EN ESPAÑOL
// ============================================================================
export const AUDICION_META_ES: ExerciseMeta[] = [
  { id: 'ff1', code: 'FF-1', name: 'Asociación vocal inicial', category: 'Sonidos y vocales', age: '4-5 años' },
  { id: 'ff2', code: 'FF-2', name: 'Articulación de vocales', category: 'Sonidos y vocales', age: '3-4 años' },
  { id: 'ff3', code: 'FF-3', name: 'Completar vocal faltante', category: 'Sonidos y vocales', age: '5-6 años' },
  { id: 'se1', code: 'SE-1', name: 'Detección del intruso', category: 'Vocabulario', age: '4-5 años' },
  { id: 'se2', code: 'SE-2', name: 'Adivinanza por letra', category: 'Vocabulario', age: '5-6 años' },
  { id: 'se3', code: 'SE-3', name: 'Prendas y órdenes', category: 'Vocabulario', age: '3-4 años' },
  { id: 'ms1', code: 'MS-1', name: 'Singular / plural', category: 'Frases', age: '4-5 años' },
  { id: 'ms2', code: 'MS-2', name: 'Flexión de género', category: 'Frases', age: '4-5 años' },
  { id: 'ms3', code: 'MS-3', name: 'Estructura S-V-O', category: 'Frases', age: '5-6 años' },
  { id: 'ms4', code: 'MS-4', name: 'Composición libre de frases', category: 'Frases', age: '5-6 años' },
  { id: 'pr1', code: 'PR-1', name: 'Preguntas tipo ¿qué?', category: 'Uso social', age: '3-4 años' },
  { id: 'pr2', code: 'PR-2', name: 'Adaptación del discurso', category: 'Uso social', age: '5-6 años' },
  { id: 'pr3', code: 'PR-3', name: 'Reconocimiento de emociones', category: 'Uso social', age: '4-5 años' },
  { id: 'pr4', code: 'PR-4', name: 'Petición de repetición', category: 'Uso social', age: '5-6 años' },
  // Rehabilitación auditiva ACOPROS (Expansión de Protocolos): escucha en ruido,
  // lectura labiofacial y memoria auditiva. TODO estresor acústico es MANUAL
  // (deslizador de ruido del Panel del Adulto o la propia voz del cuidador).
  { id: 'ra1', code: 'RA-1', name: 'Figura-fondo con ruido', category: 'Escucha en ruido', age: '4-5 años' },
  { id: 'ra2', code: 'RA-2', name: 'Lectura labiofacial', category: 'Escucha en ruido', age: '5-6 años' },
  { id: 'ra3', code: 'RA-3', name: 'Formato cerrado degradado', category: 'Escucha en ruido', age: '4-5 años' },
  { id: 'ra4', code: 'RA-4', name: 'Secuencia con espera', category: 'Escucha en ruido', age: '5-6 años' },
  { id: 'ra5', code: 'RA-5', name: 'Localización del sonido', category: 'Escucha en ruido', age: '3-4 años' },
];

export const LENGUAJE_META_ES: ExerciseMeta[] = [
  { id: 'atencion_conjunta', code: 'M-1', name: 'Atención Conjunta', category: 'Mirar, burbujas y nombre' },
  { id: 'imitacion', code: 'M-2', name: 'Imitación Motora/Verbal', category: 'Aplausos, tambor y sílabas' },
  { id: 'comprension', code: 'M-3', name: 'Comprensión Verbal', category: 'Órdenes, cuerpo y categorías' },
  { id: 'expresion', code: 'M-4', name: 'Expresión Verbal', category: 'Onomatopeyas, nombrar y frases' },
  { id: 'comunicacion_funcional', code: 'M-5', name: 'Comunicación Funcional', category: 'Pedir "más", "ayuda", "quiero"' },
  { id: 'regulacion_conductual', code: 'M-6', name: 'Regulación Conductual', category: 'Transiciones, rutinas y recompensas' },
  { id: 'interaccion_social', code: 'M-7', name: 'Interacción Social', category: 'Turnos, juego simbólico, emociones' },
];

// Módulo TEA: el software orquesta las contingencias; la carga
// comunicativa, los estresores y el veredicto son SIEMPRE del adulto (muro MDR).
export const TEA_META_ES: ExerciseMeta[] = [
  { id: 'tea1', code: 'TEA-1', name: 'Mirar juntos', category: 'Mirada y señalar lo mismo' },
  { id: 'tea2', code: 'TEA-2', name: 'Cuando algo falla', category: 'Pedir ayuda y arreglar el mensaje (lo lanza el adulto)' },
  { id: 'tea3', code: 'TEA-3', name: 'El espejo travieso', category: 'Hacer lo que dice la voz, no lo que se ve' },
  { id: 'tea4', code: 'TEA-4', name: 'Cambio de plan', category: 'Aceptar un cambio en la rutina (lo lanza el adulto)' },
  { id: 'tea5', code: 'TEA-5', name: 'Ordenar con ruido', category: 'Clasificar con ruido de fondo (lo lanza el adulto)' },
  { id: 'tea6', code: 'TEA-6', name: 'Varias pistas a la vez', category: 'Fijarse en más de una pista' },
];

// Módulo Dislexia (fonología + acceso léxico): validación fonológica plegada
// por variedad (es-DO: seseo, /s/ implosiva y líquidas en coda NO son error).
export const DISLEXIA_META_ES: ExerciseMeta[] = [
  { id: 'dx1', code: 'DX-1', name: 'El sonido intruso', category: 'Escuchar qué palabra suena distinta' },
  { id: 'dx2', code: 'DX-2', name: 'Leer con distracciones', category: 'Leer seguido aunque haya interrupciones (lo lanza el adulto)' },
  { id: 'dx3', code: 'DX-3', name: 'Juntar sonidos', category: 'Unir sonidos al ritmo para formar una palabra' },
  { id: 'dx4', code: 'DX-4', name: 'Palabras inventadas', category: 'Leer palabras que no existen · máx. 5 intentos' },
  { id: 'dx5', code: 'DX-5', name: 'b o d, p o q', category: 'Distinguir letras que giran' },
  { id: 'dx6', code: 'DX-6', name: 'Nombrar rápido', category: 'Decir en voz alta dibujos en orden' },
];

// Módulo de Realidad Aumentada (Gamificación Condicionada): la cámara frontal
// deja de ser un grabador y pasa a ser un sensor de conducta motora. El refuerzo
// visual 3D se dispara SOLO por el gesto motor objetivo —nunca por acierto
// acústico ni por paso del tiempo—, que es justo lo que rompe el lazo entre
// esfuerzo y frustración en las dislalias funcionales.
// Estos ejercicios NO los sirve el player: los abre el host nativo de cámara +
// escena 3D a través de ValeriaArLauncherScreen.
export const AR_META_ES: ExerciseMeta[] = [
  { id: 'ar1', code: 'AR-1', name: 'Cinemática Orofacial', category: 'Postura labial como gatillo · micrófono apagado', age: '3-4 años' },
  { id: 'ar2', code: 'AR-2', name: 'Localización del Sonido Instrumentada', category: 'VRA digitalizado · latencia del giro cefálico', age: '3-4 años', instrumentaA: 'ra5' },
  { id: 'ar3', code: 'AR-3', name: 'Selección Semántica por Fijación', category: 'Comprensión sin motricidad fina · dwell time', age: '4-5 años' },
  { id: 'ar4', code: 'AR-4', name: 'Búsqueda Espacial de Lúa', category: 'Rastreo 3D en el entorno · radar y amplitud cervical', age: '4-5 años' },
  { id: 'ar5', code: 'AR-5', name: 'Lanzamiento y Captura de Premios', category: 'Alimentar a Lúa · coordinación cinemática y captura', age: '3-4 años' },
  { id: 'ar6', code: 'AR-6', name: 'Espejo Mímico con Buddy Lúa', category: 'Praxias faciales guiadas · simetría y conciencia motora', age: '4-5 años' },
];

// ============================================================================
// METADATOS EN INGLÉS (US English · Pediatric HealthTech)
// ============================================================================
export const AUDICION_META_EN: ExerciseMeta[] = [
  { id: 'ff1', code: 'FF-1', name: 'Initial vowel association', category: 'Sounds and vowels', age: '4–5 years' },
  { id: 'ff2', code: 'FF-2', name: 'Vowel articulation', category: 'Sounds and vowels', age: '3–4 years' },
  { id: 'ff3', code: 'FF-3', name: 'Fill in the missing vowel', category: 'Sounds and vowels', age: '5–6 years' },
  { id: 'se1', code: 'SE-1', name: 'Find the odd one out', category: 'Vocabulary', age: '4–5 years' },
  { id: 'se2', code: 'SE-2', name: 'Letter riddle guessing', category: 'Vocabulary', age: '5–6 years' },
  { id: 'se3', code: 'SE-3', name: 'Clothing and multi-step commands', category: 'Vocabulary', age: '3–4 years' },
  { id: 'ms1', code: 'MS-1', name: 'Singular / plural', category: 'Sentences', age: '4–5 years' },
  { id: 'ms2', code: 'MS-2', name: 'Irregular plurals', category: 'Sentences', age: '4–5 years' },
  { id: 'ms3', code: 'MS-3', name: 'S-V-O sentence structure', category: 'Sentences', age: '5–6 years' },
  { id: 'ms4', code: 'MS-4', name: 'Free sentence building', category: 'Sentences', age: '5–6 years' },
  { id: 'pr1', code: 'PR-1', name: '"What" question answering', category: 'Social communication', age: '3–4 years' },
  { id: 'pr2', code: 'PR-2', name: 'Conversational adaptation', category: 'Social communication', age: '5–6 years' },
  { id: 'pr3', code: 'PR-3', name: 'Emotion recognition', category: 'Social communication', age: '4–5 years' },
  { id: 'pr4', code: 'PR-4', name: 'Asking for clarification', category: 'Social communication', age: '5–6 years' },
  { id: 'ra1', code: 'RA-1', name: 'Figure-ground speech in noise', category: 'Listening in noise', age: '4–5 years' },
  { id: 'ra2', code: 'RA-2', name: 'Speechreading (lipreading)', category: 'Listening in noise', age: '5–6 years' },
  { id: 'ra3', code: 'RA-3', name: 'Degraded closed-set identification', category: 'Listening in noise', age: '4–5 years' },
  { id: 'ra4', code: 'RA-4', name: 'Sequential recall with delay', category: 'Listening in noise', age: '5–6 years' },
  { id: 'ra5', code: 'RA-5', name: 'Sound localization', category: 'Listening in noise', age: '3–4 years' },
];

export const LENGUAJE_META_EN: ExerciseMeta[] = [
  { id: 'atencion_conjunta', code: 'M-1', name: 'Joint attention', category: 'Gaze, bubbles and name response' },
  { id: 'imitacion', code: 'M-2', name: 'Motor & verbal imitation', category: 'Clapping, drumming and syllables' },
  { id: 'comprension', code: 'M-3', name: 'Verbal comprehension', category: 'Commands, body parts and categories' },
  { id: 'expresion', code: 'M-4', name: 'Verbal expression', category: 'Animal sounds, naming and sentences' },
  { id: 'comunicacion_funcional', code: 'M-5', name: 'Functional communication', category: 'Requesting "more", "help", "want"' },
  { id: 'regulacion_conductual', code: 'M-6', name: 'Behavioral regulation', category: 'Transitions, routines and rewards' },
  { id: 'interaccion_social', code: 'M-7', name: 'Social interaction', category: 'Turn-taking, pretend play, emotions' },
];

export const TEA_META_EN: ExerciseMeta[] = [
  { id: 'tea1', code: 'TEA-1', name: 'Looking together', category: 'Gaze and pointing at the same thing' },
  { id: 'tea2', code: 'TEA-2', name: 'When something goes wrong', category: 'Asking for help and repairing the message (adult-led)' },
  { id: 'tea3', code: 'TEA-3', name: 'The tricky mirror', category: 'Follow the voice, not what you see' },
  { id: 'tea4', code: 'TEA-4', name: 'Change of plan', category: 'Accepting a change in the routine (adult-led)' },
  { id: 'tea5', code: 'TEA-5', name: 'Sorting with noise', category: 'Sorting with background noise (adult-led)' },
  { id: 'tea6', code: 'TEA-6', name: 'Several clues at once', category: 'Noticing more than one clue' },
];

export const DISLEXIA_META_EN: ExerciseMeta[] = [
  { id: 'dx1', code: 'DX-1', name: 'The odd sound out', category: 'Hearing which word sounds different' },
  { id: 'dx2', code: 'DX-2', name: 'Reading with distractions', category: 'Keep reading through interruptions (adult-led)' },
  { id: 'dx3', code: 'DX-3', name: 'Putting sounds together', category: 'Blending sounds in rhythm into a word' },
  { id: 'dx4', code: 'DX-4', name: 'Made-up words', category: 'Reading words that do not exist · max 5 tries' },
  { id: 'dx5', code: 'DX-5', name: 'b or d, p or q', category: 'Telling apart letters that turn' },
  { id: 'dx6', code: 'DX-6', name: 'Quick naming', category: 'Naming pictures aloud in order' },
];

export const AR_META_EN: ExerciseMeta[] = [
  { id: 'ar1', code: 'AR-1', name: 'Orofacial kinematics', category: 'Lip posture trigger · microphone muted', age: '3–4 years' },
  { id: 'ar2', code: 'AR-2', name: 'Instrumented sound localization', category: 'Digitalized VRA · head-turn latency', age: '3–4 years', instrumentaA: 'ra5' },
  { id: 'ar3', code: 'AR-3', name: 'Semantic gaze selection', category: 'Comprehension without fine motor · dwell time', age: '4–5 years' },
  { id: 'ar4', code: 'AR-4', name: 'Spatial search for Lúa', category: '3D spatial tracking · sensory compass and neck range', age: '4–5 years' },
  { id: 'ar5', code: 'AR-5', name: 'Reward throw and catch', category: 'Feed Lúa · kinematic gesture and reaction', age: '3–4 years' },
  { id: 'ar6', code: 'AR-6', name: 'Mirror mimicry with Buddy Lúa', category: 'Guided facial praxias · symmetry and motor awareness', age: '4–5 years' },
];

// ============================================================================
// METADADES EN CATALÀ (ca-ES)
// ============================================================================
export const AUDICION_META_CA: ExerciseMeta[] = [
  { id: 'ff1', code: 'FF-1', name: 'Associació vocàlica inicial', category: 'Sons i vocals', age: '4-5 anys' },
  { id: 'ff2', code: 'FF-2', name: 'Articulació de vocals', category: 'Sons i vocals', age: '3-4 anys' },
  { id: 'ff3', code: 'FF-3', name: 'Completar la vocal que falta', category: 'Sons i vocals', age: '5-6 anys' },
  { id: 'se1', code: 'SE-1', name: 'Detecció de l\'intrús', category: 'Vocabulari', age: '4-5 anys' },
  { id: 'se2', code: 'SE-2', name: 'Endevinalla per lletra', category: 'Vocabulari', age: '5-6 anys' },
  { id: 'se3', code: 'SE-3', name: 'Peces de roba i ordres', category: 'Vocabulari', age: '3-4 anys' },
  { id: 'ms1', code: 'MS-1', name: 'Singular / plural', category: 'Frases', age: '4-5 anys' },
  { id: 'ms2', code: 'MS-2', name: 'Flexió de gènere', category: 'Frases', age: '4-5 anys' },
  { id: 'ms3', code: 'MS-3', name: 'Estructura S-V-O', category: 'Frases', age: '5-6 anys' },
  { id: 'ms4', code: 'MS-4', name: 'Composició lliure de frases', category: 'Frases', age: '5-6 anys' },
  { id: 'pr1', code: 'PR-1', name: 'Preguntes del tipus «què?»', category: 'Ús social', age: '3-4 anys' },
  { id: 'pr2', code: 'PR-2', name: 'Adaptació del discurs', category: 'Ús social', age: '5-6 anys' },
  { id: 'pr3', code: 'PR-3', name: 'Reconeixement d\'emocions', category: 'Ús social', age: '4-5 anys' },
  { id: 'pr4', code: 'PR-4', name: 'Petició de repetició', category: 'Ús social', age: '5-6 anys' },
  { id: 'ra1', code: 'RA-1', name: 'Figura-fons amb soroll', category: 'Escolta amb soroll', age: '4-5 anys' },
  { id: 'ra2', code: 'RA-2', name: 'Lectura labiofacial', category: 'Escolta amb soroll', age: '5-6 anys' },
  { id: 'ra3', code: 'RA-3', name: 'Format tancat degradat', category: 'Escolta amb soroll', age: '4-5 anys' },
  { id: 'ra4', code: 'RA-4', name: 'Seqüència amb espera', category: 'Escolta amb soroll', age: '5-6 anys' },
  { id: 'ra5', code: 'RA-5', name: 'Localització del so', category: 'Escolta amb soroll', age: '3-4 anys' },
];

export const LENGUAJE_META_CA: ExerciseMeta[] = [
  { id: 'atencion_conjunta', code: 'M-1', name: 'Atenció conjunta', category: 'Mirada, bombolles i resposta al nom' },
  { id: 'imitacion', code: 'M-2', name: 'Imitació motora i verbal', category: 'Picar de mans, tambor i síl·labes' },
  { id: 'comprension', code: 'M-3', name: 'Comprensió verbal', category: 'Ordres, parts del cos i categories' },
  { id: 'expresion', code: 'M-4', name: 'Expressió verbal', category: 'Sons d\'animals, anomenar i frases' },
  { id: 'comunicacion_funcional', code: 'M-5', name: 'Comunicació funcional', category: 'Demanar «més», «ajuda», «vull»' },
  { id: 'regulacion_conductual', code: 'M-6', name: 'Regulació conductual', category: 'Transicions, rutines i premis' },
  { id: 'interaccion_social', code: 'M-7', name: 'Interacció social', category: 'Torns, joc simbòlic, emocions' },
];

export const TEA_META_CA: ExerciseMeta[] = [
  { id: 'tea1', code: 'TEA-1', name: 'Mirar junts', category: 'Mirada i assenyalar el mateix' },
  { id: 'tea2', code: 'TEA-2', name: 'Quan alguna cosa falla', category: 'Demanar ajuda i arreglar el missatge (ho llança l’adult)' },
  { id: 'tea3', code: 'TEA-3', name: 'El mirall entremaliat', category: 'Fer el que diu la veu, no el que es veu' },
  { id: 'tea4', code: 'TEA-4', name: 'Canvi de pla', category: 'Acceptar un canvi a la rutina (ho llança l’adult)' },
  { id: 'tea5', code: 'TEA-5', name: 'Ordenar amb soroll', category: 'Classificar amb soroll de fons (ho llança l’adult)' },
  { id: 'tea6', code: 'TEA-6', name: 'Diverses pistes alhora', category: 'Fixar-se en més d’una pista' },
];

export const DISLEXIA_META_CA: ExerciseMeta[] = [
  { id: 'dx1', code: 'DX-1', name: 'El so intrús', category: 'Escoltar quina paraula sona diferent' },
  { id: 'dx2', code: 'DX-2', name: 'Llegir amb distraccions', category: 'Llegir seguit encara que hi hagi interrupcions (ho llança l’adult)' },
  { id: 'dx3', code: 'DX-3', name: 'Ajuntar sons', category: 'Unir sons al ritme per formar una paraula' },
  { id: 'dx4', code: 'DX-4', name: 'Paraules inventades', category: 'Llegir paraules que no existeixen · màx. 5 intents' },
  { id: 'dx5', code: 'DX-5', name: 'b o d, p o q', category: 'Distingir lletres que giren' },
  { id: 'dx6', code: 'DX-6', name: 'Anomenar ràpid', category: 'Dir en veu alta dibuixos en ordre' },
];

export const AR_META_CA: ExerciseMeta[] = [
  { id: 'ar1', code: 'AR-1', name: 'Cinemàtica orofacial', category: 'Disparador de postura labial · micròfon silenciat', age: '3-4 anys' },
  { id: 'ar2', code: 'AR-2', name: 'Localització del so instrumentada', category: 'VRA digitalitzada · latència del gir de cap', age: '3-4 anys', instrumentaA: 'ra5' },
  { id: 'ar3', code: 'AR-3', name: 'Selecció semàntica per mirada', category: 'Comprensió sense motricitat fina · temps de fixació', age: '4-5 anys' },
  { id: 'ar4', code: 'AR-4', name: 'Cerca espacial de la Lúa', category: 'Rastreig espacial 3D · brúixola sensorial i rang cervical', age: '4-5 anys' },
  { id: 'ar5', code: 'AR-5', name: 'Llançar i atrapar el premi', category: 'Alimentar la Lúa · gest cinemàtic i reacció', age: '3-4 anys' },
  { id: 'ar6', code: 'AR-6', name: 'Mímica en mirall amb la Lúa Buddy', category: 'Praxis facials guiades · simetria i consciència motora', age: '4-5 anys' },
];

// ============================================================================
// METADATOS EN GALEGO (set/2026)
// Lado ADULTO de los 37 ejercicios: nombre, categoría y edad orientativa. No es
// lo que se locuta —eso vive en valeriaExerciseGl.ts, en el eje de variedad—,
// sino lo que lee la logopeda al prescribir y el player al titular la pantalla.
// Sin esto, elegir «Galego» entraba desde una lista galega a un ejercicio
// titulado en castellano: el mismo defecto que encontró Frank con el inglés.
// ============================================================================
export const AUDICION_META_GL: ExerciseMeta[] = [
  { id: 'ff1', code: 'FF-1', name: 'Asociación vocálica inicial', category: 'Sons e vogais', age: '4-5 anos' },
  { id: 'ff2', code: 'FF-2', name: 'Articulación de vogais', category: 'Sons e vogais', age: '3-4 anos' },
  { id: 'ff3', code: 'FF-3', name: 'Completar a vogal que falta', category: 'Sons e vogais', age: '5-6 anos' },
  { id: 'se1', code: 'SE-1', name: 'Detección do intruso', category: 'Vocabulario', age: '4-5 anos' },
  { id: 'se2', code: 'SE-2', name: 'Adiviña pola letra', category: 'Vocabulario', age: '5-6 anos' },
  { id: 'se3', code: 'SE-3', name: 'Prendas e ordes', category: 'Vocabulario', age: '3-4 anos' },
  { id: 'ms1', code: 'MS-1', name: 'Singular / plural', category: 'Frases', age: '4-5 anos' },
  { id: 'ms2', code: 'MS-2', name: 'Flexión de xénero', category: 'Frases', age: '4-5 anos' },
  { id: 'ms3', code: 'MS-3', name: 'Estrutura S-V-O', category: 'Frases', age: '5-6 anos' },
  { id: 'ms4', code: 'MS-4', name: 'Composición libre de frases', category: 'Frases', age: '5-6 anos' },
  { id: 'pr1', code: 'PR-1', name: 'Preguntas tipo «que?»', category: 'Uso social', age: '3-4 anos' },
  { id: 'pr2', code: 'PR-2', name: 'Adaptación do discurso', category: 'Uso social', age: '5-6 anos' },
  { id: 'pr3', code: 'PR-3', name: 'Recoñecemento de emocións', category: 'Uso social', age: '4-5 anos' },
  { id: 'pr4', code: 'PR-4', name: 'Petición de repetición', category: 'Uso social', age: '5-6 anos' },
  { id: 'ra1', code: 'RA-1', name: 'Figura-fondo con ruído', category: 'Escoita en ruído', age: '4-5 anos' },
  { id: 'ra2', code: 'RA-2', name: 'Lectura labiofacial', category: 'Escoita en ruído', age: '5-6 anos' },
  { id: 'ra3', code: 'RA-3', name: 'Formato pechado degradado', category: 'Escoita en ruído', age: '4-5 anos' },
  { id: 'ra4', code: 'RA-4', name: 'Secuencia con espera', category: 'Escoita en ruído', age: '5-6 anos' },
  { id: 'ra5', code: 'RA-5', name: 'Localización do son', category: 'Escoita en ruído', age: '3-4 anos' },
];

export const LENGUAJE_META_GL: ExerciseMeta[] = [
  { id: 'atencion_conjunta', code: 'M-1', name: 'Atención Conxunta', category: 'Mirar, burbullas e nome' },
  { id: 'imitacion', code: 'M-2', name: 'Imitación Motora/Verbal', category: 'Aplausos, tambor e sílabas' },
  { id: 'comprension', code: 'M-3', name: 'Comprensión Verbal', category: 'Ordes, corpo e categorías' },
  { id: 'expresion', code: 'M-4', name: 'Expresión Verbal', category: 'Onomatopeas, nomear e frases' },
  { id: 'comunicacion_funcional', code: 'M-5', name: 'Comunicación Funcional', category: 'Pedir «máis», «axuda», «quero»' },
  { id: 'regulacion_conductual', code: 'M-6', name: 'Regulación Condutual', category: 'Transicións, rutinas e recompensas' },
  { id: 'interaccion_social', code: 'M-7', name: 'Interacción Social', category: 'Quendas, xogo simbólico, emocións' },
];

export const TEA_META_GL: ExerciseMeta[] = [
  { id: 'tea1', code: 'TEA-1', name: 'Mirar xuntos', category: 'Mirada e sinalar o mesmo' },
  { id: 'tea2', code: 'TEA-2', name: 'Cando algo falla', category: 'Pedir axuda e arranxar a mensaxe (lánzao o adulto)' },
  { id: 'tea3', code: 'TEA-3', name: 'O espello trasno', category: 'Facer o que di a voz, non o que se ve' },
  { id: 'tea4', code: 'TEA-4', name: 'Cambio de plan', category: 'Aceptar un cambio na rutina (lánzao o adulto)' },
  { id: 'tea5', code: 'TEA-5', name: 'Ordenar con ruído', category: 'Clasificar con ruído de fondo (lánzao o adulto)' },
  { id: 'tea6', code: 'TEA-6', name: 'Varias pistas á vez', category: 'Fixarse en máis dunha pista' },
];

export const DISLEXIA_META_GL: ExerciseMeta[] = [
  { id: 'dx1', code: 'DX-1', name: 'O son intruso', category: 'Escoitar que palabra soa distinta' },
  { id: 'dx2', code: 'DX-2', name: 'Ler con distraccións', category: 'Ler seguido aínda que haxa interrupcións (lánzao o adulto)' },
  { id: 'dx3', code: 'DX-3', name: 'Xuntar sons', category: 'Unir sons ao ritmo para formar unha palabra' },
  { id: 'dx4', code: 'DX-4', name: 'Palabras inventadas', category: 'Ler palabras que non existen · máx. 5 intentos' },
  { id: 'dx5', code: 'DX-5', name: 'b ou d, p ou q', category: 'Distinguir letras que xiran' },
  { id: 'dx6', code: 'DX-6', name: 'Nomear rápido', category: 'Dicir en voz alta debuxos en orde' },
];

export const AR_META_GL: ExerciseMeta[] = [
  { id: 'ar1', code: 'AR-1', name: 'Cinemática Orofacial', category: 'Postura labial como gatillo · micrófono apagado', age: '3-4 anos' },
  { id: 'ar2', code: 'AR-2', name: 'Localización do Son Instrumentada', category: 'VRA dixitalizado · latencia do xiro cefálico', age: '3-4 anos', instrumentaA: 'ra5' },
  { id: 'ar3', code: 'AR-3', name: 'Selección Semántica por Fixación', category: 'Comprensión sen motricidade fina · dwell time', age: '4-5 anos' },
  { id: 'ar4', code: 'AR-4', name: 'Busca Espacial de Lúa', category: 'Rastrexo 3D na contorna · radar e amplitude cervical', age: '4-5 anos' },
  { id: 'ar5', code: 'AR-5', name: 'Lanzamento e Captura de Premios', category: 'Alimentar a Lúa · coordinación cinemática e captura', age: '3-4 anos' },
  { id: 'ar6', code: 'AR-6', name: 'Espello Mímico con Buddy Lúa', category: 'Praxias faciais guiadas · simetría e consciencia motora', age: '4-5 anos' },
];

// Defaults (Spanish)
export const AUDICION_META = AUDICION_META_ES;
export const LENGUAJE_META = LENGUAJE_META_ES;
export const TEA_META = TEA_META_ES;
export const DISLEXIA_META = DISLEXIA_META_ES;
export const AR_META = AR_META_ES;

// Helper getters
export const getAudicionMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  byLang({ es: AUDICION_META_ES, en: AUDICION_META_EN, ca: AUDICION_META_CA, gl: AUDICION_META_GL }, lang);

export const getLenguajeMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  byLang({ es: LENGUAJE_META_ES, en: LENGUAJE_META_EN, ca: LENGUAJE_META_CA, gl: LENGUAJE_META_GL }, lang);

export const getTeaMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  byLang({ es: TEA_META_ES, en: TEA_META_EN, ca: TEA_META_CA, gl: TEA_META_GL }, lang);

export const getDislexiaMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  byLang({ es: DISLEXIA_META_ES, en: DISLEXIA_META_EN, ca: DISLEXIA_META_CA, gl: DISLEXIA_META_GL }, lang);

export const getArMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  byLang({ es: AR_META_ES, en: AR_META_EN, ca: AR_META_CA, gl: AR_META_GL }, lang);

export const getExercisesForBlock = (blockKey: 'audicion' | 'lenguaje' | 'tea' | 'dislexia', lang: UiLang = 'es'): ExerciseMeta[] => {
  switch (blockKey) {
    case 'audicion': return getAudicionMeta(lang);
    case 'lenguaje': return getLenguajeMeta(lang);
    case 'tea': return getTeaMeta(lang);
    case 'dislexia': return getDislexiaMeta(lang);
  }
};

// Índice por id para el player (DB de mini-juegos).
export const META_BY_ID: Record<string, ExerciseMeta> = Object.fromEntries(
  [...AUDICION_META_ES, ...LENGUAJE_META_ES, ...TEA_META_ES, ...DISLEXIA_META_ES, ...AR_META_ES].map((m) => [m.id, m]),
);

export const META_BY_ID_EN: Record<string, ExerciseMeta> = Object.fromEntries(
  [...AUDICION_META_EN, ...LENGUAJE_META_EN, ...TEA_META_EN, ...DISLEXIA_META_EN, ...AR_META_EN].map((m) => [m.id, m]),
);

export const META_BY_ID_CA: Record<string, ExerciseMeta> = Object.fromEntries(
  [...AUDICION_META_CA, ...LENGUAJE_META_CA, ...TEA_META_CA, ...DISLEXIA_META_CA, ...AR_META_CA].map((m) => [m.id, m]),
);

export const META_BY_ID_GL: Record<string, ExerciseMeta> = Object.fromEntries(
  [...AUDICION_META_GL, ...LENGUAJE_META_GL, ...TEA_META_GL, ...DISLEXIA_META_GL, ...AR_META_GL].map((m) => [m.id, m]),
);

// Nombre, categoría y edad en el idioma de la INTERFAZ. Los lee tanto la lista
// de bloques como el player: si cada uno tirase de su lado, se entraría desde
// «Vowel articulation» a «Articulación de vocales», que es lo que pasaba.
export const metaIndexFor = (lang: UiLang): Record<string, ExerciseMeta> =>
  byLang({ es: META_BY_ID, en: META_BY_ID_EN, ca: META_BY_ID_CA, gl: META_BY_ID_GL }, lang);

export const getMetaById = (lang: UiLang = 'es'): Record<string, ExerciseMeta> =>
  Object.fromEntries(
    [
      ...getAudicionMeta(lang),
      ...getLenguajeMeta(lang),
      ...getTeaMeta(lang),
      ...getDislexiaMeta(lang),
      ...getArMeta(lang),
    ].map((m) => [m.id, m]),
  );

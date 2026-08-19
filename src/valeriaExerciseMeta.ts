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
export const AGE_BANDS = AGE_BANDS_ES;

export const getAgeBands = (lang: UiLang = 'es'): string[] =>
  lang === 'en' ? AGE_BANDS_EN : AGE_BANDS_ES;

// ============================================================================
// METADATOS EN ESPAÑOL
// ============================================================================
export const AUDICION_META_ES: ExerciseMeta[] = [
  { id: 'ff1', code: 'FF-1', name: 'Asociación vocal inicial', category: 'Sonidos y vocales (fonética-fonología)', age: '4-5 años' },
  { id: 'ff2', code: 'FF-2', name: 'Articulación de vocales', category: 'Sonidos y vocales (fonética-fonología)', age: '3-4 años' },
  { id: 'ff3', code: 'FF-3', name: 'Completar vocal faltante', category: 'Sonidos y vocales (fonética-fonología)', age: '5-6 años' },
  { id: 'se1', code: 'SE-1', name: 'Detección del intruso', category: 'Vocabulario (semántica)', age: '4-5 años' },
  { id: 'se2', code: 'SE-2', name: 'Adivinanza por letra', category: 'Vocabulario (semántica)', age: '5-6 años' },
  { id: 'se3', code: 'SE-3', name: 'Prendas y órdenes', category: 'Vocabulario (semántica)', age: '3-4 años' },
  { id: 'ms1', code: 'MS-1', name: 'Singular / plural', category: 'Frases (morfosintaxis)', age: '4-5 años' },
  { id: 'ms2', code: 'MS-2', name: 'Flexión de género', category: 'Frases (morfosintaxis)', age: '4-5 años' },
  { id: 'ms3', code: 'MS-3', name: 'Estructura S-V-O', category: 'Frases (morfosintaxis)', age: '5-6 años' },
  { id: 'pr1', code: 'PR-1', name: 'Preguntas tipo ¿qué?', category: 'Uso social (pragmática)', age: '3-4 años' },
  { id: 'pr2', code: 'PR-2', name: 'Adaptación del discurso', category: 'Uso social (pragmática)', age: '5-6 años' },
  { id: 'pr3', code: 'PR-3', name: 'Reconocimiento de emociones', category: 'Uso social (pragmática)', age: '4-5 años' },
  { id: 'pr4', code: 'PR-4', name: 'Petición de repetición', category: 'Uso social (pragmática)', age: '5-6 años' },
  // Rehabilitación auditiva ACOPROS (Expansión de Protocolos): escucha en ruido,
  // lectura labiofacial y memoria auditiva. TODO estresor acústico es MANUAL
  // (deslizador de ruido del Panel del Adulto o la propia voz del cuidador).
  { id: 'ra1', code: 'RA-1', name: 'Figura-fondo con ruido', category: 'Escucha en ruido (rehabilitación auditiva)', age: '4-5 años' },
  { id: 'ra2', code: 'RA-2', name: 'Lectura labiofacial', category: 'Escucha en ruido (rehabilitación auditiva)', age: '5-6 años' },
  { id: 'ra3', code: 'RA-3', name: 'Formato cerrado degradado', category: 'Escucha en ruido (rehabilitación auditiva)', age: '4-5 años' },
  { id: 'ra4', code: 'RA-4', name: 'Secuencia con espera', category: 'Escucha en ruido (rehabilitación auditiva)', age: '5-6 años' },
  { id: 'ra5', code: 'RA-5', name: 'Localización del sonido', category: 'Escucha en ruido (rehabilitación auditiva)', age: '3-4 años' },
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

// Módulo TEA (PRT + TCC): el software orquesta las contingencias; la carga
// comunicativa, los estresores y el veredicto son SIEMPRE del adulto (muro MDR).
export const TEA_META_ES: ExerciseMeta[] = [
  { id: 'tea1', code: 'TEA-1', name: 'Atención Conjunta Triangulada', category: 'PRT · contacto visual y sello doble' },
  { id: 'tea2', code: 'TEA-2', name: 'Quiebre Pragmático Inducido', category: 'Reparación comunicativa (manual)' },
  { id: 'tea3', code: 'TEA-3', name: 'Espejo Asimétrico', category: 'Inhibición de ecopraxia' },
  { id: 'tea4', code: 'TEA-4', name: 'Transición Interrumpida', category: 'Flexibilidad cognitiva (manual)' },
  { id: 'tea5', code: 'TEA-5', name: 'Categorización bajo Carga Sensorial', category: 'Clasificación con ruido babble (manual)' },
  { id: 'tea6', code: 'TEA-6', name: 'Múltiples Señales Simultáneas', category: 'PRT · sobreselectividad de estímulos' },
];

// Módulo Dislexia (fonología + acceso léxico): validación fonológica plegada
// por variedad (es-DO: seseo, /s/ implosiva y líquidas en coda NO son error).
export const DISLEXIA_META_ES: ExerciseMeta[] = [
  { id: 'dx1', code: 'DX-1', name: 'El Intruso Fonológico', category: 'Conciencia fonológica (auditivo puro)' },
  { id: 'dx2', code: 'DX-2', name: 'Rastreo Léxico con Interferencia', category: 'Fluidez lectora bajo carga (manual)' },
  { id: 'dx3', code: 'DX-3', name: 'Síntesis Fonémica Rítmica', category: 'Fusión de fonemas con latencia' },
  { id: 'dx4', code: 'DX-4', name: 'Criba de Pseudopalabras', category: 'Decodificación · máx. 5 ensayos' },
  { id: 'dx5', code: 'DX-5', name: 'Rastreo Visual de Rotaciones', category: 'Grafías b/d · p/q (mapa de misclicks)' },
  { id: 'dx6', code: 'DX-6', name: 'Denominación Rápida (RAN)', category: 'Acceso léxico · persecución manual' },
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
];

// ============================================================================
// METADATOS EN INGLÉS (US English · Pediatric HealthTech)
// ============================================================================
export const AUDICION_META_EN: ExerciseMeta[] = [
  { id: 'ff1', code: 'FF-1', name: 'Initial vowel association', category: 'Sounds and vowels (phonetics-phonology)', age: '4–5 years' },
  { id: 'ff2', code: 'FF-2', name: 'Vowel articulation', category: 'Sounds and vowels (phonetics-phonology)', age: '3–4 years' },
  { id: 'ff3', code: 'FF-3', name: 'Fill in the missing vowel', category: 'Sounds and vowels (phonetics-phonology)', age: '5–6 years' },
  { id: 'se1', code: 'SE-1', name: 'Find the odd one out', category: 'Vocabulary (semantics)', age: '4–5 years' },
  { id: 'se2', code: 'SE-2', name: 'Letter riddle guessing', category: 'Vocabulary (semantics)', age: '5–6 years' },
  { id: 'se3', code: 'SE-3', name: 'Clothing and multi-step commands', category: 'Vocabulary (semantics)', age: '3–4 years' },
  { id: 'ms1', code: 'MS-1', name: 'Singular / plural', category: 'Sentences (morphosyntax)', age: '4–5 years' },
  { id: 'ms2', code: 'MS-2', name: 'Irregular plurals', category: 'Sentences (morphosyntax)', age: '4–5 years' },
  { id: 'ms3', code: 'MS-3', name: 'S-V-O sentence structure', category: 'Sentences (morphosyntax)', age: '5–6 years' },
  { id: 'pr1', code: 'PR-1', name: '"What" question answering', category: 'Social communication (pragmatics)', age: '3–4 years' },
  { id: 'pr2', code: 'PR-2', name: 'Conversational adaptation', category: 'Social communication (pragmatics)', age: '5–6 years' },
  { id: 'pr3', code: 'PR-3', name: 'Emotion recognition', category: 'Social communication (pragmatics)', age: '4–5 years' },
  { id: 'pr4', code: 'PR-4', name: 'Asking for clarification', category: 'Social communication (pragmatics)', age: '5–6 years' },
  { id: 'ra1', code: 'RA-1', name: 'Figure-ground speech in noise', category: 'Auditory training (speech in noise)', age: '4–5 years' },
  { id: 'ra2', code: 'RA-2', name: 'Speechreading (lipreading)', category: 'Auditory training (speech in noise)', age: '5–6 years' },
  { id: 'ra3', code: 'RA-3', name: 'Degraded closed-set identification', category: 'Auditory training (speech in noise)', age: '4–5 years' },
  { id: 'ra4', code: 'RA-4', name: 'Sequential recall with delay', category: 'Auditory training (speech in noise)', age: '5–6 years' },
  { id: 'ra5', code: 'RA-5', name: 'Sound localization', category: 'Auditory training (speech in noise)', age: '3–4 years' },
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
  { id: 'tea1', code: 'TEA-1', name: 'Triangulated joint attention', category: 'PRT · eye contact and dual validation' },
  { id: 'tea2', code: 'TEA-2', name: 'Induced pragmatic breakdown', category: 'Communicative repair (caregiver-mediated)' },
  { id: 'tea3', code: 'TEA-3', name: 'Asymmetrical mirror imitation', category: 'Echopraxia inhibition' },
  { id: 'tea4', code: 'TEA-4', name: 'Interrupted routine transition', category: 'Cognitive flexibility (caregiver-mediated)' },
  { id: 'tea5', code: 'TEA-5', name: 'Categorization under sensory load', category: 'Sorting with background babble noise' },
  { id: 'tea6', code: 'TEA-6', name: 'Multiple simultaneous cues', category: 'PRT · stimulus overselectivity' },
];

export const DISLEXIA_META_EN: ExerciseMeta[] = [
  { id: 'dx1', code: 'DX-1', name: 'Phonological intruder', category: 'Phonological awareness (pure auditory)' },
  { id: 'dx2', code: 'DX-2', name: 'Lexical tracking under interference', category: 'Reading fluency under cognitive load' },
  { id: 'dx3', code: 'DX-3', name: 'Rhythmic phonemic blending', category: 'Phoneme blending with latency' },
  { id: 'dx4', code: 'DX-4', name: 'Pseudoword decoding screening', category: 'Phonological decoding · max 5 trials' },
  { id: 'dx5', code: 'DX-5', name: 'Visual tracking of letter rotations', category: 'Letter discrimination b/d · p/q' },
  { id: 'dx6', code: 'DX-6', name: 'Rapid Automatized Naming (RAN)', category: 'Lexical access · timed naming' },
];

export const AR_META_EN: ExerciseMeta[] = [
  { id: 'ar1', code: 'AR-1', name: 'Orofacial kinematics', category: 'Lip posture trigger · microphone muted', age: '3–4 years' },
  { id: 'ar2', code: 'AR-2', name: 'Instrumented sound localization', category: 'Digitalized VRA · head-turn latency', age: '3–4 years', instrumentaA: 'ra5' },
  { id: 'ar3', code: 'AR-3', name: 'Semantic gaze selection', category: 'Comprehension without fine motor · dwell time', age: '4–5 years' },
];

// Defaults (Spanish)
export const AUDICION_META = AUDICION_META_ES;
export const LENGUAJE_META = LENGUAJE_META_ES;
export const TEA_META = TEA_META_ES;
export const DISLEXIA_META = DISLEXIA_META_ES;
export const AR_META = AR_META_ES;

// Helper getters
export const getAudicionMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  lang === 'en' ? AUDICION_META_EN : AUDICION_META_ES;

export const getLenguajeMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  lang === 'en' ? LENGUAJE_META_EN : LENGUAJE_META_ES;

export const getTeaMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  lang === 'en' ? TEA_META_EN : TEA_META_ES;

export const getDislexiaMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  lang === 'en' ? DISLEXIA_META_EN : DISLEXIA_META_ES;

export const getArMeta = (lang: UiLang = 'es'): ExerciseMeta[] =>
  lang === 'en' ? AR_META_EN : AR_META_ES;

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

// Nombre, categoría y edad en el idioma de la INTERFAZ. Los lee tanto la lista
// de bloques como el player: si cada uno tirase de su lado, se entraría desde
// «Vowel articulation» a «Articulación de vocales», que es lo que pasaba.
export const metaIndexFor = (lang: UiLang): Record<string, ExerciseMeta> =>
  (lang === 'en' ? META_BY_ID_EN : META_BY_ID);

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

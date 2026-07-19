// ============================================================================
// Valeria+ · Metadatos de ejercicios (fuente única)
// Código, nombre, categoría y edad orientativa de cada terapia de Audición y
// Lenguaje. Los consumen la pantalla de selección/prescripción y el player,
// de modo que un cambio (p. ej. la edad de FF-1) se refleja en ambas a la vez
// y no pueden divergir.
// ============================================================================

export interface ExerciseMeta {
  id: string;
  code: string;
  name: string;
  category: string;
  age?: string; // edad orientativa (solo Audición; pedida por los evaluadores)
}

// Bandas de edad conocidas, en el orden en que se listan las secciones de
// Audición. Un ejercicio con una edad fuera de estas bandas no se pierde:
// la lista añade su banda al final (ver ValeriaExerciseSelectionScreen).
export const AGE_BANDS = ['3-4 años', '4-5 años', '5-6 años'];

export const AUDICION_META: ExerciseMeta[] = [
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
];

export const LENGUAJE_META: ExerciseMeta[] = [
  { id: 'atencion_conjunta', code: 'M-1', name: 'Atención Conjunta', category: 'Mirar, burbujas y nombre' },
  { id: 'imitacion', code: 'M-2', name: 'Imitación Motora/Verbal', category: 'Aplausos, tambor y sílabas' },
  { id: 'comprension', code: 'M-3', name: 'Comprensión Verbal', category: 'Órdenes, cuerpo y categorías' },
  { id: 'expresion', code: 'M-4', name: 'Expresión Verbal', category: 'Onomatopeyas, nombrar y frases' },
  { id: 'comunicacion_funcional', code: 'M-5', name: 'Comunicación Funcional', category: 'Pedir "más", "ayuda", "quiero"' },
  { id: 'regulacion_conductual', code: 'M-6', name: 'Regulación Conductual', category: 'Transiciones, rutinas y fichas' },
  { id: 'interaccion_social', code: 'M-7', name: 'Interacción Social', category: 'Turnos, juego simbólico, emociones' },
];

// Módulo TEA (PRT + TCC): el software orquesta las contingencias; la carga
// comunicativa, los estresores y el veredicto son SIEMPRE del adulto (muro MDR).
export const TEA_META: ExerciseMeta[] = [
  { id: 'tea1', code: 'TEA-1', name: 'Atención Conjunta Triangulada', category: 'PRT · contacto visual y sello doble' },
  { id: 'tea2', code: 'TEA-2', name: 'Quiebre Pragmático Inducido', category: 'Reparación comunicativa (manual)' },
  { id: 'tea3', code: 'TEA-3', name: 'Espejo Asimétrico', category: 'Inhibición de ecopraxia' },
  { id: 'tea4', code: 'TEA-4', name: 'Transición Interrumpida', category: 'Flexibilidad cognitiva (manual)' },
  { id: 'tea5', code: 'TEA-5', name: 'Categorización bajo Carga Sensorial', category: 'Clasificación con ruido babble (manual)' },
];

// Módulo Dislexia (fonología + acceso léxico): validación fonológica plegada
// por variedad (es-DO: seseo, /s/ implosiva y líquidas en coda NO son error).
export const DISLEXIA_META: ExerciseMeta[] = [
  { id: 'dx1', code: 'DX-1', name: 'El Intruso Fonológico', category: 'Conciencia fonológica (auditivo puro)' },
  { id: 'dx2', code: 'DX-2', name: 'Rastreo Léxico con Interferencia', category: 'Fluidez lectora bajo carga (manual)' },
  { id: 'dx3', code: 'DX-3', name: 'Síntesis Fonémica Rítmica', category: 'Fusión de fonemas con latencia' },
  { id: 'dx4', code: 'DX-4', name: 'Criba de Pseudopalabras', category: 'Decodificación · máx. 5 ensayos' },
  { id: 'dx5', code: 'DX-5', name: 'Rastreo Visual de Rotaciones', category: 'Grafías b/d · p/q (mapa de misclicks)' },
];

// Índice por id para el player (DB de mini-juegos).
export const META_BY_ID: Record<string, ExerciseMeta> = Object.fromEntries(
  [...AUDICION_META, ...LENGUAJE_META, ...TEA_META, ...DISLEXIA_META].map((m) => [m.id, m]),
);

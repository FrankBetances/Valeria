// ============================================================================
// Valeria+ · Academy — Tipos del estado de formación gamificada (V2.0)
// HUB MULTIDOMINIO. La gamificación deja de ser escalar (global) y pasa a ser
// VECTORIAL: cada dominio clínico (Lenguaje, Hipoacusia, Dislalias, Dislexia,
// TEA) mantiene su propio silo de XP, nivel e insignias. El estado vive cifrado
// en reposo (valeriaCrypto + AsyncStorage) y se expone al hub mediante vistas
// derivadas POR DOMINIO de lectura O(1) y referencia estable — ver academyStore.ts.
//
// Regla MDR: el adulto es el motor clínico. La app orquesta contenido formativo;
// nunca decide ni adapta parámetros del hardware del paciente. La XP es un
// refuerzo de aprendizaje del cuidador, jamás una señal clínica.
// ============================================================================

// --- Dominios clínicos (silos de gamificación) ------------------------------

// Los cinco dominios del hub. El progreso NUNCA se mezcla entre ellos: la XP de
// una cápsula se inyecta siempre en el silo de su dominio de origen.
export type AcademyDomain = 'lenguaje' | 'hipoacusia' | 'dislalias' | 'dislexia' | 'tea';

// --- Contenido (datos puros, sin estado de usuario) -------------------------

// Una diapositiva de una cápsula: título + cuerpo, opcionalmente con icono.
export interface AcademySlide {
  icon?: string;
  heading: string;
  body: string;
}

// Pregunta de validación ágil. `answer` es el índice de la opción correcta.
export interface AcademyQuizQuestion {
  prompt: string;
  options: string[];
  answer: number;
  // Explicación breve que se muestra tras responder (refuerza el aprendizaje).
  rationale: string;
}

// Familia temática de la cápsula → determina el color de acento en la UI.
// (Subfamilia visual dentro del dominio Lenguaje; los demás dominios usan el
// acento de su propio dominio.)
export type AcademyTrack = 'desarrollo' | 'tpr' | 'vicios' | 'mediada';

// Una "Cápsula de Conocimiento": consumo rápido (≈1-2 min) + micro-quiz.
export interface AcademyCapsule {
  id: string;
  domain: AcademyDomain;    // silo al que se inyecta la XP (nunca se mezcla)
  track: AcademyTrack;
  icon: string;
  title: string;
  summary: string;          // gancho de una línea para la lista
  minutes: number;          // duración estimada de lectura
  xp: number;               // XP que otorga al completar (en su silo)
  slides: AcademySlide[];
  quiz: AcademyQuizQuestion[];
}

// --- Contenido de hardware / guías (dominio Hipoacusia) ---------------------

// Micro-guía sin quiz: se completa al leerla (inyecta XP en su silo). Es la
// unidad atómica del BottomSheet de Hipoacusia (Conceptos y Dispositivos).
export interface AcademyGuideUnit {
  id: string;
  domain: AcademyDomain;
  xp: number;
  icon?: string;
  heading: string;
  body: string;
}

// Dispositivo auditivo con sus micro-guías (Cómo funciona · Manejo · Cuidados).
export type HearingDeviceKey = 'audifono' | 'implante' | 'osteo';

export interface HearingDevice {
  key: HearingDeviceKey;
  label: string;            // "Audífono", "Implante Coclear", "Osteointegrado"
  short: string;            // etiqueta corta para la pestaña
  tagline: string;          // subtítulo de una línea
  guides: AcademyGuideUnit[];
}

// --- Estado persistido del usuario ------------------------------------------

// Resultado de una cápsula ya completada. Indexado por id en `completed`
// para que la comprobación "¿está hecha?" sea O(1).
export interface AcademyCapsuleResult {
  completedAt: number;      // epoch ms
  quizScore: number;        // 0..1 (aciertos / preguntas); 1 en guías sin quiz
  attempts: number;         // intentos hasta aprobar
}

// Silo de gamificación de UN dominio. Aislado del resto por diseño.
export interface AcademyDomainSilo {
  xp: number;
  badges: string[];         // ids de insignias de ESTE dominio (namespaced)
}

// Estado raíz que se cifra y persiste. `version` habilita migraciones.
// v2: progreso VECTORIAL. `completed` permanece GLOBAL (lookup O(1)); el dominio
// de cada cápsula se deriva del registro de contenido, y su XP se inyecta en el
// silo correspondiente dentro de `domains`.
export interface ValeriaAcademyState {
  version: number;
  domains: Record<AcademyDomain, AcademyDomainSilo>;
  completed: Record<string, AcademyCapsuleResult>;    // mapa id → resultado (O(1))
  lastCapsuleId: string | null;                       // "continuar donde lo dejaste"
  updatedAt: number;
}

// --- Vistas derivadas para el hub (lectura O(1), referencia estable) ---------

export interface AcademyBadge {
  id: string;               // namespaced: "hipoacusia:graduado"
  icon: string;
  name: string;
  desc: string;
}

// Instantánea inmutable de UN dominio que consume su Tarjeta de Dominio vía
// useSyncExternalStore. Se recalcula SOLO cuando cambia ESE dominio; entre
// cambios devuelve la misma referencia, aislando el re-render a esa tarjeta.
export interface AcademyDomainSummary {
  domain: AcademyDomain;
  completedCount: number;
  totalCount: number;
  progress: number;         // 0..1 (completadas del dominio / totales del dominio)
  level: number;
  levelName: string;        // específico del dominio ("Experto en Hipoacusia")
  xp: number;
  badgeCount: number;
  hydrated: boolean;        // false hasta que se lee el almacenamiento cifrado
}

// Instantánea AGREGADA (suma de todos los silos) para la tarjeta de entrada del
// hub en la pantalla de prescripción. Referencia estable entre cambios.
export interface AcademySummary {
  completedCount: number;
  totalCount: number;
  progress: number;
  xp: number;
  badgeCount: number;
  hydrated: boolean;
}

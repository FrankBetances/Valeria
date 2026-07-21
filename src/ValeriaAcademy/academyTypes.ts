// ============================================================================
// Valeria+ · Academy — Tipos del estado de formación gamificada (V1.0)
// Sistema de capacitación para el adulto cuidador (motor clínico de la app,
// requisito MDR). El estado vive cifrado en reposo (valeriaCrypto + AsyncStorage)
// y se expone al hub mediante una vista derivada (`AcademySummary`) de lectura
// O(1) — ver academyStore.ts.
// ============================================================================

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
export type AcademyTrack = 'desarrollo' | 'tpr' | 'vicios' | 'mediada';

// Una "Cápsula de Conocimiento": consumo rápido (≈1-2 min) + micro-quiz.
export interface AcademyCapsule {
  id: string;
  track: AcademyTrack;
  icon: string;
  title: string;
  summary: string;          // gancho de una línea para la lista
  minutes: number;          // duración estimada de lectura
  xp: number;               // XP que otorga al completar
  slides: AcademySlide[];
  quiz: AcademyQuizQuestion[];
}

// --- Estado persistido del usuario ------------------------------------------

// Resultado de una cápsula ya completada. Indexado por id en `completed`
// para que la comprobación "¿está hecha?" sea O(1).
export interface AcademyCapsuleResult {
  completedAt: number;      // epoch ms
  quizScore: number;        // 0..1 (aciertos / preguntas)
  attempts: number;         // intentos hasta aprobar
}

// Estado raíz que se cifra y persiste. `version` habilita migraciones futuras.
export interface ValeriaAcademyState {
  version: number;
  xp: number;
  badges: string[];                                   // ids de insignias desbloqueadas
  completed: Record<string, AcademyCapsuleResult>;    // mapa id → resultado (lookup O(1))
  lastCapsuleId: string | null;                       // para "continuar donde lo dejaste"
  updatedAt: number;
}

// --- Vista derivada para el hub (lectura O(1), referencia estable) -----------

export interface AcademyBadge {
  id: string;
  icon: string;
  name: string;
  desc: string;
}

// Instantánea inmutable que consume la tarjeta del hub vía useSyncExternalStore.
// Se recalcula SOLO cuando el estado cambia; entre cambios devuelve la misma
// referencia, evitando re-renders innecesarios en la navegación.
export interface AcademySummary {
  completedCount: number;
  totalCount: number;
  progress: number;         // 0..1 (cápsulas completadas / totales)
  level: number;
  levelName: string;
  xp: number;
  badgeCount: number;
  hydrated: boolean;        // false hasta que se lee el almacenamiento cifrado
}

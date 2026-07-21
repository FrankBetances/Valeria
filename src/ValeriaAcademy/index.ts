// ============================================================================
// Valeria+ · Academy — Punto de entrada del módulo
// ============================================================================
export { ValeriaAcademyScreen, default } from './ValeriaAcademyScreen';
export { AcademyHubCard } from './AcademyHubCard';
export {
  useAcademySummary,
  getSummarySnapshot,
  hydrateAcademy,
  completeCapsule,
  isCapsuleDone,
} from './academyStore';
export { ACADEMY_CAPSULES, ACADEMY_TOTAL } from './academyContent';
export type {
  ValeriaAcademyState,
  AcademySummary,
  AcademyCapsule,
  AcademyCapsuleResult,
} from './academyTypes';

// ============================================================================
// Valeria+ · Academy — Registro de contenido completable (V2.0)
// Módulo PURO. Unifica todo lo que otorga XP (cápsulas con quiz + micro-guías de
// hardware) en un índice por id, y precalcula el TOTAL por dominio. El store lee
// de aquí para:
//   · Resolver, en O(1), el dominio y la XP de un id completado (inyección en el
//     silo correcto).
//   · Conocer el total de cada dominio para el progreso y las insignias.
// Aísla al store de conocer las fuentes de contenido (cápsulas vs. guías).
// ============================================================================
import { AcademyDomain } from './academyTypes';
import { ACADEMY_CAPSULES } from './academyContent';
import { HIPOACUSIA_UNITS } from './academyHardware';
import { ACADEMY_DOMAINS } from './academyDomains';

export interface AcademyCompletable {
  id: string;
  domain: AcademyDomain;
  xp: number;
  hasQuiz: boolean;   // true para cápsulas (habilita la insignia "perfecto")
}

const ALL: AcademyCompletable[] = [
  ...ACADEMY_CAPSULES.map((c) => ({ id: c.id, domain: c.domain, xp: c.xp, hasQuiz: true })),
  ...HIPOACUSIA_UNITS.map((u) => ({ id: u.id, domain: u.domain, xp: u.xp, hasQuiz: false })),
];

// Índice id → completable (lookup O(1) desde el store).
export const COMPLETABLE_BY_ID: Record<string, AcademyCompletable> = {};
ALL.forEach((c) => { COMPLETABLE_BY_ID[c.id] = c; });

// Total de unidades completables por dominio (base del progreso y milestones).
export const DOMAIN_TOTALS: Record<AcademyDomain, number> = ACADEMY_DOMAINS.reduce(
  (acc, d) => { acc[d] = 0; return acc; },
  {} as Record<AcademyDomain, number>,
);
ALL.forEach((c) => { DOMAIN_TOTALS[c.domain] += 1; });

// Total global (suma de todos los dominios) para la vista agregada del hub.
export const ACADEMY_GRAND_TOTAL = ALL.length;

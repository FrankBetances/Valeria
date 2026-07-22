// ============================================================================
// Valeria+ · Academy — Store de progreso VECTORIAL (V2.0)
// Persistencia offline-first CIFRADA (valeriaCrypto + AsyncStorage) con una capa
// en memoria. HUB MULTIDOMINIO: la gamificación ya no es escalar, sino un vector
// de silos aislados (Lenguaje, Hipoacusia, Dislalias, Dislexia, TEA).
//
// Invariantes de rendimiento (hilo principal no bloqueante):
//   · Lectura O(1) por dominio (getDomainSnapshot) y agregada (getSummarySnapshot).
//   · Comprobación "¿hecha?" en O(1) (mapa global `completed`).
//   · AISLAMIENTO DE RE-RENDER: cada Tarjeta de Dominio se suscribe a SU rebanada;
//     en cada cambio solo se sustituye la referencia del/los dominio(s) mutado(s),
//     de modo que useSyncExternalStore descarta el re-render de las demás tarjetas.
//
// Regla MDR: la XP es refuerzo de aprendizaje del cuidador; nunca una señal
// clínica ni un parámetro que adapte el hardware del paciente.
// ============================================================================
import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../valeriaTheme';
import { encryptJSON, decryptJSON } from '../valeriaCrypto';
import {
  ACADEMY_DOMAINS,
  DOMAIN_BADGE_DEFS,
  badgeId,
  badgeFromId,
  domainFromPatologia,
  domainLevelFor,
  domainLevelName,
} from './academyDomains';
import { COMPLETABLE_BY_ID, DOMAIN_TOTALS, ACADEMY_GRAND_TOTAL } from './academyRegistry';
import {
  AcademyBadge,
  AcademyCapsuleResult,
  AcademyDomain,
  AcademyDomainSilo,
  AcademyDomainSummary,
  AcademySummary,
  ValeriaAcademyState,
} from './academyTypes';

const STATE_VERSION = 2;

const emptyDomains = (): Record<AcademyDomain, AcademyDomainSilo> =>
  ACADEMY_DOMAINS.reduce((acc, d) => {
    acc[d] = { xp: 0, badges: [] };
    return acc;
  }, {} as Record<AcademyDomain, AcademyDomainSilo>);

const EMPTY = (): ValeriaAcademyState => ({
  version: STATE_VERSION,
  domains: emptyDomains(),
  completed: {},
  lastCapsuleId: null,
  updatedAt: 0,
});

// --- Estado en memoria (fuente de verdad en caliente) -----------------------
let state: ValeriaAcademyState = EMPTY();
let hydrated = false;
let hydrating: Promise<void> | null = null;
const listeners = new Set<() => void>();

// --- Instantáneas derivadas cacheadas (referencia estable POR DOMINIO) ------
let domainCache: Record<AcademyDomain, AcademyDomainSummary> = buildAllDomainSummaries();
let aggregateCache: AcademySummary = buildAggregate();

// Nº de cápsulas completadas de un dominio dado (se recomputa en emit, fuera del
// render; la lectura de la tarjeta sigue siendo O(1) sobre la caché).
function completedCountFor(domain: AcademyDomain): number {
  let n = 0;
  for (const id in state.completed) {
    if (COMPLETABLE_BY_ID[id]?.domain === domain) n += 1;
  }
  return n;
}

function buildDomainSummary(domain: AcademyDomain): AcademyDomainSummary {
  const silo = state.domains[domain];
  const total = DOMAIN_TOTALS[domain] ?? 0;
  const completedCount = completedCountFor(domain);
  const level = domainLevelFor(silo.xp);
  return {
    domain,
    completedCount,
    totalCount: total,
    progress: total ? completedCount / total : 0,
    level,
    levelName: domainLevelName(domain, level),
    xp: silo.xp,
    badgeCount: silo.badges.length,
    hydrated,
  };
}

function buildAllDomainSummaries(): Record<AcademyDomain, AcademyDomainSummary> {
  return ACADEMY_DOMAINS.reduce((acc, d) => {
    acc[d] = buildDomainSummary(d);
    return acc;
  }, {} as Record<AcademyDomain, AcademyDomainSummary>);
}

function buildAggregate(): AcademySummary {
  let xp = 0;
  let badgeCount = 0;
  for (const d of ACADEMY_DOMAINS) {
    xp += state.domains[d].xp;
    badgeCount += state.domains[d].badges.length;
  }
  const completedCount = Object.keys(state.completed).length;
  return {
    completedCount,
    totalCount: ACADEMY_GRAND_TOTAL,
    progress: ACADEMY_GRAND_TOTAL ? completedCount / ACADEMY_GRAND_TOTAL : 0,
    xp,
    badgeCount,
    hydrated,
  };
}

// Igualdad superficial: si la rebanada de un dominio no cambió, conservamos su
// referencia para que su tarjeta NO se re-renderice.
function sameDomainSummary(a: AcademyDomainSummary, b: AcademyDomainSummary): boolean {
  return (
    a.completedCount === b.completedCount &&
    a.totalCount === b.totalCount &&
    a.xp === b.xp &&
    a.badgeCount === b.badgeCount &&
    a.level === b.level &&
    a.hydrated === b.hydrated
  );
}

function emit(): void {
  const nextDomains = {} as Record<AcademyDomain, AcademyDomainSummary>;
  for (const d of ACADEMY_DOMAINS) {
    const built = buildDomainSummary(d);
    const prev = domainCache[d];
    // Conserva la referencia previa si nada cambió en ESTE dominio.
    nextDomains[d] = prev && sameDomainSummary(prev, built) ? prev : built;
  }
  domainCache = nextDomains;
  aggregateCache = buildAggregate();
  listeners.forEach((l) => l());
}

// --- API de lectura ---------------------------------------------------------

// Lectura O(1) por dominio: devuelve la rebanada cacheada (referencia estable).
export const getDomainSnapshot = (domain: AcademyDomain): AcademyDomainSummary =>
  domainCache[domain];

// Lectura O(1) agregada (suma de todos los silos).
export const getSummarySnapshot = (): AcademySummary => aggregateCache;

// Comprobación O(1) de si una unidad (cápsula o guía) está completada.
export const isCapsuleDone = (id: string): boolean => !!state.completed[id];

// Copia superficial del mapa de resultados (para la pantalla de la academia).
export const getResults = (): Readonly<Record<string, AcademyCapsuleResult>> => state.completed;

// Insignias ganadas de un dominio → descriptores para la UI.
export const getDomainBadges = (domain: AcademyDomain): AcademyBadge[] =>
  state.domains[domain].badges
    .map(badgeFromId)
    .filter((b): b is AcademyBadge => b != null);

// --- Suscripción (useSyncExternalStore) -------------------------------------
export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// --- Migración silenciosa v1 (escalar) → v2 (vectorial) ---------------------
// El progreso heredado (xp + badges escalares) se asigna al dominio principal
// activo de la Ficha de Registro (o 'lenguaje' por defecto). `completed` se
// conserva íntegro (mapa global). Los ids desconocidos se ignoran con gracia.
async function migrateLegacy(legacy: any): Promise<ValeriaAcademyState> {
  let targetDomain: AcademyDomain = 'lenguaje';
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.registro);
    if (raw) targetDomain = domainFromPatologia(JSON.parse(raw)?.patologia);
  } catch (e) {
    /* Ficha no disponible: se queda en 'lenguaje' */
  }

  const next = EMPTY();
  next.domains[targetDomain].xp = Number(legacy?.xp) || 0;
  // Re-namespacea las insignias heredadas al dominio destino.
  const legacyBadges: string[] = Array.isArray(legacy?.badges) ? legacy.badges : [];
  next.domains[targetDomain].badges = legacyBadges
    .filter((k) => DOMAIN_BADGE_DEFS.some((d) => d.key === k))
    .map((k) => badgeId(targetDomain, k as any));
  next.completed = legacy?.completed && typeof legacy.completed === 'object' ? legacy.completed : {};
  next.lastCapsuleId = legacy?.lastCapsuleId ?? null;
  next.updatedAt = Number(legacy?.updatedAt) || Date.now();
  return next;
}

// --- Hidratación (lee el blob cifrado una sola vez) -------------------------
export const hydrateAcademy = (): Promise<void> => {
  if (hydrated) return Promise.resolve();
  if (hydrating) return hydrating;
  hydrating = (async () => {
    try {
      const blob = await AsyncStorage.getItem(STORAGE_KEYS.academy);
      const parsed = await decryptJSON<any>(blob);
      if (parsed && typeof parsed === 'object') {
        if (parsed.version === STATE_VERSION && parsed.domains) {
          // Formato v2: normaliza asegurando los 5 silos presentes.
          state = {
            ...EMPTY(),
            ...parsed,
            domains: { ...emptyDomains(), ...parsed.domains },
            completed: parsed.completed ?? {},
          };
        } else {
          // Formato heredado (v1 escalar) → migración silenciosa y re-cifrado.
          state = await migrateLegacy(parsed);
          await persist();
        }
      }
    } catch (e) {
      /* almacenamiento no disponible: seguimos con estado vacío */
    } finally {
      hydrated = true;
      emit();
    }
  })();
  return hydrating;
};

async function persist(): Promise<void> {
  try {
    const blob = await encryptJSON(state);
    await AsyncStorage.setItem(STORAGE_KEYS.academy, blob);
  } catch (e) {
    /* si falla el guardado, el estado en memoria sigue siendo válido en sesión */
  }
}

// --- Mutaciones -------------------------------------------------------------

export interface CapsuleCompletion {
  domain: AcademyDomain | null;
  xpGained: number;
  alreadyDone: boolean;
  newBadges: AcademyBadge[];
  levelUp: boolean;
}

// Núcleo común: registra una unidad completada e inyecta su XP en el SILO de su
// dominio (nunca se mezcla). Idempotente en XP (no re-otorga si ya estaba hecha,
// pero actualiza el mejor quizScore). `hasQuiz` habilita la insignia "perfecto".
async function recordCompletion(id: string, quizScore: number): Promise<CapsuleCompletion> {
  await hydrateAcademy();
  const meta = COMPLETABLE_BY_ID[id];
  if (!meta) {
    return { domain: null, xpGained: 0, alreadyDone: false, newBadges: [], levelUp: false };
  }
  const domain = meta.domain;
  const silo = state.domains[domain];
  const prev = state.completed[id];
  const alreadyDone = !!prev;
  const prevLevel = domainLevelFor(silo.xp);

  const result: AcademyCapsuleResult = {
    completedAt: Date.now(),
    quizScore: Math.max(prev?.quizScore ?? 0, quizScore),
    attempts: (prev?.attempts ?? 0) + 1,
  };
  state.completed = { ...state.completed, [id]: result };
  state.lastCapsuleId = id;
  state.updatedAt = result.completedAt;

  const xpGained = alreadyDone ? 0 : meta.xp;
  // Inyección en el silo del dominio de origen (inmutable: nueva referencia).
  const nextBadges = [...silo.badges];
  state.domains = { ...state.domains, [domain]: { xp: silo.xp + xpGained, badges: nextBadges } };

  // --- Insignias del dominio (milestones sobre el total del propio dominio) ---
  const newBadges: AcademyBadge[] = [];
  const unlock = (key: 'primeraCapsula' | 'mitad' | 'graduado' | 'perfecto', cond: boolean) => {
    const bid = badgeId(domain, key);
    if (cond && !nextBadges.includes(bid)) {
      nextBadges.push(bid);
      const b = badgeFromId(bid);
      if (b) newBadges.push(b);
    }
  };
  const done = completedCountFor(domain);
  const total = DOMAIN_TOTALS[domain] ?? 0;
  unlock('primeraCapsula', done >= 1);
  unlock('mitad', total > 0 && done >= Math.ceil(total / 2));
  unlock('graduado', total > 0 && done >= total);
  if (meta.hasQuiz) unlock('perfecto', quizScore >= 1);

  await persist();
  emit();

  return {
    domain,
    xpGained,
    alreadyDone,
    newBadges,
    levelUp: domainLevelFor(state.domains[domain].xp) > prevLevel,
  };
}

// Cápsula con micro-quiz (Lenguaje, Dislalias, Dislexia, TEA).
export const completeCapsule = (capsuleId: string, quizScore: number): Promise<CapsuleCompletion> =>
  recordCompletion(capsuleId, quizScore);

// Micro-guía de hardware sin quiz (Hipoacusia): se marca vista al leerla.
export const completeGuideUnit = (unitId: string): Promise<CapsuleCompletion> =>
  recordCompletion(unitId, 1);

// Utilidad de pruebas / reinicio (no expuesta en UI de producción).
export const resetAcademy = async (): Promise<void> => {
  state = EMPTY();
  await persist();
  emit();
};

// --- Hooks de React ---------------------------------------------------------

// Suscribe una Tarjeta de Dominio a SU rebanada. Re-renderiza SOLO cuando cambia
// ESE dominio (referencia estable entre cambios ajenos). Lectura O(1).
export const useAcademyDomainSummary = (domain: AcademyDomain): AcademyDomainSummary =>
  useSyncExternalStore(
    subscribe,
    () => getDomainSnapshot(domain),
    () => getDomainSnapshot(domain),
  );

// Suscribe la tarjeta de entrada del hub al resumen AGREGADO de todos los silos.
export const useAcademySummary = (): AcademySummary =>
  useSyncExternalStore(subscribe, getSummarySnapshot, getSummarySnapshot);

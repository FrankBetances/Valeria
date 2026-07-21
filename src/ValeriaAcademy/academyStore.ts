// ============================================================================
// Valeria+ · Academy — Store de progreso (V1.0)
// Persistencia offline-first CIFRADA (valeriaCrypto + AsyncStorage) con una capa
// en memoria que permite:
//   · Lectura O(1) del resumen para el hub (getSummarySnapshot).
//   · Suscripción puntual vía useSyncExternalStore → solo re-renderiza la tarjeta
//     de Academy cuando el progreso cambia, nunca en la navegación normal.
//   · Comprobación "¿cápsula hecha?" en O(1) (mapa por id).
//
// La instantánea (`AcademySummary`) mantiene REFERENCIA ESTABLE entre cambios:
// useSyncExternalStore exige que getSnapshot no cree un objeto nuevo cada llamada,
// o provocaría re-renders infinitos. Por eso cacheamos `summaryCache`.
// ============================================================================
import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../valeriaTheme';
import { encryptJSON, decryptJSON } from '../valeriaCrypto';
import {
  ACADEMY_BADGES,
  ACADEMY_CAPSULES,
  ACADEMY_TOTAL,
  academyLevelFor,
  academyLevelName,
} from './academyContent';
import {
  AcademyBadge,
  AcademyCapsuleResult,
  AcademySummary,
  ValeriaAcademyState,
} from './academyTypes';

const STATE_VERSION = 1;

const EMPTY: ValeriaAcademyState = {
  version: STATE_VERSION,
  xp: 0,
  badges: [],
  completed: {},
  lastCapsuleId: null,
  updatedAt: 0,
};

// --- Estado en memoria (fuente de verdad en caliente) -----------------------
let state: ValeriaAcademyState = { ...EMPTY };
let hydrated = false;
let hydrating: Promise<void> | null = null;
const listeners = new Set<() => void>();

// --- Instantánea derivada cacheada (referencia estable) ---------------------
let summaryCache: AcademySummary = buildSummary();

function buildSummary(): AcademySummary {
  const completedCount = Object.keys(state.completed).length;
  const level = academyLevelFor(state.xp);
  return {
    completedCount,
    totalCount: ACADEMY_TOTAL,
    progress: ACADEMY_TOTAL ? completedCount / ACADEMY_TOTAL : 0,
    level,
    levelName: academyLevelName(level),
    xp: state.xp,
    badgeCount: state.badges.length,
    hydrated,
  };
}

function emit(): void {
  summaryCache = buildSummary();           // recomputa UNA vez por cambio
  listeners.forEach((l) => l());
}

// --- API de lectura ---------------------------------------------------------

// Lectura O(1): devuelve la instantánea cacheada sin recomputar ni asignar.
export const getSummarySnapshot = (): AcademySummary => summaryCache;

// Comprobación O(1) de si una cápsula está completada.
export const isCapsuleDone = (id: string): boolean => !!state.completed[id];

// Copia superficial del mapa de resultados (para la pantalla de la academia).
export const getResults = (): Readonly<Record<string, AcademyCapsuleResult>> => state.completed;

export const getEarnedBadges = (): AcademyBadge[] =>
  ACADEMY_BADGES.filter((b) => state.badges.includes(b.id));

// --- Suscripción (useSyncExternalStore) -------------------------------------
export const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// --- Hidratación (lee el blob cifrado una sola vez) -------------------------
export const hydrateAcademy = (): Promise<void> => {
  if (hydrated) return Promise.resolve();
  if (hydrating) return hydrating;
  hydrating = (async () => {
    try {
      const blob = await AsyncStorage.getItem(STORAGE_KEYS.academy);
      const parsed = await decryptJSON<ValeriaAcademyState>(blob);
      if (parsed && parsed.version === STATE_VERSION) {
        state = { ...EMPTY, ...parsed, completed: parsed.completed ?? {} };
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
  xpGained: number;
  alreadyDone: boolean;
  newBadges: AcademyBadge[];
  levelUp: boolean;
}

// Registra una cápsula completada (idempotente en XP: no re-otorga si ya estaba
// hecha, pero sí actualiza el mejor quizScore). Persiste cifrado y notifica.
export const completeCapsule = async (
  capsuleId: string,
  quizScore: number,
): Promise<CapsuleCompletion> => {
  await hydrateAcademy();
  const capsule = ACADEMY_CAPSULES.find((c) => c.id === capsuleId);
  const prev = state.completed[capsuleId];
  const alreadyDone = !!prev;
  const prevLevel = academyLevelFor(state.xp);

  const result: AcademyCapsuleResult = {
    completedAt: Date.now(),
    quizScore: Math.max(prev?.quizScore ?? 0, quizScore),
    attempts: (prev?.attempts ?? 0) + 1,
  };
  state.completed = { ...state.completed, [capsuleId]: result };
  state.lastCapsuleId = capsuleId;
  state.updatedAt = result.completedAt;

  const xpGained = alreadyDone ? 0 : capsule?.xp ?? 0;
  state.xp += xpGained;

  // --- Insignias ---
  const newBadges: AcademyBadge[] = [];
  const unlock = (id: string, cond: boolean) => {
    if (cond && !state.badges.includes(id)) {
      state.badges = [...state.badges, id];
      const b = ACADEMY_BADGES.find((x) => x.id === id);
      if (b) newBadges.push(b);
    }
  };
  const done = Object.keys(state.completed).length;
  unlock('primeraCapsula', done >= 1);
  unlock('mitad', done >= Math.ceil(ACADEMY_TOTAL / 2));
  unlock('graduado', done >= ACADEMY_TOTAL);
  unlock('perfecto', quizScore >= 1);

  await persist();
  emit();

  return {
    xpGained,
    alreadyDone,
    newBadges,
    levelUp: academyLevelFor(state.xp) > prevLevel,
  };
};

// Utilidad de pruebas / reinicio (no expuesta en UI de producción).
export const resetAcademy = async (): Promise<void> => {
  state = { ...EMPTY };
  await persist();
  emit();
};

// --- Hook de React ----------------------------------------------------------
// Suscribe un componente al resumen del hub. Re-renderiza SOLO cuando cambia el
// progreso; la lectura del snapshot es O(1) y de referencia estable.
export const useAcademySummary = (): AcademySummary =>
  useSyncExternalStore(subscribe, getSummarySnapshot, getSummarySnapshot);

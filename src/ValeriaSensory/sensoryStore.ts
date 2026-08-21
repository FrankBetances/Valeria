// ============================================================================
// Valeria+ · Integración Sensorial Auditiva — Store y Persistencia Cifrada
// Silo independiente de progreso con cifrado en reposo (valeriaCrypto).
// Muro clínico: la participación y la autorregulación siempre suman XP;
// parar, pausar o abandonar nunca resta ni penaliza.
// ============================================================================
import { useSyncExternalStore } from 'react';
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../valeriaTheme';
import { encryptJSON, decryptJSON } from '../valeriaCrypto';
import {
  SensorySessionRecord,
  ValeriaSensoryState,
} from './sensoryTypes';

const SENSORY_STATE_VERSION = 1;

const DEFAULT_SENSORY_STATE: ValeriaSensoryState = {
  version: SENSORY_STATE_VERSION,
  xp: 0,
  sessionsCount: 0,
  completedActivities: {},
  lastSessionAt: 0,
  unlockedBadges: [],
};

let inMemoryState: ValeriaSensoryState = { ...DEFAULT_SENSORY_STATE };
let hydrated = false;
const listeners = new Set<() => void>();

const emit = (): void => {
  listeners.forEach((fn) => fn());
};

export const subscribeSensory = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const getSensorySnapshot = (): ValeriaSensoryState => inMemoryState;

export const hydrateSensory = async (): Promise<void> => {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.sensory);
    if (raw) {
      const decrypted = await decryptJSON<ValeriaSensoryState>(raw);
      if (decrypted && decrypted.version === SENSORY_STATE_VERSION) {
        inMemoryState = {
          ...DEFAULT_SENSORY_STATE,
          ...decrypted,
        };
      }
    }
  } catch (e) {
    // Fallback seguro en memoria
  } finally {
    hydrated = true;
    emit();
  }
};

void hydrateSensory();

export const useSensoryState = (): ValeriaSensoryState =>
  useSyncExternalStore(subscribeSensory, getSensorySnapshot, getSensorySnapshot);

/**
 * Registra una sesión sensorial de forma desacoplada y cifrada en reposo.
 * Se inyecta XP de participación (base 20 XP) + autorregulación/TPR (10 XP).
 */
export async function recordSensorySession(
  sessionData: Omit<SensorySessionRecord, 'id' | 'timestamp'>,
): Promise<{ xpEarned: number; newTotalXp: number }> {
  const timestamp = Date.now();
  const sessionId = `sensory_${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
  const fullSession: SensorySessionRecord = {
    ...sessionData,
    id: sessionId,
    timestamp,
  };

  // Cálculo de XP clínica no punitiva
  const earnedXp = sessionData.earnedXp > 0 ? sessionData.earnedXp : 20;

  // Actualización inmediata del estado en memoria
  const nextActivities = { ...inMemoryState.completedActivities };
  const currentCount = nextActivities[sessionData.exerciseId] ?? 0;
  nextActivities[sessionData.exerciseId] = currentCount + 1;

  inMemoryState = {
    ...inMemoryState,
    xp: inMemoryState.xp + earnedXp,
    sessionsCount: inMemoryState.sessionsCount + 1,
    completedActivities: nextActivities,
    lastSessionAt: timestamp,
  };
  emit();

  // Persistencia diferida fuera del hilo de UI
  InteractionManager.runAfterInteractions(async () => {
    try {
      // 1. Guardar estado agregado del silo cifrado
      const encryptedState = await encryptJSON(inMemoryState);
      await AsyncStorage.setItem(STORAGE_KEYS.sensory, encryptedState);

      // 2. Anexar al historial de sesiones sensoriales, TAMBIÉN cifrado.
      //
      // Este historial no es progreso de juego: lleva la respuesta observada
      // del niño, si se aplicó la estrategia de regulación y las notas que
      // escriba el adulto. Es observación clínica, y salía en claro mientras
      // la cabecera de este fichero decía «cifrada en reposo». Lo que declara
      // site/privacidad.html es que estos registros se guardan cifrados.
      const existingHistoryRaw = await AsyncStorage.getItem(STORAGE_KEYS.sensorySessions);
      const history: SensorySessionRecord[] = existingHistoryRaw
        ? (await decryptJSON<SensorySessionRecord[]>(existingHistoryRaw)) ?? []
        : [];
      history.unshift(fullSession);
      // Mantener últimas 50 sesiones para evitar sobrecarga de almacenamiento
      const trimmed = history.slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEYS.sensorySessions, await encryptJSON(trimmed));
    } catch (error) {
      console.warn('Fallo en la persistencia local del módulo sensorial:', error);
    }
  });

  return {
    xpEarned: earnedXp,
    newTotalXp: inMemoryState.xp,
  };
}

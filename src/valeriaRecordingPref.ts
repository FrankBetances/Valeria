// ============================================================================
// Valeria+ · Preferencia "grabación automática" (PM-04 / ES-03)
// Compartida entre Pares Mínimos y Expansión Semántica: por defecto el
// micrófono NO se abre solo tras la consigna, para dar tiempo al niño a
// prepararse. Las familias que ya tenían el ritmo cogido pueden reactivar el
// arranque automático desde aquí (una sola implementación, un solo dato).
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './valeriaTheme';

let cached: boolean | null = null;

export const getAutoRecordPref = async (): Promise<boolean> => {
  if (cached !== null) return cached;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.autoRecord);
    cached = raw === 'on';
  } catch (e) {
    cached = false;
  }
  return cached;
};

export const setAutoRecordPref = async (on: boolean): Promise<void> => {
  cached = on;
  try { await AsyncStorage.setItem(STORAGE_KEYS.autoRecord, on ? 'on' : 'off'); } catch (e) { /* noop */ }
};

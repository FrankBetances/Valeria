// ============================================================================
// Valeria+ · Puente JS para Play Age Signals (solo Android · AB 1043)
//
// Se consulta una vez por arranque y su resultado vive ÚNICAMENTE en memoria:
// prohibido persistirlo en AsyncStorage, telemetría o logs. En iOS, web o si el
// módulo nativo no está enlazado devuelve `{ status: 'unavailable' }`.
// ============================================================================
import { NativeModules, Platform } from 'react-native';

export type AgeSignalStatus =
  | 'SHARED'
  | 'NOT_SHARED'
  | 'VERIFICATION_REQUIRED'
  | 'UNKNOWN'
  | 'ERROR'
  | 'UNAVAILABLE'
  | 'unavailable';

export interface AgeSignalResult {
  status: AgeSignalStatus;
  ageLower?: number;
  ageUpper?: number;
  ageRangeSource?: 'TIER_A' | 'TIER_B' | 'TIER_C' | 'TIER_D';
  significantChangeStatus?: 'APPROVED' | 'PENDING' | 'DECLINED';
  significantChangeApprovalDate?: string;
  installId?: string;
  mandatory?: boolean;
  error?: string;
}

interface NativeAgeSignalsBridge {
  check(): Promise<AgeSignalResult>;
}

let inMemoryStartupCheck: Promise<AgeSignalResult> | null = null;

function nativeBridge(): NativeAgeSignalsBridge | null {
  if (Platform.OS !== 'android') return null;
  const mod = NativeModules?.ValeriaAgeSignals as NativeAgeSignalsBridge | undefined;
  return mod && typeof mod.check === 'function' ? mod : null;
}

export async function checkAgeSignals(): Promise<AgeSignalResult> {
  const bridge = nativeBridge();
  if (!bridge) return { status: 'unavailable' };
  try {
    const res = await bridge.check();
    if (!res || typeof res.status !== 'string') return { status: 'unavailable' };
    return res;
  } catch (e) {
    return {
      status: 'ERROR',
      error: e instanceof Error ? e.message : 'BRIDGE_ERROR',
    };
  }
}

/**
 * Consulta la señal de edad una vez por arranque, manteniendo el resultado
 * exclusivamente en memoria mientras dura la ejecución actual de la app.
 */
export function checkAgeSignalsAtStartup(): Promise<AgeSignalResult> {
  if (!inMemoryStartupCheck) {
    inMemoryStartupCheck = checkAgeSignals();
  }
  return inMemoryStartupCheck;
}

/** Reinicia la caché en memoria (solo para pruebas). */
export function resetAgeSignalsMemoryCache(): void {
  inMemoryStartupCheck = null;
}

/**
 * Determina si debe mostrarse la pantalla de acompañamiento adulto antes de Welcome.
 * - Errores, señal no compartida, verificación pendiente o ausencia de módulo: no bloquean.
 * - Adulto verificado (`ageUpper == null` con `ageLower >= 18` y sin supervisión): no bloquea.
 * - Menor (<18 por banda cerrada) o cuenta supervisada (`TIER_B` / `installId`): muestra puerta.
 */
export function shouldShowAdultGate(res: AgeSignalResult): boolean {
  if (res.status !== 'SHARED') return false;
  if (res.ageRangeSource === 'TIER_B' || Boolean(res.installId)) return true;
  if (typeof res.ageUpper === 'number' && res.ageUpper < 18) return true;
  return false;
}

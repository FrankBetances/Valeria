// ============================================================================
// Valeria+ · Ajustes persistidos del bloque de Realidad Aumentada
// Tres cosas que viven en el dispositivo y NO en el módulo nativo (el nativo
// mide y renderiza; no persiste nada):
//   1) Los umbrales clínicos que fijó el adulto en el Panel.
//   2) El consentimiento informado de cámara, por paciente.
//   3) El DeviceProfile de la última Prueba de Aptitud, con su huella de
//      dispositivo para saber cuándo hay que repetirla.
//
// Muro MDR: los umbrales solo cambian por gesto explícito del adulto. Aquí no
// hay ninguna función que los ajuste sola, ni por rendimiento, ni por historial,
// ni por edad. Si alguna vez aparece una, el módulo deja de ser Clase I.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './valeriaTheme';
import type { ArThresholds, ArDeviceProfile, ArPointerSource } from './valeriaArBridge';

// Valores de partida. Son los del protocolo (§7 del plan), no una media de nada.
export const AR_DEFAULT_THRESHOLDS: ArThresholds = {
  holdMs: 1500,
  turnDeg: 15,
  responseWindowMs: 2000,
  dwellMs: 1200,
  pointerSource: 'noseRay',
};

// Rangos admisibles en el Panel. Fuera de aquí no hay ejercicio defendible:
// un sostén de 200 ms no es un gesto motor y uno de 8 s no lo logra ningún niño.
export const AR_THRESHOLD_RANGES = {
  holdMs: { min: 800, max: 3000, step: 100 },
  turnDeg: { min: 10, max: 30, step: 1 },
  responseWindowMs: { min: 1000, max: 4000, step: 250 },
  dwellMs: { min: 600, max: 2500, step: 100 },
} as const;

const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));

/** Sanea lo leído de disco: una preferencia corrupta no puede tumbar el bloque. */
export function normalizeThresholds(raw: any): ArThresholds {
  const r = AR_THRESHOLD_RANGES;
  const src: ArPointerSource = raw?.pointerSource === 'iris' ? 'iris' : 'noseRay';
  return {
    holdMs: clamp(Math.round(raw?.holdMs ?? AR_DEFAULT_THRESHOLDS.holdMs), r.holdMs.min, r.holdMs.max),
    turnDeg: clamp(Math.round(raw?.turnDeg ?? AR_DEFAULT_THRESHOLDS.turnDeg), r.turnDeg.min, r.turnDeg.max),
    responseWindowMs: clamp(
      Math.round(raw?.responseWindowMs ?? AR_DEFAULT_THRESHOLDS.responseWindowMs),
      r.responseWindowMs.min, r.responseWindowMs.max,
    ),
    dwellMs: clamp(Math.round(raw?.dwellMs ?? AR_DEFAULT_THRESHOLDS.dwellMs), r.dwellMs.min, r.dwellMs.max),
    pointerSource: src,
  };
}

export async function loadArThresholds(): Promise<ArThresholds> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.arUmbrales);
    if (raw) return normalizeThresholds(JSON.parse(raw));
  } catch (e) { /* almacenamiento no disponible: se juega con los del protocolo */ }
  return { ...AR_DEFAULT_THRESHOLDS };
}

export async function saveArThresholds(t: ArThresholds): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.arUmbrales, JSON.stringify(normalizeThresholds(t)));
  } catch (e) { /* noop */ }
}

// ---- Consentimiento informado de cámara, POR PACIENTE ----------------------
// Mismo patrón que el Quiebre Pragmático del módulo TEA, pero sin atajo global:
// la cámara es el permiso más sensible de una app infantil y el encuadre se
// acepta para un niño concreto, no para el teléfono.

const consentKey = (patientKey: string): string => `${STORAGE_KEYS.arConsentimiento}_${patientKey}`;

export async function hasArConsent(patientKey: string): Promise<boolean> {
  if (!patientKey) return false;
  try {
    return (await AsyncStorage.getItem(consentKey(patientKey))) === 'ok';
  } catch (e) {
    return false;
  }
}

export async function grantArConsent(patientKey: string): Promise<void> {
  if (!patientKey) return;
  try { await AsyncStorage.setItem(consentKey(patientKey), 'ok'); } catch (e) { /* noop */ }
}

export async function revokeArConsent(patientKey: string): Promise<void> {
  if (!patientKey) return;
  try { await AsyncStorage.removeItem(consentKey(patientKey)); } catch (e) { /* noop */ }
}

// ---- DeviceProfile: cachear la Prueba de Aptitud ---------------------------
// La prueba dura 60-90 s: repetirla en cada entrada sería un peaje absurdo.
// Se cachea con la huella del aparato y se vuelve a correr solo si el teléfono
// o la versión del sistema cambian, que es exactamente cuando deja de valer.

interface CachedProfile { fingerprint: string; profile: ArDeviceProfile; }

const fingerprintOf = (p: ArDeviceProfile): string =>
  `${p.manufacturer}|${p.model}|${p.osVersion}`;

export async function loadArDeviceProfile(): Promise<ArDeviceProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.arPerfilDispositivo);
    if (!raw) return null;
    const cached = JSON.parse(raw) as CachedProfile;
    if (!cached?.profile?.level) return null;
    // Si la huella no cuadra con lo cacheado, el perfil es de otro teléfono.
    return cached.fingerprint === fingerprintOf(cached.profile) ? cached.profile : null;
  } catch (e) {
    return null;
  }
}

export async function saveArDeviceProfile(profile: ArDeviceProfile): Promise<void> {
  try {
    const payload: CachedProfile = { fingerprint: fingerprintOf(profile), profile };
    await AsyncStorage.setItem(STORAGE_KEYS.arPerfilDispositivo, JSON.stringify(payload));
  } catch (e) { /* noop */ }
}

// ---- Qué se ofrece con cada nivel de aptitud (§3.5) ------------------------
// Nunca hay una experiencia rota: un teléfono flojo no da un ejercicio a
// tirones, da un ejercicio distinto o ninguno.

export interface ArLevelPolicy {
  /** Ejercicios ofrecidos. Vacío = el bloque no se renderiza. */
  exercises: Array<'ar1' | 'ar2' | 'ar3'>;
  /** AR-2 en modo instrumento (registra latencia) o solo juego. */
  ar2Instrumented: boolean;
  /** Dianas de AR-3: el nivel A exige puntero < 2,5°, así que van 3. */
  ar3Targets: 2 | 3;
  /** Solo el nivel A entra en el dataset publicable (decisión 5). */
  publishable: boolean;
}

// La etiqueta visible de cada nivel y su explicación son COPY y viven en i18n
// (t.ar.levelLabel / t.ar.levelNote): esta tabla decide QUÉ se ofrece, no cómo
// se cuenta. Tenerlo en dos sitios ya hizo que el castellano y el inglés
// dijeran cosas distintas del mismo teléfono.
export const AR_LEVEL_POLICY: Record<'A' | 'B' | 'C' | 'D', ArLevelPolicy> = {
  A: {
    exercises: ['ar1', 'ar2', 'ar3'], ar2Instrumented: true, ar3Targets: 3, publishable: true,
  },
  B: {
    exercises: ['ar1', 'ar2', 'ar3'], ar2Instrumented: false, ar3Targets: 3, publishable: false,
  },
  C: {
    exercises: ['ar1', 'ar3'], ar2Instrumented: false, ar3Targets: 2, publishable: false,
  },
  D: {
    exercises: [], ar2Instrumented: false, ar3Targets: 2, publishable: false,
  },
};

export const arPolicyFor = (level: 'A' | 'B' | 'C' | 'D'): ArLevelPolicy => AR_LEVEL_POLICY[level];

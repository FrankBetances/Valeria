// ============================================================================
// Valeria+ · Pacientes, identidad estable (pid) y migración cifrada (P3.1-P3.2)
//
// · Cada paciente tiene un identificador aleatorio `pid` de 128 bits (32 hex)
//   creado una sola vez y guardado dentro de su ficha cifrada (v2: AEAD).
// · Las claves de seguimiento y de RA salen del `pid` (`valeria-follow:<pid>`
//   y `valeria-ar:<pid>`), NUNCA del NHC ni del nombre ni de `'anon'`.
// · Al leer una ficha antigua sin `pid` (o en JSON en claro / v1:), se le
//   asigna un `pid`, se cifra la ficha en `v2:` y se migran una sola vez sus
//   datos de seguimiento y consentimiento de RA desde la semilla anterior.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './valeriaTheme';
import {
  readEncryptedJSON,
  writeEncryptedJSON,
  decryptJSON,
  randomHex,
  sha256Hex,
  hkdfSha256,
  utf8ToBytes,
  bytesToB64Url,
} from './valeriaCrypto';

export interface PatientRecord {
  pid?: string;
  nombre?: string;
  fecha?: string;
  nhc?: string;
  genero?: string;
  tutor?: string;
  vinculo?: string;
  email?: string;
  tel?: string;
  patologia?: string;
  medico?: string;
  logopeda?: string;
  lingua?: string;
  seseo?: boolean;
  [k: string]: any;
}

const FOLLOW_KEY_BASES = [
  STORAGE_KEYS.pautaFrecuencia,
  STORAGE_KEYS.estimulacion,
  STORAGE_KEYS.notasSeguimiento,
  STORAGE_KEYS.compartirConsentimiento,
] as const;

export function followKeyPrefixForPid(pid: string): string {
  return sha256Hex(`valeria-follow:${pid}`).slice(0, 16);
}

export function arKeyForPid(pid: string): string {
  return sha256Hex(`valeria-ar:${pid}`).slice(0, 16);
}

/**
 * Hash opaco de 16 bytes derivado del `pid` con HKDF-SHA256 para vínculos QR
 * y códigos `VALERIA-NOTA2:` / `VALERIA-LEIDO2:` (P3.5).
 */
export function pidHashForLink(pid: string): string {
  const bytes = hkdfSha256(utf8ToBytes(pid), undefined, 'valeria-link-pid-v1', 16);
  return bytesToB64Url(bytes);
}

async function migrateLegacyPerPatientData(ficha: PatientRecord, newPid: string): Promise<void> {
  const legacySeed = String(ficha.nhc || ficha.nombre || '').trim();
  if (!legacySeed) return;

  const legacyFollowPrefix = sha256Hex(`valeria-follow:${legacySeed}`).slice(0, 16);
  const nextFollowPrefix = followKeyPrefixForPid(newPid);

  for (const base of FOLLOW_KEY_BASES) {
    const oldKey = `${base}_${legacyFollowPrefix}`;
    const newKey = `${base}_${nextFollowPrefix}`;
    try {
      const existingNew = await AsyncStorage.getItem(newKey);
      const rawOld = await AsyncStorage.getItem(oldKey);
      if (rawOld && !existingNew) {
        let val: unknown = await decryptJSON(rawOld);
        if (val === null && !rawOld.startsWith('v1:') && !rawOld.startsWith('v2:')) {
          try { val = JSON.parse(rawOld); } catch (e) { val = null; }
        }
        if (val !== null) {
          const ok = await writeEncryptedJSON(newKey, val);
          if (ok) await AsyncStorage.removeItem(oldKey);
        }
      }
    } catch (e) { /* noop */ }
  }

  // RA: migra el consentimiento de cámara por paciente si existía con NHC/nombre.
  const legacyArKey = `${STORAGE_KEYS.arConsentimiento}_${sha256Hex(`valeria-ar:${legacySeed}`).slice(0, 16)}`;
  const nextArKey = `${STORAGE_KEYS.arConsentimiento}_${arKeyForPid(newPid)}`;
  try {
    const oldAr = await AsyncStorage.getItem(legacyArKey);
    const hasNewAr = await AsyncStorage.getItem(nextArKey);
    if (oldAr && !hasNewAr) {
      await AsyncStorage.setItem(nextArKey, oldAr);
      await AsyncStorage.removeItem(legacyArKey);
    }
  } catch (e) { /* noop */ }
}

async function ensurePidOnPatient(ficha: PatientRecord): Promise<{ record: PatientRecord; changed: boolean }> {
  if (ficha.pid && typeof ficha.pid === 'string' && ficha.pid.length >= 16) {
    return { record: ficha, changed: false };
  }
  const pid = randomHex(16); // 128 bits aleatorios (CSPRNG)
  await migrateLegacyPerPatientData(ficha, pid);
  return { record: { ...ficha, pid }, changed: true };
}

/**
 * Lee el paciente activo (`STORAGE_KEYS.registro`). Migra JSON antiguo o `v1:`
 * a `v2:` y asigna `pid` si faltaba. Devuelve `null` si no hay paciente activo.
 */
export async function readActivePatient(): Promise<PatientRecord | null> {
  const rawObj = await readEncryptedJSON<PatientRecord>(STORAGE_KEYS.registro);
  if (!rawObj || typeof rawObj !== 'object') return null;
  const { record, changed } = await ensurePidOnPatient(rawObj);
  if (changed) {
    await writeEncryptedJSON(STORAGE_KEYS.registro, record);
    // Sincroniza el nuevo pid en la lista multi-paciente si ya figuraba allí.
    const list = await readEncryptedJSON<PatientRecord[]>(STORAGE_KEYS.pacientes);
    if (Array.isArray(list)) {
      let touched = false;
      const updated = list.map((p) => {
        if (!p.pid && ((p.nhc && record.nhc && p.nhc === record.nhc) || (p.nombre && p.nombre === record.nombre))) {
          touched = true;
          return { ...p, pid: record.pid };
        }
        return p;
      });
      if (touched) await writeEncryptedJSON(STORAGE_KEYS.pacientes, updated);
    }
  }
  return record;
}

/** Guarda el paciente activo cifrado en `v2:`, asignando `pid` si es nuevo. */
export async function saveActivePatient(ficha: PatientRecord): Promise<{ ok: boolean; record: PatientRecord }> {
  const record: PatientRecord = (ficha.pid && ficha.pid.length >= 16)
    ? ficha
    : { ...ficha, pid: randomHex(16) };
  const ok = await writeEncryptedJSON(STORAGE_KEYS.registro, record);
  return { ok, record };
}

/**
 * Lee la lista de pacientes (`STORAGE_KEYS.pacientes`) cifrada en `v2:`.
 * Migra una ficha única antigua y asigna `pid` a quien no lo tenga.
 */
export async function readPatientsList(): Promise<PatientRecord[]> {
  let list = await readEncryptedJSON<PatientRecord[]>(STORAGE_KEYS.pacientes);
  if (!Array.isArray(list)) list = [];

  let changed = false;
  if (list.length === 0) {
    const single = await readActivePatient();
    if (single && (single.nombre || single.nhc)) {
      list = [single];
      changed = true;
    }
  }

  const normalized: PatientRecord[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const res = await ensurePidOnPatient(item);
    if (res.changed) changed = true;
    normalized.push(res.record);
  }

  if (changed && normalized.length > 0) {
    await writeEncryptedJSON(STORAGE_KEYS.pacientes, normalized);
  }
  return normalized;
}

export async function savePatientsList(list: PatientRecord[]): Promise<boolean> {
  return writeEncryptedJSON(STORAGE_KEYS.pacientes, list);
}

/**
 * Lee el historial de sesiones (`STORAGE_KEYS.historial`), migrando JSON en claro
 * o `v1:` a `v2:`.
 */
export async function readSessionHistory<T = any>(): Promise<T[]> {
  const data = await readEncryptedJSON<T[]>(STORAGE_KEYS.historial);
  return Array.isArray(data) ? data : [];
}

export async function appendSessionHistory<T = any>(entry: T): Promise<boolean> {
  const hist = await readSessionHistory<T>();
  hist.push(entry);
  return writeEncryptedJSON(STORAGE_KEYS.historial, hist);
}

export async function readLingHistory<T = any>(): Promise<T[]> {
  const data = await readEncryptedJSON<T[]>(STORAGE_KEYS.ling);
  return Array.isArray(data) ? data : [];
}

export async function appendLingHistory<T = any>(entry: T): Promise<boolean> {
  const hist = await readLingHistory<T>();
  hist.push(entry);
  return writeEncryptedJSON(STORAGE_KEYS.ling, hist);
}

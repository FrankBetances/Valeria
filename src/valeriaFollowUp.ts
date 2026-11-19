// ============================================================================
// Valeria+ · Seguimiento entre consultas (19/11/2026)
//
// Cuatro piezas, todas en el aparato (sin servidor, decidido por Frank):
//   1. Pauta con FRECUENCIA por área (veces/semana) + registro de cada sesión
//      con fecha ISO → realizado frente a pautado, semana a semana.
//   2. Notas en dos sentidos (profesional → familia, familia → profesional).
//      Asíncronas. SIN triaje ni recomendaciones automáticas: aquí no se
//      interpreta ninguna nota, solo se guarda, se fecha y se firma.
//   3. Resumen compartible con otros centros, SOLO con consentimiento de la
//      familia, revocable y registrado. No incluye la ficha clínica.
//   4. Un PIN por profesional (hash SHA-256 con sal, nunca en claro). Cada
//      pauta y cada nota guarda quién la firmó.
//
// Datos de salud de un menor: notas, registro y consentimiento van cifrados en
// reposo (valeriaCrypto) y con sufijo POR PACIENTE (clave opaca, nunca nombre).
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './valeriaTheme';
import { sha256, MASTER_PIN_HASH } from './ValeriaProPin';
import { encryptJSON, decryptJSON } from './valeriaCrypto';
import { tNow } from './i18n/catalog';

export type FollowArea = 'audicion' | 'lenguaje' | 'tea' | 'dislexia' | 'pares' | 'expansion' | 'sensorial';
export const FOLLOW_AREAS: FollowArea[] = ['audicion', 'lenguaje', 'tea', 'dislexia', 'pares', 'expansion', 'sensorial'];

export type ProRole = 'logopeda' | 'orl' | 'atencion' | 'otro';
export interface Professional { id: string; name: string; role: ProRole; centre: string; salt: string; hash: string; createdAt: string }
/** Quién tiene el PIN echado ahora. `master` = PIN de administración del aparato. */
export interface ProSession { id: string; name: string; role: ProRole | 'admin'; centre: string }

export interface PlanEntry { perWeek: number; by: string; at: string }
export type FrequencyPlan = Partial<Record<FollowArea, PlanEntry>>;

export interface StimEvent { at: string; area: FollowArea }

export interface FollowNote {
  id: string; at: string; from: 'pro' | 'family'; author: string; role?: string; centre?: string;
  text: string; reviewedAt?: string; reviewedBy?: string; imported?: boolean;
}

export interface ShareConsent { granted: boolean; at: string; log: { granted: boolean; at: string }[] }

// ----------------------------------------------------------------------------
// Paciente activo → clave opaca (mismo criterio que la RA: nhc o nombre, hash).
// ----------------------------------------------------------------------------
export async function activePatientKey(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.registro);
    const f = raw ? JSON.parse(raw) : null;
    const seed = String(f?.nhc || f?.nombre || 'anon');
    return (await sha256(`valeria-follow:${seed}`)).slice(0, 16);
  } catch (e) { return 'anon'; }
}
const k = (base: string, p: string) => `${base}_${p}`;

async function readEnc<T>(key: string, fallback: T): Promise<T> {
  try { return (await decryptJSON<T>(await AsyncStorage.getItem(key))) ?? fallback; } catch (e) { return fallback; }
}
async function writeEnc(key: string, v: unknown) {
  try { await AsyncStorage.setItem(key, await encryptJSON(v)); } catch (e) { /* noop */ }
}

// ----------------------------------------------------------------------------
// 4 · Profesionales y PIN
// ----------------------------------------------------------------------------
let current: ProSession | null = null;
export const currentPro = (): ProSession | null => current;
export const clearCurrentPro = () => { current = null; };

export async function listPros(): Promise<Professional[]> {
  try { const r = await AsyncStorage.getItem(STORAGE_KEYS.profesionales); return r ? JSON.parse(r) : []; } catch (e) { return []; }
}
async function savePros(p: Professional[]) {
  try { await AsyncStorage.setItem(STORAGE_KEYS.profesionales, JSON.stringify(p)); } catch (e) { /* noop */ }
}
const rid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/**
 * Comprueba un PIN. Con profesionales dados de alta, el PIN de administración
 * deja de abrir la edición: cada uno entra con el suyo. Sin ninguno (aparato
 * recién instalado o demo), el de administración sigue funcionando para dar
 * de alta al primero.
 */
export async function verifyPin(pin: string): Promise<ProSession | null> {
  const pros = await listPros();
  for (const p of pros) {
    if ((await sha256(`${p.salt}:${pin}`)) === p.hash) {
      current = { id: p.id, name: p.name, role: p.role, centre: p.centre };
      return current;
    }
  }
  if (!pros.length && (await sha256(pin)) === MASTER_PIN_HASH) {
    current = { id: 'admin', name: tNow().followUp.adminName, role: 'admin', centre: '' };
    return current;
  }
  return null;
}

export type AddProError = 'pinFormat' | 'pinTaken' | 'name';
export async function addPro(d: { name: string; role: ProRole; centre: string; pin: string }): Promise<AddProError | null> {
  if (!d.name.trim()) return 'name';
  if (!/^\d{4}$/.test(d.pin)) return 'pinFormat';
  const pros = await listPros();
  // Dos profesionales con el mismo PIN harían imposible saber quién firma.
  for (const p of pros) if ((await sha256(`${p.salt}:${d.pin}`)) === p.hash) return 'pinTaken';
  if ((await sha256(d.pin)) === MASTER_PIN_HASH) return 'pinTaken';
  const salt = rid();
  pros.push({ id: rid(), name: d.name.trim(), role: d.role, centre: d.centre.trim(), salt, hash: await sha256(`${salt}:${d.pin}`), createdAt: new Date().toISOString() });
  await savePros(pros);
  return null;
}
export async function removePro(id: string) { await savePros((await listPros()).filter((p) => p.id !== id)); }

/**
 * Salida para un PIN olvidado: la familia borra los profesionales. No es
 * silencioso: queda una nota fechada que el profesional verá en la revisión.
 */
export async function resetPros(noteText: string) {
  await savePros([]);
  current = null;
  await addNote({ from: 'family', author: tNow().followUp.fromFamily, text: noteText });
}

// ----------------------------------------------------------------------------
// 1 · Pauta con frecuencia + registro de estimulación
// ----------------------------------------------------------------------------
export async function loadPlan(): Promise<FrequencyPlan> {
  return readEnc<FrequencyPlan>(k(STORAGE_KEYS.pautaFrecuencia, await activePatientKey()), {});
}
export async function savePlan(plan: Record<FollowArea, number>): Promise<boolean> {
  const who = current;
  if (!who) return false;
  const prev = await loadPlan();
  const at = new Date().toISOString();
  const next: FrequencyPlan = {};
  for (const a of FOLLOW_AREAS) {
    const n = Math.max(0, Math.min(14, Math.round(plan[a] ?? 0)));
    if (!n) continue;
    next[a] = prev[a]?.perWeek === n ? prev[a] : { perWeek: n, by: who.name, at };
  }
  await writeEnc(k(STORAGE_KEYS.pautaFrecuencia, await activePatientKey()), next);
  return true;
}

/** Cada pantalla que cierra una sesión llama aquí con su área. */
export async function logStimulation(area: FollowArea): Promise<void> {
  const key = k(STORAGE_KEYS.estimulacion, await activePatientKey());
  const ev = await readEnc<StimEvent[]>(key, []);
  ev.push({ at: new Date().toISOString(), area });
  // Un año de historia sobra para el resumen de 8 semanas y acota el tamaño.
  const cutoff = Date.now() - 366 * 864e5;
  await writeEnc(key, ev.filter((e) => Date.parse(e.at) >= cutoff));
}
export async function loadStimulation(): Promise<StimEvent[]> {
  return readEnc<StimEvent[]>(k(STORAGE_KEYS.estimulacion, await activePatientKey()), []);
}

export const mondayOf = (d: Date): Date => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
export interface WeekRow { start: Date; done: number; planned: number; byArea: Partial<Record<FollowArea, { done: number; planned: number }>> }

/**
 * Semana a semana (lunes a domingo), de la más antigua a la actual. Lo
 * realizado de un área cuenta como máximo lo pautado para el % global: hacer
 * diez sesiones de Audición no compensa no haber hecho Lenguaje.
 */
export function weeklySummary(events: StimEvent[], plan: FrequencyPlan, weeks = 8, now = new Date()): WeekRow[] {
  const thisMon = mondayOf(now);
  const rows: WeekRow[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const start = new Date(thisMon); start.setDate(start.getDate() - 7 * w);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    const byArea: WeekRow['byArea'] = {};
    let done = 0, planned = 0;
    for (const a of FOLLOW_AREAS) {
      const p = plan[a]?.perWeek ?? 0;
      const d = events.filter((e) => e.area === a && Date.parse(e.at) >= start.getTime() && Date.parse(e.at) < end.getTime()).length;
      if (!p && !d) continue;
      byArea[a] = { done: d, planned: p };
      planned += p; done += p ? Math.min(d, p) : 0;
    }
    rows.push({ start, done, planned, byArea });
  }
  return rows;
}

// ----------------------------------------------------------------------------
// 2 · Notas en dos sentidos
// ----------------------------------------------------------------------------
export async function loadNotes(): Promise<FollowNote[]> {
  return readEnc<FollowNote[]>(k(STORAGE_KEYS.notasSeguimiento, await activePatientKey()), []);
}
async function saveNotes(n: FollowNote[]) { await writeEnc(k(STORAGE_KEYS.notasSeguimiento, await activePatientKey()), n); }

export async function addNote(n: Omit<FollowNote, 'id' | 'at'> & { at?: string }) {
  const text = n.text.trim().slice(0, 2000);
  if (!text) return;
  const all = await loadNotes();
  all.push({ ...n, text, id: rid(), at: n.at ?? new Date().toISOString() });
  await saveNotes(all);
}
/** El profesional marca como leídas en la revisión las notas de la familia. */
export async function markFamilyNotesReviewed() {
  const who = current; if (!who) return;
  const at = new Date().toISOString();
  await saveNotes((await loadNotes()).map((n) => (n.from === 'family' && !n.reviewedAt ? { ...n, reviewedAt: at, reviewedBy: who.name } : n)));
}

// Indicaciones escritas fuera de la consulta: el profesional las redacta en su
// propio aparato y manda un código; la familia lo pega. Sin servidor.
const NOTE_PREFIX = 'VALERIA-NOTA1:';
const b64e = (s: string) => btoa(unescape(encodeURIComponent(s)));
const b64d = (s: string) => decodeURIComponent(escape(atob(s)));
export function encodeNoteCode(text: string): string | null {
  const who = current; if (!who || !text.trim()) return null;
  return NOTE_PREFIX + b64e(JSON.stringify({ a: who.name, r: who.role, c: who.centre, t: text.trim().slice(0, 2000), at: new Date().toISOString() }));
}
export async function importNoteCode(code: string): Promise<boolean> {
  try {
    const i = code.indexOf(NOTE_PREFIX);
    if (i < 0) return false;
    const o = JSON.parse(b64d(code.slice(i + NOTE_PREFIX.length).trim().split(/\s/)[0]));
    if (typeof o?.t !== 'string' || typeof o?.a !== 'string') return false;
    const all = await loadNotes();
    if (all.some((n) => n.imported && n.at === o.at && n.text === o.t)) return true; // ya importada
    await addNote({ from: 'pro', author: String(o.a).slice(0, 80), role: String(o.r ?? ''), centre: String(o.c ?? '').slice(0, 80), text: o.t, at: typeof o.at === 'string' ? o.at : undefined, imported: true });
    return true;
  } catch (e) { return false; }
}

// ----------------------------------------------------------------------------
// 3 · Consentimiento para compartir con otros centros
// ----------------------------------------------------------------------------
export async function loadConsent(): Promise<ShareConsent> {
  return readEnc<ShareConsent>(k(STORAGE_KEYS.compartirConsentimiento, await activePatientKey()), { granted: false, at: '', log: [] });
}
export async function setConsent(granted: boolean): Promise<ShareConsent> {
  const c = await loadConsent();
  const at = new Date().toISOString();
  const next = { granted, at, log: [...c.log, { granted, at }].slice(-50) };
  await writeEnc(k(STORAGE_KEYS.compartirConsentimiento, await activePatientKey()), next);
  return next;
}

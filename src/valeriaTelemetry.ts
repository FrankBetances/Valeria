// ============================================================================
// Valeria+ · Telemetría de usabilidad del piloto clínico — V1.0
// Recoge, SIN bloquear el hilo principal, tres métricas por sesión:
//   1) tiempo ACTIVO por pantalla,
//   2) misclicks (toques fuera de zonas interactivas),
//   3) tasa de abandono intra-cápsula TPR (saltar la cápsula en vez de completarla).
// Correlaciona telemetría + evaluación SUS (Likert) bajo un MISMO id de sesión.
//
// No bloqueo (restricción innegociable): la captura solo muta memoria (O(1)) y
// programa un volcado con debounce vía InteractionManager.runAfterInteractions,
// de modo que el cifrado + escritura en disco (AsyncStorage, hilo nativo) nunca
// coinciden con animaciones/audio. El log se cifra en reposo (valeriaCrypto) y
// se PURGA solo tras una exportación exitosa (evita el desborde semana a semana).
// ============================================================================
import { InteractionManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptJSON, decryptJSON } from './valeriaCrypto';

export type BlockId = 'audicion' | 'lenguaje' | 'pares' | 'expansion';
export const ALL_BLOCKS: BlockId[] = ['audicion', 'lenguaje', 'pares', 'expansion'];

const STORE_KEY = '@valeria_tlm_log'; // blob cifrado del log de telemetría
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionRecord {
  id: string;
  startedAt: number;
  updatedAt: number;
  screens: Record<string, number>;   // ms activos por pantalla
  misclicks: number;
  capsules: { started: number; done: number; skipped: number };
  blocks: BlockId[];                  // bloques completados en la sesión
  likert?: { score: number; question: string; at: number };
}
interface TlmStore { sessions: SessionRecord[]; lastSusAt: number; }

// ---- Estado en memoria (sesión actual) ----
const newId = (): string =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

let cur: SessionRecord = freshSession();
let currentScreen: string | null = null;
let screenSince = 0;
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function freshSession(): SessionRecord {
  return {
    id: newId(), startedAt: Date.now(), updatedAt: Date.now(),
    screens: {}, misclicks: 0, capsules: { started: 0, done: 0, skipped: 0 }, blocks: [],
  };
}

export const getSessionId = (): string => cur.id;

// ---- Volcado no bloqueante (debounce + fuera de interacciones) ----
function scheduleFlush(): void {
  cur.updatedAt = Date.now();
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    InteractionManager.runAfterInteractions(() => { void flushNow(); });
  }, 1500);
}

async function flushNow(): Promise<void> {
  try {
    const store = (await decryptJSON<TlmStore>(await AsyncStorage.getItem(STORE_KEY)))
      ?? { sessions: [], lastSusAt: 0 };
    const i = store.sessions.findIndex((s) => s.id === cur.id);
    // Copia con el tramo de pantalla en curso ya contabilizado.
    const snapshot: SessionRecord = { ...cur, screens: { ...cur.screens } };
    if (i >= 0) store.sessions[i] = snapshot; else store.sessions.push(snapshot);
    await AsyncStorage.setItem(STORE_KEY, await encryptJSON(store));
  } catch (e) { /* almacenamiento no disponible: la próxima captura reintenta */ }
}

// ---- 1) Tiempo activo por pantalla ----
// Llamar en cada cambio de ruta: cierra el tramo anterior y abre el nuevo.
export function noteScreen(name: string): void {
  const now = Date.now();
  if (currentScreen && screenSince) {
    cur.screens[currentScreen] = (cur.screens[currentScreen] ?? 0) + (now - screenSince);
  }
  currentScreen = name;
  screenSince = now;
  scheduleFlush();
}

// ---- 2) Misclicks ----
export function trackMisclick(): void {
  cur.misclicks += 1;
  scheduleFlush();
}

// ---- 3) Abandono intra-cápsula TPR ----
export function trackCapsuleStart(): void { cur.capsules.started += 1; scheduleFlush(); }
export function trackCapsuleDone(): void { cur.capsules.done += 1; scheduleFlush(); }
export function trackCapsuleSkip(): void { cur.capsules.skipped += 1; scheduleFlush(); }

// ---- Hitos: bloques completados → posible disparo del SUS ----
export function markBlockCompleted(block: BlockId): void {
  if (!cur.blocks.includes(block)) cur.blocks.push(block);
  scheduleFlush();
  if (ALL_BLOCKS.every((b) => cur.blocks.includes(b))) void maybeRequestSus();
}

// ---- SUS: rate limiting (hito de 4 bloques Y como mucho 1 vez/semana) ----
type SusListener = () => void;
const susListeners: SusListener[] = [];
export function onSusRequest(cb: SusListener): () => void {
  susListeners.push(cb);
  return () => { const i = susListeners.indexOf(cb); if (i >= 0) susListeners.splice(i, 1); };
}

async function maybeRequestSus(): Promise<void> {
  try {
    const store = (await decryptJSON<TlmStore>(await AsyncStorage.getItem(STORE_KEY)))
      ?? { sessions: [], lastSusAt: 0 };
    if (Date.now() - (store.lastSusAt ?? 0) < WEEK_MS) return; // cap semanal por dispositivo
    susListeners.forEach((cb) => { try { cb(); } catch (e) { /* noop */ } });
  } catch (e) { /* noop */ }
}

// Registra la respuesta Likert en la sesión ACTUAL y marca la marca temporal
// del cap semanal. Vincula SUS ↔ telemetría por el mismo id de sesión.
export async function attachLikert(score: number, question: string): Promise<void> {
  cur.likert = { score, question, at: Date.now() };
  try {
    const store = (await decryptJSON<TlmStore>(await AsyncStorage.getItem(STORE_KEY)))
      ?? { sessions: [], lastSusAt: 0 };
    store.lastSusAt = Date.now();
    const i = store.sessions.findIndex((s) => s.id === cur.id);
    const snapshot: SessionRecord = { ...cur, screens: { ...cur.screens } };
    if (i >= 0) store.sessions[i] = snapshot; else store.sessions.push(snapshot);
    await AsyncStorage.setItem(STORE_KEY, await encryptJSON(store));
  } catch (e) { /* noop */ }
}

// ---- Exportación: resumen (QR) + log crudo completo (ShareSheet) ----
export interface ExportBundle {
  summary: {
    v: string; sessions: number; abandonRate: number; misclicks: number;
    likertMean: number | null; likertN: number; fullBlockRuns: number; generatedAt: number;
  };
  qrPayload: string;   // resumen estadístico compacto para el QR (offline puro)
  fullLog: string;     // log transaccional completo en crudo (ShareSheet)
}

// Fuerza el tramo de pantalla en curso dentro de la sesión antes de exportar.
function sealCurrentScreen(): void {
  const now = Date.now();
  if (currentScreen && screenSince) {
    cur.screens[currentScreen] = (cur.screens[currentScreen] ?? 0) + (now - screenSince);
    screenSince = now;
  }
}

export async function buildExport(): Promise<ExportBundle> {
  sealCurrentScreen();
  await flushNow();
  const store = (await decryptJSON<TlmStore>(await AsyncStorage.getItem(STORE_KEY)))
    ?? { sessions: [], lastSusAt: 0 };
  const sessions = store.sessions;
  let started = 0, skipped = 0, misclicks = 0, likertSum = 0, likertN = 0, fullRuns = 0;
  for (const s of sessions) {
    started += s.capsules?.started ?? 0;
    skipped += s.capsules?.skipped ?? 0;
    misclicks += s.misclicks ?? 0;
    if (s.likert) { likertSum += s.likert.score; likertN += 1; }
    if (ALL_BLOCKS.every((b) => (s.blocks ?? []).includes(b))) fullRuns += 1;
  }
  const abandonRate = started ? +(skipped / started).toFixed(3) : 0;
  const likertMean = likertN ? +(likertSum / likertN).toFixed(2) : null;
  const summary = {
    v: 'vlr1', sessions: sessions.length, abandonRate, misclicks,
    likertMean, likertN, fullBlockRuns: fullRuns, generatedAt: Date.now(),
  };
  // Payload del QR: MUY compacto (claves cortas) para que quepa holgado y sea
  // legible por cámaras móviles. Solo el resumen estadístico, sin datos crudos.
  const qrPayload = JSON.stringify({
    v: 'vlr1', n: sessions.length, ab: abandonRate, mc: misclicks,
    lk: likertMean, lkn: likertN, b4: fullRuns,
  });
  const fullLog = JSON.stringify({ summary, sessions }, null, 0);
  return { summary, qrPayload, fullLog };
}

// Purga: se llama SOLO tras una exportación exitosa. Vacía las sesiones (evita el
// desborde de memoria) y arranca una sesión nueva; conserva el cap semanal del SUS.
export async function purgeAfterExport(): Promise<void> {
  try {
    const store = (await decryptJSON<TlmStore>(await AsyncStorage.getItem(STORE_KEY)))
      ?? { sessions: [], lastSusAt: 0 };
    await AsyncStorage.setItem(STORE_KEY, await encryptJSON({ sessions: [], lastSusAt: store.lastSusAt }));
  } catch (e) { /* noop */ }
  cur = freshSession();
  currentScreen = null; screenSince = 0;
}

// ============================================================================
// Valeria+ · Telemetría de usabilidad del piloto clínico — V2.0
// Recoge, SIN bloquear el hilo principal, las métricas por sesión del piloto
// de "caos comunicativo":
//   1) tiempo ACTIVO por pantalla,
//   2) misclicks SEGMENTADOS: fatiga de interfaz (ui) vs carga cognitiva
//      inducida (dualTask) — un mismo toque muerto significa cosas clínicas
//      distintas según haya o no distractor activo,
//   3) tasa de abandono intra-cápsula TPR y validación de Rutas de Rutina,
//   4) eventos de los módulos de alta carga: nivel MANUAL del slider de ruido
//      babble, estrategia de reparación tras un quiebre pragmático y ventanas
//      de doble tarea (distractor visual activo).
// Correlaciona telemetría + evaluación SUS (Likert) bajo un MISMO id de sesión
// y sella en el Likert el CONTEXTO de alta carga inmediatamente anterior, para
// aislar la fatiga de usabilidad de la fatiga terapéutica real.
//
// Muro regulatorio (MDR): este módulo REGISTRA lo que el adulto decidió; jamás
// calcula ni sugiere niveles de dificultad. El nivel de ruido llega aquí solo
// como eco del gesto manual del cuidador.
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

export type BlockId = 'audicion' | 'lenguaje' | 'pares' | 'expansion' | 'tea' | 'dislexia';
export const ALL_BLOCKS: BlockId[] = ['audicion', 'lenguaje', 'pares', 'expansion', 'tea', 'dislexia'];

// Umbral de disparo del SUS: N bloques DISTINTOS completados en la sesión.
// Desacoplado del total de ALL_BLOCKS a propósito: cuando la familia de bloques
// creció de 4 a 6 (TEA, Dislexia), exigir "todos" habría hecho que los pilotos
// en curso no volvieran a alcanzar el hito jamás (regresión silenciosa del SUS).
// Con el umbral, el hito histórico de 4 bloques sigue disparando exactamente
// igual y los módulos nuevos ni lo bloquean ni lo fuerzan.
export const SUS_BLOCK_THRESHOLD = 4;

// Estrategias de reparación comunicativa observables tras un quiebre pragmático
// (orden absurda o murmullo del adulto). Enum cerrado: viaja tal cual en el
// payload de exportación (pragmatic_repair_strategy).
export type RepairStrategy =
  | 'peticion_repeticion'   // "¿qué?", "otra vez" — reparación verbal activa
  | 'reformulacion'         // reformula o corrige la orden absurda
  | 'gesto'                 // señala, encoge hombros, busca la mirada
  | 'aislamiento'           // se retira de la interacción
  | 'llanto'                // desborde emocional
  | 'sin_respuesta';        // no registra el quiebre

const STORE_KEY = '@valeria_tlm_log'; // blob cifrado del log de telemetría
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_EVENTS = 300; // tope defensivo por sesión: los arrays no crecen sin fin

// ---- Interfaz del estado global de telemetría (V2) ----
export interface MisclickSplit {
  ui: number;        // toque muerto SIN carga inducida → fatiga de interfaz
  dualTask: number;  // toque muerto CON distractor activo → carga cognitiva
}
export interface NoiseEvent { at: number; level: number; }  // nivel MANUAL 0-10
export interface RepairEvent { at: number; strategy: RepairStrategy; }
export interface DualTaskWindow { from: number; to: number | null; }
// Rutas de Rutina (TPR 2.0): validación binaria del adulto, orden a orden.
export interface RouteStats { started: number; validated: number; failed: number; skipped: number; }

// Contexto de alta carga sellado junto al Likert: timestamps y deltas que
// correlacionan el submit con el uso previo de Ruido / Quiebre Pragmático.
export interface HighLoadContext {
  noise_level_slider: number;                    // último nivel manual (0 = nunca)
  noise_last_used_at: number | null;
  ms_since_noise: number | null;
  pragmatic_repair_strategy: RepairStrategy | null; // última estrategia registrada
  pragmatic_last_used_at: number | null;
  ms_since_pragmatic: number | null;
  dual_task_active: boolean;                     // distractor visible al responder
}

export interface SessionRecord {
  id: string;
  v: 2;
  startedAt: number;
  updatedAt: number;
  screens: Record<string, number>;   // ms activos por pantalla
  misclicks: MisclickSplit;
  capsules: { started: number; done: number; skipped: number };
  routes: RouteStats;
  blocks: BlockId[];                  // bloques completados en la sesión
  noiseEvents: NoiseEvent[];
  repairEvents: RepairEvent[];
  dualTaskWindows: DualTaskWindow[];
  likert?: { score: number; question: string; at: number; context: HighLoadContext };
}
interface TlmStore { sessions: SessionRecord[]; lastSusAt: number; }

// ---- Estado en memoria (sesión actual) ----
const newId = (): string =>
  `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

let cur: SessionRecord = freshSession();
let currentScreen: string | null = null;
let screenSince = 0;
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let dualTaskOn = false; // flag vivo: hay distractor visual en pantalla AHORA

function freshSession(): SessionRecord {
  return {
    id: newId(), v: 2, startedAt: Date.now(), updatedAt: Date.now(),
    screens: {}, misclicks: { ui: 0, dualTask: 0 },
    capsules: { started: 0, done: 0, skipped: 0 },
    routes: { started: 0, validated: 0, failed: 0, skipped: 0 },
    blocks: [], noiseEvents: [], repairEvents: [], dualTaskWindows: [],
  };
}

export const getSessionId = (): string => cur.id;

// Migración tolerante: sesiones V1 persistidas (misclicks numérico, sin nodos
// de caos) se normalizan al leer para que export y agregados nunca rompan.
function normalizeSession(s: any): SessionRecord {
  const mc = s?.misclicks;
  return {
    id: s?.id ?? newId(), v: 2,
    startedAt: s?.startedAt ?? 0, updatedAt: s?.updatedAt ?? 0,
    screens: s?.screens ?? {},
    misclicks: typeof mc === 'number'
      ? { ui: mc, dualTask: 0 }
      : { ui: mc?.ui ?? 0, dualTask: mc?.dualTask ?? 0 },
    capsules: s?.capsules ?? { started: 0, done: 0, skipped: 0 },
    routes: s?.routes ?? { started: 0, validated: 0, failed: 0, skipped: 0 },
    blocks: s?.blocks ?? [],
    noiseEvents: s?.noiseEvents ?? [],
    repairEvents: s?.repairEvents ?? [],
    dualTaskWindows: s?.dualTaskWindows ?? [],
    ...(s?.likert ? { likert: s.likert } : {}),
  };
}

async function loadStore(): Promise<TlmStore> {
  const raw = await decryptJSON<TlmStore>(await AsyncStorage.getItem(STORE_KEY));
  if (!raw) return { sessions: [], lastSusAt: 0 };
  return { sessions: (raw.sessions ?? []).map(normalizeSession), lastSusAt: raw.lastSusAt ?? 0 };
}

// ---- Volcado no bloqueante (debounce + fuera de interacciones) ----
function scheduleFlush(): void {
  cur.updatedAt = Date.now();
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    InteractionManager.runAfterInteractions(() => { void flushNow(); });
  }, 1500);
}

function snapshotCur(): SessionRecord {
  return {
    ...cur,
    screens: { ...cur.screens },
    misclicks: { ...cur.misclicks },
    capsules: { ...cur.capsules },
    routes: { ...cur.routes },
    noiseEvents: [...cur.noiseEvents],
    repairEvents: [...cur.repairEvents],
    dualTaskWindows: cur.dualTaskWindows.map((w) => ({ ...w })),
  };
}

async function flushNow(): Promise<void> {
  try {
    const store = await loadStore();
    const i = store.sessions.findIndex((s) => s.id === cur.id);
    const snapshot = snapshotCur();
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

// ---- 2) Misclicks segmentados por origen del error ----
// El boundary ya descartó los toques sobre la zona del distractor (no son
// error de nadie); aquí solo se decide el cubo: interfaz vs carga inducida.
export function trackMisclick(): void {
  if (dualTaskOn) cur.misclicks.dualTask += 1;
  else cur.misclicks.ui += 1;
  scheduleFlush();
}

// ---- 3) Abandono intra-cápsula TPR ----
export function trackCapsuleStart(): void { cur.capsules.started += 1; scheduleFlush(); }
export function trackCapsuleDone(): void { cur.capsules.done += 1; scheduleFlush(); }
export function trackCapsuleSkip(): void { cur.capsules.skipped += 1; scheduleFlush(); }

// ---- 4) Rutas de Rutina (TPR 2.0): panel de validación binaria del adulto ----
export function trackRouteStart(): void { cur.routes.started += 1; scheduleFlush(); }
export function trackRouteValidated(): void { cur.routes.validated += 1; scheduleFlush(); }
export function trackRouteFailed(): void { cur.routes.failed += 1; scheduleFlush(); }
export function trackRouteSkip(): void { cur.routes.skipped += 1; scheduleFlush(); }

// ---- 5) Ruido babble: eco del gesto MANUAL del adulto ----
// Se registra solo al SOLTAR el slider (el componente debouncea el arrastre):
// un evento por decisión del cuidador, nunca una tormenta por frame.
export function trackNoiseLevel(level: number): void {
  const lvl = Math.max(0, Math.min(10, Math.round(level)));
  if (cur.noiseEvents.length < MAX_EVENTS) cur.noiseEvents.push({ at: Date.now(), level: lvl });
  scheduleFlush();
}

// ---- 6) Quiebre pragmático: estrategia de reparación observada ----
export function trackRepairStrategy(strategy: RepairStrategy): void {
  if (cur.repairEvents.length < MAX_EVENTS) cur.repairEvents.push({ at: Date.now(), strategy });
  scheduleFlush();
}

// ---- 7) Ventanas de doble tarea (distractor visual activo) ----
export function setDualTaskActive(on: boolean): void {
  if (on === dualTaskOn) return;
  dualTaskOn = on;
  if (on) {
    if (cur.dualTaskWindows.length < MAX_EVENTS) cur.dualTaskWindows.push({ from: Date.now(), to: null });
  } else {
    const w = cur.dualTaskWindows[cur.dualTaskWindows.length - 1];
    if (w && w.to === null) w.to = Date.now();
  }
  scheduleFlush();
}
export const isDualTaskActive = (): boolean => dualTaskOn;

// ---- Hitos: bloques completados → posible disparo del SUS ----
export function markBlockCompleted(block: BlockId): void {
  if (!cur.blocks.includes(block)) cur.blocks.push(block);
  scheduleFlush();
  if (cur.blocks.length >= SUS_BLOCK_THRESHOLD) void maybeRequestSus();
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
    const store = await loadStore();
    if (Date.now() - (store.lastSusAt ?? 0) < WEEK_MS) return; // cap semanal por dispositivo
    susListeners.forEach((cb) => { try { cb(); } catch (e) { /* noop */ } });
  } catch (e) { /* noop */ }
}

// Contexto de alta carga en el instante del Likert: qué módulo exigente se usó
// justo antes y hace cuánto. Es la calibración transaccional del SUS: permite
// separar "la app cuesta de usar" de "el ejercicio era duro a propósito".
function highLoadContextNow(): HighLoadContext {
  const now = Date.now();
  const lastNoise = cur.noiseEvents[cur.noiseEvents.length - 1] ?? null;
  const lastRepair = cur.repairEvents[cur.repairEvents.length - 1] ?? null;
  return {
    noise_level_slider: lastNoise?.level ?? 0,
    noise_last_used_at: lastNoise?.at ?? null,
    ms_since_noise: lastNoise ? now - lastNoise.at : null,
    pragmatic_repair_strategy: lastRepair?.strategy ?? null,
    pragmatic_last_used_at: lastRepair?.at ?? null,
    ms_since_pragmatic: lastRepair ? now - lastRepair.at : null,
    dual_task_active: dualTaskOn,
  };
}

// Registra la respuesta Likert en la sesión ACTUAL (con su contexto de alta
// carga) y marca la marca temporal del cap semanal. La escritura cifrada se
// pospone a runAfterInteractions: el padre acaba de tocar el modal y la
// animación de cierre no debe convivir con el cifrado + disco.
export async function attachLikert(score: number, question: string): Promise<void> {
  cur.likert = { score, question, at: Date.now(), context: highLoadContextNow() };
  InteractionManager.runAfterInteractions(() => {
    void (async () => {
      try {
        const store = await loadStore();
        store.lastSusAt = Date.now();
        const i = store.sessions.findIndex((s) => s.id === cur.id);
        const snapshot = snapshotCur();
        if (i >= 0) store.sessions[i] = snapshot; else store.sessions.push(snapshot);
        await AsyncStorage.setItem(STORE_KEY, await encryptJSON(store));
      } catch (e) { /* noop */ }
    })();
  });
}

// ---- Exportación: resumen (QR) + log crudo completo (ShareSheet) ----
export interface ExportBundle {
  summary: {
    v: string; sessions: number; abandonRate: number;
    misclicks: number; misclicksDualTask: number;
    likertMean: number | null; likertN: number; fullBlockRuns: number;
    noiseSessions: number; repairEvents: number; routeValidationRate: number | null;
    generatedAt: number;
  };
  qrPayload: string;   // resumen estadístico compacto para el QR (offline puro)
  fullLog: string;     // log transaccional completo en crudo (ShareSheet)
}

// Nodo por sesión del log crudo: la sesión completa + las claves planas que
// exige el esquema del piloto (noise_level_slider, pragmatic_repair_strategy,
// dual_task_active), derivadas de los arrays de eventos.
function exportSession(s: SessionRecord) {
  const lastNoise = s.noiseEvents[s.noiseEvents.length - 1] ?? null;
  const lastRepair = s.repairEvents[s.repairEvents.length - 1] ?? null;
  return {
    ...s,
    noise_level_slider: lastNoise?.level ?? 0,
    pragmatic_repair_strategy: lastRepair?.strategy ?? null,
    dual_task_active: s.dualTaskWindows.length > 0,
  };
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
  const store = await loadStore();
  const sessions = store.sessions;
  let started = 0, skipped = 0, mcUi = 0, mcDual = 0, likertSum = 0, likertN = 0, fullRuns = 0;
  let noiseSessions = 0, repairs = 0, routeStarted = 0, routeValidated = 0;
  for (const s of sessions) {
    started += s.capsules.started;
    skipped += s.capsules.skipped;
    mcUi += s.misclicks.ui;
    mcDual += s.misclicks.dualTask;
    if (s.likert) { likertSum += s.likert.score; likertN += 1; }
    // Mismo umbral que el disparo del SUS: una "vuelta completa" son ≥4 bloques
    // distintos (el hito histórico del piloto), no la familia entera de 6.
    if (s.blocks.length >= SUS_BLOCK_THRESHOLD) fullRuns += 1;
    if (s.noiseEvents.some((e) => e.level > 0)) noiseSessions += 1;
    repairs += s.repairEvents.length;
    routeStarted += s.routes.validated + s.routes.failed; // órdenes juzgadas por el adulto
    routeValidated += s.routes.validated;
  }
  const abandonRate = started ? +(skipped / started).toFixed(3) : 0;
  const likertMean = likertN ? +(likertSum / likertN).toFixed(2) : null;
  const routeValidationRate = routeStarted ? +(routeValidated / routeStarted).toFixed(3) : null;
  const summary = {
    v: 'vlr2', sessions: sessions.length, abandonRate,
    misclicks: mcUi + mcDual, misclicksDualTask: mcDual,
    likertMean, likertN, fullBlockRuns: fullRuns,
    noiseSessions, repairEvents: repairs, routeValidationRate,
    generatedAt: Date.now(),
  };
  // Payload del QR: MUY compacto (claves cortas) para que quepa holgado y sea
  // legible por cámaras móviles. Solo el resumen estadístico, sin datos crudos.
  const qrPayload = JSON.stringify({
    v: 'vlr2', n: sessions.length, ab: abandonRate,
    mc: mcUi + mcDual, mcd: mcDual,
    lk: likertMean, lkn: likertN, b4: fullRuns,
    nz: noiseSessions, rp: repairs,
  });
  const fullLog = JSON.stringify({ summary, sessions: sessions.map(exportSession) }, null, 0);
  return { summary, qrPayload, fullLog };
}

// Purga: se llama SOLO tras una exportación exitosa. Vacía las sesiones (evita el
// desborde de memoria) y arranca una sesión nueva; conserva el cap semanal del SUS.
export async function purgeAfterExport(): Promise<void> {
  try {
    const store = await loadStore();
    await AsyncStorage.setItem(STORE_KEY, await encryptJSON({ sessions: [], lastSusAt: store.lastSusAt }));
  } catch (e) { /* noop */ }
  cur = freshSession();
  currentScreen = null; screenSince = 0;
}

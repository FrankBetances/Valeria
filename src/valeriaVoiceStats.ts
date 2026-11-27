// ============================================================================
// Valeria+ · Contador local de voz (pregrabada vs voz del sistema)
// Registra por variedad cuántas locuciones salen del audio neuronal empaquetado
// y cuántas caen a expo-speech, con el motivo (sin asset, error al reproducir,
// variedad sin banco). Solo contadores numéricos; ningún texto se guarda ni
// sale del aparato. Persistido cifrado en AsyncStorage con valeriaCrypto.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './valeriaTheme';
import { encryptJSON, decryptJSON } from './valeriaCrypto';
import type { Locale } from './valeriaLocale';

export type VoiceFallbackReason = 'noAsset' | 'playbackError' | 'noBank';

export interface LocaleVoiceCounters {
  packaged: number;
  noAsset: number;
  playbackError: number;
  noBank: number;
}

interface StoredVoiceStats {
  weekStart: string;
  byLocale: Partial<Record<Locale, LocaleVoiceCounters>>;
}

function currentWeekStart(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = (d.getDay() + 6) % 7; // lunes = 0
  d.setDate(d.getDate() - day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const emptyCounters = (): LocaleVoiceCounters => ({
  packaged: 0,
  noAsset: 0,
  playbackError: 0,
  noBank: 0,
});

let state: StoredVoiceStats = { weekStart: currentWeekStart(), byLocale: {} };
let loaded = false;
let loadPromise: Promise<void> | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const cb of [...listeners]) {
    try { cb(); } catch (e) { /* noop */ }
  }
}

function ensureCurrentWeek() {
  const week = currentWeekStart();
  if (state.weekStart !== week) {
    state = { weekStart: week, byLocale: {} };
  }
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    void encryptJSON(state)
      .then((blob) => AsyncStorage.setItem(STORAGE_KEYS.vozContador, blob))
      .catch(() => { /* noop */ });
  }, 400);
}

export function loadVoiceStats(): Promise<void> {
  if (loaded) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.vozContador);
      const parsed = await decryptJSON<StoredVoiceStats>(raw, STORAGE_KEYS.vozContador);
      const week = currentWeekStart();
      if (parsed && parsed.weekStart === week && parsed.byLocale && typeof parsed.byLocale === 'object') {
        const merged: Partial<Record<Locale, LocaleVoiceCounters>> = {};
        for (const [k, v] of Object.entries(parsed.byLocale)) {
          const loc = k as Locale;
          const mem = state.byLocale[loc] ?? emptyCounters();
          merged[loc] = {
            packaged: mem.packaged + (Number(v?.packaged) || 0),
            noAsset: mem.noAsset + (Number(v?.noAsset) || 0),
            playbackError: mem.playbackError + (Number(v?.playbackError) || 0),
            noBank: mem.noBank + (Number(v?.noBank) || 0),
          };
        }
        for (const [k, v] of Object.entries(state.byLocale)) {
          const loc = k as Locale;
          if (!merged[loc] && v) merged[loc] = v;
        }
        state = { weekStart: week, byLocale: merged };
      }
    } catch (e) { /* noop */ }
    loaded = true;
    notify();
  })();
  return loadPromise;
}

export function recordVoicePackaged(loc: Locale): void {
  ensureCurrentWeek();
  const c = state.byLocale[loc] ?? emptyCounters();
  c.packaged += 1;
  state.byLocale[loc] = c;
  notify();
  scheduleSave();
}

export function recordVoiceFallback(loc: Locale, reason: VoiceFallbackReason): void {
  ensureCurrentWeek();
  const c = state.byLocale[loc] ?? emptyCounters();
  c[reason] += 1;
  state.byLocale[loc] = c;
  notify();
  scheduleSave();
}

export interface VoiceWeekSummary {
  packaged: number;
  fallback: number;
  total: number;
  packagedPct: number;
  systemPct: number;
  reasons: { noAsset: number; playbackError: number; noBank: number };
}

export function getVoiceWeekStats(loc?: Locale): VoiceWeekSummary {
  ensureCurrentWeek();
  const c = emptyCounters();
  const entries = loc
    ? (state.byLocale[loc] ? [state.byLocale[loc]!] : [])
    : Object.values(state.byLocale).filter((x): x is LocaleVoiceCounters => !!x);
  for (const item of entries) {
    c.packaged += item.packaged;
    c.noAsset += item.noAsset;
    c.playbackError += item.playbackError;
    c.noBank += item.noBank;
  }
  const fallback = c.noAsset + c.playbackError + c.noBank;
  const total = c.packaged + fallback;
  const packagedPct = total > 0 ? Math.round((c.packaged / total) * 100) : 0;
  const systemPct = total > 0 ? 100 - packagedPct : 0;
  return {
    packaged: c.packaged,
    fallback,
    total,
    packagedPct,
    systemPct,
    reasons: { noAsset: c.noAsset, playbackError: c.playbackError, noBank: c.noBank },
  };
}

export function subscribeVoiceStats(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

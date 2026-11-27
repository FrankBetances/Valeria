// ============================================================================
// Valeria+ · Modelos locales con la voz del cuidador (P6.5)
// Graba con `expo-audio` muestras de palabra del adulto, las cifra con la
// clave maestra de P3.1 (XChaCha20-Poly1305) en reposo, descifra a un temporal
// solo durante la reproducción y lo borra al terminar o detenerse.
// Todo exige consentimiento explícito y revocable (al revocar, borra todo).
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  b64UrlToBytes,
  bytesToB64Url,
  randomHex,
  readEncryptedJSON,
  sha256Hex,
  writeEncryptedJSON,
} from './valeriaCrypto';
import { followKeyPrefixForPid, readActivePatient } from './valeriaPatients';

export type VoiceSourceChoice = 'app' | 'home';

export interface CaregiverVoiceConsent {
  granted: boolean;
  at: string;
}

interface StoredClip {
  v: 1;
  b64: string;
  word: string;
  at: string;
}

const CONSENT_PREFIX = '@valeria_cg_consent_';
const SOURCE_PREFIX = '@valeria_cg_source_';
const INDEX_PREFIX = '@valeria_cg_index_';
const CLIP_PREFIX = '@valeria_cg_clip_';

let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-audio');
} catch {
  ExpoAudio = null;
}

let ExpoFs: any = null;
try {
  ExpoFs = require('expo-file-system');
} catch {
  ExpoFs = null;
}

const normalizeWordKey = (word: string): string =>
  word.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

async function activePrefix(): Promise<string | null> {
  const p = await readActivePatient();
  if (!p?.pid) return null;
  return followKeyPrefixForPid(p.pid);
}

const clipStorageKey = (prefix: string, word: string): string =>
  `${CLIP_PREFIX}${prefix}_${sha256Hex(normalizeWordKey(word)).slice(0, 16)}`;

export async function loadCaregiverConsent(): Promise<CaregiverVoiceConsent> {
  const prefix = await activePrefix();
  if (!prefix) return { granted: false, at: '' };
  const c = await readEncryptedJSON<CaregiverVoiceConsent>(`${CONSENT_PREFIX}${prefix}`);
  return c && typeof c.granted === 'boolean' ? c : { granted: false, at: '' };
}

export async function setCaregiverConsent(granted: boolean): Promise<CaregiverVoiceConsent> {
  const prefix = await activePrefix();
  if (!prefix) return { granted: false, at: '' };
  const next: CaregiverVoiceConsent = { granted, at: new Date().toISOString() };
  await writeEncryptedJSON(`${CONSENT_PREFIX}${prefix}`, next);
  if (!granted) {
    await deleteAllCaregiverClipsForPrefix(prefix);
    await writeEncryptedJSON(`${SOURCE_PREFIX}${prefix}`, 'app');
  }
  return next;
}

export async function loadCaregiverVoiceSource(): Promise<VoiceSourceChoice> {
  const prefix = await activePrefix();
  if (!prefix) return 'app';
  const v = await readEncryptedJSON<VoiceSourceChoice>(`${SOURCE_PREFIX}${prefix}`);
  return v === 'home' ? 'home' : 'app';
}

export async function setCaregiverVoiceSource(choice: VoiceSourceChoice): Promise<boolean> {
  const prefix = await activePrefix();
  if (!prefix) return false;
  return writeEncryptedJSON(`${SOURCE_PREFIX}${prefix}`, choice);
}

async function deleteAllCaregiverClipsForPrefix(prefix: string): Promise<void> {
  const indexKey = `${INDEX_PREFIX}${prefix}`;
  const keys = (await readEncryptedJSON<string[]>(indexKey)) ?? [];
  for (const k of keys) {
    try { await AsyncStorage.removeItem(k); } catch { /* noop */ }
  }
  try { await AsyncStorage.removeItem(indexKey); } catch { /* noop */ }
}

export async function hasCaregiverClip(word: string): Promise<boolean> {
  const prefix = await activePrefix();
  if (!prefix || !word.trim()) return false;
  const consent = await loadCaregiverConsent();
  if (!consent.granted) return false;
  const clip = await readEncryptedJSON<StoredClip>(clipStorageKey(prefix, word));
  return Boolean(clip?.b64);
}

export async function deleteCaregiverClip(word: string): Promise<void> {
  const prefix = await activePrefix();
  if (!prefix || !word.trim()) return;
  const k = clipStorageKey(prefix, word);
  try { await AsyncStorage.removeItem(k); } catch { /* noop */ }
  const indexKey = `${INDEX_PREFIX}${prefix}`;
  const list = (await readEncryptedJSON<string[]>(indexKey)) ?? [];
  await writeEncryptedJSON(indexKey, list.filter((x) => x !== k));
}

// --- Grabación temporal con expo-audio -> bytes cifrados en reposo ----------
let activeRecorder: any = null;

export async function startCaregiverRecording(): Promise<{ ok: boolean; reason?: 'unavailable' | 'denied' | 'error' }> {
  if (!ExpoAudio || typeof ExpoAudio.requestRecordingPermissionsAsync !== 'function') {
    return { ok: false, reason: 'unavailable' };
  }
  try {
    const perm = await ExpoAudio.requestRecordingPermissionsAsync();
    if (!perm?.granted) return { ok: false, reason: 'denied' };
    await ExpoAudio.setAudioModeAsync?.({
      allowsRecording: true,
      allowsBackgroundRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
    const preset = ExpoAudio.RecordingPresets?.HIGH_QUALITY ?? {};
    const rec = new ExpoAudio.AudioRecorder(preset);
    await rec.prepareToRecordAsync();
    rec.record();
    activeRecorder = rec;
    return { ok: true };
  } catch {
    activeRecorder = null;
    return { ok: false, reason: 'error' };
  }
}

export async function stopAndSaveCaregiverRecording(word: string): Promise<boolean> {
  const rec = activeRecorder;
  activeRecorder = null;
  if (!rec) return false;
  try {
    await rec.stop();
    await ExpoAudio?.setAudioModeAsync?.({
      allowsRecording: false,
      allowsBackgroundRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
    const uri: string | undefined = rec.uri ?? rec.getStatus?.()?.url;
    if (!uri) return false;

    const prefix = await activePrefix();
    const consent = await loadCaregiverConsent();
    if (!prefix || !consent.granted) {
      safeDeleteNativeUri(uri);
      return false;
    }

    let bytes: Uint8Array | null = null;
    if (Platform.OS !== 'web' && ExpoFs?.File) {
      const f = new ExpoFs.File(uri);
      bytes = await f.bytes();
      try { f.delete(); } catch { /* noop */ }
    }
    if (!bytes || !bytes.length) return false;

    const k = clipStorageKey(prefix, word);
    const saved = await writeEncryptedJSON(k, {
      v: 1,
      b64: bytesToB64Url(bytes),
      word,
      at: new Date().toISOString(),
    } satisfies StoredClip);

    if (saved) {
      const indexKey = `${INDEX_PREFIX}${prefix}`;
      const list = (await readEncryptedJSON<string[]>(indexKey)) ?? [];
      if (!list.includes(k)) {
        list.push(k);
        await writeEncryptedJSON(indexKey, list);
      }
    }
    return saved;
  } catch {
    return false;
  }
}

function safeDeleteNativeUri(uri?: string | null): void {
  if (!uri || Platform.OS === 'web' || !ExpoFs?.File) return;
  try {
    const f = new ExpoFs.File(uri);
    if (f.exists) f.delete();
  } catch { /* noop */ }
}

// --- Reproducción desde temporal descifrado (y borrado inmediato al cerrar) ---
let cgPlayer: any = null;
let cgSub: any = null;
let cgTempFile: any = null;
let cgTimer: ReturnType<typeof setTimeout> | null = null;

export function stopCaregiverPlayback(): void {
  if (cgTimer !== null) {
    clearTimeout(cgTimer);
    cgTimer = null;
  }
  if (cgSub) {
    try { cgSub.remove?.(); } catch { /* noop */ }
    cgSub = null;
  }
  if (cgPlayer) {
    try { cgPlayer.pause?.(); } catch { /* noop */ }
    try { cgPlayer.remove?.(); } catch { /* noop */ }
    cgPlayer = null;
  }
  if (cgTempFile) {
    try { cgTempFile.delete?.(); } catch { /* noop */ }
    cgTempFile = null;
  }
}

export async function playCaregiverWord(
  word: string,
  callbacks: { onDone?: () => void; onError?: () => void } = {},
): Promise<boolean> {
  if (!ExpoAudio || typeof ExpoAudio.createAudioPlayer !== 'function') return false;
  const prefix = await activePrefix();
  if (!prefix) return false;
  const consent = await loadCaregiverConsent();
  if (!consent.granted) return false;
  const clip = await readEncryptedJSON<StoredClip>(clipStorageKey(prefix, word));
  if (!clip?.b64) return false;

  stopCaregiverPlayback();

  try {
    const bytes = b64UrlToBytes(clip.b64);
    if (Platform.OS === 'web') {
      return false;
    }
    if (!ExpoFs?.File || !ExpoFs?.Paths?.cache) return false;
    const tempFile = new ExpoFs.File(ExpoFs.Paths.cache, `valeria_cg_${randomHex(6)}.m4a`);
    tempFile.write(bytes);
    cgTempFile = tempFile;

    await ExpoAudio.setAudioModeAsync?.({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });

    const player = ExpoAudio.createAudioPlayer({ uri: tempFile.uri });
    cgPlayer = player;
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      stopCaregiverPlayback();
      if (ok) callbacks.onDone?.();
      else callbacks.onError?.();
    };

    cgSub = player.addListener?.('playbackStatusUpdate', (st: { didJustFinish?: boolean }) => {
      if (st?.didJustFinish) finish(true);
    });
    cgTimer = setTimeout(() => finish(true), 12_000);
    player.play();
    return true;
  } catch {
    stopCaregiverPlayback();
    callbacks.onError?.();
    return false;
  }
}

export async function shouldUseHomeVoiceForWord(word: string): Promise<boolean> {
  const source = await loadCaregiverVoiceSource();
  if (source !== 'home') return false;
  return hasCaregiverClip(word);
}

export async function playHomeOrFallback(
  word: string,
  fallbackSpeak: () => void,
  callbacks: { onDone?: () => void; onError?: () => void } = {},
): Promise<void> {
  try {
    if (await shouldUseHomeVoiceForWord(word)) {
      const ok = await playCaregiverWord(word, {
        onDone: callbacks.onDone,
        onError: () => fallbackSpeak(),
      });
      if (ok) return;
    }
  } catch { /* fallback to app voice */ }
  fallbackSpeak();
}

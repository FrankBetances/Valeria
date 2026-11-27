// ============================================================================
// Valeria+ · Cifrado real en reposo y primitivas criptográficas (v2 · P3.1)
//
// · Formato v2: XChaCha20-Poly1305 (@noble/ciphers), nonce aleatorio de 24 bytes
//   por escritura (expo-crypto) y clave maestra de 32 bytes en expo-secure-store
//   (Android Keystore / iOS Keychain; en vista previa web sin Keystore, fallback
//   solo en memoria/AsyncStorage web).
// · Migración transparente: `decryptJSON` / `readEncryptedJSON` leen `v1:` (y
//   JSON antiguo en claro) y los reescriben inmediatamente en `v2:`.
// · Cualquier blob alterado falla la verificación Poly1305 y devuelve `null`.
// · Incluye además sellado por frase (`VALERIA-EXPORT1:`) para exportar un
//   paciente con `allowBackup: false`, y primitiva SHA-256 / HKDF / PBKDF2 /
//   Ed25519 compartida con PIN y códigos de seguimiento.
// ============================================================================
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as ExpoCrypto from 'expo-crypto';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { sha256 as nobleSha256 } from '@noble/hashes/sha2.js';
import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { ed25519 } from '@noble/curves/ed25519.js';

const LEGACY_KEY_STORAGE = '@valeria_tlm_key';
const MASTER_KEY_SECURE = 'valeria_master_key_v2';
const WEB_SECURE_PREFIX = '@valeria_web_ss_';

export const V2_PREFIX = 'v2:';
export const V1_PREFIX = 'v1:';
export const EXPORT_PREFIX = 'VALERIA-EXPORT1:';

// ---- Bytes / Hex / UTF-8 / Base64url ---------------------------------------

export function utf8ToBytes(str: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(str);
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else if (c < 0xd800 || c >= 0xe000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    else {
      i++;
      c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return new Uint8Array(out);
}

export function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 0x80) { out += String.fromCharCode(b); i += 1; }
    else if ((b & 0xe0) === 0xc0) {
      out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i + 1] & 0x3f)); i += 2;
    } else if ((b & 0xf0) === 0xe0) {
      out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i + 1] & 0x3f) << 6) | (bytes[i + 2] & 0x3f)); i += 3;
    } else {
      const cp = ((b & 0x07) << 18) | ((bytes[i + 1] & 0x3f) << 12) | ((bytes[i + 2] & 0x3f) << 6) | (bytes[i + 3] & 0x3f);
      const u = cp - 0x10000;
      out += String.fromCharCode(0xd800 + (u >> 10), 0xdc00 + (u & 0x3ff));
      i += 4;
    }
  }
  return out;
}

const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const B64URL_REV = (() => {
  const m = new Int16Array(128).fill(-1);
  for (let i = 0; i < B64URL.length; i++) m[B64URL.charCodeAt(i)] = i;
  m['+'.charCodeAt(0)] = 62;
  m['/'.charCodeAt(0)] = 63;
  return m;
})();

export function bytesToB64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const has1 = i + 1 < bytes.length;
    const has2 = i + 2 < bytes.length;
    const b1 = has1 ? bytes[i + 1] : 0;
    const b2 = has2 ? bytes[i + 2] : 0;
    out += B64URL[b0 >> 2];
    out += B64URL[((b0 & 3) << 4) | (b1 >> 4)];
    if (has1) out += B64URL[((b1 & 15) << 2) | (b2 >> 6)];
    if (has2) out += B64URL[b2 & 63];
  }
  return out;
}

export function b64UrlToBytes(input: string): Uint8Array {
  const clean = input.replace(/[\s=]+/g, '');
  if (!clean.length) return new Uint8Array(0);
  if (clean.length % 4 === 1) throw new Error('Invalid base64url length');
  const outLen = Math.floor((clean.length * 3) / 4);
  const out = new Uint8Array(outLen);
  let pos = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = clean.charCodeAt(i);
    const c1 = clean.charCodeAt(i + 1);
    const c2 = i + 2 < clean.length ? clean.charCodeAt(i + 2) : -1;
    const c3 = i + 3 < clean.length ? clean.charCodeAt(i + 3) : -1;
    const n0 = c0 < 128 ? B64URL_REV[c0] : -1;
    const n1 = c1 < 128 ? B64URL_REV[c1] : -1;
    const n2 = c2 === -1 ? 0 : c2 < 128 ? B64URL_REV[c2] : -1;
    const n3 = c3 === -1 ? 0 : c3 < 128 ? B64URL_REV[c3] : -1;
    if (n0 < 0 || n1 < 0 || n2 < 0 || n3 < 0) throw new Error('Invalid base64url char');
    out[pos++] = (n0 << 2) | (n1 >> 4);
    if (c2 !== -1) out[pos++] = ((n1 & 15) << 4) | (n2 >> 2);
    if (c3 !== -1) out[pos++] = ((n2 & 3) << 6) | n3;
  }
  return out;
}

export function bytesToHex(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, '0');
  return s;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim();
  const out = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function randomBytes(len: number): Uint8Array {
  return ExpoCrypto.getRandomBytes(len);
}

export function randomHex(bytesLen: number): string {
  return bytesToHex(randomBytes(bytesLen));
}

export function sha256Hex(input: string | Uint8Array): string {
  const data = typeof input === 'string' ? utf8ToBytes(input) : input;
  return bytesToHex(nobleSha256(data));
}

/** Compatibilidad con llamadores legacy async (`sha256` antiguo de ValeriaProPin). */
export async function sha256(msg: string): Promise<string> {
  return sha256Hex(msg);
}

export function pbkdf2Sha256(secret: string | Uint8Array, salt: Uint8Array, iterations: number, dkLen = 32): Uint8Array {
  const pass = typeof secret === 'string' ? utf8ToBytes(secret) : secret;
  return pbkdf2(nobleSha256, pass, salt, { c: iterations, dkLen });
}

export function hkdfSha256(ikm: Uint8Array, salt: Uint8Array | undefined, info: string, len: number): Uint8Array {
  return hkdf(nobleSha256, ikm, salt, utf8ToBytes(info), len);
}

export { ed25519 };

// ---- Almacenamiento seguro (Keystore/Keychain en nativo; web fallback) ----

const sanitizeKey = (key: string): string => key.replace(/[^a-zA-Z0-9._-]/g, '_');

export async function getSecureItem(key: string): Promise<string | null> {
  const safe = sanitizeKey(key);
  if (Platform.OS === 'web') {
    try { return await AsyncStorage.getItem(`${WEB_SECURE_PREFIX}${safe}`); } catch (e) { return null; }
  }
  try {
    return await SecureStore.getItemAsync(safe);
  } catch (e) {
    return null;
  }
}

export async function setSecureItem(key: string, value: string): Promise<boolean> {
  const safe = sanitizeKey(key);
  if (Platform.OS === 'web') {
    try { await AsyncStorage.setItem(`${WEB_SECURE_PREFIX}${safe}`, value); return true; } catch (e) { return false; }
  }
  try {
    await SecureStore.setItemAsync(safe, value);
    return true;
  } catch (e) {
    return false;
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  const safe = sanitizeKey(key);
  if (Platform.OS === 'web') {
    try { await AsyncStorage.removeItem(`${WEB_SECURE_PREFIX}${safe}`); } catch (e) { /* noop */ }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(safe);
  } catch (e) { /* noop */ }
}

let cachedMasterKey: Uint8Array | null = null;
let pendingMasterKey: Promise<Uint8Array> | null = null;

export function __resetMasterKeyCache(): void {
  cachedMasterKey = null;
  pendingMasterKey = null;
}

async function getMasterKey(): Promise<Uint8Array> {
  if (cachedMasterKey) return cachedMasterKey;
  if (pendingMasterKey) return pendingMasterKey;
  pendingMasterKey = (async () => {
    try {
      const existing = await getSecureItem(MASTER_KEY_SECURE);
      if (existing) {
        const bytes = b64UrlToBytes(existing);
        if (bytes.length === 32) { cachedMasterKey = bytes; return bytes; }
      }
      const generated = randomBytes(32);
      const saved = await setSecureItem(MASTER_KEY_SECURE, bytesToB64Url(generated));
      if (!saved) throw new Error('SecureStore unavailable for master key');
      cachedMasterKey = generated;
      return generated;
    } finally {
      pendingMasterKey = null;
    }
  })();
  return pendingMasterKey;
}

// ---- Decodificador legacy v1: (solo lectura y migración a v2:) -------------

const B64_LEGACY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function b64ToBytesLegacy(str: string): number[] {
  const clean = str.replace(/[^A-Za-z0-9+/]/g, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const n0 = B64_LEGACY.indexOf(clean[i]);
    const n1 = B64_LEGACY.indexOf(clean[i + 1]);
    const n2 = B64_LEGACY.indexOf(clean[i + 2]);
    const n3 = B64_LEGACY.indexOf(clean[i + 3]);
    out.push((n0 << 2) | (n1 >> 4));
    if (clean[i + 2]) out.push(((n1 & 15) << 4) | (n2 >> 2));
    if (clean[i + 3]) out.push(((n2 & 3) << 6) | n3);
  }
  return out;
}

function bytesToStrLegacy(bytes: number[]): string {
  let out = '';
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 128) { out += String.fromCharCode(b); i += 1; }
    else if (b < 224) { out += String.fromCharCode(((b & 31) << 6) | (bytes[i + 1] & 63)); i += 2; }
    else { out += String.fromCharCode(((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63)); i += 3; }
  }
  return out;
}

async function decryptV1<T>(blob: string): Promise<T | null> {
  if (!blob.startsWith(V1_PREFIX)) return null;
  try {
    const key = await AsyncStorage.getItem(LEGACY_KEY_STORAGE);
    if (!key || key.length < 32) return null;
    const cipher = b64ToBytesLegacy(blob.slice(V1_PREFIX.length));
    const out = new Array<number>(cipher.length);
    let block = new Uint8Array(0);
    for (let i = 0; i < cipher.length; i++) {
      if (i % 32 === 0) block = nobleSha256(utf8ToBytes(`${key}:${i / 32}`));
      out[i] = cipher[i] ^ block[i % 32];
    }
    return JSON.parse(bytesToStrLegacy(out)) as T;
  } catch (e) {
    return null;
  }
}

// ---- API pública v2 (XChaCha20-Poly1305) -----------------------------------

/**
 * Cifra un valor JSON en formato `v2:<nonce24_b64u>.<ciphertext_and_tag_b64u>`.
 * Cada llamada genera un nonce nuevo de 24 bytes (expo-crypto).
 */
export async function encryptJSON(obj: unknown): Promise<string> {
  const key = await getMasterKey();
  const nonce = randomBytes(24);
  const plain = utf8ToBytes(JSON.stringify(obj));
  const ct = xchacha20poly1305(key, nonce).encrypt(plain);
  return `${V2_PREFIX}${bytesToB64Url(nonce)}.${bytesToB64Url(ct)}`;
}

/**
 * Descifra blobs `v2:` (verificando autenticidad Poly1305) y `v1:` legacy.
 * Si se pasa `migrateStorageKey` y el origen era `v1:`, reescribe en `v2:`.
 * Cualquier blob alterado o corrupto devuelve `null`.
 */
export async function decryptJSON<T = unknown>(
  blob: string | null,
  migrateStorageKey?: string,
): Promise<T | null> {
  if (!blob || typeof blob !== 'string') return null;
  if (blob.startsWith(V2_PREFIX)) {
    try {
      const rest = blob.slice(V2_PREFIX.length);
      const dot = rest.indexOf('.');
      if (dot <= 0) return null;
      const nonce = b64UrlToBytes(rest.slice(0, dot));
      const ct = b64UrlToBytes(rest.slice(dot + 1));
      if (nonce.length !== 24 || ct.length < 16) return null;
      const key = await getMasterKey();
      const plain = xchacha20poly1305(key, nonce).decrypt(ct);
      return JSON.parse(bytesToUtf8(plain)) as T;
    } catch (e) {
      return null;
    }
  }
  if (blob.startsWith(V1_PREFIX)) {
    const val = await decryptV1<T>(blob);
    if (val !== null && migrateStorageKey) {
      try { await AsyncStorage.setItem(migrateStorageKey, await encryptJSON(val)); } catch (e) { /* noop */ }
    }
    return val;
  }
  return null;
}

/**
 * Lectura segura con migración automática desde `v1:` o JSON antiguo en claro a `v2:`.
 */
export async function readEncryptedJSON<T = unknown>(storageKey: string): Promise<T | null> {
  let raw: string | null = null;
  try { raw = await AsyncStorage.getItem(storageKey); } catch (e) { return null; }
  if (!raw) return null;
  if (raw.startsWith(V2_PREFIX)) return decryptJSON<T>(raw);
  if (raw.startsWith(V1_PREFIX)) return decryptJSON<T>(raw, storageKey);
  // JSON antiguo en claro → parsear y reescribir cifrado en v2.
  try {
    const parsed = JSON.parse(raw) as T;
    await writeEncryptedJSON(storageKey, parsed);
    return parsed;
  } catch (e) {
    return null;
  }
}

/** Escritura cifrada en v2 que devuelve `true` solo si persistió sin error. */
export async function writeEncryptedJSON(storageKey: string, value: unknown): Promise<boolean> {
  try {
    const blob = await encryptJSON(value);
    await AsyncStorage.setItem(storageKey, blob);
    return true;
  } catch (e) {
    return false;
  }
}

// ---- Sellado con frase para exportación `.valeria` (P3.6) -------------------

export const EXPORT_PBKDF2_ITERS = 100_000;

export async function sealWithPassphrase(payload: unknown, passphrase: string): Promise<string> {
  const pass = passphrase.trim();
  if (!pass) throw new Error('Empty passphrase');
  const salt = randomBytes(16);
  const nonce = randomBytes(24);
  const key = pbkdf2Sha256(pass, salt, EXPORT_PBKDF2_ITERS, 32);
  const plain = utf8ToBytes(JSON.stringify(payload));
  const ct = xchacha20poly1305(key, nonce).encrypt(plain);
  return `${EXPORT_PREFIX}${bytesToB64Url(salt)}.${bytesToB64Url(nonce)}.${bytesToB64Url(ct)}`;
}

export async function openWithPassphrase<T = unknown>(raw: string, passphrase: string): Promise<T | null> {
  try {
    const clean = raw.trim();
    if (!clean.startsWith(EXPORT_PREFIX)) return null;
    const parts = clean.slice(EXPORT_PREFIX.length).replace(/\s+/g, '').split('.');
    if (parts.length !== 3) return null;
    const salt = b64UrlToBytes(parts[0]);
    const nonce = b64UrlToBytes(parts[1]);
    const ct = b64UrlToBytes(parts[2]);
    if (salt.length !== 16 || nonce.length !== 24 || ct.length < 16) return null;
    const key = pbkdf2Sha256(passphrase.trim(), salt, EXPORT_PBKDF2_ITERS, 32);
    const plain = xchacha20poly1305(key, nonce).decrypt(ct);
    return JSON.parse(bytesToUtf8(plain)) as T;
  } catch (e) {
    return null;
  }
}

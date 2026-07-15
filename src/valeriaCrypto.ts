// ============================================================================
// Valeria+ · Cifrado local ligero para la telemetría del piloto — V1.0
// Cifra el JSON de telemetría "en reposo" en AsyncStorage con un keystream
// derivado del SHA-256 puro (mismo que ValeriaProPin), sin dependencias nativas.
//
// Modelo de amenaza: evita que el log sea legible en claro al inspeccionar el
// almacenamiento de la app. La clave por instalación es aleatoria y se guarda
// aparte. NOTA para producción regulatoria: mover esa clave a expo-secure-store
// (Keystore/Keychain) — este módulo aísla el cifrado para que ese cambio sea de
// una sola línea. Todas las operaciones son async y se ejecutan fuera del render.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from './ValeriaProPin';

const KEY_STORAGE = '@valeria_tlm_key'; // clave de cifrado por instalación (hex)

// Base64 en JS puro (Hermes no garantiza btoa/atob).
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function bytesToB64(bytes: number[]): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1], b2 = bytes[i + 2];
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | ((b1 ?? 0) >> 4)];
    out += b1 === undefined ? '=' : B64[((b1 & 15) << 2) | ((b2 ?? 0) >> 6)];
    out += b2 === undefined ? '=' : B64[b2 & 63];
  }
  return out;
}
function b64ToBytes(str: string): number[] {
  const clean = str.replace(/[^A-Za-z0-9+/]/g, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const n0 = B64.indexOf(clean[i]), n1 = B64.indexOf(clean[i + 1]);
    const n2 = B64.indexOf(clean[i + 2]), n3 = B64.indexOf(clean[i + 3]);
    out.push((n0 << 2) | (n1 >> 4));
    if (clean[i + 2]) out.push(((n1 & 15) << 4) | (n2 >> 2));
    if (clean[i + 3]) out.push(((n2 & 3) << 6) | n3);
  }
  return out;
}

// UTF-8.
function strToBytes(str: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 128) out.push(c);
    else if (c < 2048) out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  return out;
}
function bytesToStr(bytes: number[]): string {
  let out = '', i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b < 128) { out += String.fromCharCode(b); i += 1; }
    else if (b < 224) { out += String.fromCharCode(((b & 31) << 6) | (bytes[i + 1] & 63)); i += 2; }
    else { out += String.fromCharCode(((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63)); i += 3; }
  }
  return out;
}

const hexToBytes = (hex: string): number[] => {
  const out: number[] = [];
  for (let i = 0; i < hex.length; i += 2) out.push(parseInt(hex.substr(i, 2), 16));
  return out;
};

// Clave por instalación: aleatoria de 256 bits, persistida en hex. Se crea una vez.
async function getKey(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(KEY_STORAGE);
    if (existing && existing.length >= 32) return existing;
  } catch (e) { /* noop */ }
  let seed = '';
  for (let i = 0; i < 8; i++) seed += Math.random().toString(36).slice(2);
  const key = await sha256(seed + Date.now());
  try { await AsyncStorage.setItem(KEY_STORAGE, key); } catch (e) { /* noop */ }
  return key;
}

// Keystream CTR: bloque n = SHA-256(clave || ":" || n) → 32 bytes. XOR con el texto.
async function keystreamXor(key: string, data: number[]): Promise<number[]> {
  const out = new Array<number>(data.length);
  let block: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i % 32 === 0) block = hexToBytes(await sha256(`${key}:${i / 32}`));
    out[i] = data[i] ^ block[i % 32];
  }
  return out;
}

// Cifra un objeto → cadena base64. Prefijo "v1:" para versionar el formato.
export async function encryptJSON(obj: unknown): Promise<string> {
  const key = await getKey();
  const plain = strToBytes(JSON.stringify(obj));
  const cipher = await keystreamXor(key, plain);
  return `v1:${bytesToB64(cipher)}`;
}

// Descifra la cadena producida por encryptJSON. Devuelve null si no es válida.
export async function decryptJSON<T = unknown>(blob: string | null): Promise<T | null> {
  if (!blob || !blob.startsWith('v1:')) return null;
  try {
    const key = await getKey();
    const cipher = b64ToBytes(blob.slice(3));
    const plain = await keystreamXor(key, cipher);
    return JSON.parse(bytesToStr(plain)) as T;
  } catch (e) {
    return null;
  }
}

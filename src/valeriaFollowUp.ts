// ============================================================================
// Valeria+ · Seguimiento entre consultas v2 (P3.2–P3.7)
//
// · Identidad estable del paciente mediante `pid` aleatorio de 128 bits.
//   Sin `'anon'`: sin paciente activo, no se escribe ni se mezcla nada.
// · Cola por clave (`withLock`) para todas las escrituras leer-modificar-escribir
//   y `writeEnc` devolviendo `boolean` real (nunca silencia fallos).
// · PIN profesional PBKDF2-SHA256 (sal 16 B, 100 000 iter.) + bloqueo
//   progresivo persistido (5→30 s, 10→5 min, 15→30 min), sin PIN maestro.
// · Vínculo QR `VALERIA-VINCULO1:`, notas cifradas y firmadas con Ed25519
//   `VALERIA-NOTA2:`, acuses de lectura `VALERIA-LEIDO2:`, enlace `valeria://`,
//   compatibilidad lectura `VALERIA-NOTA1:` y exportación `.valeria`.
// ============================================================================
import { STORAGE_KEYS } from './valeriaTheme';
import {
  readEncryptedJSON,
  writeEncryptedJSON,
  sealWithPassphrase,
  openWithPassphrase,
  randomBytes,
  randomHex,
  bytesToHex,
  sha256Hex,
  pbkdf2Sha256,
  utf8ToBytes,
  bytesToUtf8,
  bytesToB64Url,
  b64UrlToBytes,
  getSecureItem,
  setSecureItem,
  deleteSecureItem,
  ed25519,
} from './valeriaCrypto';
import {
  readActivePatient,
  saveActivePatient,
  readPatientsList,
  savePatientsList,
  readSessionHistory,
  readLingHistory,
  followKeyPrefixForPid,
  pidHashForLink,
  PatientRecord,
} from './valeriaPatients';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';

export const FOLLOW_AREAS = ['audicion', 'lenguaje', 'tea', 'dislexia', 'pares', 'expansion', 'sensorial', 'escritura', 'aventuras', 'ra', 'tpr', 'steam'] as const;
export type FollowArea = typeof FOLLOW_AREAS[number];
export type ProRole = 'logopeda' | 'orl' | 'atencion' | 'otro';

export const PIN_PBKDF2_ITERS = 100_000;
export const LINK_PREFIX = 'VALERIA-VINCULO1:';
export const NOTE2_PREFIX = 'VALERIA-NOTA2:';
export const PAUTA2_PREFIX = 'VALERIA-PAUTA2:';
export const RECEIPT2_PREFIX = 'VALERIA-LEIDO2:';
export const NOTE1_PREFIX = 'VALERIA-NOTA1:';
export const NOTE_URL_PREFIX = 'valeria://nota?c=';
export const MAX_QR_CHARS = 950;

let planChangeListener: (() => void) | null = null;
export function setFollowPlanChangeListener(fn: (() => void) | null): void {
  planChangeListener = fn;
}

const LOCKOUT_KEY = '@valeria_pin_lock_v2';
const RESET_META_KEY = '@valeria_pin_reset_meta';
const KNOWN_SIGNERS_KEY = '@valeria_known_signer_keys';
const FAMILY_PUB_KEY = '@valeria_family_pubkey_v2';
const LINKS_KEY_BASE = '@valeria_patient_links';
const PRO_SK_PREFIX = 'valeria_pro_sk_';
const FAM_SK_KEY = 'valeria_fam_sk_v1';
const LINK_SK_PREFIX = 'valeria_link_key_';

export interface Professional {
  id: string;
  name: string;
  role: ProRole;
  centre: string;
  // v2 PBKDF2-SHA256 + Ed25519
  pinSalt?: string;
  pinIter?: number;
  pinHash?: string;
  pubKey?: string;
  postReset?: boolean;
  // legacy SHA-256 (se actualiza al iniciar sesión)
  salt?: string;
  hash?: string;
  createdAt: string;
}

export interface FrequencyPlan {
  [area: string]: { perWeek: number; by: string; role: ProRole; at: string } | undefined;
}

export interface StimEvent {
  at: string;
  area: FollowArea;
}

export interface FollowNote {
  id: string;
  from: 'pro' | 'family';
  author: string;
  role?: ProRole;
  centre?: string;
  text: string;
  at: string;
  reviewedAt?: string;
  reviewedBy?: string;
  imported?: boolean;
  pubKey?: string;
  sig?: string;
  verified?: boolean;
  legacyFormat?: boolean;
  postReset?: boolean;
}

export interface ShareConsent {
  granted: boolean;
  at: string;
  log: Array<{ at: string; granted: boolean }>;
}

export interface WeekRow {
  start: Date;
  done: number;
  planned: number;
  byArea: Partial<Record<FollowArea, { done: number; planned: number }>>;
}

export interface KnownSigner {
  pubKey: string;
  label: string;
  role?: ProRole | 'family';
  centre?: string;
  addedAt: string;
}

export interface PatientLink {
  pidHash: string;
  knownPubKeys: KnownSigner[];
  createdAt: string;
}

export interface PinLockStatus {
  fails: number;
  lockedUntil: number;
}

export type ImportCodeResult =
  | {
    ok: true;
    kind: 'note' | 'receipt' | 'plan';
    status: 'verified' | 'legacy_unverified';
    duplicate?: boolean;
    author?: string;
    centre?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    count?: number;
    postReset?: boolean;
  }
  | {
    ok: false;
    reason: 'no_patient' | 'bad_format' | 'wrong_patient' | 'unverified' | 'save_error';
  };

const ONE_YEAR = 365 * 86_400_000;

// ---- Cola por clave (P3.3) -------------------------------------------------

const LOCKS = new Map<string, Promise<unknown>>();

export function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = LOCKS.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  const cleanup = next.then(
    () => { if (LOCKS.get(key) === cleanup) LOCKS.delete(key); },
    () => { if (LOCKS.get(key) === cleanup) LOCKS.delete(key); },
  );
  LOCKS.set(key, cleanup);
  return next;
}

async function readEnc<T>(key: string, fallback: T): Promise<T> {
  try {
    const val = await readEncryptedJSON<T>(key);
    return val === null ? fallback : val;
  } catch (e) {
    return fallback;
  }
}

async function writeEnc(key: string, v: unknown): Promise<boolean> {
  return writeEncryptedJSON(key, v);
}

// ---- Identidad del paciente activo (P3.2, sin `'anon'`) --------------------

export async function hasActivePatient(): Promise<boolean> {
  const p = await readActivePatient();
  return Boolean(p?.pid);
}

async function activePid(): Promise<string | null> {
  const p = await readActivePatient();
  return p?.pid ?? null;
}

async function activeFollowPrefix(): Promise<string | null> {
  const pid = await activePid();
  return pid ? followKeyPrefixForPid(pid) : null;
}

const k = (base: string, prefix: string) => `${base}_${prefix}`;

// ---- Estado de sesión del profesional y claves de firma --------------------

let activePro: Professional | null = null;
export const currentPro = (): Professional | null => activePro;
export const clearCurrentPro = (): void => { activePro = null; };
export const isUnlocked = (): boolean => activePro !== null;

async function getKnownSignersMap(): Promise<Record<string, KnownSigner>> {
  return readEnc<Record<string, KnownSigner>>(KNOWN_SIGNERS_KEY, {});
}

async function recordKnownSigner(signer: KnownSigner): Promise<void> {
  await withLock(KNOWN_SIGNERS_KEY, async () => {
    const map = await getKnownSignersMap();
    map[signer.pubKey] = signer;
    await writeEnc(KNOWN_SIGNERS_KEY, map);
  });
}

async function ensureProSigningKeys(pro: Professional): Promise<{ pro: Professional; skB64: string }> {
  const existingSk = await getSecureItem(`${PRO_SK_PREFIX}${pro.id}`);
  if (existingSk && pro.pubKey) {
    return { pro, skB64: existingSk };
  }
  const sk = randomBytes(32);
  const pub = ed25519.getPublicKey(sk);
  const skB64 = bytesToB64Url(sk);
  const pubKey = bytesToB64Url(pub);
  await setSecureItem(`${PRO_SK_PREFIX}${pro.id}`, skB64);
  const updated: Professional = { ...pro, pubKey };
  await recordKnownSigner({
    pubKey,
    label: pro.name,
    role: pro.role,
    centre: pro.centre,
    addedAt: new Date().toISOString(),
  });
  return { pro: updated, skB64 };
}

async function getOrCreateFamilyKeys(): Promise<{ pubKey: string; skB64: string }> {
  const existingSk = await getSecureItem(FAM_SK_KEY);
  const existingPub = await readEnc<string | null>(FAMILY_PUB_KEY, null);
  if (existingSk && existingPub) return { pubKey: existingPub, skB64: existingSk };
  const sk = randomBytes(32);
  const pub = ed25519.getPublicKey(sk);
  const skB64 = bytesToB64Url(sk);
  const pubKey = bytesToB64Url(pub);
  await setSecureItem(FAM_SK_KEY, skB64);
  await writeEnc(FAMILY_PUB_KEY, pubKey);
  await recordKnownSigner({
    pubKey,
    label: 'Familia',
    role: 'family',
    addedAt: new Date().toISOString(),
  });
  return { pubKey, skB64 };
}

function signPayload(skB64: string, canonical: string): string {
  const sig = ed25519.sign(utf8ToBytes(canonical), b64UrlToBytes(skB64));
  return bytesToB64Url(sig);
}

function verifyPayload(pubB64: string, canonical: string, sigB64: string): boolean {
  try {
    const pub = b64UrlToBytes(pubB64);
    const sig = b64UrlToBytes(sigB64);
    if (pub.length !== 32 || sig.length !== 64) return false;
    return ed25519.verify(sig, utf8ToBytes(canonical), pub);
  } catch (e) {
    return false;
  }
}

// ---- Profesionales y PIN (P3.4 · PBKDF2-SHA256 + bloqueo persistido) -------

export async function listPros(): Promise<Professional[]> {
  const list = await readEnc<Professional[]>(STORAGE_KEYS.profesionales, []);
  return Array.isArray(list) ? list : [];
}

async function savePros(p: Professional[]): Promise<boolean> {
  return writeEnc(STORAGE_KEYS.profesionales, p);
}

export async function getPinLockStatus(): Promise<PinLockStatus> {
  const st = await readEnc<PinLockStatus>(LOCKOUT_KEY, { fails: 0, lockedUntil: 0 });
  return {
    fails: Number.isFinite(st?.fails) ? Math.max(0, st.fails) : 0,
    lockedUntil: Number.isFinite(st?.lockedUntil) ? Math.max(0, st.lockedUntil) : 0,
  };
}

export async function clearPinLockoutForTest(): Promise<void> {
  await writeEnc(LOCKOUT_KEY, { fails: 0, lockedUntil: 0 });
}

export async function hasPostResetState(): Promise<boolean> {
  const meta = await readEnc<{ resetAt?: string } | null>(RESET_META_KEY, null);
  return Boolean(meta?.resetAt);
}

function matchesProPin(p: Professional, pin: string): boolean {
  if (p.pinSalt && p.pinIter && p.pinHash) {
    const derived = bytesToHex(pbkdf2Sha256(pin, b64UrlToBytes(p.pinSalt), p.pinIter, 32));
    return derived === p.pinHash;
  }
  if (p.salt && p.hash) {
    return sha256Hex(`${p.salt}:${pin}`) === p.hash;
  }
  return false;
}

export async function verifyPin(pin: string): Promise<Professional | null> {
  return withLock(STORAGE_KEYS.profesionales, async () => {
    const lock = await getPinLockStatus();
    if (Date.now() < lock.lockedUntil) return null;

    const pros = await listPros();
    let matchedIdx = -1;
    for (let i = 0; i < pros.length; i++) {
      if (matchesProPin(pros[i], pin)) { matchedIdx = i; break; }
    }

    if (matchedIdx < 0) {
      const fails = lock.fails + 1;
      let durationMs = 0;
      if (fails >= 15) durationMs = 30 * 60 * 1000;      // 30 min
      else if (fails === 10) durationMs = 5 * 60 * 1000; // 5 min
      else if (fails === 5) durationMs = 30 * 1000;      // 30 s
      const lockedUntil = durationMs > 0 ? Date.now() + durationMs : 0;
      await writeEnc(LOCKOUT_KEY, { fails, lockedUntil });
      return null;
    }

    await writeEnc(LOCKOUT_KEY, { fails: 0, lockedUntil: 0 });
    let pro = pros[matchedIdx];
    let dirty = false;

    // Migra PIN legacy SHA-256 a PBKDF2-SHA256 sin romper el acceso existente.
    if (!pro.pinIter || !pro.pinSalt || !pro.pinHash) {
      const salt = randomBytes(16);
      pro = {
        ...pro,
        pinSalt: bytesToB64Url(salt),
        pinIter: PIN_PBKDF2_ITERS,
        pinHash: bytesToHex(pbkdf2Sha256(pin, salt, PIN_PBKDF2_ITERS, 32)),
      };
      delete pro.salt;
      delete pro.hash;
      dirty = true;
    }

    if (!pro.pubKey || !(await getSecureItem(`${PRO_SK_PREFIX}${pro.id}`))) {
      const keysRes = await ensureProSigningKeys(pro);
      pro = keysRes.pro;
      dirty = true;
    }

    if (dirty) {
      pros[matchedIdx] = pro;
      await savePros(pros);
    }

    activePro = pro;
    return pro;
  });
}

export async function addPro(d: {
  name: string;
  role: ProRole;
  centre: string;
  pin: string;
}): Promise<null | 'name' | 'pinFormat' | 'pinTaken'> {
  return withLock(STORAGE_KEYS.profesionales, async () => {
    if (!d.name.trim()) return 'name';
    if (!/^\d{4}$/.test(d.pin)) return 'pinFormat';

    const pros = await listPros();
    for (const p of pros) {
      if (matchesProPin(p, d.pin)) return 'pinTaken';
    }

    const id = randomHex(8);
    const salt = randomBytes(16);
    const pinHash = bytesToHex(pbkdf2Sha256(d.pin, salt, PIN_PBKDF2_ITERS, 32));
    const resetMeta = await readEnc<{ resetAt?: string } | null>(RESET_META_KEY, null);

    let pro: Professional = {
      id,
      name: d.name.trim(),
      role: d.role,
      centre: d.centre.trim(),
      pinSalt: bytesToB64Url(salt),
      pinIter: PIN_PBKDF2_ITERS,
      pinHash,
      ...(resetMeta?.resetAt ? { postReset: true } : {}),
      createdAt: new Date().toISOString(),
    };
    const keysRes = await ensureProSigningKeys(pro);
    pro = keysRes.pro;

    pros.push(pro);
    await savePros(pros);
    await writeEnc(LOCKOUT_KEY, { fails: 0, lockedUntil: 0 });
    // Si es el primer profesional de la instalación, desbloquea la sesión actual.
    if (pros.length === 1) activePro = pro;
    return null;
  });
}

export async function removePro(id: string): Promise<boolean> {
  return withLock(STORAGE_KEYS.profesionales, async () => {
    const pros = await listPros();
    const target = pros.find((p) => p.id === id);
    if (target) await deleteSecureItem(`${PRO_SK_PREFIX}${target.id}`);
    const next = pros.filter((p) => p.id !== id);
    const ok = await savePros(next);
    if (activePro?.id === id) activePro = null;
    return ok;
  });
}

/**
 * Restablece los profesionales locales tras olvidar el PIN. Las claves públicas
 * históricas siguen en `@valeria_known_signer_keys` para conservar la verificación
 * de notas firmadas antes, y los profesionales/notas posteriores quedan marcados
 * «tras restablecer».
 */
export async function resetPros(noteText: string): Promise<boolean> {
  const okPros = await withLock(STORAGE_KEYS.profesionales, async () => {
    const pros = await listPros();
    for (const p of pros) {
      if (p.pubKey) {
        await recordKnownSigner({
          pubKey: p.pubKey,
          label: p.name,
          role: p.role,
          centre: p.centre,
          addedAt: p.createdAt,
        });
      }
      await deleteSecureItem(`${PRO_SK_PREFIX}${p.id}`);
    }
    activePro = null;
    await writeEnc(RESET_META_KEY, { resetAt: new Date().toISOString() });
    await writeEnc(LOCKOUT_KEY, { fails: 0, lockedUntil: 0 });
    return savePros([]);
  });

  if (await hasActivePatient()) {
    await addNote({ from: 'family', author: 'Familia', text: noteText });
  }
  return okPros;
}

// ---- Pauta de frecuencia semanal -------------------------------------------

export async function loadPlan(): Promise<FrequencyPlan> {
  const prefix = await activeFollowPrefix();
  if (!prefix) return {};
  return readEnc<FrequencyPlan>(k(STORAGE_KEYS.pautaFrecuencia, prefix), {});
}

export async function savePlan(counts: Partial<Record<FollowArea, number>>): Promise<boolean> {
  if (!activePro) return false;
  const prefix = await activeFollowPrefix();
  if (!prefix) return false;
  const key = k(STORAGE_KEYS.pautaFrecuencia, prefix);
  return withLock(key, async () => {
    const cur = await readEnc<FrequencyPlan>(key, {});
    const now = new Date().toISOString();
    const next: FrequencyPlan = {};
    for (const a of FOLLOW_AREAS) {
      const v = Math.max(0, Math.min(14, Math.round(counts[a] ?? 0)));
      if (!v) continue;
      const prev = cur[a];
      next[a] = prev && prev.perWeek === v
        ? prev
        : { perWeek: v, by: activePro!.name, role: activePro!.role, at: now };
    }
    const saved = await writeEnc(key, next);
    if (saved) planChangeListener?.();
    return saved;
  });
}

export const plannedAreas = (p: FrequencyPlan): FollowArea[] =>
  FOLLOW_AREAS.filter((a) => (p[a]?.perWeek ?? 0) > 0);

// ---- Registro de estimulación (solo fechas y áreas, un año) -----------------

export async function logStimulation(area: FollowArea, at = new Date()): Promise<boolean> {
  const prefix = await activeFollowPrefix();
  if (!prefix) return false;
  const key = k(STORAGE_KEYS.estimulacion, prefix);
  return withLock(key, async () => {
    const list = await readEnc<StimEvent[]>(key, []);
    const cutoff = at.getTime() - ONE_YEAR;
    const next = list.filter((e) => {
      const t = Date.parse(e.at);
      return Number.isFinite(t) && t >= cutoff;
    });
    next.push({ at: at.toISOString(), area });
    const saved = await writeEnc(key, next);
    if (saved) planChangeListener?.();
    return saved;
  });
}

export async function loadActivePlanProgress(
  areaLabels: Partial<Record<FollowArea, string>>,
): Promise<Array<{ areaLabel: string; done: number; planned: number }>> {
  const [plan, events] = await Promise.all([loadPlan(), loadStimulation()]);
  const rows = weeklySummary(events, plan, 1);
  const current = rows[0];
  if (!current) return [];
  return FOLLOW_AREAS
    .filter((a) => (plan[a]?.perWeek ?? 0) > 0)
    .map((a) => ({
      areaLabel: areaLabels[a] ?? a,
      done: current.byArea[a]?.done ?? 0,
      planned: plan[a]!.perWeek,
    }));
}

export async function loadStimulation(): Promise<StimEvent[]> {
  const prefix = await activeFollowPrefix();
  if (!prefix) return [];
  return readEnc<StimEvent[]>(k(STORAGE_KEYS.estimulacion, prefix), []);
}

const mondayOf = (d: Date) => {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() - ((r.getDay() + 6) % 7));
  return r;
};

export function weeklySummary(events: StimEvent[], plan: FrequencyPlan, weeks = 8, now = new Date()): WeekRow[] {
  const curMon = mondayOf(now);
  const rows: WeekRow[] = [];
  const parsed = events.map((e) => ({ area: e.area, t: Date.parse(e.at) })).filter((e) => Number.isFinite(e.t));
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(curMon);
    start.setDate(curMon.getDate() - i * 7);
    const from = start.getTime();
    const to = from + 7 * 86_400_000;
    const byArea: WeekRow['byArea'] = {};
    let done = 0;
    let planned = 0;
    for (const a of FOLLOW_AREAS) {
      const p = plan[a]?.perWeek ?? 0;
      const d = parsed.filter((e) => e.area === a && e.t >= from && e.t < to).length;
      if (p || d) byArea[a] = { done: d, planned: p };
      done += d;
      planned += p;
    }
    rows.push({ start, done, planned, byArea });
  }
  return rows;
}

// ---- Vínculos por paciente (`VALERIA-VINCULO1:`) ---------------------------

async function linksKey(): Promise<string | null> {
  const prefix = await activeFollowPrefix();
  return prefix ? k(LINKS_KEY_BASE, prefix) : null;
}

export async function listLinks(): Promise<PatientLink[]> {
  const lk = await linksKey();
  if (!lk) return [];
  const arr = await readEnc<PatientLink[]>(lk, []);
  return Array.isArray(arr) ? arr : [];
}

async function ensureLocalPatientLink(): Promise<{ link: PatientLink; linkKey: Uint8Array } | null> {
  const pid = await activePid();
  const lkKey = await linksKey();
  if (!pid || !lkKey) return null;

  return withLock(lkKey, async () => {
    const pidHash = pidHashForLink(pid);
    const links = await readEnc<PatientLink[]>(lkKey, []);
    let entry = links.find((l) => l.pidHash === pidHash);
    let rawKeyB64 = await getSecureItem(`${LINK_SK_PREFIX}${pidHash}`);
    let linkKeyBytes: Uint8Array;

    if (rawKeyB64 && b64UrlToBytes(rawKeyB64).length === 32) {
      linkKeyBytes = b64UrlToBytes(rawKeyB64);
    } else {
      linkKeyBytes = randomBytes(32);
      rawKeyB64 = bytesToB64Url(linkKeyBytes);
      await setSecureItem(`${LINK_SK_PREFIX}${pidHash}`, rawKeyB64);
    }

    const fam = await getOrCreateFamilyKeys();
    const myPubs: KnownSigner[] = [{
      pubKey: fam.pubKey,
      label: 'Familia',
      role: 'family',
      addedAt: new Date().toISOString(),
    }];
    if (activePro) {
      const res = await ensureProSigningKeys(activePro);
      activePro = res.pro;
      if (res.pro.pubKey) {
        myPubs.push({
          pubKey: res.pro.pubKey,
          label: res.pro.name,
          role: res.pro.role,
          centre: res.pro.centre,
          addedAt: new Date().toISOString(),
        });
      }
    }

    if (!entry) {
      entry = { pidHash, knownPubKeys: myPubs, createdAt: new Date().toISOString() };
      links.push(entry);
    } else {
      for (const s of myPubs) {
        if (!entry.knownPubKeys.some((x) => x.pubKey === s.pubKey)) entry.knownPubKeys.push(s);
      }
    }
    await writeEnc(lkKey, links);
    return { link: entry, linkKey: linkKeyBytes };
  });
}

export async function createLinkPayload(): Promise<{
  ok: boolean;
  code?: string;
  qrOk?: boolean;
  reason?: 'no_patient' | 'save_error';
}> {
  const res = await ensureLocalPatientLink();
  if (!res) return { ok: false, reason: 'no_patient' };

  let pubKey: string;
  let name = 'Familia';
  let role: ProRole | 'family' = 'family';
  let centre = '';

  if (activePro) {
    const keys = await ensureProSigningKeys(activePro);
    activePro = keys.pro;
    pubKey = keys.pro.pubKey!;
    name = keys.pro.name;
    role = keys.pro.role;
    centre = keys.pro.centre;
  } else {
    const fam = await getOrCreateFamilyKeys();
    pubKey = fam.pubKey;
  }

  const payload = {
    v: 1,
    pidHash: res.link.pidHash,
    linkKey: bytesToB64Url(res.linkKey),
    pubKey,
    name,
    role,
    centre,
  };
  const code = `${LINK_PREFIX}${bytesToB64Url(utf8ToBytes(JSON.stringify(payload)))}`;
  return { ok: true, code, qrOk: code.length <= MAX_QR_CHARS };
}

export async function importLinkCode(raw: string): Promise<{
  ok: boolean;
  label?: string;
  pidHash?: string;
  reason?: 'bad_format' | 'no_patient' | 'save_error';
}> {
  const lkKey = await linksKey();
  if (!lkKey) return { ok: false, reason: 'no_patient' };

  const clean = raw.replace(/\s+/g, '');
  if (!clean.startsWith(LINK_PREFIX)) return { ok: false, reason: 'bad_format' };

  let data: any;
  try {
    data = JSON.parse(bytesToUtf8(b64UrlToBytes(clean.slice(LINK_PREFIX.length))));
  } catch (e) {
    return { ok: false, reason: 'bad_format' };
  }

  if (!data || data.v !== 1 || typeof data.pidHash !== 'string' || typeof data.linkKey !== 'string' || typeof data.pubKey !== 'string') {
    return { ok: false, reason: 'bad_format' };
  }
  try {
    if (b64UrlToBytes(data.pidHash).length !== 16) return { ok: false, reason: 'bad_format' };
    if (b64UrlToBytes(data.linkKey).length !== 32) return { ok: false, reason: 'bad_format' };
    if (b64UrlToBytes(data.pubKey).length !== 32) return { ok: false, reason: 'bad_format' };
  } catch (e) {
    return { ok: false, reason: 'bad_format' };
  }

  const savedKey = await setSecureItem(`${LINK_SK_PREFIX}${data.pidHash}`, data.linkKey);
  if (!savedKey) return { ok: false, reason: 'save_error' };

  const signer: KnownSigner = {
    pubKey: data.pubKey,
    label: String(data.name || 'Profesional'),
    role: data.role,
    centre: typeof data.centre === 'string' ? data.centre : '',
    addedAt: new Date().toISOString(),
  };
  await recordKnownSigner(signer);

  const ok = await withLock(lkKey, async () => {
    const links = await readEnc<PatientLink[]>(lkKey, []);
    let entry = links.find((l) => l.pidHash === data.pidHash);
    if (!entry) {
      entry = { pidHash: data.pidHash, knownPubKeys: [signer], createdAt: new Date().toISOString() };
      links.push(entry);
    } else {
      const idx = entry.knownPubKeys.findIndex((s) => s.pubKey === signer.pubKey);
      if (idx >= 0) entry.knownPubKeys[idx] = signer;
      else entry.knownPubKeys.push(signer);
    }
    return writeEnc(lkKey, links);
  });

  return ok ? { ok: true, label: signer.label, pidHash: data.pidHash } : { ok: false, reason: 'save_error' };
}

// ---- Notas en dos sentidos (P3.3, P3.5) ------------------------------------

export async function loadNotes(): Promise<FollowNote[]> {
  const prefix = await activeFollowPrefix();
  if (!prefix) return [];
  return readEnc<FollowNote[]>(k(STORAGE_KEYS.notasSeguimiento, prefix), []);
}

export async function addNote(
  n: Omit<FollowNote, 'id' | 'at' | 'pubKey' | 'sig' | 'verified' | 'postReset'>,
): Promise<boolean> {
  const text = n.text.trim();
  if (!text) return false;
  const prefix = await activeFollowPrefix();
  if (!prefix) return false;
  const key = k(STORAGE_KEYS.notasSeguimiento, prefix);

  let pubKey: string | undefined;
  let sig: string | undefined;
  let postReset = await hasPostResetState();
  const id = randomHex(12);
  const at = new Date().toISOString();

  if (n.from === 'pro' && activePro) {
    const keys = await ensureProSigningKeys(activePro);
    activePro = keys.pro;
    pubKey = keys.pro.pubKey;
    postReset = Boolean(keys.pro.postReset) || postReset;
    sig = signPayload(keys.skB64, `note|${id}|${at}|${n.author}|${text}`);
  } else {
    const fam = await getOrCreateFamilyKeys();
    pubKey = fam.pubKey;
    sig = signPayload(fam.skB64, `note|${id}|${at}|${n.author}|${text}`);
  }

  return withLock(key, async () => {
    const list = await readEnc<FollowNote[]>(key, []);
    list.push({
      ...n,
      text,
      id,
      at,
      pubKey,
      sig,
      verified: true,
      ...(postReset ? { postReset: true } : {}),
    });
    return writeEnc(key, list.slice(-200));
  });
}

async function resolvePreferredLinkForSend(): Promise<{ pidHash: string; linkKey: Uint8Array } | null> {
  const links = await listLinks();
  // Usa primero un vínculo externo importado (p.ej. del otro dispositivo en consulta) o el propio del paciente.
  const pid = await activePid();
  if (!pid) return null;
  const ownHash = pidHashForLink(pid);
  const candidate = links.find((l) => l.pidHash !== ownHash) ?? links.find((l) => l.pidHash === ownHash);
  if (candidate) {
    const rawKey = await getSecureItem(`${LINK_SK_PREFIX}${candidate.pidHash}`);
    if (rawKey && b64UrlToBytes(rawKey).length === 32) {
      return { pidHash: candidate.pidHash, linkKey: b64UrlToBytes(rawKey) };
    }
  }
  const local = await ensureLocalPatientLink();
  return local ? { pidHash: local.link.pidHash, linkKey: local.linkKey } : null;
}

export async function exportSignedNoteCode(params: {
  text: string;
  from: 'pro' | 'family';
  author: string;
  role?: ProRole;
  centre?: string;
}): Promise<{ ok: boolean; code?: string; url?: string; qrOk?: boolean; reason?: 'no_patient' | 'empty' | 'save_error' }> {
  const text = params.text.trim();
  if (!text) return { ok: false, reason: 'empty' };
  const linkInfo = await resolvePreferredLinkForSend();
  if (!linkInfo) return { ok: false, reason: 'no_patient' };

  const id = randomHex(12);
  const at = new Date().toISOString();
  let pubKey = '';
  let skB64 = '';
  let postReset = await hasPostResetState();

  if (params.from === 'pro' && activePro) {
    const keys = await ensureProSigningKeys(activePro);
    activePro = keys.pro;
    pubKey = keys.pro.pubKey!;
    skB64 = keys.skB64;
    postReset = Boolean(keys.pro.postReset) || postReset;
  } else {
    const fam = await getOrCreateFamilyKeys();
    pubKey = fam.pubKey;
    skB64 = fam.skB64;
  }

  const innerPayload = {
    id,
    from: params.from,
    author: params.author,
    ...(params.role ? { role: params.role } : {}),
    ...(params.centre ? { centre: params.centre } : {}),
    text,
    at,
    pubKey,
    ...(postReset ? { postReset: true } : {}),
  };

  const nonce = randomBytes(24);
  const ct = xchacha20poly1305(linkInfo.linkKey, nonce).encrypt(utf8ToBytes(JSON.stringify(innerPayload)));
  const nonceB64 = bytesToB64Url(nonce);
  const ctB64 = bytesToB64Url(ct);
  const ver = 2;
  const sig = signPayload(skB64, `${ver}|${linkInfo.pidHash}|${nonceB64}|${ctB64}`);

  const envelope = { ver, pidHash: linkInfo.pidHash, nonce: nonceB64, ct: ctB64, sig };
  const code = `${NOTE2_PREFIX}${bytesToB64Url(utf8ToBytes(JSON.stringify(envelope)))}`;
  const url = `${NOTE_URL_PREFIX}${encodeURIComponent(code)}`;

  // Registra la nota en el aparato origen con el mismo id para evitar duplicados al reimportar.
  const prefix = await activeFollowPrefix();
  if (prefix) {
    const notesKey = k(STORAGE_KEYS.notasSeguimiento, prefix);
    await withLock(notesKey, async () => {
      const list = await readEnc<FollowNote[]>(notesKey, []);
      if (!list.some((x) => x.id === id)) {
        list.push({
          ...innerPayload,
          sig,
          verified: true,
        });
        await writeEnc(notesKey, list.slice(-200));
      }
    });
  }

  return { ok: true, code, url, qrOk: code.length <= MAX_QR_CHARS };
}

/** Compatibilidad con llamador anterior; usa `exportSignedNoteCode` cuando hay paciente. */
export async function encodeNoteCode(text: string): Promise<string | null> {
  if (!activePro || !text.trim()) return null;
  const res = await exportSignedNoteCode({
    text,
    from: 'pro',
    author: activePro.name,
    role: activePro.role,
    centre: activePro.centre,
  });
  return res.code ?? null;
}

export async function markFamilyNotesReviewed(): Promise<{
  ok: boolean;
  count: number;
  receiptCode?: string;
  receiptUrl?: string;
  qrOk?: boolean;
}> {
  if (!activePro) return { ok: false, count: 0 };
  const prefix = await activeFollowPrefix();
  if (!prefix) return { ok: false, count: 0 };
  const key = k(STORAGE_KEYS.notasSeguimiento, prefix);
  const now = new Date().toISOString();
  const reviewedIds: string[] = [];

  const ok = await withLock(key, async () => {
    const list = await readEnc<FollowNote[]>(key, []);
    let changed = false;
    const next = list.map((n) => {
      if (n.from === 'family' && !n.reviewedAt) {
        changed = true;
        reviewedIds.push(n.id);
        return { ...n, reviewedAt: now, reviewedBy: activePro!.name };
      }
      return n;
    });
    return changed ? writeEnc(key, next) : true;
  });

  if (!ok) return { ok: false, count: 0 };
  if (reviewedIds.length === 0) return { ok: true, count: 0 };

  const linkInfo = await resolvePreferredLinkForSend();
  if (!linkInfo) return { ok: true, count: reviewedIds.length };

  const keys = await ensureProSigningKeys(activePro);
  activePro = keys.pro;

  const inner = {
    noteIds: reviewedIds,
    reviewedBy: keys.pro.name,
    role: keys.pro.role,
    centre: keys.pro.centre,
    reviewedAt: now,
    pubKey: keys.pro.pubKey!,
  };
  const nonce = randomBytes(24);
  const ct = xchacha20poly1305(linkInfo.linkKey, nonce).encrypt(utf8ToBytes(JSON.stringify(inner)));
  const nonceB64 = bytesToB64Url(nonce);
  const ctB64 = bytesToB64Url(ct);
  const sig = signPayload(keys.skB64, `2|${linkInfo.pidHash}|${nonceB64}|${ctB64}`);
  const receiptCode = `${RECEIPT2_PREFIX}${bytesToB64Url(utf8ToBytes(JSON.stringify({
    ver: 2,
    pidHash: linkInfo.pidHash,
    nonce: nonceB64,
    ct: ctB64,
    sig,
  })))}`;

  return {
    ok: true,
    count: reviewedIds.length,
    receiptCode,
    receiptUrl: `${NOTE_URL_PREFIX}${encodeURIComponent(receiptCode)}`,
    qrOk: receiptCode.length <= MAX_QR_CHARS,
  };
}

export async function exportSignedPlanCode(
  counts: Partial<Record<FollowArea, number>>,
): Promise<{ ok: boolean; code?: string; qrOk?: boolean; reason?: 'no_pro' | 'no_patient' | 'no_link' | 'empty_plan' }> {
  if (!activePro) return { ok: false, reason: 'no_pro' };
  const pid = await activePid();
  if (!pid) return { ok: false, reason: 'no_patient' };

  const linkInfo = await resolvePreferredLinkForSend();
  if (!linkInfo) return { ok: false, reason: 'no_link' };

  const cleanCounts: Partial<Record<FollowArea, number>> = {};
  for (const a of FOLLOW_AREAS) {
    const v = Math.max(0, Math.min(14, Math.round(counts[a] ?? 0)));
    if (v > 0) cleanCounts[a] = v;
  }
  if (!Object.keys(cleanCounts).length) return { ok: false, reason: 'empty_plan' };

  const keys = await ensureProSigningKeys(activePro);
  activePro = keys.pro;
  const resetMeta = await readEnc<{ resetAt?: string } | null>(RESET_META_KEY, null);
  const postReset = Boolean(keys.pro.postReset && resetMeta?.resetAt);
  const now = new Date().toISOString();

  const inner = {
    ver: 2,
    counts: cleanCounts,
    by: keys.pro.name,
    role: keys.pro.role,
    centre: keys.pro.centre,
    at: now,
    pubKey: keys.pro.pubKey!,
    ...(postReset ? { postReset: true } : {}),
  };

  const nonce = randomBytes(24);
  const ct = xchacha20poly1305(linkInfo.linkKey, nonce).encrypt(utf8ToBytes(JSON.stringify(inner)));
  const nonceB64 = bytesToB64Url(nonce);
  const ctB64 = bytesToB64Url(ct);
  const sig = signPayload(keys.skB64, `2|${linkInfo.pidHash}|${nonceB64}|${ctB64}`);
  const code = `${PAUTA2_PREFIX}${bytesToB64Url(utf8ToBytes(JSON.stringify({
    ver: 2,
    pidHash: linkInfo.pidHash,
    nonce: nonceB64,
    ct: ctB64,
    sig,
  })))}`;

  return { ok: true, code, qrOk: code.length <= MAX_QR_CHARS };
}

export function extractNoteCodeFromInput(raw: string): string {
  const trimmed = raw.trim();
  const idx = trimmed.indexOf('valeria://nota');
  if (idx >= 0) {
    const qMatch = trimmed.slice(idx).match(/[?&]c=([^&\s]+)/i);
    if (qMatch && qMatch[1]) {
      try { return decodeURIComponent(qMatch[1]).replace(/\s+/g, ''); } catch (e) { /* continue */ }
    }
  }
  return trimmed.replace(/\s+/g, '');
}

async function resolveLinkKeyForImport(pidHash: string): Promise<{ link: PatientLink | null; linkKey: Uint8Array | null }> {
  const pid = await activePid();
  if (!pid) return { link: null, linkKey: null };
  const links = await listLinks();
  const ownHash = pidHashForLink(pid);
  const match = links.find((l) => l.pidHash === pidHash) ?? (pidHash === ownHash ? { pidHash: ownHash, knownPubKeys: [], createdAt: '' } : null);
  if (!match) return { link: null, linkKey: null };
  const rawKey = await getSecureItem(`${LINK_SK_PREFIX}${pidHash}`);
  if (!rawKey) return { link: match, linkKey: null };
  const linkKey = b64UrlToBytes(rawKey);
  return { link: match, linkKey: linkKey.length === 32 ? linkKey : null };
}

async function isTrustedSigner(link: PatientLink, pubKey: string): Promise<boolean> {
  if (link.knownPubKeys.some((s) => s.pubKey === pubKey)) return true;
  const knownMap = await getKnownSignersMap();
  if (knownMap[pubKey]) return true;
  const pros = await listPros();
  if (pros.some((p) => p.pubKey === pubKey)) return true;
  const famPub = await readEnc<string | null>(FAMILY_PUB_KEY, null);
  if (famPub && famPub === pubKey) return true;
  return false;
}

export async function importNoteCodeDetailed(raw: string): Promise<ImportCodeResult> {
  const prefix = await activeFollowPrefix();
  if (!prefix) return { ok: false, reason: 'no_patient' };

  const clean = extractNoteCodeFromInput(raw);
  if (!clean) return { ok: false, reason: 'bad_format' };

  // 1) Código v2 cifrado y firmado (VALERIA-NOTA2:)
  if (clean.startsWith(NOTE2_PREFIX)) {
    let env: any;
    try {
      env = JSON.parse(bytesToUtf8(b64UrlToBytes(clean.slice(NOTE2_PREFIX.length))));
    } catch (e) {
      return { ok: false, reason: 'bad_format' };
    }
    if (!env || env.ver !== 2 || typeof env.pidHash !== 'string' || typeof env.nonce !== 'string' || typeof env.ct !== 'string' || typeof env.sig !== 'string') {
      return { ok: false, reason: 'bad_format' };
    }

    const { link, linkKey } = await resolveLinkKeyForImport(env.pidHash);
    if (!link || !linkKey) return { ok: false, reason: 'wrong_patient' };

    let inner: any;
    try {
      const nonce = b64UrlToBytes(env.nonce);
      const ct = b64UrlToBytes(env.ct);
      if (nonce.length !== 24 || ct.length < 16) return { ok: false, reason: 'unverified' };
      const plain = xchacha20poly1305(linkKey, nonce).decrypt(ct);
      inner = JSON.parse(bytesToUtf8(plain));
    } catch (e) {
      return { ok: false, reason: 'unverified' };
    }

    if (!inner || !inner.id || !inner.text || !inner.author || !inner.pubKey) {
      return { ok: false, reason: 'unverified' };
    }
    const trusted = await isTrustedSigner(link, inner.pubKey);
    const sigOk = trusted && verifyPayload(inner.pubKey, `2|${env.pidHash}|${env.nonce}|${env.ct}`, env.sig);
    if (!sigOk) return { ok: false, reason: 'unverified' };

    const notesKey = k(STORAGE_KEYS.notasSeguimiento, prefix);
    let duplicate = false;
    const saved = await withLock(notesKey, async () => {
      const list = await readEnc<FollowNote[]>(notesKey, []);
      if (list.some((x) => x.id === inner.id)) {
        duplicate = true;
        return true;
      }
      list.push({
        id: String(inner.id),
        from: inner.from === 'family' ? 'family' : 'pro',
        author: String(inner.author),
        ...(inner.role ? { role: inner.role } : {}),
        ...(inner.centre ? { centre: String(inner.centre) } : {}),
        text: String(inner.text),
        at: String(inner.at || new Date().toISOString()),
        imported: true,
        pubKey: String(inner.pubKey),
        sig: env.sig,
        verified: true,
        ...(inner.postReset ? { postReset: true } : {}),
      });
      return writeEnc(notesKey, list.slice(-200));
    });

    if (!saved) return { ok: false, reason: 'save_error' };
    return {
      ok: true,
      kind: 'note',
      status: 'verified',
      duplicate,
      author: String(inner.author),
      centre: inner.centre ? String(inner.centre) : '',
      postReset: Boolean(inner.postReset),
    };
  }

  // 1b) Pauta de frecuencia firmada (VALERIA-PAUTA2:)
  if (clean.startsWith(PAUTA2_PREFIX)) {
    let env: any;
    try {
      env = JSON.parse(bytesToUtf8(b64UrlToBytes(clean.slice(PAUTA2_PREFIX.length))));
    } catch (e) {
      return { ok: false, reason: 'bad_format' };
    }
    if (!env || env.ver !== 2 || typeof env.pidHash !== 'string' || typeof env.nonce !== 'string' || typeof env.ct !== 'string' || typeof env.sig !== 'string') {
      return { ok: false, reason: 'bad_format' };
    }

    const { link, linkKey } = await resolveLinkKeyForImport(env.pidHash);
    if (!link || !linkKey) return { ok: false, reason: 'wrong_patient' };

    let inner: any;
    try {
      const nonce = b64UrlToBytes(env.nonce);
      const ct = b64UrlToBytes(env.ct);
      if (nonce.length !== 24 || ct.length < 16) return { ok: false, reason: 'unverified' };
      const plain = xchacha20poly1305(linkKey, nonce).decrypt(ct);
      inner = JSON.parse(bytesToUtf8(plain));
    } catch (e) {
      return { ok: false, reason: 'unverified' };
    }

    if (!inner || typeof inner.counts !== 'object' || !inner.counts || !inner.by || !inner.pubKey) {
      return { ok: false, reason: 'unverified' };
    }
    const trusted = await isTrustedSigner(link, inner.pubKey);
    const sigOk = trusted && verifyPayload(inner.pubKey, `2|${env.pidHash}|${env.nonce}|${env.ct}`, env.sig);
    if (!sigOk) return { ok: false, reason: 'unverified' };

    const planKey = k(STORAGE_KEYS.pautaFrecuencia, prefix);
    const at = String(inner.at || new Date().toISOString());
    const role: ProRole = inner.role === 'orl' || inner.role === 'atencion' || inner.role === 'otro' ? inner.role : 'logopeda';
    const nextPlan: FrequencyPlan = {};
    for (const a of FOLLOW_AREAS) {
      const rawVal = Number(inner.counts[a] ?? 0);
      const v = Math.max(0, Math.min(14, Math.round(Number.isFinite(rawVal) ? rawVal : 0)));
      if (v > 0) nextPlan[a] = { perWeek: v, by: String(inner.by), role, at };
    }
    const saved = await withLock(planKey, () => writeEnc(planKey, nextPlan));
    if (!saved) return { ok: false, reason: 'save_error' };
    planChangeListener?.();
    return {
      ok: true,
      kind: 'plan',
      status: 'verified',
      author: String(inner.by),
      centre: inner.centre ? String(inner.centre) : '',
      postReset: Boolean(inner.postReset),
    };
  }

  // 2) Acuse de lectura firmado (VALERIA-LEIDO2:)
  if (clean.startsWith(RECEIPT2_PREFIX)) {
    let env: any;
    try {
      env = JSON.parse(bytesToUtf8(b64UrlToBytes(clean.slice(RECEIPT2_PREFIX.length))));
    } catch (e) {
      return { ok: false, reason: 'bad_format' };
    }
    if (!env || env.ver !== 2 || typeof env.pidHash !== 'string' || typeof env.nonce !== 'string' || typeof env.ct !== 'string' || typeof env.sig !== 'string') {
      return { ok: false, reason: 'bad_format' };
    }

    const { link, linkKey } = await resolveLinkKeyForImport(env.pidHash);
    if (!link || !linkKey) return { ok: false, reason: 'wrong_patient' };

    let inner: any;
    try {
      const nonce = b64UrlToBytes(env.nonce);
      const ct = b64UrlToBytes(env.ct);
      if (nonce.length !== 24 || ct.length < 16) return { ok: false, reason: 'unverified' };
      inner = JSON.parse(bytesToUtf8(xchacha20poly1305(linkKey, nonce).decrypt(ct)));
    } catch (e) {
      return { ok: false, reason: 'unverified' };
    }

    if (!inner || !Array.isArray(inner.noteIds) || !inner.reviewedBy || !inner.pubKey) {
      return { ok: false, reason: 'unverified' };
    }
    const trusted = await isTrustedSigner(link, inner.pubKey);
    const sigOk = trusted && verifyPayload(inner.pubKey, `2|${env.pidHash}|${env.nonce}|${env.ct}`, env.sig);
    if (!sigOk) return { ok: false, reason: 'unverified' };

    const idsSet = new Set<string>(inner.noteIds.map(String));
    const notesKey = k(STORAGE_KEYS.notasSeguimiento, prefix);
    let updatedCount = 0;
    const saved = await withLock(notesKey, async () => {
      const list = await readEnc<FollowNote[]>(notesKey, []);
      const next = list.map((n) => {
        if (idsSet.has(n.id) && !n.reviewedAt) {
          updatedCount++;
          return { ...n, reviewedAt: String(inner.reviewedAt || new Date().toISOString()), reviewedBy: String(inner.reviewedBy) };
        }
        return n;
      });
      return updatedCount > 0 ? writeEnc(notesKey, next) : true;
    });

    if (!saved) return { ok: false, reason: 'save_error' };
    return {
      ok: true,
      kind: 'receipt',
      status: 'verified',
      reviewedBy: String(inner.reviewedBy),
      reviewedAt: String(inner.reviewedAt || new Date().toISOString()),
      count: updatedCount,
    };
  }

  // 3) Compatibilidad temporal con código v1 heredado (formato antiguo, no verificada)
  if (clean.startsWith(NOTE1_PREFIX)) {
    try {
      const b64 = clean.slice(NOTE1_PREFIX.length);
      const decoded = JSON.parse(bytesToUtf8(b64UrlToBytes(b64)));
      if (!decoded?.t || !decoded?.by) return { ok: false, reason: 'bad_format' };
      const notesKey = k(STORAGE_KEYS.notasSeguimiento, prefix);
      const at = String(decoded.at || new Date().toISOString());
      const id = `legacy_${sha256Hex(`${decoded.by}|${at}|${decoded.t}`).slice(0, 16)}`;
      let duplicate = false;
      const saved = await withLock(notesKey, async () => {
        const list = await readEnc<FollowNote[]>(notesKey, []);
        if (list.some((x) => x.id === id)) {
          duplicate = true;
          return true;
        }
        list.push({
          id,
          from: 'pro',
          author: String(decoded.by),
          role: decoded.r,
          centre: decoded.c ? String(decoded.c) : '',
          text: String(decoded.t),
          at,
          imported: true,
          verified: false,
          legacyFormat: true,
        });
        return writeEnc(notesKey, list.slice(-200));
      });
      if (!saved) return { ok: false, reason: 'save_error' };
      return {
        ok: true,
        kind: 'note',
        status: 'legacy_unverified',
        duplicate,
        author: String(decoded.by),
      };
    } catch (e) {
      return { ok: false, reason: 'bad_format' };
    }
  }

  return { ok: false, reason: 'bad_format' };
}

export async function importNoteCode(code: string): Promise<boolean> {
  const res = await importNoteCodeDetailed(code);
  return res.ok;
}

// ---- Consentimiento para compartir con otros centros (P3.3, P3.7) ----------

export async function loadConsent(): Promise<ShareConsent> {
  const prefix = await activeFollowPrefix();
  if (!prefix) return { granted: false, at: '', log: [] };
  return readEnc<ShareConsent>(k(STORAGE_KEYS.compartirConsentimiento, prefix), { granted: false, at: '', log: [] });
}

export async function setConsent(granted: boolean): Promise<{ ok: boolean; consent: ShareConsent }> {
  const prefix = await activeFollowPrefix();
  if (!prefix) return { ok: false, consent: { granted: false, at: '', log: [] } };
  const key = k(STORAGE_KEYS.compartirConsentimiento, prefix);
  return withLock(key, async () => {
    const cur = await readEnc<ShareConsent>(key, { granted: false, at: '', log: [] });
    const at = new Date().toISOString();
    const next: ShareConsent = { granted, at, log: [...cur.log.slice(-49), { at, granted }] };
    const ok = await writeEnc(key, next);
    return { ok, consent: ok ? next : cur };
  });
}

// ---- Exportación e importación cifrada de paciente `.valeria` (P3.6) --------

export interface PatientExportBundle {
  v: 1;
  exportedAt: string;
  patient: PatientRecord;
  historial: unknown[];
  ling: unknown[];
  plan: FrequencyPlan;
  stimulation: StimEvent[];
  notes: FollowNote[];
  consent: ShareConsent;
  linksPublic: PatientLink[];
}

export async function exportPatientBundle(passphrase: string): Promise<{
  ok: boolean;
  data?: string;
  filename?: string;
  reason?: 'no_patient' | 'short_passphrase' | 'error';
}> {
  const patient = await readActivePatient();
  if (!patient?.pid) return { ok: false, reason: 'no_patient' };
  if (passphrase.trim().length < 6) return { ok: false, reason: 'short_passphrase' };

  try {
    const [historial, ling, plan, stimulation, notes, consent, linksPublic] = await Promise.all([
      readSessionHistory(),
      readLingHistory(),
      loadPlan(),
      loadStimulation(),
      loadNotes(),
      loadConsent(),
      listLinks(),
    ]);

    const bundle: PatientExportBundle = {
      v: 1,
      exportedAt: new Date().toISOString(),
      patient,
      historial,
      ling,
      plan,
      stimulation,
      notes,
      consent,
      linksPublic,
    };
    const sealed = await sealWithPassphrase(bundle, passphrase);
    const safeName = (patient.nombre || patient.nhc || 'perfil')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/^-|-$/g, '') || 'perfil';
    return { ok: true, data: sealed, filename: `${safeName}.valeria` };
  } catch (e) {
    return { ok: false, reason: 'error' };
  }
}

export async function importPatientBundle(raw: string, passphrase: string): Promise<{
  ok: boolean;
  patientName?: string;
  reason?: 'bad_format' | 'bad_passphrase' | 'save_error';
}> {
  if (!raw.trim().startsWith('VALERIA-EXPORT1:')) return { ok: false, reason: 'bad_format' };
  const bundle = await openWithPassphrase<PatientExportBundle>(raw, passphrase);
  if (!bundle || bundle.v !== 1 || !bundle.patient || typeof bundle.patient !== 'object') {
    return { ok: false, reason: 'bad_passphrase' };
  }

  const incoming: PatientRecord = {
    ...bundle.patient,
    pid: bundle.patient.pid && bundle.patient.pid.length >= 16 ? bundle.patient.pid : randomHex(16),
  };
  const prefix = followKeyPrefixForPid(incoming.pid!);

  try {
    const okPatient = (await saveActivePatient(incoming)).ok;
    const list = await readPatientsList();
    const idx = list.findIndex((p) => p.pid === incoming.pid);
    if (idx >= 0) list[idx] = incoming;
    else list.push(incoming);
    const okList = await savePatientsList(list);

    const okPlan = await writeEnc(k(STORAGE_KEYS.pautaFrecuencia, prefix), bundle.plan ?? {});
    const okStim = await writeEnc(k(STORAGE_KEYS.estimulacion, prefix), Array.isArray(bundle.stimulation) ? bundle.stimulation : []);
    const okNotes = await writeEnc(k(STORAGE_KEYS.notasSeguimiento, prefix), Array.isArray(bundle.notes) ? bundle.notes : []);
    const okConsent = await writeEnc(
      k(STORAGE_KEYS.compartirConsentimiento, prefix),
      bundle.consent ?? { granted: false, at: '', log: [] },
    );
    const okHist = await writeEncryptedJSON(
      STORAGE_KEYS.historial,
      Array.isArray(bundle.historial) ? bundle.historial : [],
    );
    const okLing = await writeEncryptedJSON(
      STORAGE_KEYS.ling,
      Array.isArray(bundle.ling) ? bundle.ling : [],
    );
    if (Array.isArray(bundle.linksPublic) && bundle.linksPublic.length) {
      await writeEnc(k(LINKS_KEY_BASE, prefix), bundle.linksPublic);
      for (const l of bundle.linksPublic) {
        for (const s of l.knownPubKeys || []) await recordKnownSigner(s);
      }
    }

    if (!okPatient || !okList || !okPlan || !okStim || !okNotes || !okConsent || !okHist || !okLing) {
      return { ok: false, reason: 'save_error' };
    }
    return { ok: true, patientName: incoming.nombre || incoming.nhc || 'Perfil' };
  } catch (e) {
    return { ok: false, reason: 'save_error' };
  }
}

const escHtml = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export interface ConsultationReportStrings {
  title: string;
  generatedLabel: string;
  planTitle: string;
  adherenceTitle: string;
  notesTitle: string;
  resultsTitle: string;
  lingTitle: string;
  noData: string;
  familyTag: string;
  proTag: string;
  footer: string;
  areas: Record<FollowArea, string>;
}

export async function buildConsultationReportHtml(
  labels: ConsultationReportStrings,
  includeFamilyNotes = false,
): Promise<{ ok: boolean; html?: string; reason?: 'no_patient' | 'no_consent' }> {
  const [patient, consent] = await Promise.all([readActivePatient(), loadConsent()]);
  if (!patient?.pid) return { ok: false, reason: 'no_patient' };
  if (!consent.granted) return { ok: false, reason: 'no_consent' };

  const [plan, events, notes, historialRaw, lingRaw] = await Promise.all([
    loadPlan(),
    loadStimulation(),
    loadNotes(),
    readSessionHistory(),
    readLingHistory(),
  ]);

  const rows = weeklySummary(events, plan, 8);
  const visibleNotes = notes.filter((n) => includeFamilyNotes || n.from === 'pro');
  const historial = Array.isArray(historialRaw) ? historialRaw.slice(-15) : [];
  const ling = Array.isArray(lingRaw) ? lingRaw.slice(-10) : [];

  const planRows = FOLLOW_AREAS
    .filter((a) => plan[a]?.perWeek)
    .map((a) => `<tr><td>${escHtml(labels.areas[a])}</td><td>${escHtml(plan[a]!.perWeek)} / sem</td><td>${escHtml(plan[a]!.by)} (${escHtml(String(plan[a]!.at).slice(0, 10))})</td></tr>`)
    .join('');

  const weekRows = rows
    .map((r) => `<tr><td>${escHtml(r.start.toISOString().slice(0, 10))}</td><td>${r.done}</td><td>${r.planned}</td></tr>`)
    .join('');

  const noteRows = visibleNotes
    .map((n) => {
      const tag = n.from === 'family' ? labels.familyTag : labels.proTag;
      return `<li><strong>${escHtml(tag)} ${escHtml(n.author)}</strong> (${escHtml(String(n.at).slice(0, 10))}): ${escHtml(n.text)}</li>`;
    })
    .join('');

  const histRows = historial
    .map((h) => {
      const item = h as { date?: string; name?: string; avg?: number; note?: string };
      return `<tr><td>${escHtml(item.date)}</td><td>${escHtml(item.name)}</td><td>${escHtml(item.avg ?? '')}</td><td>${escHtml(item.note)}</td></tr>`;
    })
    .join('');

  const lingRows = ling
    .map((l) => {
      const item = l as { date?: string; identificados?: number; detectados?: number; total?: number };
      return `<li>${escHtml(item.date)}: ${escHtml(item.identificados ?? 0)}/${escHtml(item.total ?? 6)}</li>`;
    })
    .join('');

  const profileLabel = patient.nombre || patient.nhc || 'Perfil';
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escHtml(labels.title)}</title>
<style>
  body { font-family: system-ui, -apple-system, sans-serif; color: #16302f; max-width: 760px; margin: 24px auto; padding: 0 16px; line-height: 1.45; }
  h1 { color: #00756f; font-size: 20px; margin-bottom: 4px; }
  h2 { color: #00756f; font-size: 15px; margin-top: 22px; border-bottom: 1px solid #d6eceb; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
  th, td { border: 1px solid #d6eceb; padding: 6px 8px; text-align: left; }
  th { background: #e6f9f8; }
  .meta { font-size: 12px; color: #4b6867; }
  .foot { margin-top: 28px; font-size: 11px; color: #5b7574; border-top: 1px solid #e2e8f0; padding-top: 8px; }
</style>
</head>
<body>
  <h1>${escHtml(labels.title)}</h1>
  <div class="meta">${escHtml(profileLabel)} · ${escHtml(labels.generatedLabel)} ${escHtml(new Date().toISOString().slice(0, 10))}</div>
  <h2>${escHtml(labels.planTitle)}</h2>
  ${planRows ? `<table><thead><tr><th>Area</th><th>Meta</th><th>Autor</th></tr></thead><tbody>${planRows}</tbody></table>` : `<p>${escHtml(labels.noData)}</p>`}
  <h2>${escHtml(labels.adherenceTitle)}</h2>
  <table><thead><tr><th>Semana</th><th>Realizadas</th><th>Meta</th></tr></thead><tbody>${weekRows}</tbody></table>
  <h2>${escHtml(labels.notesTitle)}</h2>
  ${noteRows ? `<ul>${noteRows}</ul>` : `<p>${escHtml(labels.noData)}</p>`}
  <h2>${escHtml(labels.resultsTitle)}</h2>
  ${histRows ? `<table><thead><tr><th>Fecha</th><th>Actividad</th><th>Media</th><th>Nota</th></tr></thead><tbody>${histRows}</tbody></table>` : `<p>${escHtml(labels.noData)}</p>`}
  <h2>${escHtml(labels.lingTitle)}</h2>
  ${lingRows ? `<ul>${lingRows}</ul>` : `<p>${escHtml(labels.noData)}</p>`}
  <p class="foot">${escHtml(labels.footer)}</p>
</body>
</html>`;

  return { ok: true, html };
}

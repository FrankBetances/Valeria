#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de PIN profesional sin maestro y bloqueo persistido (P3.4)
 *   node scripts/check-pro-pin.js
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Module = require('module');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };
const ok = (msg) => console.log('  ✓ ' + msg);

// 1. Comprobación de que no queda el PIN maestro legado en src/, docs/*.html ni docs/*.md vivos
const forbidden = /\b1985\b/;
const legacyConst = /MASTER_PIN_HASH/;

const scanFiles = [];
const walkSrc = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkSrc(p);
    else if (/\.(ts|tsx)$/.test(e.name)) scanFiles.push(p);
  }
};
walkSrc(path.join(ROOT, 'src'));
for (const f of fs.readdirSync(path.join(ROOT, 'docs'))) {
  if (/\.html$/.test(f)) scanFiles.push(path.join(ROOT, 'docs', f));
  if (/\.md$/.test(f) && !/^PLAN-/.test(f)) scanFiles.push(path.join(ROOT, 'docs', f));
}

const hits = [];
for (const f of scanFiles) {
  const txt = fs.readFileSync(f, 'utf8');
  if (forbidden.test(txt) || legacyConst.test(txt)) hits.push(path.relative(ROOT, f));
}
if (hits.length) fallo(`queda rastro de PIN maestro o PIN de demo en: ${hits.join(', ')}`);
else ok('cero apariciones de PIN de demostración / MASTER_PIN_HASH en src/, docs/*.html y docs/*.md');

// 2. Simulación en memoria de valeriaFollowUp para verificar PBKDF2, bloqueo progresivo y reset
const asyncMem = new Map();
const secureMem = new Map();
const origLoad = Module._load;
const tsCache = new Map();

const stubs = {
  'react-native': { Platform: { OS: 'android' } },
  '@react-native-async-storage/async-storage': {
    __esModule: true,
    default: {
      getItem: async (k) => (asyncMem.has(k) ? asyncMem.get(k) : null),
      setItem: async (k, v) => { asyncMem.set(k, String(v)); },
      removeItem: async (k) => { asyncMem.delete(k); },
    },
  },
  'expo-secure-store': {
    getItemAsync: async (k) => (secureMem.has(k) ? secureMem.get(k) : null),
    setItemAsync: async (k, v) => { secureMem.set(k, String(v)); },
    deleteItemAsync: async (k) => { secureMem.delete(k); },
  },
  'expo-crypto': {
    getRandomBytes: (len) => new Uint8Array(crypto.randomBytes(len)),
  },
};

function loadTsFixed(absFile) {
  if (tsCache.has(absFile)) return tsCache.get(absFile).exports;
  const compiled = ts.transpileModule(fs.readFileSync(absFile, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const m = new Module(absFile, null);
  m.filename = absFile;
  m.paths = Module._nodeModulePaths(path.dirname(absFile));
  tsCache.set(absFile, m);
  m._compile(compiled, absFile);
  return m.exports;
}

Module._load = function (req, parent) {
  if (stubs[req]) return stubs[req];
  if (parent && (req.startsWith('./') || req.startsWith('../'))) {
    const base = path.resolve(path.dirname(parent.filename), req);
    for (const ext of ['.ts', '.tsx']) {
      if (fs.existsSync(base + ext)) return loadTsFixed(base + ext);
    }
  }
  return origLoad.apply(this, arguments);
};

(async () => {
  const patients = loadTsFixed(path.join(ROOT, 'src', 'valeriaPatients.ts'));
  const follow = loadTsFixed(path.join(ROOT, 'src', 'valeriaFollowUp.ts'));

  await patients.saveActivePatient({ nombre: 'Test', nhc: 'H1' });

  // Sin profesionales dados de alta, ningún PIN abre
  const noProRes = await follow.verifyPin('0000');
  if (noProRes !== null) fallo('verifyPin abrió sin profesionales registrados');
  else ok('verifyPin no abre sin profesionales registrados');

  // Limpiar lockout de la prueba anterior y crear profesional
  await follow.clearPinLockoutForTest();
  const addErr = await follow.addPro({ name: 'Dra. Ana', role: 'logopeda', centre: 'CS Norte', pin: '4829' });
  if (addErr) fallo(`addPro falló: ${addErr}`);

  const pros = await follow.listPros();
  const pro = pros[0];
  if (!pro || (pro.pinIter ?? 0) < 100000 || !pro.pinSalt || !pro.pubKey) {
    fallo('addPro no guardó PBKDF2-SHA256 (≥100 000 iter.), sal o clave pública Ed25519');
  } else {
    ok(`PIN almacenado con PBKDF2-SHA256 (${pro.pinIter} iter.) y clave Ed25519`);
  }

  if ((await follow.verifyPin('4829'))?.name !== 'Dra. Ana') fallo('verifyPin rechazó el PIN correcto');
  else ok('verifyPin acepta el PIN correcto');

  // Probar bloqueo progresivo persistido (5 → 30 s, 10 → 5 min, 15 → 30 min)
  const cryptoMod = loadTsFixed(path.join(ROOT, 'src', 'valeriaCrypto.ts'));
  await follow.clearPinLockoutForTest();
  for (let i = 1; i <= 5; i++) await follow.verifyPin('9999');
  const st5 = await follow.getPinLockStatus();
  if (st5.fails !== 5 || st5.lockedUntil - Date.now() < 20_000) {
    fallo('bloqueo tras 5 fallos no fijó ~30 s persistidos');
  } else {
    ok('bloqueo persistido tras 5 fallos (30 s)');
  }

  // Simular que expiró la ventana de espera pero se conserva el contador en almacenamiento cifrado
  await cryptoMod.writeEncryptedJSON('@valeria_pin_lock_v2', { fails: 9, lockedUntil: Date.now() - 1000 });
  await follow.verifyPin('9999');
  const st10 = await follow.getPinLockStatus();
  if (st10.fails !== 10 || st10.lockedUntil - Date.now() < 240_000) {
    fallo('bloqueo tras 10 fallos no fijó 5 min');
  } else {
    ok('bloqueo persistido tras 10 fallos (5 min)');
  }

  await cryptoMod.writeEncryptedJSON('@valeria_pin_lock_v2', { fails: 14, lockedUntil: Date.now() - 1000 });
  await follow.verifyPin('9999');
  const st15 = await follow.getPinLockStatus();
  if (st15.fails !== 15 || st15.lockedUntil - Date.now() < 1_500_000) {
    fallo('bloqueo tras 15 fallos no fijó 30 min');
  } else {
    ok('bloqueo persistido tras 15 fallos (30 min)');
  }

  // Firma antes de restablecer + etiqueta tras restablecer
  await follow.clearPinLockoutForTest();
  await follow.verifyPin('4829');
  const preRes = await follow.exportSignedNoteCode({ text: 'Antes del reset', from: 'pro', author: 'Dra. Ana', role: 'logopeda', centre: 'CS Norte' });
  await follow.resetPros('PIN restablecido por la familia.');
  const impPre = await follow.importNoteCodeDetailed(preRes.code);
  if (!impPre.ok || impPre.status !== 'verified') {
    fallo('la nota firmada antes de restablecer perdió su verificación');
  } else {
    ok('nota firmada antes de restablecer conserva su verificación');
  }

  await follow.addPro({ name: 'Dr. Luis', role: 'orl', centre: 'H. Central', pin: '7314' });
  await follow.addNote({ from: 'pro', author: 'Dr. Luis', role: 'orl', centre: 'H. Central', text: 'Después del reset' });
  const notesAfter = await follow.loadNotes();
  const postNote = notesAfter.find((n) => n.text === 'Después del reset');
  if (!postNote?.postReset) {
    fallo('la nota posterior al restablecimiento no quedó marcada «tras restablecer»');
  } else {
    ok('nota posterior al restablecimiento marcada postReset = true');
  }

  console.log(fallos === 0 ? '\n✅ check-pro-pin en verde.' : `\n❌ ${fallos} fallo(s) en check-pro-pin.`);
  process.exit(fallos === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });

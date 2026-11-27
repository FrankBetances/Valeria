#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de cifrado en reposo v2, SecureStore y migración de pid (P3.1-P3.2)
 *   node scripts/check-crypto.js
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

// ---- Almacenes simulados en memoria ----------------------------------------
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

function loadTs(absFile) {
  if (tsCache.has(absFile)) return tsCache.get(absFile).exports;
  const src = fs.readFileSync(absFile, 'utf8');
  const compiled = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
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
      if (fs.existsSync(base + ext)) return loadTs(base + ext);
    }
  }
  return origLoad.apply(this, arguments);
};

// Produce un blob v1 legado compatible con decryptV1 para probar migración.
function makeV1Blob(keyHex, obj) {
  const plain = Buffer.from(JSON.stringify(obj), 'utf8');
  const out = Buffer.alloc(plain.length);
  let block = Buffer.alloc(0);
  for (let i = 0; i < plain.length; i++) {
    if (i % 32 === 0) {
      block = crypto.createHash('sha256').update(`${keyHex}:${i / 32}`, 'utf8').digest();
    }
    out[i] = plain[i] ^ block[i % 32];
  }
  return `v1:${out.toString('base64')}`;
}

(async () => {
  const valeriaCrypto = loadTs(path.join(ROOT, 'src', 'valeriaCrypto.ts'));
  const valeriaPatients = loadTs(path.join(ROOT, 'src', 'valeriaPatients.ts'));

  // 1. Ida y vuelta + formato v2: + clave en SecureStore
  const sample = { child: 'Lucía', nhc: 'HC-99', scores: [3, 2, 3] };
  const c1 = await valeriaCrypto.encryptJSON(sample);
  const c2 = await valeriaCrypto.encryptJSON(sample);
  if (!c1.startsWith('v2:')) fallo('encryptJSON no produce prefijo v2:');
  else ok('encryptJSON emite prefijo v2:');

  if (c1 === c2) fallo('dos cifrados del mismo objeto produjeron blobs idénticos (nonce repetido)');
  else ok('nonces aleatorios distintos en cada cifrado');

  const d1 = await valeriaCrypto.decryptJSON(c1);
  if (JSON.stringify(d1) !== JSON.stringify(sample)) fallo('ida y vuelta v2 no coincide con el original');
  else ok('ida y vuelta v2 coincide');

  if (!secureMem.has('valeria_master_key_v2')) fallo('clave maestra no guardada en SecureStore');
  else ok('clave maestra guardada en SecureStore');

  // 2. Blob alterado -> null
  const dot = c1.indexOf('.');
  const ctPart = c1.slice(dot + 1);
  const flippedChar = ctPart[0] === 'A' ? 'B' : 'A';
  const tampered = c1.slice(0, dot + 1) + flippedChar + ctPart.slice(1);
  const dTampered = await valeriaCrypto.decryptJSON(tampered);
  if (dTampered !== null) fallo('un blob alterado devolvió dato en lugar de null');
  else ok('blob alterado rechazado (Poly1305 → null)');

  // 3. Migración v1: -> v2:
  const v1Key = crypto.createHash('sha256').update('legacy-key-seed').digest('hex');
  asyncMem.set('@valeria_tlm_key', v1Key);
  const v1Payload = { log: 'antiguo', xp: 42 };
  const v1Blob = makeV1Blob(v1Key, v1Payload);
  asyncMem.set('@test_migrate_v1', v1Blob);
  const migratedVal = await valeriaCrypto.decryptJSON(v1Blob, '@test_migrate_v1');
  const storedAfter = asyncMem.get('@test_migrate_v1') || '';
  if (JSON.stringify(migratedVal) !== JSON.stringify(v1Payload) || !storedAfter.startsWith('v2:')) {
    fallo('decryptJSON no migró v1: a v2:');
  } else {
    ok('migración transparente v1: → v2:');
  }

  // 4. Prueba de migración con datos sembrados: ficha antigua sin pid + claves legacy
  const legacyFicha = { nombre: 'Mateo', nhc: 'HC-OLD-7', patologia: 'Dislalia' };
  const legacyFollowHash = crypto.createHash('sha256').update('valeria-follow:HC-OLD-7').digest('hex').slice(0, 16);
  const legacyArHash = crypto.createHash('sha256').update('valeria-ar:HC-OLD-7').digest('hex').slice(0, 16);
  asyncMem.set('@valeria_paciente', JSON.stringify(legacyFicha)); // JSON en claro antiguo
  asyncMem.set(`@valeria_notas_seguimiento_${legacyFollowHash}`, makeV1Blob(v1Key, [{ id: 'n1', text: 'nota legacy' }]));
  asyncMem.set(`@valeria_ar_consentimiento_${legacyArHash}`, 'ok');

  const upgraded = await valeriaPatients.readActivePatient();
  if (!upgraded?.pid || upgraded.pid.length < 16) {
    fallo('readActivePatient no asignó pid de 128 bits a la ficha antigua');
  } else {
    const newFollowHash = valeriaPatients.followKeyPrefixForPid(upgraded.pid);
    const newArHash = valeriaPatients.arKeyForPid(upgraded.pid);
    const migratedNotes = await valeriaCrypto.readEncryptedJSON(`@valeria_notas_seguimiento_${newFollowHash}`);
    const oldNotesLeft = asyncMem.has(`@valeria_notas_seguimiento_${legacyFollowHash}`);
    const newAr = asyncMem.get(`@valeria_ar_consentimiento_${newArHash}`);
    const rawReg = asyncMem.get('@valeria_paciente') || '';
    if (!rawReg.startsWith('v2:') || !Array.isArray(migratedNotes) || migratedNotes[0]?.id !== 'n1' || oldNotesLeft || newAr !== 'ok') {
      fallo('migración de datos sembrados por pid incompleta');
    } else {
      ok('migración sembrada ficha en claro + seguimiento + RA a pid de 128 bits');
    }
  }

  // 5. Auditoría estática: ninguna escritura sin cifrar de claves clínicas en src/
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
  const sensitiveKeys = /AsyncStorage\.setItem\s*\(\s*STORAGE_KEYS\.(registro|pacientes|historial|profesionales|ling)\b/;
  const badSetItems = walk(path.join(ROOT, 'src')).filter((f) => sensitiveKeys.test(fs.readFileSync(f, 'utf8')));
  if (badSetItems.length) {
    fallo(`escritura en claro detectada con AsyncStorage.setItem en: ${badSetItems.map((f) => path.relative(ROOT, f)).join(', ')}`);
  } else {
    ok('cero escrituras directas en claro sobre registro, pacientes, historial, profesionales y ling');
  }

  // 6. app.json allowBackup y scheme
  const app = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8')).expo;
  if (app.android?.allowBackup !== false) fallo('app.json no fija android.allowBackup = false');
  else ok('app.json fija android.allowBackup = false');
  if (app.scheme !== 'valeria') fallo('app.json no fija scheme = "valeria"');
  else ok('app.json fija scheme = "valeria"');

  console.log(fallos === 0 ? '\n✅ check-crypto en verde.' : `\n❌ ${fallos} fallo(s) en check-crypto.`);
  process.exit(fallos === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });

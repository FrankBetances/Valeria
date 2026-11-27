#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de códigos de seguimiento v2, vínculos QR y export .valeria (P3.5-P3.7)
 *   node scripts/check-note-codes.js
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

// Almacenes independientes por "dispositivo" para simular consulta ↔ familia
function makeDeviceStore() {
  return { asyncMem: new Map(), secureMem: new Map() };
}
const devices = { clinic: makeDeviceStore(), family: makeDeviceStore(), other: makeDeviceStore() };
let activeDev = devices.clinic;

const origLoad = Module._load;
const tsCache = new Map();

const stubs = {
  'react-native': { Platform: { OS: 'android' } },
  '@react-native-async-storage/async-storage': {
    __esModule: true,
    default: {
      getItem: async (k) => (activeDev.asyncMem.has(k) ? activeDev.asyncMem.get(k) : null),
      setItem: async (k, v) => { activeDev.asyncMem.set(k, String(v)); },
      removeItem: async (k) => { activeDev.asyncMem.delete(k); },
    },
  },
  'expo-secure-store': {
    getItemAsync: async (k) => (activeDev.secureMem.has(k) ? activeDev.secureMem.get(k) : null),
    setItemAsync: async (k, v) => { activeDev.secureMem.set(k, String(v)); },
    deleteItemAsync: async (k) => { activeDev.secureMem.delete(k); },
  },
  'expo-crypto': {
    getRandomBytes: (len) => new Uint8Array(crypto.randomBytes(len)),
  },
};

function loadTs(absFile) {
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
      if (fs.existsSync(base + ext)) return loadTs(base + ext);
    }
  }
  return origLoad.apply(this, arguments);
};

(async () => {
  const valeriaCrypto = loadTs(path.join(ROOT, 'src', 'valeriaCrypto.ts'));
  const patients = loadTs(path.join(ROOT, 'src', 'valeriaPatients.ts'));
  const follow = loadTs(path.join(ROOT, 'src', 'valeriaFollowUp.ts'));

  const switchTo = (name) => {
    activeDev = devices[name];
    valeriaCrypto.__resetMasterKeyCache();
    follow.clearCurrentPro();
  };

  // --- Aparato A (consulta) crea paciente, profesional y QR de vínculo ---
  switchTo('clinic');
  await patients.saveActivePatient({ nombre: 'Lucía', nhc: 'HC-200' });
  await follow.addPro({ name: 'Dra. Clara', role: 'logopeda', centre: 'Clínica Sur', pin: '2468' });
  const linkClinic = await follow.createLinkPayload();
  if (!linkClinic.ok || !linkClinic.code?.startsWith('VALERIA-VINCULO1:')) {
    fallo('createLinkPayload no generó VALERIA-VINCULO1');
  } else {
    ok('vínculo VALERIA-VINCULO1 generado en consulta');
  }

  // --- Aparato B (familia) crea ficha local, importa vínculo A y devuelve su vínculo B ---
  switchTo('family');
  await patients.saveActivePatient({ nombre: 'Lucía', nhc: 'HC-200' });
  const impLinkB = await follow.importLinkCode(linkClinic.code);
  if (!impLinkB.ok) fallo(`familia no pudo importar vínculo: ${impLinkB.reason}`);
  else ok('familia importó el vínculo del profesional');

  const linkFamily = await follow.createLinkPayload();

  // Aparato A también importa la clave de la familia para aceptar sus notas
  switchTo('clinic');
  await follow.verifyPin('2468');
  await follow.importLinkCode(linkFamily.code);

  // --- 1. Ida y vuelta pro -> familia (con saltos de línea de WhatsApp y enlace valeria://) ---
  const proCodeRes = await follow.exportSignedNoteCode({
    text: 'Practicar /r/ suave dos minutos después de cenar.',
    from: 'pro',
    author: 'Dra. Clara',
    role: 'logopeda',
    centre: 'Clínica Sur',
  });
  if (!proCodeRes.ok || !proCodeRes.code?.startsWith('VALERIA-NOTA2:')) {
    fallo('no se pudo generar VALERIA-NOTA2');
  }

  switchTo('family');
  // Trocear con espacios y saltos de línea
  const splitCode = proCodeRes.code.match(/.{1,42}/g).join('\n  ');
  const imp1 = await follow.importNoteCodeDetailed(splitCode);
  if (!imp1.ok || imp1.status !== 'verified' || imp1.author !== 'Dra. Clara') {
    fallo('familia no verificó una VALERIA-NOTA2 partida con saltos de línea');
  } else {
    ok('VALERIA-NOTA2 pro→familia verificada aun con saltos de línea');
  }

  // Enlace valeria:// y no duplicación
  const impDup = await follow.importNoteCodeDetailed(proCodeRes.url);
  const famNotesAfterDup = await follow.loadNotes();
  const proCount = famNotesAfterDup.filter((n) => n.from === 'pro').length;
  if (!impDup.ok || !impDup.duplicate || proCount !== 1) {
    fallo('el re-importar por valeria:// duplicó la nota o falló');
  } else {
    ok('deduplicación de id y soporte valeria://nota?c=...');
  }

  // --- 2. Sentido inverso: familia -> profesional + acuse de lectura ---
  const famSend = await follow.exportSignedNoteCode({ text: 'Hoy estuvo más atento al cuento.', from: 'family', author: 'Familia' });
  switchTo('clinic');
  await follow.verifyPin('2468');
  const impFam = await follow.importNoteCodeDetailed(famSend.code);
  if (!impFam.ok || impFam.status !== 'verified') {
    fallo('consulta no pudo importar la nota enviada por la familia');
  } else {
    ok('nota familia→profesional verificada');
  }

  const rev = await follow.markFamilyNotesReviewed();
  if (!rev.ok || !rev.receiptCode?.startsWith('VALERIA-LEIDO2:')) {
    fallo('markFamilyNotesReviewed no generó VALERIA-LEIDO2');
  } else {
    switchTo('family');
    const impRec = await follow.importNoteCodeDetailed(rev.receiptCode);
    const notesCheck = await follow.loadNotes();
    const famNote = notesCheck.find((n) => n.from === 'family');
    if (!impRec.ok || impRec.kind !== 'receipt' || !famNote?.reviewedAt) {
      fallo('familia no procesó el acuse VALERIA-LEIDO2');
    } else {
      ok('acuse de lectura firmado VALERIA-LEIDO2 verificado y aplicado');
    }
  }

  // --- 3. Firma falsificada se rechaza ---
  const envRaw = JSON.parse(valeriaCrypto.bytesToUtf8(valeriaCrypto.b64UrlToBytes(proCodeRes.code.slice('VALERIA-NOTA2:'.length))));
  envRaw.sig = 'A' + envRaw.sig.slice(1);
  const forgedCode = 'VALERIA-NOTA2:' + valeriaCrypto.bytesToB64Url(valeriaCrypto.utf8ToBytes(JSON.stringify(envRaw)));
  const resForged = await follow.importNoteCodeDetailed(forgedCode);
  if (resForged.ok || resForged.reason !== 'unverified') {
    fallo('firma falsificada NO fue rechazada como unverified');
  } else {
    ok('firma falsificada rechazada («No verificada: no se puede importar»)');
  }

  // --- 4. pidHash ajeno se rechaza ---
  switchTo('other');
  await patients.saveActivePatient({ nombre: 'Otro Niño', nhc: 'HC-OTHER' });
  const resOther = await follow.importNoteCodeDetailed(proCodeRes.code);
  if (resOther.ok || resOther.reason !== 'wrong_patient') {
    fallo(`nota de otro paciente devolvió ${JSON.stringify(resOther)} en lugar de wrong_patient`);
  } else {
    ok('nota de pidHash ajeno rechazada («otro paciente o falta vincular»)');
  }

  // --- 5. Compatibilidad VALERIA-NOTA1 como no verificada ---
  switchTo('family');
  const legacyPayload = { by: 'Dr. Antiguo', r: 'orl', c: 'Hospital', t: 'Revisión en 3 meses', at: '2026-10-01T10:00:00Z' };
  const legacyCode = 'VALERIA-NOTA1:' + valeriaCrypto.bytesToB64Url(valeriaCrypto.utf8ToBytes(JSON.stringify(legacyPayload)));
  const resLeg = await follow.importNoteCodeDetailed(legacyCode);
  const legNotes = await follow.loadNotes();
  const legSaved = legNotes.find((n) => n.legacyFormat);
  if (!resLeg.ok || resLeg.status !== 'legacy_unverified' || !legSaved || legSaved.verified !== false) {
    fallo('VALERIA-NOTA1 no se importó marcada como formato antiguo no verificada');
  } else {
    ok('compatibilidad VALERIA-NOTA1 marcada formato antiguo no verificada');
  }

  // --- 6. Exportación e importación cifrada .valeria sin claves de profesionales ---
  switchTo('clinic');
  await follow.verifyPin('2468');
  const expRes = await follow.exportPatientBundle('clave-segura-2026');
  if (!expRes.ok || !expRes.data?.startsWith('VALERIA-EXPORT1:')) {
    fallo('exportPatientBundle falló');
  }
  switchTo('other');
  const badPass = await follow.importPatientBundle(expRes.data, 'incorrecta-999');
  if (badPass.ok) fallo('importPatientBundle aceptó frase incorrecta');
  const goodImp = await follow.importPatientBundle(expRes.data, 'clave-segura-2026');
  const importedPros = await follow.listPros();
  const importedPatient = await patients.readActivePatient();
  if (!goodImp.ok || importedPatient?.nombre !== 'Lucía' || importedPros.length !== 0) {
    fallo('importación .valeria no restauró paciente o filtró profesionales');
  } else {
    ok('export/import .valeria con frase secreta y cero claves privadas de profesionales');
  }

  console.log(fallos === 0 ? '\n✅ check-note-codes en verde.' : `\n❌ ${fallos} fallo(s) en check-note-codes.`);
  process.exit(fallos === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });

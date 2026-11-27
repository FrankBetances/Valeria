#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate P6: VALERIA-PAUTA2, recordatorios ligados a la pauta,
 * informe HTML con consentimiento y modelo de voz del cuidador cifrado.
 *   node scripts/check-p6.js
 * ========================================================================== */
const assert = require('assert');
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const Module = require('module');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-p6-'));
fs.symlinkSync(path.join(ROOT, 'node_modules'), path.join(tmp, 'node_modules'), 'dir');

const memStorage = new Map();
const memSecure = new Map();
const scheduled = [];

const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'react-native') {
    return {
      Platform: { OS: 'android' },
      NativeModules: {},
    };
  }
  if (request === '@react-native-async-storage/async-storage') {
    const api = {
      getItem: async (k) => (memStorage.has(k) ? memStorage.get(k) : null),
      setItem: async (k, v) => { memStorage.set(k, String(v)); },
      removeItem: async (k) => { memStorage.delete(k); },
      multiGet: async (keys) => keys.map((k) => [k, memStorage.has(k) ? memStorage.get(k) : null]),
    };
    return { default: api, ...api };
  }
  if (request === 'expo-secure-store') {
    return {
      AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1,
      getItemAsync: async (k) => (memSecure.has(k) ? memSecure.get(k) : null),
      setItemAsync: async (k, v) => { memSecure.set(k, String(v)); },
      deleteItemAsync: async (k) => { memSecure.delete(k); },
    };
  }
  if (request === 'expo-crypto') {
    return {
      getRandomBytes: (n) => new Uint8Array(crypto.randomBytes(n)),
      getRandomBytesAsync: async (n) => new Uint8Array(crypto.randomBytes(n)),
    };
  }
  if (request === 'expo-notifications') {
    return {
      AndroidImportance: { MAX: 5 },
      AndroidNotificationVisibility: { PUBLIC: 1 },
      SchedulableTriggerInputTypes: { DAILY: 'daily' },
      setNotificationHandler: () => {},
      setNotificationChannelAsync: async () => {},
      getPermissionsAsync: async () => ({ granted: true }),
      requestPermissionsAsync: async () => ({ granted: true }),
      scheduleNotificationAsync: async ({ content, trigger }) => {
        scheduled.push({ hour: trigger.hour, title: content.title, body: content.body });
      },
      cancelAllScheduledNotificationsAsync: async () => { scheduled.length = 0; },
    };
  }
  if (request === 'expo-audio') return null;
  if (request === 'expo-file-system') return null;
  return origLoad.apply(this, arguments);
};

execSync(
  [
    'npx tsc',
    JSON.stringify(path.join(ROOT, 'src', 'valeriaFollowUp.ts')),
    JSON.stringify(path.join(ROOT, 'src', 'valeriaNotifications.ts')),
    JSON.stringify(path.join(ROOT, 'src', 'valeriaCaregiverVoice.ts')),
    '--module commonjs', '--target es2020', '--moduleResolution node',
    '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp),
  ].join(' '),
  { cwd: ROOT, stdio: 'pipe' },
);

const followUp = require(path.join(tmp, 'valeriaFollowUp.js'));
const patients = require(path.join(tmp, 'valeriaPatients.js'));
const notifs = require(path.join(tmp, 'valeriaNotifications.js'));
const cg = require(path.join(tmp, 'valeriaCaregiverVoice.js'));
const cryptoMod = require(path.join(tmp, 'valeriaCrypto.js'));

(async () => {
  try {
    // Setup active profile & professional
    await patients.saveActivePatient({ nombre: 'Leo <Test>', nhc: 'H1', pid: '0123456789abcdef0123456789abcdef' });
    await followUp.addPro({ name: 'Dra. Ana', role: 'logopeda', centre: 'Centro Norte', pin: '4821' });
    const pro = await followUp.verifyPin('4821');
    assert(pro && pro.name === 'Dra. Ana');
    const linkRes = await followUp.createLinkPayload();
    assert.strictEqual(linkRes.ok, true);

    // 1) VALERIA-PAUTA2: sign & verify
    const pautaRes = await followUp.exportSignedPlanCode({ lenguaje: 4, pares: 2 });
    assert.strictEqual(pautaRes.ok, true);
    assert(pautaRes.code.startsWith('VALERIA-PAUTA2:'));
    const imp = await followUp.importNoteCodeDetailed(pautaRes.code);
    assert.strictEqual(imp.ok, true);
    assert.strictEqual(imp.kind, 'plan');
    assert.strictEqual(imp.status, 'verified');

    // 2) Recordatorios ligados a la pauta
    await followUp.logStimulation('lenguaje');
    await followUp.logStimulation('lenguaje');
    notifs.registerPlanProgressProvider(() => followUp.loadActivePlanProgress({ lenguaje: 'Lenguaje', pares: 'Pares mínimos' }));
    await notifs.enableDailyReminders(['manana', 'consejo']);
    assert(scheduled.some((s) => s.hour === 9 && s.body.includes('2 de 4') && s.body.includes('Lenguaje')), 'Expected plan-linked body in morning reminder');

    // 3) Informe HTML: bloqueado sin consentimiento, generado con él y HTML-escapado
    const noConsent = await followUp.buildConsultationReportHtml({
      title: 'Informe', generatedLabel: 'Fecha', planTitle: 'Plan', adherenceTitle: 'Adh',
      notesTitle: 'Notas', resultsTitle: 'Res', lingTitle: 'Ling', noData: 'Sin',
      familyTag: '[Familia]', proTag: '[Profesional]', footer: 'Pie',
      areas: {
        audicion: 'A', lenguaje: 'Lenguaje', tea: 'T', dislexia: 'D', pares: 'Pares',
        expansion: 'E', sensorial: 'S', escritura: 'Es', aventuras: 'Av', ra: 'RA', tpr: 'TPR', steam: 'ST',
      },
    });
    assert.strictEqual(noConsent.ok, false);
    assert.strictEqual(noConsent.reason, 'no_consent');

    await followUp.setConsent(true);
    const yesConsent = await followUp.buildConsultationReportHtml({
      title: 'Informe', generatedLabel: 'Fecha', planTitle: 'Plan', adherenceTitle: 'Adh',
      notesTitle: 'Notas', resultsTitle: 'Res', lingTitle: 'Ling', noData: 'Sin',
      familyTag: '[Familia]', proTag: '[Profesional]', footer: 'Pie',
      areas: {
        audicion: 'A', lenguaje: 'Lenguaje', tea: 'T', dislexia: 'D', pares: 'Pares',
        expansion: 'E', sensorial: 'S', escritura: 'Es', aventuras: 'Av', ra: 'RA', tpr: 'TPR', steam: 'ST',
      },
    });
    assert.strictEqual(yesConsent.ok, true);
    assert(yesConsent.html.includes('&lt;Test&gt;'), 'HTML escaping must escape user strings');

    // 4) Consentimiento y borrado de grabaciones del cuidador
    await cg.setCaregiverConsent(true);
    const fakeKey = '@valeria_cg_clip_' + patients.followKeyPrefixForPid('0123456789abcdef0123456789abcdef') + '_deadbeef';
    await cryptoMod.writeEncryptedJSON(fakeKey, { v: 1, b64: 'AAAA', word: 'sol', at: '2026-11-27' });
    await cryptoMod.writeEncryptedJSON('@valeria_cg_index_' + patients.followKeyPrefixForPid('0123456789abcdef0123456789abcdef'), [fakeKey]);
    assert.strictEqual(memStorage.has(fakeKey), true);
    await cg.setCaregiverConsent(false);
    assert.strictEqual(memStorage.has(fakeKey), false, 'Withdrawing caregiver consent must wipe all stored recordings');

    console.log('✓ check-p6: VALERIA-PAUTA2, recordatorios pauta, informe HTML y revocación voz de casa OK');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
})().catch((e) => { console.error(e); process.exit(1); });

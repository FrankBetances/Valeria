#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate P5: Play Age Signals (evaluación en memoria, sin guardado)
 *   node scripts/check-age-signals.js
 * ========================================================================== */
const assert = require('assert');
const { execSync } = require('child_process');
const fs = require('fs');
const Module = require('module');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src', 'valeriaAgeSignals.ts');
const srcTxt = fs.readFileSync(SRC, 'utf8');
const codeTxt = srcTxt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

// Prohibido persistir o registrar en telemetría / logs.
for (const forbidden of ['AsyncStorage', 'valeriaTelemetry', 'console.log', 'console.warn', 'console.error', 'encryptJSON']) {
  assert(!codeTxt.includes(forbidden), `valeriaAgeSignals.ts no puede usar ${forbidden}`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-age-signals-'));
try {
  execSync(
    [
      'npx tsc', JSON.stringify(SRC),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp),
    ].join(' '),
    { cwd: ROOT, stdio: 'pipe' },
  );

  let mockPlatform = 'android';
  let nextNativeCheck = async () => ({ status: 'NOT_SHARED' });
  const origLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === 'react-native') {
      return {
        get Platform() { return { OS: mockPlatform }; },
        NativeModules: {
          ValeriaAgeSignals: {
            check: () => nextNativeCheck(),
          },
        },
      };
    }
    return origLoad.apply(this, arguments);
  };

  const {
    checkAgeSignals,
    checkAgeSignalsAtStartup,
    resetAgeSignalsMemoryCache,
    shouldShowAdultGate,
  } = require(path.join(tmp, 'valeriaAgeSignals.js'));

  (async () => {
    try {
      // 1) Adulto verificado (18+, ageUpper null) -> no muestra puerta
      nextNativeCheck = async () => ({ status: 'SHARED', ageRangeSource: 'TIER_D', ageLower: 18, mandatory: true });
      let r = await checkAgeSignals();
      assert.strictEqual(shouldShowAdultGate(r), false, 'Adult 18+ must not trigger gate');

      // 2) Menor (13-15) -> muestra puerta
      nextNativeCheck = async () => ({ status: 'SHARED', ageRangeSource: 'TIER_A', ageLower: 13, ageUpper: 15, mandatory: false });
      r = await checkAgeSignals();
      assert.strictEqual(shouldShowAdultGate(r), true, 'Minor 13-15 must trigger gate');

      // 3) Menor supervisado (TIER_B + installId) -> muestra puerta
      nextNativeCheck = async () => ({ status: 'SHARED', ageRangeSource: 'TIER_B', ageLower: 0, ageUpper: 12, installId: 'fake_id', mandatory: true });
      r = await checkAgeSignals();
      assert.strictEqual(shouldShowAdultGate(r), true, 'Supervised minor TIER_B must trigger gate');

      // 4) Sin datos / no compartido -> no bloquea
      nextNativeCheck = async () => ({ status: 'NOT_SHARED', mandatory: false });
      r = await checkAgeSignals();
      assert.strictEqual(shouldShowAdultGate(r), false, 'NOT_SHARED must not trigger gate');

      // 5) Error API_NOT_AVAILABLE o excepción -> no bloquea
      nextNativeCheck = async () => ({ status: 'ERROR', error: 'API_NOT_AVAILABLE' });
      r = await checkAgeSignals();
      assert.strictEqual(shouldShowAdultGate(r), false, 'API_NOT_AVAILABLE must not trigger gate');

      nextNativeCheck = async () => { throw new Error('API_NOT_AVAILABLE'); };
      r = await checkAgeSignals();
      assert.strictEqual(r.status, 'ERROR');
      assert.strictEqual(shouldShowAdultGate(r), false, 'Rejected promise must not trigger gate');

      // Web / iOS -> unavailable
      mockPlatform = 'web';
      resetAgeSignalsMemoryCache();
      r = await checkAgeSignalsAtStartup();
      assert.strictEqual(r.status, 'unavailable');
      assert.strictEqual(shouldShowAdultGate(r), false);

      console.log('✓ check-age-signals: adulto, menor, supervisado, sin datos, API_NOT_AVAILABLE y web/iOS OK');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  })().catch((e) => { console.error(e); process.exit(1); });
} catch (e) {
  fs.rmSync(tmp, { recursive: true, force: true });
  throw e;
}

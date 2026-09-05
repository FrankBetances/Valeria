// ============================================================================
// Challenger Final 1 · Comprehensive Adversarial Test Suite for Catalan (ca)
// UI Localization, Dynamic Switching, State Integrity, Picker & Catalog Parity
// ============================================================================

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.stack || err.message}`);
    failedTests++;
    failureDetails.push({ name, error: err.stack || err.message });
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.stack || err.message}`);
    failedTests++;
    failureDetails.push({ name, error: err.stack || err.message });
  }
}

console.log('════════════════════════════════════════════════════════════════════');
console.log(' Valeria+ · Challenger Final 1 Adversarial Integration Test Suite');
console.log('════════════════════════════════════════════════════════════════════\n');

// ── Environment Mocking & Module Loader ─────────────────────────────────────
const mockStorage = {};
let storageThrowMode = false;

const asyncStorageMock = {
  getItem: async (k) => {
    if (storageThrowMode) throw new Error('Simulated AsyncStorage read failure');
    return k in mockStorage ? mockStorage[k] : null;
  },
  setItem: async (k, v) => {
    if (storageThrowMode) throw new Error('Simulated AsyncStorage write failure');
    mockStorage[k] = String(v);
  },
  removeItem: async (k) => {
    if (storageThrowMode) throw new Error('Simulated AsyncStorage delete failure');
    delete mockStorage[k];
  },
  multiGet: async (keys) => {
    if (storageThrowMode) throw new Error('Simulated AsyncStorage multiGet failure');
    return keys.map((k) => [k, k in mockStorage ? mockStorage[k] : null]);
  },
  multiSet: async (pairs) => {
    if (storageThrowMode) throw new Error('Simulated AsyncStorage multiSet failure');
    for (const [k, v] of pairs) {
      mockStorage[k] = String(v);
    }
  },
};

const STUBS = {
  'react': {
    createContext: () => ({ Provider: () => null, Consumer: () => null }),
    createElement: (type, props, ...children) => ({ type, props: { ...props, children } }),
    useReducer: (reducer, initial) => [initial, () => {}],
    useEffect: (effect) => { const cleanup = effect(); return cleanup; },
    useSyncExternalStore: (subscribe, getSnapshot) => getSnapshot(),
  },
  'react-native': {
    Platform: { OS: 'ios' },
    StyleSheet: { create: (s) => s },
    View: 'View',
    Text: 'Text',
    Pressable: 'Pressable',
  },
  '@react-native-async-storage/async-storage': {
    default: asyncStorageMock,
    ...asyncStorageMock,
  },
};

const moduleCache = new Map();
const originalRequire = Module.prototype.require;

Module.prototype.require = function (id) {
  if (STUBS[id]) return STUBS[id];
  if (id.startsWith('./') || id.startsWith('../')) {
    const parentDir = path.dirname(this.filename);
    const resolvedPath = path.resolve(parentDir, id);
    for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return loadTsModule(fullPath);
      }
    }
  }
  return originalRequire.apply(this, arguments);
};

function loadTsModule(fullPath) {
  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath).exports;
  }
  const source = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
    },
    fileName: fullPath,
  }).outputText;

  const mod = new Module(fullPath, module);
  mod.filename = fullPath;
  mod.paths = Module._nodeModulePaths(path.dirname(fullPath));
  moduleCache.set(fullPath, mod);
  mod._compile(transpiled, fullPath);
  return mod.exports;
}

// Load Modules
const ROOT = path.join(__dirname, '..');
const uiLangModulePath = path.join(ROOT, 'src/valeriaUiLang.ts');
const catalogModulePath = path.join(ROOT, 'src/i18n/catalog.ts');
const localeModulePath = path.join(ROOT, 'src/valeriaLocale.ts');
const pickerModulePath = path.join(ROOT, 'src/ValeriaUiLangPicker.tsx');
const stringsEsPath = path.join(ROOT, 'src/i18n/strings.es.ts');
const stringsEnPath = path.join(ROOT, 'src/i18n/strings.en.ts');
const stringsCaPath = path.join(ROOT, 'src/i18n/strings.ca.ts');

const valeriaUiLang = loadTsModule(uiLangModulePath);
const catalogModule = loadTsModule(catalogModulePath);
const valeriaLocale = loadTsModule(localeModulePath);
const stringsEs = loadTsModule(stringsEsPath);
const stringsEn = loadTsModule(stringsEnPath);
const stringsCa = loadTsModule(stringsCaPath);

async function main() {
  // Let initial async hydration settle
  await new Promise((resolve) => setTimeout(resolve, 50));
  await valeriaUiLang.hydrateUiLang();

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 1: Dynamic UI Language Switching & Predicates
  // ──────────────────────────────────────────────────────────────────────────
  console.log('── Section 1: Dynamic UI Language Switching & Predicates ──');

  runTest('TEST-1.1: ALL_UI_LANGS contains exactly es, en, ca', () => {
    assert.deepStrictEqual(valeriaUiLang.ALL_UI_LANGS, ['es', 'en', 'ca']);
    assert.strictEqual(valeriaUiLang.ALL_UI_LANGS.length, 3);
    assert(valeriaUiLang.ALL_UI_LANGS.includes('ca'));
  });

  runTest('TEST-1.2: DEFAULT_UI_LANG is es', () => {
    assert.strictEqual(valeriaUiLang.DEFAULT_UI_LANG, 'es');
  });

  runTest('TEST-1.3: isUiLang predicate validity matrix', () => {
    // Valid
    assert.strictEqual(valeriaUiLang.isUiLang('es'), true);
    assert.strictEqual(valeriaUiLang.isUiLang('en'), true);
    assert.strictEqual(valeriaUiLang.isUiLang('ca'), true);

    // Invalid string probes
    const invalidStrings = [
      'ca-ES', 'es-ES', 'en-US', 'gl', 'eu', 'es-DO', 'fr', 'de', 'it', 'pt',
      'CA', 'ES', 'EN', 'ca ', ' ca', '', ' ', 'null', 'undefined', '1',
    ];
    for (const s of invalidStrings) {
      assert.strictEqual(valeriaUiLang.isUiLang(s), false, `isUiLang('${s}') should be false`);
    }

    // Invalid types probes
    const invalidTypes = [null, undefined, 0, 1, -1, true, false, {}, [], NaN, () => {}, Symbol('ca')];
    for (const v of invalidTypes) {
      assert.strictEqual(valeriaUiLang.isUiLang(v), false, `isUiLang(${String(v)}) should be false`);
    }
  });

  runTest('TEST-1.4: resolveInitialUiLang fallback robustness', () => {
    // Valid inputs return exact language
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang('ca'), 'ca');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang('es'), 'es');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang('en'), 'en');

    // Invalid inputs always fallback to DEFAULT_UI_LANG ('es')
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang(null), 'es');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang(undefined), 'es');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang(''), 'es');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang('ca-ES'), 'es');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang('fr'), 'es');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang(123), 'es');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang({ lang: 'ca' }), 'es');
    assert.strictEqual(valeriaUiLang.resolveInitialUiLang(NaN), 'es');
  });

  await runAsyncTest('TEST-1.5: setUiLang(\'ca\') updates getUiLang() and tNow() returns CA catalog', async () => {
    await valeriaUiLang.setUiLang('ca');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'ca');
    assert.strictEqual(valeriaUiLang.isUiLangExplicit(), true);
    assert.strictEqual(catalogModule.tNow(), stringsCa.CA);
    assert.strictEqual(catalogModule.CATALOGUES.ca, stringsCa.CA);
    assert.strictEqual(catalogModule.tNow().settings.uiLangCa, 'Català');
  });

  await runAsyncTest('TEST-1.6: setUiLang(\'en\') and setUiLang(\'es\') return respective catalogs', async () => {
    await valeriaUiLang.setUiLang('en');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'en');
    assert.strictEqual(catalogModule.tNow(), stringsEn.EN);
    assert.strictEqual(catalogModule.tNow().settings.uiLangEn, 'English');

    await valeriaUiLang.setUiLang('es');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'es');
    assert.strictEqual(catalogModule.tNow(), stringsEs.ES);
    assert.strictEqual(catalogModule.tNow().settings.uiLangEs, 'Español');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 2: State Transitions, Listener Notifications & Memory Leak Safety
  // ──────────────────────────────────────────────────────────────────────────
  console.log('── Section 2: State Transitions, Listener Notifications & Leak Safety ──');

  await runAsyncTest('TEST-2.1: Multi-hop state transitions (es -> ca -> en -> ca -> es)', async () => {
    const sequence = ['es', 'ca', 'en', 'ca', 'es', 'ca'];
    for (const lang of sequence) {
      await valeriaUiLang.setUiLang(lang);
      assert.strictEqual(valeriaUiLang.getUiLang(), lang);
      assert.strictEqual(catalogModule.tNow(), catalogModule.CATALOGUES[lang]);
    }
  });

  await runAsyncTest('TEST-2.2: Listener notification count and idempotent setting', async () => {
    let callCount = 0;
    const unsubscribe = valeriaUiLang.subscribeUiLang(() => {
      callCount++;
    });

    // Currently at 'ca', set 'ca' again -> should NOT emit
    await valeriaUiLang.setUiLang('ca');
    assert.strictEqual(callCount, 0, 'No emission when setting same language');

    // Switch to 'es' -> 1 emission
    await valeriaUiLang.setUiLang('es');
    assert.strictEqual(callCount, 1, '1 emission on transition to es');

    // Switch to 'ca' -> 2 emissions
    await valeriaUiLang.setUiLang('ca');
    assert.strictEqual(callCount, 2, '1 emission on transition to ca');

    // Switch to 'en' -> 3 emissions
    await valeriaUiLang.setUiLang('en');
    assert.strictEqual(callCount, 3, '1 emission on transition to en');

    // Unsubscribe and verify no further notifications
    unsubscribe();
    await valeriaUiLang.setUiLang('ca');
    assert.strictEqual(callCount, 3, 'No emissions after unsubscribe');
  });

  await runAsyncTest('TEST-2.3: Stress test 1,000 concurrent subscribers (no leak on cleanup)', async () => {
    const subscriberCount = 1000;
    const unsubscribes = [];
    let totalInvocations = 0;

    for (let i = 0; i < subscriberCount; i++) {
      const unsub = valeriaUiLang.subscribeUiLang(() => {
        totalInvocations++;
      });
      unsubscribes.push(unsub);
    }

    // Trigger state change
    await valeriaUiLang.setUiLang('es');
    assert.strictEqual(totalInvocations, subscriberCount, 'All 1000 subscribers called');

    // Cleanup all
    for (const unsub of unsubscribes) {
      unsub();
    }

    // Trigger another state change -> 0 new invocations
    await valeriaUiLang.setUiLang('ca');
    assert.strictEqual(totalInvocations, subscriberCount, 'Zero invocations after full cleanup');
  });

  await runAsyncTest('TEST-2.4: defaultUiLangFor and syncUiLangToLocale gating with explicit flag', async () => {
    // When explicit = true, syncUiLangToLocale should be a no-op
    await valeriaUiLang.setUiLang('ca');
    assert.strictEqual(valeriaUiLang.isUiLangExplicit(), true);
    assert.strictEqual(valeriaUiLang.getUiLang(), 'ca');

    await valeriaUiLang.syncUiLangToLocale('en-US');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'ca', 'Explicit override must not be overridden by syncUiLangToLocale');

    await valeriaUiLang.syncUiLangToLocale('es');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'ca', 'Explicit override must not be overridden by syncUiLangToLocale');

    // Clear override -> explicit becomes false, follows locale default
    await valeriaUiLang.clearUiLangOverride('en-US');
    assert.strictEqual(valeriaUiLang.isUiLangExplicit(), false);
    assert.strictEqual(valeriaUiLang.getUiLang(), 'en', 'Follows default for en-US which is en');

    await valeriaUiLang.clearUiLangOverride('es');
    assert.strictEqual(valeriaUiLang.isUiLangExplicit(), false);
    assert.strictEqual(valeriaUiLang.getUiLang(), 'es', 'Follows default for es which is es');

    // syncUiLangToLocale works when explicit = false
    await valeriaUiLang.syncUiLangToLocale('en-US');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'en');

    await valeriaUiLang.syncUiLangToLocale('gl');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'es');
  });

  await runAsyncTest('TEST-2.5: setAppLanguage(\'ca\') moves the therapy variety too', async () => {
    // Este test afirmaba lo CONTRARIO hasta CA-3: que elegir «Català» dejaba la
    // variedad donde estuviera. Eso era el catalán a medias —interfaz catalana,
    // voz castellana— bajo una tarjeta que promete «i també el que sona en els
    // exercicis». Con la variedad `ca` en producción, el botón la mueve.
    await valeriaLocale.setLocale('gl');
    assert.strictEqual(valeriaLocale.getLocale(), 'gl');

    // 'ca' -> UI catalana Y variedad catalana; se recuerda 'gl' para la vuelta.
    await valeriaUiLang.setAppLanguage('ca');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'ca');
    assert.strictEqual(valeriaLocale.getLocale(), 'ca');

    // 'en' -> UI inglesa y variedad en-US. Se salta de una variedad "propia" a
    // otra sin pisar el recuerdo del gallego.
    await valeriaUiLang.setAppLanguage('en');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'en');
    assert.strictEqual(valeriaLocale.getLocale(), 'en-US');

    // Vuelta al catalán: variedad catalana otra vez.
    await valeriaUiLang.setAppLanguage('ca');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'ca');
    assert.strictEqual(valeriaLocale.getLocale(), 'ca');

    // Y al castellano: se devuelve la variedad de la que se venía ('gl'), no
    // se deja al usuario gallego en castellano por haber curioseado.
    await valeriaUiLang.setAppLanguage('es');
    assert.strictEqual(valeriaUiLang.getUiLang(), 'es');
    assert.strictEqual(valeriaLocale.getLocale(), 'gl');
  });

  await runAsyncTest('TEST-2.6: AsyncStorage persistence and hydration', async () => {
    // Explicitly set 'ca'
    await valeriaUiLang.setUiLang('ca');
    assert.strictEqual(mockStorage['@valeria_ui_lang'], 'ca');
    assert.strictEqual(mockStorage['@valeria_ui_lang_explicit'], '1');

    // Hydrate
    await valeriaUiLang.hydrateUiLang();
    assert.strictEqual(valeriaUiLang.getUiLang(), 'ca');
    assert.strictEqual(valeriaUiLang.isUiLangExplicit(), true);
  });

  await runAsyncTest('TEST-2.7: Resilience against AsyncStorage failure (graceful degradation)', async () => {
    storageThrowMode = true;
    try {
      // Must not throw unhandled exception, state must still update in memory for active session
      await valeriaUiLang.setUiLang('en');
      assert.strictEqual(valeriaUiLang.getUiLang(), 'en');

      await valeriaUiLang.setUiLang('ca');
      assert.strictEqual(valeriaUiLang.getUiLang(), 'ca');

      // Hydration failure defaults safely to 'es'
      await valeriaUiLang.hydrateUiLang();
      assert.strictEqual(valeriaUiLang.getUiLang(), 'es');
    } finally {
      storageThrowMode = false;
      await valeriaUiLang.setUiLang('ca'); // restore
    }
  });

  await runAsyncTest('TEST-2.8: Concurrency & Interleaved Async Race Condition Stress Test', async () => {
    // Fire 50 interleaved asynchronous operations rapidly
    const ops = [];
    const targets = ['ca', 'es', 'en', 'ca', 'es', 'ca', 'en', 'ca'];
    for (let i = 0; i < 50; i++) {
      const target = targets[i % targets.length];
      ops.push(valeriaUiLang.setUiLang(target));
    }
    await Promise.all(ops);

    // Final state must be a valid UiLang and tNow() must match it perfectly
    const finalLang = valeriaUiLang.getUiLang();
    assert(valeriaUiLang.ALL_UI_LANGS.includes(finalLang));
    assert.strictEqual(catalogModule.tNow(), catalogModule.CATALOGUES[finalLang]);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 3: ValeriaUiLangPicker Component Inspection & Option Validation
  // ──────────────────────────────────────────────────────────────────────────
  console.log('── Section 3: ValeriaUiLangPicker Component & Option Validation ──');

  runTest('TEST-3.1: ValeriaUiLangPicker source code includes 4 options and keys', () => {
    const pickerSource = fs.readFileSync(pickerModulePath, 'utf8');
    assert(pickerSource.includes("key: 'auto'"), "Picker must have 'auto' key");
    assert(pickerSource.includes("key: 'es'"), "Picker must have 'es' key");
    assert(pickerSource.includes("key: 'en'"), "Picker must have 'en' key");
    assert(pickerSource.includes("key: 'ca'"), "Picker must have 'ca' key");
    assert(pickerSource.includes("t.settings.uiLangCa"), "Picker must reference t.settings.uiLangCa");
  });

  await runAsyncTest('TEST-3.2: Dynamic Option Labels across all UI Languages', async () => {
    // In Catalan UI: endonyms for Spanish/English/Catalan
    await valeriaUiLang.setUiLang('ca');
    const tCa = catalogModule.tNow();
    assert.strictEqual(tCa.settings.uiLangCa, 'Català');
    assert.strictEqual(tCa.settings.uiLangEs, 'Español');
    assert.strictEqual(tCa.settings.uiLangEn, 'English');
    assert.strictEqual(tCa.settings.uiLangAuto, 'Automàtic');
    assert(tCa.settings.uiLangAutoHint.includes('exercicis') || tCa.settings.uiLangAutoHint.includes('teràpia'));

    // In Spanish UI
    await valeriaUiLang.setUiLang('es');
    const tEs = catalogModule.tNow();
    assert.strictEqual(tEs.settings.uiLangCa, 'Català');
    assert.strictEqual(tEs.settings.uiLangEs, 'Español');
    assert.strictEqual(tEs.settings.uiLangEn, 'English');
    assert.strictEqual(tEs.settings.uiLangAuto, 'Automático');

    // In English UI
    await valeriaUiLang.setUiLang('en');
    const tEn = catalogModule.tNow();
    assert.strictEqual(tEn.settings.uiLangCa, 'Catalan');
    assert.strictEqual(tEn.settings.uiLangEs, 'Español');
    assert.strictEqual(tEn.settings.uiLangEn, 'English');
    assert.strictEqual(tEn.settings.uiLangAuto, 'Automatic');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // SECTION 4: 1:1 Catalog Parity & Dynamic Function Robustness
  // ──────────────────────────────────────────────────────────────────────────
  console.log('── Section 4: 1:1 Catalog Parity & Dynamic Function Robustness ──');

  runTest('TEST-4.1: Namespace count and names parity across ES, EN, CA', () => {
    const esNamespaces = Object.keys(stringsEs.ES).sort();
    const enNamespaces = Object.keys(stringsEn.EN).sort();
    const caNamespaces = Object.keys(stringsCa.CA).sort();

    assert.strictEqual(esNamespaces.length, 29, 'ES has 29 namespaces');
    assert.deepStrictEqual(caNamespaces, esNamespaces, 'CA namespaces match ES namespaces exactly');
    assert.deepStrictEqual(enNamespaces, esNamespaces, 'EN namespaces match ES namespaces exactly');
  });

  runTest('TEST-4.2: Total keys count and deep structural parity across all 29 namespaces', () => {
    let esTotal = 0;
    let caTotal = 0;
    let enTotal = 0;

    for (const ns of Object.keys(stringsEs.ES)) {
      const esKeys = Object.keys(stringsEs.ES[ns]).sort();
      const caKeys = Object.keys(stringsCa.CA[ns]).sort();
      const enKeys = Object.keys(stringsEn.EN[ns]).sort();

      esTotal += esKeys.length;
      caTotal += caKeys.length;
      enTotal += enKeys.length;

      assert.deepStrictEqual(caKeys, esKeys, `Namespace '${ns}' keys in CA must match ES exactly`);
      assert.deepStrictEqual(enKeys, esKeys, `Namespace '${ns}' keys in EN must match ES exactly`);

      for (const key of esKeys) {
        const esType = typeof stringsEs.ES[ns][key];
        const caType = typeof stringsCa.CA[ns][key];
        const enType = typeof stringsEn.EN[ns][key];

        assert.strictEqual(caType, esType, `Type mismatch at ${ns}.${key}: CA is ${caType}, ES is ${esType}`);
        assert.strictEqual(enType, esType, `Type mismatch at ${ns}.${key}: EN is ${enType}, ES is ${esType}`);

        if (esType === 'string') {
          assert(stringsCa.CA[ns][key].trim().length > 0, `Empty string at ${ns}.${key} in CA`);
        }
      }
    }

    // Se comprueba la PARIDAD, no un número fijo: clavar el total obligaba a
    // editar este test cada vez que se añade una clave a la interfaz, y un
    // test que hay que retocar en cada cambio deja de leerse y se actualiza a
    // ciegas. Lo que no puede pasar es que un catálogo tenga claves que otro
    // no tenga, y eso es lo que se afirma aquí.
    assert(esTotal > 1000, `ES catalogue looks truncated: ${esTotal} keys`);
    assert.strictEqual(caTotal, esTotal, `CA has ${caTotal} keys, ES has ${esTotal}`);
    assert.strictEqual(enTotal, esTotal, `EN has ${enTotal} keys, ES has ${esTotal}`);
  });

  // Extract function parameter signatures from UiStrings in strings.es.ts AST
  const esSourceText = fs.readFileSync(stringsEsPath, 'utf8');
  const sourceFile = ts.createSourceFile(stringsEsPath, esSourceText, ts.ScriptTarget.Latest, true);

  const functionSignatures = new Map(); // "ns.key" -> ['string' | 'number' | 'boolean']

  function extractSignatures(node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'UiStrings') {
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.type && ts.isTypeLiteralNode(member.type)) {
          const nsName = member.name.text;
          for (const subMember of member.type.members) {
            if (ts.isPropertySignature(subMember) && subMember.type && ts.isFunctionTypeNode(subMember.type)) {
              const keyName = subMember.name.text;
              const paramTypes = subMember.type.parameters.map((p) => {
                if (p.type) {
                  if (p.type.kind === ts.SyntaxKind.NumberKeyword) return 'number';
                  if (p.type.kind === ts.SyntaxKind.BooleanKeyword) return 'boolean';
                  if (p.type.kind === ts.SyntaxKind.StringKeyword) return 'string';
                }
                return 'string';
              });
              functionSignatures.set(`${nsName}.${keyName}`, paramTypes);
            }
          }
        }
      }
    }
    ts.forEachChild(node, extractSignatures);
  }
  extractSignatures(sourceFile);

  runTest('TEST-4.3: Dynamic AST-Driven Execution of all 224 Interpolation Functions in CA', () => {
    let funcCount = 0;
    const knownKeys = {
      'ficha.genderLabel': 'Niña',
      'ficha.relationshipLabel': 'Madre',
      'ficha.pathologyLabel': 'Hipoacusia con Implante Coclear',
      'awards.itemName': 'snack_fish',
      'awards.itemUnlockCondition': 'snack_fish',
      'awards.badgeName': 'primera',
      'awards.badgeDesc': 'primera',
      'player.sectionGoal': 'scenario',
      'player.phaseLabel': 'concepto',
      'player.wordTypeLabel': 'sustantivo',
      'player.levelLabel': 'fácil',
      'pro.roleLabel': 'logopeda',
      'pro.patientAge': 4,
      'ar.levelLabel': 'A',
      'ar.levelNote': 'A',
    };

    for (const ns of Object.keys(stringsCa.CA)) {
      for (const key of Object.keys(stringsCa.CA[ns])) {
        const valCa = stringsCa.CA[ns][key];
        const valEs = stringsEs.ES[ns][key];
        const valEn = stringsEn.EN[ns][key];

        if (typeof valCa === 'function') {
          funcCount++;
          const fullKey = `${ns}.${key}`;
          const paramTypes = functionSignatures.get(fullKey) || Array.from({ length: valCa.length }, () => 'string');

          // Generate appropriate typed args
          const testArgs = paramTypes.map((pt, idx) => {
            if (idx === 0 && knownKeys[fullKey] !== undefined) return knownKeys[fullKey];
            if (pt === 'number') return (idx + 1) * 3;
            if (pt === 'boolean') return true;
            return `SampleVal_${idx}`;
          });

          let resCa, resEs, resEn;
          try {
            resCa = valCa.apply(null, testArgs);
            resEs = valEs.apply(null, testArgs);
            resEn = valEn.apply(null, testArgs);
          } catch (e) {
            assert.fail(`Function ${fullKey} threw error on args [${testArgs.join(', ')}]: ${e.message}`);
          }

          if (Array.isArray(resCa)) {
            assert(Array.isArray(resEs), `${fullKey} in ES must be array`);
            assert(Array.isArray(resEn), `${fullKey} in EN must be array`);
            assert(resCa.length > 0, `${fullKey} in CA returned empty array`);
          } else {
            assert.strictEqual(typeof resCa, 'string', `${fullKey} in CA must return string`);
            assert.strictEqual(typeof resEs, 'string', `${fullKey} in ES must return string`);
            assert.strictEqual(typeof resEn, 'string', `${fullKey} in EN must return string`);

            assert(resCa.length > 0, `${fullKey} in CA returned empty string on args [${testArgs.join(', ')}]`);
            assert(!resCa.includes('undefined'), `${fullKey} in CA contains 'undefined': "${resCa}"`);
            assert(!resCa.includes('null'), `${fullKey} in CA contains 'null': "${resCa}"`);
            assert(!resCa.includes('NaN'), `${fullKey} in CA contains 'NaN': "${resCa}"`);
            assert(!resCa.includes('[object Object]'), `${fullKey} in CA contains '[object Object]': "${resCa}"`);
            assert(!resCa.includes('${'), `${fullKey} in CA contains raw template literal: "${resCa}"`);
          }
        }
      }
    }

    assert.strictEqual(funcCount, 224, 'Successfully tested all 224 interpolation functions across catalogs');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Summary
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════════════════════════════');
  console.log(` Summary: ${passedTests} passed, ${failedTests} failed`);
  console.log('════════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    console.error('Failures detail:');
    for (const f of failureDetails) {
      console.error(`- ${f.name}: ${f.error}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

// ============================================================================
// Config plugin: monta el módulo nativo de Play Age Signals (solo Android).
// Mismo patrón que `plugins/withValeriaAR.js`:
//   1. copia `android-native/valeria-age-signals` a `android/valeria-age-signals`
//   2. incluye `:valeria-age-signals` en `settings.gradle`
//   3. añade `implementation project(':valeria-age-signals')` en `app/build.gradle`
//   4. registra `ValeriaAgeSignalsPackage()` en `MainApplication.kt`
// ============================================================================
const fs = require('fs');
const path = require('path');
const {
  withDangerousMod,
  withSettingsGradle,
  withAppBuildGradle,
  withMainApplication,
} = require('expo/config-plugins');

const MODULE_NAME = 'valeria-age-signals';
const SOURCE_DIR = path.join('android-native', MODULE_NAME);
const GRADLE_PATH = `:${MODULE_NAME}`;
const PACKAGE_IMPORT = 'import eu.futureforkids.valeria.agesignals.ValeriaAgeSignalsPackage';
const PACKAGE_ADD = 'add(ValeriaAgeSignalsPackage())';

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

const withAgeSignalsSources = (config) =>
  withDangerousMod(config, [
    'android',
    (cfg) => {
      const from = path.join(cfg.modRequest.projectRoot, SOURCE_DIR);
      const to = path.join(cfg.modRequest.platformProjectRoot, MODULE_NAME);
      if (!fs.existsSync(from)) {
        throw new Error(
          `[withValeriaAgeSignals] No existe ${SOURCE_DIR} en el repositorio.`,
        );
      }
      fs.rmSync(to, { recursive: true, force: true });
      copyDir(from, to);
      return cfg;
    },
  ]);

const withAgeSignalsSettings = (config) =>
  withSettingsGradle(config, (cfg) => {
    if (cfg.modResults.contents.includes(`include '${GRADLE_PATH}'`)) return cfg;
    cfg.modResults.contents +=
      `\n// Módulo nativo de Play Age Signals (plugins/withValeriaAgeSignals.js)\n` +
      `include '${GRADLE_PATH}'\n` +
      `project('${GRADLE_PATH}').projectDir = new File(rootProject.projectDir, '${MODULE_NAME}')\n`;
    return cfg;
  });

const withAgeSignalsDependency = (config) =>
  withAppBuildGradle(config, (cfg) => {
    const line = `    implementation project('${GRADLE_PATH}')`;
    if (cfg.modResults.contents.includes(line)) return cfg;
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /dependencies\s*\{/,
      (match) => `${match}\n${line}   // Play Age Signals`,
    );
    return cfg;
  });

const withAgeSignalsPackageRegistration = (config) =>
  withMainApplication(config, (cfg) => {
    let contents = cfg.modResults.contents;

    if (!contents.includes(PACKAGE_IMPORT)) {
      contents = contents.replace(
        /^(package .+)$/m,
        `$1\n\n// Play Age Signals (plugins/withValeriaAgeSignals.js)\n${PACKAGE_IMPORT}`,
      );
    }

    if (!contents.includes(PACKAGE_ADD)) {
      const anchor = /PackageList\(this\)\.packages\s*\.apply\s*\{/;
      if (anchor.test(contents)) {
        contents = contents.replace(anchor, (match) => `${match}\n          ${PACKAGE_ADD}`);
      } else {
        throw new Error(
          '[withValeriaAgeSignals] No se encontró `PackageList(this).packages.apply {` en MainApplication.kt.',
        );
      }
    }

    cfg.modResults.contents = contents;
    return cfg;
  });

module.exports = function withValeriaAgeSignals(config) {
  return [
    withAgeSignalsSources,
    withAgeSignalsSettings,
    withAgeSignalsDependency,
    withAgeSignalsPackageRegistration,
  ].reduce((acc, plugin) => plugin(acc), config);
};

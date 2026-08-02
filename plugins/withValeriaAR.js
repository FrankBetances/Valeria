// ============================================================================
// Config plugin: monta el módulo nativo del bloque de Realidad Aumentada.
//
// `android/` lo genera `expo prebuild` y no se versiona, así que el Kotlin del
// host de RA vive en `android-native/valeria-ar/` y entra en la compilación por
// aquí. Es el equivalente Android de lo que `ios-native/` hace para Xcode.
//
// Cinco pasos, todos idempotentes (un prebuild repetido no duplica nada):
//   1. copiar el módulo a android/valeria-ar
//   2. incluirlo en settings.gradle
//   3. añadir la dependencia al build.gradle de la app
//   4. registrar ValeriaArPackage() en MainApplication.kt
//   5. declarar el permiso de cámara y asegurar minSdk 24
//
// Si el módulo no llega a registrarse —por lo que sea— la app NO se rompe:
// `NativeModules.ValeriaAr` queda undefined, `isArAvailable()` devuelve false y
// la tarjeta del hub no se renderiza. Es el mismo camino que en Expo Go.
// ============================================================================
const fs = require('fs');
const path = require('path');
const {
  withDangerousMod,
  withSettingsGradle,
  withAppBuildGradle,
  withMainApplication,
  withAndroidManifest,
  withProjectBuildGradle,
  AndroidConfig,
} = require('expo/config-plugins');

const MODULE_NAME = 'valeria-ar';
const SOURCE_DIR = path.join('android-native', MODULE_NAME);
// Los .glb viven en assets/models porque son del proyecto, no del módulo
// Android: una sola copia versionada, visible, y reutilizable el día que iOS
// necesite su equivalente en USDZ. El prebuild los deja donde Android los lee.
const MODELS_DIR = path.join('assets', 'models');
const GRADLE_PATH = `:${MODULE_NAME}`;
const PACKAGE_IMPORT = 'import eu.futureforkids.valeria.ar.ValeriaArPackage';
const PACKAGE_ADD = 'add(ValeriaArPackage())';
const MIN_SDK = 24;

// --- 1. Copiar las fuentes al árbol generado -------------------------------
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(src, dst);
    else fs.copyFileSync(src, dst);
  }
}

const withArSources = (config) =>
  withDangerousMod(config, [
    'android',
    (cfg) => {
      const from = path.join(cfg.modRequest.projectRoot, SOURCE_DIR);
      const to = path.join(cfg.modRequest.platformProjectRoot, MODULE_NAME);
      if (!fs.existsSync(from)) {
        throw new Error(
          `[withValeriaAR] No existe ${SOURCE_DIR}. El módulo nativo de Realidad Aumentada ` +
          'tiene que estar en el repositorio antes del prebuild (ver android-native/README.md).',
        );
      }
      // Borrar antes de copiar: si un fichero se renombra en el repo, el viejo
      // no puede quedarse vivo en el árbol generado y compilar por su cuenta.
      fs.rmSync(to, { recursive: true, force: true });
      copyDir(from, to);

      // Los modelos 3D, a los assets del módulo. El enum ArModel de Kotlin los
      // busca en `models/<nombre>.glb`, así que la subcarpeta importa.
      const modelsFrom = path.join(cfg.modRequest.projectRoot, MODELS_DIR);
      const modelsTo = path.join(to, 'src', 'main', 'assets', 'models');
      const glbs = fs.existsSync(modelsFrom)
        ? fs.readdirSync(modelsFrom).filter((f) => f.endsWith('.glb'))
        : [];
      if (glbs.length) {
        fs.mkdirSync(modelsTo, { recursive: true });
        glbs.forEach((f) => fs.copyFileSync(path.join(modelsFrom, f), path.join(modelsTo, f)));
      } else {
        // No es un error: sin GLB la escena cae a la sobreimpresión 2D y los
        // tres ejercicios siguen siendo jugables y medibles. Pero conviene
        // saberlo al mirar el log del build y no al mirar el teléfono.
        console.warn(
          '[withValeriaAR] No hay .glb en assets/models: la escena 3D usará las formas de respaldo. ' +
          'Genera los modelos con `npm run build:ar-models`.',
        );
      }
      return cfg;
    },
  ]);

// --- 2. settings.gradle ----------------------------------------------------
const withArSettings = (config) =>
  withSettingsGradle(config, (cfg) => {
    if (cfg.modResults.contents.includes(`include '${GRADLE_PATH}'`)) return cfg;
    cfg.modResults.contents +=
      `\n// Módulo nativo del bloque de Realidad Aumentada (plugins/withValeriaAR.js)\n` +
      `include '${GRADLE_PATH}'\n` +
      `project('${GRADLE_PATH}').projectDir = new File(rootProject.projectDir, '${MODULE_NAME}')\n`;
    return cfg;
  });

// --- 3. build.gradle de la app --------------------------------------------
const withArDependency = (config) =>
  withAppBuildGradle(config, (cfg) => {
    const line = `    implementation project('${GRADLE_PATH}')`;
    if (cfg.modResults.contents.includes(line)) return cfg;
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /dependencies\s*\{/,
      (match) => `${match}\n${line}   // bloque de Realidad Aumentada`,
    );
    return cfg;
  });

// --- 4. MainApplication.kt -------------------------------------------------
const withArPackageRegistration = (config) =>
  withMainApplication(config, (cfg) => {
    let contents = cfg.modResults.contents;

    if (!contents.includes(PACKAGE_IMPORT)) {
      contents = contents.replace(
        /^(package .+)$/m,
        `$1\n\n// Bloque de Realidad Aumentada (plugins/withValeriaAR.js)\n${PACKAGE_IMPORT}`,
      );
    }

    if (!contents.includes(PACKAGE_ADD)) {
      // La plantilla de Expo deja este `apply` justamente para los paquetes que
      // el autolinking no puede resolver, que es el caso de un módulo local.
      const anchor = /PackageList\(this\)\.packages\s*\.apply\s*\{/;
      if (anchor.test(contents)) {
        contents = contents.replace(anchor, (match) => `${match}\n          ${PACKAGE_ADD}`);
      } else {
        throw new Error(
          '[withValeriaAR] No se encontró el bloque `PackageList(this).packages.apply {` en ' +
          'MainApplication.kt. La plantilla de Expo ha cambiado: hay que actualizar el plugin ' +
          'antes de seguir, porque sin registro el bloque de RA no aparece.',
        );
      }
    }

    cfg.modResults.contents = contents;
    return cfg;
  });

// --- 5a. Permiso de cámara -------------------------------------------------
// Se declara también aquí, y no solo en el manifiesto del módulo, para que
// quede visible en el manifiesto de la app: es el permiso que Play contrasta
// contra la ficha de Seguridad de los datos y contra la política de privacidad.
const withCameraPermission = (config) =>
  withAndroidManifest(config, (cfg) => {
    AndroidConfig.Permissions.ensurePermissions(cfg.modResults, ['android.permission.CAMERA']);
    return cfg;
  });

// --- 5b. minSdk 24 ---------------------------------------------------------
const withMinSdk = (config) =>
  withProjectBuildGradle(config, (cfg) => {
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /minSdkVersion\s*=\s*Integer\.parseInt\(findProperty\('android\.minSdkVersion'\)\s*\?:\s*'(\d+)'\)/,
      (match, current) =>
        Number(current) >= MIN_SDK
          ? match
          : match.replace(`'${current}'`, `'${MIN_SDK}'`),
    );
    return cfg;
  });

module.exports = function withValeriaAR(config) {
  return [
    withArSources,
    withArSettings,
    withArDependency,
    withArPackageRegistration,
    withCameraPermission,
    withMinSdk,
  ].reduce((acc, plugin) => plugin(acc), config);
};

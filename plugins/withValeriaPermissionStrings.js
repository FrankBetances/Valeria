// ============================================================================
// Config plugin: textos de permiso del sistema en varios idiomas (EN-2.5).
//
// El problema: las cadenas de permiso de `app.json` (micrófono, reconocimiento
// de voz, cámara) son UNA sola, en castellano, y las pinta el SISTEMA
// OPERATIVO, no la app. Da igual que la interfaz esté en inglés: el primer
// diálogo que ve una familia de Ohio sale en español. Y es el primero de todos,
// antes de que puedan tocar nada.
//
// iOS resuelve esto con `InfoPlist.strings` por idioma: el sistema elige el
// fichero según el idioma del DISPOSITIVO. Este plugin:
//   1. declara `CFBundleLocalizations` (es, en) para que iOS sepa que la app
//      está localizada en las dos —sin esto, ignora los .lproj—;
//   2. escribe `ios/<proyecto>/{es,en}.lproj/InfoPlist.strings` con las tres
//      claves de uso.
//
// Android NO tiene equivalente: el diálogo de permiso runtime lo redacta el
// propio sistema y ya viene traducido; lo que la app aporta es, como mucho, el
// rationale que se muestra dentro de la UI, y ese ya pasa por el catálogo.
// Por eso aquí solo hay iOS. (Consecuencia práctica: en la build Android de
// evaluación este plugin no cambia nada, y no debía cambiarlo.)
//
// Los textos viven aquí y no en el catálogo de `src/i18n` a propósito: esto se
// ejecuta en BUILD-TIME, en Node, antes de que exista la app. Importar el
// catálogo de TypeScript desde un config plugin acoplaría la tubería nativa al
// bundler. Si cambian, hay que cambiarlos en los dos sitios — está anotado en
// el plan (EN-2.5).
// ============================================================================
const fs = require('fs');
const path = require('path');
const { withInfoPlist, withDangerousMod } = require('@expo/config-plugins');

const LOCALIZATIONS = ['es', 'en'];

// Clave de Info.plist → texto por idioma.
const USAGE_STRINGS = {
  NSMicrophoneUsageDescription: {
    es: 'Valeria+ usa el micrófono para los juegos de voz de los ejercicios.',
    en: 'Valeria+ uses the microphone for the voice games in the exercises.',
  },
  NSSpeechRecognitionUsageDescription: {
    es: 'Valeria+ usa el reconocimiento de voz para valorar las palabras que dice el niño.',
    en: 'Valeria+ uses speech recognition to score the words your child says.',
  },
  NSCameraUsageDescription: {
    es: 'Valeria+ usa la cámara para los ejercicios de Realidad Aumentada. No se graba ni se envía ningún vídeo.',
    en: 'Valeria+ uses the camera for the Augmented Reality exercises. No video is recorded or sent anywhere.',
  },
};

// Escapa comillas y saltos: el formato .strings es sensible a ambos.
const escape = (v) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');

const stringsFileFor = (lang) =>
  Object.entries(USAGE_STRINGS)
    .map(([key, byLang]) => `"${key}" = "${escape(byLang[lang])}";`)
    .join('\n') + '\n';

const withValeriaPermissionStrings = (config) => {
  // 1) Declarar los idiomas soportados. Sin esta clave iOS no mira los .lproj.
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.CFBundleLocalizations = LOCALIZATIONS;
    // El castellano sigue siendo el idioma base: es lo que ve un dispositivo
    // configurado en una lengua que no cubrimos.
    cfg.modResults.CFBundleDevelopmentRegion = 'es';
    return cfg;
  });

  // 2) Escribir un InfoPlist.strings por idioma dentro del proyecto iOS.
  config = withDangerousMod(config, [
    'ios',
    (cfg) => {
      const projectName = cfg.modRequest.projectName;
      const iosRoot = cfg.modRequest.platformProjectRoot;
      for (const lang of LOCALIZATIONS) {
        const dir = path.join(iosRoot, projectName, `${lang}.lproj`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'InfoPlist.strings'), stringsFileFor(lang), 'utf8');
      }
      return cfg;
    },
  ]);

  return config;
};

module.exports = withValeriaPermissionStrings;

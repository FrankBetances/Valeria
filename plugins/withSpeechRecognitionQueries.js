// Config plugin: añade al AndroidManifest la consulta del servicio de
// reconocimiento de voz. Sin ella, en Android 11+ (API 30) la app no puede
// "ver" el reconocedor del sistema y @react-native-voice/voice no arranca.
//   <queries><intent>
//     <action android:name="android.speech.RecognitionService" />
//   </intent></queries>
const { withAndroidManifest } = require('expo/config-plugins');

const ACTION = 'android.speech.RecognitionService';

module.exports = function withSpeechRecognitionQueries(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    if (!Array.isArray(manifest.queries)) manifest.queries = [{}];
    const queries = manifest.queries[0];
    if (!Array.isArray(queries.intent)) queries.intent = [];
    const exists = queries.intent.some((intent) =>
      (intent.action ?? []).some((a) => a.$?.['android:name'] === ACTION),
    );
    if (!exists) {
      queries.intent.push({ action: [{ $: { 'android:name': ACTION } }] });
    }
    return cfg;
  });
};

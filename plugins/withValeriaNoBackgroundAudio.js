// ============================================================================
// Config plugin: quita del manifiesto fusionado el permiso de reproducción en
// segundo plano que Google bloqueó el 1/9/2026.
//
// Aviso literal de Play Console:
//   «Tu aplicación usa el permiso FOREGROUND_SERVICE_MEDIA_PLAYBACK. Solo
//    puedes usar este permiso si tu aplicación realiza tareas que son
//    perceptibles para el usuario cuando no está interactuando directamente
//    con ella.»
//
// Valeria+ nunca lo declaró. Lo trae `expo-audio` en su propio manifiesto
// (node_modules/expo-audio/android/src/main/AndroidManifest.xml), que declara
// dos permisos y dos servicios en primer plano:
//
//   FOREGROUND_SERVICE                → AudioControlsService (mediaPlayback)
//   FOREGROUND_SERVICE_MEDIA_PLAYBACK → AudioRecordingService (microphone)
//
// y el fusionador de manifiestos los mete en el APK aunque no se usen. Aquí no
// se usan: los tres únicos consumidores de expo-audio —`valeriaVoicePlayback`,
// `valeriaNoise` y `ValeriaSensory/sensoryAudio`— llaman a `setAudioModeAsync`
// con `shouldPlayInBackground: false`, y el micrófono lo lleva
// expo-speech-recognition, no el grabador de expo-audio. Sin servicio en primer
// plano que arrancar, el permiso es solo la causa del bloqueo.
//
// `tools:node="remove"` es la herramienta del propio fusionador para esto: no
// parchea node_modules ni fija una versión de expo-audio, así que sobrevive a
// una actualización de la librería.
//
// Si algún día Valeria+ necesitara sonar con la app en segundo plano —una
// sesión guiada por voz con la pantalla apagada—, esto hay que quitarlo Y
// justificar el permiso en Play Console. Lo sujeta
// `scripts/check-no-background-audio.js`, que falla si alguien pone
// `shouldPlayInBackground: true` con el permiso retirado.
// ============================================================================
const { withAndroidManifest } = require('expo/config-plugins');

const TOOLS_NS = 'http://schemas.android.com/tools';

// Permisos que entran por expo-audio y que esta app no puede justificar.
const PERMISSIONS = [
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
];

// Los servicios que los pedían. Se retiran con ellos: dejar declarado un
// servicio en primer plano cuyo permiso ya no está es un ANR esperando a que
// alguien lo arranque.
const SERVICES = [
  'expo.modules.audio.service.AudioControlsService',
  'expo.modules.audio.service.AudioRecordingService',
];

const withValeriaNoBackgroundAudio = (config) =>
  withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;

    // Sin el espacio de nombres `tools`, `tools:node` es un atributo cualquiera
    // y el fusionador lo ignora en silencio: el permiso seguiría en el APK.
    manifest.$ = manifest.$ || {};
    manifest.$['xmlns:tools'] = TOOLS_NS;

    // 1) Permisos. Se sustituye cualquier declaración previa —propia o de otro
    //    plugin— por la orden de retirada: dos entradas con el mismo nombre y
    //    órdenes contrarias dejarían el resultado a merced del orden de mezcla.
    const kept = (manifest['uses-permission'] || []).filter(
      (p) => !PERMISSIONS.includes(p?.$?.['android:name']),
    );
    manifest['uses-permission'] = kept.concat(
      PERMISSIONS.map((name) => ({ $: { 'android:name': name, 'tools:node': 'remove' } })),
    );

    // 2) Servicios.
    const application = manifest.application?.[0];
    if (!application) {
      throw new Error(
        '[withValeriaNoBackgroundAudio] El manifiesto no tiene <application>. El prebuild ha ' +
        'cambiado: sin este paso el APK vuelve a llevar FOREGROUND_SERVICE_MEDIA_PLAYBACK y Play ' +
        'lo rechaza.',
      );
    }
    const keptServices = (application.service || []).filter(
      (svc) => !SERVICES.includes(svc?.$?.['android:name']),
    );
    application.service = keptServices.concat(
      SERVICES.map((name) => ({ $: { 'android:name': name, 'tools:node': 'remove' } })),
    );

    return cfg;
  });

module.exports = withValeriaNoBackgroundAudio;

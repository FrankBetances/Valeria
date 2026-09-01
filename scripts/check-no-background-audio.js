#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · El APK no puede llevar permisos de servicio en primer plano
 *   node scripts/check-no-background-audio.js
 *
 * Nace del bloqueo de Play del 1/9/2026:
 *
 *   «Tu aplicación usa el permiso FOREGROUND_SERVICE_MEDIA_PLAYBACK. Solo
 *    puedes usar este permiso si tu aplicación realiza tareas que son
 *    perceptibles para el usuario cuando no está interactuando directamente
 *    con ella.»
 *
 * Nadie lo escribió: lo trae el manifiesto de `expo-audio` y el fusionador lo
 * mete en el APK. `plugins/withValeriaNoBackgroundAudio.js` lo retira con
 * `tools:node="remove"`, y esto vigila las tres formas de que vuelva:
 *
 *   1. que el plugin deje de estar registrado en app.json;
 *   2. que una versión nueva de expo-audio declare un servicio en primer plano
 *      que el plugin todavía no nombra —lo comprueba contra el manifiesto real
 *      de node_modules, no contra una lista escrita a mano—;
 *   3. que la app empiece de verdad a sonar o grabar en segundo plano, que es
 *      el único caso en que el permiso estaría justificado. Entonces esto falla
 *      a propósito: hay que quitar el plugin Y declararlo en Play Console.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PLUGIN_REL = './plugins/withValeriaNoBackgroundAudio';
const PLUGIN_FILE = path.join(ROOT, 'plugins', 'withValeriaNoBackgroundAudio.js');
const AUDIO_MANIFEST = path.join(
  ROOT, 'node_modules', 'expo-audio', 'android', 'src', 'main', 'AndroidManifest.xml',
);

const fail = [];

// --- 1. El plugin sigue montado -------------------------------------------
const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8'));
const plugins = (appJson.expo.plugins || []).map((p) => (Array.isArray(p) ? p[0] : p));
if (!plugins.includes(PLUGIN_REL)) {
  fail.push(
    `app.json no registra ${PLUGIN_REL}. Sin él, el manifiesto fusionado vuelve a llevar ` +
    'FOREGROUND_SERVICE_MEDIA_PLAYBACK y Play rechaza la subida.',
  );
}

// Y que nadie lo haya declarado a mano por el otro lado.
for (const perm of appJson.expo.android?.permissions || []) {
  if (perm.includes('FOREGROUND_SERVICE')) {
    fail.push(`app.json declara ${perm}. Play lo bloquea: esta app no suena en segundo plano.`);
  }
}

const pluginSrc = fs.existsSync(PLUGIN_FILE) ? fs.readFileSync(PLUGIN_FILE, 'utf8') : '';
if (!pluginSrc) {
  fail.push('Falta plugins/withValeriaNoBackgroundAudio.js.');
} else if (!pluginSrc.includes('xmlns:tools')) {
  // Sin el espacio de nombres, `tools:node` es un atributo cualquiera y el
  // fusionador lo ignora sin decir nada: el permiso seguiría en el APK.
  fail.push('El plugin no declara xmlns:tools; `tools:node="remove"` no haría nada.');
}

// --- 2. Todo lo que expo-audio declara está cubierto ----------------------
// Contra el manifiesto instalado, para que una versión nueva con un servicio
// más no pase de largo. Si no hay node_modules (ejecución en seco), se avisa y
// se sigue: en CI siempre los hay, porque `npm ci` va antes que los gates.
if (fs.existsSync(AUDIO_MANIFEST)) {
  const xml = fs.readFileSync(AUDIO_MANIFEST, 'utf8');
  const declared = (re) => [...xml.matchAll(re)].map((m) => m[1]);

  const perms = declared(/<uses-permission[^>]*android:name="([^"]+)"/g)
    .filter((n) => n.includes('FOREGROUND_SERVICE'));
  const services = declared(/<service\b[^>]*android:name="([^"]+)"/g)
    // El manifiesto de la librería los escribe con punto inicial, relativos a
    // su propio paquete; en el manifiesto fusionado llegan expandidos.
    .map((n) => (n.startsWith('.') ? `expo.modules.audio${n}` : n));

  for (const perm of perms) {
    if (!pluginSrc.includes(perm)) {
      fail.push(
        `expo-audio declara ${perm} y el plugin no lo retira. Añádelo a PERMISSIONS en ` +
        'plugins/withValeriaNoBackgroundAudio.js.',
      );
    }
  }
  for (const svc of services) {
    if (!pluginSrc.includes(svc)) {
      fail.push(
        `expo-audio declara el servicio ${svc} y el plugin no lo retira. Añádelo a SERVICES en ` +
        'plugins/withValeriaNoBackgroundAudio.js.',
      );
    }
  }
} else {
  console.warn('· sin node_modules/expo-audio: no se ha podido contrastar el manifiesto real.');
}

// --- 3. La app sigue sin sonar ni grabar en segundo plano -----------------
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
}).filter((p) => /\.(ts|tsx)$/.test(p));

// `useAudioRecorder` y compañía arrancan AudioRecordingService, que es el otro
// servicio en primer plano del paquete.
const RECORDING_API = /\b(useAudioRecorder|AudioRecorder|prepareToRecordAsync|RecordingPresets)\b/;

for (const file of walk(path.join(ROOT, 'src'))) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  if (/shouldPlayInBackground\s*:\s*true/.test(src) || /staysActiveInBackground\s*:\s*true/.test(src)) {
    fail.push(
      `${rel} pide audio en segundo plano. Eso SÍ necesita ` +
      'FOREGROUND_SERVICE_MEDIA_PLAYBACK: hay que quitar el plugin y justificar el permiso en ' +
      'Play Console antes de mergear esto.',
    );
  }
  if (RECORDING_API.test(src)) {
    fail.push(
      `${rel} usa el grabador de expo-audio. El micrófono lo lleva expo-speech-recognition; ` +
      'el grabador arrancaría AudioRecordingService, que este plugin retira.',
    );
  }
}

if (fail.length) {
  console.error('✗ Permisos de servicio en primer plano:\n');
  fail.forEach((f) => console.error(`  · ${f}`));
  process.exit(1);
}
console.log('✓ Sin servicios en primer plano: el APK no lleva FOREGROUND_SERVICE_MEDIA_PLAYBACK.');

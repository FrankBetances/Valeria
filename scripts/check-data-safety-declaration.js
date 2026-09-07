#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · La declaración de datos no se queda atrás del código
 *   node scripts/check-data-safety-declaration.js
 *
 * Google contrasta el formulario de «Seguridad de los datos» de Play Console
 * contra site/privacidad.html. CLAUDE.md obliga a tocar las dos cosas en el
 * mismo cambio cuando la app empieza a recoger algo nuevo, pero hasta hoy no
 * lo comprobaba nadie: la ficha ganó los campos `lingua` y `seseo` y la
 * política se actualizó a mano, de milagro.
 *
 * Este gate no sabe si la declaración es correcta —eso lo decide una persona—.
 * Sabe cuándo ha dejado de ser válida, que es lo que se olvida. Seis
 * comprobaciones, todas sobre lo que cambia la superficie de datos:
 *
 *   D1 · La ficha del paciente no tiene campos que la declaración no nombre.
 *   D2 · app.json no pide permisos que la declaración no nombre.
 *   D3 · package.json no trae dependencias nuevas (el caso «SDK de terceros»).
 *   D4 · La app no ha estrenado una llamada de red propia.
 *   D5 · La nube sigue igual de (in)alcanzable que lo que dice el documento.
 *   D6 · La versión de app.json, las dos políticas y el documento coinciden.
 *
 * Cuando uno falla, la respuesta NUNCA es subir el número aquí y seguir: es
 * abrir docs/play-console-seguridad-datos.md, decidir qué cambia en el
 * formulario, actualizar site/privacidad.html y site/privacy.html, y luego
 * ajustar la lista de abajo.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOC = path.join('docs', 'play-console-seguridad-datos.md');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };
const ok = (msg) => console.log('  ✓ ' + msg);

// --- Lo declarado hoy en docs/play-console-seguridad-datos.md --------------

// Campos de la ficha del paciente. Los enumera §3.2 del documento y la fila
// «Ficha del paciente» de las dos políticas.
const CAMPOS_FICHA = [
  'nombre', 'fecha', 'nhc', 'genero', 'tutor', 'vinculo',
  'email', 'tel', 'patologia', 'medico', 'logopeda',
  'lingua', 'seseo',
];

// Permisos. Los de app.json más los que montan los plugins.
const PERMISOS = ['android.permission.CAMERA'];

// Dependencias de ejecución. NINGUNA tiene recorrido de datos: son UI,
// navegación o medios empaquetados. `firebase` estaba aquí hasta el 7/9/2026.
const DEPENDENCIAS = [
  '@react-native-async-storage/async-storage',
  '@react-navigation/bottom-tabs', '@react-navigation/native',
  '@react-navigation/native-stack',
  'expo', 'expo-asset', 'expo-audio', 'expo-build-properties',
  'expo-dev-client', 'expo-notifications', 'expo-speech',
  'expo-speech-recognition', 'expo-splash-screen', 'expo-status-bar',
  'react', 'react-native', 'react-native-safe-area-context',
  'react-native-screens', 'react-native-svg',
];

// §2 del documento: la app NO tiene backend. Firebase se retiró el 7/9/2026 —de
// Android y del port iOS, donde además enlazaba Analytics y Crashlytics—. Si
// vuelve un SDK de nube, el formulario pasa a declarar datos personales y de
// salud, y hay que reescribir las dos políticas antes de publicar.
const HAY_BACKEND = false;

// --- D1 · Campos de la ficha ----------------------------------------------
{
  const src = read(path.join('src', 'ValeriaFichaRegistroScreen.tsx'));
  const i = src.indexOf('STORAGE_KEYS.registro');
  if (i < 0) {
    fallo('D1 · no encuentro el guardado de la ficha (STORAGE_KEYS.registro) en ValeriaFichaRegistroScreen.tsx');
  } else {
    const bloque = src.slice(src.indexOf('{', src.indexOf('JSON.stringify(', i)) + 1, src.indexOf('}));', i));
    const campos = new Set();
    // Solo claves: `nombre: X` o la línea de atajos `nombre, fecha, nhc,`. Así
    // los ternarios del valor (`? true : undefined`) no entran como campos.
    for (const bruta of bloque.split('\n')) {
      const linea = bruta.replace(/\/\/.*$/, '').trim();
      if (!linea) continue;
      const conValor = linea.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:/);
      if (conValor) { campos.add(conValor[1]); continue; }
      if (/^[a-zA-Z_][a-zA-Z0-9_]*(\s*,\s*[a-zA-Z_][a-zA-Z0-9_]*)*,?$/.test(linea)) {
        for (const c of linea.split(',')) if (c.trim()) campos.add(c.trim());
      }
    }
    const nuevos = [...campos].filter((c) => !CAMPOS_FICHA.includes(c));
    if (nuevos.length) {
      fallo(`D1 · la ficha guarda campos que la declaración no nombra: ${nuevos.join(', ')}.\n`
        + `      Un campo nuevo en la ficha obliga a repasar ${DOC} §3.2, la fila\n`
        + '      «Ficha del paciente» de site/privacidad.html y site/privacy.html, y el\n'
        + '      formulario de Seguridad de los datos de Play Console.');
    } else if (campos.size < 8) {
      fallo(`D1 · solo he sabido leer ${campos.size} campos de la ficha; el extractor está roto, no la ficha.`);
    } else {
      ok(`D1 · los ${campos.size} campos de la ficha están declarados`);
    }
  }
}

// --- D2 · Permisos ---------------------------------------------------------
{
  const app = JSON.parse(read('app.json')).expo;
  const pedidos = (app.android && app.android.permissions) || [];
  const nuevos = pedidos.filter((p) => !PERMISOS.includes(p));
  if (nuevos.length) {
    fallo(`D2 · app.json pide permisos sin declarar: ${nuevos.join(', ')}.\n`
      + `      Ver ${DOC} §1 y la tabla de permisos (§3.3) de las dos políticas.`);
  } else {
    ok(`D2 · ${pedidos.length} permiso(s) en app.json, todos declarados`);
  }
}

// --- D3 · Dependencias -----------------------------------------------------
{
  const deps = Object.keys(JSON.parse(read('package.json')).dependencies || {});
  const nuevas = deps.filter((d) => !DEPENDENCIAS.includes(d));
  const idas = DEPENDENCIAS.filter((d) => !deps.includes(d));
  if (nuevas.length) {
    fallo(`D3 · dependencias nuevas sin repasar: ${nuevas.join(', ')}.\n`
      + '      Si alguna envía datos a un tercero, es el caso «SDK de terceros» de\n'
      + `      CLAUDE.md: se actualizan ${DOC}, las dos políticas y el formulario.`);
  } else if (idas.length) {
    fallo(`D3 · dependencias que ya no están: ${idas.join(', ')}. Quítalas de la lista del gate.`);
  } else {
    ok(`D3 · ${deps.length} dependencias, ninguna nueva`);
  }
}

// --- D4 · Salida de red propia --------------------------------------------
{
  const sospechas = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) { walk(rel); continue; }
      if (!/\.tsx?$/.test(e.name)) continue;
      const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      txt.split('\n').forEach((linea, n) => {
        // Comentarios fuera: esto busca código, no prosa que hable de red.
        const codigo = linea.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
        if (/\bfetch\s*\(|\bXMLHttpRequest\b|<WebView\b/.test(codigo)) {
          sospechas.push(`${rel}:${n + 1}`);
        }
      });
    }
  };
  walk('src');
  if (fs.existsSync(path.join(ROOT, 'App.tsx'))) {
    const txt = read('App.tsx');
    txt.split('\n').forEach((linea, n) => {
      const codigo = linea.replace(/\/\/.*$/, '');
      if (/\bfetch\s*\(|\bXMLHttpRequest\b|<WebView\b/.test(codigo)) sospechas.push(`App.tsx:${n + 1}`);
    });
  }
  if (sospechas.length) {
    fallo(`D4 · la app ha estrenado salida de red propia: ${sospechas.join(', ')}.\n`
      + `      ${DOC} §1 declara cero llamadas de red. Si esta es legítima, hay que\n`
      + '      decir a dónde va y qué manda, en el documento y en las dos políticas.');
  } else {
    ok('D4 · la app no abre ni una conexión propia');
  }
}

// --- D5 · ¿Ha vuelto un backend? ------------------------------------------
// Un SDK de nube reintroducido cambia la respuesta del formulario entera, y es
// exactamente lo que pasa desapercibido: se añade para «guardar una cosita» y
// la declaración se queda diciendo que no sale nada del dispositivo.
{
  const rastros = [];
  const SDK_NUBE = /^(firebase|@react-native-firebase\/|@supabase\/|@aws-amplify\/|@sentry\/|@amplitude\/|posthog-|mixpanel-|@datadog\/|@react-native-google-signin\/)/;

  if (fs.existsSync(path.join(ROOT, 'src', 'firebase'))) rastros.push('existe src/firebase/');
  for (const f of ['firestore.rules', 'firebase.json', '.firebaserc', 'google-services.json',
    path.join('src', 'ValeriaAuthScreen.tsx')]) {
    if (fs.existsSync(path.join(ROOT, f))) rastros.push(`existe ${f}`);
  }
  for (const d of Object.keys(JSON.parse(read('package.json')).dependencies || {})) {
    if (SDK_NUBE.test(d)) rastros.push(`dependencia de nube: ${d}`);
  }
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) { walk(rel); continue; }
      if (!/\.tsx?$/.test(e.name)) continue;
      const txt = fs.readFileSync(path.join(ROOT, rel), 'utf8');
      if (/from\s+['"](firebase|@react-native-firebase)/.test(txt)) rastros.push(`${rel} importa firebase`);
    }
  };
  walk('src');
  // El port iOS enlazaba FirebaseAnalytics y FirebaseCrashlytics de verdad.
  const pbx = path.join('ios-native', 'Valeria.xcodeproj', 'project.pbxproj');
  if (fs.existsSync(path.join(ROOT, pbx)) && /Firebase/i.test(read(pbx))) {
    rastros.push(`${pbx} vuelve a enlazar Firebase`);
  }

  const hay = rastros.length > 0;
  if (hay !== HAY_BACKEND) {
    if (hay) {
      fallo('D5 · ha vuelto un SDK de nube o backend:\n'
        + rastros.map((x) => `        ${x}`).join('\n')
        + `\n      ${DOC} §2 declara que la app no tiene backend, y las dos políticas\n`
        + '      abren diciendo que de la app no salen datos. Si esto es deliberado,\n'
        + '      hay que reescribir las tres cosas ANTES de publicar y poner\n'
        + '      HAY_BACKEND = true; si no lo es, quítalo.');
    } else {
      fallo('D5 · la declaración dice que hay backend, pero no encuentro ni un rastro.');
    }
  } else {
    ok('D5 · sin SDK de nube ni backend, como declara el documento');
  }
}

// --- D6 · La versión coincide en los cuatro sitios ------------------------
{
  const version = JSON.parse(read('app.json')).expo.version;
  const sitios = [
    ['site/privacidad.html', new RegExp(`Versión de la app:</strong> ${version}\\b`)],
    ['site/privacy.html', new RegExp(`App version:</strong> ${version}\\b`)],
    [DOC, new RegExp(`\\b${version.replace(/\./g, '\\.')}\\b`)],
  ];
  const desfasados = sitios.filter(([f, re]) => !re.test(read(f))).map(([f]) => f);
  if (desfasados.length) {
    fallo(`D6 · app.json va por la ${version} y estos no lo dicen: ${desfasados.join(', ')}.\n`
      + '      Subir la versión de la app obliga a repasar qué recoge esa versión.');
  } else {
    ok(`D6 · la versión ${version} coincide en app.json, las dos políticas y el documento`);
  }
}

console.log(fallos === 0
  ? '\n✅ La declaración de datos sigue describiendo lo que hace la app.'
  : `\n❌ ${fallos} desajuste(s) entre el código y la declaración de datos.`);
process.exit(fallos === 0 ? 0 : 1);

#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de la captura de corpus del ASR (Fase B · R7)
 *   node scripts/check-asr-capture-guard.js
 *
 * La Fase B necesita guardar el audio del turno de habla para poder pasar la
 * MISMA grabación por el reconocedor del sistema y por el motor candidato
 * (docs/plan-asr-privacidad-y-motor-local.md §4.2 y §4.5). Ese audio es voz de
 * un menor con dificultades del lenguaje: dato de salud del art. 9 del RGPD.
 *
 * El riesgo R7 del plan no es que el código esté mal escrito. Es que una build
 * con la captura encendida se quede en el aparato de una familia, o que una
 * grabación acabe en el repositorio. Las dos cosas pasan por descuido, no por
 * error de programación, y por eso se comprueban aquí en cada build:
 *
 *   C1 · `persist` / `recordingOptions` aparece en UN solo sitio de `src/`,
 *        dentro de `valeriaVoice.ts`.
 *   C2 · La bandera que lo gobierna exige `__DEV__` **y** la variable de
 *        entorno. Si alguien quita `__DEV__` "para probar en release", esto
 *        falla: es justo el cambio que no puede colarse en una revisión.
 *   C3 · Ningún archivo VERSIONADO enciende `EXPO_PUBLIC_ASR_CAPTURE`. Ni el
 *        `.env.example`, ni `app.json`, ni `eas.json`, ni los workflows.
 *   C4 · El directorio del corpus está en `.gitignore`.
 *   C5 · Git no rastrea nada dentro del directorio del corpus, ni ningún audio
 *        fuera de `assets/` (donde viven los assets legítimos de la app).
 *
 * C2 es el corazón: sin `__DEV__` la rama sobreviviría a la minificación y la
 * captura sería una variable de entorno de distancia en un AAB de Play.
 * ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const rel = (p) => path.relative(ROOT, p);

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };
const ok = (msg) => console.log('  ✓ ' + msg);

const CAPTURE_VAR = 'EXPO_PUBLIC_ASR_CAPTURE';
const CORPUS_DIR = 'corpus-asr';

// Recorre src/ sin depender de globs del shell.
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// --- C1 · la persistencia de audio vive en un único archivo -----------------
const fuentes = walk(path.join(ROOT, 'src'));
const conPersist = fuentes.filter((f) => {
  const src = fs.readFileSync(f, 'utf8');
  return /recordingOptions|persist\s*:/.test(src);
});

if (conPersist.length === 0) {
  fallo('No se encontró la captura de audio en src/. Si se ha retirado a propósito, hay que retirar también este gate.');
} else if (conPersist.length > 1 || !conPersist[0].endsWith(path.join('src', 'valeriaVoice.ts'))) {
  fallo(
    'La persistencia de audio debe estar SOLO en src/valeriaVoice.ts. Aparece en: '
    + conPersist.map(rel).join(', ')
    + '. Repartirla por varios archivos hace imposible razonar sobre quién graba y cuándo.',
  );
} else {
  ok('La persistencia de audio vive solo en src/valeriaVoice.ts.');
}

// --- C2 · la bandera exige __DEV__ Y la variable de entorno -----------------
const voz = fs.readFileSync(path.join(ROOT, 'src', 'valeriaVoice.ts'), 'utf8');
const decl = voz.match(/const\s+ASR_CAPTURE\s*=\s*([^;]+);/);

if (!decl) {
  fallo('No se encontró la declaración `const ASR_CAPTURE = …` en src/valeriaVoice.ts.');
} else {
  const expr = decl[1].replace(/\s+/g, ' ').trim();
  if (!/\b__DEV__\b/.test(expr)) {
    fallo(`ASR_CAPTURE ya no exige __DEV__: \`${expr}\`. Sin esa condición la captura sobrevive a la minificación y queda a una variable de entorno de distancia en un AAB de producción.`);
  } else if (!expr.includes(CAPTURE_VAR)) {
    fallo(`ASR_CAPTURE ya no exige ${CAPTURE_VAR}: \`${expr}\`. Toda build de desarrollo pasaría a grabar sin pedirlo.`);
  } else if (!/&&/.test(expr)) {
    fallo(`ASR_CAPTURE debe exigir AMBAS condiciones a la vez: \`${expr}\`.`);
  } else {
    ok(`ASR_CAPTURE exige __DEV__ y ${CAPTURE_VAR}.`);
  }

  // Que la única LECTURA de la variable sea esa: un `process.env.X` suelto en
  // otro sitio sería una segunda puerta que este gate no vigila. Se cuenta
  // sobre el código sin comentarios y solo la forma `process.env.X`, porque el
  // nombre a secas aparece —y debe aparecer— en la explicación de arriba.
  const sinComentarios = voz
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  const lecturas = (sinComentarios.match(new RegExp(`process\\.env\\.${CAPTURE_VAR}`, 'g')) || []).length;
  if (lecturas !== 1) {
    fallo(`${CAPTURE_VAR} se lee ${lecturas} veces en valeriaVoice.ts; debe leerse exactamente una, en la declaración de ASR_CAPTURE.`);
  }
}

// --- C3 · nada versionado enciende la variable ------------------------------
const vigilados = [
  '.env.example', 'app.json', 'eas.json', 'package.json',
  ...fs.readdirSync(path.join(ROOT, '.github', 'workflows')).map((f) => path.join('.github', 'workflows', f)),
];

let encendida = false;
for (const archivo of vigilados) {
  const full = path.join(ROOT, archivo);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, 'utf8');
  // Cualquier asignación con valor no vacío: `X=1`, `X: "1"`, `X = 'true'`…
  const m = src.match(new RegExp(`${CAPTURE_VAR}\\s*[:=]\\s*["']?([^"'\\s,}]+)`));
  if (m && m[1] && m[1] !== '' && m[1] !== '0') {
    encendida = true;
    fallo(`${archivo} enciende ${CAPTURE_VAR}=${m[1]}. La captura solo se activa a mano en el equipo que dirige la sesión de grabación, nunca en un archivo versionado.`);
  }
}
if (!encendida) ok(`Ningún archivo versionado enciende ${CAPTURE_VAR}.`);

// --- C4 · el directorio del corpus está ignorado ----------------------------
const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
if (!new RegExp(`^/?${CORPUS_DIR}/?$`, 'm').test(gitignore)) {
  fallo(`.gitignore no ignora ${CORPUS_DIR}/. Sin eso, un \`git add -A\` tras la sesión de grabación sube la voz de los niños al repositorio.`);
} else {
  ok(`.gitignore ignora ${CORPUS_DIR}/.`);
}

// --- C5 · git no rastrea audio del corpus -----------------------------------
// `git ls-files` no ve lo ignorado, así que esto detecta lo que se coló ANTES
// de existir la regla, que es exactamente como pasan estas cosas.
try {
  const rastreados = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  const enCorpus = rastreados.filter((f) => f.startsWith(`${CORPUS_DIR}/`));
  const audioSuelto = rastreados.filter(
    (f) => /\.(wav|m4a|caf|mp3|aac|ogg|flac)$/i.test(f) && !f.startsWith('assets/'),
  );

  if (enCorpus.length) {
    fallo(`Git rastrea ${enCorpus.length} archivo(s) dentro de ${CORPUS_DIR}/: ${enCorpus.slice(0, 5).join(', ')}. Hay que sacarlos del historial, no solo del árbol.`);
  }
  if (audioSuelto.length) {
    fallo(`Hay audio versionado fuera de assets/: ${audioSuelto.slice(0, 5).join(', ')}. Los assets legítimos de la app viven en assets/; cualquier otro sitio es sospechoso de ser corpus.`);
  }
  if (!enCorpus.length && !audioSuelto.length) ok('Git no rastrea ninguna grabación del corpus.');
} catch (e) {
  fallo(`No se pudo consultar git (${e.message}). El gate no puede darse por pasado sin esta comprobación.`);
}

// ---------------------------------------------------------------------------
if (fallos) {
  console.error(`\n✗ Gate de captura del ASR: ${fallos} problema(s).`);
  console.error('  Ver docs/plan-asr-privacidad-y-motor-local.md §4.2 (reglas del corpus) y R7.');
  process.exit(1);
}
console.log('\n✓ Gate de captura del ASR: la grabación de corpus no puede llegar a producción.');

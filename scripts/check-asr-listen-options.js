#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de las opciones de escucha del ASR
 *   node scripts/check-asr-listen-options.js
 *
 * Por qué existe. El módulo de reconocimiento se carga con `require` perezoso y
 * queda tipado como `any` (en Expo Go no existe, así que no se puede importar
 * de verdad). Consecuencia: NADA comprueba lo que se le pasa a `start()`. Una
 * opción mal puesta —o quitada -no la ve el typecheck, no la ve el diff y no
 * rompe el build: la app arranca, el micrófono se abre y el niño oye «no te
 * escuché bien» ensayo tras ensayo. Ya pasó, y costó dos rondas encontrarlo.
 *
 * Lo que se comprueba, sobre el TEXTO REAL de src/valeriaVoice.ts:
 *
 *   A1 · Se pide el modelo de lenguaje `web_search` para una palabra suelta.
 *        El defecto de Android es `free_form` (dictado) y con él una palabra
 *        corta y aislada suele no devolver ningún resultado: el motor espera a
 *        que sigas hablando y cierra con ERROR_NO_MATCH. Es el remedio que
 *        recomienda el propio equipo de Android (issuetracker 280288200) y es
 *        justo la forma de todo Pares Mínimos: «rana», «lata», «oso».
 *   A2 · En iOS se pide la pista de tarea de enunciado corto ('confirmation').
 *   A3 · La ventana de escucha larga de ES-04 sigue puesta. Es lo que le da
 *        tiempo a arrancar a un niño de cuatro años; sin ella el motor cierra
 *        al primer silencio.
 *   A4 · Los parciales siguen pedidos (`interimResults`). Son la red de
 *        seguridad cuando el resultado final llega vacío.
 *   A5 · NUNCA se sesga el motor con la palabra objetivo (`contextualStrings`
 *        / EXTRA_BIASING_STRINGS). Sesgarlo fabricaría el falso positivo que el
 *        ejercicio existe para detectar (§3.4 del plan). Esta es la única regla
 *        del gate que es clínica y no técnica.
 *   A6 · Se pregunta por los modelos instalados AL MISMO reconocedor que va a
 *        escuchar. `getSupportedLocales` con `androidRecognitionServicePackage`
 *        interroga a ESE paquete, mientras que escuchar con
 *        `requiresOnDeviceRecognition` y descargar el modelo van los dos por
 *        `createOnDeviceSpeechRecognizer` — el del sistema, se llame como se
 *        llame. Fijar el paquete al preguntar es exactamente el defecto que
 *        dejaba sin usar un modelo ya descargado: la app decía «falta el
 *        paquete» con el paquete puesto, y toda la sesión iba por red.
 *   A7 · No se fija paquete de reconocedor al escuchar. En Android 13+ la
 *        librería lo descarta cuando se pide reconocimiento local, y en 12 solo
 *        sirve para intentar enlazar un componente que puede no existir.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VOICE = path.join(ROOT, 'src', 'valeriaVoice.ts');

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };
const ok = (msg) => console.log('  ✓ ' + msg);

const src = fs.readFileSync(VOICE, 'utf8');

// Cuerpo de startListening: se comprueba ahí y no en todo el fichero para que
// una mención en un comentario de otra parte no dé por buena una opción.
const inicio = src.indexOf('export async function startListening');
if (inicio < 0) {
  console.error('✖ No se encontró startListening en src/valeriaVoice.ts.');
  process.exit(1);
}
const fin = src.indexOf('\nexport async function stopListening', inicio);
const cuerpo = src.slice(inicio, fin > 0 ? fin : src.length);

// Código sin comentarios: lo que de verdad se ejecuta. Sin esto, borrar una
// opción y dejar el comentario que la explica pasaría el gate.
const codigo = cuerpo
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/^\s*\/\/.*$/gm, ' ');

// A1 · modelo de lenguaje de término suelto.
if (/EXTRA_LANGUAGE_MODEL\s*:\s*'web_search'/.test(src.replace(/^\s*\/\/.*$/gm, ' '))
  && /ANDROID_SINGLE_WORD_MODEL/.test(codigo)) {
  ok("A1 · se pide el modelo 'web_search' cuando se espera una palabra suelta.");
} else {
  fallo("A1 · no se pide EXTRA_LANGUAGE_MODEL 'web_search' para palabra suelta. "
    + 'Con el modelo de dictado por defecto, una palabra corta y aislada no '
    + 'devuelve resultado y el niño oye «no te escuché bien» en cada ensayo.');
}

// A2 · pista de tarea de iOS para enunciados cortos.
if (/iosTaskHint\s*:\s*'confirmation'/.test(codigo)) {
  ok("A2 · en iOS se pide iosTaskHint 'confirmation' para enunciados cortos.");
} else {
  fallo("A2 · falta iosTaskHint 'confirmation' para la palabra suelta en iOS.");
}

// A3 · ventana de escucha larga (ES-04).
const extras = [
  'EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS',
  'EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS',
  'EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS',
];
const faltan = extras.filter((e) => !new RegExp(`${e}\\s*:\\s*\\d+`).test(src));
if (!faltan.length && /ANDROID_LISTEN_EXTRAS/.test(codigo)) {
  ok('A3 · la ventana de escucha ampliada de ES-04 sigue puesta.');
} else {
  fallo(`A3 · la ventana de escucha de ES-04 no llega a start(): ${faltan.join(', ') || 'no se pasa ANDROID_LISTEN_EXTRAS'}.`);
}

// A4 · parciales.
if (/interimResults\s*:\s*true/.test(codigo)) {
  ok('A4 · se piden resultados parciales (red de seguridad del turno).');
} else {
  fallo('A4 · no se piden parciales: un final vacío pierde el turno entero.');
}

// A5 · nunca sesgar el motor con la palabra objetivo.
if (/contextualStrings\s*:/.test(codigo) || /EXTRA_BIASING_STRINGS/.test(codigo)) {
  fallo('A5 · se está sesgando el reconocedor con cadenas contextuales. Eso '
    + 'fabrica el falso positivo que el ejercicio existe para detectar (§3.4).');
} else {
  ok('A5 · no se sesga el reconocedor con la palabra objetivo.');
}

// Código del módulo entero sin comentarios: A6 vive en probeLocale, no en
// startListening, pero es la otra mitad de la misma coherencia.
const moduloSinComentarios = src
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/^\s*\/\/.*$/gm, ' ');

// A6 · preguntar al mismo motor que escucha.
const sondeoConPaquete = /getSupportedLocales\s*\(\s*\{[^}]*androidRecognitionServicePackage/.test(moduloSinComentarios);
if (sondeoConPaquete) {
  fallo('A6 · se le pregunta por los modelos instalados a un paquete fijo, pero se '
    + 'escucha y se descarga con el reconocedor local del sistema. En cuanto el '
    + 'aparato no use ese paquete exacto, un modelo YA descargado se declara '
    + 'ausente y la variedad se queda en red toda la sesión.');
} else {
  ok('A6 · los modelos instalados se consultan al mismo reconocedor que escucha.');
}

// A7 · no fijar paquete al escuchar.
if (/androidRecognitionServicePackage/.test(codigo)) {
  fallo('A7 · se fija un paquete de reconocedor al escuchar. En Android 13+ la '
    + 'librería lo descarta al pedir reconocimiento local, y en 12 hace que se '
    + 'intente enlazar un componente que puede no existir.');
} else {
  ok('A7 · no se fija paquete de reconocedor al escuchar.');
}

if (fallos) {
  console.error(`\n✖ Gate de opciones de escucha del ASR: ${fallos} fallo(s).`);
  process.exit(1);
}
console.log('\n✓ Gate de opciones de escucha del ASR: el micrófono se pide como debe.');

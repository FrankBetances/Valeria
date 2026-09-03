// ============================================================================
// Gate · Contrato del puente de Realidad Aumentada, lado TypeScript
//
// `check-ar-concurrency.js` solo lee Kotlin, y la mitad del fallo del 2/9/2026
// vivía en TypeScript: el nativo devolvía un objeto de error donde se esperaba
// un perfil de dispositivo y la pantalla lo daba por bueno porque un objeto de
// error también es verdadero. `npm run typecheck` no lo vio —el tipo declarado
// era `Promise<ArDeviceProfile>`, es decir, una promesa que el puente no podía
// cumplir— y el resultado fueron dos cierres inesperados en el Pixel 6a.
//
// Lo que se vigila aquí, entonces, es lo que un typecheck no puede ver: que la
// forma declarada siga siendo la forma que el nativo manda de verdad, y que los
// dos idiomas sigan hablando del mismo conjunto de causas.
// ============================================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KOTLIN = path.join(
  ROOT, 'android-native', 'valeria-ar', 'src', 'main', 'java',
  'eu', 'futureforkids', 'valeria', 'ar',
);

const fallos = [];
const exigir = (cond, mensaje) => { if (!cond) fallos.push(mensaje); };
const leer = (f) => {
  if (!fs.existsSync(f)) { fallos.push(`falta el fichero ${path.relative(ROOT, f)}`); return null; }
  return fs.readFileSync(f, 'utf8');
};

const bridge = leer(path.join(ROOT, 'src', 'valeriaArBridge.ts'));
const launcher = leer(path.join(ROOT, 'src', 'ValeriaArLauncherScreen.tsx'));
const settings = leer(path.join(ROOT, 'src', 'valeriaArSettings.ts'));
const sesion = leer(path.join(KOTLIN, 'session', 'ArCoreSession.kt'));

// ── 1. La política de nivel nunca puede salir indefinida ────────────────────
//
// `AR_LEVEL_POLICY[undefined]` devolvía `undefined`, y la pantalla moría
// leyendo `policy.exercises`. Es la línea exacta del cierre inesperado.
if (settings) {
  exigir(/arPolicyFor\s*=\s*\(level\?:/.test(settings),
    'valeriaArSettings: `arPolicyFor` vuelve a exigir el nivel. Si el nivel llega ' +
    '`undefined` —y llega, en cuanto el nativo no completa la prueba— el tipo miente');
  exigir(/AR_LEVEL_POLICY\.D/.test(settings),
    'valeriaArSettings: `arPolicyFor` no tiene política por defecto. Sin ella devuelve ' +
    '`undefined` y quien la lea se cierra: `Cannot read property \'exercises\' of undefined`');
}

// ── 2. El resultado de la prueba es una unión discriminada ──────────────────
//
// No es estilo. `ArDeviceProfile | null` deja que un objeto que NO es un perfil
// pase por `if (!p)`; con `ok` por delante, TypeScript obliga a mirar antes.
if (bridge) {
  exigir(/ok:\s*true;\s*profile:\s*ArDeviceProfile/.test(bridge),
    'valeriaArBridge: `ArAptitudeOutcome` ya no es una unión discriminada por `ok`. ' +
    'Sin el discriminante, un objeto de error vuelve a pasar por perfil válido');
  exigir(/runAptitudeTest\(\):\s*Promise<ArAptitudeOutcome>/.test(bridge),
    'valeriaArBridge: `runAptitudeTest` ya no devuelve `ArAptitudeOutcome`');
  exigir(/runAptitudeTest:\s*\(\)\s*=>\s*Promise<unknown>/.test(bridge),
    'valeriaArBridge: el módulo nativo vuelve a declarar `runAptitudeTest` como si ' +
    'devolviera un perfil. Devuelve el mapa crudo: declararlo `unknown` es lo que obliga ' +
    'a validarlo en vez de confiar');
  exigir(/typeof \(profile as ArDeviceProfile\)\.level === 'string'/.test(bridge),
    'valeriaArBridge: `runAptitudeTest` ya no comprueba que el perfil traiga `level`. ' +
    'Un perfil sin nivel no es un perfil: aguas abajo decide qué ejercicios se ofrecen');
}

// ── 3. La pantalla no guarda antes de comprobar ─────────────────────────────
//
// Guardar primero persistía el objeto de error como si fuera un perfil, y a
// partir de ahí el bloque se cerraba solo en CADA apertura, sin llegar a lanzar
// el nativo. Una caché envenenada sobrevive a la sesión; el crash, no.
if (launcher) {
  const iGuard = launcher.indexOf('if (!outcome.ok)');
  const iSave = launcher.indexOf('saveArDeviceProfile(outcome.profile)');
  exigir(iGuard !== -1 && iSave !== -1 && iGuard < iSave,
    'ValeriaArLauncherScreen: `saveArDeviceProfile` ya no va después de comprobar `ok`. ' +
    'Al revés se persiste el objeto de error como perfil y el bloque queda roto para ' +
    'siempre en ese teléfono, sin volver a lanzar el nativo');
  exigir(/!cached \|\| !cached\.level/.test(launcher),
    'ValeriaArLauncherScreen: el perfil en caché se vuelve a usar sin comprobar `level`. ' +
    'Es lo que hacía que una caché envenenada cerrase el bloque en cada apertura');
  exigir(/outcome\.permanent \? 'notApt' : 'aptitude'/.test(launcher),
    'ValeriaArLauncherScreen: ya no se distingue la causa permanente de la transitoria. ' +
    'Ofrecer «inténtalo de nuevo» cuando el aparato no puede pasar nunca es mandar a un ' +
    'padre a repetir un calentamiento de 90 s para siempre');
}

// ── 4. Los dos idiomas hablan del mismo conjunto de causas ──────────────────
//
// Esta es la comprobación que no puede hacer ningún typecheck: el enum vive en
// Kotlin y la unión en TypeScript, y si se separan, una causa nueva del nativo
// cae silenciosamente en el mensaje genérico — que es justo el «inténtalo de
// nuevo» inútil del que venimos.
if (sesion && bridge) {
  const bloque = sesion.match(/enum class Unavailable \{([\s\S]*?)\n    \}/);
  exigir(bloque, 'ArCoreSession: no se encuentra el enum `Unavailable`');
  if (bloque) {
    const kotlin = (bloque[1].replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
      .match(/^\s*([A-Z_]+),/gm) || []).map((s) => s.trim().replace(',', ''));
    const ts = (bridge.match(/export type ArFailureReason =([\s\S]*?);/) || [, ''])[1];
    exigir(kotlin.length >= 6,
      `ArCoreSession: solo se leen ${kotlin.length} motivos del enum; el patrón del gate ha dejado de encajar`);
    kotlin.forEach((m) => {
      exigir(ts.includes(`'${m}'`),
        `valeriaArBridge: \`ArFailureReason\` no contempla \`${m}\`, que el nativo SÍ manda. ` +
        'Una causa que TypeScript no conoce cae en el mensaje genérico y el adulto no se ' +
        'entera de qué tiene que hacer');
    });
    exigir(ts.includes("'DENIED'"),
      'valeriaArBridge: falta `DENIED`. El permiso de cámara denegado no está en el enum de ' +
      'ARCore pero llega por el mismo campo');
  }
}

// ── 5. Cada causa resoluble tiene mensaje en los tres idiomas ───────────────
{
  const CLAVES = [
    'noticeCameraBusy', 'noticeArServicesOutdated', 'noticeArServicesMissing',
    'noticeArServicesInstalling', 'noticeCameraDenied',
    'notAptNoFrontCamera', 'notAptDeviceUnsupported',
  ];
  ['es', 'en', 'ca'].forEach((lang) => {
    const src = leer(path.join(ROOT, 'src', 'i18n', `strings.${lang}.ts`));
    if (!src) return;
    CLAVES.forEach((k) => {
      exigir(new RegExp(`\\b${k}:`).test(src),
        `strings.${lang}: falta \`${k}\`. Una causa sin mensaje propio vuelve al genérico, ` +
        'y el genérico no le dice al adulto qué hacer');
    });
  });
}

// ── Resultado ───────────────────────────────────────────────────────────────
if (fallos.length) {
  console.error('\nRealidad Aumentada · contrato del puente roto:\n');
  fallos.forEach((f) => console.error(`  ✖ ${f}`));
  console.error(
    '\nEstas reglas salen de los dos cierres inesperados del Pixel 6a (2/9/2026), no de\n' +
    'estilo. El typecheck no los vio porque el tipo declarado era una promesa que el\n' +
    'puente no podía cumplir: decía devolver un perfil y devolvía un objeto de error.\n' +
    'Si alguna regla tiene que cambiar, cámbiala aquí a la vez que en el código y di por qué.',
  );
  process.exit(1);
}

console.log(
  '✓ RA (puente): resultado discriminado por `ok`, política con defecto, caché validada, ' +
  'motivos alineados entre Kotlin y TypeScript y mensaje propio por causa en es/en/ca.',
);

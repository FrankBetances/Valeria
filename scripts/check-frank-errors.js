#!/usr/bin/env node
// Comprobaciones de los errores que Frank ya señaló (.claude/errores-frank.md).
// Corre antes de cada push (hook guard-push). Un fallo aquí es un error repetido.
const fs = require('fs');
const read = (p) => fs.readFileSync(p, 'utf8');
const checks = [
  ['R1 Lúa en el inicio', () => /ValeriaCatInteractiveCard/.test(read('src/ValeriaHubV11Screen.tsx'))],
  ['R4 QR con react-native-qrcode-svg', () => /from 'react-native-qrcode-svg'/.test(read('src/ValeriaQRCode.tsx'))],
  ['R7 Lúa en la cabecera de cada módulo', () => /mascot = true/.test(read('src/ui/ScreenHeader.tsx'))],
  ['R20 sin la ilustración de formas hecha a mano en la cabecera', () => !/<Path d="M0 170/.test(read('src/ui/ScreenHeader.tsx'))],
  ['R14 Lúa reacciona en el reto STEAM', () => { const c = read('src/ValeriaSteamChallengeScreen.tsx'); return /CatPixel/.test(c) && /luaIdle/.test(c); }],
  ['R17 Lúa reacciona a aciertos y fallos en todos los ejercicios', () => /emitLuaCheer\(true/.test(read('src/valeriaVoice.ts')) && /emitLuaCheer\(false/.test(read('src/valeriaVoice.ts')) && /<LuaCheerOverlay \/>/.test(read('src/AppNavigator.tsx'))],
  ['R18 la reacción de Lúa va arriba y no tapa', () => /layer: \{ position: 'absolute', top:/.test(read('src/ui/LuaCheer.tsx'))],
  ['R23 Adaptación a sonidos conserva anticipación, pausa y final', () => { const c = read('src/ValeriaSensory/SensoryExerciseScreen.tsx'); return /countdownNumber[^\n]*>\{countdown\}/.test(c) && /stoppingIsOkTitle/.test(c) && /xpRewardTxt/.test(c); }],
  ['R8 entrada animada en filas', () => /enterAt\(/.test(read('src/ui/ListRow.tsx')) && /enterAt\(/.test(read('src/ValeriaBlockTile.tsx'))],
  ['R24 el manual enseña cada imagen que cita', () => {
    const html = read('docs/manual-casos-de-uso.html');
    const imgs = [...html.matchAll(/src="(screenshots\/[^"]+)"/g)].map((m) => m[1]);
    return imgs.length > 0 && imgs.every((f) => fs.existsSync('docs/' + f));
  }],
  ['R24 cada pantalla con «Ver en la mesa (RA)» tiene su captura en el manual', () => {
    const html = read('docs/manual-casos-de-uso.html');
    const screens = fs.readdirSync('src').filter((f) => /Screen\.tsx$/.test(f) && /<ArSceneLaunch\b/.test(read('src/' + f)));
    const shots = { 'ValeriaSteamWorldScreen.tsx': '51-ra-set-mesa.png', 'ValeriaArActivityScreen.tsx': '53-ra-lua-mesa.png' };
    return screens.length > 0 && screens.every((f) => shots[f] && html.includes('screenshots/' + shots[f]));
  }],
  ['R26 la escena de RA pinta las piezas reales de los sets', () => {
    const k = read('android-native/valeria-ar/src/main/java/eu/futureforkids/valeria/ar/ValeriaArSceneActivity.kt');
    return /SetMeshRenderer/.test(k) && /drawSetModel/.test(k) && /buildModel\(/.test(read('src/steam/arScenes.ts'));
  }],
  ['R26 los 11 sets tienen modelo y todas sus mallas existen', () => {
    const g = read('src/steam/arSetModels.generated.ts');
    const sets = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S8', 'S9', 'S10', 'S11'];
    const names = [...new Set([...g.matchAll(/"m": "([^"]+)"/g)].map((m) => m[1]))];
    return sets.every((id) => g.includes(`"${id}": {"center"`)) && names.length > 40
      && names.every((n) => fs.existsSync(`android-native/valeria-ar/src/main/assets/sets/${n}.vmesh`));
  }],
  ['R26 ninguna pieza inventada: las escenas no dibujan siluetas de piezas a mano', () => !/'piece'\s*[,)]/.test(read('src/steam/arScenes.ts').split('export const AR_SCENES')[1].split('export interface')[0])],
  ['R26 el catálogo de RA no pasa por la prueba de cámara frontal', () => !/ArLauncher/.test(read('src/ValeriaArCatalogScreen.tsx'))],
  ['R27 el inventario de activos se inyecta en cada mensaje', () => /inventario-activos\.js/.test(read('.claude/hooks/errores-prompt.js')) && fs.existsSync('scripts/inventario-activos.js')],
  ['R28 ACOPROS: Academy no llama terapeuta a la familia, remite al logopeda y las praxias citan la evidencia', () => {
    const c = read('src/ValeriaAcademy/academyContent.ts');
    return !/ya eres terapeuta/i.test(c) && /Pregunta a tu logopeda/.test(c) && /Cochrane 2015/.test(c)
      && /Lengua de Signos Española \(LSE\)/.test(read('src/ValeriaAcademy/academyDomains.ts'))
      && /earSteps/.test(read('src/ValeriaAcademy/HipoacusiaBottomSheet.tsx'))
      && !/Canciones y Praxias/.test(read('src/i18n/strings.es.ts'));
  }],
  ['R28 ACOPROS: la app no recita las canciones y cada cuento tiene una sola pregunta', () => {
    const st = read('src/AventurasLua/Catalog/LuaStoriesCatalog.ts');
    return !/speakLuaToChildSeq\(song\.lyrics/.test(read('src/AventurasLua/Screens/LuaSongPlayerScreen.tsx'))
      && (st.match(/\n        question: /g) || []).length === 10;
  }],
];
let bad = 0;
for (const [name, fn] of checks) {
  let ok = false; try { ok = fn(); } catch { ok = false; }
  console.log(`${ok ? '✓' : '✖'} ${name}`); if (!ok) bad++;
}
if (bad) { console.error(`\n❌ ${bad} error(es) ya señalados por Frank se han repetido.`); process.exit(1); }

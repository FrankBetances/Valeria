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
  ['R29 la cabecera fija de Academy es corta: sin «Empieza por aquí», reclamo ni aviso de idioma dentro', () => {
    const c = read('src/ValeriaAcademy/ValeriaAcademyScreen.tsx');
    const head = c.slice(c.indexOf('<ScreenHeader compact'), c.indexOf('</ScreenHeader>'));
    return head.length > 0 && !/AcademyNextStep/.test(c) && !/headerSub|langNotice|gameRow/.test(head);
  }],
  ['R30 Play: las orientaciones de pantalla se declaran opcionales (portrait y landscape required=false)', () => {
    const m = read('android-native/valeria-ar/src/main/AndroidManifest.xml');
    return ['portrait', 'landscape'].every((o) => new RegExp(`android\\.hardware\\.screen\\.${o}"\\s+android:required="false"`).test(m));
  }],
  // Los audios de voz se generan SOLO en GitHub (voice-assets.yml). Un manifiesto
  // del formato nuevo (con paramsHash) tiene que decir que lo escribió CI; uno
  // generado en una máquina local no lo dice y corta el push.
  ['R34 Voz: los audios se regeneran solo en GitHub (voice-assets.yml), nunca en local', () =>
    fs.readdirSync('.').filter((f) => /^voice-assets-manifest\.[\w-]+\.json$/.test(f)).every((f) => {
      const m = JSON.parse(read(f));
      return !('paramsHash' in m) || m.generatedBy === 'github-actions';
    })],
  // Un plan para otro agente (Antigravity, Sonnet…) es autónomo y barato para
  // Frank: cada paquete dice dónde corre, lo pesado va a GitHub Actions y no hay
  // puntos de parada que le obliguen a vigilar (R35, R36). Vale para los planes
  // escritos a partir del 28/11/2026; los entregados antes no se reescriben.
  ['R37 Planes para otro agente: «Dónde corre» en cada paquete, sin puntos de parada y sin trabajo pesado en local', () =>
    fs.readdirSync('docs').filter((f) => /^PLAN-.*(\d{4}-\d{2}-\d{2})\.md$/.test(f)
      && f.match(/(\d{4}-\d{2}-\d{2})\.md$/)[1] > '2026-11-27').every((f) => {
      const t = read(`docs/${f}`);
      if (!/antigravity|sonnet|agente/i.test(t)) return true;
      const paquetes = t.split(/^## P\d/m).slice(1);
      return paquetes.length > 0
        && paquetes.every((b) => /Dónde corre/.test(b))
        && !/puntos? de parada|para y pregunta|espera(r)? (el|su) «sí»|se para y se avisa/i.test(t)
        && !/(sintetiz|regener|build)[^\n]{0,60}en local/i.test(t.replace(/nunca en local|no en local|prohibid[oa][^\n]*en local/gi, ''));
    })],
  // El manual solo cuenta del peluche Lúa lo que Frank ha dicho: cinco versiones impresas y
  // probadas con la electrónica completa. Nada de «prototipo sobre una mesa» ni notas de VIA+ (R40).
  ['R40 Manual: el capítulo de Lúa no dice que sea un prototipo sin hacer ni mete VIA+', () => {
    const m = read('docs/manual-casos-de-uso.html');
    const lua = m.slice(m.indexOf('El peluche Lúa</h2>'));
    return /cinco versiones/.test(lua) && !/prototipo (sobre una mesa|en desarrollo)|no hay peluche|VIA\+/.test(lua);
  }],
];
let bad = 0;
for (const [name, fn] of checks) {
  let ok = false; try { ok = fn(); } catch { ok = false; }
  console.log(`${ok ? '✓' : '✖'} ${name}`); if (!ok) bad++;
}
if (bad) { console.error(`\n❌ ${bad} error(es) ya señalados por Frank se han repetido.`); process.exit(1); }

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
  ['R8 entrada animada en filas', () => /enterAt\(/.test(read('src/ui/ListRow.tsx')) && /enterAt\(/.test(read('src/ValeriaBlockTile.tsx'))],
];
let bad = 0;
for (const [name, fn] of checks) {
  let ok = false; try { ok = fn(); } catch { ok = false; }
  console.log(`${ok ? '✓' : '✖'} ${name}`); if (!ok) bad++;
}
if (bad) { console.error(`\n❌ ${bad} error(es) ya señalados por Frank se han repetido.`); process.exit(1); }

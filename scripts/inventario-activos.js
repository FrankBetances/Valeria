#!/usr/bin/env node
// Inventario de lo que YA EXISTE para dibujar (R27, Frank 10/11/2026).
// Lo inyecta el hook errores-prompt.js en cada mensaje: antes de diseñar o
// dibujar nada, se parte de esto. Inventar geometría teniendo los modelos de los
// sets a mano costó días de tokens de Frank.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const count = (dir, re) => { try { return fs.readdirSync(path.join(root, dir)).filter((f) => re.test(f)).length; } catch { return 0; } };
const sib = (name) => [path.join(root, '..', name), path.join(root, '..', 'frankbetances', name)].find((p) => fs.existsSync(p));
const lines = [
  `· App: ${count('assets/models', /\.glb$/)} GLB en assets/models; ${count('android-native/valeria-ar/src/main/assets/sets', /\.vmesh$/)} mallas de sets y de Lúa V5 en android-native/valeria-ar/src/main/assets/sets (salen de scripts/build-ar-set-models.py).`,
  '· lua-construye (github.com/FrankBetances/lua-construye): piezas de cada set en sets/<set>/stl y sets/<set>/ar/*.glb; pasos de montaje con posiciones en agents/render_manual_sets.py; maquetas enteras en escenas-juego/ y sets/S8…S11/stl/conjunto.stl; manual y tarjetas en sets/<set>/manual y /tarjetas.',
  '· lua-firmware (github.com/FrankBetances/lua-firmware): muñeco Lúa V5 en cad/lua-v5 (piezas y matrices de montaje), caras en docs/caras, fichas e insignias.',
  `· En este entorno: lua-construye ${sib('lua-construye') ? 'clonado en ' + sib('lua-construye') : 'NO clonado (git clone --depth 1 del repositorio público)'}; lua-firmware ${sib('lua-firmware') ? 'clonado en ' + sib('lua-firmware') : 'NO clonado'}.`,
];
console.log('ANTES DE DISEÑAR O DIBUJAR NADA (R27): se usa lo que ya existe. Inventario:\n' + lines.join('\n') +
  '\nSi lo pedido tiene modelo, dibujo o dato en esos repositorios, se usa ESE. Geometría, posiciones o dibujos inventados: prohibido. Si falta el repositorio, se clona antes de escribir una línea.');

// ============================================================================
// Valeria+ · Lúa vista en el panel circular de 240×240
//
//   CHROMIUM_PATH=/ruta/al/chrome node scripts/build-lua-faces.js
//
// Coge la MISMA rejilla de la mascota que usa la app (src/ValeriaCatPixel.tsx)
// y la pinta dentro del recorte circular del panel GC9A01, al tamaño real.
// Sirve para responder hoy, sin placa, a la pregunta de la Fase 0 que no
// necesita hardware: ¿la cara aguanta 240 px de diámetro?
//
// El lado del píxel es 7 (32 columnas × 7 = 224 px sobre un panel de 240): 240
// entre 32 cae en 7,5 y un lado fraccionario parte las filas del dibujo, que es
// exactamente el defecto que ya costó dos iteraciones dentro de la app.
//
// El catálogo de expresiones definitivo es la Fase 4; estas tres son la prueba
// de que la rejilla da para variar la mirada sin redibujar la mascota.
// ============================================================================
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = process.env.OUT_DIR || path.join(ROOT, 'docs', 'screenshots');
const CELL = 7;
const PANEL = 240;

const src = fs.readFileSync(path.join(ROOT, 'src', 'ValeriaCatPixel.tsx'), 'utf8');
const grab = (name) => {
  const i = src.indexOf(`const ${name}: PixelMap = [`);
  return [...src.slice(i, src.indexOf('];', i)).matchAll(/'([.a-z]+)'/g)].map((m) => m[1]);
};
const PAL = Object.fromEntries([...src
  .slice(src.indexOf('CAT_TUXEDO: CatPalette = {'), src.indexOf('};', src.indexOf('CAT_TUXEDO')))
  .matchAll(/(\w): '(#[0-9a-fA-F]+)'/g)].map((m) => [m[1], m[2]]));

const HEAD = grab('HEAD');

// Variantes de mirada operando sobre la REJILLA, no con reemplazos de texto:
// buscar 'uuuu' en la fila casaba también con la boca y con el contorno, y la
// gata salía con los ojos más grandes justo cuando debía tenerlos cerrados.
const eyePixels = (map) => {
  const pts = [];
  map.forEach((row, y) => {
    if (y > map.length * 0.72) return;         // la boca queda fuera del rango
    [...row].forEach((c, x) => { if (c === 'u' || c === 'w') pts.push([x, y]); });
  });
  return pts;
};
const edit = (map, fn) => {
  const g = map.map((r) => [...r]);
  fn(g, eyePixels(map));
  return g.map((r) => r.join(''));
};
/** Ojo cerrado: se rellena de pelo y queda una línea en la fila central. */
const eyesClosed = (map) => edit(map, (g, pts) => {
  const ys = pts.map(([, y]) => y);
  const mid = Math.round((Math.min(...ys) + Math.max(...ys)) / 2);
  pts.forEach(([x, y]) => { g[y][x] = 'b'; });
  pts.filter(([, y]) => y === mid).forEach(([x]) => { g[mid][x] = 'u'; });
});
/** Ojo abierto de par en par: el bloque crece una fila arriba y otra abajo. */
const eyesWide = (map) => edit(map, (g, pts) => {
  pts.forEach(([x, y]) => {
    if (y > 0 && g[y - 1][x] === 'b') g[y - 1][x] = 'u';
    if (y + 1 < g.length && g[y + 1][x] === 'b') g[y + 1][x] = 'u';
  });
});

const faces = [
  { id: 'reposo', map: HEAD, note: 'IDLE' },
  { id: 'atenta', map: eyesWide(HEAD), note: 'PHASE · escucha' },
  { id: 'contenta', map: eyesClosed(HEAD), note: 'VERDICT · acierto' },
];

const svgOf = (map) => {
  const w = map[0].length * CELL, h = map.length * CELL;
  const dx = Math.round((PANEL - w) / 2), dy = Math.round((PANEL - h) / 2);
  let r = '';
  map.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === '.') { x++; continue; }
      let n = 1;
      while (x + n < row.length && row[x + n] === c) n++;
      r += `<rect x="${dx + x * CELL}" y="${dy + y * CELL}" width="${n * CELL}" height="${CELL}" fill="${PAL[c]}"/>`;
      x += n;
    }
  });
  return r;
};

const html = `<body style="margin:0;background:#eef3f3;font-family:system-ui;display:flex;gap:26px;padding:26px">
${faces.map((f) => `<div style="text-align:center">
  <div style="width:${PANEL}px;height:${PANEL}px;border-radius:50%;overflow:hidden;background:#00c4be;
       box-shadow:0 0 0 10px #16161c, 0 10px 26px rgba(0,0,0,.28)">
    <svg width="${PANEL}" height="${PANEL}">${svgOf(f.map)}</svg>
  </div>
  <div style="font-size:13px;font-weight:700;color:#33404a;margin-top:12px">${f.id}</div>
  <div style="font-size:11px;color:#67757d">${f.note}</div>
</div>`).join('')}
</body>`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const p = await b.newPage({ viewport: { width: 26 + faces.length * (PANEL + 46), height: 340 }, deviceScaleFactor: 2 });
  await p.setContent(html);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, 'lua-panel-240.png') });
  await b.close();
  console.log(`· ${faces.length} caras a ${PANEL}×${PANEL} (píxel de ${CELL}) → docs/screenshots/lua-panel-240.png`);
})();

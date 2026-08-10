// ============================================================================
// Valeria+ · Genera icono, icono adaptativo y splash desde la rejilla de Lúa
//
// Los tres PNG de marca salen de la MISMA rejilla que usa la app
// (src/ValeriaCatPixel.tsx). Si mañana cambia el sprite de la mascota se vuelve
// a correr esto y los tres quedan iguales; nadie tiene que redibujar nada ni
// acordarse de exportar a mano.
//
//   OUT_DIR=assets CHROMIUM_PATH=/ruta/al/chrome node scripts/build-brand-assets.js
//
// Por qué el tamaño del píxel es entero en los tres: 1024/32 y 1242/32 caen en
// fracción, y con un lado fraccionario el antialias parte las filas del dibujo.
// De ahí los 20, 16 y 12 px por píxel en vez de "que ocupe el 62 %".
//
// OJO: el icono de la FICHA DE PLAY CONSOLE se sube aparte y no viaja en el
// APK. Cambiar esto no lo cambia allí.
// ============================================================================
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SRC = path.join(__dirname, '..', 'src', 'ValeriaCatPixel.tsx');
const OUT = process.env.OUT_DIR || path.join(__dirname, '..', 'assets');
fs.mkdirSync(OUT, { recursive: true });

const src = fs.readFileSync(SRC, 'utf8');
const grab = (name) => {
  const i = src.indexOf(`const ${name}: PixelMap = [`);
  const j = src.indexOf('];', i);
  return [...src.slice(i, j).matchAll(/'([.a-z]+)'/g)].map((m) => m[1]);
};
const HEAD = grab('HEAD');
const SIT = grab('SIT');
const PAL = Object.fromEntries(
  [...src.slice(src.indexOf('CAT_TUXEDO: CatPalette = {'), src.indexOf('};', src.indexOf('CAT_TUXEDO')))
    .matchAll(/(\w): '(#[0-9a-fA-F]+)'/g)].map((m) => [m[1], m[2]]),
);

const svg = (map, cell) => {
  const W = map[0].length, H = map.length;
  let r = '';
  map.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (c === '.') { x++; continue; }
      let w = 1;
      while (x + w < row.length && row[x + w] === c) w++;
      r += `<rect x="${x * cell}" y="${y * cell}" width="${w * cell}" height="${cell}" fill="${PAL[c]}"/>`;
      x += w;
    }
  });
  return { markup: r, w: W * cell, h: H * cell };
};

const page = (body, w, h) => `<!doctype html><html><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden">${body}</body></html>`;

// --- 1. Icono de la app (1024×1024) ---------------------------------------
const iconCell = 20;                 // 32 columnas × 20 = 640 px de gata
const icon = svg(HEAD, iconCell);
const iconHtml = page(`
  <div style="position:relative;width:1024px;height:1024px;
       background:linear-gradient(150deg,#16d3cc 0%,#00c4be 55%,#00a8a2 100%)">
    <div style="position:absolute;left:-140px;top:-220px;width:760px;height:760px;
         border-radius:50%;background:rgba(255,255,255,.14)"></div>
    <svg width="${icon.w}" height="${icon.h}" style="position:absolute;
         left:${Math.round((1024 - icon.w) / 2)}px;top:${Math.round((1024 - icon.h) / 2)}px">${icon.markup}</svg>
  </div>`, 1024, 1024);

// --- 2. Icono adaptativo de Android (1024×1024, primer plano) --------------
// Android recorta a un círculo/squircle: la mascota tiene que caber en el 66 %
// central o el recorte le come las orejas.
// El primer plano lleva el turquesa HORNEADO en vez de ir transparente sobre
// el `backgroundColor` de app.json. La forma canónica es la transparente, pero
// obliga a fiarse de cómo lo compone cada launcher y deja el PNG del
// repositorio en blanco: lo que se revisa no es lo que se ve. Con el fondo
// dentro, el fichero ES el icono. La capa sigue siendo a sangre, así que el
// parallax de los launchers que lo mueven no descubre ningún borde.
const adaptCell = 18;                // 32 × 18 = 576 px, dentro de los 676 seguros
const adapt = svg(HEAD, adaptCell);
const adaptHtml = page(`
  <div style="position:relative;width:1024px;height:1024px;
       background:linear-gradient(150deg,#16d3cc 0%,#00c4be 55%,#00a8a2 100%)">
    <div style="position:absolute;left:-90px;top:-170px;width:700px;height:700px;
         border-radius:50%;background:rgba(255,255,255,.13)"></div>
    <svg width="${adapt.w}" height="${adapt.h}" style="position:absolute;
         left:${Math.round((1024 - adapt.w) / 2)}px;top:${Math.round((1024 - adapt.h) / 2)}px">${adapt.markup}</svg>
  </div>`, 1024, 1024);

// --- 3. Splash (1242×2688) -------------------------------------------------
const splashCell = 12;               // 32 × 12 = 384 px
const splash = svg(SIT, splashCell);
const splashHtml = page(`
  <div style="width:1242px;height:2688px;background:#00c4be;display:flex;
       flex-direction:column;align-items:center;justify-content:center;
       font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif">
    <svg width="${splash.w}" height="${splash.h}">${splash.markup}</svg>
    <div style="color:#fff;font-size:118px;font-weight:800;letter-spacing:-2px;margin-top:54px">valeria+</div>
    <div style="color:rgba(255,255,255,.92);font-size:46px;font-weight:700;margin-top:18px">
      Terapia auditiva y de lenguaje</div>
  </div>`, 1242, 2688);

// --- 4. Retrato para el manual (fondo transparente) ------------------------
// La portada del manual enseñaba un emoji de oso mientras la app ya llevaba
// meses con la gata. Sale de esta misma rejilla para que no pueda volver a
// desfasarse: se regenera con los otros tres y no hay que exportarlo a mano.
const docCell = 14;                  // 32 × 14 = 448 px de ancho
const docSit = svg(SIT, docCell);
const docHtml = page(
  `<svg width="${docSit.w}" height="${docSit.h}">${docSit.markup}</svg>`,
  docSit.w, docSit.h,
);
const DOCS = path.join(__dirname, '..', 'docs');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const shoot = async (html, w, h, file, transparent) => {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    await p.waitForTimeout(200);
    await p.screenshot({ path: file, omitBackground: !!transparent });
    await p.close();
  };
  await shoot(iconHtml, 1024, 1024, path.join(OUT, 'icon.png'));
  await shoot(adaptHtml, 1024, 1024, path.join(OUT, 'adaptive-icon.png'));
  await shoot(splashHtml, 1242, 2688, path.join(OUT, 'splash.png'));
  await shoot(docHtml, docSit.w, docSit.h, path.join(DOCS, 'lua-mascota.png'), true);
  await b.close();
  console.log('generados en', OUT, '· head', HEAD[0].length + 'x' + HEAD.length, '· paleta', Object.keys(PAL).join(''));
})();

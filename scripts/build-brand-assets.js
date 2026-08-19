// ============================================================================
// Valeria+ · Genera los PNG de marca desde la rejilla de Lúa
//
// Los SIETE PNG de marca salen de la MISMA rejilla que usa la app
// (src/ValeriaCatPixel.tsx): icono Android, icono adaptativo, splash, retrato
// del manual, icono de iOS y las dos poses que pinta el port nativo de iOS.
// Si mañana cambia el sprite se vuelve a correr esto y los siete quedan
// iguales; nadie tiene que redibujar nada ni acordarse de exportar a mano.
//
// El de iOS se añadió tarde y por las malas: cuando ya se había dicho tres
// veces que la mascota estaba cambiada, AppIcon-1024.png seguía siendo el oso
// pardo porque este script solo escribía en assets/ y nadie miró ios-native/.
// Va sin canal alfa a propósito: App Store rechaza iconos con transparencia.
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

// --- 5. Icono de iOS (port nativo de ios-native/) ---------------------------
// Mismo dibujo que el icono de Android y mismo lienzo de 1024, pero se escribe
// dentro del .appiconset porque Xcode lo lee de ahí. Sin transparencia.
const IOS_ICON = path.join(
  __dirname, '..', 'ios-native', 'Valeria', 'Assets.xcassets',
  'AppIcon.appiconset', 'AppIcon-1024.png',
);

// --- 6 y 7. Poses de la mascota para el port nativo de iOS -----------------
// SwiftUI no lee la rejilla de caracteres, así que el port nativo pintaba al
// oso pardo mucho después de que la app lo hubiera retirado. Ahora sale de
// aquí, en las dos poses que usa (regla del umbral en ValeriaCatPixel: cabeza
// por debajo de 90 px de ancho, cuerpo entero por encima). Transparentes: van
// sobre el turquesa de Bienvenida y de Créditos, no sobre un lienzo propio.
const IOS_ASSETS = path.join(__dirname, '..', 'ios-native', 'Valeria', 'Assets.xcassets');
const nativeCell = 16;               // 32 × 16 = 512 px de lado
const nativeHead = svg(HEAD, nativeCell);
const nativeSit = svg(SIT, nativeCell);
const nativeHtml = (m) => page(`<svg width="${m.w}" height="${m.h}">${m.markup}</svg>`, m.w, m.h);
const IOS_HEAD = path.join(IOS_ASSETS, 'LuaHead.imageset', 'lua-head.png');
const IOS_SIT = path.join(IOS_ASSETS, 'LuaSit.imageset', 'lua-sit.png');

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
  fs.mkdirSync(path.dirname(IOS_ICON), { recursive: true });
  await shoot(iconHtml, 1024, 1024, IOS_ICON);   // sin omitBackground: opaco
  fs.mkdirSync(path.dirname(IOS_HEAD), { recursive: true });
  fs.mkdirSync(path.dirname(IOS_SIT), { recursive: true });
  await shoot(nativeHtml(nativeHead), nativeHead.w, nativeHead.h, IOS_HEAD, true);
  await shoot(nativeHtml(nativeSit), nativeSit.w, nativeSit.h, IOS_SIT, true);
  await b.close();
  console.log('generados 7 PNG · head', HEAD[0].length + 'x' + HEAD.length, '· paleta', Object.keys(PAL).join(''));
  console.log('  ' + [path.join(OUT, 'icon.png'), path.join(OUT, 'adaptive-icon.png'),
    path.join(OUT, 'splash.png'), path.join(DOCS, 'lua-mascota.png'), IOS_ICON,
    IOS_HEAD, IOS_SIT]
    .map((f) => path.relative(path.join(__dirname, '..'), f)).join('\n  '));
})();

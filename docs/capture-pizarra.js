// Captura la Pizarra Mágica de Lúa: sus 18 trazos, uno a uno, TRAZÁNDOLOS por
// sus propios waypoints. Así la captura no solo enseña cómo se ve el modelo:
// también demuestra que el ejercicio se puede aprobar siguiéndolo.
//
// Existe porque docs/capture-screenshots.js no pasa por esta pantalla, y por eso
// aquí se coló lo que ningún gate ve: una insignia de letra que se desbordaba y
// se comía el título, y unos waypoints de las olas 30 px por encima de su curva.
// La regla 1 de CLAUDE.md pide una captura propia; esto es lo que la hace
// posible para este módulo.
//
// Uso:
//   1. npm install --no-save --legacy-peer-deps \
//        react-native-web@~0.21.0 react-dom@19.1.0 @expo/metro-runtime@~6.1.1 playwright
//   2. BROWSER=none npx expo start --web --port 8081 --clear     (en otra terminal)
//   3. OUT_DIR=/ruta/salida \
//      CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome \
//      node docs/capture-pizarra.js
//
// Sale con código 1 si algún trazo NO se aprueba siguiendo sus propios
// waypoints, así que también sirve de prueba funcional a mano.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const OUT = process.env.OUT_DIR || path.join(__dirname, 'screenshots');

// Los waypoints salen del banco de verdad, compilado: si mañana cambia un
// trazo, esto lo traza con las coordenadas nuevas sin tocar nada.
const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-pizarra-'));
execSync([
  'npx tsc', JSON.stringify(path.join(ROOT, 'src', 'valeriaWritingBank.ts')),
  '--module commonjs', '--target es2020', '--moduleResolution node',
  '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp),
].join(' '), { cwd: ROOT, stdio: 'inherit' });
const BANK = require(path.join(tmp, 'valeriaWritingBank.js')).WRITING_EXERCISES.map((i) => ({
  id: i.id,
  cat: i.category,
  wps: [...i.guide.waypoints].sort((a, b) => a.order - b.order).map((w) => [w.x, w.y]),
}));
fs.rmSync(tmp, { recursive: true, force: true });
const pause = (p, ms) => p.waitForTimeout(ms);

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'es-ES',
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(60000);

  await page.addInitScript(() => {
    const p1 = { nombre: 'Lucía Martínez', patologia: 'Dislexia', genero: 'Niña', nhc: 'HC-2093' };
    localStorage.setItem('@valeria_pacientes', JSON.stringify([p1]));
    localStorage.setItem('@valeria_paciente', JSON.stringify(p1));
  });

  await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded' });
  await pause(page, 5000);

  // Bienvenida → créditos → selector de paciente → Academy → pestaña Ejercicios.
  const LABELS = ['Continuar', 'Lucía Martínez', 'Ejercicios', 'Comenzar'];
  for (let i = 0; i < 10; i++) {
    const txt = await page.locator('body').innerText();
    if (txt.includes('Selección de Ejercicios')) break;
    for (const l of LABELS) {
      const vis = page.getByText(l, { exact: true }).filter({ visible: true });
      if (await vis.count()) { await vis.first().click({ timeout: 15000 }).catch(() => {}); break; }
    }
    await pause(page, 3500);
  }
  await page.getByText('Selección de Ejercicios', { exact: true }).waitFor({ timeout: 120000 });
  console.log('hub ✓');

  await page.getByText('Grafomotricidad', { exact: true }).first().click();
  await page.getByText('PIZARRA MÁGICA DE LÚA', { exact: true }).waitFor();
  await pause(page, 900);

  // El lienzo: el <svg> que mide 358x310 (min(390-32,440) x 310).
  const canvasBox = async () => {
    const svgs = await page.locator('svg').all();
    for (const s of svgs) {
      const b = await s.boundingBox();
      if (b && b.width > 300 && b.height > 280) return b;
    }
    throw new Error('no encuentro el lienzo');
  };

  // Un trazo CORTO por waypoint, en vez de uno largo que los recorra todos.
  // `hitWaypoints` se acumula entre trazos, así que la cobertura sale igual, y
  // así se esquiva una manía de react-native-web: un arrastre largo por encima
  // de los círculos SVG pierde el responder y nunca llega el `up`. En el
  // dispositivo no pasa —allí no hay react-native-web—, pero aquí bloqueaba la
  // captura.
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const trace = async (wps) => {
    const b = await canvasBox();
    for (const [x, y] of wps) {
      const sx = clamp(x - 24, 8, 348); const sy = clamp(y - 24, 8, 296);
      await page.mouse.move(b.x + sx, b.y + sy);
      await page.mouse.down();
      for (let k = 1; k <= 8; k++) {
        await page.mouse.move(b.x + sx + (x - sx) * k / 8, b.y + sy + (y - sy) * k / 8);
      }
      await page.mouse.up();
      await pause(page, 110);
    }
    await pause(page, 350);
  };

  const shoot = async (name) => {
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('  ' + name);
  };

  const runSeries = async (cat, tab) => {
    await page.getByText(tab, { exact: true }).click();
    await pause(page, 700);
    const items = BANK.filter((i) => i.cat === cat);
    for (let k = 0; k < items.length; k++) {
      const it = items[k];
      await shoot(`pizarra-${cat}-${String(k + 1).padStart(2, '0')}-${it.id}`);
      await trace(it.wps);
      await page.getByText('¡Comprobar trazo!', { exact: true }).click();
      await pause(page, 600);
      const next = page.getByText('Siguiente trazo →', { exact: true });
      if (await next.count()) {
        if (k === 0) await shoot(`pizarra-${cat}-celebracion`);
        await next.click();
        await pause(page, 700);
      } else {
        console.log(`  ✖ ${it.id}: trazado por sus waypoints y NO lo dio por bueno`);
        await page.getByText('Limpiar pizarra', { exact: true }).click();
        await pause(page, 400);
        return false;
      }
    }
    return true;
  };

  const okCrit = await runSeries('critical', 'Letras críticas');
  const okWarm = await runSeries('warmup', 'Lazos');

  // Pizarra libre, la tercera pestaña.
  await page.getByText('Pizarra libre', { exact: true }).click();
  await pause(page, 700);
  await shoot('pizarra-libre');

  await browser.close();
  console.log(okCrit && okWarm ? '\n✓ los 18 trazos se aprueban siguiendo sus waypoints'
    : '\n✖ algún trazo no se aprueba siguiendo sus propios waypoints');
  process.exit(okCrit && okWarm ? 0 : 1);
})().catch((e) => { console.error('ERROR', e.message); process.exit(1); });

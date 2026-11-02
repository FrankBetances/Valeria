// Recorre Valeria+ (Expo web) y captura las pantallas del manual de usuario.
//
// Uso:
//   1. npm install --no-save --legacy-peer-deps \
//        react-native-web@~0.21.0 react-dom@19.1.0 @expo/metro-runtime@~6.1.1
//   2. npx expo start --web --port 8081          (en otra terminal)
//   3. node docs/capture-screenshots.js          (requiere playwright instalado)
//
// Las imágenes se guardan en docs/screenshots/ y las usa manual-casos-de-uso.html.
// En web no hay reconocimiento de voz (STT): los módulos de voz usan la ruta del
// "juez" (el adulto decide con botones), que es justo la que se documenta.
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:8081';
const OUT = process.env.OUT_DIR || path.join(__dirname, 'screenshots');
const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });
// Recorte alrededor de un elemento, para los detalles que a pantalla completa
// no se aprecian (la cara de Lúa mide 64 px de ancho).
const shotAround = async (page, loc, name, pad = 16) => {
  const b = await (await loc.elementHandle()).boundingBox();
  await page.screenshot({
    path: path.join(OUT, name + '.png'),
    clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 },
  });
};
const pause = (page, ms) => page.waitForTimeout(ms);

(async () => {
  // CHROMIUM_PATH permite usar un Chromium ya instalado (p. ej. el de CI)
  // cuando su versión no coincide con la que espera playwright.
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: 'es-ES',
    permissions: [],
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  // Siembra pacientes + un historial de pares mínimos para que el panel de
  // resultados muestre la gráfica de "Sustitución por fonema".
  await page.addInitScript(() => {
    try {
      const p1 = { nombre: 'Lucía Martínez', patologia: 'Hipoacusia con Implante Coclear', genero: 'Niña', nhc: 'HC-2093' };
      const p2 = { nombre: 'Mateo Rodríguez', patologia: 'Dislalia', genero: 'Niño', nhc: 'HC-2107' };
      localStorage.setItem('@valeria_pacientes', JSON.stringify([p1, p2]));
      localStorage.setItem('@valeria_paciente', JSON.stringify(p1));
      // Historial general (evolución por estrellas)
      const hist = [
        { date: '2 jul', name: 'Pares mínimos · rana / lana', avg: 2.1, note: 'Sustitución detectada en 4 de 10 ensayos.', completed: true },
        { date: '4 jul', name: 'Expansión semántica · Rutina de mañana', avg: 2.4, note: '6 palabras trabajadas.', completed: true },
        { date: '6 jul', name: 'Pares mínimos · rana / lana', avg: 2.6, note: 'Sustitución detectada en 2 de 10 ensayos.', completed: true },
        { date: '8 jul', name: 'Pares mínimos · rana / lana', avg: 2.8, note: 'Contraste r̄ → l sin sustituciones.', completed: true },
      ];
      localStorage.setItem('@valeria_historial_completo', JSON.stringify(hist));
      // Registro clínico por par: el % de sustitución baja sesión a sesión.
      const mk = (frac) => Array.from({ length: 10 }, (_, i) => ({ foils: i < frac ? 1 : 0 }));
      const pm = [
        { date: '2025-07-02T10:00:00Z', pairId: 'rana-lana', phoneme: 'r̄ → l', trials: mk(4) },
        { date: '2025-07-06T10:00:00Z', pairId: 'rana-lana', phoneme: 'r̄ → l', trials: mk(2) },
        { date: '2025-07-08T10:00:00Z', pairId: 'rana-lana', phoneme: 'r̄ → l', trials: mk(1) },
      ];
      localStorage.setItem('@valeria_pares_minimos', JSON.stringify(pm));
      // Gamificación con progreso real para la tira del hub y la colección de
      // premios. Las claves son las de GameState (lastDay, perfects): con las
      // antiguas (lastPlayed, perfectSessions) la racha se pinta a 0 porque
      // liveStreak() no encuentra el último día y la captura sale muerta.
      localStorage.setItem('@valeria_juego', JSON.stringify({
        xp: 640, streak: 5, bestStreak: 9,
        lastDay: new Date().toISOString().slice(0, 10),
        sessions: 27, perfects: 6,
        badges: ['primera', 'ses10', 'ses25', 'racha3', 'racha7', 'perfecta', 'perf5', 'madrugadora', 'finde'],
      }));
    } catch (e) { /* noop */ }
  });

  console.log('Cargando bundle…');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 300000 });
  await page.getByText('Comenzar', { exact: true }).waitFor({ timeout: 300000 });
  await pause(page, 1200);

  // 01 · Bienvenida
  await shot(page, '01-bienvenida');
  console.log('01 bienvenida ✓');

  // 02 · Créditos
  await page.getByText('Comenzar', { exact: true }).click();
  await page.getByText('Continuar', { exact: true }).waitFor();
  await pause(page, 600);
  await shot(page, '02-creditos');
  console.log('02 creditos ✓');

  // 03 · Ficha de registro (rellena)
  await page.getByText('Continuar', { exact: true }).click();
  // Con pacientes ya sembrados, la app NO va directa a la ficha: intercala la
  // pantalla «¿quién va a practicar hoy?». El script se escribió antes de que
  // esa pantalla existiera y por eso moría aquí esperando un campo de texto que
  // no llega. Se pide ficha nueva, que es lo que ilustra esta captura.
  const nuevoPaciente = page.getByText('Paciente nuevo', { exact: true });
  if (await nuevoPaciente.count()) {
    await nuevoPaciente.click();
    await pause(page, 800);
  }
  await page.getByPlaceholder('Nombre del paciente').waitFor();
  await pause(page, 400);
  await page.getByPlaceholder('Nombre del paciente').fill('Lucía Martínez');
  await page.getByPlaceholder('DD / MM / AAAA').fill('12/04/2019');
  await page.getByPlaceholder('HC-…').fill('HC-2093');
  await page.getByText('Niña', { exact: true }).click();
  await shot(page, '03-ficha-registro');
  console.log('03 ficha ✓');

  await page.getByPlaceholder('Nombre del tutor').fill('María Fernández');
  await page.getByText('Selecciona el vínculo…').click();
  await page.getByText('Madre', { exact: true }).click();
  await page.getByPlaceholder('tutor@correo.com').fill('maria.fernandez@correo.com');
  await page.getByPlaceholder('Ej. 600 123 456').fill('600 123 456');
  await page.getByText('Selecciona una patología…').click();
  await page.getByText('Hipoacusia con Implante Coclear', { exact: true }).click();
  await page.getByPlaceholder('Dr./Dra. …').fill('Dr. Frank Betances');
  await page.getByPlaceholder('Nombre del logopeda').fill('Laura Gómez');

  // 04 · Ficha guardada
  await page.getByText('Guardar ficha', { exact: true }).click();
  // Fragmento, no la frase entera: este `waitFor` llevaba el texto literal
  // «Ficha guardada y cifrada en el dispositivo.», que 6fad83b retiró el 7/9/2026
  // al dejar de prometer un cifrado que la ficha no tiene. Desde entonces el
  // capturador moría aquí, en el paso 04, y con él el control de calidad visual
  // que la regla 1 exige. Un retoque de copy no puede volver a apagarlo.
  await page.getByText(/Ficha guardada/).waitFor();
  await pause(page, 400);
  await shot(page, '04-ficha-guardada');
  console.log('04 guardada ✓');

  // 05 · HUB de 4 bloques (Selección de Ejercicios rediseñada)
  // La ficha lleva a Academy —la app abre por la formación—, así que al hub de
  // bloques se entra por la pestaña «Ejercicios» de la barra inferior.
  await page.getByText('Empezar por la formación →').click();
  await page.getByText('valeria+ · academy', { exact: true }).waitFor({ timeout: 120000 });
  await pause(page, 700);
  await page.getByText('Ejercicios', { exact: true }).click();
  await page.getByText('¿A qué jugamos?', { exact: true }).waitFor({ timeout: 120000 });
  await pause(page, 700);
  await shot(page, '05-hub-bloques');
  console.log('05 hub ✓');
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1)});

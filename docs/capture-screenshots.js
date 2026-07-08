// Recorre Valeria+ (Expo web) y captura las pantallas del manual de usuario.
//
// Uso:
//   1. npm install --no-save react-native-web@~0.19.10 react-dom@18.2.0 @expo/metro-runtime@~3.2.3
//   2. npx expo start --web --port 8081          (en otra terminal)
//   3. node docs/capture-screenshots.js          (requiere playwright instalado)
//
// Las imágenes se guardan en docs/screenshots/ y las usa manual-casos-de-uso.html.
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:8081';
const OUT = process.env.OUT_DIR || path.join(__dirname, 'screenshots');
const shot = (page, name) =>
  page.screenshot({ path: path.join(OUT, name + '.png') });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    locale: 'es-ES',
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  console.log('Cargando bundle (primera compilación puede tardar)…');
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 300000 });
  await page.getByText('Comenzar', { exact: true }).waitFor({ timeout: 300000 });
  await page.waitForTimeout(1500);

  // 01 · Bienvenida
  await shot(page, '01-bienvenida');
  console.log('01 bienvenida ✓');

  // 02 · Créditos
  await page.getByText('Comenzar', { exact: true }).click();
  await page.getByText('Continuar', { exact: true }).waitFor();
  await page.waitForTimeout(600);
  await shot(page, '02-creditos');
  console.log('02 creditos ✓');

  // 03 · Ficha de registro (rellena)
  await page.getByText('Continuar', { exact: true }).click();
  await page.getByPlaceholder('Nombre del paciente').waitFor();
  await page.waitForTimeout(500);
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
  await page.getByText('Ficha guardada y cifrada en el dispositivo.').waitFor();
  await page.getByText('Ficha guardada y cifrada en el dispositivo.').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, '04-ficha-guardada');
  console.log('04 guardada ✓');

  // 05 · Prescripción de terapias (Modo Familia)
  await page.getByText('Continuar a Prescripción →').click();
  await page.getByText('Prescripción de Terapias').waitFor();
  await page.waitForTimeout(800);
  await shot(page, '05-prescripcion');
  console.log('05 prescripcion ✓');

  // 06 · Modal de PIN
  await page.getByText('Desbloquear Edición Profesional').click();
  await page.getByText('Modo Profesional', { exact: true }).waitFor();
  await page.waitForTimeout(400);
  await shot(page, '06-pin-profesional');
  console.log('06 pin ✓');

  // 07 · Modo profesional desbloqueado (PIN 1985)
  for (const d of ['1', '9', '8', '5']) {
    await page.getByText(d, { exact: true }).last().click();
    await page.waitForTimeout(150);
  }
  await page.getByText('Modo profesional desbloqueado.').waitFor();
  await page.waitForTimeout(400);
  await shot(page, '07-modo-profesional');
  console.log('07 profesional ✓');

  // 08 · Pestaña Lenguaje
  await page.getByText('Lenguaje', { exact: true }).click();
  await page.getByText('Atención Conjunta').waitFor();
  await page.waitForTimeout(400);
  await shot(page, '08-lenguaje');
  console.log('08 lenguaje ✓');

  // 09 · Test de Ling — pregunta previa (patología con implante → ▶ va a LingTest)
  await page.getByText('Audición', { exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByLabel('Practicar Asociación vocal inicial').click();
  await page.getByText('Antes de empezar').waitFor();
  await page.waitForTimeout(400);
  await shot(page, '09-ling-pregunta');
  console.log('09 ling pregunta ✓');

  // 10 · Test de Ling — sonido en curso
  await page.getByText('Sí, usa audífonos / implante').click();
  await page.getByText('PRODUCE ESTE SONIDO').waitFor();
  await page.waitForTimeout(600);
  await shot(page, '10-ling-test');
  console.log('10 ling test ✓');

  // 11 · Test de Ling — resultado (6 × "Identifica")
  for (let i = 0; i < 6; i++) {
    await page.getByText('Identifica', { exact: true }).click();
    await page.waitForTimeout(650);
  }
  await page.getByText('Test completado').waitFor();
  await page.waitForTimeout(400);
  await shot(page, '11-ling-resultado');
  console.log('11 ling resultado ✓');

  // 12 · Reproductor de ejercicios (ficha ilustrada)
  await page.getByText('Comenzar ejercicios →').click();
  await page.getByText('Sesión de Terapia').waitFor();
  await page.waitForTimeout(800);
  await shot(page, '12-ejercicio');
  console.log('12 ejercicio ✓');

  // 13 · Evaluación EPT-3
  await page.getByText('Evalúa con la escala EPT-3').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await shot(page, '13-evaluacion-ept3');
  console.log('13 ept3 ✓');

  // 14 · Sesión completada (recompensas)
  await page.getByText('3★', { exact: true }).click();
  await page.getByText('¡Sesión completada!').waitFor();
  await page.getByText('¡Sesión completada!').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await shot(page, '14-sesion-completada');
  console.log('14 completada ✓');

  // 15 · Panel de resultados
  await page.getByText('Ver Resultados →').click();
  await page.waitForTimeout(1200);
  await shot(page, '15-resultados');
  console.log('15 resultados ✓');

  // 16 · Selección de paciente (siembra una segunda ficha para la lista)
  await page.evaluate(() => {
    const p1 = { nombre: 'Lucía Martínez', patologia: 'Hipoacusia con Implante Coclear', genero: 'Niña', nhc: 'HC-2093' };
    const p2 = { nombre: 'Mateo Rodríguez', patologia: 'Retraso Simple del Lenguaje', genero: 'Niño', nhc: 'HC-2107' };
    localStorage.setItem('@valeria_pacientes', JSON.stringify([p1, p2]));
  });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByText('Ya tengo un paciente registrado').waitFor({ timeout: 120000 });
  await page.getByText('Ya tengo un paciente registrado').click();
  await page.getByText('Selecciona un paciente').waitFor();
  await page.waitForTimeout(600);
  await shot(page, '16-pacientes');
  console.log('16 pacientes ✓');

  await browser.close();
  console.log('Capturas completadas.');
})().catch((e) => { console.error(e); process.exit(1); });

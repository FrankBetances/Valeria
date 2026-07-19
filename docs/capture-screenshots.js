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
const pause = (page, ms) => page.waitForTimeout(ms);

(async () => {
  const browser = await chromium.launch();
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
      // Gamificación con algo de progreso para el panel.
      localStorage.setItem('@valeria_juego', JSON.stringify({
        xp: 180, streak: 3, lastPlayed: new Date().toISOString().slice(0, 10),
        bestStreak: 3, sessions: 4, perfectSessions: 1, badges: ['first', 'streak3'],
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
  await page.getByText('Ficha guardada y cifrada en el dispositivo.').waitFor();
  await pause(page, 400);
  await shot(page, '04-ficha-guardada');
  console.log('04 guardada ✓');

  // 05 · HUB de 4 bloques (Prescripción de Terapias rediseñada)
  await page.getByText('Continuar a Prescripción →').click();
  await page.getByText('BLOQUES DE TERAPIA', { exact: true }).waitFor();
  await pause(page, 700);
  await shot(page, '05-hub-bloques');
  console.log('05 hub ✓');

  // ---- Helper para volver al hub ----
  const goHub = async () => {
    await page.getByText('Prescripción de Terapias', { exact: true }).waitFor().catch(() => {});
  };

  // ===================== PARES MÍNIMOS =====================
  await page.getByText('Pares Mínimos', { exact: true }).click();
  await page.getByText('BANCO DE CONTRASTES', { exact: true }).waitFor();
  await pause(page, 600);
  await shot(page, '06-pares-banco');           // 06 · banco de contrastes
  console.log('06 pares banco ✓');

  // Modal PIN compartido (desde Pares Mínimos)
  await page.getByText('Desbloquear Edición Profesional').click();
  await page.getByText('Modo Profesional', { exact: true }).waitFor();
  await pause(page, 400);
  await shot(page, '07-pin-profesional');       // 07 · modal PIN compartido
  console.log('07 pin ✓');
  // cerrar el modal
  await page.getByText('✕', { exact: true }).click().catch(async () => {
    await page.keyboard.press('Escape');
  });
  await pause(page, 400);

  // Iniciar una sesión de pares (primer par: rana / lana)
  await page.getByLabel(/Practicar el par rana/).click();
  await page.getByText('LA APP PIDE', { exact: true }).waitFor();
  await pause(page, 900);
  await shot(page, '08-pares-juego');           // 08 · pantalla de juego (2 fichas + consigna)
  console.log('08 pares juego ✓');

  // En web no hay STT → aparece el juez del padre. Marcar "Dijo rana" → éxito + misión + sello
  await page.getByText(/Dijo .rana/).first().click().catch(() => {});
  await page.getByText('¡Fonema conseguido!').waitFor({ timeout: 15000 }).catch(() => {});
  await pause(page, 800);
  await shot(page, '09-pares-veredicto');       // 09 · veredicto + misión + sello doble
  console.log('09 pares veredicto ✓');

  // ---- Helper: volver a inicio y abrir el hub con el paciente ya registrado ----
  const openHubFresh = async () => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.getByText('Ya tengo un paciente registrado').waitFor({ timeout: 120000 });
    await page.getByText('Ya tengo un paciente registrado').click();
    await page.getByText('Selecciona un paciente').waitFor();
    await pause(page, 400);
    await page.getByText('Lucía Martínez').click();
    await page.getByText('BLOQUES DE TERAPIA', { exact: true }).waitFor();
    await pause(page, 400);
  };

  // ===================== EXPANSIÓN SEMÁNTICA =====================
  await openHubFresh();
  await page.getByText('Expansión Semántica', { exact: true }).click();
  await page.getByText('ESCENARIOS DIARIOS', { exact: true }).waitFor();
  await pause(page, 600);
  await shot(page, '10-expansion-escenarios');  // 10 · lista de escenarios
  console.log('10 expansion escenarios ✓');

  // Pestaña Progresión
  await page.getByText('Progresión', { exact: true }).click();
  await page.getByText('PROGRESIÓN LÉXICA', { exact: true }).waitFor();
  await pause(page, 500);
  await shot(page, '11-expansion-progresion');  // 11 · progresión léxica
  console.log('11 expansion progresion ✓');

  // Iniciar un escenario para captura de juego
  await page.getByText('Escenarios', { exact: true }).click();
  await page.getByText('ESCENARIOS DIARIOS', { exact: true }).waitFor();
  await pause(page, 300);
  await page.getByLabel(/Practicar escenario Rutina de mañana/).click();
  await page.getByText('LA APP DICE', { exact: true }).waitFor();
  await pause(page, 900);
  // marcar "Lo dijo" → success con acción física
  await page.getByText('Lo dijo', { exact: true }).click().catch(() => {});
  await page.getByText('¡Palabra conseguida!').waitFor({ timeout: 15000 }).catch(() => {});
  await pause(page, 700);
  await shot(page, '12-expansion-juego');       // 12 · juego + acción física del adulto
  console.log('12 expansion juego ✓');

  // ===================== SELECCIÓN DE PACIENTE + TEST DE LING =====================
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.getByText('Ya tengo un paciente registrado').waitFor({ timeout: 120000 });
  await page.getByText('Ya tengo un paciente registrado').click();
  await page.getByText('Selecciona un paciente').waitFor();
  await pause(page, 500);
  await shot(page, '16-pacientes');             // 16 · selección de paciente
  console.log('16 pacientes ✓');
  await page.getByText('Lucía Martínez').click();
  await page.getByText('BLOQUES DE TERAPIA', { exact: true }).waitFor();
  await pause(page, 400);
  await page.getByText('Audición', { exact: true }).click();
  await page.getByText('PROTOCOLO ACOPROS · AUDICIÓN', { exact: true }).waitFor();
  await pause(page, 500);
  await shot(page, '13-audicion-lista');        // 13 · lista de audición prescribible
  console.log('13 audicion ✓');

  // ▶ en la primera terapia → Test de Ling (patología con implante)
  await page.getByLabel(/Practicar Asociación vocal inicial/).click();
  await page.getByText('Antes de empezar').waitFor();
  await pause(page, 500);
  await shot(page, '14-ling-pregunta');         // 14 · Test de Ling pregunta previa
  console.log('14 ling ✓');

  await page.getByText('Sí, usa audífonos / implante').click();
  await page.getByText('PRODUCE ESTE SONIDO', { exact: true }).waitFor();
  await pause(page, 700);
  await shot(page, '15-ling-test');             // 15 · sonido en curso
  console.log('15 ling test ✓');

  // Completar el test → ejercicio
  for (let i = 0; i < 6; i++) {
    await page.getByText('Identifica', { exact: true }).click();
    await pause(page, 650);
  }
  await page.getByText('Comenzar ejercicios →').waitFor();
  await page.getByText('Comenzar ejercicios →').click();
  await page.getByText('Sesión de Terapia').waitFor();
  await pause(page, 900);
  await shot(page, '17-ejercicio');             // 17 · reproductor de ejercicios (ficha ilustrada)
  console.log('17 ejercicio ✓');

  // Evaluación EPT-3 y fin de sesión
  await page.getByText('Evalúa con la escala EPT-3').scrollIntoViewIfNeeded();
  await pause(page, 400);
  await shot(page, '18-evaluacion-ept3');       // 18 · escala EPT-3
  console.log('18 ept3 ✓');
  await page.getByText('3★', { exact: true }).click();
  await page.getByText('¡Sesión completada!').waitFor();
  await pause(page, 900);
  await shot(page, '19-sesion-completada');     // 19 · recompensas
  console.log('19 completada ✓');

  // ===================== PANEL DE RESULTADOS (con gráfica de fonema) =====================
  await page.getByText('Ver Resultados →').click();
  await pause(page, 1200);
  await shot(page, '20-resultados');            // 20 · panel (motivación + adherencia)
  console.log('20 resultados ✓');
  // Desplazar hasta la gráfica de sustitución por fonema
  const chart = page.getByText('Sustitución por fonema');
  if (await chart.isVisible().catch(() => false)) {
    await chart.scrollIntoViewIfNeeded();
    await pause(page, 600);
    await shot(page, '21-resultados-fonema');   // 21 · gráfica de sustitución por fonema
    console.log('21 fonema ✓');
  } else {
    console.log('21 fonema — gráfica no visible (se omite)');
  }

  // ===================== CU-14 · VOZ DE LA APP / VARIEDAD =====================
  // La tarjeta "Voz de la app" (con el selector de variedad) vive al final del
  // hub. Volver a él y centrar el selector para que se vean los tres chips.
  await openHubFresh();
  const variedad = page.getByText('Variedad de la voz', { exact: true });
  await variedad.waitFor({ timeout: 30000 });
  await page.getByText('Dominicano', { exact: true }).waitFor({ timeout: 30000 });
  await variedad.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await pause(page, 1500); // deja que termine la detección de voz ("Comprobando…")
  await variedad.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await pause(page, 500);
  await shot(page, '22-voz-variedad');          // 22 · selector Castellano/Galego/Dominicano
  console.log('22 voz/variedad ✓');

  // ===================== CU-15 · PANEL DEL ADULTO (CARGA COMUNICATIVA) =====================
  // Aparece en la pantalla de juego de Pares Mínimos; desplegarlo para ver los
  // tres módulos (ruido babble, oso distractor y quiebre pragmático).
  await page.getByText('Pares Mínimos', { exact: true }).click();
  await page.getByText('BANCO DE CONTRASTES', { exact: true }).waitFor();
  await pause(page, 500);
  await page.getByLabel(/Practicar el par rana/).click();
  await page.getByText('LA APP PIDE', { exact: true }).waitFor();
  await pause(page, 800);
  const panel = page.getByText(/PANEL DEL ADULTO/);
  await panel.waitFor({ timeout: 30000 });
  await panel.scrollIntoViewIfNeeded();
  await panel.click();                           // abre el colapsable
  await page.getByText(/Oso distractor/).waitFor({ timeout: 15000 });
  await panel.evaluate((el) => el.scrollIntoView({ block: 'start' }));
  await pause(page, 700);
  await shot(page, '23-panel-adulto');          // 23 · panel desplegado (ruido/oso/quiebre)
  console.log('23 panel adulto ✓');

  await browser.close();
  console.log('Capturas completadas.');
})().catch((e) => { console.error(e); process.exit(1); });

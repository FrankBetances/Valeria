const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.evaluate(() => localStorage.setItem('@valeria_pacientes', JSON.stringify([{ nombre: 'Lucía Martínez', nhc: 'HC-2093', patologia: '' }])));
  await p.reload({ waitUntil: 'domcontentloaded', timeout: 120000 });
  const go = async (txt) => { const l = p.getByText(txt, { exact: true }).first(); await l.waitFor({ timeout: 150000 }); await p.waitForTimeout(900); await l.click(); };
  await go('Comenzar'); await go('Continuar'); await go('Ya tengo un perfil'); await go('Lucía Martínez');
  await p.waitForTimeout(1500);
  const tab = p.getByText('Ejercicios', { exact: true }); if (await tab.count()) { await tab.last().click(); await p.waitForTimeout(1500); }
  await p.screenshot({ path: process.env.OUT + '/05-casa.png' });
  await go('Audición'); await p.waitForTimeout(1800);
  await p.screenshot({ path: process.env.OUT + '/06-lista.png' });
  console.log('ok'); await b.close();
})().catch(e => { console.log('FALLO', e.message.split('\n')[0]); process.exit(1); });

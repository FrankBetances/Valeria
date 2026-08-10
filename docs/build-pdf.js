// ============================================================================
// Valeria+ · Imprime el manual a PDF desde el HTML
//
//   CHROMIUM_PATH=/ruta/al/chrome node docs/build-pdf.js
//
// El HTML es la ÚNICA fuente del manual: de él salen el PDF (aquí) y el Word
// (docs/build-docx.py). Antes el PDF se sacaba a mano desde el navegador, y por
// eso el fichero del repositorio podía llevar meses sin recoger un cambio del
// HTML sin que nada avisara.
//
// printBackground va activado a propósito: la portada, las cabeceras de los
// casos de uso y los recuadros de aviso SON color. Sin él, el documento sale
// en blanco y con la mitad del texto blanco sobre blanco.
// ============================================================================
const path = require('path');
const { chromium } = require('playwright');

const SRC = path.join(__dirname, 'manual-casos-de-uso.html');
const OUT = path.join(__dirname, 'Valeria-Manual-Casos-de-Uso.pdf');

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage();
  await page.goto('file://' + SRC, { waitUntil: 'networkidle' });
  // Los márgenes y el tamaño los fija @page en el propio HTML; preferCSSPageSize
  // evita que Chromium imponga los suyos y descuadre la portada a sangre.
  await page.pdf({ path: OUT, printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('escrito', path.relative(process.cwd(), OUT));
})();

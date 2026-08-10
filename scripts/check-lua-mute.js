// ============================================================================
// Gate · Lúa no escucha, no suena y no se mueve
//
// Recorre las fuentes de firmware/lua y falla si aparece inicialización de
// entrada de audio, de salida de audio o de servo.
//
// Por qué existe: el plan de integración promete tres cosas —micrófono
// inhabilitado, cero ruido durante la logoaudiometría y ausencia de motores—
// y una promesa escrita en un `.md` no impide nada. Esto convierte las tres en
// algo que rompe el build.
//
// La del micrófono es la que más pesa: la placa elegida no lleva códec, pero
// la e-Paper del banco de pruebas SÍ, y el día que alguien reutilice este
// firmware allí, este gate es lo único que avisa. Es el mismo criterio que
// check-asr-capture-guard.js aplica al ASR de la tableta.
// ============================================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'firmware', 'lua');

// Símbolos que delatan una de las tres capacidades prohibidas.
const PROHIBIDOS = [
  { re: /\bi2s_(driver_install|read|channel_init|new_channel)\b/i, que: 'entrada/salida de audio I2S' },
  { re: /\bI2S\.begin\b/i, que: 'entrada/salida de audio I2S' },
  { re: /\bes8311\b/i, que: 'códec de audio ES8311' },
  { re: /\badc1?_get_raw\b.*\bmic\b/i, que: 'lectura de micrófono por ADC' },
  { re: /\banalogRead\s*\(\s*\w*MIC/i, que: 'lectura de micrófono por ADC' },
  { re: /\b(tone|ledcWriteTone|ledcAttachPin)\s*\(/i, que: 'salida de audio por PWM' },
  { re: /\bServo\b|\bservoWrite\b|\battach\s*\(\s*\w*SERVO/i, que: 'control de servo' },
  { re: /\bI2S_NUM_\d/i, que: 'periférico I2S' },
];

const files = [];
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(c|cc|cpp|h|hpp|ino)$/.test(e.name)) files.push(p);
  }
};
walk(path.join(ROOT, 'src'));
walk(path.join(ROOT, 'include'));

if (!files.length) {
  console.log('· sin fuentes de firmware todavía: nada que comprobar');
  process.exit(0);
}

let fallos = 0;
for (const f of files) {
  const lineas = fs.readFileSync(f, 'utf8').split('\n');
  lineas.forEach((linea, i) => {
    const s = linea.trim();
    if (s.startsWith('//') || s.startsWith('*') || s.startsWith('/*')) return; // los comentarios SÍ pueden nombrarlo
    for (const p of PROHIBIDOS) {
      if (p.re.test(linea)) {
        console.error(`✗ ${path.relative(ROOT, f)}:${i + 1} · ${p.que}`);
        console.error(`   ${s.slice(0, 100)}`);
        fallos++;
      }
    }
  });
}

if (fallos) {
  console.error(`\nLúa no puede escuchar, sonar ni moverse: ${fallos} incumplimiento(s).`);
  console.error('Si esto entra a propósito, cambia primero el plan y el análisis de riesgo,');
  console.error('no el gate: docs/plan-integracion-lua.md §5 y §8.');
  process.exit(1);
}

console.log(`✓ Lúa sigue muda y quieta: ${files.length} fichero(s), sin audio, sin micrófono, sin servos.`);

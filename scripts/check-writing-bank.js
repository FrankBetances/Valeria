#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate del banco de trazos (La Pizarra Mágica de Lúa)
 *   node scripts/check-writing-bank.js
 *
 * Existe porque el banco de trazos es GEOMETRÍA, y la geometría es lo único de
 * este repo que el typecheck no puede ver: un waypoint con la coordenada
 * cambiada compila igual, se pinta como un círculo numerado flotando lejos del
 * modelo, y el niño no puede tocarlo nunca. El ejercicio queda imposible de
 * aprobar y la app no da ni un aviso — el mismo patrón que la regla 0 de
 * CLAUDE.md persigue: nadie lo sabe hasta que alguien abre la pantalla.
 *
 * Lo que se comprueba, todo calculado, nada afirmado:
 *   1. ids únicos y `contrastWith` que apunta a una letra de este mismo banco;
 *   2. el modelo cabe en el lienzo (310 px de alto, ~330 en el móvil estrecho);
 *   3. cada waypoint cae SOBRE el trazo del modelo (se muestrea el path);
 *   4. `order` correlativo desde 1, sin huecos ni repetidos;
 *   5. dos waypoints no se pisan (tolerancia de acierto: 32 px; radio: 16 px);
 *   6. el recorrido por orden es alcanzable: ningún salto absurdo hacia atrás
 *      dentro de un mismo tramo continuo.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// El lienzo real: ValeriaWritingExerciseScreen fija min(ancho - 32, 440) x 310.
// El ancho seguro es el del móvil más estrecho que soporta la app (320 dp).
const CANVAS_H = 310;
const CANVAS_W_MIN = 320 - 32;
const HIT_TOLERANCE = 32; // ValeriaWritingCanvas.checkWaypoints
const WP_RADIUS = 16;     // radio del círculo pintado
const ON_PATH_MAX = 26;   // cuánto puede alejarse un waypoint del modelo

const fails = [];
const fail = (m) => fails.push(m);
const ok = (m) => console.log(`  ✓ ${m}`);

// Se compila con tsc en vez de leerlo con regex: una regex da por bueno un dato
// que TypeScript rechazaría, y al revés.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-writing-'));
let BANK;
try {
  execSync([
    'npx tsc', JSON.stringify(path.join(ROOT, 'src', 'valeriaWritingBank.ts')),
    '--module commonjs', '--target es2020', '--moduleResolution node',
    '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp),
  ].join(' '), { cwd: ROOT, stdio: 'inherit' });
  BANK = require(path.join(tmp, 'valeriaWritingBank.js')).WRITING_EXERCISES;
} catch (e) {
  console.error('✖ src/valeriaWritingBank.ts no compila (mira el error de tsc de arriba)');
  process.exit(1);
} finally {
  // El require ya está hecho; el directorio se limpia al final del proceso.
}

// ---------------------------------------------------------------------------
// Muestreo del path. El banco solo usa M, L, C y Q (mayúsculas, absolutas): no
// hace falta un parser de SVG completo, y uno completo escondería justo el
// error que este gate busca — un comando que nadie quiso escribir.
// ---------------------------------------------------------------------------
const SAMPLES_PER_SEG = 24;

function samplePath(d, id) {
  const tokens = d.match(/[MLCQ]|-?\d*\.?\d+/g) ?? [];
  const pts = [];
  let i = 0;
  let cur = null;
  let cmd = null;
  const num = () => {
    const v = parseFloat(tokens[i++]);
    if (Number.isNaN(v)) throw new Error(`${id}: número inválido en el path`);
    return v;
  };
  const push = (p) => pts.push(p);
  const bez = (p0, cps) => {
    for (let s = 1; s <= SAMPLES_PER_SEG; s++) {
      const t = s / SAMPLES_PER_SEG;
      const u = 1 - t;
      if (cps.length === 2) { // cuadrática
        const [c, p1] = cps;
        push({
          x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
          y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
        });
      } else { // cúbica
        const [c1, c2, p1] = cps;
        push({
          x: u ** 3 * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * p1.x,
          y: u ** 3 * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * p1.y,
        });
      }
    }
    return cps[cps.length - 1];
  };

  while (i < tokens.length) {
    if (/[MLCQ]/.test(tokens[i])) { cmd = tokens[i++]; } // comando implícito: se repite
    if (cmd === 'M') {
      cur = { x: num(), y: num() };
      push(cur);
    } else if (cmd === 'L') {
      const p1 = { x: num(), y: num() };
      for (let s = 1; s <= SAMPLES_PER_SEG; s++) {
        const t = s / SAMPLES_PER_SEG;
        push({ x: cur.x + (p1.x - cur.x) * t, y: cur.y + (p1.y - cur.y) * t });
      }
      cur = p1;
    } else if (cmd === 'C') {
      cur = bez(cur, [{ x: num(), y: num() }, { x: num(), y: num() }, { x: num(), y: num() }]);
    } else if (cmd === 'Q') {
      cur = bez(cur, [{ x: num(), y: num() }, { x: num(), y: num() }]);
    } else {
      throw new Error(`${id}: comando de path no soportado «${tokens[i]}»`);
    }
  }
  return { pts };
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Emparejamiento MONÓTONO: el waypoint n se busca a partir de donde cayó el
// n-1, no en todo el path. Es lo que convierte «está cerca del trazo» en «está
// cerca del trazo Y en el sitio por el que se pasa en ese momento», que es la
// pregunta real. Buscar el mínimo global daba un falso positivo en cuanto dos
// tramos arrancan en el mismo punto —la q, cuya barriga empieza justo donde
// nace el palo— y, peor, daba por bueno un trazo numerado al revés.
const matchFrom = (pts, p, from) => {
  let best = Infinity; let at = -1;
  for (let k = from; k < pts.length; k++) {
    const d = dist(pts[k], p);
    if (d < best) { best = d; at = k; }
  }
  return { d: best, at };
};

console.log('Pizarra Mágica de Lúa · verificación geométrica del banco de trazos\n');

// --- 1. Identidad y contrastes ---------------------------------------------
const ids = new Set();
const letters = new Set();
for (const it of BANK) {
  if (ids.has(it.id)) fail(`id duplicado «${it.id}»`);
  ids.add(it.id);
  if (it.category === 'critical') letters.add(it.guide.label);
  if (!it.title?.trim()) fail(`${it.id}: sin título`);
  if (!it.prompt?.trim()) fail(`${it.id}: sin consigna`);
  if (!it.phoneme?.trim()) fail(`${it.id}: sin phoneme`);
  // En las letras, «Oír la letra» locuta el phoneme: si no coincide con la
  // letra que se está trazando, el botón dice una cosa y suena otra.
  if (it.category === 'critical' && it.phoneme !== it.guide.label) {
    fail(`${it.id}: el phoneme «${it.phoneme}» no es la letra del modelo («${it.guide.label}»), `
      + 'y es lo que pronuncia «Oír la letra»');
  }
  // La insignia de la consigna es un círculo de 44 px con un glifo de 22: una
  // etiqueta de más de una letra se desborda y se come el título de al lado.
  if (it.category === 'critical' && [...it.guide.label].length !== 1) {
    fail(`${it.id}: la etiqueta del modelo es «${it.guide.label}» y en la insignia solo cabe `
      + 'UNA letra (círculo de 44 px, glifo de 22)');
  }
}
for (const it of BANK) {
  // Un contraste que apunta a una letra que no está en el banco promete un par
  // que no se puede entrenar: el niño ve «se confunde con la d» y la d no existe.
  if (it.contrastWith && !letters.has(it.contrastWith)) {
    fail(`${it.id}: contrastWith «${it.contrastWith}» no es ninguna letra de este banco`);
  }
}
if (!fails.length) {
  ok(`${BANK.length} trazos con id único; los ${BANK.filter((i) => i.contrastWith).length} contrastes `
    + 'apuntan a letras que están en el banco');
}

// --- 2..6. Geometría de cada modelo ----------------------------------------
let checked = 0;
for (const it of BANK) {
  const g = it.guide;
  let sampled;
  try {
    sampled = samplePath(g.svgPath, it.id);
  } catch (e) {
    fail(e.message);
    continue;
  }
  const { pts } = sampled;
  if (pts.length < 2) { fail(`${it.id}: el path no dibuja nada`); continue; }

  // 2. Dentro del lienzo.
  for (const p of pts) {
    if (p.x < 0 || p.x > CANVAS_W_MIN || p.y < 0 || p.y > CANVAS_H) {
      fail(`${it.id}: el modelo se sale del lienzo en (${Math.round(p.x)}, ${Math.round(p.y)}) `
        + `— el lienzo es ${CANVAS_W_MIN}x${CANVAS_H} en el móvil más estrecho`);
      break;
    }
  }

  const wps = [...g.waypoints].sort((a, b) => a.order - b.order);

  // 4. Orden correlativo desde 1.
  wps.forEach((w, k) => {
    if (w.order !== k + 1) fail(`${it.id}: los order deben ir de 1 a ${wps.length} sin huecos (hay ${w.order} en la posición ${k + 1})`);
  });
  if (new Set(g.waypoints.map((w) => w.id)).size !== g.waypoints.length) {
    fail(`${it.id}: ids de waypoint repetidos`);
  }

  // 3 y 6. Cada waypoint cae sobre el trazo Y por delante del anterior: si el
  //        orden numerado contradice el sentido en que se dibuja el modelo, el
  //        waypoint deja de encontrarse hacia delante y salta el mismo aviso.
  //        Es la comprobación anti-inversión: numerar la b de abajo arriba
  //        enseña a trazarla al revés, que es justo lo que la pantalla combate.
  let cursor = 0;
  for (const w of wps) {
    const n = matchFrom(pts, w, cursor);
    if (n.d > ON_PATH_MAX) {
      fail(`${it.id}: el waypoint ${w.order} (${w.x}, ${w.y}) queda a ${Math.round(n.d)} px del modelo `
        + `recorrido hacia delante (máximo ${ON_PATH_MAX}): o está fuera del trazo, o su número `
        + 'contradice la dirección en que se escribe');
    } else {
      cursor = n.at;
    }
  }

  // 5. Waypoints que no se pisen.
  for (let a = 0; a < wps.length; a++) {
    for (let b = a + 1; b < wps.length; b++) {
      const d = dist(wps[a], wps[b]);
      if (d < WP_RADIUS * 2) {
        fail(`${it.id}: los waypoints ${wps[a].order} y ${wps[b].order} están a ${Math.round(d)} px `
          + `(mínimo ${WP_RADIUS * 2}): los círculos se solapan y un solo gesto marca los dos`);
      }
    }
  }

  checked++;
}
if (!fails.length) {
  const n = BANK.reduce((a, it) => a + it.guide.waypoints.length, 0);
  ok(`los ${checked} modelos caben en el lienzo y sus ${n} waypoints caen sobre el trazo, `
    + 'numerados en el sentido en que se escribe');
}

// --- La letra que suena está en el corpus -----------------------------------
// «Oír la letra» locuta `phoneme` con speakWordSlow (estilo 'slow'). Si esa
// cadena no está en voice-corpus.json, la locución no falla: cae a la voz del
// sistema, en silencio, y en galego y euskera se pierden Celtia e ILENIA. Es la
// grieta exacta que costó el build 499, y aquí se comprueba contra el JSON
// exportado, no contra el código: así una letra nueva sin
// `node scripts/export-voice-corpus.js` en el mismo commit sale en rojo.
const CORPUS = path.join(ROOT, 'voice-corpus.json');
if (!fs.existsSync(CORPUS)) {
  fail('no existe voice-corpus.json: corre node scripts/export-voice-corpus.js');
} else {
  const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8')).corpus ?? [];
  const spoken = new Set(corpus.filter((e) => e.style === 'slow').map((e) => `${e.lang}|${e.text}`));
  const LANGS = ['es', 'gl', 'eu', 'en', 'ca'];
  const holes = [];
  for (const it of BANK) {
    if (it.category !== 'critical') continue;
    const cue = it.phoneme.toLowerCase();
    for (const lang of LANGS) if (!spoken.has(`${lang}|${cue}`)) holes.push(`${it.id} (${lang})`);
  }
  if (holes.length) {
    fail(`${holes.length} modelos de letra fuera del corpus de voz: ${holes.slice(0, 6).join(', ')}`
      + `${holes.length > 6 ? '…' : ''}. Corre node scripts/export-voice-corpus.js EN ESTE MISMO commit.`);
  } else {
    const n = BANK.filter((i) => i.category === 'critical').length;
    ok(`las ${n} letras se pronuncian desde el corpus en es · gl · eu · en · ca`);
  }
}

// --- Reparto por pestaña ----------------------------------------------------
// La pantalla tiene dos series (críticas y lazos) y las recorre en orden: una
// serie vacía deja la pestaña con el lienzo en blanco y sin consigna.
for (const cat of ['critical', 'warmup']) {
  const n = BANK.filter((i) => i.category === cat).length;
  if (!n) fail(`la pestaña «${cat}» se queda sin ningún trazo`);
}
if (!fails.some((m) => /pestaña/.test(m))) {
  ok(`${BANK.filter((i) => i.category === 'critical').length} letras críticas y `
    + `${BANK.filter((i) => i.category === 'warmup').length} lazos de calentamiento`);
}

fs.rmSync(tmp, { recursive: true, force: true });

if (fails.length) {
  console.error(`\n✖ Banco de trazos: ${fails.length} ${fails.length === 1 ? 'problema' : 'problemas'}`);
  for (const m of fails) console.error('   · ' + m);
  process.exit(1);
}
console.log('\n✓ Banco de trazos: geometría, orden y contrastes en orden.');

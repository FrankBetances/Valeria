#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate de figuras de LSE (Academy · dominio 'signos')
 *   node scripts/check-sign-figures.js
 *
 * Comprueba que TODA figura que el contenido pide dibujar existe de verdad en
 * el registro de AcademySignosSvg, y que el abecedario dactilológico está
 * completo (27 letras, A-Z + Ñ, cada una con su dibujo).
 *
 * Por qué existe: `SignFigure` devuelve null cuando la clave no tiene dibujo, a
 * propósito, para que una diapositiva nunca se rompa. El efecto secundario es
 * que un error de clave («mano-ñ» en vez de «mano-enhe») no se ve en el diff ni
 * en el typecheck: simplemente deja de haber dibujo, y quien abre el módulo
 * concluye que no hay pictogramas. Este chequeo convierte ese silencio en un
 * fallo de CI.
 *
 * Lo que este script NO puede hacer —y por eso la revisión humana sigue siendo
 * obligatoria— es decir si un dibujo SE RECONOCE como la letra que dice ser.
 * Eso solo lo valida una persona sorda signante.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-signos-'));

// A-Z + Ñ en el orden del abecedario español.
const ABECEDARIO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };

try {
  const svg = fs.readFileSync(path.join(ROOT, 'src', 'ValeriaAcademy', 'AcademySignosSvg.tsx'), 'utf8');

  // Claves con dibujo registrado (se leen del propio componente, no de una
  // lista paralela: si alguien borra una figura, este gate debe enterarse).
  const registro = svg.match(/const FIGURAS: Record<string, Fig> = \{([\s\S]*?)\n\};/);
  if (!registro) {
    console.error('✖ No se encontró el registro FIGURAS en AcademySignosSvg.tsx');
    process.exit(1);
  }
  const dibujadas = new Set([...registro[1].matchAll(/^\s*'([a-z0-9-]+)'\s*:/gm)].map((m) => m[1]));
  console.log(`${dibujadas.size} configuraciones con dibujo registrado.`);

  // Abecedario declarado (letra → clave de figura).
  const abc = svg.match(/export const DACTYL_ALPHABET: DactylLetter\[\] = \[([\s\S]*?)\n\];/);
  if (!abc) {
    console.error('✖ No se encontró DACTYL_ALPHABET en AcademySignosSvg.tsx');
    process.exit(1);
  }
  const letras = [...abc[1].matchAll(/\{\s*letter:\s*'([^']+)',\s*figure:\s*'([a-z0-9-]+)'/g)]
    .map((m) => ({ letter: m[1], figure: m[2] }));

  console.log(`\n── abecedario dactilológico ──`);
  const declaradas = new Set(letras.map((l) => l.letter));
  for (const l of ABECEDARIO) {
    if (!declaradas.has(l)) fallo(`A1: falta la letra «${l}» en DACTYL_ALPHABET`);
  }
  for (const { letter, figure } of letras) {
    if (!dibujadas.has(figure)) fallo(`A2: la letra «${letter}» apunta a «${figure}», que no tiene dibujo`);
  }
  const repetidas = letras.map((l) => l.figure).filter((f, i, arr) => arr.indexOf(f) !== i);
  for (const f of new Set(repetidas)) fallo(`A3: la figura «${f}» está asignada a más de una letra`);
  console.log(`  ${letras.length} letras declaradas · ${ABECEDARIO.length} esperadas`);

  // Figuras que pide el contenido de las cápsulas.
  execSync(
    ['npx tsc', JSON.stringify(path.join(ROOT, 'src', 'ValeriaAcademy', 'academyContent.ts')),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );
  const modPath = fs.existsSync(path.join(tmp, 'academyContent.js'))
    ? path.join(tmp, 'academyContent.js')
    : fs.existsSync(path.join(tmp, 'ValeriaAcademy', 'academyContent.js'))
      ? path.join(tmp, 'ValeriaAcademy', 'academyContent.js')
      : path.join(tmp, 'src', 'ValeriaAcademy', 'academyContent.js');
  const { ACADEMY_CAPSULES } = require(modPath);

  console.log(`\n── figuras usadas por las cápsulas ──`);
  let usadas = 0;
  for (const c of ACADEMY_CAPSULES) {
    for (const s of c.slides ?? []) {
      if (!s.figure) continue;
      usadas += 1;
      if (!dibujadas.has(s.figure)) {
        fallo(`C1 ${c.id} («${s.heading}»): la clave «${s.figure}» no tiene dibujo registrado`);
      }
    }
  }
  console.log(`  ${usadas} diapositivas con figura`);

  // El dominio de LSE debe mostrar dibujo en alguna parte: si nadie pide el
  // panel del abecedario ni ninguna figura, el módulo vuelve a ser solo texto.
  const signos = ACADEMY_CAPSULES.filter((c) => c.domain === 'signos');
  const conFigura = signos.filter((c) => (c.slides ?? []).some((s) => s.figure || s.chart)).length;
  if (signos.length && !conFigura) {
    fallo('C2: ninguna cápsula de LSE muestra figura ni panel del abecedario');
  }
  const conPanel = signos.some((c) => (c.slides ?? []).some((s) => s.chart === 'dactilologico'));
  if (signos.length && !conPanel) {
    fallo('C3: ninguna cápsula de LSE incluye el panel del abecedario (chart: "dactilologico")');
  }
  console.log(`  ${conFigura}/${signos.length} cápsulas de LSE con dibujo`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (fallos) {
  console.error(`\n✖ ${fallos} problemas en las figuras de LSE.`);
  console.error('  Ver docs/plan-mejoras-acopros-logopedas.json → propuestasPosteriores.LSE-01.');
  process.exit(1);
}
console.log('\n✓ Abecedario dactilológico completo y todas las figuras del contenido tienen dibujo.');

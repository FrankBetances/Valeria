#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Cobertura de pictogramas en cápsulas de contraste (ES-12 · ES-09)
 *   node scripts/check-pictogram-coverage.js
 *
 * La vuelta de comprensión de una cápsula muestra las dos imágenes a la vez y
 * pide tocar la correcta. Por la regla de congruencia de ES-13, ambas vueltas
 * muestran EL MISMO OBJETO y solo difieren en el atributo contrastado — así que
 * con emoji las dos tarjetas salen idénticas y la tarea es irresoluble. Cuando
 * se cerró la fase 3 eso afectaba a 16 de las 20 cápsulas de los tres bancos.
 *
 * Este gate impide que vuelva a ocurrir:
 *
 *   P1 · Toda vuelta de toda cápsula declara `pictogram`.
 *   P2 · Esa clave tiene dibujo registrado en ValeriaPictograms.
 *   P3 · Las dos vueltas de una cápsula usan claves DISTINTAS. Es el fallo que
 *        no se ve leyendo el dato: copiar la clave de la primera vuelta a la
 *        segunda pasa P1 y P2, y deja las dos tarjetas iguales otra vez.
 *
 * Fuera de las cápsulas, el pictograma es opcional: la caída a emoji es el
 * comportamiento previsto mientras el banco propio se completa por tandas.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-pictogramas-cov-'));

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };

try {
  // Las claves con dibujo se leen del propio componente, no de una lista
  // paralela: si alguien borra un pictograma, este gate debe enterarse.
  const fuente = fs.readFileSync(path.join(ROOT, 'src', 'ValeriaPictograms.tsx'), 'utf8');
  const bloque = fuente.match(/const PICTOGRAMS_BY_KEY: Record<string, Pic> = \{([\s\S]*?)\n\};/);
  if (!bloque) {
    console.error('✖ No se encontró el registro PICTOGRAMS_BY_KEY en src/ValeriaPictograms.tsx');
    process.exit(1);
  }
  const dibujadas = new Set(
    [...bloque[1].matchAll(/^\s*'?([a-z0-9-]+)'?\s*:/gm)].map((m) => m[1]),
  );

  const entradas = [
    'valeriaSemanticExpansion', 'valeriaSemanticExpansionEsDO', 'valeriaSemanticExpansionEu',
    'valeriaSemanticExpansionGl',
  ];
  execSync(
    ['npx tsc', ...entradas.map((e) => JSON.stringify(path.join(ROOT, 'src', `${e}.ts`))),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );
  const mod = (n) => require(path.join(tmp, `${n}.js`));

  const BANCOS = [
    { lang: 'es', capsules: mod('valeriaSemanticExpansion').CONTRAST_CAPSULES },
    { lang: 'es-DO', capsules: mod('valeriaSemanticExpansionEsDO').CONTRAST_CAPSULES_ESDO },
    { lang: 'eu', capsules: mod('valeriaSemanticExpansionEu').CONTRAST_CAPSULES_EU },
    { lang: 'gl', capsules: mod('valeriaSemanticExpansionGl').CONTRAST_CAPSULES_GL },
  ];

  console.log(`\n${dibujadas.size} claves con dibujo registrado.`);

  let capsulas = 0;
  for (const b of BANCOS) {
    console.log(`\n── ${b.lang} ──`);
    for (const c of b.capsules ?? []) {
      capsulas += 1;
      const claves = [];
      for (const r of c.rounds ?? []) {
        if (!r.pictogram) {
          fallo(`P1 ${b.lang}/${c.id} («${r.label}»): la vuelta no declara pictogram; con emoji la vuelta de comprensión mostraría dos tarjetas iguales`);
          continue;
        }
        if (!dibujadas.has(r.pictogram)) {
          fallo(`P2 ${b.lang}/${c.id} («${r.label}»): la clave «${r.pictogram}» no tiene dibujo en PICTOGRAMS_BY_KEY`);
        }
        claves.push(r.pictogram);
      }
      if (claves.length === 2 && claves[0] === claves[1]) {
        fallo(`P3 ${b.lang}/${c.id}: las dos vueltas usan la MISMA clave («${claves[0]}»): el niño vería dos tarjetas idénticas`);
      }
    }
    console.log(`  ${(b.capsules ?? []).length} cápsulas revisadas`);
  }
  console.log(`\n${capsulas} cápsulas en total.`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (fallos) {
  console.error(`\n✖ ${fallos} cápsulas con la vuelta de comprensión irresoluble.`);
  console.error('  Ver docs/plan-mejoras-acopros-logopedas.json → ES-12, ES-09, DC-4.');
  process.exit(1);
}
console.log('\n✓ Todas las cápsulas distinguen sus dos vueltas con pictograma propio (ES-12).');

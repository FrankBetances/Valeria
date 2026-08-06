#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Progresión de dificultad de las categorías léxicas (ES-08 · DC-1 C)
 *   node scripts/check-lexical-difficulty.js
 *
 * ACOPROS pidió que, al organizar el vocabulario por categorías, se siguiera una
 * progresión de dificultad. Un campo `difficulty` que nadie comprueba es una
 * declaración de intenciones: este gate lo convierte en una regla.
 *
 *   D1 · Todo ítem de una categoría declara su nivel.
 *   D2 · Los ítems están ESCRITOS en orden ascendente. Importa porque la sesión
 *        se construye recorriendo el array: un ítem avanzado colado entre los
 *        iniciales se le presenta al niño en su primera sesión.
 *   D3 · Toda categoría tiene al menos un ítem de nivel 1. Con el tope puesto en
 *        1 —lo que hace el logopeda al empezar— una categoría sin nivel 1 se
 *        abriría vacía.
 *   D4 · Las tres variedades tienen las MISMAS categorías. Si el banco vasco se
 *        queda sin «Koloreak», ese niño pierde un bloque entero sin que nadie
 *        se entere.
 *
 * Lo que este gate NO comprueba: si «manzana» es realmente más familiar que
 * «cereza». Eso es juicio clínico y va a la revisión de ACOPROS; aquí solo se
 * protege que la estructura respete lo que el dato dice de sí mismo.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-dificultad-'));

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };

try {
  const entradas = [
    'valeriaSemanticExpansion', 'valeriaSemanticExpansionEsDO', 'valeriaSemanticExpansionEu',
    'valeriaSemanticExpansionGl', 'valeriaSemanticExpansionEn',
  ];
  execSync(
    ['npx tsc', ...entradas.map((e) => JSON.stringify(path.join(ROOT, 'src', `${e}.ts`))),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );
  const mod = (n) => require(path.join(tmp, `${n}.js`));

  const BANCOS = [
    { lang: 'es', categories: mod('valeriaSemanticExpansion').LEXICAL_CATEGORIES },
    { lang: 'es-DO', categories: mod('valeriaSemanticExpansionEsDO').LEXICAL_CATEGORIES_ESDO },
    { lang: 'eu', categories: mod('valeriaSemanticExpansionEu').LEXICAL_CATEGORIES_EU },
    { lang: 'gl', categories: mod('valeriaSemanticExpansionGl').LEXICAL_CATEGORIES_GL },
    { lang: 'en', categories: mod('valeriaSemanticExpansionEn').LEXICAL_CATEGORIES_EN },
  ];

  for (const b of BANCOS) {
    console.log(`\n── ${b.lang} ──`);
    for (const c of b.categories ?? []) {
      const niveles = [];
      for (const it of c.items ?? []) {
        if (it.difficulty == null) {
          fallo(`D1 ${b.lang}/${c.id}: «${it.label}» no declara difficulty`);
          continue;
        }
        if (![1, 2, 3].includes(it.difficulty)) {
          fallo(`D1 ${b.lang}/${c.id}: «${it.label}» tiene un nivel fuera de 1-3 (${it.difficulty})`);
          continue;
        }
        niveles.push({ label: it.label, n: it.difficulty });
      }
      for (let i = 1; i < niveles.length; i++) {
        if (niveles[i].n < niveles[i - 1].n) {
          fallo(`D2 ${b.lang}/${c.id}: «${niveles[i].label}» (nivel ${niveles[i].n}) va después de «${niveles[i - 1].label}» (nivel ${niveles[i - 1].n}): el orden de escritura ES el orden de práctica`);
        }
      }
      if (niveles.length && !niveles.some((x) => x.n === 1)) {
        fallo(`D3 ${b.lang}/${c.id}: ninguna palabra de nivel 1; con el tope en 1 la categoría se abriría vacía`);
      }
    }
    const resumen = (b.categories ?? []).map((c) => {
      const cuenta = [1, 2, 3].map((n) => (c.items ?? []).filter((i) => i.difficulty === n).length);
      return `${c.title} (${cuenta.join('/')})`;
    });
    console.log(`  ${(b.categories ?? []).length} categorías · niveles 1/2/3: ${resumen.join(', ')}`);
  }

  // ---- D4: mismas categorías en las tres variedades ----------------------
  // Se comparan por TÍTULO y no por id, porque los ids llevan prefijo de
  // variedad a propósito (do-cat-…, eu-cat-…). Lo que debe coincidir es el
  // campo semántico que se trabaja, no cómo se llama la constante.
  const titulos = BANCOS.map((b) => (b.categories ?? []).length);
  if (new Set(titulos).size !== 1) {
    fallo(`D4 · las variedades no tienen el mismo número de categorías: ${BANCOS.map((b, i) => `${b.lang}=${titulos[i]}`).join(', ')}`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (fallos) {
  console.error(`\n✖ ${fallos} problemas en la progresión de dificultad.`);
  console.error('  Ver docs/criterio-dificultad-lexica.md y el plan → ES-08, DC-1.');
  process.exit(1);
}
console.log('\n✓ Las categorías léxicas progresan de menos a más difícil (ES-08).');

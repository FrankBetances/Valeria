#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Los dos ejes de idioma no se contradicen dentro de un ejercicio
 *   node scripts/check-adult-fields.js
 *
 * Un ejercicio mezcla dos audiencias. Lo que se le dice al NIÑO va en la
 * variedad de terapia; lo que solo lee el ADULTO va en el idioma de la
 * interfaz. Cuando eso se rompe, la app entra desde «Vowel articulation» a un
 * ejercicio titulado «Articulación de vocales» y se puntúa con una escala
 * EPT-3 en castellano. Pasó, y lo encontró Frank, no el typecheck.
 *
 * Tres comprobaciones, sobre el banco compilado de verdad:
 *
 *   R1 · Ningún campo de ADULT_ONLY_FIELDS se locuta. Si alguno entrara en el
 *        corpus de voz, con la UI en inglés se le pediría a la voz inglesa que
 *        leyera castellano. Es la razón de ser de EN_THERAPY_CONTENT_READY.
 *   R2 · Los 37 ejercicios traen TODOS sus campos de adulto en inglés. Un
 *        hueco no se ve: cae al castellano en silencio.
 *   R3 · Con la UI en inglés y terapia en castellano, dbFor() devuelve el
 *        criterio EPT-3 en inglés y la consigna locutada en castellano. Es el
 *        caso del logopeda con caseload bilingüe, y se comprueba de verdad.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-adult-fields-'));

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };

try {
  execSync(
    ['npx tsc', JSON.stringify(path.join(ROOT, 'src', 'valeriaExerciseBank.ts')),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );

  const bank = require(path.join(tmp, 'valeriaExerciseBank.js'));
  const { ADULT_ONLY_FIELDS, dbFor, dbForLocale, enumerateExerciseSpeechFor, variantsForLocale } = bank;
  const en = require(path.join(tmp, 'valeriaExerciseEn.js'));
  const metaEn = require(path.join(tmp, 'valeriaExerciseMeta.js')).META_BY_ID_EN;

  // ---- R1 · ningún campo de adulto se locuta -------------------------------
  console.log('\n── R1 · los campos de adulto no llegan a la voz ──');
  const habladoEs = new Set(enumerateExerciseSpeechFor({
    db: dbForLocale('es'),
    variants: variantsForLocale('es'),
    fixed: [],
    pluralOne: (p) => p.cap,
    pluralMany: (p) => p.capPlural,
  }).map((l) => l.text));

  for (const [id, ex] of Object.entries(dbForLocale('es'))) {
    for (const f of ADULT_ONLY_FIELDS) {
      const v = ex[f];
      if (v === undefined) continue;
      for (const texto of Array.isArray(v) ? v : [v]) {
        if (typeof texto === 'string' && habladoEs.has(texto)) {
          fallo(`${id}.${f} se LOCUTA y está en la lista de campos de adulto: `
            + `sácalo de ADULT_ONLY_FIELDS o deja de locutarlo — «${texto.slice(0, 50)}…»`);
        }
      }
    }
  }
  if (!fallos) console.log('  ✓ ninguno de los campos de adulto entra en el corpus de voz');

  // ---- R2 · el overlay inglés no tiene huecos ------------------------------
  console.log('\n── R2 · los 37 ejercicios traen sus campos de adulto en inglés ──');
  const antes = fallos;
  // name/category/age no viven en el overlay: los manda valeriaExerciseMeta,
  // que es de donde tira también la lista de bloques.
  const DEL_META = new Set(['name', 'category', 'age']);
  for (const [id, ex] of Object.entries(dbForLocale('es'))) {
    const ov = en.EXERCISE_EN[id];
    if (!ov) { fallo(`${id} no tiene overlay inglés`); continue; }
    for (const f of ADULT_ONLY_FIELDS) {
      if (DEL_META.has(f)) continue;
      if (ex[f] !== undefined && ov[f] === undefined) {
        fallo(`${id}.${f} existe en castellano y falta en inglés: con la UI en inglés cae al castellano en silencio`);
      }
    }
    if (!metaEn[id]) fallo(`${id} no tiene metadatos ingleses en valeriaExerciseMeta`);
    if (ex.levels && (!ov.levels || ov.levels.length !== ex.levels.length)) {
      fallo(`${id}.levels: el overlay inglés no cubre los ${ex.levels.length} sub-pasos`);
    }
  }
  if (fallos === antes) console.log('  ✓ sin huecos');

  // ---- R3 · el comportamiento real, no la intención ------------------------
  // Igualdad exacta contra el banco de destino, no adivinar el idioma por
  // palabras: un heurístico de idioma da falsos positivos justo en las frases
  // cortas, que son la mitad de la escala EPT-3.
  console.log('\n── R3 · los dos ejes resueltos a la vez ──');
  const antes3 = fallos;
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const base = dbForLocale('es');
  const ingles = dbForLocale('en-US');

  // Caso de Frank: interfaz en inglés, terapia en castellano.
  for (const [id, ex] of Object.entries(dbFor('es', 'en'))) {
    if (!eq(ex.ept, ingles[id].ept)) fallo(`${id}.ept no es el inglés con la UI en inglés`);
    if (!eq(ex.stageLabel, ingles[id].stageLabel)) fallo(`${id}.stageLabel no es el inglés con la UI en inglés`);
    if (ex.name !== metaEn[id].name) fallo(`${id}.name no es el inglés con la UI en inglés`);
    // Y lo LOCUTADO no se mueve: la voz castellana leería inglés.
    if (ex.read !== base[id].read) fallo(`${id}.read ha cambiado de idioma y eso lo locuta la app`);
    if (ex.move !== base[id].move) fallo(`${id}.move ha cambiado de idioma y eso lo locuta la app`);
    if (!eq(ex.tiles, base[id].tiles)) fallo(`${id}.tiles ha cambiado: es lo que oye y dice el niño`);
  }

  // Caso simétrico: terapia en inglés, interfaz en castellano (caseload bilingüe).
  for (const [id, ex] of Object.entries(dbFor('en-US', 'es'))) {
    if (!eq(ex.ept, base[id].ept)) fallo(`${id}.ept no es el castellano con la UI en castellano`);
    if (ex.read !== ingles[id].read) fallo(`${id}.read ha cambiado y eso lo locuta la voz inglesa`);
  }

  // Cuando los dos ejes coinciden, no se toca nada.
  for (const [loc, lang] of [['es', 'es'], ['en-US', 'en'], ['gl', 'es'], ['eu', 'es'], ['es-DO', 'es']]) {
    if (!eq(dbFor(loc, lang), dbForLocale(loc))) {
      fallo(`dbFor('${loc}', '${lang}') ha cambiado el banco y no debía tocarlo`);
    }
  }
  if (fallos === antes3) console.log('  ✓ el criterio EPT-3 sigue a la interfaz y lo locutado sigue a la variedad');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (fallos) {
  console.error(`\n✗ ${fallos} fallo(s): los dos ejes de idioma se contradicen dentro del ejercicio.`);
  process.exit(1);
}
console.log('\n✓ Cada audiencia lee su idioma: el niño la variedad, el adulto la interfaz.');

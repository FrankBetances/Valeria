#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Ninguna variedad se queda sin su rama
 *   node scripts/check-variety-branches.js
 *
 * El patrón que dejó pasar la queja de Frank («la voz inglesa lee castellano»)
 * es siempre el mismo: un selector por variedad escrito cuando solo existían
 * el galego y el euskera, al que luego NO se le añadió el inglés.
 *
 *     l === 'gl' ? PRAISE_BANK_GL : l === 'eu' ? PRAISE_BANK_EU : PRAISE_BANK
 *
 * Con `en-US` activa eso devuelve el banco CASTELLANO, y el motor lo locuta con
 * ttsLang() = 'en-US'. No falla, no rompe el typecheck y no lo ve el corpus de
 * voz —que enumera los bancos, no lo que la pantalla elige—: solo se oye. Era
 * el caso de las cuatro frases de refuerzo, que suenan en CADA ensayo.
 *
 * El gate busca la forma, no el síntoma: cualquier sentencia que nombre a la
 * vez un identificador `*_GL` y uno `*_EU` sin nombrar el `*_EN` equivalente.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// Módulos que enumeran TODAS las variedades por separado (el corpus de voz) o
// que SON el contenido de una variedad: ahí la asimetría es la normal.
const EXENTOS = new Set([
  'src/valeriaVoiceCorpus.ts',
  'src/valeriaContentGl.ts', 'src/valeriaContentEu.ts', 'src/valeriaContentEn.ts',
  'src/valeriaExerciseGl.ts', 'src/valeriaExerciseEu.ts', 'src/valeriaExerciseEn.ts',
]);

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
}).filter((p) => /\.tsx?$/.test(p));

const fail = [];

for (const file of walk(SRC)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (EXENTOS.has(rel)) continue;

  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true,
    rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  // La unidad es la FUNCIÓN entera, no la sentencia: el inglés se resuelve a
  // veces con un `if (l === 'en-US') { ...; return; }` unas líneas más arriba,
  // y mirando sentencia a sentencia eso daba un falso positivo.
  const revisar = (node) => {
    const nombres = new Set();
    const recoger = (n) => {
      if (ts.isIdentifier(n)) nombres.add(n.text);
      ts.forEachChild(n, recoger);
    };
    recoger(node);

    // Base del identificador sin sufijo de variedad: PRAISE_BANK_GL → PRAISE_BANK.
    const bases = (sufijo) => [...nombres]
      .filter((n) => n.endsWith(sufijo))
      .map((n) => n.slice(0, -sufijo.length));

    const gl = new Set(bases('_GL'));
    const eu = new Set(bases('_EU'));
    const en = new Set(bases('_EN'));
    for (const base of gl) {
      if (!eu.has(base)) continue;      // no es un selector por variedad
      if (en.has(base)) continue;       // el inglés está
      const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
      fail.push(`${rel}:${line}: ${base} tiene rama _GL y _EU pero no _EN — `
        + 'con la variedad inglesa se devuelve el castellano y lo locuta la voz inglesa.');
    }
  };

  const esFuncion = (n) => ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n)
    || ts.isArrowFunction(n) || ts.isMethodDeclaration(n);

  const visit = (node) => {
    // Se para en la función MÁS EXTERNA: dentro de ella cuenta todo, incluidas
    // las ramas resueltas por retorno anticipado y los closures anidados.
    if (esFuncion(node)) { revisar(node); return; }
    if (ts.isVariableStatement(node) || ts.isReturnStatement(node)
        || ts.isExpressionStatement(node) || ts.isPropertyAssignment(node)) {
      // Sentencia suelta fuera de toda función (una constante de módulo).
      let tieneFn = false;
      const buscar = (n) => { if (esFuncion(n)) tieneFn = true; else ts.forEachChild(n, buscar); };
      ts.forEachChild(node, buscar);
      if (!tieneFn) { revisar(node); return; }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

if (fail.length) {
  console.error(`✗ ${fail.length} selector(es) por variedad sin la rama inglesa:\n`);
  for (const f of fail) console.error(`  ${f}`);
  console.error('\nAñade la rama `en-US` con el banco de valeriaContentEn, o —si de verdad');
  console.error('esa cadena no tiene versión inglesa— añade el fichero a EXENTOS con el motivo.');
  process.exit(1);
}

console.log('✓ Todo selector por variedad que distingue galego y euskera distingue también el inglés.');

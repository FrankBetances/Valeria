#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Ningún idioma de interfaz cae al castellano en silencio
 *   node scripts/check-ui-lang-fallback.js
 *
 * Hermano de check-variety-branches.js, para el OTRO eje. Aquel vigila la
 * variedad de terapia (lo que oye el niño); este vigila el idioma de interfaz
 * (lo que lee el adulto), y nace del mismo fallo con distinto disfraz.
 *
 * Mientras solo hubo `es` y `en`, el contenido de adulto se elegía así:
 *
 *     lang === 'en' ? ACADEMY_CAPSULES_EN : ACADEMY_CAPSULES_ES
 *
 * Al añadir `ca`, esos catorce ternarios devolvían CASTELLANO sin que nada
 * avisara: no rompen el typecheck —el ternario acepta cualquier UiLang—, no los
 * ve `check-ui-strings` —no son literales en .tsx, son módulos de datos— y no
 * los ve el corpus de voz —no se locutan—. Se veía solo mirando la pantalla:
 * una cabecera catalana sobre una lista de ejercicios en castellano. Así se
 * encontró, y de ahí sale este gate.
 *
 * Qué exige, sobre cualquier función que compare un UiLang con 'en':
 *   1) que la comparación no sea la ÚNICA rama de idioma —es decir, que la
 *      función nombre también 'ca', o los identificadores *_CA equivalentes—, o
 *   2) que el fallback esté DECLARADO en src/i18n/uiLangFallback.ts, y entonces
 *      la selección se haga a través de `servedLangFor`, que es lo que la
 *      pantalla usa para avisar al adulto.
 *
 * Y además, sobre el propio registro: cada área declarada tiene que ser
 * consumida por `servedLangFor` en algún sitio. Un fallback declarado y no
 * consumido es una mentira en el fichero que dice la verdad.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// El propio registro y el módulo del eje: aquí las comparaciones con 'en' son
// la definición, no un selector de contenido.
const EXENTOS = new Set([
  'src/i18n/uiLangFallback.ts',
  'src/valeriaUiLang.ts',
  'src/ValeriaUiLangPicker.tsx',
  // Catálogos de interfaz: son el contenido de un idioma, no un selector.
  'src/i18n/strings.es.ts', 'src/i18n/strings.en.ts', 'src/i18n/strings.ca.ts',
  'src/i18n/catalog.ts',
]);

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
}).filter((p) => /\.tsx?$/.test(p));

const fail = [];
let servedLangUses = 0;
const areasUsadas = new Set();

for (const file of walk(SRC)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (EXENTOS.has(rel)) continue;

  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true,
    rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

  // La unidad es la FUNCIÓN entera: una rama catalana resuelta con un return
  // anticipado unas líneas más arriba cuenta como cubierta.
  const revisar = (node) => {
    const nombres = new Set();
    const literales = new Set();
    let usaServed = false;
    const recoger = (n) => {
      if (ts.isIdentifier(n)) {
        nombres.add(n.text);
        if (n.text === 'servedLangFor') { usaServed = true; servedLangUses += 1; }
      }
      if (ts.isStringLiteral(n)) {
        literales.add(n.text);
        if (n.parent && ts.isCallExpression(n.parent)
            && ts.isIdentifier(n.parent.expression)
            && n.parent.expression.text === 'servedLangFor') {
          areasUsadas.add(n.text);
        }
      }
      ts.forEachChild(n, recoger);
    };
    recoger(node);

    // ¿Compara con el idioma de interfaz inglés? (no con la VARIEDAD 'en-US',
    // que es el otro eje y lo vigila check-variety-branches.)
    if (!literales.has('en')) return;
    if (usaServed) return;          // fallback declarado y encauzado
    if (literales.has('ca')) return; // nombra el catalán a mano

    // Identificadores: si hay un par X_EN / X_ES sin X_CA, es el patrón exacto.
    const base = (suf) => [...nombres].filter((n) => n.endsWith(suf)).map((n) => n.slice(0, -suf.length));
    const en = new Set(base('_EN'));
    const es = new Set(base('_ES'));
    const ca = new Set(base('_CA'));
    for (const b of en) {
      if (!es.has(b)) continue;   // no es un selector por idioma de interfaz
      if (ca.has(b)) continue;    // el catalán está
      const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
      fail.push(`${rel}:${line}: ${b} tiene rama _EN y _ES pero no _CA — `
        + 'con la interfaz en catalán el adulto lee castellano y nada lo avisa.\n'
        + '    Añade la rama catalana, o declara el hueco en src/i18n/uiLangFallback.ts\n'
        + '    y selecciona con servedLangFor(), que es lo que hace que la pantalla lo diga.');
    }
  };

  const esFuncion = (n) => ts.isFunctionDeclaration(n) || ts.isFunctionExpression(n)
    || ts.isArrowFunction(n) || ts.isMethodDeclaration(n);

  const visit = (node) => {
    if (esFuncion(node)) { revisar(node); return; }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

// ---- El registro no puede declarar huecos que nadie consulta ---------------
const regPath = path.join(SRC, 'i18n', 'uiLangFallback.ts');
const reg = fs.readFileSync(regPath, 'utf8');
const areasDeclaradas = [...reg.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((m) => m[1]);
for (const area of areasDeclaradas) {
  if (!areasUsadas.has(area)) {
    fail.push(`src/i18n/uiLangFallback.ts: el área «${area}» está declarada pero `
      + 'nadie la consulta con servedLangFor(): o el contenido ya existe y sobra '
      + 'la entrada, o hay un selector que sigue cayendo al castellano por su cuenta.');
  }
}

if (fail.length) {
  console.error('\n✖ Idiomas de interfaz que caen a otra lengua sin decirlo:\n');
  for (const f of fail) console.error('  ' + f);
  console.error('');
  process.exit(1);
}
console.log(`✓ Ningún idioma de interfaz cae en silencio (${servedLangUses} selecciones `
  + `encauzadas por servedLangFor, ${areasDeclaradas.length} áreas declaradas).`);

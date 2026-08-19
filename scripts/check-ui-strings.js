// Gate de i18n de interfaz (EN-2.8): ninguna pantalla pinta texto literal.
//
// Existe porque el repaso a ojo ya falló dos veces con la misma forma: la UI
// se declaró migrada al catálogo y quedaron ficheros enteros en castellano
// —ValeriaVoiceUI (750 líneas) y ValeriaManualNoiseSlider— incrustados dentro
// de pantallas que sí estaban migradas. No son pantallas, así que no salían en
// la lista de tramos; y como compilan y el typecheck pasa, la app se entrega
// mitad en inglés y mitad en castellano sin que nada avise.
//
// Qué mira: lo que el usuario LEE. Hijos de texto de JSX y las props visibles
// (accessibilityLabel/Hint, placeholder, label, hint, prompt, title...). Lo que
// no se lee —claves, rutas, ids canónicos, nombres de estilo— no es asunto suyo.
//
// Para exceptuar una línea, un comentario en ella o en la anterior:
//     // i18n-exempt: motivo
// El motivo es obligatorio: una exención sin explicación es un agujero.
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// Props cuyo valor acaba delante de los ojos (o del lector de pantalla).
const VISIBLE_PROPS = new Set([
  'accessibilityLabel', 'accessibilityHint', 'accessibilityValueText',
  'placeholder', 'label', 'hint', 'prompt', 'title', 'subtitle', 'caption',
  'confirmLabel', 'cancelLabel', 'emptyText', 'unit',
]);

// Ficheros sin una sola cadena de interfaz: sprites, iconos y utilidades de
// dibujo. Si alguno gana texto visible, sale de aquí, no se le añade pragma.
const NO_UI = new Set([
  'src/ValeriaBetancesCrest.tsx', 'src/ValeriaBlockIcons.tsx', 'src/ValeriaCatPixel.tsx',
  'src/ValeriaDistractorCat.tsx', 'src/ValeriaPictograms.tsx', 'src/ValeriaPixelSprite.tsx',
  'src/ValeriaQRCode.tsx', 'src/ValeriaPartnerLogos.tsx', 'src/ValeriaPixelAwards.tsx',
  'src/components/lua/PixelItemIcon.tsx',
  'src/ValeriaAcademy/AcademySignosSvg.tsx',
]);

// Marca y nombres propios: se escriben igual en las dos lenguas. El logotipo
// de la app va en minúscula por diseño y NO se traduce; tampoco el nombre del
// autor. Es una lista cerrada, no un patrón: cualquier otra cosa se traduce.
const BRAND = new Set([
  'valeria', 'valeria+', 'valeria+ · academy', 'ACADEMY ·', 'beta',
  'Dr. Frank Betances', 'Valeria Academy',
]);

// Una cadena es texto de interfaz si trae una palabra de tres letras o más.
// Deja fuera unidades y símbolos (' ms', '°', '·', '%'), que no se traducen.
const isPhrase = (s) => /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,}/.test(s) && !BRAND.has(s.trim());

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
}).filter((p) => p.endsWith('.tsx'));

const fail = [];

for (const file of walk(SRC)) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  if (NO_UI.has(rel)) continue;

  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split('\n');
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // La exención se declara en la línea del literal o en la inmediata anterior:
  // un texto largo se parte en varias líneas y el comentario va arriba.
  const exempt = (line) => [lines[line - 1], lines[line - 2]]
    .some((l) => l && /\/\/\s*i18n-exempt:\s*\S/.test(l));

  const report = (node, what, sample) => {
    const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    if (exempt(line)) return;
    const one = sample.replace(/\s+/g, ' ').trim().slice(0, 70);
    fail.push(`${rel}:${line}: ${what} literal — «${one}»`);
  };

  // Texto de la cadena si es literal; null si es una expresión (t.algo, una
  // variable, una llamada): eso ya lo resuelve otro y no es cosa del gate.
  const literalOf = (node) => {
    if (!node) return null;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isJsxExpression(node) && node.expression) return literalOf(node.expression);
    // `Palabra ${i} de ${n}`: los trozos fijos son texto que hay que traducir.
    if (ts.isTemplateExpression(node)) {
      const chunks = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)];
      return chunks.some(isPhrase) ? chunks.join(' … ') : null;
    }
    // 'a' + variable + 'b': misma concatenación, otra sintaxis.
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      return [literalOf(node.left), literalOf(node.right)].filter(Boolean).join(' … ') || null;
    }
    if (ts.isParenthesizedExpression(node)) return literalOf(node.expression);
    // Un ternario pinta una u otra: las dos ramas son texto visible.
    if (ts.isConditionalExpression(node)) {
      return [literalOf(node.whenTrue), literalOf(node.whenFalse)].filter(Boolean).join(' … ') || null;
    }
    return null;
  };

  const visit = (node) => {
    // 1 · <Text>Silencio</Text> — el texto que se lee, sin intermediarios.
    if (ts.isJsxText(node) && isPhrase(node.text)) {
      report(node, 'texto JSX', node.text);
    }

    // 2 · <Stepper label="Giro de cabeza (AR-2)" /> — texto por prop.
    if (ts.isJsxAttribute(node) && ts.isIdentifier(node.name) && VISIBLE_PROPS.has(node.name.text)) {
      const value = literalOf(node.initializer);
      if (value && isPhrase(value)) report(node, `prop ${node.name.text}`, value);
    }

    // 3 · {cond && 'Cargando…'} y {`${n} de ${t}`} dentro del JSX. Un hijo que
    //     es expresión puede esconder tanto texto como uno literal.
    if (ts.isJsxExpression(node) && node.parent && ts.isJsxElement(node.parent)) {
      const value = literalOf(node);
      if (value && isPhrase(value)) report(node, 'expresión JSX', value);
    }

    // 4 · Alert.alert('Título', 'Cuerpo') — diálogo del sistema, se lee igual.
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)
        && node.expression.name.text === 'alert') {
      for (const arg of node.arguments) {
        const value = literalOf(arg);
        if (value && isPhrase(value)) report(arg, 'argumento de Alert', value);
      }
    }

    ts.forEachChild(node, visit);
  };
  visit(sf);
}

if (fail.length) {
  console.error(`✗ ${fail.length} cadena(s) de interfaz fuera del catálogo:\n`);
  for (const f of fail) console.error(`  ${f}`);
  console.error('\nLlévalas a src/i18n/strings.es.ts y strings.en.ts, o marca la línea');
  console.error('con «// i18n-exempt: motivo» si de verdad no se traduce.');
  process.exit(1);
}

console.log('✓ La interfaz se lee entera del catálogo: ningún texto literal en los .tsx.');

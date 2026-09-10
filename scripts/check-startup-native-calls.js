#!/usr/bin/env node
// ============================================================================
// Valeria+ · Gate: nada nativo se ejecuta mientras se evalúa el paquete de JS.
//
// POR QUÉ EXISTE (10/9/2026)
// `ValeriaHubV11Screen.tsx` abría con `const AR_ON = isArAvailable()`. Eso es
// una llamada de MÓDULO, no de componente: corre cuando Metro evalúa el
// fichero, y ese fichero entra en el arranque por App.tsx → AppNavigator →
// MainTabNavigator. Detrás estaba `ValeriaArModule.isSupported()`, un método
// `isBlockingSynchronousMethod`: en la arquitectura antigua su cuerpo Kotlin se
// ejecuta EN EL HILO DE JS. Consultaba el servicio de cámara —`cameraIdList` y
// un `getCameraCharacteristics` por id—, así que el primer frame de la app
// esperaba a que respondiera la cámara del aparato.
//
// El coste: Play rechazó la actualización el 9/9/2026 por «Funcionalidad
// defectuosa · la aplicación no se abre o no se carga» (build 692). En los
// teléfonos del equipo la cámara respondía y la app abría; eso es exactamente
// lo que hace peligroso un bloqueo así — no falla donde se prueba.
//
// QUÉ COMPRUEBA
// Recorre el grafo de imports RELATIVOS desde App.tsx (lo que se evalúa al
// arrancar) y falla si en el ÁMBITO DE MÓDULO —fuera de toda función, clase o
// componente— aparece una llamada de la lista de abajo. Dentro de una función
// no molesta: allí corre cuando alguien la llama, con la app ya dibujada.
//
// La lista es explícita a propósito: no hay forma de saber por análisis si una
// función cualquiera acaba en el puente. Sonda nativa nueva → se añade aquí.
// ============================================================================
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(ROOT, 'App.tsx');

// Llamadas que cruzan al lado nativo. El nombre es el del identificador tal y
// como se invoca en el fuente.
const NATIVE_CALLS = new Set([
  'isArAvailable',     // → ValeriaArModule.isSupported() (síncrono bloqueante)
  'requireNativeModule',
  'getEnforcing',      // TurboModuleRegistry.getEnforcing
]);

// Raíces desde las que se INVOCA al lado nativo. Se vigila la llamada, no la
// lectura: `NativeModules.ValeriaAr` a secas devuelve el proxy de JS que arma
// NativeModules.js con la config del puente —no cruza a Kotlin— y por eso el
// bridge de RA puede resolverlo al importar. Lo que cuesta es `…()`.
const NATIVE_ROOTS = new Set(['NativeModules', 'TurboModuleRegistry']);

const EXTS = ['.ts', '.tsx', '.js', '.jsx'];

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const ext of EXTS) {
    if (fs.existsSync(base + ext) && fs.statSync(base + ext).isFile()) return base + ext;
  }
  for (const ext of EXTS) {
    const idx = path.join(base, 'index' + ext);
    if (fs.existsSync(idx)) return idx;
  }
  return null;
}

function parse(file) {
  return ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') || file.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

// Todo lo que retrasa la ejecución a un momento posterior a la evaluación del
// módulo: cuerpos de función, métodos, clases y decoradores de propiedad.
const DEFERS_EXECUTION = new Set([
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.ArrowFunction,
  ts.SyntaxKind.MethodDeclaration,
  ts.SyntaxKind.GetAccessor,
  ts.SyntaxKind.SetAccessor,
  ts.SyntaxKind.Constructor,
  ts.SyntaxKind.ClassDeclaration,
  ts.SyntaxKind.ClassExpression,
]);

const graph = new Set();
const findings = [];

function calleeName(expr) {
  if (ts.isIdentifier(expr)) return expr.text;
  if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  return null;
}

// Identificador más a la izquierda de `a.b.c(...)` / `a?.b(...)`, para saber de
// dónde cuelga la llamada.
function rootIdentifier(expr) {
  let node = expr;
  for (;;) {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) { node = node.expression; continue; }
    if (ts.isNonNullExpression(node) || ts.isParenthesizedExpression(node)) { node = node.expression; continue; }
    return null;
  }
}

function scan(file) {
  if (graph.has(file)) return;
  graph.add(file);
  const sf = parse(file);
  const rel = path.relative(ROOT, file);

  const visit = (node, deferred) => {
    const nextDeferred = deferred || DEFERS_EXECUTION.has(node.kind);

    if (!nextDeferred) {
      if (ts.isCallExpression(node)) {
        const name = calleeName(node.expression);
        const root = rootIdentifier(node.expression);
        const offender = (name && NATIVE_CALLS.has(name)) ? `${name}()`
          : (root && NATIVE_ROOTS.has(root)) ? `${root}.…()`
            : null;
        if (offender) {
          const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
          findings.push(`${rel}:${line + 1}  ${offender} en ámbito de módulo`);
        }
      }
    }

    ts.forEachChild(node, (child) => visit(child, nextDeferred));
  };

  ts.forEachChild(sf, (node) => visit(node, false));

  // Solo se sigue lo que se evalúa al importar: import estático y re-export.
  ts.forEachChild(sf, (node) => {
    const spec = (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
      ? node.moduleSpecifier.text
      : null;
    if (!spec) return;
    const target = resolveImport(file, spec);
    if (target) scan(target);
  });
}

if (!fs.existsSync(ENTRY)) {
  console.error(`No existe ${path.relative(ROOT, ENTRY)}: el punto de entrada ha cambiado y este gate no mira nada.`);
  process.exit(1);
}
scan(ENTRY);

if (findings.length) {
  console.error('Llamadas nativas durante la evaluación del paquete de JS:\n');
  findings.forEach((f) => console.error(`  · ${f}`));
  console.error(
    '\nEsto corre ANTES del primer frame y, si la sonda es síncrona, bloquea el hilo\n'
    + 'de JS: la app se queda sin dibujar. Es el rechazo de Play del 9/9/2026.\n'
    + 'Muévelo dentro del componente o de la función que lo necesite.',
  );
  process.exit(1);
}

console.log(`OK · ${graph.size} módulos del arranque, ninguna llamada nativa en ámbito de módulo.`);

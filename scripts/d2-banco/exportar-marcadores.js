#!/usr/bin/env node
// Banco D2 (plan RA v3.0 §2.3, Fase 4a). Vuelca los marcadores que declaran
// los manifiestos S0–S6 a marcadores.json, que leen los scripts de Python.
// Con --check falla si el JSON del repositorio no coincide con los manifiestos.
//   node scripts/d2-banco/exportar-marcadores.js [--check]
const path = require('path');
const fs = require('fs');
const Module = require('module');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(__dirname, 'marcadores.json');

const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (parent?.filename?.endsWith('.ts') && request.startsWith('.') && !/\.(ts|js)$/.test(request)) {
    const base = path.resolve(path.dirname(parent.filename), request);
    if (fs.existsSync(`${base}.ts`)) return origResolve.call(this, `${request}.ts`, parent, isMain, options);
    if (fs.existsSync(path.join(base, 'index.ts'))) return origResolve.call(this, `${request}/index.ts`, parent, isMain, options);
  }
  return origResolve.call(this, request, parent, isMain, options);
};
Module._extensions['.ts'] = function (module, filename) {
  const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.React },
    fileName: filename,
  });
  module._compile(out.outputText, filename);
};

const { STEAM_WORLDS } = require(path.join(ROOT, 'src/steam/worlds/index.ts'));
const marcadores = [];
const soportes = {};
for (const w of [...STEAM_WORLDS].sort((x, y) => x.id.localeCompare(y.id))) {
  soportes[w.id] = { ...w.tabletStandSpec };
  for (const p of w.pieces) {
    p.instanceMarkerIds.forEach((id, i) => {
      marcadores.push({ mundo: w.id, pieza: p.code, instancia: i + 1, id, deteccion: p.detectionMethod, escala: p.scale });
    });
  }
}
marcadores.sort((a, b) => a.id - b.id);
// AprilTag 36h11 solo tiene 587 códigos: se le da a cada marcador un id compacto.
marcadores.forEach((m, i) => { m.idCompacto = i; });
const json = `${JSON.stringify({ fuente: 'src/steam/worlds (instanceMarkerIds)', soportes, marcadores }, null, 1)}\n`;

if (process.argv.includes('--check')) {
  const actual = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
  if (actual !== json) {
    console.error('✗ scripts/d2-banco/marcadores.json no coincide con los manifiestos. Corre: node scripts/d2-banco/exportar-marcadores.js');
    process.exit(1);
  }
  console.log(`✓ marcadores.json al día: ${marcadores.length} marcadores.`);
} else {
  fs.writeFileSync(OUT, json);
  console.log(`marcadores.json: ${marcadores.length} marcadores, id máximo ${marcadores[marcadores.length - 1].id}.`);
}

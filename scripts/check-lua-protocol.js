// ============================================================================
// Gate · La tabla de opcodes de Lúa es la misma en el firmware y en la app
//
// Regenera desde firmware/lua/protocol.json y compara con lo versionado. Falla
// si alguien tocó una tabla y no la otra.
//
// Es el gate que evita el bug caro de un periférico: firmware y app
// entendiendo el mismo byte de forma distinta. No se manifiesta como error de
// compilación ni como test rojo — se manifiesta como una mascota que hace
// cosas raras en casa de una familia, y depurarlo exige tener el aparato
// delante.
// ============================================================================
const { execFileSync } = require('child_process');
const path = require('path');

try {
  const out = execFileSync(
    process.execPath,
    [path.join(__dirname, 'build-lua-protocol.js'), '--check'],
    { encoding: 'utf8' },
  );
  process.stdout.write(out);
} catch (e) {
  process.stdout.write(e.stdout || '');
  process.stderr.write(e.stderr || '');
  process.exit(1);
}

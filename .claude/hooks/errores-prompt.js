#!/usr/bin/env node
// UserPromptSubmit — mejora recursiva (Frank, 8/11/2026):
//  · inyecta el registro de errores ya señalados en cada mensaje;
//  · si el mensaje señala un error, deja una marca para que guard-stop exija
//    registrarlo en .claude/errores-frank.md en este mismo turno.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const ledger = path.join(root, '.claude/errores-frank.md');
const mark = path.join(root, '.claude/.turno-error.json');
let input = '';
process.stdin.on('data', (d) => (input += d)).on('end', () => {
  let prompt = '';
  try { prompt = JSON.parse(input).prompt || ''; } catch { /* sin prompt */ }
  const complaint = /\b(error|errores|fallo|falla|bug|roto|rota|mal|otra vez|de nuevo|no funciona|no sale|no se ve|basura|mierda|estafa|engañ|incomplet|falta|no hay|no está|donde está|dónde está)\b/i.test(prompt);
  try {
    if (complaint) fs.writeFileSync(mark, JSON.stringify({ at: Date.now(), mtime: fs.statSync(ledger).mtimeMs }));
    else if (fs.existsSync(mark)) fs.unlinkSync(mark);
  } catch { /* noop */ }
  let rows = '';
  try { rows = fs.readFileSync(ledger, 'utf8').split('\n').filter((l) => /^\| R\d+/.test(l)).join('\n'); } catch { /* noop */ }
  console.log(`ERRORES YA SEÑALADOS POR FRANK (no se repite ninguno):\n${rows}`);
  if (complaint) {
    console.log('\nESTE MENSAJE SEÑALA UN ERROR. Obligatorio en ESTE turno, antes de cerrar: añadir una fila nueva a .claude/errores-frank.md (error, regla que lo impide y, si se puede, comprobación en scripts/check-frank-errors.js). Si ya está registrado, actualiza su fila. guard-stop bloqueará el cierre si no lo haces.');
  }
});

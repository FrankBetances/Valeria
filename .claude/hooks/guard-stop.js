#!/usr/bin/env node
// Stop — BLOQUEA el final del turno (regla F11, Frank 8/11/2026) si:
//  · quedan cambios sin commit en src/ (trabajo a medias);
//  · la respuesta dice «hecho/listo/terminado/arreglado/entregado» sin decir
//    «no visto en Android» (F3).
const { execSync } = require('child_process');
const fs = require('fs');
let input = '';
process.stdin.on('data', (d) => (input += d)).on('end', () => {
  let j = {};
  try { j = JSON.parse(input); } catch { process.exit(0); }
  if (j.stop_hook_active) process.exit(0);
  const block = (reason) => { process.stdout.write(JSON.stringify({ decision: 'block', reason })); process.exit(0); };
  try {
    const dirty = execSync('git status --porcelain -- src', { cwd: j.cwd || process.cwd() }).toString().trim();
    if (dirty) block(`F11: hay cambios sin commit en src/ (trabajo a medias):\n${dirty}\nTermina, verifica y haz commit antes de acabar.`);
  } catch { /* fuera de git */ }
  // Mejora recursiva: si Frank señaló un error en este turno, el registro tiene que haber cambiado.
  try {
    const path = require('path');
    const root = path.resolve(__dirname, '../..');
    const mark = path.join(root, '.claude/.turno-error.json');
    if (fs.existsSync(mark)) {
      const m = JSON.parse(fs.readFileSync(mark, 'utf8'));
      const now = fs.statSync(path.join(root, '.claude/errores-frank.md')).mtimeMs;
      if (now <= m.mtime) block('Mejora recursiva: Frank ha señalado un error en este mensaje y no está registrado. Añade su fila a .claude/errores-frank.md (error, regla, comprobación) antes de cerrar.');
      fs.unlinkSync(mark);
    }
  } catch { /* noop */ }
  let last = '';
  try {
    const lines = fs.readFileSync(j.transcript_path, 'utf8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const e = JSON.parse(lines[i]);
      if (e.type === 'user' && !(e.message && Array.isArray(e.message.content) && e.message.content.some((c) => c.type === 'tool_result'))) break;
      if (e.type === 'assistant' && e.message && Array.isArray(e.message.content)) {
        last = e.message.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n') + '\n' + last;
      }
    }
  } catch { process.exit(0); }
  // «no está (todo) hecho» es lo contrario de afirmar y no cuenta (R15, autorizado por Frank 8/11/2026).
  const affirms = last.split(/[.\n!?;:]/).some((frase) =>
    /\b(hecho|listo|terminad[oa]s?|arreglad[oa]s?|entregad[oa]s?)\b/i.test(frase)
    && !/\bno\b(\s+\S+){0,4}\s+(hecho|listo|terminad|arreglad|entregad)/i.test(frase));
  if (affirms
      && !/no (lo |la |los |las )?(he )?(visto|comprobado|probado) en (Android|un aparato)|no visto en (Android|un aparato)|no est[aá] visto en (Android|un aparato)/i.test(last)) {
    block('F3/F11: dices «hecho/listo/arreglado» sin decir «no visto en Android». Corrige la respuesta: di qué se ha comprobado y con qué, y que no está visto en Android.');
  }
  process.exit(0);
});

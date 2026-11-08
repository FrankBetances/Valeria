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
  if (/\b(hecho|listo|terminad[oa]s?|arreglad[oa]s?|entregad[oa]s?)\b/i.test(last)
      && !/no (lo |la |los |las )?(he )?(visto|comprobado|probado) en (Android|un aparato)/i.test(last)) {
    block('F3/F11: dices «hecho/listo/arreglado» sin decir «no visto en Android». Corrige la respuesta: di qué se ha comprobado y con qué, y que no está visto en Android.');
  }
  process.exit(0);
});

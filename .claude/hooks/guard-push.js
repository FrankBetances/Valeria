#!/usr/bin/env node
// PreToolUse(Bash) — BLOQUEA (exit 2) en vez de recordar (regla F11, Frank 8/11/2026):
//  · push forzado a main;
//  · cualquier git push sin typecheck y gates de android.yml en verde.
const { execSync } = require('child_process');
let input = '';
process.stdin.on('data', (d) => (input += d)).on('end', () => {
  let cmd = '';
  try { cmd = JSON.parse(input).tool_input.command || ''; } catch { process.exit(0); }
  // Solo la orden de push, no el resto: un mensaje de commit puede decir «main».
  const m0 = cmd.match(/\bgit\s+push\b[^;&|\n"']*/);
  if (!m0) process.exit(0);
  const push = m0[0];
  if (/\bmain\b/.test(push) && /(--force\b|\s-f\b|--force-with-lease|\s\+\S*main)/.test(push)) {
    console.error('BLOQUEADO (F11): push forzado a main prohibido.'); process.exit(2);
  }
  const root = execSync('git rev-parse --show-toplevel').toString().trim();
  const fails = [];
  try { execSync('npm run -s typecheck', { cwd: root, stdio: 'pipe' }); } catch { fails.push('npm run typecheck'); }
  const wf = require('fs').readFileSync(`${root}/.github/workflows/android.yml`, 'utf8');
  for (const m of wf.matchAll(/run: (node scripts\/\S+(?: --\S+)?)/g)) {
    try { execSync(m[1], { cwd: root, stdio: 'pipe' }); } catch { fails.push(m[1]); }
  }
  if (fails.length) {
    console.error(`BLOQUEADO (F11): no se empuja con gates en rojo:\n- ${fails.join('\n- ')}`); process.exit(2);
  }
  process.exit(0);
});

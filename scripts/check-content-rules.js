#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Reglas de contenido de Expansión Semántica (X-05 del plan ACOPROS)
 *   node scripts/check-content-rules.js
 *
 * Comprueba sobre los TRES bancos (es, es-DO, eu) las reglas que ACOPROS fijó
 * al resolver DC-1, DC-2 y DC-3, y que hasta ahora solo vivían en la cabeza de
 * quien escribía el contenido:
 *
 *   R1 · ES-06 — el tts_string dice el objetivo UNA sola vez antes de pedirlo.
 *        («Esto es la cama. Por la mañana saltamos de la cama. Di: cama.» era
 *         el patrón que las logopedas señalaron como redundante.)
 *   R2 · ES-10 — ninguna fase de Progresión pide una onomatopeya: el criterio
 *        declarado es el campo semántico (concepto → parte → acción → cualidad).
 *   R3 · ES-13 — congruencia de cápsula: el objeto que nombra el audio aparece
 *        también en el setup físico que se pide al adulto.
 *
 * Se ejecuta sobre el TypeScript compilado en memoria, igual que la tubería de
 * voz, para leer los bancos reales y no una copia.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-content-rules-'));

// Normaliza para comparar: minúsculas, sin tildes y sin puntuación.
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zñ0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

let fallos = 0;
const fallo = (msg) => { fallos += 1; console.error('  ✖ ' + msg); };

try {
  const entradas = [
    path.join(ROOT, 'src', 'valeriaSemanticExpansion.ts'),
    path.join(ROOT, 'src', 'valeriaSemanticExpansionEsDO.ts'),
    path.join(ROOT, 'src', 'valeriaSemanticExpansionEu.ts'),
  ];
  execSync(
    ['npx tsc', ...entradas.map((e) => JSON.stringify(e)),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );

  const base = require(path.join(tmp, 'valeriaSemanticExpansion.js'));
  const esdo = require(path.join(tmp, 'valeriaSemanticExpansionEsDO.js'));
  const eu = require(path.join(tmp, 'valeriaSemanticExpansionEu.js'));

  const BANCOS = [
    { lang: 'es', scenarios: base.DAILY_SCENARIOS, sequences: base.PROGRESSION_SEQUENCES, capsules: base.CONTRAST_CAPSULES, pedir: /\bdi:\s*/i },
    { lang: 'es-DO', scenarios: esdo.DAILY_SCENARIOS_ESDO, sequences: esdo.PROGRESSION_SEQUENCES_ESDO, capsules: esdo.CONTRAST_CAPSULES_ESDO, pedir: /\bdi:\s*/i },
    { lang: 'eu', scenarios: eu.DAILY_SCENARIOS_EU, sequences: eu.PROGRESSION_SEQUENCES_EU, capsules: eu.CONTRAST_CAPSULES_EU, pedir: /\besan:\s*/i },
  ];

  for (const b of BANCOS) {
    console.log(`\n── ${b.lang} ──`);

    // ---- R1: el objetivo se dice una sola vez antes de la petición --------
    // El objetivo se cuenta ENTERO (no por raíz): una onomatopeya reduplicada
    // como «rin, rin» es UNA aparición del objetivo, no dos.
    const items = [
      ...(b.scenarios ?? []).flatMap((s) => s.items.map((it) => ({ ctx: s.id, label: it.label, tts: it.tts_string }))),
      ...(b.sequences ?? []).flatMap((s) => s.phases.map((p) => ({ ctx: s.id, label: p.label, tts: p.tts_string }))),
    ];
    let r1 = 0;
    for (const it of items) {
      const corte = it.tts.search(b.pedir);
      if (corte < 0) { fallo(`R1 ${b.lang}/${it.ctx}: el tts_string no contiene la petición → «${it.tts}»`); continue; }
      const previo = norm(it.tts.slice(0, corte));
      const obj = norm(it.label);
      if (!obj) continue;
      let veces = 0;
      let i = previo.indexOf(obj);
      while (i !== -1) { veces += 1; i = previo.indexOf(obj, i + obj.length); }
      if (veces > 1) { fallo(`R1 ${b.lang}/${it.ctx}: «${it.label}» aparece ${veces} veces antes de pedirlo → «${it.tts}»`); r1 += 1; }
    }
    console.log(`  R1 · estilo del tts_string: ${items.length} enunciados, ${r1} incumplimientos`);

    // ---- R2: ninguna fase de Progresión es una onomatopeya ---------------
    const VALIDAS = new Set(['concepto', 'parte', 'accion', 'cualidad']);
    let r2 = 0;
    for (const s of b.sequences ?? []) {
      for (const p of s.phases) {
        if (!VALIDAS.has(p.kind)) { fallo(`R2 ${b.lang}/${s.id}: fase con criterio ajeno al campo semántico → kind="${p.kind}"`); r2 += 1; }
      }
    }
    console.log(`  R2 · fases por campo semántico: ${(b.sequences ?? []).length} secuencias, ${r2} incumplimientos`);

    // ---- R3: congruencia de cápsula (audio ↔ setup físico) ---------------
    // El objeto que nombra el audio de una vuelta debe aparecer en el setup
    // que se pide preparar al adulto. Si el audio habla de un osito y el setup
    // pide dos peluches de elefante, el niño ve tres referentes distintos.
    // Se compara por RAÍZ (primeros 4 caracteres), no por palabra completa:
    // «carro»/«carrito» y, sobre todo, el euskera aglutinante («kotxea» /
    // «kotxe», «argia» / «argiarekin») nunca coincidirían de otro modo.
    const raices = (txt) => new Set(
      norm(txt).split(' ').filter((w) => w.length >= 3).map((w) => w.slice(0, 4)),
    );
    let r3 = 0;
    for (const c of b.capsules ?? []) {
      const setup = raices(c.physical_setup ?? '');
      for (const r of c.rounds ?? []) {
        // El objetivo contrastado (grande/pequeño) se excluye a propósito: la
        // congruencia se exige sobre el OBJETO, no sobre el atributo, que es
        // justo lo único que debe variar entre las dos vueltas.
        const objetivo = new Set([...raices(r.label)]);
        const delAudio = [...raices(r.tts_trigger)].filter((w) => !objetivo.has(w));
        // Basta con que UNA raíz del audio aparezca en el setup: es un detector
        // de "tres referentes distintos", no un analizador sintáctico.
        const compartida = delAudio.some((w) => setup.has(w));
        if (delAudio.length && !compartida) {
          fallo(`R3 ${b.lang}/${c.id} (${r.label}): el audio «${r.tts_trigger}» no comparte ningún objeto con el setup «${c.physical_setup}»`);
          r3 += 1;
        }
      }
    }
    console.log(`  R3 · congruencia de cápsulas: ${(b.capsules ?? []).length} cápsulas, ${r3} incumplimientos`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (fallos) {
  console.error(`\n✖ ${fallos} incumplimientos de las reglas de contenido acordadas con ACOPROS.`);
  console.error('  Ver docs/plan-mejoras-acopros-logopedas.json → ES-06, ES-10, ES-13.');
  process.exit(1);
}
console.log('\n✓ Los tres bancos cumplen las reglas de contenido (ES-06, ES-10, ES-13).');

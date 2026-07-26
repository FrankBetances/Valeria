#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Inventario de claves visuales (DC-4 · ES-09 del plan ACOPROS)
 *   node scripts/audit-pictograms.js            → informe por consola
 *   node scripts/audit-pictograms.js --markdown → docs/auditoria-pictogramas.md
 *
 * ACOPROS pidió «auditar y corregir los emoji ambiguos ahora». Esta es la
 * entrada de esa auditoría: recorre los tres bancos de Expansión Semántica y
 * los cuatro de Pares Mínimos, extrae TODA la carga visual en uso y la
 * clasifica por el motivo que la hace sospechosa:
 *
 *   · TOFU     — emoji de Unicode 12 o posterior. En muchos Android se pinta
 *                como un cuadro vacío. Es un fallo de renderizado, no de
 *                criterio: no hay nada que discutir con las logopedas.
 *   · ATRIBUTO — la imagen ilustra el ATRIBUTO y no el objeto que nombra el
 *                audio. Es el patrón que produjo el hallazgo de ES-12: dentro
 *                de una cápsula las dos vueltas comparten emoji, así que la
 *                vuelta de comprensión muestra dos tarjetas idénticas.
 *   · REVISAR  — verbos y acciones, donde la ambigüedad es de interpretación.
 *                Son las que ACOPROS debe mirar («la imagen de comer»).
 *   · OK       — objeto concreto, emoji antiguo y bien soportado.
 *
 * La columna de veredicto se deja vacía a propósito: la rellenan las logopedas.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-pictogramas-'));
const escribirMd = process.argv.includes('--markdown');

// Rangos de emoji introducidos en Unicode 12+. Son los que se pintan como tofu
// en los Android que todavía usan las familias del piloto. Coincide con el
// criterio que hizo nacer este módulo (🪚 🪣 🪥 🛝 eran justo de aquí).
const esTofu = (e) => {
  const c = e.codePointAt(0);
  return (c >= 0x1FA70 && c <= 0x1FAFF)
    || (c >= 0x1F90C && c <= 0x1F978)
    || (c >= 0x1F9CB && c <= 0x1F9FF)
    || (c >= 0x1F6D5 && c <= 0x1F6DF);
};

try {
  const entradas = [
    'valeriaSemanticExpansion', 'valeriaSemanticExpansionEsDO', 'valeriaSemanticExpansionEu',
    'valeriaMinimalPairs', 'valeriaMinimalPairsEsDO', 'valeriaMinimalPairsGl', 'valeriaMinimalPairsEu',
  ];
  execSync(
    ['npx tsc', ...entradas.map((e) => JSON.stringify(path.join(ROOT, 'src', `${e}.ts`))),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );
  const mod = (n) => require(path.join(tmp, `${n}.js`));

  const base = mod('valeriaSemanticExpansion');
  const esdo = mod('valeriaSemanticExpansionEsDO');
  const eu = mod('valeriaSemanticExpansionEu');
  const pares = [
    ['es', mod('valeriaMinimalPairs').MINIMAL_PAIRS],
    ['es-DO', mod('valeriaMinimalPairsEsDO').MINIMAL_PAIRS_ESDO],
    ['gl', mod('valeriaMinimalPairsGl').MINIMAL_PAIRS_GL],
    ['eu', mod('valeriaMinimalPairsEu').MINIMAL_PAIRS_EU],
  ];

  // Cada uso: dónde aparece, con qué palabra, qué emoji y si ya tiene clave.
  const usos = [];
  const anota = (u) => usos.push(u);

  const bancosSem = [
    ['es', base.DAILY_SCENARIOS, base.PROGRESSION_SEQUENCES, base.CONTRAST_CAPSULES],
    ['es-DO', esdo.DAILY_SCENARIOS_ESDO, esdo.PROGRESSION_SEQUENCES_ESDO, esdo.CONTRAST_CAPSULES_ESDO],
    ['eu', eu.DAILY_SCENARIOS_EU, eu.PROGRESSION_SEQUENCES_EU, eu.CONTRAST_CAPSULES_EU],
  ];

  for (const [lang, escenarios, secuencias, capsulas] of bancosSem) {
    for (const s of escenarios ?? []) {
      for (const it of s.items) {
        anota({ lang, bloque: 'Escenario', ctx: s.id, palabra: it.label, tipo: it.type, emoji: it.emoji, clave: it.pictogram });
      }
    }
    for (const q of secuencias ?? []) {
      for (const p of q.phases) {
        anota({ lang, bloque: 'Progresión', ctx: q.id, palabra: p.label, tipo: p.kind, emoji: p.emoji, clave: p.pictogram });
      }
    }
    for (const c of capsulas ?? []) {
      for (const r of c.rounds) {
        anota({ lang, bloque: 'Contraste', ctx: c.id, palabra: r.label, tipo: c.kind, emoji: r.emoji, clave: r.pictogram, contraste: true });
      }
    }
  }
  for (const [lang, banco] of pares) {
    for (const p of banco ?? []) {
      anota({ lang, bloque: 'Pares', ctx: p.id, palabra: p.target, tipo: 'objetivo', emoji: p.targetEmoji, clave: p.targetPictogram });
      anota({ lang, bloque: 'Pares', ctx: p.id, palabra: p.foil, tipo: 'distractor', emoji: p.foilEmoji, clave: p.foilPictogram });
    }
  }

  // ---- Agrupación por clave visual (emoji + palabra) ---------------------
  // Dentro de una cápsula, dos vueltas con el MISMO emoji son el patrón de
  // ES-12: hay que mirar la cápsula, no el emoji suelto.
  const capsulasConEmojiRepetido = new Set();
  for (const [lang, , , capsulas] of bancosSem) {
    for (const c of capsulas ?? []) {
      const e = c.rounds.map((r) => r.emoji);
      if (e[0] === e[1]) capsulasConEmojiRepetido.add(`${lang}/${c.id}`);
    }
  }

  const porEmoji = new Map();
  for (const u of usos) {
    if (!porEmoji.has(u.emoji)) porEmoji.set(u.emoji, []);
    porEmoji.get(u.emoji).push(u);
  }

  const VERBOS = new Set(['verbo', 'verbos', 'accion']);
  const filas = [];
  for (const [emoji, lista] of porEmoji) {
    const enContraste = lista.some((u) => u.contraste);
    const esVerbo = lista.some((u) => VERBOS.has(u.tipo));
    const motivo = esTofu(emoji) ? 'TOFU'
      : enContraste ? 'ATRIBUTO'
        : esVerbo ? 'REVISAR'
          : 'OK';
    filas.push({
      emoji,
      motivo,
      usos: lista.length,
      palabras: [...new Set(lista.map((u) => u.palabra))],
      bloques: [...new Set(lista.map((u) => u.bloque))],
      lenguas: [...new Set(lista.map((u) => u.lang))],
      conClave: lista.filter((u) => u.clave).length,
    });
  }
  const orden = { TOFU: 0, ATRIBUTO: 1, REVISAR: 2, OK: 3 };
  filas.sort((a, b) => orden[a.motivo] - orden[b.motivo] || b.usos - a.usos);

  const cuenta = (m) => filas.filter((f) => f.motivo === m).length;
  const resumen = {
    clavesVisuales: filas.length,
    usosTotales: usos.length,
    tofu: cuenta('TOFU'),
    atributo: cuenta('ATRIBUTO'),
    revisar: cuenta('REVISAR'),
    ok: cuenta('OK'),
    capsulasConEmojiRepetido: capsulasConEmojiRepetido.size,
  };

  console.log('\n── Inventario visual ──');
  console.log(`  ${resumen.clavesVisuales} claves visuales distintas en ${resumen.usosTotales} usos`);
  console.log(`  TOFU ${resumen.tofu} · ATRIBUTO ${resumen.atributo} · REVISAR ${resumen.revisar} · OK ${resumen.ok}`);
  console.log(`  Cápsulas de contraste con el MISMO emoji en las dos vueltas: ${resumen.capsulasConEmojiRepetido}`);

  if (escribirMd) {
    const L = [];
    L.push('# Auditoría de carga visual · pictogramas (DC-4 · ES-09)');
    L.push('');
    L.push('> Generado por `node scripts/audit-pictograms.js --markdown`. **No editar a mano**:');
    L.push('> se regenera. La columna *Veredicto ACOPROS* es la excepción — se rellena a mano');
    L.push('> y se conserva copiándola al regenerar.');
    L.push('');
    L.push('## Por qué existe este documento');
    L.push('');
    L.push('Las logopedas de ACOPROS señalaron que «algunas imágenes resultan ambiguas (por ejemplo,');
    L.push('la de comer)» y propusieron pictogramas. Al resolver DC-4 se acordó auditar y corregir los');
    L.push('emoji ambiguos de inmediato, dejando la adopción de un banco externo pendiente de licencia.');
    L.push('');
    L.push('La licencia se resolvió descartando los bancos externos: ARASAAC es CC BY-NC-SA (la cláusula');
    L.push('NC bloquea el uso comercial), Mulberry es CC BY-SA (el *share-alike* se contagiaría al diseño');
    L.push('de la app) y Sclera añade ND. Pero el argumento que decide no es la licencia: **ningún banco,');
    L.push('ni de pago, trae «cuchara sucia» y «cuchara limpia» como par sobre el mismo objeto**, que es');
    L.push('justo lo que ES-12 necesita. Se dibuja en casa, con clave propia en el dato.');
    L.push('');
    L.push('## Resumen');
    L.push('');
    L.push(`- **${resumen.clavesVisuales}** claves visuales distintas, en **${resumen.usosTotales}** usos sobre los tres bancos de Expansión Semántica y los cuatro de Pares Mínimos.`);
    L.push(`- **${resumen.tofu}** con riesgo de *tofu* · **${resumen.atributo}** que ilustran un atributo · **${resumen.revisar}** a revisar con ACOPROS · **${resumen.ok}** sin sospecha.`);
    L.push(`- **${resumen.capsulasConEmojiRepetido}** cápsulas de contraste muestran el MISMO emoji en sus dos vueltas. Son las que dejan la vuelta de comprensión de ES-12 irresoluble.`);
    L.push('');
    L.push('## Cómo leer el motivo');
    L.push('');
    L.push('| Motivo | Qué significa | Quién lo decide |');
    L.push('| --- | --- | --- |');
    L.push('| `TOFU` | Emoji de Unicode 12 o posterior: en muchos Android se pinta como cuadro vacío. | Nadie: es un fallo de renderizado, se dibuja y ya. |');
    L.push('| `ATRIBUTO` | La imagen ilustra el atributo contrastado, no el objeto que nombra el audio. | Nadie: lo exige ES-12. |');
    L.push('| `REVISAR` | Verbo o acción, donde la ambigüedad es de interpretación. | **ACOPROS.** |');
    L.push('| `OK` | Objeto concreto con emoji antiguo y bien soportado. | Nadie, salvo que ACOPROS discrepe. |');
    L.push('');
    L.push('## Inventario');
    L.push('');
    L.push('| Emoji | Motivo | Usos | Palabras | Bloques | Lenguas | Con clave | Veredicto ACOPROS |');
    L.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
    for (const f of filas) {
      const palabras = f.palabras.slice(0, 6).join(', ') + (f.palabras.length > 6 ? `, +${f.palabras.length - 6}` : '');
      L.push(`| ${f.emoji} | \`${f.motivo}\` | ${f.usos} | ${palabras} | ${f.bloques.join(', ')} | ${f.lenguas.join(', ')} | ${f.conClave}/${f.usos} | |`);
    }
    L.push('');
    L.push('## Cápsulas de contraste con emoji repetido');
    L.push('');
    L.push('Estas son las que bloquean ES-12: con la regla de congruencia de ES-13 ambas vueltas muestran');
    L.push('el mismo objeto, así que con emoji la vuelta de comprensión enseña dos tarjetas idénticas.');
    L.push('');
    for (const c of [...capsulasConEmojiRepetido].sort()) L.push(`- \`${c}\``);
    L.push('');
    const destino = path.join(ROOT, 'docs', 'auditoria-pictogramas.md');
    fs.writeFileSync(destino, L.join('\n') + '\n', 'utf8');
    console.log(`\n✓ Escrito ${path.relative(ROOT, destino)}`);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Balance fonémico de los seis bancos de pares mínimos
 *   node scripts/audit-pair-balance.js             → informe por consola
 *   node scripts/audit-pair-balance.js --markdown  → docs/auditoria-balance-fonemico.md
 *   node scripts/audit-pair-balance.js --selftest  → comprueba el motor de distancia
 *
 * La pregunta clínica que contesta: ¿los pares de cada banco están repartidos
 * por dificultad, o el banco entero pide lo mismo? Un par cuyo contraste difiere
 * en UN rasgo (D=1) exige discriminación auditiva fina; uno que difiere en TRES
 * (D=3) lo distingue casi cualquier niño. Un banco sin D=1 no mide precisión
 * articulatoria; un banco solo de D=1 frustra desde el primer ensayo.
 *
 * El número sale del campo `phoneme` que cada par ya declara ('r̄ → l'), no de
 * comparar las letras de las dos palabras. Ver la cabecera de phoneme-distance.js
 * para qué queda FUERA de la medida (vocales en su propia escala, procesos
 * fonológicos sin distancia) y por qué eso se dice en vez de rellenarse.
 *
 * Esto NO es un gate y no está en android.yml: es una herramienta de lectura
 * clínica, como audit-pictograms.js. El `--selftest` comprueba el motor, no los
 * bancos: un banco desequilibrado es una decisión de las logopedas, no un fallo
 * de build.
 * ========================================================================== */
const { execSync } = require('child_process');
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { distancia, partirContraste } = require('./phoneme-distance');

const ROOT = path.join(__dirname, '..');
const DESTINO = path.join('docs', 'auditoria-balance-fonemico.md');

// --- --selftest · el motor de distancia, con anclas conocidas --------------
// Son las tres que cualquiera reconoce de memoria, y la cuarta es la que este
// módulo existe para no volver a equivocar: /r̄/ y /ɾ/ (perro/pero) difieren
// SOLO en el modo, no en el punto.
if (process.argv.includes('--selftest')) {
  const d = (a, b) => distancia(a, b);
  assert.strictEqual(d('p', 'b').d, 1, '/p/–/b/ difiere solo en sonoridad');
  assert.strictEqual(d('s', 'θ').d, 1, '/s/–/θ/ difiere solo en punto');
  assert.strictEqual(d('r̄', 'ɾ').d, 1, '/r̄/–/ɾ/ difiere solo en modo');
  assert.strictEqual(d('m', 'k').d, 3, '/m/–/k/ difiere en los tres rasgos');
  assert.strictEqual(d('s', 's').d, 0, 'un fonema consigo mismo mide 0');
  assert.strictEqual(d('s̺', 's̻').d, 1, '/s̺/–/s̻/ del euskara difiere en punto');
  assert.strictEqual(d('ɔ', 'o').d, 1, '/ɔ/–/o/ difiere solo en altura');
  assert.strictEqual(d('ɔ', 'o').tipo, 'vocal', 'un contraste vocálico se mide en su escala');
  assert.strictEqual(d('-t', '∅').tipo, 'proceso', 'una omisión no tiene distancia de rasgos');
  assert.strictEqual(d('i', 'k').tipo, 'mixto', 'vocal contra consonante no es comparable');
  assert.strictEqual(d('ʘ', 'p').tipo, 'desconocido', 'un símbolo fuera de tabla no inventa número');
  assert.deepStrictEqual(partirContraste('/θ/ → /f/'), ['/θ/', '/f/']);
  assert.deepStrictEqual(partirContraste('tʃ ↔ s'), ['tʃ', 's']);
  console.log('✓ Motor de distancia fonémica: 13 comprobaciones en verde.');
  process.exit(0);
}

const escribirMd = process.argv.includes('--markdown');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-balance-fonemico-'));

try {
  const entradas = [
    'valeriaMinimalPairs', 'valeriaMinimalPairsEsDO', 'valeriaMinimalPairsGl',
    'valeriaMinimalPairsEu', 'valeriaMinimalPairsEn', 'valeriaMinimalPairsCa',
  ];
  execSync(
    ['npx tsc', ...entradas.map((e) => JSON.stringify(path.join(ROOT, 'src', `${e}.ts`))),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );
  const mod = (n) => require(path.join(tmp, `${n}.js`));

  const bancos = [
    ['es',    'Castellano', mod('valeriaMinimalPairs').MINIMAL_PAIRS],
    ['es-DO', 'Dominicano', mod('valeriaMinimalPairsEsDO').MINIMAL_PAIRS_ESDO],
    ['gl',    'Galego',     mod('valeriaMinimalPairsGl').MINIMAL_PAIRS_GL],
    ['eu',    'Euskara',    mod('valeriaMinimalPairsEu').MINIMAL_PAIRS_EU],
    ['ca',    'Català',     mod('valeriaMinimalPairsCa').MINIMAL_PAIRS_CA],
    ['en-US', 'English',    mod('valeriaMinimalPairsEn').MINIMAL_PAIRS_EN],
  ];

  const filas = [];
  let sinClasificar = 0;

  for (const [locale, etiqueta, banco] of bancos) {
    for (const par of banco) {
      const partes = partirContraste(par.phoneme);
      if (!partes) {
        sinClasificar += 1;
        filas.push({ locale, etiqueta, par, a: '—', b: '—', r: { tipo: 'ilegible', d: null, detalle: par.phoneme } });
        continue;
      }
      const [a, b] = partes;
      const r = distancia(a, b);
      if (r.tipo === 'desconocido' || r.tipo === 'ilegible') sinClasificar += 1;
      filas.push({ locale, etiqueta, par, a, b, r });
    }
  }

  // --- Recuento por banco --------------------------------------------------
  const cubo = (fs_) => {
    const c = { d1: 0, d2: 0, d3: 0, d0: 0, vocal: 0, proceso: 0, fuera: 0 };
    for (const f of fs_) {
      if (f.r.tipo === 'vocal') { c.vocal += 1; continue; }
      if (f.r.tipo === 'proceso') { c.proceso += 1; continue; }
      if (f.r.tipo !== 'consonante') { c.fuera += 1; continue; }
      c[`d${f.r.d}`] += 1;
    }
    return c;
  };

  const lineas = [];
  const say = (s = '') => { lineas.push(s); console.log(s); };

  say('Balance fonémico de los bancos de pares mínimos · Valeria+');
  say('');
  say('D = cuántos rasgos difieren entre los dos fonemas del contraste.');
  say('D=1 oposición mínima (la más exigente) · D=3 oposición máxima (la más fácil).');
  say('');

  for (const [locale, etiqueta] of bancos.map((b) => [b[0], b[1]])) {
    const delBanco = filas.filter((f) => f.locale === locale);
    const c = cubo(delBanco);
    say(`── ${etiqueta} (${locale}) · ${delBanco.length} pares`);
    for (const f of delBanco) {
      const medida = f.r.tipo === 'consonante' ? `D=${f.r.d}`
        : f.r.tipo === 'vocal' ? `D=${f.r.d} (vocálico)`
          : f.r.tipo === 'proceso' ? 'proceso'
            : `SIN CLASIFICAR (${f.r.detalle})`;
      const palabras = `${f.par.target}/${f.par.foil}`;
      say(`   ${String(f.par.code).padEnd(9)} ${palabras.padEnd(22)} ${String(f.par.phoneme).padEnd(14)} ${medida.padEnd(22)} ${f.r.detalle}`);
    }
    say(`   → D=1: ${c.d1} · D=2: ${c.d2} · D=3: ${c.d3}`
      + `${c.d0 ? ` · D=0: ${c.d0}` : ''}`
      + `${c.vocal ? ` · vocálicos: ${c.vocal}` : ''}`
      + `${c.proceso ? ` · procesos: ${c.proceso}` : ''}`
      + `${c.fuera ? ` · sin clasificar: ${c.fuera}` : ''}`);
    say('');
  }

  const total = cubo(filas);
  say(`── Total · ${filas.length} pares en los seis bancos`);
  say(`   D=1 (oposición mínima): ${total.d1}`);
  say(`   D=2 (oposición media):  ${total.d2}`);
  say(`   D=3 (oposición máxima): ${total.d3}`);
  if (total.d0) say(`   D=0 (¡idénticos!):      ${total.d0}`);
  say(`   contrastes vocálicos:   ${total.vocal}`);
  say(`   procesos fonológicos:   ${total.proceso}`);
  say(`   sin clasificar:         ${total.fuera}`);

  if (total.d0) {
    say('');
    say('⚠ Hay contrastes con D=0: los dos fonemas del par son el mismo. Un par así');
    say('  no mide nada. Revisar el campo `phoneme` de esos pares.');
  }

  // --- --markdown ----------------------------------------------------------
  if (escribirMd) {
    const md = [];
    md.push('# Balance fonémico de los pares mínimos · Valeria+');
    md.push('');
    md.push('> Generado por `node scripts/audit-pair-balance.js --markdown`. No editar a mano:');
    md.push('> los números salen de los bancos compilados, y se regeneran al cambiarlos.');
    md.push('');
    md.push('## Cómo se mide');
    md.push('');
    md.push('**D** es el número de rasgos distintivos que separan los dos fonemas del');
    md.push('contraste que el propio par declara en su campo `phoneme`:');
    md.push('');
    md.push('- Consonantes: **punto**, **modo** y **sonoridad** → D ∈ 0..3.');
    md.push('- Vocales: **altura**, **anterioridad** y **redondeamiento** → D ∈ 0..3, en su');
    md.push('  propia escala. No se mezclan con las consonantes porque no comparten rasgos.');
    md.push('- Procesos fonológicos (omisión de final, reducción de grupo) no tienen');
    md.push('  distancia de rasgos y se cuentan aparte.');
    md.push('');
    md.push('D=1 es la oposición **más exigente** para el niño (un solo rasgo que oír);');
    md.push('D=3 la más fácil. No se usa Levenshtein: mide parecido tipográfico, no acústico.');
    md.push('');
    md.push('## Reparto por banco');
    md.push('');
    md.push('| Banco | Pares | D=1 | D=2 | D=3 | Vocálicos | Procesos | Sin clasificar |');
    md.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
    for (const [locale, etiqueta] of bancos.map((b) => [b[0], b[1]])) {
      const delBanco = filas.filter((f) => f.locale === locale);
      const c = cubo(delBanco);
      md.push(`| ${etiqueta} (\`${locale}\`) | ${delBanco.length} | ${c.d1} | ${c.d2} | ${c.d3} | ${c.vocal} | ${c.proceso} | ${c.fuera} |`);
    }
    md.push(`| **Total** | **${filas.length}** | **${total.d1}** | **${total.d2}** | **${total.d3}** | **${total.vocal}** | **${total.proceso}** | **${total.fuera}** |`);
    md.push('');
    md.push('## Pares, uno a uno');
    md.push('');
    for (const [locale, etiqueta] of bancos.map((b) => [b[0], b[1]])) {
      md.push(`### ${etiqueta} (\`${locale}\`)`);
      md.push('');
      md.push('| Código | Par | Contraste | D | Rasgos que difieren |');
      md.push('| --- | --- | --- | --- | --- |');
      for (const f of filas.filter((x) => x.locale === locale)) {
        const medida = f.r.tipo === 'consonante' ? String(f.r.d)
          : f.r.tipo === 'vocal' ? `${f.r.d} (vocálico)`
            : f.r.tipo === 'proceso' ? '— (proceso)'
              : '— (sin clasificar)';
        md.push(`| ${f.par.code} | ${f.par.target} / ${f.par.foil} | \`${f.par.phoneme}\` | ${medida} | ${f.r.detalle} |`);
      }
      md.push('');
    }
    md.push('## Qué NO dice este informe');
    md.push('');
    md.push('- **No juzga el banco.** Un reparto desequilibrado puede ser la decisión');
    md.push('  clínica correcta para una patología concreta. Quien lo decide son las');
    md.push('  logopedas; esto solo pone el número delante.');
    md.push('- **No mide la confundibilidad real del reconocedor.** Eso es');
    md.push('  `scripts/asr-bench.js --audit-pairs` y `scripts/check-pair-discriminability.js`.');
    md.push('- **No cubre la variación dialectal.** Que /θ/ y /s/ se neutralicen en seseo');
    md.push('  no cambia la distancia de rasgos: cambia quién debe usar ese par, y eso');
    md.push('  vive en `region` y en `docs/guia-dialectal-*.md`.');
    md.push('');
    fs.writeFileSync(path.join(ROOT, DESTINO), md.join('\n') + '\n');
    console.log(`\n✓ Escrito ${DESTINO}`);
  }

  process.exitCode = 0;
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

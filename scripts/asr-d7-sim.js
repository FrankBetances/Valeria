#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · D7 · Simulación de las salidas al problema del contraste
 *   node scripts/asr-d7-sim.js
 *
 * docs/plan-asr-privacidad-y-motor-local.md §4.0 dejó abierta D7: `matchTarget`
 * concede el acierto con hasta UNA letra de diferencia por palabra, y eso se
 * come el contraste de 25 de los 35 pares mínimos. Apretarlo recupera el
 * contraste pero produce falsos «no te escuché» en habla aproximada, que es
 * justo lo que la tolerancia existe para evitar.
 *
 * Este script existe para que esa conversación con ACOPROS sea entre NÚMEROS y
 * no entre intuiciones. Mide, para cada salida posible:
 *
 *   · cuántos contrastes recupera (de 35), y
 *   · qué le hace al habla aproximada del niño.
 *
 * ---------------------------------------------------------------------------
 * DE DÓNDE SALE LA «HABLA APROXIMADA» (y por qué no me la invento)
 * ---------------------------------------------------------------------------
 * La tentación sería inventarse perturbaciones plausibles. Eso daría una tabla
 * con aspecto creíble y sin valor, que es el defecto que originó todo el plan.
 *
 * En su lugar, la evidencia sale del propio repositorio: los `stt_expected_array`
 * de la Expansión Semántica son **1619 aproximaciones ya validadas clínicamente**
 * repartidas en 424 ítems de las cuatro variedades. Cada array lista, junto a la
 * palabra canónica, las formas que un niño de esa edad produce y que el equipo
 * decidió dar por buenas («cama» → «tama», «ama», «kama»).
 *
 * De ahí se derivan dos cosas:
 *   1. El INVENTARIO DE PROCESOS realmente atestiguado (elisión inicial, elisión
 *      final, sustitución de consonante, variante ortográfica…), con su recuento.
 *   2. Aplicando esos procesos a los 35 objetivos de pares mínimos, el conjunto
 *      de aproximaciones sobre el que se mide el coste de cada regla.
 *
 * El inventario es evidencia; su aplicación a los pares es una extrapolación, y
 * está marcada como tal en la salida. ACOPROS puede corregir el inventario y
 * volver a correr esto.
 *
 * ---------------------------------------------------------------------------
 * LAS CUATRO RAMAS NO CUESTAN LO MISMO
 * ---------------------------------------------------------------------------
 * Según ValeriaMinimalPairsScreen.tsx:9-13, el veredicto tiene cuatro salidas y
 * el daño de equivocarse es muy distinto en cada una:
 *
 *   'target' → acierto, 3★
 *   'foil'   → se le dice al niño que dijo la OTRA palabra y se le da la
 *              corrección del par. Si en realidad acertó, se le está atribuyendo
 *              un error que no cometió: es el daño más grave
 *   'close'  → «casi»: reintento, pierde estrella
 *   'none'   → «no te escuché»: re-modela y NO consume intento ni estrella
 *
 * Por eso aquí no se cuenta un único «falso negativo»: se cuentan por separado
 * los tres modos de degradar, porque la conversación clínica es exactamente
 * sobre cuál de los tres se prefiere.
 * ========================================================================== */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');
const { loadAppLogic } = require('./asr-bench.js');

const ROOT = path.join(__dirname, '..');

const EXPANSION_MODS = [
  'valeriaSemanticExpansion',
  'valeriaSemanticExpansionEsDO',
  'valeriaSemanticExpansionGl',
  'valeriaSemanticExpansionEu',
];

// ---------------------------------------------------------------------------
// Evidencia: las aproximaciones que el proyecto ya da por buenas
// ---------------------------------------------------------------------------
function loadAcceptedApprox() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-d7-'));
  execSync(
    ['npx tsc', ...EXPANSION_MODS.map((m) => JSON.stringify(path.join(ROOT, 'src', `${m}.ts`))),
      '--module commonjs', '--target es2020', '--moduleResolution node',
      '--esModuleInterop', '--skipLibCheck', '--jsx', 'react-jsx',
      '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'pipe' },
  );

  const arrays = [];
  const walk = (n) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === 'object') {
      if (Array.isArray(n.stt_expected_array) && n.stt_expected_array.length > 1) arrays.push(n.stt_expected_array);
      Object.values(n).forEach(walk);
    }
    return undefined;
  };
  EXPANSION_MODS.forEach((m) => walk(require(path.join(tmp, `${m}.js`))));
  return arrays;
}

const plain = (s) => String(s).toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-zñ0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

function editDistance(a, b) {
  const m = a.length; const n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

const VOCALES = 'aeiouáéíóú';
const esVocal = (c) => VOCALES.includes(c);

// Clasificación del proceso que convierte la forma canónica en la aproximación.
// Deliberadamente gruesa: no pretende ser un análisis fonológico, sino contar
// qué tipos de aproximación aparecen y con qué peso.
function clasificar(canon, aprox) {
  const c = plain(canon); const a = plain(aprox);
  if (c === a) return 'idéntica';
  if (a.length < c.length) {
    if (c.endsWith(a)) return 'elisión inicial';
    if (c.startsWith(a)) return 'elisión final';
    return 'elisión interna o múltiple';
  }
  if (a.length > c.length) return 'adición';
  // Misma longitud: ¿cuántas posiciones cambian?
  let dif = 0; let idx = -1;
  for (let i = 0; i < c.length; i++) if (c[i] !== a[i]) { dif += 1; if (idx < 0) idx = i; }
  if (dif === 1) {
    if (idx === 0) return 'sustitución de la consonante inicial';
    return esVocal(c[idx]) ? 'sustitución vocálica' : 'sustitución consonántica interna';
  }
  return 'sustitución múltiple';
}

// ---------------------------------------------------------------------------
// Generación de habla aproximada para un objetivo de par mínimo
// ---------------------------------------------------------------------------
// Aplica los procesos ATESTIGUADOS arriba. Cada variante lleva la etiqueta del
// proceso que la produjo, para poder discutirla una a una con ACOPROS.
const ORTO = [['c', 'k'], ['k', 'c'], ['b', 'v'], ['v', 'b'], ['ll', 'y'], ['y', 'll'], ['z', 's'], ['qu', 'k']];

function aproximacionesDe(target) {
  const t = plain(target);
  const out = new Map();
  const add = (w, proceso) => {
    if (w && w !== t && w.length >= 2 && !out.has(w)) out.set(w, proceso);
  };

  // Elisión de la consonante inicial: «cama» → «ama», «cepillo» → «epillo».
  if (!esVocal(t[0])) add(t.slice(1), 'elisión inicial');
  // Elisión de la sílaba inicial: «cepillo» → «pillo».
  const primeraVocal = [...t].findIndex(esVocal);
  if (primeraVocal >= 0 && primeraVocal + 1 < t.length) add(t.slice(primeraVocal + 1), 'elisión de sílaba inicial');
  // Elisión de la consonante final: «lavar» → «lava», «comer» → «come».
  if (!esVocal(t[t.length - 1])) add(t.slice(0, -1), 'elisión final');
  // Sustitución de la consonante inicial por las atestiguadas en los bancos:
  // frontalización velar (k→t), oclusivización de fricativas (f→p, s→t) y
  // rotacismo (r→l). Son los procesos que los propios pares trabajan.
  if (!esVocal(t[0])) for (const s of ['t', 'p', 'l']) add(s + t.slice(1), 'sustitución de la consonante inicial');
  // Variantes ortográficas: el reconocedor escribe «kama», «baso», «laba».
  for (const [de, a] of ORTO) if (t.startsWith(de)) add(a + t.slice(de.length), 'variante ortográfica');

  return [...out].map(([forma, proceso]) => ({ forma, proceso }));
}

// ---------------------------------------------------------------------------
// Las reglas candidatas
// ---------------------------------------------------------------------------
// Todas reciben las alternativas YA normalizadas por la app (con su pliegue
// dialectal), y devuelven una de las cuatro ramas de `PairResult`.
const palabras = (s) => s.split(' ').filter(Boolean);
const exacta = (alts, w) => alts.some((a) => a === w || palabras(a).includes(w));
const distMin = (alts, w) => Math.min(...alts.map((a) => Math.min(
  editDistance(a, w), ...palabras(a).map((p) => editDistance(p, w)),
)));

// La regla ANTERIOR a D7, reproducida aquí a mano. Ya no está en la app —se
// sustituyó por O2 el 2026-08-04— pero sin ella la tabla perdería el «antes» y
// dejaría de explicar por qué se cambió nada.
function reglaPreD7(app, alts, target, foil) {
  if (app.voice.matchTarget(alts.raw, target) === 2) return 'target';
  if (app.voice.matchTarget(alts.raw, foil) === 2) return 'foil';
  return app.voice.matchTarget(alts.raw, target) === 1 ? 'close' : 'none';
}

// La que está viva en la app ahora mismo. Se llama al `matchPair` real en vez de
// reimplementarlo: así, si la implementación se desviara de lo que se aprobó,
// esta fila dejaría de coincidir con la de O2 y se vería aquí.
function reglaVigente(app, alts, target, foil) {
  return app.voice.matchPair(alts.raw, target, foil);
}

function reglaO1(app, alts, target, foil) {
  if (exacta(alts.norm, alts.nTarget)) return 'target';
  if (exacta(alts.norm, alts.nFoil)) return 'foil';
  return app.voice.matchTarget(alts.raw, target) >= 1 ? 'close' : 'none';
}

function reglaO2(app, alts, target, foil) {
  const dt = distMin(alts.norm, alts.nTarget);
  const df = distMin(alts.norm, alts.nFoil);
  if (dt === 0) return 'target';
  if (df === 0) return 'foil';
  if (dt <= 1 && dt < df) return 'target';
  if (df <= 1 && df < dt) return 'foil';
  if (dt <= 1 && dt === df) return 'close';   // ambiguo: que lo resuelva el adulto
  return app.voice.matchTarget(alts.raw, target) >= 1 ? 'close' : 'none';
}

// O4 · exactitud + lista explícita de aproximaciones por par, como ya se hace
// en la Expansión Semántica con `stt_expected_array`.
function reglaO4(app, alts, target, foil, lista) {
  if (exacta(alts.norm, alts.nTarget)) return 'target';
  if (lista && alts.norm.some((a) => lista.has(a))) return 'target';
  if (exacta(alts.norm, alts.nFoil)) return 'foil';
  return app.voice.matchTarget(alts.raw, target) >= 1 ? 'close' : 'none';
}

// ---------------------------------------------------------------------------
function main() {
  const app = loadAppLogic();

  // --- 1 · Evidencia ------------------------------------------------------
  const arrays = loadAcceptedApprox();
  const procesos = {};
  const distancias = { 0: 0, 1: 0, 2: 0, '3+': 0 };
  let totalAprox = 0;
  for (const arr of arrays) {
    const canon = arr[0];
    for (const a of arr.slice(1)) {
      totalAprox += 1;
      const p = clasificar(canon, a);
      procesos[p] = (procesos[p] || 0) + 1;
      const d = editDistance(plain(a), plain(canon));
      distancias[d >= 3 ? '3+' : d] += 1;
    }
  }

  console.log('# D7 · ¿qué hacer con el umbral fonético de los pares mínimos?\n');
  console.log('## 1. La evidencia disponible\n');
  console.log(`El proyecto ya tiene **${totalAprox} aproximaciones validadas clínicamente**, en los`);
  console.log(`\`stt_expected_array\` de ${arrays.length} ítems de Expansión Semántica de las cuatro variedades.`);
  console.log('Son las formas que el equipo decidió dar por buenas cuando las produce un niño.\n');

  console.log('**A qué distancia están de la forma canónica:**\n');
  console.log('| Distancia de edición | Aproximaciones | % |');
  console.log('| --- | --- | --- |');
  for (const k of ['0', '1', '2', '3+']) {
    console.log(`| ${k} | ${distancias[k]} | ${(100 * distancias[k] / totalAprox).toFixed(1)} % |`);
  }
  const pct1 = (100 * distancias['1']) / totalAprox;
  const pct2mas = (100 * (distancias['2'] + distancias['3+'])) / totalAprox;
  console.log('');
  console.log(`> **Dos lecturas, y las dos importan.** El ${pct1.toFixed(0)} % de lo que se acepta está a UNA letra:`);
  console.log('> eso es exactamente lo que cubre la tolerancia de `matchTarget`, así que la tolerancia hace');
  console.log(`> trabajo clínico real y quitarla sin más tiene coste. Pero el ${pct2mas.toFixed(0)} % está a dos o más:`);
  console.log('> esas no las cubre ninguna tolerancia y se aceptan porque están **escritas una a una** en');
  console.log('> el array. Es decir: el proyecto ya resuelve este problema por enumeración en todos los');
  console.log('> ejercicios menos en pares mínimos, que es el único que depende solo de la tolerancia.\n');

  console.log('**Qué procesos aparecen** (clasificación gruesa, para dimensionar):\n');
  console.log('| Proceso | Casos |');
  console.log('| --- | --- |');
  for (const [p, n] of Object.entries(procesos).sort((a, b) => b[1] - a[1])) {
    console.log(`| ${p} | ${n} |`);
  }

  // --- 2 · El banco de pares y sus aproximaciones -------------------------
  const pares = [];
  for (const b of app.banks) {
    for (const p of b.pairs) {
      pares.push({ banco: b.label, locale: b.locale, id: p.id || p.code, target: p.target, foil: p.foil });
    }
  }

  let colisiones = 0; let seguras = 0;
  for (const p of pares) {
    app.locale.setLocale(p.locale);
    const nFoil = app.voice.normalizeSpeech(p.foil);
    p.aprox = aproximacionesDe(p.target).map((a) => ({
      ...a, colisiona: app.voice.normalizeSpeech(a.forma) === nFoil,
    }));
    colisiones += p.aprox.filter((a) => a.colisiona).length;
    seguras += p.aprox.filter((a) => !a.colisiona).length;
  }

  console.log('\n## 2. Habla aproximada aplicada a los 35 pares\n');
  console.log('Aplicando esos procesos a los objetivos de los pares mínimos salen');
  console.log(`**${seguras + colisiones} producciones aproximadas**, de las cuales:\n`);
  console.log(`- **${seguras} seguras**: no coinciden con el distractor. Idealmente deberían seguir puntuando como acierto.`);
  console.log(`- **${colisiones} colisiones**: la aproximación ES la palabra del distractor.\n`);
  console.log('> Las colisiones son el nudo del problema y no las resuelve ninguna regla de este');
  console.log('> documento. Si el niño dice «lana» no hay texto que permita saber si intentaba decir');
  console.log('> «rana» y le salió mal —que es el error que el ejercicio busca— o si estaba diciendo');
  console.log('> «lana». **El conjunto de aproximaciones aceptables y el conjunto de errores clínicos');
  console.log('> se solapan por construcción**, y por eso el adulto es el juez final. Lo que sí se puede');
  console.log('> decidir es hacia qué lado cae la app por defecto.\n');

  // --- 3 · Simulación de las reglas ---------------------------------------
  const reglas = [
    { id: 'BASE', label: 'Antes de D7 · tolerancia de 1 letra', fn: reglaPreD7 },
    { id: 'O1', label: 'O1 · exactitud cuando hay distractor', fn: reglaO1 },
    { id: 'O2', label: 'O2 · vecino más cercano', fn: reglaO2 },
    { id: 'O4', label: 'O4 · exactitud + lista de aproximaciones', fn: reglaO4 },
    { id: 'VIGENTE', label: '**Vigente en la app** (`matchPair` real)', fn: reglaVigente },
  ];

  const res = {};
  for (const r of reglas) {
    res[r.id] = {
      contrastes: 0, contrastesTotal: pares.length,
      objetivoOk: 0, objetivoTotal: pares.length,
      aprox: { target: 0, close: 0, foil: 0, none: 0 },
      colision: { target: 0, close: 0, foil: 0, none: 0 },
      ciegos: [],
    };
  }

  const prepara = (app_, alts, target, foil) => ({
    raw: alts,
    norm: alts.map((a) => app_.voice.normalizeSpeech(a)),
    nTarget: app_.voice.normalizeSpeech(target),
    nFoil: app_.voice.normalizeSpeech(foil),
  });

  for (const p of pares) {
    app.locale.setLocale(p.locale);
    const lista = new Set(p.aprox.filter((a) => !a.colisiona).map((a) => app.voice.normalizeSpeech(a.forma)));

    for (const r of reglas) {
      const acc = res[r.id];

      // (a) ¿Recupera el contraste? El niño produce el distractor, transcrito perfecto.
      const vFoil = r.fn(app, prepara(app, [p.foil], p.target, p.foil), p.target, p.foil, lista);
      if (vFoil === 'foil') acc.contrastes += 1;
      else acc.ciegos.push(`${p.id} (${p.target}/${p.foil}) → ${vFoil}`);

      // (b) Cordura: el objetivo dicho perfecto tiene que seguir siendo acierto.
      const vT = r.fn(app, prepara(app, [p.target], p.target, p.foil), p.target, p.foil, lista);
      if (vT === 'target') acc.objetivoOk += 1;

      // (c) Coste sobre el habla aproximada.
      for (const a of p.aprox) {
        const v = r.fn(app, prepara(app, [a.forma], p.target, p.foil), p.target, p.foil, lista);
        (a.colisiona ? acc.colision : acc.aprox)[v] += 1;
      }
    }
  }

  const pc = (n, d) => (d ? `${((100 * n) / d).toFixed(0)} %` : '—');

  console.log('## 3. Qué hace cada salida\n');
  console.log('| Regla | Contrastes recuperados | Objetivo perfecto sigue siendo acierto | Aprox. segura → acierto | → «casi» | → **error ajeno** | → «no te escuché» |');
  console.log('| --- | --- | --- | --- | --- | --- | --- |');
  for (const r of reglas) {
    const a = res[r.id];
    const tot = seguras;
    console.log(
      `| ${r.label} | **${a.contrastes}/${a.contrastesTotal}** | ${a.objetivoOk}/${a.objetivoTotal} `
      + `| ${a.aprox.target} (${pc(a.aprox.target, tot)}) | ${a.aprox.close} (${pc(a.aprox.close, tot)}) `
      + `| ${a.aprox.foil} (${pc(a.aprox.foil, tot)}) | ${a.aprox.none} (${pc(a.aprox.none, tot)}) |`,
    );
  }

  // --- 3b · O4 sin trampa: ¿y si el niño hace algo que la lista no previó? ---
  // El 100 % de O4 en la tabla de arriba es circular: la lista se construye con
  // las mismas formas con las que se la evalúa. Lo que de verdad decide si O4
  // sirve es qué pasa con lo que NO estaba previsto. Se estima dejando fuera un
  // proceso cada vez, escribiendo la lista sin él y midiendo sobre él.
  const procesosPares = [...new Set(pares.flatMap((p) => p.aprox.filter((a) => !a.colisiona).map((a) => a.proceso)))];
  const holdout = { target: 0, close: 0, foil: 0, none: 0 };
  for (const fuera of procesosPares) {
    for (const p of pares) {
      app.locale.setLocale(p.locale);
      const lista = new Set(p.aprox
        .filter((a) => !a.colisiona && a.proceso !== fuera)
        .map((a) => app.voice.normalizeSpeech(a.forma)));
      for (const a of p.aprox.filter((x) => !x.colisiona && x.proceso === fuera)) {
        holdout[reglaO4(app, prepara(app, [a.forma], p.target, p.foil), p.target, p.foil, lista)] += 1;
      }
    }
  }
  const holdoutTot = Object.values(holdout).reduce((s, v) => s + v, 0);

  console.log('\n> ⚠️ **El 100 % de O4 es circular**: la lista se generó con las mismas formas con las');
  console.log('> que se la evalúa. Lo que decide si O4 sirve es qué hace con lo que nadie previó.');
  console.log('> Dejando fuera un proceso cada vez y midiendo sobre él, una aproximación no prevista');
  console.log(`> acaba en: **${holdout.target} acierto · ${holdout.close} «casi» · ${holdout.foil} error ajeno · ${holdout.none} «no te escuché»**`);
  console.log(`> (${holdoutTot} casos). Es decir: cuando la lista falla, O4 degrada a O1 —un «casi»—,`);
  console.log('> nunca a atribuirle al niño un error que no cometió. **El suelo de O4 es O1 y su techo');
  console.log('> es su cobertura.** La estimación es pesimista a propósito: quita un proceso entero de');
  console.log('> golpe, y en la práctica la lista se escribiría viendo producciones reales.\n');

  // --- 3c · ¿alguna opción domina a otra? ---------------------------------
  // Solo entre las reglas con cifras NO circulares. O4 queda fuera a propósito:
  // compararla con su 100 % sería usar justo el número que se acaba de invalidar.
  const domina = (a, b) => a.contrastes >= b.contrastes && a.aprox.target >= b.aprox.target
    && a.aprox.foil <= b.aprox.foil && a.aprox.none <= b.aprox.none
    && (a.contrastes > b.contrastes || a.aprox.target > b.aprox.target
      || a.aprox.foil < b.aprox.foil || a.aprox.none < b.aprox.none);
  const comparables = reglas.filter((r) => r.id !== 'O4' && r.id !== 'VIGENTE');
  for (const x of comparables) {
    for (const y of comparables) {
      if (x.id !== y.id && domina(res[x.id], res[y.id])) {
        console.log(`> **${x.id} domina a ${y.id}**: no es peor en ninguna métrica y es mejor en alguna,`);
        console.log(`> así que ${y.id} se puede descartar sin decidir nada clínico.\n`);
      }
    }
  }
  console.log('> **BASE y O2 no se dominan entre sí**, y ahí está la decisión de verdad: BASE conserva');
  console.log(`> ${res.BASE.aprox.target} aciertos sobre habla aproximada pero solo ve ${res.BASE.contrastes} de ${pares.length} contrastes; O2 ve los ${res.O2.contrastes}`);
  console.log(`> a cambio de bajar a ${res.O2.aprox.target}. Eso es un intercambio clínico, no técnico.\n`);

  // --- 3d · ¿lo que está en la app es lo que se aprobó? --------------------
  // La fila «Vigente» llama al `matchPair` real. Si alguna vez deja de coincidir
  // con O2, es que la implementación se desvió de la decisión, y hay que mirar
  // por qué antes de fiarse de ninguna otra cifra de este documento.
  const v = res.VIGENTE; const o2r = res.O2;
  const coincide = v.contrastes === o2r.contrastes
    && ['target', 'close', 'foil', 'none'].every((k) => v.aprox[k] === o2r.aprox[k]);
  console.log(coincide
    ? '\n> ✅ **La app implementa O2**: la fila «Vigente» —que llama al `matchPair` real—\n> reproduce exactamente la fila O2. Lo que se decidió es lo que está corriendo.\n'
    : '\n> 🔴 **ATENCIÓN: la app NO implementa O2.** La fila «Vigente» no coincide con O2.\n> La implementación se ha desviado de la decisión: revisar `matchPair` antes de\n> dar por buena ninguna otra cifra de este documento.\n');

  console.log('\n**Y sobre las colisiones** (la aproximación es la palabra del distractor):\n');
  console.log('| Regla | → acierto | → «casi» | → error detectado | → «no te escuché» |');
  console.log('| --- | --- | --- | --- | --- |');
  for (const r of reglas) {
    const c = res[r.id].colision;
    console.log(`| ${r.label} | ${c.target} | ${c.close} | ${c.foil} | ${c.none} |`);
  }

  // --- 4 · O3, que no es un cambio de código -------------------------------
  const distancia = pares.map((p) => {
    app.locale.setLocale(p.locale);
    return { ...p, d: editDistance(app.voice.normalizeSpeech(p.target), app.voice.normalizeSpeech(p.foil)) };
  });
  const sobreviven = distancia.filter((p) => p.d >= 2);
  const rehacer = distancia.filter((p) => p.d < 2);

  console.log('\n## 4. O3 · rediseñar los pares (no toca código)\n');
  console.log(`Con la regla de hoy, un par solo distingue su distractor si ambas palabras se separan por`);
  console.log(`**dos o más letras**. Sobreviven **${sobreviven.length} de ${pares.length}**; habría que sustituir **${rehacer.length}**:\n`);
  for (const b of app.banks) {
    const míos = rehacer.filter((p) => p.banco === b.label);
    if (!míos.length) continue;
    console.log(`- **${b.label}** (${míos.length}): ${míos.map((p) => `${p.target}/${p.foil}`).join(', ')}`);
  }
  console.log('');
  console.log('> **Esta salida tiene un problema de fondo.** Un par mínimo se define por diferir en UN');
  console.log('> fonema; exigir dos letras de diferencia ortográfica excluye contrastes perfectamente');
  console.log('> legítimos y muy usados en clínica (*cubo/tubo*, *boca/bota*, *miel/piel*). Lo que');
  console.log('> sobrevive lo hace por accidente de la ortografía —*perro/pelo* pasa porque «rr» se');
  console.log('> escribe con dos letras—, no por ser un contraste más fácil. Rediseñar el banco para');
  console.log('> contentar al matcher es adaptar la clínica a la herramienta.\n');

  // --- 5 · Coste de O4 ------------------------------------------------------
  console.log('## 5. Lo que costaría cada una\n');
  console.log('| Salida | Cambio | Coste |');
  console.log('| --- | --- | --- |');
  console.log('| O1 | Unas líneas en `matchPair` | Cero de contenido. Todo el coste es clínico: se pierde la tolerancia entera |');
  console.log('| O2 | Unas líneas en `matchPair` | Cero de contenido. Introduce la rama «ambiguo» |');
  console.log(`| O3 | Sustituir ${rehacer.length} pares en 4 bancos | Alto y clínico: hay que reinventar contrastes, con pictogramas, consignas, misiones y locuciones nuevas |`);
  console.log(`| O4 | \`matchPair\` + un campo nuevo por par | ~${seguras} entradas que hay que **escribir y validar** una a una, como ya se hizo con los 1619 \`stt_expected_array\` |`);

  console.log('\n## 6. La decisión tomada, y lo que queda por confirmar\n');
  const o2 = res.O2; const base = res.BASE;
  console.log(`**D7 se cerró el 2026-08-04 con O2**, por decisión de Frank sobre estas cifras.`);
  console.log(`Los ${o2.contrastes} contrastes se recuperan y ninguna aproximación se envía a la rama de error.`);
  console.log(`El precio aceptado: de ${seguras} producciones aproximadas del objetivo, las que puntuaban`);
  console.log(`acierto pasan de ${base.aprox.target} a ${o2.aprox.target}, y ${o2.aprox.close} pasan a «casi» —una estrella y un reintento—.\n`);
  console.log('Lo que sigue abierto, y que solo se puede cerrar con logopedas y con sesiones reales:\n');
  console.log(`1. **¿Aguanta ese precio en sesión?** ${o2.aprox.close} «casi» de más es una estimación sobre habla`);
  console.log('   aproximada generada, no observada. Hay que verlo con niños delante.');
  console.log('2. **Los empates.** Cuando lo oído queda igual de cerca de las dos palabras, la app');
  console.log('   dice «casi» y no se moja. ¿Es lo que quieren las logopedas, o prefieren que se');
  console.log('   incline hacia el distractor —más sensible al error— o hacia el objetivo —más amable—?');
  console.log(`3. **Las ${colisiones} colisiones siguen sin solución posible** y no la tienen: son el límite`);
  console.log('   del texto como evidencia. El adulto es el juez, y ahí no hay regla que ayude.');
  console.log(`4. **O4 sigue disponible** si O2 se queda corto: ~${seguras} aproximaciones escritas a mano`);
  console.log(`   recuperarían los aciertos perdidos. Es el patrón de los ${totalAprox} \`stt_expected_array\`.`);
  console.log('5. Todo esto va junto con **D6** (cuántos «no te escuché» de más por sesión son');
  console.log('   tolerables): son la misma magnitud clínica mirada desde dos sitios.');

  console.log('\n---\n');
  console.log('_Generado por `node scripts/asr-d7-sim.js`. El inventario de procesos sale de datos_');
  console.log('_reales del repositorio; su aplicación a los pares mínimos es una extrapolación._');
  console.log('_La fila «Vigente» llama al `matchPair` real: si se desviara de O2, este informe lo diría._');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}

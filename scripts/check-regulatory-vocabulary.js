#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Muro de vocabulario educativo (No SaMD)
 *   node scripts/check-regulatory-vocabulary.js
 *
 * Valeria+ se describe como aplicación educativa. Este gate falla si la
 * interfaz, Academy, las consignas `read:` o el sitio legal vuelven a usar
 * el vocabulario clínico de docs/PLAN-REFACTOR-STEAM.md §7.2, «Abrazo de
 * oso» o «Abraçada d'ós».
 *
 * No mira comentarios ni claves: mira lo que una persona puede leer.
 * «tratamiento» en el sentido del RGPD (responsable / encargado / de datos)
 * no es una reivindicación clínica y no falla.
 *
 * Una consigna `read:` que ya está horneada en assets/voice/ no se puede
 * reescribir sin cambiar su id FNV-1a. Esas cadenas se anotan y no tumban
 * el gate: el corpus de voz no se toca desde aquí.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets', 'voice');

/* `\b` de JavaScript solo ve [A-Za-z0-9_]. Una ó final (prescripció,
 * rehabilitació, desensibilització) no cierra palabra y el término se cuela. */
const UB = '(?:(?<![\\p{L}\\p{N}_])(?=[\\p{L}\\p{N}_])|(?<=[\\p{L}\\p{N}_])(?![\\p{L}\\p{N}_]))';
function uRe(re) {
  return new RegExp(re.source.replace(/\\b/g, UB), re.flags.includes('u') ? re.flags : `${re.flags}u`);
}

const RULES = [
  {
    id: 'tratamiento',
    re: uRe(/\b(tratamientos?|tratamentos?|tractaments?|treatments?)\b/gi),
    gdpr: true,
  },
  { id: 'terapia', re: uRe(/\b(terapias?|teràpies?|therap(?:y|ies))\b/gi) },
  { id: 'rehabilitacion', re: uRe(/\brehabilitaci[oó]n?s?\b|\brehabilitations?\b/gi) },
  {
    id: 'prescripcion',
    re: uRe(/\b(prescripci[oó]n?s?|prescrici[oó]n?s?|prescriptions?|prescribir|prescriure|prescribe[ds]?|prescribing|prescrit(?:o|a|os|as|s|es)?|prescriptor(?:es)?|prescritor(?:es)?|pautar|pautad[oa]s?|pautats?)\b/gi),
  },
  { id: 'paciente', re: uRe(/\b(pacientes?|pacients?|patients?)\b/gi) },
  { id: 'desensibilizacion', re: uRe(/\b(desensibilizaci[oó]n(?:es)?|desensibilitzaci[oó]|desensitiz\w*)\b/gi) },
  { id: 'SOR', re: uRe(/\bSOR\b/g) },
  { id: 'diagnostico', re: uRe(/\b(diagn[oóò]sti\w*|diagnos\w*)\b/gi) },
  { id: 'evaluacion-clinica', re: uRe(/evaluaci[oó]n cl[ií]nica|avaluaci[oó] cl[ií]nica|clinical evaluation/gi) },
  { id: 'PRT', re: uRe(/\bPRT\b/g) },
  { id: 'TCC', re: uRe(/\bTCC\b/g) },
  { id: 'CBT', re: uRe(/\bCBT\b/g) },
  { id: 'cierre-velar', re: uRe(/cierre velar|tancament velar|velar closure/gi) },
  { id: 'estresor', re: uRe(/\b(estresor(?:es)?|estresorea|estressors?|stressors?)\b/gi) },
  { id: 'abrazo-oso', re: uRe(/abrazo de oso|abraçada d['’]ós/gi) },
];

const GDPR = /responsable del tratamiento|encargado del tratamiento|tratamiento de datos|este tratamiento|ese tratamiento|tratamiento se limita|constituye tratamiento|tratamiento lo realiza/i;

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const assetNames = new Set(
  fs.existsSync(ASSETS) ? fs.readdirSync(ASSETS).filter((f) => f.endsWith('.m4a')) : [],
);

function isLocuted(text) {
  const n = text.replace(/\s+/g, ' ').trim();
  if (!n) return false;
  const hash = fnv1a(n);
  const baseLen = n.length;
  const styles = ['tutor', 'child', 'clinical', 'slow'];
  const langs = ['es', 'gl', 'eu', 'en', 'ca'];
  for (const style of styles) {
    for (const lang of langs) {
      const base = `${style}_${hash}_${baseLen}`;
      const id = lang === 'es' ? base : `${lang}_${base}`;
      if (assetNames.has(`${id}.m4a`)) return true;
    }
  }
  return false;
}

function gdprAllowed(text, index) {
  const slice = text.slice(Math.max(0, index - 56), index + 56);
  return GDPR.test(slice);
}

function hitsIn(text) {
  const found = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(text))) {
      if (rule.gdpr && gdprAllowed(text, m.index)) continue;
      found.push({ id: rule.id, term: m[0], index: m.index });
    }
  }
  return found;
}

function walk(dir, pred) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p, pred);
    return pred(p) ? [p] : [];
  });
}

function lineOf(sf, pos) {
  return sf.getLineAndCharacterOfPosition(pos).line + 1;
}

const failures = [];
const locuted = [];
let gdprCount = 0;

function consider(rel, line, literal) {
  const n = literal.replace(/\s+/g, ' ').trim();
  if (!n) return;
  const found = hitsIn(n);
  if (!found.length) return;
  if (isLocuted(n)) {
    locuted.push({ rel, line, text: n, terms: [...new Set(found.map((h) => h.term))] });
    return;
  }
  for (const h of found) failures.push(`${rel}:${line}: «${h.term}» (${h.id}) — ${n.slice(0, 140)}`);
}

function scanTs(file, { onlyRead }) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  function visit(node) {
    if (onlyRead) {
      if (ts.isPropertyAssignment(node) && node.name && ts.isIdentifier(node.name) && node.name.text === 'read') {
        const init = node.initializer;
        if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
          consider(rel, lineOf(sf, init.getStart(sf)), init.text);
        }
      }
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      consider(rel, lineOf(sf, node.getStart(sf)), node.text);
    } else if (ts.isTemplateExpression(node)) {
      const chunks = [node.head.text, ...node.templateSpans.map((s) => s.literal.text)];
      const joined = chunks.join(' ');
      if (hitsIn(joined).length) consider(rel, lineOf(sf, node.getStart(sf)), joined);
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

function scanHtml(file) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const raw = fs.readFileSync(file, 'utf8');
  const text = raw.replace(/<!--[\s\S]*?-->/g, '');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const gdprHits = [];
    const rule = RULES[0];
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(line))) {
      if (gdprAllowed(line, m.index)) gdprHits.push(m[0]);
    }
    gdprCount += gdprHits.length;
    const found = hitsIn(line.replace(/<[^>]+>/g, ' '));
    for (const h of found) {
      failures.push(`${rel}:${i + 1}: «${h.term}» (${h.id})`);
    }
  });
}

for (const dir of ['src/i18n', 'src/ValeriaSensory', 'src/ValeriaAcademy']) {
  for (const file of walk(path.join(ROOT, dir), (p) => /\.tsx?$/.test(p))) scanTs(file, { onlyRead: false });
}

for (const file of walk(path.join(ROOT, 'src'), (p) => /\/valeriaExercise[^/]*\.ts$/.test(p))) {
  scanTs(file, { onlyRead: true });
}

for (const file of walk(path.join(ROOT, 'site'), (p) => p.endsWith('.html'))) scanHtml(file);

if (locuted.length) {
  console.log(`Locuciones ya horneadas, sin tocar (${locuted.length}):`);
  for (const item of locuted) {
    console.log(`  · ${item.rel}:${item.line} [${item.terms.join(', ')}] ${item.text.slice(0, 160)}`);
  }
}
if (gdprCount) {
  console.log(`RGPD: ${gdprCount} aparición(es) de «tratamiento» como tratamiento de datos, permitidas.`);
}

if (failures.length) {
  console.error(`\n✖ ${failures.length} término(s) clínico(s) en la superficie educativa:`);
  for (const f of failures) console.error('  ' + f);
  process.exit(1);
}

console.log('✓ Vocabulario educativo: la interfaz, Academy, las consignas read: no locutadas y el sitio no usan los términos prohibidos.');

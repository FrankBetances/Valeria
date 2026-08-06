#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Gate del banco de Pares Mínimos INGLÉS (plan en-US, EN-3.1)
 *   node scripts/check-minimal-pairs-en.js
 *
 * Un par mínimo mal construido no se ve en el diff ni rompe la app: se ve tres
 * meses después, en los informes, cuando resulta que la mitad de los ensayos
 * medían otra cosa. En castellano ese fallo YA ocurrió —25 de 35 pares
 * puntuaban como acierto que el niño dijera el distractor (§4.0 del plan ASR)—,
 * así que el banco inglés no se da por bueno con la intuición de quien lo
 * escribe. Aquí se comprueba, contra CMUdict:
 *
 *   1. Ambas palabras existen y tienen UNA sola pronunciación. Una palabra
 *      ambigua (bow = /boʊ/ o /baʊ/) no es un par mínimo: es una trampa para el
 *      reconocedor y para el TTS, que puede hornear la lectura equivocada.
 *   2. El par contrasta EXACTAMENTE un fonema (sustitución o elisión).
 *   3. La etiqueta `phoneme` dice la verdad: los fonemas que declara son los
 *      que de verdad cambian. Sin esto, la etiqueta es decoración.
 *   4. Cada par lleva su veredicto dialectal (EN-0.5) bien formado.
 *   5. Ningún par usa un contraste PROHIBIDO por docs/guia-dialectal-en-US.md
 *      §5: /r/ postvocálica, grupo consonántico final, sonoridad final. Son los
 *      tres que convertirían rasgos regulares del inglés afroamericano y del
 *      inglés con influencia del español en «errores».
 *
 * El chequeo 5 es el que justifica que este gate exista y no sea una revisión
 * a ojo: es una regla que hay que aplicar a cada par nuevo, para siempre, y las
 * reglas que dependen de que alguien se acuerde se incumplen solas.
 * ========================================================================== */
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(ROOT, 'src', 'valeriaMinimalPairsEn.ts');
const DICT = path.join(__dirname, 'data', 'cmudict-en.json');

const VOWELS = new Set(['AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER', 'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW']);
// Pares sonoro/sordo del inglés, para detectar contrastes de sonoridad.
const VOICING = { B: 'P', D: 'T', G: 'K', V: 'F', Z: 'S', ZH: 'SH', DH: 'TH', JH: 'CH' };
const devoiced = (a, b) => VOICING[a] === b || VOICING[b] === a;

// IPA de las etiquetas `phoneme` → ARPAbet de CMUdict. Solo los símbolos que el
// banco usa: si aparece uno nuevo, el gate falla pidiendo que se añada aquí, que
// es mejor que aceptarlo sin comprobar.
const IPA = {
  p: 'P', b: 'B', t: 'T', d: 'D', k: 'K', g: 'G',
  f: 'F', v: 'V', s: 'S', z: 'Z', h: 'HH',
  m: 'M', n: 'N', l: 'L', r: 'R', w: 'W', j: 'Y',
  'θ': 'TH', 'ð': 'DH', 'ʃ': 'SH', 'ʒ': 'ZH', 'tʃ': 'CH', 'dʒ': 'JH', 'ŋ': 'NG',
  i: 'IY', 'ɪ': 'IH', 'e': 'EY', 'ɛ': 'EH', 'æ': 'AE', 'ɑ': 'AA', 'ɔ': 'AO',
  o: 'OW', 'ʊ': 'UH', u: 'UW', 'ʌ': 'AH', 'ɚ': 'ER', 'ɝ': 'ER',
};

const bare = (ph) => ph.replace(/\d$/, '');           // EY1 → EY
const errors = [];
const fail = (code, msg) => errors.push(`${code}: ${msg}`);

// Traduce '/sn-/' → ['S','N'] · '∅' → []
function toArpa(label, code) {
  const s = label.replace(/[/\-\s]/g, '');
  if (s === '∅' || s === '') return [];
  const out = [];
  for (let i = 0; i < s.length;) {
    const two = s.slice(i, i + 2);
    if (IPA[two]) { out.push(IPA[two]); i += 2; continue; }
    const one = s[i];
    if (IPA[one]) { out.push(IPA[one]); i += 1; continue; }
    fail(code, `símbolo IPA desconocido «${one}» en «${label}» — añádelo al mapa IPA del gate`);
    return null;
  }
  return out;
}

// Diferencia entre dos transcripciones. Devuelve {kind:'sub'|'del', at, from, to}
// o null si difieren en más de un fonema (que es justo lo que no puede pasar).
function singleDiff(a, b) {
  if (a.length === b.length) {
    const at = a.findIndex((ph, i) => ph !== b[i]);
    if (at < 0) return null;
    if (a.some((ph, i) => i !== at && ph !== b[i])) return null;
    return { kind: 'sub', at, from: [a[at]], to: [b[at]] };
  }
  // Elisión: el más largo contiene al más corto con exactamente un fonema extra.
  const [long, short] = a.length > b.length ? [a, b] : [b, a];
  if (long.length - short.length !== 1) return null;
  for (let at = 0; at < long.length; at++) {
    const spliced = long.slice(0, at).concat(long.slice(at + 1));
    if (spliced.every((ph, i) => ph === short[i])) {
      return a.length > b.length
        ? { kind: 'del', at, from: [long[at]], to: [] }
        : { kind: 'del', at, from: [], to: [long[at]] };
    }
  }
  return null;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'valeria-pairs-en-'));
try {
  execSync(
    ['npx tsc', JSON.stringify(ENTRY), '--module commonjs', '--target es2020',
      '--moduleResolution node', '--esModuleInterop', '--skipLibCheck',
      '--outDir', JSON.stringify(tmp)].join(' '),
    { cwd: ROOT, stdio: 'inherit' },
  );
  const { MINIMAL_PAIRS_EN } = require(path.join(tmp, 'valeriaMinimalPairsEn.js'));
  const dict = JSON.parse(fs.readFileSync(DICT, 'utf8')).words;

  const seen = new Set();
  for (const p of MINIMAL_PAIRS_EN) {
    const code = p.code || p.id;

    if (seen.has(p.id)) fail(code, `id duplicado «${p.id}»`);
    seen.add(p.id);

    // ---- 1. CMUdict: existen y no son ambiguas -----------------------------
    const prons = {};
    let ok = true;
    for (const role of ['target', 'foil']) {
      const w = String(p[role]).toLowerCase();
      const entry = dict[w];
      if (!entry) {
        fail(code, `«${w}» no está en el subconjunto de CMUdict — regenera con: python3 scripts/build-cmudict-en.py`);
        ok = false;
      } else if (entry.length > 1) {
        fail(code, `«${w}» tiene ${entry.length} pronunciaciones en CMUdict (${entry.map((x) => x.join(' ')).join(' / ')}): una palabra ambigua no sirve como par mínimo`);
        ok = false;
      } else {
        prons[role] = entry[0].map(bare);
      }
    }
    if (!ok) continue;

    // ---- 2. Contraste de exactamente un fonema -----------------------------
    const diff = singleDiff(prons.target, prons.foil);
    if (!diff) {
      fail(code, `«${p.target}» /${prons.target.join(' ')}/ y «${p.foil}» /${prons.foil.join(' ')}/ no contrastan exactamente un fonema`);
      continue;
    }

    // ---- 3. La etiqueta `phoneme` dice la verdad ---------------------------
    const [lhs, rhs] = String(p.phoneme).split('→').map((x) => x.trim());
    if (rhs === undefined) {
      fail(code, `la etiqueta phoneme «${p.phoneme}» no tiene la forma «/x/ → /y/»`);
    } else {
      const want = { from: toArpa(lhs, code), to: toArpa(rhs, code) };
      if (want.from && want.to) {
        // La etiqueta describe el cambio TARGET → FOIL (lo que hace el niño).
        const got = diff.kind === 'sub'
          ? { from: diff.from, to: diff.to }
          : { from: prons.target.length > prons.foil.length ? diff.from : [], to: prons.target.length > prons.foil.length ? [] : diff.from };
        // En los grupos la etiqueta cita el grupo entero (/sn-/ → /n-/); basta
        // con que el fonema que de verdad cambia esté en la etiqueta y que lo
        // que declara desaparecer no siga en el otro miembro.
        const declaresChange = want.from.some((ph) => got.from.includes(ph))
          || want.to.some((ph) => got.to.includes(ph))
          || (got.from.length === 0 && want.from.length === 0)
          || (got.to.length === 0 && want.to.length === 0 && want.from.some((ph) => diff.from.includes(ph)));
        if (!declaresChange) {
          fail(code, `la etiqueta phoneme «${p.phoneme}» no coincide con el cambio real ${diff.from.join(' ') || '∅'} → ${diff.to.join(' ') || '∅'}`);
        }
      }
    }

    // ---- 4. Veredicto dialectal (EN-0.5) -----------------------------------
    const d = p.dialect;
    if (!d) {
      fail(code, 'sin veredicto dialectal. Regla bloqueante EN-0.5: ver docs/guia-dialectal-en-US.md');
    } else if (!['developmental', 'dialect-sensitive', 'transfer'].includes(d.verdict)) {
      fail(code, `veredicto dialectal desconocido «${d.verdict}»`);
    } else if (d.verdict !== 'developmental') {
      if (!d.regularIn || d.regularIn.length === 0) {
        fail(code, `«${d.verdict}» exige declarar en qué variedades el rasgo es regular (regularIn)`);
      }
      if (!d.note || d.note.trim().length < 40) {
        fail(code, `«${d.verdict}» exige un aviso al adulto (note) que explique qué hacer`);
      }
    }

    // ---- 5. Contrastes PROHIBIDOS por la guía dialectal §5 ------------------
    const changed = diff.from.concat(diff.to);
    const idx = diff.at;
    const longest = prons.target.length >= prons.foil.length ? prons.target : prons.foil;

    // 5a · /r/ postvocálica (AAE y sureño son no-róticos)
    const rPostvocalic = changed.some((ph) => ph === 'ER')
      || (changed.includes('R') && idx > 0 && VOWELS.has(longest[idx - 1]));
    if (rPostvocalic) {
      fail(code, 'contrasta /r/ POSTVOCÁLICA. Prohibido: el inglés afroamericano y el sureño son no-róticos (guía dialectal §4.5)');
    }

    // 5b · grupo consonántico FINAL (test→tes' es rasgo regular de AAE y SIE)
    const tailCluster = (ph) => {
      let n = 0;
      for (let i = ph.length - 1; i >= 0 && !VOWELS.has(ph[i]); i--) n++;
      return n;
    };
    if (idx >= longest.length - tailCluster(longest) && tailCluster(longest) >= 2) {
      fail(code, 'el contraste cae en un GRUPO CONSONÁNTICO FINAL. Prohibido: su reducción es rasgo regular de AAE y del inglés con influencia del español (guía §4.3)');
    }

    // 5c · sonoridad en posición FINAL (bad→bat)
    if (diff.kind === 'sub' && devoiced(diff.from[0], diff.to[0]) && idx === longest.length - 1) {
      fail(code, 'contrasta SONORIDAD en posición final. Prohibido por la guía dialectal §4.4');
    }
  }

  console.log(`Banco inglés: ${MINIMAL_PAIRS_EN.length} pares · ${Object.keys(dict).length} palabras contrastadas contra CMUdict.`);
  const byVerdict = {};
  for (const p of MINIMAL_PAIRS_EN) {
    const v = p.dialect?.verdict ?? 'SIN VEREDICTO';
    byVerdict[v] = (byVerdict[v] ?? 0) + 1;
  }
  for (const [v, n] of Object.entries(byVerdict)) console.log(`  · ${v}: ${n}`);

  if (errors.length) {
    console.error(`\n✖ ${errors.length} problema(s) en el banco de pares inglés:`);
    for (const e of errors) console.error(`  · ${e}`);
    console.error('\nVer docs/guia-dialectal-en-US.md (regla bloqueante EN-0.5) y §4.1 del plan en-US.');
    process.exit(1);
  }
  console.log('✓ Cada par contrasta un solo fonema, su etiqueta es cierta y lleva veredicto dialectal.');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

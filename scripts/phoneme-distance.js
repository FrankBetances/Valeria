#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Distancia por rasgos distintivos entre los fonemas de un par
 *   const { distancia } = require('./phoneme-distance');
 *
 * Para qué sirve: decir CUÁNTO se parecen las dos palabras de un par mínimo en
 * el oído del niño, no en la escritura. «casa/caza» y «rana/lana» se separan
 * por una letra las dos, pero /s/–/θ/ difiere solo en el punto de articulación
 * y /r̄/–/l/ solo en el modo: son igual de exigentes. En cambio /f/–/b/ difiere
 * en los tres rasgos y se distingue casi sin esfuerzo. Medir eso con distancia
 * de cadenas (Levenshtein) da 1 en los tres casos y no informa de nada.
 *
 * De dónde salen los fonemas: NO se adivinan de la ortografía. Cada par de los
 * seis bancos declara su contraste en el campo `phoneme` ('r̄ → l', '/θ/ → /f/'),
 * y este módulo lee ESO. Adivinarlos de la escritura es lo que hace que ⟨z⟩ se
 * lea /z/ en vez de /θ/, que ⟨rr⟩ y ⟨ch⟩ se partan por la mitad y que las
 * vocales caigan a un valor por defecto sin que se note.
 *
 * QUÉ NO MIDE, y por eso lo dice en vez de inventarse un número:
 *   · Vocales y consonantes no comparten espacio de rasgos. Una vocal se
 *     describe con altura/anterioridad/redondeamiento; una consonante con
 *     punto/modo/sonoridad. Un contraste vocálico se mide en su propia escala
 *     y se marca como tal.
 *   · Un proceso fonológico no es un segmento. '/-t/ → ∅' (omisión de consonante
 *     final) y '/sn-/ → /n-/' (reducción de grupo) no tienen distancia de
 *     rasgos: se clasifican aparte.
 *   · Un símbolo que no esté en las tablas devuelve null. Nunca un número
 *     plausible: un hueco que se rellena solo es un hueco que nadie arregla.
 *
 * Supuesto explícito: ⟨r⟩ a secas es la aproximante inglesa /ɹ/. Los bancos
 * ibéricos escriben siempre 'r̄' (vibrante múltiple) y 'ɾ' (vibrante simple);
 * solo el banco en-US usa 'r'. Si algún día un banco castellano escribe 'r' a
 * secas, la distancia saldrá corrida en un rasgo — de ahí que el informe imprima
 * el símbolo que ha leído en cada par.
 * ========================================================================== */

// --- Consonantes · punto / modo / sonoridad --------------------------------
// El punto distingue apical (s̺) de laminal (s̻) porque en euskara ESE es el
// contraste clínico entre 'su' y 'zu': sin esos dos valores, /s̺/ y /s̻/ salen
// idénticos y los dos pares vascos de sibilantes miden 0.
const CONSONANTES = {
  p:    { punto: 'bilabial',         modo: 'oclusiva',    sonora: false },
  b:    { punto: 'bilabial',         modo: 'oclusiva',    sonora: true  },
  t:    { punto: 'alveolar',         modo: 'oclusiva',    sonora: false },
  d:    { punto: 'alveolar',         modo: 'oclusiva',    sonora: true  },
  k:    { punto: 'velar',            modo: 'oclusiva',    sonora: false },
  g:    { punto: 'velar',            modo: 'oclusiva',    sonora: true  },
  f:    { punto: 'labiodental',      modo: 'fricativa',   sonora: false },
  v:    { punto: 'labiodental',      modo: 'fricativa',   sonora: true  },
  'θ':  { punto: 'interdental',      modo: 'fricativa',   sonora: false },
  'ð':  { punto: 'interdental',      modo: 'fricativa',   sonora: true  },
  s:    { punto: 'alveolar',         modo: 'fricativa',   sonora: false },
  z:    { punto: 'alveolar',         modo: 'fricativa',   sonora: true  },
  's̺': { punto: 'alveolar-apical',  modo: 'fricativa', sonora: false }, // s̺ · euskara
  's̻': { punto: 'alveolar-laminal', modo: 'fricativa', sonora: false }, // s̻ · euskara
  'ʃ':  { punto: 'postalveolar',     modo: 'fricativa',   sonora: false },
  'ʒ':  { punto: 'postalveolar',     modo: 'fricativa',   sonora: true  },
  x:    { punto: 'velar',            modo: 'fricativa',   sonora: false },
  h:    { punto: 'glotal',           modo: 'fricativa',   sonora: false },
  'tʃ': { punto: 'postalveolar',     modo: 'africada',    sonora: false },
  'dʒ': { punto: 'postalveolar',     modo: 'africada',    sonora: true  },
  'ts̺': { punto: 'alveolar-apical',  modo: 'africada', sonora: false }, // ts̺ · euskara ⟨ts⟩
  'ts̻': { punto: 'alveolar-laminal', modo: 'africada', sonora: false }, // ts̻ · euskara ⟨tz⟩
  m:    { punto: 'bilabial',         modo: 'nasal',       sonora: true  },
  n:    { punto: 'alveolar',         modo: 'nasal',       sonora: true  },
  'ɲ':  { punto: 'palatal',          modo: 'nasal',       sonora: true  },
  'ŋ':  { punto: 'velar',            modo: 'nasal',       sonora: true  },
  l:    { punto: 'alveolar',         modo: 'lateral',     sonora: true  },
  'ʎ':  { punto: 'palatal',          modo: 'lateral',     sonora: true  },
  'ɾ':  { punto: 'alveolar',         modo: 'vibrante-simple', sonora: true },
  'r̄': { punto: 'alveolar',    modo: 'vibrante-múltiple', sonora: true }, // r̄
  r:    { punto: 'alveolar',         modo: 'aproximante', sonora: true  }, // /ɹ/ del en-US
  w:    { punto: 'labiovelar',       modo: 'aproximante', sonora: true  },
};

// --- Vocales · altura / anterioridad / redondeamiento ----------------------
// `tenso` no entra en la distancia: se imprime como anotación. Si entrase, la
// escala vocálica llegaría a 4 y dejaría de ser comparable con la consonántica.
const VOCALES = {
  i:   { altura: 'cerrada',      anterior: 'anterior', redondeada: false, tenso: true  },
  'ɪ': { altura: 'casi-cerrada', anterior: 'anterior', redondeada: false, tenso: false },
  e:   { altura: 'media-cerrada', anterior: 'anterior', redondeada: false, tenso: true },
  'ɛ': { altura: 'media-abierta', anterior: 'anterior', redondeada: false, tenso: false },
  o:   { altura: 'media-cerrada', anterior: 'posterior', redondeada: true, tenso: true },
  'ɔ': { altura: 'media-abierta', anterior: 'posterior', redondeada: true, tenso: false },
  a:   { altura: 'abierta',      anterior: 'central',  redondeada: false, tenso: true  },
  u:   { altura: 'cerrada',      anterior: 'posterior', redondeada: true, tenso: true  },
};

// --- Procesos fonológicos · no son segmentos -------------------------------
const PROCESOS = {
  '∅': 'omisión (segmento ausente)',
};
const esGrupoOProceso = (s) => s.startsWith('-') || s.endsWith('-') || PROCESOS[s] !== undefined;

/** Quita las barras de la notación /X/ y normaliza los diacríticos. */
function normalizar(simbolo) {
  const s = String(simbolo).normalize('NFC').trim();
  return s.replace(/^\/+/, '').replace(/\/+$/, '');
}

/**
 * Distancia de rasgos entre dos símbolos IPA.
 * Devuelve { tipo, d, detalle } donde `tipo` es uno de:
 *   'consonante' · d ∈ 0..3, cuántos de punto/modo/sonoridad difieren
 *   'vocal'      · d ∈ 0..3, cuántos de altura/anterioridad/redondeamiento difieren
 *   'proceso'    · d = null, el contraste es un proceso (omisión, grupo), no un segmento
 *   'mixto'      · d = null, una vocal contra una consonante: no son comparables
 *   'desconocido'· d = null, algún símbolo no está en las tablas
 */
function distancia(simbolo1, simbolo2) {
  const a = normalizar(simbolo1);
  const b = normalizar(simbolo2);

  if (esGrupoOProceso(a) || esGrupoOProceso(b)) {
    return { tipo: 'proceso', d: null, detalle: `${a} / ${b}` };
  }

  const ca = CONSONANTES[a];
  const cb = CONSONANTES[b];
  if (ca && cb) {
    const difieren = [];
    if (ca.punto !== cb.punto) difieren.push('punto');
    if (ca.modo !== cb.modo) difieren.push('modo');
    if (ca.sonora !== cb.sonora) difieren.push('sonoridad');
    return { tipo: 'consonante', d: difieren.length, detalle: difieren.join('+') || 'idénticos' };
  }

  const va = VOCALES[a];
  const vb = VOCALES[b];
  if (va && vb) {
    const difieren = [];
    if (va.altura !== vb.altura) difieren.push('altura');
    if (va.anterior !== vb.anterior) difieren.push('anterioridad');
    if (va.redondeada !== vb.redondeada) difieren.push('redondeamiento');
    if (va.tenso !== vb.tenso) difieren.push('(tenso/laxo)');
    // La tensión se anota pero no suma: la escala se queda en 0..3.
    const d = difieren.filter((r) => !r.startsWith('(')).length;
    return { tipo: 'vocal', d, detalle: difieren.join('+') || 'idénticas' };
  }

  if ((ca && vb) || (va && cb)) {
    return { tipo: 'mixto', d: null, detalle: `${a} / ${b}` };
  }

  const faltan = [!ca && !va ? a : null, !cb && !vb ? b : null].filter(Boolean);
  return { tipo: 'desconocido', d: null, detalle: faltan.join(', ') };
}

/**
 * Parte el campo `phoneme` de un par ('r̄ → l', '/θ/ → /f/', 'tʃ ↔ s') en sus
 * dos símbolos. Devuelve null si no tiene la forma esperada.
 */
function partirContraste(texto) {
  const partes = String(texto).split(/\s*[→↔]\s*/); // → ↔
  if (partes.length !== 2) return null;
  return [partes[0].trim(), partes[1].trim()];
}

module.exports = { CONSONANTES, VOCALES, distancia, partirContraste, normalizar };

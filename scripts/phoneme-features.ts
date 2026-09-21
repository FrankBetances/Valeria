// ============================================================================
// Valeria+ · Matrices de Rasgos Distintivos Fonológicos (Portado de minpair)
// Define vectores de rasgos (Punto, Modo y Sonoridad) para auditar pares mínimos
// en las variedades: es, gl, ca, eu, en-US
// ============================================================================

export type PlaceOfArticulation =
  | 'bilabial'     // 1
  | 'labiodental'  // 2
  | 'interdental'  // 3
  | 'alveolar'     // 4
  | 'postalveolar' // 5
  | 'palatal'      // 6
  | 'velar'        // 7
  | 'glottal';     // 8

export type MannerOfArticulation =
  | 'stop'         // 1 (oclusiva)
  | 'fricative'    // 2 (fricativa)
  | 'affricate'    // 3 (africada)
  | 'nasal'        // 4 (nasal)
  | 'approximant'  // 5 (aproximante / líquida)
  | 'lateral'      // 6 (lateral)
  | 'trill';       // 7 (vibrante)

export interface PhonemeFeatureVector {
  symbol: string;
  place: PlaceOfArticulation;
  manner: MannerOfArticulation;
  voicing: 0 | 1; // 0 = sorda, 1 = sonora
}

export const PLACE_SCORES: Record<PlaceOfArticulation, number> = {
  bilabial: 1,
  labiodental: 2,
  interdental: 3,
  alveolar: 4,
  postalveolar: 5,
  palatal: 6,
  velar: 7,
  glottal: 8,
};

export const MANNER_SCORES: Record<MannerOfArticulation, number> = {
  stop: 1,
  fricative: 2,
  affricate: 3,
  nasal: 4,
  approximant: 5,
  lateral: 6,
  trill: 7,
};

/** Inventario fonológico de consonantes del español y lenguas ibéricas */
export const PHONEME_REGISTRY: Record<string, PhonemeFeatureVector> = {
  // Oclusivas
  p: { symbol: 'p', place: 'bilabial', manner: 'stop', voicing: 0 },
  b: { symbol: 'b', place: 'bilabial', manner: 'stop', voicing: 1 },
  t: { symbol: 't', place: 'alveolar', manner: 'stop', voicing: 0 },
  d: { symbol: 'd', place: 'alveolar', manner: 'stop', voicing: 1 },
  k: { symbol: 'k', place: 'velar', manner: 'stop', voicing: 0 },
  g: { symbol: 'g', place: 'velar', manner: 'stop', voicing: 1 },

  // Fricativas
  f: { symbol: 'f', place: 'labiodental', manner: 'fricative', voicing: 0 },
  v: { symbol: 'v', place: 'labiodental', manner: 'fricative', voicing: 1 },
  th: { symbol: 'θ', place: 'interdental', manner: 'fricative', voicing: 0 }, // z en distinción
  dh: { symbol: 'ð', place: 'interdental', manner: 'fricative', voicing: 1 },
  s: { symbol: 's', place: 'alveolar', manner: 'fricative', voicing: 0 },
  z: { symbol: 'z', place: 'alveolar', manner: 'fricative', voicing: 1 },    // catalán / en-US
  sh: { symbol: 'ʃ', place: 'postalveolar', manner: 'fricative', voicing: 0 }, // x gallega / sh catalana
  zh: { symbol: 'ʒ', place: 'postalveolar', manner: 'fricative', voicing: 1 }, // j catalana
  x: { symbol: 'x', place: 'velar', manner: 'fricative', voicing: 0 },        // j española
  h: { symbol: 'h', place: 'glottal', manner: 'fricative', voicing: 0 },

  // Africadas
  ch: { symbol: 'tʃ', place: 'postalveolar', manner: 'affricate', voicing: 0 },
  jh: { symbol: 'dʒ', place: 'postalveolar', manner: 'affricate', voicing: 1 },
  ts: { symbol: 'ts', place: 'alveolar', manner: 'affricate', voicing: 0 },   // euskera tz
  tz: { symbol: 'tɕ', place: 'palatal', manner: 'affricate', voicing: 0 },

  // Nasales
  m: { symbol: 'm', place: 'bilabial', manner: 'nasal', voicing: 1 },
  n: { symbol: 'n', place: 'alveolar', manner: 'nasal', voicing: 1 },
  ny: { symbol: 'ɲ', place: 'palatal', manner: 'nasal', voicing: 1 },        // ñ / nh
  ng: { symbol: 'ŋ', place: 'velar', manner: 'nasal', voicing: 1 },

  // Líquidas / Laterales
  l: { symbol: 'l', place: 'alveolar', manner: 'lateral', voicing: 1 },
  ll: { symbol: 'ʎ', place: 'palatal', manner: 'lateral', voicing: 1 },       // ll histórica / gallego / catalán

  // Vibrantes
  r: { symbol: 'ɾ', place: 'alveolar', manner: 'approximant', voicing: 1 },  // r simple (pero)
  rr: { symbol: 'r', place: 'alveolar', manner: 'trill', voicing: 1 },       // rr múltiple (perro)
};

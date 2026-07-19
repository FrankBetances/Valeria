// ============================================================================
// Valeria+ · Contenido del Test de Ling por VARIEDAD (locale)
// Los seis sonidos de Ling (m, u, a, i, sh, s) son UNIVERSALES: comprueban la
// audibilidad a distintas frecuencias, no la variedad de habla. Lo que cambia
// por variedad son las CONSIGNAS al tutor y las pistas (registro caribeño en
// es-DO · Quisqueya Habla, QH-2.4).
//
// Nota clínica es-DO: en dominicano la /s/ en coda se aspira o se elide de forma
// normal (guía QH-0.2 §3). Eso NO afecta al Test de Ling —que pide una /s/
// aislada, clara y sostenida— pero se recuerda al tutor para que produzca una
// ese nítida (no la del habla corriente) al testar ese sonido.
// ============================================================================

export interface LingSound { sym: string; say: string; freq: string; fc: string; hint: string; }
export interface LingCopy { instrBody: string; tip: string; }

// --------------------------- Base (es / gl) ---------------------------------
export const LING_SOUNDS: LingSound[] = [
  { sym: 'm',  say: '“mmm”',  freq: 'Grave · ~250 Hz',      fc: '#3b82f6', hint: 'Sonido nasal, vibración en los labios.' },
  { sym: 'u',  say: '“uuu”',  freq: 'Grave · ~300 Hz',      fc: '#3b82f6', hint: 'Vocal posterior, boca redondeada.' },
  { sym: 'a',  say: '“aaa”',  freq: 'Media · ~1 kHz',       fc: '#10b981', hint: 'Vocal abierta y central.' },
  { sym: 'i',  say: '“iii”',  freq: 'Media-aguda · ~2 kHz', fc: '#f59e0b', hint: 'Vocal cerrada anterior.' },
  { sym: 'sh', say: '“shhh”', freq: 'Aguda · ~3 kHz',       fc: '#f97316', hint: 'Fricativa, flujo de aire continuo.' },
  { sym: 's',  say: '“sss”',  freq: 'Muy aguda · ~5 kHz',   fc: '#ef4444', hint: 'Fricativa aguda — el sonido más difícil de oír.' },
];

export const LING_COPY: LingCopy = {
  instrBody: 'Que el niño no te lea los labios. Repite el sonido 2–3 veces y observa su reacción.',
  tip: 'El Test de Ling no usa el micrófono. Tú produces cada sonido y marcas cómo responde el niño.',
};

// ----------------------------- es-DO ----------------------------------------
export const LING_SOUNDS_ESDO: LingSound[] = [
  { sym: 'm',  say: '“mmm”',  freq: 'Grave · ~250 Hz',      fc: '#3b82f6', hint: 'Sonido nasal, con vibración en los labios.' },
  { sym: 'u',  say: '“uuu”',  freq: 'Grave · ~300 Hz',      fc: '#3b82f6', hint: 'Vocal de atrás, con la boca redondita.' },
  { sym: 'a',  say: '“aaa”',  freq: 'Media · ~1 kHz',       fc: '#10b981', hint: 'Vocal abierta, en el medio.' },
  { sym: 'i',  say: '“iii”',  freq: 'Media-aguda · ~2 kHz', fc: '#f59e0b', hint: 'Vocal cerrada, con la sonrisa estirada.' },
  { sym: 'sh', say: '“shhh”', freq: 'Aguda · ~3 kHz',       fc: '#f97316', hint: 'Como cuando mandas a callar: aire seguido.' },
  { sym: 's',  say: '“sss”',  freq: 'Muy aguda · ~5 kHz',   fc: '#ef4444', hint: 'La ese es el sonido más difícil de oír. Prodúcela BIEN CLARA y sostenida (sss), no como en el habla de todos los días, donde la ese se come.' },
];

export const LING_COPY_ESDO: LingCopy = {
  instrBody: 'Que el muchachito no te lea los labios. Repite el sonido 2 o 3 veces y fíjate cómo reacciona.',
  tip: 'El Test de Ling no usa el micrófono: tú haces cada sonido y marcas cómo responde el niño.',
};

export interface LingContent { sounds: LingSound[]; copy: LingCopy; }

export function lingContentForLocale(loc: string): LingContent {
  return loc === 'es-DO'
    ? { sounds: LING_SOUNDS_ESDO, copy: LING_COPY_ESDO }
    : { sounds: LING_SOUNDS, copy: LING_COPY };
}

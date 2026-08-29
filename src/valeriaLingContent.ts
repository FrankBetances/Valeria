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
// Unión DUPLICADA a propósito, igual que `ProsodyLocale` en
// valeriaSpeechProsody: importar de `valeriaUiLang` arrastraría AsyncStorage y
// este módulo dejaría de compilar en aislamiento, que es como lo ejecuta el
// gate check-adult-fields.js en Node. Si allí se añade un idioma, aquí falta
// una clave de los Record de abajo y el typecheck lo dice — que es el aviso
// que queremos.
type UiLang = 'es' | 'en' | 'ca';
const isUiLang = (v: unknown): v is UiLang => v === 'es' || v === 'en' || v === 'ca';

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

// ------------------------------- eu (euskera) -------------------------------
// Los seis sonidos son universales; en euskera cambian las consignas y pistas
// al tutor (batua). ✅ APROBADO PARA PRODUCCIÓN (revisión de Ulertuz · ILENIA/NEL-GAITU).
export const LING_SOUNDS_EU: LingSound[] = [
  { sym: 'm',  say: '“mmm”',  freq: 'Grabea · ~250 Hz',      fc: '#3b82f6', hint: 'Soinu sudurkaria, ezpainetan dardara.' },
  { sym: 'u',  say: '“uuu”',  freq: 'Grabea · ~300 Hz',      fc: '#3b82f6', hint: 'Atzeko bokala, ahoa biribilduta.' },
  { sym: 'a',  say: '“aaa”',  freq: 'Ertaina · ~1 kHz',      fc: '#10b981', hint: 'Bokal irekia eta erdikoa.' },
  { sym: 'i',  say: '“iii”',  freq: 'Ertain-zorrotza · ~2 kHz', fc: '#f59e0b', hint: 'Bokal itxia eta aurrekoa, irribarrea luzatuta.' },
  { sym: 'sh', say: '“xxx”',  freq: 'Zorrotza · ~3 kHz',     fc: '#f97316', hint: 'Frikaria, aire-jario jarraitua (euskarazko x).' },
  { sym: 's',  say: '“sss”',  freq: 'Oso zorrotza · ~5 kHz', fc: '#ef4444', hint: 'Frikari zorrotza — entzuten zailena den soinua.' },
];

export const LING_COPY_EU: LingCopy = {
  instrBody: 'Umeak ez dizula ezpainak irakurri. Errepikatu soinua 2-3 aldiz eta behatu bere erreakzioa.',
  tip: 'Ling Testak ez du mikrofonoa erabiltzen. Zuk soinu bakoitza egiten duzu eta umeak nola erantzuten duen markatzen duzu.',
};

// ------------------------------- ca (català) --------------------------------
// Los seis sonidos son universales (miden audibilidad por frecuencia), así que
// aquí solo se reescriben consignas y pistas. Todo esto lo lee el ADULTO: en
// esta pantalla la app no locuta nada.
export const LING_SOUNDS_CA: LingSound[] = [
  { sym: 'm',  say: '«mmm»',  freq: 'Greu · ~250 Hz',       fc: '#3b82f6', hint: 'So nasal: notaràs la vibració als llavis.' },
  { sym: 'u',  say: '«uuu»',  freq: 'Greu · ~300 Hz',       fc: '#3b82f6', hint: 'Vocal posterior, amb els llavis arrodonits.' },
  { sym: 'a',  say: '«aaa»',  freq: 'Mitjana · ~1 kHz',     fc: '#10b981', hint: 'Vocal oberta i central.' },
  { sym: 'i',  say: '«iii»',  freq: 'Mitjana-aguda · ~2 kHz', fc: '#f59e0b', hint: 'Vocal tancada anterior, amb el somriure estirat.' },
  { sym: 'sh', say: '«xxx»',  freq: 'Aguda · ~3 kHz',       fc: '#f97316', hint: 'Com quan mans callar: aire continu, llavis arrodonits.' },
  { sym: 's',  say: '«sss»',  freq: 'Molt aguda · ~5 kHz',  fc: '#ef4444', hint: 'Fricativa aguda: el so més difícil de sentir.' },
];

export const LING_COPY_CA: LingCopy = {
  instrBody: 'Que l\'infant no et llegeixi els llavis. Repeteix el so 2-3 vegades i observa com reacciona.',
  tip: 'El Test de Ling no fa servir el micròfon. Tu produeixes cada so i marques com respon l\'infant.',
};

// ------------------------------- en-US (inglés) -----------------------------
// Los seis sonidos son universales —miden audibilidad por frecuencia, no
// variedad de habla—, así que en inglés solo se reescriben las consignas y las
// pistas. Es el único bloque clínico del plan que de verdad se traduce, y por
// eso el plan lo separaba del resto (EN-3.7).
export const LING_SOUNDS_EN: LingSound[] = [
  { sym: 'm',  say: '“mmm”',  freq: 'Low · ~250 Hz',       fc: '#3b82f6', hint: 'Nasal sound; you feel the buzz in your lips.' },
  { sym: 'u',  say: '“ooo”',  freq: 'Low · ~300 Hz',       fc: '#3b82f6', hint: 'Back vowel, lips rounded, as in "boot".' },
  { sym: 'a',  say: '“aaa”',  freq: 'Mid · ~1 kHz',        fc: '#10b981', hint: 'Open central vowel, as in "father".' },
  { sym: 'i',  say: '“eee”',  freq: 'Mid-high · ~2 kHz',   fc: '#f59e0b', hint: 'Close front vowel with a wide smile, as in "see".' },
  { sym: 'sh', say: '“shhh”', freq: 'High · ~3 kHz',       fc: '#f97316', hint: 'Fricative, steady airflow — the "quiet down" sound.' },
  { sym: 's',  say: '“sss”',  freq: 'Very high · ~5 kHz',  fc: '#ef4444', hint: 'High fricative — the hardest sound to hear, and the first one lost.' },
];

export const LING_COPY_EN: LingCopy = {
  instrBody: 'Make sure your child cannot read your lips. Say the sound 2–3 times and watch how they react.',
  tip: 'The Ling check does not use the microphone. You make each sound and you score how your child responds.',
};

export interface LingContent { sounds: LingSound[]; copy: LingCopy; }

export function lingContentForLocale(loc: string): LingContent {
  if (loc === 'es-DO') return { sounds: LING_SOUNDS_ESDO, copy: LING_COPY_ESDO };
  if (loc === 'eu') return { sounds: LING_SOUNDS_EU, copy: LING_COPY_EU };
  if (loc === 'en-US') return { sounds: LING_SOUNDS_EN, copy: LING_COPY_EN };
  if (loc === 'ca') return { sounds: LING_SOUNDS_CA, copy: LING_COPY_CA };
  return { sounds: LING_SOUNDS, copy: LING_COPY };
}

// ---- Idioma de la interfaz: en el Test de Ling lo lee TODO el adulto -------
//
// Esta pantalla es el caso más limpio de los dos ejes (§5.1 del plan en-US):
// aquí la app NO locuta nada. Los seis sonidos los produce el adulto con su
// propia boca y él mismo marca la respuesta —lo dice el propio `tip`—, así que
// no hay ni una cadena dirigida al niño. Todo esto es interfaz.
//
// La grafía de `say` también: «uuu» y «ooo» cuan al MISMO fonema /u/, y cuál de
// las dos ayuda al adulto depende de en qué lengua lee, no de en qué lengua
// trabaja el niño. Los seis sonidos de Ling son universales por definición:
// miden audibilidad por frecuencia, no variedad de habla.
//
// Igual que `dbFor` en el banco de ejercicios, esto solo interviene cuando los
// dos ejes discrepan en el par es↔en. Con `gl` o `eu` no toca nada: ahí el
// adulto lee la interfaz en castellano y el contenido en su lengua, que es lo
// que ya hacía.
const LING_SOUNDS_BY_UI: Record<UiLang, LingSound[]> = {
  es: LING_SOUNDS, en: LING_SOUNDS_EN, ca: LING_SOUNDS_CA,
};
const LING_COPY_BY_UI: Record<UiLang, LingCopy> = {
  es: LING_COPY, en: LING_COPY_EN, ca: LING_COPY_CA,
};

// Lo único del Test de Ling que NO depende de en qué lengua lee el adulto sino
// de la variedad del NIÑO: en dominicano la /s/ en coda se aspira o se elide
// (guía QH-0.2 §3). El test pide una /s/ aislada, clara y sostenida, así que el
// aviso tiene que llegarle al adulto lea en la lengua que lea. Sin esto, una
// familia dominicana que pone la interfaz en inglés lo perdía.
const LING_S_HINT_ESDO: Record<UiLang, string> = {
  es: LING_SOUNDS_ESDO[5].hint,
  en: 'The /s/ is the hardest sound to hear. Produce it VERY CLEARLY and hold it (sss), '
    + 'not the way it comes out in everyday Dominican Spanish, where the final /s/ drops.',
  ca: 'La essa és el so més difícil de sentir. Produeix-la BEN CLARA i sostinguda (sss), '
    + 'no com surt en la parla dominicana de cada dia, on la essa final cau.',
};

// Contenido del Test de Ling para la variedad `loc` leído por un adulto cuya
// interfaz está en `uiLang`.
// Variedad que "pertenece" a cada idioma de interfaz: si el adulto lee en ese
// idioma y el niño trabaja en otra variedad, los textos —que aquí los lee TODOS
// el adulto— tienen que seguir al adulto. Escrito como tabla y no como pareja
// de condiciones, porque con tres idiomas las condiciones sueltas se olvidan.
const OWN_LOCALE_OF_UI: Record<UiLang, string> = { es: 'es', en: 'en-US', ca: 'ca' };

export function lingContentFor(loc: string, uiLang: string): LingContent {
  const ui: UiLang = isUiLang(uiLang) ? uiLang : 'es';
  // `es` es el caso especial: su "variedad propia" son las CUATRO
  // iberorrománicas (es, gl, eu, es-DO), que ya traen su copia en una lengua
  // que el adulto castellanohablante lee. Solo discrepa con en-US y con ca.
  const mismatch = ui === 'es'
    ? (loc === 'en-US' || loc === 'ca')
    : loc !== OWN_LOCALE_OF_UI[ui];
  if (!mismatch) return lingContentForLocale(loc);

  const sounds = LING_SOUNDS_BY_UI[ui];
  const copy = LING_COPY_BY_UI[ui];
  if (loc !== 'es-DO') return { sounds, copy };
  return {
    sounds: sounds.map((sn) => (sn.sym === 's' ? { ...sn, hint: LING_S_HINT_ESDO[ui] } : sn)),
    copy,
  };
}

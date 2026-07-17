// ============================================================================
// Valeria+ · Motor Combinatorio de Frases Portadoras — V1.0 (Fase 1.1)
// De estático a dinámico: la palabra objetivo del par mínimo ya no se dicta
// aislada; se incrusta en una "frase portadora" con prosodia continua
// ("El oso marrón encontró una rana en el jardín") seguida de una pregunta de
// elicitación que obliga al niño a recuperarla y producirla.
//
// Generación procedural: sujeto × verbo × cola se combinan con pasos coprimos
// sobre el índice de ensayo, así diez ensayos seguidos nunca repiten frase y
// el banco crece multiplicativamente sin tocar datos estáticos.
//
// Trade-off gestionado: la locución se hace con speakClinical (valeriaVoice),
// UNA sola cadena al motor TTS con pitch/rate conservadores. Trocear, acelerar
// o entonar la frase desplazaría la frecuencia del fonema objetivo incrustado.
// ============================================================================
import * as Speech from 'expo-speech';
import { speakClinical } from './valeriaVoice';

// ---- Metadatos léxicos de las palabras objetivo del banco de pares ----
// La concordancia (artículo/género) es imprescindible para que la frase
// portadora sea gramatical; 'numero' activa plantillas propias (contar, velas).
interface WordMeta { kind: 'sustantivo' | 'numero'; article?: 'un' | 'una'; }

const WORD_META: Record<string, WordMeta> = {
  rana: { kind: 'sustantivo', article: 'una' },
  perro: { kind: 'sustantivo', article: 'un' },
  rata: { kind: 'sustantivo', article: 'una' },
  cerro: { kind: 'sustantivo', article: 'un' },
  casa: { kind: 'sustantivo', article: 'una' },
  sierra: { kind: 'sustantivo', article: 'una' },
  ocho: { kind: 'numero' },
  cubo: { kind: 'sustantivo', article: 'un' },
  boca: { kind: 'sustantivo', article: 'una' },
  fuente: { kind: 'sustantivo', article: 'una' },
};

// ---- Bancos combinatorios ----
interface SubjectMeta { full: string; short: string; }
const SUBJECTS: SubjectMeta[] = [
  { full: 'El oso marrón', short: 'el oso' },
  { full: 'La abuela Rosa', short: 'la abuela' },
  { full: 'El pirata Simón', short: 'el pirata' },
  { full: 'Mi amiga Lola', short: 'mi amiga' },
  { full: 'El niño pequeño', short: 'el niño' },
];

// Verbo en pasado + interrogativo que lo devuelve en la pregunta de elicitación.
interface VerbMeta { past: string; ask: string; }
const VERBS: VerbMeta[] = [
  { past: 'encontró', ask: '¿Qué encontró' },
  { past: 'dibujó', ask: '¿Qué dibujó' },
  { past: 'vio', ask: '¿Qué vio' },
  { past: 'buscaba', ask: '¿Qué buscaba' },
  { past: 'guardó', ask: '¿Qué guardó' },
];

const TAILS = ['en el jardín', 'esta mañana', 'detrás de la puerta', 'en el paseo', ''];

// Plantillas para números: la estructura artículo+sustantivo no aplica.
const NUMBER_TEMPLATES: Array<{ build: (subj: string, n: string, tail: string) => string; ask: (short: string) => string }> = [
  {
    build: (subj, n, tail) => `${subj} contó despacio hasta el número ${n} ${tail}`.trim(),
    ask: (short) => `¿Hasta qué número contó ${short}?`,
  },
  {
    build: (subj, n) => `${subj} sopló ${n} velas en la tarta`,
    ask: (short) => `¿Cuántas velas sopló ${short}?`,
  },
  {
    build: (subj, n, tail) => `${subj} dio ${n} saltos muy grandes ${tail}`.trim(),
    ask: (short) => `¿Cuántos saltos dio ${short}?`,
  },
];

export interface CarrierPrompt {
  carrier: string;   // la frase portadora con el objetivo incrustado
  question: string;  // pregunta de elicitación (el niño produce el objetivo)
  full: string;      // texto completo que se locuta de una pieza
}

// Desplazamiento por montaje: dos sesiones seguidas del mismo par no arrancan
// con la misma combinación. Los pasos por índice son coprimos con los tamaños
// de banco (5, 5, 5, 3) → el recorrido no repite frase en una sesión de 10.
let mountOffset = Math.floor(Math.random() * 1000);
export const reseedCarriers = (): void => { mountOffset = Math.floor(Math.random() * 1000); };

export function buildCarrierPrompt(target: string, trialIdx: number): CarrierPrompt {
  const meta = WORD_META[target] ?? { kind: 'sustantivo' as const };
  const subj = SUBJECTS[(mountOffset + trialIdx * 2) % SUBJECTS.length];
  const tail = TAILS[(mountOffset + trialIdx) % TAILS.length];

  if (meta.kind === 'numero') {
    const tpl = NUMBER_TEMPLATES[(mountOffset + trialIdx) % NUMBER_TEMPLATES.length];
    const carrier = `${tpl.build(subj.full, target, tail)}.`;
    const question = `${tpl.ask(subj.short)} Dilo tú, fuerte y claro.`;
    return { carrier, question, full: `${carrier} ${question}` };
  }

  const verb = VERBS[(mountOffset + trialIdx * 3) % VERBS.length];
  const np = meta.article ? `${meta.article} ${target}` : target;
  const carrier = `${subj.full} ${verb.past} ${np}${tail ? ` ${tail}` : ''}.`;
  const question = `${verb.ask} ${subj.short}? Dilo tú, fuerte y claro.`;
  return { carrier, question, full: `${carrier} ${question}` };
}

// Locuta la frase portadora completa como UNA cadena continua con parámetros
// clínicos (ver speakClinical). onDone/onError se propagan al llamante.
export const speakCarrierPrompt = (
  prompt: CarrierPrompt,
  opts: Pick<Speech.SpeechOptions, 'onDone' | 'onError'> = {},
): void => speakClinical(prompt.full, opts);

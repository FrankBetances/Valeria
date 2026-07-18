// ============================================================================
// Valeria+ · Motor Combinatorio de Frases Portadoras — V2.0 (multi-idioma)
// De estático a dinámico: la palabra objetivo del par mínimo ya no se dicta
// aislada; se incrusta en una "frase portadora" con prosodia continua
// ("El oso marrón encontró una rana en el jardín" · "O oso marrón atopou
// unha rúa no xardín") seguida de una pregunta de elicitación.
//
// V2.0 (plan Proxecto Nós, GL-2.x): bancos combinatorios POR IDIOMA (es/gl)
// con concordancia propia. Nota lingüística gl: sin signos de apertura de
// interrogación (norma RAG) y elicitación con "Respóndelle ti".
//
// Generación procedural: sujeto × verbo × cola se combinan con pasos coprimos
// sobre el índice de ensayo; diez ensayos seguidos nunca repiten frase.
//
// Trade-off gestionado: la locución se hace con speakClinical (valeriaVoice),
// UNA sola cadena al motor TTS con pitch/rate conservadores. Trocear, acelerar
// o entonar la frase desplazaría la frecuencia del fonema objetivo incrustado.
//
// Módulo PURO (sin imports de RN/Expo): el corpus de voz lo enumera en
// build-time (Node) para pre-generar el audio neuronal de cada portadora.
// ============================================================================

export type CarrierLang = 'es' | 'gl';

// ---- Metadatos léxicos de las palabras objetivo por idioma ----
// La concordancia (artículo/género) es imprescindible para que la frase
// portadora sea gramatical; 'numero' activa plantillas propias (contar, velas).
interface WordMeta { kind: 'sustantivo' | 'numero'; article?: string; }
interface SubjectMeta { full: string; short: string; }
interface VerbMeta { past: string; ask: string; }
interface NumberTemplate { build: (subj: string, n: string, tail: string) => string; ask: (short: string) => string; }

interface CarrierBank {
  wordMeta: Record<string, WordMeta>;
  subjects: SubjectMeta[];
  verbs: VerbMeta[];
  tails: string[];
  numberTemplates: NumberTemplate[];
  elicit: string; // coletilla final de la pregunta de elicitación
}

const BANKS: Record<CarrierLang, CarrierBank> = {
  es: {
    wordMeta: {
      rana: { kind: 'sustantivo', article: 'una' },
      perro: { kind: 'sustantivo', article: 'un' },
      rata: { kind: 'sustantivo', article: 'una' },
      cerro: { kind: 'sustantivo', article: 'un' },
      casa: { kind: 'sustantivo', article: 'una' },
      sierra: { kind: 'sustantivo', article: 'una' },
      ocho: { kind: 'numero' },
      saco: { kind: 'sustantivo', article: 'un' }, // objetivo del banco es-DO
      cubo: { kind: 'sustantivo', article: 'un' },
      boca: { kind: 'sustantivo', article: 'una' },
      fuente: { kind: 'sustantivo', article: 'una' },
    },
    subjects: [
      { full: 'El oso marrón', short: 'el oso' },
      { full: 'La abuela Rosa', short: 'la abuela' },
      { full: 'El pirata Simón', short: 'el pirata' },
      { full: 'Mi amiga Lola', short: 'mi amiga' },
      { full: 'El niño pequeño', short: 'el niño' },
    ],
    verbs: [
      { past: 'encontró', ask: '¿Qué encontró' },
      { past: 'dibujó', ask: '¿Qué dibujó' },
      { past: 'vio', ask: '¿Qué vio' },
      { past: 'buscaba', ask: '¿Qué buscaba' },
      { past: 'guardó', ask: '¿Qué guardó' },
    ],
    tails: ['en el jardín', 'esta mañana', 'detrás de la puerta', 'en el paseo', ''],
    numberTemplates: [
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
    ],
    elicit: 'Dilo tú, fuerte y claro.',
  },
  gl: {
    // Objetivos del banco gallego de pares (valeriaMinimalPairsGl, BORRADOR).
    wordMeta: {
      'rúa': { kind: 'sustantivo', article: 'unha' },
      rei: { kind: 'sustantivo', article: 'un' },
      casa: { kind: 'sustantivo', article: 'unha' },
      cesta: { kind: 'sustantivo', article: 'unha' },
      cubo: { kind: 'sustantivo', article: 'un' },
      boca: { kind: 'sustantivo', article: 'unha' },
      fonte: { kind: 'sustantivo', article: 'unha' },
    },
    subjects: [
      { full: 'O oso marrón', short: 'o oso' },
      { full: 'A avoa Rosa', short: 'a avoa' },
      { full: 'O pirata Simón', short: 'o pirata' },
      { full: 'A miña amiga Lola', short: 'a miña amiga' },
      { full: 'O neno pequeno', short: 'o neno' },
    ],
    verbs: [
      { past: 'atopou', ask: 'Que atopou' },
      { past: 'debuxou', ask: 'Que debuxou' },
      { past: 'viu', ask: 'Que viu' },
      { past: 'buscaba', ask: 'Que buscaba' },
      { past: 'gardou', ask: 'Que gardou' },
    ],
    tails: ['no xardín', 'esta mañá', 'detrás da porta', 'no paseo', ''],
    numberTemplates: [], // sin objetivos numéricos en el banco gl
    elicit: 'Respóndelle ti, forte e claro.',
  },
};

export interface CarrierPrompt {
  carrier: string;   // la frase portadora con el objetivo incrustado
  question: string;  // pregunta de elicitación (el niño produce el objetivo)
  full: string;      // texto completo que se locuta de una pieza
}

// Desplazamiento por montaje: dos sesiones seguidas del mismo par no arrancan
// con la misma combinación. Los pasos por índice son coprimos con los tamaños
// de banco (5, 5, 5 y 3) → el recorrido no repite frase en una sesión de 10.
let mountOffset = Math.floor(Math.random() * 1000);
export const reseedCarriers = (): void => { mountOffset = Math.floor(Math.random() * 1000); };

// Núcleo determinista: misma combinación para el mismo (offset, target, idx).
// Lo comparten el juego (offset aleatorio por sesión) y el enumerador del
// corpus de voz (que recorre TODOS los offsets alcanzables).
function buildWithOffset(offset: number, target: string, trialIdx: number, lang: CarrierLang): CarrierPrompt {
  const bank = BANKS[lang];
  const meta = bank.wordMeta[target] ?? { kind: 'sustantivo' as const };
  const subj = bank.subjects[(offset + trialIdx * 2) % bank.subjects.length];
  const tail = bank.tails[(offset + trialIdx) % bank.tails.length];

  if (meta.kind === 'numero' && bank.numberTemplates.length > 0) {
    const tpl = bank.numberTemplates[(offset + trialIdx) % bank.numberTemplates.length];
    const carrier = `${tpl.build(subj.full, target, tail)}.`;
    const question = `${tpl.ask(subj.short)} ${bank.elicit}`;
    return { carrier, question, full: `${carrier} ${question}` };
  }

  const verb = bank.verbs[(offset + trialIdx * 3) % bank.verbs.length];
  const np = meta.article ? `${meta.article} ${target}` : target;
  const carrier = `${subj.full} ${verb.past} ${np}${tail ? ` ${tail}` : ''}.`;
  const question = `${verb.ask} ${subj.short}? ${bank.elicit}`;
  return { carrier, question, full: `${carrier} ${question}` };
}

export const buildCarrierPrompt = (target: string, trialIdx: number, lang: CarrierLang = 'es'): CarrierPrompt =>
  buildWithOffset(mountOffset, target, trialIdx, lang);

// Enumeración EXHAUSTIVA para el corpus de voz (build-time): recorre por
// fuerza bruta offsets × ensayos y deduplica por texto. Los índices internos
// operan módulo tamaños de banco (5, 5, 5 y 3), así que offset 0-29 y ensayo
// 0-29 cubren todas las clases de congruencia alcanzables aunque las fórmulas
// de paso cambien; el Set absorbe la redundancia. Solo en build-time.
export function enumerateAllCarrierPrompts(lang: CarrierLang = 'es', targets?: string[]): CarrierPrompt[] {
  const words = targets ?? Object.keys(BANKS[lang].wordMeta);
  const seen = new Set<string>();
  const out: CarrierPrompt[] = [];
  for (const target of words) {
    for (let offset = 0; offset < 30; offset++) {
      for (let idx = 0; idx < 30; idx++) {
        const p = buildWithOffset(offset, target, idx, lang);
        if (!seen.has(p.full)) { seen.add(p.full); out.push(p); }
      }
    }
  }
  return out;
}

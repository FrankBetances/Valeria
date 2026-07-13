// ============================================================================
// Valeria+ · Motor de Voz (V6.0)
// Fuente única para hablar y escuchar en toda la app:
//   · Síntesis de voz (TTS) con expo-speech: la app lee consignas, palabras
//     objetivo y las órdenes de las Cápsulas TPR en español (es-ES).
//     La voz se elige entre las instaladas priorizando las neuronales /
//     "enhanced", y cada locución se trocea por frases con micro-variaciones
//     de tono y pausas de respiración para sonar humana, no robótica.
//   · Reconocimiento de voz (ASR) con @react-native-voice/voice: juegos de
//     micrófono donde el niño repite la palabra y la app valora el intento.
//
// Degradación elegante: el ASR es un módulo nativo (no existe en Expo Go).
// Si no está disponible, asrSupported() devuelve false y las pantallas ocultan
// el juego de micrófono; el TTS funciona siempre.
// ============================================================================
import { PermissionsAndroid, Platform } from 'react-native';
import * as Speech from 'expo-speech';

const LANG = 'es-ES';

// ----------------------------------------------------------------------------
// Selección de voz: el motor TTS del sistema suele traer varias voces es-*.
// Las marcadas como "Enhanced" (iOS) o las variantes neuronales de alta calidad
// de Google TTS (Android) suenan mucho más naturales que la voz de fábrica;
// las voces antiguas tipo "eloquence"/"compact"/eSpeak suenan a robot y se
// penalizan. Se busca la mejor una sola vez y se aplica a todas las locuciones.
// ----------------------------------------------------------------------------
let bestVoiceId: string | undefined;
let bestVoice: Speech.Voice | null = null;
let esVoicesFound = 0;
let voiceSearch: Promise<void> | null = null;

// Familias neuronales modernas: marcadores por nombre (Google, Samsung,
// iOS 17+) y el patrón de las voces neuronales de Google TTS en Android
// (p. ej. "es-es-x-eed-local"), que no llevan la palabra "neural" en el id.
const NEURAL_RE = /(neural|natural|premium|wavenet|studio|journey|enhanced)|-x-[a-z]{3}-(local|network)/;
// Motores heredados notoriamente metálicos.
const LEGACY_RE = /(eloquence|compact|espeak|pico)/;

const scoreVoice = (v: Speech.Voice): number => {
  const lang = (v.language ?? '').toLowerCase().replace('_', '-');
  if (!lang.startsWith('es')) return -1;
  const id = `${v.identifier ?? ''} ${v.name ?? ''}`.toLowerCase();
  // Prioridad de idioma: castellano (es-ES) > variantes latinas > resto es-*.
  let s = lang === 'es-es' ? 4 : /^es-(us|mx|419)/.test(lang) ? 3 : 2;
  if (v.quality === Speech.VoiceQuality.Enhanced) s += 6;
  if (NEURAL_RE.test(id)) s += 4;
  // Voces iOS de alta calidad conocidas para es-ES / es-MX.
  if (/(m[oó]nica|marisol|paulina|siri)/.test(id)) s += 2;
  // Voces de alta calidad de Google TTS: las "-local" funcionan sin conexión;
  // las "network" suenan aún mejor pero exigen datos, mejor como desempate.
  if (id.includes('local')) s += 2;
  if (id.includes('network')) s += 1;
  // Motores heredados: solo como último recurso.
  if (LEGACY_RE.test(id)) s -= 6;
  return s;
};

const findBestVoice = async (attempt = 0): Promise<void> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices?.length) {
      // En Android el motor TTS tarda en poblar el catálogo tras el arranque:
      // se reintenta con espera creciente antes de rendirse hasta la próxima
      // locución. Reintentos cortos: la primera locución solo espera 300 ms al
      // catálogo, y cuanto antes se puntúe, antes deja de sonar la voz de
      // fábrica (la voz elegida se aplica frase a frase).
      if (attempt < 4) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        return findBestVoice(attempt + 1);
      }
      voiceSearch = null;
      return;
    }
    let best: Speech.Voice | undefined;
    let bestScore = 0;
    let found = 0;
    for (const v of voices) {
      const s = scoreVoice(v);
      if (s >= 0) found += 1;
      if (s > bestScore) { best = v; bestScore = s; }
    }
    esVoicesFound = found;
    bestVoice = best ?? null;
    bestVoiceId = best?.identifier;
  } catch (e) {
    voiceSearch = null; // sin catálogo de voces: seguir con la voz por defecto
  }
};

// ----------------------------------------------------------------------------
// Diagnóstico del motor: qué voz se eligió y de qué calidad es. Lo usa la
// tarjeta "Voz de la app" para detectar tablets con voz robótica y guiar a la
// familia a instalar las voces neuronales de Google (o descargar la voz
// mejorada en iOS). `refreshVoiceCatalog` re-escanea tras instalar voces.
// ----------------------------------------------------------------------------
export type VoiceTier = 'neural' | 'estandar' | 'basica' | 'desconocida';

export interface VoiceStatus {
  tier: VoiceTier;
  name: string;        // nombre legible de la voz elegida ('' si no hay)
  language: string;
  voicesFound: number; // voces en español detectadas en el catálogo
}

export const getVoiceStatus = (): VoiceStatus => {
  if (!bestVoice) return { tier: 'desconocida', name: '', language: '', voicesFound: esVoicesFound };
  const id = `${bestVoice.identifier ?? ''} ${bestVoice.name ?? ''}`.toLowerCase();
  const tier: VoiceTier = LEGACY_RE.test(id)
    ? 'basica'
    : bestVoice.quality === Speech.VoiceQuality.Enhanced || NEURAL_RE.test(id)
      ? 'neural'
      : 'estandar';
  return {
    tier,
    name: bestVoice.name ?? bestVoice.identifier ?? '',
    language: bestVoice.language ?? '',
    voicesFound: esVoicesFound,
  };
};

// Re-escanea el catálogo de voces (p. ej. al volver de instalar las voces de
// Google desde la tarjeta "Voz de la app") y devuelve el nuevo estado.
export const refreshVoiceCatalog = async (): Promise<VoiceStatus> => {
  voiceSearch = findBestVoice();
  await voiceSearch;
  return getVoiceStatus();
};

const ensureBestVoice = () => {
  if (!voiceSearch) voiceSearch = findBestVoice();
};
ensureBestVoice(); // calentamiento al importar el módulo

// ----------------------------------------------------------------------------
// Síntesis de voz (TTS) con prosodia natural
// Una locución larga leída de un tirón con tono plano es lo que suena "a
// máquina". Aquí cada texto se trocea por frases y cada frase se locuta con:
//   · una pausa corta de "respiración" entre frases,
//   · tono algo más alto en exclamaciones y preguntas (entonación real),
//   · una micro-variación determinista de tono para que dos frases seguidas
//     nunca suenen idénticas.
// onDone/onError del llamante se disparan una sola vez al acabar la cadena.
// ----------------------------------------------------------------------------
let speakToken = 0; // invalida cadenas de frases pendientes al preemptar

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const splitSentences = (text: string): string[] => {
  const parts = text.match(/[^.!?…]+[.!?…]*/g);
  const out = (parts ?? [text]).map((p) => p.trim()).filter(Boolean);
  return out.length ? out : [text];
};

const speakChain = (text: string, opts: Speech.SpeechOptions, token: number) => {
  const { onDone, onError, ...rest } = opts;
  const sentences = splitSentences(text);
  const baseRate = rest.rate ?? 0.92;
  const basePitch = rest.pitch ?? 1.0;

  const sayFrom = (i: number) => {
    if (token !== speakToken) return; // otra locución tomó el relevo
    if (i >= sentences.length) { onDone?.(); return; }
    const sentence = sentences[i];
    const excited = /[!¡]/.test(sentence);
    const asking = /[?¿]/.test(sentence);
    const jitter = (((i * 7) % 5) - 2) * 0.012; // micro-variación determinista
    Speech.speak(sentence, {
      language: LANG,
      ...rest,
      rate: clamp(baseRate + (excited ? 0.03 : 0) + jitter * 0.5, 0.4, 1.3),
      pitch: clamp(basePitch + (excited ? 0.06 : asking ? 0.05 : 0) + jitter, 0.7, 1.45),
      ...(bestVoiceId && !rest.voice ? { voice: bestVoiceId } : {}),
      onDone: () => {
        if (token !== speakToken) return;
        if (i + 1 >= sentences.length) { onDone?.(); return; }
        // Respiración corta entre frases: los testers notaban demasiado delay
        // en los apoyos de voz, así que la pausa se mantiene mínima.
        setTimeout(() => sayFrom(i + 1), 110);
      },
      onError: (e) => { if (token === speakToken) onError?.(e); },
    });
  };
  sayFrom(0);
};

export const speak = (text: string, opts: Speech.SpeechOptions = {}) => {
  ensureBestVoice();
  const token = ++speakToken;
  Speech.stop();
  const go = () => { if (token === speakToken) speakChain(text, opts, token); };
  if (bestVoiceId === undefined && voiceSearch) {
    // Primera locución: espera brevemente al catálogo de voces para no
    // arrancar con la voz de fábrica; con tope corto para que el apoyo de
    // voz no llegue tarde (feedback de testers: el delay confunde).
    Promise.race([voiceSearch, new Promise((r) => setTimeout(r, 300))]).then(go, go);
  } else {
    go();
  }
};

// Voz "cuentacuentos" para dirigirse al niño: algo más aguda y pausada.
export const speakToChild = (text: string, opts: Speech.SpeechOptions = {}) =>
  speak(text, { pitch: 1.15, rate: 0.85, ...opts });

// Frase de prueba para que la familia escuche la voz elegida.
export const speakVoiceSample = () =>
  speakToChild('¡Hola! Así sonará mi voz en los ejercicios. ¿Verdad que suena bien?');

// Palabra objetivo bien articulada, muy despacio (modelado fonético).
export const speakWordSlow = (text: string) =>
  speak(text.toLowerCase(), { pitch: 1.1, rate: 0.6 });

export const stopSpeaking = () => { speakToken += 1; Speech.stop(); };

// ----------------------------------------------------------------------------
// Bancos de frases: oír siempre el mismo "¡Muy bien!" aburre y suena enlatado.
// Cada categoría rota entre variantes sin repetir dos veces seguidas la misma.
// ----------------------------------------------------------------------------
const PRAISE_BANK = [
  '¡Muy bien! ¡Lo has dicho genial!',
  '¡Bravo! ¡Qué bien ha sonado!',
  '¡Toma ya! ¡Palabra conseguida!',
  '¡Genial! ¡Cada vez te sale mejor!',
  '¡Súper! ¡Lo dijiste clarísimo!',
  '¡Olé esa voz! ¡Muy bien dicho!',
];
const ALMOST_BANK = [
  '¡Casi casi! Escucha bien y otra vez…',
  '¡Uy, por poquito! Vamos a probar de nuevo.',
  '¡Ya casi lo tienes! Escucha y repite.',
  'Un poquito más y lo bordas. ¡Otra vez!',
];
const NO_HEAR_BANK = [
  'No te escuché bien. ¡Probamos otra vez!',
  '¡Uy, no llegó tu voz! Acércate y repetimos.',
  'Se me escapó tu palabra. ¡Dímela otra vez!',
];
const TOGETHER_BANK = [
  'Vamos a decirla juntos, muy despacito.',
  'La decimos a la vez, despacito y sin prisa.',
  'Ahora en equipo: la decimos los dos juntos.',
];

const lastPick: Record<string, number> = {};
const pickPhrase = (key: string, bank: string[]): string => {
  let i = Math.floor(Math.random() * bank.length);
  if (bank.length > 1 && i === lastPick[key]) i = (i + 1) % bank.length;
  lastPick[key] = i;
  return bank[i];
};

export const praisePhrase = () => pickPhrase('praise', PRAISE_BANK);
export const almostPhrase = () => pickPhrase('almost', ALMOST_BANK);
export const noHearPhrase = () => pickPhrase('noHear', NO_HEAR_BANK);
export const togetherPhrase = () => pickPhrase('together', TOGETHER_BANK);

// ----------------------------------------------------------------------------
// Reconocimiento de voz (ASR) — opcional según plataforma/build
// ----------------------------------------------------------------------------
let Voice: any = null;
try {
  // Carga perezosa: en Expo Go el módulo nativo no existe y el require falla.
  Voice = require('@react-native-voice/voice').default;
  if (!Voice || typeof Voice.start !== 'function') Voice = null;
} catch (e) {
  Voice = null;
}

export const asrSupported = (): boolean => Voice != null;

export interface ListenCallbacks {
  onPartial?: (text: string) => void;
  onResult: (alternatives: string[]) => void;
  onError: (message: string) => void;
  onEnd?: () => void;
}

// Inicia una escucha en español. Devuelve false si no se pudo empezar.
export async function startListening(cb: ListenCallbacks): Promise<boolean> {
  if (!Voice) {
    cb.onError('El reconocimiento de voz no está disponible en este dispositivo.');
    return false;
  }
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Micrófono para los juegos de voz',
          message: 'Valeria+ necesita el micrófono para escuchar la palabra que dice el niño.',
          buttonPositive: 'Permitir',
          buttonNegative: 'Ahora no',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        cb.onError('Concede el permiso de micrófono para jugar con la voz.');
        return false;
      }
    } catch (e) {
      cb.onError('No se pudo pedir el permiso de micrófono.');
      return false;
    }
  }
  try {
    Voice.onSpeechPartialResults = (e: any) => {
      if (e?.value?.length) cb.onPartial?.(String(e.value[0]));
    };
    Voice.onSpeechResults = (e: any) => cb.onResult((e?.value ?? []).map(String));
    Voice.onSpeechError = (e: any) =>
      cb.onError(e?.error?.message ? 'No te escuché bien. ¡Probamos otra vez!' : 'No se pudo escuchar.');
    Voice.onSpeechEnd = () => cb.onEnd?.();
    stopSpeaking(); // que la app no se escuche a sí misma
    await Voice.start(LANG);
    return true;
  } catch (e) {
    cb.onError('No se pudo iniciar el micrófono. Inténtalo de nuevo.');
    return false;
  }
}

export async function stopListening(): Promise<void> {
  if (!Voice) return;
  try { await Voice.stop(); } catch (e) { /* noop */ }
}

// Libera el reconocedor y sus listeners (llamar al desmontar la pantalla).
export async function releaseListening(): Promise<void> {
  if (!Voice) return;
  try {
    await Voice.destroy();
    Voice.removeAllListeners?.();
  } catch (e) { /* noop */ }
}

// ----------------------------------------------------------------------------
// Valoración del intento: comparación tolerante entre lo oído y el objetivo
// ----------------------------------------------------------------------------
export const normalizeSpeech = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zñ0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const editDistance = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
};

export type MatchLevel = 0 | 1 | 2; // 0 = no coincide · 1 = casi · 2 = ¡lo dijo!

// Compara las alternativas del reconocedor con la palabra/frase objetivo.
// Tolera acentos, mayúsculas y una letra de diferencia por palabra (niños en
// rehabilitación no articulan perfecto: premiamos la aproximación).
// Evaluación de PAR MÍNIMO: los pares se eligen para que el error de
// sustitución habitual produzca exactamente la otra palabra del par (rotacismo:
// pido "rana" → dice /lána/ → el ASR capta "lana"). Detectar el error es, por
// tanto, reconocer la palabra contraria. El objetivo solo puntúa con
// coincidencia exacta (nivel 2) para mitigar la autocorrección del ASR hacia
// palabras frecuentes; el padre siempre puede corregir el veredicto en la UI.
export type PairResult = 'target' | 'foil' | 'close' | 'none';

export function matchPair(alternatives: string[], target: string, foil: string): PairResult {
  if (matchTarget(alternatives, target) === 2) return 'target';
  if (matchTarget(alternatives, foil) === 2) return 'foil';
  return matchTarget(alternatives, target) === 1 ? 'close' : 'none';
}

// Evaluación contra una LISTA de strings válidos (stt_expected_array de la
// Expansión Semántica): la palabra objetivo y sus aproximaciones fonéticas
// propias de la edad conviven en el mismo array. Devuelve el mejor nivel
// alcanzado por cualquiera de ellas (2 = alguna coincidió; 1 = alguna casi).
export function matchExpected(alternatives: string[], expected: string[]): MatchLevel {
  let best: MatchLevel = 0;
  for (const e of expected) {
    const lvl = matchTarget(alternatives, e);
    if (lvl === 2) return 2;
    if (lvl > best) best = lvl;
  }
  return best;
}

export function matchTarget(alternatives: string[], target: string): MatchLevel {
  const t = normalizeSpeech(target);
  if (!t) return 0;
  const tWords = t.split(' ');
  let best: MatchLevel = 0;
  for (const alt of alternatives) {
    const h = normalizeSpeech(alt);
    if (!h) continue;
    if (h === t || h.includes(t)) return 2;
    const hWords = h.split(' ');
    const hits = tWords.filter((tw) =>
      hWords.some((hw) => hw === tw || (tw.length > 3 && editDistance(hw, tw) <= 1)),
    ).length;
    if (hits === tWords.length) return 2;
    if (hits > 0) best = 1;
    else if (t.length > 3 && hWords.some((hw) => editDistance(hw, t) <= 2)) best = 1;
  }
  return best;
}

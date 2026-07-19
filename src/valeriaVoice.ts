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
import {
  PRAISE_BANK, ALMOST_BANK, NO_HEAR_BANK, TOGETHER_BANK, VOICE_SAMPLE_PHRASE,
} from './valeriaPhraseBank';
import {
  VOICE_SAMPLE_PHRASE_GL,
  PRAISE_BANK_GL, ALMOST_BANK_GL, NO_HEAR_BANK_GL, TOGETHER_BANK_GL,
} from './valeriaContentGl';
import { voiceCorpusId, VoiceStyle } from './valeriaVoiceCorpus';
import { VOICE_ASSETS } from './valeriaVoiceAssets';
import { playVoiceAsset, stopVoiceAsset } from './valeriaVoicePlayback';
import { getLocale, assetLang, speechLocale, prefersLatinVoice } from './valeriaLocale';

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
  // Prioridad de idioma según la variedad activa. En dominicano (es-DO)
  // priorizamos voces latinas (es-US/es-MX/es-DO); en el resto, castellano.
  const latin = /^es-(us|mx|do|419)/.test(lang);
  let s = prefersLatinVoice()
    ? (latin ? 4 : lang === 'es-es' ? 2 : 3)
    : (lang === 'es-es' ? 4 : latin ? 3 : 2);
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
      language: speechLocale(),
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

// ----------------------------------------------------------------------------
// Voz neuronal pre-generada (plan ILENIA/Nós, Fase 1): si el texto (con su
// estilo) está en el mapa VOICE_ASSETS, se reproduce el audio horneado en
// build-time — acústica idéntica en todos los dispositivos del piloto — y
// expo-speech ni arranca. Si no hay asset (mapa vacío en Fase 1, deriva de
// texto, error del módulo nativo), se cae al motor del sistema: la calidad
// degrada, la sesión jamás se rompe.
// ----------------------------------------------------------------------------
const trySpokenAsset = (style: VoiceStyle, text: string, opts: Speech.SpeechOptions): boolean => {
  // Solo las variedades con banco pregenerado (es→Sharvard, gl→Celtia) buscan
  // asset; el dominicano (es-DO) usa la voz del sistema, así que assetLang() es
  // null y siempre cae a expo-speech con el locale latino.
  const al = assetLang();
  if (al == null) return false;
  const source = VOICE_ASSETS[voiceCorpusId(style, text, al)];
  if (source == null) return false;
  const token = ++speakToken; // preempta cadenas de expo-speech pendientes
  Speech.stop();
  return playVoiceAsset(source, {
    onDone: () => { if (token === speakToken) opts.onDone?.(); },
    // El rescate de las pantallas (afterSpeak) también cubre este camino.
    onError: () => { if (token === speakToken) (opts.onError as ((e: unknown) => void) | undefined)?.(new Error('voice asset playback failed')); },
  });
};

const speakEngine = (text: string, opts: Speech.SpeechOptions = {}) => {
  ensureBestVoice();
  const token = ++speakToken;
  Speech.stop();
  stopVoiceAsset();
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

export const speak = (text: string, opts: Speech.SpeechOptions = {}) => {
  if (trySpokenAsset('tutor', text, opts)) return;
  speakEngine(text, opts);
};

// Voz "cuentacuentos" para dirigirse al niño: algo más aguda y pausada.
export const speakToChild = (text: string, opts: Speech.SpeechOptions = {}) => {
  if (trySpokenAsset('child', text, opts)) return;
  speakEngine(text, { pitch: 1.15, rate: 0.85, ...opts });
};

// Locuta VARIAS piezas en secuencia, cada una resuelta por separado como asset
// neuronal. Motivo: frases como «palabra» + un refuerzo ALEATORIO no se pueden
// pre-hornear como una sola cadena (la combinación no existe en el corpus), así
// que se troceaban a la voz del sistema — el "salto" de voz que rompe la
// dinámica. Al reproducirlas encadenadas, cada trozo (la palabra, el elogio…)
// resuelve su propio asset y toda la secuencia suena con la voz neuronal.
export const speakToChildSeq = (parts: string[], opts: Speech.SpeechOptions = {}) => {
  const items = parts.map((p) => p.trim()).filter(Boolean);
  if (!items.length) { opts.onDone?.(); return; }
  const sayFrom = (i: number) => {
    if (i >= items.length) { opts.onDone?.(); return; }
    speakToChild(items[i], {
      onDone: () => sayFrom(i + 1),
      onError: (e) => { if (i + 1 >= items.length) opts.onError?.(e); else sayFrom(i + 1); },
    });
  };
  sayFrom(0);
};

// Voz CLÍNICA para frases portadoras y órdenes morfosintácticas: UNA sola
// locución continua (sin trocear por frases, sin jitter ni subidas de tono en
// exclamaciones). Acelerar o entonar la frase desplaza la frecuencia del
// fonema objetivo incrustado, así que pitch/rate se fijan conservadores y el
// texto se entrega entero al motor para que la prosodia sea la natural de la
// voz neuronal, no la nuestra. Participa en la preempción de speak().
export const speakClinical = (text: string, opts: Speech.SpeechOptions = {}) => {
  if (trySpokenAsset('clinical', text, opts)) return;
  ensureBestVoice();
  const token = ++speakToken;
  Speech.stop();
  stopVoiceAsset();
  const go = () => {
    if (token !== speakToken) return;
    const { onDone, onError, ...rest } = opts;
    Speech.speak(text, {
      language: speechLocale(),
      ...rest,
      rate: clamp(rest.rate ?? 0.8, 0.6, 0.9),   // techo bajo: nunca acelera el fonema
      pitch: clamp(rest.pitch ?? 1.0, 0.9, 1.1), // tono plano y estable
      ...(bestVoiceId && !rest.voice ? { voice: bestVoiceId } : {}),
      onDone: () => { if (token === speakToken) onDone?.(); },
      onError: (e) => { if (token === speakToken) onError?.(e); },
    });
  };
  if (bestVoiceId === undefined && voiceSearch) {
    Promise.race([voiceSearch, new Promise((r) => setTimeout(r, 300))]).then(go, go);
  } else {
    go();
  }
};

// Frase de prueba para que la familia escuche la voz elegida. En galego usa
// la muestra propia, que resuelve el asset neuronal de Celtia (id gl_*).
export const speakVoiceSample = () =>
  speakToChild(getLocale() === 'gl' ? VOICE_SAMPLE_PHRASE_GL : VOICE_SAMPLE_PHRASE);

// Palabra objetivo bien articulada, muy despacio (modelado fonético).
export const speakWordSlow = (text: string) => {
  const t = text.toLowerCase();
  if (trySpokenAsset('slow', t, {})) return;
  speakEngine(t, { pitch: 1.1, rate: 0.6 });
};

export const stopSpeaking = () => { speakToken += 1; Speech.stop(); stopVoiceAsset(); };

// ----------------------------------------------------------------------------
// Bancos de frases: oír siempre el mismo "¡Muy bien!" aburre y suena enlatado.
// Cada categoría rota entre variantes sin repetir dos veces seguidas la misma.
// Los DATOS viven en valeriaPhraseBank (módulo puro, enumerable por el corpus
// de voz en build-time); aquí solo queda la rotación.
// ----------------------------------------------------------------------------

const lastPick: Record<string, number> = {};
const pickPhrase = (key: string, bank: string[]): string => {
  let i = Math.floor(Math.random() * bank.length);
  if (bank.length > 1 && i === lastPick[key]) i = (i + 1) % bank.length;
  lastPick[key] = i;
  return bank[i];
};

// Bancos por variedad: en galego rotan las variantes gl (que suenan con Celtia
// porque están en el corpus); es/es-DO usan los castellanos (es-DO con la voz
// del sistema). Mismas longitudes por categoría, así la anti-repetición vale.
const isGl = () => getLocale() === 'gl';
export const praisePhrase = () => pickPhrase('praise', isGl() ? PRAISE_BANK_GL : PRAISE_BANK);
export const almostPhrase = () => pickPhrase('almost', isGl() ? ALMOST_BANK_GL : ALMOST_BANK);
export const noHearPhrase = () => pickPhrase('noHear', isGl() ? NO_HEAR_BANK_GL : NO_HEAR_BANK);
export const togetherPhrase = () => pickPhrase('together', isGl() ? TOGETHER_BANK_GL : TOGETHER_BANK);

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
    await Voice.start(speechLocale());
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

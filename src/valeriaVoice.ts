// ============================================================================
// Valeria+ · Motor de Voz (V5.1)
// Fuente única para hablar y escuchar en toda la app:
//   · Síntesis de voz (TTS) con expo-speech: la app lee consignas, palabras
//     objetivo y las órdenes de las Cápsulas TPR en español (es-ES).
//     La voz se elige entre las instaladas en el dispositivo priorizando las
//     de calidad "enhanced"/neuronales, mucho más naturales que la de fábrica.
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
// Las marcadas como "Enhanced" (iOS) o las variantes locales de alta calidad
// de Google TTS (Android) suenan mucho más naturales que la voz por defecto.
// Se busca la mejor una sola vez y se aplica a todas las locuciones.
// ----------------------------------------------------------------------------
let bestVoiceId: string | undefined;
let voiceSearch: Promise<void> | null = null;

const scoreVoice = (v: Speech.Voice): number => {
  const lang = (v.language ?? '').toLowerCase().replace('_', '-');
  if (!lang.startsWith('es')) return -1;
  const id = `${v.identifier ?? ''} ${v.name ?? ''}`.toLowerCase();
  // Prioridad de idioma: castellano (es-ES) > variantes latinas > resto es-*.
  let s = lang === 'es-es' ? 4 : /^es-(us|mx|419)/.test(lang) ? 3 : 2;
  if (v.quality === Speech.VoiceQuality.Enhanced) s += 4;
  // Voces de alta calidad de Google TTS: las "-local" funcionan sin conexión;
  // las "network" suenan aún mejor pero exigen datos, mejor como desempate.
  if (id.includes('local')) s += 2;
  if (id.includes('network')) s += 1;
  if (id.includes('neural') || id.includes('natural') || id.includes('premium')) s += 2;
  return s;
};

const findBestVoice = async (): Promise<void> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices?.length) {
      // En Android el motor TTS puede no estar listo al arrancar: se
      // reintenta en la próxima locución.
      voiceSearch = null;
      return;
    }
    let best: Speech.Voice | undefined;
    let bestScore = 0;
    for (const v of voices) {
      const s = scoreVoice(v);
      if (s > bestScore) { best = v; bestScore = s; }
    }
    bestVoiceId = best?.identifier;
  } catch (e) {
    voiceSearch = null; // sin catálogo de voces: seguir con la voz por defecto
  }
};

const ensureBestVoice = () => {
  if (!voiceSearch) voiceSearch = findBestVoice();
};
ensureBestVoice(); // calentamiento al importar el módulo

// ----------------------------------------------------------------------------
// Síntesis de voz (TTS)
// ----------------------------------------------------------------------------
export const speak = (text: string, opts: Speech.SpeechOptions = {}) => {
  ensureBestVoice();
  Speech.stop();
  Speech.speak(text, {
    language: LANG,
    rate: 0.92,
    pitch: 1.0,
    ...(bestVoiceId ? { voice: bestVoiceId } : {}),
    ...opts,
  });
};

// Voz "cuentacuentos" para dirigirse al niño: algo más aguda y pausada.
export const speakToChild = (text: string, opts: Speech.SpeechOptions = {}) =>
  speak(text, { pitch: 1.15, rate: 0.82, ...opts });

// Palabra objetivo bien articulada, muy despacio (modelado fonético).
export const speakWordSlow = (text: string) =>
  speak(text.toLowerCase(), { pitch: 1.1, rate: 0.6 });

export const stopSpeaking = () => { Speech.stop(); };

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

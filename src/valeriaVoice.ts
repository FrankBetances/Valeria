// ============================================================================
// Valeria+ · Motor de Voz (V6.0)
// Fuente única para hablar y escuchar en toda la app:
//   · Síntesis de voz (TTS) con expo-speech: la app lee consignas, palabras
//     objetivo y las órdenes de las Cápsulas TPR en español (es-ES).
//     La voz se elige entre las instaladas priorizando las neuronales /
//     "enhanced", y cada locución se trocea por frases con micro-variaciones
//     de tono y pausas de respiración para sonar humana, no robótica. Cuánto
//     se trocea y cuánto silencio se deja lo decide el perfil de prosodia de
//     la variedad activa (valeriaSpeechProsody): en es-DO, que suena con la
//     voz del sistema, el troceo se reduce al mínimo porque cada locución
//     encadenada arrastra la latencia de arranque del motor.
//   · Reconocimiento de voz (ASR) con expo-speech-recognition: juegos de
//     micrófono donde el niño repite la palabra y la app valora el intento.
//     Se pide reconocimiento LOCAL cuando el dispositivo y la variedad lo
//     permiten, para que el audio del menor no salga del teléfono.
//
// Degradación elegante: el ASR es un módulo nativo (no existe en Expo Go).
// Si no está disponible, asrSupported() devuelve false y las pantallas ocultan
// el juego de micrófono; el TTS funciona siempre.
// ============================================================================
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import {
  PRAISE_BANK, ALMOST_BANK, NO_HEAR_BANK, TOGETHER_BANK, VOICE_SAMPLE_PHRASE,
} from './valeriaPhraseBank';
import {
  VOICE_SAMPLE_PHRASE_GL,
  PRAISE_BANK_GL, ALMOST_BANK_GL, NO_HEAR_BANK_GL, TOGETHER_BANK_GL,
} from './valeriaContentGl';
import {
  VOICE_SAMPLE_PHRASE_EU,
  PRAISE_BANK_EU, ALMOST_BANK_EU, NO_HEAR_BANK_EU, TOGETHER_BANK_EU,
} from './valeriaContentEu';
import {
  VOICE_SAMPLE_PHRASE_EN,
  PRAISE_BANK_EN, ALMOST_BANK_EN, NO_HEAR_BANK_EN, TOGETHER_BANK_EN,
} from './valeriaContentEn';
import { voiceCorpusId, VoiceStyle } from './valeriaVoiceCorpus';
import { VOICE_ASSETS } from './valeriaVoiceAssets';
import { playVoiceAsset, stopVoiceAsset } from './valeriaVoicePlayback';
import { getLocale, assetLang, speechLocale, prefersLatinVoice, contentLocale } from './valeriaLocale';
import { prosodyFor, splitForSpeech, tightenPauses } from './valeriaSpeechProsody';
import { trackAsrMode } from './valeriaTelemetry';

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

const id0 = (v: Speech.Voice): string => `${v.identifier ?? ''} ${v.name ?? ''}`.toLowerCase();

// Voces inglesas (variedad en-US). Se prefiere en-US sobre cualquier otro
// inglés: el banco clínico es americano y la guía dialectal EN-0.5 se escribió
// sobre esa variedad, así que una voz británica leyendo el banco desplaza las
// vocales justo donde el ejercicio las contrasta.
const scoreEnglishVoice = (v: Speech.Voice, lang: string, id: string): number => {
  let s = lang === 'en-us' ? 4 : lang.startsWith('en-') ? 2 : 1;
  if (v.quality === Speech.VoiceQuality.Enhanced) s += 6;
  if (NEURAL_RE.test(id)) s += 4;
  if (id.includes('local')) s += 2;
  if (id.includes('network')) s += 1;
  if (LEGACY_RE.test(id)) s -= 6;
  return s;
};

const scoreVoice = (v: Speech.Voice): number => {
  const lang = (v.language ?? '').toLowerCase().replace('_', '-');
  // Lengua de la variedad activa: en galego/euskera se prefiere una voz NATIVA
  // del sistema (gl-*/eu-*) si está instalada; si no, se acepta una voz en
  // español como RESPALDO AUDIBLE (mejor acento castellano que silencio). El
  // castellano y el dominicano solo puntúan voces españolas.
  const loc = getLocale();
  // El inglés NO tiene respaldo español: en gl/eu una voz castellana es mejor
  // que el silencio porque comparten fonética suficiente, pero una voz
  // española leyendo inglés no es un respaldo, es la queja que llegó. Si la
  // variedad es en-US solo puntúan voces inglesas; sin ninguna instalada, no
  // se fija `voice` y el motor resuelve con `language: 'en-US'`.
  const primary = loc === 'gl' ? 'gl' : loc === 'eu' ? 'eu' : loc === 'en-US' ? 'en' : 'es';
  if (primary === 'en') return lang.startsWith('en') ? scoreEnglishVoice(v, lang, id0(v)) : -1;
  const isNative = primary !== 'es' && lang.startsWith(primary);
  if (!isNative && !lang.startsWith('es')) return -1;
  const id = `${v.identifier ?? ''} ${v.name ?? ''}`.toLowerCase();
  // Prioridad de idioma según la variedad activa. En dominicano (es-DO)
  // priorizamos voces latinas (es-US/es-MX/es-DO); en el resto, castellano.
  const latin = /^es-(us|mx|do|419)/.test(lang);
  let s = isNative
    ? 9 // voz nativa de la variedad (eu/gl): gana al respaldo español
    : prefersLatinVoice()
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

// Idioma REAL para el motor TTS del sistema (no confundir con speechLocale, que
// es el locale del ASR). Si en galego/euskera el dispositivo no tiene voz nativa
// de esa lengua, la voz elegida es española (respaldo): entonces hay que hablar
// en el idioma de ESA voz, porque pedir `eu-ES`/`gl-ES` a un motor que no lo
// tiene NO suena nada (silencio). Así el euskera nunca queda mudo: suena con la
// voz vasca si existe y, si no, con la española (acento castellano) audible.
const ttsLang = (): string => {
  const loc = getLocale();
  if ((loc === 'eu' || loc === 'gl') && bestVoice?.language) return bestVoice.language;
  return speechLocale();
};

// Normalización fonética previa a TTS: previene artefactos en sintetizadores
// de voz cuando un texto contiene repeticiones anómalas o consonantes forzadas.
export const sanitizePhonetics = (text: string): string =>
  text
    .replace(/\br{2,}([aeiouáéíóúàèìòùâêîôûãõäëïöü])/gi, 'r$1')
    .replace(/([aeiouáéíóúàèìòùâêîôûãõäëïöü])r{3,}([aeiouáéíóúàèìòùâêîôûãõäëïöü])/gi, '$1rr$2')
    .replace(/([aeiouáéíóúàèìòùâêîôûãõäëïöü])\1{2,}/gi, '$1');

const speakChain = (text: string, opts: Speech.SpeechOptions, token: number, rateCeil = 1.3) => {
  const { onDone, onError, ...rest } = opts;
  // Perfil de prosodia de la variedad activa: decide si este enunciado se trocea
  // por frases o va de una tirada, y cuánto silencio se añade entre trozos. En
  // es-DO (voz del sistema) el troceo era la causa de las pausas anchas que
  // rompían el ritmo — ver valeriaSpeechProsody.
  // contentLocale y no getLocale: mientras el banco inglés no exista, `en-US`
  // locuta castellano, y el troceo/pausas tienen que ser los del castellano.
  const prosody = prosodyFor(contentLocale());
  const cleanInput = sanitizePhonetics(text);
  const sentences = splitForSpeech(cleanInput, prosody);
  if (!sentences.length) { onDone?.(); return; }
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
      language: ttsLang(),
      ...rest,
      rate: clamp(baseRate + (excited ? 0.03 : 0) + jitter * 0.5, 0.4, rateCeil),
      pitch: clamp(basePitch + (excited ? 0.06 : asking ? 0.05 : 0) + jitter, 0.7, 1.45),
      ...(bestVoiceId && !rest.voice ? { voice: bestVoiceId } : {}),
      onDone: () => {
        if (token !== speakToken) return;
        if (i + 1 >= sentences.length) { onDone?.(); return; }
        // Respiración corta entre frases: los testers notaban demasiado delay
        // en los apoyos de voz, así que la pausa se mantiene mínima. El motor
        // ya añade la suya al arrancar cada locución, y esa parte no se puede
        // recortar: por eso en es-DO el perfil casi no encadena.
        setTimeout(() => sayFrom(i + 1), prosody.gapMs);
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
  // Solo el asset de la PROPIA variedad. Antes, si en galego no había asset se
  // reproducía el castellano con el mismo texto: como Expansión Semántica y
  // Audición y Lenguaje compartían banco con el castellano, media sesión en
  // galego sonaba con Sharvard (castellano) y la otra media con Celtia, y las
  // palabras que existen igual en las dos lenguas («gato», «sol», «pan») daban
  // un salto de voz en mitad del ejercicio. Ahora el galego tiene banco propio
  // en TODAS las pantallas y su corpus completo (gate de cobertura en CI), así
  // que ese respaldo ya no protege de nada y sí rompía la continuidad de voz.
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

const speakEngine = (text: string, opts: Speech.SpeechOptions = {}, rateCeil = 1.3) => {
  ensureBestVoice();
  const token = ++speakToken;
  Speech.stop();
  stopVoiceAsset();
  const go = () => { if (token === speakToken) speakChain(text, opts, token, rateCeil); };
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

// Umbral de palabras a partir del cual un enunciado se considera "largo"
// (frase de contexto + petición, como en Expansión Semántica): por encima de
// esto se le aplica el mismo techo de velocidad conservador que speakClinical
// (rate ≤ 0.9), porque el jitter/las exclamaciones de speakChain podían acelerar
// una locución de varias oraciones hasta sonar atropellada.
const LONG_UTTERANCE_WORDS = 12;

// Voz "cuentacuentos" para dirigirse al niño: algo más aguda y pausada.
export const speakToChild = (text: string, opts: Speech.SpeechOptions = {}) => {
  if (trySpokenAsset('child', text, opts)) return;
  const isLong = text.trim().split(/\s+/).length > LONG_UTTERANCE_WORDS;
  speakEngine(text, { pitch: 1.15, rate: 0.85, ...opts }, isLong ? 0.9 : 1.3);
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
    // Una sola locución, pero con la puntuación de pausa larga normalizada y saneamiento fonético:
    // evita huecos y artefactos articulatorios en el fonema objetivo.
    Speech.speak(tightenPauses(sanitizePhonetics(text)), {
      language: ttsLang(),
      ...rest,
      rate: clamp(rest.rate ?? 0.82, 0.65, 0.92), // ritmo natural y estable
      pitch: clamp(rest.pitch ?? 1.0, 0.9, 1.1),  // tono plano y estable
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
//
// El inglés pasa por el mismo camino que las demás variedades desde que existe
// su banco clínico (EN_THERAPY_CONTENT_READY) y desde que scoreVoice puntúa
// voces inglesas para `en-US`. Antes tenía un atajo propio —resolvía el asset
// de Piper a mano y llamaba a Speech.speak sin `voice`, porque la mejor voz
// cacheada era española y habría leído el inglés como castellano—; las dos
// razones han desaparecido y el atajo con ellas.
export const speakVoiceSample = () => {
  const l = getLocale();
  speakToChild(l === 'gl' ? VOICE_SAMPLE_PHRASE_GL
    : l === 'eu' ? VOICE_SAMPLE_PHRASE_EU
      : l === 'en-US' ? VOICE_SAMPLE_PHRASE_EN
        : VOICE_SAMPLE_PHRASE);
};

// Palabra objetivo bien articulada, pausada para modelado fonético sin distorsión formántica.
export const speakWordSlow = (text: string) => {
  const t = sanitizePhonetics(text.toLowerCase());
  if (trySpokenAsset('slow', t, {})) return;
  speakEngine(t, { pitch: 1.05, rate: 0.78 });
};

// Modelo LENTO DE FRASE completa (ES-05): mismo estilo 'slow' que speakWordSlow
// (mismo length_scale en la síntesis pregenerada), pero sin minuscular ni
// aislar una sola palabra — repite el enunciado completo tal cual lo dijo el
// modelo normal, con velocidad calibrada para no romper la coarticulación de formantes.
export const speakPhraseSlow = (text: string) => {
  const t = sanitizePhonetics(text.replace(/\s+/g, ' ').trim());
  if (trySpokenAsset('slow', t, {})) return;
  speakEngine(t, { pitch: 1.05, rate: 0.80 });
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

// Selección del banco de refuerzo por variedad: galego (Celtia), euskera
// (HiTZ), inglés (Piper) o base castellana (es/es-DO, es-DO con la voz del
// sistema). Mismas longitudes por categoría, así la anti-repetición de
// pickPhrase sigue valiendo en cualquier variedad.
//
// El inglés FALTABA aquí, y es el sitio donde más se notaba: estas cuatro
// frases se oyen en CADA ensayo. Con la variedad inglesa activa el niño oía
// «¡Muy bien!» en castellano leído por la voz inglesa, que es exactamente la
// queja que llegó. El banco inglés existía desde EN-3.x y estaba en el corpus
// de voz: lo único que faltaba era consumirlo.
const bankFor = <T,>(gl: T, eu: T, en: T, base: T): T => {
  const l = getLocale();
  return l === 'gl' ? gl : l === 'eu' ? eu : l === 'en-US' ? en : base;
};
export const praisePhrase = () => pickPhrase('praise', bankFor(PRAISE_BANK_GL, PRAISE_BANK_EU, PRAISE_BANK_EN, PRAISE_BANK));
export const almostPhrase = () => pickPhrase('almost', bankFor(ALMOST_BANK_GL, ALMOST_BANK_EU, ALMOST_BANK_EN, ALMOST_BANK));
export const noHearPhrase = () => pickPhrase('noHear', bankFor(NO_HEAR_BANK_GL, NO_HEAR_BANK_EU, NO_HEAR_BANK_EN, NO_HEAR_BANK));
export const togetherPhrase = () => pickPhrase('together', bankFor(TOGETHER_BANK_GL, TOGETHER_BANK_EU, TOGETHER_BANK_EN, TOGETHER_BANK));

// ----------------------------------------------------------------------------
// Reconocimiento de voz (ASR) — opcional según plataforma/build
// ----------------------------------------------------------------------------
// Motor: expo-speech-recognition (Fase A de
// docs/plan-asr-privacidad-y-motor-local.md). Sustituyó a @react-native-voice/voice
// por una razón que no era de comodidad: aquella librería filtraba las opciones
// que le llegaban de JS con un `switch` de seis claves y SIN rama `default`, así
// que cualquier ajuste que no conociera —incluido pedir reconocimiento local— se
// descartaba en silencio, sin error y sin log. Y en iOS nunca tocaba
// `requiresOnDeviceRecognition`, de modo que allí no había camino on-device en
// absoluto. El objetivo de la Fase A es que el audio del turno de habla del menor
// no salga del dispositivo; con la librería anterior era inalcanzable.
let Asr: any = null;
try {
  // Carga perezosa: en Expo Go el módulo nativo no existe y el require falla.
  Asr = require('expo-speech-recognition');
  if (typeof Asr?.ExpoSpeechRecognitionModule?.start !== 'function') Asr = null;
} catch (e) {
  Asr = null;
}

export const asrSupported = (): boolean => Asr != null;

// ----------------------------------------------------------------------------
// Modo de reconocimiento: ¿el audio se queda en el teléfono?
// ----------------------------------------------------------------------------
// 'local'        el motor reconoce en el dispositivo; el audio no sale
// 'red'          el motor puede enviarlo a sus servidores (comportamiento previo)
// 'desconocido'  todavía no se ha escuchado nada en esta sesión
//
// Lo consume la telemetría y el Panel del Adulto. NO es una promesa: es lo que
// se pidió y el sistema concedió. La comprobación concluyente de que el audio no
// sale es la inspección de tráfico de red (§3.5 del plan), no este valor.
export type AsrMode = 'local' | 'red' | 'desconocido';

let lastAsrMode: AsrMode = 'desconocido';
export const asrOfflineStatus = (): AsrMode => lastAsrMode;

// ----------------------------------------------------------------------------
// POR QUÉ AQUÍ YA NO SE FIJA UN PAQUETE DE RECONOCEDOR
// ----------------------------------------------------------------------------
// Hasta el 2026-08-04 este módulo fijaba `com.google.android.as` (Android System
// Intelligence) en dos sitios: al PREGUNTAR qué paquetes de idioma hay
// instalados y al ESCUCHAR. La idea era que fijar el paquete es "selección dura
// del motor" y `requiresOnDeviceRecognition` a secas una garantía condicionada.
//
// La idea era falsa, y salía cara. Lo que hace la librería de verdad:
//
//   · start() — en Android 13+, si `requiresOnDeviceRecognition` es true llama a
//     `SpeechRecognizer.createOnDeviceSpeechRecognizer(context)` y **descarta
//     `androidRecognitionServicePackage`**. La selección dura que creíamos estar
//     haciendo no se hacía: el reconocedor real es el on-device DEL SISTEMA, sea
//     cual sea su paquete. (Y en Android 12, donde esa API no existe, pasar el
//     paquete solo sirve para intentar enlazar un componente que puede no estar,
//     lo que revienta con `audio-capture`.)
//
//   · androidTriggerOfflineModelDownload() — el botón «Descargar el paquete» que
//     usa el adulto también va por `createOnDeviceSpeechRecognizer`: descarga en
//     el reconocedor on-device DEL SISTEMA.
//
//   · getSupportedLocales({ androidRecognitionServicePackage }) — este SÍ respeta
//     el paquete: interroga a ESE componente. Y si el paquete no expone un
//     RecognitionService en el aparato, la promesa se RECHAZA.
//
// Es decir: se descargaba el modelo en el reconocedor A, se escuchaba con el
// reconocedor A, y se le preguntaba al reconocedor B si el modelo estaba. En
// cualquier móvil cuyo servicio local no sea exactamente `com.google.android.as`
// —que son muchos fuera de los Pixel—, la respuesta era siempre «no instalado»:
// la variedad se quedaba en `red` toda la sesión y el adulto veía una y otra vez
// el botón de descarga. Descargaba, y seguía sin usarse. Reportado con estas
// palabras: «había descargado el modelo de reconocimiento de voz, y tampoco
// funcionaba».
//
// Ahora se pregunta SIN paquete, que es lo que hace que `getSupportedLocales`
// interrogue al mismo `createOnDeviceSpeechRecognizer` que se va a usar para
// escuchar y en el que se descargó el modelo. Las tres operaciones hablan por fin
// del mismo motor.
//
// La promesa de privacidad no se debilita: `createOnDeviceSpeechRecognizer` es la
// API del sistema que enlaza con el reconocedor local y no puede irse a la red.
// Es una selección MÁS dura que la que se creía tener.

// `androidTriggerOfflineModelDownload` es de Android 13+ (API 33). En versiones
// anteriores no hay forma de pedir la descarga desde la app, así que tampoco se
// le ofrece al adulto un botón que no haría nada.
const ANDROID_DOWNLOAD_MIN_API = 33;

// Normaliza 'es-ES', 'es_ES' y 'es' a una forma comparable.
const localeKey = (s: string): string => s.toLowerCase().replace('_', '-');

// Diagnóstico del reconocedor PARA UNA VARIEDAD. La respuesta es por variedad,
// no global: es razonable que el paquete de castellano esté instalado, pero en
// galego y euskera es mucho menos probable. Forzar el modo local a ciegas
// degradaría gl/eu sin avisar, así que se pregunta por cada uno.
//
// Los cuatro campos se exponen —y no solo el veredicto— porque la tarjeta del
// adulto tiene que poder decir POR QUÉ está en red: no es lo mismo "este móvil
// no sabe reconocer en local" que "sabe, pero le falta el paquete de esta
// variedad", y solo el segundo caso admite oferta de descarga (§3.3 del plan).
export interface AsrLocaleStatus {
  locale: string;
  mode: 'local' | 'red';
  // supportsOnDeviceRecognition(): ¿el dispositivo sabe reconocer sin red?
  deviceCapable: boolean;
  // ¿El sistema expone ALGÚN servicio de reconocimiento de voz?
  serviceAvailable: boolean;
  // Paquete del servicio de reconocimiento configurado en el sistema. No decide
  // nada: es diagnóstico para el adulto y para quien depure en dispositivo, que
  // es justo lo que faltaba para ver por qué un modelo descargado no se usaba.
  // '' si el sistema no lo dice.
  serviceName: string;
  // ¿Está DESCARGADO el paquete de idioma de esta variedad? (installedLocales,
  // no locales: "soportado" no es lo mismo que "instalado").
  localeInstalled: boolean;
  // ¿Tiene sentido ofrecerle al adulto descargarlo? (§3.3 paso 4)
  canOfferDownload: boolean;
  // El sistema decía que sí y, al escuchar de verdad, el reconocedor local no
  // arrancó: esta variedad está degradada a red para el resto de la sesión.
  // Es un caso distinto de "no está instalado" y merece su propia explicación.
  localFailed: boolean;
}

// Se cachea por locale porque son llamadas nativas y esto corre en cada escucha.
const statusCache = new Map<string, AsrLocaleStatus>();

// Variedades cuyo reconocedor LOCAL se probó de verdad y no arrancó. Ver
// `startListening`: el diagnóstico del sistema puede decir que todo está en su
// sitio y aun así el motor local no servir en este aparato.
const localDemoted = new Set<string>();

// Escuchas LOCALES seguidas en las que el motor abrió el micrófono y no captó
// absolutamente nada: ni un parcial, ni el evento de comienzo de habla.
//
// Hace falta contarlas porque hay una segunda forma de que el reconocedor local
// no sirva, y la política de degradación anterior no la veía. Cuando el motor
// local no arranca, avisa con un error de arranque y ahí se degrada la variedad
// (§3.3 paso 7). Pero cuando arranca y está SORDO —el caso descrito por la
// propia librería para el on-device de Android 12— no da error de arranque: da
// `no-speech`, que es indistinguible de un niño callado. Como `no-speech` se
// clasifica (con razón) como fallo del motor y no del niño, la variedad se
// quedaba igualmente atascada: cada escucha volvía a pedir local, volvía a no
// oír nada, y el niño oía siempre «no te escuché bien».
//
// Regla: dos escuchas locales seguidas sin UN SOLO indicio de voz y la variedad
// pasa al reconocedor de red por el resto de la sesión. Un indicio de voz —un
// parcial, el `speechstart`— reinicia la cuenta, así que un niño que habla
// nunca degrada la variedad por ser callado en un ensayo. La degradación se
// anuncia en el Panel del Adulto (localFailed) como cualquier otra: si el audio
// pasa a salir del teléfono, se dice.
const localBlankStreak = new Map<string, number>();
const LOCAL_BLANK_LIMIT = 2;

// `getSupportedLocales` puede no contestar nunca: por dentro es un callback del
// SpeechRecognizer y si el servicio no responde, la promesa se queda colgada. Sin
// tope, `startListening` no llegaría ni a abrir el micrófono y la pantalla se
// quedaría en «Escuchando…» para siempre. Al agotarse se sigue por el lado
// conservador (sin paquete → red), que es el que nunca rompe el ejercicio.
const LOCALE_PROBE_TIMEOUT_MS = 4000;

const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([p, new Promise<T>((r) => { setTimeout(() => r(fallback), ms); })]);

const redStatus = (locale: string): AsrLocaleStatus => ({
  locale,
  mode: 'red',
  deviceCapable: false,
  serviceAvailable: false,
  serviceName: '',
  localeInstalled: false,
  canOfferDownload: false,
  localFailed: false,
});

// Paquete del servicio de reconocimiento que el sistema tiene configurado. Solo
// para enseñárselo al adulto: no decide nada (ver el bloque de arriba sobre por
// qué ya no se fija ningún paquete). Nunca puede tumbar el diagnóstico.
const defaultServiceName = (M: any): string => {
  try { return String(M.getDefaultRecognitionService?.()?.packageName ?? ''); } catch (e) { return ''; }
};

async function probeLocale(locale: string): Promise<AsrLocaleStatus> {
  const key = localeKey(locale);
  const cached = statusCache.get(key);
  if (cached) return cached;

  let st = redStatus(locale);
  try {
    const M = Asr.ExpoSpeechRecognitionModule;
    const deviceCapable = M.supportsOnDeviceRecognition() === true;

    if (Platform.OS !== 'android') {
      // En iOS el reparto de modelos lo gestiona el sistema: si el reconocedor
      // dice que soporta on-device, se pide y punto. No hay descarga que ofrecer.
      st = {
        locale,
        mode: deviceCapable ? 'local' : 'red',
        deviceCapable,
        serviceAvailable: deviceCapable,
        serviceName: '',
        localeInstalled: deviceCapable,
        canOfferDownload: false,
        localFailed: false,
      };
    } else {
      // Que el sistema tenga ALGÚN reconocedor. No se exige un paquete concreto:
      // exigirlo era el defecto que dejaba sin usar los modelos ya descargados.
      const services: string[] = M.getSpeechRecognitionServices() ?? [];
      const serviceAvailable = services.length > 0;

      let localeInstalled = false;
      if (deviceCapable) {
        // SIN `androidRecognitionServicePackage`: así la librería pregunta al
        // mismo `createOnDeviceSpeechRecognizer` que usará para escuchar y en el
        // que el adulto descargó el modelo. Con paquete se interrogaba a otro
        // motor —y en muchos móviles ni existía, con lo que la promesa se
        // rechazaba y todo caía a `red` con el modelo ya en el aparato.
        // Se pasa `{}`, no nada: la firma nativa espera el objeto de opciones, y
        // es el objeto SIN paquete lo que elige el reconocedor on-device.
        //
        // OJO: en Android 12 y anteriores esto devuelve listas vacías (la API del
        // sistema no existe), así que el resultado será "red". Es el lado
        // conservador y correcto: sin poder comprobarlo, no se promete nada.
        const { installedLocales } = await withTimeout(
          M.getSupportedLocales({}),
          LOCALE_PROBE_TIMEOUT_MS,
          { installedLocales: [] as string[] },
        );
        const installed = (installedLocales ?? []).map(localeKey);
        localeInstalled = installed.includes(key)
          || installed.some((l: string) => l.split('-')[0] === key.split('-')[0]);
      }

      st = {
        locale,
        // El veredicto ya no depende de que exista un paquete concreto: depende
        // de que el aparato sepa reconocer sin red y de que el modelo de ESTA
        // variedad esté descargado en el reconocedor que se va a usar.
        mode: deviceCapable && localeInstalled ? 'local' : 'red',
        deviceCapable,
        serviceAvailable,
        serviceName: defaultServiceName(M),
        localeInstalled,
        canOfferDownload:
          deviceCapable && !localeInstalled
          && Number(Platform.Version) >= ANDROID_DOWNLOAD_MIN_API,
        localFailed: false,
      };
    }
  } catch (e) {
    st = redStatus(locale); // ante la duda, el comportamiento de siempre
  }

  statusCache.set(key, st);
  return st;
}

// Lo que el sistema dice MENOS lo que ya se demostró falso escuchando de verdad.
// Es el modo que se va a pedir, y por tanto el único que se puede enseñar sin
// mentir: un reconocedor local que no arranca no protege ningún audio.
const effectiveStatus = (st: AsrLocaleStatus): AsrLocaleStatus =>
  st.mode === 'local' && localDemoted.has(localeKey(st.locale))
    ? { ...st, mode: 'red', canOfferDownload: false, localFailed: true }
    : st;

// Estado del reconocedor para la variedad activa (o la que se pida). Lo consume
// la tarjeta del adulto; `startListening` usa el mismo camino, así que lo que
// se muestra es exactamente lo que se va a pedir.
export async function asrLocaleStatus(locale?: string): Promise<AsrLocaleStatus | null> {
  if (!Asr) return null;
  return effectiveStatus(await probeLocale(locale ?? speechLocale()));
}

// Invalida el diagnóstico cacheado. Necesario tras descargar un paquete de
// idioma: sin esto, el `false` de antes de la descarga se quedaría pegado toda
// la sesión y el adulto vería "en red" con el paquete ya instalado. Levanta
// también la degradación: tras una descarga el motor local merece otra
// oportunidad, y si vuelve a fallar se degradará otra vez en la primera escucha.
export const forgetAsrLocale = (locale?: string): void => {
  if (locale) {
    statusCache.delete(localeKey(locale));
    localDemoted.delete(localeKey(locale));
    localBlankStreak.delete(localeKey(locale));
  } else {
    statusCache.clear(); localDemoted.clear(); localBlankStreak.clear();
  }
};

export type OfflineDownloadResult = 'ok' | 'dialogo' | 'cancelado' | 'error';

// §3.3 paso 4 · Descarga del paquete de idioma, a petición EXPLÍCITA del adulto.
// Nunca se lanza sola: abre una interfaz del sistema y consume datos, y la app
// es una herramienta de rehabilitación antes que un manifiesto de privacidad.
// En Android 13 el sistema solo puede abrir su diálogo ('opened_dialog'); en 14+
// devuelve el resultado real de la descarga.
export async function requestOfflineModel(locale?: string): Promise<OfflineDownloadResult> {
  if (!Asr || Platform.OS !== 'android') return 'error';
  const target = locale ?? speechLocale();
  try {
    const { status } = await Asr.ExpoSpeechRecognitionModule
      .androidTriggerOfflineModelDownload({ locale: target });
    if (status === 'download_canceled') return 'cancelado';
    // Tanto si la descarga terminó como si solo se abrió el diálogo, lo
    // cacheado ya no vale: hay que volver a preguntarle al sistema.
    forgetAsrLocale(target);
    return status === 'download_success' ? 'ok' : 'dialogo';
  } catch (e) {
    return 'error';
  }
}

// ----------------------------------------------------------------------------
// Fase B · Captura del corpus de evaluación — SOLO en build de desarrollo
// ----------------------------------------------------------------------------
// §4.2 del plan: para comparar un motor local contra la línea base hace falta
// el MISMO audio pasado por los dos, y eso obliga a guardarlo. Guardar la voz
// de un menor con dificultades del lenguaje es dato de salud del art. 9 del
// RGPD, así que la captura vive detrás de DOS condiciones simultáneas:
//
//   1. `__DEV__` — en release vale false y el minificador se lleva la rama
//      entera. En el AAB que sube a Play este código no existe.
//   2. `EXPO_PUBLIC_ASR_CAPTURE === '1'` — hay que pedirlo a propósito al
//      construir. No está en `.env.example` con valor, no lo pone el CI: se
//      escribe a mano para la sesión de grabación y se borra al terminar.
//
// `scripts/check-asr-capture-guard.js` comprueba en CI que no se caiga ninguna
// de las dos y que nada versionado encienda la variable. Y la app lo grita en
// pantalla mientras está activo (`SpeechPrivacyBlock`), porque el fallo que hay
// que hacer imposible no es técnico: es que una build con captura encendida
// acabe en la tablet de una familia sin que nadie se dé cuenta.
const ASR_CAPTURE = __DEV__ && process.env.EXPO_PUBLIC_ASR_CAPTURE === '1';

export const asrCaptureEnabled = (): boolean => ASR_CAPTURE;

export interface ListenCallbacks {
  onPartial?: (text: string) => void;
  onResult: (alternatives: string[]) => void;
  // ES-04 · `noMatch` distingue el fallo del MOTOR (no captó nada, se agotó la
  // ventana) del fallo del NIÑO. Las pantallas usan esa diferencia para no
  // gastarle un intento ni una estrella por un tropiezo del reconocedor.
  onError: (message: string, noMatch: boolean) => void;
  onEnd?: () => void;
  // Qué tipo de enunciado se espera (ver ListenExpect). Por defecto 'word':
  // casi todo lo que la app escucha es una palabra objetivo, y pedir el modelo
  // de dictado para una palabra suelta es justo lo que hace que el motor no
  // devuelva nada. Quien espere habla libre debe pedir 'phrase'.
  expect?: ListenExpect;
}

// ES-04 · Ventana de escucha. Las logopedas informaron de hasta TRES repeticiones
// para que se aceptase un ensayo. Voice.start() se llamaba sin opciones, así que
// Android aplicaba su ventana por defecto —pensada para un adulto que dicta un
// mensaje, no para un niño de cuatro años que tarda en arrancar—: en cuanto
// mediaba un silencio corto, el motor cerraba y devolvía ERROR_NO_MATCH.
//
// Estos extras solo afectan a CUÁNDO deja de escuchar el micrófono. NO tocan el
// umbral de aceptación fonética (matchExpected), que es materia clínica: aflojarlo
// reintroduciría los falsos positivos que el pliegue dialectal de es-DO corrigió.
const ANDROID_LISTEN_EXTRAS = {
  // Silencio que da la frase por terminada: 3 s en vez del defecto (~1 s).
  EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
  EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
  // Margen mínimo antes de considerar siquiera que la frase acabó.
  EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 4000,
  // NOTA DE MIGRACIÓN: el cuarto extra era EXTRA_PARTIAL_RESULTS: true. La
  // librería nueva no lo expone como extra del intent porque tiene una opción
  // propia y multiplataforma, `interimResults`, que se pasa en start(). Los
  // parciales siguen activos —son la red de seguridad cuando el resultado final
  // llega vacío—, solo cambia por dónde se piden.
};

// ----------------------------------------------------------------------------
// Qué se espera oír, y por qué eso cambia el reconocedor
// ----------------------------------------------------------------------------
// 'word'   una palabra suelta o un enunciado de una o dos palabras: Pares
//          Mínimos («rana»), el juego de micrófono, el Test de Ling, la
//          Expansión Semántica. Es la inmensa mayoría de la app.
// 'phrase' habla libre del niño o del adulto (registro de respuesta abierta).
//
// No es cosmético. El SpeechRecognizer de Android trae por defecto el modelo de
// lenguaje `free_form`, pensado para dictar mensajes, y con él **una palabra
// corta y aislada suele no devolver NINGÚN resultado**: el motor se queda
// esperando a que sigas hablando y acaba cerrando con ERROR_NO_MATCH. Es un
// defecto conocido del reconocedor (Google issuetracker 280288200) y el propio
// equipo de Android recomienda como remedio pedir el modelo `web_search`, que
// es el que sabe cerrar sobre términos sueltos. La librería solo pone el
// `free_form` por defecto si NO le mandamos la clave, así que basta con
// mandarla.
//
// Esto es exactamente el síntoma que se estaba reportando en Pares Mínimos —el
// ejercicio que pide SIEMPRE una palabra suelta—: la app respondía «no te
// escuché bien, probamos otra vez» ensayo tras ensayo aunque el niño dijera la
// palabra perfectamente. No lo arregló el trabajo anterior (que corrigió la
// CLASIFICACIÓN de los errores del motor) porque aquí el motor no se estaba
// equivocando al informar: se le estaba pidiendo el modelo de lenguaje
// equivocado para la tarea.
//
// En iOS el equivalente es `iosTaskHint: 'confirmation'`, la pista de tarea
// para enunciados cortos tipo «sí», «no», una palabra.
export type ListenExpect = 'word' | 'phrase';

const ANDROID_SINGLE_WORD_MODEL = { EXTRA_LANGUAGE_MODEL: 'web_search' as const };

// ES-04 · Traducción de los códigos de error al indicador `noMatch`.
//
// PUNTO DELICADO DE LA MIGRACIÓN, y se hizo mal (R9 del plan, que quedó marcado
// como "falta verificar a mano" y no se verificó). La librería anterior devolvía
// códigos numéricos del SpeechRecognizer de Android y aquí se miraban dos:
//
//   6 · ERROR_SPEECH_TIMEOUT → la librería nueva lo llama 'speech-timeout'
//   7 · ERROR_NO_MATCH       → la librería nueva lo llama 'no-speech'
//                              (y además emite el evento `nomatch`)
//
// La migración tradujo el PAR a un solo código, 'no-speech', dejando fuera el 6.
// Y el 6 es justamente el caso de ES-04: el niño que tarda en arrancar y al que
// el motor cierra la ventana antes de que diga nada. Al no contarse como fallo
// del motor, la app lo trataba como fallo del niño: mensaje seco («No se pudo
// escuchar»), Expansión Semántica saltando al juicio del adulto y el contador
// de noMatch sin registrar nada. Se restituye el par completo.
//
// Sigue en pie lo que anotó la migración, y sigue sin hacerse aquí: "network",
// "audio-capture", "busy" y "client" TAMBIÉN son fallos del motor y no del niño,
// y con la lógica de ES-04 tampoco deberían gastarle un intento. Con la librería
// vieja no se distinguían y se tratan como entonces. Ampliar el conjunto es una
// decisión clínica —va con el umbral que tiene que fijar ACOPROS (D6 del plan)—,
// no un arreglo de este defecto. Lo que sí cambia aquí es que algunos de esos
// códigos disparan la vuelta al reconocedor de red: eso es política de motor
// (§3.3 paso 7), no reclasificación del intento del niño.
const NO_MATCH_ERRORS = new Set(['no-speech', 'speech-timeout']);

// El permiso denegado NO es un fallo del motor: necesita acción del adulto, y la
// pantalla debe mostrarlo como tal en vez de tragárselo como un intento fallido.
const PERMISSION_ERRORS = new Set(['not-allowed', 'service-not-allowed']);

// Fallos que significan «el reconocedor no llegó a abrir el micrófono». En modo
// LOCAL son un callejón sin salida: el diagnóstico de `probeLocale` dice que el
// paquete está instalado, así que la escucha siguiente volvería a pedir local y
// a fallar igual, para siempre. Ver `startListening`.
const ENGINE_START_FAILURES = new Set([
  'language-not-supported', // el paquete figura instalado pero el motor no lo sirve
  'client',                 // createOnDeviceSpeechRecognizer no pudo atender
  'audio-capture',          // el servicio local no pudo tomar el micrófono
  'unknown',
]);

// `abort()` (releaseListening) emite su propio evento de error. Es teardown
// nuestro, no un fallo del motor: no puede llegarle a la pantalla como si el
// niño hubiera fallado un intento.
const ABORT_ERROR = 'aborted';

// Qué se le dice al ADULTO cuando el turno se pierde por el motor y no por el
// niño. «No se pudo escuchar» valía para todo y no servía para nada: sin saber
// si falta cobertura, si el micrófono está cogido o si el idioma no está, no hay
// nada que hacer salvo repetir y volver a fallar. Cada mensaje dice qué pasó y
// qué se puede intentar. El niño nunca los oye: las pantallas le hablan con su
// propio banco de frases.
const ENGINE_ERROR_MESSAGES: Record<string, string> = {
  network: 'El reconocimiento se está haciendo por internet y no hay conexión. Conecta el '
    + 'aparato a la red, o descarga el paquete de voz desde «Voz de la app» para que '
    + 'funcione sin conexión.',
  'audio-capture': 'Otra aplicación está usando el micrófono. Ciérrala (o corta la llamada) y probad otra vez.',
  busy: 'El reconocedor de voz está ocupado con otra petición. Esperad un momento y probad otra vez.',
  client: 'El reconocedor de voz del sistema no pudo atender la petición. Probad otra vez; si sigue, reiniciad el aparato.',
  'language-not-supported': 'El reconocedor del sistema no tiene esta lengua. Descarga su paquete '
    + 'de voz desde «Voz de la app», o cambia de variedad en esa misma tarjeta.',
  'service-not-allowed': 'El sistema no permite a la app usar el reconocimiento de voz. Revisa los permisos en Ajustes.',
};

const engineErrorMessage = (code: string): string =>
  ENGINE_ERROR_MESSAGES[code] ?? `No se pudo escuchar (${code || 'motivo desconocido'}).`;

// Suscripciones activas del reconocedor. La librería devuelve objetos con
// .remove(); hay que soltarlas al parar o se acumulan entre escuchas.
let asrSubs: Array<{ remove: () => void }> = [];

const clearAsrSubs = (): void => {
  asrSubs.forEach((s) => { try { s.remove(); } catch (e) { /* noop */ } });
  asrSubs = [];
};

// Identifica la escucha en curso. Los eventos del módulo nativo son globales y
// pueden llegar tarde (el `end` del intento que acaba de abortarse, el `error`
// de un `abort()`), así que cada evento comprueba de qué escucha viene antes de
// tocar la pantalla de la que ya no es dueño.
let listenSession = 0;

// Inicia una escucha en la variedad activa. Devuelve false si no se pudo empezar.
export async function startListening(cb: ListenCallbacks): Promise<boolean> {
  if (!Asr) {
    cb.onError('El reconocimiento de voz no está disponible en este dispositivo.', false);
    return false;
  }
  const M = Asr.ExpoSpeechRecognitionModule;

  // Permisos: la librería los pide en las dos plataformas (micrófono y, en iOS,
  // también reconocimiento de voz), así que ya no hace falta el camino manual
  // con PermissionsAndroid.
  try {
    const perm = await M.requestPermissionsAsync();
    if (!perm?.granted) {
      cb.onError('Concede el permiso de micrófono para jugar con la voz.', false);
      return false;
    }
  } catch (e) {
    cb.onError('No se pudo pedir el permiso de micrófono.', false);
    return false;
  }

  const locale = speechLocale();
  const session = ++listenSession;
  // El modo que se va a pedir: el diagnóstico del sistema, salvo que el motor
  // local de esta variedad ya se haya demostrado inservible en esta sesión.
  let onDevice = !localDemoted.has(localeKey(locale))
    && (await probeLocale(locale)).mode === 'local';

  // La telemetría particiona la tasa de noMatch por modo: sin eso, la cifra
  // agregada mezcla escuchas locales y de red y no permite decidir la fase. Si
  // hay degradación a mitad de turno se anota DOS veces (el intento local que
  // falló y la escucha de red que sí llevó el audio): sobra un evento, pero la
  // cuenta de red nunca se queda corta, que es el lado por el que una métrica de
  // privacidad no puede equivocarse. La degradación ocurre una vez por variedad
  // y sesión, así que el sesgo es de un evento, no de una tendencia.
  const noteMode = () => {
    lastAsrMode = onDevice ? 'local' : 'red';
    try { trackAsrMode(lastAsrMode, locale); } catch (e) { /* nunca romper por medir */ }
  };
  noteMode();

  // Un desenlace por escucha. El módulo nativo emite `nomatch` Y `error` para el
  // mismo ERROR_NO_MATCH, así que sin esto la pantalla recibía dos veredictos
  // por un solo turno de habla.
  let settled = false;
  // ¿Llegó a abrirse el micrófono? Distingue "el motor no arrancó" (el niño aún
  // no ha hablado: se puede reintentar sin perderle el turno) de "arrancó y algo
  // salió mal después" (ahí reintentar sería pedirle que repita sin decírselo).
  let ready = false;
  // ¿Entró voz por el micrófono en algún momento? Un parcial o el `speechstart`
  // del motor. Es lo que separa "el niño no dijo nada" de "el reconocedor local
  // está sordo": ver localBlankStreak.
  let heardVoice = false;
  // `end`s que hay que tragarse: los del intento abortado al cambiar de motor.
  let swallowEnds = 0;

  // Una palabra suelta (lo normal en esta app) necesita otro modelo de lenguaje;
  // con el de dictado el motor no cierra y devuelve ERROR_NO_MATCH. Ver
  // ListenExpect.
  const singleWord = (cb.expect ?? 'word') === 'word';

  clearAsrSubs();

  const startEngine = () => {
    M.start({
      lang: locale,
      // Sustituye a EXTRA_PARTIAL_RESULTS del intent: misma red de seguridad.
      interimResults: true,
      maxAlternatives: 5,
      // Fase A · que el audio no salga del teléfono cuando el dispositivo pueda.
      // Sin fijar paquete: en Android 13+ la librería lo descarta cuando esto va
      // a true (usa `createOnDeviceSpeechRecognizer`, el reconocedor local del
      // sistema), y en Android 12 fijarlo solo sirve para intentar enlazar un
      // componente que puede no existir. Ver el bloque de arriba.
      requiresOnDeviceRecognition: onDevice,
      // iOS · pista de tarea para enunciados cortos (una palabra objetivo).
      ...(singleWord && Platform.OS === 'ios' ? { iosTaskHint: 'confirmation' as const } : {}),
      // ES-04 · la ventana de escucha larga, intacta, más el modelo de lenguaje
      // de término suelto cuando se espera una palabra.
      ...(Platform.OS === 'android'
        ? {
          androidIntentOptions: {
            ...ANDROID_LISTEN_EXTRAS,
            ...(singleWord ? ANDROID_SINGLE_WORD_MODEL : {}),
          },
        }
        : {}),
      // Fase B · guardar el WAV del turno de habla. Ver el bloque de arriba:
      // esto no puede llegar encendido a una build de producción.
      ...(ASR_CAPTURE
        ? { recordingOptions: { persist: true, outputFileName: `valeria_${localeKey(locale)}_${Date.now()}.wav` } }
        : {}),
      // NUNCA `contextualStrings` con la palabra objetivo: sesgaría el motor a
      // devolverla y fabricaría el falso positivo que el ejercicio existe para
      // detectar (§3.4 del plan). Si alguien lo añade "para que reconozca
      // mejor", está rompiendo la medida clínica.
    });
  };

  try {
    const mine = () => session === listenSession;
    const sub = (name: string, fn: (e: any) => void) => {
      asrSubs.push(M.addListener(name, fn));
    };
    // Cuenta (o reinicia) la racha de escuchas locales sordas de esta variedad.
    // Al llegar al tope, la variedad se degrada a red para la SIGUIENTE escucha:
    // no se reintenta esta, que el niño ya habló —o ya calló— y repetirla sería
    // hacerle esperar dos veces.
    const noteBlankListen = () => {
      const k = localeKey(locale);
      if (!onDevice) return;
      if (heardVoice) { localBlankStreak.delete(k); return; }
      const n = (localBlankStreak.get(k) ?? 0) + 1;
      localBlankStreak.set(k, n);
      if (n >= LOCAL_BLANK_LIMIT) { localDemoted.add(k); localBlankStreak.delete(k); }
    };

    const fail = (message: string, noMatch: boolean) => {
      if (settled || !mine()) return;
      settled = true;
      if (noMatch) noteBlankListen();
      cb.onError(message, noMatch);
    };

    sub('start', () => { if (mine()) ready = true; });

    // El motor detectó que empieza a entrar voz: el micrófono no está sordo,
    // aunque después no consiga transcribir nada.
    sub('speechstart', () => { if (mine()) { ready = true; heardVoice = true; } });

    sub('result', (e: any) => {
      if (!mine()) return;
      const alts: string[] = (e?.results ?? [])
        .map((r: any) => String(r?.transcript ?? ''))
        .filter((t: string) => t.length > 0);
      if (e?.isFinal) {
        if (settled) return;
        settled = true;
        if (alts.length) { heardVoice = true; localBlankStreak.delete(localeKey(locale)); }
        cb.onResult(alts);
      } else if (alts.length) {
        ready = true; // ya hay voz entrando: el motor arrancó
        heardVoice = true;
        localBlankStreak.delete(localeKey(locale));
        cb.onPartial?.(alts[0]);
      }
    });

    // `nomatch`: resultado final sin reconocimiento significativo. Es fallo del
    // motor, igual que el viejo código 7.
    sub('nomatch', () => fail('No te escuché bien. ¡Probamos otra vez!', true));

    sub('error', (e: any) => {
      if (!mine()) return;
      const code = String(e?.error ?? '');
      if (code === ABORT_ERROR) return; // teardown propio, no fallo del motor
      if (PERMISSION_ERRORS.has(code)) {
        fail('Concede el permiso de micrófono para jugar con la voz.', false);
        return;
      }
      // §3.3 · el paso que faltaba en la política de degradación: el sistema
      // decía que el paquete local estaba instalado y, al escuchar de verdad, el
      // reconocedor local no arranca. Sin esta salida la variedad se queda
      // atascada — cada escucha vuelve a pedir local, vuelve a fallar y el niño
      // oye siempre lo mismo, que no se le escucha. Se reintenta UNA vez con el
      // reconocedor de red (el de siempre) y se degrada la variedad para el
      // resto de la sesión. Solo si el micrófono no llegó a abrirse: así el
      // reintento no le cuesta al niño repetir una palabra que ya dijo.
      if (onDevice && !ready && !settled && ENGINE_START_FAILURES.has(code)) {
        localDemoted.add(localeKey(locale));
        onDevice = false;
        noteMode(); // el Panel del Adulto tiene que decir «red», que es la verdad
        swallowEnds += 1;
        try { startEngine(); return; } catch (err) { /* sigue al mensaje normal */ }
      }
      const noMatch = NO_MATCH_ERRORS.has(code);
      fail(noMatch ? 'No te escuché bien. ¡Probamos otra vez!' : engineErrorMessage(code), noMatch);
    });

    sub('end', () => {
      if (!mine()) return;
      if (swallowEnds > 0) { swallowEnds -= 1; return; }
      cb.onEnd?.();
    });

    if (ASR_CAPTURE) {
      // El fichero no es legible hasta `audioend`. Se registra la ruta para que
      // quien dirige la sesión pueda emparejarla con el código seudonimizado de
      // la ficha en papel: el manifiesto del banco de medida se escribe a mano
      // y esa correspondencia es lo único que la une al consentimiento.
      sub('audioend', (e: any) => {
        if (e?.uri) console.warn(`[ASR-CAPTURA] ${e.uri}`);
      });
    }

    stopSpeaking(); // que la app no se escuche a sí misma

    startEngine();
    return true;
  } catch (e) {
    clearAsrSubs();
    cb.onError('No se pudo iniciar el micrófono. Inténtalo de nuevo.', false);
    return false;
  }
}

export async function stopListening(): Promise<void> {
  if (!Asr) return;
  try { Asr.ExpoSpeechRecognitionModule.stop(); } catch (e) { /* noop */ }
}

// Libera el reconocedor y sus listeners (llamar al desmontar la pantalla).
// Se invalida la escucha ANTES de abortar: `abort()` emite eventos de forma
// síncrona y ninguno de ellos tiene ya dueño.
export async function releaseListening(): Promise<void> {
  if (!Asr) return;
  listenSession += 1;
  try { Asr.ExpoSpeechRecognitionModule.abort(); } catch (e) { /* noop */ }
  clearAsrSubs();
}

// ----------------------------------------------------------------------------
// Valoración del intento: comparación tolerante entre lo oído y el objetivo
// ----------------------------------------------------------------------------
// Pliegue dialectal caribeño (Quisqueya Habla · guía clínica QH-0.2): en español
// dominicano la /s/ en coda se aspira o elide y la /d/ intervocálica o final cae.
// Son RASGOS DIALECTALES NORMALES, no errores clínicos: penalizarlos produce
// falsos positivos terapéuticos. Por eso, SOLO en es-DO, el objetivo y lo oído se
// "pliegan" igual antes de comparar, de modo que "gato/gatos", "helao/helado" y
// "má/más" cuentan como equivalentes. El pliegue es simétrico (se aplica a ambos
// lados), así que tolera la elisión venga del dato o del habla del niño.
// Opera sobre texto ya sin tildes (se aplica tras la normalización), por eso las
// clases de vocales no llevan acentos.
export const foldDominican = (s: string): string =>
  s
    .replace(/s(?![aeiou])/g, '')            // /s/ en coda (no prevocálica): "gatos"→"gato"
    .replace(/([aeiou])d([aeiou])/g, '$1$2') // /d/ intervocálica: "helado"→"helao"
    .replace(/d(?=\s|$)/g, '')               // /d/ final de palabra: "usted"→"uste"
    .replace(/\s+/g, ' ')
    .trim();

// Pliegue vasco (plan ILENIA/NEL-GAITU · EU-4.2): la ⟨h⟩ es MUDA en euskera
// batua y en los euskalkis del sur, y ni el reconocedor `eu-ES` ni —sobre todo—
// la recaída `es-ES` la devuelven de forma fiable al oír euskera. Se pliega la
// hache de forma simétrica (objetivo y oído): "hotz"/"otz", "hartza"/"artza" u
// "ohea"/"oea" cuentan como equivalentes. NO se tocan las sibilantes ni las
// africadas (s/z/x · ts/tz/tx): son el contraste clínico de los pares mínimos y
// el adulto es el juez final de esa distinción.
export const foldBasque = (s: string): string =>
  s.replace(/h/g, '').replace(/\s+/g, ' ').trim();

export const normalizeSpeech = (s: string): string => {
  const base = s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zñ0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  // Pliegues dialectales: dominicano (elisión de /s/ y /d/) y euskera (h muda).
  const loc = getLocale();
  return loc === 'es-DO' ? foldDominican(base) : loc === 'eu' ? foldBasque(base) : base;
};

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
// tanto, reconocer la palabra contraria.
export type PairResult = 'target' | 'foil' | 'close' | 'none';

// D7 · Desambiguación por VECINO MÁS CERCANO (decidida el 2026-08-04).
//
// La versión anterior preguntaba `matchTarget(…, target) === 2` y, solo si
// fallaba, miraba el distractor. Como `matchTarget` concede el nivel 2 con hasta
// UNA letra de diferencia por palabra, en todo par que se diferencie en una sola
// letra —rana/lana, cubo/tubo, boca/bota, miel/piel— decir el distractor
// puntuaba como acierto y la rama del distractor no se alcanzaba nunca.
// Afectaba a 25 de los 35 pares de los cuatro bancos, con transcripción perfecta
// y sin motor de por medio: el ejercicio no podía detectar el error que existe
// para detectar.
//
// La regla de ahora no elige por umbral sino por CERCANÍA RELATIVA: se mide la
// distancia de lo oído a las dos palabras y gana la más próxima. El empate no se
// resuelve a favor de nadie —devuelve 'close'— porque un empate es literalmente
// que el texto no permite distinguir, y ahí el juez es el adulto.
//
// Lo que esto cuesta, medido y aceptado (docs/d7-simulacion-contraste.md, sobre
// las 1619 aproximaciones ya validadas de `stt_expected_array`): de 157
// producciones aproximadas del objetivo, las que puntuaban acierto pasan de 116
// a 59; 97 pasan a 'close', que cuesta una estrella y un reintento. A cambio,
// los 35 contrastes se recuperan y **ninguna aproximación se envía a la rama de
// error**: nunca se le dice a un niño que dijo la otra palabra por haber
// articulado de forma aproximada.
//
// Se cambia SOLO aquí. `matchTarget` y `matchExpected` quedan intactos: los usan
// el juego de micrófono, la Expansión Semántica y el Test de Ling, que no tienen
// distractor y para los que la tolerancia sigue siendo lo correcto.
//
// Distancia de lo oído a una palabra, con la misma forma que usa `matchTarget`:
//   0        el objetivo aparece literal (o como palabra suelta de la frase)
//   n        cada palabra del objetivo tiene una a n letras como mucho
//   Infinity ni eso
// Nota: aquí no se aplica el guardián `length > 3` de `matchTarget`, así que en
// palabras de tres letras o menos esto tolera una letra donde antes exigía
// exactitud. Es seguro precisamente por la desambiguación: el distractor se mide
// con la misma vara, y si queda igual de cerca el resultado es 'close', no un
// veredicto inventado.
const pairDistance = (alternatives: string[], word: string): number => {
  const t = normalizeSpeech(word);
  if (!t) return Infinity;
  const tWords = t.split(' ');
  let best = Infinity;
  for (const alt of alternatives) {
    const h = normalizeSpeech(alt);
    if (!h) continue;
    if (h === t || h.includes(t)) return 0;
    const hWords = h.split(' ');
    // La palabra del objetivo PEOR emparejada manda: si una no aparece, no vale.
    let worst = 0;
    for (const tw of tWords) {
      let d = Infinity;
      for (const hw of hWords) d = Math.min(d, editDistance(hw, tw));
      worst = Math.max(worst, d);
    }
    best = Math.min(best, worst);
  }
  return best;
};

export function matchPair(alternatives: string[], target: string, foil: string): PairResult {
  const dt = pairDistance(alternatives, target);
  const df = pairDistance(alternatives, foil);

  if (dt === 0) return 'target';
  if (df === 0) return 'foil';
  if (dt <= 1 && dt < df) return 'target';
  if (df <= 1 && df < dt) return 'foil';
  // Empate a un fonema de distancia: el texto no distingue. Que lo resuelva el
  // adulto, y que al niño se le diga "casi" en vez de acusarle de nada.
  if (dt <= 1 && dt === df) return 'close';
  return matchTarget(alternatives, target) >= 1 ? 'close' : 'none';
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

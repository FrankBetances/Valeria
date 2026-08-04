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
import { voiceCorpusId, VoiceStyle } from './valeriaVoiceCorpus';
import { VOICE_ASSETS } from './valeriaVoiceAssets';
import { playVoiceAsset, stopVoiceAsset } from './valeriaVoicePlayback';
import { getLocale, assetLang, speechLocale, prefersLatinVoice } from './valeriaLocale';
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

const scoreVoice = (v: Speech.Voice): number => {
  const lang = (v.language ?? '').toLowerCase().replace('_', '-');
  // Lengua de la variedad activa: en galego/euskera se prefiere una voz NATIVA
  // del sistema (gl-*/eu-*) si está instalada; si no, se acepta una voz en
  // español como RESPALDO AUDIBLE (mejor acento castellano que silencio). El
  // castellano y el dominicano solo puntúan voces españolas.
  const loc = getLocale();
  const primary = loc === 'gl' ? 'gl' : loc === 'eu' ? 'eu' : 'es';
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

const speakChain = (text: string, opts: Speech.SpeechOptions, token: number, rateCeil = 1.3) => {
  const { onDone, onError, ...rest } = opts;
  // Perfil de prosodia de la variedad activa: decide si este enunciado se trocea
  // por frases o va de una tirada, y cuánto silencio se añade entre trozos. En
  // es-DO (voz del sistema) el troceo era la causa de las pausas anchas que
  // rompían el ritmo — ver valeriaSpeechProsody.
  const prosody = prosodyFor(getLocale());
  const sentences = splitForSpeech(text, prosody);
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
    // Una sola locución, pero con la puntuación de pausa larga normalizada: los
    // dos puntos de la petición («Di: cama») y los puntos suspensivos abrían un
    // hueco en mitad de la frase portadora, justo donde va el fonema objetivo.
    // No se toca ni una letra, así que el modelo fonético es el mismo.
    Speech.speak(tightenPauses(text), {
      language: ttsLang(),
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
export const speakVoiceSample = () => {
  const l = getLocale();
  speakToChild(l === 'gl' ? VOICE_SAMPLE_PHRASE_GL : l === 'eu' ? VOICE_SAMPLE_PHRASE_EU : VOICE_SAMPLE_PHRASE);
};

// Palabra objetivo bien articulada, muy despacio (modelado fonético).
export const speakWordSlow = (text: string) => {
  const t = text.toLowerCase();
  if (trySpokenAsset('slow', t, {})) return;
  speakEngine(t, { pitch: 1.1, rate: 0.6 });
};

// Modelo LENTO DE FRASE completa (ES-05): mismo estilo 'slow' que speakWordSlow
// (mismo length_scale en la síntesis pregenerada), pero sin minuscular ni
// aislar una sola palabra — repite el enunciado completo tal cual lo dijo el
// modelo normal, solo que más despacio. En Pares Mínimos el modelo objetivo SÍ
// es la palabra aislada (speakWordSlow es lo correcto ahí); esta función es
// solo para pantallas donde lo lento debe ser la frase entera, no un recorte.
export const speakPhraseSlow = (text: string) => {
  const t = text.replace(/\s+/g, ' ').trim();
  if (trySpokenAsset('slow', t, {})) return;
  speakEngine(t, { pitch: 1.05, rate: 0.65 });
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
// Selección del banco por variedad: galego (Celtia), euskera (HiTZ) o base
// castellana (es/es-DO). Mismas longitudes por categoría, así la
// anti-repetición de pickPhrase sigue valiendo en cualquier variedad.
const bankFor = <T,>(gl: T, eu: T, base: T): T => {
  const l = getLocale();
  return l === 'gl' ? gl : l === 'eu' ? eu : base;
};
export const praisePhrase = () => pickPhrase('praise', bankFor(PRAISE_BANK_GL, PRAISE_BANK_EU, PRAISE_BANK));
export const almostPhrase = () => pickPhrase('almost', bankFor(ALMOST_BANK_GL, ALMOST_BANK_EU, ALMOST_BANK));
export const noHearPhrase = () => pickPhrase('noHear', bankFor(NO_HEAR_BANK_GL, NO_HEAR_BANK_EU, NO_HEAR_BANK));
export const togetherPhrase = () => pickPhrase('together', bankFor(TOGETHER_BANK_GL, TOGETHER_BANK_EU, TOGETHER_BANK));

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

// Paquete del reconocedor LOCAL de Android (Android System Intelligence). El de
// red es 'com.google.android.googlequicksearchbox'. Fijar el paquete es selección
// dura del motor; `requiresOnDeviceRecognition` por sí solo es una garantía
// condicionada a que el dispositivo pueda cumplirla.
const ANDROID_ON_DEVICE_SERVICE = 'com.google.android.as';

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
  // Android: ¿está instalado el servicio local (Android System Intelligence)?
  serviceAvailable: boolean;
  // ¿Está DESCARGADO el paquete de idioma de esta variedad? (installedLocales,
  // no locales: "soportado" no es lo mismo que "instalado").
  localeInstalled: boolean;
  // ¿Tiene sentido ofrecerle al adulto descargarlo? (§3.3 paso 4)
  canOfferDownload: boolean;
}

// Se cachea por locale porque son llamadas nativas y esto corre en cada escucha.
const statusCache = new Map<string, AsrLocaleStatus>();

const redStatus = (locale: string): AsrLocaleStatus => ({
  locale,
  mode: 'red',
  deviceCapable: false,
  serviceAvailable: false,
  localeInstalled: false,
  canOfferDownload: false,
});

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
        localeInstalled: deviceCapable,
        canOfferDownload: false,
      };
    } else {
      const services: string[] = M.getSpeechRecognitionServices() ?? [];
      const serviceAvailable = services.includes(ANDROID_ON_DEVICE_SERVICE);

      let localeInstalled = false;
      if (deviceCapable && serviceAvailable) {
        // OJO: en Android 12 y anteriores esto devuelve listas vacías (la API
        // del sistema no existe), así que el resultado será "red". Es el lado
        // conservador y correcto: sin poder comprobarlo, no se promete nada.
        const { installedLocales } = await M.getSupportedLocales({
          androidRecognitionServicePackage: ANDROID_ON_DEVICE_SERVICE,
        });
        const installed = (installedLocales ?? []).map(localeKey);
        localeInstalled = installed.includes(key)
          || installed.some((l: string) => l.split('-')[0] === key.split('-')[0]);
      }

      st = {
        locale,
        mode: deviceCapable && serviceAvailable && localeInstalled ? 'local' : 'red',
        deviceCapable,
        serviceAvailable,
        localeInstalled,
        canOfferDownload:
          deviceCapable && serviceAvailable && !localeInstalled
          && Number(Platform.Version) >= ANDROID_DOWNLOAD_MIN_API,
      };
    }
  } catch (e) {
    st = redStatus(locale); // ante la duda, el comportamiento de siempre
  }

  statusCache.set(key, st);
  return st;
}

// Estado del reconocedor para la variedad activa (o la que se pida). Lo consume
// la tarjeta del adulto; `startListening` usa el mismo camino, así que lo que
// se muestra es exactamente lo que se va a pedir.
export async function asrLocaleStatus(locale?: string): Promise<AsrLocaleStatus | null> {
  if (!Asr) return null;
  return probeLocale(locale ?? speechLocale());
}

// Invalida el diagnóstico cacheado. Necesario tras descargar un paquete de
// idioma: sin esto, el `false` de antes de la descarga se quedaría pegado toda
// la sesión y el adulto vería "en red" con el paquete ya instalado.
export const forgetAsrLocale = (locale?: string): void => {
  if (locale) statusCache.delete(localeKey(locale));
  else statusCache.clear();
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

// ES-04 · Traducción de los códigos de error al indicador `noMatch`.
//
// PUNTO DELICADO DE LA MIGRACIÓN. La librería anterior devolvía códigos
// numéricos del SpeechRecognizer de Android y aquí se miraban dos: 6
// (SPEECH_TIMEOUT) y 7 (NO_MATCH). La nueva devuelve cadenas, y el equivalente
// exacto de ese par es "no-speech" ("No final speech was detected"), más el
// evento `nomatch`, que se emite cuando hay resultado final sin reconocimiento
// significativo. Se traduce SOLO eso, para que el comportamiento clínico salga
// de la migración exactamente igual que entró.
//
// Queda dicho, porque se ve al hacer la tabla: "network", "audio-capture",
// "busy" y "client" TAMBIÉN son fallos del motor y no del niño, y con la lógica
// de ES-04 tampoco deberían gastarle un intento. La librería vieja no los
// distinguía y esto los sigue tratando como antes. Ampliar el conjunto es una
// decisión clínica —va con el umbral que tiene que fijar ACOPROS (D6 del plan)—,
// no un detalle de la migración, y por eso no se hace aquí de tapadillo.
const NO_MATCH_ERRORS = new Set(['no-speech']);

// El permiso denegado NO es un fallo del motor: necesita acción del adulto, y la
// pantalla debe mostrarlo como tal en vez de tragárselo como un intento fallido.
const PERMISSION_ERRORS = new Set(['not-allowed', 'service-not-allowed']);

// Suscripciones activas del reconocedor. La librería devuelve objetos con
// .remove(); hay que soltarlas al parar o se acumulan entre escuchas.
let asrSubs: Array<{ remove: () => void }> = [];

const clearAsrSubs = (): void => {
  asrSubs.forEach((s) => { try { s.remove(); } catch (e) { /* noop */ } });
  asrSubs = [];
};

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
  const onDevice = (await probeLocale(locale)).mode === 'local';
  lastAsrMode = onDevice ? 'local' : 'red';
  // La telemetría particiona la tasa de noMatch por modo: sin eso, la cifra
  // agregada mezcla escuchas locales y de red y no permite decidir la fase.
  try { trackAsrMode(lastAsrMode, locale); } catch (e) { /* nunca romper por medir */ }

  clearAsrSubs();
  try {
    const sub = (name: string, fn: (e: any) => void) => {
      asrSubs.push(M.addListener(name, fn));
    };

    sub('result', (e: any) => {
      const alts: string[] = (e?.results ?? [])
        .map((r: any) => String(r?.transcript ?? ''))
        .filter((t: string) => t.length > 0);
      if (e?.isFinal) cb.onResult(alts);
      else if (alts.length) cb.onPartial?.(alts[0]);
    });

    // `nomatch`: resultado final sin reconocimiento significativo. Es fallo del
    // motor, igual que el viejo código 7.
    sub('nomatch', () => {
      cb.onError('No te escuché bien. ¡Probamos otra vez!', true);
    });

    sub('error', (e: any) => {
      const code = String(e?.error ?? '');
      if (PERMISSION_ERRORS.has(code)) {
        cb.onError('Concede el permiso de micrófono para jugar con la voz.', false);
        return;
      }
      cb.onError(
        NO_MATCH_ERRORS.has(code)
          ? 'No te escuché bien. ¡Probamos otra vez!'
          : 'No se pudo escuchar.',
        NO_MATCH_ERRORS.has(code),
      );
    });

    sub('end', () => cb.onEnd?.());

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

    M.start({
      lang: locale,
      // Sustituye a EXTRA_PARTIAL_RESULTS del intent: misma red de seguridad.
      interimResults: true,
      maxAlternatives: 5,
      // Fase A · que el audio no salga del teléfono cuando el dispositivo pueda.
      requiresOnDeviceRecognition: onDevice,
      ...(onDevice && Platform.OS === 'android'
        ? { androidRecognitionServicePackage: ANDROID_ON_DEVICE_SERVICE }
        : {}),
      // ES-04 · la ventana de escucha larga, intacta.
      ...(Platform.OS === 'android' ? { androidIntentOptions: ANDROID_LISTEN_EXTRAS } : {}),
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
export async function releaseListening(): Promise<void> {
  if (!Asr) return;
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

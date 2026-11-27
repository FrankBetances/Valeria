// ============================================================================
// Valeria+ · Reproductor de locuciones pre-generadas — Fase 1 (plan ILENIA/Nós)
// Reproduce los assets de voz neuronal del mapa VOICE_ASSETS con expo-audio.
// Convive con la Pista B de ruido babble (valeriaNoise): mismo modo de mezcla,
// y la voz se masteriza en build-time a -3 dBFS frente al babble a -6 dBFS,
// conservando la relación voz>ruido y el headroom anti-clipping del buffer.
//
// Un único slot de reproducción: empezar una locución detiene la anterior
// (la preempción de alto nivel — también frente a expo-speech — vive en
// valeriaVoice). Carga perezosa del módulo nativo, como valeriaNoise: si
// expo-audio no existe, playVoiceAsset devuelve false y el llamante cae al
// motor del sistema.
// ============================================================================

import { voiceAssetIds } from './valeriaVoiceAssets';

let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-audio');
  if (!ExpoAudio || typeof ExpoAudio.createAudioPlayer !== 'function') ExpoAudio = null;
} catch (e) {
  ExpoAudio = null;
}

let activePlayer: any = null;
let preloadPlayer: any = null;
let preloadedSource: number | null = null;
let activeSub: any = null;
let watchdogTimer: ReturnType<typeof setTimeout> | null = null;
let playGen = 0;
let modeSet = false;

export interface VoicePlaybackCallbacks {
  durationSec?: number;
  nextSource?: number;
  onDone?: () => void;
  onError?: () => void;
}

function clearWatchdog(): void {
  if (watchdogTimer !== null) {
    clearTimeout(watchdogTimer);
    watchdogTimer = null;
  }
}

function detachActiveListener(): void {
  clearWatchdog();
  if (activeSub) {
    try { activeSub.remove?.(); } catch (e) { /* noop */ }
    activeSub = null;
  }
}

function releasePlayer(p: any): void {
  if (!p) return;
  try { p.pause?.(); } catch (e) { /* noop */ }
  try { p.remove?.(); } catch (e) { /* noop */ }
}

function cleanup(): void {
  playGen += 1;
  detachActiveListener();
  releasePlayer(activePlayer);
  activePlayer = null;
  releasePlayer(preloadPlayer);
  preloadPlayer = null;
  preloadedSource = null;
}

// Detiene la locución en curso (si la hay) y libera ambos reproductores.
export const stopVoiceAsset = (): void => cleanup();

function loadSourceInto(existing: any, source: number): any {
  if (existing && typeof existing.replace === 'function') {
    existing.replace(source);
    return existing;
  }
  releasePlayer(existing);
  return ExpoAudio.createAudioPlayer(source);
}

// Reproduce un asset de voz reutilizando el reproductor y precargando el
// siguiente trozo en el segundo reproductor. Devuelve false si no se pudo
// arrancar (módulo nativo ausente o error de carga): el llamante usa expo-speech.
export function playVoiceAsset(source: number, cb: VoicePlaybackCallbacks = {}): boolean {
  if (!ExpoAudio) return false;
  const gen = ++playGen;
  try {
    if (!modeSet) {
      modeSet = true;
      // Mismo modo de mezcla que la Pista B: voz y babble conviven, y la app
      // suena aunque el conmutador de silencio de iOS esté activado.
      void ExpoAudio.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'mixWithOthers',
      });
    }
    detachActiveListener();
    if (activePlayer) {
      try { activePlayer.pause?.(); } catch (e) { /* noop */ }
    }

    if (preloadPlayer && preloadedSource === source) {
      const prevActive = activePlayer;
      activePlayer = preloadPlayer;
      preloadPlayer = prevActive;
      preloadedSource = null;
    } else {
      activePlayer = loadSourceInto(activePlayer, source);
    }

    let finished = false;
    activeSub = activePlayer.addListener('playbackStatusUpdate', (status: any) => {
      if (gen !== playGen || finished || !status?.didJustFinish) return;
      finished = true;
      detachActiveListener();
      cb.onDone?.();
    });

    const durationMs = typeof cb.durationSec === 'number' && cb.durationSec > 0
      ? Math.round(cb.durationSec * 1000)
      : 10000;
    watchdogTimer = setTimeout(() => {
      if (gen !== playGen || finished) return;
      finished = true;
      detachActiveListener();
      try { activePlayer?.pause?.(); } catch (e) { /* noop */ }
      cb.onError?.();
    }, durationMs + 1500);

    activePlayer.play();

    if (cb.nextSource !== undefined && cb.nextSource !== source) {
      try {
        preloadPlayer = loadSourceInto(preloadPlayer, cb.nextSource);
        preloadedSource = cb.nextSource;
      } catch (e) {
        releasePlayer(preloadPlayer);
        preloadPlayer = null;
        preloadedSource = null;
      }
    }
    return true;
  } catch (e) {
    cleanup();
    cb.onError?.();
    return false;
  }
}

// ---------------------------------------------------------------------------
// ¿Hay locuciones neuronales EMPAQUETADAS para esta lengua del corpus?
// ---------------------------------------------------------------------------
// El mapa VOICE_ASSETS es un fichero GENERADO por la tubería de voz, así que
// una lengua puede estar entera en el código y en el corpus y todavía no tener
// ni un .m4a — es el estado normal entre el merge del contenido y la ejecución
// de voice-assets.yml. La tarjeta de «Voz de la app» pregunta AQUÍ antes de
// prometer voz neuronal, en vez de deducirlo de la variedad elegida: decir «✓
// voz X» sin haber mirado es la clase de afirmación que la regla 0 prohíbe.
//
// Los ids castellanos no llevan prefijo (retro-compatibilidad del corpus), así
// que 'es' se resuelve por descarte: si hay algún id sin prefijo de lengua.
const LANG_PREFIXES = ['gl_', 'eu_', 'en_', 'ca_'];

export const hasAssetsFor = (lang: string): boolean => {
  const ids = voiceAssetIds();
  if (lang === 'es') return ids.some((id) => !LANG_PREFIXES.some((p) => id.startsWith(p)));
  return ids.some((id) => id.startsWith(`${lang}_`));
};

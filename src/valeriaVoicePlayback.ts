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

import { VOICE_ASSETS } from './valeriaVoiceAssets';

let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-audio');
  if (!ExpoAudio || typeof ExpoAudio.createAudioPlayer !== 'function') ExpoAudio = null;
} catch (e) {
  ExpoAudio = null;
}

let current: { player: any; sub: any } | null = null;
let modeSet = false;

export interface VoicePlaybackCallbacks {
  onDone?: () => void;
  onError?: () => void;
}

function cleanup(): void {
  if (!current) return;
  try { current.sub?.remove?.(); } catch (e) { /* noop */ }
  try { current.player.pause(); current.player.remove(); } catch (e) { /* noop */ }
  current = null;
}

// Detiene la locución en curso (si la hay). No dispara onDone/onError.
export const stopVoiceAsset = (): void => cleanup();

// Reproduce un asset de voz. Devuelve false si no se pudo arrancar (módulo
// nativo ausente o error de carga): el llamante debe usar expo-speech.
export function playVoiceAsset(source: number, cb: VoicePlaybackCallbacks = {}): boolean {
  if (!ExpoAudio) return false;
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
    cleanup();
    const player = ExpoAudio.createAudioPlayer(source);
    let finished = false;
    const sub = player.addListener('playbackStatusUpdate', (status: any) => {
      if (finished || !status?.didJustFinish) return;
      finished = true;
      cleanup();
      cb.onDone?.();
    });
    current = { player, sub };
    player.play();
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
  const ids = Object.keys(VOICE_ASSETS);
  if (lang === 'es') return ids.some((id) => !LANG_PREFIXES.some((p) => id.startsWith(p)));
  return ids.some((id) => id.startsWith(`${lang}_`));
};

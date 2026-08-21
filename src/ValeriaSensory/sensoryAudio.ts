// ============================================================================
// Valeria+ · Integración Sensorial — Reproductor del estímulo
//
// El módulo nació sin esto: había catálogo, vúmetro y un rótulo que decía
// «Sonido en reproducción» con silencio absoluto detrás. Una desensibilización
// sistemática sin estímulo no es una desensibilización, y un rótulo que afirma
// lo que no ocurre es peor que una pantalla vacía.
//
// ── MURO REGULATORIO (el mismo de valeriaNoise.ts) ─────────────────────────
// Aquí NO hay medida, ni adaptación, ni sugerencia de nivel. La ganancia sale
// EXCLUSIVAMENTE del selector 1-5 que el adulto toca en la pantalla de
// preparación. Automatizarla —subir porque el niño «va bien», bajar porque se
// ha movido— convertiría el ejercicio en un procedimiento adaptativo y a la app
// en otra clase de producto. Cualquier PR que lo haga debe rechazarse.
//
// Los cinco niveles NO son decibelios absolutos y la interfaz no los llama así:
// el volumen real depende del aparato, del altavoz y de dónde esté el teléfono.
// Es intensidad RELATIVA, que es lo único honesto que se puede ofrecer sin
// calibrar hardware.
// ───────────────────────────────────────────────────────────────────────────
//
// Degradación elegante: expo-audio se carga perezosamente. Si el módulo nativo
// no existe —Expo web, builds antiguas—, `sensoryAudioSupported()` devuelve
// false y la pantalla lo DICE en vez de fingir que suena.
// ============================================================================
import { SensoryTriggerId } from './sensoryTypes';
import { SENSORY_TRIGGERS } from './sensoryCatalog';

let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-audio');
  if (!ExpoAudio || typeof ExpoAudio.createAudioPlayer !== 'function') ExpoAudio = null;
} catch (e) {
  ExpoAudio = null;
}

export const sensoryAudioSupported = (): boolean => ExpoAudio != null;

/**
 * Los once WAV, con `require` LITERAL. Metro resuelve los assets en tiempo de
 * empaquetado: `require('../assets/audio/' + clave)` compila y luego no
 * encuentra nada en el APK. Esta tabla es fea a propósito y no puede
 * sustituirse por una plantilla.
 *
 * Los ficheros los sintetiza scripts/generate-sensory-assets.js y los vigila
 * scripts/check-sensory-assets.js.
 */
const ASSETS: Record<string, number> = {
  sensory_vacuum_loop: require('../../assets/audio/sensory_vacuum_loop.wav'),
  sensory_blender_loop: require('../../assets/audio/sensory_blender_loop.wav'),
  sensory_hairdryer_loop: require('../../assets/audio/sensory_hairdryer_loop.wav'),
  sensory_hand_dryer_loop: require('../../assets/audio/sensory_hand_dryer_loop.wav'),
  sensory_thunder_loop: require('../../assets/audio/sensory_thunder_loop.wav'),
  sensory_siren_loop: require('../../assets/audio/sensory_siren_loop.wav'),
  sensory_fireworks_loop: require('../../assets/audio/sensory_fireworks_loop.wav'),
  sensory_school_bell_loop: require('../../assets/audio/sensory_school_bell_loop.wav'),
  sensory_classroom_loop: require('../../assets/audio/sensory_classroom_loop.wav'),
  sensory_mall_loop: require('../../assets/audio/sensory_mall_loop.wav'),
  sensory_street_loop: require('../../assets/audio/sensory_street_loop.wav'),
};

/**
 * Nivel relativo 1-5 → ganancia lineal. Tabla explícita, no una fórmula: cada
 * salto son ~5 dB, la escala arranca muy abajo (nivel 1 es sub-umbral en una
 * habitación normal, que es donde empieza una jerarquía) y el techo se queda
 * en 0,62 para que el estímulo NUNCA salga a fondo de escala del aparato.
 */
const GAIN_BY_LEVEL: Record<number, number> = {
  1: 0.06,
  2: 0.12,
  3: 0.22,
  4: 0.38,
  5: 0.62,
};

const FADE_MS = 280;      // rampa de entrada y de salida
const FADE_STEPS = 14;    // ~20 ms por escalón: inaudible y barato

let player: any = null;
let loadedKey: string | null = null;
let modeSet = false;
let fadeTimer: ReturnType<typeof setInterval> | null = null;
let targetGain = 0;

const clearFade = (): void => {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
};

/** Rampa lineal hasta `to`. Sin rampa, el arranque es un clic: el transitorio
 *  exacto que dispara al niño con sobre-responsividad. */
const fadeTo = (to: number, onDone?: () => void): void => {
  clearFade();
  if (!player) return;
  const from = typeof player.volume === 'number' ? player.volume : 0;
  const step = (to - from) / FADE_STEPS;
  let k = 0;
  fadeTimer = setInterval(() => {
    k += 1;
    if (!player) { clearFade(); return; }
    try {
      player.volume = k >= FADE_STEPS ? to : from + step * k;
    } catch (e) { /* el nativo se fue: no hay nada que rampar */ }
    if (k >= FADE_STEPS) {
      clearFade();
      onDone?.();
    }
  }, Math.round(FADE_MS / FADE_STEPS));
};

/**
 * Deja el estímulo cargado y en silencio. Se llama al entrar en la exploración,
 * ANTES de la cuenta atrás: cargar en el momento del toque metería un retardo
 * variable entre el dedo del niño y el sonido, y la agencia («mi botón») se
 * sostiene precisamente en que la relación sea inmediata y siempre igual.
 */
export async function prepareStimulus(triggerId: SensoryTriggerId): Promise<boolean> {
  if (!ExpoAudio) return false;
  const key = SENSORY_TRIGGERS[triggerId]?.audioAssetKey;
  const asset = key ? ASSETS[key] : undefined;
  if (!asset) return false;
  try {
    if (!modeSet) {
      modeSet = true;
      await ExpoAudio.setAudioModeAsync({
        playsInSilentMode: true,       // la familia suele traer el iPhone en silencio
        shouldPlayInBackground: false, // sale de la app → se acaba la exposición
        interruptionMode: 'mixWithOthers',
      });
    }
    if (loadedKey !== key) {
      releaseStimulus();
      player = ExpoAudio.createAudioPlayer(asset);
      player.loop = true;
      player.volume = 0;
      loadedKey = key;
    }
    return true;
  } catch (e) {
    player = null;
    loadedKey = null;
    return false;
  }
}

/** Arranca la exposición con rampa. `level` es el 1-5 que fijó el adulto. */
export function startStimulus(level: number): void {
  if (!player) return;
  targetGain = GAIN_BY_LEVEL[Math.max(1, Math.min(5, Math.trunc(level)))] ?? GAIN_BY_LEVEL[2];
  try {
    player.volume = 0;
    player.play();
  } catch (e) { return; }
  fadeTo(targetGain);
}

/**
 * Para el estímulo con rampa de salida y deja el reproductor listo para otra
 * vuelta. Es lo que ejecuta la pausa segura, el botón de detener y el final del
 * turno: parar SIEMPRE es instantáneo para el niño y suave para el oído.
 */
export function stopStimulus(): void {
  if (!player) return;
  fadeTo(0, () => {
    try {
      player?.pause();
      // `seekTo`, no `currentTime = 0`: en expo-audio la posición es de lectura
      // y asignarla no rebobina nada. El siguiente turno tiene que empezar por
      // el principio del bucle, no donde se quedó el anterior.
      void player?.seekTo?.(0);
    } catch (e) { /* ya no está: nada que parar */ }
  });
}

/** Cambio de nivel en caliente. Solo lo llama el gesto del adulto. */
export function setStimulusLevel(level: number): void {
  targetGain = GAIN_BY_LEVEL[Math.max(1, Math.min(5, Math.trunc(level)))] ?? GAIN_BY_LEVEL[2];
  if (player && player.playing) fadeTo(targetGain);
}

/** Suelta el nativo. Obligatorio al desmontar la pantalla. */
export function releaseStimulus(): void {
  clearFade();
  try {
    player?.remove?.();
  } catch (e) { /* nada que soltar */ }
  player = null;
  loadedKey = null;
}

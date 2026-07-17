// ============================================================================
// Valeria+ · Módulo de Agitación Acústica — Ruido Babble (Fase 2.1)
// Reproductor de audio DUAL para escucha en ruido:
//   · Pista A: la instrucción TTS (expo-speech, valeriaVoice) — no se toca.
//   · Pista B: ruido competitivo local (babble de cafetería, bucle sin costura)
//     reproducido con expo-audio en modo mezcla, POR DEBAJO de la voz.
//
// ── RESTRICCIÓN CRÍTICA (muro regulatorio MDR) ─────────────────────────────
// Este módulo NO implementa ningún algoritmo de ajuste Señal/Ruido, ni mide,
// ni adapta, ni sugiere niveles. El volumen de la Pista B muta EXCLUSIVAMENTE
// por el gesto manual del adulto en ManualNoiseSlider. Automatizarlo
// convertiría la app en un audiómetro algorítmico (SaMD). Cualquier PR que
// añada lógica de adaptación aquí debe rechazarse.
// ───────────────────────────────────────────────────────────────────────────
//
// Prevención de saturación/clipping en el buffer de Android:
//   · El asset está masterizado a -6 dBFS de pico (ver scripts/generate-babble.js).
//   · La ganancia máxima de la Pista B se limita a 0.8 y la curva es
//     perceptual (x^1.5), de modo que TTS a plena escala + babble nunca
//     exceden el rango del mezclador nativo.
//   · Los cambios de volumen durante el arrastre se acotan a uno cada 80 ms
//     (throttle): sin tormentas de llamadas al módulo nativo en gama baja.
//
// Degradación elegante: expo-audio se carga perezosamente; si el módulo nativo
// no existe (web/builds antiguas), noiseSupported() devuelve false y la UI
// oculta el slider. Nada revienta.
// ============================================================================

// Carga perezosa del módulo nativo (mismo patrón que el ASR en valeriaVoice).
let ExpoAudio: any = null;
try {
  ExpoAudio = require('expo-audio');
  if (!ExpoAudio || typeof ExpoAudio.createAudioPlayer !== 'function') ExpoAudio = null;
} catch (e) {
  ExpoAudio = null;
}

export const noiseSupported = (): boolean => ExpoAudio != null;

const MAX_GAIN = 0.8;       // techo anti-clipping de la Pista B
const THROTTLE_MS = 80;     // mínimo entre escrituras de volumen al nativo

let player: any = null;
let currentLevel = 0;       // 0-10, espejo del slider manual
let lastVolumeWrite = 0;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let modeSet = false;

// Nivel manual (0-10) → ganancia lineal con curva perceptual y techo -2 dB.
const levelToGain = (level: number): number => MAX_GAIN * Math.pow(level / 10, 1.5);

async function ensurePlayer(): Promise<any> {
  if (!ExpoAudio) return null;
  if (player) return player;
  try {
    if (!modeSet) {
      modeSet = true;
      // Modo mezcla: la Pista B debe CONVIVIR con el TTS, nunca pausarlo.
      // (playsInSilentMode: la familia suele tener el conmutador iOS en silencio.)
      await ExpoAudio.setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'mixWithOthers',
      });
    }
    player = ExpoAudio.createAudioPlayer(require('../assets/audio/babble-cafeteria.wav'));
    player.loop = true;
    player.volume = 0;
    return player;
  } catch (e) {
    player = null;
    return null;
  }
}

function applyLevel(level: number): void {
  if (!player) return;
  try {
    if (level <= 0) {
      player.volume = 0;
      player.pause(); // nivel 0 = silencio real: no quemar batería con volumen 0
    } else {
      player.volume = levelToGain(level);
      if (!player.playing) player.play();
    }
  } catch (e) { /* reproductor liberado a mitad de gesto: ignorar */ }
}

// Fija el nivel de la Pista B por INPUT MANUAL del adulto. Throttle con cola:
// durante el arrastre se aplica como mucho una escritura cada 80 ms y siempre
// queda programada la última posición del dedo (el nivel final nunca se pierde).
export function setNoiseLevel(level: number): void {
  currentLevel = Math.max(0, Math.min(10, Math.round(level)));
  const write = () => {
    lastVolumeWrite = Date.now();
    void ensurePlayer().then(() => applyLevel(currentLevel));
  };
  const elapsed = Date.now() - lastVolumeWrite;
  if (elapsed >= THROTTLE_MS) {
    write();
  } else if (!pendingTimer) {
    pendingTimer = setTimeout(() => { pendingTimer = null; write(); }, THROTTLE_MS - elapsed);
  }
}

export const getNoiseLevel = (): number => currentLevel;

// Apaga la Pista B y libera el reproductor (al salir de la pantalla anfitriona).
export function releaseNoise(): void {
  if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
  currentLevel = 0;
  if (player) {
    try { player.pause(); player.remove(); } catch (e) { /* noop */ }
    player = null;
  }
}

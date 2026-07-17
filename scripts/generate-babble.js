#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Generador del asset de ruido babble (Fase 2.1)
 *   node scripts/generate-babble.js  →  assets/audio/babble-cafeteria.wav
 *
 * Sintetiza "ruido de cafetería/patio": 12 voces simuladas, cada una como
 * ruido blanco filtrado por dos resonadores (formantes F1/F2 que vagan entre
 * sílabas) con envolvente silábica de 4-7 Hz y pausas aleatorias. El resultado
 * es un murmullo multi-hablante ininteligible (babble), el enmascarador
 * estándar en entrenamiento de escucha en ruido.
 *
 * Decisiones de audio:
 *   · Mono 16 kHz / 16 bit → ~250 KB por 8 s: apto para APK y RAM de gama baja.
 *   · Pico normalizado a -6 dBFS: headroom para que la MEZCLA babble + TTS
 *     nunca sature el buffer de salida de Android (prevención de clipping).
 *   · Bucle sin costura: crossfade de 500 ms entre cola y cabeza.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const SR = 16000;          // muestras/s
const LOOP_S = 8;          // duración del bucle
const GEN_S = 9;           // se genera 1 s extra para el crossfade
const XFADE_S = 0.5;
const VOICES = 12;

const N = SR * GEN_S;
const mix = new Float64Array(N);

let seed = 20260717;
const rand = () => {
  // LCG determinista: el asset es reproducible commit a commit.
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

// Resonador de dos polos (formante). r controla el ancho de banda.
const makeResonator = (freq, r) => {
  let y1 = 0, y2 = 0;
  const w = (2 * Math.PI * freq) / SR;
  const a1 = 2 * r * Math.cos(w), a2 = -r * r;
  const g = (1 - r) * 0.9; // compensación de ganancia aproximada
  return (x) => {
    const y = a1 * y1 + a2 * y2 + g * x;
    y2 = y1; y1 = y;
    return y;
  };
};

for (let v = 0; v < VOICES; v++) {
  const baseGain = 0.5 + rand() * 0.5;
  let i = 0;
  while (i < N) {
    // Sílaba de 120-260 ms; ~25% de sílabas son pausa (respiración/turno).
    const syllLen = Math.floor(SR * (0.12 + rand() * 0.14));
    const voiced = rand() > 0.25;
    if (!voiced) { i += syllLen; continue; }
    const f1 = 280 + rand() * 550;    // F1: 280-830 Hz
    const f2 = 900 + rand() * 1600;   // F2: 900-2500 Hz
    const res1 = makeResonator(f1, 0.97);
    const res2 = makeResonator(f2, 0.96);
    const amp = baseGain * (0.5 + rand() * 0.5);
    for (let k = 0; k < syllLen && i + k < N; k++) {
      const t = k / syllLen;
      const env = Math.sin(Math.PI * t) ** 1.5;         // ataque/caída silábicos
      const noise = rand() * 2 - 1;
      mix[i + k] += (res1(noise) + 0.7 * res2(noise)) * env * amp;
    }
    i += syllLen;
  }
}

// Bucle sin costura: crossfade cola (últimos 0,5 s del segundo 8-9) → cabeza.
const LOOP_N = SR * LOOP_S;
const F = Math.floor(SR * XFADE_S);
const out = new Float64Array(LOOP_N);
for (let i = 0; i < LOOP_N; i++) out[i] = mix[i];
for (let i = 0; i < F; i++) {
  const a = i / F;
  out[i] = out[i] * a + mix[LOOP_N + i] * (1 - a);
}

// Normalización a -6 dBFS de pico (0.5 en lineal): headroom anti-saturación.
let peak = 0;
for (let i = 0; i < LOOP_N; i++) peak = Math.max(peak, Math.abs(out[i]));
const norm = peak > 0 ? 0.5 / peak : 1;

// WAV PCM 16-bit mono.
const dataBytes = LOOP_N * 2;
const buf = Buffer.alloc(44 + dataBytes);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataBytes, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(dataBytes, 40);
for (let i = 0; i < LOOP_N; i++) {
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(out[i] * norm * 32767))), 44 + i * 2);
}

const dest = path.join(__dirname, '..', 'assets', 'audio', 'babble-cafeteria.wav');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, buf);
console.log(`OK → ${dest} (${(buf.length / 1024).toFixed(0)} KB, pico -6 dBFS)`);

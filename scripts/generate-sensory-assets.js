#!/usr/bin/env node
/* ============================================================================
 * Valeria+ · Sintetizador de los estímulos del módulo sensorial (ISA)
 *   node scripts/generate-sensory-assets.js  →  assets/audio/sensory-*.wav
 *
 * Once bucles: ocho sonidos aislados y tres ambientes ecológicos. Ninguno es
 * una grabación. Se sintetizan aquí por tres razones que no son estéticas:
 *
 *   1 · Procedencia. Un expediente técnico MDR tiene que poder decir de dónde
 *       sale cada estímulo que se le presenta a un niño con hiperreactividad
 *       acústica. De un banco de sonidos no se puede; de estas 400 líneas sí.
 *   2 · Licencia. Cero terceros, cero atribución, cero revisión legal por cada
 *       sonido nuevo.
 *   3 · Reproducibilidad. LCG con semilla fija por estímulo: el WAV que sale
 *       hoy es byte a byte el que salió en el commit anterior, y CI puede
 *       comprobarlo.
 *
 * Decisiones de audio, heredadas de scripts/generate-babble.js:
 *   · Mono 16 kHz / 16 bit. 8 kHz de ancho de banda cubre todo lo que
 *     caracteriza a estos sonidos y deja los ficheros en ~200 KB.
 *   · Sonoridad común: -20 dBFS de RMS, con techo de pico en -6 dBFS. Es la
 *     decisión clínica del fichero. Normalizar solo por PICO —lo que hace
 *     generate-babble.js, que solo tiene un asset— dejaba el bitono de sirena
 *     16 dB por encima del aula: el nivel 3 del adulto habría significado
 *     cosas distintas según el sonido y la jerarquía de desensibilización
 *     habría dejado de ser una jerarquía. Los sonidos impulsivos (petardos,
 *     timbre) se quedan por debajo del RMS objetivo al topar con el pico, que
 *     es exactamente lo que hacen en el mundo real.
 *   · Bucle sin costura: se generan XFADE_S segundos de más y se funde la cola
 *     sobre la cabeza. En exposición no puede haber un clic: el clic es
 *     justamente el transitorio que dispara al niño que estamos tratando.
 *   · Sin silencio absoluto en ningún punto del bucle. Un hueco mudo dentro de
 *     una exposición se lee como "ya se acabó" y rompe la habituación.
 * ========================================================================== */
const fs = require('fs');
const path = require('path');

const SR = 16000;
const XFADE_S = 0.5;
const PEAK_CEIL = 0.5;   // techo de pico: -6 dBFS lineal (headroom anti-clipping)
const RMS_TARGET = 0.1;  // sonoridad común: -20 dBFS RMS

// --------------------------------------------------------------- utilidades
const lcg = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/** Resonador de dos polos (formante / modo de resonancia). */
const resonator = (freq, r) => {
  let y1 = 0, y2 = 0;
  const w = (2 * Math.PI * freq) / SR;
  const a1 = 2 * r * Math.cos(w), a2 = -r * r;
  const g = (1 - r) * 0.9;
  return (x) => {
    const y = a1 * y1 + a2 * y2 + g * x;
    y2 = y1; y1 = y;
    return y;
  };
};

/** Paso bajo de un polo. `fc` en Hz. */
const lowpass = (fc) => {
  const a = Math.exp((-2 * Math.PI * fc) / SR);
  let y = 0;
  return (x) => (y = (1 - a) * x + a * y);
};

/** Paso alto de un polo (le quita el continuo a los ruidos integrados). */
const highpass = (fc) => {
  const lp = lowpass(fc);
  return (x) => x - lp(x);
};

/** Ruido marrón: blanco integrado con fuga. Es la base de motores y tráfico. */
const brown = (rand) => {
  let y = 0;
  return () => {
    y = y * 0.985 + (rand() * 2 - 1) * 0.15;
    return y;
  };
};

/**
 * Reverberación de sala pequeña (Schroeder mínimo: cuatro peines y un
 * paso-todo). Es lo que separa "un murmullo" de "un murmullo EN un aula": sin
 * ella los ambientes suenan pegados al oído y no se reconocen como entorno.
 */
const roomReverb = (mix = 0.28, size = 1) => {
  const combs = [1687, 1601, 2053, 2251].map((d) => {
    const n = Math.max(1, Math.round(d * size));
    const buf = new Float64Array(n);
    let i = 0;
    const fb = 0.78;
    const damp = lowpass(3500);
    return (x) => {
      const out = buf[i];
      buf[i] = x + damp(out) * fb;
      i = (i + 1) % n;
      return out;
    };
  });
  const apBuf = new Float64Array(389);
  let ai = 0;
  const allpass = (x) => {
    const bufOut = apBuf[ai];
    const out = -x + bufOut;
    apBuf[ai] = x + bufOut * 0.5;
    ai = (ai + 1) % apBuf.length;
    return out;
  };
  return (x) => {
    let wet = 0;
    for (const c of combs) wet += c(x);
    wet = allpass(wet / combs.length);
    return x * (1 - mix) + wet * mix;
  };
};

/**
 * Murmullo multi-hablante (babble). Mismo motor que
 * scripts/generate-babble.js: ruido por dos formantes que vagan entre sílabas.
 * `child` sube F0/formantes: un aula suena a niños, un centro comercial no.
 */
const babbleInto = (buf, rand, { voices, gain, child = false, lpf = 8000 }) => {
  const N = buf.length;
  const lp = lowpass(lpf);
  const scratch = new Float64Array(N);
  for (let v = 0; v < voices; v++) {
    const baseGain = 0.5 + rand() * 0.5;
    let i = 0;
    while (i < N) {
      const syllLen = Math.floor(SR * (0.1 + rand() * 0.16));
      if (rand() < 0.3) { i += syllLen; continue; } // pausa de turno
      const f1 = (child ? 400 : 280) + rand() * (child ? 620 : 550);
      const f2 = (child ? 1300 : 900) + rand() * 1600;
      const r1 = resonator(f1, 0.97);
      const r2 = resonator(f2, 0.96);
      const amp = baseGain * (0.5 + rand() * 0.5);
      for (let k = 0; k < syllLen && i + k < N; k++) {
        const t = k / syllLen;
        const env = Math.sin(Math.PI * t) ** 1.5;
        const n = rand() * 2 - 1;
        scratch[i + k] += (r1(n) + 0.7 * r2(n)) * env * amp;
      }
      i += syllLen;
    }
  }
  for (let i = 0; i < N; i++) buf[i] += lp(scratch[i]) * gain;
};

/** Golpe seco con cuerpo grave: pasos, carritos, taladro, petardo. */
const impactInto = (buf, rand, at, { decay, tone, noiseGain, toneGain, lpf }) => {
  const start = Math.floor(at * SR);
  const len = Math.floor(decay * 5 * SR);
  const lp = lowpass(lpf);
  for (let k = 0; k < len && start + k < buf.length; k++) {
    const t = k / SR;
    const env = Math.exp(-t / decay);
    const n = lp(rand() * 2 - 1) * noiseGain;
    const s = Math.sin(2 * Math.PI * tone * t) * toneGain;
    buf[start + k] += (n + s) * env;
  }
};

// ------------------------------------------------------------- los estímulos
// `key` es el audioAssetKey del catálogo (src/ValeriaSensory/sensoryCatalog.ts).
// `base` es su baseFrequencyHz: no es decorativo, el gate comprueba que la
// energía del fichero cae donde dice la ficha.
const STIMULI = [
  {
    key: 'sensory_vacuum_loop', seed: 20260821, loop: 6, base: 120,
    render(buf, rand) {
      // Motor de colector: armónicos de 120 Hz con bamboleo lento + chorro de
      // aire ancho. Es la mezcla que hace reconocible a una aspiradora.
      const air1 = resonator(1750, 0.9);
      const air2 = resonator(3100, 0.86);
      const hiss = highpass(2600);
      const lp = lowpass(6500);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        const wobble = 1 + 0.012 * Math.sin(2 * Math.PI * 0.7 * t);
        let motor = 0;
        for (let h = 1; h <= 8; h++) motor += Math.sin(2 * Math.PI * 120 * h * wobble * t) / h;
        const n = rand() * 2 - 1;
        buf[i] = motor * 0.24 + lp(air1(n) * 0.8 + air2(n) * 0.6) * 1.2 + hiss(n) * 0.5;
      }
    },
  },
  {
    key: 'sensory_blender_loop', seed: 20260822, loop: 6, base: 90,
    render(buf, rand) {
      // Motor de 90 Hz muy armónico + troceo de cuchillas: la modulación de
      // amplitud a 24 Hz es lo que distingue "licuadora" de "aspiradora".
      const lp = lowpass(6000);
      const res = resonator(1200, 0.88);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        let motor = 0;
        for (let h = 1; h <= 12; h++) motor += Math.sin(2 * Math.PI * 90 * h * t) / h;
        const chop = 0.55 + 0.45 * Math.abs(Math.sin(2 * Math.PI * 24 * t));
        const n = rand() * 2 - 1;
        buf[i] = (motor * 0.3 + lp(res(n)) * 1.1 + n * 0.12) * chop;
      }
    },
  },
  {
    key: 'sensory_hairdryer_loop', seed: 20260823, loop: 6, base: 200,
    render(buf, rand) {
      // Turbina pequeña: ruido con dos resonancias medias-agudas y un tono de
      // motor a 200 Hz apenas audible por debajo.
      const r1 = resonator(950, 0.85);
      const r2 = resonator(2700, 0.82);
      const hiss = highpass(2200);
      const lp = lowpass(7000);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        const n = rand() * 2 - 1;
        const motor = Math.sin(2 * Math.PI * 200 * t) * 0.07 + Math.sin(2 * Math.PI * 400 * t) * 0.04;
        buf[i] = lp(r1(n) * 0.5 + r2(n) * 0.9 + n * 0.4) * 0.9 + hiss(n) * 1.3 + motor;
      }
    },
  },
  {
    key: 'sensory_hand_dryer_loop', seed: 20260824, loop: 6, base: 250,
    render(buf, rand) {
      // Secador de manos: chorro mucho más ancho y agudo que el de pelo, con
      // turbulencia lenta. Es el sonido de baño público que más consultas
      // genera, y por eso va aparte.
      const r1 = resonator(700, 0.8);
      const hiss = highpass(1800);
      const turb = lowpass(3);
      const lp = lowpass(7400);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        const n = rand() * 2 - 1;
        const swell = 1 + 0.18 * turb(rand() * 2 - 1);
        const motor = Math.sin(2 * Math.PI * 250 * t) * 0.06;
        buf[i] = (lp(r1(n) * 0.5 + n * 0.6) * 0.9 + hiss(n) * 1.6) * swell + motor;
      }
    },
  },
  {
    key: 'sensory_thunder_loop', seed: 20260825, loop: 8, base: 45,
    render(buf, rand) {
      // Tormenta: lecho de retumbo continuo (nunca silencio) y dos truenos
      // lejanos con ataque rápido y cola larga.
      const br = brown(rand);
      const hp = highpass(18);
      const lp = lowpass(320);
      for (let i = 0; i < buf.length; i++) {
        buf[i] = hp(lp(br())) * 2.2;
      }
      for (const at of [1.6, 5.1]) {
        const start = Math.floor(at * SR);
        const lpC = lowpass(900);
        const brC = brown(rand);
        for (let k = 0; k + start < buf.length && k < 3.2 * SR; k++) {
          const t = k / SR;
          const env = t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) / 0.75);
          buf[start + k] += (lpC(rand() * 2 - 1) * 0.8 + brC() * 2.4) * env * 1.6;
        }
      }
    },
  },
  {
    key: 'sensory_siren_loop', seed: 20260826, loop: 6, base: 650,
    render(buf, rand) {
      // Bitono de emergencia europeo: 650/900 Hz alternando cada 0,6 s. El
      // periodo divide el bucle en entero, así que el bucle no corta un tono.
      const lp = lowpass(4200);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        const f = Math.floor(t / 0.6) % 2 === 0 ? 650 : 900;
        const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5 * t);
        const ph = 2 * Math.PI * f * vib * t;
        // Cuadrada suavizada: fundamental + tercer y quinto armónico.
        const tone = Math.sin(ph) + Math.sin(3 * ph) / 3 + Math.sin(5 * ph) / 5;
        const seg = (t % 0.6) / 0.6;
        const env = Math.min(1, seg / 0.03) * Math.min(1, (1 - seg) / 0.03);
        buf[i] = lp(tone) * 0.75 * (0.85 + 0.15 * env) + (rand() * 2 - 1) * 0.02;
      }
    },
  },
  {
    key: 'sensory_fireworks_loop', seed: 20260827, loop: 8, base: 60,
    render(buf, rand) {
      // Pirotecnia: estampidos irregulares sobre un fondo lejano. Los
      // estampidos se colocan lejos de la zona de fundido para que el bucle no
      // parta uno por la mitad.
      const lpBed = lowpass(500);
      const brBed = brown(rand);
      for (let i = 0; i < buf.length; i++) buf[i] = lpBed(brBed()) * 0.7;
      let at = 0.35;
      while (at < 6.9) {
        const near = rand() > 0.45;
        impactInto(buf, rand, at, {
          decay: near ? 0.11 : 0.2,
          tone: near ? 62 : 44,
          noiseGain: near ? 1.5 : 0.7,
          toneGain: near ? 1.2 : 0.8,
          lpf: near ? 1600 : 700,
        });
        at += 0.25 + rand() * 1.1;
      }
    },
  },
  {
    key: 'sensory_school_bell_loop', seed: 20260828, loop: 6, base: 880,
    render(buf) {
      // Campana: parciales INARMÓNICOS (1 · 2 · 2,4 · 3 · 4,5 · 5,33). Con
      // armónicos enteros suena a órgano, no a timbre.
      const partials = [1, 2, 2.4, 3, 4.5, 5.33];
      const taus = [1.1, 0.85, 0.7, 0.6, 0.5, 0.45];
      for (let strike = 0; strike < 6; strike++) {
        const start = Math.floor(strike * 1.0 * SR);
        for (let k = 0; k + start < buf.length && k < 1.2 * SR; k++) {
          const t = k / SR;
          let s = 0;
          for (let p = 0; p < partials.length; p++) {
            s += Math.sin(2 * Math.PI * 880 * partials[p] * t) * Math.exp(-t / taus[p]) / (p * 0.6 + 1.5);
          }
          buf[start + k] += s;
        }
      }
    },
  },
  {
    key: 'sensory_classroom_loop', seed: 20260829, loop: 8, base: 500,
    render(buf, rand) {
      // Aula: seis voces infantiles, sillas que arrastran, dos risas y la
      // reverberación de una clase con paredes duras.
      babbleInto(buf, rand, { voices: 6, gain: 0.85, child: true, lpf: 5000 });
      for (const at of [1.2, 4.4, 6.6]) {
        const start = Math.floor(at * SR);
        const res = resonator(320, 0.96);
        const len = Math.floor(0.28 * SR);
        for (let k = 0; k < len && start + k < buf.length; k++) {
          const t = k / len;
          const env = Math.sin(Math.PI * t) ** 0.6;
          buf[start + k] += res(rand() * 2 - 1) * env * 1.6;
        }
      }
      for (const at of [2.6, 5.9]) {
        const start = Math.floor(at * SR);
        const r1 = resonator(700, 0.96);
        const len = Math.floor(0.9 * SR);
        for (let k = 0; k < len && start + k < buf.length; k++) {
          const t = k / SR;
          const laugh = 0.5 + 0.5 * Math.sin(2 * Math.PI * 7 * t);
          const env = Math.sin((Math.PI * k) / len);
          buf[start + k] += r1(rand() * 2 - 1) * laugh * env * 1.1;
        }
      }
      const rev = roomReverb(0.3, 1);
      for (let i = 0; i < buf.length; i++) buf[i] = rev(buf[i]);
    },
  },
  {
    key: 'sensory_mall_loop', seed: 20260830, loop: 8, base: 300,
    render(buf, rand) {
      // Centro comercial: murmullo difuso y lejano (paso bajo agresivo: la
      // distancia se oye como falta de agudos), carritos rodando, pasos y una
      // megafonía apagada que nunca se entiende.
      babbleInto(buf, rand, { voices: 14, gain: 0.5, child: false, lpf: 1600 });
      const roll = lowpass(260);
      const wob = lowpass(2.5);
      for (let i = 0; i < buf.length; i++) {
        buf[i] += roll(rand() * 2 - 1) * (0.9 + 0.6 * wob(rand() * 2 - 1)) * 1.1;
      }
      for (let n = 0; n < 18; n++) {
        impactInto(buf, rand, 0.2 + n * 0.43, {
          decay: 0.04, tone: 110, noiseGain: 0.5, toneGain: 0.25, lpf: 900,
        });
      }
      const pa = lowpass(900);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        if (t > 3.0 && t < 3.9) {
          const f = t < 3.4 ? 523 : 392; // dos notas de aviso, sin palabras
          buf[i] += pa(Math.sin(2 * Math.PI * f * t)) * 0.35;
        }
      }
      const rev = roomReverb(0.38, 1.6);
      for (let i = 0; i < buf.length; i++) buf[i] = rev(buf[i]);
    },
  },
  {
    key: 'sensory_street_loop', seed: 20260831, loop: 8, base: 200,
    render(buf, rand) {
      // Calle con obras: lecho de tráfico, dos coches que pasan (la resonancia
      // barre y vuelve: eso es lo que el oído lee como "se acerca y se va"),
      // un martillo neumático a rachas y bullicio lejano.
      const lpBed = lowpass(1400);
      const brBed = brown(rand);
      const roll = resonator(420, 0.86);
      for (let i = 0; i < buf.length; i++) {
        const n = rand() * 2 - 1;
        buf[i] = lpBed(brBed() * 1.6 + n * 0.12) * 1.4 + roll(n) * 0.5;
      }
      for (const at of [1.0, 5.2]) {
        const start = Math.floor(at * SR);
        const len = Math.floor(2.4 * SR);
        const res = resonator(500, 0.9);
        for (let k = 0; k < len && start + k < buf.length; k++) {
          const t = k / len;
          const env = Math.sin(Math.PI * t) ** 1.4;
          // El barrido va en la ganancia de una banda fija: un resonador con
          // frecuencia variable por muestra se vuelve inestable.
          const band = 0.5 + 0.5 * Math.sin(Math.PI * t);
          buf[start + k] += (res(rand() * 2 - 1) * band + (rand() * 2 - 1) * 0.25) * env * 1.5;
        }
      }
      for (const at of [2.3, 6.1]) {
        for (let n = 0; n < 14; n++) {
          impactInto(buf, rand, at + n * 0.085, {
            decay: 0.03, tone: 95, noiseGain: 1.6, toneGain: 0.6, lpf: 3400,
          });
        }
      }
      babbleInto(buf, rand, { voices: 5, gain: 0.28, child: false, lpf: 1400 });
    },
  },
];

// ------------------------------------------------------------------- salida
const writeWav = (samples, dest) => {
  const n = samples.length;
  const dataBytes = n * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataBytes, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(dataBytes, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  return buf.length;
};

const outDir = path.join(__dirname, '..', 'assets', 'audio');
let total = 0;

for (const st of STIMULI) {
  const loopN = Math.floor(st.loop * SR);
  const genN = loopN + Math.floor(XFADE_S * SR);
  const raw = new Float64Array(genN);
  st.render(raw, lcg(st.seed));

  // Bucle sin costura.
  const out = new Float64Array(loopN);
  const F = Math.floor(XFADE_S * SR);
  for (let i = 0; i < loopN; i++) out[i] = raw[i];
  for (let i = 0; i < F; i++) {
    const a = i / F;
    out[i] = out[i] * a + raw[loopN + i] * (1 - a);
  }

  // Normalización: RMS común y techo de pico. Ver cabecera — el nivel 3 tiene
  // que sonar igual de fuerte con la aspiradora que con el aula.
  let peak = 0, sq = 0;
  for (let i = 0; i < loopN; i++) {
    peak = Math.max(peak, Math.abs(out[i]));
    sq += out[i] * out[i];
  }
  const rms0 = Math.sqrt(sq / loopN);
  const norm = Math.min(
    rms0 > 0 ? RMS_TARGET / rms0 : 1,
    peak > 0 ? PEAK_CEIL / peak : 1,
  );
  for (let i = 0; i < loopN; i++) out[i] *= norm;

  let sum = 0;
  for (let i = 0; i < loopN; i++) sum += out[i] * out[i];
  const rms = Math.sqrt(sum / loopN);

  const bytes = writeWav(out, path.join(outDir, `${st.key}.wav`));
  total += bytes;
  console.log(
    `  ${st.key.padEnd(28)} ${st.loop}s  ${(bytes / 1024).toFixed(0).padStart(4)} KB  ` +
    `RMS ${(20 * Math.log10(rms)).toFixed(1)} dBFS`,
  );
}

console.log(`OK · ${STIMULI.length} estímulos · ${(total / 1024 / 1024).toFixed(2)} MB en assets/audio/`);

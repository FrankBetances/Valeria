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


/** Frase o grito suelto: dos formantes con envolvente silábica. Es lo que hace
 *  que en un ambiente se oiga «alguien», y no «gente». */
const utteranceInto = (buf, rand, at, { dur, gain, f1, f2, syll = 0.18 }) => {
  const start = Math.floor(at * SR);
  const n = Math.floor(dur * SR);
  const r1 = resonator(f1, 0.97);
  const r2 = resonator(f2, 0.96);
  let i = 0;
  while (i < n) {
    const len = Math.floor(SR * syll * (0.7 + rand() * 0.6));
    for (let k = 0; k < len && i + k < n && start + i + k < buf.length; k++) {
      const t = k / len;
      const env = Math.sin(Math.PI * t) ** 1.2;
      const x = rand() * 2 - 1;
      buf[start + i + k] += (r1(x) + 0.8 * r2(x)) * env * gain;
    }
    i += len + Math.floor(SR * 0.045);
  }
};

/** Golpe en metal: parciales inarmónicos que suenan y transitorio de percusión.
 *  Un martillo sobre una viga, no un martillo sobre un tambor. */
const metalHitInto = (buf, rand, at, { freq, decay, gain }) => {
  const start = Math.floor(at * SR);
  const n = Math.floor(decay * 4 * SR);
  const ratios = [1, 2.76, 5.4, 8.9];
  const lp = lowpass(6500);
  for (let k = 0; k < n && start + k < buf.length; k++) {
    const t = k / SR;
    let s = 0;
    for (let p = 0; p < ratios.length; p++) {
      s += Math.sin(2 * Math.PI * freq * ratios[p] * t) * Math.exp(-t / (decay / (p * 0.5 + 1))) / (p + 1.4);
    }
    const click = lp(rand() * 2 - 1) * Math.exp(-t / 0.008);
    buf[start + k] += (s + click * 1.5) * gain;
  }
};

/** Pitido electrónico: la marcha atrás de un camión, la caja del supermercado. */
const beepInto = (buf, at, { freq, dur, gain }) => {
  const start = Math.floor(at * SR);
  const n = Math.floor(dur * SR);
  const ramp = Math.floor(0.008 * SR);
  for (let k = 0; k < n && start + k < buf.length; k++) {
    const t = k / SR;
    const ph = 2 * Math.PI * freq * t;
    const env = Math.min(1, k / ramp) * Math.min(1, (n - k) / ramp);
    buf[start + k] += (Math.sin(ph) + Math.sin(3 * ph) / 3.5) * env * gain;
  }
};

/** Radial / amoladora: motor muy armónico y chispas, con caída de tono al
 *  morder el material. Sin esa caída suena a zumbido, no a herramienta. */
const grinderInto = (buf, rand, at, { dur, gain }) => {
  const start = Math.floor(at * SR);
  const n = Math.floor(dur * SR);
  const hp = highpass(1500);
  const lp = lowpass(7000);
  for (let k = 0; k < n && start + k < buf.length; k++) {
    const t = k / SR;
    const p = k / n;
    const f = 220 * (1 - 0.18 * Math.sin(Math.PI * p));
    let s = 0;
    for (let h = 1; h <= 14; h++) s += Math.sin(2 * Math.PI * f * h * t) / h;
    const env = Math.min(1, p / 0.06) * Math.min(1, (1 - p) / 0.08);
    buf[start + k] += (lp(s) * 0.35 + hp(rand() * 2 - 1) * 0.9) * env * gain;
  }
};

/** Chirrido de rueda: resonador muy estrecho con vaivén lento. */
const squeakInto = (buf, rand, from, to, gain) => {
  const s0 = Math.floor(from * SR);
  const s1 = Math.floor(to * SR);
  const res = resonator(2300, 0.995);
  for (let i = s0; i < s1 && i < buf.length; i++) {
    const t = (i - s0) / SR;
    const am = 0.5 + 0.5 * Math.sin(2 * Math.PI * 3.5 * t);
    const env = Math.sin((Math.PI * (i - s0)) / (s1 - s0));
    buf[i] += res(rand() * 2 - 1) * am * env * gain;
  }
};

/** Arrastre: una silla, una caja por el suelo. */
const scrapeInto = (buf, rand, at, { dur, freq, gain }) => {
  const start = Math.floor(at * SR);
  const n = Math.floor(dur * SR);
  const res = resonator(freq, 0.96);
  const hp = highpass(900);
  for (let k = 0; k < n && start + k < buf.length; k++) {
    const t = k / n;
    const env = Math.sin(Math.PI * t) ** 0.6;
    const x = rand() * 2 - 1;
    buf[start + k] += (res(x) * 1.2 + hp(x) * 0.35) * env * gain;
  }
};

/**
 * Fase de un tono con el tono VARIABLE (carga del motor, aire que cambia) y
 * que aun así cierra el bucle: la frecuencia base se reajusta para que el
 * número de ciclos en `loopS` sea entero. Sin esto, el fundido de la costura
 * suma dos fases distintas y el tono se hunde medio segundo en cada vuelta.
 * `mod(t)` es periódica en el bucle y vale alrededor de 1.
 */
const phaseTrack = (n, loopS, f0, mod) => {
  const L = Math.floor(loopS * SR);
  let acc = 0;
  for (let i = 0; i < L; i++) acc += mod(i / SR);
  const meanMod = acc / L;
  const f = Math.max(1, Math.round(f0 * loopS * meanMod)) / (loopS * meanMod);
  const ph = new Float64Array(n);
  let p = 0;
  for (let i = 0; i < n; i++) { ph[i] = p; p += (2 * Math.PI * f * mod((i % L) / SR)) / SR; }
  return ph;
};

/** Paso banda de dos polos con ganancia unitaria aproximada en el centro. */
const bandpass = (freq, q) => resonator(freq, Math.exp((-Math.PI * freq) / (q * SR)));

// ------------------------------------------------------------- los estímulos
// `key` es el audioAssetKey del catálogo (src/ValeriaSensory/sensoryCatalog.ts).
// `base` es su baseFrequencyHz: no es decorativo, el gate comprueba que la
// energía del fichero cae donde dice la ficha.
const STIMULI = [
  {
    key: 'sensory_vacuum_loop', seed: 20260821, loop: 6, base: 760,
    render(buf, rand) {
      // Aspiradora. La versión anterior era un zumbido grave de 120 Hz con
      // armónicos —la firma de un motor de explosión al ralentí— y ACOPROS la
      // oyó como una moto (SEN-02). Una aspiradora es lo contrario: motor
      // universal muy rápido (silbido agudo, ~760 Hz) más el rugido ancho del
      // aire aspirado, casi sin graves. Lo que la delata es el VAIVÉN: al
      // empujar y tirar del cepillo sobre la alfombra, el aire se ahoga y se
      // abre y el silbido sube y baja un poco, dos veces por segundo y medio.
      const stroke = (t) => 0.5 + 0.5 * Math.sin(2 * Math.PI * (2 / 3) * t); // 4 ciclos en 6 s
      // El silbido del motor no cambia de tono: es lo que da una frecuencia
      // dominante estable (la de la ficha). El vaivén va en el aire.
      const ph = phaseTrack(buf.length, 6, 760, () => 1);
      const fan = phaseTrack(buf.length, 6, 2950, (t) => 1 + 0.035 * stroke(t));
      const a1 = bandpass(1400, 1.6), a2 = bandpass(2700, 2.2), a3 = bandpass(4300, 2.5);
      const hp = highpass(260);
      const lp = lowpass(7200);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        const k = stroke(t);
        const n = rand() * 2 - 1;
        const air = a1(n) * (0.7 + 0.5 * k) + a2(n) * (0.8 + 0.6 * k) + a3(n) * 0.7;
        const whine = Math.sin(ph[i]) + 0.45 * Math.sin(2 * ph[i]) + 0.2 * Math.sin(3 * ph[i]);
        buf[i] = hp(lp(air * 1.6 + whine * 0.12 + Math.sin(fan[i]) * 0.05));
      }
    },
  },
  {
    key: 'sensory_blender_loop', seed: 20260822, loop: 6, base: 420,
    render(buf, rand) {
      // Licuadora. Lo que la identifica no es el motor sino lo que tiene
      // DENTRO: trozos que golpean el vaso y frenan las cuchillas. El motor
      // (zumbido áspero, ~420 Hz) cae de tono cada vez que muerde y se
      // recupera; encima, el traqueteo de hielo contra el vidrio y el remolino
      // del líquido. Sin el traqueteo era otro motor más.
      const bite = (t) => {
        const c = (t % 1.5) / 1.5; // cuatro mordidas por vuelta de 6 s
        return c < 0.12 ? 1 - 0.14 * Math.sin((Math.PI * c) / 0.12) : 1;
      };
      const ph = phaseTrack(buf.length, 6, 420, bite);
      const glass = bandpass(2300, 9);
      const swirl = bandpass(650, 1.2);
      const swirlLfo = lowpass(6);
      const lp = lowpass(6800);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        // Diente de sierra suavizado: más áspero que un seno, como un motor
        // pequeño que va forzado.
        let motor = 0;
        for (let h = 1; h <= 9; h++) motor += Math.sin(h * ph[i]) / h;
        const n = rand() * 2 - 1;
        const sw = swirl(n) * (0.7 + 0.6 * Math.abs(swirlLfo(rand() * 2 - 1)) * 6);
        buf[i] = lp(motor * 0.32 + sw * 0.9);
      }
      // Traqueteo: golpes cortos y brillantes contra el vaso, en ráfagas justo
      // después de cada mordida.
      for (let burst = 0; burst < 5; burst++) {
        const t0 = burst * 1.5;
        for (let k = 0; k < 9; k++) {
          const at = t0 + 0.02 + k * (0.045 + rand() * 0.05);
          const start = Math.floor(at * SR);
          const len = Math.floor(0.03 * SR);
          const g = 0.9 + rand() * 0.8;
          for (let j = 0; j < len && start + j < buf.length; j++) {
            buf[start + j] += glass(rand() * 2 - 1) * Math.exp(-j / (0.006 * SR)) * g * 6;
          }
        }
      }
    },
  },
  {
    key: 'sensory_hairdryer_loop', seed: 20260823, loop: 6, base: 1900,
    render(buf, rand) {
      // Secador de pelo. Soplido suave y redondo, centrado en los medios, con un
      // silbido fino de turbina (~1,9 kHz). Lo que lo separa del secador de
      // manos es el MOVIMIENTO: quien se seca el pelo mueve el secador, así que
      // el soplido se acerca y se aleja (sube, se aclara, baja) una vez cada
      // dos segundos. Antes los dos secadores medían casi igual.
      const wave = (t) => 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.5 * t); // 3 ciclos en 6 s
      const ph = phaseTrack(buf.length, 6, 1900, () => 1);
      const b1 = bandpass(900, 1.1), b2 = bandpass(1800, 1.4);
      const lp = lowpass(5200);
      const hp = highpass(180);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        const k = wave(t);
        const n = rand() * 2 - 1;
        const air = b1(n) * 1.0 + b2(n) * (0.5 + 0.7 * k);
        buf[i] = hp(lp(air * (0.6 + 0.55 * k) + Math.sin(ph[i]) * 0.035 * (0.5 + k)));
      }
    },
  },
  {
    key: 'sensory_hand_dryer_loop', seed: 20260824, loop: 6, base: 3400,
    render(buf, rand) {
      // Secador de manos de baño público (el de chorro, el que más molesta).
      // Chorro muy ancho y agudo con un pitido fuerte de turbina (~3,4 kHz)
      // y su subarmónico. Cuando las manos entran, el chorro choca con ellas:
      // el sonido se ahoga, se vuelve grave y el pitido baja; al sacarlas, se
      // dispara otra vez. Ese abrir-cerrar es lo que no tiene ningún otro.
      const hands = (t) => {
        const c = (t % 3) / 3; // dos pasadas de manos por vuelta
        const x = c < 0.1 ? c / 0.1 : c < 0.35 ? 1 : c < 0.45 ? (0.45 - c) / 0.1 : 0;
        return x;
      };
      const ph = phaseTrack(buf.length, 6, 3400, (t) => 1 - 0.06 * hands(t));
      const roar = bandpass(2600, 0.9);
      const hiss = highpass(3000);
      const thud = bandpass(320, 1.3);
      const hpJet = highpass(900);
      let lpState = 0;
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        const h = hands(t);
        const n = rand() * 2 - 1;
        const open = hpJet(roar(n) * 1.1 + hiss(n) * 1.3) + (Math.sin(ph[i]) + 0.5 * Math.sin(0.5 * ph[i])) * 0.12;
        // Ahogo por las manos: paso bajo que se cierra (7 kHz → 1,6 kHz) y un
        // golpe de aire grave que solo existe con las manos dentro.
        const fc = 7400 - 5000 * h;
        const a = Math.exp((-2 * Math.PI * fc) / SR);
        lpState = (1 - a) * open + a * lpState;
        buf[i] = lpState * (1 - 0.25 * h) + thud(n) * 0.5 * h;
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
      // Pirotecnia. Un estampido solo es un portazo o un trueno: lo que dice
      // «fuegos artificiales» es la SECUENCIA — el silbido que sube, el
      // estampido y el chisporroteo que cae después. Dos cohetes completos y
      // petardos sueltos, sobre un fondo lejano que nunca llega a silencio.
      const lpBed = lowpass(500);
      const brBed = brown(rand);
      for (let i = 0; i < buf.length; i++) buf[i] = lpBed(brBed()) * 0.7;

      const rocket = (at) => {
        // Silbido ascendente de 0,9 s (900 → 2600 Hz), bajo y con aire.
        const s0 = Math.floor(at * SR);
        const len = Math.floor(0.9 * SR);
        let p = 0;
        const air = bandpass(1800, 2);
        for (let k = 0; k < len && s0 + k < buf.length; k++) {
          const x = k / len;
          p += (2 * Math.PI * (900 + 1700 * x * x)) / SR;
          const env = Math.min(1, x / 0.1) * (1 - 0.3 * x);
          buf[s0 + k] += (Math.sin(p) * 0.6 + air(rand() * 2 - 1) * 0.5) * env;
        }
        const boom = at + 0.95;
        impactInto(buf, rand, boom, { decay: 0.18, tone: 55, noiseGain: 1.8, toneGain: 1.4, lpf: 1500 });
        // Chisporroteo: chasquidos diminutos que se espacian y se apagan.
        const crack = highpass(1800);
        for (let c = 0; c < 120; c++) {
          const tc = boom + 0.15 + rand() * 1.4;
          const st = Math.floor(tc * SR);
          const g = 0.5 * Math.exp(-(tc - boom) / 0.8);
          for (let k = 0; k < 40 && st + k < buf.length; k++) {
            buf[st + k] += crack(rand() * 2 - 1) * Math.exp(-k / 8) * g;
          }
        }
      };
      rocket(0.4);
      rocket(4.3);
      // Petardos sueltos entre cohete y cohete.
      for (const at of [2.9, 3.3, 6.9, 7.15]) {
        impactInto(buf, rand, at, { decay: 0.08, tone: 70, noiseGain: 1.6, toneGain: 1.0, lpf: 2200 });
      }
    },
  },
  {
    key: 'sensory_school_bell_loop', seed: 20260828, loop: 6, base: 880,
    render(buf, rand) {
      // Timbre de colegio: ELÉCTRICO. Un martillo que golpea la campana unas
      // veinte veces por segundo y la deja vibrando, en toques de 2,4 s. La
      // versión anterior daba seis campanadas sueltas, que es una campana de
      // iglesia o de mano, no el timbre del recreo. Entre toque y toque queda
      // el aire de un pasillo, nunca silencio absoluto.
      const partials = [1, 2.4, 2.9, 4.5, 5.33];
      const amps = [1, 0.55, 0.35, 0.22, 0.15];
      const taus = [0.45, 0.3, 0.25, 0.18, 0.14];
      const hall = lowpass(900);
      for (let i = 0; i < buf.length; i++) buf[i] = hall(rand() * 2 - 1) * 0.02;
      for (const ring of [0.2, 3.2]) {
        const strikes = Math.floor(2.4 * 21);
        for (let s = 0; s < strikes; s++) {
          const start = Math.floor((ring + s / 21) * SR);
          const vel = 0.75 + 0.25 * rand();
          for (let k = 0; k < Math.floor(0.6 * SR) && start + k < buf.length; k++) {
            const t = k / SR;
            let v = 0;
            for (let p = 0; p < partials.length; p++) {
              v += Math.sin(2 * Math.PI * 880 * partials[p] * t) * amps[p] * Math.exp(-t / taus[p]);
            }
            // Chasquido del martillo contra el metal.
            const tick = (rand() * 2 - 1) * Math.exp(-t / 0.0015) * 0.6;
            buf[start + k] += (v * 0.12 + tick) * vel;
          }
        }
      }
    },
  },
  {
    key: 'sensory_classroom_loop', soften: 4, seed: 20260829, loop: 10, base: 500,
    render(buf, rand) {
      // Aula de colegio. El murmullo de fondo no basta: un aula se reconoce por
      // los SUCESOS —la silla que arrastra, la risa del grupo, la maestra que
      // habla por encima—. La primera versión los tenía tan bajos que el
      // análisis del gate los daba como inexistentes: quedaba un zumbido.
      babbleInto(buf, rand, { voices: 5, gain: 0.5, child: true, lpf: 4500 });

      // La maestra: voz adulta, sílabas más largas y por encima del murmullo.
      utteranceInto(buf, rand, 0.5, { dur: 1.5, gain: 1.5, f1: 520, f2: 1500, syll: 0.22 });
      utteranceInto(buf, rand, 6.2, { dur: 1.3, gain: 1.4, f1: 480, f2: 1400, syll: 0.24 });

      // Un niño que llama, dos veces y más agudo.
      utteranceInto(buf, rand, 3.9, { dur: 0.55, gain: 1.7, f1: 780, f2: 2300, syll: 0.16 });
      utteranceInto(buf, rand, 8.9, { dur: 0.45, gain: 1.5, f1: 820, f2: 2500, syll: 0.15 });

      // Sillas arrastrando.
      for (const at of [1.4, 4.6, 8.2]) {
        scrapeInto(buf, rand, at, { dur: 0.32, freq: 320, gain: 2.4 });
      }

      // Risa de grupo: tres voces con el mismo pulso de 7 Hz.
      for (const at of [2.7, 7.4]) {
        for (let v = 0; v < 3; v++) {
          const start = Math.floor((at + v * 0.06) * SR);
          const r1 = resonator(650 + v * 180, 0.96);
          const len = Math.floor(0.85 * SR);
          for (let k = 0; k < len && start + k < buf.length; k++) {
            const t = k / SR;
            const laugh = 0.4 + 0.6 * Math.max(0, Math.sin(2 * Math.PI * 7 * t));
            const env = Math.sin((Math.PI * k) / len);
            buf[start + k] += r1(rand() * 2 - 1) * laugh * env * 1.5;
          }
        }
      }

      // Un libro que cae y un lápiz que rueda contra la mesa.
      impactInto(buf, rand, 3.3, { decay: 0.09, tone: 130, noiseGain: 1.4, toneGain: 0.7, lpf: 1800 });
      impactInto(buf, rand, 5.6, { decay: 0.04, tone: 320, noiseGain: 0.9, toneGain: 0.3, lpf: 3200 });

      const rev = roomReverb(0.28, 1);
      for (let i = 0; i < buf.length; i++) buf[i] = rev(buf[i]);
    },
  },
  {
    key: 'sensory_mall_loop', soften: 5, seed: 20260830, loop: 10, base: 300,
    render(buf, rand) {
      // Centro comercial. Murmullo LEJANO —la distancia se oye como falta de
      // agudos— y encima lo que de verdad lo identifica: carritos rodando con
      // una rueda que chirría, pasos, los pitidos de caja y una megafonía que
      // nunca se entiende.
      babbleInto(buf, rand, { voices: 12, gain: 0.34, child: false, lpf: 1600 });

      const roll = lowpass(240);
      const wob = lowpass(2.5);
      for (let i = 0; i < buf.length; i++) {
        buf[i] += roll(rand() * 2 - 1) * (0.8 + 0.6 * wob(rand() * 2 - 1)) * 0.45;
      }

      // La rueda mal engrasada, dos veces y en tramos largos.
      squeakInto(buf, rand, 2.2, 4.1, 3.2);
      squeakInto(buf, rand, 7.4, 9.0, 2.8);

      // Pasos sobre suelo duro.
      // Doce pasos, no veintidós: con uno cada 0,43 s el propio lecho se volvía
      // un suceso continuo y ya no sobresalía nada por encima.
      for (let n = 0; n < 12; n++) {
        impactInto(buf, rand, 0.35 + n * 0.78, {
          decay: 0.04, tone: 110, noiseGain: 0.55, toneGain: 0.25, lpf: 1400,
        });
      }

      // Caja de supermercado: el pitido del lector, cuatro veces.
      for (const at of [1.1, 3.6, 6.3, 9.3]) {
        beepInto(buf, at, { freq: 2700, dur: 0.09, gain: 1.0 });
      }

      // Megafonía: dos notas de aviso y una voz apagada detrás. No se entiende
      // ninguna palabra, y así tiene que ser: no hay texto en este fichero.
      const pa = lowpass(850);
      for (let i = 0; i < buf.length; i++) {
        const t = i / SR;
        if (t > 5.0 && t < 5.8) {
          const f = t < 5.4 ? 523 : 392;
          const env = Math.min(1, (t - 5.0) / 0.05) * Math.min(1, (5.8 - t) / 0.05);
          buf[i] += pa(Math.sin(2 * Math.PI * f * t)) * env * 1.0;
        }
      }
      utteranceInto(buf, rand, 5.9, { dur: 1.6, gain: 1.3, f1: 420, f2: 1100, syll: 0.2 });

      const rev = roomReverb(0.38, 1.6);
      for (let i = 0; i < buf.length; i++) buf[i] = rev(buf[i]);
    },
  },
  {
    key: 'sensory_street_loop', soften: 7, seed: 20260831, loop: 10, base: 200,
    render(buf, rand) {
      // Calle con obras. El lecho de tráfico es el DECORADO; lo que la hace
      // reconocible son los obreros trabajando: martillo neumático, golpes de
      // maza sobre metal, la radial y el pitido de marcha atrás de un camión.
      // La primera versión solo tenía retumbo y un taladro enterrado.
      const lpBed = lowpass(1400);
      const brBed = brown(rand);
      const roll = resonator(420, 0.86);
      for (let i = 0; i < buf.length; i++) {
        const n = rand() * 2 - 1;
        buf[i] = lpBed(brBed() * 1.4 + n * 0.12) * 0.28 + roll(n) * 0.1;
      }

      // Dos coches que pasan: la banda sube y baja, que es lo que el oído lee
      // como "se acerca y se va".
      for (const at of [0.8, 5.6]) {
        const start = Math.floor(at * SR);
        const len = Math.floor(2.2 * SR);
        const res = resonator(500, 0.9);
        for (let k = 0; k < len && start + k < buf.length; k++) {
          const t = k / len;
          const env = Math.sin(Math.PI * t) ** 1.4;
          const band = 0.5 + 0.5 * Math.sin(Math.PI * t);
          buf[start + k] += (res(rand() * 2 - 1) * band + (rand() * 2 - 1) * 0.3) * env * 0.85;
        }
      }

      // Martillo neumático: dos rachas de ~1,2 s a 11 golpes por segundo.
      for (const at of [2.0, 7.2]) {
        for (let n = 0; n < 14; n++) {
          impactInto(buf, rand, at + n * 0.085, {
            decay: 0.035, tone: 95, noiseGain: 4.2, toneGain: 1.5, lpf: 3600,
          });
        }
      }

      // Maza contra viga: cinco golpes espaciados, con el metal sonando.
      for (let n = 0; n < 5; n++) {
        metalHitInto(buf, rand, 3.6 + n * 0.42, { freq: 720, decay: 0.35, gain: 3.2 });
      }

      // Radial cortando, y el pitido de marcha atrás de un camión.
      grinderInto(buf, rand, 8.6, { dur: 1.1, gain: 1.6 });
      for (let n = 0; n < 3; n++) {
        beepInto(buf, 5.0 + n * 0.85, { freq: 1000, dur: 0.35, gain: 1.5 });
      }

      // Dos obreros que se dicen algo a gritos por encima del ruido.
      utteranceInto(buf, rand, 4.9, { dur: 0.6, gain: 2.0, f1: 560, f2: 1250, syll: 0.2 });
      utteranceInto(buf, rand, 9.4, { dur: 0.5, gain: 1.9, f1: 500, f2: 1150, syll: 0.18 });

      // Y el bullicio de calle, lejos.
      babbleInto(buf, rand, { voices: 5, gain: 0.16, child: false, lpf: 1400 });
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

  // Los AMBIENTES pasan por un limitador blando antes de normalizar. Un
  // ambiente se oye a distancia y sus picos no se disparan como un petardo a
  // dos metros: sin esto, la risa del aula y el libro que cae se comían todo el
  // margen de pico y el fichero entero se quedaba 8 dB por debajo del resto,
  // con el murmullo casi inaudible. Los impulsivos de verdad —petardos,
  // trueno, timbre— NO se tocan: su cresta es su identidad.
  if (st.soften) {
    let sq0 = 0;
    for (let i = 0; i < loopN; i++) sq0 += out[i] * out[i];
    const k = st.soften * Math.sqrt(sq0 / loopN);
    if (k > 0) for (let i = 0; i < loopN; i++) out[i] = Math.tanh(out[i] / k) * k;
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

// ============================================================================
// Valeria+ · Pares Mínimos en ESPAÑOL DOMINICANO (es-DO) — Quisqueya Habla
//
// ⚠️ ESTADO: borrador clínico PENDIENTE DE VALIDACIÓN por logopeda dominicano/a
// (o con experiencia en español caribeño). Aún no debe usarse en el piloto sin
// esa revisión (regla bloqueante QH-0.2). Alimenta el cableado por variedad y
// permite probar la selección de banco; el veredicto final siempre es del adulto.
//
// REGLA DE ORO (docs/guia-dialectal-es-DO.md): rasgo dialectal ≠ error clínico.
// Decisiones aplicadas al construir este banco:
//   1) SESEO universal: no existe el contraste /s/–/θ/. Se EXCLUYE casa/caza
//      (PM-5 castellano, marcado region:'distincion'). Ningún par depende de /θ/.
//   2) NEUTRALIZACIÓN de líquidas r→l en CODA ("puelta", "señol") es dialectal
//      normal: los pares de rotacismo se construyen SOLO en ATAQUE o posición
//      intervocálica (rana/lana, perro/pelo), NUNCA sobre codas.
//   3) Los procesos que sí se trabajan son procesos fonológicos infantiles
//      universales (no rasgos dialectales): frontalización velar (k→t),
//      oclusivización de fricativas (f→p, s→t) y despalatalización (tʃ→s).
//   4) Léxico y registro dominicanos en consignas y misiones (guagua, chichigua,
//      colmado, funda…) donde resulta natural, sin forzar el contraste fonético.
//
// El campo `region` NO se usa aquí (no hay distinción s/θ en RD). Protocolo:
// docs/protocolo-pares-minimos-es-DO.md
// ============================================================================
import { MinimalPair } from './valeriaMinimalPairs';

export const MINIMAL_PAIRS_ESDO: MinimalPair[] = [
  {
    id: 'do-rana-lana', code: 'PM-DO-1', group: 'Rotacismo',
    target: 'rana', targetEmoji: '🐸', foil: 'lana', foilEmoji: '🧶',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo inicial (ataque)',
    prompt: '¡Dile a papi cuál tú quiere! Di: rana.',
    onTarget: {
      say: '¡Rrrana! ¡Tu lengua sonó como un motor!',
      mission: '¡Brinca como una rana! Tres brinquitos hasta chocar los cinco con papi.',
    },
    onFoil: {
      say: 'Escuché lana, la del ovillo. Yo pedí rrrana. Oye bien…',
      cue: 'La lengua hace el motor detrás de los dientes: rrr.',
      mission: 'Mano en el cuello de papi: papi aguanta rrrr tres segundos y tú sientes la vibración. Después, al revés.',
    },
  },
  {
    id: 'do-rata-lata', code: 'PM-DO-2', group: 'Rotacismo',
    target: 'rata', targetEmoji: '🐀', foil: 'lata', foilEmoji: '🥫',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo inicial (generalización)',
    prompt: '¡Corre, corre! ¿Quién corre? Di: rata.',
    onTarget: {
      say: '¡Rrrata ligera! ¡Te salió la erre!',
      mission: '¡Corre como la rata! Persigue a papi por la sala hasta tocarle la espalda.',
    },
    onFoil: {
      say: 'Escuché lata, la del colmado. La lengua se quedó dormida. ¡Despiértala!: rrrata.',
      cue: 'Punta de la lengua arriba, que tiemble.',
      mission: 'Tambora de lengua: papi marca ta-ta-ta en las piernas y tú respondes ra-ra-ra, cada vez más rápido.',
    },
  },
  {
    id: 'do-perro-pelo', code: 'PM-DO-3', group: 'Rotacismo',
    target: 'perro', targetEmoji: '🐶', foil: 'pelo', foilEmoji: '💇',
    phoneme: 'r̄ → l', errorLabel: 'Rotacismo intervocálico',
    prompt: '¿Quién hace guau? ¡Díselo a papi! Di: perro.',
    onTarget: {
      say: '¡Perrro! ¡Qué erre tan fuerte!',
      mission: '¡A cuatro patas! Camina ladrando hasta papi y que te rasque la cabeza.',
    },
    onFoil: {
      say: 'Escuché pelo, el de la cabeza. El perro se quedó sin ladrar. Vamos: perrro.',
      cue: 'La erre es un motor largo en el medio de la palabra.',
      mission: 'Carrera de motores: agarra un guía imaginario frente a papi y aceleren con rrr a la vez.',
    },
  },
  {
    id: 'do-ocho-oso', code: 'PM-DO-4', group: 'Sigmatismo',
    target: 'ocho', targetEmoji: '8️⃣', foil: 'oso', foilEmoji: '🐻',
    phoneme: 'tʃ ↔ s', errorLabel: 'Despalatalización de africada',
    prompt: 'Después del siete viene… ¡di: ocho!',
    onTarget: {
      say: '¡Ocho! ¡Ese trencito arrancó bien!',
      mission: 'Tren del ocho: agárrate de la cintura de papi y den una vuelta en forma de ocho haciendo ch-ch-ch.',
    },
    onFoil: {
      say: 'Escuché oso, el peludo. Yo pedí ocho, el número. La che arranca como un tren: ocho.',
      cue: 'Labios de besito adelante y un golpe de tren: ch.',
      mission: 'Besito-tren: frente a frente, láncense una che como un pase de pelota invisible. Cinco pases seguidos.',
    },
  },
  {
    id: 'do-sopa-topa', code: 'PM-DO-5', group: 'Sigmatismo',
    target: 'saco', targetEmoji: '🎒', foil: 'taco', foilEmoji: '📐',
    phoneme: 's → t', errorLabel: 'Oclusivización de fricativa (s→t)',
    prompt: '¿Qué te pones en la espalda para la escuela? Di: saco.',
    onTarget: {
      say: '¡Saco! ¡Ese soplido salió largo!',
      mission: 'Ponte el saco imaginario y camina para la escuela dando pasos grandes con papi.',
    },
    onFoil: {
      say: 'Escuché taco, el de medir. La ese no explota: sopla largo. Saco.',
      cue: 'La te da un golpe; la ese es aire que no se acaba: sss.',
      mission: 'El molinillo: la palma de papi frente a tu boca. Con t-t-t siente golpes; con sss, un viento seguido que empuja la mano tres segundos.',
    },
  },
  {
    id: 'do-cubo-tubo', code: 'PM-DO-6', group: 'Velares',
    target: 'cubo', targetEmoji: '🪣', foil: 'tubo', foilEmoji: '🧪',
    phoneme: 'k → t', errorLabel: 'Frontalización velar inicial',
    prompt: '¿Con qué echamos agua en la playa? Di: cubo.',
    onTarget: {
      say: '¡Cubo! ¡Esa ca salió de la cueva de la garganta!',
      mission: 'Carga el cojín-cubo bien pesado hasta los pies de papi, que lo vacía alzándote en el aire.',
    },
    onFoil: {
      say: 'Escuché tubo, el del laboratorio. La ca del cubo nace atrás, en la cueva: cubo.',
      cue: 'La te vive en los dientes; la ca vive en el fondo de la garganta.',
      mission: 'Gárgaras del gigante: cabeza atrás y ca-ca-ca. Dedos debajo de la barbilla del otro para sentir dónde se mueve la ca.',
    },
  },
  {
    id: 'do-boca-bota', code: 'PM-DO-7', group: 'Velares',
    target: 'boca', targetEmoji: '👄', foil: 'bota', foilEmoji: '👢',
    phoneme: 'k → t', errorLabel: 'Frontalización velar media',
    prompt: '¿Con qué damos besitos? Di: boca.',
    onTarget: {
      say: '¡Boca! ¡Qué bien suena esa ca en el medio!',
      mission: 'Cuenta-dientes: sonrisa grandota de papi y tú le cuentas cinco dientes con el dedo. Después, al revés.',
    },
    onFoil: {
      say: 'Escuché bota, la del pie. Boca suena atrás: boca.',
      cue: 'Boca bien abierta de león: la lengua se va sola para atrás.',
      mission: 'Bostezo del león frente a frente: boca enorme y caaa desde el fondo. Gana el bostezo más exagerado.',
    },
  },
  {
    id: 'do-fuente-puente', code: 'PM-DO-8', group: 'Labiodental',
    target: 'fuente', targetEmoji: '⛲', foil: 'puente', foilEmoji: '🌉',
    phoneme: 'f → p', errorLabel: 'Oclusivización de fricativa (f→p)',
    prompt: '¿De dónde sale el agua en el parque? Di: fuente.',
    onTarget: {
      say: '¡Fuente! ¡Ese soplido de conejo lo moja to’!',
      mission: 'Fuente humana: agáchate y brota para arriba salpicando a papi, que se sacude el pelo mojado.',
    },
    onFoil: {
      say: 'Escuché puente, el de cruzar. La efe muerde el labio y sopla: fuente.',
      cue: 'Dientes de conejo sobre el labio de abajo, y sopla.',
      mission: 'El papelito volador: un papelito en la palma de papi. Con fff se inclina y aguanta; con pe solo da un brinco. Reto: tres segundos volando.',
    },
  },
];

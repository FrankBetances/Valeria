// ============================================================================
// Valeria+ · Prosodia de la voz del SISTEMA (pausas y troceo)
// Módulo PURO (sin imports de react-native/expo): lo compila y ejecuta también
// el gate de CI `scripts/check-speech-prosody.js`.
//
// PROBLEMA QUE RESUELVE (reportado en las sesiones dominicanas, es-DO)
// El español dominicano NO tiene banco de voz pregenerado: suena con la voz
// latina del dispositivo a través de expo-speech. En ese camino, cada pausa se
// paga DOS veces:
//
//   1. La que mete el motor TTS por la puntuación. Un motor no distingue
//      matices: dos puntos, punto y coma, raya y puntos suspensivos se locutan
//      con un silencio tan largo —a veces más— como el de un punto. Consignas
//      como «Esto es la cama. Di: cama.» o «Está oscuro… ¿Qué hacemos con la
//      luz?» salían con un hueco en mitad de la frase.
//   2. La que metemos NOSOTROS al trocear el texto por frases y encadenar una
//      locución por cada una: además de la espera explícita entre frases, cada
//      `Speech.speak` añade su propia latencia de arranque (en Android,
//      fácilmente 150-250 ms) y el silencio de cortesía del motor al cerrar.
//
// Sumadas, una consigna de dos frases llegaba a acumular medio segundo de aire
// muerto en mitad del enunciado: el niño perdía el hilo y el ritmo del
// ejercicio se rompía.
//
// SOLUCIÓN, en dos piezas independientes:
//   · `tightenPauses` normaliza la puntuación de pausa LARGA a pausa CORTA
//     antes de entregar el texto al motor. No toca ni una letra (invariante
//     verificada en CI): solo cambia signos y espacios.
//   · `splitForSpeech` decide cuándo merece la pena trocear. Por debajo del
//     umbral de palabras del perfil, el enunciado va en UNA sola locución
//     continua y desaparece por completo el coste 2.
//
// El perfil es POR VARIEDAD: es-DO (voz del sistema, el caso afectado) usa el
// perfil ajustado; el resto conserva el comportamiento histórico, porque ahí lo
// normal es reproducir el audio neuronal pregenerado y expo-speech solo actúa
// como rescate.
// ============================================================================

// Variedad activa. Se declara AQUÍ, y no se importa de valeriaLocale, para que
// el módulo compile en aislamiento (valeriaLocale arrastra AsyncStorage y el
// gate de CI lo ejecuta en Node). Es la misma unión que `Locale`: si allí se
// añade una variedad, `prosodyFor(getLocale())` deja de compilar en
// valeriaVoice.ts, que es exactamente el aviso que queremos —una variedad nueva
// necesita decidir su perfil de pausas, no heredar el de defecto en silencio.
export type ProsodyLocale = 'es' | 'gl' | 'es-DO' | 'eu' | 'en-US' | 'ca';

export interface ProsodyProfile {
  // Silencio EXPLÍCITO que añadimos entre frases encadenadas (ms). Se suma a la
  // latencia de arranque del motor, que ya es la parte gruesa de la pausa.
  gapMs: number;
  // Umbral de palabras a partir del cual troceamos por frases. Por debajo, el
  // texto se locuta entero: la entonación la pone el motor y no hay huecos.
  chainMinWords: number;
  // Fragmentos con menos palabras que esto se fusionan con el anterior en vez
  // de convertirse en una locución propia («Di, cama.» no merece una llamada
  // aparte con su latencia). 0 desactiva la fusión.
  mergeMinWords: number;
}

// Voz latina del sistema (es-DO · Quisqueya Habla). Es el perfil que corrige el
// ritmo: casi todas las consignas de la app caben en 14 palabras, así que en la
// práctica se locutan de una sola vez.
export const PROSODY_LATIN: ProsodyProfile = { gapMs: 40, chainMinWords: 14, mergeMinWords: 4 };

// Variedades con banco neuronal pregenerado (es, gl, eu): expo-speech es aquí el
// camino de rescate, no el habitual. Conservan el troceo y la respiración de
// siempre para no alterar una prosodia ya validada con las logopedas; la
// normalización de puntuación sí se les aplica —es una mejora del rescate y
// nunca alcanza al audio pregenerado, que se resuelve antes de llegar aquí.
export const PROSODY_DEFAULT: ProsodyProfile = { gapMs: 110, chainMinWords: 0, mergeMinWords: 0 };

// `en-US` va de momento con el perfil de VOZ DEL SISTEMA (el mismo que es-DO),
// no con el de banco pregenerado, porque hoy no tiene assets Piper: expo-speech
// es su camino habitual, no el de rescate, y ahí trocear cada frase con 110 ms
// de silencio suena peor que dejar que el motor ponga la entonación.
// Revisar en EN-4.3, cuando el banco neuronal inglés exista: entonces `en-US`
// pasa a comportarse como es/gl/eu. Es también una de las preguntas para la
// revisora clínica (¿el ritmo inglés resultante sirve para terapia?).
// `ca` va con el perfil de BANCO PREGENERADO desde el primer día: a diferencia
// de en-US, que nació sin assets Piper y se quedó con el perfil de voz del
// sistema, el catalán entra con sus locuciones ya sintetizadas (voz Piper
// ca_ES), así que expo-speech es su camino de rescate y no el habitual.
export const prosodyFor = (loc: ProsodyLocale): ProsodyProfile =>
  loc === 'es-DO' || loc === 'en-US' ? PROSODY_LATIN : PROSODY_DEFAULT;

const wordCount = (s: string): number => (s.match(/\S+/g) ?? []).length;

// ----------------------------------------------------------------------------
// Normalización de pausas para el motor TTS
// Reglas pensadas para el oído, no para la ortografía: el texto que se ENSEÑA
// en pantalla no pasa por aquí, solo el que se locuta. La invariante que
// protege el gate de CI es que las LETRAS no cambian: si algo se pierde o
// aparece, es un fallo, no una decisión de estilo.
// ----------------------------------------------------------------------------
export const tightenPauses = (text: string): string =>
  text
    // 1) Un solo espacio. Un salto de línea o una tabulación son frontera de
    //    enunciado para muchos motores: silencio que nadie escribió.
    .replace(/\s+/g, ' ')
    // 2) Comillas, paréntesis y corchetes fuera. No aportan prosodia y algunos
    //    motores los tratan como frontera (o, peor, los locutan).
    .replace(/[«»“”"()[\]]/g, ' ')
    // 3) Rayas y guiones largos → coma. En «Robot — ¡para!» la raya sonaba como
    //    un punto y aparto en mitad de la orden.
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/\s+--+\s+/g, ', ')
    // 4) Puntos suspensivos: coma dentro del enunciado («Está oscuro… ¿Qué
    //    hacemos?») y punto si lo cierran («Oye bien…»), que es lo que son.
    .replace(/\s*(?:…|\.\.\.)\s*$/, '.')
    .replace(/\s*(?:…|\.\.\.)\s*/g, ', ')
    // 5) Dos puntos y punto y coma → coma. Es la regla que más se nota: la
    //    petición clínica «Di: cama» es UNA unidad de sentido, no dos frases.
    .replace(/\s*[;:]\s*/g, ', ')
    // 6) Sin espacio antes del signo (lo dejan las reglas anteriores al comerse
    //    un paréntesis o una raya).
    .replace(/\s+([,.!?])/g, '$1')
    // 7) Puntuación amontonada: cada signo extra es otro silencio. Se conserva
    //    SIEMPRE el primero, que es el que fija la entonación («¡luz!.» → el
    //    motor cerraba la exclamación y volvía a pararse en el punto).
    .replace(/([.!?])[.!?]+/g, '$1')
    .replace(/([,¡¿])\1+/g, '$1')
    .replace(/,+(?=[.!?])/g, '')
    // 8) Bordes: una coma inicial o final (la deja una raya al principio o al
    //    final del texto) es una pausa sin nada al otro lado.
    .replace(/^[\s,]+/, '')
    .replace(/[\s,]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();

// ----------------------------------------------------------------------------
// Troceo para encadenar locuciones
// Devuelve los segmentos que hay que locutar EN ORDEN. Un solo elemento
// significa «esto va de una tirada» (sin huecos entre llamadas al motor).
// ----------------------------------------------------------------------------
export const splitForSpeech = (text: string, p: ProsodyProfile): string[] => {
  const clean = tightenPauses(text);
  if (!clean) return [];
  // Enunciado corto: una sola locución. La entonación la pone el motor con la
  // puntuación que le queda, y no se paga ninguna latencia de encadenado.
  if (wordCount(clean) <= p.chainMinWords) return [clean];

  const parts = clean.match(/[^.!?]+[.!?]*/g) ?? [clean];
  const out: string[] = [];
  for (const raw of parts) {
    const frag = raw.trim();
    if (!frag) continue;
    // Fusión de fragmentos cortos: una coletilla de dos palabras no justifica
    // una locución propia (su latencia de arranque dura más que ella misma).
    if (out.length && wordCount(frag) < p.mergeMinWords) out[out.length - 1] += ` ${frag}`;
    else out.push(frag);
  }
  return out.length ? out : [clean];
};

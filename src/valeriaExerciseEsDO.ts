// ============================================================================
// Valeria+ · Overrides de Audición y Lenguaje en ESPAÑOL DOMINICANO (es-DO)
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN (validación logopédica dominicana:
// QH-2.3 el banco original; QH-2.6 la ampliación Expansión de Protocolos V2).
//
// No duplica el banco entero: solo redefine, por ejercicio, lo que el habla
// dominicana exige cambiar respecto al banco base (valeriaExerciseBank):
//   1) LÉXICO: coche → carro; el guineo (banana amarilla) NO es "plátano" en RD
//      —el plátano es el verde de freír—, así que las fichas y adivinanzas con
//      🍌 usan "guineo".
//   2) PLURAL (MS-1): la -s del plural se aspira/elide; el plural se evalúa por
//      el DETERMINANTE ("muchos gatos"), no por la ese final (guía QH-0.2 §4.3).
//      Se activa evalPluralByDeterminer y se fija el determinante por ronda.
//   3) CONSIGNAS: registro caribeño donde aporta naturalidad.
// El resto de consignas y datos neutros se heredan del banco base sin cambios.
//
// Validación léxica (QH-2.5): ACADOM + CORPES XXI — docs/validacion-lexica-es-DO.md.
// El emparejador de voz pliega /s/ y /d/ en es-DO (valeriaVoice · foldDominican),
// así que aquí no hace falta enumerar todas las realizaciones elididas.
// ============================================================================
import type { Exercise } from './valeriaExerciseBank';

// Sobrescrituras sobre los datos BASE de cada ejercicio (ronda 1).
export const EXERCISE_ESDO: Record<string, Partial<Exercise>> = {
  // SE-1 · Intruso: "coche" → "carro"; "plátano" (🍌) → "guineo".
  se1: {
    read: 'Toca 🔊 para oír el nombre de las cuatro fichas. Tres van juntas y una no. El niño toca la que NO va con las demás.',
    intruder: [
      { cap: 'manzana', emoji: '🍎' }, { cap: 'guineo', emoji: '🍌' },
      { cap: 'uva', emoji: '🍇' }, { cap: 'carro', emoji: '🚗' },
    ],
    intruderAnswer: 3,
  },
  // SE-2 · Adivinanza: en RD la banana amarilla es el "guineo" (el "plátano" es
  // el verde). Se reescribe la pista sin depender de la letra inicial peninsular.
  se2: {
    read: 'Toca 🔊 para oír la adivinanza (o léela tú). El niño responde tocando una de las tres imágenes.',
    choicePrompt: 'Es amarillo, largo y blandito, y a los monos les encanta. ¿Qué es?',
    choiceLabel: 'Oír la adivinanza', choiceVoice: 'tutor',
    options: [{ cap: 'guineo', emoji: '🍌' }, { cap: 'manzana', emoji: '🍎' }, { cap: 'uva', emoji: '🍇' }],
    optionAnswer: 0,
  },
  // SE-3 · Prendas: registro local (el muñeco/la ropa se mantienen).
  se3: {
    read: 'Coge el muñeco y la ropa. Dale al niño una orden cada vez: «Ponle la gorra al muñeco». Cambia de prenda en cada turno.',
  },
  // MS-1 · Plural por determinante (la -s no se oye en RD): se evalúa "muchos".
  ms1: {
    read: 'El niño toca la tarjeta donde hay MUCHOS. En dominicano la ese del final casi no se oye, así que el plural se marca con el determinante: pregúntale «¿cuántos hay?» para que diga «muchos gatos» y fíjate en el «muchos», no en la ese.',
    evalPluralByDeterminer: true,
    pluralDeterminer: 'muchos',
  },
  // MS-3 · Registro: "el niño se come la manzana" suena más natural en RD, pero
  // la frase objetivo se mantiene neutra para no romper el juego de orden.
  // (sin cambios de datos; heredada del base)

  // TEA y Dislexia: el léxico base ya evita los falsos amigos peninsulares
  // (coche, plátano) y las series de DX-1 no dependen de la /s/ en coda ni de
  // la distinción /s/–/θ/, así que solo cambian las rondas listadas en
  // VARIANTS_ESDO (gorra, jugo). La validación por micro de DX-2/DX-3/DX-4 pasa
  // por normalizeSpeech → foldDominican, que pliega seseo y elisiones solo.

  // --------------------------------------------------------------------------
  // AMPLIACIÓN Expansión de Protocolos V2 (RA-1…RA-5, TEA-6, DX-6).
  // ESTADO: ✅ APROBADO (validación logopédica dominicana, QH-2.6).
  // El léxico de los ejercicios nuevos ya es neutro-caribeño (vaca, pato,
  // plato, sol…); aquí solo se ajusta el REGISTRO («toca», no «pulsa») y dos
  // piezas léxicas locales (maraca, atraparse). Ningún contraste depende de
  // /s/ en coda, /θ/ ni líquidas en coda (guía QH-0.2).
  // --------------------------------------------------------------------------
  ra2: {
    read: 'PRIMERO sin voz: di la palabra solo moviendo los labios, despacio y con tu cara bien iluminada, y que el niño toque la imagen leyendo tus labios. DESPUÉS toca 🔊 para devolverle el sonido y confirmar. No le corrijas con un «no»: repite el modelo con voz y labios a la vez.',
  },
  ra4: {
    read: 'Toca 🔊 para que oiga la orden COMPLETA de tres pasos. Después, candado humano: sujeta sus manos con suavidad y cuenta hasta 5 en silencio antes de dejarle tocar. Esa espera obliga a guardar la orden en la memoria, no a vaciarla corriendo.',
  },
  ra5: {
    // La maraca es el sonajero cotidiano dominicano (ACADOM).
    materials: 'Una maraca, unas llaves o una campanita (algo que suene claro)',
  },
  tea6: {
    read: 'Toca 🔊 para oír la orden con DOS pistas a la vez (forma Y color). Si atiende a una sola pista y falla (toca el círculo rojo), NO lo penalices: verbaliza tú la contingencia con naturalidad —«ese es rojo, pero es un círculo; yo quiero el cuadrado»— y deja que lo intente otra vez. Premia el intento comunicativo, no la perfección.',
  },
  dx6: {
    // «pilla-pilla» es peninsular; en RD el juego es atraparse («¡a que te cojo!»).
    read: 'El niño nombra cada dibujo EN VOZ ALTA y en orden de lectura (de izquierda a derecha), tocándolo al nombrarlo. El estresor eres tú: persigue su dedo por la pantalla con el tuyo, como jugando a atraparse («¡a que te cojo!»). Sin cronómetros: si lo ves acelerado o frustrado, frena tu dedo o detén la persecución.',
  },
};

// Sobrescrituras por RONDA (VARIANTS). Solo los ejercicios cuyas variantes
// cambian en es-DO; el resto hereda las variantes base.
export const VARIANTS_ESDO: Record<string, Partial<Exercise>[]> = {
  // SE-1: la ronda 1 ({}) hereda el override base (guineo/carro). La ronda de
  // "vestirse" cambia su intruso "plátano" (🍌) por "guineo".
  se1: [
    {},
    {
      read: 'Toca 🔊 para oír el nombre de las cuatro fichas. Tres son animales y una no. El niño toca la que NO va con las demás.',
      intruder: [
        { cap: 'perro', emoji: '🐶' }, { cap: 'gato', emoji: '🐱' },
        { cap: 'vaca', emoji: '🐄' }, { cap: 'zapato', emoji: '👟' },
      ],
      intruderAnswer: 3,
    },
    {
      read: 'Toca 🔊 para oír el nombre de las cuatro fichas. Tres son para vestirse y una no. El niño toca la que NO va con las demás.',
      intruder: [
        { cap: 'gorra', emoji: '🧢' }, { cap: 'camiseta', emoji: '👕' },
        { cap: 'zapato', emoji: '👟' }, { cap: 'guineo', emoji: '🍌' },
      ],
      intruderAnswer: 3,
    },
  ],
  // MS-1: plural por determinante en las tres rondas (el determinante concuerda
  // en género con el sustantivo: muchos gatos / muchas flores / muchos peces).
  ms1: [
    { evalPluralByDeterminer: true, pluralDeterminer: 'muchos' },
    {
      read: 'El niño toca la tarjeta donde hay MUCHAS. Pregúntale «¿cuántas hay?» para que diga «muchas flores»: en dominicano fíjate en el «muchas», no en la ese final.',
      plural: { cap: 'flor', capPlural: 'flores', emoji: '🌸', gender: 'f' },
      evalPluralByDeterminer: true, pluralDeterminer: 'muchas',
    },
    {
      read: 'El niño toca la tarjeta donde hay MUCHOS. Pregúntale «¿cuántos hay?» para que diga «muchos peces»: fíjate en el «muchos», no en la ese.',
      plural: { cap: 'pez', capPlural: 'peces', emoji: '🐟', gender: 'm' },
      evalPluralByDeterminer: true, pluralDeterminer: 'muchos',
    },
  ],
  // TEA-5 · Categorización: en RD el gorro con visera es la "gorra" (igual que
  // en el intruso de vestirse de SE-1). La lista de rondas SUSTITUYE a la base,
  // así que la ronda 2 (comida) replica sus datos; la ronda 1 ({}) hereda el base.
  tea5: [
    {},
    {
      read: 'Toca 🔊 para oír las cuatro fichas. Tres se comen y una no: el niño toca la que NO va con las demás. Sube el ruido desde el Panel del Adulto ronda a ronda y anota cómo cambia el acierto.',
      intruder: [{ cap: 'manzana', emoji: '🍎' }, { cap: 'pan', emoji: '🍞' }, { cap: 'queso', emoji: '🧀' }, { cap: 'pelota', emoji: '⚽' }],
      intruderAnswer: 3,
    },
    {
      read: 'Toca 🔊 para oír las cuatro fichas. Tres son para vestirse y una no: el niño toca la que NO va con las demás. Mantén el nivel de ruido que estés probando y compara con las rondas anteriores.',
      intruder: [{ cap: 'gorra', emoji: '🧢' }, { cap: 'camiseta', emoji: '👕' }, { cap: 'zapato', emoji: '👟' }, { cap: 'fresa', emoji: '🍓' }],
      intruderAnswer: 3,
    },
  ],
  // DX-2 · Rastreo léxico: en RD no se dice "zumo", se dice "jugo" (ACADOM).
  dx2: [
    {},
    { phrase: 'LA NIÑA BEBE JUGO', phraseEmoji: '🧃' },
    { phrase: 'MI GATO SALTA ALTO', phraseEmoji: '🐱' },
  ],
  // DX-1 · Intruso fonológico (✅ QH-2.6): "col" es de baja frecuencia
  // en RD (allí es "repollo", que rompe la rima); "caracol" mantiene la rima
  // en -ol con léxico familiar (ACADOM). Las demás rondas replican la base
  // (la lista de rondas SUSTITUYE a la base completa).
  dx1: [
    {},
    { intruder: [{ cap: 'pata', emoji: '🔊' }, { cap: 'lata', emoji: '🔊' }, { cap: 'rata', emoji: '🔊' }, { cap: 'luna', emoji: '🔊' }], intruderAnswer: 3 },
    { intruder: [{ cap: 'casa', emoji: '🔊' }, { cap: 'pasa', emoji: '🔊' }, { cap: 'taza', emoji: '🔊' }, { cap: 'perro', emoji: '🔊' }], intruderAnswer: 3 },
    { intruder: [{ cap: 'sol', emoji: '🔊' }, { cap: 'gol', emoji: '🔊' }, { cap: 'caracol', emoji: '🔊' }, { cap: 'mesa', emoji: '🔊' }], intruderAnswer: 3 },
  ],
};

// ============================================================================
// Valeria+ · Overrides de Audición y Lenguaje en ESPAÑOL DOMINICANO (es-DO)
//
// ESTADO: ✅ APROBADO PARA PRODUCCIÓN (validación logopédica dominicana, QH-2.3).
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
};

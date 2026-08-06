// ============================================================================
// Valeria+ · Frases habladas en INGLÉS AMERICANO (en) — plan en-US, EN-1.4
// Módulo PURO (sin imports de RN/Expo): el corpus de voz lo enumera en
// build-time para pre-generar su audio con la voz neuronal Piper `en_US`.
//
// ALCANCE DELIBERADAMENTE ESTRECHO. Aquí SOLO están las frases de APLICACIÓN:
// refuerzo, veredictos, muestras de voz y cierres de sesión. Es lo que la app
// dice pase cual pase el contenido, así que no depende de la fonología inglesa
// y se puede escribir —y sintetizar— sin esperar a la Fase 3.
//
// Lo que NO está aquí, y no debe colarse:
//   · pares mínimos ingleses → EN-3.2, y BLOQUEADO por la guía dialectal
//     EN-0.5: ningún dataset `en` entra en main sin veredicto dialectal
//     firmado (AAE, inglés sureño, inglés con influencia del español).
//   · cápsulas TPR, rutas de rutina, expansión semántica → EN-3.4 / EN-3.5.
// Es el espejo estructural de valeriaContentGl/Eu.ts, pero con la mitad de
// arriba vacía a propósito hasta que la revisora clínica (EN-0.3) entre.
//
// ESTADO: 🟡 provisional, pendiente de la pasada de hablante nativo (EN-7.4) y
// de la revisión SLP de los bancos de refuerzo (EN-3.4). El registro buscado es
// el de una app infantil estadounidense: «grown-up», no «parent» ni «tutor».
// ============================================================================

export const PRAISE_BANK_EN = [
  'Awesome! You said it perfectly!',
  'Yes! That sounded great!',
  'You got it! Nice work!',
  'Wonderful! You’re getting better every time!',
  'Super! That was nice and clear!',
  'Way to go! Great speaking!',
];
export const ALMOST_BANK_EN = [
  'So close! Listen carefully and try again…',
  'Almost! Let’s give it another go.',
  'You’ve almost got it! Listen and repeat.',
  'A little bit more and you’ve got it. One more time!',
];
export const NO_HEAR_BANK_EN = [
  'I didn’t quite hear you. Let’s try again!',
  'Oops, your voice didn’t reach me! Come closer and we’ll try again.',
  'I missed your word. Say it to me one more time!',
];
export const TOGETHER_BANK_EN = [
  'Let’s say it together, nice and slow.',
  'We’ll say it at the same time, slowly, no rush.',
  'Now as a team: we both say it together.',
];

// Frases fijas de los overlays de pausa y utilidades de voz.
export const SESSION_CONTINUE_PHRASE_EN = 'Great job! Let’s keep going with the session!';
export const ROUTE_DONE_PHRASE_EN = 'Route complete. Let’s keep going with the session.';
export const VOICE_SAMPLE_PHRASE_EN = 'Hi! This is how my voice will sound in the exercises. Doesn’t it sound nice?';
export const PAIRS_DONE_PHRASE_EN = 'Word pairs complete! High five with your grown-up!';

// Veredicto HABLADO del juego de micrófono (índices 0/1/2 = no oído/casi/bien),
// espejo de MIC_VERDICT_SAY. Lo consume micVerdictSayFor cuando la variedad
// inglesa tenga contenido propio; hasta entonces se sintetiza y espera.
export const MIC_VERDICT_SAY_EN: [string, string, string] = [
  'Let’s listen to it one more time.',
  'Almost! Let’s try it again.',
  'Great job! You said it perfectly!',
];

// Frases fijas del overlay de rotación de roles (Pares Mínimos, ensayos 3 y 7).
export const ROLESWAP_INTRO_EN = 'Switch! Now the child is in charge and the grown-up speaks.';
export const ROLESWAP_NOT_HEARD_EN = 'I didn’t hear the grown-up clearly. One more time!';
export const ROLESWAP_HIT_EN = 'That’s it! What great listening!';
export const ROLESWAP_MISS_OTHER_EN = 'Oops! It was the other one. Listen again on the next turn!';
export const roleswapParentSaidEn = (word: string): string =>
  `Oops! The grown-up said ${word}. Listen again on the next turn!`;

// Builders de Pares Mínimos: viven aquí (y no en la pantalla) para que el texto
// que se locuta y el que enumera el corpus sean literalmente el mismo. El BANCO
// de pares sigue sin existir —EN-3.2, bloqueado por EN-0.5—; estos constructores
// son solo la plantilla que lo envolverá cuando llegue.
export const pairIntroEn = (target: string, foil: string, prompt: string): string =>
  `This one is ${target}. And this one is ${foil}. ${prompt}`;
export const pairRetryEn = (target: string): string => `One more time! Say: ${target}.`;

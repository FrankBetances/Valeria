// ============================================================================
// Valeria+ · Banco de frases habladas — datos PUROS (sin imports de RN/Expo)
// Toda frase FIJA que la app locuta vive aquí (o en los otros módulos puros de
// datos: pares, TPR, rutas, portadoras) para que el corpus de voz pueda
// enumerarla en build-time y pre-generar su audio neuronal (plan ILENIA/Nós).
// La rotación anti-repetición sigue en valeriaVoice; aquí solo hay datos.
// ============================================================================

export const PRAISE_BANK = [
  '¡Muy bien! ¡Lo has dicho genial!',
  '¡Bravo! ¡Qué bien ha sonado!',
  '¡Toma ya! ¡Palabra conseguida!',
  '¡Genial! ¡Cada vez te sale mejor!',
  '¡Súper! ¡Lo dijiste clarísimo!',
  '¡Olé esa voz! ¡Muy bien dicho!',
];
export const ALMOST_BANK = [
  '¡Casi casi! Escucha bien y otra vez…',
  '¡Uy, por poquito! Vamos a probar de nuevo.',
  '¡Ya casi lo tienes! Escucha y repite.',
  'Un poquito más y lo bordas. ¡Otra vez!',
];
export const NO_HEAR_BANK = [
  'No te escuché bien. ¡Probamos otra vez!',
  '¡Uy, no llegó tu voz! Acércate y repetimos.',
  'Se me escapó tu palabra. ¡Dímela otra vez!',
];
export const TOGETHER_BANK = [
  'Vamos a decirla juntos, muy despacito.',
  'La decimos a la vez, despacito y sin prisa.',
  'Ahora en equipo: la decimos los dos juntos.',
];

// Frases fijas de los overlays de pausa y utilidades de voz.
export const SESSION_CONTINUE_PHRASE = '¡Muy bien! ¡Seguimos con la sesión!';
export const ROUTE_DONE_PHRASE = 'Ruta completada. Seguimos con la sesión.';
export const VOICE_SAMPLE_PHRASE = '¡Hola! Así sonará mi voz en los ejercicios. ¿Verdad que suena bien?';

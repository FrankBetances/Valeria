// ============================================================================
// Aventuras con Lúa · Hablarle al niño en la lengua del contenido
//
// Los catálogos del módulo están SOLO en castellano: las 60 consignas, los 10
// cuentos, las 10 canciones y los 25 juegos vienen de las 50 hojas y no hay
// banco en gallego, euskera, inglés ni catalán.
//
// El problema no es que se lea en castellano —eso está dicho en el README—,
// sino CON QUÉ VOZ. Este módulo ya pedía `{ language: 'es-ES' }`, y no bastaba,
// por dos razones distintas que había que arreglar las dos:
//
//   · el asset neuronal se buscaba con el idioma de la SESIÓN, y las 553
//     locuciones del módulo solo existen en el corpus `es`. En galego o euskera
//     no resolvía ninguna y todas caían al motor del sistema, teniendo su audio
//     de Sharvard ya horneado en el APK;
//   · y una vez en el motor, `expo-speech` seguía recibiendo la voz puntuada
//     para la variedad activa. En Android `voice` manda sobre `language`, así
//     que Celtia, HiTZ o Matxa leían las palabras castellanas: el acento se
//     mantenía y el idioma no. Eso es lo que se oía.
//
// Mientras el módulo no tenga banco propio por variedad, se locuta en
// castellano DE VERDAD: asset `es` (Sharvard) cuando existe —hoy, los 553— y
// voz castellana del sistema si algún día no. El día que exista el banco por
// variedad, esto se borra y ya está.
// ============================================================================
import type { SpeechOptions } from 'expo-speech';
import { contentLocale } from '../valeriaLocale';
import {
  speakToChild, speakToChildSeq, speakToChildIn, speakToChildSeqIn,
} from '../valeriaVoice';

/** Las variedades que SÍ tienen este contenido en su lengua. Hoy, solo el
 *  castellano y el dominicano, que comparte texto. */
const HAS_OWN_BANK = new Set(['es', 'es-DO']);

// contentLocale y no getLocale: una variedad cuyo banco clínico todavía no está
// listo ya locuta castellano en toda la app, y ahí la ruta normal es la buena.
const ownVoice = (): boolean => HAS_OWN_BANK.has(contentLocale());

export const speakLuaToChild = (text: string, extra: SpeechOptions = {}): void => {
  if (ownVoice()) speakToChild(text, extra);
  else speakToChildIn('es', 'es-ES', text, extra);
};

export const speakLuaToChildSeq = (parts: string[], extra: SpeechOptions = {}): void => {
  if (ownVoice()) speakToChildSeq(parts, extra);
  else speakToChildSeqIn('es', 'es-ES', parts, extra);
};

// ============================================================================
// Aventuras con Lúa · Hablarle al niño en la lengua del contenido
//
// Los catálogos del módulo están SOLO en castellano: las 60 consignas, los 10
// cuentos, las 10 canciones y los 10 juegos vienen de las 50 hojas y no hay
// banco en gallego, euskera, inglés ni catalán.
//
// El problema no es que se lea en castellano —eso está dicho en el README—,
// sino CON QUÉ VOZ. `speakToChild` toma el idioma del locale de terapia, así
// que en una sesión en euskera el motor leía texto castellano con voz vasca, y
// en gallego con Celtia: fonética equivocada sobre el estímulo clínico, que es
// exactamente lo que un ejercicio de discriminación no puede permitirse.
//
// Mientras el módulo no tenga banco propio por variedad, se locuta con voz
// castellana explícita. El día que exista el banco, esto se borra y ya está.
// ============================================================================
import type { SpeechOptions } from 'expo-speech';
import { getLocale } from '../valeriaLocale';
import { speakToChild, speakToChildSeq } from '../valeriaVoice';

/** Las variedades que SÍ tienen este contenido en su lengua. Hoy, solo el
 *  castellano y el dominicano, que comparte texto. */
const HAS_OWN_BANK = new Set(['es', 'es-DO']);

const opts = (extra: SpeechOptions = {}): SpeechOptions =>
  HAS_OWN_BANK.has(getLocale()) ? extra : { language: 'es-ES', ...extra };

export const speakLuaToChild = (text: string, extra: SpeechOptions = {}): void =>
  speakToChild(text, opts(extra));

export const speakLuaToChildSeq = (parts: string[], extra: SpeechOptions = {}): void =>
  speakToChildSeq(parts, opts(extra));

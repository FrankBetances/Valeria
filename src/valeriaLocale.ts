// ============================================================================
// Valeria+ · Variedad activa (locale) — infraestructura común de idioma/variedad
// Fuente única de la VARIEDAD de terapia en runtime. Generaliza el antiguo
// «idioma de voz» (es|gl) a una variedad que también cubre el español
// dominicano (es-DO · Quisqueya Habla):
//
//   'es'    → castellano peninsular · voz neuronal Sharvard (pregenerada)
//   'gl'    → galego · voz neuronal Celtia (pregenerada, Proxecto Nós)
//   'es-DO' → español dominicano · voz y ASR del SISTEMA (es-US/es-MX),
//             sin audio propio (Quisqueya Habla no pregenera para lanzar).
//   'eu'    → euskera batua · voz neuronal HiTZ-TTS (pregenerada, ILENIA/
//             NEL-GAITU, UPV/EHU · Aholab). Ver docs/plan-integracion-euskera.md.
//
// La variedad decide tres cosas, desacopladas a propósito:
//   1) assetLang()    — qué banco de audio pregenerado usar (o ninguno).
//   2) speechLocale() — el locale BCP-47 para el ASR y la voz del sistema.
//   3) prefersLatinVoice() — preferir voces latinas (es-DO) al puntuar voces.
//
// El selector de usuario (hoy global, en la tarjeta «Voz de la app»; por
// paciente en la ficha como refinamiento) escribe aquí. Defecto seguro: 'es'.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceLang } from './valeriaVoiceCorpus';

export type Locale = 'es' | 'gl' | 'es-DO' | 'eu';
export const ALL_LOCALES: Locale[] = ['es', 'gl', 'es-DO', 'eu'];
export const isLocale = (v: unknown): v is Locale =>
  v === 'es' || v === 'gl' || v === 'es-DO' || v === 'eu';

const KEY = '@valeria_locale';
const LEGACY_KEY = '@valeria_voice_lang'; // clave anterior (solo es|gl)

let active: Locale = 'es';

// Rehidratación perezosa al importar (fire-and-forget): si el disco tarda, las
// primeras locuciones salen en 'es' (defecto seguro). Migra la clave anterior.
void (async () => {
  try {
    const v = (await AsyncStorage.getItem(KEY)) ?? (await AsyncStorage.getItem(LEGACY_KEY));
    if (isLocale(v)) active = v;
  } catch (e) { /* almacenamiento no disponible: queda 'es' */ }
})();

export const getLocale = (): Locale => active;

export async function setLocale(loc: Locale): Promise<void> {
  active = loc;
  try { await AsyncStorage.setItem(KEY, loc); } catch (e) { /* noop */ }
}

// Banco de voz PRE-GENERADA de la variedad, o null si usa la voz del sistema.
// (es-DO no pregenera: suena con la voz latina del dispositivo.)
export function assetLang(loc: Locale = active): VoiceLang | null {
  return loc === 'gl' ? 'gl' : loc === 'eu' ? 'eu' : loc === 'es' ? 'es' : null;
}

// Locale BCP-47 para el ASR (@react-native-voice) y la voz del sistema (TTS).
export function speechLocale(loc: Locale = active): string {
  return loc === 'gl' ? 'gl-ES' : loc === 'eu' ? 'eu-ES' : loc === 'es-DO' ? 'es-DO' : 'es-ES';
}

// ¿Preferir voces latinoamericanas (es-US/es-MX/es-DO) al puntuar el catálogo?
// Solo en dominicano: la voz peninsular desentona para las familias de RD.
export function prefersLatinVoice(loc: Locale = active): boolean {
  return loc === 'es-DO';
}

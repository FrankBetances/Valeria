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
//   'en-US' → inglés de EE. UU. · voz neuronal Piper en_US (pregenerada; el
//             motor `piper` ya existía para Sharvard). Ver
//             docs/plan-integracion-ingles-en-US.md. Su contenido clínico es
//             la Fase 3 y todavía no existe: hasta entonces la variedad muestra
//             y locuta el banco castellano — ver EN_THERAPY_CONTENT_READY abajo.
//
// OJO — esta variedad NO decide el idioma de la INTERFAZ. Ese es un segundo eje
// independiente que vive en `valeriaUiLang.ts`, para no dejar fuera el caso
// bilingüe (UI en español, terapia en inglés, o al revés). Aquí solo se decide
// lo que se le dice, se le muestra y se le evalúa AL NIÑO.
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

export type Locale = 'es' | 'gl' | 'es-DO' | 'eu' | 'en-US';
export const ALL_LOCALES: Locale[] = ['es', 'gl', 'es-DO', 'eu', 'en-US'];
export const isLocale = (v: unknown): v is Locale =>
  v === 'es' || v === 'gl' || v === 'es-DO' || v === 'eu' || v === 'en-US';

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

// ---------------------------------------------------------------------------
// ¿Existe ya el banco clínico INGLÉS? (plan en-US, Fase 3)
// ---------------------------------------------------------------------------
// Hoy no. Con `en-US` activa, las pantallas caen al banco castellano
// (pairsForLocale, semanticForLocale, dbForLocale…), que es exactamente la
// build de evaluación EN-0.9: «interfaz en inglés, contenido en castellano»,
// la versión acordada para que la revisora SLP evalúe con la app en la mano.
//
// La consecuencia hay que tratarla, no ignorarla: si en ese estado la variedad
// pidiera voz y micrófono en `en-US`, el TTS inglés leería «perro» y el
// reconocedor inglés escucharía castellano. No es «castellano con acento»: es
// ruido. Mientras esto sea false, la variedad inglesa SE LOCUTA Y SE ESCUCHA en
// castellano, y lo único que suena en inglés es lo que de verdad está escrito
// en inglés (la muestra de voz, vía speakVoiceSample).
//
// Al cerrar la Fase 3 (EN-3.8: el corpus enumera el 100 % de lo que la app dice
// en `en-US`) esto pasa a `true` y la variedad se comporta como el resto.
export const EN_THERAPY_CONTENT_READY = false;

// Variedad de la que sale el contenido que se está usando REALMENTE. Coincide
// con la elegida salvo en el caso de arriba. Punto único: lo consumen el banco
// de audio, el locale de voz/ASR y el perfil de prosodia, para que los tres no
// puedan discrepar entre sí.
export function contentLocale(loc: Locale = active): Locale {
  return loc === 'en-US' && !EN_THERAPY_CONTENT_READY ? 'es' : loc;
}

// Banco de voz PRE-GENERADA de la variedad, o null si usa la voz del sistema.
// (es-DO no pregenera: suena con la voz latina del dispositivo.)
export function assetLang(loc: Locale = active): VoiceLang | null {
  const c = contentLocale(loc);
  return c === 'gl' ? 'gl'
    : c === 'eu' ? 'eu'
      : c === 'en-US' ? 'en'
        : c === 'es' ? 'es'
          : null;
}

// Locale BCP-47 para el ASR (expo-speech-recognition) y la voz del sistema (TTS).
export function speechLocale(loc: Locale = active): string {
  const c = contentLocale(loc);
  return c === 'gl' ? 'gl-ES'
    : c === 'eu' ? 'eu-ES'
      : c === 'en-US' ? 'en-US'
        : c === 'es-DO' ? 'es-DO'
          : 'es-ES';
}

// ¿Preferir voces latinoamericanas (es-US/es-MX/es-DO) al puntuar el catálogo?
// Solo en dominicano: la voz peninsular desentona para las familias de RD.
export function prefersLatinVoice(loc: Locale = active): boolean {
  return loc === 'es-DO';
}

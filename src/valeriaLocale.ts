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
//             motor `piper` ya existía para Sharvard). Banco clínico propio,
//             diseñado desde la fonología del inglés americano y sujeto a la
//             guía dialectal docs/guia-dialectal-en-US.md. Ver
//             docs/plan-integracion-ingles-en-US.md.
//   'ca'    → català central · voz neuronal **Matxa-TTS** del projecte AINA
//             (Barcelona Supercomputing Center · Generalitat de Catalunya).
//             No es Piper: es Matcha-TTS (flow matching) con vocóder propio,
//             y su frontend es fonémico. Banco clínico propio: el castellano NO transfiere
//             —«perro» es «gos» y pierde el contraste r̄/l— y el catalán trae
//             contrastes que el castellano no tiene (vocal neutra [ə], /ʃ/,
//             /ʒ/, /z/, la ela geminada). Ver docs/plan-integracion-catalan-ca-ES.md.
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

export type Locale = 'es' | 'gl' | 'es-DO' | 'eu' | 'en-US' | 'ca';
export const ALL_LOCALES: Locale[] = ['es', 'gl', 'es-DO', 'eu', 'en-US', 'ca'];
export const isLocale = (v: unknown): v is Locale =>
  v === 'es' || v === 'gl' || v === 'es-DO' || v === 'eu' || v === 'en-US' || v === 'ca';

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
// Ya SÍ (ago 2026, EN-3.2…EN-3.8): pares mínimos, expansión semántica,
// Audición, Lenguaje, TEA, Dislexia y Test de Ling propios, y el corpus enumera
// el 100 % de lo que la app dice en `en-US`. La guía dialectal que lo gobierna
// (docs/guia-dialectal-en-US.md) está FIRMADA desde el 16/8/2026 por una
// logopeda con licencia de Howard University, y con su firma queda validado
// también el dataset `en`. O sea: esto no es un interruptor a medias.
//
// Quien lea este fichero buscando si el inglés «ya está»: sí. Si encuentra en
// otro sitio un texto que diga que sigue en revisión, ese texto es el que está
// caducado — ya pasó una vez con el detalle de la tarjeta de voz.
//
// El interruptor se conserva porque la transición tenía trampa y conviene no
// olvidarla: mientras el banco no existía, `en-US` mostraba contenido
// CASTELLANO, y pedirle al TTS inglés que leyera «perro» no produce castellano
// con acento, produce ruido. Con esto en false la variedad se locuta y se
// escucha en castellano; en true se comporta como cualquier otra. Es el
// conmutador que hay que bajar si algún día se añade una variedad nueva antes
// que su contenido.
export const EN_THERAPY_CONTENT_READY = true;

// El mismo interruptor para el catalán (plan ca-ES, fase 3). En true desde que
// existen banco de pares, expansión semántica, Audición, Lenguaje, TEA,
// Dislexia y Test de Ling propios en catalán, y el corpus de voz enumera el
// 100 % de lo que la app dice en `ca`. Si algún día se toca el banco y se queda
// a medias, se baja ESTO y no se toca nada más: la variedad vuelve a locutar
// castellano con voz castellana, que es feo pero honesto, en vez de pedirle a
// la voz catalana que lea «perro».
export const CA_THERAPY_CONTENT_READY = true;

// Variedad de la que sale el contenido que se está usando REALMENTE. Coincide
// con la elegida salvo en el caso de arriba. Punto único: lo consumen el banco
// de audio, el locale de voz/ASR y el perfil de prosodia, para que los tres no
// puedan discrepar entre sí.
export function contentLocale(loc: Locale = active): Locale {
  if (loc === 'en-US' && !EN_THERAPY_CONTENT_READY) return 'es';
  if (loc === 'ca' && !CA_THERAPY_CONTENT_READY) return 'es';
  return loc;
}

// Banco de voz PRE-GENERADA de la variedad, o null si usa la voz del sistema.
// (es-DO no pregenera: suena con la voz latina del dispositivo.)
export function assetLang(loc: Locale = active): VoiceLang | null {
  const c = contentLocale(loc);
  return c === 'gl' ? 'gl'
    : c === 'eu' ? 'eu'
      : c === 'en-US' ? 'en'
        : c === 'ca' ? 'ca'
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
          : c === 'ca' ? 'ca-ES'
            : 'es-ES';
}

// ¿Preferir voces latinoamericanas (es-US/es-MX/es-DO) al puntuar el catálogo?
// Solo en dominicano: la voz peninsular desentona para las familias de RD.
export function prefersLatinVoice(loc: Locale = active): boolean {
  return loc === 'es-DO';
}

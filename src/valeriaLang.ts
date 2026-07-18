// ============================================================================
// Valeria+ · Idioma activo de la voz — plan Proxecto Nós (Fase 1, mínimo viable)
// Fuente única del idioma de locución en runtime. Hoy solo lo consulta la
// cadena texto→asset de valeriaVoice (un mismo texto puede existir en es y gl
// con audios distintos: el id de corpus incluye el idioma).
//
// El selector de usuario (idioma por paciente en la ficha, GL-1.x) llegará
// con la integración de pantallas; mientras tanto el valor por defecto es
// 'es' y setVoiceLang queda expuesto y persistido para esa fase.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoiceLang } from './valeriaVoiceCorpus';

const KEY = '@valeria_voice_lang';

let active: VoiceLang = 'es';

// Rehidratación perezosa al importar (fire-and-forget: si el disco tarda,
// las primeras locuciones salen en 'es', que es el defecto seguro).
void (async () => {
  try {
    const v = await AsyncStorage.getItem(KEY);
    if (v === 'es' || v === 'gl') active = v;
  } catch (e) { /* almacenamiento no disponible: queda 'es' */ }
})();

export const getVoiceLang = (): VoiceLang => active;

export async function setVoiceLang(lang: VoiceLang): Promise<void> {
  active = lang;
  try { await AsyncStorage.setItem(KEY, lang); } catch (e) { /* noop */ }
}

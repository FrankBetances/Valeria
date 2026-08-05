// ============================================================================
// Valeria+ · Idioma de la INTERFAZ — segundo eje de idioma (plan en-US, EN-2.1)
//
// Hasta aquí el proyecto tenía UN solo eje de idioma: `valeriaLocale.ts`, la
// VARIEDAD DE TERAPIA (es · gl · es-DO · eu · en-US), que decide qué se locuta,
// se muestra y se evalúa. La interfaz era siempre castellana, así que no hacía
// falta más.
//
// El inglés rompe eso: una familia de Ohio no navega una app cuyos botones
// dicen «Continuar». Pero acoplar las dos cosas —que elegir terapia en inglés
// forzara la UI en inglés y viceversa— dejaría fuera el caso de uso más valioso
// del mercado estadounidense: el logopeda con caseload BILINGÜE, y la familia
// hispanohablante que quiere la app en español mientras el niño trabaja
// objetivos en inglés (o al revés, cuando el objetivo es mantener el español).
//
// Por eso son DOS ejes independientes:
//
//   Locale (valeriaLocale)  → qué se dice, se muestra y se evalúa al NIÑO.
//   UiLang (este módulo)    → en qué idioma leen los ADULTOS la app.
//
// Relación por defecto, no imposición: elegir la variedad `en-US` pone la UI en
// inglés (defaultUiLangFor), pero en cuanto el adulto toca el selector de
// idioma de interfaz, su elección MANDA y persiste. La bandera `explicit`
// distingue «lo eligió una persona» de «lo dedujimos de la variedad».
//
// Diferencia técnica con valeriaLocale: la variedad se lee en el momento de
// hablar, así que un módulo con una variable suelta basta. El idioma de la UI
// tiene que REPINTAR la pantalla al cambiar, así que aquí sí hay suscripción
// (useSyncExternalStore la consume desde i18n/index.ts).
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Locale } from './valeriaLocale';

export type UiLang = 'es' | 'en';
export const ALL_UI_LANGS: UiLang[] = ['es', 'en'];
export const isUiLang = (v: unknown): v is UiLang => v === 'es' || v === 'en';

const KEY = '@valeria_ui_lang';
const KEY_EXPLICIT = '@valeria_ui_lang_explicit';

// Defecto seguro: castellano. Es lo que ven hoy todos los usuarios, así que
// mientras el disco responde nadie percibe un cambio.
let active: UiLang = 'es';
let explicit = false;

// ---------------------------------------------------------------- suscripción
const listeners = new Set<() => void>();

export function subscribeUiLang(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

const emit = (): void => { listeners.forEach((fn) => { fn(); }); };

// ------------------------------------------------------------------- lectura
export const getUiLang = (): UiLang => active;
export const isUiLangExplicit = (): boolean => explicit;

// Idioma de interfaz que CORRESPONDE a una variedad de terapia, cuando el
// adulto no ha elegido uno a mano. Única regla del acoplamiento por defecto.
export const defaultUiLangFor = (loc: Locale): UiLang => (loc === 'en-US' ? 'en' : 'es');

// ------------------------------------------------------------------ escritura
// Elección DELIBERADA del adulto: manda sobre la variedad para siempre.
export async function setUiLang(lang: UiLang): Promise<void> {
  const changed = active !== lang;
  active = lang;
  explicit = true;
  try {
    await AsyncStorage.multiSet([[KEY, lang], [KEY_EXPLICIT, '1']]);
  } catch (e) { /* almacenamiento no disponible: vale para esta sesión */ }
  if (changed) emit();
}

// Cambio de variedad de terapia: arrastra la UI SOLO si nadie la fijó a mano.
// Lo llama el selector de «Voz de la app» al cambiar de variedad.
export async function syncUiLangToLocale(loc: Locale): Promise<void> {
  if (explicit) return;
  const next = defaultUiLangFor(loc);
  if (next === active) return;
  active = next;
  try { await AsyncStorage.setItem(KEY, next); } catch (e) { /* noop */ }
  emit();
}

// Vuelve al comportamiento automático (la UI sigue a la variedad de terapia).
export async function clearUiLangOverride(loc: Locale): Promise<void> {
  explicit = false;
  try { await AsyncStorage.removeItem(KEY_EXPLICIT); } catch (e) { /* noop */ }
  const next = defaultUiLangFor(loc);
  if (next === active) return;
  active = next;
  try { await AsyncStorage.setItem(KEY, next); } catch (e) { /* noop */ }
  emit();
}

// ---------------------------------------------------------------- hidratación
// Perezosa al importar, como valeriaLocale: si el disco tarda, las primeras
// pantallas salen en castellano (defecto seguro) y se repintan al resolver.
export const hydrateUiLang = async (): Promise<void> => {
  try {
    const [[, stored], [, flag]] = await AsyncStorage.multiGet([KEY, KEY_EXPLICIT]);
    explicit = flag === '1';
    if (isUiLang(stored) && stored !== active) {
      active = stored;
      emit();
    }
  } catch (e) { /* almacenamiento no disponible: queda 'es' */ }
};

void hydrateUiLang();

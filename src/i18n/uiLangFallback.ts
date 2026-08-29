// ============================================================================
// Valeria+ · Registro ÚNICO de contenido que todavía no existe en un idioma
// de interfaz, y que por tanto se sirve en otro.
//
// POR QUÉ EXISTE (ago 2026, integración del catalán)
// ---------------------------------------------------------------------------
// Mientras solo hubo dos idiomas de interfaz, el selector de contenido de
// adulto se escribía así en catorce sitios distintos:
//
//     lang === 'en' ? ACADEMY_CAPSULES_EN : ACADEMY_CAPSULES_ES
//
// Con `ca` eso devuelve CASTELLANO, y no falla nada: no rompe el typecheck
// —el ternario acepta cualquier UiLang—, no lo ve `check-ui-strings` —no es un
// literal en un .tsx, es un módulo de datos— y no lo ve el corpus de voz —no
// se locuta—. Solo se ve mirando la pantalla, que es como se encontró: una
// cabecera catalana sobre una lista de ejercicios en castellano.
//
// La regla que sale de ahí es la de este fichero: un idioma de interfaz o
// TIENE el contenido, o su ausencia está DECLARADA AQUÍ y la pantalla lo dice.
// No hay tercera opción, y `scripts/check-ui-lang-fallback.js` la impide.
//
// Qué NO va aquí: la terapia. Lo que se le dice, se le muestra o se le evalúa
// al niño va por el eje de variedad (valeriaLocale) y no admite fallback
// silencioso de ninguna clase — pedirle a la voz catalana que lea castellano
// es la queja que ya llegó una vez con el inglés.
// ============================================================================
import { UiLang } from '../valeriaUiLang';

// Bloques de contenido de ADULTO que pueden faltar en un idioma de interfaz.
export type FallbackArea = 'academy' | 'academyHardware';

// Para cada área, los idiomas en los que el contenido NO existe todavía, con
// el idioma en el que se sirve mientras tanto.
//
// Vaciar una entrada es lo que hay que hacer al traducir el bloque: el gate
// comprueba que el registro y el código no se contradigan.
export const UI_LANG_FALLBACKS: Record<FallbackArea, Partial<Record<UiLang, UiLang>>> = {
  // Las ~50 cápsulas formativas y sus cuestionarios. La versión inglesa no fue
  // una traducción sino una reautorización clínica (EN-3.x); la catalana pide
  // lo mismo y todavía no se ha hecho, así que en catalán se sirven en
  // castellano y la pantalla lo avisa.
  academy: { ca: 'es' },
  // Catálogo de conceptos de hipoacusia y de dispositivos auditivos
  // (audiòfons, implants). Mismo caso y mismo motivo.
  academyHardware: { ca: 'es' },
};

/** Idioma en el que se sirve realmente `area` cuando la interfaz está en `lang`. */
export const servedLangFor = (area: FallbackArea, lang: UiLang): UiLang =>
  UI_LANG_FALLBACKS[area][lang] ?? lang;

/** ¿El contenido de `area` se está sirviendo en un idioma distinto al elegido? */
export const isFallingBack = (area: FallbackArea, lang: UiLang): boolean =>
  servedLangFor(area, lang) !== lang;

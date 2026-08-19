// ============================================================================
// Valeria+ · Selección del banco de Expansión Semántica por VARIEDAD (locale)
// Punto único donde la variedad activa decide qué contenido de expansión
// semántica usa la pantalla, sin duplicar lógica de UI:
//   'es'        → banco base castellano (ValeriaSemanticExpansionScreen).
//   'gl'        → banco galego (Proxecto Nós · GL-2.x), locutado con Celtia.
//                 Antes compartía el banco castellano, así que una sesión en
//                 galego locutaba castellano en toda esta pantalla.
//   'es-DO'     → banco dominicano (Quisqueya Habla · QH-2.2): léxico local
//                 (colmado, guagua, funda…) y consignas en registro caribeño.
// Vive aparte del banco base para no crear ciclos y espejar el patrón de
// valeriaPairBanks (pares mínimos por variedad).
// ============================================================================
import {
  DAILY_SCENARIOS, LEXICAL_CATEGORIES, PROGRESSION_SEQUENCES, CONTRAST_CAPSULES,
  DailyScenario, LexicalCategory, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';
import {
  DAILY_SCENARIOS_ESDO, LEXICAL_CATEGORIES_ESDO, PROGRESSION_SEQUENCES_ESDO,
  CONTRAST_CAPSULES_ESDO,
} from './valeriaSemanticExpansionEsDO';
import {
  DAILY_SCENARIOS_EU, LEXICAL_CATEGORIES_EU, PROGRESSION_SEQUENCES_EU,
  CONTRAST_CAPSULES_EU, SEM_RETRY_EU, SEM_SESSION_DONE_EU,
} from './valeriaSemanticExpansionEu';
import {
  DAILY_SCENARIOS_GL, LEXICAL_CATEGORIES_GL, PROGRESSION_SEQUENCES_GL,
  CONTRAST_CAPSULES_GL, SEM_RETRY_GL, SEM_SESSION_DONE_GL,
} from './valeriaSemanticExpansionGl';
import { Locale } from './valeriaLocale';

// Textos fijos de la pantalla (reintento y cierre). Se localizan junto al banco
// para que la locución resuelva el asset neuronal de la variedad (eu → HiTZ) y
// no caiga al castellano por la voz del sistema (el «salto» de voz en euskera).
const SEM_RETRY_ES = (label: string): string => `¡Otra vez! Di: ${label}.`;
const SEM_SESSION_DONE_ES = '¡Sesión completada! ¡Choca esos cinco!';

import {
  DAILY_SCENARIOS_EN, LEXICAL_CATEGORIES_EN, PROGRESSION_SEQUENCES_EN,
  CONTRAST_CAPSULES_EN, SEM_RETRY_EN, SEM_SESSION_DONE_EN, SEM_ADULT_LABELS_EN,
} from './valeriaSemanticExpansionEn';

export interface SemanticBank {
  scenarios: DailyScenario[];
  categories: LexicalCategory[];   // DC-1 opción C · vocabulario por campo
  sequences: ProgressionSequence[];
  capsules: ContrastCapsule[];
  retry: (label: string) => string; // consigna de reintento hablada
  sessionDone: string;              // cierre hablado de la sesión
}

export function semanticForLocale(loc: Locale): SemanticBank {
  if (loc === 'es-DO') {
    return {
      scenarios: DAILY_SCENARIOS_ESDO,
      categories: LEXICAL_CATEGORIES_ESDO,
      sequences: PROGRESSION_SEQUENCES_ESDO,
      capsules: CONTRAST_CAPSULES_ESDO,
      retry: SEM_RETRY_ES,
      sessionDone: SEM_SESSION_DONE_ES,
    };
  }
  if (loc === 'eu') {
    return {
      scenarios: DAILY_SCENARIOS_EU,
      categories: LEXICAL_CATEGORIES_EU,
      sequences: PROGRESSION_SEQUENCES_EU,
      capsules: CONTRAST_CAPSULES_EU,
      retry: SEM_RETRY_EU,
      sessionDone: SEM_SESSION_DONE_EU,
    };
  }
  if (loc === 'gl') {
    return {
      scenarios: DAILY_SCENARIOS_GL,
      categories: LEXICAL_CATEGORIES_GL,
      sequences: PROGRESSION_SEQUENCES_GL,
      capsules: CONTRAST_CAPSULES_GL,
      retry: SEM_RETRY_GL,
      sessionDone: SEM_SESSION_DONE_GL,
    };
  }
  if (loc === 'en-US') {
    return {
      scenarios: DAILY_SCENARIOS_EN,
      categories: LEXICAL_CATEGORIES_EN,
      sequences: PROGRESSION_SEQUENCES_EN,
      capsules: CONTRAST_CAPSULES_EN,
      retry: SEM_RETRY_EN,
      sessionDone: SEM_SESSION_DONE_EN,
    };
  }
  // Castellano: banco base (Sharvard).
  return {
    scenarios: DAILY_SCENARIOS,
    categories: LEXICAL_CATEGORIES,
    sequences: PROGRESSION_SEQUENCES,
    capsules: CONTRAST_CAPSULES,
    retry: SEM_RETRY_ES,
    sessionDone: SEM_SESSION_DONE_ES,
  };
}

// ---------------------------------------------------------------------------
// Los rótulos con los que NAVEGA el adulto siguen el idioma de la interfaz
// ---------------------------------------------------------------------------
// Misma regla que `dbFor` en el banco de ejercicios y que `lingContentFor` en
// el Test de Ling: solo interviene cuando los dos ejes discrepan. Hoy eso solo
// pasa por desacople manual desde «Voz de la app», porque el botón de idioma
// mueve los dos (setAppLanguage). Con gl, eu o es-DO no toca nada.
//
// Se cambian el título y el subtítulo con los que se elige la actividad, y NADA
// más: los `label` de cada ficha y de cada fase son la palabra que se locuta y
// que evalúa el micrófono, y esos son terapia, no navegación.
export function semanticFor(loc: Locale, uiLang: string): SemanticBank {
  const bank = semanticForLocale(loc);
  if (uiLang !== 'en' || loc === 'en-US') return bank;
  const rot = (id: string) => SEM_ADULT_LABELS_EN[id];
  return {
    ...bank,
    scenarios: bank.scenarios.map((sc) => {
      const r = rot(sc.id);
      return r ? { ...sc, title: r.title, subtitle: r.subtitle ?? sc.subtitle } : sc;
    }),
    categories: bank.categories.map((ct) => {
      const r = rot(ct.id);
      return r ? { ...ct, title: r.title, subtitle: r.subtitle ?? ct.subtitle } : ct;
    }),
    sequences: bank.sequences.map((sq) => {
      const r = rot(sq.id);
      return r ? { ...sq, theme: r.title } : sq;
    }),
  };
}

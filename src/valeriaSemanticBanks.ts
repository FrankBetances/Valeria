// ============================================================================
// Valeria+ · Selección del banco de Expansión Semántica por VARIEDAD (locale)
// Punto único donde la variedad activa decide qué contenido de expansión
// semántica usa la pantalla, sin duplicar lógica de UI:
//   'es' / 'gl' → banco base castellano (ValeriaSemanticExpansionScreen).
//   'es-DO'     → banco dominicano (Quisqueya Habla · QH-2.2): léxico local
//                 (colmado, guagua, funda…) y consignas en registro caribeño.
// Vive aparte del banco base para no crear ciclos y espejar el patrón de
// valeriaPairBanks (pares mínimos por variedad).
// ============================================================================
import {
  DAILY_SCENARIOS, PROGRESSION_SEQUENCES, CONTRAST_CAPSULES,
  DailyScenario, ProgressionSequence, ContrastCapsule,
} from './valeriaSemanticExpansion';
import {
  DAILY_SCENARIOS_ESDO, PROGRESSION_SEQUENCES_ESDO, CONTRAST_CAPSULES_ESDO,
} from './valeriaSemanticExpansionEsDO';
import {
  DAILY_SCENARIOS_EU, PROGRESSION_SEQUENCES_EU, CONTRAST_CAPSULES_EU,
  SEM_RETRY_EU, SEM_SESSION_DONE_EU,
} from './valeriaSemanticExpansionEu';
import { Locale } from './valeriaLocale';

// Textos fijos de la pantalla (reintento y cierre). Se localizan junto al banco
// para que la locución resuelva el asset neuronal de la variedad (eu → HiTZ) y
// no caiga al castellano por la voz del sistema (el «salto» de voz en euskera).
const SEM_RETRY_ES = (label: string): string => `¡Otra vez! Di: ${label}.`;
const SEM_SESSION_DONE_ES = '¡Sesión completada! ¡Choca esos cinco!';

export interface SemanticBank {
  scenarios: DailyScenario[];
  sequences: ProgressionSequence[];
  capsules: ContrastCapsule[];
  retry: (label: string) => string; // consigna de reintento hablada
  sessionDone: string;              // cierre hablado de la sesión
}

export function semanticForLocale(loc: Locale): SemanticBank {
  if (loc === 'es-DO') {
    return {
      scenarios: DAILY_SCENARIOS_ESDO,
      sequences: PROGRESSION_SEQUENCES_ESDO,
      capsules: CONTRAST_CAPSULES_ESDO,
      retry: SEM_RETRY_ES,
      sessionDone: SEM_SESSION_DONE_ES,
    };
  }
  if (loc === 'eu') {
    return {
      scenarios: DAILY_SCENARIOS_EU,
      sequences: PROGRESSION_SEQUENCES_EU,
      capsules: CONTRAST_CAPSULES_EU,
      retry: SEM_RETRY_EU,
      sessionDone: SEM_SESSION_DONE_EU,
    };
  }
  // Castellano y galego comparten el banco base (el galego locuta con Celtia).
  return {
    scenarios: DAILY_SCENARIOS,
    sequences: PROGRESSION_SEQUENCES,
    capsules: CONTRAST_CAPSULES,
    retry: SEM_RETRY_ES,
    sessionDone: SEM_SESSION_DONE_ES,
  };
}

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
} from './valeriaSemanticExpansionEu';
import { Locale } from './valeriaLocale';

export interface SemanticBank {
  scenarios: DailyScenario[];
  sequences: ProgressionSequence[];
  capsules: ContrastCapsule[];
}

export function semanticForLocale(loc: Locale): SemanticBank {
  if (loc === 'es-DO') {
    return {
      scenarios: DAILY_SCENARIOS_ESDO,
      sequences: PROGRESSION_SEQUENCES_ESDO,
      capsules: CONTRAST_CAPSULES_ESDO,
    };
  }
  if (loc === 'eu') {
    return {
      scenarios: DAILY_SCENARIOS_EU,
      sequences: PROGRESSION_SEQUENCES_EU,
      capsules: CONTRAST_CAPSULES_EU,
    };
  }
  // Castellano y galego comparten el banco base (el galego locuta con Celtia).
  return {
    scenarios: DAILY_SCENARIOS,
    sequences: PROGRESSION_SEQUENCES,
    capsules: CONTRAST_CAPSULES,
  };
}

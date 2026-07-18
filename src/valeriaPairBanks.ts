// ============================================================================
// Valeria+ · Selección del banco de Pares Mínimos por VARIEDAD (locale)
// Punto único donde la variedad activa decide qué banco de pares usa la
// pantalla, sin duplicar lógica de pantalla:
//   'es'    → banco castellano peninsular (con distinción s/θ donde aplica).
//   'gl'    → banco galego (Proxecto Nós, borrador).
//   'es-DO' → banco dominicano (Quisqueya Habla, borrador: sin seseo ni codas
//             líquidas — ver valeriaMinimalPairsEsDO).
// Vive aparte de valeriaMinimalPairs para no crear ciclos (los bancos gl/es-DO
// importan el tipo MinimalPair de ahí).
// ============================================================================
import { MINIMAL_PAIRS, MinimalPair } from './valeriaMinimalPairs';
import { MINIMAL_PAIRS_GL } from './valeriaMinimalPairsGl';
import { MINIMAL_PAIRS_ESDO } from './valeriaMinimalPairsEsDO';
import { Locale } from './valeriaLocale';

export function pairsForLocale(loc: Locale): MinimalPair[] {
  return loc === 'gl' ? MINIMAL_PAIRS_GL
    : loc === 'es-DO' ? MINIMAL_PAIRS_ESDO
      : MINIMAL_PAIRS;
}

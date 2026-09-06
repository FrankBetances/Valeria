// ============================================================================
// Valeria+ · Selección del banco de Pares Mínimos por VARIEDAD (locale)
// Punto único donde la variedad activa decide qué banco de pares usa la
// pantalla, sin duplicar lógica de pantalla:
//   'es'    → banco castellano peninsular (con distinción s/θ donde aplica).
//   'gl'    → banco galego (Proxecto Nós): 13 pares en 8 grupos, todos
//             aprobados para producción. Los siete primeros desde jul 2026; los
//             seis de contrastes propios (/ʃ/, abertura vocálica, /ʎ/, nasales),
//             validados por ACOPROS en sept/2026.
//   'es-DO' → banco dominicano (Quisqueya Habla, borrador: sin seseo ni codas
//             líquidas — ver valeriaMinimalPairsEsDO).
//   'ca'    → banc català (pla ca-ES): contrastos propis del català central,
//             cuatro de ellos inexistentes en castellano (ver el banco).
// Vive aparte de valeriaMinimalPairs para no crear ciclos (los bancos gl/es-DO
// importan el tipo MinimalPair de ahí).
// ============================================================================
import { MINIMAL_PAIRS, MinimalPair, PairGroup, PAIR_GROUPS } from './valeriaMinimalPairs';
import { MINIMAL_PAIRS_GL, PAIR_GROUPS_GL } from './valeriaMinimalPairsGl';
import { MINIMAL_PAIRS_ESDO } from './valeriaMinimalPairsEsDO';
import { MINIMAL_PAIRS_EU } from './valeriaMinimalPairsEu';
import { MINIMAL_PAIRS_EN, PAIR_GROUPS_EN } from './valeriaMinimalPairsEn';
import { MINIMAL_PAIRS_CA, PAIR_GROUPS_CA } from './valeriaMinimalPairsCa';
import { GalicianDialect, Locale, getGalicianDialect } from './valeriaLocale';

export function pairsForLocale(
  loc: Locale,
  glDialect: GalicianDialect = getGalicianDialect(),
): MinimalPair[] {
  const banco = loc === 'gl' ? MINIMAL_PAIRS_GL
    : loc === 'es-DO' ? MINIMAL_PAIRS_ESDO
      : loc === 'eu' ? MINIMAL_PAIRS_EU
        : loc === 'en-US' ? MINIMAL_PAIRS_EN
          : loc === 'ca' ? MINIMAL_PAIRS_CA
            : MINIMAL_PAIRS;
  // Con un niño SESEANTE, el par que mide /s/–/θ/ sale del banco: allí ese
  // contraste no existe y puntuarlo mide de dónde es, no cómo habla. Es lo
  // mismo que el banco dominicano hace de raíz (excluye casa/caza) y lo que el
  // catalán hace con /b/–/v/ por betacismo; aquí no se puede hacer de raíz
  // porque el oriente gallego SÍ distingue, así que se decide por paciente.
  // `region` deja de ser solo un rótulo y pasa a tener efecto.
  if (loc === 'gl' && glDialect === 'seseo') {
    return banco.filter((p) => p.region !== 'distincion');
  }
  return banco;
}

// Secciones del listado de pares. Hasta el inglés bastaba con PAIR_GROUPS: los
// bancos iberorrománicos compartían nomenclatura (Rotacismo, Sigmatismo…)
// y la pantalla filtraba los grupos vacíos. El banco inglés tiene los suyos
// (Gliding, Cluster reduction…), así que si la pantalla siguiera recorriendo la
// lista castellana, los pares ingleses no caerían en NINGUNA sección y el
// listado saldría vacío — sin error, sin log y sin pares.
export function pairGroupsForLocale(loc: Locale): PairGroup[] {
  return loc === 'en-US' ? PAIR_GROUPS_EN
    : loc === 'ca' ? PAIR_GROUPS_CA
      : loc === 'gl' ? PAIR_GROUPS_GL
        : PAIR_GROUPS;
}

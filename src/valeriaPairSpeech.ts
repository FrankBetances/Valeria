// ============================================================================
// Valeria+ · Frases habladas de Pares Mínimos por VARIEDAD (locale)
// Fuente ÚNICA de las frases fijas que locuta la pantalla de Pares Mínimos,
// compartida con el corpus de voz (build-time) para que no deriven: si la
// pantalla y el corpus construyeran la misma frase por separado, en galego
// dejaría de resolver el asset de Celtia y caería a la voz del sistema.
//
// es y es-DO comparten las frases castellanas (es-DO las locuta con la voz
// latina del sistema); gl usa las gallegas (que suenan con Celtia porque
// están en el corpus). El banco del par (onTarget/onFoil…) ya viene localizado
// en pairsForLocale; aquí solo van las frases FIJAS de la mecánica.
// ============================================================================
import { Locale } from './valeriaLocale';
import { CarrierLang } from './valeriaCarrierPhrases';
import {
  ROLESWAP_INTRO, ROLESWAP_NOT_HEARD, ROLESWAP_HIT, ROLESWAP_MISS_OTHER, roleswapParentSaid,
} from './valeriaPhraseBank';
import {
  PAIRS_DONE_PHRASE_GL, pairIntroGl, pairRetryGl,
  ROLESWAP_INTRO_GL, ROLESWAP_NOT_HEARD_GL, ROLESWAP_HIT_GL, ROLESWAP_MISS_OTHER_GL, roleswapParentSaidGl,
} from './valeriaContentGl';
import {
  PAIRS_DONE_PHRASE_EU, pairIntroEu, pairRetryEu,
  ROLESWAP_INTRO_EU, ROLESWAP_NOT_HEARD_EU, ROLESWAP_HIT_EU, ROLESWAP_MISS_OTHER_EU, roleswapParentSaidEu,
} from './valeriaContentEu';
import {
  PAIRS_DONE_PHRASE_EN, pairIntroEn, pairRetryEn,
  ROLESWAP_INTRO_EN, ROLESWAP_NOT_HEARD_EN, ROLESWAP_HIT_EN, ROLESWAP_MISS_OTHER_EN, roleswapParentSaidEn,
} from './valeriaContentEn';
import {
  PAIRS_DONE_PHRASE_CA, pairIntroCa, pairRetryCa,
  ROLESWAP_INTRO_CA, ROLESWAP_NOT_HEARD_CA, ROLESWAP_HIT_CA, ROLESWAP_MISS_OTHER_CA, roleswapParentSaidCa,
} from './valeriaContentCa';

const isGl = (loc: Locale) => loc === 'gl';
const isEu = (loc: Locale) => loc === 'eu';
const isEn = (loc: Locale) => loc === 'en-US';
const isCa = (loc: Locale) => loc === 'ca';

// Idioma de las frases portadoras procedurales para la variedad.
export const carrierLang = (loc: Locale): CarrierLang =>
  (isGl(loc) ? 'gl' : isEu(loc) ? 'eu' : isCa(loc) ? 'ca' : 'es');

// Consigna del ensayo 0 (bombardeo de contraste): "esta es X, esta es Y + prompt".
export const pairIntro = (loc: Locale, target: string, foil: string, prompt: string): string =>
  isGl(loc) ? pairIntroGl(target, foil, prompt)
    : isEu(loc) ? pairIntroEu(target, foil, prompt)
      : isEn(loc) ? pairIntroEn(target, foil, prompt)
        : isCa(loc) ? pairIntroCa(target, foil, prompt)
          : `Esta es ${target}. Y esta es ${foil}. ${prompt}`;

// Reintento: "¡Otra vez! Di: X."
export const pairRetry = (loc: Locale, target: string): string =>
  isGl(loc) ? pairRetryGl(target)
    : isEu(loc) ? pairRetryEu(target)
      : isEn(loc) ? pairRetryEn(target)
        : isCa(loc) ? pairRetryCa(target)
          : `¡Otra vez! Di: ${target}.`;

// Cierre de la sesión de pares.
export const pairsDone = (loc: Locale): string =>
  isGl(loc) ? PAIRS_DONE_PHRASE_GL
    : isEu(loc) ? PAIRS_DONE_PHRASE_EU
      : isEn(loc) ? PAIRS_DONE_PHRASE_EN
        : isCa(loc) ? PAIRS_DONE_PHRASE_CA
          : '¡Sesión de pares completada! ¡Choca esos cinco con papá!';

// Frases del overlay de rotación de roles por variedad.
export interface RoleSwapPhrases {
  intro: string;
  notHeard: string;
  hit: string;
  missOther: string;
  parentSaid: (word: string) => string;
}
export const roleSwapPhrases = (loc: Locale): RoleSwapPhrases =>
  isGl(loc)
    ? { intro: ROLESWAP_INTRO_GL, notHeard: ROLESWAP_NOT_HEARD_GL, hit: ROLESWAP_HIT_GL, missOther: ROLESWAP_MISS_OTHER_GL, parentSaid: roleswapParentSaidGl }
    : isEu(loc)
      ? { intro: ROLESWAP_INTRO_EU, notHeard: ROLESWAP_NOT_HEARD_EU, hit: ROLESWAP_HIT_EU, missOther: ROLESWAP_MISS_OTHER_EU, parentSaid: roleswapParentSaidEu }
      : isEn(loc)
        ? { intro: ROLESWAP_INTRO_EN, notHeard: ROLESWAP_NOT_HEARD_EN, hit: ROLESWAP_HIT_EN, missOther: ROLESWAP_MISS_OTHER_EN, parentSaid: roleswapParentSaidEn }
        : isCa(loc)
          ? { intro: ROLESWAP_INTRO_CA, notHeard: ROLESWAP_NOT_HEARD_CA, hit: ROLESWAP_HIT_CA, missOther: ROLESWAP_MISS_OTHER_CA, parentSaid: roleswapParentSaidCa }
          : { intro: ROLESWAP_INTRO, notHeard: ROLESWAP_NOT_HEARD, hit: ROLESWAP_HIT, missOther: ROLESWAP_MISS_OTHER, parentSaid: roleswapParentSaid };

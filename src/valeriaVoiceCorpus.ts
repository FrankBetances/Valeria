// ============================================================================
// Valeria+ · Corpus de voz enumerable — Fase 1 del plan ILENIA/Nós
// Enumera TODO lo que la app puede locutar como pares (estilo, texto) con un
// id estable. Es el contrato entre la app y la tubería de build-time:
//
//   buildVoiceCorpus() ──(scripts/export-voice-corpus.js)──▶ voice-corpus.json
//        ──(Fase 2: síntesis ILENIA/Nós)──▶ assets/voice/*.m4a
//        ──(mapa generado)──▶ valeriaVoiceAssets.ts ──▶ valeriaVoice (runtime)
//
// El id es hash(estilo + texto normalizado): si un texto cambia en el código,
// su id cambia, el mapa deja de resolver y la locución cae limpiamente al
// motor del sistema (expo-speech). La deriva degrada calidad, nunca rompe.
//
// Módulo PURO: solo importa otros módulos puros de datos. Un script Node debe
// poder compilarlo y ejecutarlo sin react-native ni expo.
// ============================================================================
import { MINIMAL_PAIRS } from './valeriaMinimalPairs';
import { MINIMAL_PAIRS_GL } from './valeriaMinimalPairsGl';
import { enumerateAllCarrierPrompts } from './valeriaCarrierPhrases';
import { TPR_CAPSULES } from './valeriaTprBank';
import { ROUTINE_ROUTES } from './valeriaRoutineRoutes';
import {
  PRAISE_BANK, ALMOST_BANK, NO_HEAR_BANK, TOGETHER_BANK,
  SESSION_CONTINUE_PHRASE, ROUTE_DONE_PHRASE, VOICE_SAMPLE_PHRASE,
  ROLESWAP_INTRO, ROLESWAP_NOT_HEARD, ROLESWAP_HIT, ROLESWAP_MISS_OTHER, roleswapParentSaid,
} from './valeriaPhraseBank';
import {
  TPR_CAPSULES_GL, ROUTINE_ROUTES_GL,
  PRAISE_BANK_GL, ALMOST_BANK_GL, NO_HEAR_BANK_GL, TOGETHER_BANK_GL,
  SESSION_CONTINUE_PHRASE_GL, ROUTE_DONE_PHRASE_GL, VOICE_SAMPLE_PHRASE_GL,
  PAIRS_DONE_PHRASE_GL, pairIntroGl, pairRetryGl,
  ROLESWAP_INTRO_GL, ROLESWAP_NOT_HEARD_GL, ROLESWAP_HIT_GL, ROLESWAP_MISS_OTHER_GL, roleswapParentSaidGl,
} from './valeriaContentGl';

// Estilos de locución de valeriaVoice. El audio pre-generado "hornea" el
// estilo (prosodia, velocidad) en el propio WAV, así que un mismo texto en dos
// estilos son DOS entradas del corpus con ids distintos.
export type VoiceStyle = 'tutor' | 'child' | 'clinical' | 'slow';

// Idiomas del corpus (plan Nós): un MISMO texto puede existir en es y gl
// ("boca", "casa") con audios distintos → el idioma forma parte del id.
export type VoiceLang = 'es' | 'gl';

export interface VoiceCorpusEntry {
  id: string;         // clave del mapa y nombre de asset (incluye idioma si ≠ es)
  lang: VoiceLang;
  style: VoiceStyle;
  text: string;
  source: string;     // de qué banco sale (trazabilidad en la tubería)
}

// Normalización: los espacios no cambian la locución; todo lo demás sí.
const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim();

// FNV-1a de 32 bits en hex + longitud: estable entre plataformas (opera sobre
// unidades UTF-16), suficiente para ~10k entradas sin colisiones prácticas.
function fnv1a(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// Retro-compatibilidad: los ids castellanos conservan su forma original
// (los 392 assets es ya sintetizados no se renombran); el resto de idiomas
// añade su prefijo para desambiguar textos idénticos entre lenguas.
export const voiceCorpusId = (style: VoiceStyle, text: string, lang: VoiceLang = 'es'): string => {
  const n = normalize(text);
  const base = `${style}_${fnv1a(n)}_${n.length}`;
  return lang === 'es' ? base : `${lang}_${base}`;
};

// ----------------------------------------------------------------------------
// Construcción del corpus completo.
// ----------------------------------------------------------------------------
export function buildVoiceCorpus(): VoiceCorpusEntry[] {
  const entries = new Map<string, VoiceCorpusEntry>();
  const mkAdd = (lang: VoiceLang) => (style: VoiceStyle, text: string, source: string): void => {
    const t = normalize(text);
    if (!t) return;
    const id = voiceCorpusId(style, t, lang);
    if (!entries.has(id)) entries.set(id, { id, lang, style, text: t, source });
  };

  // ========================== CASTELLANO (es) ==========================
  const add = mkAdd('es');

  // 1) Frases portadoras procedurales (prosodia clínica): enumeración total,
  //    acotada a los objetivos del banco peninsular (los del dominicano se
  //    locutan con la voz del sistema, no necesitan asset pregenerado).
  for (const p of enumerateAllCarrierPrompts('es', MINIMAL_PAIRS.map((mp) => mp.target))) {
    add('clinical', p.full, 'carrier');
  }

  // 2) Pares mínimos: consignas, celebraciones, correcciones y modelado lento.
  //    Las plantillas espejo replican las cadenas de ValeriaMinimalPairsScreen;
  //    si esa pantalla cambia un literal, la entrada deja de resolver y cae a
  //    expo-speech (la Fase 3 añadirá el check de cobertura en CI).
  for (const p of MINIMAL_PAIRS) {
    add('child', `Esta es ${p.target}. Y esta es ${p.foil}. ${p.prompt}`, 'pares/intro');
    add('child', p.prompt, 'pares/prompt');
    add('child', p.onTarget.say, 'pares/celebracion');
    add('child', p.onFoil.say, 'pares/correccion');
    add('child', `¡Otra vez! Di: ${p.target}.`, 'pares/retry');
    add('slow', p.target.toLowerCase(), 'pares/modelado');
    // Rotación de roles: "Papá dijo <palabra>" con la palabra del par (target/foil).
    add('child', roleswapParentSaid(p.target), 'pares/roleswap');
    add('child', roleswapParentSaid(p.foil), 'pares/roleswap');
  }
  add('child', '¡Sesión de pares completada! ¡Choca esos cinco con papá!', 'pares/fin');
  // Frases fijas del overlay de rotación de roles (Pares Mínimos).
  add('child', ROLESWAP_INTRO, 'pares/roleswap');
  add('child', ROLESWAP_NOT_HEARD, 'pares/roleswap');
  add('child', ROLESWAP_HIT, 'pares/roleswap');
  add('child', ROLESWAP_MISS_OTHER, 'pares/roleswap');

  // 3) Cápsulas TPR y Rutas de Rutina.
  for (const c of TPR_CAPSULES) for (const cmd of c.commands) add('child', cmd.text, 'tpr');
  add('child', SESSION_CONTINUE_PHRASE, 'tpr/fin');
  for (const r of ROUTINE_ROUTES) for (const cmd of r.commands) add('clinical', cmd.text, 'rutas');
  add('clinical', ROUTE_DONE_PHRASE, 'rutas/fin');

  // 4) Bancos de refuerzo y utilidades.
  for (const t of PRAISE_BANK) add('child', t, 'banco/elogio');
  for (const t of ALMOST_BANK) add('child', t, 'banco/casi');
  for (const t of NO_HEAR_BANK) add('child', t, 'banco/no-oido');
  for (const t of TOGETHER_BANK) add('child', t, 'banco/juntos');
  add('child', VOICE_SAMPLE_PHRASE, 'util/muestra');

  // ============================ GALEGO (gl) ============================
  // Contido do plan Proxecto Nós (GL-2.x), en borrador pendente de revisión;
  // sintetízase con Celtia para poder avalialo (a app aínda non o emite).
  const addGl = mkAdd('gl');

  for (const p of enumerateAllCarrierPrompts('gl')) addGl('clinical', p.full, 'carrier');

  for (const p of MINIMAL_PAIRS_GL) {
    // Intro/retry con los mismos builders que la pantalla (valeriaPairSpeech
    // → valeriaContentGl): así el texto coincide y el asset de Celtia resuelve.
    addGl('child', pairIntroGl(p.target, p.foil, p.prompt), 'pares/intro');
    addGl('child', p.prompt, 'pares/prompt');
    addGl('child', p.onTarget.say, 'pares/celebracion');
    addGl('child', p.onFoil.say, 'pares/correccion');
    addGl('child', pairRetryGl(p.target), 'pares/retry');
    addGl('slow', p.target.toLowerCase(), 'pares/modelado');
    // Rotación de roles: "Papá dixo <palabra>" con target/foil del par gl.
    addGl('child', roleswapParentSaidGl(p.target), 'pares/roleswap');
    addGl('child', roleswapParentSaidGl(p.foil), 'pares/roleswap');
  }
  addGl('child', PAIRS_DONE_PHRASE_GL, 'pares/fin');
  // Frases fijas del overlay de rotación de roles en galego.
  addGl('child', ROLESWAP_INTRO_GL, 'pares/roleswap');
  addGl('child', ROLESWAP_NOT_HEARD_GL, 'pares/roleswap');
  addGl('child', ROLESWAP_HIT_GL, 'pares/roleswap');
  addGl('child', ROLESWAP_MISS_OTHER_GL, 'pares/roleswap');

  for (const c of TPR_CAPSULES_GL) for (const cmd of c.commands) addGl('child', cmd.text, 'tpr');
  addGl('child', SESSION_CONTINUE_PHRASE_GL, 'tpr/fin');
  for (const r of ROUTINE_ROUTES_GL) for (const cmd of r.commands) addGl('clinical', cmd.text, 'rutas');
  addGl('clinical', ROUTE_DONE_PHRASE_GL, 'rutas/fin');

  for (const t of PRAISE_BANK_GL) addGl('child', t, 'banco/elogio');
  for (const t of ALMOST_BANK_GL) addGl('child', t, 'banco/casi');
  for (const t of NO_HEAR_BANK_GL) addGl('child', t, 'banco/no-oido');
  for (const t of TOGETHER_BANK_GL) addGl('child', t, 'banco/juntos');
  addGl('child', VOICE_SAMPLE_PHRASE_GL, 'util/muestra');

  return Array.from(entries.values());
}

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
import { MINIMAL_PAIRS_EU } from './valeriaMinimalPairsEu';
import { enumerateAllCarrierPrompts } from './valeriaCarrierPhrases';
import { TPR_CAPSULES } from './valeriaTprBank';
import { ROUTINE_ROUTES } from './valeriaRoutineRoutes';
import { enumerateSemanticSpeech, enumerateSemanticSpeechFor } from './valeriaSemanticExpansion';
import {
  DAILY_SCENARIOS_EU, PROGRESSION_SEQUENCES_EU, CONTRAST_CAPSULES_EU,
  SEM_RETRY_EU, SEM_SESSION_DONE_EU,
} from './valeriaSemanticExpansionEu';
import {
  enumerateExerciseSpeech, enumerateExerciseSpeechFor,
  dbForLocale, variantsForLocale, pluralOneLabelFor, pluralManyLabelFor,
} from './valeriaExerciseBank';
import { EXERCISE_FIXED_LINES_EU } from './valeriaExerciseEu';
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
import {
  TPR_CAPSULES_EU, ROUTINE_ROUTES_EU,
  PRAISE_BANK_EU, ALMOST_BANK_EU, NO_HEAR_BANK_EU, TOGETHER_BANK_EU,
  SESSION_CONTINUE_PHRASE_EU, ROUTE_DONE_PHRASE_EU, VOICE_SAMPLE_PHRASE_EU,
  PAIRS_DONE_PHRASE_EU, pairIntroEu, pairRetryEu,
  ROLESWAP_INTRO_EU, ROLESWAP_NOT_HEARD_EU, ROLESWAP_HIT_EU, ROLESWAP_MISS_OTHER_EU, roleswapParentSaidEu,
} from './valeriaContentEu';

// Estilos de locución de valeriaVoice. El audio pre-generado "hornea" el
// estilo (prosodia, velocidad) en el propio WAV, así que un mismo texto en dos
// estilos son DOS entradas del corpus con ids distintos.
export type VoiceStyle = 'tutor' | 'child' | 'clinical' | 'slow';

// Idiomas del corpus (planes Nós y ILENIA/NEL-GAITU): un MISMO texto puede
// existir en varias lenguas ("boca", "casa") con audios distintos → el idioma
// forma parte del id. es conserva su forma histórica; el resto lleva prefijo.
export type VoiceLang = 'es' | 'gl' | 'eu';

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

  // 5) Expansión Semántica (es): consignas, modelos, reintentos y acciones
  //    físicas de escenarios, progresiones y contrastes. Hasta ahora esta
  //    pantalla caía a la voz del sistema; ahora la enumera su módulo de datos.
  for (const l of enumerateSemanticSpeech()) add(l.style, l.text, 'expansion');

  // 6) Audición y Lenguaje (es): consignas, modelos de palabra, ejemplos y
  //    veredictos de los mini-juegos (banco valeriaExerciseBank), igual que
  //    los locuta ValeriaExercisePlayerScreen y los apoyos de ValeriaVoiceUI.
  for (const l of enumerateExerciseSpeech()) add(l.style, l.text, 'ejercicios');

  // ============================ GALEGO (gl) ============================
  // Contido do plan Proxecto Nós (GL-2.x), aprobado para produción;
  // sintetízase con Celtia e emítese nas sesións en galego.
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

  // ============================ EUSKERA (eu) ============================
  // Contenido del plan ILENIA/NEL-GAITU (EU-2.x), BORRADOR pendiente de
  // revisión; se sintetiza con la voz HiTZ-TTS y se emite en las sesiones en
  // euskera. Espejo estructural del bloque galego.
  const addEu = mkAdd('eu');

  for (const p of enumerateAllCarrierPrompts('eu')) addEu('clinical', p.full, 'carrier');

  for (const p of MINIMAL_PAIRS_EU) {
    // Intro/retry con los mismos builders que la pantalla (valeriaPairSpeech
    // → valeriaContentEu): así el texto coincide y el asset de HiTZ resuelve.
    addEu('child', pairIntroEu(p.target, p.foil, p.prompt), 'pares/intro');
    addEu('child', p.prompt, 'pares/prompt');
    addEu('child', p.onTarget.say, 'pares/celebracion');
    addEu('child', p.onFoil.say, 'pares/correccion');
    addEu('child', pairRetryEu(p.target), 'pares/retry');
    addEu('slow', p.target.toLowerCase(), 'pares/modelado');
    // Rotación de roles: "Aitak <palabra> esan du" con target/foil del par eu.
    addEu('child', roleswapParentSaidEu(p.target), 'pares/roleswap');
    addEu('child', roleswapParentSaidEu(p.foil), 'pares/roleswap');
  }
  addEu('child', PAIRS_DONE_PHRASE_EU, 'pares/fin');
  // Frases fijas del overlay de rotación de roles en euskera.
  addEu('child', ROLESWAP_INTRO_EU, 'pares/roleswap');
  addEu('child', ROLESWAP_NOT_HEARD_EU, 'pares/roleswap');
  addEu('child', ROLESWAP_HIT_EU, 'pares/roleswap');
  addEu('child', ROLESWAP_MISS_OTHER_EU, 'pares/roleswap');

  for (const c of TPR_CAPSULES_EU) for (const cmd of c.commands) addEu('child', cmd.text, 'tpr');
  addEu('child', SESSION_CONTINUE_PHRASE_EU, 'tpr/fin');
  for (const r of ROUTINE_ROUTES_EU) for (const cmd of r.commands) addEu('clinical', cmd.text, 'rutas');
  addEu('clinical', ROUTE_DONE_PHRASE_EU, 'rutas/fin');

  for (const t of PRAISE_BANK_EU) addEu('child', t, 'banco/elogio');
  for (const t of ALMOST_BANK_EU) addEu('child', t, 'banco/casi');
  for (const t of NO_HEAR_BANK_EU) addEu('child', t, 'banco/no-oido');
  for (const t of TOGETHER_BANK_EU) addEu('child', t, 'banco/juntos');
  addEu('child', VOICE_SAMPLE_PHRASE_EU, 'util/muestra');

  // Expansión Semántica en euskera (escenarios, progresiones y contrastes):
  // se locuta con HiTZ igual que la base es con Sharvard.
  for (const l of enumerateSemanticSpeechFor({
    scenarios: DAILY_SCENARIOS_EU,
    sequences: PROGRESSION_SEQUENCES_EU,
    capsules: CONTRAST_CAPSULES_EU,
    retry: SEM_RETRY_EU,
    sessionDone: SEM_SESSION_DONE_EU,
  })) addEu(l.style, l.text, 'expansion');

  // Audición y Lenguaje (+ TEA/Dislexia) en euskera: se locuta con HiTZ igual
  // que la base es con Sharvard.
  for (const l of enumerateExerciseSpeechFor({
    db: dbForLocale('eu'),
    variants: variantsForLocale('eu'),
    fixed: EXERCISE_FIXED_LINES_EU,
    pluralOne: (p) => pluralOneLabelFor('eu', p),
    pluralMany: (p) => pluralManyLabelFor('eu', p),
  })) addEu(l.style, l.text, 'ejercicios');

  return Array.from(entries.values());
}

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
import { enumerateAllCarrierPrompts } from './valeriaCarrierPhrases';
import { TPR_CAPSULES } from './valeriaTprBank';
import { ROUTINE_ROUTES } from './valeriaRoutineRoutes';
import {
  PRAISE_BANK, ALMOST_BANK, NO_HEAR_BANK, TOGETHER_BANK,
  SESSION_CONTINUE_PHRASE, ROUTE_DONE_PHRASE, VOICE_SAMPLE_PHRASE,
} from './valeriaPhraseBank';

// Estilos de locución de valeriaVoice. El audio pre-generado "hornea" el
// estilo (prosodia, velocidad) en el propio WAV, así que un mismo texto en dos
// estilos son DOS entradas del corpus con ids distintos.
export type VoiceStyle = 'tutor' | 'child' | 'clinical' | 'slow';

export interface VoiceCorpusEntry {
  id: string;         // `${estilo}_${hash}` — nombre de asset y clave del mapa
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

export const voiceCorpusId = (style: VoiceStyle, text: string): string => {
  const n = normalize(text);
  return `${style}_${fnv1a(n)}_${n.length}`;
};

// ----------------------------------------------------------------------------
// Construcción del corpus completo.
// ----------------------------------------------------------------------------
export function buildVoiceCorpus(): VoiceCorpusEntry[] {
  const entries = new Map<string, VoiceCorpusEntry>();
  const add = (style: VoiceStyle, text: string, source: string): void => {
    const t = normalize(text);
    if (!t) return;
    const id = voiceCorpusId(style, t);
    if (!entries.has(id)) entries.set(id, { id, style, text: t, source });
  };

  // 1) Frases portadoras procedurales (prosodia clínica): enumeración total.
  for (const p of enumerateAllCarrierPrompts()) add('clinical', p.full, 'carrier');

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
  }
  add('child', '¡Sesión de pares completada! ¡Choca esos cinco con papá!', 'pares/fin');

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

  return Array.from(entries.values());
}

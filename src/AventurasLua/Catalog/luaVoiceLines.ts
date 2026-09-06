// ============================================================================
// Aventuras con Lúa · Todo lo que la app DICE en este módulo
//
// Existe por la regla que costó el build 499: un texto locutado que no está en
// `valeriaVoiceCorpus` no falla, no sale en rojo y no se nota — simplemente cae
// a la voz del sistema. En gallego y euskera eso significa perder Celtia e
// ILENIA en silencio, que es la peor forma de romper algo.
//
// El módulo nació con 60 consignas, 60 refuerzos, 60 devoluciones al niño, los
// párrafos de 10 cuentos y las letras de 10 canciones fuera del corpus. Este
// enumerador los mete, y `verify-aventuras-lua.js` impide que se vuelvan a
// separar: cualquier campo locutado nuevo tiene que pasar por aquí.
//
// MÓDULO PURO: solo datos. Lo compila y ejecuta Node sin react-native.
// ============================================================================
import {
  luaAssessmentFor, luaStoriesFor, luaSongsFor, luaGamesFor,
} from './luaCatalogsFor';

export interface LuaSpokenLine {
  /** El estilo del motor. Todo este módulo le habla al niño. */
  style: 'child';
  text: string;
  source: string;
}

/**
 * Las locuciones del módulo, en el MISMO troceado con el que salen por el
 * altavoz. Importa que coincida: el id del corpus es hash(estilo + texto), así
 * que una frase compuesta de otra manera resuelve otro id y no encuentra asset.
 *
 * `loc` elige el banco (set/2026): con 'gl' enumera el galego, y así las 553
 * locuciones del módulo entran al corpus también en gallego y las sintetiza
 * Celtia. Sin este parámetro, el corpus solo conocía el castellano y una
 * sesión galega caía a la voz del sistema en silencio.
 */
export function enumerateLuaAdventureSpeech(loc: string = 'es'): LuaSpokenLine[] {
  const out: LuaSpokenLine[] = [];
  const add = (text: string, source: string): void => {
    const t = (text ?? '').trim();
    if (t) out.push({ style: 'child', text: t, source });
  };

  for (const q of luaAssessmentFor(loc)) {
    add(q.prompt, 'lua/eval/consigna');
    add(q.clinicalSupport.targetFeedback, 'lua/eval/refuerzo');
    // Lo que oye el niño al no acertar. `modelingFeedback` NO entra: es la
    // pauta del adulto y no se locuta.
    add(q.childRecast, 'lua/eval/devolucion');
  }

  for (const s of luaStoriesFor(loc)) {
    add(s.title, 'lua/cuento/titulo');
    for (const p of s.paragraphs) add(p, 'lua/cuento/parrafo');
    for (const q of s.comprehensionQuestions) {
      add(q.question, 'lua/cuento/pregunta');
      add(q.hint, 'lua/cuento/pista');
    }
    add(s.drawingPrompt, 'lua/cuento/dibujo');
  }

  for (const c of luaSongsFor(loc)) {
    add(c.title, 'lua/cancion/titulo');
    add(c.consigna, 'lua/cancion/consigna');
    // Verso a verso, no la letra entera concatenada: la pantalla la reproduce
    // con speakToChildSeq para que cada verso resuelva su propio asset.
    for (const v of c.lyrics) add(v, 'lua/cancion/verso');
    for (const e of c.interactiveTask.elements ?? []) add(e, 'lua/cancion/elemento');
  }

  for (const j of luaGamesFor(loc)) {
    add(j.title, 'lua/juego/titulo');
    add(j.instructions, 'lua/juego/consigna');
    for (const c of j.clues ?? []) add(c, 'lua/juego/pista');
    for (const it of j.items) add(it.label, 'lua/juego/estimulo');
  }

  return out;
}

// ============================================================================
// Aventuras con Lúa · Que catálogo se usa en cada variedade
//
// O módulo naceu só en castelán, e `luaSpeech.ts` forzaba a voz castelá para
// que polo menos non lle pedise a Celtia que lera castelán. Desde set/2026 hai
// banco GALEGO propio —60 exercicios, 10 contos, 10 cancións e 25 xogos— e o
// forzado desaparece para `gl`.
//
// A fusión é por CAMPO e nunca toca o que decide a clínica: `isTarget`, `pic`,
// `ageBand`, `kind` e os ids veñen sempre do catálogo base. A capa galega só
// achega texto. Se algún día falta unha peza, `check-lua-gl-coverage.js` deixa
// o build en vermello: media sección en castelán dentro dunha sesión galega é
// exactamente o que este repositorio non permite (uiLangFallback, regra 0).
//
// MÓDULO PURO: recibe a variedade por parámetro e non importa `valeriaLocale`,
// porque `luaVoiceLines` compílao e execútao Node nos gates.
// ============================================================================
import { LUA_ASSESSMENT_CATALOG, LuaAssessmentQuestion } from './LuaAssessmentCatalog';
import { LUA_STORIES_CATALOG, LuaStory } from './LuaStoriesCatalog';
import { LUA_SONGS_CATALOG, LuaSong } from './LuaSongsCatalog';
import { LUA_GAMES_CATALOG, LuaGame } from './LuaGamesCatalog';
import { LUA_ASSESSMENT_GL } from './gl/luaAssessmentGl';
import { LUA_STORIES_GL } from './gl/luaStoriesGl';
import { LUA_SONGS_GL } from './gl/luaSongsGl';
import { LUA_GAMES_GL } from './gl/luaGamesGl';

/** Variedades con banco PROPIO neste módulo. O resto escoita castelán, e a
 *  pantalla e o README dinno. `es-DO` comparte texto co castelán. */
export const LUA_BANK_LANGS = ['es', 'es-DO', 'gl'] as const;

/** Lingua do banco que lle toca a unha variedade. */
export const luaBankLangFor = (loc: string): 'es' | 'gl' => (loc === 'gl' ? 'gl' : 'es');

// ---------------------------------------------------------------- exercicios
export function luaAssessmentFor(loc: string): LuaAssessmentQuestion[] {
  if (luaBankLangFor(loc) !== 'gl') return LUA_ASSESSMENT_CATALOG;
  return LUA_ASSESSMENT_CATALOG.map((q) => {
    const o = LUA_ASSESSMENT_GL[q.id];
    if (!o) return q;
    return {
      ...q,
      prompt: o.prompt ?? q.prompt,
      subPrompt: o.subPrompt ?? q.subPrompt,
      childRecast: o.childRecast ?? q.childRecast,
      // As etiquetas van por posición; id, pic e isTarget non se tocan.
      options: q.options.map((opt, i) => ({ ...opt, label: o.options?.[i] ?? opt.label })),
      clinicalSupport: {
        ...q.clinicalSupport,
        targetFeedback: o.targetFeedback ?? q.clinicalSupport.targetFeedback,
        modelingFeedback: o.modelingFeedback ?? q.clinicalSupport.modelingFeedback,
        adultGuidance: o.adultGuidance ?? q.clinicalSupport.adultGuidance,
      },
    };
  });
}

// -------------------------------------------------------------------- contos
export function luaStoriesFor(loc: string): LuaStory[] {
  if (luaBankLangFor(loc) !== 'gl') return LUA_STORIES_CATALOG;
  return LUA_STORIES_CATALOG.map((s) => {
    const o = LUA_STORIES_GL[s.id];
    if (!o) return s;
    return {
      ...s,
      title: o.title ?? s.title,
      suggestedAgeText: o.suggestedAgeText ?? s.suggestedAgeText,
      paragraphs: o.paragraphs ?? s.paragraphs,
      drawingPrompt: o.drawingPrompt ?? s.drawingPrompt,
      comprehensionQuestions: s.comprehensionQuestions.map((q) => {
        const qo = o.questions?.[q.id];
        if (!qo) return q;
        return {
          ...q,
          question: qo.question ?? q.question,
          hint: qo.hint ?? q.hint,
          // Por id de opción: `isCorrect` e `pic` quedan onde estaban.
          options: q.options.map((opt) => ({ ...opt, text: qo.options?.[opt.id] ?? opt.text })),
        };
      }),
      newWords: s.newWords.map((w, i) => ({
        ...w,
        word: o.newWords?.[i]?.word ?? w.word,
        definition: o.newWords?.[i]?.definition ?? w.definition,
      })),
    };
  });
}

// ------------------------------------------------------------------ cancións
export function luaSongsFor(loc: string): LuaSong[] {
  if (luaBankLangFor(loc) !== 'gl') return LUA_SONGS_CATALOG;
  return LUA_SONGS_CATALOG.map((c) => {
    const o = LUA_SONGS_GL[c.id];
    if (!o) return c;
    return {
      ...c,
      title: o.title ?? c.title,
      subtitle: o.subtitle ?? c.subtitle,
      consigna: o.consigna ?? c.consigna,
      lyrics: o.lyrics ?? c.lyrics,
      interactiveTask: {
        ...c.interactiveTask,
        title: o.interactiveTask?.title ?? c.interactiveTask.title,
        description: o.interactiveTask?.description ?? c.interactiveTask.description,
        elements: o.interactiveTask?.elements ?? c.interactiveTask.elements,
      },
    };
  });
}

// --------------------------------------------------------------------- xogos
export function luaGamesFor(loc: string): LuaGame[] {
  if (luaBankLangFor(loc) !== 'gl') return LUA_GAMES_CATALOG;
  return LUA_GAMES_CATALOG.map((j) => {
    const o = LUA_GAMES_GL[j.id];
    if (!o) return j;
    return {
      ...j,
      title: o.title ?? j.title,
      subtitle: o.subtitle ?? j.subtitle,
      instructions: o.instructions ?? j.instructions,
      groups: o.groups ?? j.groups,
      clues: o.clues ?? j.clues,
      items: o.items ?? j.items,
    };
  });
}

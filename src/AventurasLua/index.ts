// ============================================================================
// Aventuras con Lúa · Lúa y las Palabras — Barrel Export
// ============================================================================

export * from './Theme/luaTheme';
export * from './Catalog/LuaAssessmentCatalog';
export * from './Catalog/LuaStoriesCatalog';
export * from './Catalog/LuaSongsCatalog';
export * from './Catalog/LuaPrintablesCatalog';
export * from './Catalog/LuaGamesCatalog';
export * from './Screens/ValeriaAventurasLuaHubScreen';
export * from './Screens/LuaAssessmentPlayerScreen';
export * from './Screens/LuaStoryViewerScreen';
export * from './Screens/LuaSongPlayerScreen';
export * from './Screens/LuaPrintablesScreen';
export * from './Screens/LuaGamePlayerScreen';

// Cuántas actividades ofrece el módulo. La tarjeta del hub llevaba un 60
// literal —el número de preguntas— cuando el módulo trae 90 piezas, y no se
// movía al añadir contenido. Las demás tarjetas del hub derivan su cifra del
// banco; esta también.
import { LUA_ASSESSMENT_CATALOG } from './Catalog/LuaAssessmentCatalog';
import { LUA_STORIES_CATALOG } from './Catalog/LuaStoriesCatalog';
import { LUA_SONGS_CATALOG } from './Catalog/LuaSongsCatalog';
import { LUA_PRINTABLES_CATALOG } from './Catalog/LuaPrintablesCatalog';
import { LUA_GAMES_CATALOG } from './Catalog/LuaGamesCatalog';

export const LUA_ACTIVITY_COUNT =
  LUA_ASSESSMENT_CATALOG.length +
  LUA_STORIES_CATALOG.length +
  LUA_SONGS_CATALOG.length +
  LUA_PRINTABLES_CATALOG.length +
  LUA_GAMES_CATALOG.length;

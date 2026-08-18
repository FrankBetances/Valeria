// ============================================================================
// Valeria+ · Lúa · Servicio de persistencia de inventario y coleccionables
//
// Almacenamiento local-first seguro en AsyncStorage. Sincroniza desbloqueos
// automáticamente con la progresión de la sesión clínica de Valeria+.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LuaInventoryState, CollectibleItem } from '../types/valeriaLua';
import { COLLECTIBLES_CATALOG } from '../components/lua/luaPixelSegments';
import { GameState, liveStreak, levelFor } from '../valeriaGamification';

const LUA_INVENTORY_KEY = '@valeria_lua_inventory_v1';

export const DEFAULT_LUA_INVENTORY: LuaInventoryState = {
  unlockedItemIds: ['snack_fish'],
  equipped: {
    head: undefined,
    neck: undefined,
  },
  lastFedTimestamp: 0,
  totalPatsCount: 0,
};

export const loadLuaInventory = async (): Promise<LuaInventoryState> => {
  try {
    const raw = await AsyncStorage.getItem(LUA_INVENTORY_KEY);
    if (!raw) return DEFAULT_LUA_INVENTORY;
    const parsed = JSON.parse(raw);
    return {
      unlockedItemIds: Array.isArray(parsed.unlockedItemIds)
        ? parsed.unlockedItemIds
        : DEFAULT_LUA_INVENTORY.unlockedItemIds,
      equipped: parsed.equipped || DEFAULT_LUA_INVENTORY.equipped,
      lastFedTimestamp: typeof parsed.lastFedTimestamp === 'number' ? parsed.lastFedTimestamp : 0,
      totalPatsCount: typeof parsed.totalPatsCount === 'number' ? parsed.totalPatsCount : 0,
    };
  } catch {
    return DEFAULT_LUA_INVENTORY;
  }
};

export const saveLuaInventory = async (state: LuaInventoryState): Promise<void> => {
  try {
    await AsyncStorage.setItem(LUA_INVENTORY_KEY, JSON.stringify(state));
  } catch {
    // Almacenamiento no disponible o error de I/O silencioso
  }
};

/**
 * Evalúa las condiciones clínicas del GameState y desbloquea los coleccionables
 * correspondientes sin sobrescribir lo que el usuario ya tenía.
 */
export const checkAndUnlockItems = async (
  game: GameState | null,
  currentInventory?: LuaInventoryState
): Promise<{ inventory: LuaInventoryState; newlyUnlocked: CollectibleItem[] }> => {
  const inv = currentInventory ? { ...currentInventory } : await loadLuaInventory();
  if (!game) return { inventory: inv, newlyUnlocked: [] };

  const streak = liveStreak(game);
  const level = levelFor(game.xp);
  const newlyUnlocked: CollectibleItem[] = [];

  for (const item of COLLECTIBLES_CATALOG) {
    if (inv.unlockedItemIds.includes(item.id)) continue;

    let qualifies = false;
    if (item.requiredSessions !== undefined && game.sessions >= item.requiredSessions) {
      qualifies = true;
    }
    if (item.requiredStreak !== undefined && streak >= item.requiredStreak) {
      qualifies = true;
    }
    if (item.requiredLevel !== undefined && level >= item.requiredLevel) {
      qualifies = true;
    }

    if (qualifies) {
      inv.unlockedItemIds.push(item.id);
      newlyUnlocked.push(item);
    }
  }

  if (newlyUnlocked.length > 0) {
    await saveLuaInventory(inv);
  }

  return { inventory: inv, newlyUnlocked };
};

export const equipLuaAccessory = async (
  slot: 'head' | 'neck',
  itemId?: string
): Promise<LuaInventoryState> => {
  const inv = await loadLuaInventory();
  inv.equipped[slot] = itemId;
  await saveLuaInventory(inv);
  return inv;
};

export const recordPatInteraction = async (): Promise<LuaInventoryState> => {
  const inv = await loadLuaInventory();
  inv.totalPatsCount = (inv.totalPatsCount || 0) + 1;
  await saveLuaInventory(inv);
  return inv;
};

export const feedLuaSnack = async (snackId: string): Promise<LuaInventoryState> => {
  const inv = await loadLuaInventory();
  inv.lastFedTimestamp = Date.now();
  await saveLuaInventory(inv);
  return inv;
};

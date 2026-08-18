// ============================================================================
// Valeria+ · Lúa · Servicio de persistencia de inventario y coleccionables
//
// Almacenamiento local-first seguro en AsyncStorage. Sincroniza desbloqueos
// automáticamente con la progresión de la sesión clínica de Valeria+.
//
// MÓDULO DE PERSISTENCIA: Cero dependencias de React o react-native-svg.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LuaInventoryState,
  CollectibleItem,
  createDefaultLuaInventory,
  evaluateUnlockedItems,
} from '../types/valeriaLua';
import { GameState, liveStreak, levelFor } from '../valeriaGamification';

const LUA_INVENTORY_KEY = '@valeria_lua_inventory_v1';

export { createDefaultLuaInventory, DEFAULT_LUA_INVENTORY } from '../types/valeriaLua';

export const loadLuaInventory = async (): Promise<LuaInventoryState> => {
  try {
    const raw = await AsyncStorage.getItem(LUA_INVENTORY_KEY);
    if (!raw) return createDefaultLuaInventory();
    const parsed = JSON.parse(raw);
    return {
      unlockedItemIds: Array.isArray(parsed.unlockedItemIds)
        ? [...parsed.unlockedItemIds]
        : ['snack_fish'],
      equipped: {
        head: parsed.equipped?.head,
        neck: parsed.equipped?.neck,
      },
      lastFedTimestamp: typeof parsed.lastFedTimestamp === 'number' ? parsed.lastFedTimestamp : 0,
      lastFedSnackId: typeof parsed.lastFedSnackId === 'string' ? parsed.lastFedSnackId : undefined,
      totalPatsCount: typeof parsed.totalPatsCount === 'number' ? parsed.totalPatsCount : 0,
    };
  } catch {
    return createDefaultLuaInventory();
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
 * correspondientes sin sobrescribir lo que el usuario ya tenía ni mutar constantes.
 */
export const checkAndUnlockItems = async (
  game: GameState | null,
  currentInventory?: LuaInventoryState
): Promise<{ inventory: LuaInventoryState; newlyUnlocked: CollectibleItem[] }> => {
  const base = currentInventory ? currentInventory : await loadLuaInventory();
  const inv: LuaInventoryState = {
    unlockedItemIds: [...base.unlockedItemIds],
    equipped: { ...base.equipped },
    lastFedTimestamp: base.lastFedTimestamp,
    lastFedSnackId: base.lastFedSnackId,
    totalPatsCount: base.totalPatsCount,
  };

  if (!game) return { inventory: inv, newlyUnlocked: [] };

  const streak = liveStreak(game);
  const level = levelFor(game.xp);
  const newlyUnlocked = evaluateUnlockedItems(game.sessions, streak, level, inv.unlockedItemIds);

  if (newlyUnlocked.length > 0) {
    for (const item of newlyUnlocked) {
      if (!inv.unlockedItemIds.includes(item.id)) {
        inv.unlockedItemIds.push(item.id);
      }
    }
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
  inv.lastFedSnackId = snackId;
  await saveLuaInventory(inv);
  return inv;
};

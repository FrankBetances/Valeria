// ============================================================================
// Valeria+ · Lúa · Tipos, contratos y catálogo puro para mascota y coleccionables
//
// MÓDULO PURO: Cero dependencias de React, react-native-svg o AsyncStorage.
// ============================================================================

export type LuaAffectState =
  | 'IDLE_SERENE'     // Respiración suave y cola rítmica (reposo/atenta)
  | 'CRAVING_SNACK'   // Deseo lúdico / reforzador positivo
  | 'PURRING_LOVE'    // Reacción a caricia / toque interactivo
  | 'EATING_SNACK'    // Comiendo snack / alimento ganado
  | 'CELEBRATE_AWARD'; // Celebración de hito clínico

export type AccessorySlot = 'head' | 'neck' | 'snack';

export interface CollectibleItem {
  id: string;
  nameKey: string;
  slot: AccessorySlot;
  glyph: string;       // Referencia simbólica
  descriptionKey: string;
  unlockConditionKey: string;
  requiredSessions?: number;
  requiredStreak?: number;
  requiredLevel?: number;
}

export interface LuaInventoryState {
  unlockedItemIds: string[];
  equipped: {
    head?: string;
    neck?: string;
  };
  lastFedTimestamp: number;
  lastFedSnackId?: string;
  totalPatsCount: number;
}

export const COLLECTIBLES_CATALOG: CollectibleItem[] = [
  {
    id: 'snack_fish',
    nameKey: 'snack_fish',
    slot: 'snack',
    glyph: 'fish',
    descriptionKey: 'snack_fish',
    unlockConditionKey: 'snack_fish',
    requiredSessions: 1,
  },
  {
    id: 'neck_red_bow',
    nameKey: 'neck_red_bow',
    slot: 'neck',
    glyph: 'bow',
    descriptionKey: 'neck_red_bow',
    unlockConditionKey: 'neck_red_bow',
    requiredSessions: 3,
  },
  {
    id: 'head_flower',
    nameKey: 'head_flower',
    slot: 'head',
    glyph: 'flower',
    descriptionKey: 'head_flower',
    unlockConditionKey: 'head_flower',
    requiredStreak: 3,
  },
  {
    id: 'neck_bell',
    nameKey: 'neck_bell',
    slot: 'neck',
    glyph: 'bell',
    descriptionKey: 'neck_bell',
    unlockConditionKey: 'neck_bell',
    requiredSessions: 10,
  },
  {
    id: 'head_wizard',
    nameKey: 'head_wizard',
    slot: 'head',
    glyph: 'wizard',
    descriptionKey: 'head_wizard',
    unlockConditionKey: 'head_wizard',
    requiredLevel: 5,
  },
];

export const getCollectibleById = (id: string): CollectibleItem | undefined =>
  COLLECTIBLES_CATALOG.find((c) => c.id === id);

/**
 * Función fábrica que devuelve una copia nueva y no compartida del estado inicial.
 * Evita contaminación por mutación accidental.
 */
export const createDefaultLuaInventory = (): LuaInventoryState => ({
  unlockedItemIds: ['snack_fish'],
  equipped: {
    head: undefined,
    neck: undefined,
  },
  lastFedTimestamp: 0,
  lastFedSnackId: undefined,
  totalPatsCount: 0,
});

/**
 * Constante inmutable congelada para lectura segura.
 */
export const DEFAULT_LUA_INVENTORY: Readonly<LuaInventoryState> = Object.freeze({
  unlockedItemIds: Object.freeze(['snack_fish']) as unknown as string[],
  equipped: Object.freeze({
    head: undefined,
    neck: undefined,
  }),
  lastFedTimestamp: 0,
  lastFedSnackId: undefined,
  totalPatsCount: 0,
});

/**
 * Función pura que calcula qué ítems deben desbloquearse según la progresión.
 * Cero efectos secundarios y cero llamadas a storage.
 */
export const evaluateUnlockedItems = (
  sessions: number,
  streak: number,
  level: number,
  currentUnlockedIds: string[]
): CollectibleItem[] => {
  const newlyUnlocked: CollectibleItem[] = [];

  for (const item of COLLECTIBLES_CATALOG) {
    if (currentUnlockedIds.includes(item.id)) continue;

    let qualifies = false;
    if (item.requiredSessions !== undefined && sessions >= item.requiredSessions) {
      qualifies = true;
    }
    if (item.requiredStreak !== undefined && streak >= item.requiredStreak) {
      qualifies = true;
    }
    if (item.requiredLevel !== undefined && level >= item.requiredLevel) {
      qualifies = true;
    }

    if (qualifies) {
      newlyUnlocked.push(item);
    }
  }

  return newlyUnlocked;
};

// ============================================================================
// Valeria+ · Lúa · Tipos y contratos para mascota dinámica y coleccionables
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
  name: string;
  slot: AccessorySlot;
  glyph: string;       // Icono emoji o referencia
  description: string;
  pixelMap: string[];  // Matriz de caracteres (ej. 24x24 o sub-matriz de accesorio)
  unlockCondition: string;
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
  totalPatsCount: number;
}

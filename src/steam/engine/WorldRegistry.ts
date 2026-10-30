// Registro del motor STEAM (T2-A).
// Indexa manifiestos y actividades por SteamWorldId, SteamArMode y SteamActivityId.
// Cada alta pasa por validator.ts antes de entrar en el índice.
import {
  STEAM_AR_MODES,
  STEAM_WORLD_IDS,
  type SteamActivity,
  type SteamActivityId,
  type SteamArMode,
  type SteamWorldId,
  type WorldManifest,
} from '../types';
import { assertSteamActivity, assertWorldManifest } from '../validator';

export class WorldRegistry {
  private readonly manifests = new Map<SteamWorldId, WorldManifest>();
  private readonly activities = new Map<SteamActivityId, SteamActivity>();
  private readonly byWorld = new Map<SteamWorldId, SteamActivity[]>();
  private readonly byMode = new Map<SteamArMode, SteamActivity[]>();

  constructor() {
    for (const worldId of STEAM_WORLD_IDS) this.byWorld.set(worldId, []);
    for (const mode of STEAM_AR_MODES) this.byMode.set(mode, []);
  }

  registerManifest(manifest: WorldManifest): void {
    assertWorldManifest(manifest);
    if (this.manifests.has(manifest.id)) {
      throw new Error(`El mundo ${manifest.id} ya está en el registro.`);
    }
    this.manifests.set(manifest.id, manifest);
  }

  registerActivity(activity: SteamActivity): void {
    assertSteamActivity(activity);
    if (this.activities.has(activity.id)) {
      throw new Error(`La actividad ${activity.id} ya está en el registro.`);
    }
    this.activities.set(activity.id, activity);
    this.bucket(this.byWorld, activity.worldId).push(activity);
    this.bucket(this.byMode, activity.mode).push(activity);
  }

  manifestByWorld(worldId: SteamWorldId): WorldManifest | undefined {
    return this.manifests.get(worldId);
  }

  activityById(activityId: SteamActivityId): SteamActivity | undefined {
    return this.activities.get(activityId);
  }

  /**
   * Las tres claves a la vez. Si el id no pertenece a ese mundo y modalidad,
   * no hay actividad: el índice no mezcla catálogos.
   */
  activityAt(
    worldId: SteamWorldId,
    mode: SteamArMode,
    activityId: SteamActivityId,
  ): SteamActivity | undefined {
    const activity = this.activities.get(activityId);
    if (!activity || activity.worldId !== worldId || activity.mode !== mode) return undefined;
    return activity;
  }

  activitiesByWorld(worldId: SteamWorldId): readonly SteamActivity[] {
    return [...this.bucket(this.byWorld, worldId)];
  }

  activitiesByMode(mode: SteamArMode): readonly SteamActivity[] {
    return [...this.bucket(this.byMode, mode)];
  }

  activitiesByWorldAndMode(worldId: SteamWorldId, mode: SteamArMode): readonly SteamActivity[] {
    return this.bucket(this.byWorld, worldId).filter((activity) => activity.mode === mode);
  }

  private bucket<K>(map: Map<K, SteamActivity[]>, key: K): SteamActivity[] {
    const found = map.get(key);
    if (found) return found;
    const created: SteamActivity[] = [];
    map.set(key, created);
    return created;
  }
}

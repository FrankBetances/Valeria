// Barril de las 28 actividades (T3-C).
// Registra luaSolo y los sets S0–S6 y S8–S11 por las rutas del plan,
// aunque esos módulos los escriba otro agente.
//
// Cada ficha exporta `manifest` y `activities`. También vale `luaSolo`
// (array o { manifest, activities }) o la pareja `setSolo` + `setWithLua`.
import type { SteamActivity, WorldManifest } from '../types';
import { WorldRegistry } from '../engine/WorldRegistry';
import * as luaSolo from './luaSolo';
import * as s0Kit from './s0_kit';
import * as s1Camino from './s1_camino';
import * as s2Sonido from './s2_sonido';
import * as s3Rampas from './s3_rampas';
import * as s4Soplo from './s4_soplo';
import * as s5Puente from './s5_puente';
import * as s6Jardin from './s6_jardin';
import * as s8Policia from './s8_policia';
import * as s9Bomberos from './s9_bomberos';
import * as s10Hospital from './s10_hospital';
import * as s11Trenes from './s11_trenes';

export interface SteamWorldPack {
  readonly file: string;
  readonly manifest: WorldManifest;
  readonly activities: readonly SteamActivity[];
}

const WORLD_MODULES: readonly (readonly [string, object])[] = [
  ['luaSolo.ts', luaSolo],
  ['s0_kit.ts', s0Kit],
  ['s1_camino.ts', s1Camino],
  ['s2_sonido.ts', s2Sonido],
  ['s3_rampas.ts', s3Rampas],
  ['s4_soplo.ts', s4Soplo],
  ['s5_puente.ts', s5Puente],
  ['s6_jardin.ts', s6Jardin],
  ['s8_policia.ts', s8Policia],
  ['s9_bomberos.ts', s9Bomberos],
  ['s10_hospital.ts', s10Hospital],
  ['s11_trenes.ts', s11Trenes],
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isManifest(value: unknown): value is WorldManifest {
  return isRecord(value) && typeof value.id === 'string';
}

function isActivity(value: unknown): value is SteamActivity {
  return isRecord(value) && typeof value.id === 'string' && typeof value.mode === 'string';
}

function isActivityList(value: unknown): value is readonly SteamActivity[] {
  return Array.isArray(value) && value.every(isActivity);
}

function mergeDefault(record: Record<string, unknown>): Record<string, unknown> {
  if (!isRecord(record.default)) return record;
  return { ...record.default, ...record };
}

function pickManifest(record: Record<string, unknown>): WorldManifest | undefined {
  if (isManifest(record.manifest)) return record.manifest;
  if (isRecord(record.luaSolo) && isManifest(record.luaSolo.manifest)) return record.luaSolo.manifest;
  return undefined;
}

function pickActivities(record: Record<string, unknown>): readonly SteamActivity[] | undefined {
  if (isActivityList(record.activities)) return record.activities;
  if (isActivityList(record.luaSolo)) return record.luaSolo;
  if (isRecord(record.luaSolo) && isActivityList(record.luaSolo.activities)) return record.luaSolo.activities;
  const solo = record.setSolo ?? record.solo;
  const withLua = record.setWithLua ?? record.withLua;
  if (isActivity(solo) && isActivity(withLua)) return [solo, withLua];
  return undefined;
}

export function readWorldModule(mod: object, file: string): SteamWorldPack {
  const record = mergeDefault(mod as Record<string, unknown>);
  const manifest = pickManifest(record);
  const activities = pickActivities(record);
  if (!manifest || !activities) {
    throw new Error(
      `${file} tiene que exportar manifest y activities (o luaSolo, o setSolo y setWithLua).`,
    );
  }
  return { file, manifest, activities };
}

/** luaSolo y los once sets, en el orden del catálogo (no hay S7). */
export const STEAM_WORLD_PACKS: readonly SteamWorldPack[] = WORLD_MODULES.map(([file, mod]) =>
  readWorldModule(mod, file),
);

export const STEAM_MANIFESTS: readonly WorldManifest[] = STEAM_WORLD_PACKS.map((pack) => pack.manifest);

export const STEAM_ACTIVITIES: readonly SteamActivity[] = STEAM_WORLD_PACKS.flatMap((pack) => pack.activities);

export function createSteamWorldRegistry(): WorldRegistry {
  const registry = new WorldRegistry();
  for (const pack of STEAM_WORLD_PACKS) {
    registry.registerManifest(pack.manifest);
    for (const activity of pack.activities) registry.registerActivity(activity);
  }
  return registry;
}

export const steamWorldRegistry = createSteamWorldRegistry();

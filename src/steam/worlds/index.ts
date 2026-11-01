// Los siete mundos en el orden canónico del plan (§4): S0, S1, S5, S3, S6, S2, S4.
import { STEAM_WORLD_ORDER, type SteamWorldId, type WorldChallengeSpec, type WorldManifest } from '../types';
import { MANIFEST as S0 } from './s0_kit';
import { MANIFEST as S1 } from './s1_camino';
import { MANIFEST as S2 } from './s2_sonido';
import { MANIFEST as S3 } from './s3_rampas';
import { MANIFEST as S4 } from './s4_soplo';
import { MANIFEST as S5 } from './s5_puente';
import { MANIFEST as S6 } from './s6_jardin';

const BY_ID: Record<SteamWorldId, WorldManifest> = { S0, S1, S2, S3, S4, S5, S6 };

export const STEAM_WORLDS: readonly WorldManifest[] = STEAM_WORLD_ORDER.map((id) => BY_ID[id]);

export function steamWorld(id: SteamWorldId): WorldManifest {
  return BY_ID[id];
}

export function steamChallenge(worldId: SteamWorldId, challengeId: string): WorldChallengeSpec | undefined {
  return BY_ID[worldId].challenges.find((c) => c.id === challengeId);
}

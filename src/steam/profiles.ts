// Capa 3 del plan (§1): perfiles de adaptación. Los elige la persona adulta a
// mano, con PIN. La app nunca deduce un perfil ni lo importa de otra app:
// solo ajusta cómo se presentan los mundos y cuáles se recomiendan primero.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../valeriaTheme';
import type { AdaptationProfileId, SteamWorldId } from './types';

export const ADAPTATION_PROFILES: readonly AdaptationProfileId[] = ['hearing_ic', 'autism_tea', 'dyslexia', 'speech_motricity'];

export interface ProfileAdjustments {
  /** Mundos que se recomiendan primero (plan §3). */
  readonly recommendedWorlds: readonly SteamWorldId[];
  /** El microcuento de anticipación va antes del ciclo, abierto. */
  readonly anticipationFirst: boolean;
  /** Ni luz ni vibración de Lúa en ningún evento: cero sorpresas. */
  readonly calmReactions: boolean;
  /** Ofrecer el Test de Ling antes del reto. */
  readonly lingFirst: boolean;
}

const NONE: ProfileAdjustments = { recommendedWorlds: [], anticipationFirst: false, calmReactions: false, lingFirst: false };

const ADJUSTMENTS: Record<AdaptationProfileId, ProfileAdjustments> = {
  hearing_ic: { recommendedWorlds: ['S2', 'S1'], anticipationFirst: false, calmReactions: false, lingFirst: true },
  autism_tea: { recommendedWorlds: ['S1', 'S3'], anticipationFirst: true, calmReactions: true, lingFirst: false },
  dyslexia: { recommendedWorlds: ['S2', 'S1'], anticipationFirst: false, calmReactions: false, lingFirst: false },
  speech_motricity: { recommendedWorlds: ['S4', 'S2'], anticipationFirst: false, calmReactions: false, lingFirst: false },
};

export function adjustmentsFor(profile: AdaptationProfileId | null): ProfileAdjustments {
  return profile ? ADJUSTMENTS[profile] : NONE;
}

function isProfile(value: string | null): value is AdaptationProfileId {
  return value !== null && (ADAPTATION_PROFILES as readonly string[]).includes(value);
}

export async function loadAdaptationProfile(): Promise<AdaptationProfileId | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.steamPerfil);
    return isProfile(raw) ? raw : null;
  } catch {
    return null;
  }
}

export async function saveAdaptationProfile(profile: AdaptationProfileId | null): Promise<void> {
  try {
    if (profile) await AsyncStorage.setItem(STORAGE_KEYS.steamPerfil, profile);
    else await AsyncStorage.removeItem(STORAGE_KEYS.steamPerfil);
  } catch {
    // Sin almacenamiento, el perfil vale solo para esta sesión.
  }
}

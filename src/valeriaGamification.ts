// ============================================================================
// Valeria+ · Gamificación (V4.0)
// Sistema de motivación estilo Duolingo, 100% local-first (AsyncStorage):
//   · XP por sesión completada (con bonus por precisión y por racha).
//   · Racha diaria (🔥): días consecutivos con al menos una sesión.
//   · Niveles con nombre propio (Osezno → Oso Legendario).
//   · Logros / insignias desbloqueables.
//
// Uso desde el Player al terminar una sesión:
//   const premio = await registerSession(avg, numEjercicios);
//   // premio.xpGained, premio.streak, premio.newBadges, premio.levelUp…
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './valeriaTheme';

export interface GameState {
  xp: number;
  streak: number;        // racha actual (días consecutivos)
  bestStreak: number;    // mejor racha histórica
  lastDay: string;       // último día con sesión (YYYY-MM-DD)
  sessions: number;      // sesiones completadas en total
  perfects: number;      // sesiones con todo 3★
  badges: string[];      // ids de logros desbloqueados
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
}

export interface SessionReward {
  xpGained: number;
  xpTotal: number;
  streak: number;
  streakExtended: boolean;  // hoy ha sumado un día nuevo a la racha
  level: number;
  levelUp: boolean;
  levelName: string;
  newBadges: Badge[];
  perfect: boolean;
}

export const BADGES: Badge[] = [
  { id: 'primera',  icon: '🌱', name: 'Primer paso',       desc: 'Completa tu primera sesión.' },
  { id: 'racha3',   icon: '🔥', name: 'En llamas',         desc: '3 días seguidos practicando.' },
  { id: 'racha7',   icon: '⚡', name: 'Semana perfecta',   desc: '7 días seguidos practicando.' },
  { id: 'racha14',  icon: '🏆', name: 'Imparable',         desc: '14 días seguidos practicando.' },
  { id: 'ses10',    icon: '🎓', name: 'Practicante',       desc: 'Completa 10 sesiones.' },
  { id: 'ses25',    icon: '🚀', name: 'Explorador',        desc: 'Completa 25 sesiones.' },
  { id: 'ses50',    icon: '💎', name: 'Maestro Valeria',   desc: 'Completa 50 sesiones.' },
  { id: 'perfecta', icon: '⭐', name: 'Sesión estrella',   desc: 'Logra 3★ en todos los ejercicios de una sesión.' },
  { id: 'perf5',    icon: '🌟', name: 'Constelación',      desc: 'Logra 5 sesiones perfectas.' },
];

// Nombres de nivel con la mascota osita de Valeria como hilo conductor.
const LEVEL_NAMES = ['Osezno', 'Oso Curioso', 'Oso Valiente', 'Oso Explorador', 'Oso Sabio', 'Gran Oso', 'Oso Legendario'];
const XP_PER_LEVEL = 100;

export const levelFor = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;
export const levelName = (level: number): string => LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
export const levelProgress = (xp: number): number => (xp % XP_PER_LEVEL) / XP_PER_LEVEL; // 0..1 hacia el siguiente nivel
export const xpToNext = (xp: number): number => XP_PER_LEVEL - (xp % XP_PER_LEVEL);

const EMPTY: GameState = { xp: 0, streak: 0, bestStreak: 0, lastDay: '', sessions: 0, perfects: 0, badges: [] };

const dayKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const loadGame = async (): Promise<GameState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.juego);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch (e) { /* almacenamiento no disponible */ }
  return { ...EMPTY };
};

// Racha "viva": si el último día registrado no es ni hoy ni ayer, la racha visible es 0.
export const liveStreak = (g: GameState): number => {
  if (!g.lastDay) return 0;
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  return g.lastDay === today || g.lastDay === yesterday ? g.streak : 0;
};

export const registerSession = async (avg: number, exercises: number): Promise<SessionReward> => {
  const g = await loadGame();
  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - 86400000));

  // --- Racha diaria ---
  const streakExtended = g.lastDay !== today;
  if (g.lastDay === today) {
    // ya practicó hoy: la racha no cambia
  } else if (g.lastDay === yesterday) {
    g.streak += 1;
  } else {
    g.streak = 1;
  }
  g.lastDay = today;
  g.bestStreak = Math.max(g.bestStreak, g.streak);

  // --- XP ---
  const perfect = avg >= 2.95;
  const base = 20 + exercises * 5;
  const precision = Math.round(avg * 10);              // hasta +30 por precisión
  const streakBonus = Math.min(g.streak, 7) * 2;       // hasta +14 por racha
  const perfectBonus = perfect ? 15 : 0;
  const xpGained = base + precision + streakBonus + perfectBonus;

  const prevLevel = levelFor(g.xp);
  g.xp += xpGained;
  g.sessions += 1;
  if (perfect) g.perfects += 1;
  const level = levelFor(g.xp);

  // --- Logros ---
  const unlocked = (id: string) => g.badges.includes(id);
  const newBadges: Badge[] = [];
  const tryUnlock = (id: string, cond: boolean) => {
    if (cond && !unlocked(id)) {
      g.badges.push(id);
      const b = BADGES.find((x) => x.id === id);
      if (b) newBadges.push(b);
    }
  };
  tryUnlock('primera', g.sessions >= 1);
  tryUnlock('racha3', g.streak >= 3);
  tryUnlock('racha7', g.streak >= 7);
  tryUnlock('racha14', g.streak >= 14);
  tryUnlock('ses10', g.sessions >= 10);
  tryUnlock('ses25', g.sessions >= 25);
  tryUnlock('ses50', g.sessions >= 50);
  tryUnlock('perfecta', perfect);
  tryUnlock('perf5', g.perfects >= 5);

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.juego, JSON.stringify(g));
  } catch (e) { /* almacenamiento no disponible */ }

  return {
    xpGained,
    xpTotal: g.xp,
    streak: g.streak,
    streakExtended,
    level,
    levelUp: level > prevLevel,
    levelName: levelName(level),
    newBadges,
    perfect,
  };
};

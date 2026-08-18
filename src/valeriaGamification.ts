// ============================================================================
// Valeria+ · Gamificación (V5.0 · Lúa)
// Motivación local-first (AsyncStorage), sin servidor y sin cuenta:
//   · XP por sesión completada (con bonus por precisión y por racha).
//   · Racha diaria: días consecutivos con al menos una sesión.
//   · Niveles con nombre propio, ahora con la gata Lúa como hilo (12 niveles).
//   · 18 insignias organizadas en familias con rango (ver ValeriaPixelAwards).
//
// Uso desde el Player al terminar una sesión:
//   const premio = await registerSession(avg, numEjercicios);
//
// ── Qué NO se ha tocado, y por qué ─────────────────────────────────────────
// XP_PER_LEVEL sigue en 100. Es tentador meter una curva creciente al ampliar
// de 7 a 12 niveles, pero eso BAJA de nivel a quien ya está jugando: un niño
// que ayer era nivel 6 abriría la app siendo nivel 4. Una recompensa que se
// quita no es una mejora. Los niveles nuevos se añaden por arriba.
//
// Los ids de insignia son inmutables: viajan en AsyncStorage. Se pueden añadir
// (las nuevas se desbloquean solas en la siguiente sesión si el contador ya da,
// que es un regalo, no un error) pero jamás renombrar.
//
// La COPIA (nombre y descripción de cada insignia) vive en el catálogo i18n,
// no aquí: este módulo define qué se gana y cuándo, no en qué idioma se lee.
// ============================================================================
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './valeriaTheme';
// Solo tipos: no arrastra React ni react-native-svg a este módulo.
import type { AwardGlyph, AwardTier } from './ValeriaPixelAwards';

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
  glyph: AwardGlyph;
  tier: AwardTier;
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
  game: GameState;
}

// Catálogo de insignias. Tres familias con rango + seis de ocasión.
// El ORDEN es el de la colección en pantalla: se lee como una progresión.
export const BADGES: Badge[] = [
  // Familia · huella (constancia acumulada)
  { id: 'primera', glyph: 'paw', tier: 'bronze' },
  { id: 'ses10', glyph: 'paw', tier: 'silver' },
  { id: 'ses25', glyph: 'paw', tier: 'gold' },
  { id: 'ses50', glyph: 'paw', tier: 'teal' },
  { id: 'ses100', glyph: 'paw', tier: 'violet' },
  // Familia · llama (racha)
  { id: 'racha3', glyph: 'flame', tier: 'bronze' },
  { id: 'racha7', glyph: 'flame', tier: 'silver' },
  { id: 'racha14', glyph: 'flame', tier: 'gold' },
  { id: 'racha30', glyph: 'flame', tier: 'teal' },
  // Familia · estrella (precisión)
  { id: 'perfecta', glyph: 'star', tier: 'bronze' },
  { id: 'perf5', glyph: 'star', tier: 'gold' },
  { id: 'perf10', glyph: 'star', tier: 'violet' },
  // De ocasión
  { id: 'madrugadora', glyph: 'sunrise', tier: 'gold' },
  { id: 'nocturna', glyph: 'moon', tier: 'silver' },
  { id: 'finde', glyph: 'home', tier: 'teal' },
  { id: 'maraton', glyph: 'yarn', tier: 'gold' },
  { id: 'regreso', glyph: 'heart', tier: 'teal' },
  { id: 'nivel10', glyph: 'crown', tier: 'violet' },
];

export const badgeById = (id: string): Badge | undefined => BADGES.find((b) => b.id === id);

// Nombres de nivel con la gata Lúa como hilo conductor. El catálogo i18n tiene
// la misma lista traducida (hub.levelNameByIndex); esta copia es la que viaja
// en SessionReward para quien no tenga el catálogo a mano.
const LEVEL_NAMES = [
  'Gatita', 'Gata Curiosa', 'Gata Juguetona', 'Gata Valiente',
  'Gata Exploradora', 'Gata Saltarina', 'Gata Sabia', 'Gata Sigilosa',
  'Gata Estrella', 'Gran Gata', 'Gata Lunar', 'Gata Legendaria',
];
const XP_PER_LEVEL = 100;

/** Cuántos niveles con nombre hay. Lo usa la colección para pintar la escalera. */
export const LEVEL_COUNT = LEVEL_NAMES.length;

export const levelFor = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;
export const levelName = (level: number): string => LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
export const levelProgress = (xp: number): number => (xp % XP_PER_LEVEL) / XP_PER_LEVEL; // 0..1 hacia el siguiente nivel
export const xpToNext = (xp: number): number => XP_PER_LEVEL - (xp % XP_PER_LEVEL);
/** XP total con el que empieza un nivel. La colección lo usa para la escalera. */
export const xpForLevel = (level: number): number => (level - 1) * XP_PER_LEVEL;

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

/** Días transcurridos entre dos claves YYYY-MM-DD. 0 si alguna falta. */
const daysBetween = (from: string, to: string): number => {
  if (!from || !to) return 0;
  const a = Date.parse(`${from}T00:00:00`);
  const b = Date.parse(`${to}T00:00:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86400000);
};

export const registerSession = async (avg: number, exercises: number): Promise<SessionReward> => {
  const g = await loadGame();
  const now = new Date();
  const today = dayKey(now);
  const yesterday = dayKey(new Date(Date.now() - 86400000));
  // Hueco desde la última sesión, ANTES de pisar lastDay: es lo que distingue
  // "vuelve tras una pausa" de "practica todos los días".
  const gapDays = daysBetween(g.lastDay, today);

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
  const newBadges: Badge[] = [];
  const tryUnlock = (id: string, cond: boolean) => {
    if (!cond || g.badges.includes(id)) return;
    g.badges.push(id);
    const b = badgeById(id);
    if (b) newBadges.push(b);
  };

  const hour = now.getHours();
  const weekday = now.getDay(); // 0 domingo, 6 sábado

  tryUnlock('primera', g.sessions >= 1);
  tryUnlock('ses10', g.sessions >= 10);
  tryUnlock('ses25', g.sessions >= 25);
  tryUnlock('ses50', g.sessions >= 50);
  tryUnlock('ses100', g.sessions >= 100);
  tryUnlock('racha3', g.streak >= 3);
  tryUnlock('racha7', g.streak >= 7);
  tryUnlock('racha14', g.streak >= 14);
  tryUnlock('racha30', g.streak >= 30);
  tryUnlock('perfecta', perfect);
  tryUnlock('perf5', g.perfects >= 5);
  tryUnlock('perf10', g.perfects >= 10);
  tryUnlock('madrugadora', hour < 10);
  tryUnlock('nocturna', hour >= 20);
  tryUnlock('finde', weekday === 0 || weekday === 6);
  tryUnlock('maraton', exercises >= 6);
  // "Te echaba de menos": premia volver, nunca castiga haberse ido. Solo cuenta
  // si ya había historia previa (gapDays sale de un lastDay real).
  tryUnlock('regreso', gapDays >= 7);
  tryUnlock('nivel10', level >= 10);

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
    game: { ...g },
  };
};

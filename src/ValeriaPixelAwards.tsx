// ============================================================================
// Valeria+ · Insignias en píxel art
//
// Sustituye a los emoji que hacían de insignia (🌱 🔥 ⚡ 🏆 🎓 🚀 💎 ⭐ 🌟).
// Nueve emoji del sistema no forman un set: los dibuja el fabricante del
// teléfono y cambian de estilo entre aparatos (regla 5). Estos son rejilla de
// 12, mismo lenguaje que la gata.
//
// El set se organiza por FAMILIA y RANGO, no por dibujos sueltos:
//   · familia = qué hiciste  (llama = racha, huella = sesiones, estrella = pleno)
//   · rango   = cuánto       (bronce → plata → oro → turquesa → violeta)
//
// Así 18 insignias se leen con 9 dibujos, y una insignia nueva de una familia
// ya existente no necesita dibujo nuevo: necesita un rango. Es lo que hace que
// la colección parezca una colección y no una bolsa de pegatinas.
// ============================================================================
import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';

export type AwardGlyph =
  | 'flame' | 'paw' | 'star' | 'sunrise' | 'moon' | 'home' | 'yarn' | 'heart' | 'crown';

/** Rango de la insignia. El orden es el de valor creciente. */
export type AwardTier = 'bronze' | 'silver' | 'gold' | 'teal' | 'violet';

// `.` transparente · `a` color del rango · `b` realce claro
const GLYPHS: Record<AwardGlyph, string[]> = {
  // Racha · llama. La punta de UN píxel es lo que la hace legible a 22 px: la
  // primera versión salía por arriba con dos píxeles y a tamaño de tira se leía
  // como un montículo marrón, no como fuego.
  flame: [
    '.....a......',
    '....aa......',
    '....aaa.....',
    '...aaaaa....',
    '...aaaaaa...',
    '..aaaaaaaa..',
    '..aaabbaaa..',
    '.aaabbbbaaa.',
    '.aabbbbbbaa.',
    '.aabbbbbbaa.',
    '..aaabbaaa..',
    '...aaaaaa...',
  ],
  // Sesiones · huella de gata. Tres dedos separados por DOS píxeles sobre una
  // almohadilla ovalada. Las dos versiones anteriores fallaron por lo mismo,
  // densidad: con cuatro dedos y un píxel de hueco, a 30 px los dedos se funden
  // en una barra y la huella se lee como una manopla.
  paw: [
    '............',
    '.aa..aa..aa.',
    '.aa..aa..aa.',
    '............',
    '...aaaaaa...',
    '..aaaaaaaa..',
    '.aaaaaaaaaa.',
    '.aaaaaaaaaa.',
    '..aaaaaaaa..',
    '...aaaaaa...',
    '............',
    '............',
  ],
  // Sesión perfecta · estrella
  star: [
    '.....aa.....',
    '....aaaa....',
    '....abba....',
    'aaaaabbaaaaa',
    '.aaaabbaaaa.',
    '..aaabbaaa..',
    '...aaaaaa...',
    '..aaaaaaaa..',
    '..aaa..aaa..',
    '.aaa....aaa.',
    '.aa......aa.',
    '............',
  ],
  // Sesión temprana · sol saliendo
  sunrise: [
    '............',
    '....b..b....',
    '.b...aa...b.',
    '..b.aaaa.b..',
    '....aaaa....',
    '...aaaaaa...',
    '.b.aaaaaa.b.',
    '...aaaaaa...',
    '.aaaaaaaaaa.',
    '............',
    '..bbbbbbbb..',
    '............',
  ],
  // Sesión de noche · luna con estrella
  moon: [
    '....aaaa....',
    '..aaaa......',
    '.aaa........',
    '.aaa.....b..',
    'aaa.....bbb.',
    'aaa......b..',
    'aaa.........',
    '.aaa........',
    '.aaa........',
    '..aaaa......',
    '....aaaa....',
    '............',
  ],
  // Fin de semana · casa
  home: [
    '.....aa.....',
    '....aaaa....',
    '...aaaaaa...',
    '..aaaaaaaa..',
    '.aaaaaaaaaa.',
    'aaaaaaaaaaaa',
    '..aaaaaaaa..',
    '..aa.bb.aa..',
    '..aa.bb.aa..',
    '..aa.bb.aa..',
    '..aaaaaaaa..',
    '............',
  ],
  // Sesión larga · ovillo
  yarn: [
    '............',
    '...aaaaaa...',
    '..aaaaaaaa..',
    '.aabaabaaba.',
    '.abaabaabaa.',
    'aabaabaabaaa',
    'abaabaabaaba',
    '.aabaabaaba.',
    '..aaaaaaaa..',
    '...aaaaaa...',
    '.......bb...',
    '........bb..',
  ],
  // Regreso tras una pausa · corazón
  heart: [
    '............',
    '..aa....aa..',
    '.aaaa..aaaa.',
    'aaaaaaaaaaaa',
    'aaaabbaaaaaa',
    'aaaabbaaaaaa',
    '.aaaaaaaaaa.',
    '..aaaaaaaa..',
    '...aaaaaa...',
    '....aaaa....',
    '.....aa.....',
    '............',
  ],
  // Nivel alto · corona. Tres puntas, no tres torres: con los remates planos
  // de la primera versión leía como la almena de un castillo.
  crown: [
    '............',
    '..a..aa..a..',
    '.aa.aaaa.aa.',
    '.aaaaaaaaaa.',
    '.aaaaaaaaaa.',
    '.aabaabaaba.',
    '.aaaaaaaaaa.',
    '.aaaaaaaaaa.',
    '..aaaaaaaa..',
    '............',
    '............',
    '............',
  ],
};

interface TierPalette { a: string; b: string; bg: string; }

export const TIERS: Record<AwardTier, TierPalette> = {
  bronze: { a: '#c07a3e', b: '#e8b183', bg: '#fbf0e6' },
  silver: { a: '#8a97a8', b: '#cdd6e0', bg: '#f1f4f7' },
  gold: { a: '#d9a520', b: '#f5d979', bg: '#fdf6e0' },
  teal: { a: '#00a39e', b: '#7fe3df', bg: '#e6f9f8' },
  violet: { a: '#7c4fd0', b: '#c0a6ee', bg: '#f3edfd' },
};

// Insignia sin conseguir: se ve la forma, no el premio.
const LOCKED: TierPalette = { a: '#c8d0d0', b: '#e2e8e8', bg: '#f4f7f7' };

// Núcleo fijo para los glifos donde el realce NO es un brillo del metal sino
// parte del dibujo: el corazón de una llama es amarillo aunque la insignia sea
// de bronce, y el sol de la madrugada también. Sin esto, una llama de bronce es
// marrón sobre marrón y deja de leerse.
const GLYPH_CORE: Partial<Record<AwardGlyph, string>> = {
  flame: '#ffd166',
  sunrise: '#ffd166',
};

interface Run { x: number; y: number; w: number; fill: string; }

const mergeRuns = (map: string[], pal: TierPalette): Run[] => {
  const runs: Run[] = [];
  map.forEach((row, y) => {
    let start = -1;
    let key = '';
    for (let x = 0; x <= row.length; x++) {
      const c = x < row.length ? row[x] : '.';
      if (c !== key) {
        if ((key === 'a' || key === 'b') && start >= 0) {
          runs.push({ x: start, y, w: x - start, fill: key === 'a' ? pal.a : pal.b });
        }
        key = c;
        start = x;
      }
    }
  });
  return runs;
};

interface Props {
  glyph: AwardGlyph;
  tier: AwardTier;
  size?: number;
  /** Sin conseguir: se pinta en gris. */
  locked?: boolean;
}

export const PixelAward: React.FC<Props> = ({ glyph, tier, size = 34, locked }) => {
  const core = GLYPH_CORE[glyph];
  const pal = locked ? LOCKED : (core ? { ...TIERS[tier], b: core } : TIERS[tier]);
  const map = GLYPHS[glyph];
  const runs = useMemo(() => mergeRuns(map, pal), [map, pal]);
  // Lado del píxel entero, por el mismo motivo que en la gata (ValeriaCatPixel):
  // con un lado fraccionario el antialias mete costuras entre filas.
  const cell = Math.max(1, Math.round(size / 12));
  return (
    <Svg width={cell * 12} height={cell * 12} viewBox="0 0 12 12">
      {runs.map((r) => (
        <Rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
      ))}
    </Svg>
  );
};

/**
 * El metal de la llama sube con la racha: el premio se ve venir antes de
 * ganarlo. Vive aquí y no en la tira porque lo usan las dos pantallas que
 * pintan una racha (hub/lista y cierre de sesión), y una racha de 14 días no
 * puede salir dorada en una y de bronce en la otra.
 */
export const streakTier = (streak: number): AwardTier =>
  (streak >= 30 ? 'teal' : streak >= 14 ? 'gold' : streak >= 7 ? 'silver' : 'bronze');

/** Fondo de la placa que enmarca la insignia (lo usa la colección y el player). */
export const tierBg = (tier: AwardTier, locked?: boolean): string =>
  (locked ? LOCKED.bg : TIERS[tier].bg);

export default PixelAward;

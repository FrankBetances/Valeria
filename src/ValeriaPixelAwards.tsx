// ============================================================================
// Valeria+ · Insignias en píxel art
//
// Sustituye a los emoji que hacían de insignia (🌱 🔥 ⚡ 🏆 🎓 🚀 💎 ⭐ 🌟).
// Nueve emoji del sistema no forman un set: los dibuja el fabricante del
// teléfono y cambian de estilo entre aparatos (regla 5).
//
// El set se organiza por FAMILIA y RANGO, no por dibujos sueltos:
//   · familia = qué hiciste  (llama = racha, huella = sesiones, estrella = pleno)
//   · rango   = cuánto       (bronce → plata → oro → turquesa → violeta)
//
// Así 18 insignias se leen con 9 dibujos, y una insignia nueva de una familia
// ya existente no necesita dibujo nuevo: necesita un rango.
//
// ---------------------------------------------------------------------------
// V2 · EL DIBUJO ES EL DEL APARATO (D-J · 14/8/2026)
//
// Los nueve glifos ya no se dibujan aquí. Son las mismas matrices de 24×24 que
// enseña Lúa en su panel, y viven en `ValeriaPixelArt.ts`. Antes eran rejillas
// de 12×12 propias de este fichero, así que la misma insignia se veía de dos
// formas según se mirase la tableta o la mascota.
//
// Dos cosas cambiaron con el dibujo, y las dos se ven:
//   · **el detalle sube**, de 12×12 a 24×24 con contorno y sombra propios;
//   · **el fondo del rango pasa a ser oscuro.** Es lo que hace que el metal se
//     lea —una llama de bronce sobre crema es marrón sobre beige— y es el fondo
//     que ya tenía el aparato. Al adoptarlo, la placa de la insignia en la app
//     deja de ser clara.
//
// Lo que NO cambió: los nueve nombres de familia, los cinco de rango y su
// ORDEN. Ese orden es el índice que viaja en AWARD(glifo + rango<<8), así que
// no se reordena nunca.
// ============================================================================
import React, { useMemo } from 'react';
import Svg, { Circle, Rect } from 'react-native-svg';

import {
  AWARD_GLYPHS,
  PIXEL_GLYPH_CORE,
  PIXEL_PALETTE,
  PIXEL_SIDE,
  PIXEL_TIERS,
  type PixelAwardGlyph,
  type PixelAwardTier,
} from './ValeriaPixelArt';

export type AwardGlyph = PixelAwardGlyph;

/** Rango de la insignia. El orden es el de valor creciente. */
export type AwardTier = PixelAwardTier;

interface TierPalette { a: string; b: string; bg: string; }

/** Sin conseguir: se ve la forma, no el premio. */
const LOCKED: TierPalette = { a: '#5a6068', b: '#7d858f', bg: '#191c20' };

/**
 * Funde las celdas contiguas del mismo color en un solo rectángulo.
 *
 * El reparto de colores es **el mismo que hace el firmware** en `drawAward`, y
 * conviene no tocarlo sin mirar allí:
 *   · `a` → el tono del rango;
 *   · `b` → el núcleo del glifo si lo tiene, y si no el realce del rango. El
 *     núcleo SUSTITUYE a `b`, no le hace de reserva: el corazón de una llama es
 *     naranja aunque la insignia sea de plata;
 *   · el resto → la paleta fija de 21 colores.
 */
const mergeRuns = (
  map: readonly string[],
  pal: TierPalette,
  core: string | undefined,
  locked: boolean,
): { x: number; y: number; w: number; fill: string }[] => {
  const runs: { x: number; y: number; w: number; fill: string }[] = [];
  const b = core ?? pal.b;
  const colorOf = (c: string): string | undefined => {
    if (c === '.' || c === ' ') return undefined;
    // Bloqueada: dos grises y la silueta. Se ve la forma, no el premio.
    if (locked) return c === 'b' || c === 'w' ? pal.b : pal.a;
    if (c === 'a') return pal.a;
    if (c === 'b') return b;
    return PIXEL_PALETTE[c];
  };
  map.forEach((row, y) => {
    let start = -1;
    let fill: string | undefined;
    for (let x = 0; x <= row.length; x++) {
      const c = x < row.length ? row[x] : '.';
      const here = colorOf(c);
      if (here !== fill) {
        if (fill && start >= 0) runs.push({ x: start, y, w: x - start, fill });
        fill = here;
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

/**
 * La insignia trae **su propio fondo redondo y su anillo**, como en el panel de
 * Lúa. No es decoración: es lo que hace legible el rango.
 *
 * De los nueve glifos, solo `yarn` y `sunrise` usan celdas `a`/`b`, así que los
 * otros siete se pintan con la paleta fija y **salen idénticos en los cinco
 * rangos**. En el aparato eso da igual, porque el rango tiñe el panel entero.
 * En la app, cuatro de las seis pantallas que pintan una insignia lo hacen sin
 * placa detrás —la tira de racha, el dashboard, el player y el lanzador de RA—,
 * y ahí una racha de 7 días y una de 30 se verían EXACTAMENTE iguales.
 *
 * Que el metal suba con la racha es el motivo por el que `streakTier` existe.
 * Metiendo el fondo y el anillo dentro del componente, el rango se lee en los
 * seis sitios y además la insignia es el mismo objeto en la tableta y en el
 * cristal.
 */
export const PixelAward: React.FC<Props> = ({ glyph, tier, size = 34, locked }) => {
  const pal = locked ? LOCKED : PIXEL_TIERS[tier];
  const core = locked ? undefined : PIXEL_GLYPH_CORE[glyph];
  const map = AWARD_GLYPHS[glyph];
  const runs = useMemo(
    () => mergeRuns(map, pal, core, !!locked),
    [map, pal, core, locked],
  );
  // El aparato dibuja el glifo a 72 px de los 240 y el anillo a radio 54, o sea
  // 18 celdas contando el lado de celda de 3 px. Aquí se reproduce en unidades
  // de celda para que la proporción sea la misma a cualquier tamaño.
  const C = PIXEL_SIDE / 2;
  return (
    <Svg width={size} height={size} viewBox={`-6 -6 ${PIXEL_SIDE + 12} ${PIXEL_SIDE + 12}`}>
      <Circle cx={C} cy={C} r={18} fill={pal.bg} />
      <Circle cx={C} cy={C} r={17.5} stroke={pal.a} strokeWidth={1} fill="none" />
      <Circle cx={C} cy={C} r={16.9} stroke={core ?? pal.b} strokeWidth={0.35} fill="none" />
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
  (locked ? LOCKED.bg : PIXEL_TIERS[tier].bg);

export default PixelAward;

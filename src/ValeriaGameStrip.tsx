// ============================================================================
// Valeria+ · Tira de juego (nivel, racha y acceso a los premios)
//
// Sustituye a la tira de dos cifras del hub v11, que tenía tres problemas:
//   · Era gris sobre gris: el dato más motivador de la app pintado con el color
//     que el resto de la interfaz usa para lo secundario.
//   · No llevaba a ninguna parte. Enseñaba «nivel 4» y ahí moría; la colección
//     de insignias vivía detrás del PIN, en Resultados, donde el niño no entra.
//   · No decía cuánto falta. Un nivel sin barra de progreso es una etiqueta,
//     no una meta.
//
// Ahora es una sola pieza pulsable: la gata, el nivel con su barra al
// siguiente, la racha con el metal que le corresponde, y la puerta a los
// premios. Se reutiliza tal cual en las demás pantallas de ejercicios.
// ============================================================================
import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { V } from './valeriaTheme';
import { CatPixel } from './ValeriaCatPixel';
import { PixelAward, AwardTier } from './ValeriaPixelAwards';
import { GameState, levelFor, levelProgress, xpToNext, liveStreak, LEVEL_COUNT } from './valeriaGamification';
import { useT } from './i18n';

/** El metal de la llama sube con la racha: el premio se ve venir antes de ganarlo. */
const streakTier = (streak: number): AwardTier =>
  (streak >= 30 ? 'teal' : streak >= 14 ? 'gold' : streak >= 7 ? 'silver' : 'bronze');

interface Props {
  game: GameState | null;
  onPress: () => void;
}

export const ValeriaGameStrip: React.FC<Props> = ({ game, onPress }) => {
  const t = useT();
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 6 }).start();

  const xp = game?.xp ?? 0;
  const level = levelFor(xp);
  const atMax = level >= LEVEL_COUNT;
  const streak = game ? liveStreak(game) : 0;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => spring(0.98)}
      onPressOut={() => spring(1)}
      accessibilityRole="button"
      accessibilityLabel={t.awards.a11yOpen}
    >
      <Animated.View style={[s.strip, { transform: [{ scale }] }]}>
        <View style={s.catPlate}><CatPixel size={52} pose="sit" /></View>

        <View style={s.middle}>
          <Text style={s.level} numberOfLines={1}>
            {t.awards.levelLine(level, t.hub.levelNameByIndex(level - 1))}
          </Text>
          <View style={s.track}>
            <View style={[s.fill, { width: `${Math.round((atMax ? 1 : levelProgress(xp)) * 100)}%` }]} />
          </View>
          <Text style={s.toNext} numberOfLines={1}>
            {atMax ? t.awards.maxLevel : t.awards.xpToNext(xpToNext(xp))}
          </Text>
        </View>

        <View style={s.right}>
          <View style={s.flamePlate}>
            <PixelAward glyph="flame" tier={streakTier(streak)} size={22} locked={streak === 0} />
            <Text style={s.streakNum}>{streak}</Text>
          </View>
          <Text style={s.awardsLink}>{`${t.awards.open} ›`}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const s = StyleSheet.create({
  strip: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.md,
    backgroundColor: V.color.card, borderRadius: 24,
    borderWidth: 1, borderColor: V.color.borderActive,
    paddingVertical: 14, paddingHorizontal: 16,
    shadowColor: 'rgba(15, 23, 42, 0.13)', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 4,
  },
  catPlate: {
    width: 62, height: 62, borderRadius: 20, backgroundColor: V.color.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  middle: { flex: 1 },
  level: { fontSize: 15, lineHeight: 19, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  track: { height: 8, borderRadius: 4, backgroundColor: '#e3ecec', marginTop: 7, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: V.color.primary },
  // Texto secundario, no «muted»: sobre blanco, el gris claro de la v11 no
  // llegaba al contraste mínimo y era justo la línea que dice cuánto falta.
  toNext: { fontSize: 11.5, fontWeight: V.font.bold, color: V.color.textSecondary, marginTop: 5 },

  right: { alignItems: 'flex-end', gap: 6 },
  flamePlate: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff3ea', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5,
  },
  streakNum: { fontSize: 17, fontWeight: V.font.extrabold, color: '#c2571e', letterSpacing: -0.3 },
  awardsLink: { fontSize: 12, fontWeight: V.font.extrabold, color: V.color.primaryDark },
});

export default ValeriaGameStrip;

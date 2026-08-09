// ============================================================================
// Valeria+ · La colección de premios de Lúa
//
// Hasta la v11 las 9 insignias solo se pintaban en DOS sitios: un instante al
// acabar la sesión, y el panel de Resultados, que está detrás del PIN del
// logopeda. O sea: el niño ganaba insignias que no podía mirar nunca. Una
// colección que no se puede abrir no motiva a nadie.
//
// Esta hoja se abre desde la tira de juego del hub, sin PIN, y enseña las tres
// cosas que hacen que una colección tire: lo conseguido, lo que falta (en gris,
// visible, con su condición escrita) y cuánto queda para el próximo nivel.
//
// No hay dato clínico aquí. XP, racha e insignias son motivación; ni puntúan
// ni entran en el informe. Por eso puede vivir fuera del PIN.
// ============================================================================
import React from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';
import { CatPixel } from './ValeriaCatPixel';
import { PixelAward, tierBg } from './ValeriaPixelAwards';
import {
  GameState, BADGES, levelFor, levelProgress, xpToNext, liveStreak, LEVEL_COUNT,
} from './valeriaGamification';
import { useT } from './i18n';

interface Props {
  open: boolean;
  game: GameState | null;
  onClose: () => void;
}

export const ValeriaAwardsSheet: React.FC<Props> = ({ open, game, onClose }) => {
  const t = useT();
  if (!game) return null;

  const level = levelFor(game.xp);
  const atMax = level >= LEVEL_COUNT;
  const streak = liveStreak(game);
  const won = game.badges.length;

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.grabber} />

          {/* Cabecera: la gata, el nivel y la barra al siguiente. */}
          <View style={s.head}>
            <View style={s.catPlate}><CatPixel size={56} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{t.awards.title}</Text>
              <Text style={s.levelLine}>{t.awards.levelLine(level, t.hub.levelNameByIndex(level - 1))}</Text>
              <View style={s.track}>
                <View style={[s.trackFill, { width: `${Math.round((atMax ? 1 : levelProgress(game.xp)) * 100)}%` }]} />
              </View>
              <Text style={s.toNext}>{atMax ? t.awards.maxLevel : t.awards.xpToNext(xpToNext(game.xp))}</Text>
            </View>
          </View>

          {/* Dos cifras que el niño entiende sin leer: racha y XP. */}
          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={s.statValue}>{streak}</Text>
              <Text style={s.statLabel}>{streak ? t.awards.streakLine(streak) : t.awards.streakNone}</Text>
            </View>
            <View style={s.statSep} />
            <View style={s.stat}>
              <Text style={s.statValue}>{game.xp}</Text>
              <Text style={s.statLabel}>{t.awards.xpTotal(game.xp)}</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
            {/* Escalera de niveles: se ve entero el camino, no solo el escalón. */}
            <Text style={s.sectionLabel}>{t.awards.levelTrack}</Text>
            <View style={s.ladder}>
              {Array.from({ length: LEVEL_COUNT }, (_, i) => i + 1).map((n) => {
                const done = n <= level;
                const here = n === level;
                return (
                  <View key={n} style={[s.step, done && s.stepDone, here && s.stepHere]}>
                    <Text style={[s.stepNum, done && s.stepNumDone]}>{n}</Text>
                    <Text style={[s.stepName, done && s.stepNameDone]} numberOfLines={1}>
                      {t.hub.levelNameByIndex(n - 1)}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text style={s.sectionLabel}>{t.awards.collection(won, BADGES.length)}</Text>
            <View style={s.grid}>
              {BADGES.map((b) => {
                const got = game.badges.includes(b.id);
                const name = t.awards.badgeName(b.id);
                return (
                  <View
                    key={b.id}
                    style={[s.badge, !got && s.badgeOff]}
                    accessible
                    accessibilityLabel={t.awards.badgeA11y(name, got)}
                  >
                    <View style={[s.badgePlate, { backgroundColor: tierBg(b.tier, !got) }]}>
                      <PixelAward glyph={b.glyph} tier={b.tier} size={30} locked={!got} />
                    </View>
                    <Text style={[s.badgeName, !got && s.badgeNameOff]} numberOfLines={2}>{name}</Text>
                    <Text style={[s.badgeDesc, !got && s.badgeNameOff]} numberOfLines={3}>
                      {t.awards.badgeDesc(b.id)}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={s.hint}>{t.awards.lockedHint}</Text>
          </ScrollView>

          <Pressable onPress={onClose} style={s.closeBtn} accessibilityRole="button">
            <Text style={s.closeTxt}>{t.awards.close}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(11,18,32,.62)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: V.color.pageBg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: V.space.lg, paddingBottom: V.space.lg, maxHeight: '92%',
  },
  grabber: {
    width: 44, height: 5, borderRadius: 3, backgroundColor: '#d8e0e0',
    alignSelf: 'center', marginTop: V.space.md, marginBottom: V.space.lg,
  },

  head: { flexDirection: 'row', alignItems: 'center', gap: V.space.md },
  catPlate: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: V.color.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { ...V.type.heading, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  levelLine: { ...V.type.body, fontWeight: V.font.extrabold, color: V.color.primaryDark, marginTop: 2 },
  track: { height: 10, borderRadius: 5, backgroundColor: '#e3ecec', marginTop: V.space.sm, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 5, backgroundColor: V.color.primary },
  toNext: { ...V.type.caption, fontWeight: V.font.bold, color: V.color.textSecondary, marginTop: 5 },

  stats: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: V.color.card,
    borderRadius: 18, borderWidth: 1, borderColor: V.color.border,
    paddingVertical: V.space.md, marginTop: V.space.lg,
  },
  stat: { flex: 1, alignItems: 'center' },
  statSep: { width: 1, alignSelf: 'stretch', backgroundColor: V.color.border },
  statValue: { fontSize: 26, lineHeight: 30, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  // textSecondary y no textMuted: en la versión anterior estas etiquetas iban en
  // gris claro sobre blanco y no llegaban al contraste mínimo AA.
  statLabel: { ...V.type.caption, fontWeight: V.font.bold, color: V.color.textSecondary, marginTop: 2 },

  scroll: { paddingTop: V.space.lg, paddingBottom: V.space.md },
  sectionLabel: {
    ...V.type.caption, fontSize: 12, fontWeight: V.font.extrabold, letterSpacing: 0.4,
    color: V.color.textSecondary, marginBottom: V.space.sm, marginTop: V.space.xs,
  },

  ladder: { flexDirection: 'row', flexWrap: 'wrap', gap: V.space.sm, marginBottom: V.space.lg },
  step: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: V.color.card,
    borderWidth: 1, borderColor: V.color.border, borderRadius: 12,
    paddingVertical: 7, paddingHorizontal: 10,
  },
  stepDone: { backgroundColor: V.color.primaryLight, borderColor: V.color.borderActive },
  stepHere: { borderColor: V.color.primary, borderWidth: 2 },
  stepNum: { fontSize: 12, fontWeight: V.font.extrabold, color: V.color.textMuted },
  stepNumDone: { color: V.color.primaryDark },
  stepName: { fontSize: 12, fontWeight: V.font.bold, color: V.color.textSecondary },
  stepNameDone: { color: V.color.primaryDark },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: V.space.sm },
  badge: {
    width: '31.4%', backgroundColor: V.color.card, borderRadius: 16, borderWidth: 1,
    borderColor: V.color.borderActive, padding: V.space.sm, alignItems: 'center',
  },
  badgeOff: { borderColor: V.color.border, backgroundColor: '#fbfdfd' },
  badgePlate: {
    width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 11.5, lineHeight: 14, fontWeight: V.font.extrabold,
    color: V.color.textPrimary, textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 10, lineHeight: 12.5, fontWeight: V.font.semibold,
    color: V.color.textSecondary, textAlign: 'center', marginTop: 3,
  },
  badgeNameOff: { color: '#9fb0b0' },

  hint: {
    ...V.type.caption, fontWeight: V.font.semibold, color: V.color.textSecondary,
    textAlign: 'center', marginTop: V.space.lg,
  },

  closeBtn: {
    backgroundColor: V.color.primary, borderRadius: 16, paddingVertical: 14,
    alignItems: 'center', marginTop: V.space.md, ...V.shadow.button,
  },
  closeTxt: { color: '#fff', ...V.type.title, fontWeight: V.font.extrabold },
});

export default ValeriaAwardsSheet;

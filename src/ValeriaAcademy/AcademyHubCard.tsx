// ============================================================================
// Valeria+ · Academy — Tarjeta del hub (V1.0)
// Tarjeta prominente para ExerciseSelection, con la MISMA jerarquía visual que
// los bloques de terapia (mismo `blockCard` de la selección). Se suscribe al
// store por su cuenta: al completar una cápsula, SOLO esta tarjeta se
// re-renderiza (progreso en tiempo real), sin tocar el resto del hub.
// ============================================================================
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { V } from '../valeriaTheme';
import { hydrateAcademy, useAcademySummary } from './academyStore';

const ACCENT_BG = '#eef0ff';
const ACCENT_FG = '#5b6ee0';

export const AcademyHubCard: React.FC<{ onPress: () => void }> = React.memo(({ onPress }) => {
  const summary = useAcademySummary();

  // Lee el progreso cifrado una sola vez al montar el hub (idempotente).
  useEffect(() => { hydrateAcademy(); }, []);

  const pct = Math.round(summary.progress * 100);
  const complete = summary.completedCount >= summary.totalCount && summary.totalCount > 0;

  return (
    <Pressable
      onPress={onPress}
      style={s.card}
      accessibilityRole="button"
      accessibilityLabel={`Valeria Academy: formación para cuidadores. ${summary.completedCount} de ${summary.totalCount} cápsulas completadas.`}
    >
      <View style={[s.icon, { backgroundColor: ACCENT_BG }]}>
        <Text style={{ fontSize: 24 }}>🎓</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.titleRow}>
          <Text style={s.title}>Academy</Text>
          <View style={s.tag}><Text style={s.tagTxt}>PARA TI</Text></View>
        </View>
        <Text style={s.sub}>Cápsulas rápidas: cómo aprenden a hablar, el porqué del TPR y qué vicios evitar.</Text>

        {/* Barra de progreso en tiempo real */}
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` }]} />
        </View>
        <View style={s.metaRow}>
          <Text style={s.metaTxt}>
            {complete
              ? '✅ Formación completada'
              : `${summary.completedCount}/${summary.totalCount} cápsulas · ${pct}%`}
          </Text>
          <Text style={s.levelTxt}>🏅 {summary.levelName}</Text>
        </View>
      </View>
      <View style={[s.chev, { backgroundColor: ACCENT_FG }]}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>›</Text>
      </View>
    </Pressable>
  );
});

AcademyHubCard.displayName = 'AcademyHubCard';

const s = StyleSheet.create({
  // Coincide con `s.blockCard` de ExerciseSelection para compartir jerarquía.
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 15, marginBottom: 11, ...V.shadow.card },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '800', color: V.color.textPrimary },
  tag: { backgroundColor: ACCENT_BG, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2 },
  tagTxt: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.6, color: ACCENT_FG },
  sub: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, marginTop: 3, lineHeight: 16 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#eef0f2', marginTop: 10, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4, backgroundColor: ACCENT_FG },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  metaTxt: { fontSize: 11.5, fontWeight: '800', color: ACCENT_FG },
  levelTxt: { fontSize: 11, fontWeight: '700', color: V.color.textMuted },
  chev: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});

export default AcademyHubCard;

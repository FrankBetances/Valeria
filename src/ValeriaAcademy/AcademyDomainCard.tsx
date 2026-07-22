// ============================================================================
// Valeria+ · Academy — Tarjeta de Dominio (V2.0)
// Una tarjeta por silo (Lenguaje, Hipoacusia, Dislalias, Dislexia, TEA). Consume
// EN EXCLUSIVA su propio nodo del estado vía useAcademyDomainSummary(domain): al
// mutar un dominio, SOLO su tarjeta se re-renderiza (referencia estable en el
// resto). React.memo evita re-render por cambios del padre.
// ============================================================================
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { V } from '../valeriaTheme';
import { DOMAIN_META } from './academyDomains';
import { useAcademyDomainSummary } from './academyStore';
import { AcademyDomain } from './academyTypes';

export const AcademyDomainCard: React.FC<{
  domain: AcademyDomain;
  onPress: (domain: AcademyDomain) => void;
}> = React.memo(({ domain, onPress }) => {
  const summary = useAcademyDomainSummary(domain);
  const meta = DOMAIN_META[domain];
  const pct = Math.round(summary.progress * 100);
  const complete = summary.totalCount > 0 && summary.completedCount >= summary.totalCount;

  return (
    <Pressable
      onPress={() => onPress(domain)}
      style={s.card}
      accessibilityRole="button"
      accessibilityLabel={`${meta.label}. ${summary.completedCount} de ${summary.totalCount} completadas. Nivel ${summary.levelName}.`}
    >
      <View style={[s.icon, { backgroundColor: meta.accentBg }]}>
        <Text style={{ fontSize: 24 }}>{meta.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.titleRow}>
          <Text style={s.title}>{meta.label}</Text>
          {complete && <Text style={s.done}>✓</Text>}
        </View>
        <Text style={s.sub} numberOfLines={2}>{meta.blurb}</Text>

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: meta.accentFg }]} />
        </View>
        <View style={s.metaRow}>
          <Text style={[s.metaTxt, { color: meta.accentFg }]}>
            {summary.totalCount > 0 ? `${summary.completedCount}/${summary.totalCount} · ${pct}%` : 'Próximamente'}
          </Text>
          <View style={s.chips}>
            <Text style={s.levelTxt}>🏅 {summary.levelName}</Text>
            <Text style={s.xpTxt}>✨ {summary.xp}</Text>
          </View>
        </View>
      </View>
      <View style={[s.chev, { backgroundColor: meta.accentFg }]}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>›</Text>
      </View>
    </Pressable>
  );
});

AcademyDomainCard.displayName = 'AcademyDomainCard';

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 14, marginBottom: 11, ...V.shadow.card },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 15.5, fontWeight: '800', color: V.color.textPrimary },
  done: { fontSize: 14, fontWeight: '800', color: V.color.success },
  sub: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, marginTop: 2, lineHeight: 16 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#eef0f2', marginTop: 9, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  metaTxt: { fontSize: 11.5, fontWeight: '800' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelTxt: { fontSize: 11, fontWeight: '700', color: V.color.textMuted },
  xpTxt: { fontSize: 11, fontWeight: '800', color: V.color.star },
  chev: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});

export default AcademyDomainCard;

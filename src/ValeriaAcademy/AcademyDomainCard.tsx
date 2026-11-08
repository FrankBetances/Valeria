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
import { useT } from '../i18n';
import { domainMetaFor, domainLevelName } from './academyDomains';
import { useAcademyDomainSummary } from './academyStore';
import { AcademyDomain } from './academyTypes';
import { BlockIcon } from '../ValeriaBlockIcons';
import { ValeriaBlockTile } from '../ValeriaBlockTile';
import { getUiLang } from '../valeriaUiLang';
import { FONT } from '../ui/fonts';

export const AcademyDomainCard: React.FC<{
  domain: AcademyDomain;
  onPress: (domain: AcademyDomain) => void;
  index?: number;
}> = React.memo(({ domain, onPress, index = 0 }) => {
  const t = useT();
  const summary = useAcademyDomainSummary(domain);
  const lang = getUiLang();
  const meta = domainMetaFor(domain, lang);
  const localizedLevelName = domainLevelName(domain, summary.level, lang);
  const pct = Math.round(summary.progress * 100);
  const complete = summary.totalCount > 0 && summary.completedCount >= summary.totalCount;

  // Patrón de filas aprobado (8/11/2026): la misma fila que Ejercicios.
  const status = summary.totalCount > 0
    ? t.academy.progressTxt(summary.completedCount, summary.totalCount, pct)
    : t.academy.comingSoon;
  return (
    <ValeriaBlockTile
      icon={meta.icon}
      title={complete ? `${meta.label} ✓` : meta.label}
      accentBg={meta.accentBg}
      accentFg={meta.accentFg}
      description={meta.blurb}
      progress={summary.progress}
      index={index}
      onPress={() => onPress(domain)}
      accessibilityLabel={`${meta.label}. ${status}. ${localizedLevelName}.`}
      style={{ marginBottom: 10 }}
    />
  );
});

AcademyDomainCard.displayName = 'AcademyDomainCard';

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 14, marginBottom: 11, ...V.shadow.card },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: FONT.bodyBlack,fontSize: 15.5, color: V.color.textPrimary },
  done: { alignItems: 'center', justifyContent: 'center' },
  sub: { fontFamily: FONT.bodyBold,fontSize: 12, color: V.color.textSecondary, marginTop: 2, lineHeight: 16 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: '#eef0f2', marginTop: 9, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 },
  metaTxt: { fontFamily: FONT.bodyBlack,fontSize: 11.5 },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  levelTxt: { fontFamily: FONT.bodyBlack,fontSize: 11, color: V.color.textSecondary },
  xpTxt: { fontFamily: FONT.bodyBlack,fontSize: 11, color: V.color.star },
  chev: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});

export default AcademyDomainCard;

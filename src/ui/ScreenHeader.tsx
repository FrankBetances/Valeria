// Cabecera única de las pantallas de módulo (CLAUDE.md, regla 5). Rediseño
// 2/11/2026: fondo de color con burbujas, título grande en Fredoka, botón de
// volver redondo que rebota al tocarlo (pressto, MIT) y barra de pasos gruesa.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from 'pressto';
import * as Haptics from 'expo-haptics';
import { BlockIcon, BlockIconName } from '../ValeriaBlockIcons';
import { V } from '../valeriaTheme';
import { FONT } from './fonts';

interface Props {
  /** Sin `onBack` no hay botón de vuelta. */
  onBack?: () => void;
  backLabel: string;
  /** Línea pequeña sobre el título: a qué parte de la app pertenece. */
  kicker?: string;
  icon?: BlockIconName;
  title: string;
  subtitle?: string;
  /** Dato corto a la derecha del título. */
  badge?: string;
  /** Fila opcional bajo el subtítulo: pestañas, cifras… */
  children?: React.ReactNode;
  /** Fondo: por defecto el turquesa de la marca (Academy lo cambia por dominio). */
  color?: string;
  /** Pieza a la derecha del bloque de título: la gata, un botón. */
  trailing?: React.ReactNode;
  /** Barra segmentada de progreso de una sesión. */
  dots?: { total: number; index: number; finished?: boolean };
}

// Tinta del texto: la que más contraste da sobre el fondo (WCAG, luminancia relativa).
const lum = (hex: string) => {
  const h = hex.replace('#', '');
  if (h.length !== 6) return 1;
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const inkFor = (bg: string) => {
  const L = lum(bg);
  return (1.05) / (L + 0.05) >= (L + 0.05) / (lum(INK) + 0.05) ? '#ffffff' : INK;
};

export const ScreenHeader: React.FC<Props> = ({ onBack, backLabel, kicker, icon, title, subtitle, badge, children, color, trailing, dots }) => {
  const bg = color ?? V.color.primary;
  const ink = inkFor(bg);
  return (
  <View style={[s.wrap, { backgroundColor: bg }]}>
    <View style={[s.bubble, { width: 180, height: 180, top: -70, right: -40 }]} pointerEvents="none" />
    <View style={[s.bubble, { width: 90, height: 90, bottom: -30, left: 30, opacity: 0.1 }]} pointerEvents="none" />

    <View style={s.topRow}>
      {onBack && (
        <PressableScale onPress={() => { void Haptics.selectionAsync(); onBack(); }} hitSlop={12}
          accessibilityRole="button" accessibilityLabel={backLabel} style={s.back}>
          <Text style={s.backGlyph}>‹</Text>
        </PressableScale>
      )}
      {!!kicker && <Text style={[s.kicker, { color: ink }]} numberOfLines={1}>{kicker}</Text>}
    </View>

    <View style={s.titleRow}>
      {icon && <View style={s.iconPlate}><BlockIcon name={icon} color={color ?? V.color.primaryDark} size={26} /></View>}
      <View style={s.titleCol}>
        <Text style={[s.title, { color: ink }]} role="heading" numberOfLines={2}>{title}</Text>
        {!!subtitle && <Text style={[s.subtitle, { color: ink }]} numberOfLines={2}>{subtitle}</Text>}
      </View>
      {!!badge && <View style={s.badge}><Text style={s.badgeTxt} numberOfLines={1}>{badge}</Text></View>}
      {trailing && <View style={s.trailing}>{trailing}</View>}
    </View>

    {dots && (
      <View style={s.dots}>
        {Array.from({ length: dots.total }, (_, i) => {
          const done = dots.finished || i < dots.index;
          const current = !dots.finished && i === dots.index;
          return <View key={i} style={[s.dot, { backgroundColor: done ? '#ffffff' : current ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.28)' }]} />;
        })}
      </View>
    )}
    {children}
  </View>
  );
};

const INK = '#0b1220'; // tinta sobre el turquesa: 8,6:1 (el blanco daba 2,2:1)

const s = StyleSheet.create({
  wrap: { borderBottomLeftRadius: 34, borderBottomRightRadius: 34, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 20, overflow: 'hidden' },
  bubble: { position: 'absolute', borderRadius: 999, backgroundColor: '#ffffff', opacity: 0.16 },
  topRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, marginBottom: 8 },
  back: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.15)', marginRight: 12 },
  backGlyph: { fontFamily: FONT.display, fontSize: 32, lineHeight: 36, color: INK, marginTop: -3 },
  kicker: { flexShrink: 1, fontFamily: FONT.bodyBlack, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: INK, opacity: 0.75 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  iconPlate: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  titleCol: { flexShrink: 1, flexGrow: 1 },
  title: { fontFamily: FONT.display, fontSize: 28, lineHeight: 33, color: INK },
  subtitle: { fontFamily: FONT.bodyBold, fontSize: 15, lineHeight: 20, color: INK, opacity: 0.8, marginTop: 2 },
  badge: { marginLeft: 10, backgroundColor: '#ffffff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeTxt: { fontFamily: FONT.bodyBlack, fontSize: 13, color: INK },
  trailing: { marginLeft: 10 },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flexGrow: 1, flexBasis: 0, height: 10, borderRadius: 5 },
});

export default ScreenHeader;

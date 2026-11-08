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
import { CatPixel } from '../ValeriaCatPixel';
import { Breathe } from './motion';
import Svg, { Path, Circle } from 'react-native-svg';

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
  /** Lúa acompaña dentro de cada módulo (F12). `false` donde ya está (inicio). */
  mascot?: boolean;
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

export const ScreenHeader: React.FC<Props> = ({ onBack, backLabel, kicker, icon, title, subtitle, badge, children, color, trailing, dots, mascot = true }) => {
  const bg = color ?? V.color.primary;
  const ink = inkFor(bg);
  return (
  <View style={[s.wrap, { backgroundColor: bg }]}>
    {/* Ilustración propia de cabecera (R10): olas en capas, constelación de
        puntos y el icono del módulo en grande como marca de agua. */}
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice">
        <Path d="M0 170 C 80 140, 160 200, 240 170 S 360 140, 400 160 L400 220 L0 220 Z" fill="#ffffff" opacity={0.18} />
        <Path d="M0 190 C 100 165, 180 215, 270 190 S 370 170, 400 185 L400 220 L0 220 Z" fill="#ffffff" opacity={0.24} />
        <Circle cx="330" cy="40" r="70" fill="#ffffff" opacity={0.10} />
        {[[250, 30, 3], [280, 70, 2], [372, 120, 3], [215, 95, 2], [350, 18, 2], [300, 110, 1.5]].map(([x, y, r], i) => (
          <Circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={0.55} />
        ))}
      </Svg>
      {icon && <View style={s.watermark}><BlockIcon name={icon} color="#ffffff" size={150} /></View>}
    </View>

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
        {!!subtitle && <Text style={[s.subtitle, { color: ink }]} numberOfLines={3}>{subtitle}</Text>}
        {!!badge && <View style={s.badge}><Text style={s.badgeTxt} numberOfLines={1}>{badge}</Text></View>}
      </View>
      {trailing ? <View style={s.trailing}>{trailing}</View>
        : mascot ? <Breathe style={[s.trailing, s.lua]}><CatPixel size={54} pose="head" /></Breathe> : null}
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
  watermark: { position: 'absolute', right: -24, bottom: -34, opacity: 0.13, transform: [{ rotate: '-12deg' }] },
  topRow: { flexDirection: 'row', alignItems: 'center', minHeight: 48, marginBottom: 8 },
  back: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 4, borderBottomColor: 'rgba(0,0,0,0.15)', marginRight: 12 },
  backGlyph: { fontFamily: FONT.display, fontSize: 32, lineHeight: 36, color: INK, marginTop: -3 },
  kicker: { flexShrink: 1, fontFamily: FONT.bodyBlack, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase', color: INK, opacity: 0.75 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  iconPlate: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  titleCol: { flexShrink: 1, flexGrow: 1 },
  title: { fontFamily: FONT.display, fontSize: 28, lineHeight: 33, color: INK },
  subtitle: { fontFamily: FONT.bodyBold, fontSize: 15, lineHeight: 20, color: INK, opacity: 0.8, marginTop: 2 },
  badge: { alignSelf: 'flex-start', marginTop: 8, backgroundColor: '#ffffff', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeTxt: { fontFamily: FONT.bodyBlack, fontSize: 13, color: INK },
  trailing: { marginLeft: 10 },
  lua: { padding: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flexGrow: 1, flexBasis: 0, height: 10, borderRadius: 5 },
});

export default ScreenHeader;

// ============================================================================
// Valeria+ · Fila de bloque del menú Ejercicios (rediseño 8/11/2026)
//
// Para adultos sin experiencia previa: una fila por bloque, todas iguales y
// fáciles de recorrer. Icono en su color, título grande, una línea de qué
// trabaja, barra de avance fina y flecha que dice «aquí se entra».
// Card de HeroUI Native (Apache-2.0); rebote al tocar con pressto (MIT) y
// vibración corta (expo-haptics). La cifra va en la etiqueta accesible.
// ============================================================================
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { PressableScale } from 'pressto';
import * as Haptics from 'expo-haptics';
import { Card } from 'heroui-native';
import { V } from './valeriaTheme';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import { FONT } from './ui/fonts';
import Animated from 'react-native-reanimated';
import { enterAt, ProgressRing } from './ui/motion';

export interface ValeriaBlockTileProps {
  icon: BlockIconName;
  title: string;
  /** Tinte suave del bloque: fondo del icono. */
  accentBg: string;
  /** Color pleno del bloque: icono, franja y barra. */
  accentFg: string;
  /** Una línea de qué trabaja el bloque. Dos líneas como mucho. */
  description?: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** Cifra para el adulto. No se pinta: va en la etiqueta accesible. */
  meta?: string;
  /** 0..1 · dibuja la barra. */
  progress?: number;
  style?: StyleProp<ViewStyle>;
  /** Posición en la lista: retrasa la entrada en cascada. */
  index?: number;
}

export const ValeriaBlockTile: React.FC<ValeriaBlockTileProps> = React.memo(({
  icon, title, accentBg, accentFg, description, onPress,
  accessibilityLabel, accessibilityHint, meta, progress, style, index = 0,
}) => {
  const pct = progress == null ? null : Math.max(0, Math.min(1, progress));
  return (
    <Animated.View entering={enterAt(index)} style={style}>
    <PressableScale
      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${accessibilityLabel}. ${meta}` : accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Card style={[s.card, { borderLeftColor: accentFg }]}>
        <View style={s.iconWrap}>
          <ProgressRing size={64} stroke={4} progress={pct ?? 0} color={accentFg} track={accentBg}>
            <View style={[s.iconIn, { backgroundColor: accentBg }]}><BlockIcon name={icon} color={accentFg} size={28} /></View>
          </ProgressRing>
        </View>
        <View style={s.body}>
          <Text style={s.title} numberOfLines={4}>{title}</Text>
          {!!description && <Text style={s.desc} numberOfLines={6}>{description}</Text>}
        </View>
        <View style={[s.go, { backgroundColor: accentBg }]}>
          <Text style={[s.goGlyph, { color: accentFg }]}>›</Text>
        </View>
      </Card>
    </PressableScale>
    </Animated.View>
  );
});

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 22, paddingVertical: 14, paddingLeft: 14, paddingRight: 12, minHeight: 88,
    borderWidth: 1, borderColor: '#ece5d8', borderLeftWidth: 6,
  },
  iconWrap: { width: 64, alignItems: 'center', marginRight: 12 },
  iconIn: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  body: { flexShrink: 1, flexGrow: 1, minWidth: 0 },
  title: { fontFamily: FONT.display, fontSize: 19, lineHeight: 23, color: V.color.textPrimary },
  desc: { fontFamily: FONT.body, fontSize: 14, lineHeight: 19, color: V.color.textSecondary, marginTop: 2 },
  go: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  goGlyph: { fontFamily: FONT.display, fontSize: 26, lineHeight: 30, marginTop: -2 },
});

export default ValeriaBlockTile;

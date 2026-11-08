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
}

export const ValeriaBlockTile: React.FC<ValeriaBlockTileProps> = React.memo(({
  icon, title, accentBg, accentFg, description, onPress,
  accessibilityLabel, accessibilityHint, meta, progress, style,
}) => {
  const pct = progress == null ? null : Math.max(0, Math.min(1, progress));
  return (
    <PressableScale
      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      accessibilityRole="button"
      accessibilityLabel={meta ? `${accessibilityLabel}. ${meta}` : accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={style}
    >
      <Card style={[s.card, { borderLeftColor: accentFg }]}>
        <View style={[s.icon, { backgroundColor: accentBg }]}>
          <BlockIcon name={icon} color={accentFg} size={30} />
        </View>
        <View style={s.body}>
          <Text style={s.title} numberOfLines={2}>{title}</Text>
          {!!description && <Text style={s.desc} numberOfLines={2}>{description}</Text>}
          {pct != null && (
            <View style={s.track}>
              <View style={[s.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: accentFg }]} />
            </View>
          )}
        </View>
        <View style={[s.go, { backgroundColor: accentBg }]}>
          <Text style={[s.goGlyph, { color: accentFg }]}>›</Text>
        </View>
      </Card>
    </PressableScale>
  );
});

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 22, paddingVertical: 14, paddingLeft: 14, paddingRight: 12, minHeight: 88,
    borderWidth: 1, borderColor: '#ece5d8', borderLeftWidth: 6,
  },
  icon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  body: { flexShrink: 1, flexGrow: 1, minWidth: 0 },
  title: { fontFamily: FONT.display, fontSize: 19, lineHeight: 23, color: V.color.textPrimary },
  desc: { fontFamily: FONT.body, fontSize: 14, lineHeight: 19, color: V.color.textSecondary, marginTop: 2 },
  track: { height: 6, borderRadius: 3, backgroundColor: '#efe9dd', marginTop: 8, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  go: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  goGlyph: { fontFamily: FONT.display, fontSize: 26, lineHeight: 30, marginTop: -2 },
});

export default ValeriaBlockTile;

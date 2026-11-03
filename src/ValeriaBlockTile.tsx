// ============================================================================
// Valeria+ · Puerta de la Casa de Lúa (rediseño 2/11/2026)
//
// Cada bloque es una puerta grande (Card de HeroUI Native, Apache-2.0): cara de color con lateral 3D, icono del
// set propio en un círculo blanco, título en Fredoka y una barra de progreso
// gruesa. Rebota al tocarla (pressto, MIT) y vibra (expo-haptics).
// Sin cifras para el niño («18 / 18» no le dice nada): el dato sigue en
// `accessibilityLabel` para el lector de pantalla del adulto.
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
  /** Tinte suave del bloque: es el FONDO de la tarjeta. */
  accentBg: string;
  /** Color pleno del bloque: icono, lateral 3D y barra. */
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
      style={[s.press, style]}
    >
      <Card style={[s.card, { backgroundColor: accentBg, borderColor: accentFg }]}>
        <View style={[s.iconRing, { borderColor: accentFg }]}>
          <BlockIcon name={icon} color={accentFg} size={34} />
        </View>
        <Text style={s.title} numberOfLines={2}>{title}</Text>
        {!!description && <Text style={s.desc} numberOfLines={2}>{description}</Text>}
        {pct != null && (
          <View style={s.track}>
            <View style={[s.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: accentFg }]} />
          </View>
        )}
      </Card>
    </PressableScale>
  );
});

const s = StyleSheet.create({
  press: { flexGrow: 1, flexBasis: 0 },
  card: {
    borderRadius: 28, paddingHorizontal: 16, paddingTop: 18, paddingBottom: 16, minHeight: 196,
    alignItems: 'center', borderWidth: 2, borderBottomWidth: 8,
  },
  iconRing: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: '#ffffff', borderWidth: 3,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  title: { fontFamily: FONT.display, fontSize: 20, lineHeight: 24, color: V.color.textPrimary, textAlign: 'center' },
  desc: { fontFamily: FONT.body, fontSize: 13, lineHeight: 17, color: V.color.textSecondary, textAlign: 'center', marginTop: 4 },
  track: { alignSelf: 'stretch', height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.85)', marginTop: 'auto', overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
});

export default ValeriaBlockTile;

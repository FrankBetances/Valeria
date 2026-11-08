// Fila del patrón aprobado por Frank (8/11/2026) para toda la app: tarjeta
// blanca con franja de color a la izquierda, icono en su cuadro, título grande,
// una línea de apoyo y, a la derecha, flecha o el control que toque (interruptor,
// botón de jugar). Card de HeroUI Native; rebote con pressto si es pulsable.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from 'heroui-native';
import { PressableScale } from 'pressto';
import * as Haptics from 'expo-haptics';
import { BlockIcon, BlockIconName } from '../ValeriaBlockIcons';
import { V } from '../valeriaTheme';
import { FONT } from './fonts';

interface Props {
  title: string;
  subtitle?: string;
  icon?: BlockIconName;
  /** Pieza propia en lugar del icono (un número de reto, p. ej.). */
  leading?: string;
  /** Color pleno: icono, franja y flecha. */
  accent?: string;
  /** Tinte suave: fondo del icono y de la flecha. */
  tint?: string;
  /** 'chevron' (por defecto si hay onPress), un control propio o nada. */
  trailing?: React.ReactNode | 'chevron';
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'checkbox' | 'switch';
  /** Contenido extra bajo la fila, dentro de la misma tarjeta. */
  children?: React.ReactNode;
  dim?: boolean;
}

export const ListRow: React.FC<Props> = ({
  title, subtitle, icon, leading, accent = V.color.primaryDark, tint = V.color.primaryLight,
  trailing, onPress, accessibilityLabel, accessibilityHint, accessibilityRole = 'button', children, dim,
}) => {
  const right = trailing === undefined ? (onPress ? 'chevron' : null) : trailing;
  const body = (
    <Card style={[s.card, { borderLeftColor: accent }, dim && s.dim]}>
      <View style={s.row}>
        {!!leading && <View style={[s.icon, { backgroundColor: tint }]}><Text style={[s.lead, { color: accent }]}>{leading}</Text></View>}
        {icon && <View style={[s.icon, { backgroundColor: tint }]}><BlockIcon name={icon} color={accent} size={26} /></View>}
        <View style={s.text}>
          <Text style={s.title} numberOfLines={2}>{title}</Text>
          {!!subtitle && <Text style={s.sub} numberOfLines={5}>{subtitle}</Text>}
        </View>
        {right === 'chevron'
          ? <View style={[s.go, { backgroundColor: tint }]}><Text style={[s.goGlyph, { color: accent }]}>›</Text></View>
          : right}
      </View>
      {children}
    </Card>
  );
  if (!onPress) return body;
  return (
    <PressableScale
      onPress={() => { void Haptics.selectionAsync(); onPress(); }}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
    >
      {body}
    </PressableScale>
  );
};

export const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
  <Text style={s.section} role="heading">{children}</Text>
);

const s = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', borderRadius: 22, paddingVertical: 14, paddingLeft: 14, paddingRight: 12,
    borderWidth: 1, borderColor: '#ece5d8', borderLeftWidth: 6, marginBottom: 10,
  },
  dim: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56 },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  lead: { fontFamily: FONT.display, fontSize: 24 },
  text: { flexShrink: 1, flexGrow: 1, minWidth: 0 },
  title: { fontFamily: FONT.display, fontSize: 18, lineHeight: 22, color: V.color.textPrimary },
  sub: { fontFamily: FONT.body, fontSize: 14, lineHeight: 19, color: V.color.textSecondary, marginTop: 2 },
  go: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  goGlyph: { fontFamily: FONT.display, fontSize: 26, lineHeight: 30, marginTop: -2 },
  section: {
    fontFamily: FONT.bodyBlack, fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase',
    color: V.color.textSecondary, marginTop: 18, marginBottom: 10, marginLeft: 4,
  },
});

export default ListRow;

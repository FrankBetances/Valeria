// Cabecera única de las pantallas de módulo. Antes había cinco versiones
// (Sensorial, Aventuras, Pares/Semántica, bloques, Grafomotricidad) y la app no
// parecía una sola. Estructura de componente tomada de React Native Reusables
// (founded-labs/react-native-reusables, MIT): piezas pequeñas con variantes,
// escritas con StyleSheet y los tokens de valeriaTheme (sin NativeWind).
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { V } from '../valeriaTheme';
import { BlockIcon, BlockIconName } from '../ValeriaBlockIcons';

interface Props {
  /** Sin `onBack` no hay píldora de vuelta. */
  onBack?: () => void;
  backLabel: string;
  /** Línea pequeña en mayúsculas sobre el título: a qué parte de la app pertenece. */
  kicker?: string;
  icon?: BlockIconName;
  title: string;
  subtitle?: string;
  /** Dato corto a la derecha del título («6 de 6 recomendadas»). */
  badge?: string;
  /** Fila opcional bajo el subtítulo: pestañas, cifras… */
  children?: React.ReactNode;
  /** Fondo: por defecto el turquesa de la marca (Academy lo cambia por dominio). */
  color?: string;
  /** Pieza a la derecha del bloque de título: la gata, un botón. */
  trailing?: React.ReactNode;
  /** Puntos de progreso de una sesión: hechos, el actual y los que faltan. */
  dots?: { total: number; index: number; finished?: boolean };
}

export const ScreenHeader: React.FC<Props> = ({ onBack, backLabel, kicker, icon, title, subtitle, badge, children, color, trailing, dots }) => (
  <View style={[s.header, color ? { backgroundColor: color } : null]}>
    {onBack && (
      <Pressable onPress={onBack} style={s.back} hitSlop={12} accessibilityRole="button" accessibilityLabel={backLabel}>
        <Text style={s.backTxt}>{`‹ ${backLabel}`}</Text>
      </Pressable>
    )}
    <View style={s.top}>
      <View style={s.topText}>
        {!!kicker && <Text style={s.kicker}>{kicker}</Text>}
        <View style={s.titleRow}>
          {icon && <View style={s.icon}><BlockIcon name={icon} color="#ffffff" size={24} /></View>}
          <Text style={s.title} accessibilityRole="header">{title}</Text>
          {!!badge && <View style={s.badge}><Text style={s.badgeTxt} numberOfLines={1}>{badge}</Text></View>}
        </View>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}
      </View>
      {trailing && <View style={s.trailing}>{trailing}</View>}
    </View>
    {dots && (
      <View style={s.dots}>
        {Array.from({ length: dots.total }, (_, i) => {
          const done = dots.finished || i < dots.index;
          const current = !dots.finished && i === dots.index;
          return <View key={i} style={[s.dot, done ? s.dotDone : current ? s.dotCurrent : null]} />;
        })}
      </View>
    )}
    {children}
  </View>
);

const s = StyleSheet.create({
  header: {
    backgroundColor: V.color.primary, paddingTop: V.space.md, paddingHorizontal: V.space.xl,
    paddingBottom: V.space.lg, borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  back: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: V.space.md,
  },
  backTxt: { color: '#fff', fontSize: 12, fontWeight: V.font.extrabold },
  kicker: { color: 'rgba(255,255,255,.85)', fontSize: 11.5, fontWeight: V.font.extrabold, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  top: { flexDirection: 'row', alignItems: 'center' },
  topText: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  trailing: { marginLeft: V.space.md },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  // Icono y badge de tamaño propio; el título es el único que se encoge.
  icon: { marginRight: 10 },
  title: { ...V.type.display, color: '#fff', fontWeight: V.font.extrabold, letterSpacing: -0.4, flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  badge: {
    marginLeft: V.space.md, backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 6,
  },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: V.font.extrabold },
  // Barra segmentada, como la que ya llevaban el reproductor y los pares.
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flex: 1, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.32)' },
  dotDone: { backgroundColor: '#fff' },
  dotCurrent: { backgroundColor: 'rgba(255,255,255,.85)' },
  subtitle: { ...V.type.body, color: 'rgba(255,255,255,.92)', fontWeight: V.font.semibold, marginTop: V.space.xs },
});

export default ScreenHeader;

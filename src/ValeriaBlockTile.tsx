// ============================================================================
// Valeria+ · Tarjeta del grid de bloques (v11) — Sprint 1.2
//
// Sustituye a `blockCard` de ValeriaExerciseSelectionScreen, que era una fila
// horizontal con icono + título + SUBTÍTULO de 1-3 líneas + badge + chevron.
// Los testers reportaron "mucho texto": aquí NO hay subtítulo. El dato que
// sobrevive es el badge ("12/18"), porque es dato, no prosa.
//
// La descripción del bloque no se pierde: se reubica al `refCard` de la
// pantalla del bloque (Sprint 3.4), donde se lee justo antes de usarlo. Varias
// de esas descripciones tienen peso MDR ("Estresores siempre manuales", "Sin
// grabar nada y con el micrófono apagado") y borrarlas sería una regresión de
// la documentación al usuario.
//
// Mientras tanto, el lector de pantalla es la ÚNICA vía a esa descripción en
// el hub: por eso `accessibilityHint` no es decorativo aquí, es el sustituto
// del texto que se ha quitado. Se rellena desde las claves `*A11y` y `*Sub`
// que ya existen en i18n.
//
// Animación: `Animated` del core con `useNativeDriver: true` — el scale corre
// en el hilo de UI a 60 FPS. NO se usa react-native-reanimated a propósito:
// exige plugin de Babel y rebuild nativo sobre un pipeline de audio/ASR que
// hoy funciona, y para un muelle de pulsación no aporta nada.
// ============================================================================
import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { V } from './valeriaTheme';

export interface ValeriaBlockTileProps {
  /** Emoji del bloque. Se mantienen los del hub actual (👂 💬 🧠 📖 🗣️ 🧩 🎯). */
  icon: string;
  title: string;
  /** Fondo del acento: el mismo par de color que ya usaba cada `blockCard`. */
  accentBg: string;
  /** Tinta del acento, para el badge. */
  accentFg: string;
  onPress: () => void;
  /** Obligatorio: sin subtítulo visible, el lector de pantalla es la vía única. */
  accessibilityLabel: string;
  /** La descripción que se ha quitado de la tarjeta (clave `*Sub` de i18n). */
  accessibilityHint?: string;
  /** Dato compacto, p. ej. "12/18". Prosa NO. */
  badge?: string;
  /** Etiqueta breve en la esquina, p. ej. "PARA TI". */
  tag?: string;
  /** Layout desde el grid (FlatList numColumns). */
  style?: StyleProp<ViewStyle>;
}

export const ValeriaBlockTile: React.FC<ValeriaBlockTileProps> = React.memo(({
  icon, title, accentBg, accentFg, onPress,
  accessibilityLabel, accessibilityHint, badge, tag, style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue: number) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true, // hilo de UI: no compite con el audio ni con el ASR
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => spring(0.96)}
      onPressOut={() => spring(1)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[s.press, style]}
    >
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        {!!tag && (
          <View style={[s.tag, { backgroundColor: accentBg }]}>
            <Text style={[s.tagTxt, { color: accentFg }]} numberOfLines={1}>{tag}</Text>
          </View>
        )}

        <View style={[s.icon, { backgroundColor: accentBg }]}>
          <Text style={s.iconGlyph}>{icon}</Text>
        </View>

        {/* Dos líneas reservadas: mantiene los badges alineados entre tarjetas
            de títulos de distinto largo ("Audición" vs "Expansión Semántica"). */}
        <Text style={s.title} numberOfLines={2}>{title}</Text>

        {!!badge && (
          <View style={[s.badge, { backgroundColor: accentBg }]}>
            <Text style={[s.badgeTxt, { color: accentFg }]} numberOfLines={1}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
});

ValeriaBlockTile.displayName = 'ValeriaBlockTile';

const s = StyleSheet.create({
  // El Pressable solo gestiona el gesto; el aspecto va en la Animated.View
  // interior, para que la sombra escale junto con la tarjeta.
  press: { flex: 1 },

  card: {
    flex: 1,
    minHeight: 132, // > V.touchMin con holgura
    backgroundColor: V.color.card,
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: V.radius.card,
    padding: V.space.md,
    ...V.shadow.card,
  },

  icon: {
    width: V.touchMin,
    height: V.touchMin,
    borderRadius: V.radius.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 26 },

  title: {
    ...V.type.title,
    fontWeight: V.font.extrabold,
    color: V.color.textPrimary,
    marginTop: V.space.sm,
    minHeight: V.type.title.lineHeight * 2,
  },

  badge: {
    alignSelf: 'flex-start',
    marginTop: V.space.xs,
    paddingHorizontal: V.space.sm,
    paddingVertical: 3,
    borderRadius: V.space.sm,
  },
  badgeTxt: { ...V.type.caption, fontWeight: V.font.extrabold },

  tag: {
    position: 'absolute',
    top: V.space.md,
    right: V.space.md,
    paddingHorizontal: V.space.sm,
    paddingVertical: 2,
    borderRadius: V.space.sm,
    zIndex: 1,
  },
  tagTxt: { ...V.type.caption, fontSize: 9.5, fontWeight: V.font.extrabold, letterSpacing: 0.4 },
});

export default ValeriaBlockTile;

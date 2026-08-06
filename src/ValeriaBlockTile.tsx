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
      <Animated.View style={[s.card, { backgroundColor: accentBg, transform: [{ scale }] }]}>
        {!!tag && (
          <View style={s.tag}>
            <Text style={[s.tagTxt, { color: accentFg }]} numberOfLines={1}>{tag}</Text>
          </View>
        )}

        <View style={s.icon}>
          <Text style={s.iconGlyph}>{icon}</Text>
        </View>

        {/* Bloque inferior: el `space-between` de la tarjeta lo empuja al fondo,
            así que títulos de una y de dos líneas quedan igual de asentados sin
            reservar altura en vacío (era el hueco muerto de la primera versión). */}
        <View>
          <Text style={s.title} numberOfLines={2}>{title}</Text>
          {!!badge && (
            <View style={s.badge}>
              <Text style={[s.badgeTxt, { color: accentFg }]} numberOfLines={1}>{badge}</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
});

ValeriaBlockTile.displayName = 'ValeriaBlockTile';

const s = StyleSheet.create({
  // El Pressable solo gestiona el gesto; el aspecto va en la Animated.View
  // interior, para que la sombra escale junto con la tarjeta.
  press: { flex: 1 },

  // La tarjeta se tiñe con el acento del bloque en vez de ser una caja blanca:
  // la identidad "cada bloque tiene su color" ya estaba en la v10.2 y la
  // primera versión de la cuadrícula la había reducido a un cuadradito.
  card: {
    flex: 1,
    minHeight: 132,
    justifyContent: 'space-between', // icono arriba · texto asentado abajo
    borderRadius: V.radius.card,
    padding: V.space.md,
    ...V.shadow.card,
  },

  // Chip blanco sobre el fondo teñido: invierte la relación anterior y da
  // profundidad sin sombras ni degradados.
  icon: {
    width: V.touchMin,
    height: V.touchMin,
    borderRadius: V.radius.field,
    backgroundColor: 'rgba(255,255,255,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: { fontSize: 26 },

  title: {
    ...V.type.title,
    fontWeight: V.font.extrabold,
    color: V.color.textPrimary,
    marginTop: V.space.sm,
  },

  badge: {
    alignSelf: 'flex-start',
    marginTop: V.space.sm,
    paddingHorizontal: V.space.sm,
    paddingVertical: 3,
    borderRadius: V.space.sm,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  badgeTxt: { ...V.type.caption, fontWeight: V.font.extrabold },

  tag: {
    position: 'absolute',
    top: V.space.md,
    right: V.space.md,
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: V.space.sm,
    paddingVertical: 2,
    borderRadius: V.space.sm,
    zIndex: 1,
  },
  tagTxt: { ...V.type.caption, fontSize: 9.5, fontWeight: V.font.extrabold, letterSpacing: 0.4 },
});

export default ValeriaBlockTile;

// ============================================================================
// Valeria+ · Tarjeta del grid de bloques (v11)
//
// Tercera versión. Las dos anteriores fallaron por motivos opuestos y conviene
// dejarlo escrito para no repetirlas:
//
//   1ª — caja blanca con emoji y una palabra. Altura fija con todo pegado
//        arriba: media tarjeta era hueco. Leía como pantalla sin terminar.
//   2ª — la misma caja teñida de pastel. Ganó color pero seguía siendo plana:
//        un bloque de color con dos textos encima no es jerarquía.
//
// Esta parte de que en una cuadrícula SIN descripciones la tarjeta necesita
// una estructura de tres pisos, no relleno:
//
//   · Placa del icono — ancla visual y color del bloque.
//   · Título — la decisión que toma el adulto.
//   · Zócalo de estado — cuánto hay prescrito, en barra y cifra. Es lo que
//     convierte la tarjeta en un panel y no en un botón grande.
//
// El acento manda MÁS cuanto menos superficie ocupa: por eso el color vuelve a
// concentrarse en la placa, la cifra y la barra, y la tarjeta es blanca.
//
// El zócalo va anclado abajo con `space-between`, así que un título de una
// línea y otro de dos quedan igual de asentados sin reservar altura vacía.
//
// La descripción retirada de la tarjeta no se pierde: vive en el `refCard` del
// bloque y, aquí, en `accessibilityHint` — que no es decorativo, es la única
// vía a ese texto para quien usa lector de pantalla.
//
// Animación: `Animated` del core con `useNativeDriver: true`, en el hilo de UI.
// Nada de reanimated: exigiría plugin de Babel y rebuild nativo sobre el
// pipeline de audio/ASR, y para un muelle de pulsación no aporta nada.
// ============================================================================
import React, { useRef } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { V } from './valeriaTheme';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';

export interface ValeriaBlockTileProps {
  icon: BlockIconName;
  title: string;
  /** Tinte suave del bloque: placa secundaria, píldora y carril de la barra. */
  accentBg: string;
  /** Color pleno del bloque: placa del icono, cifra y relleno de la barra. */
  accentFg: string;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  /** Cifra del zócalo: «18 / 18», «15 pares». Dato, nunca prosa. */
  meta?: string;
  /** 0..1 · dibuja la barra. Sin valor, el zócalo es solo la cifra. */
  progress?: number;
  style?: StyleProp<ViewStyle>;
}

export const ValeriaBlockTile: React.FC<ValeriaBlockTileProps> = React.memo(({
  icon, title, accentBg, accentFg, onPress,
  accessibilityLabel, accessibilityHint, meta, progress, style,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const spring = (toValue: number) => {
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 42, bounciness: 6 }).start();
  };

  const pct = progress == null ? null : Math.max(0, Math.min(1, progress));

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
        {/* Fila superior: Placa del icono distintivo a la izquierda + Badge métrico a la derecha */}
        <View style={s.topRow}>
          <View style={[s.iconPlate, { backgroundColor: accentFg }]}>
            <BlockIcon name={icon} color="#ffffff" size={26} />
          </View>
          {!!meta && (
            <View style={[s.badgePill, { backgroundColor: accentBg }]}>
              <Text style={[s.badgeTxt, { color: accentFg }]} numberOfLines={1}>{meta}</Text>
            </View>
          )}
        </View>

        {/* Zona inferior: Título proporcional a 2 líneas + Barra de avance */}
        <View style={s.bottomArea}>
          <Text style={s.title} numberOfLines={2}>{title}</Text>

          {pct != null ? (
            <View style={[s.track, { backgroundColor: accentBg }]}>
              <View style={[s.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: accentFg }]} />
            </View>
          ) : (
            <View style={s.spacerTrack} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
});

ValeriaBlockTile.displayName = 'ValeriaBlockTile';

const s = StyleSheet.create({
  press: {
    flex: 1,
  },

  card: {
    flex: 1,
    minHeight: 156,
    backgroundColor: V.color.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#edf2f2',
    padding: 15,
    // justifyContent: 'space-between' ancla el zócalo de estado abajo, de modo
    // que un título de una línea y otro de dos queden igual de asentados sin
    // reservar altura vacía ni que la tarjeta lea como pantalla a medio terminar.
    justifyContent: 'space-between',
    shadowColor: 'rgba(15, 23, 42, 0.10)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  iconPlate: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },

  badgePill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    maxWidth: '52%',
  },

  badgeTxt: {
    fontSize: 11,
    fontWeight: V.font.extrabold,
    letterSpacing: 0.1,
  },

  bottomArea: {
    marginTop: 12,
  },

  title: {
    fontSize: 15.5,
    lineHeight: 19.5,
    fontWeight: V.font.extrabold,
    color: V.color.textPrimary,
    letterSpacing: -0.2,
    minHeight: 40,
  },

  track: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },

  fill: {
    height: '100%',
    borderRadius: 3,
  },

  spacerTrack: {
    height: 6,
    marginTop: 8,
  },
});

export default ValeriaBlockTile;

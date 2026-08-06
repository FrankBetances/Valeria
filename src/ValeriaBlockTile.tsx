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
  /** Tinte suave del bloque: placa del icono y carril de la barra. */
  accentBg: string;
  /** Color pleno del bloque: cifra y relleno de la barra. */
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
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const pct = progress == null ? null : Math.max(0, Math.min(1, progress));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => spring(0.97)}
      onPressOut={() => spring(1)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[s.press, style]}
    >
      <Animated.View style={[s.card, { transform: [{ scale }] }]}>
        <View style={[s.iconPlate, { backgroundColor: accentFg }]}>
          <BlockIcon name={icon} color="#ffffff" size={31} />
        </View>

        <View style={s.foot}>
          <Text style={s.title} numberOfLines={2}>{title}</Text>

          {!!meta && (
            <>
              <Text style={[s.meta, { color: accentFg }]} numberOfLines={1}>{meta}</Text>
              {pct != null && (
                <View style={[s.track, { backgroundColor: accentBg }]}>
                  <View style={[s.fill, { width: `${pct * 100}%`, backgroundColor: accentFg }]} />
                </View>
              )}
            </>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
});

ValeriaBlockTile.displayName = 'ValeriaBlockTile';

const s = StyleSheet.create({
  press: { flex: 1 },

  card: {
    flex: 1,
    backgroundColor: V.color.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eef2f2',
    padding: 18,
    // Sombra baja y abierta: en una cuadrícula la elevación es lo que separa
    // la pieza del fondo, y sin ella las tarjetas parecían recortes de papel.
    shadowColor: 'rgba(15, 23, 42, 0.13)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },

  // Color PLENO con el glifo en blanco. La placa pastel con el icono teñido
  // se veía lavada; invertirla es lo que hace que la tarjeta tenga peso.
  iconPlate: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  foot: { marginTop: 16 },
  title: {
    fontSize: 16.5,
    lineHeight: 21,
    fontWeight: V.font.extrabold,
    color: V.color.textPrimary,
    letterSpacing: -0.2,
  },
  meta: {
    fontSize: 12.5,
    fontWeight: V.font.extrabold,
    marginTop: 10,
    letterSpacing: 0.1,
  },
  track: { height: 6, borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
});

export default ValeriaBlockTile;

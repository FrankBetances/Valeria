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
  /** Tinte suave del bloque: es el FONDO de la tarjeta. */
  accentBg: string;
  /** Color pleno del bloque: placa del icono y relleno de la barra. */
  accentFg: string;
  /** Una línea de qué trabaja el bloque. Dos líneas como mucho. */
  description?: string;
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
  icon, title, accentBg, accentFg, description, onPress,
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
      <Animated.View style={[s.card, { backgroundColor: accentBg, transform: [{ scale }] }]}>
        <View style={s.topRow}>
          <View style={[s.iconPlate, { backgroundColor: accentFg }]}>
            <BlockIcon name={icon} color="#ffffff" size={24} />
          </View>
          {/* Píldora blanca con la cifra en tinta, no en el color del bloque.
              Teñida no llegaba al contraste AA en ninguno de los seis: el
              naranja de Lenguaje se quedaba en 2,8 y el turquesa en 3,1. El
              color de la tarjeta ya lo ponen el fondo, el icono y la barra. */}
          {!!meta && (
            <View style={s.badgePill}>
              <Text style={s.badgeTxt} numberOfLines={1}>{meta}</Text>
            </View>
          )}
        </View>

        {/* Título y descripción reservan JUNTOS cuatro líneas. Reservarlas en el
            título dejaba el aire entre el título y lo de abajo; así queda al
            final del bloque de texto, donde se lee como separación. */}
        <View style={s.textBlock}>
          <Text style={s.title} numberOfLines={2}>{title}</Text>
          {!!description && <Text style={s.desc} numberOfLines={2}>{description}</Text>}
        </View>

        {pct != null ? (
          <View style={s.track}>
            <View style={[s.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: accentFg }]} />
          </View>
        ) : (
          <View style={s.spacerTrack} />
        )}
      </Animated.View>
    </Pressable>
  );
});

ValeriaBlockTile.displayName = 'ValeriaBlockTile';

const s = StyleSheet.create({
  press: {
    flex: 1,
  },

  // El fondo lo pone el color del bloque (accentBg). Seis tarjetas blancas con
  // un icono de color leían como una lista; con el tinte, cada bloque se
  // reconoce por su color desde el otro lado de la mesa.
  card: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.75)',
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
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.12)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },

  // Sin ancho máximo: el 52 % fijo raparía «5 escenarios» a «5 escen…», y un
  // dato a medias en la cuadrícula del hub no es un dato.
  badgePill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    flexShrink: 1,
    marginLeft: 8,
  },

  badgeTxt: {
    fontSize: 10.5,
    fontWeight: V.font.extrabold,
    letterSpacing: 0,
    color: V.color.textPrimary,
  },

  textBlock: {
    marginTop: 12,
    // Dos líneas de título + dos de descripción. Es lo que hace que todas las
    // tarjetas midan igual sin que la fila estire ninguna.
    minHeight: 73,
  },

  title: {
    fontSize: 15.5,
    lineHeight: 19.5,
    fontWeight: V.font.extrabold,
    color: V.color.textPrimary,
    letterSpacing: -0.2,
  },

  desc: {
    fontSize: 11.5,
    lineHeight: 14.5,
    fontWeight: V.font.semibold,
    color: V.color.textSecondary,
    marginTop: 5,
  },

  track: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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

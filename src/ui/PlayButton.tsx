// Botón de «empezar» de las filas de ejercicio: una pastilla redonda con lateral
// 3D (como el botón principal) y el icono del set propio. Va dentro de una fila
// que ya es pulsable, así que no recibe toques: la fila es el objetivo táctil.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlockIcon } from '../ValeriaBlockIcons';
import { V } from '../valeriaTheme';

interface Props {
  /** Color pleno del bloque: el de la cara del botón. */
  color?: string;
  /** Tinte suave del bloque. Se mantiene por compatibilidad de llamadas. */
  tint?: string;
  locked?: boolean;
}

export const PlayButton: React.FC<Props> = ({ color = V.color.primaryDark, locked = false }) => (
  <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants"
    style={[s.base, { backgroundColor: locked ? '#d6dddc' : color, borderBottomColor: locked ? '#b9c3c2' : 'rgba(0,0,0,0.22)' }]}>
    <BlockIcon name={locked ? 'lock' : 'play'} color={locked ? V.color.textSecondary : '#ffffff'} size={20} />
  </View>
);

const s = StyleSheet.create({
  base: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 5 },
});

export default PlayButton;

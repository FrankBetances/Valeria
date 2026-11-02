// Botón de «empezar» de las filas de ejercicio: el Button de React Native
// Reusables (variante secondary, tamaño icon) con el icono del set propio.
// Va dentro de una fila que ya es pulsable, así que no recibe toques: la fila
// es el objetivo táctil y el botón es su señal visual.
import React from 'react';
import { View } from 'react-native';
import { Button } from '../components/ui/button';
import { BlockIcon } from '../ValeriaBlockIcons';
import { V } from '../valeriaTheme';

interface Props {
  /** Color pleno del bloque: el del icono. */
  color?: string;
  /** Tinte suave del bloque: el de la placa. */
  tint?: string;
  locked?: boolean;
}

export const PlayButton: React.FC<Props> = ({ color = V.color.primaryDark, tint = V.color.primaryLight, locked = false }) => (
  <View pointerEvents="none" accessible={false} importantForAccessibility="no-hide-descendants">
    <Button variant="secondary" size="icon" className="h-11 w-11 rounded-xl shadow-none"
      style={{ backgroundColor: locked ? '#f1f5f4' : tint }}>
      <BlockIcon name={locked ? 'lock' : 'play'} color={locked ? V.color.textSecondary : color} size={18} />
    </Button>
  </View>
);

export default PlayButton;

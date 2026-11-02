// Botón de «empezar» de las filas de ejercicio. Un solo estilo en todos los
// módulos: placa suave con el icono en el color del bloque. Sustituye a las
// placas macizas de Audición/Lenguaje/TEA/Dislexia y al «▶» de texto de Pares y
// Semántica, que era un glifo del sistema y no un icono del set (regla 5).
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { V } from '../valeriaTheme';
import { BlockIcon } from '../ValeriaBlockIcons';

interface Props {
  /** Color pleno del bloque: el del icono. */
  color?: string;
  /** Tinte suave del bloque: el de la placa. */
  tint?: string;
  locked?: boolean;
}

export const PlayButton: React.FC<Props> = ({ color = V.color.primaryDark, tint = V.color.primaryLight, locked = false }) => (
  <View style={[s.plate, { backgroundColor: locked ? '#f1f5f4' : tint }]}>
    <BlockIcon name={locked ? 'lock' : 'play'} color={locked ? V.color.textSecondary : color} size={18} />
  </View>
);

const s = StyleSheet.create({
  plate: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});

export default PlayButton;

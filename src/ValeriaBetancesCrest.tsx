// ============================================================================
// Valeria+ · Emblema Oficial del Dr. Frank Betances
//
// Dos cuervos enfrentados sobre una llave antigua ornamentada dentro de un
// anillo blanco fino. Acredita la autoría médica y científica del
// Dr. Frank Betances (Otorrinolaringólogo infantil) en la pantalla de Créditos.
// Renderiza el activo maestro transparente de alta resolución para máxima
// nitidez en densidades retina, móvil y web.
// ============================================================================
import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

const crestAsset = require('../assets/dr-betances-crest.png');

interface Props {
  size?: number;
  style?: StyleProp<ImageStyle>;
  /**
   * Texto para el lector de pantalla, del catálogo de i18n. Sin él el emblema
   * es decorativo: dentro de la tarjeta del autor, quien anuncia el nombre y
   * la especialidad es la tarjeta, y repetirlo aquí duplica el locutado.
   */
  label?: string;
}

export const ValeriaBetancesCrest: React.FC<Props> = ({ size = 112, style, label }) => {
  return (
    <Image
      source={crestAsset}
      style={[{ width: size, height: size, resizeMode: 'contain' }, style]}
      accessibilityRole="image"
      accessibilityLabel={label}
      accessibilityElementsHidden={!label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    />
  );
};

export default ValeriaBetancesCrest;

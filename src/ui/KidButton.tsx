// Botón principal del niño: botón 3D que se hunde al pulsarlo
// (rcaferati/react-native-awesome-button, MIT) con vibración corta (expo-haptics).
// Uno por pantalla, siempre abajo y a todo el ancho (plan §2, regla 1).
//
// Un toque muy rápido (el de un niño) puede soltar antes de que el botón
// registre la pulsación, y entonces su onPress no salta. Por eso la acción se
// engancha también al onPress del Pressable de debajo, con un seguro para que
// solo se dispare una vez por toque.
import React, { useRef } from 'react';
import AwesomeButton from 'react-native-really-awesome-button/lib/module/Button';
import * as Haptics from 'expo-haptics';
import { FONT } from './fonts';

interface Props {
  label: string;
  onPress: () => void;
  /** Cara del botón. Por defecto, el amarillo sol de la marca. */
  color?: string;
  /** Lateral 3D, más oscuro que la cara. */
  depth?: string;
  textColor?: string;
  accessibilityLabel?: string;
}

export const KidButton: React.FC<Props> = ({ label, onPress, color = '#ffd23f', depth = '#e0a800', textColor = '#3b2a00', accessibilityLabel }) => {
  const fired = useRef(false);
  const fire = () => {
    if (fired.current) return;
    fired.current = true;
    setTimeout(() => { fired.current = false; }, 700);
    onPress();
  };
  return (
    <AwesomeButton
      stretch
      height={68}
      raiseLevel={7}
      borderRadius={24}
      backgroundColor={color}
      backgroundDarker={depth}
      backgroundShadow="rgba(0,0,0,0.12)"
      textColor={textColor}
      textSize={24}
      textFontFamily={FONT.display}
      springRelease
      dangerouslySetPressableProps={{ accessibilityRole: 'button', accessibilityLabel: accessibilityLabel ?? label, onPress: fire }}
      onPressIn={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
      onPress={fire}
    >
      {label}
    </AwesomeButton>
  );
};

export default KidButton;

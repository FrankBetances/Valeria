// Celebración de fin de sesión con las animaciones de diseño de Reanimated 3
// (software-mansion/react-native-reanimated, MIT): la tarjeta entra con muelle
// y las estrellas caen escalonadas. ReduceMotion.System respeta la opción
// «reducir movimiento» del teléfono: con ella activada, todo aparece sin más.
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion, ZoomIn } from 'react-native-reanimated';
import { BlockIcon } from '../ValeriaBlockIcons';

const STARS = 3;

export const Celebration: React.FC<{ children: React.ReactNode; stars?: boolean }> = ({ children, stars = true }) => (
  <Animated.View entering={ZoomIn.springify().damping(14).reduceMotion(ReduceMotion.System)}>
    {stars && (
      <View className="mb-1 flex-row justify-center gap-2" pointerEvents="none">
        {Array.from({ length: STARS }, (_, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(180 + i * 120).springify().reduceMotion(ReduceMotion.System)}>
            <BlockIcon name="level" color="#f5a623" size={28} />
          </Animated.View>
        ))}
      </View>
    )}
    {children}
  </Animated.View>
);

export default Celebration;

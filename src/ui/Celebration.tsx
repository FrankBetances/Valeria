// Celebración de fin de sesión: explosión de confeti con el Atlas de Skia
// (AlirezaHadjar/react-native-fast-confetti, MIT), estrellas que caen
// escalonadas (Reanimated 4) y vibración de acierto (expo-haptics).
// ReduceMotion.System respeta «reducir movimiento» del teléfono.
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion, ZoomIn } from 'react-native-reanimated';
import { Confetti } from 'react-native-fast-confetti';
import * as Haptics from 'expo-haptics';
import { BlockIcon } from '../ValeriaBlockIcons';

const STARS = 3;
const COLORS = ['#ffd23f', '#00c4be', '#ff6b9a', '#7c5cff', '#4cd964', '#ff9f1c'];

export const Celebration: React.FC<{ children: React.ReactNode; stars?: boolean }> = ({ children, stars = true }) => {
  useEffect(() => { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }, []);
  return (
    <View>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Confetti autoplay count={120} colors={COLORS} />
      </View>
      <Animated.View entering={ZoomIn.springify().damping(12).reduceMotion(ReduceMotion.System)}>
        {stars && (
          <View style={s.stars} pointerEvents="none">
            {Array.from({ length: STARS }, (_, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(180 + i * 140).springify().reduceMotion(ReduceMotion.System)}
                style={i === 1 ? s.bigStar : undefined}>
                <BlockIcon name="level" color="#ffb800" size={i === 1 ? 44 : 32} />
              </Animated.View>
            ))}
          </View>
        )}
        {children}
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  stars: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 10, marginBottom: 6 },
  bigStar: { marginBottom: 6 },
});

export default Celebration;

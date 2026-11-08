// Ficha de respuesta que reacciona (reforma 8/11/2026), la misma gramática que
// Pares de sonidos: entra en cascada; acierto → crece, verde, check y estrellas;
// fallo → tiembla en naranja; `hint` → la correcta late para guiar (solo donde
// el ejercicio ya enseñaba la respuesta). Reanimated 4 + Lucide.
import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing, FadeInUp, ReduceMotion, ZoomIn, useAnimatedStyle, useReducedMotion, useSharedValue,
  withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { Check, Star } from 'lucide-react-native';

const OK = '#12a36b';
const WARN = '#e08a00';

export const ReactiveTile: React.FC<{
  index: number; ok: boolean; bad: boolean; hint?: boolean;
  style?: StyleProp<ViewStyle>; children: React.ReactNode;
}> = ({ index, ok, bad, hint = false, style, children }) => {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const halo = useSharedValue(0);
  useEffect(() => {
    scale.value = ok && !reduced ? withSequence(withSpring(1.1, { damping: 6 }), withSpring(1.03)) : withSpring(1);
  }, [ok, reduced, scale]);
  useEffect(() => {
    if (bad && !reduced) shake.value = withSequence(withTiming(-10, { duration: 60 }), withTiming(10, { duration: 80 }), withTiming(-6, { duration: 70 }), withTiming(0, { duration: 60 }));
  }, [bad, reduced, shake]);
  useEffect(() => {
    halo.value = hint && !reduced
      ? withRepeat(withSequence(withTiming(1, { duration: 650, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 650 })), -1)
      : withTiming(hint ? 0.7 : 0, { duration: 200 });
  }, [hint, reduced, halo]);
  const body = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: shake.value }] }));
  const ring = useAnimatedStyle(() => ({ opacity: halo.value }));
  return (
    <Animated.View entering={ZoomIn.delay(Math.min(index, 8) * 70).springify().damping(13).reduceMotion(ReduceMotion.System)} style={style}>
      <Animated.View pointerEvents="none" style={[s.halo, ring]} />
      <Animated.View style={[body, ok && s.okWrap, bad && s.badWrap]}>
        {children}
        {ok && (
          <Animated.View entering={ZoomIn.springify().damping(9).reduceMotion(ReduceMotion.System)} style={[s.badge, { backgroundColor: OK }]}>
            <Check size={16} color="#ffffff" strokeWidth={3.5} />
          </Animated.View>
        )}
      </Animated.View>
      {ok && (
        <View style={s.stars} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} entering={FadeInUp.delay(100 + i * 100).springify().reduceMotion(ReduceMotion.System)}>
              <Star size={20} color="#f5b301" fill="#ffd23f" strokeWidth={2} />
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const s = StyleSheet.create({
  halo: { position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, borderRadius: 24, borderWidth: 3, borderColor: WARN },
  okWrap: { borderRadius: 20, shadowColor: OK, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  badWrap: {},
  badge: { position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stars: { position: 'absolute', top: -14, alignSelf: 'center', flexDirection: 'row', gap: 2 },
});

export default ReactiveTile;

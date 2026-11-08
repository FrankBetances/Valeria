// Movimiento común del rediseño (Reanimated 4, MIT). Todo respeta «reducir
// movimiento» del teléfono (ReduceMotion.System / useReducedMotion).
import React, { useEffect } from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing, FadeInDown, ReduceMotion, useAnimatedProps, useAnimatedStyle, useReducedMotion,
  useSharedValue, withDelay, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

/** Entrada en cascada: cada fila llega un poco después que la anterior. */
export const enterAt = (index = 0) =>
  FadeInDown.delay(Math.min(index, 10) * 55).duration(380).reduceMotion(ReduceMotion.System);

/** Respiración suave (Lúa en la cabecera): sube 3 px y vuelve, sin parar. */
export const Breathe: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({ children, style }) => {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    y.value = withRepeat(withSequence(
      withTiming(-3, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
    ), -1);
  }, [reduced, y]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
};

const ACircle = Animated.createAnimatedComponent(Circle);

/** Anillo de avance que se dibuja al aparecer. */
export const ProgressRing: React.FC<{ size: number; stroke?: number; progress: number; color: string; track?: string; children?: React.ReactNode }> = ({
  size, stroke = 4, progress, color, track = 'rgba(0,0,0,0.08)', children,
}) => {
  const reduced = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(reduced ? progress : 0);
  useEffect(() => {
    const v = Math.max(0, Math.min(1, progress));
    p.value = reduced ? v : withDelay(250, withTiming(v, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [progress, reduced, p]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - p.value) }));
  return (
    <Animated.View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <ACircle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${c} ${c}`} animatedProps={props}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      {children}
    </Animated.View>
  );
};

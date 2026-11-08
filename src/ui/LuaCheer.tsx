// Lúa responde a cada acierto y a cada fallo, en TODOS los ejercicios (F12/R17).
// Se engancha en praisePhrase/almostPhrase de valeriaVoice: cada vez que la app
// locuta un acierto o un ánimo, Lúa aparece con el mismo texto en un bocadillo,
// bota en el acierto y se balancea en el fallo, y se va sola. Una sola pieza
// montada en AppNavigator; no hay que tocar cada pantalla.
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  ReduceMotion, useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming,
  ZoomIn, FadeOut,
} from 'react-native-reanimated';
import { CatPixel } from '../ValeriaCatPixel';
import { V } from '../valeriaTheme';
import { FONT } from './fonts';

import { onLuaCheer, LuaCheer as Cheer } from '../luaCheerBus';

export const LuaCheerOverlay: React.FC = () => {
  const [cheer, setCheer] = useState<Cheer | null>(null);
  const reduced = useReducedMotion();
  const y = useSharedValue(0);
  const r = useSharedValue(0);

  useEffect(() => {
    return onLuaCheer((c) => setCheer(c));
  }, []);

  useEffect(() => {
    if (!cheer) return;
    if (!reduced) {
      if (cheer.ok) y.value = withSequence(withTiming(-18, { duration: 160 }), withSpring(0, { damping: 6 }));
      else r.value = withSequence(withTiming(-8, { duration: 90 }), withTiming(8, { duration: 120 }), withTiming(-5, { duration: 110 }), withTiming(0, { duration: 100 }));
    }
    const h = setTimeout(() => setCheer((cur) => (cur?.at === cheer.at ? null : cur)), 1800);
    return () => clearTimeout(h);
  }, [cheer, reduced, y, r]);

  const cat = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { rotate: `${r.value}deg` }] }));
  if (!cheer) return null;
  const color = cheer.ok ? V.color.primaryDark : '#b07400';
  return (
    <View style={s.layer} pointerEvents="none">
      <Animated.View key={cheer.at} entering={ZoomIn.springify().damping(14).reduceMotion(ReduceMotion.System)}
        exiting={FadeOut.duration(220)} style={[s.card, { borderColor: color }]}
        accessibilityLiveRegion="polite">
        <Animated.View style={cat}><CatPixel size={64} pose="head" /></Animated.View>
        <View style={[s.bubble, { backgroundColor: cheer.ok ? V.color.primaryLight : '#fff4d6' }]}>
          <Text style={[s.txt, { color: V.color.textPrimary }]} numberOfLines={2}>{cheer.text}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, bottom: 110, alignItems: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff',
    borderRadius: 26, borderWidth: 2, borderBottomWidth: 6, paddingVertical: 10, paddingLeft: 12, paddingRight: 16,
    maxWidth: 360, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, flexShrink: 1 },
  txt: { fontFamily: FONT.display, fontSize: 20, lineHeight: 24 },
});

export default LuaCheerOverlay;

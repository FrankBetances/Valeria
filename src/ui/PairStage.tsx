// Escenario del ensayo de Pares de sonidos (reforma 8/11/2026).
// Sustituye la tira de fases, las dos fichas quietas, la tarjeta «La app dice»
// y los botones de veredicto sueltos por UNA escena:
//  · Recorrido: Lúa camina por las piedras del ensayo (orientación: cuánto falta).
//  · Bocadillo de Lúa con la consigna y su botón de repetir.
//  · Las dos fichas entran con muelle; la palabra objetivo late mientras la app
//    habla; en el veredicto se toca la ficha de lo que dijo el niño.
//  · Acierto: la ficha objetivo crece en verde y suben estrellas.
//    Fallo: la ficha tocada tiembla y la objetivo se marca para volver a oír.
// Reanimated 4 (MIT) e iconos Lucide (ISC). Respeta «reducir movimiento».
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, FadeInUp, ReduceMotion, ZoomIn, useAnimatedStyle, useReducedMotion, useSharedValue,
  withDelay, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { Check, Ear, Star, Volume2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CatPixel } from '../ValeriaCatPixel';
import { FichaVisual } from '../ValeriaPictograms';
import { V } from '../valeriaTheme';
import { FONT } from './fonts';

type Side = 'target' | 'foil';
export type StageStep = 'say' | 'ready' | 'listen' | 'judge' | 'success' | 'correction' | 'assist';
interface Word { word: string; emoji?: string; pic?: any }

const OK = '#12a36b';
const WARN = '#e08a00';

/** Recorrido del ensayo: piedras y Lúa que avanza de una a otra. */
export const TrialTrack: React.FC<{ index: number; total: number }> = ({ index, total }) => {
  const reduced = useReducedMotion();
  const [w, setW] = React.useState(0);
  const x = useSharedValue(0);
  const hop = useSharedValue(0);
  const step = total > 1 ? w / (total - 1) : 0;
  useEffect(() => {
    const target = Math.min(index, total - 1) * step;
    x.value = reduced ? target : withSpring(target, { damping: 14, stiffness: 120 });
    if (!reduced) hop.value = withSequence(withTiming(-10, { duration: 160 }), withSpring(0, { damping: 7 }));
  }, [index, step, reduced, total, x, hop]);
  const cat = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: hop.value }] }));
  return (
    <View style={t.wrap} accessibilityRole="progressbar" accessibilityValue={{ now: index + 1, min: 1, max: total }}>
      <View style={t.rail} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        <View style={t.line} />
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[t.stone, { left: i * step - 9 }, i < index && t.stoneDone, i === index && t.stoneNow]}>
            {i < index && <Check size={11} color="#ffffff" strokeWidth={3.5} />}
          </View>
        ))}
        <Animated.View style={[t.cat, cat]}><CatPixel size={34} pose="head" /></Animated.View>
      </View>
      <Text style={t.count}>{`${Math.min(index + 1, total)} / ${total}`}</Text>
    </View>
  );
};

const Card: React.FC<{
  w: Word; side: Side; step: StageStep; foilHeard: boolean; picked: Side | null; delay: number;
  onPick?: (s: Side) => void;
}> = ({ w, side, step, foilHeard, picked, delay, onPick }) => {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const shake = useSharedValue(0);
  const halo = useSharedValue(0);
  const isTarget = side === 'target';
  const speaking = isTarget && (step === 'say' || step === 'ready');
  const win = isTarget && step === 'success';
  const wrong = !isTarget && step === 'correction' && foilHeard;
  const hint = isTarget && step === 'correction';
  const tappable = step === 'judge' && !!onPick;

  useEffect(() => {
    if (reduced) { halo.value = speaking || hint ? 0.6 : 0; return; }
    halo.value = speaking || hint
      ? withRepeat(withSequence(withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 700 })), -1)
      : withTiming(0, { duration: 200 });
  }, [speaking, hint, reduced, halo]);
  useEffect(() => {
    if (win && !reduced) scale.value = withSequence(withSpring(1.1, { damping: 6 }), withSpring(1.04));
    else scale.value = withSpring(1);
  }, [win, reduced, scale]);
  useEffect(() => {
    if (wrong && !reduced) shake.value = withSequence(withTiming(-12, { duration: 60 }), withTiming(12, { duration: 80 }), withTiming(-8, { duration: 70 }), withTiming(6, { duration: 60 }), withTiming(0, { duration: 60 }));
  }, [wrong, reduced, shake]);

  const body = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateX: shake.value }] }));
  const ring = useAnimatedStyle(() => ({ opacity: halo.value, transform: [{ scale: 1 + halo.value * 0.06 }] }));
  const border = win ? OK : wrong ? WARN : hint || speaking ? V.color.primary : picked === side ? V.color.primaryDark : '#e7dfd0';

  return (
    <Animated.View entering={ZoomIn.delay(delay).springify().damping(13).reduceMotion(ReduceMotion.System)} style={c.slot}>
      <Animated.View pointerEvents="none" style={[c.halo, { borderColor: hint ? WARN : V.color.primary }, ring]} />
      <Animated.View style={body}>
        <Pressable
          disabled={!tappable}
          onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPick?.(side); }}
          style={[c.card, { borderColor: border }, win && c.cardWin, wrong && c.cardWrong, tappable && c.cardTap]}
          accessibilityRole={tappable ? 'button' : 'image'}
          accessibilityLabel={w.word}
        >
          <FichaVisual word={w.word} emoji={w.emoji ?? ''} pic={w.pic} size={70} />
          <Text style={c.word}>{w.word}</Text>
          {speaking && <View style={[c.badge, { backgroundColor: V.color.primary }]}><Volume2 size={16} color="#ffffff" strokeWidth={2.6} /></View>}
          {hint && <View style={[c.badge, { backgroundColor: WARN }]}><Ear size={16} color="#ffffff" strokeWidth={2.6} /></View>}
          {win && (
            <Animated.View entering={ZoomIn.springify().damping(9).reduceMotion(ReduceMotion.System)} style={[c.badge, { backgroundColor: OK }]}>
              <Check size={18} color="#ffffff" strokeWidth={3.5} />
            </Animated.View>
          )}
        </Pressable>
      </Animated.View>
      {win && (
        <View style={c.stars} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <Animated.View key={i} entering={FadeInUp.delay(120 + i * 110).springify().reduceMotion(ReduceMotion.System)}>
              <Star size={26} color="#f5b301" fill="#ffd23f" strokeWidth={2} />
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

export const PairStage: React.FC<{
  trialKey: string | number;
  target: Word; foil: Word; leftIsTarget: boolean;
  step: StageStep; foilHeard: boolean;
  prompt: string; promptLabel: string; question: string;
  onPick: (s: Side) => void; onRepeat: () => void; repeatLabel: string;
}> = ({ trialKey, target, foil, leftIsTarget, step, foilHeard, prompt, promptLabel, question, onPick, onRepeat, repeatLabel }) => {
  const [picked, setPicked] = React.useState<Side | null>(null);
  useEffect(() => { setPicked(null); }, [trialKey]);
  const order: Side[] = leftIsTarget ? ['target', 'foil'] : ['foil', 'target'];
  const judge = step === 'judge';
  return (
    <View>
      <Animated.View key={`b-${trialKey}-${judge}`} entering={FadeInUp.duration(300).reduceMotion(ReduceMotion.System)} style={st.bubbleRow}>
        <View style={st.luaFace}><CatPixel size={46} pose="head" /></View>
        <View style={st.bubble}>
          <Text style={st.bubbleKicker}>{judge ? '' : promptLabel}</Text>
          <Text style={st.bubbleTxt}>{judge ? question : `“${prompt}”`}</Text>
        </View>
        {!judge && (
          <Pressable onPress={onRepeat} style={st.repeat} accessibilityRole="button" accessibilityLabel={repeatLabel} hitSlop={8}>
            <Volume2 size={22} color={V.color.primaryDark} strokeWidth={2.4} />
          </Pressable>
        )}
      </Animated.View>
      <View key={`c-${trialKey}`} style={st.cards}>
        {order.map((side, i) => (
          <Card key={side} side={side} w={side === 'target' ? target : foil} step={step} foilHeard={foilHeard}
            picked={picked} delay={i * 90} onPick={(s) => { setPicked(s); onPick(s); }} />
        ))}
      </View>
    </View>
  );
};

const t = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#ffffff', borderRadius: 20, borderWidth: 1, borderColor: '#ece5d8', paddingVertical: 14, paddingHorizontal: 18, marginBottom: 14 },
  rail: { flex: 1, height: 62, marginHorizontal: 9 },
  line: { position: 'absolute', left: 0, right: 0, bottom: 7, height: 4, borderRadius: 2, backgroundColor: '#ece5d8' },
  stone: { position: 'absolute', bottom: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: '#ffffff', borderWidth: 3, borderColor: '#ddd3c2', alignItems: 'center', justifyContent: 'center' },
  stoneDone: { backgroundColor: OK, borderColor: OK },
  stoneNow: { borderColor: V.color.primaryDark },
  cat: { position: 'absolute', left: -17, top: 0 },
  count: { fontFamily: FONT.display, fontSize: 18, color: V.color.textPrimary },
});
const c = StyleSheet.create({
  slot: { flex: 1, alignItems: 'center' },
  halo: { position: 'absolute', top: -5, left: -5, right: -5, bottom: -5, borderRadius: 30, borderWidth: 3 },
  card: { alignSelf: 'stretch', minWidth: 150, alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 26, borderWidth: 3, borderBottomWidth: 7, paddingVertical: 20, paddingHorizontal: 10 },
  cardTap: { borderColor: V.color.primaryDark },
  cardWin: { backgroundColor: '#e8f8f0' },
  cardWrong: { backgroundColor: '#fff4e0' },
  word: { fontFamily: FONT.display, fontSize: 26, lineHeight: 30, color: V.color.textPrimary, marginTop: 10, textTransform: 'capitalize' },
  badge: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stars: { position: 'absolute', top: -18, flexDirection: 'row', gap: 4 },
});
const st = StyleSheet.create({
  bubbleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  luaFace: { width: 58, height: 58, borderRadius: 18, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  bubble: { flex: 1, backgroundColor: '#ffffff', borderRadius: 20, borderTopLeftRadius: 6, borderWidth: 2, borderColor: V.color.primary, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleKicker: { fontFamily: FONT.bodyBlack, fontSize: 12, letterSpacing: 1, color: V.color.primaryDark, textTransform: 'uppercase' },
  bubbleTxt: { fontFamily: FONT.display, fontSize: 19, lineHeight: 24, color: V.color.textPrimary },
  repeat: { width: 48, height: 48, borderRadius: 24, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cards: { flexDirection: 'row', gap: 14, paddingTop: 10 },
});

export default PairStage;

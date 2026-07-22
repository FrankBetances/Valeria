// ============================================================================
// Valeria+ · Cápsulas TPR (V5.0) — Total Physical Response
// Mini-bloques de "escucha y muévete" entre ejercicios: la app dicta cada
// orden en voz alta (síntesis de voz) y el niño responde con TODO el cuerpo.
// El tutor confirma cada orden cumplida; sustituyen a las antiguas pausas
// activas y añaden el componente auditivo-motor del método TPR de Asher.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { V } from './valeriaTheme';
import { speakToChild, stopSpeaking } from './valeriaVoice';
import { TprCapsule, TPR_CAPSULES, pickTprCapsule } from './valeriaTprBank';
import { SESSION_CONTINUE_PHRASE } from './valeriaPhraseBank';
import { SESSION_CONTINUE_PHRASE_GL } from './valeriaContentGl';
import { SESSION_CONTINUE_PHRASE_EU } from './valeriaContentEu';
import { getLocale } from './valeriaLocale';

// El banco de cápsulas vive en valeriaTprBank (módulo PURO, enumerable por el
// corpus de voz en build-time). Se re-exporta para los imports históricos.
export { TPR_CAPSULES, pickTprCapsule } from './valeriaTprBank';
export type { TprCommand, TprCapsule } from './valeriaTprBank';

// ----------------------------------------------------------------------------
// Overlay de cápsula: dicta cada orden con TTS y avanza al confirmarla.
// ----------------------------------------------------------------------------
export const ValeriaTPRCapsuleOverlay: React.FC<{
  capsule: TprCapsule;
  onDone: () => void;
  onSkip: () => void;
}> = ({ capsule, onDone, onSkip }) => {
  const [step, setStep] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;
  const cmd = capsule.commands[step];
  const last = step + 1 >= capsule.commands.length;

  // La app "dicta" la orden actual (y la primera al abrir la cápsula).
  useEffect(() => {
    speakToChild(cmd.text);
  }, [cmd]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => () => stopSpeaking(), []);

  const next = () => {
    if (last) {
      { const l = getLocale(); speakToChild(l === 'gl' ? SESSION_CONTINUE_PHRASE_GL : l === 'eu' ? SESSION_CONTINUE_PHRASE_EU : SESSION_CONTINUE_PHRASE); }
      onDone();
    } else {
      setStep(step + 1);
    }
  };

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });

  return (
    <View style={s.overlay}>
      <View style={s.card}>
        <Text style={s.kicker}>🧩 CÁPSULA TPR · ESCUCHA Y MUÉVETE</Text>
        <Text style={s.title}>{capsule.icon} {capsule.title}</Text>
        <Text style={s.sub}>La app dice la orden en voz alta y el niño responde con el cuerpo (Total Physical Response).</Text>

        <Animated.Text style={[s.emoji, { transform: [{ scale }] }]}>{cmd.emoji}</Animated.Text>
        <Text style={s.cmd}>“{cmd.text}”</Text>

        <View style={s.dots}>
          {capsule.commands.map((_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: i < step ? V.color.primary : i === step ? '#f59e0b' : '#e5e7eb' }]} />
          ))}
        </View>

        <View style={s.row}>
          <Pressable onPress={() => speakToChild(cmd.text)} style={s.repeatBtn} accessibilityRole="button" accessibilityLabel="Repetir la orden en voz alta">
            <Text style={s.repeatBtnTxt}>🔊 Repetir orden</Text>
          </Pressable>
          <Pressable onPress={next} style={s.okBtn} accessibilityRole="button">
            <Text style={s.okBtnTxt}>{last ? '✅ ¡Hecho! Seguimos →' : '✅ ¡Lo hizo!'}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => { stopSpeaking(); onSkip(); }} accessibilityRole="button">
          <Text style={s.skip}>Saltar esta vez</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ----------------------------------------------------------------------------
const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,18,32,.6)', alignItems: 'center', justifyContent: 'center', padding: 26 },
  card: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 26, padding: 22, alignItems: 'center' },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.1, color: '#f59e0b' },
  title: { fontSize: 20, fontWeight: '800', color: V.color.textPrimary, marginTop: 10, textAlign: 'center' },
  sub: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, marginTop: 6, lineHeight: 16, textAlign: 'center' },
  emoji: { fontSize: 70, marginTop: 14 },
  cmd: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary, marginTop: 10, lineHeight: 23, textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 7, marginTop: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  row: { flexDirection: 'row', gap: 9, alignSelf: 'stretch', marginTop: 18 },
  repeatBtn: { flex: 1, backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  repeatBtnTxt: { color: V.color.primaryDark, fontSize: 13, fontWeight: '800' },
  okBtn: { flex: 1.2, backgroundColor: '#f59e0b', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  okBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  skip: { marginTop: 13, fontSize: 12.5, fontWeight: '700', color: V.color.textMuted },
});

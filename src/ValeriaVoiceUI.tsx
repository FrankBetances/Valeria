// ============================================================================
// Valeria+ · Componentes de Voz (V6.0)
//   · <SpeakButton />      — píldora 🔊 que lee un texto con la voz de la app.
//   · <MicPracticeCard />  — juego "¡Ahora tú!": el niño repite la palabra
//     objetivo al micrófono y la app valora el intento con estrellas.
//   · <TurnPhaseStrip />   — mapa del turno (Escucha → Habla → Veredicto →
//     Misión) para que la familia sepa siempre en qué punto del ensayo está.
// Si el reconocimiento de voz no está disponible (p. ej. Expo Go), la tarjeta
// de micrófono muestra una nota discreta en lugar del juego.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { V } from './valeriaTheme';
import {
  speak, speakToChild, speakWordSlow, stopSpeaking,
  asrSupported, startListening, stopListening, releaseListening, matchTarget, MatchLevel,
} from './valeriaVoice';

// ----------------------------------------------------------------------------
// Botón altavoz: lee `text` en voz alta. `voice` elige el tono.
// ----------------------------------------------------------------------------
export const SpeakButton: React.FC<{
  text: string;
  label?: string;
  voice?: 'tutor' | 'child' | 'slow';
  compact?: boolean;
}> = ({ text, label = 'Escuchar', voice = 'tutor', compact = false }) => {
  const onPress = () => {
    if (voice === 'child') speakToChild(text);
    else if (voice === 'slow') speakWordSlow(text);
    else speak(text);
  };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Escuchar: ${text}`}
      style={({ pressed }) => [s.speakPill, compact && s.speakPillCompact, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
    >
      <Text style={{ fontSize: compact ? 12 : 14 }}>🔊</Text>
      {!compact && <Text style={s.speakPillTxt}>{label}</Text>}
    </Pressable>
  );
};

// ----------------------------------------------------------------------------
// Mapa del turno: chips con las fases del ensayo y la fase activa resaltada.
// Responde a la queja de los testers de que "no se sabe qué toca ahora".
// ----------------------------------------------------------------------------
const DEFAULT_PHASES = [
  { icon: '🔊', label: 'Escucha' },
  { icon: '🎤', label: 'Repite' },
  { icon: '🏅', label: 'Veredicto' },
  { icon: '🏃', label: 'Misión' },
];

export const TurnPhaseStrip: React.FC<{
  active: number;
  phases?: { icon: string; label: string }[];
}> = ({ active, phases = DEFAULT_PHASES }) => (
  <View style={s.phaseStrip} accessibilityRole="progressbar" accessibilityLabel={`Fase actual: ${phases[active]?.label ?? ''}`}>
    {phases.map((ph, i) => (
      <React.Fragment key={ph.label}>
        {i > 0 && <Text style={s.phaseArrow}>›</Text>}
        <View style={[s.phaseChip, i === active && s.phaseChipOn, i < active && s.phaseChipDone]}>
          <Text style={{ fontSize: 13, opacity: i === active ? 1 : 0.55 }}>{i < active ? '✓' : ph.icon}</Text>
          <Text style={[s.phaseChipTxt, i === active && s.phaseChipTxtOn]}>{ph.label}</Text>
        </View>
      </React.Fragment>
    ))}
  </View>
);

// ----------------------------------------------------------------------------
// Juego de micrófono: escucha al niño y compara con la palabra objetivo.
// ----------------------------------------------------------------------------
type MicPhase = 'idle' | 'listening' | 'scored' | 'error';

const VERDICT: Record<MatchLevel, { icon: string; title: string; sub: string; say: string }> = {
  2: { icon: '🎉', title: '¡Lo dijo genial!', sub: 'La app entendió la palabra objetivo.', say: '¡Muy bien! ¡Lo has dicho genial!' },
  1: { icon: '💪', title: '¡Casi casi!', sub: 'Se parece mucho. Repetid el modelo y probad otra vez.', say: '¡Casi! Vamos a intentarlo otra vez.' },
  0: { icon: '👂', title: 'Otra vez juntos', sub: 'Escuchad la palabra despacio y repetid a la vez.', say: 'Vamos a escucharla otra vez.' },
};

export const MicPracticeCard: React.FC<{ target: string; prompt?: string }> = ({ target, prompt }) => {
  const [phase, setPhase] = useState<MicPhase>('idle');
  const [heard, setHeard] = useState('');
  const [score, setScore] = useState<MatchLevel>(0);
  const [errMsg, setErrMsg] = useState('');
  const pulse = useRef(new Animated.Value(0)).current;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopListening();
      releaseListening();
    };
  }, []);

  // Nueva palabra objetivo → juego a cero.
  useEffect(() => {
    setPhase('idle'); setHeard(''); setScore(0); setErrMsg('');
  }, [target]);

  useEffect(() => {
    if (phase !== 'listening') { pulse.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  if (!asrSupported()) {
    return (
      <View style={s.micUnavailable}>
        <Text style={{ fontSize: 14 }}>🎤</Text>
        <Text style={s.micUnavailableTxt}>
          El juego de micrófono se activa en la app instalada (APK). Mientras tanto, el niño puede repetir la palabra y tú valoras abajo.
        </Text>
      </View>
    );
  }

  const finishWith = (alternatives: string[]) => {
    if (!mounted.current) return;
    const lvl = matchTarget(alternatives, target);
    setHeard(alternatives[0] ?? '');
    setScore(lvl);
    setPhase('scored');
    speakToChild(VERDICT[lvl].say);
    if (lvl === 0) setTimeout(() => speakWordSlow(target), 1600);
  };

  const listen = async () => {
    if (phase === 'listening') { await stopListening(); return; }
    setPhase('listening'); setHeard(''); setErrMsg('');
    const ok = await startListening({
      onPartial: (t) => mounted.current && setHeard(t),
      onResult: finishWith,
      onError: (m) => {
        if (!mounted.current) return;
        setErrMsg(m); setPhase('error');
      },
    });
    if (!ok && mounted.current && phase !== 'error') setPhase('error');
  };

  const micScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const listening = phase === 'listening';

  return (
    <View style={s.micCard}>
      <Text style={s.micKicker}>🎤 JUEGO DE VOZ · ¡AHORA EL NIÑO!</Text>
      <Text style={s.micPrompt}>{prompt ?? `Pulsa el micro y que diga: “${target}”`}</Text>

      <View style={s.micRow}>
        <SpeakButton text={target} label="Oír modelo" voice="slow" />
        <Animated.View style={{ transform: [{ scale: micScale }] }}>
          <Pressable
            onPress={listen}
            accessibilityRole="button"
            accessibilityLabel={listening ? 'Dejar de escuchar' : 'Empezar a escuchar'}
            style={[s.micBtn, listening && s.micBtnOn]}
          >
            <Text style={{ fontSize: 26 }}>{listening ? '👂' : '🎤'}</Text>
          </Pressable>
        </Animated.View>
        <Text style={s.micState}>{listening ? 'Escuchando…' : 'Toca para hablar'}</Text>
      </View>

      {!!heard && (
        <View style={s.heardBox}>
          <Text style={s.heardLbl}>La app escuchó:</Text>
          <Text style={s.heardTxt}>“{heard}”</Text>
        </View>
      )}

      {phase === 'scored' && (
        <View style={[s.verdict, score === 2 ? s.verdictOk : score === 1 ? s.verdictAlmost : s.verdictRetry]}>
          <Text style={{ fontSize: 22 }}>{VERDICT[score].icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.verdictTitle}>{VERDICT[score].title}</Text>
            <Text style={s.verdictSub}>{VERDICT[score].sub}</Text>
          </View>
          <Text style={s.verdictStars}>{'★'.repeat(score + 1)}</Text>
        </View>
      )}

      {phase === 'error' && !!errMsg && (
        <View style={[s.verdict, s.verdictRetry]}>
          <Text style={{ fontSize: 18 }}>😅</Text>
          <Text style={[s.verdictSub, { flex: 1 }]}>{errMsg}</Text>
        </View>
      )}
    </View>
  );
};

// ----------------------------------------------------------------------------
const s = StyleSheet.create({
  speakPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 7 },
  speakPillCompact: { paddingHorizontal: 8, paddingVertical: 5 },
  speakPillTxt: { color: V.color.primaryDark, fontSize: 12.5, fontWeight: '800' },

  micCard: { backgroundColor: '#f5f0ff', borderWidth: 1.5, borderColor: '#ddccfa', borderRadius: 16, padding: 14, marginTop: 12 },
  micKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#6d3fc4' },
  micPrompt: { fontSize: 13.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 8, lineHeight: 19 },
  micRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 },
  micBtn: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#7c4fd0', alignItems: 'center', justifyContent: 'center', ...V.shadow.button },
  micBtnOn: { backgroundColor: '#ef4444' },
  micState: { flex: 1, fontSize: 12.5, fontWeight: '700', color: V.color.textSecondary },

  heardBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e9e2f7', borderRadius: 12, padding: 10, marginTop: 12 },
  heardLbl: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.4, color: V.color.textMuted },
  heardTxt: { fontSize: 16, fontWeight: '800', color: V.color.textPrimary, marginTop: 2 },

  verdict: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1, padding: 11, marginTop: 10 },
  verdictOk: { backgroundColor: V.color.successBg, borderColor: '#bfe9d4' },
  verdictAlmost: { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' },
  verdictRetry: { backgroundColor: '#fff', borderColor: V.color.border },
  verdictTitle: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },
  verdictSub: { fontSize: 11.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 1, lineHeight: 15 },
  verdictStars: { fontSize: 15, color: V.color.star, letterSpacing: 1 },

  micUnavailable: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#f8f9fb', borderWidth: 1, borderColor: V.color.border, borderRadius: 12, padding: 11, marginTop: 12 },
  micUnavailableTxt: { flex: 1, fontSize: 11.5, fontWeight: '600', color: V.color.textMuted, lineHeight: 15 },

  phaseStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 13, paddingVertical: 7, paddingHorizontal: 8, marginTop: 12 },
  phaseArrow: { fontSize: 12, fontWeight: '800', color: V.color.textMuted },
  phaseChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  phaseChipOn: { backgroundColor: V.color.primaryLight },
  phaseChipDone: { opacity: 0.7 },
  phaseChipTxt: { fontSize: 10.5, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.2 },
  phaseChipTxtOn: { color: V.color.primaryDark },
});

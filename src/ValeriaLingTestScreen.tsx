// ============================================================================
// Valeria+ · Test de Ling (V1)
// Comprobación auditiva PREVIA a los ejercicios de audición, solo para pacientes
// con audífonos o implante coclear. Concepto "Padres como Motor de Voz y
// Evaluación": NO hay micrófono ni reconocimiento de voz — el TUTOR produce cada
// sonido (tapándose la boca) y marca la respuesta del niño en una escala de 3.
//
// Flujo:
//   1. Pregunta previa: ¿usa audífonos / implante?
//        · No  → navega directo a los ejercicios (ExercisePlayer).
//        · Sí  → Test de Ling de 6 sonidos.
//   2. Por cada sonido (m, u, a, i, sh, s) el tutor lo produce y puntúa:
//        2 Identifica · 1 Detecta · 0 Sin respuesta.
//   3. Resultado + recomendación adaptada → Comenzar ejercicios.
//
// Persistencia: AsyncStorage (STORAGE_KEYS.ling). Recibe route.params (p.ej. { id })
// y los reenvía al Player para no romper el flujo de sesión.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { getLocale } from './valeriaLocale';
import { lingContentForLocale } from './valeriaLingContent';
// import logoWhite from '../../assets/valeria-logo-white.png';

type Phase = 'ask' | 'test' | 'done';

interface ScaleOpt { level: 0 | 1 | 2; title: string; desc: string; color: string; }

const SCALE: ScaleOpt[] = [
  { level: 2, title: 'Identifica',    desc: 'Repite o reconoce el sonido correctamente.', color: '#10b981' },
  { level: 1, title: 'Detecta',       desc: 'Reacciona o levanta la mano al oírlo.',       color: '#f59e0b' },
  { level: 0, title: 'Sin respuesta', desc: 'No reacciona al sonido.',                     color: '#ef4444' },
];

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const ValeriaLingTestScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const sessionParams = route?.params ?? undefined;
  // Contenido de la variedad activa: los 6 sonidos son universales; cambian las
  // consignas y pistas (registro es-DO · Quisqueya Habla, QH-2.4).
  const { sounds: SOUNDS, copy } = useRef(lingContentForLocale(getLocale())).current;
  const [phase, setPhase] = useState<Phase>('ask');
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const lockRef = useRef(false);

  // Animación de ondas (ripple) alrededor del sonido activo.
  const ripple = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (phase !== 'test') return;
    const loop = Animated.loop(
      Animated.timing(ripple, { toValue: 1, duration: 2200, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [phase, ripple]);

  const goExercises = () => navigation.navigate('ExercisePlayer', sessionParams);

  const answerYes = () => { setPhase('test'); setIdx(0); setResults([]); setPicked(null); lockRef.current = false; };

  const pick = (level: number) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setPicked(level);
    setTimeout(() => {
      const next = [...results, level];
      if (idx + 1 >= SOUNDS.length) finish(next);
      else { setResults(next); setIdx(idx + 1); setPicked(null); lockRef.current = false; }
    }, 420);
  };

  const finish = async (final: number[]) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ling);
      const hist = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(hist) ? hist : [];
      const d = new Date();
      arr.push({
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        identificados: final.filter((r) => r === 2).length,
        detectados: final.filter((r) => r >= 1).length,
        results: final,
      });
      await AsyncStorage.setItem(STORAGE_KEYS.ling, JSON.stringify(arr));
    } catch (e) { /* noop */ }
    setResults(final); setPhase('done');
  };

  const restart = () => { setPhase('test'); setIdx(0); setResults([]); setPicked(null); lockRef.current = false; };
  const onBack = () => { if (phase === 'test' || phase === 'done') setPhase('ask'); else navigation.goBack(); };

  const ex = SOUNDS[Math.min(idx, SOUNDS.length - 1)];
  const total = SOUNDS.length;

  // ---- Resultado: título, recap y recomendación ----
  const ident = results.filter((r) => r === 2).length;
  const detect = results.filter((r) => r >= 1).length;

  let resultIcon = '🎉', resultBadgeBg = V.color.primaryLight, resultTitle = '¡Oye con claridad!';
  let resultSub = 'Identificó los 6 sonidos. El equipo auditivo funciona bien hoy.';
  let recIcon = '✅', recBg = V.color.successBg, recBorder = '#bfe9d4', recColor = '#0a7d54';
  let recText = 'Todo en orden. Puedes continuar con los ejercicios de audición con normalidad.';
  if (detect < total) {
    resultIcon = '🔧'; resultBadgeBg = '#fff1e6'; resultTitle = 'Revisar el equipo';
    resultSub = 'No reaccionó a algún sonido. Comprueba pilas, molde y volumen antes de seguir.';
    recIcon = '⚠️'; recBg = '#fff7ed'; recBorder = '#fcd9a8'; recColor = '#9a5b13';
    recText = 'Revisa el audífono / implante (pilas, conexión, programa) y repite el test. Si persiste, consulta con el ORL.';
  } else if (ident < total) {
    resultIcon = '👂'; resultBadgeBg = '#fffbeb'; resultTitle = 'Detecta todos los sonidos';
    resultSub = `Detectó los 6, e identificó ${ident} de 6. Puede continuar con la sesión.`;
    recIcon = '💡'; recBg = '#fffdf3'; recBorder = '#f4e6b8'; recColor = '#8a7320';
    recText = 'Refuerza con apoyo del tutor los sonidos más agudos (sh, s). Puedes continuar con los ejercicios.';
  }

  const rippleScale = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.7] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  return (
    <View style={s.flex}>
      <StatusBar barStyle="light-content" />

      {/* ===== Cabecera ===== */}
      <View style={s.header}>
        <Pressable onPress={onBack} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            {/* <Image source={logoWhite} style={s.logo} /> */}
            <Text style={s.logoFallback}>valeria+</Text>
            <Text style={s.headerTitle}>{phase === 'done' ? 'Test completado' : 'Test de Ling'}</Text>
            <Text style={s.headerSub}>
              {phase === 'ask' ? 'Lucía M. · Comprobación auditiva'
                : phase === 'test' ? 'Lucía M. · 6 sonidos de Ling'
                : 'Lucía M. · Resultado de hoy'}
            </Text>
          </View>
          {phase === 'test' && (
            <View style={s.counter}><Text style={s.counterTxt}>{idx + 1} / {total}</Text></View>
          )}
        </View>

        {phase === 'test' && (
          <View style={s.dots}>
            {SOUNDS.map((_, i) => {
              const done = i < idx; const current = i === idx;
              return <View key={i} style={[s.dot, { backgroundColor: done ? '#fff' : current ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.32)' }]} />;
            })}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ============ FASE: PREGUNTA PREVIA ============ */}
        {phase === 'ask' && (
          <View>
            <View style={s.askHero}>
              <View style={s.askIcon}><Text style={{ fontSize: 38 }}>👂</Text></View>
              <Text style={s.askTitle}>Antes de empezar</Text>
              <Text style={s.askQuestion}>¿El paciente usa <Text style={s.bold}>audífonos</Text> o <Text style={s.bold}>implante coclear</Text>?</Text>
              <Text style={s.askSub}>Si los usa, conviene comprobar primero que oye bien hoy con el Test de Ling.</Text>
            </View>

            <Pressable onPress={answerYes} style={[s.choice, s.choiceYes]} accessibilityRole="button">
              <View style={[s.choiceIcon, { backgroundColor: V.color.primary }]}><Text style={{ fontSize: 22 }}>🦻</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.choiceTitle}>Sí, usa audífonos / implante</Text>
                <Text style={s.choiceSub}>Realizar Test de Ling (6 sonidos)</Text>
              </View>
              <Text style={[s.choiceChev, { color: V.color.primaryDark }]}>›</Text>
            </Pressable>

            <Pressable onPress={goExercises} style={[s.choice, s.choiceNo]} accessibilityRole="button">
              <View style={[s.choiceIcon, { backgroundColor: '#f1f5f4' }]}><Text style={{ fontSize: 22 }}>🚀</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.choiceTitle}>No</Text>
                <Text style={s.choiceSub}>Ir directamente a los ejercicios</Text>
              </View>
              <Text style={[s.choiceChev, { color: V.color.textMuted }]}>›</Text>
            </Pressable>

            <View style={s.tip}>
              <Text style={{ fontSize: 15 }}>💡</Text>
              <Text style={s.tipTxt}>{copy.tip}</Text>
            </View>
          </View>
        )}

        {/* ============ FASE: TEST ============ */}
        {phase === 'test' && (
          <View>
            {/* Instrucción al tutor */}
            <View style={s.instruction}>
              <View style={s.instrHead}>
                <View style={s.instrIcon}><Text style={{ fontSize: 18 }}>🤫</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.instrKicker}>TU TURNO, TUTOR</Text>
                  <Text style={s.instrTitle}>Cúbrete la boca y produce el sonido</Text>
                </View>
              </View>
              <Text style={s.instrBody}>{copy.instrBody}</Text>
            </View>

            {/* Escenario del sonido */}
            <View style={s.stage}>
              <Text style={s.stageLabel}>PRODUCE ESTE SONIDO</Text>
              <View style={s.soundWrap}>
                <Animated.View style={[s.ripple, { transform: [{ scale: rippleScale }], opacity: rippleOpacity }]} />
                <View style={s.soundCircle}><Text style={s.soundSym}>{ex.sym}</Text></View>
              </View>
              <Text style={s.soundSay}>{ex.say}</Text>
              <View style={s.freqPill}>
                <View style={[s.freqDot, { backgroundColor: ex.fc }]} />
                <Text style={s.freqTxt}>{ex.freq}</Text>
              </View>
              <Text style={s.soundHint}>{ex.hint}</Text>
            </View>

            {/* Escala de respuesta */}
            <View style={s.scaleCard}>
              <Text style={s.scaleTitle}>¿Cómo respondió?</Text>
              <Text style={s.scaleSub}>Marca la respuesta del niño a este sonido</Text>
              {SCALE.map((o) => {
                const on = picked === o.level;
                return (
                  <Pressable key={o.level} onPress={() => pick(o.level)}
                    style={[s.scaleRow, on ? { backgroundColor: o.color + '14', borderColor: o.color, borderWidth: 1.5 } : s.scaleRowOff]}
                    accessibilityRole="button">
                    <View style={[s.scaleDot, on ? { backgroundColor: o.color } : { borderWidth: 2, borderColor: o.color + '55' }]}>
                      <Text style={[s.scaleDotTxt, { color: on ? '#fff' : o.color }]}>{o.level}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.scaleRowTitle}>{o.title}</Text>
                      <Text style={s.scaleRowDesc}>{o.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* ============ FASE: RESULTADO ============ */}
        {phase === 'done' && (
          <View>
            <View style={s.resultCard}>
              <View style={[s.resultBadge, { backgroundColor: resultBadgeBg }]}><Text style={{ fontSize: 36 }}>{resultIcon}</Text></View>
              <Text style={s.resultTitle}>{resultTitle}</Text>
              <Text style={s.resultSub}>{resultSub}</Text>

              <View style={s.recap}>
                {SOUNDS.map((snd, i) => {
                  const lv = results[i];
                  const color = lv === 2 ? '#10b981' : lv === 1 ? '#f59e0b' : '#ef4444';
                  const mark = lv === 2 ? '✓' : lv === 1 ? '~' : '✕';
                  return (
                    <View key={snd.sym} style={s.recapCell}>
                      <Text style={s.recapSym}>{snd.sym}</Text>
                      <View style={[s.recapMark, { backgroundColor: color }]}><Text style={s.recapMarkTxt}>{mark}</Text></View>
                    </View>
                  );
                })}
              </View>

              <View style={s.legend}>
                <Legend color="#10b981" label="Identifica" />
                <Legend color="#f59e0b" label="Detecta" />
                <Legend color="#ef4444" label="Sin resp." />
              </View>
            </View>

            <View style={[s.rec, { backgroundColor: recBg, borderColor: recBorder }]}>
              <Text style={{ fontSize: 17 }}>{recIcon}</Text>
              <Text style={[s.recTxt, { color: recColor }]}>{recText}</Text>
            </View>

            <Pressable onPress={goExercises} style={s.primaryBtn} accessibilityRole="button"><Text style={s.primaryBtnTxt}>Comenzar ejercicios →</Text></Pressable>
            <Pressable onPress={restart} style={{ marginTop: 11, alignItems: 'center' }} accessibilityRole="button"><Text style={s.restartTxt}>Repetir test</Text></Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const Legend: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <View style={s.legendItem}>
    <View style={[s.legendDot, { backgroundColor: color }]} />
    <Text style={s.legendTxt}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  bold: { fontWeight: '800' },

  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 16, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  backPill: { flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10 },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  logo: { height: 21, width: 84, resizeMode: 'contain', marginBottom: 8 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 6 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  counter: { backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.35)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  counterTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flex: 1, height: 7, borderRadius: 4 },

  scroll: { padding: 16, paddingBottom: 28 },

  // pregunta previa
  askHero: { alignItems: 'center', paddingHorizontal: 8, paddingTop: 8 },
  askIcon: { width: 78, height: 78, borderRadius: 24, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  askTitle: { fontSize: 21, fontWeight: '800', color: V.color.textPrimary, marginTop: 18 },
  askQuestion: { fontSize: 14.5, fontWeight: '700', color: V.color.textSecondary, marginTop: 8, lineHeight: 21, textAlign: 'center', maxWidth: 280 },
  askSub: { fontSize: 12.5, fontWeight: '600', color: V.color.textMuted, marginTop: 8, lineHeight: 18, textAlign: 'center', maxWidth: 285 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderRadius: 17, padding: 16, marginTop: 11, ...V.shadow.card },
  choiceYes: { borderWidth: 1.5, borderColor: V.color.borderActive, marginTop: 24 },
  choiceNo: { borderWidth: 1, borderColor: V.color.border },
  choiceIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  choiceTitle: { fontSize: 16, fontWeight: '800', color: V.color.textPrimary },
  choiceSub: { fontSize: 12.5, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  choiceChev: { fontSize: 18, fontWeight: '800' },
  tip: { flexDirection: 'row', gap: 9, backgroundColor: '#fffdf3', borderWidth: 1, borderColor: '#f4e6b8', borderRadius: 14, padding: 13, marginTop: 20 },
  tipTxt: { flex: 1, fontSize: 12, fontWeight: '700', color: '#8a7320', lineHeight: 18 },

  // instrucción
  instruction: { backgroundColor: V.color.primaryTint, borderWidth: 1.5, borderColor: '#b8eee9', borderRadius: 18, padding: 15 },
  instrHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  instrIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  instrKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  instrTitle: { fontSize: 12.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 1 },
  instrBody: { marginTop: 11, fontSize: 13.5, fontWeight: '700', color: V.color.textPrimary, lineHeight: 19 },

  // escenario
  stage: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 20, paddingVertical: 22, paddingHorizontal: 16, marginTop: 12, alignItems: 'center', ...V.shadow.card },
  stageLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: V.color.textMuted, marginBottom: 14 },
  soundWrap: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center' },
  ripple: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 2, borderColor: '#b8eee9' },
  soundCircle: { width: 130, height: 130, borderRadius: 65, backgroundColor: V.color.primaryDark, alignItems: 'center', justifyContent: 'center', ...V.shadow.button },
  soundSym: { fontSize: 48, fontWeight: '900', color: '#fff' },
  soundSay: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary, marginTop: 18 },
  freqPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 7, marginTop: 9 },
  freqDot: { width: 8, height: 8, borderRadius: 4 },
  freqTxt: { fontSize: 12, fontWeight: '800', color: V.color.textSecondary },
  soundHint: { fontSize: 12.5, fontWeight: '600', color: V.color.textMuted, marginTop: 11, lineHeight: 18, textAlign: 'center', paddingHorizontal: 12 },

  // escala
  scaleCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
  scaleTitle: { fontSize: 16, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center' },
  scaleSub: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, textAlign: 'center', marginTop: 2, marginBottom: 13 },
  scaleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, marginBottom: 9 },
  scaleRowOff: { backgroundColor: '#f7fafa', borderWidth: 1, borderColor: '#eef3f3' },
  scaleDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  scaleDotTxt: { fontSize: 14, fontWeight: '900' },
  scaleRowTitle: { fontSize: 14.5, fontWeight: '800', color: V.color.textPrimary },
  scaleRowDesc: { fontSize: 12, fontWeight: '700', color: V.color.textMuted, marginTop: 2, lineHeight: 16 },

  // resultado
  resultCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 22, paddingVertical: 26, paddingHorizontal: 20, alignItems: 'center', shadowColor: 'rgba(15,23,42,.07)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 22, elevation: 3 },
  resultBadge: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 21, fontWeight: '800', color: V.color.textPrimary, marginTop: 16, letterSpacing: -0.3 },
  resultSub: { fontSize: 13, fontWeight: '600', color: '#6b7280', marginTop: 7, lineHeight: 19, textAlign: 'center', paddingHorizontal: 6 },
  recap: { flexDirection: 'row', gap: 7, marginTop: 20, alignSelf: 'stretch' },
  recapCell: { flex: 1, backgroundColor: '#f7fafa', borderWidth: 1, borderColor: '#eef3f3', borderRadius: 13, paddingTop: 11, paddingBottom: 9, alignItems: 'center' },
  recapSym: { fontSize: 19, fontWeight: '900', color: V.color.textPrimary },
  recapMark: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 7 },
  recapMarkTxt: { fontSize: 10, color: '#fff', fontWeight: '900' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  rec: { flexDirection: 'row', gap: 10, borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 13 },
  recTxt: { flex: 1, fontSize: 12.5, fontWeight: '700', lineHeight: 18 },
  primaryBtn: { backgroundColor: V.color.primary, borderRadius: 15, paddingVertical: 16, alignItems: 'center', marginTop: 16, ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  restartTxt: { color: V.color.primaryDark, fontSize: 13.5, fontWeight: '800' },
});

export default ValeriaLingTestScreen;

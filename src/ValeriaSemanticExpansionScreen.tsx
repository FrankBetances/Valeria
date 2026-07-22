// ============================================================================
// Valeria+ · Pantalla de Expansión Semántica / Progresión Léxica (V2.0)
// Convierte los datos de valeriaSemanticExpansion.ts en un juego de voz con
// anclaje físico. El trabajo semántico no es memorizar palabras: es unir el
// símbolo (imagen + audio) con el mundo real del niño a través del cuerpo.
//
// Tres modos de práctica sobre un reproductor común de "pasos":
//   · ESCENARIOS  → 5 rutinas diarias (mañana, comida, parque, baño, dormir).
//   · PROGRESIÓN  → 7 secuencias que suben Onomatopeya → Sustantivo → Verbo → Adjetivo.
//   · CONTRASTES  → 6 cápsulas TPR de pares con DOS vueltas evaluadas
//                   (grande/pequeño, abrir/cerrar, frío/caliente…).
//
// Flujo por paso:
//   CONSIGNA (TTS) → ESCUCHA (STT, si hay micro) → VEREDICTO → ACCIÓN FÍSICA
//                  del adulto (parent_tpr_action) → continuar.
// Evaluación con matchExpected(): la palabra objetivo y sus aproximaciones
// fonéticas de la edad valen por igual. Sin micrófono (Expo Go/web) el adulto
// hace de juez con botones. Cada paso premia con estrellas (3 al primer intento,
// 2 tras repetir, 1 en imitación asistida) y la sesión se registra en el
// historial + gamificación, igual que los demás ejercicios.
// Protocolo completo: docs/protocolo-expansion-semantica.md
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { ProUnlockPill, ProPinModal } from './ValeriaProPin';
import { registerSession, SessionReward } from './valeriaGamification';
import { markBlockCompleted } from './valeriaTelemetry';
import {
  speakToChild, speakWordSlow, stopSpeaking,
  asrSupported, startListening, stopListening, releaseListening, matchExpected,
  praisePhrase, almostPhrase, noHearPhrase, togetherPhrase,
} from './valeriaVoice';
import { SpeakButton, TurnPhaseStrip } from './ValeriaVoiceUI';
import { FichaVisual } from './ValeriaPictograms';
import { WORD_TYPE_LABEL, PHASE_LABEL } from './valeriaSemanticExpansion';
import { semanticForLocale, SemanticBank } from './valeriaSemanticBanks';
import { getLocale } from './valeriaLocale';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Un "paso" genérico: la unidad que el reproductor sabe locutar y evaluar.
// Escenarios, progresiones y contrastes se aplanan a esta forma común.
interface PracticeStep {
  kicker: string;        // etiqueta superior (SUSTANTIVO, FASE 1 · ONOMATOPEYA, CONTRASTE…)
  emoji: string;
  label: string;         // palabra objetivo mostrada
  visualPrompt: string;  // descripción del asset (guía para el adulto/diseñador)
  tts: string;           // consigna a locutar
  expected: string[];    // strings válidos para el STT
  actionKicker: string;  // encabezado de la tarjeta de acción física
  action: string;        // parent_tpr_action del paso
  setup?: string;        // setup físico previo (solo primera vuelta de contrastes)
}

interface Session {
  kind: 'scenario' | 'sequence' | 'contrast';
  title: string;
  code: string;
  steps: PracticeStep[];
}

// ---- Constructores: datos → sesión de pasos --------------------------------
// Reciben el banco de la variedad activa (es/gl base, es-DO dominicano) para no
// acoplarse a un contenido concreto: la pantalla es la misma, cambian los datos.
const scenarioSession = (bank: SemanticBank, id: string): Session => {
  const sc = bank.scenarios.find((s) => s.id === id)!;
  return {
    kind: 'scenario', title: sc.title, code: sc.title,
    steps: sc.items.map((it) => ({
      kicker: WORD_TYPE_LABEL[it.type].toUpperCase(),
      emoji: it.emoji, label: it.label, visualPrompt: it.visual_prompt,
      tts: it.tts_string, expected: it.stt_expected_array,
      actionKicker: 'MISIÓN FÍSICA DEL ADULTO', action: it.parent_tpr_action,
    })),
  };
};

const sequenceSession = (bank: SemanticBank, id: string): Session => {
  const sq = bank.sequences.find((s) => s.id === id)!;
  return {
    kind: 'sequence', title: sq.theme, code: sq.theme,
    steps: sq.phases.map((ph) => ({
      kicker: PHASE_LABEL[ph.kind].toUpperCase(),
      emoji: ph.emoji, label: ph.label, visualPrompt: ph.visual_prompt,
      tts: ph.tts_string, expected: ph.stt_expected_array,
      actionKicker: 'INSTRUCCIÓN TPR PARA EL PADRE', action: ph.parent_tpr_action,
    })),
  };
};

const contrastSession = (bank: SemanticBank, id: string): Session => {
  const cp = bank.capsules.find((c) => c.id === id)!;
  return {
    kind: 'contrast', title: `${cp.pair[0]} / ${cp.pair[1]}`, code: cp.code,
    steps: cp.rounds.map((r, i) => ({
      kicker: `${cp.kind === 'adjetivos' ? 'CONTRASTE DE ADJETIVOS' : 'VERBOS ANTÓNIMOS'} · VUELTA ${i + 1} DE 2`,
      emoji: r.emoji, label: r.label,
      visualPrompt: `Par en contraste: ${cp.pair[0]} / ${cp.pair[1]}.`,
      tts: r.tts_trigger, expected: r.stt_expected_array,
      actionKicker: i === 0 ? 'ACCIÓN FÍSICA EN PAREJA' : 'ACCIÓN FÍSICA · SEGUNDA VUELTA',
      action: r.parent_action,
      setup: i === 0 ? cp.physical_setup : undefined,
    })),
  };
};

type Phase = 'pick' | 'play' | 'done';
type StepState = 'say' | 'listen' | 'judge' | 'success' | 'retry' | 'assist';

interface StepRecord { stars: 1 | 2 | 3; heard: string; }

// Combina onDone/onError del TTS en un único "continuar" con rescate temporal,
// por si el motor de síntesis no avisa del final (voces ausentes, web sin audio).
const afterSpeak = (fn: () => void, maxWaitMs = 15000) => {
  let fired = false;
  const once = () => { if (!fired) { fired = true; clearTimeout(timer); fn(); } };
  const timer = setTimeout(once, maxWaitMs);
  return { onDone: once, onError: once };
};

export const ValeriaSemanticExpansionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Banco de la variedad activa (fijado al montar, como en Pares Mínimos):
  // es/gl usan el base; es-DO el dominicano (léxico local + registro caribeño).
  const bank = useRef<SemanticBank>(semanticForLocale(getLocale())).current;
  const [phase, setPhase] = useState<Phase>('pick');
  const [tab, setTab] = useState<'scenario' | 'sequence' | 'contrast'>('scenario');
  const [session, setSession] = useState<Session | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [state, setState] = useState<StepState>('say');
  const [heard, setHeard] = useState('');
  const [pendingStars, setPendingStars] = useState<1 | 2 | 3>(3);
  const [log, setLog] = useState<StepRecord[]>([]);
  const [reward, setReward] = useState<SessionReward | null>(null);
  const [listening, setListening] = useState(false);
  // Prescripción del logopeda: { [id]: boolean } sobre escenarios, progresiones
  // y contrastes (id ausente = activo). El PIN profesional desbloquea la edición.
  const [prescribed, setPrescribed] = useState<Record<string, boolean>>({});
  const [unlocked, setUnlocked] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [toast, setToast] = useState('');

  const attemptsRef = useRef(0);
  const listeningRef = useRef(false);
  const mounted = useRef(true);
  const pulse = useRef(new Animated.Value(0)).current;
  // Vuelve arriba al cambiar de paso: sin esto el nuevo paso aparecía con el
  // scroll del anterior, a mitad de página, como si la sesión no avanzara.
  const scrollRef = useRef<ScrollView | null>(null);
  useEffect(() => {
    if (phase === 'play') scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [phase, stepIdx]);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.expansionPrescripcion);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p === 'object' && !Array.isArray(p) && mounted.current) setPrescribed(p);
        }
      } catch (e) { /* noop */ }
    })();
    return () => { mounted.current = false; stopSpeaking(); stopListening(); releaseListening(); };
  }, []);

  useEffect(() => {
    if (!listening) { pulse.setValue(0); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 620, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [listening, pulse]);

  // ---------------------------------------------------- prescripción (PIN) --
  const TOTAL_ACTIVITIES = bank.scenarios.length + bank.sequences.length + bank.capsules.length;
  const isPrescribed = (id: string) => prescribed[id] !== false;
  const activeCount =
    bank.scenarios.filter((x) => isPrescribed(x.id)).length +
    bank.sequences.filter((x) => isPrescribed(x.id)).length +
    bank.capsules.filter((x) => isPrescribed(x.id)).length;

  const togglePrescribed = (id: string) => {
    if (!unlocked) return;
    setPrescribed((prev) => ({ ...prev, [id]: !(prev[id] !== false) }));
    setToast('');
  };

  const savePrescription = async () => {
    try { await AsyncStorage.setItem(STORAGE_KEYS.expansionPrescripcion, JSON.stringify(prescribed)); } catch (e) { /* noop */ }
    setUnlocked(false);
    setToast(`Prescripción guardada · ${activeCount} de ${TOTAL_ACTIVITIES} actividades activas.`);
  };

  // ---------------------------------------------------------------- sesión --
  const start = (sess: Session) => {
    setSession(sess); setPhase('play'); setLog([]); setReward(null);
    setStepIdx(0); attemptsRef.current = 0; setHeard('');
    sayStep(sess, 0);
  };

  const sayStep = (sess: Session, idx: number) => {
    setState('say'); setHeard(''); setListening(false);
    const st = sess.steps[idx];
    speakToChild(st.tts, afterSpeak(() => {
      if (!mounted.current) return;
      if (asrSupported()) setTimeout(() => listenNow(sess, idx), 400);
      else setState('judge');
    }));
  };

  // --------------------------------------------------------------- escucha --
  const listenNow = async (sess: Session, idx: number) => {
    if (!mounted.current) return;
    const st = sess.steps[idx];
    setState('listen'); setListening(true); setHeard('');
    listeningRef.current = true;
    const ok = await startListening({
      onPartial: (t) => mounted.current && listeningRef.current && setHeard(t),
      onResult: (alts) => {
        if (!mounted.current || !listeningRef.current) return;
        listeningRef.current = false; setListening(false);
        setHeard(alts[0] ?? '');
        resolve(matchExpected(alts, st.expected));
      },
      onError: () => {
        if (!mounted.current || !listeningRef.current) return;
        listeningRef.current = false; setListening(false);
        resolve(0);
      },
    });
    if (!ok && mounted.current) { listeningRef.current = false; setListening(false); setState('judge'); }
  };

  // ------------------------------------------------------------ evaluación --
  // level 2 = dijo la palabra (o una aproximación válida) · 1 = casi · 0 = nada.
  const resolve = (level: 0 | 1 | 2) => {
    if (level === 2) {
      setPendingStars(attemptsRef.current === 0 ? 3 : 2);
      setState('success');
      speakToChild(praisePhrase());
      return;
    }
    attemptsRef.current += 1;
    if (attemptsRef.current >= 2) {
      setState('assist');
      speakToChild(togetherPhrase());
      setTimeout(() => mounted.current && session && speakWordSlow(session.steps[stepIdx].label), 1500);
    } else {
      setState('retry');
      speakToChild(level === 1 ? almostPhrase() : noHearPhrase());
      setTimeout(() => mounted.current && session && speakWordSlow(session.steps[stepIdx].label), 2000);
    }
  };

  const retry = () => {
    if (!session) return;
    const st = session.steps[stepIdx];
    setHeard('');
    speakToChild(bank.retry(st.label), afterSpeak(() => {
      if (!mounted.current) return;
      if (asrSupported()) setTimeout(() => listenNow(session, stepIdx), 400);
      else setState('judge');
    }));
    setState('say');
  };

  // ------------------------------------------------------- avance de paso --
  const next = (rec: StepRecord) => {
    if (!session) return;
    const nextLog = [...log, rec];
    setLog(nextLog);
    const n = stepIdx + 1;
    if (n >= session.steps.length) { finish(session, nextLog); return; }
    setStepIdx(n); attemptsRef.current = 0; setHeard('');
    sayStep(session, n);
  };

  const finish = async (sess: Session, res: StepRecord[]) => {
    const avg = res.reduce((a, r) => a + r.stars, 0) / (res.length || 1);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.historial);
      const hist = raw ? JSON.parse(raw) : [];
      const d = new Date();
      const kindLbl = sess.kind === 'scenario' ? 'Escenario' : sess.kind === 'sequence' ? 'Progresión' : 'Contraste';
      hist.push({
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        name: `Expansión semántica · ${sess.title}`,
        avg: +avg.toFixed(1),
        note: `${kindLbl}: ${res.length} palabras trabajadas uniendo símbolo, voz y acción física.`,
        completed: true,
      });
      await AsyncStorage.setItem(STORAGE_KEYS.historial, JSON.stringify(hist));
      const rawSe = await AsyncStorage.getItem(STORAGE_KEYS.expansionSemantica);
      const se = rawSe ? JSON.parse(rawSe) : [];
      se.push({ date: d.toISOString(), kind: sess.kind, title: sess.title, steps: res });
      await AsyncStorage.setItem(STORAGE_KEYS.expansionSemantica, JSON.stringify(se));
    } catch (e) { /* almacenamiento no disponible */ }
    try { setReward(await registerSession(avg, res.length)); } catch (e) { /* noop */ }
    markBlockCompleted('expansion'); // hito de bloque para el SUS (rate-limited)
    setPhase('done');
    speakToChild(bank.sessionDone);
  };

  // ------------------------------------------------------------------- UI --
  const micScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  const actionCard = (kicker: string, text: string) => (
    <View style={s.actionCard}>
      <View style={s.actionHead}>
        <View style={s.actionIcon}><Text style={{ fontSize: 17 }}>🤝</Text></View>
        <Text style={s.actionKicker}>{kicker}</Text>
        <View style={{ marginLeft: 'auto' }}><SpeakButton text={text} voice="tutor" compact /></View>
      </View>
      <Text style={s.actionTxt}>{text}</Text>
    </View>
  );

  // Fila prescribible del listado: en Modo Familia lanza la sesión (si está
  // prescrita); con el PIN profesional activo alterna la prescripción.
  const prescribableRow = (id: string, name: string, onStart: () => void, inner: React.ReactNode) => {
    const on = isPrescribed(id);
    return (
      <Pressable
        key={id}
        onPress={() => (unlocked ? togglePrescribed(id) : on && onStart())}
        style={[s.pickRow, !on && s.pickRowOff]}
        accessibilityRole="button"
        accessibilityLabel={unlocked ? `${on ? 'Desactivar' : 'Activar'} ${name}` : on ? `Practicar ${name}` : `${name} no prescrito`}
      >
        {inner}
        {unlocked ? (
          <Switch value={on} onValueChange={() => togglePrescribed(id)}
            trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff" />
        ) : on ? (
          <View style={s.playBtn}><Text style={{ color: V.color.primaryDark, fontSize: 13 }}>▶</Text></View>
        ) : (
          <View style={[s.playBtn, { backgroundColor: '#f1f5f4' }]}><Text style={{ fontSize: 13 }}>🔒</Text></View>
        )}
      </Pressable>
    );
  };

  // =================================================================== PICK ==
  if (phase === 'pick') {
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
          <Text style={s.logoFallback}>valeria+</Text>
          <Text style={s.headerTitle}>Expansión Semántica</Text>
          <Text style={s.headerSub}>{unlocked ? 'Edición profesional habilitada' : 'Progresión léxica · del símbolo al mundo real del niño'}</Text>
          <View style={s.tabs}>
            {([['scenario', 'Escenarios'], ['sequence', 'Progresión'], ['contrast', 'Contrastes']] as const).map(([t, lbl]) => {
              const on = tab === t;
              return (
                <Pressable key={t} onPress={() => setTab(t)} style={[s.tab, on && s.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                  <Text style={[s.tabTxt, { color: on ? V.color.primaryDark : 'rgba(255,255,255,.9)' }]}>{lbl}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {!!toast && (
            <View style={s.toast}>
              <View style={s.toastCheck}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text></View>
              <Text style={s.toastTxt}>{toast}</Text>
            </View>
          )}
          <View style={s.howCard}>
            <Text style={s.howKicker}>⚡ CÓMO FUNCIONA</Text>
            <Text style={s.howTxt}>
              La app enseña una imagen y dice la palabra; el niño la repite con su voz y el micrófono
              valora el intento (aceptando las aproximaciones propias de la edad). Cada palabra se
              cierra con una acción física del adulto que la ancla al cuerpo y al entorno real.
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <ProUnlockPill unlocked={unlocked} onPress={() => setPinOpen(true)} />
          </View>
          <View style={s.listHead}>
            <Text style={s.listLabel}>
              {tab === 'scenario' ? 'ESCENARIOS DIARIOS' : tab === 'sequence' ? 'PROGRESIÓN LÉXICA' : 'CÁPSULAS DE CONTRASTE'}
            </Text>
            <View style={s.countBadge}><Text style={s.countBadgeTxt}>{activeCount} prescritas</Text></View>
          </View>

          {tab === 'scenario' && bank.scenarios.map((sc) => prescribableRow(
            sc.id, `escenario ${sc.title}`, () => start(scenarioSession(bank, sc.id)),
            <>
              <Text style={{ fontSize: 30 }}>{sc.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.pickName}>{sc.title}</Text>
                <Text style={s.pickCat}>{sc.subtitle} · {sc.items.length} palabras</Text>
              </View>
            </>,
          ))}

          {tab === 'sequence' && bank.sequences.map((sq) => prescribableRow(
            sq.id, `progresión ${sq.theme}`, () => start(sequenceSession(bank, sq.id)),
            <>
              <Text style={{ fontSize: 30 }}>{sq.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.pickName}>{sq.theme}</Text>
                <Text style={s.pickCat}>{sq.phases.map((p) => p.label).join(' → ')}</Text>
              </View>
            </>,
          ))}

          {tab === 'contrast' && bank.capsules.map((cp) => prescribableRow(
            cp.id, `cápsula de contraste ${cp.pair[0]} y ${cp.pair[1]}`, () => start(contrastSession(bank, cp.id)),
            <>
              <View style={s.codeChip}><Text style={s.codeChipTxt}>{cp.code}</Text></View>
              <Text style={{ fontSize: 26 }}>{cp.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.pickName}>{cp.pair[0]} / {cp.pair[1]}</Text>
                <Text style={s.pickCat}>{cp.kind === 'adjetivos' ? 'Par de adjetivos' : 'Verbos antónimos'} · cápsula TPR · 2 vueltas</Text>
              </View>
            </>,
          ))}

          {unlocked ? (
            <>
              <Pressable onPress={savePrescription} style={s.primaryBtn}><Text style={s.primaryBtnTxt}>Guardar Prescripción</Text></Pressable>
              <Text style={s.helper}>La selección se guarda en el dispositivo y la edición se bloquea de nuevo.</Text>
            </>
          ) : (
            <View style={s.lockedHint}>
              <Text style={{ fontSize: 13 }}>🔒</Text>
              <Text style={s.lockedHintTxt}>Modo Familia · solo el logopeda puede cambiar qué actividades se practican.</Text>
            </View>
          )}
        </ScrollView>

        <ProPinModal
          open={pinOpen}
          onClose={() => setPinOpen(false)}
          onUnlock={() => { setPinOpen(false); setUnlocked(true); setToast('Modo profesional desbloqueado.'); }}
          subtitle="Introduce el PIN de 4 dígitos del logopeda para elegir qué actividades practica la familia."
        />
      </View>
    );
  }

  const sess = session!;

  // =================================================================== DONE ==
  if (phase === 'done') {
    const avg = log.reduce((a, r) => a + r.stars, 0) / (log.length || 1);
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
          <Text style={s.logoFallback}>valeria+</Text>
          <Text style={s.headerTitle}>¡Completado!</Text>
          <Text style={s.headerSub}>{sess.title}</Text>
        </View>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.doneCard}>
            <Text style={{ fontSize: 44 }}>🎉</Text>
            <Text style={s.doneTitle}>¡Sesión completada!</Text>
            <Text style={s.doneBig}>{avg.toFixed(1)}<Text style={s.doneSlash}> / 3 ★</Text></Text>
            <Text style={s.doneSub}>
              {sess.steps.length} palabras trabajadas uniendo imagen, voz y acción física. La palabra
              se aprende cuando el niño la vive con el cuerpo, no solo cuando la oye.
            </Text>
            <View style={s.doneStarsRow}>
              {log.map((r, i) => (
                <View key={i} style={s.doneStarCell}>
                  <Text style={s.doneStarIdx}>{sess.steps[i]?.label ?? i + 1}</Text>
                  <Text style={{ color: V.color.star, fontSize: 12 }}>{'★'.repeat(r.stars)}</Text>
                </View>
              ))}
            </View>
            {reward && (
              <View style={s.rewardRow}>
                <View style={s.rewardChip}><Text style={s.rewardBig}>+{reward.xpGained}</Text><Text style={s.rewardLbl}>XP</Text></View>
                <View style={[s.rewardChip, { backgroundColor: '#fff4e5' }]}><Text style={s.rewardBig}>🔥 {reward.streak}</Text><Text style={s.rewardLbl}>{reward.streak === 1 ? 'día de racha' : 'días de racha'}</Text></View>
              </View>
            )}
            <Pressable onPress={() => navigation.navigate('Results')} style={s.primaryBtn}><Text style={s.primaryBtnTxt}>Ver Resultados →</Text></Pressable>
            <Pressable onPress={() => start(sess)}><Text style={s.linkBtn}>Repetir este bloque</Text></Pressable>
            <Pressable onPress={() => setPhase('pick')}><Text style={s.linkBtn}>Elegir otro bloque</Text></Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // =================================================================== PLAY ==
  const st = sess.steps[stepIdx];
  const total = sess.steps.length;
  // Fase activa del turno para el mapa superior (quita la sensación de "¿y
  // ahora qué toca?" que reportaban los testers).
  const phaseIdx = state === 'say' ? 0 : state === 'listen' ? 1 : state === 'judge' || state === 'retry' ? 2 : 3;

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <Pressable onPress={() => { stopSpeaking(); stopListening(); navigation.goBack(); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
        <Text style={s.logoFallback}>valeria+</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Expansión Semántica</Text>
            <Text style={s.headerSub} numberOfLines={1}>{sess.title}</Text>
          </View>
          <View style={s.counter}><Text style={s.counterTxt}>{stepIdx + 1} / {total}</Text></View>
        </View>
        <View style={s.dots}>
          {Array.from({ length: total }).map((_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: i < stepIdx ? '#fff' : i === stepIdx ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.32)' }]} />
          ))}
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Mapa del turno: en qué fase del paso estamos */}
        <TurnPhaseStrip active={phaseIdx} />

        {/* Ficha visual: pictograma SVG si existe; emoji como fallback */}
        <View style={s.bigTile}>
          <Text style={s.tileKicker}>{st.kicker}</Text>
          <View style={{ marginTop: 6 }}>
            <FichaVisual word={st.label} emoji={st.emoji} size={64} />
          </View>
          <Text style={s.tileCap}>{st.label}</Text>
        </View>

        {/* Consigna que dice la app */}
        <View style={s.promptCard}>
          <View style={s.promptHead}>
            <View style={s.promptIcon}><Text style={{ fontSize: 18 }}>📢</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.promptKicker}>LA APP DICE</Text>
              <Text style={s.promptTxt}>“{st.tts}”</Text>
            </View>
            <SpeakButton text={st.tts} voice="child" compact />
          </View>
        </View>

        {/* Setup físico previo (primera vuelta de las cápsulas de contraste) */}
        {!!st.setup && (state === 'say' || state === 'listen' || state === 'judge') &&
          actionCard('SETUP FÍSICO · PREPARA ANTES DE EMPEZAR', st.setup)}

        {/* ===== Estado del paso ===== */}
        {state === 'say' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 30 }}>🔊</Text>
            <Text style={s.stateTxt}>La app está hablando… preparad la voz.</Text>
          </View>
        )}

        {state === 'listen' && (
          <View style={s.stateCard}>
            <Animated.View style={{ transform: [{ scale: micScale }] }}>
              <View style={s.micRing}><Text style={{ fontSize: 30 }}>🎤</Text></View>
            </Animated.View>
            <Text style={s.stateTxt}>¡Ahora el niño! Di la palabra al micrófono…</Text>
            {!!heard && <Text style={s.partialTxt}>✨ {heard}</Text>}
            <Pressable
              onPress={() => { listeningRef.current = false; setListening(false); stopListening(); setState('judge'); }}
              style={s.stopPill}
            >
              <Text style={s.stopPillTxt}>Parar · el adulto decide</Text>
            </Pressable>
          </View>
        )}

        {state === 'judge' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 26 }}>👂</Text>
            <Text style={s.stateTxt}>El adulto hace de juez: ¿lo intentó decir?</Text>
            <View style={s.judgeRow}>
              <Pressable onPress={() => resolve(2)} style={[s.judgeBtn, { backgroundColor: V.color.successBg, borderColor: '#bfe9d4' }]}>
                <Text style={{ fontSize: 22 }}>✅</Text><Text style={s.judgeTxt}>Lo dijo</Text>
              </Pressable>
              <Pressable onPress={() => resolve(1)} style={[s.judgeBtn, { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' }]}>
                <Text style={{ fontSize: 22 }}>💪</Text><Text style={s.judgeTxt}>Casi / otra vez</Text>
              </Pressable>
            </View>
            <Pressable onPress={retry}><Text style={s.linkBtn}>No se entendió · repetir consigna</Text></Pressable>
          </View>
        )}

        {state === 'success' && (
          <>
            <View style={[s.verdictCard, s.verdictOk]}>
              <Text style={{ fontSize: 26 }}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>¡Palabra conseguida!</Text>
                <Text style={s.verdictSub}>{heard ? `La app escuchó: “${heard}”` : 'Veredicto del adulto.'} · {pendingStars}★</Text>
              </View>
              <Text style={s.verdictStars}>{'★'.repeat(pendingStars)}</Text>
            </View>
            {actionCard(st.actionKicker, st.action)}
            <Pressable onPress={() => next({ stars: pendingStars, heard })} style={s.primaryBtn}>
              <Text style={s.primaryBtnTxt}>{stepIdx + 1 >= total ? '✅ ¡Terminar!' : '✅ ¡Hecho! Siguiente →'}</Text>
            </Pressable>
          </>
        )}

        {state === 'retry' && (
          <>
            <View style={[s.verdictCard, s.verdictWarn]}>
              <Text style={{ fontSize: 26 }}>💪</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>¡Casi casi!</Text>
                <Text style={s.verdictSub}>Escuchad el modelo despacio y probad otra vez.</Text>
              </View>
            </View>
            <View style={s.retryRow}>
              <SpeakButton text={st.label} label="Oír modelo despacio" voice="slow" />
              <Pressable onPress={retry} style={s.retryBtn}><Text style={s.retryBtnTxt}>🎤 ¡Otra vez!</Text></Pressable>
            </View>
          </>
        )}

        {state === 'assist' && (
          <>
            <View style={[s.verdictCard, s.verdictNeutral]}>
              <Text style={{ fontSize: 26 }}>🤝</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>Imitación juntos (1★)</Text>
                <Text style={s.verdictSub}>
                  El adulto dice “{st.label}” muy despacio mirando al niño, y lo repiten a la vez.
                  Sin prisa: hoy la practicamos, mañana sale sola.
                </Text>
              </View>
            </View>
            {actionCard(st.actionKicker, st.action)}
            <View style={s.retryRow}>
              <SpeakButton text={st.label} label="Oír modelo despacio" voice="slow" />
              <Pressable onPress={() => next({ stars: 1, heard })} style={s.retryBtn}>
                <Text style={s.retryBtnTxt}>{stepIdx + 1 >= total ? '¡Terminar!' : 'La dijimos → seguir'}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ----------------------------------------------------------------------------
const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 16, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 6 },
  backPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10 },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  counter: { backgroundColor: 'rgba(255,255,255,.18)', borderColor: 'rgba(255,255,255,.35)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  counterTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  tabs: { flexDirection: 'row', gap: 4, backgroundColor: 'rgba(255,255,255,.16)', borderRadius: 13, padding: 4, marginTop: 14 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 10 },
  tabOn: { backgroundColor: '#fff' },
  tabTxt: { fontSize: 13, fontWeight: '800' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flex: 1, height: 7, borderRadius: 4 },
  scroll: { padding: 16, paddingBottom: 32 },

  // pick
  howCard: { backgroundColor: V.color.primaryTint, borderWidth: 1.5, borderColor: '#b8eee9', borderRadius: 16, padding: 14, marginBottom: 12 },
  howKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  howTxt: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 7, lineHeight: 19 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginBottom: 14 },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastTxt: { color: V.color.textPrimary, fontSize: 13.5, fontWeight: '700', flex: 1 },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginHorizontal: 4 },
  listLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.4 },
  countBadge: { backgroundColor: V.color.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  countBadgeTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 15, padding: 13, marginBottom: 9, ...V.shadow.card },
  pickRowOff: { opacity: 0.55 },
  helper: { textAlign: 'center', color: V.color.textMuted, fontSize: 11.5, marginTop: 11, fontWeight: '600', paddingHorizontal: 14 },
  lockedHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18, paddingHorizontal: 18 },
  lockedHintTxt: { color: V.color.textMuted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  codeChip: { backgroundColor: V.color.primaryLight, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 },
  codeChipTxt: { color: V.color.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  pickName: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary, textTransform: 'capitalize' },
  pickCat: { fontSize: 11.5, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  playBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },

  // ficha
  bigTile: { backgroundColor: '#fff', borderWidth: 2, borderColor: V.color.border, borderRadius: 22, paddingVertical: 22, alignItems: 'center', ...V.shadow.card },
  tileKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: V.color.primaryDark },
  tileCap: { fontSize: 24, fontWeight: '800', color: V.color.textPrimary, marginTop: 10, textTransform: 'capitalize' },

  promptCard: { backgroundColor: V.color.primaryTint, borderWidth: 1.5, borderColor: '#b8eee9', borderRadius: 16, padding: 13, marginTop: 12 },
  promptHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  promptIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  promptKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  promptTxt: { fontSize: 13.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 2, lineHeight: 18 },

  stateCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 18, padding: 18, marginTop: 12, alignItems: 'center', gap: 10, ...V.shadow.card },
  stateTxt: { fontSize: 13.5, fontWeight: '700', color: V.color.textSecondary, textAlign: 'center', lineHeight: 19 },
  micRing: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#7c4fd0', alignItems: 'center', justifyContent: 'center', ...V.shadow.button },
  partialTxt: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary },
  stopPill: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 6 },
  stopPillTxt: { color: V.color.error, fontSize: 12, fontWeight: '800' },

  judgeRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  judgeBtn: { flex: 1, alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: 14, paddingVertical: 12 },
  judgeTxt: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary },

  verdictCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 16, borderWidth: 1.5, padding: 13, marginTop: 12 },
  verdictOk: { backgroundColor: V.color.successBg, borderColor: '#bfe9d4' },
  verdictWarn: { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' },
  verdictNeutral: { backgroundColor: '#fff', borderColor: V.color.border },
  verdictTitle: { fontSize: 14.5, fontWeight: '800', color: V.color.textPrimary },
  verdictSub: { fontSize: 12, fontWeight: '600', color: V.color.textSecondary, marginTop: 2, lineHeight: 17 },
  verdictStars: { fontSize: 16, color: V.color.star, letterSpacing: 1 },

  actionCard: { backgroundColor: '#f5f0ff', borderColor: '#ddccfa', borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 12 },
  actionHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  actionIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#7c4fd0', alignItems: 'center', justifyContent: 'center' },
  actionKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#6d3fc4', flex: 1 },
  actionTxt: { marginTop: 9, fontSize: 13.5, fontWeight: '700', color: '#4a3878', lineHeight: 19 },

  retryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  retryBtn: { flex: 1, backgroundColor: V.color.primary, borderRadius: 13, paddingVertical: 12, alignItems: 'center', ...V.shadow.button },
  retryBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // done
  doneCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 22, padding: 24, alignItems: 'center', ...V.shadow.card },
  doneTitle: { fontSize: 21, fontWeight: '800', color: V.color.textPrimary, marginTop: 10 },
  doneBig: { fontSize: 40, fontWeight: '800', color: V.color.textPrimary, marginTop: 10 },
  doneSlash: { fontSize: 18, color: V.color.textMuted, fontWeight: '800' },
  doneSub: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  doneStarsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16, justifyContent: 'center' },
  doneStarCell: { alignItems: 'center', backgroundColor: V.color.pageBg, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 8 },
  doneStarIdx: { fontSize: 9, fontWeight: '800', color: V.color.textMuted, textTransform: 'capitalize' },
  rewardRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 16 },
  rewardChip: { flex: 1, backgroundColor: '#e6f9f8', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  rewardBig: { fontSize: 20, fontWeight: '800', color: V.color.textPrimary },
  rewardLbl: { fontSize: 11, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  primaryBtn: { alignSelf: 'stretch', marginTop: 18, backgroundColor: V.color.primary, borderRadius: 15, paddingVertical: 15, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  linkBtn: { marginTop: 12, color: V.color.primaryDark, fontSize: 13, fontWeight: '800', textAlign: 'center' },
});

export default ValeriaSemanticExpansionScreen;

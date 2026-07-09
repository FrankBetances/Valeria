// ============================================================================
// Valeria+ · Pantalla de Pares Mínimos (V6.0)
// Ejercicio de contraste fonológico hiperdinámico para dislalias (rotacismo,
// sigmatismo, frontalización velar, f→p). Flujo por ensayo:
//
//   PRESENTACIÓN → CONSIGNA (TTS) → ESCUCHA (STT) → EVALUACIÓN → FEEDBACK
//                → SELLO DOBLE (padre + niño pulsan A LA VEZ) → siguiente
//
// Ramas de evaluación (matchPair, ver valeriaVoice.ts):
//   'target' → acierto (3★ al primer intento, 2★ tras corrección)
//   'foil'   → sustitución detectada → corrección específica del par
//   'close'  → aproximación → reintento
//   'none'   → no captado → re-modelado SIN consumir intento
// Anti-frustración: a la 2.ª corrección pasa a imitación asistida (1★).
// El padre siempre puede corregir el veredicto del STT (él es el juez final).
//
// Mecánicas anti-pasividad: nada avanza sin el sello doble (multi-touch
// simultáneo de dos manos distintas; mantener pulsado 2 s como alternativa
// accesible de una sola mano), rotación de roles "¡Ahora mandas tú!" en los
// ensayos 4 y 8, y cápsula TPR de movimiento tras el ensayo 5.
// Sin reconocimiento de voz (Expo Go / web) el padre hace de juez con botones.
// Protocolo completo: docs/protocolo-pares-minimos.md
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { registerSession, SessionReward } from './valeriaGamification';
import {
  speakToChild, speakWordSlow, stopSpeaking,
  asrSupported, startListening, stopListening, releaseListening, matchPair, PairResult,
} from './valeriaVoice';
import { SpeakButton } from './ValeriaVoiceUI';
import { ValeriaTPRCapsuleOverlay, pickTprCapsule, TprCapsule } from './ValeriaTPRCapsule';
import { MINIMAL_PAIRS, PAIR_GROUPS, MinimalPair } from './valeriaMinimalPairs';

const TOTAL_TRIALS = 10;
const SWAP_TRIALS = [3, 7];   // antes de estos ensayos (0-index): ¡Ahora mandas tú!
const TPR_TRIAL = 5;          // antes de este ensayo: cápsula TPR de movimiento
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

type Phase = 'pick' | 'play' | 'done';
type TrialStep = 'say' | 'listen' | 'judge' | 'correction' | 'success' | 'assist';
type CorrectionKind = 'foil' | 'close' | 'none';

interface TrialRecord {
  result: 'target' | 'assist';
  heard: string;
  attempts: number;   // correcciones consumidas (sustitución o "casi")
  foils: number;      // veces que el STT captó la palabra contraria (sustitución real)
  stars: 1 | 2 | 3;
}

// Combina onDone/onError del TTS en un único "continuar" que solo dispara una
// vez, con temporizador de rescate: si el motor de síntesis nunca avisa del
// final (voces no disponibles, web sin audio), el ensayo no se queda bloqueado.
const afterSpeak = (fn: () => void, maxWaitMs = 15000) => {
  let fired = false;
  const once = () => { if (!fired) { fired = true; clearTimeout(timer); fn(); } };
  const timer = setTimeout(once, maxWaitMs);
  return { onDone: once, onError: once };
};

// ----------------------------------------------------------------------------
// Sello doble: dos huellas en extremos opuestos que padre e hijo deben pulsar
// A LA VEZ para avanzar. Alternativa accesible: mantener pulsada una huella 2 s.
// ----------------------------------------------------------------------------
const DoubleSeal: React.FC<{ label: string; onUnlock: () => void }> = ({ label, onUnlock }) => {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const fired = useRef(false);
  const unlock = () => { if (!fired.current) { fired.current = true; onUnlock(); } };
  useEffect(() => { if (a && b) unlock(); }, [a, b]);

  const seal = (on: boolean, setOn: (v: boolean) => void, emoji: string, who: string) => (
    <Pressable
      onPressIn={() => setOn(true)}
      onPressOut={() => setOn(false)}
      onLongPress={unlock}
      delayLongPress={2000}
      accessibilityRole="button"
      accessibilityLabel={`Huella de ${who}. Pulsad las dos huellas a la vez para continuar, o mantén pulsada esta dos segundos.`}
      style={[s.sealBtn, on && s.sealBtnOn]}
    >
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <Text style={s.sealWho}>{who}</Text>
    </Pressable>
  );

  return (
    <View style={s.sealCard}>
      <Text style={s.sealKicker}>🤝 SELLO DOBLE PARA CONTINUAR</Text>
      <Text style={s.sealLabel}>{label}</Text>
      <View style={s.sealRow}>
        {seal(a, setA, '✋', 'PAPÁ / MAMÁ')}
        <Text style={s.sealPlus}>a la vez</Text>
        {seal(b, setB, '🖐️', 'YO')}
      </View>
      <Text style={s.sealHint}>¿Una sola mano libre? Mantén pulsada una huella 2 segundos.</Text>
    </View>
  );
};

// ----------------------------------------------------------------------------
// Rotación de roles: el padre dice una palabra en secreto y el niño, de juez,
// toca la ficha que oyó (discriminación auditiva). Con STT la app verifica qué
// dijo el padre; sin STT confirma el propio padre.
// ----------------------------------------------------------------------------
const RoleSwapOverlay: React.FC<{ pair: MinimalPair; onDone: () => void }> = ({ pair, onDone }) => {
  const asr = asrSupported();
  const [stage, setStage] = useState<'intro' | 'listen' | 'tap' | 'result'>('intro');
  const [parentSaid, setParentSaid] = useState<'target' | 'foil' | null>(null);
  const [picked, setPicked] = useState<'target' | 'foil' | null>(null);
  const [confirmOk, setConfirmOk] = useState<boolean | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    speakToChild('¡Cambio de papeles! Ahora el niño manda y papá habla.');
    return () => { mounted.current = false; stopListening(); };
  }, []);

  const begin = async () => {
    if (!asr) { setStage('tap'); return; }
    setStage('listen');
    const ok = await startListening({
      onResult: (alts) => {
        if (!mounted.current) return;
        const r = matchPair(alts, pair.target, pair.foil);
        if (r === 'target' || r === 'foil') { setParentSaid(r); setStage('tap'); }
        else { speakToChild('No escuché bien a papá. ¡Otra vez!'); setStage('intro'); }
      },
      onError: () => { if (mounted.current) setStage('tap'); },
    });
    if (!ok && mounted.current) setStage('tap');
  };

  const tapCard = (which: 'target' | 'foil') => {
    setPicked(which);
    if (parentSaid) {
      const hit = which === parentSaid;
      setConfirmOk(hit);
      speakToChild(hit ? '¡Exacto! ¡Qué oreja tan fina!' : `¡Uy! Papá dijo ${parentSaid === 'target' ? pair.target : pair.foil}. ¡Escucha otra vez en el próximo turno!`);
      setStage('result');
    } else {
      setStage('result'); // sin STT: confirma el padre
    }
  };

  const card = (which: 'target' | 'foil') => (
    <Pressable
      onPress={() => stage === 'tap' && tapCard(which)}
      disabled={stage !== 'tap'}
      style={[s.swapTile, picked === which && s.swapTileOn]}
      accessibilityRole="button"
      accessibilityLabel={which === 'target' ? pair.target : pair.foil}
    >
      <Text style={{ fontSize: 46 }}>{which === 'target' ? pair.targetEmoji : pair.foilEmoji}</Text>
      <Text style={s.swapTileCap}>{which === 'target' ? pair.target : pair.foil}</Text>
    </Pressable>
  );

  return (
    <View style={s.overlay}>
      <View style={s.overlayCard}>
        <Text style={s.swapKicker}>👑 ¡AHORA MANDAS TÚ!</Text>
        <Text style={s.swapTitle}>El niño hace de juez</Text>

        {stage === 'intro' && (
          <>
            <Text style={s.swapText}>
              Papá elige EN SECRETO una de las dos palabras y la dice en voz alta, sin señalar.
              {asr ? ' La app también escuchará para comprobar.' : ''}
            </Text>
            <Pressable onPress={begin} style={s.swapBtn}>
              <Text style={s.swapBtnTxt}>{asr ? '🎤 Papá, ¡habla ya!' : '🗣️ Ya la dijo → seguir'}</Text>
            </Pressable>
          </>
        )}

        {stage === 'listen' && <Text style={s.swapText}>👂 Escuchando a papá…</Text>}

        {(stage === 'tap' || stage === 'result') && (
          <>
            <Text style={s.swapText}>¿Cuál dijo papá? ¡Tócala!</Text>
            <View style={s.swapRow}>{card('target')}{card('foil')}</View>
          </>
        )}

        {stage === 'result' && !parentSaid && confirmOk === null && (
          <View style={s.swapRow}>
            <Pressable onPress={() => { setConfirmOk(true); speakToChild('¡Exacto! ¡Qué oreja tan fina!'); }} style={[s.swapBtn, { flex: 1 }]}>
              <Text style={s.swapBtnTxt}>✅ ¡Acertó!</Text>
            </Pressable>
            <Pressable onPress={() => { setConfirmOk(false); speakToChild('¡Uy! Era la otra. ¡Escucha otra vez en el próximo turno!'); }} style={[s.swapBtn, { flex: 1, backgroundColor: '#f59e0b' }]}>
              <Text style={s.swapBtnTxt}>❌ Era la otra</Text>
            </Pressable>
          </View>
        )}

        {stage === 'result' && (parentSaid !== null || confirmOk !== null) && (
          <Pressable onPress={onDone} style={[s.swapBtn, { alignSelf: 'stretch' }]}>
            <Text style={s.swapBtnTxt}>Seguimos con la sesión →</Text>
          </Pressable>
        )}

        <Pressable onPress={onDone}><Text style={s.swapSkip}>Saltar esta vez</Text></Pressable>
      </View>
    </View>
  );
};

// ----------------------------------------------------------------------------
// Pantalla principal
// ----------------------------------------------------------------------------
export const ValeriaMinimalPairsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [phase, setPhase] = useState<Phase>('pick');
  const [pair, setPair] = useState<MinimalPair | null>(null);
  const [trialIdx, setTrialIdx] = useState(0);
  const [step, setStep] = useState<TrialStep>('say');
  const [correctionKind, setCorrectionKind] = useState<CorrectionKind>('none');
  const [heard, setHeard] = useState('');
  const [leftIsTarget, setLeftIsTarget] = useState(true);
  const [log, setLog] = useState<TrialRecord[]>([]);
  const [pendingStars, setPendingStars] = useState<1 | 2 | 3>(3);
  const [swapOpen, setSwapOpen] = useState(false);
  const [activeBreak, setActiveBreak] = useState<TprCapsule | null>(null);
  const [reward, setReward] = useState<SessionReward | null>(null);
  const [listening, setListening] = useState(false);

  const attemptsRef = useRef(0);
  const foilsRef = useRef(0); // sustituciones detectadas en el ensayo actual
  // Evita que un resultado tardío del ASR pise el veredicto manual del padre.
  const listeningRef = useRef(false);
  const mounted = useRef(true);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mounted.current = true;
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

  // ---------------------------------------------------------------- sesión --
  const startSession = (p: MinimalPair) => {
    setPair(p); setPhase('play'); setLog([]); setReward(null);
    setTrialIdx(0); attemptsRef.current = 0; foilsRef.current = 0; setHeard('');
    setLeftIsTarget(Math.random() < 0.5);
    startTrial(p, 0);
  };

  const startTrial = (p: MinimalPair, idx: number) => {
    setStep('say'); setHeard(''); setListening(false);
    // 1.ª vez: bombardeo auditivo de contraste nombrando ambas fichas.
    const text = idx === 0 ? `Esta es ${p.target}. Y esta es ${p.foil}. ${p.prompt}` : p.prompt;
    speakToChild(text, afterSpeak(() => {
      if (!mounted.current) return;
      if (asrSupported()) setTimeout(() => listenNow(p), 400);
      else setStep('judge');
    }));
  };

  // --------------------------------------------------------------- escucha --
  const listenNow = async (p: MinimalPair) => {
    if (!mounted.current) return;
    setStep('listen'); setListening(true); setHeard('');
    listeningRef.current = true;
    const ok = await startListening({
      onPartial: (t) => mounted.current && listeningRef.current && setHeard(t),
      onResult: (alts) => {
        if (!mounted.current || !listeningRef.current) return;
        listeningRef.current = false;
        setListening(false);
        setHeard(alts[0] ?? '');
        resolveBranch(p, matchPair(alts, p.target, p.foil));
      },
      onError: () => {
        if (!mounted.current || !listeningRef.current) return;
        listeningRef.current = false;
        setListening(false);
        resolveBranch(p, 'none');
      },
    });
    if (!ok && mounted.current) { listeningRef.current = false; setListening(false); setStep('judge'); }
  };

  // ------------------------------------------------------------ evaluación --
  const resolveBranch = (p: MinimalPair, branch: PairResult) => {
    if (branch === 'target') {
      setPendingStars(attemptsRef.current === 0 ? 3 : 2);
      setStep('success');
      speakToChild(p.onTarget.say);
      return;
    }
    if (branch === 'foil' || branch === 'close') {
      if (branch === 'foil') foilsRef.current += 1;
      attemptsRef.current += 1;
      if (attemptsRef.current >= 2) {
        // Anti-frustración: nunca un tercer fallo seguido → imitación asistida.
        setStep('assist');
        speakToChild('Vamos a decirla juntos, muy despacito.');
        setTimeout(() => mounted.current && speakWordSlow(p.target), 1500);
      } else {
        setCorrectionKind(branch);
        setStep('correction');
        speakToChild(branch === 'foil' ? p.onFoil.say : '¡Casi casi! Escucha bien y otra vez…');
        setTimeout(() => mounted.current && speakWordSlow(p.target), 2200);
      }
      return;
    }
    // 'none': no captado — re-modelar sin consumir intento ni estrellas.
    setCorrectionKind('none');
    setStep('correction');
    speakToChild('No te escuché bien. ¡Probamos otra vez!');
  };

  const retry = (p: MinimalPair) => {
    setHeard('');
    speakToChild(`¡Otra vez! Di: ${p.target}.`, afterSpeak(() => {
      if (!mounted.current) return;
      if (asrSupported()) setTimeout(() => listenNow(p), 400);
      else setStep('judge');
    }));
    setStep('say');
  };

  // ------------------------------------------------------- avance de ensayo --
  const recordAndNext = (p: MinimalPair, rec: TrialRecord) => {
    const nextLog = [...log, rec];
    setLog(nextLog);
    const next = trialIdx + 1;
    if (next >= TOTAL_TRIALS) { finish(p, nextLog); return; }
    setTrialIdx(next);
    attemptsRef.current = 0;
    foilsRef.current = 0;
    setHeard('');
    setStep('say'); // limpia el veredicto anterior (visible tras los overlays)
    setLeftIsTarget(Math.random() < 0.5);
    if (SWAP_TRIALS.includes(next)) { setSwapOpen(true); return; }
    if (next === TPR_TRIAL) { setActiveBreak(pickTprCapsule()); return; }
    startTrial(p, next);
  };

  const onSealSuccess = (p: MinimalPair) =>
    recordAndNext(p, { result: 'target', heard, attempts: attemptsRef.current, foils: foilsRef.current, stars: pendingStars });

  const onSealAssist = (p: MinimalPair) =>
    recordAndNext(p, { result: 'assist', heard, attempts: attemptsRef.current, foils: foilsRef.current, stars: 1 });

  const finish = async (p: MinimalPair, res: TrialRecord[]) => {
    const avg = res.reduce((a, r) => a + r.stars, 0) / res.length;
    const corrections = res.filter((r) => r.attempts > 0).length;
    const substitutions = res.filter((r) => r.foils > 0).length;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.historial);
      const hist = raw ? JSON.parse(raw) : [];
      const d = new Date();
      hist.push({
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        name: `Pares mínimos · ${p.target} / ${p.foil}`,
        avg: +avg.toFixed(1),
        note: substitutions === 0
          ? `Contraste ${p.phoneme} sin sustituciones detectadas. ¡Fonema consolidándose!`
          : `Sustitución detectada en ${substitutions} de ${res.length} ensayos; ${corrections} con corrección (${p.errorLabel.toLowerCase()}).`,
        completed: true,
      });
      await AsyncStorage.setItem(STORAGE_KEYS.historial, JSON.stringify(hist));
      // Registro clínico por par: evolución del % de sustitución entre sesiones.
      const rawPm = await AsyncStorage.getItem(STORAGE_KEYS.paresMinimos);
      const pm = rawPm ? JSON.parse(rawPm) : [];
      pm.push({ date: d.toISOString(), pairId: p.id, phoneme: p.phoneme, trials: res });
      await AsyncStorage.setItem(STORAGE_KEYS.paresMinimos, JSON.stringify(pm));
    } catch (e) { /* almacenamiento no disponible */ }
    try { setReward(await registerSession(avg, res.length)); } catch (e) { /* noop */ }
    setPhase('done');
    speakToChild('¡Sesión de pares completada! ¡Choca esos cinco con papá!');
  };

  const restart = (p: MinimalPair) => {
    setLog([]); setReward(null); setTrialIdx(0); attemptsRef.current = 0; foilsRef.current = 0;
    setHeard(''); setLeftIsTarget(Math.random() < 0.5); setPhase('play');
    startTrial(p, 0);
  };

  // ------------------------------------------------------------------- UI --
  const micScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  const pairTile = (p: MinimalPair, which: 'target' | 'foil') => {
    const isTarget = which === 'target';
    const ok = step === 'success' && isTarget;
    const bad = step === 'correction' && correctionKind === 'foil' && !isTarget;
    return (
      <View key={which} style={[s.bigTile, ok && s.bigTileOk, bad && s.bigTileBad]}>
        <Text style={{ fontSize: 58 }}>{isTarget ? p.targetEmoji : p.foilEmoji}</Text>
        <Text style={s.bigTileCap}>{isTarget ? p.target : p.foil}</Text>
        {ok && <Text style={s.tileBadge}>✅</Text>}
        {bad && <Text style={s.tileBadge}>👂</Text>}
      </View>
    );
  };

  // El padre es el juez final: puede corregir el veredicto del STT. Si estaba
  // en corrección por un falso "foil", ese intento espurio se devuelve.
  const overrideRow = (p: MinimalPair) => (
    <View style={s.overrideRow}>
      <Text style={s.overrideLbl}>¿La app oyó mal? Corrige tú:</Text>
      <Pressable
        onPress={() => {
          if (step === 'correction' && correctionKind !== 'none') attemptsRef.current = Math.max(0, attemptsRef.current - 1);
          resolveBranch(p, 'target');
        }}
        style={s.overridePill}
      >
        <Text style={s.overridePillTxt}>{p.targetEmoji} dijo “{p.target}”</Text>
      </Pressable>
      <Pressable onPress={() => step !== 'correction' && resolveBranch(p, 'foil')} style={s.overridePill}>
        <Text style={s.overridePillTxt}>{p.foilEmoji} dijo “{p.foil}”</Text>
      </Pressable>
    </View>
  );

  const missionCard = (title: string, text: string) => (
    <View style={s.missionCard}>
      <View style={s.missionHead}>
        <View style={s.missionIcon}><Text style={{ fontSize: 17 }}>🏃</Text></View>
        <Text style={s.missionKicker}>{title}</Text>
        <View style={{ marginLeft: 'auto' }}><SpeakButton text={text} voice="child" compact /></View>
      </View>
      <Text style={s.missionTxt}>{text}</Text>
    </View>
  );

  // =================================================================== PICK ==
  if (phase === 'pick') {
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
          <Text style={s.logoFallback}>valeria+</Text>
          <Text style={s.headerTitle}>Pares Mínimos</Text>
          <Text style={s.headerSub}>Dislalias fonológicas · el niño pide la ficha con su voz</Text>
        </View>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.howCard}>
            <Text style={s.howKicker}>⚡ CÓMO FUNCIONA</Text>
            <Text style={s.howTxt}>
              Aparecen dos fichas casi iguales (rana / lana). La app pide una en voz alta, el niño
              la dice al micrófono y la app detecta si salió el fonema o la sustitución habitual.
              Cada ensayo termina con una misión física en pareja y el sello doble: ¡sin las manos
              de los dos en la pantalla no se avanza!
            </Text>
          </View>
          {PAIR_GROUPS.map((g) => (
            <View key={g}>
              <Text style={s.groupLabel}>{g.toUpperCase()}</Text>
              {MINIMAL_PAIRS.filter((p) => p.group === g).map((p) => (
                <Pressable key={p.id} onPress={() => startSession(p)} style={s.pickRow} accessibilityRole="button" accessibilityLabel={`Practicar el par ${p.target} y ${p.foil}`}>
                  <View style={s.codeChip}><Text style={s.codeChipTxt}>{p.code}</Text></View>
                  <Text style={{ fontSize: 26 }}>{p.targetEmoji}</Text>
                  <Text style={{ fontSize: 26 }}>{p.foilEmoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.pickName}>{p.target} / {p.foil}</Text>
                    <Text style={s.pickCat}>{p.errorLabel} · {p.phoneme}{p.region ? ' · solo variedades con distinción s/z' : ''}</Text>
                  </View>
                  <View style={s.playBtn}><Text style={{ color: V.color.primaryDark, fontSize: 13 }}>▶</Text></View>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  const p = pair!;

  // =================================================================== DONE ==
  if (phase === 'done') {
    const avg = log.reduce((a, r) => a + r.stars, 0) / (log.length || 1);
    const substitutions = log.filter((r) => r.foils > 0).length;
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
          <Text style={s.logoFallback}>valeria+</Text>
          <Text style={s.headerTitle}>¡Par completado!</Text>
          <Text style={s.headerSub}>{p.code} · {p.target} / {p.foil}</Text>
        </View>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.doneCard}>
            <Text style={{ fontSize: 44 }}>🎉</Text>
            <Text style={s.doneTitle}>¡Sesión de pares completada!</Text>
            <Text style={s.doneBig}>{avg.toFixed(1)}<Text style={s.doneSlash}> / 3 ★</Text></Text>
            <Text style={s.doneSub}>
              {substitutions === 0
                ? `Ninguna sustitución detectada en el contraste ${p.phoneme}. ¡El fonema se está consolidando!`
                : `El micrófono detectó la sustitución en ${substitutions} de ${log.length} ensayos. Es normal: cada corrección es práctica del contraste.`}
            </Text>
            <View style={s.doneStarsRow}>
              {log.map((r, i) => (
                <View key={i} style={s.doneStarCell}>
                  <Text style={s.doneStarIdx}>{i + 1}</Text>
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
            <Pressable onPress={() => restart(p)}><Text style={s.linkBtn}>Repetir este par</Text></Pressable>
            <Pressable onPress={() => setPhase('pick')}><Text style={s.linkBtn}>Elegir otro par</Text></Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // =================================================================== PLAY ==
  const tiles = leftIsTarget ? (['target', 'foil'] as const) : (['foil', 'target'] as const);

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <Pressable onPress={() => { stopSpeaking(); stopListening(); navigation.goBack(); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
        <Text style={s.logoFallback}>valeria+</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>Pares Mínimos</Text>
            <Text style={s.headerSub} numberOfLines={1}>{p.code} · {p.errorLabel} ({p.phoneme})</Text>
          </View>
          <View style={s.counter}><Text style={s.counterTxt}>{trialIdx + 1} / {TOTAL_TRIALS}</Text></View>
        </View>
        <View style={s.dots}>
          {Array.from({ length: TOTAL_TRIALS }).map((_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: i < trialIdx ? '#fff' : i === trialIdx ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.32)' }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Las dos fichas del contraste (posición aleatoria por ensayo) */}
        <View style={s.tilesRow}>{tiles.map((w) => pairTile(p, w))}</View>

        {/* Consigna */}
        <View style={s.promptCard}>
          <View style={s.promptHead}>
            <View style={s.promptIcon}><Text style={{ fontSize: 18 }}>📢</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.promptKicker}>LA APP PIDE</Text>
              <Text style={s.promptTxt}>“{p.prompt}”</Text>
            </View>
            <SpeakButton text={p.prompt} voice="child" compact />
          </View>
        </View>

        {/* ===== Estado del ensayo ===== */}
        {step === 'say' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 30 }}>🔊</Text>
            <Text style={s.stateTxt}>La app está hablando… preparad la voz.</Text>
          </View>
        )}

        {step === 'listen' && (
          <View style={s.stateCard}>
            <Animated.View style={{ transform: [{ scale: micScale }] }}>
              <View style={s.micRing}><Text style={{ fontSize: 30 }}>🎤</Text></View>
            </Animated.View>
            <Text style={s.stateTxt}>¡Ahora el niño! Di la palabra al micrófono…</Text>
            {!!heard && <Text style={s.partialTxt}>✨ {heard}</Text>}
            <Pressable
              onPress={() => { listeningRef.current = false; setListening(false); stopListening(); setStep('judge'); }}
              style={s.stopPill}
            >
              <Text style={s.stopPillTxt}>Parar · el padre decide</Text>
            </Pressable>
          </View>
        )}

        {step === 'judge' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 26 }}>👂</Text>
            <Text style={s.stateTxt}>El padre hace de juez: ¿qué dijo el niño?</Text>
            <View style={s.judgeRow}>
              <Pressable onPress={() => resolveBranch(p, 'target')} style={[s.judgeBtn, { backgroundColor: V.color.successBg, borderColor: '#bfe9d4' }]}>
                <Text style={{ fontSize: 22 }}>{p.targetEmoji}</Text><Text style={s.judgeTxt}>Dijo “{p.target}”</Text>
              </Pressable>
              <Pressable onPress={() => resolveBranch(p, 'foil')} style={[s.judgeBtn, { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' }]}>
                <Text style={{ fontSize: 22 }}>{p.foilEmoji}</Text><Text style={s.judgeTxt}>Dijo “{p.foil}”</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => retry(p)}><Text style={s.linkBtn}>No se entendió · repetir consigna</Text></Pressable>
          </View>
        )}

        {step === 'success' && (
          <>
            <View style={[s.verdictCard, s.verdictOk]}>
              <Text style={{ fontSize: 26 }}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>¡Fonema conseguido!</Text>
                <Text style={s.verdictSub}>{heard ? `La app escuchó: “${heard}”` : 'Veredicto del padre.'} · {pendingStars}★</Text>
              </View>
              <Text style={s.verdictStars}>{'★'.repeat(pendingStars)}</Text>
            </View>
            {missionCard('MISIÓN FÍSICA DE CELEBRACIÓN', p.onTarget.mission)}
            {asrSupported() && overrideRow(p)}
            <DoubleSeal label="Misión hecha: ¡sellad juntos para el siguiente ensayo!" onUnlock={() => onSealSuccess(p)} />
          </>
        )}

        {step === 'correction' && (
          <>
            <View style={[s.verdictCard, correctionKind === 'foil' ? s.verdictWarn : s.verdictNeutral]}>
              <Text style={{ fontSize: 26 }}>{correctionKind === 'foil' ? '👂' : correctionKind === 'close' ? '💪' : '😅'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>
                  {correctionKind === 'foil' ? `Escuché “${p.foil}”… ¡era la otra ficha!`
                    : correctionKind === 'close' ? '¡Casi casi!'
                      : 'No te escuché bien'}
                </Text>
                <Text style={s.verdictSub}>
                  {correctionKind === 'foil' ? `Pista: ${p.onFoil.cue}`
                    : correctionKind === 'close' ? 'Se parece mucho. Escuchad el modelo despacio y otra vez.'
                      : 'Este intento no cuenta. Acercaos al micrófono y repetimos.'}
                </Text>
              </View>
            </View>
            {correctionKind === 'foil' && missionCard('MISIÓN FÍSICA CORRECTIVA', p.onFoil.mission)}
            <View style={s.retryRow}>
              <SpeakButton text={p.target} label="Oír modelo despacio" voice="slow" />
              <Pressable onPress={() => retry(p)} style={s.retryBtn}><Text style={s.retryBtnTxt}>🎤 ¡Otra vez!</Text></Pressable>
            </View>
            {asrSupported() && correctionKind !== 'none' && overrideRow(p)}
          </>
        )}

        {step === 'assist' && (
          <>
            <View style={[s.verdictCard, s.verdictNeutral]}>
              <Text style={{ fontSize: 26 }}>🤝</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>Imitación juntos (1★)</Text>
                <Text style={s.verdictSub}>
                  Papá dice “{p.target}” muy despacio tocando la mejilla del niño, y el niño la repite
                  a la vez. Sin prisa: hoy la practicamos, mañana sale sola.
                </Text>
              </View>
            </View>
            <View style={s.retryRow}>
              <SpeakButton text={p.target} label="Oír modelo despacio" voice="slow" />
            </View>
            <DoubleSeal label="¿La dijisteis juntos? ¡Sellad y seguimos!" onUnlock={() => onSealAssist(p)} />
          </>
        )}
      </ScrollView>

      {/* Rotación de roles y cápsula TPR (bloquean hasta completarse) */}
      {swapOpen && (
        <RoleSwapOverlay pair={p} onDone={() => { setSwapOpen(false); startTrial(p, trialIdx); }} />
      )}
      {activeBreak && (
        <ValeriaTPRCapsuleOverlay
          capsule={activeBreak}
          onDone={() => { setActiveBreak(null); startTrial(p, trialIdx); }}
          onSkip={() => { setActiveBreak(null); startTrial(p, trialIdx); }}
        />
      )}
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
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flex: 1, height: 7, borderRadius: 4 },
  scroll: { padding: 16, paddingBottom: 32 },

  // pick
  howCard: { backgroundColor: V.color.primaryTint, borderWidth: 1.5, borderColor: '#b8eee9', borderRadius: 16, padding: 14, marginBottom: 6 },
  howKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  howTxt: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 7, lineHeight: 19 },
  groupLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.4, marginTop: 16, marginBottom: 8, marginHorizontal: 4 },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 15, padding: 12, marginBottom: 9, ...V.shadow.card },
  codeChip: { backgroundColor: V.color.primaryLight, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 },
  codeChipTxt: { color: V.color.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  pickName: { fontSize: 14.5, fontWeight: '800', color: V.color.textPrimary, textTransform: 'capitalize' },
  pickCat: { fontSize: 11, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  playBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },

  // fichas del par
  tilesRow: { flexDirection: 'row', gap: 12 },
  bigTile: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: V.color.border, borderRadius: 20, paddingVertical: 20, alignItems: 'center', ...V.shadow.card },
  bigTileOk: { backgroundColor: V.color.successBg, borderColor: V.color.success },
  bigTileBad: { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' },
  bigTileCap: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary, marginTop: 8, textTransform: 'capitalize' },
  tileBadge: { position: 'absolute', top: 8, right: 10, fontSize: 16 },

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
  judgeTxt: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary, textTransform: 'capitalize' },

  verdictCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 16, borderWidth: 1.5, padding: 13, marginTop: 12 },
  verdictOk: { backgroundColor: V.color.successBg, borderColor: '#bfe9d4' },
  verdictWarn: { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' },
  verdictNeutral: { backgroundColor: '#fff', borderColor: V.color.border },
  verdictTitle: { fontSize: 14.5, fontWeight: '800', color: V.color.textPrimary },
  verdictSub: { fontSize: 12, fontWeight: '600', color: V.color.textSecondary, marginTop: 2, lineHeight: 17 },
  verdictStars: { fontSize: 16, color: V.color.star, letterSpacing: 1 },

  missionCard: { backgroundColor: '#fff7ed', borderColor: '#fcd9a8', borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 12 },
  missionHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  missionIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  missionKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#9a5b13' },
  missionTxt: { marginTop: 9, fontSize: 13.5, fontWeight: '700', color: '#7c4a0e', lineHeight: 19 },

  overrideRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, marginTop: 10, paddingHorizontal: 2 },
  overrideLbl: { fontSize: 11, fontWeight: '700', color: V.color.textMuted },
  overridePill: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  overridePillTxt: { fontSize: 11.5, fontWeight: '800', color: V.color.textSecondary },

  retryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  retryBtn: { flex: 1, backgroundColor: V.color.primary, borderRadius: 13, paddingVertical: 12, alignItems: 'center', ...V.shadow.button },
  retryBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // sello doble
  sealCard: { backgroundColor: '#f5f0ff', borderWidth: 1.5, borderColor: '#ddccfa', borderRadius: 18, padding: 14, marginTop: 12, alignItems: 'center' },
  sealKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#6d3fc4' },
  sealLabel: { fontSize: 12.5, fontWeight: '700', color: V.color.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 17 },
  sealRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 12 },
  sealBtn: { width: 92, height: 92, borderRadius: 26, backgroundColor: '#fff', borderWidth: 2, borderColor: '#ddccfa', alignItems: 'center', justifyContent: 'center', gap: 2 },
  sealBtnOn: { backgroundColor: '#7c4fd0', borderColor: '#7c4fd0' },
  sealWho: { fontSize: 9, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.3 },
  sealPlus: { fontSize: 12, fontWeight: '800', color: '#6d3fc4' },
  sealHint: { fontSize: 10.5, fontWeight: '600', color: V.color.textMuted, marginTop: 10, textAlign: 'center' },

  // rotación de roles
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,18,32,.6)', alignItems: 'center', justifyContent: 'center', padding: 26 },
  overlayCard: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 26, padding: 22, alignItems: 'center' },
  swapKicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.1, color: '#f59e0b' },
  swapTitle: { fontSize: 20, fontWeight: '800', color: V.color.textPrimary, marginTop: 8 },
  swapText: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 10, lineHeight: 19, textAlign: 'center' },
  swapRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 14 },
  swapTile: { flex: 1, alignItems: 'center', backgroundColor: V.color.pageBg, borderWidth: 2, borderColor: '#eef2f1', borderRadius: 16, paddingVertical: 14 },
  swapTileOn: { borderColor: V.color.primary, backgroundColor: V.color.primaryLight },
  swapTileCap: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary, marginTop: 4, textTransform: 'capitalize' },
  swapBtn: { backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 18, alignItems: 'center', marginTop: 14, ...V.shadow.button },
  swapBtnTxt: { color: '#fff', fontSize: 13.5, fontWeight: '800' },
  swapSkip: { marginTop: 13, fontSize: 12.5, fontWeight: '700', color: V.color.textMuted },

  // done
  doneCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 22, padding: 24, alignItems: 'center', ...V.shadow.card },
  doneTitle: { fontSize: 21, fontWeight: '800', color: V.color.textPrimary, marginTop: 10 },
  doneBig: { fontSize: 40, fontWeight: '800', color: V.color.textPrimary, marginTop: 10 },
  doneSlash: { fontSize: 18, color: V.color.textMuted, fontWeight: '800' },
  doneSub: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  doneStarsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16, justifyContent: 'center' },
  doneStarCell: { alignItems: 'center', backgroundColor: V.color.pageBg, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 8 },
  doneStarIdx: { fontSize: 9, fontWeight: '800', color: V.color.textMuted },
  rewardRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 16 },
  rewardChip: { flex: 1, backgroundColor: '#e6f9f8', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  rewardBig: { fontSize: 20, fontWeight: '800', color: V.color.textPrimary },
  rewardLbl: { fontSize: 11, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  primaryBtn: { alignSelf: 'stretch', marginTop: 18, backgroundColor: V.color.primary, borderRadius: 15, paddingVertical: 15, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  linkBtn: { marginTop: 12, color: V.color.primaryDark, fontSize: 13, fontWeight: '800', textAlign: 'center' },
});

export default ValeriaMinimalPairsScreen;

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
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, Switch, GestureResponderEvent, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { ProUnlockPill, ProPinModal } from './ValeriaProPin';
import { registerSession, SessionReward } from './valeriaGamification';
import { markBlockCompleted, trackListenStart, trackListenNoMatch } from './valeriaTelemetry';
import {
  speakToChild, speakWordSlow, stopSpeaking,
  asrSupported, startListening, stopListening, releaseListening, matchPair, PairResult,
  almostPhrase, noHearPhrase, togetherPhrase,
} from './valeriaVoice';
import { SpeakButton, TurnPhaseStrip } from './ValeriaVoiceUI';
import { FichaVisual } from './ValeriaPictograms';
import { ValeriaSessionBreakOverlay, pickSessionBreak, SessionBreak } from './ValeriaSessionBreakOverlay';
import { PAIR_GROUPS, MinimalPair } from './valeriaMinimalPairs';
import { pairsForLocale } from './valeriaPairBanks';
import { getLocale, Locale } from './valeriaLocale';
import { useT } from './i18n';
import {
  pairIntro, pairRetry, pairsDone, roleSwapPhrases,
} from './valeriaPairSpeech';
import { getAutoRecordPref, setAutoRecordPref } from './valeriaRecordingPref';
import { ValeriaAdultChaosPanel } from './ValeriaAdultChaosPanel';
import { releaseNoise } from './valeriaNoise';
import { ValeriaPragmaticBreakOverlay } from './ValeriaPragmaticBreak';
import { ValeriaDistractorBear } from './ValeriaDistractorBear';

const TOTAL_TRIALS = 10;
const SWAP_TRIALS = [3, 7];   // antes de estos ensayos (0-index): ¡Ahora mandas tú!
const TPR_TRIAL = 5;          // antes de este ensayo: cápsula TPR de movimiento


// Consigna del ensayo (DC-5, resuelta por ACOPROS en julio de 2026):
// TODOS los ensayos usan el mismo formato — presentación del par seguida de la
// petición desnuda del objetivo: «Esta es rata. Y esta es lata. Di: rata.».
//
// Antes se alternaban tres formatos (bombardeo de contraste en el ensayo 0,
// consigna clínica cada tercer ensayo y FRASE PORTADORA procedural en el
// resto). Las logopedas pidieron pedir la palabra, no una frase alrededor de
// ella, y ACOPROS eligió el formato de par + repetición. La frase portadora se
// retira del flujo: su módulo (valeriaCarrierPhrases) se conserva por si se
// recupera como modo avanzado, pero ya no se enumera en el corpus de voz,
// porque el corpus solo debe contener lo que la app realmente pronuncia.
interface TrialPromptSpec { text: string; mode: 'child' | 'slow'; }

const trialPrompt = (p: MinimalPair, _idx: number, loc: Locale): TrialPromptSpec =>
  ({ text: pairIntro(loc, p.target, p.foil, p.prompt), mode: 'child' });

type Phase = 'pick' | 'play' | 'done';
// 'ready': entre la consigna y la escucha — el micrófono espera al botón del
// adulto/niño (PM-04) salvo que la preferencia de grabación automática esté
// activada, en cuyo caso se salta directo a 'listen' como antes.
type TrialStep = 'say' | 'ready' | 'listen' | 'judge' | 'correction' | 'success' | 'assist';
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
// Los dedos se cuentan con onTouchStart/onTouchEnd sobre la tarjeta completa:
// el sistema de gestos de RN solo permite UN responder a la vez, así que dos
// Pressables hermanos jamás llegan a estar pulsados simultáneamente (el segundo
// toque cancela el primero) y el sello por estados a/b dejaba la sesión sin
// poder avanzar (bug reportado: los ensayos no avanzaban ni puntuaban).
// ----------------------------------------------------------------------------
const DoubleSeal: React.FC<{ label: string; onUnlock: () => void }> = ({ label, onUnlock }) => {
  const t = useT();
  const [touchCount, setTouchCount] = useState(0);
  const fired = useRef(false);
  const unlock = () => { if (!fired.current) { fired.current = true; onUnlock(); } };

  // Burbujea desde cualquier punto de la tarjeta sin competir por el responder,
  // por lo que sí ve TODOS los dedos a la vez.
  const countTouches = (e: GestureResponderEvent) => {
    const n = e.nativeEvent.touches.length;
    setTouchCount(n);
    if (n >= 2) unlock();
  };

  const seal = (emoji: string, who: string) => (
    <Pressable
      onLongPress={unlock}
      delayLongPress={2000}
      accessibilityRole="button"
      accessibilityLabel={`Huella de ${who}. Pulsad las dos huellas a la vez para continuar, o mantén pulsada esta dos segundos.`}
      style={({ pressed }) => [s.sealBtn, (pressed || touchCount >= 2) && s.sealBtnOn]}
    >
      <Text style={{ fontSize: 30 }}>{emoji}</Text>
      <Text style={s.sealWho}>{who}</Text>
    </Pressable>
  );

  return (
    <View
      style={s.sealCard}
      onTouchStart={countTouches}
      onTouchEnd={countTouches}
      onTouchCancel={() => setTouchCount(0)}
    >
      <Text style={s.sealKicker}>{t.pairs.sealKicker}</Text>
      {/* ACOPROS: el sello se veía pero no se entendía para qué servía. La
          mecánica ya se explicaba («pulsad a la vez»); lo que faltaba era el
          motivo, que es el único que justifica el estorbo de pedir dos manos. */}
      <Text style={s.sealWhy}>{t.pairs.sealWhy}</Text>
      <Text style={s.sealLabel}>{label}</Text>
      <View style={s.sealRow}>
        {seal('✋', t.pairs.sealAdult)}
        <Text style={s.sealPlus}>{t.pairs.sealPlus}</Text>
        {seal('🖐️', t.pairs.sealChild)}
      </View>
      <Text style={s.sealHint}>{t.pairs.sealHint}</Text>
    </View>
  );
};

// ----------------------------------------------------------------------------
// Rotación de roles: el padre dice una palabra en secreto y el niño, de juez,
// toca la ficha que oyó (discriminación auditiva). Con STT la app verifica qué
// dijo el padre; sin STT confirma el propio padre.
// ----------------------------------------------------------------------------
const RoleSwapOverlay: React.FC<{ pair: MinimalPair; onDone: () => void }> = ({ pair, onDone }) => {
  const t = useT();
  const asr = asrSupported();
  const rs = roleSwapPhrases(getLocale()); // frases por variedad (gl → Celtia)
  const [stage, setStage] = useState<'intro' | 'listen' | 'tap' | 'result'>('intro');
  const [parentSaid, setParentSaid] = useState<'target' | 'foil' | null>(null);
  const [picked, setPicked] = useState<'target' | 'foil' | null>(null);
  const [confirmOk, setConfirmOk] = useState<boolean | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    speakToChild(rs.intro);
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
        else { speakToChild(rs.notHeard); setStage('intro'); }
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
      speakToChild(hit ? rs.hit : rs.parentSaid(parentSaid === 'target' ? pair.target : pair.foil));
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
      <FichaVisual word={which === 'target' ? pair.target : pair.foil} emoji={which === 'target' ? pair.targetEmoji : pair.foilEmoji} pic={which === 'target' ? pair.targetPictogram : pair.foilPictogram} size={46} />
      <Text style={s.swapTileCap}>{which === 'target' ? pair.target : pair.foil}</Text>
    </Pressable>
  );

  return (
    <View style={s.overlay}>
      <View style={s.overlayCard}>
        <Text style={s.swapKicker}>{t.pairs.swapKicker}</Text>
        <Text style={s.swapTitle}>{t.pairs.swapTitle}</Text>

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

        {stage === 'listen' && <Text style={s.swapText}>{t.pairs.swapListening}</Text>}

        {(stage === 'tap' || stage === 'result') && (
          <>
            <Text style={s.swapText}>{t.pairs.swapWhich}</Text>
            <View style={s.swapRow}>{card('target')}{card('foil')}</View>
          </>
        )}

        {stage === 'result' && !parentSaid && confirmOk === null && (
          <View style={s.swapRow}>
            <Pressable onPress={() => { setConfirmOk(true); speakToChild(rs.hit); }} style={[s.swapBtn, { flex: 1 }]}>
              <Text style={s.swapBtnTxt}>{t.pairs.swapHit}</Text>
            </Pressable>
            <Pressable onPress={() => { setConfirmOk(false); speakToChild(rs.missOther); }} style={[s.swapBtn, { flex: 1, backgroundColor: '#f59e0b' }]}>
              <Text style={s.swapBtnTxt}>{t.pairs.swapMiss}</Text>
            </Pressable>
          </View>
        )}

        {stage === 'result' && (parentSaid !== null || confirmOk !== null) && (
          <Pressable onPress={onDone} style={[s.swapBtn, { alignSelf: 'stretch' }]}>
            <Text style={s.swapBtnTxt}>{t.pairs.swapContinue}</Text>
          </Pressable>
        )}

        <Pressable onPress={onDone}><Text style={s.swapSkip}>{t.pairs.swapSkip}</Text></Pressable>
      </View>
    </View>
  );
};

// ----------------------------------------------------------------------------
// Pantalla principal
// ----------------------------------------------------------------------------
export const ValeriaMinimalPairsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  // Variedad y banco activos (es / gl / es-DO). Se fijan al montar la pantalla
  // para no cambiar a media sesión; la variedad se elige antes, en la tarjeta
  // «Voz de la app». loc localiza consignas, reintentos, cierre y rotación.
  const [loc] = useState<Locale>(() => getLocale());
  const [pairs] = useState<MinimalPair[]>(() => pairsForLocale(loc));
  const [phase, setPhase] = useState<Phase>('pick');
  const [pair, setPair] = useState<MinimalPair | null>(null);
  const [trialIdx, setTrialIdx] = useState(0);
  const [step, setStep] = useState<TrialStep>('say');
  const [correctionKind, setCorrectionKind] = useState<CorrectionKind>('none');
  const [heard, setHeard] = useState('');
  // Aviso PARA EL ADULTO cuando el turno se pierde por algo que no es el niño y
  // que él puede resolver (permiso del micrófono, reconocedor no disponible).
  // Antes, cualquier fallo del motor se traducía en el mismo «no te escuché
  // bien» dicho al niño y el adulto no tenía forma de saber qué pasaba: la
  // sesión parecía rota sin decir por qué. El mensaje del motor solo se enseña
  // cuando NO es un no-match, que es el único caso en el que hay algo que hacer.
  const [asrNote, setAsrNote] = useState('');
  const [leftIsTarget, setLeftIsTarget] = useState(true);
  const [log, setLog] = useState<TrialRecord[]>([]);
  const [pendingStars, setPendingStars] = useState<1 | 2 | 3>(3);
  const [swapOpen, setSwapOpen] = useState(false);
  const [activeBreak, setActiveBreak] = useState<SessionBreak | null>(null);
  const [reward, setReward] = useState<SessionReward | null>(null);
  const [listening, setListening] = useState(false);
  // Consigna viva del ensayo (frase portadora o consigna del par) para la
  // tarjeta "LA APP PIDE" y su botón de repetición con la voz adecuada.
  const [livePrompt, setLivePrompt] = useState<TrialPromptSpec | null>(null);
  // Panel del adulto (Fase 2): controles SIEMPRE manuales del caos comunicativo.
  const [distractorOn, setDistractorOn] = useState(false);
  const [pragmaticOpen, setPragmaticOpen] = useState(false);
  // Prescripción del logopeda: { [pairId]: boolean }, id ausente = activo.
  // Modo Familia solo practica los pares prescritos; el PIN desbloquea la edición.
  const [prescribed, setPrescribed] = useState<Record<string, boolean>>({});
  const [unlocked, setUnlocked] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [toast, setToast] = useState('');
  // PM-04: por defecto MANUAL — el micro no arranca solo tras la consigna.
  const [autoRecord, setAutoRecord] = useState(false);

  const attemptsRef = useRef(0);
  const foilsRef = useRef(0); // sustituciones detectadas en el ensayo actual
  // Vuelve arriba al cambiar de ensayo: sin esto la lista conserva el scroll
  // del ensayo anterior y el nuevo aparece "a mitad", como si no avanzara.
  const scrollRef = useRef<ScrollView | null>(null);
  // Evita que un resultado tardío del ASR pise el veredicto manual del padre.
  const listeningRef = useRef(false);
  // Mejor parcial de la escucha en curso. Android cierra a veces el turno con
  // un resultado final vacío después de haber ido devolviendo parciales
  // correctos; sin esta red, ese turno se perdía como si el niño no hubiera
  // hablado. La Expansión Semántica ya rescataba el parcial (ES-04); Pares
  // Mínimos lo tiraba.
  const bestPartialRef = useRef('');
  const mounted = useRef(true);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.paresPrescripcion);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p === 'object' && !Array.isArray(p) && mounted.current) setPrescribed(p);
        }
      } catch (e) { /* noop */ }
      const auto = await getAutoRecordPref();
      if (mounted.current) setAutoRecord(auto);
    })();
    return () => { mounted.current = false; stopSpeaking(); stopListening(); releaseListening(); releaseNoise(); };
  }, []);

  useEffect(() => {
    if (phase === 'play') scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [phase, trialIdx]);

  // ES-02: el botón atrás físico de Android se comporta igual que el botón
  // Volver de la cabecera — dentro de una sesión regresa al banco de
  // contrastes, no cierra la pantalla entera.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (phase === 'play' || phase === 'done') {
        stopSpeaking(); stopListening();
        setPhase('pick');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [phase]);

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
  const isPrescribed = (id: string) => prescribed[id] !== false;
  const activeCount = pairs.filter((p) => isPrescribed(p.id)).length;

  const togglePrescribed = (id: string) => {
    if (!unlocked) return;
    setPrescribed((prev) => ({ ...prev, [id]: !(prev[id] !== false) }));
    setToast('');
  };

  const savePrescription = async () => {
    try { await AsyncStorage.setItem(STORAGE_KEYS.paresPrescripcion, JSON.stringify(prescribed)); } catch (e) { /* noop */ }
    setUnlocked(false);
    setToast(`Prescripción guardada · ${activeCount} de ${pairs.length} pares activos.`);
  };

  // ---------------------------------------------------------------- sesión --
  const startSession = (p: MinimalPair) => {
    setPair(p); setPhase('play'); setLog([]); setReward(null);
    setTrialIdx(0); attemptsRef.current = 0; foilsRef.current = 0; setHeard('');
    setLeftIsTarget(Math.random() < 0.5);
    startTrial(p, 0);
  };

  const startTrial = (p: MinimalPair, idx: number) => {
    setStep('say'); setHeard(''); setListening(false); setAsrNote('');
    // 1.ª vez: bombardeo auditivo de contraste; después alternancia entre
    // consigna clínica y frase portadora procedural (ver trialPrompt).
    const spec = trialPrompt(p, idx, loc);
    setLivePrompt(spec);
    const cbs = afterSpeak(() => {
      if (!mounted.current) return;
      if (!asrSupported()) { setStep('judge'); return; }
      if (autoRecord) setTimeout(() => listenNow(p), 400);
      else setStep('ready');
    });
    speakToChild(spec.text, cbs);
  };

  // --------------------------------------------------------------- escucha --
  const listenNow = async (p: MinimalPair) => {
    if (!mounted.current) return;
    setStep('listen'); setListening(true); setHeard(''); setAsrNote('');
    listeningRef.current = true;
    bestPartialRef.current = '';
    // ES-04 · La ventana de escucha ampliada llega a esta pantalla por
    // startListening; medir aquí también hace comparable el antes/después de
    // los dos bloques que usan micrófono.
    trackListenStart();

    // Cierra el turno con lo que haya: las alternativas finales o, si llegan
    // vacías, el mejor parcial. Sin candidatos es 'none' de verdad.
    const cerrar = (alts: string[]) => {
      listeningRef.current = false;
      setListening(false);
      const partial = bestPartialRef.current.trim();
      const candidatos = alts.filter(Boolean);
      if (!candidatos.length && partial) candidatos.push(partial);
      setHeard(candidatos[0] ?? '');
      resolveBranch(p, candidatos.length ? matchPair(candidatos, p.target, p.foil) : 'none');
    };

    const ok = await startListening({
      onPartial: (t) => {
        if (!mounted.current || !listeningRef.current) return;
        if (t.trim().length > bestPartialRef.current.length) bestPartialRef.current = t.trim();
        setHeard(t);
      },
      onResult: (alts) => {
        if (!mounted.current || !listeningRef.current) return;
        cerrar(alts);
      },
      onError: (msg, noMatch) => {
        if (!mounted.current || !listeningRef.current) return;
        // Con un parcial rescatable el turno se evalúa igual: el niño habló.
        if (bestPartialRef.current.trim()) { cerrar([]); return; }
        listeningRef.current = false;
        setListening(false);
        if (noMatch) trackListenNoMatch();
        else setAsrNote(msg); // esto lo arregla el adulto, no el niño
        resolveBranch(p, 'none');
      },
    });
    if (!ok && mounted.current) { listeningRef.current = false; setListening(false); setStep('judge'); }
  };

  // ------------------------------------------------------------ evaluación --
  // Cada rama actualiza livePrompt ANTES de hablar: la tarjeta "LA APP DICE"
  // debe ser siempre un espejo de la última locución real (PM-03), incluido
  // el modelado lento diferido que llega tras el temporizador.
  const resolveBranch = (p: MinimalPair, branch: PairResult) => {
    if (branch === 'target') {
      setPendingStars(attemptsRef.current === 0 ? 3 : 2);
      setStep('success');
      setLivePrompt({ text: p.onTarget.say, mode: 'child' });
      speakToChild(p.onTarget.say);
      return;
    }
    if (branch === 'foil' || branch === 'close') {
      if (branch === 'foil') foilsRef.current += 1;
      attemptsRef.current += 1;
      if (attemptsRef.current >= 2) {
        // Anti-frustración: nunca un tercer fallo seguido → imitación asistida.
        setStep('assist');
        const together = togetherPhrase();
        setLivePrompt({ text: together, mode: 'child' });
        speakToChild(together);
        setTimeout(() => {
          if (!mounted.current) return;
          setLivePrompt({ text: p.target, mode: 'slow' });
          speakWordSlow(p.target);
        }, 1500);
      } else {
        setCorrectionKind(branch);
        setStep('correction');
        const correction = branch === 'foil' ? p.onFoil.say : almostPhrase();
        setLivePrompt({ text: correction, mode: 'child' });
        speakToChild(correction);
        setTimeout(() => {
          if (!mounted.current) return;
          setLivePrompt({ text: p.target, mode: 'slow' });
          speakWordSlow(p.target);
        }, 2200);
      }
      return;
    }
    // 'none': no captado — re-modelar sin consumir intento ni estrellas.
    setCorrectionKind('none');
    setStep('correction');
    const notHeard = noHearPhrase();
    setLivePrompt({ text: notHeard, mode: 'child' });
    speakToChild(notHeard);
  };

  const retry = (p: MinimalPair) => {
    setHeard('');
    const text = pairRetry(loc, p.target);
    setLivePrompt({ text, mode: 'child' });
    speakToChild(text, afterSpeak(() => {
      if (!mounted.current) return;
      if (!asrSupported()) { setStep('judge'); return; }
      if (autoRecord) setTimeout(() => listenNow(p), 400);
      else setStep('ready');
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
    if (next === TPR_TRIAL) { setActiveBreak(pickSessionBreak()); return; }
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
        date: `${d.getDate()} ${t.ling.months.split(' ')[d.getMonth()]}`,
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
    markBlockCompleted('pares'); // hito de bloque para el SUS (rate-limited)
    releaseNoise(); // fin de sesión: la Pista B no sobrevive a la pantalla de logros
    setPhase('done');
    speakToChild(pairsDone(loc));
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
        <FichaVisual word={isTarget ? p.target : p.foil} emoji={isTarget ? p.targetEmoji : p.foilEmoji} pic={isTarget ? p.targetPictogram : p.foilPictogram} size={58} />
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
      <Text style={s.overrideLbl}>{t.pairs.overrideLabel}</Text>
      <Pressable
        onPress={() => {
          if (step === 'correction' && correctionKind !== 'none') attemptsRef.current = Math.max(0, attemptsRef.current - 1);
          resolveBranch(p, 'target');
        }}
        style={s.overridePill}
      >
        <FichaVisual word={p.target} emoji={p.targetEmoji} pic={p.targetPictogram} size={13} />
        <Text style={s.overridePillTxt}>{t.pairs.overridePill(p.target)}</Text>
      </Pressable>
      <Pressable onPress={() => step !== 'correction' && resolveBranch(p, 'foil')} style={s.overridePill}>
        <FichaVisual word={p.foil} emoji={p.foilEmoji} pic={p.foilPictogram} size={13} />
        <Text style={s.overridePillTxt}>{t.pairs.overridePill(p.foil)}</Text>
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
          <Pressable onPress={() => navigation.goBack()} style={s.backPill}><Text style={s.backPillTxt}>{`‹ ${t.common.back}`}</Text></Pressable>
          <Text style={s.logoFallback}>valeria+</Text>
          <Text style={s.headerTitle}>Pares Mínimos</Text>
          <Text style={s.headerSub}>{unlocked ? t.pairs.editingOn : t.pairs.subtitlePick}</Text>
        </View>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {!!toast && (
            <View style={s.toast}>
              <View style={s.toastCheck}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text></View>
              <Text style={s.toastTxt}>{toast}</Text>
            </View>
          )}
          <View style={s.howCard}>
            <Text style={s.howKicker}>{t.pairs.howKicker}</Text>
            <Text style={s.howTxt}>{t.pairs.howBody}</Text>
          </View>

          {/* PM-04: por defecto el micro espera al botón; aquí se puede volver
              al arranque automático para familias que ya tenían el ritmo cogido. */}
          <View style={s.autoRecordRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.autoRecordTxt}>{t.pairs.autoRecord}</Text>
              <Text style={s.autoRecordSub}>{t.pairs.autoRecordSub}</Text>
            </View>
            <Switch
              value={autoRecord}
              onValueChange={(v) => { setAutoRecord(v); setAutoRecordPref(v); }}
              trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff"
            />
          </View>

          <View style={{ marginTop: 12 }}>
            <ProUnlockPill unlocked={unlocked} onPress={() => setPinOpen(true)} />
          </View>
          <View style={s.listHead}>
            <Text style={s.listLabel}>{t.pairs.bankLabel}</Text>
            <View style={s.countBadge}><Text style={s.countBadgeTxt}>{t.pairs.prescribedCount(activeCount)}</Text></View>
          </View>

          {/* Solo los grupos con pares en la variedad activa: los bancos
              localizados (gl, es-DO, eu) no cubren todos los grupos del
              banco castellano y una sección vacía confunde al prescriptor. */}
          {PAIR_GROUPS.filter((g) => pairs.some((p) => p.group === g)).map((g) => (
            <View key={g}>
              <Text style={s.groupLabel}>{g.toUpperCase()}</Text>
              {pairs.filter((p) => p.group === g).map((p) => {
                const on = isPrescribed(p.id);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => (unlocked ? togglePrescribed(p.id) : on && startSession(p))}
                    style={[s.pickRow, !on && s.pickRowOff]}
                    accessibilityRole="button"
                    accessibilityLabel={unlocked
                      ? t.pairs.toggleA11y(on, p.target, p.foil)
                      : on ? t.pairs.practiceA11y(p.target, p.foil) : t.pairs.notPrescribedA11y(p.target, p.foil)}
                  >
                    <View style={s.codeChip}><Text style={s.codeChipTxt}>{p.code}</Text></View>
                    <FichaVisual word={p.target} emoji={p.targetEmoji} pic={p.targetPictogram} size={26} />
                    <FichaVisual word={p.foil} emoji={p.foilEmoji} pic={p.foilPictogram} size={26} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.pickName}>{p.target} / {p.foil}</Text>
                      <Text style={s.pickCat}>{p.errorLabel} · {p.phoneme}{p.region ? ' · solo variedades con distinción s/z' : ''}</Text>
                    </View>
                    {unlocked ? (
                      <Switch value={on} onValueChange={() => togglePrescribed(p.id)}
                        trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff" />
                    ) : on ? (
                      <View style={s.playBtn}><Text style={{ color: V.color.primaryDark, fontSize: 13 }}>▶</Text></View>
                    ) : (
                      <View style={[s.playBtn, { backgroundColor: '#f1f5f4' }]}><Text style={{ fontSize: 13 }}>🔒</Text></View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}

          {unlocked ? (
            <>
              <Pressable onPress={savePrescription} style={s.primaryBtn}><Text style={s.primaryBtnTxt}>{t.pairs.savePrescription}</Text></Pressable>
              <Text style={s.helper}>{t.pairs.saveHelper}</Text>
            </>
          ) : (
            <View style={s.lockedHint}>
              <Text style={{ fontSize: 13 }}>🔒</Text>
              <Text style={s.lockedHintTxt}>{t.pairs.lockedHint}</Text>
            </View>
          )}
        </ScrollView>

        <ProPinModal
          open={pinOpen}
          onClose={() => setPinOpen(false)}
          onUnlock={() => { setPinOpen(false); setUnlocked(true); setToast('Modo profesional desbloqueado.'); }}
          subtitle="Introduce el PIN de 4 dígitos del logopeda para elegir qué pares practica la familia."
        />
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
          {/* ES-02: dentro de una sesión, Volver regresa al banco de contrastes,
              no al hub — solo desde 'pick' Volver sale de la pantalla. */}
          <Pressable onPress={() => { stopSpeaking(); setPhase('pick'); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
          <Text style={s.logoFallback}>valeria+</Text>
          <Text style={s.headerTitle}>{t.pairs.doneTitle}</Text>
          <Text style={s.headerSub}>{p.code} · {p.target} / {p.foil}</Text>
        </View>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.doneCard}>
            <Text style={{ fontSize: 44 }}>🎉</Text>
            <Text style={s.doneTitle}>{t.pairs.doneSessionTitle}</Text>
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
            <Pressable onPress={() => navigation.navigate('Results')} style={s.primaryBtn}><Text style={s.primaryBtnTxt}>{t.pairs.seeResults}</Text></Pressable>
            <Pressable onPress={() => restart(p)}><Text style={s.linkBtn}>{t.pairs.repeatPair}</Text></Pressable>
            <Pressable onPress={() => setPhase('pick')}><Text style={s.linkBtn}>{t.pairs.otherPair}</Text></Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // =================================================================== PLAY ==
  const tiles = leftIsTarget ? (['target', 'foil'] as const) : (['foil', 'target'] as const);
  // Fase activa del turno para el mapa superior (quita la sensación de "¿y
  // ahora qué toca?" que reportaban los testers).
  const phaseIdx = step === 'say' || step === 'ready' ? 0 : step === 'listen' ? 1 : step === 'judge' || step === 'correction' ? 2 : 3;

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <Pressable onPress={() => { stopSpeaking(); stopListening(); setPhase('pick'); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
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

      <ScrollView ref={scrollRef} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Mapa del turno: en qué fase del ensayo estamos */}
        <TurnPhaseStrip active={phaseIdx} />

        {/* Las dos fichas del contraste (posición aleatoria por ensayo) */}
        <View style={[s.tilesRow, { marginTop: 12 }]}>{tiles.map((w) => pairTile(p, w))}</View>

        {/* Consigna viva: frase portadora procedural o consigna del par. El
            botón repite con la MISMA voz con la que se dictó (una portadora
            re-locutada con tono infantil movería el fonema objetivo). */}
        <View style={s.promptCard}>
          <View style={s.promptHead}>
            <View style={s.promptIcon}><Text style={{ fontSize: 18 }}>📢</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.promptKicker}>
                {livePrompt?.mode === 'slow' ? t.pairs.appSpeaksSlow : t.pairs.appSpeaks}
              </Text>
              <Text style={s.promptTxt}>“{livePrompt?.text ?? p.prompt}”</Text>
            </View>
            <SpeakButton
              text={livePrompt?.text ?? p.prompt}
              voice={livePrompt?.mode === 'slow' ? 'slow' : 'child'}
              compact
            />
          </View>
        </View>

        {/* ===== Estado del ensayo ===== */}
        {step === 'say' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 30 }}>🔊</Text>
            <Text style={s.stateTxt}>{t.pairs.stepSay}</Text>
          </View>
        )}

        {step === 'ready' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 30 }}>🙂</Text>
            <Text style={s.stateTxt}>{t.pairs.stepReady}</Text>
            <Pressable
              onPress={() => listenNow(p)}
              style={s.readyMicBtn}
              accessibilityRole="button"
              accessibilityLabel={t.pairs.readyBtnA11y}
            >
              <Text style={{ fontSize: 24 }}>🎤</Text>
              <Text style={s.readyMicBtnTxt}>{t.pairs.readyBtn}</Text>
            </Pressable>
            <Pressable onPress={() => { const s2 = trialPrompt(p, trialIdx, loc); setLivePrompt(s2); speakToChild(s2.text); }}>
              <Text style={s.linkBtn}>{t.pairs.repeatPrompt}</Text>
            </Pressable>
          </View>
        )}

        {step === 'listen' && (
          <View style={s.stateCard}>
            <Animated.View style={{ transform: [{ scale: micScale }] }}>
              <View style={s.micRing}><Text style={{ fontSize: 30 }}>🎤</Text></View>
            </Animated.View>
            <Text style={s.stateTxt}>{t.pairs.stepListen}</Text>
            {!!heard && <Text style={s.partialTxt}>✨ {heard}</Text>}
            <Pressable
              onPress={() => { listeningRef.current = false; setListening(false); stopListening(); setStep('judge'); }}
              style={s.stopPill}
            >
              <Text style={s.stopPillTxt}>{t.pairs.stopListening}</Text>
            </Pressable>
          </View>
        )}

        {step === 'judge' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 26 }}>👂</Text>
            <Text style={s.stateTxt}>{t.pairs.stepJudge}</Text>
            <View style={s.judgeRow}>
              <Pressable onPress={() => resolveBranch(p, 'target')} style={[s.judgeBtn, { backgroundColor: V.color.successBg, borderColor: '#bfe9d4' }]}>
                <FichaVisual word={p.target} emoji={p.targetEmoji} pic={p.targetPictogram} size={22} /><Text style={s.judgeTxt}>{t.pairs.saidWord(p.target)}</Text>
              </Pressable>
              <Pressable onPress={() => resolveBranch(p, 'foil')} style={[s.judgeBtn, { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' }]}>
                <FichaVisual word={p.foil} emoji={p.foilEmoji} pic={p.foilPictogram} size={22} /><Text style={s.judgeTxt}>{t.pairs.saidWord(p.foil)}</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => retry(p)}><Text style={s.linkBtn}>{t.pairs.notUnderstood}</Text></Pressable>
            {/* Si el micrófono ni llegó a abrirse, el adulto pasa a juez: aquí
                también tiene que poder leer por qué. */}
            {!!asrNote && (
              <View style={s.asrNote}>
                <Text style={s.asrNoteKicker}>{t.pairs.micNoteKicker}</Text>
                <Text style={s.asrNoteTxt}>{asrNote}</Text>
              </View>
            )}
          </View>
        )}

        {step === 'success' && (
          <>
            <View style={[s.verdictCard, s.verdictOk]}>
              <Text style={{ fontSize: 26 }}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>{t.pairs.successTitle}</Text>
                <Text style={s.verdictSub}>{heard ? t.pairs.heardBy(heard) : t.pairs.adultVerdict} · {pendingStars}★</Text>
              </View>
              <Text style={s.verdictStars}>{'★'.repeat(pendingStars)}</Text>
            </View>
            {missionCard(t.pairs.missionCelebration, p.onTarget.mission)}
            {asrSupported() && overrideRow(p)}
            <DoubleSeal label={t.pairs.sealSuccess} onUnlock={() => onSealSuccess(p)} />
          </>
        )}

        {step === 'correction' && (
          <>
            <View style={[s.verdictCard, correctionKind === 'foil' ? s.verdictWarn : s.verdictNeutral]}>
              <Text style={{ fontSize: 26 }}>{correctionKind === 'foil' ? '👂' : correctionKind === 'close' ? '💪' : '😅'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>
                  {correctionKind === 'foil' ? t.pairs.heardFoil(p.foil)
                    : correctionKind === 'close' ? t.pairs.almostTitle
                      : t.pairs.notHeardTitle}
                </Text>
                <Text style={s.verdictSub}>
                  {correctionKind === 'foil' ? t.pairs.cuePrefix(p.onFoil.cue)
                    : correctionKind === 'close' ? t.pairs.almostSub
                      : t.pairs.notHeardSub}
                </Text>
              </View>
            </View>
            {/* Lo que el motor dijo de verdad, para el adulto: sin esto, un
                permiso de micrófono denegado o un reconocedor no disponible se
                veían igual que un niño que habla flojito. */}
            {!!asrNote && (
              <View style={s.asrNote}>
                <Text style={s.asrNoteKicker}>{t.pairs.micNoteKicker}</Text>
                <Text style={s.asrNoteTxt}>{asrNote}</Text>
              </View>
            )}
            {correctionKind === 'foil' && missionCard(t.pairs.missionCorrective, p.onFoil.mission)}
            <View style={s.retryRow}>
              <SpeakButton text={p.target} label={t.pairs.hearSlowModel} voice="slow" />
              <Pressable onPress={() => retry(p)} style={s.retryBtn}><Text style={s.retryBtnTxt}>{t.pairs.retryBtn}</Text></Pressable>
            </View>
            {asrSupported() && correctionKind !== 'none' && overrideRow(p)}
          </>
        )}

        {step === 'assist' && (
          <>
            <View style={[s.verdictCard, s.verdictNeutral]}>
              <Text style={{ fontSize: 26 }}>🤝</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>{t.pairs.assistTitle}</Text>
                <Text style={s.verdictSub}>{t.pairs.assistSub(p.target)}</Text>
              </View>
            </View>
            <View style={s.retryRow}>
              <SpeakButton text={p.target} label={t.pairs.hearSlowModel} voice="slow" />
            </View>
            <DoubleSeal label={t.pairs.sealAssist} onUnlock={() => onSealAssist(p)} />
          </>
        )}

        {/* ===== Panel del adulto · caos comunicativo (Fase 2) ===== */}
        <ValeriaAdultChaosPanel
          distractorOn={distractorOn}
          onDistractorChange={setDistractorOn}
          onLaunchPragmatic={() => setPragmaticOpen(true)}
        />
      </ScrollView>

      {/* Distractor periférico no interactivo: solo mientras el adulto lo tenga activo */}
      {distractorOn && <ValeriaDistractorBear />}

      {/* Rotación de roles, pausa activa y quiebre (bloquean hasta completarse) */}
      {swapOpen && (
        <RoleSwapOverlay pair={p} onDone={() => { setSwapOpen(false); startTrial(p, trialIdx); }} />
      )}
      {activeBreak && (
        <ValeriaSessionBreakOverlay
          brk={activeBreak}
          onDone={() => { setActiveBreak(null); startTrial(p, trialIdx); }}
          onSkip={() => { setActiveBreak(null); startTrial(p, trialIdx); }}
        />
      )}
      {pragmaticOpen && <ValeriaPragmaticBreakOverlay onClose={() => setPragmaticOpen(false)} />}
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
  autoRecordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 14, padding: 12, marginTop: 10 },
  autoRecordTxt: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary },
  autoRecordSub: { fontSize: 11, fontWeight: '600', color: V.color.textMuted, marginTop: 2, lineHeight: 15 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginBottom: 14 },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastTxt: { color: V.color.textPrimary, fontSize: 13.5, fontWeight: '700', flex: 1 },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginHorizontal: 4 },
  listLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.4 },
  countBadge: { backgroundColor: V.color.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  countBadgeTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 15, padding: 12, marginBottom: 9, ...V.shadow.card },
  pickRowOff: { opacity: 0.55 },
  helper: { textAlign: 'center', color: V.color.textMuted, fontSize: 11.5, marginTop: 11, fontWeight: '600', paddingHorizontal: 14 },
  lockedHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18, paddingHorizontal: 18 },
  lockedHintTxt: { color: V.color.textMuted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
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
  // PM-04: botón de "ya estoy listo" — área mínima de 48dp de alto para ser
  // accesible a una sola mano y a dedos pequeños.
  readyMicBtn: { flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 48, backgroundColor: '#7c4fd0', borderRadius: 16, paddingHorizontal: 22, paddingVertical: 13, ...V.shadow.button },
  readyMicBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

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

  asrNote: { backgroundColor: '#eef2ff', borderColor: '#c7d2fe', borderWidth: 1.5, borderRadius: 14, padding: 12, marginTop: 10 },
  asrNoteKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: '#4338ca' },
  asrNoteTxt: { marginTop: 5, fontSize: 12.5, fontWeight: '600', color: '#3730a3', lineHeight: 18 },

  missionCard: { backgroundColor: '#fff7ed', borderColor: '#fcd9a8', borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 12 },
  missionHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  missionIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  missionKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#9a5b13' },
  missionTxt: { marginTop: 9, fontSize: 13.5, fontWeight: '700', color: '#7c4a0e', lineHeight: 19 },

  overrideRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, marginTop: 10, paddingHorizontal: 2 },
  overrideLbl: { fontSize: 11, fontWeight: '700', color: V.color.textMuted },
  overridePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  overridePillTxt: { fontSize: 11.5, fontWeight: '800', color: V.color.textSecondary },

  retryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  retryBtn: { flex: 1, backgroundColor: V.color.primary, borderRadius: 13, paddingVertical: 12, alignItems: 'center', ...V.shadow.button },
  retryBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // sello doble
  sealCard: { backgroundColor: '#f5f0ff', borderWidth: 1.5, borderColor: '#ddccfa', borderRadius: 18, padding: 14, marginTop: 12, alignItems: 'center' },
  sealKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#6d3fc4' },
  sealWhy: { fontSize: 11, fontWeight: '600', color: V.color.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 15.5 },
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

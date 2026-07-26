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
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, Switch, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { ProUnlockPill, ProPinModal } from './ValeriaProPin';
import { registerSession, SessionReward } from './valeriaGamification';
import { markBlockCompleted, trackListenStart, trackListenNoMatch } from './valeriaTelemetry';
import {
  speakToChild, speakPhraseSlow, stopSpeaking,
  asrSupported, startListening, stopListening, releaseListening, matchExpected,
  praisePhrase, almostPhrase, noHearPhrase, togetherPhrase,
} from './valeriaVoice';
import { SpeakButton, TurnPhaseStrip } from './ValeriaVoiceUI';
import { FichaVisual } from './ValeriaPictograms';
import { WORD_TYPE_LABEL, PHASE_LABEL, SECTION_GOAL } from './valeriaSemanticExpansion';
import { semanticForLocale, SemanticBank } from './valeriaSemanticBanks';
import { getLocale } from './valeriaLocale';
import { getAutoRecordPref, setAutoRecordPref } from './valeriaRecordingPref';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Un "paso" genérico: la unidad que el reproductor sabe locutar y evaluar.
// Escenarios, progresiones y contrastes se aplanan a esta forma común.
interface PracticeStep {
  kicker: string;        // etiqueta superior (SUSTANTIVO, FASE 1 · ONOMATOPEYA, CONTRASTE…)
  emoji: string;
  pictogram?: string;    // clave del pictograma propio (ES-09); ausente → emoji
  label: string;         // palabra objetivo mostrada
  visualPrompt: string;  // descripción del asset (guía para el adulto/diseñador)
  tts: string;           // consigna a locutar
  expected: string[];    // strings válidos para el STT
  actionKicker: string;  // encabezado de la tarjeta de acción física
  action: string;        // parent_tpr_action del paso
  // ES-12 (DC-3): las cápsulas de contraste hacen DOS vueltas de distinta
  // naturaleza — la primera evalúa COMPRENSIÓN (el niño toca la imagen correcta
  // entre las dos, que ya estaban en el dato) y la segunda PRODUCCIÓN (la dice).
  // El resto de bloques solo produce, así que 'produccion' es el valor por defecto.
  mode?: 'comprension' | 'produccion';
  choices?: { label: string; emoji: string; pictogram?: string }[]; // solo en comprensión: las dos opciones
  answerLabel?: string;                          // cuál de las dos es la correcta
}

interface Session {
  kind: 'scenario' | 'sequence' | 'contrast';
  title: string;
  code: string;
  steps: PracticeStep[];
  // ES-11 · Material que el adulto tiene que preparar ANTES de empezar. Solo
  // las cápsulas de contraste lo declaran: son las que piden objetos concretos
  // («dos cucharas iguales, una limpia y otra sucia»). En escenarios y
  // progresiones la antesala explica la dinámica con las acciones ya escritas
  // de cada paso, sin inventar prosa nueva.
  setup?: string;
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
    setup: cp.physical_setup,
    steps: cp.rounds.map((r, i) => ({
      kicker: i === 0
        ? `${cp.kind === 'adjetivos' ? 'CONTRASTE DE ADJETIVOS' : 'VERBOS ANTÓNIMOS'} · VUELTA 1 · COMPRENDER`
        : `${cp.kind === 'adjetivos' ? 'CONTRASTE DE ADJETIVOS' : 'VERBOS ANTÓNIMOS'} · VUELTA 2 · DECIR`,
      emoji: r.emoji, label: r.label, pictogram: r.pictogram,
      visualPrompt: `Par en contraste: ${cp.pair[0]} / ${cp.pair[1]}.`,
      tts: r.tts_trigger, expected: r.stt_expected_array,
      actionKicker: i === 0 ? 'ACCIÓN FÍSICA EN PAREJA' : 'ACCIÓN FÍSICA · SEGUNDA VUELTA',
      action: r.parent_action,
      // Vuelta 1: el niño elige entre las DOS imágenes de la cápsula. Las dos
      // vueltas comparten objeto (regla de congruencia ES-13) y solo difieren
      // en el atributo, así que lo que distingue las tarjetas es el pictograma
      // de cada vuelta, no el emoji —que en 16 de las 20 cápsulas es el mismo.
      mode: i === 0 ? 'comprension' as const : 'produccion' as const,
      choices: i === 0
        ? cp.rounds.map((x) => ({ label: x.label, emoji: x.emoji, pictogram: x.pictogram }))
        : undefined,
      answerLabel: i === 0 ? r.label : undefined,
    })),
  };
};

// ES-11 · 'setup' es una antesala OBLIGATORIA entre la lista y el reproductor:
// las logopedas señalaron que la app pide hacer la tarea sin haber explicado
// antes el material ni la dinámica, y que en los apartados con material físico
// las indicaciones aparecían con la tarea ya empezada. Ahora nada suena hasta
// que el adulto confirma que lo tiene todo.
type Phase = 'pick' | 'setup' | 'play' | 'done';
// 'idle': tarjeta del paso mostrada sin sonido, esperando el botón ▶ (ES-03).
// 'ready': la consigna ya sonó y el micro espera al botón del adulto (PM-04),
// salvo que la preferencia de grabación automática esté activada.
type StepState = 'idle' | 'say' | 'ready' | 'seleccion' | 'listen' | 'judge' | 'success' | 'retry' | 'assist';

interface StepRecord { stars: 1 | 2 | 3; heard: string; mode: 'comprension' | 'produccion'; }

// Consigna viva (PM-03): la tarjeta "LA APP DICE" debe reflejar la ÚLTIMA
// locución real, no solo la consigna inicial (celebración, corrección,
// reintento y modelo lento también deben verse reflejados).
interface LivePrompt { text: string; mode: 'child' | 'slowPhrase'; }

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
  const [state, setState] = useState<StepState>('idle');
  const [heard, setHeard] = useState('');
  const [pendingStars, setPendingStars] = useState<1 | 2 | 3>(3);
  const [log, setLog] = useState<StepRecord[]>([]);
  const [reward, setReward] = useState<SessionReward | null>(null);
  const [listening, setListening] = useState(false);
  const [livePrompt, setLivePrompt] = useState<LivePrompt | null>(null);
  // Posición aleatoria de las dos tarjetas en la vuelta de comprensión, para
  // que el niño no aprenda «siempre la de la izquierda».
  const [pickLeftFirst, setPickLeftFirst] = useState(true);
  // ES-04: el último intento no se captó (fallo del motor, no del niño). No
  // consume intento ni estrella, y la tarjeta de reintento lo dice así.
  const [notHeard, setNotHeard] = useState(false);
  // ES-11: la antesala se abrió para releerla desde dentro de la sesión, no
  // para empezarla. Cambia el botón de salida y evita reiniciar el paso.
  const [setupRevisit, setSetupRevisit] = useState(false);
  // PM-04/ES-03: por defecto MANUAL — nada suena ni escucha solo.
  const [autoRecord, setAutoRecord] = useState(false);
  // Prescripción del logopeda: { [id]: boolean } sobre escenarios, progresiones
  // y contrastes (id ausente = activo). El PIN profesional desbloquea la edición.
  const [prescribed, setPrescribed] = useState<Record<string, boolean>>({});
  const [unlocked, setUnlocked] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [toast, setToast] = useState('');

  const attemptsRef = useRef(0);
  const listeningRef = useRef(false);
  // ES-04: mejor parcial de la escucha en curso. Si el resultado final llega
  // vacío, se evalúa esto en vez de dar el intento por perdido.
  const bestPartialRef = useRef('');
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
      const auto = await getAutoRecordPref();
      if (mounted.current) setAutoRecord(auto);
    })();
    return () => { mounted.current = false; stopSpeaking(); stopListening(); releaseListening(); };
  }, []);

  // ES-02: el botón atrás físico de Android se comporta igual que el botón
  // Volver de la cabecera — dentro de una sesión regresa a la lista del tab
  // activo, no cierra la pantalla entera.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      // Releyendo la antesala en mitad de la sesión, atrás vuelve al paso.
      if (phase === 'setup' && setupRevisit) { leaveSetup(); return true; }
      if (phase === 'setup' || phase === 'play' || phase === 'done') {
        stopSpeaking(); stopListening();
        setPhase('pick');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [phase, setupRevisit]);

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
  // ES-03: nada suena al entrar en un paso — la tarjeta espera el botón ▶.
  // ES-11: y antes del primer paso se pasa por la antesala de preparación.
  const start = (sess: Session) => {
    setSession(sess); setLog([]); setReward(null);
    setStepIdx(0); attemptsRef.current = 0; setHeard(''); setLivePrompt(null);
    setState('idle');
    setSetupRevisit(false);
    setPhase('setup');
  };

  // Salida de la antesala. Si se abrió para releerla en mitad de la sesión,
  // devuelve al paso donde estaba sin reiniciar nada.
  const leaveSetup = () => {
    setPhase('play');
    setSetupRevisit(false);
  };

  const sayStep = (sess: Session, idx: number) => {
    setState('say'); setHeard(''); setListening(false); setNotHeard(false);
    const st = sess.steps[idx];
    setLivePrompt({ text: st.tts, mode: 'child' });
    speakToChild(st.tts, afterSpeak(() => {
      if (!mounted.current) return;
      // Comprensión: no hay micrófono, el niño responde tocando una imagen.
      if (st.mode === 'comprension') { setPickLeftFirst(Math.random() < 0.5); setState('seleccion'); return; }
      if (!asrSupported()) { setState('judge'); return; }
      if (autoRecord) setTimeout(() => listenNow(sess, idx), 400);
      else setState('ready');
    }));
  };

  // ES-12 · veredicto de la vuelta de comprensión: acierta a la primera → 3★;
  // tras una pista → 2★. Un fallo no cierra el paso: se vuelve a preguntar una
  // vez, igual que la producción da una segunda oportunidad antes de asistir.
  const resolveSelection = (elegido: string) => {
    if (!session) return;
    const st = session.steps[stepIdx];
    if (elegido === st.answerLabel) {
      setPendingStars(attemptsRef.current === 0 ? 3 : 2);
      setState('success');
      const praise = praisePhrase();
      setLivePrompt({ text: praise, mode: 'child' });
      speakToChild(praise);
      return;
    }
    attemptsRef.current += 1;
    if (attemptsRef.current >= 2) {
      // Anti-frustración: se muestra cuál era y se cuenta como asistida (1★).
      setState('assist');
      const together = togetherPhrase();
      setLivePrompt({ text: together, mode: 'child' });
      speakToChild(together);
      return;
    }
    const otra = almostPhrase();
    setLivePrompt({ text: otra, mode: 'child' });
    speakToChild(otra, afterSpeak(() => {
      if (!mounted.current) return;
      setLivePrompt({ text: st.tts, mode: 'child' });
      speakToChild(st.tts);
      setPickLeftFirst(Math.random() < 0.5);
      setState('seleccion');
    }));
  };

  // --------------------------------------------------------------- escucha --
  // ES-04 · Las logopedas informaron de hasta tres repeticiones para que se
  // aceptase un ensayo. Tres correcciones, todas del lado de la CAPTURA:
  //   1. La ventana de escucha se amplía en valeriaVoice (extras de Android).
  //   2. El mejor parcial se guarda y se evalúa si el resultado final llega
  //      vacío: el motor llegó a oír algo antes de rendirse.
  //   3. Un fallo del motor NO consume intento ni estrella. Pares Mínimos ya
  //      distinguía ese caso ('none'); aquí un onError resolvía resolve(0) y
  //      se lo cobraba al niño.
  const listenNow = async (sess: Session, idx: number) => {
    if (!mounted.current) return;
    const st = sess.steps[idx];
    setState('listen'); setListening(true); setHeard(''); setNotHeard(false);
    listeningRef.current = true;
    bestPartialRef.current = '';
    trackListenStart();

    // Cierre común: evalúa con lo que haya, cayendo al mejor parcial.
    const cerrar = (alts: string[]) => {
      listeningRef.current = false; setListening(false);
      const partial = bestPartialRef.current.trim();
      const candidatos = alts.filter(Boolean);
      if (!candidatos.length && partial) candidatos.push(partial);
      setHeard(candidatos[0] ?? '');
      if (!candidatos.length) { noCaptado(); return; }
      resolve(matchExpected(candidatos, st.expected));
    };

    const ok = await startListening({
      onPartial: (t) => {
        if (!mounted.current || !listeningRef.current) return;
        // El parcial más largo es el que más información trae; guardarlo evita
        // perder un acierto cuando el resultado final llega vacío.
        if (t.trim().length > bestPartialRef.current.length) bestPartialRef.current = t;
        setHeard(t);
      },
      onResult: (alts) => {
        if (!mounted.current || !listeningRef.current) return;
        cerrar(alts);
      },
      onError: (_msg, noMatch) => {
        if (!mounted.current || !listeningRef.current) return;
        // Con un parcial rescatable se evalúa igualmente; si el motor no captó
        // nada, no se penaliza: se vuelve a modelar sin gastar intento.
        if (bestPartialRef.current.trim()) { cerrar([]); return; }
        listeningRef.current = false; setListening(false);
        if (noMatch) { noCaptado(); return; }
        setState('judge');
      },
    });
    if (!ok && mounted.current) { listeningRef.current = false; setListening(false); setState('judge'); }
  };

  // ES-04 · «No te he oído»: se re-modela sin consumir intento ni estrella,
  // igual que la rama 'none' de Pares Mínimos. Es la diferencia entre que el
  // niño falle y que falle el micrófono.
  const noCaptado = () => {
    trackListenNoMatch();
    setNotHeard(true);
    setState('retry');
    const notHeard = noHearPhrase();
    setLivePrompt({ text: notHeard, mode: 'child' });
    speakToChild(notHeard);
  };

  // ------------------------------------------------------------ evaluación --
  // level 2 = dijo la palabra (o una aproximación válida) · 1 = casi · 0 = nada.
  // Cada rama actualiza livePrompt ANTES de hablar (PM-03): la tarjeta "LA APP
  // DICE" debe ser siempre un espejo de la última locución real, incluido el
  // modelo lento diferido de la frase completa (no solo la palabra, ES-05).
  const resolve = (level: 0 | 1 | 2) => {
    if (!session) return;
    const st = session.steps[stepIdx];
    if (level === 2) {
      setPendingStars(attemptsRef.current === 0 ? 3 : 2);
      setState('success');
      const praise = praisePhrase();
      setLivePrompt({ text: praise, mode: 'child' });
      speakToChild(praise);
      return;
    }
    attemptsRef.current += 1;
    if (attemptsRef.current >= 2) {
      setState('assist');
      const together = togetherPhrase();
      setLivePrompt({ text: together, mode: 'child' });
      speakToChild(together);
      setTimeout(() => {
        if (!mounted.current) return;
        setLivePrompt({ text: st.tts, mode: 'slowPhrase' });
        speakPhraseSlow(st.tts);
      }, 1500);
    } else {
      setState('retry');
      const msg = level === 1 ? almostPhrase() : noHearPhrase();
      setLivePrompt({ text: msg, mode: 'child' });
      speakToChild(msg);
      setTimeout(() => {
        if (!mounted.current) return;
        setLivePrompt({ text: st.tts, mode: 'slowPhrase' });
        speakPhraseSlow(st.tts);
      }, 2000);
    }
  };

  const retry = () => {
    if (!session) return;
    const st = session.steps[stepIdx];
    setHeard('');
    const text = bank.retry(st.label);
    setLivePrompt({ text, mode: 'child' });
    speakToChild(text, afterSpeak(() => {
      if (!mounted.current) return;
      if (!asrSupported()) { setState('judge'); return; }
      if (autoRecord) setTimeout(() => listenNow(session, stepIdx), 400);
      else setState('ready');
    }));
    setState('say');
  };

  // ------------------------------------------------------- avance de paso --
  // ES-03: el siguiente paso también espera el botón ▶, no arranca solo.
  const next = (rec: StepRecord) => {
    if (!session) return;
    const nextLog = [...log, rec];
    setLog(nextLog);
    const n = stepIdx + 1;
    if (n >= session.steps.length) { finish(session, nextLog); return; }
    setStepIdx(n); attemptsRef.current = 0; setHeard(''); setLivePrompt(null);
    setState('idle');
  };

  const finish = async (sess: Session, res: StepRecord[]) => {
    const avg = res.reduce((a, r) => a + r.stars, 0) / (res.length || 1);
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.historial);
      const hist = raw ? JSON.parse(raw) : [];
      const d = new Date();
      const kindLbl = sess.kind === 'scenario' ? 'Escenario' : sess.kind === 'sequence' ? 'Progresión' : 'Contraste';
      // ES-12: en los contrastes la nota separa lo que el niño COMPRENDE de lo
      // que PRODUCE. Son dos habilidades distintas y mezclarlas en una sola
      // media oculta el caso típico: entiende el par pero aún no lo dice.
      const comp = res.filter((r) => r.mode === 'comprension');
      const prod = res.filter((r) => r.mode === 'produccion');
      const mediaNum = (xs: StepRecord[]) => (xs.length ? +(xs.reduce((a, r) => a + r.stars, 0) / xs.length).toFixed(1) : null);
      const media = (xs: StepRecord[]) => (xs.length ? mediaNum(xs)!.toFixed(1) : '–');
      hist.push({
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        name: `Expansión semántica · ${sess.title}`,
        avg: +avg.toFixed(1),
        note: comp.length
          ? `${kindLbl}: comprensión ${media(comp)}/3 en ${comp.length} ${comp.length === 1 ? 'vuelta' : 'vueltas'} · producción ${media(prod)}/3 en ${prod.length}.`
          : `${kindLbl}: ${res.length} palabras trabajadas uniendo símbolo, voz y acción física.`,
        completed: true,
        // El desglose va también como dato, no solo dentro del texto de la
        // nota: el panel de resultados y la exportación lo leen de aquí en vez
        // de tener que interpretar una frase.
        ...(comp.length ? { split: { comprension: mediaNum(comp), produccion: mediaNum(prod) } } : {}),
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
              Pulsando ▶ la app enseña una imagen y presenta la palabra en una frase corta antes de
              pedirla («Esto es la cama. Di: cama.»). El niño la repite con su voz y el micrófono
              valora el intento, aceptando las aproximaciones propias de la edad. Cada palabra se
              cierra con una acción física del adulto que la ancla al cuerpo y al entorno real.
            </Text>
          </View>

          {/* PM-04/ES-03: por defecto nada suena ni escucha solo; aquí se
              puede volver al arranque automático para quien ya tenía el ritmo. */}
          <View style={s.autoRecordRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.autoRecordTxt}>Audio y grabación automáticos</Text>
              <Text style={s.autoRecordSub}>Por defecto, apagado: pulsad ▶ para oír el modelo y 🎤 para grabar.</Text>
            </View>
            <Switch
              value={autoRecord}
              onValueChange={(v) => { setAutoRecord(v); setAutoRecordPref(v); }}
              trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff"
            />
          </View>

          <View style={{ marginBottom: 12, marginTop: 12 }}>
            <ProUnlockPill unlocked={unlocked} onPress={() => setPinOpen(true)} />
          </View>
          <View style={s.listHead}>
            <Text style={s.listLabel}>
              {tab === 'scenario' ? 'ESCENARIOS DIARIOS' : tab === 'sequence' ? 'PROGRESIÓN LÉXICA' : 'CÁPSULAS DE CONTRASTE'}
            </Text>
            <View style={s.countBadge}><Text style={s.countBadgeTxt}>{activeCount} prescritas</Text></View>
          </View>

          {/* ES-07: cada apartado declara su objetivo terapéutico en una línea,
              para que el adulto sepa qué se trabaja antes de elegir actividad. */}
          <View style={s.goalCard}>
            <Text style={s.goalKicker}>🎯 QUÉ SE TRABAJA AQUÍ</Text>
            <Text style={s.goalTxt}>{SECTION_GOAL[tab]}</Text>
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

  // ================================================================== SETUP ==
  // ES-11 · Antesala: qué material hace falta y qué vais a hacer, ANTES de que
  // suene nada. Es una pantalla para el ADULTO —se lee mientras reúne los
  // objetos—, así que no locuta: por eso este item no arrastra la regeneración
  // del corpus de voz. Las acciones de cada paso sí conservan su botón de
  // escucha dentro del reproductor, donde van dirigidas a la pareja.
  if (phase === 'setup') {
    const conMaterial = !!sess.setup;
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <Pressable
            onPress={() => { if (setupRevisit) leaveSetup(); else setPhase('pick'); }}
            style={s.backPill}
          >
            <Text style={s.backPillTxt}>‹ {setupRevisit ? 'Seguir' : 'Volver'}</Text>
          </Pressable>
          <Text style={s.logoFallback}>valeria+</Text>
          <Text style={s.headerTitle}>Preparación</Text>
          <Text style={s.headerSub}>{sess.title}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {conMaterial && (
            <View style={s.setupCard}>
              <Text style={s.setupKicker}>🧰 MATERIAL QUE NECESITÁIS</Text>
              <Text style={s.setupTxt}>{sess.setup}</Text>
            </View>
          )}

          <View style={s.setupCard}>
            <Text style={s.setupKicker}>🤝 QUÉ VAIS A HACER · {sess.steps.length} {sess.steps.length === 1 ? 'PASO' : 'PASOS'}</Text>
            {sess.steps.map((st, i) => (
              <View key={`${st.label}-${i}`} style={s.setupStep}>
                <View style={s.setupStepNum}><Text style={s.setupStepNumTxt}>{i + 1}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.setupStepLabel}>
                    {st.label}
                    {st.mode === 'comprension' ? ' · el niño señala' : ''}
                  </Text>
                  <Text style={s.setupStepAction}>{st.action}</Text>
                </View>
              </View>
            ))}
          </View>

          {!conMaterial && (
            <Text style={s.setupHint}>
              Esta actividad no necesita material: basta con vuestras manos y un sitio tranquilo.
            </Text>
          )}

          <Pressable
            onPress={leaveSetup}
            style={s.setupGoBtn}
            accessibilityRole="button"
            accessibilityLabel={setupRevisit ? 'Volver a la sesión' : 'Ya lo tengo todo, empezar'}
          >
            <Text style={{ fontSize: 22 }}>{setupRevisit ? '↩' : '✅'}</Text>
            <Text style={s.setupGoBtnTxt}>{setupRevisit ? 'Volver a la sesión' : 'Ya lo tengo todo'}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // =================================================================== DONE ==
  if (phase === 'done') {
    const avg = log.reduce((a, r) => a + r.stars, 0) / (log.length || 1);
    return (
      <View style={s.flex}>
        <View style={s.header}>
          {/* ES-02: dentro de una sesión, Volver regresa a la lista del tab
              activo, no al hub — solo desde 'pick' Volver sale de la pantalla. */}
          <Pressable onPress={() => { stopSpeaking(); setPhase('pick'); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
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
  const phaseIdx = state === 'idle' || state === 'say' || state === 'ready' ? 0 : state === 'listen' || state === 'seleccion' ? 1 : state === 'judge' || state === 'retry' ? 2 : 3;

  return (
    <View style={s.flex}>
      <View style={s.header}>
        {/* ES-02: dentro de una sesión, Volver regresa a la lista del tab
            activo, no al hub. */}
        <Pressable onPress={() => { stopSpeaking(); stopListening(); setPhase('pick'); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
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
            <FichaVisual word={st.label} emoji={st.emoji} pic={st.pictogram} size={64} />
          </View>
          <Text style={s.tileCap}>{st.label}</Text>
        </View>

        {/* Consigna que dice la app: espejo de la ÚLTIMA locución real (PM-03),
            no solo de la consigna inicial del paso. */}
        <View style={s.promptCard}>
          <View style={s.promptHead}>
            <View style={s.promptIcon}><Text style={{ fontSize: 18 }}>📢</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.promptKicker}>{livePrompt?.mode === 'slowPhrase' ? 'LA APP MODELA DESPACIO' : 'LA APP DICE'}</Text>
              <Text style={s.promptTxt}>“{livePrompt?.text ?? st.tts}”</Text>
            </View>
            <SpeakButton
              text={livePrompt?.text ?? st.tts}
              voice={livePrompt?.mode === 'slowPhrase' ? 'slowPhrase' : 'child'}
              compact
            />
          </View>
        </View>

        {/* Setup físico previo (primera vuelta de las cápsulas de contraste) */}
        {/* ES-11 · La preparación ya no se pinta dentro del paso: era la queja
            exacta de las logopedas —«prepara dos peluches» apareciendo con la
            consigna ya locutándose—. Vive en la antesala, y desde aquí se
            puede releer sin perder el paso. */}
        <Pressable
          onPress={() => { stopSpeaking(); stopListening(); setSetupRevisit(true); setPhase('setup'); }}
          style={s.reviewSetupPill}
          accessibilityRole="button"
          accessibilityLabel="Volver a ver el material y la dinámica"
        >
          <Text style={s.reviewSetupTxt}>🧰 Ver preparación</Text>
        </Pressable>

        {/* ===== Estado del paso ===== */}
        {state === 'idle' && (
          <View style={s.stateCard}>
            <Pressable
              onPress={() => sayStep(sess, stepIdx)}
              style={s.playBigBtn}
              accessibilityRole="button"
              accessibilityLabel="Escuchar el modelo de este paso"
            >
              <Text style={{ fontSize: 24 }}>▶</Text>
              <Text style={s.playBigBtnTxt}>Escuchar</Text>
            </Pressable>
          </View>
        )}

        {state === 'say' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 30 }}>🔊</Text>
            <Text style={s.stateTxt}>La app está hablando… preparad la voz.</Text>
          </View>
        )}

        {state === 'ready' && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 30 }}>🙂</Text>
            <Text style={s.stateTxt}>Preparad la voz. Cuando el niño esté listo, pulsad el micrófono.</Text>
            <Pressable
              onPress={() => listenNow(sess, stepIdx)}
              style={s.readyMicBtn}
              accessibilityRole="button"
              accessibilityLabel="Ya estoy listo. Empezar a escuchar."
            >
              <Text style={{ fontSize: 24 }}>🎤</Text>
              <Text style={s.readyMicBtnTxt}>Ya estoy listo</Text>
            </Pressable>
          </View>
        )}

        {state === 'seleccion' && !!st.choices && (
          <View style={s.stateCard}>
            <Text style={{ fontSize: 26 }}>👆</Text>
            <Text style={s.stateTxt}>¡Toca la imagen correcta!</Text>
            <View style={s.pickRowCards}>
              {(pickLeftFirst ? st.choices : [...st.choices].reverse()).map((c) => (
                <Pressable
                  key={c.label}
                  onPress={() => resolveSelection(c.label)}
                  style={s.pickCard}
                  accessibilityRole="button"
                  accessibilityLabel={c.label}
                >
                  {/* Mismo objeto en ambas tarjetas (regla de congruencia
                      ES-13): lo que las distingue es el ATRIBUTO, y eso lo
                      dibuja el pictograma de cada vuelta. Las dos se pintan al
                      mismo tamaño a propósito — hasta ahora grande/pequeño se
                      sostenía escalando la ficha, un apaño que solo funcionaba
                      con ese par y dejaba irresolubles los otros siete. */}
                  <FichaVisual word={c.label} emoji={c.emoji} pic={c.pictogram} size={60} />
                  <Text style={s.pickCardCap}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => { setLivePrompt({ text: st.tts, mode: 'child' }); speakToChild(st.tts); }}>
              <Text style={s.linkBtn}>Repetir la pregunta</Text>
            </Pressable>
          </View>
        )}

        {state === 'listen' && (
          <View style={s.stateCard}>
            <Animated.View style={{ transform: [{ scale: micScale }] }}>
              <View style={s.micRing}><Text style={{ fontSize: 30 }}>🎤</Text></View>
            </Animated.View>
            <Text style={s.stateTxt}>¡Ahora el niño! Di la palabra al micrófono…</Text>
            {!!heard && <Text style={s.partialTxt}>✨ {heard}</Text>}
            {/* ES-04 · El veredicto del adulto está disponible DURANTE la
                escucha, no solo cuando el reconocedor se rinde: quien está
                delante del niño oye antes y mejor que el micrófono. */}
            <View style={s.judgeRow}>
              <Pressable
                onPress={() => { listeningRef.current = false; setListening(false); stopListening(); resolve(2); }}
                style={[s.judgeBtn, { backgroundColor: V.color.successBg, borderColor: '#bfe9d4' }]}
                accessibilityRole="button"
                accessibilityLabel="Lo dijo bien, dar por válido"
              >
                <Text style={{ fontSize: 22 }}>✅</Text><Text style={s.judgeTxt}>Lo dijo</Text>
              </Pressable>
              <Pressable
                onPress={() => { listeningRef.current = false; setListening(false); stopListening(); resolve(1); }}
                style={[s.judgeBtn, { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' }]}
                accessibilityRole="button"
                accessibilityLabel="Casi, volver a intentarlo"
              >
                <Text style={{ fontSize: 22 }}>💪</Text><Text style={s.judgeTxt}>Casi / otra vez</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => { listeningRef.current = false; setListening(false); stopListening(); setState('judge'); }}
              style={s.stopPill}
            >
              <Text style={s.stopPillTxt}>Parar sin decidir</Text>
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
            <Pressable onPress={() => next({ stars: pendingStars, heard, mode: st.mode ?? 'produccion' })} style={s.primaryBtn}>
              <Text style={s.primaryBtnTxt}>{stepIdx + 1 >= total ? '✅ ¡Terminar!' : '✅ ¡Hecho! Siguiente →'}</Text>
            </Pressable>
          </>
        )}

        {state === 'retry' && (
          <>
            {/* ES-04 · No es lo mismo que el niño se quede corto que que el
                micrófono no captase nada. Decirle «casi casi» cuando el fallo
                fue del motor le atribuye un error que no cometió. */}
            <View style={[s.verdictCard, s.verdictWarn]}>
              <Text style={{ fontSize: 26 }}>{notHeard ? '🎤' : '💪'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.verdictTitle}>{notHeard ? 'No te oí bien' : '¡Casi casi!'}</Text>
                <Text style={s.verdictSub}>
                  {notHeard
                    ? 'El micrófono no captó nada, así que este intento no cuenta. Acercaos un poco y probad otra vez.'
                    : 'Escuchad el modelo despacio y probad otra vez.'}
                </Text>
              </View>
            </View>
            <View style={s.retryRow}>
              <SpeakButton text={st.tts} label="Oír modelo despacio" voice="slowPhrase" />
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
              {st.mode !== 'comprension' && <SpeakButton text={st.tts} label="Oír modelo despacio" voice="slowPhrase" />}
              <Pressable onPress={() => next({ stars: 1, heard, mode: st.mode ?? 'produccion' })} style={s.retryBtn}>
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

  // Antesala de preparación (ES-11)
  setupCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 15, marginBottom: 12, ...V.shadow.card },
  setupKicker: { fontSize: 11, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.5, marginBottom: 9 },
  setupTxt: { fontSize: 14.5, fontWeight: '600', color: V.color.textPrimary, lineHeight: 21 },
  setupStep: { flexDirection: 'row', gap: 11, alignItems: 'flex-start', paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#f1f5f4' },
  setupStepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  setupStepNumTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  setupStepLabel: { fontSize: 13.5, fontWeight: '800', color: V.color.textPrimary },
  setupStepAction: { fontSize: 12.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 2, lineHeight: 18 },
  setupHint: { fontSize: 12.5, fontWeight: '600', color: V.color.textMuted, textAlign: 'center', marginBottom: 12, lineHeight: 18 },
  setupGoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: V.color.primary, borderRadius: 16, paddingVertical: 15, ...V.shadow.button },
  setupGoBtnTxt: { color: '#fff', fontSize: 15.5, fontWeight: '800' },
  reviewSetupPill: { alignSelf: 'flex-start', borderWidth: 1, borderColor: V.color.border, backgroundColor: '#fff', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 13, marginBottom: 12 },
  reviewSetupTxt: { fontSize: 12.5, fontWeight: '800', color: V.color.textSecondary },

  // pick
  howCard: { backgroundColor: V.color.primaryTint, borderWidth: 1.5, borderColor: '#b8eee9', borderRadius: 16, padding: 14, marginBottom: 12 },
  howKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  howTxt: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 7, lineHeight: 19 },
  autoRecordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 14, padding: 12 },
  autoRecordTxt: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary },
  autoRecordSub: { fontSize: 11, fontWeight: '600', color: V.color.textMuted, marginTop: 2, lineHeight: 15 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginBottom: 14 },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastTxt: { color: V.color.textPrimary, fontSize: 13.5, fontWeight: '700', flex: 1 },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginHorizontal: 4 },
  listLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.4 },
  goalCard: { backgroundColor: '#f5f0ff', borderWidth: 1.5, borderColor: '#ddccfa', borderRadius: 14, padding: 12, marginBottom: 12 },
  goalKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: '#6d3fc4' },
  goalTxt: { fontSize: 12.5, fontWeight: '700', color: '#4a3878', marginTop: 5, lineHeight: 17 },
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
  // ES-03: botón ▶ explícito por paso — nada suena hasta pulsarlo.
  playBigBtn: { flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 48, backgroundColor: V.color.primary, borderRadius: 16, paddingHorizontal: 26, paddingVertical: 14, ...V.shadow.button },
  playBigBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  // PM-04: botón de "ya estoy listo" — área mínima de 48dp de alto.
  readyMicBtn: { flexDirection: 'row', alignItems: 'center', gap: 9, minHeight: 48, backgroundColor: '#7c4fd0', borderRadius: 16, paddingHorizontal: 22, paddingVertical: 13, ...V.shadow.button },
  readyMicBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  pickRowCards: { flexDirection: 'row', gap: 12, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  pickCard: { flex: 1, minHeight: 130, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: V.color.border, borderRadius: 18, paddingVertical: 16, ...V.shadow.card },
  pickCardCap: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary, marginTop: 8, textTransform: 'capitalize' },
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

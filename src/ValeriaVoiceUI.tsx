// ============================================================================
// Valeria+ · Componentes de Voz (V6.0)
//   · <SpeakButton />      — píldora 🔊 que lee un texto con la voz de la app.
//   · <MicPracticeCard />  — juego "¡Ahora tú!": el niño repite la palabra
//     objetivo al micrófono y la app valora el intento con estrellas.
//   · <ResponseCaptureCard /> — registro de respuesta libre: graba por voz o
//     escribe lo que dijo el niño (pedido por los evaluadores en las
//     actividades de pragmática, donde no hay una respuesta cerrada).
//   · <TurnPhaseStrip />   — mapa del turno (Escucha → Habla → Veredicto →
//     Misión) para que la familia sepa siempre en qué punto del ensayo está.
// Si el reconocimiento de voz no está disponible (p. ej. Expo Go), la tarjeta
// de micrófono muestra una nota discreta en lugar del juego.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Animated, Easing, Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import {
  speak, speakToChild, speakWordSlow, speakPhraseSlow, speakClinical, stopSpeaking, speakVoiceSample,
  asrSupported, startListening, stopListening, releaseListening, matchTarget, MatchLevel,
  VoiceStatus, refreshVoiceCatalog,
  asrLocaleStatus, requestOfflineModel, asrOfflineStatus, AsrLocaleStatus, asrCaptureEnabled,
  forgetAsrLocale,
} from './valeriaVoice';
import { getLocale, setLocale, assetLang, contentLocale, Locale } from './valeriaLocale';
import { syncUiLangToLocale } from './valeriaUiLang';
import { useT, UiStrings } from './i18n';
import { micVerdictSayFor } from './valeriaExerciseBank';

// ----------------------------------------------------------------------------
// Botón altavoz: lee `text` en voz alta. `voice` elige el tono.
// ----------------------------------------------------------------------------
export const SpeakButton: React.FC<{
  text: string;
  label?: string;
  // 'clinical': frases portadoras y órdenes transaccionales — prosodia continua
  // conservadora (sin jitter ni aceleraciones que muevan el fonema objetivo).
  // 'slow': modelado lento de una PALABRA aislada (p. ej. el objetivo de Pares
  // Mínimos). 'slowPhrase': modelado lento de un enunciado completo (frase de
  // Expansión Semántica) — no confundir ni "corregir" uno por el otro: cada
  // pantalla usa el que corresponde a lo que su modelo normal ya dice.
  voice?: 'tutor' | 'child' | 'slow' | 'slowPhrase' | 'clinical';
  compact?: boolean;
}> = ({ text, label, voice = 'tutor', compact = false }) => {
  const t = useT();
  const onPress = () => {
    if (voice === 'child') speakToChild(text);
    else if (voice === 'slow') speakWordSlow(text);
    else if (voice === 'slowPhrase') speakPhraseSlow(text);
    else if (voice === 'clinical') speakClinical(text);
    else speak(text);
  };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t.voice.listenA11y(text)}
      style={({ pressed }) => [s.speakPill, compact && s.speakPillCompact, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
    >
      <BlockIcon name="speaker" color={V.color.primaryDark} size={compact ? 14 : 17} />
      {!compact && <Text style={s.speakPillTxt}>{label ?? t.voice.listen}</Text>}
    </Pressable>
  );
};

// ----------------------------------------------------------------------------
// Mapa del turno: chips con las fases del ensayo y la fase activa resaltada.
// Responde a la queja de los testers de que "no se sabe qué toca ahora".
// ----------------------------------------------------------------------------
const defaultPhases = (t: UiStrings): { icon: BlockIconName; label: string }[] => [
  { icon: 'speaker', label: t.voice.phaseListen },
  { icon: 'mic', label: t.voice.phaseRepeat },
  { icon: 'level', label: t.voice.phaseVerdict },
  { icon: 'move', label: t.voice.phaseMission },
];

export const TurnPhaseStrip: React.FC<{
  active: number;
  phases?: { icon: BlockIconName; label: string }[];
}> = ({ active, phases }) => {
  const t = useT();
  const items = phases ?? defaultPhases(t);
  return (
    <View style={s.phaseStrip} accessibilityRole="progressbar" accessibilityLabel={t.voice.currentPhase(items[active]?.label ?? '')}>
      {items.map((ph, i) => (
        <React.Fragment key={ph.label}>
          {i > 0 && <Text style={s.phaseArrow}>›</Text>}
          <View style={[s.phaseChip, i === active && s.phaseChipOn, i < active && s.phaseChipDone]}>
            {/* Fase cumplida → marca de verificación; la actual y las que
                quedan, su propio icono. Antes eran cuatro emoji del sistema
                (🔊 🎤 🏅 🏃) en la tira que más se mira de un ensayo. */}
            <BlockIcon
              name={i < active ? 'check' : ph.icon}
              color={i === active ? V.color.primaryDark : V.color.textSecondary}
              size={14}
            />
            <Text style={[s.phaseChipTxt, i === active && s.phaseChipTxtOn]}>{ph.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
};

// ----------------------------------------------------------------------------
// Juego de micrófono: escucha al niño y compara con la palabra objetivo.
// ----------------------------------------------------------------------------
type MicPhase = 'idle' | 'listening' | 'scored' | 'error';

// Lo VISUAL del veredicto lo lee el ADULTO, así que sale del catálogo de
// interfaz (t.voice.micVerdicts, indexado por MatchLevel); lo HABLADO lo oye el
// NIÑO y se localiza por VARIEDAD vía micVerdictSayFor, de modo que en euskera
// suena el veredicto vasco horneado (HiTZ) y no un salto al castellano. Son los
// dos ejes de §5.1 del plan en-US en una sola tarjeta: el adulto puede estar
// leyendo en inglés mientras el niño trabaja objetivos en castellano.

// `altTargets`: respuestas alternativas igual de válidas que `target`
// (PR-4 acepta «¿qué?» además de «¿cómo?»); puntúa la mejor coincidencia.
export const MicPracticeCard: React.FC<{ target: string; prompt?: string; altTargets?: string[] }> = ({ target, prompt, altTargets }) => {
  const t = useT();
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
        <Text style={s.micUnavailableTxt}>{t.voice.micUnavailable}</Text>
      </View>
    );
  }

  const finishWith = (alternatives: string[]) => {
    if (!mounted.current) return;
    const lvl = [target, ...(altTargets ?? [])].reduce<MatchLevel>(
      (best, t) => Math.max(best, matchTarget(alternatives, t)) as MatchLevel, 0,
    );
    setHeard(alternatives[0] ?? '');
    setScore(lvl);
    setPhase('scored');
    speakToChild(micVerdictSayFor(getLocale(), lvl));
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
      // Sin esto, al cerrar el motor sin veredicto (el adulto toca el micro para
      // parar, o el reconocedor se cierra solo) la tarjeta se quedaba con el
      // pulso de «Escuchando…» encendido para siempre.
      onEnd: () => {
        if (!mounted.current) return;
        setPhase((p) => (p === 'listening' ? 'idle' : p));
      },
    });
    if (!ok && mounted.current && phase !== 'error') setPhase('error');
  };

  const micScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const listening = phase === 'listening';

  return (
    <View style={s.micCard}>
      <Text style={s.micKicker}>{t.voice.micKicker}</Text>
      <Text style={s.micPrompt}>{prompt ?? t.voice.micPrompt(target)}</Text>

      <View style={s.micRow}>
        <SpeakButton text={target} label={t.voice.micHearModel} voice="slow" />
        <Animated.View style={{ transform: [{ scale: micScale }] }}>
          <Pressable
            onPress={listen}
            accessibilityRole="button"
            accessibilityLabel={listening ? t.voice.micStopA11y : t.voice.micStartA11y}
            style={[s.micBtn, listening && s.micBtnOn]}
          >
            {/* Escuchando → oreja no: el icono de micro con el botón en rojo ya
                dice que está grabando, y así el set no mezcla dos metáforas. */}
            <BlockIcon name="mic" color="#ffffff" size={28} />
          </Pressable>
        </Animated.View>
        <Text style={s.micState}>{listening ? t.voice.micListening : t.voice.micTapToSpeak}</Text>
      </View>

      {!!heard && (
        <View style={s.heardBox}>
          <Text style={s.heardLbl}>{t.voice.micHeard}</Text>
          <Text style={s.heardTxt}>“{heard}”</Text>
        </View>
      )}

      {phase === 'scored' && (
        <View style={[s.verdict, score === 2 ? s.verdictOk : score === 1 ? s.verdictAlmost : s.verdictRetry]}>
          <Text style={{ fontSize: 22 }}>{t.voice.micVerdicts[score].icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.verdictTitle}>{t.voice.micVerdicts[score].title}</Text>
            <Text style={s.verdictSub}>{t.voice.micVerdicts[score].sub}</Text>
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
// Registro de respuesta libre: para actividades sin respuesta cerrada
// (preguntas ¿qué?, adaptación del discurso…). El adulto puede grabar la voz
// del niño (si hay reconocimiento) o escribir lo que dijo. Lo registrado se
// muestra en la tarjeta para apoyar la evaluación EPT-3 del ejercicio y,
// vía `onCapture`, el player lo guarda con la sesión en el historial.
// ----------------------------------------------------------------------------
export const ResponseCaptureCard: React.FC<{
  prompt?: string;
  onCapture?: (text: string) => void;
}> = ({ prompt, onCapture }) => {
  const t = useT();
  const [text, setTextRaw] = useState('');
  const [listening, setListening] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const mounted = useRef(true);

  const setText = (t: string) => { setTextRaw(t); onCapture?.(t); };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopListening();
      releaseListening();
    };
  }, []);

  const record = async () => {
    if (listening) { await stopListening(); setListening(false); return; }
    setErrMsg(''); setListening(true);
    const ok = await startListening({
      // Aquí sí se espera habla libre (una frase entera del niño), no una
      // palabra objetivo: el modelo de dictado es el correcto.
      expect: 'phrase',
      onPartial: (t) => mounted.current && setText(t),
      onResult: (alts) => {
        if (!mounted.current) return;
        if (alts[0]) setText(alts[0]);
        setListening(false);
      },
      onError: (m) => {
        if (!mounted.current) return;
        setErrMsg(m); setListening(false);
      },
      onEnd: () => mounted.current && setListening(false),
    });
    if (!ok && mounted.current) setListening(false);
  };

  return (
    <View style={s.captureCard}>
      <Text style={s.captureKicker}>{t.voice.captureKicker}</Text>
      <Text style={s.capturePrompt}>{prompt ?? t.voice.capturePrompt}</Text>
      <View style={s.captureRow}>
        <TextInput
          style={s.captureInput}
          value={text}
          onChangeText={setText}
          placeholder={t.voice.capturePlaceholder}
          placeholderTextColor={V.color.textMuted}
          multiline
          accessibilityLabel={t.voice.captureWriteA11y}
        />
        {asrSupported() && (
          <Pressable
            onPress={record}
            accessibilityRole="button"
            accessibilityLabel={listening ? t.voice.captureStopA11y : t.voice.captureRecordA11y}
            style={[s.captureMicBtn, listening && s.captureMicBtnOn]}
          >
            <BlockIcon name="mic" color="#ffffff" size={22} />
          </Pressable>
        )}
      </View>
      {listening && <Text style={s.captureState}>{t.voice.captureListening}</Text>}
      {!!errMsg && <Text style={s.captureErr}>{errMsg}</Text>}
      {!!text && !listening && <Text style={s.captureOk}>{t.voice.captureOk}</Text>}
    </View>
  );
};

// ----------------------------------------------------------------------------
// Tarjeta "Voz de la app": detecta la calidad de la mejor voz en español del
// dispositivo. Si es básica/robótica (frecuente en tablets Android sin los
// datos de voz de Google), guía a la familia a instalar el motor neuronal de
// Google TTS y re-escanea el catálogo al volver. Así la app usa siempre el
// mejor motor realmente disponible en el dispositivo.
// ----------------------------------------------------------------------------
const GOOGLE_TTS_MARKET = 'market://details?id=com.google.android.tts';
const GOOGLE_TTS_WEB = 'https://play.google.com/store/apps/details?id=com.google.android.tts';

// Variedades ofrecidas por el selector:
//   · Castellano → voz neuronal Sharvard (empaquetada).
//   · Galego → voz neuronal Celtia (Proxecto Nós, empaquetada).
//   · Dominicano (es-DO · Quisqueya Habla) → voz y micrófono del SISTEMA en
//     español latino (es-US/es-MX).
//   · Euskara → voz neuronal HiTZ-TTS (ILENIA/NEL-GAITU, empaquetada).
//   · English (US) → voz neuronal Piper en_US (empaquetada). Marcada `beta`
//     porque su BANCO CLÍNICO todavía no existe (Fase 3 del plan en-US): hoy
//     elegirla pone la interfaz en inglés y deja el contenido en castellano
//     — es la build de evaluación EN-0.9. El detalle de la tarjeta lo explica
//     con todas las letras para que nadie lo lea como un fallo.
const LOCALES: Array<{ id: Locale; label: (t: UiStrings) => string; beta?: boolean }> = [
  { id: 'es', label: (t) => t.voice.localeEs },
  { id: 'gl', label: (t) => t.voice.localeGl },
  { id: 'es-DO', label: (t) => t.voice.localeEsDO },
  { id: 'eu', label: (t) => t.voice.localeEu },
  { id: 'en-US', label: (t) => t.voice.localeEnUS, beta: true },
];

const localeLabel = (t: UiStrings, id: Locale): string =>
  LOCALES.find((l) => l.id === id)?.label(t) ?? String(id);

// ----------------------------------------------------------------------------
// Bloque "¿dónde se escucha?" — Fase A de docs/plan-asr-privacidad-y-motor-local.md
// ----------------------------------------------------------------------------
// La app PIDE que el reconocimiento del turno de habla se haga dentro del
// teléfono, para que el audio del menor no salga del dispositivo. No siempre se
// puede: depende del móvil y, sobre todo, de que esté descargado el paquete de
// idioma de ESTA variedad. Es razonable que lo esté en castellano; en galego y
// euskera es mucho menos probable.
//
// Este bloque existe por dos razones, y conviene no perder ninguna de las dos:
//   1. Decirle al adulto la verdad de lo que pasa con la voz de su hijo, por
//      variedad, sin la frase cómoda de "todo se hace en el dispositivo".
//   2. Ofrecer la descarga del paquete UNA vez y de forma explícita (§3.3 paso
//      4). Si declina, se sigue con el reconocedor de red y no se vuelve a
//      insistir: la app es una herramienta de rehabilitación antes que un
//      manifiesto de privacidad, y un ejercicio roto por privacidad es peor
//      que el problema que se quería resolver.
//
// Lo que este bloque NO es: una garantía. Muestra lo que se pide y lo que el
// sistema concede. La prueba concluyente de que el audio no sale es la
// inspección de tráfico de red (§3.5 del plan), no este texto.
export const SpeechPrivacyBlock: React.FC<{ locale: Locale }> = ({ locale }) => {
  const t = useT();
  const [st, setSt] = useState<AsrLocaleStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [note, setNote] = useState('');
  const mounted = useRef(true);

  const offerKey = `${STORAGE_KEYS.asrOfertaLocal}_${locale}`;

  // `fresh`: la comprobación la pidió el adulto a mano. Entonces se tira el
  // diagnóstico cacheado Y la degradación de la sesión, para que el reconocedor
  // local vuelva a tener una oportunidad — que es lo que promete el botón. El
  // sondeo automático (montaje, cambio de variedad) no la levanta: si el motor
  // local ya falló escuchando de verdad, insistir solo alarga el ejercicio.
  const probe = async (fresh = false) => {
    setChecking(true);
    try {
      if (fresh) forgetAsrLocale();
      const [next, raw] = await Promise.all([
        asrLocaleStatus(),
        AsyncStorage.getItem(offerKey).catch(() => null),
      ]);
      if (!mounted.current) return;
      setSt(next);
      setDeclined(raw === 'no');
    } finally {
      if (mounted.current) setChecking(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Se re-consulta al cambiar de variedad: la respuesta es por locale, y el
  // selector de arriba cambia el locale activo de forma síncrona antes de que
  // este efecto corra, así que `asrLocaleStatus()` ya mira la variedad nueva.
  useEffect(() => { setNote(''); void probe(); }, [locale]);

  if (!asrSupported()) return null;

  const download = async () => {
    setNote('');
    setChecking(true);
    const res = await requestOfflineModel();
    if (!mounted.current) return;
    setChecking(false);
    if (res === 'ok') setNote(t.voice.privNoteOk);
    else if (res === 'dialogo') setNote(t.voice.privNoteDialog);
    else if (res === 'cancelado') setNote(t.voice.privNoteCancelled);
    else setNote(t.voice.privNoteFailed);
    if (res === 'ok' || res === 'dialogo') void probe();
  };

  const decline = async () => {
    setDeclined(true);
    setNote(t.voice.privNoteDeclined);
    try { await AsyncStorage.setItem(offerKey, 'no'); } catch (e) { /* preferencia, no dato clínico */ }
  };

  // El paquete que se sondea es el de la variedad cuyo CONTENIDO se está
  // usando: con `en-US` y el banco inglés aún sin escribir, quien escucha es el
  // reconocedor castellano, y anunciar «falta el paquete de English (US)»
  // mandaría al adulto a descargar el paquete equivocado.
  const label = localeLabel(t, contentLocale(locale));
  const local = st?.mode === 'local';

  const detail = st == null
    ? t.voice.privChecking
    : local
      ? t.voice.privLocal(label)
      : st.localFailed
        ? t.voice.privLocalFailed(label)
        : !st.deviceCapable
          ? t.voice.privNotCapable(label)
          : !st.serviceAvailable
            ? t.voice.privNoService(label)
            : st.canOfferDownload
              ? t.voice.privCanDownload(label)
              : t.voice.privNoDownload(label);

  // Modo de la ÚLTIMA escucha real de la sesión. La comprobación de arriba dice
  // lo que se va a pedir; esto dice lo que se pidió. Sirve de diagnóstico rápido
  // en dispositivo (nivel 2 de §3.5) sin tener que exportar la telemetría.
  const last = asrOfflineStatus();

  return (
    <View style={s.privBlock}>
      {/* Fase B · si la build guarda el audio, tiene que verse a la primera y
          sin buscarlo. Una build de captura en manos de una familia sería una
          fuga de datos de salud de un menor (R7 del plan). */}
      {asrCaptureEnabled() && <Text style={s.privCapture}>{t.voice.privCapture}</Text>}

      <View style={s.privHead}>
        <Text style={s.privKicker}>{local ? '🔒' : '☁️'} {t.voice.privKicker}</Text>
        <View style={[s.privChip, local ? s.privChipLocal : s.privChipNet]}>
          <Text style={[s.privChipTxt, { color: local ? '#0f8a63' : '#92711a' }]}>
            {checking && st == null ? t.voice.chipChecking : local ? t.voice.privChipLocal : t.voice.privChipNet}
          </Text>
        </View>
      </View>

      <Text style={s.privDetail}>{detail}</Text>

      {st != null && st.canOfferDownload && !declined && (
        <>
          <Text style={s.privOffer}>{t.voice.privOffer(label)}</Text>
          <View style={s.privBtnRow}>
            <Pressable
              onPress={download}
              disabled={checking}
              style={[s.privBtn, s.privBtnPrimary, checking && { opacity: 0.5 }]}
              accessibilityRole="button"
              accessibilityLabel={t.voice.privDownloadA11y(label)}
            >
              <Text style={[s.privBtnTxt, { color: '#fff' }]}>{t.voice.privDownload}</Text>
            </Pressable>
            <Pressable onPress={decline} style={s.privBtn} accessibilityRole="button" accessibilityLabel={t.voice.privNotNowA11y}>
              <Text style={s.privBtnTxt}>{t.voice.privNotNow}</Text>
            </Pressable>
          </View>
        </>
      )}

      {!!note && <Text style={s.privNote}>{note}</Text>}

      <View style={s.privBtnRow}>
        <Pressable
          onPress={() => { void probe(true); }}
          disabled={checking}
          style={[s.privBtn, checking && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel={t.voice.privRecheckA11y}
        >
          <Text style={s.privBtnTxt}>{t.voice.recheck}</Text>
        </Pressable>
      </View>

      {last !== 'desconocido' && (
        <Text style={s.privFoot}>{t.voice.privLastListen(last === 'local')}</Text>
      )}

      {/* Qué motor contesta de verdad. Es la línea que faltaba: sin ella no
          había forma de ver que la app preguntaba por el modelo a un
          reconocedor distinto del que usaba para escuchar. */}
      {!!st?.serviceName && <Text style={s.privFoot}>{t.voice.privRecognizer(st.serviceName)}</Text>}
    </View>
  );
};

export const VoiceQualityCard: React.FC = () => {
  const t = useT();
  const [status, setStatus] = useState<VoiceStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [locale, setLoc] = useState<Locale>(getLocale());
  const mounted = useRef(true);

  const check = async () => {
    setChecking(true);
    try {
      const st = await refreshVoiceCatalog();
      if (mounted.current) setStatus(st);
    } finally {
      if (mounted.current) setChecking(false);
    }
  };

  // Cambia la variedad activa (valeriaLocale, global) y persiste. setLocale la
  // fija de forma síncrona, así que speakVoiceSample() ya usa la nueva. Las
  // variedades que dependen de la voz del sistema (es, es-DO) re-escanean el
  // catálogo para elegir la mejor voz según la nueva preferencia (es-DO
  // prioriza voces latinas); el galego usa Celtia empaquetada, no re-escanea.
  const pickLocale = (l: Locale) => {
    if (l !== locale) {
      stopSpeaking();
      setLoc(l);
      void setLocale(l);
      // Segundo eje (§5.1 del plan en-US): elegir la variedad ARRASTRA el idioma
      // de la interfaz —`en-US` la pone en inglés, cualquier otra en castellano—
      // pero solo si el adulto no la ha fijado a mano en el selector de idioma.
      // Es la regla que hace que «seleccionar inglés» cambie también la UI sin
      // quitarle al caseload bilingüe la posibilidad de desacoplarlas.
      void syncUiLangToLocale(l);
      // Re-escanear el catálogo cuando la variedad depende (o puede depender) de
      // la voz del sistema: es/es-DO (sin banco propio), y también eu, que hoy
      // recae en la voz del sistema y prefiere una voz vasca nativa si existe.
      if (assetLang(l) == null || l === 'es' || l === 'eu') void check();
    }
    speakVoiceSample();
  };

  useEffect(() => {
    mounted.current = true;
    check();
    return () => { mounted.current = false; };
  }, []);

  const openGoogleVoices = async () => {
    try { await Linking.openURL(GOOGLE_TTS_MARKET); }
    catch (e) { Linking.openURL(GOOGLE_TTS_WEB).catch(() => { /* sin tienda */ }); }
  };

  const tier = status?.tier ?? 'desconocida';
  const good = tier === 'neural';
  const noSpanish = status != null && status.voicesFound === 0;
  const chip = checking ? { txt: t.voice.chipChecking, bg: '#f1f5f4', fg: V.color.textMuted }
    : good ? { txt: t.voice.chipNatural, bg: V.color.successBg, fg: '#0f8a63' }
      : tier === 'estandar' ? { txt: t.voice.chipStandard, bg: '#fffbeb', fg: '#92711a' }
        : { txt: t.voice.chipPoor, bg: V.color.errorBg, fg: V.color.error };

  // Galego → voz neuronal Celtia empaquetada; Euskara → voz neuronal HiTZ-TTS
  // empaquetada; English (US) → voz neuronal Piper en_US empaquetada: ninguna
  // depende del motor del sistema. Dominicano (es-DO) → voz del sistema en
  // español LATINO (es-US/es-MX): la detección de calidad y la guía de
  // instalación siguen aplicando, pero apuntando a una voz latina.
  // Castellano → comportamiento histórico.
  //
  // El detalle de gl y eu está escrito EN SU PROPIA LENGUA a propósito: quien
  // elige esa variedad la lee. El inglés no puede hacer lo mismo todavía —el
  // texto tiene que explicar que la sesión sigue en castellano—, así que sale
  // del catálogo y se lee en el idioma de interfaz del adulto.
  const isGl = locale === 'gl';
  const isEu = locale === 'eu';
  const isEn = locale === 'en-US';
  const packaged = isGl || isEu || isEn; // voz neuronal incluida en la app, offline
  const isDo = locale === 'es-DO';
  const detail = isGl
    ? 'En galego a app fala coa voz neuronal Celtia (Proxecto Nós), incluída na app: soa igual en calquera dispositivo, sen conexión.'
    : isEu
      ? 'Euskaraz aplikazioak HiTZ-en ahots neuronalarekin (ILENIA/NEL-GAITU) hitz egiten du, aplikazioan bertan sartuta: berdin entzuten da edozein gailutan, konexiorik gabe.'
      : isEn ? t.voice.detailEnPending
        : checking ? t.voice.detailSearching
          : noSpanish ? t.voice.detailNoVoice
            : isDo ? t.voice.detailDo(status?.name ?? '')
              : good ? t.voice.detailGood(status?.name ?? '')
                : Platform.OS === 'android' ? t.voice.detailAndroidPoor : t.voice.detailIosPoor;
  // La guía de voces de Google aplica a las variedades con voz del sistema
  // (castellano y dominicano); galego (Celtia), euskara (HiTZ) e inglés (Piper)
  // van empaquetadas.
  const showInstall = !packaged && (!good || noSpanish) && Platform.OS === 'android';

  return (
    <View style={s.vqCard}>
      <View style={s.vqHead}>
        <View style={s.vqIcon}><Text style={{ fontSize: 17 }}>🎙️</Text></View>
        <Text style={s.vqTitle}>{t.voice.cardTitle}</Text>
        <View style={[s.vqChip, { backgroundColor: packaged ? V.color.successBg : chip.bg }]}>
          <Text style={[s.vqChipTxt, { color: packaged ? '#0f8a63' : chip.fg }]}>
            {isGl ? t.voice.chipCeltia : isEu ? t.voice.chipHitz : isEn ? t.voice.chipPiperEn : chip.txt}
          </Text>
        </View>
      </View>

      {/* Selector de variedad de la voz (se guarda en el dispositivo). Tocar una
          opción la elige y reproduce la muestra para oírla al instante. */}
      <Text style={s.vqLangLabel}>{t.voice.varietyLabel}</Text>
      <View style={s.vqLangRow}>
        {LOCALES.map((it) => {
          const on = locale === it.id;
          const label = it.label(t);
          return (
            <Pressable
              key={it.id}
              onPress={() => pickLocale(it.id)}
              style={[s.vqLangBtn, on && s.vqLangBtnOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t.voice.varietyA11y(label, !!it.beta)}
            >
              <Text style={[s.vqLangTxt, on && s.vqLangTxtOn]}>{label}</Text>
              {it.beta && <Text style={[s.vqBeta, on && { color: '#fff', borderColor: 'rgba(255,255,255,.6)' }]}>beta</Text>}
            </Pressable>
          );
        })}
      </View>

      <Text style={s.vqDetail}>{detail}</Text>
      <View style={s.vqBtnRow}>
        <Pressable onPress={speakVoiceSample} style={s.vqBtn} accessibilityRole="button" accessibilityLabel={t.voice.testVoiceA11y}>
          <Text style={s.vqBtnTxt}>{t.voice.testVoice}</Text>
        </Pressable>
        {showInstall && (
          <Pressable onPress={openGoogleVoices} style={[s.vqBtn, s.vqBtnPrimary]} accessibilityRole="button" accessibilityLabel={t.voice.installGoogleA11y}>
            <Text style={[s.vqBtnTxt, { color: '#fff' }]}>{t.voice.installGoogle}</Text>
          </Pressable>
        )}
        {!packaged && (
          <Pressable onPress={check} disabled={checking} style={[s.vqBtn, checking && { opacity: 0.5 }]} accessibilityRole="button" accessibilityLabel={t.voice.recheckA11y}>
            <Text style={s.vqBtnTxt}>{t.voice.recheck}</Text>
          </Pressable>
        )}
      </View>
      {showInstall && !checking && <Text style={s.vqHint}>{t.voice.installHint}</Text>}

      {/* Lo de arriba es la voz que la app PRODUCE; esto es lo que la app
          ESCUCHA. Van juntos a propósito: el adulto elige la variedad una sola
          vez y ve en el mismo sitio qué implica para la voz del niño. */}
      <SpeechPrivacyBlock locale={locale} />
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

  captureCard: { backgroundColor: '#fffdf5', borderWidth: 1.5, borderColor: '#f0e6c8', borderRadius: 16, padding: 14, marginTop: 12 },
  captureKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#92711a' },
  capturePrompt: { fontSize: 13, fontWeight: '700', color: V.color.textPrimary, marginTop: 7, lineHeight: 18 },
  captureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 11 },
  captureInput: { flex: 1, minHeight: 52, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e9e2c9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, fontWeight: '600', color: V.color.textPrimary, textAlignVertical: 'top' },
  captureMicBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#f0b429', alignItems: 'center', justifyContent: 'center', ...V.shadow.button },
  captureMicBtnOn: { backgroundColor: '#ef4444' },
  captureState: { fontSize: 12, fontWeight: '700', color: V.color.textSecondary, marginTop: 8 },
  captureErr: { fontSize: 12, fontWeight: '700', color: V.color.error, marginTop: 8 },
  captureOk: { fontSize: 12, fontWeight: '700', color: '#0f8a63', marginTop: 8 },

  vqCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 14, padding: 13, marginTop: 10, ...V.shadow.card },
  vqHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  vqIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  vqTitle: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary, flex: 1 },
  vqChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 9 },
  vqChipTxt: { fontSize: 11, fontWeight: '800' },

  vqLangLabel: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, color: V.color.textMuted, marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  // El selector nació con 3 variedades y cabían en una fila. Hoy son 5
  // (Euskara e English se sumaron después) y sin `flexWrap` los chips se
  // comprimían hasta solaparse: «Castellano» salía cortado y la etiqueta
  // «beta» se montaba sobre «English (US)». Ahora la fila envuelve y cada
  // chip tiene un ancho mínimo legible en vez de repartirse a la fuerza.
  vqLangRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, rowGap: 8 },
  // Sin `flexGrow`: con 5 variedades, dejar crecer hacía que la fila de 3 y
  // la de 2 tuvieran anchos distintos y el bloque se viera desalineado.
  // Ancho fijo por columna = rejilla pareja de 2×3.
  vqLangBtn: { width: '31.5%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: V.color.pageBg, borderWidth: 1.5, borderColor: V.color.border, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 6 },
  vqLangBtnOn: { backgroundColor: V.color.primary, borderColor: V.color.primary },
  vqLangTxt: { fontSize: 12.5, fontWeight: '800', color: V.color.textSecondary, textAlign: 'center' },
  vqLangTxtOn: { color: '#fff' },
  vqBeta: { fontSize: 9, fontWeight: '800', color: V.color.textMuted, borderWidth: 1, borderColor: V.color.border, borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1, letterSpacing: 0.4, textTransform: 'uppercase' },
  vqDetail: { fontSize: 11.5, fontWeight: '600', color: V.color.textMuted, marginTop: 8, lineHeight: 15.5 },
  vqBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 11 },
  vqBtn: { backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8 },
  vqBtnPrimary: { backgroundColor: V.color.primary, borderColor: V.color.primary },
  vqBtnTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  vqHint: { fontSize: 11, fontWeight: '600', color: V.color.textSecondary, marginTop: 10, lineHeight: 15, backgroundColor: V.color.pageBg, borderRadius: 10, padding: 10 },

  privBlock: { backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: V.color.border, borderRadius: 12, padding: 11, marginTop: 12 },
  privHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  privKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  privKicker: { flex: 1, fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, color: V.color.textMuted },
  privChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  privChipLocal: { backgroundColor: V.color.successBg },
  privChipNet: { backgroundColor: '#fffbeb' },
  privChipTxt: { fontSize: 10.5, fontWeight: '800' },
  privDetail: { fontSize: 11.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 7, lineHeight: 15.5 },
  privOffer: { fontSize: 11.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 8, lineHeight: 15.5 },
  privBtnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 9 },
  privBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  privBtnPrimary: { backgroundColor: V.color.primary, borderColor: V.color.primary },
  privBtnTxt: { fontSize: 11.5, fontWeight: '800', color: V.color.textSecondary },
  privNote: { fontSize: 11, fontWeight: '700', color: V.color.textSecondary, marginTop: 9, lineHeight: 15 },
  privFoot: { fontSize: 10.5, fontWeight: '600', color: V.color.textMuted, marginTop: 8 },
  privCapture: { fontSize: 11.5, fontWeight: '800', color: '#fff', backgroundColor: V.color.error, borderRadius: 9, padding: 9, marginBottom: 10, lineHeight: 15.5 },

  phaseStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 13, paddingVertical: 7, paddingHorizontal: 8, marginTop: 12 },
  phaseArrow: { fontSize: 12, fontWeight: '800', color: V.color.textMuted },
  phaseChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  phaseChipOn: { backgroundColor: V.color.primaryLight },
  phaseChipDone: { opacity: 0.7 },
  phaseChipTxt: { fontSize: 10.5, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.2 },
  phaseChipTxtOn: { color: V.color.primaryDark },
});

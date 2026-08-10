// ============================================================================
// Valeria+ · Player de Sesión de Terapia (V5.0)
// Flujo guiado tutor + niño: consigna real, mini-juego visual por tipo de
// ejercicio y evaluación con la escala clínica EPT-3 (1★ / 2★ / 3★).
//
// Novedades V4:
//   · Fichas ilustradas con emojis grandes (adiós placeholders) y zoom al tocar.
//   · "Versión en movimiento" por ejercicio + Pausas Activas entre ejercicios.
//   · Confeti y recompensas estilo Duolingo al terminar (XP, racha, logros).
//
// Novedades V5 (voz):
//   · Síntesis de voz: la app lee consignas, palabras objetivo y frases (🔊).
//   · Juego de micrófono: el niño repite la palabra y la app valora el intento.
//   · Cápsulas TPR (Total Physical Response) entre ejercicios: la app dicta
//     órdenes en voz alta y el niño responde con el cuerpo.
//
// Novedades V6 (UX):
//   · Rondas con contenido variado por mini-juego (VARIANTS): repetir un
//     ejercicio ya no muestra siempre la misma palabra/ficha/respuesta.
//   · Flujo numerado PASO 1→4 (consigna → juego → movimiento → evaluación)
//     para que el tutor sepa siempre qué toca.
//   · La app celebra o anima con voz variada los aciertos/fallos del niño
//     en los mini-juegos táctiles (intruso, emociones, vocal faltante).
//   · Cabecera con el nombre real del paciente activo.
//
// Novedades V7 (feedback de los evaluadores del bloque de Audición):
//   · Consignas reescritas en lenguaje llano y con los pasos concretos.
//   · Tarjeta "Necesitarás" al inicio cuando la actividad usa material real.
//   · Edad orientativa visible en cada ejercicio.
//   · FF-1 ahora es un juego real de unir imagen ↔ vocal en la pantalla.
//   · FF-3 y SE-1 con apoyo auditivo (oír la palabra completa / las fichas).
//   · SE-2 con opciones de respuesta visuales (ya no es solo oral).
//   · MS-1 y MS-2 con mini-juego visual + audio (uno/muchos y niño/niña).
//   · MS-3 ordena las fichas en pantalla mientras escucha la frase (sin dados).
//   · PR-1 y PR-2 registran la respuesta del niño por voz o por escrito.
//   · PR-3 con audio en las opciones y refuerzo inmediato; PR-4 clarificado
//     con práctica de micrófono de la fórmula "¿cómo?".
//   · Explicación en lenguaje sencillo de la escala EPT-3 en la evaluación.
//
// Navegación: navigation.navigate('ExercisePlayer', { id?: string; ids?: string[] })
//   · Con `ids` -> sesión con esa lista de ejercicios (p. ej. todos los prescritos).
//   · Con `id`  -> sesión de un solo ejercicio.
//   · Sin nada  -> sesión por defecto (plan prescrito de ejemplo).
// ============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Modal, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { useT } from './i18n';
import { registerSession, SessionReward, levelProgress, xpToNext } from './valeriaGamification';
import { PixelAward, tierBg, streakTier } from './ValeriaPixelAwards';
import { CatPixel } from './ValeriaCatPixel';
import { BlockIcon } from './ValeriaBlockIcons';
import { speakToChild, speakToChildSeq, speakWordSlow, stopSpeaking, praisePhrase, almostPhrase, normalizeSpeech } from './valeriaVoice';
import { SpeakButton, MicPracticeCard, ResponseCaptureCard } from './ValeriaVoiceUI';
import { ValeriaSessionBreakOverlay, pickSessionBreak, SessionBreak } from './ValeriaSessionBreakOverlay';
import { ValeriaAdultChaosPanel } from './ValeriaAdultChaosPanel';
import { ValeriaDistractorCat } from './ValeriaDistractorCat';
import { ValeriaPragmaticBreakOverlay } from './ValeriaPragmaticBreak';
import { releaseNoise } from './valeriaNoise';
import { AUDICION_META, LENGUAJE_META, TEA_META, DISLEXIA_META } from './valeriaExerciseMeta';
import { markBlockCompleted } from './valeriaTelemetry';
import { Tile, Exercise, DEFAULT_SESSION, dbForLocale, variantsForLocale, emoForLocale, sessionDoneLeadFor, pluralHintFor, touchImageHintFor, emotionQuestionFor, emotionPromptFor, pluralOneLabelFor, pluralManyLabelFor } from './valeriaExerciseBank';
import { getLocale } from './valeriaLocale';

// Conjuntos de ids por bloque para marcar el hito de "bloque completado" (SUS).
const AUD_IDS = new Set(AUDICION_META.map((m) => m.id));
const LEN_IDS = new Set(LENGUAJE_META.map((m) => m.id));
const TEA_IDS = new Set(TEA_META.map((m) => m.id));
const DIX_IDS = new Set(DISLEXIA_META.map((m) => m.id));
// import logoWhite from '../../assets/valeria-logo-white.png';

// La base de datos de ejercicios (DB), sus rondas de contenido (VARIANTS) y la
// sesión por defecto viven en el módulo PURO valeriaExerciseBank, para que el
// corpus de voz pueda enumerar lo que estas pantallas locutan (voz neuronal es).
const VOWELS = ['A', 'E', 'I', 'O', 'U'];

// Entre ejercicios se muestra una Cápsula TPR (escucha y muévete): sustituye a
// las antiguas pausas activas. El banco de cápsulas vive en ValeriaTPRCapsule.

// ----------------------------------------------------------------------------
// Ficha ilustrada con emoji. Con `onZoom` es tocable y amplía la imagen; SIN
// `onZoom` es una vista plana, para usarla DENTRO de fichas de mini-juego
// tocables: un Pressable anidado robaba el toque y el juego de asociación
// (FF-1) o las respuestas parecían no funcionar (bug reportado por testers).
// En esos juegos, el zoom pasa a mantener pulsada la ficha exterior.
// ----------------------------------------------------------------------------
const TILE_BGS = ['#fef3e2', '#e8f4fd', '#f3e8fd', '#e8fdf0', '#fdeef2', '#fdf8e2'];

const EmojiTile: React.FC<{
  emoji: string; cap?: string; size?: number; bgIndex?: number;
  onZoom?: (emoji: string, cap: string) => void;
}> = ({ emoji, cap, size = 78, bgIndex = 0, onZoom }) => {
  const box = { width: size, height: size * 0.84, backgroundColor: TILE_BGS[bgIndex % TILE_BGS.length] };
  if (!onZoom) {
    return (
      <View style={[s.emojiTile, box]}>
        <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>
      </View>
    );
  }
  return (
    <Pressable
      onPress={() => onZoom(emoji, cap ?? '')}
      accessibilityRole="imagebutton"
      accessibilityLabel={`Ampliar imagen de ${cap ?? 'la ficha'}`}
      style={({ pressed }) => [s.emojiTile, box, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      <Text style={{ fontSize: size * 0.46 }}>{emoji}</Text>
      <View style={s.zoomHintDot}><BlockIcon name="zoom" color={V.color.primaryDark} size={12} /></View>
    </Pressable>
  );
};

// ----------------------------------------------------------------------------
// Cuadrícula de respuesta compartida (intruso y adivinanzas/género): fichas
// con imagen; al tocar una se marca ✅/❌ contra la respuesta correcta.
// `revealAnswer` muestra además la correcta cuando se toca otra (intruso).
// ----------------------------------------------------------------------------
const AnswerTileGrid: React.FC<{
  tiles: Tile[];
  answer: number;
  picked: number; // -1 = ninguna elegida aún
  onPick: (i: number, isAnswer: boolean) => void;
  onZoom: (emoji: string, cap: string) => void;
  size?: number;
  tileStyle?: object;
  center?: boolean;
  revealAnswer?: boolean;
}> = ({ tiles, answer, picked, onPick, onZoom, size = 96, tileStyle, center = false, revealAnswer = false }) => (
  <View style={[s.grid2, center && { justifyContent: 'center' }]}>
    {tiles.map((t, i) => {
      const tapped = picked === i;
      const isAns = i === answer;
      const ok = (tapped && isAns) || (revealAnswer && picked >= 0 && isAns);
      const bad = tapped && !isAns;
      return (
        <Pressable
          key={i}
          // Toque = responder; pulsación larga = ampliar. La ficha interior es
          // plana para que ningún Pressable anidado robe el toque.
          onPress={() => { if (picked !== i) onPick(i, isAns); }}
          onLongPress={() => onZoom(t.emoji, t.cap)}
          accessibilityRole="button"
          accessibilityLabel={`Responder ${t.cap}. Mantén pulsado para ampliar la imagen`}
          style={[s.gridTile, tileStyle, ok && s.gridTileOk, bad && s.gridTileBad]}
        >
          <View style={{ alignItems: 'center' }}>
            <EmojiTile emoji={t.emoji} cap={t.cap} size={size} bgIndex={i} />
          </View>
          <View style={s.gridCapRow}>
            <Text style={s.gridCap}>{t.cap}</Text>
            {ok ? <BlockIcon name="check" color={V.color.success} size={15} />
              : bad ? <BlockIcon name="cross" color={V.color.error} size={15} /> : null}
          </View>
        </Pressable>
      );
    })}
  </View>
);

// ----------------------------------------------------------------------------
// Modal de zoom: la imagen crece con animación de resorte a pantalla completa.
// ----------------------------------------------------------------------------
const ZoomModal: React.FC<{ emoji: string; cap: string; visible: boolean; onClose: () => void }> = ({ emoji, cap, visible, onClose }) => {
  const t = useT();
  const scale = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    if (visible) {
      scale.setValue(0.3);
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    }
  }, [visible, scale]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.zoomOverlay} onPress={onClose} accessibilityRole="button" accessibilityLabel={t.player.zoomCloseA11y}>
        <Animated.View style={[s.zoomCard, { transform: [{ scale }] }]}>
          <Text style={s.zoomEmoji}>{emoji}</Text>
          {!!cap && <Text style={s.zoomCap}>{cap}</Text>}
          <Text style={s.zoomClose}>{t.player.zoomClose}</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ----------------------------------------------------------------------------
// Chuleta del adulto (RA-2 · lectura labiofacial)
// El adulto tiene que pronunciar la palabra SIN VOZ. Para saber cuál era, la
// única vía era pulsar «oír la palabra» delante del niño — y oírla resuelve la
// tarea, que consiste precisamente en no oírla. Aquí la palabra se le da por
// escrito, PLEGADA: se abre apartando la pantalla, se lee y se vuelve a cerrar.
// Empieza cerrada siempre (no recuerda el estado entre ejercicios) porque el
// riesgo no es la incomodidad de un toque, es que quede abierta sin querer.
// ----------------------------------------------------------------------------
const AdultOnlyPrompt: React.FC<{ word: string }> = ({ word }) => {
  const t = useT();
  const [shown, setShown] = useState(false);
  useEffect(() => { setShown(false); }, [word]);
  return (
    <View style={s.adultOnlyCard}>
      <Pressable
        onPress={() => setShown((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={shown ? t.player.adultOnlyHideA11y : t.player.adultOnlyShowA11y}
        style={s.adultOnlyHead}
      >
        <BlockIcon name={shown ? 'eye' : 'eyeOff'} color={V.color.textSecondary} size={16} />
        <View style={{ flex: 1 }}>
          <Text style={s.adultOnlyKicker}>{t.player.adultOnlyKicker}</Text>
          <Text style={s.adultOnlySub}>
            {shown ? t.player.adultOnlyHide : t.player.adultOnlyShow}
          </Text>
        </View>
      </Pressable>
      {shown && <Text style={s.adultOnlyWord}>{word}</Text>}
    </View>
  );
};

// ----------------------------------------------------------------------------
// Confeti ligero: piezas que caen al completar la sesión.
//
// Eran emoji (🎉 ⭐ 🎊 ✨ 💚 🌟) y con las insignias ya en píxel art quedaba una
// celebración con dos estéticas a la vez. Ahora son cuadrados de color de la
// paleta de rangos: mismo lenguaje que los premios que se están entregando, y
// además los dibuja la app y no el fabricante del teléfono (regla 5).
// ----------------------------------------------------------------------------
const CONFETTI = ['#00c4be', '#d9a520', '#7c4fd0', '#ef6c2e', '#00a39e', '#f4a9b6'];
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const ConfettiBurst: React.FC = () => {
  const pieces = useRef(
    Array.from({ length: 14 }).map((_, i) => ({
      anim: new Animated.Value(0),
      x: Math.random() * (SCREEN_W - 40),
      delay: i * 130,
      color: CONFETTI[i % CONFETTI.length],
      size: 9 + (i % 3) * 3,
      spin: Math.random() > 0.5 ? '360deg' : '-360deg',
    })),
  ).current;

  useEffect(() => {
    pieces.forEach((p) => {
      Animated.timing(p.anim, {
        toValue: 1, duration: 2400, delay: p.delay,
        easing: Easing.in(Easing.quad), useNativeDriver: true,
      }).start();
    });
  }, [pieces]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', left: p.x, top: -40,
            width: p.size, height: p.size, backgroundColor: p.color, borderRadius: 2,
            opacity: p.anim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_H * 0.85] }) },
              { rotate: p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', p.spin] }) },
            ],
          }}
        />
      ))}
    </View>
  );
};

// ----------------------------------------------------------------------------
// Componente principal
// ----------------------------------------------------------------------------
export const ValeriaExercisePlayerScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const t = useT();
  // Banco de la variedad activa (fijado al montar): en es-DO aplica los overrides
  // dominicanos (léxico, consignas y plural por determinante · QH-2.3).
  const loc = useRef(getLocale()).current;
  const db = useRef(dbForLocale(loc)).current;
  const variantsMap = useRef(variantsForLocale(loc)).current;
  // Constantes de pantalla localizadas por variedad (emociones, cierre de
  // sesión, pista y etiquetas de plural): en eu son vascas (HiTZ).
  const emo = useRef(emoForLocale(loc)).current;
  const emoQuestion = emotionQuestionFor(loc);
  const startId: string | undefined = route?.params?.id;
  const startIds: string[] | undefined = route?.params?.ids;
  const sessionIds = useMemo(() => {
    if (Array.isArray(startIds)) {
      const valid = startIds.filter((i) => typeof i === 'string' && db[i]);
      if (valid.length) return valid;
    }
    return startId && db[startId] ? [startId] : DEFAULT_SESSION;
  }, [startId, startIds, db]);

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [picked, setPicked] = useState(0);
  const [locking, setLocking] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [reward, setReward] = useState<SessionReward | null>(null);
  // Progresión Inicial → Intermedio → Avanzado dentro del ejercicio actual.
  const [subIdx, setSubIdx] = useState(0);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  // estado efímero de mini-juego
  const [fillPick, setFillPick] = useState('');
  const [intruderPick, setIntruderPick] = useState(-1);
  const [emotionPick, setEmotionPick] = useState('');
  // FF-1: unir imagen ↔ vocal (imagen seleccionada, imágenes ya unidas y vocal errónea que parpadea)
  const [matchSel, setMatchSel] = useState(-1);
  const [matchOk, setMatchOk] = useState<boolean[]>([]);
  const [wrongVowel, setWrongVowel] = useState('');
  // SE-2 / MS-2: elegir la imagen correcta tras el audio
  const [choicePick, setChoicePick] = useState(-1);
  // MS-1: tarjeta con uno / tarjeta con muchos
  const [pluralPick, setPluralPick] = useState<'' | 'one' | 'many'>('');
  // MS-3: fichas tocadas en orden para construir la frase
  const [orderPicks, setOrderPicks] = useState<number[]>([]);
  // DX-5: letras objetivo encontradas en la rejilla de rotaciones (+ fallo que parpadea)
  const [rotFound, setRotFound] = useState<boolean[]>([]);
  const [rotWrongIdx, setRotWrongIdx] = useState(-1);
  // Botonera de Juez (DX-3/DX-4): veredicto MANUAL del adulto cuando el STT
  // falla o va lento en hardware de gama baja ("Lo dijo" / "Casi").
  const [judgePick, setJudgePick] = useState<'' | 'ok' | 'almost'>('');
  // DX-4: contador de ensayos con límite rígido (fatiga cognitiva) + cápsula
  // TPR de descarga lanzada UNA sola vez al alcanzar el límite.
  const [trials, setTrials] = useState(0);
  const [capsuleLaunched, setCapsuleLaunched] = useState(false);
  // TEA-1: Sello Doble con instigación retardada (Time Delay): el botón queda
  // bloqueado N segundos entre sellos; el adulto lo retiene hasta contacto visual.
  const [selloCount, setSelloCount] = useState(0);
  const [selloCooldown, setSelloCooldown] = useState(0);
  // Explicación en lenguaje llano de la escala EPT-3
  const [eptInfoOpen, setEptInfoOpen] = useState(false);
  // Respuestas libres registradas (voz o escrito) por código de ejercicio;
  // al terminar, se guardan con la sesión en el historial de Resultados.
  const capturesRef = useRef<Record<string, { name: string; text: string }>>({});
  // zoom de imagen
  const [zoom, setZoom] = useState<{ emoji: string; cap: string } | null>(null);
  // cápsula TPR entre ejercicios
  const [activeBreak, setActiveBreak] = useState<SessionBreak | null>(null);
  // Panel del adulto (Fase 2): controles SIEMPRE manuales del caos comunicativo.
  const [distractorOn, setDistractorOn] = useState(false);
  const [pragmaticOpen, setPragmaticOpen] = useState(false);
  // ronda de contenido dentro del ejercicio (banco VARIANTS)
  const [round, setRound] = useState(0);
  // nombre real del paciente activo para la cabecera
  const [patientName, setPatientName] = useState('');

  const baseEx = db[sessionIds[idx]] ?? db.ff1;
  // Siguiente ejercicio de la sesión (undefined en el último): lo consume la
  // tarjeta de anticipación de la transición.
  const nextEx = idx + 1 < sessionIds.length ? db[sessionIds[idx + 1]] : undefined;
  const variants = variantsMap[sessionIds[idx]] ?? [];
  const totalRounds = variants.length;
  // Ejercicio efectivo de la ronda actual: los campos de la variante pisan a los base.
  const ex: Exercise = totalRounds ? { ...baseEx, ...variants[round % totalRounds] } : baseEx;
  const total = sessionIds.length;
  const curLevel = ex.levels?.[subIdx];

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.registro);
        const nombre = raw ? JSON.parse(raw)?.nombre : '';
        if (typeof nombre === 'string' && nombre.trim()) setPatientName(nombre.trim());
      } catch (e) { /* sin ficha activa */ }
    })();
  }, []);

  // Silencia la voz de la app al cambiar de ejercicio y al salir de la pantalla.
  useEffect(() => { stopSpeaking(); }, [idx, subIdx]);
  useEffect(() => () => { stopSpeaking(); releaseNoise(); }, []);

  // Vuelve arriba al cambiar de ejercicio o nivel: la evaluación se toca al
  // final de la página, y sin este reset el siguiente ejercicio aparecía ya
  // desplazado al fondo — parecía que la sesión no avanzaba.
  const scrollRef = useRef<ScrollView | null>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [idx, subIdx, finished]);

  const resetEphemeral = () => {
    clearGameTimers();
    setFillPick(''); setIntruderPick(-1); setEmotionPick('');
    setMatchSel(-1); setMatchOk([]); setWrongVowel('');
    setChoicePick(-1); setPluralPick(''); setOrderPicks([]);
    setRotFound([]); setRotWrongIdx(-1); setJudgePick('');
    setTrials(0); setCapsuleLaunched(false);
  };

  const nextRound = () => {
    stopSpeaking();
    setRound((r) => r + 1);
    resetEphemeral();
  };

  const openZoom = (emoji: string, cap: string) => setZoom({ emoji, cap });

  // Feedback hablado de los mini-juegos táctiles: celebrar el acierto y animar
  // en el fallo, con frases rotativas para que no suene enlatado.
  const speakVerdict = (ok: boolean) => speakToChild(ok ? praisePhrase() : almostPhrase());

  // Vocal inicial de una palabra sin tildes: águila → A (para FF-1).
  // Reutiliza la normalización de acentos del motor de voz.
  const initialVowel = (cap: string) => normalizeSpeech(cap).charAt(0).toUpperCase();

  // Timers efimeros de los mini-juegos: se guardan para poder cancelarlos al
  // cambiar de ejercicio/ronda o al salir de la pantalla.
  const flashTimer = useRef<any>(null);
  const orderTimer = useRef<any>(null);
  const rotTimer = useRef<any>(null);
  const synTimer = useRef<any>(null);
  const clearGameTimers = () => {
    clearTimeout(flashTimer.current);
    clearTimeout(orderTimer.current);
    clearTimeout(rotTimer.current);
    clearTimeout(synTimer.current);
  };
  useEffect(() => () => clearGameTimers(), []);

  // TEA-1 · Sello Doble: al entrar en el ejercicio (o cambiar de ronda) el
  // botón arranca bloqueado el Time Delay completo; cada sello lo re-bloquea.
  useEffect(() => {
    setSelloCount(0);
    setSelloCooldown(ex.timeDelaySec ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, round]);
  useEffect(() => {
    if (selloCooldown <= 0) return;
    const t = setTimeout(() => setSelloCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [selloCooldown]);

  // DX-3 · Síntesis fonémica rítmica: emite cada fonema AISLADO con la latencia
  // forzada del protocolo (phonemeGapMs, 500 ms) entre uno y otro. La fusión la
  // hace el niño; la app jamás pronuncia la palabra completa aquí.
  const playPhonemes = () => {
    const phs = ex.phonemes ?? [];
    if (!phs.length) return;
    stopSpeaking();
    clearTimeout(synTimer.current);
    const step = (i: number) => {
      if (i >= phs.length) return;
      speakWordSlow(phs[i]);
      // ~700 ms de locución del fonema + la latencia forzada entre fonemas.
      synTimer.current = setTimeout(() => step(i + 1), (ex.phonemeGapMs ?? 500) + 700);
    };
    step(0);
  };

  // DX-5 · Rastreo de rotaciones: tocar la grafía objetivo la fija en verde;
  // tocar una gemela girada (b/d, p/q) parpadea en rojo y anima a seguir. Los
  // toques FUERA de las fichas los captura ValeriaMisclickBoundary (mapa X,Y).
  const tapRotation = (i: number) => {
    const rt = ex.rotationTargets!;
    if (rotFound[i]) return;
    if (rt.grid[i] === rt.target) {
      const next = [...rotFound]; next[i] = true;
      setRotFound(next);
      const remaining = rt.grid.filter((g, k) => g === rt.target && !next[k]).length;
      if (remaining === 0) speakVerdict(true);
    } else {
      setRotWrongIdx(i);
      speakVerdict(false);
      clearTimeout(rotTimer.current);
      rotTimer.current = setTimeout(() => setRotWrongIdx(-1), 900);
    }
  };

  // DX-6 · Denominación Rápida (RAN): la matriz se nombra y toca en ORDEN de
  // lectura (izquierda→derecha). La app solo marca el avance; no nombra los
  // dibujos (lo hace el niño) ni cronometra (el estresor es la persecución
  // dactilar ANALÓGICA del adulto). Reutiliza rotFound/rotWrongIdx.
  const tapRan = (i: number) => {
    const nextExpected = rotFound.filter(Boolean).length;
    if (rotFound[i]) return;
    if (i === nextExpected) {
      // Solo se avanza en orden estricto, así que lo marcado es siempre el
      // prefijo [0..i-1] y basta con fijar la posición actual.
      const next = [...rotFound];
      next[i] = true;
      setRotFound(next);
      if (i + 1 === ex.tiles!.length) speakVerdict(true);
    } else {
      setRotWrongIdx(i);
      clearTimeout(rotTimer.current);
      rotTimer.current = setTimeout(() => setRotWrongIdx(-1), 900);
    }
  };

  // DX-4 · Criba de pseudopalabras: cada veredicto del Juez consume un ensayo.
  // Al llegar al límite rígido se intercala UNA cápsula TPR de descarga.
  const judgeTrial = (ok: boolean) => {
    if (!ex.maxTrials || trials >= ex.maxTrials) return;
    const next = trials + 1;
    setTrials(next);
    setJudgePick(ok ? 'ok' : 'almost');
    speakVerdict(ok);
    if (next >= ex.maxTrials && !capsuleLaunched) {
      setCapsuleLaunched(true);
      setActiveBreak(pickSessionBreak());
    }
  };

  // Botonera de Juez compartida (DX-3/DX-4): veredicto manual del adulto
  // cuando el reconocimiento de voz falla o el hardware va lento.
  const judgeButtons = (disabled: boolean, onJudge: (ok: boolean) => void) => (
    <View style={s.judgeRow}>
      <Pressable
        disabled={disabled}
        onPress={() => onJudge(true)}
        accessibilityRole="button" accessibilityLabel={t.player.judgeSaidItA11y}
        style={[s.judgeBtn, s.judgeBtnOk, disabled && { opacity: 0.4 }]}
      >
        <Text style={s.judgeBtnTxt}>{t.player.judgeSaidIt}</Text>
      </Pressable>
      <Pressable
        disabled={disabled}
        onPress={() => onJudge(false)}
        accessibilityRole="button" accessibilityLabel={t.player.judgeAlmostA11y}
        style={[s.judgeBtn, s.judgeBtnAlmost, disabled && { opacity: 0.4 }]}
      >
        <Text style={s.judgeBtnTxt}>{t.player.judgeAlmost}</Text>
      </Pressable>
    </View>
  );

  // FF-1 · unir imagen ↔ vocal: tocar la imagen la nombra en voz alta y la
  // selecciona; tocar después una vocal comprueba la unión en la tablet.
  const tapMatchTile = (i: number) => {
    if (matchOk[i]) return;
    setMatchSel(i);
    speakWordSlow(ex.tiles![i].cap);
  };
  const tapMatchVowel = (v: string) => {
    if (matchSel < 0) { speakToChild(touchImageHintFor(loc)); return; }
    if (initialVowel(ex.tiles![matchSel].cap) === v) {
      setMatchOk((prev) => { const n = [...prev]; n[matchSel] = true; return n; });
      setMatchSel(-1);
      speakVerdict(true);
    } else {
      setWrongVowel(v);
      speakVerdict(false);
      clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setWrongVowel(''), 900);
    }
  };

  // MS-3 · construir la frase tocando las fichas en orden (quién → qué hace →
  // qué cosa). Si el orden final no es correcto, se anima y se reinicia.
  const tapOrderTile = (i: number) => {
    if (orderPicks.includes(i)) return;
    const next = [...orderPicks, i];
    setOrderPicks(next);
    if (next.length === ex.parts!.length) {
      const okOrder = next.every((p, k) => p === k);
      if (okOrder) speakToChildSeq([praisePhrase(), ex.sentence!]);
      else {
        speakToChild(almostPhrase());
        clearTimeout(orderTimer.current);
        orderTimer.current = setTimeout(() => setOrderPicks([]), 1400);
      }
    } else {
      speakWordSlow(ex.parts![i].cap);
    }
  };

  const pick = (val: number) => {
    if (locking || finished) return;
    setPicked(val);
    setLocking(true);
    setTimeout(() => {
      // Si el ejercicio tiene niveles de dificultad, primero se recorren
      // Inicial → Intermedio → Avanzado antes de cerrar el ejercicio.
      if (ex.levels && subIdx + 1 < ex.levels.length) {
        setLevelScores((prev) => [...prev, val]);
        setSubIdx(subIdx + 1);
        setPicked(0); setLocking(false); resetEphemeral();
        return;
      }
      const exerciseScore = ex.levels
        ? Math.round([...levelScores, val].reduce((a, b) => a + b, 0) / (levelScores.length + 1))
        : val;
      const nextResults = [...results, exerciseScore];
      setResults(nextResults);
      if (idx + 1 >= total) {
        finish(nextResults);
      } else {
        setIdx(idx + 1); setSubIdx(0); setLevelScores([]); setRound(0);
        setPicked(0); setLocking(false); resetEphemeral();
        // Pausa activa sorpresa antes del siguiente ejercicio: cápsula TPR
        // clásica o Ruta de Rutina (TPR 2.0). La telemetría de inicio/fin/salto
        // vive dentro del propio overlay unificado.
        setActiveBreak(pickSessionBreak());
      }
    }, 620);
  };

  const finish = async (res: number[]) => {
    const avg = res.reduce((a, b) => a + b, 0) / res.length;
    const sessionName = total === 1 ? ex.name : t.player.sessionName;
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.historial);
      const hist = raw ? JSON.parse(raw) : [];
      const d = new Date();
      // Respuestas libres registradas durante la sesión (PR-1, PR-2…): viajan
      // con la entrada del historial para que Resultados las muestre.
      const responses = Object.entries(capturesRef.current)
        .map(([code, r]) => ({ code, name: r.name, text: r.text }));
      hist.push({
        date: `${d.getDate()} ${t.ling.months.split(' ')[d.getMonth()]}`,
        name: sessionName,
        avg: +avg.toFixed(1),
        note: avg >= 2.5 ? t.player.noteGreat
          : avg >= 1.8 ? t.player.noteGood
            : t.player.noteHard,
        completed: true,
        ...(responses.length ? { responses } : {}),
      });
      await AsyncStorage.setItem(STORAGE_KEYS.historial, JSON.stringify(hist));
    } catch (e) { /* almacenamiento no disponible */ }
    try {
      // Recompensas estilo Duolingo: XP, racha y logros.
      setReward(await registerSession(avg, res.length));
    } catch (e) { /* gamificación no disponible */ }
    setResults(res);
    releaseNoise(); // fin de sesión: la Pista B no sobrevive a la pantalla de logros
    setFinished(true);
    // Telemetría: hito de bloque completado (Audición/Lenguaje según los ids de
    // la sesión) → puede disparar el SUS (rate-limited) al cerrar ≥4 bloques distintos.
    if (sessionIds.some((id) => AUD_IDS.has(id))) markBlockCompleted('audicion');
    if (sessionIds.some((id) => LEN_IDS.has(id))) markBlockCompleted('lenguaje');
    if (sessionIds.some((id) => TEA_IDS.has(id))) markBlockCompleted('tea');
    if (sessionIds.some((id) => DIX_IDS.has(id))) markBlockCompleted('dislexia');
    // Celebración hablada para el niño al cerrar la sesión (frase rotativa).
    speakToChildSeq([sessionDoneLeadFor(loc), praisePhrase()]);
  };

  // Cuenta atrás hacia Resultados. El updater solo decrementa; la navegación
  // vive en su propio efecto: hacer navigate() DENTRO del updater de estado
  // hacía que en algunos dispositivos la redirección automática se perdiera
  // (bug reportado: al terminar el ejercicio no avanzaba a resultados).
  const timerRef = useRef<any>(null);
  useEffect(() => {
    if (!finished) return;
    timerRef.current = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timerRef.current);
  }, [finished]);
  useEffect(() => {
    if (finished && countdown === 0) {
      clearInterval(timerRef.current);
      navigation.navigate('Results');
    }
  }, [finished, countdown]);

  const restart = () => {
    clearInterval(timerRef.current);
    capturesRef.current = {};
    setIdx(0); setSubIdx(0); setLevelScores([]); setResults([]); setPicked(0); setLocking(false);
    setFinished(false); setCountdown(10); setReward(null); setActiveBreak(null); setRound(0); resetEphemeral();
  };

  const sumAvg = results.length ? results.reduce((a, b) => a + b, 0) / results.length : 0;
  const fullStars = Math.round(sumAvg);
  const starStr = (n: number) => '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n);

  // --------------------------------------------------------------------------
  return (
    <View style={s.flex}>
      {/* ===== Cabecera turquesa unificada ===== */}
      <View style={s.header}>
        {/* <Image source={logoWhite} style={s.logo} /> */}
        <Pressable onPress={() => { clearInterval(timerRef.current); navigation.goBack(); }} style={s.backPill}><Text style={s.backPillTxt}>{`‹ ${t.common.back}`}</Text></Pressable>
        <Text style={s.logoFallback}>valeria+</Text>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{finished ? t.player.headerDone : t.player.headerPlaying}</Text>
            <Text style={s.headerSub} numberOfLines={1}>
              {patientName ? `${patientName} · ` : ''}{total === 1 ? ex.name : `Plan prescrito · ${total} terapias`}
            </Text>
          </View>
          <View style={s.counter}>
            <Text style={s.counterTxt}>{finished ? `${total} / ${total}` : `${idx + 1} / ${total}`}</Text>
          </View>
        </View>
        <View style={s.dots}>
          {sessionIds.map((_, i) => {
            const done = i < idx || finished;
            const cur = i === idx && !finished;
            return <View key={i} style={[s.dot, { backgroundColor: done ? '#fff' : cur ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.32)' }]} />;
          })}
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!finished ? (
          <>
            {/* Meta del ejercicio */}
            <View style={s.metaRow}>
              <View style={s.codeChip}><Text style={s.codeChipTxt}>{ex.code}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.metaName}>{ex.name}</Text>
                <Text style={s.metaCat}>{ex.category}</Text>
              </View>
              {!!ex.age && !curLevel && (
                <View style={s.levelBadge}>
                  <BlockIcon name="age" color={V.color.primaryDark} size={14} />
                  <Text style={s.levelBadgeTxt}>{ex.age}</Text>
                </View>
              )}
              {curLevel && (
                <View style={s.levelBadge}>
                  <Text style={s.levelBadgeTxt}>{curLevel.label} · {subIdx + 1}/{ex.levels!.length}</Text>
                </View>
              )}
            </View>

            {/* Material real necesario: se anuncia ANTES de empezar la actividad */}
            {!!ex.materials && (
              <View style={s.materialsCard}>
                <BlockIcon name="material" color={V.color.primaryDark} size={20} />
                <View style={{ flex: 1 }}>
                  <Text style={s.materialsKicker}>{t.player.materialsKicker}</Text>
                  <Text style={s.materialsTxt}>{ex.materials}</Text>
                </View>
              </View>
            )}

            {/* Otras formas de hacer la MISMA actividad. Repetida siempre igual,
                el niño anticipa la respuesta y la ejecuta de forma mecánica
                (ACOPROS): con esto el adulto puede alternar entre sesiones sin
                cambiar de ejercicio ni de objetivo. */}
            {!!ex.proposals?.length && (
              <View style={s.proposalsCard}>
                <Text style={s.proposalsKicker}>{t.player.proposalsKicker}</Text>
                {ex.proposals.map((p) => (
                  <View key={p} style={s.proposalRow}>
                    <Text style={s.proposalDot}>·</Text>
                    <Text style={s.proposalTxt}>{p}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Consigna del tutor */}
            <View style={s.instructionCard}>
              <View style={s.instructionHead}>
                <View style={s.instructionIcon}><BlockIcon name="speaker" color="#ffffff" size={20} /></View>
                {/* flex:1: sin él, el subtítulo largo se salía de la tarjeta */}
                <View style={{ flex: 1 }}>
                  <Text style={s.instructionKicker}>{t.player.step1Kicker}</Text>
                  <Text style={s.instructionSmall}>{t.player.step1Small}</Text>
                </View>
              </View>
              <Text style={s.instructionText}>{curLevel ? curLevel.read : ex.read}</Text>
              <View style={{ marginTop: 12 }}>
                <SpeakButton text={curLevel ? curLevel.read : ex.read} label={t.player.listenPrompt} />
              </View>
            </View>

            {/* ===== Stage / mini-juego ===== */}
            <View style={s.stageCard}>
              <Text style={s.stageLabel}>{t.player.step2(curLevel ? t.player.levelLabel(curLevel.label) : (ex.stageLabel ?? t.player.guidedActivity).toUpperCase())}</Text>

              {/* Selector de ronda: contenido nuevo sin salir del ejercicio */}
              {!curLevel && totalRounds > 1 && (
                <View style={s.roundRow}>
                  <Text style={s.roundLbl}>Ronda {(round % totalRounds) + 1} de {totalRounds}</Text>
                  <Pressable onPress={nextRound} style={s.roundBtn} accessibilityRole="button" accessibilityLabel={t.player.newRoundA11y}>
                    <BlockIcon name="repeat" color={V.color.primaryDark} size={15} />
                    <Text style={s.roundBtnTxt}>{t.player.newRound}</Text>
                  </Pressable>
                </View>
              )}

              {curLevel && (
                <View style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Pressable onPress={() => openZoom(curLevel.instrIcon, ex.name)} accessibilityRole="imagebutton" accessibilityLabel={t.player.zoomIconA11y}>
                    <View style={s.instrHero}><Text style={{ fontSize: 54 }}>{curLevel.instrIcon}</Text></View>
                  </Pressable>
                  <Text style={s.instrHint}>{curLevel.instrHint}</Text>
                </View>
              )}

              {!curLevel && ex.stage === 'phrase' && (
                <>
                  <View style={s.phraseBox}>
                    {!!ex.phraseEmoji && (
                      <EmojiTile emoji={ex.phraseEmoji} cap={ex.phrase?.toLowerCase()} size={92} bgIndex={1} onZoom={openZoom} />
                    )}
                    <Text style={s.phraseTxt}>“{ex.phrase}”</Text>
                    <SpeakButton text={ex.phrase!} label={t.player.hearWordSlow} voice="slow" />
                  </View>
                  {/* Con pérdida auditiva la voz sintética cuesta de imitar: el
                      modelo principal debe ser la voz en vivo del adulto. */}
                  <View style={s.modelNoteRow}>
                    <BlockIcon name="tip" color={V.color.textSecondary} size={16} />
                    <Text style={[s.modelNote, { flex: 1, marginTop: 0 }]}>{t.player.modelNote}</Text>
                  </View>
                  <MicPracticeCard target={ex.phrase!} />
                  {/* DX-4 · Criba: límite RÍGIDO de ensayos juzgados por el
                      adulto; al alcanzarlo se intercala una cápsula TPR de
                      descarga (fatiga cognitiva controlada). */}
                  {!!ex.maxTrials && (
                    <View style={s.trialCard}>
                      <Text style={s.trialKicker}>{t.player.trialKicker(Math.min(trials + 1, ex.maxTrials), ex.maxTrials)}</Text>
                      <Text style={s.trialHint}>{t.player.trialHint}</Text>
                      <View style={s.trialDots}>
                        {Array.from({ length: ex.maxTrials }).map((_, i) => (
                          <View key={i} style={[s.trialDot, i < trials && s.trialDotOn]} />
                        ))}
                      </View>
                      {judgeButtons(trials >= ex.maxTrials, judgeTrial)}
                      {trials >= ex.maxTrials && (
                        <Text style={s.trialLimit}>Límite de {ex.maxTrials} ensayos alcanzado: descargad con la pausa de movimiento y evalúa abajo (o cambia de ronda).</Text>
                      )}
                    </View>
                  )}
                </>
              )}

              {/* FF-1 · unir de verdad en la tablet cada imagen con su vocal:
                  1) toca la imagen (la app la nombra) · 2) toca su vocal. */}
              {ex.stage === 'vowels' && (
                <>
                  <Text style={s.stageHint}>{t.player.vowelHint}</Text>
                  <View style={s.tilesRow}>
                    {ex.tiles!.map((t, i) => {
                      const done = !!matchOk[i];
                      const sel = matchSel === i;
                      return (
                        <Pressable
                          key={i}
                          // Ficha interior plana: el Pressable de zoom anidado
                          // robaba el toque y el juego "no funcionaba".
                          onPress={() => tapMatchTile(i)}
                          onLongPress={() => openZoom(t.emoji, t.cap)}
                          accessibilityRole="button"
                          accessibilityLabel={done ? `${t.cap}: ya unida con su vocal` : `Elegir la imagen de ${t.cap}`}
                          style={[s.matchTile, sel && s.matchTileSel, done && s.matchTileOk]}
                        >
                          <EmojiTile emoji={t.emoji} cap={t.cap} size={78} bgIndex={i} />
                          <Text style={s.tileCap}>{t.cap}</Text>
                          <View style={s.matchTileMarkRow}>
                {done ? <BlockIcon name="check" color={V.color.success} size={14} />
                  : sel ? <BlockIcon name="gesture" color={V.color.primaryDark} size={14} /> : null}
                <Text style={s.matchTileMark}>{done ? initialVowel(t.cap) : sel ? 'elegida' : ' '}</Text>
              </View>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={s.vowelRow}>
                    {VOWELS.map((v) => {
                      const used = ex.tiles!.some((t, i) => matchOk[i] && initialVowel(t.cap) === v);
                      const wrong = wrongVowel === v;
                      return (
                        <Pressable
                          key={v}
                          onPress={() => tapMatchVowel(v)}
                          accessibilityRole="button"
                          accessibilityLabel={`Vocal ${v}`}
                          style={[s.vowel, used && s.vowelRight, wrong && s.vowelWrong]}
                        >
                          <Text style={[s.vowelTxt, used && { color: '#fff' }, wrong && { color: V.color.error }]}>{v}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {matchOk.filter(Boolean).length === ex.tiles!.length && (
                    <Text style={s.matchDone}>{t.player.allMatched}</Text>
                  )}
                  <View style={{ alignItems: 'center', marginTop: 12 }}>
                    <SpeakButton text={ex.tiles!.map((t) => t.cap).join(', ')} label={t.player.hearAllNames} voice="slow" />
                  </View>
                </>
              )}

              {ex.stage === 'fill' && (
                <>
                  {!!ex.fillEmoji && (
                    <View style={{ alignItems: 'center', marginBottom: 12 }}>
                      <EmojiTile emoji={ex.fillEmoji} cap={ex.fillCap} size={86} bgIndex={5} onZoom={openZoom} />
                    </View>
                  )}
                  {/* Primero se OYE la palabra completa; después se completa. */}
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <SpeakButton text={ex.fillCap!} label={t.player.hearFullWord} voice="slow" />
                  </View>
                  <View style={s.fillRow}>
                    <Text style={s.fillBig}>{ex.fillBefore}</Text>
                    <View style={[s.fillSlot, fillPick ? (fillPick === ex.fillAnswer ? s.fillSlotOk : s.fillSlotBad) : s.fillSlotEmpty]}>
                      <Text style={[s.fillSlotTxt, { color: fillPick ? (fillPick === ex.fillAnswer ? '#fff' : V.color.error) : '#c2cbca' }]}>{fillPick || '?'}</Text>
                    </View>
                    <Text style={s.fillBig}>{ex.fillAfter}</Text>
                  </View>
                  <View style={s.vowelRow}>
                    {VOWELS.map((v) => (
                      <Pressable
                        key={v}
                        onPress={() => { if (fillPick !== v) { setFillPick(v); speakVerdict(v === ex.fillAnswer); } }}
                        style={[s.vowel, fillPick === v && (v === ex.fillAnswer ? s.vowelRight : s.vowelOn)]}
                      >
                        <Text style={[s.vowelTxt, fillPick === v && s.vowelTxtOn]}>{v}</Text>
                      </Pressable>
                    ))}
                  </View>
                  {!!ex.fillCap && (
                    <MicPracticeCard
                      target={ex.fillCap}
                      prompt={`Cuando complete la palabra, pulsa el micro y que diga: “${ex.fillCap}”`}
                    />
                  )}
                </>
              )}

              {ex.stage === 'intruder' && !ex.auditoryOnly && (
                <>
                  {/* Apoyo auditivo pedido por los evaluadores: oír las palabras
                      que aparecen antes de buscar el intruso. */}
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <SpeakButton text={ex.intruder!.map((t) => t.cap).join(', ')} label={t.player.hearWords} voice="slow" />
                  </View>
                  <AnswerTileGrid
                    tiles={ex.intruder!}
                    answer={ex.intruderAnswer!}
                    picked={intruderPick}
                    revealAnswer
                    onZoom={openZoom}
                    // Nombra la ficha tocada antes del refuerzo: asociación
                    // palabra-imagen directa (mismo patrón que en emociones).
                    onPick={(i, isAns) => {
                      setIntruderPick(i);
                      speakToChildSeq([ex.intruder![i].cap, isAns ? praisePhrase() : almostPhrase()]);
                    }}
                  />
                </>
              )}

              {/* DX-1 · Intruso Fonológico AUDITIVO PURO: sin apoyo textual. El
                  niño escucha la serie y responde por posición; la palabra de
                  cada ficha solo se revela DESPUÉS de responder.
                  Los testers leían ese diseño como un fallo de pintado ("no se
                  ve nada en las tarjetas y al tocar una aparecen todas"): las
                  cuatro fichas salían idénticas —mismo 🔊, sin nada que las
                  distinguiera— y la revelación simultánea parecía un glitch.
                  Ahora cada ficha lleva SIEMPRE su número bien visible (nunca
                  está vacía) y la revelación se anuncia como lo que es: la
                  solución de la serie, ya respondida. El protocolo no cambia:
                  sigue sin haber apoyo textual antes de responder. */}
              {ex.stage === 'intruder' && ex.auditoryOnly && (
                <>
                  <Text style={s.stageHint}>{t.player.intruderHint}</Text>
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <SpeakButton text={ex.intruder!.map((t) => t.cap).join(', ')} label={t.player.hearFullSeries} voice="slow" />
                  </View>
                  <Text style={s.audLegend}>
                    {intruderPick >= 0 ? t.player.seriesSolved : t.player.seriesHint}
                  </Text>
                  <View style={s.grid2}>
                    {ex.intruder!.map((t, i) => {
                      const tapped = intruderPick === i;
                      const isAns = i === ex.intruderAnswer;
                      const ok = intruderPick >= 0 && isAns;
                      const bad = tapped && !isAns;
                      const revealed = intruderPick >= 0;
                      return (
                        <Pressable
                          key={i}
                          onPress={() => {
                            if (intruderPick === i) return;
                            setIntruderPick(i);
                            speakToChildSeq([t.cap, isAns ? praisePhrase() : almostPhrase()]);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={revealed
                            ? `Palabra ${i + 1} de la serie: ${t.cap}`
                            : `Responder la palabra ${i + 1} de la serie`}
                          style={[s.gridTile, s.audTile, ok && s.gridTileOk, bad && s.gridTileBad]}
                        >
                          {/* Identidad estable de la ficha: el número está desde
                              el primer momento, antes y después de responder. */}
                          <View style={s.audNumBadge}><Text style={s.audNumTxt}>{i + 1}</Text></View>
                          <BlockIcon name="speaker" color={V.color.primaryDark} size={34} />
                          <View style={s.gridCapRow}>
                            <Text style={[s.gridCap, revealed && s.gridCapRevealed]}>
                              {revealed ? t.cap : `palabra ${i + 1}`}
                            </Text>
                            {ok ? <BlockIcon name="check" color={V.color.success} size={15} />
              : bad ? <BlockIcon name="cross" color={V.color.error} size={15} /> : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {/* DX-3 · Síntesis Fonémica Rítmica: la app emite los fonemas
                  AISLADOS con latencia forzada; la fusión la dice el niño
                  (micro con fallback a la botonera de Juez). */}
              {ex.stage === 'syn' && (
                <>
                  {!!ex.phraseEmoji && (
                    <View style={{ alignItems: 'center', marginBottom: 12 }}>
                      <EmojiTile emoji={ex.phraseEmoji} cap={ex.phrase?.toLowerCase()} size={92} bgIndex={2} onZoom={openZoom} />
                    </View>
                  )}
                  <Text style={s.stageHint}>{t.player.synthesisHint}</Text>
                  <View style={{ alignItems: 'center', marginBottom: 10 }}>
                    <Pressable onPress={playPhonemes} style={s.synBtn} accessibilityRole="button" accessibilityLabel={t.player.synthesisA11y}>
                      <BlockIcon name="speaker" color={V.color.primaryDark} size={16} />
                      <Text style={s.synBtnTxt}>Oír los sonidos · {ex.phonemes!.join(' … ')}</Text>
                    </Pressable>
                  </View>
                  <MicPracticeCard
                    target={ex.phrase!}
                    prompt={`Pulsa el micro y que UNA los sonidos en la palabra completa: “${ex.phrase!.toLowerCase()}”`}
                  />
                  {/* Fallback de Juez para hardware lento o STT caído. */}
                  <Text style={s.judgeHint}>{t.player.judgeHint}</Text>
                  {judgeButtons(false, (ok) => { setJudgePick(ok ? 'ok' : 'almost'); speakVerdict(ok); })}
                  {judgePick !== '' && (
                    <Text style={s.matchDone}>La palabra era “{ex.phrase!.toLowerCase()}”. Puedes pasar a otra ronda o evaluar abajo.</Text>
                  )}
                </>
              )}

              {/* DX-5 · Rastreo Visual de Rotaciones: grafías gemelas giradas
                  (b/d, p/q) en alto contraste. Los toques fuera de ficha los
                  captura ValeriaMisclickBoundary → mapa de calor X,Y. */}
              {ex.stage === 'rotation' && (() => {
                const rt = ex.rotationTargets!;
                const totalTargets = rt.grid.filter((g) => g === rt.target).length;
                const foundCount = rt.grid.reduce((n, g, i) => n + (g === rt.target && rotFound[i] ? 1 : 0), 0);
                const complete = foundCount === totalTargets;
                return (
                  <>
                    <View style={s.rotHead}>
                      <Text style={s.rotHeadLbl}>{t.player.findAllOf}</Text>
                      <View style={s.rotTargetBox}><Text style={s.rotTargetTxt}>{rt.target}</Text></View>
                      <Text style={s.rotHeadCount}>{foundCount} / {totalTargets}</Text>
                    </View>
                    <View style={s.rotGrid}>
                      {rt.grid.map((g, i) => {
                        const found = !!rotFound[i] && g === rt.target;
                        const wrong = rotWrongIdx === i;
                        return (
                          <Pressable
                            key={i}
                            onPress={() => tapRotation(i)}
                            disabled={found}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: found }}
                            accessibilityLabel={`Letra ${i + 1} de ${rt.grid.length}`}
                            style={[s.rotTile, found && s.rotTileOk, wrong && s.rotTileBad]}
                          >
                            <Text style={[s.rotTileTxt, found && { color: '#fff' }]}>{g}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {complete && (
                      <Text style={s.matchDone}>{t.player.allFound}</Text>
                    )}
                  </>
                );
              })()}

              {/* DX-6 · Denominación Rápida (RAN): nombrar y tocar cada dibujo
                  en orden de lectura. Sin cronómetro: el estresor temporal es
                  la persecución dactilar del ADULTO (analógica y reversible).
                  Los toques fuera de ficha van al mapa de misclicks. */}
              {ex.stage === 'ran' && (() => {
                const named = rotFound.filter(Boolean).length;
                const complete = named === ex.tiles!.length;
                return (
                  <>
                    <Text style={s.stageHint}>{t.player.orderHint}</Text>
                    <View style={s.rotHead}>
                      <Text style={s.rotHeadLbl}>{t.player.namedLabel}</Text>
                      <Text style={s.rotHeadCount}>{named} / {ex.tiles!.length}</Text>
                    </View>
                    <View style={s.rotGrid}>
                      {ex.tiles!.map((t, i) => {
                        const done = !!rotFound[i];
                        const isNext = i === named;
                        const wrong = rotWrongIdx === i;
                        return (
                          <Pressable
                            key={i}
                            onPress={() => tapRan(i)}
                            disabled={done}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: done }}
                            accessibilityLabel={`Dibujo ${i + 1} de ${ex.tiles!.length}`}
                            style={[s.rotTile, done && s.rotTileOk, wrong && s.rotTileBad, isNext && !done && s.ranTileNext]}
                          >
                            <Text style={{ fontSize: 30, opacity: done ? 0.45 : 1 }}>{t.emoji}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {complete && (
                      <Text style={s.matchDone}>{t.player.matrixDone}</Text>
                    )}
                    {named > 0 && !complete && (
                      <Pressable onPress={() => { setRotFound([]); setRotWrongIdx(-1); }} accessibilityRole="button">
                        <Text style={s.orderReset}>↺ Volver a empezar</Text>
                      </Pressable>
                    )}
                  </>
                );
              })()}

              {ex.stage === 'emotions' && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <Pressable onPress={() => openZoom(ex.emotionFace!, emoQuestion)} accessibilityRole="imagebutton" accessibilityLabel={t.player.zoomFaceA11y}>
                      <Text style={{ fontSize: 62 }}>{ex.emotionFace}</Text>
                    </Pressable>
                    <Text style={s.emoQ}>{emoQuestion}</Text>
                    {/* Apoyo auditivo: oír las opciones antes de elegir */}
                    <View style={{ marginTop: 10 }}>
                      <SpeakButton
                        text={emotionPromptFor(loc, emo)}
                        label={t.player.hearOptions}
                      />
                    </View>
                  </View>
                  <View style={s.grid2}>
                    {emo.map((e) => {
                      const pickedEmo = emotionPick === e.label;
                      const isAns = e.label === ex.emotionAnswer;
                      const ok = pickedEmo && isAns; const bad = pickedEmo && !isAns;
                      return (
                        <Pressable
                          key={e.label}
                          // Refuerzo inmediato: se nombra la emoción tocada y se
                          // celebra/anima en la misma locución, sin esperas.
                          onPress={() => { if (emotionPick !== e.label) { setEmotionPick(e.label); speakToChildSeq([e.label, isAns ? praisePhrase() : almostPhrase()]); } }}
                          style={[s.emoOpt, ok && s.gridTileOk, bad && s.gridTileBad]}
                        >
                          <Text style={{ fontSize: 24 }}>{e.face}</Text>
                          <Text style={s.emoLabel}>{e.label}</Text>
                          <View style={{ marginLeft: 'auto' }}>
                            {ok ? <BlockIcon name="check" color={V.color.success} size={16} />
                              : bad ? <BlockIcon name="cross" color={V.color.error} size={16} /> : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {/* SE-2 / MS-2 · escucha el audio y toca la imagen correcta */}
              {ex.stage === 'choice' && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 14 }}>
                    <SpeakButton
                      text={ex.choicePrompt!}
                      label={ex.choiceLabel ?? t.player.hearQuestion}
                      voice={ex.choiceVoice === 'slow' ? 'slow' : 'tutor'}
                    />
                  </View>

                  {/* SE-2 · la adivinanza también se puede LEER: hasta ahora solo
                      se podía oír, y el adulto que quería repetirla con sus
                      palabras tenía que reproducir el audio para saber qué decía. */}
                  {ex.promptDisplay === 'visible' && (
                    <View style={s.promptTextCard}>
                      <Text style={s.promptTextKicker}>{t.player.promptTextKicker}</Text>
                      <Text style={s.promptTextTxt}>«{ex.choicePrompt}»</Text>
                    </View>
                  )}

                  {/* RA-2 · el adulto tiene que decir la palabra SIN VOZ. Saberla
                      exigía reproducir el audio delante del niño, que es
                      exactamente lo que invalida la lectura labiofacial. */}
                  {ex.promptDisplay === 'adulto' && <AdultOnlyPrompt word={ex.choicePrompt!} />}
                  <AnswerTileGrid
                    tiles={ex.options!}
                    answer={ex.optionAnswer!}
                    picked={choicePick}
                    size={78}
                    center
                    tileStyle={{ width: '30%', minWidth: 96 }}
                    onZoom={openZoom}
                    // Nombra la opción tocada («niña. ¡Muy bien!»): refuerza la
                    // palabra objetivo justo al tocarla.
                    onPick={(i, isAns) => {
                      setChoicePick(i);
                      speakToChildSeq([ex.options![i].cap, isAns ? praisePhrase() : almostPhrase()]);
                    }}
                  />
                </>
              )}

              {/* MS-1 · apoyo visual real: tarjeta con UNO frente a tarjeta con MUCHOS */}
              {ex.stage === 'plural' && (
                <>
                  <View style={{ flexDirection: 'row', gap: 11 }}>
                    {([['one', 1], ['many', 3]] as const).map(([kind, n]) => {
                      const tapped = pluralPick === kind;
                      const isAns = kind === 'many';
                      const label = kind === 'one' ? pluralOneLabelFor(loc, ex.plural!) : pluralManyLabelFor(loc, ex.plural!);
                      return (
                        <Pressable
                          key={kind}
                          onPress={() => {
                            if (pluralPick !== kind) {
                              setPluralPick(kind);
                              speakToChildSeq([label, isAns ? praisePhrase() : pluralHintFor(loc)]);
                            }
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Tarjeta con ${label}`}
                          style={[s.pluralCard, tapped && isAns && s.gridTileOk, tapped && !isAns && s.gridTileBad]}
                        >
                          <Text style={{ fontSize: kind === 'one' ? 52 : 30, textAlign: 'center' }}>
                            {Array.from({ length: n }).map(() => ex.plural!.emoji).join(' ')}
                          </Text>
                          <Text style={s.pluralCap}>{label}</Text>
                          <View style={{ marginTop: 4, height: 16, justifyContent: 'center' }}>
                            {tapped ? (isAns ? <BlockIcon name="check" color={V.color.success} size={15} />
                              : <BlockIcon name="cross" color={V.color.error} size={15} />) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                  <MicPracticeCard
                    // es-DO: el plural se juzga por el determinante ("muchos
                    // gatos"), no por la -s final (que se elide). El resto de
                    // variedades acepta el sustantivo en plural.
                    target={ex.evalPluralByDeterminer && ex.pluralDeterminer
                      ? `${ex.pluralDeterminer} ${ex.plural!.capPlural}`
                      : ex.plural!.capPlural}
                    prompt={ex.evalPluralByDeterminer && ex.pluralDeterminer
                      ? `Pregúntale «¿cuántos hay?» y pulsa el micro para que diga: “${ex.pluralDeterminer} ${ex.plural!.capPlural}”`
                      : `Pregúntale «¿qué son?» y pulsa el micro para que diga: “${ex.plural!.capPlural}”`}
                  />
                </>
              )}

              {/* MS-3 · escucha la frase y ordénala tocando las fichas en pantalla */}
              {ex.stage === 'order' && (() => {
                const parts = ex.parts!;
                // Fichas desordenadas a propósito: rotación en una posición,
                // que nunca coincide con el orden correcto y vale para
                // cualquier número de fichas (no solo 3).
                const display = parts.map((_, k) => (k + 1) % parts.length);
                const complete = orderPicks.length === parts.length;
                const correct = complete && orderPicks.every((p, k) => p === k);
                // Roles S-V-O con pregunta natural; otros roles (p. ej. la
                // secuencia temporal de RA-4: Primero/Luego/Después) se
                // muestran tal cual.
                const question = (role: string) => t.player.roleQuestion(role);
                return (
                  <>
                    <View style={{ alignItems: 'center', marginBottom: 14 }}>
                      <SpeakButton text={ex.sentence!} label={t.player.hearSentence} voice="child" />
                    </View>
                    {/* Huecos donde va cayendo la frase en orden */}
                    <View style={s.orderSlots}>
                      {parts.map((p, i) => {
                        const pickedHere = orderPicks[i] != null ? parts[orderPicks[i]] : null;
                        return (
                          <View key={i} style={[s.orderSlot, pickedHere && s.orderSlotFilled]}>
                            <Text style={s.diceRole}>{question(p.role)}</Text>
                            <Text style={{ fontSize: 26 }}>{pickedHere ? pickedHere.emoji : '·'}</Text>
                            <Text style={s.tileCap}>{pickedHere ? pickedHere.cap : ' '}</Text>
                          </View>
                        );
                      })}
                    </View>
                    {/* Fichas desordenadas: tocarlas en orden construye la frase */}
                    <View style={s.diceRow}>
                      {display.map((i) => {
                        const used = orderPicks.includes(i);
                        return (
                          <Pressable
                            key={i}
                            onPress={() => tapOrderTile(i)}
                            onLongPress={() => openZoom(parts[i].emoji, parts[i].cap)}
                            disabled={used}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: used }}
                            accessibilityLabel={used ? `Ficha ${parts[i].cap}, ya colocada` : `Ficha ${parts[i].cap}`}
                            style={[{ flex: 1, alignItems: 'center' }, used && { opacity: 0.25 }]}
                          >
                            <EmojiTile emoji={parts[i].emoji} cap={parts[i].cap} size={82} bgIndex={i + 2} />
                            <Text style={s.tileCap}>{parts[i].cap}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    {correct && (
                      <View style={s.sentenceBox}><Text style={s.sentenceTxt}>{`“${ex.sentence}”`}</Text></View>
                    )}
                    {complete && !correct && (
                      <Text style={s.matchDone}>{t.player.sentenceRetry}</Text>
                    )}
                    {orderPicks.length > 0 && !complete && (
                      <Pressable onPress={() => setOrderPicks([])} accessibilityRole="button">
                        <Text style={s.orderReset}>↺ Volver a empezar</Text>
                      </Pressable>
                    )}
                  </>
                );
              })()}

              {!curLevel && ex.stage === 'instruction' && (
                <View style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <Pressable onPress={() => openZoom(ex.instrIcon!, ex.name)} accessibilityRole="imagebutton" accessibilityLabel="Ampliar el icono">
                    <View style={s.instrHero}><Text style={{ fontSize: 54 }}>{ex.instrIcon}</Text></View>
                  </Pressable>
                  <Text style={s.instrHint}>{ex.instrHint}</Text>
                  {/* Escenas tocables: apoyo visual + ejemplo hablado de cada
                      modo del juego (p. ej. PR-2: voz bajita / voz normal). */}
                  {!!ex.scenes && (
                    <View style={s.sceneRow}>
                      {ex.scenes.map((sc) => (
                        <Pressable
                          key={sc.label}
                          onPress={() => speakToChild(sc.say)}
                          accessibilityRole="button"
                          accessibilityLabel={`${sc.label}. Oír un ejemplo`}
                          style={s.sceneCard}
                        >
                          <Text style={{ fontSize: 34 }}>{sc.emoji}</Text>
                          <Text style={s.sceneLabel}>{sc.label}</Text>
                          <Text style={s.sceneHear}>{t.player.hearExample}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                  {/* TEA-1 · Sello Doble con instigación retardada: el botón
                      queda bloqueado el Time Delay y el ADULTO lo retiene
                      hasta contacto visual real. La app solo cuenta sellos. */}
                  {!!ex.timeDelaySec && (
                    <View style={s.selloCard}>
                      <Text style={s.selloKicker}>{t.player.selloKicker}</Text>
                      <Text style={s.selloHint}>
                        El botón se desbloquea tras {ex.timeDelaySec} segundos de espera. Púlsalo SOLO cuando
                        el niño te mire de verdad a ti (no al objeto); después se bloquea para el siguiente intento.
                      </Text>
                      <Pressable
                        disabled={selloCooldown > 0}
                        onPress={() => { setSelloCount((c) => c + 1); setSelloCooldown(ex.timeDelaySec!); speakToChild(praisePhrase()); }}
                        accessibilityRole="button"
                        accessibilityLabel={t.player.selloGiveA11y}
                        style={[s.selloBtn, selloCooldown > 0 && s.selloBtnLocked]}
                      >
                        <Text style={s.selloBtnTxt}>{selloCooldown > 0 ? t.player.selloWait(selloCooldown) : t.player.selloGive}</Text>
                      </Pressable>
                      {selloCount > 0 && (
                        <Text style={s.selloCountTxt}>{t.player.selloCount('⭐'.repeat(Math.min(selloCount, 10)), selloCount)}</Text>
                      )}
                    </View>
                  )}
                  {/* TEA-4 · Transición Interrumpida: cápsula TPR abrupta a
                      mitad de flujo, SIEMPRE accionada por el adulto. */}
                  {!!ex.manualBreak && (
                    <Pressable
                      onPress={() => setActiveBreak(pickSessionBreak())}
                      accessibilityRole="button"
                      accessibilityLabel={t.player.breakNowA11y}
                      style={s.breakBtn}
                    >
                      <Text style={s.breakBtnTxt}>{t.player.breakNow}</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {/* Registro de respuesta libre (voz o escrito) y práctica de micro
                  dirigida: pedidos por los evaluadores en pragmática. */}
              {!curLevel && !!ex.capture && (
                <ResponseCaptureCard
                  // key por ejercicio: sin ella React reutiliza la misma tarjeta
                  // entre PR-1 y PR-2 y la respuesta anterior quedaba a la vista.
                  key={ex.code}
                  prompt={ex.capture}
                  onCapture={(t) => {
                    const clean = t.trim();
                    if (clean) capturesRef.current[ex.code] = { name: ex.name, text: clean };
                    else delete capturesRef.current[ex.code];
                  }}
                />
              )}
              {!curLevel && !!ex.micTarget && <MicPracticeCard target={ex.micTarget} prompt={ex.micPrompt} altTargets={ex.micAlt} />}

              <View style={s.zoomTipRow}>
                <BlockIcon name="zoom" color={V.color.textSecondary} size={13} />
                <Text style={s.zoomTip}>{t.player.zoomTip}</Text>
              </View>
            </View>

            {/* Versión en movimiento */}
            <View style={s.moveCard}>
              <View style={s.moveHead}>
                <View style={s.moveIcon}><BlockIcon name="move" color={V.color.primaryDark} size={19} /></View>
                <Text style={s.moveKicker}>{t.player.step3Kicker}</Text>
                <View style={{ marginLeft: 'auto' }}>
                  <SpeakButton text={ex.move} voice="child" compact />
                </View>
              </View>
              <Text style={s.moveTxt}>{ex.move}</Text>
            </View>

            {/* Espera */}
            <View style={s.waitRow}>
              <BlockIcon name="hearing" color={V.color.primaryDark} size={16} />
              <Text style={s.waitTxt}>{t.player.waitTxt}</Text>
            </View>

            {/* ===== Evaluación EPT-3 ===== */}
            <View style={s.scoreCard}>
              <Text style={s.scoreKicker}>{t.player.step4Kicker}</Text>
              <Text style={s.scoreTitle}>{t.player.scoreTitle}</Text>
              <Text style={s.scoreSub}>
                {totalRounds > 1 && !curLevel ? t.player.scoreSubRounds : t.player.scoreSub}
              </Text>
              {/* Explicación en lenguaje llano de la escala (los evaluadores
                  señalaron que "EPT-3" no se explica fuera del manual). */}
              <Pressable
                onPress={() => setEptInfoOpen((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={t.player.eptToggleA11y}
                style={s.eptInfoBtn}
              >
                <BlockIcon name="info" color={V.color.primaryDark} size={15} />
                <Text style={s.eptInfoBtnTxt}>{t.player.eptToggle}</Text>
              </Pressable>
              {eptInfoOpen && (
                <View style={s.eptInfoBox}>
                  <Text style={s.eptInfoTxt}>{t.player.eptExplain}</Text>
                </View>
              )}
              {[1, 2, 3].map((val) => {
                const on = picked === val;
                return (
                  <Pressable key={val} onPress={() => pick(val)} style={[s.scoreRow, on && s.scoreRowOn]}>
                    <View style={s.scoreStarsCol}>
                      <Text style={[s.scoreStars, { color: on ? V.color.star : '#dfe5e4' }]}>{starStr(val)}</Text>
                      <Text style={[s.scoreNum, { color: on ? '#92711a' : '#c2cbca' }]}>{val}★</Text>
                    </View>
                    <Text style={[s.scoreText, { color: on ? V.color.textPrimary : V.color.textSecondary }]}>{ex.ept[val - 1]}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Anticipación de la transición (ACOPROS, sobre M-6): al puntuar se
                pasa al ejercicio siguiente de golpe, y el cambio sin avisar es
                justo lo que descoloca a los niños que peor llevan las
                transiciones. Se enseña qué viene ANTES de tocar la puntuación,
                para que el adulto pueda anunciarlo. Vale para toda la sesión, no
                solo para M-6: es el mismo problema en cualquier bloque. */}
            {!!nextEx && (
              <View style={s.nextUpCard}>
                <BlockIcon name="next" color={V.color.primaryDark} size={18} />
                <View style={{ flex: 1 }}>
                  <Text style={s.nextUpKicker}>{t.player.nextUpKicker}</Text>
                  <Text style={s.nextUpTxt}>{nextEx.code} · {nextEx.name}</Text>
                </View>
              </View>
            )}

            {/* ===== Panel del adulto · caos comunicativo (Fase 2) ===== */}
            <ValeriaAdultChaosPanel
              distractorOn={distractorOn}
              onDistractorChange={setDistractorOn}
              onLaunchPragmatic={() => setPragmaticOpen(true)}
            />
          </>
        ) : (
          /* ===== Completado ===== */
          <View style={s.doneCard}>
            {/* La gata, no un 🎉 del sistema: quien celebra es la mascota que
                el niño reconoce, y es la misma que da los premios de abajo. */}
            <View style={s.doneIcon}><CatPixel size={62} /></View>
            <Text style={s.doneTitle}>{t.player.doneTitle}</Text>
            <Text style={s.doneSub}>
              {total === 1
                ? 'Has evaluado este ejercicio. El resultado se ha guardado en el dispositivo.'
                : `Has evaluado las ${total} actividades del plan. El resultado se guardó en el dispositivo.`}
            </Text>

            {/* Recompensas estilo Duolingo */}
            {reward && (
              <View style={s.rewardBox}>
                <View style={s.rewardRow}>
                  <View style={s.rewardChip}>
                    <Text style={s.rewardChipBig}>+{reward.xpGained}</Text>
                    <Text style={s.rewardChipLbl}>XP</Text>
                  </View>
                  <View style={[s.rewardChip, { backgroundColor: '#fff4e5' }]}>
                    <View style={s.streakRow}>
                      <PixelAward glyph="flame" tier={streakTier(reward.streak)} size={22} />
                      <Text style={s.rewardChipBig}>{reward.streak}</Text>
                    </View>
                    <Text style={s.rewardChipLbl}>{t.player.streakChip(reward.streak)}</Text>
                  </View>
                </View>
                {reward.streakExtended && reward.streak > 1 && (
                  <Text style={s.rewardNote}>{t.player.streakExtended}</Text>
                )}
                <View style={s.levelRow}>
                  <Text style={s.levelLbl}>{t.player.levelChip(reward.level, t.hub.levelNameByIndex(reward.level - 1), reward.levelUp)}</Text>
                  <View style={s.levelTrack}>
                    <View style={[s.levelFill, { width: `${Math.round(levelProgress(reward.xpTotal) * 100)}%` }]} />
                  </View>
                  <Text style={s.levelToGo}>{t.player.xpToNext(xpToNext(reward.xpTotal))}</Text>
                </View>
                {reward.newBadges.length > 0 && (
                  <View style={s.badgeWrap}>
                    <Text style={s.badgeTitle}>{t.player.badgesTitle}</Text>
                    {reward.newBadges.map((b) => (
                      <View key={b.id} style={s.badgeRow}>
                        <View style={[s.badgePlate, { backgroundColor: tierBg(b.tier) }]}>
                          <PixelAward glyph={b.glyph} tier={b.tier} size={26} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={s.badgeName}>{t.awards.badgeName(b.id)}</Text>
                          <Text style={s.badgeDesc}>{t.awards.badgeDesc(b.id)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={s.doneStatBox}>
              <Text style={s.doneStatKicker}>{t.player.doneStatKicker}</Text>
              <Text style={s.doneStatBig}>{sumAvg.toFixed(1)}<Text style={s.doneStatSlash}> / 3</Text></Text>
              <Text style={s.doneStatStars}>{starStr(fullStars)}</Text>
              <View style={s.recapRow}>
                {results.map((v, i) => (
                  <View key={i} style={s.recapCell}>
                    <Text style={s.recapCode}>{db[sessionIds[i]].code}</Text>
                    <Text style={s.recapStars}>{'★'.repeat(v)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Pressable onPress={() => { clearInterval(timerRef.current); navigation.navigate('Results'); }} style={s.primaryBtn}>
              <Text style={s.primaryBtnTxt}>{t.player.seeResults}</Text>
            </Pressable>
            <Pressable onPress={restart}><Text style={s.linkBtn}>{t.player.repeatSession}</Text></Pressable>
            <Text style={s.redirect}>{t.player.redirecting(countdown)}</Text>
          </View>
        )}
      </ScrollView>

      {/* Confeti al completar */}
      {finished && <ConfettiBurst />}

      {/* ===== Zoom de imagen ===== */}
      <ZoomModal emoji={zoom?.emoji ?? ''} cap={zoom?.cap ?? ''} visible={!!zoom} onClose={() => setZoom(null)} />

      {/* ===== Distractor periférico (doble tarea): solo si el adulto lo activó ===== */}
      {distractorOn && !finished && <ValeriaDistractorCat />}

      {/* ===== Pausa activa entre ejercicios: cápsula TPR o Ruta de Rutina ===== */}
      {activeBreak && !finished && (
        <ValeriaSessionBreakOverlay
          brk={activeBreak}
          onDone={() => setActiveBreak(null)}
          onSkip={() => setActiveBreak(null)}
        />
      )}

      {/* ===== Quiebre pragmático lanzado desde el panel del adulto ===== */}
      {pragmaticOpen && <ValeriaPragmaticBreakOverlay onClose={() => setPragmaticOpen(false)} />}
    </View>
  );
};

// ----------------------------------------------------------------------------
const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 16, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  logo: { height: 21, width: 84, resizeMode: 'contain', marginBottom: 8 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 6 },
  backPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10 },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  counter: { backgroundColor: 'rgba(255,255,255,.18)', borderColor: 'rgba(255,255,255,.35)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 7 },
  counterTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dots: { flexDirection: 'row', gap: 6, marginTop: 14 },
  dot: { flex: 1, height: 7, borderRadius: 4 },

  scroll: { padding: 16, paddingBottom: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12, marginHorizontal: 2 },
  codeChip: { backgroundColor: V.color.primaryLight, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 },
  codeChipTxt: { color: V.color.primaryDark, fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  metaName: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary },
  metaCat: { fontSize: 11.5, fontWeight: '700', color: V.color.textMuted },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: V.color.primaryLight, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 },
  levelBadgeTxt: { color: V.color.primaryDark, fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },

  materialsCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fffbeb', borderColor: '#f4e6b8', borderWidth: 1.5, borderRadius: 16, padding: 13, marginBottom: 12 },
  materialsKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: '#92711a' },
  materialsTxt: { fontSize: 13, fontWeight: '700', color: '#7c4a0e', marginTop: 3, lineHeight: 18 },

  nextUpCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: V.color.pageBg, borderColor: V.color.border, borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 12 },
  nextUpKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: V.color.textMuted },
  nextUpTxt: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary, marginTop: 3 },

  proposalsCard: { backgroundColor: '#f5f0ff', borderColor: '#ddccfa', borderWidth: 1.5, borderRadius: 16, padding: 13, marginBottom: 12 },
  proposalsKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, color: '#6d3fc4', marginBottom: 7 },
  proposalRow: { flexDirection: 'row', gap: 7, marginTop: 4 },
  proposalDot: { fontSize: 13, fontWeight: '800', color: '#7c4fd0', lineHeight: 18 },
  proposalTxt: { flex: 1, fontSize: 12.5, fontWeight: '600', color: V.color.textSecondary, lineHeight: 18 },

  promptTextCard: { backgroundColor: V.color.pageBg, borderColor: V.color.border, borderWidth: 1, borderRadius: 13, padding: 11, marginBottom: 12 },
  promptTextKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: V.color.textMuted },
  promptTextTxt: { fontSize: 14.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 4, lineHeight: 21 },

  adultOnlyCard: { backgroundColor: '#fff', borderColor: V.color.border, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 13, padding: 11, marginBottom: 12 },
  adultOnlyHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  adultOnlyKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: V.color.textMuted },
  adultOnlySub: { fontSize: 11.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 2, lineHeight: 16 },
  adultOnlyWord: { fontSize: 26, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center', marginTop: 10, letterSpacing: 1 },

  instructionCard: { backgroundColor: V.color.primaryTint, borderColor: '#b8eee9', borderWidth: 1.5, borderRadius: 18, padding: 16, ...V.shadow.card },
  instructionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  instructionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  instructionKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  instructionSmall: { fontSize: 12.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 1 },
  instructionText: { marginTop: 13, fontSize: 14.5, fontWeight: '700', color: V.color.textPrimary, lineHeight: 20 },

  stageCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
  stageLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: V.color.textMuted, textAlign: 'center', marginBottom: 14 },
  roundRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1', borderRadius: 12, paddingVertical: 7, paddingHorizontal: 11, marginBottom: 14 },
  roundLbl: { fontSize: 12, fontWeight: '800', color: V.color.textSecondary },
  roundBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  roundBtnTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  phraseBox: { backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#9bdfd9', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 22, paddingHorizontal: 16, alignItems: 'center', gap: 14 },
  phraseTxt: { fontSize: 32, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center', letterSpacing: -0.5 },

  // fichas emoji
  emojiTile: { borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e1e8e7', overflow: 'hidden' },
  zoomHintDot: { position: 'absolute', bottom: 4, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,.85)', alignItems: 'center', justifyContent: 'center' },
  zoomTipRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 13 },
  // textSecondary y no textMuted: gris claro sobre blanco no llega a AA.
  zoomTip: { textAlign: 'center', fontSize: 11, fontWeight: '700', color: V.color.textSecondary },

  tilesRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 16 },
  tileCap: { fontSize: 11, color: V.color.textMuted, marginTop: 5, fontWeight: '700' },
  vowelRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  vowel: { minWidth: 46, height: 48, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1' },
  vowelOn: { backgroundColor: V.color.primaryLight, borderColor: V.color.primaryLight },
  vowelRight: { backgroundColor: V.color.primary, borderColor: V.color.primary },
  vowelWrong: { backgroundColor: V.color.errorBg, borderColor: '#fecdd3' },
  vowelTxt: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary },
  vowelTxtOn: { color: V.color.primaryDark },

  // FF-1 · unir imagen ↔ vocal
  stageHint: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: V.color.textSecondary, marginBottom: 12, lineHeight: 17 },
  matchTile: { alignItems: 'center', borderRadius: 16, borderWidth: 2, borderColor: 'transparent', padding: 4 },
  matchTileSel: { borderColor: V.color.primary, backgroundColor: V.color.primaryTint },
  matchTileOk: { borderColor: V.color.success, backgroundColor: V.color.successBg },
  matchTileMarkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  matchTileMark: { fontSize: 11, fontWeight: '800', color: V.color.primaryDark, marginTop: 3, minHeight: 14 },
  matchDone: { textAlign: 'center', fontSize: 13, fontWeight: '800', color: '#0f8a63', marginTop: 12 },

  modelNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 10, paddingHorizontal: 4 },
  modelNote: { fontSize: 12, fontWeight: '700', color: V.color.textSecondary, lineHeight: 17 },

  // MS-1 · uno / muchos
  pluralCard: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#eef3f3', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 8 },
  pluralCap: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary, marginTop: 8 },

  // MS-3 · huecos de la frase ordenada
  orderSlots: { flexDirection: 'row', gap: 9, justifyContent: 'center', marginBottom: 14 },
  orderSlot: { flex: 1, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: '#b8eee9', borderRadius: 14, paddingVertical: 9 },
  orderSlotFilled: { borderStyle: 'solid', borderColor: V.color.success, backgroundColor: V.color.successBg },
  orderReset: { textAlign: 'center', fontSize: 12.5, fontWeight: '800', color: V.color.primaryDark, marginTop: 12 },

  // DX-1 · intruso auditivo puro (fichas de altavoz por posición)
  audTile: { alignItems: 'center', paddingVertical: 16 },
  // Leyenda que explica por qué las fichas no llevan dibujo y avisa de cuándo
  // se revelan las palabras (se leía como un fallo de pintado).
  audLegend: { textAlign: 'center', fontSize: 11.5, fontWeight: '700', color: V.color.textMuted, lineHeight: 16, marginBottom: 12, paddingHorizontal: 6 },
  audNumBadge: { minWidth: 26, height: 26, borderRadius: 13, backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  audNumTxt: { fontSize: 13, fontWeight: '800', color: V.color.primaryDark },
  gridCapRevealed: { color: V.color.textPrimary, fontWeight: '800' },

  // DX-3 · síntesis fonémica
  synBtn: { backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 10 },
  synBtnTxt: { fontSize: 13.5, fontWeight: '800', color: V.color.primaryDark },

  // Botonera de Juez (DX-3 / DX-4)
  judgeHint: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: V.color.textSecondary, marginTop: 12, marginBottom: 8 },
  judgeRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  judgeBtn: { flex: 1, maxWidth: 160, alignItems: 'center', borderRadius: 13, paddingVertical: 12, borderWidth: 1.5 },
  judgeBtnOk: { backgroundColor: V.color.successBg, borderColor: V.color.success },
  judgeBtnAlmost: { backgroundColor: '#fffbeb', borderColor: '#f4e6b8' },
  judgeBtnTxt: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },

  // DX-4 · contador de ensayos con límite rígido
  trialCard: { marginTop: 12, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1', borderRadius: 14, padding: 13 },
  trialKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.textMuted, textAlign: 'center' },
  trialHint: { fontSize: 12, fontWeight: '600', color: V.color.textSecondary, textAlign: 'center', lineHeight: 17, marginTop: 6, marginBottom: 10 },
  trialDots: { flexDirection: 'row', gap: 7, justifyContent: 'center', marginBottom: 10 },
  trialDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#e1e8e7' },
  trialDotOn: { backgroundColor: V.color.primary },
  trialLimit: { textAlign: 'center', fontSize: 12, fontWeight: '800', color: '#9a5b13', marginTop: 10, lineHeight: 17 },

  // DX-5 · rejilla de rotaciones (alto contraste)
  rotHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 14 },
  rotHeadLbl: { fontSize: 12, fontWeight: '800', letterSpacing: 0.6, color: V.color.textMuted },
  rotTargetBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#0b1220', alignItems: 'center', justifyContent: 'center' },
  rotTargetTxt: { fontSize: 32, fontWeight: '800', color: '#fff' },
  rotHeadCount: { fontSize: 14, fontWeight: '800', color: V.color.primaryDark },
  rotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'center' },
  rotTile: { width: '22%', minWidth: 64, aspectRatio: 1, borderRadius: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: '#0b1220', alignItems: 'center', justifyContent: 'center' },
  rotTileOk: { backgroundColor: V.color.success, borderColor: V.color.success },
  rotTileBad: { backgroundColor: V.color.errorBg, borderColor: '#fecdd3' },
  // RAN (DX-6): resalte sutil del siguiente dibujo del renglón, para sostener
  // el orden de lectura sin convertir la ayuda en respuesta.
  ranTileNext: { borderColor: V.color.primary, borderWidth: 3 },
  rotTileTxt: { fontSize: 34, fontWeight: '800', color: '#0b1220' },

  // TEA-1 · Sello Doble (instigación retardada)
  selloCard: { alignSelf: 'stretch', marginTop: 14, backgroundColor: '#f0fdf9', borderWidth: 1.5, borderColor: '#b8eee9', borderRadius: 16, padding: 14 },
  selloKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark, textAlign: 'center' },
  selloHint: { fontSize: 12, fontWeight: '600', color: V.color.textSecondary, textAlign: 'center', lineHeight: 17, marginTop: 6, marginBottom: 11 },
  selloBtn: { alignSelf: 'center', backgroundColor: V.color.primary, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 13, ...V.shadow.button },
  selloBtnLocked: { backgroundColor: '#c2cbca' },
  selloBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  selloCountTxt: { textAlign: 'center', fontSize: 12.5, fontWeight: '800', color: '#0f8a63', marginTop: 10 },

  // TEA-4 · interrupción manual (cápsula sorpresa)
  breakBtn: { alignSelf: 'stretch', marginTop: 14, backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#fcd9a8', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  breakBtnTxt: { fontSize: 14, fontWeight: '800', color: '#9a5b13' },

  // Explicación EPT-3
  eptInfoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', marginBottom: 12, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 9, backgroundColor: V.color.primaryLight },
  eptInfoBtnTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  eptInfoBox: { backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1', borderRadius: 12, padding: 12, marginBottom: 12 },
  eptInfoTxt: { fontSize: 12.5, fontWeight: '600', color: V.color.textSecondary, lineHeight: 18 },

  fillRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  fillBig: { fontSize: 42, fontWeight: '800', letterSpacing: 6, color: V.color.textPrimary },
  fillSlot: { width: 46, height: 52, marginHorizontal: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fillSlotEmpty: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#b8eee9', borderStyle: 'dashed' },
  fillSlotOk: { backgroundColor: V.color.primary },
  fillSlotBad: { backgroundColor: V.color.errorBg, borderWidth: 2, borderColor: '#fecdd3' },
  fillSlotTxt: { fontSize: 34, fontWeight: '800' },

  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  gridTile: { width: '47%', backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#eef3f3', borderRadius: 14, padding: 9 },
  gridTileOk: { backgroundColor: V.color.successBg, borderColor: V.color.success },
  gridTileBad: { backgroundColor: V.color.errorBg, borderColor: '#fecdd3' },
  gridCapRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 7 },
  gridCap: { fontSize: 12, color: V.color.textSecondary, fontWeight: '700' },

  emoQ: { fontSize: 13, fontWeight: '700', color: V.color.textMuted, marginTop: 6 },
  emoOpt: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 12, paddingHorizontal: 13, borderRadius: 14, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1' },
  emoLabel: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },

  diceRow: { flexDirection: 'row', gap: 9, justifyContent: 'center', marginBottom: 14 },
  diceRole: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: V.color.primaryDark, marginBottom: 5 },
  sentenceBox: { backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 12, padding: 11, alignItems: 'center' },
  sentenceTxt: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary },

  instrBig: { width: 64, height: 64, borderRadius: 20, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  // Icono protagonista de las actividades guiadas: los testers veían el de
  // 64 px "poco llamativo" (p. ej. Atención Conjunta).
  instrHero: { width: 112, height: 112, borderRadius: 30, backgroundColor: V.color.primaryLight, borderWidth: 2, borderColor: V.color.borderActive, alignItems: 'center', justifyContent: 'center' },
  instrHint: { fontSize: 14, fontWeight: '700', color: V.color.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 12 },
  sceneRow: { flexDirection: 'row', gap: 11, marginTop: 14, alignSelf: 'stretch' },
  sceneCard: { flex: 1, alignItems: 'center', backgroundColor: V.color.pageBg, borderWidth: 1.5, borderColor: '#eef2f1', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 8 },
  sceneLabel: { fontSize: 12.5, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center', marginTop: 7, lineHeight: 17 },
  sceneHear: { fontSize: 11, fontWeight: '800', color: V.color.primaryDark, marginTop: 7 },

  // versión en movimiento
  moveCard: { backgroundColor: '#fff7ed', borderColor: '#fcd9a8', borderWidth: 1.5, borderRadius: 16, padding: 14, marginTop: 12 },
  moveHead: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  moveIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#f59e0b', alignItems: 'center', justifyContent: 'center' },
  moveKicker: { flex: 1, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#9a5b13' },
  moveTxt: { marginTop: 9, fontSize: 13.5, fontWeight: '700', color: '#7c4a0e', lineHeight: 19 },

  waitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 11 },
  waitTxt: { color: V.color.primaryDark, fontSize: 12.5, fontWeight: '700' },

  scoreCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
  scoreKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: V.color.textMuted, textAlign: 'center', marginBottom: 4 },
  scoreTitle: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center' },
  scoreSub: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, textAlign: 'center', marginTop: 2, marginBottom: 13 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, marginBottom: 9, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef3f3' },
  scoreRowOn: { backgroundColor: '#fffbeb', borderWidth: 1.5, borderColor: V.color.star },
  scoreStarsCol: { width: 48, alignItems: 'center', gap: 3 },
  scoreStars: { fontSize: 15, letterSpacing: 1 },
  scoreNum: { fontSize: 10, fontWeight: '800' },
  scoreText: { flex: 1, fontSize: 12.5, fontWeight: '700', lineHeight: 17 },

  doneCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 22, padding: 24, alignItems: 'center', ...V.shadow.card },
  doneIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary, marginTop: 16 },
  doneSub: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 18 },

  // recompensas
  rewardBox: { alignSelf: 'stretch', marginTop: 18, backgroundColor: '#f0fdf9', borderWidth: 1.5, borderColor: '#b8eee9', borderRadius: 18, padding: 16 },
  rewardRow: { flexDirection: 'row', gap: 10 },
  rewardChip: { flex: 1, backgroundColor: '#e6f9f8', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  rewardChipBig: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary },
  // textSecondary, no textMuted: es la etiqueta del premio y en gris claro
  // sobre blanco no llegaba al contraste mínimo AA.
  rewardChipLbl: { fontSize: 11, fontWeight: '700', color: V.color.textSecondary, marginTop: 2 },
  rewardNote: { textAlign: 'center', fontSize: 11.5, fontWeight: '700', color: '#9a5b13', marginTop: 10 },
  levelRow: { marginTop: 14 },
  levelLbl: { fontSize: 12.5, fontWeight: '800', color: V.color.textPrimary },
  levelTrack: { height: 10, backgroundColor: '#dcefed', borderRadius: 6, overflow: 'hidden', marginTop: 7 },
  levelFill: { height: '100%', backgroundColor: V.color.primary, borderRadius: 6 },
  levelToGo: { fontSize: 11, fontWeight: '700', color: V.color.textSecondary, marginTop: 5 },
  badgeWrap: { marginTop: 14, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#f4e6b8', borderRadius: 14, padding: 12 },
  badgeTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#92711a', textAlign: 'center', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  badgePlate: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeName: { fontSize: 13.5, fontWeight: '800', color: V.color.textPrimary },
  badgeDesc: { fontSize: 11.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 1 },

  doneStatBox: { alignSelf: 'stretch', marginTop: 16, backgroundColor: V.color.pageBg, borderRadius: 18, padding: 18, alignItems: 'center' },
  doneStatKicker: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: V.color.textMuted },
  doneStatBig: { fontSize: 42, fontWeight: '800', color: V.color.textPrimary, marginTop: 8 },
  doneStatSlash: { fontSize: 20, color: V.color.textMuted, fontWeight: '800' },
  doneStatStars: { fontSize: 22, letterSpacing: 3, color: V.color.star, marginTop: 8 },
  // flexWrap: la sesión completa puede traer 13 ejercicios y una sola fila los aplastaría
  recapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 16, alignSelf: 'stretch', justifyContent: 'center' },
  recapCell: { flexGrow: 1, flexBasis: '17%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef3f3', borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
  recapCode: { fontSize: 10, fontWeight: '800', color: '#c2cbca' },
  recapStars: { fontSize: 13, color: V.color.star, marginTop: 3 },
  primaryBtn: { alignSelf: 'stretch', marginTop: 20, backgroundColor: V.color.primary, borderRadius: 15, paddingVertical: 16, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  linkBtn: { marginTop: 11, color: V.color.primaryDark, fontSize: 13.5, fontWeight: '800' },
  redirect: { color: V.color.textMuted, fontSize: 11.5, marginTop: 14, fontWeight: '600' },

  // zoom
  zoomOverlay: { flex: 1, backgroundColor: 'rgba(11,18,32,.78)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  zoomCard: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 28, paddingVertical: 38, paddingHorizontal: 24, alignItems: 'center' },
  zoomEmoji: { fontSize: 130, lineHeight: 150 },
  zoomCap: { fontSize: 26, fontWeight: '800', color: V.color.textPrimary, marginTop: 14, textTransform: 'capitalize' },
  zoomClose: { fontSize: 12, fontWeight: '700', color: V.color.textMuted, marginTop: 16 },
});

export default ValeriaExercisePlayerScreen;

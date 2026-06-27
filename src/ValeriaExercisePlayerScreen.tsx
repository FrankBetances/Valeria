// ============================================================================
// Valeria+ · Player de Sesión de Terapia (V2.2)
// Flujo guiado tutor + niño: consigna real, mini-juego visual por tipo de
// ejercicio y evaluación con la escala clínica EPT-4 (1★ / 2★ / 3★).
// Stack: React Native + react-native-svg opcional. Persistencia: AsyncStorage.
//
// Navegación: navigation.navigate('ExercisePlayer', { id?: string })
//   · Con `id`  -> sesión de un solo ejercicio.
//   · Sin `id`  -> sesión por defecto (plan prescrito de ejemplo).
// ============================================================================
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, StyleSheet, Animated, Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
// import logoWhite from '../../assets/valeria-logo-white.png';

// ----------------------------------------------------------------------------
// Tipos
// ----------------------------------------------------------------------------
type Stage = 'phrase' | 'vowels' | 'fill' | 'intruder' | 'emotions' | 'dice' | 'instruction';

interface Exercise {
  code: string;
  name: string;
  category: string;
  read: string;            // consigna que lee el tutor en voz alta
  stage: Stage;
  stageLabel?: string;
  ept: [string, string, string]; // reglas EPT-4 (1★, 2★, 3★)
  // datos de mini-juego
  phrase?: string;
  tiles?: { cap: string }[];
  fillBefore?: string; fillAfter?: string; fillAnswer?: string;
  intruder?: { cap: string }[]; intruderAnswer?: number;
  emotionFace?: string; emotionAnswer?: string;
  parts?: { role: string; cap: string }[]; sentence?: string;
  instrIcon?: string; instrHint?: string;
}

// ----------------------------------------------------------------------------
// Base de datos de ejercicios (13 Audición + 7 Lenguaje) con reglas EPT-4
// ----------------------------------------------------------------------------
const DB: Record<string, Exercise> = {
  ff1: { code: 'FF-1', name: 'Asociación vocal inicial', category: 'Fonética-Fonología',
    read: 'Mira las imágenes. Di cómo se llama cada una y con qué vocal empieza.',
    stage: 'vowels', stageLabel: 'Asocia imagen y vocal inicial',
    tiles: [{ cap: 'araña' }, { cap: 'elefante' }, { cap: 'iglú' }],
    ept: ['No repite ni asocia la vocal inicial.', 'Acierta la vocal tras una pista visual o énfasis del tutor.', 'Nombra la imagen y asocia la vocal inicial de forma espontánea.'] },
  ff2: { code: 'FF-2', name: 'Articulación de vocales', category: 'Fonética-Fonología',
    read: 'Vamos a repetir esta palabra juntos, articulando bien cada vocal.',
    stage: 'phrase', stageLabel: 'Repite la palabra', phrase: 'ZAPATO',
    ept: ['No imita el sonido o realiza una aproximación muy lejana.', 'Imita la vocal aislada correctamente tras el modelo del adulto.', 'Produce la vocal y la palabra completa articulando con precisión.'] },
  ff3: { code: 'FF-3', name: 'Completar vocal faltante', category: 'Fonética-Fonología',
    read: 'A esta palabra le falta una vocal. ¿Cuál es? Tócala para completarla.',
    stage: 'fill', stageLabel: 'Completa la vocal que falta', fillBefore: 'S', fillAfter: 'L', fillAnswer: 'O',
    ept: ['No identifica la vocal que falta ni responde al estímulo.', 'Completa la palabra con énfasis o ayuda visual directa.', 'Identifica y selecciona la vocal faltante de forma autónoma.'] },
  se1: { code: 'SE-1', name: 'Detección del intruso', category: 'Semántica',
    read: 'Tres de estas cosas se pueden comer. Toca la que NO pertenece al grupo.',
    stage: 'intruder', stageLabel: 'Toca el intruso',
    intruder: [{ cap: 'manzana' }, { cap: 'plátano' }, { cap: 'uva' }, { cap: 'coche' }], intruderAnswer: 3,
    ept: ['No identifica el intruso ni entiende la relación categorial.', 'Encuentra el intruso tras una pregunta guía.', 'Señala el intruso y explica el porqué de forma autónoma.'] },
  se2: { code: 'SE-2', name: 'Adivinanza por letra', category: 'Semántica',
    read: 'Adivina: empieza por "P", es una fruta amarilla y alargada. ¿Qué es?',
    stage: 'instruction', instrIcon: '🔎', instrHint: 'Da pistas del fonema, la categoría y la función del objeto.',
    ept: ['No logra adivinar el objeto aun con múltiples pistas.', 'Identifica el objeto tras pistas fonológicas y semánticas.', 'Adivina el objeto con la primera descripción y el fonema.'] },
  se3: { code: 'SE-3', name: 'Prendas y órdenes', category: 'Semántica',
    read: 'Dile al muñeco qué ponerse: "Ponle el gorro y los zapatos".',
    stage: 'instruction', instrIcon: '🧥', instrHint: 'Pide al niño vestir o colocar accesorios siguiendo tu orden verbal.',
    ept: ['No asocia el vocabulario de las prendas ni ejecuta la orden.', 'Coloca la prenda tras una demostración del adulto.', 'Identifica la prenda y ejecuta la orden verbal compleja.'] },
  ms1: { code: 'MS-1', name: 'Singular / plural', category: 'Morfosintaxis',
    read: 'Aquí hay un gato y aquí hay muchos. ¿Cómo decimos cuando hay muchos?',
    stage: 'instruction', instrIcon: '🔢', instrHint: 'Trabaja la diferencia entre uno y muchos añadiendo el morfema de número.',
    ept: ['No diferencia singular de plural.', 'Produce el plural tras el modelo o preguntas del tutor.', 'Evoca el plural espontáneamente añadiendo el morfema (-s/-es).'] },
  ms2: { code: 'MS-2', name: 'Flexión de género', category: 'Morfosintaxis',
    read: 'Si es "gato", la niña es "gat-a". Vamos a cambiar el género de las palabras.',
    stage: 'instruction', instrIcon: '⚥', instrHint: 'Asocia la terminación masculina/femenina en nombres y adjetivos.',
    ept: ['No distingue el género gramatical o confunde la terminación.', 'Evoca el femenino con ayuda del morfema final ("gat-a").', 'Clasifica y evoca el género de forma autónoma.'] },
  ms3: { code: 'MS-3', name: 'Estructura S-V-O', category: 'Morfosintaxis',
    read: 'Usa los dados para construir una frase: ¿quién?, ¿qué hace?, ¿a qué?',
    stage: 'dice', stageLabel: 'Construye la oración',
    parts: [{ role: 'Sujeto', cap: 'niño' }, { role: 'Verbo', cap: 'come' }, { role: 'Objeto', cap: 'manzana' }], sentence: 'El niño come la manzana.',
    ept: ['Solo nombra elementos aislados sin estructurar la oración.', 'Estructura la frase S-V-O con ayuda del inicio provisto.', 'Produce la oración completa respetando concordancia y orden.'] },
  pr1: { code: 'PR-1', name: 'Preguntas tipo ¿qué?', category: 'Pragmática',
    read: 'Pregúntale cosas del entorno: "¿Qué es esto?", "¿Qué está haciendo?".',
    stage: 'instruction', instrIcon: '💬', instrHint: 'Fomenta que responda y que formule preguntas sencillas por sí mismo.',
    ept: ['No responde a la pregunta o ignora la interacción.', 'Responde adecuadamente tras un modelo de respuesta.', 'Responde con soltura y formula preguntas espontáneamente.'] },
  pr2: { code: 'PR-2', name: 'Adaptación del discurso', category: 'Pragmática',
    read: 'El peluche está dormido. Tenemos que hablar muy bajito para no despertarlo.',
    stage: 'instruction', instrIcon: '🤫', instrHint: 'Trabaja la modulación de la voz y el tono según el contexto del juego.',
    ept: ['No ajusta su volumen o tono de voz al contexto.', 'Ajusta el tono tras la indicación o recordatorio del adulto.', 'Adapta registro y volumen espontáneamente en el juego de rol.'] },
  pr3: { code: 'PR-3', name: 'Reconocimiento de emociones', category: 'Pragmática',
    read: 'Mira esta cara. ¿Cómo se siente? Toca la emoción correcta.',
    stage: 'emotions', stageLabel: 'Reconoce la emoción', emotionFace: '😀', emotionAnswer: 'Alegría',
    ept: ['No reconoce las expresiones ni asocia el vocabulario.', 'Identifica la emoción tras señalarle rasgos faciales clave.', 'Nombra la emoción y argumenta la causa de forma autónoma.'] },
  pr4: { code: 'PR-4', name: 'Petición de repetición', category: 'Pragmática',
    read: 'Si no entiendes algo, puedes pedir: "¿Qué?" o "¿Cómo?". Vamos a practicarlo.',
    stage: 'instruction', instrIcon: '🔁', instrHint: 'Enseña a solicitar aclaración ante un mensaje poco claro o inaudible.',
    ept: ['Se queda en silencio o abandona ante un mensaje confuso.', 'Pide repetición con la fórmula enseñada, tras indicación.', 'Pide clarificación de forma natural y espontánea.'] },
  atencion_conjunta: { code: 'M-1', name: 'Atención Conjunta', category: 'Mirar, burbujas y nombre',
    read: 'Llama al niño por su nombre y haz burbujas. Busca su mirada y el contacto visual.',
    stage: 'instruction', instrIcon: '👀', instrHint: 'Desarrolla contacto visual, seguimiento de la mirada y respuesta al nombre.',
    ept: ['Requiere instigación física para sostener la mirada brevemente.', 'Responde a su nombre tras múltiples llamados verbales.', 'Establece contacto visual espontáneo y sigue la mirada del tutor.'] },
  imitacion: { code: 'M-2', name: 'Imitación Motora/Verbal', category: 'Aplausos, tambor y sílabas',
    read: 'Haz un gesto (aplaudir, tocar el tambor) y anímale a imitarte. Ahora una sílaba: "pa-pa".',
    stage: 'instruction', instrIcon: '👏', instrHint: 'Imita gestos motores gruesos y vocalizaciones simples en espejo.',
    ept: ['No copia los gestos ni produce sonidos imitativos.', 'Imita gestos o sonidos aislados con guía del adulto.', 'Realiza imitaciones motoras y verbales en espejo inmediato.'] },
  comprension: { code: 'M-3', name: 'Comprensión Verbal', category: 'Órdenes, cuerpo y categorías',
    read: 'Dale una orden de un paso: "Dame la pelota". Pídele que señale partes del cuerpo.',
    stage: 'instruction', instrIcon: '🧠', instrHint: 'Comprende instrucciones de un paso e identifica partes del cuerpo y objetos.',
    ept: ['No obedece instrucciones ni señala elementos solicitados.', 'Ejecuta la orden con ayuda de gestos de señalamiento.', 'Comprende la instrucción puramente verbal y la ejecuta.'] },
  expresion: { code: 'M-4', name: 'Expresión Verbal', category: 'Onomatopeyas, nombrar y frases',
    read: '¿Cómo hace el perro? "Guau". Anímale a nombrar y pedir: "quiero agua".',
    stage: 'phrase', stageLabel: 'Evoca y nombra', phrase: 'QUIERO AGUA',
    ept: ['Solo usa gestos o balbuceos para expresar sus necesidades.', 'Expresa palabras simples tras el modelo directo del adulto.', 'Evoca palabras y oraciones de dos palabras espontáneamente.'] },
  comunicacion_funcional: { code: 'M-5', name: 'Comunicación Funcional', category: 'Pedir "más", "ayuda", "quiero"',
    read: 'Para de hacer algo divertido y espera. Anímale a pedir "más" o "ayuda".',
    stage: 'instruction', instrIcon: '🙌', instrHint: 'Usa lenguaje verbal o aumentativo para solicitar juego o ayuda.',
    ept: ['Se frustra o no intenta comunicarse ante un problema.', 'Solicita ayuda o "más" usando modelo verbal guiado.', 'Usa palabras o signos funcionales con clara intención.'] },
  regulacion_conductual: { code: 'M-6', name: 'Regulación Conductual', category: 'Transiciones, rutinas y fichas',
    read: 'Avisa del cambio de actividad con la agenda visual y espera con tranquilidad.',
    stage: 'instruction', instrIcon: '🗂️', instrHint: 'Anticipa y acepta el cambio de actividad con apoyo visual y fichas.',
    ept: ['Conductas disruptivas ante las transiciones.', 'Tolera el cambio con apoyo de economía de fichas.', 'Realiza transiciones con tranquilidad y autorregulación.'] },
  interaccion_social: { code: 'M-7', name: 'Interacción Social', category: 'Turnos, juego simbólico, emociones',
    read: 'Juega por turnos: "Ahora tú, ahora yo". Inicia un juego simbólico sencillo.',
    stage: 'instruction', instrIcon: '🤝', instrHint: 'Respeta turnos, inicia juego simbólico y responde afectivamente.',
    ept: ['Juega de forma solitaria, rechaza compartir turnos.', 'Acepta turnos y participa en juego guiado por el tutor.', 'Inicia y mantiene interacciones lúdicas recíprocas.'] },
};

const DEFAULT_SESSION = ['ff1', 'ff2', 'se1', 'pr3', 'ms3'];
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const EMO = [
  { face: '😀', label: 'Alegría' }, { face: '😢', label: 'Tristeza' },
  { face: '😠', label: 'Enfado' }, { face: '🤕', label: 'Dolor' },
];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Relleno de marcador de imagen (el equipo sustituye por arte real)
const TilePlaceholder = ({ style }: { style?: any }) => (
  <View style={[{ borderRadius: 11, overflow: 'hidden', backgroundColor: '#eef3f3', borderWidth: 1, borderColor: '#e1e8e7' }, style]}>
    <View style={{ flex: 1, opacity: 0.5, transform: [{ rotate: '45deg' }, { scale: 1.6 }] }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={i} style={{ height: 7, backgroundColor: i % 2 ? '#e3eceb' : 'transparent' }} />
      ))}
    </View>
  </View>
);

// ----------------------------------------------------------------------------
// Componente
// ----------------------------------------------------------------------------
export const ValeriaExercisePlayerScreen: React.FC<{ navigation: any; route?: any }> = ({ navigation, route }) => {
  const startId: string | undefined = route?.params?.id;
  const sessionIds = useMemo(
    () => (startId && DB[startId] ? [startId] : DEFAULT_SESSION),
    [startId],
  );

  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<number[]>([]);
  const [picked, setPicked] = useState(0);
  const [locking, setLocking] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countdown, setCountdown] = useState(6);
  // estado efímero de mini-juego
  const [vowelPick, setVowelPick] = useState('');
  const [fillPick, setFillPick] = useState('');
  const [intruderPick, setIntruderPick] = useState(-1);
  const [emotionPick, setEmotionPick] = useState('');

  const ex = DB[sessionIds[idx]] ?? DB.ff1;
  const total = sessionIds.length;

  const resetEphemeral = () => { setVowelPick(''); setFillPick(''); setIntruderPick(-1); setEmotionPick(''); };

  const pick = (val: number) => {
    if (locking || finished) return;
    setPicked(val);
    setLocking(true);
    setTimeout(() => {
      const nextResults = [...results, val];
      setResults(nextResults);
      if (idx + 1 >= total) finish(nextResults);
      else { setIdx(idx + 1); setPicked(0); setLocking(false); resetEphemeral(); }
    }, 620);
  };

  const finish = async (res: number[]) => {
    const avg = res.reduce((a, b) => a + b, 0) / res.length;
    const sessionName = total === 1 ? ex.name : 'Sesión de terapia';
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.historial);
      const hist = raw ? JSON.parse(raw) : [];
      const d = new Date();
      hist.push({
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        name: sessionName,
        avg: +avg.toFixed(1),
        note: avg >= 2.5 ? 'Sesión muy fluida, gran respuesta en las consignas.'
          : avg >= 1.8 ? 'Buena sesión, alguna consigna costó pero se mantuvo atento.'
            : 'Sesión difícil hoy, conviene reforzar con más apoyo del tutor.',
        completed: true,
      });
      await AsyncStorage.setItem(STORAGE_KEYS.historial, JSON.stringify(hist));
    } catch (e) { /* almacenamiento no disponible */ }
    setResults(res);
    setFinished(true);
  };

  // Cuenta atrás hacia Resultados
  const timerRef = useRef<any>(null);
  useEffect(() => {
    if (!finished) return;
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); navigation.navigate('Results'); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finished]);

  const restart = () => {
    clearInterval(timerRef.current);
    setIdx(0); setResults([]); setPicked(0); setLocking(false);
    setFinished(false); setCountdown(6); resetEphemeral();
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
        <Pressable onPress={() => { clearInterval(timerRef.current); navigation.goBack(); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
        <Text style={s.logoFallback}>valeria+</Text>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{finished ? 'Sesión Completada' : 'Sesión de Terapia'}</Text>
            <Text style={s.headerSub} numberOfLines={1}>
              Lucía M. · {total === 1 ? ex.name : 'Plan prescrito'}
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

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!finished ? (
          <>
            {/* Meta del ejercicio */}
            <View style={s.metaRow}>
              <View style={s.codeChip}><Text style={s.codeChipTxt}>{ex.code}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.metaName}>{ex.name}</Text>
                <Text style={s.metaCat}>{ex.category}</Text>
              </View>
            </View>

            {/* Consigna del tutor */}
            <View style={s.instructionCard}>
              <View style={s.instructionHead}>
                <View style={s.instructionIcon}><Text style={{ fontSize: 18 }}>📢</Text></View>
                <View>
                  <Text style={s.instructionKicker}>TU TURNO, TUTOR</Text>
                  <Text style={s.instructionSmall}>Lee la consigna en voz alta</Text>
                </View>
              </View>
              <Text style={s.instructionText}>{ex.read}</Text>
            </View>

            {/* ===== Stage / mini-juego ===== */}
            <View style={s.stageCard}>
              <Text style={s.stageLabel}>{ex.stageLabel ?? 'Actividad guiada'}</Text>

              {ex.stage === 'phrase' && (
                <View style={s.phraseBox}><Text style={s.phraseTxt}>“{ex.phrase}”</Text></View>
              )}

              {ex.stage === 'vowels' && (
                <>
                  <View style={s.tilesRow}>
                    {ex.tiles!.map((t, i) => (
                      <View key={i} style={{ alignItems: 'center' }}>
                        <TilePlaceholder style={{ width: 78, height: 64 }} />
                        <Text style={s.tileCap}>{t.cap}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={s.vowelRow}>
                    {VOWELS.map((v) => (
                      <Pressable key={v} onPress={() => setVowelPick(v)} style={[s.vowel, vowelPick === v && s.vowelOn]}>
                        <Text style={[s.vowelTxt, vowelPick === v && s.vowelTxtOn]}>{v}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {ex.stage === 'fill' && (
                <>
                  <View style={s.fillRow}>
                    <Text style={s.fillBig}>{ex.fillBefore}</Text>
                    <View style={[s.fillSlot, fillPick ? (fillPick === ex.fillAnswer ? s.fillSlotOk : s.fillSlotBad) : s.fillSlotEmpty]}>
                      <Text style={[s.fillSlotTxt, { color: fillPick ? (fillPick === ex.fillAnswer ? '#fff' : V.color.error) : '#c2cbca' }]}>{fillPick || '?'}</Text>
                    </View>
                    <Text style={s.fillBig}>{ex.fillAfter}</Text>
                  </View>
                  <View style={s.vowelRow}>
                    {VOWELS.map((v) => (
                      <Pressable key={v} onPress={() => setFillPick(v)} style={[s.vowel, fillPick === v && (v === ex.fillAnswer ? s.vowelRight : s.vowelOn)]}>
                        <Text style={[s.vowelTxt, fillPick === v && s.vowelTxtOn]}>{v}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {ex.stage === 'intruder' && (
                <View style={s.grid2}>
                  {ex.intruder!.map((t, i) => {
                    const tapped = intruderPick === i;
                    const isAns = i === ex.intruderAnswer;
                    const reveal = intruderPick >= 0;
                    const ok = (tapped && isAns) || (reveal && isAns);
                    const bad = tapped && !isAns;
                    return (
                      <Pressable key={i} onPress={() => setIntruderPick(i)} style={[s.gridTile, ok && s.gridTileOk, bad && s.gridTileBad]}>
                        <TilePlaceholder style={{ width: '100%', height: 62 }} />
                        <View style={s.gridCapRow}>
                          <Text style={s.gridCap}>{t.cap}</Text>
                          <Text style={{ fontSize: 13 }}>{ok ? '✅' : bad ? '❌' : ''}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {ex.stage === 'emotions' && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 62 }}>{ex.emotionFace}</Text>
                    <Text style={s.emoQ}>¿Cómo se siente?</Text>
                  </View>
                  <View style={s.grid2}>
                    {EMO.map((e) => {
                      const picked = emotionPick === e.label;
                      const isAns = e.label === ex.emotionAnswer;
                      const ok = picked && isAns; const bad = picked && !isAns;
                      return (
                        <Pressable key={e.label} onPress={() => setEmotionPick(e.label)} style={[s.emoOpt, ok && s.gridTileOk, bad && s.gridTileBad]}>
                          <Text style={{ fontSize: 24 }}>{e.face}</Text>
                          <Text style={s.emoLabel}>{e.label}</Text>
                          <Text style={{ marginLeft: 'auto', fontSize: 14 }}>{ok ? '✅' : bad ? '❌' : ''}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              {ex.stage === 'dice' && (
                <>
                  <View style={s.diceRow}>
                    {ex.parts!.map((p, i) => (
                      <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={s.diceRole}>{p.role.toUpperCase()}</Text>
                        <TilePlaceholder style={{ width: '100%', height: 60 }} />
                        <Text style={s.tileCap}>{p.cap}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={s.sentenceBox}><Text style={s.sentenceTxt}>“{ex.sentence}”</Text></View>
                </>
              )}

              {ex.stage === 'instruction' && (
                <View style={{ alignItems: 'center', paddingVertical: 6 }}>
                  <View style={s.instrBig}><Text style={{ fontSize: 32 }}>{ex.instrIcon}</Text></View>
                  <Text style={s.instrHint}>{ex.instrHint}</Text>
                </View>
              )}
            </View>

            {/* Espera */}
            <View style={s.waitRow}>
              <Text style={{ fontSize: 14 }}>👂</Text>
              <Text style={s.waitTxt}>Espera y observa la respuesta del niño</Text>
            </View>

            {/* ===== Evaluación EPT-4 ===== */}
            <View style={s.scoreCard}>
              <Text style={s.scoreTitle}>Evalúa con la escala EPT-4</Text>
              <Text style={s.scoreSub}>Toca el nivel que mejor describe su respuesta</Text>
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
          </>
        ) : (
          /* ===== Completado ===== */
          <View style={s.doneCard}>
            <View style={s.doneIcon}><Text style={{ fontSize: 36 }}>🎉</Text></View>
            <Text style={s.doneTitle}>¡Sesión completada!</Text>
            <Text style={s.doneSub}>
              {total === 1
                ? 'Has evaluado este ejercicio. El resultado se ha guardado en el dispositivo.'
                : `Has evaluado las ${total} actividades del plan. El resultado se guardó en el dispositivo.`}
            </Text>
            <View style={s.doneStatBox}>
              <Text style={s.doneStatKicker}>PROMEDIO EPT-4 DE LA SESIÓN</Text>
              <Text style={s.doneStatBig}>{sumAvg.toFixed(1)}<Text style={s.doneStatSlash}> / 3</Text></Text>
              <Text style={s.doneStatStars}>{starStr(fullStars)}</Text>
              <View style={s.recapRow}>
                {results.map((v, i) => (
                  <View key={i} style={s.recapCell}>
                    <Text style={s.recapCode}>{DB[sessionIds[i]].code}</Text>
                    <Text style={s.recapStars}>{'★'.repeat(v)}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Pressable onPress={() => { clearInterval(timerRef.current); navigation.navigate('Results'); }} style={s.primaryBtn}>
              <Text style={s.primaryBtnTxt}>Ver Resultados →</Text>
            </Pressable>
            <Pressable onPress={restart}><Text style={s.linkBtn}>Repetir sesión</Text></Pressable>
            <Text style={s.redirect}>Redirigiendo a resultados en {countdown}s…</Text>
          </View>
        )}
      </ScrollView>
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

  instructionCard: { backgroundColor: V.color.primaryTint, borderColor: '#b8eee9', borderWidth: 1.5, borderRadius: 18, padding: 16, ...V.shadow.card },
  instructionHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  instructionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  instructionKicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  instructionSmall: { fontSize: 12.5, fontWeight: '700', color: V.color.textPrimary, marginTop: 1 },
  instructionText: { marginTop: 13, fontSize: 14.5, fontWeight: '700', color: V.color.textPrimary, lineHeight: 20 },

  stageCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
  stageLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: V.color.textMuted, textAlign: 'center', marginBottom: 14 },
  phraseBox: { backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#9bdfd9', borderStyle: 'dashed', borderRadius: 16, paddingVertical: 26, paddingHorizontal: 16, alignItems: 'center' },
  phraseTxt: { fontSize: 32, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center', letterSpacing: -0.5 },

  tilesRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginBottom: 16 },
  tileCap: { fontSize: 11, color: V.color.textMuted, marginTop: 5, fontWeight: '700' },
  vowelRow: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  vowel: { minWidth: 46, height: 48, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1' },
  vowelOn: { backgroundColor: V.color.primaryLight, borderColor: V.color.primaryLight },
  vowelRight: { backgroundColor: V.color.primary, borderColor: V.color.primary },
  vowelTxt: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary },
  vowelTxtOn: { color: V.color.primaryDark },

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
  instrHint: { fontSize: 14, fontWeight: '700', color: V.color.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 12 },

  waitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 11 },
  waitTxt: { color: V.color.primaryDark, fontSize: 12.5, fontWeight: '700' },

  scoreCard: { backgroundColor: V.color.card, borderColor: V.color.border, borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 12, ...V.shadow.card },
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
  doneStatBox: { alignSelf: 'stretch', marginTop: 20, backgroundColor: V.color.pageBg, borderRadius: 18, padding: 18, alignItems: 'center' },
  doneStatKicker: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, color: V.color.textMuted },
  doneStatBig: { fontSize: 42, fontWeight: '800', color: V.color.textPrimary, marginTop: 8 },
  doneStatSlash: { fontSize: 20, color: V.color.textMuted, fontWeight: '800' },
  doneStatStars: { fontSize: 22, letterSpacing: 3, color: V.color.star, marginTop: 8 },
  recapRow: { flexDirection: 'row', gap: 6, marginTop: 16, alignSelf: 'stretch' },
  recapCell: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef3f3', borderRadius: 11, paddingVertical: 9, alignItems: 'center' },
  recapCode: { fontSize: 10, fontWeight: '800', color: '#c2cbca' },
  recapStars: { fontSize: 13, color: V.color.star, marginTop: 3 },
  primaryBtn: { alignSelf: 'stretch', marginTop: 20, backgroundColor: V.color.primary, borderRadius: 15, paddingVertical: 16, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  linkBtn: { marginTop: 11, color: V.color.primaryDark, fontSize: 13.5, fontWeight: '800' },
  redirect: { color: V.color.textMuted, fontSize: 11.5, marginTop: 14, fontWeight: '600' },
});

export default ValeriaExercisePlayerScreen;

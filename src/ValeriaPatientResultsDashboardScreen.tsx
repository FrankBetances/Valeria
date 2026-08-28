// ============================================================================
// Valeria+ · Panel de Resultados y Evolución del Paciente (V3.0)
// Sustituye a ValeriaResultsScreen (V2.x). Mismo concepto, cabecera de marca
// unificada, acciones de navegación y exportación, y lectura local-first.
//
// Renderiza 100% local (AsyncStorage · STORAGE_KEYS.historial):
//   1. Adherencia semanal: anillo SVG + barra + puntos de la semana (ej. 80% · 4/5).
//   2. Evolución por estrellas: gráfico de línea SVG (eje Y 1–3) de las últimas 5.
//   3. Historial de sesiones: lista con fecha, ejercicio, promedio y nota del tutor.
//
// Acciones:
//   Volver a ejercicios → navigation.navigate('ExerciseSelection')
//   Iniciar nueva sesión → navigation.navigate('ExercisePlayer')
//   Compartir PDF        → Share.share(...) (resumen clínico del paciente)
//
// Dependencias: @react-native-async-storage/async-storage · react-native-svg
// ============================================================================
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, Share, StyleSheet, StatusBar } from 'react-native';
import Svg, { Circle, Line, Polyline, Polygon, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { useT, UiStrings } from './i18n';
import { loadGame, liveStreak, levelFor, levelName, levelProgress, xpToNext, BADGES, GameState } from './valeriaGamification';
import { PixelAward, streakTier } from './ValeriaPixelAwards';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import { readArHistory, readSpeechHistory } from './valeriaTelemetry';
import type { ArTrial, ArDeviceProfile, ArThresholds } from './valeriaArBridge';
// import logoWhite from '../../assets/valeria-logo-white.png';

interface Sesion {
  date: string;
  name: string;
  avg: number;       // 1.0 – 3.0 (estrellas)
  completed: boolean;
  note: string;
  // Respuestas libres del niño registradas por voz o escrito durante la
  // sesión (PR-1 «¿qué es esto?», PR-2 adaptación del discurso…).
  responses?: { code: string; name: string; text: string }[];
  // ES-12 · Las cápsulas de contraste evalúan DOS habilidades distintas:
  // comprender (tocar la imagen correcta) y producir (decir la palabra). Un
  // único promedio las mezcla y esconde el caso más frecuente en clínica —el
  // niño entiende el par pero todavía no lo dice—, así que se guardan aparte.
  split?: { comprension: number | null; produccion: number | null };
}

// Registro por ensayo de pares mínimos (escribe ValeriaMinimalPairsScreen).
interface PmTrial { result: string; attempts: number; foils?: number; stars: number }
interface PmSession { date: string; pairId: string; phoneme: string; trials: PmTrial[] }

// % de ensayos de la sesión en los que el STT captó la palabra contraria.
// `foils` existe desde V6.1; para sesiones antiguas se aproxima con attempts>0.
const substPct = (s: PmSession): number => {
  if (!s.trials?.length) return 0;
  const n = s.trials.filter((t) => (t.foils ?? (t.attempts > 0 ? 1 : 0)) > 0).length;
  return Math.round((n / s.trials.length) * 100);
};

// ---------------------------------------------------------------------------
// Realidad Aumentada · qué serie se dibuja para cada ejercicio.
//
// Muro MDR (§9.3 del plan): aquí se muestran SERIES Y MAGNITUDES, nunca
// semáforos ni etiquetas de severidad. Un gráfico de latencias por ensayo es
// descripción; un badge rojo de «por debajo de lo esperado» es interpretación,
// y eso ya no cabe en la Clase I. Si alguien propone colorear estas series por
// rango normativo, es un cambio de clase regulatoria, no una mejora de UI.
// ---------------------------------------------------------------------------
// Solo lo que NO es texto: unidad, icono y de qué campo del ensayo sale el
// número. La etiqueta, la pista y el nombre largo viven en el catálogo
// (t.results.arLabel / arHint / arTitle), porque los lee el adulto.
const AR_SERIES: Record<string, {
  unit: string; icon: BlockIconName;
  value: (trial: any) => number | null;
}> = {
  ar1: { unit: 'ms', icon: 'gesture', value: (trial) => (trial.holdMaxMs > 0 ? trial.holdMaxMs : null) },
  ar2: { unit: 'ms', icon: 'hearing', value: (trial) => trial.latencyMs },
  ar3: { unit: 'ms', icon: 'eye', value: (trial) => (trial.dwellMs > 0 ? trial.dwellMs : null) },
  ar4: { unit: 'ms', icon: 'compass', value: (trial) => (trial.acquisitionTimeMs > 0 ? trial.acquisitionTimeMs : null) },
  ar5: { unit: 'ms', icon: 'move', value: (trial) => (trial.timeToThrowMs > 0 ? trial.timeToThrowMs : null) },
  ar6: { unit: 'ms', icon: 'gesture', value: (trial) => (trial.holdMs > 0 ? trial.holdMs : null) },
};


const shortDate = (iso: string, months: string[]): string => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : `${d.getDate()} ${months[d.getMonth()]}`;
};

const META_SEMANAL = 5;


// Línea de cabecera con el paciente ACTIVO (ficha de STORAGE_KEYS.registro).
// Recibe el catálogo: la línea de paciente («Paciente sin ficha registrada»,
// «NHC 1234») la lee el adulto, así que sigue al idioma de la interfaz.
const patientLineFrom = (raw: string | null, t: UiStrings): string => {
  try {
    const p = raw ? JSON.parse(raw) : null;
    if (!p || typeof p !== 'object') return t.results.noPatient;
    const nombre = typeof p.nombre === 'string' ? p.nombre.trim() : '';
    const nhc = typeof p.nhc === 'string' ? p.nhc.trim() : '';
    if (!nombre && !nhc) return t.results.noPatient;
    return [nombre, nhc ? t.results.recordNumber(nhc) : ''].filter(Boolean).join(' · ');
  } catch (e) {
    return t.results.noPatient;
  }
};

// Historial de EJEMPLO mientras no hay sesiones reales guardadas. Las medias
// son las de siempre; el texto sale del catálogo para que no se lea en
// castellano con la interfaz en inglés.
const AVGS_DEFECTO = [1.8, 2.0, 2.4, 2.5, 2.6];
const historialDefecto = (t: UiStrings): Sesion[] =>
  t.results.demoHistory().map((d, i) => ({ ...d, avg: AVGS_DEFECTO[i], completed: true }));

/* Geometría del gráfico de línea */
const CHART = { W: 320, H: 178, padL: 32, padR: 12, padT: 14, padB: 36, yMin: 1, yMax: 3 };
const plotW = CHART.W - CHART.padL - CHART.padR;
const plotH = CHART.H - CHART.padT - CHART.padB;
const yFor = (v: number) => CHART.padT + ((CHART.yMax - v) / (CHART.yMax - CHART.yMin)) * plotH;
const yPct = (v: number) => CHART.padT + ((100 - v) / 100) * plotH; // eje 0–100 %
const xFor = (i: number, total: number) =>
  CHART.padL + (total <= 1 ? plotW / 2 : (i / (total - 1)) * plotW);

const starString = (avg: number): string => {
  const full = Math.round(avg);
  return '★★★☆☆☆'.slice(3 - full, 6 - full);
};

export const ValeriaPatientResultsDashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const t = useT();
  const [sesiones, setSesiones] = useState<Sesion[]>(() => historialDefecto(t));
  const [game, setGame] = useState<GameState | null>(null);
  const [pmSesiones, setPmSesiones] = useState<PmSession[]>([]);
  const [pmFonema, setPmFonema] = useState('');
  const [patientLine, setPatientLine] = useState('');
  // Realidad Aumentada: los ensayos viven en el log cifrado de telemetría, no
  // en una clave suelta de AsyncStorage. valeriaTelemetry es su única puerta.
  const [arTrials, setArTrials] = useState<ArTrial[]>([]);
  const [arDevice, setArDevice] = useState<ArDeviceProfile | null>(null);
  const [arThresholds, setArThresholds] = useState<ArThresholds | null>(null);
  const [arSessions, setArSessions] = useState(0);
  const [arEjercicio, setArEjercicio] = useState('');
  const [speech, setSpeech] = useState<{
    utterances: number; wordsPerUtterance: number | null; coverage: number | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setPatientLine(patientLineFrom(await AsyncStorage.getItem(STORAGE_KEYS.registro), t));
      } catch (e) { /* ficha no disponible: queda el rótulo por defecto */ }
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.historial);
        if (raw) {
          const guardado = JSON.parse(raw);
          if (Array.isArray(guardado) && guardado.length) setSesiones(guardado);
        }
      } catch (e) {
        console.warn('Error al cargar el historial:', e);
      }
      try {
        const rawPm = await AsyncStorage.getItem(STORAGE_KEYS.paresMinimos);
        if (rawPm) {
          const pm = JSON.parse(rawPm);
          if (Array.isArray(pm) && pm.length) {
            setPmSesiones(pm);
            setPmFonema((prev) => prev || pm[pm.length - 1].phoneme); // el más reciente
          }
        }
      } catch (e) { /* registro de pares no disponible */ }
      try {
        const ar = await readArHistory();
        if (ar.trials.length) {
          setArTrials(ar.trials);
          setArDevice(ar.device);
          setArThresholds(ar.thresholds);
          setArSessions(ar.sessions);
          setArEjercicio((prev) => prev || ar.trials[ar.trials.length - 1].exerciseId);
        }
      } catch (e) { /* sin ejercicios de realidad aumentada todavía */ }
      try {
        const sp = await readSpeechHistory();
        // Sin enunciados medidos la tarjeta no se pinta: un panel con «0,00
        // palabras por enunciado» se lee como un hallazgo clínico, y lo que
        // pasa es que este niño todavía no ha hecho ningún ejercicio de frase.
        if (sp.utterances > 0) setSpeech(sp);
      } catch (e) { /* sin ejercicios de frase con micrófono todavía */ }
      try {
        setGame(await loadGame());
      } catch (e) { /* gamificación no disponible */ }
    })();
  }, []);

  /* Adherencia semanal */
  const done = Math.min(sesiones.filter((s) => s.completed).length, META_SEMANAL);
  const pct = Math.round((done / META_SEMANAL) * 100);
  const RING_R = 44;
  const RING_C = 2 * Math.PI * RING_R;
  const ringOffset = RING_C * (1 - done / META_SEMANAL);

  /* Datos del gráfico */
  const { puntos, linePoints, areaPoints, trendLabel } = useMemo(() => {
    const data = sesiones.slice(-5);
    const pts = data.map((d, i) => ({
      x: xFor(i, data.length),
      y: yFor(d.avg),
      val: d.avg.toFixed(1),
      date: d.date,
    }));
    const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const baseY = yFor(CHART.yMin);
    const area = pts.length
      ? `${pts[0].x},${baseY} ${line} ${pts[pts.length - 1].x},${baseY}`
      : '';
    const first = data[0]?.avg ?? 0;
    const last = data[data.length - 1]?.avg ?? 0;
    const diff = Number((last - first).toFixed(1));
    const trend = diff > 0 ? t.results.trendUp(diff) : diff < 0 ? t.results.trendDown(diff) : t.results.trendStable;
    return { puntos: pts, linePoints: line, areaPoints: area, trendLabel: trend };
  }, [sesiones]);

  const historial = useMemo(() => sesiones.slice().reverse(), [sesiones]);

  /* Realidad Aumentada: serie de magnitudes del ejercicio seleccionado.
     Los ensayos ANULADOS (el teléfono se movió) se excluyen de la serie pero
     se cuentan aparte: su proporción es en sí un dato del método, no un
     defecto que convenga esconder. */
  const arEjercicios = useMemo(
    () => Array.from(new Set(arTrials.map((t) => t.exerciseId))),
    [arTrials],
  );
  const ar = useMemo(() => {
    const delEjercicio = arTrials.filter((t) => t.exerciseId === arEjercicio);
    const serie = AR_SERIES[arEjercicio];
    const anulados = delEjercicio.filter((t) => t.voided).length;
    if (!serie || !delEjercicio.length) {
      // Misma forma que la rama con datos: que las dos ramas devuelvan campos
      // distintos obliga al consumidor a razonar sobre una unión, y eso no
      // aporta nada aquí.
      return {
        pts: [], line: '', valores: [] as number[], anulados,
        total: delEjercicio.length, objetivo: null as number | null, yObjetivo: null as number | null,
      };
    }
    const valores = delEjercicio
      .filter((t) => !t.voided)
      .map((t) => serie.value(t))
      .filter((v): v is number => v != null)
      .slice(-12);

    // Escala derivada de los datos, no fija: un sostén de 900 ms y una latencia
    // de 400 ms no comparten eje, y forzarlo aplanaría una de las dos series.
    const objetivo =
      arEjercicio === 'ar1' || arEjercicio === 'ar6'
        ? arThresholds?.holdMs ?? null
        : arEjercicio === 'ar3'
          ? arThresholds?.dwellMs ?? null
          : null;
    const maxDato = Math.max(...valores, objetivo ?? 0, 1);
    const top = maxDato * 1.15;
    const yArb = (v: number) => CHART.padT + (1 - v / top) * plotH;
    const pts = valores.map((v, i) => ({ x: xFor(i, valores.length), y: yArb(v), val: v }));
    return {
      pts,
      line: pts.map((p) => `${p.x},${p.y}`).join(' '),
      valores,
      anulados,
      total: delEjercicio.length,
      objetivo,
      yObjetivo: objetivo != null ? yArb(objetivo) : null,
    };
  }, [arTrials, arEjercicio, arThresholds]);

  /* Pares mínimos: evolución del % de sustitución del fonema seleccionado */
  const pmFonemas = useMemo(
    () => Array.from(new Set(pmSesiones.map((s) => s.phoneme))),
    [pmSesiones],
  );
  const pm = useMemo(() => {
    const data = pmSesiones.filter((s) => s.phoneme === pmFonema).slice(-6);
    const pts = data.map((s, i) => ({
      x: xFor(i, data.length),
      y: yPct(substPct(s)),
      val: substPct(s),
      date: shortDate(s.date, t.ling.months.split(' ')),
    }));
    const line = pts.map((p) => `${p.x},${p.y}`).join(' ');
    const baseY = yPct(0);
    const area = pts.length
      ? `${pts[0].x},${baseY} ${line} ${pts[pts.length - 1].x},${baseY}`
      : '';
    // En este eje, BAJAR es mejorar: menos sustituciones detectadas.
    const diff = pts.length >= 2 ? pts[pts.length - 1].val - pts[0].val : 0;
    const trend = pts.length < 2
      ? { txt: t.results.pmFirstSession, bg: V.color.primaryLight, fg: V.color.primaryDark }
      : diff < 0
        ? { txt: t.results.pmImproving(Math.abs(diff)), bg: V.color.successBg, fg: V.color.success }
        : diff > 0
          ? { txt: t.results.pmWorsening(diff), bg: V.color.errorBg, fg: V.color.error }
          : { txt: t.results.trendStable, bg: V.color.primaryLight, fg: V.color.primaryDark };
    return { pts, line, area, trend };
  }, [pmSesiones, pmFonema]);

  const compartir = async () => {
    const lineas = sesiones
      .map((s) => {
        const resp = (s.responses ?? [])
          .map((r) => t.results.shareResponse(r.code, r.text))
          .join('');
        // ES-12: en las cápsulas de contraste el promedio único mezcla dos
        // habilidades. El informe que se comparte con el logopeda las separa.
        const split = s.split
          ? t.results.shareSplit(s.split.comprension?.toFixed(1) ?? '–', s.split.produccion?.toFixed(1) ?? '–')
          : '';
        return t.results.shareSessionLine(s.date, s.name, s.avg.toFixed(1), starString(s.avg), split, resp);
      })
      .join('\n');
    const pmLineas = pmFonemas
      .map((f) => {
        const ss = pmSesiones.filter((s) => s.phoneme === f);
        const ult = ss[ss.length - 1];
        return t.results.sharePmLine(f, substPct(ult), ss.length);
      })
      .join('\n');
    // Realidad aumentada: magnitudes y su condición de medida. El sello del
    // aparato va con ellas porque sin él las cifras no son comparables entre
    // sesiones hechas en teléfonos distintos.
    const arLineas = arEjercicios
      .map((id) => {
        const serie = AR_SERIES[id];
        if (!serie) return '';
        const delEj = arTrials.filter((t) => t.exerciseId === id);
        const vals = delEj.filter((t) => !t.voided)
          .map((t) => serie.value(t))
          .filter((v): v is number => v != null);
        const anulados = delEj.filter((t) => t.voided).length;
        const media = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
        const medida = media != null
          ? t.results.shareArMeasure(t.results.arLabel(id), media, serie.unit, Math.max(...vals), vals.length)
          : t.results.shareArNoTiming;
        return t.results.arShareLine(t.results.arTitle(id), delEj.length, medida) +
          (anulados ? t.results.shareArVoided(anulados) : '');
      })
      .filter(Boolean)
      .join('\n') +
      (arDevice
        ? t.results.shareDevice(arDevice.manufacturer, arDevice.model, String(arDevice.level), arDevice.probes.fpsP5.toFixed(0)) +
          (arThresholds
            ? t.results.shareThresholds(arThresholds.holdMs, arThresholds.turnDeg, arThresholds.responseWindowMs, arThresholds.dwellMs)
            : '')
        : '');

    try {
      await Share.share({
        title: t.results.shareTitle,
        message:
          `${t.results.shareHeader}\n${patientLine}\n\n` +
          `${t.results.shareAdherence(pct, done, META_SEMANAL)}\n` +
          `${t.results.shareTrend(trendLabel)}\n\n${t.results.shareHistory}\n${lineas}\n` +
          (pmLineas ? `\n${t.results.sharePm}\n${pmLineas}\n` : '') +
          (arLineas ? `\n${t.results.shareAr}\n${arLineas}\n` : '') +
          `\n${t.results.shareFoot}`,
      });
    } catch (e) {
      console.warn('Error al compartir:', e);
    }
  };

  return (
    <View style={st.flex}>
      <StatusBar barStyle="light-content" backgroundColor={V.color.primary} />

      {/* Cabecera teal unificada */}
      <View style={st.header}>
        <Pressable style={st.back} onPress={() => navigation?.navigate('ExerciseSelection')}>
          <Text style={st.backText}>{t.results.back}</Text>
        </Pressable>
        {/* <Image source={logoWhite} style={st.logo} /> */}
        <Text style={st.brand}>valeria</Text>
        <Text style={st.title}>{t.results.title}</Text>
        <Text style={st.subtitle}>{patientLine}</Text>
      </View>

      <ScrollView style={st.flex} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {/* PROGRESO GAMIFICADO: racha, nivel y logros */}
        {game && (
          <View style={st.card}>
            <View style={st.cardHeader}>
              <View style={st.chip}><BlockIcon name="level" color={V.color.primaryDark} size={17} /></View>
              <Text style={st.cardTitle}>{t.results.gameTitle}</Text>
            </View>

            <View style={st.gameStatsRow}>
              <View style={st.gameStat}>
                <View style={st.streakRow}>
                  <PixelAward glyph="flame" tier={streakTier(liveStreak(game))} size={18} />
                  <Text style={st.gameStatBig}>{liveStreak(game)}</Text>
                </View>
                <Text style={st.gameStatLbl}>{t.results.currentStreak}</Text>
              </View>
              <View style={st.gameStat}>
                <Text style={st.gameStatBig}>⭐ {game.xp}</Text>
                <Text style={st.gameStatLbl}>{t.results.totalXp}</Text>
              </View>
              <View style={st.gameStat}>
                <Text style={st.gameStatBig}>{game.bestStreak}</Text>
                <Text style={st.gameStatLbl}>{t.results.bestStreak}</Text>
              </View>
            </View>

            <View style={st.gameLevelRow}>
              <Text style={st.gameLevelLbl}>{t.results.level(levelFor(game.xp), t.hub.levelNameByIndex(levelFor(game.xp) - 1))}</Text>
              <View style={st.gameLevelTrack}>
                <View style={[st.gameLevelFill, { width: `${Math.round(levelProgress(game.xp) * 100)}%` }]} />
              </View>
              <Text style={st.gameLevelToGo}>{t.results.xpToNext(xpToNext(game.xp))}</Text>
            </View>

            <Text style={st.gameBadgesLbl}>{t.results.badgesLabel(game.badges.length, BADGES.length)}</Text>
            <View style={st.gameBadgesGrid}>
              {BADGES.map((b) => {
                const won = game.badges.includes(b.id);
                return (
                  <View key={b.id} style={[st.gameBadge, !won && st.gameBadgeOff]}>
                    <PixelAward glyph={b.glyph} tier={b.tier} size={24} locked={!won} />
                    <Text style={[st.gameBadgeName, !won && { color: '#c2cbca' }]} numberOfLines={1}>
                      {t.awards.badgeName(b.id)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ADHERENCIA SEMANAL */}
        <View style={st.card}>
          <View style={st.cardHeader}>
            <View style={st.chip}><BlockIcon name="chart" color={V.color.primaryDark} size={17} /></View>
            <Text style={st.cardTitle}>{t.results.adherenceTitle}</Text>
          </View>

          <View style={st.adherenceRow}>
            <View style={st.ringWrap}>
              <Svg width={104} height={104} viewBox="0 0 104 104">
                <Circle cx={52} cy={52} r={RING_R} fill="none" stroke={V.color.border} strokeWidth={13} />
                <Circle
                  cx={52} cy={52} r={RING_R} fill="none" stroke={V.color.primary} strokeWidth={13}
                  strokeLinecap="round" strokeDasharray={`${RING_C} ${RING_C}`}
                  strokeDashoffset={ringOffset} transform="rotate(-90 52 52)"
                />
              </Svg>
              <View style={st.ringCenter}>
                <Text style={st.ringPct}>{pct}%</Text>
                <Text style={st.ringRatio}>{done}/{META_SEMANAL}</Text>
              </View>
            </View>

            <View style={st.adherenceBody}>
              <Text style={st.adherenceLabel}>{t.results.adherenceLabel}</Text>
              <Text style={st.adherenceValue}>{t.results.adherenceValue(done, META_SEMANAL)}</Text>
              <View style={st.barTrack}>
                <View style={[st.barFill, { width: `${pct}%` }]} />
              </View>
              <View style={st.weekDots}>
                {Array.from({ length: META_SEMANAL }).map((_, i) => {
                  const on = i < done;
                  return (
                    <View key={i} style={[st.weekDot, on ? st.weekDotOn : st.weekDotOff]}>
                      {on ? <BlockIcon name="check" color="#ffffff" size={11} /> : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </View>

        {/* EVOLUCIÓN POR ESTRELLAS */}
        <View style={st.card}>
          <View style={st.evoHeader}>
            <View style={st.cardHeader}>
              <View style={st.chip}><Text style={st.chipIcon}>⭐</Text></View>
              <Text style={st.cardTitle}>{t.results.evolutionTitle}</Text>
            </View>
            <View style={st.trendPill}><Text style={st.trendText}>{trendLabel}</Text></View>
          </View>
          <Text style={st.evoSub}>{t.results.evolutionSub(puntos.length)}</Text>

          <Svg width="100%" height={178} viewBox={`0 0 ${CHART.W} ${CHART.H}`}>
            {[3, 2, 1].map((v) => {
              const y = yFor(v);
              return (
                <React.Fragment key={v}>
                  <Line x1={CHART.padL} y1={y} x2={CHART.W - CHART.padR} y2={y} stroke={V.color.border} strokeWidth={1.5} />
                  <SvgText x={22} y={y + 4} textAnchor="end" fontSize={11} fontWeight="700" fill="#c2cbca">{`${v}★`}</SvgText>
                </React.Fragment>
              );
            })}
            {areaPoints ? <Polygon points={areaPoints} fill={`${V.color.primary}22`} /> : null}
            <Polyline points={linePoints} fill="none" stroke={V.color.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
            {puntos.map((p, i) => (
              <React.Fragment key={i}>
                <SvgText x={p.x} y={p.y - 12} textAnchor="middle" fontSize={11} fontWeight="800" fill={V.color.textPrimary}>{p.val}</SvgText>
                <Circle cx={p.x} cy={p.y} r={5.5} fill="#fff" stroke={V.color.primary} strokeWidth={3} />
                <SvgText x={p.x} y={172} textAnchor="middle" fontSize={10.5} fontWeight="700" fill={V.color.textMuted}>{p.date}</SvgText>
              </React.Fragment>
            ))}
          </Svg>
        </View>

        {/* PARES MÍNIMOS · % DE SUSTITUCIÓN POR FONEMA */}
        {pmFonemas.length > 0 && (
          <View style={st.card}>
            <View style={st.evoHeader}>
              <View style={[st.cardHeader, { flex: 1, marginRight: 8 }]}>
                <View style={st.chip}><Text style={st.chipIcon}>🗣️</Text></View>
                <Text style={[st.cardTitle, { flexShrink: 1 }]} numberOfLines={2}>{t.results.phonemeTitle}</Text>
              </View>
              <View style={[st.trendPill, { backgroundColor: pm.trend.bg }]}>
                <Text style={[st.trendText, { color: pm.trend.fg }]}>{pm.trend.txt}</Text>
              </View>
            </View>
            <Text style={st.evoSub}>{t.results.pairsChartSub}</Text>

            {/* Selector de fonema */}
            <View style={st.pmChipsRow}>
              {pmFonemas.map((f) => {
                const on = f === pmFonema;
                return (
                  <Pressable
                    key={f}
                    onPress={() => setPmFonema(f)}
                    style={[st.pmChip, on && st.pmChipOn]}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[st.pmChipTxt, on && st.pmChipTxtOn]}>{f}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Svg width="100%" height={178} viewBox={`0 0 ${CHART.W} ${CHART.H}`}>
              {[100, 50, 0].map((v) => {
                const y = yPct(v);
                return (
                  <React.Fragment key={v}>
                    <Line x1={CHART.padL} y1={y} x2={CHART.W - CHART.padR} y2={y} stroke={V.color.border} strokeWidth={1.5} />
                    <SvgText x={26} y={y + 4} textAnchor="end" fontSize={10.5} fontWeight="700" fill="#c2cbca">{`${v}%`}</SvgText>
                  </React.Fragment>
                );
              })}
              {pm.area ? <Polygon points={pm.area} fill={`${V.color.primary}22`} /> : null}
              <Polyline points={pm.line} fill="none" stroke={V.color.primary} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
              {pm.pts.map((p, i) => (
                <React.Fragment key={i}>
                  <SvgText x={p.x} y={p.y - 12} textAnchor="middle" fontSize={11} fontWeight="800" fill={V.color.textPrimary}>{`${p.val}%`}</SvgText>
                  <Circle cx={p.x} cy={p.y} r={5.5} fill="#fff" stroke={V.color.primary} strokeWidth={3} />
                  <SvgText x={p.x} y={172} textAnchor="middle" fontSize={10.5} fontWeight="700" fill={V.color.textMuted}>{p.date}</SvgText>
                </React.Fragment>
              ))}
            </Svg>
          </View>
        )}

        {/* REALIDAD AUMENTADA · magnitudes por ensayo.
            Se muestran los números medidos y el umbral que fijó el adulto, sin
            ninguna valoración: la interpretación es de la logopeda. */}
        {arEjercicios.length > 0 && AR_SERIES[arEjercicio] && (
          <View style={st.card}>
            <View style={st.evoHeader}>
              <View style={[st.cardHeader, { flex: 1, marginRight: 8 }]}>
                <View style={st.chip}><BlockIcon name={AR_SERIES[arEjercicio].icon} color={V.color.primaryDark} size={17} /></View>
                <Text style={[st.cardTitle, { flexShrink: 1 }]} numberOfLines={2}>
                  {t.results.arLabel(arEjercicio)}
                </Text>
              </View>
              <View style={st.trendPill}>
                <Text style={st.trendText}>{t.results.sessionsCount(arSessions)}</Text>
              </View>
            </View>

            {/* Selector de ejercicio, solo si hay más de uno con datos. */}
            {arEjercicios.length > 1 && (
              <View style={st.arTabs}>
                {arEjercicios.map((id) => {
                  const on = id === arEjercicio;
                  return (
                    <Pressable key={id} onPress={() => setArEjercicio(id)}
                      style={[st.arTab, on && st.arTabOn]}
                      accessibilityRole="button" accessibilityState={{ selected: on }}
                      accessibilityLabel={t.results.arTitle(id)}>
                      <Text style={[st.arTabTxt, on && st.arTabTxtOn]}>{id.toUpperCase()}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Text style={st.evoSub}>{t.results.arHint(arEjercicio)}</Text>

            {ar.pts.length > 0 ? (
              <Svg width="100%" height={178} viewBox={`0 0 ${CHART.W} ${CHART.H}`}>
                {/* Línea del objetivo fijado por el adulto: es el único
                    referente dibujado, y es SUYO, no una norma poblacional. */}
                {ar.yObjetivo != null && ar.objetivo != null && (
                  <React.Fragment>
                    <Line
                      x1={CHART.padL} y1={ar.yObjetivo} x2={CHART.W - CHART.padR} y2={ar.yObjetivo}
                      stroke={V.color.textMuted} strokeWidth={1.5} strokeDasharray="5 4"
                    />
                    <SvgText x={CHART.W - CHART.padR} y={ar.yObjetivo - 6} textAnchor="end"
                      fontSize={10} fontWeight="700" fill={V.color.textMuted}>
                      {t.results.arTargetMs(ar.objetivo)}
                    </SvgText>
                  </React.Fragment>
                )}
                <Polyline points={ar.line} fill="none" stroke={V.color.primary} strokeWidth={3}
                  strokeLinejoin="round" strokeLinecap="round" />
                {ar.pts.map((p, i) => (
                  <React.Fragment key={i}>
                    <Circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke={V.color.primary} strokeWidth={3} />
                    {(i === 0 || i === ar.pts.length - 1) && (
                      <SvgText x={p.x} y={p.y - 12} textAnchor="middle" fontSize={11} fontWeight="800"
                        fill={V.color.textPrimary}>{`${Math.round(p.val)}`}</SvgText>
                    )}
                  </React.Fragment>
                ))}
                <SvgText x={CHART.padL} y={172} textAnchor="start" fontSize={10.5} fontWeight="700"
                  fill={V.color.textMuted}>{t.results.arTrial1}</SvgText>
                <SvgText x={CHART.W - CHART.padR} y={172} textAnchor="end" fontSize={10.5} fontWeight="700"
                  fill={V.color.textMuted}>{t.results.arTrialN(ar.pts.length)}</SvgText>
              </Svg>
            ) : (
              <Text style={st.arEmpty}>
                {arEjercicio === 'ar2'
                  ? t.results.arNoTiming
                  : t.results.arNoTrials}
              </Text>
            )}

            <View style={st.arFacts}>
              <View style={st.arFact}>
                <Text style={st.arFactVal}>{ar.total}</Text>
                <Text style={st.arFactKey}>{t.results.arTrials}</Text>
              </View>
              <View style={st.arFact}>
                <Text style={st.arFactVal}>
                  {ar.valores.length ? Math.round(ar.valores.reduce((a, b) => a + b, 0) / ar.valores.length) : '–'}
                </Text>
                <Text style={st.arFactKey}>{t.results.arMean(AR_SERIES[arEjercicio].unit)}</Text>
              </View>
              <View style={st.arFact}>
                <Text style={st.arFactVal}>{ar.valores.length ? Math.max(...ar.valores) : '–'}</Text>
                <Text style={st.arFactKey}>{t.results.arMax(AR_SERIES[arEjercicio].unit)}</Text>
              </View>
              <View style={st.arFact}>
                <Text style={st.arFactVal}>{ar.anulados}</Text>
                <Text style={st.arFactKey}>{t.results.arVoided}</Text>
              </View>
            </View>

            {/* Sello del aparato: los resultados dependen del teléfono, así que
                sin esta línea las cifras de arriba no son comparables entre
                sesiones hechas en dispositivos distintos. */}
            {arDevice && (
              <Text style={st.arDevice}>
                {t.results.arMeasuredOn(
                  `${arDevice.manufacturer} ${arDevice.model}`,
                  arDevice.level,
                  Number(arDevice.probes.fpsP5.toFixed(0)),
                )}
                {ar.anulados > 0 ? t.results.arVoidedTrials(ar.anulados) : ''}
              </Text>
            )}
          </View>
        )}

        {/* RECUENTO DEL MICRÓFONO · APOYO DEL EJERCICIO, NO UNA MEDIDA.
            Va al final, después de las gráficas clínicas y del bloque de RA, y
            no antes: puesto entre «Evolución por estrellas» y «Sustitución por
            fonema» se leía como una tercera gráfica clínica. No lo es, no tiene
            finalidad sanitaria y no entra en ninguna decisión de tratamiento.
            Si alguien lo sube de sitio, vuelve a mentir por colocación. */}
        {!!speech && (
          <View style={[st.card, st.aidCard]}>
            <View style={st.cardHeader}>
              <View style={st.chip}><BlockIcon name="mic" color={V.color.textMuted} size={17} /></View>
              <Text style={[st.cardTitle, st.aidTitle, { flexShrink: 1 }]} numberOfLines={2}>{t.results.speechTitle}</Text>
            </View>
            <Text style={[st.evoSub, { marginTop: 6 }]}>{t.results.speechSub}</Text>

            <View style={st.arFacts}>
              <View style={st.arFact}>
                <Text style={[st.arFactVal, st.aidVal]}>
                  {speech.wordsPerUtterance != null ? speech.wordsPerUtterance.toFixed(2) : '—'}
                </Text>
                <Text style={st.arFactKey}>{t.results.speechWpu}</Text>
              </View>
              <View style={st.arFact}>
                <Text style={[st.arFactVal, st.aidVal]}>
                  {speech.coverage != null ? `${Math.round(speech.coverage * 100)}%` : '—'}
                </Text>
                <Text style={st.arFactKey}>{t.results.speechCoverage}</Text>
              </View>
              <View style={st.arFact}>
                <Text style={[st.arFactVal, st.aidVal]}>{speech.utterances}</Text>
                <Text style={st.arFactKey}>{t.results.speechUtterances(speech.utterances)}</Text>
              </View>
            </View>

            <Text style={st.speechNote}>{t.results.speechNote}</Text>
          </View>
        )}

        {/* HISTORIAL DE SESIONES */}
        <View style={st.summaryRow}>
          <Text style={st.summaryLabel}>{t.results.historyLabel}</Text>
          <Text style={st.summaryCount}>{t.results.historyCount(sesiones.length)}</Text>
        </View>

        {historial.map((s, i) => (
          <View key={`${s.date}-${i}`} style={st.histCard}>
            <View style={st.histTop}>
              <View style={st.histCheck}><Text style={st.histCheckText}>✓</Text></View>
              <View style={st.histBody}>
                <View style={st.histTitleRow}>
                  <Text style={st.histName} numberOfLines={1}>{s.name}</Text>
                  <Text style={st.histDate}>🗓 {s.date}</Text>
                </View>
                <View style={st.histScoreRow}>
                  <Text style={st.histStars}>{starString(s.avg)}</Text>
                  <Text style={st.histAvg}>{t.results.average(s.avg.toFixed(1))}</Text>
                </View>
                {/* ES-12 · Cuando la sesión evaluó las dos mecánicas, el
                    promedio único no basta: se muestran separadas. */}
                {!!s.split && (
                  <View style={st.splitRow}>
                    <View style={st.splitChip}>
                      <Text style={st.splitChipKicker}>{t.results.understands}</Text>
                      <Text style={st.splitChipVal}>
                        {s.split.comprension != null ? `${s.split.comprension.toFixed(1)} / 3` : '–'}
                      </Text>
                    </View>
                    <View style={st.splitChip}>
                      <Text style={st.splitChipKicker}>{t.results.produces}</Text>
                      <Text style={st.splitChipVal}>
                        {s.split.produccion != null ? `${s.split.produccion.toFixed(1)} / 3` : '–'}
                      </Text>
                    </View>
                  </View>
                )}
                {!!s.responses?.length && (
                  <View style={st.histResp}>
                    <Text style={st.histRespKicker}>{t.results.responsesKicker}</Text>
                    {s.responses.map((r) => (
                      <Text key={r.code} style={st.histRespText}>
                        <Text style={st.histRespCode}>{r.code} · {r.name}: </Text>“{r.text}”
                      </Text>
                    ))}
                  </View>
                )}
                <View style={st.histNote}>
                  <Text style={st.histNoteText}>{s.note}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Acciones */}
        <Pressable style={({ pressed }) => [st.primaryBtn, pressed && { opacity: 0.92 }]} onPress={() => navigation?.navigate('ExercisePlayer')}>
          <Text style={st.primaryBtnText}>{t.results.newSession}</Text>
        </Pressable>

        <View style={st.actionRow}>
          <Pressable style={st.ghostBtn} onPress={() => navigation?.navigate('ExerciseSelection')}>
            <Text style={st.ghostText}>{t.results.backGhost}</Text>
          </Pressable>
          <Pressable style={st.ghostBtn} onPress={compartir}>
            <Text style={st.ghostText}>{t.results.sharePdf}</Text>
          </Pressable>
        </View>

        <Text style={st.footNote}>{t.results.footNote}</Text>
      </ScrollView>
    </View>
  );
};

const st = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  scroll: { padding: 18, paddingBottom: 36 },

  header: {
    backgroundColor: V.color.primary,
    paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18,
    borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  back: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)', borderRadius: 11,
    paddingVertical: 5, paddingHorizontal: 11, marginBottom: 10,
  },
  backText: { color: '#fff', fontSize: 12, fontWeight: V.font.extrabold },
  logo: { height: 21, width: 92, resizeMode: 'contain', marginBottom: 8 },
  brand: { fontSize: 20, fontWeight: V.font.extrabold, color: '#fff', marginBottom: 8, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: V.font.extrabold, color: '#fff', letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: V.font.semibold },

  card: {
    backgroundColor: V.color.card, borderWidth: 1, borderColor: V.color.border,
    borderRadius: 16, padding: 18, marginBottom: 16, ...V.shadow.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  chip: {
    width: 34, height: 34, borderRadius: 11, backgroundColor: V.color.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 9,
  },
  chipIcon: { fontSize: 16 },
  cardTitle: { fontSize: 17, fontWeight: V.font.extrabold, color: V.color.textPrimary },

  gameStatsRow: { flexDirection: 'row', gap: 9, marginTop: 15 },
  gameStat: { flex: 1, backgroundColor: '#f7fafa', borderWidth: 1, borderColor: '#eef3f3', borderRadius: 13, paddingVertical: 12, alignItems: 'center' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  gameStatBig: { fontSize: 18, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  gameStatLbl: { fontSize: 10.5, fontWeight: V.font.bold, color: V.color.textMuted, marginTop: 3 },
  gameLevelRow: { marginTop: 14 },
  gameLevelLbl: { fontSize: 13, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  gameLevelTrack: { height: 10, backgroundColor: '#eef3f3', borderRadius: 6, overflow: 'hidden', marginTop: 7 },
  gameLevelFill: { height: '100%', backgroundColor: V.color.primary, borderRadius: 6 },
  gameLevelToGo: { fontSize: 11, fontWeight: V.font.bold, color: V.color.textMuted, marginTop: 5 },
  gameBadgesLbl: { fontSize: 11, fontWeight: V.font.extrabold, letterSpacing: 0.5, color: V.color.textMuted, marginTop: 16, marginBottom: 9 },
  gameBadgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gameBadge: { width: '31%', backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#f4e6b8', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 6, alignItems: 'center' },
  gameBadgeOff: { backgroundColor: '#f7fafa', borderColor: '#eef3f3' },
  gameBadgeName: { fontSize: 10, fontWeight: V.font.extrabold, color: '#92711a', marginTop: 5 },

  adherenceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  ringWrap: { width: 104, height: 104, marginRight: 18 },
  ringCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ringPct: { fontSize: 25, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  ringRatio: { fontSize: 11, fontWeight: V.font.bold, color: V.color.textMuted, marginTop: 2 },
  adherenceBody: { flex: 1 },
  adherenceLabel: { fontSize: 13.5, fontWeight: V.font.bold, color: '#6b7280' },
  adherenceValue: { fontSize: 15, fontWeight: V.font.extrabold, color: V.color.textPrimary, marginTop: 3, marginBottom: 12 },
  barTrack: { height: 10, backgroundColor: '#eef3f3', borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: V.color.primary, borderRadius: 6 },
  weekDots: { flexDirection: 'row', marginTop: 11, gap: 6 },
  weekDot: { flex: 1, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  weekDotOn: { backgroundColor: V.color.primary },
  weekDotOff: { backgroundColor: '#eef3f3' },
  weekDotMark: { fontSize: 12, fontWeight: V.font.extrabold, color: '#fff' },

  evoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  trendPill: { backgroundColor: V.color.primaryLight, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 9 },
  trendText: { fontSize: 12, fontWeight: V.font.extrabold, color: V.color.primary },
  evoSub: { fontSize: 12.5, fontWeight: V.font.semibold, color: V.color.textMuted, marginBottom: 6 },

  // Realidad Aumentada
  arTabs: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  arTab: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: '#f1f5f4' },
  arTabOn: { backgroundColor: V.color.primary },
  arTabTxt: { fontSize: 11.5, fontWeight: V.font.extrabold, color: V.color.textMuted, letterSpacing: 0.3 },
  arTabTxtOn: { color: '#fff' },
  arEmpty: { fontSize: 12.5, fontWeight: V.font.semibold, color: V.color.textMuted, lineHeight: 18, paddingVertical: 14 },
  arFacts: { flexDirection: 'row', gap: 8, marginTop: 10 },
  arFact: { flex: 1, backgroundColor: V.color.pageBg, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  arFactVal: { fontSize: 16, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  arFactKey: { fontSize: 10, fontWeight: V.font.bold, color: V.color.textMuted, marginTop: 2, textAlign: 'center' },
  arDevice: { fontSize: 10.5, fontWeight: V.font.semibold, color: V.color.textMuted, marginTop: 10, lineHeight: 15 },
  // La tarjeta del recuento NO se pinta como las clínicas: fondo apagado, sin
  // sombra y con el número en gris. Un apoyo del ejercicio no puede tener el
  // mismo peso visual que la evolución por estrellas, porque lo que la gente
  // recuerda de un panel es lo que destaca.
  aidCard: {
    backgroundColor: '#f7fafa',
    borderWidth: 1,
    borderColor: '#e7eeee',
    shadowOpacity: 0,
    elevation: 0,
  },
  aidTitle: { color: V.color.textSecondary },
  aidVal: { color: V.color.textSecondary },
  // La advertencia va enmarcada, no como pie de foto: es lo que evita que el
  // número acabe copiado en un informe como si midiera algo.
  speechNote: {
    fontSize: 10.5, fontWeight: V.font.semibold, color: '#92711a', lineHeight: 15,
    backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#f4e6b8',
    borderRadius: 11, padding: 10, marginTop: 12,
  },

  pmChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10, marginTop: 4 },
  pmChip: { backgroundColor: '#f7fafa', borderWidth: 1, borderColor: '#eef3f3', borderRadius: 10, paddingHorizontal: 11, paddingVertical: 6 },
  pmChipOn: { backgroundColor: V.color.primaryLight, borderColor: V.color.borderActive },
  pmChipTxt: { fontSize: 12.5, fontWeight: V.font.extrabold, color: V.color.textMuted },
  pmChipTxtOn: { color: V.color.primaryDark },

  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 4, marginBottom: 12 },
  summaryLabel: { fontSize: 12.5, fontWeight: V.font.extrabold, color: V.color.textMuted, letterSpacing: 0.4 },
  summaryCount: { fontSize: 12.5, fontWeight: V.font.extrabold, color: V.color.primary },

  histCard: {
    backgroundColor: V.color.card, borderWidth: 1, borderColor: V.color.border,
    borderRadius: 15, paddingHorizontal: 15, paddingVertical: 14, marginBottom: 10, ...V.shadow.card,
  },
  histTop: { flexDirection: 'row', alignItems: 'flex-start' },
  histCheck: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: V.color.successBg,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  histCheckText: { fontSize: 18, fontWeight: V.font.extrabold, color: V.color.success },
  histBody: { flex: 1 },
  histTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  histName: { flex: 1, fontSize: 15, fontWeight: V.font.extrabold, color: V.color.textPrimary, marginRight: 8 },
  histDate: { fontSize: 11.5, fontWeight: V.font.bold, color: V.color.textMuted },
  histScoreRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  histStars: { fontSize: 13, letterSpacing: 1, color: '#f5b301', marginRight: 8 },
  histAvg: { fontSize: 12.5, fontWeight: V.font.extrabold, color: V.color.textSecondary },

  // Desglose comprensión / producción (ES-12)
  splitRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  splitChip: { flex: 1, borderWidth: 1, borderColor: V.color.border, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 9, backgroundColor: '#fbfbfb' },
  splitChipKicker: { fontSize: 9.5, fontWeight: V.font.extrabold, color: V.color.textMuted, letterSpacing: 0.4 },
  splitChipVal: { fontSize: 14, fontWeight: V.font.extrabold, color: V.color.textPrimary, marginTop: 2 },
  histResp: {
    marginTop: 8, backgroundColor: '#fffdf5', borderWidth: 1, borderColor: '#f0e6c8',
    borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10,
  },
  histRespKicker: { fontSize: 10, fontWeight: V.font.extrabold, letterSpacing: 0.5, color: '#92711a', marginBottom: 4 },
  histRespText: { fontSize: 12, fontWeight: V.font.semibold, color: V.color.textSecondary, lineHeight: 17 },
  histRespCode: { fontWeight: V.font.extrabold, color: V.color.textPrimary },
  histNote: {
    marginTop: 9, backgroundColor: '#f7fafa', borderLeftWidth: 3, borderLeftColor: V.color.primary,
    borderTopRightRadius: 9, borderBottomRightRadius: 9, paddingHorizontal: 11, paddingVertical: 8,
  },
  histNoteText: { fontSize: 12.5, fontWeight: V.font.semibold, color: V.color.textSecondary, lineHeight: 17 },

  primaryBtn: {
    marginTop: 14, backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', ...V.shadow.button,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: V.font.extrabold },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  ghostBtn: {
    flex: 1, backgroundColor: V.color.card, borderWidth: 1, borderColor: V.color.borderActive,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center', ...V.shadow.card,
  },
  ghostText: { color: V.color.primaryDark, fontSize: 14.5, fontWeight: V.font.extrabold },

  footNote: { textAlign: 'center', color: V.color.textMuted, fontSize: 11.5, fontWeight: V.font.semibold, marginTop: 14, paddingHorizontal: 14 },
});

export default ValeriaPatientResultsDashboardScreen;

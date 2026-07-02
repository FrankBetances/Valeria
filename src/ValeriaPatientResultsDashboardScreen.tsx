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
import { loadGame, liveStreak, levelFor, levelName, levelProgress, xpToNext, BADGES, GameState } from './valeriaGamification';
// import logoWhite from '../../assets/valeria-logo-white.png';

interface Sesion {
  date: string;
  name: string;
  avg: number;       // 1.0 – 3.0 (estrellas)
  completed: boolean;
  note: string;
}

const META_SEMANAL = 5;
const PATIENT_LINE = 'Lucía M. · NHC HC-204815';

const HISTORIAL_DEFECTO: Sesion[] = [
  { date: '10 jun', name: 'Asociación vocal inicial',    avg: 1.8, completed: true, note: 'Le costó arrancar, pero acabó asociando las vocales con apoyo.' },
  { date: '12 jun', name: 'Detección del intruso',       avg: 2.0, completed: true, note: 'Buena sesión, encontró el intruso tras la pregunta guía.' },
  { date: '15 jun', name: 'Reconocimiento de emociones', avg: 2.4, completed: true, note: 'Muy concentrado hoy, nombró casi todas las emociones.' },
  { date: '17 jun', name: 'Estructura S-V-O',            avg: 2.5, completed: true, note: 'Construyó frases completas con los dados, gran avance.' },
  { date: '19 jun', name: 'Sesión de terapia',           avg: 2.6, completed: true, note: 'Excelente. Respondió las consignas casi sin ayuda.' },
];

/* Geometría del gráfico de línea */
const CHART = { W: 320, H: 178, padL: 32, padR: 12, padT: 14, padB: 36, yMin: 1, yMax: 3 };
const plotW = CHART.W - CHART.padL - CHART.padR;
const plotH = CHART.H - CHART.padT - CHART.padB;
const yFor = (v: number) => CHART.padT + ((CHART.yMax - v) / (CHART.yMax - CHART.yMin)) * plotH;
const xFor = (i: number, total: number) =>
  CHART.padL + (total <= 1 ? plotW / 2 : (i / (total - 1)) * plotW);

const starString = (avg: number): string => {
  const full = Math.round(avg);
  return '★★★☆☆☆'.slice(3 - full, 6 - full);
};

export const ValeriaPatientResultsDashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [sesiones, setSesiones] = useState<Sesion[]>(HISTORIAL_DEFECTO);
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    (async () => {
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
    const trend = diff > 0 ? `▲ +${diff} ★` : diff < 0 ? `▼ ${diff} ★` : '= estable';
    return { puntos: pts, linePoints: line, areaPoints: area, trendLabel: trend };
  }, [sesiones]);

  const historial = useMemo(() => sesiones.slice().reverse(), [sesiones]);

  const compartir = async () => {
    const lineas = sesiones
      .map((s) => `• ${s.date} · ${s.name} — ${s.avg.toFixed(1)}/3 ${starString(s.avg)}`)
      .join('\n');
    try {
      await Share.share({
        title: 'Resultados Valeria+',
        message:
          `VALERIA+ · Resultados y Evolución\n${PATIENT_LINE}\n\n` +
          `Adherencia semanal: ${pct}% (${done}/${META_SEMANAL})\n` +
          `Tendencia: ${trendLabel}\n\nHistorial de sesiones:\n${lineas}\n\n` +
          `Informe local-first generado en el dispositivo.`,
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
          <Text style={st.backText}>‹ Volver a ejercicios</Text>
        </Pressable>
        {/* <Image source={logoWhite} style={st.logo} /> */}
        <Text style={st.brand}>valeria</Text>
        <Text style={st.title}>Resultados y Evolución</Text>
        <Text style={st.subtitle}>{PATIENT_LINE}</Text>
      </View>

      <ScrollView style={st.flex} contentContainerStyle={st.scroll} showsVerticalScrollIndicator={false}>
        {/* PROGRESO GAMIFICADO: racha, nivel y logros */}
        {game && (
          <View style={st.card}>
            <View style={st.cardHeader}>
              <View style={st.chip}><Text style={st.chipIcon}>🏅</Text></View>
              <Text style={st.cardTitle}>Motivación y logros</Text>
            </View>

            <View style={st.gameStatsRow}>
              <View style={st.gameStat}>
                <Text style={st.gameStatBig}>🔥 {liveStreak(game)}</Text>
                <Text style={st.gameStatLbl}>racha actual</Text>
              </View>
              <View style={st.gameStat}>
                <Text style={st.gameStatBig}>⭐ {game.xp}</Text>
                <Text style={st.gameStatLbl}>XP total</Text>
              </View>
              <View style={st.gameStat}>
                <Text style={st.gameStatBig}>🏆 {game.bestStreak}</Text>
                <Text style={st.gameStatLbl}>mejor racha</Text>
              </View>
            </View>

            <View style={st.gameLevelRow}>
              <Text style={st.gameLevelLbl}>Nivel {levelFor(game.xp)} · {levelName(levelFor(game.xp))}</Text>
              <View style={st.gameLevelTrack}>
                <View style={[st.gameLevelFill, { width: `${Math.round(levelProgress(game.xp) * 100)}%` }]} />
              </View>
              <Text style={st.gameLevelToGo}>{xpToNext(game.xp)} XP para el siguiente nivel</Text>
            </View>

            <Text style={st.gameBadgesLbl}>INSIGNIAS · {game.badges.length}/{BADGES.length}</Text>
            <View style={st.gameBadgesGrid}>
              {BADGES.map((b) => {
                const won = game.badges.includes(b.id);
                return (
                  <View key={b.id} style={[st.gameBadge, !won && st.gameBadgeOff]}>
                    <Text style={{ fontSize: 22, opacity: won ? 1 : 0.35 }}>{b.icon}</Text>
                    <Text style={[st.gameBadgeName, !won && { color: '#c2cbca' }]} numberOfLines={1}>{b.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ADHERENCIA SEMANAL */}
        <View style={st.card}>
          <View style={st.cardHeader}>
            <View style={st.chip}><Text style={st.chipIcon}>📊</Text></View>
            <Text style={st.cardTitle}>Adherencia semanal</Text>
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
              <Text style={st.adherenceLabel}>Adherencia de la semana</Text>
              <Text style={st.adherenceValue}>{done} de {META_SEMANAL} sesiones completadas</Text>
              <View style={st.barTrack}>
                <View style={[st.barFill, { width: `${pct}%` }]} />
              </View>
              <View style={st.weekDots}>
                {Array.from({ length: META_SEMANAL }).map((_, i) => {
                  const on = i < done;
                  return (
                    <View key={i} style={[st.weekDot, on ? st.weekDotOn : st.weekDotOff]}>
                      {on ? <Text style={st.weekDotMark}>✓</Text> : null}
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
              <Text style={st.cardTitle}>Evolución por estrellas</Text>
            </View>
            <View style={st.trendPill}><Text style={st.trendText}>{trendLabel}</Text></View>
          </View>
          <Text style={st.evoSub}>Promedio de estrellas · últimas {puntos.length} sesiones</Text>

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

        {/* HISTORIAL DE SESIONES */}
        <View style={st.summaryRow}>
          <Text style={st.summaryLabel}>HISTORIAL DE SESIONES</Text>
          <Text style={st.summaryCount}>{sesiones.length} registradas</Text>
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
                  <Text style={st.histAvg}>Promedio: {s.avg.toFixed(1)} / 3</Text>
                </View>
                <View style={st.histNote}>
                  <Text style={st.histNoteText}>{s.note}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Acciones */}
        <Pressable style={({ pressed }) => [st.primaryBtn, pressed && { opacity: 0.92 }]} onPress={() => navigation?.navigate('ExercisePlayer')}>
          <Text style={st.primaryBtnText}>Iniciar nueva sesión →</Text>
        </Pressable>

        <View style={st.actionRow}>
          <Pressable style={st.ghostBtn} onPress={() => navigation?.navigate('ExerciseSelection')}>
            <Text style={st.ghostText}>↩ Volver a ejercicios</Text>
          </Pressable>
          <Pressable style={st.ghostBtn} onPress={compartir}>
            <Text style={st.ghostText}>📄 Compartir PDF</Text>
          </Pressable>
        </View>

        <Text style={st.footNote}>Historial almacenado únicamente en este dispositivo (local-first).</Text>
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

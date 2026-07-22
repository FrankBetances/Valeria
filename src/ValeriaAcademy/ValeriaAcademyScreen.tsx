// ============================================================================
// Valeria+ · Academy — Pantalla principal (V2.0 · HUB MULTIDOMINIO)
// Vistas internas (sin anidar navegación profunda):
//   'hub'   → Feed de Prioridad + grid/stack de 5 Tarjetas de Dominio.
//   'list'  → catálogo de cápsulas de UN dominio.
//   'read'  → lectura por diapositivas de la cápsula.
//   'quiz'  → validación ágil (micro-quiz con feedback inmediato).
// Hipoacusia abre un BottomSheet in-place (no cambia de vista).
// Al aprobar el quiz / marcar una guía, la XP se inyecta en el silo del dominio
// de origen (academyStore) y el hub refleja el avance en tiempo real.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { V } from '../valeriaTheme';
import { ACADEMY_CAPSULES, ACADEMY_PASS_THRESHOLD, TRACK_ACCENT } from './academyContent';
import { ACADEMY_DOMAINS, DOMAIN_META } from './academyDomains';
import {
  completeCapsule,
  getResults,
  hydrateAcademy,
  useAcademySummary,
} from './academyStore';
import { AcademyBadge, AcademyCapsule, AcademyDomain } from './academyTypes';
import { AcademyDomainCard } from './AcademyDomainCard';
import { AcademyPriorityFeed } from './AcademyPriorityFeed';
import { HipoacusiaBottomSheet } from './HipoacusiaBottomSheet';

type View4 = 'hub' | 'list' | 'read' | 'quiz';

interface Accent { bg: string; fg: string; label: string }

// Acento de una cápsula: color por su dominio; etiqueta con el eje temático en
// Lenguaje (subfamilia) o el nombre del dominio en el resto.
const accentFor = (c: AcademyCapsule): Accent => {
  const dm = DOMAIN_META[c.domain];
  const label = c.domain === 'lenguaje' ? TRACK_ACCENT[c.track].label : dm.label.toUpperCase();
  return { bg: dm.accentBg, fg: dm.accentFg, label };
};

export const ValeriaAcademyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const summary = useAcademySummary();
  const [view, setView] = useState<View4>('hub');
  const [activeDomain, setActiveDomain] = useState<AcademyDomain>('lenguaje');
  const [capsule, setCapsule] = useState<AcademyCapsule | null>(null);
  const [hipoOpen, setHipoOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { hydrateAcademy(); }, []);

  const results = getResults();
  const bump = () => setRefreshKey((k) => k + 1);

  const openCapsule = (c: AcademyCapsule) => { setCapsule(c); setView('read'); };
  const backToHub = () => { setView('hub'); setCapsule(null); bump(); };
  const backToList = () => { setView('list'); setCapsule(null); bump(); };

  const onPickDomain = (domain: AcademyDomain) => {
    if (domain === 'hipoacusia') { setHipoOpen(true); return; }
    setActiveDomain(domain);
    setView('list');
  };

  // ------------------------------------------------------------------ HUB
  if (view === 'hub') {
    const pct = Math.round(summary.progress * 100);
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <Pressable onPress={() => navigation.goBack()} style={s.backPill}>
            <Text style={s.backPillTxt}>‹ Volver</Text>
          </Pressable>
          <Text style={s.logoFallback}>valeria+ · academy</Text>
          <Text style={s.headerTitle}>🎓 Academy</Text>
          <Text style={s.headerSub}>Tu hub de formación por dominios para acompañar la terapia como un profesional.</Text>

          <View style={s.hProgress}>
            <View style={s.hProgressTrack}>
              <View style={[s.hProgressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={s.hProgressTxt}>{summary.completedCount}/{summary.totalCount} · {pct}%</Text>
          </View>
          <View style={s.gameRow}>
            <View style={s.gameChip}><Text style={s.gameChipTxt}>✨ {summary.xp} XP</Text></View>
            <View style={s.gameChip}><Text style={s.gameChipTxt}>🎖️ {summary.badgeCount} insignias</Text></View>
          </View>

          <AcademyPriorityFeed onOpenCapsule={openCapsule} refreshKey={refreshKey} />
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.listLabel}>DOMINIOS DE CAPACITACIÓN</Text>
          {ACADEMY_DOMAINS.map((d) => (
            <AcademyDomainCard key={d} domain={d} onPress={onPickDomain} />
          ))}
          <View style={{ height: 12 }} />
        </ScrollView>

        <HipoacusiaBottomSheet visible={hipoOpen} onClose={() => { setHipoOpen(false); bump(); }} onCompleted={bump} />
      </View>
    );
  }

  // ------------------------------------------------------------------ LISTA
  if (view === 'list' || !capsule) {
    const meta = DOMAIN_META[activeDomain];
    const capsules = ACADEMY_CAPSULES.filter((c) => c.domain === activeDomain);
    return (
      <View style={s.flex}>
        <View style={[s.header, { backgroundColor: meta.accentFg }]}>
          <Pressable onPress={backToHub} style={s.backPill}>
            <Text style={s.backPillTxt}>‹ Dominios</Text>
          </Pressable>
          <Text style={s.logoFallback}>ACADEMY · {meta.label.toUpperCase()}</Text>
          <Text style={s.headerTitle}>{meta.icon} {meta.label}</Text>
          <Text style={s.headerSub}>{meta.blurb}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.listLabel}>CÁPSULAS DE CONOCIMIENTO</Text>
          {capsules.length === 0 && (
            <View style={s.emptyCard}>
              <Text style={s.emptyTxt}>Contenido de este dominio en preparación. Muy pronto tendrás cápsulas aquí.</Text>
            </View>
          )}
          {capsules.map((c) => {
            const done = !!results[c.id];
            const accent = accentFor(c);
            return (
              <Pressable
                key={c.id}
                onPress={() => openCapsule(c)}
                style={[s.capCard, done && { borderColor: V.color.borderActive }]}
                accessibilityRole="button"
                accessibilityLabel={`Cápsula ${c.title}. ${done ? 'Completada' : 'Pendiente'}.`}
              >
                <View style={[s.capIcon, { backgroundColor: accent.bg }]}>
                  <Text style={{ fontSize: 22 }}>{c.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.capTrack, { color: accent.fg }]}>{accent.label}</Text>
                  <Text style={s.capTitle}>{c.title}</Text>
                  <Text style={s.capSummary}>{c.summary}</Text>
                  <Text style={s.capMeta}>⏱️ {c.minutes} min · ✨ {c.xp} XP</Text>
                </View>
                <View style={[s.capState, done ? s.capStateDone : { backgroundColor: accent.bg }]}>
                  <Text style={[s.capStateTxt, { color: done ? '#fff' : accent.fg }]}>{done ? '✓' : '›'}</Text>
                </View>
              </Pressable>
            );
          })}
          <View style={{ height: 12 }} />
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------------- LECTURA / QUIZ
  const accent = accentFor(capsule);
  return view === 'read'
    ? <CapsuleReader capsule={capsule} accent={accent} onExit={backToList} onFinish={() => setView('quiz')} />
    : <CapsuleQuiz capsule={capsule} accent={accent} onExit={backToList} onDone={backToList} />;
};

// ---------------------------------------------------------------------------
// Lectura por diapositivas
// ---------------------------------------------------------------------------
const CapsuleReader: React.FC<{
  capsule: AcademyCapsule; accent: Accent; onExit: () => void; onFinish: () => void;
}> = ({ capsule, accent, onExit, onFinish }) => {
  const [i, setI] = useState(0);
  const slide = capsule.slides[i];
  const last = i + 1 >= capsule.slides.length;

  return (
    <View style={s.flex}>
      <View style={[s.header, { backgroundColor: accent.fg }]}>
        <Pressable onPress={onExit} style={s.backPill}><Text style={s.backPillTxt}>‹ Cápsulas</Text></Pressable>
        <Text style={s.logoFallback}>{accent.label}</Text>
        <Text style={s.headerTitle}>{capsule.icon} {capsule.title}</Text>
        <View style={s.dots}>
          {capsule.slides.map((_, k) => (
            <View key={k} style={[s.dot, { backgroundColor: k <= i ? '#fff' : 'rgba(255,255,255,.4)' }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.slideCard}>
          {!!slide.icon && <Text style={s.slideEmoji}>{slide.icon}</Text>}
          <Text style={s.slideHeading}>{slide.heading}</Text>
          <Text style={s.slideBody}>{slide.body}</Text>
        </View>
      </ScrollView>

      <View style={s.footer}>
        {i > 0 && (
          <Pressable onPress={() => setI(i - 1)} style={s.secondaryBtn}>
            <Text style={s.secondaryBtnTxt}>‹ Atrás</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => (last ? onFinish() : setI(i + 1))}
          style={[s.primaryBtn, { backgroundColor: accent.fg, flex: 1 }]}
          accessibilityRole="button"
        >
          <Text style={s.primaryBtnTxt}>{last ? 'Hacer el quiz →' : 'Siguiente ›'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Micro-quiz de validación ágil
// ---------------------------------------------------------------------------
const CapsuleQuiz: React.FC<{
  capsule: AcademyCapsule; accent: Accent; onExit: () => void; onDone: () => void;
}> = ({ capsule, accent, onExit, onDone }) => {
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [reward, setReward] = useState<{ xpGained: number; newBadges: AcademyBadge[]; passed: boolean } | null>(null);

  const q = capsule.quiz[qi];
  const lastQ = qi + 1 >= capsule.quiz.length;

  const answer = (idx: number) => {
    if (picked != null) return;
    setPicked(idx);
    if (idx === q.answer) setCorrect((c) => c + 1);
  };

  const next = async () => {
    if (!lastQ) { setQi(qi + 1); setPicked(null); return; }
    const score = capsule.quiz.length ? correct / capsule.quiz.length : 1;
    const passed = score >= ACADEMY_PASS_THRESHOLD;
    if (passed) {
      const r = await completeCapsule(capsule.id, score);
      setReward({ xpGained: r.xpGained, newBadges: r.newBadges, passed: true });
    } else {
      setReward({ xpGained: 0, newBadges: [], passed: false });
    }
    setFinished(true);
  };

  const retry = () => { setQi(0); setPicked(null); setCorrect(0); setFinished(false); setReward(null); };

  // -------- Resultado final --------
  if (finished && reward) {
    const score = Math.round((correct / capsule.quiz.length) * 100);
    return (
      <View style={s.flex}>
        <View style={[s.header, { backgroundColor: accent.fg }]}>
          <Text style={s.logoFallback}>{accent.label}</Text>
          <Text style={s.headerTitle}>{reward.passed ? '🎉 ¡Cápsula superada!' : '💪 Casi lo tienes'}</Text>
        </View>
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.resultCard}>
            <Text style={[s.resultScore, { color: accent.fg }]}>{score}%</Text>
            <Text style={s.resultSub}>
              {reward.passed
                ? `Has completado "${capsule.title}".`
                : `Necesitas al menos ${Math.round(ACADEMY_PASS_THRESHOLD * 100)}% para superarla. ¡Repasa y vuelve a intentarlo!`}
            </Text>
            {reward.xpGained > 0 && <Text style={s.resultXp}>+{reward.xpGained} XP</Text>}
            {reward.newBadges.map((b) => (
              <View key={b.id} style={s.badgeRow}>
                <Text style={{ fontSize: 22 }}>{b.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.badgeName}>{b.name}</Text>
                  <Text style={s.badgeDesc}>{b.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={s.footer}>
          {!reward.passed && (
            <Pressable onPress={retry} style={s.secondaryBtn}><Text style={s.secondaryBtnTxt}>Reintentar</Text></Pressable>
          )}
          <Pressable onPress={onDone} style={[s.primaryBtn, { backgroundColor: accent.fg, flex: 1 }]}>
            <Text style={s.primaryBtnTxt}>{reward.passed ? 'Volver a las cápsulas' : 'Salir'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // -------- Pregunta --------
  return (
    <View style={s.flex}>
      <View style={[s.header, { backgroundColor: accent.fg }]}>
        <Pressable onPress={onExit} style={s.backPill}><Text style={s.backPillTxt}>‹ Salir</Text></Pressable>
        <Text style={s.logoFallback}>QUIZ RÁPIDO · {qi + 1}/{capsule.quiz.length}</Text>
        <Text style={s.headerTitle}>{capsule.icon} {capsule.title}</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.qPrompt}>{q.prompt}</Text>
        {q.options.map((opt, idx) => {
          const isAnswer = idx === q.answer;
          const isPicked = idx === picked;
          const show = picked != null;
          const style = [
            s.opt,
            show && isAnswer && s.optCorrect,
            show && isPicked && !isAnswer && s.optWrong,
          ];
          return (
            <Pressable key={idx} onPress={() => answer(idx)} disabled={show} style={style} accessibilityRole="button">
              <Text style={[s.optTxt, show && isAnswer && { color: V.color.success }, show && isPicked && !isAnswer && { color: V.color.error }]}>
                {opt}
              </Text>
              {show && isAnswer && <Text style={s.optMark}>✓</Text>}
              {show && isPicked && !isAnswer && <Text style={[s.optMark, { color: V.color.error }]}>✕</Text>}
            </Pressable>
          );
        })}
        {picked != null && (
          <View style={s.rationale}>
            <Text style={s.rationaleTxt}>💡 {q.rationale}</Text>
          </View>
        )}
      </ScrollView>
      <View style={s.footer}>
        <Pressable
          onPress={next}
          disabled={picked == null}
          style={[s.primaryBtn, { backgroundColor: accent.fg, flex: 1 }, picked == null && { opacity: 0.4 }]}
        >
          <Text style={s.primaryBtnTxt}>{lastQ ? 'Ver resultado' : 'Siguiente pregunta ›'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 18, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  logoFallback: { color: 'rgba(255,255,255,.9)', fontWeight: '800', fontSize: 11.5, letterSpacing: 1, marginBottom: 6 },
  backPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10 },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  headerTitle: { color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: '600', marginTop: 4, lineHeight: 18 },

  hProgress: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  hProgressTrack: { flex: 1, height: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,.28)', overflow: 'hidden' },
  hProgressFill: { height: 8, borderRadius: 5, backgroundColor: '#fff' },
  hProgressTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  gameRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  gameChip: { backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 6 },
  gameChipTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },

  scroll: { padding: 18, paddingBottom: 28 },
  listLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.5, marginBottom: 12, marginHorizontal: 2 },

  emptyCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 18, marginBottom: 11 },
  emptyTxt: { fontSize: 13.5, fontWeight: '600', color: V.color.textMuted, lineHeight: 20, textAlign: 'center' },

  capCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 14, marginBottom: 11, ...V.shadow.card },
  capIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  capTrack: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.6, marginBottom: 2 },
  capTitle: { fontSize: 15.5, fontWeight: '800', color: V.color.textPrimary },
  capSummary: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, marginTop: 2, lineHeight: 16 },
  capMeta: { fontSize: 11, fontWeight: '700', color: V.color.textMuted, marginTop: 6 },
  capState: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  capStateDone: { backgroundColor: V.color.success },
  capStateTxt: { fontSize: 15, fontWeight: '800' },

  dots: { flexDirection: 'row', gap: 6, marginTop: 12 },
  dot: { width: 22, height: 5, borderRadius: 3 },

  slideCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 18, padding: 20, ...V.shadow.card },
  slideEmoji: { fontSize: 46, textAlign: 'center', marginBottom: 6 },
  slideHeading: { fontSize: 19, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center', marginTop: 6 },
  slideBody: { fontSize: 14.5, fontWeight: '600', color: V.color.textSecondary, lineHeight: 22, marginTop: 12, textAlign: 'center' },

  footer: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 22, backgroundColor: V.color.pageBg },
  primaryBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn: { borderRadius: 14, paddingVertical: 15, paddingHorizontal: 18, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border },
  secondaryBtnTxt: { color: V.color.textSecondary, fontSize: 15, fontWeight: '800' },

  qPrompt: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary, lineHeight: 24, marginBottom: 16 },
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1.5, borderColor: V.color.border, borderRadius: 14, padding: 15, marginBottom: 10 },
  optCorrect: { borderColor: V.color.success, backgroundColor: V.color.successBg },
  optWrong: { borderColor: V.color.error, backgroundColor: V.color.errorBg },
  optTxt: { flex: 1, fontSize: 14.5, fontWeight: '700', color: V.color.textPrimary },
  optMark: { fontSize: 16, fontWeight: '800', color: V.color.success, marginLeft: 8 },
  rationale: { backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 13, padding: 13, marginTop: 4 },
  rationaleTxt: { fontSize: 13, fontWeight: '700', color: V.color.textSecondary, lineHeight: 18 },

  resultCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 20, padding: 24, alignItems: 'center', ...V.shadow.card },
  resultScore: { fontSize: 48, fontWeight: '800' },
  resultSub: { fontSize: 14, fontWeight: '600', color: V.color.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  resultXp: { fontSize: 16, fontWeight: '800', color: V.color.star, marginTop: 14 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch', backgroundColor: V.color.pageBg, borderRadius: 14, padding: 13, marginTop: 12 },
  badgeName: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },
  badgeDesc: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, marginTop: 2 },
});

export default ValeriaAcademyScreen;

// ============================================================================
// Valeria+ · Academy — Pantalla principal (V2.0 · HUB MULTIDOMINIO)
// Vistas internas (sin anidar navegación profunda):
//   'hub'   → Siguiente paso (1 cápsula) + stack de Tarjetas de Dominio.
//   'list'  → catálogo de cápsulas de UN dominio.
//   'read'  → lectura por diapositivas de la cápsula.
//   'quiz'  → validación ágil (micro-quiz con feedback inmediato).
// Hipoacusia abre un BottomSheet in-place (no cambia de vista).
// Al aprobar el quiz / marcar una guía, la XP se inyecta en el silo del dominio
// de origen (academyStore) y el hub refleja el avance en tiempo real.
// ============================================================================
import { ScreenHeader } from '../ui/ScreenHeader';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { V } from '../valeriaTheme';
import { useT } from '../i18n';
import { ACADEMY_CAPSULES, ACADEMY_PASS_THRESHOLD, trackAccentFor, capsulesForUiLang } from './academyContent';
import { ACADEMY_DOMAINS, domainMetaFor, domainLevelName } from './academyDomains';
import {
  completeCapsule,
  getResults,
  hydrateAcademy,
  useAcademySummary,
} from './academyStore';
import { AcademyBadge, AcademyCapsule, AcademyDomain } from './academyTypes';
import { AcademyDomainCard } from './AcademyDomainCard';
import { AcademyNextStep } from './AcademyNextStep';
import { ListRow } from '../ui/ListRow';
import { HipoacusiaBottomSheet } from './HipoacusiaBottomSheet';
import { SignAlphabetChart, SignFigure } from './AcademySignosSvg';
import { BlockIcon } from '../ValeriaBlockIcons';
import { CatPixel } from '../ValeriaCatPixel';
import { getUiLang } from '../valeriaUiLang';
import { isFallingBack } from '../i18n/uiLangFallback';
import { FONT } from '../ui/fonts';

type View4 = 'hub' | 'list' | 'read' | 'quiz';

interface Accent { bg: string; fg: string; label: string }

// Acento de una cápsula: color por su dominio; etiqueta con el eje temático en
// Lenguaje (subfamilia) o el nombre del dominio en el resto. Mitos también usa
// su eje: «¿MITO O REALIDAD?» anticipa de qué va la cápsula, mientras que
// repetir el nombre del dominio no añade nada a la cabecera que ya lo dice.
const accentFor = (c: AcademyCapsule): Accent => {
  const lang = getUiLang();
  const dm = domainMetaFor(c.domain, lang);
  const label = c.domain === 'lenguaje' || c.track === 'mitos'
    ? trackAccentFor(c.track, lang).label
    : dm.label.toUpperCase();
  return { bg: dm.accentBg, fg: dm.accentFg, label };
};

export const ValeriaAcademyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const summary = useAcademySummary();
  const [view, setView] = useState<View4>('hub');
  const [activeDomain, setActiveDomain] = useState<AcademyDomain>('lenguaje');
  const [capsule, setCapsule] = useState<AcademyCapsule | null>(null);
  const [hipoOpen, setHipoOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => { hydrateAcademy(); }, []);

  // [v11 · Sprint 3.5] Academy es a la vez una ruta del stack clásico y una
  // PESTAÑA de la interfaz v11. Como pestaña no debe llevar botón «atrás»: no
  // hay adónde volver, y `goBack()` haría algo distinto de lo que anuncia
  // —con backBehavior 'firstRoute' saltaría a Terapias, y desde la ruta
  // inicial burbujearía al stack y saldría de ExerciseSelection entera—.
  // El navegador al que pertenece la pantalla lo dice él mismo, así que la
  // píldora se oculta sola sin necesidad de prop ni de leer el feature flag.
  const inTabs = navigation?.getState?.()?.type === 'tab';

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
        <ScreenHeader onBack={inTabs ? undefined : () => navigation.goBack()} backLabel={t.academy.back.replace(/^‹\s*/, '')}
          kicker="valeria+ · academy" icon="tabAcademy" title={t.academy.headerTitle}
          trailing={<View style={s.luaBadge}><CatPixel size={54} pose="head" /></View>}>
          {/* El reclamo es para quien llega por primera vez. A quien ya ha
              leído una cápsula le ocupaba dos líneas de cabecera para contarle
              lo que ya sabe, y empujaba el catálogo fuera de la pantalla. */}
          {summary.completedCount === 0 && <Text style={s.headerSub}>{t.academy.headerSub}</Text>}
          {/* El contenido formativo no existe todavía en todos los idiomas de
              interfaz (ver src/i18n/uiLangFallback.ts). Cuando se sirve en otro,
              se DICE aquí: media Academy en catalán y media en castellano sin
              avisar es exactamente lo que este aviso existe para evitar. */}
          {isFallingBack('academy', getUiLang())
            ? <Text style={s.langNotice}>{t.academy.langFallbackNotice}</Text>
            : null}

          <View style={s.hProgress}>
            <View style={s.hProgressTrack}>
              <View style={[s.hProgressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={s.hProgressTxt}>{t.academy.progressTxt(summary.completedCount, summary.totalCount, pct)}</Text>
          </View>
          {/* XP e insignias en una línea de texto, no en dos píldoras con borde:
              es un marcador, no un botón, y con la píldora parecía pulsable. */}
          <View style={s.gameRow}>
            <BlockIcon name="level" color="rgba(255,255,255,.9)" size={13} />
            <Text style={s.gameTxt}>{t.academy.xpTxt(summary.xp)} · {t.academy.badgesTxt(summary.badgeCount)}</Text>
          </View>

          <AcademyNextStep onOpenCapsule={openCapsule} refreshKey={refreshKey} />
        </ScreenHeader>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.listLabel}>{t.academy.domainsKicker}</Text>
          {ACADEMY_DOMAINS.map((d, i) => (
            <AcademyDomainCard key={d} domain={d} index={i} onPress={onPickDomain} />
          ))}
          <View style={{ height: 12 }} />
        </ScrollView>

        <HipoacusiaBottomSheet visible={hipoOpen} onClose={() => { setHipoOpen(false); bump(); }} onCompleted={bump} />
      </View>
    );
  }

  // ------------------------------------------------------------------ LISTA
  if (view === 'list' || !capsule) {
    const lang = getUiLang();
    const meta = domainMetaFor(activeDomain, lang);
    const capsules = capsulesForUiLang(lang).filter((c) => c.domain === activeDomain);
    return (
      <View style={s.flex}>
        <ScreenHeader onBack={backToHub} backLabel={t.academy.back.replace(/^‹\s*/, '')} color={meta.accentFg} icon={meta.icon}
          kicker={`ACADEMY · ${meta.label}`} title={meta.label} subtitle={meta.blurb} />

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {activeDomain === 'signos' && (
            <View style={s.signPreview}>
              <View style={s.signRow}><BlockIcon name="gesture" color={V.color.primaryDark} size={17} /><Text style={s.signPreviewTitle}>{t.academy.signPreviewTitle}</Text></View>
              <SignAlphabetChart compact />
              <Text style={s.signPreviewSub}>
                {t.academy.signPreviewSub}
              </Text>
            </View>
          )}
          <Text style={s.listLabel}>{t.academy.capsulesKicker}</Text>
          {capsules.length === 0 && (
            <View style={s.emptyCard}>
              <Text style={s.emptyTxt}>{t.academy.comingSoon}</Text>
            </View>
          )}
          {capsules.map((c, i) => {
            const done = !!results[c.id];
            const accent = accentFor(c);
            return (
              <ListRow
                key={c.id}
                index={i}
                icon={domainMetaFor(c.domain, lang).icon}
                accent={accent.fg}
                tint={accent.bg}
                title={c.title}
                subtitle={`${c.summary}\n${t.academy.readTime(c.minutes)} · ${c.xp} XP${done ? ` · ${t.academy.completedTag}` : ''}`}
                onPress={() => openCapsule(c)}
                accessibilityLabel={`${c.title}. ${done ? t.academy.completedTag : ''}.`}
                trailing={done ? <View style={[s.capState, s.capStateDone]}><Text style={[s.capStateTxt, { color: '#fff' }]}>✓</Text></View> : undefined}
              />
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
  const t = useT();
  const [i, setI] = useState(0);
  const slide = capsule.slides[i];
  const last = i + 1 >= capsule.slides.length;

  return (
    <View style={s.flex}>
      <ScreenHeader onBack={onExit} backLabel={t.academy.back.replace(/^‹\s*/, '')} color={accent.fg}
        kicker={accent.label} title={capsule.title} dots={{ total: capsule.slides.length, index: i, finished: false }} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.slideCard}>
          {!!slide.icon && <Text style={s.slideEmoji}>{slide.icon}</Text>}
          {!!slide.ageBracket && (
            <View style={[s.ageBracketBadge, { backgroundColor: accent.bg }]}>
              <Text style={[s.ageBracketTxt, { color: accent.fg }]}>{slide.ageBracket}</Text>
            </View>
          )}
          <Text style={s.slideHeading}>{slide.heading}</Text>
          {!!capsule.disclaimerText && i === 0 && (
            <View style={s.disclaimerBox}>
              <BlockIcon name="info" color={V.color.primaryDark} size={16} />
              <Text style={s.disclaimerTxt}>{capsule.disclaimerText}</Text>
            </View>
          )}
          {!!slide.figure && (
            <View style={s.slideFigure}><SignFigure figure={slide.figure} size={132} /></View>
          )}
          <Text style={s.slideBody}>{slide.body}</Text>
          {slide.chart === 'dactilologico' && <SignAlphabetChart />}

          {!!slide.receptive && slide.receptive.length > 0 && (
            <View style={[s.skillsSection, s.skillsReceptive]}>
              <View style={s.skillsHeaderRow}>
                <BlockIcon name="hearing" color="#2563eb" size={18} />
                <Text style={[s.skillsHeaderTxt, { color: '#1d4ed8' }]}>
                  {t.academy.receptiveLang ?? 'Lenguaje Receptivo (Comprensión)'}
                </Text>
              </View>
              {slide.receptive.map((item, idx) => (
                <View key={idx} style={s.bulletRow}>
                  <Text style={[s.bulletDot, { color: '#2563eb' }]}>•</Text>
                  <Text style={s.bulletTxt}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {!!slide.expressive && slide.expressive.length > 0 && (
            <View style={[s.skillsSection, s.skillsExpressive]}>
              <View style={s.skillsHeaderRow}>
                <BlockIcon name="language" color="#059669" size={18} />
                <Text style={[s.skillsHeaderTxt, { color: '#047857' }]}>
                  {t.academy.expressiveLang ?? 'Lenguaje Expresivo (Producción / Habla)'}
                </Text>
              </View>
              {slide.expressive.map((item, idx) => (
                <View key={idx} style={s.bulletRow}>
                  <Text style={[s.bulletDot, { color: '#059669' }]}>•</Text>
                  <Text style={s.bulletTxt}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={s.footer}>
        {i > 0 && (
          <Pressable onPress={() => setI(i - 1)} style={s.secondaryBtn}>
            <Text style={s.secondaryBtnTxt}>{t.common.back}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => (last ? onFinish() : setI(i + 1))}
          style={[s.primaryBtn, { backgroundColor: accent.fg, flex: 1 }]}
          accessibilityRole="button"
        >
          <Text style={s.primaryBtnTxt}>{last ? `${t.academy.takeQuiz} →` : `${t.academy.nextSlide} ›`}</Text>
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
  const t = useT();
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
        <ScreenHeader backLabel={t.academy.back.replace(/^‹\s*/, '')} color={accent.fg} kicker={accent.label}
          title={reward.passed ? t.academy.passedTitle : t.academy.failedTitle} />
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.resultCard}>
            <Text style={[s.resultScore, { color: accent.fg }]}>{score}%</Text>
            <Text style={s.resultSub}>
              {reward.passed
                ? t.academy.scoreSub(score)
                : t.academy.passRequirement(Math.round(ACADEMY_PASS_THRESHOLD * 100))}
            </Text>
            {reward.xpGained > 0 && <Text style={s.resultXp}>{t.academy.claimGuideXp(reward.xpGained)}</Text>}
            {reward.newBadges.map((b) => (
              <View key={b.id} style={s.badgeRow}>
                <BlockIcon name={b.icon as any} color={accent.fg} size={22} />
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
            <Pressable onPress={retry} style={s.secondaryBtn}><Text style={s.secondaryBtnTxt}>{t.academy.reviewAndRetry}</Text></Pressable>
          )}
          <Pressable onPress={onDone} style={[s.primaryBtn, { backgroundColor: accent.fg, flex: 1 }]}>
            <Text style={s.primaryBtnTxt}>{reward.passed ? t.academy.backToCapsules : t.academy.exitQuiz}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // -------- Pregunta --------
  return (
    <View style={s.flex}>
      <ScreenHeader onBack={onExit} backLabel={t.academy.back.replace(/^‹\s*/, '')} color={accent.fg}
        kicker={`${t.academy.quizKicker} · ${t.academy.questionOf(qi + 1, capsule.quiz.length)}`} title={capsule.title} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.qPrompt}>{q.prompt ?? (q as any).question}</Text>
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
              {show && isAnswer && <BlockIcon name="check" color={V.color.success} size={16} />}
              {show && isPicked && !isAnswer && <BlockIcon name="cross" color={V.color.error} size={16} />}
            </Pressable>
          );
        })}
        {picked != null && (
          <View style={s.rationale}>
            <View style={s.rationaleRow}>
              <BlockIcon name="tip" color={V.color.textSecondary} size={15} />
              <Text style={[s.rationaleTxt, { flex: 1 }]}>{q.rationale ?? (q as any).why}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={s.footer}>
        <Pressable
          onPress={next}
          disabled={picked == null}
          style={[s.primaryBtn, { backgroundColor: picked != null ? accent.fg : V.color.border, flex: 1 }]}
        >
          <Text style={s.primaryBtnTxt}>{lastQ ? t.academy.seeResult : `${t.academy.nextQuestion} ›`}</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 18, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  logoFallback: { fontFamily: FONT.bodyBlack,color: 'rgba(255,255,255,.9)', fontSize: 11.5, letterSpacing: 1, marginBottom: 6 },
  backPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10 },
  backPillTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 12 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  headerTitleCol: { flex: 1, marginRight: 10 },
  luaBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    borderRadius: 16,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  signRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontFamily: FONT.display,color: '#fff', fontSize: 23, letterSpacing: -0.4 },
  headerSub: { fontFamily: FONT.bodyBold,color: 'rgba(255,255,255,.9)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  langNotice: {
    marginTop: 10, paddingVertical: 7, paddingHorizontal: 11, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)',
    color: '#fff', fontSize: 11.5, fontWeight: '700', lineHeight: 16,
  },

  hProgress: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  hProgressTrack: { flex: 1, height: 8, borderRadius: 5, backgroundColor: 'rgba(255,255,255,.28)', overflow: 'hidden' },
  hProgressFill: { height: 8, borderRadius: 5, backgroundColor: '#fff' },
  hProgressTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 12 },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  gameTxt: { fontFamily: FONT.bodyBlack,color: 'rgba(255,255,255,.92)', fontSize: 12 },

  scroll: { padding: 18, paddingBottom: 28 },
  listLabel: { fontFamily: FONT.bodyBlack,fontSize: 12, color: V.color.textSecondary, letterSpacing: 0.5, marginBottom: 12, marginHorizontal: 2 },

  // Muestra de configuraciones de mano en el catálogo del dominio LSE.
  signPreview: { backgroundColor: '#f7f4fe', borderWidth: 1, borderColor: '#e5dcfa', borderRadius: 16, padding: 13, marginBottom: 16 },
  signPreviewTitle: { fontFamily: FONT.bodyBlack,fontSize: 13, color: '#4b3a7a', marginBottom: 9 },
  signPreviewSub: { fontFamily: FONT.bodyBold,fontSize: 11.5, color: '#6b6383', lineHeight: 16, marginTop: 9 },

  emptyCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 18, marginBottom: 11 },
  emptyTxt: { fontFamily: FONT.bodyBold,fontSize: 13.5, color: V.color.textSecondary, lineHeight: 20, textAlign: 'center' },

  capCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 14, marginBottom: 11, ...V.shadow.card },
  capIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  capTrack: { fontFamily: FONT.bodyBlack,fontSize: 9.5, letterSpacing: 0.6, marginBottom: 2 },
  capTitle: { fontFamily: FONT.bodyBlack,fontSize: 15.5, color: V.color.textPrimary },
  capSummary: { fontFamily: FONT.bodyBold,fontSize: 12, color: V.color.textSecondary, marginTop: 2, lineHeight: 16 },
  capMeta: { fontFamily: FONT.bodyBlack,fontSize: 11, color: V.color.textSecondary, marginTop: 6 },
  capState: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  capStateDone: { backgroundColor: V.color.success },
  capStateTxt: { fontFamily: FONT.bodyBlack,fontSize: 15 },

  dots: { flexDirection: 'row', gap: 6, marginTop: 12 },
  dot: { width: 22, height: 5, borderRadius: 3 },
  stageNavScroll: { marginTop: 12, marginBottom: 2 },
  stageNavPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stageNavPillActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  stageNavTxt: { fontFamily: FONT.bodyBlack,fontSize: 12, color: 'rgba(255,255,255,0.95)' },
  stageNavTxtActive: { fontFamily: FONT.bodyBlack,color: V.color.primaryDark },

  slideFigure: { alignItems: 'center', marginTop: 14, marginBottom: 2 },
  slideCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 18, padding: 20, ...V.shadow.card },
  slideEmoji: { fontSize: 46, textAlign: 'center', marginBottom: 6 },
  slideHeading: { fontFamily: FONT.display,fontSize: 19, color: V.color.textPrimary, textAlign: 'center', marginTop: 6 },
  slideBody: { fontFamily: FONT.bodyBold,fontSize: 14.5, color: V.color.textSecondary, lineHeight: 22, marginTop: 12, textAlign: 'center' },

  ageBracketBadge: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, marginBottom: 8 },
  ageBracketTxt: { fontFamily: FONT.bodyBlack,fontSize: 12.5, letterSpacing: 0.4 },

  disclaimerBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#f0fdf9', borderWidth: 1, borderColor: '#cdeeec', borderRadius: 12, padding: 12, marginTop: 12, marginBottom: 8 },
  disclaimerTxt: { fontFamily: FONT.bodyBold,flex: 1, fontSize: 12, color: '#0d9488', lineHeight: 17 },

  skillsSection: { borderRadius: 16, padding: 15, marginTop: 14, borderWidth: 1 },
  skillsReceptive: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  skillsExpressive: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  skillsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  skillsHeaderTxt: { fontFamily: FONT.bodyBlack,fontSize: 14 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 },
  bulletDot: { fontFamily: FONT.bodyBlack,fontSize: 16, lineHeight: 18 },
  bulletTxt: { fontFamily: FONT.bodyBold,flex: 1, fontSize: 13.5, color: V.color.textPrimary, lineHeight: 19 },

  footer: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 22, backgroundColor: V.color.pageBg },
  primaryBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 15 },
  secondaryBtn: { borderRadius: 14, paddingVertical: 15, paddingHorizontal: 18, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border },
  secondaryBtnTxt: { fontFamily: FONT.bodyBlack,color: V.color.textSecondary, fontSize: 15 },

  qPrompt: { fontFamily: FONT.display,fontSize: 17, color: V.color.textPrimary, lineHeight: 24, marginBottom: 16 },
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1.5, borderColor: V.color.border, borderRadius: 14, padding: 15, marginBottom: 10 },
  optCorrect: { borderColor: V.color.success, backgroundColor: V.color.successBg },
  optWrong: { borderColor: V.color.error, backgroundColor: V.color.errorBg },
  optTxt: { fontFamily: FONT.bodyBlack,flex: 1, fontSize: 14.5, color: V.color.textPrimary },
  optMark: { fontFamily: FONT.bodyBlack,fontSize: 16, color: V.color.success, marginLeft: 8 },
  rationale: { backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 13, padding: 13, marginTop: 4 },
  rationaleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  rationaleTxt: { fontFamily: FONT.bodyBlack,fontSize: 13, color: V.color.textSecondary, lineHeight: 18 },

  resultCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 20, padding: 24, alignItems: 'center', ...V.shadow.card },
  resultScore: { fontFamily: FONT.display,fontSize: 48 },
  resultSub: { fontFamily: FONT.bodyBold,fontSize: 14, color: V.color.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  resultXp: { fontFamily: FONT.bodyBlack,fontSize: 16, color: V.color.star, marginTop: 14 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch', backgroundColor: V.color.pageBg, borderRadius: 14, padding: 13, marginTop: 12 },
  badgeName: { fontFamily: FONT.bodyBlack,fontSize: 14, color: V.color.textPrimary },
  badgeDesc: { fontFamily: FONT.bodyBold,fontSize: 12, color: V.color.textSecondary, marginTop: 2 },
});

export default ValeriaAcademyScreen;

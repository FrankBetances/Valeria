// Reto de un mundo STEAM (plan §2 y §4 R2/R5). El ciclo Observa →
// Experimenta → Construye para la persona adulta, y el motor declarativo en
// marcha con `adult_tap`: el adulto confirma lo que pasa en la mesa, el
// estabilizador lo da por bueno, TurnGate corta luz y vibración donde toca,
// ReactionSequencer espera al fenómeno y LuaLink manda la cara a Lúa por el
// emisor de valeriaLuaSession (o la espeja aquí si no hay enlace).
// La app no puntúa ni decide la progresión: «Reto conseguido» lo marca el adulto.
import { Celebration } from './ui/Celebration';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CatPixel } from './ValeriaCatPixel';
import { useT } from './i18n';
import { ScreenHeader } from './ui/ScreenHeader';
import { V } from './valeriaTheme';
import { getUiLang } from './valeriaUiLang';
import { isLuaLinked, luaSteamFrames, luaSteamIdle } from './valeriaLuaSession';
import { steamScreenStyles as base } from './ValeriaSteamWorldScreen';
import { EventStabilizer } from './steam/engine/EventStabilizer';
import { runReactionSequence, type SequenceClock } from './steam/engine/ReactionSequencer';
import { adjustmentsFor, loadAdaptationProfile } from './steam/profiles';
import { steamChallenge, steamWorld } from './steam/worlds';
import type { AdaptationProfileId, LuaSemanticExpression, SteamWorldId, WorldEventSpec } from './steam/types';
import { FONT } from './ui/fonts';
import { AdultFold } from './ui/AdultFold';
import { ListRow } from './ui/ListRow';
import { Breathe } from './ui/motion';

// Con el perfil de calma, ninguna reacción es una fiesta: misma información, sin estridencia.
const LOUD: readonly LuaSemanticExpression[] = ['celebra_corta', 'celebra_nivel', 'celebra_exito', 'diversion', 'sorpresa_inclinada'];

function calmed(event: WorldEventSpec): WorldEventSpec {
  const expression = LOUD.includes(event.reaction.expression) ? 'calma' : event.reaction.expression;
  return { ...event, reaction: { ...event.reaction, expression, awardFamily: undefined, light: 'APAGADO', haptic: 'APAGADO' } };
}

interface Reaction {
  readonly eventId: string;
  readonly waiting: boolean;
  readonly faceId?: string;
  readonly linked?: boolean;
  readonly hint?: string;
  readonly tpr?: string;
  readonly category?: WorldEventSpec['word']['spatialCategory'];
}

export const ValeriaSteamChallengeScreen: React.FC<{
  navigation: any;
  route: { params: { worldId: SteamWorldId; challengeId: string } };
}> = ({ navigation, route }) => {
  const t = useT();
  const lang = getUiLang();
  const world = steamWorld(route.params.worldId);
  const challenge = steamChallenge(world.id, route.params.challengeId) ?? world.challenges[0];
  const [profile, setProfile] = useState<AdaptationProfileId | null>(null);
  const [silenceLeft, setSilenceLeft] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [hint1, setHint1] = useState(false);
  const [hint2, setHint2] = useState(false);
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [achieved, setAchieved] = useState(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const turn = useRef(0);
  const sentToLua = useRef(false);

  useEffect(() => { void loadAdaptationProfile().then(setProfile); }, []);

  // Al salir, ningún temporizador sigue vivo y Lúa vuelve a la cara de espera.
  useEffect(() => () => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    turn.current += 1;
    if (sentToLua.current) luaSteamIdle();
  }, []);

  useEffect(() => {
    if (silenceLeft === null || silenceLeft <= 0) return;
    const id = setTimeout(() => setSilenceLeft(silenceLeft - 1), 1000);
    return () => clearTimeout(id);
  }, [silenceLeft]);

  const adjust = adjustmentsFor(profile);
  const events = challenge.targetEvents
    .map((id) => world.events.find((e) => e.id === id))
    .filter((e): e is WorldEventSpec => Boolean(e));

  const react = useCallback((raw: WorldEventSpec) => {
    const confirmed = new EventStabilizer().push({ method: 'adult_tap', tMs: Date.now() }).confirmed;
    if (!confirmed) return;
    const event = adjust.calmReactions ? calmed(raw) : raw;
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    const mine = ++turn.current;
    const clock: SequenceClock = {
      now: () => Date.now(),
      // Una pausa interrumpida no se resuelve nunca: esa reacción ya no sale.
      sleep: (ms) => new Promise((resolve) => { pauseTimer.current = setTimeout(resolve, ms); }),
    };
    setReaction({ eventId: event.id, waiting: true });
    void runReactionSequence({
      bleConnected: isLuaLinked(),
      worldId: world.id,
      event,
      neuroStage: challenge.neuroStage,
      ageBand: challenge.ageBand,
      lang,
      sink: luaSteamFrames,
      clock,
    }).then((trace) => {
      if (mine !== turn.current) return;
      if (trace.link.emitted) sentToLua.current = true;
      setReaction({
        eventId: event.id,
        waiting: false,
        faceId: trace.link.face.id,
        linked: trace.link.emitted,
        hint: trace.prompt.adultHint,
        tpr: trace.prompt.englishTpr,
        category: trace.prompt.spatialCategory,
      });
    });
  }, [adjust.calmReactions, challenge.ageBand, challenge.neuroStage, lang, world.id]);

  const markAchieved = () => {
    const goal = events.find((e) => e.reaction.expression === 'celebra_exito') ?? events[events.length - 1];
    if (goal) react({ ...goal, reaction: { ...goal.reaction, expression: 'celebra_exito' } });
    setAchieved(true);
  };

  const silenceTotal = challenge.cycle.observa.mandatorySilenceSec;
  const filled = silenceLeft === null ? 0 : silenceTotal - silenceLeft;
  const eventTitle = (id: string) => world.events.find((e) => e.id === id)?.title[lang] ?? id;

  return (
    <View style={base.root}>
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.steam.back}
        kicker={world.title[lang]}
        title={challenge.title[lang]} />

      <ScrollView contentContainerStyle={base.scroll} showsVerticalScrollIndicator={false}>

        {adjust.anticipationFirst && (
          <View style={base.card}>
            <Text style={base.kickerFirst}>{t.steam.storyBefore}</Text>
            <Text style={base.body}>{world.story.anticipationMicroStory[lang]}</Text>
          </View>
        )}

        {/* El ciclo del reto, paso a paso (F12): el adulto ve un paso cada vez y
            pasa al siguiente cuando ha terminado, en lugar de un muro de texto. */}
        <Text style={s.cycleLabel}>{t.steam.cycleTitle}</Text>
        <ListRow index={0} leading="1" title={t.steam.stepObserve.replace(/^\d+\.\s*/, '')}
          accent={step >= 0 ? V.color.primaryDark : '#8a9494'} tint={step >= 0 ? V.color.primaryLight : '#eef0ef'}
          onPress={() => setStep(0)} trailing={step > 0 ? <View style={s.doneDot}><Text style={s.doneTxt}>✓</Text></View> : null}
          accessibilityLabel={t.steam.stepObserve}>
          {step === 0 && (
          <View style={s.stepBody}>
          <Text style={base.body}>{challenge.cycle.observa.phenomenonTrigger[lang]}</Text>
          <View style={s.dots}>
            {Array.from({ length: silenceTotal }, (_, i) => (
              <View key={i} style={[s.dot, i < filled && s.dotOn]} />
            ))}
          </View>
          {silenceLeft !== null && silenceLeft > 0 && (
            <Text style={s.silenceNum} accessibilityLiveRegion="polite">{t.steam.silenceLeft(silenceLeft)}</Text>
          )}
          {silenceLeft === 0 && <Text style={s.after}>{t.steam.silenceDone}</Text>}
          <Text style={[base.bodyStrong, s.question]}>{challenge.cycle.observa.socraticQuestion[lang]}</Text>
          {(silenceLeft === null || silenceLeft === 0) && (
            <Pressable onPress={() => setSilenceLeft(silenceTotal)} style={base.secondaryBtn}
              accessibilityRole="button" accessibilityLabel={t.steam.silenceStartA11y}>
              <Text style={base.secondaryBtnTxt}>{silenceLeft === 0 ? t.steam.silenceAgain : t.steam.silenceStart}</Text>
            </Pressable>
          )}

            <Pressable onPress={() => setStep(1)} style={s.nextBtn} accessibilityRole="button" accessibilityLabel={t.steam.stepTry}>
              <Text style={s.nextTxt}>{t.steam.stepTry} ›</Text>
            </Pressable>
          </View>
          )}
        </ListRow>
        <ListRow index={1} leading="2" title={t.steam.stepTry.replace(/^\d+\.\s*/, '')}
          accent={step >= 1 ? V.color.primaryDark : '#8a9494'} tint={step >= 1 ? V.color.primaryLight : '#eef0ef'}
          onPress={() => setStep(1)} trailing={step > 1 ? <View style={s.doneDot}><Text style={s.doneTxt}>✓</Text></View> : null}
          accessibilityLabel={t.steam.stepTry}>
          {step === 1 && (
          <View style={s.stepBody}>
          <Text style={base.body}>{challenge.cycle.experimenta.adultStepByStep[lang]}</Text>
          <Pressable onPress={() => setHint1((v) => !v)} style={s.hint}
            accessibilityRole="button" accessibilityState={{ expanded: hint1 }} accessibilityLabel={t.steam.hintA11y(t.steam.hintN1)}>
            <Text style={s.hintTitle}>{t.steam.hintN1}</Text>
            {hint1 && <Text style={base.body}>{challenge.cycle.experimenta.hints.level1Socratic[lang]}</Text>}
          </Pressable>
          <Pressable onPress={() => setHint2((v) => !v)} style={s.hint}
            accessibilityRole="button" accessibilityState={{ expanded: hint2 }} accessibilityLabel={t.steam.hintA11y(t.steam.hintN2)}>
            <Text style={s.hintTitle}>{t.steam.hintN2}</Text>
            {hint2 && <Text style={base.body}>{challenge.cycle.experimenta.hints.level2PhysicalModel[lang]}</Text>}
          </Pressable>

            <Pressable onPress={() => setStep(2)} style={s.nextBtn} accessibilityRole="button" accessibilityLabel={t.steam.stepBuild}>
              <Text style={s.nextTxt}>{t.steam.stepBuild} ›</Text>
            </Pressable>
          </View>
          )}
        </ListRow>
        <ListRow index={2} leading="3" title={t.steam.stepBuild.replace(/^\d+\.\s*/, '')}
          accent={step >= 2 ? V.color.primaryDark : '#8a9494'} tint={step >= 2 ? V.color.primaryLight : '#eef0ef'}
          onPress={() => setStep(2)} trailing={step > 2 ? <View style={s.doneDot}><Text style={s.doneTxt}>✓</Text></View> : null}
          accessibilityLabel={t.steam.stepBuild}>
          {step === 2 && (
          <View style={s.stepBody}>
          <Text style={base.body}>{challenge.cycle.construye.tangibleMakeChallenge[lang]}</Text>
          <Text style={[base.bodyStrong, s.question]}>{challenge.cycle.construye.transferQuestion[lang]}</Text>
          </View>
          )}
        </ListRow>

        <View style={base.card}>
          <AdultFold label={t.steam.eventsKicker}><Text style={base.body}>{t.steam.eventsNote}</Text></AdultFold>
          {events.map((event) => (
            <Pressable key={event.id} onPress={() => react(event)}
              style={[s.eventBtn, reaction?.eventId === event.id && s.eventBtnOn]}
              accessibilityRole="button" accessibilityLabel={t.steam.eventA11y(event.title[lang])}>
              <Text style={s.eventTitle}>{event.title[lang]}</Text>
              <Text style={s.eventSub}>{event.childAction[lang]}</Text>
            </Pressable>
          ))}
        </View>

        <View style={base.card}>
          <Text style={base.kickerFirst}>{t.steam.luaKicker}</Text>
          <View style={s.luaRow}>
            <Breathe style={s.luaFace}><CatPixel pose="head" size={56} /></Breathe>
            <View style={s.luaText} accessibilityLiveRegion="polite">
              {!reaction && <Text style={base.body}>{t.steam.luaIdle}</Text>}
              {reaction?.waiting && <Text style={base.body}>{t.steam.luaWaiting}</Text>}
              {reaction && !reaction.waiting && reaction.faceId && (
                <>
                  <Text style={base.bodyStrong}>{t.steam.luaFace(t.steam.faces[reaction.faceId] ?? reaction.faceId)}</Text>
                  <Text style={base.body}>{reaction.linked ? t.steam.luaLinked : t.steam.luaMirror}</Text>
                </>
              )}
            </View>
          </View>
          {reaction && !reaction.waiting && reaction.hint && (
            <>
              <Text style={base.kicker}>{`${t.steam.wordKicker} · ${eventTitle(reaction.eventId)}`}</Text>
              <Text style={base.bodyStrong}>{reaction.hint}</Text>
              {reaction.category && (
                <View style={s.chip}><Text style={s.chipTxt}>{t.steam.spatial[reaction.category]}</Text></View>
              )}
              {!!reaction.tpr && (
                <>
                  <Text style={base.kicker}>{t.steam.tprKicker}</Text>
                  <Text style={s.tpr}>{reaction.tpr}</Text>
                </>
              )}
            </>
          )}
        </View>

        <View style={base.card}>
          <Text style={base.kickerFirst}>{t.steam.criterionKicker}</Text>
          <Text style={base.bodyStrong}>{challenge.achievementCriterion[lang]}</Text>
          <Text style={base.kicker}>{t.steam.observationKicker}</Text>
          <Text style={base.body}>{challenge.qualitativeObservation[lang]}</Text>
          <View style={s.chips}>
            {challenge.skillAxes.map((axis) => (
              <View key={axis} style={s.chip}><Text style={s.chipTxt}>{t.steam.axes[axis]}</Text></View>
            ))}
          </View>
        </View>

        <Pressable onPress={markAchieved} style={s.primaryBtn}
          accessibilityRole="button" accessibilityLabel={t.steam.achievedA11y}>
          <Text style={s.primaryBtnTxt}>{t.steam.achieved}</Text>
        </Pressable>
        {achieved && <Celebration><Text style={s.after}>{t.steam.achievedDone}</Text></Celebration>}
        {profile && (
          <AdultFold label={t.steam.profileNoteKicker}>
          <View style={base.noteCard}>
            <Text style={base.kickerFirst}>{t.steam.profileNoteKicker}</Text>
            <Text style={base.body}>{t.steam.profiles[profile].note}</Text>
            {adjust.lingFirst && (
              <Pressable onPress={() => navigation.navigate('LingTest')} style={base.secondaryBtn}
                accessibilityRole="button" accessibilityLabel={t.steam.lingFirstA11y}>
                <Text style={base.secondaryBtnTxt}>{t.steam.lingFirst}</Text>
              </Pressable>
            )}
          </View>
          </AdultFold>
        )}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  cycleLabel: { fontFamily: FONT.bodyBlack, fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: V.color.textSecondary, marginTop: 4, marginBottom: 10, marginLeft: 4 },
  stepBody: { marginTop: 12, gap: 8 },
  nextBtn: { alignSelf: 'flex-end', marginTop: 8, backgroundColor: '#ffd23f', borderBottomWidth: 4, borderBottomColor: '#e0a800', borderRadius: 16, paddingHorizontal: 18, minHeight: 48, justifyContent: 'center' },
  nextTxt: { fontFamily: FONT.display, fontSize: 17, color: '#3b2a00' },
  doneDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: V.color.primaryDark, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  doneTxt: { color: '#ffffff', fontFamily: FONT.display, fontSize: 18 },
  step: { fontFamily: FONT.bodyBlack,fontSize: 15.5, color: V.color.textPrimary, marginTop: V.space.lg, marginBottom: 4 },
  question: { marginTop: V.space.sm },
  dots: { flexDirection: 'row', gap: 8, marginTop: V.space.md },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: V.color.border },
  dotOn: { backgroundColor: V.color.primaryDark },
  silenceNum: { fontFamily: FONT.display,fontSize: 26, color: V.color.primaryDark, marginTop: V.space.sm },
  after: { fontFamily: FONT.bodyBlack,fontSize: 13.5, color: V.color.primaryDark, marginTop: V.space.sm },
  hint: { borderWidth: 1, borderColor: V.color.border, borderRadius: 12, padding: 12, marginTop: V.space.sm, backgroundColor: V.color.pageBg },
  hintTitle: { fontFamily: FONT.bodyBlack,fontSize: 14, color: V.color.textPrimary },
  eventBtn: {
    borderWidth: 1.5, borderColor: V.color.borderActive, borderRadius: 24, padding: 12,
    marginTop: V.space.sm, minHeight: V.touchMin, backgroundColor: '#fff', borderBottomWidth: 6 },
  eventBtnOn: { borderColor: V.color.primaryDark, backgroundColor: V.color.primaryLight },
  eventTitle: { fontFamily: FONT.bodyBlack,fontSize: 15, color: V.color.primaryDark },
  eventSub: { fontFamily: FONT.bodyBlack,fontSize: 13, lineHeight: 18, color: V.color.textSecondary, marginTop: 2 },
  luaRow: { flexDirection: 'row', alignItems: 'center' },
  luaFace: { width: 64, height: 64, borderRadius: 32, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: V.space.md },
  luaText: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: V.space.md },
  // El chip se mide por su texto: sin flex heredado.
  chip: { alignSelf: 'flex-start', backgroundColor: V.color.primaryLight, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginTop: V.space.sm },
  chipTxt: { fontFamily: FONT.bodyBlack,fontSize: 12, color: V.color.primaryDark },
  tpr: { fontFamily: FONT.bodyBlack,fontSize: 16, color: V.color.textPrimary },
  primaryBtn: { backgroundColor: '#ffd23f', borderRadius: 24, paddingVertical: 15, alignItems: 'center', marginTop: V.space.sm, ...V.shadow.button, borderBottomWidth: 6, borderBottomColor: '#e0a800' },
  primaryBtnTxt: { fontFamily: FONT.display,color: '#3b2a00', fontSize: 19 },
});

export default ValeriaSteamChallengeScreen;

// Pantalla de una actividad STEAM (T5-A).
// La abre la persona adulta desde las tres pestañas del bloque de RA.
// La criatura juega con Lúa y con las piezas; los botones de esta ficha no son suyos.
// El enlace en vivo sale de publishSteamBleLive: el transporte de radio aún no
// lo registra, así que la lectura permanece sin enlace y la cara se espeja aquí.
import React, { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CatPixel } from './ValeriaCatPixel';
import { steamCapsuleFor } from './ValeriaAcademy/steamCapsules';
import { useT } from './i18n';
import { V } from './valeriaTheme';
import { getUiLang, type UiLang } from './valeriaUiLang';
import {
  adultTapSample,
  noteSteamSample,
  tabletopSession,
} from './steam/adapters/ArLegacyWorldAdapter';
import type { RevealAnimation } from './steam/engine/Detectors';
import { EventStabilizer } from './steam/engine/EventStabilizer';
import { linkLua } from './steam/engine/LuaLink';
import type { SteamActivity, SteamActivityId } from './steam/types';
import { LUA_SOLO_TITLES } from './steam/worlds/luaSolo';
import { steamWorldRegistry } from './steam/worlds';

type BleSnap = { readonly connected: boolean };
type TapKind = 'mirrored' | 'sent' | 'noted';

let bleSnap: BleSnap = { connected: false };
const bleListeners = new Set<() => void>();

/** Lo llama el transporte cuando el enlace con Lúa V5 cambia. Sin esa llamada, no hay enlace. */
export function publishSteamBleLive(connected: boolean): void {
  if (bleSnap.connected === connected) return;
  bleSnap = { connected };
  bleListeners.forEach((listen) => listen());
}

function subscribeSteamBle(listen: () => void): () => void {
  bleListeners.add(listen);
  const timer = setInterval(listen, 1000);
  return () => {
    bleListeners.delete(listen);
    clearInterval(timer);
  };
}

function readSteamBle(): BleSnap {
  return bleSnap;
}

export function steamActivityTitle(activity: SteamActivity, lang: UiLang): string {
  if (activity.worldId === 'LUA') {
    const titled = LUA_SOLO_TITLES[activity.id as keyof typeof LUA_SOLO_TITLES];
    if (titled) return titled[lang];
  }
  const manifest = steamWorldRegistry.manifestByWorld(activity.worldId);
  if (manifest) return manifest.title[lang];
  return activity.id;
}

export const ValeriaSteamWorldScreen = memo(function ValeriaSteamWorldScreen({
  activityId,
  onBack,
}: {
  activityId: SteamActivityId;
  onBack: () => void;
}) {
  const t = useT();
  const lang = getUiLang();
  const ble = useSyncExternalStore(subscribeSteamBle, readSteamBle, readSteamBle);
  const activity = steamWorldRegistry.activityById(activityId);
  const manifest = activity ? steamWorldRegistry.manifestByWorld(activity.worldId) : undefined;
  const [silenceLeft, setSilenceLeft] = useState<number | null>(null);
  const [hint1, setHint1] = useState(false);
  const [hint2, setHint2] = useState(false);
  const [revealOn, setRevealOn] = useState(false);
  const [revealAnimation, setRevealAnimation] = useState<RevealAnimation | null>(null);
  const [tapKind, setTapKind] = useState<TapKind | null>(null);
  const stabilizerRef = useRef<EventStabilizer | null>(null);

  useEffect(() => {
    if (silenceLeft === null || silenceLeft <= 0) return;
    const timer = setTimeout(() => setSilenceLeft(silenceLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [silenceLeft]);

  const startSilence = useCallback(() => {
    if (!activity) return;
    setSilenceLeft(activity.cycle.observa.mandatorySilenceSec);
  }, [activity]);

  const activateReveal = useCallback(() => {
    if (!activity) return;
    const open = tabletopSession(activity.id, Date.now());
    setRevealAnimation(open.revealLayer.animation);
    setRevealOn(true);
  }, [activity]);

  const confirmAdult = useCallback(() => {
    if (!activity) return;
    const stabilizer = stabilizerRef.current ?? (stabilizerRef.current = new EventStabilizer());
    const sample = adultTapSample(activity.id, Date.now());
    noteSteamSample(stabilizer, sample, activity.methods);
    const projection = linkLua({
      mode: activity.mode,
      bleConnected: ble.connected,
      expression: 'atenta',
      light: 'APAGADO',
      haptic: 'APAGADO',
      screenOverlay: 'NONE',
    });
    if (projection.degradedToMirror) setTapKind('mirrored');
    else if (projection.emitted) setTapKind('sent');
    else setTapKind('noted');
  }, [activity, ble.connected]);

  if (!activity || !manifest) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backPill} accessibilityRole="button" accessibilityLabel={t.steam.backA11y}>
            <Text style={styles.backPillTxt}>{t.steam.back}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t.steam.missing}</Text>
        </View>
      </View>
    );
  }

  const title = steamActivityTitle(activity, lang);
  const capsule = steamCapsuleFor(activity.worldId, lang);
  const silenceTotal = activity.cycle.observa.mandatorySilenceSec;
  const silenceFilled = silenceLeft === null ? 0 : silenceTotal - silenceLeft;
  const confirmPrimary = activity.mode !== 'SET_SOLO';

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backPill} accessibilityRole="button" accessibilityLabel={t.steam.backA11y}>
          <Text style={styles.backPillTxt}>{t.steam.back}</Text>
        </Pressable>
        <View style={styles.code}>
          <Text style={styles.codeTxt}>{activity.id}</Text>
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.steam.cycleTitle}</Text>
          <Text style={styles.step}>{t.steam.stepObserve}</Text>
          <Text style={styles.body}>{activity.cycle.observa.phenomenonTrigger[lang]}</Text>
          <Text style={styles.body}>{activity.cycle.observa.socraticQuestion[lang]}</Text>
          <View style={styles.dots} accessibilityLabel={silenceLeft !== null && silenceLeft > 0 ? t.steam.silenceLeft(silenceLeft) : t.steam.silenceStartA11y}>
            {Array.from({ length: silenceTotal }, (_, index) => (
              <View key={index} style={[styles.dot, index < silenceFilled && styles.dotOn]} />
            ))}
          </View>
          {silenceLeft !== null && silenceLeft > 0 && (
            <Text style={styles.silenceNum} accessibilityLiveRegion="polite">{t.steam.silenceLeft(silenceLeft)}</Text>
          )}
          {silenceLeft === 0 && <Text style={styles.body}>{t.steam.silenceDone}</Text>}
          {silenceLeft === null && (
            <Pressable onPress={startSilence} style={styles.secondaryBtn} accessibilityRole="button" accessibilityLabel={t.steam.silenceStartA11y}>
              <Text style={styles.secondaryBtnTxt}>{t.steam.silenceStart}</Text>
            </Pressable>
          )}
          {silenceLeft === 0 && (
            <Pressable onPress={startSilence} style={styles.secondaryBtn} accessibilityRole="button" accessibilityLabel={t.steam.silenceAgain}>
              <Text style={styles.secondaryBtnTxt}>{t.steam.silenceAgain}</Text>
            </Pressable>
          )}

          <Text style={styles.step}>{t.steam.stepTry}</Text>
          <Text style={styles.body}>{activity.cycle.experimenta.adultStepByStep[lang]}</Text>
          <Pressable
            onPress={() => setHint1((open) => !open)}
            style={styles.hintBtn}
            accessibilityRole="button"
            accessibilityState={{ expanded: hint1 }}
            accessibilityLabel={t.steam.hintN1A11y}
          >
            <Text style={styles.hintTitle}>{t.steam.hintN1}</Text>
            {hint1 && <Text style={styles.body}>{activity.cycle.experimenta.hints.level1Socratic[lang]}</Text>}
          </Pressable>
          <Pressable
            onPress={() => setHint2((open) => !open)}
            style={styles.hintBtn}
            accessibilityRole="button"
            accessibilityState={{ expanded: hint2 }}
            accessibilityLabel={t.steam.hintN2A11y}
          >
            <Text style={styles.hintTitle}>{t.steam.hintN2}</Text>
            {hint2 && <Text style={styles.body}>{activity.cycle.experimenta.hints.level2PhysicalModel[lang]}</Text>}
          </Pressable>

          <Text style={styles.step}>{t.steam.stepBuild}</Text>
          <Text style={styles.body}>{activity.cycle.construye.tangibleMakeChallenge[lang]}</Text>
          <Text style={styles.body}>{activity.cycle.construye.transferQuestion[lang]}</Text>
        </View>

        {activity.bleRequired && (
          <View style={styles.card}>
            <View style={styles.bleRow} accessibilityRole="text" accessibilityLabel={ble.connected ? t.steam.bleA11yOn : t.steam.bleA11yOff}>
              <View style={[styles.bleDot, ble.connected ? styles.bleDotOn : styles.bleDotOff]} />
              <Text style={styles.bleTxt}>{ble.connected ? t.steam.bleOn : t.steam.bleOff}</Text>
            </View>
            {!ble.connected && (
              <View accessible accessibilityLabel={t.steam.mirrorA11y} style={styles.mirror}>
                <CatPixel pose="head" size={72} />
              </View>
            )}
          </View>
        )}

        {activity.mode === 'SET_SOLO' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.steam.revealTitle}</Text>
            <Text style={styles.body}>{manifest.revealLayer.description[lang]}</Text>
            {revealOn ? (
              <Text style={styles.body}>{revealAnimation ? t.steam.revealAnim[revealAnimation] : t.steam.revealAnim.none}</Text>
            ) : (
              <Pressable onPress={activateReveal} style={styles.primaryBtn} accessibilityRole="button" accessibilityLabel={t.steam.revealStartA11y}>
                <Text style={styles.primaryBtnTxt}>{t.steam.revealStart}</Text>
              </Pressable>
            )}
            {revealOn && <Text style={styles.kicker}>{t.steam.revealOn}</Text>}
          </View>
        )}

        <Pressable
          onPress={confirmAdult}
          style={confirmPrimary ? styles.primaryBtn : styles.secondaryBtn}
          accessibilityRole="button"
          accessibilityLabel={t.steam.adultTapA11y}
        >
          <Text style={confirmPrimary ? styles.primaryBtnTxt : styles.secondaryBtnTxt}>{t.steam.adultTap}</Text>
        </Pressable>
        {tapKind === 'mirrored' && <Text style={styles.note}>{t.steam.tapMirrored}</Text>}
        {tapKind === 'sent' && <Text style={styles.note}>{t.steam.tapSent}</Text>}
        {tapKind === 'noted' && <Text style={styles.note}>{t.steam.tapNoted}</Text>}

        <View style={styles.card}>
          <Text style={styles.kicker}>{t.steam.spatialKicker}</Text>
          <View style={styles.chips}>
            {manifest.prioritySpatialCategories.map((category) => (
              <View key={category} style={styles.chip}>
                <Text style={styles.chipTxt}>{t.steam.spatial[category]}</Text>
              </View>
            ))}
          </View>
          {activity.events.map((event) => (
            <Text key={event.id} style={styles.body}>{event.word.adultHint[lang]}</Text>
          ))}
          <Text style={styles.kicker}>{t.steam.tprKicker}</Text>
          <Text style={styles.tpr}>{activity.englishTpr}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>{t.steam.mediationKicker}</Text>
          <Text style={styles.cardTitle}>{capsule.title}</Text>
          <Text style={styles.body}>{capsule.summary}</Text>
          {capsule.slides.map((slide) => (
            <View key={slide.heading}>
              <Text style={styles.step}>{slide.heading}</Text>
              <Text style={styles.body}>{slide.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

export default ValeriaSteamWorldScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.color.pageBg },
  header: {
    backgroundColor: V.color.primary,
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  backPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 10,
  },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  // El código se mide por su texto. Sin flex: en Android un flex:1 heredado aplasta el chip.
  code: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    backgroundColor: 'rgba(255,255,255,.18)',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  codeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  scroll: { padding: 18, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...V.shadow.card,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    color: V.color.textSecondary,
    letterSpacing: 0.4,
    marginTop: 14,
    marginBottom: 8,
  },
  step: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary, marginTop: 14 },
  body: { fontSize: 13.5, fontWeight: '600', color: V.color.textSecondary, lineHeight: 19, marginTop: 6 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: V.color.border },
  dotOn: { backgroundColor: V.color.primaryDark },
  silenceNum: { fontSize: 28, fontWeight: '800', color: V.color.primaryDark, marginTop: 8 },
  hintBtn: {
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    backgroundColor: V.color.pageBg,
  },
  hintTitle: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    backgroundColor: V.color.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },
  tpr: { fontSize: 16, fontWeight: '800', color: V.color.textPrimary, marginTop: 4 },
  bleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bleDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  bleDotOn: { backgroundColor: V.color.success },
  bleDotOff: { backgroundColor: '#c4a15a' },
  bleTxt: { flexGrow: 1, flexShrink: 1, fontSize: 13.5, fontWeight: '700', color: V.color.textPrimary },
  mirror: { alignItems: 'center', marginTop: 12 },
  note: { fontSize: 13, fontWeight: '700', color: V.color.textSecondary, lineHeight: 18, marginTop: 8, marginBottom: 8 },
  primaryBtn: {
    backgroundColor: V.color.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    ...V.shadow.button,
  },
  primaryBtnTxt: { color: '#fff', fontSize: 15.5, fontWeight: '800' },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: V.color.primaryDark,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#fff',
  },
  secondaryBtnTxt: { color: V.color.primaryDark, fontSize: 15, fontWeight: '800' },
});

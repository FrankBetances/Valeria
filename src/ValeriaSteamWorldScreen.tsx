// Mundo STEAM (plan §4 R5). Capa 1: el fenómeno, los cinco retos por edad y
// lo que lo une con las capas 2 (prácticas de mesa, Aventuras con Lúa) y con
// Academy. Desde el Hub, cualquier reto queda a dos toques.
// La pantalla la maneja la persona adulta; la criatura juega en la mesa.
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useT } from './i18n';
import { V } from './valeriaTheme';
import { getUiLang } from './valeriaUiLang';
import { getLocale } from './valeriaLocale';
import { luaGamesFor, luaSongsFor, luaStoriesFor } from './AventurasLua';
import { steamCapsuleFor } from './ValeriaAcademy/steamCapsules';
import { adjustmentsFor, loadAdaptationProfile } from './steam/profiles';
import { steamWorld } from './steam/worlds';
import type { AdaptationProfileId, SteamWorldId, WorldManifest } from './steam/types';

type TabletopRoute = WorldManifest['tabletopPracticeLinks'][number];

export const ValeriaSteamWorldScreen: React.FC<{ navigation: any; route: { params: { worldId: SteamWorldId } } }> = ({
  navigation,
  route,
}) => {
  const t = useT();
  const lang = getUiLang();
  const world = steamWorld(route.params.worldId);
  const [profile, setProfile] = useState<AdaptationProfileId | null>(null);

  useEffect(() => {
    const read = () => { void loadAdaptationProfile().then(setProfile); };
    read();
    return navigation.addListener('focus', read);
  }, [navigation]);

  const adjust = adjustmentsFor(profile);
  const capsule = steamCapsuleFor(world.id, lang);
  const locale = getLocale();
  const story = world.story.storyId ? luaStoriesFor(locale).find((s) => s.id === world.story.storyId) : undefined;
  const songs = luaSongsFor(locale).filter((s) => world.warmupLinks.songIds.includes(s.id));
  const games = luaGamesFor(locale).filter((g) => world.warmupLinks.gameIds.includes(g.id));

  const tabletopTitle = (link: TabletopRoute): string => {
    if (link.route === 'SensoryBlockList') return t.hub.sensoryTitle;
    if (link.route === 'MinimalPairs') return t.hub.pairsTitle;
    if (link.route === 'SemanticExpansion') return t.hub.semanticTitle;
    if (link.route === 'Writing') return t.hub.writingTitle;
    if (link.blockParam === 'audicion') return t.hub.hearingTitle;
    if (link.blockParam === 'dislexia') return t.hub.dyslexiaTitle;
    return t.hub.languageTitle;
  };
  const openTabletop = (link: TabletopRoute) => {
    if (link.route === 'BlockList') navigation.navigate('BlockList', { block: link.blockParam ?? 'lenguaje' });
    else navigation.navigate(link.route);
  };

  const storyCard = (
    <View style={s.card}>
      <Text style={s.kickerFirst}>{t.steam.storyBefore}</Text>
      <Text style={s.body}>{world.story.anticipationMicroStory[lang]}</Text>
      <Text style={s.kicker}>{t.steam.storyAfter}</Text>
      <Text style={s.body}>{world.story.closingMicroStory[lang]}</Text>
    </View>
  );

  return (
    <View style={s.root}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backPill} hitSlop={8}
          accessibilityRole="button" accessibilityLabel={t.steam.backA11y}>
          <Text style={s.backPillTxt}>{`‹ ${t.steam.back}`}</Text>
        </Pressable>
        <Text style={s.headerKicker}>{world.id}</Text>
        <Text style={s.headerTitle}>{world.title[lang]}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.kickerFirst}>{t.steam.phenomenonKicker}</Text>
          <Text style={s.bodyStrong}>{world.phenomenon[lang]}</Text>
          <Text style={s.kicker}>{t.steam.standKicker}</Text>
          <Text style={s.body}>{t.steam.stand(world.tabletStandSpec.heightCm, world.tabletStandSpec.tiltDeg)}</Text>
        </View>

        {profile && (
          <View style={s.noteCard}>
            <Text style={s.kickerFirst}>{t.steam.profileNoteKicker}</Text>
            <Text style={s.bodyStrong}>{t.steam.profiles[profile].name}</Text>
            <Text style={s.body}>{t.steam.profiles[profile].note}</Text>
            {adjust.lingFirst && (
              <Pressable onPress={() => navigation.navigate('LingTest')} style={s.secondaryBtn}
                accessibilityRole="button" accessibilityLabel={t.steam.lingFirstA11y}>
                <Text style={s.secondaryBtnTxt}>{t.steam.lingFirst}</Text>
              </Pressable>
            )}
          </View>
        )}

        {adjust.anticipationFirst && storyCard}

        <Text style={s.section}>{t.steam.challengesKicker}</Text>
        {world.challenges.map((c) => (
          <Pressable key={c.id}
            onPress={() => navigation.navigate('SteamChallenge', { worldId: world.id, challengeId: c.id })}
            style={s.row} accessibilityRole="button" accessibilityLabel={t.steam.challengeA11y(c.title[lang], c.ageBand)}>
            <View style={s.badge}><Text style={s.badgeTxt}>{c.number}</Text></View>
            <View style={s.rowBody}>
              <Text style={s.rowTitle}>{c.title[lang]}</Text>
              <Text style={s.rowMeta}>{t.steam.challengeMeta(c.ageBand, c.neuroStage, c.estimatedMinutes)}</Text>
            </View>
            <Text style={s.chev}>›</Text>
          </Pressable>
        ))}

        {!adjust.anticipationFirst && storyCard}

        {(story || songs.length > 0 || games.length > 0) && (
          <View style={s.card}>
            <Text style={s.kickerFirst}>{t.steam.warmupKicker}</Text>
            {story && (
              <Pressable onPress={() => navigation.navigate('LuaStoryViewer', { storyId: story.id })} style={s.linkBtn}
                accessibilityRole="button" accessibilityLabel={t.steam.warmupA11y(story.title)}>
                <Text style={s.linkTxt}>{t.steam.warmupStory(story.title)}</Text>
              </Pressable>
            )}
            {songs.map((song) => (
              <Pressable key={song.id} onPress={() => navigation.navigate('LuaSongPlayer', { songId: song.id })} style={s.linkBtn}
                accessibilityRole="button" accessibilityLabel={t.steam.warmupA11y(song.title)}>
                <Text style={s.linkTxt}>{t.steam.warmupSong(song.title)}</Text>
              </Pressable>
            ))}
            {games.map((game) => (
              <Pressable key={game.id} onPress={() => navigation.navigate('LuaGamePlayer', { gameId: game.id })} style={s.linkBtn}
                accessibilityRole="button" accessibilityLabel={t.steam.warmupA11y(game.title)}>
                <Text style={s.linkTxt}>{t.steam.warmupGame(game.title)}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={s.card}>
          <Text style={s.kickerFirst}>{t.steam.tabletopKicker}</Text>
          {world.tabletopPracticeLinks.map((link) => {
            const title = tabletopTitle(link);
            return (
              <Pressable key={`${link.route}-${link.blockParam ?? ''}`} onPress={() => openTabletop(link)} style={s.linkBtn}
                accessibilityRole="button" accessibilityLabel={t.steam.tabletopA11y(title)}>
                <Text style={s.linkTxt}>{title}</Text>
                <Text style={s.linkSub}>{link.connectionReason[lang]}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.card}>
          <Text style={s.kickerFirst}>{t.steam.academyKicker}</Text>
          <Text style={s.bodyStrong}>{capsule.title}</Text>
          <Text style={s.body}>{capsule.summary}</Text>
          <Pressable onPress={() => navigation.navigate('Academy')} style={s.secondaryBtn}
            accessibilityRole="button" accessibilityLabel={t.steam.academyA11y}>
            <Text style={s.secondaryBtnTxt}>{t.steam.academyOpen}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export const steamScreenStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.color.pageBg },
  header: {
    backgroundColor: V.color.primary, paddingTop: V.space.md, paddingHorizontal: V.space.xl,
    paddingBottom: V.space.lg, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  backPill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: V.space.md,
  },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: V.font.extrabold },
  headerKicker: { color: 'rgba(255,255,255,.85)', fontSize: 12, fontWeight: V.font.extrabold, letterSpacing: 0.6 },
  headerTitle: { ...V.type.display, color: '#fff', fontWeight: V.font.extrabold, letterSpacing: -0.4, marginTop: 2 },
  scroll: { padding: V.space.lg, paddingBottom: 48 },
  section: { fontSize: 12, fontWeight: V.font.extrabold, color: V.color.textSecondary, letterSpacing: 0.6, marginTop: V.space.sm, marginBottom: V.space.sm },
  card: {
    backgroundColor: V.color.card, borderWidth: 1, borderColor: V.color.border, borderRadius: V.radius.card,
    padding: V.space.lg, marginBottom: V.space.md, ...V.shadow.card,
  },
  noteCard: {
    backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: V.radius.card,
    padding: V.space.lg, marginBottom: V.space.md,
  },
  kickerFirst: { fontSize: 11.5, fontWeight: V.font.extrabold, color: V.color.primaryDark, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 },
  kicker: { fontSize: 11.5, fontWeight: V.font.extrabold, color: V.color.primaryDark, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: V.space.md, marginBottom: 6 },
  body: { fontSize: 14, lineHeight: 20, fontWeight: V.font.semibold, color: V.color.textSecondary },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: V.font.bold, color: V.color.textPrimary },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: V.color.card, borderWidth: 1, borderColor: V.color.borderActive,
    borderRadius: V.radius.card, padding: V.space.md, marginBottom: V.space.sm, minHeight: V.touchMin, ...V.shadow.card,
  },
  // El número tiene tamaño fijo y el cuerpo se encoge: así ninguno de los dos
  // hereda un flex que en Android lo aplaste.
  badge: { width: 36, height: 36, borderRadius: 18, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: V.space.md },
  badgeTxt: { fontSize: 15, fontWeight: V.font.extrabold, color: V.color.primaryDark },
  rowBody: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  rowTitle: { fontSize: 15, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  rowMeta: { fontSize: 12.5, fontWeight: V.font.bold, color: V.color.textMuted, marginTop: 2 },
  chev: { fontSize: 22, color: V.color.textMuted, fontWeight: V.font.extrabold, marginLeft: V.space.sm },
  linkBtn: { borderTopWidth: 1, borderTopColor: V.color.border, paddingVertical: 11, minHeight: V.touchMin, justifyContent: 'center' },
  linkTxt: { fontSize: 14.5, fontWeight: V.font.extrabold, color: V.color.primaryDark },
  linkSub: { fontSize: 13, lineHeight: 18, fontWeight: V.font.semibold, color: V.color.textSecondary, marginTop: 2 },
  secondaryBtn: {
    alignSelf: 'flex-start', borderWidth: 1.5, borderColor: V.color.primaryDark, borderRadius: 14,
    paddingVertical: 10, paddingHorizontal: 14, marginTop: V.space.md, backgroundColor: '#fff',
  },
  secondaryBtnTxt: { color: V.color.primaryDark, fontSize: 14, fontWeight: V.font.extrabold },
});

const s = steamScreenStyles;

export default ValeriaSteamWorldScreen;

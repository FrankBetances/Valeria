// ============================================================================
// Valeria+ · Aventuras con Lúa · Hub Principal del Módulo
// Interfaz pediátrica: objetivos táctiles >= 56 dp.
// ============================================================================
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../../i18n";
import { BlockIcon } from "../../ValeriaBlockIcons";
import { CatPixel } from "../../ValeriaCatPixel";
import { LUA_COLORS, LUA_RADII } from "../Theme/luaTheme";
import {
  AgeBand,
  LUA_ASSESSMENT_CATALOG,
  LUA_STORIES_CATALOG,
  LUA_SONGS_CATALOG,
  LUA_GAMES_CATALOG,
} from "../index";

interface Props {
  navigation: any;
}

export const ValeriaAventurasLuaHubScreen: React.FC<Props> = ({ navigation }) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [selectedBand, setSelectedBand] = useState<AgeBand | "all">("all");

  const ageBands: { id: AgeBand | "all"; label: string }[] = [
    { id: "all", label: t.luaHub.allAges },
    { id: "0-2", label: t.luaHub.band02 },
    { id: "2-3", label: t.luaHub.band23 },
    { id: "3-4", label: t.luaHub.band34 },
    { id: "4-5", label: t.luaHub.band45 },
    { id: "5-7", label: t.luaHub.band57 },
    { id: "7-10", label: t.luaHub.band710 },
  ];

  const filteredQuestions = selectedBand === "all"
    ? LUA_ASSESSMENT_CATALOG
    : LUA_ASSESSMENT_CATALOG.filter((q) => q.ageBand === selectedBand);

  const filteredStories = selectedBand === "all"
    ? LUA_STORIES_CATALOG
    : LUA_STORIES_CATALOG.filter((s) => s.ageBand === selectedBand);

  // Las cuatro secciones obedecen al chip. Antes solo lo hacían preguntas y
  // cuentos: canciones e imprimibles enseñaban los diez siempre, así que el
  // filtro por edad prometía más de lo que hacía.
  const filteredSongs = selectedBand === "all"
    ? LUA_SONGS_CATALOG
    : LUA_SONGS_CATALOG.filter((c) => c.ageBands.includes(selectedBand));

  const filteredGames = selectedBand === "all"
    ? LUA_GAMES_CATALOG
    : LUA_GAMES_CATALOG.filter((j) => j.ageBands.includes(selectedBand));

  const handleOpenAssessment = () => {
    const targetBand: AgeBand = selectedBand === "all" ? "0-2" : selectedBand;
    navigation.navigate("LuaAssessmentPlayer", { ageBand: targetBand, initialQuestionIndex: 0 });
  };

  const handleOpenGame = (gameId: string) => {
    navigation.navigate("LuaGamePlayer", { gameId });
  };

  const handleOpenStory = (storyId: string) => {
    navigation.navigate("LuaStoryViewer", { storyId });
  };

  const handleOpenSong = (songId: string) => {
    navigation.navigate("LuaSongPlayer", { songId });
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Barra superior con botón volver */}
      <View style={s.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t.common.back}
          hitSlop={12}
        >
          <Text style={s.backTxt}>{`‹ ${t.common.back}`}</Text>
        </Pressable>
        {/* El título y el subtítulo los lleva la tarjeta de cabecera con Lúa,
            justo debajo. Repetirlos aquí gastaba un tercio de la pantalla en
            decir dos veces lo mismo antes del primer contenido. */}
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de bienvenida con Lúa */}
        <View style={s.heroBanner}>
          <View style={s.heroMascot}>
            <CatPixel size={72} />
          </View>
          <View style={s.heroTextWrap}>
            <Text style={s.heroTitle}>{t.luaHub.title}</Text>
            <Text style={s.heroSub}>
              {selectedBand === "0-2"
                ? t.luaHub.bandSubtitle02
                : selectedBand === "2-3"
                ? t.luaHub.bandSubtitle23
                : selectedBand === "3-4"
                ? t.luaHub.bandSubtitle34
                : selectedBand === "4-5"
                ? t.luaHub.bandSubtitle45
                : selectedBand === "5-7"
                ? t.luaHub.bandSubtitle57
                : selectedBand === "7-10"
                ? t.luaHub.bandSubtitle710
                : t.luaHub.subtitle}
            </Text>
          </View>
        </View>

        {/* Selector de franja de edad */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.ageSelectorTrack}
        >
          {ageBands.map((band) => {
            const isActive = selectedBand === band.id;
            return (
              <Pressable
                key={band.id}
                onPress={() => setSelectedBand(band.id)}
                style={[s.agePill, isActive && s.agePillActive]}
                accessibilityRole="button"
                accessibilityLabel={band.label}
              >
                <Text style={[s.agePillTxt, isActive && s.agePillTxtActive]}>
                  {band.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 1. Módulo: Banco de Preguntas Interactivas */}
        <Pressable
          style={s.featureCard}
          onPress={handleOpenAssessment}
          accessibilityRole="button"
          accessibilityLabel={t.luaHub.secAssessmentTitle}
        >
          <View style={[s.cardIconBadge, { backgroundColor: LUA_COLORS.primaryLight }]}>
            <BlockIcon name="lua" color={LUA_COLORS.primary} size={28} />
          </View>
          <View style={s.cardBody}>
            <View style={s.cardRow}>
              <Text style={s.cardTitle}>{t.luaHub.secAssessmentTitle}</Text>
              <Text style={s.cardBadge}>{t.luaHub.secAssessmentBadge(filteredQuestions.length)}</Text>
            </View>
            <Text style={s.cardDesc}>{t.luaHub.secAssessmentSub}</Text>
          </View>
        </Pressable>

        {/* 2. Módulo: Juegos con Lúa — la cuarta sección de las 50 hojas, que
            el módulo no traía. Va aquí porque en el material va primero. */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{t.luaHub.secGamesTitle}</Text>
          <Text style={s.sectionBadge}>{t.luaHub.secGamesBadge(filteredGames.length)}</Text>
        </View>
        <Text style={s.sectionDesc}>{t.luaHub.secGamesSub}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.cardsTrack}
        >
          {filteredGames.length === 0 && (
            <Text style={s.sectionEmpty}>{t.luaHub.sectionEmptyForBand}</Text>
          )}
          {filteredGames.map((game) => (
            <Pressable
              key={game.id}
              style={s.itemMiniCard}
              onPress={() => handleOpenGame(game.id)}
              accessibilityRole="button"
              accessibilityLabel={game.title} // i18n-exempt: catálogo clínico dinámico
            >
              <View style={[s.miniCardIcon, { backgroundColor: LUA_COLORS.primaryLight }]}>
                <BlockIcon name="pairs" color={LUA_COLORS.primary} size={24} />
              </View>
              <Text style={s.miniCardTitle} numberOfLines={2}>
                {game.title}
              </Text>
              <Text style={s.miniCardSub} numberOfLines={1}>
                {game.subtitle}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 3. Módulo: Cuentos con Lúa */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{t.luaHub.secStoriesTitle}</Text>
          <Text style={s.sectionBadge}>{t.luaHub.secStoriesBadge(filteredStories.length)}</Text>
        </View>
        <Text style={s.sectionDesc}>{t.luaHub.secStoriesSub}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.cardsTrack}
        >
          {filteredStories.length === 0 && (
            <Text style={s.sectionEmpty}>{t.luaHub.sectionEmptyForBand}</Text>
          )}
          {filteredStories.map((story) => (
            <Pressable
              key={story.id}
              style={s.itemMiniCard}
              onPress={() => handleOpenStory(story.id)}
              accessibilityRole="button"
              accessibilityLabel={story.title} // i18n-exempt: catálogo clínico dinámico
            >
              <View style={[s.miniCardIcon, { backgroundColor: LUA_COLORS.amberLight }]}>
                <BlockIcon name="story" color={LUA_COLORS.amberDark} size={24} />
              </View>
              <Text style={s.miniCardTitle} numberOfLines={2}>
                {story.title}
              </Text>
              <Text style={s.miniCardSub}>
                {story.suggestedAgeText}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 4. Módulo: Canciones y Praxias */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{t.luaHub.secSongsTitle}</Text>
          <Text style={s.sectionBadge}>{t.luaHub.secSongsBadge(filteredSongs.length)}</Text>
        </View>
        <Text style={s.sectionDesc}>{t.luaHub.secSongsSub}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.cardsTrack}
        >
          {filteredSongs.length === 0 && (
            <Text style={s.sectionEmpty}>{t.luaHub.sectionEmptyForBand}</Text>
          )}
          {filteredSongs.map((song) => (
            <Pressable
              key={song.id}
              style={s.itemMiniCard}
              onPress={() => handleOpenSong(song.id)}
              accessibilityRole="button"
              accessibilityLabel={song.title} // i18n-exempt: catálogo clínico dinámico
            >
              <View style={[s.miniCardIcon, { backgroundColor: LUA_COLORS.coralLight }]}>
                <BlockIcon name="song" color={LUA_COLORS.coralDark} size={24} />
              </View>
              <Text style={s.miniCardTitle} numberOfLines={2}>
                {song.title}
              </Text>
              <Text style={s.miniCardSub}>
                {song.subtitle}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  // Una franja puede no tener canciones —las 50 hojas no traen ninguna para
  // 7-10— y eso hay que decirlo, no dejar el hueco.
  sectionEmpty: {
    fontSize: 14,
    lineHeight: 20,
    color: LUA_COLORS.textMuted,
    fontStyle: "italic",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  container: {
    flex: 1,
    backgroundColor: LUA_COLORS.background,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LUA_COLORS.divider,
    backgroundColor: LUA_COLORS.surface,
  },
  backBtn: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LUA_COLORS.surfaceSubtle,
    marginRight: 12,
  },
  backTxt: {
    fontSize: 15,
    color: LUA_COLORS.textPrimary,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
  },
  heroMascot: {
    marginRight: 16,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: LUA_COLORS.primaryDark,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: LUA_COLORS.textSecondary,
    lineHeight: 18,
  },
  ageSelectorTrack: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 16,
  },
  agePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: LUA_RADII.full,
    backgroundColor: LUA_COLORS.surface,
    borderWidth: 1.5,
    borderColor: LUA_COLORS.border,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  agePillActive: {
    backgroundColor: LUA_COLORS.primary,
    borderColor: LUA_COLORS.primaryDark,
  },
  agePillTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: LUA_COLORS.textSecondary,
  },
  agePillTxtActive: {
    color: "#FFFFFF",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 18,
    borderWidth: 2,
    borderColor: LUA_COLORS.primaryMid,
    marginBottom: 20,
    minHeight: 90,
  },
  cardIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardBody: {
    flex: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    flex: 1,
  },
  cardBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: LUA_COLORS.primary,
    backgroundColor: LUA_COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: LUA_COLORS.textSecondary,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: LUA_COLORS.textMuted,
  },
  sectionDesc: {
    fontSize: 13,
    color: LUA_COLORS.textSecondary,
    marginBottom: 12,
  },
  cardsTrack: {
    flexDirection: "row",
    gap: 12,
    paddingBottom: 20,
  },
  itemMiniCard: {
    width: 140,
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.md,
    padding: 12,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    minHeight: 130,
    justifyContent: "space-between",
  },
  miniCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  miniCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: LUA_COLORS.textPrimary,
    lineHeight: 17,
  },
  miniCardSub: {
    fontSize: 11,
    fontWeight: "600",
    color: LUA_COLORS.textMuted,
    marginTop: 6,
  },
});

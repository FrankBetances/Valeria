// ============================================================================
// Valeria+ · Aventuras con Lúa · Reproductor de Canciones y Praxias
// Música, ritmo, pausas motoras y esquemas articulatorios orales.
// ============================================================================
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../../i18n";
import { BlockIcon } from "../../ValeriaBlockIcons";
import { CatPixel } from "../../ValeriaCatPixel";
import { speakLuaToChild, speakLuaToChildSeq } from "../luaSpeech";
import { LUA_COLORS, LUA_RADII } from "../Theme/luaTheme";
import { luaCompleteActivity } from "../luaActivityReward";
import { LuaSong, LUA_SONGS_CATALOG } from "../index";

interface Props {
  navigation: any;
  route: {
    params: {
      songId: string;
    };
  };
}

export const LuaSongPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { songId } = route.params || {};

  const song: LuaSong | undefined =
    LUA_SONGS_CATALOG.find((s) => s.id === songId) || LUA_SONGS_CATALOG[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [tappedElements, setTappedElements] = useState<Record<string, boolean>>({});

  // Verso a verso, no la letra concatenada. Encadenada en una sola cadena, la
  // combinación no existe en el corpus y toda la canción caía a la voz del
  // sistema; troceada, cada verso resuelve su propio asset neuronal.
  const handleFinish = useCallback(async () => {
    setFinished(true);
    await luaCompleteActivity(song.lyrics.length);
  }, []);

  const handlePlaySong = useCallback(() => {
    if (!song) return;
    setIsPlaying(true);
    speakLuaToChildSeq(song.lyrics, { onDone: () => setIsPlaying(false) });
  }, [song]);

  const handleTapElement = (element: string) => {
    setTappedElements((prev) => ({ ...prev, [element]: true }));
    speakLuaToChild(element);
  };

  if (!song) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={s.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
          >
            <Text style={s.backTxt}>{`‹ ${t.common.back}`}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Barra superior */}
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
        <View style={s.titleWrap}>
          <Text style={s.songTitle} numberOfLines={1}>
            {song.title}
          </Text>
          <Text style={s.songSub} numberOfLines={1}>
            {song.subtitle}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner de control de audio */}
        <View style={s.audioControlCard}>
          <CatPixel size={56} />
          <View style={s.audioControlText}>
            <Text style={s.audioSongName}>{song.title}</Text>
            <Text style={s.audioSongDesc}>{song.consigna}</Text>
          </View>
          <Pressable
            onPress={handlePlaySong}
            style={s.playBtn}
            accessibilityRole="button"
            accessibilityLabel={t.luaHub.songPlayTrack}
          >
            <BlockIcon name="speaker" color="#FFFFFF" size={24} />
          </Pressable>
        </View>

        {/* Tarjeta de letra con ritmo */}
        <View style={s.lyricsCard}>
          <View style={s.lyricsHeader}>
            <BlockIcon name="song" color={LUA_COLORS.coralDark} size={20} />
            <Text style={s.lyricsHeading}>{song.title}</Text>
          </View>
          {song.lyrics.map((line, idx) => (
            <Text key={idx} style={s.lyricLine}>
              {line}
            </Text>
          ))}
        </View>

        {/* Tarea interactiva y praxias */}
        <View style={s.taskCard}>
          <Text style={s.taskTitle}>{song.interactiveTask.title}</Text>
          <Text style={s.taskDesc}>{song.interactiveTask.description}</Text>

          {song.interactiveTask.actionType === "drawing" && (
            <Pressable
              style={s.taskActionBtn}
              onPress={() => navigation.navigate("Writing")}
              accessibilityRole="button"
              accessibilityLabel={t.luaHub.storyOpenDrawing}
            >
              <Text style={s.taskActionTxt}>{t.luaHub.storyOpenDrawing}</Text>
            </Pressable>
          )}

          {song.interactiveTask.elements && song.interactiveTask.elements.length > 0 && (
            <View style={s.elementsGrid}>
              {song.interactiveTask.elements.map((el) => {
                const isTapped = tappedElements[el];
                return (
                  <Pressable
                    key={el}
                    onPress={() => handleTapElement(el)}
                    style={[s.elementPill, isTapped && s.elementPillTapped]}
                    accessibilityRole="button"
                    accessibilityLabel={el} // i18n-exempt: elemento del catálogo clínico
                  >
                    <Text style={[s.elementPillTxt, isTapped && s.elementPillTxtTapped]}>
                      {el}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Cierre de la actividad: XP, racha, insignia y la misma cara en el
            cristal del aparato. Sin este botón la actividad no existía para la
            app por mucho que el niño la terminase. */}
        <View style={s.finishCard}>
          {finished ? (
            <>
              <CatPixel size={64} />
              <Text style={s.finishDoneTxt}>{t.luaHub.activityDone}</Text>
            </>
          ) : (
            <Pressable
              style={s.finishBtn}
              onPress={handleFinish}
              accessibilityRole="button"
              accessibilityLabel={t.luaHub.activityFinish}
            >
              <Text style={s.finishBtnTxt}>{t.luaHub.activityFinish}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  finishCard: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  finishBtn: {
    minHeight: 56,
    paddingHorizontal: 28,
    borderRadius: LUA_RADII.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LUA_COLORS.primary,
  },
  finishBtnTxt: { color: LUA_COLORS.textOnPrimary, fontSize: 17, fontWeight: "800" },
  finishDoneTxt: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "800",
    color: LUA_COLORS.mintDark,
    textAlign: "center",
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
  titleWrap: {
    flex: 1,
  },
  songTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: LUA_COLORS.primary,
  },
  songSub: {
    fontSize: 12,
    color: LUA_COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  audioControlCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    marginBottom: 16,
  },
  audioControlText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  audioSongName: {
    fontSize: 16,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    marginBottom: 2,
  },
  audioSongDesc: {
    fontSize: 12,
    color: LUA_COLORS.textSecondary,
    lineHeight: 16,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: LUA_COLORS.coralDark,
    alignItems: "center",
    justifyContent: "center",
  },
  lyricsCard: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    marginBottom: 16,
  },
  lyricsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  lyricsHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: LUA_COLORS.coralDark,
  },
  lyricLine: {
    fontSize: 16,
    fontWeight: "600",
    color: LUA_COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: 4,
  },
  taskCard: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: LUA_COLORS.primaryDark,
    marginBottom: 6,
  },
  taskDesc: {
    fontSize: 13,
    color: LUA_COLORS.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  taskActionBtn: {
    minHeight: 48,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  taskActionTxt: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  elementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  elementPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: LUA_RADII.full,
    backgroundColor: LUA_COLORS.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: LUA_COLORS.border,
  },
  elementPillTapped: {
    backgroundColor: LUA_COLORS.mintLight,
    borderColor: LUA_COLORS.mint,
  },
  elementPillTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: LUA_COLORS.textPrimary,
  },
  elementPillTxtTapped: {
    color: LUA_COLORS.mintDark,
  },
});

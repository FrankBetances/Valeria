// ============================================================================
// Valeria+ · Aventuras con Lúa · Reproductor de Canciones y Praxias
// Música, ritmo, pausas motoras y esquemas articulatorios orales.
// ============================================================================
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScreenHeader } from "../../ui/ScreenHeader";
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
import { luaCompleteActivity, useLuaActivityCleanup } from "../luaActivityReward";
import { LuaSong, luaSongsFor } from "../index";
import { LuaRhythmBar } from "../LuaRhythmBar";
import { getLocale } from "../../valeriaLocale";
import { FONT } from '../../ui/fonts';

interface Props {
  navigation: any;
  route: {
    params: {
      songId: string;
    };
  };
}

export const LuaSongPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  // Corta el desfile del premio si el niño sale a mitad (ver luaActivityReward).
  useLuaActivityCleanup();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { songId } = route.params || {};
  const catalogo = useRef(luaSongsFor(getLocale())).current;

  const song: LuaSong | undefined =
    catalogo.find((s) => s.id === songId) || catalogo[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  const [tappedElements, setTappedElements] = useState<Record<string, boolean>>({});

  // --- Recitado rítmico con metrónomo visual --------------------------------
  // El pulso lo lleva un intervalo, no una animación: lo que tiene que ser
  // exacto es CUÁNDO entra cada verso, no cómo se dibuja el punto. `beat` es el
  // pulso absoluto desde el arranque; de ahí salen el compás (verso en curso) y
  // la posición dentro del compás (el punto encendido).
  const handleFinish = useCallback(async () => {
    setFinished(true);
    await luaCompleteActivity(song.lyrics.length);
  }, []);

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
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.common.back}
        kicker={t.hub.luaTitle} icon="song" title={song.title} subtitle={song.subtitle} />

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
        </View>

        {/* ACOPROS (11/2026): la app ya no recita ni canta. Canta el adulto. */}
        <View style={s.rhythmCard}>
          <Text style={s.rhythmHint}>{t.luaHub.songSingNote}</Text>
        </View>

        {/* Tarjeta de letra con ritmo */}
        <View style={s.lyricsCard}>
          <View style={s.lyricsHeader}>
            <BlockIcon name="song" color={LUA_COLORS.coralDark} size={20} />
            <Text style={s.lyricsHeading}>{song.title}</Text>
          </View>
          {song.lyrics.map((line, idx) => (
            <Text
              key={idx}
              style={s.lyricLine}
            >
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
  finishBtnTxt: { fontFamily: FONT.bodyBold,color: LUA_COLORS.textOnPrimary, fontSize: 17 },
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
  // Verso en curso del recitado. Fondo y peso, no color de texto solo: sobre
  // fondo claro un cambio de tinta se pierde, y el niño tiene que localizar la
  // línea de un vistazo mientras sigue el pulso.
  lyricLineOn: {
    backgroundColor: LUA_COLORS.coralLight,
    color: LUA_COLORS.coralDark,
    fontWeight: "800",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginHorizontal: -8,
  },
  rhythmCard: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: LUA_COLORS.coralLight,
    gap: 12,
  },
  rhythmHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: LUA_COLORS.coralDark,
  },
  rhythmHint: {
    fontSize: 12.5,
    fontWeight: "600",
    color: LUA_COLORS.textSecondary,
    lineHeight: 18,
    marginTop: -6,
  },
  rhythmBtn: {
    alignSelf: "center",
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: LUA_COLORS.coralDark,
  },
  rhythmBtnOn: { backgroundColor: LUA_COLORS.primaryDark },
  rhythmBtnTxt: { fontFamily: FONT.bodyBold,fontSize: 14.5, color: "#FFFFFF" },
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

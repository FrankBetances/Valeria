// ============================================================================
// Valeria+ · Aventuras con Lúa · Visualizador de Cuentos Terapéuticos
// Lectura guiada con comprensión, vocabulario y consigna de dibujo libre.
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
import { speakToChild } from "../../valeriaVoice";
import { LUA_COLORS, LUA_RADII } from "../Theme/luaTheme";
import { LuaStory, LUA_STORIES_CATALOG } from "../index";
import { luaCompleteActivity } from "../luaActivityReward";

interface Props {
  navigation: any;
  route: {
    params: {
      storyId: string;
    };
  };
}

export const LuaStoryViewerScreen: React.FC<Props> = ({ navigation, route }) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { storyId } = route.params || {};

  const story: LuaStory | undefined =
    LUA_STORIES_CATALOG.find((s) => s.id === storyId) || LUA_STORIES_CATALOG[0];

  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const handleFinish = useCallback(async () => {
    setFinished(true);
    await luaCompleteActivity(story.paragraphs.length);
  }, []);

  const handleSpeakParagraph = useCallback(() => {
    if (story && story.paragraphs[paragraphIndex]) {
      speakToChild(story.paragraphs[paragraphIndex]);
    }
  }, [story, paragraphIndex]);

  const handleAnswerQuestion = (qId: string, optId: string, isCorrect: boolean, feedback: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optId }));
    speakToChild(feedback);
  };

  if (!story) {
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

  const currentParagraph = story.paragraphs[paragraphIndex];

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
          <Text style={s.storyTitle} numberOfLines={1}>
            {story.title}
          </Text>
          <Text style={s.storyAge}>
            {story.suggestedAgeText}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de lectura guiada */}
        <View style={s.readingCard}>
          <View style={s.readingCardHeader}>
            <Text style={s.pageIndicator}>
              {t.luaHub.storyPages(paragraphIndex + 1, story.paragraphs.length)}
            </Text>
            <Pressable
              onPress={handleSpeakParagraph}
              style={s.listenBtn}
              accessibilityRole="button"
              accessibilityLabel={t.luaHub.storyReadAloud}
            >
              <BlockIcon name="speaker" color={LUA_COLORS.primary} size={22} />
            </Pressable>
          </View>

          <Text style={s.paragraphText}>
            {currentParagraph}
          </Text>

          {/* Navegación entre párrafos */}
          <View style={s.pageNavRow}>
            {paragraphIndex > 0 ? (
              <Pressable
                onPress={() => setParagraphIndex((p) => p - 1)}
                style={s.pageNavBtn}
                accessibilityRole="button"
                accessibilityLabel={t.luaHub.evalPrevQuestion}
              >
                <Text style={s.pageNavBtnTxt}>{t.luaHub.evalPrevQuestion}</Text>
              </Pressable>
            ) : <View style={s.pageNavSpacer} />}

            {paragraphIndex < story.paragraphs.length - 1 ? (
              <Pressable
                onPress={() => setParagraphIndex((p) => p + 1)}
                style={[s.pageNavBtn, s.pageNavBtnNext]}
                accessibilityRole="button"
                accessibilityLabel={t.luaHub.evalNextQuestion}
              >
                <Text style={s.pageNavBtnTxtNext}>{t.luaHub.evalNextQuestion}</Text>
              </Pressable>
            ) : <View style={s.pageNavSpacer} />}
          </View>
        </View>

        {/* Vocabulario clave */}
        {story.newWords.length > 0 && (
          <View style={s.sectionWrap}>
            <Text style={s.sectionHeaderTitle}>{t.luaHub.storyVocabTitle}</Text>
            <View style={s.vocabList}>
              {story.newWords.map((card) => (
                <View key={card.word} style={s.vocabCard}>
                  <Text style={s.vocabWord}>{card.word}</Text>
                  <Text style={s.vocabDef}>{card.definition}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Preguntas de comprensión */}
        {story.comprehensionQuestions.length > 0 && (
          <View style={s.sectionWrap}>
            <Text style={s.sectionHeaderTitle}>{t.luaHub.storyQuestionsTitle}</Text>
            {story.comprehensionQuestions.map((q, idx) => (
              <View key={q.id} style={s.questionBox}>
                <Text style={s.questionTitle}>
                  {`${idx + 1}. ${q.question}`}
                </Text>
                <View style={s.optionsCol}>
                  {q.options.map((opt) => {
                    const isSelected = selectedAnswers[q.id] === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => handleAnswerQuestion(q.id, opt.id, opt.isCorrect, q.hint)}
                        style={[
                          s.optionItem,
                          isSelected && (opt.isCorrect ? s.optionItemCorrect : s.optionItemChosen),
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={opt.text} // i18n-exempt: catálogo clínico dinámico
                      >
                        <Text
                          style={[
                            s.optionItemTxt,
                            isSelected && (opt.isCorrect ? s.optionCorrectTxt : s.optionChosenTxt),
                          ]}
                        >
                          {opt.text}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Consigna de dibujo libre con Lúa */}
        {story.drawingPrompt ? (
          <View style={s.drawingBox}>
            <View style={s.drawingHeader}>
              <CatPixel size={44} />
              <View style={s.drawingHeaderText}>
                <Text style={s.drawingTitle}>{t.luaHub.storyDrawingPrompt}</Text>
                <Text style={s.drawingDesc}>{story.drawingPrompt}</Text>
              </View>
            </View>
            <Pressable
              style={s.drawingActionBtn}
              onPress={() => navigation.navigate("Writing")}
              accessibilityRole="button"
              accessibilityLabel={t.luaHub.storyOpenDrawing}
            >
              <Text style={s.drawingActionTxt}>{t.luaHub.storyOpenDrawing}</Text>
            </Pressable>
          </View>
        ) : null}

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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LUA_COLORS.surfaceSubtle,
    marginRight: 12,
  },
  backTxt: {
    fontSize: 22,
    color: LUA_COLORS.textPrimary,
    fontWeight: "700",
  },
  titleWrap: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: LUA_COLORS.primary,
  },
  storyAge: {
    fontSize: 12,
    color: LUA_COLORS.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  readingCard: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    marginBottom: 20,
  },
  readingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: "700",
    color: LUA_COLORS.primary,
  },
  listenBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: LUA_COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  paragraphText: {
    fontSize: 20,
    fontWeight: "600",
    color: LUA_COLORS.textPrimary,
    lineHeight: 32,
    marginBottom: 24,
  },
  pageNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageNavBtn: {
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  pageNavBtnNext: {
    backgroundColor: LUA_COLORS.primary,
  },
  pageNavBtnTxt: {
    fontSize: 14,
    fontWeight: "700",
    color: LUA_COLORS.textSecondary,
  },
  pageNavBtnTxtNext: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  pageNavSpacer: {
    width: 80,
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    marginBottom: 10,
  },
  vocabList: {
    gap: 8,
  },
  vocabCard: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.md,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: LUA_COLORS.amber,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
  },
  vocabWord: {
    fontSize: 15,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    marginBottom: 2,
  },
  vocabDef: {
    fontSize: 13,
    color: LUA_COLORS.textSecondary,
    lineHeight: 18,
  },
  questionBox: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.md,
    padding: 16,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    marginBottom: 12,
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    marginBottom: 12,
    lineHeight: 22,
  },
  optionsCol: {
    gap: 8,
  },
  optionItem: {
    minHeight: 48,
    borderRadius: LUA_RADII.sm,
    backgroundColor: LUA_COLORS.surfaceSubtle,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionItemCorrect: {
    borderColor: LUA_COLORS.mint,
    backgroundColor: LUA_COLORS.mintLight,
  },
  optionItemChosen: {
    borderColor: LUA_COLORS.borderStrong,
    backgroundColor: LUA_COLORS.surfaceSubtle,
  },
  optionItemTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: LUA_COLORS.textPrimary,
  },
  optionCorrectTxt: {
    color: LUA_COLORS.mintDark,
    fontWeight: "700",
  },
  optionChosenTxt: {
    color: LUA_COLORS.textSecondary,
  },
  drawingBox: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 18,
    borderWidth: 1.5,
    borderColor: LUA_COLORS.primaryMid,
    marginBottom: 20,
  },
  drawingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  drawingHeaderText: {
    flex: 1,
    marginLeft: 14,
  },
  drawingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: LUA_COLORS.primary,
    marginBottom: 4,
  },
  drawingDesc: {
    fontSize: 13,
    color: LUA_COLORS.textSecondary,
    lineHeight: 18,
  },
  drawingActionBtn: {
    minHeight: 48,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  drawingActionTxt: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});

// ============================================================================
// Valeria+ · Aventuras con Lúa · Reproductor de Evaluación Interactiva
// Banco de preguntas clínicas con pautas de modelado sin castigo (recasting).
//
// Dos cosas que no se pueden perder al tocar esta pantalla:
//
//  · AL NIÑO NO SE LE LOCUTA LA PAUTA DEL ADULTO. `modelingFeedback` está
//    escrito en impersonal para el terapeuta («Se repite la consigna señalando
//    con la mano abierta el objeto correcto») y se le decía al niño en voz
//    alta justo al fallar. Lo que suena es `childRecast`; la pauta se LEE, en
//    el panel del adulto.
//  · UN ÍTEM `child_choice` SE RESPONDE MIRANDO, NO LEYENDO. Por debajo de 4
//    años no hay lectura: cada opción va con su ficha del banco propio. Los
//    ítems `adult_record` no son estímulos —son la hoja de registro— y por eso
//    se pintan distintos y no se locutan al tocarlos.
// ============================================================================
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../../i18n";
import { BlockIcon } from "../../ValeriaBlockIcons";
import { CatPixel } from "../../ValeriaCatPixel";
import { speakToChild } from "../../valeriaVoice";
import { FichaVisual } from "../../ValeriaPictograms";
import { registerSession } from "../../valeriaGamification";
import { luaSessionReward } from "../../valeriaLuaSession";
import { LUA_COLORS, LUA_RADII } from "../Theme/luaTheme";
import {
  AgeBand,
  LuaAssessmentQuestion,
  LUA_ASSESSMENT_CATALOG,
} from "../index";

interface Props {
  navigation: any;
  route: {
    params: {
      ageBand: AgeBand;
      initialQuestionIndex?: number;
    };
  };
}

export const LuaAssessmentPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { ageBand = "0-2", initialQuestionIndex = 0 } = route.params || {};

  const bandQuestions: LuaAssessmentQuestion[] = LUA_ASSESSMENT_CATALOG.filter(
    (q) => q.ageBand === ageBand
  );

  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, initialQuestionIndex), Math.max(0, bandQuestions.length - 1))
  );
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQ: LuaAssessmentQuestion | undefined = bandQuestions[currentIndex];

  useEffect(() => {
    setSelectedOptionId(null);
  }, [currentIndex]);

  const handleSpeakPrompt = useCallback(() => {
    if (currentQ?.prompt) {
      speakToChild(currentQ.prompt);
    }
  }, [currentQ]);

  const handleSelectOption = (optionId: string, isTarget: boolean) => {
    setSelectedOptionId(optionId);
    if (!currentQ) return;
    // Lo que oye el niño. Nunca `modelingFeedback`: eso es la pauta del adulto
    // y se lee en el panel, no se locuta.
    speakToChild(isTarget ? currentQ.clinicalSupport.targetFeedback : currentQ.childRecast);
  };

  // Cierre de serie. Sin esto la serie no existía para la app: ni XP, ni racha,
  // ni insignia, y la gata del aparato se quedaba con la cara de antes mientras
  // el niño veía su premio en la tableta.
  const finishBand = useCallback(async () => {
    setIsCompleted(true);
    try {
      const premio = await registerSession(2, bandQuestions.length);
      luaSessionReward(premio); // el mismo premio, en el cristal
    } catch (e) { /* gamificación no disponible */ }
  }, [bandQuestions.length]);

  const handleNext = () => {
    if (currentIndex < bandQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      void finishBand();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!currentQ || bandQuestions.length === 0) {
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
          <Text style={s.topTitle}>{t.luaHub.secAssessmentTitle}</Text>
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
        <View style={s.progressWrap}>
          <Text style={s.progressTxt}>
            {t.luaHub.evalProgress(currentIndex + 1, bandQuestions.length)}
          </Text>
          <View style={s.progressBarBg}>
            <View
              style={[
                s.progressBarFill,
                { width: `${((currentIndex + 1) / bandQuestions.length) * 100}%` },
              ]}
            />
          </View>
        </View>
        <Pressable
          onPress={() => setGuidanceOpen(true)}
          style={s.infoBtn}
          accessibilityRole="button"
          accessibilityLabel={t.luaHub.evalClinicalSupport}
          hitSlop={8}
        >
          <BlockIcon name="info" color={LUA_COLORS.primary} size={22} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {isCompleted ? (
          /* Pantalla de logro / felicitación */
          <View style={s.completeCard}>
            <CatPixel size={90} />
            <Text style={s.completeTitle}>{t.luaHub.evalBandCompletedTitle}</Text>
            <Text style={s.completeSub}>{t.luaHub.evalBandCompletedSub}</Text>
            <Pressable
              style={s.primaryActionBtn}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel={t.luaHub.evalBackToHub}
            >
              <Text style={s.primaryActionTxt}>{t.luaHub.evalBackToHub}</Text>
            </Pressable>
            <Pressable
              style={s.secondaryActionBtn}
              onPress={() => {
                setCurrentIndex(0);
                setIsCompleted(false);
              }}
              accessibilityRole="button"
              accessibilityLabel={t.luaHub.evalTryAgain}
            >
              <Text style={s.secondaryActionTxt}>{t.luaHub.evalTryAgain}</Text>
            </Pressable>
          </View>
        ) : (
          /* Pregunta activa */
          <>
            <View style={s.questionHeader}>
              <View style={s.mascotRow}>
                <CatPixel size={52} />
                <Pressable
                  onPress={handleSpeakPrompt}
                  style={s.speakPromptBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t.luaHub.evalPlayAudio}
                >
                  <BlockIcon name="speaker" color={LUA_COLORS.primary} size={22} />
                </Pressable>
              </View>
              <Text style={s.questionText}>
                {currentQ.prompt}
              </Text>
              {currentQ.questionPic && (
                <View style={s.questionPicWrap}>
                  <FichaVisual word="" emoji="" pic={currentQ.questionPic} size={84} />
                </View>
              )}
            </View>

            {/* Las opciones se pintan según QUIÉN responde. Un niño de 0-2 no
                lee: en 'child_choice' toca una ficha grande. En 'adult_record'
                lo que hay es la hoja de registro del adulto, y por eso va
                marcada como tal y en filas compactas. */}
            {currentQ.mode === "child_choice" ? (
              <View style={s.picOptionsGrid}>
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <Pressable
                      key={opt.id}
                      onPress={() => handleSelectOption(opt.id, opt.isTarget)}
                      style={[
                        s.picOption,
                        isSelected && (opt.isTarget ? s.picOptionTarget : s.picOptionRecast),
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={opt.label} // i18n-exempt: catálogo clínico dinámico
                    >
                      <FichaVisual word={opt.label} emoji="" pic={opt.pic} size={72} />
                      <Text style={s.picOptionLabel} numberOfLines={2}>
                        {opt.label}
                      </Text>
                      {isSelected && (
                        <View style={s.picOptionMark}>
                          <BlockIcon
                            name={opt.isTarget ? "check" : "tip"}
                            color={opt.isTarget ? LUA_COLORS.mintDark : LUA_COLORS.amberDark}
                            size={22}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={s.recordBlock}>
                <Text style={s.recordHeading}>{t.luaHub.evalAdultRecord}</Text>
                <Text style={s.recordHint}>{t.luaHub.evalAdultRecordHint}</Text>
                <View style={s.optionsContainer}>
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        onPress={() => handleSelectOption(opt.id, opt.isTarget)}
                        style={[
                          s.optionButton,
                          isSelected && (opt.isTarget ? s.optionTargetSelected : s.optionRecastSelected),
                        ]}
                        accessibilityRole="button"
                        accessibilityLabel={opt.label} // i18n-exempt: catálogo clínico dinámico
                      >
                        <View style={s.optionCheckMark}>
                          {isSelected && (
                            <BlockIcon
                              name={opt.isTarget ? "check" : "tip"}
                              color={opt.isTarget ? LUA_COLORS.mintDark : LUA_COLORS.amberDark}
                              size={20}
                            />
                          )}
                        </View>
                        <Text
                          style={[
                            s.optionLabel,
                            isSelected && (opt.isTarget ? s.optionTargetTxt : s.optionRecastTxt),
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Banner de refuerzo o modelado clínico */}
            {selectedOptionId && (
              <View
                style={[
                  s.feedbackBanner,
                  currentQ.options.find((o) => o.id === selectedOptionId)?.isTarget
                    ? s.feedbackTarget
                    : s.feedbackRecast,
                ]}
              >
                <Text style={s.feedbackTitle}>
                  {currentQ.options.find((o) => o.id === selectedOptionId)?.isTarget
                    ? t.luaHub.evalTargetReinforcement
                    : t.luaHub.evalRecastModel}
                </Text>
                <Text style={s.feedbackDesc}>
                  {currentQ.options.find((o) => o.id === selectedOptionId)?.isTarget
                    ? currentQ.clinicalSupport.targetFeedback
                    : currentQ.childRecast}
                </Text>
                {!currentQ.options.find((o) => o.id === selectedOptionId)?.isTarget && (
                  <Text style={s.feedbackAdultNote}>
                    {currentQ.clinicalSupport.modelingFeedback}
                  </Text>
                )}
              </View>
            )}

            {/* Botones de navegación inferior */}
            <View style={s.navRow}>
              {currentIndex > 0 && (
                <Pressable
                  onPress={handlePrev}
                  style={s.prevBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t.luaHub.evalPrevQuestion}
                >
                  <Text style={s.prevTxt}>{t.luaHub.evalPrevQuestion}</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleNext}
                style={[s.nextBtn, currentIndex === 0 && s.nextBtnFull]}
                accessibilityRole="button"
                accessibilityLabel={
                  currentIndex === bandQuestions.length - 1
                    ? t.luaHub.evalFinishBand
                    : t.luaHub.evalNextQuestion
                }
              >
                <Text style={s.nextTxt}>
                  {currentIndex === bandQuestions.length - 1
                    ? t.luaHub.evalFinishBand
                    : t.luaHub.evalNextQuestion}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal de soporte clínico para el adulto/logopeda */}
      <Modal
        visible={guidanceOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setGuidanceOpen(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{t.luaHub.evalClinicalSupport}</Text>
            <ScrollView style={s.modalScroll}>
              <Text style={s.modalSectionHeader}>{t.luaHub.evalRecastModel}</Text>
              <Text style={s.modalText}>{currentQ.clinicalSupport.modelingFeedback}</Text>

              {currentQ.clinicalSupport.adultGuidance && (
                <>
                  <Text style={s.modalSectionHeader}>{t.luaHub.evalAdultGuidance}</Text>
                  <Text style={s.modalText}>{currentQ.clinicalSupport.adultGuidance}</Text>
                </>
              )}
            </ScrollView>
            <Pressable
              onPress={() => setGuidanceOpen(false)}
              style={s.modalCloseBtn}
              accessibilityRole="button"
              accessibilityLabel={t.common.close}
            >
              <Text style={s.modalCloseTxt}>{t.common.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const s = StyleSheet.create({
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
  topTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: LUA_COLORS.primary,
  },
  progressWrap: {
    flex: 1,
    marginRight: 12,
  },
  progressTxt: {
    fontSize: 12,
    fontWeight: "700",
    color: LUA_COLORS.textSecondary,
    marginBottom: 4,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: LUA_COLORS.surfaceSubtle,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: LUA_COLORS.primary,
  },
  infoBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LUA_COLORS.primaryLight,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  questionHeader: {
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    marginBottom: 20,
  },
  mascotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  // Ficha grande: es lo que el niño toca. 72 dp de dibujo + etiqueta, muy por
  // encima del objetivo táctil mínimo, porque quien responde tiene 2 años.
  picOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  picOption: {
    width: 132,
    minHeight: 148,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: LUA_RADII.lg,
    borderWidth: 2,
    borderColor: LUA_COLORS.border,
    backgroundColor: LUA_COLORS.surface,
  },
  picOptionTarget: {
    borderColor: LUA_COLORS.mintDark,
    backgroundColor: LUA_COLORS.mintLight,
  },
  picOptionRecast: {
    borderColor: LUA_COLORS.amberDark,
    backgroundColor: LUA_COLORS.amberLight,
  },
  picOptionLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: LUA_COLORS.textPrimary,
  },
  picOptionMark: { position: "absolute", top: 8, right: 8 },
  questionPicWrap: { alignItems: "center", marginTop: 10 },
  // Hoja de registro del adulto: se distingue a propósito de las fichas del
  // niño, para que nadie confunda «lo que el peque elige» con «lo que yo anoto».
  recordBlock: {
    marginTop: 8,
    padding: 12,
    borderRadius: LUA_RADII.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: LUA_COLORS.borderStrong,
    backgroundColor: LUA_COLORS.surfaceSubtle,
  },
  recordHeading: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: LUA_COLORS.textSecondary,
  },
  recordHint: {
    fontSize: 13,
    lineHeight: 18,
    color: LUA_COLORS.textMuted,
    marginTop: 2,
    marginBottom: 10,
  },
  feedbackAdultNote: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: LUA_COLORS.border,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
    color: LUA_COLORS.textMuted,
  },
  speakPromptBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LUA_COLORS.primaryLight,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: LUA_COLORS.border,
  },
  optionTargetSelected: {
    borderColor: LUA_COLORS.mint,
    backgroundColor: LUA_COLORS.mintLight,
  },
  optionRecastSelected: {
    borderColor: LUA_COLORS.amber,
    backgroundColor: LUA_COLORS.amberLight,
  },
  optionCheckMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: LUA_COLORS.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  optionTargetTxt: {
    color: LUA_COLORS.mintDark,
  },
  optionRecastTxt: {
    color: LUA_COLORS.amberDark,
  },
  feedbackBanner: {
    borderRadius: LUA_RADII.md,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  feedbackTarget: {
    backgroundColor: LUA_COLORS.mintLight,
    borderColor: LUA_COLORS.mint,
  },
  feedbackRecast: {
    backgroundColor: LUA_COLORS.amberLight,
    borderColor: LUA_COLORS.amber,
  },
  feedbackTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
    color: LUA_COLORS.textPrimary,
  },
  feedbackDesc: {
    fontSize: 14,
    color: LUA_COLORS.textSecondary,
    lineHeight: 20,
  },
  navRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  prevBtn: {
    flex: 1,
    minHeight: 52,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.surface,
    borderWidth: 1.5,
    borderColor: LUA_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  prevTxt: {
    fontSize: 15,
    fontWeight: "700",
    color: LUA_COLORS.textSecondary,
  },
  nextBtn: {
    flex: 2,
    minHeight: 52,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnFull: {
    flex: 1,
  },
  nextTxt: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  completeCard: {
    alignItems: "center",
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 24,
    borderWidth: 1,
    borderColor: LUA_COLORS.border,
    marginTop: 20,
  },
  completeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: LUA_COLORS.primaryDark,
    marginTop: 16,
    marginBottom: 8,
  },
  completeSub: {
    fontSize: 14,
    color: LUA_COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryActionBtn: {
    width: "100%",
    minHeight: 52,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryActionTxt: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  secondaryActionBtn: {
    width: "100%",
    minHeight: 52,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.surface,
    borderWidth: 1.5,
    borderColor: LUA_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionTxt: {
    fontSize: 15,
    fontWeight: "700",
    color: LUA_COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "80%",
    backgroundColor: LUA_COLORS.surface,
    borderRadius: LUA_RADII.lg,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: LUA_COLORS.primary,
    marginBottom: 14,
  },
  modalScroll: {
    marginBottom: 16,
  },
  modalSectionHeader: {
    fontSize: 13,
    fontWeight: "800",
    color: LUA_COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  modalText: {
    fontSize: 14,
    color: LUA_COLORS.textSecondary,
    lineHeight: 20,
  },
  modalCloseBtn: {
    minHeight: 48,
    borderRadius: LUA_RADII.md,
    backgroundColor: LUA_COLORS.surfaceSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseTxt: {
    fontSize: 15,
    fontWeight: "700",
    color: LUA_COLORS.textPrimary,
  },
});

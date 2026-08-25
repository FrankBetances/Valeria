// ============================================================================
// Valeria+ · Pantalla de la Pizarra Mágica de Lúa (Grafomotricidad & Dislexia)
// Módulo interactivo de trazado asistido con lápiz óptico / stylus para
// afianzar la memoria motora kinestésica del trazo y evitar inversiones (b vs d).
// ============================================================================
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Modal,
  Dimensions, Animated, Easing, Vibration, Platform,
} from 'react-native';
import { V } from './valeriaTheme';
import { BlockIcon } from './ValeriaBlockIcons';
import { CatPixel } from './ValeriaCatPixel';
import { useT } from './i18n';
import { speakWordSlow, speakToChild } from './valeriaVoice';
import { ValeriaWritingCanvas, ValeriaWritingCanvasRef } from './ValeriaWritingCanvas';
import { WRITING_EXERCISES, WritingItem } from './valeriaWritingBank';

const PALETTE = [
  { id: 'turquoise', color: '#00C4BE', name: 'Turquesa' },
  { id: 'gold', color: '#F59E0B', name: 'Dorado' },
  { id: 'coral', color: '#F43F5E', name: 'Coral' },
  { id: 'sky', color: '#3B82F6', name: 'Cielo' },
  { id: 'violet', color: '#8B5CF6', name: 'Lavanda' },
];

const STROKE_WIDTHS = [
  { id: 'fine', width: 5, label: 'Fino' },
  { id: 'medium', width: 9, label: 'Medio' },
  { id: 'thick', width: 15, label: 'Grueso' },
];

export interface ValeriaWritingExerciseScreenProps {
  onBack?: () => void;
  onComplete?: (xpEarned: number) => void;
}

export const ValeriaWritingExerciseScreen: React.FC<ValeriaWritingExerciseScreenProps> = ({
  onBack,
  onComplete,
}) => {
  const t = useT();
  const canvasRef = useRef<ValeriaWritingCanvasRef>(null);
  const [category, setCategory] = useState<'critical' | 'warmup' | 'free'>('critical');
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#00C4BE');
  const [selectedWidth, setSelectedWidth] = useState(9);
  const [showMontessori, setShowMontessori] = useState(true);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{ success: boolean; score: number } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Filtrar ejercicios por categoría
  const currentCategoryList = WRITING_EXERCISES.filter((item) =>
    category === 'free' ? false : item.category === category,
  );

  const currentExercise: WritingItem | undefined = currentCategoryList[exerciseIndex];

  // Canvas size
  const windowWidth = Dimensions.get('window').width;
  const canvasWidth = Math.min(windowWidth - 32, 440);
  const canvasHeight = 310;

  const handleStrokeChange = (count: number) => {
    setHasDrawn(count > 0);
  };

  const handleValidateStroke = (success: boolean, score: number) => {
    setEvaluationResult({ success, score });
  };

  const handleHearModel = () => {
    if (currentExercise) {
      speakWordSlow(currentExercise.phoneme);
    }
  };

  const handleCheck = () => {
    if (!hasDrawn) return;

    if (category === 'free') {
      setShowCelebration(true);
      speakToChild('¡Qué dibujo tan bonito has hecho en la pizarra!');
      return;
    }

    if (evaluationResult?.success || !currentExercise?.guide.waypoints.length) {
      setShowCelebration(true);
      speakToChild('¡Excelente! Has seguido la dirección perfecta.');
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        try { Vibration.vibrate([0, 40, 60, 40]); } catch { /* noop */ }
      }
    } else {
      speakToChild('¡Casi casi! Sigue las flechas y los números despacito.');
    }
  };

  const handleNextExercise = () => {
    setShowCelebration(false);
    setEvaluationResult(null);
    setHasDrawn(false);
    canvasRef.current?.clear();

    if (exerciseIndex + 1 < currentCategoryList.length) {
      setExerciseIndex(exerciseIndex + 1);
    } else {
      onComplete?.(30); // XP ganada
      setExerciseIndex(0);
    }
  };

  return (
    <View style={s.container}>
      {/* Cabecera Principal */}
      <View style={s.header}>
        {onBack && (
          <Pressable onPress={onBack} style={s.backBtn} accessibilityRole="button">
            <BlockIcon name="tabTherapies" color={V.color.primaryDark} size={20} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.kicker}>{t.writing.kicker}</Text>
          <Text style={s.title}>{t.writing.title}</Text>
        </View>
        <View style={s.headerBadge}>
          <BlockIcon name="pencil" color={V.color.primary} size={20} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Selector de Categorías / Pestañas */}
        <View style={s.tabRow}>
          <Pressable
            onPress={() => { setCategory('critical'); setExerciseIndex(0); canvasRef.current?.clear(); }}
            style={[s.tabPill, category === 'critical' && s.tabPillActive]}
          >
            <BlockIcon name="dyslexia" color={category === 'critical' ? '#FFFFFF' : V.color.textSecondary} size={15} />
            <Text style={[s.tabPillTxt, category === 'critical' && s.tabPillTxtActive]}>{t.writing.tabCritical}</Text>
          </Pressable>

          <Pressable
            onPress={() => { setCategory('warmup'); setExerciseIndex(0); canvasRef.current?.clear(); }}
            style={[s.tabPill, category === 'warmup' && s.tabPillActive]}
          >
            <BlockIcon name="move" color={category === 'warmup' ? '#FFFFFF' : V.color.textSecondary} size={15} />
            <Text style={[s.tabPillTxt, category === 'warmup' && s.tabPillTxtActive]}>{t.writing.tabWarmup}</Text>
          </Pressable>

          <Pressable
            onPress={() => { setCategory('free'); setExerciseIndex(0); canvasRef.current?.clear(); }}
            style={[s.tabPill, category === 'free' && s.tabPillActive]}
          >
            <BlockIcon name="tip" color={category === 'free' ? '#FFFFFF' : V.color.textSecondary} size={15} />
            <Text style={[s.tabPillTxt, category === 'free' && s.tabPillTxtActive]}>{t.writing.tabFree}</Text>
          </Pressable>
        </View>

        {/* Tarjeta de Consigna / Objetivo */}
        {currentExercise && category !== 'free' && (
          <View style={s.instructionCard}>
            <View style={s.instructionHeader}>
              <View style={s.badgeLetter}>
                <Text style={s.badgeLetterTxt}>{currentExercise.guide.label}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.instructionTitle}>{currentExercise.title}</Text>
                <Text style={s.instructionPrompt}>{currentExercise.prompt}</Text>
              </View>
              <Pressable onPress={handleHearModel} style={s.hearBtn} accessibilityRole="button">
                <BlockIcon name="speaker" color={V.color.primaryDark} size={18} />
                <Text style={s.hearBtnTxt}>{t.writing.hearModel}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Barra de Herramientas de Trazado (Colores, Pincel, Pauta) */}
        <View style={s.toolsRow}>
          {/* Selector de Color de Tiza */}
          <View style={s.paletteGroup}>
            {PALETTE.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setSelectedColor(p.color)}
                style={[s.colorCircle, { backgroundColor: p.color }, selectedColor === p.color && s.colorCircleActive]}
                accessibilityLabel={p.name}
              />
            ))}
          </View>

          {/* Selector de Grosor */}
          <View style={s.widthGroup}>
            {STROKE_WIDTHS.map((w) => (
              <Pressable
                key={w.id}
                onPress={() => setSelectedWidth(w.width)}
                style={[s.widthBtn, selectedWidth === w.width && s.widthBtnActive]}
              >
                <View style={[s.widthDot, { width: w.width, height: w.width, backgroundColor: selectedColor }]} />
              </Pressable>
            ))}
          </View>

          {/* Toggle Pauta Montessori */}
          <Pressable
            onPress={() => setShowMontessori(!showMontessori)}
            style={[s.toolBtn, showMontessori && s.toolBtnActive]}
            accessibilityRole="switch"
          >
            <BlockIcon name={showMontessori ? 'eye' : 'eyeOff'} color={showMontessori ? V.color.primaryDark : V.color.textSecondary} size={16} />
          </Pressable>

          {/* Botón Borrar */}
          <Pressable
            onPress={() => { canvasRef.current?.clear(); setHasDrawn(false); setEvaluationResult(null); }}
            style={s.toolBtn}
            accessibilityRole="button"
          >
            <BlockIcon name="eraser" color="#EF4444" size={16} />
          </Pressable>
        </View>

        {/* Lienzo de Dibujo / Pizarra */}
        <ValeriaWritingCanvas
          ref={canvasRef}
          guide={category === 'free' ? undefined : currentExercise?.guide}
          strokeColor={selectedColor}
          strokeWidth={selectedWidth}
          showMontessoriLines={showMontessori}
          width={canvasWidth}
          height={canvasHeight}
          onStrokeChange={handleStrokeChange}
          onValidateStroke={handleValidateStroke}
        />

        {/* Botonera de Acción en Thumb Zone */}
        <View style={s.actionsRow}>
          <Pressable
            onPress={() => { canvasRef.current?.clear(); setHasDrawn(false); setEvaluationResult(null); }}
            style={s.clearActionBtn}
            accessibilityRole="button"
          >
            <BlockIcon name="repeat" color={V.color.textSecondary} size={18} />
            <Text style={s.clearActionTxt}>{t.writing.clearCanvas}</Text>
          </Pressable>

          <Pressable
            onPress={handleCheck}
            disabled={!hasDrawn}
            style={[s.checkActionBtn, !hasDrawn && s.checkActionBtnDisabled]}
            accessibilityRole="button"
          >
            <BlockIcon name="check" color="#FFFFFF" size={20} />
            <Text style={s.checkActionTxt}>{t.writing.checkStroke}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Modal de Celebración de Lúa */}
      <Modal visible={showCelebration} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <View style={s.catBadge}>
              <CatPixel />
            </View>
            <Text style={s.modalTitle}>{t.writing.strokeCompleted}</Text>
            <Text style={s.modalSub}>{t.writing.strokeCompletedSub}</Text>

            <Pressable onPress={handleNextExercise} style={s.nextBtn} accessibilityRole="button">
              <Text style={s.nextBtnTxt}>{t.writing.nextExercise}</Text>
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
    backgroundColor: '#F6FAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F9F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontSize: 10,
    fontFamily: V.font.bold,
    color: V.color.primaryDark,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 17,
    fontFamily: V.font.extrabold,
    color: V.color.textPrimary,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    width: '100%',
    justifyContent: 'center',
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: V.color.primary,
    borderColor: V.color.primaryDark,
  },
  tabPillTxt: {
    fontSize: 12,
    fontFamily: V.font.bold,
    color: V.color.textSecondary,
  },
  tabPillTxtActive: {
    color: '#FFFFFF',
  },
  instructionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...V.shadow.card,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeLetter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F9F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: V.color.primary,
  },
  badgeLetterTxt: {
    fontSize: 22,
    fontFamily: V.font.extrabold,
    color: V.color.primaryDark,
  },
  instructionTitle: {
    fontSize: 15,
    fontFamily: V.font.bold,
    color: V.color.textPrimary,
  },
  instructionPrompt: {
    fontSize: 12,
    fontFamily: V.font.regular,
    color: V.color.textSecondary,
    marginTop: 2,
  },
  hearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F0FDF9',
    borderWidth: 1,
    borderColor: V.color.primaryLight,
  },
  hearBtnTxt: {
    fontSize: 11,
    fontFamily: V.font.bold,
    color: V.color.primaryDark,
  },
  toolsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...V.shadow.card,
  },
  paletteGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: '#1E293B',
    transform: [{ scale: 1.15 }],
  },
  widthGroup: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  widthBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widthBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  widthDot: {
    borderRadius: 10,
  },
  toolBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnActive: {
    backgroundColor: '#CCFBF1',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
    justifyContent: 'center',
  },
  clearActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  clearActionTxt: {
    fontSize: 14,
    fontFamily: V.font.bold,
    color: V.color.textSecondary,
  },
  checkActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    ...V.shadow.button,
  },
  checkActionBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  checkActionTxt: {
    fontSize: 15,
    fontFamily: V.font.bold,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...V.shadow.card,
  },
  catBadge: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: V.font.extrabold,
    color: '#16A34A',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    fontFamily: V.font.regular,
    color: V.color.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  nextBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: V.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnTxt: {
    fontSize: 15,
    fontFamily: V.font.bold,
    color: '#FFFFFF',
  },
});

// ============================================================================
// Valeria+ · Componente Principal de Cuadrícula Sintáctica (3 Ranuras)
// Sujeto (Amarillo) + Acción (Verde) + Objeto (Naranja)
// ============================================================================
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { Locale } from '../valeriaLocale';
import type { GrammaticalRole, SyntaxItem, SyntaxSlotState } from './syntaxGridTypes';
import { FITZGERALD_THEMES } from './fitzgeraldPalette';
import { getSyntaxBankForLocale } from './syntaxBanksFor';
import { SyntaxSlotCell } from './SyntaxSlotCell';
import { PictogramCategoryPicker } from './PictogramCategoryPicker';
import { speakToChild } from '../valeriaVoice';
import { PICTO_KEYS } from '../ValeriaPixelArt';
import { sendLuaOpcode } from '../valeriaLuaSession';
import { LUA_OP } from '../valeriaLuaProtocol';

export interface ValeriaSyntaxGridProps {
  locale: Locale;
  onSentenceComplete?: (sentence: string, items: [SyntaxItem, SyntaxItem, SyntaxItem]) => void;
  onValidateTpr?: (success: boolean) => void;
}

export const ValeriaSyntaxGrid: React.FC<ValeriaSyntaxGridProps> = ({
  locale,
  onSentenceComplete,
  onValidateTpr,
}) => {
  const bank = useMemo(() => getSyntaxBankForLocale(locale), [locale]);

  const [slots, setSlots] = useState<[SyntaxSlotState, SyntaxSlotState, SyntaxSlotState]>([
    { role: 'subject', item: null, color: FITZGERALD_THEMES.subject.primary, labelPlaceholder: 'Sujeto' },
    { role: 'action', item: null, color: FITZGERALD_THEMES.action.primary, labelPlaceholder: 'Acción' },
    { role: 'object', item: null, color: FITZGERALD_THEMES.object.primary, labelPlaceholder: 'Objeto' },
  ]);

  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Determina si las 3 ranuras están completas
  const isSentenceComplete = slots[0].item !== null && slots[1].item !== null && slots[2].item !== null;

  // Texto completo de la frase construida
  const sentenceText = useMemo(() => {
    const parts = slots.map((s) => s.item?.label).filter(Boolean);
    return parts.join(' ');
  }, [slots]);

  // Selección de ítem en la ranura activa
  const handleSelectItem = useCallback((item: SyntaxItem) => {
    setSlots((prev) => {
      const next: [SyntaxSlotState, SyntaxSlotState, SyntaxSlotState] = [...prev];
      next[activeSlotIndex] = {
        ...next[activeSlotIndex],
        item,
      };
      return next;
    });

    // Emisión opcional a periférico Lúa si el ítem tiene pictograma mapeado
    if (item.pictogramKey) {
      const pictoIndex = (PICTO_KEYS as readonly string[]).indexOf(item.pictogramKey);
      if (pictoIndex >= 0) {
        sendLuaOpcode(LUA_OP.PICTO, pictoIndex);
      }
    }

    // Avanzar automáticamente a la siguiente ranura vacía si existe
    if (activeSlotIndex === 0 && slots[1].item === null) {
      setActiveSlotIndex(1);
    } else if (activeSlotIndex === 1 && slots[2].item === null) {
      setActiveSlotIndex(2);
    }
  }, [activeSlotIndex, slots]);

  const handleClearSlot = useCallback((index: number) => {
    setSlots((prev) => {
      const next: [SyntaxSlotState, SyntaxSlotState, SyntaxSlotState] = [...prev];
      next[index] = { ...next[index], item: null };
      return next;
    });
    setIsValidated(false);
    setActiveSlotIndex(index);
  }, []);

  // Lectura de la oración por voz sintetizada
  const handlePlayAudio = useCallback(() => {
    if (!sentenceText) return;
    speakToChild(sentenceText);
  }, [sentenceText]);

  // Validación por parte del adulto del ensayo y de la acción motora TPR
  const handleAdultValidation = useCallback(() => {
    if (!isSentenceComplete) return;
    setIsValidated(true);
    sendLuaOpcode(LUA_OP.CELEBRATE, 0); // Celebración corta en Lúa
    onValidateTpr?.(true);

    if (slots[0].item && slots[1].item && slots[2].item) {
      onSentenceComplete?.(sentenceText, [slots[0].item, slots[1].item, slots[2].item]);
    }
  }, [isSentenceComplete, sentenceText, slots, onValidateTpr, onSentenceComplete]);

  // Ítems disponibles según la ranura activa
  const activeRole: GrammaticalRole = slots[activeSlotIndex].role;
  const currentItems: SyntaxItem[] = useMemo(() => {
    switch (activeRole) {
      case 'subject':
        return bank.subjects;
      case 'action':
        return bank.actions;
      case 'object':
        return bank.objects;
    }
  }, [activeRole, bank]);

  const pickerTitle = useMemo(() => {
    switch (activeRole) {
      case 'subject':
        return '1. Elige quién realiza la acción (Sujeto)';
      case 'action':
        return '2. Elige qué hace (Acción / Verbo)';
      case 'object':
        return '3. Elige qué o con qué (Objeto / Destino)';
    }
  }, [activeRole]);

  return (
    <View style={styles.container}>
      {/* 3 Ranuras Sintácticas */}
      <View style={styles.slotsRow}>
        {slots.map((slot, index) => (
          <SyntaxSlotCell
            key={slot.role}
            slot={slot}
            isActive={index === activeSlotIndex}
            onPress={() => setActiveSlotIndex(index)}
            onClear={() => handleClearSlot(index)}
          />
        ))}
      </View>

      {/* Frase construida y botón de habla */}
      {isSentenceComplete && (
        <View style={styles.sentenceBanner}>
          <View style={styles.sentenceTextContainer}>
            <Text style={styles.sentenceLabel}>Oración construida:</Text> // i18n-exempt: etiqueta de oración sintáctica
            <Text style={styles.sentenceText}>«{sentenceText}»</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePlayAudio}
            style={styles.speakButton}
          >
            <Text style={styles.speakButtonText}>🔊 Escuchar</Text> // i18n-exempt: botón para reproducir la oración construida
          </TouchableOpacity>
        </View>
      )}

      {/* Acción TPR del cuidador y niño */}
      {isSentenceComplete && slots[1].item?.tprAction && (
        <View style={styles.tprCard}>
          <Text style={styles.tprTitle}>🏃 Acción física juntos (TPR):</Text> // i18n-exempt: encabezado de acción física TPR
          <Text style={styles.tprDesc}>{slots[1].item.tprAction}</Text>

          {!isValidated ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAdultValidation}
              style={styles.validateButton}
            >
              <Text style={styles.validateButtonText}>✓ Cuidador: Validar ensayo</Text> // i18n-exempt: botón de validación adulta de TPR
            </TouchableOpacity>
          ) : (
            <View style={styles.validatedBadge}>
              <Text style={styles.validatedBadgeText}>✓ ¡Ensayo validado con éxito!</Text> // i18n-exempt: confirmación de validación
            </View>
          )}
        </View>
      )}

      {/* Selector de Pictogramas para la ranura activa */}
      <PictogramCategoryPicker
        role={activeRole}
        items={currentItems}
        selectedId={slots[activeSlotIndex].item?.id ?? null}
        onSelectItem={handleSelectItem}
        title={pickerTitle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 10,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  sentenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    marginVertical: 8,
  },
  sentenceTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  sentenceLabel: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sentenceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803D',
    marginTop: 2,
  },
  speakButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  speakButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  tprCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginVertical: 6,
  },
  tprTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    marginBottom: 4,
  },
  tprDesc: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
    lineHeight: 19,
    marginBottom: 8,
  },
  validateButton: {
    backgroundColor: '#00C4BE',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  validateButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  validatedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  validatedBadgeText: {
    color: '#15803D',
    fontWeight: '800',
    fontSize: 13,
  },
});

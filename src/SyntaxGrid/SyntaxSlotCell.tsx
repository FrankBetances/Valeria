// ============================================================================
// Valeria+ · Celda de Ranura Sintáctica (Fitzgerald Key Slot)
// ============================================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getRoleTheme } from './fitzgeraldPalette';
import type { SyntaxSlotState } from './syntaxGridTypes';
import { FichaVisual } from '../ValeriaPictograms';

interface SyntaxSlotCellProps {
  slot: SyntaxSlotState;
  isActive: boolean;
  onPress: () => void;
  onClear: () => void;
}

export const SyntaxSlotCell: React.FC<SyntaxSlotCellProps> = ({
  slot,
  isActive,
  onPress,
  onClear,
}) => {
  const theme = getRoleTheme(slot.role);
  const isFilled = slot.item !== null;

  return (
    <View style={styles.cellWrapper}>
      {/* Etiqueta de la categoría sintáctica */}
      <View style={[styles.roleBadge, { backgroundColor: theme.primary }]}>
        <Text style={styles.roleBadgeText}>
          {slot.labelPlaceholder.toUpperCase()}
        </Text>
      </View>

      {/* Tarjeta de la ranura táctil */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.slotContainer,
          {
            backgroundColor: isFilled ? theme.bgLight : '#FFFFFF',
            borderColor: isActive ? theme.primary : isFilled ? theme.border : '#CBD5E1',
            borderStyle: isFilled ? 'solid' : 'dashed',
          },
          isActive && styles.activeGlow,
        ]}
      >
        {isFilled && slot.item ? (
          <View style={styles.contentContainer}>
            {slot.item.pictogramKey ? (
              <FichaVisual
                pic={slot.item.pictogramKey}
                word={slot.item.label}
                emoji={slot.item.emoji}
                size={70}
              />
            ) : (
              <Text style={styles.bigEmoji}>{slot.item.emoji}</Text>
            )}
            <Text style={[styles.itemLabel, { color: theme.text }]} numberOfLines={1}>
              {slot.item.label}
            </Text>

            {/* Botón rápido para vaciar ranura */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                onClear();
              }}
              style={styles.clearBadge}
            >
              <Text style={styles.clearBadgeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={[styles.plusCircle, { backgroundColor: theme.bgLight }]}>
              <Text style={[styles.plusIcon, { color: theme.primary }]}>+</Text>
            </View>
            <Text style={styles.placeholderPrompt}>Toca para elegir</Text> // i18n-exempt: indicación táctil para el niño
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cellWrapper: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  slotContainer: {
    width: '100%',
    minHeight: 125,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  activeGlow: {
    borderWidth: 3,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  bigEmoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  clearBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  plusIcon: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  placeholderPrompt: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
});

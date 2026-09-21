// ============================================================================
// Valeria+ · Diana Receptáculo para el Juego de Pesca/Arrastre
// ============================================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FichaVisual } from '../../../ValeriaPictograms';
import type { DragTargetItem } from './dragFishingTypes';

interface DragTargetProps {
  target: DragTargetItem;
  isHesitatingHint?: boolean;
}

export const DragTarget: React.FC<DragTargetProps> = ({
  target,
  isHesitatingHint = false,
}) => {
  return (
    <View
      style={[
        styles.targetWrapper,
        isHesitatingHint && styles.hesitatingGlow,
      ]}
    >
      <View style={styles.cardContainer}>
        {target.pictogramKey ? (
          <FichaVisual
            pic={target.pictogramKey}
            word={target.label}
            emoji={target.emoji}
            size={68}
          />
        ) : (
          <Text style={styles.emoji}>{target.emoji}</Text>
        )}
        <Text style={styles.label} numberOfLines={1}>
          {target.label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  targetWrapper: {
    width: 96,
    height: 110,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  hesitatingGlow: {
    borderColor: '#00C4BE',
    borderWidth: 3.5,
    backgroundColor: '#F0FDFA',
    shadowColor: '#00C4BE',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
    textAlign: 'center',
  },
});

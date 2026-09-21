// ============================================================================
// Valeria+ · Sprite de Lúa Arrastrable
// ============================================================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CatPixel } from '../../../ValeriaCatPixel';

interface LuaDragSpriteProps {
  isDragging: boolean;
  size?: number;
}

export const LuaDragSprite: React.FC<LuaDragSpriteProps> = ({
  isDragging,
  size = 76,
}) => {
  return (
    <View
      style={[
        styles.spriteWrapper,
        isDragging && styles.draggingGlow,
      ]}
    >
      <CatPixel size={size} pose={isDragging ? 'head' : 'sit'} />
      {/* Sombra de apoyo */}
      <View style={[styles.shadowOval, isDragging && styles.draggingShadow]} />
    </View>
  );
};

const styles = StyleSheet.create({
  spriteWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggingGlow: {
    transform: [{ scale: 1.12 }],
  },
  shadowOval: {
    width: 44,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    marginTop: -4,
  },
  draggingShadow: {
    width: 32,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
});

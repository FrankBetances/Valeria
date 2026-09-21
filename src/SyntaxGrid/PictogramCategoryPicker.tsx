// ============================================================================
// Valeria+ · Selector de Pictogramas por Categoría Gramatical
// ============================================================================
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { getRoleTheme } from './fitzgeraldPalette';
import type { SyntaxItem, GrammaticalRole } from './syntaxGridTypes';
import { FichaVisual } from '../ValeriaPictograms';

interface PictogramCategoryPickerProps {
  role: GrammaticalRole;
  items: SyntaxItem[];
  selectedId: string | null;
  onSelectItem: (item: SyntaxItem) => void;
  title: string;
}

export const PictogramCategoryPicker: React.FC<PictogramCategoryPickerProps> = ({
  role,
  items,
  selectedId,
  onSelectItem,
  title,
}) => {
  const theme = getRoleTheme(role);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => onSelectItem(item)}
              style={[
                styles.itemCard,
                {
                  borderColor: isSelected ? theme.primary : '#E2E8F0',
                  backgroundColor: isSelected ? theme.bgLight : '#FFFFFF',
                },
                isSelected && styles.selectedGlow,
              ]}
            >
              {item.pictogramKey ? (
                <FichaVisual
                  pic={item.pictogramKey}
                  word={item.label}
                  emoji={item.emoji}
                  size={60}
                />
              ) : (
                <Text style={styles.emoji}>{item.emoji}</Text>
              )}
              <Text
                style={[
                  styles.label,
                  { color: isSelected ? theme.text : '#334155' },
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  itemCard: {
    width: 90,
    minHeight: 105,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedGlow: {
    borderWidth: 2.5,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
});

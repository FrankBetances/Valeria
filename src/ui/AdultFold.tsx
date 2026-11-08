// Guía del adulto plegable: Accordion de HeroUI Native (Apache-2.0). Abierta
// por defecto; el contenido no se borra porque parte lleva carga clínica.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Accordion } from 'heroui-native';
import { BlockIcon } from '../ValeriaBlockIcons';
import { V } from '../valeriaTheme';
import { FONT } from './fonts';

export const AdultFold: React.FC<{ label: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ label, children, defaultOpen = true }) => (
  <Accordion selectionMode="single" defaultValue={defaultOpen ? 'fold' : undefined} isCollapsible variant="surface"
    className="mb-3 rounded-3xl border-2 border-b-4 border-[#e3dccf] bg-white">
    <Accordion.Item value="fold">
      <Accordion.Trigger accessibilityLabel={label} className="min-h-[48px] px-4">
        <View style={s.row}>
          <BlockIcon name="info" color={V.color.textPrimary} size={18} />
          <Text style={s.label} numberOfLines={2}>{label}</Text>
        </View>
        <Accordion.Indicator />
      </Accordion.Trigger>
      <Accordion.Content className="gap-2.5 px-4 pb-4">{children}</Accordion.Content>
    </Accordion.Item>
  </Accordion>
);

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  label: { fontFamily: FONT.bodyBlack, fontSize: 14, color: V.color.textPrimary, flexShrink: 1 },
});

export default AdultFold;

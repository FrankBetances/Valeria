// Lo del adulto, plegado (motor del rediseño, plan §Prioridad 1): el niño ve
// primero la actividad; fichas, notas, montajes y protocolos quedan detrás de
// una pastilla «i». El contenido no se borra: parte lleva carga clínica.
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlockIcon } from '../ValeriaBlockIcons';
import { V } from '../valeriaTheme';
import { FONT } from './fonts';

export const AdultFold: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const [open, setOpen] = useState(true); // visible: es guía del adulto; se puede plegar
  return (
    <View style={s.wrap}>
      <Pressable onPress={() => setOpen((v) => !v)} style={s.pill} hitSlop={8}
        accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={label}>
        <BlockIcon name="info" color={V.color.textPrimary} size={18} />
        <Text style={s.pillTxt} numberOfLines={1}>{label}</Text>
        <Text style={s.chev}>{open ? '⌃' : '⌄'}</Text>
      </Pressable>
      {open && <View style={s.body}>{children}</View>}
    </View>
  );
};

const s = StyleSheet.create({
  wrap: { marginBottom: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 14, borderRadius: 22, backgroundColor: '#ffffff', borderWidth: 2, borderBottomWidth: 4, borderColor: '#e3dccf' },
  pillTxt: { fontFamily: FONT.bodyBlack, fontSize: 13, color: V.color.textPrimary, flexShrink: 1 },
  chev: { fontFamily: FONT.display, fontSize: 16, color: V.color.textPrimary },
  body: { marginTop: 10, gap: 10 },
});

export default AdultFold;

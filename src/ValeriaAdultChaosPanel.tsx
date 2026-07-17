// ============================================================================
// Valeria+ · Panel del Adulto — Caos Comunicativo (compartido)
// Tarjeta colapsable que agrupa los TRES controles manuales de la Fase 2:
//   · Slider de ruido babble (ManualNoiseSlider → valeriaNoise).
//   · Interruptor del oso distractor (doble tarea) — el anfitrión renderiza
//     <ValeriaDistractorBear /> en la RAÍZ de su pantalla (los overlays
//     absolutos no pueden vivir dentro del ScrollView).
//   · Lanzador del quiebre pragmático — ídem con <ValeriaPragmaticBreakOverlay/>.
//
// Muro MDR: este panel es la ÚNICA puerta de entrada a los módulos de carga;
// todo es manual y explícito. La app jamás activa ni ajusta nada por su cuenta.
// El estado del distractor y del quiebre vive en la pantalla anfitriona (los
// overlays son suyos); el plegado es local porque a nadie más le importa.
// ============================================================================
import React, { useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';
import { ValeriaManualNoiseSlider } from './ValeriaManualNoiseSlider';

export const ValeriaAdultChaosPanel: React.FC<{
  distractorOn: boolean;
  onDistractorChange: (on: boolean) => void;
  onLaunchPragmatic: () => void;
}> = ({ distractorOn, onDistractorChange, onLaunchPragmatic }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={s.panel}>
      <Pressable
        onPress={() => setOpen(!open)}
        style={s.head}
        accessibilityRole="button"
        accessibilityLabel={open ? 'Cerrar el panel del adulto' : 'Abrir el panel del adulto'}
      >
        <Text style={s.kicker}>🎛️ PANEL DEL ADULTO · RETO EXTRA</Text>
        <Text style={s.chev}>{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open && (
        <>
          <Text style={s.hint}>
            Controles manuales para entrenar la escucha en ambiente real. Úsalos si vuestro
            logopeda os lo ha pautado: la app nunca los activa ni los ajusta sola.
          </Text>
          <ValeriaManualNoiseSlider />
          <View style={s.dualRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.dualTitle}>🐻 Oso distractor (doble tarea)</Text>
              <Text style={s.dualSub}>El oso se asoma y se mueve por el borde; el niño debe seguir atendiendo a la voz. Tocarlo no cuenta como error.</Text>
            </View>
            <Switch
              value={distractorOn}
              onValueChange={onDistractorChange}
              trackColor={{ false: '#d1d5db', true: V.color.primary }}
              thumbColor="#ffffff"
            />
          </View>
          <Pressable onPress={onLaunchPragmatic} style={s.pragBtn} accessibilityRole="button">
            <Text style={s.pragBtnTxt}>🎭 Lanzar un quiebre pragmático</Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  panel: { backgroundColor: '#fffdf7', borderWidth: 1.5, borderColor: '#f0e6cc', borderRadius: 18, padding: 13, marginTop: 18 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#9a5b13' },
  chev: { fontSize: 14, fontWeight: '800', color: '#9a5b13' },
  hint: { fontSize: 11.5, fontWeight: '600', color: V.color.textMuted, marginTop: 8, marginBottom: 10, lineHeight: 16 },
  dualRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 13, marginTop: 10 },
  dualTitle: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary },
  dualSub: { fontSize: 11, fontWeight: '600', color: V.color.textMuted, marginTop: 3, lineHeight: 15 },
  pragBtn: { backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#fcd9a8', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  pragBtnTxt: { color: '#9a5b13', fontSize: 13, fontWeight: '800' },
});

export default ValeriaAdultChaosPanel;

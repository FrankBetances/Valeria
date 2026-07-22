// ============================================================================
// Valeria+ · Academy — BottomSheet de Hipoacusia (V2.0)
// Modal IN-PLACE (sin anidar navegación profunda, Requisito 3). Dos ejes:
//   1. Conceptos Clínicos  → qué es la sordera y su abordaje.
//   2. Manejo de Dispositivos → pestañas Audífono · Implante Coclear ·
//      Osteointegrado, cada uno con micro-guías (Cómo funciona · Manejo ·
//      Cuidados) y su esquema VECTORIAL (react-native-svg, cero red).
//
// Marcar una guía como vista inyecta su XP en el silo 'hipoacusia' (nunca se
// mezcla con otros dominios). El contenido es formativo: no instruye a modificar
// la programación del dispositivo del paciente (competencia del audiólogo, MDR).
// ============================================================================
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import { V } from '../valeriaTheme';
import { DOMAIN_META } from './academyDomains';
import { HIPOACUSIA_CONCEPTS, HEARING_DEVICES } from './academyHardware';
import { completeGuideUnit, isCapsuleDone, useAcademyDomainSummary } from './academyStore';
import { EarAnatomySvg, deviceSchemaFor } from './AcademyHardwareSvg';
import { AcademyGuideUnit, HearingDeviceKey } from './academyTypes';

const ACCENT = DOMAIN_META.hipoacusia.accentFg;
const ACCENT_BG = DOMAIN_META.hipoacusia.accentBg;

type Axis = 'conceptos' | 'dispositivos';

export const HipoacusiaBottomSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}> = ({ visible, onClose, onCompleted }) => {
  const [axis, setAxis] = useState<Axis>('conceptos');
  const [device, setDevice] = useState<HearingDeviceKey>('audifono');
  const [, setTick] = useState(0);
  const summary = useAcademyDomainSummary('hipoacusia');

  const markSeen = async (unitId: string) => {
    await completeGuideUnit(unitId);
    setTick((t) => t + 1);   // refresca el estado "visto" local
    onCompleted?.();
  };

  const activeDevice = HEARING_DEVICES.find((d) => d.key === device)!;
  const DeviceSchema = deviceSchemaFor(device);
  const pct = Math.round(summary.progress * 100);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.backdrop}>
        <Pressable style={s.backdropTap} onPress={onClose} accessibilityLabel="Cerrar" />
        <View style={s.sheet}>
          {/* Cabecera */}
          <View style={s.grabber} />
          <View style={s.headRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>👂 Hipoacusia / Sordera</Text>
              <Text style={s.sub}>{summary.completedCount}/{summary.totalCount} guías · {pct}% · 🏅 {summary.levelName}</Text>
            </View>
            <Pressable onPress={onClose} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="Cerrar">
              <Text style={s.closeTxt}>✕</Text>
            </Pressable>
          </View>

          {/* Ejes */}
          <View style={s.axisRow}>
            <AxisTab label="Conceptos clínicos" active={axis === 'conceptos'} onPress={() => setAxis('conceptos')} />
            <AxisTab label="Manejo de dispositivos" active={axis === 'dispositivos'} onPress={() => setAxis('dispositivos')} />
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {axis === 'conceptos' ? (
              <>
                <View style={s.schemaCard}>
                  <EarAnatomySvg size={190} accent={ACCENT} />
                  <Text style={s.schemaCaption}>Cómo viaja el sonido hasta la cóclea.</Text>
                </View>
                {HIPOACUSIA_CONCEPTS.map((u) => (
                  <GuideCard key={u.id} unit={u} done={isCapsuleDone(u.id)} onSeen={markSeen} />
                ))}
              </>
            ) : (
              <>
                {/* Sub-pestañas de dispositivo */}
                <View style={s.deviceTabs}>
                  {HEARING_DEVICES.map((d) => {
                    const on = d.key === device;
                    return (
                      <Pressable
                        key={d.key}
                        onPress={() => setDevice(d.key)}
                        style={[s.deviceTab, on && s.deviceTabOn]}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: on }}
                      >
                        <Text style={[s.deviceTabTxt, { color: on ? '#fff' : ACCENT }]}>{d.short}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={s.schemaCard}>
                  <DeviceSchema size={190} accent={ACCENT} />
                  <Text style={s.deviceLabel}>{activeDevice.label}</Text>
                  <Text style={s.schemaCaption}>{activeDevice.tagline}</Text>
                </View>

                {activeDevice.guides.map((u) => (
                  <GuideCard key={u.id} unit={u} done={isCapsuleDone(u.id)} onSeen={markSeen} />
                ))}
              </>
            )}
            <View style={{ height: 8 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// --- Subcomponentes ---------------------------------------------------------
const AxisTab: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} style={[s.axisTab, active && s.axisTabOn]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
    <Text style={[s.axisTabTxt, { color: active ? ACCENT : V.color.textMuted }]}>{label}</Text>
    {active && <View style={s.axisUnderline} />}
  </Pressable>
);

const GuideCard: React.FC<{
  unit: AcademyGuideUnit; done: boolean; onSeen: (id: string) => void;
}> = ({ unit, done, onSeen }) => (
  <View style={[s.guide, done && { borderColor: ACCENT }]}>
    <View style={s.guideHead}>
      <View style={[s.guideIcon, { backgroundColor: ACCENT_BG }]}>
        <Text style={{ fontSize: 18 }}>{unit.icon ?? '📄'}</Text>
      </View>
      <Text style={s.guideHeading}>{unit.heading}</Text>
    </View>
    <Text style={s.guideBody}>{unit.body}</Text>
    <Pressable
      onPress={() => !done && onSeen(unit.id)}
      disabled={done}
      style={[s.seenBtn, done ? s.seenBtnDone : { backgroundColor: ACCENT }]}
      accessibilityRole="button"
      accessibilityLabel={done ? 'Guía completada' : `Marcar ${unit.heading} como vista`}
    >
      <Text style={[s.seenTxt, { color: done ? ACCENT : '#fff' }]}>
        {done ? `✓ Visto · +${unit.xp} XP` : `Marcar como visto · +${unit.xp} XP`}
      </Text>
    </Pressable>
  </View>
);

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(11,18,32,.45)', justifyContent: 'flex-end' },
  backdropTap: { flex: 1 },
  sheet: { backgroundColor: V.color.pageBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, maxHeight: '90%' },
  grabber: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#d3dbdb', marginBottom: 10 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: { fontSize: 19, fontWeight: '800', color: V.color.textPrimary },
  sub: { fontSize: 12.5, fontWeight: '700', color: ACCENT, marginTop: 2 },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { fontSize: 15, fontWeight: '800', color: V.color.textSecondary },

  axisRow: { flexDirection: 'row', gap: 6, borderBottomWidth: 1, borderBottomColor: V.color.border, marginBottom: 4 },
  axisTab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  axisTabOn: {},
  axisTabTxt: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  axisUnderline: { position: 'absolute', bottom: -1, height: 3, width: '70%', borderRadius: 2, backgroundColor: ACCENT },

  scroll: { paddingTop: 14, paddingBottom: 20 },
  schemaCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 12, alignItems: 'center', marginBottom: 14, ...V.shadow.card },
  schemaCaption: { fontSize: 12.5, fontWeight: '600', color: V.color.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 17 },
  deviceLabel: { fontSize: 16, fontWeight: '800', color: V.color.textPrimary, marginTop: 6 },

  deviceTabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  deviceTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: ACCENT_BG },
  deviceTabOn: { backgroundColor: ACCENT, borderColor: ACCENT },
  deviceTabTxt: { fontSize: 13, fontWeight: '800' },

  guide: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 15, marginBottom: 11, ...V.shadow.card },
  guideHead: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 9 },
  guideIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  guideHeading: { flex: 1, fontSize: 15.5, fontWeight: '800', color: V.color.textPrimary },
  guideBody: { fontSize: 14, fontWeight: '600', color: V.color.textSecondary, lineHeight: 21 },
  seenBtn: { marginTop: 13, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  seenBtnDone: { backgroundColor: ACCENT_BG },
  seenTxt: { fontSize: 13.5, fontWeight: '800' },
});

export default HipoacusiaBottomSheet;

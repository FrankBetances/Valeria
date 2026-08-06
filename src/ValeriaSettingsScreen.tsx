// ============================================================================
// Valeria+ · Ajustes (v11) — Sprint 3.3
//
// Recoge lo que en la v10.2 vivía al FONDO del hub, después de siete tarjetas
// de bloques y ~1.200 px de scroll: recordatorios, calidad de voz y acceso
// profesional. Ahí abajo eran, en la práctica, invisibles. Ahora están a un
// toque desde cualquier punto de la app, en su propia pestaña.
//
// La lógica se ha MOVIDO, no reescrito: los recordatorios hablan con
// valeriaNotifications con las mismas llamadas y en el mismo orden, y la
// tarjeta de voz y el modal de exportación son los mismos componentes.
//
// Se suma el selector de idioma de interfaz (ValeriaUiLangPicker), que hasta
// ahora no tenía un sitio natural donde vivir.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';
import {
  enableDailyReminders, disableReminders, remindersEnabled,
  loadReminderSlots, setReminderSlots as persistReminderSlots,
  REMINDER_SLOTS, ALL_REMINDER_SLOTS, ReminderSlot,
} from './valeriaNotifications';
import { ProPinModal } from './ValeriaProPin';
import { ValeriaProExportModal } from './ValeriaProExport';
import { VoiceQualityCard } from './ValeriaVoiceUI';
import { ValeriaUiLangPicker } from './ValeriaUiLangPicker';
import { useT, UiStrings } from './i18n';

export const ValeriaSettingsScreen: React.FC = () => {
  const t = useT();
  const [reminders, setReminders] = useState(false);
  // Se carga siempre, aunque los avisos estén apagados, para que al
  // reactivarlos se respete la última elección del adulto (GEN-01).
  const [slots, setSlots] = useState<ReminderSlot[]>(ALL_REMINDER_SLOTS);
  const [toast, setToast] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setReminders(await remindersEnabled());
        setSlots(await loadReminderSlots());
      } catch (e) { /* noop */ }
    })();
  }, []);

  // Describe lo CONFIGURADO, no el límite del sistema (GEN-01).
  const summary = (list: ReminderSlot[], strings: UiStrings): string => {
    if (!list.length) return strings.hub.remindersNone;
    const horas = REMINDER_SLOTS.filter((d) => list.includes(d.slot))
      .map((d) => strings.hub.slotLabel(d.slot, d.hour).split('· ')[1] ?? `${d.hour}:00`).join(', ');
    return strings.hub.remindersSummary(list.length, horas);
  };

  const toggleReminders = async (next: boolean) => {
    if (next) {
      // Venir de cero franjas y encender el interruptor sin recibir nada sería
      // el mismo desconcierto que GEN-01 vino a corregir: se reactivan las cuatro.
      const wanted = slots.length ? slots : ALL_REMINDER_SLOTS;
      const ok = await enableDailyReminders(wanted);
      setReminders(ok);
      if (ok) setSlots(wanted);
      setToast(ok ? t.hub.remindersOn(summary(wanted, t)) : t.hub.remindersNoPermission);
    } else {
      await disableReminders();
      setReminders(false);
      setToast(t.hub.remindersDisabled);
    }
  };

  const toggleSlot = async (slot: ReminderSlot) => {
    const next = slots.includes(slot)
      ? slots.filter((sl) => sl !== slot)
      : ALL_REMINDER_SLOTS.filter((sl) => sl === slot || slots.includes(sl));
    setSlots(next);
    const ok = await persistReminderSlots(next);
    setReminders(ok);
    setToast(next.length
      ? (ok ? summary(next, t) : t.hub.remindersNoSchedule)
      : t.hub.remindersNoSlots);
  };

  return (
    <View style={s.flex}>
      <View style={s.header}>
        <Text style={s.logo}>valeria+</Text>
        <Text style={s.headerTitle}>{t.tabs.settings}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!!toast && (
          <View style={s.toast}>
            <View style={s.toastCheck}><Text style={s.toastCheckTxt}>✓</Text></View>
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        )}

        {/* ---- Recordatorios de sesión (GEN-01) ---- */}
        <View style={s.card}>
          <View style={s.cardRow}>
            <View style={[s.cardIcon, { backgroundColor: '#fffbeb' }]}><Text style={s.iconGlyph}>🔔</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{t.hub.remindersTitle}</Text>
              <Text style={s.cardSub}>
                {reminders ? `${summary(slots, t)} ${t.hub.remindersPickHint}` : t.hub.remindersOff}
              </Text>
            </View>
            <Switch value={reminders} onValueChange={toggleReminders}
              trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff" />
          </View>

          {/* El selector aparece cuando los avisos están activos, que es cuando
              la elección tiene efecto. */}
          {reminders && (
            <View style={s.slotList}>
              {REMINDER_SLOTS.map((d) => {
                const on = slots.includes(d.slot);
                return (
                  <Pressable
                    key={d.slot}
                    onPress={() => toggleSlot(d.slot)}
                    style={[s.slotRow, on && s.slotRowOn]}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    accessibilityLabel={`${t.hub.slotLabel(d.slot, d.hour)}. ${t.hub.slotHint(d.slot)}`}
                  >
                    <Text style={[s.slotCheck, on && s.slotCheckOn]}>{on ? '✓' : ''}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.slotLabel, on && s.slotLabelOn]}>{t.hub.slotLabel(d.slot, d.hour)}</Text>
                      <Text style={s.slotHint}>{t.hub.slotHint(d.slot)}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ---- Calidad de la voz ---- */}
        <VoiceQualityCard />

        {/* ---- Idioma de la interfaz ---- */}
        {/* `onLight`: el selector está estilado para la cabecera turquesa de
            Créditos (texto blanco sobre translúcido). Aquí el fondo es claro. */}
        <View style={s.pickerWrap}><ValeriaUiLangPicker onLight /></View>

        {/* ---- Acceso Profesional: PIN → exportación dual de evidencia ---- */}
        <Pressable onPress={() => setPinOpen(true)} style={s.proAccess}
          accessibilityRole="button" accessibilityLabel={t.hub.proAccessA11y}>
          <View style={[s.cardIcon, { backgroundColor: V.color.primaryLight }]}><Text style={s.iconGlyph}>🔐</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>{t.hub.proAccessTitle}</Text>
            <Text style={s.cardSub}>{t.hub.proAccessSub}</Text>
          </View>
          <Text style={s.chev}>›</Text>
        </Pressable>
      </ScrollView>

      <ProPinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        subtitle={t.hub.proPinSubtitle}
        onUnlock={() => { setPinOpen(false); setExportOpen(true); }}
      />
      <ValeriaProExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: {
    backgroundColor: V.color.primary, paddingTop: V.space.lg, paddingHorizontal: V.space.xl,
    paddingBottom: V.space.lg, borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  logo: { color: '#fff', fontWeight: V.font.extrabold, fontSize: 13, letterSpacing: 1, marginBottom: V.space.xs },
  headerTitle: { ...V.type.display, color: '#fff', fontWeight: V.font.extrabold, letterSpacing: -0.4 },

  scroll: { padding: V.space.lg, paddingBottom: V.space.xxl },

  toast: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.sm, backgroundColor: V.color.primaryTint,
    borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginBottom: V.space.md,
  },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastCheckTxt: { color: '#fff', fontWeight: V.font.extrabold, fontSize: 13 },
  toastTxt: { color: V.color.textPrimary, ...V.type.body, fontWeight: V.font.bold, flex: 1 },

  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 14, padding: 13, marginBottom: V.space.md, ...V.shadow.card },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  cardIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 17 },
  cardTitle: { ...V.type.body, fontSize: 14, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  cardSub: { ...V.type.caption, fontSize: 11.5, lineHeight: 15, fontWeight: V.font.semibold, color: V.color.textMuted, marginTop: 2 },

  slotList: { marginTop: 11, gap: 7 },
  slotRow: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.sm, borderWidth: 1, borderColor: V.color.border,
    borderRadius: 11, paddingVertical: 9, paddingHorizontal: 11, backgroundColor: '#fbfbfb', minHeight: V.touchMin,
  },
  slotRowOn: { borderColor: V.color.primary, backgroundColor: '#effcfb' },
  slotCheck: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#d1d5db', backgroundColor: '#fff',
    textAlign: 'center', lineHeight: 18, fontSize: 12, fontWeight: V.font.extrabold, color: 'transparent', overflow: 'hidden',
  },
  slotCheckOn: { borderColor: V.color.primary, backgroundColor: V.color.primary, color: '#fff' },
  slotLabel: { fontSize: 12.5, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  slotLabelOn: { color: V.color.primary },
  slotHint: { ...V.type.caption, fontWeight: V.font.semibold, color: V.color.textMuted, marginTop: 1 },

  pickerWrap: { marginTop: V.space.md },

  proAccess: {
    flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fff', borderWidth: 1,
    borderColor: V.color.border, borderRadius: 14, padding: 13, marginTop: V.space.md,
    minHeight: V.touchMin, ...V.shadow.card,
  },
  chev: { fontSize: 18, color: V.color.textMuted, fontWeight: V.font.extrabold },
});

export default ValeriaSettingsScreen;

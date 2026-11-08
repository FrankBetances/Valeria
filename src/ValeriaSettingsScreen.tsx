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
import { ScreenHeader } from './ui/ScreenHeader';
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';
import { BlockIcon } from './ValeriaBlockIcons';
import {
  enableDailyReminders, disableReminders, remindersEnabled,
  loadReminderSlots, setReminderSlots as persistReminderSlots,
  REMINDER_SLOTS, ALL_REMINDER_SLOTS, ReminderSlot,
} from './valeriaNotifications';
import { ProPinModal } from './ValeriaProPin';
import { ValeriaProExportModal } from './ValeriaProExport';
import { VoiceQualityCard } from './ValeriaVoiceUI';
import { ValeriaUiLangPicker } from './ValeriaUiLangPicker';
import { ListRow } from './ui/ListRow';
import { useT, UiStrings } from './i18n';
import { FONT } from './ui/fonts';
import { notify } from './ui/notify';

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
      notify(ok ? t.hub.remindersOn(summary(wanted, t)) : t.hub.remindersNoPermission);
    } else {
      await disableReminders();
      setReminders(false);
      notify(t.hub.remindersDisabled);
    }
  };

  const toggleSlot = async (slot: ReminderSlot) => {
    const next = slots.includes(slot)
      ? slots.filter((sl) => sl !== slot)
      : ALL_REMINDER_SLOTS.filter((sl) => sl === slot || slots.includes(sl));
    setSlots(next);
    const ok = await persistReminderSlots(next);
    setReminders(ok);
    notify(next.length
      ? (ok ? summary(next, t) : t.hub.remindersNoSchedule)
      : t.hub.remindersNoSlots);
  };

  return (
    <View style={s.flex}>
      <ScreenHeader backLabel={t.common.back} kicker="valeria+" icon="tabSettings" title={t.tabs.settings} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!!toast && (
          <View style={s.toast}>
            <View style={s.toastCheck}><BlockIcon name="check" color="#ffffff" size={14} /></View>
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        )}

        {/* ---- Recordatorios de sesión (GEN-01) ---- */}
        <ListRow
          icon="bell" accent="#b07400" tint="#fff4d6"
          title={t.hub.remindersTitle}
          subtitle={reminders ? `${summary(slots, t)} ${t.hub.remindersPickHint}` : t.hub.remindersOff}
          trailing={<Switch value={reminders} onValueChange={toggleReminders}
            trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff" />}
        >
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
                    <View style={[s.slotCheck, on && s.slotCheckOn]}>
                      {on ? <BlockIcon name="check" color="#ffffff" size={14} /> : null}
                    </View>
                    <View style={{ flexShrink: 1, flexGrow: 1 }}>
                      <Text style={[s.slotLabel, on && s.slotLabelOn]}>{t.hub.slotLabel(d.slot, d.hour)}</Text>
                      <Text style={s.slotHint}>{t.hub.slotHint(d.slot)}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </ListRow>

        {/* ---- Calidad de la voz ---- */}
        <VoiceQualityCard />

        {/* ---- Idioma de la interfaz ---- */}
        {/* `onLight`: el selector está estilado para la cabecera turquesa de
            Créditos (texto blanco sobre translúcido). Aquí el fondo es claro. */}
        <View style={s.pickerWrap}><ValeriaUiLangPicker onLight /></View>

        {/* ---- Acceso Profesional: PIN → exportación dual de evidencia ---- */}
        <View style={{ height: V.space.md }} />
        <ListRow
          icon="lock"
          title={t.hub.proAccessTitle}
          subtitle={t.hub.proAccessSub}
          onPress={() => setPinOpen(true)}
          accessibilityLabel={t.hub.proAccessA11y}
        />
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
  logo: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 13, letterSpacing: 1, marginBottom: V.space.xs },
  headerTitle: { fontFamily: FONT.bodyBlack,...V.type.display, color: '#fff', letterSpacing: -0.4 },

  scroll: { padding: V.space.lg, paddingBottom: 88 }, // 58 px de barra + aire

  toast: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.sm, backgroundColor: V.color.primaryTint,
    borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginBottom: V.space.md,
  },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastCheckTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 13 },
  toastTxt: { fontFamily: FONT.bodyBlack,color: V.color.textPrimary, ...V.type.body, flex: 1 },

  // Tarjeta de HeroUI Native con el borde 3D del resto de la app.
  card: { backgroundColor: '#fff', borderWidth: 2, borderBottomWidth: 6, borderColor: '#e3dccf', borderRadius: 24, padding: 16, marginBottom: V.space.md },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  cardIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 17 },
  cardTitle: { fontFamily: FONT.bodyBlack,...V.type.body, fontSize: 14, color: V.color.textPrimary },
  cardSub: { fontFamily: FONT.bodyBlack,...V.type.caption, fontSize: 11.5, lineHeight: 15, color: V.color.textSecondary, marginTop: 2 },

  slotList: { marginTop: 12, gap: 8 },
  slotRow: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.sm, borderWidth: 1, borderColor: V.color.border,
    borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fbfaf7', minHeight: 52,
  },
  slotRowOn: { borderColor: V.color.primary, backgroundColor: '#effcfb' },
  slotCheck: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderColor: '#d1d5db', backgroundColor: '#fff',
    textAlign: 'center', lineHeight: 18, fontSize: 12, fontWeight: V.font.extrabold, color: 'transparent', overflow: 'hidden',
  },
  slotCheckOn: { borderColor: V.color.primary, backgroundColor: V.color.primary, color: '#fff' },
  slotLabel: { fontFamily: FONT.bodyBlack, fontSize: 15, color: V.color.textPrimary },
  slotLabelOn: { color: V.color.primary },
  slotHint: { fontFamily: FONT.body, fontSize: 13, lineHeight: 17, color: V.color.textSecondary, marginTop: 1 },

  pickerWrap: { marginTop: 0 },

  proAccess: {
    flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fff', borderWidth: 1,
    borderColor: V.color.border, borderRadius: 14, padding: 13, marginTop: V.space.md,
    minHeight: V.touchMin, ...V.shadow.card,
  },
  chev: { fontFamily: FONT.display,fontSize: 18, color: V.color.textSecondary },
});

export default ValeriaSettingsScreen;

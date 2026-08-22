// ============================================================================
// Valeria+ · Integración Sensorial Auditiva — Catálogo de Actividades (v11)
// Módulo de desensibilización sistemática, modulación y filtrado figura-fondo.
//
// Lista PRESCRIBIBLE: las seis actividades están abiertas, y quién practica
// cuál lo decide el logopeda detrás del PIN profesional, igual que en Audición,
// Lenguaje, TEA, Dislexia, Pares Mínimos y Expansión Semántica. En Modo Familia
// los interruptores no existen: se practica lo prescrito y nada más.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from '../valeriaTheme';
import { useT } from '../i18n';
import { BlockIcon } from '../ValeriaBlockIcons';
import { ProUnlockPill, ProPinModal } from '../ValeriaProPin';
import { AUDITORY_INTEGRATION_ACTIVITIES } from './sensoryCatalog';
import { useSensoryState } from './sensoryStore';
import { AuditorySensoryExercise } from './sensoryTypes';

export const SensoryBlockListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const sensoryState = useSensoryState();

  // Prescripción del logopeda: { [id]: boolean }. Un id ausente está ACTIVO,
  // así que una actividad nueva del catálogo entra prescrita y ninguna
  // prescripción guardada se queda coja al crecer el módulo.
  const [prescribed, setPrescribed] = useState<Record<string, boolean>>({});
  const [unlocked, setUnlocked] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.sensoryPrescripcion);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') setPrescribed(parsed);
        }
      } catch (e) { /* noop */ }
    })();
  }, []);

  const isPrescribed = (id: string) => prescribed[id] !== false;
  const activeCount = AUDITORY_INTEGRATION_ACTIVITIES.filter(
    (a) => a.isAvailable && isPrescribed(a.id),
  ).length;

  const togglePrescribed = (id: string) => {
    setPrescribed((prev) => ({ ...prev, [id]: !(prev[id] !== false) }));
    setToast('');
  };

  const savePrescription = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.sensoryPrescripcion, JSON.stringify(prescribed));
    } catch (e) { /* noop */ }
    setUnlocked(false);
    setToast(t.sensory.savedPrescription(activeCount));
  };

  const openExercise = (exercise: AuditorySensoryExercise) => {
    if (!exercise.isAvailable || !isPrescribed(exercise.id)) return;
    navigation.navigate('SensoryExercise', { exerciseId: exercise.id });
  };

  return (
    <View style={s.flex}>
      {/* Cabecera */}
      <View style={s.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.backPill}
          accessibilityRole="button"
          accessibilityLabel={t.common.back}
        >
          <Text style={s.backPillTxt}>{`‹ ${t.common.back}`}</Text>
        </Pressable>
        <Text style={s.logoFallback}>{t.sensory.blockTag}</Text>
        <View style={s.titleRow}>
          <BlockIcon name="sensory" color="#ffffff" size={26} />
          <Text style={s.headerTitle}>{t.sensory.blockTitle}</Text>
        </View>
        <Text style={s.headerSub}>{t.sensory.blockSubtitle}</Text>

        {/* Barra de progreso de silo */}
        <View style={s.statsRow}>
          <View style={s.statChip}>
            <BlockIcon name="level" color="#ffffff" size={16} />
            <Text style={s.statTxt}>{t.sensory.xpTotal(sensoryState.xp)}</Text>
          </View>
          <View style={s.statChip}>
            <BlockIcon name="check" color="#ffffff" size={16} />
            <Text style={s.statTxt}>{t.sensory.sessionsCount(sensoryState.sessionsCount)}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!!toast && (
          <View style={s.toast}>
            <View style={s.toastCheck}><BlockIcon name="check" color="#ffffff" size={15} /></View>
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        )}

        {/* Banner de encuadre clínico */}
        <View style={s.clinicalCard}>
          <View style={s.clinicalHeader}>
            <BlockIcon name="clinical" color={V.color.primaryDark} size={18} />
            <Text style={s.clinicalTitle}>{t.sensory.clinicalNoticeTitle}</Text>
          </View>
          <Text style={s.clinicalBody}>{t.sensory.clinicalNoticeBody}</Text>
        </View>

        <View style={s.listHead}>
          <Text style={s.listLabel}>{t.sensory.activitiesHeader}</Text>
          <View style={s.countChip}>
            <Text style={s.countChipTxt}>
              {t.sensory.prescribedOf(activeCount, AUDITORY_INTEGRATION_ACTIVITIES.length)}
            </Text>
          </View>
        </View>

        {AUDITORY_INTEGRATION_ACTIVITIES.map((act) => {
          const timesDone = sensoryState.completedActivities[act.id] ?? 0;
          const isDone = timesDone > 0;
          const isPilot = act.id === 'ISA-01';
          const on = isPrescribed(act.id);
          // Practicable = existe y está prescrita. Con el PIN echado, una
          // actividad no prescrita no se abre; con el PIN puesto, tocar la
          // tarjeta la prescribe o la retira en vez de arrancar la sesión.
          const playable = act.isAvailable && on;

          return (
            <Pressable
              key={act.id}
              onPress={() => (unlocked ? togglePrescribed(act.id) : openExercise(act))}
              disabled={!unlocked && !playable}
              style={[
                s.actCard,
                !playable && s.actCardDisabled,
                isDone && playable && s.actCardDone,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${t.sensory[act.titleKey as keyof typeof t.sensory] ?? act.id}. ${
                !act.isAvailable
                  ? t.sensory.inDevTag
                  : on
                    ? t.sensory.availableTag
                    : t.sensory.notPrescribed
              }`}
            >
              <View style={[s.actIcon, playable ? s.actIconActive : s.actIconInactive]}>
                <BlockIcon
                  name={act.iconName}
                  color={playable ? V.color.primaryDark : V.color.textMuted}
                  size={24}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={s.cardTopRow}>
                  <Text style={[s.actIdTag, { color: playable ? V.color.primaryDark : V.color.textMuted }]}>
                    {act.id}
                  </Text>
                  {isPilot && <Text style={s.pilotBadge}>{t.sensory.pilotBadge}</Text>}
                  {!act.isAvailable && <Text style={s.inDevBadge}>{t.sensory.inDevBadge}</Text>}
                </View>
                <Text style={s.actTitle}>
                  {String((t.sensory as any)[act.titleKey] ?? act.id)}
                </Text>
                <Text style={s.actDesc}>
                  {String((t.sensory as any)[act.descKey] ?? '')}
                </Text>
                {!on && <Text style={s.actOffTag}>{t.sensory.notPrescribed}</Text>}
                {timesDone > 0 && (
                  <Text style={s.actTimes}>
                    {t.sensory.completedTimes(timesDone)}
                  </Text>
                )}
              </View>

              {/* El interruptor SOLO en edición profesional: con el PIN echado
                  sería un control gris inerte en las seis filas. El candado es
                  el icono del set, no 🔒: ese emoji ya se sacó una vez de la
                  lista prescribible y volvió a entrar por aquí. */}
              {unlocked ? (
                <Switch
                  value={on}
                  onValueChange={() => togglePrescribed(act.id)}
                  disabled={!act.isAvailable}
                  trackColor={{ false: '#d1d5db', true: V.color.primary }}
                  thumbColor="#ffffff"
                />
              ) : (
                <View style={[s.arrowPill, playable ? s.arrowActive : s.arrowInactive]}>
                  {playable ? (
                    <Text style={[s.arrowTxt, { color: '#ffffff' }]}>›</Text>
                  ) : (
                    <BlockIcon name="lock" color={V.color.textMuted} size={18} />
                  )}
                </View>
              )}
            </Pressable>
          );
        })}

        {activeCount === 0 && !unlocked && (
          <Text style={s.emptyTxt}>{t.sensory.prescriptionEmpty}</Text>
        )}

        {/* La puerta del PIN, al final del listado: en Modo Familia no hay nada
            que editar arriba. */}
        <View style={s.proWrap}>
          <ProUnlockPill unlocked={unlocked} onPress={() => setPinOpen(true)} />
        </View>

        {unlocked ? (
          <View style={{ marginTop: 14 }}>
            <Pressable onPress={savePrescription} style={s.primaryBtn} accessibilityRole="button">
              <Text style={s.primaryBtnTxt}>{t.sensory.savePrescription}</Text>
            </Pressable>
            <Text style={s.helper}>{t.sensory.saveHelper}</Text>
          </View>
        ) : (
          <View style={s.lockedHint}>
            <BlockIcon name="lock" color={V.color.textSecondary} size={16} />
            <Text style={s.lockedHintTxt}>{t.sensory.lockedHint}</Text>
          </View>
        )}
      </ScrollView>

      <ProPinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onUnlock={() => { setPinOpen(false); setUnlocked(true); setToast(t.sensory.proUnlocked); }}
        subtitle={t.sensory.pinSubtitle}
      />
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: {
    backgroundColor: V.color.primaryDark,
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  backPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 10,
  },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  logoFallback: {
    color: 'rgba(255,255,255,.9)',
    fontWeight: '800',
    fontSize: 11.5,
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: {
    color: 'rgba(255,255,255,.92)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 18,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  statTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },

  scroll: { padding: 18, paddingBottom: 32 },

  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.borderActive,
    borderRadius: 14,
    padding: 13,
    marginBottom: 14,
    ...V.shadow.card,
  },
  toastCheck: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: V.color.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  toastTxt: { color: V.color.textPrimary, fontSize: 13, fontWeight: '700', flex: 1 },

  clinicalCard: {
    backgroundColor: '#e6f9f8',
    borderWidth: 1,
    borderColor: '#cdeeec',
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
  },
  clinicalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  clinicalTitle: { fontSize: 13.5, fontWeight: '800', color: V.color.primaryDark },
  clinicalBody: { fontSize: 12.5, fontWeight: '600', color: V.color.textSecondary, lineHeight: 18 },

  listHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 12,
    marginHorizontal: 2,
  },
  listLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: V.color.textSecondary,
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  countChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  countChipTxt: { fontSize: 11, fontWeight: '800', color: V.color.primaryDark },

  actCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    ...V.shadow.card,
  },
  actCardDisabled: { opacity: 0.72, backgroundColor: '#fbfcfc' },
  actCardDone: { borderColor: V.color.borderActive },
  actIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actIconActive: { backgroundColor: V.color.primaryLight },
  actIconInactive: { backgroundColor: '#f1f5f9' },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  actIdTag: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  pilotBadge: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inDevBadge: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actTitle: { fontSize: 15.5, fontWeight: '800', color: V.color.textPrimary },
  actDesc: { fontSize: 12.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 2, lineHeight: 17 },
  actOffTag: { fontSize: 11, fontWeight: '800', color: V.color.textMuted, marginTop: 6 },
  actTimes: { fontSize: 11, fontWeight: '700', color: V.color.primaryDark, marginTop: 6 },

  arrowPill: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  arrowActive: { backgroundColor: V.color.primaryDark },
  arrowInactive: { backgroundColor: '#e2e8f0' },
  arrowTxt: { fontSize: 15, fontWeight: '800' },

  emptyTxt: {
    fontSize: 12.5,
    fontWeight: '700',
    color: V.color.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 6,
    paddingHorizontal: 10,
    lineHeight: 18,
  },

  proWrap: { marginTop: 8, alignItems: 'center' },
  primaryBtn: {
    backgroundColor: V.color.primaryDark,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnTxt: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  helper: {
    color: V.color.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    lineHeight: 16,
  },
  lockedHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 14,
    paddingHorizontal: 14,
  },
  lockedHintTxt: {
    color: V.color.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
});

export default SensoryBlockListScreen;

// ============================================================================
// Valeria+ · Integración Sensorial Auditiva — Catálogo de Actividades (v11)
// Módulo de desensibilización sistemática, modulación y filtrado figura-fondo.
//
// Lista PRESCRIBIBLE: las seis actividades están abiertas, y quién practica
// cuál lo decide el logopeda detrás del PIN profesional, igual que en Audición,
// Lenguaje, TEA, Dislexia, Pares Mínimos y Expansión Semántica. En Modo Familia
// los interruptores no existen: se practica lo prescrito y nada más.
// ============================================================================
import { ScreenHeader } from '../ui/ScreenHeader';
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
import { SensoryPreviewCard } from './SensoryPreviewCard';
import { FONT } from '../ui/fonts';
import { notify } from '../ui/notify';
import { PressableScale } from 'pressto';
import * as Haptics from 'expo-haptics';
import { ListRow } from '../ui/ListRow';
import { ToggleRight, TrafficCone, Search, Radar, AudioLines, Building2 } from 'lucide-react-native';

// Un icono propio por actividad (R20): en los datos varias compartían dibujo.
const SENSORY_ICON: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  'ISA-01': ToggleRight, 'ISA-02': TrafficCone, 'ISA-03': Search, 'ISA-04': Radar, 'ISA-05': AudioLines, 'ISA-06': Building2,
};
import { AdultFold } from '../ui/AdultFold';
import { PlayButton } from '../ui/PlayButton';

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
    notify(t.sensory.savedPrescription(activeCount));
  };

  const openExercise = (exercise: AuditorySensoryExercise) => {
    if (!exercise.isAvailable || !isPrescribed(exercise.id)) return;
    navigation.navigate('SensoryExercise', { exerciseId: exercise.id });
  };

  return (
    <View style={s.flex}>
      {/* Cabecera */}
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.common.back}
        kicker={t.sensory.blockTag} icon="sensory" title={t.sensory.blockTitle} subtitle={t.sensory.blockSubtitle}>

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
      </ScreenHeader>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!!toast && (
          <View style={s.toast}>
            <View style={s.toastCheck}><BlockIcon name="check" color="#ffffff" size={15} /></View>
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        )}

        <View style={s.listHead}>
          <Text style={s.listLabel}>{t.sensory.activitiesHeader}</Text>
          <View style={s.countChip}>
            <Text style={s.countChipTxt}>
              {t.sensory.prescribedOf(activeCount, AUDITORY_INTEGRATION_ACTIVITIES.length)}
            </Text>
          </View>
        </View>

        {AUDITORY_INTEGRATION_ACTIVITIES.map((act, i) => {
          const timesDone = sensoryState.completedActivities[act.id] ?? 0;
          const isDone = timesDone > 0;
          const isPilot = act.id === 'ISA-01';
          const on = isPrescribed(act.id);
          // Practicable = existe y está prescrita. Con el PIN echado, una
          // actividad no prescrita no se abre; con el PIN puesto, tocar la
          // tarjeta la prescribe o la retira en vez de arrancar la sesión.
          const playable = act.isAvailable && on;

          const title = String((t.sensory as any)[act.titleKey] ?? act.id);
          const status = !act.isAvailable ? t.sensory.inDevBadge
            : !on ? t.sensory.notPrescribed
              : timesDone > 0 ? t.sensory.completedTimes(timesDone) : '';
          return (
            <ListRow
              key={act.id}
              iconNode={SENSORY_ICON[act.id]}
              index={i}
              accent={playable ? V.color.primaryDark : '#8a9494'}
              tint={playable ? V.color.primaryLight : '#eef0ef'}
              title={title}
              subtitle={[String((t.sensory as any)[act.descKey] ?? ''), status].filter(Boolean).join(' · ')}
              dim={!unlocked && !playable}
              onPress={unlocked ? () => togglePrescribed(act.id) : playable ? () => openExercise(act) : undefined}
              accessibilityLabel={`${title}. ${!act.isAvailable ? t.sensory.inDevTag : on ? t.sensory.availableTag : t.sensory.notPrescribed}`}
              trailing={unlocked ? (
                <Switch
                  value={on}
                  onValueChange={() => togglePrescribed(act.id)}
                  disabled={!act.isAvailable}
                  trackColor={{ false: '#d1d5db', true: V.color.primary }}
                  thumbColor="#ffffff"
                />
              ) : <PlayButton color={V.color.primaryDark} locked={!playable} />}
            />
          );
        })}

        {activeCount === 0 && !unlocked && (
          <Text style={s.emptyTxt}>{t.sensory.prescriptionEmpty}</Text>
        )}

        {/* Banner de encuadre clínico */}
        <AdultFold label={t.sensory.clinicalNoticeTitle}>
        <View style={s.clinicalCard}>
          <View style={s.clinicalHeader}>
            <BlockIcon name="clinical" color={V.color.primaryDark} size={18} />
            <Text style={s.clinicalTitle}>{t.sensory.clinicalNoticeTitle}</Text>
          </View>
          <Text style={s.clinicalBody}>{t.sensory.clinicalNoticeBody}</Text>
        </View>
        </AdultFold>

        {/* SEN-01 · oír los once sonidos sin entrar en cada actividad. Va
            DEBAJO de las actividades: es una consulta del adulto, no la tarea
            principal de la pantalla. */}
        <SensoryPreviewCard navigation={navigation} />

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
        onUnlock={() => { setPinOpen(false); setUnlocked(true); notify(t.sensory.proUnlocked); }}
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
  backPillTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 12 },
  logoFallback: {
    color: 'rgba(255,255,255,.9)',
    fontWeight: '800',
    fontSize: 11.5,
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontFamily: FONT.display,color: '#fff', fontSize: 23, letterSpacing: -0.4 },
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
  statTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 12 },

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
  toastTxt: { fontFamily: FONT.bodyBlack,color: V.color.textPrimary, fontSize: 13, flex: 1 },

  clinicalCard: {
    backgroundColor: '#e6f9f8',
    borderWidth: 1,
    borderColor: '#cdeeec',
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
  },
  clinicalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  clinicalTitle: { fontFamily: FONT.bodyBlack,fontSize: 13.5, color: V.color.primaryDark },
  clinicalBody: { fontFamily: FONT.bodyBold,fontSize: 12.5, color: V.color.textSecondary, lineHeight: 18 },

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
  countChipTxt: { fontFamily: FONT.bodyBlack,fontSize: 11, color: V.color.primaryDark },

  actCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#ffffff',
    borderWidth: 2, borderBottomWidth: 6, borderColor: '#cdeeec', borderRadius: 24,
    paddingVertical: 14, paddingHorizontal: 14, marginBottom: 12,
  },
  actCardDisabled: { opacity: 0.72, backgroundColor: '#fbfcfc' },
  actCardDone: { borderColor: V.color.borderActive },
  actIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  actIconActive: { backgroundColor: V.color.primaryLight },
  actIconInactive: { backgroundColor: '#f1f5f9' },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  actIdTag: { fontFamily: FONT.bodyBlack,fontSize: 11, letterSpacing: 0.5 },
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
  actTitle: { fontFamily: FONT.display, fontSize: 19, lineHeight: 23, color: V.color.textPrimary },
  actDesc: { fontFamily: FONT.body, fontSize: 14, color: V.color.textSecondary, marginTop: 3, lineHeight: 19 },
  actOffTag: { fontFamily: FONT.bodyBlack,fontSize: 11, color: V.color.textMuted, marginTop: 6 },
  actTimes: { fontFamily: FONT.bodyBlack,fontSize: 11, color: V.color.primaryDark, marginTop: 6 },

  arrowPill: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  arrowActive: { backgroundColor: V.color.primaryDark },
  arrowInactive: { backgroundColor: '#e2e8f0' },
  arrowTxt: { fontFamily: FONT.bodyBlack,fontSize: 15 },

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
  primaryBtnTxt: { fontFamily: FONT.bodyBlack,color: '#ffffff', fontSize: 15 },
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

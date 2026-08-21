// ============================================================================
// Valeria+ · Integración Sensorial Auditiva — Catálogo de Actividades (v11)
// Módulo de desensibilización sistemática, modulación y filtrado figura-fondo.
// ============================================================================
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { V } from '../valeriaTheme';
import { useT } from '../i18n';
import { BlockIcon } from '../ValeriaBlockIcons';
import { AUDITORY_INTEGRATION_ACTIVITIES } from './sensoryCatalog';
import { useSensoryState } from './sensoryStore';
import { AuditorySensoryExercise } from './sensoryTypes';

export const SensoryBlockListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const sensoryState = useSensoryState();

  const openExercise = (exercise: AuditorySensoryExercise) => {
    if (!exercise.isAvailable) return;
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
        {/* Banner de encuadre clínico */}
        <View style={s.clinicalCard}>
          <View style={s.clinicalHeader}>
            <BlockIcon name="clinical" color={V.color.primaryDark} size={18} />
            <Text style={s.clinicalTitle}>{t.sensory.clinicalNoticeTitle}</Text>
          </View>
          <Text style={s.clinicalBody}>{t.sensory.clinicalNoticeBody}</Text>
        </View>

        <Text style={s.listLabel}>{t.sensory.activitiesHeader}</Text>

        {AUDITORY_INTEGRATION_ACTIVITIES.map((act, index) => {
          const timesDone = sensoryState.completedActivities[act.id] ?? 0;
          const isDone = timesDone > 0;
          const isPilot = act.id === 'ISA-01';

          return (
            <Pressable
              key={act.id}
              onPress={() => openExercise(act)}
              disabled={!act.isAvailable}
              style={[
                s.actCard,
                !act.isAvailable && s.actCardDisabled,
                isDone && s.actCardDone,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${t.sensory[act.titleKey as keyof typeof t.sensory] ?? act.id}. ${
                act.isAvailable ? t.sensory.availableTag : t.sensory.inDevTag
              }`}
            >
              <View style={[s.actIcon, act.isAvailable ? s.actIconActive : s.actIconInactive]}>
                <BlockIcon
                  name={act.iconName}
                  color={act.isAvailable ? V.color.primaryDark : V.color.textMuted}
                  size={24}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={s.cardTopRow}>
                  <Text style={[s.actIdTag, { color: act.isAvailable ? V.color.primaryDark : V.color.textMuted }]}>
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
                {timesDone > 0 && (
                  <Text style={s.actTimes}>
                    {t.sensory.completedTimes(timesDone)}
                  </Text>
                )}
              </View>

              {/* El candado es el icono del set, no 🔒: ese emoji ya se sacó una
                  vez de la lista prescribible y volvió a entrar por aquí. */}
              <View style={[s.arrowPill, act.isAvailable ? s.arrowActive : s.arrowInactive]}>
                {act.isAvailable ? (
                  <Text style={[s.arrowTxt, { color: '#ffffff' }]}>›</Text>
                ) : (
                  <BlockIcon name="lock" color={V.color.textMuted} size={18} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
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

  listLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: V.color.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginHorizontal: 2,
  },

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
  actTimes: { fontSize: 11, fontWeight: '700', color: V.color.primaryDark, marginTop: 6 },

  arrowPill: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  arrowActive: { backgroundColor: V.color.primaryDark },
  arrowInactive: { backgroundColor: '#e2e8f0' },
  arrowTxt: { fontSize: 15, fontWeight: '800' },
});

export default SensoryBlockListScreen;

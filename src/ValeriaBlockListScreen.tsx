// ============================================================================
// Valeria+ · Lista prescribible de UN bloque (v11) — Sprint 3.2
//
// Es la vista `view === 'list'` de ValeriaExerciseSelectionScreen convertida en
// RUTA REAL, con el bloque como parámetro. La lógica se ha MOVIDO, no
// reescrito: bandas de edad, sesión completa, PIN, switches y persistencia
// hacen exactamente lo mismo que en la v10.2.
//
// ---------------------------------------------------------------------------
// POR QUÉ ERA UNA RUTA Y NO UN `useState`
// ---------------------------------------------------------------------------
// En la v10.2 el paso hub → lista era un cambio de estado dentro de una sola
// pantalla. Eso tenía dos consecuencias que no se veían en el código:
//
//   1. BUG DEL ATRÁS DE ANDROID. Al no empujar ruta, no había nada que el
//      botón físico pudiera interceptar: pulsarlo desde la lista no volvía al
//      hub, salía de ExerciseSelection entera hacia PatientSelect o
//      FichaRegistro, y el adulto perdía el sitio. Como ruta, el atrás vuelve
//      al hub sin escribir una línea de BackHandler.
//
//   2. AGUJERO EN LA TELEMETRÍA. `noteScreen` acumula ms por NOMBRE DE RUTA:
//      todo el tiempo de prescripción se imputaba a `ExerciseSelection` y no
//      se podía distinguir "navegar el hub" de "prescribir". `BlockList` es
//      una clave nueva —adición, no ruptura— y esa distinción ya se mide.
//
// La prescripción se guarda en la MISMA clave de AsyncStorage de siempre
// (ver valeriaBlocks): actualizar a la v11 no pierde lo prescrito.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { BLOCKS, BlockKey } from './valeriaBlocks';
import { AGE_BANDS } from './valeriaExerciseMeta';
import { ProUnlockPill, ProPinModal } from './ValeriaProPin';
import { useT, UiStrings } from './i18n';

// Título, etiqueta de protocolo, referencia larga y la descripción que antes
// vivía en la tarjeta del hub. Todas son claves i18n QUE YA EXISTÍAN: la v11
// no borra ninguna, solo cambia dónde se pintan.
const copyFor = (t: UiStrings, key: BlockKey) => ({
  audicion: { title: t.hub.tabHearing, label: t.hub.protocolHearing, sub: t.hub.hearingSub, ref: t.hub.refHearing },
  lenguaje: { title: t.hub.tabLanguage, label: t.hub.protocolLanguage, sub: t.hub.languageSub, ref: '' },
  tea: { title: t.hub.tabAutism, label: t.hub.protocolAutism, sub: t.hub.autismSub, ref: t.hub.refAutism },
  dislexia: { title: t.hub.tabDyslexia, label: t.hub.protocolDyslexia, sub: t.hub.dyslexiaSub, ref: t.hub.refDyslexia },
}[key]);

export const ValeriaBlockListScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const t = useT();
  const blockKey: BlockKey = route?.params?.block ?? 'audicion';
  const block = BLOCKS[blockKey];
  const copy = copyFor(t, blockKey);
  const list = block.meta;

  const [active, setActive] = useState<boolean[]>(new Array(list.length).fill(true));
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [usesHearingDevice, setUsesHearingDevice] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(block.storageKey);
        if (raw) {
          const p = JSON.parse(raw);
          if (Array.isArray(p) && p.length === list.length) setActive(p);
        }
        const r = await AsyncStorage.getItem(STORAGE_KEYS.registro);
        if (r) {
          const patologia = JSON.parse(r)?.patologia ?? '';
          setUsesHearingDevice(/Audífono|Implante Coclear/i.test(patologia));
        }
      } catch (e) { /* noop */ }
    })();
  }, [block.storageKey, list.length]);

  const activeCount = active.filter(Boolean).length;

  const toggle = (i: number) => {
    if (!unlocked) return;
    setActive((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
    setToast('');
  };

  // Solo escribe la clave de ESTE bloque. En la v10.2 `save()` reescribía las
  // cuatro de golpe porque las cuatro vivían en el mismo componente; aquí las
  // otras tres ni se han cargado, así que tocarlas sería reescribir estado que
  // esta pantalla no posee.
  const save = async () => {
    try {
      await AsyncStorage.setItem(block.storageKey, JSON.stringify(active));
    } catch (e) { /* noop */ }
    setUnlocked(false);
    setToast(t.hub.savedPrescription(active.filter(Boolean).length));
  };

  // Si la ficha activa indica audífono o implante, el Test de Ling va ANTES del
  // player. Regla clínica intacta respecto de la v10.2.
  const practice = (params: { id?: string; ids?: string[] }) =>
    navigation.navigate(usesHearingDevice ? 'LingTest' : 'ExercisePlayer', params);

  const prescribedIds = list.filter((_, i) => active[i]).map((it) => it.id);

  // Secciones por edad (solo Audición). Las bandas se derivan de los datos: una
  // edad no contemplada en AGE_BANDS añade su sección al final en vez de
  // ocultar el ejercicio.
  const sections = (() => {
    const indexed = list.map((item, i) => ({ item, i }));
    if (!block.byAge) return [{ band: null as string | null, rows: indexed }];
    const extra = Array.from(new Set(
      indexed.map(({ item }) => item.age).filter((a): a is string => !!a && !AGE_BANDS.includes(a)),
    ));
    const noAge = indexed.filter(({ item }) => !item.age);
    return [
      ...[...AGE_BANDS, ...extra].map((band) => ({
        band: band as string | null,
        rows: indexed.filter(({ item }) => item.age === band),
      })),
      ...(noAge.length ? [{ band: t.hub.otherAges as string | null, rows: noAge }] : []),
    ];
  })();

  return (
    <View style={s.flex}>
      <View style={s.header}>
        {/* Ruta real: el atrás del sistema y esta píldora hacen ya lo mismo. */}
        {/* [Sprint 4.2] La píldora mide ~24 px de alto: hitSlop la lleva al
            mínimo accesible de 48 dp sin engordarla visualmente. */}
        <Pressable onPress={() => navigation.goBack()} style={s.backPill} hitSlop={12}
          accessibilityRole="button" accessibilityLabel={t.hub.backToBlocks}>
          <Text style={s.backPillTxt}>{`‹ ${t.hub.backToBlocks}`}</Text>
        </Pressable>
        <Text style={s.headerTitle}>{copy.title}</Text>
        <Text style={s.headerSub}>{unlocked ? t.hub.editingOn : t.hub.editingOff}</Text>
        <View style={s.blockChip}>
          <Text style={s.blockChipTxt}>{t.hub.blockChip(list.length, activeCount)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {!!toast && (
          <View style={s.toast}>
            <View style={s.toastCheck}><Text style={s.toastCheckTxt}>✓</Text></View>
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        )}

        <ProUnlockPill unlocked={unlocked} onPress={() => setModalOpen(true)} />

        {/* Sesión completa: encadena los prescritos del bloque en un solo plan. */}
        <Pressable
          onPress={() => prescribedIds.length && practice({ ids: prescribedIds })}
          disabled={!prescribedIds.length}
          style={[s.sessionBtn, !prescribedIds.length && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel={t.hub.fullSessionA11y(prescribedIds.length)}
        >
          <Text style={s.sessionIcon}>🎯</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.sessionBtnTitle}>{t.hub.fullSession}</Text>
            <Text style={s.sessionBtnSub}>{t.hub.fullSessionSub(prescribedIds.length)}</Text>
          </View>
          <Text style={s.sessionBtnGo}>▶</Text>
        </Pressable>

        <View style={s.listHead}>
          <Text style={s.listLabel}>{copy.label}</Text>
          <View style={s.countBadge}><Text style={s.countBadgeTxt}>{t.hub.prescribedCount(activeCount)}</Text></View>
        </View>

        {/* [Sprint 3.4] Aquí aterriza la descripción que se quitó de la tarjeta
            del hub. No se ha borrado ni una clave: varias llevan carga MDR
            ("Estresores siempre manuales", "Sin grabar nada y con el micrófono
            apagado") y ahora se leen justo antes de usar el bloque, en vez de
            siete seguidas de bloques que el adulto no va a abrir. */}
        <View style={s.refCard}>
          <Text style={s.refIcon}>ℹ️</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.refCardSub}>{copy.sub}</Text>
            {!!copy.ref && <Text style={s.refCardTxt}>{copy.ref}</Text>}
          </View>
        </View>

        {sections.map(({ band, rows }) => {
          if (!rows.length) return null;
          return (
            <View key={band ?? 'all'}>
              {band != null && (
                <View style={s.ageHead}>
                  <Text style={s.ageHeadTxt}>👶 {band.toUpperCase()}</Text>
                  <View style={s.ageHeadLine} />
                </View>
              )}
              {rows.map(({ item, i }) => {
                const on = active[i];
                return (
                  <View key={item.id} style={[s.row, { borderColor: on ? V.color.borderActive : V.color.border }]}>
                    <View style={[s.codeChip, { backgroundColor: on ? V.color.primaryLight : '#f1f5f4' }]}>
                      <Text style={[s.codeChipTxt, { color: on ? V.color.primaryDark : V.color.textMuted }]}>{item.code}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.rowName}>{item.name}</Text>
                      <Text style={s.rowCat}>{item.category}</Text>
                    </View>
                    <Pressable
                      onPress={() => practice({ id: item.id })}
                      style={s.playBtn} hitSlop={6}
                      accessibilityRole="button" accessibilityLabel={t.hub.practiceA11y(item.name)}
                    >
                      <Text style={s.playBtnTxt}>▶</Text>
                    </Pressable>
                    <Switch value={on} onValueChange={() => toggle(i)} disabled={!unlocked}
                      trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff"
                      style={{ opacity: unlocked ? 1 : 0.4 }} />
                  </View>
                );
              })}
            </View>
          );
        })}

        {unlocked ? (
          <View style={{ marginTop: V.space.lg }}>
            <Pressable onPress={save} style={s.primaryBtn} accessibilityRole="button">
              <Text style={s.primaryBtnTxt}>{t.hub.savePrescription}</Text>
            </Pressable>
            <Text style={s.helper}>{t.hub.saveHelper}</Text>
          </View>
        ) : (
          <View style={s.lockedHint}>
            <Text style={s.lockIcon}>🔒</Text>
            <Text style={s.lockedHintTxt}>{t.hub.lockedHint}</Text>
          </View>
        )}
      </ScrollView>

      <ProPinModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUnlock={() => { setModalOpen(false); setUnlocked(true); setToast(t.hub.proUnlocked); }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: {
    backgroundColor: V.color.primary, paddingTop: V.space.lg, paddingHorizontal: V.space.xl,
    paddingBottom: V.space.lg, borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  backPill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)', borderRadius: 11,
    paddingHorizontal: 11, paddingVertical: 5, marginBottom: V.space.sm,
  },
  backPillTxt: { color: '#fff', ...V.type.caption, fontSize: 12, fontWeight: V.font.extrabold },
  headerTitle: { ...V.type.display, color: '#fff', fontWeight: V.font.extrabold, letterSpacing: -0.4 },
  headerSub: { ...V.type.body, color: 'rgba(255,255,255,.9)', fontWeight: V.font.semibold, marginTop: V.space.xs },
  blockChip: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)', borderRadius: 11,
    paddingHorizontal: 11, paddingVertical: 6, marginTop: V.space.md,
  },
  blockChipTxt: { color: '#fff', fontSize: 12, fontWeight: V.font.extrabold },

  scroll: { padding: V.space.lg, paddingBottom: V.space.xxl },

  toast: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.sm, backgroundColor: V.color.primaryTint,
    borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginBottom: V.space.md,
  },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastCheckTxt: { color: '#fff', fontWeight: V.font.extrabold, fontSize: 13 },
  toastTxt: { color: V.color.textPrimary, ...V.type.body, fontWeight: V.font.bold, flex: 1 },

  sessionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: V.color.primary,
    borderRadius: V.radius.card, padding: 14, marginTop: V.space.md, ...V.shadow.button,
  },
  sessionIcon: { fontSize: 17 },
  sessionBtnTitle: { color: '#fff', ...V.type.title, fontWeight: V.font.extrabold },
  sessionBtnSub: { color: 'rgba(255,255,255,.9)', ...V.type.caption, fontWeight: V.font.semibold, marginTop: 2 },
  sessionBtnGo: { color: '#fff', fontSize: 16, fontWeight: V.font.extrabold },

  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: V.space.lg, marginHorizontal: V.space.xs },
  listLabel: { ...V.type.caption, fontSize: 12, fontWeight: V.font.extrabold, color: V.color.textMuted, letterSpacing: 0.4 },
  countBadge: { backgroundColor: V.color.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  countBadgeTxt: { fontSize: 12, fontWeight: V.font.extrabold, color: V.color.primaryDark },

  refCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: '#eef6ff',
    borderWidth: 1, borderColor: '#d3e5fb', borderRadius: 13, padding: V.space.md, marginBottom: V.space.md,
  },
  refIcon: { fontSize: 15 },
  refCardSub: { ...V.type.body, fontWeight: V.font.bold, color: '#22456e' },
  refCardTxt: { ...V.type.caption, fontSize: 11.5, lineHeight: 16, fontWeight: V.font.semibold, color: '#2c5382', marginTop: V.space.sm },

  ageHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: V.space.sm, marginBottom: 9, marginHorizontal: 2 },
  ageHeadTxt: { fontSize: 11.5, fontWeight: V.font.extrabold, letterSpacing: 0.5, color: V.color.primaryDark },
  ageHeadLine: { flex: 1, height: 1, backgroundColor: V.color.borderActive },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.md, backgroundColor: '#fff',
    borderWidth: 1, borderRadius: 15, padding: V.space.md, marginBottom: 9, ...V.shadow.card,
  },
  codeChip: { minWidth: 42, height: 30, paddingHorizontal: V.space.sm, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  codeChipTxt: { fontSize: 12, fontWeight: V.font.extrabold, letterSpacing: 0.3 },
  rowName: { fontSize: 14.5, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  rowCat: { ...V.type.caption, fontSize: 11.5, fontWeight: V.font.bold, color: V.color.textMuted, marginTop: 2 },
  // 48×48 + hitSlop: mínimo accesible señalado por los evaluadores.
  playBtn: {
    width: V.touchMin, height: V.touchMin, borderRadius: 15, backgroundColor: V.color.primaryLight,
    borderWidth: 1, borderColor: V.color.borderActive, alignItems: 'center', justifyContent: 'center',
  },
  playBtnTxt: { color: V.color.primaryDark, fontSize: 17 },

  primaryBtn: { backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: V.space.lg, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: V.font.extrabold },
  helper: { textAlign: 'center', color: V.color.textMuted, fontSize: 11.5, marginTop: 11, fontWeight: V.font.semibold, paddingHorizontal: 14 },
  lockedHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: V.space.lg, paddingHorizontal: V.space.lg },
  lockIcon: { fontSize: 13 },
  lockedHintTxt: { color: V.color.textMuted, fontSize: 12, fontWeight: V.font.bold, textAlign: 'center' },
});

export default ValeriaBlockListScreen;

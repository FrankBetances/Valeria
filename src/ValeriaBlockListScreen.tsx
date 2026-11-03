// ============================================================================
// Valeria+ · Lista prescribible de UN bloque — rediseño
//
// Lo que había, y por qué se rehace entera en vez de retocarla:
//
//   · DIECIOCHO FILAS IDÉNTICAS. Ni jerarquía, ni progreso, ni diferencia entre
//     lo prescrito y lo que no lo está. Una hoja de cálculo con interruptores.
//   · TEXTO QUE NO SE VE. La categoría de cada terapia («Sonidos y vocales
//     (fonética-fonología)») iba en gris #9aa6a5 sobre blanco: ~2,3:1 de
//     contraste, por debajo del 4,5 que pide WCAG AA. Era, además, el texto que
//     más espacio ocupaba de la fila.
//   · CERO MOTIVACIÓN. Ni racha, ni nivel, ni mascota: el niño no veía nada
//     suyo en la pantalla desde la que se entra a practicar.
//   · CABECERA DE 155 px para un título, un subtítulo de estado y un chip.
//     Sigue siendo fija —el botón de volver tiene que estar siempre a mano, y
//     en iOS no hay atrás del sistema— pero baja a ~93 px: el estado de edición
//     se ha mudado a la píldora del PIN, que es donde se actúa sobre él.
//   · EMOJI DEL SISTEMA como iconografía (🎯 ℹ️ 👶 🔒 ▶ ✓) — regla 5. Era la
//     última pantalla donde quedaban.
//   · 370 px DE PROSA del protocolo antes del primer ejercicio, dirigida al
//     adulto, en el camino del niño.
//
// Lo que NO cambia, y es deliberado: la prescripción se guarda en la MISMA
// clave de AsyncStorage, el PIN sigue siendo la única puerta a la edición, el
// Test de Ling sigue yendo antes del player si la ficha indica audífono o
// implante, y `noteScreen` sigue imputando el tiempo a la ruta `BlockList`.
// Rediseño de presentación; la lógica clínica se ha movido, no reescrito.
// ============================================================================
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { BLOCKS, BlockKey } from './valeriaBlocks';
import { getExercisesForBlock, getAgeBands } from './valeriaExerciseMeta';
import { getUiLang } from './valeriaUiLang';
import { ProUnlockPill, ProPinModal } from './ValeriaProPin';
import { BlockIcon } from './ValeriaBlockIcons';
import { ValeriaGameStrip } from './ValeriaGameStrip';
import { ScreenHeader } from './ui/ScreenHeader';
import { PlayButton } from './ui/PlayButton';
import { ValeriaAwardsSheet } from './ValeriaAwardsSheet';
import { loadGame, GameState } from './valeriaGamification';
import { useT, UiStrings } from './i18n';
import { PressableScale } from 'pressto';
import * as Haptics from 'expo-haptics';
import { KidButton } from './ui/KidButton';
import { FONT } from './ui/fonts';

// Título, etiqueta de protocolo, referencia larga y descripción. Todas son
// claves i18n QUE YA EXISTÍAN: el rediseño no borra ninguna.
const copyFor = (t: UiStrings, key: BlockKey) => ({
  audicion: { title: t.hub.hearingTitle, label: t.hub.protocolHearing, sub: t.hub.hearingSub, ref: t.hub.refHearing },
  lenguaje: { title: t.hub.languageTitle, label: t.hub.protocolLanguage, sub: t.hub.languageSub, ref: '' },
  tea: { title: t.hub.autismTitle, label: t.hub.protocolAutism, sub: t.hub.autismSub, ref: t.hub.refAutism },
  dislexia: { title: t.hub.dyslexiaTitle, label: t.hub.protocolDyslexia, sub: t.hub.dyslexiaSub, ref: t.hub.refDyslexia },
}[key]);

export const ValeriaBlockListScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const t = useT();
  const lang = getUiLang();
  const blockKey: BlockKey = route?.params?.block ?? 'audicion';
  const block = BLOCKS[blockKey];
  const copy = copyFor(t, blockKey);
  const list = getExercisesForBlock(blockKey, lang);

  const [active, setActive] = useState<boolean[]>(new Array(list.length).fill(true));
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [usesHearingDevice, setUsesHearingDevice] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [game, setGame] = useState<GameState | null>(null);
  const [awardsOpen, setAwardsOpen] = useState(false);

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

  // La tira de juego se relee al recibir el foco: el niño vuelve aquí después
  // de una sesión y la racha tiene que estar ya subida.
  const refreshGame = useCallback(async () => {
    try { setGame(await loadGame()); } catch (e) { /* noop */ }
  }, []);
  useEffect(() => {
    void refreshGame();
    return navigation.addListener('focus', () => { void refreshGame(); });
  }, [navigation, refreshGame]);

  const activeCount = active.filter(Boolean).length;

  const toggle = (i: number) => {
    if (!unlocked) return;
    setActive((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
    setToast('');
  };

  // Solo escribe la clave de ESTE bloque.
  const save = async () => {
    try {
      await AsyncStorage.setItem(block.storageKey, JSON.stringify(active));
    } catch (e) { /* noop */ }
    setUnlocked(false);
    setToast(t.hub.savedPrescription(active.filter(Boolean).length));
  };

  // Si la ficha activa indica audífono o implante, el Test de Ling va ANTES del
  // player. Regla clínica intacta.
  const practice = (params: { id?: string; ids?: string[] }) =>
    navigation.navigate(usesHearingDevice ? 'LingTest' : 'ExercisePlayer', params);

  const prescribedIds = list.filter((_, i) => active[i]).map((it) => it.id);

  // Secciones por edad (solo Audición). Las bandas se derivan de los datos: una
  // edad no contemplada en ageBands añade su sección al final.
  const sections = (() => {
    const ageBands = getAgeBands(lang);
    const indexed = list.map((item, i) => ({ item, i }));
    if (!block.byAge) return [{ band: null as string | null, rows: indexed }];
    const extra = Array.from(new Set(
      indexed.map(({ item }) => item.age).filter((a): a is string => !!a && !ageBands.includes(a)),
    ));
    const noAge = indexed.filter(({ item }) => !item.age);
    return [
      ...[...ageBands, ...extra].map((band) => ({
        band: band as string | null,
        rows: indexed.filter(({ item }) => item.age === band),
      })),
      ...(noAge.length ? [{ band: t.hub.otherAges as string | null, rows: noAge }] : []),
    ];
  })();

  return (
    <View style={s.flex}>
      {/* Cabecera compacta. La v11 gastaba aquí 155 px fijos para un título, un
          subtítulo de estado y un chip; el estado vive ahora donde se actúa
          (la píldora del PIN) y el recuento, en el propio encabezado. */}
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.hub.backToBlocks}
        kicker={t.hub.kickerPractice} icon={block.icon} title={copy.title}
        badge={t.hub.prescribedOf(activeCount, list.length)} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* La misma tira que el hub: el niño ve su nivel y su racha también
            desde la pantalla en la que se entra a practicar. */}
        <ValeriaGameStrip game={game} onPress={() => setAwardsOpen(true)} />

        {!!toast && (
          <View style={s.toast}>
            <View style={s.toastCheck}><BlockIcon name="check" color="#ffffff" size={15} /></View>
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        )}

        {/* Sesión completa: encadena los prescritos del bloque en un solo plan. */}
        <View style={[s.sessionWrap, !prescribedIds.length && { opacity: 0.5 }]}>
          <KidButton label={`▶  ${t.hub.fullSession}`}
            accessibilityLabel={t.hub.fullSessionA11y(prescribedIds.length)}
            onPress={() => { if (prescribedIds.length) practice({ ids: prescribedIds }); }}
            color={block.accentFg} depth="rgba(0,0,0,0.28)" textColor="#ffffff" />
        </View>

        {/* Ficha del protocolo: PLEGADA por defecto. Es texto para el adulto
            —y parte lleva carga MDR, así que no se puede borrar— pero eran
            ~370 px de prosa por delante del primer ejercicio. */}
        <Pressable
          onPress={() => setRefOpen((v) => !v)}
          style={s.refToggle}
          accessibilityRole="button"
          accessibilityLabel={refOpen ? t.hub.protocolCardClose : t.hub.protocolCardOpen}
        >
          <BlockIcon name="info" color="#2c5382" size={19} />
          <Text style={s.refToggleTxt}>{refOpen ? t.hub.protocolCardClose : t.hub.protocolCardOpen}</Text>
          <Text style={s.refChev}>{refOpen ? '⌃' : '⌄'}</Text>
        </Pressable>
        {refOpen && (
          <View style={s.refCard}>
            <Text style={s.refCardSub}>{copy.sub}</Text>
            {!!copy.ref && <Text style={s.refCardTxt}>{copy.ref}</Text>}
          </View>
        )}

        <View style={s.listHead}>
          <Text style={s.listLabel}>{copy.label}</Text>
        </View>

        {sections.map(({ band, rows }) => {
          if (!rows.length) return null;
          return (
            <View key={band ?? 'all'}>
              {band != null && (
                <View style={s.ageHead}>
                  <BlockIcon name="age" color={V.color.primaryDark} size={16} />
                  <Text style={s.ageHeadTxt}>{band.toUpperCase()}</Text>
                  <View style={s.ageHeadLine} />
                </View>
              )}
              {rows.map(({ item, i }) => {
                const on = active[i];
                return (
                  // La FILA ENTERA practica. Antes el único blanco era un botón
                  // de 48 px con un ▶ dentro, compitiendo en peso visual con un
                  // interruptor que en Modo Familia ni siquiera se puede tocar.
                  <PressableScale
                    key={item.id}
                    onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); practice({ id: item.id }); }}
                    style={[s.row, { borderColor: on ? block.accentFg : '#e3dccf' }, !on && s.rowOff]}
                    accessibilityRole="button"
                    accessibilityLabel={t.hub.practiceA11y(item.name)}
                  >
                    <View style={[s.rowIcon, { backgroundColor: on ? block.accentBg : '#f1f5f4' }]}>
                      <BlockIcon name={block.icon} color={on ? block.accentFg : V.color.textSecondary} size={28} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={s.rowName} numberOfLines={2}>{item.name}</Text>
                      {/* textSecondary, no textMuted: este es el texto que no
                          se veía. */}
                      <Text style={s.rowCat} numberOfLines={2}>{item.category}</Text>
                      {!on && <Text style={s.rowOffTag}>{t.hub.notPrescribed}</Text>}
                    </View>

                    {/* El interruptor SOLO en edición profesional. Con el PIN
                        echado era un control gris permanentemente inerte en
                        cada una de las dieciocho filas. */}
                    {unlocked ? (
                      <Switch value={on} onValueChange={() => toggle(i)}
                        trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff" />
                    ) : (
                      <PlayButton color={block.accentFg} tint={block.accentBg} />
                    )}
                  </PressableScale>
                );
              })}
            </View>
          );
        })}

        {/* La puerta del PIN, al final: en Modo Familia no hay nada que editar
            arriba y la píldora se comía el sitio del primer ejercicio. */}
        <View style={s.proWrap}>
          <ProUnlockPill unlocked={unlocked} onPress={() => setModalOpen(true)} />
        </View>

        {unlocked ? (
          <View style={{ marginTop: V.space.md }}>
            <Pressable onPress={save} style={s.primaryBtn} accessibilityRole="button">
              <Text style={s.primaryBtnTxt}>{t.hub.savePrescription}</Text>
            </Pressable>
            <Text style={s.helper}>{t.hub.saveHelper}</Text>
          </View>
        ) : (
          <View style={s.lockedHint}>
            <BlockIcon name="lock" color={V.color.textSecondary} size={16} />
            <Text style={s.lockedHintTxt}>{t.hub.lockedHint}</Text>
          </View>
        )}
      </ScrollView>

      <ValeriaAwardsSheet open={awardsOpen} game={game} onClose={() => setAwardsOpen(false)} />

      <ProPinModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUnlock={() => { setModalOpen(false); setUnlocked(true); setToast(t.hub.proUnlocked); }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff8ec' },
  header: {
    backgroundColor: V.color.primary, paddingTop: V.space.md, paddingHorizontal: V.space.xl,
    paddingBottom: V.space.lg, borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  backPill: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)', borderRadius: 11,
    paddingHorizontal: 11, paddingVertical: 5, marginBottom: V.space.md,
  },
  backPillTxt: { fontFamily: FONT.bodyBlack,color: '#fff', ...V.type.caption, fontSize: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: V.space.md },
  headerTitle: { fontFamily: FONT.bodyBlack,...V.type.display, color: '#fff', letterSpacing: -0.4, flexShrink: 1 },
  blockChip: {
    backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)', borderRadius: 11,
    paddingHorizontal: 11, paddingVertical: 6,
  },
  blockChipTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 12 },

  scroll: { padding: V.space.lg, paddingBottom: V.space.xxl },

  toast: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.sm, backgroundColor: V.color.primaryTint,
    borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginTop: V.space.md,
  },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastTxt: { fontFamily: FONT.bodyBlack,color: V.color.textPrimary, ...V.type.body, flex: 1 },

  sessionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.md, backgroundColor: V.color.primary,
    borderRadius: 20, padding: 15, marginTop: V.space.lg, ...V.shadow.button,
  },
  sessionIcon: {
    width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  sessionBtnTitle: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 16 },
  sessionBtnSub: { fontFamily: FONT.bodyBlack,color: 'rgba(255,255,255,.92)', ...V.type.caption, fontSize: 11.5, lineHeight: 15, marginTop: 2 },

  refToggle: {
    flexDirection: 'row', alignItems: 'center', gap: V.space.sm, backgroundColor: '#eef6ff',
    borderWidth: 1, borderColor: '#d3e5fb', borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11,
    marginTop: V.space.md,
  },
  refToggleTxt: { fontFamily: FONT.bodyBlack,flex: 1, ...V.type.body, color: '#22456e' },
  refChev: { fontFamily: FONT.bodyBlack,fontSize: 15, color: '#22456e' },
  refCard: {
    backgroundColor: '#f6faff', borderWidth: 1, borderColor: '#d3e5fb', borderTopWidth: 0,
    borderBottomLeftRadius: 14, borderBottomRightRadius: 14, padding: V.space.md, marginTop: -6,
  },
  refCardSub: { fontFamily: FONT.bodyBlack,...V.type.body, color: '#22456e' },
  refCardTxt: { fontFamily: FONT.bodyBlack,...V.type.caption, fontSize: 11.5, lineHeight: 16, color: '#2c5382', marginTop: V.space.sm },

  listHead: { marginTop: V.space.xl, marginBottom: V.space.sm, marginHorizontal: V.space.xs },
  listLabel: {
    ...V.type.caption, fontSize: 12, fontWeight: V.font.extrabold,
    color: V.color.textSecondary, letterSpacing: 0.4,
  },

  ageHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: V.space.md, marginBottom: 9, marginHorizontal: 2 },
  ageHeadTxt: { fontFamily: FONT.bodyBlack,fontSize: 12, letterSpacing: 0.5, color: V.color.primaryDark },
  ageHeadLine: { flex: 1, height: 1, backgroundColor: V.color.borderActive },

  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#ffffff', borderRadius: 24, borderWidth: 2, borderBottomWidth: 6, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 12 },
  rowIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  sessionWrap: { marginBottom: 18 },
  rowOff: { backgroundColor: '#fbf7f0' },
  codeChip: { minWidth: 46, height: 34, paddingHorizontal: V.space.sm, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  codeChipTxt: { fontFamily: FONT.bodyBlack,fontSize: 12.5, letterSpacing: 0.3 },
  rowName: { fontFamily: FONT.display, fontSize: 19, lineHeight: 23, color: V.color.textPrimary },
  rowCat: { fontFamily: FONT.body, fontSize: 13.5, lineHeight: 18, color: V.color.textSecondary, marginTop: 3 },
  rowOffTag: { fontFamily: FONT.bodyBlack,fontSize: 10.5, color: V.color.textMuted, marginTop: 4, letterSpacing: 0.3 },
  playBtn: {
    width: V.touchMin, height: V.touchMin, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },

  proWrap: { marginTop: V.space.lg },
  primaryBtn: { backgroundColor: V.color.primary, borderRadius: 16, paddingVertical: V.space.lg, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 16 },
  helper: { fontFamily: FONT.bodyBlack,textAlign: 'center', color: V.color.textSecondary, fontSize: 11.5, marginTop: 11, paddingHorizontal: 14 },
  lockedHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: V.space.md, paddingHorizontal: V.space.lg },
  lockedHintTxt: { fontFamily: FONT.bodyBlack,color: V.color.textSecondary, fontSize: 12, textAlign: 'center', flexShrink: 1 },
});

export default ValeriaBlockListScreen;

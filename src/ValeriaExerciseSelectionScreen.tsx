// ============================================================================
// Valeria+ · Selección y Prescripción de Terapias (V2.3)
// Pestañas Audición (13) + Lenguaje (7). Modo Familia (solo lectura) y Modo
// Profesional desbloqueado por PIN (validación por hash SHA-256, sin texto plano).
// Persistencia: AsyncStorage. Si la ficha activa indica audífono/implante, navega
// primero al Test de Ling; si no, va directo a navigation.navigate('ExercisePlayer', { id }).
// V2.3: botón "Sesión completa" por pestaña — encadena todos los ejercicios
// prescritos del bloque en una sola sesión ({ ids }) en lugar de uno a uno.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { enableDailyReminders, disableReminders, remindersEnabled } from './valeriaNotifications';
import { loadGame, liveStreak, levelFor, levelName } from './valeriaGamification';
import { ProUnlockPill, ProPinModal } from './ValeriaProPin';
// import logoWhite from '../../assets/valeria-logo-white.png';

// ----------------------------------------------------------------------------
interface Item { id: string; code: string; name: string; category: string; age?: string; }

// Bloque de Audición: categorías en lenguaje llano (el término clínico entre
// paréntesis) y edad orientativa por actividad. En la lista se agrupan por
// edad para que las familias empiecen por las de su peque y no intenten
// trabajarlo todo a la vez.
const EXERCISES_AUD: Item[] = [
  { id: 'ff1', code: 'FF-1', name: 'Asociación vocal inicial', category: 'Sonidos y vocales (fonética-fonología)', age: '4-5 años' },
  { id: 'ff2', code: 'FF-2', name: 'Articulación de vocales', category: 'Sonidos y vocales (fonética-fonología)', age: '3-4 años' },
  { id: 'ff3', code: 'FF-3', name: 'Completar vocal faltante', category: 'Sonidos y vocales (fonética-fonología)', age: '5-6 años' },
  { id: 'se1', code: 'SE-1', name: 'Detección del intruso', category: 'Vocabulario (semántica)', age: '4-5 años' },
  { id: 'se2', code: 'SE-2', name: 'Adivinanza por letra', category: 'Vocabulario (semántica)', age: '5-6 años' },
  { id: 'se3', code: 'SE-3', name: 'Prendas y órdenes', category: 'Vocabulario (semántica)', age: '3-4 años' },
  { id: 'ms1', code: 'MS-1', name: 'Singular / plural', category: 'Frases (morfosintaxis)', age: '4-5 años' },
  { id: 'ms2', code: 'MS-2', name: 'Flexión de género', category: 'Frases (morfosintaxis)', age: '4-5 años' },
  { id: 'ms3', code: 'MS-3', name: 'Estructura S-V-O', category: 'Frases (morfosintaxis)', age: '5-6 años' },
  { id: 'pr1', code: 'PR-1', name: 'Preguntas tipo ¿qué?', category: 'Uso social (pragmática)', age: '3-4 años' },
  { id: 'pr2', code: 'PR-2', name: 'Adaptación del discurso', category: 'Uso social (pragmática)', age: '5-6 años' },
  { id: 'pr3', code: 'PR-3', name: 'Reconocimiento de emociones', category: 'Uso social (pragmática)', age: '4-5 años' },
  { id: 'pr4', code: 'PR-4', name: 'Petición de repetición', category: 'Uso social (pragmática)', age: '5-6 años' },
];
// Orden de las secciones por edad en la lista de Audición.
const AGE_BANDS = ['3-4 años', '4-5 años', '5-6 años'];
const EXERCISES_LEN: Item[] = [
  { id: 'atencion_conjunta', code: 'M-1', name: 'Atención Conjunta', category: 'Mirar, burbujas y nombre' },
  { id: 'imitacion', code: 'M-2', name: 'Imitación Motora/Verbal', category: 'Aplausos, tambor y sílabas' },
  { id: 'comprension', code: 'M-3', name: 'Comprensión Verbal', category: 'Órdenes, cuerpo y categorías' },
  { id: 'expresion', code: 'M-4', name: 'Expresión Verbal', category: 'Onomatopeyas, nombrar y frases' },
  { id: 'comunicacion_funcional', code: 'M-5', name: 'Comunicación Funcional', category: 'Pedir "más", "ayuda", "quiero"' },
  { id: 'regulacion_conductual', code: 'M-6', name: 'Regulación Conductual', category: 'Transiciones, rutinas y fichas' },
  { id: 'interaccion_social', code: 'M-7', name: 'Interacción Social', category: 'Turnos, juego simbólico, emociones' },
];

// ----------------------------------------------------------------------------
export const ValeriaExerciseSelectionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tab, setTab] = useState<'audicion' | 'lenguaje'>('audicion');
  // 'hub' = las 4 tarjetas de bloques · 'list' = la lista prescribible (audición/lenguaje).
  const [view, setView] = useState<'hub' | 'list'>('hub');
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [activeAud, setActiveAud] = useState<boolean[]>(new Array(EXERCISES_AUD.length).fill(true));
  const [activeLen, setActiveLen] = useState<boolean[]>(new Array(EXERCISES_LEN.length).fill(true));
  const [usesHearingDevice, setUsesHearingDevice] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const a = await AsyncStorage.getItem(STORAGE_KEYS.audicion);
        if (a) { const p = JSON.parse(a); if (Array.isArray(p) && p.length === EXERCISES_AUD.length) setActiveAud(p); }
        const l = await AsyncStorage.getItem(STORAGE_KEYS.lenguaje);
        if (l) { const p = JSON.parse(l); if (Array.isArray(p) && p.length === EXERCISES_LEN.length) setActiveLen(p); }
        const r = await AsyncStorage.getItem(STORAGE_KEYS.registro);
        if (r) {
          const patologia = JSON.parse(r)?.patologia ?? '';
          setUsesHearingDevice(/Audífono|Implante Coclear/i.test(patologia));
        }
      } catch (e) { /* noop */ }
      try {
        setReminders(await remindersEnabled());
        const g = await loadGame();
        setStreak(liveStreak(g));
        setLevel(levelFor(g.xp));
      } catch (e) { /* noop */ }
    })();
  }, []);

  const toggleReminders = async (next: boolean) => {
    if (next) {
      const ok = await enableDailyReminders();
      setReminders(ok);
      setToast(ok
        ? 'Recordatorios activados: máximo 4 avisitos al día (9:00, 13:00, 17:00 y 20:00). 🔔'
        : 'No se pudo activar: concede el permiso de notificaciones al sistema.');
    } else {
      await disableReminders();
      setReminders(false);
      setToast('Recordatorios desactivados.');
    }
  };

  const isAud = tab === 'audicion';
  const list = isAud ? EXERCISES_AUD : EXERCISES_LEN;
  const active = isAud ? activeAud : activeLen;
  const setActive = isAud ? setActiveAud : setActiveLen;
  const activeCount = active.filter(Boolean).length;

  const toggle = (i: number) => {
    if (!unlocked) return;
    setActive((prev) => { const n = [...prev]; n[i] = !n[i]; return n; });
    setToast('');
  };

  const save = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.audicion, JSON.stringify(activeAud));
      await AsyncStorage.setItem(STORAGE_KEYS.lenguaje, JSON.stringify(activeLen));
    } catch (e) { /* noop */ }
    const n = activeAud.filter(Boolean).length + activeLen.filter(Boolean).length;
    setUnlocked(false); setToast(`Prescripción guardada · ${n} terapias activas.`);
  };

  // Tarjeta de bloque del hub: icono con color de acento, título, subtítulo y,
  // opcionalmente, el recuento de terapias activas/totales.
  const blockCard = (opts: {
    icon: string; accentBg: string; accentFg: string; title: string; sub: string;
    onPress: () => void; a11y: string; total?: number; activeN?: number;
  }) => (
    <Pressable onPress={opts.onPress} style={s.blockCard} accessibilityRole="button" accessibilityLabel={opts.a11y}>
      <View style={[s.blockIcon, { backgroundColor: opts.accentBg }]}><Text style={{ fontSize: 24 }}>{opts.icon}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={s.blockTitle}>{opts.title}</Text>
        <Text style={s.blockSub}>{opts.sub}</Text>
        {opts.total != null && (
          <View style={s.blockMeta}>
            <View style={[s.blockBadge, { backgroundColor: opts.accentBg }]}>
              <Text style={[s.blockBadgeTxt, { color: opts.accentFg }]}>{opts.total} terapias</Text>
            </View>
            <Text style={s.blockActive}>{opts.activeN} activas</Text>
          </View>
        )}
      </View>
      <View style={[s.blockChev, { backgroundColor: opts.accentFg }]}><Text style={{ color: '#fff', fontSize: 15, fontWeight: '800' }}>›</Text></View>
    </Pressable>
  );

  const toastBar = !!toast && (
    <View style={s.toast}>
      <View style={s.toastCheck}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text></View>
      <Text style={s.toastTxt}>{toast}</Text>
    </View>
  );

  return (
    <View style={s.flex}>
      {view === 'hub' ? (
        // ============================ HUB: 4 tarjetas ============================
        <>
          <View style={s.header}>
            <Pressable onPress={() => navigation.goBack()} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
            <Text style={s.logoFallback}>valeria+</Text>
            <Text style={s.headerTitle}>Prescripción de Terapias</Text>
            <Text style={s.headerSub}>Elige un bloque para practicar o prescribir</Text>
            <View style={s.gameRow}>
              <View style={s.gameChip}>
                <Text style={s.gameChipTxt}>🔥 {streak} {streak === 1 ? 'día de racha' : 'días de racha'}</Text>
              </View>
              <View style={s.gameChip}>
                <Text style={s.gameChipTxt}>🏅 Nivel {level} · {levelName(level)}</Text>
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {toastBar}
            <Text style={s.hubLabel}>BLOQUES DE TERAPIA</Text>

            {blockCard({
              icon: '🗣️', accentBg: '#ede4fc', accentFg: '#7c4fd0',
              title: 'Pares Mínimos', sub: 'Dislalias: rotacismo, sigmatismo y más con juego de voz.',
              onPress: () => navigation.navigate('MinimalPairs'),
              a11y: 'Practicar pares mínimos para dislalias',
            })}
            {blockCard({
              icon: '🧩', accentBg: '#d6f5f2', accentFg: V.color.primaryDark,
              title: 'Expansión Semántica', sub: 'Escenarios diarios, progresión léxica y contrastes con acción física.',
              onPress: () => navigation.navigate('SemanticExpansion'),
              a11y: 'Practicar expansión semántica y progresión léxica',
            })}
            {blockCard({
              icon: '👂', accentBg: '#e0edff', accentFg: '#3b6fd4',
              title: 'Audición', sub: 'Inspirado en el protocolo ACOPROS: sonidos, vocabulario, frases y uso social, organizado por edades.',
              onPress: () => { setTab('audicion'); setToast(''); setView('list'); },
              a11y: 'Abrir terapias de audición', total: EXERCISES_AUD.length, activeN: activeAud.filter(Boolean).length,
            })}
            {blockCard({
              icon: '💬', accentBg: '#fff1dc', accentFg: '#d98a1f',
              title: 'Lenguaje', sub: 'Protocolo familiar: atención conjunta, imitación, comprensión y más.',
              onPress: () => { setTab('lenguaje'); setToast(''); setView('list'); },
              a11y: 'Abrir terapias de lenguaje', total: EXERCISES_LEN.length, activeN: activeLen.filter(Boolean).length,
            })}

            <View style={s.remindCard}>
              <View style={s.remindIcon}><Text style={{ fontSize: 17 }}>🔔</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.remindTitle}>Recordatorios de sesión</Text>
                <Text style={s.remindSub}>Hasta 4 avisos al día (9:00, 13:00, 17:00 y 20:00) en la pantalla de bloqueo para no perder la racha.</Text>
              </View>
              <Switch value={reminders} onValueChange={toggleReminders}
                trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff" />
            </View>
          </ScrollView>
        </>
      ) : (
        // ==================== LISTA: audición / lenguaje ====================
        <>
          <View style={s.header}>
            <Pressable onPress={() => { setView('hub'); setToast(''); }} style={s.backPill}><Text style={s.backPillTxt}>‹ Bloques</Text></Pressable>
            <Text style={s.logoFallback}>valeria+</Text>
            <Text style={s.headerTitle}>{isAud ? '👂 Audición' : '💬 Lenguaje'}</Text>
            <Text style={s.headerSub}>{unlocked ? 'Edición profesional habilitada' : 'Modo Familia · solo lectura'}</Text>
            <View style={s.tabs}>
              {(['audicion', 'lenguaje'] as const).map((t) => {
                const on = tab === t;
                const count = t === 'audicion' ? EXERCISES_AUD.length : EXERCISES_LEN.length;
                return (
                  <Pressable key={t} onPress={() => { setTab(t); setToast(''); }} style={[s.tab, on && s.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                    <Text style={[s.tabTxt, { color: on ? V.color.primaryDark : 'rgba(255,255,255,.85)' }]}>{t === 'audicion' ? 'Audición' : 'Lenguaje'}</Text>
                    <View style={[s.tabBadge, { backgroundColor: on ? V.color.primaryLight : 'rgba(255,255,255,.22)' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: on ? V.color.primaryDark : '#fff' }}>{count}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
            {toastBar}

            <ProUnlockPill unlocked={unlocked} onPress={() => setModalOpen(true)} />

            {/* Sesión completa: encadena todos los ejercicios prescritos del
                bloque en un solo plan (los testers veían sesiones muy cortas
                al practicar los ejercicios de uno en uno). */}
            {(() => {
              const prescribedIds = list.filter((_, i) => active[i]).map((it) => it.id);
              return (
                <Pressable
                  onPress={() => prescribedIds.length &&
                    navigation.navigate(usesHearingDevice ? 'LingTest' : 'ExercisePlayer', { ids: prescribedIds })}
                  disabled={!prescribedIds.length}
                  style={[s.sessionBtn, !prescribedIds.length && { opacity: 0.5 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Practicar los ${prescribedIds.length} ejercicios prescritos seguidos`}
                >
                  <Text style={{ fontSize: 17 }}>🎯</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sessionBtnTitle}>Sesión completa</Text>
                    <Text style={s.sessionBtnSub}>Los {prescribedIds.length} ejercicios prescritos seguidos, con pausas de movimiento</Text>
                  </View>
                  <Text style={s.sessionBtnGo}>▶</Text>
                </Pressable>
              );
            })()}

            <View style={s.listHead}>
              <Text style={s.listLabel}>{isAud ? 'PROTOCOLO ACOPROS · AUDICIÓN' : 'PROTOCOLO FAMILIAR · LENGUAJE'}</Text>
              <View style={s.countBadge}><Text style={s.countBadgeTxt}>{activeCount} prescritos</Text></View>
            </View>

            {/* Referencia del bloque: los evaluadores pedían saber en qué se
                basa el "protocolo ACOPROS" sin tener que ir al manual. */}
            {isAud && (
              <View style={s.refCard}>
                <Text style={{ fontSize: 15 }}>ℹ️</Text>
                <Text style={s.refCardTxt}>
                  Actividades inspiradas en los materiales de rehabilitación auditiva de ACOPROS
                  (Asociación Coruñesa de Promoción del Sordo), organizadas en 4 áreas: sonidos,
                  vocabulario, frases y uso social. Las edades son orientativas: empieza por las de
                  la edad de tu peque y deja que el logopeda ajuste la prescripción.
                </Text>
              </View>
            )}

            {(isAud ? AGE_BANDS : [null]).map((band) => {
              const rows = list
                .map((item, i) => ({ item, i }))
                .filter(({ item }) => band == null || item.age === band);
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
                          onPress={() => navigation.navigate(usesHearingDevice ? 'LingTest' : 'ExercisePlayer', { id: item.id })}
                          style={s.playBtn} hitSlop={6} accessibilityRole="button" accessibilityLabel={`Practicar ${item.name}`}>
                          <Text style={{ color: V.color.primaryDark, fontSize: 17 }}>▶</Text>
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
              <View style={{ marginTop: 18 }}>
                <Pressable onPress={save} style={s.primaryBtn}><Text style={s.primaryBtnTxt}>Guardar Prescripción</Text></Pressable>
                <Text style={s.helper}>La selección se guarda en el dispositivo y la edición se bloquea de nuevo.</Text>
              </View>
            ) : (
              <View style={s.lockedHint}>
                <Text style={{ fontSize: 13 }}>🔒</Text>
                <Text style={s.lockedHintTxt}>Modo Familia · solo el logopeda puede modificar la prescripción.</Text>
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* ===== Modal PIN ===== */}
      <ProPinModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUnlock={() => { setModalOpen(false); setUnlocked(true); setToast('Modo profesional desbloqueado.'); }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 16, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  logo: { height: 21, width: 84, resizeMode: 'contain', marginBottom: 8 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 6 },
  backPill: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10 },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },
  gameRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  gameChip: { backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 6 },
  gameChipTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  tabs: { flexDirection: 'row', gap: 4, backgroundColor: 'rgba(255,255,255,.16)', borderRadius: 13, padding: 4, marginTop: 14 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 9, borderRadius: 10 },
  tabOn: { backgroundColor: '#fff' },
  tabTxt: { fontSize: 14, fontWeight: '800' },
  tabBadge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8 },

  scroll: { padding: 18, paddingBottom: 32 },
  hubLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.5, marginBottom: 12, marginHorizontal: 2 },
  blockCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 15, marginBottom: 11, ...V.shadow.card },
  blockIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  blockTitle: { fontSize: 16, fontWeight: '800', color: V.color.textPrimary },
  blockSub: { fontSize: 12, fontWeight: '600', color: V.color.textMuted, marginTop: 3, lineHeight: 16 },
  blockMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  blockBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  blockBadgeTxt: { fontSize: 11, fontWeight: '800' },
  blockActive: { fontSize: 11.5, fontWeight: '700', color: V.color.textMuted },
  blockChev: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginBottom: 14 },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastTxt: { color: V.color.textPrimary, fontSize: 13.5, fontWeight: '700', flex: 1 },

  remindCard: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 14, padding: 13, marginTop: 10, ...V.shadow.card },
  remindIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fffbeb', alignItems: 'center', justifyContent: 'center' },
  remindTitle: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },
  remindSub: { fontSize: 11.5, fontWeight: '600', color: V.color.textMuted, marginTop: 2, lineHeight: 15 },

  sessionBtn: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: V.color.primary, borderRadius: 16, padding: 14, marginTop: 14, ...V.shadow.button },
  sessionBtnTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  sessionBtnSub: { color: 'rgba(255,255,255,.9)', fontSize: 11.5, fontWeight: '600', marginTop: 2 },
  sessionBtnGo: { color: '#fff', fontSize: 16, fontWeight: '800' },

  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16, marginHorizontal: 4 },
  listLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.4 },
  countBadge: { backgroundColor: V.color.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  countBadgeTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderRadius: 15, padding: 12, marginBottom: 9, ...V.shadow.card },
  codeChip: { minWidth: 42, height: 30, paddingHorizontal: 8, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  codeChipTxt: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  rowName: { fontSize: 14.5, fontWeight: '800', color: V.color.textPrimary },
  rowCat: { fontSize: 11.5, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  // 48×48 + hitSlop: tamaño mínimo accesible para personas con movilidad
  // reducida (los evaluadores señalaron que el botón anterior era muy pequeño).
  playBtn: { width: 48, height: 48, borderRadius: 15, backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, alignItems: 'center', justifyContent: 'center' },

  refCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, backgroundColor: '#eef6ff', borderWidth: 1, borderColor: '#d3e5fb', borderRadius: 13, padding: 12, marginBottom: 14 },
  refCardTxt: { flex: 1, fontSize: 11.5, fontWeight: '600', color: '#2c5382', lineHeight: 16 },

  ageHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 10, marginBottom: 9, marginHorizontal: 2 },
  ageHeadTxt: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.5, color: V.color.primaryDark },
  ageHeadLine: { flex: 1, height: 1, backgroundColor: V.color.borderActive },

  primaryBtn: { backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  helper: { textAlign: 'center', color: V.color.textMuted, fontSize: 11.5, marginTop: 11, fontWeight: '600', paddingHorizontal: 14 },
  lockedHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18, paddingHorizontal: 18 },
  lockedHintTxt: { color: V.color.textMuted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});

export default ValeriaExerciseSelectionScreen;

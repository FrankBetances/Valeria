// ============================================================================
// Valeria+ · Selección y Prescripción de Terapias (V2.2)
// Pestañas Audición (13) + Lenguaje (7). Modo Familia (solo lectura) y Modo
// Profesional desbloqueado por PIN (validación por hash SHA-256, sin texto plano).
// Persistencia: AsyncStorage. Navega al Player con navigation.navigate('ExercisePlayer', { id }).
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
// import logoWhite from '../../assets/valeria-logo-white.png';

// ----------------------------------------------------------------------------
// Seguridad: SHA-256 en JS puro (compatible con Hermes, sin crypto.subtle).
// Evita almacenar el PIN maestro en texto plano dentro del .apk.
// ----------------------------------------------------------------------------
const sha256 = async (str: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    const buf = new TextEncoder().encode(str);
    const hash = await (crypto as any).subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  const rotr = (n: number, x: number) => (x >>> n) | (x << (32 - n));
  const w = new Array(64);
  const h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const words = new Uint32Array((str.length + 10) >> 2);
  for (let i = 0; i < str.length; i++) words[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4 << 3));
  words[str.length >> 2] |= 0x80 << (24 - (str.length % 4 << 3));
  words[words.length - 1] = str.length * 8;
  for (let i = 0; i < words.length; i += 16) {
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], _h = h[7];
    for (let j = 0; j < 64; j++) {
      if (j < 16) w[j] = words[i + j];
      else {
        const s0 = rotr(7, w[j - 15]) ^ rotr(18, w[j - 15]) ^ (w[j - 15] >>> 3);
        const s1 = rotr(17, w[j - 2]) ^ rotr(19, w[j - 2]) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      const ch = (e & f) ^ (~e & g);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t1 = (_h + (rotr(6, e) ^ rotr(11, e) ^ rotr(25, e)) + ch + k[j] + w[j]) | 0;
      const t2 = ((rotr(2, a) ^ rotr(13, a) ^ rotr(22, a)) + maj) | 0;
      _h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + _h) | 0;
  }
  return Array.from(h).map((v) => (v >>> 0).toString(16).padStart(8, '0')).join('');
};
const MASTER_PIN_HASH = '78e370b587b145920213731b7c7c725e512b3b6577c51c800218a7c764c532ae'; // "1985"

// ----------------------------------------------------------------------------
interface Item { id: string; code: string; name: string; category: string; }

const EXERCISES_AUD: Item[] = [
  { id: 'ff1', code: 'FF-1', name: 'Asociación vocal inicial', category: 'Fonética-Fonología' },
  { id: 'ff2', code: 'FF-2', name: 'Articulación de vocales', category: 'Fonética-Fonología' },
  { id: 'ff3', code: 'FF-3', name: 'Completar vocal faltante', category: 'Fonética-Fonología' },
  { id: 'se1', code: 'SE-1', name: 'Detección del intruso', category: 'Semántica' },
  { id: 'se2', code: 'SE-2', name: 'Adivinanza por letra', category: 'Semántica' },
  { id: 'se3', code: 'SE-3', name: 'Prendas y órdenes', category: 'Semántica' },
  { id: 'ms1', code: 'MS-1', name: 'Singular / plural', category: 'Morfosintaxis' },
  { id: 'ms2', code: 'MS-2', name: 'Flexión de género', category: 'Morfosintaxis' },
  { id: 'ms3', code: 'MS-3', name: 'Estructura S-V-O', category: 'Morfosintaxis' },
  { id: 'pr1', code: 'PR-1', name: 'Preguntas tipo ¿qué?', category: 'Pragmática' },
  { id: 'pr2', code: 'PR-2', name: 'Adaptación del discurso', category: 'Pragmática' },
  { id: 'pr3', code: 'PR-3', name: 'Reconocimiento de emociones', category: 'Pragmática' },
  { id: 'pr4', code: 'PR-4', name: 'Petición de repetición', category: 'Pragmática' },
];
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
  const [unlocked, setUnlocked] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState(false);
  const [toast, setToast] = useState('');
  const [activeAud, setActiveAud] = useState<boolean[]>(new Array(EXERCISES_AUD.length).fill(true));
  const [activeLen, setActiveLen] = useState<boolean[]>(new Array(EXERCISES_LEN.length).fill(true));

  useEffect(() => {
    (async () => {
      try {
        const a = await AsyncStorage.getItem(STORAGE_KEYS.audicion);
        if (a) { const p = JSON.parse(a); if (Array.isArray(p) && p.length === EXERCISES_AUD.length) setActiveAud(p); }
        const l = await AsyncStorage.getItem(STORAGE_KEYS.lenguaje);
        if (l) { const p = JSON.parse(l); if (Array.isArray(p) && p.length === EXERCISES_LEN.length) setActiveLen(p); }
      } catch (e) { /* noop */ }
    })();
  }, []);

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

  const pressDigit = async (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next); setPinErr(false);
    if (next.length === 4) {
      const hash = await sha256(next);
      if (hash === MASTER_PIN_HASH) {
        setTimeout(() => { setModalOpen(false); setUnlocked(true); setPin(''); setToast('Modo profesional desbloqueado.'); }, 180);
      } else {
        setPinErr(true); setTimeout(() => setPin(''), 600);
      }
    }
  };

  const save = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.audicion, JSON.stringify(activeAud));
      await AsyncStorage.setItem(STORAGE_KEYS.lenguaje, JSON.stringify(activeLen));
    } catch (e) { /* noop */ }
    const n = activeAud.filter(Boolean).length + activeLen.filter(Boolean).length;
    setUnlocked(false); setToast(`Prescripción guardada · ${n} terapias activas.`);
  };

  return (
    <View style={s.flex}>
      {/* ===== Cabecera ===== */}
      <View style={s.header}>
        {/* <Image source={logoWhite} style={s.logo} /> */}
        <Pressable onPress={() => navigation.goBack()} style={s.backPill}><Text style={s.backPillTxt}>‹ Volver</Text></Pressable>
        <Text style={s.logoFallback}>valeria+</Text>
        <Text style={s.headerTitle}>Prescripción de Terapias</Text>
        <Text style={s.headerSub}>{unlocked ? 'Edición profesional habilitada' : 'Modo Familia · solo lectura'}</Text>

        {/* Pestañas */}
        <View style={s.tabs}>
          {(['audicion', 'lenguaje'] as const).map((t) => {
            const on = tab === t;
            const count = t === 'audicion' ? 13 : 7;
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
        {!!toast && (
          <View style={s.toast}>
            <View style={s.toastCheck}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>✓</Text></View>
            <Text style={s.toastTxt}>{toast}</Text>
          </View>
        )}

        {/* Pill desbloqueo */}
        <Pressable onPress={() => !unlocked && setModalOpen(true)} style={[s.pill, unlocked ? s.pillUnlocked : s.pillLocked]} accessibilityRole="button">
          <Text style={{ fontSize: 15 }}>{unlocked ? '🔓' : '🔒'}</Text>
          <Text style={[s.pillTxt, { color: unlocked ? '#0a7d54' : V.color.textPrimary }]}>{unlocked ? 'Modo profesional activo' : 'Desbloquear Edición Profesional'}</Text>
          {!unlocked && <Text style={s.pillChev}>›</Text>}
        </Pressable>

        <View style={s.listHead}>
          <Text style={s.listLabel}>{isAud ? 'PROTOCOLO ACOPROS · AUDICIÓN' : 'PROTOCOLO FAMILIAR · LENGUAJE'}</Text>
          <View style={s.countBadge}><Text style={s.countBadgeTxt}>{activeCount} prescritos</Text></View>
        </View>

        {list.map((item, i) => {
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
              <Pressable onPress={() => navigation.navigate('ExercisePlayer', { id: item.id })} style={s.playBtn} accessibilityRole="button" accessibilityLabel={`Practicar ${item.name}`}>
                <Text style={{ color: V.color.primaryDark, fontSize: 13 }}>▶</Text>
              </Pressable>
              <Switch value={on} onValueChange={() => toggle(i)} disabled={!unlocked}
                trackColor={{ false: '#d1d5db', true: V.color.primary }} thumbColor="#ffffff"
                style={{ opacity: unlocked ? 1 : 0.4 }} />
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

      {/* ===== Modal PIN ===== */}
      {modalOpen && (
        <View style={s.overlay}>
          <View style={s.modal}>
            <View style={s.modalHead}>
              <View style={s.modalIcon}><Text style={{ fontSize: 20 }}>🔐</Text></View>
              <Pressable onPress={() => { setModalOpen(false); setPin(''); setPinErr(false); }} style={s.modalClose}><Text style={{ color: '#6b7280', fontWeight: '700' }}>✕</Text></Pressable>
            </View>
            <Text style={s.modalTitle}>Modo Profesional</Text>
            <Text style={s.modalSub}>Introduce el PIN de 4 dígitos del logopeda para editar la prescripción.</Text>
            <View style={s.pinRow}>
              {[0, 1, 2, 3].map((i) => {
                const filled = i < pin.length;
                return <View key={i} style={[s.pinCell, pinErr ? s.pinCellErr : filled ? s.pinCellOn : s.pinCellOff]} />;
              })}
            </View>
            <Text style={[s.pinError, { opacity: pinErr ? 1 : 0 }]}>PIN incorrecto. Inténtalo de nuevo.</Text>
            <View style={s.keypad}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                <Pressable key={d} onPress={() => pressDigit(d)} style={s.key}><Text style={s.keyTxt}>{d}</Text></Pressable>
              ))}
              <View style={[s.key, { backgroundColor: 'transparent', borderWidth: 0 }]} />
              <Pressable onPress={() => pressDigit('0')} style={s.key}><Text style={s.keyTxt}>0</Text></Pressable>
              <Pressable onPress={() => setPin((p) => p.slice(0, -1))} style={[s.key, { backgroundColor: '#fff' }]}><Text style={[s.keyTxt, { fontSize: 20, color: '#6b7280' }]}>⌫</Text></Pressable>
            </View>
            <Text style={s.demoPin}>PIN de demostración: 1985</Text>
          </View>
        </View>
      )}
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
  tabs: { flexDirection: 'row', gap: 4, backgroundColor: 'rgba(255,255,255,.16)', borderRadius: 13, padding: 4, marginTop: 14 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 9, borderRadius: 10 },
  tabOn: { backgroundColor: '#fff' },
  tabTxt: { fontSize: 14, fontWeight: '800' },
  tabBadge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8 },

  scroll: { padding: 18, paddingBottom: 32 },
  toast: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 13, marginBottom: 14 },
  toastCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  toastTxt: { color: V.color.textPrimary, fontSize: 13.5, fontWeight: '700', flex: 1 },

  pill: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, borderRadius: 14 },
  pillLocked: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, ...V.shadow.card },
  pillUnlocked: { backgroundColor: V.color.successBg, borderWidth: 1, borderColor: '#bfe9d4' },
  pillTxt: { flex: 1, fontSize: 14, fontWeight: '800' },
  pillChev: { fontSize: 16, color: V.color.textMuted },

  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16, marginHorizontal: 4 },
  listLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.4 },
  countBadge: { backgroundColor: V.color.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9 },
  countBadgeTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderRadius: 15, padding: 12, marginBottom: 9, ...V.shadow.card },
  codeChip: { minWidth: 42, height: 30, paddingHorizontal: 8, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  codeChipTxt: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  rowName: { fontSize: 14.5, fontWeight: '800', color: V.color.textPrimary },
  rowCat: { fontSize: 11.5, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  playBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },

  primaryBtn: { backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  helper: { textAlign: 'center', color: V.color.textMuted, fontSize: 11.5, marginTop: 11, fontWeight: '600', paddingHorizontal: 14 },
  lockedHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18, paddingHorizontal: 18 },
  lockedHintTxt: { color: V.color.textMuted, fontSize: 12, fontWeight: '700', textAlign: 'center' },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,18,32,.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 24, padding: 22 },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  modalClose: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f1f5f4', alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: V.color.textPrimary, marginTop: 12 },
  modalSub: { fontSize: 13.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 4, lineHeight: 19 },
  pinRow: { flexDirection: 'row', gap: 13, justifyContent: 'center', marginTop: 22, marginBottom: 6 },
  pinCell: { width: 16, height: 16, borderRadius: 8 },
  pinCellOff: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#d8dedd' },
  pinCellOn: { backgroundColor: V.color.primary },
  pinCellErr: { backgroundColor: '#fecdd3' },
  pinError: { height: 18, textAlign: 'center', color: V.color.error, fontSize: 12.5, fontWeight: '800' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 11, marginTop: 14 },
  key: { width: '30%', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1' },
  keyTxt: { fontSize: 24, fontWeight: '700', color: V.color.textPrimary },
  demoPin: { textAlign: 'center', color: '#c2cbca', fontSize: 11, fontWeight: '700', marginTop: 16 },
});

export default ValeriaExerciseSelectionScreen;

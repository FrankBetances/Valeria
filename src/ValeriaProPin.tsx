// ============================================================================
// Valeria+ · PIN Profesional compartido (V1.0)
// Píldora "Desbloquear Edición Profesional" + modal de PIN con teclado numérico.
// Un único lugar para la validación (hash SHA-256, sin texto plano) que usan
// Prescripción de Terapias, Pares Mínimos y Expansión Semántica.
// ============================================================================
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';

// ----------------------------------------------------------------------------
// Seguridad: SHA-256 en JS puro (compatible con Hermes, sin crypto.subtle).
// Evita almacenar el PIN maestro en texto plano dentro del .apk.
// ----------------------------------------------------------------------------
export const sha256 = async (str: string): Promise<string> => {
  // Si el entorno trae WebCrypto se usa; si el polyfill está roto o incompleto
  // (p. ej. subtle sin digest), se cae al cálculo en JS puro en vez de dejar
  // la promesa rechazada (dejaba el modal del PIN bloqueado con 4 puntos).
  try {
    if (typeof crypto !== 'undefined' && (crypto as any).subtle?.digest && typeof TextEncoder !== 'undefined') {
      const buf = new TextEncoder().encode(str);
      const hash = await (crypto as any).subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) { /* WebCrypto no disponible: seguir con la implementación JS */ }
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
  // El mensaje con padding debe ocupar bloques completos de 16 palabras (64 bytes):
  // datos + byte 0x80 + longitud en bits en la última palabra del último bloque.
  const words = new Uint32Array((((str.length + 8) >> 6) + 1) * 16);
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
export const MASTER_PIN_HASH = '78e370b587b145920213731b7c7c725e512b3b6577c51c800218a7c764c532ae'; // "1985"

// ----------------------------------------------------------------------------
// Píldora de estado: bloqueado (abre el modal) / modo profesional activo.
// ----------------------------------------------------------------------------
export const ProUnlockPill: React.FC<{ unlocked: boolean; onPress: () => void }> = ({ unlocked, onPress }) => (
  <Pressable onPress={() => !unlocked && onPress()} style={[s.pill, unlocked ? s.pillUnlocked : s.pillLocked]} accessibilityRole="button">
    <Text style={{ fontSize: 15 }}>{unlocked ? '🔓' : '🔒'}</Text>
    <Text style={[s.pillTxt, { color: unlocked ? '#0a7d54' : V.color.textPrimary }]}>{unlocked ? 'Modo profesional activo' : 'Desbloquear Edición Profesional'}</Text>
    {!unlocked && <Text style={s.pillChev}>›</Text>}
  </Pressable>
);

// ----------------------------------------------------------------------------
// Modal de PIN de 4 dígitos. Gestiona su propio estado de tecleo y error;
// al acertar llama a onUnlock y se limpia para la próxima apertura.
// ----------------------------------------------------------------------------
export const ProPinModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onUnlock: () => void;
  subtitle?: string;
}> = ({ open, onClose, onUnlock, subtitle }) => {
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState(false);

  if (!open) return null;

  const close = () => { setPin(''); setPinErr(false); onClose(); };

  const pressDigit = async (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next); setPinErr(false);
    if (next.length === 4) {
      // Nunca dejar el teclado bloqueado: cualquier fallo del hash se trata
      // como PIN incorrecto y se limpia para poder reintentar.
      let ok = false;
      try { ok = (await sha256(next)) === MASTER_PIN_HASH; } catch (e) { ok = false; }
      if (ok) {
        setTimeout(() => { setPin(''); setPinErr(false); onUnlock(); }, 180);
      } else {
        setPinErr(true); setTimeout(() => setPin(''), 600);
      }
    }
  };

  return (
    <View style={s.overlay}>
      {/* En pantallas bajas el teclado desbordaba el modal y el 0/⌫ quedaban
          fuera de alcance: altura acotada + scroll interno. */}
      <View style={s.modal}>
        <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.modalHead}>
          <View style={s.modalIcon}><Text style={{ fontSize: 20 }}>🔐</Text></View>
          <Pressable onPress={close} style={s.modalClose}><Text style={{ color: '#6b7280', fontWeight: '700' }}>✕</Text></Pressable>
        </View>
        <Text style={s.modalTitle}>Modo Profesional</Text>
        <Text style={s.modalSub}>{subtitle ?? 'Introduce el PIN de 4 dígitos del logopeda para editar la prescripción.'}</Text>
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
        </ScrollView>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 13, borderRadius: 14 },
  pillLocked: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, ...V.shadow.card },
  pillUnlocked: { backgroundColor: V.color.successBg, borderWidth: 1, borderColor: '#bfe9d4' },
  pillTxt: { flex: 1, fontSize: 14, fontWeight: '800' },
  pillChev: { fontSize: 16, color: V.color.textMuted },

  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11,18,32,.55)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 20 },
  modal: { width: '100%', maxWidth: 320, maxHeight: '92%', backgroundColor: '#fff', borderRadius: 24, padding: 22 },
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

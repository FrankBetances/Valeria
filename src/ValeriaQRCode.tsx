// ============================================================================
// Valeria+ · QR del resumen para el profesional
// react-native-qrcode-svg (MIT) sobre `qrcode` (MIT): todas las versiones QR,
// así que el resumen real (~150 bytes) cabe. El codificador propio anterior se
// paraba en la v6 (106 bytes) y el QR no salía (bug del 8/11/2026).
// Nivel M, margen de 4 módulos y negro sobre blanco para cámaras móviles.
// ============================================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { V } from './valeriaTheme';
import { FONT } from './ui/fonts';

export const ValeriaQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 220 }) => {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    return (
      <View style={[s.fallback, { width: size, height: size }]}>
        <Text style={s.fallbackTxt}>Resumen demasiado largo para el QR</Text>
      </View>
    );
  }
  return (
    <View style={s.wrap}>
      <QRCode
        value={value}
        size={size}
        ecl="M"
        quietZone={16}
        color="#000000"
        backgroundColor="#ffffff"
        onError={() => setFailed(true)}
      />
    </View>
  );
};

const s = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', alignSelf: 'center' },
  fallback: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: V.color.border, alignItems: 'center', justifyContent: 'center', padding: 16 },
  fallbackTxt: { fontFamily: FONT.bodyBlack, color: V.color.textMuted, fontSize: 12, textAlign: 'center' },
});

export default ValeriaQRCode;

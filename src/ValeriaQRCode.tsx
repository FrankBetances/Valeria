// ============================================================================
// Valeria+ · Render de QR con react-native-svg — V1.0
// Pinta la matriz booleana de valeriaQR (modo byte, nivel M) como rectángulos
// SVG. Un solo <Rect> negro por módulo activo sobre fondo blanco con "quiet
// zone" de 4 módulos, para máxima legibilidad por cámaras móviles.
// ============================================================================
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';
import { encodeQR } from './valeriaQR';
import { V } from './valeriaTheme';

export const ValeriaQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 220 }) => {
  const qr = useMemo(() => {
    try { return encodeQR(value); } catch (e) { return null; }
  }, [value]);

  if (!qr) {
    return (
      <View style={[s.fallback, { width: size, height: size }]}>
        <Text style={s.fallbackTxt}>Resumen demasiado largo para el QR</Text>
      </View>
    );
  }

  const quiet = 4;                       // "quiet zone" obligatoria (módulos)
  const dim = qr.size + quiet * 2;       // módulos totales con margen
  const cell = size / dim;

  // Un único <Path> con todos los módulos activos: mucho más ligero que N rects.
  let d = '';
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.modules[r][c]) {
        const x = (c + quiet) * cell, y = (r + quiet) * cell;
        d += `M${x.toFixed(2)} ${y.toFixed(2)}h${cell.toFixed(2)}v${cell.toFixed(2)}h${(-cell).toFixed(2)}z`;
      }
    }
  }

  return (
    <View style={[s.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect x={0} y={0} width={size} height={size} fill="#ffffff" />
        <Path d={d} fill="#0b1220" />
      </Svg>
    </View>
  );
};

const s = StyleSheet.create({
  wrap: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', alignSelf: 'center' },
  fallback: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: V.color.border, alignItems: 'center', justifyContent: 'center', padding: 16 },
  fallbackTxt: { color: V.color.textMuted, fontSize: 12, fontWeight: '700', textAlign: 'center' },
});

export default ValeriaQRCode;

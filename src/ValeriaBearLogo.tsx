// ============================================================================
// Valeria+ · Mascota / marca del oso (V2)
// Componentes reutilizables construidos con react-native-svg:
//   <BearMark />      → solo el oso (orejas, cabeza, ojos, hocico).
//   <AppIconTile />   → oso dentro del squircle turquesa (icono de la app).
//
// Variantes: 'brown' (oso pardo, por defecto en marca), 'white' y 'teal'.
// Dependencia:  npx expo install react-native-svg   (o npm i react-native-svg)
// ============================================================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Ellipse, Rect } from 'react-native-svg';
import { V } from './valeriaTheme';

type BearVariant = 'brown' | 'white' | 'teal';

interface BearPalette {
  body: string;
  innerEar: string;
  muzzle: string;
  features: string;      // ojos + nariz
  cheeks?: string;       // rubor opcional
  highlight?: string;    // brillo de los ojos
}

// Paleta del oso pardo: marrón cálido con hocico crema y rubor suave.
export const BEAR_BROWN: BearPalette = {
  body: '#a9744f',
  innerEar: '#f3ddba',
  muzzle: '#f6e8d2',
  features: '#3d2a1a',
  cheeks: '#e2987377',
  highlight: '#ffffff',
};

const palette = (variant: BearVariant, eyeColor?: string): BearPalette => {
  switch (variant) {
    case 'brown':
      return BEAR_BROWN;
    case 'teal':
      return { body: V.color.primary, innerEar: '#ffffff', muzzle: 'rgba(255,255,255,0.85)', features: '#ffffff' };
    case 'white':
    default:
      return {
        body: '#ffffff', innerEar: '#bff0ed', muzzle: V.color.primaryLight,
        features: eyeColor ?? V.color.dark, highlight: '#ffffff',
      };
  }
};

interface BearMarkProps {
  size?: number;
  variant?: BearVariant;          // 'brown' = oso pardo (marca), 'white' = sobre turquesa
  eyeColor?: string;
}

/** El oso, sin fondo. Dibuja en un viewBox 200×200. */
export const BearMark: React.FC<BearMarkProps> = ({ size = 120, variant = 'brown', eyeColor }) => {
  const p = palette(variant, eyeColor);
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* orejas */}
      <Circle cx={74} cy={74} r={37} fill={p.body} />
      <Circle cx={126} cy={74} r={37} fill={p.body} />
      <Circle cx={74} cy={78} r={17} fill={p.innerEar} />
      <Circle cx={126} cy={78} r={17} fill={p.innerEar} />
      {/* cabeza */}
      <Ellipse cx={100} cy={118} rx={83} ry={75} fill={p.body} />
      {/* rubor */}
      {p.cheeks ? (
        <>
          <Ellipse cx={54} cy={136} rx={12} ry={8} fill={p.cheeks} />
          <Ellipse cx={146} cy={136} rx={12} ry={8} fill={p.cheeks} />
        </>
      ) : null}
      {/* ojos */}
      <Ellipse cx={84} cy={108} rx={9.5} ry={11.5} fill={p.features} />
      <Ellipse cx={116} cy={108} rx={9.5} ry={11.5} fill={p.features} />
      {p.highlight ? (
        <>
          <Circle cx={81} cy={104} r={3} fill={p.highlight} />
          <Circle cx={113} cy={104} r={3} fill={p.highlight} />
        </>
      ) : null}
      {/* hocico */}
      <Ellipse cx={100} cy={142} rx={35} ry={25} fill={p.muzzle} />
      <Ellipse cx={100} cy={128} rx={10} ry={7} fill={p.features} />
    </Svg>
  );
};

interface AppIconTileProps {
  size?: number;
  radius?: number;                // radio del squircle (≈ 22.5% para iOS)
}

/** Icono de la app: oso pardo sobre squircle turquesa con brillo superior. */
export const AppIconTile: React.FC<AppIconTileProps> = ({ size = 120, radius }) => {
  const r = radius ?? Math.round(size * 0.225);
  const p = BEAR_BROWN;
  return (
    <View style={[styles.tileShadow, { width: size, height: size, borderRadius: r }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="valTeal" x1="0" y1="0" x2="0.6" y2="1">
            <Stop offset="0" stopColor="#16d3cc" />
            <Stop offset="0.55" stopColor={V.color.primary} />
            <Stop offset="1" stopColor="#00a8a2" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={200} height={200} rx={r * (200 / size)} fill="url(#valTeal)" />
        {/* brillo superior sutil */}
        <Circle cx={64} cy={56} r={92} fill="rgba(255,255,255,0.16)" />
        {/* oso (re-encajado dentro del tile) */}
        <Circle cx={74} cy={84} r={31} fill={p.body} />
        <Circle cx={126} cy={84} r={31} fill={p.body} />
        <Circle cx={74} cy={87} r={14} fill={p.innerEar} />
        <Circle cx={126} cy={87} r={14} fill={p.innerEar} />
        <Ellipse cx={100} cy={120} rx={68} ry={62} fill={p.body} />
        <Ellipse cx={62} cy={135} rx={10} ry={7} fill={p.cheeks} />
        <Ellipse cx={138} cy={135} rx={10} ry={7} fill={p.cheeks} />
        <Ellipse cx={87} cy={112} rx={8} ry={10} fill={p.features} />
        <Ellipse cx={113} cy={112} rx={8} ry={10} fill={p.features} />
        <Circle cx={84.5} cy={108.5} r={2.6} fill="#ffffff" />
        <Circle cx={110.5} cy={108.5} r={2.6} fill="#ffffff" />
        <Ellipse cx={100} cy={140} rx={28} ry={20} fill={p.muzzle} />
        <Ellipse cx={100} cy={128} rx={8} ry={6} fill={p.features} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  tileShadow: {
    overflow: 'hidden',
    shadowColor: 'rgba(0,150,144,0.34)',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 1,
    shadowRadius: 26,
    elevation: 8,
  },
});

export default BearMark;

// ============================================================================
// Valeria+ · Mascota / marca del oso (V1)
// Componentes reutilizables construidos con react-native-svg:
//   <BearMark />      → solo el oso (orejas, cabeza, ojos, hocico).
//   <AppIconTile />   → oso dentro del squircle turquesa (icono de la app).
//
// Dependencia:  npx expo install react-native-svg   (o npm i react-native-svg)
// ============================================================================
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Circle, Ellipse, Rect } from 'react-native-svg';
import { V } from './valeriaTheme';

type BearVariant = 'white' | 'teal';

interface BearMarkProps {
  size?: number;
  variant?: BearVariant;          // 'white' = oso blanco (sobre fondo turquesa)
  eyeColor?: string;
}

/** El oso, sin fondo. Dibuja en un viewBox 200×200. */
export const BearMark: React.FC<BearMarkProps> = ({ size = 120, variant = 'white', eyeColor = V.color.dark }) => {
  const body = variant === 'white' ? '#ffffff' : V.color.primary;
  const innerEar = variant === 'white' ? '#bff0ed' : '#ffffff';
  const muzzle = variant === 'white' ? V.color.primaryLight : 'rgba(255,255,255,0.85)';
  const eyes = variant === 'white' ? eyeColor : '#ffffff';
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* orejas */}
      <Circle cx={74} cy={74} r={37} fill={body} />
      <Circle cx={126} cy={74} r={37} fill={body} />
      <Circle cx={74} cy={78} r={17} fill={innerEar} />
      <Circle cx={126} cy={78} r={17} fill={innerEar} />
      {/* cabeza */}
      <Ellipse cx={100} cy={118} rx={83} ry={75} fill={body} />
      {/* ojos */}
      <Ellipse cx={84} cy={108} rx={9.5} ry={11.5} fill={eyes} />
      <Ellipse cx={116} cy={108} rx={9.5} ry={11.5} fill={eyes} />
      {/* hocico */}
      <Ellipse cx={100} cy={142} rx={35} ry={25} fill={muzzle} />
      <Ellipse cx={100} cy={128} rx={10} ry={7} fill={eyes} />
    </Svg>
  );
};

interface AppIconTileProps {
  size?: number;
  radius?: number;                // radio del squircle (≈ 22.5% para iOS)
}

/** Icono de la app: oso blanco sobre squircle turquesa con brillo superior. */
export const AppIconTile: React.FC<AppIconTileProps> = ({ size = 120, radius }) => {
  const r = radius ?? Math.round(size * 0.225);
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
        <Circle cx={74} cy={84} r={31} fill="#fff" />
        <Circle cx={126} cy={84} r={31} fill="#fff" />
        <Circle cx={74} cy={87} r={14} fill="#bff0ed" />
        <Circle cx={126} cy={87} r={14} fill="#bff0ed" />
        <Ellipse cx={100} cy={120} rx={68} ry={62} fill="#fff" />
        <Ellipse cx={87} cy={112} rx={8} ry={10} fill={V.color.dark} />
        <Ellipse cx={113} cy={112} rx={8} ry={10} fill={V.color.dark} />
        <Ellipse cx={100} cy={140} rx={28} ry={20} fill={V.color.primaryLight} />
        <Ellipse cx={100} cy={128} rx={8} ry={6} fill={V.color.dark} />
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

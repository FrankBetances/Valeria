// ============================================================================
// Valeria+ · Academy — Configuraciones de mano de la LSE (dibujo, no vídeo)
//
// LO QUE ESTE MÓDULO PUEDE Y NO PUEDE HACER
//
// Un signo de la Lengua de Signos Española no es un dibujo: es la combinación
// de CUATRO parámetros —configuración de la mano, lugar de articulación,
// orientación y MOVIMIENTO— más los componentes no manuales (expresión facial,
// mirada). Un dibujo estático captura los tres primeros y no captura el cuarto.
//
// Por eso este banco dibuja lo único que es honesto dibujar: las
// CONFIGURACIONES de mano del alfabeto dactilológico, que en su mayoría son
// posturas fijas. Los signos con movimiento se describen en texto y se remiten
// a fuente signada; el módulo lo dice en voz alta en vez de fingir que una
// silueta enseña un signo.
//
// Las siluetas siguen el mismo criterio visual que ValeriaPictograms: sin
// fondo, contorno grueso, color plano, alto contraste.
// ============================================================================
import React from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

const INK = '#1f2937';
const PIEL = '#fde3c0';

type Fig = React.FC<{ size: number }>;

const marco = (children: React.ReactNode): Fig => {
  const F: Fig = ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">{children}</Svg>
  );
  return F;
};

// --- A · puño cerrado con el pulgar al lado ---------------------------------
const ManoA = marco(
  <>
    <Rect x={30} y={44} width={40} height={44} rx={14} fill={PIEL} stroke={INK} strokeWidth={5} />
    {/* nudillos: cuatro dedos plegados */}
    <Line x1={36} y1={54} x2={64} y2={54} stroke={INK} strokeWidth={3} opacity={0.45} />
    <Line x1={36} y1={64} x2={64} y2={64} stroke={INK} strokeWidth={3} opacity={0.45} />
    {/* pulgar pegado al costado, hacia arriba */}
    <Path d="M28 70 q-10 -6 -6 -18 q3 -8 10 -4" fill={PIEL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </>,
);

// --- B · mano plana, dedos juntos y extendidos, pulgar cruzado --------------
const ManoB = marco(
  <>
    <Rect x={32} y={16} width={38} height={58} rx={12} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Line x1={41} y1={20} x2={41} y2={54} stroke={INK} strokeWidth={2.5} opacity={0.45} />
    <Line x1={51} y1={18} x2={51} y2={54} stroke={INK} strokeWidth={2.5} opacity={0.45} />
    <Line x1={61} y1={20} x2={61} y2={54} stroke={INK} strokeWidth={2.5} opacity={0.45} />
    {/* pulgar cruzado sobre la palma */}
    <Path d="M32 62 q-12 2 -12 12 q0 8 10 8 L44 82" fill={PIEL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Rect x={30} y={70} width={40} height={20} rx={9} fill={PIEL} stroke={INK} strokeWidth={5} />
  </>,
);

// --- C · mano curvada en forma de C -----------------------------------------
const ManoC = marco(
  <>
    <Path d="M74 24 q-34 -10 -46 16 q-12 26 12 42 q18 12 34 2" fill="none" stroke={PIEL} strokeWidth={26} strokeLinecap="round" />
    <Path d="M74 24 q-34 -10 -46 16 q-12 26 12 42 q18 12 34 2" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
  </>,
);

// --- L · índice arriba y pulgar en ángulo recto -----------------------------
const ManoL = marco(
  <>
    <Rect x={40} y={54} width={32} height={36} rx={12} fill={PIEL} stroke={INK} strokeWidth={5} />
    {/* índice extendido hacia arriba */}
    <Rect x={42} y={12} width={16} height={46} rx={8} fill={PIEL} stroke={INK} strokeWidth={5} />
    {/* pulgar extendido hacia el lado */}
    <Rect x={8} y={60} width={38} height={15} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
  </>,
);

// --- O · dedos y pulgar formando un círculo ---------------------------------
const ManoO = marco(
  <>
    <Circle cx={50} cy={50} r={30} fill="none" stroke={PIEL} strokeWidth={20} />
    <Circle cx={50} cy={50} r={40} fill="none" stroke={INK} strokeWidth={5} />
    <Circle cx={50} cy={50} r={20} fill="none" stroke={INK} strokeWidth={5} />
  </>,
);

// --- V · índice y corazón extendidos y separados ----------------------------
const ManoV = marco(
  <>
    <Rect x={34} y={54} width={36} height={36} rx={13} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Rect x={30} y={12} width={15} height={48} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} transform="rotate(-12 37 36)" />
    <Rect x={56} y={12} width={15} height={48} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} transform="rotate(12 63 36)" />
  </>,
);

// --- Índice señalando (base de muchos signos deícticos) ---------------------
const ManoIndice = marco(
  <>
    <Rect x={38} y={50} width={34} height={40} rx={13} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Rect x={46} y={10} width={16} height={46} rx={8} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Path d="M36 66 q-12 2 -12 12" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </>,
);

// --- Mano plana con la palma hacia arriba (base de «gracias», «por favor») --
const ManoPlanaArriba = marco(
  <>
    <Ellipse cx={50} cy={62} rx={34} ry={20} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Path d="M20 56 L14 40 M32 50 L28 32 M50 48 L50 28 M68 50 L72 32" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
  </>,
);

// --- Dos manos que se juntan (base de «más») --------------------------------
const DosManos = marco(
  <>
    <Circle cx={28} cy={50} r={17} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Circle cx={72} cy={50} r={17} fill={PIEL} stroke={INK} strokeWidth={5} />
    {/* flechas de acercamiento: el movimiento que el dibujo NO puede mostrar */}
    <Path d="M44 50 L54 50 M50 45 L55 50 L50 55" stroke="#16a34a" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M56 50 L46 50 M50 45 L45 50 L50 55" stroke="#16a34a" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </>,
);

// ----------------------------------------------------------------------------
// Registro clave → figura. Igual criterio que ValeriaPictograms: si una clave
// no tiene dibujo, la diapositiva se muestra sin figura y no queda hueco.
// ----------------------------------------------------------------------------
const FIGURAS: Record<string, Fig> = {
  'mano-a': ManoA,
  'mano-b': ManoB,
  'mano-c': ManoC,
  'mano-l': ManoL,
  'mano-o': ManoO,
  'mano-v': ManoV,
  'mano-indice': ManoIndice,
  'mano-plana-arriba': ManoPlanaArriba,
  'dos-manos': DosManos,
};

export const hasSignFigure = (key: string): boolean => key.trim() in FIGURAS;

export const SignFigure: React.FC<{ figure: string; size?: number }> = ({ figure, size = 108 }) => {
  const F = FIGURAS[figure.trim()];
  if (!F) return null;
  return <F size={size} />;
};

export default SignFigure;

// ============================================================================
// Valeria+ · Pictogramas de ficha (V1.0)
// Los testers veían fichas "rotas": varios emojis del banco (🪚 sierra, 🪣 cubo,
// 🪥 cepillo, 🛝 tobogán…) son de Unicode 13/14 y en muchos Android se pintan
// como un cuadro vacío (tofu); otros (💇 pelo, 0️⃣/8️⃣, 🌉) se ven pero son
// confusos o de bajo contraste para la ficha grande.
//
// Solución: pictogramas SVG propios —sin fondo, alto contraste, contorno
// grueso y colores planos, como exige el visual_prompt clínico— con fallback
// a emoji para el resto de palabras.
//
//   <FichaVisual word="sierra" emoji="🪚" size={58} />
//     → pinta el SVG si la palabra tiene pictograma registrado; si no, el emoji.
// ============================================================================
import React from 'react';
import { Text } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

const INK = '#1f2937'; // trazo de contorno grueso, igual que textPrimary

type Pic = React.FC<{ size: number }>;

// --------------------------------------------------------------- cepillo 🪥 --
const CepilloPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* cerdas */}
    <Rect x={60} y={30} width={30} height={18} rx={3} fill="#ffffff" stroke={INK} strokeWidth={5} />
    <Line x1={68} y1={33} x2={68} y2={45} stroke="#93c5fd" strokeWidth={4} />
    <Line x1={76} y1={33} x2={76} y2={45} stroke="#93c5fd" strokeWidth={4} />
    <Line x1={84} y1={33} x2={84} y2={45} stroke="#93c5fd" strokeWidth={4} />
    {/* mango */}
    <Rect x={8} y={48} width={70} height={16} rx={8} fill="#00c4be" stroke={INK} strokeWidth={5} />
  </Svg>
);

// --------------------------------------------------------------- tobogán 🛝 --
const ToboganPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* escalera */}
    <Line x1={20} y1={88} x2={20} y2={26} stroke={INK} strokeWidth={6} />
    <Line x1={34} y1={88} x2={34} y2={26} stroke={INK} strokeWidth={6} />
    <Line x1={20} y1={42} x2={34} y2={42} stroke={INK} strokeWidth={5} />
    <Line x1={20} y1={58} x2={34} y2={58} stroke={INK} strokeWidth={5} />
    <Line x1={20} y1={74} x2={34} y2={74} stroke={INK} strokeWidth={5} />
    {/* rampa */}
    <Path d="M27 22 Q64 26 88 84" fill="none" stroke="#f59e0b" strokeWidth={13} strokeLinecap="round" />
    <Path d="M27 22 Q64 26 88 84" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeDasharray="0" opacity={0.25} />
    {/* suelo */}
    <Line x1={10} y1={90} x2={92} y2={90} stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </Svg>
);

// ------------------------------------------------------------------ cubo 🪣 --
const CuboPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* asa */}
    <Path d="M30 42 Q50 12 70 42" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    {/* cuerpo trapezoidal */}
    <Path d="M26 42 L74 42 L66 86 L34 86 Z" fill="#f59e0b" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <Line x1={30} y1={54} x2={70} y2={54} stroke={INK} strokeWidth={4} opacity={0.35} />
  </Svg>
);

// ---------------------------------------------------------------- sierra 🪚 --
const SierraPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* hoja con dientes */}
    <Path
      d="M30 40 L90 44 L88 58 L82 64 L76 58 L70 64 L64 58 L58 64 L52 58 L46 64 L40 58 L34 64 L30 58 Z"
      fill="#cbd5e1" stroke={INK} strokeWidth={5} strokeLinejoin="round"
    />
    {/* mango con hueco */}
    <Rect x={6} y={34} width={26} height={32} rx={10} fill="#b45309" stroke={INK} strokeWidth={5} />
    <Rect x={14} y={42} width={10} height={16} rx={5} fill="#ffffff" stroke={INK} strokeWidth={4} />
  </Svg>
);

// ------------------------------------------------------------------ pelo 💇 --
const PeloPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* cara */}
    <Circle cx={50} cy={58} r={26} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    {/* melena */}
    <Path
      d="M22 60 Q16 22 50 20 Q84 22 78 60 Q76 40 62 36 Q66 46 58 42 Q44 36 38 44 Q36 38 32 44 Q26 48 22 60 Z"
      fill="#7c4a0e" stroke={INK} strokeWidth={5} strokeLinejoin="round"
    />
    {/* ojos y sonrisa */}
    <Circle cx={41} cy={60} r={3} fill={INK} />
    <Circle cx={59} cy={60} r={3} fill={INK} />
    <Path d="M42 72 Q50 78 58 72" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
  </Svg>
);

// ---------------------------------------------------------------- puente 🌉 --
const PuentePic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* arco */}
    <Path d="M10 62 Q50 14 90 62" fill="none" stroke="#ef4444" strokeWidth={7} strokeLinecap="round" />
    {/* tirantes */}
    <Line x1={30} y1={44} x2={30} y2={62} stroke={INK} strokeWidth={4} />
    <Line x1={50} y1={38} x2={50} y2={62} stroke={INK} strokeWidth={4} />
    <Line x1={70} y1={44} x2={70} y2={62} stroke={INK} strokeWidth={4} />
    {/* tablero */}
    <Rect x={6} y={60} width={88} height={9} rx={4} fill="#9ca3af" stroke={INK} strokeWidth={5} />
    {/* agua */}
    <Path d="M14 84 Q22 78 30 84 Q38 90 46 84 Q54 78 62 84 Q70 90 78 84" fill="none" stroke="#3b82f6" strokeWidth={5} strokeLinecap="round" />
  </Svg>
);

// Números con soporte garantizado (los keycaps 0️⃣/8️⃣ fallan en algunos motores
// de emoji): placa redondeada de color plano con la cifra bien grande.
const numberPic = (digit: string, bg: string): Pic => {
  const NumberPic: Pic = ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={10} y={10} width={80} height={80} rx={20} fill={bg} stroke={INK} strokeWidth={6} />
      <SvgText
        x={50} y={72} fontSize={52} fontWeight="bold" fill="#ffffff"
        textAnchor="middle" stroke={INK} strokeWidth={2}
      >
        {digit}
      </SvgText>
    </Svg>
  );
  return NumberPic;
};

// ----------------------------------------------------------------------------
// Registro palabra → pictograma. Claves normalizadas (minúsculas, sin acentos).
// ----------------------------------------------------------------------------
const PICTOGRAMS: Record<string, Pic> = {
  cepillo: CepilloPic,
  tobogan: ToboganPic,
  cubo: CuboPic,
  sierra: SierraPic,
  pelo: PeloPic,
  puente: PuentePic,
  ocho: numberPic('8', '#7c4fd0'),
  cero: numberPic('0', '#f59e0b'),
};

const normalizeWord = (w: string): string =>
  w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export const hasPictogram = (word: string): boolean => normalizeWord(word) in PICTOGRAMS;

// Visual de ficha: SVG propio si la palabra lo tiene registrado; emoji si no.
export const FichaVisual: React.FC<{ word: string; emoji: string; size?: number }> = ({
  word, emoji, size = 58,
}) => {
  const Pic = PICTOGRAMS[normalizeWord(word)];
  if (Pic) return <Pic size={Math.round(size * 1.15)} />;
  return <Text style={{ fontSize: size }}>{emoji}</Text>;
};

export default FichaVisual;

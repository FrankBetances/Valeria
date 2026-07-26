// ============================================================================
// Valeria+ · Pictogramas de ficha (V2.0)
// Los testers veían fichas "rotas": varios emojis del banco (🪚 sierra, 🪣 cubo,
// 🪥 cepillo, 🛝 tobogán…) son de Unicode 13/14 y en muchos Android se pintan
// como un cuadro vacío (tofu); otros (💇 pelo, 0️⃣/8️⃣, 🌉) se ven pero son
// confusos o de bajo contraste para la ficha grande.
//
// Solución: pictogramas SVG propios —sin fondo, alto contraste, contorno
// grueso y colores planos, como exige el visual_prompt clínico— con fallback
// a emoji para el resto de palabras.
//
// ---------------------------------------------------------------------------
// V2 · CLAVE EXPLÍCITA (DC-4 · ES-09 · ES-12)
//
// Las logopedas de ACOPROS pidieron sustituir las imágenes ambiguas por
// pictogramas. Se descartó adoptar un banco externo: ARASAAC es CC BY-NC-SA
// (la cláusula NC bloquea el uso comercial), Mulberry es CC BY-SA (el
// share-alike se contagiaría al diseño de la app) y Sclera añade ND. Pero el
// argumento que decide no es la licencia: NINGÚN banco, ni de pago, trae
// «cuchara sucia» y «cuchara limpia» como par sobre el mismo objeto, que es
// exactamente lo que ES-12 necesita. Eso hay que dibujarlo a propósito.
//
// Por eso el dato ahora nombra el pictograma por una CLAVE, en vez de que este
// módulo lo adivine a partir de la palabra o del emoji:
//
//   · Adivinar por palabra falla en los contrastes, donde el label nombra el
//     ATRIBUTO («sucio») y no el objeto, y falla fuera del castellano, donde la
//     ficha dice «eskuila» o «txirristra» (fue lo que obligó a añadir el
//     registro por emoji).
//   · Adivinar por emoji falla dentro de una cápsula, donde las dos vueltas
//     comparten emoji por la regla de congruencia de ES-13.
//   · La clave es independiente de la lengua: un dibujo sirve a es, es-DO, gl
//     y eu sin duplicar.
//
// Orden de resolución: clave → palabra → emoji → emoji crudo. Una clave sin
// dibujo no rompe nada: cae al emoji, sin hueco visual.
//
//   <FichaVisual pic="cuchara-sucia" word="sucio" emoji="🥄" size={58} />
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

// Registro EMOJI \u2192 pictograma. El registro por palabra (arriba) solo casa con
// el l\u00e9xico castellano; en euskera/galego la ficha usa palabras propias
// (\u00abeskuila\u00bb, \u00abtxirristra\u00bb) que no est\u00e1n registradas, as\u00ed que ca\u00eda al emoji
// crudo \u2014 y justo estos SVG se crearon para SUSTITUIR emojis Unicode 13/14 que
// se pintan como tofu (cuadro vac\u00edo) en muchos Android. Mapeando tambi\u00e9n por el
// emoji, la ficha pinta el SVG en CUALQUIER variedad sin duplicar por idioma.
// ----------------------------------------------------------------------------
// Registro CLAVE → pictograma (V2). Es el registro preferente y el único capaz
// de distinguir dos variantes del mismo objeto. Las claves se escriben en
// kebab-case y en castellano, con la forma «objeto» u «objeto-atributo»; son
// identificadores, no texto visible, así que no se traducen.
//
// Se llena por tandas (ver docs/auditoria-pictogramas.md). Los ocho dibujos
// heredados de la V1 entran aquí también, para que el registro por clave sea
// la única puerta que hay que mirar.
// ----------------------------------------------------------------------------
const PICTOGRAMS_BY_KEY: Record<string, Pic> = {
  cepillo: CepilloPic,
  tobogan: ToboganPic,
  cubo: CuboPic,
  sierra: SierraPic,
  pelo: PeloPic,
  puente: PuentePic,
  'numero-ocho': numberPic('8', '#7c4fd0'),
  'numero-cero': numberPic('0', '#f59e0b'),
};

const PICTOGRAMS_BY_EMOJI: Record<string, Pic> = {
  '\ud83e\udea5': CepilloPic,
  '\ud83d\udedd': ToboganPic,
  '\ud83e\udea3': CuboPic,
  '\ud83e\ude9a': SierraPic,
  '\ud83d\udc87': PeloPic,
  '\ud83c\udf09': PuentePic,
  '8\ufe0f\u20e3': numberPic('8', '#7c4fd0'),
  '0\ufe0f\u20e3': numberPic('0', '#f59e0b'),
};

const normalizeWord = (w: string): string =>
  w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export const hasPictogram = (word: string): boolean => normalizeWord(word) in PICTOGRAMS;

// \u00bfExiste dibujo para esta clave? Lo usa el gate de cobertura para no dejar
// pasar una c\u00e1psula de contraste cuya vuelta de comprensi\u00f3n ser\u00eda irresoluble.
export const hasPictogramKey = (key: string): boolean => key.trim() in PICTOGRAMS_BY_KEY;

// Claves con dibujo, para la auditor\u00eda e inventario (docs/auditoria-pictogramas.md).
export const pictogramKeys = (): string[] => Object.keys(PICTOGRAMS_BY_KEY).sort();

// Visual de ficha. Orden de resoluci\u00f3n: clave expl\u00edcita \u2192 palabra \u2192 emoji \u2192
// emoji crudo. Que una clave no tenga dibujo NO es un error: es la ca\u00edda
// prevista mientras el banco propio se completa por tandas.
export const FichaVisual: React.FC<{
  word: string; emoji: string; size?: number; pic?: string;
}> = ({ word, emoji, size = 58, pic }) => {
  const Pic = (pic ? PICTOGRAMS_BY_KEY[pic.trim()] : undefined)
    ?? PICTOGRAMS[normalizeWord(word)]
    ?? PICTOGRAMS_BY_EMOJI[emoji?.trim()];
  if (Pic) return <Pic size={Math.round(size * 1.15)} />;
  return <Text style={{ fontSize: size }}>{emoji}</Text>;
};

export default FichaVisual;

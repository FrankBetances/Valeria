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
// posturas fijas. Las cuatro letras que SÍ llevan movimiento (J, Ñ, X, Z) se
// dibujan con su postura de partida y una flecha que indica el trazo: la flecha
// es un aviso —«esto no se aprende del dibujo»—, no una animación. Los signos
// léxicos con movimiento siguen remitiéndose a fuente signada.
//
// Las siluetas siguen el mismo criterio visual que ValeriaPictograms: sin
// fondo, contorno grueso, color plano, alto contraste.
//
// VALIDACIÓN: ✅ abecedario COMPLETO aprobado. Las nueve figuras originales
// (A, B, C, L, O, V, índice, mano plana y dos manos) las validó una persona
// sorda signante el 26 de julio de 2026; las 18 restantes, hasta las 27
// configuraciones del abecedario dactilológico, las aprobaron la logopeda y las
// personas sordas de ACOPROS el 27 de julio de 2026. Esa revisión es
// insustituible: un script comprueba que un dibujo EXISTA, nunca que se
// reconozca como la letra que dice ser. Cualquier figura nueva vuelve a
// necesitarla antes de entrar en producción.
// ============================================================================
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

const INK = '#1f2937';
const PIEL = '#fde3c0';
const MOV = '#16a34a'; // flechas de movimiento: lo que el dibujo NO captura

type Fig = React.FC<{ size: number }>;

const marco = (children: React.ReactNode): Fig => {
  const F: Fig = ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">{children}</Svg>
  );
  return F;
};

// ----------------------------------------------------------------------------
// Piezas básicas: puño, dedo, pulgar y flecha de movimiento. Tener el mismo
// puño y el mismo grosor de dedo en las 27 letras es lo que hace que el
// abecedario se lea como UNA serie y no como 27 dibujos sueltos.
// ----------------------------------------------------------------------------
const Puno = (props: { x?: number; y?: number; w?: number; h?: number }) => (
  <Rect
    x={props.x ?? 31} y={props.y ?? 46} width={props.w ?? 38} height={props.h ?? 42}
    rx={14} fill={PIEL} stroke={INK} strokeWidth={5}
  />
);

// Nudillos de los dedos plegados sobre el puño.
const Nudillos = ({ y = 56 }: { y?: number }) => (
  <>
    <Line x1={37} y1={y} x2={63} y2={y} stroke={INK} strokeWidth={3} opacity={0.45} />
    <Line x1={37} y1={y + 10} x2={63} y2={y + 10} stroke={INK} strokeWidth={3} opacity={0.45} />
  </>
);

// Dedo extendido hacia arriba desde el puño.
const Dedo = ({ x, top = 12, bottom = 58, rot, pivot }: {
  x: number; top?: number; bottom?: number; rot?: number; pivot?: [number, number];
}) => (
  <Rect
    x={x} y={top} width={15} height={bottom - top} rx={7}
    fill={PIEL} stroke={INK} strokeWidth={5}
    {...(rot != null ? { transform: `rotate(${rot} ${(pivot ?? [x + 7, bottom])[0]} ${(pivot ?? [x + 7, bottom])[1]})` } : {})}
  />
);

// Dedo doblado sobre la palma (letras M, N, E): asoma solo la punta.
const DedoPlegado = ({ x }: { x: number }) => (
  <Rect x={x} y={38} width={14} height={18} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
);

// Pulgar al costado, hacia arriba (A, S).
const PulgarCostado = () => (
  <Path d="M28 70 q-10 -6 -6 -18 q3 -8 10 -4" fill={PIEL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
);

// Pulgar cruzado por delante de la palma (S, M, N, T).
const PulgarCruzado = ({ y = 66 }: { y?: number }) => (
  <Rect x={24} y={y} width={38} height={14} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
);

// Pulgar extendido hacia el lado (L, Y, G).
const PulgarLateral = ({ y = 60 }: { y?: number }) => (
  <Rect x={6} y={y} width={38} height={15} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
);

// Flecha del trazo en las letras con movimiento (J, Ñ, X, Z).
const Flecha = ({ d }: { d: string }) => (
  <Path d={d} fill="none" stroke={MOV} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
);

// ============================================================================
// ABECEDARIO DACTILOLÓGICO
// ============================================================================

// --- A · puño cerrado con el pulgar al lado (VALIDADA) ----------------------
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

// --- B · mano plana, dedos juntos y extendidos, pulgar cruzado (VALIDADA) ---
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

// --- C · mano curvada en forma de C (VALIDADA) ------------------------------
const ManoC = marco(
  <>
    <Path d="M74 24 q-34 -10 -46 16 q-12 26 12 42 q18 12 34 2" fill="none" stroke={PIEL} strokeWidth={26} strokeLinecap="round" />
    <Path d="M74 24 q-34 -10 -46 16 q-12 26 12 42 q18 12 34 2" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.9} />
  </>,
);

// --- D · índice arriba; pulgar y resto de dedos formando un aro -------------
const ManoD = marco(
  <>
    <Circle cx={50} cy={64} r={22} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Circle cx={50} cy={64} r={10} fill="none" stroke={INK} strokeWidth={4} opacity={0.7} />
    <Dedo x={42} top={10} bottom={50} />
  </>,
);

// --- E · dedos doblados sobre la palma, pulgar por delante ------------------
const ManoE = marco(
  <>
    <Puno y={50} h={38} />
    <DedoPlegado x={33} />
    <DedoPlegado x={48} />
    <DedoPlegado x={63} />
    <PulgarCruzado y={62} />
  </>,
);

// --- F · pulgar e índice en aro, tres dedos extendidos ----------------------
const ManoF = marco(
  <>
    <Puno y={54} h={34} />
    <Dedo x={40} top={16} bottom={58} />
    <Dedo x={55} top={14} bottom={58} />
    <Dedo x={70} top={18} bottom={58} />
    <Circle cx={28} cy={52} r={14} fill="none" stroke={PIEL} strokeWidth={11} />
    <Circle cx={28} cy={52} r={19} fill="none" stroke={INK} strokeWidth={5} />
    <Circle cx={28} cy={52} r={9} fill="none" stroke={INK} strokeWidth={4} />
  </>,
);

// --- G · índice y pulgar extendidos hacia delante, paralelos ----------------
const ManoG = marco(
  <>
    <Puno x={54} y={40} w={34} h={44} />
    <Nudillos y={52} />
    <Rect x={10} y={40} width={48} height={15} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Rect x={14} y={64} width={44} height={14} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
  </>,
);

// --- H · índice y corazón extendidos juntos, en horizontal ------------------
const ManoH = marco(
  <>
    <Puno x={56} y={38} w={32} h={46} />
    <Rect x={8} y={38} width={52} height={15} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Rect x={8} y={56} width={52} height={15} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
  </>,
);

// --- I · meñique extendido, resto en puño -----------------------------------
const ManoI = marco(
  <>
    <Puno />
    <Nudillos />
    <Dedo x={62} top={16} bottom={52} />
  </>,
);

// --- J · la I que traza una jota (LLEVA MOVIMIENTO) -------------------------
const ManoJ = marco(
  <>
    <Puno y={44} h={40} />
    <Nudillos y={54} />
    <Dedo x={62} top={14} bottom={50} />
    <Flecha d="M78 30 q10 22 -4 30 q-10 6 -14 -4 M60 56 l0 8 M60 56 l8 4" />
  </>,
);

// --- K · índice arriba, corazón en diagonal y pulgar entre ambos ------------
const ManoK = marco(
  <>
    <Puno y={52} h={36} />
    <Dedo x={38} top={10} bottom={56} />
    <Dedo x={54} top={12} bottom={56} rot={28} pivot={[61, 56]} />
    <Rect x={38} y={44} width={26} height={13} rx={6} fill={PIEL} stroke={INK} strokeWidth={5} transform="rotate(-30 51 50)" />
  </>,
);

// --- L · índice arriba y pulgar en ángulo recto (VALIDADA) ------------------
const ManoL = marco(
  <>
    <Rect x={40} y={54} width={32} height={36} rx={12} fill={PIEL} stroke={INK} strokeWidth={5} />
    {/* índice extendido hacia arriba */}
    <Rect x={42} y={12} width={16} height={46} rx={8} fill={PIEL} stroke={INK} strokeWidth={5} />
    {/* pulgar extendido hacia el lado */}
    <Rect x={8} y={60} width={38} height={15} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
  </>,
);

// --- M · tres dedos doblados sobre el pulgar --------------------------------
const ManoM = marco(
  <>
    <Puno y={50} h={38} />
    <PulgarCruzado y={60} />
    <DedoPlegado x={31} />
    <DedoPlegado x={45} />
    <DedoPlegado x={59} />
  </>,
);

// --- N · dos dedos doblados sobre el pulgar ---------------------------------
const ManoN = marco(
  <>
    <Puno y={50} h={38} />
    <PulgarCruzado y={60} />
    <DedoPlegado x={38} />
    <DedoPlegado x={52} />
  </>,
);

// --- Ñ · la N con movimiento de vaivén (LLEVA MOVIMIENTO) -------------------
const ManoEnhe = marco(
  <>
    <Puno y={50} h={38} />
    <PulgarCruzado y={60} />
    <DedoPlegado x={38} />
    <DedoPlegado x={52} />
    {/* virgulilla + vaivén: lo que distingue Ñ de N no es la postura */}
    <Path d="M34 26 q6 -10 12 0 q6 10 12 0" fill="none" stroke={MOV} strokeWidth={4} strokeLinecap="round" />
    <Flecha d="M26 32 l-6 -4 l6 -4 M74 32 l6 -4 l-6 -4" />
  </>,
);

// --- O · dedos y pulgar formando un círculo (VALIDADA) ----------------------
const ManoO = marco(
  <>
    <Circle cx={50} cy={50} r={30} fill="none" stroke={PIEL} strokeWidth={20} />
    <Circle cx={50} cy={50} r={40} fill="none" stroke={INK} strokeWidth={5} />
    <Circle cx={50} cy={50} r={20} fill="none" stroke={INK} strokeWidth={5} />
  </>,
);

// --- P · la K apuntando hacia abajo -----------------------------------------
const ManoP = marco(
  <G transform="rotate(180 50 50)">
    <Puno y={52} h={36} />
    <Dedo x={38} top={10} bottom={56} />
    <Dedo x={54} top={12} bottom={56} rot={28} pivot={[61, 56]} />
    <Rect x={38} y={44} width={26} height={13} rx={6} fill={PIEL} stroke={INK} strokeWidth={5} transform="rotate(-30 51 50)" />
  </G>,
);

// --- Q · la G apuntando hacia abajo -----------------------------------------
const ManoQ = marco(
  <G transform="rotate(180 50 50)">
    <Puno x={54} y={40} w={34} h={44} />
    <Rect x={10} y={40} width={48} height={15} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Rect x={14} y={64} width={44} height={14} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
  </G>,
);

// --- R · índice y corazón cruzados ------------------------------------------
const ManoR = marco(
  <>
    <Puno y={54} h={34} />
    <Dedo x={44} top={12} bottom={58} rot={14} pivot={[51, 58]} />
    <Dedo x={44} top={12} bottom={58} rot={-14} pivot={[51, 58]} />
  </>,
);

// --- S · puño con el pulgar cruzado por delante -----------------------------
const ManoS = marco(
  <>
    <Puno y={44} h={44} />
    <Nudillos y={54} />
    <PulgarCruzado y={62} />
  </>,
);

// --- T · pulgar asomando entre índice y corazón -----------------------------
const ManoT = marco(
  <>
    <Puno y={46} h={42} />
    <Nudillos y={58} />
    <Rect x={44} y={34} width={14} height={20} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} />
  </>,
);

// --- U · índice y corazón extendidos y juntos -------------------------------
const ManoU = marco(
  <>
    <Puno y={54} h={34} />
    <Dedo x={38} top={12} bottom={58} />
    <Dedo x={52} top={12} bottom={58} />
  </>,
);

// --- V · índice y corazón extendidos y separados (VALIDADA) -----------------
const ManoV = marco(
  <>
    <Rect x={34} y={54} width={36} height={36} rx={13} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Rect x={30} y={12} width={15} height={48} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} transform="rotate(-12 37 36)" />
    <Rect x={56} y={12} width={15} height={48} rx={7} fill={PIEL} stroke={INK} strokeWidth={5} transform="rotate(12 63 36)" />
  </>,
);

// --- W · tres dedos extendidos y separados ----------------------------------
const ManoW = marco(
  <>
    <Puno y={56} h={32} />
    <Dedo x={28} top={14} bottom={60} rot={-14} pivot={[35, 60]} />
    <Dedo x={43} top={12} bottom={60} />
    <Dedo x={58} top={14} bottom={60} rot={14} pivot={[65, 60]} />
  </>,
);

// --- X · índice en gancho (LLEVA MOVIMIENTO de enganche) --------------------
const ManoX = marco(
  <>
    <Puno y={50} h={38} />
    <Nudillos y={60} />
    <Path d="M46 54 L46 28 q0 -12 12 -10" fill="none" stroke={PIEL} strokeWidth={13} strokeLinecap="round" />
    <Path d="M46 54 L46 28 q0 -12 12 -10" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <Flecha d="M70 22 q8 8 0 16" />
  </>,
);

// --- Y · pulgar y meñique extendidos ----------------------------------------
const ManoY = marco(
  <>
    <Puno y={48} h={40} />
    <Nudillos y={58} />
    <Dedo x={62} top={16} bottom={54} rot={16} pivot={[69, 54]} />
    <PulgarLateral y={56} />
  </>,
);

// --- Z · el índice traza una zeta (LLEVA MOVIMIENTO) ------------------------
const ManoZ = marco(
  <>
    <Puno y={50} h={38} />
    <Nudillos y={60} />
    <Dedo x={42} top={16} bottom={56} />
    <Flecha d="M62 22 L84 22 L62 42 L84 42 M78 38 L84 42 L78 46" />
  </>,
);

// ============================================================================
// CONFIGURACIONES DE APOYO (no son letras): base de signos frecuentes
// ============================================================================

// --- Índice señalando (base de muchos signos deícticos) (VALIDADA) ----------
const ManoIndice = marco(
  <>
    <Rect x={38} y={50} width={34} height={40} rx={13} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Rect x={46} y={10} width={16} height={46} rx={8} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Path d="M36 66 q-12 2 -12 12" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </>,
);

// --- Mano plana con la palma hacia arriba (VALIDADA) ------------------------
const ManoPlanaArriba = marco(
  <>
    <Ellipse cx={50} cy={62} rx={34} ry={20} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Path d="M20 56 L14 40 M32 50 L28 32 M50 48 L50 28 M68 50 L72 32" stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.5} />
  </>,
);

// --- Dos manos que se juntan (base de «más») (VALIDADA) ---------------------
const DosManos = marco(
  <>
    <Circle cx={28} cy={50} r={17} fill={PIEL} stroke={INK} strokeWidth={5} />
    <Circle cx={72} cy={50} r={17} fill={PIEL} stroke={INK} strokeWidth={5} />
    {/* flechas de acercamiento: el movimiento que el dibujo NO puede mostrar */}
    <Path d="M44 50 L54 50 M50 45 L55 50 L50 55" stroke={MOV} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <Path d="M56 50 L46 50 M50 45 L45 50 L50 55" stroke={MOV} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
  'mano-d': ManoD,
  'mano-e': ManoE,
  'mano-f': ManoF,
  'mano-g': ManoG,
  'mano-h': ManoH,
  'mano-i': ManoI,
  'mano-j': ManoJ,
  'mano-k': ManoK,
  'mano-l': ManoL,
  'mano-m': ManoM,
  'mano-n': ManoN,
  'mano-enhe': ManoEnhe,
  'mano-o': ManoO,
  'mano-p': ManoP,
  'mano-q': ManoQ,
  'mano-r': ManoR,
  'mano-s': ManoS,
  'mano-t': ManoT,
  'mano-u': ManoU,
  'mano-v': ManoV,
  'mano-w': ManoW,
  'mano-x': ManoX,
  'mano-y': ManoY,
  'mano-z': ManoZ,
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

// ----------------------------------------------------------------------------
// Abecedario completo, en orden. `movimiento` marca las letras cuya identidad
// depende del trazo y no solo de la postura: el dibujo las muestra con flecha y
// la leyenda avisa de que ahí el dibujo se queda corto.
// ----------------------------------------------------------------------------
export interface DactylLetter { letter: string; figure: string; movimiento?: boolean }

export const DACTYL_ALPHABET: DactylLetter[] = [
  { letter: 'A', figure: 'mano-a' },
  { letter: 'B', figure: 'mano-b' },
  { letter: 'C', figure: 'mano-c' },
  { letter: 'D', figure: 'mano-d' },
  { letter: 'E', figure: 'mano-e' },
  { letter: 'F', figure: 'mano-f' },
  { letter: 'G', figure: 'mano-g' },
  { letter: 'H', figure: 'mano-h' },
  { letter: 'I', figure: 'mano-i' },
  { letter: 'J', figure: 'mano-j', movimiento: true },
  { letter: 'K', figure: 'mano-k' },
  { letter: 'L', figure: 'mano-l' },
  { letter: 'M', figure: 'mano-m' },
  { letter: 'N', figure: 'mano-n' },
  { letter: 'Ñ', figure: 'mano-enhe', movimiento: true },
  { letter: 'O', figure: 'mano-o' },
  { letter: 'P', figure: 'mano-p' },
  { letter: 'Q', figure: 'mano-q' },
  { letter: 'R', figure: 'mano-r' },
  { letter: 'S', figure: 'mano-s' },
  { letter: 'T', figure: 'mano-t' },
  { letter: 'U', figure: 'mano-u' },
  { letter: 'V', figure: 'mano-v' },
  { letter: 'W', figure: 'mano-w' },
  { letter: 'X', figure: 'mano-x', movimiento: true },
  { letter: 'Y', figure: 'mano-y' },
  { letter: 'Z', figure: 'mano-z', movimiento: true },
];

// ----------------------------------------------------------------------------
// Panel del abecedario: las 27 configuraciones a la vez. Es lo que un adulto
// necesita para deletrear un nombre propio sin ir pasando diapositivas, y lo
// que hace visible de un vistazo que el módulo TIENE dibujos.
// `compact` lo reduce a una tira de muestra (cabecera del dominio).
// ----------------------------------------------------------------------------
export const SignAlphabetChart: React.FC<{ compact?: boolean; letters?: DactylLetter[] }> = ({
  compact = false, letters,
}) => {
  const items = letters ?? (compact ? DACTYL_ALPHABET.slice(0, 6) : DACTYL_ALPHABET);
  const size = compact ? 40 : 62;
  return (
    <View style={[a.grid, compact && a.gridCompact]}>
      {items.map((it) => (
        <View key={it.letter} style={[a.cell, compact && a.cellCompact]}>
          <SignFigure figure={it.figure} size={size} />
          <View style={a.labelRow}>
            <Text style={[a.letter, compact && a.letterCompact]}>{it.letter}</Text>
            {!!it.movimiento && !compact && <Text style={a.mov}>↻</Text>}
          </View>
        </View>
      ))}
    </View>
  );
};

const a = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  gridCompact: { gap: 6, marginTop: 0, justifyContent: 'flex-start' },
  cell: {
    width: 76, alignItems: 'center', paddingVertical: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ece7f8', borderRadius: 12,
  },
  cellCompact: { width: 52, paddingVertical: 5, borderRadius: 10 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  letter: { fontSize: 14, fontWeight: '800', color: '#4b3a7a' },
  letterCompact: { fontSize: 11 },
  mov: { fontSize: 11, color: MOV, fontWeight: '800' },
});

export default SignFigure;

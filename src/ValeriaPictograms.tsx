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
import Svg, { Circle, Ellipse, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

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

// ============================================================================
// PARES DE CONTRASTE (ES-12) · el mismo objeto, dos veces, cambiando solo el
// atributo. Es la única forma de que la vuelta de comprensión sea resoluble:
// la regla de congruencia de ES-13 obliga a que las dos vueltas de una cápsula
// muestren el mismo objeto, así que con emoji salían dos tarjetas idénticas.
//
// Las dos variantes se dibujan SIEMPRE en el mismo viewBox y se pintan al mismo
// tamaño en pantalla. El contraste tiene que leerse dentro del marco —un osito
// que llena la caja frente a uno pequeño sobre la misma línea de suelo—, no
// escalando la ficha, que era el apaño que sostenía a duras penas grande/pequeño.
// ============================================================================

// Línea de suelo común: da la referencia que hace legible el contraste de
// tamaño. Sin ella, un dibujo pequeño y otro grande son solo dos dibujos.
const Suelo = () => (
  <Line x1={8} y1={92} x2={92} y2={92} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.45} />
);

// ------------------------------------------------- osito grande / pequeño --
// Mismo oso, dos tamaños, sobre el mismo suelo.
const osito = (cx: number, baseY: number, r: number) => (
  <>
    {/* orejas */}
    <Circle cx={cx - r * 0.72} cy={baseY - r * 1.62} r={r * 0.34} fill="#b98046" stroke={INK} strokeWidth={r * 0.16} />
    <Circle cx={cx + r * 0.72} cy={baseY - r * 1.62} r={r * 0.34} fill="#b98046" stroke={INK} strokeWidth={r * 0.16} />
    {/* cuerpo */}
    <Circle cx={cx} cy={baseY - r * 0.52} r={r * 0.62} fill="#b98046" stroke={INK} strokeWidth={r * 0.16} />
    {/* cabeza */}
    <Circle cx={cx} cy={baseY - r * 1.22} r={r * 0.62} fill="#cf9a5f" stroke={INK} strokeWidth={r * 0.16} />
    {/* hocico */}
    <Circle cx={cx} cy={baseY - r * 1.04} r={r * 0.26} fill="#f4e0c4" stroke={INK} strokeWidth={r * 0.12} />
    <Circle cx={cx} cy={baseY - r * 1.14} r={r * 0.1} fill={INK} />
    {/* ojos */}
    <Circle cx={cx - r * 0.26} cy={baseY - r * 1.42} r={r * 0.09} fill={INK} />
    <Circle cx={cx + r * 0.26} cy={baseY - r * 1.42} r={r * 0.09} fill={INK} />
  </>
);

const OsitoGrandePic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Suelo />
    {osito(50, 92, 34)}
  </Svg>
);

const OsitoPequenoPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Suelo />
    {osito(50, 92, 15)}
  </Svg>
);

// -------------------------------------------------- cuchara limpia / sucia --
// Misma cuchara; cambia el brillo por manchas.
const cuchara = (
  <>
    <Path d="M50 78 L50 44" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <Ellipse cx={50} cy={34} rx={17} ry={22} fill="#e2e8f0" stroke={INK} strokeWidth={5} />
  </>
);

const CucharaLimpiaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {cuchara}
    {/* brillo: el destello que dice «limpia» sin palabras */}
    <Path d="M42 26 Q46 20 52 22" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" />
    <Path d="M74 20 L74 32 M68 26 L80 26" stroke="#f4c430" strokeWidth={5} strokeLinecap="round" />
  </Svg>
);

const CucharaSuciaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {cuchara}
    {/* manchas dentro del cuenco y un goterón cayendo */}
    <Circle cx={45} cy={30} r={7} fill="#8a5a2b" />
    <Circle cx={56} cy={40} r={5} fill="#8a5a2b" />
    <Circle cx={54} cy={26} r={3.5} fill="#8a5a2b" />
    <Path d="M50 58 q4 6 0 9 q-4 -3 0 -9" fill="#8a5a2b" />
  </Svg>
);

// ---------------------------------------------------- caja abierta/cerrada --
// Misma caja; cambia la tapa y si se ve el juguete de dentro.
const CajaCerradaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Rect x={18} y={40} width={64} height={44} rx={5} fill="#d59a54" stroke={INK} strokeWidth={5} />
    {/* tapa encajada */}
    <Rect x={14} y={31} width={72} height={13} rx={4} fill="#b9793a" stroke={INK} strokeWidth={5} />
    {/* cinta */}
    <Line x1={50} y1={44} x2={50} y2={84} stroke={INK} strokeWidth={4} opacity={0.35} />
  </Svg>
);

const CajaAbiertaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* tapa levantada y ladeada */}
    <Rect
      x={16} y={16} width={62} height={12} rx={4} fill="#b9793a" stroke={INK} strokeWidth={5}
      transform="rotate(-16 47 22)"
    />
    <Rect x={18} y={40} width={64} height={44} rx={5} fill="#d59a54" stroke={INK} strokeWidth={5} />
    {/* boca abierta y el juguete asomando dentro */}
    <Ellipse cx={50} cy={41} rx={32} ry={8} fill="#8c5a28" stroke={INK} strokeWidth={5} />
    <Circle cx={50} cy={38} r={11} fill="#ef4444" stroke={INK} strokeWidth={4} />
  </Svg>
);

// ------------------------------------------------------ vaso frío/caliente --
// Mismo vaso; cambian el color del líquido, los hielos y el vaho.
const vaso = (liquido: string) => (
  <>
    <Path d="M30 30 L70 30 L64 86 L36 86 Z" fill="#eef2f7" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M33 48 L67 48 L63 84 L37 84 Z" fill={liquido} />
    <Path d="M30 30 L70 30 L64 86 L36 86 Z" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </>
);

const VasoFrioPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {vaso('#7cc4f5')}
    {/* hielos */}
    <Rect x={39} y={54} width={13} height={13} rx={2} fill="#ffffff" stroke={INK} strokeWidth={3} />
    <Rect x={52} y={64} width={11} height={11} rx={2} fill="#ffffff" stroke={INK} strokeWidth={3} />
    {/* copo: el frío no se ve, hay que decirlo con un símbolo */}
    <Path d="M78 20 L78 38 M70 24 L86 34 M86 24 L70 34" stroke="#3b82f6" strokeWidth={4} strokeLinecap="round" />
  </Svg>
);

const VasoCalientePic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {vaso('#e8924a')}
    {/* vaho subiendo */}
    <Path d="M42 24 q6 -8 0 -16" fill="none" stroke="#ef4444" strokeWidth={4.5} strokeLinecap="round" />
    <Path d="M58 24 q6 -8 0 -16" fill="none" stroke="#ef4444" strokeWidth={4.5} strokeLinecap="round" />
  </Svg>
);

// ---------------------------------------------- bombilla encendida/apagada --
const bombilla = (vidrio: string, rosca: string) => (
  <>
    <Path
      d="M50 14 C68 14 78 27 78 40 C78 52 68 55 66 66 L34 66 C32 55 22 52 22 40 C22 27 32 14 50 14 Z"
      fill={vidrio} stroke={INK} strokeWidth={5} strokeLinejoin="round"
    />
    <Rect x={36} y={66} width={28} height={9} rx={3} fill={rosca} stroke={INK} strokeWidth={4} />
    <Rect x={39} y={75} width={22} height={9} rx={3} fill={rosca} stroke={INK} strokeWidth={4} />
  </>
);

const BombillaEncendidaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* rayos: lo que convierte «bombilla» en «bombilla encendida» */}
    <Path
      d="M50 6 L50 0 M14 16 L9 11 M86 16 L91 11 M8 44 L1 44 M92 44 L99 44"
      stroke="#f4c430" strokeWidth={5} strokeLinecap="round"
    />
    {bombilla('#ffd84d', '#9ca3af')}
    {/* filamento visible */}
    <Path d="M42 46 L46 36 L50 46 L54 36 L58 46" fill="none" stroke="#b45309" strokeWidth={4} strokeLinecap="round" />
  </Svg>
);

const BombillaApagadaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {bombilla('#dfe4ea', '#9ca3af')}
    <Path d="M42 46 L46 36 L50 46 L54 36 L58 46" fill="none" stroke="#9ca3af" strokeWidth={4} strokeLinecap="round" />
  </Svg>
);

// ------------------------------------------------------- cesta llena/vacía --
const cesta = (
  <>
    <Path d="M22 46 L78 46 L70 86 L30 86 Z" fill="#d9a441" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Line x1={34} y1={62} x2={66} y2={62} stroke={INK} strokeWidth={3.5} opacity={0.4} />
    <Line x1={36} y1={74} x2={64} y2={74} stroke={INK} strokeWidth={3.5} opacity={0.4} />
    <Rect x={18} y={40} width={64} height={9} rx={4} fill="#b9812c" stroke={INK} strokeWidth={4} />
  </>
);

const CestaLlenaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* cosas asomando POR ENCIMA del borde: es lo que se lee como «llena» */}
    <Circle cx={36} cy={30} r={12} fill="#ef4444" stroke={INK} strokeWidth={4} />
    <Circle cx={58} cy={26} r={13} fill="#3b82f6" stroke={INK} strokeWidth={4} />
    <Circle cx={72} cy={34} r={10} fill="#22c55e" stroke={INK} strokeWidth={4} />
    {cesta}
  </Svg>
);

const CestaVaciaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {cesta}
    {/* fondo visible: se ve el interior porque no hay nada dentro */}
    <Ellipse cx={50} cy={45} rx={28} ry={7} fill="#8a5f18" stroke={INK} strokeWidth={4} />
  </Svg>
);

// --------------------------------------------------- coche subiendo/bajando --
// El mismo coche sobre la misma rampa; cambia hacia dónde va.
const coche = (cx: number, cy: number, rot: number) => (
  <>
    <Rect x={cx - 20} y={cy - 8} width={40} height={14} rx={5} fill="#ef4444" stroke={INK} strokeWidth={4}
      transform={`rotate(${rot} ${cx} ${cy})`} />
    <Path d={`M${cx - 11} ${cy - 8} L${cx - 6} ${cy - 18} L${cx + 8} ${cy - 18} L${cx + 12} ${cy - 8} Z`}
      fill="#fca5a5" stroke={INK} strokeWidth={4} strokeLinejoin="round"
      transform={`rotate(${rot} ${cx} ${cy})`} />
    <Circle cx={cx - 11} cy={cy + 8} r={6} fill={INK} transform={`rotate(${rot} ${cx} ${cy})`} />
    <Circle cx={cx + 11} cy={cy + 8} r={6} fill={INK} transform={`rotate(${rot} ${cx} ${cy})`} />
  </>
);

const CocheSubiendoPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* rampa */}
    <Path d="M6 88 L92 34" stroke="#9ca3af" strokeWidth={9} strokeLinecap="round" />
    <Suelo />
    {coche(40, 60, -32)}
    {/* flecha de dirección, pegada al morro */}
    <Path d="M74 40 L86 30 M86 30 L86 40 M86 30 L77 30" stroke="#16a34a" strokeWidth={5}
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

const CocheBajandoPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M6 88 L92 34" stroke="#9ca3af" strokeWidth={9} strokeLinecap="round" />
    <Suelo />
    {coche(58, 46, -32)}
    <Path d="M32 62 L20 72 M20 72 L20 62 M20 72 L29 72" stroke="#16a34a" strokeWidth={5}
      strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

// ---------------------------------------------------- juguete dentro/fuera --
// Misma caja y mismo juguete; cambia dónde está.
const cajaAbiertaBaja = (
  <>
    <Ellipse cx={54} cy={54} rx={30} ry={9} fill="#8c5a28" stroke={INK} strokeWidth={5} />
    <Path d="M24 54 L30 86 L78 86 L84 54" fill="#d59a54" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </>
);

const JugueteDentroPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Suelo />
    {cajaAbiertaBaja}
    {/* la pelota asoma por la boca: está DENTRO */}
    <Circle cx={54} cy={50} r={13} fill="#3b82f6" stroke={INK} strokeWidth={4} />
    <Ellipse cx={54} cy={54} rx={30} ry={9} fill="none" stroke={INK} strokeWidth={5} />
  </Svg>
);

const JugueteFueraPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Suelo />
    {cajaAbiertaBaja}
    {/* la misma pelota, en el suelo al lado de la caja */}
    <Circle cx={16} cy={78} r={13} fill="#3b82f6" stroke={INK} strokeWidth={4} />
  </Svg>
);

// ============================================================================
// TANDA 2 · VERBOS Y ACCIONES (ES-09) — «algunas imágenes resultan ambiguas
// (por ejemplo, la de comer)». Un emoji de cara saboreando no dice «comer»:
// dice «qué rico». El pictograma muestra la ACCIÓN, con el objeto y el gesto.
// ============================================================================

// Perfil de cabeza reutilizable: la misma cara para todas las acciones que
// pasan por la boca (comer, soplar, dormir), para que el niño reconozca al
// mismo personaje y solo lea el cambio de acción.
const perfil = (cx: number, cy: number, r: number) => (
  <>
    <Circle cx={cx} cy={cy} r={r} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    <Circle cx={cx + r * 0.28} cy={cy - r * 0.22} r={r * 0.12} fill={INK} />
  </>
);

const ComerPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {perfil(36, 44, 24)}
    {/* boca abierta */}
    <Path d="M56 50 q6 8 -2 12" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    {/* cuchara con comida entrando en la boca */}
    <Path d="M92 78 L68 58" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <Ellipse cx={64} cy={54} rx={11} ry={8} fill="#e2e8f0" stroke={INK} strokeWidth={4} transform="rotate(-40 64 54)" />
    <Circle cx={64} cy={52} r={4} fill="#e8924a" />
  </Svg>
);

const DormirPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* almohada */}
    <Rect x={10} y={58} width={64} height={22} rx={10} fill="#cfe3f5" stroke={INK} strokeWidth={5} />
    <Circle cx={40} cy={44} r={22} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    {/* ojos cerrados */}
    <Path d="M30 42 q5 5 10 0 M46 42 q5 5 10 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    {/* zzz */}
    <SvgText x={76} y={34} fontSize={26} fontWeight="bold" fill="#7c4fd0" stroke={INK} strokeWidth={1.5}>z</SvgText>
    <SvgText x={72} y={16} fontSize={17} fontWeight="bold" fill="#7c4fd0" stroke={INK} strokeWidth={1}>z</SvgText>
  </Svg>
);

const SoplarPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {perfil(30, 50, 22)}
    {/* boca en O */}
    <Circle cx={50} cy={56} r={5} fill={INK} />
    {/* ráfagas */}
    <Path d="M60 50 q14 -4 26 0 M60 60 q18 -3 32 0 M60 70 q12 -3 22 0"
      fill="none" stroke="#7cc4f5" strokeWidth={5} strokeLinecap="round" />
  </Svg>
);

const BanarPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* bañera */}
    <Path d="M10 48 L90 48 L82 82 L18 82 Z" fill="#eef2f7" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M15 60 L85 60 L80 80 L20 80 Z" fill="#7cc4f5" />
    <Path d="M10 48 L90 48 L82 82 L18 82 Z" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* cabeza asomando y espuma */}
    <Circle cx={50} cy={40} r={13} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    <Circle cx={34} cy={52} r={7} fill="#ffffff" stroke={INK} strokeWidth={3} />
    <Circle cx={68} cy={54} r={6} fill="#ffffff" stroke={INK} strokeWidth={3} />
    {/* patas */}
    <Line x1={26} y1={84} x2={22} y2={92} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <Line x1={74} y1={84} x2={78} y2={92} stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </Svg>
);

const VestirPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* cabeza asomando por el cuello */}
    <Circle cx={50} cy={22} r={14} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    {/* camiseta entrando */}
    <Path d="M24 46 L38 38 Q50 48 62 38 L76 46 L70 58 L64 55 L64 86 L36 86 L36 55 L30 58 Z"
      fill="#00c4be" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* flecha de que baja */}
    <Path d="M88 30 L88 46 M82 40 L88 47 L94 40" fill="none" stroke="#16a34a" strokeWidth={4.5}
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CorrerPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx={58} cy={20} r={11} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    {/* tronco y extremidades en zancada */}
    <Path d="M56 32 L48 56" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <Path d="M48 56 L64 74 M48 56 L30 68" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <Path d="M54 40 L74 34 M54 42 L34 40" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    {/* líneas de velocidad */}
    <Path d="M6 34 L24 34 M4 48 L20 48 M8 62 L22 62" stroke="#9ca3af" strokeWidth={4} strokeLinecap="round" />
  </Svg>
);

const NadarPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx={34} cy={38} r={12} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    {/* brazo en brazada y cuerpo */}
    <Path d="M44 44 L74 52" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    <Path d="M40 30 Q54 12 70 22" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    {/* agua */}
    <Path d="M6 66 q10 -7 20 0 q10 7 20 0 q10 -7 20 0 q10 7 20 0"
      fill="none" stroke="#3b82f6" strokeWidth={6} strokeLinecap="round" />
    <Path d="M6 80 q10 -7 20 0 q10 7 20 0 q10 -7 20 0 q10 7 20 0"
      fill="none" stroke="#7cc4f5" strokeWidth={6} strokeLinecap="round" />
  </Svg>
);

const PararPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M34 8 L66 8 L92 34 L92 66 L66 92 L34 92 L8 66 L8 34 Z"
      fill="#ef4444" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* mano abierta */}
    <Path d="M38 74 L38 44 q0 -6 6 -6 t6 6 L50 34 q0 -6 6 -6 t6 6 L62 40 q0 -5 5 -5 t5 5 L72 66 q0 10 -10 10 Z"
      fill="#ffffff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </Svg>
);

const PajaroPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* cuerpo */}
    <Ellipse cx={46} cy={58} rx={26} ry={19} fill="#7cc4f5" stroke={INK} strokeWidth={5} />
    {/* cabeza */}
    <Circle cx={72} cy={42} r={14} fill="#7cc4f5" stroke={INK} strokeWidth={5} />
    <Circle cx={77} cy={39} r={2.6} fill={INK} />
    {/* pico */}
    <Path d="M86 44 L96 48 L86 51 Z" fill="#f59e0b" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    {/* ala levantada */}
    <Path d="M40 52 Q34 30 18 34 Q30 44 34 58 Z" fill="#3b82f6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {/* cola y patas */}
    <Path d="M20 62 L6 56 L8 70 Z" fill="#3b82f6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <Line x1={44} y1={77} x2={44} y2={88} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <Line x1={56} y1={77} x2={56} y2={88} stroke={INK} strokeWidth={4} strokeLinecap="round" />
  </Svg>
);

// ============================================================================
// TANDA 3 · EMOJI DE UNICODE 12+ (ES-09) — se pintan como cuadro vacío en
// muchos Android. Aquí el problema no es de criterio clínico sino de
// renderizado: la ficha se ve rota y el niño no ve nada que nombrar.
// ============================================================================

const JabonPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Rect x={16} y={48} width={58} height={32} rx={9} fill="#7cc4f5" stroke={INK} strokeWidth={5} />
    <Path d="M26 60 q8 -6 16 0" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
    {/* burbujas */}
    <Circle cx={74} cy={30} r={11} fill="#ffffff" stroke={INK} strokeWidth={4} />
    <Circle cx={54} cy={22} r={8} fill="#ffffff" stroke={INK} strokeWidth={4} />
    <Circle cx={88} cy={52} r={6} fill="#ffffff" stroke={INK} strokeWidth={3.5} />
  </Svg>
);

const VasoLechePic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M30 22 L70 22 L64 86 L36 86 Z" fill="#eef2f7" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M32 38 L68 38 L63 84 L37 84 Z" fill="#ffffff" />
    <Path d="M30 22 L70 22 L64 86 L36 86 Z" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Line x1={32} y1={38} x2={68} y2={38} stroke={INK} strokeWidth={4} />
  </Svg>
);

const CestaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">{cesta}</Svg>
);

// Objeto neutro, sin el atributo contrastado: el mismo dibujo que usan los
// pares de contraste sirve para nombrar la cosa a secas («cuchara», «vaso»).
const CucharaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">{cuchara}</Svg>
);

const VasoPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">{vaso('#7cc4f5')}</Svg>
);

const AbrazoPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* dos cuerpos que se rodean */}
    <Circle cx={34} cy={32} r={16} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    <Circle cx={66} cy={32} r={16} fill="#f4c9a8" stroke={INK} strokeWidth={5} />
    <Path d="M14 84 q6 -32 20 -32 q14 0 20 20" fill="#00c4be" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M86 84 q-6 -32 -20 -32 q-14 0 -20 20" fill="#f59e0b" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* brazos cruzados */}
    <Path d="M22 62 q28 14 56 0" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <Path d="M78 70 q-28 14 -56 0" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
  </Svg>
);

const RuedaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx={50} cy={50} r={40} fill="#374151" stroke={INK} strokeWidth={5} />
    <Circle cx={50} cy={50} r={20} fill="#cbd5e1" stroke={INK} strokeWidth={5} />
    <Circle cx={50} cy={50} r={6} fill={INK} />
    {/* tacos */}
    <Path d="M50 10 L50 22 M50 78 L50 90 M10 50 L22 50 M78 50 L90 50"
      stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </Svg>
);

const ManosMojadasPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* dos manos abiertas hacia arriba */}
    <Path d="M12 54 q0 -18 10 -18 t10 18 l0 12 q0 14 -14 14 t-14 -14 Z" fill="#fde3c0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M64 54 q0 -18 10 -18 t10 18 l0 12 q0 14 -14 14 t-14 -14 Z" fill="#fde3c0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* gotas */}
    <Path d="M44 20 q7 11 0 15 q-7 -4 0 -15" fill="#3b82f6" stroke={INK} strokeWidth={3} />
    <Path d="M32 40 q5 8 0 11 q-5 -3 0 -11" fill="#7cc4f5" stroke={INK} strokeWidth={2.5} />
    <Path d="M58 44 q5 8 0 11 q-5 -3 0 -11" fill="#7cc4f5" stroke={INK} strokeWidth={2.5} />
  </Svg>
);

const PlumaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M78 14 Q30 26 22 74 Q56 72 70 52 Q80 36 78 14 Z"
      fill="#cfe3f5" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M78 14 L20 86" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <Path d="M62 30 L44 40 M68 44 L48 54 M60 56 L40 64" stroke={INK} strokeWidth={3} opacity={0.5} />
  </Svg>
);

const TuboPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M38 10 L62 10 L62 72 q0 14 -12 14 t-12 -14 Z"
      fill="#eef2f7" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M39 50 L61 50 L61 72 q0 12 -11 12 t-11 -12 Z" fill="#22c55e" />
    <Path d="M38 10 L62 10 L62 72 q0 14 -12 14 t-12 -14 Z"
      fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Line x1={32} y1={10} x2={68} y2={10} stroke={INK} strokeWidth={6} strokeLinecap="round" />
  </Svg>
);

const SaltarPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Suelo />
    <Circle cx={50} cy={22} r={12} fill="#fde3c0" stroke={INK} strokeWidth={5} />
    <Path d="M50 34 L50 56" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    {/* brazos arriba y piernas recogidas */}
    <Path d="M50 40 L30 24 M50 40 L70 24" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <Path d="M50 56 L36 74 M50 56 L64 74" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    {/* arco de salto */}
    <Path d="M18 82 q32 -22 64 0" fill="none" stroke="#16a34a" strokeWidth={4}
      strokeLinecap="round" strokeDasharray="6 6" />
  </Svg>
);

const EsponjaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Rect x={12} y={30} width={76} height={44} rx={12} fill="#f4d35e" stroke={INK} strokeWidth={5} />
    <Circle cx={32} cy={46} r={5} fill="#c9a227" />
    <Circle cx={54} cy={56} r={6} fill="#c9a227" />
    <Circle cx={70} cy={42} r={4.5} fill="#c9a227" />
    <Circle cx={40} cy={64} r={4} fill="#c9a227" />
  </Svg>
);

const LanaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx={46} cy={52} r={34} fill="#f47ba7" stroke={INK} strokeWidth={5} />
    {/* hebras cruzadas */}
    <Path d="M20 34 q26 20 46 40 M14 56 q30 8 52 -18 M34 82 q18 -34 44 -30"
      fill="none" stroke={INK} strokeWidth={3.5} opacity={0.65} />
    {/* hilo suelto */}
    <Path d="M80 52 q14 8 8 24" fill="none" stroke="#f47ba7" strokeWidth={5} strokeLinecap="round" />
  </Svg>
);

const LataPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M28 24 L72 24 L72 78 L28 78 Z" fill="#cbd5e1" stroke={INK} strokeWidth={5} />
    <Ellipse cx={50} cy={24} rx={22} ry={8} fill="#e2e8f0" stroke={INK} strokeWidth={5} />
    <Ellipse cx={50} cy={78} rx={22} ry={8} fill="#cbd5e1" stroke={INK} strokeWidth={5} />
    {/* etiqueta */}
    <Rect x={28} y={40} width={44} height={20} fill="#ef4444" />
    <Line x1={28} y1={40} x2={72} y2={40} stroke={INK} strokeWidth={4} />
    <Line x1={28} y1={60} x2={72} y2={60} stroke={INK} strokeWidth={4} />
  </Svg>
);

// Los siete de una sola aparición. Se dibujan igual porque el criterio de la
// tanda 3 no es la frecuencia sino el riesgo de no verse: un cuadro vacío deja
// la ficha sin nada que nombrar, y da lo mismo que salga una vez o diez.
const CuerdaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M10 70 q16 -34 34 -18 t34 -18" fill="none" stroke="#c98a3c" strokeWidth={11} strokeLinecap="round" />
    <Path d="M10 70 q16 -34 34 -18 t34 -18" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeDasharray="7 9" />
  </Svg>
);

const PapelPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Rect x={24} y={20} width={52} height={46} rx={6} fill="#ffffff" stroke={INK} strokeWidth={5} />
    <Ellipse cx={50} cy={20} rx={26} ry={9} fill="#eef2f7" stroke={INK} strokeWidth={5} />
    <Circle cx={50} cy={20} r={7} fill="#cbd5e1" stroke={INK} strokeWidth={4} />
    {/* hoja colgando */}
    <Path d="M76 44 L90 48 L90 84 L76 80 Z" fill="#ffffff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </Svg>
);

const ManoPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M28 88 L28 42 q0 -7 7 -7 t7 7 L42 26 q0 -7 7 -7 t7 7 L56 32 q0 -6 6 -6 t6 6 L68 36 q0 -5 5 -5 t5 5 L78 70 q0 18 -18 18 Z"
      fill="#fde3c0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </Svg>
);

// El escenario de mañana ilustraba «limpio» con una cuchara 🥄 en los tres
// bancos, cuando su propio visual_prompt pedía «mano abierta y reluciente con
// destellos». El emoji contradecía al dato: ambigüedad de ES-09 de manual.
const ManoLimpiaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M26 90 L26 46 q0 -7 7 -7 t7 7 L40 30 q0 -7 7 -7 t7 7 L54 36 q0 -6 6 -6 t6 6 L66 40 q0 -5 5 -5 t5 5 L76 72 q0 18 -18 18 Z"
      fill="#fde3c0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* destellos: lo que dice «limpia» sin palabras */}
    <Path d="M16 20 L16 34 M9 27 L23 27" stroke="#f4c430" strokeWidth={4.5} strokeLinecap="round" />
    <Path d="M86 22 L86 32 M81 27 L91 27" stroke="#f4c430" strokeWidth={4} strokeLinecap="round" />
    <Path d="M88 56 L88 64 M84 60 L92 60" stroke="#f4c430" strokeWidth={3.5} strokeLinecap="round" />
  </Svg>
);

const PaloPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Rect x={12} y={44} width={76} height={14} rx={7} fill="#b9793a" stroke={INK} strokeWidth={5}
      transform="rotate(-20 50 51)" />
    {/* nudo y ramita */}
    <Circle cx={58} cy={44} r={4} fill={INK} opacity={0.4} />
    <Path d="M64 42 L76 28" stroke="#b9793a" strokeWidth={8} strokeLinecap="round" />
    <Path d="M64 42 L76 28" stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
  </Svg>
);

const SenalarPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* puño con índice extendido hacia el frente */}
    <Path d="M8 46 L46 46 L46 34 q0 -7 7 -7 t7 7 L60 46 q16 0 16 14 L76 72 q0 12 -14 12 L34 84 q-12 0 -12 -12 Z"
      fill="#fde3c0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M84 52 L96 58 L84 64" fill="none" stroke="#16a34a" strokeWidth={5}
      strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const FrioCaraPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx={50} cy={52} r={32} fill="#a8d8f5" stroke={INK} strokeWidth={5} />
    <Circle cx={39} cy={46} r={3.5} fill={INK} />
    <Circle cx={61} cy={46} r={3.5} fill={INK} />
    {/* boca tiritando */}
    <Path d="M38 66 q4 -5 8 0 q4 5 8 0 q4 -5 8 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    {/* copo */}
    <Path d="M84 16 L84 34 M76 20 L92 30 M92 20 L76 30" stroke="#3b82f6" strokeWidth={4} strokeLinecap="round" />
  </Svg>
);

const TortaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Ellipse cx={50} cy={52} rx={38} ry={28} fill="#e8c184" stroke={INK} strokeWidth={5} />
    <Circle cx={38} cy={44} r={4} fill="#c98a3c" />
    <Circle cx={60} cy={56} r={5} fill="#c98a3c" />
    <Circle cx={62} cy={40} r={3.5} fill="#c98a3c" />
    <Circle cx={40} cy={62} r={3.5} fill="#c98a3c" />
  </Svg>
);

// ============================================================================
// CATEGORÍAS LÉXICAS (DC-1 opción C · ES-08)
// Los círculos de color 🟡🟢🟣🟤 y las partes del cuerpo 🦶🦵 son de Unicode 12:
// el mismo riesgo de cuadro vacío que cerró la tanda 3. Se dibujan para no
// reabrirlo con contenido nuevo.
// ============================================================================

// Muestra de color: un disco pleno de contorno grueso. Nada más — cualquier
// adorno compite con lo único que hay que mirar, que es el color.
const colorPic = (fill: string): Pic => {
  const ColorPic: Pic = ({ size }) => (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={38} fill={fill} stroke={INK} strokeWidth={6} />
    </Svg>
  );
  return ColorPic;
};

const PiePic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M30 82 q-8 -22 -2 -38 q5 -14 20 -14 q16 0 20 14 q5 16 -2 38 Z"
      fill="#fde3c0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* dedos */}
    <Circle cx={34} cy={26} r={6} fill="#fde3c0" stroke={INK} strokeWidth={4} />
    <Circle cx={46} cy={21} r={5} fill="#fde3c0" stroke={INK} strokeWidth={4} />
    <Circle cx={56} cy={21} r={4.5} fill="#fde3c0" stroke={INK} strokeWidth={4} />
    <Circle cx={65} cy={24} r={4} fill="#fde3c0" stroke={INK} strokeWidth={4} />
    <Circle cx={72} cy={29} r={3.5} fill="#fde3c0" stroke={INK} strokeWidth={4} />
  </Svg>
);

const BocaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M12 50 q38 -30 76 0 q-38 34 -76 0 Z" fill="#e05070" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* dientes arriba: lo que distingue una boca de unos labios cerrados */}
    <Path d="M22 44 q28 -18 56 0 Z" fill="#ffffff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <Line x1={40} y1={38} x2={40} y2={44} stroke={INK} strokeWidth={2.5} />
    <Line x1={52} y1={36} x2={52} y2={44} stroke={INK} strokeWidth={2.5} />
    <Line x1={64} y1={39} x2={64} y2={44} stroke={INK} strokeWidth={2.5} />
  </Svg>
);

const OjoPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M8 50 q42 -32 84 0 q-42 32 -84 0 Z" fill="#ffffff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <Circle cx={50} cy={50} r={16} fill="#5b8dd6" stroke={INK} strokeWidth={4} />
    <Circle cx={50} cy={50} r={7} fill={INK} />
    <Circle cx={45} cy={45} r={3} fill="#ffffff" />
    {/* pestañas */}
    <Path d="M20 34 L14 26 M50 26 L50 17 M80 34 L86 26" stroke={INK} strokeWidth={4} strokeLinecap="round" />
  </Svg>
);

const RodillaPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* pierna doblada: muslo y pantorrilla */}
    <Path d="M22 12 L22 46 q0 14 14 14 L74 60" fill="none" stroke="#fde3c0" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 12 L22 46 q0 14 14 14 L74 60" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    {/* la rótula, que es lo que se nombra */}
    <Circle cx={30} cy={52} r={11} fill="#f4c9a8" stroke={INK} strokeWidth={5} />
  </Svg>
);

const CodoPic: Pic = ({ size }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path d="M78 14 L78 44 q0 12 -12 12 L26 56" fill="none" stroke="#fde3c0" strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M78 14 L78 44 q0 12 -12 12 L26 56" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={70} cy={50} r={10} fill="#f4c9a8" stroke={INK} strokeWidth={5} />
  </Svg>
);

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

  // Pares de contraste (ES-12). Ocho objetos, dos variantes cada uno: cubren
  // las 20 cápsulas de los tres bancos, porque las tres lenguas contrastan los
  // mismos objetos (osito/hartzatxo, cuchara/koilara, caja/kutxa…) y la clave
  // no depende del idioma.
  'osito-grande': OsitoGrandePic,
  'osito-pequeno': OsitoPequenoPic,
  'cuchara-limpia': CucharaLimpiaPic,
  'cuchara-sucia': CucharaSuciaPic,
  'caja-abierta': CajaAbiertaPic,
  'caja-cerrada': CajaCerradaPic,
  'vaso-frio': VasoFrioPic,
  'vaso-caliente': VasoCalientePic,
  'bombilla-encendida': BombillaEncendidaPic,
  'bombilla-apagada': BombillaApagadaPic,
  'cesta-llena': CestaLlenaPic,
  'cesta-vacia': CestaVaciaPic,
  'coche-subiendo': CocheSubiendoPic,
  'coche-bajando': CocheBajandoPic,
  'juguete-dentro': JugueteDentroPic,
  'juguete-fuera': JugueteFueraPic,

  // Tanda 2 · verbos y acciones. La observación literal de ACOPROS era «algunas
  // imágenes resultan ambiguas (por ejemplo, la de comer)»: un emoji de cara
  // saboreando no dice «comer», dice «qué rico».
  comer: ComerPic,
  dormir: DormirPic,
  soplar: SoplarPic,
  banar: BanarPic,
  vestir: VestirPic,
  correr: CorrerPic,
  nadar: NadarPic,
  parar: PararPic,
  pajaro: PajaroPic,

  // Tanda 3 · emoji de Unicode 12+ que en muchos Android se pintan como cuadro
  // vacío. Aquí el problema no es de criterio clínico sino de renderizado.
  jabon: JabonPic,
  'vaso-leche': VasoLechePic,
  cesta: CestaPic,
  cuchara: CucharaPic,
  vaso: VasoPic,
  abrazo: AbrazoPic,
  rueda: RuedaPic,
  'manos-mojadas': ManosMojadasPic,
  pluma: PlumaPic,
  tubo: TuboPic,
  saltar: SaltarPic,
  esponja: EsponjaPic,
  lana: LanaPic,
  lata: LataPic,
  cuerda: CuerdaPic,
  papel: PapelPic,
  mano: ManoPic,
  'mano-limpia': ManoLimpiaPic,
  palo: PaloPic,
  senalar: SenalarPic,
  'frio-cara': FrioCaraPic,
  torta: TortaPic,

  // Categorías léxicas (DC-1 opción C)
  'color-rojo': colorPic('#e23b3b'),
  'color-azul': colorPic('#2f6fd0'),
  'color-amarillo': colorPic('#f4c430'),
  'color-verde': colorPic('#2fa84f'),
  'color-morado': colorPic('#7c4fd0'),
  'color-marron': colorPic('#8a5a2b'),
  pie: PiePic,
  boca: BocaPic,
  ojo: OjoPic,
  rodilla: RodillaPic,
  codo: CodoPic,
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

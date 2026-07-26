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

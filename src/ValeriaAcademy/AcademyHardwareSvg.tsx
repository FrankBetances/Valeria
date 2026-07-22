// ============================================================================
// Valeria+ · Academy — Esquemas vectoriales de hardware auditivo (V2.0)
// Assets O(1) de RED: apoyo visual construido íntegramente con react-native-svg.
// PROHIBIDO PNG/JPG/vídeo (rompen el binario y dependen de red). Estos esquemas
// son de ALTO CONTRASTE, escalables y de impacto nulo en red/empaquetado.
// Cada componente acepta { size, accent } para integrarse con el acento del
// dominio Hipoacusia sin re-diseñar.
// ============================================================================
import React from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

interface SchemaProps {
  size?: number;
  accent?: string;
}

const INK = '#1f2937';       // trazo principal de alto contraste
const MUTED = '#9aa6a5';     // trazo secundario / anotación
const FILL = '#eef4f8';      // relleno suave

// --- Anatomía del oído ------------------------------------------------------
// Oído externo (pabellón + conducto), tímpano y cóclea en espiral.
export const EarAnatomySvg: React.FC<SchemaProps> = ({ size = 200, accent = '#1f6fb2' }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityRole="image"
    accessibilityLabel="Esquema del oído: pabellón, conducto auditivo, tímpano y cóclea.">
    {/* Pabellón auricular (oído externo) */}
    <Path d="M58 40 C30 46 26 96 44 120 C52 132 50 150 66 158"
      stroke={INK} strokeWidth={5} fill={FILL} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M60 62 C48 68 48 100 62 112" stroke={MUTED} strokeWidth={3} fill="none" strokeLinecap="round" />
    {/* Conducto auditivo */}
    <Line x1="66" y1="100" x2="120" y2="100" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <Line x1="66" y1="112" x2="120" y2="112" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    {/* Tímpano */}
    <Line x1="122" y1="92" x2="122" y2="120" stroke={accent} strokeWidth={6} strokeLinecap="round" />
    {/* Cóclea (espiral) */}
    <Path d="M158 98 a12 12 0 1 1 -12 -1 a7 7 0 1 1 8 1 a3 3 0 1 1 -3 -1"
      stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="151" cy="102" r="2.5" fill={accent} />
    {/* Onda sonora entrando */}
    <Path d="M30 92 q-8 8 0 16 M22 88 q-12 12 0 24" stroke={MUTED} strokeWidth={3} fill="none" strokeLinecap="round" />
    {/* Anotaciones */}
    <SvgText x="40" y="182" fontSize="11" fontWeight="700" fill={MUTED}>Externo</SvgText>
    <SvgText x="112" y="182" fontSize="11" fontWeight="700" fill={MUTED}>Medio</SvgText>
    <SvgText x="150" y="182" fontSize="11" fontWeight="700" fill={accent}>Cóclea</SvgText>
  </Svg>
);

// --- Audífono retroauricular (BTE) ------------------------------------------
// Cuerpo (micrófono + procesador + altavoz), tubo y molde.
export const HearingAidSvg: React.FC<SchemaProps> = ({ size = 200, accent = '#1f6fb2' }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityRole="image"
    accessibilityLabel="Esquema de un audífono retroauricular: cuerpo, tubo y molde.">
    {/* Contorno de oreja de referencia */}
    <Path d="M150 44 C176 52 176 120 150 150 C138 164 120 168 112 158"
      stroke={MUTED} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="4 6" />
    {/* Cuerpo del audífono (forma de banana) */}
    <Path d="M96 46 C70 50 62 96 78 128 C84 140 100 138 104 124 C112 96 118 52 96 46 Z"
      stroke={INK} strokeWidth={5} fill={FILL} strokeLinejoin="round" />
    {/* Micrófono */}
    <Circle cx="92" cy="60" r="5" fill={accent} />
    <SvgText x="30" y="58" fontSize="10.5" fontWeight="700" fill={accent}>Micrófono</SvgText>
    {/* Procesador (chip) */}
    <Rect x="82" y="80" width="16" height="16" rx="3" stroke={INK} strokeWidth={3} fill="#fff" />
    {/* Tubo */}
    <Path d="M84 128 C96 150 120 150 132 138" stroke={accent} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    {/* Molde */}
    <Ellipse cx="140" cy="132" rx="12" ry="9" stroke={INK} strokeWidth={5} fill={FILL} />
    <SvgText x="120" y="182" fontSize="10.5" fontWeight="700" fill={MUTED}>Molde</SvgText>
    <SvgText x="66" y="182" fontSize="10.5" fontWeight="700" fill={MUTED}>Tubo</SvgText>
  </Svg>
);

// --- Implante coclear -------------------------------------------------------
// Procesador externo + antena con imán sobre la cabeza + haz de electrodos.
export const CochlearImplantSvg: React.FC<SchemaProps> = ({ size = 200, accent = '#1f6fb2' }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityRole="image"
    accessibilityLabel="Esquema de un implante coclear: procesador externo, antena con imán y electrodos en la cóclea.">
    {/* Línea de la piel (cabeza) */}
    <Path d="M40 150 C40 70 120 50 168 78" stroke={MUTED} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="4 6" />
    {/* Procesador externo (detrás de la oreja) */}
    <Path d="M60 96 C44 100 40 130 54 150 C60 158 72 156 74 146 C80 122 78 98 60 96 Z"
      stroke={INK} strokeWidth={5} fill={FILL} strokeLinejoin="round" />
    <Circle cx="60" cy="108" r="4" fill={accent} />
    <SvgText x="20" y="176" fontSize="10.5" fontWeight="700" fill={MUTED}>Procesador</SvgText>
    {/* Cable a la antena */}
    <Path d="M72 104 C96 92 110 82 118 80" stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" />
    {/* Antena externa (imán) sobre la cabeza */}
    <Circle cx="124" cy="80" r="12" stroke={INK} strokeWidth={5} fill="#fff" />
    <Circle cx="124" cy="80" r="4" fill={accent} />
    <SvgText x="104" y="46" fontSize="10.5" fontWeight="700" fill={accent}>Antena / imán</SvgText>
    <Line x1="124" y1="52" x2="124" y2="66" stroke={accent} strokeWidth={2} strokeDasharray="2 3" />
    {/* Receptor interno (bajo la piel) */}
    <Circle cx="124" cy="98" r="7" stroke={INK} strokeWidth={4} fill={FILL} />
    {/* Haz de electrodos hacia la cóclea */}
    <Path d="M126 104 C140 116 150 118 154 128 a10 10 0 1 1 -6 6" stroke={accent} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    <SvgText x="132" y="170" fontSize="10.5" fontWeight="700" fill={MUTED}>Electrodos</SvgText>
  </Svg>
);

// --- Implante osteointegrado ------------------------------------------------
// Procesador acoplado a un pilar/imán anclado al hueso; vibración al oído interno.
export const BoneAnchoredSvg: React.FC<SchemaProps> = ({ size = 200, accent = '#1f6fb2' }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityRole="image"
    accessibilityLabel="Esquema de un implante osteointegrado: procesador, pilar anclado al hueso y transmisión por vía ósea.">
    {/* Hueso del cráneo (corte) */}
    <Path d="M150 40 C90 40 60 90 60 150 L92 150 C92 96 112 66 150 66 Z"
      stroke={INK} strokeWidth={5} fill={FILL} strokeLinejoin="round" />
    {/* Piel (línea externa) */}
    <Path d="M156 44 C100 44 72 92 72 150" stroke={MUTED} strokeWidth={3} fill="none" strokeDasharray="4 6" />
    {/* Pilar / tornillo osteointegrado */}
    <Rect x="96" y="78" width="10" height="22" rx="2" stroke={INK} strokeWidth={4} fill="#fff" />
    <Line x1="93" y1="100" x2="109" y2="100" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <SvgText x="30" y="112" fontSize="10.5" fontWeight="700" fill={MUTED}>Pilar (hueso)</SvgText>
    {/* Procesador acoplado */}
    <Circle cx="101" cy="70" r="15" stroke={INK} strokeWidth={5} fill={FILL} />
    <Circle cx="101" cy="70" r="5" fill={accent} />
    <SvgText x="70" y="34" fontSize="10.5" fontWeight="700" fill={accent}>Procesador</SvgText>
    {/* Onda de vibración por vía ósea hacia la cóclea */}
    <Path d="M110 108 q14 10 10 26 q-4 14 8 22" stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="2 5" />
    {/* Cóclea */}
    <Path d="M150 150 a10 10 0 1 1 -6 6 M150 150 a5 5 0 1 0 3 4" stroke={accent} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    <SvgText x="132" y="188" fontSize="10.5" fontWeight="700" fill={MUTED}>Vía ósea</SvgText>
  </Svg>
);

// Selector: devuelve el esquema del dispositivo por su clave.
export const deviceSchemaFor = (
  key: 'audifono' | 'implante' | 'osteo',
): React.FC<SchemaProps> =>
  key === 'audifono' ? HearingAidSvg : key === 'implante' ? CochlearImplantSvg : BoneAnchoredSvg;

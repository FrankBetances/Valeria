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
import { useT } from '../i18n';

interface SchemaProps {
  size?: number;
  accent?: string;
}

const INK = '#1f2937';       // trazo principal de alto contraste
const MUTED = '#5f6b6b';     // trazo secundario / anotación
const FILL = '#eef4f8';      // relleno suave

// --- Anatomía del oído ------------------------------------------------------
// El recorrido del sonido, en cinco pasos numerados: oreja, conducto, tímpano,
// huesecillos y cóclea, y de ahí por el nervio al cerebro. Pedido por las
// logopedas de ACOPROS (11/2026): el esquema anterior no enseñaba el camino.
const STEP_AT: readonly (readonly [number, number])[] = [[52, 44], [112, 86], [150, 70], [186, 86], [238, 62]];

export const EarAnatomySvg: React.FC<SchemaProps> = ({ size = 200, accent = '#1f6fb2' }) => {
  const t = useT();
  return (
  <Svg width={size} height={size * 0.72} viewBox="0 0 320 230" accessibilityRole="image"
    accessibilityLabel={t.academy.schema.earA11y}>
    {/* Onda sonora que llega */}
    <Path d="M22 96 q-9 12 0 24 M12 88 q-15 20 0 40" stroke={MUTED} strokeWidth={3} fill="none" strokeLinecap="round" />
    {/* 1 · Oreja (pabellón) */}
    <Path d="M70 52 C36 58 30 116 50 144 C60 158 58 176 78 184"
      stroke={INK} strokeWidth={5} fill={FILL} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M72 78 C58 86 58 122 74 134" stroke={MUTED} strokeWidth={3} fill="none" strokeLinecap="round" />
    {/* 2 · Conducto auditivo */}
    <Line x1="78" y1="110" x2="146" y2="110" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <Line x1="78" y1="126" x2="146" y2="126" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <Path d="M92 118 h34 m-8 -6 l8 6 l-8 6" stroke={accent} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* 3 · Tímpano */}
    <Line x1="150" y1="98" x2="150" y2="138" stroke={accent} strokeWidth={7} strokeLinecap="round" />
    {/* 4 · Huesecillos: martillo, yunque y estribo */}
    <Path d="M154 116 L170 106 L176 120 L190 114 M190 108 v14" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="170" cy="106" r="4" fill={INK} />
    <Circle cx="176" cy="120" r="4" fill={INK} />
    {/* 5 · Cóclea (caracol) */}
    <Path d="M236 116 a22 22 0 1 1 -22 -2 a14 14 0 1 1 15 2 a7 7 0 1 1 -7 -2"
      stroke={accent} strokeWidth={5} fill={FILL} strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="194" y1="116" x2="210" y2="116" stroke={accent} strokeWidth={3} strokeLinecap="round" />
    {/* Nervio auditivo hacia el cerebro */}
    <Path d="M250 128 C272 140 284 150 300 150 m-9 -7 l9 7 l-9 7" stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <SvgText x="286" y="176" textAnchor="middle" fontSize="12" fontWeight="700" fill={accent}>{t.academy.schema.earBrain}</SvgText>
    {/* Números del recorrido */}
    {STEP_AT.map(([x, y], i) => (
      <React.Fragment key={i}>
        <Circle cx={x} cy={y} r="11" fill={accent} />
        <SvgText x={x} y={y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#ffffff">{String(i + 1)}</SvgText>
      </React.Fragment>
    ))}
    {/* Las tres partes del oído */}
    <SvgText x="68" y="212" textAnchor="middle" fontSize="12" fontWeight="700" fill={MUTED}>{t.academy.schema.earOuter}</SvgText>
    <SvgText x="166" y="212" textAnchor="middle" fontSize="12" fontWeight="700" fill={MUTED}>{t.academy.schema.earMiddle}</SvgText>
    <SvgText x="234" y="212" textAnchor="middle" fontSize="12" fontWeight="700" fill={accent}>{t.academy.schema.earCochlea}</SvgText>
  </Svg>
  );
};

// --- Audífono retroauricular (BTE) ------------------------------------------
// Cuerpo (micrófono + procesador + altavoz), tubo y molde.
export const HearingAidSvg: React.FC<SchemaProps> = ({ size = 200, accent = '#1f6fb2' }) => {
  const t = useT();
  return (
  <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityRole="image"
    accessibilityLabel={t.academy.schema.aidA11y}>
    {/* Contorno de oreja de referencia */}
    <Path d="M150 44 C176 52 176 120 150 150 C138 164 120 168 112 158"
      stroke={MUTED} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="4 6" />
    {/* Cuerpo del audífono (forma de banana) */}
    <Path d="M96 46 C70 50 62 96 78 128 C84 140 100 138 104 124 C112 96 118 52 96 46 Z"
      stroke={INK} strokeWidth={5} fill={FILL} strokeLinejoin="round" />
    {/* Micrófono */}
    <Circle cx="92" cy="60" r="5" fill={accent} />
    <SvgText x="55" y="58" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={accent}>{t.academy.schema.aidMic}</SvgText>
    {/* Procesador (chip) */}
    <Rect x="82" y="80" width="16" height="16" rx="3" stroke={INK} strokeWidth={3} fill="#fff" />
    {/* Tubo */}
    <Path d="M84 128 C96 150 120 150 132 138" stroke={accent} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    {/* Molde */}
    <Ellipse cx="140" cy="132" rx="12" ry="9" stroke={INK} strokeWidth={5} fill={FILL} />
    <SvgText x="135" y="182" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={MUTED}>{t.academy.schema.aidMold}</SvgText>
    <SvgText x="78" y="182" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={MUTED}>{t.academy.schema.aidTube}</SvgText>
  </Svg>
  );
};

// --- Implante coclear -------------------------------------------------------
// Procesador externo + antena con imán sobre la cabeza + haz de electrodos.
export const CochlearImplantSvg: React.FC<SchemaProps> = ({ size = 200, accent = '#1f6fb2' }) => {
  const t = useT();
  return (
  <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityRole="image"
    accessibilityLabel={t.academy.schema.ciA11y}>
    {/* Línea de la piel (cabeza) */}
    <Path d="M40 150 C40 70 120 50 168 78" stroke={MUTED} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="4 6" />
    {/* Procesador externo (detrás de la oreja) */}
    <Path d="M60 96 C44 100 40 130 54 150 C60 158 72 156 74 146 C80 122 78 98 60 96 Z"
      stroke={INK} strokeWidth={5} fill={FILL} strokeLinejoin="round" />
    <Circle cx="60" cy="108" r="4" fill={accent} />
    <SvgText x="48" y="176" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={MUTED}>{t.academy.schema.ciProcessor}</SvgText>
    {/* Cable a la antena */}
    <Path d="M72 104 C96 92 110 82 118 80" stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" />
    {/* Antena externa (imán) sobre la cabeza */}
    <Circle cx="124" cy="80" r="12" stroke={INK} strokeWidth={5} fill="#fff" />
    <Circle cx="124" cy="80" r="4" fill={accent} />
    <SvgText x="136" y="46" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={accent}>{t.academy.schema.ciCoil}</SvgText>
    <Line x1="124" y1="52" x2="124" y2="66" stroke={accent} strokeWidth={2} strokeDasharray="2 3" />
    {/* Receptor interno (bajo la piel) */}
    <Circle cx="124" cy="98" r="7" stroke={INK} strokeWidth={4} fill={FILL} />
    {/* Haz de electrodos hacia la cóclea */}
    <Path d="M126 104 C140 116 150 118 154 128 a10 10 0 1 1 -6 6" stroke={accent} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    <SvgText x="158" y="170" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={MUTED}>{t.academy.schema.ciElectrodes}</SvgText>
  </Svg>
  );
};

// --- Implante osteointegrado ------------------------------------------------
// Procesador acoplado a un pilar/imán anclado al hueso; vibración al oído interno.
export const BoneAnchoredSvg: React.FC<SchemaProps> = ({ size = 200, accent = '#1f6fb2' }) => {
  const t = useT();
  return (
  <Svg width={size} height={size} viewBox="0 0 200 200" accessibilityRole="image"
    accessibilityLabel={t.academy.schema.baA11y}>
    {/* Hueso del cráneo (corte) */}
    <Path d="M150 40 C90 40 60 90 60 150 L92 150 C92 96 112 66 150 66 Z"
      stroke={INK} strokeWidth={5} fill={FILL} strokeLinejoin="round" />
    {/* Piel (línea externa) */}
    <Path d="M156 44 C100 44 72 92 72 150" stroke={MUTED} strokeWidth={3} fill="none" strokeDasharray="4 6" />
    {/* Pilar / tornillo osteointegrado */}
    <Rect x="96" y="78" width="10" height="22" rx="2" stroke={INK} strokeWidth={4} fill="#fff" />
    <Line x1="93" y1="100" x2="109" y2="100" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <SvgText x="62" y="112" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={MUTED}>{t.academy.schema.baAbutment}</SvgText>
    {/* Procesador acoplado */}
    <Circle cx="101" cy="70" r="15" stroke={INK} strokeWidth={5} fill={FILL} />
    <Circle cx="101" cy="70" r="5" fill={accent} />
    <SvgText x="98" y="34" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={accent}>{t.academy.schema.baProcessor}</SvgText>
    {/* Onda de vibración por vía ósea hacia la cóclea */}
    <Path d="M110 108 q14 10 10 26 q-4 14 8 22" stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="2 5" />
    {/* Cóclea */}
    <Path d="M150 150 a10 10 0 1 1 -6 6 M150 150 a5 5 0 1 0 3 4" stroke={accent} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    <SvgText x="154" y="188" textAnchor="middle" fontSize="10.5" fontWeight="700" fill={MUTED}>{t.academy.schema.baBone}</SvgText>
  </Svg>
  );
};

// Selector: devuelve el esquema del dispositivo por su clave.
export const deviceSchemaFor = (
  key: 'audifono' | 'implante' | 'osteo',
): React.FC<SchemaProps> =>
  key === 'audifono' ? HearingAidSvg : key === 'implante' ? CochlearImplantSvg : BoneAnchoredSvg;

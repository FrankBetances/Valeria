// ============================================================================
// Valeria+ · Marcas de las entidades acreditadas en Créditos
//
// Acopros, Quisqueya Habla y el Sello de Calidad ITEMAS · ISCIII. Van en SVG
// como el resto de la iconografía (regla 5 de CLAUDE.md): escalan a cualquier
// densidad y se revisan en el diff.
//
// AVISO: son REDIBUJOS, no los archivos oficiales. Reproducen la forma, el
// color y el gesto de cada marca, no su trazado exacto ni su tipografía. Son
// marcas de terceros: en cuanto haya los originales (SVG o PNG) en `assets/`,
// hay que sustituir estos componentes por el activo real. Vale sobre todo
// para el sello, que es una acreditación con normas de uso propias.
// ============================================================================
import React from 'react';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';

/**
 * Las tres marcas viven dentro de tarjetas que YA se anuncian enteras (nombre
 * + descripción, del catálogo). Por defecto son decorativas: sin esto el
 * lector de pantalla dice dos veces lo mismo. Quien las use suelta les pasa
 * `label`, y el texto sale del catálogo, nunca escrito aquí.
 */
type MarkProps = { size?: number; label?: string };

const a11y = (label?: string) => ({
  accessibilityRole: 'image' as const,
  accessibilityLabel: label,
  accessibilityElementsHidden: !label,
  importantForAccessibility: (label ? 'yes' : 'no-hide-descendants') as 'yes' | 'no-hide-descendants',
});

const ORANGE = '#F5893B';   // naranja Acopros
const RED = '#D8382F';      // onda de voz Quisqueya Habla
const TURQ = '#38C6C6';     // mariposa Quisqueya Habla
const ITEM = '#1069A0';     // azul ITEMAS · ISCIII

/** Acopros · espiral tipo caracola con el destello suelto del original. */
export const AcoprosMark: React.FC<MarkProps> = ({ size = 34, label }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" {...a11y(label)}>
    <Path
      d="M 21.1 9.3 A 13.7 13.7 0 0 1 34.7 23.6 A 9 9 0 0 1 25.2 32.6
         A 6 6 0 0 1 19.3 26.3 A 3.9 3.9 0 0 1 23.5 22.4 A 2.6 2.6 0 0 1 26 25.1"
      fill="none" stroke={ORANGE} strokeWidth={5} strokeLinecap="round"
    />
    <Path
      d="M 33.4 8.4 C 36.6 9.6, 38.6 12, 39.4 15.4"
      fill="none" stroke={ORANGE} strokeWidth={4.2} strokeLinecap="round"
    />
  </Svg>
);

/**
 * Quisqueya Habla · la onda de voz roja que se deshace en la mariposa.
 * Del logotipo original quedan fuera la silueta de la isla y el niño: a 34 px
 * la isla es una barra oscura y el niño una mancha. Se conserva lo que sí
 * sobrevive al tamaño y sigue identificando a la marca.
 */
export const QuisqueyaMark: React.FC<MarkProps> = ({ size = 34, label }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" {...a11y(label)}>
    <Path
      d="M 4.4 39.5 C 6.6 33.6, 10 31, 12.6 31 L 14.8 22.6 L 17.9 34.6 L 20 27.6
         L 22.2 31 C 24.2 31, 25.8 28, 26.8 24.6"
      fill="none" stroke={RED} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round"
    />
    <G fill={TURQ}>
      <Path d="M 34.6 13.6 C 31.6 8, 27.4 4.8, 25.2 7.4 C 23.2 9.8, 28 14.8, 34.6 16.8 Z" />
      <Path d="M 36.4 13.6 C 39.4 8, 43.6 4.8, 45.8 7.4 C 47.8 9.8, 43 14.8, 36.4 16.8 Z" />
      <Path d="M 34.6 18 C 31 18.8, 27.8 21, 28.4 24.2 C 29 27, 32.6 25.4, 34.8 21.4 Z" />
      <Path d="M 36.4 18 C 40 18.8, 43.2 21, 42.6 24.2 C 42 27, 38.4 25.4, 36.2 21.4 Z" />
      <Path d="M 35.5 9.2 C 36.7 12.8, 36.7 21, 35.5 25.2 C 34.3 21, 34.3 12.8, 35.5 9.2 Z" />
      <Circle cx={28.8} cy={21.4} r={1.5} />
      <Circle cx={31} cy={18.4} r={1.1} />
    </G>
    <Path
      d="M 34.9 9.4 C 33.4 6.4, 32 5.3, 30.6 4.9 M 36.1 9.4 C 37.6 6.4, 39 5.3, 40.4 4.9"
      fill="none" stroke={TURQ} strokeWidth={1.5} strokeLinecap="round"
    />
  </Svg>
);

// Escarapela: 13 lóbulos sobre una circunferencia de radio 22.5. Se calcula
// una vez al cargar el módulo, no en cada render.
const ROSETTE = (() => {
  const cx = 32, cy = 30, R = 22.5, n = 13, amp = 4.6;
  const p = (a: number, r: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  let d = '';
  for (let i = 0; i < n; i++) {
    const [x0, y0] = p((i / n) * 2 * Math.PI, R);
    const [x1, y1] = p(((i + 1) / n) * 2 * Math.PI, R);
    const [xm, ym] = p(((i + 0.5) / n) * 2 * Math.PI, R + amp);
    if (i === 0) d += `M ${x0.toFixed(1)} ${y0.toFixed(1)}`;
    d += ` Q ${xm.toFixed(1)} ${ym.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  return `${d} Z`;
})();

/**
 * Sello de Calidad ITEMAS · ISCIII. Sin la tipografía del original —no se
 * reproduce una marca ajena a ojo—: dentro solo va el año, y el resto lo dice
 * el texto de la tarjeta.
 */
export const ItemasSeal: React.FC<MarkProps> = ({ size = 56, label }) => (
  <Svg width={size * 0.78} height={size} viewBox="0 0 64 82" {...a11y(label)}>
    <Path d="M 17 46 L 8 76 L 20 70 L 26 79 L 34 54 Z" fill="none" stroke={ITEM} strokeWidth={3.2} strokeLinejoin="round" />
    <Path d="M 47 46 L 56 76 L 44 70 L 38 79 L 30 54 Z" fill="none" stroke={ITEM} strokeWidth={3.2} strokeLinejoin="round" />
    <Path d={ROSETTE} fill="#ffffff" stroke={ITEM} strokeWidth={3.2} strokeLinejoin="round" />
    <Circle cx={32} cy={30} r={17} fill="none" stroke={ITEM} strokeWidth={2.8} />
    <SvgText x={32} y={35.4} textAnchor="middle" fontSize={14} fontWeight="800" fill={ITEM}>
      2024
    </SvgText>
  </Svg>
);

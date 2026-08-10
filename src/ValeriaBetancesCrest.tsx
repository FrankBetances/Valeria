// ============================================================================
// Valeria+ · Emblema del Dr. Frank Betances
//
// Dos cuervos enfrentados sobre una llave, dentro de un anillo. Sustituye al
// fonendoscopio genérico que llevaba la tarjeta de autor en la pantalla de
// Créditos: aquel era un icono de "médico" de catálogo; este es SU marca.
//
// Va en SVG, no en PNG, por lo mismo que el resto de la iconografía (regla 5
// de CLAUDE.md): escala sin bordes sucios en la densidad que traiga el
// teléfono y se revisa en el diff. Un solo cuervo dibujado, espejado para el
// de la derecha, así que las dos aves son idénticas por construcción.
//
// El ave clara lleva un filete del color de fondo alrededor de la silueta y de
// las patas: sin él se funde con el anillo y con la espiga de la llave, que
// también son blancos.
// ============================================================================
import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { V } from './valeriaTheme';

// Cuervo mirando a la derecha, en la rejilla 0..120 del emblema.
const RAVEN = `
M 58 32
C 53.5 28.6, 49.4 26.4, 45.6 25.6
C 42 20.4, 34.6 19.4, 29.6 23.6
C 26.6 26.2, 24.6 29.4, 23 33
C 20.6 38.4, 18.2 43.4, 15.4 47.8
C 11.6 53.4, 7.4 58, 3 62
L 6.6 64.4
C 10.6 61.4, 14.6 58.6, 18.8 56.2
C 20.4 59.6, 23 62.8, 27 63.8
C 31.8 64.9, 36.6 62.6, 39.4 57.8
C 41.8 53.4, 43.6 45, 45 36.2
C 48.8 34.6, 53 33.4, 56.6 33.2
Z`;

// Ala plegada (borde de coberteras, dos primarias sobre la cola, tres
// escamas de cobertera) y la línea de la comisura del pico.
const FEATHERS = [
  'M26.8 31.5 C 24 37.5, 21.6 44.5, 19 51.5',
  'M19.6 50 C 16.8 54.4, 13 58.2, 9.4 60.8',
  'M22.6 52 C 19.8 56, 16.4 59.4, 12.8 61.6',
  'M29.8 32.6 C 32.6 35.4, 33.6 39, 33 42.8',
  'M28.2 40.6 C 30.6 42.8, 31.4 45.6, 30.8 48.8',
  'M26.4 47.4 C 28.6 49.4, 29.2 52, 28.6 54.8',
  'M46 30 L 55.4 32.4',
];

const LEGS = ['M29.4 62.6 L 28.9 70.6', 'M36.4 61.6 L 37.6 70.6'];
const TOES = [
  'M28.9 70.6 c 2 0.6, 3 1.8, 3.2 3.2',
  'M28.9 70.6 c -1.7 0.6, -2.5 1.5, -2.7 2.6',
  'M37.6 70.6 c 2 0.6, 3 1.8, 3.2 3.2',
  'M37.6 70.6 c -1.7 0.6, -2.5 1.5, -2.7 2.6',
];

const Raven: React.FC<{ fill: string; bg: string }> = ({ fill, bg }) => (
  <G>
    {LEGS.map((d, i) => (
      <Path key={`lh${i}`} d={d} stroke={bg} strokeWidth={4.8} strokeLinecap="round" fill="none" />
    ))}
    {TOES.map((d, i) => (
      <Path key={`th${i}`} d={d} stroke={bg} strokeWidth={3} strokeLinecap="round" fill="none" />
    ))}
    {LEGS.map((d, i) => (
      <Path key={`l${i}`} d={d} stroke={fill} strokeWidth={3.2} strokeLinecap="round" fill="none" />
    ))}
    {TOES.map((d, i) => (
      <Path key={`t${i}`} d={d} stroke={fill} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    ))}
    <Path d={RAVEN} fill={fill} stroke={bg} strokeWidth={1.8} strokeLinejoin="round" />
    {FEATHERS.map((d, i) => (
      <Path key={`f${i}`} d={d} stroke={bg} strokeWidth={1.4} strokeLinecap="round" fill="none" />
    ))}
    <Circle cx={37.4} cy={26.6} r={1.75} fill={bg} />
  </G>
);

interface Props {
  size?: number;
  /** Fondo del disco; también es el color de los filetes y del plumaje. */
  bg?: string;
  ring?: string;
  dark?: string;
  light?: string;
}

export const ValeriaBetancesCrest: React.FC<Props> = ({
  size = 96,
  bg = V.color.primaryDark,
  ring = '#ffffff',
  dark = V.color.dark,
  light = '#ffffff',
}) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Circle cx={60} cy={60} r={60} fill={bg} />
    <Circle cx={60} cy={60} r={51} fill="none" stroke={ring} strokeWidth={3} />
    <G transform="translate(0,3)">
      {/* Llave: espiga, paletón dentado a la izquierda, collarín y ojo
          trilobulado a la derecha. */}
      <Rect x={17} y={70.4} width={83} height={5.2} rx={2.6} fill={ring} />
      <Rect x={20.6} y={74.6} width={17.4} height={7.8} rx={1.4} fill={ring} />
      <Rect x={94.8} y={67} width={3.4} height={12} rx={1.5} fill={ring} />
      <Circle cx={103.4} cy={67.9} r={5} fill={ring} />
      <Circle cx={108.4} cy={73} r={5} fill={ring} />
      <Circle cx={103.4} cy={78.1} r={5} fill={ring} />
      <Rect x={25} y={77.4} width={3.4} height={5.2} fill={bg} />
      <Rect x={31.4} y={77.4} width={3.4} height={5.2} fill={bg} />
      <Circle cx={104.4} cy={73} r={2.7} fill={bg} />

      <Raven fill={dark} bg={bg} />
      <G transform="translate(120,0) scale(-1,1)">
        <Raven fill={light} bg={bg} />
      </G>
    </G>
  </Svg>
);

export default ValeriaBetancesCrest;

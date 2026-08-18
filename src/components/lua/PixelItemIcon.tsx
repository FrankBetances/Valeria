// ============================================================================
// Valeria+ · Lúa · Coleccionable en píxel art
//
// Se pinta con la caja del propio dibujo, no con un lienzo fijo: los sprites se
// dibujan en coordenadas de la gata, así que dentro de un lienzo de 32×38 la
// mayoría quedaban en una esquina y en el armario salían diminutos y flotando.
// ============================================================================
import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { PRECOMPILED_RUNS } from './luaPixelSegments';

interface Props {
  id: string;
  size?: number;
}

export const PixelItemIcon: React.FC<Props> = React.memo(({ id, size = 28 }) => {
  const icon = PRECOMPILED_RUNS.itemIcons[id];
  if (!icon) return null;

  // Lado del píxel entero: con uno fraccionario el antialias abre costuras
  // claras entre filas, que en un dibujo de borde duro se ven como rayas.
  const cell = Math.max(1, Math.floor(size / Math.max(icon.w, icon.h)));

  return (
    <Svg width={cell * icon.w} height={cell * icon.h} viewBox={`0 0 ${icon.w} ${icon.h}`}>
      {icon.runs.map((r) => (
        <Rect key={`${id}-${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
      ))}
    </Svg>
  );
});

PixelItemIcon.displayName = 'PixelItemIcon';

export default PixelItemIcon;

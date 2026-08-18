// ============================================================================
// Valeria+ · Lúa · Componente SVG de accesorio / coleccionable en píxel art
//
// Dibuja los accesorios en píxel art nativo SVG con la paleta expandida.
// Sustituye a los emojis de sistema manteniendo 60 fps y renderizado vectorial duro.
// ============================================================================
import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { PRECOMPILED_RUNS } from './luaPixelSegments';

interface Props {
  id: string;
  size?: number;
}

export const PixelItemIcon: React.FC<Props> = React.memo(({ id, size = 28 }) => {
  const runs = PRECOMPILED_RUNS.items[id];
  if (!runs) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {runs.map((r) => (
        <Rect
          key={`${id}-${r.x}-${r.y}`}
          x={r.x}
          y={r.y}
          width={r.w + 0.1}
          height={1.1}
          fill={r.fill}
        />
      ))}
    </Svg>
  );
});

PixelItemIcon.displayName = 'PixelItemIcon';

export default PixelItemIcon;

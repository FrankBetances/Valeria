// ============================================================================
// Valeria+ · Set de iconos de los bloques (v11)
//
// Sustituye a los emoji del sistema (👂 💬 🧠 📖 🗣️ 🧩 🎯). Un emoji lo dibuja
// el fabricante del teléfono: cambia de estilo, de peso y de paleta entre
// Android, iOS y web, así que siete emoji juntos NUNCA forman un set. Se veían
// pegados, no diseñados.
//
// Estos son trazo puro sobre una rejilla común de 24, con el mismo grosor
// (1.9), las mismas terminaciones redondeadas y sin relleno. Toman el color
// del bloque por `color`, de modo que la placa del icono y la barra de
// progreso de la tarjeta hablan el mismo idioma cromático.
//
// react-native-svg ya era dependencia del proyecto (lo usan las láminas de
// Academy), así que el set no añade peso ni superficie nativa nueva.
// ============================================================================
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type BlockIconName =
  | 'pairs' | 'semantic' | 'hearing' | 'language' | 'autism' | 'dyslexia' | 'ar'
  // Marcadores de juego: mismo trazo y misma rejilla que los bloques, para que
  // la tira de racha y nivel no vuelva a ser dos emoji sueltos entre iconos.
  | 'streak' | 'level'
  // Barra de pestañas: mismo set, para que la navegación no vuelva a mezclar
  // emoji del sistema con iconos dibujados.
  | 'tabTherapies' | 'tabAcademy' | 'tabSettings';

interface Props { name: BlockIconName; color: string; size?: number; }

const SW = 1.9; // grosor único de todo el set

export const BlockIcon: React.FC<Props> = ({ name, color, size = 26 }) => {
  const common = {
    stroke: color,
    strokeWidth: SW,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Pares mínimos · dos círculos que se solapan: dos palabras que solo se
          distinguen en un fonema. La intersección ES el contraste. */}
      {name === 'pairs' && (
        <>
          <Circle cx="9.2" cy="12" r="5.6" {...common} />
          <Circle cx="14.8" cy="12" r="5.6" {...common} />
        </>
      )}

      {/* Expansión semántica · un núcleo léxico del que salen ramas. */}
      {name === 'semantic' && (
        <>
          <Circle cx="12" cy="12" r="2.6" {...common} />
          <Circle cx="5.2" cy="5.6" r="2.1" {...common} />
          <Circle cx="18.8" cy="5.6" r="2.1" {...common} />
          <Circle cx="12" cy="20.2" r="2.1" {...common} />
          <Path d="M10.2 10.2 6.8 7" {...common} />
          <Path d="M13.8 10.2 17.2 7" {...common} />
          <Path d="M12 14.6v3.5" {...common} />
        </>
      )}

      {/* Audición · oreja con su hélice interior. */}
      {name === 'hearing' && (
        <>
          <Path d="M6.5 8.8a5.7 5.7 0 0 1 11.4 0c0 5.2-5.2 5.2-5.2 8.7a3 3 0 1 1-6 0v-.9" {...common} />
          <Path d="M14.8 8.8a2.6 2.6 0 0 0-5.2 0v1a2 2 0 0 1-2 2" {...common} />
        </>
      )}

      {/* Lenguaje · bocadillo con dos renglones. */}
      {name === 'language' && (
        <>
          <Path d="M20.5 14.6a2.4 2.4 0 0 1-2.4 2.4H8.2L4 20.6V5.9a2.4 2.4 0 0 1 2.4-2.4h11.7a2.4 2.4 0 0 1 2.4 2.4z" {...common} />
          <Path d="M8.2 8.6h8.1" {...common} />
          <Path d="M8.2 12.2h5.2" {...common} />
        </>
      )}

      {/* TEA · dos figuras: la atención conjunta es de dos, nunca de uno. */}
      {name === 'autism' && (
        <>
          <Path d="M15.4 20.4v-1.8a3.6 3.6 0 0 0-3.6-3.6H6.4a3.6 3.6 0 0 0-3.6 3.6v1.8" {...common} />
          <Circle cx="9.1" cy="7.6" r="3.6" {...common} />
          <Path d="M21.2 20.4v-1.8a3.6 3.6 0 0 0-2.7-3.5" {...common} />
          <Path d="M15.8 4.2a3.6 3.6 0 0 1 0 7" {...common} />
        </>
      )}

      {/* Dislexia · libro abierto por el centro. */}
      {name === 'dyslexia' && (
        <>
          <Path d="M2.8 4.2h5.1a3.4 3.4 0 0 1 3.4 3.4v12a2.6 2.6 0 0 0-2.6-2.6H2.8z" {...common} />
          <Path d="M21.2 4.2h-5.1a3.4 3.4 0 0 0-3.4 3.4v12a2.6 2.6 0 0 1 2.6-2.6h5.9z" {...common} />
        </>
      )}

      {/* Racha · llama. */}
      {name === 'streak' && (
        <Path d="M8.6 14.4a2.4 2.4 0 0 0 2.4-2.4c0-1.3-.5-1.9-1-2.9-1-2 -.2-3.9 1.9-5.7.5 2.4 1.9 4.7 3.8 6.2 1.9 1.5 2.9 3.4 2.9 5.3a6.7 6.7 0 1 1-13.4 0c0-1.1.4-2.2 1-2.9a2.4 2.4 0 0 0 2.4 2.4z" {...common} />
      )}

      {name === 'level' && (
        <>
          <Circle cx="12" cy="8.6" r="5.4" {...common} />
          <Path d="M15.2 13.2 16.6 21 12 18.3 7.4 21l1.4-7.8" {...common} />
        </>
      )}

      {/* Pestaña Terapias · la propia cuadrícula del hub. */}
      {name === 'tabTherapies' && (
        <>
          <Rect x="3.4" y="3.4" width="7.2" height="7.2" rx="2.2" {...common} />
          <Rect x="13.4" y="3.4" width="7.2" height="7.2" rx="2.2" {...common} />
          <Rect x="3.4" y="13.4" width="7.2" height="7.2" rx="2.2" {...common} />
          <Rect x="13.4" y="13.4" width="7.2" height="7.2" rx="2.2" {...common} />
        </>
      )}

      {/* Pestaña Academy · birrete. */}
      {name === 'tabAcademy' && (
        <>
          <Path d="M12 3.6 2.6 8.4 12 13.2l9.4-4.8z" {...common} />
          <Path d="M6.6 10.6v4.6c0 1.7 2.4 3.1 5.4 3.1s5.4-1.4 5.4-3.1v-4.6" {...common} />
        </>
      )}

      {/* Pestaña Ajustes · controles deslizantes. */}
      {name === 'tabSettings' && (
        <>
          <Path d="M4 7.2h8.6" {...common} />
          <Path d="M17.4 7.2H20" {...common} />
          <Circle cx="15" cy="7.2" r="2.2" {...common} />
          <Path d="M4 16.8h5.6" {...common} />
          <Path d="M14.4 16.8H20" {...common} />
          <Circle cx="12" cy="16.8" r="2.2" {...common} />
        </>
      )}

      {/* Realidad aumentada · marco de encuadre con el punto de fijación. */}
      {name === 'ar' && (
        <>
          <Path d="M3.4 7.6V5.4a2 2 0 0 1 2-2h2.2" {...common} />
          <Path d="M16.4 3.4h2.2a2 2 0 0 1 2 2v2.2" {...common} />
          <Path d="M20.6 16.4v2.2a2 2 0 0 1-2 2h-2.2" {...common} />
          <Path d="M7.6 20.6H5.4a2 2 0 0 1-2-2v-2.2" {...common} />
          <Circle cx="12" cy="12" r="3.1" {...common} />
        </>
      )}
    </Svg>
  );
};

export default BlockIcon;

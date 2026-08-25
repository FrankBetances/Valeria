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
  | 'tabTherapies' | 'tabAcademy' | 'tabSettings'
  // Lista prescribible: sustituyen a 🎯 ℹ️ 👶 🔒 ▶ ✓, que era la última
  // pantalla donde quedaban emoji del sistema haciendo de iconografía.
  | 'session' | 'info' | 'age' | 'lock' | 'play' | 'check'
  // Reproductor de sesión: los emoji que marcaban los pasos del turno
  // (📢 🔊 🎤 💡 🔄 🔍 🏃 🧺 ➡️ 🙈 ❌). Son los MISMOS pasos en todos los
  // bloques, así que tienen que ser un set, no seis dibujos de seis fabricantes.
  | 'speaker' | 'mic' | 'tip' | 'repeat' | 'zoom' | 'move' | 'material'
  | 'next' | 'eye' | 'eyeOff' | 'cross'
  // Quiebre pragmático: las seis estrategias de reparación que el adulto
  // marca tras el estresor. Son un enum clínico cerrado que viaja en la
  // telemetría, así que sus iconos también tienen que ser un set.
  | 'gesture' | 'door' | 'tear' | 'blank' | 'warn' | 'heart'
  // Voz y ruido: nube (reconocedor del sistema) y altavoz tachado (silencio).
  | 'cloud' | 'speakerOff'
  // Pantallas del adulto: ficha, pacientes, ajustes, resultados y la escala SUS.
  | 'bell' | 'folder' | 'plus' | 'chart' | 'clinical' | 'family'
  | 'moodBad' | 'moodPoor' | 'moodOk' | 'moodGood' | 'moodGreat'
  // Academy: guías de dominio y cuidado de los dispositivos auditivos.
  | 'compass' | 'timer' | 'drop' | 'magnet' | 'battery'
  // Integración Sensorial Auditiva: estimulación, modulación, entornos y calma.
  | 'sensory' | 'sensory_ear' | 'noise_filter' | 'sensory_anticipation' | 'calm_breath'
  | 'classroom' | 'mall' | 'street'
  // Grafomotricidad y Escritura: lápiz y borrador
  | 'pencil' | 'eraser';

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

      {/* Sesión completa · diana: los ejercicios prescritos, uno detrás de otro. */}
      {name === 'session' && (
        <>
          <Circle cx="12" cy="12" r="8.6" {...common} />
          <Circle cx="12" cy="12" r="4.6" {...common} />
          <Circle cx="12" cy="12" r="1" {...common} />
        </>
      )}

      {/* Ficha del protocolo · información. */}
      {name === 'info' && (
        <>
          <Circle cx="12" cy="12" r="8.8" {...common} />
          <Path d="M12 11v5.2" {...common} />
          <Path d="M12 7.8v.1" {...common} />
        </>
      )}

      {/* Banda de edad · silueta de cabeza pequeña. */}
      {name === 'age' && (
        <>
          <Circle cx="12" cy="8.4" r="3.9" {...common} />
          <Path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" {...common} />
        </>
      )}

      {/* Prescripción bloqueada · candado. */}
      {name === 'lock' && (
        <>
          <Rect x="4.6" y="10.6" width="14.8" height="9.6" rx="2.4" {...common} />
          <Path d="M8.2 10.6V7.9a3.8 3.8 0 0 1 7.6 0v2.7" {...common} />
        </>
      )}

      {/* Practicar · triángulo de reproducción. */}
      {name === 'play' && (
        <Path d="M8.4 5.6 18.6 12 8.4 18.4z" {...common} />
      )}

      {/* Guardado · marca de verificación. */}
      {name === 'check' && (
        <Path d="M4.8 12.6l4.8 4.8 9.6-10.8" {...common} />
      )}

      {/* Escuchar · altavoz con dos ondas. El más repetido de la app: va en
          cada botón de «oír» de todas las pantallas de voz. */}
      {name === 'speaker' && (
        <>
          <Path d="M4 9.4h3.4L12 5.2v13.6L7.4 14.6H4z" {...common} />
          <Path d="M15.6 9.6a3.4 3.4 0 0 1 0 4.8" {...common} />
          <Path d="M18.2 7a7 7 0 0 1 0 10" {...common} />
        </>
      )}

      {/* Turno del niño · micrófono. */}
      {name === 'mic' && (
        <>
          <Rect x="9.2" y="2.8" width="5.6" height="10.4" rx="2.8" {...common} />
          <Path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0" {...common} />
          <Path d="M12 17.6v3.6" {...common} />
        </>
      )}

      {/* Consejo para el adulto · bombilla. */}
      {name === 'tip' && (
        <>
          <Circle cx="12" cy="9.6" r="5.4" {...common} />
          <Path d="M9.4 16.6h5.2" {...common} />
          <Path d="M10.3 19.4h3.4" {...common} />
        </>
      )}

      {/* Otra ronda · dos flechas en bucle. */}
      {name === 'repeat' && (
        <>
          <Path d="M3.6 12a8.4 8.4 0 0 1 14.3-6" {...common} />
          <Path d="M20.4 12a8.4 8.4 0 0 1-14.3 6" {...common} />
          <Path d="M18.2 2.6v3.6h-3.6" {...common} />
          <Path d="M5.8 21.4v-3.6h3.6" {...common} />
        </>
      )}

      {/* Ampliar la ficha · lupa. */}
      {name === 'zoom' && (
        <>
          <Circle cx="10.6" cy="10.6" r="6.6" {...common} />
          <Path d="M15.4 15.4 20.6 20.6" {...common} />
        </>
      )}

      {/* Versión en movimiento · figura andando. */}
      {name === 'move' && (
        <>
          <Circle cx="13.4" cy="4.6" r="2.1" {...common} />
          <Path d="M8.4 20.6l2.6-5.2 3-2 1.4 3.4 3.2 1.4" {...common} />
          <Path d="M11 15.4 9.6 11l-4 1.8" {...common} />
        </>
      )}

      {/* Necesitarás · bandeja de material. */}
      {name === 'material' && (
        <>
          <Path d="M3.2 9.6h17.6l-1.8 9a2 2 0 0 1-2 1.6H7a2 2 0 0 1-2-1.6z" {...common} />
          <Path d="M8.4 9.6 10.6 3.6" {...common} />
          <Path d="M15.6 9.6 13.4 3.6" {...common} />
        </>
      )}

      {/* Siguiente ejercicio · flecha. */}
      {name === 'next' && (
        <>
          <Path d="M4.4 12h14.4" {...common} />
          <Path d="M13.4 6.6 18.8 12l-5.4 5.4" {...common} />
        </>
      )}

      {/* Palabra a la vista / oculta · ojo. */}
      {name === 'eye' && (
        <>
          <Path d="M2.4 12s3.6-6.6 9.6-6.6S21.6 12 21.6 12s-3.6 6.6-9.6 6.6S2.4 12 2.4 12z" {...common} />
          <Circle cx="12" cy="12" r="2.9" {...common} />
        </>
      )}
      {name === 'eyeOff' && (
        <>
          <Path d="M6.6 6.9C4 8.6 2.4 12 2.4 12s3.6 6.6 9.6 6.6c2 0 3.7-.7 5.1-1.6" {...common} />
          <Path d="M9.9 5.7A9.9 9.9 0 0 1 12 5.4c6 0 9.6 6.6 9.6 6.6a17 17 0 0 1-2.8 3.7" {...common} />
          <Path d="M9.9 9.9a2.9 2.9 0 0 0 4.2 4.2" {...common} />
          <Path d="M3.6 3.6 20.4 20.4" {...common} />
        </>
      )}

      {/* Respuesta incorrecta · aspa. Pareja de `check`. */}
      {name === 'cross' && (
        <>
          <Path d="M6.4 6.4 17.6 17.6" {...common} />
          <Path d="M17.6 6.4 6.4 17.6" {...common} />
        </>
      )}

      {/* Reparación por gesto · mano levantada. */}
      {name === 'gesture' && (
        <>
          <Path d="M7.6 20.4v-7.2a2.2 2.2 0 0 1 4.4 0" {...common} />
          <Path d="M12 13.2V6.4a2.2 2.2 0 0 1 4.4 0v8.4" {...common} />
          <Path d="M16.4 12.4a2.2 2.2 0 0 1 4 1.2v3.2a4.4 4.4 0 0 1-4.4 4.4h-3.6" {...common} />
        </>
      )}

      {/* Aislamiento · puerta. */}
      {name === 'door' && (
        <>
          <Rect x="5.4" y="3.2" width="13.2" height="17.6" rx="2.2" {...common} />
          <Circle cx="14.8" cy="12" r="1.1" {...common} />
        </>
      )}

      {/* Llanto · lágrima. */}
      {name === 'tear' && (
        <Path d="M12 3.4c3.6 4.4 6 7.6 6 10.4a6 6 0 1 1-12 0c0-2.8 2.4-6 6-10.4z" {...common} />
      )}

      {/* Sin respuesta · círculo con la línea del silencio. */}
      {name === 'blank' && (
        <>
          <Circle cx="12" cy="12" r="8.8" {...common} />
          <Path d="M7.8 12h8.4" {...common} />
        </>
      )}

      {/* Aviso · triángulo con la marca de atención. */}
      {name === 'warn' && (
        <>
          <Path d="M12 3.8 21.4 20H2.6z" {...common} />
          <Path d="M12 10.2v4.2" {...common} />
          <Path d="M12 17.2v.1" {...common} />
        </>
      )}

      {/* Cierre en calma · corazón. */}
      {name === 'heart' && (
        <Path d="M12 20.4 4.6 13a4.6 4.6 0 0 1 7.4-5.3 4.6 4.6 0 0 1 7.4 5.3z" {...common} />
      )}

      {/* Reconocimiento en el servicio del sistema · nube. */}
      {name === 'cloud' && (
        <Path d="M17.6 18.4H7a4.4 4.4 0 0 1-.6-8.76 6 6 0 0 1 11.5 1.6 3.6 3.6 0 0 1-.3 7.16z" {...common} />
      )}

      {/* Silencio · altavoz tachado. */}
      {name === 'speakerOff' && (
        <>
          <Path d="M4 9.4h3.4L12 5.2v13.6L7.4 14.6H4z" {...common} />
          <Path d="M16.2 9.8 20.6 14.2" {...common} />
          <Path d="M20.6 9.8 16.2 14.2" {...common} />
        </>
      )}

      {/* Recordatorios · campana. */}
      {name === 'bell' && (
        <>
          <Path d="M18.4 15.2V10a6.4 6.4 0 1 0-12.8 0v5.2L3.8 18h16.4z" {...common} />
          <Path d="M10 21a2.4 2.4 0 0 0 4 0" {...common} />
        </>
      )}

      {/* Pacientes guardados · carpeta. */}
      {name === 'folder' && (
        <Path d="M3.2 19.4V6.2a1.8 1.8 0 0 1 1.8-1.8h4l2.4 2.8h6.8a1.8 1.8 0 0 1 1.8 1.8v10.4a1.8 1.8 0 0 1-1.8 1.8H5a1.8 1.8 0 0 1-1.8-1.8z" {...common} />
      )}

      {/* Añadir · cruz. */}
      {name === 'plus' && (
        <>
          <Path d="M12 5.2v13.6" {...common} />
          <Path d="M5.2 12h13.6" {...common} />
        </>
      )}

      {/* Resultados · barras. */}
      {name === 'chart' && (
        <>
          <Path d="M4 20.4V13" {...common} />
          <Path d="M9.4 20.4V7.6" {...common} />
          <Path d="M14.8 20.4v-5.6" {...common} />
          <Path d="M20.2 20.4V4.4" {...common} />
        </>
      )}

      {/* Diagnóstico · fonendoscopio simplificado. */}
      {name === 'clinical' && (
        <>
          <Path d="M6.2 3.6v5.2a4.6 4.6 0 0 0 9.2 0V3.6" {...common} />
          <Path d="M10.8 13.4v2.4a4.4 4.4 0 0 0 8.8 0v-1.6" {...common} />
          <Circle cx="19.6" cy="12.4" r="2" {...common} />
        </>
      )}

      {/* Cuidador · adulto y menor. */}
      {name === 'family' && (
        <>
          <Circle cx="8.4" cy="6.6" r="3.2" {...common} />
          <Path d="M3 20.4v-2.2a5.4 5.4 0 0 1 10.8 0v2.2" {...common} />
          <Circle cx="17.6" cy="10.4" r="2.4" {...common} />
          <Path d="M14 20.4v-1.6a3.6 3.6 0 0 1 7.2 0v1.6" {...common} />
        </>
      )}

      {/* Escala SUS · cinco caras. El instrumento es de cinco puntos y la cara
          es su ayuda visual; con emoji, cada teléfono dibujaba otras cinco. */}
      {(name === 'moodBad' || name === 'moodPoor' || name === 'moodOk'
        || name === 'moodGood' || name === 'moodGreat') && (
        <>
          <Circle cx="12" cy="12" r="8.8" {...common} />
          <Path d="M9 9.6v.1" {...common} />
          <Path d="M15 9.6v.1" {...common} />
          {name === 'moodBad' && <Path d="M8.4 16.6a4.6 4.6 0 0 1 7.2 0" {...common} />}
          {name === 'moodPoor' && <Path d="M8.8 15.8a4 4 0 0 1 6.4 0" {...common} />}
          {name === 'moodOk' && <Path d="M8.6 15.2h6.8" {...common} />}
          {name === 'moodGood' && <Path d="M8.8 14.4a4 4 0 0 0 6.4 0" {...common} />}
          {name === 'moodGreat' && <Path d="M8.2 13.8a4.8 4.8 0 0 0 7.6 0" {...common} />}
        </>
      )}

      {/* Orientación · brújula. */}
      {name === 'compass' && (
        <>
          <Circle cx="12" cy="12" r="8.8" {...common} />
          <Path d="M15.4 8.6 13.8 13.8 8.6 15.4l1.6-5.2z" {...common} />
        </>
      )}

      {/* Rutina y tiempos · cronómetro. */}
      {name === 'timer' && (
        <>
          <Circle cx="12" cy="13.4" r="7.6" {...common} />
          <Path d="M12 9.6v3.8l2.4 1.6" {...common} />
          <Path d="M9.4 2.6h5.2" {...common} />
        </>
      )}

      {/* Limpieza · gota. */}
      {name === 'drop' && (
        <Path d="M12 3.4c3.4 4.2 5.6 7.2 5.6 9.8a5.6 5.6 0 1 1-11.2 0c0-2.6 2.2-5.6 5.6-9.8z" {...common} />
      )}

      {/* Imán del implante · herradura. */}
      {name === 'magnet' && (
        <>
          <Path d="M5.4 19.4V10a6.6 6.6 0 0 1 13.2 0v9.4" {...common} />
          <Path d="M5.4 14.6h4.4" {...common} />
          <Path d="M14.2 14.6h4.4" {...common} />
        </>
      )}

      {/* Pilas · batería. */}
      {name === 'battery' && (
        <>
          <Rect x="2.8" y="7.6" width="15.6" height="8.8" rx="2.2" {...common} />
          <Path d="M21.2 10.6v2.8" {...common} />
          <Path d="M6.4 10.8v2.4" {...common} />
          <Path d="M10 10.8v2.4" {...common} />
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

      {/* Integración Sensorial Auditiva · oreja con ondas suaves concéntricas */}
      {(name === 'sensory' || name === 'sensory_ear') && (
        <>
          <Path d="M6 8.5a5.5 5.5 0 0 1 11 0c0 5-5 5-5 8.5a3 3 0 1 1-6 0v-.9" {...common} />
          <Path d="M14 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 0 1-2 2" {...common} />
          <Path d="M18.5 6a8 8 0 0 1 0 9" {...common} />
        </>
      )}

      {/* Filtro de ruido / ecualización */}
      {name === 'noise_filter' && (
        <>
          <Path d="M4 6h16" {...common} />
          <Path d="M4 12h16" {...common} />
          <Path d="M4 18h16" {...common} />
          <Circle cx="8" cy="6" r="2.2" {...common} />
          <Circle cx="16" cy="12" r="2.2" {...common} />
          <Circle cx="10" cy="18" r="2.2" {...common} />
        </>
      )}

      {/* Anticipación sensorial · reloj de anticipación */}
      {name === 'sensory_anticipation' && (
        <>
          <Circle cx="12" cy="13" r="8" {...common} />
          <Path d="M12 9v4l2.5 2" {...common} />
          <Path d="M10 2.5h4" {...common} />
        </>
      )}

      {/* Respiración de calma / autorregulación */}
      {name === 'calm_breath' && (
        <>
          <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" {...common} />
        </>
      )}

      {/* Aula de colegio · escuela / pupitre y pizarra */}
      {name === 'classroom' && (
        <>
          <Path d="M4 19h16" {...common} />
          <Path d="M4 15V8l8-4 8 4v7" {...common} />
          <Path d="M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" {...common} />
          <Path d="M10 19v-4h4v4" {...common} />
        </>
      )}

      {/* Centro comercial / Supermercado · tienda con toldo y bolsa */}
      {name === 'mall' && (
        <>
          <Path d="M3 9l2-5h14l2 5" {...common} />
          <Path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" {...common} />
          <Path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" {...common} />
          <Path d="M10 16h4" {...common} />
        </>
      )}

      {/* Calle viva / Tráfico y obras · coche en carretera */}
      {name === 'street' && (
        <>
          <Path d="M5 17h14" {...common} />
          <Path d="M6 13l2-5h8l2 5" {...common} />
          <Rect x="4" y="11" width="16" height="6" rx="2" {...common} />
          <Circle cx="7.5" cy="17" r="2" {...common} />
          <Circle cx="16.5" cy="17" r="2" {...common} />
        </>
      )}

      {/* Lápiz · trazado de grafomotricidad y escritura */}
      {name === 'pencil' && (
        <>
          <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" {...common} />
          <Path d="M15 5l4 4" {...common} />
        </>
      )}

      {/* Borrador · limpiar trazo */}
      {name === 'eraser' && (
        <>
          <Path d="M20 20H7L3 16a2 2 0 0 1 0-2.83l9.17-9.17a2 2 0 0 1 2.83 0L21 10a2 2 0 0 1 0 2.83L14 20" {...common} />
          <Path d="M6 17l6-6" {...common} />
        </>
      )}
    </Svg>
  );
};

export default BlockIcon;

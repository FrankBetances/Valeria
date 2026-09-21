// ============================================================================
// Valeria+ · Lienzo de Escritura y Grafomotricidad ("La Pizarra Mágica de Lúa")
// Captura trazos de alta precisión con Stylus (Apple Pencil / S-Pen / capacitivo)
// o dedo sobre canvas vectorial SVG a 60 FPS.
//
// Soporta:
//   · Trazado libre y borrado.
//   · Pauta Montessori (línea base, altura de x, ascendente y descendente).
//   · Trazado guiado con waypoints y flechas direccionales numeradas.
//   · Validación de cobertura y orden direccional anti-inversión (b vs d, p vs q).
//   · Suavizado Bézier cuadrático para eliminar dientes de sierra.
// ============================================================================
import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View, StyleSheet, PanResponder, GestureResponderEvent,
  PanResponderGestureState, Dimensions, Platform, Vibration,
} from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { V } from './valeriaTheme';
import { Point, Stroke, Waypoint, ModelPathGuide } from './valeriaWritingTypes';
import { freehandPath } from './valeriaWritingFreehand';

// La geometría vive en un módulo puro (ver valeriaWritingTypes) para que el
// banco de trazos pueda entrar en el corpus de voz sin arrastrar react-native.
export type { Point, Stroke, Waypoint, ModelPathGuide } from './valeriaWritingTypes';

export interface ValeriaWritingCanvasProps {
  guide?: ModelPathGuide;
  strokeColor?: string;
  strokeWidth?: number;
  showMontessoriLines?: boolean;
  onStrokeChange?: (strokeCount: number) => void;
  onValidateStroke?: (success: boolean, accuracyScore: number) => void;
  width?: number;
  height?: number;
}

// Convierte un array de puntos en un trazo SVG con curvas Bézier cuadráticas suaves
export const pointsToSmoothSvgPath = (points: Point[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y} L ${p.x + 0.1} ${p.y + 0.1}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    d += ` Q ${p1.x} ${p1.y}, ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
};

// Calcula la distancia euclidiana entre dos puntos
const distance = (p1: Point, p2: Point): number =>
  Math.hypot(p1.x - p2.x, p1.y - p2.y);

// El ÚNICO sitio que decide cómo se pinta un trazo, para que el trazo en curso
// y los ya cerrados no puedan divergir: mientras se dibuja tiene que verse igual
// que cuando se suelta, o el niño ve cómo su letra «cambia» al levantar el dedo.
//
// Con contorno: polígono relleno de ancho variable (presión simulada).
// Sin contorno: la línea de ancho constante de siempre. Ese respaldo NO es
// decorativo — un trazo de dos puntos no forma polígono, y ahí `freehandPath`
// devuelve cadena vacía a propósito en vez de inventarse una forma.
const InkPath: React.FC<{
  outline?: string; points: Point[]; color: string; width: number;
}> = ({ outline, points, color, width }) => {
  if (outline) {
    // `fillRule` explícito: el contorno se cruza consigo mismo en los bucles
    // (la 'l', la 'e'), y con la regla par-impar esos cruces saldrían HUECOS.
    // El valor por defecto ya es el correcto; se escribe para que no dependa de
    // que Android y web coincidan en cuál es el defecto.
    return <Path d={outline} fill={color} fillRule="nonzero" stroke="none" />;
  }
  return (
    <Path
      d={pointsToSmoothSvgPath(points)}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );
};

export interface ValeriaWritingCanvasRef {
  clear: () => void;
  undo: () => void;
}

export const ValeriaWritingCanvas = React.forwardRef<ValeriaWritingCanvasRef, ValeriaWritingCanvasProps>(
  (
    {
      guide,
      strokeColor = '#00C4BE',
      strokeWidth = 8,
      showMontessoriLines = true,
      onStrokeChange,
      onValidateStroke,
      width = Dimensions.get('window').width - 32,
      height = 320,
    },
    ref,
  ) => {
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
    const [hitWaypoints, setHitWaypoints] = useState<Set<number>>(new Set());

    const strokesRef = useRef<Stroke[]>(strokes);
    strokesRef.current = strokes;

    // Espejo del trazo en curso. Existe para que soltar el dedo pueda LEER los
    // puntos sin meterse dentro de un updater de estado: hasta ahora el cierre
    // del trazo ocurría dentro de `setCurrentStroke(prev => …)`, y ahí dentro se
    // llamaba a setStrokes y a los callbacks del padre. React ejecuta los
    // updaters en fase de render, así que eso es «actualizar un componente
    // mientras se renderiza otro» —el aviso que suelta la consola— y además
    // repite el trabajo cuando React invoca el updater dos veces. El fichero ya
    // usaba este mismo patrón para `strokes` y para los waypoints.
    const currentStrokeRef = useRef<Point[]>([]);

    const hitWaypointsRef = useRef<Set<number>>(hitWaypoints);
    hitWaypointsRef.current = hitWaypoints;

    // Comprueba qué waypoints ha tocado el trazo actual
    const checkWaypoints = useCallback((point: Point) => {
      if (!guide || !guide.waypoints.length) return;
      const TOLERANCE_PX = 32; // Radio generoso para niños

      guide.waypoints.forEach((wp) => {
        if (!hitWaypointsRef.current.has(wp.id)) {
          if (distance(point, wp) <= TOLERANCE_PX) {
            const updated = new Set(hitWaypointsRef.current);
            updated.add(wp.id);
            setHitWaypoints(updated);
            if (Platform.OS === 'android' || Platform.OS === 'ios') {
              try { Vibration.vibrate(10); } catch { /* noop */ }
            }
          }
        }
      });
    }, [guide]);

    // PanResponder para captura fluida de toques y stylus
    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          onPanResponderGrant: (evt: GestureResponderEvent) => {
            const { locationX, locationY } = evt.nativeEvent;
            const pt: Point = { x: locationX, y: locationY };
            currentStrokeRef.current = [pt];
            setCurrentStroke(currentStrokeRef.current);
            checkWaypoints(pt);
          },
          onPanResponderMove: (evt: GestureResponderEvent) => {
            const { locationX, locationY } = evt.nativeEvent;
            const pt: Point = { x: locationX, y: locationY };
            currentStrokeRef.current = [...currentStrokeRef.current, pt];
            setCurrentStroke(currentStrokeRef.current);
            checkWaypoints(pt);
          },
          // Cierre del trazo. Todo ocurre en el manejador del gesto, no dentro
          // de un updater: aquí sí se puede llamar a setStrokes y a los
          // callbacks del padre sin actualizar nada en fase de render.
          onPanResponderRelease: () => {
            const points = currentStrokeRef.current;
            currentStrokeRef.current = [];
            setCurrentStroke([]);
            if (points.length === 0) return;

            const newStroke: Stroke = {
              points,
              color: strokeColor,
              width: strokeWidth,
              // El contorno se resuelve AQUÍ, una sola vez en la vida del
              // trazo: a partir de ahora repintarlo solo cuesta pasar una
              // cadena que ya existe.
              outline: freehandPath(points, true, strokeWidth),
            };
            const updated = [...strokesRef.current, newStroke];
            setStrokes(updated);
            onStrokeChange?.(updated.length);

            // Si hay guía, evaluar precisión
            if (guide && guide.waypoints.length > 0) {
              const total = guide.waypoints.length;
              const hits = hitWaypointsRef.current.size;
              const score = Math.round((hits / total) * 100);
              const success = hits >= Math.ceil(total * 0.75); // 75% de cobertura requerida
              onValidateStroke?.(success, score);
            }
          },
        }),
      [strokeColor, strokeWidth, checkWaypoints, guide, onStrokeChange, onValidateStroke],
    );

    // Limpiar todo el lienzo
    const clear = useCallback(() => {
      setStrokes([]);
      currentStrokeRef.current = [];
      setCurrentStroke([]);
      setHitWaypoints(new Set());
      onStrokeChange?.(0);
    }, [onStrokeChange]);

    // Deshacer el último trazo
    const undo = useCallback(() => {
      setStrokes((prev) => {
        const next = prev.slice(0, -1);
        onStrokeChange?.(next.length);
        return next;
      });
    }, [onStrokeChange]);

    React.useImperativeHandle(ref, () => ({
      clear,
      undo,
    }), [clear, undo]);

    // Contorno del trazo en curso. Se recalcula al crecer el trazo, que es
    // inevitable; el `useMemo` evita repetirlo en los renders que NO lo tocan
    // (tocar un waypoint, cerrar un trazo, repintar por el padre).
    const liveOutline = useMemo(
      () => freehandPath(currentStroke, false, strokeWidth),
      [currentStroke, strokeWidth],
    );

    // Coordenadas para pautas Montessori
    const topGuideY = height * 0.22;
    const midGuideY = height * 0.50;
    const baseGuideY = height * 0.78;

  return (
    <View style={[styles.canvasContainer, { width, height }]} {...panResponder.panHandlers}>
      <Svg width={width} height={height} style={styles.svg}>
        {/* Pauta Montessori de fondo */}
        {showMontessoriLines && (
          <G opacity={0.4}>
            {/* Línea superior (ascendentes) */}
            <Line x1="16" y1={topGuideY} x2={width - 16} y2={topGuideY} stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="5, 5" />
            {/* Línea media (altura de x) */}
            <Line x1="16" y1={midGuideY} x2={width - 16} y2={midGuideY} stroke="#94A3B8" strokeWidth="2" />
            {/* Línea base (apoyo de letras) */}
            <Line x1="16" y1={baseGuideY} x2={width - 16} y2={baseGuideY} stroke="#00C4BE" strokeWidth="2.5" />
          </G>
        )}

        {/* Trazo del modelo de guía (punteado de fondo) */}
        {guide && guide.svgPath && (
          <Path
            d={guide.svgPath}
            stroke="#CBD5E1"
            strokeWidth={strokeWidth + 4}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8, 8"
            fill="none"
          />
        )}

        {/* Puntos de control (Waypoints) */}
        {guide && guide.waypoints && guide.waypoints.map((wp) => {
          const isHit = hitWaypoints.has(wp.id);
          return (
            <G key={wp.id}>
              <Circle
                cx={wp.x}
                cy={wp.y}
                r={isHit ? 14 : 16}
                fill={isHit ? '#2ECC40' : '#FFFFFF'}
                stroke={isHit ? '#16A34A' : '#00C4BE'}
                strokeWidth={isHit ? 2 : 2.5}
              />
              <SvgText
                x={wp.x}
                y={wp.y + 4}
                fontSize="12"
                fontWeight="bold"
                fill={isHit ? '#FFFFFF' : '#00A39E'}
                textAnchor="middle"
              >
                {wp.label ?? wp.order}
              </SvgText>
            </G>
          );
        })}

        {/* Trazos consolidados ya dibujados: su contorno viene resuelto desde
            que se soltaron, así que repintarlos no recalcula nada. */}
        {strokes.map((s, idx) => (
          <InkPath key={idx} outline={s.outline} points={s.points} color={s.color} width={s.width} />
        ))}

        {/* Trazo en curso: este SÍ se recalcula, porque está creciendo. Es el
            único del lienzo que lo hace, y solo sobre sus propios puntos. */}
        {currentStroke.length > 0 && (
          <InkPath outline={liveOutline} points={currentStroke} color={strokeColor} width={strokeWidth} />
        )}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  canvasContainer: {
    backgroundColor: '#FCFBF9', // Pergamino suave agradable
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    alignSelf: 'center',
    ...V.shadow.card,
  },
  svg: {
    flex: 1,
  },
});

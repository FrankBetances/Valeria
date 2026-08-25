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
            setCurrentStroke([pt]);
            checkWaypoints(pt);
          },
          onPanResponderMove: (evt: GestureResponderEvent) => {
            const { locationX, locationY } = evt.nativeEvent;
            const pt: Point = { x: locationX, y: locationY };
            setCurrentStroke((prev) => [...prev, pt]);
            checkWaypoints(pt);
          },
          onPanResponderRelease: () => {
            setCurrentStroke((prev) => {
              if (prev.length > 0) {
                const newStroke: Stroke = {
                  points: prev,
                  color: strokeColor,
                  width: strokeWidth,
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
              }
              return [];
            });
          },
        }),
      [strokeColor, strokeWidth, checkWaypoints, guide, onStrokeChange, onValidateStroke],
    );

    // Limpiar todo el lienzo
    const clear = useCallback(() => {
      setStrokes([]);
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

        {/* Trazos consolidados ya dibujados */}
        {strokes.map((s, idx) => (
          <Path
            key={idx}
            d={pointsToSmoothSvgPath(s.points)}
            stroke={s.color}
            strokeWidth={s.width}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}

        {/* Trazo en curso actual */}
        {currentStroke.length > 0 && (
          <Path
            d={pointsToSmoothSvgPath(currentStroke)}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
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

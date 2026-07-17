// ============================================================================
// Valeria+ · Distractor de Carga Cognitiva Dual — BearMark periférico (Fase 2.3)
// Durante una tarea auditiva, la mascota se asoma por la periferia de la
// pantalla y se mueve SIN ser interactiva (pointerEvents="none"): interferencia
// visual pura para el paradigma de doble tarea. Lo activa y desactiva el
// ADULTO desde su panel (nunca la app sola: muro MDR).
//
// Rendimiento (regla de oro 1): las animaciones van íntegras por el hilo
// nativo (useNativeDriver, solo transform) y el bucle ARRANCA dentro de
// InteractionManager.runAfterInteractions, de modo que el primer frame del
// oso jamás compite con el TTS ni con la transición de pantalla en gama baja.
//
// Prevención de datos sucios: al montarse registra su rectángulo (con el
// margen de la amplitud de animación) en ValeriaMisclickBoundary; los toques
// del niño sobre el oso se DESCARTAN de la telemetría de misclicks. Además
// abre/cierra la ventana dual-task (setDualTaskActive) que segmenta los
// misclicks reales del resto de la pantalla.
// ============================================================================
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, InteractionManager, StyleSheet } from 'react-native';
import { BearMark } from './ValeriaBearLogo';
import { registerDistractorZone, unregisterDistractorZone } from './ValeriaMisclickBoundary';
import { setDualTaskActive } from './valeriaTelemetry';

const BOB_PX = 16;      // amplitud vertical del balanceo
const ZONE_PAD = 12;    // margen extra del rect registrado (dedo + animación)
const SIZE = 76;

let uid = 0;

export const ValeriaDistractorBear: React.FC = () => {
  const idRef = useRef(`bear_${++uid}`);
  const bob = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const holderRef = useRef<View | null>(null);

  useEffect(() => {
    const id = idRef.current;
    setDualTaskActive(true); // abre la ventana de doble tarea en telemetría

    // Arranque asíncrono: el bucle no roba el primer frame a la consigna TTS.
    let bobLoop: Animated.CompositeAnimation | null = null;
    let swayLoop: Animated.CompositeAnimation | null = null;
    const handle = InteractionManager.runAfterInteractions(() => {
      bobLoop = Animated.loop(Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]));
      swayLoop = Animated.loop(Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      bobLoop.start();
      swayLoop.start();
    });

    return () => {
      handle.cancel();
      bobLoop?.stop();
      swayLoop?.stop();
      unregisterDistractorZone(id);
      setDualTaskActive(false); // cierra la ventana dual-task
    };
  }, [bob, sway]);

  // El contenedor es estático (solo los transforms animan): un measure tras el
  // layout basta para registrar la zona a ignorar por el boundary.
  const onLayout = () => {
    holderRef.current?.measureInWindow((x, y, w, h) => {
      registerDistractorZone(idRef.current, {
        x: x - ZONE_PAD, y: y - ZONE_PAD - BOB_PX,
        w: w + ZONE_PAD * 2, h: h + ZONE_PAD * 2 + BOB_PX * 2,
      });
    });
  };

  const translateY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -BOB_PX] });
  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-7deg', '7deg'] });

  return (
    // Periferia derecha, fuera de la zona de contenido; jamás recibe toques.
    <View ref={holderRef} onLayout={onLayout} pointerEvents="none" style={s.holder}>
      <Animated.View style={{ transform: [{ translateY }, { rotate }] }}>
        <BearMark size={SIZE} variant="brown" />
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  holder: {
    position: 'absolute', right: -SIZE * 0.28, top: '38%',
    width: SIZE, height: SIZE, zIndex: 15,
    opacity: 0.92,
  },
});

export default ValeriaDistractorBear;

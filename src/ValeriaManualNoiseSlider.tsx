// ============================================================================
// Valeria+ · ManualNoiseSlider — control MANUAL del ruido babble (Fase 2.1)
// Slider 0-10 construido a mano (PanResponder): sin dependencias nuevas y con
// control total del gesto. El volumen de la Pista B (valeriaNoise) muta
// EXCLUSIVAMENTE con este control, accionado por el adulto. Sin algoritmos
// de ajuste Señal/Ruido: el muro regulatorio vive en valeriaNoise.ts.
//
// Interacciones cuidadas:
//   · Durante el arrastre el volumen se aplica con throttle (motor de ruido);
//     la telemetría (trackNoiseLevel) solo se registra AL SOLTAR: un evento
//     por decisión del cuidador, no una tormenta por píxel.
//   · El PanResponder reclama el gesto, así el arrastre nunca burbujea hasta
//     ValeriaMisclickBoundary ni se cuenta como misclick.
//   · Todo el movimiento del pulgar es layout JS de un View pequeño; no hay
//     animaciones en el hilo principal que compitan con el TTS.
// ============================================================================
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { V } from './valeriaTheme';
import { setNoiseLevel, getNoiseLevel, noiseSupported } from './valeriaNoise';
import { trackNoiseLevel } from './valeriaTelemetry';

const STEPS = 10;

export const ValeriaManualNoiseSlider: React.FC = () => {
  const [level, setLevel] = useState(getNoiseLevel());
  const trackW = useRef(1);
  const trackX = useRef(0);
  const trackRef = useRef<View | null>(null);
  const levelRef = useRef(level);

  const posToLevel = (pageX: number): number => {
    const rel = (pageX - trackX.current) / Math.max(1, trackW.current);
    return Math.max(0, Math.min(STEPS, Math.round(rel * STEPS)));
  };

  const update = (pageX: number) => {
    const lvl = posToLevel(pageX);
    if (lvl !== levelRef.current) {
      levelRef.current = lvl;
      setLevel(lvl);
      setNoiseLevel(lvl); // aplica con throttle en el motor (nunca bloquea)
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => update(e.nativeEvent.pageX),
      onPanResponderMove: (e) => update(e.nativeEvent.pageX),
      // Telemetría SOLO al soltar: el nivel elegido, no el recorrido del dedo.
      onPanResponderRelease: () => trackNoiseLevel(levelRef.current),
      onPanResponderTerminate: () => trackNoiseLevel(levelRef.current),
    }),
  ).current;

  const onTrackLayout = (_e: LayoutChangeEvent) => {
    // pageX del track para convertir el dedo en nivel aunque la tarjeta scrollee.
    trackRef.current?.measureInWindow((x, _y, w) => { trackX.current = x; trackW.current = w; });
  };

  if (!noiseSupported()) return null;

  const pct = (level / STEPS) * 100;

  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.kicker}>🗣️ RUIDO DE FONDO (BABBLE)</Text>
        <View style={[s.badge, level > 0 && s.badgeOn]}>
          <Text style={[s.badgeTxt, level > 0 && s.badgeTxtOn]}>{level === 0 ? 'apagado' : `nivel ${level}`}</Text>
        </View>
      </View>
      <Text style={s.hint}>
        Solo lo controlas tú: sube el murmullo de cafetería poco a poco si tu logopeda
        te lo ha indicado. La app nunca lo cambia sola.
      </Text>
      <View
        ref={trackRef}
        onLayout={onTrackLayout}
        style={s.trackZone}
        {...pan.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="Nivel de ruido de fondo"
        accessibilityValue={{ min: 0, max: STEPS, now: level }}
      >
        <View style={s.track}>
          <View style={[s.fill, { width: `${pct}%` }]} />
          <View style={[s.thumb, { left: `${pct}%` }]} />
        </View>
      </View>
      <View style={s.ends}>
        <Text style={s.endTxt}>🔇 Silencio</Text>
        <Text style={s.endTxt}>☕ Cafetería</Text>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 13 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  badge: { backgroundColor: '#f1f5f4', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 3 },
  badgeOn: { backgroundColor: '#fff7ed' },
  badgeTxt: { fontSize: 10.5, fontWeight: '800', color: V.color.textMuted },
  badgeTxtOn: { color: '#9a5b13' },
  hint: { fontSize: 11.5, fontWeight: '600', color: V.color.textMuted, marginTop: 6, lineHeight: 16 },
  // Zona táctil generosa (44 px) alrededor de un raíl fino: dedo adulto, no lupa.
  trackZone: { paddingVertical: 16, marginTop: 4, justifyContent: 'center' },
  track: { height: 8, borderRadius: 4, backgroundColor: '#e5e7eb' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4, backgroundColor: '#f59e0b' },
  thumb: {
    position: 'absolute', top: -8, width: 24, height: 24, borderRadius: 12, marginLeft: -12,
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#f59e0b', ...V.shadow.button,
  },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  endTxt: { fontSize: 10.5, fontWeight: '700', color: V.color.textMuted },
});

export default ValeriaManualNoiseSlider;

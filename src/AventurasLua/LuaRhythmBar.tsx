// ============================================================================
// Aventuras con Lúa · Metrónomo VISUAL del recitado rítmico
//
// El pulso tiene que verse, no solo oírse: la mitad de los niños de este módulo
// llevan audiófono o implante, y un metrónomo sonoro compite justo con la voz
// que tienen que seguir. Por eso el pulso es un dibujo y el canal auditivo
// queda entero para la letra.
//
// Dibujado, no emoji (regla 5): son círculos SVG con el mismo grosor de trazo
// que el resto del set (1.9). El tiempo FUERTE es mayor y lleva relleno; los
// débiles son aro. El pulso en curso se marca con un anillo exterior, que es lo
// que permite anticiparlo —anticipar es la mitad del ejercicio—.
// ============================================================================
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LUA_COLORS } from './Theme/luaTheme';

interface Props {
  /** Pulsos del compás (uno por verso). */
  beats: number;
  /** Cada cuántos pulsos cae el acento fuerte. */
  accentEvery: number;
  /** Pulso en curso dentro del compás, 0…beats-1. `null` = parado. */
  current: number | null;
  /** Rótulo del tempo, ya formateado por la pantalla. */
  tempoLabel: string;
  a11yLabel: string;
}

const DOT = 26;

export const LuaRhythmBar: React.FC<Props> = ({
  beats, accentEvery, current, tempoLabel, a11yLabel,
}) => (
  <View style={s.wrap} accessibilityRole="progressbar" accessibilityLabel={a11yLabel}>
    <View style={s.row}>
      {Array.from({ length: beats }, (_, i) => {
        const fuerte = i % accentEvery === 0;
        const activo = current === i;
        const r = fuerte ? 8.5 : 6;
        return (
          <Svg key={i} width={DOT} height={DOT} viewBox="0 0 26 26">
            {activo && (
              <Circle cx={13} cy={13} r={12} fill="none" stroke={LUA_COLORS.coralDark} strokeWidth={1.9} />
            )}
            <Circle
              cx={13}
              cy={13}
              r={r}
              fill={activo || fuerte ? LUA_COLORS.coralDark : 'none'}
              stroke={LUA_COLORS.coralDark}
              strokeWidth={1.9}
              opacity={activo ? 1 : fuerte ? 0.55 : 0.4}
            />
          </Svg>
        );
      })}
    </View>
    <Text style={s.tempo}>{tempoLabel}</Text>
  </View>
);

const s = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tempo: { fontSize: 11.5, fontWeight: '800', color: LUA_COLORS.coralDark, letterSpacing: 0.3 },
});

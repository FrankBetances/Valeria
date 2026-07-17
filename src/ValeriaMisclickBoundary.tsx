// ============================================================================
// Valeria+ · Captura de misclicks (toques fuera de zonas interactivas) — V1.1
// Envuelve toda la app en la raíz del navegador.
//
// V1.1: captura PASIVA. La V1.0 reclamaba el "responder" del sistema de gestos
// en cada toque sobre zona muerta (onStartShouldSetResponder → true) y eso
// interfería con el desplazamiento de las listas: mientras la raíz retiene el
// gesto, el ScrollView nativo no siempre consigue quedárselo (bug reportado:
// "problemas con el desplazamiento de la pantalla"). Ahora NUNCA nos convertimos
// en responder: la pregunta onStartShouldSetResponder solo se usa como señal
// (si burbujea hasta la raíz es que ningún elemento interactivo más profundo
// reclamó el toque → zona muerta) y se responde false, dejando el gesto
// exactamente igual que si este componente no existiera. El toque se clasifica
// al soltar con onTouchStart/onTouchEnd, que burbujean sin competir por el
// gesto: solo cuenta como misclick un toque corto y sin desplazamiento (un tap;
// un arrastre de scroll no cuenta).
// ============================================================================
import React, { useRef } from 'react';
import { View, GestureResponderEvent } from 'react-native';
import { trackMisclick } from './valeriaTelemetry';

const TAP_SLOP_PX = 12; // desplazamiento máximo para considerar el toque un tap

export const ValeriaMisclickBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // true si la pregunta del responder llegó hasta la raíz (zona muerta).
  const deadZone = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const onTouchStart = (e: GestureResponderEvent) => {
    const t = e.nativeEvent;
    if (t.touches.length === 1) {
      startX.current = t.pageX;
      startY.current = t.pageY;
    } else {
      deadZone.current = false; // gesto multi-touch: nunca es un misclick
    }
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    const t = e.nativeEvent;
    if (t.touches.length > 0) return; // aún quedan dedos en pantalla
    const moved = Math.hypot(t.pageX - startX.current, t.pageY - startY.current);
    if (deadZone.current && moved < TAP_SLOP_PX) trackMisclick();
    deadZone.current = false;
  };

  return (
    <View
      style={{ flex: 1 }}
      // Señal de zona muerta: solo se pregunta a la raíz si nadie más profundo
      // reclamó el toque. Se responde false: JAMÁS tomamos el gesto.
      onStartShouldSetResponder={() => { deadZone.current = true; return false; }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => { deadZone.current = false; }}
    >
      {children}
    </View>
  );
};

export default ValeriaMisclickBoundary;

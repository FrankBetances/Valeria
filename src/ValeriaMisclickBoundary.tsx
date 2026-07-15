// ============================================================================
// Valeria+ · Captura de misclicks (toques fuera de zonas interactivas) — V1.0
// Envuelve toda la app en la raíz del navegador. Usa el sistema de "responder"
// de React Native: los elementos interactivos (Pressable/Switch/ScrollView)
// reclaman el toque en su propia profundidad, así que solo los toques en ZONAS
// MUERTAS llegan a reclamar a este contenedor raíz → se cuentan como misclick.
//
// No bloquea: onResponderRelease solo incrementa un contador en memoria. Cede el
// gesto a quien lo pida (onResponderTerminationRequest → true), de modo que el
// scroll y demás gestos siguen funcionando y no se cuentan como misclicks.
// ============================================================================
import React from 'react';
import { View, GestureResponderEvent } from 'react-native';
import { trackMisclick } from './valeriaTelemetry';

export const ValeriaMisclickBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Solo se convierte en responder cuando ningún hijo interactivo (más profundo)
  // reclamó el toque en la fase de burbujeo.
  const onStartShouldSetResponder = () => true;
  const onRelease = (_e: GestureResponderEvent) => { trackMisclick(); };

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponder={onStartShouldSetResponder}
      onResponderTerminationRequest={() => true}
      onResponderRelease={onRelease}
    >
      {children}
    </View>
  );
};

export default ValeriaMisclickBoundary;

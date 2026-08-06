// ============================================================================
// Valeria+ · Navegador de ejemplo (V3.1)
// Flujo completo:
//   Welcome → Credits → (PatientSelect ó FichaRegistro) → ExerciseSelection
//           → LingTest → ExercisePlayer → Results
//
// [V3] Welcome ofrece dos caminos:
//   · "Comenzar"                    → Credits → FichaRegistro (alta nueva).
//   · "Ya tengo un paciente"       → PatientSelect (retomar ficha existente).
//
// El Test de Ling es una comprobación auditiva PREVIA a los ejercicios, solo para
// pacientes con audífonos/implante. ExerciseSelectionScreen lee la patología de
// la ficha activa: si indica audífono/implante navega a LingTest al pulsar
// "Practicar" (navigation.navigate('LingTest', { id })); si no, va directo a
// ExercisePlayer. Dentro de LingTest, el tutor confirma de nuevo si procede y:
//   · "No usa equipo"  → navega directo a ExercisePlayer.
//   · "Sí usa equipo"  → realiza el test y luego navega a ExercisePlayer.
// (LingTest reenvía los params al Player, así no se rompe la sesión.)
//
// Dependencias:
//   npm install @react-navigation/native @react-navigation/native-stack \
//     react-native-screens react-native-safe-area-context \
//     @react-native-async-storage/async-storage react-native-svg
//   (En bare RN, además: cd ios && pod install)
// ============================================================================
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { initNotifications, refreshDailyReminders } from './valeriaNotifications';
import { subscribeUiLang } from './valeriaUiLang';
import { V } from './valeriaTheme';
import { AuthProvider } from './firebase/AuthContext';
import { noteScreen } from './valeriaTelemetry';
import { ValeriaMisclickBoundary } from './ValeriaMisclickBoundary';
import { ValeriaSUSModal } from './ValeriaSUSModal';

import ValeriaWelcomeScreen from './ValeriaWelcomeScreen';
import ValeriaCreditsScreen from './ValeriaCreditsScreen';
import ValeriaPatientSelectScreen from './ValeriaPatientSelectScreen';
import ValeriaFichaRegistroScreen from './ValeriaFichaRegistroScreen';
import MainTabNavigator from './MainTabNavigator';
import ValeriaBlockListScreen from './ValeriaBlockListScreen';
import { BlockKey } from './valeriaBlocks';
import ValeriaLingTestScreen from './ValeriaLingTestScreen';
import ValeriaExercisePlayerScreen from './ValeriaExercisePlayerScreen';
import ValeriaMinimalPairsScreen from './ValeriaMinimalPairsScreen';
import ValeriaSemanticExpansionScreen from './ValeriaSemanticExpansionScreen';
import ValeriaAcademyScreen from './ValeriaAcademy';
// Bloque 7 · Realidad Aumentada. La pantalla es solo la antesala en JS: el
// ejercicio corre en el host nativo de cámara + escena 3D. Si ese host no
// existe, la tarjeta del hub ni siquiera se renderiza (valeriaArBridge).
import ValeriaArLauncherScreen from './ValeriaArLauncherScreen';
// [V3.1] La ruta Results la sirve el panel de paciente. ValeriaResultsScreen (V2.x)
// fue eliminada de la base de código.
import ValeriaPatientResultsDashboardScreen from './ValeriaPatientResultsDashboardScreen';

export type ValeriaStackParamList = {
  Welcome: undefined;
  Credits: undefined;
  PatientSelect: undefined;
  FichaRegistro: undefined;
  ExerciseSelection: undefined;
  // [v11] Lista prescribible de UN bloque. En la v10.2 era un `useState`
  // dentro de ExerciseSelection, no una ruta: por eso el atrás de Android
  // salía de la pantalla entera y la telemetría no sabía distinguir navegar
  // de prescribir. Clave NUEVA en telemetry.screens — adición, no ruptura.
  BlockList: { block: BlockKey };
  LingTest: { id?: string } | undefined;
  ExercisePlayer: { id?: string } | undefined;
  MinimalPairs: undefined;
  SemanticExpansion: undefined;
  ArLauncher: undefined;
  Academy: undefined;
  Results: undefined;
};

const Stack = createNativeStackNavigator<ValeriaStackParamList>();

// Cabecera propia en cada pantalla -> ocultamos la nativa.
export const ValeriaNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="Welcome"
    screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: '#f6fafa' } }}
  >
    <Stack.Screen name="Welcome" component={ValeriaWelcomeScreen} />
    <Stack.Screen name="Credits" component={ValeriaCreditsScreen} />
    <Stack.Screen name="PatientSelect" component={ValeriaPatientSelectScreen} />
    <Stack.Screen name="FichaRegistro" component={ValeriaFichaRegistroScreen} />
    {/* La interfaz v11 va cableada DIRECTA. Hubo un interruptor
        (`ENABLE_V11_UI`) para poder construirla sin tocar la app en
        producción, y cumplió su papel — pero también permitía compilar una
        versión en la que no se veía ningún cambio, y eso costó un build
        entregado a evaluación externa sin la interfaz nueva. Retirado: si
        está en `main`, está en la app.

        El nombre de ruta se conserva: la telemetría del piloto indexa el
        tiempo por nombre de ruta y rebautizarlo partiría la serie. */}
    <Stack.Screen name="ExerciseSelection" component={MainTabNavigator} />
    {/* [v11] Solo la alcanza el hub v11. Vive en el stack RAÍZ, no dentro de
        las pestañas: prescribir es una tarea con principio y fin, y la barra
        inferior invitaría a abandonarla a medias. */}
    <Stack.Screen name="BlockList" component={ValeriaBlockListScreen} />
    <Stack.Screen name="LingTest" component={ValeriaLingTestScreen} />
    <Stack.Screen name="ExercisePlayer" component={ValeriaExercisePlayerScreen} />
    <Stack.Screen name="MinimalPairs" component={ValeriaMinimalPairsScreen} />
    <Stack.Screen name="SemanticExpansion" component={ValeriaSemanticExpansionScreen} />
    <Stack.Screen name="ArLauncher" component={ValeriaArLauncherScreen} />
    <Stack.Screen name="Academy" component={ValeriaAcademyScreen} />
    <Stack.Screen name="Results" component={ValeriaPatientResultsDashboardScreen} />
  </Stack.Navigator>
);

// Con el edge-to-edge de Android 15+ (obligatorio desde Expo SDK 54) la app se
// dibuja bajo las barras del sistema. Este marco reserva la zona de la barra de
// estado en turquesa (color de las cabeceras) y la de la barra de gestos en el
// color de página, para que ningún botón quede debajo.
const SafeFrame: React.FC = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: V.color.primary, paddingTop: insets.top }}>
      <View style={{ flex: 1, backgroundColor: V.color.pageBg, paddingBottom: insets.bottom }}>
        {/* La telemetría envuelve todo: cuenta como misclick cualquier toque en
            zonas muertas (ningún elemento interactivo lo reclama) sin bloquear. */}
        <ValeriaMisclickBoundary>
          <ValeriaNavigator />
        </ValeriaMisclickBoundary>
        {/* Modal SUS global: se autodispara con rate limiting (hito de 4 bloques,
            máx. 1 vez/semana) desde valeriaTelemetry, sea cual sea la pantalla. */}
        <ValeriaSUSModal />
      </View>
    </View>
  );
};

// Si tu app YA tiene un NavigationContainer, importa solo <ValeriaNavigator />
// y añádelo a tu stack raíz. Si no, usa <ValeriaApp /> tal cual.
// Ref del navegador para leer la ruta activa y medir el tiempo activo por
// pantalla (telemetría de usabilidad) sin acoplar cada screen.
export const navigationRef = createNavigationContainerRef<ValeriaStackParamList>();

export const ValeriaApp: React.FC = () => {
  // Handler y canal Android de los recordatorios diarios (pantalla de bloqueo),
  // más la rotación diaria del consejo para padres si los avisos están activos.
  useEffect(() => { initNotifications(); refreshDailyReminders(); }, []);

  // Los recordatorios se PROGRAMAN por adelantado con su texto ya dentro, así
  // que un cambio de idioma no alcanza a los que están en cola: seguirían
  // llegando a la pantalla de bloqueo en el idioma anterior durante días.
  // Reprogramarlos al cambiar cuesta una llamada y evita esa incoherencia.
  // (`refreshDailyReminders` no hace nada si el adulto los tiene apagados.)
  useEffect(() => subscribeUiLang(() => { void refreshDailyReminders(); }), []);
  const lastRoute = useRef<string | null>(null);
  // Cierra el tramo de la pantalla anterior y abre el nuevo en cada cambio de
  // ruta. Solo hace aritmética de timestamps → no bloquea el hilo principal.
  const handleRoute = () => {
    const name = navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : undefined;
    if (name && name !== lastRoute.current) { lastRoute.current = name; noteScreen(name); }
  };
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef} onReady={handleRoute} onStateChange={handleRoute}>
          <SafeFrame />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
};

export default ValeriaApp;

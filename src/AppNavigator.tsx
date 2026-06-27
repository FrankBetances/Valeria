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
// pacientes con audífonos/implante. Internamente decide:
//   · "No usa equipo"  → navega directo a ExercisePlayer.
//   · "Sí usa equipo"  → realiza el test y luego navega a ExercisePlayer.
//
// Para insertarlo en tu flujo, lanza LingTest justo antes del Player. Ejemplo
// desde la pantalla de selección, al pulsar "Practicar":
//   navigation.navigate('LingTest', { id: item.id });
// (LingTest reenvía los params al Player, así no se rompe la sesión.)
//
// Dependencias:
//   npm install @react-navigation/native @react-navigation/native-stack \
//     react-native-screens react-native-safe-area-context \
//     @react-native-async-storage/async-storage react-native-svg
//   (En bare RN, además: cd ios && pod install)
// ============================================================================
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ValeriaWelcomeScreen from './ValeriaWelcomeScreen';
import ValeriaCreditsScreen from './ValeriaCreditsScreen';
import ValeriaPatientSelectScreen from './ValeriaPatientSelectScreen';
import ValeriaFichaRegistroScreen from './ValeriaFichaRegistroScreen';
import ValeriaExerciseSelectionScreen from './ValeriaExerciseSelectionScreen';
import ValeriaLingTestScreen from './ValeriaLingTestScreen';
import ValeriaExercisePlayerScreen from './ValeriaExercisePlayerScreen';
// [V3.1] La ruta Results la sirve el panel de paciente. ValeriaResultsScreen (V2.x)
// fue eliminada de la base de código.
import ValeriaPatientResultsDashboardScreen from './ValeriaPatientResultsDashboardScreen';

export type ValeriaStackParamList = {
  Welcome: undefined;
  Credits: undefined;
  PatientSelect: undefined;
  FichaRegistro: undefined;
  ExerciseSelection: undefined;
  LingTest: { id?: string } | undefined;
  ExercisePlayer: { id?: string } | undefined;
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
    <Stack.Screen name="ExerciseSelection" component={ValeriaExerciseSelectionScreen} />
    <Stack.Screen name="LingTest" component={ValeriaLingTestScreen} />
    <Stack.Screen name="ExercisePlayer" component={ValeriaExercisePlayerScreen} />
    <Stack.Screen name="Results" component={ValeriaPatientResultsDashboardScreen} />
  </Stack.Navigator>
);

// Si tu app YA tiene un NavigationContainer, importa solo <ValeriaNavigator />
// y añádelo a tu stack raíz. Si no, usa <ValeriaApp /> tal cual.
export const ValeriaApp: React.FC = () => (
  <NavigationContainer>
    <ValeriaNavigator />
  </NavigationContainer>
);

export default ValeriaApp;

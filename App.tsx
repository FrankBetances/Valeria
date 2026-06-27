import ValeriaApp from './src/AppNavigator';

// Punto de entrada de la app Valeria+.
// AppNavigator ya envuelve el NavigationContainer y cablea el flujo completo (V3):
//   Welcome → Credits → (PatientSelect ó FichaRegistro) → ExerciseSelection
//           → LingTest → ExercisePlayer → Results
export default ValeriaApp;

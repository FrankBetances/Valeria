// ============================================================================
// Valeria+ · Inicialización de Firebase (App + Auth + Firestore)
// ----------------------------------------------------------------------------
// Usamos el SDK JS de Firebase (paquete `firebase`), no @react-native-firebase.
// Motivo: Valeria+ es una app Expo que corre en Android, iOS y web con el mismo
// código; el SDK JS funciona en las tres plataformas sin módulos nativos ni
// rebuilds, y la persistencia de sesión se apoya en AsyncStorage (ya instalado).
//
// - Web  → getAuth(app)  (persistencia en el navegador por defecto).
// - Nativo (Android/iOS) → initializeAuth con getReactNativePersistence sobre
//   AsyncStorage, para que la sesión sobreviva a reinicios de la app.
// ============================================================================
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  // getReactNativePersistence solo existe en el build react-native de
  // firebase/auth; el resolvedor de Metro lo encuentra por la condición
  // "react-native". TypeScript (moduleResolution: bundler) también, pero
  // dejamos el guard por si alguna herramienta usa el build de Node.
  // @ts-ignore
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, firebaseConfigIsPlaceholder } from './firebaseConfig';

// IMPORTANTE: este módulo se evalúa al importar la app (antes del primer
// render). Nada de aquí puede lanzar: un throw a este nivel tumba el bundle
// completo y deja la app congelada en el splash, sin pantalla de error.
// firebaseConfig garantiza una apiKey sintácticamente válida aunque falten
// las variables de entorno, precisamente para que la inicialización de Auth
// no lance `auth/invalid-api-key` aquí.
if (firebaseConfigIsPlaceholder) {
  // Visible en `adb logcat` / consola de Metro: el build salió sin la apiKey.
  console.warn(
    '[Valeria] Config de Firebase incompleta: falta EXPO_PUBLIC_FIREBASE_API_KEY. ' +
      'La app funciona, pero el acceso profesional (Auth/Firestore) fallará. ' +
      'Ver docs/firebase-setup.md.',
  );
}

// Evita re-inicializar en Fast Refresh / múltiples imports.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Ya estaba inicializado (p. ej. tras un Fast Refresh).
    auth = getAuth(app);
  }
}

// Base de datos Firestore (edición Standard, base por defecto del proyecto).
const db = getFirestore(app);

export { app, auth, db };

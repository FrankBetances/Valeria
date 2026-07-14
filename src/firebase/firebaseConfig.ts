// ============================================================================
// Valeria+ · Configuración del SDK web de Firebase
// ----------------------------------------------------------------------------
// La config se lee de variables de entorno EXPO_PUBLIC_* en lugar de ir
// escrita en el código. Aunque la Firebase web/app config es pública por
// diseño (la seguridad real vive en las Security Rules de Firestore), el
// secret scanning de GitHub marca cualquier clave `AIzaSy…` que aparezca en
// el repositorio, así que la mantenemos fuera del código fuente.
//
// Proyecto Firebase: valeria-b500f  ·  número 477839657795
// App Android registrada: package health.earlify.valeria
// (messagingSenderId === project number)
//
// Dónde se definen las variables:
//   - Desarrollo local → archivo `.env` en la raíz (ignorado por git).
//     Copia `.env.example` y rellena los valores; Expo carga `.env` solo.
//   - GitHub Actions   → secrets EXPO_PUBLIC_FIREBASE_API_KEY y
//     EXPO_PUBLIC_FIREBASE_APP_ID (ver .github/workflows/android.yml).
//   - EAS Build        → `eas env:create` o el panel de EAS.
//
// Los valores reales los imprime la Firebase CLI:
//   npx -y firebase-tools@latest apps:sdkconfig ANDROID <APP_ID> --project valeria-b500f
// Ver docs/firebase-setup.md.
//
// Nota: Expo solo inyecta las variables referenciadas estáticamente como
// `process.env.EXPO_PUBLIC_X` (no admite acceso dinámico), de ahí la forma
// literal de cada lectura.
// ============================================================================
import type { FirebaseOptions } from 'firebase/app';

const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '';

export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.firebasestorage.app`,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

// Aviso en tiempo de ejecución si la config no está completa (faltan las
// variables de entorno); evita errores crípticos del SDK al probar.
export const firebaseConfigIsPlaceholder =
  !firebaseConfig.apiKey || !firebaseConfig.projectId;

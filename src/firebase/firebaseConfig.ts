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

// projectId y messagingSenderId son públicos (van fijos también en el
// workflow de CI); tener el valor real como respaldo permite que un build sin
// variables de entorno siga apuntando al proyecto correcto.
const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'valeria-b500f';
const apiKeyEnv = process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '';

// true cuando el build salió sin la apiKey (falta la variable de entorno /
// el secret de CI). ValeriaAuthScreen lo usa para avisar en pantalla.
export const firebaseConfigIsPlaceholder = !apiKeyEnv;

export const firebaseConfig: FirebaseOptions = {
  // La apiKey no puede quedar vacía: firebase/auth ejecuta
  // `_assert(apiKey && !apiKey.includes(':'), 'auth/invalid-api-key')` nada más
  // inicializar, y como la inicialización ocurre al importar firebaseApp.ts,
  // ese throw tumbaba el bundle entero antes del primer render (la app se
  // quedaba congelada en el splash). Con un placeholder sintácticamente válido
  // la app arranca, muestra el aviso de config incompleta y el error de la
  // clave aparece solo al intentar usar Firebase.
  apiKey: apiKeyEnv || 'missing-firebase-api-key',
  authDomain: `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: `${projectId}.firebasestorage.app`,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '477839657795',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

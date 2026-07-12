// ============================================================================
// Valeria+ · Configuración del SDK web de Firebase
// ----------------------------------------------------------------------------
// Estos valores NO son secretos: la Firebase web/app config es pública por
// diseño (la seguridad real vive en las Security Rules de Firestore, no aquí).
// Por eso es correcto tenerlos en el código.
//
// Proyecto Firebase: número 665213943480  (messagingSenderId === project number)
//
// Cómo se rellenan estos campos (una vez registrada la app Android en el
// proyecto). Con la Firebase CLI autenticada:
//
//   npx -y firebase-tools@latest apps:list ANDROID --project <PROJECT_ID>
//   npx -y firebase-tools@latest apps:sdkconfig ANDROID <APP_ID> --project <PROJECT_ID>
//
// El comando `apps:sdkconfig` imprime exactamente estos valores. Sustituye los
// marcadores `REPLACE_*` por los reales. Ver docs/firebase-setup.md.
// ============================================================================
import type { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
  apiKey: 'REPLACE_WITH_API_KEY',
  authDomain: 'REPLACE_WITH_PROJECT_ID.firebaseapp.com',
  projectId: 'REPLACE_WITH_PROJECT_ID',
  storageBucket: 'REPLACE_WITH_PROJECT_ID.firebasestorage.app',
  messagingSenderId: '665213943480',
  appId: 'REPLACE_WITH_APP_ID',
};

// Marcador que usamos para avisar en tiempo de ejecución si la config no se ha
// completado todavía (evita errores crípticos del SDK al probar).
export const firebaseConfigIsPlaceholder =
  firebaseConfig.apiKey === 'REPLACE_WITH_API_KEY';

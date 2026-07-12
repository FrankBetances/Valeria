// ============================================================================
// Valeria+ · Punto de entrada del módulo Firebase.
//   import { auth, db, useAuth, AuthProvider } from './firebase';
// ============================================================================
export { app, auth, db } from './firebaseApp';
export { firebaseConfig, firebaseConfigIsPlaceholder } from './firebaseConfig';
export { AuthProvider, useAuth } from './AuthContext';
export { authErrorToMessage } from './authErrors';
export * from './firestoreService';

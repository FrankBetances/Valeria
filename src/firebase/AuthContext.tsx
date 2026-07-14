// ============================================================================
// Valeria+ · Contexto de autenticación (Firebase Auth · email/contraseña)
// ----------------------------------------------------------------------------
// Envuelve la app en <AuthProvider> (ya cableado en AppNavigator) y consume el
// estado con el hook useAuth() desde cualquier pantalla:
//
//   const { user, initializing, signIn, signUp, signOut } = useAuth();
//
// `user` es el profesional autenticado (o null). `initializing` es true hasta
// que Firebase restaura la sesión persistida al arrancar.
// ============================================================================
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './firebaseApp';

type AuthContextValue = {
  /** Profesional autenticado, o null si no hay sesión. */
  user: User | null;
  /** true mientras Firebase restaura la sesión persistida al arrancar. */
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (next) => {
      setUser(next);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      signUp: async (email, password, displayName) => {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );
        if (displayName && displayName.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
      },
      signOut: async () => {
        await firebaseSignOut(auth);
      },
      resetPassword: async (email) => {
        await sendPasswordResetEmail(auth, email.trim());
      },
    }),
    [user, initializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  }
  return ctx;
}

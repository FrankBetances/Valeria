// ============================================================================
// Valeria+ · Acceso profesional (Firebase Auth · email + contraseña)
// ----------------------------------------------------------------------------
// Pantalla lista para usar que permite a un profesional (logopeda) iniciar
// sesión, crear una cuenta o recuperar la contraseña. Consume useAuth().
//
// Uso como puerta de acceso (gate) en cualquier flujo:
//
//   const { user, initializing } = useAuth();
//   if (initializing) return <Splash />;
//   if (!user) return <ValeriaAuthScreen />;
//   return <ZonaProfesional />;
//
// `onAuthenticated` es opcional: se invoca al completar el inicio de sesión
// (útil si la usas dentro del stack de navegación en lugar de como gate).
// ============================================================================
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { V } from './valeriaTheme';
import { useAuth } from './firebase/AuthContext';
import { authErrorToMessage } from './firebase/authErrors';
import { firebaseConfigIsPlaceholder } from './firebase/firebaseConfig';

type Mode = 'signin' | 'signup';

const ValeriaAuthScreen: React.FC<{ onAuthenticated?: () => void }> = ({
  onAuthenticated,
}) => {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const submit = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setError('Escribe tu correo y contraseña.');
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      onAuthenticated?.();
    } catch (e) {
      setError(authErrorToMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onReset = async () => {
    setError(null);
    setNotice(null);
    if (!email.trim()) {
      setError('Escribe tu correo para enviarte el enlace de recuperación.');
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email);
      setNotice('Te hemos enviado un correo para restablecer la contraseña.');
    } catch (e) {
      setError(authErrorToMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          <View style={s.badge}>
            <Text style={{ fontSize: 26 }}>🐻</Text>
          </View>
          <Text style={s.title}>Acceso profesional</Text>
          <Text style={s.subtitle}>
            {isSignup
              ? 'Crea tu cuenta para guardar tus pacientes y sesiones en la nube.'
              : 'Inicia sesión para acceder a tus pacientes y sesiones.'}
          </Text>

          {firebaseConfigIsPlaceholder && (
            <View style={[s.banner, s.bannerWarn]}>
              <Text style={s.bannerWarnTxt}>
                ⚠︎ Firebase aún no está configurado (faltan las claves del
                proyecto). Ver docs/firebase-setup.md.
              </Text>
            </View>
          )}

          {isSignup && (
            <View style={s.field}>
              <Text style={s.label}>Nombre</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor={V.color.textMuted}
                autoCapitalize="words"
                editable={!busy}
              />
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>Correo electrónico</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor={V.color.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!busy}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Contraseña</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={V.color.textMuted}
              secureTextEntry
              autoCapitalize="none"
              editable={!busy}
            />
          </View>

          {error && (
            <View style={[s.banner, s.bannerError]}>
              <Text style={s.bannerErrorTxt}>{error}</Text>
            </View>
          )}
          {notice && (
            <View style={[s.banner, s.bannerOk]}>
              <Text style={s.bannerOkTxt}>{notice}</Text>
            </View>
          )}

          <Pressable
            onPress={submit}
            disabled={busy}
            style={[s.primaryBtn, busy && s.btnDisabled]}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.primaryBtnTxt}>
                {isSignup ? 'Crear cuenta' : 'Iniciar sesión'}
              </Text>
            )}
          </Pressable>

          {!isSignup && (
            <Pressable onPress={onReset} disabled={busy} style={s.linkBtn}>
              <Text style={s.linkTxt}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          )}

          <View style={s.switchRow}>
            <Text style={s.switchTxt}>
              {isSignup ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}
            </Text>
            <Pressable
              onPress={() => {
                setMode(isSignup ? 'signin' : 'signup');
                setError(null);
                setNotice(null);
              }}
              disabled={busy}
            >
              <Text style={s.switchLink}>
                {isSignup ? 'Inicia sesión' : 'Créala aquí'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  card: {
    backgroundColor: V.color.card,
    borderRadius: V.radius.card,
    borderWidth: 1,
    borderColor: V.color.border,
    padding: 22,
    ...V.shadow.card,
  },
  badge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: V.color.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: V.color.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  field: { marginTop: 16 },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: V.color.textSecondary,
    marginBottom: 6,
  },
  input: {
    height: 50,
    borderRadius: V.radius.field,
    borderWidth: 1,
    borderColor: V.color.border,
    backgroundColor: V.color.pageBg,
    paddingHorizontal: 14,
    fontSize: 15.5,
    color: V.color.textPrimary,
  },
  banner: { marginTop: 14, borderRadius: V.radius.field, padding: 12 },
  bannerError: { backgroundColor: V.color.errorBg },
  bannerErrorTxt: { color: V.color.error, fontSize: 13.5, fontWeight: '700' },
  bannerOk: { backgroundColor: V.color.successBg },
  bannerOkTxt: { color: '#0a7d54', fontSize: 13.5, fontWeight: '700' },
  bannerWarn: { backgroundColor: '#fffbeb' },
  bannerWarnTxt: { color: '#92600a', fontSize: 12.5, fontWeight: '700', lineHeight: 18 },
  primaryBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: V.radius.button,
    backgroundColor: V.color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...V.shadow.button,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnTxt: { color: '#fff', fontSize: 16.5, fontWeight: '800' },
  linkBtn: { marginTop: 14, alignItems: 'center' },
  linkTxt: { color: V.color.primaryDark, fontSize: 13.5, fontWeight: '700' },
  switchRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  switchTxt: { color: V.color.textSecondary, fontSize: 13.5, fontWeight: '600' },
  switchLink: { color: V.color.primaryDark, fontSize: 13.5, fontWeight: '800' },
});

export default ValeriaAuthScreen;

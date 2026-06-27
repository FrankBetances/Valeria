// ============================================================================
// Valeria+ · Pantalla de Bienvenida (V3.0)
// Splash de marca a pantalla completa. Mascota animada (flotación), wordmark,
// claim del producto y accesos. No persiste datos; solo navega.
//   Comenzar                       → navigation.navigate('Credits')        // [V3] pasa por créditos antes del alta
//   Ya tengo un paciente registrado → navigation.navigate('PatientSelect')  // [V3] gestor multi-paciente
// ============================================================================
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import { V } from './valeriaTheme';
import { BearMark } from './ValeriaBearLogo';
// import logoWhite from '../../assets/valeria-logo-white.png';

export const ValeriaWelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
  }, [float]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  return (
    <View style={s.flex}>
      <StatusBar barStyle="light-content" />
      {/* círculos decorativos */}
      <View style={[s.blob, { top: -70, right: -50, width: 240, height: 240, opacity: 0.12 }]} />
      <View style={[s.blob, { bottom: 160, left: -70, width: 200, height: 200, opacity: 0.08 }]} />

      <View style={s.center}>
        <Animated.View style={[s.mascotTile, { transform: [{ translateY }] }]}>
          <BearMark size={104} variant="white" />
        </Animated.View>

        {/* <Image source={logoWhite} style={s.logo} /> */}
        <Text style={s.logoFallback}>valeria+</Text>

        <Text style={s.tagline}>Terapia auditiva y de lenguaje, en casa y guiada por ti.</Text>
        <Text style={s.sub}>
          Tú diriges cada ejercicio y valoras la respuesta del niño. Valeria registra el progreso.
        </Text>
      </View>

      <View style={s.actions}>
        <Pressable onPress={() => navigation.navigate('Credits')} style={s.primaryBtn} accessibilityRole="button">
          <Text style={s.primaryBtnTxt}>Comenzar</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('PatientSelect')} style={s.secondaryBtn} accessibilityRole="button">
          <Text style={s.secondaryBtnTxt}>Ya tengo un paciente registrado</Text>
        </Pressable>
        <View style={s.trust}>
          <Text style={{ fontSize: 11 }}>🔒</Text>
          <Text style={s.trustTxt}>Datos cifrados en el dispositivo · RGPD / HIPAA</Text>
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.primary },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: '#ffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  mascotTile: {
    width: 150, height: 150, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,.3)',
  },
  logo: { height: 42, width: 168, resizeMode: 'contain', marginTop: 30 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 30, letterSpacing: 1, marginTop: 28 },
  tagline: { fontSize: 17, fontWeight: '700', color: 'rgba(255,255,255,.95)', textAlign: 'center', marginTop: 14, lineHeight: 23, maxWidth: 280 },
  sub: { fontSize: 13.5, fontWeight: '600', color: 'rgba(255,255,255,.78)', textAlign: 'center', marginTop: 10, lineHeight: 20, maxWidth: 270 },
  actions: { paddingHorizontal: 28, paddingBottom: 28 },
  primaryBtn: {
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    shadowColor: 'rgba(11,18,32,.18)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 26, elevation: 6,
  },
  primaryBtnTxt: { color: V.color.primaryDark, fontSize: 17, fontWeight: '800' },
  secondaryBtn: { marginTop: 12, paddingVertical: 8, alignItems: 'center' },
  secondaryBtnTxt: { color: '#fff', fontSize: 14.5, fontWeight: '800' },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 },
  trustTxt: { color: 'rgba(255,255,255,.72)', fontSize: 11, fontWeight: '600' },
});

export default ValeriaWelcomeScreen;

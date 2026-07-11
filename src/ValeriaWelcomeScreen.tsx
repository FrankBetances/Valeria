// ============================================================================
// Valeria+ · Pantalla de Bienvenida (V3.1)
// Splash de marca a pantalla completa. Mascota oso pardo con entrada elástica,
// balanceo continuo, salto de alegría periódico y halo pulsante; el contenido
// aparece de forma escalonada. No persiste datos; solo navega.
//   Comenzar                       → navigation.navigate('Credits')        // [V3] pasa por créditos antes del alta
//   Ya tengo un paciente registrado → navigation.navigate('PatientSelect')  // [V3] gestor multi-paciente
// ============================================================================
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import { V } from './valeriaTheme';
import { BearMark } from './ValeriaBearLogo';
// import logoWhite from '../../assets/valeria-logo-white.png';

export const ValeriaWelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const intro = useRef(new Animated.Value(0)).current;   // entrada elástica de la mascota
  const float = useRef(new Animated.Value(0)).current;   // flotación + balanceo continuo
  const jump = useRef(new Animated.Value(0)).current;    // salto de alegría periódico
  const halo = useRef(new Animated.Value(0)).current;    // onda expansiva tras la mascota
  const content = useRef(new Animated.Value(0)).current; // texto y botones

  useEffect(() => {
    // La mascota "salta" a escena con rebote elástico.
    Animated.spring(intro, { toValue: 1, friction: 5, tension: 46, useNativeDriver: true }).start();

    // El resto del contenido aparece justo después, deslizándose hacia arriba.
    Animated.timing(content, {
      toValue: 1, duration: 650, delay: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();

    // Flotación con ligero balanceo, como si respirara.
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();

    // Cada pocos segundos, un pequeño salto de entusiasmo con squash & stretch.
    Animated.loop(
      Animated.sequence([
        Animated.delay(3400),
        Animated.timing(jump, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(jump, { toValue: 0, duration: 420, easing: Easing.bounce, useNativeDriver: true }),
      ]),
    ).start();

    // Halo que se expande y desvanece detrás de la mascota.
    Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    ).start();
  }, [intro, float, jump, halo, content]);

  const floatY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const sway = float.interpolate({ inputRange: [0, 1], outputRange: ['-2.5deg', '2.5deg'] });
  const jumpY = jump.interpolate({ inputRange: [0, 1], outputRange: [0, -16] });
  const jumpStretch = jump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const introScale = intro.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });

  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.45, 0] });

  const contentStyle = {
    opacity: content,
    transform: [{ translateY: content.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
  };

  return (
    <View style={s.flex}>
      <StatusBar barStyle="light-content" />
      {/* círculos decorativos */}
      <View style={[s.blob, { top: -70, right: -50, width: 240, height: 240, opacity: 0.12 }]} />
      <View style={[s.blob, { bottom: 160, left: -70, width: 200, height: 200, opacity: 0.08 }]} />

      <View style={s.center}>
        <View style={s.mascotWrap}>
          <Animated.View style={[s.halo, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]} />
          <Animated.View
            style={[
              s.mascotTile,
              {
                opacity: intro,
                transform: [
                  { scale: introScale },
                  { translateY: Animated.add(floatY, jumpY) },
                  { rotate: sway },
                  { scaleY: jumpStretch },
                ],
              },
            ]}
          >
            <BearMark size={104} variant="brown" />
          </Animated.View>
        </View>

        <Animated.View style={contentStyle}>
          {/* <Image source={logoWhite} style={s.logo} /> */}
          <Text style={s.logoFallback}>valeria+</Text>

          <Text style={s.tagline}>Terapia auditiva y de lenguaje, en casa y guiada por ti.</Text>
          <Text style={s.sub}>
            Tú diriges cada ejercicio y valoras la respuesta del niño. Valeria registra el progreso.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[s.actions, contentStyle]}>
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
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.primary },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: '#ffffff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  mascotWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.85)',
  },
  mascotTile: {
    width: 150, height: 150, borderRadius: 42, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,.55)',
  },
  logo: { height: 42, width: 168, resizeMode: 'contain', marginTop: 30 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 30, letterSpacing: 1, marginTop: 28, textAlign: 'center' },
  tagline: { fontSize: 17, fontWeight: '700', color: 'rgba(255,255,255,.95)', textAlign: 'center', marginTop: 14, lineHeight: 23, maxWidth: 280, alignSelf: 'center' },
  sub: { fontSize: 13.5, fontWeight: '600', color: 'rgba(255,255,255,.78)', textAlign: 'center', marginTop: 10, lineHeight: 20, maxWidth: 270, alignSelf: 'center' },
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

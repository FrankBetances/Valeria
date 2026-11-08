// ============================================================================
// Valeria+ · Pantalla de Bienvenida (V3.1)
// Splash de marca a pantalla completa. Lúa entra con rebote elástico,
// balanceo continuo, salto de alegría periódico y halo pulsante; el contenido
// aparece de forma escalonada. No persiste datos; solo navega.
//   Comenzar → navigation.navigate('Credits')
//
// Botón único a propósito. El atajo «Ya tengo un paciente registrado» estuvo
// aquí y se retiró: el camino es Bienvenida → Créditos → Lúa, y desde Lúa se
// elige entre ficha nueva y paciente existente. Decidido por Frank el
// 31/8/2026. Su cadena salió del catálogo en los tres idiomas; si el atajo
// vuelve, hay que volver a darla de alta en es, en y ca a la vez.
// ============================================================================
import React, { useEffect, useRef } from 'react';
import { Breathe } from './ui/motion';
import { View, Text, Pressable, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import { V } from './valeriaTheme';
import { CatPixel } from './ValeriaCatPixel';
import { BlockIcon } from './ValeriaBlockIcons';
import { useT } from './i18n';
import { KidButton } from './ui/KidButton';
import { FONT } from './ui/fonts';
// import logoWhite from '../../assets/valeria-logo-white.png';

export const ValeriaWelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
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
      <StatusBar barStyle="dark-content" />
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
            <Breathe><CatPixel size={104} /></Breathe>
          </Animated.View>
        </View>

        <Animated.View style={contentStyle}>
          {/* <Image source={logoWhite} style={s.logo} /> */}
          <Text style={s.logoFallback}>valeria+</Text>

          <Text style={s.tagline}>{t.welcome.tagline}</Text>
          <Text style={s.sub}>{t.welcome.sub}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[s.actions, contentStyle]}>
        <KidButton label={t.welcome.start} onPress={() => navigation.navigate('Credits')} />
        <View style={s.trust}>
          <BlockIcon name="lock" color="#0b1220" size={13} />
          <Text style={s.trustTxt}>{t.welcome.trust}</Text>
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
  logoFallback: { color: '#0b1220', fontFamily: FONT.display, fontSize: 44, letterSpacing: 0.5, marginTop: 28, textAlign: 'center' },
  tagline: { fontSize: 20, fontFamily: FONT.displaySemi, color: '#0b1220', textAlign: 'center', marginTop: 14, lineHeight: 23, maxWidth: 280, alignSelf: 'center' },
  sub: { fontSize: 15, fontFamily: FONT.bodyBold, color: '#0b1220', textAlign: 'center', marginTop: 10, lineHeight: 20, maxWidth: 270, alignSelf: 'center' },
  actions: { paddingHorizontal: 28, paddingBottom: 28 },
  primaryBtn: {
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    shadowColor: 'rgba(11,18,32,.18)', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 1, shadowRadius: 26, elevation: 6,
  },
  // primaryDark sobre blanco daba 3,1:1 (WCAG AA pide 4,5:1); dark da 18,7:1.
  primaryBtnTxt: { fontFamily: FONT.display,color: V.color.dark, fontSize: 17 },
  trust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 },
  trustTxt: { color: '#0b1220', fontSize: 12, fontFamily: FONT.bodyBold },
});

export default ValeriaWelcomeScreen;

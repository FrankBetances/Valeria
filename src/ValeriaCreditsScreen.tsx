// ============================================================================
// Valeria+ · Pantalla de Créditos (V3.1)
// Splash de reconocimiento mostrado tras "Comenzar" desde la bienvenida.
// Acredita al autor clínico del proyecto y a las entidades colaboradoras.
// Cada bloque entra de forma escalonada (fade + deslizamiento) y el avatar
// flota con un pulso suave. No persiste datos; solo navega a la Ficha de Registro.
//   Continuar → navigation.navigate('FichaRegistro')
// ============================================================================
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import { V } from './valeriaTheme';
import { BearMark } from './ValeriaBearLogo';
// import logoWhite from '../../assets/valeria-logo-white.png';

interface Colaborador { icon: string; nombre: string; desc: string; }

const COLABORADORES: Colaborador[] = [
  { icon: '🤝', nombre: 'Acopros', desc: 'Asociación de Colaboración y Promoción del Sordo' },
  { icon: '🗣️', nombre: 'Quisqueya Habla', desc: 'Rehabilitación del lenguaje' },
];

// Atribución de las voces neuronales pre-generadas (plan ILENIA/Nós): las
// licencias de los modelos piden acreditar la voz utilizada.
const VOICE_CREDIT =
  'Voz neuronal en castellano: «Sharvard» (Piper · rhasspy/piper-voices). ' +
  'En galego (próximamente): «Celtia» · Proxecto Nós. ' +
  'Euskaraz: HiTZ-TTS · ILENIA/NEL-GAITU (UPV/EHU · Aholab).';

// Secuencia de entrada: marca, kicker, autor, divisor, colaboradores, voces y CTA.
const SECTIONS = 6 + COLABORADORES.length;

export const ValeriaCreditsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const sections = useRef(Array.from({ length: SECTIONS }, () => new Animated.Value(0))).current;

  useEffect(() => {
    // Entrada escalonada de cada bloque.
    Animated.stagger(
      130,
      sections.map((a) =>
        Animated.timing(a, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();

    // Pulso tipo latido para el avatar clínico.
    Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(pulse, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 340, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
  }, [float, pulse, sections]);

  const translateY = float.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.09] });

  const fadeUp = (i: number) => ({
    opacity: sections[i],
    transform: [{ translateY: sections[i].interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
  });

  return (
    <View style={s.flex}>
      <StatusBar barStyle="light-content" />

      {/* círculos decorativos */}
      <View style={[s.blob, { top: -80, left: -60, width: 240, height: 240, opacity: 0.12 }]} />
      <View style={[s.blob, { bottom: 90, right: -80, width: 220, height: 220, opacity: 0.08 }]} />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.brandRow, fadeUp(0)]}>
          <BearMark size={54} variant="brown" />
          {/* <Image source={logoWhite} style={s.logo} /> */}
          <Text style={s.brand}>valeria</Text>
        </Animated.View>

        <Animated.Text style={[s.kicker, fadeUp(1)]}>Proyecto desarrollado por</Animated.Text>

        {/* tarjeta del autor */}
        <Animated.View style={[s.doctorCard, fadeUp(2)]}>
          <Animated.View style={[s.doctorAvatar, { transform: [{ translateY }, { scale: pulseScale }] }]}>
            <Text style={s.doctorAvatarIcon}>🩺</Text>
          </Animated.View>
          <Text style={s.doctorName}>Dr. Frank Betances</Text>
          <Text style={s.doctorRole}>Otorrinolaringólogo infantil</Text>
        </Animated.View>

        {/* divisor */}
        <Animated.View style={[s.dividerRow, fadeUp(3)]}>
          <View style={s.dividerLine} />
          <Text style={s.dividerLabel}>En colaboración con</Text>
          <View style={s.dividerLine} />
        </Animated.View>

        {/* colaboradores */}
        <View style={s.collabList}>
          {COLABORADORES.map((c, i) => (
            <Animated.View key={c.nombre} style={[s.collabCard, fadeUp(4 + i)]}>
              <View style={s.collabIcon}>
                <Text style={s.collabIconText}>{c.icon}</Text>
              </View>
              <View style={s.collabBody}>
                <Text style={s.collabName}>{c.nombre}</Text>
                <Text style={s.collabDesc}>{c.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* atribución de voces neuronales */}
        <Animated.Text style={[s.voiceCredit, fadeUp(4 + COLABORADORES.length)]}>{VOICE_CREDIT}</Animated.Text>
      </ScrollView>

      {/* acción */}
      <Animated.View style={[s.actions, fadeUp(SECTIONS - 1)]}>
        <Pressable
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.9 }]}
          onPress={() => navigation?.navigate('FichaRegistro')}
        >
          <Text style={s.ctaText}>Continuar</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.primary },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: '#ffffff' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 36 },

  logo: { height: 30, width: 132, resizeMode: 'contain' },
  brandRow: { alignItems: 'center', gap: 8 },
  brand: { fontSize: 26, fontWeight: V.font.extrabold, color: '#fff', letterSpacing: -0.6 },

  kicker: {
    marginTop: 30, fontSize: 12, fontWeight: V.font.extrabold, letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
  },

  doctorCard: {
    marginTop: 16, width: '100%', backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 22,
    paddingVertical: 24, paddingHorizontal: 22, alignItems: 'center',
  },
  doctorAvatar: {
    width: 74, height: 74, borderRadius: 37, backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },
  doctorAvatarIcon: { fontSize: 34 },
  doctorName: { marginTop: 16, fontSize: 21, fontWeight: '900', color: '#fff', lineHeight: 24 },
  doctorRole: { marginTop: 6, fontSize: 13.5, fontWeight: V.font.bold, color: 'rgba(255,255,255,0.88)' },

  dividerRow: { marginTop: 26, flexDirection: 'row', alignItems: 'center', width: '100%' },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerLabel: {
    marginHorizontal: 12, fontSize: 11.5, fontWeight: V.font.extrabold, letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase',
  },

  collabList: { marginTop: 18, width: '100%', gap: 11 },
  collabCard: {
    backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 15,
    paddingVertical: 15, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center',
  },
  collabIcon: {
    width: 42, height: 42, borderRadius: 13, backgroundColor: V.color.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 13,
  },
  collabIconText: { fontSize: 20 },
  collabBody: { flex: 1 },
  collabName: { fontSize: 16, fontWeight: '900', color: V.color.dark, lineHeight: 18 },
  collabDesc: { marginTop: 3, fontSize: 12, fontWeight: V.font.bold, color: '#5b6b6a' },

  voiceCredit: {
    marginTop: 16, fontSize: 10.5, fontWeight: V.font.bold, lineHeight: 15,
    color: 'rgba(255,255,255,0.72)', textAlign: 'center', paddingHorizontal: 6,
  },

  actions: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 22 },
  cta: {
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    ...V.shadow.button, shadowColor: 'rgba(11,18,32,0.18)',
  },
  ctaText: { color: V.color.primaryDark, fontSize: 17, fontWeight: V.font.extrabold },
});

export default ValeriaCreditsScreen;

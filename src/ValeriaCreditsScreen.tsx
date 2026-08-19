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
import { CatPixel } from './ValeriaCatPixel';
import { ValeriaBetancesCrest } from './ValeriaBetancesCrest';
import { AcoprosMark, ItemasSeal, QuisqueyaMark } from './ValeriaPartnerLogos';
import { useT } from './i18n';
import { ValeriaUiLangPicker } from './ValeriaUiLangPicker';
// import logoWhite from '../../assets/valeria-logo-white.png';

// Secuencia de entrada: marca, kicker, autor, divisor, dos colaboradores,
// divisor de reconocimiento, sello, voces, tecnología de RA, selector de
// idioma y CTA. El índice de cada bloque sale de `step()` en orden de
// aparición: la aritmética a mano (4 + i, 5 + COUNT…) se descuadraba en
// cuanto se metía una sección nueva por el medio.
const COLLABORATOR_COUNT = 2;
const SECTIONS = 10 + COLLABORATOR_COUNT;

export const ValeriaCreditsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const t = useT();

  // Los colaboradores llevan nombre propio (no se traduce) y descripción (sí).
  const colaboradores = [
    { mark: <AcoprosMark size={34} />, nombre: 'Acopros', desc: t.credits.acoprosDesc },
    { mark: <QuisqueyaMark size={34} />, nombre: 'Quisqueya Habla', desc: t.credits.quisqueyaDesc },
  ];

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

  // Índice de bloque en orden de aparición. Se consume una vez por render.
  let cursor = 0;
  const step = () => fadeUp(cursor++);

  return (
    <View style={s.flex}>
      <StatusBar barStyle="light-content" />

      {/* círculos decorativos */}
      <View style={[s.blob, { top: -80, left: -60, width: 240, height: 240, opacity: 0.12 }]} />
      <View style={[s.blob, { bottom: 90, right: -80, width: 220, height: 220, opacity: 0.08 }]} />

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.brandRow, step()]}>
          <CatPixel size={54} />
          {/* <Image source={logoWhite} style={s.logo} /> */}
          <Text style={s.brand}>valeria</Text>
        </Animated.View>

        <Animated.Text style={[s.kicker, step()]}>{t.credits.kicker}</Animated.Text>

        {/* tarjeta del autor */}
        <Animated.View style={[s.doctorCard, step()]}>
          <Animated.View style={[s.doctorAvatar, { transform: [{ translateY }, { scale: pulseScale }] }]}>
            <ValeriaBetancesCrest size={112} />
          </Animated.View>
          <Text style={s.doctorName}>Dr. Frank Betances</Text>
          <Text style={s.doctorRole}>{t.credits.authorRole}</Text>
        </Animated.View>

        {/* divisor */}
        <Animated.View style={[s.dividerRow, step()]}>
          <View style={s.dividerLine} />
          <Text style={s.dividerLabel}>{t.credits.collaborators}</Text>
          <View style={s.dividerLine} />
        </Animated.View>

        {/* colaboradores */}
        <View style={s.collabList}>
          {colaboradores.map((c) => (
            <Animated.View key={c.nombre} style={[s.collabCard, step()]}>
              <View style={s.collabIcon}>{c.mark}</View>
              <View style={s.collabBody}>
                <Text style={s.collabName}>{c.nombre}</Text>
                <Text style={s.collabDesc}>{c.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* acreditación: no es un colaborador, va bajo su propio rótulo */}
        <Animated.View style={[s.dividerRow, step()]}>
          <View style={s.dividerLine} />
          <Text style={s.dividerLabel}>{t.credits.recognition}</Text>
          <View style={s.dividerLine} />
        </Animated.View>

        <Animated.View style={[s.sealCard, step()]}>
          <ItemasSeal size={58} />
          <View style={s.collabBody}>
            <Text style={s.collabName}>{t.credits.qualitySeal}</Text>
            <Text style={s.collabDesc}>{t.credits.qualitySealDesc}</Text>
          </View>
        </Animated.View>

        {/* atribución de voces neuronales */}
        <Animated.Text style={[s.voiceCredit, step()]}>{t.credits.voiceCredit}</Animated.Text>

        {/* atribución de la tecnología de Realidad Aumentada */}
        <Animated.Text style={[s.voiceCredit, step()]}>{t.credits.arCredit}</Animated.Text>

        {/* Selector de idioma de INTERFAZ. Vive aquí porque Créditos es la
            primera pantalla que ve quien entra por «Comenzar»: quien no lee
            castellano puede cambiar el idioma antes de llegar a la ficha, sin
            tener que atravesar el alta a ciegas. */}
        <Animated.View style={[s.langBlock, step()]}>
          <ValeriaUiLangPicker />
        </Animated.View>
      </ScrollView>

      {/* acción */}
      <Animated.View style={[s.actions, fadeUp(SECTIONS - 1)]}>
        <Pressable
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.9 }]}
          onPress={() => navigation?.navigate('FichaRegistro')}
        >
          <Text style={s.ctaText}>{t.common.continue}</Text>
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
  // El emblema es un PNG transparente: aquí no hay fondo ni recorte, el anillo
  // y el ave clara se apoyan directamente sobre el turquesa de la tarjeta.
  doctorAvatar: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
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
  collabBody: { flex: 1 },

  // El sello trae su propio blanco y es más alto que ancho, así que va sin
  // placa: se apoya directamente sobre la tarjeta.
  sealCard: {
    marginTop: 18, width: '100%', backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 15,
    paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
  },

  collabName: { fontSize: 16, fontWeight: '900', color: V.color.dark, lineHeight: 18 },
  collabDesc: { marginTop: 3, fontSize: 12, fontWeight: V.font.bold, color: '#5b6b6a' },

  voiceCredit: {
    marginTop: 16, fontSize: 10.5, fontWeight: V.font.bold, lineHeight: 15,
    color: 'rgba(255,255,255,0.72)', textAlign: 'center', paddingHorizontal: 6,
  },

  langBlock: { marginTop: 24, width: '100%' },

  actions: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 22 },
  cta: {
    backgroundColor: '#fff', borderRadius: 16, paddingVertical: 17, alignItems: 'center',
    ...V.shadow.button, shadowColor: 'rgba(11,18,32,0.18)',
  },
  ctaText: { color: V.color.primaryDark, fontSize: 17, fontWeight: V.font.extrabold },
});

export default ValeriaCreditsScreen;

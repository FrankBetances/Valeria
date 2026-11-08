// ============================================================================
// Valeria+ · Presentación de Lúa física, entre Créditos y la ficha.
//
// El aparato se DIBUJA aquí (cuerpo + panel redondo) y la cara sale de
// `CatPixel`, la misma rejilla que la app usa en todas partes y que el firmware
// espeja en su panel de 240×240. Es la regla 5b: un solo personaje, dos
// superficies. Nada de fotos ni renders de stock — traen otra gata y, la vez
// que se intentó, hasta una marca ajena en el pecho.
// ============================================================================
import React from 'react';
import { Breathe } from './ui/motion';
import { View, Text, Pressable, StyleSheet, ScrollView, StatusBar, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { V } from './valeriaTheme';
import { useT } from './i18n';
import { BlockIcon } from './ValeriaBlockIcons';
import { CatPixel } from './ValeriaCatPixel';
import { FONT } from './ui/fonts';
import { KidButton } from './ui/KidButton';

// El pedido va al correo de contacto del proyecto, que es una decisión fija.
// No se enlaza ningún dominio de tienda mientras no exista: un enlace externo
// de compra en una app infantil es además terreno de las reglas de Play.
const CONTACTO = 'frank.alberto.betances.reinoso@gmail.com';

/** El aparato: cuerpo claro, orejas y el panel redondo con la cara de Lúa. */
const LuaDevice: React.FC<{ label: string }> = ({ label }) => (
  <View style={s.device} accessible accessibilityRole="image" accessibilityLabel={label}>
    <View style={s.panel}>
      <Breathe><CatPixel pose="head" size={124} /></Breathe>
    </View>
    <View style={s.deviceBtn} />
  </View>
);

export const ValeriaLuaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <View style={s.flex}>
      <StatusBar barStyle="dark-content" />
      <View style={[s.blob, { top: -100, left: -80, width: 300, height: 300, opacity: 0.12 }]} />
      <View style={[s.blob, { bottom: -50, right: -100, width: 280, height: 280, opacity: 0.08 }]} />

      <ScrollView
        contentContainerStyle={[s.content, { paddingTop: insets.top + 24, paddingBottom: 108 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <Text style={s.title}>{t.luaIntro.title}</Text>
          <Text style={s.subtitle}>{t.luaIntro.sub}</Text>
        </View>

        <View style={s.deviceCard}>
          <LuaDevice label={t.luaIntro.deviceAlt} />
          <Pressable
            style={({ pressed }) => [s.requestBtn, pressed && { opacity: 0.9 }]}
            onPress={() => Linking.openURL(`mailto:${CONTACTO}?subject=${encodeURIComponent(t.luaIntro.request)}`)}
            accessibilityRole="button"
            accessibilityLabel={t.luaIntro.request}
          >
            <BlockIcon name="heart" size={18} color="#fff" />
            <Text style={s.requestBtnTxt}>{t.luaIntro.request}</Text>
          </Pressable>
        </View>

        <View style={s.actionsContainer}>
          <Text style={s.actionsTitle}>{t.luaIntro.who}</Text>

          <Pressable
            style={({ pressed }) => [s.primaryActionBtn, pressed && { opacity: 0.92 }]}
            onPress={() => navigation.navigate('FichaRegistro')}
            accessibilityRole="button"
            accessibilityLabel={t.luaIntro.newPatient}
          >
            <View style={s.iconWrapPrimary}><BlockIcon name="plus" size={24} color="#fff" /></View>
            <View style={s.actionTexts}>
              <Text style={s.actionBtnTitle}>{t.luaIntro.newPatient}</Text>
              <Text style={s.actionBtnSub}>{t.luaIntro.newPatientSub}</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [s.secondaryActionBtn, pressed && { opacity: 0.92 }]}
            onPress={() => navigation.navigate('PatientSelect')}
            accessibilityRole="button"
            accessibilityLabel={t.luaIntro.existing}
          >
            <View style={s.iconWrapSecondary}><BlockIcon name="family" size={24} color={V.color.primaryDark} /></View>
            <View style={s.actionTexts}>
              <Text style={s.actionBtnTitleSecondary}>{t.luaIntro.existing}</Text>
              <Text style={s.actionBtnSubSecondary}>{t.luaIntro.existingSub}</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[s.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={s.navBtn} onPress={() => navigation.goBack()} accessibilityRole="button">
          <Text style={s.navBtnTxt}>{t.common.back}</Text>
        </Pressable>
        <View style={{ flexGrow: 1 }}>
          <KidButton label={t.common.continue} onPress={() => navigation.navigate('PatientSelect')} />
        </View>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff8ec', overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: V.color.primary },
  content: { paddingHorizontal: 24 },

  header: { marginTop: 12, marginBottom: 20, alignItems: 'center' },
  title: { fontFamily: FONT.display, fontSize: 34, lineHeight: 40, color: '#0b1220', textAlign: 'center' },
  subtitle: {
    fontSize: 16, fontFamily: FONT.bodyBold, color: '#4b5563',
    textAlign: 'center', marginTop: 8, lineHeight: 22,
  },

  deviceCard: {
    backgroundColor: V.color.card,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: 'rgba(11,18,32,0.12)', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 5,
    marginBottom: 32,
  },

  // El aparato: cuerpo claro con el panel redondo y su botón. Medidas fijas,
  // es un dibujo. La cara de dentro la pone CatPixel, no este fichero.
  device: {
    width: 196, height: 206, borderRadius: 40,
    backgroundColor: V.color.primaryLight,
    borderWidth: 3, borderColor: V.color.borderActive,
    alignItems: 'center', justifyContent: 'flex-start',
    paddingTop: 16, marginBottom: 18,
  },
  panel: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: V.color.dark,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  deviceBtn: {
    marginTop: 12,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: V.color.primary,
    borderWidth: 2, borderColor: V.color.borderActive,
  },

  requestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: V.color.primaryDark,
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 14, width: '100%',
  },
  requestBtnTxt: { fontFamily: FONT.bodyBlack,color: '#fff', fontSize: 16 },

  actionsContainer: { gap: 12 },
  actionsTitle: {
    fontSize: 13, fontFamily: FONT.bodyBlack, color: '#4b5563',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4, marginLeft: 8,
  },

  primaryActionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: V.color.card, padding: 16, borderRadius: 18,
    shadowColor: 'rgba(11,18,32,0.1)', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1, shadowRadius: 12, elevation: 3,
  },
  iconWrapPrimary: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: V.color.primary,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },

  secondaryActionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#ffffff', padding: 16, borderRadius: 18,
    borderWidth: 2, borderColor: '#e3dccf',
  },
  iconWrapSecondary: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: V.color.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },

  actionTexts: { flex: 1 },
  actionBtnTitle: { fontFamily: FONT.display,fontSize: 17, color: V.color.primaryDark, marginBottom: 2 },
  actionBtnSub: { fontFamily: FONT.bodyBold,fontSize: 13, color: V.color.textSecondary },

  actionBtnTitleSecondary: { fontFamily: FONT.display, fontSize: 17, color: V.color.textPrimary, marginBottom: 2 },
  actionBtnSubSecondary: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.textSecondary },

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16,
    backgroundColor: '#fff8ec', gap: 14,
    borderTopWidth: 0,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 8 },
  navBtnTxt: { fontFamily: FONT.bodyBlack, color: '#0b1220', fontSize: 16 },

  navBtnForward: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff',
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12,
  },
  navBtnForwardTxt: { fontFamily: FONT.bodyBlack,color: V.color.primaryDark, fontSize: 15 },
});

export default ValeriaLuaScreen;

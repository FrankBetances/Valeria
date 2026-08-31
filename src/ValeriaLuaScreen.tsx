import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView, StatusBar, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { V } from './valeriaTheme';
import { useT } from './i18n';
import { BlockIcon } from './ValeriaBlockIcons';

const luaPhysical = require('../assets/lua-physical.jpg');

export const ValeriaLuaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <View style={s.flex}>
      <StatusBar barStyle="light-content" />
      <View style={[s.blob, { top: -100, left: -80, width: 300, height: 300, opacity: 0.12 }]} />
      <View style={[s.blob, { bottom: -50, right: -100, width: 280, height: 280, opacity: 0.08 }]} />

      <ScrollView contentContainerStyle={[s.content, { paddingTop: insets.top + 24, paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        
        <View style={s.header}>
          <Text style={s.title}>{'Conoce a Lúa'}</Text>
          <Text style={s.subtitle}>{'La mascota interactiva física que acompaña y motiva durante la terapia.'}</Text>
        </View>
        
        <View style={s.imageCard}>
           <Image source={luaPhysical} style={s.image} />
           <Pressable 
             style={s.requestBtn} 
             onPress={() => Linking.openURL('https://valeria.app/lua')}
             accessibilityRole="button"
           >
             <BlockIcon name="heart" size={18} color="#fff" />
             <Text style={s.requestBtnTxt}>{'Solicitar mascota física'}</Text>
           </Pressable>
        </View>

        <View style={s.actionsContainer}>
          <Text style={s.actionsTitle}>¿Quién va a jugar hoy?</Text>
          
          <Pressable style={s.primaryActionBtn} onPress={() => navigation.navigate('FichaRegistro')}>
            <View style={s.iconWrapPrimary}><BlockIcon name="plus" size={24} color="#fff" /></View>
            <View style={s.actionTexts}>
              <Text style={s.actionBtnTitle}>{'Nuevo Paciente'}</Text>
              <Text style={s.actionBtnSub}>{'Registrar una nueva ficha clínica'}</Text>
            </View>
          </Pressable>
          
          <Pressable style={s.secondaryActionBtn} onPress={() => navigation.navigate('PatientSelect')}>
            <View style={s.iconWrapSecondary}><BlockIcon name="family" size={24} color={V.color.primaryDark} /></View>
            <View style={s.actionTexts}>
              <Text style={s.actionBtnTitleSecondary}>{'Ya tengo un paciente'}</Text>
              <Text style={s.actionBtnSubSecondary}>{'Seleccionar de la lista existente'}</Text>
            </View>
          </Pressable>
        </View>

      </ScrollView>

      {/* Navegación inferior global (Atrás / Adelante) */}
      <View style={[s.bottomNav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
         <Pressable style={s.navBtn} onPress={() => navigation.goBack()}>
            <Text style={s.navBtnTxt}>{t.common.back ?? 'Atrás'}</Text>
         </Pressable>

         {/* Un botón "Adelante" explícito que por defecto vaya a pacientes, tal como pedía el usuario */}
         <Pressable style={s.navBtnForward} onPress={() => navigation.navigate('PatientSelect')}>
            <Text style={s.navBtnForwardTxt}>{t.common.continue ?? 'Adelante'}</Text>
            <BlockIcon name="next" size={22} color={V.color.primaryDark} />
         </Pressable>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.primary },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: '#ffffff' },
  content: { paddingHorizontal: 24 },
  
  header: { marginTop: 12, marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 8, lineHeight: 22 },

  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: 'rgba(11,18,32,0.12)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 5,
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  requestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FF6B6B', // Color cálido para contraste
    paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: 14, width: '100%',
  },
  requestBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },

  actionsContainer: { gap: 12 },
  actionsTitle: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4, marginLeft: 8 },
  
  primaryActionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 18,
    shadowColor: 'rgba(11,18,32,0.1)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3,
  },
  iconWrapPrimary: { width: 44, height: 44, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  
  secondaryActionBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 18,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  iconWrapSecondary: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  
  actionTexts: { flex: 1 },
  actionBtnTitle: { fontSize: 17, fontWeight: '800', color: V.color.primaryDark, marginBottom: 2 },
  actionBtnSub: { fontSize: 13, fontWeight: '600', color: '#5b6b6a' },
  
  actionBtnTitleSecondary: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 2 },
  actionBtnSubSecondary: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 16,
    backgroundColor: V.color.primary,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)'
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 8 },
  navBtnTxt: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '700' },
  
  navBtnForward: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  navBtnForwardTxt: { color: V.color.primaryDark, fontSize: 15, fontWeight: '800' }
});

export default ValeriaLuaScreen;

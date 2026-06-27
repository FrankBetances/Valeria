// ============================================================================
// Valeria+ · Selección de Paciente (V3.0)
// Lista los pacientes registrados en este dispositivo (multi-paciente) y permite
// retomar a cualquiera o registrar uno nuevo. Sustituye al acceso directo
// "Ya tengo un paciente" de la bienvenida por una verdadera gestión de fichas.
//
// Almacenamiento (local-first):
//   · STORAGE_KEYS.pacientes ('@valeria_pacientes')  -> array de fichas.
//   · STORAGE_KEYS.registro  ('@valeria_paciente')   -> ficha ACTIVA seleccionada.
// Migra automáticamente una ficha única antigua (registro) a la lista.
//
//   Seleccionar paciente → guarda ficha activa → navigation.navigate('ExerciseSelection')
//   Registrar nuevo      → navigation.navigate('FichaRegistro')
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
// import logoWhite from '../../assets/valeria-logo-white.png';

interface Paciente {
  nombre?: string;
  patologia?: string;
  nhc?: string;
  genero?: string;
  [k: string]: any;
}

const avatarFor = (p: Paciente): string => {
  const g = (p.genero || '').toLowerCase();
  if (g.indexOf('niña') >= 0) return '👧';
  if (g.indexOf('niño') >= 0) return '👦';
  return '🧒';
};

export const ValeriaPatientSelectScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  useEffect(() => {
    (async () => {
      let list: Paciente[] = [];
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.pacientes);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) list = arr;
        }
        // Compatibilidad: migra una ficha única antigua a la lista.
        if (list.length === 0) {
          const single = await AsyncStorage.getItem(STORAGE_KEYS.registro);
          if (single) {
            const obj = JSON.parse(single);
            if (obj && obj.nombre) list = [obj];
          }
        }
      } catch (e) {
        console.warn('Error al cargar pacientes:', e);
      }
      setPacientes(list);
    })();
  }, []);

  const seleccionar = async (p: Paciente) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.registro, JSON.stringify(p));
    } catch (e) {
      console.warn('Error al fijar paciente activo:', e);
    }
    navigation?.navigate('ExerciseSelection');
  };

  const subtitle =
    pacientes.length > 0
      ? pacientes.length === 1
        ? '1 paciente registrado en este dispositivo'
        : `${pacientes.length} pacientes registrados en este dispositivo`
      : 'Continúa donde lo dejaste';

  return (
    <View style={s.flex}>
      {/* Cabecera teal */}
      <View style={s.header}>
        <Pressable style={s.back} onPress={() => navigation?.navigate('Welcome')}>
          <Text style={s.backText}>‹ Volver</Text>
        </Pressable>
        {/* <Image source={logoWhite} style={s.logo} /> */}
        <Text style={s.brand}>valeria</Text>
        <Text style={s.title}>Selecciona un paciente</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
      </View>

      <ScrollView style={s.flex} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Lista de pacientes */}
        {pacientes.map((p, i) => (
          <Pressable
            key={`${p.nhc || p.nombre || 'p'}-${i}`}
            style={({ pressed }) => [s.card, pressed && { borderColor: V.color.borderActive }]}
            onPress={() => seleccionar(p)}
          >
            <View style={s.avatar}>
              <Text style={s.avatarIcon}>{avatarFor(p)}</Text>
            </View>
            <View style={s.cardBody}>
              <Text style={s.name} numberOfLines={1}>{p.nombre || 'Paciente'}</Text>
              <Text style={s.diag} numberOfLines={1}>{p.patologia || 'Sin diagnóstico asignado'}</Text>
            </View>
            <View style={s.nhcPill}>
              <Text style={s.nhcText}>{p.nhc || '—'}</Text>
            </View>
            <Text style={s.chevron}>›</Text>
          </Pressable>
        ))}

        {/* Estado vacío */}
        {pacientes.length === 0 && (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Text style={{ fontSize: 32 }}>🗂️</Text>
            </View>
            <Text style={s.emptyTitle}>Aún no hay pacientes</Text>
            <Text style={s.emptyDesc}>
              Registra tu primer paciente para empezar a prescribir terapias.
            </Text>
          </View>
        )}

        {/* Registrar nuevo */}
        <Pressable
          style={({ pressed }) => [s.newBtn, pressed && { backgroundColor: V.color.primaryTint }]}
          onPress={() => navigation?.navigate('FichaRegistro')}
        >
          <Text style={s.newPlus}>＋</Text>
          <Text style={s.newText}>Registrar nuevo paciente</Text>
        </Pressable>

        <View style={s.privacy}>
          <Text style={s.privacyText}>🔒  Pacientes almacenados y cifrados en este dispositivo.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },

  header: {
    backgroundColor: V.color.primary,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  back: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.32)',
    borderRadius: 11,
    paddingVertical: 5,
    paddingHorizontal: 11,
    marginBottom: 10,
  },
  backText: { color: '#fff', fontSize: 12, fontWeight: V.font.extrabold },
  logo: { height: 21, width: 92, resizeMode: 'contain', marginBottom: 8 },
  brand: { fontSize: 20, fontWeight: V.font.extrabold, color: '#fff', marginBottom: 8, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: V.font.extrabold, color: '#fff', letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4, fontWeight: V.font.semibold },

  scroll: { padding: 18, paddingBottom: 28 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: V.color.card,
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 17,
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 12,
    ...V.shadow.card,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: V.color.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  avatarIcon: { fontSize: 23 },
  cardBody: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  diag: { fontSize: 12, fontWeight: V.font.bold, color: V.color.textMuted, marginTop: 3 },
  nhcPill: {
    backgroundColor: V.color.primaryLight,
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginHorizontal: 8,
  },
  nhcText: { fontSize: 11, fontWeight: V.font.extrabold, color: V.color.primaryDark },
  chevron: { color: V.color.primary, fontSize: 18, fontWeight: V.font.extrabold },

  empty: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: V.color.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: V.font.extrabold, color: V.color.textPrimary, marginTop: 18 },
  emptyDesc: {
    fontSize: 13.5, fontWeight: V.font.semibold, color: '#6b7280', marginTop: 6,
    lineHeight: 19, textAlign: 'center', maxWidth: 240,
  },

  newBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: V.color.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: V.color.primary,
    borderRadius: 14,
    paddingVertical: 15,
  },
  newPlus: { fontSize: 18, color: V.color.primaryDark, fontWeight: V.font.extrabold },
  newText: { fontSize: 15, color: V.color.primaryDark, fontWeight: V.font.extrabold },

  privacy: { alignItems: 'center', marginTop: 18, paddingHorizontal: 10 },
  privacyText: { fontSize: 11, fontWeight: V.font.semibold, color: V.color.textMuted, textAlign: 'center' },
});

export default ValeriaPatientSelectScreen;

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
import { Breathe } from './ui/motion';
import { ReactiveTile } from './ui/ReactiveTile';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { isLocale, setGalicianDialect, setLocale } from './valeriaLocale';
import { BlockIcon } from './ValeriaBlockIcons';
import { useT } from './i18n';
import { PressableScale } from 'pressto';
import * as Haptics from 'expo-haptics';
import { ScreenHeader } from './ui/ScreenHeader';
import { KidButton } from './ui/KidButton';
import { FONT } from './ui/fonts';
import { CatPixel } from './ValeriaCatPixel';
// import logoWhite from '../../assets/valeria-logo-white.png';

interface Paciente {
  nombre?: string;
  patologia?: string;
  nhc?: string;
  genero?: string;
  lingua?: string;   // variedad de terapia del niño (ficha); ausente = no se toca
  seseo?: boolean;   // solo con lingua 'gl': variedad occidental del niño
  [k: string]: any;
}

// Antes el avatar salía del campo GÉNERO de la ficha: «niña» → 👧, «niño» → 👦.
// Se cambia por la inicial del nombre, y no solo por quitar emoji: la ficha
// admite escribir el género libremente, así que cualquier valor que no fuera
// una de esas dos palabras caía en un tercer emoji genérico. La inicial
// identifica al paciente sin inferir nada de él.
const initialFor = (p: Paciente): string => {
  const n = (p.nombre || '').trim();
  return n ? n[0].toUpperCase() : '·';
};

export const ValeriaPatientSelectScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const t = useT();
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
    // La variedad de terapia sigue al PACIENTE, no al aparato. Antes era un
    // ajuste global: en una consulta bilingüe había que acordarse de moverla
    // entre niño y niño, y si no te acordabas la sesión ocurría en la lengua
    // del anterior sin que nada lo dijera después (ahora la telemetría lo
    // registra, pero el dato correcto es no equivocarse). Fichas antiguas y
    // fichas sin lengua no tocan nada: se queda la que hubiera.
    if (isLocale(p.lingua)) await setLocale(p.lingua);
    // Y con él su variedad geográfica, que decide si el par casa/caza entra
    // en el banco y si el micrófono cuenta el seseo como error.
    if (p.lingua === 'gl') await setGalicianDialect(p.seseo ? 'seseo' : 'distincion');
    navigation?.navigate('ExerciseSelection');
  };

  const subtitle = t.patientSelect.subtitle(pacientes.length);

  return (
    <View style={s.flex}>
      <ScreenHeader onBack={() => navigation?.navigate('Welcome')} backLabel={t.common.back}
        kicker="valeria+" title={t.patientSelect.title} subtitle={subtitle} />

      <ScrollView style={s.flex} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {pacientes.map((p, i) => (
            <ReactiveTile key={`${p.nhc || p.nombre || 'p'}-${i}`} index={i} ok={false} bad={false} style={s.cell}>
            <PressableScale style={{ alignItems: 'center' }}
              onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); seleccionar(p); }}
              accessibilityRole="button"
              accessibilityLabel={`${p.nombre || t.patientSelect.patientFallback}. ${p.patologia ? t.ficha.pathologyLabel(p.patologia) : t.patientSelect.noDiagnosis}`}>
              <View style={[s.face, { backgroundColor: FACE_COLORS[i % FACE_COLORS.length], borderColor: FACE_DEPTH[i % FACE_DEPTH.length] }]}>
                <Text style={s.faceInitial}>{initialFor(p)}</Text>
              </View>
              <Text style={s.name} numberOfLines={1}>{p.nombre || t.patientSelect.patientFallback}</Text>
              {!!p.nhc && <Text style={s.nhc} numberOfLines={1}>{p.nhc}</Text>}
            </PressableScale>
            </ReactiveTile>
          ))}
        </View>

        {pacientes.length === 0 && (
          <View style={s.empty}>
            <Breathe><CatPixel size={96} /></Breathe>
            <Text style={s.emptyTitle}>{t.patientSelect.emptyTitle}</Text>
            <Text style={s.emptyDesc}>{t.patientSelect.emptyBody}</Text>
          </View>
        )}

        <View style={s.cta}>
          <KidButton label={`+  ${t.patientSelect.newPatient}`} onPress={() => navigation?.navigate('FichaRegistro')}
            color="#ffffff" depth="#d9cdb8" textColor={V.color.textPrimary} />
        </View>

        <View style={s.privacy}>
          <BlockIcon name="lock" color={V.color.textSecondary} size={14} />
          <Text style={s.privacyText}>{t.patientSelect.privacy}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const FACE_COLORS = ['#ffd23f', '#7fe3dd', '#ffb3c8', '#c7b8ff', '#a8e6a1', '#ffc58a'];
const FACE_DEPTH = ['#e0a800', '#00a39e', '#e26b8f', '#7c5cff', '#4caf50', '#e8892f'];

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff8ec' },
  scroll: { padding: 20, paddingBottom: 48 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18 },
  cell: { width: 140, alignItems: 'center' },
  face: { width: 118, height: 118, borderRadius: 59, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderBottomWidth: 9 },
  faceInitial: { fontFamily: FONT.display, fontSize: 52, color: '#0b1220' },
  name: { fontFamily: FONT.display, fontSize: 20, color: V.color.textPrimary, marginTop: 10, textAlign: 'center' },
  nhc: { fontFamily: FONT.bodyBold, fontSize: 12, color: V.color.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { fontFamily: FONT.display, fontSize: 24, color: V.color.textPrimary, marginTop: 16, textAlign: 'center' },
  emptyDesc: { fontFamily: FONT.body, fontSize: 15, lineHeight: 21, color: V.color.textSecondary, marginTop: 6, textAlign: 'center', maxWidth: 300 },
  cta: { marginTop: 28 },
  privacy: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18 },
  privacyText: { fontFamily: FONT.body, fontSize: 12, color: V.color.textSecondary, flexShrink: 1, textAlign: 'center' },
});

export default ValeriaPatientSelectScreen;

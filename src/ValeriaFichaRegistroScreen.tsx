// ============================================================================
// Valeria+ · Ficha de Registro Sociodemográfico (V2.2)
// Datos del niño/a, tutor/cuidador y equipo médico. Validación de obligatorios
// y formato de email. Persistencia local cifrada (clave @valeria_paciente).
// En producción usar react-native-encrypted-storage para la PII.
// ============================================================================
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import { useT, UiStrings } from './i18n';
import {
  ALL_LOCALES, GalicianDialect, Locale, isLocale, setGalicianDialect, setLocale,
} from './valeriaLocale';
// import logoWhite from '../../assets/valeria-logo-white.png';

// ⚠️ Estos tres arrays son IDENTIFICADORES ALMACENADOS, no texto de pantalla.
// Se guardan tal cual en la ficha y otras partes de la app los leen para
// enrutar: `domainFromPatologia` (Academy) y el `/Audífono|Implante Coclear/`
// que decide si el paciente pasa por el Test de Ling. Traducirlos rompería esas
// rutas y las fichas ya guardadas en los dispositivos de las familias.
// La traducción vive en el catálogo (`t.ficha.*Label`), que mapea id → etiqueta.
const PATOLOGIAS = [
  'Hipoacusia con Implante Coclear', 'Hipoacusia con Audífono', 'Hipoacusia sin Audífono',
  'Trastorno Específico del Lenguaje', 'Retraso Simple del Lenguaje',
  'Trastorno del Espectro Autista (TEA)', 'Dislalia', 'Otros',
];
const VINCULOS = ['Madre', 'Padre', 'Tutor legal', 'Logopeda'];
// Dos opciones, decisión de Frank (1/9/2026). El catálogo sigue traduciendo
// 'Otro' porque hay fichas guardadas con ese valor en los aparatos de las
// familias: quitarlo del mapa las dejaría sin etiqueta al releerlas.
const GENEROS = ['Niña', 'Niño'];
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

// Nombre de cada variedad de terapia. Sale del catálogo de la tarjeta «Voz de
// la app» en vez de reescribirse aquí: son los mismos endónimos y no pueden
// discrepar entre las dos pantallas que eligen lo mismo.
const localeLabel = (t: UiStrings, loc: Locale): string => (
  loc === 'gl' ? t.voice.localeGl
    : loc === 'es-DO' ? t.voice.localeEsDO
      : loc === 'eu' ? t.voice.localeEu
        : loc === 'en-US' ? t.voice.localeEnUS
          : loc === 'ca' ? t.voice.localeCa
            : t.voice.localeEs);

export const ValeriaFichaRegistroScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const t = useT();
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [nhc, setNhc] = useState('');
  const [genero, setGenero] = useState('');
  const [tutor, setTutor] = useState('');
  const [vinculo, setVinculo] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [patologia, setPatologia] = useState('');
  const [medico, setMedico] = useState('');
  const [logopeda, setLogopeda] = useState('');
  // Variedad de terapia DE ESTE NIÑO. Hasta ahora la lengua era un ajuste
  // global de la app, así que en una consulta bilingüe había que acordarse de
  // moverla entre paciente y paciente — y nada registraba si te acordabas.
  // Guardada en la ficha, seleccionar al niño la pone sola
  // (ValeriaPatientSelectScreen). Vacía = no se toca nada al seleccionarlo.
  const [lingua, setLingua] = useState<Locale | ''>('');
  // Variedade xeográfica dentro do galego. Solo se pregunta con `lingua`
  // en galego: en las demás variedades no significa nada.
  const [glDialect, setGlDialect] = useState<GalicianDialect>('distincion');

  const [vinculoOpen, setVinculoOpen] = useState(false);
  const [patOpen, setPatOpen] = useState(false);

  const [err, setErr] = useState({ nombre: false, nhc: false, tutor: false, email: false });
  // Se guarda CUÁL es el error, no su texto: si el texto se congelara aquí,
  // cambiar de idioma con el error en pantalla lo dejaría en el idioma anterior.
  const [emailBadFormat, setEmailBadFormat] = useState(false);
  const [success, setSuccess] = useState(false);
  const emailMsg = emailBadFormat ? t.ficha.invalidEmail : t.ficha.required;

  const fieldStyle = (e: boolean) => [s.input, e && s.inputErr];

  const guardar = async () => {
    const emailEmpty = email.trim().length === 0;
    const emailBad = !emailEmpty && !isEmail(email);
    const nextErr = {
      nombre: nombre.trim().length === 0,
      nhc: nhc.trim().length === 0,
      tutor: tutor.trim().length === 0,
      email: emailEmpty || emailBad,
    };
    setEmailBadFormat(emailBad);
    setErr(nextErr);
    if (nextErr.nombre || nextErr.nhc || nextErr.tutor || nextErr.email) { setSuccess(false); return; }
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.registro, JSON.stringify({
        nombre, fecha, nhc, genero, tutor, vinculo, email, tel, patologia, medico, logopeda,
        lingua: lingua || undefined,
        seseo: lingua === 'gl' && glDialect === 'seseo' ? true : undefined,
      }));
      // Al guardar la ficha del niño con el que se está trabajando, la app pasa
      // ya a su lengua: si no, el adulto la guarda y sigue la sesión en la
      // anterior sin enterarse.
      if (isLocale(lingua)) await setLocale(lingua);
      if (lingua === 'gl') await setGalicianDialect(glDialect);
    } catch (e) { /* noop */ }
    setSuccess(true); setVinculoOpen(false); setPatOpen(false);
  };

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        {/* <Image source={logoWhite} style={s.logo} /> */}
        <Text style={s.logoFallback}>valeria+</Text>
        <Text style={s.headerTitle}>{t.ficha.title}</Text>
        <Text style={s.headerSub}>{t.ficha.subtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* ===== Niño/a ===== */}
        <View style={s.card}>
          <SectionHead icon="age" title={t.ficha.sectionChild} />

          <Field label={t.ficha.fullName} required error={err.nombre} errorText={t.ficha.required}>
            <TextInput value={nombre} onChangeText={(v) => { setNombre(v); setErr((e) => ({ ...e, nombre: false })); setSuccess(false); }}
              placeholder={t.ficha.fullNamePlaceholder} placeholderTextColor="#aab4b3" style={fieldStyle(err.nombre)} />
          </Field>

          <View style={{ flexDirection: 'row', gap: 11 }}>
            <View style={{ flex: 1 }}>
              <Field label={t.ficha.birthDate}>
                <TextInput value={fecha} onChangeText={(v) => { setFecha(v); setSuccess(false); }}
                  placeholder={t.ficha.birthDatePlaceholder} placeholderTextColor="#aab4b3" keyboardType="numeric" style={s.input} />
              </Field>
            </View>
            <View style={{ width: 112 }}>
              <Field label={t.ficha.recordNumber} required>
                <TextInput value={nhc} onChangeText={(v) => { setNhc(v); setErr((e) => ({ ...e, nhc: false })); setSuccess(false); }}
                  placeholder={t.ficha.recordNumberPlaceholder} placeholderTextColor="#aab4b3" style={fieldStyle(err.nhc)} />
              </Field>
            </View>
          </View>
          {err.nhc && <Text style={s.errText}>{t.ficha.recordNumberRequired}</Text>}

          <Text style={s.label}>{t.ficha.gender}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {GENEROS.map((g) => {
              const on = genero === g;
              return (
                <Pressable key={g} onPress={() => { setGenero(g); setSuccess(false); }} style={[s.segment, on && s.segmentOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                  <Text style={[s.segmentTxt, { color: on ? '#fff' : V.color.textSecondary }]}>{t.ficha.genderLabel(g)}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[s.label, { marginTop: 15 }]}>{t.ficha.therapyLanguage}</Text>
          <Text style={[s.hint, { marginTop: 0, marginBottom: 8 }]}>{t.ficha.therapyLanguageHint}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ALL_LOCALES.map((l) => {
              const on = lingua === l;
              return (
                <Pressable
                  key={l}
                  onPress={() => { setLingua(on ? '' : l); setSuccess(false); }}
                  style={[s.segment, s.segmentChip, on && s.segmentOn]}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                >
                  <Text style={[s.segmentTxt, { color: on ? '#fff' : V.color.textSecondary }]}>{localeLabel(t, l)}</Text>
                </Pressable>
              );
            })}
          </View>

          {lingua === 'gl' && (
            <>
              <Text style={[s.label, { marginTop: 15 }]}>{t.ficha.glDialect}</Text>
              <Text style={[s.hint, { marginTop: 0, marginBottom: 8 }]}>{t.ficha.glDialectHint}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {(['distincion', 'seseo'] as GalicianDialect[]).map((d) => {
                  const on = glDialect === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => { setGlDialect(d); setSuccess(false); }}
                      style={[s.segment, s.segmentChip, on && s.segmentOn]}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: on }}
                    >
                      <Text style={[s.segmentTxt, { color: on ? '#fff' : V.color.textSecondary }]}>
                        {d === 'seseo' ? t.ficha.glDialectSeseo : t.ficha.glDialectDistincion}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/* ===== Tutor ===== */}
        <View style={s.card}>
          <SectionHead icon="family" title={t.ficha.sectionCaregiver} />

          <Field label={t.ficha.caregiverName} required error={err.tutor} errorText={t.ficha.required}>
            <TextInput value={tutor} onChangeText={(v) => { setTutor(v); setErr((e) => ({ ...e, tutor: false })); setSuccess(false); }}
              placeholder={t.ficha.caregiverNamePlaceholder} placeholderTextColor="#aab4b3" style={fieldStyle(err.tutor)} />
          </Field>

          <Field label={t.ficha.relationship}>
            <Pressable onPress={() => { setVinculoOpen((o) => !o); setPatOpen(false); }} style={[s.select, vinculoOpen && s.selectOpen]}>
              <Text style={{ fontSize: 15, color: vinculo ? V.color.textPrimary : '#9ca3af' }}>{vinculo ? t.ficha.relationshipLabel(vinculo) : t.ficha.relationshipPlaceholder}</Text>
              <Text style={{ color: V.color.primary, fontSize: 12 }}>{vinculoOpen ? '▲' : '▼'}</Text>
            </Pressable>
            {vinculoOpen && (
              <View style={s.dropdown}>
                {VINCULOS.map((o) => (
                  <Pressable key={o} onPress={() => { setVinculo(o); setVinculoOpen(false); setSuccess(false); }} style={[s.option, { backgroundColor: o === vinculo ? V.color.primaryTint : '#fff' }]}>
                    <Text style={{ fontSize: 14.5, color: V.color.textPrimary }}>{t.ficha.relationshipLabel(o)}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Field>

          <Field label={t.ficha.email} required error={err.email} errorText={emailMsg}>
            <TextInput value={email} onChangeText={(v) => { setEmail(v); setErr((e) => ({ ...e, email: false })); setSuccess(false); }}
              placeholder={t.ficha.emailPlaceholder} placeholderTextColor="#aab4b3" keyboardType="email-address" autoCapitalize="none" style={fieldStyle(err.email)} />
          </Field>

          <Field label={t.ficha.phone} hint={t.ficha.phoneHint}>
            <TextInput value={tel} onChangeText={(v) => { setTel(v); setSuccess(false); }}
              placeholder={t.ficha.phonePlaceholder} placeholderTextColor="#aab4b3" keyboardType="phone-pad" style={s.input} />
          </Field>
        </View>

        {/* ===== Diagnóstico y equipo médico ===== */}
        <View style={s.card}>
          <SectionHead icon="clinical" title={t.ficha.sectionDiagnosis} />

          <Field label={t.ficha.pathology}>
            <Pressable onPress={() => { setPatOpen((o) => !o); setVinculoOpen(false); }} style={[s.select, patOpen && s.selectOpen]}>
              <Text style={{ fontSize: 15, color: patologia ? V.color.textPrimary : '#9ca3af' }}>{patologia ? t.ficha.pathologyLabel(patologia) : t.ficha.pathologyPlaceholder}</Text>
              <Text style={{ color: V.color.primary, fontSize: 12 }}>{patOpen ? '▲' : '▼'}</Text>
            </Pressable>
            {patOpen && (
              <View style={s.dropdown}>
                {PATOLOGIAS.map((o) => (
                  <Pressable key={o} onPress={() => { setPatologia(o); setPatOpen(false); setSuccess(false); }} style={[s.option, { backgroundColor: o === patologia ? V.color.primaryTint : '#fff' }]}>
                    <Text style={{ fontSize: 14.5, color: V.color.textPrimary }}>{t.ficha.pathologyLabel(o)}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Field>

          <Field label={t.ficha.prescriber}>
            <TextInput value={medico} onChangeText={setMedico} placeholder={t.ficha.prescriberPlaceholder} placeholderTextColor="#aab4b3" style={s.input} />
          </Field>
          <Field label={t.ficha.therapist}>
            <TextInput value={logopeda} onChangeText={setLogopeda} placeholder={t.ficha.therapistPlaceholder} placeholderTextColor="#aab4b3" style={s.input} />
          </Field>
        </View>

        {success && (
          <View style={s.success}>
            <View style={s.successCheck}><BlockIcon name="check" color="#ffffff" size={15} /></View>
            <Text style={s.successTxt}>{t.ficha.saved}</Text>
          </View>
        )}

        <Pressable onPress={guardar} style={s.primaryBtn}><Text style={s.primaryBtnTxt}>{t.ficha.save}</Text></Pressable>

        {/* Entender el trastorno va antes que ejercitarlo: por eso la ficha
            abre en Academy y no en el grid. El destino se nombra entero
            (`screen`) para que el botón no dependa de cuál sea la pestaña
            inicial del MainTabNavigator. */}
        {success && (
          <Pressable onPress={() => navigation?.navigate('ExerciseSelection', { screen: 'Academy' })} style={s.secondaryBtn}>
            <Text style={s.secondaryBtnTxt}>{t.ficha.continueToAcademy}</Text>
          </Pressable>
        )}

        <View style={s.footerNote}>
          <BlockIcon name="lock" color={V.color.textSecondary} size={13} />
          <Text style={s.footerTxt}>{t.ficha.footer}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Subcomponentes ---------------------------------------------------------
const SectionHead = ({ icon, title }: { icon: BlockIconName; title: string }) => (
  <View style={s.sectionHead}>
    <View style={s.sectionIcon}><BlockIcon name={icon} color={V.color.primaryDark} size={19} /></View>
    <Text style={s.sectionTitle}>{title}</Text>
  </View>
);

const Field = ({ label, required, error, errorText, hint, children }: {
  label: string; required?: boolean; error?: boolean; errorText?: string; hint?: string; children: React.ReactNode;
}) => (
  <View style={{ marginBottom: 13 }}>
    <Text style={s.label}>{label}{required && <Text style={{ color: V.color.error }}> *</Text>}</Text>
    {children}
    {error && <Text style={s.errText}>{errorText}</Text>}
    {hint && !error && <Text style={s.hint}>{hint}</Text>}
  </View>
);

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 16, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  logo: { height: 21, width: 84, resizeMode: 'contain', marginBottom: 8 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 6 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },

  scroll: { padding: 18, paddingBottom: 36 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 17, marginBottom: 14, ...V.shadow.card },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 15 },
  sectionIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: V.color.textPrimary },

  label: { fontSize: 12.5, fontWeight: '800', color: V.color.textSecondary, marginBottom: 6 },
  input: { backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: V.color.textPrimary },
  inputErr: { backgroundColor: V.color.errorBg, borderColor: V.color.error },
  errText: { fontSize: 11.5, color: V.color.error, marginTop: 4, fontWeight: '700' },
  hint: { fontSize: 11, color: V.color.textSecondary, marginTop: 5, fontWeight: '600' },

  segment: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 12, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#eef2f1' },
  // Seis variedades no caben en una fila. `flex: 0` NO vale para soltarlas del
  // reparto: en React Native Web equivale a flexBasis 0%, así que los seis chips
  // colapsaban a la anchura del padding y los rótulos se pisaban unos a otros
  // —«CastellanGalegominicEuskarEnglishCatalà»—. Se ven en la captura del
  // 6/9/2026 y no lo caza ningún gate: hay que mirarlo. Las tres propiedades por
  // separado sí dimensionan cada chip a su texto, y con flexWrap caen en dos
  // filas.
  segmentChip: {
    flexGrow: 0, flexShrink: 0, flexBasis: 'auto',
    paddingHorizontal: 14, paddingVertical: 9,
  },
  segmentOn: { backgroundColor: V.color.primary, borderColor: V.color.primary, ...V.shadow.button },
  segmentTxt: { fontSize: 14, fontWeight: '800' },

  select: { backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectOpen: { borderColor: V.color.primary },
  dropdown: { marginTop: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, overflow: 'hidden' },
  option: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f4' },

  success: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.primary, borderRadius: 13, padding: 14, marginBottom: 14 },
  successCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: V.color.primary, alignItems: 'center', justifyContent: 'center' },
  successTxt: { color: V.color.textPrimary, fontSize: 13.5, fontWeight: '700', flex: 1 },

  primaryBtn: { backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { marginTop: 11, backgroundColor: '#fff', borderWidth: 1.5, borderColor: V.color.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  secondaryBtnTxt: { color: V.color.primaryDark, fontSize: 15, fontWeight: '800' },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, paddingHorizontal: 10 },
  footerTxt: { color: V.color.textSecondary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
});

export default ValeriaFichaRegistroScreen;

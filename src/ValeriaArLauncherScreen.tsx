// ============================================================================
// Valeria+ · Realidad Aumentada — pantalla anfitriona (bloque 7)
// Es la antesala en JS del host nativo de cámara + escena 3D. Ordena el camino
// completo y no dibuja ni un frame del ejercicio:
//
//   consentimiento de cámara → Prueba de Aptitud → (calibración de 5 puntos)
//   → lanzar el host nativo → recibir el resultado → telemetría + gamificación
//
// Por qué vive aquí y no en el nativo: el módulo nativo MIDE y RENDERIZA; no
// persiste, no cifra y no sincroniza. Todo eso sigue en JS, con una sola fuente
// de verdad para los datos del piloto (valeriaTelemetry).
//
// Degradación elegante: si no hay host —Expo Go, build sin el config plugin,
// iOS todavía, teléfono sin cámara frontal— esta pantalla lo dice con palabras
// del adulto y ofrece volver. Nunca una pantalla rota ni un error técnico.
//
// Muro MDR: los umbrales salen del Panel del Adulto y quedan CONSTANTES durante
// la sesión. Al terminar se muestran magnitudes —milisegundos, grados, ensayos—
// jamás un semáforo, un percentil ni una etiqueta de severidad. Un gráfico de
// latencias es descripción; un badge rojo de «por debajo de lo esperado» es
// interpretación, y eso ya no cabe en Clase I.
// ============================================================================
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { sha256 } from './ValeriaProPin';
import { AR_META } from './valeriaExerciseMeta';
import {
  isArAvailable, runAptitudeTest, launchAr, calibrateAr, hasArCalibration,
} from './valeriaArBridge';
import type { ArDeviceProfile, ArExerciseId, ArThresholds, ArSessionResult } from './valeriaArBridge';
import {
  loadArThresholds, saveArThresholds, hasArConsent, grantArConsent,
  loadArDeviceProfile, saveArDeviceProfile, arPolicyFor,
} from './valeriaArSettings';
import { ValeriaAdultChaosPanel } from './ValeriaAdultChaosPanel';
import { trackArSession, markBlockCompleted } from './valeriaTelemetry';
import { registerSession } from './valeriaGamification';
import type { SessionReward } from './valeriaGamification';

type Phase = 'loading' | 'unsupported' | 'consent' | 'aptitude' | 'notApt' | 'menu' | 'busy' | 'result';

// Clave opaca del paciente: resumen del identificador clínico, NUNCA el nombre.
// Es lo único que cruza al nativo para recuperar la calibración de ese niño.
const patientKeyFor = async (ficha: any): Promise<string> => {
  const seed = String(ficha?.nhc || ficha?.nombre || 'anon');
  const digest = await sha256(`valeria-ar:${seed}`);
  return digest.slice(0, 16);
};

const TRIALS_PER_SESSION: Record<ArExerciseId, number> = { ar1: 8, ar2: 20, ar3: 12 };

export const ValeriaArLauncherScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [phase, setPhase] = useState<Phase>('loading');
  const [busyMsg, setBusyMsg] = useState('');
  const [patientKey, setPatientKey] = useState('');
  const [profile, setProfile] = useState<ArDeviceProfile | null>(null);
  const [thresholds, setThresholds] = useState<ArThresholds | null>(null);
  const [result, setResult] = useState<ArSessionResult | null>(null);
  const [reward, setReward] = useState<SessionReward | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    (async () => {
      if (!isArAvailable()) { setPhase('unsupported'); return; }
      setThresholds(await loadArThresholds());
      let ficha: any = null;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.registro);
        if (raw) ficha = JSON.parse(raw);
      } catch (e) { /* sin ficha activa: se juega igual, con clave anónima */ }
      const key = await patientKeyFor(ficha);
      setPatientKey(key);

      if (!(await hasArConsent(key))) { setPhase('consent'); return; }
      const cached = await loadArDeviceProfile();
      if (!cached) { setPhase('aptitude'); return; }
      setProfile(cached);
      setPhase(cached.level === 'D' ? 'notApt' : 'menu');
    })();
  }, []);

  const acceptConsent = async () => {
    await grantArConsent(patientKey);
    const cached = await loadArDeviceProfile();
    if (cached) { setProfile(cached); setPhase(cached.level === 'D' ? 'notApt' : 'menu'); }
    else setPhase('aptitude');
  };

  // Prueba de Aptitud (§3.5): 60-90 s de sondas que al niño se le presentan como
  // un juego de calentamiento. Es el sustituto de saber qué teléfono habrá.
  const runAptitude = useCallback(async () => {
    setBusyMsg('Midiendo este teléfono… (unos 90 segundos)');
    setPhase('busy');
    const p = await runAptitudeTest();
    if (!p) {
      setNotice('No se pudo completar la prueba en este teléfono. Puedes intentarlo de nuevo.');
      setPhase('aptitude');
      return;
    }
    await saveArDeviceProfile(p);
    setProfile(p);
    setPhase(p.level === 'D' ? 'notApt' : 'menu');
  }, []);

  const updateThresholds = (t: ArThresholds) => { setThresholds(t); void saveArThresholds(t); };

  const start = async (exerciseId: ArExerciseId) => {
    if (!thresholds || !profile) return;
    setNotice('');

    // AR-3 sin calibrar apunta a la nada: la rutina de 5 puntos no es opcional.
    if (exerciseId === 'ar3' && !(await hasArCalibration(patientKey))) {
      setBusyMsg('Vamos a jugar a seguir a la osita por las esquinas (15 segundos)…');
      setPhase('busy');
      const cal = await calibrateAr(patientKey, thresholds.pointerSource);
      if (!cal) {
        setNotice('La calibración no se completó. Coloca el teléfono apoyado, en horizontal, a un palmo y medio de la cara y prueba otra vez.');
        setPhase('menu');
        return;
      }
    }

    setBusyMsg('Abriendo la cámara…');
    setPhase('busy');
    const res = await launchAr({
      exerciseId,
      patientKey,
      thresholds,
      trials: TRIALS_PER_SESSION[exerciseId],
    });

    if (!res) {
      setNotice('El ejercicio no llegó a abrirse. Comprueba que la app tiene permiso de cámara.');
      setPhase('menu');
      return;
    }
    if (res.outcome === 'denied') {
      setNotice('Sin permiso de cámara no hay ejercicios de Realidad Aumentada. El resto de la app funciona igual.');
      setPhase('menu');
      return;
    }

    // Enrutado del dato: el nativo no persiste nada, lo hace la telemetría de
    // siempre. El perfil del dispositivo se sella con la sesión (covariable).
    trackArSession({ trials: res.trials, deviceProfile: res.deviceProfile, thresholds: res.thresholds });
    setResult(res);

    if (res.outcome === 'completed' && res.trials.length) {
      markBlockCompleted('ar');
      // Gamificación: premia la PARTICIPACIÓN (ensayos completados sin anular),
      // no el acierto. Puntuar el rendimiento aquí sería convertir una medida
      // clínica en un veredicto automático, que es justo lo que el muro MDR
      // prohíbe. Las estrellas motivan al niño; no describen su ejecución.
      const done = res.trials.filter((t) => !t.voided).length;
      const participation = res.trials.length ? done / res.trials.length : 0;
      setReward(await registerSession(3 * participation, 1));
    }
    setPhase('result');
  };

  // -------------------------------------------------------------------------
  const header = (title: string, sub: string) => (
    <View style={s.header}>
      <Pressable onPress={() => navigation?.goBack()} style={s.backPill} accessibilityRole="button" accessibilityLabel="Volver">
        <Text style={s.backPillTxt}>‹ Volver</Text>
      </Pressable>
      <Text style={s.logoFallback}>valeria+</Text>
      <Text style={s.headerTitle}>{title}</Text>
      <Text style={s.headerSub}>{sub}</Text>
    </View>
  );

  const noticeBar = !!notice && (
    <View style={s.notice}><Text style={s.noticeTxt}>{notice}</Text></View>
  );

  // ---- Fases sin menú ------------------------------------------------------
  if (phase === 'loading' || phase === 'busy') {
    return (
      <View style={s.flex}>
        {header('🎯 Realidad Aumentada', 'Preparando la sesión')}
        <View style={s.center}>
          <ActivityIndicator size="large" color={V.color.primary} />
          <Text style={s.busyTxt}>{busyMsg || 'Un momento…'}</Text>
        </View>
      </View>
    );
  }

  if (phase === 'unsupported') {
    return (
      <View style={s.flex}>
        {header('🎯 Realidad Aumentada', 'No disponible en este dispositivo')}
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Aquí no se puede jugar todavía</Text>
            <Text style={s.cardTxt}>
              Estos ejercicios necesitan la cámara frontal y una versión de la app instalada en el
              teléfono (no funcionan en la vista previa de Expo Go). Los otros seis bloques de
              terapia funcionan exactamente igual de bien.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---- Consentimiento informado de cámara, por paciente --------------------
  if (phase === 'consent') {
    return (
      <View style={s.flex}>
        {header('🎯 Realidad Aumentada', 'Antes de encender la cámara')}
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.card}>
            <Text style={{ fontSize: 34, textAlign: 'center' }}>📷</Text>
            <Text style={s.cardTitle}>Qué hace la cámara en estos juegos</Text>
            <Text style={s.cardTxt}>
              En este bloque la cámara frontal no graba: <Text style={s.b}>mira</Text>. Sirve para
              saber si tu peque redondea los labios, gira la cabeza hacia un sonido o mira un
              dibujo, y para que el coche, el perro o la manzana reaccionen a ese gesto.
            </Text>
            <View style={s.list}>
              <Text style={s.item}>🚫 <Text style={s.b}>No se graba ni se guarda ninguna imagen.</Text> Cada fotograma se analiza y se descarta al instante.</Text>
              <Text style={s.item}>📵 <Text style={s.b}>Ningún vídeo sale del teléfono.</Text> Todo el análisis ocurre aquí dentro, sin internet.</Text>
              <Text style={s.item}>🙅 <Text style={s.b}>No se reconoce la cara de nadie.</Text> Solo se miden gestos: grados, milisegundos y proporciones.</Text>
              <Text style={s.item}>🎤 En dos de los tres ejercicios el <Text style={s.b}>micrófono está apagado</Text>: se premia el esfuerzo motor antes de pedir que hable.</Text>
              <Text style={s.item}>↩️ Puedes salir en cualquier momento y retirar este permiso desde los ajustes de Android.</Text>
            </View>
            <Pressable onPress={acceptConsent} style={s.primaryBtn} accessibilityRole="button"
              accessibilityLabel="Aceptar el uso de la cámara y continuar">
              <Text style={s.primaryBtnTxt}>Lo entiendo y acepto</Text>
            </Pressable>
            <Pressable onPress={() => navigation?.goBack()} accessibilityRole="button" accessibilityLabel="Ahora no">
              <Text style={s.cancel}>Ahora no</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---- Prueba de Aptitud del Dispositivo -----------------------------------
  if (phase === 'aptitude') {
    return (
      <View style={s.flex}>
        {header('🎯 Realidad Aumentada', 'Calentamiento con la osita')}
        <ScrollView contentContainerStyle={s.scroll}>
          {noticeBar}
          <View style={s.card}>
            <Text style={{ fontSize: 34, textAlign: 'center' }}>🐻</Text>
            <Text style={s.cardTitle}>Un juego de calentamiento de minuto y medio</Text>
            <Text style={s.cardTxt}>
              Cada teléfono es distinto y estos ejercicios exigen bastante. Antes de empezar, la
              app hace una prueba corta —mirar a la osita, seguirla a las esquinas, escuchar dos
              sonidos— para saber qué puede ofrecer <Text style={s.b}>en este teléfono concreto</Text>.
              Se hace una sola vez.
            </Text>
            <Text style={s.cardTxt}>
              Apoya el teléfono en un libro o una caja, en <Text style={s.b}>horizontal</Text>, a
              un palmo y medio de la cara del peque (unos 30-35 cm), y déjalo quieto.
            </Text>
            <Pressable onPress={runAptitude} style={s.primaryBtn} accessibilityRole="button"
              accessibilityLabel="Empezar el calentamiento">
              <Text style={s.primaryBtnTxt}>Empezar el calentamiento</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---- Nivel D: el bloque no se ofrece -------------------------------------
  if (phase === 'notApt' || !profile || !thresholds) {
    return (
      <View style={s.flex}>
        {header('🎯 Realidad Aumentada', 'Este teléfono no da para estos juegos')}
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.card}>
            <Text style={s.cardTitle}>Mejor no forzarlo</Text>
            <Text style={s.cardTxt}>{arPolicyFor(profile?.level ?? 'D').note}</Text>
            <Text style={s.cardTxt}>
              No es un fallo tuyo ni del peque: la cámara y los dibujos en 3D a la vez piden más de
              lo que este aparato puede sostener, y un ejercicio a tirones no mide nada.
            </Text>
            <Pressable onPress={() => navigation?.goBack()} style={s.primaryBtn} accessibilityRole="button">
              <Text style={s.primaryBtnTxt}>Volver a los bloques</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---- Resultado de la sesión (magnitudes, nunca veredictos) ---------------
  if (phase === 'result' && result) {
    const trials = result.trials;
    const done = trials.filter((t) => !t.voided).length;
    const voided = trials.length - done;
    const meta = AR_META.find((m) => m.id === result.exerciseId);
    const rows: Array<[string, string]> = [['Ensayos jugados', String(trials.length)]];
    if (voided) rows.push(['Ensayos anulados (el teléfono se movió)', String(voided)]);

    if (result.exerciseId === 'ar1') {
      const holds = trials.filter((t) => t.exerciseId === 'ar1' && !t.voided).map((t: any) => t.holdMaxMs as number);
      if (holds.length) {
        rows.push(['Sostén más largo', `${Math.max(...holds)} ms`]);
        rows.push(['Sostén medio', `${Math.round(holds.reduce((a, b) => a + b, 0) / holds.length)} ms`]);
      }
      rows.push(['Objetivo fijado por vosotros', `${result.thresholds.holdMs} ms`]);
    }
    if (result.exerciseId === 'ar2') {
      const lat = trials.filter((t) => t.exerciseId === 'ar2' && t.latencyMs != null).map((t: any) => t.latencyMs as number);
      const catches = trials.filter((t) => t.exerciseId === 'ar2' && (t as any).isCatch).length;
      rows.push(['Ensayos sin sonido (control)', String(catches)]);
      rows.push(['Giros medidos con reloj', lat.length ? String(lat.length) : 'ninguno: se jugó sin cronómetro']);
      if (lat.length) {
        const sorted = [...lat].sort((a, b) => a - b);
        rows.push(['Latencia mediana del giro', `${sorted[sorted.length >> 1]} ms`]);
      }
    }
    if (result.exerciseId === 'ar3') {
      const sel = trials.filter((t) => t.exerciseId === 'ar3' && !t.voided) as any[];
      const dwells = sel.map((t) => t.dwellMs as number).filter((n) => n > 0);
      rows.push(['Dianas en pantalla', String(sel[0]?.targetCount ?? '—')]);
      if (dwells.length) rows.push(['Fijación media hasta elegir', `${Math.round(dwells.reduce((a, b) => a + b, 0) / dwells.length)} ms`]);
    }

    return (
      <View style={s.flex}>
        {header('🎯 Sesión terminada', meta?.name ?? 'Realidad Aumentada')}
        <ScrollView contentContainerStyle={s.scroll}>
          {reward && (
            <View style={s.rewardCard}>
              <Text style={s.rewardXp}>+{reward.xpGained} XP</Text>
              <Text style={s.rewardSub}>🔥 {reward.streak} {reward.streak === 1 ? 'día' : 'días'} de racha · 🏅 Nivel {reward.level} · {reward.levelName}</Text>
            </View>
          )}
          <View style={s.card}>
            <Text style={s.cardTitle}>Lo que se ha medido</Text>
            {rows.map(([k, v]) => (
              <View key={k} style={s.dataRow}>
                <Text style={s.dataKey}>{k}</Text>
                <Text style={s.dataVal}>{v}</Text>
              </View>
            ))}
            <Text style={s.mdrNote}>
              Estos son datos en bruto, no una valoración. La app mide y anota; quien interpreta si
              esto es mucho o poco para vuestro peque es vuestra logopeda.
            </Text>
          </View>
          <Pressable onPress={() => { setResult(null); setReward(null); setPhase('menu'); }}
            style={s.primaryBtn} accessibilityRole="button">
            <Text style={s.primaryBtnTxt}>Volver a los ejercicios</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ---- Menú del bloque -----------------------------------------------------
  const policy = arPolicyFor(profile.level);
  return (
    <View style={s.flex}>
      {header('🎯 Realidad Aumentada', `Nivel de este teléfono: ${policy.label}`)}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {noticeBar}

        <View style={s.levelCard}>
          <Text style={s.levelTitle}>📱 {profile.manufacturer} {profile.model} · nivel {profile.level} ({policy.label})</Text>
          <Text style={s.levelTxt}>{policy.note}</Text>
          <Pressable onPress={runAptitude} accessibilityRole="button" accessibilityLabel="Repetir el calentamiento de este teléfono">
            <Text style={s.levelRedo}>Repetir el calentamiento</Text>
          </Pressable>
        </View>

        <Text style={s.hubLabel}>EJERCICIOS DISPONIBLES</Text>
        {AR_META.map((m) => {
          const id = m.id as ArExerciseId;
          const enabled = policy.exercises.includes(id);
          const gameOnly = id === 'ar2' && enabled && !policy.ar2Instrumented;
          return (
            <Pressable key={m.id} onPress={() => enabled && start(id)} disabled={!enabled}
              style={[s.exCard, !enabled && s.exCardOff]}
              accessibilityRole="button"
              accessibilityLabel={enabled ? `Practicar ${m.name}` : `${m.name}: no disponible en este teléfono`}>
              <View style={s.codeChip}><Text style={s.codeChipTxt}>{m.code}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.exName}>{m.name}</Text>
                <Text style={s.exCat}>{m.category}</Text>
                {gameOnly && <Text style={s.exFlag}>Se juega, pero sin cronometrar el giro: hace falta un montaje de altavoces.</Text>}
                {id === 'ar3' && enabled && policy.ar3Targets === 2 && (
                  <Text style={s.exFlag}>Con dos dibujos en pantalla: en este teléfono tres quedarían demasiado juntos.</Text>
                )}
                {!enabled && <Text style={s.exFlag}>No disponible en este teléfono.</Text>}
              </View>
              <Text style={s.exGo}>{enabled ? '▶' : '—'}</Text>
            </Pressable>
          );
        })}

        <View style={s.setupCard}>
          <Text style={s.setupTitle}>🧱 Cómo colocar el teléfono</Text>
          <Text style={s.setupTxt}>
            Apoyado en un libro, una caja o contra la pared, en horizontal, a un palmo y medio de la
            cara. La pantalla avisa en verde cuando la posición vale. Si el teléfono se mueve
            durante un ensayo, ese ensayo se anula: es preferible perderlo a apuntarlo mal.
          </Text>
        </View>

        {/* El Panel del Adulto sigue siendo la única puerta a los umbrales. */}
        <ValeriaAdultChaosPanel
          distractorOn={false}
          onDistractorChange={() => { /* el distractor visual no aplica con la cámara en uso */ }}
          onLaunchPragmatic={() => { /* el quiebre pragmático es de los bloques de voz */ }}
          arThresholds={thresholds}
          onArThresholdsChange={updateThresholds}
        />
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 },
  busyTxt: { fontSize: 13.5, fontWeight: '700', color: V.color.textSecondary, textAlign: 'center', lineHeight: 19 },

  header: { backgroundColor: V.color.primary, paddingTop: 18, paddingHorizontal: 22, paddingBottom: 16, borderBottomLeftRadius: 26, borderBottomRightRadius: 26 },
  logoFallback: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1, marginBottom: 6 },
  backPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5, marginBottom: 10 },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: { color: 'rgba(255,255,255,.9)', fontSize: 13, fontWeight: '600', marginTop: 4 },

  scroll: { padding: 18, paddingBottom: 32 },
  hubLabel: { fontSize: 12, fontWeight: '800', color: V.color.textMuted, letterSpacing: 0.5, marginBottom: 12, marginTop: 6, marginHorizontal: 2 },

  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 18, padding: 18, ...V.shadow.card },
  cardTitle: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary, textAlign: 'center', marginTop: 8 },
  cardTxt: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, lineHeight: 19, marginTop: 10 },
  b: { fontWeight: '800', color: V.color.textPrimary },
  list: { marginTop: 12, backgroundColor: V.color.pageBg, borderRadius: 14, padding: 13, gap: 9 },
  item: { fontSize: 12.5, fontWeight: '600', color: V.color.textSecondary, lineHeight: 17 },

  notice: { backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#fcd9a8', borderRadius: 13, padding: 12, marginBottom: 14 },
  noticeTxt: { fontSize: 12.5, fontWeight: '700', color: '#9a5b13', lineHeight: 17 },

  levelCard: { backgroundColor: '#eef6ff', borderWidth: 1, borderColor: '#d3e5fb', borderRadius: 14, padding: 13, marginBottom: 16 },
  levelTitle: { fontSize: 12.5, fontWeight: '800', color: '#2c5382' },
  levelTxt: { fontSize: 11.5, fontWeight: '600', color: '#2c5382', lineHeight: 16, marginTop: 5 },
  levelRedo: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark, marginTop: 9 },

  exCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 15, padding: 13, marginBottom: 10, ...V.shadow.card },
  exCardOff: { opacity: 0.5, borderColor: V.color.border },
  codeChip: { minWidth: 46, height: 30, paddingHorizontal: 8, borderRadius: 9, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  codeChipTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark, letterSpacing: 0.3 },
  exName: { fontSize: 14.5, fontWeight: '800', color: V.color.textPrimary },
  exCat: { fontSize: 11.5, fontWeight: '700', color: V.color.textMuted, marginTop: 2 },
  exFlag: { fontSize: 11, fontWeight: '700', color: '#9a5b13', marginTop: 5, lineHeight: 15 },
  exGo: { fontSize: 16, fontWeight: '800', color: V.color.primaryDark },

  setupCard: { backgroundColor: '#fffdf7', borderWidth: 1.5, borderColor: '#f0e6cc', borderRadius: 16, padding: 13, marginTop: 8 },
  setupTitle: { fontSize: 12.5, fontWeight: '800', color: '#9a5b13' },
  setupTxt: { fontSize: 11.5, fontWeight: '600', color: '#9a5b13', lineHeight: 16, marginTop: 5 },

  rewardCard: { backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 14 },
  rewardXp: { fontSize: 26, fontWeight: '800', color: V.color.primaryDark },
  rewardSub: { fontSize: 12, fontWeight: '700', color: V.color.textSecondary, marginTop: 6 },

  dataRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: V.color.border, paddingVertical: 10 },
  dataKey: { flex: 1, fontSize: 12.5, fontWeight: '700', color: V.color.textSecondary },
  dataVal: { fontSize: 13.5, fontWeight: '800', color: V.color.textPrimary },
  mdrNote: { fontSize: 11, fontWeight: '600', color: V.color.textMuted, lineHeight: 15, marginTop: 12 },

  primaryBtn: { backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16, ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 15.5, fontWeight: '800' },
  cancel: { textAlign: 'center', color: V.color.textMuted, fontSize: 13, fontWeight: '800', marginTop: 12 },
});

export default ValeriaArLauncherScreen;

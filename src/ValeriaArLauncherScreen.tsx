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
import { View, Text, Pressable, ScrollView, ActivityIndicator, Share, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { BlockIcon } from './ValeriaBlockIcons';
import { CatPixel } from './ValeriaCatPixel';
import { PixelAward, streakTier } from './ValeriaPixelAwards';
import { sha256 } from './ValeriaProPin';
import { getArMeta } from './valeriaExerciseMeta';
import { getUiLang } from './valeriaUiLang';
import { useT } from './i18n';
import {
  isArAvailable, runAptitudeTest, launchAr, calibrateAr, hasArCalibration, openArDiagnostics,
} from './valeriaArBridge';
import type {
  ArDeviceProfile, ArExerciseId, ArThresholds, ArSessionResult, ArFailureReason,
} from './valeriaArBridge';
import {
  loadArThresholds, saveArThresholds, hasArConsent, grantArConsent,
  loadArDeviceProfile, saveArDeviceProfile, arPolicyFor,
} from './valeriaArSettings';
import { ValeriaAdultChaosPanel } from './ValeriaAdultChaosPanel';
import { trackArSession, markBlockCompleted } from './valeriaTelemetry';
import { registerSession } from './valeriaGamification';
import { luaSessionReward, cancelSessionReward } from './valeriaLuaSession';
import type { SessionReward } from './valeriaGamification';

type Phase = 'loading' | 'unsupported' | 'consent' | 'aptitude' | 'notApt' | 'menu' | 'busy' | 'result';

// Clave opaca del paciente: resumen del identificador clínico, NUNCA el nombre.
// Es lo único que cruza al nativo para recuperar la calibración de ese niño.
const patientKeyFor = async (ficha: any): Promise<string> => {
  const seed = String(ficha?.nhc || ficha?.nombre || 'anon');
  const digest = await sha256(`valeria-ar:${seed}`);
  return digest.slice(0, 16);
};

const TRIALS_PER_SESSION: Record<ArExerciseId, number> = { ar1: 8, ar2: 20, ar3: 12, ar4: 10, ar5: 10, ar6: 8 };

type ArStrings = ReturnType<typeof useT>;

/**
 * Qué se le dice al adulto cuando el bloque no abre por una causa que ÉL puede
 * resolver. Cada rama nombra la acción concreta; el genérico solo queda para la
 * causa desconocida, que es donde de verdad no sabemos qué pedirle.
 */
const failureNotice = (t: ArStrings, reason: ArFailureReason | null): string => {
  switch (reason) {
    case 'CAMERA_BUSY': return t.ar.noticeCameraBusy;
    case 'APK_TOO_OLD': return t.ar.noticeArServicesOutdated;
    case 'INSTALL_DECLINED': return t.ar.noticeArServicesMissing;
    case 'INSTALL_PENDING': return t.ar.noticeArServicesInstalling;
    case 'DENIED': return t.ar.noticeCameraDenied;
    default: return t.ar.noticeAptitudeFailed;
  }
};

/** Y qué se le dice cuando la causa NO la resuelve nadie: el bloque se cierra. */
const permanentBody = (t: ArStrings, reason: ArFailureReason | null): string =>
  reason === 'NO_FRONT_CAMERA' ? t.ar.notAptNoFrontCamera : t.ar.notAptDeviceUnsupported;

export const ValeriaArLauncherScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const t = useT();
  const [phase, setPhase] = useState<Phase>('loading');
  const [busyMsg, setBusyMsg] = useState('');
  const [patientKey, setPatientKey] = useState('');
  const [profile, setProfile] = useState<ArDeviceProfile | null>(null);
  const [thresholds, setThresholds] = useState<ArThresholds | null>(null);
  const [result, setResult] = useState<ArSessionResult | null>(null);
  const [reward, setReward] = useState<SessionReward | null>(null);
  // Salir de la pantalla corta el desfile del premio en el aparato y deja a la
  // gata neutra. Sin esto, cerrar a los dos segundos deja una insignia puesta
  // en el cristal hasta que caduque la concesión.
  useEffect(() => () => cancelSessionReward(), []);

  const [notice, setNotice] = useState('');
  // Por qué no abrió el bloque. Se guarda para poder DECIRLO: hasta el
  // 3/9/2026 el nativo calculaba la causa exacta y la tiraba, y la pantalla
  // solo sabía ofrecer «inténtalo de nuevo».
  const [failure, setFailure] = useState<{ reason: ArFailureReason | null; detail: string | null } | null>(null);

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
      if (!cached || !cached.level) { setPhase('aptitude'); return; }
      setProfile(cached);
      setPhase(cached.level === 'D' ? 'notApt' : 'menu');
    })();
  }, []);

  const acceptConsent = async () => {
    await grantArConsent(patientKey);
    const cached = await loadArDeviceProfile();
    if (cached && cached.level) { setProfile(cached); setPhase(cached.level === 'D' ? 'notApt' : 'menu'); }
    else setPhase('aptitude');
  };

  // Prueba de Aptitud (§3.5): 60-90 s de sondas que al niño se le presentan como
  // un juego de calentamiento. Es el sustituto de saber qué teléfono habrá.
  const runAptitude = useCallback(async () => {
    setBusyMsg(t.ar.busyMeasuring);
    setPhase('busy');
    const outcome = await runAptitudeTest();

    if (!outcome.ok) {
      // Una causa permanente no se reintenta: el aparato no está certificado
      // para RA frontal y ninguna acción del adulto lo cambia. Ofrecer «vuelve
      // a intentarlo» ahí es mandar a un padre a repetir un calentamiento de
      // 90 segundos que no puede terminar nunca.
      setFailure({ reason: outcome.reason, detail: outcome.detail });
      setPhase(outcome.permanent ? 'notApt' : 'aptitude');
      if (!outcome.permanent) setNotice(failureNotice(t, outcome.reason));
      return;
    }

    // El guardado va DESPUÉS de comprobar la forma, y no al revés. Al revés se
    // persistía el objeto de error como si fuera un perfil, y a partir de ahí
    // el bloque se cerraba solo en cada apertura sin llegar a lanzar el nativo.
    await saveArDeviceProfile(outcome.profile);
    setFailure(null);
    setProfile(outcome.profile);
    setPhase(outcome.profile.level === 'D' ? 'notApt' : 'menu');
  }, [t]);

  const updateThresholds = (t: ArThresholds) => { setThresholds(t); void saveArThresholds(t); };

  /**
   * Ficha del teléfono para el censo de la Fase 0.
   *
   * La Prueba de Aptitud es portátil y dura 90 segundos, así que no hace falta
   * POSEER un teléfono para caracterizarlo: basta con correrla en el móvil de
   * un compañero, del personal del centro o de una familia que ya viene a
   * consulta. Veinte teléfonos prestados dan muchísima más información sobre el
   * parque real que cuatro comprados a ojo, y cuestan cero. Este botón es lo
   * que convierte ese censo en algo que se hace en una sala de espera: se
   * comparte una línea de texto y se acabó.
   */
  const shareDeviceProfile = async () => {
    if (!profile) return;
    const p = profile.probes;
    try {
      await Share.share({
        title: t.ar.shareTitle,
        message:
          `${t.ar.shareHeader}\n\n` +
          `${t.ar.shareMaker}: ${profile.manufacturer}\n${t.ar.shareModel}: ${profile.model}\n` +
          `${t.ar.shareOs}: ${profile.osVersion}\n` +
          `${t.ar.shareLevel}: ${profile.level} (${t.ar.levelLabel(profile.level)})\n\n` +
          `${t.ar.shareFps}: ${p.fpsP5.toFixed(1)}\n` +
          `${t.ar.shareThermal}: ${p.thermalSlope.toFixed(2)}\n` +
          `${t.ar.shareTimestamps}: ${p.timestampSource}\n` +
          `${t.ar.shareJitter}: ${p.audioJitterMs != null ? `${p.audioJitterMs.toFixed(1)} ms` : t.ar.shareJitterNone}\n` +
          `${t.ar.sharePointer}: ${p.pointerRmsDeg.toFixed(2)}°\n` +
          `${t.ar.shareImu}: ${p.imuAvailable ? t.ar.shareYes : t.ar.shareNo}\n` +
          `${t.ar.shareScreen}: ${p.screenWidthMm.toFixed(0)} × ${p.screenHeightMm.toFixed(0)} mm\n` +
          `${t.ar.shareSeparation}: ${p.achievableSeparationDeg.toFixed(1)}°\n\n` +
          `${t.ar.shareFooter(new Date(profile.measuredAt).toLocaleDateString())}`,
      });
    } catch (e) { /* el usuario canceló el diálogo de compartir */ }
  };

  const start = async (exerciseId: ArExerciseId) => {
    if (!thresholds || !profile) return;
    setNotice('');

    // AR-3 sin calibrar apunta a la nada: la rutina de 5 puntos no es opcional.
    if (exerciseId === 'ar3' && !(await hasArCalibration(patientKey))) {
      setBusyMsg(t.ar.busyCalibrating);
      setPhase('busy');
      const cal = await calibrateAr(patientKey, thresholds.pointerSource);
      if (!cal) {
        setNotice(t.ar.noticeCalibrationFailed);
        setPhase('menu');
        return;
      }
    }

    setBusyMsg(t.ar.busyOpeningCamera);
    setPhase('busy');
    const res = await launchAr({
      exerciseId,
      patientKey,
      thresholds,
      trials: TRIALS_PER_SESSION[exerciseId],
    });

    if (!res) {
      setNotice(t.ar.noticeLaunchFailed);
      setPhase('menu');
      return;
    }
    if (res.outcome === 'denied') {
      setNotice(t.ar.noticeDenied);
      setPhase('menu');
      return;
    }

    // El nativo cerró solo porque dejó de ver la cara del peque. No es un fallo
    // de la app ni del niño: casi siempre es el encuadre. Se dice en palabras
    // del adulto y con la instrucción concreta, no con un error técnico.
    if (res.outcome === 'timeout') {
      trackArSession({ trials: res.trials, deviceProfile: res.deviceProfile, thresholds: res.thresholds });
      setNotice(t.ar.noticeTimeout);
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
      const premio = await registerSession(3 * participation, 1);
      setReward(premio);
      luaSessionReward(premio); // el mismo premio, en el cristal
    }
    setPhase('result');
  };

  // -------------------------------------------------------------------------
  const header = (title: string, sub: string) => (
    <View style={s.header}>
      <Pressable onPress={() => navigation?.goBack()} style={s.backPill} accessibilityRole="button" accessibilityLabel={t.common.back}>
        <Text style={s.backPillTxt}>‹ {t.common.back}</Text>
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
        {header(t.ar.title, t.ar.subPreparing)}
        <View style={s.center}>
          <ActivityIndicator size="large" color={V.color.primary} />
          <Text style={s.busyTxt}>{busyMsg || t.ar.oneMoment}</Text>
        </View>
      </View>
    );
  }

  if (phase === 'unsupported') {
    return (
      <View style={s.flex}>
        {header(t.ar.title, t.ar.subUnsupported)}
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.card}>
            <Text style={s.cardTitle}>{t.ar.unsupportedTitle}</Text>
            <Text style={s.cardTxt}>{t.ar.unsupportedBody}</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---- Consentimiento informado de cámara, por paciente --------------------
  if (phase === 'consent') {
    return (
      <View style={s.flex}>
        {header(t.ar.title, t.ar.subConsent)}
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.card}>
            <View style={{ alignItems: 'center' }}><BlockIcon name="ar" color={V.color.primaryDark} size={38} /></View>
            <Text style={s.cardTitle}>{t.ar.consentTitle}</Text>
            <Text style={s.cardTxt}>
              {t.ar.consentLead1}<Text style={s.b}>{t.ar.consentLeadStrong}</Text>{t.ar.consentLead2}
            </Text>
            <View style={s.list}>
              <Text style={s.item}><Text style={s.b}>{t.ar.consentNoRecordStrong}</Text>{t.ar.consentNoRecord}</Text>
              <Text style={s.item}><Text style={s.b}>{t.ar.consentNoUploadStrong}</Text>{t.ar.consentNoUpload}</Text>
              <Text style={s.item}><Text style={s.b}>{t.ar.consentNoFaceIdStrong}</Text>{t.ar.consentNoFaceId}</Text>
              <Text style={s.item}>{t.ar.consentMicOffPre}<Text style={s.b}>{t.ar.consentMicOffStrong}</Text>{t.ar.consentMicOffPost}</Text>
              <Text style={s.item}>{t.ar.consentRevoke}</Text>
            </View>
            <Pressable onPress={acceptConsent} style={s.primaryBtn} accessibilityRole="button"
              accessibilityLabel={t.ar.consentAcceptA11y}>
              <Text style={s.primaryBtnTxt}>{t.ar.consentAccept}</Text>
            </Pressable>
            <Pressable onPress={() => navigation?.goBack()} accessibilityRole="button" accessibilityLabel={t.ar.consentDecline}>
              <Text style={s.cancel}>{t.ar.consentDecline}</Text>
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
        {header(t.ar.title, t.ar.subWarmup)}
        <ScrollView contentContainerStyle={s.scroll}>
          {noticeBar}
          <View style={s.card}>
            <View style={{ alignItems: 'center' }}><CatPixel size={64} /></View>
            <Text style={s.cardTitle}>{t.ar.warmupTitle}</Text>
            <Text style={s.cardTxt}>
              {t.ar.warmupBody1a}<Text style={s.b}>{t.ar.warmupBody1Strong}</Text>{t.ar.warmupBody1b}
            </Text>
            <Text style={s.cardTxt}>
              {t.ar.warmupBody2a}<Text style={s.b}>{t.ar.warmupBody2Strong}</Text>{t.ar.warmupBody2b}
            </Text>
            <Pressable onPress={runAptitude} style={s.primaryBtn} accessibilityRole="button"
              accessibilityLabel={t.ar.warmupStartA11y}>
              <Text style={s.primaryBtnTxt}>{t.ar.warmupStart}</Text>
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
        {header(t.ar.title, t.ar.subNotApt)}
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.card}>
            <Text style={s.cardTitle}>{t.ar.notAptTitle}</Text>
            {/* Con causa permanente manda la causa: decirle a alguien que su
                teléfono «no llega al nivel mínimo» cuando lo que pasa es que
                ARCore no le da cámara frontal es una explicación falsa. */}
            {failure
              ? <Text style={s.cardTxt}>{permanentBody(t, failure.reason)}</Text>
              : <Text style={s.cardTxt}>{t.ar.levelNote(profile?.level ?? 'D')}</Text>}
            <Text style={s.cardTxt}>{t.ar.notAptBody}</Text>
            <Pressable onPress={() => navigation?.goBack()} style={s.primaryBtn} accessibilityRole="button">
              <Text style={s.primaryBtnTxt}>{t.ar.notAptBack}</Text>
            </Pressable>
            {/* Código técnico, no mensaje: es lo que una logopeda puede leerle
                por teléfono a soporte sin capturar un bugreport de 101 MB. */}
            {failure?.reason && (
              <Text style={s.failureCode}>
                {failure.reason}{failure.detail ? ` · ${failure.detail}` : ''}
              </Text>
            )}
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
    const meta = getArMeta(getUiLang()).find((m) => m.id === result.exerciseId);
    const rows: Array<[string, string]> = [[t.ar.rowTrials, String(trials.length)]];
    if (voided) rows.push([t.ar.rowVoided, String(voided)]);

    if (result.exerciseId === 'ar1') {
      const holds = trials.filter((t) => t.exerciseId === 'ar1' && !t.voided).map((t: any) => t.holdMaxMs as number);
      if (holds.length) {
        rows.push([t.ar.rowHoldMax, `${Math.max(...holds)} ms`]);
        rows.push([t.ar.rowHoldMean, `${Math.round(holds.reduce((a, b) => a + b, 0) / holds.length)} ms`]);
      }
      rows.push([t.ar.rowHoldTarget, `${result.thresholds.holdMs} ms`]);
    }
    if (result.exerciseId === 'ar2') {
      const lat = trials.filter((t) => t.exerciseId === 'ar2' && t.latencyMs != null).map((t: any) => t.latencyMs as number);
      const catches = trials.filter((t) => t.exerciseId === 'ar2' && (t as any).isCatch).length;
      rows.push([t.ar.rowCatchTrials, String(catches)]);
      rows.push([t.ar.rowTimedTurns, lat.length ? String(lat.length) : t.ar.rowTimedTurnsNone]);
      if (lat.length) {
        const sorted = [...lat].sort((a, b) => a - b);
        rows.push([t.ar.rowLatencyMedian, `${sorted[sorted.length >> 1]} ms`]);
      }
    }
    if (result.exerciseId === 'ar3') {
      const sel = trials.filter((t) => t.exerciseId === 'ar3' && !t.voided) as any[];
      const dwells = sel.map((t) => t.dwellMs as number).filter((n) => n > 0);
      rows.push([t.ar.rowTargets, String(sel[0]?.targetCount ?? '—')]);
      if (dwells.length) rows.push([t.ar.rowDwellMean, `${Math.round(dwells.reduce((a, b) => a + b, 0) / dwells.length)} ms`]);
    }
    if (result.exerciseId === 'ar4') {
      const valid = trials.filter((t) => t.exerciseId === 'ar4' && !t.voided) as any[];
      const times = valid.map((t) => t.acquisitionTimeMs as number).filter((n) => n > 0);
      const jitters = valid.map((t) => t.yawRmsDeg as number);
      if (times.length) {
        rows.push([t.ar.rowAcquisitionMean, `${Math.round(times.reduce((a, b) => a + b, 0) / times.length)} ms`]);
      }
      if (jitters.length) {
        rows.push([t.ar.rowJitterRms, `${(jitters.reduce((a, b) => a + b, 0) / jitters.length).toFixed(1)}°`]);
      }
    }
    if (result.exerciseId === 'ar5') {
      const valid = trials.filter((t) => t.exerciseId === 'ar5' && !t.voided) as any[];
      const vels = valid.map((t) => t.throwVelocityPxPerS as number).filter((n) => n > 0);
      const latencias = valid.map((t) => t.timeToThrowMs as number).filter((n) => n > 0);
      const desvios = valid.map((t) => Math.abs(t.throwAngleDeg as number));
      if (vels.length) {
        rows.push([t.ar.rowThrowVelocityMean, `${Math.round(vels.reduce((a, b) => a + b, 0) / vels.length)} px/s`]);
      }
      if (latencias.length) {
        rows.push([t.ar.rowThrowLatency, `${Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length)} ms`]);
      }
      if (desvios.length) {
        rows.push([t.ar.rowAimDeviation, `${(desvios.reduce((a, b) => a + b, 0) / desvios.length).toFixed(1)}°`]);
      }
    }
    if (result.exerciseId === 'ar6') {
      const valid = trials.filter((t) => t.exerciseId === 'ar6' && !t.voided) as any[];
      const holds = valid.map((t) => t.holdMs as number).filter((n) => n > 0);
      const syms = valid.map((t) => t.symmetryRatio as number);
      if (holds.length) {
        rows.push([t.ar.rowMimicHoldMean, `${Math.round(holds.reduce((a, b) => a + b, 0) / holds.length)} ms`]);
      }
      if (syms.length) {
        rows.push([t.ar.rowSymmetryMean, `${Math.round((syms.reduce((a, b) => a + b, 0) / syms.length) * 100)}%`]);
      }
    }

    return (
      <View style={s.flex}>
        {header(t.ar.sessionDone, meta?.name ?? t.ar.title)}
        <ScrollView contentContainerStyle={s.scroll}>
          {reward && (
            <View style={s.rewardCard}>
              <Text style={s.rewardXp}>+{reward.xpGained} XP</Text>
              <View style={s.rewardRow}>
                <PixelAward glyph="flame" tier={streakTier(reward.streak)} size={20} />
                <Text style={s.rewardSub}>{t.ar.streakLine(reward.streak, reward.level, reward.levelName)}</Text>
              </View>
            </View>
          )}
          <View style={s.card}>
            <Text style={s.cardTitle}>{t.ar.measuredTitle}</Text>
            {rows.map(([k, v]) => (
              <View key={k} style={s.dataRow}>
                <Text style={s.dataKey}>{k}</Text>
                <Text style={s.dataVal}>{v}</Text>
              </View>
            ))}
            <Text style={s.mdrNote}>{t.ar.mdrNote}</Text>
          </View>
          <Pressable onPress={() => { setResult(null); setReward(null); setPhase('menu'); }}
            style={s.primaryBtn} accessibilityRole="button">
            <Text style={s.primaryBtnTxt}>{t.ar.backToExercises}</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ---- Menú del bloque -----------------------------------------------------
  const policy = arPolicyFor(profile.level);
  return (
    <View style={s.flex}>
      {header(t.ar.title, t.ar.subLevel(t.ar.levelLabel(profile.level)))}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {noticeBar}

        <View style={s.levelCard}>
          <Text style={s.levelTitle}>{t.ar.levelHeading(profile.manufacturer, profile.model, profile.level, t.ar.levelLabel(profile.level))}</Text>
          <Text style={s.levelTxt}>{t.ar.levelNote(profile.level)}</Text>
          <View style={s.levelActions}>
            <Pressable onPress={runAptitude} accessibilityRole="button" accessibilityLabel={t.ar.warmupRedoA11y}>
              <Text style={s.levelRedo}>{t.ar.warmupRedo}</Text>
            </Pressable>
            {/* Censo de la Fase 0: caracterizar un móvil prestado sin poseerlo. */}
            <Pressable onPress={shareDeviceProfile} accessibilityRole="button" accessibilityLabel={t.ar.shareProfileA11y}>
              <Text style={s.levelRedo}>{t.ar.shareProfile}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={s.hubLabel}>{t.ar.exercisesKicker}</Text>
        {getArMeta(getUiLang()).map((m) => {
          const id = m.id as ArExerciseId;
          const enabled = policy.exercises.includes(id);
          const gameOnly = id === 'ar2' && enabled && !policy.ar2Instrumented;
          return (
            <Pressable key={m.id} onPress={() => enabled && start(id)} disabled={!enabled}
              style={[s.exCard, !enabled && s.exCardOff]}
              accessibilityRole="button"
              accessibilityLabel={enabled ? t.ar.practiceA11y(m.name) : t.ar.unavailableA11y(m.name)}>
              <View style={s.codeChip}><Text style={s.codeChipTxt}>{m.code}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.exName}>{m.name}</Text>
                <Text style={s.exCat}>{m.category}</Text>
                {gameOnly && <Text style={s.exFlag}>{t.ar.flagGameOnly}</Text>}
                {id === 'ar3' && enabled && policy.ar3Targets === 2 && (
                  <Text style={s.exFlag}>{t.ar.flagTwoTargets}</Text>
                )}
                {!enabled && <Text style={s.exFlag}>{t.ar.flagUnavailable}</Text>}
              </View>
              <Text style={s.exGo}>{enabled ? '▶' : '—'}</Text>
            </Pressable>
          );
        })}

        {/* Herramienta de la logopeda, no del niño. Va después de los ejercicios
            y con otro tono a propósito: no es parte del juego. */}
        <Pressable onPress={() => { void openArDiagnostics(); }} style={s.proTool}
          accessibilityRole="button" accessibilityLabel={t.ar.liveSignalsA11y}>
          <BlockIcon name="chart" color={V.color.primaryDark} size={17} />
          <View style={{ flex: 1 }}>
            <Text style={s.proToolTitle}>{t.ar.liveSignals}</Text>
            <Text style={s.proToolSub}>{t.ar.liveSignalsSub}</Text>
          </View>
          <Text style={s.exGo}>›</Text>
        </Pressable>

        <View style={s.setupCard}>
          <Text style={s.setupTitle}>{t.ar.setupTitle}</Text>
          <Text style={s.setupTxt}>{t.ar.setupBody}</Text>
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
  hubLabel: { fontSize: 12, fontWeight: '800', color: V.color.textSecondary, letterSpacing: 0.5, marginBottom: 12, marginTop: 6, marginHorizontal: 2 },

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
  levelActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 9 },
  levelRedo: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark },

  proTool: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 14, padding: 13, marginTop: 4, ...V.shadow.card },
  proToolTitle: { fontSize: 13.5, fontWeight: '800', color: V.color.textPrimary },
  proToolSub: { fontSize: 11, fontWeight: '600', color: V.color.textSecondary, marginTop: 2, lineHeight: 15 },

  exCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 15, padding: 13, marginBottom: 10, ...V.shadow.card },
  exCardOff: { opacity: 0.5, borderColor: V.color.border },
  codeChip: { minWidth: 46, height: 30, paddingHorizontal: 8, borderRadius: 9, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  codeChipTxt: { fontSize: 12, fontWeight: '800', color: V.color.primaryDark, letterSpacing: 0.3 },
  exName: { fontSize: 14.5, fontWeight: '800', color: V.color.textPrimary },
  exCat: { fontSize: 11.5, fontWeight: '700', color: V.color.textSecondary, marginTop: 2 },
  exFlag: { fontSize: 11, fontWeight: '700', color: '#9a5b13', marginTop: 5, lineHeight: 15 },
  exGo: { fontSize: 16, fontWeight: '800', color: V.color.primaryDark },

  setupCard: { backgroundColor: '#fffdf7', borderWidth: 1.5, borderColor: '#f0e6cc', borderRadius: 16, padding: 13, marginTop: 8 },
  setupTitle: { fontSize: 12.5, fontWeight: '800', color: '#9a5b13' },
  setupTxt: { fontSize: 11.5, fontWeight: '600', color: '#9a5b13', lineHeight: 16, marginTop: 5 },

  rewardCard: { backgroundColor: V.color.primaryTint, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 14 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 4 },
  rewardXp: { fontSize: 26, fontWeight: '800', color: V.color.primaryDark },
  rewardSub: { fontSize: 12, fontWeight: '700', color: V.color.textSecondary, marginTop: 6 },

  dataRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, borderTopColor: V.color.border, paddingVertical: 10 },
  dataKey: { flex: 1, fontSize: 12.5, fontWeight: '700', color: V.color.textSecondary },
  dataVal: { fontSize: 13.5, fontWeight: '800', color: V.color.textPrimary },
  mdrNote: { fontSize: 11, fontWeight: '600', color: V.color.textSecondary, lineHeight: 15, marginTop: 12 },
  // Deliberadamente discreto: es dato de soporte, no un mensaje para la familia.
  failureCode: {
    fontSize: 10, fontWeight: '700', color: V.color.textSecondary,
    letterSpacing: 0.4, marginTop: 14, textAlign: 'center', opacity: 0.65,
  },

  primaryBtn: { backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16, ...V.shadow.button },
  primaryBtnTxt: { color: '#fff', fontSize: 15.5, fontWeight: '800' },
  cancel: { textAlign: 'center', color: V.color.textSecondary, fontSize: 13, fontWeight: '800', marginTop: 12 },
});

export default ValeriaArLauncherScreen;

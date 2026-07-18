// ============================================================================
// Valeria+ · Pausa de sesión unificada — V1.0 (Fase 1.2)
// Un único punto de entrada para las pausas activas entre ejercicios, que
// alterna dos formatos:
//   · Cápsula TPR clásica ("escucha y muévete", ValeriaTPRCapsule).
//   · Ruta de Rutina TPR 2.0 (morfosintaxis transaccional, panel del adulto).
// La telemetría (inicio / hecho / salto / validación por orden) vive AQUÍ,
// así ninguna pantalla anfitriona puede olvidarse de contarla ni duplicarla.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';
import { speakClinical, stopSpeaking } from './valeriaVoice';
import { ValeriaTPRCapsuleOverlay } from './ValeriaTPRCapsule';
import { TPR_CAPSULES, TprCapsule } from './valeriaTprBank';
import { ROUTINE_ROUTES, RoutineRoute } from './valeriaRoutineRoutes';
import { ROUTE_DONE_PHRASE } from './valeriaPhraseBank';
import { TPR_CAPSULES_GL, ROUTINE_ROUTES_GL, ROUTE_DONE_PHRASE_GL } from './valeriaContentGl';
import { getLocale } from './valeriaLocale';
import {
  trackCapsuleStart, trackCapsuleDone, trackCapsuleSkip,
  trackRouteStart, trackRouteValidated, trackRouteFailed, trackRouteSkip,
} from './valeriaTelemetry';

export type SessionBreak =
  | { kind: 'capsule'; capsule: TprCapsule }
  | { kind: 'route'; route: RoutineRoute };

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Alterna formatos al azar (variedad de contenido, no de dificultad: ambos
// formatos son del mismo nivel y el adulto siempre puede saltarlos). Escoge los
// bancos según la variedad activa: en galego, cápsulas y rutas gallegas (que
// suenan con Celtia); en el resto, las castellanas.
export const pickSessionBreak = (): SessionBreak => {
  const gl = getLocale() === 'gl';
  const capsules = gl ? TPR_CAPSULES_GL : TPR_CAPSULES;
  const routes = gl ? ROUTINE_ROUTES_GL : ROUTINE_ROUTES;
  return Math.random() < 0.5
    ? { kind: 'capsule', capsule: pick(capsules) }
    : { kind: 'route', route: pick(routes) };
};

// ----------------------------------------------------------------------------
// Ruta de Rutina: la app dicta la orden transaccional, el niño la ejecuta con
// objetos reales (sin tocar la pantalla) y el adulto valida en binario.
// ----------------------------------------------------------------------------
const RoutineRouteOverlay: React.FC<{
  route: RoutineRoute;
  onDone: () => void;
  onSkip: () => void;
}> = ({ route, onDone, onSkip }) => {
  const [stage, setStage] = useState<'scene' | 'run'>('scene');
  const [step, setStep] = useState(0);
  const cmd = route.commands[step];
  const last = step + 1 >= route.commands.length;

  // Dictado con prosodia clínica: la densidad morfosintáctica exige que la
  // orden llegue entera, lenta y sin entonaciones que enmascaren los nexos.
  useEffect(() => {
    if (stage === 'run') speakClinical(cmd.text);
  }, [stage, cmd]);

  useEffect(() => () => stopSpeaking(), []);

  const advance = () => {
    if (last) { speakClinical(getLocale() === 'gl' ? ROUTE_DONE_PHRASE_GL : ROUTE_DONE_PHRASE); onDone(); }
    else setStep(step + 1);
  };

  const validate = (ok: boolean) => {
    if (ok) trackRouteValidated(); else trackRouteFailed();
    advance();
  };

  return (
    <View style={s.overlay}>
      <View style={s.card}>
        <Text style={s.kicker}>🏠 RUTA DE RUTINA · TPR 2.0</Text>
        <Text style={s.title}>{route.icon} {route.title}</Text>
        <View style={s.adultBanner}>
          <Text style={s.adultBannerTxt}>👤 Panel del adulto · el niño NO toca la pantalla: escucha y actúa con objetos reales.</Text>
        </View>

        {stage === 'scene' ? (
          <>
            <Text style={s.scene}>{route.scene}</Text>
            <Pressable onPress={() => setStage('run')} style={s.okBtn} accessibilityRole="button">
              <Text style={s.okBtnTxt}>▶ Estamos listos</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={s.emoji}>{cmd.emoji}</Text>
            <Text style={s.cmd}>“{cmd.text}”</Text>
            <Text style={s.focus}>Estructura: {cmd.focus}</Text>

            <View style={s.dots}>
              {route.commands.map((_, i) => (
                <View key={i} style={[s.dot, { backgroundColor: i < step ? V.color.primary : i === step ? '#f59e0b' : '#e5e7eb' }]} />
              ))}
            </View>

            <Pressable onPress={() => speakClinical(cmd.text)} style={s.repeatBtn} accessibilityRole="button" accessibilityLabel="Repetir la orden en voz alta">
              <Text style={s.repeatBtnTxt}>🔊 Repetir la orden</Text>
            </Pressable>

            {/* Validación binaria del cuidador: alimenta routes.validated/failed */}
            <View style={s.row}>
              <Pressable onPress={() => validate(false)} style={s.noBtn} accessibilityRole="button">
                <Text style={s.noBtnTxt}>✖️ No esta vez</Text>
              </Pressable>
              <Pressable onPress={() => validate(true)} style={s.okBtn} accessibilityRole="button">
                <Text style={s.okBtnTxt}>{last ? '✅ Lo hizo · terminar' : '✅ Lo hizo'}</Text>
              </Pressable>
            </View>
          </>
        )}

        <Pressable onPress={() => { stopSpeaking(); onSkip(); }} accessibilityRole="button">
          <Text style={s.skip}>Saltar esta vez</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ----------------------------------------------------------------------------
// Envoltorio con telemetría centralizada.
// ----------------------------------------------------------------------------
export const ValeriaSessionBreakOverlay: React.FC<{
  brk: SessionBreak;
  onDone: () => void;
  onSkip: () => void;
}> = ({ brk, onDone, onSkip }) => {
  const counted = useRef(false);
  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    if (brk.kind === 'capsule') trackCapsuleStart(); else trackRouteStart();
  }, [brk]);

  if (brk.kind === 'capsule') {
    return (
      <ValeriaTPRCapsuleOverlay
        capsule={brk.capsule}
        onDone={() => { trackCapsuleDone(); onDone(); }}
        onSkip={() => { trackCapsuleSkip(); onSkip(); }}
      />
    );
  }
  return <RoutineRouteOverlay route={brk.route} onDone={onDone} onSkip={() => { trackRouteSkip(); onSkip(); }} />;
};

// ----------------------------------------------------------------------------
const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,18,32,.6)', alignItems: 'center', justifyContent: 'center', padding: 26 },
  card: { width: '100%', maxWidth: 340, backgroundColor: '#fff', borderRadius: 26, padding: 22, alignItems: 'center' },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.1, color: '#f59e0b' },
  title: { fontSize: 20, fontWeight: '800', color: V.color.textPrimary, marginTop: 10, textAlign: 'center' },
  adultBanner: { backgroundColor: '#f5f0ff', borderWidth: 1, borderColor: '#ddccfa', borderRadius: 12, padding: 9, marginTop: 10, alignSelf: 'stretch' },
  adultBannerTxt: { fontSize: 11.5, fontWeight: '700', color: '#6d3fc4', lineHeight: 16, textAlign: 'center' },
  scene: { fontSize: 13.5, fontWeight: '700', color: V.color.textSecondary, marginTop: 14, lineHeight: 19, textAlign: 'center' },
  emoji: { fontSize: 64, marginTop: 12 },
  cmd: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary, marginTop: 8, lineHeight: 23, textAlign: 'center' },
  focus: { fontSize: 11, fontWeight: '700', color: V.color.textMuted, marginTop: 5 },
  dots: { flexDirection: 'row', gap: 7, marginTop: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  repeatBtn: { alignSelf: 'stretch', backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  repeatBtnTxt: { color: V.color.primaryDark, fontSize: 13, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 9, alignSelf: 'stretch', marginTop: 10 },
  okBtn: { flex: 1.2, backgroundColor: '#f59e0b', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  okBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  noBtn: { flex: 1, backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 4 },
  noBtnTxt: { color: V.color.error, fontSize: 13, fontWeight: '800' },
  skip: { marginTop: 13, fontSize: 12.5, fontWeight: '700', color: V.color.textMuted },
});

export default ValeriaSessionBreakOverlay;

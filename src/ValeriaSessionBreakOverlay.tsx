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
import { useT } from './i18n';
import { speakClinical, stopSpeaking } from './valeriaVoice';
import { ValeriaTPRCapsuleOverlay } from './ValeriaTPRCapsule';
import { TPR_CAPSULES, TprCapsule } from './valeriaTprBank';
import { ROUTINE_ROUTES, RoutineRoute } from './valeriaRoutineRoutes';
import { ROUTE_DONE_PHRASE } from './valeriaPhraseBank';
import { TPR_CAPSULES_GL, ROUTINE_ROUTES_GL, ROUTE_DONE_PHRASE_GL } from './valeriaContentGl';
import { TPR_CAPSULES_EU, ROUTINE_ROUTES_EU, ROUTE_DONE_PHRASE_EU } from './valeriaContentEu';
import { TPR_CAPSULES_EN, ROUTINE_ROUTES_EN, ROUTE_DONE_PHRASE_EN } from './valeriaContentEn';
import { TPR_CAPSULES_CA, ROUTINE_ROUTES_CA, ROUTE_DONE_PHRASE_CA } from './valeriaContentCa';
import { getLocale } from './valeriaLocale';
import {
  trackCapsuleStart, trackCapsuleDone, trackCapsuleSkip,
  trackRouteStart, trackRouteValidated, trackRouteFailed, trackRouteSkip,
} from './valeriaTelemetry';
import { useActiveTimeMonitor } from './valeriaActiveTimeMonitor';
import { triggerVisualAnchorBreak, cancelVisualAnchorBreak } from './valeriaLuaSession';

export type SessionBreak =
  | { kind: 'capsule'; capsule: TprCapsule }
  | { kind: 'route'; route: RoutineRoute };

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Alterna formatos al azar (variedad de contenido, no de dificultad: ambos
// formatos son del mismo nivel y el adulto siempre puede saltarlos). Escoge los
// bancos según la variedad activa: en galego, cápsulas y rutas gallegas (que
// suenan con Celtia); en el resto, las castellanas.
export const pickSessionBreak = (): SessionBreak => {
  const loc = getLocale();
  const capsules = loc === 'ca' ? TPR_CAPSULES_CA
    : loc === 'gl' ? TPR_CAPSULES_GL : loc === 'eu' ? TPR_CAPSULES_EU
    : loc === 'en-US' ? TPR_CAPSULES_EN : TPR_CAPSULES;
  const routes = loc === 'ca' ? ROUTINE_ROUTES_CA
    : loc === 'gl' ? ROUTINE_ROUTES_GL : loc === 'eu' ? ROUTINE_ROUTES_EU
    : loc === 'en-US' ? ROUTINE_ROUTES_EN : ROUTINE_ROUTES;
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
  const t = useT();
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
    if (last) { const l = getLocale(); speakClinical(l === 'gl' ? ROUTE_DONE_PHRASE_GL : l === 'eu' ? ROUTE_DONE_PHRASE_EU : l === 'en-US' ? ROUTE_DONE_PHRASE_EN : l === 'ca' ? ROUTE_DONE_PHRASE_CA : ROUTE_DONE_PHRASE); onDone(); }
    else setStep(step + 1);
  };

  const validate = (ok: boolean) => {
    if (ok) trackRouteValidated(); else trackRouteFailed();
    advance();
  };

  return (
    <View style={s.overlay}>
      <View style={s.card}>
        <Text style={s.kicker}>{t.breaks.routeKicker}</Text>
        <Text style={s.title}>{route.icon} {route.title}</Text>
        <View style={s.adultBanner}>
          <Text style={s.adultBannerTxt}>{t.breaks.adultBanner}</Text>
        </View>

        {stage === 'scene' ? (
          <>
            <Text style={s.scene}>{route.scene}</Text>
            <Pressable onPress={() => setStage('run')} style={s.okBtn} accessibilityRole="button">
              <Text style={s.okBtnTxt}>{t.breaks.ready}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={s.emoji}>{cmd.emoji}</Text>
            <Text style={s.cmd}>“{cmd.text}”</Text>
            <Text style={s.focus}>{t.breaks.structure(cmd.focus)}</Text>

            <View style={s.dots}>
              {route.commands.map((_, i) => (
                <View key={i} style={[s.dot, { backgroundColor: i < step ? V.color.primary : i === step ? '#f59e0b' : '#e5e7eb' }]} />
              ))}
            </View>

            <Pressable onPress={() => speakClinical(cmd.text)} style={s.repeatBtn} accessibilityRole="button" accessibilityLabel={t.breaks.repeatOrderA11y}>
              <Text style={s.repeatBtnTxt}>{t.breaks.repeatOrder}</Text>
            </Pressable>

            {/* Validación binaria del cuidador: alimenta routes.validated/failed */}
            <View style={s.row}>
              <Pressable onPress={() => validate(false)} style={s.noBtn} accessibilityRole="button">
                <Text style={s.noBtnTxt}>{t.breaks.notThisTime}</Text>
              </Pressable>
              <Pressable onPress={() => validate(true)} style={s.okBtn} accessibilityRole="button">
                <Text style={s.okBtnTxt}>{last ? t.breaks.routeDoneLast : t.breaks.routeDone}</Text>
              </Pressable>
            </View>
          </>
        )}

        <Pressable onPress={() => { stopSpeaking(); onSkip(); }} accessibilityRole="button">
          <Text style={s.skip}>{t.breaks.skip}</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ----------------------------------------------------------------------------
// Ancla Visual Lejana (regla 20-20-20): tarjeta SECUNDARIA, nunca un bloqueo.
//
// Aparece dentro de la pausa activa que el adulto ya está mirando, y solo si el
// reloj de `useActiveTimeMonitor` pasó de veinte minutos. Es una sugerencia con
// un botón: la app no detiene la sesión, no descuenta tiempo y no impide seguir.
// El muro regulatorio del proyecto (Clase I) es exactamente ese: la app sugiere
// y el adulto ejecuta. Por eso «Ahora no» también reinicia el reloj — un aviso
// que vuelve en el ejercicio siguiente deja de ser una sugerencia y pasa a ser
// insistencia.
//
// La pausa manda RELAX al aparato y la gata se echa a dormir los veinte
// segundos, que es lo que quita del cristal lo que retiene la mirada del niño.
// Sin aparato emparejado no pasa nada: el emisor no está registrado y la
// tarjeta sigue valiendo como consigna para el adulto.
// ----------------------------------------------------------------------------
const VisualAnchorCard: React.FC = () => {
  const t = useT();
  const { isVisualBreakRecommended, breakSeconds, noteVisualBreakTaken } = useActiveTimeMonitor();
  const [left, setLeft] = useState<number | null>(null);

  // Cuenta atrás visible: el adulto necesita saber cuánto queda para devolver
  // la mirada del niño a la tableta sin quedarse mirando un contador ciego.
  useEffect(() => {
    if (left === null) return;
    if (left <= 0) { setLeft(null); noteVisualBreakTaken(); return; }
    const id = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(id);
  }, [left, noteVisualBreakTaken]);

  useEffect(() => () => cancelVisualAnchorBreak(), []);

  if (!isVisualBreakRecommended && left === null) return null;

  const running = left !== null;

  return (
    <View style={s.anchorCard}>
      <Text style={s.anchorKicker}>{t.breaks.visualAnchorKicker}</Text>
      <Text style={s.anchorTitle}>
        {running ? t.breaks.visualAnchorRunning(left as number) : t.breaks.visualAnchorTitle}
      </Text>
      <Text style={s.anchorBody}>
        {running ? t.breaks.visualAnchorFarAway : t.breaks.visualAnchorBody}
      </Text>

      {running ? (
        <Pressable
          onPress={() => { cancelVisualAnchorBreak(); setLeft(null); noteVisualBreakTaken(); }}
          style={s.anchorGhostBtn}
          accessibilityRole="button"
        >
          <Text style={s.anchorGhostTxt}>{t.breaks.visualAnchorResume}</Text>
        </Pressable>
      ) : (
        <View style={s.row}>
          <Pressable onPress={() => noteVisualBreakTaken()} style={s.anchorGhostBtn} accessibilityRole="button">
            <Text style={s.anchorGhostTxt}>{t.breaks.visualAnchorLater}</Text>
          </Pressable>
          <Pressable
            onPress={() => { triggerVisualAnchorBreak(breakSeconds); setLeft(breakSeconds); }}
            style={s.anchorBtn}
            accessibilityRole="button"
            accessibilityHint={t.breaks.visualAnchorHint}
          >
            <Text style={s.anchorBtnTxt}>{t.breaks.visualAnchorStart(breakSeconds)}</Text>
          </Pressable>
        </View>
      )}

      <Text style={s.anchorFoot}>{t.breaks.visualAnchorFoot}</Text>
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

  // La tarjeta del ancla visual va FUERA del formato y encima de él: es la misma
  // sugerencia toque la cápsula o toque la ruta, y no debe duplicarse en dos
  // sitios ni depender de cuál salió sorteado.
  return (
    <>
      {brk.kind === 'capsule' ? (
        <ValeriaTPRCapsuleOverlay
          capsule={brk.capsule}
          onDone={() => { trackCapsuleDone(); onDone(); }}
          onSkip={() => { trackCapsuleSkip(); onSkip(); }}
        />
      ) : (
        <RoutineRouteOverlay route={brk.route} onDone={onDone} onSkip={() => { trackRouteSkip(); onSkip(); }} />
      )}
      <VisualAnchorCard />
    </>
  );
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

  // Ancla visual: anclada abajo y con su propio fondo oscuro, para que se lea
  // como una nota AL MARGEN del ejercicio y no como un paso más de la pausa.
  anchorCard: {
    position: 'absolute', left: 18, right: 18, bottom: 20,
    backgroundColor: '#0f2137', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#1d4ed8',
  },
  anchorKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1.1, color: '#7dd3fc' },
  anchorTitle: { fontSize: 15.5, fontWeight: '800', color: '#fff', marginTop: 6 },
  anchorBody: { fontSize: 12.5, fontWeight: '600', color: '#c7d7ea', marginTop: 6, lineHeight: 17.5 },
  anchorBtn: { flex: 1.4, backgroundColor: '#38bdf8', borderRadius: 13, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  anchorBtnTxt: { color: '#06263c', fontSize: 12.5, fontWeight: '800' },
  anchorGhostBtn: { flex: 1, borderWidth: 1, borderColor: '#2c4a6b', borderRadius: 13, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  anchorGhostTxt: { color: '#9fb6cd', fontSize: 12.5, fontWeight: '800' },
  anchorFoot: { fontSize: 10.5, fontWeight: '700', color: '#7e97b1', marginTop: 9, textAlign: 'center' },
});

export default ValeriaSessionBreakOverlay;

// ============================================================================
// Valeria+ · Quiebre Pragmático — Fallo Deliberado (Fase 2.2)
// Variante del panel de evaluación del adulto: la app NO emite ningún sonido.
// Es el PADRE quien rompe la comunicación a propósito (murmura la orden o pide
// algo absurdo) y observa cómo el niño REPARA el quiebre. La botonera de
// acierto fonológico se reemplaza por un selector de Estrategias de Reparación
// (enum RepairStrategy → telemetría pragmatic_repair_strategy).
//
// UX de retención: antes de empezar, un modal de advertencia explica que la
// tarea generará "frustración útil" y se puede cancelar. Sin esa expectativa,
// el llanto del niño se vive como fallo de la app y la familia abandona.
//
// Muro MDR: la app no programa este quiebre ni interpreta la estrategia
// observada; solo la registra. El adulto decide cuándo y cuántas veces.
// ============================================================================
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { V } from './valeriaTheme';
import { trackRepairStrategy, RepairStrategy } from './valeriaTelemetry';

// Guiones de quiebre entre los que elige el adulto (nunca la app por él).
const BREAK_SCRIPTS = [
  { id: 'murmullo', emoji: '🤫', title: 'Murmullo', text: 'Da una orden sencilla en voz MUY baja y poco clara, mirando hacia otro lado. Ejemplo: “tráeme el…” (ininteligible).' },
  { id: 'absurdo', emoji: '🙃', title: 'Orden absurda', text: 'Pide algo imposible o sin sentido con cara seria. Ejemplo: “Pon el zapato dentro de la nevera” o “Dame la nube de la mesa”.' },
] as const;

const STRATEGIES: Array<{ value: RepairStrategy; emoji: string; label: string; desc: string }> = [
  { value: 'peticion_repeticion', emoji: '🔁', label: 'Pidió repetición', desc: '“¿Qué?”, “¿otra vez?”, se acercó a escuchar' },
  { value: 'reformulacion', emoji: '💬', label: 'Reformuló', desc: 'Corrigió o negoció la orden absurda con sus palabras' },
  { value: 'gesto', emoji: '👉', label: 'Usó gestos', desc: 'Señaló, encogió los hombros, buscó tu mirada' },
  { value: 'aislamiento', emoji: '🚪', label: 'Se aisló', desc: 'Se retiró de la interacción o cambió de actividad' },
  { value: 'llanto', emoji: '😢', label: 'Llanto', desc: 'Desborde emocional ante el quiebre' },
  { value: 'sin_respuesta', emoji: '🫥', label: 'No registró el quiebre', desc: 'Siguió como si la orden hubiera sido normal' },
];

type Stage = 'warning' | 'script' | 'observe' | 'done';

export const ValeriaPragmaticBreakOverlay: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [stage, setStage] = useState<Stage>('warning');
  const [scriptIdx, setScriptIdx] = useState(0);
  const [picked, setPicked] = useState<RepairStrategy | null>(null);
  const script = BREAK_SCRIPTS[scriptIdx];

  const record = (strategy: RepairStrategy) => {
    setPicked(strategy);
    trackRepairStrategy(strategy); // O(1) en memoria + flush debounced
    setStage('done');
  };

  return (
    <View style={s.overlay}>
      <View style={s.card}>
        <Text style={s.kicker}>🎭 QUIEBRE PRAGMÁTICO · SOLO ADULTOS</Text>

        {stage === 'warning' && (
          <>
            <Text style={s.warnEmoji}>⚠️</Text>
            <Text style={s.title}>Esta tarea generará frustración útil</Text>
            <Text style={s.body}>
              Vas a romper la comunicación A PROPÓSITO para observar cómo tu hijo/a la repara.
              Es normal (y valioso) que se extrañe, proteste o se frustre un poco: esa reacción
              ES el ejercicio. Hazlo una sola vez, con calma, y termina siempre con un abrazo
              y la orden dicha bien.
            </Text>
            <View style={s.row}>
              <Pressable onPress={onClose} style={s.ghostBtn} accessibilityRole="button">
                <Text style={s.ghostBtnTxt}>Hoy no</Text>
              </Pressable>
              <Pressable onPress={() => setStage('script')} style={s.mainBtn} accessibilityRole="button">
                <Text style={s.mainBtnTxt}>Entendido, seguimos</Text>
              </Pressable>
            </View>
          </>
        )}

        {stage === 'script' && (
          <>
            <Text style={s.title}>{script.emoji} {script.title}</Text>
            {/* Vista de instrucción: la app calla; habla (o murmura) el padre. */}
            <View style={s.scriptCard}><Text style={s.scriptTxt}>{script.text}</Text></View>
            <Pressable
              onPress={() => setScriptIdx((scriptIdx + 1) % BREAK_SCRIPTS.length)}
              accessibilityRole="button"
            >
              <Text style={s.swapLink}>Prefiero la otra variante →</Text>
            </Pressable>
            <Pressable onPress={() => setStage('observe')} style={s.mainBtn} accessibilityRole="button">
              <Text style={s.mainBtnTxt}>Ya lo hice · ¿qué hizo el niño?</Text>
            </Pressable>
          </>
        )}

        {stage === 'observe' && (
          <>
            <Text style={s.title}>¿Cómo reparó el quiebre?</Text>
            <Text style={s.body}>Elige lo PRIMERO que hizo tu hijo/a. No hay respuestas malas: todas informan.</Text>
            <ScrollView style={{ alignSelf: 'stretch', maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {STRATEGIES.map((st) => (
                <Pressable
                  key={st.value}
                  onPress={() => record(st.value)}
                  style={s.stratRow}
                  accessibilityRole="button"
                  accessibilityLabel={st.label}
                >
                  <Text style={{ fontSize: 22 }}>{st.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.stratLabel}>{st.label}</Text>
                    <Text style={s.stratDesc}>{st.desc}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}

        {stage === 'done' && (
          <>
            <Text style={s.warnEmoji}>🤗</Text>
            <Text style={s.title}>Registrado</Text>
            <Text style={s.body}>
              {picked === 'llanto' || picked === 'aislamiento'
                ? 'Cierra ahora el quiebre: repite la orden bien dicha, valida la emoción (“te confundí, ¿verdad?”) y dad un abrazo. La reparación adulta también enseña.'
                : 'Cierra el círculo: repite la orden bien dicha y celebra su reacción. Reparar es una habilidad, ¡y la acaba de practicar!'}
            </Text>
            <Pressable onPress={onClose} style={s.mainBtn} accessibilityRole="button">
              <Text style={s.mainBtnTxt}>Volver a la sesión</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,18,32,.6)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 25 },
  card: { width: '100%', maxWidth: 350, backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center' },
  kicker: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1, color: '#b45309' },
  warnEmoji: { fontSize: 42, marginTop: 10 },
  title: { fontSize: 19, fontWeight: '800', color: V.color.textPrimary, marginTop: 8, textAlign: 'center' },
  body: { fontSize: 13, fontWeight: '600', color: V.color.textSecondary, marginTop: 8, lineHeight: 19, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 9, alignSelf: 'stretch', marginTop: 16 },
  mainBtn: { flex: 1, backgroundColor: '#f59e0b', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 14, alignSelf: 'stretch' },
  mainBtnTxt: { color: '#fff', fontSize: 13.5, fontWeight: '800' },
  ghostBtn: { flex: 1, backgroundColor: '#f1f5f4', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  ghostBtnTxt: { color: V.color.textSecondary, fontSize: 13.5, fontWeight: '800' },
  scriptCard: { backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#fcd9a8', borderRadius: 14, padding: 14, marginTop: 12, alignSelf: 'stretch' },
  scriptTxt: { fontSize: 13.5, fontWeight: '700', color: '#7c4a0e', lineHeight: 20 },
  swapLink: { marginTop: 10, fontSize: 12.5, fontWeight: '800', color: V.color.primaryDark },
  stratRow: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: V.color.border, borderRadius: 13, padding: 11, marginTop: 8 },
  stratLabel: { fontSize: 13.5, fontWeight: '800', color: V.color.textPrimary },
  stratDesc: { fontSize: 11, fontWeight: '600', color: V.color.textMuted, marginTop: 1 },
});

export default ValeriaPragmaticBreakOverlay;

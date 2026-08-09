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
import { useT, UiStrings } from './i18n';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';

// Guiones de quiebre entre los que elige el adulto (nunca la app por él).
// Guiones y escala de reparación: son INSTRUCCIONES y OBSERVACIÓN CLÍNICA para
// el adulto —la app no locuta nada de esto—, así que siguen al idioma de la
// interfaz. El `value` es el id que viaja a telemetría y NO cambia nunca.
const buildScripts = (t: UiStrings): Array<{ id: string; icon: BlockIconName; title: string; text: string }> => [
  { id: 'murmullo', icon: 'eyeOff', title: t.pragmatic.stressorMurmurTitle, text: t.pragmatic.stressorMurmurText },
  { id: 'absurdo', icon: 'blank', title: t.pragmatic.stressorAbsurdTitle, text: t.pragmatic.stressorAbsurdText },
];

// El `value` viaja a telemetría y NO cambia; el icono es solo su cara.
const buildStrategies = (t: UiStrings): Array<{ value: RepairStrategy; icon: BlockIconName; label: string; desc: string }> => [
  { value: 'peticion_repeticion', icon: 'repeat', label: t.pragmatic.repairAskLabel, desc: t.pragmatic.repairAskDesc },
  { value: 'reformulacion', icon: 'language', label: t.pragmatic.repairRephraseLabel, desc: t.pragmatic.repairRephraseDesc },
  { value: 'gesto', icon: 'gesture', label: t.pragmatic.repairGestureLabel, desc: t.pragmatic.repairGestureDesc },
  { value: 'aislamiento', icon: 'door', label: t.pragmatic.repairWithdrawLabel, desc: t.pragmatic.repairWithdrawDesc },
  { value: 'llanto', icon: 'tear', label: t.pragmatic.repairCryLabel, desc: t.pragmatic.repairCryDesc },
  { value: 'sin_respuesta', icon: 'blank', label: t.pragmatic.repairNoneLabel, desc: t.pragmatic.repairNoneDesc },
];

type Stage = 'warning' | 'script' | 'observe' | 'done';

export const ValeriaPragmaticBreakOverlay: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const t = useT();
  const BREAK_SCRIPTS = buildScripts(t);
  const STRATEGIES = buildStrategies(t);
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
        <Text style={s.kicker}>{t.pragmatic.kicker}</Text>

        {stage === 'warning' && (
          <>
            <View style={s.warnIcon}><BlockIcon name="warn" color="#b45309" size={34} /></View>
            <Text style={s.title}>{t.pragmatic.warnTitle}</Text>
            <Text style={s.body}>{t.pragmatic.warnBody}</Text>
            <View style={s.row}>
              <Pressable onPress={onClose} style={s.ghostBtn} accessibilityRole="button">
                <Text style={s.ghostBtnTxt}>{t.pragmatic.notToday}</Text>
              </Pressable>
              <Pressable onPress={() => setStage('script')} style={s.mainBtn} accessibilityRole="button">
                <Text style={s.mainBtnTxt}>{t.pragmatic.understood}</Text>
              </Pressable>
            </View>
          </>
        )}

        {stage === 'script' && (
          <>
            <View style={s.scriptHead}>
              <BlockIcon name={script.icon} color={V.color.primaryDark} size={20} />
              <Text style={s.title}>{script.title}</Text>
            </View>
            {/* Vista de instrucción: la app calla; habla (o murmura) el padre. */}
            <View style={s.scriptCard}><Text style={s.scriptTxt}>{script.text}</Text></View>
            <Pressable
              onPress={() => setScriptIdx((scriptIdx + 1) % BREAK_SCRIPTS.length)}
              accessibilityRole="button"
            >
              <Text style={s.swapLink}>{t.pragmatic.swapVariant}</Text>
            </Pressable>
            <Pressable onPress={() => setStage('observe')} style={s.mainBtn} accessibilityRole="button">
              <Text style={s.mainBtnTxt}>{t.pragmatic.didIt}</Text>
            </Pressable>
          </>
        )}

        {stage === 'observe' && (
          <>
            <Text style={s.title}>{t.pragmatic.repairTitle}</Text>
            <Text style={s.body}>{t.pragmatic.repairBody}</Text>
            <ScrollView style={{ alignSelf: 'stretch', maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {STRATEGIES.map((st) => (
                <Pressable
                  key={st.value}
                  onPress={() => record(st.value)}
                  style={s.stratRow}
                  accessibilityRole="button"
                  accessibilityLabel={st.label}
                >
                  <BlockIcon name={st.icon} color={V.color.primaryDark} size={22} />
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
            <View style={s.warnIcon}><BlockIcon name="heart" color={V.color.primaryDark} size={34} /></View>
            <Text style={s.title}>{t.pragmatic.recorded}</Text>
            <Text style={s.body}>
              {picked === 'llanto' || picked === 'aislamiento'
                ? t.pragmatic.closeLoopUpset
                : t.pragmatic.closeLoop}
            </Text>
            <Pressable onPress={onClose} style={s.mainBtn} accessibilityRole="button">
              <Text style={s.mainBtnTxt}>{t.pragmatic.backToSession}</Text>
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
  warnIcon: { alignItems: 'center', marginTop: 12, marginBottom: 2 },
  scriptHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
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
  stratDesc: { fontSize: 11, fontWeight: '600', color: V.color.textSecondary, marginTop: 1 },
});

export default ValeriaPragmaticBreakOverlay;

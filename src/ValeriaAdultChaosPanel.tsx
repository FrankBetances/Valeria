// ============================================================================
// Valeria+ · Panel del Adulto — Caos Comunicativo (compartido)
// Tarjeta colapsable que agrupa los TRES controles manuales de la Fase 2:
//   · Slider de ruido babble (ManualNoiseSlider → valeriaNoise).
//   · Interruptor del oso distractor (doble tarea) — el anfitrión renderiza
//     <ValeriaDistractorBear /> en la RAÍZ de su pantalla (los overlays
//     absolutos no pueden vivir dentro del ScrollView).
//   · Lanzador del quiebre pragmático — ídem con <ValeriaPragmaticBreakOverlay/>.
//
// [RA] Sección AÑADIDA para el bloque de Realidad Aumentada: los umbrales
// clínicos (sostén, grados de giro, ventana de respuesta, dwell y fuente de
// puntero). Es una AMPLIACIÓN, no una alteración: las tres props históricas
// mantienen su contrato y las dos nuevas son opcionales, de modo que las
// pantallas de los seis bloques actuales siguen montando el panel exactamente
// igual que antes.
//
// Muro MDR: este panel es la ÚNICA puerta de entrada a los módulos de carga;
// todo es manual y explícito. La app jamás activa ni ajusta nada por su cuenta.
// Con los umbrales de RA eso deja de ser higiene de diseño y pasa a ser el
// argumento de clasificación: si la app los ajustara sola entre ensayos, el
// módulo saltaría de SaMD Clase I a Clase IIa.
// El estado del distractor y del quiebre vive en la pantalla anfitriona (los
// overlays son suyos); el plegado es local porque a nadie más le importa.
// ============================================================================
import React, { useState } from 'react';
import { View, Text, Pressable, Switch, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';
import { useT } from './i18n';
import { ValeriaManualNoiseSlider } from './ValeriaManualNoiseSlider';
import { BlockIcon } from './ValeriaBlockIcons';
import { AR_THRESHOLD_RANGES } from './valeriaArSettings';
import type { ArThresholds } from './valeriaArBridge';

// Ajuste por pasos en lugar de deslizador: un umbral clínico se fija con una
// cifra deliberada, no arrastrando el dedo. Además queda legible en el registro.
const Stepper: React.FC<{
  label: string; hint: string; value: number; unit: string;
  min: number; max: number; step: number; onChange: (v: number) => void;
}> = ({ label, hint, value, unit, min, max, step, onChange }) => {
  const set = (next: number) => onChange(Math.max(min, Math.min(max, next)));
  return (
    <View style={s.stepRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.stepLabel}>{label}</Text>
        <Text style={s.stepHint}>{hint}</Text>
      </View>
      <Pressable onPress={() => set(value - step)} disabled={value <= min}
        style={[s.stepBtn, value <= min && s.stepBtnOff]} hitSlop={6}
        accessibilityRole="button" accessibilityLabel={`Bajar ${label}`}>
        <Text style={s.stepBtnTxt}>−</Text>
      </Pressable>
      <Text style={s.stepValue} accessibilityLabel={`${label}: ${value} ${unit}`}>{value}{unit}</Text>
      <Pressable onPress={() => set(value + step)} disabled={value >= max}
        style={[s.stepBtn, value >= max && s.stepBtnOff]} hitSlop={6}
        accessibilityRole="button" accessibilityLabel={`Subir ${label}`}>
        <Text style={s.stepBtnTxt}>+</Text>
      </Pressable>
    </View>
  );
};

export const ValeriaAdultChaosPanel: React.FC<{
  distractorOn: boolean;
  onDistractorChange: (on: boolean) => void;
  onLaunchPragmatic: () => void;
  // [RA] Opcionales: solo la pantalla de Realidad Aumentada los pasa.
  arThresholds?: ArThresholds;
  onArThresholdsChange?: (t: ArThresholds) => void;
}> = ({ distractorOn, onDistractorChange, onLaunchPragmatic, arThresholds, onArThresholdsChange }) => {
  const t = useT();
  const [open, setOpen] = useState(false);
  const showAr = !!arThresholds && !!onArThresholdsChange;
  const patchAr = (patch: Partial<ArThresholds>) => {
    if (arThresholds && onArThresholdsChange) onArThresholdsChange({ ...arThresholds, ...patch });
  };

  return (
    <View style={s.panel}>
      <Pressable
        onPress={() => setOpen(!open)}
        style={s.head}
        accessibilityRole="button"
        accessibilityLabel={open ? t.adult.closeA11y : t.adult.openA11y}
      >
        <Text style={s.kicker}>{t.adult.kicker}</Text>
        <Text style={s.chev}>{open ? '▾' : '▸'}</Text>
      </Pressable>
      {open && (
        <>
          <Text style={s.hint}>
            Controles manuales para entrenar la escucha en ambiente real. Úsalos si vuestro
            logopeda os lo ha pautado: la app nunca los activa ni los ajusta sola.
          </Text>
          <ValeriaManualNoiseSlider />
          <View style={s.dualRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.dualTitle}>{t.adult.distractorTitle}</Text>
              <Text style={s.dualSub}>{t.adult.distractorSub}</Text>
            </View>
            <Switch
              value={distractorOn}
              onValueChange={onDistractorChange}
              trackColor={{ false: '#d1d5db', true: V.color.primary }}
              thumbColor="#ffffff"
            />
          </View>
          <Pressable onPress={onLaunchPragmatic} style={s.pragBtn} accessibilityRole="button">
            <BlockIcon name="warn" color="#9a5b13" size={17} />
            <Text style={s.pragBtnTxt}>{t.adult.launchPragmatic}</Text>
          </Pressable>

          {/* [RA] Umbrales del bloque de Realidad Aumentada. Se fijan aquí y
              quedan CONSTANTES durante toda la sesión: la app no los toca. */}
          {showAr && arThresholds && (
            <View style={s.arBox}>
              <Text style={s.arKicker}>{t.adult.arKicker}</Text>
              <Text style={s.arHint}>
                Lo que se le va a exigir al peque en cada ejercicio. Los fijas tú antes de
                empezar y no cambian durante la sesión: la app mide y registra, el criterio
                clínico es siempre vuestro.
              </Text>

              <Stepper
                label="Sostén del gesto (AR-1)"
                hint="Cuánto tiempo debe mantener los labios redondeados para que el coche llegue a la meta."
                value={arThresholds.holdMs} unit=" ms"
                min={AR_THRESHOLD_RANGES.holdMs.min} max={AR_THRESHOLD_RANGES.holdMs.max}
                step={AR_THRESHOLD_RANGES.holdMs.step}
                onChange={(holdMs) => patchAr({ holdMs })}
              />
              <Stepper
                label="Giro de cabeza (AR-2)"
                hint="Cuántos grados debe girar hacia el sonido para contar como orientación."
                value={arThresholds.turnDeg} unit="°"
                min={AR_THRESHOLD_RANGES.turnDeg.min} max={AR_THRESHOLD_RANGES.turnDeg.max}
                step={AR_THRESHOLD_RANGES.turnDeg.step}
                onChange={(turnDeg) => patchAr({ turnDeg })}
              />
              <Stepper
                label="Ventana de respuesta (AR-2)"
                hint="Tiempo que se le da tras el sonido. Fuera de ventana es «sin respuesta», nunca «error»."
                value={arThresholds.responseWindowMs} unit=" ms"
                min={AR_THRESHOLD_RANGES.responseWindowMs.min} max={AR_THRESHOLD_RANGES.responseWindowMs.max}
                step={AR_THRESHOLD_RANGES.responseWindowMs.step}
                onChange={(responseWindowMs) => patchAr({ responseWindowMs })}
              />
              <Stepper
                label="Fijación para elegir (AR-3)"
                hint="Cuánto debe mirar un dibujo para seleccionarlo. El anillo de progreso se lo enseña."
                value={arThresholds.dwellMs} unit=" ms"
                min={AR_THRESHOLD_RANGES.dwellMs.min} max={AR_THRESHOLD_RANGES.dwellMs.max}
                step={AR_THRESHOLD_RANGES.dwellMs.step}
                onChange={(dwellMs) => patchAr({ dwellMs })}
              />

              <View style={s.pointerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.stepLabel}>{t.adult.gazePointer}</Text>
                  <Text style={s.stepHint}>
                    El iris es más preciso; la nariz, más estable en teléfonos modestos. Si el
                    puntero tiembla, cambia a nariz: el ejercicio no se entera.
                  </Text>
                </View>
                <View style={s.segment}>
                  {(['noseRay', 'iris'] as const).map((src) => {
                    const on = arThresholds.pointerSource === src;
                    return (
                      <Pressable key={src} onPress={() => patchAr({ pointerSource: src })}
                        style={[s.segBtn, on && s.segBtnOn]}
                        accessibilityRole="button" accessibilityState={{ selected: on }}
                        accessibilityLabel={src === 'iris' ? t.adult.pointerIrisA11y : t.adult.pointerNoseA11y}>
                        <Text style={[s.segTxt, on && s.segTxtOn]}>{src === 'iris' ? t.adult.pointerIris : t.adult.pointerNose}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  panel: { backgroundColor: '#fffdf7', borderWidth: 1.5, borderColor: '#f0e6cc', borderRadius: 18, padding: 13, marginTop: 18 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: '#9a5b13' },
  chev: { fontSize: 14, fontWeight: '800', color: '#9a5b13' },
  hint: { fontSize: 11.5, fontWeight: '600', color: V.color.textMuted, marginTop: 8, marginBottom: 10, lineHeight: 16 },
  dualRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 13, marginTop: 10 },
  dualTitle: { fontSize: 13, fontWeight: '800', color: V.color.textPrimary },
  dualSub: { fontSize: 11, fontWeight: '600', color: V.color.textMuted, marginTop: 3, lineHeight: 15 },
  pragBtn: { backgroundColor: '#fff7ed', borderWidth: 1.5, borderColor: '#fcd9a8', borderRadius: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 10 },
  pragBtnTxt: { color: '#9a5b13', fontSize: 13, fontWeight: '800' },

  // [RA] Umbrales del bloque de Realidad Aumentada
  arBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: V.color.border, borderRadius: 16, padding: 13, marginTop: 10 },
  arKicker: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  arHint: { fontSize: 11, fontWeight: '600', color: V.color.textMuted, marginTop: 6, marginBottom: 4, lineHeight: 15 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: V.color.border, paddingTop: 10, marginTop: 8 },
  stepLabel: { fontSize: 12.5, fontWeight: '800', color: V.color.textPrimary },
  stepHint: { fontSize: 10.5, fontWeight: '600', color: V.color.textMuted, marginTop: 2, lineHeight: 14 },
  // 40×40 + hitSlop: mismo mínimo accesible que el resto de controles del adulto.
  stepBtn: { width: 40, height: 40, borderRadius: 13, backgroundColor: V.color.primaryLight, borderWidth: 1, borderColor: V.color.borderActive, alignItems: 'center', justifyContent: 'center' },
  stepBtnOff: { opacity: 0.35 },
  stepBtnTxt: { fontSize: 18, fontWeight: '800', color: V.color.primaryDark, lineHeight: 20 },
  stepValue: { minWidth: 58, textAlign: 'center', fontSize: 12.5, fontWeight: '800', color: V.color.textPrimary },
  pointerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: V.color.border, paddingTop: 10, marginTop: 8 },
  segment: { flexDirection: 'row', backgroundColor: '#f1f5f4', borderRadius: 12, padding: 3, gap: 3 },
  segBtn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10 },
  segBtnOn: { backgroundColor: V.color.primary },
  segTxt: { fontSize: 12, fontWeight: '800', color: V.color.textMuted },
  segTxtOn: { color: '#fff' },
});

export default ValeriaAdultChaosPanel;

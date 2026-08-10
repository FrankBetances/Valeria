// ============================================================================
// Valeria+ · Evaluación subjetiva SUS adaptada (Likert 1-5) — V1.0
// Modal breve que se autodispara SOLO en un hito mayor (completar los 4 bloques)
// y como mucho una vez por semana por dispositivo (rate limiting en
// valeriaTelemetry) para evitar el sesgo de fatiga. La pregunta apunta a la
// CARGA DE USO REAL en la rutina del niño, no a métricas comerciales.
// Se monta una sola vez en la raíz del navegador y escucha onSusRequest.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { V } from './valeriaTheme';
import { BlockIcon } from './ValeriaBlockIcons';
import { onSusRequest, attachLikert } from './valeriaTelemetry';
import { useT, UiStrings } from './i18n';

// Ítem adaptado del System Usability Scale, orientado a integración en la
// rutina. Lo responde el ADULTO, así que el texto que VE sigue al idioma de la
// interfaz (t.sus.question).
//
// Lo que se REGISTRA, en cambio, es este identificador canónico y fijo. Guardar
// la frase ya traducida partiría los datos del piloto en dos series —una por
// idioma— que no se pueden agregar, y la comparación entre familias es justo
// para lo que existe la escala. El número (1..5) tampoco cambia nunca.
const SUS_QUESTION_ID = 'Fue fácil integrar este ejercicio en la rutina de mi hijo/a.';

const buildScale = (t: UiStrings): Array<{ v: number; label: string }> => [
  { v: 1, label: t.sus.disagree },
  { v: 2, label: t.sus.slightly },
  { v: 3, label: t.sus.neutral },
  { v: 4, label: t.sus.somewhat },
  { v: 5, label: t.sus.agree },
];

export const ValeriaSUSModal: React.FC = () => {
  const t = useT();
  const SCALE = buildScale(t);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => onSusRequest(() => { setPicked(null); setSent(false); setOpen(true); }), []);

  if (!open) return null;

  const submit = async (score: number) => {
    setPicked(score);
    setSent(true);
    await attachLikert(score, SUS_QUESTION_ID);
    setTimeout(() => setOpen(false), 900);
  };

  return (
    <View style={s.overlay}>
      <View style={s.modal}>
        <Pressable onPress={() => setOpen(false)} style={s.close}><BlockIcon name="cross" color={V.color.textSecondary} size={16} /></Pressable>
        <Text style={s.kicker}>{t.sus.kicker}</Text>
        {sent ? (
          <View style={s.thanks}>
            <View style={s.thanksIcon}><BlockIcon name="heart" color={V.color.primaryDark} size={34} /></View>
            <Text style={s.thanksTxt}>{t.sus.thanks}</Text>
          </View>
        ) : (
          <>
            <Text style={s.question}>{t.sus.question}</Text>
            <Text style={s.sub}>{t.sus.sub}</Text>
            <View style={s.scaleRow}>
              {SCALE.map((it) => {
                const on = picked === it.v;
                return (
                  <Pressable key={it.v} onPress={() => submit(it.v)} style={[s.scaleBtn, on && s.scaleBtnOn]}
                    accessibilityRole="button" accessibilityLabel={t.sus.scaleA11y(it.v, it.label)}>
                    <Text style={s.scaleNum}>{it.v}</Text>
                    {/* La escala SUS es de cinco puntos y la cara es su ayuda
                        visual; con emoji, cada teléfono dibujaba otras cinco. */}
                    <BlockIcon
                      name={(['moodBad', 'moodPoor', 'moodOk', 'moodGood', 'moodGreat'] as const)[it.v - 1]}
                      color={on ? '#ffffff' : V.color.textSecondary}
                      size={22}
                    />
                  </Pressable>
                );
              })}
            </View>
            <View style={s.ends}>
              <Text style={s.endTxt}>{t.sus.disagree}</Text>
              <Text style={s.endTxt}>{t.sus.agree}</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,18,32,.55)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 40 },
  modal: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 24, padding: 22 },
  close: { position: 'absolute', top: 12, right: 12, width: 30, height: 30, borderRadius: 15, backgroundColor: '#f1f5f4', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  closeTxt: { color: '#6b7280', fontWeight: '700' },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: V.color.primaryDark },
  question: { fontSize: 19, fontWeight: '800', color: V.color.textPrimary, marginTop: 10, lineHeight: 25 },
  sub: { fontSize: 12.5, fontWeight: '600', color: V.color.textMuted, marginTop: 6, lineHeight: 17 },
  scaleRow: { flexDirection: 'row', gap: 8, marginTop: 18, justifyContent: 'space-between' },
  scaleBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: V.color.border },
  scaleBtnOn: { backgroundColor: V.color.primaryLight, borderColor: V.color.primary },
  scaleNum: { fontSize: 13, fontWeight: '800', color: V.color.textSecondary },
  scaleFace: { fontSize: 24, marginTop: 4 },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 2 },
  endTxt: { fontSize: 10.5, fontWeight: '700', color: V.color.textMuted },
  thanks: { alignItems: 'center', paddingVertical: 18 },
  thanksIcon: { alignItems: 'center', marginBottom: 6 },
  thanksEmoji: { fontSize: 44 },
  thanksTxt: { fontSize: 15, fontWeight: '800', color: V.color.textPrimary, marginTop: 10, textAlign: 'center' },
});

export default ValeriaSUSModal;

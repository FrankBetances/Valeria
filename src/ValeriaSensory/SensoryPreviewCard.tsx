// ============================================================================
// Valeria+ · Integración Sensorial — Escucha previa del adulto (SEN-01)
//
// ACOPROS pidió poder oír todos los sonidos sin entrar y configurar cada
// actividad. Se resuelve FUERA de la sesión y para el adulto, no como una
// tanda dentro de la exposición: encadenar once estímulos delante de un niño
// con sobre-responsividad es lo contrario de una jerarquía gradual.
//
// Nivel fijo 2 de 5 y cuatro segundos por sonido. No se registra nada.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { V } from '../valeriaTheme';
import { useT } from '../i18n';
import { getLocale } from '../valeriaLocale';
import { BlockIcon } from '../ValeriaBlockIcons';
import { SENSORY_TRIGGER_LIST } from './sensoryCatalog';
import { SensoryTriggerId } from './sensoryTypes';
import {
  sensoryAudioSupported, prepareStimulus, startStimulus, stopStimulus, releaseStimulus,
} from './sensoryAudio';

const PREVIEW_LEVEL = 2;
const PREVIEW_MS = 4000;
const GAP_MS = 400; // deja terminar la rampa de salida antes de cargar el siguiente

export const SensoryPreviewCard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const locale = getLocale();
  const audioReady = useRef<boolean>(sensoryAudioSupported()).current;
  const [playing, setPlaying] = useState<SensoryTriggerId | null>(null);
  // Cada arranque toma un número; un temporizador de una tanda anterior que
  // llega tarde ve que ya no es el suyo y no hace nada.
  const run = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };

  const stopAll = () => {
    run.current += 1;
    clearTimers();
    stopStimulus();
    setPlaying(null);
  };

  const playFrom = (ids: SensoryTriggerId[], i: number, token: number) => {
    if (token !== run.current || i >= ids.length) { if (token === run.current) setPlaying(null); return; }
    void prepareStimulus(ids[i]).then((ok) => {
      if (token !== run.current) return;
      if (!ok) { setPlaying(null); return; }
      setPlaying(ids[i]);
      startStimulus(PREVIEW_LEVEL);
      later(() => {
        if (token !== run.current) return;
        stopStimulus();
        later(() => playFrom(ids, i + 1, token), GAP_MS);
      }, PREVIEW_MS);
    });
  };

  const start = (ids: SensoryTriggerId[]) => {
    run.current += 1;
    const token = run.current;
    clearTimers();
    stopStimulus();
    later(() => playFrom(ids, 0, token), GAP_MS);
  };

  // Salir de la lista corta la escucha: el sonido no sigue sonando en la
  // actividad que se abre ni en otra pantalla.
  useEffect(() => {
    const unsub = navigation?.addListener?.('blur', stopAll);
    return () => {
      unsub?.();
      run.current += 1;
      clearTimers();
      releaseStimulus();
    };
  }, []);

  const allIds = SENSORY_TRIGGER_LIST.map((x) => x.id);

  return (
    <View style={s.card}>
      <View style={s.head}>
        <BlockIcon name="sensory_ear" color={V.color.primaryDark} size={18} />
        <Text style={s.kicker}>{t.sensory.previewKicker}</Text>
      </View>
      <Text style={s.body}>{t.sensory.previewBody}</Text>

      {!audioReady ? (
        <Text style={s.noAudio}>{t.sensory.noAudioNotice}</Text>
      ) : (
        <>
          <Pressable
            onPress={() => (playing ? stopAll() : start(allIds))}
            style={s.allBtn}
            accessibilityRole="button"
          >
            <Text style={s.allBtnTxt}>{playing ? t.sensory.previewStop : t.sensory.previewPlayAll}</Text>
          </Pressable>

          {SENSORY_TRIGGER_LIST.map((item) => {
            const label = item.label[locale] ?? item.label.es;
            const on = playing === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => (on ? stopAll() : start([item.id]))}
                style={[s.row, on && s.rowOn]}
                accessibilityRole="button"
                accessibilityLabel={t.sensory.previewItemA11y(label, on)}
              >
                <BlockIcon name={on ? 'speakerOff' : 'play'} color={on ? '#ffffff' : V.color.primaryDark} size={18} />
                <Text style={[s.rowTxt, on && s.rowTxtOn]}>{label}</Text>
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff', borderWidth: 1, borderColor: V.color.border,
    borderRadius: 16, padding: 14, marginTop: 14,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kicker: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: V.color.primaryDark },
  body: { fontSize: 12.5, fontWeight: '600', color: V.color.textSecondary, lineHeight: 18, marginTop: 6 },
  noAudio: { fontSize: 12.5, fontWeight: '700', color: V.color.textMuted, marginTop: 10 },
  allBtn: {
    alignSelf: 'flex-start', backgroundColor: V.color.primary, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, marginTop: 12, marginBottom: 6,
  },
  allBtnTxt: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, marginTop: 4,
    backgroundColor: V.color.pageBg,
  },
  rowOn: { backgroundColor: V.color.primaryDark },
  rowTxt: { fontSize: 14, fontWeight: '700', color: V.color.textPrimary },
  rowTxtOn: { color: '#ffffff' },
});

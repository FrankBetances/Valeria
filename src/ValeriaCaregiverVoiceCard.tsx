// ============================================================================
// Valeria+ · Tarjeta de «Voz de la app / Voz de casa» para el modelo (P6.5)
// Visible para el cuidador en Pares Mínimos y Expansión Semántica.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useT } from './i18n';
import { AdultFold } from './ui/AdultFold';
import { FONT } from './ui/fonts';
import { notify } from './ui/notify';
import { V } from './valeriaTheme';
import {
  deleteCaregiverClip,
  hasCaregiverClip,
  loadCaregiverConsent,
  loadCaregiverVoiceSource,
  playCaregiverWord,
  setCaregiverConsent,
  setCaregiverVoiceSource,
  startCaregiverRecording,
  stopAndSaveCaregiverRecording,
  stopCaregiverPlayback,
  VoiceSourceChoice,
} from './valeriaCaregiverVoice';

export const ValeriaCaregiverVoiceCard: React.FC<{ word: string }> = ({ word }) => {
  const t = useT();
  const cg = t.caregiverVoice;
  const [consent, setConsent] = useState(false);
  const [source, setSource] = useState<VoiceSourceChoice>('app');
  const [hasClip, setHasClip] = useState(false);
  const [recording, setRecording] = useState(false);

  const refresh = async () => {
    const [c, src, clip] = await Promise.all([
      loadCaregiverConsent(),
      loadCaregiverVoiceSource(),
      hasCaregiverClip(word),
    ]);
    setConsent(c.granted);
    setSource(src);
    setHasClip(clip);
  };

  useEffect(() => {
    void refresh();
    return () => { stopCaregiverPlayback(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [word]);

  const onToggleConsent = async (v: boolean) => {
    const next = await setCaregiverConsent(v);
    setConsent(next.granted);
    if (!next.granted) {
      setSource('app');
      setHasClip(false);
    }
  };

  const onToggleSource = async (next: VoiceSourceChoice) => {
    setSource(next);
    await setCaregiverVoiceSource(next);
  };

  const onRecordPress = async () => {
    if (recording) {
      const ok = await stopAndSaveCaregiverRecording(word);
      setRecording(false);
      if (ok) {
        setHasClip(true);
        notify(cg.recordedBadge);
      }
      return;
    }
    const res = await startCaregiverRecording();
    if (!res.ok) {
      notify(cg.noMicPerm);
      return;
    }
    setRecording(true);
  };

  const onDelete = async () => {
    await deleteCaregiverClip(word);
    setHasClip(false);
  };

  return (
    <AdultFold label={cg.cardTitle}>
      <View style={s.box}>
        <View style={s.row}>
          <Text style={s.lbl}>{cg.consentLabel}</Text>
          <Switch
            value={consent}
            onValueChange={(v) => { void onToggleConsent(v); }}
            accessibilityLabel={cg.consentLabel}
            trackColor={{ false: '#d1d5db', true: V.color.primary }}
            thumbColor="#ffffff"
          />
        </View>
        <Text style={s.sub}>{consent ? cg.consentWithdrawWarn : cg.consentSub}</Text>

        {consent && (
          <>
            <Text style={s.secLbl}>{cg.sourceLabel}</Text>
            <View style={s.pillRow}>
              <Pressable
                onPress={() => { void onToggleSource('app'); }}
                style={[s.pill, source === 'app' && s.pillOn]}
                accessibilityRole="button"
              >
                <Text style={[s.pillTxt, source === 'app' && s.pillTxtOn]}>{cg.sourceApp}</Text>
              </Pressable>
              <Pressable
                onPress={() => { void onToggleSource('home'); }}
                style={[s.pill, source === 'home' && s.pillOn]}
                accessibilityRole="button"
              >
                <Text style={[s.pillTxt, source === 'home' && s.pillTxtOn]}>{cg.sourceHome}</Text>
              </Pressable>
            </View>

            <View style={s.actRow}>
              <Pressable
                onPress={() => { void onRecordPress(); }}
                style={[s.btn, recording && s.btnRec]}
                accessibilityRole="button"
              >
                <Text style={s.btnTxt}>{recording ? cg.stopBtn : cg.recordBtn}</Text>
              </Pressable>
              {hasClip && !recording && (
                <>
                  <Pressable
                    onPress={() => { void playCaregiverWord(word); }}
                    style={[s.btn, s.btnGhost]}
                    accessibilityRole="button"
                  >
                    <Text style={s.btnGhostTxt}>{cg.playBtn}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { void onDelete(); }}
                    style={[s.btn, s.btnDel]}
                    accessibilityRole="button"
                  >
                    <Text style={s.btnDelTxt}>{cg.deleteBtn}</Text>
                  </Pressable>
                </>
              )}
            </View>
            {recording && <Text style={s.recNote}>{cg.recordingNow}</Text>}
            {hasClip && !recording && <Text style={s.savedNote}>{`${cg.recordedBadge} · «${word}»`}</Text>}
          </>
        )}
      </View>
    </AdultFold>
  );
};

const s = StyleSheet.create({
  box: { gap: 10, paddingTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  lbl: { flex: 1, fontFamily: FONT.bodyBold, fontSize: 13.5, color: V.color.textPrimary },
  sub: { fontFamily: FONT.body, fontSize: 12.5, lineHeight: 17, color: V.color.textSecondary },
  secLbl: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.textPrimary, marginTop: 4 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  pillOn: { backgroundColor: V.color.primaryDark },
  pillTxt: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.textSecondary },
  pillTxtOn: { color: '#FFFFFF' },
  actRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  btn: { backgroundColor: V.color.primaryDark, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 },
  btnRec: { backgroundColor: '#DC2626' },
  btnTxt: { fontFamily: FONT.bodyBold, fontSize: 13, color: '#FFFFFF' },
  btnGhost: { backgroundColor: '#E6F9F8' },
  btnGhostTxt: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.primaryDark },
  btnDel: { backgroundColor: '#FEE2E2' },
  btnDelTxt: { fontFamily: FONT.bodyBold, fontSize: 13, color: '#991B1B' },
  recNote: { fontFamily: FONT.bodyBold, fontSize: 12.5, color: '#DC2626' },
  savedNote: { fontFamily: FONT.bodyBold, fontSize: 12.5, color: V.color.primaryDark },
});

export default ValeriaCaregiverVoiceCard;

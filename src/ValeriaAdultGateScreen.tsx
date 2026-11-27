// ============================================================================
// Valeria+ · Puerta de acompañamiento adulto (Play Age Signals · P5)
// Se muestra antes de la bienvenida únicamente cuando la señal de edad en
// memoria indica un menor de 18 años o una cuenta supervisada. No guarda nada.
// ============================================================================
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from './ui/ScreenHeader';
import { CatPixel } from './ValeriaCatPixel';
import { ProPinModal } from './ValeriaProPin';
import { listPros } from './valeriaFollowUp';
import { useT } from './i18n';
import { V } from './valeriaTheme';
import { FONT } from './ui/fonts';

interface Props {
  onUnlock: () => void;
}

export const ValeriaAdultGateScreen: React.FC<Props> = ({ onUnlock }) => {
  const t = useT();
  const [pinOpen, setPinOpen] = useState(false);
  const [mathMode, setMathMode] = useState(false);
  const [answer, setAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  const factors = useMemo(() => {
    const a = 6 + Math.floor(Math.random() * 4);
    const b = 12 + Math.floor(Math.random() * 7);
    return { a, b, product: a * b };
  }, []);

  const handleAdultPress = async () => {
    try {
      const pros = await listPros();
      if (pros.length > 0) {
        setPinOpen(true);
        return;
      }
    } catch {
      /* fallback al reto adulto si el almacenamiento no responde */
    }
    setAnswer('');
    setMathError(false);
    setMathMode(true);
  };

  const verifyMath = () => {
    const parsed = Number.parseInt(answer.trim(), 10);
    if (parsed === factors.product) {
      setMathError(false);
      onUnlock();
    } else {
      setMathError(true);
    }
  };

  return (
    <View style={s.root}>
      <ScreenHeader
        kicker={t.adultGate.kicker}
        title={t.adultGate.title}
        backLabel={t.common.back}
        mascot
      />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <CatPixel size={96} pose="head" />
          <Text style={s.body}>{t.adultGate.body}</Text>

          {!mathMode ? (
            <Pressable
              onPress={() => { void handleAdultPress(); }}
              style={s.primaryBtn}
              accessibilityRole="button"
              accessibilityLabel={t.adultGate.actionBtn}
            >
              <Text style={s.primaryBtnTxt}>{t.adultGate.actionBtn}</Text>
            </Pressable>
          ) : (
            <View style={s.mathBox}>
              <Text style={s.mathPrompt}>{t.adultGate.mathPrompt(factors.a, factors.b)}</Text>
              <TextInput
                value={answer}
                onChangeText={(txt) => { setAnswer(txt); setMathError(false); }}
                keyboardType="number-pad"
                placeholder={t.adultGate.mathPh}
                placeholderTextColor="#94A3B8"
                style={s.input}
                accessibilityLabel={t.adultGate.mathPh}
              />
              {mathError && <Text style={s.errorTxt}>{t.adultGate.mathWrong}</Text>}
              <View style={s.row}>
                <Pressable
                  onPress={() => setMathMode(false)}
                  style={s.secondaryBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t.adultGate.backToNotice}
                >
                  <Text style={s.secondaryBtnTxt}>{t.adultGate.backToNotice}</Text>
                </Pressable>
                <Pressable
                  onPress={verifyMath}
                  style={s.primaryBtn}
                  accessibilityRole="button"
                  accessibilityLabel={t.adultGate.mathVerify}
                >
                  <Text style={s.primaryBtnTxt}>{t.adultGate.mathVerify}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ProPinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onUnlock={() => {
          setPinOpen(false);
          onUnlock();
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F6FAFA',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6ECEB',
  },
  body: {
    fontFamily: FONT.body,
    fontSize: 16,
    lineHeight: 24,
    color: V.color.textPrimary,
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: V.color.primaryDark,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnTxt: {
    fontFamily: FONT.bodyBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  secondaryBtnTxt: {
    fontFamily: FONT.bodyBold,
    fontSize: 15,
    color: V.color.textSecondary,
  },
  mathBox: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  mathPrompt: {
    fontFamily: FONT.bodyBold,
    fontSize: 15,
    color: V.color.textPrimary,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    maxWidth: 180,
    borderWidth: 1.5,
    borderColor: V.color.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: FONT.bodyBold,
    fontSize: 18,
    color: V.color.textPrimary,
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
  },
  errorTxt: {
    fontFamily: FONT.body,
    fontSize: 13,
    color: '#DC2626',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
});

export default ValeriaAdultGateScreen;

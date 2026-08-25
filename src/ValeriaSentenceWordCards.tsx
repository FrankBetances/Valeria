// ============================================================================
// Valeria+ · Láminas de Segmentación de Frase (Modo B · Reconocimiento de Voz)
// Desglosa una frase objetivo en láminas visuales interactivas que se iluminan
// y reaccionan en tiempo real (palabra a palabra / streaming) conforme el niño
// las pronuncia al micrófono.
//
// Andamiaje multimodal para longitud media del enunciado (LME), discriminación
// léxica y reducción de ansiedad pediátrica (Regla: Lúa nunca castiga).
// ============================================================================
import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Vibration, Platform } from 'react-native';
import { V } from './valeriaTheme';
import { BlockIcon } from './ValeriaBlockIcons';
import { useT } from './i18n';
import { normalizeSpeech } from './valeriaVoice';

export interface SentenceWordCardsProps {
  target: string;
  heard?: string;
  isListening?: boolean;
  compact?: boolean;
  onWordMatch?: (matchedCount: number, totalCount: number) => void;
}

const cleanPunctuation = (s: string): string =>
  s.replace(/[¡!¿?.,:;"«»()—–]/g, '').trim();

const editDistance = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
};

interface WordCardItemProps {
  word: string;
  index: number;
  matched: boolean;
  isCurrent: boolean;
  isListening: boolean;
  compact?: boolean;
}

const WordCardItem: React.FC<WordCardItemProps> = ({
  word,
  index,
  matched,
  isCurrent,
  isListening,
  compact = false,
}) => {
  const t = useT();
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const prevMatched = useRef(matched);

  // Animación de rebote festivo (spring) al conseguir la palabra
  useEffect(() => {
    if (matched && !prevMatched.current) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.14, duration: 180, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ]).start();
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        try { Vibration.vibrate(15); } catch { /* noop */ }
      }
    } else if (!matched) {
      scale.setValue(1);
    }
    prevMatched.current = matched;
  }, [matched, scale]);

  // Pulso suave si es la palabra en curso durante la escucha
  useEffect(() => {
    if (isCurrent && isListening && !matched) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 0, duration: 550, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(0);
  }, [isCurrent, isListening, matched, pulse]);

  const activeGlowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  return (
    <Animated.View
      style={[
        s.card,
        compact && s.cardCompact,
        matched ? s.cardMatched : (isCurrent && isListening) ? s.cardCurrent : s.cardPending,
        { transform: [{ scale: (isCurrent && isListening && !matched) ? activeGlowScale : scale }] },
      ]}
      accessibilityRole="text"
      accessibilityLabel={matched ? t.voice.sentenceWordMatched(word) : t.voice.sentenceWordPending(word)}
    >
      {/* Badge numérico de orden sintáctico */}
      <View style={[s.badgeNum, matched && s.badgeNumMatched, (isCurrent && isListening && !matched) && s.badgeNumCurrent]}>
        <Text style={[s.badgeNumTxt, matched && s.badgeNumTxtMatched]}>{index + 1}</Text>
      </View>

      {/* Texto de la palabra */}
      <Text style={[s.wordTxt, compact && s.wordTxtCompact, matched && s.wordTxtMatched, (isCurrent && isListening && !matched) && s.wordTxtCurrent]}>
        {word}
      </Text>

      {/* Indicador de estado */}
      <View style={s.statusSlot}>
        {matched ? (
          <View style={s.checkPill}>
            <BlockIcon name="check" color="#ffffff" size={13} />
          </View>
        ) : (isCurrent && isListening) ? (
          <View style={s.listenDot}>
            <BlockIcon name="mic" color={V.color.primary} size={13} />
          </View>
        ) : (
          <View style={s.pendingDot} />
        )}
      </View>
    </Animated.View>
  );
};

export const SentenceWordCards: React.FC<SentenceWordCardsProps> = ({
  target,
  heard = '',
  isListening = false,
  compact = false,
  onWordMatch,
}) => {
  const t = useT();

  // Desglose de palabras de la frase
  const words = useMemo(() => {
    const raw = target.trim().split(/\s+/).filter(Boolean);
    return raw.map(cleanPunctuation).filter(Boolean);
  }, [target]);

  // Si no hay palabras suficientes (ej. 0 o 1 palabra suelta), no hace falta segmentar
  if (words.length <= 1) {
    return null;
  }

  // Tokenización y emparejamiento fonético tolerante
  const { matchedArray, hitCount, currentIdx } = useMemo(() => {
    const normHeard = normalizeSpeech(heard);
    const heardTokens = normHeard ? normHeard.split(' ').filter(Boolean) : [];

    const matched = words.map((w) => {
      const nw = normalizeSpeech(w);
      if (!nw) return false;
      if (heardTokens.length === 0) return false;
      if (normHeard.includes(nw)) return true;

      // Coincidencia por token con tolerancia de 1 fonema en palabras > 3 letras
      return heardTokens.some((ht) =>
        ht === nw || (nw.length > 3 && editDistance(ht, nw) <= 1),
      );
    });

    const hits = matched.filter(Boolean).length;
    const firstUnmatched = matched.findIndex((m) => !m);
    const current = firstUnmatched === -1 ? words.length - 1 : firstUnmatched;

    return { matchedArray: matched, hitCount: hits, currentIdx: current };
  }, [words, heard]);

  useEffect(() => {
    onWordMatch?.(hitCount, words.length);
  }, [hitCount, words.length, onWordMatch]);

  const total = words.length;
  const progressRatio = total > 0 ? hitCount / total : 0;
  const allMatched = hitCount === total;

  return (
    <View style={s.container}>
      {/* Cabecera con kicker y progreso LME */}
      <View style={s.headerRow}>
        <View style={s.kickerGroup}>
          <BlockIcon name="level" color={V.color.primaryDark} size={14} />
          <Text style={s.kickerTxt}>{t.voice.sentenceCardsKicker}</Text>
        </View>
        <Text style={[s.progressBadgeTxt, allMatched && s.progressBadgeTxtFull]}>
          {t.voice.sentenceCardsProgress(hitCount, total)}
        </Text>
      </View>

      {/* Barra de progreso visual */}
      <View style={s.progressBarTrack}>
        <View style={[s.progressBarFill, { width: `${Math.round(progressRatio * 100)}%` }, allMatched && s.progressBarFillFull]} />
      </View>

      {/* Tira / Parrilla de Láminas de Palabras */}
      <View style={s.cardsGrid}>
        {words.map((word, idx) => (
          <WordCardItem
            key={`${idx}-${word}`}
            word={word}
            index={idx}
            matched={matchedArray[idx] ?? false}
            isCurrent={idx === currentIdx}
            isListening={isListening}
            compact={compact || words.length > 4}
          />
        ))}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    ...V.shadow.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kickerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kickerTxt: {
    fontSize: 11,
    fontFamily: V.font.bold,
    color: V.color.primaryDark,
    letterSpacing: 0.6,
  },
  progressBadgeTxt: {
    fontSize: 12,
    fontFamily: V.font.bold,
    color: V.color.textSecondary,
  },
  progressBadgeTxtFull: {
    color: '#16A34A',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: V.color.primary,
  },
  progressBarFillFull: {
    backgroundColor: '#2ECC40',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    minWidth: 84,
    gap: 8,
    borderWidth: 1.8,
    ...V.shadow.card,
  },
  cardCompact: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    minWidth: 70,
    gap: 6,
    borderRadius: 12,
  },
  cardPending: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardCurrent: {
    backgroundColor: '#F0FDFA',
    borderColor: V.color.primary,
    ...V.shadow.button,
  },
  cardMatched: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    ...V.shadow.card,
  },
  badgeNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumCurrent: {
    backgroundColor: V.color.primary,
  },
  badgeNumMatched: {
    backgroundColor: '#16A34A',
  },
  badgeNumTxt: {
    fontSize: 11,
    fontFamily: V.font.bold,
    color: V.color.textSecondary,
  },
  badgeNumTxtMatched: {
    color: '#FFFFFF',
  },
  wordTxt: {
    fontSize: 16,
    fontFamily: V.font.bold,
    color: V.color.textPrimary,
  },
  wordTxtCompact: {
    fontSize: 14,
  },
  wordTxtCurrent: {
    color: V.color.primaryDark,
  },
  wordTxtMatched: {
    color: '#14532D',
  },
  statusSlot: {
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkPill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listenDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
});

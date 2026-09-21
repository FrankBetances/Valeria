// ============================================================================
// Valeria+ · Motor de Juego de Pesca/Arrastre con Lúa (Antura Pattern)
// Mecánica no punitiva: cero frustración, retorno suave, cinemática BLE sincronizada
// ============================================================================
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Platform,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import type { Locale } from '../../../valeriaLocale';
import { getDragFishingRounds } from './dragFishingRounds';
import { INITIAL_DDA_STATE, updateDDAOnResult } from './dragFishingDDA';
import type { DragFishingDDAState, DragTargetItem } from './dragFishingTypes';
import { DragTarget } from './DragTarget';
import { LuaDragSprite } from './LuaDragSprite';
import { speakToChild } from '../../../valeriaVoice';
import { sendLuaOpcode, cancelSessionReward } from '../../../valeriaLuaSession';
import { LUA_OP } from '../../../valeriaLuaProtocol';

interface DragFishingEngineProps {
  locale: Locale;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const DragFishingEngine: React.FC<DragFishingEngineProps> = ({
  locale,
  onFinish,
  onExit,
}) => {
  const rounds = useMemo(() => getDragFishingRounds(locale), [locale]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [ddaState, setDdaState] = useState<DragFishingDDAState>(INITIAL_DDA_STATE);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccessRound, setIsSuccessRound] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentRound = rounds[roundIdx] ?? rounds[0];

  // Limita los distractores visibles según el estado de DDA actual (2 a 4)
  const activeOptions = useMemo(() => {
    const opts = currentRound.options;
    const correct = opts.find((o) => o.isCorrect)!;
    const distractors = opts.filter((o) => !o.isCorrect).slice(0, ddaState.distractorCount - 1);
    // Mezcla determinista
    return [correct, ...distractors].sort((a, b) => a.id.localeCompare(b.id));
  }, [currentRound, ddaState.distractorCount]);

  // Coordenadas animadas para arrastrar a Lúa
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Medición de áreas de colisión para las dianas
  const targetLayouts = useRef<Record<string, { x: number; y: number; width: number; height: number }>>({});

  // Temporizador de vacilación (hesitation): tras 5s sin interactuar, resalta la diana
  const hesitationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetHesitationTimer = useCallback(() => {
    if (hesitationTimer.current) clearTimeout(hesitationTimer.current);
    hesitationTimer.current = setTimeout(() => {
      setDdaState((prev) => ({ ...prev, showHesitationHint: true }));
    }, 5000);
  }, []);

  // Al inicio de cada ronda, hablar la consigna y arrancar temporizador
  useEffect(() => {
    setIsSuccessRound(false);
    pan.setValue({ x: 0, y: 0 });
    speakToChild(currentRound.prompt);
    resetHesitationTimer();

    return () => {
      if (hesitationTimer.current) clearTimeout(hesitationTimer.current);
    };
  }, [currentRound, pan, resetHesitationTimer]);

  // Cleanup de Lúa al desmontar
  useEffect(() => {
    return () => {
      cancelSessionReward();
      sendLuaOpcode(LUA_OP.IDLE);
    };
  }, []);

  // Comprueba si las coordenadas actuales colisionan con alguna diana
  const checkCollision = useCallback(
    (dropX: number, dropY: number): DragTargetItem | null => {
      for (const opt of activeOptions) {
        const layout = targetLayouts.current[opt.id];
        if (layout) {
          const withinX = dropX >= layout.x - 20 && dropX <= layout.x + layout.width + 20;
          const withinY = dropY >= layout.y - 20 && dropY <= layout.y + layout.height + 20;
          if (withinX && withinY) {
            return opt;
          }
        }
      }
      return null;
    },
    [activeOptions],
  );

  // PanResponder para mover a Lúa
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isSuccessRound && !isGameOver,
        onMoveShouldSetPanResponder: () => !isSuccessRound && !isGameOver,
        onPanResponderGrant: () => {
          setIsDragging(true);
          if (hesitationTimer.current) clearTimeout(hesitationTimer.current);
          sendLuaOpcode(LUA_OP.PHASE, 1); // Fase de repetición / movimiento
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (evt, gestureState) => {
          setIsDragging(false);

          // Coordenadas absolutas de la soltada
          const dropX = gestureState.moveX;
          const dropY = gestureState.moveY;

          const hit = checkCollision(dropX, dropY);

          if (hit && hit.isCorrect) {
            // ¡Acierto!
            setIsSuccessRound(true);
            if (Platform.OS === 'android' || Platform.OS === 'ios') {
              try { Vibration.vibrate(10); } catch { /* noop */ }
            }
            sendLuaOpcode(LUA_OP.VERDICT, 2); // Calma / Aprobación en Lúa
            speakToChild('¡Muy bien!');

            setDdaState((prev) => updateDDAOnResult(prev, true));

            // Siguiente ronda tras breve celebración
            setTimeout(() => {
              if (roundIdx + 1 < rounds.length) {
                setRoundIdx((idx) => idx + 1);
              } else {
                setIsGameOver(true);
                sendLuaOpcode(LUA_OP.CELEBRATE, 0);
                onFinish?.(rounds.length * 10);
              }
            }, 1200);
          } else {
            // Fallo o soltado en el vacío: CERO CASTIGO (Antura style)
            // Retorno elástico suave al origen
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 6,
              tension: 40,
              useNativeDriver: false,
            }).start();

            sendLuaOpcode(LUA_OP.PHASE, 0); // Vuelve a fase neutra atenta
            setDdaState((prev) => updateDDAOnResult(prev, false));

            // Si soltó en un distractor erróneo, se refuerza la palabra correcta sin penalizar
            if (hit && !hit.isCorrect) {
              speakToChild(currentRound.targetStimulus.label);
            }

            resetHesitationTimer();
          }
        },
      }),
    [isSuccessRound, isGameOver, pan, checkCollision, roundIdx, rounds.length, currentRound, onFinish, resetHesitationTimer],
  );

  return (
    <View style={styles.engineContainer}>
      {/* Cabecera del juego */}
      <View style={styles.topBar}>
        <TouchableOpacity activeOpacity={0.7} onPress={onExit} style={styles.exitBtn}>
          <Text style={styles.exitBtnText}>✕ Salir</Text> // i18n-exempt: botón salir
        </TouchableOpacity>
        <Text style={styles.roundIndicator}> // i18n-exempt: contador de rondas
          {`Ronda ${roundIdx + 1} de ${rounds.length}`}
        </Text>
      </View>

      {/* Consigna */}
      <View style={styles.promptCard}>
        <Text style={styles.promptText}>{currentRound.prompt}</Text> // i18n-exempt: consigna dinámica
      </View>

      {/* Área de Dianas Receptoras */}
      <View style={styles.targetsRow}>
        {activeOptions.map((opt) => (
          <View
            key={opt.id}
            onLayout={(e) => {
              e.target.measure((_x, _y, width, height, pageX, pageY) => {
                targetLayouts.current[opt.id] = { x: pageX, y: pageY, width, height };
              });
            }}
          >
            <DragTarget
              target={opt}
              isHesitatingHint={opt.isCorrect && ddaState.showHesitationHint}
            />
          </View>
        ))}
      </View>

      {/* Zona de salida de Lúa con animación Pan */}
      <View style={styles.luaDockArea}>
        <Text style={styles.dragPrompt}> // i18n-exempt: consigna gestual
          {isDragging ? '¡Lleva a Lúa hacia la respuesta!' : '👆 Arrastra a Lúa hacia su objetivo'}
        </Text>

        <Animated.View
          style={[
            styles.luaMovable,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <LuaDragSprite isDragging={isDragging} size={88} />
        </Animated.View>
      </View>

      {/* Pantalla final de victoria */}
      {isGameOver && (
        <View style={styles.celebrationOverlay}>
          <Text style={styles.celebrationTitle}>🎉 ¡Excelente trabajo!</Text> // i18n-exempt: felicitación
          <Text style={styles.celebrationSub}>Lúa ha pescado todas sus palabras con éxito.</Text> // i18n-exempt: resumen
          <TouchableOpacity activeOpacity={0.8} onPress={onExit} style={styles.finishBtn}>
            <Text style={styles.finishBtnText}>Volver al Hub</Text> // i18n-exempt: botón volver
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  engineContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  exitBtnText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '700',
  },
  roundIndicator: {
    fontSize: 14,
    fontWeight: '800',
    color: '#00A39E',
  },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00C4BE',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promptText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  targetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  luaDockArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  dragPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
  },
  luaMovable: {
    zIndex: 99,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: 24,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00A39E',
    marginBottom: 8,
  },
  celebrationSub: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  finishBtn: {
    backgroundColor: '#00C4BE',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  finishBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

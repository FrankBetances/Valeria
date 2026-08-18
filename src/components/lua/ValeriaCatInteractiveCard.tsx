// ============================================================================
// Valeria+ · Lúa · Tarjeta Interactiva Dinámica a 60 fps
//
// Combina:
//   1. Animaciones continuas a 60 fps (hilo nativo con useNativeDriver: true):
//      respiración pautada a 15 rpm, balanceo pendular de cola y amortiguación táctil.
//   2. Micro-expresiones discretas estilo retro (parpadeo, ronroneo, masticar).
//   3. Renderizado de accesorios superpuestos mediante matrices estáticas precalculadas.
// ============================================================================
import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { V } from '../../valeriaTheme';
import {
  PRECOMPILED_RUNS,
  PixelRun,
  COLLECTIBLES_CATALOG,
  getCollectibleById,
} from './luaPixelSegments';
import { LuaAffectState, LuaInventoryState } from '../../types/valeriaLua';
import { recordPatInteraction, feedLuaSnack } from '../../services/valeriaLuaInventory';

interface Props {
  inventory: LuaInventoryState;
  onInventoryChange?: (newInv: LuaInventoryState) => void;
  onPressCard?: () => void;
  size?: number; // Ancho base en px (default 64 para no sobrecargar la vista)
}

export const ValeriaCatInteractiveCard: React.FC<Props> = ({
  inventory,
  onInventoryChange,
  onPressCard,
  size = 64,
}) => {
  const cols = 32;
  const rows = 38;
  const cell = Math.max(1, Math.round(size / cols)); // cell = 2 para size 64 -> 64x76 px
  const svgWidth = cell * cols;
  const svgHeight = cell * rows;

  // Estado afectivo actual
  const [affect, setAffect] = useState<LuaAffectState>('IDLE_SERENE');
  const [activeHeadRuns, setActiveHeadRuns] = useState<PixelRun[]>(PRECOMPILED_RUNS.headNeutral);
  const [bubbleSnack, setBubbleSnack] = useState<string | null>(null);

  // Valores animados nativos (UI Thread)
  const breathAnim = useRef(new Animated.Value(0)).current;
  const tailAnim = useRef(new Animated.Value(0)).current;
  const touchScale = useRef(new Animated.Value(1)).current;
  const headBounce = useRef(new Animated.Value(0)).current;

  // 1. Loop continuo de respiración fisiológica (2s inhalar / 2s exhalar = 15 rpm)
  useEffect(() => {
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    breathLoop.start();

    // 2. Loop pendular de cola
    const tailLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(tailAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tailAnim, {
          toValue: -1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    tailLoop.start();

    return () => {
      breathLoop.stop();
      tailLoop.stop();
    };
  }, [breathAnim, tailAnim]);

  // 3. Parpadeo aleatorio suave durante reposo (cada 4.5s)
  useEffect(() => {
    if (affect !== 'IDLE_SERENE') return;

    const interval = setInterval(() => {
      setActiveHeadRuns(PRECOMPILED_RUNS.headBlink);
      setTimeout(() => {
        setActiveHeadRuns(PRECOMPILED_RUNS.headNeutral);
      }, 160);
    }, 4500);

    return () => clearInterval(interval);
  }, [affect]);

  // 4. Interacción táctil (Caricia / Tap en Lúa)
  const handlePat = async () => {
    Animated.sequence([
      Animated.spring(touchScale, {
        toValue: 1.08,
        useNativeDriver: true,
        speed: 40,
        bounciness: 8,
      }),
      Animated.spring(touchScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 4,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(headBounce, {
        toValue: -2.5,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(headBounce, {
        toValue: 0,
        duration: 200,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();

    setAffect('PURRING_LOVE');
    setActiveHeadRuns(PRECOMPILED_RUNS.headLove);

    const updated = await recordPatInteraction();
    if (onInventoryChange) onInventoryChange(updated);

    setTimeout(() => {
      setAffect('IDLE_SERENE');
      setActiveHeadRuns(PRECOMPILED_RUNS.headNeutral);
    }, 1800);
  };

  // 5. Dar de comer a Lúa (Acción de Snack)
  const handleFeed = async (snackId: string) => {
    setAffect('EATING_SNACK');
    setBubbleSnack(snackId);

    setActiveHeadRuns(PRECOMPILED_RUNS.headEatOpen);

    setTimeout(() => {
      setActiveHeadRuns(PRECOMPILED_RUNS.headLove);
    }, 480);

    setTimeout(async () => {
      setBubbleSnack(null);
      setAffect('IDLE_SERENE');
      setActiveHeadRuns(PRECOMPILED_RUNS.headNeutral);
      const updated = await feedLuaSnack(snackId);
      if (onInventoryChange) onInventoryChange(updated);
    }, 1300);
  };

  // Interpolaciones nativas a 60 fps
  const translateYBody = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1.4],
  });

  const translateYHead = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -0.8],
  });

  const rotateTail = tailAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-6deg', '0deg', '8deg'],
  });

  // Accesorios equipados
  const headItem = inventory.equipped.head ? getCollectibleById(inventory.equipped.head) : undefined;
  const neckItem = inventory.equipped.neck ? getCollectibleById(inventory.equipped.neck) : undefined;

  const headItemRuns = headItem ? PRECOMPILED_RUNS.items[headItem.id] : null;
  const neckItemRuns = neckItem ? PRECOMPILED_RUNS.items[neckItem.id] : null;

  return (
    <View style={styles.cardContainer}>
      {/* Sección Izquierda: Mascota animada contenida y proporcionada */}
      <Pressable
        onPress={handlePat}
        accessibilityRole="button"
        accessibilityLabel="Acariciar a la gata Lúa"
        accessibilityHint="Toca para acariciarla y ver su ronroneo"
        style={styles.petWrap}
      >
        <Animated.View
          style={[
            styles.avatarPlate,
            {
              transform: [{ scale: touchScale }],
            },
          ]}
        >
          {bubbleSnack && (
            <View style={styles.thoughtBubble}>
              <Text style={styles.thoughtEmoji}>🐟✨</Text>
            </View>
          )}

          {affect === 'PURRING_LOVE' && (
            <View style={styles.loveBubble}>
              <Text style={styles.loveEmoji}>💖</Text>
            </View>
          )}

          <View style={{ width: svgWidth, height: svgHeight }}>
            {/* CAPA 1: Cola oscilante */}
            <Animated.View
              style={[
                styles.layer,
                {
                  left: 21 * cell,
                  top: 23 * cell,
                  transform: [
                    { rotate: rotateTail },
                    { translateY: translateYBody },
                  ],
                },
              ]}
            >
              <Svg width={10 * cell} height={14 * cell} viewBox="0 0 10 14">
                {PRECOMPILED_RUNS.tailBase.map((r) => (
                  <Rect
                    key={`t-${r.x}-${r.y}`}
                    x={r.x}
                    y={r.y}
                    width={r.w + 0.1}
                    height={1.1}
                    fill={r.fill}
                  />
                ))}
              </Svg>
            </Animated.View>

            {/* CAPA 2: Tronco y patas (Respiración) */}
            <Animated.View
              style={[
                styles.layer,
                {
                  left: 0,
                  top: 22 * cell,
                  transform: [{ translateY: translateYBody }],
                },
              ]}
            >
              <Svg width={32 * cell} height={16 * cell} viewBox="0 0 32 16">
                {PRECOMPILED_RUNS.bodyBase.map((r) => (
                  <Rect
                    key={`b-${r.x}-${r.y}`}
                    x={r.x}
                    y={r.y}
                    width={r.w + 0.1}
                    height={1.1}
                    fill={r.fill}
                  />
                ))}
              </Svg>
            </Animated.View>

            {/* CAPA 3: Cuello / Accesorio de Pechera */}
            {neckItemRuns && (
              <Animated.View
                style={[
                  styles.layer,
                  {
                    left: 4 * cell,
                    top: 18 * cell,
                    transform: [{ translateY: translateYBody }],
                  },
                ]}
              >
                <Svg width={24 * cell} height={24 * cell} viewBox="0 0 24 24">
                  {neckItemRuns.map((r) => (
                    <Rect
                      key={`neck-${r.x}-${r.y}`}
                      x={r.x}
                      y={r.y}
                      width={r.w + 0.1}
                      height={1.1}
                      fill={r.fill}
                    />
                  ))}
                </Svg>
              </Animated.View>
            )}

            {/* CAPA 4: Cabeza y Expresión Facial Activa */}
            <Animated.View
              style={[
                styles.layer,
                {
                  left: 0,
                  top: 0,
                  transform: [
                    { translateY: translateYHead },
                    { translateY: headBounce },
                  ],
                },
              ]}
            >
              <Svg width={32 * cell} height={18 * cell} viewBox="0 0 32 18">
                {activeHeadRuns.map((r) => (
                  <Rect
                    key={`h-${r.x}-${r.y}`}
                    x={r.x}
                    y={r.y}
                    width={r.w + 0.1}
                    height={1.1}
                    fill={r.fill}
                  />
                ))}
              </Svg>
            </Animated.View>

            {/* CAPA 5: Accesorio de Cabeza (Gorro / Flor) */}
            {headItemRuns && (
              <Animated.View
                style={[
                  styles.layer,
                  {
                    left: 4 * cell,
                    top: -4 * cell,
                    transform: [
                      { translateY: translateYHead },
                      { translateY: headBounce },
                    ],
                  },
                ]}
              >
                <Svg width={24 * cell} height={24 * cell} viewBox="0 0 24 24">
                  {headItemRuns.map((r) => (
                    <Rect
                      key={`head-item-${r.x}-${r.y}`}
                      x={r.x}
                      y={r.y}
                      width={r.w + 0.1}
                      height={1.1}
                      fill={r.fill}
                    />
                  ))}
                </Svg>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </Pressable>

      {/* Sección Derecha: Información empática y botón de premiar */}
      <View style={styles.rightContent}>
        <View style={styles.badgeRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusTxt}>
              {affect === 'PURRING_LOVE' ? '💖 ¡Ronroneando!' : affect === 'EATING_SNACK' ? '🐟 ¡Qué rico!' : '🐱 Tu compañera Lúa'}
            </Text>
          </View>
          <Text style={styles.patHint}>Toca para acariciar</Text>
        </View>

        <Text style={styles.companionTitle}>
          {affect === 'PURRING_LOVE'
            ? '¡Lúa se siente feliz contigo!'
            : 'Lista para la sesión de hoy'}
        </Text>

        {inventory.unlockedItemIds.includes('snack_fish') && (
          <Pressable
            onPress={() => handleFeed('snack_fish')}
            style={styles.snackBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Dar pescadito a Lúa"
          >
            <Text style={styles.snackTxt}>🐟 Premiar con Pescadito</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: V.color.borderActive,
    padding: 12,
    gap: 12,
    ...V.shadow.card,
  },
  petWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlate: {
    width: 76,
    height: 84,
    borderRadius: 18,
    backgroundColor: V.color.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
  },
  thoughtBubble: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: V.color.primary,
    ...V.shadow.card,
    zIndex: 10,
  },
  thoughtEmoji: {
    fontSize: 12,
  },
  loveBubble: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#fff0f4',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#ef8296',
    ...V.shadow.card,
    zIndex: 10,
  },
  loveEmoji: {
    fontSize: 12,
  },
  rightContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    backgroundColor: V.color.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTxt: {
    fontSize: 11,
    fontWeight: V.font.extrabold,
    color: V.color.primaryDark,
  },
  patHint: {
    fontSize: 10,
    fontWeight: V.font.semibold,
    color: V.color.textMuted,
  },
  companionTitle: {
    fontSize: 13.5,
    lineHeight: 17,
    fontWeight: V.font.extrabold,
    color: V.color.textPrimary,
  },
  snackBtn: {
    alignSelf: 'flex-start',
    backgroundColor: V.color.primaryTint,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: V.color.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
  },
  snackTxt: {
    fontSize: 11.5,
    fontWeight: V.font.extrabold,
    color: V.color.primaryDark,
  },
});

export default ValeriaCatInteractiveCard;

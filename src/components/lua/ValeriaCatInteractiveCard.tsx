// ============================================================================
// Valeria+ · Lúa · Tarjeta Interactiva Dinámica a 60 fps
//
// Combina:
//   1. Animaciones continuas a 60 fps (hilo nativo con useNativeDriver: true):
//      respiración pautada a 15 rpm, balanceo pendular de cola y amortiguación táctil.
//   2. Micro-expresiones discretas basadas en la matriz canónica SIT (32×38).
//   3. Renderizado de capas anatómicas continuas y accesorios en pixel art nativo.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
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
import { PixelAward } from '../../ValeriaPixelAwards';
import {
  PRECOMPILED_RUNS,
  PixelItemIcon,
} from './luaPixelSegments';
import { Run } from '../../ValeriaCatPixel';
import { LuaAffectState, LuaInventoryState, getCollectibleById } from '../../types/valeriaLua';
import { recordPatInteraction, feedLuaSnack } from '../../services/valeriaLuaInventory';
import { useT } from '../../i18n';

interface Props {
  inventory: LuaInventoryState;
  onInventoryChange?: (newInv: LuaInventoryState) => void;
  onPressCard?: () => void;
  size?: number; // Ancho base en px (default 64)
}

export const ValeriaCatInteractiveCard: React.FC<Props> = ({
  inventory,
  onInventoryChange,
  onPressCard,
  size = 64,
}) => {
  const t = useT();
  const cols = 32;
  const rows = 38;
  const cell = Math.max(1, Math.round(size / cols)); // cell = 2 para size 64 -> 64×76 px
  const svgWidth = cell * cols;
  const svgHeight = cell * rows;
  const plateWidth = Math.max(76, svgWidth + 12);
  const plateHeight = Math.max(84, svgHeight + 8);

  // Estado afectivo actual
  const [affect, setAffect] = useState<LuaAffectState>('IDLE_SERENE');
  const [activeHeadRuns, setActiveHeadRuns] = useState<Run[]>(PRECOMPILED_RUNS.headNeutral);
  const [bubbleSnack, setBubbleSnack] = useState<string | null>(null);

  // Valores animados nativos (UI Thread)
  const breathAnim = useRef(new Animated.Value(0)).current;
  const tailAnim = useRef(new Animated.Value(0)).current;
  const touchScale = useRef(new Animated.Value(1)).current;
  const headBounce = useRef(new Animated.Value(0)).current;

  const isMounted = useRef(true);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const safeTimeout = (fn: () => void, ms: number) => {
    let id: NodeJS.Timeout;
    id = setTimeout(() => {
      timersRef.current = timersRef.current.filter((tId) => tId !== id);
      if (isMounted.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

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

  // 3. Parpadeo suave durante reposo (cada 4.5s)
  useEffect(() => {
    if (affect !== 'IDLE_SERENE') return;

    const interval = setInterval(() => {
      if (!isMounted.current) return;
      setActiveHeadRuns(PRECOMPILED_RUNS.headBlink);
      safeTimeout(() => {
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
    if (isMounted.current && onInventoryChange) onInventoryChange(updated);

    safeTimeout(() => {
      setAffect('IDLE_SERENE');
      setActiveHeadRuns(PRECOMPILED_RUNS.headNeutral);
    }, 1800);
  };

  // 5. Dar de comer a Lúa (Acción de Snack)
  const handleFeed = async (snackId: string) => {
    setAffect('EATING_SNACK');
    setBubbleSnack(snackId);

    setActiveHeadRuns(PRECOMPILED_RUNS.headEatOpen);

    safeTimeout(() => {
      setActiveHeadRuns(PRECOMPILED_RUNS.headLove);
    }, 480);

    safeTimeout(async () => {
      setBubbleSnack(null);
      setAffect('IDLE_SERENE');
      setActiveHeadRuns(PRECOMPILED_RUNS.headNeutral);
      const updated = await feedLuaSnack(snackId);
      if (isMounted.current && onInventoryChange) onInventoryChange(updated);
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
    <Pressable
      onPress={onPressCard}
      disabled={!onPressCard}
      style={styles.cardContainer}
    >
      {/* Sección Izquierda: Mascota animada canónica sin huecos */}
      <Pressable
        onPress={handlePat}
        accessibilityRole="button"
        accessibilityLabel={t.hub.luaPatA11y}
        accessibilityHint={t.hub.luaPatHintA11y}
        style={styles.petWrap}
      >
        <Animated.View
          style={[
            styles.avatarPlate,
            {
              width: plateWidth,
              height: plateHeight,
              transform: [{ scale: touchScale }],
            },
          ]}
        >
          {bubbleSnack && (
            <View style={styles.thoughtBubble}>
              <PixelItemIcon id={bubbleSnack} size={20} />
            </View>
          )}

          {affect === 'PURRING_LOVE' && (
            <View style={styles.loveBubble}>
              <PixelAward glyph="heart" tier="teal" size={16} />
            </View>
          )}

          <View style={{ width: svgWidth, height: svgHeight }}>
            {/* CAPA 1: Cola oscilante independiente (cols 25..31, filas 24..35 de SIT) */}
            <Animated.View
              style={[
                styles.layer,
                {
                  left: 25 * cell,
                  top: 24 * cell,
                  transform: [
                    { rotate: rotateTail },
                    { translateY: translateYBody },
                  ],
                },
              ]}
            >
              <Svg width={7 * cell} height={12 * cell} viewBox="0 0 7 12">
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

            {/* CAPA 2: Tronco y patas (filas 22..37 de SIT = 16 filas exactas) */}
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

            {/* CAPA 3: Cuello / Accesorio de Pechera (filas 18..26 de SIT) */}
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

            {/* CAPA 4: Cabeza y Expresión Facial Activa (filas 0..21 de SIT = 22 filas exactas) */}
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
              <Svg width={32 * cell} height={22 * cell} viewBox="0 0 32 22">
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

            {/* CAPA 5: Accesorio de Cabeza (Flor / Gorro) */}
            {headItemRuns && headItem && (
              <Animated.View
                style={[
                  styles.layer,
                  {
                    left: headItem.id === 'head_wizard' ? 4 * cell : 2 * cell,
                    top: headItem.id === 'head_wizard' ? -6 * cell : 0 * cell,
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

      {/* Sección Derecha: Información empática y botón de premiar sin emojis de sistema */}
      <View style={styles.rightContent}>
        <View style={styles.badgeRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusTxt}>
              {affect === 'PURRING_LOVE'
                ? t.hub.luaPurring
                : affect === 'EATING_SNACK'
                  ? t.hub.luaEating
                  : t.hub.luaCompanion}
            </Text>
          </View>
          <Text style={styles.patHint}>{t.hub.luaPatHint}</Text>
        </View>

        <Text style={styles.companionTitle}>
          {affect === 'PURRING_LOVE'
            ? t.hub.luaHappy
            : t.hub.luaReady}
        </Text>

        {inventory.unlockedItemIds.includes('snack_fish') && (
          <Pressable
            onPress={() => handleFeed('snack_fish')}
            style={styles.snackBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t.hub.luaFeedFishA11y}
          >
            <PixelItemIcon id="snack_fish" size={16} />
            <Text style={styles.snackTxt}>{t.hub.luaFeedFish}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
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
    padding: 4,
    borderWidth: 1,
    borderColor: V.color.primary,
    ...V.shadow.card,
    zIndex: 10,
  },
  loveBubble: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#fff0f4',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ef8296',
    ...V.shadow.card,
    zIndex: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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

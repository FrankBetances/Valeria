// ============================================================================
// Valeria+ · Lúa · Tarjeta de la mascota y del progreso
//
// Una sola pieza en el hub. Antes eran dos tarjetas seguidas —esta y la tira de
// juego— y cada una pintaba su propia Lúa: dos gatas idénticas a treinta píxeles
// una de otra. La tira sigue existiendo para las pantallas de ejercicio; aquí se
// funde con la mascota y el nivel comparte tarjeta con ella.
//
// Animación en el hilo nativo (useNativeDriver): respiración a 15 rpm, punta de
// cola pendular y amortiguación al tocar. Los gestos son cambios de rejilla, no
// interpolaciones: se cambia el mapa de la cabeza y ya está.
//
// El orden de las capas importa y no es el evidente: los accesorios van DESPUÉS
// de la cabeza. Con la cabeza encima, el nudo de la pajarita quedaba tapado y
// solo se veían las dos alas sueltas a los lados de la barbilla.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { V } from '../../valeriaTheme';
import { PixelAward, streakTier } from '../../ValeriaPixelAwards';
import { PRECOMPILED_RUNS } from './luaPixelSegments';
import { PixelItemIcon } from './PixelItemIcon';
import { Run } from '../../ValeriaCatPixel';
import { LuaAffectState, LuaInventoryState, getCollectibleById } from '../../types/valeriaLua';
import { luaCraves } from '../../valeriaLuaMascot';
import { recordPatInteraction, feedLuaSnack } from '../../services/valeriaLuaInventory';
import { GameState, levelFor, levelProgress, xpToNext, liveStreak, LEVEL_COUNT } from '../../valeriaGamification';
import { useT } from '../../i18n';

interface Props {
  inventory: LuaInventoryState;
  game: GameState | null;
  onInventoryChange?: (newInv: LuaInventoryState) => void;
  /** Abre la colección de premios. Sin PIN: es del niño. */
  onOpenAwards: () => void;
  size?: number;
}

const COLS = 32;
const ROWS = 38;

export const ValeriaCatInteractiveCard: React.FC<Props> = ({
  inventory,
  game,
  onInventoryChange,
  onOpenAwards,
  size = 64,
}) => {
  const t = useT();
  const cell = Math.max(1, Math.round(size / COLS));
  const svgWidth = cell * COLS;
  const svgHeight = cell * ROWS;
  const plateWidth = Math.max(76, svgWidth + 12);
  const plateHeight = Math.max(84, svgHeight + 8);

  const [affect, setAffect] = useState<LuaAffectState>('IDLE_SERENE');
  const [headRuns, setHeadRuns] = useState<Run[]>(PRECOMPILED_RUNS.headNeutral);
  const [bubbleSnack, setBubbleSnack] = useState<string | null>(null);

  const breathAnim = useRef(new Animated.Value(0)).current;
  const tailAnim = useRef(new Animated.Value(0)).current;
  const touchScale = useRef(new Animated.Value(1)).current;
  const headBounce = useRef(new Animated.Value(0)).current;

  const isMounted = useRef(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const safeTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
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

  // Respiración pautada (2 s dentro / 2 s fuera = 15 rpm) y cola pendular.
  useEffect(() => {
    const swing = (value: Animated.Value, to: number, duration: number) =>
      Animated.timing(value, { toValue: to, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true });

    const breathLoop = Animated.loop(Animated.sequence([
      Animated.timing(breathAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(breathAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    const tailLoop = Animated.loop(Animated.sequence([
      swing(tailAnim, 1, 1600),
      swing(tailAnim, -1, 1600),
    ]));
    breathLoop.start();
    tailLoop.start();
    return () => { breathLoop.stop(); tailLoop.stop(); };
  }, [breathAnim, tailAnim]);

  // El antojo. `CRAVING_SNACK` llevaba desde el principio en el enum sin que
  // nada lo encendiera: la gata tenía un premio esperando y no lo pedía nunca.
  // La regla de cuándo hay antojo vive en `valeriaLuaMascot`, que es de donde
  // la lee también el aparato — la misma gata no puede tener hambre en la
  // tableta y no tenerla en el cristal.
  useEffect(() => {
    if (affect !== 'IDLE_SERENE' && affect !== 'CRAVING_SNACK') return;
    setAffect(luaCraves(inventory) ? 'CRAVING_SNACK' : 'IDLE_SERENE');
  }, [inventory, affect]);

  // Parpadeo en reposo. También con antojo: es la misma cara, esperando.
  useEffect(() => {
    if (affect !== 'IDLE_SERENE' && affect !== 'CRAVING_SNACK') return;
    const interval = setInterval(() => {
      if (!isMounted.current) return;
      setHeadRuns(PRECOMPILED_RUNS.headBlink);
      safeTimeout(() => setHeadRuns(PRECOMPILED_RUNS.headNeutral), 160);
    }, 4500);
    return () => clearInterval(interval);
  }, [affect]);

  const handlePat = async () => {
    Animated.sequence([
      Animated.spring(touchScale, { toValue: 1.08, useNativeDriver: true, speed: 40, bounciness: 8 }),
      Animated.spring(touchScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }),
    ]).start();
    Animated.sequence([
      Animated.timing(headBounce, { toValue: -2.5, duration: 120, useNativeDriver: true }),
      Animated.timing(headBounce, { toValue: 0, duration: 200, easing: Easing.bounce, useNativeDriver: true }),
    ]).start();

    setAffect('PURRING_LOVE');
    setHeadRuns(PRECOMPILED_RUNS.headLove);

    // Se pasa el inventario en mano: leer-sumar-guardar desde disco perdía
    // caricias cuando el niño toca varias veces seguidas.
    const updated = await recordPatInteraction(inventory);
    if (isMounted.current && onInventoryChange) onInventoryChange(updated);

    safeTimeout(() => {
      setAffect('IDLE_SERENE');
      setHeadRuns(PRECOMPILED_RUNS.headNeutral);
    }, 1800);
  };

  const handleFeed = async (snackId: string) => {
    setAffect('EATING_SNACK');
    setBubbleSnack(snackId);
    setHeadRuns(PRECOMPILED_RUNS.headEatOpen);

    const updated = await feedLuaSnack(snackId, inventory);
    if (isMounted.current && onInventoryChange) onInventoryChange(updated);

    safeTimeout(() => setHeadRuns(PRECOMPILED_RUNS.headLove), 620);
    safeTimeout(() => {
      setBubbleSnack(null);
      setAffect('IDLE_SERENE');
      setHeadRuns(PRECOMPILED_RUNS.headNeutral);
    }, 1500);
  };

  const translateYBody = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -1.4] });
  const translateYHead = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -0.8] });
  const rotateTail = tailAnim.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-7deg', '0deg', '7deg'] });

  const headItem = inventory.equipped.head ? getCollectibleById(inventory.equipped.head) : undefined;
  const neckItem = inventory.equipped.neck ? getCollectibleById(inventory.equipped.neck) : undefined;
  const headItemRuns = headItem ? PRECOMPILED_RUNS.itemsOnCat[headItem.id] : null;
  const neckItemRuns = neckItem ? PRECOMPILED_RUNS.itemsOnCat[neckItem.id] : null;

  const xp = game?.xp ?? 0;
  const level = levelFor(xp);
  const atMax = level >= LEVEL_COUNT;
  const streak = game ? liveStreak(game) : 0;

  const moodLabel = affect === 'PURRING_LOVE' ? t.hub.luaPurring
    : affect === 'EATING_SNACK' ? t.hub.luaEating
      : affect === 'CRAVING_SNACK' ? t.hub.luaCraving
        : t.hub.luaPatShort;

  // La burbuja del antojo reutiliza la del premio: es el mismo dibujo pensando
  // en lo mismo, y así no hay dos burbujas que mantener alineadas.
  const bubbleItem = bubbleSnack ?? (affect === 'CRAVING_SNACK' ? 'snack_fish' : null);

  // Una capa de la rejilla completa: se pinta en 0,0 y cae donde se dibujó.
  const grid = (runs: Run[], keyPrefix: string) => (
    <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${COLS} ${ROWS}`}>
      {runs.map((r) => (
        <Rect key={`${keyPrefix}-${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
      ))}
    </Svg>
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.petColumn}>
          <Pressable
            onPress={handlePat}
            accessibilityRole="button"
            accessibilityLabel={t.hub.luaPatA11y}
            accessibilityHint={t.hub.luaPatHintA11y}
          >
            <Animated.View
              style={[styles.avatarPlate, {
                width: plateWidth, height: plateHeight, transform: [{ scale: touchScale }],
              }]}
            >
              {bubbleItem && (
                <View style={styles.thoughtBubble}><PixelItemIcon id={bubbleItem} size={18} /></View>
              )}
              {affect === 'PURRING_LOVE' && (
                <View style={styles.loveBubble}><PixelAward glyph="heart" tier="teal" size={15} /></View>
              )}

              <View style={{ width: svgWidth, height: svgHeight }}>
                {/* Punta libre de la cola. La base va con el cuerpo: separarla
                    de ahí era lo que dejaba una columna transparente en el flanco. */}
                <Animated.View
                  style={[styles.layer, {
                    left: 26 * cell,
                    top: 24 * cell,
                    transformOrigin: '50% 100%',
                    transform: [{ rotate: rotateTail }, { translateY: translateYBody }],
                  }]}
                >
                  <Svg width={5 * cell} height={6 * cell} viewBox="0 0 5 6">
                    {PRECOMPILED_RUNS.tailTip.map((r) => (
                      <Rect key={`t-${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
                    ))}
                  </Svg>
                </Animated.View>

                <Animated.View
                  style={[styles.layer, { left: 0, top: 22 * cell, transform: [{ translateY: translateYBody }] }]}
                >
                  <Svg width={svgWidth} height={16 * cell} viewBox="0 0 32 16">
                    {PRECOMPILED_RUNS.bodyBase.map((r) => (
                      <Rect key={`b-${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
                    ))}
                  </Svg>
                </Animated.View>

                <Animated.View
                  style={[styles.layer, {
                    left: 0, top: 0,
                    transform: [{ translateY: translateYHead }, { translateY: headBounce }],
                  }]}
                >
                  <Svg width={svgWidth} height={22 * cell} viewBox="0 0 32 22">
                    {headRuns.map((r) => (
                      <Rect key={`h-${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w + 0.1} height={1.1} fill={r.fill} />
                    ))}
                  </Svg>
                </Animated.View>

                {neckItemRuns && (
                  <Animated.View
                    style={[styles.layer, { left: 0, top: 0, transform: [{ translateY: translateYBody }] }]}
                  >
                    {grid(neckItemRuns, 'neck')}
                  </Animated.View>
                )}

                {headItemRuns && (
                  <Animated.View
                    style={[styles.layer, {
                      left: 0, top: 0,
                      transform: [{ translateY: translateYHead }, { translateY: headBounce }],
                    }]}
                  >
                    {grid(headItemRuns, 'head-item')}
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          </Pressable>

          <Text style={[styles.mood, affect !== 'IDLE_SERENE' && styles.moodActive]} numberOfLines={1}>
            {moodLabel}
          </Text>
        </View>

        <View style={styles.progress}>
          <View style={styles.levelRow}>
            <Text style={styles.level} numberOfLines={1}>
              {t.awards.levelLine(level, t.hub.levelNameByIndex(level - 1))}
            </Text>
            <View style={styles.flamePlate}>
              <PixelAward glyph="flame" tier={streakTier(streak)} size={20} locked={streak === 0} />
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round((atMax ? 1 : levelProgress(xp)) * 100)}%` }]} />
          </View>
          <Text style={styles.toNext} numberOfLines={1}>
            {atMax ? t.awards.maxLevel : t.awards.xpToNext(xpToNext(xp))}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
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
        <Pressable
          onPress={onOpenAwards}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t.awards.a11yOpen}
        >
          <Text style={styles.awardsLink}>{`${t.awards.open} ›`}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V.color.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: V.color.borderActive,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: 'rgba(15, 23, 42, 0.13)', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1, shadowRadius: 20, elevation: 4,
  },

  topRow: { flexDirection: 'row', alignItems: 'center', gap: V.space.md },
  petColumn: { alignItems: 'center', gap: 4 },
  avatarPlate: {
    borderRadius: 18, backgroundColor: V.color.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  layer: { position: 'absolute' },
  mood: { fontSize: 10.5, fontWeight: V.font.bold, color: V.color.textSecondary },
  moodActive: { color: V.color.primaryDark, fontWeight: V.font.extrabold },

  thoughtBubble: {
    position: 'absolute', top: -8, right: -10, backgroundColor: '#fff',
    borderRadius: 12, padding: 4, borderWidth: 1, borderColor: V.color.primary,
    ...V.shadow.card, zIndex: 10,
  },
  loveBubble: {
    position: 'absolute', top: -8, left: -10, backgroundColor: '#fff0f4',
    borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#ef8296',
    ...V.shadow.card, zIndex: 10,
  },

  progress: { flex: 1, gap: 6 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  level: { flex: 1, fontSize: 15, lineHeight: 19, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  flamePlate: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff3ea', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
  },
  streakNum: { fontSize: 16, fontWeight: V.font.extrabold, color: '#c2571e', letterSpacing: -0.3 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#e3ecec', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: V.color.primary },
  // Texto secundario, no «muted»: sobre blanco el gris claro no llega al
  // contraste mínimo y es justo la línea que dice cuánto falta.
  toNext: { fontSize: 11.5, fontWeight: V.font.bold, color: V.color.textSecondary },

  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  snackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: V.color.primaryTint, borderRadius: 12,
    borderWidth: 1, borderColor: V.color.primary,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  snackTxt: { fontSize: 12, fontWeight: V.font.extrabold, color: V.color.primaryDark },
  awardsLink: { fontSize: 12.5, fontWeight: V.font.extrabold, color: V.color.primaryDark },
});

export default ValeriaCatInteractiveCard;

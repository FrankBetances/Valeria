// ============================================================================
// Valeria+ · Aventuras con Lúa · Juegos
//
// La cuarta sección de las 50 hojas, que faltaba. Cada juego se toca: no es una
// descripción de un juego, es el juego. El memorama voltea de verdad, el
// cazador de sonidos marca los aciertos y la secuencia se ordena.
//
// Al niño se le habla siempre con `speakToChild` sobre texto que está en el
// corpus; las consignas de los diez juegos entran por `luaVoiceLines`.
// ============================================================================
import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useT } from "../../i18n";
import { BlockIcon } from "../../ValeriaBlockIcons";
import { CatPixel } from "../../ValeriaCatPixel";
import { FichaVisual } from "../../ValeriaPictograms";
import { speakLuaToChild, speakLuaToChildSeq } from "../luaSpeech";
import { LUA_COLORS, LUA_RADII } from "../Theme/luaTheme";
import { LuaGame, LuaGameItem, LUA_GAMES_CATALOG } from "../index";
import { luaCompleteActivity } from "../luaActivityReward";

interface Props {
  navigation: any;
  route: { params: { gameId: string } };
}

/**
 * Baraja DETERMINISTA: Fisher-Yates con semilla fija en vez de Math.random, para
 * que el tablero no se recoloque solo en cada repintado con un niño a media
 * partida. Y de verdad baraja: con el reparto anterior las dos mitades salían en
 * el mismo orden y cada pareja caía en la misma columna, así que el memorama se
 * resolvía sin memoria ninguna.
 */
const pairDeck = (items: LuaGameItem[]): LuaGameItem[] => {
  const deck = [...items, ...items];
  let seed = 20260903;
  for (let i = deck.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const LuaGamePlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { gameId } = route.params || {};
  const { width } = useWindowDimensions();
  const game: LuaGame | undefined =
    LUA_GAMES_CATALOG.find((g) => g.id === gameId) || LUA_GAMES_CATALOG[0];

  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [marked, setMarked] = useState<Record<number, boolean>>({});
  const [ordered, setOrdered] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const deck = useMemo(() => (game?.kind === "memory" ? pairDeck(game.items) : []), [game]);

  // El tablero se reparte por el ancho real. Con un tamaño fijo, el memorama de
  // 8 tarjetas salía a dos columnas y cuatro filas de scroll en un móvil.
  const GAP = 8;
  const PAD = 16;
  const cols = game?.kind === "memory" ? 4 : 3;
  const cardW = Math.floor((width - PAD * 2 - GAP * (cols - 1)) / cols);
  const picSize = Math.max(34, Math.min(58, cardW - 26));
  // «Pandereta» no cabe a 14 pt en una tarjeta de 4 columnas y partía en
  // «Panderet / a». El cuerpo baja con la rejilla, no al revés.
  const labelSize = cols >= 4 ? 12 : 14;

  const handleFinish = useCallback(async () => {
    setFinished(true);
    await luaCompleteActivity(game?.items.length ?? 1);
  }, [game]);

  const say = (text: string) => { if (text) speakLuaToChild(text); };

  if (!game) return <View style={s.container} />;

  const tap = (idx: number, item: LuaGameItem) => {
    say(item.label);
    if (game.kind === "memory") { setRevealed((p) => ({ ...p, [idx]: true })); return; }
    if (game.kind === "sequence") {
      setOrdered((p) => (p.includes(idx) ? p : [...p, idx]));
      return;
    }
    setMarked((p) => ({ ...p, [idx]: !p[idx] }));
  };

  const cells = game.kind === "memory" ? deck : game.items;
  const rowGroups = game.groups && (game.kind === "odd_one_out" || game.kind === "sorting")
    ? game.groups
    : null;

  const renderCell = (item: LuaGameItem, idx: number) => {
    const hidden = game.kind === "memory" && !revealed[idx];
    const isMarked = !!marked[idx];
    const seqPos = game.kind === "sequence" ? ordered.indexOf(idx) : -1;
    return (
      <Pressable
        key={`${item.label}-${idx}`}
        onPress={() => tap(idx, item)}
        style={[s.card, { width: cardW, minHeight: cardW }, isMarked && s.cardMarked, seqPos >= 0 && s.cardOrdered]}
        accessibilityRole="button"
        accessibilityLabel={item.label || t.luaHub.gameBlankSlot} // i18n-exempt: catálogo clínico dinámico
      >
        {hidden ? (
          <View style={[s.cardBack, { width: picSize, height: picSize }]}><CatPixel size={picSize} /></View>
        ) : (
          <>
            {item.pic ? (
              <FichaVisual word={item.label} emoji="" pic={item.pic} size={picSize} />
            ) : (
              <View style={[s.blankSlot, { width: picSize, height: picSize }]} />
            )}
            <Text style={[s.cardLabel, { fontSize: labelSize }]} numberOfLines={2}>
              {item.template ?? item.label}
            </Text>
          </>
        )}
        {seqPos >= 0 && (
          <View style={s.seqBadge}><Text style={s.seqBadgeTxt}>{seqPos + 1}</Text></View>
        )}
        {isMarked && (
          <View style={s.markBadge}>
            <BlockIcon name="check" color={LUA_COLORS.mintDark} size={18} />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t.common.back}
          hitSlop={12}
        >
          <Text style={s.backTxt}>{`‹ ${t.common.back}`}</Text>
        </Pressable>
        <Text style={s.topTitle} numberOfLines={1}>{game.title}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.instructionCard}>
          <CatPixel size={48} />
          <Text style={s.instructionTxt}>{game.instructions}</Text>
          <Pressable
            onPress={() => say(game.instructions)}
            style={s.speakBtn}
            accessibilityRole="button"
            accessibilityLabel={t.luaHub.evalPlayAudio}
          >
            <BlockIcon name="speaker" color={LUA_COLORS.primary} size={22} />
          </Pressable>
        </View>

        {rowGroups ? (
          rowGroups.map((grp) => (
            <View key={grp} style={s.groupBlock}>
              <Text style={s.groupHeading}>{grp}</Text>
              <View style={s.grid}>
                {cells.map((it, i) => (it.group === grp ? renderCell(it, i) : null))}
              </View>
            </View>
          ))
        ) : (
          <View style={s.grid}>{cells.map(renderCell)}</View>
        )}

        <View style={s.finishCard}>
          {finished ? (
            <>
              <CatPixel size={64} />
              <Text style={s.finishDoneTxt}>{t.luaHub.activityDone}</Text>
            </>
          ) : (
            <Pressable
              style={s.finishBtn}
              onPress={handleFinish}
              accessibilityRole="button"
              accessibilityLabel={t.luaHub.activityFinish}
            >
              <Text style={s.finishBtnTxt}>{t.luaHub.activityFinish}</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: LUA_COLORS.background },
  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: LUA_COLORS.divider,
    backgroundColor: LUA_COLORS.surface,
  },
  backBtn: {
    minHeight: 44, paddingHorizontal: 12, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: LUA_COLORS.surfaceSubtle, marginRight: 12,
  },
  backTxt: { fontSize: 15, color: LUA_COLORS.textPrimary, fontWeight: "700" },
  topTitle: { flex: 1, fontSize: 17, fontWeight: "800", color: LUA_COLORS.textPrimary },
  scroll: { padding: 16 },
  instructionCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: LUA_RADII.lg,
    backgroundColor: LUA_COLORS.primaryLight, marginBottom: 16,
  },
  instructionTxt: { flex: 1, fontSize: 15, lineHeight: 21, color: LUA_COLORS.textPrimary },
  speakBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: LUA_COLORS.surface,
  },
  groupBlock: { marginBottom: 18 },
  groupHeading: {
    fontSize: 14, fontWeight: "800", marginBottom: 8,
    color: LUA_COLORS.textSecondary,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  // 116 dp de lado: muy por encima del objetivo táctil mínimo, porque quien
  // juega puede tener dos años.
  card: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 10, paddingHorizontal: 6,
    borderRadius: LUA_RADII.lg, borderWidth: 2,
    borderColor: LUA_COLORS.border, backgroundColor: LUA_COLORS.surface,
  },
  cardMarked: { borderColor: LUA_COLORS.mintDark, backgroundColor: LUA_COLORS.mintLight },
  cardOrdered: { borderColor: LUA_COLORS.primary, backgroundColor: LUA_COLORS.primaryLight },
  cardBack: { alignItems: "center", justifyContent: "center" },
  cardLabel: {
    marginTop: 6, fontSize: 14, fontWeight: "700",
    color: LUA_COLORS.textPrimary, textAlign: "center", letterSpacing: 0.5,
  },
  blankSlot: {
    borderRadius: 10,
    borderWidth: 1, borderStyle: "dashed", borderColor: LUA_COLORS.borderStrong,
  },
  seqBadge: {
    position: "absolute", top: 6, left: 6,
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    backgroundColor: LUA_COLORS.primary,
  },
  seqBadgeTxt: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  markBadge: { position: "absolute", top: 6, right: 6 },
  finishCard: { marginTop: 16, alignItems: "center", paddingVertical: 18 },
  finishBtn: {
    minHeight: 56, paddingHorizontal: 28, borderRadius: LUA_RADII.lg,
    alignItems: "center", justifyContent: "center",
    backgroundColor: LUA_COLORS.primary,
  },
  finishBtnTxt: { color: LUA_COLORS.textOnPrimary, fontSize: 17, fontWeight: "800" },
  finishDoneTxt: {
    marginTop: 8, fontSize: 17, fontWeight: "800",
    color: LUA_COLORS.mintDark, textAlign: "center",
  },
});

export default LuaGamePlayerScreen;

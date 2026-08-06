// ============================================================================
// Valeria+ · Hub de terapias en cuadrícula (v11) — Sprint 3.1
//
// Responde al feedback del piloto: «el uso se hace muy engorroso y hay mucho
// texto». Frente al hub de la v10.2, aquí:
//
//   · Las tarjetas NO llevan subtítulo. Los ~718 caracteres de prosa que había
//     repartidos entre las siete tarjetas se han reubicado al `refCard` de cada
//     bloque (ValeriaBlockListScreen), donde se leen justo antes de usarlo.
//   · La cuadrícula de 2 columnas sustituye a la lista vertical: 7 tarjetas de
//     ~110 px pasan a 4 filas de ~132 px.
//   · Recordatorios, calidad de voz y acceso profesional ya no viven aquí:
//     están en la pestaña Ajustes, a un toque desde cualquier punto.
//
// Lo que NO cambia, y es deliberado:
//   · La app no ordena, recomienda ni autoselecciona bloques. El juez clínico
//     sigue siendo el adulto; un "hub inteligente" sería un cambio de clase
//     regulatoria, no de interfaz.
//   · El consentimiento del módulo TEA sigue siendo puerta obligatoria antes
//     de la primera entrada, con el mismo texto y la misma persistencia.
//   · Si la ficha activa indica audífono o implante, el Test de Ling sigue
//     yendo antes del player (esa regla vive en la lista y en el player).
// ============================================================================
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { V, STORAGE_KEYS } from './valeriaTheme';
import { BLOCKS, BLOCK_ORDER, BlockKey } from './valeriaBlocks';
import { AR_META } from './valeriaExerciseMeta';
import { ValeriaBlockTile } from './ValeriaBlockTile';
import { loadGame, liveStreak, levelFor } from './valeriaGamification';
import { isArAvailable } from './valeriaArBridge';
import { useT, UiStrings } from './i18n';

// Sonda de una sola vez por arranque: el host nativo de RA está o no está, y
// eso no cambia a mitad de sesión. FUERA del componente a propósito — en la
// v11 este hub se monta y desmonta más veces (es una pestaña), y preguntarlo
// en cada montaje sería trabajo repetido en el arranque.
const AR_ON = isArAvailable();

interface Tile {
  key: string;
  icon: string;
  title: string;
  /** La descripción retirada de la tarjeta: sin texto visible, el lector de
   *  pantalla es la única vía a ella. Por eso el hint no es decorativo. */
  hint: string;
  a11y: string;
  bg: string;
  fg: string;
  badge?: string;
  onPress: () => void;
}

export const ValeriaHubV11Screen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const [counts, setCounts] = useState<Record<BlockKey, number>>({
    audicion: BLOCKS.audicion.meta.length,
    lenguaje: BLOCKS.lenguaje.meta.length,
    tea: BLOCKS.tea.meta.length,
    dislexia: BLOCKS.dislexia.meta.length,
  });
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [teaConsentOk, setTeaConsentOk] = useState(false);
  const [teaConsentOpen, setTeaConsentOpen] = useState(false);

  // Los badges muestran lo prescrito. Se releen AL RECIBIR EL FOCO, no solo al
  // montar: el adulto vuelve aquí después de cambiar la prescripción en
  // BlockList y un badge obsoleto contradiría lo que acaba de guardar.
  const refresh = useCallback(async () => {
    try {
      const next = {} as Record<BlockKey, number>;
      for (const key of BLOCK_ORDER) {
        const b = BLOCKS[key];
        const raw = await AsyncStorage.getItem(b.storageKey);
        const p = raw ? JSON.parse(raw) : null;
        next[key] = Array.isArray(p) && p.length === b.meta.length
          ? p.filter(Boolean).length
          : b.meta.length; // sin prescripción guardada = todo activo
      }
      setCounts(next);
      setTeaConsentOk((await AsyncStorage.getItem(STORAGE_KEYS.teaConsent)) === 'ok');
    } catch (e) { /* noop */ }
    try {
      const g = await loadGame();
      setStreak(liveStreak(g));
      setLevel(levelFor(g.xp));
    } catch (e) { /* noop */ }
  }, []);

  useEffect(() => {
    void refresh();
    return navigation.addListener('focus', () => { void refresh(); });
  }, [navigation, refresh]);

  const openBlock = (key: BlockKey) => navigation.navigate('BlockList', { block: key });

  // Puerta del módulo TEA: el encuadre del Quiebre Pragmático se acepta UNA vez
  // y queda persistido. Idéntico a la v10.2.
  const openTea = () => {
    if (!teaConsentOk) { setTeaConsentOpen(true); return; }
    openBlock('tea');
  };
  const acceptTeaConsent = async () => {
    try { await AsyncStorage.setItem(STORAGE_KEYS.teaConsent, 'ok'); } catch (e) { /* noop */ }
    setTeaConsentOk(true);
    setTeaConsentOpen(false);
    openBlock('tea');
  };

  const badgeFor = (key: BlockKey) => `${counts[key]}/${BLOCKS[key].meta.length}`;

  // [Sprint 4.1] El badge NO se anuncia solo: al poner `accessibilityLabel` en
  // el Pressable, el árbol de accesibilidad deja de leer los Text hijos. Sin
  // esto, quien usa lector de pantalla oiría "Abrir terapias de audición" y
  // perdería el dato de cuántas hay prescritas —justo la información que la
  // v11 dejó como único texto de la tarjeta—. Se compone con claves i18n que
  // ya existían (`therapiesBadge`, `activeBadge`), sin inventar cadenas nuevas.
  const a11yFor = (key: BlockKey, base: string) =>
    `${base}. ${t.hub.therapiesBadge(BLOCKS[key].meta.length)}, ${t.hub.activeBadge(counts[key])}.`;

  const tiles: Tile[] = [
    {
      key: 'pairs', icon: '🗣️', title: t.hub.pairsTitle, hint: t.hub.pairsSub, a11y: t.hub.pairsA11y,
      bg: '#ede4fc', fg: '#7c4fd0', onPress: () => navigation.navigate('MinimalPairs'),
    },
    {
      key: 'semantic', icon: '🧩', title: t.hub.semanticTitle, hint: t.hub.semanticSub, a11y: t.hub.semanticA11y,
      bg: '#d6f5f2', fg: V.color.primaryDark, onPress: () => navigation.navigate('SemanticExpansion'),
    },
    {
      key: 'audicion', icon: BLOCKS.audicion.icon, title: t.hub.hearingTitle, hint: t.hub.hearingSub, a11y: a11yFor('audicion', t.hub.hearingA11y),
      bg: BLOCKS.audicion.accentBg, fg: BLOCKS.audicion.accentFg, badge: badgeFor('audicion'), onPress: () => openBlock('audicion'),
    },
    {
      key: 'lenguaje', icon: BLOCKS.lenguaje.icon, title: t.hub.languageTitle, hint: t.hub.languageSub, a11y: a11yFor('lenguaje', t.hub.languageA11y),
      bg: BLOCKS.lenguaje.accentBg, fg: BLOCKS.lenguaje.accentFg, badge: badgeFor('lenguaje'), onPress: () => openBlock('lenguaje'),
    },
    {
      key: 'tea', icon: BLOCKS.tea.icon, title: t.hub.autismTitle, hint: t.hub.autismSub, a11y: a11yFor('tea', t.hub.autismA11y),
      bg: BLOCKS.tea.accentBg, fg: BLOCKS.tea.accentFg, badge: badgeFor('tea'), onPress: openTea,
    },
    {
      key: 'dislexia', icon: BLOCKS.dislexia.icon, title: t.hub.dyslexiaTitle, hint: t.hub.dyslexiaSub, a11y: a11yFor('dislexia', t.hub.dyslexiaA11y),
      bg: BLOCKS.dislexia.accentBg, fg: BLOCKS.dislexia.accentFg, badge: badgeFor('dislexia'), onPress: () => openBlock('dislexia'),
    },
    // Séptimo bloque · RA. Si no hay host nativo de cámara + escena 3D, la
    // tarjeta NO se renderiza: el bloque no existe para el usuario, en lugar
    // de existir y fallar al tocarlo.
    ...(AR_ON ? [{
      key: 'ar', icon: '🎯', title: t.hub.arTitle, hint: t.hub.arSub, a11y: t.hub.arA11y(AR_META.length),
      bg: '#e6f9f8', fg: V.color.primaryDark, onPress: () => navigation.navigate('ArLauncher'),
    } as Tile] : []),
  ];

  // Con un número impar de tarjetas, la última quedaría estirada a todo el
  // ancho por el `flex: 1`. Una celda fantasma la deja en su columna.
  const grid: (Tile | null)[] = tiles.length % 2 ? [...tiles, null] : tiles;

  return (
    <View style={s.flex}>
      <View style={s.header}>
        {/* Cabecera compacta: marca y estado de juego en UNA fila. En la v10.2
            eran cuatro elementos apilados (logo, título, subtítulo y fila de
            chips) que se comían ~150 px antes del primer bloque. */}
        <View style={s.topRow}>
          <Pressable
            onPress={() => navigation.getParent()?.goBack()}
            style={s.backPill} hitSlop={8}
            accessibilityRole="button" accessibilityLabel={t.common.back}
          >
            <Text style={s.backPillTxt}>{`‹ ${t.common.back}`}</Text>
          </Pressable>
          <View style={s.chips}>
            <View style={s.gameChip}><Text style={s.gameChipTxt}>{`🔥 ${streak}`}</Text></View>
            <View style={s.gameChip}><Text style={s.gameChipTxt}>{`🏅 ${level}`}</Text></View>
          </View>
        </View>
        <Text style={s.headerTitle}>{t.hub.title}</Text>
      </View>

      <FlatList
        data={grid}
        keyExtractor={(item, i) => item?.key ?? `ghost-${i}`}
        numColumns={2}
        columnWrapperStyle={s.col}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (item ? (
          <ValeriaBlockTile
            icon={item.icon}
            title={item.title}
            accentBg={item.bg}
            accentFg={item.fg}
            badge={item.badge}
            accessibilityLabel={item.a11y}
            accessibilityHint={item.hint}
            onPress={item.onPress}
          />
        ) : <View style={s.ghost} />)}
      />

      {/* Consentimiento informado del módulo TEA (Quiebre Pragmático). Mismo
          texto, misma persistencia y misma obligatoriedad que en la v10.2. */}
      <TeaConsentModal
        open={teaConsentOpen}
        t={t}
        onAccept={acceptTeaConsent}
        onDismiss={() => setTeaConsentOpen(false)}
      />
    </View>
  );
};

const TeaConsentModal: React.FC<{
  open: boolean; t: UiStrings; onAccept: () => void; onDismiss: () => void;
}> = ({ open, t, onAccept, onDismiss }) => (
  <Modal visible={open} transparent animationType="fade" onRequestClose={onDismiss}>
    <View style={s.consentOverlay}>
      <View style={s.consentCard}>
        <Text style={s.consentIcon}>🧠</Text>
        <Text style={s.consentTitle}>{t.hub.teaConsentTitle}</Text>
        <Text style={s.consentTxt}>
          {t.hub.teaConsentBody1}
          <Text style={s.consentStrong}>{t.hub.teaConsentBreak}</Text>
          {t.hub.teaConsentBody2}
        </Text>
        <View style={s.consentList}>
          <Text style={s.consentItem}>{t.hub.teaConsentItem1}</Text>
          <Text style={s.consentItem}>{t.hub.teaConsentItem2}</Text>
          <Text style={s.consentItem}>{t.hub.teaConsentItem3}</Text>
          <Text style={s.consentItem}>{t.hub.teaConsentItem4}</Text>
        </View>
        <Pressable onPress={onAccept} style={s.consentAccept}
          accessibilityRole="button" accessibilityLabel={t.hub.teaConsentAcceptA11y}>
          <Text style={s.consentAcceptTxt}>{t.hub.teaConsentAccept}</Text>
        </Pressable>
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel={t.hub.teaConsentLater}>
          <Text style={s.consentCancel}>{t.hub.teaConsentLater}</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: {
    backgroundColor: V.color.primary, paddingTop: V.space.md, paddingHorizontal: V.space.xl,
    paddingBottom: V.space.lg, borderBottomLeftRadius: 26, borderBottomRightRadius: 26,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: V.space.sm },
  backPill: {
    backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)',
    borderRadius: 11, paddingHorizontal: 11, paddingVertical: 5,
  },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: V.font.extrabold },
  chips: { flexDirection: 'row', gap: V.space.sm },
  gameChip: {
    backgroundColor: 'rgba(255,255,255,.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,.32)',
    borderRadius: 11, paddingHorizontal: 10, paddingVertical: 5,
  },
  gameChipTxt: { color: '#fff', fontSize: 12, fontWeight: V.font.extrabold },
  headerTitle: { ...V.type.display, color: '#fff', fontWeight: V.font.extrabold, letterSpacing: -0.4 },

  grid: { padding: V.space.lg, paddingBottom: V.space.xxl },
  col: { gap: V.space.md, marginBottom: V.space.md },
  ghost: { flex: 1 },

  consentOverlay: { flex: 1, backgroundColor: 'rgba(11,18,32,.72)', alignItems: 'center', justifyContent: 'center', padding: V.space.xl },
  consentCard: { width: '100%', maxWidth: 380, backgroundColor: '#fff', borderRadius: 24, padding: 22 },
  consentIcon: { fontSize: 34, textAlign: 'center' },
  consentTitle: { fontSize: 19, fontWeight: V.font.extrabold, color: V.color.textPrimary, textAlign: 'center', marginTop: V.space.sm },
  consentTxt: { ...V.type.body, lineHeight: 19, fontWeight: V.font.semibold, color: V.color.textSecondary, marginTop: V.space.sm, textAlign: 'center' },
  consentStrong: { fontWeight: V.font.extrabold },
  consentList: { marginTop: V.space.md, backgroundColor: V.color.pageBg, borderRadius: 14, padding: 13, gap: V.space.sm },
  consentItem: { fontSize: 12.5, fontWeight: V.font.bold, color: V.color.textPrimary, lineHeight: 17 },
  consentAccept: { marginTop: V.space.lg, backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', ...V.shadow.button },
  consentAcceptTxt: { color: '#fff', ...V.type.title, fontWeight: V.font.extrabold },
  consentCancel: { textAlign: 'center', color: V.color.textMuted, ...V.type.body, fontWeight: V.font.extrabold, marginTop: V.space.md },
});

export default ValeriaHubV11Screen;

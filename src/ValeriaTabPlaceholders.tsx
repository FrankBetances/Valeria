// ============================================================================
// Valeria+ · Placeholders de las pestañas — Sprint 2.4 (ANDAMIAJE TEMPORAL)
//
// Estas tres pantallas existen para que el esqueleto de navegación se pueda
// recorrer y medir antes de mover contenido real. El Sprint 3 las sustituye:
//   · TherapiesPlaceholder → ValeriaHubV11Screen  (3.1)
//   · SettingsPlaceholder  → ValeriaSettingsScreen (3.3)
//   · La pestaña Academy ya apunta al screen REAL desde el Sprint 2.
//
// TherapiesPlaceholder hace además de banco de pruebas del Sprint 1.3: pinta
// `ValeriaBlockTile` en cuadrícula de 2 columnas, con los títulos reales de
// i18n, para verlo en iOS y Android a tamaño real y en los dos idiomas. Los
// badges son valores de muestra: la prescripción real se conecta en 3.1.
// ============================================================================
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { V } from './valeriaTheme';
import { ValeriaBlockTile } from './ValeriaBlockTile';
import { useT, UiStrings } from './i18n';

// Los mismos pares de acento que ya usaba cada `blockCard` del hub clásico:
// la identidad de marca no cambia en la evolución, solo la disposición.
const DEMO_TILES = (t: UiStrings) => [
  { key: 'pairs', icon: '🗣️', title: t.hub.pairsTitle, bg: '#ede4fc', fg: '#7c4fd0', hint: t.hub.pairsSub },
  { key: 'semantic', icon: '🧩', title: t.hub.semanticTitle, bg: '#d6f5f2', fg: V.color.primaryDark, hint: t.hub.semanticSub },
  { key: 'hearing', icon: '👂', title: t.hub.hearingTitle, bg: '#e0edff', fg: '#3b6fd4', hint: t.hub.hearingSub, badge: '12/18' },
  { key: 'language', icon: '💬', title: t.hub.languageTitle, bg: '#fff1dc', fg: '#d98a1f', hint: t.hub.languageSub, badge: '5/7' },
  { key: 'autism', icon: '🧠', title: t.hub.autismTitle, bg: '#fdeef2', fg: '#c2477e', hint: t.hub.autismSub, badge: '6/6' },
  { key: 'dyslexia', icon: '📖', title: t.hub.dyslexiaTitle, bg: '#f3e8fd', fg: '#8b5cf6', hint: t.hub.dyslexiaSub, badge: '4/6' },
  { key: 'ar', icon: '🎯', title: t.hub.arTitle, bg: '#e6f9f8', fg: V.color.primaryDark, hint: t.hub.arSub },
];

const Scaffold: React.FC<{ title: string; note: string; children?: React.ReactNode }> = ({ title, note, children }) => (
  <View style={s.flex}>
    <View style={s.header}>
      <Text style={s.logo}>valeria+</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.note}>{note}</Text>
    </View>
    {children}
  </View>
);

export const TherapiesPlaceholder: React.FC = () => {
  const t = useT();
  const data = DEMO_TILES(t);
  return (
    <Scaffold title={t.tabs.therapies} note="Sprint 2 · andamiaje. El hub real llega en el Sprint 3.1.">
      <FlatList
        data={data}
        keyExtractor={(it) => it.key}
        numColumns={2}
        columnWrapperStyle={s.col}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <ValeriaBlockTile
            icon={item.icon}
            title={item.title}
            accentBg={item.bg}
            accentFg={item.fg}
            badge={item.badge}
            // El hint carga la descripción que se ha quitado de la tarjeta:
            // en el grid, el lector de pantalla es la única vía a ese texto.
            accessibilityLabel={item.title}
            accessibilityHint={item.hint}
            onPress={() => { /* Sprint 3.1: navega a BlockList */ }}
          />
        )}
      />
    </Scaffold>
  );
};

export const SettingsPlaceholder: React.FC = () => {
  const t = useT();
  return (
    <Scaffold title={t.tabs.settings} note="Sprint 3.3: recordatorios, calidad de voz, idioma y acceso profesional." />
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  header: {
    backgroundColor: V.color.primary,
    paddingTop: V.space.lg,
    paddingHorizontal: V.space.xl,
    paddingBottom: V.space.lg,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  logo: { color: '#fff', fontWeight: V.font.extrabold, fontSize: 13, letterSpacing: 1, marginBottom: V.space.xs },
  title: { ...V.type.display, color: '#fff', fontWeight: V.font.extrabold, letterSpacing: -0.4 },
  note: { ...V.type.body, color: 'rgba(255,255,255,.9)', fontWeight: V.font.semibold, marginTop: V.space.xs },
  grid: { padding: V.space.lg, paddingBottom: V.space.xxl },
  col: { gap: V.space.md, marginBottom: V.space.md },
});

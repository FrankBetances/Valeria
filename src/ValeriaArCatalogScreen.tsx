// Realidad Aumentada · catálogo por sets (docs/PENDIENTE-REFACTORIZACION-AR.md,
// 8/11/2026). Sustituye al menú de AR-1…AR-6. Tres modalidades: Solo Lúa,
// cada set por su cuenta y cada set con Lúa. Lo que abre la cámara pasa por el
// lanzador de siempre (consentimiento, aptitud); lo demás se juega con el botón
// del adulto hasta que la cámara reconozca las piezas.
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useT } from './i18n';
import { ScreenHeader } from './ui/ScreenHeader';
import { ListRow } from './ui/ListRow';
import { V } from './valeriaTheme';
import { getUiLang } from './valeriaUiLang';
import type { BlockIconName } from './ValeriaBlockIcons';
import { FONT } from './ui/fonts';
import { STEAM_WORLDS } from './steam/worlds';
import { AR_TAP_ACTIVITIES } from './steam/arActivities';
import type { SteamArMode, SteamWorldId } from './steam/types';

const WORLD_ICON: Record<SteamWorldId, BlockIconName> = {
  S0: 'world_kit', S1: 'world_path', S2: 'world_sound', S3: 'world_ramp',
  S4: 'world_wind', S5: 'world_bridge', S6: 'world_garden',
};

/** S0…S6 y S8…S11, en orden de número. */
const SET_ORDER = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S8', 'S9', 'S10', 'S11'] as const;

/** Total de actividades del catálogo: lo usa la tarjeta del hub. */
export const AR_CATALOG_COUNT = AR_TAP_ACTIVITIES.filter((x) => x.group === 'LUA').length
  + SET_ORDER.length * 2;

export const ValeriaArCatalogScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const lang = getUiLang();
  let row = 0;

  const setRows = (mode: SteamArMode) => SET_ORDER.map((id) => {
    const world = STEAM_WORLDS.find((w) => w.id === id);
    const tap = AR_TAP_ACTIVITIES.find((x) => x.id === id);
    const title = world ? world.title[lang] : tap!.title[lang];
    const sub = world ? `${t.steam.worldMeta(world.challenges.length)}\n${t.ar.catTap}` : `${tap!.summary[lang]}\n${t.ar.catTap} · ${t.steam.luaSoloAges(tap!.ages)}`;
    return (
      <ListRow key={`${mode}-${id}`} index={row++} icon={world ? WORLD_ICON[world.id] : 'game'}
        title={`${id} · ${title}`} subtitle={sub}
        accessibilityLabel={t.ar.catRowA11y(title)}
        onPress={() => (world
          ? navigation.navigate('SteamWorld', { worldId: world.id, mode })
          : navigation.navigate('ArActivity', { id, mode }))} />
    );
  });

  return (
    <View style={s.root}>
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.steam.back}
        icon="ar" title={t.hub.arTitle} subtitle={t.ar.catSub} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.section, { marginTop: 0 }]}>{t.ar.catLuaSolo}</Text>
        {/* Las dos actividades de cámara FRONTAL (L01 y L07) ya no se ofrecen aquí
            (Frank, 10/11/2026): la RA se juega con la cámara trasera y los sets, y su
            Prueba de Aptitud cerraba el paso en teléfonos capaces. El código sigue. */}
        {AR_TAP_ACTIVITIES.filter((x) => x.group === 'LUA').map((act) => (
          <ListRow key={act.id} index={row++} icon="lua"
            title={act.title[lang]}
            subtitle={`${act.summary[lang]}\n${t.ar.catTap} · ${t.steam.luaSoloAges(act.ages)}`}
            accessibilityLabel={t.ar.catRowA11y(act.title[lang])}
            onPress={() => navigation.navigate('ArActivity', { id: act.id })} />
        ))}

        <Text style={s.section}>{t.ar.catSets}</Text>
        {setRows('SET_SOLO')}

        <Text style={s.section}>{t.ar.catSetsLua}</Text>
        {setRows('SET_WITH_LUA')}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: V.color.pageBg },
  scroll: { padding: V.space.lg, paddingBottom: 48 },
  section: { fontFamily: FONT.bodyBlack, fontSize: 12, color: V.color.textSecondary, letterSpacing: 0.6, marginTop: V.space.lg, marginBottom: V.space.sm },
});

export default ValeriaArCatalogScreen;

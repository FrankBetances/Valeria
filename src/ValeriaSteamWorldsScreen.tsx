// Construye con Lúa · los siete mundos STEAM (plan §1 capa 1 y capa 3, §4 R5).
// Se entra desde una sola tarjeta de la rejilla de ejercicios: los bloques de
// siempre no se desplazan (CLAUDE.md, regla S4). Aquí viven también el perfil
// de adaptación —lo cambia el adulto con PIN— y la recomendación que se deriva.
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Badge } from './components/ui/badge';
import { ListRow } from './ui/ListRow';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog';
import { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
import { Text } from './components/ui/text';
import { useT } from './i18n';
import { ScreenHeader } from './ui/ScreenHeader';
import { V } from './valeriaTheme';
import { getUiLang } from './valeriaUiLang';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import { ProPinModal } from './ValeriaProPin';
import { steamScreenStyles as base } from './ValeriaSteamWorldScreen';
import { STEAM_WORLDS } from './steam/worlds';
import { LUA_SOLO_ACTIVITIES } from './steam/luaSolo';
import { ADAPTATION_PROFILES, adjustmentsFor, loadAdaptationProfile, saveAdaptationProfile } from './steam/profiles';
import type { AdaptationProfileId, SteamWorldId } from './steam/types';
import { FONT } from './ui/fonts';

const WORLD_ICON: Record<SteamWorldId, BlockIconName> = {
  S0: 'world_kit', S1: 'world_path', S2: 'world_sound', S3: 'world_ramp',
  S4: 'world_wind', S5: 'world_bridge', S6: 'world_garden',
};

export const ValeriaSteamWorldsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const lang = getUiLang();
  const [profile, setProfile] = useState<AdaptationProfileId | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const read = () => { void loadAdaptationProfile().then(setProfile); };
    read();
    return navigation.addListener('focus', read);
  }, [navigation]);

  const recommended = adjustmentsFor(profile).recommendedWorlds;
  const profileName = profile ? t.steam.profiles[profile].name : t.steam.profileNone;
  const choose = (next: AdaptationProfileId | null) => {
    setProfile(next);
    setSheetOpen(false);
    void saveAdaptationProfile(next);
  };

  return (
    <View style={base.root}>
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.steam.back}
        kicker={t.steam.worldsKicker} icon="world_path" title={t.steam.hubTileTitle} subtitle={t.steam.worldsNote} />

      <ScrollView contentContainerStyle={base.scroll} showsVerticalScrollIndicator={false}>
        {STEAM_WORLDS.map((w) => {
          const title = w.title[lang];
          const isRec = recommended.includes(w.id);
          return (
            <ListRow key={w.id}
              icon={WORLD_ICON[w.id]}
              accent={isRec ? '#9a5f10' : V.color.primaryDark}
              tint={isRec ? '#fff1dc' : V.color.primaryLight}
              title={title}
              subtitle={isRec ? `${t.steam.worldMeta(w.challenges.length)} · ${t.steam.recommended}` : t.steam.worldMeta(w.challenges.length)}
              onPress={() => navigation.navigate('SteamWorld', { worldId: w.id })}
              accessibilityLabel={t.steam.worldA11y(title)}
              accessibilityHint={t.steam.worldHint} />
          );
        })}

        <ListRow icon="lua"
          title={t.steam.luaSoloTile}
          subtitle={t.steam.luaSoloTileMeta(LUA_SOLO_ACTIVITIES.length)}
          onPress={() => navigation.navigate('SteamLuaSolo')}
          accessibilityLabel={t.steam.luaSoloTileA11y} />

        {/* Perfil de adaptación: ajuste del profesional (PIN), al final. */}
        <View style={{ height: 8 }} />
        <ListRow icon="lock" accent="#5f6b6b" tint="#eef0ef"
          title={t.steam.profileTitle(profileName)}
          onPress={() => setPinOpen(true)}
          accessibilityLabel={t.steam.profileA11y(profileName)} />
      </ScrollView>

      {/* Selector de perfil: Dialog + RadioGroup de React Native Reusables. */}
      <Dialog open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogContent closeLabel={t.common.close} className="max-h-[90%]">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">{t.steam.profileSheetTitle}</DialogTitle>
            <DialogDescription className="text-sm font-semibold leading-5">{t.steam.profileSheetBody}</DialogDescription>
          </DialogHeader>
          <ScrollView showsVerticalScrollIndicator={false}>
            <RadioGroup value={profile ?? 'none'} onValueChange={(v) => choose(v === 'none' ? null : (v as AdaptationProfileId))}>
              {([null, ...ADAPTATION_PROFILES] as (AdaptationProfileId | null)[]).map((id) => {
                const value = id ?? 'none';
                const name = id ? t.steam.profiles[id].name : t.steam.profileNone;
                const on = id === profile;
                return (
                  <Pressable key={value} onPress={() => choose(id)} accessibilityRole="radio"
                    accessibilityState={{ selected: on }} accessibilityLabel={t.steam.profileOptionA11y(name)}
                    className={`flex-row items-start gap-3 rounded-xl border px-3.5 py-3 ${on ? 'border-ring bg-secondary' : 'border-border'}`}>
                    <RadioGroupItem value={value} aria-labelledby={`perfil-${value}`} className="mt-0.5 size-5" />
                    <View className="min-w-0 flex-1">
                      <Text nativeID={`perfil-${value}`} className={`text-[15px] ${on ? 'text-secondary-foreground font-extrabold' : 'font-bold'}`}>{name}</Text>
                      {id && <Text className="text-muted-foreground mt-0.5 text-xs font-semibold leading-4">{t.steam.profiles[id].note}</Text>}
                    </View>
                  </Pressable>
                );
              })}
            </RadioGroup>
          </ScrollView>
        </DialogContent>
      </Dialog>

      <ProPinModal open={pinOpen} onClose={() => setPinOpen(false)}
        onUnlock={() => { setPinOpen(false); setSheetOpen(true); }}
        subtitle={t.steam.profilePinSubtitle} />
    </View>
  );
};



export default ValeriaSteamWorldsScreen;

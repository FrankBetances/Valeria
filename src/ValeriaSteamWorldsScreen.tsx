// Construye con Lúa · los siete mundos STEAM (plan §1 capa 1 y capa 3, §4 R5).
// Se entra desde una sola tarjeta de la rejilla de ejercicios: los bloques de
// siempre no se desplazan (CLAUDE.md, regla S4). Aquí viven también el perfil
// de adaptación —lo cambia el adulto con PIN— y la recomendación que se deriva.
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Badge } from './components/ui/badge';
import { Card } from 'heroui-native';
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
        {/* Perfil de adaptación: Card de React Native Reusables, pulsable. */}
        <Pressable onPress={() => setPinOpen(true)} accessibilityRole="button" accessibilityLabel={t.steam.profileA11y(profileName)}>
          <Card className="bg-secondary border-input mb-4 flex-row items-center gap-3 px-4 py-3.5">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-white"><BlockIcon name="lock" color={V.color.primaryDark} size={22} /></View>
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-extrabold">{t.steam.profileTitle(profileName)}</Text>
            </View>
            <Text className="text-muted-foreground text-2xl font-extrabold">›</Text>
          </Card>
        </Pressable>

        {/* Los siete mundos: Card + Badge de React Native Reusables. */}
        {STEAM_WORLDS.map((w) => {
          const title = w.title[lang];
          const isRec = recommended.includes(w.id);
          return (
            <Pressable key={w.id} onPress={() => navigation.navigate('SteamWorld', { worldId: w.id })}
              accessibilityRole="button" accessibilityLabel={t.steam.worldA11y(title)} accessibilityHint={t.steam.worldHint}>
              <Card className="mb-3 flex-row items-center gap-3 rounded-3xl border-2 border-b-[6px] border-[#cdeeec] px-4 py-3.5">
                <View className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: isRec ? '#b8741a' : V.color.primaryDark }}>
                  <BlockIcon name={WORLD_ICON[w.id]} color="#ffffff" size={24} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text style={{ fontFamily: FONT.display, fontSize: 19, lineHeight: 23 }}>{title}</Text>
                  <Text className="text-muted-foreground mt-0.5 text-[12.5px] font-bold">{t.steam.worldMeta(w.challenges.length)}</Text>
                  {isRec && (
                    <Badge variant="secondary" className="mt-1.5 self-start border-transparent bg-[#fff1dc]">
                      <Text className="text-[11.5px] font-extrabold text-[#8a5512]">{t.steam.recommended}</Text>
                    </Badge>
                  )}
                </View>
                <Text className="text-muted-foreground text-2xl font-extrabold">›</Text>
              </Card>
            </Pressable>
          );
        })}

        {/* Solo Lúa: al final, después de los siete mundos (S4: no se desplaza nada). */}
        <Pressable onPress={() => navigation.navigate('SteamLuaSolo')}
          accessibilityRole="button" accessibilityLabel={t.steam.luaSoloTileA11y}>
          <Card className="border-input mb-2.5 flex-row items-center gap-3 px-3.5 py-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: V.color.primaryDark }}>
              <BlockIcon name="lua" color="#ffffff" size={24} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-extrabold">{t.steam.luaSoloTile}</Text>
              <Text className="text-muted-foreground mt-0.5 text-[12.5px] font-bold">{t.steam.luaSoloTileMeta(LUA_SOLO_ACTIVITIES.length)}</Text>
            </View>
            <Text className="text-muted-foreground text-2xl font-extrabold">›</Text>
          </Card>
        </Pressable>
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

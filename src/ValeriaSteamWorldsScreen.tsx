// Construye con Lúa · los siete mundos STEAM (plan §1 capa 1 y capa 3, §4 R5).
// Se entra desde una sola tarjeta de la rejilla de ejercicios: los bloques de
// siempre no se desplazan (CLAUDE.md, regla S4). Aquí viven también el perfil
// de adaptación —lo cambia el adulto con PIN— y la recomendación que se deriva.
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useT } from './i18n';
import { V } from './valeriaTheme';
import { getUiLang } from './valeriaUiLang';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import { ProPinModal } from './ValeriaProPin';
import { steamScreenStyles as base } from './ValeriaSteamWorldScreen';
import { STEAM_WORLDS } from './steam/worlds';
import { ADAPTATION_PROFILES, adjustmentsFor, loadAdaptationProfile, saveAdaptationProfile } from './steam/profiles';
import type { AdaptationProfileId, SteamWorldId } from './steam/types';

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
      <View style={base.header}>
        <Pressable onPress={() => navigation.goBack()} style={base.backPill} hitSlop={8}
          accessibilityRole="button" accessibilityLabel={t.steam.backA11y}>
          <Text style={base.backPillTxt}>{`‹ ${t.steam.back}`}</Text>
        </Pressable>
        <Text style={base.headerKicker}>{t.steam.worldsKicker}</Text>
        <Text style={base.headerTitle}>{t.steam.hubTileTitle}</Text>
        <Text style={s.headerSub}>{t.steam.worldsNote}</Text>
      </View>

      <ScrollView contentContainerStyle={base.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => setPinOpen(true)} style={s.profile}
          accessibilityRole="button" accessibilityLabel={t.steam.profileA11y(profileName)}>
          <View style={s.profilePlate}><BlockIcon name="lock" color={V.color.primaryDark} size={22} /></View>
          <View style={s.grow}>
            <Text style={s.profileTitle}>{t.steam.profileTitle(profileName)}</Text>
            <Text style={s.profileHint}>{t.steam.profileHint}</Text>
          </View>
          <Text style={base.chev}>›</Text>
        </Pressable>

        {STEAM_WORLDS.map((w) => {
          const title = w.title[lang];
          const isRec = recommended.includes(w.id);
          return (
            <Pressable key={w.id} onPress={() => navigation.navigate('SteamWorld', { worldId: w.id })}
              style={base.row} accessibilityRole="button" accessibilityLabel={t.steam.worldA11y(title)}
              accessibilityHint={t.steam.worldHint}>
              <View style={[s.plate, isRec && s.plateRec]}>
                <BlockIcon name={WORLD_ICON[w.id]} color="#ffffff" size={24} />
              </View>
              <View style={base.rowBody}>
                <Text style={base.rowTitle}>{title}</Text>
                <Text style={base.rowMeta}>{`${w.id} · ${t.steam.worldMeta(w.challenges.length)}`}</Text>
                {isRec && <View style={s.chip}><Text style={s.chipTxt}>{t.steam.recommended}</Text></View>}
              </View>
              <Text style={base.chev}>›</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{t.steam.profileSheetTitle}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.sheetBody}>{t.steam.profileSheetBody}</Text>
            {([null, ...ADAPTATION_PROFILES] as (AdaptationProfileId | null)[]).map((id) => {
              const name = id ? t.steam.profiles[id].name : t.steam.profileNone;
              const on = id === profile;
              return (
                <Pressable key={id ?? 'none'} onPress={() => choose(id)} style={[s.option, on && s.optionOn]}
                  accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={t.steam.profileOptionA11y(name)}>
                  <Text style={[s.optionTxt, on && s.optionTxtOn]}>{name}</Text>
                  {id && <Text style={s.optionNote}>{t.steam.profiles[id].note}</Text>}
                </Pressable>
              );
            })}
            </ScrollView>
            <Pressable onPress={() => setSheetOpen(false)} accessibilityRole="button" accessibilityLabel={t.common.close}>
              <Text style={s.cancel}>{t.common.close}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ProPinModal open={pinOpen} onClose={() => setPinOpen(false)}
        onUnlock={() => { setPinOpen(false); setSheetOpen(true); }}
        subtitle={t.steam.profilePinSubtitle} />
    </View>
  );
};

const s = StyleSheet.create({
  headerSub: { ...V.type.body, color: 'rgba(255,255,255,.92)', fontWeight: V.font.semibold, marginTop: V.space.xs },
  profile: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: V.color.primaryTint, borderWidth: 1,
    borderColor: V.color.borderActive, borderRadius: V.radius.card, padding: V.space.md, marginBottom: V.space.lg, minHeight: V.touchMin,
  },
  profilePlate: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: V.space.md },
  grow: { flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 },
  profileTitle: { fontSize: 15, fontWeight: V.font.extrabold, color: V.color.textPrimary },
  profileHint: { fontSize: 12.5, lineHeight: 17, fontWeight: V.font.semibold, color: V.color.textSecondary, marginTop: 2 },
  // Placa de tamaño fijo, como la del icono de la rejilla: no hereda flex.
  plate: { width: 44, height: 44, borderRadius: 12, backgroundColor: V.color.primaryDark, alignItems: 'center', justifyContent: 'center', marginRight: V.space.md },
  plateRec: { backgroundColor: '#b8741a' },
  chip: { alignSelf: 'flex-start', backgroundColor: '#fff1dc', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, marginTop: 5 },
  chipTxt: { fontSize: 11.5, fontWeight: V.font.extrabold, color: '#8a5512' },
  overlay: { flex: 1, backgroundColor: 'rgba(11,18,32,.72)', alignItems: 'center', justifyContent: 'center', padding: V.space.xl },
  sheet: { width: '100%', maxWidth: 400, maxHeight: '90%', backgroundColor: '#fff', borderRadius: 24, padding: 22 },
  sheetTitle: { fontSize: 19, fontWeight: V.font.extrabold, color: V.color.textPrimary, textAlign: 'center' },
  sheetBody: { ...V.type.body, lineHeight: 19, fontWeight: V.font.semibold, color: V.color.textSecondary, marginTop: V.space.sm, marginBottom: V.space.sm, textAlign: 'center' },
  option: { borderWidth: 1.5, borderColor: V.color.border, borderRadius: 14, paddingVertical: 11, paddingHorizontal: 14, marginTop: V.space.sm },
  optionOn: { borderColor: V.color.primaryDark, backgroundColor: V.color.primaryLight },
  optionTxt: { ...V.type.body, fontWeight: V.font.bold, color: V.color.textPrimary },
  optionTxtOn: { color: V.color.primaryDark, fontWeight: V.font.extrabold },
  optionNote: { fontSize: 12, lineHeight: 16, fontWeight: V.font.semibold, color: V.color.textSecondary, marginTop: 3 },
  cancel: { textAlign: 'center', color: V.color.textMuted, ...V.type.body, fontWeight: V.font.extrabold, marginTop: V.space.md },
});

export default ValeriaSteamWorldsScreen;

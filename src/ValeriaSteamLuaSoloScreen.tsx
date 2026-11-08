// Construye con Lúa · Solo Lúa (PLAN-INTEGRACION-AR-LUA-CONSTRUYE v3.0 §4).
// Actividades sin piezas que abren un ejercicio de RA que ya existe. Se entra
// desde una tarjeta al final de la lista de mundos (CLAUDE.md S4: lo que ya
// estaba no se mueve). Las dos filas van arriba para que se vean al entrar; la
// guía del adulto, debajo.
import React from 'react';
import { ListRow } from './ui/ListRow';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useT } from './i18n';
import { ScreenHeader } from './ui/ScreenHeader';
import { PlayButton } from './ui/PlayButton';
import { V } from './valeriaTheme';
import { getUiLang } from './valeriaUiLang';
import { isLuaLinked } from './valeriaLuaSession';
import { BlockIcon } from './ValeriaBlockIcons';
import { steamScreenStyles as base } from './ValeriaSteamWorldScreen';
import { LUA_SOLO_ACTIVITIES } from './steam/luaSolo';
import { FONT } from './ui/fonts';

export const ValeriaSteamLuaSoloScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const lang = getUiLang();
  const linked = isLuaLinked();

  return (
    <View style={base.root}>
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.steam.back}
        kicker={t.steam.hubTileTitle} icon="lua" title={t.steam.luaSoloTile} subtitle={t.steam.luaSoloNote} />

      <ScrollView contentContainerStyle={base.scroll} showsVerticalScrollIndicator={false}>
        {LUA_SOLO_ACTIVITIES.map((act, i) => (
          <ListRow key={act.id} index={i} icon="lua"
            title={act.title[lang]}
            subtitle={`${act.summary[lang]}\n${t.steam.luaSoloAges(act.ages)}`}
            onPress={() => navigation.navigate('ArLauncher', { luaSolo: act.id })}
            accessibilityLabel={t.steam.luaSoloStartA11y(act.title[lang])}
            trailing={<PlayButton />} />
        ))}

        <View style={base.noteCard}>
          <Text style={base.kickerFirst}>{t.steam.luaKicker}</Text>
          <Text style={base.bodyStrong}>{linked ? t.steam.luaLinked : t.steam.luaSoloNotLinked}</Text>
          <Text style={[base.body, s.gap]}>{t.steam.luaSoloLuaNote}</Text>
        </View>

        {LUA_SOLO_ACTIVITIES.map((act) => (
          <View key={act.id} style={base.card}>
            <Text style={base.kickerFirst}>{`${act.title[lang]} · ${t.steam.cycleTitle}`}</Text>

            <Text style={s.step}>{t.steam.stepObserve}</Text>
            <Text style={base.body}>{act.cycle.observa.phenomenonTrigger[lang]}</Text>
            <Text style={[base.bodyStrong, s.gap]}>{act.cycle.observa.socraticQuestion[lang]}</Text>

            <Text style={s.step}>{t.steam.stepTry}</Text>
            <Text style={base.body}>{act.cycle.experimenta.adultStepByStep[lang]}</Text>
            <Text style={s.hintTitle}>{t.steam.hintN1}</Text>
            <Text style={base.body}>{act.cycle.experimenta.hints.level1Socratic[lang]}</Text>
            <Text style={s.hintTitle}>{t.steam.hintN2}</Text>
            <Text style={base.body}>{act.cycle.experimenta.hints.level2PhysicalModel[lang]}</Text>

            <Text style={s.step}>{t.steam.stepBuild}</Text>
            <Text style={base.body}>{act.cycle.construye.tangibleMakeChallenge[lang]}</Text>
            <Text style={[base.bodyStrong, s.gap]}>{act.cycle.construye.transferQuestion[lang]}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  // Tamaño fijo, sin flex: el cuerpo de la fila es el que se encoge (§1c).
  icon: { width: 44, height: 44, borderRadius: 12, backgroundColor: V.color.primaryDark, alignItems: 'center', justifyContent: 'center', marginRight: V.space.md },
  summary: { fontFamily: FONT.bodyBlack,fontSize: 13, lineHeight: 18, color: V.color.textSecondary, marginTop: 2 },
  step: { fontFamily: FONT.bodyBlack,fontSize: 15.5, color: V.color.textPrimary, marginTop: V.space.lg, marginBottom: 4 },
  hintTitle: { fontFamily: FONT.bodyBlack,fontSize: 13.5, color: V.color.textPrimary, marginTop: V.space.sm },
  gap: { marginTop: V.space.sm },
});

export default ValeriaSteamLuaSoloScreen;

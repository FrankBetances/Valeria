// Realidad Aumentada · una actividad que se juega con el botón del adulto
// (L02–L05 y S8–S11). El adulto confirma lo que pasa en la mesa y Lúa pone la
// cara: en el aparato si está enlazada, en la tableta si no. Al salir, IDLE.
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useT } from './i18n';
import { ScreenHeader } from './ui/ScreenHeader';
import { ListRow } from './ui/ListRow';
import { V } from './valeriaTheme';
import { getUiLang } from './valeriaUiLang';
import { FONT } from './ui/fonts';
import { isLuaLinked, luaSteamFrames, luaSteamIdle } from './valeriaLuaSession';
import { steamScreenStyles as base } from './ValeriaSteamWorldScreen';
import { linkLua } from './steam/engine/LuaLink';
import { arTapActivity, type ArTapEvent } from './steam/arActivities';
import type { SteamArMode } from './steam/types';
import { ArSceneLaunch } from './ValeriaArSceneLaunch';

export const ValeriaArActivityScreen: React.FC<{ navigation: any; route: { params: { id: string; mode?: SteamArMode } } }> = ({
  navigation,
  route,
}) => {
  const t = useT();
  const lang = getUiLang();
  const act = arTapActivity(route.params.id)!;
  const withLua = act.group === 'LUA' || route.params.mode === 'SET_WITH_LUA';
  const linked = isLuaLinked();
  const [face, setFace] = useState<{ eventId: string; faceId: string } | null>(null);
  const sent = useRef(false);

  useEffect(() => () => { if (sent.current) luaSteamIdle(); }, []);

  const confirm = (ev: ArTapEvent) => {
    if (!withLua) { setFace({ eventId: ev.id, faceId: '' }); return; }
    const link = linkLua({
      bleConnected: isLuaLinked(), expression: ev.expression,
      mood: ev.mood, useMoodAsFace: ev.mood !== undefined,
      light: 'APAGADO', haptic: 'APAGADO', sink: luaSteamFrames,
    });
    if (link.emitted) sent.current = true;
    setFace({ eventId: ev.id, faceId: link.face.id });
  };

  const kicker = act.group === 'LUA' ? t.ar.catLuaSolo : withLua ? t.ar.catSetsLua : t.ar.catSets;
  const faceName = face?.faceId ? (t.steam.faces as Record<string, string>)[face.faceId] ?? face.faceId : '';

  return (
    <View style={base.root}>
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.steam.back}
        kicker={kicker} icon={act.group === 'LUA' ? 'lua' : 'game'} title={act.title[lang]} subtitle={act.summary[lang]} />
      <ScrollView contentContainerStyle={base.scroll} showsVerticalScrollIndicator={false}>
        <View style={base.noteCard}>
          {act.group === 'SET' && <Text style={base.bodyStrong}>{withLua ? t.ar.catModeLua : t.ar.catModeSolo}</Text>}
          {withLua && <Text style={[base.body, act.group === 'SET' && s.gap]}>{linked ? t.steam.luaLinked : t.steam.luaMirror}</Text>}
          {!withLua && <Text style={[base.body, s.gap]}>{t.ar.catTap}</Text>}
        </View>

        <ArSceneLaunch sceneId={act.id} title={act.title[lang]} withLua={withLua} events={act.events}
          onEvent={(eventId, faceId) => setFace({ eventId, faceId })} />

        <Text style={base.section}>{t.steam.eventsKicker}</Text>
        <Text style={[base.body, s.note]}>{t.steam.eventsNote}</Text>
        {act.events.map((ev, i) => (
          <ListRow key={ev.id} index={i} leading={String(i + 1)}
            title={ev.title[lang]}
            subtitle={face?.eventId === ev.id && faceName ? t.steam.luaFace(faceName) : undefined}
            accessibilityLabel={t.steam.eventA11y(ev.title[lang])}
            onPress={() => confirm(ev)} />
        ))}

        <View style={base.card}>
          <Text style={base.kickerFirst}>{t.steam.cycleTitle}</Text>
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
      </ScrollView>
    </View>
  );
};

const s = StyleSheet.create({
  step: { fontFamily: FONT.bodyBlack, fontSize: 15.5, color: V.color.textPrimary, marginTop: V.space.lg, marginBottom: 4 },
  hintTitle: { fontFamily: FONT.bodyBlack, fontSize: 13.5, color: V.color.textPrimary, marginTop: V.space.sm },
  gap: { marginTop: V.space.sm },
  note: { marginBottom: V.space.sm },
});

export default ValeriaArActivityScreen;

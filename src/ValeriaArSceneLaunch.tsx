// Botón «Ver en la mesa (RA)» de los sets y de las actividades Solo Lúa
// (9/11/2026). Abre ValeriaArSceneActivity con la escena de src/steam/arScenes.ts.
// Cada evento que confirma el adulto en la escena llega aquí en vivo y, si la
// modalidad lleva Lúa, se lo manda a Lúa (aparato enlazado o espejo). Al salir, IDLE.
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useT } from './i18n';
import { V } from './valeriaTheme';
import { getUiLang } from './valeriaUiLang';
import { FONT } from './ui/fonts';
import { canOpenArScene, openArScene } from './valeriaArBridge';
import { isLuaLinked, luaSteamFrames, luaSteamIdle } from './valeriaLuaSession';
import { linkLua, translateExpression, translateMood, type LuaMoodCode } from './steam/engine/LuaLink';
import { buildArSceneSpec, type ArSceneId } from './steam/arScenes';
import type { AdultText, LuaSemanticExpression } from './steam/types';

export interface ArSceneLaunchEvent {
  readonly id: string;
  readonly title: AdultText;
  readonly prompt?: AdultText;
  readonly expression: LuaSemanticExpression;
  readonly mood?: LuaMoodCode;
}

export const ArSceneLaunch: React.FC<{
  sceneId: ArSceneId;
  title: string;
  withLua: boolean;
  events: readonly ArSceneLaunchEvent[];
  /** El evento confirmado en la mesa se refleja también en la lista de la pantalla. */
  onEvent?: (eventId: string, faceId: string) => void;
}> = ({ sceneId, title, withLua, events, onEvent }) => {
  const t = useT();
  const lang = getUiLang();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const sent = useRef(false);

  useEffect(() => () => { if (sent.current) luaSteamIdle(); }, []);

  const faceOf = (ev: ArSceneLaunchEvent) => (ev.mood !== undefined ? translateMood(ev.mood) : translateExpression(ev.expression));
  const faceName = (id: string) => (t.steam.faces as Record<string, string>)[id] ?? id;

  const open = async () => {
    if (busy) return;
    if (!canOpenArScene()) { setNote(t.ar.sceneUnavailable); return; }
    setBusy(true);
    setNote(null);
    const spec = buildArSceneSpec(sceneId, lang, {
      title,
      placeHint: t.ar.scenePlace,
      searchHint: t.ar.sceneSearch,
      closeLabel: t.ar.sceneClose,
      replaceLabel: t.ar.sceneReplace,
      luaPrefix: t.ar.sceneLua,
      playLabel: t.ar.scenePlay,
      hideLabel: t.ar.sceneHide,
      showLabel: t.ar.sceneShow,
      stepLabel: t.ar.sceneStep,
      stepHint: t.ar.sceneStepHint,
      luaHint: t.ar.sceneLuaHint,
    }, events.map((ev) => ({
      id: ev.id,
      label: ev.title[lang],
      prompt: (ev.prompt ?? ev.title)[lang],
      face: withLua ? faceName(faceOf(ev).id) : '',
    })));
    const res = await openArScene(spec, (eventId) => {
      const ev = events.find((e) => e.id === eventId);
      if (!ev) return;
      let faceId = '';
      if (withLua) {
        const link = linkLua({
          bleConnected: isLuaLinked(), expression: ev.expression,
          mood: ev.mood, useMoodAsFace: ev.mood !== undefined,
          light: 'APAGADO', haptic: 'APAGADO', sink: luaSteamFrames,
        });
        if (link.emitted) sent.current = true;
        faceId = link.face.id;
      }
      onEvent?.(eventId, faceId);
    });
    setBusy(false);
    if (res.outcome === 'completed') setNote(t.ar.sceneDone(res.confirmed.length));
    else if (res.outcome === 'denied') setNote(t.ar.sceneDenied);
    else if (res.outcome !== 'aborted') setNote(t.ar.sceneUnavailable);
  };

  return (
    <View style={s.card}>
      <Text style={s.kicker}>{t.ar.sceneKicker}</Text>
      <Text style={s.body}>{t.ar.sceneSub}</Text>
      <Pressable onPress={() => { void open(); }} style={[s.btn, busy && s.btnBusy]} disabled={busy}
        accessibilityRole="button" accessibilityLabel={t.ar.sceneOpenA11y(title)}>
        <Text style={s.btnTxt}>{t.ar.sceneOpen}</Text>
      </Pressable>
      {note && <Text style={s.note}>{note}</Text>}
      <Text style={s.stage}>{t.ar.sceneStage}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: V.color.card, borderWidth: 1, borderColor: V.color.borderActive, borderRadius: 24,
    padding: V.space.lg, marginBottom: V.space.md, borderBottomWidth: 6,
  },
  kicker: { fontFamily: FONT.bodyBlack, fontSize: 11.5, color: V.color.primaryDark, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 },
  body: { fontFamily: FONT.bodyBlack, fontSize: 14, lineHeight: 20, color: V.color.textSecondary },
  btn: {
    alignSelf: 'stretch', alignItems: 'center', backgroundColor: V.color.primary, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16, marginTop: V.space.md, minHeight: V.touchMin,
  },
  btnBusy: { opacity: 0.6 },
  btnTxt: { fontFamily: FONT.bodyBlack, fontSize: 16, color: V.color.dark },
  note: { fontFamily: FONT.bodyBlack, fontSize: 13.5, lineHeight: 19, color: V.color.textPrimary, marginTop: V.space.sm },
  stage: { fontFamily: FONT.bodyBlack, fontSize: 12.5, lineHeight: 17, color: V.color.textMuted, marginTop: V.space.sm },
});

export default ArSceneLaunch;

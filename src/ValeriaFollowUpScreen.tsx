// ============================================================================
// Valeria+ · Seguimiento entre consultas (19/11/2026)
//
// Lo que hace el adulto aquí, por orden:
//   1. Ver cuánto se ha estimulado esta semana frente a lo pautado, y las 8
//      últimas semanas.
//   2. Leer las indicaciones del profesional y anotar dudas u observaciones.
//   3. Decidir si el resumen se comparte con otros centros (consentimiento).
//   4. El profesional, con SU PIN: pautar la frecuencia, escribir indicaciones,
//      marcar como revisadas las notas de la familia y dar de alta a colegas.
// Sin triaje ni recomendaciones automáticas: ninguna nota se interpreta.
// ============================================================================
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, Switch, Share, Alert } from 'react-native';
import Reanimated from 'react-native-reanimated';
import { V } from './valeriaTheme';
import { useT, UiStrings } from './i18n';
import { FONT } from './ui/fonts';
import { ScreenHeader } from './ui/ScreenHeader';
import { enterAt } from './ui/motion';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import { ProUnlockPill, ProPinModal } from './ValeriaProPin';
import { ValeriaQRCode } from './ValeriaQRCode';
import { notify } from './ui/notify';
import {
  FOLLOW_AREAS, FollowArea, FrequencyPlan, FollowNote, Professional, ProRole, ShareConsent, WeekRow,
  loadPlan, savePlan, loadStimulation, weeklySummary, loadNotes, addNote, markFamilyNotesReviewed,
  encodeNoteCode, importNoteCode, loadConsent, setConsent, listPros, addPro, removePro, resetPros,
  currentPro, clearCurrentPro,
} from './valeriaFollowUp';

const INK = '#00756f';      // turquesa oscuro: texto blanco encima ≈ 5,4:1
const DONE = '#00857f';
const PLAN_BG = '#e3ecea';
const FAMILY = '#8a4b00';   // ámbar oscuro para las notas de la familia
const ROLES: ProRole[] = ['logopeda', 'orl', 'atencion', 'otro'];

const fmt = (iso: string | Date) => {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};
const fmtShort = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;

/** Texto legible que recibe otro centro: sin ficha clínica, solo estimulación en casa. */
export function buildSummaryText(t: UiStrings, rows: WeekRow[], plan: FrequencyPlan, notes: FollowNote[]): string {
  const f = t.followUp;
  const L: string[] = [f.summaryHeader, `${f.summaryGenerated} ${fmt(new Date())}`, '', `${f.planTitle}:`];
  const planned = FOLLOW_AREAS.filter((a) => plan[a]);
  if (!planned.length) L.push(`· ${f.noPlan}`);
  for (const a of planned) L.push(`· ${f.areas[a]}: ${f.perWeek(plan[a]!.perWeek)} (${f.signedBy(plan[a]!.by, fmt(plan[a]!.at))})`);
  L.push('', `${f.adherenceTitle}:`);
  for (const r of rows) {
    const detail = FOLLOW_AREAS.filter((a) => r.byArea[a]).map((a) => `${f.areas[a]} ${r.byArea[a]!.done}/${r.byArea[a]!.planned}`).join(', ');
    L.push(`· ${f.weekOf(fmtShort(r.start))}: ${f.doneOfPlanned(r.done, r.planned)}${detail ? ` — ${detail}` : ''}`);
  }
  L.push('', `${f.notesTitle}:`);
  if (!notes.length) L.push(`· ${f.noNotes}`);
  for (const n of [...notes].sort((a, b) => a.at.localeCompare(b.at)).slice(-20)) {
    const who = n.from === 'pro' ? `${f.fromPro} · ${n.author}${n.centre ? ` (${n.centre})` : ''}` : f.fromFamily;
    L.push(`· ${fmt(n.at)} · ${who}: ${n.text.replace(/\s+/g, ' ')}`);
  }
  L.push('', f.summaryFooter);
  return L.join('\n');
}

export const ValeriaFollowUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const t = useT();
  const f = t.followUp;

  const [plan, setPlan] = useState<FrequencyPlan>({});
  const [draftPlan, setDraftPlan] = useState<Record<FollowArea, number>>({} as Record<FollowArea, number>);
  const [rows, setRows] = useState<WeekRow[]>([]);
  const [notes, setNotes] = useState<FollowNote[]>([]);
  const [consent, setConsentState] = useState<ShareConsent>({ granted: false, at: '', log: [] });
  const [pros, setPros] = useState<Professional[]>([]);
  const [unlocked, setUnlocked] = useState(!!currentPro());
  const [pinOpen, setPinOpen] = useState(false);
  const [familyText, setFamilyText] = useState('');
  const [proText, setProText] = useState('');
  const [importText, setImportText] = useState('');
  const [newPro, setNewPro] = useState<{ name: string; role: ProRole; centre: string; pin: string }>({ name: '', role: 'logopeda', centre: '', pin: '' });
  const [proErr, setProErr] = useState('');

  const reload = useCallback(async () => {
    const [p, ev, n, c, ps] = await Promise.all([loadPlan(), loadStimulation(), loadNotes(), loadConsent(), listPros()]);
    setPlan(p);
    setDraftPlan(Object.fromEntries(FOLLOW_AREAS.map((a) => [a, p[a]?.perWeek ?? 0])) as Record<FollowArea, number>);
    setRows(weeklySummary(ev, p));
    setNotes([...n].sort((a, b) => b.at.localeCompare(a.at)));
    setConsentState(c);
    setPros(ps);
  }, []);
  useEffect(() => {
    void reload();
    return navigation.addListener('focus', () => { void reload(); });
  }, [navigation, reload]);
  // Al salir se echa el PIN: la siguiente persona que coja el aparato es la familia.
  useEffect(() => () => clearCurrentPro(), []);

  const who = unlocked ? currentPro() : null;
  const week = rows[rows.length - 1];
  const pct = week && week.planned ? Math.round((100 * week.done) / week.planned) : null;
  const maxBar = Math.max(1, ...rows.map((r) => Math.max(r.planned, ...FOLLOW_AREAS.map((a) => r.byArea[a]?.done ?? 0).concat(r.done))));
  const pendingFamily = notes.filter((n) => n.from === 'family' && !n.reviewedAt).length;
  const summary = useMemo(() => buildSummaryText(t, rows, plan, notes), [t, rows, plan, notes]);
  // El QR lleva la versión corta (pauta + semanas); el texto completo va por Compartir.
  const qrText = useMemo(() => {
    const L = [f.summaryHeader, fmt(new Date())];
    for (const a of FOLLOW_AREAS) if (plan[a]) L.push(`${f.areas[a]}: ${f.perWeek(plan[a]!.perWeek)}`);
    for (const r of rows.slice(-4)) L.push(`${fmtShort(r.start)}: ${r.done}/${r.planned}`);
    return L.join('\n');
  }, [f, rows, plan]);

  const lock = () => { clearCurrentPro(); setUnlocked(false); };

  const onSavePlan = async () => {
    if (await savePlan(draftPlan)) { notify(f.planSaved); await reload(); }
  };
  const onFamilyNote = async () => {
    if (!familyText.trim()) return;
    await addNote({ from: 'family', author: f.fromFamily, text: familyText });
    setFamilyText(''); notify(f.noteSaved); await reload();
  };
  const onProNote = async () => {
    const p = currentPro(); if (!p || !proText.trim()) return;
    await addNote({ from: 'pro', author: p.name, role: p.role, centre: p.centre, text: proText });
    setProText(''); notify(f.noteSaved); await reload();
  };
  const onMakeCode = async () => {
    const code = encodeNoteCode(proText); if (!code) return;
    try { await Share.share({ title: f.codeShareTitle, message: `${f.codeShareIntro}\n\n${code}` }); } catch (e) { /* cancelado */ }
  };
  const onImport = async () => {
    const ok = await importNoteCode(importText);
    notify(ok ? f.importOk : f.importBad);
    if (ok) { setImportText(''); await reload(); }
  };
  const onConsent = async (v: boolean) => { setConsentState(await setConsent(v)); };
  const onShare = async () => {
    if (!consent.granted) return;
    try { await Share.share({ title: f.summaryHeader, message: summary }); } catch (e) { /* cancelado */ }
  };
  const onAddPro = async () => {
    const err = await addPro(newPro);
    if (err) { setProErr(err === 'name' ? f.errName : err === 'pinFormat' ? f.errPinFormat : f.errPinTaken); return; }
    setProErr(''); setNewPro({ name: '', role: 'logopeda', centre: '', pin: '' });
    notify(f.proAdded); await reload();
  };
  const onForgot = () => Alert.alert(f.forgotConfirmTitle, f.forgotConfirmBody, [
    { text: t.common.cancel, style: 'cancel' },
    { text: f.forgotConfirm, style: 'destructive', onPress: async () => { await resetPros(f.resetNote); setUnlocked(false); await reload(); } },
  ]);

  const CardHead: React.FC<{ icon: BlockIconName; title: string; badge?: string }> = ({ icon, title, badge }) => (
    <View style={s.cardHead}>
      <View style={s.chip}><BlockIcon name={icon} color={INK} size={18} /></View>
      <Text style={s.cardTitle}>{title}</Text>
      {!!badge && <View style={s.badge}><Text style={s.badgeTxt}>{badge}</Text></View>}
    </View>
  );

  return (
    <View style={s.flex}>
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.common.back}
        kicker={f.kicker} icon="chart" title={f.title}
        subtitle={who ? f.proActive(who.name) : f.familyMode} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* 1 · REALIZADO FRENTE A PAUTADO */}
        <Reanimated.View entering={enterAt(0)} style={s.card}>
          <CardHead icon="chart" title={f.adherenceTitle} />
          {!week || !week.planned ? (
            <Text style={s.muted}>{f.noPlan}</Text>
          ) : (
            <View style={s.weekBig}>
              <Text style={s.bigNum}>{week.done}<Text style={s.bigOf}> / {week.planned}</Text></Text>
              <View style={{ flexShrink: 1 }}>
                <Text style={s.bigLbl}>{f.thisWeek}</Text>
                <Text style={s.muted}>{f.pctOfPlan(pct ?? 0)}</Text>
              </View>
            </View>
          )}
          {/* Barras de 8 semanas: fondo = pautado, relleno = realizado. */}
          <View style={s.bars} accessibilityLabel={rows.map((r) => `${f.weekOf(fmtShort(r.start))}: ${f.doneOfPlanned(r.done, r.planned)}`).join('. ')}>
            {rows.map((r, i) => (
              <View key={i} style={s.barCol}>
                <View style={s.barTrack}>
                  <View style={[s.barPlan, { height: `${(100 * r.planned) / maxBar}%` }]} />
                  <View style={[s.barDone, { height: `${(100 * r.done) / maxBar}%` }, r.planned > 0 && r.done >= r.planned && s.barFull]} />
                </View>
                <Text style={[s.barLbl, i === rows.length - 1 && s.barLblNow]}>{fmtShort(r.start)}</Text>
              </View>
            ))}
          </View>
          <View style={s.legend}>
            <View style={[s.legendDot, { backgroundColor: DONE }]} /><Text style={s.legendTxt}>{f.legendDone}</Text>
            <View style={[s.legendDot, { backgroundColor: PLAN_BG, borderWidth: 1, borderColor: '#b9c7c4' }]} /><Text style={s.legendTxt}>{f.legendPlanned}</Text>
          </View>
          {week && FOLLOW_AREAS.filter((a) => week.byArea[a]).map((a) => {
            const d = week.byArea[a]!;
            return (
              <View key={a} style={s.areaRow}>
                <Text style={s.areaName}>{f.areas[a]}</Text>
                <View style={s.areaTrack}><View style={[s.areaFill, { width: `${d.planned ? Math.min(100, (100 * d.done) / d.planned) : 100}%` }]} /></View>
                <Text style={s.areaNum}>{d.planned ? `${d.done}/${d.planned}` : `${d.done}`}</Text>
              </View>
            );
          })}
        </Reanimated.View>

        {/* 2 · NOTAS EN DOS SENTIDOS */}
        <Reanimated.View entering={enterAt(1)} style={s.card}>
          <CardHead icon="clinical" title={f.notesTitle} badge={who && pendingFamily ? f.pendingBadge(pendingFamily) : undefined} />
          <Text style={s.disclaimer}>{f.notesDisclaimer}</Text>

          {notes.length === 0 && <Text style={s.muted}>{f.noNotes}</Text>}
          {notes.map((n) => {
            const pro = n.from === 'pro';
            return (
              <View key={n.id} style={[s.note, pro ? s.notePro : s.noteFam]}>
                <Text style={[s.noteWho, { color: pro ? INK : FAMILY }]}>
                  {pro ? `${f.fromPro} · ${n.author}${n.centre ? ` · ${n.centre}` : ''}` : f.fromFamily}
                  <Text style={s.noteDate}>{`  ${fmt(n.at)}`}{n.imported ? ` · ${f.imported}` : ''}</Text>
                </Text>
                <Text style={s.noteTxt}>{n.text}</Text>
                {!pro && !!n.reviewedAt && <Text style={s.noteReviewed}>{f.reviewed(n.reviewedBy ?? '', fmt(n.reviewedAt))}</Text>}
              </View>
            );
          })}

          {/* La familia siempre puede escribir. */}
          <Text style={s.fieldLbl}>{f.familyNoteLabel}</Text>
          <TextInput value={familyText} onChangeText={setFamilyText} placeholder={f.familyNotePh} placeholderTextColor="#6b7280"
            multiline style={s.input} maxLength={2000} accessibilityLabel={f.familyNoteLabel} />
          <Pressable onPress={onFamilyNote} style={[s.btn, s.btnFam, !familyText.trim() && s.btnOff]} accessibilityRole="button">
            <Text style={s.btnTxt}>{f.saveFamilyNote}</Text>
          </Pressable>

          <Text style={s.fieldLbl}>{f.importLabel}</Text>
          <TextInput value={importText} onChangeText={setImportText} placeholder={f.importPh} placeholderTextColor="#6b7280"
            style={s.input} accessibilityLabel={f.importLabel} autoCapitalize="none" autoCorrect={false} />
          <Pressable onPress={onImport} style={[s.btn, s.btnGhost, !importText.trim() && s.btnOff]} accessibilityRole="button">
            <Text style={s.btnGhostTxt}>{f.importBtn}</Text>
          </Pressable>

          {who && (
            <View style={s.proBox}>
              <Text style={s.fieldLbl}>{f.proNoteLabel(who.name)}</Text>
              <TextInput value={proText} onChangeText={setProText} placeholder={f.proNotePh} placeholderTextColor="#6b7280"
                multiline style={s.input} maxLength={2000} accessibilityLabel={f.proNoteLabel(who.name)} />
              <View style={s.btnRow}>
                <Pressable onPress={onProNote} style={[s.btn, s.flex1, !proText.trim() && s.btnOff]} accessibilityRole="button">
                  <Text style={s.btnTxt}>{f.saveProNote}</Text>
                </Pressable>
                <Pressable onPress={onMakeCode} style={[s.btn, s.btnGhost, s.flex1, !proText.trim() && s.btnOff]} accessibilityRole="button">
                  <Text style={s.btnGhostTxt}>{f.makeCode}</Text>
                </Pressable>
              </View>
              <Text style={s.muted}>{f.makeCodeHelp}</Text>
              {pendingFamily > 0 && (
                <Pressable onPress={async () => { await markFamilyNotesReviewed(); await reload(); }} style={[s.btn, s.btnGhost]} accessibilityRole="button">
                  <Text style={s.btnGhostTxt}>{f.markReviewed(pendingFamily)}</Text>
                </Pressable>
              )}
            </View>
          )}
        </Reanimated.View>

        {/* 3 · PAUTA CON FRECUENCIA */}
        <Reanimated.View entering={enterAt(2)} style={s.card}>
          <CardHead icon="session" title={f.planTitle} />
          <Text style={s.muted}>{who ? f.planSubPro : f.planSubFamily}</Text>
          {FOLLOW_AREAS.map((a) => {
            const v = who ? draftPlan[a] ?? 0 : plan[a]?.perWeek ?? 0;
            if (!who && !v) return null;
            return (
              <View key={a} style={s.planRow}>
                <View style={{ flexShrink: 1, flexGrow: 1 }}>
                  <Text style={s.areaNameBig}>{f.areas[a]}</Text>
                  {!!plan[a] && <Text style={s.signed}>{f.signedBy(plan[a]!.by, fmt(plan[a]!.at))}</Text>}
                </View>
                {who ? (
                  <View style={s.stepper}>
                    <Pressable onPress={() => setDraftPlan((p) => ({ ...p, [a]: Math.max(0, (p[a] ?? 0) - 1) }))} style={s.stepBtn}
                      accessibilityRole="button" accessibilityLabel={f.less(f.areas[a])}><Text style={s.stepTxt}>−</Text></Pressable>
                    <Text style={s.stepVal}>{v}</Text>
                    <Pressable onPress={() => setDraftPlan((p) => ({ ...p, [a]: Math.min(14, (p[a] ?? 0) + 1) }))} style={s.stepBtn}
                      accessibilityRole="button" accessibilityLabel={f.more(f.areas[a])}><Text style={s.stepTxt}>+</Text></Pressable>
                  </View>
                ) : <Text style={s.planVal}>{f.perWeek(v)}</Text>}
              </View>
            );
          })}
          {!who && !FOLLOW_AREAS.some((a) => plan[a]) && <Text style={s.muted}>{f.noPlan}</Text>}
          {who && (
            <Pressable onPress={onSavePlan} style={s.btn} accessibilityRole="button"><Text style={s.btnTxt}>{f.savePlan}</Text></Pressable>
          )}
        </Reanimated.View>

        {/* 4 · OTROS CENTROS (consentimiento de la familia) */}
        <Reanimated.View entering={enterAt(3)} style={s.card}>
          <CardHead icon="family" title={f.shareTitle} />
          <Text style={s.muted}>{f.shareSub}</Text>
          <View style={s.consentRow}>
            <Text style={s.consentLbl}>{f.consentLabel}</Text>
            <Switch value={consent.granted} onValueChange={onConsent} accessibilityLabel={f.consentLabel}
              trackColor={{ false: '#d1d5db', true: DONE }} thumbColor="#ffffff" />
          </View>
          <Text style={s.signed}>{consent.granted ? f.consentOn(fmt(consent.at)) : consent.at ? f.consentRevoked(fmt(consent.at)) : f.consentOff}</Text>
          {consent.granted && (
            <>
              <View style={s.qrWrap}><ValeriaQRCode value={qrText} size={200} /></View>
              <Text style={s.qrCap}>{f.qrCaption}</Text>
              <Pressable onPress={onShare} style={s.btn} accessibilityRole="button"><Text style={s.btnTxt}>{f.shareBtn}</Text></Pressable>
              <Text style={s.muted}>{f.revokeNote}</Text>
            </>
          )}
        </Reanimated.View>

        {/* 5 · PROFESIONALES Y PIN */}
        <Reanimated.View entering={enterAt(4)} style={s.card}>
          <CardHead icon="lock" title={f.prosTitle} />
          <Text style={s.muted}>{pros.length ? f.prosSub(pros.length) : f.prosNone}</Text>
          {who ? (
            <Pressable onPress={lock} style={[s.btn, s.btnGhost]} accessibilityRole="button"><Text style={s.btnGhostTxt}>{f.lockNow}</Text></Pressable>
          ) : (
            <ProUnlockPill unlocked={false} onPress={() => setPinOpen(true)} />
          )}
          {who && pros.map((p) => (
            <View key={p.id} style={s.proRow}>
              <View style={{ flexShrink: 1, flexGrow: 1 }}>
                <Text style={s.areaNameBig}>{p.name}</Text>
                <Text style={s.signed}>{f.roles[p.role]}{p.centre ? ` · ${p.centre}` : ''}</Text>
              </View>
              <Pressable onPress={async () => { await removePro(p.id); if (p.id === who.id) lock(); await reload(); }} style={s.removeBtn}
                accessibilityRole="button" accessibilityLabel={f.removePro(p.name)}>
                <BlockIcon name="cross" color="#b91c1c" size={14} />
              </Pressable>
            </View>
          ))}
          {who && (
            <View style={s.proBox}>
              <Text style={s.fieldLbl}>{f.addPro}</Text>
              <TextInput value={newPro.name} onChangeText={(v) => setNewPro((p) => ({ ...p, name: v }))} placeholder={f.namePh} placeholderTextColor="#6b7280" style={s.input} />
              <View style={s.roleRow}>
                {ROLES.map((r) => (
                  <Pressable key={r} onPress={() => setNewPro((p) => ({ ...p, role: r }))} style={[s.roleChip, newPro.role === r && s.roleChipOn]}
                    accessibilityRole="radio" accessibilityState={{ selected: newPro.role === r }}>
                    <Text style={[s.roleTxt, newPro.role === r && s.roleTxtOn]}>{f.roles[r]}</Text>
                  </Pressable>
                ))}
              </View>
              <TextInput value={newPro.centre} onChangeText={(v) => setNewPro((p) => ({ ...p, centre: v }))} placeholder={f.centrePh} placeholderTextColor="#6b7280" style={s.input} />
              <TextInput value={newPro.pin} onChangeText={(v) => setNewPro((p) => ({ ...p, pin: v.replace(/\D/g, '').slice(0, 4) }))} placeholder={f.pinPh}
                placeholderTextColor="#6b7280" style={s.input} keyboardType="number-pad" secureTextEntry maxLength={4} />
              {!!proErr && <Text style={s.err}>{proErr}</Text>}
              <Pressable onPress={onAddPro} style={s.btn} accessibilityRole="button"><Text style={s.btnTxt}>{f.addProBtn}</Text></Pressable>
            </View>
          )}
          {!who && pros.length > 0 && (
            <Pressable onPress={onForgot} style={s.linkBtn} accessibilityRole="button"><Text style={s.linkTxt}>{f.forgotPin}</Text></Pressable>
          )}
        </Reanimated.View>
      </ScrollView>

      <ProPinModal open={pinOpen} onClose={() => setPinOpen(false)} subtitle={f.pinSubtitle}
        onUnlock={() => { setPinOpen(false); setUnlocked(true); void reload(); }} />
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  flex1: { flexGrow: 1, flexBasis: 0 },
  scroll: { padding: V.space.lg, paddingBottom: V.space.xxl, gap: 14 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: V.color.border, gap: 10, ...V.shadow.card },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chip: { width: 34, height: 34, borderRadius: 11, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: FONT.display, fontSize: 18, color: V.color.textPrimary, flexShrink: 1, flexGrow: 1 },
  badge: { backgroundColor: '#fff4d6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  badgeTxt: { fontFamily: FONT.bodyBlack, fontSize: 11.5, color: FAMILY },
  muted: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.textSecondary, lineHeight: 18 },
  disclaimer: { fontFamily: FONT.bodyBold, fontSize: 12.5, color: '#7c2d12', backgroundColor: '#fff7ed', borderRadius: 10, padding: 10, lineHeight: 17 },
  weekBig: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bigNum: { fontFamily: FONT.display, fontSize: 40, color: INK },
  bigOf: { fontFamily: FONT.display, fontSize: 22, color: V.color.textSecondary },
  bigLbl: { fontFamily: FONT.bodyBlack, fontSize: 14, color: V.color.textPrimary },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 128, marginTop: 4 },
  barCol: { flexGrow: 1, flexBasis: 0, alignItems: 'center', height: '100%' },
  barTrack: { flexGrow: 1, width: '72%', justifyContent: 'flex-end' },
  barPlan: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: PLAN_BG, borderRadius: 6, borderWidth: 1, borderColor: '#b9c7c4' },
  barDone: { backgroundColor: DONE, borderRadius: 6, marginHorizontal: 4 },
  barFull: { backgroundColor: '#047857' },
  barLbl: { fontFamily: FONT.bodyBold, fontSize: 10, color: V.color.textSecondary, marginTop: 4 },
  barLblNow: { fontFamily: FONT.bodyBlack, color: V.color.textPrimary },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  legendDot: { width: 12, height: 12, borderRadius: 4 },
  legendTxt: { fontFamily: FONT.bodyBold, fontSize: 12, color: V.color.textSecondary, marginRight: 10 },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  areaName: { fontFamily: FONT.bodyBlack, fontSize: 13, color: V.color.textPrimary, width: 110 },
  areaNameBig: { fontFamily: FONT.bodyBlack, fontSize: 14.5, color: V.color.textPrimary },
  areaTrack: { flexGrow: 1, flexBasis: 0, height: 10, borderRadius: 5, backgroundColor: PLAN_BG, overflow: 'hidden' },
  areaFill: { height: '100%', backgroundColor: DONE, borderRadius: 5 },
  areaNum: { fontFamily: FONT.bodyBlack, fontSize: 13, color: V.color.textPrimary, minWidth: 36, textAlign: 'right' },
  note: { borderRadius: 12, padding: 11, borderLeftWidth: 4, gap: 3 },
  notePro: { backgroundColor: '#ecfbf9', borderLeftColor: INK },
  noteFam: { backgroundColor: '#fff8ea', borderLeftColor: '#d97706' },
  noteWho: { fontFamily: FONT.bodyBlack, fontSize: 12.5 },
  noteDate: { fontFamily: FONT.bodyBold, fontSize: 12, color: V.color.textSecondary },
  noteTxt: { fontFamily: FONT.bodyBold, fontSize: 14, color: V.color.textPrimary, lineHeight: 20 },
  noteReviewed: { fontFamily: FONT.bodyBold, fontSize: 11.5, color: '#047857' },
  fieldLbl: { fontFamily: FONT.bodyBlack, fontSize: 13, color: V.color.textPrimary, marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#cfd8d6', borderRadius: 12, padding: 11, fontFamily: FONT.bodyBold, fontSize: 14, color: V.color.textPrimary, backgroundColor: '#fff', minHeight: 44, textAlignVertical: 'top' },
  btn: { backgroundColor: INK, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 12, alignItems: 'center' },
  btnFam: { backgroundColor: FAMILY },
  btnOff: { opacity: 0.62 },
  btnTxt: { fontFamily: FONT.bodyBlack, color: '#fff', fontSize: 14.5, textAlign: 'center' },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: INK },
  btnGhostTxt: { fontFamily: FONT.bodyBlack, color: INK, fontSize: 14, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 8 },
  proBox: { gap: 8, borderTopWidth: 1, borderTopColor: V.color.border, paddingTop: 10, marginTop: 4 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f3f2' },
  signed: { fontFamily: FONT.bodyBold, fontSize: 11.5, color: V.color.textSecondary },
  planVal: { fontFamily: FONT.bodyBlack, fontSize: 14, color: INK },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: V.color.primaryLight, alignItems: 'center', justifyContent: 'center' },
  stepTxt: { fontFamily: FONT.display, fontSize: 22, color: INK },
  stepVal: { fontFamily: FONT.display, fontSize: 20, color: V.color.textPrimary, minWidth: 26, textAlign: 'center' },
  consentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  consentLbl: { fontFamily: FONT.bodyBlack, fontSize: 14, color: V.color.textPrimary, flexShrink: 1, flexGrow: 1 },
  qrWrap: { alignItems: 'center', paddingVertical: 8 },
  qrCap: { fontFamily: FONT.bodyBold, fontSize: 12, color: V.color.textSecondary, textAlign: 'center' },
  proRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center' },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roleChip: { borderRadius: 12, borderWidth: 1.5, borderColor: '#cfd8d6', paddingHorizontal: 11, paddingVertical: 7 },
  roleChipOn: { borderColor: INK, backgroundColor: '#ecfbf9' },
  roleTxt: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.textSecondary },
  roleTxtOn: { fontFamily: FONT.bodyBlack, color: INK },
  err: { fontFamily: FONT.bodyBlack, fontSize: 12.5, color: '#b91c1c' },
  linkBtn: { alignSelf: 'center', padding: 8 },
  linkTxt: { fontFamily: FONT.bodyBlack, fontSize: 13, color: V.color.textSecondary, textDecorationLine: 'underline' },
});

export default ValeriaFollowUpScreen;

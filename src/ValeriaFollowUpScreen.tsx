// ============================================================================
// Valeria+ · Seguimiento entre consultas v2 (P3.2–P3.7)
//
// · Sin paciente activo, no hay modo 'anon': pide elegir o importar paciente.
// · Cola por clave + writeEnc boolean: no borra el texto si falla al guardar.
// · Vínculo QR VALERIA-VINCULO1, notas cifradas y firmadas VALERIA-NOTA2 (en
//   ambos sentidos), acuse VALERIA-LEIDO2, escáner QR con cámara, enlace
//   valeria://nota?c=…, compatibilidad VALERIA-NOTA1 y copia cifrada .valeria.
// · El resumen para otros centros marca quién escribe cada nota y solo incluye
//   notas de la familia si el adulto lo confirma expresamente.
// ============================================================================
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, TextInput, Switch, Share, Alert, Platform,
} from 'react-native';
import Reanimated from 'react-native-reanimated';
import { V } from './valeriaTheme';
import { useT, UiStrings } from './i18n';
import { FONT } from './ui/fonts';
import { ScreenHeader } from './ui/ScreenHeader';
import { enterAt } from './ui/motion';
import { BlockIcon, BlockIconName } from './ValeriaBlockIcons';
import { ProUnlockPill, ProPinModal } from './ValeriaProPin';
import { ValeriaQRCode } from './ValeriaQRCode';
import { ValeriaQrScanModal } from './ValeriaQrScanModal';
import { notify } from './ui/notify';
import {
  FOLLOW_AREAS, FollowArea, FrequencyPlan, FollowNote, Professional, ProRole, ShareConsent, WeekRow,
  PatientLink, hasActivePatient, loadPlan, savePlan, loadStimulation, weeklySummary, loadNotes,
  addNote, markFamilyNotesReviewed, exportSignedNoteCode, importNoteCodeDetailed, loadConsent,
  setConsent, listPros, addPro, removePro, resetPros, currentPro, clearCurrentPro,
  createLinkPayload, importLinkCode, listLinks, exportPatientBundle, importPatientBundle,
  LINK_PREFIX, extractNoteCodeFromInput,
} from './valeriaFollowUp';
import { readActivePatient } from './valeriaPatients';

const INK = '#00756f';      // turquesa oscuro: texto blanco encima ≈ 5,4:1
const DONE = '#00857f';
const PLAN_BG = '#e3ecea';
const FAMILY = '#8a4b00';   // ámbar oscuro para las notas de la familia
const ROLES: ProRole[] = ['logopeda', 'orl', 'atencion', 'otro'];

const fmt = (iso: string | Date) => {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return Number.isNaN(d.getTime()) ? '' : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};
const fmtShort = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;

/**
 * Texto legible que recibe otro centro: sin ficha clínica.
 * P3.7: marca explícitamente cada nota (Profesional vs Familia) y solo
 * incluye las notas escritas por la familia si `includeFamilyNotes === true`.
 */
export function buildSummaryText(
  t: UiStrings,
  rows: WeekRow[],
  plan: FrequencyPlan,
  notes: FollowNote[],
  includeFamilyNotes = false,
): string {
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
  const visibleNotes = notes.filter((n) => n.from === 'pro' || includeFamilyNotes);
  L.push('', `${f.notesTitle}:`);
  if (!visibleNotes.length) L.push(`· ${f.noNotes}`);
  for (const n of [...visibleNotes].sort((a, b) => a.at.localeCompare(b.at)).slice(-20)) {
    const tag = n.from === 'pro'
      ? `${f.summaryProTag} ${n.author}${n.centre ? ` (${n.centre})` : ''}`
      : f.summaryFamilyTag;
    L.push(`· ${fmt(n.at)} · ${tag}: ${n.text.replace(/\s+/g, ' ')}`);
  }
  L.push('', f.summaryFooter);
  return L.join('\n');
}

export const ValeriaFollowUpScreen: React.FC<{
  navigation: any;
  route?: { params?: { incomingCode?: string } };
}> = ({ navigation, route }) => {
  const t = useT();
  const f = t.followUp;

  const [patientOk, setPatientOk] = useState<boolean>(true);
  const [patientLabel, setPatientLabel] = useState<string>('');
  const [plan, setPlan] = useState<FrequencyPlan>({});
  const [draftPlan, setDraftPlan] = useState<Record<FollowArea, number>>({} as Record<FollowArea, number>);
  const [rows, setRows] = useState<WeekRow[]>([]);
  const [notes, setNotes] = useState<FollowNote[]>([]);
  const [links, setLinks] = useState<PatientLink[]>([]);
  const [consent, setConsentState] = useState<ShareConsent>({ granted: false, at: '', log: [] });
  const [includeFamilyNotes, setIncludeFamilyNotes] = useState(false);
  const [pros, setPros] = useState<Professional[]>([]);
  const [unlocked, setUnlocked] = useState(!!currentPro());
  const [pinOpen, setPinOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);

  const [familyText, setFamilyText] = useState('');
  const [proText, setProText] = useState('');
  const [importText, setImportText] = useState('');
  const [statusBanner, setStatusBanner] = useState<{ kind: 'ok' | 'warn' | 'err'; text: string } | null>(null);
  const [linkQr, setLinkQr] = useState<{ code: string; qrOk: boolean } | null>(null);
  const [outgoingCode, setOutgoingCode] = useState<{ code: string; url?: string; qrOk: boolean; label: string } | null>(null);
  const [receiptBox, setReceiptBox] = useState<{ code: string; url?: string; qrOk: boolean } | null>(null);

  const [exportPass, setExportPass] = useState('');
  const [exportPass2, setExportPass2] = useState('');
  const [importBundleText, setImportBundleText] = useState('');
  const [importPass, setImportPass] = useState('');
  const [bundleBanner, setBundleBanner] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [newPro, setNewPro] = useState<{ name: string; role: ProRole; centre: string; pin: string }>({
    name: '', role: 'logopeda', centre: '', pin: '',
  });
  const [proErr, setProErr] = useState('');

  const reload = useCallback(async () => {
    const active = await hasActivePatient();
    setPatientOk(active);
    const patient = active ? await readActivePatient() : null;
    setPatientLabel(patient?.nombre ? String(patient.nombre) : patient?.nhc ? String(patient.nhc) : '');

    const [p, ev, n, c, ps, lks] = await Promise.all([
      loadPlan(),
      loadStimulation(),
      loadNotes(),
      loadConsent(),
      listPros(),
      listLinks(),
    ]);
    setPlan(p);
    setDraftPlan(Object.fromEntries(FOLLOW_AREAS.map((a) => [a, p[a]?.perWeek ?? 0])) as Record<FollowArea, number>);
    setRows(weeklySummary(ev, p));
    setNotes([...n].sort((a, b) => b.at.localeCompare(a.at)));
    setConsentState(c);
    setPros(ps);
    setLinks(lks);
  }, []);

  useEffect(() => {
    void reload();
    return navigation.addListener('focus', () => { void reload(); });
  }, [navigation, reload]);

  useEffect(() => () => clearCurrentPro(), []);

  const handleIncomingRawCode = useCallback(async (raw: string) => {
    const clean = extractNoteCodeFromInput(raw);
    if (!clean) {
      setStatusBanner({ kind: 'err', text: f.importBad });
      notify(f.importBad);
      return;
    }
    if (clean.startsWith(LINK_PREFIX)) {
      const res = await importLinkCode(clean);
      if (res.ok) {
        const msg = f.linkOk(res.label ?? '');
        setStatusBanner({ kind: 'ok', text: msg });
        notify(msg);
        setImportText('');
        await reload();
      } else {
        const msg = res.reason === 'no_patient' ? f.wrongPatientError : f.linkBad;
        setStatusBanner({ kind: 'err', text: msg });
      }
      return;
    }
    const res = await importNoteCodeDetailed(raw);
    if (!res.ok) {
      const msg = res.reason === 'wrong_patient'
        ? f.wrongPatientError
        : res.reason === 'unverified'
          ? f.notVerifiedReject
          : res.reason === 'save_error'
            ? f.saveError
            : f.importBad;
      setStatusBanner({ kind: 'err', text: msg });
      return;
    }
    if (res.kind === 'receipt') {
      const msg = f.receiptImported(res.reviewedBy ?? '', fmt(res.reviewedAt ?? new Date()), res.count ?? 0);
      setStatusBanner({ kind: 'ok', text: msg });
      notify(msg);
      setImportText('');
      await reload();
      return;
    }
    if (res.status === 'legacy_unverified') {
      const msg = `${f.importOk} (${f.legacyUnverifiedTag})`;
      setStatusBanner({ kind: 'warn', text: msg });
      notify(msg);
    } else {
      const msg = res.duplicate
        ? f.duplicateNote
        : f.verifiedSignedBy(res.author ?? '', res.centre ?? '');
      setStatusBanner({ kind: 'ok', text: msg });
      notify(msg);
    }
    setImportText('');
    await reload();
  }, [f, reload]);

  useEffect(() => {
    const incoming = route?.params?.incomingCode;
    if (incoming) {
      setImportText(incoming);
      void handleIncomingRawCode(incoming);
    }
  }, [route?.params?.incomingCode, handleIncomingRawCode]);

  const who = unlocked ? currentPro() : null;
  const week = rows[rows.length - 1];
  const pct = week && week.planned ? Math.round((100 * week.done) / week.planned) : null;
  const maxBar = Math.max(1, ...rows.map((r) => Math.max(r.planned, ...FOLLOW_AREAS.map((a) => r.byArea[a]?.done ?? 0).concat(r.done))));
  const pendingFamily = notes.filter((n) => n.from === 'family' && !n.reviewedAt).length;
  const summary = useMemo(
    () => buildSummaryText(t, rows, plan, notes, includeFamilyNotes),
    [t, rows, plan, notes, includeFamilyNotes],
  );

  // El QR lleva la versión corta (pauta + semanas); el texto completo va por Compartir.
  const qrText = useMemo(() => {
    const L = [f.summaryHeader, fmt(new Date())];
    for (const a of FOLLOW_AREAS) if (plan[a]) L.push(`${f.areas[a]}: ${f.perWeek(plan[a]!.perWeek)}`);
    for (const r of rows.slice(-4)) L.push(`${fmtShort(r.start)}: ${r.done}/${r.planned}`);
    return L.join('\n');
  }, [f, rows, plan]);

  const lock = () => { clearCurrentPro(); setUnlocked(false); };

  const onSavePlan = async () => {
    const ok = await savePlan(draftPlan);
    if (ok) { notify(f.planSaved); await reload(); }
    else notify(f.saveError);
  };

  const onFamilyNote = async () => {
    if (!familyText.trim()) return;
    const ok = await addNote({ from: 'family', author: f.fromFamily, text: familyText });
    if (ok) { setFamilyText(''); notify(f.noteSaved); await reload(); }
    else notify(f.saveError);
  };

  const onSendFamilyCode = async () => {
    if (!familyText.trim()) return;
    const res = await exportSignedNoteCode({ text: familyText, from: 'family', author: f.fromFamily });
    if (!res.ok || !res.code) {
      notify(f.saveError);
      return;
    }
    setFamilyText('');
    setOutgoingCode({ code: res.code, url: res.url, qrOk: !!res.qrOk, label: f.sendToPro });
    await reload();
  };

  const onProNote = async () => {
    const p = currentPro();
    if (!p || !proText.trim()) return;
    const ok = await addNote({ from: 'pro', author: p.name, role: p.role, centre: p.centre, text: proText });
    if (ok) { setProText(''); notify(f.noteSaved); await reload(); }
    else notify(f.saveError);
  };

  const onMakeCode = async () => {
    const p = currentPro();
    if (!p || !proText.trim()) return;
    const res = await exportSignedNoteCode({
      text: proText,
      from: 'pro',
      author: p.name,
      role: p.role,
      centre: p.centre,
    });
    if (!res.ok || !res.code) { notify(f.saveError); return; }
    setProText('');
    setOutgoingCode({ code: res.code, url: res.url, qrOk: !!res.qrOk, label: f.makeCode });
    await reload();
  };

  const onShowLinkQr = async () => {
    const res = await createLinkPayload();
    if (res.ok && res.code) {
      setLinkQr({ code: res.code, qrOk: !!res.qrOk });
      await reload();
    } else {
      notify(f.saveError);
    }
  };

  const onMarkReviewed = async () => {
    const res = await markFamilyNotesReviewed();
    if (!res.ok) { notify(f.saveError); return; }
    if (res.receiptCode) {
      setReceiptBox({ code: res.receiptCode, url: res.receiptUrl, qrOk: !!res.qrOk });
    }
    await reload();
  };

  const onConsent = async (v: boolean) => {
    const res = await setConsent(v);
    if (res.ok) setConsentState(res.consent);
    else notify(f.saveError);
  };

  const onShare = async () => {
    if (!consent.granted) return;
    try { await Share.share({ title: f.summaryHeader, message: summary }); } catch (e) { /* cancelado */ }
  };

  const onExportBundle = async () => {
    if (exportPass.trim().length < 6) {
      setBundleBanner({ kind: 'err', text: f.exportShortPass });
      return;
    }
    if (exportPass.trim() !== exportPass2.trim()) {
      setBundleBanner({ kind: 'err', text: f.exportPassMismatch });
      return;
    }
    const res = await exportPatientBundle(exportPass);
    if (!res.ok || !res.data) {
      setBundleBanner({ kind: 'err', text: f.saveError });
      return;
    }
    setBundleBanner({ kind: 'ok', text: f.exportReadyShare });
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([res.data], { type: 'text/plain;charset=utf-8' });
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = res.filename || 'perfil.valeria';
        a.click();
        URL.revokeObjectURL(href);
      } catch (e) { /* noop */ }
    }
    try {
      await Share.share({ title: res.filename || 'perfil.valeria', message: res.data });
    } catch (e) { /* cancelado */ }
  };

  const onImportBundle = async () => {
    if (importPass.trim().length < 6) {
      setBundleBanner({ kind: 'err', text: f.exportShortPass });
      return;
    }
    const res = await importPatientBundle(importBundleText, importPass);
    if (!res.ok) {
      const msg = res.reason === 'save_error' ? f.saveError : f.exportBadFile;
      setBundleBanner({ kind: 'err', text: msg });
      notify(msg);
      return;
    }
    const okMsg = f.exportImportOk(res.patientName ?? '');
    setBundleBanner({ kind: 'ok', text: okMsg });
    setImportBundleText('');
    setImportPass('');
    notify(okMsg);
    await reload();
  };

  const onAddPro = async () => {
    const err = await addPro(newPro);
    if (err) {
      setProErr(err === 'name' ? f.errName : err === 'pinFormat' ? f.errPinFormat : f.errPinTaken);
      return;
    }
    setProErr('');
    setNewPro({ name: '', role: 'logopeda', centre: '', pin: '' });
    notify(f.proAdded);
    await reload();
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

  const importExportCard = (
    <Reanimated.View entering={enterAt(5)} style={s.card}>
      <CardHead icon="lock" title={f.exportImportTitle} />
      <Text style={s.muted}>{f.exportImportSub}</Text>
      {!!bundleBanner && (
        <View style={[s.banner, bundleBanner.kind === 'ok' ? s.bannerOk : s.bannerErr]}>
          <Text style={bundleBanner.kind === 'ok' ? s.bannerOkTxt : s.bannerErrTxt}>{bundleBanner.text}</Text>
        </View>
      )}
      {patientOk && (
        <View style={s.proBox}>
          <TextInput value={exportPass} onChangeText={setExportPass} placeholder={f.passphrasePh}
            placeholderTextColor="#6b7280" secureTextEntry style={s.input} accessibilityLabel={f.passphrasePh} />
          <TextInput value={exportPass2} onChangeText={setExportPass2} placeholder={f.passphraseConfirmPh}
            placeholderTextColor="#6b7280" secureTextEntry style={s.input} accessibilityLabel={f.passphraseConfirmPh} />
          <Pressable onPress={() => void onExportBundle()} style={s.btn} accessibilityRole="button">
            <Text style={s.btnTxt}>{f.exportPatientBtn}</Text>
          </Pressable>
        </View>
      )}
      <View style={s.proBox}>
        <Text style={s.fieldLbl}>{f.exportPasteLabel}</Text>
        {Platform.OS === 'web' && (
          <View>
            <Pressable
              onPress={() => {
                if (typeof document === 'undefined') return;
                const inp = document.createElement('input');
                inp.type = 'file';
                inp.accept = '.valeria,.txt';
                inp.onchange = async () => {
                  const file = inp.files?.[0];
                  if (file) setImportBundleText(await file.text());
                };
                inp.click();
              }}
              style={[s.btn, s.btnGhost]}
              accessibilityRole="button"
            >
              <Text style={s.btnGhostTxt}>{f.exportPickFileBtn}</Text>
            </Pressable>
          </View>
        )}
        <TextInput value={importBundleText} onChangeText={setImportBundleText} placeholder={f.exportPastePh}
          placeholderTextColor="#6b7280" style={s.input} autoCapitalize="none" autoCorrect={false}
          accessibilityLabel={f.exportPasteLabel} />
        <TextInput value={importPass} onChangeText={setImportPass} placeholder={f.passphrasePh}
          placeholderTextColor="#6b7280" secureTextEntry style={s.input} accessibilityLabel={f.passphrasePh} />
        <Pressable onPress={() => void onImportBundle()} style={[s.btn, s.btnGhost, !importBundleText.trim() && s.btnOff]} accessibilityRole="button">
          <Text style={s.btnGhostTxt}>{f.importPatientBtn}</Text>
        </Pressable>
      </View>
    </Reanimated.View>
  );

  return (
    <View style={s.flex}>
      <ScreenHeader onBack={() => navigation.goBack()} backLabel={t.common.back}
        kicker={f.kicker} icon="chart" title={f.title}
        subtitle={who ? `${f.proActive(who.name)}${patientLabel ? ` · ${patientLabel}` : ''}` : patientLabel || f.familyMode} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!patientOk ? (
          <>
            <Reanimated.View entering={enterAt(0)} style={s.card}>
              <CardHead icon="family" title={f.noPatientTitle} />
              <Text style={s.muted}>{f.noPatientBody}</Text>
              <Pressable onPress={() => navigation.navigate('PatientSelect')} style={s.btn} accessibilityRole="button">
                <Text style={s.btnTxt}>{f.choosePatientBtn}</Text>
              </Pressable>
            </Reanimated.View>
            {importExportCard}
          </>
        ) : (
          <>
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

            {/* 2 · VÍNCULO ENTRE APARATOS + NOTAS CIFRADAS Y FIRMADAS */}
            <Reanimated.View entering={enterAt(1)} style={s.card}>
              <CardHead icon="clinical" title={f.notesTitle} badge={who && pendingFamily ? f.pendingBadge(pendingFamily) : undefined} />
              <Text style={s.disclaimer}>{f.notesDisclaimer}</Text>

              <View style={s.linkBox}>
                <Text style={s.fieldLbl}>{f.linkTitle}</Text>
                <Text style={s.muted}>{f.linkSub}</Text>
                <Text style={s.signed}>{f.linkedDevices(links.length)}</Text>
                <View style={s.btnRow}>
                  <Pressable onPress={() => void onShowLinkQr()} style={[s.btn, s.btnGhost, s.flex1]} accessibilityRole="button">
                    <Text style={s.btnGhostTxt}>{f.showLinkQrBtn}</Text>
                  </Pressable>
                  <Pressable onPress={() => setScanOpen(true)} style={[s.btn, s.btnGhost, s.flex1]} accessibilityRole="button">
                    <Text style={s.btnGhostTxt}>{f.scanLinkBtn}</Text>
                  </Pressable>
                </View>
                {linkQr && (
                  <View style={s.qrBox}>
                    {linkQr.qrOk && <View style={s.qrWrap}><ValeriaQRCode value={linkQr.code} size={220} /></View>}
                    <Text style={s.qrCap}>{linkQr.qrOk ? f.linkQrCaption : f.codeTooLongForQr}</Text>
                    <Pressable onPress={() => void Share.share({ title: f.linkTitle, message: linkQr.code })} style={[s.btn, s.btnGhost]} accessibilityRole="button">
                      <Text style={s.btnGhostTxt}>{f.shareCodeBtn}</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {notes.length === 0 && <Text style={s.muted}>{f.noNotes}</Text>}
              {notes.map((n) => {
                const pro = n.from === 'pro';
                return (
                  <View key={n.id} style={[s.note, pro ? s.notePro : s.noteFam]}>
                    <Text style={[s.noteWho, { color: pro ? INK : FAMILY }]}>
                      {pro ? `${f.fromPro} · ${n.author}${n.centre ? ` · ${n.centre}` : ''}` : f.fromFamily}
                      <Text style={s.noteDate}>
                        {`  ${fmt(n.at)}`}
                        {n.imported ? ` · ${f.imported}` : ''}
                        {n.legacyFormat ? ` · ${f.legacyUnverifiedTag}` : ''}
                        {n.postReset ? ` · ${f.postResetTag}` : ''}
                      </Text>
                    </Text>
                    <Text style={s.noteTxt}>{n.text}</Text>
                    {!pro && !!n.reviewedAt && <Text style={s.noteReviewed}>{f.reviewed(n.reviewedBy ?? '', fmt(n.reviewedAt))}</Text>}
                  </View>
                );
              })}

              <Text style={s.fieldLbl}>{f.familyNoteLabel}</Text>
              <TextInput value={familyText} onChangeText={setFamilyText} placeholder={f.familyNotePh} placeholderTextColor="#6b7280"
                multiline style={s.input} maxLength={2000} accessibilityLabel={f.familyNoteLabel} />
              <View style={s.btnRow}>
                <Pressable onPress={() => void onFamilyNote()} style={[s.btn, s.btnFam, s.flex1, !familyText.trim() && s.btnOff]} accessibilityRole="button">
                  <Text style={s.btnTxt}>{f.saveFamilyNote}</Text>
                </Pressable>
                <Pressable onPress={() => void onSendFamilyCode()} style={[s.btn, s.btnGhost, s.flex1, !familyText.trim() && s.btnOff]} accessibilityRole="button">
                  <Text style={s.btnGhostTxt}>{f.sendToPro}</Text>
                </Pressable>
              </View>
              <Text style={s.muted}>{f.familySendHelp}</Text>

              {outgoingCode && (
                <View style={s.qrBox}>
                  <Text style={s.fieldLbl}>{outgoingCode.label}</Text>
                  {outgoingCode.qrOk && <View style={s.qrWrap}><ValeriaQRCode value={outgoingCode.code} size={220} /></View>}
                  <Text style={s.qrCap}>{outgoingCode.qrOk ? f.codeReadyQr : f.codeTooLongForQr}</Text>
                  <View style={s.btnRow}>
                    <Pressable onPress={() => void Share.share({ title: f.codeShareTitle, message: `${f.codeShareIntro}\n\n${outgoingCode.code}` })} style={[s.btn, s.flex1]} accessibilityRole="button">
                      <Text style={s.btnTxt}>{f.shareCodeBtn}</Text>
                    </Pressable>
                    {!!outgoingCode.url && (
                      <Pressable onPress={() => void Share.share({ title: f.codeShareTitle, message: outgoingCode.url! })} style={[s.btn, s.btnGhost, s.flex1]} accessibilityRole="button">
                        <Text style={s.btnGhostTxt}>{f.shareLinkBtn}</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              )}

              <Text style={s.fieldLbl}>{f.importLabel}</Text>
              <TextInput value={importText} onChangeText={setImportText} placeholder={f.importPh} placeholderTextColor="#6b7280"
                style={s.input} accessibilityLabel={f.importLabel} autoCapitalize="none" autoCorrect={false} />
              <View style={s.btnRow}>
                <Pressable onPress={() => void handleIncomingRawCode(importText)} style={[s.btn, s.btnGhost, s.flex1, !importText.trim() && s.btnOff]} accessibilityRole="button">
                  <Text style={s.btnGhostTxt}>{f.importBtn}</Text>
                </Pressable>
                <Pressable onPress={() => setScanOpen(true)} style={[s.btn, s.btnGhost, s.flex1]} accessibilityRole="button">
                  <Text style={s.btnGhostTxt}>{f.scanQrBtn}</Text>
                </Pressable>
              </View>
              {!!statusBanner && (
                <View style={[s.banner, statusBanner.kind === 'ok' ? s.bannerOk : statusBanner.kind === 'warn' ? s.bannerWarn : s.bannerErr]}>
                  <Text style={statusBanner.kind === 'ok' ? s.bannerOkTxt : statusBanner.kind === 'warn' ? s.bannerWarnTxt : s.bannerErrTxt}>
                    {statusBanner.text}
                  </Text>
                </View>
              )}

              {who && (
                <View style={s.proBox}>
                  <Text style={s.fieldLbl}>{f.proNoteLabel(who.name)}</Text>
                  <TextInput value={proText} onChangeText={setProText} placeholder={f.proNotePh} placeholderTextColor="#6b7280"
                    multiline style={s.input} maxLength={2000} accessibilityLabel={f.proNoteLabel(who.name)} />
                  <View style={s.btnRow}>
                    <Pressable onPress={() => void onProNote()} style={[s.btn, s.flex1, !proText.trim() && s.btnOff]} accessibilityRole="button">
                      <Text style={s.btnTxt}>{f.saveProNote}</Text>
                    </Pressable>
                    <Pressable onPress={() => void onMakeCode()} style={[s.btn, s.btnGhost, s.flex1, !proText.trim() && s.btnOff]} accessibilityRole="button">
                      <Text style={s.btnGhostTxt}>{f.makeCode}</Text>
                    </Pressable>
                  </View>
                  <Text style={s.muted}>{f.makeCodeHelp}</Text>
                  {pendingFamily > 0 && (
                    <Pressable onPress={() => void onMarkReviewed()} style={[s.btn, s.btnGhost]} accessibilityRole="button">
                      <Text style={s.btnGhostTxt}>{f.markReviewed(pendingFamily)}</Text>
                    </Pressable>
                  )}
                  {receiptBox && (
                    <View style={s.qrBox}>
                      <Text style={s.fieldLbl}>{f.receiptReadyTitle}</Text>
                      <Text style={s.muted}>{f.receiptReadySub}</Text>
                      {receiptBox.qrOk && <View style={s.qrWrap}><ValeriaQRCode value={receiptBox.code} size={220} /></View>}
                      <Pressable onPress={() => void Share.share({ title: f.receiptReadyTitle, message: receiptBox.code })} style={s.btn} accessibilityRole="button">
                        <Text style={s.btnTxt}>{f.shareCodeBtn}</Text>
                      </Pressable>
                    </View>
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
                <Pressable onPress={() => void onSavePlan()} style={s.btn} accessibilityRole="button"><Text style={s.btnTxt}>{f.savePlan}</Text></Pressable>
              )}
            </Reanimated.View>

            {/* 4 · OTROS CENTROS (consentimiento explícito + notas familia opcionales) */}
            <Reanimated.View entering={enterAt(3)} style={s.card}>
              <CardHead icon="family" title={f.shareTitle} />
              <Text style={s.muted}>{f.shareSub}</Text>
              <View style={s.consentRow}>
                <Text style={s.consentLbl}>{f.consentLabel}</Text>
                <Switch value={consent.granted} onValueChange={(v) => void onConsent(v)} accessibilityLabel={f.consentLabel}
                  trackColor={{ false: '#d1d5db', true: DONE }} thumbColor="#ffffff" />
              </View>
              <Text style={s.signed}>{consent.granted ? f.consentOn(fmt(consent.at)) : consent.at ? f.consentRevoked(fmt(consent.at)) : f.consentOff}</Text>
              <Text style={s.muted}>{f.revokeNote}</Text>
              {consent.granted && (
                <>
                  <View style={s.consentRow}>
                    <Text style={s.consentLbl}>{f.includeFamilyNotes}</Text>
                    <Switch value={includeFamilyNotes} onValueChange={setIncludeFamilyNotes} accessibilityLabel={f.includeFamilyNotes}
                      trackColor={{ false: '#d1d5db', true: FAMILY }} thumbColor="#ffffff" />
                  </View>
                  <Text style={s.muted}>{f.includeFamilyWarn}</Text>
                  <View style={s.qrWrap}><ValeriaQRCode value={qrText} size={200} /></View>
                  <Text style={s.qrCap}>{f.qrCaption}</Text>
                  <Pressable onPress={() => void onShare()} style={s.btn} accessibilityRole="button"><Text style={s.btnTxt}>{f.shareBtn}</Text></Pressable>
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
                    <Text style={s.signed}>{f.roles[p.role]}{p.centre ? ` · ${p.centre}` : ''}{p.postReset ? ` · ${f.postResetTag}` : ''}</Text>
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
                  <Pressable onPress={() => void onAddPro()} style={s.btn} accessibilityRole="button"><Text style={s.btnTxt}>{f.addProBtn}</Text></Pressable>
                </View>
              )}
              {!who && pros.length > 0 && (
                <Pressable onPress={onForgot} style={s.linkBtn} accessibilityRole="button"><Text style={s.linkTxt}>{f.forgotPin}</Text></Pressable>
              )}
            </Reanimated.View>

            {/* 6 · COPIA CIFRADA .valeria */}
            {importExportCard}
          </>
        )}
      </ScrollView>

      <ProPinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        subtitle={f.pinSubtitle}
        onUnlock={() => { setPinOpen(false); setUnlocked(true); void reload(); }}
      />

      <ValeriaQrScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScanned={(code) => {
          setScanOpen(false);
          setImportText(code);
          void handleIncomingRawCode(code);
        }}
      />
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
  linkBox: { backgroundColor: '#f5fbfa', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#d9eeec', gap: 6 },
  qrBox: { backgroundColor: '#f8faf9', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#e2e8e6', gap: 8, marginTop: 4 },
  banner: { borderRadius: 12, padding: 10, borderWidth: 1 },
  bannerOk: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  bannerOkTxt: { fontFamily: FONT.bodyBlack, fontSize: 13, color: '#065f46' },
  bannerWarn: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  bannerWarnTxt: { fontFamily: FONT.bodyBlack, fontSize: 13, color: '#92400e' },
  bannerErr: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  bannerErrTxt: { fontFamily: FONT.bodyBlack, fontSize: 13, color: '#991b1b' },
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

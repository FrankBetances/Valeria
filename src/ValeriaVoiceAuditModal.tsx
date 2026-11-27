// ============================================================================
// Valeria+ · Auditoría del banco de voz (P6.1 · detrás del PIN profesional)
// Lista locuciones de buildVoiceCorpus() por idioma y estilo, reproduce con
// playVoiceAsset (o síntesis del sistema) y permite marcarlas con motivo y
// exportar «id · texto · motivo» como texto plano.
// ============================================================================
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { BlockIcon } from './ValeriaBlockIcons';
import { useT } from './i18n';
import { buildVoiceCorpus } from './valeriaVoiceCorpus';

type CorpusEntry = ReturnType<typeof buildVoiceCorpus>[number];
type CorpusLang = CorpusEntry['lang'];
import { voiceAsset, voiceAssetDuration } from './valeriaVoiceAssets';
import { playVoiceAsset, stopVoiceAsset } from './valeriaVoicePlayback';
import { speakToChild, speakWordSlow, stopSpeaking } from './valeriaVoice';
import { readEncryptedJSON, writeEncryptedJSON } from './valeriaCrypto';
import { V } from './valeriaTheme';
import { FONT } from './ui/fonts';

const MARKS_KEY = '@valeria_voice_audit_marks_v1';

interface AuditMark {
  id: string;
  text: string;
  reason: string;
}

const LANGS: CorpusLang[] = ['es', 'gl', 'eu', 'en', 'ca', 'es-DO'];
const STYLES: Array<'all' | 'child' | 'tutor' | 'slow'> = ['all', 'child', 'tutor', 'slow'];
const PAGE_SIZE = 50;

export const ValeriaVoiceAuditModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const t = useT();
  const [lang, setLang] = useState<CorpusLang>('es');
  const [style, setStyle] = useState<'all' | 'child' | 'tutor' | 'slow'>('all');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [marks, setMarks] = useState<Record<string, AuditMark>>({});
  const [pickingFor, setPickingFor] = useState<CorpusEntry | null>(null);

  const corpus = useMemo(() => (open ? buildVoiceCorpus() : []), [open]);

  useEffect(() => {
    if (!open) {
      stopVoiceAsset();
      stopSpeaking();
      setPickingFor(null);
      return;
    }
    void readEncryptedJSON<Record<string, AuditMark>>(MARKS_KEY).then((m) => {
      if (m && typeof m === 'object') setMarks(m);
    });
  }, [open]);

  useEffect(() => () => {
    stopVoiceAsset();
    stopSpeaking();
  }, []);

  const filtered = useMemo(
    () => corpus.filter((e) => e.lang === lang && (style === 'all' || e.style === style)),
    [corpus, lang, style],
  );
  const visible = useMemo(() => filtered.slice(0, limit), [filtered, limit]);

  const reasonOptions = [
    t.voiceAudit.reasons.pronunciation,
    t.voiceAudit.reasons.volume,
    t.voiceAudit.reasons.cut,
    t.voiceAudit.reasons.tone,
  ];

  const playEntry = (e: CorpusEntry) => {
    stopSpeaking();
    stopVoiceAsset();
    const src = voiceAsset(e.id);
    if (src !== undefined) {
      const durationSec = typeof voiceAssetDuration === 'function' ? voiceAssetDuration(e.id) : undefined;
      if (playVoiceAsset(src, { durationSec })) return;
    }
    if (e.style === 'slow') speakWordSlow(e.text);
    else speakToChild(e.text);
  };

  const toggleMark = async (e: CorpusEntry, reason: string) => {
    const next = { ...marks, [e.id]: { id: e.id, text: e.text, reason } };
    setMarks(next);
    setPickingFor(null);
    await writeEncryptedJSON(MARKS_KEY, next);
  };

  const unmark = async (id: string) => {
    const next = { ...marks };
    delete next[id];
    setMarks(next);
    await writeEncryptedJSON(MARKS_KEY, next);
  };

  const exportMarks = async () => {
    const list = Object.values(marks);
    const body = list.length
      ? list.map((m) => `${m.id} · ${m.text} · ${m.reason}`).join('\n')
      : t.voiceAudit.noMarks;
    try {
      await Share.share({ title: t.voiceAudit.title, message: body });
    } catch { /* cancelled */ }
  };

  const markCount = Object.keys(marks).length;

  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <View style={s.header}>
          <View style={s.headLeft}>
            <Text style={s.kicker}>{t.voiceAudit.kicker}</Text>
            <Text style={s.title}>{t.voiceAudit.title}</Text>
          </View>
          <Pressable onPress={onClose} style={s.closeBtn} accessibilityRole="button" accessibilityLabel={t.common.back}>
            <BlockIcon name="cross" color={V.color.textPrimary} size={20} />
          </Pressable>
        </View>

        <View style={s.toolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            {LANGS.map((l) => (
              <Pressable
                key={l}
                onPress={() => { setLang(l); setLimit(PAGE_SIZE); }}
                style={[s.chip, lang === l && s.chipOn]}
                accessibilityRole="button"
              >
                <Text style={[s.chipTxt, lang === l && s.chipTxtOn]}>{l}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            {STYLES.map((st) => (
              <Pressable
                key={st}
                onPress={() => { setStyle(st); setLimit(PAGE_SIZE); }}
                style={[s.chip, style === st && s.chipOn]}
                accessibilityRole="button"
              >
                <Text style={[s.chipTxt, style === st && s.chipTxtOn]}>{st}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={s.exportRow}>
            <Text style={s.meta}>{`${filtered.length} · ${t.voiceAudit.markedBadge(markCount)}`}</Text>
            <Pressable
              onPress={() => { void exportMarks(); }}
              style={s.exportBtn}
              accessibilityRole="button"
              accessibilityLabel={t.voiceAudit.exportMarksBtn}
            >
              <Text style={s.exportBtnTxt}>{t.voiceAudit.exportMarksBtn}</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
          {visible.map((e) => {
            const marked = marks[e.id];
            const hasAsset = voiceAsset(e.id) !== undefined;
            return (
              <View key={e.id} style={[s.row, marked && s.rowMarked]}>
                <View style={s.rowBody}>
                  <Text style={s.rowId}>{`${e.id} · ${e.style} · ${hasAsset ? 'M4A' : 'TTS'}`}</Text>
                  <Text style={s.rowTxt}>{e.text}</Text>
                  {marked && <Text style={s.reasonTag}>{marked.reason}</Text>}
                </View>
                <View style={s.rowActions}>
                  <Pressable onPress={() => playEntry(e)} style={s.actBtn} accessibilityRole="button" accessibilityLabel={t.voiceAudit.playBtn}>
                    <Text style={s.actTxt}>{t.voiceAudit.playBtn}</Text>
                  </Pressable>
                  {marked ? (
                    <Pressable onPress={() => { void unmark(e.id); }} style={[s.actBtn, s.unmarkBtn]} accessibilityRole="button">
                      <Text style={s.unmarkTxt}>{t.voiceAudit.unmarkBtn}</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => setPickingFor(e)} style={[s.actBtn, s.markBtn]} accessibilityRole="button">
                      <Text style={s.markTxt}>{t.voiceAudit.markBtn}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
          {visible.length < filtered.length && (
            <Pressable onPress={() => setLimit((n) => n + PAGE_SIZE)} style={s.moreBtn} accessibilityRole="button">
              <Text style={s.moreTxt}>{`+ ${Math.min(PAGE_SIZE, filtered.length - visible.length)}`}</Text>
            </Pressable>
          )}
        </ScrollView>

        <Modal visible={Boolean(pickingFor)} transparent animationType="fade" onRequestClose={() => setPickingFor(null)}>
          <View style={s.pickOverlay}>
            <View style={s.pickCard}>
              <Text style={s.pickTitle}>{t.voiceAudit.reasonTitle}</Text>
              {pickingFor && <Text style={s.pickSub}>{`${pickingFor.id} · ${pickingFor.text}`}</Text>}
              {reasonOptions.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => { if (pickingFor) void toggleMark(pickingFor, r); }}
                  style={s.reasonBtn}
                  accessibilityRole="button"
                >
                  <Text style={s.reasonTxt}>{r}</Text>
                </Pressable>
              ))}
              <Pressable onPress={() => setPickingFor(null)} style={s.cancelBtn} accessibilityRole="button">
                <Text style={s.cancelTxt}>{t.common.back}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6FAFA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: V.color.primary, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14,
  },
  headLeft: { flexShrink: 1 },
  kicker: { fontFamily: FONT.bodyBold, fontSize: 11, color: '#E0F7F6', textTransform: 'uppercase' },
  title: { fontFamily: FONT.display, fontSize: 22, color: '#FFFFFF' },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  toolbar: { padding: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 8 },
  chips: { gap: 8, paddingVertical: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#F1F5F9' },
  chipOn: { backgroundColor: V.color.primaryDark },
  chipTxt: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.textSecondary },
  chipTxtOn: { color: '#FFFFFF' },
  exportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  meta: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.textSecondary },
  exportBtn: { backgroundColor: V.color.primaryDark, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  exportBtnTxt: { fontFamily: FONT.bodyBold, fontSize: 13, color: '#FFFFFF' },
  list: { padding: 12, gap: 10 },
  row: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  rowMarked: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  rowBody: { flex: 1 },
  rowId: { fontFamily: FONT.bodyBold, fontSize: 11, color: V.color.textSecondary },
  rowTxt: { fontFamily: FONT.body, fontSize: 14, color: V.color.textPrimary, marginTop: 2 },
  reasonTag: { fontFamily: FONT.bodyBold, fontSize: 12, color: '#B45309', marginTop: 4 },
  rowActions: { gap: 6, alignItems: 'flex-end' },
  actBtn: { backgroundColor: '#E6F9F8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  actTxt: { fontFamily: FONT.bodyBold, fontSize: 12, color: V.color.primaryDark },
  markBtn: { backgroundColor: '#FEF3C7' },
  markTxt: { fontFamily: FONT.bodyBold, fontSize: 12, color: '#92400E' },
  unmarkBtn: { backgroundColor: '#FEE2E2' },
  unmarkTxt: { fontFamily: FONT.bodyBold, fontSize: 12, color: '#991B1B' },
  moreBtn: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#E2E8F0', borderRadius: 14 },
  moreTxt: { fontFamily: FONT.bodyBold, fontSize: 14, color: V.color.textPrimary },
  pickOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  pickCard: { width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, gap: 10 },
  pickTitle: { fontFamily: FONT.bodyBlack, fontSize: 17, color: V.color.textPrimary },
  pickSub: { fontFamily: FONT.body, fontSize: 13, color: V.color.textSecondary },
  reasonBtn: { backgroundColor: '#F1F5F9', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12 },
  reasonTxt: { fontFamily: FONT.bodyBold, fontSize: 14, color: V.color.textPrimary },
  cancelBtn: { alignSelf: 'center', paddingVertical: 8 },
  cancelTxt: { fontFamily: FONT.bodyBold, fontSize: 14, color: V.color.textSecondary },
});

export default ValeriaVoiceAuditModal;

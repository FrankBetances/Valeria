// ============================================================================
// Valeria+ · Exportación dual del log del piloto (Modo Profesional) — V1.0
// Al desbloquear el Modo Profesional (PIN 1985) se empaqueta el log y se fuerzan
// DOS salidas simultáneas:
//   · Offline puro  → código QR con el RESUMEN estadístico comprimido (abandonos,
//                     misclicks y media Likert), legible por cámaras móviles.
//   · ShareSheet    → ACTION_SEND nativo con el log transaccional COMPLETO en
//                     crudo (email/WhatsApp) para cuando haya conectividad.
// El log SOLO se purga tras una exportación (ShareSheet) exitosa.
// ============================================================================
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Share, ScrollView } from 'react-native';
import { V } from './valeriaTheme';
import { ValeriaQRCode } from './ValeriaQRCode';
import { buildExport, purgeAfterExport, ExportBundle } from './valeriaTelemetry';

export const ValeriaProExportModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [bundle, setBundle] = useState<ExportBundle | null>(null);
  const [purged, setPurged] = useState(false);
  const [sharedOnce, setSharedOnce] = useState(false);
  const [note, setNote] = useState('');

  // Al abrir: empaqueta el log y lanza la ShareSheet una vez (salidas simultáneas
  // con el QR ya visible en pantalla).
  useEffect(() => {
    if (!open) { setBundle(null); setPurged(false); setSharedOnce(false); setNote(''); return; }
    let alive = true;
    (async () => {
      const b = await buildExport();
      if (!alive) return;
      setBundle(b);
      if (!sharedOnce) { setSharedOnce(true); void doShare(b); }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const doShare = async (b: ExportBundle) => {
    try {
      const res = await Share.share({
        title: 'Log de usabilidad · Valeria+ (piloto)',
        message: b.fullLog, // ACTION_SEND: log transaccional completo en crudo
      });
      if (res.action === Share.sharedAction) {
        await purgeAfterExport(); // purga SOLO tras exportación exitosa
        setPurged(true);
        setNote('Log exportado y purgado del dispositivo.');
      } else {
        setNote('Exportación cancelada · el log se conserva para reintentar.');
      }
    } catch (e) {
      setNote('No se pudo abrir el menú de compartir · el log se conserva.');
    }
  };

  if (!open) return null;

  return (
    <View style={s.overlay}>
      <View style={s.modal}>
        <View style={s.head}>
          <Text style={s.kicker}>🔓 MODO PROFESIONAL · EXPORTACIÓN</Text>
          <Pressable onPress={onClose} style={s.close}><Text style={s.closeTxt}>✕</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 6 }} showsVerticalScrollIndicator={false}>
          <Text style={s.title}>Evidencia de usabilidad</Text>
          <Text style={s.sub}>Escanea el QR para el resumen offline o comparte el log completo cuando haya conexión.</Text>

          {bundle ? (
            <>
              {/* Offline puro: QR con el resumen estadístico comprimido */}
              <ValeriaQRCode value={bundle.qrPayload} size={216} />
              <Text style={s.qrCaption}>Resumen offline · escaneable con la cámara</Text>

              <View style={s.stats}>
                <Stat label="Sesiones" value={String(bundle.summary.sessions)} />
                <Stat label="Abandono TPR" value={`${Math.round(bundle.summary.abandonRate * 100)}%`} />
                <Stat label="Misclicks" value={String(bundle.summary.misclicks)} />
                <Stat label="Media SUS" value={bundle.summary.likertMean != null ? `${bundle.summary.likertMean}/5` : '—'} />
                <Stat label="Respuestas SUS" value={String(bundle.summary.likertN)} />
                <Stat label="4 bloques" value={String(bundle.summary.fullBlockRuns)} />
              </View>

              {/* ShareSheet: log transaccional completo en crudo */}
              <Pressable onPress={() => doShare(bundle)} style={s.shareBtn} accessibilityRole="button">
                <Text style={s.shareBtnTxt}>📤 Compartir log completo (email · WhatsApp)</Text>
              </Pressable>
              {!!note && <Text style={[s.note, purged && s.notePurged]}>{note}</Text>}
            </>
          ) : (
            <Text style={s.loading}>Empaquetando log…</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={s.stat}>
    <Text style={s.statValue}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);

const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11,18,32,.6)', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 30 },
  modal: { width: '100%', maxWidth: 360, maxHeight: '90%', backgroundColor: '#fff', borderRadius: 24, padding: 20 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, color: V.color.primaryDark },
  close: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f1f5f4', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: '#6b7280', fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '800', color: V.color.textPrimary, marginTop: 4, alignSelf: 'flex-start' },
  sub: { fontSize: 12.5, fontWeight: '600', color: V.color.textMuted, marginTop: 4, marginBottom: 16, lineHeight: 17, alignSelf: 'flex-start' },
  qrCaption: { fontSize: 11.5, fontWeight: '700', color: V.color.textMuted, marginTop: 10 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, alignSelf: 'stretch', justifyContent: 'space-between' },
  stat: { width: '31%', backgroundColor: V.color.pageBg, borderWidth: 1, borderColor: V.color.border, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  statValue: { fontSize: 17, fontWeight: '800', color: V.color.textPrimary },
  statLabel: { fontSize: 10, fontWeight: '700', color: V.color.textMuted, marginTop: 2, textAlign: 'center' },
  shareBtn: { alignSelf: 'stretch', backgroundColor: V.color.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 18, ...V.shadow.button },
  shareBtnTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  note: { fontSize: 12, fontWeight: '700', color: V.color.textMuted, marginTop: 12, textAlign: 'center' },
  notePurged: { color: V.color.primaryDark },
  loading: { fontSize: 13, fontWeight: '700', color: V.color.textMuted, paddingVertical: 40 },
});

export default ValeriaProExportModal;

// ============================================================================
// Valeria+ · Escáner QR de seguimiento con expo-camera (P3.5)
// Solo abre la cámara mientras el modal está abierto y con permiso explícito.
// ============================================================================
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { BottomSheet } from 'heroui-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { V } from './valeriaTheme';
import { BlockIcon } from './ValeriaBlockIcons';
import { useT } from './i18n';
import { FONT } from './ui/fonts';

const INK = '#00756f';

export const ValeriaQrScanModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onScanned: (data: string) => void;
}> = ({ open, onClose, onScanned }) => {
  const t = useT();
  const f = t.followUp;
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

  useEffect(() => {
    if (open) scannedRef.current = false;
  }, [open]);

  const handleBarcode = ({ data }: { data?: string }) => {
    if (!open || scannedRef.current || !data) return;
    scannedRef.current = true;
    onScanned(data);
  };

  return (
    <BottomSheet isOpen={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content>
          <View style={s.modal}>
            <View style={s.head}>
              <Text style={s.title}>{f.scanQrTitle}</Text>
              <Pressable onPress={onClose} style={s.close} accessibilityRole="button" accessibilityLabel={t.common.close}>
                <BlockIcon name="cross" color="#6b7280" size={15} />
              </Pressable>
            </View>
            <Text style={s.sub}>{f.scanQrSub}</Text>

            {Platform.OS === 'web' ? (
              <View style={s.box}>
                <BlockIcon name="info" color={INK} size={24} />
                <Text style={s.msg}>{f.scanQrWebHint}</Text>
              </View>
            ) : !permission?.granted ? (
              <View style={s.box}>
                <Text style={s.msg}>{f.scanQrNeedPerm}</Text>
                <Pressable onPress={() => void requestPermission()} style={s.btn} accessibilityRole="button">
                  <Text style={s.btnTxt}>{f.scanQrGrantPerm}</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.camWrap}>
                <CameraView
                  style={s.cam}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={handleBarcode}
                />
              </View>
            )}
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
};

const s = StyleSheet.create({
  modal: { width: '100%', backgroundColor: '#fff', padding: 20, gap: 10 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: FONT.display, fontSize: 19, color: V.color.textPrimary },
  close: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f4', alignItems: 'center', justifyContent: 'center' },
  sub: { fontFamily: FONT.bodyBold, fontSize: 13, color: V.color.textSecondary, lineHeight: 18 },
  box: { backgroundColor: '#f4faf9', borderRadius: 14, padding: 16, alignItems: 'center', gap: 10 },
  msg: { fontFamily: FONT.bodyBold, fontSize: 13.5, color: V.color.textPrimary, textAlign: 'center', lineHeight: 19 },
  btn: { backgroundColor: INK, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 16 },
  btnTxt: { fontFamily: FONT.bodyBlack, fontSize: 14, color: '#fff' },
  camWrap: { height: 280, borderRadius: 16, overflow: 'hidden', backgroundColor: '#0b1220' },
  cam: { flex: 1 },
});

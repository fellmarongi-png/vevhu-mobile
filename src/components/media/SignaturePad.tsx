import { useRef, useState } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SignatureCanvas from "react-native-signature-canvas";
import { COLORS } from "../../config/app";

interface SignaturePadProps {
  onSignature: (base64: string) => void;
}

export function SignaturePad({ onSignature }: SignaturePadProps) {
  const ref = useRef<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleOK = (signature: string) => {
    setSignatureImage(signature);
    onSignature(signature);
    setModalVisible(false);
  };

  const handleClear = () => {
    ref.current?.clearSignature();
  };

  const handleConfirmSave = () => {
    ref.current?.readSignature();
  };

  const handleRemoveSignature = () => {
    setSignatureImage(null);
    onSignature("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Resident Signature</Text>

      {/* State 1: Signature already captured - Display Preview Thumbnail */}
      {signatureImage ? (
        <View style={styles.previewCard}>
          <Image
            source={{ uri: signatureImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.resignBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.resignBtnText}>✍️ Re-sign</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={handleRemoveSignature}>
              <Text style={styles.removeBtnText}>🗑️ Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* State 2: No Signature yet - Display Open Modal Trigger Button */
        <TouchableOpacity style={styles.openModalBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.openModalBtnText}>✍️ Tap to Sign Document</Text>
        </TouchableOpacity>
      )}

      {/* State 3: Full-Screen Modal Signature Mode (Prevents screen fidgeting/scrolling & respects safe areas) */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="fullScreen">
        <View style={[styles.modalSafeArea, { paddingTop: insets.top || 16 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Resident Signature</Text>
            <Text style={styles.modalSubtitle}>
              Please ask the resident to sign clearly inside the box using their finger.
            </Text>
          </View>

          <View style={styles.canvasWrapper}>
            <SignatureCanvas
              ref={ref}
              onOK={handleOK}
              webStyle={`
                .m-signature-pad { box-shadow: none; border: none; height: 100%; width: 100%; } 
                .m-signature-pad--body { border: 2px dashed #b0bec5; border-radius: 12px; background-color: #fafafa; } 
                .m-signature-pad--footer { display: none; }
              `}
              style={styles.canvas}
            />
          </View>

          <View style={[styles.modalFooter, { paddingBottom: (insets.bottom || 16) + 12 }]}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>🧹 Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleConfirmSave}>
              <Text style={styles.saveBtnText}>✅ Confirm & Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.gray700, marginBottom: 8 },

  openModalBtn: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  openModalBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: "600" },

  previewCard: {
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewImage: {
    height: 120,
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    marginBottom: 10,
  },
  previewActions: { flexDirection: "row", gap: 10 },
  resignBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
  },
  resignBtnText: { color: COLORS.primaryForeground, fontWeight: "600" },
  removeBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.errorBg,
    borderRadius: 10,
    alignItems: "center",
  },
  removeBtnText: { color: COLORS.error, fontWeight: "600" },

  modalSafeArea: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: COLORS.cardForeground, marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: COLORS.mutedForeground },

  canvasWrapper: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  canvas: { flex: 1 },

  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.background,
    gap: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  clearBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.gray200,
    flex: 1,
    alignItems: "center",
  },
  clearBtnText: { color: COLORS.gray700, fontWeight: "600" },
  cancelBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.gray100,
    flex: 1,
    alignItems: "center",
  },
  cancelBtnText: { color: COLORS.gray700, fontWeight: "600" },
  saveBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    flex: 2,
    alignItems: "center",
  },
  saveBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "700" },
});

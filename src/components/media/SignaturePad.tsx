import { useRef, useState } from "react";
import { Image, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SignatureCanvas from "react-native-signature-canvas";

interface SignaturePadProps {
  onSignature: (base64: string) => void;
}

export function SignaturePad({ onSignature }: SignaturePadProps) {
  const ref = useRef<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

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
          <Image source={{ uri: signatureImage }} style={styles.previewImage} resizeMode="contain" />
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

      {/* State 3: Full-Screen Modal Signature Mode (Prevents screen fidgeting/scrolling) */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.modalSafeArea}>
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

          <View style={styles.modalFooter}>
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
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },

  openModalBtn: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#1976D2",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  openModalBtnText: { color: "#1976D2", fontSize: 16, fontWeight: "600" },

  previewCard: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  previewImage: { height: 120, width: "100%", backgroundColor: "#fff", borderRadius: 8, marginBottom: 10 },
  previewActions: { flexDirection: "row", gap: 10 },
  resignBtn: { flex: 1, padding: 10, backgroundColor: "#1976D2", borderRadius: 6, alignItems: "center" },
  resignBtnText: { color: "#fff", fontWeight: "600" },
  removeBtn: { flex: 1, padding: 10, backgroundColor: "#ffebee", borderRadius: 6, alignItems: "center" },
  removeBtnText: { color: "#c62828", fontWeight: "600" },

  modalSafeArea: { flex: 1, backgroundColor: "#1a1a2e" },
  modalHeader: { padding: 20, backgroundColor: "#1a1a2e" },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: "#b0bec5" },

  canvasWrapper: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  canvas: { flex: 1 },

  modalFooter: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#1a1a2e",
    gap: 10,
    alignItems: "center",
  },
  clearBtn: { padding: 12, borderRadius: 8, backgroundColor: "#37474f", flex: 1, alignItems: "center" },
  clearBtnText: { color: "#ffffff", fontWeight: "600" },
  cancelBtn: { padding: 12, borderRadius: 8, backgroundColor: "#455a64", flex: 1, alignItems: "center" },
  cancelBtnText: { color: "#ffffff", fontWeight: "600" },
  saveBtn: { padding: 12, borderRadius: 8, backgroundColor: "#2e7d32", flex: 2, alignItems: "center" },
  saveBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
});

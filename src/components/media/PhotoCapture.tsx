import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../config/app";

interface PhotoCaptureProps {
  photos: Array<{ uri: string; type: "stand" | "document" }>;
  onPhotosChange: (photos: Array<{ uri: string; type: "stand" | "document" }>) => void;
  minRequired?: number;
}

export function PhotoCapture({ photos, onPhotosChange, minRequired = 1 }: PhotoCaptureProps) {
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const takePhoto = async (type: "stand" | "document") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera permission is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      onPhotosChange([...photos, { uri: result.assets[0].uri, type }]);
    }
  };

  const removePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    onPhotosChange(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photos {minRequired > 0 && `(min ${minRequired} required)`}</Text>

      {photos.length > 0 && (
        <FlatList
          horizontal
          data={photos}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.photoWrapper}>
              <TouchableOpacity onPress={() => setPreviewUri(item.uri)}>
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(index)}>
                <Text style={styles.removeBtnText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.photoType}>🔍 {item.type}</Text>
            </View>
          )}
          style={styles.photoList}
        />
      )}

      {/* Lightbox Preview Modal */}
      <Modal visible={!!previewUri} animationType="fade" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>📷 Photo Inspection Preview</Text>
            {previewUri && (
              <Image
                source={{ uri: previewUri }}
                style={styles.fullPreviewImage}
                resizeMode="contain"
              />
            )}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setPreviewUri(null)}>
              <Text style={styles.closeModalBtnText}>Close Preview</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.captureBtn} onPress={() => takePhoto("stand")}>
          <Text style={styles.captureBtnText}>Stand Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.captureBtn, styles.docBtn]}
          onPress={() => takePhoto("document")}
        >
          <Text style={styles.captureBtnText}>Document Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.gray700, marginBottom: 8 },
  photoList: { marginBottom: 12 },
  photoWrapper: { marginRight: 8, position: "relative" },
  thumbnail: { width: 80, height: 80, borderRadius: 10 },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  photoType: { fontSize: 10, textAlign: "center", marginTop: 4, color: COLORS.gray600 },
  buttons: { flexDirection: "row", gap: 8 },
  captureBtn: {
    flex: 1,
    backgroundColor: COLORS.success,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  docBtn: { backgroundColor: COLORS.warning },
  captureBtnText: { color: COLORS.white, fontWeight: "600" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  modalHeader: { fontSize: 16, fontWeight: "700", color: "#1C1917", marginBottom: 12 },
  fullPreviewImage: { width: "100%", height: 300, borderRadius: 12, marginBottom: 16 },
  closeModalBtn: {
    backgroundColor: "#F3772D",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  closeModalBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
});

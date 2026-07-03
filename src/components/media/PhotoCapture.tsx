import * as ImagePicker from "expo-image-picker";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PhotoCaptureProps {
  photos: Array<{ uri: string; type: "stand" | "document" }>;
  onPhotosChange: (photos: Array<{ uri: string; type: "stand" | "document" }>) => void;
  minRequired?: number;
}

export function PhotoCapture({ photos, onPhotosChange, minRequired = 1 }: PhotoCaptureProps) {
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
              <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(index)}>
                <Text style={styles.removeBtnText}>X</Text>
              </TouchableOpacity>
              <Text style={styles.photoType}>{item.type}</Text>
            </View>
          )}
          style={styles.photoList}
        />
      )}

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
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  photoList: { marginBottom: 12 },
  photoWrapper: { marginRight: 8, position: "relative" },
  thumbnail: { width: 80, height: 80, borderRadius: 8 },
  removeBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#e53935",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  photoType: { fontSize: 10, textAlign: "center", marginTop: 4, color: "#666" },
  buttons: { flexDirection: "row", gap: 8 },
  captureBtn: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  docBtn: { backgroundColor: "#FF9800" },
  captureBtnText: { color: "#fff", fontWeight: "600" },
});

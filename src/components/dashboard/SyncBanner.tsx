// ---------------------------------------------------------------------------
// Vevhu Dashboard - Sync Status Banner
// ---------------------------------------------------------------------------

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../config/app";

interface SyncBannerProps {
  pendingCount: number;
  onSync?: () => void;
}

export function SyncBanner({ pendingCount, onSync }: SyncBannerProps) {
  if (pendingCount === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.text}>{pendingCount} items in offline sync queue</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onSync}>
        <Text style={styles.buttonText}>Sync Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.warningBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.cardForeground,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.warning,
    borderRadius: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.white,
  },
});

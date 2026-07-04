import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../config/app";

interface SyncBadgeProps {
  pendingCount: number;
  isOnline: boolean;
}

export function SyncBadge({ pendingCount, isOnline }: SyncBadgeProps) {
  if (pendingCount === 0 && isOnline) return null;

  return (
    <View style={[styles.container, isOnline ? styles.online : styles.offline]}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={styles.text}>
        {isOnline
          ? pendingCount > 0
            ? `Syncing ${pendingCount} record${pendingCount > 1 ? "s" : ""}...`
            : "All synced"
          : `Offline — ${pendingCount} pending`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginVertical: 8,
  },
  online: { backgroundColor: COLORS.successBg },
  offline: { backgroundColor: COLORS.warningBg },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  dotOnline: { backgroundColor: COLORS.success },
  dotOffline: { backgroundColor: COLORS.warning },
  text: { fontSize: 13, color: COLORS.gray700, fontWeight: "500" },
});

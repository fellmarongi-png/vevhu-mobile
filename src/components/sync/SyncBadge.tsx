import { StyleSheet, Text, View } from "react-native";

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
            ? `Syncing ${pendingCount} records...`
            : "All synced"
          : `Offline - ${pendingCount} pending`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginVertical: 8,
  },
  online: { backgroundColor: "#E8F5E9" },
  offline: { backgroundColor: "#FFF3E0" },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  dotOnline: { backgroundColor: "#4CAF50" },
  dotOffline: { backgroundColor: "#FF9800" },
  text: { fontSize: 13, color: "#333" },
});

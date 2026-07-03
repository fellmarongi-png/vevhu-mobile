import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SyncBadge } from "../../src/components/sync/SyncBadge";
import { useAuth } from "../../src/hooks/useAuth";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";

export default function HomeScreen() {
  const { user } = useAuth();
  const { isConnected } = useNetworkStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {user?.full_name || "Worker"}
      </Text>

      <SyncBadge pendingCount={0} isOnline={isConnected} />

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Today</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0/{user?.daily_target || 30}</Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0h</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.collectButton}
        onPress={() => router.push("/(worker)/collect")}
      >
        <Text style={styles.collectButtonText}>Start New Collection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  greeting: { fontSize: 22, fontWeight: "700", color: "#333", marginTop: 16 },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    elevation: 2,
  },
  statsTitle: { fontSize: 14, fontWeight: "600", color: "#666", marginBottom: 12 },
  statsRow: { flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center" },
  statNumber: { fontSize: 24, fontWeight: "700", color: "#1976D2" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  collectButton: {
    backgroundColor: "#4CAF50",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  collectButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});

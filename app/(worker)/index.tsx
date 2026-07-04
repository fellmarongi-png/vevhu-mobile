import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SyncBadge } from "../../src/components/sync/SyncBadge";
import { COLORS } from "../../src/config/app";
import { useAuth } from "../../src/hooks/useAuth";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";

export default function HomeScreen() {
  const { user } = useAuth();
  const { isConnected } = useNetworkStatus();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Good {new Date().getHours() < 12 ? "morning" : "afternoon"}, {user?.full_name || "Worker"}
        </Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>

      <SyncBadge pendingCount={0} isOnline={isConnected} />

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Today's Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>0</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>
              0/{user?.daily_target || 30}
            </Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>0h</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>
        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: "0%" }]} />
        </View>
      </View>

      {/* Quick Action */}
      <TouchableOpacity
        style={styles.collectButton}
        onPress={() => router.push("/(worker)/collect")}
      >
        <Text style={styles.collectButtonText}>Start New Collection</Text>
        <Text style={styles.collectButtonIcon}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  header: { marginTop: 8, marginBottom: 8 },
  greeting: { fontSize: 22, fontWeight: "700", color: COLORS.cardForeground },
  dateText: { fontSize: 14, color: COLORS.mutedForeground, marginTop: 2, fontWeight: "500" },
  statsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.mutedForeground,
    marginBottom: 16,
    letterSpacing: 0.8,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  statItem: { alignItems: "center", flex: 1 },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
    alignSelf: "center",
  },
  statNumber: { fontSize: 24, fontWeight: "700" },
  statLabel: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 4, fontWeight: "500" },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.secondary,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  collectButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  collectButtonText: {
    color: COLORS.primaryForeground,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  collectButtonIcon: {
    color: COLORS.primaryForeground,
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 8,
  },
});

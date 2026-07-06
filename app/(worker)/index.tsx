import { useQuery, useStatus } from "@powersync/react-native";
import { format, formatISO, startOfDay } from "date-fns";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SyncBadge } from "../../src/components/sync/SyncBadge";
import { COLORS } from "../../src/config/app";
import { useAuth } from "../../src/hooks/useAuth";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";

interface RecentSubmission {
  id: string;
  stand_number_official: string | null;
  stand_number_physical: string | null;
  respondent_name: string | null;
  status: string;
  collected_at: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { isConnected } = useNetworkStatus();
  const status = useStatus();

  const todayStart = formatISO(startOfDay(new Date()));

  const { data: todayCountRows } = useQuery<{ count: number }>(
    "SELECT COUNT(*) AS count FROM submissions WHERE collected_at >= ? OR date(collected_at) = date('now')",
    [todayStart],
  );

  const { data: pendingCountRows } = useQuery<{ count: number }>(
    "SELECT COUNT(*) AS count FROM submissions WHERE status = 'pending'",
  );

  const { data: recentSubmissions } = useQuery<RecentSubmission>(
    "SELECT id, stand_number_official, stand_number_physical, respondent_name, status, collected_at FROM submissions ORDER BY collected_at DESC LIMIT 5",
  );

  const todayCount = todayCountRows?.[0]?.count ?? 0;
  const pendingCount = pendingCountRows?.[0]?.count ?? 0;
  const target = user?.daily_target || 30;
  const progressPercent = Math.min(100, Math.round((todayCount / target) * 100));

  const isPowerSyncConnected = status?.connected || isConnected;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
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

      <SyncBadge pendingCount={pendingCount} isOnline={isPowerSyncConnected} />

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>TODAY'S FIELD PROGRESS</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>{todayCount}</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>
              {todayCount}/{target}
            </Text>
            <Text style={styles.statLabel}>Target</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>
              {pendingCount > 0 ? `${pendingCount} pending` : "Synced"}
            </Text>
            <Text style={styles.statLabel}>Sync Status</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Quick Action */}
      <TouchableOpacity
        style={styles.collectButton}
        onPress={() => router.push("/(worker)/collect")}
        activeOpacity={0.8}
      >
        <Text style={styles.collectButtonText}>📍 Start New Collection</Text>
        <Text style={styles.collectButtonIcon}>→</Text>
      </TouchableOpacity>

      {/* Recent Submissions Section */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>RECENT SUBMISSIONS</Text>
          <TouchableOpacity onPress={() => router.push("/(worker)/progress")}>
            <Text style={styles.viewAllText}>View All ({recentSubmissions?.length || 0}) →</Text>
          </TouchableOpacity>
        </View>

        {!recentSubmissions || recentSubmissions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No collections recorded yet today.</Text>
            <Text style={styles.emptySubtext}>Tap "Start New Collection" above to begin.</Text>
          </View>
        ) : (
          recentSubmissions.map((item) => {
            const standNo =
              item.stand_number_official || item.stand_number_physical || "Unnumbered";
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.recentCard}
                onPress={() => router.push("/(worker)/progress")}
                activeOpacity={0.7}
              >
                <View style={styles.recentRow}>
                  <View style={styles.standBadge}>
                    <Text style={styles.standBadgeText}>Stand #{standNo}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusDot,
                      item.status === "synced" ? styles.syncedDot : styles.pendingDot,
                    ]}
                  />
                </View>
                <View style={styles.cardDetailsRow}>
                  <Text style={styles.residentText}>
                    👤 {item.respondent_name || "Resident Recorded"}
                  </Text>
                  <Text style={styles.timeText}>
                    {item.collected_at ? format(new Date(item.collected_at), "h:mm a") : "Just now"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { padding: 20, paddingBottom: 40 },
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
    fontSize: 12,
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
  statNumber: { fontSize: 22, fontWeight: "700" },
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
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 20,
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
  },
  recentSection: { marginTop: 24 },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.mutedForeground,
    letterSpacing: 0.8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { fontSize: 14, fontWeight: "600", color: COLORS.cardForeground },
  emptySubtext: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 4 },
  recentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  standBadge: {
    backgroundColor: COLORS.brandBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  standBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  syncedDot: { backgroundColor: COLORS.success },
  pendingDot: { backgroundColor: COLORS.warning },
  cardDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  residentText: { fontSize: 14, fontWeight: "600", color: COLORS.cardForeground },
  timeText: { fontSize: 12, color: COLORS.mutedForeground },
});

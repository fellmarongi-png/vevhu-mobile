// ---------------------------------------------------------------------------
// Vevhu Field - Worker Management Screen
// ---------------------------------------------------------------------------

import { useQuery } from "@powersync/react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../src/config/app";
import type { Worker } from "../../src/types/dashboard";

interface UserRow {
  id: string;
  full_name: string;
  email: string | null;
  role: string | null;
  phone: string | null;
  zone_assigned: string | null;
  daily_target: number | null;
  is_active: number | null;
}

const FALLBACK_WORKERS: Worker[] = [
  {
    id: "1",
    name: "John Chipunza",
    email: "john@vevhu.com",
    role: "Field Agent",
    status: "active",
    todayCount: 12,
    weeklyTotal: 84,
    dailyTarget: 30,
    syncRate: 98,
    lastActive: "Just Now",
  },
  {
    id: "2",
    name: "Sarah Mnene",
    email: "sarah@vevhu.com",
    role: "Senior Agent",
    status: "active",
    todayCount: 9,
    weeklyTotal: 76,
    dailyTarget: 30,
    syncRate: 95,
    lastActive: "5m ago",
  },
  {
    id: "3",
    name: "Robert Zulu",
    email: "robert@vevhu.com",
    role: "Field Agent",
    status: "idle",
    todayCount: 4,
    weeklyTotal: 62,
    dailyTarget: 30,
    syncRate: 88,
    lastActive: "1h ago",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStatusBadge(status: Worker["status"]) {
  switch (status) {
    case "active":
      return {
        text: "Active",
        style: styles.activeBadge,
        textStyle: styles.activeText,
        dotColor: COLORS.success,
      };
    case "idle":
      return {
        text: "Idle",
        style: styles.idleBadge,
        textStyle: styles.idleText,
        dotColor: COLORS.warning,
      };
    case "offline":
      return {
        text: "Offline",
        style: styles.offlineBadge,
        textStyle: styles.offlineText,
        dotColor: COLORS.gray400,
      };
  }
}

export default function WorkersScreen() {
  const [filter, setFilter] = useState<"all" | "active" | "idle" | "offline">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: dbUsers } = useQuery<UserRow>(
    "SELECT * FROM users WHERE role = 'worker' OR role IS NULL ORDER BY full_name ASC",
  );

  const workersList: Worker[] = useMemo(() => {
    if (dbUsers && dbUsers.length > 0) {
      return dbUsers.map((u) => ({
        id: u.id,
        name: u.full_name || "Agent",
        email: u.email || `${u.full_name.toLowerCase().replace(/\s+/g, ".")}@vevhu.com`,
        role: (u.role as Worker["role"]) || "Field Agent",
        status: u.is_active === 1 ? "active" : "offline",
        todayCount: 0,
        weeklyTotal: 0,
        dailyTarget: u.daily_target || 30,
        syncRate: 100,
        lastActive: "Active today",
      }));
    }
    return FALLBACK_WORKERS;
  }, [dbUsers]);

  const filteredWorkers = useMemo(() => {
    return workersList.filter((worker) => {
      const matchesFilter = filter === "all" || worker.status === filter;
      const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [workersList, filter, searchQuery]);

  const activeCount = workersList.filter((w) => w.status === "active").length;
  const idleCount = workersList.filter((w) => w.status === "idle").length;
  const offlineCount = workersList.filter((w) => w.status === "offline").length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Worker Management</Text>
        <Text style={styles.subtitle}>{workersList.length} total workers</Text>
      </View>

      {/* Summary Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.success }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.warning }]}>{idleCount}</Text>
          <Text style={styles.statLabel}>Idle</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: COLORS.gray500 }]}>{offlineCount}</Text>
          <Text style={styles.statLabel}>Offline</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search workers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray400}
          />
        </View>

        <View style={styles.filterRow}>
          {(["all", "active", "idle", "offline"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Worker List (Clean FlatList without outer ScrollView) */}
      <FlatList
        data={filteredWorkers}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        renderItem={({ item }) => {
          const status = getStatusBadge(item.status);
          return (
            <TouchableOpacity style={styles.workerCard} activeOpacity={0.7}>
              <View style={styles.workerHeader}>
                <View style={styles.workerAvatar}>
                  <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                </View>
                <View style={styles.workerInfo}>
                  <Text style={styles.workerName}>{item.name}</Text>
                  <Text style={styles.workerRole}>{item.role}</Text>
                </View>
                <View style={[styles.statusBadge, status.style]}>
                  <View style={[styles.statusDot, { backgroundColor: status.dotColor }]} />
                  <Text style={[styles.statusText, status.textStyle]}>{status.text}</Text>
                </View>
              </View>

              <View style={styles.workerStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{item.todayCount}</Text>
                  <Text style={styles.statLabel}>Today</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{item.weeklyTotal}</Text>
                  <Text style={styles.statLabel}>Weekly</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{item.syncRate}%</Text>
                  <Text style={styles.statLabel}>Sync Rate</Text>
                </View>
              </View>

              <View style={styles.workerFooter}>
                <Text style={styles.lastActive}>Last active: {item.lastActive}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.cardForeground },
  subtitle: { fontSize: 14, color: COLORS.mutedForeground, marginTop: 2 },
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 4 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 14 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.cardForeground },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.gray600, fontWeight: "500" },
  filterChipTextActive: { color: COLORS.white },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  workerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  workerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "700", color: COLORS.primary },
  workerInfo: { flex: 1, marginLeft: 12 },
  workerName: { fontSize: 16, fontWeight: "700", color: COLORS.cardForeground },
  workerRole: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 2 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeBadge: { backgroundColor: COLORS.successBg },
  activeText: { color: COLORS.success, fontSize: 11, fontWeight: "700" },
  idleBadge: { backgroundColor: COLORS.warningBg },
  idleText: { color: COLORS.warning, fontSize: 11, fontWeight: "700" },
  offlineBadge: { backgroundColor: COLORS.gray100 },
  offlineText: { color: COLORS.gray500, fontSize: 11, fontWeight: "700" },
  statusText: { fontSize: 11, fontWeight: "700" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  workerStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "700", color: COLORS.cardForeground },
  statDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
  workerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  lastActive: { fontSize: 12, color: COLORS.mutedForeground },
});

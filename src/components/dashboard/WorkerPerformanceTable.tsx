// ---------------------------------------------------------------------------
// Vevhu Dashboard - Worker Performance Table
// ---------------------------------------------------------------------------

import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../config/app";
import type { Worker } from "../../types/dashboard";

interface WorkerPerformanceTableProps {
  workers: Worker[];
  onViewAll?: () => void;
}

function getStatusBadge(status: Worker["status"]) {
  switch (status) {
    case "active":
      return { text: "Active", style: styles.activeBadge, textStyle: styles.activeText };
    case "idle":
      return { text: "Idle", style: styles.idleBadge, textStyle: styles.idleText };
    case "offline":
      return { text: "Offline", style: styles.offlineBadge, textStyle: styles.offlineText };
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function WorkerPerformanceTable({ workers, onViewAll }: WorkerPerformanceTableProps) {
  const renderItem = ({ item }: { item: Worker }) => {
    const status = getStatusBadge(item.status);

    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.7}>
        <View style={styles.workerCell}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
          <Text style={styles.workerName}>{item.name}</Text>
        </View>
        <Text style={styles.cell}>{item.todayCount}</Text>
        <Text style={styles.cell}>{item.weeklyTotal}</Text>
        <View style={[styles.statusBadge, status.style]}>
          <Text style={[styles.statusText, status.textStyle]}>{status.text}</Text>
        </View>
        <Text style={[styles.cell, styles.rightText]}>{item.lastActive}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Worker Performance</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAll}>View All Workers</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={workers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.cardForeground,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  workerCell: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  workerName: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.cardForeground,
  },
  cell: {
    fontSize: 14,
    color: COLORS.gray600,
    paddingHorizontal: 8,
  },
  rightText: {
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: COLORS.successBg,
  },
  activeText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "700",
  },
  idleBadge: {
    backgroundColor: COLORS.warningBg,
  },
  idleText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: "700",
  },
  offlineBadge: {
    backgroundColor: COLORS.gray100,
  },
  offlineText: {
    color: COLORS.gray500,
    fontSize: 11,
    fontWeight: "700",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
});

// ---------------------------------------------------------------------------
// Vevhu Dashboard - Activity Timeline
// ---------------------------------------------------------------------------

import { FlatList, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../config/app";
import type { ActivityItem } from "../../types/dashboard";

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const renderItem = ({ item }: { item: ActivityItem }) => (
    <View style={styles.timelineItem}>
      <View style={styles.dotContainer}>
        <View style={[styles.dot, { backgroundColor: item.color }]} />
      </View>
      <View style={styles.content}>
        <Text style={styles.activityText}>
          <Text style={styles.bold}>{item.workerName}</Text> {item.action}{" "}
          <Text style={styles.mono}>{item.standNumber}</Text>
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Timeline</Text>
      </View>
      <FlatList
        data={activities}
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
  timelineItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dotContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.card,
  },
  content: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.cardForeground,
    lineHeight: 20,
  },
  bold: {
    fontWeight: "700",
  },
  mono: {
    fontFamily: "monospace",
    color: COLORS.primary,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    textTransform: "uppercase",
    marginTop: 2,
  },
});

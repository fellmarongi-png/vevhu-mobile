// ---------------------------------------------------------------------------
// Vevhu Dashboard - KPI Metric Card
// ---------------------------------------------------------------------------

import { StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../config/app";
import type { KPI } from "../../types/dashboard";

interface KPICardProps {
  kpi: KPI;
  onPress?: () => void;
}

export function KPICard({ kpi, onPress }: KPICardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{kpi.label}</Text>
        {kpi.trend && (
          <View style={[styles.trendBadge, kpi.trendUp ? styles.trendUp : styles.trendDown]}>
            <Text
              style={[styles.trendText, kpi.trendUp ? styles.trendUpText : styles.trendDownText]}
            >
              {kpi.trendUp ? "↑" : "↓"} {kpi.trend}
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{kpi.value}</Text>
      {kpi.icon && <Text style={styles.icon}>{kpi.icon}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    fontWeight: "500",
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendUp: {
    backgroundColor: COLORS.successBg,
  },
  trendDown: {
    backgroundColor: COLORS.errorBg,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "700",
  },
  trendUpText: {
    color: COLORS.success,
  },
  trendDownText: {
    color: COLORS.error,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.cardForeground,
  },
  icon: {
    position: "absolute",
    top: 12,
    right: 12,
    fontSize: 20,
    opacity: 0.3,
  },
});

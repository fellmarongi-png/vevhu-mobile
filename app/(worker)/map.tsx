// ---------------------------------------------------------------------------
// Vevhu Field - Map View Screen
// ---------------------------------------------------------------------------

import { useQuery } from "@powersync/react-native";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../src/config/app";

interface SubmissionRow {
  id: string;
  stand_number_official: string | null;
  stand_number_physical: string | null;
  respondent_name: string | null;
  status: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
}

interface MapMarker {
  id: string;
  type: "submission" | "worker";
  name: string;
  standNumber: string;
  status: string;
  latitude?: number;
  longitude?: number;
  x: number; // grid percentage 0..100
  y: number; // grid percentage 0..100
}

const DEFAULT_MARKERS: MapMarker[] = [
  {
    id: "1",
    type: "worker",
    name: "John C.",
    standNumber: "Agent 1",
    status: "active",
    x: 25,
    y: 35,
  },
  {
    id: "2",
    type: "worker",
    name: "Sarah M.",
    standNumber: "Agent 2",
    status: "active",
    x: 50,
    y: 55,
  },
  {
    id: "3",
    type: "submission",
    name: "Kudzai Musona",
    standNumber: "841",
    status: "synced",
    x: 35,
    y: 65,
  },
  {
    id: "4",
    type: "submission",
    name: "Tafadzwa Gumbo",
    standNumber: "1202",
    status: "pending",
    x: 75,
    y: 45,
  },
];

function getMarkerColor(status: string) {
  switch (status) {
    case "active":
    case "synced":
    case "complete":
      return COLORS.success;
    case "idle":
    case "pending":
      return COLORS.warning;
    case "flagged":
      return COLORS.error;
    default:
      return COLORS.primary;
  }
}

export default function MapScreen() {
  const [selectedLayer, setSelectedLayer] = useState<"all" | "workers" | "submissions">("all");
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const { data: dbSubmissions } = useQuery<SubmissionRow>(
    "SELECT id, stand_number_official, stand_number_physical, respondent_name, status, gps_latitude, gps_longitude FROM submissions ORDER BY collected_at DESC LIMIT 50",
  );

  const markers: MapMarker[] = useMemo(() => {
    if (dbSubmissions && dbSubmissions.length > 0) {
      const dbMarkers: MapMarker[] = dbSubmissions.map((sub, idx) => {
        // Map GPS coords to approximate display grid if available
        const lat = sub.gps_latitude ?? -17.8252;
        const lng = sub.gps_longitude ?? 31.0335;
        const x = Math.min(90, Math.max(10, ((lng - 31.0) / 0.1) * 80 + 10));
        const y = Math.min(90, Math.max(10, ((-17.8 - lat) / 0.1) * 80 + 10 + (idx % 5) * 5));

        return {
          id: sub.id,
          type: "submission",
          name: sub.respondent_name || "Respondent",
          standNumber: sub.stand_number_official || sub.stand_number_physical || "Unnumbered",
          status: sub.status || "pending",
          latitude: lat,
          longitude: lng,
          x: Number.isNaN(x) ? ((20 + idx * 12) % 80) + 10 : x,
          y: Number.isNaN(y) ? ((30 + idx * 15) % 80) + 10 : y,
        };
      });
      return [...DEFAULT_MARKERS.filter((m) => m.type === "worker"), ...dbMarkers];
    }
    return DEFAULT_MARKERS;
  }, [dbSubmissions]);

  const filteredMarkers = useMemo(() => {
    return markers.filter((marker) => {
      if (selectedLayer === "workers") return marker.type === "worker";
      if (selectedLayer === "submissions") return marker.type === "submission";
      return true;
    });
  }, [markers, selectedLayer]);

  const activeWorkers = markers.filter((m) => m.type === "worker" && m.status === "active").length;
  const totalSubmissions = markers.filter((m) => m.type === "submission").length;
  const pendingSyncs = markers.filter(
    (m) => m.type === "submission" && m.status === "pending",
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Field Map ({selectedLayer.toUpperCase()})</Text>
          <Text style={styles.subtitle}>
            {activeWorkers} active workers • {totalSubmissions} stands ({pendingSyncs} pending)
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.layerButton}
            onPress={() =>
              setSelectedLayer((prev) =>
                prev === "all" ? "workers" : prev === "workers" ? "submissions" : "all",
              )
            }
          >
            <Text style={styles.layerButtonText}>🗺️ Filter ({selectedLayer})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Display Box */}
      <View style={styles.mapContainer}>
        <View style={styles.mapBackground}>
          {filteredMarkers.map((marker) => (
            <TouchableOpacity
              key={marker.id}
              style={[styles.marker, { left: `${marker.x}%`, top: `${marker.y}%` }]}
              onPress={() => setSelectedMarker(marker)}
            >
              <View
                style={[styles.markerDot, { backgroundColor: getMarkerColor(marker.status) }]}
              />
              <Text style={styles.markerLabel}>{marker.standNumber}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>Active / Synced</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.error }]} />
            <Text style={styles.legendText}>Flagged</Text>
          </View>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{markers.length}</Text>
          <Text style={styles.statLabel}>Markers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.success }]}>{activeWorkers}</Text>
          <Text style={styles.statLabel}>Active Workers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{pendingSyncs}</Text>
          <Text style={styles.statLabel}>Pending Sync</Text>
        </View>
      </View>

      {/* Selected Marker Detail Card */}
      {selectedMarker && (
        <View style={styles.markerInfo}>
          <View style={styles.markerInfoHeader}>
            <Text style={styles.markerInfoTitle}>
              {selectedMarker.type === "worker"
                ? `Worker: ${selectedMarker.name}`
                : `Stand #${selectedMarker.standNumber}`}
            </Text>
            <TouchableOpacity onPress={() => setSelectedMarker(null)}>
              <Text style={styles.markerInfoClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.markerInfoStatus}>
            Status: <Text style={{ fontWeight: "700" }}>{selectedMarker.status}</Text> • Respondent:{" "}
            {selectedMarker.name}
          </Text>
          <View style={styles.markerInfoActions}>
            <TouchableOpacity
              style={styles.markerInfoButton}
              onPress={() => {
                if (selectedMarker.type === "submission") {
                  router.push({
                    pathname: "/(worker)/submission-detail" as any,
                    params: { id: selectedMarker.id },
                  });
                } else {
                  router.push("/(worker)/workers" as any);
                }
              }}
            >
              <Text style={styles.markerInfoButtonText}>View Full Details →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.cardForeground },
  subtitle: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  layerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  layerButtonText: { fontSize: 12, fontWeight: "600", color: COLORS.cardForeground },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapBackground: { flex: 1, backgroundColor: COLORS.gray50, position: "relative" },
  marker: { position: "absolute", alignItems: "center", transform: [{ translateX: -10 }] },
  markerDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.white },
  markerLabel: { fontSize: 10, fontWeight: "600", color: COLORS.gray700, marginTop: 2 },
  legend: {
    position: "absolute",
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: COLORS.cardForeground },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.cardForeground },
  statLabel: { fontSize: 11, color: COLORS.mutedForeground, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
  markerInfo: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  markerInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  markerInfoTitle: { fontSize: 16, fontWeight: "700", color: COLORS.cardForeground },
  markerInfoClose: { fontSize: 16, color: COLORS.gray500 },
  markerInfoStatus: { fontSize: 13, color: COLORS.mutedForeground, marginBottom: 12 },
  markerInfoActions: { flexDirection: "row", gap: 8 },
  markerInfoButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  markerInfoButtonText: { fontSize: 13, fontWeight: "600", color: COLORS.white },
});

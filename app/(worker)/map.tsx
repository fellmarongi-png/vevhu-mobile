// ---------------------------------------------------------------------------
// Vevhu Field - Map View Screen
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../src/config/app";

const { width } = Dimensions.get("window");

// Mock data
const mockMarkers = [
  { id: "1", type: "worker", name: "John C.", status: "active", x: 20, y: 30 },
  { id: "2", type: "worker", name: "Sarah M.", status: "active", x: 45, y: 50 },
  { id: "3", type: "worker", name: "Robert Z.", status: "idle", x: 70, y: 25 },
  { id: "4", type: "submission", standNumber: "841", status: "synced", x: 35, y: 65 },
  { id: "5", type: "submission", standNumber: "1202", status: "synced", x: 60, y: 70 },
  { id: "6", type: "submission", standNumber: "33", status: "pending", x: 80, y: 55 },
];

function getMarkerColor(status: string) {
  switch (status) {
    case "active":
    case "synced":
      return COLORS.success;
    case "idle":
    case "pending":
      return COLORS.warning;
    case "offline":
      return COLORS.gray400;
    default:
      return COLORS.primary;
  }
}

export default function MapScreen() {
  const [selectedLayer, setSelectedLayer] = useState<"all" | "workers" | "submissions">("all");
  const [selectedMarker, setSelectedMarker] = useState<(typeof mockMarkers)[0] | null>(null);

  const filteredMarkers = mockMarkers.filter((marker) => {
    if (selectedLayer === "workers") return marker.type === "worker";
    if (selectedLayer === "submissions") return marker.type === "submission";
    return true;
  });

  const activeWorkers = mockMarkers.filter(
    (m) => m.type === "worker" && m.status === "active",
  ).length;
  const totalSubmissions = mockMarkers.filter((m) => m.type === "submission").length;
  const pendingSyncs = mockMarkers.filter(
    (m) => m.type === "submission" && m.status === "pending",
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Field Map</Text>
          <Text style={styles.subtitle}>{activeWorkers} active workers</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.layerButton}>
            <Text style={styles.layerButtonText}>🗺️ Layers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fullscreenButton}>
            <Text style={styles.fullscreenButtonText}>⛶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <View style={styles.mapBackground}>
          {/* Map markers */}
          {filteredMarkers.map((marker) => (
            <TouchableOpacity
              key={marker.id}
              style={[styles.marker, { left: `${marker.x}%`, top: `${marker.y}%` }]}
              onPress={() => setSelectedMarker(marker)}
            >
              <View
                style={[styles.markerDot, { backgroundColor: getMarkerColor(marker.status) }]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>📍</Text>
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.legendText}>Active/Synced</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
            <Text style={styles.legendText}>Idle/Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: COLORS.gray400 }]} />
            <Text style={styles.legendText}>Offline</Text>
          </View>
        </View>
      </View>

      {/* Bottom Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mockMarkers.length}</Text>
          <Text style={styles.statLabel}>Total Markers</Text>
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

      {/* Selected Marker Info */}
      {selectedMarker && (
        <View style={styles.markerInfo}>
          <View style={styles.markerInfoHeader}>
            <Text style={styles.markerInfoTitle}>
              {selectedMarker.type === "worker"
                ? `Worker: ${selectedMarker.name}`
                : `Stand: ${selectedMarker.standNumber}`}
            </Text>
            <TouchableOpacity onPress={() => setSelectedMarker(null)}>
              <Text style={styles.markerInfoClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.markerInfoStatus}>Status: {selectedMarker.status}</Text>
          <View style={styles.markerInfoActions}>
            <TouchableOpacity style={styles.markerInfoButton}>
              <Text style={styles.markerInfoButtonText}>View Details</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.markerInfoButton}>
              <Text style={styles.markerInfoButtonText}>Message</Text>
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
  subtitle: { fontSize: 14, color: COLORS.mutedForeground, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  layerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  layerButtonText: { fontSize: 12, fontWeight: "600", color: COLORS.cardForeground },
  fullscreenButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  fullscreenButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.cardForeground },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapBackground: { flex: 1, backgroundColor: COLORS.gray50, position: "relative" },
  marker: { position: "absolute", transform: [{ translateX: -8 }] },
  markerDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.white },
  mapControls: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -60 }],
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.cardForeground },
  legend: {
    position: "absolute",
    left: 12,
    bottom: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
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
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: COLORS.cardForeground },
  statLabel: { fontSize: 11, color: COLORS.mutedForeground, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
  markerInfo: {
    margin: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  markerInfoTitle: { fontSize: 16, fontWeight: "700", color: COLORS.cardForeground },
  markerInfoClose: { fontSize: 16, color: COLORS.gray500 },
  markerInfoStatus: { fontSize: 14, color: COLORS.mutedForeground, marginBottom: 12 },
  markerInfoActions: { flexDirection: "row", gap: 8 },
  markerInfoButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
  },
  markerInfoButtonText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
});

// ---------------------------------------------------------------------------
// Vevhu Field - Spitzkop Lot 6 Interactive Site Plan & GPS Overlay (2026)
// ---------------------------------------------------------------------------

import { useQuery } from "@powersync/react-native";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../src/config/app";
import {
  calculateDistanceMeters,
  gpsToMapPercent,
  SPITZKOP_LOT6_BOUNDS,
  SPITZKOP_STANDS_PRESETS,
  type StandCoordinate,
} from "../../src/config/site-map";
import { useLocation } from "../../src/hooks/useLocation";

interface SubmissionPin {
  id: string;
  stand_number_official: string | null;
  stand_number_physical: string | null;
  respondent_name: string | null;
  status: string;
  gps_latitude: number | null;
  gps_longitude: number | null;
}

export default function SiteMapScreen() {
  const { location, captureLocation } = useLocation();
  const [selectedStand, setSelectedStand] = useState<StandCoordinate | null>(
    SPITZKOP_STANDS_PRESETS[0],
  );

  const { data: dbSubmissions } = useQuery<SubmissionPin>(
    "SELECT id, stand_number_official, stand_number_physical, respondent_name, status, gps_latitude, gps_longitude FROM submissions ORDER BY collected_at DESC",
  );

  // Map worker GPS coordinates to Lot 6 map relative percentages
  const workerMapPos = useMemo(() => {
    if (!location?.latitude || !location?.longitude) {
      // Default to center of Lot 6 triangle if GPS acquiring
      return { xPercent: 45.0, yPercent: 40.0 };
    }
    return gpsToMapPercent(location.latitude, location.longitude, SPITZKOP_LOT6_BOUNDS);
  }, [location]);

  // Distance in meters to selected stand
  const distanceMeters = useMemo(() => {
    if (!location?.latitude || !location?.longitude || !selectedStand) return null;
    // Estimate target stand GPS from Lot 6 map percentages if explicit coords not set
    const targetLat =
      selectedStand.latitude ??
      SPITZKOP_LOT6_BOUNDS.north -
        (selectedStand.yPercent / 100) * (SPITZKOP_LOT6_BOUNDS.north - SPITZKOP_LOT6_BOUNDS.south);
    const targetLng =
      selectedStand.longitude ??
      SPITZKOP_LOT6_BOUNDS.west +
        (selectedStand.xPercent / 100) * (SPITZKOP_LOT6_BOUNDS.east - SPITZKOP_LOT6_BOUNDS.west);
    return calculateDistanceMeters(location.latitude, location.longitude, targetLat, targetLng);
  }, [location, selectedStand]);

  const handleRefreshLocation = useCallback(async () => {
    await captureLocation();
  }, [captureLocation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>📍 Spitzkop Lot 6 Site Plan</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefreshLocation}>
            <Text style={styles.refreshBtnText}>🎯 Recenter GPS</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Interactive Cadastral Survey Diagram • Triangle Area Lot 6
        </Text>

        {/* Live GPS Bar */}
        <View style={styles.gpsBar}>
          <View style={styles.gpsStatusDot} />
          <Text style={styles.gpsText}>
            {location
              ? `GPS Fixed: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} (±${Math.round(location.accuracy || 5)}m)`
              : "Acquiring satellite GPS fix..."}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Map Container View */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeaderRow}>
            <Text style={styles.mapTitle}>CADASTRAL OVERLAY (LOT 6 TRIANGLE)</Text>
            <Text style={styles.mapBadge}>LIVE RADAR</Text>
          </View>

          <View style={styles.mapImageWrapper}>
            <Image
              source={require("../../assets/maps/spitzkop_lot6_triangle.png")}
              style={styles.mapImage}
              resizeMode="contain"
            />

            {/* Live Worker Pulsing GPS Location Overlay */}
            <View
              style={[
                styles.workerGpsMarker,
                {
                  left: `${workerMapPos.xPercent}%`,
                  top: `${workerMapPos.yPercent}%`,
                },
              ]}
            >
              <View style={styles.workerGpsPulseRing} />
              <View style={styles.workerGpsCenterDot} />
              <Text style={styles.workerGpsLabel}>YOU (FIELD AGENT)</Text>
            </View>

            {/* Stand Pins Overlay */}
            {SPITZKOP_STANDS_PRESETS.map((stand) => {
              const matchingSub = dbSubmissions?.find(
                (s) =>
                  s.stand_number_official === stand.stand_number ||
                  s.stand_number_physical === stand.stand_number,
              );
              const isSelected = selectedStand?.stand_number === stand.stand_number;
              const isCollected = !!matchingSub;

              return (
                <TouchableOpacity
                  key={stand.stand_number}
                  style={[
                    styles.standPin,
                    { left: `${stand.xPercent}%`, top: `${stand.yPercent}%` },
                    isCollected && styles.standPinCollected,
                    isSelected && styles.standPinSelected,
                  ]}
                  onPress={() => setSelectedStand(stand)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.standPinText, isSelected && styles.standPinTextSelected]}>
                    #{stand.stand_number}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Stand Info Sheet */}
        {selectedStand && (
          <View style={styles.infoSheet}>
            <View style={styles.infoSheetHeader}>
              <View>
                <Text style={styles.infoSheetStandNo}>Stand #{selectedStand.stand_number}</Text>
                <Text style={styles.infoSheetZone}>Spitzkop Lot 6 Cadastral Subdivision</Text>
              </View>
              {distanceMeters !== null && (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceBadgeVal}>{distanceMeters}m</Text>
                  <Text style={styles.distanceBadgeLbl}>On Ground</Text>
                </View>
              )}
            </View>

            <View style={styles.infoActionsRow}>
              <TouchableOpacity
                style={styles.collectActionBtn}
                onPress={() =>
                  router.push({
                    pathname: "/(worker)/collect",
                    params: { stand: selectedStand.stand_number },
                  })
                }
              >
                <Text style={styles.collectActionBtnText}>📝 Start Survey Collection</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.progressActionBtn}
                onPress={() => router.push("/(worker)/progress")}
              >
                <Text style={styles.progressActionBtnText}>📋 View Records</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700", color: COLORS.cardForeground },
  subtitle: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 2 },
  refreshBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  refreshBtnText: { color: COLORS.white, fontSize: 12, fontWeight: "600" },
  gpsBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  gpsStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 8,
  },
  gpsText: { fontSize: 11, fontWeight: "600", color: COLORS.gray700 },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  mapCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mapHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  mapTitle: { fontSize: 11, fontWeight: "700", color: COLORS.mutedForeground, letterSpacing: 0.8 },
  mapBadge: {
    backgroundColor: COLORS.brandBlue,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mapImageWrapper: {
    width: "100%",
    height: 420,
    position: "relative",
    backgroundColor: "#F4F1EA",
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  mapImage: { width: "100%", height: "100%" },
  workerGpsMarker: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    zIndex: 20,
  },
  workerGpsPulseRing: {
    position: "absolute",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(25, 118, 210, 0.25)",
    borderWidth: 1.5,
    borderColor: COLORS.brandBlue,
  },
  workerGpsCenterDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.brandBlue,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  workerGpsLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.brandBlue,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  standPin: {
    position: "absolute",
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    transform: [{ translateX: -18 }, { translateY: -12 }],
    zIndex: 10,
  },
  standPinCollected: { backgroundColor: COLORS.successBg, borderColor: COLORS.success },
  standPinSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
    transform: [{ scale: 1.15 }, { translateX: -16 }, { translateY: -10 }],
    zIndex: 15,
  },
  standPinText: { fontSize: 10, fontWeight: "700", color: COLORS.primary },
  standPinTextSelected: { color: COLORS.white },
  infoSheet: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoSheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoSheetStandNo: { fontSize: 20, fontWeight: "800", color: COLORS.cardForeground },
  infoSheetZone: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 2 },
  distanceBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  distanceBadgeVal: { fontSize: 16, fontWeight: "800", color: COLORS.primary },
  distanceBadgeLbl: { fontSize: 10, color: COLORS.mutedForeground, textTransform: "uppercase" },
  infoActionsRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  collectActionBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  collectActionBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  progressActionBtn: {
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  progressActionBtnText: { color: COLORS.cardForeground, fontWeight: "600", fontSize: 13 },
});

// ---------------------------------------------------------------------------
// Vevhu Field - Submissions List Screen
// ---------------------------------------------------------------------------

import { useQuery } from "@powersync/react-native";
import { format } from "date-fns";
import { router } from "expo-router";
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

interface SubmissionRow {
  id: string;
  worker_id: string;
  stand_number_official: string | null;
  stand_number_physical: string | null;
  respondent_type: string | null;
  respondent_name: string | null;
  respondent_phone: string | null;
  status: string;
  collected_at: string;
  photos: string | null;
  audio_recording_key: string | null;
  signature_key: string | null;
  worker_name?: string | null;
}

const FALLBACK_SUBMISSIONS: SubmissionRow[] = [
  {
    id: "demo-1",
    worker_id: "w1",
    stand_number_official: "841",
    stand_number_physical: "841-A",
    respondent_type: "Registered Owner",
    respondent_name: "Kudzai Musona",
    respondent_phone: "+263 77 123 4567",
    status: "synced",
    collected_at: new Date().toISOString(),
    photos: JSON.stringify([{ uri: "sample1" }, { uri: "sample2" }]),
    audio_recording_key: "sample.m4a",
    signature_key: "sample.png",
    worker_name: "John Chipunza",
  },
  {
    id: "demo-2",
    worker_id: "w2",
    stand_number_official: "1202",
    stand_number_physical: "1202",
    respondent_type: "Tenant",
    respondent_name: "Tafadzwa Gumbo",
    respondent_phone: "+263 77 234 5678",
    status: "pending",
    collected_at: new Date(Date.now() - 3600000).toISOString(),
    photos: JSON.stringify([{ uri: "sample1" }]),
    audio_recording_key: null,
    signature_key: "sample.png",
    worker_name: "Sarah Mnene",
  },
];

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "MMM d, h:mm a");
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "synced":
    case "complete":
      return { text: "Synced", style: styles.syncedBadge, textStyle: styles.syncedText };
    case "pending":
      return { text: "Pending", style: styles.pendingBadge, textStyle: styles.pendingText };
    case "flagged":
      return { text: "Flagged", style: styles.flaggedBadge, textStyle: styles.flaggedText };
    case "disputed":
      return { text: "Disputed", style: styles.disputedBadge, textStyle: styles.disputedText };
    default:
      return { text: status, style: styles.pendingBadge, textStyle: styles.pendingText };
  }
}

export default function SubmissionsScreen() {
  const [filter, setFilter] = useState<"all" | "synced" | "pending" | "flagged">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: queryData } = useQuery<SubmissionRow>(
    `SELECT s.*, u.full_name AS worker_name FROM submissions s LEFT JOIN users u ON s.worker_id = u.id ORDER BY s.collected_at DESC LIMIT 100`,
  );

  const submissionsList = useMemo(() => {
    if (queryData && queryData.length > 0) return queryData;
    return FALLBACK_SUBMISSIONS;
  }, [queryData]);

  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((item) => {
      const matchesFilter =
        filter === "all" ||
        item.status === filter ||
        (filter === "synced" && item.status === "complete");
      const q = searchQuery.toLowerCase().trim();
      const standStr = (
        item.stand_number_official ||
        item.stand_number_physical ||
        ""
      ).toLowerCase();
      const respName = (item.respondent_name || "").toLowerCase();
      const matchesSearch = !q || standStr.includes(q) || respName.includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [submissionsList, filter, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Submissions</Text>
          <Text style={styles.subtitle}>
            {filteredSubmissions.length} record{filteredSubmissions.length === 1 ? "" : "s"}
          </Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(["all", "synced", "pending", "flagged"] as const).map((f) => (
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

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by stand # or respondent..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray400}
        />
      </View>

      {/* Submissions List (Direct FlatList without outer ScrollView) */}
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={8}
        renderItem={({ item }) => {
          const status = getStatusBadge(item.status);
          let photoCount = 0;
          try {
            if (item.photos) photoCount = JSON.parse(item.photos).length;
          } catch {}

          const standNum = item.stand_number_official || item.stand_number_physical || "Unnumbered";

          return (
            <TouchableOpacity
              style={styles.submissionCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: "/(worker)/submission-detail" as any,
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.cardHeader}>
                <Text style={styles.standNumber}>Stand {standNum}</Text>
                <View style={[styles.statusBadge, status.style]}>
                  <Text style={[styles.statusText, status.textStyle]}>{status.text}</Text>
                </View>
              </View>

              <Text style={styles.respondentName}>
                {item.respondent_name || "Unspecified Respondent"}
              </Text>
              <Text style={styles.respondentPhone}>
                {item.respondent_phone || "No phone provided"}
              </Text>

              <Text style={styles.workerInfo}>
                Collected by <Text style={styles.bold}>{item.worker_name || "Field Agent"}</Text> •{" "}
                {formatDate(item.collected_at)}
              </Text>

              <View style={styles.mediaPills}>
                {photoCount > 0 && <Text style={styles.mediaPill}>📷 {photoCount}</Text>}
                {item.audio_recording_key ? <Text style={styles.mediaPill}>🎙️ Audio</Text> : null}
                {item.signature_key ? <Text style={styles.mediaPill}>✍️ Signed</Text> : null}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No submissions match your search filter.</Text>
          </View>
        }
      />
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
  filterButton: { padding: 8 },
  filterIcon: { fontSize: 20 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.gray600, fontWeight: "500" },
  filterChipTextActive: { color: COLORS.white },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.cardForeground },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  submissionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  standNumber: { fontSize: 18, fontWeight: "700", color: COLORS.cardForeground },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  syncedBadge: { backgroundColor: COLORS.successBg },
  syncedText: { color: COLORS.success, fontSize: 11, fontWeight: "700" },
  pendingBadge: { backgroundColor: COLORS.warningBg },
  pendingText: { color: COLORS.warning, fontSize: 11, fontWeight: "700" },
  flaggedBadge: { backgroundColor: COLORS.errorBg },
  flaggedText: { color: COLORS.error, fontSize: 11, fontWeight: "700" },
  disputedBadge: { backgroundColor: COLORS.gray100 },
  disputedText: { color: COLORS.gray600, fontSize: 11, fontWeight: "700" },
  statusText: { fontSize: 11, fontWeight: "700" },
  respondentName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.cardForeground,
    marginBottom: 2,
  },
  respondentPhone: { fontSize: 14, color: COLORS.gray600, marginBottom: 4 },
  workerInfo: { fontSize: 12, color: COLORS.mutedForeground },
  bold: { fontWeight: "700", color: COLORS.cardForeground },
  mediaPills: { flexDirection: "row", gap: 6, marginTop: 8 },
  mediaPill: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primaryDark,
  },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: COLORS.mutedForeground, fontSize: 14 },
});

// ---------------------------------------------------------------------------
// Vevhu Field - Submissions List Screen
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../src/config/app";
import type { Submission } from "../../src/types/dashboard";

// Mock data
const mockSubmissions: Submission[] = [
  {
    id: "1",
    standNumber: "841",
    respondentName: "Kudzai Musona",
    respondentPhone: "+263 77 123 4567",
    respondentType: "Registered Owner",
    workerId: "1",
    workerName: "John Chipunza",
    status: "synced",
    collectedAt: "2024-01-15T10:30:00Z",
    photos: 3,
    hasAudio: true,
    hasSignature: true,
  },
  {
    id: "2",
    standNumber: "1202",
    respondentName: "Tafadzwa Gumbo",
    respondentPhone: "+263 77 234 5678",
    respondentType: "Tenant",
    workerId: "2",
    workerName: "Sarah Mnene",
    status: "synced",
    collectedAt: "2024-01-15T09:15:00Z",
    photos: 5,
    hasAudio: false,
    hasSignature: true,
  },
  {
    id: "3",
    standNumber: "33",
    respondentName: "Bester Phiri",
    respondentPhone: "+263 77 345 6789",
    respondentType: "Caretaker",
    workerId: "3",
    workerName: "Robert Zulu",
    status: "pending",
    collectedAt: "2024-01-15T08:45:00Z",
    photos: 2,
    hasAudio: true,
    hasSignature: true,
  },
  {
    id: "4",
    standNumber: "567",
    respondentName: "Chipo Moyo",
    respondentPhone: "+263 77 456 7890",
    respondentType: "Registered Owner",
    workerId: "1",
    workerName: "John Chipunza",
    status: "synced",
    collectedAt: "2024-01-14T16:20:00Z",
    photos: 4,
    hasAudio: true,
    hasSignature: false,
  },
  {
    id: "5",
    standNumber: "89",
    respondentName: "Tendai Mutasa",
    respondentPhone: "+263 77 567 8901",
    respondentType: "Squatter",
    workerId: "4",
    workerName: "Tinashe Moyo",
    status: "flagged",
    collectedAt: "2024-01-14T14:10:00Z",
    photos: 1,
    hasAudio: false,
    hasSignature: false,
  },
  {
    id: "6",
    standNumber: "1024",
    respondentName: "Rumbi Chikwanha",
    respondentPhone: "+263 77 678 9012",
    respondentType: "Tenant",
    workerId: "2",
    workerName: "Sarah Mnene",
    status: "synced",
    collectedAt: "2024-01-14T11:45:00Z",
    photos: 3,
    hasAudio: true,
    hasSignature: true,
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: Submission["status"]) {
  switch (status) {
    case "synced":
      return { text: "Synced", style: styles.syncedBadge, textStyle: styles.syncedText };
    case "pending":
      return { text: "Pending", style: styles.pendingBadge, textStyle: styles.pendingText };
    case "flagged":
      return { text: "Flagged", style: styles.flaggedBadge, textStyle: styles.flaggedText };
  }
}

export default function SubmissionsScreen() {
  const [filter, setFilter] = useState<"all" | "synced" | "pending" | "flagged">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubmissions = mockSubmissions.filter((submission) => {
    const matchesFilter = filter === "all" || submission.status === filter;
    const matchesSearch =
      submission.standNumber.includes(searchQuery) ||
      submission.respondentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Submissions</Text>
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

        {/* Submissions List */}
        <FlatList
          data={filteredSubmissions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const status = getStatusBadge(item.status);
            return (
              <TouchableOpacity style={styles.submissionCard} activeOpacity={0.7}>
                <View style={styles.cardHeader}>
                  <Text style={styles.standNumber}>Stand {item.standNumber}</Text>
                  <View style={[styles.statusBadge, status.style]}>
                    <Text style={[styles.statusText, status.textStyle]}>{status.text}</Text>
                  </View>
                </View>

                <Text style={styles.respondentName}>{item.respondentName}</Text>
                <Text style={styles.respondentPhone}>{item.respondentPhone}</Text>

                <Text style={styles.workerInfo}>
                  Collected by <Text style={styles.bold}>{item.workerName}</Text> •{" "}
                  {formatDate(item.collectedAt)}
                </Text>

                <View style={styles.mediaPills}>
                  {item.photos > 0 && <Text style={styles.mediaPill}>📷 {item.photos}</Text>}
                  {item.hasAudio && <Text style={styles.mediaPill}>🎙️</Text>}
                  {item.hasSignature && <Text style={styles.mediaPill}>✍️</Text>}
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.cardForeground },
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: COLORS.cardForeground },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  submissionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
});

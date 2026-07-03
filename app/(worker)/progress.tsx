import { useQuery } from "@powersync/react-native";
import { format, formatISO, startOfDay, startOfWeek } from "date-fns";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useContext, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../_layout";

interface SubmissionRow {
  id: string;
  worker_id: string;
  stand_number_official: string | null;
  stand_number_physical: string | null;
  respondent_type: string | null;
  respondent_name: string | null;
  respondent_phone: string | null;
  is_legal_owner: number | null;
  owner_name: string | null;
  owner_phone: string | null;
  account_standing: string | null;
  action_taken: string | null;
  field_notes: string | null;
  extra_fields: string | null;
  photos: string | null;
  audio_recording_key: string | null;
  audio_duration_seconds: number | null;
  signature_key: string | null;
  status: string;
  collected_at: string;
  worker_name?: string;
}

function DetailModal({
  submission,
  visible,
  onClose,
}: {
  submission: SubmissionRow | null;
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer(submission?.audio_recording_key || "");
  const playerStatus = useAudioPlayerStatus(player);

  if (!submission) return null;

  let parsedPhotos: any[] = [];
  try {
    if (submission.photos) parsedPhotos = JSON.parse(submission.photos);
  } catch {}

  const toggleAudio = () => {
    if (playerStatus.playing) player.pause();
    else player.play();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View
        style={[
          styles.modalContainer,
          { paddingTop: insets.top || 12, paddingBottom: insets.bottom || 12 },
        ]}
      >
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Stand #{submission.stand_number_official || submission.stand_number_physical || "N/A"}
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={[1]}
          keyExtractor={() => "detail"}
          contentContainerStyle={styles.modalContent}
          renderItem={() => (
            <View>
              {/* Collector & Status Banner */}
              <View style={styles.bannerRow}>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeText}>👤 {submission.worker_name || "Field Agent"}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    submission.status === "synced" ? styles.syncedBadge : styles.pendingBadge,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {submission.status === "synced" ? "✅ Synced to Server" : "⏳ Pending Sync"}
                  </Text>
                </View>
              </View>

              {/* Respondent & Owner Info */}
              <View style={styles.detailCard}>
                <Text style={styles.cardHeader}>👤 Resident & Owner Details</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Respondent Name:</Text>
                  <Text style={styles.infoValue}>{submission.respondent_name || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Respondent Phone:</Text>
                  <Text style={styles.infoValue}>{submission.respondent_phone || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Respondent Type:</Text>
                  <Text style={styles.infoValue}>{submission.respondent_type || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Legal Owner Name:</Text>
                  <Text style={styles.infoValue}>{submission.owner_name || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Legal Owner Phone:</Text>
                  <Text style={styles.infoValue}>{submission.owner_phone || "N/A"}</Text>
                </View>
              </View>

              {/* Site Standing & Action */}
              <View style={styles.detailCard}>
                <Text style={styles.cardHeader}>📋 Verification Findings</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Account Standing:</Text>
                  <Text style={styles.infoValue}>{submission.account_standing || "N/A"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Action Taken:</Text>
                  <Text style={styles.infoValue}>{submission.action_taken || "N/A"}</Text>
                </View>
                {submission.field_notes ? (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>Field Notes:</Text>
                    <Text style={styles.notesText}>{submission.field_notes}</Text>
                  </View>
                ) : null}
              </View>

              {/* Photos Gallery */}
              {parsedPhotos.length > 0 && (
                <View style={styles.detailCard}>
                  <Text style={styles.cardHeader}>📷 Property Photos ({parsedPhotos.length})</Text>
                  <View style={styles.photoGrid}>
                    {parsedPhotos.map((photo, i) => (
                      <Image key={i} source={{ uri: photo.uri }} style={styles.photoThumb} />
                    ))}
                  </View>
                </View>
              )}

              {/* Audio Recording Preview */}
              {submission.audio_recording_key ? (
                <View style={styles.detailCard}>
                  <Text style={styles.cardHeader}>
                    🎙️ Conversation Recording ({submission.audio_duration_seconds || 0}s)
                  </Text>
                  <TouchableOpacity style={styles.audioPlayBtn} onPress={toggleAudio}>
                    <Text style={styles.audioPlayBtnText}>
                      {playerStatus.playing ? "⏸️ Pause Audio" : "▶️ Play Audio Recording"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Resident Signature */}
              {submission.signature_key ? (
                <View style={styles.detailCard}>
                  <Text style={styles.cardHeader}>✍️ Resident Signature</Text>
                  <Image
                    source={{ uri: submission.signature_key }}
                    style={styles.signatureImage}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

export default function ProgressScreen() {
  const { session } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const userId = session?.user?.id ?? "";
  const [filterMode, setFilterMode] = useState<"my" | "team">("my");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null);

  const todayStart = formatISO(startOfDay(new Date()), { representation: "date" });
  const weekStart = formatISO(startOfWeek(new Date(), { weekStartsOn: 1 }), {
    representation: "date",
  });

  // Summary Counts
  const { data: myToday } = useQuery<{ count: number }>(
    "SELECT COUNT(*) AS count FROM submissions WHERE worker_id = ? AND collected_at >= ?",
    [userId, todayStart],
  );
  const { data: teamToday } = useQuery<{ count: number }>(
    "SELECT COUNT(*) AS count FROM submissions WHERE collected_at >= ?",
    [todayStart],
  );
  const { data: myWeek } = useQuery<{ count: number }>(
    "SELECT COUNT(*) AS count FROM submissions WHERE worker_id = ? AND collected_at >= ?",
    [userId, weekStart],
  );

  // Submissions Query (My vs Team)
  const querySql =
    filterMode === "my"
      ? `SELECT s.*, u.full_name AS worker_name FROM submissions s LEFT JOIN users u ON s.worker_id = u.id WHERE s.worker_id = ? ORDER BY s.collected_at DESC LIMIT 50`
      : `SELECT s.*, u.full_name AS worker_name FROM submissions s LEFT JOIN users u ON s.worker_id = u.id ORDER BY s.collected_at DESC LIMIT 100`;

  const queryParams = filterMode === "my" ? [userId] : [];
  const { data: submissions } = useQuery<SubmissionRow>(querySql, queryParams);

  // Filter by search query
  const filteredSubmissions = (submissions ?? []).filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.stand_number_official?.toLowerCase().includes(q) ||
      sub.stand_number_physical?.toLowerCase().includes(q) ||
      sub.respondent_name?.toLowerCase().includes(q) ||
      sub.owner_name?.toLowerCase().includes(q) ||
      sub.worker_name?.toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }: { item: SubmissionRow }) => {
    let photoCount = 0;
    try {
      if (item.photos) photoCount = JSON.parse(item.photos).length;
    } catch {}

    return (
      <TouchableOpacity style={styles.recordCard} onPress={() => setSelectedSubmission(item)}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.standTitle}>
            Stand #{item.stand_number_official || item.stand_number_physical || "Unnumbered"}
          </Text>
          <View
            style={[
              styles.miniStatusBadge,
              item.status === "synced" ? styles.syncedBg : styles.pendingBg,
            ]}
          >
            <Text style={styles.miniStatusText}>
              {item.status === "synced" ? "✅ Synced" : "⏳ Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <Text style={styles.detailText}>
            👤 Resident: <Text style={styles.boldText}>{item.respondent_name || "N/A"}</Text> (
            {item.respondent_phone || "No phone"})
          </Text>
          <Text style={styles.detailText}>
            🏠 Legal Owner: <Text style={styles.boldText}>{item.owner_name || "N/A"}</Text>
          </Text>
          <Text style={styles.collectorText}>
            ✍️ Collected by <Text style={styles.boldText}>{item.worker_name || "Agent"}</Text> •{" "}
            {format(new Date(item.collected_at), "MMM d, h:mm a")}
          </Text>
        </View>

        {/* Media Attachments Pills */}
        <View style={styles.mediaPillsRow}>
          {photoCount > 0 && <Text style={styles.mediaPill}>📷 {photoCount} Photos</Text>}
          {item.audio_recording_key && (
            <Text style={styles.mediaPill}>🎙️ Audio ({item.audio_duration_seconds || 0}s)</Text>
          )}
          {item.signature_key && <Text style={styles.mediaPill}>✍️ Signed</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top || 14 }]}>
      <DetailModal
        submission={selectedSubmission}
        visible={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
      />

      {/* Top Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myToday?.[0]?.count ?? 0}</Text>
          <Text style={styles.statLabel}>My Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#2e7d32" }]}>
            {teamToday?.[0]?.count ?? 0}
          </Text>
          <Text style={styles.statLabel}>Team Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#f57c00" }]}>{myWeek?.[0]?.count ?? 0}</Text>
          <Text style={styles.statLabel}>My This Week</Text>
        </View>
      </View>

      {/* Mode Filter Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, filterMode === "my" && styles.tabBtnActive]}
          onPress={() => setFilterMode("my")}
        >
          <Text style={[styles.tabBtnText, filterMode === "my" && styles.tabBtnTextActive]}>
            👤 My Submissions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, filterMode === "team" && styles.tabBtnActive]}
          onPress={() => setFilterMode("team")}
        >
          <Text style={[styles.tabBtnText, filterMode === "team" && styles.tabBtnTextActive]}>
            🏢 All Team Submissions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Stand #, Resident Name, Owner..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Record Submissions List */}
      <FlatList
        data={filteredSubmissions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: (insets.bottom || 20) + 20 }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No submission records found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingHorizontal: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  statNumber: { fontSize: 22, fontWeight: "700", color: "#1976D2" },
  statLabel: { fontSize: 12, color: "#666", marginTop: 2 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  tabBtnActive: { backgroundColor: "#1976D2" },
  tabBtnText: { fontSize: 13, fontWeight: "600", color: "#555" },
  tabBtnTextActive: { color: "#fff" },

  searchContainer: { marginBottom: 12 },
  searchInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
  },

  listContent: { paddingBottom: 20 },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  standTitle: { fontSize: 16, fontWeight: "700", color: "#1a1a2e" },
  miniStatusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  syncedBg: { backgroundColor: "#e8f5e9" },
  pendingBg: { backgroundColor: "#fff3e0" },
  miniStatusText: { fontSize: 11, fontWeight: "600" },

  cardDetails: { marginBottom: 8 },
  detailText: { fontSize: 13, color: "#444", marginVertical: 2 },
  collectorText: { fontSize: 12, color: "#666", marginTop: 4 },
  boldText: { fontWeight: "700", color: "#222" },

  mediaPillsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  mediaPill: {
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "600",
    color: "#1976D2",
  },

  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: "#888", fontSize: 14 },

  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a2e" },
  closeBtn: { padding: 8, backgroundColor: "#f5f5f5", borderRadius: 8 },
  closeBtnText: { fontSize: 14, fontWeight: "600", color: "#666" },

  modalContent: { padding: 16 },
  bannerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  badgeInfo: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: { fontSize: 13, fontWeight: "600", color: "#1976D2" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  syncedBadge: { backgroundColor: "#e8f5e9" },
  pendingBadge: { backgroundColor: "#fff3e0" },
  statusText: { fontSize: 13, fontWeight: "600" },

  detailCard: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardHeader: { fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 3 },
  infoLabel: { fontSize: 13, color: "#666" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#222" },

  notesBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  notesLabel: { fontSize: 12, fontWeight: "600", color: "#666", marginBottom: 2 },
  notesText: { fontSize: 13, color: "#333" },

  photoGrid: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  photoThumb: { width: 90, height: 90, borderRadius: 8, backgroundColor: "#eee" },

  audioPlayBtn: { backgroundColor: "#2e7d32", padding: 12, borderRadius: 8, alignItems: "center" },
  audioPlayBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  signatureImage: {
    height: 100,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});

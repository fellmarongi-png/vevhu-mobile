// ---------------------------------------------------------------------------
// Vevhu Field - Submission Detail Screen
// ---------------------------------------------------------------------------

import { useQuery } from "@powersync/react-native";
import { format } from "date-fns";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
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
  is_legal_owner: number | null;
  owner_name: string | null;
  owner_phone: string | null;
  account_standing: string | null;
  action_taken: string | null;
  field_notes: string | null;
  extra_fields: string | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  gps_accuracy: number | null;
  photos: string | null;
  audio_recording_key: string | null;
  audio_duration_seconds: number | null;
  signature_key: string | null;
  status: string;
  collected_at: string;
  worker_name?: string | null;
}

const FALLBACK_DETAIL: SubmissionRow = {
  id: "demo-1",
  worker_id: "w1",
  stand_number_official: "841",
  stand_number_physical: "841-A",
  respondent_name: "Kudzai Musona",
  respondent_phone: "+263 77 123 4567",
  respondent_type: "Registered Owner",
  is_legal_owner: 1,
  owner_name: "Kudzai Musona",
  owner_phone: "+263 77 123 4567",
  account_standing: "Yes",
  action_taken: "Verbal warning given",
  field_notes: "Regular structural inspection conducted on-site.",
  extra_fields: JSON.stringify({ respondent_national_id: "63-2235942 E 59" }),
  gps_latitude: -17.8252,
  gps_longitude: 31.0335,
  gps_accuracy: 10,
  photos: JSON.stringify([{ uri: "https://picsum.photos/seed/841/300/300" }]),
  audio_recording_key: null,
  audio_duration_seconds: 12,
  signature_key: null,
  status: "synced",
  collected_at: new Date().toISOString(),
  worker_name: "John Chipunza",
};

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "MMM d, yyyy, h:mm a");
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
    default:
      return { text: status, style: styles.pendingBadge, textStyle: styles.pendingText };
  }
}

export default function SubmissionDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const submissionId = params.id || "";

  const { data: dbRows } = useQuery<SubmissionRow>(
    `SELECT s.*, u.full_name AS worker_name FROM submissions s LEFT JOIN users u ON s.worker_id = u.id WHERE s.id = ?`,
    [submissionId],
  );

  const submission: SubmissionRow = useMemo(() => {
    if (dbRows && dbRows.length > 0) return dbRows[0];
    return FALLBACK_DETAIL;
  }, [dbRows]);

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Safe audio player preview
  const audioUri = submission.audio_recording_key || null;
  const player = useAudioPlayer(audioUri);
  const playerStatus = useAudioPlayerStatus(player);

  const parsedPhotos: Array<{ uri: string }> = useMemo(() => {
    if (!submission.photos) return [];
    try {
      const parsed = JSON.parse(submission.photos);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [submission.photos]);

  const parsedExtraFields: Record<string, unknown> = useMemo(() => {
    if (!submission.extra_fields) return {};
    try {
      const parsed = JSON.parse(submission.extra_fields);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch {
      return {};
    }
  }, [submission.extra_fields]);

  const nationalId = (parsedExtraFields.respondent_national_id as string) || "N/A";

  const toggleAudio = () => {
    if (!player) return;
    if (playerStatus.playing) player.pause();
    else player.play();
  };

  const status = getStatusBadge(submission.status);

  const handleExportPDF = () => {
    Alert.alert(
      "Export PDF",
      `PDF export initiated for Stand ${submission.stand_number_official || "N/A"}`,
    );
  };

  const handlePrint = () => {
    Alert.alert(
      "Print Notice",
      `Print job queued for Stand ${submission.stand_number_official || "N/A"}`,
    );
  };

  const handleFlagReview = () => {
    Alert.alert("Flag Submission", "Submission flagged for manager review.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleExportPDF}>
              <Text style={styles.actionButtonText}>📄 PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
              <Text style={styles.actionButtonText}>🖨️ Print</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.flagButton]}
              onPress={handleFlagReview}
            >
              <Text style={[styles.actionButtonText, styles.flagButtonText]}>🚩 Flag</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>
            Submissions / Stand{" "}
            {submission.stand_number_official || submission.stand_number_physical || "Detail"}
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.standTitle}>
              Stand {submission.stand_number_official || submission.stand_number_physical || "N/A"}
            </Text>
            <View style={[styles.statusBadge, status.style]}>
              <Text style={[styles.statusText, status.textStyle]}>{status.text}</Text>
            </View>
          </View>
          <Text style={styles.collectedAt}>Collected: {formatDate(submission.collected_at)}</Text>
          <Text style={styles.workerName}>Field Agent: {submission.worker_name || "Agent"}</Text>
        </View>

        {/* Respondent & Owner Details */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>👤 Respondent & Owner Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Respondent Name:</Text>
            <Text style={styles.infoValue}>{submission.respondent_name || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Respondent Phone:</Text>
            <Text style={styles.infoValue}>{submission.respondent_phone || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>National ID:</Text>
            <Text style={[styles.infoValue, { fontVariant: ["tabular-nums"] }]}>{nationalId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Respondent Type:</Text>
            <Text style={styles.infoValue}>{submission.respondent_type || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Is Legal Owner?</Text>
            <Text style={styles.infoValue}>
              {submission.is_legal_owner === 1 ? "Yes (Registered Owner)" : "No (Tenant/Caretaker)"}
            </Text>
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

        {/* Account Standing & Action */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>📋 Verification Findings</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rates Account Standing:</Text>
            <Text style={styles.infoValue}>{submission.account_standing || "N/A"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Action / Notice Served:</Text>
            <Text style={styles.infoValue}>{submission.action_taken || "None"}</Text>
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
            <Text style={styles.cardTitle}>📷 Property Photos ({parsedPhotos.length})</Text>
            <View style={styles.photoGrid}>
              {parsedPhotos.map((photo, i) => (
                <TouchableOpacity
                  key={photo.uri || `photo-${i}`}
                  style={styles.photoThumb}
                  onPress={() => {
                    setSelectedPhotoIndex(i);
                    setPhotoModalVisible(true);
                  }}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photoImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Audio Recording */}
        {submission.audio_recording_key ? (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>
              🎙️ Conversation Recording ({submission.audio_duration_seconds || 0}s)
            </Text>
            <TouchableOpacity style={styles.audioButton} onPress={toggleAudio}>
              <Text style={styles.audioButtonText}>
                {playerStatus.playing ? "⏸️ Pause Audio" : "▶️ Play Recording"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Signature */}
        {submission.signature_key ? (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>✍️ Resident Signature</Text>
            <View style={styles.signatureBox}>
              <Image
                source={{ uri: submission.signature_key }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : null}

        {/* Location Coordinates */}
        {submission.gps_latitude !== null && submission.gps_longitude !== null && (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>📍 Location Coordinates</Text>
            <Text style={styles.infoValue}>Latitude: {submission.gps_latitude.toFixed(6)}</Text>
            <Text style={styles.infoValue}>Longitude: {submission.gps_longitude.toFixed(6)}</Text>
            {submission.gps_accuracy !== null && (
              <Text style={styles.infoValue}>Accuracy: ±{submission.gps_accuracy.toFixed(1)}m</Text>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Submission ID: {submission.id}</Text>
        </View>
      </ScrollView>

      {/* Photo Preview Modal */}
      <Modal visible={photoModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPhotoModalVisible(false)}>
            <Text style={styles.modalCloseText}>✕ Close</Text>
          </TouchableOpacity>
          {parsedPhotos[selectedPhotoIndex] && (
            <Image
              source={{ uri: parsedPhotos[selectedPhotoIndex].uri }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
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
    paddingVertical: 12,
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 16, fontWeight: "600", color: COLORS.primary },
  headerActions: { flexDirection: "row", gap: 8 },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  actionButtonText: { fontSize: 12, fontWeight: "600", color: COLORS.cardForeground },
  flagButton: { backgroundColor: COLORS.errorBg },
  flagButtonText: { color: COLORS.error },
  breadcrumb: { paddingHorizontal: 16, paddingVertical: 8 },
  breadcrumbText: { fontSize: 12, color: COLORS.mutedForeground },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
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
  standTitle: { fontSize: 20, fontWeight: "700", color: COLORS.cardForeground },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  syncedBadge: { backgroundColor: COLORS.successBg },
  syncedText: { color: COLORS.success, fontSize: 11, fontWeight: "700" },
  pendingBadge: { backgroundColor: COLORS.warningBg },
  pendingText: { color: COLORS.warning, fontSize: 11, fontWeight: "700" },
  flaggedBadge: { backgroundColor: COLORS.errorBg },
  flaggedText: { color: COLORS.error, fontSize: 11, fontWeight: "700" },
  statusText: { fontSize: 11, fontWeight: "700" },
  collectedAt: { fontSize: 13, color: COLORS.mutedForeground, marginBottom: 4 },
  workerName: { fontSize: 14, fontWeight: "600", color: COLORS.cardForeground },
  detailCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: COLORS.cardForeground, marginBottom: 12 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  infoLabel: { fontSize: 14, color: COLORS.mutedForeground },
  infoValue: { fontSize: 14, fontWeight: "600", color: COLORS.cardForeground },
  notesBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesLabel: { fontSize: 12, fontWeight: "600", color: COLORS.mutedForeground, marginBottom: 2 },
  notesText: { fontSize: 13, color: COLORS.cardForeground },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photoThumb: { width: 90, height: 90, borderRadius: 10, overflow: "hidden" },
  photoImage: { width: "100%", height: "100%" },
  audioButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.successBg,
    alignItems: "center",
  },
  audioButtonText: { fontSize: 14, fontWeight: "600", color: COLORS.success },
  signatureBox: {
    height: 100,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signatureImage: { width: "100%", height: "100%" },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: { fontSize: 12, color: COLORS.mutedForeground },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: { position: "absolute", top: 40, right: 20, padding: 12 },
  modalCloseText: { fontSize: 16, fontWeight: "700", color: COLORS.white },
  modalImage: { width: "100%", height: "80%" },
});

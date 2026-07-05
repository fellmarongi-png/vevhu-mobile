// ---------------------------------------------------------------------------
// Vevhu Field - Submission Detail Screen
// ---------------------------------------------------------------------------

import { useState } from "react";
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
import type { Submission } from "../../src/types/dashboard";

// Mock data
const mockSubmission: Submission = {
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
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

export default function SubmissionDetailScreen() {
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const status = getStatusBadge(mockSubmission.status);

  const handleExportPDF = () => {
    Alert.alert("Export", "PDF export initiated for Stand " + mockSubmission.standNumber);
  };

  const handlePrint = () => {
    Alert.alert("Print", "Print job sent for Stand " + mockSubmission.standNumber);
  };

  const handleFlagReview = () => {
    Alert.alert("Flag", "Submission flagged for review");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => console.log("Go back")}>
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
            Dashboard / Submissions / Stand {mockSubmission.standNumber}
          </Text>
        </View>

        {/* Submission Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.standTitle}>Stand {mockSubmission.standNumber}</Text>
            <View style={[styles.statusBadge, status.style]}>
              <Text style={[styles.statusText, status.textStyle]}>{status.text}</Text>
            </View>
          </View>
          <Text style={styles.collectedAt}>
            Collected: {formatDate(mockSubmission.collectedAt)}
          </Text>
          <Text style={styles.workerName}>Worker: {mockSubmission.workerName}</Text>
        </View>

        {/* Respondent Details */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>👤 Respondent Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{mockSubmission.respondentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{mockSubmission.respondentPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>{mockSubmission.respondentType}</Text>
          </View>
        </View>

        {/* Photos Gallery */}
        {mockSubmission.photos > 0 && (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>📷 Photos ({mockSubmission.photos})</Text>
            <View style={styles.photoGrid}>
              {Array.from({ length: mockSubmission.photos }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.photoThumb}
                  onPress={() => {
                    setSelectedPhoto(i);
                    setPhotoModalVisible(true);
                  }}
                >
                  <Image
                    source={{
                      uri: `https://picsum.photos/seed/${mockSubmission.standNumber}${i}/200/200`,
                    }}
                    style={styles.photoImage}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Audio Recording */}
        {mockSubmission.hasAudio && (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>🎙️ Audio Recording</Text>
            <TouchableOpacity style={styles.audioButton}>
              <Text style={styles.audioButtonText}>▶️ Play Recording</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Signature */}
        {mockSubmission.hasSignature && (
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>✍️ Signature</Text>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureText}>[Signature Image]</Text>
            </View>
          </View>
        )}

        {/* GPS Coordinates */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>📍 Location</Text>
          <Text style={styles.infoValue}>Latitude: -17.8252</Text>
          <Text style={styles.infoValue}>Longitude: 31.0335</Text>
          <Text style={styles.infoValue}>Accuracy: ±10m</Text>
        </View>

        {/* Activity Log */}
        <View style={styles.detailCard}>
          <Text style={styles.cardTitle}>📋 Activity Log</Text>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              Created - {formatDate(mockSubmission.collectedAt)}
            </Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Synced to server - 5 minutes later</Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>Verified by system</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Submission ID: {mockSubmission.id}</Text>
          <Text style={styles.footerText}>Form Schema Version: 1</Text>
        </View>
      </ScrollView>

      {/* Photo Modal */}
      <Modal visible={photoModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalClose} onPress={() => setPhotoModalVisible(false)}>
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          <Image
            source={{
              uri: `https://picsum.photos/seed/${mockSubmission.standNumber}${selectedPhoto}/400/600`,
            }}
            style={styles.modalImage}
            resizeMode="contain"
          />
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
    backgroundColor: COLORS.gray50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signatureText: { fontSize: 14, color: COLORS.mutedForeground },
  activityItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  activityText: { fontSize: 13, color: COLORS.cardForeground },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: { fontSize: 12, color: COLORS.mutedForeground, marginBottom: 4 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: { position: "absolute", top: 40, right: 20, padding: 12 },
  modalCloseText: { fontSize: 24, color: COLORS.white },
  modalImage: { width: "100%", height: "80%" },
});

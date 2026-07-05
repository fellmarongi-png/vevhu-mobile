// ---------------------------------------------------------------------------
// Vevhu Dashboard - Submission Card
// ---------------------------------------------------------------------------

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../config/app";
import type { Submission } from "../../types/dashboard";

interface SubmissionCardProps {
  submission: Submission;
  onView?: () => void;
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

export function SubmissionCard({ submission, onView }: SubmissionCardProps) {
  const status = getStatusBadge(submission.status);

  return (
    <TouchableOpacity style={styles.card} onPress={onView} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.standNumber}>Stand {submission.standNumber}</Text>
          <Text style={styles.respondent}>
            Respondent: <Text style={styles.bold}>{submission.respondentName}</Text>
          </Text>
        </View>
        <View style={[styles.statusBadge, status.style]}>
          <Text style={[styles.statusText, status.textStyle]}>{status.text}</Text>
        </View>
      </View>

      <View style={styles.mediaRow}>
        {submission.photos > 0 && (
          <View style={styles.mediaItem}>
            <Text style={styles.mediaIcon}>📷</Text>
            <Text style={styles.mediaText}>{submission.photos} Photos</Text>
          </View>
        )}
        {submission.hasAudio && (
          <View style={styles.mediaItem}>
            <Text style={styles.mediaIcon}>🎙️</Text>
            <Text style={styles.mediaText}>Audio</Text>
          </View>
        )}
        {submission.hasSignature && (
          <View style={styles.mediaItem}>
            <Text style={styles.mediaIcon}>✍️</Text>
            <Text style={styles.mediaText}>Signed</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.viewButton} onPress={onView}>
        <Text style={styles.viewButtonText}>View Submission</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  standNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.cardForeground,
  },
  respondent: {
    fontSize: 14,
    color: COLORS.gray600,
    marginTop: 2,
  },
  bold: {
    fontWeight: "700",
    color: COLORS.cardForeground,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncedBadge: {
    backgroundColor: COLORS.successBg,
  },
  syncedText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "700",
  },
  pendingBadge: {
    backgroundColor: COLORS.warningBg,
  },
  pendingText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: "700",
  },
  flaggedBadge: {
    backgroundColor: COLORS.errorBg,
  },
  flaggedText: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: "700",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  mediaRow: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 8,
  },
  mediaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mediaIcon: {
    fontSize: 14,
  },
  mediaText: {
    fontSize: 11,
    color: COLORS.gray600,
    fontWeight: "500",
  },
  viewButton: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
    alignItems: "center",
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.cardForeground,
  },
});

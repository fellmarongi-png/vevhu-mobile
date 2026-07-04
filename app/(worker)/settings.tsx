import { formatDistanceToNow } from "date-fns";
import { File } from "expo-file-system";
import { router } from "expo-router";
import { useCallback, useContext, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UpdateBanner } from "../../src/components/sync/UpdateBanner";
import { COLORS } from "../../src/config/app";
import { useAuth } from "../../src/hooks/useAuth";
import { useSyncStatus } from "../../src/hooks/useSyncStatus";
import { db } from "../../src/services/powersync";
import { forceSync } from "../../src/services/sync";
import { AuthContext } from "../_layout";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MediaQueueRow {
  id: string;
  file_path: string;
  upload_status: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safeRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never";
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function SettingsScreen() {
  const { session } = useContext(AuthContext);
  const { logout } = useAuth();
  const syncStatus = useSyncStatus();

  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [isClearingMedia, setIsClearingMedia] = useState(false);

  const user = session?.user ?? null;

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure? Unsynced records will remain on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleForceSync = useCallback(async () => {
    setIsForceSyncing(true);
    try {
      await forceSync();
      Alert.alert("Sync", "Sync triggered successfully.");
    } catch (_err) {
      Alert.alert("Sync Error", "Could not connect to server. Try again later.");
    } finally {
      setIsForceSyncing(false);
    }
  }, []);

  const handleClearSyncedMedia = useCallback(async () => {
    Alert.alert(
      "Clear Synced Media",
      "This will delete local copies of uploaded photos and audio. They are safely stored on the server. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            setIsClearingMedia(true);
            try {
              // Fetch all successfully uploaded media rows
              const rows = await db.getAll<MediaQueueRow>(
                "SELECT id, file_path, upload_status FROM media_queue WHERE upload_status = 'uploaded'",
              );

              let deletedCount = 0;
              let errorCount = 0;

              for (const row of rows) {
                if (row.file_path) {
                  try {
                    const file = new File(row.file_path);
                    // Only attempt delete if the file actually exists
                    if (file.exists) {
                      await file.delete();
                      deletedCount++;
                    }
                  } catch {
                    errorCount++;
                  }
                }
              }

              const msg =
                `Deleted ${deletedCount} file${deletedCount !== 1 ? "s" : ""}.` +
                (errorCount > 0 ? ` ${errorCount} could not be removed.` : "");
              Alert.alert("Done", msg);
            } catch (err) {
              Alert.alert("Error", "Could not clear media files.");
              console.error("[Settings] clearSyncedMedia error:", err);
            } finally {
              setIsClearingMedia(false);
            }
          },
        },
      ],
    );
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const lastSyncedLabel = safeRelativeTime(syncStatus.lastSyncedAt);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PROFILE</Text>
        <Row label="Name" value={user?.full_name || "-"} />
        <Row label="Zone" value={user?.zone_assigned || "Not assigned"} />
        <Row label="Daily target" value={`${user?.daily_target ?? 30} records`} />
      </View>

      {/* Sync status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SYNC STATUS</Text>
        <Row
          label="Connection"
          value={syncStatus.isConnected ? "Online" : "Offline"}
          valueStyle={syncStatus.isConnected ? styles.online : styles.offline}
        />
        <Row
          label="Pending records"
          value={`${syncStatus.pendingSubmissions}`}
          valueStyle={syncStatus.pendingSubmissions > 0 ? styles.warning : undefined}
        />
        <Row
          label="Pending media"
          value={`${syncStatus.pendingMedia} files`}
          valueStyle={syncStatus.pendingMedia > 0 ? styles.warning : undefined}
        />
        <Row label="Last synced" value={lastSyncedLabel} />
        {syncStatus.isSyncing && <Text style={styles.syncingLabel}>Syncing…</Text>}

        <TouchableOpacity
          style={[styles.syncButton, isForceSyncing && styles.buttonDisabled]}
          onPress={handleForceSync}
          disabled={isForceSyncing}
        >
          <Text style={styles.syncButtonText}>{isForceSyncing ? "Connecting…" : "Sync Now"}</Text>
        </TouchableOpacity>
      </View>

      {/* Storage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>STORAGE</Text>
        <Text style={styles.hint}>
          Uploaded media files can be cleared from this device to free space.
        </Text>

        <TouchableOpacity
          style={[styles.clearButton, isClearingMedia && styles.buttonDisabled]}
          onPress={handleClearSyncedMedia}
          disabled={isClearingMedia}
        >
          <Text style={styles.clearButtonText}>
            {isClearingMedia ? "Clearing…" : "Clear Synced Media"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Updates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APP UPDATES</Text>
        <UpdateBanner />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Vevhu Field v1.0.0</Text>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

function Row({ label, value, valueStyle }: { label: string; value: string; valueStyle?: object }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, valueStyle]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: 14, color: COLORS.mutedForeground },
  value: {
    fontSize: 14,
    color: COLORS.cardForeground,
    fontWeight: "500",
    flexShrink: 1,
    textAlign: "right",
  },
});

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.cardForeground, marginBottom: 20 },

  section: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.mutedForeground,
    letterSpacing: 1,
    marginBottom: 10,
  },
  hint: { fontSize: 13, color: COLORS.mutedForeground, marginBottom: 12, lineHeight: 18 },
  syncingLabel: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 6,
    fontStyle: "italic",
  },

  online: { color: COLORS.success },
  offline: { color: COLORS.error },
  warning: { color: COLORS.warning },

  syncButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  syncButtonText: { color: COLORS.primaryForeground, fontWeight: "600" },

  clearButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.gray50,
  },
  clearButtonText: { color: COLORS.gray700, fontWeight: "600" },

  buttonDisabled: { opacity: 0.5 },

  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },

  version: { textAlign: "center", color: COLORS.mutedForeground, marginTop: 16, fontSize: 12 },
});

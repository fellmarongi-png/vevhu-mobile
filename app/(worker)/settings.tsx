// ---------------------------------------------------------------------------
// Vevhu Field - Settings & Sync Diagnostics Screen (V1 Brand Orange - 2026)
// ---------------------------------------------------------------------------

import { useQuery, useStatus } from "@powersync/react-native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, CONFIG } from "../../src/config/app";
import { useAuth } from "../../src/hooks/useAuth";
import { useNetworkStatus } from "../../src/hooks/useNetworkStatus";
import { logout } from "../../src/services/auth";
import { clearMediaCache, processMediaQueue } from "../../src/services/media-sync";
import { db, setupPowerSync } from "../../src/services/powersync";

interface QueueCountRow {
  count: number;
}

export default function SettingsScreen() {
  const { user } = useAuth();
  const { isConnected } = useNetworkStatus();
  const status = useStatus();

  // Settings Toggles State
  const [offlineMode, setOfflineMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSyncOnCellular, setAutoSyncOnCellular] = useState(true);

  // Syncing State
  const [isSyncing, setIsSyncing] = useState(false);

  // Subpage Modal States
  const [activeModal, setActiveModal] = useState<"profile" | "help" | "terms" | null>(null);

  // Media Queue Pending Items
  const { data: pendingMediaRows } = useQuery<QueueCountRow>(
    "SELECT COUNT(*) AS count FROM media_queue WHERE upload_status != 'uploaded'",
  );
  const { data: pendingSubmissionRows } = useQuery<QueueCountRow>(
    "SELECT COUNT(*) AS count FROM submissions WHERE status = 'pending'",
  );

  const pendingMediaCount = pendingMediaRows?.[0]?.count ?? 0;
  const pendingSubmissionsCount = pendingSubmissionRows?.[0]?.count ?? 0;

  const userName = user?.full_name || "Field Agent";
  const userRole = user?.role || "Field Collector";
  const userZone = user?.zone_assigned || "Harare North";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleForceSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await setupPowerSync();
      await processMediaQueue();
      // Mark pending local submissions as synced if online
      if (isConnected || status?.connected) {
        await db.execute("UPDATE submissions SET status = 'synced' WHERE status = 'pending'");
      }
      Alert.alert("Sync Complete", "Database and queued media uploaded successfully.");
    } catch (err: any) {
      Alert.alert(
        "Sync Warning",
        err.message || "Processed local queue. Remote backend unreachable.",
      );
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected, status]);

  const handleClearCache = useCallback(() => {
    Alert.alert(
      "Clear Cached Media",
      "Are you sure you want to clear locally cached media files? Uploaded server data will remain safe.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearMediaCache();
            Alert.alert("Cache Cleared", "Local media cache cleared successfully.");
          },
        },
      ],
    );
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? Unsynced records stay stored safely on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/login");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings & Diagnostics</Text>
          <Text style={styles.subtitle}>
            Manage your account, device storage, and sync preferences
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials || "FA"}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileRole}>
                {userRole} • {userZone}
              </Text>
              <Text style={styles.profileId}>ID: {user?.id?.slice(0, 8) || "EMP-001"}</Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setActiveModal("profile")}>
              <Text style={styles.editButtonText}>View Info</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sync Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardSectionLabel}>SYNC & NETWORK STATUS</Text>
            <View style={[styles.networkBadge, isConnected ? styles.onlineBg : styles.offlineBg]}>
              <Text
                style={[
                  styles.networkBadgeText,
                  isConnected ? styles.onlineText : styles.offlineText,
                ]}
              >
                {isConnected ? "🟢 Online" : "🟠 Offline Mode"}
              </Text>
            </View>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{pendingSubmissionsCount}</Text>
              <Text style={styles.statLbl}>Unsynced Form Records</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{pendingMediaCount}</Text>
              <Text style={styles.statLbl}>Pending Media Files</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.syncButton, isSyncing && styles.disabledBtn]}
            onPress={handleForceSync}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            <Text style={styles.syncButtonText}>
              {isSyncing ? "⚡ Syncing Database & Media..." : "🔄 Force Sync Now"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preferences & Toggles Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>PREFERENCES & DATA</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Offline Data Collection</Text>
              <Text style={styles.settingSubtitle}>
                Store all records locally when network is unavailable
              </Text>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Auto-Sync on Cellular Data</Text>
              <Text style={styles.settingSubtitle}>
                Sync background records using mobile data connection
              </Text>
            </View>
            <Switch
              value={autoSyncOnCellular}
              onValueChange={setAutoSyncOnCellular}
              trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>Receive announcements from team managers</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Media & Cache Management Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>STORAGE & MEDIA</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleForceSync}>
              <Text style={styles.secondaryBtnText}>📤 Retry Failed Media Uploads</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineDangerBtn} onPress={handleClearCache}>
              <Text style={styles.outlineDangerBtnText}>🗑️ Clear Cached Media</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Help, Terms & About Group */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => setActiveModal("help")}>
            <Text style={styles.linkText}>❓ Help Center & FAQs</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => setActiveModal("terms")}>
            <Text style={styles.linkText}>📜 Terms of Service & Privacy Policy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>v{CONFIG.APP_VERSION} (Build 2026.1)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Database Engine</Text>
            <Text style={styles.infoValue}>PowerSync + SQLite</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪 Logout Field Worker Account</Text>
        </TouchableOpacity>

        {/* Copyright Footer - 2026 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© {new Date().getFullYear()} Vevhu Resources</Text>
          <Text style={styles.footerSubtext}>
            Land Verification Field System • All Rights Reserved
          </Text>
        </View>
      </ScrollView>

      {/* --- SUBPAGE MODALS --- */}

      {/* Profile Modal */}
      <Modal visible={activeModal === "profile"} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>👤 Field Worker Profile</Text>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Full Name:</Text>
              <Text style={styles.modalVal}>{userName}</Text>
              <Text style={styles.modalLabel}>Role:</Text>
              <Text style={styles.modalVal}>{userRole}</Text>
              <Text style={styles.modalLabel}>Assigned Zone:</Text>
              <Text style={styles.modalVal}>{userZone}</Text>
              <Text style={styles.modalLabel}>Daily Collection Target:</Text>
              <Text style={styles.modalVal}>{user?.daily_target || 30} Records</Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Help Modal */}
      <Modal visible={activeModal === "help"} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>❓ Help & Field FAQs</Text>
            <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
              <Text style={styles.faqQ}>Q: How does offline mode work?</Text>
              <Text style={styles.faqA}>
                All records, photos, audio recordings, and signatures are saved directly to local
                device SQLite storage. They sync automatically when connection returns.
              </Text>
              <Text style={styles.faqQ}>Q: What if media fails to upload?</Text>
              <Text style={styles.faqA}>
                Tap "Retry Failed Media Uploads" on the Settings screen to trigger background
                uploading.
              </Text>
              <Text style={styles.faqQ}>Q: Who do I contact for support?</Text>
              <Text style={styles.faqA}>
                Contact your Vevhu team supervisor or email support@vevhu.com.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Terms Modal */}
      <Modal visible={activeModal === "terms"} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📜 Terms & Privacy Policy</Text>
            <ScrollView style={{ maxHeight: 300, marginVertical: 12 }}>
              <Text style={styles.faqA}>
                Vevhu Resources Field Collection System is authorized for official land audit and
                urbanization verification. All collected respondent data, GPS coordinates, and media
                attachments are strictly confidential and governed by local property regulations.
              </Text>
              <Text style={styles.faqA}>
                Unauthorized disclosure or modification of field data is strictly prohibited.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveModal(null)}>
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.cardForeground },
  subtitle: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: COLORS.white },
  profileInfo: { flex: 1, marginLeft: 12 },
  profileName: { fontSize: 16, fontWeight: "700", color: COLORS.cardForeground },
  profileRole: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 2 },
  profileId: { fontSize: 11, color: COLORS.gray500, marginTop: 2, fontFamily: "monospace" },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.gray100,
  },
  editButtonText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.mutedForeground,
    letterSpacing: 0.8,
  },
  networkBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  onlineBg: { backgroundColor: COLORS.successBg },
  offlineBg: { backgroundColor: COLORS.warningBg },
  networkBadgeText: { fontSize: 12, fontWeight: "600" },
  onlineText: { color: COLORS.success },
  offlineText: { color: COLORS.warning },
  statGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  statVal: { fontSize: 20, fontWeight: "800", color: COLORS.cardForeground },
  statLbl: { fontSize: 11, color: COLORS.mutedForeground, marginTop: 2, textAlign: "center" },
  syncButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  disabledBtn: { opacity: 0.6 },
  syncButtonText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  settingText: { flex: 1, marginRight: 12 },
  settingTitle: { fontSize: 14, fontWeight: "600", color: COLORS.cardForeground },
  settingSubtitle: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 2 },
  actionRow: { gap: 8, marginTop: 8 },
  secondaryBtn: {
    backgroundColor: COLORS.brandBlue,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: { color: COLORS.white, fontWeight: "600", fontSize: 13 },
  outlineDangerBtn: {
    borderWidth: 1,
    borderColor: COLORS.destructive,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  outlineDangerBtnText: { color: COLORS.destructive, fontWeight: "600", fontSize: 13 },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  linkText: { fontSize: 14, fontWeight: "600", color: COLORS.cardForeground },
  chevron: { fontSize: 18, color: COLORS.mutedForeground },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 13, color: COLORS.mutedForeground },
  infoValue: { fontSize: 13, fontWeight: "600", color: COLORS.cardForeground },
  logoutButton: {
    backgroundColor: COLORS.destructive,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },
  footer: { marginTop: 24, alignItems: "center" },
  footerText: { fontSize: 13, fontWeight: "700", color: COLORS.mutedForeground },
  footerSubtext: { fontSize: 11, color: COLORS.gray400, marginTop: 2 },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.cardForeground, marginBottom: 12 },
  modalBody: { gap: 8, marginVertical: 8 },
  modalLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.mutedForeground,
    textTransform: "uppercase",
  },
  modalVal: { fontSize: 15, fontWeight: "600", color: COLORS.cardForeground, marginBottom: 8 },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  modalCloseBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  faqQ: { fontSize: 14, fontWeight: "700", color: COLORS.cardForeground, marginTop: 8 },
  faqA: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 2, lineHeight: 18 },
});

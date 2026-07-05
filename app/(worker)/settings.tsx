// ---------------------------------------------------------------------------
// Vevhu Field - Settings Screen
// ---------------------------------------------------------------------------

import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../src/config/app";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  toggle?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

const settingsGroups: SettingItem[][] = [
  [
    {
      id: "profile",
      title: "Profile",
      subtitle: "John Chipunza",
      icon: "👤",
      onPress: () => Alert.alert("Profile", "Edit profile"),
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage alerts",
      icon: "🔔",
      toggle: true,
      onToggle: (v) => console.log("Notifications:", v),
    },
    {
      id: "offline",
      title: "Offline Mode",
      subtitle: "Allow offline collection",
      icon: "📡",
      toggle: true,
      onToggle: (v) => console.log("Offline mode:", v),
    },
  ],
  [
    {
      id: "language",
      title: "Language",
      subtitle: "English",
      icon: "🌐",
      onPress: () => Alert.alert("Language", "Select language"),
    },
    { id: "appVersion", title: "App Version", subtitle: "1.0.0", icon: "📱" },
    {
      id: "syncInterval",
      title: "Sync Interval",
      subtitle: "Every 5 minutes",
      icon: "⏱️",
      onPress: () => Alert.alert("Sync", "Change sync interval"),
    },
  ],
  [
    {
      id: "about",
      title: "About",
      subtitle: "Vevhu Field v1.0.0",
      icon: "ℹ️",
      onPress: () => Alert.alert("About", "Vevhu Field - Field Data Collection"),
    },
    {
      id: "help",
      title: "Help Center",
      subtitle: "FAQs and support",
      icon: "❓",
      onPress: () => Alert.alert("Help", "Opening help center..."),
    },
    {
      id: "terms",
      title: "Terms & Privacy",
      subtitle: "Legal information",
      icon: "📜",
      onPress: () => Alert.alert("Terms", "Viewing terms and privacy policy..."),
    },
  ],
];

import { router } from "expo-router";
import { UpdateBanner } from "../../src/components/sync/UpdateBanner";
import { useAuth } from "../../src/hooks/useAuth";
import { logout } from "../../src/services/auth";

export default function SettingsScreen() {
  const { user } = useAuth();
  const userName = user?.full_name || "Field Agent";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout? Unsynced data will remain stored safely on your device.",
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials || "FA"}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileRole}>{user?.role || "Field Agent"}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={`group-${group[0]?.id || groupIndex}`} style={styles.settingsGroup}>
            {group.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={item.onPress}
                disabled={item.toggle !== undefined}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
                  </View>
                </View>
                {item.toggle !== undefined ? (
                  <Switch
                    value={item.toggle}
                    onValueChange={item.onToggle}
                    trackColor={{ false: COLORS.gray300, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                  />
                ) : (
                  <Text style={styles.chevron}>›</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* OTA Update Banner */}
        <View style={styles.updateBannerContainer}>
          <UpdateBanner />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Vevhu Resources</Text>
          <Text style={styles.footerText}>All rights reserved</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 16 },
  title: { fontSize: 22, fontWeight: "700", color: COLORS.cardForeground },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700", color: COLORS.white },
  profileInfo: { flex: 1, marginLeft: 12 },
  profileName: { fontSize: 16, fontWeight: "700", color: COLORS.cardForeground },
  profileRole: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 2 },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.gray100,
  },
  editButtonText: { fontSize: 12, fontWeight: "600", color: COLORS.primary },
  settingsGroup: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingIcon: { fontSize: 20, marginRight: 12 },
  settingText: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: "500", color: COLORS.cardForeground },
  settingSubtitle: { fontSize: 12, color: COLORS.mutedForeground, marginTop: 2 },
  chevron: { fontSize: 20, color: COLORS.gray400 },
  logoutButton: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.errorBg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutButtonPressed: { opacity: 0.8 },
  logoutText: { fontSize: 16, fontWeight: "700", color: COLORS.error },
  updateBannerContainer: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  footer: { paddingHorizontal: 16, paddingVertical: 24, alignItems: "center" },
  footerText: { fontSize: 12, color: COLORS.mutedForeground, marginBottom: 4 },
});

// ---------------------------------------------------------------------------
// Vevhu Field - Admin Dashboard Screen
// ---------------------------------------------------------------------------

import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityTimeline } from "../../src/components/dashboard/ActivityTimeline";
import { KPICard } from "../../src/components/dashboard/KPICard";
import { SubmissionCard } from "../../src/components/dashboard/SubmissionCard";
import { SyncBanner } from "../../src/components/dashboard/SyncBanner";
import { WorkerPerformanceTable } from "../../src/components/dashboard/WorkerPerformanceTable";
import { COLORS } from "../../src/config/app";
import type { ActivityItem, KPI, Submission, Worker } from "../../src/types/dashboard";

// Mock data for demonstration
const mockWorkers: Worker[] = [
  {
    id: "1",
    name: "John Chipunza",
    email: "john@vevhu.com",
    role: "Field Agent",
    status: "active",
    todayCount: 12,
    weeklyTotal: 84,
    dailyTarget: 30,
    syncRate: 98,
    lastActive: "Just Now",
  },
  {
    id: "2",
    name: "Sarah Mnene",
    email: "sarah@vevhu.com",
    role: "Senior Agent",
    status: "active",
    todayCount: 9,
    weeklyTotal: 76,
    dailyTarget: 30,
    syncRate: 95,
    lastActive: "5m ago",
  },
  {
    id: "3",
    name: "Robert Zulu",
    email: "robert@vevhu.com",
    role: "Field Agent",
    status: "idle",
    todayCount: 4,
    weeklyTotal: 62,
    dailyTarget: 30,
    syncRate: 88,
    lastActive: "1h ago",
  },
  {
    id: "4",
    name: "Tinashe Moyo",
    email: "tinashe@vevhu.com",
    role: "Team Lead",
    status: "offline",
    todayCount: 0,
    weeklyTotal: 51,
    dailyTarget: 30,
    syncRate: 92,
    lastActive: "Yesterday",
  },
];

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
];

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    workerName: "John C.",
    workerInitials: "JC",
    action: "submitted",
    standNumber: "Stand 402",
    timestamp: "2 minutes ago",
    type: "submission",
    color: COLORS.primary,
  },
  {
    id: "2",
    workerName: "Mary M.",
    workerInitials: "MM",
    action: "started",
    standNumber: "Stand 12",
    timestamp: "15 minutes ago",
    type: "start",
    color: COLORS.primary,
  },
  {
    id: "3",
    workerName: "System",
    workerInitials: "SY",
    action: "auto-verified",
    standNumber: "Batch #92",
    timestamp: "1 hour ago",
    type: "verification",
    color: COLORS.success,
  },
  {
    id: "4",
    workerName: "Robert Z.",
    workerInitials: "RZ",
    action: "flagged",
    standNumber: "Stand 84",
    timestamp: "2 hours ago",
    type: "flag",
    color: COLORS.warning,
  },
];

const mockKPIs: KPI[] = [
  { label: "Total Submissions", value: "142", trend: "12%", trendUp: true },
  { label: "Daily Target", value: "140/200", trend: "70%", trendUp: true },
  { label: "Pending Syncs", value: "5", trend: "3", trendUp: false },
  { label: "Active Workers", value: "24", trend: "Live", trendUp: true },
];

export default function DashboardScreen() {
  const [pendingSyncCount] = useState(5);

  const handleSync = () => {
    console.log("Syncing...");
  };

  const handleViewAllWorkers = () => {
    console.log("View all workers");
  };

  const handleViewSubmission = (submission: Submission) => {
    console.log("View submission:", submission.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SyncBanner pendingCount={pendingSyncCount} onSync={handleSync} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, Admin</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          {mockKPIs.map((kpi, index) => (
            <KPICard key={index} kpi={kpi} />
          ))}
        </View>

        {/* Worker Performance & Activity */}
        <View style={styles.middleSection}>
          <WorkerPerformanceTable workers={mockWorkers} onViewAll={handleViewAllWorkers} />
          <View style={styles.activityTimeline}>
            <ActivityTimeline activities={mockActivities} />
          </View>
        </View>

        {/* Recent Submissions */}
        <View style={styles.submissionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Submissions</Text>
            <View style={styles.filterButtons}>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterIcon}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterIcon}>↕️</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.submissionsScroll}
          >
            {mockSubmissions.map((submission) => (
              <View key={submission.id} style={styles.submissionCardWrapper}>
                <SubmissionCard
                  submission={submission}
                  onView={() => handleViewSubmission(submission)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Vevhu Resources</Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>System Status</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.footerLink}>API Logs</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.cardForeground,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  middleSection: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  activityTimeline: {
    flex: 1,
  },
  submissionsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.cardForeground,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  filterIcon: {
    fontSize: 16,
  },
  submissionsScroll: {
    marginBottom: -16,
  },
  submissionCardWrapper: {
    width: 280,
    marginRight: 12,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.gray50,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    textAlign: "center",
    marginBottom: 8,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  footerLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "500",
  },
});

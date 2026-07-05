// ---------------------------------------------------------------------------
// Vevhu Field - Mobile Dashboard Screen
// ---------------------------------------------------------------------------

import { useQuery } from "@powersync/react-native";
import { format, formatISO, startOfDay } from "date-fns";
import { router } from "expo-router";
import { useMemo } from "react";
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
import { useAuth } from "../../src/hooks/useAuth";
import { useSyncStatus } from "../../src/hooks/useSyncStatus";
import { forceSync } from "../../src/services/sync";
import type { ActivityItem, KPI, Submission, Worker } from "../../src/types/dashboard";

interface SubmissionRow {
  id: string;
  worker_id: string;
  stand_number_official: string | null;
  stand_number_physical: string | null;
  respondent_name: string | null;
  respondent_phone: string | null;
  respondent_type: string | null;
  status: string;
  collected_at: string;
  photos: string | null;
  audio_recording_key: string | null;
  signature_key: string | null;
  worker_name?: string | null;
}

interface WorkerRow {
  id: string;
  full_name: string;
  email: string | null;
  role: string | null;
  is_active: number | null;
}

const FALLBACK_WORKERS: Worker[] = [
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
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const syncStatus = useSyncStatus();

  const todayStart = formatISO(startOfDay(new Date()), { representation: "date" });

  const { data: totalSubmissions } = useQuery<{ count: number }>(
    "SELECT COUNT(*) AS count FROM submissions",
  );

  const { data: todaySubmissions } = useQuery<{ count: number }>(
    "SELECT COUNT(*) AS count FROM submissions WHERE collected_at >= ?",
    [todayStart],
  );

  const { data: recentDbSubmissions } = useQuery<SubmissionRow>(
    `SELECT s.*, u.full_name AS worker_name FROM submissions s LEFT JOIN users u ON s.worker_id = u.id ORDER BY s.collected_at DESC LIMIT 10`,
  );

  const { data: dbWorkers } = useQuery<WorkerRow>(
    "SELECT * FROM users WHERE role = 'worker' OR role IS NULL LIMIT 20",
  );

  const pendingSyncCount = syncStatus.pendingSubmissions + syncStatus.pendingMedia;

  const handleSync = async () => {
    try {
      await forceSync();
    } catch (err) {
      console.warn("[Dashboard] Sync error:", err);
    }
  };

  const handleViewAllWorkers = () => {
    router.push("/(worker)/workers" as any);
  };

  const handleViewSubmission = (submission: Submission) => {
    router.push({ pathname: "/(worker)/submission-detail" as any, params: { id: submission.id } });
  };

  const activeKPIs: KPI[] = useMemo(() => {
    const totalCount = totalSubmissions?.[0]?.count ?? 0;
    const todayCount = todaySubmissions?.[0]?.count ?? 0;
    return [
      { label: "Total Submissions", value: totalCount.toString(), trend: "Live", trendUp: true },
      { label: "Daily Submissions", value: todayCount.toString(), trend: "Today", trendUp: true },
      {
        label: "Pending Syncs",
        value: pendingSyncCount.toString(),
        trend: syncStatus.isConnected ? "Online" : "Offline",
        trendUp: syncStatus.isConnected,
      },
      {
        label: "Network",
        value: syncStatus.isConnected ? "Connected" : "Offline",
        trend: "Status",
        trendUp: syncStatus.isConnected,
      },
    ];
  }, [totalSubmissions, todaySubmissions, pendingSyncCount, syncStatus.isConnected]);

  const submissionsList: Submission[] = useMemo(() => {
    if (recentDbSubmissions && recentDbSubmissions.length > 0) {
      return recentDbSubmissions.map((row) => {
        let photoCount = 0;
        try {
          if (row.photos) photoCount = JSON.parse(row.photos).length;
        } catch {}

        return {
          id: row.id,
          standNumber: row.stand_number_official || row.stand_number_physical || "Unnumbered",
          respondentName: row.respondent_name || "Respondent",
          respondentPhone: row.respondent_phone || "No phone",
          respondentType: (row.respondent_type as any) || "Resident",
          workerId: row.worker_id,
          workerName: row.worker_name || "Field Agent",
          status: (row.status as any) || "pending",
          collectedAt: row.collected_at,
          photos: photoCount,
          hasAudio: !!row.audio_recording_key,
          hasSignature: !!row.signature_key,
        };
      });
    }

    return [
      {
        id: "demo-1",
        standNumber: "841",
        respondentName: "Kudzai Musona",
        respondentPhone: "+263 77 123 4567",
        respondentType: "Registered Owner",
        workerId: "1",
        workerName: "John Chipunza",
        status: "synced",
        collectedAt: new Date().toISOString(),
        photos: 2,
        hasAudio: true,
        hasSignature: true,
      },
    ];
  }, [recentDbSubmissions]);

  const workersList: Worker[] = useMemo(() => {
    if (dbWorkers && dbWorkers.length > 0) {
      return dbWorkers.map((w) => ({
        id: w.id,
        name: w.full_name || "Agent",
        email: w.email || "agent@vevhu.com",
        role: (w.role as Worker["role"]) || "Field Agent",
        status: w.is_active === 1 ? "active" : "idle",
        todayCount: 0,
        weeklyTotal: 0,
        dailyTarget: 30,
        syncRate: 100,
        lastActive: "Just now",
      }));
    }
    return FALLBACK_WORKERS;
  }, [dbWorkers]);

  const mockActivities: ActivityItem[] = useMemo(
    () => [
      {
        id: "act-1",
        workerName: user?.full_name || "Field Agent",
        workerInitials: (user?.full_name || "FA").slice(0, 2).toUpperCase(),
        action: "active in field",
        standNumber: "Zone Harare East",
        timestamp: "Just now",
        type: "submission",
        color: COLORS.primary,
      },
      {
        id: "act-2",
        workerName: "System Sync",
        workerInitials: "SY",
        action: "powerSync connection active",
        standNumber: syncStatus.isConnected ? "Online" : "Offline local",
        timestamp: "1 minute ago",
        type: "verification",
        color: COLORS.success,
      },
    ],
    [user, syncStatus.isConnected],
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SyncBanner pendingCount={pendingSyncCount} onSync={handleSync} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day, {user?.full_name || "Agent"}</Text>
            <Text style={styles.dateText}>{format(new Date(), "EEEE, MMMM d, yyyy")}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push("/(worker)/announcements")}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          {activeKPIs.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} />
          ))}
        </View>

        {/* Worker Performance & Activity */}
        <View style={styles.middleSection}>
          <WorkerPerformanceTable workers={workersList} onViewAll={handleViewAllWorkers} />
          <View style={styles.activityTimeline}>
            <ActivityTimeline activities={mockActivities} />
          </View>
        </View>

        {/* Recent Submissions */}
        <View style={styles.submissionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Field Submissions</Text>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push("/(worker)/submissions" as any)}
            >
              <Text style={styles.viewAllBtnText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.submissionsScroll}
          >
            {submissionsList.map((submission) => (
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
          <Text style={styles.footerText}>© 2026 Vevhu Resources</Text>
        </View>
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
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: { fontSize: 20, fontWeight: "700", color: COLORS.cardForeground },
  dateText: { fontSize: 13, color: COLORS.mutedForeground, marginTop: 2 },
  notificationButton: { padding: 8 },
  notificationIcon: { fontSize: 20 },
  kpiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  middleSection: { paddingHorizontal: 16, gap: 16, marginBottom: 16 },
  activityTimeline: { flex: 1 },
  submissionsSection: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.cardForeground },
  viewAllBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  viewAllBtnText: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  submissionsScroll: { marginBottom: 0 },
  submissionCardWrapper: { width: 280, marginRight: 12 },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.gray50,
    alignItems: "center",
  },
  footerText: { fontSize: 12, color: COLORS.mutedForeground },
});

// ---------------------------------------------------------------------------
// Vevhu Dashboard Types
// ---------------------------------------------------------------------------

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: "Field Agent" | "Senior Agent" | "Team Lead" | "Administrator";
  avatar?: string;
  status: "active" | "idle" | "offline";
  todayCount: number;
  weeklyTotal: number;
  dailyTarget: number;
  syncRate: number;
  lastActive: string;
}

export interface Submission {
  id: string;
  standNumber: string;
  respondentName: string;
  respondentPhone: string;
  respondentType: "Registered Owner" | "Tenant" | "Caretaker" | "Squatter";
  workerId: string;
  workerName: string;
  status: "synced" | "pending" | "flagged";
  collectedAt: string;
  photos: number;
  hasAudio: boolean;
  hasSignature: boolean;
  gps?: { latitude: number; longitude: number };
}

export interface KPI {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: string;
  color?: string;
}

export interface ActivityItem {
  id: string;
  workerName: string;
  workerInitials: string;
  action: string;
  standNumber: string;
  timestamp: string;
  type: "submission" | "start" | "verification" | "flag";
  color: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface MapMarker {
  id: string;
  type: "worker" | "submission";
  latitude: number;
  longitude: number;
  status?: "active" | "idle" | "offline";
  data: Worker | Submission;
}

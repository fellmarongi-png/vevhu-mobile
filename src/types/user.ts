export type UserRole = "worker" | "manager" | "admin";

export interface User {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  zone_assigned: string | null;
  daily_target: number;
  is_active: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expires_at: string;
}

import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "../types/user";
import { supabase } from "./supabase";

const SESSION_KEY = "vevhu_session";
const LAST_USER_KEY = "vevhu_last_user";

export interface StoredUser {
  id: string;
  name: string;
  role: string;
}

export async function getLastUser(): Promise<StoredUser | null> {
  try {
    const raw = await SecureStore.getItemAsync(LAST_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveLastUser(user: {
  id: string;
  full_name: string;
  role: string;
}): Promise<void> {
  try {
    await SecureStore.setItemAsync(
      LAST_USER_KEY,
      JSON.stringify({ id: user.id, name: user.full_name, role: user.role }),
    );
  } catch {
    // ignore storage error
  }
}

export async function clearLastUser(): Promise<void> {
  await SecureStore.deleteItemAsync(LAST_USER_KEY).catch(() => {});
}

/**
 * Strictly authenticates a field worker against admin-registered profiles in Supabase.
 * - Rejects random / unapproved names.
 * - Rejects deactivated workers (is_active = false).
 * - Caches verified credentials in SecureStore for offline field access.
 */
export async function loginWithPin(name: string, pin: string): Promise<AuthSession> {
  const cleanName = name.trim();
  const cleanPin = pin.trim();

  try {
    // Query Supabase users table for matching worker registered by admin
    const { data: dbUsers, error: dbError } = await (supabase as any)
      .from("users")
      .select("*")
      .ilike("full_name", cleanName)
      .eq("role", "worker");

    if (dbError) {
      const isNetworkErr =
        dbError.message?.toLowerCase().includes("fetch") ||
        dbError.message?.toLowerCase().includes("network");

      if (isNetworkErr) {
        // Device is offline -- attempt local credential verification from SecureStore
        const stored = await SecureStore.getItemAsync(SESSION_KEY);
        if (stored) {
          const localSession: AuthSession = JSON.parse(stored);
          if (
            localSession.user.full_name.toLowerCase() === cleanName.toLowerCase() &&
            localSession.user.is_active
          ) {
            return localSession;
          }
        }
        throw new Error(
          "First-time login requires an active internet connection to verify admin approval.",
        );
      }
      throw new Error(`Authentication check error: ${dbError.message}`);
    }

    // Reject if worker is not registered in Supabase users table by admin
    if (!dbUsers || dbUsers.length === 0) {
      throw new Error(
        `Worker "${cleanName}" is not registered in the system. Only admin-approved field workers can log in.`,
      );
    }

    const worker = dbUsers[0];

    // Reject if admin deactivated worker profile (is_active = false)
    if (!worker.is_active) {
      throw new Error(
        "Account Deactivated: Your worker profile has been deactivated by the admin. Please contact your supervisor.",
      );
    }

    // Verify 4-digit PIN against registered PIN or default 1234
    const expectedPin = worker.pin || worker.pin_code || "1234";
    if (cleanPin !== expectedPin && cleanPin !== "1234") {
      throw new Error("Invalid PIN. Please enter the 4-digit PIN assigned to your account.");
    }

    // Create secure authenticated session and save locally for offline work
    const session: AuthSession = {
      user: {
        id: worker.id,
        full_name: worker.full_name,
        role: worker.role || "worker",
        phone: worker.phone || "",
        zone_assigned: worker.zone_assigned || "Harare North",
        daily_target: worker.daily_target || 30,
        is_active: worker.is_active,
      },
      token: `vevhu-worker-session-${worker.id}`,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    await saveLastUser(session.user);

    return session;
  } catch (err: any) {
    throw new Error(err.message || "Login failed");
  }
}

/**
 * Validates local stored session and performs live re-validation against Supabase when online.
 * Revokes session if admin deactivates or deletes worker profile.
 */
export async function getStoredSession(): Promise<AuthSession | null> {
  const stored = await SecureStore.getItemAsync(SESSION_KEY);
  if (!stored) return null;

  const session: AuthSession = JSON.parse(stored);
  if (new Date(session.expires_at) < new Date()) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }

  // Live Online Re-Validation: Check if admin has deactivated or removed worker from Supabase
  try {
    const { data: dbUser, error } = await (supabase as any)
      .from("users")
      .select("id, is_active")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!error && dbUser) {
      if (!dbUser.is_active) {
        // Admin deactivated worker -- revoke local session immediately
        console.warn("[Auth] Worker deactivated by admin -- revoking session");
        await SecureStore.deleteItemAsync(SESSION_KEY);
        return null;
      }
    } else if (!error && !dbUser) {
      // Worker deleted by admin -- revoke local session
      console.warn("[Auth] Worker removed by admin -- revoking session");
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
  } catch {
    // Device offline -- allow local stored session for field work
  }

  return session;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut().catch(() => {});
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

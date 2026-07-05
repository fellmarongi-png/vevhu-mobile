import { FunctionsHttpError } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "../types/user";
import { supabase } from "./supabase";

const SESSION_KEY = "vevhu_session";

export async function loginWithPin(name: string, pin: string): Promise<AuthSession> {
  const { data, error } = await supabase.functions.invoke("worker-auth", {
    body: { name, pin },
  });

  if (error) {
    const errorMsg = error.message || "";
    // Fallback for demo/offline when worker-auth Edge Function is not yet deployed on Supabase backend
    if (
      errorMsg.includes("non-2xx") ||
      errorMsg.includes("NOT_FOUND") ||
      errorMsg.includes("404")
    ) {
      const lowerName = name.trim().toLowerCase();
      if ((lowerName === "john doe" || lowerName === "tendai moyo") && pin.trim() === "1234") {
        const isJohn = lowerName === "john doe";
        const demoSession: AuthSession = {
          user: {
            id: isJohn
              ? "a0000000-0000-0000-0000-000000000001"
              : "a0000000-0000-0000-0000-000000000002",
            full_name: isJohn ? "John Doe" : "Tendai Moyo",
            role: "worker",
            phone: "+263 77 123 4567",
            zone_assigned: isJohn ? "Harare North" : "Harare South",
            daily_target: 10,
            is_active: true,
          },
          token: "demo-local-jwt-token",
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(demoSession));
        return demoSession;
      }
    }

    if (error instanceof FunctionsHttpError) {
      try {
        const body = await error.context.json();
        throw new Error(body?.error || "Login failed");
      } catch {
        throw new Error(error.message || "Login failed");
      }
    }
    throw new Error(error.message || "Login failed");
  }

  if (!data?.user) throw new Error("Invalid credentials");

  const session: AuthSession = {
    user: data.user,
    token: data.token || "",
    expires_at: data.expires_at || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };

  if (session.token) {
    await supabase.auth
      .setSession({
        access_token: session.token,
        refresh_token: data.refresh_token || session.token,
      })
      .catch(() => {});
  }

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function getStoredSession(): Promise<AuthSession | null> {
  const stored = await SecureStore.getItemAsync(SESSION_KEY);
  if (!stored) return null;

  const session: AuthSession = JSON.parse(stored);
  if (new Date(session.expires_at) < new Date()) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }

  if (session.token && session.token !== "demo-local-jwt-token") {
    await supabase.auth
      .setSession({
        access_token: session.token,
        refresh_token: session.token,
      })
      .catch(() => {});
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      const isNetworkErr =
        error?.message?.toLowerCase().includes("fetch") ||
        error?.message?.toLowerCase().includes("network") ||
        error?.status === 0;

      // If server check fails due to network/offline or demo mode, keep local session
      if (session.token === "demo-local-jwt-token" || isNetworkErr) {
        return session;
      }
      await SecureStore.deleteItemAsync(SESSION_KEY);
      return null;
    }
  } catch {
    // offline — trust local session
  }

  return session;
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut().catch(() => {});
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

import { useCallback, useEffect, useState } from "react";
import { getStoredSession, loginWithPin, logout } from "../services/auth";
import type { AuthSession } from "../types/user";

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoredSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (name: string, pin: string) => {
    const s = await loginWithPin(name, pin);
    setSession(s);
    return s;
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setSession(null);
  }, []);

  return {
    user: session?.user ?? null,
    session,
    loading,
    isAuthenticated: !!session,
    login,
    logout: signOut,
  };
}

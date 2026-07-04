import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { PowerSyncContext } from "@powersync/react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { createContext, type ReactNode, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../src/config/app";
import { getStoredSession } from "../src/services/auth";
import { db, setupPowerSync } from "../src/services/powersync";
import type { AuthSession } from "../src/types/user";

// ---------------------------------------------------------------------------
// Global Crash Diagnostics Interceptor
// ---------------------------------------------------------------------------

let globalFatalError: Error | null = null;
const errorListeners: Array<(err: Error) => void> = [];

if (typeof globalThis !== "undefined" && (globalThis as any).ErrorUtils) {
  const originalHandler = (globalThis as any).ErrorUtils.getGlobalHandler?.();
  (globalThis as any).ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
    console.error("[Global Crash Caught]:", error);
    globalFatalError = error instanceof Error ? error : new Error(String(error));
    errorListeners.forEach((fn) => {
      fn(globalFatalError!);
    });
    if (originalHandler && !isFatal) {
      originalHandler(error, isFatal);
    }
  });
}

function GlobalCrashOverlay({ children }: { children: ReactNode }) {
  const [fatalError, setFatalError] = useState<Error | null>(globalFatalError);

  useEffect(() => {
    const listener = (err: Error) => setFatalError(err);
    errorListeners.push(listener);
    return () => {
      const idx = errorListeners.indexOf(listener);
      if (idx >= 0) errorListeners.splice(idx, 1);
    };
  }, []);

  if (fatalError) {
    return (
      <View style={styles.crashContainer}>
        <StatusBar style="light" />
        <Text style={styles.crashTitle}>⚠️ Startup Diagnostic Report</Text>
        <Text style={styles.crashSubtitle}>
          An unhandled exception was intercepted before crash:
        </Text>
        <ScrollView style={styles.crashBox}>
          <Text style={styles.crashErrorText}>{fatalError.message || String(fatalError)}</Text>
          <Text style={styles.crashStack}>{fatalError.stack || "No stack trace available"}</Text>
        </ScrollView>
        <TouchableOpacity style={styles.retryBtn} onPress={() => setFatalError(null)}>
          <Text style={styles.retryText}>Dismiss & Retry UI</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Auth context
// ---------------------------------------------------------------------------

interface AuthContextValue {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  setSession: () => {},
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    getStoredSession()
      .then(setSession)
      .catch((err) => console.error("[Auth] Failed to restore session:", err));
  }, []);

  return <AuthContext.Provider value={{ session, setSession }}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// PowerSync provider
// ---------------------------------------------------------------------------

function PowerSyncProvider({ children }: { children: ReactNode }) {
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    setupPowerSync().catch((err) => {
      console.error("[PowerSync] Initialization failed:", err);
      setInitError(err instanceof Error ? err.message : String(err));
    });
  }, []);

  if (initError) {
    return (
      <View style={styles.crashContainer}>
        <StatusBar style="light" />
        <Text style={styles.crashTitle}>⚠️ Database Init Error</Text>
        <ScrollView style={styles.crashBox}>
          <Text style={styles.crashErrorText}>{initError}</Text>
        </ScrollView>
      </View>
    );
  }

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>;
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export { ErrorBoundary } from "expo-router";

export default function RootLayout() {
  return (
    <GlobalCrashOverlay>
      <PowerSyncProvider>
        <AuthProvider>
          <View style={styles.container}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(worker)" />
            </Stack>
          </View>
        </AuthProvider>
      </PowerSyncProvider>
    </GlobalCrashOverlay>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  crashContainer: {
    flex: 1,
    backgroundColor: COLORS.gray900,
    padding: 24,
    justifyContent: "center",
  },
  crashTitle: {
    color: COLORS.error,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 40,
  },
  crashSubtitle: {
    color: COLORS.gray400,
    fontSize: 14,
    marginBottom: 16,
  },
  crashBox: {
    backgroundColor: COLORS.gray800,
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
    marginBottom: 20,
  },
  crashErrorText: {
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  crashStack: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontFamily: "monospace",
  },
  retryBtn: {
    backgroundColor: COLORS.success,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

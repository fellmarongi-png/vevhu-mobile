import NetInfo from "@react-native-community/netinfo";

import { Tabs } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../src/config/app";
import { registerBackgroundSync } from "../../src/services/background-sync";
import { processMediaQueue } from "../../src/services/media-sync";

async function checkForSilentUpdates() {
  try {
    if (__DEV__) return;
    const check = await Updates.checkForUpdateAsync();
    if (check.isAvailable) {
      console.log("[Updates] Downloading silent background update...");
      await Updates.fetchUpdateAsync();
      console.log("[Updates] Background update downloaded — ready for next launch.");
    }
  } catch {
    // Silent catch — operate offline without interrupting worker flow
  }
}

export default function WorkerLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : 8;

  useEffect(() => {
    registerBackgroundSync().catch((err) =>
      console.warn("[Sync] Background sync registration:", err),
    );

    // Process pending media uploads & check for updates silently in background when connected
    processMediaQueue().catch(() => {});
    checkForSilentUpdates();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        processMediaQueue().catch((err) => console.warn("[MediaSync] Process queue error:", err));
        checkForSilentUpdates();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 17,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: {
          paddingBottom: bottomInset,
          paddingTop: 6,
          height: 60 + bottomInset,
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="collect"
        options={{
          title: "Collect",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="site-map"
        options={{
          title: "Site Map",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📍</Text>,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>⚙️</Text>,
        }}
      />
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="workers" options={{ href: null }} />
      <Tabs.Screen name="submissions" options={{ href: null }} />
      <Tabs.Screen name="submission-detail" options={{ href: null }} />
      <Tabs.Screen name="map" options={{ href: null }} />
    </Tabs>
  );
}

import { Tabs } from "expo-router";
import { Text } from "react-native";
import { COLORS } from "../../src/config/app";

export default function WorkerLayout() {
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
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 4,
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
    </Tabs>
  );
}

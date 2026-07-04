import { router } from "expo-router";
import { View } from "react-native";
import SettingsDOM from "../../src/components/dom/SettingsDOM";

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF9" }}>
      <SettingsDOM
        dom={{ style: { flex: 1 } }}
        onNavigate={(route) => {
          if (route === "/login" || route === "login") {
            router.replace("/login");
          } else {
            router.push(route as any);
          }
        }}
      />
    </View>
  );
}

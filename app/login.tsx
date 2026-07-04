import { router } from "expo-router";
import { View } from "react-native";
import LoginDOM from "../src/components/dom/LoginDOM";

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF9" }}>
      <LoginDOM
        dom={{ style: { flex: 1 } }}
        onNavigate={(route) => {
          if (route === "/(worker)" || route === "worker" || route === "/worker") {
            router.replace("/(worker)");
          } else {
            router.replace(route as any);
          }
        }}
      />
    </View>
  );
}

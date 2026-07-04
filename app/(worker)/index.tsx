import { router } from "expo-router";
import { View } from "react-native";
import HomeDOM from "../../src/components/dom/HomeDOM";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF9" }}>
      <HomeDOM
        dom={{ style: { flex: 1 } }}
        onNavigate={(route) => {
          if (route === "/collect" || route === "collect") {
            router.push("/(worker)/collect");
          } else {
            router.push(route as any);
          }
        }}
      />
    </View>
  );
}

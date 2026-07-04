import { router } from "expo-router";
import { View } from "react-native";
import ProgressDOM from "../../src/components/dom/ProgressDOM";

export default function ProgressScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF9" }}>
      <ProgressDOM dom={{ style: { flex: 1 } }} onNavigate={(route) => router.push(route as any)} />
    </View>
  );
}

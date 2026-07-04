import { router } from "expo-router";
import { View } from "react-native";
import CollectDOM from "../../src/components/dom/CollectDOM";

export default function CollectScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF9" }}>
      <CollectDOM dom={{ style: { flex: 1 } }} onNavigate={(route) => router.push(route as any)} />
    </View>
  );
}

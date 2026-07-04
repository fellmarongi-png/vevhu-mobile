import { router } from "expo-router";
import { View } from "react-native";
import AnnouncementsDOM from "../../src/components/dom/AnnouncementsDOM";

export default function AnnouncementsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#FAFAF9" }}>
      <AnnouncementsDOM
        dom={{ style: { flex: 1 } }}
        onNavigate={(route) => router.push(route as any)}
      />
    </View>
  );
}

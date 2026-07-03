import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { getStoredSession } from "../src/services/auth";

export default function Index() {
  useEffect(() => {
    async function checkAuth() {
      const session = await getStoredSession();
      if (session) {
        router.replace("/(worker)");
      } else {
        router.replace("/login");
      }
    }
    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1976D2" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});

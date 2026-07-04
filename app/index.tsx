import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../src/config/app";
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
      <View style={styles.branding}>
        <View style={styles.logoRing}>
          <Text style={styles.logoLetter}>V</Text>
        </View>
        <Text style={styles.brandName}>VEVHU</Text>
      </View>
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  branding: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoLetter: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.white,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 6,
  },
  spinner: {
    marginTop: 8,
  },
});

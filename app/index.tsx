import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../src/config/app";
import { getStoredSession } from "../src/services/auth";

export default function Index() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for logo glow
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    // Continuous smooth rotation for loading ring
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
    );

    pulseLoop.start();
    rotateLoop.start();

    async function checkAuth() {
      const session = await getStoredSession();
      if (session) {
        router.replace("/(worker)");
      } else {
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      pulseLoop.stop();
      rotateLoop.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.branding}>
        {/* Animated Glow Logo Container */}
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Image
            source={require("../assets/images/vevhu-icon.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.brandTitle}>VEVHU RESOURCES</Text>
        <Text style={styles.brandSubtitle}>Land Verification Field System</Text>
      </View>

      {/* Modern Custom Spinner Ring */}
      <View style={styles.spinnerWrapper}>
        <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]} />
      </View>
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
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 4,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.mutedForeground,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  spinnerWrapper: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderTopColor: COLORS.primary,
  },
});

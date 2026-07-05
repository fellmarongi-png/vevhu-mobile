import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../src/config/app";
import { loginWithPin } from "../src/services/auth";

export default function LoginScreen() {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (pin.length !== 4) {
      Alert.alert("Error", "PIN must be 4 digits");
      return;
    }

    setLoading(true);
    try {
      await loginWithPin(name.trim(), pin);
      router.replace("/(worker)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid name or PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: (insets.top || 20) + 20,
            paddingBottom: (insets.bottom || 20) + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardContainer}>
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/vevhu-icon.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logo}>VEVHU RESOURCES</Text>
            <Text style={styles.subtitle}>Land Verification Field System</Text>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardDescription}>Sign in with your name and PIN to continue</Text>

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.gray400}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  value={pin}
                  onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
                  placeholder="----"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign in"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  header: { alignItems: "center", marginBottom: 28 },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 3,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 4,
    fontWeight: "500",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.cardForeground,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    marginBottom: 24,
  },
  form: {},
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray700,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: COLORS.gray50,
    color: COLORS.cardForeground,
  },
  pinInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 12,
    backgroundColor: COLORS.gray50,
    color: COLORS.cardForeground,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: COLORS.primaryForeground,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

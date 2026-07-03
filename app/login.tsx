import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
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
import { UpdateBanner } from "../src/components/sync/UpdateBanner";
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
          <View style={styles.header}>
            <Text style={styles.logo}>VEVHU</Text>
            <Text style={styles.subtitle}>Field Worker</Text>
            <UpdateBanner />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />

            <Text style={styles.label}>PIN</Text>
            <TextInput
              style={styles.pinInput}
              value={pin}
              onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
              placeholder="----"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: "#1a1a2e" },
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
  header: { alignItems: "center", marginBottom: 36 },
  logo: { fontSize: 42, fontWeight: "800", color: "#fff", letterSpacing: 4 },
  subtitle: { fontSize: 16, color: "#aaa", marginTop: 8 },
  form: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 14, fontSize: 16 },
  pinInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 12,
  },
  button: {
    backgroundColor: "#1976D2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

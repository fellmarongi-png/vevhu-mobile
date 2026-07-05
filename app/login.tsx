import { router } from "expo-router";
import { useEffect, useState } from "react";
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
import { getLastUser, loginWithPin, type StoredUser } from "../src/services/auth";

export default function LoginScreen() {
  const [rememberedUser, setRememberedUser] = useState<StoredUser | null>(null);
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function loadLastUser() {
      const lastUser = await getLastUser();
      if (lastUser?.name) {
        setRememberedUser(lastUser);
        setName(lastUser.name);
      }
    }
    loadLastUser();
  }, []);

  const handleLogin = async () => {
    const loginName = isSwitchingUser || !rememberedUser ? name.trim() : rememberedUser.name;
    if (!loginName) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (pin.length !== 4) {
      Alert.alert("Error", "Please enter your 4-digit PIN");
      return;
    }

    setLoading(true);
    try {
      await loginWithPin(loginName, pin);
      router.replace("/(worker)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid PIN");
    } finally {
      setLoading(false);
    }
  };

  const showQuickUserCard = rememberedUser && !isSwitchingUser;
  const userInitials = (rememberedUser?.name || "V")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
            {showQuickUserCard ? (
              /* State 1: Quick Remembered User Login Card */
              <View style={styles.quickUserContainer}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{userInitials}</Text>
                </View>
                <Text style={styles.welcomeTitle}>Welcome back,</Text>
                <Text style={styles.userName}>{rememberedUser.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {rememberedUser.role || "Field Collector"}
                  </Text>
                </View>

                <View style={styles.form}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Enter 4-Digit PIN</Text>
                    <TextInput
                      style={styles.pinInput}
                      value={pin}
                      onChangeText={(v) => setPin(v.replace(/\D/g, "").slice(0, 4))}
                      placeholder="----"
                      placeholderTextColor={COLORS.gray400}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                      autoFocus
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.switchUserBtn}
                    onPress={() => setIsSwitchingUser(true)}
                  >
                    <Text style={styles.switchUserText}>
                      Not {rememberedUser.name}? Sign in as another user
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* State 2: Full Login Form for New / Other User */
              <View>
                <Text style={styles.cardTitle}>Sign In</Text>
                <Text style={styles.cardDescription}>
                  Enter your full name and PIN to access field tools
                </Text>

                <View style={styles.form}>
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Your Name</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Enter full name"
                      placeholderTextColor={COLORS.gray400}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>4-Digit PIN</Text>
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
                    <Text style={styles.buttonText}>{loading ? "Signing in..." : "Sign In"}</Text>
                  </TouchableOpacity>

                  {rememberedUser && (
                    <TouchableOpacity
                      style={styles.switchUserBtn}
                      onPress={() => setIsSwitchingUser(false)}
                    >
                      <Text style={styles.switchUserText}>
                        ← Back to {rememberedUser.name}'s account
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
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
  quickUserContainer: {
    alignItems: "center",
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.white,
  },
  welcomeTitle: {
    fontSize: 14,
    color: COLORS.gray500,
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.cardForeground,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  roleBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "700",
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
  form: { width: "100%" },
  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.gray700,
    marginBottom: 6,
    letterSpacing: 0.3,
    textAlign: "center",
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
    fontVariant: ["tabular-nums"],
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
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
  switchUserBtn: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  switchUserText: {
    color: COLORS.gray500,
    fontSize: 13,
    fontWeight: "600",
  },
});

import * as Updates from "expo-updates";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../config/app";

export function UpdateBanner() {
  const { currentlyRunning, isUpdateAvailable, isUpdatePending, isChecking, isDownloading } =
    Updates.useUpdates();
  const [checkingManual, setCheckingManual] = useState(false);

  const handleCheckOrRestart = useCallback(async () => {
    try {
      if (isUpdatePending) {
        await Updates.reloadAsync();
        return;
      }

      setCheckingManual(true);
      const checkResult = await Updates.checkForUpdateAsync();
      if (checkResult.isAvailable) {
        Alert.alert("Update Found", "Downloading latest field worker update...");
        const fetchResult = await Updates.fetchUpdateAsync();
        if (fetchResult.isNew) {
          Alert.alert("Ready", "Update downloaded. Restarting app now.", [
            { text: "OK", onPress: () => Updates.reloadAsync() },
          ]);
        }
      } else {
        Alert.alert("Up to Date", "You are running the latest app version.");
      }
    } catch (err: any) {
      Alert.alert("Update Check", err?.message || "Could not check for updates right now.");
    } finally {
      setCheckingManual(false);
    }
  }, [isUpdatePending]);

  const updateId = currentlyRunning?.updateId || "Built-in APK";
  const shortId = updateId.length > 12 ? `${updateId.slice(0, 8)}...` : updateId;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.versionText}>Version: {shortId}</Text>
        {(isChecking || isDownloading || checkingManual) && (
          <ActivityIndicator size="small" color="#64B5F6" style={styles.loader} />
        )}
      </View>

      {isUpdatePending ? (
        <TouchableOpacity style={styles.restartButton} onPress={handleCheckOrRestart}>
          <Text style={styles.restartButtonText}>⚡ Update Ready! Tap to Restart</Text>
        </TouchableOpacity>
      ) : isUpdateAvailable ? (
        <TouchableOpacity style={styles.updateButton} onPress={handleCheckOrRestart}>
          <Text style={styles.updateButtonText}>⬇️ Download Available Update</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.checkButton}
          onPress={handleCheckOrRestart}
          disabled={checkingManual || isChecking || isDownloading}
        >
          <Text style={styles.checkButtonText}>
            {checkingManual || isChecking
              ? "Checking..."
              : isDownloading
                ? "Downloading..."
                : "Check for Updates"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  versionText: {
    color: COLORS.gray600,
    fontSize: 12,
    fontWeight: "500",
  },
  loader: {
    marginLeft: 8,
  },
  restartButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  restartButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  updateButton: {
    backgroundColor: COLORS.warning,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkButtonText: {
    color: COLORS.primaryForeground,
    fontSize: 12,
    fontWeight: "600",
  },
});

import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useVevhuAudioRecorder } from "../../hooks/useAudioRecorder";

interface AudioRecorderProps {
  onRecordingComplete: (uri: string, durationMs: number) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const {
    isRecording,
    isPaused,
    durationMs,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useVevhuAudioRecorder();

  const [savedUri, setSavedUri] = useState<string | null>(null);
  const [savedDuration, setSavedDuration] = useState<number>(0);

  // Audio Player Preview for saved recordings
  const player = useAudioPlayer(savedUri || "");
  const playerStatus = useAudioPlayerStatus(player);

  const handleStart = () => {
    Alert.alert(
      "Recording Notice",
      'Please inform the resident:\n\n"This visit may be recorded for verification purposes."\n\nDo you confirm they have been informed?',
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, Start Recording", onPress: () => startRecording() },
      ],
    );
  };

  const handlePauseResume = async () => {
    if (isRecording) {
      await pauseRecording();
    } else {
      await resumeRecording();
    }
  };

  const handleStop = async () => {
    const uri = await stopRecording();
    if (uri) {
      setSavedUri(uri);
      setSavedDuration(durationMs);
      onRecordingComplete(uri, durationMs);
    }
  };

  const handleTogglePlay = () => {
    if (!savedUri) return;
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Recording", "Are you sure you want to delete this audio recording?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          if (playerStatus.playing) player.pause();
          setSavedUri(null);
          setSavedDuration(0);
          onRecordingComplete("", 0);
        },
      },
    ]);
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Conversation Recording</Text>

      {/* State 1: Active Recording / Paused */}
      {(isRecording || isPaused) && (
        <View style={styles.activeRecordingBox}>
          <View style={styles.recordingIndicator}>
            <View style={[styles.statusDot, isPaused ? styles.yellowDot : styles.redDot]} />
            <Text style={styles.timer}>{formatDuration(durationMs)}</Text>
            <Text style={styles.statusText}>{isPaused ? "Paused" : "Recording..."}</Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.controlBtn, styles.pauseBtn]} onPress={handlePauseResume}>
              <Text style={styles.controlBtnText}>{isPaused ? "▶️ Resume" : "⏸️ Pause"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.controlBtn, styles.stopBtn]} onPress={handleStop}>
              <Text style={styles.controlBtnText}>⏹️ Save Audio</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* State 2: Saved Recording Card with Audio Player Preview */}
      {!isRecording && !isPaused && savedUri && (
        <View style={styles.savedCard}>
          <View style={styles.savedCardHeader}>
            <Text style={styles.savedTitle}>✅ Audio Recorded ({formatDuration(savedDuration)})</Text>
          </View>
          <View style={styles.savedCardActions}>
            <TouchableOpacity style={styles.previewBtn} onPress={handleTogglePlay}>
              <Text style={styles.previewBtnText}>
                {playerStatus.playing ? "⏸️ Pause Preview" : "▶️ Play Preview"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* State 3: Ready to Record Initial Button */}
      {!isRecording && !isPaused && !savedUri && (
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>🎙️ Start Recording Interview</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16, padding: 16, backgroundColor: "#f8f9fa", borderRadius: 12, borderWidth: 1, borderColor: "#e0e0e0" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 12 },
  activeRecordingBox: { backgroundColor: "#fff", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#e3f2fd" },
  recordingIndicator: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  redDot: { backgroundColor: "#e53935" },
  yellowDot: { backgroundColor: "#f57c00" },
  timer: { fontSize: 20, fontWeight: "700", color: "#1a1a2e", marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: "600", color: "#666" },
  actionRow: { flexDirection: "row", gap: 10 },
  controlBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  pauseBtn: { backgroundColor: "#f57c00" },
  stopBtn: { backgroundColor: "#e53935" },
  controlBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  savedCard: { backgroundColor: "#e8f5e9", padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#c8e6c9" },
  savedCardHeader: { marginBottom: 10 },
  savedTitle: { fontSize: 15, fontWeight: "700", color: "#2e7d32" },
  savedCardActions: { flexDirection: "row", gap: 10 },
  previewBtn: { flex: 2, backgroundColor: "#2e7d32", padding: 10, borderRadius: 8, alignItems: "center" },
  previewBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  deleteBtn: { flex: 1, backgroundColor: "#ffebee", padding: 10, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: "#ffcdd2" },
  deleteBtnText: { color: "#c62828", fontSize: 14, fontWeight: "600" },

  startButton: { padding: 14, borderRadius: 8, backgroundColor: "#1976D2", alignItems: "center" },
  startButtonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

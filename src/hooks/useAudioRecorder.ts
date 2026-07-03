import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioRecorder as useExpoAudioRecorder,
} from "expo-audio";
import { useCallback, useState } from "react";

export function useVevhuAudioRecorder() {
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (granted) {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    }
    setHasPermission(granted);
    return granted;
  }, []);

  const startRecording = useCallback(async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return false;
    }
    await recorder.prepareToRecordAsync();
    recorder.record();
    return true;
  }, [hasPermission, recorder, requestPermission]);

  const pauseRecording = useCallback(async () => {
    await recorder.pause();
  }, [recorder]);

  const resumeRecording = useCallback(async () => {
    recorder.record();
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    await recorder.stop();
    setRecordingUri(recorder.uri);
    return recorder.uri;
  }, [recorder]);

  return {
    isRecording: state.isRecording,
    isPaused: !state.isRecording && state.durationMillis > 0,
    durationMs: state.durationMillis,
    recordingUri,
    hasPermission,
    requestPermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}

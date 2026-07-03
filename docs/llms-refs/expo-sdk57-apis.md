# Expo SDK 57 - Verified API Patterns

## Project Creation
npx create-expo-app@latest --template default@sdk-57

## expo-sqlite (synchronous + async)
import * as SQLite from 'expo-sqlite';
const db = await SQLite.openDatabaseAsync('name.db');
await db.execAsync('CREATE TABLE IF NOT EXISTS ...');
await db.runAsync('INSERT INTO t VALUES (?, ?)', val1, val2);
const row = await db.getFirstAsync('SELECT * FROM t WHERE id = ?', id);
const rows = await db.getAllAsync('SELECT * FROM t');
// Sync: const db = SQLite.openDatabaseSync('name.db');

## expo-audio (NEW - replaces expo-av for recording)
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
const state = useAudioRecorderState(recorder);
await recorder.prepareToRecordAsync();
recorder.record();
await recorder.stop(); // recorder.uri has the file

## expo-camera (CameraView, NOT Camera)
import { CameraView, useCameraPermissions } from 'expo-camera';
<CameraView facing="back" ref={cameraRef} />
const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

## expo-image-picker
import * as ImagePicker from 'expo-image-picker';
const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
if (!result.canceled) { result.assets[0].uri }

## expo-location
import * as Location from 'expo-location';
await Location.requestForegroundPermissionsAsync();
const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
// Background: needs expo-task-manager, separate permission request

## expo-file-system (SDK 57 new File API)
import { File, UploadType } from 'expo-file-system';
const file = new File(localPath);
const task = file.createUploadTask(url, { uploadType: UploadType.BINARY_CONTENT, headers: {}, httpMethod: 'PUT' });
const result = await task.uploadAsync();

## expo-router
File-based routing in app/ directory.
import { Stack, Tabs } from 'expo-router';
import { router } from 'expo-router';
router.push('/path'); router.replace('/path');

## @react-native-community/netinfo
import NetInfo from '@react-native-community/netinfo';
const unsubscribe = NetInfo.addEventListener(state => { state.isConnected });

## expo-task-manager + expo-background-fetch
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
TaskManager.defineTask(TASK_NAME, async () => { return BackgroundFetch.BackgroundFetchResult.NewData; });
await BackgroundFetch.registerTaskAsync(TASK_NAME, { minimumInterval: 900 });

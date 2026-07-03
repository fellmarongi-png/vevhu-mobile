import NetInfo from "@react-native-community/netinfo";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import { processMediaQueue } from "./media-sync";

// ---------------------------------------------------------------------------
// Task name
// ---------------------------------------------------------------------------

export const BACKGROUND_SYNC_TASK = "vevhu-background-sync";

// ---------------------------------------------------------------------------
// Task definition (must be called at module-level, outside any component)
// ---------------------------------------------------------------------------

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    console.log("[BackgroundSync] Task running");

    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      console.log("[BackgroundSync] Offline — skipping media queue");
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    await processMediaQueue();
    console.log("[BackgroundSync] Media queue processed");
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.error("[BackgroundSync] Task error:", err);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// ---------------------------------------------------------------------------
// Registration helpers
// ---------------------------------------------------------------------------

/**
 * Register the background-sync task with BackgroundFetch.
 * Safe to call multiple times — re-registering overwrites the previous
 * registration with the same options.
 *
 * minimumInterval is 15 minutes (the OS may defer it further).
 */
export async function registerBackgroundSync(): Promise<void> {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
      minimumInterval: 15 * 60, // seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log("[BackgroundSync] Registered");
  } catch (err) {
    console.error("[BackgroundSync] registerBackgroundSync error:", err);
    throw err;
  }
}

/**
 * Unregister the background-sync task.
 * Safe to call even if the task is not currently registered.
 */
export async function unregisterBackgroundSync(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    console.log("[BackgroundSync] Unregistered");
  } catch (err) {
    // Ignore "task not found" errors that occur when already unregistered
    console.warn("[BackgroundSync] unregisterBackgroundSync warning:", err);
  }
}

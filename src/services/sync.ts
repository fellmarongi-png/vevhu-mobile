import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { db, setupPowerSync } from "./powersync";

// --- Types -------------------------------------------------------------------

export interface SyncStatus {
  connected: boolean;
  uploading: boolean;
  downloading: boolean;
  lastSyncedAt: Date | null;
}

// --- Internal state ----------------------------------------------------------

let _netInfoUnsubscribe: (() => void) | null = null;
let _syncStarted = false;

// --- Public API --------------------------------------------------------------

/**
 * Initialise PowerSync and begin watching network connectivity.
 * When the device comes back online the connector will automatically
 * resume uploading queued changes.
 */
export async function startSync(): Promise<void> {
  if (_syncStarted) return;
  _syncStarted = true;

  try {
    await setupPowerSync();

    // Re-trigger a sync attempt whenever the network becomes available
    _netInfoUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected && state.isInternetReachable) {
        // PowerSync handles reconnection internally; logging here for visibility
        console.log("[Sync] Network available -- PowerSync will resume upload queue");
      } else {
        console.log("[Sync] Network unavailable -- changes will queue locally");
      }
    });

    console.log("[Sync] Sync started");
  } catch (err) {
    _syncStarted = false;
    console.error("[Sync] startSync failed:", err);
    throw err;
  }
}

/**
 * Disconnect from PowerSync and stop network monitoring.
 */
export async function stopSync(): Promise<void> {
  if (!_syncStarted) return;

  if (_netInfoUnsubscribe) {
    _netInfoUnsubscribe();
    _netInfoUnsubscribe = null;
  }

  await db.disconnect();
  _syncStarted = false;
  console.log("[Sync] Sync stopped");
}

/**
 * Return a snapshot of the current sync state sourced directly from
 * the PowerSync status object.
 */
export function getSyncStatus(): SyncStatus {
  const status = db.currentStatus;

  return {
    connected: status?.connected ?? false,
    uploading: status?.dataFlowStatus?.uploading ?? false,
    downloading: status?.dataFlowStatus?.downloading ?? false,
    lastSyncedAt: status?.lastSyncedAt ?? null,
  };
}

/**
 * Count how many submission rows are still waiting to be uploaded.
 */
export async function getPendingCount(): Promise<number> {
  const result = await db.getOptional<{ count: number }>(
    "SELECT COUNT(*) AS count FROM submissions WHERE status = 'pending'",
  );
  return result?.count ?? 0;
}

/**
 * Trigger an immediate sync attempt by disconnecting and reconnecting
 * PowerSync.  Useful for pull-to-refresh gestures and manual retry buttons.
 */
export async function forceSync(): Promise<void> {
  try {
    console.log("[Sync] Force sync requested");
    await db.disconnect();
    // setupPowerSync guards against double-init so we call db directly
    await db.connect(new (await import("./powersync")).SupabaseConnector());
    console.log("[Sync] Force sync reconnect complete");
  } catch (err) {
    console.error("[Sync] forceSync error:", err);
    throw err;
  }
}

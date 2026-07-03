import NetInfo from "@react-native-community/netinfo";
import { useCallback, useEffect, useState } from "react";
import { db } from "../services/powersync";
import { getSyncStatus } from "../services/sync";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncStatus {
  /** Submissions that have not yet been synced to the server */
  pendingSubmissions: number;
  /** Media queue items that are not yet uploaded */
  pendingMedia: number;
  /** Whether the device currently has internet connectivity */
  isConnected: boolean;
  /** Timestamp of the most recently synced submission, or null */
  lastSyncedAt: string | null;
  /** True while PowerSync is actively uploading or downloading */
  isSyncing: boolean;
}

const POLL_INTERVAL_MS = 5_000;

const DEFAULT_STATUS: SyncStatus = {
  pendingSubmissions: 0,
  pendingMedia: 0,
  isConnected: false,
  lastSyncedAt: null,
  isSyncing: false,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSyncStatus(): SyncStatus {
  const [status, setStatus] = useState<SyncStatus>(DEFAULT_STATUS);

  const refresh = useCallback(async () => {
    try {
      // -- pendingSubmissions: rows where synced_at is null --
      const pendingSubResult = await db.getOptional<{ count: number }>(
        `SELECT COUNT(*) AS count FROM submissions WHERE synced_at IS NULL`,
      );

      // -- pendingMedia: rows that are not yet successfully uploaded --
      const pendingMediaResult = await db.getOptional<{ count: number }>(
        `SELECT COUNT(*) AS count FROM media_queue WHERE upload_status != 'uploaded'`,
      );

      // -- lastSyncedAt: most recent synced_at across all submissions --
      const lastSyncedResult = await db.getOptional<{ synced_at: string | null }>(
        `SELECT synced_at FROM submissions
         WHERE synced_at IS NOT NULL
         ORDER BY synced_at DESC
         LIMIT 1`,
      );

      // -- isSyncing: derived from PowerSync dataFlowStatus --
      const psStatus = getSyncStatus();
      const isSyncing = (psStatus.uploading ?? false) || (psStatus.downloading ?? false);

      // -- isConnected: current NetInfo state --
      const netState = await NetInfo.fetch();
      const isConnected = (netState.isConnected && netState.isInternetReachable) ?? false;

      setStatus({
        pendingSubmissions: pendingSubResult?.count ?? 0,
        pendingMedia: pendingMediaResult?.count ?? 0,
        isConnected,
        lastSyncedAt: lastSyncedResult?.synced_at ?? null,
        isSyncing,
      });
    } catch (err) {
      console.warn("[useSyncStatus] refresh error:", err);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refresh();

    // Poll every 5 seconds
    const intervalId = setInterval(refresh, POLL_INTERVAL_MS);

    // Also refresh immediately on connectivity changes
    const unsubscribeNetInfo = NetInfo.addEventListener(() => {
      refresh();
    });

    return () => {
      clearInterval(intervalId);
      unsubscribeNetInfo();
    };
  }, [refresh]);

  return status;
}

import type { PowerSyncDatabase } from "@powersync/react-native";
import { PowerSyncContext, useQuery as usePowerSyncQuery } from "@powersync/react-native";
import { useContext } from "react";

const EMPTY_PARAMS: unknown[] = [];

export function usePowerSync(): PowerSyncDatabase {
  const db = useContext(PowerSyncContext);
  if (!db) {
    throw new Error("usePowerSync must be used within a PowerSyncProvider");
  }
  return db as PowerSyncDatabase;
}

export function useWatchedQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = EMPTY_PARAMS,
): { data: T[]; isLoading: boolean } {
  const result = usePowerSyncQuery<T>(sql, params as any[]);
  return { data: result.data ?? [], isLoading: result.isLoading };
}

import { OPSqliteOpenFactory } from "@powersync/op-sqlite";
import {
  type AbstractPowerSyncDatabase,
  type PowerSyncBackendConnector,
  PowerSyncDatabase,
  UpdateType,
} from "@powersync/react-native";
import { CONFIG } from "../config/app";
import { AppSchema } from "../db/powersync-schema";
import { supabase } from "./supabase";

// --- Supabase Connector -------------------------------------------------------

export class SupabaseConnector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      // Unauthenticated state — return null credentials so PowerSync waits gracefully without throwing
      return null;
    }

    return {
      endpoint: CONFIG.POWERSYNC_URL,
      token: session.access_token,
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    while (true) {
      const batch = await database.getCrudBatch(100);

      if (!batch || batch.crud.length === 0) {
        break;
      }

      try {
        for (const op of batch.crud) {
          const { table, op: opType, id, opData } = op;

          switch (opType) {
            case UpdateType.PUT: {
              const { error } = await (supabase as any)
                .from(table)
                .upsert({ id, ...opData }, { onConflict: "id" });
              if (error) {
                console.error(`[PowerSync] PUT error on table ${table} (id ${id}):`, error.message);
                // 23505 = unique constraint violation (duplicate), PGRST116 = single row error
                if (error.code === "23505" || error.code === "PGRST116") {
                  console.warn(
                    `[PowerSync] Unique constraint/conflict resolved for ${table}:${id}`,
                  );
                  continue;
                }
                throw new Error(`[PowerSync PUT ${table}:${id}] ${error.message}`);
              }
              break;
            }

            case UpdateType.PATCH: {
              const { error } = await (supabase as any)
                .from(table)
                .update(opData as Record<string, any>)
                .eq("id", id);
              if (error) {
                console.error(
                  `[PowerSync] PATCH error on table ${table} (id ${id}):`,
                  error.message,
                );
                throw new Error(`[PowerSync PATCH ${table}:${id}] ${error.message}`);
              }
              break;
            }

            case UpdateType.DELETE: {
              const { error } = await (supabase as any).from(table).delete().eq("id", id);
              if (error) {
                console.error(
                  `[PowerSync] DELETE error on table ${table} (id ${id}):`,
                  error.message,
                );
                throw new Error(`[PowerSync DELETE ${table}:${id}] ${error.message}`);
              }
              break;
            }

            default:
              console.warn(
                `[PowerSync] Unknown op type "${opType}" for table "${table}" -- skipping`,
              );
          }
        }

        await batch.complete();
      } catch (err) {
        console.error("[PowerSync] uploadData error during batch upload:", err);
        throw err; // PowerSync will catch this and schedule a retry automatically
      }
    }
  }
}

// --- Database Instance (Lazy Loaded) ------------------------------------------

let _dbInstance: PowerSyncDatabase | null = null;

export function getPowerSyncDb(): PowerSyncDatabase {
  if (!_dbInstance) {
    _dbInstance = new PowerSyncDatabase({
      schema: AppSchema,
      database: new OPSqliteOpenFactory({
        dbFilename: "vevhu.db",
      }),
    });
  }
  return _dbInstance;
}

export const db = new Proxy({} as PowerSyncDatabase, {
  get(_target, prop) {
    const instance = getPowerSyncDb();
    const val = (instance as any)[prop as string];
    if (typeof val === "function") {
      return val.bind(instance);
    }
    return val;
  },
  set(_target, prop, value) {
    const instance = getPowerSyncDb();
    (instance as any)[prop as string] = value;
    return true;
  },
});

/**
 * Direct Fallback Sync Engine:
 * Uploads all locally pending submissions to Supabase Postgres when online.
 * Updates local status from 'pending' to 'synced'.
 */
export async function syncPendingSubmissionsDirectly(): Promise<void> {
  try {
    const instance = getPowerSyncDb();
    const pendingRows = await instance.getAll<any>(
      "SELECT * FROM submissions WHERE status = 'pending' ORDER BY collected_at ASC",
    );

    if (!pendingRows || pendingRows.length === 0) return;

    for (const row of pendingRows) {
      const payload = {
        id: row.id,
        worker_id: row.worker_id,
        form_schema_version: row.form_schema_version || 1,
        stand_number_official: row.stand_number_official,
        stand_number_physical: row.stand_number_physical,
        respondent_type: row.respondent_type,
        respondent_name: row.respondent_name,
        respondent_phone: row.respondent_phone,
        is_legal_owner: Boolean(row.is_legal_owner),
        owner_name: row.owner_name,
        owner_phone: row.owner_phone,
        account_standing: row.account_standing,
        action_taken: row.action_taken,
        field_notes: row.field_notes,
        extra_fields: row.extra_fields
          ? typeof row.extra_fields === "string"
            ? JSON.parse(row.extra_fields)
            : row.extra_fields
          : {},
        gps_latitude: row.gps_latitude,
        gps_longitude: row.gps_longitude,
        gps_accuracy: row.gps_accuracy,
        photos: row.photos
          ? typeof row.photos === "string"
            ? JSON.parse(row.photos)
            : row.photos
          : [],
        audio_recording_key: row.audio_recording_key,
        audio_duration_seconds: row.audio_duration_seconds,
        signature_key: row.signature_key,
        status: "synced",
        collected_at: row.collected_at,
        synced_at: new Date().toISOString(),
      };

      const { error } = await (supabase as any)
        .from("submissions")
        .upsert(payload, { onConflict: "id" });

      if (!error) {
        await instance.execute(
          "UPDATE submissions SET status = 'synced', synced_at = ? WHERE id = ?",
          [new Date().toISOString(), row.id],
        );
        console.log(`[SyncEngine] Successfully synced submission ${row.id} to Supabase`);
      } else {
        console.warn(`[SyncEngine] Sync notice for submission ${row.id}:`, error.message);
      }
    }
  } catch (err) {
    console.warn("[SyncEngine] Background sync fallback notice:", err);
  }
}

// --- Setup Helper -------------------------------------------------------------

let _initialized = false;
let _connector: SupabaseConnector | null = null;

export async function setupPowerSync(): Promise<void> {
  if (_initialized) return;

  try {
    if (!_connector) {
      _connector = new SupabaseConnector();
    }
    const instance = getPowerSyncDb();
    await instance.init();
    _initialized = true;

    try {
      await instance.connect(_connector);
      console.log("[PowerSync] Connected and syncing");
    } catch (connectErr) {
      console.warn(
        "[PowerSync] Could not connect to remote sync service (operating in offline local SQLite mode):",
        connectErr,
      );
    }

    // Trigger immediate background sync check for pending submissions
    syncPendingSubmissionsDirectly().catch(() => {});
  } catch (err) {
    _initialized = false;
    console.error("[PowerSync] Local database initialization failed:", err);
    throw err;
  }
}

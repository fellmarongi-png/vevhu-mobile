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
      // Seed default announcements if SQLite table is empty
      const existingRows = await instance.getAll<{ count: number }>(
        "SELECT COUNT(*) AS count FROM announcements",
      );
      if (!existingRows?.[0]?.count) {
        await instance.execute(
          `INSERT INTO announcements (id, title, message, target_type, is_read_by, created_at) VALUES 
          ('ann-spitzkop-01', '📢 Spitzkop Lot 6 Priority Audit', 'All field workers assigned to Spitzkop Lot 6: Please inspect stands 1042 through 1048 today and submit site photos with GPS verification.', 'all', '[]', datetime('now')),
          ('ann-welcome-02', '⚡ System Sync & Offline Mode Active', 'Offline data collection is active. All collected records, audio notes, and photos store locally first and sync automatically.', 'all', '[]', datetime('now', '-1 hour'))`,
        );
        console.log("[PowerSync] Seeded initial system announcements");
      }
    } catch (seedErr) {
      console.warn("[PowerSync] Announcement seed notice:", seedErr);
    }

    try {
      await instance.connect(_connector);
      console.log("[PowerSync] Connected and syncing");
    } catch (connectErr) {
      console.warn(
        "[PowerSync] Could not connect to remote sync service (operating in offline local SQLite mode):",
        connectErr,
      );
    }
  } catch (err) {
    _initialized = false;
    console.error("[PowerSync] Local database initialization failed:", err);
    throw err;
  }
}

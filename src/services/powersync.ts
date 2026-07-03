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

          try {
            switch (opType) {
              case UpdateType.PUT: {
                const { error } = await (supabase as any)
                  .from(table)
                  .upsert({ id, ...opData }, { onConflict: "id" });
                if (error) {
                  console.error(
                    `[PowerSync] PUT error on table ${table} (id ${id}):`,
                    error.message,
                  );
                  if (error.code === "23505" || error.code === "PGRST116") break; // Conflict resolved/handled
                  throw error;
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
                  throw error;
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
                  throw error;
                }
                break;
              }

              default:
                console.warn(
                  `[PowerSync] Unknown op type "${opType}" for table "${table}" -- skipping`,
                );
            }
          } catch (opErr: any) {
            console.error(
              `[PowerSync] Skipping unresolvable operation on ${table}:${id}`,
              opErr?.message || opErr,
            );
          }
        }

        await batch.complete();
      } catch (err) {
        console.error("[PowerSync] uploadData batch error:", err);
        // Force batch completion to avoid infinite queue locking on permanent local data format errors
        await batch.complete().catch(() => {});
        break;
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
  _initialized = true;

  try {
    if (!_connector) {
      _connector = new SupabaseConnector();
    }
    const instance = getPowerSyncDb();
    await instance.init();
    await instance.connect(_connector);
    console.log("[PowerSync] Connected and syncing");
  } catch (err) {
    _initialized = false;
    console.error("[PowerSync] setupPowerSync failed:", err);
    throw err;
  }
}

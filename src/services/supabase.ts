import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { CONFIG } from "../config/app";

const _SESSION_STORAGE_KEY = "supabase.auth.token";

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

let _supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!_supabaseInstance) {
    _supabaseInstance = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _supabaseInstance;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const val = (client as any)[prop as string];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
  set(_target, prop, value) {
    const client = getSupabaseClient();
    (client as any)[prop as string] = value;
    return true;
  },
});

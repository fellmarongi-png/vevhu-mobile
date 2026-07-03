# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Official LLM Reference Files (local copies)

All files are in `.agents/references/`. **Always read the relevant file before writing code.**

| File | Description | Size |
|---|---|---|
| `expo-llms.txt` | Index of all Expo docs pages — start here to find the right page | ~53 kB |
| `expo-llms-full.txt` | Complete Expo docs — Router, Modules API, dev process, CNG | ~2.3 MB |
| `expo-llms-eas.txt` | Full EAS docs — Build, Update, Submit, workflows, channels | ~1.2 MB |
| `expo-llms-sdk.txt` | Full SDK 57 reference — every Expo SDK package API | ~3.4 MB |
| `powersync-llms.txt` | PowerSync index | local |
| `powersync-llms-full.txt` | Full PowerSync offline/sync docs | local |

## Skills Available (`.agents/skills/`)

Each skill has a `SKILL.md` — read it before executing related tasks.

| Skill | When to use |
|---|---|
| `expo-deployment` | EAS build, submit to stores, OTA updates |
| `eas-update-insights` | Check OTA update health, crash rates |
| `expo-dev-client` | Dev client builds |
| `upgrading-expo` | SDK version upgrades |
| `native-data-fetching` | Fetch, React Query, offline caching |
| `building-native-ui` | Expo UI, Reanimated, animations |
| `expo-cicd-workflows` | CI/CD, EAS workflow YAML |
| `supabase` | Supabase DB, Auth, RLS, Edge Functions |
| `supabase-postgres-best-practices` | Postgres query/schema optimization |
| `eas-simulator` | Remote iOS/Android cloud simulators |

## MCP Servers Available

| Server | What it provides |
|---|---|
| `expo` (`mcp.expo.dev/mcp`) | Live Expo docs search, EAS builds/workflows, TestFlight data |
| `supabase` (`mcp.supabase.com/mcp`) | execute_sql, schema introspection, RLS, get_advisors |
| `argent` (`argent mcp`) | Screenshot device, tap UI, inspect React tree, profile (needs local emulator) |

## Critical Rules for All Agents

1. **Native module change = new APK build required** — OTA cannot fix it
2. **Always run `npx expo-doctor` before triggering a build**
3. **`@powersync/op-sqlite` is the correct SQLite adapter** (New Architecture compatible)
4. **`expo-secure-store` for all token storage** — never AsyncStorage
5. **`supabase.auth.setSession()` must be called after login** for RLS to work
6. **`app_metadata`** for roles/worker_id — never `user_metadata` (user-editable)
7. **MANDATORY AUTO-PUSH & VERIFICATION RULE**: After ANY code or configuration changes, ALWAYS run Biome / linter and type checks (`npx @biomejs/biome check`, `npx tsc --noEmit`) to verify 100% accuracy, then immediately git commit and `git push` to GitHub (`fellmarongi-png/vevhu-mobile` / `fellmarongi-png/vevhu-dashboard`).

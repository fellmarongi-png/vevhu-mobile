# Vevhu Field Worker Mobile App

An offline-first field data collection mobile application built for Vevhu Resources (Real Estate Verification & Council Urbanization Audit). Built with React Native / Expo SDK 57 targeting standalone Android APK production builds.

## Architecture & Tech Stack

- **Framework:** Expo SDK 57 with CNG (`expo-dev-client`)
- **Language:** TypeScript (strict)
- **Routing:** Expo Router (`app/` file-based routing)
- **Offline Storage:** Local SQLite (`expo-sqlite`) synced with Supabase Postgres via PowerSync (`@powersync/react-native`)
- **Backend:** Supabase (`@supabase/supabase-js`)
- **Media Storage:** Supabase Storage (`vevhu-media` bucket) + Local file caching
- **Dynamic Forms:** Schema-driven dynamic forms downloaded from local PowerSync database (`form_schemas` table) with graceful fallback
- **Hardware Integrations:**
  - **Audio Recording:** `expo-audio` (`useAudioRecorder`)
  - **Camera & Photos:** `expo-image-picker` & `expo-camera` (`CameraView`)
  - **GPS Tracking:** `expo-location` & `expo-task-manager`
  - **Signature Capture:** `react-native-signature-canvas`

## Key Production Features

1. **Offline-First Synchronization:** All field surveys, media queues, and GPS logs are saved locally first. When network connectivity is restored (`NetInfo`), background workers sync data over-the-air to Supabase.
2. **Global Diagnostic Crash Screen:** Integrated unhandled exception tracking that catches startup errors cleanly and renders an interactive on-screen diagnostic overlay instead of terminating the app.
3. **Live OTA Updates:** Configured with EAS Update on the `production` channel. App automatically checks on load and displays an interactive update banner when a new bundle is downloaded.

## Build & Deployment Commands

```bash
# 1. Local Development
npm start

# 2. Type Checking & Diagnostics
npx tsc --noEmit
npx expo-doctor

# 3. Build Standalone Production Android APK
npx eas-cli build --platform android --profile production --non-interactive

# 4. Publish Live OTA Update
npx eas-cli update --branch production --environment production --message "Release notes"
```

## Project Directory Structure

```text
app/                    # Expo Router routes
  _layout.tsx           # Root layout (PowerSync, Auth, Crash Diagnostics, Polyfills)
  index.tsx             # Root redirect
  login.tsx             # Worker authentication screen
  (worker)/             # Protected tab navigator
    collect.tsx         # Dynamic schema-driven data collection form
    progress.tsx        # Worker shift & submission stats
    announcements.tsx   # Broadcast messages
    settings.tsx        # Sync status, OTA checks, profile
src/
  components/           # UI and form components (DynamicForm, UpdateBanner, AudioRecorder)
  services/             # Business logic (powersync, supabase, auth)
  db/                   # Database schema (powersync-schema)
  hooks/                # React hooks (usePowerSync, useLocation, useAuth)
  config/               # Environment configuration
```

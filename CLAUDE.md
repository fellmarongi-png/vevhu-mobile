# Vevhu Field Worker Mobile App

## Project Overview
Offline-first field data collection app for Vevhu Resources (real estate verification).
Built with React Native / Expo SDK 57, targeting Android APK for sideloading.

## Tech Stack
- **Framework:** Expo SDK 57 with expo-dev-client (CNG workflow)
- **Language:** TypeScript (strict)
- **Routing:** expo-router (file-based, app/ directory)
- **Local DB:** expo-sqlite + drizzle-orm
- **Offline Sync:** @powersync/react-native → Supabase Postgres
- **Audio:** expo-audio (useAudioRecorder hook, NOT expo-av)
- **Camera:** expo-image-picker (launchCameraAsync) + expo-camera (CameraView)
- **GPS:** expo-location + expo-task-manager (background)
- **Network:** @react-native-community/netinfo
- **Signature:** react-native-signature-canvas (WebView-based)
- **Forms:** react-hook-form + zod v4
- **Files:** expo-file-system
- **Backend:** Supabase (@supabase/supabase-js v2.110+)
- **Media Storage:** Supabase Storage (bucket: vevhu-media)

## Key API Notes (SDK 57 Breaking Changes)
- expo-audio: `useAudioRecorder(RecordingPresets.HIGH_QUALITY)` — hook-based, NOT class-based
- expo-camera: `<CameraView facing="back">` — NOT `<Camera type="back">`
- expo-sqlite: `SQLite.openDatabaseAsync()` — NOT `SQLite.openDatabase()`
- expo-image-picker: `mediaTypes: ['images']` array — NOT `MediaTypeOptions` enum
- expo-image-picker: `result.assets[0].uri` — NOT `result.uri`
- zod v4: check import path and any schema changes from v3
- @supabase/supabase-js requires Node >= 22

## Architecture
- All data saved LOCALLY first (SQLite via PowerSync)
- Sync happens automatically when online (NetInfo listener)
- Media stored in expo-file-system, uploaded to Supabase Storage
- Form schema is dynamic (downloaded from Supabase, cached locally)
- GPS captured from device hardware (works offline)

## File Structure
```
app/                    # expo-router file-based routes
  _layout.tsx           # Root layout (providers)
  index.tsx             # Entry redirect
  login.tsx             # Worker login
  (worker)/             # Authenticated worker screens
    _layout.tsx         # Tab navigator
    index.tsx           # Home/stats
    collect.tsx         # Collection form
    progress.tsx        # My progress
    announcements.tsx   # Messages
    settings.tsx        # Sync status, profile
src/
  components/           # UI components
    ui/                 # Primitives (Button, Input, etc.)
    form/               # Dynamic form renderer
    media/              # Photo, audio, signature
    sync/               # Sync status indicators
  services/             # Business logic
    powersync.ts        # PowerSync config
    supabase.ts         # Supabase client
    auth.ts             # PIN login
    sync.ts             # Sync orchestrator
    media-upload.ts     # Supabase Storage upload
    location.ts         # GPS service
  db/                   # Database
    schema.ts           # Drizzle schema
    powersync-schema.ts # PowerSync tables
    queries.ts          # Common queries
  hooks/                # React hooks
  utils/                # Helpers
  config/               # App config
  types/                # TypeScript types
```

## Commands
```bash
npx expo start --dev-client   # Development
eas build --platform android --profile production --local  # Build APK
eas update --branch production --message "desc"  # OTA update
```

## Conventions
- No comments unless explaining a non-obvious WHY
- Use absolute imports with @/ alias
- All form fields are schema-driven (JSON from Supabase)
- Never store API keys in code — use env vars (EXPO_PUBLIC_ prefix)
- Handle permissions gracefully (request, explain, degrade)
- All timestamps in ISO 8601 UTC
- UUIDs for all record IDs (generated locally)

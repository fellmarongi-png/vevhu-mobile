export const CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  POWERSYNC_URL: process.env.EXPO_PUBLIC_POWERSYNC_URL || "",
  R2_UPLOAD_FUNCTION_URL: "",
  APP_VERSION: "1.0.0",
  MIN_PHOTOS_REQUIRED: 1,
  DEFAULT_DAILY_TARGET: 30,
  SYNC_BATCH_SIZE: 10,
  AUDIO_FORMAT: {
    extension: ".m4a",
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  PHOTO_OPTIONS: {
    quality: 0.8,
    allowsEditing: false,
    mediaTypes: ["images"] as const,
  },
  GPS_OPTIONS: {
    accuracy: 4, // Location.Accuracy.High
    distanceInterval: 10,
  },
} as const;

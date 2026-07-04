// ---------------------------------------------------------------------------
// Vevhu Brand Palette — matches vevhu-dashboard CSS variables
// Primary: oklch(0.65 0.18 55) → warm amber
// ---------------------------------------------------------------------------

export const COLORS = {
  // Exact Vevhu Brand Primary (Vibrant Orange #F3772D & Vevhu Blue #1976D2)
  primary: "#F3772D",
  primaryLight: "#FF9654",
  primaryDark: "#D85D15",
  primaryForeground: "#FFFFFF",

  // Brand Blue Accent
  brandBlue: "#1976D2",
  brandBlueDark: "#0475E0",

  // Secondary
  secondary: "#FEF3C7",
  secondaryForeground: "#1C1917",

  // Accent
  accent: "#FFEDD5",

  // Backgrounds
  background: "#FAFAF9",
  card: "#FFFFFF",
  cardForeground: "#1C1917",

  // Muted
  muted: "#F5F5F4",
  mutedForeground: "#78716C",

  // Destructive
  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",

  // Borders
  border: "#E7E5E4",
  input: "#E7E5E4",
  ring: "#F59E0B",

  // Status colors
  success: "#22C55E",
  successBg: "#F0FDF4",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  error: "#EF4444",
  errorBg: "#FEF2F2",

  // Legacy / utility
  white: "#FFFFFF",
  black: "#000000",
  gray50: "#FAFAF9",
  gray100: "#F5F5F4",
  gray200: "#E7E5E4",
  gray300: "#D6D3D1",
  gray400: "#A8A29E",
  gray500: "#78716C",
  gray600: "#57534E",
  gray700: "#44403C",
  gray800: "#292524",
  gray900: "#1C1917",
} as const;

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

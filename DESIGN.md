---
name: vevhu-mobile-design-system
version: 1.0.0
brand:
  name: Vevhu Resources
  industry: Real Estate & Land Verification
tokens:
  colors:
    primary: "#F3772D"
    primaryLight: "#FF9654"
    primaryDark: "#D85D15"
    primaryForeground: "#FFFFFF"
    brandBlue: "#1976D2"
    brandBlueDark: "#0475E0"
    secondary: "#FFF4EC"
    secondaryForeground: "#1F1B18"
    background: "#FAFAF9"
    card: "#FFFFFF"
    cardForeground: "#1C1917"
    muted: "#F5F5F4"
    mutedForeground: "#78716C"
    border: "#E7E5E4"
    success: "#22C55E"
    successBg: "#F0FDF4"
    warning: "#F59E0B"
    warningBg: "#FFFBEB"
    error: "#EF4444"
    errorBg: "#FEF2F2"
  radii:
    sm: 8
    md: 12
    lg: 16
    xl: 20
    full: 9999
  typography:
    h1: { fontSize: 24, fontWeight: "700" }
    h2: { fontSize: 20, fontWeight: "700" }
    h3: { fontSize: 16, fontWeight: "600" }
    body: { fontSize: 14, fontWeight: "400" }
    caption: { fontSize: 12, fontWeight: "500" }
---

# Vevhu Mobile App Design System

## 1. Visual Identity & Principles
Vevhu Resources requires a **state-of-the-art, high-trust, offline-first mobile interface** designed for field workers collecting critical real estate and land verification data under direct sunlight and outdoor field conditions.

### Design Principles:
1. **High Contrast & Legibility**: High visibility outdoor colors (`#F3772D` Vevhu Orange & `#1976D2` Corporate Blue) with bold headings and high contrast card boundaries.
2. **Elevated Touch Targets**: Minimum 48x48dp touch targets on buttons, form inputs, and tab navigation items to ensure effortless one-handed field operation.
3. **Android System Safety**: All screen containers and bottom navigation bars MUST dynamically apply `useSafeAreaInsets()` to prevent UI components from hiding under Android 3-button system navigation bars or gesture handles.
4. **Rich Status Feedback**: Real-time sync badges, recording duration indicators, thumbnail galleries, and signature previews.

## 2. Key Screen Components

### Bottom Tab Navigation Bar
- Dynamic height `60 + insets.bottom` with top border `#E7E5E4` and elevation shadow.
- Active tab highlighted in `#F3772D` with 22px tab icons and 12px bold labels.

### Progress & Team Filtering Screen (`/app/(worker)/progress.tsx`)
- **Top Summary Cards**: `My Today`, `Team Today`, `My This Week` metrics in clean elevated cards.
- **Pill Switcher**: `👤 My Submissions` vs `🏢 All Team Submissions` segmented control with smooth active state transitions.
- **Record Cards**: Stand number badges, resident info, collector metadata, and attachment pills (`📷 Photos`, `🎙️ Audio`, `✍️ Signed`).
- **Detail Modal**: Slide-up page sheet showing photo thumbnails, audio playback controls, and resident signature rendering.

### Dynamic Form Renderer (`/src/components/form/`)
- Responsive field controls (Text, Phone, Dropdown, Toggle, Camera, Audio, Signature).
- Floating label inputs with `#F3772D` active focus outlines and instant validation feedback.

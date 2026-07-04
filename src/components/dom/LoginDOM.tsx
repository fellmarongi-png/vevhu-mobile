"use dom";

import { useEffect, useRef } from "react";

interface Props {
  onNavigate?: (route: string) => void;
  onAction?: (actionType: string, payload?: any) => void;
  data?: any;
  dom?: import("expo/dom").DOMProps;
}

export default function LoginDOM({ onNavigate, onAction, data }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const rawHtml = `<!DOCTYPE html>

<html class="h-full" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, viewport-fit=cover" name="viewport"/>
<title>Vevhu Resources - Sign In</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface": "#fff8f6",
                        "tertiary": "#00668a",
                        "outline": "#8b7266",
                        "card": "#FFFFFF",
                        "success": "#22C55E",
                        "on-secondary-fixed": "#1f1b16",
                        "secondary-fixed": "#ebe1d9",
                        "primary-container": "#f3772d",
                        "secondary-container": "#e8ded6",
                        "primary-dark": "#D85D15",
                        "brand-blue": "#1976D2",
                        "on-tertiary-fixed": "#001e2c",
                        "on-secondary": "#ffffff",
                        "surface-container-low": "#fff1eb",
                        "on-primary-fixed-variant": "#793100",
                        "primary-fixed": "#ffdbcb",
                        "on-secondary-fixed-variant": "#4c4640",
                        "surface-variant": "#f4ded5",
                        "surface-tint": "#9e4200",
                        "secondary-fixed-dim": "#cfc5bd",
                        "primary-fixed-dim": "#ffb691",
                        "surface-container": "#ffeae1",
                        "error-container": "#ffdad6",
                        "warning": "#F59E0B",
                        "surface-container-high": "#fae4da",
                        "inverse-surface": "#3b2e27",
                        "on-tertiary-container": "#00374d",
                        "on-error-container": "#93000a",
                        "surface-container-highest": "#f4ded5",
                        "on-secondary-container": "#68615b",
                        "surface-container-lowest": "#ffffff",
                        "tertiary-fixed-dim": "#7bd0ff",
                        "brand-blue-dark": "#0475E0",
                        "on-primary-container": "#582200",
                        "on-surface": "#241914",
                        "background": "#FAFAF9",
                        "on-tertiary": "#ffffff",
                        "on-surface-variant": "#574238",
                        "inverse-on-surface": "#ffede6",
                        "border": "#E7E5E4",
                        "tertiary-container": "#00a6df",
                        "surface-bright": "#fff8f6",
                        "on-error": "#ffffff",
                        "secondary": "#645d57",
                        "on-primary": "#ffffff",
                        "primary": "#9e4200",
                        "error": "#EF4444",
                        "on-tertiary-fixed-variant": "#004c69",
                        "inverse-primary": "#ffb691",
                        "on-primary-fixed": "#341100",
                        "on-background": "#241914",
                        "tertiary-fixed": "#c4e7ff",
                        "primary-light": "#FF9654",
                        "outline-variant": "#dfc0b3",
                        "surface-dim": "#ebd6cc"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "touch-target-min": "48px",
                        "tab-bar-height": "60px",
                        "gutter": "0.75rem",
                        "margin-edge": "1rem"
                    },
                    "fontFamily": {
                        "headline-lg": ["Inter"],
                        "body-bold": ["Inter"],
                        "label-bold": ["Inter"],
                        "title-sm": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-md": ["Inter"],
                        "body-md": ["Inter"]
                    },
                    "fontSize": {
                        "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
                        "body-bold": ["14px", { "lineHeight": "20px", "fontWeight": "700" }],
                        "label-bold": ["12px", { "lineHeight": "16px", "fontWeight": "700" }],
                        "title-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
                        "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "700" }],
                        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }]
                    }
                }
            }
        }
    </script>
<style>
        .input-floating-label:focus-within label,
        .input-floating-label input:not(:placeholder-shown) ~ label {
            transform: translateY(-1.5rem) scale(0.85);
            color: #f3772d;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="h-full bg-background font-body-md text-on-surface antialiased flex flex-col items-center justify-center p-4">
<!-- Header Section -->
<header class="mb-10 text-center w-full max-w-sm flex flex-col items-center">
<div class="flex items-center justify-center gap-2 mb-2">
<span class="material-symbols-outlined text-[32px] text-primary-container" style="font-variation-settings: 'FILL' 1;">location_on</span>
<h1 class="text-3xl font-black text-primary-container tracking-tight">Vevhu Resources</h1>
</div>
<p class="text-on-surface-variant text-body-md">Land Verification Field System</p>
</header>
<!-- Auth Card -->
<main class="w-full max-w-sm bg-card rounded-xl shadow-sm border border-border p-6 mb-8">
<form class="flex flex-col gap-6" onsubmit="event.preventDefault();">
<!-- Employee ID Input -->
<div class="relative input-floating-label pt-4">
<input class="block w-full h-[52px] px-4 pb-2 pt-6 text-on-surface bg-surface border border-outline-variant rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-primary-container transition-colors peer" id="employeeId" placeholder=" " required="" type="text"/>
<label class="absolute text-on-surface-variant duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] left-4 peer-focus:text-primary-container peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-4 font-body-md pointer-events-none" for="employeeId">Employee ID</label>
</div>
<!-- PIN Input -->
<div class="relative input-floating-label pt-4">
<input class="block w-full h-[52px] px-4 pb-2 pt-6 text-on-surface bg-surface border border-outline-variant rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-primary-container transition-colors peer tracking-widest text-lg" id="pinCode" inputmode="numeric" maxlength="6" pattern="[0-9]{6}" placeholder=" " required="" type="password"/>
<label class="absolute text-on-surface-variant duration-300 transform -translate-y-4 scale-75 top-5 z-10 origin-[0] left-4 peer-focus:text-primary-container peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-85 peer-focus:-translate-y-4 font-body-md pointer-events-none" for="pinCode">PIN Code</label>
<div class="absolute right-4 top-[26px] text-on-surface-variant">
<span class="material-symbols-outlined text-[20px]">dialpad</span>
</div>
</div>
<!-- Submit Button -->
<button class="w-full h-[52px] mt-2 bg-primary-container hover:bg-primary-dark text-white font-title-sm rounded-lg shadow-sm transition-colors active:scale-[0.98]" type="submit">
                Sign In
            </button>
</form>
</main>
<!-- Bottom Status Section -->
<div class="w-full max-w-sm flex flex-col items-center gap-6 mt-4">
<div class="flex items-center justify-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-border">
<span class="material-symbols-outlined text-[18px] text-success" style="font-variation-settings: 'FILL' 1;">security</span>
<span class="material-symbols-outlined text-[18px] text-on-surface-variant">wifi_off</span>
<span class="text-label-sm text-on-surface-variant">Works offline — data stays on device</span>
</div>
<footer class="text-label-sm text-secondary-fixed-dim">
            Version 1.2.0
        </footer>
</div>
</body></html>`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "navigate" && onNavigate) {
          onNavigate(msg.route);
        } else if (msg.type === "action" && onAction) {
          onAction(msg.actionType, msg.payload);
        }
      } catch (_e) {}
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onNavigate, onAction]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#FAFAF9",
      }}
    >
      <iframe
        ref={iframeRef}
        srcDoc={rawHtml}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        title="login screen"
      />
    </div>
  );
}

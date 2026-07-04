"use dom";

import { useEffect, useRef } from "react";

interface Props {
  onNavigate?: (route: string) => void;
  onAction?: (actionType: string, payload?: any) => void;
  data?: any;
  dom?: import("expo/dom").DOMProps;
}

export default function AnnouncementsDOM({ onNavigate, onAction, data }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const rawHtml = `<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, viewport-fit=cover" name="viewport"/>
<title>Announcements - Brand Orange</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-tertiary-fixed-variant": "#004c69",
                        "on-secondary-container": "#68615b",
                        "inverse-on-surface": "#ffede6",
                        "warning": "#F59E0B",
                        "secondary-fixed-dim": "#cfc5bd",
                        "secondary": "#645d57",
                        "primary-container": "#f3772d",
                        "on-primary-fixed": "#341100",
                        "tertiary-fixed-dim": "#7bd0ff",
                        "surface-container-high": "#fae4da",
                        "primary-fixed-dim": "#ffb691",
                        "on-error": "#ffffff",
                        "on-tertiary-container": "#00374d",
                        "surface": "#fff8f6",
                        "surface-tint": "#9e4200",
                        "primary-fixed": "#ffdbcb",
                        "secondary-container": "#e8ded6",
                        "on-surface": "#241914",
                        "secondary-fixed": "#ebe1d9",
                        "on-primary": "#ffffff",
                        "tertiary": "#00668a",
                        "primary-light": "#FF9654",
                        "error-container": "#ffdad6",
                        "on-tertiary": "#ffffff",
                        "outline": "#8b7266",
                        "inverse-surface": "#3b2e27",
                        "on-secondary-fixed": "#1f1b16",
                        "primary-dark": "#D85D15",
                        "tertiary-container": "#00a6df",
                        "border": "#E7E5E4",
                        "background": "#FAFAF9",
                        "tertiary-fixed": "#c4e7ff",
                        "on-error-container": "#93000a",
                        "outline-variant": "#dfc0b3",
                        "on-tertiary-fixed": "#001e2c",
                        "on-background": "#241914",
                        "on-secondary-fixed-variant": "#4c4640",
                        "inverse-primary": "#ffb691",
                        "card": "#FFFFFF",
                        "on-primary-container": "#582200",
                        "surface-container": "#ffeae1",
                        "on-secondary": "#ffffff",
                        "surface-container-low": "#fff1eb",
                        "surface-container-highest": "#f4ded5",
                        "on-surface-variant": "#574238",
                        "brand-blue": "#1976D2",
                        "surface-dim": "#ebd6cc",
                        "surface-container-lowest": "#ffffff",
                        "surface-bright": "#fff8f6",
                        "on-primary-fixed-variant": "#793100",
                        "success": "#22C55E",
                        "error": "#EF4444",
                        "primary": "#9e4200",
                        "surface-variant": "#f4ded5",
                        "brand-blue-dark": "#0475E0"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "touch-target-min": "48px",
                        "margin-edge": "1rem",
                        "gutter": "0.75rem",
                        "tab-bar-height": "60px"
                    },
                    "fontFamily": {
                        "headline-lg": ["Inter"],
                        "headline-md": ["Inter"],
                        "label-sm": ["Inter"],
                        "label-bold": ["Inter"],
                        "body-bold": ["Inter"],
                        "title-sm": ["Inter"],
                        "body-md": ["Inter"]
                    },
                    "fontSize": {
                        "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }],
                        "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "700" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
                        "label-bold": ["12px", { "lineHeight": "16px", "fontWeight": "700" }],
                        "body-bold": ["14px", { "lineHeight": "20px", "fontWeight": "700" }],
                        "title-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
                        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }]
                    }
                }
            }
        }
    </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen flex flex-col font-body-md pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
<!-- TopAppBar -->
<header class="w-full top-0 sticky border-b border-outline-variant dark:border-outline shadow-sm bg-surface dark:bg-surface-dim z-40">
<div class="flex items-center justify-between px-margin-edge h-touch-target-min">
<div class="flex items-center gap-3">
<button aria-label="Menu" class="w-touch-target-min h-touch-target-min flex items-center justify-center text-primary dark:text-primary-fixed-dim hover:bg-surface-container-high transition-colors duration-200 rounded-full">
<span class="material-symbols-outlined">menu</span>
</button>
<h1 class="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim flex items-center gap-2">
                    Announcements
                    <span class="bg-primary-container text-on-primary-container font-label-bold text-label-bold px-2 py-0.5 rounded-full inline-flex items-center">3 unread</span>
</h1>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 px-margin-edge py-4 space-y-4 pb-tab-bar-height mb-8">
<!-- Unread Card 1 -->
<article class="bg-surface-container-low border-l-[3px] border-l-primary-container shadow-sm rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden transition-transform duration-200 active:scale-[0.98]">
<div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary-container/10 to-transparent pointer-events-none"></div>
<header class="flex justify-between items-start">
<h2 class="font-title-sm text-title-sm text-on-surface">Phase 2 Survey Zone Update</h2>
<span class="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap ml-2">2 hours ago</span>
</header>
<p class="font-body-md text-body-md text-on-surface-variant">New areas added to July coverage. Report to team lead.</p>
</article>
<!-- Unread Card 2 -->
<article class="bg-surface-container-low border-l-[3px] border-l-primary-container shadow-sm rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden transition-transform duration-200 active:scale-[0.98]">
<div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary-container/10 to-transparent pointer-events-none"></div>
<header class="flex justify-between items-start">
<h2 class="font-title-sm text-title-sm text-on-surface">GPS Accuracy Guidelines</h2>
<span class="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap ml-2">5 hours ago</span>
</header>
<p class="font-body-md text-body-md text-on-surface-variant">Minimum 10m accuracy required.</p>
</article>
<!-- Unread Card 3 -->
<article class="bg-surface-container-low border-l-[3px] border-l-primary-container shadow-sm rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden transition-transform duration-200 active:scale-[0.98]">
<div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary-container/10 to-transparent pointer-events-none"></div>
<header class="flex justify-between items-start">
<h2 class="font-title-sm text-title-sm text-on-surface">July Targets</h2>
<span class="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap ml-2">1 day ago</span>
</header>
<p class="font-body-md text-body-md text-on-surface-variant">15 submissions per day minimum.</p>
</article>
<!-- Example Read Card (Plain White) -->
<article class="bg-card border border-border shadow-sm rounded-lg p-4 flex flex-col gap-2 transition-transform duration-200 active:scale-[0.98]">
<header class="flex justify-between items-start">
<h2 class="font-title-sm text-title-sm text-on-surface">System Maintenance Completed</h2>
<span class="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap ml-2">3 days ago</span>
</header>
<p class="font-body-md text-body-md text-on-surface-variant">Offline sync issues have been resolved. Ensure app is updated to v2.4.</p>
</article>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-[env(safe-area-inset-bottom)] w-full h-tab-bar-height z-50 border-t border-outline-variant dark:border-outline shadow-lg bg-surface dark:bg-surface-dim">
<div class="flex justify-around items-center w-full px-2 h-full">
<button class="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-highest scale-95 active:scale-90 transition-transform w-16 h-14 rounded-xl">
<span class="material-symbols-outlined">home</span>
<span class="font-label-bold text-label-bold mt-1">Home</span>
</button>
<button class="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-highest scale-95 active:scale-90 transition-transform w-16 h-14 rounded-xl">
<span class="material-symbols-outlined">edit_document</span>
<span class="font-label-bold text-label-bold mt-1">Collect</span>
</button>
<button class="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-highest scale-95 active:scale-90 transition-transform w-16 h-14 rounded-xl">
<span class="material-symbols-outlined">analytics</span>
<span class="font-label-bold text-label-bold mt-1">Progress</span>
</button>
<!-- Active Tab -->
<button class="flex flex-col items-center justify-center bg-primary-container dark:bg-primary-fixed-dim text-on-primary-container dark:text-on-primary-fixed rounded-full px-4 py-1 hover:bg-surface-container-highest scale-95 active:scale-90 transition-transform">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">chat</span>
<span class="font-label-bold text-label-bold mt-1">Messages</span>
</button>
<button class="flex flex-col items-center justify-center text-on-surface-variant dark:text-surface-variant hover:bg-surface-container-highest scale-95 active:scale-90 transition-transform w-16 h-14 rounded-xl">
<span class="material-symbols-outlined">settings</span>
<span class="font-label-bold text-label-bold mt-1">Settings</span>
</button>
</div>
</nav>
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
        title="announcements screen"
      />
    </div>
  );
}

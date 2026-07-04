"use dom";

import { useEffect, useRef } from "react";

interface Props {
  onNavigate?: (route: string) => void;
  onAction?: (actionType: string, payload?: any) => void;
  data?: any;
  dom?: import("expo/dom").DOMProps;
}

export default function ProgressDOM({ onNavigate, onAction, data }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const rawHtml = `<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" name="viewport"/>
<title>Progress Tracking - Vevhu Land</title>
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
                        "tertiary": "#00668a",
                        "on-secondary-fixed-variant": "#4c4640",
                        "on-primary-container": "#582200",
                        "outline": "#8b7266",
                        "on-tertiary-fixed-variant": "#004c69",
                        "surface-container-highest": "#f4ded5",
                        "on-error-container": "#93000a",
                        "secondary-fixed": "#ebe1d9",
                        "outline-variant": "#dfc0b3",
                        "brand-blue": "#1976D2",
                        "surface-container-lowest": "#ffffff",
                        "on-surface": "#241914",
                        "background": "#FAFAF9",
                        "on-surface-variant": "#574238",
                        "tertiary-container": "#00a6df",
                        "on-primary-fixed": "#341100",
                        "brand-blue-dark": "#0475E0",
                        "on-secondary-container": "#68615b",
                        "inverse-primary": "#ffb691",
                        "on-secondary-fixed": "#1f1b16",
                        "surface-tint": "#9e4200",
                        "on-tertiary-container": "#00374d",
                        "warning": "#F59E0B",
                        "surface-variant": "#f4ded5",
                        "tertiary-fixed-dim": "#7bd0ff",
                        "success": "#22C55E",
                        "on-secondary": "#ffffff",
                        "inverse-on-surface": "#ffede6",
                        "on-primary-fixed-variant": "#793100",
                        "border": "#E7E5E4",
                        "surface-bright": "#fff8f6",
                        "card": "#FFFFFF",
                        "error": "#EF4444",
                        "secondary-fixed-dim": "#cfc5bd",
                        "surface": "#fff8f6",
                        "inverse-surface": "#3b2e27",
                        "tertiary-fixed": "#c4e7ff",
                        "secondary-container": "#e8ded6",
                        "surface-container-low": "#fff1eb",
                        "surface-dim": "#ebd6cc",
                        "on-error": "#ffffff",
                        "primary-fixed-dim": "#ffb691",
                        "error-container": "#ffdad6",
                        "on-primary": "#ffffff",
                        "primary-light": "#FF9654",
                        "secondary": "#645d57",
                        "surface-container-high": "#fae4da",
                        "on-tertiary": "#ffffff",
                        "primary": "#9e4200",
                        "primary-container": "#f3772d",
                        "primary-dark": "#D85D15",
                        "surface-container": "#ffeae1",
                        "primary-fixed": "#ffdbcb",
                        "on-tertiary-fixed": "#001e2c",
                        "on-background": "#241914"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.25rem",
                        "lg": "0.5rem",
                        "xl": "0.75rem",
                        "full": "9999px"
                    },
                    "spacing": {
                        "margin-edge": "1rem",
                        "tab-bar-height": "60px",
                        "touch-target-min": "48px",
                        "gutter": "0.75rem"
                    },
                    "fontFamily": {
                        "body-bold": ["Inter"],
                        "headline-md": ["Inter"],
                        "label-bold": ["Inter"],
                        "title-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-lg": ["Inter"]
                    },
                    "fontSize": {
                        "body-bold": ["14px", { "lineHeight": "20px", "fontWeight": "700" }],
                        "headline-md": ["20px", { "lineHeight": "28px", "fontWeight": "700" }],
                        "label-bold": ["12px", { "lineHeight": "16px", "fontWeight": "700" }],
                        "title-sm": ["16px", { "lineHeight": "24px", "fontWeight": "600" }],
                        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
                        "headline-lg": ["24px", { "lineHeight": "32px", "fontWeight": "700" }]
                    }
                }
            }
        }
    </script>
<style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: theme('colors.background');
            -webkit-tap-highlight-color: transparent;
        }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .pt-safe { padding-top: env(safe-area-inset-top); }
        
        /* Hide scrollbar for stat row */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-surface h-screen flex flex-col overflow-hidden">
<!-- TopAppBar JSON Component -->
<header class="docked full-width top-0 bg-surface dark:bg-surface-dim shadow-sm flex flex-col pt-safe z-40">
<div class="flex justify-between items-center w-full px-margin-edge h-touch-target-min border-b border-outline-variant dark:border-outline pb-2">
<button aria-label="Menu" class="flex items-center justify-center w-touch-target-min h-touch-target-min rounded-full hover:bg-surface-variant/50 transition-colors active:opacity-80 transition-opacity">
<span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim" style="font-variation-settings: 'FILL' 0;">map</span>
</button>
<h1 class="text-headline-md font-headline-md text-primary dark:text-primary-container truncate">My Progress</h1>
<button aria-label="Profile" class="flex items-center justify-center w-touch-target-min h-touch-target-min rounded-full overflow-hidden hover:bg-surface-variant/50 transition-colors active:opacity-80 transition-opacity">
<div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-bold">
                    WP
                </div>
</button>
</div>
<!-- Search Bar -->
<div class="px-margin-edge py-3 bg-surface">
<div class="relative flex items-center w-full h-touch-target-min bg-surface-container-low rounded-lg border border-outline-variant focus-within:border-primary transition-colors">
<span class="material-symbols-outlined absolute left-3 text-on-surface-variant">search</span>
<input class="w-full h-full pl-10 pr-4 bg-transparent border-none rounded-lg text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:ring-0 focus:outline-none" placeholder="Search stands or names..." type="text"/>
</div>
</div>
</header>
<!-- Main Content Canvas -->
<main class="flex-1 overflow-y-auto px-margin-edge pt-4 pb-[80px]">
<!-- Metric Cards Row -->
<section class="mb-6 overflow-x-auto no-scrollbar -mx-margin-edge px-margin-edge">
<div class="flex space-x-gutter pb-2 min-w-max">
<!-- Card 1 -->
<div class="bg-card rounded-lg shadow-sm w-32 h-20 p-3 flex flex-col justify-center border-l-4 border-l-primary-container relative shrink-0">
<span class="text-label-sm font-label-sm text-on-surface-variant">My Today</span>
<span class="text-headline-lg font-headline-lg text-primary">12</span>
</div>
<!-- Card 2 -->
<div class="bg-card rounded-lg shadow-sm w-32 h-20 p-3 flex flex-col justify-center border-l-4 border-l-outline-variant relative shrink-0">
<span class="text-label-sm font-label-sm text-on-surface-variant">Team Today</span>
<span class="text-headline-md font-headline-md text-on-surface">47</span>
</div>
<!-- Card 3 -->
<div class="bg-card rounded-lg shadow-sm w-32 h-20 p-3 flex flex-col justify-center border-l-4 border-l-outline-variant relative shrink-0">
<span class="text-label-sm font-label-sm text-on-surface-variant">My Week</span>
<span class="text-headline-md font-headline-md text-on-surface">58</span>
</div>
</div>
</section>
<!-- Segmented Control -->
<div class="flex p-1 bg-surface-container-low rounded-lg mb-6 shadow-inner">
<button class="flex-1 py-2 text-title-sm font-title-sm rounded-md bg-primary-container text-on-primary shadow-sm flex items-center justify-center space-x-2 transition-colors h-touch-target-min">
<span class="material-symbols-outlined text-[18px]">person</span>
<span>My Submissions</span>
</button>
<button class="flex-1 py-2 text-title-sm font-title-sm rounded-md bg-transparent text-on-surface-variant hover:bg-surface-variant/50 flex items-center justify-center space-x-2 transition-colors h-touch-target-min">
<span class="material-symbols-outlined text-[18px]">business</span>
<span>All Team</span>
</button>
</div>
<!-- Submission List -->
<div class="space-y-4">
<!-- Record Card 1 (Synced) -->
<article class="bg-card rounded-lg shadow-sm p-4 border border-border flex flex-col gap-3 relative overflow-hidden active:bg-surface-variant/30 transition-colors">
<div class="flex justify-between items-start">
<div class="flex flex-col gap-1">
<div class="flex items-center gap-2">
<span class="bg-brand-blue text-on-primary text-label-bold font-label-bold px-2 py-1 rounded-sm tracking-wide">STD-0042</span>
<div class="flex items-center gap-1">
<div class="w-2 h-2 rounded-full bg-success"></div>
<span class="text-label-sm font-label-sm text-success">Synced</span>
</div>
</div>
<h3 class="text-title-sm font-title-sm text-on-surface mt-1">John Moyo</h3>
<div class="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
<span class="bg-surface-container-highest px-2 py-0.5 rounded-full">Owner</span>
<span>•</span>
<span>10:45 AM</span>
</div>
</div>
</div>
<!-- Attachments Pills -->
<div class="flex flex-wrap gap-2 mt-1">
<div class="flex items-center gap-1 bg-surface-variant px-2 py-1 rounded-md text-label-sm font-label-sm text-on-surface-variant">
<span class="material-symbols-outlined text-[14px]">photo_camera</span>
<span>3 Photos</span>
</div>
<div class="flex items-center gap-1 bg-surface-variant px-2 py-1 rounded-md text-label-sm font-label-sm text-on-surface-variant">
<span class="material-symbols-outlined text-[14px]">mic</span>
<span>Audio 1:23</span>
</div>
<div class="flex items-center gap-1 bg-surface-variant px-2 py-1 rounded-md text-label-sm font-label-sm text-on-surface-variant">
<span class="material-symbols-outlined text-[14px]">draw</span>
<span>Signed</span>
</div>
</div>
</article>
<!-- Record Card 2 (Pending) -->
<article class="bg-card rounded-lg shadow-sm p-4 border border-border flex flex-col gap-3 relative overflow-hidden active:bg-surface-variant/30 transition-colors">
<div class="flex justify-between items-start">
<div class="flex flex-col gap-1">
<div class="flex items-center gap-2">
<span class="bg-brand-blue text-on-primary text-label-bold font-label-bold px-2 py-1 rounded-sm tracking-wide">STD-0128</span>
<div class="flex items-center gap-1">
<div class="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
<span class="text-label-sm font-label-sm text-warning">Pending</span>
</div>
</div>
<h3 class="text-title-sm font-title-sm text-on-surface mt-1">Sarah Tembo</h3>
<div class="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
<span class="bg-surface-container-highest px-2 py-0.5 rounded-full">Tenant</span>
<span>•</span>
<span>09:12 AM</span>
</div>
</div>
</div>
<div class="flex flex-wrap gap-2 mt-1">
<div class="flex items-center gap-1 bg-surface-variant px-2 py-1 rounded-md text-label-sm font-label-sm text-on-surface-variant">
<span class="material-symbols-outlined text-[14px]">photo_camera</span>
<span>1 Photo</span>
</div>
<div class="flex items-center gap-1 bg-surface-variant px-2 py-1 rounded-md text-label-sm font-label-sm text-on-surface-variant opacity-50">
<span class="material-symbols-outlined text-[14px]">mic_off</span>
<span>No Audio</span>
</div>
</div>
</article>
<!-- Record Card 3 (Synced) -->
<article class="bg-card rounded-lg shadow-sm p-4 border border-border flex flex-col gap-3 relative overflow-hidden active:bg-surface-variant/30 transition-colors opacity-75">
<div class="flex justify-between items-start">
<div class="flex flex-col gap-1">
<div class="flex items-center gap-2">
<span class="bg-brand-blue text-on-primary text-label-bold font-label-bold px-2 py-1 rounded-sm tracking-wide">STD-0089</span>
<div class="flex items-center gap-1">
<div class="w-2 h-2 rounded-full bg-success"></div>
<span class="text-label-sm font-label-sm text-success">Synced</span>
</div>
</div>
<h3 class="text-title-sm font-title-sm text-on-surface mt-1">David Ncube</h3>
<div class="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
<span class="bg-surface-container-highest px-2 py-0.5 rounded-full">Relative</span>
<span>•</span>
<span>Yesterday</span>
</div>
</div>
</div>
</article>
<div class="h-6"></div> <!-- Spacer for bottom scroll -->
</div>
</main>
<!-- BottomNavBar JSON Component -->
<!-- Destination Rule: Appears on top level screens. Contextual State: Progress is active -->
<nav class="fixed bottom-0 w-full z-50 h-[60px] bg-surface dark:bg-surface-container-lowest shadow-lg border-t border-outline-variant dark:border-outline md:hidden">
<div class="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 pb-safe bg-surface h-[60px]">
<button aria-label="Home" class="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant pt-1 hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">home</span>
<span class="text-label-sm font-label-sm mt-1">Home</span>
</button>
<button aria-label="Collect" class="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant pt-1 hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">edit_location_alt</span>
<span class="text-label-sm font-label-sm mt-1">Collect</span>
</button>
<button aria-label="Progress" class="flex flex-col items-center justify-center text-primary dark:text-primary-container border-t-2 border-primary pt-1 hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">analytics</span>
<span class="text-label-sm font-label-sm mt-1 font-bold">Progress</span>
</button>
<button aria-label="Messages" class="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant pt-1 hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">mail</span>
<span class="text-label-sm font-label-sm mt-1">Messages</span>
</button>
<button aria-label="Settings" class="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-secondary-fixed-variant pt-1 hover:bg-surface-container-low transition-all active:scale-95 duration-150 w-full h-full">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">settings</span>
<span class="text-label-sm font-label-sm mt-1">Settings</span>
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
        title="progress screen"
      />
    </div>
  );
}

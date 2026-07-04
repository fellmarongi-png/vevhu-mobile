"use dom";

import { useEffect, useRef } from "react";

interface Props {
  onNavigate?: (route: string) => void;
  onAction?: (actionType: string, payload?: any) => void;
  data?: any;
  dom?: import("expo/dom").DOMProps;
}

export default function HomeDOM({ onNavigate, onAction, data }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const rawHtml = `<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" name="viewport"/>
<title>Vevhu Resources Mobile Home Screen</title>
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
                      "brand-blue": "#1976D2",
                      "secondary": "#645d57",
                      "on-primary-fixed": "#341100",
                      "tertiary": "#00668a",
                      "primary-fixed-dim": "#ffb691",
                      "primary-fixed": "#ffdbcb",
                      "on-secondary-container": "#68615b",
                      "card": "#FFFFFF",
                      "on-secondary": "#ffffff",
                      "outline": "#8b7266",
                      "surface-tint": "#9e4200",
                      "error-container": "#ffdad6",
                      "on-tertiary": "#ffffff",
                      "border": "#E7E5E4",
                      "warning": "#F59E0B",
                      "primary-dark": "#D85D15",
                      "on-tertiary-fixed-variant": "#004c69",
                      "on-primary-fixed-variant": "#793100",
                      "inverse-on-surface": "#ffede6",
                      "tertiary-fixed-dim": "#7bd0ff",
                      "surface-variant": "#f4ded5",
                      "success": "#22C55E",
                      "on-primary-container": "#582200",
                      "on-tertiary-container": "#00374d",
                      "surface-dim": "#ebd6cc",
                      "surface-container-high": "#fae4da",
                      "inverse-surface": "#3b2e27",
                      "on-primary": "#ffffff",
                      "on-error": "#ffffff",
                      "surface-container": "#ffeae1",
                      "on-secondary-fixed": "#1f1b16",
                      "background": "#FAFAF9",
                      "surface-container-highest": "#f4ded5",
                      "on-secondary-fixed-variant": "#4c4640",
                      "primary-light": "#FF9654",
                      "brand-blue-dark": "#0475E0",
                      "surface": "#fff8f6",
                      "surface-container-low": "#fff1eb",
                      "surface-container-lowest": "#ffffff",
                      "on-error-container": "#93000a",
                      "on-surface-variant": "#574238",
                      "outline-variant": "#dfc0b3",
                      "primary-container": "#f3772d",
                      "primary": "#9e4200",
                      "tertiary-container": "#00a6df",
                      "tertiary-fixed": "#c4e7ff",
                      "on-tertiary-fixed": "#001e2c",
                      "surface-bright": "#fff8f6",
                      "secondary-fixed": "#ebe1d9",
                      "on-surface": "#241914",
                      "inverse-primary": "#ffb691",
                      "secondary-fixed-dim": "#cfc5bd",
                      "secondary-container": "#e8ded6",
                      "on-background": "#241914",
                      "error": "#EF4444"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "gutter": "0.75rem",
                      "tab-bar-height": "60px",
                      "margin-edge": "1rem",
                      "touch-target-min": "48px"
              },
              "fontFamily": {
                      "body-bold": [
                              "Inter"
                      ],
                      "headline-md": [
                              "Inter"
                      ],
                      "title-sm": [
                              "Inter"
                      ],
                      "headline-lg": [
                              "Inter"
                      ],
                      "body-md": [
                              "Inter"
                      ],
                      "label-sm": [
                              "Inter"
                      ],
                      "label-bold": [
                              "Inter"
                      ]
              },
              "fontSize": {
                      "body-bold": [
                              "14px",
                              {
                                      "lineHeight": "20px",
                                      "fontWeight": "700"
                              }
                      ],
                      "headline-md": [
                              "20px",
                              {
                                      "lineHeight": "28px",
                                      "fontWeight": "700"
                              }
                      ],
                      "title-sm": [
                              "16px",
                              {
                                      "lineHeight": "24px",
                                      "fontWeight": "600"
                              }
                      ],
                      "headline-lg": [
                              "24px",
                              {
                                      "lineHeight": "32px",
                                      "fontWeight": "700"
                              }
                      ],
                      "body-md": [
                              "14px",
                              {
                                      "lineHeight": "20px",
                                      "fontWeight": "400"
                              }
                      ],
                      "label-sm": [
                              "12px",
                              {
                                      "lineHeight": "16px",
                                      "fontWeight": "500"
                              }
                      ],
                      "label-bold": [
                              "12px",
                              {
                                      "lineHeight": "16px",
                                      "fontWeight": "700"
                              }
                      ]
              }
      },
          },
        }
      </script>
<style>
        .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
        .pt-safe { padding-top: env(safe-area-inset-top); }
      </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background min-h-screen text-on-background font-body-md text-body-md selection:bg-primary-container selection:text-on-primary-container">
<!-- Main Wrapper, accounts for fixed top/bottom navs -->
<div class="flex flex-col h-screen pt-safe pb-safe overflow-hidden">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-margin-edge w-full h-16 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline shadow-sm flex-shrink-0 z-10 pt-safe">
<div class="flex items-center gap-3">
<img class="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm" data-alt="A small, professional avatar portrait of a field worker in high-visibility gear, looking confident. The lighting is bright and sunny, conveying an outdoor environment. High contrast and clear features." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGf5TAgOcV50Vlv8YFoFoYotH5nIzJ3I0_AaZkE4xcBM3G1UKCF5S4HQr-lX0kH1cnzTeObOAu7WFYUhE09Fd_xCYS7RgeaPU2kcPVDJ0BeDJMlSAPhu7uGopUFkuhFY4bhn8aFcrbAIPsJhITh9OvqWrt_VguVExWHh49DTLbvXgxpwX1QqvcbUKvPArN8vueDGRKf4KUxceJwupRI7rNp9CpSwfsyz9aDU8AS3mJ4tawylNF0Utl49Dj_cd2XZDqnRWuLwC1Sv1S"/>
<div class="flex flex-col">
<span class="text-headline-md font-headline-md text-primary dark:text-primary-fixed-dim">Vevhu Resources</span>
<span class="text-label-sm font-label-sm text-secondary">John Doe</span>
</div>
</div>
<div class="flex items-center gap-2 bg-primary-container/10 px-3 py-1.5 rounded-full border border-primary-container/20">
<span class="material-symbols-outlined text-primary-container text-[18px]">cloud_done</span>
<span class="text-label-bold font-label-bold text-primary-container">Synced</span>
</div>
</header>
<!-- Scrollable Content Canvas -->
<main class="flex-1 overflow-y-auto px-margin-edge py-gutter pb-[80px]">
<!-- Metric Cards Row -->
<section class="grid grid-cols-3 gap-gutter mb-6">
<!-- Card 1 -->
<div class="bg-card rounded-[16px] p-4 shadow-sm border-t-2 border-primary-container flex flex-col items-center justify-center gap-1">
<span class="text-headline-lg font-headline-lg text-on-surface">8</span>
<span class="text-label-sm font-label-sm text-secondary text-center">Today</span>
</div>
<!-- Card 2 -->
<div class="bg-card rounded-[16px] p-4 shadow-sm border-t-2 border-primary-container flex flex-col items-center justify-center gap-1">
<span class="text-headline-lg font-headline-lg text-on-surface">42</span>
<span class="text-label-sm font-label-sm text-secondary text-center">This Week</span>
</div>
<!-- Card 3 -->
<div class="bg-card rounded-[16px] p-4 shadow-sm border-t-2 border-primary-container flex flex-col items-center justify-center gap-1">
<span class="text-headline-lg font-headline-lg text-on-surface">156</span>
<span class="text-label-sm font-label-sm text-secondary text-center">Team</span>
</div>
</section>
<!-- Primary CTA -->
<section class="mb-8">
<button class="w-full bg-primary-container hover:bg-primary-dark text-on-primary rounded-[16px] min-h-[56px] shadow-md flex items-center justify-center gap-3 transition-colors duration-200 active:scale-[0.98]">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">location_on</span>
<span class="text-title-sm font-title-sm">Start New Collection</span>
</button>
</section>
<!-- Recent Submissions List -->
<section class="flex flex-col gap-4">
<h2 class="text-title-sm font-title-sm text-on-surface mb-1">Recent Submissions</h2>
<!-- List Item 1 -->
<div class="bg-card rounded-[16px] p-4 shadow-sm border border-border flex justify-between items-center">
<div class="flex items-center gap-4">
<div class="bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-full border border-brand-blue/20 flex items-center justify-center min-w-[90px]">
<span class="text-label-bold font-label-bold">Stand 402</span>
</div>
<div class="flex flex-col">
<span class="text-body-bold font-body-bold text-on-surface">Residential Plot</span>
<span class="text-label-sm font-label-sm text-secondary">10:45 AM today</span>
</div>
</div>
<span class="material-symbols-outlined text-success" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
<!-- List Item 2 -->
<div class="bg-card rounded-[16px] p-4 shadow-sm border border-border flex justify-between items-center">
<div class="flex items-center gap-4">
<div class="bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-full border border-brand-blue/20 flex items-center justify-center min-w-[90px]">
<span class="text-label-bold font-label-bold">Stand 405</span>
</div>
<div class="flex flex-col">
<span class="text-body-bold font-body-bold text-on-surface">Commercial Unit</span>
<span class="text-label-sm font-label-sm text-secondary">09:12 AM today</span>
</div>
</div>
<span class="material-symbols-outlined text-success" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
<!-- List Item 3 -->
<div class="bg-card rounded-[16px] p-4 shadow-sm border border-border flex justify-between items-center">
<div class="flex items-center gap-4">
<div class="bg-brand-blue/10 text-brand-blue px-3 py-1.5 rounded-full border border-brand-blue/20 flex items-center justify-center min-w-[90px]">
<span class="text-label-bold font-label-bold">Stand 389</span>
</div>
<div class="flex flex-col">
<span class="text-body-bold font-body-bold text-on-surface">Vacant Land</span>
<span class="text-label-sm font-label-sm text-secondary">Yesterday, 4:30 PM</span>
</div>
</div>
<span class="material-symbols-outlined text-success" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
</section>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full flex justify-around items-center px-2 bg-surface dark:bg-surface-container-high border-t border-border dark:border-outline-variant shadow-lg h-[60px] pb-safe z-50">
<!-- Home (Active) -->
<button class="flex flex-col items-center justify-center text-primary dark:text-primary-fixed-dim border-t-2 border-primary dark:border-primary-fixed-dim pt-1 flex-1 hover:bg-primary-container/10 scale-95 active:scale-90 transition-transform duration-150 h-full min-w-[48px]">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">home</span>
<span class="text-label-bold font-label-bold mt-1">Home</span>
</button>
<!-- Collect (Inactive) -->
<button class="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim pt-1 flex-1 hover:bg-primary-container/10 scale-95 active:scale-90 transition-transform duration-150 h-full min-w-[48px]">
<span class="material-symbols-outlined">edit_document</span>
<span class="text-label-bold font-label-bold mt-1">Collect</span>
</button>
<!-- Progress (Inactive) -->
<button class="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim pt-1 flex-1 hover:bg-primary-container/10 scale-95 active:scale-90 transition-transform duration-150 h-full min-w-[48px]">
<span class="material-symbols-outlined">analytics</span>
<span class="text-label-bold font-label-bold mt-1">Progress</span>
</button>
<!-- Messages (Inactive) -->
<button class="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim pt-1 flex-1 hover:bg-primary-container/10 scale-95 active:scale-90 transition-transform duration-150 h-full min-w-[48px] relative">
<span class="material-symbols-outlined">chat</span>
<span class="text-label-bold font-label-bold mt-1">Messages</span>
<span class="absolute top-1 right-3 w-2 h-2 bg-error rounded-full"></span>
</button>
<!-- Settings (Inactive) -->
<button class="flex flex-col items-center justify-center text-secondary dark:text-secondary-fixed-dim pt-1 flex-1 hover:bg-primary-container/10 scale-95 active:scale-90 transition-transform duration-150 h-full min-w-[48px]">
<span class="material-symbols-outlined">settings</span>
<span class="text-label-bold font-label-bold mt-1">Settings</span>
</button>
</nav>
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
        title="home screen"
      />
    </div>
  );
}

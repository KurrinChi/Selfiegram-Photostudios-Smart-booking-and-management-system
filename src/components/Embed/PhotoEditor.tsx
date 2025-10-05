import React, { useRef, useEffect, useState, useCallback } from "react";
import type { HTMLAttributes } from "react";

declare global {
  interface Window {
    tui?: any;
    fabric?: any;
  }
}

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const TOAST_CSS_BACKUPS = [
  "https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.css",
];

const TOAST_COLOR_PICKER_CSS = [
  "https://uicdn.toast.com/tui-color-picker/latest/tui-color-picker.css",
];

const FABRIC_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/4.6.0/fabric.min.js";
const TUI_SNIPPET_CDN =
  "https://uicdn.toast.com/tui.code-snippet/latest/tui-code-snippet.min.js";
const TUI_COLOR_PICKER_SCRIPT =
  "https://uicdn.toast.com/tui-color-picker/latest/tui-color-picker.min.js";
const TUI_IMAGE_EDITOR_CDN =
  "https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.min.js";

const ICONS = {
  adjust: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>`
  )}`,
  reset: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>`
  )}`,
  brightness: "",
};
const SLIDER_ICONS: Record<string, string> = {
  brightness: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">ircle cx="12" cy="12" r="4"4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`
  )}`,
  contrast: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">ircle cx="12" cy="="12" r="10"/><path d="M12 2v20"/></svg>`
  )}`,
  saturation: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`
  )}`,
  highlights: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 3v1M12 20v1M4.22 4.22l.71.71M18.36 18.36l.71.71M1 12h1M21 12h1M4.22 19.78l.71-.71M18.36 5.64l.71-.71"/>ircle cx="12" cy="12"2" r="3"/></svg>`
  )}`,
  shadows: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 3a9 9 0 1 0 9 9"/>ircle cx="12" cy="1212" r="3"/></svg>`
  )}`,
  whites: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">ircle cx="12" cy="12"2" r="10"/></svg>`
  )}`,
  blacks: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">ircle cx="12" cy="12"2" r="10"/></svg>`
  )}`,
  hue: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">ircle cx="12" cy="12"2" r="10"/>ircle cx="12" cy="12" r="4" fill="whitete"/></svg>`
  )}`,
};

const MENU_ICONS: Record<string, string> = {
  crop: "https://img.icons8.com/ios-filled/50/crop.png",
  flip: "https://img.icons8.com/ios-filled/50/flip.png",
  rotate: "https://img.icons8.com/ios-filled/50/rotate.png",
  draw: "https://img.icons8.com/ios-filled/50/pencil.png",
  shape: "https://img.icons8.com/ios-filled/50/shape.png",
  icon: "https://img.icons8.com/ios-filled/50/star.png",
  text: "https://img.icons8.com/ios-filled/50/text.png",
  mask: "https://img.icons8.com/ios-filled/50/mask.png",
  filter: "https://img.icons8.com/ios-filled/50/filter.png",
  adjust: ICONS.adjust,
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AdjustValues {
  brightness: number;
  contrast: number;
  saturation: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  hue: number;
}

interface FabricImage {
  filters?: any[];
  width?: number;
  height?: number;
  originalWidth?: number;
  originalHeight?: number;
  scaleX?: number;
  scaleY?: number;
  left?: number;
  top?: number;
  originX?: string;
  originY?: string;
  selectable?: boolean;
  evented?: boolean;
  set?: (props: any) => void;
  applyFilters?: () => void;
  type?: string;
}

interface FabricCanvas {
  backgroundImage?: FabricImage | null;
  lowerCanvasEl?: HTMLCanvasElement;
  upperCanvasEl?: HTMLCanvasElement;
  selection?: boolean;
  preserveObjectStacking?: boolean;
  imageSmoothingEnabled?: boolean;
  enableRetinaScaling?: boolean;
  getActiveObject?: () => FabricImage | null;
  setDimensions?: (dim: { width: number; height: number }) => void;
  renderAll?: () => void;
  on?: (event: string, handler: (e?: any) => void) => void;
  off?: (event: string, handler: (e?: any) => void) => void;
}

interface TUIInstance {
  _graphics?: {
    getCanvas?: () => FabricCanvas | null;
  };
  graphics?: {
    getCanvas?: () => FabricCanvas | null;
  };
  destroy?: () => void;
}

interface EventListenerRef {
  el: Element;
  type: string;
  handler: EventListenerOrEventListenerObject;
}

interface ToastEditorProps extends HTMLAttributes<HTMLDivElement> {
  sampleImage?: { path: string; name?: string };
}

const DEFAULT_ADJUST_VALUES: AdjustValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  hue: 0,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function loadScriptWithBackups(
  urls: string[],
  timeout = 15000
): Promise<void> {
  let lastErr: Error | null = null;

  for (const url of urls) {
    try {
      const existing = document.querySelector(`script[src="${url}"]`);
      if (existing) {
        console.info(`[loader] script already present: ${url}`);
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = url;
        s.async = true;

        const timer = window.setTimeout(() => {
          s.onerror = null;
          s.onload = null;
          reject(new Error("Script load timeout: " + url));
        }, timeout);

        s.onload = () => {
          window.clearTimeout(timer);
          resolve();
        };

        s.onerror = () => {
          window.clearTimeout(timer);
          reject(new Error("Script load error: " + url));
        };

        document.body.appendChild(s);
      });

      console.info(`[loader] loaded script: ${url}`);
      return;
    } catch (err) {
      console.warn(`[loader] failed to load script ${url}:`, err);
      lastErr = err as Error;
    }
  }

  throw lastErr ?? new Error("No script URLs available");
}

async function loadCssWithBackups(urls: string[]): Promise<void> {
  for (const href of urls) {
    try {
      const existing = document.querySelector(`link[href="${href}"]`);
      if (existing) {
        console.info(`[loader] css already present: ${href}`);
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error("CSS load error: " + href));
        document.head.appendChild(link);
      });

      console.info(`[loader] loaded css: ${href}`);
      return;
    } catch (e) {
      console.warn(`[loader] css failed: ${href}`, e);
    }
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ToastEditor: React.FC<ToastEditorProps> = ({ sampleImage }) => {
  // ========== REFS ==========
  const editorRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<TUIInstance | null>(null);
  const adjustPanelRef = useRef<HTMLDivElement | null>(null);
  const canvasListenersRef = useRef<Record<string, (e?: any) => void> | null>(
    null
  );
  const adjustMenuLiRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const scheduledSessionRef = useRef<AdjustValues | null>(null);
  const panelVisibilityRef = useRef<boolean>(false);
  const menuBarListenerRef = useRef<((e: Event) => void) | null>(null);
  const imageLoadedRef = useRef(false);
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renderTimeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const panelListenersRef = useRef<EventListenerRef[]>([]);

  // Backend URL construction
  const backendUrl = (import.meta as any).env?.VITE_API_URL || "";
  const urlParams = new URLSearchParams(location.search);
  const filePath = decodeURIComponent(urlParams.get("url") || "");
  const imageUrl = filePath
    ? `${backendUrl}/api/proxy-image?path=${encodeURIComponent(
        filePath.replace(/^\/storage\//, "")
      )}`
    : "";

  // ========== STATE ==========
  const [sessionValues, setSessionValues] = useState<AdjustValues>(
    DEFAULT_ADJUST_VALUES
  );
  const sessionRef = useRef<AdjustValues>(sessionValues);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdjustPanelOpen, setIsAdjustPanelOpen] = useState(false);
  const [, setCurrentActiveMenu] = useState<string>("");

  // ========== SYNC STATE TO REF ==========
  useEffect(() => {
    sessionRef.current = sessionValues;
  }, [sessionValues]);

  useEffect(() => {
    panelVisibilityRef.current = isAdjustPanelOpen;
  }, [isAdjustPanelOpen]);

  // ========== HELPER FUNCTIONS ==========
  const formatValueForLabel = (
    _key: keyof AdjustValues,
    val: number
  ): string => {
    const abs = Math.abs(val);
    if (abs < 1) return val.toFixed(2);
    if (abs < 10) return val.toFixed(2);
    return String(Math.round(val));
  };

  const buildAdjustmentFilters = useCallback((values: AdjustValues): any[] => {
    const filters: any[] = [];

    // Brightness filter
    if (
      Math.abs(values.brightness) > 0.0001 &&
      window.fabric?.Image?.filters?.Brightness
    ) {
      try {
        const f = new window.fabric.Image.filters.Brightness({
          brightness: values.brightness,
        });
        (f as any).__tui_session_marker = true;
        filters.push(f);
      } catch (e) {
        console.warn("[Filter] Brightness creation failed:", e);
      }
    }

    // Contrast filter
    if (
      Math.abs(values.contrast) > 0.0001 &&
      window.fabric?.Image?.filters?.Contrast
    ) {
      try {
        const f = new window.fabric.Image.filters.Contrast({
          contrast: values.contrast,
        });
        (f as any).__tui_session_marker = true;
        filters.push(f);
      } catch (e) {
        console.warn("[Filter] Contrast creation failed:", e);
      }
    }

    // Saturation filter
    if (Math.abs(values.saturation) > 0.0001) {
      try {
        if (window.fabric?.Image?.filters?.Saturation) {
          const f = new window.fabric.Image.filters.Saturation({
            saturation: values.saturation,
          });
          (f as any).__tui_session_marker = true;
          filters.push(f);
        } else if (window.fabric?.Image?.filters?.ColorMatrix) {
          const s = 1 + values.saturation;
          const lumR = 0.2126;
          const lumG = 0.7152;
          const lumB = 0.0722;
          const matrix = [
            lumR * (1 - s) + s,
            lumG * (1 - s),
            lumB * (1 - s),
            0,
            0,
            lumR * (1 - s),
            lumG * (1 - s) + s,
            lumB * (1 - s),
            0,
            0,
            lumR * (1 - s),
            lumG * (1 - s),
            lumB * (1 - s) + s,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
          ];
          const f = new window.fabric.Image.filters.ColorMatrix({ matrix });
          (f as any).__tui_session_marker = true;
          filters.push(f);
        }
      } catch (e) {
        console.warn("[Filter] Saturation creation failed:", e);
      }
    }

    // Hue rotation filter
    if (
      Math.abs(values.hue) > 0.0001 &&
      window.fabric?.Image?.filters?.HueRotation
    ) {
      try {
        const f = new window.fabric.Image.filters.HueRotation({
          rotation: (values.hue * Math.PI) / 180,
        });
        (f as any).__tui_session_marker = true;
        filters.push(f);
      } catch (e) {
        console.warn("[Filter] Hue rotation creation failed:", e);
      }
    }

    // Tonal adjustments (highlights, shadows, whites, blacks)
    if (
      Math.abs(values.highlights) > 0.00001 ||
      Math.abs(values.shadows) > 0.00001 ||
      Math.abs(values.whites) > 0.00001 ||
      Math.abs(values.blacks) > 0.00001
    ) {
      try {
        if (window.fabric?.Image?.filters?.ColorMatrix) {
          const hFactor = values.highlights * 0.02;
          const sFactor = values.shadows * 0.02;
          const wFactor = values.whites * 0.005;
          const bFactor = values.blacks * 0.005;

          const diag = Math.max(0.1, Math.min(2.0, 1 + wFactor - bFactor));
          const offset = Math.max(-50, Math.min(50, (hFactor - sFactor) * 10));

          const matrix20 = [
            diag,
            0,
            0,
            0,
            offset,
            0,
            diag,
            0,
            0,
            offset,
            0,
            0,
            diag,
            0,
            offset,
            0,
            0,
            0,
            1,
            0,
          ];

          const f = new window.fabric.Image.filters.ColorMatrix({
            matrix: matrix20,
          });
          (f as any).__tui_session_marker = true;
          filters.push(f);
        }
      } catch (e) {
        console.warn("[Filter] Tonal adjustments creation failed:", e);
      }
    }

    return filters;
  }, []);

  const scheduleApplySession = useCallback((values: AdjustValues) => {
    scheduledSessionRef.current = values;

    if (rafRef.current !== null) {
      return;
    }

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const sess = scheduledSessionRef.current;
      scheduledSessionRef.current = null;

      if (sess) {
        reapplySessionToCurrentTargets(sess);
      }
    });
  }, []);

  const reapplySessionToCurrentTargets = useCallback(
    (session?: AdjustValues) => {
      const instance = instanceRef.current;
      if (!instance) return;

      const canvas =
        instance._graphics?.getCanvas?.() || instance.graphics?.getCanvas?.();
      if (!canvas) return;

      const sess = session || sessionRef.current || DEFAULT_ADJUST_VALUES;
      const targets: FabricImage[] = [];

      try {
        const active = canvas.getActiveObject?.();
        if (active && active.type === "image") {
          targets.push(active);
        }

        if (canvas.backgroundImage) {
          targets.push(canvas.backgroundImage);
        }

        if (targets.length === 0 && canvas.backgroundImage) {
          targets.push(canvas.backgroundImage);
        }
      } catch (e) {
        console.warn("[Apply] Target detection failed:", e);
        return;
      }

      targets.forEach((target) => {
        if (!target) return;

        try {
          (target as any).__tui_session_values = sess;

          const currentFilters = target.filters ? [...target.filters] : [];
          const baseFilters = currentFilters.filter(
            (f: any) => f && (f as any).__tui_session_marker !== true
          );

          const adjustmentFilters = buildAdjustmentFilters(sess);
          target.filters = [...baseFilters, ...adjustmentFilters];
          (target as any).__tui_adj_filters = adjustmentFilters;

          if (target.applyFilters) {
            try {
              target.applyFilters();
            } catch (err) {
              console.warn("[Apply] Filter application failed:", err);
            }
          }
        } catch (ex) {
          console.warn("[Apply] Per-target filter failed:", ex);
        }
      });

      try {
        canvas.renderAll?.();
      } catch (e) {
        console.warn("[Apply] Canvas render failed:", e);
      }
    },
    [buildAdjustmentFilters]
  );

  useEffect(() => {
    if (!imageLoadedRef.current) return;
    scheduleApplySession(sessionValues);
    updatePanelUI(sessionValues);
  }, [sessionValues, scheduleApplySession]);

  const resetSession = useCallback(() => {
    setSessionValues(DEFAULT_ADJUST_VALUES);

    const instance = instanceRef.current;
    if (!instance) return;

    try {
      const canvas =
        instance._graphics?.getCanvas?.() || instance.graphics?.getCanvas?.();
      if (!canvas) return;

      const targets: FabricImage[] = [];
      const active = canvas.getActiveObject?.();
      if (active) targets.push(active);
      if (canvas.backgroundImage) targets.push(canvas.backgroundImage);

      targets.forEach((t) => {
        if (!t) return;

        const current = t.filters ? [...t.filters] : [];
        t.filters = current.filter(
          (f: any) => f && (f as any).__tui_session_marker !== true
        );
        (t as any).__tui_adj_filters = [];
        delete (t as any).__tui_session_values;

        if (t.applyFilters) {
          try {
            t.applyFilters();
          } catch (err) {
            console.warn("[Reset] Filter application failed:", err);
          }
        }
      });

      canvas.renderAll?.();
    } catch (e) {
      console.warn("[Reset] Session reset failed:", e);
    }

    updatePanelUI(DEFAULT_ADJUST_VALUES);
  }, []);

  const updatePanelUI = useCallback((session: AdjustValues) => {
    const panel = adjustPanelRef.current;
    if (!panel) return;

    const keys = Object.keys(session) as (keyof AdjustValues)[];
    keys.forEach((key) => {
      const slider = panel.querySelector(
        `#${key}-slider`
      ) as HTMLInputElement | null;
      const valueSpan = panel.querySelector(
        `#${key}-value`
      ) as HTMLSpanElement | null;

      if (slider) {
        slider.value = String(session[key]);
      }
      if (valueSpan) {
        valueSpan.textContent = formatValueForLabel(key, session[key]);
      }
    });
  }, []);

  const startSliderInteraction = useCallback((key: keyof AdjustValues) => {
    setSessionValues((prev) => {
      const next = { ...prev, [key]: prev[key] };
      return next;
    });
  }, []);

  const handleSessionChange = useCallback(
    (key: keyof AdjustValues, value: number) => {
      setSessionValues((prev) => {
        const next = { ...prev, [key]: value };
        scheduleApplySession(next);

        const panel = adjustPanelRef.current;
        if (panel) {
          const valueSpan = panel.querySelector(
            `#${key}-value`
          ) as HTMLSpanElement | null;
          if (valueSpan) {
            valueSpan.textContent = formatValueForLabel(key, value);
          }
        }

        return next;
      });
    },
    [scheduleApplySession]
  );

  const fixImageAspectRatio = useCallback(() => {
    try {
      const instance = instanceRef.current;
      if (!instance) return;

      const canvas =
        instance._graphics?.getCanvas?.() || instance.graphics?.getCanvas?.();
      if (!canvas || !canvas.backgroundImage) return;

      const bgImg = canvas.backgroundImage;

      if (!bgImg.originalWidth || !bgImg.originalHeight) {
        if (bgImg.width && bgImg.height) {
          bgImg.originalWidth = bgImg.width;
          bgImg.originalHeight = bgImg.height;
        } else {
          console.warn("[Fix] Background image dimensions not available");
          return;
        }
      }

      // Get full viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate available space (minus header and bottom menu)
      const headerHeight = 72; // Header height
      const menuHeight = 48; // Bottom menu height

      const availableWidth = viewportWidth;
      const availableHeight = viewportHeight - headerHeight - menuHeight;

      const imgWidth = bgImg.originalWidth;
      const imgHeight = bgImg.originalHeight;

      // Responsive padding based on screen size
      let paddingFactor;
      if (viewportWidth >= 1920) {
        paddingFactor = 0.8; // 80% on large desktop (more breathing room)
      } else if (viewportWidth >= 1024) {
        paddingFactor = 0.85; // 85% on desktop
      } else if (viewportWidth >= 768) {
        paddingFactor = 0.88; // 88% on tablet
      } else {
        paddingFactor = 0.9; // 90% on mobile
      }

      // Calculate scale to fit image in available space
      const scaleX = (availableWidth * paddingFactor) / imgWidth;
      const scaleY = (availableHeight * paddingFactor) / imgHeight;
      const scale = Math.min(scaleX, scaleY);

      // Set canvas dimensions to full available space
      canvas.setDimensions?.({
        width: availableWidth,
        height: availableHeight,
      });

      // Center the image perfectly
      if (bgImg.set) {
        bgImg.set({
          scaleX: scale,
          scaleY: scale,
          left: availableWidth / 2,
          top: availableHeight / 2,
          originX: "center",
          originY: "center",
          selectable: false,
          evented: false,
        });
      }

      canvas.renderAll?.();

      if (!imageLoadedRef.current) {
        imageLoadedRef.current = true;
      }

      console.log(
        `[Fix] Canvas: ${availableWidth}x${availableHeight}, Scale: ${scale.toFixed(
          2
        )}, Padding: ${paddingFactor * 100}%`
      );
    } catch (e) {
      console.warn("[Fix] Aspect ratio fix failed:", e);
    }
  }, []);

  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      if (!instanceRef.current || !editorRef.current) return;
      fixImageAspectRatio();
    }, 150);
  }, [fixImageAspectRatio]);

  const createAdjustPanel = useCallback(() => {
    if (!editorRef.current || !isAdjustPanelOpen) return;

    const existing = editorRef.current.querySelector(
      ".tui-image-editor-adjust-panel"
    ) as HTMLDivElement | null;

    if (existing) {
      adjustPanelRef.current = existing;
      updatePanelUI(sessionRef.current);
      return;
    }

    const editorContainer =
      editorRef.current.querySelector(".tui-image-editor-container") ||
      editorRef.current;

    const adjustPanel = document.createElement("div");
    adjustPanel.className = "tui-image-editor-adjust-panel";
    adjustPanel.setAttribute("role", "region");
    adjustPanel.setAttribute("aria-label", "Image Adjustments");

    const panelWidth = window.innerWidth < 768 ? "100%" : "280px";
    const panelPosition = window.innerWidth < 768 ? "bottom" : "right";

    adjustPanel.style.cssText = `
      position: fixed;
      ${
        panelPosition === "bottom"
          ? "bottom: 48px; left: 0; right: 0; max-height: 50vh; height: auto;"
          : "top: 72px; right: 0; width: " +
            panelWidth +
            "; height: calc(100vh - 120px); max-height: calc(100vh - 120px);"
      }
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      border-${panelPosition === "bottom" ? "top" : "left"}: 1px solid #e0e0e0;
      padding: 16px;
      box-sizing: border-box;
      overflow-y: auto;
      z-index: 100000;
      pointer-events: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: ${
        panelPosition === "bottom"
          ? "0 -4px 20px rgba(0,0,0,0.15)"
          : "-4px 0 20px rgba(0,0,0,0.15)"
      };
    `;

    const panelContent = document.createElement("div");
    panelContent.innerHTML = `
  <div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px; animation: fadeInDown 0.4s ease;">
      <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>
      </div>
      <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Adjustments</h3>
    </div>
    <button id="reset-adjustments" aria-label="Reset adjustments" style="
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 20px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      color: #ffffff;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
      Reset All
    </button>
  </div>
  <div id="sliders-container"></div>
`;

    adjustPanel.appendChild(panelContent);

    const slidersContainer = panelContent.querySelector("#sliders-container");
    if (!slidersContainer) return;

    const adjustSliders = [
      {
        key: "brightness",
        label: "Brightness",
        min: -0.5,
        max: 0.5,
        step: 0.01,
      },
      { key: "contrast", label: "Contrast", min: -0.5, max: 0.5, step: 0.01 },
      {
        key: "saturation",
        label: "Saturation",
        min: -0.5,
        max: 0.5,
        step: 0.01,
      },
      { key: "highlights", label: "Highlights", min: -2, max: 2, step: 0.01 },
      { key: "shadows", label: "Shadows", min: -2, max: 2, step: 0.01 },
      { key: "whites", label: "Whites", min: -50, max: 50, step: 0.5 },
      { key: "blacks", label: "Blacks", min: -50, max: 50, step: 0.5 },
      { key: "hue", label: "Hue", min: -90, max: 90, step: 1 },
    ];

    adjustSliders.forEach(({ key, label, min, max, step }, index) => {
      const sessionVal = sessionRef.current[key as keyof AdjustValues];
      const sliderDiv = document.createElement("div");
      sliderDiv.style.cssText = `margin-bottom: 24px; animation: fadeInUp 0.4s ease ${
        index * 0.05
      }s both;`;

      const iconSrc = SLIDER_ICONS[key] || ICONS.brightness;

      sliderDiv.innerHTML = `
    <label style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #e0e0e0;
    ">
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="width: 28px; height: 28px; background: rgba(255,255,255,0.08); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
          <img src="${iconSrc}" alt="" style="width: 16px; height: 16px;">
        </div>
        <span>${label}</span>
      </div>
      <span id="${key}-value" style="
        font-weight: 700; 
        color: #ffffff; 
        font-size: 13px;
        background: linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.2) 100%);
        padding: 6px 12px;
        border-radius: 8px;
        min-width: 50px;
        text-align: center;
        font-variant-numeric: tabular-nums;
        border: 1px solid rgba(102,126,234,0.3);
        box-shadow: 0 2px 8px rgba(102,126,234,0.2);
      ">${formatValueForLabel(key as keyof AdjustValues, sessionVal)}</span>
    </label>
    <div style="position: relative;">
      <input 
        type="range" 
        id="${key}-slider"
        min="${min}" 
        max="${max}" 
        step="${step}" 
        value="${sessionVal}"
        aria-label="${label}"
        style="
          width: 100%;
          height: 6px;
          background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          transition: all 0.2s ease;
        "
      />
    </div>
  `;

      slidersContainer.appendChild(sliderDiv);
    });

    if (!document.getElementById("tui-adjust-style")) {
      const style = document.createElement("style");
      style.id = "tui-adjust-style";
      style.textContent = `
        .tui-image-editor-adjust-panel input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #2196f3;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(33,150,243,0.3);
          transition: all 0.15s ease;
        }
        .tui-image-editor-adjust-panel input[type="range"]::-webkit-slider-thumb:hover {
          background: #1976d2;
          transform: scale(1.1);
        }
        .tui-image-editor-adjust-panel input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #2196f3;
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 2px 6px rgba(33,150,243,0.3);
        }
        .tui-image-editor-adjust-panel button:hover {
          background: #f5f5f5;
          border-color: #bbb;
        }
        .tui-image-editor-adjust-panel {
          scrollbar-width: thin;
          scrollbar-color: #dee2e6 transparent;
        }
        .tui-image-editor-adjust-panel::-webkit-scrollbar {
          width: 6px;
        }
        .tui-image-editor-adjust-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .tui-image-editor-adjust-panel::-webkit-scrollbar-thumb {
          background: #dee2e6;
          border-radius: 3px;
        }
        
        @media (max-width: 768px) {
          .tui-image-editor-adjust-panel {
            max-height: 50vh;
          }
          .tui-image-editor-adjust-panel input[type="range"] {
            height: 6px;
          }
          .tui-image-editor-adjust-panel input[type="range"]::-webkit-slider-thumb {
            width: 20px;
            height: 20px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const adjustSlidersElements = slidersContainer.querySelectorAll(
      "input[type='range']"
    );

    adjustSlidersElements.forEach((el) => {
      const id = (el as HTMLInputElement).id;
      const key = id.replace("-slider", "") as keyof AdjustValues;
      const slider = el as HTMLInputElement;

      const onPointerDown = () => startSliderInteraction(key);
      const onInput = (e: Event) => {
        const raw = (e.target as HTMLInputElement).value;
        const parsed = parseFloat(raw);
        handleSessionChange(key, parsed);
      };

      slider.addEventListener("pointerdown", onPointerDown);
      panelListenersRef.current.push({
        el: slider,
        type: "pointerdown",
        handler: onPointerDown,
      });

      slider.addEventListener("input", onInput);
      panelListenersRef.current.push({
        el: slider,
        type: "input",
        handler: onInput,
      });

      const onFocus = () => {
        slider.style.boxShadow = "0 0 0 3px rgba(33,150,243,0.2)";
      };
      const onBlur = () => {
        slider.style.boxShadow = "none";
      };

      slider.addEventListener("focus", onFocus);
      panelListenersRef.current.push({
        el: slider,
        type: "focus",
        handler: onFocus,
      });

      slider.addEventListener("blur", onBlur);
      panelListenersRef.current.push({
        el: slider,
        type: "blur",
        handler: onBlur,
      });
    });

    const resetBtn = adjustPanel.querySelector("#reset-adjustments");
    if (resetBtn) {
      const onReset = () => resetSession();
      resetBtn.addEventListener("click", onReset);
      panelListenersRef.current.push({
        el: resetBtn,
        type: "click",
        handler: onReset,
      });
    }

    editorContainer.appendChild(adjustPanel);
    adjustPanelRef.current = adjustPanel;
    updatePanelUI(sessionRef.current);
  }, [
    isAdjustPanelOpen,
    startSliderInteraction,
    handleSessionChange,
    resetSession,
    updatePanelUI,
  ]);

  useEffect(() => {
    if (!editorRef.current) return;

    if (isAdjustPanelOpen) {
      createAdjustPanel();
    } else {
      const existingPanel = editorRef.current.querySelector(
        ".tui-image-editor-adjust-panel"
      );

      if (existingPanel) {
        panelListenersRef.current.forEach(({ el, type, handler }) => {
          try {
            el.removeEventListener(type, handler as EventListener);
          } catch (e) {
            console.warn("[Cleanup] Panel listener removal failed:", e);
          }
        });
        panelListenersRef.current = [];

        try {
          existingPanel.remove();
        } catch (e) {
          console.warn("[Cleanup] Panel removal failed:", e);
        }

        adjustPanelRef.current = null;
      }
    }
  }, [isAdjustPanelOpen, createAdjustPanel]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [handleResize]);

  useEffect(() => {
    let resizeObs: ResizeObserver | null = null;
    let mounted = true;

    async function attemptImportPaths() {
      const tryPaths = [
        "tui-image-editor",
        "tui-image-editor/dist/tui-image-editor.esm.js",
        "tui-image-editor/dist/tui-image-editor.js",
      ];

      for (const p of tryPaths) {
        try {
          const mod = await import(/* @vite-ignore */ p);
          if (mod) return mod;
        } catch (e) {
          console.warn(`[Import] Failed for ${p}:`, e);
        }
      }

      throw new Error("Dynamic import failed for all known paths");
    }

    async function initEditor() {
      setLoading(true);
      setError(null);

      try {
        await loadCssWithBackups(TOAST_CSS_BACKUPS);
        await loadCssWithBackups(TOAST_COLOR_PICKER_CSS);

        let Constructor: any = undefined;

        try {
          const mod = await attemptImportPaths();
          Constructor =
            (mod as any).default ?? (mod as any).ImageEditor ?? (mod as any);
          console.info("[Init] Using local tui-image-editor import");
        } catch (importErr) {
          console.warn(
            "[Init] Local import failed, attempting CDN:",
            importErr
          );
        }

        if (typeof Constructor !== "function") {
          if (!window.fabric) {
            await loadScriptWithBackups([FABRIC_CDN], 20000);
          }

          if (!(window as any).tui) {
            await loadScriptWithBackups([TUI_SNIPPET_CDN], 15000);
          }

          if (!(window as any).tui?.colorPicker) {
            await loadScriptWithBackups([TUI_COLOR_PICKER_SCRIPT], 15000);
          }

          await loadScriptWithBackups([TUI_IMAGE_EDITOR_CDN], 20000);

          Constructor =
            (window as any).tui?.ImageEditor ?? (window as any).ImageEditor;
        }

        if (typeof Constructor !== "function") {
          throw new Error("ImageEditor constructor not available");
        }

        if (editorRef.current) {
          instanceRef.current = new Constructor(editorRef.current, {
            includeUI: {
              loadImage: {
                path:
                  imageUrl ||
                  sampleImage?.path ||
                  "https://picsum.photos/1200/800?random=1",
                name: sampleImage?.name ?? "Sample Image",
              },
              menu: [
                "crop",
                "flip",
                "rotate",
                "draw",
                "shape",
                "icon",
                "text",
                "mask",
                "filter",
              ],
              initMenu: "",
              menuBarPosition: "bottom",
              uiSize: {
                width: "100%",
                height: "100%",
              },
              theme: {
                "menu.backgroundColor": "#ffffff",
                "menu.borderColor": "#e5e5e5",
                "menu.normalIcon.color": "#8a8a8a",
                "menu.activeIcon.color": "#555555",
                "menu.disabledIcon.color": "#ccc",
                "menu.hoverIcon.color": "#e9e9e9",
                "submenu.backgroundColor": "#1e1e1e",
                "submenu.partition.color": "#858585",
                "submenu.normalIcon.color": "#8a8a8a",
                "submenu.normalLabel.color": "#ccc",
                "submenu.activeIcon.color": "#fff",
                "submenu.activeLabel.color": "#fff",
              },
            },
            cssMaxWidth: 999999,
            cssMaxHeight: 999999,
            usageStatistics: false,
          });
        }

        renderTimeoutRefs.current.forEach(clearTimeout);
        renderTimeoutRefs.current = [];

        const delays = [100, 300, 500, 1000];
        delays.forEach((delay) => {
          const timeoutId = setTimeout(() => fixImageAspectRatio(), delay);
          renderTimeoutRefs.current.push(timeoutId);
        });

        if (!document.getElementById("tui-menu-alignment-fix")) {
          const style = document.createElement("style");
          style.id = "tui-menu-alignment-fix";
          style.textContent = `
            .tui-image-editor .tui-image-editor-menu {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              gap: 6px;
              height: 48px;
              padding: 0 8px;
              box-sizing: border-box;
            }
            .tui-image-editor-menu .tui-image-editor-menu-item {
              display: inline-flex !important;
              align-items: center !important;
              height: 100% !important;
              margin: 0 !important;
              padding: 0 6px !important;
              box-sizing: border-box !important;
            }
            .tui-image-editor-menu .tui-image-editor-button {
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center;
              height: 100%;
              padding: 8px 10px;
              gap: 8px;
              background: transparent;
              border: none;
              box-sizing: border-box;
            }
            .tui-image-editor-menu .tui-image-editor-menu-icon {
              display: inline-flex !important;
              align-items: center !important;
              justify-content: center !important;
              line-height: 0;
              width: 20px;
              height: 20px;
            }
            .tui-image-editor-menu .tui-image-editor-menu-icon img,
            .tui-image-editor-menu .tui-image-editor-menu-icon svg {
              width: 18px;
              height: 18px;
              display: block;
              vertical-align: middle;
            }
            .tui-image-editor-menu .tui-image-editor-menu-title {
              line-height: 1;
              font-size: 12px;
              display: inline-block;
              vertical-align: middle;
            }
            
            @media (max-width: 640px) {
              .tui-image-editor .tui-image-editor-menu {
                gap: 2px;
                padding: 0 4px;
              }
              .tui-image-editor-menu .tui-image-editor-menu-item {
                padding: 0 3px !important;
              }
              .tui-image-editor-menu .tui-image-editor-button {
                padding: 6px 8px;
                gap: 4px;
              }
              .tui-image-editor-menu .tui-image-editor-menu-icon {
                width: 16px;
                height: 16px;
              }
              .tui-image-editor-menu .tui-image-editor-menu-icon img,
              .tui-image-editor-menu .tui-image-editor-menu-icon svg {
                width: 16px;
                height: 16px;
              }
              .tui-image-editor-menu .tui-image-editor-menu-title {
                font-size: 10px;
              }
            }
          `;
          document.head.appendChild(style);
        }

        if (!document.getElementById("tui-hide-top-controls")) {
          const style = document.createElement("style");
          style.id = "tui-hide-top-controls";
          style.textContent = `
            .tui-image-editor-header {
              display: none !important;
            }
            .tui-image-editor-wrap {
              top: 0 !important;
            }
          `;
          document.head.appendChild(style);
        }
        if (!instanceRef.current) return;

        try {
          const canvas =
            instanceRef.current._graphics?.getCanvas?.() ||
            instanceRef.current.graphics?.getCanvas?.();

          if (canvas) {
            const canvases = [
              canvas.lowerCanvasEl,
              canvas.upperCanvasEl,
              (canvas as any).cacheCanvasEl,
            ];

            canvases.forEach((el) => {
              if (el) {
                try {
                  el.getContext("2d", { willReadFrequently: true });
                } catch (e) {
                  console.warn("[Canvas] willReadFrequently failed:", e);
                }
              }
            });

            canvas.selection = true;
            canvas.preserveObjectStacking = true;
            canvas.imageSmoothingEnabled = true;
            canvas.enableRetinaScaling = true;

            if (canvas.backgroundImage) {
              canvas.backgroundImage.selectable = false;
              canvas.backgroundImage.evented = false;
            }
          }
        } catch (e) {
          console.warn("[Canvas] Enhancement failed:", e);
        }

        setTimeout(() => {
          if (!editorRef.current || !instanceRef.current) return;
          setupMenuHandling();
          setupCanvasListeners();
        }, 600);

        resizeObs = new ResizeObserver(() => {
          handleResize();
        });

        if (editorRef.current) {
          resizeObs.observe(editorRef.current);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("[Init] Initialization failed:", err);
        if (mounted) {
          setError(err?.message ?? String(err));
          setLoading(false);
        }
      }
    }

    const setupMenuHandling = () => {
      const menuBar = editorRef.current?.querySelector(
        ".tui-image-editor-menu"
      ) as HTMLElement | null;
      if (!menuBar) return;

      Object.entries(MENU_ICONS).forEach(([id, url]) => {
        const img = editorRef.current?.querySelector(
          `.tui-image-editor-menu [data-menu="${id}"] img`
        ) as HTMLImageElement | null;

        if (img) {
          img.src = url;
          img.onerror = () => {
            if (id === "adjust") {
              img.src = ICONS.adjust;
            } else {
              img.style.display = "none";
            }
          };
        }
      });

      if (!menuBar.querySelector('[data-menu="adjust"]')) {
        const li = document.createElement("li");
        li.setAttribute("data-menu", "adjust");
        li.className = "tui-image-editor-menu-item";
        li.style.cssText = `
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            height: 48px;
            padding: 0 10px;
            margin: 0;
          `;

        li.innerHTML = `
            <button class="tui-image-editor-button tui-adjust-btn" title="Adjust" aria-label="Adjust" style="display:inline-flex;align-items:center;justify-content:center;height:100%;border:none;background:transparent;padding:8px 12px;transition:all 0.18s ease;color:#8a8a8a;">
              <div class="tui-image-editor-menu-icon" style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;line-height:0;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style="display:block;">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
                  <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
          `;

        menuBar.appendChild(li);
        adjustMenuLiRef.current = li;

        const liClickHandler = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();

          try {
            const instance = instanceRef.current;
            const canvas =
              instance?._graphics?.getCanvas?.() ||
              instance?.graphics?.getCanvas?.();
            const hasImage =
              canvas && (canvas.backgroundImage || canvas.getActiveObject?.());

            if (!hasImage) {
              setError("Please load an image first");
              setTimeout(() => setError(null), 3000);
              return;
            }
          } catch (ex) {
            console.warn("[Menu] Image check failed:", ex);
          }

          setIsAdjustPanelOpen((prev) => {
            const next = !prev;
            if (adjustMenuLiRef.current) {
              if (next) {
                adjustMenuLiRef.current.classList.add(
                  "tui-image-editor-menu-item-active"
                );
                adjustMenuLiRef.current.style.background = "#f0f8ff";
              } else {
                adjustMenuLiRef.current.classList.remove(
                  "tui-image-editor-menu-item-active"
                );
                adjustMenuLiRef.current.style.background = "transparent";
              }
            }
            return next;
          });
        };

        li.addEventListener("click", liClickHandler);
        (menuBar as any).__tuiMenuHandlers =
          (menuBar as any).__tuiMenuHandlers || [];
        (menuBar as any).__tuiMenuHandlers.push(liClickHandler);
      }

      const delegatedHandler = (ev: Event) => {
        const target = ev.target as HTMLElement | null;
        if (!target) return;

        const menuItem = target.closest?.(
          ".tui-image-editor-menu-item"
        ) as HTMLElement | null;
        if (!menuItem) return;

        const menuName = menuItem.getAttribute("data-menu");
        if (!menuName) return;

        setCurrentActiveMenu(menuName);

        if (menuName !== "adjust") {
          const allMenuItems = menuBar.querySelectorAll(
            ".tui-image-editor-menu-item"
          );
          allMenuItems.forEach((item) => {
            if (item !== adjustMenuLiRef.current && item !== menuItem) {
              item.classList.remove("tui-image-editor-menu-item-active");
              (item as HTMLElement).style.background = "transparent";
            }
          });

          menuItem.classList.add("tui-image-editor-menu-item-active");
          (menuItem as HTMLElement).style.background = "#f0f8ff";

          const timeoutId = setTimeout(() => {
            reapplySessionToCurrentTargets();
          }, 100);
          renderTimeoutRefs.current.push(timeoutId);
        }
      };

      menuBar.addEventListener("click", delegatedHandler, true);
      (menuBar as any).__tuiMenuHandlers =
        (menuBar as any).__tuiMenuHandlers || [];
      (menuBar as any).__tuiMenuHandlers.push(delegatedHandler);
      menuBarListenerRef.current = delegatedHandler;
    };

    const setupCanvasListeners = () => {
      try {
        const canvas =
          instanceRef.current?._graphics?.getCanvas?.() ||
          instanceRef.current?.graphics?.getCanvas?.();

        if (!canvas || canvasListenersRef.current) return;

        const onObjectAdded = (e: any) => {
          try {
            const obj = e?.target;
            if (obj) {
              (obj as any).__tui_session_values = sessionRef.current;
              const timeoutId = setTimeout(
                () => reapplySessionToCurrentTargets(),
                50
              );
              renderTimeoutRefs.current.push(timeoutId);
            }
          } catch (ex) {
            console.warn("[Canvas] Object added handler failed:", ex);
          }
        };

        const onObjectModified = (e: any) => {
          try {
            const obj = e?.target;
            if (obj) {
              (obj as any).__tui_session_values = sessionRef.current;
            }
            const timeoutId = setTimeout(
              () => reapplySessionToCurrentTargets(),
              30
            );
            renderTimeoutRefs.current.push(timeoutId);
          } catch (ex) {
            console.warn("[Canvas] Object modified handler failed:", ex);
          }
        };

        const onSelectionCreated = (e: any) => {
          try {
            const obj = e?.target;
            if (obj) {
              (obj as any).__tui_session_values = sessionRef.current;
            }
            const timeoutId = setTimeout(
              () => reapplySessionToCurrentTargets(),
              20
            );
            renderTimeoutRefs.current.push(timeoutId);
          } catch (ex) {
            console.warn("[Canvas] Selection created handler failed:", ex);
          }
        };

        const onSelectionCleared = () => {
          try {
            const timeoutId = setTimeout(
              () => reapplySessionToCurrentTargets(),
              20
            );
            renderTimeoutRefs.current.push(timeoutId);
          } catch (ex) {
            console.warn("[Canvas] Selection cleared handler failed:", ex);
          }
        };

        canvas.on?.("object:added", onObjectAdded);
        canvas.on?.("object:modified", onObjectModified);
        canvas.on?.("selection:created", onSelectionCreated);
        canvas.on?.("selection:cleared", onSelectionCleared);

        canvasListenersRef.current = {
          added: onObjectAdded,
          modified: onObjectModified,
          selectionCreated: onSelectionCreated,
          selectionCleared: onSelectionCleared,
        };
      } catch (e) {
        console.warn("[Canvas] Listeners setup failed:", e);
      }
    };

    initEditor();

    return () => {
      mounted = false;

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }

      renderTimeoutRefs.current.forEach(clearTimeout);
      renderTimeoutRefs.current = [];

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      scheduledSessionRef.current = null;

      if (resizeObs) {
        try {
          resizeObs.disconnect();
        } catch (e) {
          console.warn("[Cleanup] ResizeObserver disconnect failed:", e);
        }
        resizeObs = null;
      }

      try {
        const menuBar = editorRef.current?.querySelector(
          ".tui-image-editor-menu"
        );
        if (menuBar) {
          const handlers = (menuBar as any).__tuiMenuHandlers || [];
          handlers.forEach((handler: any) => {
            try {
              menuBar.removeEventListener("click", handler, true);
            } catch (e) {
              console.warn("[Cleanup] Menu handler removal failed:", e);
            }
          });
          delete (menuBar as any).__tuiMenuHandlers;
        }
      } catch (e) {
        console.warn("[Cleanup] Menu cleanup failed:", e);
      }

      try {
        const canvas =
          instanceRef.current?._graphics?.getCanvas?.() ||
          instanceRef.current?.graphics?.getCanvas?.();

        if (canvas && canvasListenersRef.current) {
          const listeners = canvasListenersRef.current;

          if (listeners.added) {
            canvas.off?.("object:added", listeners.added);
          }
          if (listeners.modified) {
            canvas.off?.("object:modified", listeners.modified);
          }
          if (listeners.selectionCreated) {
            canvas.off?.("selection:created", listeners.selectionCreated);
          }
          if (listeners.selectionCleared) {
            canvas.off?.("selection:cleared", listeners.selectionCleared);
          }

          canvasListenersRef.current = null;
        }
      } catch (e) {
        console.warn("[Cleanup] Canvas cleanup failed:", e);
      }

      try {
        instanceRef.current?.destroy?.();
      } catch (e) {
        console.warn("[Cleanup] Editor destroy failed:", e);
      }
      instanceRef.current = null;

      panelListenersRef.current.forEach(({ el, type, handler }) => {
        try {
          el.removeEventListener(type, handler as EventListener);
        } catch (e) {
          console.warn("[Cleanup] Panel listener removal failed:", e);
        }
      });
      panelListenersRef.current = [];

      try {
        const existingPanel = editorRef.current?.querySelector(
          ".tui-image-editor-adjust-panel"
        );
        if (existingPanel) {
          existingPanel.remove();
        }
        adjustPanelRef.current = null;
      } catch (e) {
        console.warn("[Cleanup] Panel cleanup failed:", e);
      }
    };
  }, [fixImageAspectRatio, reapplySessionToCurrentTargets, handleResize]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        background: "#ffffff",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          width: "100%",
          background: "white",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          flexShrink: 0,
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => window.history.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#666",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              padding: "6px 8px",
              borderRadius: "4px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.color = "#333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#666";
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ width: "20px", height: "20px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            <span>Back</span>
          </button>
          <img
            src="/slfg.svg"
            alt="Selfie Gram Logo"
            style={{ width: "52px", marginLeft: "8px" }}
          />
          <h1
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              letterSpacing: "0.08em",
              margin: 0,
              color: "#333",
              whiteSpace: "nowrap",
            }}
            className="editor-title"
          >
            SELFIEGRAM PHOTO EDITOR
          </h1>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0",
          width: "100%",
          minHeight: 0,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                border: "4px solid #e3f2fd",
                borderTop: "4px solid #000000ff",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: "20px",
              }}
            />
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#000000ff",
                marginBottom: "8px",
              }}
            >
              Loading Image Editor...
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#757575",
                textAlign: "center",
              }}
            >
              Initializing advanced photo editing tools
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
              padding: "16px 20px",
              borderRadius: "12px",
              zIndex: 9999,
              border: "1px solid #e57373",
              boxShadow: "0 4px 12px rgba(244,67,54,0.3)",
              maxWidth: "350px",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                color: "#c62828",
                marginBottom: "4px",
                fontSize: "14px",
              }}
            >
              ⚠️ Error
            </div>
            <div style={{ color: "#d32f2f", fontSize: "13px" }}>{error}</div>
          </div>
        )}

        <div
          ref={editorRef}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        />
      </div>

      <style>{`
  * {
    box-sizing: border-box;
  }
  
  body {
    overflow: hidden !important;
  }

  /* Aggressive overrides */
  .tui-image-editor,
  .tui-image-editor *,
  .tui-image-editor-canvas-container,
  .tui-image-editor-main,
  .tui-image-editor-main-container,
  .tui-image-editor-wrap,
  .lower-canvas-container {
    max-width: none !important;
    max-height: none !important;
  }

  canvas.lower-canvas,
  canvas.upper-canvas {
    max-width: none !important;
    max-height: none !important;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
        
  .tui-image-editor-menu-item-active {
    background: #f0f8ff !important;
  }
  
  .tui-image-editor-container {
    height: 100% !important;
    width: 100% !important;
    overflow: hidden !important;
  }
  
  .tui-image-editor-wrap {
    height: 100% !important;
    width: 100% !important;
    top: 0 !important;
    bottom: 0 !important;
    overflow: hidden !important;
  }
  
  .tui-image-editor-canvas-container {
    position: fixed !important;
    top: 72px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 48px !important;
    width: 100vw !important;
    height: calc(100vh - 120px) !important;
    z-index: 1 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .tui-image-editor-main {
    position: fixed !important;
    top: 72px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 48px !important;
    width: 100vw !important;
    height: calc(100vh - 120px) !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .tui-image-editor-main-container {
    position: fixed !important;
    top: 72px !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 48px !important;
    width: 100vw !important;
    height: calc(100vh - 120px) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .lower-canvas-container {
    position: relative !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    height: 100% !important;
  }

  canvas.lower-canvas,
  canvas.upper-canvas {
    position: absolute !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
  }

  .canvas-container {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    height: 100% !important;
  }
  
  .tui-image-editor {
    height: 100% !important;
    width: 100% !important;
    overflow: hidden !important;
  }
  
  .tui-image-editor .lower-canvas,
  .tui-image-editor .upper-canvas {
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
  }
  
  .tui-image-editor-menu-wrap {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    height: 48px !important;
    z-index: 99997 !important;
    background: #ffffff !important;
    border-top: 1px solid #e5e5e5 !important;
    pointer-events: auto !important;
  }

  .tui-image-editor-submenu {
    position: fixed !important;
    bottom: 48px !important;
    padding: 12px !important;
    left: 0 !important;
    right: 0 !important;
    height: auto !important;
    max-height: 250px !important;
    z-index: 99998 !important;
    pointer-events: auto !important;
    background: #1e1e1e !important;
    overflow-y: auto !important;
  }

  /* MODERN ADJUSTMENT PANEL */
  .tui-image-editor-adjust-panel {
    position: fixed !important;
    top: 72px !important;
    right: 0 !important;
    width: 320px !important;
    height: calc(100vh - 120px) !important;
    background: linear-gradient(180deg, #1a1a1a 0%, #212121 100%) !important;
    border-left: 1px solid rgba(255,255,255,0.1) !important;
    padding: 24px !important;
    box-sizing: border-box !important;
    overflow-y: auto !important;
    z-index: 100000 !important;
    pointer-events: auto !important;
    box-shadow: -8px 0 32px rgba(0,0,0,0.5) !important;
    animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  }

  /* Modern Scrollbar */
  .tui-image-editor-adjust-panel::-webkit-scrollbar {
    width: 6px;
  }

  .tui-image-editor-adjust-panel::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 3px;
  }

  .tui-image-editor-adjust-panel::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px;
    transition: all 0.2s ease;
  }

  .tui-image-editor-adjust-panel::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
  }

  /* Modern Slider Styles */
  .tui-image-editor-adjust-panel input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    border-radius: 50%;
    box-shadow: 0 4px 12px rgba(102,126,234,0.5), 0 0 0 4px rgba(102,126,234,0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .tui-image-editor-adjust-panel input[type="range"]::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 16px rgba(102,126,234,0.6), 0 0 0 6px rgba(102,126,234,0.25);
  }

  .tui-image-editor-adjust-panel input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(1.1);
  }

  .tui-image-editor-adjust-panel input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    border-radius: 50%;
    border: none;
    box-shadow: 0 4px 12px rgba(102,126,234,0.5);
    transition: all 0.3s ease;
  }

  .tui-image-editor-adjust-panel input[type="range"]:hover {
    background: linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.25) 100%) !important;
  }

  /* Modern Button Hover */
  .tui-image-editor-adjust-panel button:hover {
    background: rgba(255,255,255,0.15) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    border-color: rgba(255,255,255,0.2) !important;
  }

  .tui-image-editor-adjust-panel button:active {
    transform: translateY(0);
  }
  
  ::-webkit-scrollbar {
    width: 0px !important;
    height: 0px !important;
  }
  
  @media (max-width: 768px) {
    .editor-title {
      display: none !important;
    }

    .tui-image-editor-adjust-panel {
      top: auto !important;
      bottom: 48px !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      height: 50vh !important;
      max-height: 400px !important;
      border-left: none !important;
      border-top: 1px solid rgba(255,255,255,0.1) !important;
      animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }
    
    .tui-image-editor-main-container {
      padding: 4px !important;
    }

    .tui-image-editor-submenu {
      max-height: 200px !important;
    }
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    .editor-title {
      font-size: 9px !important;
    }
  }
  
  @media (max-width: 640px) {
    .tui-image-editor-menu {
      font-size: 11px !important;
      height: 44px !important;
    }
    
    .tui-image-editor-menu-icon {
      width: 16px !important;
      height: 16px !important;
    }
    
    .tui-image-editor-menu-title {
      display: none !important;
    }

    .tui-image-editor-submenu {
      max-height: 180px !important;
    }
  }
  
  @media (max-width: 480px) {
    .tui-image-editor-menu {
      height: 40px !important;
    }
    
    .tui-image-editor-menu .tui-image-editor-button {
      padding: 4px 6px !important;
    }

    .tui-image-editor-submenu {
      max-height: 150px !important;
    }
  }

  @media (min-width: 1024px) {
    .tui-image-editor-canvas-container,
    .tui-image-editor-main,
    .tui-image-editor-main-container {
      padding: 0 !important;
    }
  }

  @media (min-width: 1920px) {
    .tui-image-editor-canvas-container,
    .tui-image-editor-main,
    .tui-image-editor-main-container {
      max-width: 100vw !important;
      max-height: calc(100vh - 120px) !important;
    }
  }

  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 2dppx) {
    .tui-image-editor .lower-canvas,
    .tui-image-editor .upper-canvas {
      image-rendering: -webkit-optimize-contrast !important;
      image-rendering: optimize-contrast !important;
    }
  }

  .tui-image-editor-submenu-style,
  .tui-image-editor-partition > div {
    max-height: 200px !important;
    overflow-y: auto !important;
  }

  .tui-colorpicker-clearfix,
  .tui-image-editor-help-menu {
    bottom: 48px !important;
    max-height: calc(100vh - 100px) !important;
  }

  /* MODERN SUBMENU STYLING */
.tui-image-editor-submenu {
  position: fixed !important;
  bottom: 68px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: auto !important;
  min-width: 400px !important;
  max-width: 90vw !important;
  background: linear-gradient(180deg, #1a1a1a 0%, #212121 100%) !important;
  backdrop-filter: blur(20px) !important;
  border-radius: 16px !important;
  padding: 20px !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1) !important;
  border: none !important;
  z-index: 99998 !important;
  pointer-events: auto !important;
  animation: slideUpSubmenu 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  max-height: 400px !important;
  overflow-y: auto !important;
}

@keyframes slideUpSubmenu {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Modern Submenu Scrollbar */
.tui-image-editor-submenu::-webkit-scrollbar {
  width: 6px;
}

.tui-image-editor-submenu::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
}

.tui-image-editor-submenu::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
}

/* Modern Buttons in Submenu */
.tui-image-editor-submenu .tui-image-editor-button,
.tui-image-editor-submenu label.tui-image-editor-button {
  background: rgba(255,255,255,0.08) !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  border-radius: 10px !important;
  padding: 10px 16px !important;
  color: #e0e0e0 !important;
  font-weight: 500 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  margin: 4px !important;
}

.tui-image-editor-submenu .tui-image-editor-button:hover,
.tui-image-editor-submenu label.tui-image-editor-button:hover {
  background: rgba(255,255,255,0.15) !important;
  border-color: rgba(102,126,234,0.5) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(102,126,234,0.3) !important;
}

.tui-image-editor-submenu .tui-image-editor-button:active {
  transform: translateY(0) !important;
}

/* Active state */
.tui-image-editor-submenu .tui-image-editor-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-color: transparent !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(102,126,234,0.4) !important;
}

/* Modern Range Sliders in Submenu */
.tui-image-editor-submenu input[type="range"] {
  width: 100% !important;
  height: 6px !important;
  background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%) !important;
  border-radius: 3px !important;
  outline: none !important;
  -webkit-appearance: none !important;
  appearance: none !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}

.tui-image-editor-submenu input[type="range"]:hover {
  background: linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.25) 100%) !important;
}

.tui-image-editor-submenu input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none !important;
  width: 18px !important;
  height: 18px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-radius: 50% !important;
  cursor: pointer !important;
  box-shadow: 0 2px 8px rgba(102,126,234,0.4), 0 0 0 3px rgba(102,126,234,0.2) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.tui-image-editor-submenu input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2) !important;
  box-shadow: 0 4px 12px rgba(102,126,234,0.5), 0 0 0 4px rgba(102,126,234,0.3) !important;
}

.tui-image-editor-submenu input[type="range"]::-moz-range-thumb {
  width: 18px !important;
  height: 18px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  border-radius: 50% !important;
  cursor: pointer !important;
  box-shadow: 0 2px 8px rgba(102,126,234,0.4) !important;
}

/* Modern Labels */
.tui-image-editor-submenu label {
  color: #e0e0e0 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}

/* Modern Number Inputs */
.tui-image-editor-submenu input[type="number"],
.tui-image-editor-submenu input[type="text"],
.tui-image-editor-submenu .tui-image-editor-range-value {
  background: rgba(255,255,255,0.08) !important;
  border: 1px solid rgba(255,255,255,0.12) !important;
  color: #ffffff !important;
  border-radius: 8px !important;
  padding: 8px 12px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
}

.tui-image-editor-submenu input[type="number"]:focus,
.tui-image-editor-submenu input[type="text"]:focus {
  border-color: rgba(102,126,234,0.5) !important;
  box-shadow: 0 0 0 3px rgba(102,126,234,0.2) !important;
  outline: none !important;
}

/* Modern Checkboxes */
.tui-image-editor-submenu input[type="checkbox"] {
  width: 18px !important;
  height: 18px !important;
  cursor: pointer !important;
  accent-color: #667eea !important;
}

/* Modern Apply Button */
.tui-image-editor-submenu .tui-image-editor-button.apply {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  padding: 12px 32px !important;
  margin-top: 16px !important;
  width: 100% !important;
  box-shadow: 0 4px 16px rgba(102,126,234,0.4) !important;
}

.tui-image-editor-submenu .tui-image-editor-button.apply:hover {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(102,126,234,0.5) !important;
}

/* Modern Partition Lines */
.tui-image-editor-submenu .tui-image-editor-partition {
  border-color: rgba(255,255,255,0.1) !important;
  margin: 16px 0 !important;
}

/* Icon Buttons Grid */
.tui-image-editor-submenu .tui-image-editor-newline {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 8px !important;
  justify-content: flex-start !important;
}

/* Responsive */
@media (max-width: 768px) {
  .tui-image-editor-submenu {
    bottom: 48px !important;
    min-width: 300px !important;
    max-width: calc(100vw - 20px) !important;
    max-height: 50vh !important;
    padding: 16px !important;
  }
}
/* FIX MENU BAR ICON ALIGNMENT */
.tui-image-editor-menu {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 48px !important;
  padding: 0 !important;
}

.tui-image-editor-menu-item {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 48px !important;
  padding: 0 8px !important;
  margin: 0 !important;
}

.tui-image-editor-button {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 100% !important;
  padding: 8px 12px !important;
  border: none !important;
  background: transparent !important;
}

.tui-image-editor-menu-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 24px !important;
  height: 24px !important;
  margin: 0 !important;
}

.tui-image-editor-menu-icon img,
.tui-image-editor-menu-icon svg {
  width: 24px !important;
  height: 24px !important;
  display: block !important;
  margin: 0 auto !important;
}

`}</style>
    </div>
  );
};

export default ToastEditor;

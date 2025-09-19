// ToastEditor.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    tui?: any;
    fabric?: any;
  }
}

/**
 * CONFIG — adjust as needed:
 * - TOAST_CSS_BACKUPS / TOAST_SCRIPT_BACKUPS: fallback CDN URLs for Toast UI (tries in order).
 */
const TOAST_CSS_BACKUPS = [
  "https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.css",
];
const TOAST_COLOR_PICKER_CSS = [
  "https://uicdn.toast.com/tui-color-picker/latest/tui-color-picker.css",
];
const TOAST_SCRIPT_BACKUPS = [
  "https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.min.js",
];

// Minimalist line icons as SVG data URLs
const ICONS = {
  adjust: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>`
  )}`,
  brightness: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
  )}`,
  contrast: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2A10 10 0 0 0 12 22Z"/></svg>`
  )}`,
  saturation: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 3C9 1 13 1 15 3L21 9C23 11 23 15 21 17L15 23C13 25 9 25 7 23L1 17C-1 15 -1 11 1 9Z"/></svg>`
  )}`,
  highlights: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>`
  )}`,
  shadows: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>`
  )}`,
  whites: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/></svg>`
  )}`,
  blacks: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>`
  )}`,
  hue: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11v1a10 10 0 1 1-9-10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
  )}`,
  reset: `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>`
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

async function loadScriptWithBackups(urls: string[], timeout = 15000) {
  let lastErr: any = null;
  for (const url of urls) {
    try {
      if (document.querySelector(`script[src="${url}"]`)) return;
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
      lastErr = err;
    }
  }
  throw lastErr ?? new Error("No script URLs available");
}

async function loadCssWithBackups(urls: string[]) {
  for (const href of urls) {
    try {
      if (document.querySelector(`link[href="${href}"]`)) return;
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

const ToastEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);
  const adjustPanelRef = useRef<HTMLDivElement | null>(null);
  const canvasListenersRef = useRef<{
    added?: (e: any) => void;
    modified?: (e: any) => void;
    afterRender?: (e: any) => void;
    selectionCreated?: (e: any) => void;
    selectionCleared?: (e: any) => void;
  } | null>(null);
  const adjustMenuLiRef = useRef<HTMLElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const scheduledSessionRef = useRef<AdjustValues | null>(null);
  const panelVisibilityRef = useRef<boolean>(false);
  const menuBarListenerRef = useRef<((e: Event) => void) | null>(null);

  // session = temporary live adjustments (overlay, never baked)
  const [sessionValues, setSessionValues] = useState<AdjustValues>(
    DEFAULT_ADJUST_VALUES
  );

  // local ref to avoid recreating panel when session updates
  const sessionRef = useRef<AdjustValues>(sessionValues);
  useEffect(() => {
    sessionRef.current = sessionValues;
  }, [sessionValues]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdjustPanelOpen, setIsAdjustPanelOpen] = useState(false);
  const [currentActiveMenu, setCurrentActiveMenu] = useState<string>("");

  // Update panel visibility ref when state changes
  useEffect(() => {
    panelVisibilityRef.current = isAdjustPanelOpen;
  }, [isAdjustPanelOpen]);

  const formatValueForLabel = (key: keyof AdjustValues, val: number) => {
    const abs = Math.abs(val);
    if (abs < 1) return val.toFixed(2);
    if (abs < 10) return val.toFixed(2);
    return String(Math.round(val));
  };

  /**
   * Build fabric filters from numeric session values with improved accuracy.
   * (stable — no external deps)
   */
  const buildAdjustmentFilters = useCallback((values: AdjustValues) => {
    const filters: any[] = [];

    try {
      if (
        Math.abs(values.brightness) > 0.0001 &&
        window.fabric?.Image?.filters?.Brightness
      ) {
        const f = new window.fabric.Image.filters.Brightness({
          brightness: values.brightness,
        });
        (f as any).__tui_session_marker = true;
        filters.push(f);
      }
    } catch (e) {
      console.warn("Brightness creation failed", e);
    }

    try {
      if (
        Math.abs(values.contrast) > 0.0001 &&
        window.fabric?.Image?.filters?.Contrast
      ) {
        const f = new window.fabric.Image.filters.Contrast({
          contrast: values.contrast,
        });
        (f as any).__tui_session_marker = true;
        filters.push(f);
      }
    } catch (e) {
      console.warn("Contrast creation failed", e);
    }

    try {
      if (Math.abs(values.saturation) > 0.0001) {
        if (window.fabric?.Image?.filters?.Saturation) {
          const f = new window.fabric.Image.filters.Saturation({
            saturation: values.saturation,
          });
          (f as any).__tui_session_marker = true;
          filters.push(f);
        } else {
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
      }
    } catch (e) {
      console.warn("Saturation filter build failed", e);
    }

    try {
      if (
        Math.abs(values.hue) > 0.0001 &&
        window.fabric?.Image?.filters?.HueRotation
      ) {
        const f = new window.fabric.Image.filters.HueRotation({
          rotation: (values.hue * Math.PI) / 180,
        });
        (f as any).__tui_session_marker = true;
        filters.push(f);
      }
    } catch (e) {
      console.warn("Hue filter creation failed", e);
    }

    // Improved tonal adjustments with better scaling
    if (
      Math.abs(values.highlights) > 0.00001 ||
      Math.abs(values.shadows) > 0.00001 ||
      Math.abs(values.whites) > 0.00001 ||
      Math.abs(values.blacks) > 0.00001
    ) {
      try {
        // More refined scaling for better control
        const hFactor = values.highlights * 0.02; // -5..5 -> -0.1..0.1
        const sFactor = values.shadows * 0.02;
        const wFactor = values.whites * 0.005; // -100..100 -> -0.5..0.5
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
      } catch (e) {
        console.warn("Tonal matrix build failed", e);
      }
    }

    return filters;
  }, []);

  // rAF-debounce scheduling
  const scheduleApplySession = useCallback((values: AdjustValues) => {
    scheduledSessionRef.current = values;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const sess = scheduledSessionRef.current;
      scheduledSessionRef.current = null;
      if (sess) reapplySessionToCurrentTargets(sess);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Reapply session values (non-destructive preview) to current targets.
   * Uses sessionRef/current state instead of depending on sessionValues in the callback list.
   */
  const reapplySessionToCurrentTargets = useCallback(
    (session?: AdjustValues) => {
      const instance = instanceRef.current;
      if (!instance) return;
      const canvas = instance._graphics?.getCanvas();
      if (!canvas) return;

      const sess = session || sessionRef.current || DEFAULT_ADJUST_VALUES;
      const targets: any[] = [];

      try {
        // Prefer active image object
        const active = canvas.getActiveObject();
        if (active && active.type === "image") targets.push(active);

        // Always include background image if exists
        if (canvas.backgroundImage) targets.push(canvas.backgroundImage);

        // If we still have nothing, include background as fallback
        if (targets.length === 0 && canvas.backgroundImage) {
          targets.push(canvas.backgroundImage);
        }
      } catch (e) {
        console.warn("Target detection failed:", e);
      }

      targets.forEach((target) => {
        try {
          (target as any).__tui_session_values = sess;

          // snapshot current filters
          const currentFilters = (target.filters && [...target.filters]) || [];

          // keep base filters that are not ours
          const baseFilters = currentFilters.filter(
            (f: any) => !(f && f.__tui_session_marker === true)
          );

          // new session filters
          const adjustmentFilters = buildAdjustmentFilters(sess);

          target.filters = [...baseFilters, ...adjustmentFilters];
          (target as any).__tui_adj_filters = adjustmentFilters;

          if (typeof target.applyFilters === "function") {
            try {
              target.applyFilters();
            } catch (err) {
              // ignore per-target apply errors
            }
          }
        } catch (ex) {
          console.warn("Per-target filter application failed:", ex);
        }
      });

      try {
        canvas.renderAll();
      } catch (e) {
        console.warn("Canvas render failed:", e);
      }
    },
    [buildAdjustmentFilters]
  );

  // Whenever sessionValues change, schedule apply and update UI (no panel recreate)
  useEffect(() => {
    scheduleApplySession(sessionValues);
    updatePanelUI(sessionValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionValues]);

  // Reset session-only adjustments
  const resetSession = useCallback(() => {
    setSessionValues(DEFAULT_ADJUST_VALUES);

    const instance = instanceRef.current;
    if (!instance) return;

    try {
      const canvas = instance._graphics?.getCanvas();
      if (!canvas) return;

      const targets: any[] = [];
      const active = canvas.getActiveObject();
      if (active) targets.push(active);
      if (canvas.backgroundImage) targets.push(canvas.backgroundImage);

      targets.forEach((t) => {
        if (!t) return;
        const current = (t.filters && [...t.filters]) || [];
        t.filters = current.filter(
          (f: any) => !(f && f.__tui_session_marker === true)
        );
        (t as any).__tui_adj_filters = [];
        delete (t as any).__tui_session_values;

        if (typeof t.applyFilters === "function") {
          try {
            t.applyFilters();
          } catch (err) {}
        }
      });

      canvas.renderAll();
    } catch (e) {
      console.warn("Session reset failed:", e);
    }

    updatePanelUI(DEFAULT_ADJUST_VALUES);
  }, []);

  // Update panel UI (reads from passed session)
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
      if (slider) slider.value = String(session[key]);
      if (valueSpan)
        valueSpan.textContent = formatValueForLabel(key, session[key]);
    });
  }, []);

  // Start slider interaction (reset only that slider's session value to 0)
  const startSliderInteraction = useCallback((key: keyof AdjustValues) => {
    setSessionValues((prev) => {
      const next = { ...prev, [key]: 0 };
      const panel = adjustPanelRef.current;
      if (panel) {
        const slider = panel.querySelector(
          `#${key}-slider`
        ) as HTMLInputElement | null;
        const valueSpan = panel.querySelector(
          `#${key}-value`
        ) as HTMLSpanElement | null;
        if (slider) slider.value = "0";
        if (valueSpan) valueSpan.textContent = formatValueForLabel(key, 0);
      }
      return next;
    });
  }, []);

  // Live change handler
  const handleSessionChange = useCallback(
    (key: keyof AdjustValues, value: number) => {
      setSessionValues((prev) => {
        const next = { ...prev, [key]: value };
        // schedule rAF update
        scheduleApplySession(next);

        // immediate panel label update
        const panel = adjustPanelRef.current;
        if (panel) {
          const valueSpan = panel.querySelector(
            `#${key}-value`
          ) as HTMLSpanElement | null;
          if (valueSpan)
            valueSpan.textContent = formatValueForLabel(key, value);
        }
        return next;
      });
    },
    [scheduleApplySession]
  );

  /**
   * createAdjustPanel
   * - Note: intentionally does NOT depend on sessionValues so it won't be recreated on every slider move.
   * - Panel reads current numeric values from sessionRef when needed.
   */
  const createAdjustPanel = useCallback(() => {
    if (!editorRef.current) return;
    if (!isAdjustPanelOpen) return;

    // If panel already exists, just update UI and return (prevents flicker)
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
    adjustPanel.style.cssText = `
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-left: 1px solid #e0e0e0;
      padding: 20px 16px;
      box-sizing: border-box;
      overflow-y: auto;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: -2px 0 10px rgba(0,0,0,0.08);
    `;

    const panelContent = document.createElement("div");
    panelContent.innerHTML = `
      <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <img src="${ICONS.adjust}" alt="" style="width: 18px; height: 18px; opacity: 0.8;">
          <h3 style="margin: 0; font-size: 15px; font-weight: 600; color: #333;">Adjust</h3>
        </div>
        <button id="reset-adjustments" style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          color: #666;
          font-weight: 500;
          transition: all 0.2s ease;
        ">
          <img src="${ICONS.reset}" alt="" style="width: 14px; height: 14px;">
          Reset
        </button>
      </div>
      <div id="sliders-container"></div>
    `;
    adjustPanel.appendChild(panelContent);

    const slidersContainer = panelContent.querySelector("#sliders-container")!;
    const adjustSliders = [
      { key: "brightness", label: "Brightness", min: -1, max: 1, step: 0.01 },
      { key: "contrast", label: "Contrast", min: -1, max: 1, step: 0.01 },
      { key: "saturation", label: "Saturation", min: -1, max: 1, step: 0.01 },
      { key: "highlights", label: "Highlights", min: -5, max: 5, step: 0.01 },
      { key: "shadows", label: "Shadows", min: -5, max: 5, step: 0.01 },
      { key: "whites", label: "Whites", min: -100, max: 100, step: 1 },
      { key: "blacks", label: "Blacks", min: -100, max: 100, step: 1 },
      { key: "hue", label: "Hue", min: -180, max: 180, step: 1 },
    ];

    // Build sliders once
    adjustSliders.forEach(({ key, label, min, max, step }) => {
      const sessionVal = sessionRef.current[key as keyof AdjustValues];
      const sliderDiv = document.createElement("div");
      sliderDiv.style.cssText = "margin-bottom: 18px;";

      sliderDiv.innerHTML = `
        <label style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #444;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${
              (ICONS as any)[key]
            }" alt="" style="width: 16px; height: 16px; opacity: 0.7;">
            <span>${label}</span>
          </div>
          <span id="${key}-value" style="
            font-weight: 500; 
            color: #666; 
            font-size: 12px;
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            min-width: 40px;
            text-align: center;
          ">${formatValueForLabel(key as keyof AdjustValues, sessionVal)}</span>
        </label>
        <input 
          type="range" 
          id="${key}-slider"
          min="${min}" 
          max="${max}" 
          step="${step}" 
          value="${sessionVal}"
          style="
            width: 100%;
            height: 4px;
            background: #e0e0e0;
            border-radius: 2px;
            outline: none;
            -webkit-appearance: none;
            appearance: none;
            cursor: pointer;
          "
        />
      `;
      slidersContainer.appendChild(sliderDiv);
    });

    // Add CSS block once
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
      `;
      document.head.appendChild(style);
    }

    // Attach listeners for sliders (only once per panel creation)
    const adjustSlidersElements = slidersContainer.querySelectorAll(
      "input[type='range']"
    );
    adjustSlidersElements.forEach((el) => {
      const id = el.id; // e.g. "brightness-slider"
      const key = id.replace("-slider", "") as keyof AdjustValues;
      const slider = el as HTMLInputElement;
      const valueSpan = adjustPanel.querySelector(
        `#${key}-value`
      ) as HTMLSpanElement | null;
      if (!slider || !valueSpan) return;

      const onPointerDown = () => startSliderInteraction(key);
      const onInput = (e: Event) => {
        const raw = (e.target as HTMLInputElement).value;
        const parsed = parseFloat(raw);
        valueSpan.textContent = formatValueForLabel(key, parsed);
        handleSessionChange(key, parsed);
      };

      slider.addEventListener("pointerdown", onPointerDown);
      slider.addEventListener("mousedown", onPointerDown);
      slider.addEventListener("touchstart", onPointerDown, { passive: true });
      slider.addEventListener("input", onInput);

      slider.addEventListener("focus", () => {
        slider.style.boxShadow = "0 0 0 3px rgba(33,150,243,0.2)";
      });
      slider.addEventListener("blur", () => {
        slider.style.boxShadow = "none";
      });
    });

    const resetBtn = adjustPanel.querySelector("#reset-adjustments");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resetSession();
      });
    }

    // append and persist ref
    editorContainer.appendChild(adjustPanel);
    adjustPanelRef.current = adjustPanel;

    // ensure UI matches latest session values at mount
    updatePanelUI(sessionRef.current);

    // ensure pointer events and focusability
    adjustPanel.tabIndex = -1;
    adjustPanel.style.pointerEvents = "auto";
  }, [
    isAdjustPanelOpen,
    startSliderInteraction,
    handleSessionChange,
    resetSession,
    updatePanelUI,
  ]);

  // Open/close panel effect — create once on open, remove once on close
  useEffect(() => {
    if (!editorRef.current) return;

    if (isAdjustPanelOpen) {
      createAdjustPanel();
    } else {
      const existingPanel = editorRef.current.querySelector(
        ".tui-image-editor-adjust-panel"
      );
      if (existingPanel) {
        try {
          // remove event listeners by cloning node (safe cleanup)
          existingPanel.parentElement?.removeChild(existingPanel);
        } catch (e) {
          try {
            existingPanel.remove();
          } catch (ex) {}
        }
        adjustPanelRef.current = null;
      }
    }
    // we intentionally do NOT include sessionValues here to avoid re-running
  }, [isAdjustPanelOpen, createAdjustPanel]);

  // Initialize editor once
  useEffect(() => {
    let resizeObs: ResizeObserver | null = null;
    let mounted = true;

    async function initEditor() {
      setLoading(true);
      setError(null);

      try {
        await loadCssWithBackups(TOAST_CSS_BACKUPS);
        await loadCssWithBackups(TOAST_COLOR_PICKER_CSS);

        let Constructor: any = undefined;
        try {
          const mod = await import("tui-image-editor");
          Constructor = (mod as any).default ?? (mod as any).ImageEditor ?? mod;
          console.info("[init] using local tui-image-editor import");
        } catch (importErr) {
          console.warn(
            "[init] local import failed, using CDN fallback:",
            importErr
          );
          await loadScriptWithBackups(TOAST_SCRIPT_BACKUPS);
          Constructor = window.tui?.ImageEditor;
        }

        if (typeof Constructor !== "function") {
          throw new Error("ImageEditor constructor not available");
        }

        // Enhanced editor configuration for better performance and features
        instanceRef.current = new Constructor(editorRef.current, {
          includeUI: {
            loadImage: {
              path: "https://picsum.photos/1200/800?random=1",
              name: "Sample Image",
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
          cssMaxWidth: 1000,
          cssMaxHeight: 700,
          usageStatistics: false,
        });

        // Defensive: request willReadFrequently for canvas contexts
        try {
          const fabricCanvas = instanceRef.current._graphics?.getCanvas();
          const trySetWillRead = (el: HTMLCanvasElement | null | undefined) => {
            if (!el) return;
            try {
              el.getContext("2d", { willReadFrequently: true });
            } catch (e) {
              // ignore if unsupported
            }
          };
          trySetWillRead(fabricCanvas?.lowerCanvasEl);
          trySetWillRead(fabricCanvas?.upperCanvasEl);
          trySetWillRead((fabricCanvas as any)?.cacheCanvasEl);

          // Fabric tuning
          if (fabricCanvas) {
            fabricCanvas.selection = true;
            fabricCanvas.preserveObjectStacking = true;
            fabricCanvas.imageSmoothingEnabled = true;
            fabricCanvas.enableRetinaScaling = true;

            // mouse wheel zoom
            fabricCanvas.on("mouse:wheel", function (opt: any) {
              const delta = opt.e.deltaY;
              let zoom = fabricCanvas.getZoom();
              zoom *= 0.999 ** delta;
              if (zoom > 20) zoom = 20;
              if (zoom < 0.01) zoom = 0.01;
              fabricCanvas.zoomToPoint(
                { x: opt.e.offsetX, y: opt.e.offsetY },
                zoom
              );
              opt.e.preventDefault();
              opt.e.stopPropagation();
            });

            // panning with Alt+drag
            fabricCanvas.on("mouse:down", function (opt: any) {
              const evt = opt.e;
              if (evt.altKey === true) {
                (fabricCanvas as any).isDragging = true;
                fabricCanvas.selection = false;
                (fabricCanvas as any).lastPosX = evt.clientX;
                (fabricCanvas as any).lastPosY = evt.clientY;
              }
            });

            fabricCanvas.on("mouse:move", function (opt: any) {
              if ((fabricCanvas as any).isDragging) {
                const e = opt.e;
                const vpt = fabricCanvas.viewportTransform;
                if (vpt) {
                  vpt[4] += e.clientX - (fabricCanvas as any).lastPosX;
                  vpt[5] += e.clientY - (fabricCanvas as any).lastPosY;
                  fabricCanvas.requestRenderAll();
                  (fabricCanvas as any).lastPosX = e.clientX;
                  (fabricCanvas as any).lastPosY = e.clientY;
                }
              }
            });

            fabricCanvas.on("mouse:up", function () {
              fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform);
              (fabricCanvas as any).isDragging = false;
              fabricCanvas.selection = true;
            });

            // double click to reset zoom
            fabricCanvas.on("mouse:dblclick", function () {
              fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
              fabricCanvas.setZoom(1);
            });
          }
        } catch (e) {
          console.warn("Canvas enhancement failed:", e);
        }

        // Setup menu handling and canvas listeners after DOM settles
        setTimeout(() => {
          if (!editorRef.current || !instanceRef.current) return;
          setupMenuHandling();
          setupCanvasListeners();
        }, 600);

        // Enhanced resize handling
        const resizeFn = () => {
          if (!instanceRef.current || !editorRef.current) return;
          const rect = editorRef.current.getBoundingClientRect();
          const width = Math.floor(rect.width);
          const height = Math.floor(rect.height);

          try {
            instanceRef.current.ui?.resizeEditor?.({ width, height });

            // Ensure canvas dimensions are properly updated
            const canvas = instanceRef.current._graphics?.getCanvas();
            if (canvas) {
              canvas.setDimensions({
                width: width - (panelVisibilityRef.current ? 280 : 0),
                height: height - 60, // Account for menu bar
              });
              canvas.renderAll();
            }
          } catch (e) {
            console.warn("Resize failed:", e);
          }
        };

        resizeObs = new ResizeObserver(() => {
          requestAnimationFrame(resizeFn);
        });
        if (editorRef.current) resizeObs.observe(editorRef.current);

        setLoading(false);
      } catch (err: any) {
        console.error("[init] error:", err);
        if (mounted) {
          setError(err?.message ?? String(err));
          setLoading(false);
        }
      }
    }

    // Setup menu handling with improved adjust panel persistence
    const setupMenuHandling = () => {
      const menuBar = editorRef.current?.querySelector(
        ".tui-image-editor-menu"
      ) as HTMLElement | null;
      if (!menuBar) return;

      // Set icons for existing TUI menu items
      Object.entries(MENU_ICONS).forEach(([id, url]) => {
        const img = editorRef.current!.querySelector(
          `.tui-image-editor-menu [data-menu="${id}"] img`
        ) as HTMLImageElement | null;
        if (img) {
          img.src = url;
          img.onerror = () => {
            if (id === "adjust") img.src = ICONS.adjust;
            else img.style.display = "none";
          };
        }
      });

      // Create or reuse adjust menu item (aligned with other menu items)
      if (!menuBar.querySelector('[data-menu="adjust"]')) {
        const li = document.createElement("li");
        li.setAttribute("data-menu", "adjust");
        li.className = "tui-image-editor-menu-item";
        li.style.cursor = "pointer";
        li.style.display = "inline-flex";
        li.style.alignItems = "center";
        li.style.height = "100%";
        li.style.marginLeft = "6px";

        li.innerHTML = `
          <button class="tui-image-editor-button" title="Adjust" style="display:inline-flex;align-items:center;border:none;background:transparent;padding:8px;border-radius:4px;transition:all 0.2s ease;">
            <div class="tui-image-editor-menu-icon" style="display:inline-flex;align-items:center;justify-content:center;margin-right:6px;">
              <img src="${ICONS.adjust}" alt="Adjust" style="width:18px;height:18px;display:block;"/>
            </div>
            <span class="tui-image-editor-menu-title" style="font-size:12px;color:inherit;font-weight:500;">Adjust</span>
          </button>
        `;
        menuBar.appendChild(li);
        adjustMenuLiRef.current = li;

        const imgEl = li.querySelector("img") as HTMLImageElement | null;
        if (imgEl) imgEl.onerror = () => (imgEl.src = ICONS.adjust);

        // Enhanced adjust button click handler
        li.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          try {
            const instance = instanceRef.current;
            const canvas = instance?._graphics?.getCanvas();
            const hasImage =
              canvas && (canvas.backgroundImage || canvas.getActiveObject());
            if (!hasImage) {
              setError("Please load an image first");
              setTimeout(() => setError(null), 3000);
              return;
            }
          } catch (ex) {
            console.warn("Image check failed:", ex);
          }

          // Toggle adjust panel without affecting other menu states
          setIsAdjustPanelOpen((prev) => {
            const next = !prev;

            // Update visual state of adjust button only
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
        });
      } else {
        const existing = menuBar.querySelector(
          '[data-menu="adjust"]'
        ) as HTMLElement | null;
        if (existing) {
          adjustMenuLiRef.current = existing;
          const imgEl = existing.querySelector(
            "img"
          ) as HTMLImageElement | null;
          if (imgEl) imgEl.onerror = () => (imgEl.src = ICONS.adjust);
        }
      }

      // Delegated handler that preserves adjust panel and re-applies session after TUI operations
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

        // Keep adjust panel open even when clicking other menus. Just update their active visuals.
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

          // reapply preview after TUI finishes internal changes
          setTimeout(() => {
            reapplySessionToCurrentTargets();
          }, 100);
        }
      };

      // Prevent duplicate handlers
      try {
        const existingHandlers = (menuBar as any).__tuiMenuHandlers || [];
        existingHandlers.forEach((handler: any) => {
          menuBar.removeEventListener("click", handler, true);
        });
      } catch (e) {}

      menuBar.addEventListener("click", delegatedHandler, true);
      (menuBar as any).__tuiMenuHandlers = [delegatedHandler];
      menuBarListenerRef.current = delegatedHandler;
    };

    // Setup enhanced canvas listeners
    const setupCanvasListeners = () => {
      try {
        const canvas = instanceRef.current._graphics?.getCanvas();
        if (!canvas || canvasListenersRef.current) return;

        const onObjectAdded = (e: any) => {
          try {
            const obj = e?.target;
            if (obj) {
              (obj as any).__tui_session_values = sessionRef.current;
              setTimeout(() => reapplySessionToCurrentTargets(), 50);
            }
          } catch (ex) {
            console.warn("Object added handler failed:", ex);
          }
        };

        const onObjectModified = (e: any) => {
          try {
            const obj = e?.target;
            if (obj) {
              (obj as any).__tui_session_values = sessionRef.current;
            }
            setTimeout(() => reapplySessionToCurrentTargets(), 30);
          } catch (ex) {
            console.warn("Object modified handler failed:", ex);
          }
        };

        const onSelectionCreated = (e: any) => {
          try {
            const obj = e?.target;
            if (obj) {
              (obj as any).__tui_session_values = sessionRef.current;
            }
            setTimeout(() => reapplySessionToCurrentTargets(), 20);
          } catch (ex) {
            console.warn("Selection created handler failed:", ex);
          }
        };

        const onSelectionCleared = () => {
          try {
            setTimeout(() => reapplySessionToCurrentTargets(), 20);
          } catch (ex) {
            console.warn("Selection cleared handler failed:", ex);
          }
        };

        const onAfterRender = () => {
          try {
            const hasActiveSession = Object.values(
              sessionRef.current || {}
            ).some((v) => Math.abs(v) > 0.001);
            if (hasActiveSession) {
              setTimeout(() => reapplySessionToCurrentTargets(), 10);
            }
          } catch (ex) {
            console.warn("After render handler failed:", ex);
          }
        };

        canvas.on("object:added", onObjectAdded);
        canvas.on("object:modified", onObjectModified);
        canvas.on("selection:created", onSelectionCreated);
        canvas.on("selection:cleared", onSelectionCleared);
        if (canvas.on) canvas.on("after:render", onAfterRender);

        canvasListenersRef.current = {
          added: onObjectAdded,
          modified: onObjectModified,
          selectionCreated: onSelectionCreated,
          selectionCleared: onSelectionCleared,
          afterRender: onAfterRender,
        };
      } catch (e) {
        console.warn("Canvas listeners setup failed:", e);
      }
    };

    initEditor();

    return () => {
      mounted = false;

      if (resizeObs && editorRef.current) resizeObs.disconnect();

      // Remove menu listeners
      try {
        const menuBar = editorRef.current?.querySelector(
          ".tui-image-editor-menu"
        );
        if (menuBar) {
          const handlers = (menuBar as any).__tuiMenuHandlers || [];
          handlers.forEach((handler: any) => {
            menuBar.removeEventListener("click", handler, true);
          });
          delete (menuBar as any).__tuiMenuHandlers;
        }
      } catch (e) {
        console.warn("Menu cleanup failed:", e);
      }

      // Remove canvas listeners
      try {
        const canvas = instanceRef.current?._graphics?.getCanvas();
        if (canvas && canvasListenersRef.current) {
          const listeners = canvasListenersRef.current;
          if (listeners.added) canvas.off("object:added", listeners.added);
          if (listeners.modified)
            canvas.off("object:modified", listeners.modified);
          if (listeners.selectionCreated)
            canvas.off("selection:created", listeners.selectionCreated);
          if (listeners.selectionCleared)
            canvas.off("selection:cleared", listeners.selectionCleared);
          if (listeners.afterRender && canvas.off)
            canvas.off("after:render", listeners.afterRender);
          canvasListenersRef.current = null;
        }
      } catch (e) {
        console.warn("Canvas cleanup failed:", e);
      }

      // Destroy editor instance
      try {
        instanceRef.current?.destroy?.();
      } catch (e) {
        console.warn("Editor cleanup failed:", e);
      }
      instanceRef.current = null;

      // Remove panel
      try {
        const existingPanel = editorRef.current?.querySelector(
          ".tui-image-editor-adjust-panel"
        );
        if (existingPanel) existingPanel.remove();
        adjustPanelRef.current = null;
      } catch (e) {
        console.warn("Panel cleanup failed:", e);
      }

      // Cancel animation frames
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      scheduledSessionRef.current = null;
    };
    // run once
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
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
              borderTop: "4px solid #2196f3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          />
          <div
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1565c0",
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
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      />

      {/* Loading animation keyframes */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .tui-image-editor-menu-item-active {
          background: #f0f8ff !important;
        }
      `}</style>
    </div>
  );
};

export default ToastEditor;

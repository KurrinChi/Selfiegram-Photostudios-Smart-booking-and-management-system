import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

/**
 * InfiniteParallaxGallery (single-file component)
 * - Static image array for now (replace with DB later)
 * - Mouse drag left/right
 * - Seamless infinite loop (wraps when hitting ends)
 * - Responsive
 * - 3D-ish parallax (scale + rotateY + elevation) with center focus
 */

export default function InfiniteParallaxGallery() {
  // ⚙️ Config — tweak freely
  const GAP = 24; // px between cards
  const MAX_SCALE = 1.15; // scale at center
  const MIN_SCALE = 0.72; // scale at far edges
  const MAX_ROTATE_Y = 22; // deg tilt at edges
  const ELEVATE = 24; // px lift at center
  const BASE_HEIGHT = 320; // ideal card height (will clamp to viewport)

  // 🔗 Static demo images — replace with your DB data later
  const images = useMemo(
    () =>
      Array.from(
        { length: 19 },
        (_, i) => `https://picsum.photos/seed/parallax-${i + 1}/800/600`
      ),
    []
  );

  // 📏 Responsive container measurements
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [vw, setVw] = useState(0);
  const [vh, setVh] = useState(0);

  useEffect(() => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const ro = new ResizeObserver(() => {
      setVw(el.clientWidth);
      setVh(el.clientHeight);
    });
    ro.observe(el);
    setVw(el.clientWidth);
    setVh(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // 🧮 Card sizing (responsive)
  const cardHeight = Math.min(BASE_HEIGHT, Math.max(220, vh * 0.85));
  const cardWidth = Math.max(220, Math.min(520, vw * 0.42));

  // 🛤️ Track metrics
  const unit = cardWidth + GAP; // one card + gap
  const count = images.length;
  const loopSpan = unit * count; // width of one logical set

  // 🧲 Drag position (MotionValue)
  const x = useMotionValue(0);
  const [xRender, setXRender] = useState(0); // mirrors x for React-driven math

  // Keep React in sync with motion value for per-card transforms
  useEffect(() => {
    const unsub = x.on("change", (v) => setXRender(v));
    return () => unsub();
  }, [x]);

  // ♾️ Wrap logic to create the seamless loop
  const wrapIfNeeded = (current: number) => {
    // Shift within [-loopSpan, 0] so we can set dragConstraints comfortably
    if (current <= -loopSpan) return current + loopSpan;
    if (current >= 0) return current - loopSpan;
    return current;
  };

  // Ensure the value is wrapped on each drag change subtly (prevents hard edges)
  useEffect(() => {
    const unsub = x.on("change", (v) => {
      const wrapped = wrapIfNeeded(v);
      if (wrapped !== v) x.set(wrapped);
    });
    return () => unsub();
  }, [x, loopSpan]);

  // Double the list for continuity rendering (visual only)
  const renderImages = useMemo(() => [...images, ...images], [images]);

  // 🔢 Helper: shortest distance from the visual center line
  const centerX = vw / 2;
  const distanceFromCenter = (index: number) => {
    // Physical x-position of this card's center within the doubled list
    const base = index * unit + cardWidth / 2; // position in doubled track
    // Account for dragging offset; normalize to the nearest equivalent within one loop
    // We want the nearest representation of this card relative to current x
    // Convert xRender into a positive offset within [0, loopSpan)
    const offset = ((xRender % loopSpan) + loopSpan) % loopSpan; // 0..loopSpan
    // Visual position on screen (0 at left edge of viewport ref)
    const screenX = base + -offset; // shift by drag

    // Because we have two sets, there are multiple visual copies spaced by loopSpan.
    // Choose the one closest to the viewport center by testing +/- loopSpan shifts.
    let candidate = screenX;
    const alt1 = screenX - loopSpan;
    const alt2 = screenX + loopSpan;
    if (Math.abs(alt1 - centerX) < Math.abs(candidate - centerX))
      candidate = alt1;
    if (Math.abs(alt2 - centerX) < Math.abs(candidate - centerX))
      candidate = alt2;

    return candidate - centerX; // signed distance (px)
  };

  // 🔮 Derive transform props from distance
  const deriveStyle = (dx: number) => {
    const norm = Math.min(1, Math.abs(dx) / (vw * 0.6 || 1)); // 0..1 by ~60% viewport width
    const scale = MAX_SCALE - (MAX_SCALE - MIN_SCALE) * norm; // bigger at center
    const rotateY = (dx / (vw || 1)) * MAX_ROTATE_Y; // tilt toward sides
    const translateY = -ELEVATE * (1 - norm); // lift at center
    const zIndex = Math.round(1000 - norm * 1000); // center on top
    const opacity = 0.9 - 0.3 * norm; // subtle fade on edges
    return { scale, rotateY, translateY, zIndex, opacity };
  };

  return (
    <div
      ref={viewportRef}
      style={{
        width: "100%",
        height: "min(80vh, 680px)",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        background: "linear-gradient(180deg, #0f1115, #0b0d10)",
        color: "white",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          perspective: 1200, // enables 3D
          position: "relative",
        }}
      >
        {/* Track */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -loopSpan, right: 0 }}
          dragElastic={0.2}
          dragMomentum={true}
          onDragEnd={() => {
            // Snap back into wrapped window after momentum settles
            const v = x.get();
            const wrapped = wrapIfNeeded(v);
            if (wrapped !== v) x.set(wrapped);
          }}
          style={{
            x,
            display: "flex",
            alignItems: "center",
            gap: GAP,
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            willChange: "transform",
            padding: `0 ${loopSpan}px`, // side padding so first/last have room during wrap
          }}
        >
          {renderImages.map((src, i) => {
            const dx = distanceFromCenter(i);
            const { scale, rotateY, translateY, zIndex, opacity } =
              deriveStyle(dx);
            return (
              <motion.div
                key={`${i}-${src}`}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 18,
                  overflow: "hidden",
                  flex: "0 0 auto",
                  boxShadow:
                    "0 10px 30px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)",
                  transformStyle: "preserve-3d",
                  scale,
                  rotateY,
                  y: translateY,
                  zIndex,
                  opacity,
                  cursor: "grab",
                  userSelect: "none",
                  background: "#0f131a",
                }}
                whileTap={{ cursor: "grabbing" }}
              >
                <img
                  src={src}
                  alt={`gallery-${i}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                  draggable={false}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Subtle center indicator (optional) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            transform: "translateX(-0.5px)",
            background:
              "linear-gradient(180deg, transparent, rgba(255,255,255,0.12), transparent)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Header / instructions */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          fontSize: 14,
          opacity: 0.8,
        }}
      >
        <div>
          <strong>Infinite Parallax Gallery</strong>
          <span style={{ opacity: 0.7 }}> — drag horizontally</span>
        </div>
        <div style={{ opacity: 0.7 }}>
          Items: {count} • Loop width: {Math.round(loopSpan)}px
        </div>
      </div>
    </div>
  );
}

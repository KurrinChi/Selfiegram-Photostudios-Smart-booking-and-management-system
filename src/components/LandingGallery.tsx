import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import packagesData from "../data/packages.json";

export default function SimpleParallaxGallery() {
  // ⚙️ Config
  const MAX_SCALE = 1.35;
  const MIN_SCALE = 0.32;
  const MAX_ROTATE_Y = 42;
  const ELEVATE = 30;
  const DIAGONAL_FACTOR = 0.6;

  // 📦 Data
  const packages = packagesData;
  const images = useMemo(() => packages.map((p) => p.image), [packages]);

  // viewport
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

  // responsive sizing
  const GAP = vw < 600 ? 30 : 60;
  const cardWidth = Math.max(200, Math.min(vw < 600 ? 320 : 520, vw * 0.42));

  // metrics
  const unit = cardWidth + GAP;
  const count = images.length;
  const totalWidth = unit * count;

  // motion
  const x = useMotionValue(0);
  const progress = useTransform(x, [-totalWidth + vw, 0], [1, 0], {
    clamp: true,
  });
  const [xRender, setXRender] = useState(0);
  useEffect(() => {
    const unsub = x.on("change", (v) => setXRender(v));
    return () => unsub();
  }, [x]);

  const centerX = vw / 5;
  const distanceFromCenter = (index: number) => {
    const base = index * unit + cardWidth / 2;
    const screenX = base + xRender;
    return screenX - centerX;
  };

  const deriveStyle = (dx: number) => {
    const norm = Math.min(1, Math.abs(dx) / (vw * 0.6 || 1));
    const scale = MAX_SCALE - (MAX_SCALE - MIN_SCALE) * norm;
    const rotateY = (dx / (vw || 1)) * MAX_ROTATE_Y;
    const translateY = -ELEVATE * (1 - norm);
    const zIndex = Math.round(1000 - norm * 1000);
    const opacity = 0.9 - 0.3 * norm;
    return { scale, rotateY, translateY, zIndex, opacity };
  };

  // active card
  const [activeIndex, setActiveIndex] = useState(0);
  const ACTIVATE_RANGE = Math.max(60, vw * 0.12);
  const HYSTERESIS = Math.max(30, vw * 0.04);

  useEffect(() => {
    let nearest = 0;
    let nearestDx = Infinity;
    for (let i = 0; i < count; i++) {
      const dx = distanceFromCenter(i);
      const adx = Math.abs(dx);
      if (adx < nearestDx) {
        nearestDx = adx;
        nearest = i;
      }
    }
    const dxActive = Math.abs(distanceFromCenter(activeIndex));
    const withinCurrent = dxActive <= ACTIVATE_RANGE + HYSTERESIS;
    const withinNearest = nearestDx <= ACTIVATE_RANGE;
    if (!withinCurrent && withinNearest && nearest !== activeIndex) {
      setActiveIndex(nearest);
    } else if (dxActive > nearestDx && nearestDx < ACTIVATE_RANGE / 2) {
      setActiveIndex(nearest);
    }
  }, [xRender, vw, count]);

  // alignment
  const centerToIndex = (i: number) => -(i * unit + cardWidth / 2 - centerX);
  const gentlyAlignToIndex = (i: number) => {
    const target = centerToIndex(i);
    const current = x.get();
    const nudgedTarget = current + (target - current) * 0.1;
    animate(x, nudgedTarget, {
      type: "spring",
      stiffness: 120,
      damping: 24,
      mass: 0.3,
    });
  };

  // responsive
  const isTablet = vw < 900;
  const isMobile = vw < 600;

  const textVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { stiffness: 320, damping: 28, type: "spring" as const },
    },
  };

  return (
    <div
      ref={viewportRef}
      style={{
        width: "100%",
        height: isMobile ? "88vh" : "min(80vh, 680px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        color: "white",
        position: "relative",
        padding: isMobile ? "0 6px" : 0,
      }}
    >
      {/* text container */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: isMobile ? "column" : "column",
          alignItems: isMobile ? "center" : "flex-start",
          gap: "0.5rem",
          left: isMobile ? "50%" : isTablet ? "6%" : "3%",
          bottom: isMobile ? "10%" : "14%",
          transform: isMobile ? "translateX(-50%)" : "none",
          textAlign: isMobile ? "center" : "left",
          maxWidth: isMobile ? "90%" : isTablet ? "85%" : "420px",
          zIndex: 2000,
          pointerEvents: "none",
          mixBlendMode: "difference",
          filter: "invert(1) contrast(1.2)",
          color: "white", // base color → will invert against bg
        }}
      >
        {/* title */}
        <motion.div
          key={`title-${activeIndex}`}
          initial="hidden"
          animate="show"
          variants={textVariants}
          style={{
            fontStyle: "bold",
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontSize: Math.max(20, Math.min(48, vw * 0.06)),
            fontFamily: "'Poppins', sans-serif",
            color: "#212121",
          }}
        >
          {packages[activeIndex]?.name}
        </motion.div>

        {/* description */}
        <motion.div
          key={`desc-${activeIndex}`}
          initial="hidden"
          animate="show"
          variants={textVariants}
          style={{
            lineHeight: 1.4,
            fontSize: isMobile ? 13 : isTablet ? 14 : 16,
            color: "#212121",
            textShadow: "0 1px 2px rgba(0,0,0,0.35)",
          }}
        >
          {packages[activeIndex]?.description}
        </motion.div>
      </div>

      {/* gallery */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: -(totalWidth - cardWidth - GAP / 2 - centerX),
          right: centerX - cardWidth / 2,
        }}
        dragElastic={isMobile ? 0.25 : 0.15}
        dragMomentum={true}
        onDragEnd={() => gentlyAlignToIndex(activeIndex)}
        style={{
          x,
          display: "flex",
          alignItems: "center",
          gap: GAP,
          position: "absolute",
          left: 0,
          transform: "translateY(-50%)",
          willChange: "transform",
          padding: `0 ${Math.max(0, (vw - cardWidth) / 2)}px`,
        }}
      >
        {images.map((src, i) => {
          const dx = distanceFromCenter(i);
          const { scale, rotateY, translateY, zIndex, opacity } =
            deriveStyle(dx);
          const diagonalY = (dx / (vw || 1)) * (vh * DIAGONAL_FACTOR);

          return (
            <motion.div
              key={`${i}-${src}`}
              style={{
                width: cardWidth,
                height: "360px",
                borderRadius: 14,
                overflow: "hidden",
                flex: "0 0 auto",
                boxShadow:
                  "0 6px 20px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.06)",
                transformStyle: "preserve-3d",
                scale,
                rotateY,
                y: translateY + diagonalY,
                opacity,
                zIndex,
                cursor: "grab",
                userSelect: "none",
                background: "#0f131a",
                willChange: "transform, opacity",
              }}
              whileTap={{ cursor: "grabbing" }}
              onPointerUp={() => gentlyAlignToIndex(activeIndex)}
            >
              <img
                src={src}
                alt={`gallery-${i}`}
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).src =
                    "/slfg-placeholder.png")
                }
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // 🔥 show full image without cropping
                  objectPosition: "center", // make sure it’s centered
                  backgroundColor: "#000", // fill empty spaces if aspect ratio differs
                  display: "block",
                  pointerEvents: "none",
                }}
                draggable={false}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* scrubber */}
      <motion.div
        className="relative mt-140 h-2 bg-neutral-700 rounded-full cursor-pointer overflow-hidden"
        style={{
          width: isMobile ? "90%" : isTablet ? "75%" : "60%",
          bottom: isMobile ? "2%" : "auto",
          position: isMobile ? "absolute" : "static",
        }}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          x.set(-pct * (totalWidth - vw));
        }}
        onPointerUp={() => gentlyAlignToIndex(activeIndex)}
      >
        <motion.div
          className="h-full bg-gray-200 rounded-full"
          style={{ scaleX: progress, originX: 0 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0}
          dragMomentum={false}
        />
      </motion.div>
    </div>
  );
}

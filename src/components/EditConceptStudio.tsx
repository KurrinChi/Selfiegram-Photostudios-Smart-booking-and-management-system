import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";

export interface Studio {
  id: string | number;
  name: string;
  imageUrl: string;
  active?: boolean;
}

interface StudioSidescrollProps {
  studios?: Studio[];
  className?: string;
}

const DARK = "#212121";
const WHITE = "#ffffff";

const placeholderStudios: Studio[] = [
  {
    id: 1,
    name: "Sunset Loft",
    imageUrl: "https://via.placeholder.com/1200x720.png?text=Sunset+Loft",
    active: true,
  },
  {
    id: 2,
    name: "Urban Jungle",
    imageUrl: "https://via.placeholder.com/1200x720.png?text=Urban+Jungle",
    active: false,
  },
  {
    id: 3,
    name: "Minimal White",
    imageUrl: "https://via.placeholder.com/1200x720.png?text=Minimal+White",
    active: true,
  },
];

export default function StudioSidescroll({
  studios = placeholderStudios,
  className = "",
}: StudioSidescrollProps) {
  const [items, setItems] = useState<Studio[]>(() => studios.slice());
  useEffect(() => setItems(studios.slice()), [studios]);

  const [editing, setEditing] = useState<Studio | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Studio | null>(
    null
  );

  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formActive, setFormActive] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const pointer = useRef<{ down: boolean; startX: number; scrollLeft: number }>(
    { down: false, startX: 0, scrollLeft: 0 }
  );

  // init form when editing
  useEffect(() => {
    if (editing) {
      setFormTitle(editing.name);
      setFormImageUrl(editing.imageUrl || "");
      setFormFile(null);
      setPreviewUrl(editing.imageUrl || null);
      setFormActive(Boolean(editing.active));
      const prev = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
      return () => {
        clearTimeout(t);
        prev?.focus?.();
      };
    }
    return;
  }, [editing]);

  // init form when adding
  useEffect(() => {
    if (!isAdding) return;
    setFormTitle("");
    setFormImageUrl("");
    setFormFile(null);
    setPreviewUrl(null);
    setFormActive(true);
    const prev = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      prev?.focus?.();
    };
  }, [isAdding]);

  // preview for uploaded file
  useEffect(() => {
    if (!formFile) return;
    const u = URL.createObjectURL(formFile);
    setPreviewUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [formFile]);

  function genId() {
    return `s_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }

  function handleSaveEdit() {
    if (!editing) return;
    const newImage = previewUrl ?? formImageUrl;
    setItems((prev) =>
      prev.map((p) =>
        p.id === editing.id
          ? {
              ...p,
              name: formTitle || p.name,
              imageUrl: newImage || p.imageUrl,
              active: formActive,
            }
          : p
      )
    );
    setEditing(null);
    setFormFile(null);
    setPreviewUrl(null);
  }

  function handleAddStudio() {
    const id = genId();
    const image =
      previewUrl ??
      formImageUrl ??
      `https://via.placeholder.com/1200x720.png?text=Studio+${id}`;
    const newStudio: Studio = {
      id,
      name: formTitle || `Studio ${id}`,
      imageUrl: image,
      active: formActive,
    };
    // animate add: insert at start
    setItems((prev) => [newStudio, ...prev]);
    setIsAdding(false);
    setFormFile(null);
    setPreviewUrl(null);
    // auto-scroll to start (guarded)
    containerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }

  function confirmDelete(studio: Studio) {
    setShowDeleteConfirm(studio);
  }
  function handleDeleteConfirmed() {
    if (!showDeleteConfirm) return;
    // animate delete by filtering
    setItems((prev) => prev.filter((p) => p.id !== showDeleteConfirm.id));
    setShowDeleteConfirm(null);
    setEditing(null);
  }

  // scroll helper
  function scrollBy(offset: number) {
    containerRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  }

  // wheel => horizontal
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented) return;
      if (e.shiftKey) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        containerRef.current?.scrollBy({ left: e.deltaY, behavior: "smooth" });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel as EventListener);
  }, []);

  // pointer drag (carousel)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onPointerDown = (e: PointerEvent) => {
      pointer.current.down = true;
      try {
        (e.target as Element).setPointerCapture?.(e.pointerId);
      } catch {}
      pointer.current.startX = e.clientX;
      pointer.current.scrollLeft = el.scrollLeft;
      el.classList.add("dragging");
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointer.current.down) return;
      const dx = e.clientX - pointer.current.startX;
      if (containerRef.current)
        containerRef.current.scrollLeft = pointer.current.scrollLeft - dx;
    };
    const onPointerUp = (e: PointerEvent) => {
      pointer.current.down = false;
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {}
      containerRef.current?.classList.remove("dragging");
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // keyboard nav
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollBy(360);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollBy(-360);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  // focus trap
  function trapFocus(container: HTMLElement | null, e: KeyboardEvent) {
    if (!container) return;
    if (e.key !== "Tab") return;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function openEdit(studio: Studio) {
    setEditing(studio);
    setIsAdding(false);
  }
  function closeModal() {
    setEditing(null);
    setIsAdding(false);
    setFormFile(null);
    setPreviewUrl(null);
    setShowDeleteConfirm(null);
  }

  // motion presets
  const cardHover = { scale: 1.02, y: -4 };
  const modalMotion = {
    initial: { opacity: 0, y: 18, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 12, scale: 0.995 },
  };

  return (
    <div
      className={`w-full relative ${className}`}
      style={{ background: WHITE, color: DARK }}
    >
      <style>{`
        :root{ --mono-dark: ${DARK}; --mono-white: ${WHITE}; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { height: 8px; }
        .no-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.3); border-radius: 8px; }
        .dragging { cursor: grabbing; cursor: -webkit-grabbing; }
        .scroll-snap-x { scroll-snap-type: x mandatory; }
        .scroll-snap-align-start { scroll-snap-align: start; }
        .scroll-smooth { scroll-behavior: smooth; }
        .card-w { width: 360px; }
        @media (max-width: 768px) { .card-w { width: 280px; } }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <div>
          <div className="text-xl sm:text-2xl font-semibold">Studios</div>
        </div>

        <div>
          <button
            onClick={() => setIsAdding(true)}
            aria-label="Add studio"
            className="inline-flex items-center gap-2 px-4 py-2 rounded transition hover:shadow-sm"
            style={{
              border: `1px solid "#E6E6E6"`,
              background: "#FAFAFA",
              color: DARK,
            }}
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>
      </div>

      {/* Carousel with nav */}
      <div style={{ position: "relative", padding: "8px 12px 28px 12px" }}>
        <div
          style={{
            position: "absolute",
            left: 6,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
          }}
        >
          <button
            aria-label="Scroll left"
            onClick={() => scrollBy(-360)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: WHITE,
              border: `1px solid ${DARK}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={18} color={DARK} />
          </button>
        </div>

        <div
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
          }}
        >
          <button
            aria-label="Scroll right"
            onClick={() => scrollBy(360)}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              background: WHITE,
              border: `1px solid ${DARK}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={18} color={DARK} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="overflow-x-auto no-scrollbar scroll-snap-x scroll-smooth"
          tabIndex={0}
          aria-label="Studios carousel"
          style={{ paddingBottom: 8 }}
        >
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "stretch",
              paddingLeft: 48,
              paddingRight: 48,
            }}
          >
            <AnimatePresence initial={false}>
              {items.map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.28 }}
                >
                  <motion.button
                    onClick={() => openEdit(s)}
                    whileHover={cardHover}
                    whileTap={{ scale: 0.995 }}
                    className="card-w"
                    style={{
                      flex: "0 0 auto",
                      borderRadius: 14,
                      overflow: "hidden",
                      background: WHITE,
                      border: `1px solid ${DARK}`,
                      padding: 0,
                      textAlign: "left",
                    }}
                    aria-label={`Edit ${s.name}`}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "5 / 3",
                        overflow: "hidden",
                        background: "#f0f0f0",
                      }}
                    >
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      {/* title overlay bottom - becomes DARK background when active, WHITE when inactive */}
                      <motion.div
                        animate={{
                          backgroundColor: s.active ? DARK : WHITE,
                          color: s.active ? WHITE : DARK,
                        }}
                        transition={{ duration: 0.18 }}
                        style={{
                          position: "absolute",
                          left: 10,
                          right: 10,
                          bottom: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: s.active ? "none" : `1px solid ${DARK}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div className="mt-3 w-full flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold truncate">
                              {s.name}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5">
                              {s.active ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div
                            className={`ml-2 w-3 h-3 rounded-full ${
                              s.active ? "bg-emerald-400" : "bg-slate-300"
                            }`}
                            aria-hidden
                          />
                        </div>
                      </motion.div>
                    </div>

                    <div
                      style={{
                        padding: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{ fontSize: 13, fontWeight: 600, color: DARK }}
                      />
                      <div style={{ fontSize: 12, color: DARK }} />
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* simple native-looking scrollbar retained; no drag icon */}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(editing || isAdding) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.52)",
                pointerEvents: "auto",
              }}
              onClick={() => closeModal()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="studio-title"
              className="modal"
              initial={modalMotion.initial}
              animate={modalMotion.animate}
              exit={modalMotion.exit}
              style={{
                width: "min(720px, 94vw)",
                background: WHITE,
                borderRadius: 14,
                padding: 20,
                border: `1px solid ${DARK}`,
                boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                zIndex: 100,
              }}
              onKeyDown={(e) =>
                trapFocus(
                  e.currentTarget as HTMLElement,
                  e as unknown as KeyboardEvent
                )
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: DARK }}>
                  {isAdding ? "Add" : "Edit"}
                </div>
                <div>
                  <button
                    ref={closeBtnRef}
                    onClick={() => closeModal()}
                    aria-label="Close"
                    style={{
                      width: 36,
                      height: 36,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: WHITE,
                      border: `1px solid ${DARK}`,
                      borderRadius: 8,
                    }}
                  >
                    <X size={16} color={DARK} />
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginTop: 16,
                }}
              >
                {/* Image column */}
                <div>
                  <div
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      overflow: "hidden",
                      border: `1px solid ${DARK}`,
                      aspectRatio: "5 / 3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f9f9f9",
                    }}
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{ color: DARK, fontSize: 13 }}>No image</div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 12,
                      alignItems: "center",
                    }}
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f =
                          e.target.files && e.target.files[0]
                            ? e.target.files[0]
                            : null;
                        setFormFile(f);
                      }}
                    />

                    <label
                      htmlFor="file-input"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: DARK,
                        color: WHITE,
                        cursor: "pointer",
                      }}
                    >
                      <ImageIcon size={14} />
                      <span style={{ fontWeight: 700, fontSize: 13 }}>
                        Upload
                      </span>
                    </label>

                    <input
                      placeholder="Paste image URL"
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        setPreviewUrl(e.target.value || null);
                        setFormFile(null);
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 10px",
                        borderRadius: 10,
                        border: `1px solid ${DARK}`,
                      }}
                    />
                  </div>
                </div>

                {/* Fields column */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
                    Title
                  </div>
                  <input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Name"
                    style={{
                      width: "100%",
                      marginTop: 8,
                      padding: "10px",
                      borderRadius: 10,
                      border: `1px solid ${DARK}`,
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 18,
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>
                      Status
                    </div>
                    <div
                      role="switch"
                      aria-checked={formActive}
                      onClick={() => setFormActive((s) => !s)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ")
                          setFormActive((s) => !s);
                      }}
                      style={{
                        width: 56,
                        height: 32,
                        padding: 4,
                        borderRadius: 999,
                        background: formActive ? DARK : WHITE,
                        border: `1px solid ${DARK}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: formActive ? "flex-end" : "flex-start",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 999,
                          background: formActive ? WHITE : DARK,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      justifyContent: "flex-end",
                      marginTop: 26,
                    }}
                  >
                    {!isAdding && (
                      <button
                        onClick={() => confirmDelete(editing as Studio)}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          background: WHITE,
                          color: DARK,
                          border: `1px solid ${DARK}`,
                          display: "inline-flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={14} />
                        <span style={{ fontWeight: 700 }}>Delete</span>
                      </button>
                    )}

                    {isAdding ? (
                      <button
                        disabled={!formTitle && !previewUrl}
                        onClick={() => handleAddStudio()}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          background: DARK,
                          color: WHITE,
                          border: "none",
                          fontWeight: 800,
                        }}
                      >
                        Add
                      </button>
                    ) : (
                      <button
                        disabled={!formTitle && !previewUrl}
                        onClick={() => handleSaveEdit()}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          background: DARK,
                          color: WHITE,
                          border: "none",
                          fontWeight: 800,
                        }}
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 70,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              style={{
                width: 420,
                background: WHITE,
                padding: 18,
                borderRadius: 12,
                border: `1px solid ${DARK}`,
                zIndex: 72,
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 15, color: DARK }}>
                Delete?
              </div>
              <div
                style={{
                  marginTop: 8,
                  color: DARK,
                  opacity: 0.8,
                  fontSize: 13,
                }}
              >{`Permanently delete "${showDeleteConfirm.name}"?`}</div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${DARK}`,
                    background: WHITE,
                    color: DARK,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConfirmed()}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "none",
                    background: DARK,
                    color: WHITE,
                    fontWeight: 800,
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

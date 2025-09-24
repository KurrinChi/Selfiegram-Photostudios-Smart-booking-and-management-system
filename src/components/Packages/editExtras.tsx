import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  Plus,
  Edit,
  Trash,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditConceptStudio from "../EditConceptStudio.tsx";

/* ---------- Soft palette (low contrast) ---------- */
const P = {
  dark: "#2b2b2b",
  surface: "#FAFAFA",
  border: "#E6E6E6",
  muted: "#6b7280",
  subtle: "#f3f4f6",
  accent: "#0ea5a4",
  danger: "#ef4444",
  warnBg: "#fff7ed",
  warnBorder: "#ffedd5",
  invalid: "#fee2e2",
  invalidBorder: "#fca5a5",
};

type AddonType = "single" | "multiple" | "spinner";

type Choice = {
  id: string;
  label: string;
  value: string | number;
  multiplier?: number;
  priceOverride?: number;
  default?: boolean;
};

type Addon = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  type: AddonType;
  defaultQty?: number;
  step?: number;
  maxQty?: number;
  spinnerMin?: number;
  spinnerMax?: number;
  choices?: Choice[];
  description?: string;
  createdAt: string;
};

const STORAGE_KEY = "admin_addons_v_spinner_ui";

function uid(prefix = "x") {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}
function currency(n: number) {
  return `₱${Number(n).toLocaleString()}`;
}

const toId = (v: unknown) => String(v);
const toStr = (v: unknown) => String(v);

const DEFAULT_BACKDROP_COLORS: Choice[] = [
  { id: uid("c"), label: "WHITE", value: "#f4f6f1", default: true },
  { id: uid("c"), label: "GRAY", value: "#cccbcb" },
  { id: uid("c"), label: "BLACK", value: "#272323" },
  { id: uid("c"), label: "PINK", value: "#facfd7" },
  { id: uid("c"), label: "BEIGE", value: "#cfb5a4" },
  { id: uid("c"), label: "LAVENDER", value: "#8d84be" },
];

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

/* ---------------- ConfirmDialog (reusable) ---------------- */
type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") {
        const active = document.activeElement;
        if (!active) return;
        const tag = (active as HTMLElement).tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          onConfirm();
        }
      }
    }
    if (open) {
      const prev = document.activeElement as HTMLElement | null;
      setTimeout(() => confirmRef.current?.focus(), 0);
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("keydown", onKey);
        prev?.focus?.();
      };
    }
    return;
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4">
      <div
        className="fixed inset-0"
        onClick={onCancel}
        aria-hidden
        style={{ background: "rgba(0,0,0,0.35)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 6 }}
        className="z-70 rounded-lg w-full max-w-md p-4 sm:p-5"
        style={{
          background: P.surface,
          border: `1px solid ${P.border}`,
          boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="flex items-start gap-3">
          <div style={{ marginTop: 2 }}>
            <AlertTriangle
              size={20}
              style={{ color: destructive ? P.danger : P.warnBorder }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              id="confirm-title"
              className="text-md font-semibold"
              style={{ color: P.dark }}
            >
              {title}
            </h3>
            {description && (
              <p className="text-sm mt-1" style={{ color: P.muted }}>
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded"
            style={{ border: `1px solid ${P.border}`, background: P.surface }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="px-3 py-2 rounded"
            style={{
              background: destructive ? P.danger : P.dark,
              color: P.surface,
              border: `1px solid ${P.border}`,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---------------- Main component ---------------- */
export default function EditExtras() {
  const [addons, setAddons] = useState<Addon[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Addon[];
    } catch {}
    return [
      {
        id: uid("addon"),
        name: "Extra 30 Minutes",
        price: 500,
        active: true,
        type: "single",
        description: "Extend session by 30 minutes.",
        createdAt: new Date().toISOString(),
      },
      {
        id: uid("addon"),
        name: "Props Package",
        price: 800,
        active: false,
        type: "multiple",
        defaultQty: 1,
        step: 1,
        maxQty: 10,
        description: "Add props to the shoot (per set).",
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addons));
    } catch {}
  }, [addons]);

  /* UI state */
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<string, number>
  >({});
  const [selectedSpinnerValues, setSelectedSpinnerValues] = useState<
    Record<string, string | number>
  >({});

  /* form + errors */
  const initialForm = {
    name: "",
    price: "0",
    type: "single" as AddonType,
    step: "1",
    spinnerMin: "1",
    spinnerMax: "5",
    defaultQty: "1",
    maxQty: "10",
    description: "",
    choicesRows: [] as Choice[],
  };
  const [form, setForm] = useState(() => ({ ...initialForm }));

  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    defaultQty?: string;
    step?: string;
    maxQty?: string;
    choices?: Record<string, string>;
  }>({});

  /* Confirm dialog state (delete only) */
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    targetId?: string | null;
    title?: string;
    description?: string;
  }>({ open: false });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return addons;
    return addons.filter((a) =>
      [a.name, a.description, a.type, ...(a.choices || []).map((c) => c.label)]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [addons, query]);

  /* helpers: spinner existence & whether current edit is the spinner */
  const existingSpinner = addons.find((a) => a.type === "spinner");
  const editingIsSpinner =
    editingId && toId(existingSpinner?.id) === toId(editingId);

  /* open add modal */
  function openAdd() {
    setEditingId(null);
    setForm({ ...initialForm });
    setErrors({});
    setIsModalOpen(true);
  }

  /* open edit modal immediately (no confirmation) */
  function openEdit(id: string) {
    const targetId = toId(id);
    const found = addons.find((x) => toId(x.id) === targetId);
    if (!found) return;
    if (found.active) return; // preserve previous behavior: don't edit active items
    setEditingId(targetId);
    setForm({
      name: found.name,
      price: String(found.price),
      type: found.type,
      step: String(found.step ?? 1),
      spinnerMin: String(found.spinnerMin ?? 1),
      spinnerMax: String(found.spinnerMax ?? 5),
      defaultQty: String(found.defaultQty ?? 1),
      maxQty: String(found.maxQty ?? 10),
      description: found.description ?? "",
      choicesRows:
        found.type === "spinner" &&
        (!found.choices || found.choices.length === 0)
          ? DEFAULT_BACKDROP_COLORS.map((c) => ({ ...c, id: uid("c") }))
          : (found.choices || []).map((c) => ({ ...c })),
    });
    setErrors({});
    setIsModalOpen(true);
  }

  /* request delete: show confirm dialog */
  function requestDelete(id: string) {
    const item = addons.find((a) => toId(a.id) === toId(id));
    if (!item) return;
    setConfirmState({
      open: true,
      targetId: id,
      title: `Delete "${item.name}"?`,
      description: "This action cannot be undone.",
    });
  }

  /* perform deletion after confirmation */
  function doDeleteConfirmed(id?: string | null) {
    setConfirmState({ open: false });
    if (!id) return;
    const tid = toId(id);
    setAddons((s) => s.filter((a) => toId(a.id) !== tid));
  }

  function closeConfirm() {
    setConfirmState({ open: false });
  }

  /* choice helpers */
  function addChoiceRow() {
    setForm((s) => ({
      ...s,
      choicesRows: [
        ...s.choicesRows,
        {
          id: uid("c"),
          label: "",
          value: "",
          multiplier: undefined,
          priceOverride: undefined,
          default: s.choicesRows.length === 0,
        },
      ],
    }));
  }
  function updateChoiceRow(id: string, patch: Partial<Choice>) {
    const tid = toId(id);
    setForm((s) => ({
      ...s,
      choicesRows: s.choicesRows.map((r) =>
        toId(r.id) === tid ? { ...r, ...patch } : r
      ),
    }));
    setTimeout(() => validateChoiceRow(id), 0);
  }
  function removeChoiceRow(id: string) {
    const tid = toId(id);
    setForm((s) => ({
      ...s,
      choicesRows: s.choicesRows.filter((r) => toId(r.id) !== tid),
    }));
    setErrors((e) => {
      const next = { ...e };
      if (next.choices) {
        delete next.choices[tid];
        if (Object.keys(next.choices).length === 0) delete next.choices;
      }
      return next;
    });
  }
  function moveChoiceRow(id: string, dir: "up" | "down") {
    const tid = toId(id);
    setForm((s) => {
      const rows = [...s.choicesRows];
      const i = rows.findIndex((r) => toId(r.id) === tid);
      if (i === -1) return s;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= rows.length) return s;
      const tmp = rows[j];
      rows[j] = rows[i];
      rows[i] = tmp;
      return { ...s, choicesRows: rows };
    });
  }

  /* ---------- Validation ---------- */

  function validateName() {
    const v = (form.name || "").trim();
    if (!v) {
      setErrors((e) => ({ ...e, name: "Name is required" }));
      return false;
    }
    setErrors((e) => {
      const next = { ...e };
      delete next.name;
      return next;
    });
    return true;
  }

  function validatePrice() {
    const v = form.price;
    const n = Number(v);
    if (v === "" || !Number.isFinite(n) || n < 0) {
      setErrors((e) => ({ ...e, price: "Enter a valid non-negative number" }));
      return false;
    }
    setErrors((e) => {
      const next = { ...e };
      delete next.price;
      return next;
    });
    return true;
  }

  function validateMultipleFields() {
    let ok = true;
    const stepNum = Number(form.step || 0);
    const defaultNum = Number(form.defaultQty || 0);
    const maxNum = Number(form.maxQty || 0);

    if (
      !Number.isFinite(stepNum) ||
      stepNum < 1 ||
      !Number.isInteger(stepNum)
    ) {
      setErrors((e) => ({ ...e, step: "Step must be an integer ≥ 1" }));
      ok = false;
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next.step;
        return next;
      });
    }

    if (!Number.isFinite(maxNum) || maxNum < 1 || !Number.isInteger(maxNum)) {
      setErrors((e) => ({ ...e, maxQty: "Max must be an integer ≥ 1" }));
      ok = false;
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next.maxQty;
        return next;
      });
    }

    if (
      !Number.isFinite(defaultNum) ||
      defaultNum < 1 ||
      !Number.isInteger(defaultNum)
    ) {
      setErrors((e) => ({
        ...e,
        defaultQty: "Default must be an integer ≥ 1",
      }));
      ok = false;
    } else if (Number.isFinite(maxNum) && defaultNum > maxNum) {
      setErrors((e) => ({
        ...e,
        defaultQty: "Default cannot be greater than Max",
      }));
      ok = false;
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next.defaultQty;
        return next;
      });
    }

    return ok;
  }

  function validateChoiceRow(id: string) {
    const tid = toId(id);
    const row = form.choicesRows.find((r) => toId(r.id) === tid);
    if (!row) {
      setErrors((e) => {
        const next = { ...e };
        if (next.choices) {
          delete next.choices[tid];
          if (Object.keys(next.choices).length === 0) delete next.choices;
        }
        return next;
      });
      return true;
    }

    const label = (row.label || "").trim();
    const value = String(row.value || "").trim();
    let msg = "";

    if (!label) msg = "Label required";
    else if (!value) msg = "Hex required (e.g. #aabbcc)";
    else if (!HEX_RE.test(value)) msg = "Hex must be in form #rrggbb";

    setErrors((e) => {
      const next = { ...e };
      next.choices = { ...(next.choices || {}) };
      if (msg) next.choices[tid] = msg;
      else delete next.choices[tid];
      if (next.choices && Object.keys(next.choices).length === 0)
        delete next.choices;
      return next;
    });

    return !msg;
  }

  function validateAll() {
    const checks: boolean[] = [];
    checks.push(validateName());
    checks.push(validatePrice());
    if (form.type === "multiple") {
      checks.push(validateMultipleFields());
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next.step;
        delete next.maxQty;
        delete next.defaultQty;
        return next;
      });
    }

    if (form.type === "spinner") {
      const results = form.choicesRows.map((r) => validateChoiceRow(r.id));
      checks.push(results.every(Boolean));
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next.choices;
        return next;
      });
    }

    if (form.type === "spinner") {
      const spinner = addons.find((a) => a.type === "spinner");
      if (spinner && (!editingId || toId(spinner.id) !== toId(editingId))) {
        checks.push(false);
      }
    }

    return checks.every(Boolean);
  }

  /* ---------- Submit ---------- */
  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!validateAll()) {
      return;
    }

    const priceNum = Number(form.price || 0);
    if (!Number.isFinite(priceNum)) return alert("Price must be numeric");

    const spinner = addons.find((a) => a.type === "spinner");
    if (form.type === "spinner") {
      if (!editingId && spinner) {
        return alert(
          "A backdrop (spinner) add-on already exists. There can only be one backdrop add-on."
        );
      }
      if (editingId && spinner && toId(spinner.id) !== toId(editingId)) {
        return alert(
          "A backdrop (spinner) add-on already exists. You cannot change this add-on to a spinner while another spinner exists."
        );
      }
    }

    const base: Partial<Addon> = {
      name: form.name.trim(),
      price: priceNum,
      type: form.type,
      description: form.description.trim(),
    };

    if (form.type === "spinner") {
      const choicesRaw = form.choicesRows || [];
      const normalized: Choice[] = choicesRaw
        .map((r) => ({
          id: r.id || uid("c"),
          label: (r.label || String(r.value || "")).trim(),
          value: String(r.value || "").trim(),
          multiplier:
            r.multiplier !== undefined && r.multiplier !== null
              ? Number(r.multiplier)
              : undefined,
          priceOverride:
            r.priceOverride !== undefined && r.priceOverride !== null
              ? Number(r.priceOverride)
              : undefined,
          default: !!r.default,
        }))
        .filter((r) => {
          const v = String(r.value).trim();
          return r.label !== "" && v !== "" && HEX_RE.test(v);
        });

      base.choices =
        normalized.length > 0
          ? normalized
          : DEFAULT_BACKDROP_COLORS.map((c) => ({ ...c, id: uid("c") }));

      base.spinnerMin = undefined;
      base.spinnerMax = undefined;
      base.defaultQty = undefined;
      base.step = undefined;
      base.maxQty = undefined;
    } else if (form.type === "multiple") {
      base.defaultQty = Math.max(1, Number(form.defaultQty || 1));
      base.step = Math.max(1, Number(form.step || 1));
      base.maxQty = Math.max(1, Number(form.maxQty || 1));
      if ((base.defaultQty ?? 1) > (base.maxQty ?? 1))
        base.defaultQty = base.maxQty;
      base.spinnerMin = undefined;
      base.spinnerMax = undefined;
      base.choices = undefined;
    } else {
      base.defaultQty = undefined;
      base.step = undefined;
      base.maxQty = undefined;
      base.spinnerMin = undefined;
      base.spinnerMax = undefined;
      base.choices = undefined;
    }

    if (editingId) {
      const tid = toId(editingId);
      setAddons((s) =>
        s.map((a) => (toId(a.id) === tid ? ({ ...a, ...base } as Addon) : a))
      );
    } else {
      const newOne: Addon = {
        ...(base as Addon),
        id: uid("addon"),
        active: true,
        createdAt: new Date().toISOString(),
      };
      setAddons((s) => [newOne, ...s]);
    }

    closeModal();
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ ...initialForm });
    setErrors({});
  }

  function toggleActive(id: string) {
    const tid = toId(id);
    setAddons((s) =>
      s.map((a) => (toId(a.id) === tid ? { ...a, active: !a.active } : a))
    );
  }

  useEffect(() => {
    const qUpdate: Record<string, number> = { ...selectedQuantities };
    const sUpdate: Record<string, string | number> = {
      ...selectedSpinnerValues,
    };
    let changed = false;
    for (const a of addons) {
      const aid = toId(a.id);
      if (a.type === "multiple") {
        if (!(aid in qUpdate)) {
          qUpdate[aid] = a.defaultQty ?? 1;
          changed = true;
        } else {
          const max = a.maxQty ?? Number.POSITIVE_INFINITY;
          const step = a.step ?? 1;
          let val = Math.max(1, qUpdate[aid]);
          if (val > max) val = max;
          val = Math.round(val / step) * step || step;
          if (qUpdate[aid] !== val) {
            qUpdate[aid] = val;
            changed = true;
          }
        }
      } else if (a.type === "spinner") {
        if (!(aid in sUpdate)) {
          if (a.choices && a.choices.length > 0) {
            const def = a.choices.find((c) => !!c.default) ?? a.choices[0];
            sUpdate[aid] = def?.value ?? def?.label ?? a.choices[0].value;
          } else {
            sUpdate[aid] = a.spinnerMin ?? 1;
          }
          changed = true;
        } else {
          if (a.choices && a.choices.length > 0) {
            const cur = toStr(sUpdate[aid]);
            const found = a.choices.some(
              (c) => toStr(c.value) === cur || toStr(c.label) === cur
            );
            if (!found) {
              const def = a.choices.find((c) => !!c.default) ?? a.choices[0];
              sUpdate[aid] = def?.value ?? def?.label ?? a.choices[0].value;
              changed = true;
            }
          } else {
            const curNum = Number(sUpdate[aid]);
            const min = a.spinnerMin ?? 1;
            const max = a.spinnerMax ?? 5;
            if (!Number.isFinite(curNum) || curNum < min || curNum > max) {
              sUpdate[aid] = min;
              changed = true;
            }
          }
        }
      }
    }
    if (changed) {
      setSelectedQuantities(qUpdate);
      setSelectedSpinnerValues(sUpdate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addons]);

  /* UI helpers to render invalid border */
  const inputBorder = (field?: string) =>
    field && (errors as any)[field]
      ? { border: `1px solid ${P.invalidBorder}`, background: P.invalid }
      : { border: `1px solid ${P.border}`, background: P.surface };

  /* ---------- Render ---------- */
  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto min-h-screen flex flex-col gap-4">
        <div className="flex-[99]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h1
                className="text-xl sm:text-2xl font-semibold ml-2 pl-12 sm:pl-0"
                style={{ color: "#2b2b2b" }} // replacing P.dark with hex
              >
                Add-Ons / Extras
              </h1>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-2 pt-5 sm:pt-0">
              <input
                className="rounded px-3 py-2 flex-1 sm:flex-none w-full sm:w-72"
                placeholder="Search name, type or choices..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  border: `1px solid ${P.border}`,
                  background: P.surface,
                  color: P.dark,
                }}
              />

              <button
                onClick={openAdd}
                className="inline-flex items-center gap-2 px-4 py-2 rounded"
                style={{
                  border: `1px solid ${P.border}`,
                  background: P.surface,
                  color: P.dark,
                }}
                aria-haspopup="dialog"
              >
                <Plus size={16} />{" "}
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            {filtered.length === 0 ? (
              <div
                style={{
                  background: P.surface,
                  border: `1px solid ${P.border}`,
                  color: P.muted,
                }}
                className="p-4 rounded"
              >
                No add-ons found.
              </div>
            ) : (
              filtered.map((item) => {
                const isActive = !!item.active;
                const cardBg = isActive ? P.dark : P.surface;
                const cardColor = isActive ? P.surface : P.dark;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    layout
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded p-3 gap-3 sm:gap-0"
                    style={{
                      border: `1px solid ${P.border}`,
                      background: cardBg,
                      color: cardColor,
                    }}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-medium truncate"
                          style={{ color: cardColor }}
                        >
                          {item.name}
                        </div>
                        <div
                          className="text-sm truncate"
                          style={{ color: isActive ? P.subtle : P.muted }}
                        >
                          {item.type === "spinner"
                            ? "Backdrop (color selector)"
                            : item.type === "multiple"
                            ? "Per-unit"
                            : "One-time"}{" "}
                          • {currency(item.price)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.type === "spinner" && (
                        <div
                          style={{
                            background: P.warnBg,
                            border: `1px solid ${P.warnBorder}`,
                            padding: "4px 8px",
                            borderRadius: 999,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: P.dark,
                            fontSize: 12,
                          }}
                          title="This add-on is the backdrop selector"
                        >
                          <Check size={12} />
                          Backdrop
                        </div>
                      )}

                      <button
                        onClick={() => toggleActive(item.id)}
                        aria-pressed={isActive}
                        title={isActive ? "Active" : "Inactive"}
                        className="relative inline-flex items-center rounded-full p-2"
                        style={{
                          width: 56,
                          height: 34,
                          background: isActive ? "#333" : P.subtle,
                          border: `1px solid ${P.border}`,
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            display: "block",
                            width: 26,
                            height: 26,
                            borderRadius: 9999,
                            transform: isActive
                              ? "translateX(22px)"
                              : "translateX(0px)",
                            background: isActive ? "#FAFAFA" : "#9ca3af",
                            transition:
                              "transform 180ms cubic-bezier(.2,.9,.2,1), background 180ms",
                          }}
                        />
                      </button>

                      <button
                        onClick={() => {
                          if (!item.active) openEdit(item.id);
                        }}
                        title={
                          item.active ? "Cannot edit while active" : "Edit"
                        }
                        disabled={item.active}
                        aria-disabled={item.active}
                        className="p-2 rounded"
                        style={{
                          color: P.dark,
                          opacity: item.active ? 0.45 : 1,
                          cursor: item.active ? "not-allowed" : "pointer",
                        }}
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => requestDelete(item.id)}
                        title="Delete"
                        className="p-2 rounded"
                        style={{ color: P.danger }}
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-[1] min-w-0 overflow-x-auto">
          <EditConceptStudio />
        </div>
      </div>

      {/* Modal (responsive) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4"
            style={{ paddingTop: 48 }}
          >
            <div
              className="fixed inset-0"
              onClick={closeModal}
              style={{ background: "rgba(0,0,0,0.32)" }}
              aria-hidden
            />

            <motion.div
              layout
              initial={{ scale: 0.98, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              style={{
                background: P.surface,
                border: `1px solid ${P.border}`,
                color: P.dark,
              }}
              className="relative rounded-lg w-full sm:max-w-3xl max-h-[90vh] overflow-auto z-10 shadow-lg"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <div
                  style={{ borderBottom: `1px solid ${P.border}` }}
                  className="p-4 sm:p-5 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm"
                >
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: P.dark }}
                  >
                    {editingId ? "Edit Add-On" : "Create Add-On"}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-3 py-1 rounded"
                      style={{
                        border: `1px solid ${P.border}`,
                        background: P.surface,
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium"
                      style={{ color: P.dark }}
                    >
                      Name
                    </label>
                    <input
                      className="w-full rounded px-3 py-2"
                      value={form.name}
                      onChange={(e) => {
                        setForm((s) => ({ ...s, name: e.target.value }));
                        setTimeout(validateName, 0);
                      }}
                      required
                      aria-invalid={!!errors.name}
                      style={{
                        ...inputBorder("name"),
                        color: P.dark,
                      }}
                    />
                    {errors.name && (
                      <div className="text-xs mt-1" style={{ color: P.danger }}>
                        {errors.name}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium"
                        style={{ color: P.dark }}
                      >
                        Price (PHP)
                      </label>
                      <input
                        type="number"
                        min={0}
                        className="w-full rounded px-3 py-2"
                        value={form.price}
                        onChange={(e) => {
                          setForm((s) => ({ ...s, price: e.target.value }));
                          setTimeout(validatePrice, 0);
                        }}
                        required
                        aria-invalid={!!errors.price}
                        style={{
                          ...inputBorder("price"),
                          color: P.dark,
                        }}
                      />
                      {errors.price && (
                        <div
                          className="text-xs mt-1"
                          style={{ color: P.danger }}
                        >
                          {errors.price}
                        </div>
                      )}
                      <p className="text-xs mt-1" style={{ color: P.muted }}>
                        Base price / per-unit depending on type
                      </p>
                    </div>

                    <div>
                      <label
                        className="block text-sm font-medium"
                        style={{ color: P.dark }}
                      >
                        Type
                      </label>

                      <select
                        value={form.type}
                        onChange={(e) => {
                          const newType = e.target.value as AddonType;
                          const spinner = addons.find(
                            (a) => a.type === "spinner"
                          );
                          if (newType === "spinner" && !editingId && spinner)
                            return;
                          if (
                            newType === "spinner" &&
                            editingId &&
                            spinner &&
                            toId(spinner.id) !== toId(editingId)
                          )
                            return;

                          setForm((s) => ({
                            ...s,
                            type: newType,
                            choicesRows:
                              newType === "spinner" && !editingId && !spinner
                                ? DEFAULT_BACKDROP_COLORS.map((c) => ({
                                    ...c,
                                    id: uid("c"),
                                  }))
                                : s.choicesRows,
                          }));

                          setTimeout(() => {
                            if (newType !== "multiple") {
                              setErrors((e) => {
                                const next = { ...e };
                                delete next.step;
                                delete next.maxQty;
                                delete next.defaultQty;
                                return next;
                              });
                            }
                            if (newType !== "spinner") {
                              setErrors((e) => {
                                const next = { ...e };
                                delete next.choices;
                                return next;
                              });
                            }
                          }, 0);
                        }}
                        className="w-full rounded px-3 py-2"
                        style={{
                          border: `1px solid ${P.border}`,
                          background: P.surface,
                          color: P.dark,
                        }}
                      >
                        <option value="single">single — One-time fee</option>
                        <option value="multiple">
                          multiple — Per-unit / quantity
                        </option>
                        <option
                          value="spinner"
                          disabled={!!existingSpinner && !editingIsSpinner}
                        >
                          spinner — Backdrop color selector (only one)
                        </option>
                      </select>

                      {existingSpinner &&
                        !editingIsSpinner &&
                        form.type !== "spinner" && (
                          <div className="mt-2 flex items-center gap-3">
                            <div
                              style={{
                                background: P.warnBg,
                                border: `1px solid ${P.warnBorder}`,
                                padding: "6px 8px",
                                borderRadius: 8,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <AlertTriangle size={14} />
                              <div style={{ fontSize: 13, color: P.dark }}>
                                Backdrop exists — edit it instead.
                              </div>
                            </div>
                            <div className="ml-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  if (existingSpinner)
                                    openEdit(existingSpinner.id);
                                }}
                                className="px-3 py-1 rounded"
                                style={{
                                  border: `1px solid ${P.border}`,
                                  background: P.surface,
                                }}
                              >
                                Edit Backdrop
                              </button>
                            </div>
                          </div>
                        )}

                      <p className="text-xs mt-1" style={{ color: P.muted }}>
                        {form.type === "single"
                          ? "One-time fee"
                          : form.type === "multiple"
                          ? "Per-unit (use step & max)"
                          : "Backdrop color selector — only one backdrop allowed"}
                      </p>
                    </div>
                  </div>

                  {form.type === "multiple" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium"
                          style={{ color: P.dark }}
                        >
                          Default Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded px-3 py-2"
                          value={form.defaultQty}
                          onChange={(e) => {
                            setForm((s) => ({
                              ...s,
                              defaultQty: e.target.value,
                            }));
                            setTimeout(validateMultipleFields, 0);
                          }}
                          aria-invalid={!!errors.defaultQty}
                          style={{
                            ...(errors.defaultQty
                              ? {
                                  border: `1px solid ${P.invalidBorder}`,
                                  background: P.invalid,
                                }
                              : {
                                  border: `1px solid ${P.border}`,
                                  background: P.surface,
                                }),
                            color: P.dark,
                          }}
                        />
                        {errors.defaultQty && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: P.danger }}
                          >
                            {errors.defaultQty}
                          </div>
                        )}
                        <p className="text-xs" style={{ color: P.muted }}>
                          Initial qty
                        </p>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium"
                          style={{ color: P.dark }}
                        >
                          Step
                        </label>
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded px-3 py-2"
                          value={form.step}
                          onChange={(e) => {
                            setForm((s) => ({ ...s, step: e.target.value }));
                            setTimeout(validateMultipleFields, 0);
                          }}
                          aria-invalid={!!errors.step}
                          style={{
                            ...(errors.step
                              ? {
                                  border: `1px solid ${P.invalidBorder}`,
                                  background: P.invalid,
                                }
                              : {
                                  border: `1px solid ${P.border}`,
                                  background: P.surface,
                                }),
                            color: P.dark,
                          }}
                        />
                        {errors.step && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: P.danger }}
                          >
                            {errors.step}
                          </div>
                        )}
                        <p className="text-xs" style={{ color: P.muted }}>
                          Quantity increments
                        </p>
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium"
                          style={{ color: P.dark }}
                        >
                          Max Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded px-3 py-2"
                          value={form.maxQty}
                          onChange={(e) => {
                            setForm((s) => ({ ...s, maxQty: e.target.value }));
                            setTimeout(validateMultipleFields, 0);
                          }}
                          aria-invalid={!!errors.maxQty}
                          style={{
                            ...(errors.maxQty
                              ? {
                                  border: `1px solid ${P.invalidBorder}`,
                                  background: P.invalid,
                                }
                              : {
                                  border: `1px solid ${P.border}`,
                                  background: P.surface,
                                }),
                            color: P.dark,
                          }}
                        />
                        {errors.maxQty && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: P.danger }}
                          >
                            {errors.maxQty}
                          </div>
                        )}
                        <p className="text-xs" style={{ color: P.muted }}>
                          Maximum purchasable
                        </p>
                      </div>
                    </div>
                  )}

                  {form.type === "spinner" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label
                          className="block text-sm font-medium"
                          style={{ color: P.dark }}
                        >
                          Backdrop Colors (hex)
                        </label>
                        <div className="text-xs" style={{ color: P.muted }}>
                          Add or edit hex values. Use color picker or type a
                          hex.
                        </div>
                      </div>

                      {existingSpinner && !editingIsSpinner && (
                        <div
                          style={{
                            background: P.warnBg,
                            border: `1px solid ${P.warnBorder}`,
                            padding: 12,
                            borderRadius: 8,
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <AlertTriangle />
                          <div style={{ fontSize: 14, color: P.dark }}>
                            A Backdrop already exists. Edit the existing
                            backdrop if you want to change colors.
                          </div>
                          <div
                            style={{
                              marginLeft: "auto",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (existingSpinner)
                                  openEdit(existingSpinner.id);
                              }}
                              className="px-3 py-1 rounded"
                              style={{
                                border: `1px solid ${P.border}`,
                                background: P.surface,
                              }}
                            >
                              Edit Backdrop
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 space-y-2">
                        <AnimatePresence>
                          {form.choicesRows.map((row, idx) => {
                            const curHex =
                              row.value && String(row.value).startsWith("#")
                                ? String(row.value)
                                : "#ffffff";
                            const rowErr = errors.choices?.[toId(row.id)];
                            return (
                              <motion.div
                                key={row.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                layout
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded p-2"
                                style={{
                                  border: `1px solid ${P.border}`,
                                  background: P.surface,
                                }}
                              >
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <input
                                    aria-label={`Label ${idx + 1}`}
                                    value={row.label}
                                    onChange={(e) =>
                                      updateChoiceRow(row.id, {
                                        label: e.target.value,
                                      })
                                    }
                                    placeholder="Label (e.g. WHITE)"
                                    className="w-full sm:w-28 rounded px-2 py-1"
                                    style={{
                                      border: `1px solid ${
                                        rowErr ? P.invalidBorder : P.border
                                      }`,
                                    }}
                                  />
                                  <input
                                    aria-label={`Hex value ${idx + 1}`}
                                    value={toStr(row.value)}
                                    onChange={(e) =>
                                      updateChoiceRow(row.id, {
                                        value: e.target.value,
                                      })
                                    }
                                    placeholder="#rrggbb"
                                    className="w-full sm:w-28 rounded px-2 py-1"
                                    style={{
                                      border: `1px solid ${
                                        rowErr ? P.invalidBorder : P.border
                                      }`,
                                    }}
                                  />
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <input
                                    type="color"
                                    aria-label={`Pick color ${idx + 1}`}
                                    value={curHex}
                                    onChange={(e) =>
                                      updateChoiceRow(row.id, {
                                        value: e.target.value,
                                        label:
                                          row.label ||
                                          e.target.value.toUpperCase(),
                                      })
                                    }
                                    className="w-12 h-8 rounded border"
                                    style={{ border: `1px solid ${P.border}` }}
                                  />

                                  <div
                                    className="flex items-center gap-2 ml-auto sm:ml-0"
                                    style={{ minWidth: 160 }}
                                  >
                                    <div className="hidden sm:flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          moveChoiceRow(row.id, "up")
                                        }
                                        className="p-1 rounded"
                                        title="Move up"
                                      >
                                        <ArrowUp size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          moveChoiceRow(row.id, "down")
                                        }
                                        className="p-1 rounded"
                                        title="Move down"
                                      >
                                        <ArrowDown size={14} />
                                      </button>
                                    </div>

                                    <label
                                      className="flex items-center gap-1 text-sm"
                                      style={{ color: P.muted }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={!!row.default}
                                        onChange={(e) =>
                                          updateChoiceRow(row.id, {
                                            default: e.target.checked
                                              ? true
                                              : false,
                                          })
                                        }
                                        onClick={() => {
                                          setForm((s) => ({
                                            ...s,
                                            choicesRows: s.choicesRows.map(
                                              (r) => ({
                                                ...r,
                                                default:
                                                  toId(r.id) === toId(row.id),
                                              })
                                            ),
                                          }));
                                        }}
                                      />
                                      <span className="text-xs">default</span>
                                    </label>

                                    <div
                                      className="w-8 h-6 rounded border"
                                      title={String(row.value)}
                                      style={{
                                        background:
                                          String(row.value) || "#ffffff",
                                        border: `1px solid ${P.border}`,
                                      }}
                                    />

                                    <button
                                      type="button"
                                      onClick={() => removeChoiceRow(row.id)}
                                      className="px-2 py-1 rounded"
                                      style={{ color: P.danger }}
                                      title="Remove color"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>

                                {rowErr && (
                                  <div
                                    className="text-xs mt-1"
                                    style={{ color: P.danger }}
                                  >
                                    {rowErr}
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>

                        <div>
                          <button
                            type="button"
                            onClick={addChoiceRow}
                            className="px-3 py-2 rounded w-full sm:w-auto"
                            style={{
                              border: `1px solid ${P.border}`,
                              background: P.surface,
                            }}
                          >
                            + Add color
                          </button>
                        </div>
                        <p className="text-xs mt-1" style={{ color: P.muted }}>
                          Tip: use the color picker to choose hex values
                          quickly.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      className="block text-sm font-medium"
                      style={{ color: P.dark }}
                    >
                      Description (optional)
                    </label>
                    <textarea
                      className="w-full rounded px-3 py-2"
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, description: e.target.value }))
                      }
                      style={{
                        border: `1px solid ${P.border}`,
                        background: P.surface,
                        color: P.dark,
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{ borderTop: `1px solid ${P.border}` }}
                  className="p-4 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center justify-end gap-2"
                >
                  <div className="w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded w-full sm:w-auto"
                      style={{
                        border: `1px solid ${P.border}`,
                        background: P.surface,
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="w-full sm:w-auto">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-4 py-2 rounded w-full sm:w-auto"
                      style={{ background: P.dark, color: P.surface }}
                      disabled={
                        form.type === "spinner" &&
                        !!existingSpinner &&
                        !editingIsSpinner
                      }
                    >
                      {form.type === "spinner" &&
                      !!existingSpinner &&
                      !editingIsSpinner
                        ? "Backdrop Exists"
                        : editingId
                        ? "Save Changes"
                        : "Create Add-On"}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm dialog (delete only) */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel="Delete"
        destructive
        onCancel={closeConfirm}
        onConfirm={() => doDeleteConfirmed(confirmState.targetId ?? null)}
      />
    </AdminLayout>
  );
}

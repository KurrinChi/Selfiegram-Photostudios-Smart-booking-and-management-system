import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  Plus,
  Edit,
  Trash,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
//import EditConceptStudio from "../EditConceptStudio.tsx";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { toast } from "react-toastify";
import CenteredLoader from "../CenteredLoader";

const API_URL = import.meta.env.VITE_API_URL;

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

type AddonType = "single" | "multiple" | "dropdown";

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
  min_quantity: number;
  max_quantity: number;
  choices?: Choice[];
  description?: string;
  createdAt: string;
};



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

export default function EditExtras() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch add-ons from backend instead of localStorage
  const fetchAddons = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/package-add-ons`);
      if (!res.ok) throw new Error("Failed to fetch add-ons");

      const data = await res.json();

      // Adapt backend fields → frontend shape if necessary
      const mapped = data.map((a: any) => ({
        id: a.addOnID, // from DB
        name: a.addOn,
        price: parseFloat(a.addOnPrice),
        type: a.type,
        description: a.description,
        active: a.active ?? true,
        min_quantity: a.min_quantity,
        step: a.step,
        max_quantity: a.max_quantity,
        createdAt: a.created_at,
      }));

      setAddons(mapped);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false); // ✅ stop loading no matter what
    }
  };

  useEffect(() => {
    fetchAddons(); // ✅ now referencing the shared function
  }, []);

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

    min_quantity: "1",
    max_quantity: "10",
    description: "",
    choicesRows: [] as Choice[],
  };

  const [form, setForm] = useState(() => ({ ...initialForm }));

  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    min_quantity?: string;
    max_quantity?: string;
    choices?: Record<string, string>;
  }>({});

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

  const existingSpinner = addons.find((a) => a.type === "dropdown");
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
    setEditingId(targetId);
    setForm({
      name: found.name,
      price: String(found.price),
      type: found.type,
      min_quantity: String(found.min_quantity ?? 1),
      max_quantity: String(found.max_quantity ?? 10),
      description: found.description ?? "",
      choicesRows:
        found.type === "dropdown" &&
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
  async function doDeleteConfirmed(id?: string | null) {
    setConfirmState({ open: false });
    if (!id) return;

    const tid = toId(id);

    try {
      // API request
      const res = await fetchWithAuth(`${API_URL}/api/admin/package-add-ons/${tid}/delete`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete add-on");
      }

      // Update state only on success
      setAddons((s) => s.filter((a) => toId(a.id) !== tid));
      toast.success("Add-on deleted successfully!");

      fetchAddons();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete add-on. Please try again.");
    }
  }

  function closeConfirm() {
    setConfirmState({ open: false });
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
    const defaultNum = Number(form.min_quantity || 0);
    const maxNum = Number(form.max_quantity || 0);

    if (!Number.isFinite(maxNum) || maxNum < 1 || !Number.isInteger(maxNum)) {
      setErrors((e) => ({ ...e, max_quantity: "Max must be an integer ≥ 1" }));
      ok = false;
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next.max_quantity;
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
        min_quantity: "Default must be an integer ≥ 1",
      }));
      ok = false;
    } else if (Number.isFinite(maxNum) && defaultNum > maxNum) {
      setErrors((e) => ({
        ...e,
        min_quantity: "Default cannot be greater than Max",
      }));
      ok = false;
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next.min_quantity;
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
        delete next.max_quantity;
        delete next.min_quantity;
        return next;
      });
    }

    if (form.type === "dropdown") {
      const results = form.choicesRows.map((r) => validateChoiceRow(r.id));
      checks.push(results.every(Boolean));
    } else {
      setErrors((e) => {
        const next = { ...e };
        delete next.choices;
        return next;
      });
    }

    if (form.type === "dropdown") {
      const spinner = addons.find((a) => a.type === "dropdown");
      if (spinner && (!editingId || toId(spinner.id) !== toId(editingId))) {
        checks.push(false);
      }
    }

    return checks.every(Boolean);
  }

  //submittt
  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!validateAll()) return;

    const priceNum = Number(form.price || 0);
    if (!Number.isFinite(priceNum)) return alert("Price must be numeric");

    // check spinner uniqueness
    const spinner = addons.find((a) => a.type === "dropdown");
    if (form.type === "dropdown") {
      if (!editingId && spinner) {
        return toast.error(
          "A backdrop (spinner) add-on already exists. There can only be one backdrop add-on."
        );
      }
      if (editingId && spinner && toId(spinner.id) !== toId(editingId)) {
        return toast.error(
          "A backdrop (spinner) add-on already exists. You cannot change this add-on to a spinner while another spinner exists."
        );
      }
    }

    // prepare payload for API
    const payload = {
      addOn: form.name.trim(),
      addOnPrice: priceNum,
      type:
        form.type === "dropdown"
          ? "spinner"
          : form.type === "multiple"
            ? "multiple"
            : "single",
      min_quantity: form.type === "multiple" ? Number(form.min_quantity) : 1,
      max_quantity: form.type === "multiple" ? Number(form.max_quantity) : 1,
    };

    try {
      let res: Response;
      let saved: any;

      if (editingId) {
        // update existing
        const tid = toId(editingId);
        res = await fetchWithAuth(`${API_URL}/api/admin/package-add-ons/${tid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.message || "Update failed");
          return;
        }
        saved = await res.json();

        setAddons((s) =>
          s.map((a) => (toId(a.id) === tid ? { ...a, ...saved.addon } : a))
        );

        toast.success(saved.message); // ✅ message from backend
      } else {
        // create new
        res = await fetchWithAuth(`${API_URL}/api/admin/package-add-ons/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.message || "Create failed");
          return;
        }

        saved = await res.json();

        setAddons((s) => [saved.addon, ...s]);

        toast.success(saved.message); // ✅ message from backend
      }

      fetchAddons();
      closeModal();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while saving add-on.");
    }
  }


  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ ...initialForm });
    setErrors({});
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
          qUpdate[aid] = a.min_quantity ?? 1;
          changed = true;
        } else {
          let val = Math.max(1, qUpdate[aid]);
          if (qUpdate[aid] !== val) {
            qUpdate[aid] = val;
            changed = true;
          }
        }
      } else if (a.type === "dropdown") {
        if (!(aid in sUpdate)) {
          if (a.choices && a.choices.length > 0) {
            const def = a.choices.find((c) => !!c.default) ?? a.choices[0];
            sUpdate[aid] = def?.value ?? def?.label ?? a.choices[0].value;
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
                style={{ color: "#2b2b2b" }}
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
            {loading ? (
              <div
                style={{
                  background: P.surface,
                  border: `1px solid ${P.border}`,
                  color: P.muted,
                }}
                className="p-4 rounded text-center"
              >
                <CenteredLoader message="Loading extras..." />
              </div>
            ) : filtered.length === 0 ? (
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
              filtered.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  layout
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded p-3 gap-3 sm:gap-0"
                  style={{
                    border: `1px solid ${P.border}`,
                    background: P.surface,
                    color: P.dark,
                  }}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <div
                        className="font-medium truncate"
                        style={{ color: P.dark }}
                      >
                        {item.name}
                      </div>
                      <div
                        className="text-sm truncate"
                        style={{ color: P.muted }}
                      >
                        {item.type === "dropdown"
                          ? "Backdrop (color selector)"
                          : item.type === "multiple"
                            ? "Per-unit"
                            : "One-time"}{" "}
                        • {currency(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.type === "dropdown" && (
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
                      type="button"
                      onClick={() => openEdit(item.id)}
                      title="Edit"
                      className="p-2 rounded"
                      style={{ color: P.dark }}
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
              ))
            )}
          </div>
        </div>
        <div className="flex-[1] min-w-0 overflow-x-auto">
          {/*<EditConceptStudio />*/}
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
                            (a) => a.type === "dropdown"
                          );
                          if (newType === "dropdown" && !editingId && spinner)
                            return;
                          if (
                            newType === "dropdown" &&
                            editingId &&
                            spinner &&
                            toId(spinner.id) !== toId(editingId)
                          )
                            return;

                          setForm((s) => ({
                            ...s,
                            type: newType,
                            choicesRows:
                              newType === "dropdown" && !editingId && !spinner
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
                                delete next.max_quantity;
                                delete next.min_quantity;
                                return next;
                              });
                            }
                            if (newType !== "dropdown") {
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
                          value="dropdown"
                          disabled={!!existingSpinner && !editingIsSpinner}
                        >
                          spinner — Backdrop color selector (only one)
                        </option>
                      </select>



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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          className="block text-sm font-medium"
                          style={{ color: P.dark }}
                        >
                          Minimum Quantity
                        </label>
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded px-3 py-2"
                          value={form.min_quantity}
                          onChange={(e) => {
                            setForm((s) => ({
                              ...s,
                              min_quantity: e.target.value,
                            }));
                            setTimeout(validateMultipleFields, 0);
                          }}
                          aria-invalid={!!errors.min_quantity}
                          style={{
                            ...(errors.min_quantity
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
                        {errors.min_quantity && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: P.danger }}
                          >
                            {errors.min_quantity}
                          </div>
                        )}
                        <p className="text-xs" style={{ color: P.muted }}>
                          Initial quantity
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
                          value={form.max_quantity}
                          onChange={(e) => {
                            setForm((s) => ({ ...s, max_quantity: e.target.value }));
                            setTimeout(validateMultipleFields, 0);
                          }}
                          aria-invalid={!!errors.max_quantity}
                          style={{
                            ...(errors.max_quantity
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
                        {errors.max_quantity && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: P.danger }}
                          >
                            {errors.max_quantity}
                          </div>
                        )}
                        <p className="text-xs" style={{ color: P.muted }}>
                          Maximum purchasable
                        </p>
                      </div>
                    </div>
                  )}

                  {form.type === "dropdown" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label
                          className="block text-sm font-medium"
                          style={{ color: P.dark }}
                        >
                          Backdrop Colors (hex)
                        </label>
                        <div className="text-xs" style={{ color: P.muted }}>
                          Predefined hex values (view only).
                        </div>
                      </div>

                      <div className="mt-2">
                        <AnimatePresence>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {form.choicesRows.map((row) => {
                              const curHex =
                                row.value && String(row.value).startsWith("#")
                                  ? String(row.value)
                                  : "#ffffff";
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
                                      disabled
                                      value={row.label}
                                      placeholder="Label"
                                      className="w-full sm:w-28 rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                                      style={{
                                        border: `1px solid ${P.border}`,
                                        color: P.dark,
                                      }}
                                    />
                                    <input
                                      disabled
                                      value={row.value}
                                      placeholder="#rrggbb"
                                      className="w-full sm:w-28 rounded px-2 py-1 bg-gray-100 cursor-not-allowed"
                                      style={{
                                        border: `1px solid ${P.border}`,
                                        color: P.dark,
                                      }}
                                    />
                                  </div>

                                  <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <div
                                      className="w-8 h-6 rounded border"
                                      title={String(row.value)}
                                      style={{
                                        background: curHex,
                                        border: `1px solid ${P.border}`,
                                      }}
                                    />
                                    {row.default && (
                                      <span
                                        className="text-xs px-2 py-1 rounded"
                                        style={{
                                          background: P.surface,
                                          border: `1px solid ${P.border}`,
                                          color: P.muted,
                                        }}
                                      >
                                        Default
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </AnimatePresence>
                      </div>

                    </div>
                  )}

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
                        form.type === "dropdown" &&
                        !!existingSpinner &&
                        !editingIsSpinner
                      }
                    >
                      {form.type === "dropdown" &&
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
        confirmLabel="Delete"
        destructive
        onCancel={closeConfirm}
        onConfirm={() => doDeleteConfirmed(confirmState.targetId ?? null)}
      />
    </AdminLayout>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { isToday, isSameDay, startOfDay } from "date-fns";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import type { Tag } from "../../types";
import type { SelectedAddon } from "../../typeSelect";
import TransactionModalBooking from "../ModalTransactionDialogBooking";

interface AddOn {
  id: string;
  label: string;
  price: number;
  type: "single" | "multiple" | "dropdown";
  minQty?: number;
  maxQty?: number;
  options?: string[];
}

interface Concept {
  id: string;
  label: string;
  type: string;
}

type FetchedAddOn = {
  addOnID: number;
  addOn: string;
  addOnPrice: string | number;
  type?: string;
  minQuantity?: number | string;
  maxQuantity?: number | string;
};

interface PackageSet {
  setId: string;
  setName: string;
  concepts: Concept[];
}

const colorOptions = [
  { id: "white", hex: "#f4f6f1", label: "WHITE" },
  { id: "gray", hex: "#cccbcb", label: "GRAY" },
  { id: "black", hex: "#272323", label: "BLACK" },
  { id: "pink", hex: "#facfd7", label: "PINK" },
  { id: "beige", hex: "#cfb5a4", label: "BEIGE" },
  { id: "lavender", hex: "#8d84be", label: "LAVENDER" },
];

const getContrastColor = (hex: string) => {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 180 ? "#333" : "#fff";
};

interface Package {
  id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  tags: string[];
  images: string[];
}

interface PreviewBookingData {
  customerName: string;
  email: string;
  address: string;
  contact: string;
  package: string;
  bookingDate: string;
  time: string;
  subtotal: number;
  paidAmount: number;
  pendingBalance: number;
  paymentType: "deposit" | "full";
  paymentMode: string;
  packageId: string;
  packageDuration?: string;
  packageDurationMinutes?: number;
  predictedEndLabel?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const SelectPackagePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewBookingData | null>(
    null
  );
  const [agreedToPayment, setAgreedToPayment] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  const [bookedIntervals, setBookedIntervals] = useState<
    {
      start: number;
      end: number;
      bookingID?: number;
      packageID?: number;
      durationMinutes?: number;
    }[]
  >([]);
  const [activeAddOns, setActiveAddOns] = useState<Record<string, boolean>>({});
  const [selectedColors, setSelectedColors] = useState<
    Record<string, { id: string; hex: string; label: string }>
  >({});
  const [showingColors, setShowingColors] = useState<Record<string, boolean>>(
    {}
  );
  const [studioFlipped, setStudioAFlipped] = useState(false);
  const [studioBFlipped, setStudioBFlipped] = useState(false);
  const [selectedStudioB, setSelectedStudioB] = useState<number | null>(null);
  const [selectedColorA, setSelectedColorA] = useState<string | null>(null);
  const [setData, setSetData] = useState<PackageSet | null>(null);

  // Store spinner quantities as strings to allow empty state
  const [spinnerQuantities, setSpinnerQuantities] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const prefillUser = async () => {
      try {
        const userID = localStorage.getItem("userID");
        if (!userID) return;
        const res = await fetchWithAuth(`${API_URL}/api/users/${userID}`);
        if (!res.ok) return;
        const u = await res.json();
        const displayName =
          [u.fname, u.lname].filter(Boolean).join(" ") || u.username || "";
        setName((prev) => (prev ? prev : displayName));
        setEmail((prev) => (prev ? prev : u.email || ""));
        setContact((prev) => (prev ? prev : u.contactNo || ""));
        setAddress((prev) => (prev ? prev : u.address || ""));
      } catch (e) {
        console.warn("Could not prefill user details:", e);
      }
    };
    prefillUser();
  }, []);

  useEffect(() => {
    if (id) {
      fetchWithAuth(`${API_URL}/api/packages/${id}/set-concepts`)
        .then((res) => res.json())
        .then((data) => setSetData(data))
        .catch((err) => console.error("Failed to fetch set concepts:", err));
    }
  }, [id]);

  const mapDbTypeToUi = (dbType?: string): AddOn["type"] => {
    const t = (dbType || "").toLowerCase();
    if (t === "multiple" || t === "spinner") return "multiple";
    if (t === "dropdown") return "dropdown";
    return "single";
  };

  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);

  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/packages/${id}/addons`);
        if (!res.ok) throw new Error("Failed to fetch add-ons");

        const result = await res.json();
        const arrayData: FetchedAddOn[] = Array.isArray(result.data)
          ? result.data
          : [];

        const built: AddOn[] = arrayData.map((db) => {
          const uiType = mapDbTypeToUi(db.type);
          const toNum = (v: unknown): number | undefined => {
            if (v === null || v === undefined || v === "") return undefined;
            const n =
              typeof v === "string"
                ? Number(v)
                : typeof v === "number"
                ? v
                : NaN;
            return Number.isFinite(n) && n > 0 ? n : undefined;
          };
          const minQ = toNum(db.minQuantity) ?? 1;
          const rawMax = toNum(db.maxQuantity);
          const maxQ =
            rawMax !== undefined && rawMax >= minQ ? rawMax : undefined;

          return {
            id: String(db.addOnID),
            label: db.addOn,
            price: Number(db.addOnPrice),
            type: uiType,
            minQty: uiType === "multiple" ? minQ : undefined,
            maxQty: uiType === "multiple" ? maxQ : undefined,
          } as AddOn;
        });

        setAddOns(built);

        // Initialize with empty strings, not default values
        const initialQuantities: Record<string, string> = {};
        built.forEach((addon) => {
          if (addon.type === "multiple") {
            initialQuantities[addon.id] = String(addon.minQty ?? 1);
          }
        });
        setSpinnerQuantities(initialQuantities);
      } catch (error) {
        console.error("Error fetching add-ons:", error);
      }
    };

    if (id) fetchAddOns();
  }, [id]);

  useEffect(() => {
    addOns.forEach((item) => {
      if (item.type === "dropdown") {
        setSelectedColors((prev) => {
          if (prev[item.id]) return prev;
          return {
            ...prev,
            [item.id]: { id: "white", label: "WHITE", hex: "#FFFFFF" },
          };
        });
      }
    });
  }, [addOns]);

  useEffect(() => {
    addOns.forEach((item) => {
      if (item.type === "dropdown") {
        setSelectedAddons((prev) => {
          const alreadyExists = prev.some((a) => a.id === item.id);
          if (alreadyExists) return prev;

          return [
            ...prev,
            {
              id: item.id,
              label: item.label,
              price: item.price ?? 0,
              value: 0,
              type: "dropdown",
              option: "WHITE",
            } as SelectedAddon,
          ];
        });
      }
    });
  }, [addOns]);

  const handleAddonChange = (id: string, value?: string | number) => {
    const addOnMeta = addOns.find((a) => a.id === id);

    if (addOnMeta?.type === "dropdown") {
      setSelectedAddons((prev) => {
        const exists = prev.find((a) => a.id === id);
        if (exists) {
          return prev.map((addon) =>
            addon.id === id
              ? {
                  ...addon,
                  value: activeAddOns[id] ? 1 : 0,
                  option: value as string,
                }
              : addon
          );
        }

        const newEntry: SelectedAddon = {
          id: addOnMeta.id,
          label: addOnMeta.label,
          price: addOnMeta.price,
          type: "dropdown",
          value: activeAddOns[id] ? 1 : 0,
          option: String(value ?? "WHITE"),
        };
        return [...prev, newEntry];
      });
    }
  };

  const toggleCheckboxAddon = (id: string) => {
    const addOnMeta = addOns.find((a) => a.id === id);

    setActiveAddOns((prev) => {
      const newActive = !prev[id];

      setSelectedAddons((prevAddons) => {
        const existing = prevAddons.find((a) => a.id === id);

        if (existing) {
          if (!newActive) {
            return prevAddons.map((a) =>
              a.id === id ? { ...a, value: 0 } : a
            );
          }

          // Get quantity, use minQty if empty or invalid
          const qtyStr = spinnerQuantities[id] || "";
          const qty =
            qtyStr === "" ? addOnMeta?.minQty ?? 1 : parseInt(qtyStr, 10);
          const validQty = isNaN(qty) ? addOnMeta?.minQty ?? 1 : qty;

          return prevAddons.map((a) =>
            a.id === id
              ? {
                  ...a,
                  value: a.type === "spinner" ? validQty : 1,
                }
              : a
          );
        } else if (newActive) {
          const newAddon = addOns.find((a) => a.id === id);
          if (!newAddon) return prevAddons;

          let selectedAddonType: SelectedAddon["type"];
          if (newAddon.type === "dropdown") {
            selectedAddonType = "dropdown";
          } else if (newAddon.type === "multiple") {
            selectedAddonType = "spinner";
          } else {
            selectedAddonType = "checkbox";
          }

          // Get quantity, use minQty if empty or invalid
          const qtyStr = spinnerQuantities[id] || "";
          const qty =
            qtyStr === "" ? newAddon.minQty ?? 1 : parseInt(qtyStr, 10);
          const validQty = isNaN(qty) ? newAddon.minQty ?? 1 : qty;

          return [
            ...prevAddons,
            {
              id: newAddon.id,
              label: newAddon.label,
              price: newAddon.price,
              value: selectedAddonType === "spinner" ? validQty : 1,
              type: selectedAddonType,
              ...(selectedAddonType === "dropdown" ? { option: "WHITE" } : {}),
            } as SelectedAddon,
          ];
        }
        return prevAddons;
      });

      return { ...prev, [id]: newActive };
    });
  };

  const handleDropdownChange = (id: string, selectedLabel: string) => {
    handleAddonChange(id, selectedLabel);
  };

  const getPhilippineTime = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippineTime = new Date(utc + 8 * 3600000);
    return philippineTime;
  };

  const formatDateForDatabase = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const isDateInPast = (date: Date) => {
    const today = startOfDay(getPhilippineTime());
    const selectedDateStart = startOfDay(date);
    return selectedDateStart < today;
  };

  const isTimeSlotInPast = (timeSlot: string, date: Date) => {
    if (!isToday(date)) return false;

    const currentTime = getPhilippineTime();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    const [time, period] = timeSlot.split(" ");
    const [hour, minute] = time.split(":").map(Number);
    let slotHour = hour;

    if (period === "PM" && hour !== 12) {
      slotHour += 12;
    } else if (period === "AM" && hour === 12) {
      slotHour = 0;
    }

    const slotTotalMinutes = slotHour * 60 + minute;
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    return slotTotalMinutes <= currentTotalMinutes;
  };

  const fetchBookedTimeSlots = async (date: Date) => {
    try {
      const formattedDate = formatDateForDatabase(date);
      const response = await fetchWithAuth(
        `${API_URL}/api/booked-slots?date=${formattedDate}`
      );
      const data = await response.json();

      if (response.ok) {
        const rawSlots = Array.isArray(data.bookedSlots)
          ? data.bookedSlots
          : [];

        const normalizedStarts: string[] = [];
        const intervals: {
          start: number;
          end: number;
          bookingID?: number;
          packageID?: number;
          durationMinutes?: number;
        }[] = [];

        if (Array.isArray(data.bookings) && data.bookings.length > 0) {
          for (const b of data.bookings) {
            if (!b) continue;
            const startLabel = String(b.startTime || b.start || "");
            if (!startLabel) continue;
            const start = slotLabelToMinutes(startLabel);
            if (isNaN(start)) continue;
            const dur = parseDurationToMinutes(
              b.duration || b.packageDuration || b.durationMinutes || ""
            );
            const durationMinutes = dur > 0 ? dur : 60;
            const end = start + durationMinutes;
            normalizedStarts.push(startLabel);
            intervals.push({
              start,
              end,
              bookingID: b.bookingID,
              packageID: b.packageID,
              durationMinutes,
            });
          }
        } else if (rawSlots.length > 0) {
          for (const entry of rawSlots) {
            if (entry && typeof entry === "object" && entry.start) {
              const startLabel = String(entry.start);
              const endLabel = entry.end ? String(entry.end) : "";
              const start = slotLabelToMinutes(startLabel);
              let end = slotLabelToMinutes(endLabel);
              if (!Number.isFinite(end) || end <= start) {
                end = start + 30;
              }
              normalizedStarts.push(startLabel);
              intervals.push({ start, end });
            } else {
              const label = String(entry);
              const start = slotLabelToMinutes(label);
              if (!isNaN(start)) {
                normalizedStarts.push(label);
                intervals.push({ start, end: start + 30 });
              }
            }
          }
        }

        setBookedTimeSlots(normalizedStarts);
        setBookedIntervals(intervals);
      } else {
        setBookedTimeSlots([]);
        setBookedIntervals([]);
      }
    } catch (error) {
      console.error("Failed to fetch booked time slots:", error);
      setBookedTimeSlots([]);
      setBookedIntervals([]);
    }
  };

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetchWithAuth(`${API_URL}/api/packages/${id}`);
        const data = await response.json();
        setPkg(data);
      } catch (error) {
        console.error("Failed to fetch package:", error);
        setPkg(null);
      }
    };

    if (id) fetchPackage();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      fetchBookedTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleShowPreview = (paymentType: "deposit" | "full") => {
    if (
      !selectedDate ||
      !selectedTime ||
      !name ||
      !contact ||
      !email ||
      !address ||
      !pkg
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (setData && Number(setData.setId) !== 5 && tags.length === 0) {
      toast.error("Please select at least one backdrop before proceeding.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePhoneNumber(contact)) {
      toast.error(
        "Contact number must start with 09 and have exactly 11 digits"
      );
      return;
    }

    if (isDateInPast(selectedDate)) {
      toast.error("Cannot book for past dates");
      return;
    }

    if (isTimeSlotInPast(selectedTime, selectedDate)) {
      toast.error("Cannot book for past time slots");
      return;
    }

    if (bookedTimeSlots.includes(selectedTime)) {
      toast.error(
        "This time slot is already booked. Please select another time."
      );
      return;
    }

    const subtotal = pkg.price;
    const paidAmount = paymentType === "full" ? subtotal : 200;
    const pendingBalance = subtotal - paidAmount;

    const minutesToLabel = (total: number): string => {
      const h24 = Math.floor(total / 60);
      const m = total % 60;
      const period = h24 >= 12 ? "PM" : "AM";
      let h12 = h24 % 12;
      if (h12 === 0) h12 = 12;
      return `${String(h12).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )} ${period}`;
    };
    const startMinutes = slotLabelToMinutes(selectedTime);

    const predictedEndLabel = Number.isFinite(startMinutes)
      ? minutesToLabel(startMinutes + effectivePackageDuration)
      : "";

    const preview: PreviewBookingData = {
      customerName: name,
      email: email,
      address: address,
      contact: contact,
      package: pkg.title,
      bookingDate: formatDateForDatabase(selectedDate),
      time: selectedTime,
      subtotal: subtotal,
      paidAmount: paidAmount,
      pendingBalance: pendingBalance,
      paymentType: paymentType,
      paymentMode: paymentMode,
      packageId: id!,
      packageDuration: pkg.duration,
      packageDurationMinutes: effectivePackageDuration,
      predictedEndLabel,
    };

    setPreviewData(preview);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setPreviewData(null);
  };

  if (!pkg)
    return <div className="p-4 text-sm text-gray-500">Loading package...</div>;

  const timeSlots = Array.from({ length: (20 - 9 + 1) * 2 }, (_, i) => {
    const hour = 9 + Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    const meridian = hour < 12 ? "AM" : "PM";
    const formatted =
      (hour > 12 ? hour - 12 : hour).toString().padStart(2, "0") +
      ":" +
      min +
      " " +
      meridian;
    return formatted;
  }).filter((s) => !["07:30 PM", "08:00 PM", "08:30 PM"].includes(s));

  const slotLabelToMinutes = (label: string): number => {
    const parts = label.trim().split(/\s+/);
    if (parts.length < 2) return NaN;
    const [time, period] = parts;
    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    if (isNaN(hh) || isNaN(mm)) return NaN;
    let hour24 = hh;
    if (period.toUpperCase() === "PM" && hh !== 12) hour24 = hh + 12;
    if (period.toUpperCase() === "AM" && hh === 12) hour24 = 0;
    return hour24 * 60 + mm;
  };

  const parseDurationToMinutes = (raw: unknown): number => {
    if (raw === null || raw === undefined) return 0;
    if (typeof raw === "number") {
      return Number.isFinite(raw) && raw >= 0 ? raw : 0;
    }
    if (typeof raw !== "string") return 0;
    const s = raw.trim().toLowerCase();
    if (!s) return 0;
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    let total = 0;
    const hourMatch = s.match(/(\d+)\s*(hour|hr|hrs|h)/);
    if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
    const minuteMatch = s.match(/(\d+)\s*(minute|min|mins|m)/);
    if (minuteMatch) total += parseInt(minuteMatch[1], 10);
    if (total === 0) {
      const compact = s.match(/(\d+)h(\d+)?m?/);
      if (compact) {
        total += parseInt(compact[1], 10) * 60;
        if (compact[2]) total += parseInt(compact[2], 10);
      }
    }
    if (total === 0) {
      const generic = s.match(/(\d+)/g);
      if (generic) {
        if (/hour|hr|hrs|h/.test(s)) {
          total += parseInt(generic[0], 10) * 60;
          if (generic[1]) total += parseInt(generic[1], 10);
        } else {
          total += parseInt(generic[0], 10);
        }
      }
    }
    return total;
  };

  const basePackageDuration = (() => {
    const mins = parseDurationToMinutes(pkg?.duration);
    if (mins === 0) {
      console.warn(
        "DEBUG duration fallback to 60 because parsed minutes was 0. Raw value:",
        pkg?.duration
      );
    }
    return mins || 60;
  })();

  const EXTRA_DURATION_ADDON_MINUTES: Record<string, number> = {
    "70": 5,
    "80": 20,
    "90": 60,
  };

  const extraDurationMinutes = selectedAddons.reduce((sum, addon) => {
    if (addon.value <= 0) return sum;
    const perUnit = EXTRA_DURATION_ADDON_MINUTES[addon.id];
    if (!perUnit) return sum;
    const qty = addon.type === "spinner" ? addon.value : 1;
    return sum + perUnit * qty;
  }, 0);

  const effectivePackageDuration = basePackageDuration + extraDurationMinutes;

  const DAY_END_MIN = 20 * 60;

  const handleRemoveTag = (type: string) => {
    setTags((prev) => prev.filter((t) => t.type !== type));

    if (type === "studioA") {
      setSelectedColorA(null);
    } else if (type === "studioB") {
      setSelectedStudioB(null);
    }
  };

  const conceptImages: Record<string, string> = {
    "BOHEMIAN DREAM": "/3.png",
    "CHINGU PINK": "/4.png",
    SPOTLIGHT: "/5.png",
    GRADUATION: "/2.png",
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-black mb-4 sm:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="hover:underline text-gray-400"
          >
            Back
          </button>{" "}
          / Book {pkg.title}
        </nav>

        {/* Top Section */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 flex flex-col md:flex-row gap-6 sm:gap-8">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <img
              src={pkg.images[0]}
              alt="Cover"
              className="rounded-xl object-cover w-full aspect-square"
            />
          </div>

          <div className="w-full md:w-2/3 space-y-3">
            <span className="uppercase tracking-wide text-xs text-gray-400">
              {pkg.tags[0]}
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              {pkg.title}
            </h2>
            <p className="text-lg text-gray-600 font-medium">PHP {pkg.price}</p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-3 space-y-1">
              {pkg.description}
            </ul>
          </div>
        </div>

        {/* Header for Selected Tags */}
        {setData && Number(setData.setId) !== 5 && (
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-gray-800">
              Set the Scene{" "}
              <span className="text-sm font-normal text-gray-500">
                (Choose your studio):
              </span>
            </h3>

            {tags.map((tag) => (
              <span
                key={tag.type}
                className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl"
                style={
                  tag.type === "studioA" && tag.hex
                    ? {
                        backgroundColor: tag.hex,
                        color: getContrastColor(tag.hex),
                      }
                    : tag.type === "studioB"
                    ? { backgroundColor: "#4f39f6", color: "#ffffffff" }
                    : {}
                }
              >
                {tag.label}
                <button
                  onClick={() => handleRemoveTag(tag.type)}
                  className="ml-1 text-xs hover:opacity-80"
                  style={
                    tag.type === "studioA" && tag.hex
                      ? { color: getContrastColor(tag.hex) }
                      : {}
                  }
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Studio Options Section */}
        {setData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {(() => {
              const setIdNum = Number(setData.setId);
              const showStudioA = setIdNum !== 5 && setIdNum !== 6;
              const enableStudioB =
                setIdNum === 2 ||
                setIdNum === 4 ||
                setIdNum === 3 ||
                setIdNum === 6;

              const handleStudioASelect = () => {
                setStudioAFlipped((s) => !s);
                setStudioBFlipped(false);
              };
              const handleStudioBSelect = () => {
                if (!enableStudioB) return;
                setStudioBFlipped((s) => !s);
                setStudioAFlipped(false);
              };

              return (
                <>
                  {showStudioA && (
                    <div className="w-full">
                      <div
                        onClick={handleStudioASelect}
                        className="w-full h-32 sm:h-40 bg-white rounded-xl shadow-lg flex items-center justify-center p-4 cursor-pointer relative"
                      >
                        <AnimatePresence mode="wait">
                          {!studioFlipped ? (
                            <motion.div
                              key="front"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors"
                            >
                              <span className="text-base sm:text-lg font-semibold text-gray-800">
                                Plain Backdrop
                              </span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="back"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 bg-gray-100 rounded-xl shadow-lg flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-3 overflow-auto"
                            >
                              {colorOptions.map((color) => {
                                const isSelected = selectedColorA === color.id;
                                return (
                                  <motion.div
                                    key={color.id}
                                    whileHover={{
                                      scale: isSelected ? 1.08 : 1.05,
                                    }}
                                    animate={{ scale: isSelected ? 1.25 : 1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 20,
                                    }}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shadow-md cursor-pointer"
                                    style={{ backgroundColor: color.hex }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedColorA(color.id);
                                      setTags((prev) => {
                                        const colorObj = colorOptions.find(
                                          (c) => c.id === color.id
                                        );
                                        if (!colorObj) return prev;

                                        const filtered = prev.filter(
                                          (t) => t.type !== "studioA"
                                        );
                                        return [
                                          ...filtered,
                                          {
                                            id: String(colorObj.id),
                                            label: colorObj.label,
                                            type: "studioA",
                                            hex: colorObj.hex,
                                          },
                                        ];
                                      });
                                    }}
                                  />
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {setIdNum !== 5 && (
                    <div className="w-full">
                      <div
                        onClick={
                          enableStudioB ? handleStudioBSelect : undefined
                        }
                        className={`w-full h-32 sm:h-40 rounded-xl shadow-lg flex items-center justify-center p-4 relative ${
                          enableStudioB
                            ? "bg-white cursor-pointer"
                            : "bg-gray-200 cursor-not-allowed"
                        }`}
                      >
                        <AnimatePresence mode="wait">
                          {!studioBFlipped ? (
                            <motion.div
                              key="front"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 flex items-center justify-center rounded-md transition-colors duration-500 ease-in-out"
                            >
                              <span
                                className={`text-base sm:text-lg font-semibold ${
                                  enableStudioB
                                    ? "text-gray-800"
                                    : "text-gray-400"
                                }`}
                              >
                                Concept Studio
                              </span>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="back"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.4 }}
                              className="absolute inset-0 bg-gray-100 rounded-xl shadow-lg flex flex-wrap items-center justify-center gap-3 sm:gap-8 p-3 overflow-auto max-h-64"
                            >
                              {(setData?.concepts ?? [])
                                .filter(
                                  (c) =>
                                    (c.type || "").toLowerCase() === "studio"
                                )
                                .map((concept, i) => {
                                  const isSelected = selectedStudioB === i;
                                  const keyLabel = (concept.label || "")
                                    .trim()
                                    .toUpperCase();
                                  const imgSrc =
                                    conceptImages[keyLabel] || "/default.png";

                                  return (
                                    <motion.div
                                      key={concept.id}
                                      whileHover={{
                                        scale: isSelected ? 1.1 : 1.05,
                                      }}
                                      animate={{ scale: isSelected ? 1.2 : 1 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 20,
                                      }}
                                      className={`relative w-24 sm:w-30 h-10 sm:h-12 rounded-lg shadow-md bg-cover bg-center overflow-hidden cursor-pointer ${
                                        !enableStudioB ? "opacity-50" : ""
                                      }`}
                                      style={{
                                        backgroundImage: `url(${imgSrc})`,
                                      }}
                                      onClick={(e) => {
                                        if (!enableStudioB) return;
                                        e.stopPropagation();
                                        setSelectedStudioB(i);

                                        const label =
                                          concept.label || "Concept";

                                        setTags((prev) => {
                                          const filtered = prev.filter(
                                            (t) => t.type !== "studioB"
                                          );
                                          return [
                                            ...filtered,
                                            {
                                              id: String(concept.id),
                                              label,
                                              type: "studioB",
                                            },
                                          ];
                                        });
                                      }}
                                    >
                                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-800 bg-opacity-20 text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity duration-500 text-center px-1 break-words">
                                        {concept.label}
                                      </div>
                                    </motion.div>
                                  );
                                })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Add Ons Section - FIXED BUTTON AREA & BACKSPACE */}
        <div className="bg-white text-gray-900 rounded-xl shadow p-4 sm:p-6 space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">Add Ons</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {addOns.map((item) => {
              const isActive = !!activeAddOns[item.id];
              const currentQuantityStr =
                spinnerQuantities[item.id] ?? String(item.minQty ?? 1);
              const currentQuantity =
                currentQuantityStr === ""
                  ? 0
                  : parseInt(currentQuantityStr, 10);
              const displayQty = isNaN(currentQuantity)
                ? item.minQty ?? 1
                : currentQuantity;

              return (
                <div
                  key={item.id}
                  className={`group relative flex flex-col gap-3 p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                    isActive
                      ? "bg-neutral-900 border-neutral-700 text-white shadow-lg"
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm z-10">
                      Added
                    </span>
                  )}

                  {/* FIXED: Clickable area - Only Label */}
                  <div className="flex justify-between items-center w-full pr-12">
                    <span
                      className={`text-sm font-medium cursor-pointer ${
                        isActive ? "text-white" : "text-gray-900"
                      }`}
                      onClick={() => toggleCheckboxAddon(item.id)}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`text-xs ${
                        isActive ? "text-gray-200" : "text-gray-600"
                      }`}
                    >
                      ₱{item.price}
                    </span>
                  </div>

                  {/* FIXED: Spinner - allows backspace and empty state */}

                  {item.type === "multiple" && (
                    <div
                      className="flex items-center justify-between gap-2 w-full cursor-pointer"
                      onClick={() => toggleCheckboxAddon(item.id)}
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={currentQuantityStr}
                        onChange={(e) => {
                          const rawValue = e.target.value;

                          if (rawValue === "" || /^\d+$/.test(rawValue)) {
                            setSpinnerQuantities((prev) => ({
                              ...prev,
                              [item.id]: rawValue,
                            }));

                            if (isActive && rawValue !== "") {
                              const num = parseInt(rawValue, 10);
                              setSelectedAddons((prev) =>
                                prev.map((addon) =>
                                  addon.id === item.id
                                    ? { ...addon, value: num }
                                    : addon
                                )
                              );
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value;

                          if (rawValue === "") {
                            const minQ = item.minQty ?? 1;
                            setSpinnerQuantities((prev) => ({
                              ...prev,
                              [item.id]: String(minQ),
                            }));

                            if (isActive) {
                              setSelectedAddons((prev) =>
                                prev.map((addon) =>
                                  addon.id === item.id
                                    ? { ...addon, value: minQ }
                                    : addon
                                )
                              );
                            }
                            return;
                          }

                          const parsed = parseInt(rawValue, 10);
                          const minQ = item.minQty ?? 1;
                          const maxQ = item.maxQty ?? Number.POSITIVE_INFINITY;
                          const clamped = Math.min(
                            Math.max(parsed, minQ),
                            maxQ
                          );

                          setSpinnerQuantities((prev) => ({
                            ...prev,
                            [item.id]: String(clamped),
                          }));

                          if (isActive) {
                            setSelectedAddons((prev) =>
                              prev.map((addon) =>
                                addon.id === item.id
                                  ? { ...addon, value: clamped }
                                  : addon
                              )
                            );
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder={String(item.minQty ?? 1)}
                        className={`w-20 sm:w-24 rounded px-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "border border-white bg-white text-black placeholder-gray-400"
                            : "border border-gray-300 bg-white text-black placeholder-gray-400"
                        }`}
                      />

                      {isActive && currentQuantityStr !== "" && (
                        <span className="text-sm font-medium text-white whitespace-nowrap">
                          ₱{item.price * displayQty}
                        </span>
                      )}
                    </div>
                  )}

                  {item.type === "dropdown" && isActive && (
                    <div className="relative w-full">
                      <AnimatePresence>
                        {showingColors[item.id] && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute -top-14 left-1/2 -translate-x-1/2 p-3 bg-white rounded-lg shadow-lg flex gap-2 z-10"
                          >
                            {colorOptions.map((color) => (
                              <div
                                key={color.id}
                                onClick={(e) => {
                                  e.stopPropagation();

                                  setSelectedColors((prev) => ({
                                    ...prev,
                                    [item.id]: color,
                                  }));

                                  setSelectedAddons((prev) => {
                                    const filtered = prev.filter(
                                      (a) => a.id !== item.id
                                    );
                                    return [
                                      ...filtered,
                                      {
                                        id: item.id,
                                        label: item.label,
                                        price: item.price ?? 0,
                                        value: activeAddOns[item.id] ? 1 : 0,
                                        type: "dropdown",
                                        option: color.label,
                                      } as SelectedAddon,
                                    ];
                                  });

                                  setShowingColors((prev) => ({
                                    ...prev,
                                    [item.id]: false,
                                  }));
                                  handleDropdownChange(item.id, color.label);
                                }}
                                className="w-6 h-6 rounded-full border border-gray-400 shadow-sm hover:scale-110 transition cursor-pointer"
                                style={{ backgroundColor: color.hex }}
                              />
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowingColors((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id],
                          }));
                        }}
                        className="w-full h-8 rounded-md border text-xs flex items-center justify-center cursor-pointer transition border-gray-600"
                        style={{
                          backgroundColor:
                            selectedColors?.[item.id]?.hex || "#272727",
                          color: (() => {
                            const hex =
                              selectedColors?.[item.id]?.hex || "#FFFFFF";
                            const r = parseInt(hex.slice(1, 3), 16);
                            const g = parseInt(hex.slice(3, 5), 16);
                            const b = parseInt(hex.slice(5, 7), 16);
                            const brightness =
                              (r * 299 + g * 587 + b * 114) / 1000;
                            return brightness > 150 ? "#000" : "#fff";
                          })(),
                        }}
                      >
                        {selectedColors?.[item.id]?.label || "WHITE"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-6">
          <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8">
            <div className="w-full lg:w-1/2 flex justify-center">
              <div
                className="bg-white p-4 rounded-xl w-full max-w-md"
                style={{ filter: "grayscale(100%)" }}
              >
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date && !isDateInPast(date)) {
                      setSelectedDate(date);
                      setSelectedTime("");
                    }
                  }}
                  disabled={(date) => isDateInPast(date)}
                  captionLayout="label"
                  modifiers={{
                    selected: (d) =>
                      !!selectedDate && isSameDay(d, selectedDate!),
                    today: (d) => isToday(d),
                    disabled: (d) => isDateInPast(d),
                  }}
                  modifiersClassNames={{
                    selected: "bg-gray-800 text-white",
                    today: "font-bold text-black bg-gray-100 rounded-xl",
                    disabled: "text-gray-400 cursor-not-allowed",
                  }}
                  classNames={{
                    caption: "text-sm text-black",
                    dropdown: "text-black z-30",
                    day: "text-sm",
                    nav_button: "text-black hover:bg-gray-100 p-1 rounded",
                    nav_icon: "stroke-black fill-black w-4 h-4",
                  }}
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <h4 className="text-sm text-gray-700 mb-3 font-medium">
                Available Time Slots
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const slotStart = slotLabelToMinutes(slot);
                  const slotEnd = slotStart + 30;
                  const isPastTime = selectedDate
                    ? isTimeSlotInPast(slot, selectedDate)
                    : false;
                  const overlapsExisting = bookedIntervals.some(
                    (iv) => slotStart < iv.end && slotEnd > iv.start
                  );
                  const wouldEnd = slotStart + effectivePackageDuration;
                  const insufficientRemaining = wouldEnd > DAY_END_MIN;
                  const intervalConflict = bookedIntervals.some(
                    (iv) => slotStart < iv.end && wouldEnd > iv.start
                  );
                  const isBooked = overlapsExisting;
                  const isDisabled =
                    isPastTime ||
                    isBooked ||
                    insufficientRemaining ||
                    intervalConflict;

                  return (
                    <button
                      key={slot}
                      onClick={() => !isDisabled && setSelectedTime(slot)}
                      disabled={isDisabled}
                      className={`py-2 px-2 text-xs sm:text-sm rounded-md transition text-center ${
                        selectedTime === slot
                          ? "bg-black text-white"
                          : isDisabled
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      title={
                        isPastTime
                          ? "This time slot has passed"
                          : isBooked
                          ? "Overlaps an existing booking"
                          : insufficientRemaining
                          ? `Not enough time for a ${effectivePackageDuration}-minute session before closing`
                          : intervalConflict
                          ? "Your session would overlap another booking"
                          : ""
                      }
                    >
                      {slot}
                      {isBooked && (
                        <span className="block text-xs text-red-500">
                          Booked
                        </span>
                      )}
                      {!isBooked && intervalConflict && (
                        <span className="block text-xs text-orange-500">
                          Conflict
                        </span>
                      )}
                      {!isBooked && insufficientRemaining && (
                        <span className="block text-xs text-amber-600">
                          Too Late
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="bg-neutral-900 text-white rounded-xl shadow p-4 sm:p-6 space-y-6">
          <h3 className="text-base sm:text-lg font-semibold">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
            />
            <input
              value={contact}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, "");
                if (value.length <= 11) {
                  setContact(value);
                }
              }}
              placeholder="Contact No. (09XXXXXXXXX)"
              className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
              maxLength={11}
            />
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="Email"
              type="email"
              className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
            />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
              className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
            />
          </div>

          <div className="text-sm space-y-4">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 flex-shrink-0"
              />
              <span className="text-sm">
                <strong>I accept</strong> the Terms and Agreements. By using our
                system and services, you agree to abide by the following rules
                and conditions.
              </span>
            </label>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreedToPayment}
                onChange={(e) => setAgreedToPayment(e.target.checked)}
                className="mt-1 flex-shrink-0"
                disabled={!agreed}
              />
              <span className="text-sm">
                <strong>I agree</strong> to pay PHP 200 down payment to confirm
                booking.{" "}
                <strong>
                  Please note that the down payment is non-refundable.
                </strong>{" "}
                The remaining balance is due on the day of the photoshoot or
                service.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                className="w-full bg-black text-white py-3 px-4 rounded-md disabled:opacity-50 text-sm sm:text-base font-medium"
                disabled={!agreed || !agreedToPayment}
                onClick={() => handleShowPreview("deposit")}
              >
                Confirm with Deposit
              </button>
              <button
                className="w-full bg-white text-black py-3 px-4 rounded-md disabled:opacity-50 text-sm sm:text-base font-medium"
                disabled={!agreed || !agreedToPayment}
                onClick={() => handleShowPreview("full")}
              >
                Full Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      <TransactionModalBooking
        isOpen={isModalOpen}
        onClose={handleModalClose}
        previewData={previewData}
        tags={tags}
        addons={addOns}
        selectedAddons={selectedAddons}
      />

      <ToastContainer position="bottom-right" />
    </>
  );
};

export default SelectPackagePage;

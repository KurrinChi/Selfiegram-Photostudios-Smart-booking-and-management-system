import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { isToday, isSameDay, startOfDay } from "date-fns";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import type { Tag } from "../../types";
import type { SelectedAddon } from "../../typeSelect";
import TransactionModalBooking from "../StaffModalTransactionDialogBooking";

interface AddOn {
  id: string;
  label: string;
  price: number;
  // Match existing consumers (e.g., SelectedAddon mapping and Modal props)
  type: "single" | "multiple" | "dropdown";
  // For quantity-based add-ons (type: multiple)
  minQty?: number;
  maxQty?: number;
  options?: string[]; // for dropdown only
}

interface Concept {
  id: string;
  label: string;
  type: string; // "plain" | "concept"
}
type FetchedAddOn = {
  addOnID: number;
  addOn: string;
  addOnPrice: string | number;
  type?: string; // DB: 'single' | 'multiple' | 'spinner' | ''
  minQuantity?: number | string; // optional from API
  maxQuantity?: number | string; // optional from API
};
interface PackageSet {
  setId: string;
  setName: string;
  concepts: Concept[];
}

//const [tags, setTags] = useState<Tag[]>([]);

/*const addOns: AddOn[] = [
    { id: "pax", label: "Addl pax", price: 129, type: "spinner" },
    {
      id: "portrait",
      label: "Addl Portrait Picture",
      price: 49,
      type: "spinner",
    },
    { id: "grid", label: "Addl Grid Picture", price: 69, type: "spinner" },
    { id: "a4", label: "Addl A4 Picture", price: 129, type: "spinner" },
    {
      id: "backdrop",
      label: "Addl Backdrop",
      price: 129,
      type: "dropdown",
      options: ["Floral", "Modern", "Classic"],
    },

    {
      id: "photo20",
      label: "Photographer service for 20mins",
      price: 599,
      type: "checkbox",
    },
    {
      id: "photo60",
      label: "Photographer service for 1hr",
      price: 1699,
      type: "checkbox",
    },
    {
      id: "makeup",
      label: "Professional Hair & Make up",
      price: 1699,
      type: "checkbox",
    },

    { id: "digital", label: "All digital copies", price: 199, type: "checkbox" },
    { id: "extra5", label: "Addl 5 mins", price: 129, type: "checkbox" },
  ];*/

const colorOptions = [
  { id: "white", hex: "#f4f6f1", label: "WHITE" },
  { id: "gray", hex: "#cccbcb", label: "GRAY" },
  { id: "black", hex: "#272323", label: "BLACK" },
  { id: "pink", hex: "#facfd7", label: "PINK" },
  { id: "beige", hex: "#cfb5a4", label: "BEIGE" },
  { id: "lavender", hex: "#8d84be", label: "LAVENDER" },
];
const getContrastColor = (hex: string) => {
  const c = hex.substring(1); // remove #
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b; // brightness
  return luma > 180 ? "#333" : "#fff"; // dark text for light bg, white for dark bg
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
  packageDuration?: string; // added for modal end-time display
  packageDurationMinutes?: number; // numeric duration for direct use
  predictedEndLabel?: string; // precomputed end time label
  staffName?: string; // staff name for emergency purposes
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
  const [staffName, setStaffName] = useState("");
  const [paymentMode] = useState("");

  // Get logged-in staff name from localStorage on mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const fullName = `${user.fname || ''} ${user.lname || ''}`.trim();
        setStaffName(fullName || "Staff");
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        setStaffName("Staff");
      }
    } else {
      setStaffName("Staff");
    }
  }, []);
  const [agreed, setAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewBookingData | null>(
    null
  );
  // const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);

  const [agreedToPayment, setAgreedToPayment] = useState(false); // For Down Payment Agreement

  const [tags, setTags] = useState<Tag[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
  // Rich interval booking data (start/end in minutes from 00:00) if provided by API
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

  // For Studio A (colors)
  const [selectedColorA, setSelectedColorA] = useState<string | null>(null);

  const [setData, setSetData] = useState<PackageSet | null>(null);

  /*const hasPlain = !!setData?.concepts?.some(
      (c) => (c.type || "").toString().toLowerCase() === "plain"
    );*/
  /*const hasConcept = !!setData?.concepts?.some(
      (c) => (c.type || "").toString().toLowerCase() === "concept"
    );*/

  // convert setId to number safely (handles strings like "1")
  // const setIdNum = setData?.setId ? Number(setData.setId) : null;
  //const showStudioA = setIdNum !== 3; // hide Studio A only if set 3
  //const enableStudioB = setIdNum === 2 || setIdNum === 4; // show B only for set 2 or 4
  //const hideBothStudios = setIdNum === 3; // for completeness

  // rule: setId === 1 => plain-only (disable concept studio)
  //const isPlainOnlySet = setIdNum === 1;

  // final flags used by the UI
  //const showStudioA = isPlainOnlySet || hasPlain;       // render Studio A
  //const enableStudioB = !isPlainOnlySet && hasConcept; // concept studio

  /*const showStudioA =
    isPlainOnlySet ||
    setData?.concepts?.some(
      (c) => (c.type || "").toString().toLowerCase() === "plain"
    );

  // Studio B: only disabled if plain-only; otherwise enabled if API has concepts
  const enableStudioB =
    !isPlainOnlySet &&
    setData?.concepts?.some(
      (c) => (c.type || "").toString().toLowerCase() === "studio"
    );*/
  useEffect(() => {
    if (id) {
      fetchWithAuth(`${API_URL}/api/staff/packages/${id}/set-concepts`)
        .then((res) => res.json())
        .then((data) => setSetData(data))
        .catch((err) => console.error("Failed to fetch set concepts:", err));
    }
  }, [id]);

  // DB type -> UI type mapping
  const mapDbTypeToUi = (dbType?: string): AddOn["type"] => {
    const t = (dbType || "").toLowerCase();
    if (t === "multiple" || t === "spinner") return "multiple"; // quantity style
    if (t === "dropdown") return "dropdown";
    return "single"; // default for 'single' or empty
  };
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const res = await fetchWithAuth(
          `${API_URL}/api/staff/packages/${id}/addons`
        );
        if (!res.ok) throw new Error("Failed to fetch add-ons");

        const result = await res.json();

        // Ensure result.data is an array
        const arrayData: FetchedAddOn[] = Array.isArray(result.data)
          ? result.data
          : [];

        // Build add-ons directly from DB
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
          const minQ = toNum(db.minQuantity) ?? 1; // only fallback here
          const rawMax = toNum(db.maxQuantity);
          // Explicitly allow max when >= min; otherwise treat as unlimited (undefined)
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

        // Debug logging: show mapping from DB type -> UI type
        try {
          console.groupCollapsed("AddOns mapping (DB -> UI)");
          console.table(
            arrayData.map((db) => ({
              id: db.addOnID,
              label: db.addOn,
              price: Number(db.addOnPrice),
              dbType: (db.type || "").toString() || "(empty)",
              uiType: mapDbTypeToUi(db.type),
              minQuantity: db.minQuantity ?? 1,
              maxQuantity: db.maxQuantity ?? "(unlimited)",
            }))
          );
          console.log("Built AddOns (UI):", built);
          console.groupEnd();
        } catch (_) {
          // no-op logging failure
        }

        setAddOns(built);
      } catch (error) {
        console.error("Error fetching add-ons:", error);
      }
    };

    if (id) fetchAddOns();
  }, [id]);

  // const toggleAddOn = (id: string, forceActive?: boolean, type?: string) => {
  //   // toggleAddOn not used; using toggleCheckboxAddon for all add-ons
  // };

  /*// 4️⃣ Update quantity for spinner AddOns
  const handleQuantityChange = (id: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: value > 0 ? value : 1,
    }));
  };*/

  /*const toggleAddOn = (id: string, active?: boolean) => {
      setActiveAddOns((prev) => ({
        ...prev,
        [id]: typeof active === "boolean" ? active : !prev[id],
      }));
    };*/

  // Spinner quantities are tracked via selectedAddons; no separate quantities state.

  useEffect(() => {
    // Loop through your add-ons (if you have them as props or state)
    addOns.forEach((item) => {
      if (item.type === "dropdown") {
        setSelectedColors((prev) => {
          if (prev[item.id]) return prev; // don't override if already set
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
              label: item.label, // e.g., "Additional Backdrop"
              price: item.price ?? 0,
              value: 0, // mark as NOT selected initially
              type: "dropdown",
              option: "WHITE", // default choice
            } as SelectedAddon,
          ];
        });
      }
    });
  }, [addOns]);

  const handleAddonChange = (id: string, value?: string | number) => {
    const addOnMeta = addOns.find((a) => a.id === id);
    const numeric =
      typeof value === "number" ? value : parseInt(String(value || 0), 10);
    const minQ = addOnMeta?.minQty ?? 1;
    const maxQ = addOnMeta?.maxQty ?? Number.POSITIVE_INFINITY;
    const clampedQty = isNaN(numeric)
      ? minQ
      : Math.min(Math.max(numeric, minQ), maxQ);

    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === id);
      if (exists) {
        return prev.map((addon) =>
          addon.id === id
            ? {
                ...addon,
                value:
                  addon.type === "dropdown"
                    ? activeAddOns[id]
                      ? 1
                      : 0
                    : clampedQty,
                option:
                  addon.type === "dropdown" ? (value as string) : addon.option,
              }
            : addon
        );
      }

      // If not exists yet, create a new SelectedAddon entry (for quantity edits especially)
      if (!addOnMeta) return prev;

      let selectedType: SelectedAddon["type"] = "checkbox";
      if (addOnMeta.type === "dropdown") selectedType = "dropdown";
      else if (addOnMeta.type === "multiple") selectedType = "spinner";

      const newEntry: SelectedAddon = {
        id: addOnMeta.id,
        label: addOnMeta.label,
        price: addOnMeta.price,
        type: selectedType,
        value:
          selectedType === "dropdown" ? (activeAddOns[id] ? 1 : 0) : clampedQty,
        ...(selectedType === "dropdown"
          ? { option: String(value ?? "WHITE") }
          : {}),
      };
      return [...prev, newEntry];
    });

    // Auto-activate multiples when quantity is set
    if (addOnMeta?.type === "multiple") {
      setActiveAddOns((prev) => ({ ...prev, [id]: true }));
    }
  };

  // For toggling checkboxes
  const toggleCheckboxAddon = (id: string) => {
    setActiveAddOns((prev) => {
      const newActive = !prev[id];

      setSelectedAddons((prevAddons) => {
        const existing = prevAddons.find((a) => a.id === id);
        if (existing) {
          return prevAddons.map((a) =>
            a.id === id ? { ...a, value: newActive ? 1 : 0 } : a
          );
        } else if (newActive) {
          const newAddon = addOns.find((a) => a.id === id);
          if (!newAddon) return prevAddons;
          // Map AddOn type to SelectedAddon type
          let selectedAddonType: SelectedAddon["type"];
          if (newAddon.type === "dropdown") {
            selectedAddonType = "dropdown";
          } else if (newAddon.type === "multiple") {
            selectedAddonType = "spinner";
          } else {
            selectedAddonType = "checkbox";
          }
          return [
            ...prevAddons,
            {
              id: newAddon.id,
              label: newAddon.label,
              price: newAddon.price,
              value: selectedAddonType === "spinner" ? newAddon.minQty ?? 1 : 1,
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

  // For spinners (quantity changes handled inline via handleAddonChange)

  // For dropdowns
  const handleDropdownChange = (id: string, selectedLabel: string) => {
    handleAddonChange(id, selectedLabel);
  };
  // Helper function to get current Philippine time
  const getPhilippineTime = () => {
    // Create a new date in Philippine timezone (UTC+8)
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const philippineTime = new Date(utc + 8 * 3600000); // UTC+8
    return philippineTime;
  };

  // Helper function to format date for database (YYYY-MM-DD in Philippine timezone)
  const formatDateForDatabase = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Philippine phone number validation
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Check if date is in the past
  const isDateInPast = (date: Date) => {
    const today = startOfDay(getPhilippineTime());
    const selectedDateStart = startOfDay(date);
    return selectedDateStart < today;
  };

  // Check if time slot is in the past for today
  const isTimeSlotInPast = (timeSlot: string, date: Date) => {
    if (!isToday(date)) return false;

    const currentTime = getPhilippineTime();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // Parse time slot (e.g., "09:00 AM")
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

  // Fetch booked time slots for selected date
  const fetchBookedTimeSlots = async (date: Date) => {
    try {
      const formattedDate = formatDateForDatabase(date);
      const response = await fetchWithAuth(
        `${API_URL}/api/appointments/taken-times?date=${formattedDate}`
      );
      const data = await response.json();

      if (response.ok) {
        /* New backend shape (updated controller):
           bookedSlots: [ { start: '09:00 AM', end: '09:30 AM' }, ... ]
           Legacy shape: bookedSlots: ['09:00 AM','09:30 AM', ...]
           Optional: bookings: [...with startTime, duration ...]
        */
        const rawSlots = Array.isArray(data.bookedSlots)
          ? data.bookedSlots
          : [];

        // Normalize starts for simple collision check via bookedTimeSlots (strings only)
        const normalizedStarts: string[] = [];
        const intervals: {
          start: number;
          end: number;
          bookingID?: number;
          packageID?: number;
          durationMinutes?: number;
        }[] = [];

        // Priority 1: explicit structured bookings array (richer info)
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
          // Priority 2: new bookedSlots objects with start/end
          for (const entry of rawSlots) {
            if (entry && typeof entry === "object" && entry.start) {
              const startLabel = String(entry.start);
              const endLabel = entry.end ? String(entry.end) : "";
              const start = slotLabelToMinutes(startLabel);
              let end = slotLabelToMinutes(endLabel);
              if (!Number.isFinite(end) || end <= start) {
                // fallback assume 30-minute base block if end missing/invalid
                end = start + 30;
              }
              normalizedStarts.push(startLabel);
              intervals.push({ start, end });
            } else {
              // Legacy string element inside array
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
        const response = await fetchWithAuth(
          `${API_URL}/api/staff/packages/${id}`
        );
        const data = await response.json();
        // DEBUG: Log raw package payload
        try {
          console.groupCollapsed("DEBUG: Fetched package payload");
          console.log("Raw data:", data);
          console.log(
            "Raw duration field value:",
            (data &&
              (data.duration ||
                data?.packageDuration ||
                data?.package_duration)) ??
              "<<undefined>>"
          );
          // Attempt to normalize duration
          const rawDuration =
            data?.duration ||
            data?.packageDuration ||
            data?.package_duration ||
            "";
          // Reuse existing parseDurationToMinutes below (defined later) by creating a temp inline parser copy (since function not yet in scope here at runtime ordering)
          const tmpParse = (raw: string): number => {
            if (!raw || typeof raw !== "string") return 0;
            const s = raw.toLowerCase();
            if (/^\d+$/.test(s)) return parseInt(s, 10);
            let total = 0;
            const hourMatch = s.match(/(\d+)\s*(hour|hr|hrs|h)/);
            if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
            const minuteMatch = s.match(/(\d+)\s*(minute|min|mins|m)/);
            if (minuteMatch) total += parseInt(minuteMatch[1], 10);
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
          const parsedMinutes = tmpParse(rawDuration);
          console.log(
            "Parsed duration minutes (debug immediate):",
            parsedMinutes
          );
          if (parsedMinutes === 60 && rawDuration && /10/.test(rawDuration)) {
            console.warn(
              'DEBUG: Duration contains "10" but parsed to 60. Raw string might have unexpected format. Raw:',
              rawDuration
            );
          }
          console.groupEnd();
        } catch (e) {
          console.warn("DEBUG: Error logging fetched package payload", e);
        }
        setPkg(data); // store after logging
      } catch (error) {
        console.error("Failed to fetch package:", error);
        setPkg(null);
      }
    };

    if (id) fetchPackage();
  }, [id]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchBookedTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  const handleShowPreview = (paymentType: "deposit" | "full") => {
    // Debug: Log current addon states
    console.log("=== BOOKING PREVIEW DEBUG ===");
    console.log("selectedAddons:", selectedAddons);
    console.log("activeAddOns:", activeAddOns);

    // Validate all fields
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
    // Validate email
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(contact)) {
      toast.error(
        "Contact number must start with 09 and have exactly 11 digits"
      );
      return;
    }

    // Check if date is in the past
    if (isDateInPast(selectedDate)) {
      toast.error("Cannot book for past dates");
      return;
    }

    // Check if time slot is in the past for today
    if (isTimeSlotInPast(selectedTime, selectedDate)) {
      toast.error("Cannot book for past time slots");
      return;
    }

    // Check if time slot is already booked
    if (bookedTimeSlots.includes(selectedTime)) {
      toast.error(
        "This time slot is already booked. Please select another time."
      );
      return;
    }

    const subtotal = pkg.price;
    const paidAmount = paymentType === "full" ? subtotal : 200;
    const pendingBalance = subtotal - paidAmount;

    // Compute end label now so modal does not need to refetch duration
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
    console.log(
      "DEBUG: Preparing preview. Selected start label:",
      selectedTime,
      "-> startMinutes:",
      startMinutes,
      "package raw duration:",
      pkg?.duration,
      "effectivePackageDuration (parsed + addons):",
      effectivePackageDuration
    );
    const predictedEndLabel = Number.isFinite(startMinutes)
      ? minutesToLabel(startMinutes + effectivePackageDuration)
      : "";

    const preview: PreviewBookingData = {
      customerName: name,
      email: email,
      address: address,
      contact: contact,
      package: pkg.title,
      bookingDate: formatDateForDatabase(selectedDate), // Use Philippine timezone
      time: selectedTime,
      subtotal: subtotal,
      paidAmount: paidAmount,
      pendingBalance: pendingBalance,
      paymentType: paymentType,
      paymentMode: paymentMode,
      packageId: id!,
      packageDuration: pkg.duration, // pass raw duration so modal can compute end time without refetch race
      packageDurationMinutes: effectivePackageDuration,
      predictedEndLabel,
      staffName: staffName,
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
  })
    // Remove late evening slots as requested: 07:30 PM, 08:00 PM, 08:30 PM
    .filter((s) => !["07:30 PM", "08:00 PM", "08:30 PM"].includes(s));

  /* ---------------------- Duration / Interval Helpers ---------------------- */
  // Convert a label like "09:30 AM" to minutes from 00:00
  const slotLabelToMinutes = (label: string): number => {
    const parts = label.trim().split(/\s+/); // [HH:MM, AM]
    if (parts.length < 2) return NaN;
    const [time, period] = parts;
    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    if (isNaN(hh) || isNaN(mm)) return NaN;
    let hour24 = hh;
    if (period.toUpperCase() === "PM" && hh !== 12) hour24 = hh + 12;
    if (period.toUpperCase() === "AM" && hh === 12) hour24 = 0;
    return hour24 * 60 + mm;
  };

  // Parse duration string (e.g., "1 hr", "2 hrs 30 mins", "90 mins") to minutes
  const parseDurationToMinutes = (raw: unknown): number => {
    if (raw === null || raw === undefined) return 0;
    if (typeof raw === "number") {
      return Number.isFinite(raw) && raw >= 0 ? raw : 0;
    }
    if (typeof raw !== "string") return 0;
    const s = raw.trim().toLowerCase();
    if (!s) return 0;
    // Pure number => minutes
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    let total = 0;
    const hourMatch = s.match(/(\d+)\s*(hour|hr|hrs|h)/);
    if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
    const minuteMatch = s.match(/(\d+)\s*(minute|min|mins|m)/);
    if (minuteMatch) total += parseInt(minuteMatch[1], 10);
    // Support compact forms like 1h30m
    if (total === 0) {
      const compact = s.match(/(\d+)h(\d+)?m?/);
      if (compact) {
        total += parseInt(compact[1], 10) * 60;
        if (compact[2]) total += parseInt(compact[2], 10);
      }
    }
    // Heuristic fallback if still zero: grab first number(s)
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

  // Base package duration minutes
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

  // Mapping of add-on IDs that contribute extra session minutes
  const EXTRA_DURATION_ADDON_MINUTES: Record<string, number> = {
    "70": 5, // Addl 5 mins
    "80": 20, // Photographer service for 20 mins
    "90": 60, // Photographer service for 1 hr
  };

  // Sum extra minutes from selected active add-ons
  const extraDurationMinutes = selectedAddons.reduce((sum, addon) => {
    if (addon.value <= 0) return sum;
    const perUnit = EXTRA_DURATION_ADDON_MINUTES[addon.id];
    if (!perUnit) return sum;
    // If spinner quantity, multiply; otherwise add once
    const qty = addon.type === "spinner" ? addon.value : 1;
    return sum + perUnit * qty;
  }, 0);

  const effectivePackageDuration = basePackageDuration + extraDurationMinutes;
  if (extraDurationMinutes > 0) {
    console.log(
      "DEBUG effective duration: base",
      basePackageDuration,
      "+ extra",
      extraDurationMinutes,
      "= total",
      effectivePackageDuration
    );
  }

  // Business day boundaries in minutes (start 09:00, end after last slot 21:00 to allow 8:30 PM 30-min slot)
  // Adjusted business end boundary: removing 07:30 PM onward means last valid start (e.g., 07:00 PM for 60m)
  // Set day end to 20:00 (8 PM) so validation blocks later starts.
  const DAY_END_MIN = 20 * 60; // 08:00 PM absolute upper bound (exclusive)

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
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10 drop-shadow-xl">
        {/* 👉 Breadcrumb embedded here */}
        <nav className="text-sm text-black mb-6">
          <button
            onClick={() => navigate(-1)}
            className="hover:underline text-gray-400"
          >
            Back
          </button>{" "}
          / Book {pkg.title}
        </nav>

        {/* Top Section */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex-shrink-0">
            <img
              src={pkg.images[0]}
              alt="Cover"
              className="rounded-xl object-cover w-full aspect-square"
            />
          </div>

          <div className="md:w-2/3 space-y-3">
            <span className="uppercase tracking-wide text-xs text-gray-400">
              {pkg.tags[0]}
            </span>
            <h2 className="text-3xl font-semibold text-gray-800">
              {pkg.title}
            </h2>
            <p className="text-lg text-gray-600 font-medium">PHP {pkg.price}</p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-3 space-y-1">
              {pkg.description}
            </ul>
          </div>
        </div>

        {/*Header for Selected Tags*/}

        {setData && Number(setData.setId) !== 5 && (
          <div className="flex items-center gap-4 flex-wrap">
            <h3 className="text-lg font-bold text-gray-800">
              Set the Scene{" "}
              <span className="text-sm font-normal text-gray-500">
                (Choose your studio):
              </span>
            </h3>

            {tags.map((tag) => (
              <span
                key={tag.type}
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-xl"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Determine visibility and interactivity */}
            {(() => {
              const setIdNum = Number(setData.setId);
              const showStudioA = setIdNum !== 5 && setIdNum !== 6;
              const enableStudioB =
                setIdNum === 2 ||
                setIdNum === 4 ||
                setIdNum === 3 ||
                setIdNum === 6;

              // Helper for mutual exclusivity if set 2
              const handleStudioASelect = () => {
                setStudioAFlipped((s) => !s);
                //if (setIdNum === 2) setStudioBFlipped(false);
                setStudioBFlipped(false);
              };
              const handleStudioBSelect = () => {
                if (!enableStudioB) return;
                setStudioBFlipped((s) => !s);
                //if (setIdNum === 2) setStudioAFlipped(false);
                setStudioAFlipped(false);
              };

              return (
                <>
                  {/* Studio A - Plain Backdrop */}
                  {showStudioA && (
                    <div className="w-full">
                      <div
                        onClick={handleStudioASelect}
                        className="w-full h-25 bg-white rounded-xl shadow-lg flex items-center justify-center p-4 cursor-pointer relative"
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
                              <span className="text-lg font-semibold text-gray-800">
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
                              className="absolute inset-0 bg-gray-100 rounded-xl shadow-lg flex flex-wrap items-center justify-center gap-3 p-3 overflow-auto"
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
                                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg shadow-md cursor-pointer"
                                    style={{ backgroundColor: color.hex }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedColorA(color.id);
                                      // use colorOptions directly; no temp label var
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

                  {/* Studio B - Concept Studio */}
                  {setIdNum !== 5 && (
                    <div className="w-full">
                      <div
                        onClick={
                          enableStudioB ? handleStudioBSelect : undefined
                        }
                        className={`w-full h-25 rounded-xl shadow-lg flex items-center justify-center p-4 relative ${
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
                                className={`text-lg font-semibold ${
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
                              className="absolute inset-0 bg-gray-100 rounded-xl shadow-lg flex flex-wrap items-center justify-center gap-8 p-3 overflow-auto max-h-64"
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
                                      className={`relative w-30 h-12 rounded-lg shadow-md bg-cover bg-center overflow-hidden cursor-pointer ${
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
                                          // Remove old StudioB tag before adding a new one
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
                                      <div
                                        className="absolute inset-0 flex items-center justify-center rounded-lg
                      bg-gray-800 bg-opacity-20 text-white text-xs font-medium
                      opacity-0 hover:opacity-100 transition-opacity duration-500 text-center px-1 break-words"
                                      >
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

        {/* Add Ons Section */}
        <div className="bg-white text-gray-900 rounded-xl shadow p-6 px-25 space-y-4">
          <h3 className="text-lg font-semibold">Add Ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {addOns.map((item) => {
              const isActive = !!activeAddOns[item.id];
              // total price is computed inline below using selectedAddons

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    toggleCheckboxAddon(item.id);
                  }}
                  className={`group relative flex flex-col gap-2 p-3 rounded-lg border transition-all duration-200
                    ${
                      isActive
                        ? "bg-neutral-900 border-neutral-700 text-white shadow-lg"
                        : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400"
                    }`}
                >
                  {/* ✅ Added badge for ALL active items (including spinner) */}
                  {isActive && (
                    <span className="absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm">
                      Added
                    </span>
                  )}

                  {/* Label + Price */}
                  <div className="flex justify-between items-center w-full">
                    <span
                      className={`text-sm font-medium ${
                        isActive ? "text-white" : "text-gray-900"
                      }`}
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

                  {/* Control Area */}
                  {item.type === "multiple" && (
                    <div className="flex items-center justify-between gap-2">
                      {/* Quantity Input */}
                      <input
                        type="number"
                        min={item.minQty ?? 1}
                        {...(item.maxQty ? { max: item.maxQty } : {})}
                        value={
                          selectedAddons.find((a) => a.id === item.id)?.value ||
                          (item.minQty ?? 1)
                        }
                        onChange={(e) => {
                          const entered = parseInt(e.target.value, 10);
                          const minQ = item.minQty ?? 1;
                          const maxQ = item.maxQty ?? Number.POSITIVE_INFINITY;
                          const clamped = isNaN(entered)
                            ? minQ
                            : Math.min(Math.max(entered, minQ), maxQ);
                          handleAddonChange(item.id, clamped);
                        }}
                        onBlur={(e) => {
                          const parsed = parseInt(e.target.value, 10);
                          const minQ = item.minQty ?? 1;
                          const maxQ = item.maxQty ?? Number.POSITIVE_INFINITY;
                          const clamped = isNaN(parsed)
                            ? minQ
                            : Math.min(Math.max(parsed, minQ), maxQ);
                          if (clamped !== parsed) {
                            handleAddonChange(item.id, clamped);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 border rounded p-1"
                      />

                      {/* Total Price beside input */}
                      {isActive ? (
                        <span className="justify-self-end self-end text-sm font-medium text-white">
                          ₱
                          {item.price *
                            (selectedAddons.find((a) => a.id === item.id)
                              ?.value || 1)}
                        </span>
                      ) : null}
                    </div>
                  )}

                  {item.type === "dropdown" &&
                    isActive && ( // only show if add-on is active
                      <div className="relative w-full">
                        {/* Color swatches popup */}
                        <AnimatePresence>
                          {showingColors[item.id] && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute -top-14 left-1/2 -translate-x-1/2 p-3 bg-white rounded-lg shadow-lg flex gap-2"
                            >
                              {colorOptions.map((color) => (
                                <button
                                  key={color.id}
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    // update UI swatch
                                    setSelectedColors((prev) => ({
                                      ...prev,
                                      [item.id]: color,
                                    }));

                                    // update selectedAddons array
                                    setSelectedAddons((prev) => {
                                      const filtered = prev.filter(
                                        (a) => a.id !== item.id
                                      );
                                      return [
                                        ...filtered,
                                        {
                                          id: item.id,
                                          label: item.label, // e.g. "Additional Backdrop"
                                          price: item.price ?? 0,
                                          value: activeAddOns[item.id] ? 1 : 0, // Only select if actually activated
                                          type: "dropdown",
                                          option: color.label, // "WHITE", "BLACK", etc.
                                        } as SelectedAddon,
                                      ];
                                    });

                                    // keep rest of your logic (removed auto-activation)
                                    setShowingColors((prev) => ({
                                      ...prev,
                                      [item.id]: false,
                                    }));
                                    handleDropdownChange(item.id, color.label);
                                    console.log(
                                      "Selected color for",
                                      item.id,
                                      ":",
                                      color.label
                                    );
                                  }}
                                  className="w-6 h-6 rounded-full border border-gray-400 shadow-sm hover:scale-110 transition"
                                  style={{ backgroundColor: color.hex }}
                                />
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Button that opens color picker */}
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
                                selectedColors?.[item.id]?.hex || "#FFFFFF"; // fallback white
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <div className="flex flex-col lg:flex-row justify-center ml-20 mr-20">
            <div className="lg:w-1/2">
              <div
                className="hidden md:block bg-white p-4 rounded-xl"
                style={{ filter: "grayscale(100%)" }}
              >
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date && !isDateInPast(date)) {
                      setSelectedDate(date);
                      setSelectedTime(""); // Reset time selection when date changes
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

            {/* Timeslots */}
            <div className="lg:w-1/2">
              <h4 className="text-sm text-gray-700 mb-2 font-medium">
                Available Time Slots
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const slotStart = slotLabelToMinutes(slot);
                  const slotEnd = slotStart + 30; // base slot span
                  const isPastTime = selectedDate
                    ? isTimeSlotInPast(slot, selectedDate)
                    : false;
                  // Overlaps any existing booking interval?
                  const overlapsExisting = bookedIntervals.some(
                    (iv) =>
                      // If slot start within interval OR slot end within interval OR interval starts inside this slot base window
                      slotStart < iv.end && slotEnd > iv.start
                  );
                  // If user started a new booking at this slot, would its duration overlap existing intervals or exceed day end?
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
                      className={`py-2 px-3 text-sm rounded-md transition text-center ${
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
        <div className="bg-neutral-900 text-white rounded-xl shadow p-6 space-y-6">
          <h3 className="text-lg font-semibold">Personal Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer Name"
              className="w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm placeholder-gray-400"
            />
            <input
              value={contact}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d]/g, ""); // Only allow digits
                if (value.length <= 11) {
                  // Limit to 11 digits
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

          {/* Staff Name Display */}
          <div className="mt-4 text-sm">
            <span className="text-gray-400">Staff: </span>
            <span className="text-white font-medium">{staffName}</span>
          </div>

          <div className="text-sm space-y-4">
            <div className="text-sm space-y-4">
              {/* Terms and Agreements Checkbox */}
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreed} // State for the first checkbox
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <strong>I accept</strong> the Terms and Agreements . By using
                  our system and services, you agree to abide by the following
                  rules and conditions.
                </span>
              </label>

              {/* Down Payment Agreement Checkbox */}
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreedToPayment} // State for the second checkbox
                  onChange={(e) => setAgreedToPayment(e.target.checked)}
                  className="mt-1"
                  disabled={!agreed} // Disable this checkbox until the first one is checked
                />
                <span>
                  <strong>I agree</strong> to pay PHP 200 down payment to
                  confirm booking.{" "}
                  <strong>
                    Please note that the down payment is non-refundable.
                  </strong>{" "}
                  The remaining balance is due on the day of the photoshoot or
                  service.
                </span>
              </label>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="w-full bg-black text-white py-3 rounded-md disabled:opacity-50"
                  disabled={!agreed || !agreedToPayment} // Both checkboxes must be checked
                  onClick={() => handleShowPreview("deposit")}
                >
                  Confirm with Deposit
                </button>
                <button
                  className="w-full bg-white text-black py-3 rounded-md disabled:opacity-50"
                  disabled={!agreed || !agreedToPayment} // Both checkboxes must be checked
                  onClick={() => handleShowPreview("full")}
                >
                  Full Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModalBooking
        isOpen={isModalOpen}
        onClose={handleModalClose}
        previewData={previewData}
        tags={tags}
        addons={addOns}
        selectedAddons={selectedAddons}
        staffName={staffName}
      />
    </>
  );
};

export default SelectPackagePage;

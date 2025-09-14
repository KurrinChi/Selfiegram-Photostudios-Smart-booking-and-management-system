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
    type: "spinner" | "checkbox" | "dropdown";
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
    addOnPrice: string;
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
  const luma = (0.299 * r + 0.587 * g + 0.114 * b); // brightness
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

  interface BookingData {
    id: string;
    customerName: string;
    email: string;
    address: string;
    contact: string;
    package: string;
    bookingDate: string;
    transactionDate: string;
    time: string;
    subtotal: number;
    paidAmount: number;
    pendingBalance: number;
    feedback: string;
    rating: number;
    status: number;
    paymentStatus: number;
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
   

    
    const [tags, setTags] = useState<Tag[]>([]);
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);
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
      fetchWithAuth(`${API_URL}/api/packages/${id}/set-concepts`)
        .then((res) => res.json())
        .then((data) => setSetData(data))
        .catch((err) => console.error("Failed to fetch set concepts:", err));
    }
  }, [id]);

  const addOnsMap: Record<number, AddOn> = {
    20: { id: "pax", label: "Addl pax", price: 129, type: "spinner" },
    10: { id: "portrait", label: "Addl Portrait Picture", price: 49, type: "spinner" },
    30: { id: "grid", label: "Addl Grid Picture", price: 69, type: "spinner" },
    40: { id: "a4", label: "Addl A4 Picture", price: 129, type: "spinner" },
    50: { id: "backdrop", label: "Addl Backdrop", price: 129, type: "dropdown", options: ["Floral", "Modern", "Classic"] },
    60: { id: "digital", label: "All digital copies", price: 199, type: "checkbox" },
    70: { id: "extra5", label: "Addl 5 mins", price: 129, type: "checkbox" },
    80: { id: "photo20", label: "Photographer service for 20mins", price: 599, type: "checkbox" },
    90: { id: "photo60", label: "Photographer service for 1hr", price: 1699, type: "checkbox" },
    100: { id: "makeup", label: "Professional Hair & Make up", price: 1699, type: "checkbox" },
  };
  const addonArray: AddOn[] = addOns.map(a => ({
    ...a,
    value: 0,
  }));
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddon[]>([]);
  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        const res = await fetchWithAuth(`${API_URL}/api/packages/${id}/addons`);
        if (!res.ok) throw new Error("Failed to fetch add-ons");

        const result = await res.json();

        // Ensure result.data is an array
        const arrayData: FetchedAddOn[] = Array.isArray(result.data) ? result.data : [];

        // Merge fetched add-ons with static definitions
        const mergedAddOns: AddOn[] = arrayData
          .map((dbItem) => {
            const staticDef = addOnsMap[dbItem.addOnID];
            if (!staticDef) return null; // ignore unknown IDs
            return { ...staticDef, price: Number(dbItem.addOnPrice) };
          })
          .filter((item): item is AddOn => Boolean(item)); // type-safe filter

        setAddOns(mergedAddOns);
      } catch (error) {
        console.error("Error fetching add-ons:", error);
      }
    };

    if (id) fetchAddOns();
  }, [id]);

 const toggleAddOn = (id: string, forceActive?: boolean, type?: string) => {
  setActiveAddOns(prev => {
    const isActive = typeof forceActive === "boolean" ? forceActive : !prev[id];

    // If activating a dropdown, set default color at index 0
    if (isActive && type === "dropdown" && colorOptions.length > 0) {
      const firstColor = colorOptions[0];
      setSelectedColors(prevColors => ({ ...prevColors, [id]: firstColor }));
      handleDropdownChange(id, firstColor.label); // store the label in selectedAddons
    }

    // If deactivating, remove selected color
    if (!isActive) {
      setSelectedColors(prevColors => {
        const copy = { ...prevColors };
        delete copy[id];
        return copy;
      });
    }

    return { ...prev, [id]: isActive };
  });
};



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

    const [quantities, setQuantities] = useState<{ [id: string]: number }>({});

    // ✅ Initialize spinners with qty=1 but NOT active
    useEffect(() => {
      const initial: { [id: string]: number } = {};
      addOns.forEach((item) => {
        if (item.type === "spinner") {
          initial[item.id] = 1;
        }
      });
      setQuantities(initial);
    }, []);

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
        const alreadyExists = prev.some(a => a.id === item.id);
        if (alreadyExists) return prev;

        return [
          ...prev,
          {
            id: item.id,
            label: item.label,     // e.g., "Additional Backdrop"
            price: item.price ?? 0,
            value: 1,              // mark as active/selected
            type: "dropdown",
            option: "WHITE",       // default choice
          } as SelectedAddon,
        ];
      });
    }
  });
}, [addOns]);

    const handleAddonChange = (id: string, value?: string | number) => {
     setSelectedAddons((prev) =>
    prev.map((addon) =>
      addon.id === id
        ? {
            ...addon,
            value: addon.type === "dropdown" ? 1 : (value as number), // dropdown always 1
            option: addon.type === "dropdown" ? (value as string) : undefined,
          }
        : addon
    )
  );
    };


    
  // For toggling checkboxes
      const toggleCheckboxAddon = (id: string) => {
   setActiveAddOns(prev => {
    const newActive = !prev[id];

    setSelectedAddons(prevAddons => {
      const existing = prevAddons.find(a => a.id === id);
      if (existing) {
        return prevAddons.map(a =>
          a.id === id ? { ...a, value: newActive ? 1 : 0 } : a
        );
      } else if (newActive) {
        const newAddon = addOns.find(a => a.id === id);
        if (!newAddon) return prevAddons;
        return [...prevAddons, { ...newAddon, value: 1 }];
      }
      return prevAddons;
    });

    return { ...prev, [id]: newActive };
  
  });
      };

      // For spinners
      const handleSpinnerChange = (id: string, qty: number) => {
            setSelectedAddons(prev =>
          prev.map(a => (a.id === id ? { ...a, value: qty } : a))
        );
      };

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
          `${API_URL}/api/booked-slots?date=${formattedDate}`
        );
        const data = await response.json();

        if (response.ok) {
          setBookedTimeSlots(data.bookedSlots || []);
        } else {
          setBookedTimeSlots([]);
        }
      } catch (error) {
        console.error("Failed to fetch booked time slots:", error);
        setBookedTimeSlots([]);
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

    // Fetch booked slots when date changes
    useEffect(() => {
      if (selectedDate) {
        fetchBookedTimeSlots(selectedDate);
      }
    }, [selectedDate]);

    const handleShowPreview = (paymentType: "deposit" | "full") => {
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
      };

      setPreviewData(preview);
      setIsModalOpen(true);
    };

    const handleModalClose = () => {
      setIsModalOpen(false);
      setPreviewData(null);
    };

    const handleBookingComplete = (_bookingData: BookingData) => {
      // Booking was successfully created
      setIsModalOpen(false);
      setPreviewData(null);

      // Show success toast message
      toast.success("Booking successful! Your appointment has been confirmed.");

      // Add a small delay before navigation to ensure toast is visible
      setTimeout(() => {
        navigate("/client/packages");
      }, 2000); // 2 seconds delay
    };

    if (!pkg)
      return <div className="p-4 text-sm text-gray-500">Loading package...</div>;

    const timeSlots = Array.from({ length: 23 }, (_, i) => {
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
    });

    const handleRemoveTag = (type: string) => {
      setTags(prev => prev.filter(t => t.type !== type));

      if (type === "studioA") {
        setSelectedColorA(null);
      } else if (type === "studioB") {
        setSelectedStudioB(null);
      }
    };

    const conceptImages: Record<string, string> = {
    "BOHEMIAN DREAM": "/3.png",
    "CHINGU PINK": "/4.png",
    "SPOTLIGHT": "/5.png",
    "GRADUATION": "/2.png",
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
            ? { backgroundColor: tag.hex, color: getContrastColor(tag.hex) }
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
      const showStudioA = setIdNum !== 5;
      const enableStudioB = setIdNum === 2 || setIdNum === 4 || setIdNum === 3;

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
                      className="absolute inset-0 bg-gray-100 rounded-xl shadow-lg flex flex-wrap items-center justify-center gap-6 p-3"
                    >
                      {colorOptions.map((color) => {
                        const isSelected = selectedColorA === color.id;
                        return (
                          <motion.div
                            key={color.id}
                            whileHover={{ scale: 1.08 }}
                            animate={{ scale: isSelected ? 1.25 : 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                            className="w-10 h-10 rounded-lg shadow-md cursor-pointer"
                            style={{ backgroundColor: color.hex }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedColorA(color.id);

                                const label = colorOptions.find(c => c.id === color.id)?.label || "Color";
                              setTags(prev => {
                              const colorObj = colorOptions.find(c => c.id === color.id);
                              if (!colorObj) return prev;

                              const filtered = prev.filter(t => t.type !== "studioA");
                              return [
                                ...filtered,
                                { id: String(colorObj.id), label: colorObj.label, type: "studioA", hex: colorObj.hex }
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
      onClick={enableStudioB ? handleStudioBSelect : undefined}
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
                enableStudioB ? "text-gray-800" : "text-gray-400"
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
              .filter((c) => (c.type || "").toLowerCase() === "studio")
              .map((concept, i) => {
                const isSelected = selectedStudioB === i;
                const keyLabel = (concept.label || "").trim().toUpperCase();
                const imgSrc = conceptImages[keyLabel] || "/default.png";
       
                return (
                  <motion.div
                    key={concept.id}
                    whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
                    animate={{ scale: isSelected ? 1.2 : 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className={`relative w-30 h-12 rounded-lg shadow-md bg-cover bg-center overflow-hidden cursor-pointer ${
                      !enableStudioB ? "opacity-50" : ""
                    }`}
                    style={{ backgroundImage: `url(${imgSrc})` }}
                    onClick={(e) => {
                      if (!enableStudioB) return;
                      e.stopPropagation();
                      setSelectedStudioB(i);

                      
                      const label = concept.label || "Concept";

                      setTags(prev => {
                        // Remove old StudioB tag before adding a new one
                        const filtered = prev.filter(t => t.type !== "studioB");
                        return [...filtered, { id: String(concept.id), label, type: "studioB" }];
                      });
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg
                      bg-gray-800 bg-opacity-20 text-white text-xs font-medium
                      opacity-0 hover:opacity-100 transition-opacity duration-500 text-center px-1 break-words">
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
                const qty = quantities[item.id] || 0;
                const totalPrice =
                  item.type === "spinner" ? item.price * qty : item.price;

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
                    {item.type === "spinner" && (
                      <div className="flex items-center justify-between gap-2">
                        {/* Quantity Input */}
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={selectedAddons.find(a => a.id === item.id)?.value || 1} // default 1
                          onChange={(e) => handleAddonChange(item.id, parseInt(e.target.value))}
                          onClick={(e) => e.stopPropagation()} // prevent toggling
                          className="w-16 border rounded p-1"
                        />

                        {/* Total Price beside input */}
                        {isActive ? (
                      <span className="justify-self-end self-end text-sm font-medium text-white">
                        ₱{item.price * (selectedAddons.find(a => a.id === item.id)?.value || 1)}
                      </span>
                    ):null}
                    </div>
                    )}


 {item.type === "dropdown" && isActive && (  // only show if add-on is active
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
  setSelectedColors((prev) => ({ ...prev, [item.id]: color }));

  // update selectedAddons array
  setSelectedAddons((prev) => {
    const filtered = prev.filter(a => a.id !== item.id);
    return [
      ...filtered,
      {
        id: item.id,
        label: item.label,     // e.g. "Additional Backdrop"
        price: item.price ?? 0,
        value: 1,              // selected
        type: "dropdown",
        option: color.label,   // "WHITE", "BLACK", etc.
      } as SelectedAddon,
    ];
  });

  // keep rest of your logic
  toggleAddOn(item.id, true);
  setShowingColors((prev) => ({ ...prev, [item.id]: false }));
  handleDropdownChange(item.id, color.label);
  console.log("Selected color for", item.id, ":", color.label);
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
        backgroundColor: selectedColors?.[item.id]?.hex || "#272727",
        color: (() => {
          const hex = selectedColors?.[item.id]?.hex || "#FFFFFF"; // fallback white
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
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
                    const isBooked = bookedTimeSlots.includes(slot);
                    const isPastTime = selectedDate
                      ? isTimeSlotInPast(slot, selectedDate)
                      : false;
                    const isDisabled = isBooked || isPastTime;

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
                          isBooked
                            ? "This time slot is already booked"
                            : isPastTime
                            ? "This time slot has passed"
                            : ""
                        }
                      >
                        {slot}
                        {isBooked && (
                          <span className="block text-xs text-red-500">
                            Booked
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
                placeholder="Name"
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

            <div className="text-sm space-y-4">
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <strong>I agree</strong> to pay PHP 200 down payment to confirm
                  booking. The remaining balance is due on the day of the
                  photoshoot or service.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="w-full bg-black text-white py-3 rounded-md disabled:opacity-50"
                  disabled={!agreed}
                  onClick={() => handleShowPreview("deposit")}
                >
                  Confirm with Deposit
                </button>
                <button
                  className="w-full bg-white text-black py-3 rounded-md disabled:opacity-50"
                  disabled={!agreed}
                  onClick={() => handleShowPreview("full")}
                >
                  Full Payment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Modal */}
        <TransactionModalBooking
          isOpen={isModalOpen}
          onClose={handleModalClose}
          previewData={previewData}
          onBookingComplete={handleBookingComplete}
          tags={tags}
          addons={addOns} 
          selectedAddons={selectedAddons}
        />

        {/* Toast Container */}
        <ToastContainer position="bottom-right" />
      </>
    );
  };

  export default SelectPackagePage;

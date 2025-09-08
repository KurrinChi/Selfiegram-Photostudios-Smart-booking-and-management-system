import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { isToday, isSameDay, startOfDay } from "date-fns";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import TransactionModal from "../ModalTransactionDialog";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  paymentType: 'deposit' | 'full';
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
  const [paymentMode, setPaymentMode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewBookingData | null>(null);
  const [bookedTimeSlots, setBookedTimeSlots] = useState<string[]>([]);

  // Helper function to get current Philippine time
  const getPhilippineTime = () => {
    // Create a new date in Philippine timezone (UTC+8)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const philippineTime = new Date(utc + (8 * 3600000)); // UTC+8
    return philippineTime;
  };

  // Helper function to format date for database (YYYY-MM-DD in Philippine timezone)
  const formatDateForDatabase = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
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
    const [time, period] = timeSlot.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    let slotHour = hour;
    
    if (period === 'PM' && hour !== 12) {
      slotHour += 12;
    } else if (period === 'AM' && hour === 12) {
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
      const response = await fetchWithAuth(`${API_URL}/api/booked-slots?date=${formattedDate}`);
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
      !paymentMode ||
      !pkg
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(contact)) {
      toast.error("Contact number must start with 09 and have exactly 11 digits");
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
      toast.error("This time slot is already booked. Please select another time.");
      return;
    }

    const subtotal = pkg.price;
    const paidAmount = paymentType === 'full' ? subtotal : 200;
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
      packageId: id!
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
    return <div className="p-4 text-sm text-gray-500">Package not found.</div>;

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
            <p className="text-lg text-gray-600 font-medium">
              PHP {pkg.price}
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 mt-3 space-y-1">
              {pkg.description.split("\n").map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
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
                  const isPastTime = selectedDate ? isTimeSlotInPast(slot, selectedDate) : false;
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
                        <span className="block text-xs text-red-500">Booked</span>
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
                const value = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
                if (value.length <= 11) { // Limit to 11 digits
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
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="col-span-1 md:col-span-2 w-full px-4 py-3 rounded bg-neutral-800 border border-neutral-700 text-sm text-white"
            >
              <option value="">Select Mode of Payment</option>
              <option value="GCash">GCash</option>
              <option value="Cash">Cash</option>
            </select>
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
                booking. The remaining balance is due on the day of the photoshoot
                or service.
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
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        previewData={previewData}
        onBookingComplete={handleBookingComplete}
      />

      {/* Toast Container */}
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default SelectPackagePage;

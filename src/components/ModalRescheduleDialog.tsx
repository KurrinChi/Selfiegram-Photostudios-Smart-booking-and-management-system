import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface ModalRescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, requestedDate: string, requestedStartTime: string) => void;
  bookingID: number; // Add bookingID prop
  userID: number; // Add userID prop
}
const API_URL = import.meta.env.VITE_API_URL;

const ModalRescheduleDialog: React.FC<ModalRescheduleDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  // bookingID, // Reserved for future booking-specific validations
  // userID, // Reserved for future user permission checks
}) => {
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  const timeSlots = [
    "9 AM", "10 AM", "11 AM",
    "12 PM", "1 PM", "2 PM",
    "3 PM", "4 PM", "5 PM",
    "6 PM", "7 PM",
  ];

  // (Removed unavailable-dates fetch; time-slot layer drives availability)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSelectedDate(undefined);
      setSelectedTime(null);
    }
  }, [isOpen]);

  function isSameDay(a: Date, b?: Date) {
    return !!b && a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  }

  function isToday(date: Date) {
    const today = new Date();
    return isSameDay(date, today);
  }

  // (removed generic past-date; we use PH-based past-date below)

  // (weekend helper removed; not used)

  // (date-level unavailability not styled; time-slot layer handles availability)

  // (removed 24-hour lead restriction)

    // Get today's date in Philippine Standard Time (Asia/Manila)
    function getTodayInPH(): Date {
      const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const parts = fmt.format(new Date()); // YYYY-MM-DD
      const [y, m, d] = parts.split('-').map((v) => parseInt(v, 10));
      return new Date(y, (m || 1) - 1, d || 1); // Local Date at midnight, representing PH calendar date
    }

    // Check if date is in the past relative to PH date
    function isPastDatePH(date: Date) {
      const phToday = getTodayInPH();
      phToday.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate < phToday;
    }
  // Only disable past dates (Philippine time)
  function isDisabled(date: Date) {
    return isPastDatePH(date);
  }

  // Convert server 12-hour time (e.g., "09:00 AM") to slot label (e.g., "9 AM")
  function normalizeServerTimeToSlotLabel(serverTime: string): string {
    const match = serverTime.match(/^(\d{1,2}):\d{2}\s*(AM|PM)$/i);
    if (!match) return serverTime;
    let hour = parseInt(match[1], 10);
    const ampm = match[2].toUpperCase();
    if (hour === 0) hour = 12;
    return `${hour} ${ampm}`;
  }

  // Load booked slots for the selected date
  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDate) {
        setBookedSlots([]);
        return;
      }
      try {
        const dateStr = formatDateToString(selectedDate);
        const res = await fetchWithAuth(`${API_URL}/api/booked-slots?date=${dateStr}`);
        if (!res.ok) {
          setBookedSlots([]);
          return;
        }
        const data = await res.json();
        const slots: string[] = Array.isArray(data.bookedSlots) ? data.bookedSlots : [];
        const normalized = slots.map(normalizeServerTimeToSlotLabel);
        setBookedSlots(normalized);

        // If all time slots are booked, clear any selected time; also clear if the selected slot became booked
        const allBooked = timeSlots.every(s => normalized.includes(s));
        if (allBooked) {
          setSelectedTime(null);
        } else if (selectedTime && normalized.includes(selectedTime)) {
          setSelectedTime(null);
        }
      } catch (e) {
        console.error('Error fetching booked slots:', e);
      }
    };

    fetchBooked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  function to24Hour(time12h: string) {
    try {
      console.log("Converting time:", time12h);
      
      // Split the time and modifier (AM/PM)
      const parts = time12h.trim().split(" ");
      if (parts.length !== 2) {
        console.error("Invalid time format:", time12h);
        return "00:00";
      }
      
      const [timeStr, modifier] = parts;
      let hours = parseInt(timeStr);
      
      // Validate hours
      if (isNaN(hours) || hours < 1 || hours > 12) {
        console.error("Invalid hours:", hours);
        return "00:00";
      }
      
      // Convert to 24-hour format
      if (modifier.toUpperCase() === "PM" && hours !== 12) {
        hours += 12;
      } else if (modifier.toUpperCase() === "AM" && hours === 12) {
        hours = 0;
      }
      
      const result = `${String(hours).padStart(2, "0")}:00`;
      console.log("Converted to 24-hour:", result);
      return result;
      
    } catch (error) {
      console.error("Error converting time:", error);
      return "00:00";
    }
  }

  // Helper function to format date without timezone issues
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Test the time conversion function when component loads (for debugging)
  useEffect(() => {
    if (isOpen) {
      console.log("=== TIME SLOTS DEBUG ===");
      console.log("Available time slots:", timeSlots);
      console.log("Testing time conversion:");
      timeSlots.forEach(slot => {
        const converted = to24Hour(slot);
        console.log(`${slot} -> ${converted}`);
      });
      console.log("========================");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    // Validate all required fields
    if (!reason.trim()) {
      toast.error("Please provide a reason for rescheduling.");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date for your appointment.");
      return;
    }

    if (!selectedTime) {
      toast.error("Please select a time slot for your appointment.");
      return;
    }

    // Safety: ensure selected time is still available at submit time
    if (!!selectedTime && bookedSlots.includes(selectedTime)) {
      toast.error("The selected time slot has just been booked. Please choose another.");
      return;
    }

    // Additional validation for the selected date
    if (isDisabled(selectedDate)) {
      toast.error("The selected date is not available. Please choose another date.");
      return;
    }

    // Validate reason length
    if (reason.trim().length < 10) {
      toast.error("Please provide a more detailed reason (at least 10 characters).");
      return;
    }

    // Use the timezone-safe date formatting function
    const requestedDate = formatDateToString(selectedDate);
    const formattedTime = to24Hour(selectedTime);

    console.log("=== RESCHEDULE SUBMISSION ===");
    console.log("Selected date object:", selectedDate);
    console.log("Formatted date (YYYY-MM-DD):", requestedDate);
    console.log("Selected time (12-hour):", selectedTime);
    console.log("Formatted time (24-hour):", formattedTime);
    console.log("Reason:", reason.trim());
    console.log("================================");

    // Call parent onSubmit with correct arguments
    onSubmit(reason.trim(), requestedDate, formattedTime);
    onClose();
  };

if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-3xl space-y-6">
        <h2 className="text-center text-lg font-semibold">
          Rescheduling Appointment
        </h2>
        <p className="text-center text-sm text-gray-500">
          The appointment will be rescheduled to the proposed date and time.
          <br />
          Please select your preferred option below.
        </p>

        <div className="flex flex-col lg:flex-row justify-center gap-8">
          <div className="lg:w-1/2">
            {
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setSelectedTime(null); // Reset time selection when date changes
                  }
                }}
                captionLayout="label"
                fromDate={getTodayInPH()} // Start from PH today
                toDate={new Date(new Date().setMonth(new Date().getMonth() + 3))} // 3 months ahead
                disabled={isDisabled}
                modifiers={{
                  selected: (d) => !!selectedDate && isSameDay(d, selectedDate),
                  today: (d) => isToday(d),
                }}
                modifiersClassNames={{
                  selected: "bg-gray-800 text-white",
                  today: "font-bold text-black bg-gray-100 rounded-xl",
                }}
                classNames={{
                  caption: "text-sm text-black",
                  day: "text-sm",
                  nav_button: "text-black hover:bg-gray-100 p-1 rounded",
                  nav_icon: "stroke-black fill-black w-4 h-4",
                  day_disabled: "text-gray-300 cursor-not-allowed",
                }}
              />
            }
            
            {/* Date Selection Help Text */}
            <div className="mt-2 text-xs text-gray-500">
              <p>• Select a date; unavailable time slots will be disabled.</p>
            </div>
          </div>

          <div className="lg:w-1/2">
            <h4 className="text-sm text-gray-700 mb-2 font-medium">
              Available Time Slots
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  disabled={!selectedDate || bookedSlots.includes(slot)}
                  className={`py-3 px-2 text-xs font-medium rounded-md transition text-center whitespace-nowrap ${
                    !selectedDate || bookedSlots.includes(slot)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : selectedTime === slot
                        ? "bg-black text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  title={slot} // Add tooltip to show full time
                >
                  {slot}
                </button>
              ))}
            </div>
            {selectedDate && timeSlots.every(s => bookedSlots.includes(s)) && (
              <div className="mt-3 text-sm text-red-600">
                All time slots are fully booked for this date.
              </div>
            )}
            
            {/* Selected time display */}
            {selectedTime && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Selected time: </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-black font-mono">
                  {selectedTime}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 text-sm">
          <label htmlFor="reason" className="block font-medium mb-1">
            Reason for Rescheduling <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={`w-full border rounded-md px-3 py-2 bg-gray-50 resize-none ${
              reason.trim().length > 0 && reason.trim().length < 10
                ? "border-red-300 focus:border-red-500"
                : "border-gray-300 focus:border-gray-500"
            }`}
            rows={4}
            placeholder="Please provide a detailed reason for rescheduling your appointment..."
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <span className={`text-xs ${
              reason.trim().length > 0 && reason.trim().length < 10
                ? "text-red-500"
                : "text-gray-500"
            }`}>
              {reason.trim().length < 10 && reason.trim().length > 0
                ? `Please provide more details (${10 - reason.trim().length} more characters needed)`
                : reason.trim().length >= 10
                ? "Thank you for the detailed reason"
                : "Minimum 10 characters required"}
            </span>
            <span className="text-xs text-gray-400">
              {reason.length}/500
            </span>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={onClose}
            className="w-full py-2 border rounded-md text-sm hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={
              !reason.trim() ||
              reason.trim().length < 10 ||
              !selectedDate ||
              !selectedTime ||
              (selectedDate && isDisabled(selectedDate)) ||
              (!!selectedTime && bookedSlots.includes(selectedTime))
            }
            className={`w-full py-2 text-sm rounded-md ml-4 transition-all ${
              !reason.trim() ||
              reason.trim().length < 10 ||
              !selectedDate ||
              !selectedTime ||
              (selectedDate && isDisabled(selectedDate)) ||
              (!!selectedTime && bookedSlots.includes(selectedTime))
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-black text-white hover:opacity-80"
            }`}
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ModalRescheduleDialog;
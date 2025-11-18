import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { fetchWithAuth } from "../utils/fetchWithAuth";

interface RescheduleSubmitPayload {
  reason: string;
  requestedDate: string;
  requestedStartTime: string; // HH:MM (24h)
  durationMinutes?: number;
}

interface ModalRescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RescheduleSubmitPayload) => void;
  bookingID: number;
  userID: number;
  currentDuration?: string;
}
const API_URL = import.meta.env.VITE_API_URL;

const ModalRescheduleDialog: React.FC<ModalRescheduleDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bookingID,
  currentDuration,
}) => {
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bookedIntervals, setBookedIntervals] = useState<
    { start: number; end: number; bookingID?: number; durationMinutes?: number }[]
  >([]);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(60);

  // Responsive time slot labels
  const timeSlots = React.useMemo(
    () =>
      Array.from({ length: (20 - 9 + 1) * 2 }, (_, i) => {
        const hour = 9 + Math.floor(i / 2);
        const min = i % 2 === 0 ? "00" : "30";
        const meridian = hour < 12 ? "AM" : "PM";
        const labelHour = (hour > 12 ? hour - 12 : hour).toString().padStart(2, "0");
        return `${labelHour}:${min} ${meridian}`;
      }).filter((s) => !["07:30 PM", "08:00 PM", "08:30 PM"].includes(s)),
    []
  );

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

  // PH timezone helpers
  function getTodayInPH(): Date {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.format(new Date());
    const [y, m, d] = parts.split("-").map((v) => parseInt(v, 10));
    return new Date(y, (m || 1) - 1, d || 1);
  }
  function isPastDatePH(date: Date) {
    const phToday = getTodayInPH();
    phToday.setHours(0,0,0,0);
    const checkDate = new Date(date);
    checkDate.setHours(0,0,0,0);
    return checkDate < phToday;
  }
  function isDisabled(date: Date) {
    return isPastDatePH(date);
  }

  function normalizeServerTimeToSlotLabel(serverTime: unknown): string {
    if (typeof serverTime !== "string") return "";
    const m = serverTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return serverTime;
    const hNum = parseInt(m[1], 10);
    if (hNum < 1 || hNum > 12) return serverTime;
    const mm = m[2];
    const ap = m[3].toUpperCase();
    return `${String(hNum).padStart(2, "0")}:${mm} ${ap}`;
  }

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

  const parseDurationToMinutes = (raw: string): number => {
    if (!raw || typeof raw !== "string") return 0;
    const s = raw.toLowerCase();
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    let total = 0;
    const hMatch = s.match(/(\d+)\s*(hour|hr|hrs|h)/);
    if (hMatch) total += parseInt(hMatch[1], 10) * 60;
    const mMatch = s.match(/(\d+)\s*(minute|min|mins|m)/);
    if (mMatch) total += parseInt(mMatch[1], 10);
    if (total === 0) {
      const nums = s.match(/(\d+)/g);
      if (nums) {
        if (/hour|hr|hrs|h/.test(s)) {
          total += parseInt(nums[0], 10) * 60;
          if (nums[1]) total += parseInt(nums[1], 10);
        } else {
          total += parseInt(nums[0], 10);
        }
      }
    }
    return total;
  };

  const DAY_END_MIN = 20 * 60;

  // Booked slots effect
  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDate) {
        setBookedSlots([]);
        setBookedIntervals([]);
        return;
      }
      try {
        const dateStr = formatDateToString(selectedDate);
        const res = await fetchWithAuth(`${API_URL}/api/booked-slots?date=${dateStr}`);
        if (!res.ok) {
          setBookedSlots([]);
          setBookedIntervals([]);
          return;
        }
        const data = await res.json();
        const rawSlots = Array.isArray(data.bookedSlots) ? data.bookedSlots : [];
        const startLabels: string[] = [];
        const intervals: { start: number; end: number; bookingID?: number; durationMinutes?: number }[] = [];

        if (Array.isArray(data.bookings) && data.bookings.length > 0) {
          for (const b of data.bookings) {
            if (!b) continue;
            const startLabelRaw = b.startTime || b.start;
            if (!startLabelRaw) continue;
            const startLabel = normalizeServerTimeToSlotLabel(String(startLabelRaw));
            const start = slotLabelToMinutes(startLabel);
            if (isNaN(start)) continue;
            const durParsed = parseDurationToMinutes(b.duration || b.packageDuration || b.durationMinutes || "");
            const durationMinutes = durParsed > 0 ? durParsed : 60;
            const end = start + durationMinutes;
            startLabels.push(startLabel);
            intervals.push({ start, end, bookingID: b.bookingID, durationMinutes });
          }
        } else if (rawSlots.length > 0) {
          for (const entry of rawSlots) {
            if (entry && typeof entry === "object" && "start" in entry) {
              const startLabel = normalizeServerTimeToSlotLabel((entry as any).start);
              if (!startLabel) continue;
              const start = slotLabelToMinutes(startLabel);
              if (isNaN(start)) continue;
              let end = NaN;
              if ((entry as any).end) {
                const endLabel = normalizeServerTimeToSlotLabel((entry as any).end);
                end = slotLabelToMinutes(endLabel);
              }
              if (!Number.isFinite(end) || end <= start) {
                end = start + 30;
              }
              startLabels.push(startLabel);
              intervals.push({ start, end });
            } else if (typeof entry === "string") {
              const startLabel = normalizeServerTimeToSlotLabel(entry);
              const start = slotLabelToMinutes(startLabel);
              if (isNaN(start)) continue;
              startLabels.push(startLabel);
              intervals.push({ start, end: start + 30 });
            }
          }
        }
        setBookedSlots(startLabels);
        setBookedIntervals(intervals);

        const allBooked = timeSlots.every((s) => startLabels.includes(s));
        if (allBooked) {
          setSelectedTime(null);
        } else if (selectedTime && startLabels.includes(selectedTime)) {
          setSelectedTime(null);
        }
      } catch (e) {
        setBookedIntervals([]);
      }
    };

    fetchBooked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  function to24Hour(timeLabel: string) {
    const m = timeLabel.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return "00:00";
    let h = parseInt(m[1], 10);
    const mm = m[2];
    const ap = m[3].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${mm}`;
  }

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const loadDuration = async () => {
      if (!isOpen) return;
      if (currentDuration) {
        setSessionDurationMinutes(parseDurationToMinutes(currentDuration) || 60);
        return;
      }
      try {
        const res = await fetchWithAuth(`${API_URL}/api/bookings/${bookingID}`);
        if (res.ok) {
          const data = await res.json();
          const startLabel = data?.time;
          const endLabel = data?.endTime;
          if (startLabel && endLabel) {
            const start = slotLabelToMinutes(String(startLabel));
            const end = slotLabelToMinutes(String(endLabel));
            if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
              setSessionDurationMinutes(end - start);
              return;
            }
          }
          const dStr = data?.duration || data?.packageDuration || "";
          const mins = parseDurationToMinutes(String(dStr)) || 60;
          setSessionDurationMinutes(mins);
        }
      } catch {}
    };
    loadDuration();
  }, [isOpen, currentDuration, bookingID]);

  const handleConfirm = () => {
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
    if (!!selectedTime && bookedSlots.includes(selectedTime)) {
      toast.error("The selected time slot has just been booked. Please choose another.");
      return;
    }
    if (isDisabled(selectedDate)) {
      toast.error("The selected date is not available. Please choose another date.");
      return;
    }
    if (reason.trim().length < 10) {
      toast.error("Please provide a more detailed reason (at least 10 characters).");
      return;
    }
    const requestedDate = formatDateToString(selectedDate);
    const formattedTime = to24Hour(selectedTime);
    (onSubmit as any)({
      reason: reason.trim(),
      requestedDate,
      requestedStartTime: formattedTime,
      durationMinutes: sessionDurationMinutes,
    });
    onClose();
  };

  if (!isOpen) return null;

  // --- Start of Responsive Modal ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 min-h-screen overflow-y-auto">
      <div className="
        w-full max-w-lg sm:max-w-xl lg:max-w-3xl mx-2 sm:mx-auto
        bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg
        flex flex-col
        overflow-y-auto max-h-[90vh] relative
      ">
        <h2 className="text-center text-lg font-semibold">Rescheduling Appointment</h2>
        <p className="text-center text-sm text-gray-500">
          The appointment will be rescheduled to the proposed date and time.<br/>
          Please select your preferred option below.
        </p>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-4">
          {/* Date Picker Section */}
          <div className="w-full lg:w-1/2">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }
              }}
              captionLayout="label"
              fromDate={getTodayInPH()}
              toDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
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
            <div className="mt-2 text-xs text-gray-500">
              <p>• Select a date; unavailable time slots will be disabled.</p>
            </div>
          </div>

          {/* Time Slot Section */}
          <div className="w-full lg:w-1/2">
            <h4 className="text-sm text-gray-700 mb-2 font-medium">Available Time Slots</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlots.map((slot) => {
                const slotStart = slotLabelToMinutes(slot);
                const slotEnd = slotStart + 30;
                const nowDisable = !selectedDate;
                let isPastTime = false;
                if (selectedDate) {
                  const todayPH = getTodayInPH();
                  const sameDay = isSameDay(selectedDate, todayPH);
                  if (sameDay) {
                    const now = new Date();
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    isPastTime = slotStart <= currentMinutes;
                  }
                }
                const overlapsExisting = bookedIntervals.some(iv => slotStart < iv.end && slotEnd > iv.start);
                const wouldEnd = slotStart + sessionDurationMinutes;
                const insufficientRemaining = wouldEnd > DAY_END_MIN;
                const intervalConflict = bookedIntervals.some(iv => slotStart < iv.end && wouldEnd > iv.start);
                const isBooked = overlapsExisting;
                const disabled = nowDisable || isPastTime || isBooked || insufficientRemaining || intervalConflict;
                const title = !selectedDate ? 'Select a date first'
                  : isPastTime ? 'This time has already passed'
                  : isBooked ? 'Overlaps an existing booking'
                  : insufficientRemaining ? 'Not enough remaining time before closing'
                  : intervalConflict ? 'Your full session would overlap an existing booking'
                  : 'Available';
                return (
                  <button
                    key={slot}
                    onClick={() => !disabled && setSelectedTime(slot)}
                    disabled={disabled}
                    className={`py-3 px-3 text-[11px] font-medium rounded transition border text-center whitespace-nowrap
                      ${selectedTime === slot && !disabled
                        ? 'bg-black text-white border-black'
                        : disabled
                        ? 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}
                    `}
                    title={title}
                  >
                    {slot}
                    {isBooked && <span className="block text-[10px] text-red-500">Booked</span>}
                    {!isBooked && intervalConflict && <span className="block text-[10px] text-orange-500">Conflict</span>}
                    {!isBooked && insufficientRemaining && <span className="block text-[10px] text-amber-600">Too Late</span>}
                  </button>
                );
              })}
            </div>
            {selectedDate && timeSlots.every(s => bookedSlots.includes(s)) && (
              <div className="mt-3 text-sm text-red-600">
                All time slots are fully booked for this date.
              </div>
            )}
            {selectedTime && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">Selected time: </span>
                <span className="bg-gray-100 px-2 py-1 rounded text-black font-mono">{selectedTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reason Field */}
        <div className="mb-6 text-sm mt-4">
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
            <span className="text-xs text-gray-400">{reason.length}/500</span>
          </div>
        </div>

        {/* Actions - Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 mb-2">
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
            className={`w-full py-2 text-sm rounded-md transition-all ${
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
        <ToastContainer />
      </div>
    </div>
  );
};

export default ModalRescheduleDialog;

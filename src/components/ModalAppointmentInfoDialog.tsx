import React, { useState, useEffect } from "react";
import { CalendarClock, Archive, X, Trash, Check } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { isToday, isSameDay } from "date-fns";
import "react-day-picker/dist/style.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchWithAuth } from "../utils/fetchWithAuth";

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    customerName: string;
    email: string;
    address: string;
    contact: string;
    package: string;
    duration: string;
    date: string;
    time: string;
    subtotal: number;
    price: number;
    paidAmount: number;
    feedback: string;
    rating: number;
    status: number;
    paymentStatus: number;
    balance: number;
    selectedAddOns?: string;
    selectedConcepts?: string;
  } | null;
  refreshAppointments?: () => void;
}

const getBookingLabel = (bookingID: string, packageName: string) => {
  const acronym = packageName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return `${acronym}#${bookingID}`;
};

const timeSlots = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
];

const API_URL = import.meta.env.VITE_API_URL;

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  data,
  refreshAppointments,
}) => {
  const [viewMode, setViewMode] = useState<
    "default" | "delete" | "reschedule" | "done"
  >("default");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [takenTimes, setTakenTimes] = useState<{ start: string; end: string }[]>([]);
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCompletePayment = async () => {
    if (!data) return;

    setIsProcessing(true);
    try {
      // Create PayMongo checkout session for remaining balance
      const paymentPayload = {
        booking_id: data.id,
        payment_type: 'remaining',
        return_url: '/admin/appointments'
      };

      const paymentResponse = await fetchWithAuth(`${API_URL}/api/payment/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResponse.ok && paymentResult.success) {
        // Redirect to PayMongo checkout
        window.location.href = paymentResult.checkout_url;
      } else {
        toast.error(paymentResult.message || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment checkout failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (data?.duration) {
      setSessionDuration(Number(data.duration));
    }
  }, [data?.duration]);

  // 🧠 Reset modal view when opened with new data
  useEffect(() => {
    if (isOpen) {
      setViewMode("default");
      setSelectedDate(undefined);
      setSelectedTime("");
      setTakenTimes([]); // ✅ Reset taken times
    }
  }, [isOpen, data]);

  useEffect(() => {
    const fetchTakenTimes = async () => {
      if (!selectedDate) return;

      const formattedDate = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

      try {
        const response = await fetchWithAuth(
          `${API_URL}/api/appointments/taken-times?date=${formattedDate}`
        );
        const result = await response.json();
        console.log("📅 Taken times response:", result);

        if (result.success && Array.isArray(result.bookedSlots)) {
          const times = result.bookedSlots.map((slot: any) => ({
            start: slot.start?.replace(/^0/, ""),
            end: slot.end?.replace(/^0/, ""),
          }));
          setTakenTimes(times);
        } else {
          setTakenTimes([]);
        }
      } catch (error) {
        console.error("Failed to fetch taken times:", error);
        setTakenTimes([]);
      }
    };

    fetchTakenTimes();
  }, [selectedDate]);


  if (!isOpen || !data) return null;

  const handleDelete = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/appointments/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data.id }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        if (refreshAppointments) refreshAppointments();
        onClose();
      } else {
        toast.error("Failed to cancel appointment.");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Something went wrong.");
    }
  };

  const markAsDone = async () => {
    try {
      const response = await fetchWithAuth(`${API_URL}/api/appointments/completed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data.id }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        if (refreshAppointments) refreshAppointments();
        onClose();
      } else {
        toast.error("This appointment is already completed.");
      }
    } catch (error) {
      console.error("Error marking appointment as done:", error);
      toast.error("Something went wrong.");
    }
  };

  function slotToMinutes(slot: string): number {
    const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }


  const handleRescheduleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both a date and time.");
      return;
    }

    const formattedDate = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    const startMinutes = slotToMinutes(selectedTime);
    const endMinutes = startMinutes + sessionDuration;

    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    const startTime = `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

    try {
      const response = await fetchWithAuth(`${API_URL}/api/appointments/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: data.id,
          bookingDate: formattedDate,
          startTime,
          endTime,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        refreshAppointments?.();
        onClose();
      } else {
        toast.error(result.message || "Failed to reschedule appointment.");
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Something went wrong.");
    }
  };
  const goBack = () => setViewMode("default");


  return (
    <div className="printable fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md max-h-[95vh] overflow-y-auto p-6 relative transition-all">
        {/* Top Right Buttons */}
        {viewMode === "default" && (
          <div className="absolute top-4 right-4 flex gap-2 print:hidden">
            <button
              onClick={() => setViewMode("reschedule")}
              title="Reschedule Appointment"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <CalendarClock className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setViewMode("delete")}
              title="Delete Appointment"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Archive className="w-5 h-5 text-red-600" />
            </button>

            <button
              onClick={() => setViewMode("done")} 
              title="Mark as Done"
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Check className="w-5 h-5 text-green-600" />
            </button>
          </div>
        )}

        {viewMode !== "default" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black"
          >
            <X />
          </button>
        )}

        {/* DEFAULT VIEW */}
        {viewMode === "default" && (
          <>
            <h1 className="text-lg font-bold mb-1">{data.package}</h1>
            <p className="text-sm text-gray-500 mb-4">Booking ID: {getBookingLabel(data.id, data.package)}</p>

            <div className="grid grid-cols-2 sm:grid-cols-2 text-sm gap-y-1 mb-6">
              <span className="text-gray-500">Name</span>
              <span>{data.customerName}</span>
              <span className="text-gray-500">Email</span>
              <span>{data.email}</span>
              <span className="text-gray-500">Address</span>
              <span>{data.address}</span>
              <span className="text-gray-500">Contact No.</span>
              <span>{data.contact}</span>
            </div>

            <h2 className="font-semibold mb-2">Order Summary</h2>
            <div className="text-sm mb-2">
              {data.package}
              <span className="float-right font-semibold">
                ₱{data.price.toFixed(2)}
              </span>
            </div>

            {/* Add-ons and Concepts */}
            {(data.selectedAddOns || data.selectedConcepts) && (
              <div className="mb-4 text-sm border-t pt-3">
                {data.selectedAddOns && (
                  <p className="mb-2">
                    <strong>Add-ons:</strong> {data.selectedAddOns}
                  </p>
                )}

                {data.selectedConcepts && (
                  <p>
                    <strong>Concepts:</strong> {data.selectedConcepts}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <label className="text-gray-500 text-xs mb-1 block">
                  Booking Date
                </label>
                <input
                  disabled
                  value={data.date}
                  className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-gray-500 text-xs mb-1 block">
                  Booking Time
                </label>
                <input
                  disabled
                  value={data.time}
                  className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
                />
              </div>
            </div>

            <div className="text-sm mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₱{data.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount</span>
                <span>₱{data.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Pending Balance</span>
                <span>₱{data.balance.toFixed(2)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Feedback</label>
              <textarea
                value={data.feedback}
                disabled
                rows={3}
                className="w-full border rounded-md px-3 py-2 bg-gray-100 text-sm"
              />
            </div>

            <div className="mb-6 text-sm">
              <span className="block font-medium mb-1">Rating</span>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${i < data.rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            {/* Complete Payment Button */}
            {data.status === 2 && data.paymentStatus === 0 && data.balance > 0 && (
              <div className="mb-4">
                <button
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isProcessing ? "Processing..." : `Complete Payment (₱${data.balance.toFixed(2)})`}
                </button>
              </div>
            )}

            <div className="flex justify-between print:hidden">
              <button
                onClick={onClose}
                className="px-6 py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-black text-white text-sm rounded-md hover:opacity-80"
              >
                Print
              </button>
            </div>
          </>
        )}

        {/* DELETE VIEW */}
        {viewMode === "delete" && (
          <div className="text-center space-y-6">
            <div className="mx-auto bg-red-100 w-12 h-12 flex items-center justify-center rounded-full">
              <Trash className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold">Delete Appointment</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this appointment? This action
              cannot be undone.
            </p>
            <div className="flex justify-between gap-4 pt-4">
              <button
                onClick={goBack}
                className="w-full py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-full py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* MARK AS DONE VIEW */}
        {viewMode === "done" && (
          <div className="text-center space-y-6">
            <div className="mx-auto bg-green-100 w-12 h-12 flex items-center justify-center rounded-full">
              <Check className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Mark Appointment as Done</h2>
            <p className="text-sm text-gray-600">
              Are you sure this appointment is completed? This action
              cannot be undone.
            </p>
            <div className="flex justify-between gap-4 pt-4">
              <button
                onClick={goBack}
                className="w-full py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={markAsDone}
                className="w-full py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Mark As Done
              </button>
            </div>
          </div>
        )}

        {/* RESCHEDULE VIEW */}
        {viewMode === "reschedule" && (
          <div className="space-y-6">
            <h2 className="text-center text-lg font-semibold">
              Rescheduling Appointment
            </h2>
            <p className="text-center text-sm text-gray-500">
              Please select a valid future date and available time slot below.
            </p>

            {/** PH TIME **/}
            {(() => {
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
                phToday.setHours(0, 0, 0, 0);
                const check = new Date(date);
                check.setHours(0, 0, 0, 0);
                return check < phToday;
              }

              function isTodayPH(date: Date) {
                const phToday = getTodayInPH();
                return (
                  date.getFullYear() === phToday.getFullYear() &&
                  date.getMonth() === phToday.getMonth() &&
                  date.getDate() === phToday.getDate()
                );
              }

              // Calculate current PH time in minutes
              function getPHMinutesNow(): number {
                const fmt = new Intl.DateTimeFormat("en-US", {
                  timeZone: "Asia/Manila",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                const parts = fmt.format(new Date()).match(/(\d+):(\d+)\s*(AM|PM)/i);
                if (!parts) return 0;
                let h = parseInt(parts[1]);
                const m = parseInt(parts[2]);
                const ap = parts[3].toUpperCase();
                if (ap === "PM" && h !== 12) h += 12;
                if (ap === "AM" && h === 12) h = 0;
                return h * 60 + m;
              }

              const nowPHMinutes = getPHMinutesNow();

              function slotToMinutes(slot: string | undefined | null): number {
                if (!slot || typeof slot !== "string") return 0;
                const m = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
                if (!m) return 0;
                let h = parseInt(m[1]);
                const min = parseInt(m[2]);
                const ap = m[3].toUpperCase();
                if (ap === "PM" && h !== 12) h += 12;
                if (ap === "AM" && h === 12) h = 0;
                return h * 60 + min;
              }


              return (
                <div className="flex flex-col lg:flex-row justify-center gap-8">
                  {/* Calendar */}
                  <div className="lg:w-1/2">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      disabled={isPastDatePH}
                      captionLayout="label"
                      modifiers={{
                        selected: (d) =>
                          !!selectedDate && isSameDay(d, selectedDate!),
                        today: (d) => isToday(d),
                      }}
                      modifiersClassNames={{
                        selected: "bg-gray-800 text-white",
                        today: "font-bold text-black bg-gray-100 rounded-xl",
                        disabled: "opacity-40 line-through cursor-not-allowed",
                      }}
                      classNames={{
                        caption: "text-sm text-black",
                        day: "text-sm",
                        nav_button: "text-black hover:bg-gray-100 p-1 rounded",
                        nav_icon: "stroke-black fill-black w-4 h-4",
                      }}
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="lg:w-1/2">
                    <h4 className="text-sm text-gray-700 mb-2 font-medium">
                      Available Time Slots
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => {
                        const slotMinutes = slotToMinutes(slot);

                        // Disable if this slot overlaps any booked start–end range
                        const isTaken = takenTimes.some((b: { start?: string; end?: string }) => {
                          if (!b?.start || !b?.end) return false;
                          const start = slotToMinutes(b.start);
                          const end = slotToMinutes(b.end);
                          return slotMinutes >= start && slotMinutes < end;
                        });

                        // Disable past times for today
                        const isPastTime =
                          selectedDate && isTodayPH(selectedDate)
                            ? slotMinutes <= nowPHMinutes
                            : false;

                        const disabled = isTaken || isPastTime;

                        return (
                          <button
                            key={slot}
                            onClick={() => !disabled && setSelectedTime(slot)}
                            disabled={disabled}
                            className={`py-2 px-3 text-sm rounded-md transition text-center ${disabled
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : selectedTime === slot
                                ? "bg-black text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                              }`}
                          >
                            {slot}
                            {isTaken && (
                              <span className="block text-[10px] text-red-500">Booked</span>
                            )}
                            {isPastTime && !isTaken && (
                              <span className="block text-[10px] text-gray-500"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Message if all slots are booked */}
                    {selectedDate &&
                      timeSlots.every((slot) =>
                        takenTimes.some((b: { start?: string; end?: string }) => {
                          if (!b?.start || !b?.end) return false;
                          const s = slotToMinutes(slot);
                          const start = slotToMinutes(b.start);
                          const end = slotToMinutes(b.end);
                          return s >= start && s < end;
                        })
                      ) && (
                        <div className="mt-3 text-sm text-red-600">
                          All time slots are fully booked for this date.
                        </div>
                      )}

                    {/* Show selected time */}
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
              );
            })()}

            <div className="flex justify-between pt-4">
              <button
                onClick={goBack}
                className="w-full py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleConfirm}
                className="w-full py-2 bg-black text-white text-sm rounded-md hover:opacity-80 ml-4"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionModal;

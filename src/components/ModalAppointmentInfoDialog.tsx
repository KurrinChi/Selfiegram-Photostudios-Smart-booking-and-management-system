import React, { useState, useEffect } from "react";
import { CalendarClock, Archive, X, Trash, Check } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { isToday, isSameDay } from "date-fns";
import "react-day-picker/dist/style.css";
import { toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    date: string;
    time: string;
    subtotal: number;
    price: number;
    paidAmount: number;
    feedback: string;
    rating: number;
  } | null;
  refreshAppointments?: () => void;
}

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

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  data,
  refreshAppointments,
}) => {
  const [viewMode, setViewMode] = useState<"default" | "delete" | "reschedule" | "done">(
    "default"
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // 🧠 Reset modal view when opened with new data
  useEffect(() => {
    if (isOpen) {
      setViewMode("default");
      setSelectedDate(undefined);
      setSelectedTime("");
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const handleDelete = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/appointments/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data.id }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Success:", result.message);
        toast.success(result.message);
        if (refreshAppointments) refreshAppointments();
        onClose();
      } else {
        toast.error("Failed to cancel appointment.");
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Something went wrong.");
    }
  };

  const markAsDone = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/appointments/completed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: data.id }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Success:", result.message);
        toast.success(result.message);
        if (refreshAppointments) refreshAppointments();
        onClose();
      } else {
        toast.error("Failed to cancel appointment.");
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("Something went wrong.");
    }
  };


  const handleRescheduleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both a date and time.");
      return;
    }

    // Format selected date (YYYY-MM-DD)
    const formattedDate = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;


    // Convert to 24-hour format time and calculate end time
    const [time, modifier] = selectedTime.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    const endHour = hours + 1;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    try {
      const response = await fetch("http://localhost:8000/api/appointments/reschedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: data.id,
          bookingDate: formattedDate,
          startTime,
          endTime,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Success:", result.message);
        toast.success(result.message);
        if (refreshAppointments) refreshAppointments();
        onClose();
      } else {
        toast.error("Failed to reschedule appointment.");
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Something went wrong.");
    }
  };


  const goBack = () => setViewMode("default");

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-md max-h-[95vh] overflow-y-auto p-6 relative transition-all">
        {/* Top Right Buttons */}
        {viewMode === "default" && (
          <div className="absolute top-4 right-4 flex gap-2">
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
              onClick={() => setViewMode("done")} // Replace with your function
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
            <p className="text-sm text-gray-500 mb-4">Booking ID: {data.id}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 text-sm gap-y-1 mb-6">
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
                <span>₱{(data.subtotal - data.paidAmount).toFixed(2)}</span>
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
                    className={`text-xl ${
                      i < data.rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
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
              The appointment has been rescheduled to the proposed date and
              time.
              <br /> Please select your preferred option below.
            </p>

            <div className="flex flex-col lg:flex-row justify-center gap-8">
              <div className="lg:w-1/2">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  captionLayout="label"
                  modifiers={{
                    selected: (d) =>
                      !!selectedDate && isSameDay(d, selectedDate!),
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
                  }}
                />
              </div>

              <div className="lg:w-1/2">
                <h4 className="text-sm text-gray-700 mb-2 font-medium">
                  Available Time Slots
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-3 text-sm rounded-md transition text-center ${
                        selectedTime === slot
                          ? "bg-black text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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

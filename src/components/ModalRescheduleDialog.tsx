import React, { useState } from "react";
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
  bookingID,
  userID,
}) => {
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM",
  ];

  function isSameDay(a: Date, b?: Date) {
    return !!b && a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  }
  function isToday(date: Date) {
    const today = new Date();
    return isSameDay(date, today);
  }

  function to24Hour(time12h: string) {
  const [time, modifier] = time12h.split(" "); // ["03:00", "PM"]
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}


 const handleConfirm = () => {
  if (!reason || !requestedDate || !requestedStartTime) {
    toast.error("Please complete all fields.");
    return;
  }

  // convert to 24h for backend
  const formattedTime = to24Hour(requestedStartTime);

  // call parent onSubmit with correct arguments
  onSubmit(reason, requestedDate, formattedTime);

  onClose();
};

const requestedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : ""; // Format date safely
const requestedStartTime: string = selectedTime ?? ""; // Ensure string type

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
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              captionLayout="label"
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

        <div className="mb-6 text-sm">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-gray-50 resize-none"
            rows={4}
            placeholder="Type your reason here..."
          />
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
            
            className="w-full py-2 bg-black text-white text-sm rounded-md hover:opacity-80 ml-4"
          >
            Confirm
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ModalRescheduleDialog;
import React, { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import QRCode from "react-qr-code";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import ModalRequestedDialog from "./ModalRequestedDialog";
import ModalOnRequestDialog from "./ModalOnRequestDialog";
import { id } from "date-fns/locale";
import { toast } from "react-toastify";
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
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
    total: number;
    paidAmount: number;
    pendingBalance: number;
    feedback: string;
    rating: number;
    status: number;
    paymentStatus: number;
     selectedAddOns?: string[];   // <-- added
  selectedConcepts?: string[]; // <-- added
  } | null;
    onSaved?: () => void;
}
const API_URL = import.meta.env.VITE_API_URL;

const RECEIPT_URL = import.meta.env.VITE_URL;
const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  data,
}) => {

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
const [hasTypedFeedback, setHasTypedFeedback] = useState(false);
const [hasSelectedRating, setHasSelectedRating] = useState(false);
 


const [isRequestedModalOpen, setIsRequestedModalOpen] = useState(false);
const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
const [cancelData, setCancelData] = useState<{ 
  id: string;
  reason: string; 
  bookingDate: string;
  bookingTime: string;
  transactionDate: string;
  bookingId: string;
  totalAmount: number;
  packageName: string;
} | null>(null);
  useEffect(() => {
    if (data) {
      setRating(data.rating);
      setFeedback(data.feedback);
    }
  }, [data]);

  const handleSave = async () => {
    if (!feedback && (rating === 0 || rating === null)) {
    onClose();
    return;
  }
  try {
    const response = await fetchWithAuth(`${API_URL}/api/booking/${data?.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feedback, rating }),
    });
    
    if (!response.ok) throw new Error("Failed to save");
    
    onSaved?.();
    onClose();
  } catch (err) {
    console.error("Save failed", err);
    if (feedback || rating) {
      alert("Save failed");
    }
  }
};
const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
   setFeedback(e.target.value);
  setHasTypedFeedback(e.target.value.trim().length > 0);
};

const handleRatingClick = (value: number) => {
  setRating(value);
  setHasSelectedRating(true);
};

 const handleCancelSubmit = (reason: string) => {
  // TODO: call API to process cancellation
  setCancelData({
    id: data!.id,
    reason,
    bookingDate: data!.bookingDate,
    bookingTime: data!.time,
    transactionDate: data!.transactionDate,
    bookingId: data!.id,
    totalAmount: data!.total, // or total refund logic
    packageName: data!.package,
  });

  setIsCancelModalOpen(false); // close modal
  setIsRequestedModalOpen(true);
};

  const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

  const getBookingLabel = (bookingID: string, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${bookingID}`;
  };

useEffect(() => {
  if (isOpen) {
    setFeedback(data?.feedback || "");
    setRating(data?.rating || 0);

  }
}, [isOpen, data]);
  if (!isOpen || !data) return null;

return (
  <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center p-4">
    
    {/* ModalOnRequestDialog goes here, always rendered but controlled via isOpen */}
    <ModalOnRequestDialog
       isOpen={isCancelModalOpen}
  onClose={() => setIsCancelModalOpen(false)}
  onSubmit={async (reason) => {
  try {
    const user_id = localStorage.getItem("userID") || "";
    const res = await fetchWithAuth(`${API_URL}/api/booking-request/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookingID: data.id,
        userID: user_id,
        reason: reason,
      }),
    });

    if (!res.ok) throw new Error("Failed to submit request");

    // ✅ Save the cancel data for the confirmation dialog
    setCancelData({
      id: data.id,
      reason,
      bookingDate: data.bookingDate,
      bookingTime: data.time, // make sure `time` exists in your `data`
      bookingId: data.id,
      totalAmount: data.subtotal,
      packageName: data.package,
      transactionDate: new Date().toISOString().split("T")[0], // hardcoded to today
    });

    toast.success("Cancel request submitted successfully!");
    setIsCancelModalOpen(false);
    setIsRequestedModalOpen(true);
    
  } catch (err) {
    toast.error("Error submitting request. Please try again.");
  }
}}
    />

   <ModalRequestedDialog
  isOpen={isRequestedModalOpen}
   onClose={() => {
    setIsRequestedModalOpen(false); // close confirmation
    onClose();                      // also close transaction modal
  }}
  data={
    cancelData
      ? {
          id: cancelData.id,
          reason: cancelData.reason,
          bookingDate: cancelData.bookingDate,
          bookingTime: cancelData.bookingTime,
          transactionDate: cancelData.transactionDate,
          bookingId: cancelData.bookingId,
          totalAmount: cancelData.totalAmount,
          packageName: cancelData.packageName,
        }
      : null
  }
/>
    <div
      className={`bg-white text-gray-900 rounded-lg shadow-md overflow-y-auto max-h-[95vh] ${
        data.paymentStatus === 1 && data.status === 2
          ? "max-w-5xl w-full flex"
          : "max-w-xl w-full p-6"
      }`}
    >
      {data.paymentStatus === 1 && data.status === 2 ? (
        <>
          {/* Left Panel */}
          <div className="w-full md:w-2/3 p-6">
            <h1 className="text-lg font-bold mb-1">{data.package}</h1>
            <div className="grid grid-cols-2 text-sm gap-y-1 mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Booking ID: {getBookingLabel(data.id, data.package)}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Transaction Date: {formatDate(data.transactionDate)}
              </p>
            </div>

            <div className="grid grid-cols-2 text-sm gap-y-1 mb-6">
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
                ₱{data.subtotal.toFixed(2)}
              </span>
            </div>


                 {/* Add-ons and Concepts */}
              {(data.selectedAddOns || data.selectedConcepts) && (
                <div className="mb-4 text-sm">
                  {data.selectedAddOns && (
                    <p className="mb-2">
                      <span className="font-semibold">Add-ons: </span>
                      {data.selectedAddOns}
                    </p>
                  )}

                  {data.selectedConcepts && (
                    <p>
                      <span className="font-semibold">Concepts: </span>
                      {data.selectedConcepts}
                    </p>
                  )}
                </div>
              )}



            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <label className="text-gray-500 block text-xs mb-1">
                  Booking Date
                </label>
                <input
                  disabled
                  value={
                    data.bookingDate &&
                    !isNaN(
                      parse(data.bookingDate, "yyyy-MM-dd", new Date()).getTime()
                    )
                      ? format(
                          parse(data.bookingDate, "yyyy-MM-dd", new Date()),
                          "MMMM d, yyyy"
                        )
                      : "Invalid date"
                  }
                  className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
                />
              </div>
              <div>
                <label className="text-gray-500 block text-xs mb-1">
                  Booking Time
                </label>
                <input
                  disabled
                  value={data.time}
                  className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
                />
              </div>
            </div>





            <div className="text-sm mb-4">
              <div className="flex justify-between">
                <span>Total</span>
                <span>₱{typeof data.total === "number" ? data.total.toFixed(2) : "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount</span>
                <span>₱{data.paidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Pending Balance</span>
                <span>
                  ₱
                  {typeof data.pendingBalance === "number"
                    ? data.pendingBalance.toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>

            {Number(data.status) === 1 ? (
              <>
                <div className="mb-6 text-sm">
                  <label className="block font-medium mb-1" htmlFor="feedback">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={handleFeedbackChange}
                    className="w-full border rounded-md px-3 py-2 bg-gray-50 resize-none"
                    placeholder="Write your feedback here..."
                    rows={4}
                  />
                </div>

                <div className="mb-4 text-sm">
                  <span className="block font-medium mb-1">Rating</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleRatingClick(i + 1)}
                        onMouseEnter={() => setHoveredRating(i + 1)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className={`text-xl transition-colors ${
                          (hoveredRating || rating) > i
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                
              </>
            ) : Number(data.status) === 2 && Number(data.paymentStatus) === 0 ? (
              <div className="w-full">
                <button className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-600 transition mb-4">
                  Complete Payment
                </button>
              </div>
            ) : null}

              {/*FOR DOWN PAYMWENT*/}
                {/* Cancel & Reschedule Buttons */}
              <div className="flex justify-between mb-4">
                <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-1/2 bg-gray-800 border rounded-md px-4 text-white py-2 hover:bg-gray-500 transition mr-2"
                  >
                    Cancel Appointment
                </button>

                <button
                  onClick={() => {
                    // TODO: handle reschedule logic
                    alert("Reschedule clicked");
                  }}
                  className="w-1/2 bg-gray-100 border rounded-md px-4 py-2 rounded  hover:bg-gray-200 transition ml-2"
                >
                  Reschedule
                </button>
              </div>
              
            <div className="flex justify-between">
              <button
                onClick={onClose}
                className="px-6 py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Back
              </button>
              {hasTypedFeedback && hasSelectedRating && (
                <button
                  onClick={handleSave}
                  className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                >
                  Save
                </button>
              )}
            </div>
          </div>

          {/* QR Code Panel */}
          <div className="hidden md:flex w-1/3 items-center justify-center bg-gray-100 p-4 border-l border-gray-200">
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-full aspect-square max-w-xs border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-center text-sm p-4">
                   <QRCode
                    value={`${RECEIPT_URL}/receipt/booking/${data.id}`}
                    size={256}
                  />
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div>
          <h1 className="text-lg font-bold mb-1">{data.package}</h1>
          <div className="grid grid-cols-2 text-sm gap-y-1 mb-6">
            <p className="text-sm text-gray-500 mb-4">
              Booking ID: {getBookingLabel(data.id, data.package)}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Transaction Date: {formatDate(data.transactionDate)}
            </p>
          </div>

          <div className="grid grid-cols-2 text-sm gap-y-1 mb-6">
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
             ₱{data.subtotal.toFixed(2)}
            </span>
          </div>

                 {/* Add-ons and Concepts */}
                {(data.selectedAddOns || data.selectedConcepts) && (
                  <div className="mb-4 text-sm">
                    {data.selectedAddOns && (
                      <p className="mb-2">
                        <span className="font-semibold">Add-ons: </span>
                        {data.selectedAddOns}
                      </p>
                    )}

                    {data.selectedConcepts && (
                      <p>
                        <span className="font-semibold">Concepts: </span>
                        {data.selectedConcepts}
                      </p>
                    )}
                  </div>
                )}


          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <label className="text-gray-500 block text-xs mb-1">
                Booking Date
              </label>
              <input
                disabled
                value={
                  data.bookingDate &&
                  !isNaN(parse(data.bookingDate, "yyyy-MM-dd", new Date()).getTime())
                    ? format(parse(data.bookingDate, "yyyy-MM-dd", new Date()), "MMMM d, yyyy")
                    : "Invalid date"
                }
                className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
              />
            </div>
            <div>
              <label className="text-gray-500 block text-xs mb-1">
                Booking Time
              </label>
              <input
                disabled
                value={data.time}
                className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
              />
            </div>
          </div>

          <div className="text-sm mb-4">
            <div className="flex justify-between">
              <span>Total</span>
              <span>₱{data.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount</span>
              <span>₱{data.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Pending Balance</span>
              <span>
                ₱
                {typeof data.pendingBalance === "number"
                  ? data.pendingBalance.toFixed(2)
                  : "0.00"}
              </span>
            </div>
          </div>
           {/* Cancel & Reschedule Buttons */}
              {Number(data.status) !== 1 && (
                <div className="flex justify-between mb-4">
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-1/2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition mr-2"
                  >
                    Cancel Appointment
                  </button>

                  <button
                    onClick={() => {
                      // TODO: handle reschedule logic
                      alert("Reschedule clicked");
                    }}
                    className="w-1/2 bg-gray-100 border rounded-md px-4 py-2 rounded hover:bg-gray-200 transition ml-2"
                  >
                    Reschedule
                  </button>
                </div>
              )}


              <div className="flex justify-between">
      
                {(hasTypedFeedback || hasSelectedRating) && (
                  <button
                    onClick={handleSave}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                  >
                    Save
                  </button>
                )}
              </div>

          {data.status === 1 ? (
            <>
            
              <div className="mb-6 text-sm">
                <label className="block font-medium mb-1" htmlFor="feedback">
                  Feedback
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={handleFeedbackChange}
                  className="w-full border rounded-md px-3 py-2 bg-gray-50 resize-none"
                  placeholder="Write your feedback here..."
                  rows={4}
                />
              </div>

              <div className="mb-4 text-sm">
                <span className="block font-medium mb-1">Rating</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRatingClick(i + 1)}
                      onMouseEnter={() => setHoveredRating(i + 1)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className={`text-xl transition-colors ${
                        (hoveredRating || rating) > i
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

            </>
          ) : data.status === 2 && data.paymentStatus === 0 ? (
            <div className="w-full">
              <button className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-600 transition mb-4">
                Complete Payment
              </button>
            </div>
          ) : null}

          

          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              Back
            </button>
            {hasTypedFeedback && hasSelectedRating && (
              <button
                onClick={handleSave}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Save
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
    
);

};

export default TransactionModal;

import React, { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import QRCode from "react-qr-code";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { toast } from "react-toastify";

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

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: BookingData | null;
  previewData?: PreviewBookingData | null;
  onSaved?: () => void;
  onBookingComplete?: (bookingData: BookingData) => void;
}

const API_URL = import.meta.env.VITE_API_URL;
const RECEIPT_URL = import.meta.env.VITE_URL;

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  data,
  previewData,
  onBookingComplete,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hasTypedFeedback, setHasTypedFeedback] = useState(false);
  const [hasSelectedRating, setHasSelectedRating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine if we're in preview mode or showing actual booking data
  const isPreviewMode = !!previewData && !data;
  const displayData = data || previewData;

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
        toast.error("Save failed");
      }
    }
  };

  const handleCompletePayment = async () => {
    if (!previewData) return;

    setIsProcessing(true);
    try {
      const bookingPayload = {
        package_id: previewData.packageId,
        booking_date: previewData.bookingDate,
        time_slot: previewData.time,
        name: previewData.customerName,
        contact: previewData.contact,
        email: previewData.email,
        address: previewData.address,
        payment_mode: previewData.paymentMode,
        payment_type: previewData.paymentType,
      };

      console.log('Sending booking payload:', bookingPayload);

      const response = await fetchWithAuth(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();
      console.log('Backend response:', result);

      if (response.ok) {
        onBookingComplete?.(result.booking);
      } else {
        console.error('Booking failed with response:', result);
        toast.error(result.message || result.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsProcessing(false);
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

  if (!isOpen || !displayData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center p-4">
      <div className="bg-white text-gray-900 rounded-lg shadow-md overflow-y-auto max-h-[95vh] max-w-xl w-full p-6">
        <div>
          <h1 className="text-lg font-bold mb-1">{displayData.package}</h1>
          <div className="grid grid-cols-2 text-sm gap-y-1 mb-6">
            {!isPreviewMode && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Booking ID: {getBookingLabel((data as BookingData).id, displayData.package)}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Transaction Date: {formatDate((data as BookingData).transactionDate)}
                </p>
              </>
            )}
            {isPreviewMode && (
              <p className="text-sm text-gray-500 mb-4 col-span-2">
                Booking Preview - Click "Complete Payment" to confirm
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 text-sm gap-y-1 mb-6">
            <span className="text-gray-500">Name</span>
            <span>{displayData.customerName}</span>
            <span className="text-gray-500">Email</span>
            <span>{displayData.email}</span>
            <span className="text-gray-500">Address</span>
            <span>{displayData.address}</span>
            <span className="text-gray-500">Contact No.</span>
            <span>{displayData.contact}</span>
            {previewData && (
              <>
                <span className="text-gray-500">Payment Mode</span>
                <span>{previewData.paymentMode}</span>
              </>
            )}
          </div>

          <h2 className="font-semibold mb-2">Order Summary</h2>
          <div className="text-sm mb-2">
            {displayData.package}
            <span className="float-right font-semibold">
              ₱{displayData.subtotal.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <label className="text-gray-500 block text-xs mb-1">
                Booking Date
              </label>
              <input
                disabled
                value={
                  displayData.bookingDate &&
                  !isNaN(parse(displayData.bookingDate, "yyyy-MM-dd", new Date()).getTime())
                    ? format(parse(displayData.bookingDate, "yyyy-MM-dd", new Date()), "MMMM d, yyyy")
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
                value={displayData.time}
                className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
              />
            </div>
          </div>

          <div className="text-sm mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{displayData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount</span>
              <span>₱{displayData.paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Pending Balance</span>
              <span>
                ₱{typeof displayData.pendingBalance === "number" ? displayData.pendingBalance.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>

          {/* Show feedback/rating only for completed bookings */}
          {data && data.status === 1 ? (
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
                        (hoveredRating || rating) > i ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* Complete Payment button for preview mode */}
          {isPreviewMode && (
            <div className="mb-4">
              <button
                onClick={handleCompletePayment}
                disabled={isProcessing}
                className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-600 transition disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Complete Payment"}
              </button>
            </div>
          )}

          {/* Complete Payment button for confirmed bookings with pending balance */}
          {data && data.status === 2 && data.paymentStatus === 0 && (
            <div className="w-full mb-4">
              <button className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-600 transition">
                Complete Payment
              </button>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              Back
            </button>
            {data && hasTypedFeedback && hasSelectedRating && (
              <button
                onClick={handleSave}
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;

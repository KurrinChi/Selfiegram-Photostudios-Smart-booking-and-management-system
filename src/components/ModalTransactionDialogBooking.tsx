import React, { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { toast } from "react-toastify";
import type { Tag } from "../types"; 
import type { SelectedAddon } from '../typeSelect';
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
  tags?: Tag[]; 
  addons?: AddOn[];
  selectedAddons: SelectedAddon[];
}
interface AddOn {
  id: string;
  label: string;
 type: "single" | "multiple" | "dropdown";
  value?: number; // the numeric input
  required?: boolean;
}
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const RECEIPT_URL = import.meta.env.VITE_URL;
function getContrastColor(hex: string) {
  const c = hex.substring(1); // remove #
  const rgb = parseInt(c, 16); // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000" : "#fff";
}
const TransactionModalBooking: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  data,
  previewData,
  onBookingComplete,
  tags,
  addons = [], 
  selectedAddons
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

   useEffect(() => {
    if (isOpen) {
      setFeedback(data?.feedback || "");
      setRating(data?.rating || 0);
    }
  }, [isOpen, data]);

if (!isOpen || !displayData) return null;
// calculate add-ons total
const addonsTotal = selectedAddons.reduce((acc, addon) => {
  if (addon.value <= 0) return acc;
  if (addon.type === "spinner") {
    return acc + addon.price * addon.value;
  }
  return acc + addon.price;
}, 0);

const overallTotal = displayData.subtotal + addonsTotal;

let amountDue = 0;
let pendingBalance = 0;

if (isPreviewMode && previewData) {
  if (previewData.paymentType === "deposit") {
    amountDue = 200;
    pendingBalance = overallTotal - 200;
  } else if (previewData.paymentType === "full") {
    amountDue = overallTotal;
    pendingBalance = 0;
  }
} else if (data) {
  amountDue = data.paidAmount;
  pendingBalance = data.pendingBalance;
}



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

  const handlePayMongoCheckout = async () => {
    if (!previewData) return;

    // Check required addons
    if (addons.some((addon) => addon.required && (!addon.value || addon.value <= 0))) {
      toast.error("Please fill in required add-on quantities before proceeding.");
      return;
    }

    setIsProcessing(true);
    try {
      // First create the booking
      const bookingPayload = {
        package_id: previewData.packageId,
        booking_date: previewData.bookingDate,
        time_slot: previewData.time,
        name: previewData.customerName,
        contact: previewData.contact,
        email: previewData.email,
        address: previewData.address,
        payment_mode: 'PayMongo', // Set to PayMongo
        payment_type: previewData.paymentType,
        addons: selectedAddons.filter(addon => addon.value > 0).map((addon) => ({ 
          id: addon.id, 
          value: addon.value,
          type: addon.type,
          price: addon.price,
          option: addon.option || null
        })),
        studio_selection: tags && tags.length > 0 ? tags[0] : null,
      };

      console.log('Creating booking with PayMongo payment...');
      const bookingResponse = await fetchWithAuth(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      const result = await bookingResponse.json();
      console.log('Booking created:', result);
      console.log('Full booking response:', result);
      console.log('Response status:', bookingResponse.status);
      console.log('Response OK:', bookingResponse.ok);

      if (bookingResponse.ok) {
        // Now create PayMongo checkout session
        const paymentPayload = {
          booking_id: result.booking.id,
          payment_type: previewData.paymentType
        };

        console.log('Creating PayMongo checkout session...');
        const paymentResponse = await fetchWithAuth(`${API_URL}/api/payment/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(paymentPayload),
        });

        const paymentResult = await paymentResponse.json();
        console.log('PayMongo response:', paymentResult);

        if (paymentResponse.ok && paymentResult.success) {
          // Redirect to PayMongo checkout page
          console.log('Redirecting to:', paymentResult.checkout_url);
          window.location.href = paymentResult.checkout_url;
          
          // Call onBookingComplete with the booking data
          if (onBookingComplete) {
            onBookingComplete(result.booking);
          }
          
          onClose(); // Close the modal
        } else {
          console.error('PayMongo checkout session failed:', paymentResult);
          toast.error(paymentResult.message || "Failed to create checkout session");
        }
      } else {
        console.error('Booking creation failed:', result);
        toast.error(result.message || result.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Payment checkout failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExistingBookingPayment = async () => {
    if (!data) return;

    setIsProcessing(true);
    try {
      // Create PayMongo payment intent for existing booking
      const paymentPayload = {
        booking_id: data.id,
        payment_type: data.pendingBalance > 0 ? 'remaining' : 'full'
      };

      console.log('Creating PayMongo checkout session for existing booking...');
      const paymentResponse = await fetchWithAuth(`${API_URL}/api/payment/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      const paymentResult = await paymentResponse.json();
      console.log('PayMongo response:', paymentResult);

      if (paymentResponse.ok && paymentResult.success) {
        // Redirect to PayMongo checkout page
        console.log('Redirecting to:', paymentResult.checkout_url);
        window.location.href = paymentResult.checkout_url;
        onClose(); // Close the modal
      } else {
        console.error('PayMongo checkout session failed:', paymentResult);
        toast.error(paymentResult.message || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment intent creation failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!previewData) return;

    // Check required addons
    if (addons.some((addon) => addon.required && (!addon.value || addon.value <= 0))) {
      toast.error("Please fill in required add-on quantities before proceeding.");
      return;
    }

    // Always use PayMongo checkout when "Complete Payment" is clicked
    await handlePayMongoCheckout();
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
            
               {/* Studio & Add-ons Section */}
          {tags && tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  Selected Studio / Backdrop:
                </span>
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-xl"
                    style={
                      tag.type === "studioA" && tag.hex
                        ? { backgroundColor: tag.hex, color: getContrastColor(tag.hex) }
                        : tag.type === "studioB"
                        ? { backgroundColor: "#4f39f6", color: "#fff" }
                        : { backgroundColor: "#f3f4f6", color: "#111" }
                    }
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
             
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
          <hr className="mt-4 mb-4 border-gray-300" />
          
          <div className="text-sm mb-4">
            
          {addons && addons.length > 0 && (
            <div className="mb-2">
            {selectedAddons.map((addon) => {
              console.log(`Addon ${addon.label}: value=${addon.value}, type=${addon.type}`);
              if (addon.value <= 0) return null; // skip inactive addons

              return (
                
                <div key={addon.id} className="flex justify-between">
                 <span>
                  {addon.label}{" "}
                  {addon.type === "spinner" && (
                    <span className="text-gray-500">x{addon.value}</span> 
                  )}
                  {addon.type === "dropdown" && (
                    <span className="text-gray-500">({addon.option})</span> 
                  )}
                </span>

                  <span>
                    ₱
                    {addon.type === "spinner"
                      ? (addon.price * addon.value).toFixed(2)          // multiply price by quantity
                      : addon.price.toFixed(2)}                        
                  </span>
                </div>
              );
            })}
            </div>
          )}
          <hr className="mt-4 mb-4 border-gray-300" />
    {/* Package Price */}
  <div className="flex justify-between">
    <span>Package Price</span>
    <span>₱{displayData.subtotal.toFixed(2)}</span>
  </div>

  {/* Add-ons Total */}
  <div className="flex justify-between">
    <span>Add-ons Total</span>
    <span>
      ₱
      {selectedAddons.reduce((acc, addon) => {
        if (addon.value <= 0) return acc;
        if (addon.type === "spinner") {
          return acc + addon.price * addon.value;
        }
        return acc + addon.price;
      }, 0).toFixed(2)}
    </span>
  </div>

  {/* Overall Total */}
  <div className="flex justify-between font-semibold text-lg">
    <span>Total</span>
    <span>
      ₱
      {(
        displayData.subtotal +
        selectedAddons.reduce((acc, addon) => {
          if (addon.value <= 0) return acc;
          if (addon.type === "spinner") {
            return acc + addon.price * addon.value;
          }
          return acc + addon.price;
        }, 0)
      ).toFixed(2)}
    </span>
  </div>
            <div className="flex justify-between font-semibold">
                <span>{isPreviewMode ? "Amount Due" : amountDue === overallTotal ? "Paid Amount" : "Amount Due"}</span>
                <span>₱{amountDue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                <span>Pending Balance</span>
                <span>₱{pendingBalance.toFixed(2)}</span>
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
              <button 
                onClick={handleExistingBookingPayment}
                disabled={isProcessing}
                className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-600 transition disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Complete Payment"}
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

export default TransactionModalBooking;

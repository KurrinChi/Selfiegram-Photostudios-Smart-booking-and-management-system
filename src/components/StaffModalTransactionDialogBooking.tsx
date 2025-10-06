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
  packageDuration?: string; // raw duration passed from select page
  packageDurationMinutes?: number; // numeric duration passed from preview
  predictedEndLabel?: string; // precomputed end label passed from preview
  staffName?: string; // staff name for emergency purposes
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: BookingData | null;
  previewData?: PreviewBookingData | null;
  onSaved?: () => void;
  tags?: Tag[]; 
  addons?: AddOn[];
  selectedAddons: SelectedAddon[];
  staffName?: string;
}
interface AddOn {
  id: string;
  label: string;
 type: "single" | "multiple" | "dropdown";
  value?: number; // the numeric input
  required?: boolean;
}
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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
  tags,
  addons = [], 
  selectedAddons,
  staffName
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [hasTypedFeedback, setHasTypedFeedback] = useState(false);
  const [hasSelectedRating, setHasSelectedRating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment method selection state
  const [showPaymentMethodDialog, setShowPaymentMethodDialog] = useState(false);
  const [showCashDialog, setShowCashDialog] = useState(false);
  const [amountReceived, setAmountReceived] = useState<string>("");
  const [changeAmount, setChangeAmount] = useState<number>(0);
  
  // Determine if we're in preview mode or showing actual booking data
  const isPreviewMode = !!previewData && !data;
  const displayData = data || previewData;

  /* -------------------------------------------------------
     Duration / End Time Calculation (client-only)
     We fetch the package duration (using packageId for preview,
     or matching by name for existing booking) and compute
     end time = start time + duration minutes.
  -------------------------------------------------------- */
  const [packageDurationMinutes, setPackageDurationMinutes] = useState<number | null>(
    null
  );
  const [computedEndLabel, setComputedEndLabel] = useState<string>("");
  const API_PACKAGES_BASE = `${API_URL}/api/packages`;

  const parseDurationToMinutes = (raw?: string | null): number => {
    if (!raw || typeof raw !== "string") return 0;
    const s = raw.toLowerCase().trim();
    if (/^\d+$/.test(s)) return parseInt(s, 10); // pure minutes
    let total = 0;
    const hourMatch = s.match(/(\d+)\s*(hour|hr|hrs|h)/);
    if (hourMatch) total += parseInt(hourMatch[1], 10) * 60;
    const minMatch = s.match(/(\d+)\s*(minute|min|mins|m)/);
    if (minMatch) total += parseInt(minMatch[1], 10);
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
    return total; // may be 0 -> fallback applied later
  };

  const slotLabelToMinutes = (label: string): number => {
    if (!label) return NaN;
    const parts = label.trim().split(/\s+/); // [HH:MM, AM]
    if (parts.length < 2) return NaN;
    const [time, period] = parts;
    const [hhStr, mmStr] = time.split(":");
    const hh = parseInt(hhStr, 10);
    const mm = parseInt(mmStr, 10);
    if (isNaN(hh) || isNaN(mm)) return NaN;
    let hour24 = hh;
    if (period.toUpperCase() === "PM" && hh !== 12) hour24 = hh + 12;
    if (period.toUpperCase() === "AM" && hh === 12) hour24 = 0;
    return hour24 * 60 + mm;
  };

  const minutesToLabel = (total: number): string => {
    if (!Number.isFinite(total)) return "";
    const h24 = Math.floor(total / 60);
    const m = total % 60;
    const period = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  };

  // Fetch duration on open
  useEffect(() => {
    if (!isOpen || !displayData) return;
    // Preview: consume precomputed minutes or raw duration
    if (isPreviewMode) {
      if (previewData?.packageDurationMinutes) {
        setPackageDurationMinutes(previewData.packageDurationMinutes);
        return;
      }
      if (previewData?.packageDuration) {
        setPackageDurationMinutes(parseDurationToMinutes(previewData.packageDuration) || 60);
        return;
      }
    }
    // Existing booking fallback fetch once
    let cancelled = false;
    const fetchDuration = async () => {
      try {
        const res = await fetchWithAuth(API_PACKAGES_BASE);
        if (!res.ok) throw new Error('fail');
        const list = await res.json();
        if (Array.isArray(list)) {
          const found = list.find((pk: any) => (pk?.name || '').toString() === displayData.package);
          if (found && !cancelled) {
            setPackageDurationMinutes(parseDurationToMinutes(found.duration) || 60);
          }
        }
      } catch (_) {
        if (!cancelled) setPackageDurationMinutes((m)=> m ?? 60);
      }
    };
    fetchDuration();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, displayData?.package, isPreviewMode, previewData?.packageDurationMinutes, previewData?.packageDuration]);

  // Compute end label whenever start time OR duration available
  useEffect(() => {
    if (!displayData?.time) return;
    // If preview came with precomputed label, just use it.
    if (isPreviewMode && previewData?.predictedEndLabel) {
      setComputedEndLabel(previewData.predictedEndLabel);
      return;
    }
    if (!packageDurationMinutes) return;
    const startMinutes = slotLabelToMinutes(displayData.time);
    if (!Number.isFinite(startMinutes)) return;
    setComputedEndLabel(minutesToLabel(startMinutes + packageDurationMinutes));
  }, [displayData?.time, packageDurationMinutes, isPreviewMode, previewData?.predictedEndLabel]);

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
      // PROPER FLOW: Create payment checkout FIRST (booking will be created AFTER payment via webhook)
      const paymentPayload = {
        package_id: previewData.packageId,
        booking_date: previewData.bookingDate,
        time_slot: previewData.time,
        end_time_slot: computedEndLabel || previewData.predictedEndLabel || previewData.time, // send end time to backend
        name: previewData.customerName,
        contact: previewData.contact,
        email: previewData.email,
        address: previewData.address,
        payment_type: previewData.paymentType,
        addons: selectedAddons.filter(addon => addon.value > 0).map((addon) => ({ 
          id: addon.id, 
          value: addon.value,
          type: addon.type,
          price: addon.price,
          option: addon.option || null
        })),
        studio_selection: tags && tags.length > 0 ? tags[0] : null,
        return_url: '/client/packages' // Redirect back to packages after payment
      };

      console.log('Creating PayMongo checkout for NEW booking (payment first)...');
      const paymentResponse = await fetchWithAuth(`${API_URL}/api/payment/checkout-new-booking`, {
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
        console.log('Redirecting to PayMongo. Booking will be created AFTER payment confirmation.');
        console.log('Redirect URL:', paymentResult.checkout_url);
        window.location.href = paymentResult.checkout_url;
        
        onClose(); // Close the modal
      } else {
        console.error('PayMongo checkout session failed:', paymentResult);
        toast.error(paymentResult.message || paymentResult.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment checkout failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // NOTE: handleExistingBookingPayment is NOT needed in ModalTransactionDialogBooking
  // This modal is only for NEW bookings (preview mode)
  // Existing booking payments are handled in ModalTransactionDialog.tsx

  const handleCompletePayment = () => {
    if (!previewData) return;

    // Check required addons
    if (addons.some((addon) => addon.required && (!addon.value || addon.value <= 0))) {
      toast.error("Please fill in required add-on quantities before proceeding.");
      return;
    }

    // Show payment method selection dialog for staff
    setShowPaymentMethodDialog(true);
  };

  const handlePaymentMethodSelect = (method: 'cash' | 'paymongo') => {
    setShowPaymentMethodDialog(false);
    if (method === 'cash') {
      setShowCashDialog(true);
    } else {
      handlePayMongoCheckout();
    }
  };

  const handleCashPayment = async () => {
    const received = parseFloat(amountReceived);
    if (isNaN(received) || received < amountDue) {
      toast.error(`Amount received must be at least ₱${amountDue.toFixed(2)}`);
      return;
    }

    const change = received - amountDue;
    setChangeAmount(change);

    // Create booking with cash payment
    setIsProcessing(true);
    try {
      const bookingPayload = {
        package_id: previewData?.packageId,
        booking_date: previewData?.bookingDate,
        time_slot: previewData?.time,
        end_time_slot: computedEndLabel || previewData?.predictedEndLabel || previewData?.time,
        name: previewData?.customerName,
        contact: previewData?.contact,
        email: previewData?.email,
        address: previewData?.address,
        payment_mode: 'Cash',
        payment_type: previewData?.paymentType,
        addons: selectedAddons.filter(addon => addon.value > 0).map((addon) => ({ 
          id: addon.id, 
          value: addon.value,
          type: addon.type,
          price: addon.price,
          option: addon.option || null
        })),
        studio_selection: tags && tags.length > 0 ? tags[0] : null,
      };

      const response = await fetchWithAuth(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingPayload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Booking created successfully!");
        
        // Show receipt and print after a short delay
        setTimeout(() => {
          const receiptElement = document.getElementById('receipt-print');
          if (receiptElement) {
            receiptElement.style.display = 'block';
          }
          
          // Trigger print
          setTimeout(() => {
            window.print();
            
            // Hide receipt after print
            setTimeout(() => {
              if (receiptElement) {
                receiptElement.style.display = 'none';
              }
            }, 100);
          }, 100);
        }, 300);

        onSaved?.();
        setTimeout(() => {
          setShowCashDialog(false);
          setAmountReceived("");
          setChangeAmount(0);
          onClose();
        }, 1500);
      } else {
        toast.error(result.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Cash payment failed:", error);
      toast.error("Failed to process cash payment. Please try again.");
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

 

  if (!isOpen || !displayData) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center p-4">
      <div className="bg-white text-gray-900 rounded-lg shadow-md overflow-y-auto max-h-[95vh] max-w-xl w-full p-6 print:shadow-none">
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
              <label className="text-gray-500 block text-xs mb-1">Booking Time</label>
              <input
                disabled
                value={computedEndLabel ? `${displayData.time} - ${computedEndLabel}` : displayData.time}
                className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
                title={packageDurationMinutes ? `Duration: ${packageDurationMinutes} mins` : 'Duration loading...'}
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

          {/* NOTE: This modal is ONLY for NEW bookings (preview mode).
              Existing booking payments are handled in ModalTransactionDialog.tsx */}

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

    {/* Payment Method Selection Dialog */}
    {showPaymentMethodDialog && (
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
          <p className="text-sm text-gray-600 mb-6">Choose how the customer will pay:</p>
          
          <div className="space-y-3">
            <button
              onClick={() => handlePaymentMethodSelect('cash')}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cash Payment
            </button>
            
            <button
              onClick={() => handlePaymentMethodSelect('paymongo')}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              PayMongo (GCash/Card)
            </button>
          </div>

          <button
            onClick={() => setShowPaymentMethodDialog(false)}
            className="mt-4 w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    )}

    {/* Cash Payment Dialog */}
    {showCashDialog && (
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">Cash Payment</h2>
          
          <div className="mb-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Amount Due:</p>
              <p className="text-2xl font-bold text-gray-900">₱{amountDue.toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Received:
              </label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => {
                  setAmountReceived(e.target.value);
                  const received = parseFloat(e.target.value) || 0;
                  setChangeAmount(Math.max(0, received - amountDue));
                }}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
                step="0.01"
                min={amountDue}
              />
            </div>

            {amountReceived && parseFloat(amountReceived) >= amountDue && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600">Change:</p>
                <p className="text-2xl font-bold text-green-700">₱{changeAmount.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCashDialog(false);
                setAmountReceived("");
                setChangeAmount(0);
              }}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCashPayment}
              disabled={!amountReceived || parseFloat(amountReceived) < amountDue || isProcessing}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Processing..." : "Confirm & Print Receipt"}
            </button>
          </div>

          {/* Receipt Preview (Hidden, for printing) */}
          <div className="receipt-print-only" style={{ display: 'none' }}>
            <div style={{ maxWidth: '300px', margin: '0 auto', padding: '20px', fontFamily: 'monospace' }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">SELFIEGRAM</h1>
                <p className="text-sm text-gray-600">Official Receipt</p>
              </div>

              <div className="border-t border-b border-gray-300 py-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-medium">Customer: {displayData.customerName}</p>
                <p className="text-sm text-gray-600">{displayData.email}</p>
                <p className="text-sm text-gray-600">{displayData.contact}</p>
              </div>

              <div className="border-t border-gray-300 pt-4 mb-4">
                <h3 className="font-bold mb-2">Order Details:</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>{displayData.package}</span>
                    <span>₱{displayData.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedAddons.filter(a => a.value > 0).map((addon) => (
                    <div key={addon.id} className="flex justify-between text-gray-600">
                      <span>{addon.label} {addon.type === "spinner" && `x${addon.value}`}</span>
                      <span>₱{(addon.type === "spinner" ? addon.price * addon.value : addon.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-300 pt-4 space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>TOTAL:</span>
                  <span>₱{overallTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Due:</span>
                  <span>₱{amountDue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span>₱{parseFloat(amountReceived || "0").toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-green-600">
                  <span>CHANGE:</span>
                  <span>₱{changeAmount.toFixed(2)}</span>
                </div>
                {pendingBalance > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Pending Balance:</span>
                    <span>₱{pendingBalance.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-300 mt-6 pt-4 text-center text-xs text-gray-600">
                <p>Booking Date: {displayData.bookingDate}</p>
                <p>Time: {displayData.time}</p>
                <p className="mt-4">Thank you for choosing Selfiegram!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Separate Receipt for Printing - Outside all dialogs */}
    {showCashDialog && amountReceived && parseFloat(amountReceived) >= amountDue && (
      <div id="receipt-print" style={{ display: 'none' }}>
        <div style={{ width: '80mm', padding: '10mm', fontFamily: 'monospace', fontSize: '12px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>SELFIEGRAM</h1>
            <p style={{ fontSize: '12px', margin: '5px 0' }}>Official Receipt</p>
            <p style={{ fontSize: '10px', margin: '0' }}>----------------------------</p>
          </div>

          <div style={{ marginBottom: '15px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>Time:</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <p style={{ fontSize: '10px', margin: '10px 0' }}>----------------------------</p>
          </div>

          <div style={{ marginBottom: '15px', fontSize: '11px' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Customer:</p>
            <p style={{ margin: '2px 0' }}>{displayData?.customerName}</p>
            <p style={{ margin: '2px 0', fontSize: '10px' }}>{displayData?.email}</p>
            <p style={{ margin: '2px 0', fontSize: '10px' }}>{displayData?.contact}</p>
          </div>

          <p style={{ fontSize: '10px', margin: '10px 0' }}>----------------------------</p>

          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '8px' }}>ORDER DETAILS:</p>
            <div style={{ fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>{displayData?.package}</span>
                <span>₱{displayData?.subtotal.toFixed(2)}</span>
              </div>
              {selectedAddons.filter(a => a.value > 0).map((addon) => (
                <div key={addon.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '10px' }}>
                  <span>
                    {addon.label} {addon.type === "spinner" && `x${addon.value}`}
                    {addon.type === "dropdown" && addon.option && `(${addon.option})`}
                  </span>
                  <span>₱{(addon.type === "spinner" ? addon.price * addon.value : addon.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '10px', margin: '10px 0' }}>----------------------------</p>

          <div style={{ fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
              <span>TOTAL:</span>
              <span>₱{overallTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Amount Due:</span>
              <span>₱{amountDue.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>Cash Received:</span>
              <span>₱{parseFloat(amountReceived || "0").toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold', color: '#16a34a' }}>
              <span>CHANGE:</span>
              <span>₱{changeAmount.toFixed(2)}</span>
            </div>
            {pendingBalance > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#dc2626' }}>
                <span>Pending Balance:</span>
                <span>₱{pendingBalance.toFixed(2)}</span>
              </div>
            )}
          </div>

          <p style={{ fontSize: '10px', margin: '15px 0 10px 0' }}>----------------------------</p>

          <div style={{ textAlign: 'center', fontSize: '10px' }}>
            <p style={{ margin: '3px 0' }}>Booking Date: {displayData?.bookingDate}</p>
            <p style={{ margin: '3px 0' }}>Time: {displayData?.time}</p>
            {tags && tags.length > 0 && (
              <p style={{ margin: '3px 0' }}>Studio: {tags[0].label}</p>
            )}
            {staffName && (
              <p style={{ margin: '3px 0' }}>Staff: {staffName}</p>
            )}
            <p style={{ margin: '15px 0 5px 0', fontWeight: 'bold' }}>Thank you for choosing</p>
            <p style={{ margin: '0', fontWeight: 'bold' }}>Selfiegram!</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default TransactionModalBooking;

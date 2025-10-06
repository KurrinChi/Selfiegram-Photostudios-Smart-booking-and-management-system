import React, { useState } from "react";
import { format, parse } from "date-fns";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

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
    price: number;
    balance: number;
    feedback: string;
    rating: number; // 0–5
    status: number;
    paymentStatus: number;
    selectedAddOns?: string;
    selectedConcepts?: string;
  } | null;
  onSaved?: () => void;
}

const getBookingLabel = (id: string, packageName: string) => {
    const acronym = packageName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
    return `${acronym}#${id}`;
  };

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  data,
  onSaved,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCompletePayment = async () => {
    if (!data) return;

    setIsProcessing(true);
    try {
      // Create PayMongo checkout session for remaining balance
      const paymentPayload = {
        booking_id: data.id,
        payment_type: 'remaining',
        return_url: '/admin/sales'
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
        // Open PayMongo checkout in new tab for admin
        window.open(paymentResult.checkout_url, '_blank');
        toast.success("Payment link opened in new tab. Complete the payment to update booking.");
        onClose();
        if (onSaved) onSaved();
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

  if (!isOpen || !data) return null;

  return (
    <div className="printable fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex justify-center items-center p-4">
      <div className="bg-white text-gray-900 max-w-xl w-full rounded-lg shadow-md overflow-y-auto max-h-[95vh] p-6">
        <h1 className="text-lg font-bold mb-1">{data.package}</h1>
        <div className="grid grid-cols-2 text-sm gap-y-1 mb-6">
          <p className="text-sm text-gray-500 mb-4">Booking ID: {getBookingLabel(data.id, data.package)}</p>
          <p className="text-sm text-gray-500 mb-4">Transaction Date: {data.transactionDate}</p>
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
          {data.package}{" "}
          <span className="float-right font-semibold">
            ₱{data.price.toFixed(2)}
          </span>
        </div>

        {/* Add-ons and Concepts */}
        {(data.selectedAddOns || data.selectedConcepts) && (
          <div className="mb-4 text-sm">
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

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <label className="text-gray-500 block text-xs mb-1">
              Booking Date
            </label>
            <input
              disabled
              value={format(parse(data.bookingDate, "yyyy-MM-dd", new Date()), "MMMM d, yyyy")}
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
            <span>Subtotal</span>
            <span>₱{data.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid Amount</span>
            <span>₱{(data.subtotal - data.balance).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Pending Balance</span>
            <span>₱{(data.balance).toFixed(2)}</span>
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

        {/* Complete Payment Button - shown when there's pending balance */}
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
      </div>
    </div>
  );
};

export default TransactionModal;

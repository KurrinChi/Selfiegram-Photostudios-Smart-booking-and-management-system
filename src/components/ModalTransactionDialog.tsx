import React, { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import QRCode from "react-qr-code";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import ModalRequestedDialog from "./ModalRequestedDialog";
import ModalOnRequestDialog from "./ModalOnRequestDialog";
import ModalRescheduleDialog from "./ModalRescheduleDialog";
import { id } from "date-fns/locale";
import { toast } from "react-toastify";
import ModalRequestedDialogReschedule from "./ModalRequestedDialogReschedule";
import ModalRescheduleRequestedDialog from "./ModalRescheduleRequestedDialog";
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
    selectedAddOns?: string[]; // <-- added
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
  const [isProcessing, setIsProcessing] = useState(false);

  const [cancelRequest, setCancelRequest] = useState<{
    status: "pending" | "approved" | "declined";
    requestDate: string;
  } | null>(null);

  const [rescheduleRequest, setRescheduleRequest] = useState<{
    status: "pending" | "approved" | "declined";
    requestDate: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    reason: string;
  } | null>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{
    id: string;
    reason: string;
    bookingDate: string;
    bookingTime: string;
    transactionDate: string;
    bookingId: string;
    totalAmount: number;
    packageName: string;
  } | null>(null);

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

  useEffect(() => {
    if (data?.id && data.status === 4) {
      // only fetch if status is "rescheduled"
      fetchWithAuth(`${API_URL}/api/reschedule-request/${data.id}`)
        .then((res) => {
          if (!res.ok) return null; // handle 404 gracefully
          return res.json();
        })
        .then((resData) => {
          console.log("Reschedule Request Data:", resData?.data);
          if (resData?.data) {
            setRescheduleRequest(resData.data);
          }
        })
        .catch((err) =>
          console.error("Error fetching reschedule request:", err)
        );
    }
  }, [data?.id]);

  useEffect(() => {
    if (data?.id && data.status === 3) {
      // only fetch if status is "cancel requested"
      fetchWithAuth(`${API_URL}/api/cancel-request/${data.id}`)
        .then((res) => {
          if (!res.ok) return null; // handle 404 gracefully
          return res.json();
        })
        .then((resData) => {
          if (resData?.data) {
            setCancelRequest(resData.data);
          }
        })
        .catch((err) => console.error("Error fetching cancel request:", err));
    }
  }, [data?.id]);
  const handleSave = async () => {
    if (!feedback && (rating === 0 || rating === null)) {
      onClose();
      return;
    }
    try {
      const response = await fetchWithAuth(
        `${API_URL}/api/booking/${data?.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ feedback, rating }),
        }
      );

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

  useEffect(() => {
    if (data?.id && data.status === 4) {
      // reschedule requested
      fetchWithAuth(`${API_URL}/api/reschedule-request/${data.id}`)
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((resData) => {
          if (resData?.data) {
            setRescheduleData({
              id: data.id,
              reason: resData.data.reason,
              bookingDate: resData.data.requestedDate,
              bookingTime: resData.data.requestedTime,
              transactionDate: resData.data.requestDate,
              bookingId: data.id,
              totalAmount: data.subtotal,
              packageName: data.package,
            });
          }
        })
        .catch((err) =>
          console.error("Error fetching reschedule request:", err)
        );
    }
  }, [data?.id, data?.status]);

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
    if (!data) return;

    setCancelData({
      id: data.id,
      reason,
      bookingDate: data.bookingDate,
      bookingTime: data.time,
      transactionDate: data.transactionDate,
      bookingId: data.id,
      totalAmount: data.total, // or total refund logic
      packageName: data.package,
    });

    setIsCancelModalOpen(false); // close modal
    setIsRequestedModalOpen(true);
  };

  const handleRescheduleSubmit = async (
    reason: string,
    requestedDate: string,
    requestedStartTime: string
  ) => {
    if (!data) return;

    try {
      const user_id = localStorage.getItem("userID") || "";

      // Send the reschedule request to the backend
      const res = await fetch(
        `http://192.168.1.214:8000/api/booking-request/reschedule`,
        {
          method: "POST",
          body: JSON.stringify({
            bookingID: data.id,
            userID: user_id,
            reason,
            requestedDate,
            requestedStartTime,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit reschedule request");

      const responseData = await res.json();

      // Update the state with the response data
      setRescheduleData({
        id: data.id,
        reason,
        bookingDate: requestedDate,
        bookingTime: requestedStartTime,
        transactionDate: new Date().toISOString().split("T")[0],
        bookingId: data.id,
        totalAmount: data.subtotal,
        packageName: data.package,
      });

      toast.success(
        responseData.message || "Reschedule request submitted successfully!"
      );
      setIsRescheduleModalOpen(false); // Close the reschedule modal
      setIsRequestedModalOpen(true); // Open the confirmation modal
    } catch (err) {
      console.error("Error submitting reschedule request:", err);
      toast.error("Error submitting reschedule request. Please try again.");
    }
  };

  const handleCompletePayment = async () => {
    if (!data) return;

    setIsProcessing(true);
    try {
      // Create PayMongo checkout session for remaining balance
      const paymentPayload = {
        booking_id: data.id,
        payment_type: 'remaining', // paying the remaining balance
        return_url: '/client/appointments' // Redirect back to appointments after payment
      };

      console.log('Creating PayMongo checkout session for remaining balance...');
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
      console.error("Payment checkout failed:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number); // Split time into hours and minutes
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use 12-hour format
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
            const res = await fetchWithAuth(
              `${API_URL}/api/booking-request/cancel`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  bookingID: data?.id ?? "",
                  userID: user_id,
                  reason: reason,
                }),
              }
            );

            if (!res.ok) throw new Error("Failed to submit request");

            // ✅ Save the cancel data for the confirmation dialog
            if (!data) return;
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
      <ModalRequestedDialogReschedule
        isOpen={isRequestedModalOpen}
        onClose={() => {
          setIsRequestedModalOpen(false); // Close the confirmation modal
          onClose(); // Close the transaction modal
        }}
        data={
          rescheduleData
            ? {
                id: rescheduleData.id,
                reason: rescheduleData.reason,
                bookingDate: rescheduleData.bookingDate,
                bookingTime: rescheduleData.bookingTime,
                transactionDate: rescheduleData.transactionDate,
                bookingId: rescheduleData.bookingId,
                totalAmount: rescheduleData.totalAmount,
                packageName: rescheduleData.packageName,
              }
            : null
        }
      />
      <ModalRequestedDialog
        isOpen={isRequestedModalOpen}
        onClose={() => {
          setIsRequestedModalOpen(false); // close confirmation
          onClose(); // also close transaction modal
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
      <ModalRescheduleRequestedDialog
        isOpen={isRequestedModalOpen}
        onClose={() => {
          setIsRequestedModalOpen(false); // Close the confirmation modal
          onClose(); // Close the transaction modal
        }}
        data={
          rescheduleData
            ? {
                id: rescheduleData.id,
                reason: rescheduleData.reason,
                bookingDate: rescheduleData.bookingDate,
                bookingTime: rescheduleData.bookingTime,
                transactionDate: rescheduleData.transactionDate,
                bookingId: rescheduleData.bookingId,
                totalAmount: rescheduleData.totalAmount,
                packageName: rescheduleData.packageName,
              }
            : null
        }
      />

      <ModalRescheduleDialog
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        bookingID={data?.id ? Number(data.id) : 0}
        userID={
          localStorage.getItem("userID")
            ? Number(localStorage.getItem("userID"))
            : 0
        }
        onSubmit={async (reason, requestedDate, requestedStartTime) => {
          try {
            const user_id = localStorage.getItem("userID") || "";
            console.log("API_URL:", API_URL);
            console.log(
              "Fetch URL:",
              `${API_URL}/api/booking-request/reschedule`
            );
            const res = await fetchWithAuth(
              `${API_URL}/api/booking-request/reschedule`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  bookingID: data?.id ?? "",
                  userID: user_id,
                  requestedDate,
                  requestedStartTime,
                  reason,
                }),
              }
            );

            if (!res.ok) throw new Error("Failed to submit reschedule request");

            const responseData = await res.json();

            // ✅ Save reschedule data for confirmation dialog
            if (!data) return;
            setRescheduleData({
              id: data.id,
              reason,
              bookingDate: requestedDate,
              bookingTime: requestedStartTime,
              transactionDate: new Date().toISOString().split("T")[0],
              bookingId: data.id,
              totalAmount: data.subtotal,
              packageName: data.package,
            });

            toast.success(
              responseData.message || "Reschedule request submitted!"
            );
            setIsRescheduleModalOpen(false);
            setIsRequestedModalOpen(true);
          } catch (err) {
            toast.error(
              "Error submitting reschedule request. Please try again."
            );
          }
        }}
      />
      <div
        className={`bg-white text-gray-900 rounded-lg shadow-md overflow-y-auto max-h-[95vh] ${
          data.paymentStatus === 1 && data.status === 2
            ? "max-w-5xl w-full flex"
            : "max-w-xl w-full p-6"
        }`}
      >
        {/* Header Container */}
        {Number(data.status) === 3 && cancelRequest && (
          <div className="p-6 rounded-2xl bg-gray-100 mb-4">
            <h2 className="text-gray-600 text-lg font-semibold mb-4">
              {cancelRequest.status === "pending"
                ? "Cancellation Pending Review"
                : cancelRequest.status === "approved"
                ? "Cancellation Request Approved"
                : "Cancellation Request Denied"}
            </h2>

            {/* Stepper */}
            <div className="flex items-center justify-between relative mb-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    cancelRequest.status === "pending"
                      ? "bg-black text-white"
                      : cancelRequest.status === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  1
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700">
                  Request Sent
                </span>
              </div>

              {/* Connector 1 */}
              <div
                className={`flex-1 h-[2px] mx-2 ${
                  cancelRequest.status === "approved"
                    ? "bg-green-500"
                    : cancelRequest.status === "declined"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    cancelRequest.status === "approved"
                      ? "bg-green-500 text-white"
                      : cancelRequest.status === "declined"
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {cancelRequest.status === "approved" ||
                  cancelRequest.status === "declined"
                    ? "✔"
                    : "2"}
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700">
                  Staff Response
                </span>
              </div>

              {/* Connector 2 */}
              <div
                className={`flex-1 h-[2px] mx-2 ${
                  cancelRequest.status === "approved"
                    ? "bg-green-500"
                    : cancelRequest.status === "declined"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    cancelRequest.status === "approved"
                      ? "bg-green-500 text-white"
                      : cancelRequest.status === "declined"
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {cancelRequest.status === "approved"
                    ? "✔"
                    : cancelRequest.status === "declined"
                    ? "✖"
                    : "3"}
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700">
                  Approved
                </span>
              </div>
            </div>

            <hr className="border-gray-400 my-4" />

            {/* Message Section */}
            {cancelRequest.status === "pending" && (
              <>
                <h2 className="text-gray-500 text-lg font-semibold mb-2">
                  Wait for our staff to review your request
                </h2>
                <p className="text-xs">
                  Please wait until{" "}
                  <span className="font-semibold">
                    {new Date(
                      new Date(cancelRequest.requestDate).getTime() +
                        2 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>{" "}
                  for our staff to review and update the status of your
                  cancellation request. You will be notified once the process is
                  completed. Kindly note that the PHP 200 down payment you made
                  is strictly non-refundable. If the booking was paid in full,
                  any eligible refund will exclude the PHP 200 down payment.
                </p>
              </>
            )}

            {cancelRequest.status === "approved" && (
              <>
                <h2 className="text-gray-500 text-lg font-semibold mb-2">
                  Your Request to Cancel Has Been Accepted
                </h2>
                <p className="text-xs">
                  If you paid the full amount, any eligible refund will be
                  returned to you shortly. Please note that the PHP 200 down
                  payment is strictly non-refundable and will be excluded from
                  any refund.
                </p>
              </>
            )}

            {cancelRequest.status === "declined" && (
              <>
                <h2 className="text-gray-500 text-lg font-semibold mb-2">
                  Sorry, we failed to cancel your appointment
                </h2>
                <p className="text-xs">
                  Your appointment cancellation request has been declined.
                  Please note that your booking remains confirmed. For further
                  assistance, kindly contact our staff{" "}
                  <a
                    href="https://www.facebook.com/selfiegrammalolos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    here
                  </a>
                  .
                </p>
              </>
            )}
          </div>
        )}

        {Number(data.status) === 4 && rescheduleRequest && (
          <div className="p-6 rounded-2xl bg-gray-100 mb-4">
            <h2 className="text-gray-600 text-lg font-semibold mb-4">
              {rescheduleRequest.status === "pending"
                ? "Reschedule Pending Review"
                : rescheduleRequest.status === "approved"
                ? "Reschedule Request Approved"
                : "Reschedule Request Denied"}
            </h2>

            {/* Stepper */}
            <div className="flex items-center justify-between relative mb-4">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    rescheduleRequest.status === "pending"
                      ? "bg-black text-white"
                      : rescheduleRequest.status === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  1
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700">
                  Request Sent
                </span>
              </div>

              {/* Connector 1 */}
              <div
                className={`flex-1 h-[2px] mx-2 ${
                  rescheduleRequest.status === "approved"
                    ? "bg-green-500"
                    : rescheduleRequest.status === "declined"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    rescheduleRequest.status === "approved"
                      ? "bg-green-500 text-white"
                      : rescheduleRequest.status === "declined"
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {rescheduleRequest.status === "approved" ||
                  rescheduleRequest.status === "declined"
                    ? "✔"
                    : "2"}
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700">
                  Staff Response
                </span>
              </div>

              {/* Connector 2 */}
              <div
                className={`flex-1 h-[2px] mx-2 ${
                  rescheduleRequest.status === "approved"
                    ? "bg-green-500"
                    : rescheduleRequest.status === "declined"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              ></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    rescheduleRequest.status === "approved"
                      ? "bg-green-500 text-white"
                      : rescheduleRequest.status === "declined"
                      ? "bg-red-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {rescheduleRequest.status === "approved"
                    ? "✔"
                    : rescheduleRequest.status === "declined"
                    ? "✖"
                    : "3"}
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700">
                  Approved
                </span>
              </div>
            </div>

            <hr className="border-gray-400 my-4" />

            {/* Message Section */}
            {rescheduleRequest.status === "pending" && (
              <>
                <h2 className="text-gray-500 text-lg font-semibold mb-2">
                  Wait for our staff to review your request
                </h2>
                <p className="text-xs">
                  Please wait until{" "}
                  <span className="font-semibold">
                    {new Date(
                      new Date(rescheduleRequest.requestDate).getTime() +
                        2 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>{" "}
                  for our staff to review and update the status of your
                  reschedule request. You will be notified once the process is
                  completed.
                </p>
              </>
            )}

            {rescheduleRequest.status === "approved" && (
              <>
                <h2 className="text-gray-500 text-lg font-semibold mb-2">
                  Your Reschedule Request Has Been Approved
                </h2>
                <p className="text-xs">
                  Your booking has been successfully rescheduled to{" "}
                  <span className="font-semibold">
                    {formatDate(rescheduleRequest.requestedDate)} at{" "}
                    {formatTime(rescheduleRequest.requestedStartTime)}
                  </span>
                  .
                </p>
              </>
            )}

            {rescheduleRequest.status === "declined" && (
              <>
                <h2 className="text-gray-500 text-lg font-semibold mb-2">
                  Sorry, we could not reschedule your appointment
                </h2>
                <p className="text-xs">
                  Your reschedule request has been declined. Please contact our
                  staff{" "}
                  <a
                    href="https://www.facebook.com/selfiegrammalolos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    here
                  </a>{" "}
                  for further assistance.
                </p>
              </>
            )}
          </div>
        )}

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
                        parse(
                          data.bookingDate,
                          "yyyy-MM-dd",
                          new Date()
                        ).getTime()
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
                  <span>
                    ₱
                    {typeof data.total === "number"
                      ? data.total.toFixed(2)
                      : "0.00"}
                  </span>
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
                    <label
                      className="block font-medium mb-1"
                      htmlFor="feedback"
                    >
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
              ) : Number(data.status) === 2 &&
                Number(data.paymentStatus) === 0 ? (
                <div className="w-full">
                  <button 
                    onClick={handleCompletePayment}
                    disabled={isProcessing}
                    className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-600 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Processing...' : 'Complete Payment'}
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
                  onClick={() => setIsRescheduleModalOpen(true)}
                  className="w-1/2 bg-gray-100 border rounded-md px-4 py-2  hover:bg-gray-200 transition ml-2"
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
            {data.paymentStatus === 1 && data.status === 2 ? (
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
            ) : null}
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
              {/* Previous Booking Date */}
              {rescheduleRequest?.status !== "approved" && (
              <div>
                <label className="text-gray-500 block text-xs mb-1">Booking Date</label>
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
            )}

              {/* Previous Booking Time */}
              {rescheduleRequest?.status !== "approved" && (
                  <div>
                    <label className="text-gray-500 block text-xs mb-1">Booking Time</label>
                    <input
                      disabled
                      value={data.time}
                      className="w-full border rounded-md px-3 py-1.5 bg-gray-100"
                    />
                  </div>
                )}

              {/* New Booking Date (Conditional) */}
              {rescheduleRequest?.requestedDate && (
                <div>
                  <label
                    className={`block text-xs mb-1 ${
                      rescheduleRequest.status === "pending"
                        ? "text-gray-500"
                        : rescheduleRequest.status === "declined"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    New Booking Date
                  </label>
                  <input
                    disabled
                    value={
                      !isNaN(
                        parse(
                          rescheduleRequest.requestedDate,
                          "yyyy-MM-dd",
                          new Date()
                        ).getTime()
                      )
                        ? format(
                            parse(
                              rescheduleRequest.requestedDate,
                              "yyyy-MM-dd",
                              new Date()
                            ),
                            "MMMM d, yyyy"
                          )
                        : "Invalid date"
                    }
                    className={`w-full border rounded-md px-3 py-1.5 ${
                      rescheduleRequest.status === "pending"
                        ? "bg-gray-100 text-gray-700"
                        : rescheduleRequest.status === "declined"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  />
                </div>
              )}

              {/* New Booking Time (Conditional) */}
              {rescheduleRequest?.requestedStartTime &&
                rescheduleRequest?.requestedEndTime && (
                  <div>
                    <label
                      className={`block text-xs mb-1 ${
                        rescheduleRequest.status === "pending"
                          ? "text-gray-500"
                          : rescheduleRequest.status === "declined"
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      New Booking Time
                    </label>
                    <input
                      disabled
                      value={`${formatTime(
                        rescheduleRequest.requestedStartTime
                      )} - ${formatTime(rescheduleRequest.requestedEndTime)}`}
                      className={`w-full border rounded-md px-3 py-1.5 ${
                        rescheduleRequest.status === "pending"
                          ? "bg-gray-100 text-gray-700"
                          : rescheduleRequest.status === "declined"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    />
                  </div>
                )}
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
            {Number(data.status) !== 1 &&
              Number(data.status) !== 3 &&
              Number(data.status) !== 4 && (
                <div className="flex justify-between mb-4">
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-1/2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition mr-2"
                  >
                    Cancel Appointment
                  </button>

                  <button
                    onClick={() => setIsRescheduleModalOpen(true)}
                    className="w-1/2 bg-gray-100 border rounded-md px-4 py-2  hover:bg-gray-200 transition ml-2"
                  >
                    Reschedule
                  </button>
                </div>
              )}

            <div className="flex justify-between"></div>

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
                <button 
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-full bg-gray-800 text-white py-3 rounded hover:bg-gray-600 transition mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Complete Payment'}
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
